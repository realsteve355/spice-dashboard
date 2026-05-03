"""
MaryFontaine simulator — monthly tick logic (Phase 2).

Loads founding state from a generated DB into memory, runs N months of
ticks recording transactions and snapshots in memory, flushes to DB at end.

Phase 2 scope (per spec §4):
- Fisc rate adjustment (basket-anchored, with cover-ratio compression)
- UBI mint
- External income (remote workers, retiree pensions)
- Company export revenue
- MCC utility billing (citizens + companies)
- Citizen consumption with supplier picker (preference × spare-capacity)
- Citizen housing (mortgage USD outflow, external/internal rent)
- Citizen discretionary spending
- Company import payments (S → USDC via Fisc)
- Company dividend distribution (with Honda Inc external cashout)
- Citizen behavioural decisions (cashout)
- Archetype transitions
- Snapshots (citizens, companies, fisc state, unmet demand)

Not in Phase 2:
- Births, deaths, immigration, departures (Phase 3)
- Company founding / failure (Phase 3)
- Equity transfers (Phase 3)

Usage is via run.py.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional, Any
import math
import random
import sqlite3

from scenarios import (
    BASKET_WEIGHTS_USD, BASKET_TARGET_S,
    EnvironmentTrajectory, build_trajectory, honda_shock_multiplier
)
from config import SimConfig


WORKER_ARCHETYPES = {
    "honda_assembly", "honda_admin", "other_manufacturing", "healthcare_worker",
    "education_worker", "retail_services", "small_business_owner", "sole_trader",
}


# ── In-memory state ─────────────────────────────────────────────────────────

@dataclass
class CitizenState:
    id: int
    name: str
    archetype: str
    behavioural_type: str
    household_id: int
    death_year: Optional[int] = None
    departure_year: Optional[int] = None
    # Mutable sim state
    s_balance: float = 0.0
    surplus_streak: int = 0           # consecutive months with surplus > threshold
    has_made_first_equity_purchase: bool = False
    companies_founded: List[int] = field(default_factory=list)
    monthly_external_usd: float = 0.0  # set at load if remote_worker / retiree
    monthly_income_s: float = 0.0      # tracked per month for snapshot
    monthly_dividend_s: float = 0.0
    monthly_basket_spend_s: float = 0.0
    archetype_history_pending: List[Tuple] = field(default_factory=list)


@dataclass
class HouseholdState:
    id: int
    composition: str
    housing_type: str
    monthly_housing_cost_usd: float
    monthly_housing_cost_s: float
    mortgage_balance_usd: float
    mortgage_rate: float
    mortgage_remaining_months: int
    primary_citizen_id: int
    basket_baseline_multiplier: float
    discretionary_propensity: float
    member_ids: List[int] = field(default_factory=list)
    n_adults: int = 0
    # Per-category supplier preferences: category -> {company_id -> weight}
    preferences: Dict[str, Dict[int, float]] = field(default_factory=dict)


@dataclass
class CompanyState:
    id: int
    name: str
    sector: str
    sectors_served: List[str]
    is_external_owned: bool
    cfo_policy: str
    max_revenue_per_month_s: float
    is_mcc: bool
    is_exporter: bool
    monthly_export_usd_baseline: float
    monthly_import_usd_baseline: float
    closed_year: Optional[int] = None
    # Mutable sim state
    s_balance: float = 0.0
    revenue_so_far_this_month_s: float = 0.0
    monthly_revenue_s: float = 0.0
    monthly_costs_s: float = 0.0
    monthly_imports_usd: float = 0.0
    monthly_exports_usd: float = 0.0
    monthly_dividend_s: float = 0.0
    min_s_balance_within_month: float = 0.0
    import_default_count: int = 0


@dataclass
class EquityHolding:
    company_id: int
    holder_type: str           # 'citizen' | 'external'
    holder_id: Optional[int]
    external_holder_name: Optional[str]
    share_type: str            # 'permanent' | 'time_limited'
    share_count: float
    cancelled: bool = False


@dataclass
class SimState:
    citizens: List[CitizenState]
    households: Dict[int, HouseholdState]
    companies: List[CompanyState]
    equity_by_company: Dict[int, List[EquityHolding]]
    fisc_usdc: float
    s_supply_total: float
    rng: random.Random
    # Indices for fast lookup
    citizen_by_id: Dict[int, CitizenState] = field(default_factory=dict)
    company_by_id: Dict[int, CompanyState] = field(default_factory=dict)
    companies_by_category: Dict[str, List[CompanyState]] = field(default_factory=dict)
    honda_id: Optional[int] = None
    mcc_id: Optional[int] = None


# ── Loading from DB ─────────────────────────────────────────────────────────

def load_state(conn: sqlite3.Connection, seed: int) -> SimState:
    cur = conn.cursor()

    # Wallets — to seed S balances
    wallet_by_owner: Dict[Tuple[str, int], float] = {}
    fisc_usdc = 0.0
    for row in cur.execute("SELECT owner_type, owner_id, s_balance, usdc_balance FROM wallets"):
        ot, oid, sb, ub = row
        wallet_by_owner[(ot, oid)] = sb
        if ot == "fisc":
            fisc_usdc = ub

    # Citizens
    citizens: List[CitizenState] = []
    for row in cur.execute("""
        SELECT id, name, archetype, behavioural_type, household_id, death_year, departure_year
        FROM citizens
    """):
        cid, name, arch, beh, hh, dy, depy = row
        c = CitizenState(id=cid, name=name, archetype=arch, behavioural_type=beh,
                          household_id=hh, death_year=dy, departure_year=depy,
                          s_balance=wallet_by_owner.get(("citizen", cid), 0.0))
        # External income on remote workers + retirees
        if arch == "remote_worker":
            # Distribution per spec §5: 60% at $50K/yr, 30% at $75K/yr, 10% at $120K/yr
            r = random.Random(seed + cid).random()
            if r < 0.60:
                annual = 50_000
            elif r < 0.90:
                annual = 75_000
            else:
                annual = 120_000
            c.monthly_external_usd = annual / 12.0
        elif arch == "retiree":
            # 30% have a pension $500-2000/month
            rr = random.Random(seed + cid + 9999)
            if rr.random() < 0.30:
                c.monthly_external_usd = rr.uniform(500, 2000)
        citizens.append(c)

    # Households
    households: Dict[int, HouseholdState] = {}
    for row in cur.execute("""
        SELECT id, composition, housing_type, monthly_housing_cost_usd, monthly_housing_cost_s,
               mortgage_balance_usd, mortgage_rate, mortgage_remaining_months, primary_citizen_id,
               basket_baseline_multiplier, discretionary_propensity
        FROM households
    """):
        hh = HouseholdState(
            id=row[0], composition=row[1], housing_type=row[2],
            monthly_housing_cost_usd=row[3], monthly_housing_cost_s=row[4],
            mortgage_balance_usd=row[5], mortgage_rate=row[6],
            mortgage_remaining_months=row[7], primary_citizen_id=row[8],
            basket_baseline_multiplier=row[9], discretionary_propensity=row[10],
        )
        households[hh.id] = hh

    # Wire household members + adult counts
    for c in citizens:
        if c.household_id is None:
            continue
        hh = households.get(c.household_id)
        if hh is None:
            continue
        hh.member_ids.append(c.id)
        if c.archetype != "children_under_18":
            hh.n_adults += 1

    # Companies
    companies: List[CompanyState] = []
    for row in cur.execute("""
        SELECT id, name, sector, sectors_served, is_external_owned, cfo_policy,
               max_revenue_per_month_s, is_mcc, is_exporter,
               monthly_export_usd_baseline, monthly_import_usd_baseline, closed_year
        FROM companies
    """):
        sectors_served = (row[3] or "").split(",") if row[3] else []
        co = CompanyState(
            id=row[0], name=row[1], sector=row[2], sectors_served=sectors_served,
            is_external_owned=bool(row[4]), cfo_policy=row[5],
            max_revenue_per_month_s=row[6], is_mcc=bool(row[7]),
            is_exporter=bool(row[8]),
            monthly_export_usd_baseline=row[9], monthly_import_usd_baseline=row[10],
            closed_year=row[11],
            s_balance=wallet_by_owner.get(("company", row[0]), 0.0),
        )
        co.min_s_balance_within_month = co.s_balance
        companies.append(co)

    # Equity holdings
    equity_by_company: Dict[int, List[EquityHolding]] = {}
    for row in cur.execute("""
        SELECT company_id, holder_type, holder_id, external_holder_name, share_type,
               share_count, cancelled
        FROM equity_holdings
    """):
        eh = EquityHolding(
            company_id=row[0], holder_type=row[1], holder_id=row[2],
            external_holder_name=row[3], share_type=row[4],
            share_count=row[5], cancelled=bool(row[6])
        )
        equity_by_company.setdefault(eh.company_id, []).append(eh)

    # Build indices
    state = SimState(
        citizens=citizens, households=households, companies=companies,
        equity_by_company=equity_by_company,
        fisc_usdc=fisc_usdc, s_supply_total=sum(c.s_balance for c in citizens) + sum(co.s_balance for co in companies),
        rng=random.Random(seed),
    )
    state.citizen_by_id = {c.id: c for c in citizens}
    state.company_by_id = {co.id: co for co in companies}
    for co in companies:
        for cat in co.sectors_served:
            state.companies_by_category.setdefault(cat, []).append(co)
    honda = next((co for co in companies if co.sector == "automotive_manufacturing"), None)
    state.honda_id = honda.id if honda else None
    mcc = next((co for co in companies if co.is_mcc), None)
    state.mcc_id = mcc.id if mcc else None

    # Generate household preference vectors (Dirichlet-ish: stdlib random.gammavariate)
    _generate_household_preferences(state)

    return state


def _generate_household_preferences(state: SimState) -> None:
    """For each household, draw a preference vector over in-category companies.
    Approximation of Dirichlet via normalised gamma draws with α=1 (uniform on simplex)."""
    rng = state.rng
    for hh in state.households.values():
        for category, candidates in state.companies_by_category.items():
            if not candidates:
                continue
            weights = [rng.gammavariate(1.0, 1.0) for _ in candidates]
            total = sum(weights)
            if total > 0:
                weights = [w / total for w in weights]
            hh.preferences[category] = {co.id: w for co, w in zip(candidates, weights)}


# ── Transaction recorder ────────────────────────────────────────────────────

class TxRecorder:
    """Buffers transactions in memory; flushes on demand."""

    def __init__(self):
        self.txs: List[Tuple] = []   # tuples for executemany speed

    def add(self, year: int, month: int, type_: str,
            from_wallet: Optional[Tuple[str, int]],
            to_wallet: Optional[Tuple[str, int]],
            s_amount: float, usdc_amount: float,
            fisc_rate: float, description: str = "",
            related_company_id: Optional[int] = None) -> None:
        # Wallet IDs are resolved at flush time; for now store owner_type/owner_id strings
        self.txs.append((
            year, month, type_,
            from_wallet[0] if from_wallet else None,
            from_wallet[1] if from_wallet else None,
            to_wallet[0] if to_wallet else None,
            to_wallet[1] if to_wallet else None,
            s_amount, usdc_amount, fisc_rate, description, related_company_id
        ))

    def __len__(self):
        return len(self.txs)


# ── Helpers ────────────────────────────────────────────────────────────────

def fisc_rate_and_reserve_check(state: SimState, basket_usd: float, cover_target: float) -> Tuple[float, bool]:
    """Compute Fisc rate from basket cost. Returns (rate, compressed).
    If the reserve cannot cover s_supply * rate * cover_target, compress the rate
    (basket_cost_s will exceed 28 → flagged as stress)."""
    target_rate = basket_usd / BASKET_TARGET_S    # USD per S
    if state.s_supply_total <= 0:
        return target_rate, False
    required_reserve = state.s_supply_total * target_rate * cover_target
    if state.fisc_usdc < required_reserve:
        rate = state.fisc_usdc / (state.s_supply_total * cover_target) if state.s_supply_total > 0 else target_rate
        return rate, True
    return target_rate, False


def supplier_pick(state: SimState, hh: HouseholdState, category: str) -> Optional[CompanyState]:
    """Per spec §4.7.1 — preference × spare-capacity weighted random pick."""
    candidates = [co for co in state.companies_by_category.get(category, [])
                  if co.closed_year is None]
    if not candidates:
        return None
    weights = []
    prefs = hh.preferences.get(category, {})
    for co in candidates:
        spare = max(0.0, co.max_revenue_per_month_s - co.revenue_so_far_this_month_s)
        if spare <= 0:
            weights.append(0.0)
            continue
        weights.append(prefs.get(co.id, 0.001) * spare)
    total = sum(weights)
    if total <= 0:
        return None  # all saturated → unmet demand
    r = state.rng.uniform(0, total)
    acc = 0.0
    for co, w in zip(candidates, weights):
        acc += w
        if r <= acc:
            return co
    return candidates[-1]


def update_min_balance(co: CompanyState) -> None:
    if co.s_balance < co.min_s_balance_within_month:
        co.min_s_balance_within_month = co.s_balance


# ── The monthly tick ────────────────────────────────────────────────────────

def tick_one_month(state: SimState, cfg: SimConfig, trajectory: EnvironmentTrajectory,
                   month_index: int, txs: TxRecorder,
                   citizen_snaps: List[Tuple], company_snaps: List[Tuple],
                   fisc_states: List[Tuple], unmet_demand: List[Tuple]) -> None:
    """Run one month. month_index is 1-based."""
    year = (month_index - 1) // 12       # 0..9
    month = (month_index - 1) % 12 + 1   # 1..12
    surplus_threshold = cfg.surplus_multiplier * cfg.subsistence_s

    # 1. External environment — read this month's basket prices
    basket_usd = trajectory.basket_cost_usd(month_index)

    # 2. Fisc rate adjustment (basket-anchored, with compression check)
    fisc_rate, rate_compressed = fisc_rate_and_reserve_check(state, basket_usd, cfg.cover_target)
    basket_cost_s = basket_usd / fisc_rate if fisc_rate > 0 else 999.0

    # Reset per-month accumulators on companies
    for co in state.companies:
        co.revenue_so_far_this_month_s = 0.0
        co.monthly_revenue_s = 0.0
        co.monthly_costs_s = 0.0
        co.monthly_imports_usd = 0.0
        co.monthly_exports_usd = 0.0
        co.monthly_dividend_s = 0.0
        co.min_s_balance_within_month = co.s_balance
        co.import_default_count = 0

    # Reset per-month citizen counters
    for c in state.citizens:
        c.monthly_income_s = 0.0
        c.monthly_dividend_s = 0.0
        c.monthly_basket_spend_s = 0.0

    living = [c for c in state.citizens if c.death_year is None and c.departure_year is None]

    # 3. UBI mint — config-driven amount + eligibility
    for c in living:
        # Eligibility per config
        if cfg.ubi_retirees_only:
            if c.archetype not in ("retiree", "ubi_only_choice"):
                continue
        if c.archetype == "children_under_18":
            ubi = cfg.ubi_s_per_citizen * cfg.ubi_children_pct
        else:
            ubi = cfg.ubi_s_per_citizen
        if ubi <= 0:
            continue
        c.s_balance += ubi
        c.monthly_income_s += ubi
        state.s_supply_total += ubi
        txs.add(year, month, "ubi_mint",
                from_wallet=("fisc", 0), to_wallet=("citizen", c.id),
                s_amount=ubi, usdc_amount=0.0,
                fisc_rate=fisc_rate)

    # 4. External income arrivals (USDC → S via Fisc)
    for c in living:
        if c.monthly_external_usd <= 0:
            continue
        usd_in = c.monthly_external_usd
        s_minted = usd_in / fisc_rate
        state.fisc_usdc += usd_in
        c.s_balance += s_minted
        c.monthly_income_s += s_minted
        state.s_supply_total += s_minted
        txs.add(year, month, "external_income",
                from_wallet=("external", 0), to_wallet=("citizen", c.id),
                s_amount=s_minted, usdc_amount=usd_in, fisc_rate=fisc_rate)

    # 5. Honda + other exporters generate export revenue (USDC in → S out via Fisc)
    for co in state.companies:
        if not co.is_exporter or co.closed_year is not None:
            continue
        usd_revenue = co.monthly_export_usd_baseline
        # Honda shock: scale Honda exports per scenario+month
        if state.honda_id and co.id == state.honda_id:
            usd_revenue *= honda_shock_multiplier(month_index, cfg.scenario)
        if usd_revenue <= 0:
            continue
        s_received = usd_revenue / fisc_rate
        state.fisc_usdc += usd_revenue
        co.s_balance += s_received
        co.revenue_so_far_this_month_s += s_received
        co.monthly_revenue_s += s_received
        co.monthly_exports_usd += usd_revenue
        state.s_supply_total += s_received
        txs.add(year, month, "export",
                from_wallet=("external", 0), to_wallet=("company", co.id),
                s_amount=s_received, usdc_amount=usd_revenue, fisc_rate=fisc_rate,
                related_company_id=co.id)
        update_min_balance(co)

    # 6. MCC bills citizens (utilities, scaling with adult count)
    mcc = state.company_by_id.get(state.mcc_id) if state.mcc_id else None
    if mcc is not None:
        for hh in state.households.values():
            primary = state.citizen_by_id.get(hh.primary_citizen_id)
            if primary is None or primary.death_year is not None:
                continue
            n_adults = max(1, hh.n_adults)
            bill = cfg.mcc_household_base_s + (n_adults - 1) * cfg.mcc_per_adult_s
            charge = min(bill, max(0.0, primary.s_balance))
            primary.s_balance -= charge
            mcc.s_balance += charge
            mcc.revenue_so_far_this_month_s += charge
            mcc.monthly_revenue_s += charge
            txs.add(year, month, "mcc_bill",
                    from_wallet=("citizen", primary.id), to_wallet=("company", mcc.id),
                    s_amount=charge, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=mcc.id)
        update_min_balance(mcc)

    # 7. MCC bills companies
    if mcc is not None:
        for co in state.companies:
            if co.id == mcc.id or co.closed_year is not None:
                continue
            bill = cfg.mcc_company_base_s + co.max_revenue_per_month_s * cfg.mcc_per_revenue_frac
            charge = min(bill, max(0.0, co.s_balance))
            co.s_balance -= charge
            co.monthly_costs_s += charge
            mcc.s_balance += charge
            mcc.revenue_so_far_this_month_s += charge
            mcc.monthly_revenue_s += charge
            txs.add(year, month, "mcc_bill",
                    from_wallet=("company", co.id), to_wallet=("company", mcc.id),
                    s_amount=charge, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=mcc.id)
            update_min_balance(co)
        update_min_balance(mcc)

    # 7.5. LAT (Local Automation Tax) — if enabled, charge each company a % of their
    # max_revenue_per_month_s as a proxy for automation level. S is destroyed at Fisc
    # (reduces denominator in cover ratio → strengthens reserve coverage).
    if cfg.lat_enabled and cfg.lat_rate_pct > 0:
        for co in state.companies:
            if co.is_mcc or co.closed_year is not None:
                continue
            bill = co.max_revenue_per_month_s * cfg.lat_rate_pct
            charge = min(bill, max(0.0, co.s_balance))
            if charge <= 0:
                continue
            co.s_balance -= charge
            co.monthly_costs_s += charge
            state.s_supply_total -= charge   # S burned at Fisc
            txs.add(year, month, "lat_payment",
                    from_wallet=("company", co.id), to_wallet=("fisc", 0),
                    s_amount=charge, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=co.id, description="LAT")
            update_min_balance(co)

    # 8. Citizen consumption (basket via supplier picker)
    unmet_by_cat: Dict[str, float] = {c: 0.0 for c in BASKET_WEIGHTS_USD}
    total_demand_by_cat: Dict[str, float] = {c: 0.0 for c in BASKET_WEIGHTS_USD}
    for hh in state.households.values():
        primary = state.citizen_by_id.get(hh.primary_citizen_id)
        if primary is None or primary.death_year is not None:
            continue
        # Per-household basket spend
        hh_basket_total = hh.basket_baseline_multiplier * basket_cost_s
        for category, weight in BASKET_WEIGHTS_USD.items():
            cat_share = weight / sum(BASKET_WEIGHTS_USD.values())
            cat_spend = hh_basket_total * cat_share
            total_demand_by_cat[category] += cat_spend
            available = max(0.0, primary.s_balance)
            cat_spend = min(cat_spend, available)
            if cat_spend <= 0:
                continue
            supplier = supplier_pick(state, hh, category)
            if supplier is None:
                unmet_by_cat[category] += cat_spend
                continue
            # S-tax on internal purchases — if enabled, a fraction of every purchase
            # is taxed at the Fisc (S destroyed; reduces supply)
            tax = cat_spend * cfg.s_tax_on_purchases_pct if cfg.s_tax_on_purchases_pct > 0 else 0.0
            net_to_supplier = cat_spend - tax
            primary.s_balance -= cat_spend
            primary.monthly_basket_spend_s += cat_spend
            supplier.s_balance += net_to_supplier
            supplier.revenue_so_far_this_month_s += net_to_supplier
            supplier.monthly_revenue_s += net_to_supplier
            if tax > 0:
                state.s_supply_total -= tax   # destroyed at Fisc
                txs.add(year, month, "s_tax_payment",
                        from_wallet=("citizen", primary.id), to_wallet=("fisc", 0),
                        s_amount=tax, usdc_amount=0.0, fisc_rate=fisc_rate,
                        related_company_id=supplier.id, description="purchase tax")
            txs.add(year, month, "internal_purchase",
                    from_wallet=("citizen", primary.id), to_wallet=("company", supplier.id),
                    s_amount=net_to_supplier, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=supplier.id)
            update_min_balance(supplier)

    # Record unmet demand
    for cat, unmet in unmet_by_cat.items():
        unmet_demand.append((year, month, cat, unmet, total_demand_by_cat[cat]))

    # 9. Citizen housing (mortgage / external rent / internal rent)
    # If mortgage_refinance_to_s or external_rent_refinance is on, the S stays in the
    # colony economy (held at Fisc as a virtual "colony bank" balance — for v1, we
    # just don't burn it and don't send USDC out). This represents a colony-financed
    # buyout of the external mortgage/rent obligation.
    for hh in state.households.values():
        primary = state.citizen_by_id.get(hh.primary_citizen_id)
        if primary is None or primary.death_year is not None:
            continue
        if hh.housing_type == "owner_with_mortgage" and hh.monthly_housing_cost_usd > 0:
            usd_out = hh.monthly_housing_cost_usd
            s_required = usd_out / fisc_rate
            charge = min(s_required, max(0.0, primary.s_balance))
            primary.s_balance -= charge
            if cfg.mortgage_refinance_to_s:
                # S stays in colony — kept as virtual reserve at Fisc (no USDC outflow)
                # Modelled simply: S "destroyed" at Fisc but USDC reserve unchanged
                # (so cover ratio improves, mimicking the buyout mechanic)
                state.s_supply_total -= charge
                txs.add(year, month, "mortgage_refinanced_s",
                        from_wallet=("citizen", primary.id), to_wallet=("fisc", 0),
                        s_amount=charge, usdc_amount=0.0, fisc_rate=fisc_rate,
                        description="colony bank buyout")
            else:
                usd_actual = charge * fisc_rate
                state.s_supply_total -= charge
                state.fisc_usdc -= usd_actual
                txs.add(year, month, "mortgage_payment",
                        from_wallet=("citizen", primary.id), to_wallet=("external", 0),
                        s_amount=charge, usdc_amount=usd_actual, fisc_rate=fisc_rate)
        elif hh.housing_type == "renter_external" and hh.monthly_housing_cost_usd > 0:
            usd_out = hh.monthly_housing_cost_usd
            s_required = usd_out / fisc_rate
            charge = min(s_required, max(0.0, primary.s_balance))
            primary.s_balance -= charge
            if cfg.external_rent_refinance:
                state.s_supply_total -= charge
                txs.add(year, month, "external_rent_refinanced_s",
                        from_wallet=("citizen", primary.id), to_wallet=("fisc", 0),
                        s_amount=charge, usdc_amount=0.0, fisc_rate=fisc_rate,
                        description="colony landlord buyout")
            else:
                usd_actual = charge * fisc_rate
                state.s_supply_total -= charge
                state.fisc_usdc -= usd_actual
                txs.add(year, month, "external_rent",
                        from_wallet=("citizen", primary.id), to_wallet=("external", 0),
                        s_amount=charge, usdc_amount=usd_actual, fisc_rate=fisc_rate)
        elif hh.housing_type == "renter_internal" and hh.monthly_housing_cost_s > 0:
            # Pick a "landlord" — for v1, just route to a property-services proxy:
            # use whichever services-category company picks up the spend
            charge = min(hh.monthly_housing_cost_s, max(0.0, primary.s_balance))
            if charge > 0:
                landlord = supplier_pick(state, hh, "services")
                if landlord is not None:
                    primary.s_balance -= charge
                    landlord.s_balance += charge
                    landlord.revenue_so_far_this_month_s += charge
                    landlord.monthly_revenue_s += charge
                    txs.add(year, month, "internal_rent",
                            from_wallet=("citizen", primary.id),
                            to_wallet=("company", landlord.id),
                            s_amount=charge, usdc_amount=0.0, fisc_rate=fisc_rate,
                            related_company_id=landlord.id)
                    update_min_balance(landlord)

    # 10. Companies pay imports (S → USDC via Fisc → external)
    for co in state.companies:
        if co.closed_year is not None or co.monthly_import_usd_baseline <= 0:
            continue
        usd_out = co.monthly_import_usd_baseline
        s_required = usd_out / fisc_rate
        if co.s_balance < s_required:
            co.import_default_count += 1
            # Pay what they can
            usd_actual = co.s_balance * fisc_rate
            charge = co.s_balance
            co.s_balance = 0.0
        else:
            usd_actual = usd_out
            charge = s_required
            co.s_balance -= charge
        if charge <= 0:
            continue
        co.monthly_costs_s += charge
        co.monthly_imports_usd += usd_actual
        state.s_supply_total -= charge   # S burned at Fisc
        state.fisc_usdc -= usd_actual
        txs.add(year, month, "import",
                from_wallet=("company", co.id), to_wallet=("external", 0),
                s_amount=charge, usdc_amount=usd_actual, fisc_rate=fisc_rate,
                related_company_id=co.id)
        update_min_balance(co)

    # 11. Company internal operating costs (representing internal labour, supplies)
    # Costs are a function of revenue this month; charge against S balance, no destination
    # (modelled as flow back into employees/operations — for v1, just deduct from company balance
    # so dividends are computed correctly)
    # Skip for now — we represent operating costs implicitly via lower distributable surplus
    # below. Wages aren't paid in SPICE design (replaced by dividends + UBI).

    # 12. Dividend distribution
    # External equity holders (Honda Inc) hold the factory for governance / sale-purposes
    # but DO NOT extract monthly dividends. Honda Inc's value flow is the cars they buy
    # (export revenue, step 5), not a dividend cashout. So distributable surplus goes
    # only to citizen + colony-stakeholder shares.
    for co in state.companies:
        if co.closed_year is not None:
            continue
        wc_months = cfg.wc_target_months.get(co.cfo_policy, 1.0)
        wc_target = co.max_revenue_per_month_s * wc_months * cfg.company_op_cost_frac
        distributable = max(0.0, co.s_balance - wc_target)
        if distributable <= 0:
            continue
        # Only citizen holdings receive dividends. External (Honda Inc) holdings
        # are recorded for ownership but skipped for distribution.
        holdings = [h for h in state.equity_by_company.get(co.id, [])
                    if not h.cancelled and h.holder_type == "citizen"]
        distributable_shares = sum(h.share_count for h in holdings)
        if distributable_shares <= 0:
            continue
        for h in holdings:
            share_div = distributable * (h.share_count / distributable_shares)
            if share_div <= 0:
                continue
            citizen = state.citizen_by_id.get(h.holder_id)
            if citizen is None or citizen.death_year is not None:
                continue
            co.s_balance -= share_div
            citizen.s_balance += share_div
            citizen.monthly_dividend_s += share_div
            citizen.monthly_income_s += share_div
            co.monthly_dividend_s += share_div
            tx_type = "dividend_perm" if h.share_type == "permanent" else "dividend_timed"
            txs.add(year, month, tx_type,
                    from_wallet=("company", co.id), to_wallet=("citizen", citizen.id),
                    s_amount=share_div, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=co.id)
        update_min_balance(co)

    # 13. Citizen behavioural decisions (cashout some surplus to USDC)
    for c in living:
        surplus = c.s_balance - surplus_threshold
        if surplus <= 0:
            c.surplus_streak = max(0, c.surplus_streak - 1)
            continue
        c.surplus_streak += 1
        cashout_frac = cfg.cashout_fraction.get(c.behavioural_type, 0.05) * cfg.cashout_multiplier
        cashout_s = surplus * cashout_frac
        if cashout_s > 0:
            usdc_out = cashout_s * fisc_rate
            if state.fisc_usdc >= usdc_out:
                c.s_balance -= cashout_s
                state.s_supply_total -= cashout_s
                state.fisc_usdc -= usdc_out
                txs.add(year, month, "cashout",
                        from_wallet=("citizen", c.id), to_wallet=("external", 0),
                        s_amount=cashout_s, usdc_amount=usdc_out, fisc_rate=fisc_rate)
        if (not c.has_made_first_equity_purchase
                and c.behavioural_type == "striver"
                and c.s_balance > surplus_threshold * 5):
            c.has_made_first_equity_purchase = True

    # 14. Archetype transitions (per spec §4.8.1)
    for c in living:
        old = c.archetype
        new = None
        trigger = None
        if old == "ubi_only_choice":
            if (c.surplus_streak >= cfg.surplus_duration_months
                    and c.s_balance >= surplus_threshold * 3
                    and c.has_made_first_equity_purchase):
                new = "striver"
                trigger = "sustained_surplus"
        elif old in WORKER_ARCHETYPES:
            if (c.surplus_streak >= cfg.surplus_duration_months * 2
                    and c.s_balance >= surplus_threshold * 5
                    and c.has_made_first_equity_purchase):
                new = "striver"
                trigger = "sustained_surplus"
        elif old == "striver":
            # Phase 3 will handle company founding + survival → small_business_owner
            pass
        if new and new != old:
            c.archetype = new
            c.archetype_history_pending.append((year, month, old, new, trigger))

    # 15. Snapshots — append to the in-memory accumulators
    fisc_states.append((year, month, fisc_rate, state.fisc_usdc, state.s_supply_total,
                        sum(c.s_balance for c in state.citizens),
                        sum(co.s_balance for co in state.companies),
                        basket_usd, basket_cost_s,
                        (state.fisc_usdc / (state.s_supply_total * fisc_rate))
                            if (state.s_supply_total > 0 and fisc_rate > 0) else 0.0,
                        1 if rate_compressed else 0))

    # Per-citizen + per-company snapshots — sample at year-end only to keep DB size sane
    # (Per-month snapshots for 3,900 citizens × 120 months = 468K rows; we reduce by sampling)
    if month == 12:
        for c in state.citizens:
            citizen_snaps.append((
                c.id, year, month, c.s_balance,
                c.monthly_income_s, c.monthly_dividend_s, c.monthly_external_usd,
                c.monthly_basket_spend_s,
                (c.monthly_income_s / basket_cost_s) if basket_cost_s > 0 else 0.0,
            ))
        for co in state.companies:
            company_snaps.append((
                co.id, year, month, co.s_balance, co.min_s_balance_within_month,
                co.monthly_revenue_s, co.monthly_costs_s,
                co.monthly_imports_usd, co.monthly_exports_usd,
                co.monthly_dividend_s, co.import_default_count,
                0,    # employee_count placeholder — fill in Phase 3
                sum(h.share_count for h in state.equity_by_company.get(co.id, [])
                    if not h.cancelled and h.share_type == "permanent"),
                sum(h.share_count for h in state.equity_by_company.get(co.id, [])
                    if not h.cancelled and h.share_type == "time_limited"),
            ))


# ── Flushing to DB ──────────────────────────────────────────────────────────

def flush_to_db(conn: sqlite3.Connection, state: SimState, txs: TxRecorder,
                citizen_snaps: List, company_snaps: List, fisc_states: List,
                unmet_demand: List) -> None:
    cur = conn.cursor()

    # Resolve wallet IDs from owner_type/owner_id
    wallet_id_by_owner = {}
    for row in cur.execute("SELECT id, owner_type, owner_id FROM wallets"):
        wallet_id_by_owner[(row[1], row[2])] = row[0]

    # Convert tx tuples — replace owner_type/owner_id with wallet_id
    resolved_txs = []
    for t in txs.txs:
        (year, month, type_, from_ot, from_oid, to_ot, to_oid,
         s_amt, usdc_amt, fisc_rate, desc, rel_co) = t
        from_wid = wallet_id_by_owner.get((from_ot, from_oid)) if from_ot else None
        to_wid = wallet_id_by_owner.get((to_ot, to_oid)) if to_ot else None
        resolved_txs.append((year, month, type_, from_wid, to_wid,
                             s_amt, usdc_amt, fisc_rate, desc, rel_co))

    cur.executemany("""
        INSERT INTO transactions
            (year, month, type, from_wallet_id, to_wallet_id,
             s_amount, usdc_amount, fisc_rate_at_time, description, related_company_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, resolved_txs)

    cur.executemany("""
        INSERT INTO citizen_snapshots
            (citizen_id, year, month, s_balance, monthly_income_s, monthly_dividend_s,
             monthly_external_usd, monthly_basket_spend_s, real_purchasing_power)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, citizen_snaps)

    cur.executemany("""
        INSERT INTO company_snapshots
            (company_id, year, month, s_balance, min_s_balance_within_month,
             monthly_revenue_s, monthly_costs_s, monthly_imports_usd, monthly_exports_usd,
             monthly_dividend_distributed_s, import_default_count, employee_count,
             permanent_share_count, timed_share_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, company_snaps)

    cur.executemany("""
        INSERT INTO fisc_state
            (year, month, fisc_rate, usdc_reserve, s_supply_total, s_supply_citizens,
             s_supply_companies, basket_cost_usd, basket_cost_s, cover_ratio, rate_compressed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, fisc_states)

    cur.executemany("""
        INSERT INTO unmet_demand (year, month, category, unmet_s, total_s)
        VALUES (?, ?, ?, ?, ?)
    """, unmet_demand)

    # External environment for the trajectory (per-month per-category)
    # This is regenerated from scenario; insert for query convenience
    # (Skipped here — scenarios.py is canonical; if dashboard wants this, regenerate from scenario)

    # Archetype history
    arch_history = []
    for c in state.citizens:
        for entry in c.archetype_history_pending:
            year, month, old, new, trigger = entry
            arch_history.append((c.id, year, month, old, new, trigger))
    cur.executemany("""
        INSERT INTO archetype_history (citizen_id, year, month, from_archetype, to_archetype, trigger)
        VALUES (?, ?, ?, ?, ?, ?)
    """, arch_history)

    # Update wallets to final balances
    for c in state.citizens:
        cur.execute("UPDATE wallets SET s_balance=? WHERE owner_type='citizen' AND owner_id=?",
                    (c.s_balance, c.id))
    for co in state.companies:
        cur.execute("UPDATE wallets SET s_balance=? WHERE owner_type='company' AND owner_id=?",
                    (co.s_balance, co.id))
    cur.execute("UPDATE wallets SET usdc_balance=? WHERE owner_type='fisc'",
                (state.fisc_usdc,))

    # Update citizens.archetype to final value
    for c in state.citizens:
        cur.execute("UPDATE citizens SET archetype=? WHERE id=?", (c.archetype, c.id))

    # Run metadata: finished_at
    import time as _time
    cur.execute("INSERT OR REPLACE INTO run_metadata (key, value) VALUES ('finished_at', ?)",
                (str(int(_time.time())),))

    conn.commit()
