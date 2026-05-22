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
    # Levy mechanism (per spice_levy_build_spec)
    profit_per_employee: float = 100_000.0
    employee_count: int = 1
    annual_profit_accum: float = 0.0           # accumulator for current year, reset at year-end
    annual_revenue_accum: float = 0.0          # accumulator for current year
    annual_costs_accum: float = 0.0            # accumulator for current year
    # Mutable sim state
    s_balance: float = 0.0
    revenue_so_far_this_month_s: float = 0.0
    monthly_revenue_s: float = 0.0
    monthly_costs_s: float = 0.0
    monthly_imports_usd: float = 0.0
    monthly_exports_usd: float = 0.0
    monthly_dividend_s: float = 0.0
    monthly_automation_levy_paid_s: float = 0.0  # what this co paid in automation levy this month
    min_s_balance_within_month: float = 0.0
    import_default_count: int = 0


@dataclass
class ExternalSupplier:
    """A row from the external_suppliers table — used for import-side levy."""
    id: int
    name: str
    sector: str
    profit_per_employee: float
    employee_count: int
    annual_revenue: float
    annual_profit: float
    last_updated_year: int = 0
    monthly_automation_levy_paid_s: float = 0.0  # accumulator for dashboard


@dataclass
class LevyAccumulator:
    """Per-tick state for levy aggregates."""
    monthly_gas_s: float = 0.0
    monthly_protocol_s: float = 0.0
    monthly_automation_s: float = 0.0
    transaction_count: int = 0
    # Cumulative for the year (reset by recalibration)
    ytd_automation_levy_s: float = 0.0
    ytd_weighted_volume: float = 0.0           # ∑ V × f(P_firm) used by recalibration


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
    # Levy mechanism state (all defaulted)
    external_suppliers: Dict[int, ExternalSupplier] = field(default_factory=dict)
    external_suppliers_by_sector: Dict[str, List[int]] = field(default_factory=dict)
    protocol_treasury_s: float = 0.0
    protocol_treasury_usdc: float = 0.0
    gas_pool_s: float = 0.0
    gas_pool_usdc: float = 0.0
    levy_accum: LevyAccumulator = field(default_factory=LevyAccumulator)
    mcc_federal_collected_s: float = 0.0      # accumulator within month, reset at month-end
    mcc_federal_remitted_usdc_ytd: float = 0.0
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
               monthly_export_usd_baseline, monthly_import_usd_baseline, closed_year,
               profit_per_employee, employee_count
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
            profit_per_employee=row[12] or 100_000.0,
            employee_count=row[13] or 1,
            s_balance=wallet_by_owner.get(("company", row[0]), 0.0),
        )
        co.min_s_balance_within_month = co.s_balance
        companies.append(co)

    # External suppliers (for import-side levy)
    external_suppliers: Dict[int, ExternalSupplier] = {}
    external_suppliers_by_sector: Dict[str, List[int]] = {}
    try:
        for row in cur.execute("""
            SELECT id, name, sector, profit_per_employee, employee_count,
                   annual_revenue, annual_profit, last_updated_year
            FROM external_suppliers
        """):
            es = ExternalSupplier(
                id=row[0], name=row[1], sector=row[2],
                profit_per_employee=row[3] or 100_000.0,
                employee_count=row[4] or 1,
                annual_revenue=row[5] or 0.0,
                annual_profit=row[6] or 0.0,
                last_updated_year=row[7] or 0,
            )
            external_suppliers[es.id] = es
            external_suppliers_by_sector.setdefault(es.sector, []).append(es.id)
    except sqlite3.OperationalError:
        pass  # external_suppliers table missing — running on a pre-Phase-A DB

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
        external_suppliers=external_suppliers,
        external_suppliers_by_sector=external_suppliers_by_sector,
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


# ── Three-layer levy (per spice_levy_build_spec) ──────────────────────────

def compute_automation_levy(gross_value_s: float, profit_per_employee_usd: float,
                            cfg: SimConfig) -> float:
    """Per spec §2 formula: automation_levy = V × k × max(0, (P_firm − P_threshold) / P_baseline) ^ α
    Returns the levy amount in S (same denomination as gross_value_s)."""
    if profit_per_employee_usd <= cfg.p_threshold_usd:
        return 0.0
    excess = (profit_per_employee_usd - cfg.p_threshold_usd) / cfg.p_baseline_usd
    f_p = excess ** cfg.alpha
    return gross_value_s * cfg.k * f_p


def apply_levies(state: SimState, cfg: SimConfig, gross_value_s: float,
                 supplier_p_per_emp: float, transaction_type: str,
                 fisc_rate: float, year: int, month: int,
                 supplier_holder_type: str = "company",
                 supplier_holder_id: Optional[int] = None) -> Tuple[float, float, float, float]:
    """
    Compute and route the three-layer levy for a transaction.

    Returns (gas_levy_s, protocol_levy_s, automation_levy_s, supplier_net_s).

    Side effects:
    - state.gas_pool_s, protocol_treasury_s, levy_accum updated
    - automation levy is converted to USDC and added to fisc_usdc
    - associated S supply is destroyed at the Fisc (the automation_levy in S
      is burned; the equivalent USDC is created/added to reserve)
    - supplier_levy_summary tracking via levy_accum

    If levy is disabled or transaction type isn't levied, returns zeros.
    """
    LEVIED_TYPES = {
        "internal_purchase", "internal_b2b", "export", "import", "mcc_bill"
    }
    if not cfg.levy_enabled or transaction_type not in LEVIED_TYPES:
        return 0.0, 0.0, 0.0, gross_value_s

    # Layer 1: Gas (fixed USD per tx, converted to S at current rate)
    gas_levy_s = cfg.chain_gas_fee_usd / fisc_rate if fisc_rate > 0 else 0.0
    # Cap gas at 1% of the transaction so it never exceeds the value sent
    gas_levy_s = min(gas_levy_s, gross_value_s * 0.01)

    # Layer 2: Protocol (% of gross)
    protocol_levy_s = gross_value_s * cfg.protocol_rate

    # Layer 3: Automation (progressive on supplier P/emp)
    automation_levy_s = compute_automation_levy(gross_value_s, supplier_p_per_emp, cfg)

    # Cap total levy at, say, 40% of gross to avoid pathological cases
    total_levy_s = gas_levy_s + protocol_levy_s + automation_levy_s
    if total_levy_s > gross_value_s * 0.40:
        scale_down = (gross_value_s * 0.40) / total_levy_s
        gas_levy_s *= scale_down
        protocol_levy_s *= scale_down
        automation_levy_s *= scale_down
        total_levy_s = gross_value_s * 0.40

    supplier_net_s = gross_value_s - total_levy_s

    # Route gas → gas_pool
    state.gas_pool_s += gas_levy_s

    # Route protocol → protocol treasury
    state.protocol_treasury_s += protocol_levy_s

    # Route automation → Fisc reserve. The S is burned; equivalent USDC arrives.
    state.s_supply_total -= automation_levy_s
    state.fisc_usdc += automation_levy_s * fisc_rate

    # Update accumulators
    state.levy_accum.monthly_gas_s += gas_levy_s
    state.levy_accum.monthly_protocol_s += protocol_levy_s
    state.levy_accum.monthly_automation_s += automation_levy_s
    state.levy_accum.transaction_count += 1
    state.levy_accum.ytd_automation_levy_s += automation_levy_s

    # Track for supplier_levy_summary (used by /levy dashboard)
    if supplier_holder_type == "company" and supplier_holder_id is not None:
        co = state.company_by_id.get(supplier_holder_id)
        if co is not None:
            co.monthly_automation_levy_paid_s += automation_levy_s
    elif supplier_holder_type == "external" and supplier_holder_id is not None:
        es = state.external_suppliers.get(supplier_holder_id)
        if es is not None:
            es.monthly_automation_levy_paid_s += automation_levy_s

    return gas_levy_s, protocol_levy_s, automation_levy_s, supplier_net_s


def pick_external_supplier_for_imports(state: SimState, sector_hint: str) -> Optional['ExternalSupplier']:
    """When a colony company imports, pick a representative external supplier for the
    sector to determine the supplier's profit_per_employee for the levy.
    Returns the ExternalSupplier or None if no match."""
    if not state.external_suppliers_by_sector:
        return None
    # Try to find a supplier in a related sector. Honda factory imports parts → auto_mfg/automated_mfg.
    # Other importers → big_retail / traditional_mfg / etc.
    SECTOR_MAP = {
        "automotive_manufacturing": ["auto_mfg", "automated_mfg", "traditional_mfg"],
        "manufacturing": ["traditional_mfg", "automated_mfg"],
        "healthcare": ["pharma", "healthcare_provider"],
        "retail_grocery": ["agriculture", "big_retail"],
        "retail": ["big_retail", "traditional_mfg"],
        "restaurant": ["agriculture_local", "agriculture", "big_retail"],
        "education": ["ed_online", "software"],
        "professional_services": ["software", "telecom_equip"],
        "construction": ["construction_national", "traditional_mfg"],
        "trades": ["construction_local", "traditional_mfg"],
        "auto_services": ["auto_mfg", "automated_mfg"],
        "utilities": ["energy", "telecom_equip"],
        "other": ["big_retail", "logistics"],
    }
    candidates: List[int] = []
    for s in SECTOR_MAP.get(sector_hint, []):
        candidates += state.external_suppliers_by_sector.get(s, [])
    if not candidates:
        # Fallback: any supplier
        for ids in state.external_suppliers_by_sector.values():
            candidates += ids
        if not candidates:
            return None
    chosen_id = state.rng.choice(candidates)
    return state.external_suppliers.get(chosen_id)


# ── Phase C: annual recalibration ───────────────────────────────────────────

# Tracks levy_calibration entries and supplier_levy_summary for the dashboard
LEVY_CALIBRATION_RECORDS: List[Tuple] = []
SUPPLIER_LEVY_RECORDS: List[Tuple] = []
PROTOCOL_TREASURY_RECORDS: List[Tuple] = []
GAS_POOL_RECORDS: List[Tuple] = []
MCC_FEDERAL_REMITTANCE_RECORDS: List[Tuple] = []


def _recalibrate_levy(state: SimState, cfg: SimConfig, year: int, fisc_rate: float,
                       fisc_states: List, citizen_snaps: List) -> None:
    """Year-end recalibration of the levy mechanism (per spec §5).

    Updates each company's profit_per_employee from accumulated annual profit, then
    recomputes k to balance projected next-year UBI obligation against projected
    weighted transaction volume."""

    # Update profit_per_employee for each colony company from accumulated profit
    for co in state.companies:
        if co.employee_count <= 0:
            continue
        # Convert annual_profit_accum (in S) to USD using current fisc rate
        annual_profit_usd = co.annual_profit_accum * fisc_rate
        new_p_per_emp = max(0.0, annual_profit_usd / co.employee_count)
        # Smoothing: blend 70% new + 30% old to reduce volatility
        co.profit_per_employee = 0.7 * new_p_per_emp + 0.3 * co.profit_per_employee
        # Reset annual accumulators for next year
        co.annual_profit_accum = 0.0
        co.annual_revenue_accum = 0.0
        co.annual_costs_accum = 0.0

    # Recompute k for next year. Need projected weighted volume and projected UBI obligation.
    # Use last year's actual transaction value × f(P_firm) as the projection basis.
    # ytd_weighted_volume isn't tracked directly; estimate from companies' revenue × f(P) +
    # external suppliers' revenue × f(P) + internal_purchase volume × avg internal f(P)

    next_year_ubi_s = cfg.ubi_s_per_citizen * len(state.citizens) * 12
    next_year_ubi_usd = next_year_ubi_s * fisc_rate

    # Estimate weighted volume = ∑ over levied transactions of (value × f(P_firm))
    # As proxy: companies' annual revenue × f(P_firm) + external suppliers' revenue × f(P_firm)
    weighted_volume_s = 0.0
    for co in state.companies:
        if co.closed_year is not None:
            continue
        f_p = max(0.0, (co.profit_per_employee - cfg.p_threshold_usd) / cfg.p_baseline_usd) ** cfg.alpha
        # Use max_revenue × 12 × utilisation_estimate (~50%) as projected annual volume
        annual_volume_s = co.max_revenue_per_month_s * 12 * 0.5
        weighted_volume_s += annual_volume_s * f_p
    # External suppliers: their import revenue is the colony's import outflow
    for es in state.external_suppliers.values():
        f_p = max(0.0, (es.profit_per_employee - cfg.p_threshold_usd) / cfg.p_baseline_usd) ** cfg.alpha
        annual_revenue_s = es.annual_revenue / fisc_rate if fisc_rate > 0 else 0
        weighted_volume_s += annual_revenue_s * f_p

    weighted_volume_usd = weighted_volume_s * fisc_rate
    if weighted_volume_usd > 0:
        new_k = next_year_ubi_usd / weighted_volume_usd
        new_k = max(cfg.k_min, min(cfg.k_max, new_k))
        cfg.k = new_k

    LEVY_CALIBRATION_RECORDS.append((
        year + 1,                # new k applies to year+1
        cfg.p_threshold_usd, cfg.p_baseline_usd, cfg.alpha, cfg.k,
        weighted_volume_usd * cfg.k,                # projected next-year levy revenue
        next_year_ubi_usd,                          # projected next-year UBI obligation
        state.levy_accum.ytd_automation_levy_s * fisc_rate,   # actual prior-year levy revenue (USD)
        next_year_ubi_usd,                          # actual prior-year UBI obligation (proxy)
    ))

    # Snapshot per-supplier levy paid this year
    # This is approximate — we accumulate monthly_automation_levy_paid_s in real time but
    # don't have a year-end accumulator. Use ytd_automation_levy_s as the colony total.
    # For now, snapshot monthly_automation_levy_paid_s scaled to annual.
    for co in state.companies:
        if co.monthly_automation_levy_paid_s > 0:
            SUPPLIER_LEVY_RECORDS.append((
                year, "company", co.id, co.name, co.sector,
                co.profit_per_employee, co.monthly_automation_levy_paid_s * 12,
                co.monthly_automation_levy_paid_s * 12 * fisc_rate, 0
            ))
    for es in state.external_suppliers.values():
        if es.monthly_automation_levy_paid_s > 0:
            SUPPLIER_LEVY_RECORDS.append((
                year, "external", es.id, es.name, es.sector,
                es.profit_per_employee, es.monthly_automation_levy_paid_s * 12,
                es.monthly_automation_levy_paid_s * 12 * fisc_rate, 0
            ))

    # Reset YTD levy accumulator for next year
    state.levy_accum.ytd_automation_levy_s = 0.0


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
        co.monthly_automation_levy_paid_s = 0.0
        co.min_s_balance_within_month = co.s_balance
        co.import_default_count = 0

    # Reset per-month levy accumulators
    state.levy_accum.monthly_gas_s = 0.0
    state.levy_accum.monthly_protocol_s = 0.0
    state.levy_accum.monthly_automation_s = 0.0
    state.levy_accum.transaction_count = 0
    for es in state.external_suppliers.values():
        es.monthly_automation_levy_paid_s = 0.0
    state.mcc_federal_collected_s = 0.0

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
        gross_s = usd_revenue / fisc_rate
        state.fisc_usdc += usd_revenue
        state.s_supply_total += gross_s
        # Apply levies. Exporter is the supplier; the external buyer (or Honda Inc, etc.)
        # is on the buyer side and not a colony entity. Use the exporting colony co's
        # P/emp for the automation levy.
        gas_s, prot_s, auto_s, net_s = apply_levies(
            state, cfg, gross_s, co.profit_per_employee, "export",
            fisc_rate, year, month,
            supplier_holder_type="company", supplier_holder_id=co.id
        )
        co.s_balance += net_s
        co.revenue_so_far_this_month_s += net_s
        co.monthly_revenue_s += net_s
        co.monthly_exports_usd += usd_revenue
        co.annual_revenue_accum += net_s
        txs.add(year, month, "export",
                from_wallet=("external", 0), to_wallet=("company", co.id),
                s_amount=net_s, usdc_amount=usd_revenue, fisc_rate=fisc_rate,
                related_company_id=co.id,
                description=f"levy: gas={gas_s:.2f} prot={prot_s:.2f} auto={auto_s:.2f}" if cfg.levy_enabled else "")
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
            # Phase D: residual federal tax line (if enabled)
            federal_share_s = 0.0
            if cfg.mcc_federal_tax_enabled:
                federal_share_usd = cfg.mcc_federal_tax_per_citizen_usd_year * n_adults / 12.0
                federal_share_s = federal_share_usd / fisc_rate if fisc_rate > 0 else 0.0
                bill += federal_share_s
            gross = min(bill, max(0.0, primary.s_balance))
            primary.s_balance -= gross
            # Apply levies on the utilities portion only — federal tax flows through MCC unlevied
            utilities_portion = gross - federal_share_s if cfg.mcc_federal_tax_enabled else gross
            gas_s, prot_s, auto_s, net_s = apply_levies(
                state, cfg, utilities_portion, mcc.profit_per_employee, "mcc_bill",
                fisc_rate, year, month,
                supplier_holder_type="company", supplier_holder_id=mcc.id
            )
            mcc_received = net_s + federal_share_s   # MCC gets utilities-net + the federal share to remit
            mcc.s_balance += mcc_received
            mcc.revenue_so_far_this_month_s += net_s
            mcc.monthly_revenue_s += net_s
            mcc.annual_revenue_accum += net_s
            if federal_share_s > 0:
                state.mcc_federal_collected_s += federal_share_s
            txs.add(year, month, "mcc_bill",
                    from_wallet=("citizen", primary.id), to_wallet=("company", mcc.id),
                    s_amount=mcc_received, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=mcc.id,
                    description=f"fed_share={federal_share_s:.2f}" if federal_share_s > 0 else "")
        update_min_balance(mcc)

    # 7. MCC bills companies
    if mcc is not None:
        for co in state.companies:
            if co.id == mcc.id or co.closed_year is not None:
                continue
            bill = cfg.mcc_company_base_s + co.max_revenue_per_month_s * cfg.mcc_per_revenue_frac
            gross = min(bill, max(0.0, co.s_balance))
            co.s_balance -= gross
            co.monthly_costs_s += gross
            co.annual_costs_accum += gross
            gas_s, prot_s, auto_s, net_s = apply_levies(
                state, cfg, gross, mcc.profit_per_employee, "mcc_bill",
                fisc_rate, year, month,
                supplier_holder_type="company", supplier_holder_id=mcc.id
            )
            mcc.s_balance += net_s
            mcc.revenue_so_far_this_month_s += net_s
            mcc.monthly_revenue_s += net_s
            mcc.annual_revenue_accum += net_s
            txs.add(year, month, "mcc_bill",
                    from_wallet=("company", co.id), to_wallet=("company", mcc.id),
                    s_amount=net_s, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=mcc.id)
            update_min_balance(co)
        update_min_balance(mcc)

    # 7.5. MPC (Market Participation Charge) — if enabled, charge each company a % of their
    # max_revenue_per_month_s as a proxy for automation level. S is destroyed at Fisc
    # (reduces denominator in cover ratio → strengthens reserve coverage).
    if cfg.mpc_enabled and cfg.mpc_rate_pct > 0:
        for co in state.companies:
            if co.is_mcc or co.closed_year is not None:
                continue
            bill = co.max_revenue_per_month_s * cfg.mpc_rate_pct
            charge = min(bill, max(0.0, co.s_balance))
            if charge <= 0:
                continue
            co.s_balance -= charge
            co.monthly_costs_s += charge
            state.s_supply_total -= charge   # S burned at Fisc
            txs.add(year, month, "lat_payment",
                    from_wallet=("company", co.id), to_wallet=("fisc", 0),
                    s_amount=charge, usdc_amount=0.0, fisc_rate=fisc_rate,
                    related_company_id=co.id, description="MPC")
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
            after_stax = cat_spend - tax
            primary.s_balance -= cat_spend
            primary.monthly_basket_spend_s += cat_spend
            if tax > 0:
                state.s_supply_total -= tax   # destroyed at Fisc
                txs.add(year, month, "s_tax_payment",
                        from_wallet=("citizen", primary.id), to_wallet=("fisc", 0),
                        s_amount=tax, usdc_amount=0.0, fisc_rate=fisc_rate,
                        related_company_id=supplier.id, description="purchase tax")
            # Apply three-layer levy on the post-S-tax amount
            gas_s, prot_s, auto_s, net_to_supplier = apply_levies(
                state, cfg, after_stax, supplier.profit_per_employee, "internal_purchase",
                fisc_rate, year, month,
                supplier_holder_type="company", supplier_holder_id=supplier.id
            )
            supplier.s_balance += net_to_supplier
            supplier.revenue_so_far_this_month_s += net_to_supplier
            supplier.monthly_revenue_s += net_to_supplier
            supplier.annual_revenue_accum += net_to_supplier
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
    # Levy applies — supplier is the external entity; pick a representative ExternalSupplier
    # by sector. Supplier's P/emp determines the automation levy.
    for co in state.companies:
        if co.closed_year is not None or co.monthly_import_usd_baseline <= 0:
            continue
        usd_out = co.monthly_import_usd_baseline
        s_required = usd_out / fisc_rate
        if co.s_balance < s_required:
            co.import_default_count += 1
            usd_actual = co.s_balance * fisc_rate
            gross = co.s_balance
            co.s_balance = 0.0
        else:
            usd_actual = usd_out
            gross = s_required
            co.s_balance -= gross
        if gross <= 0:
            continue
        # Pick external supplier and apply levies
        ext = pick_external_supplier_for_imports(state, co.sector)
        ext_p_per_emp = ext.profit_per_employee if ext else 100_000.0
        gas_s, prot_s, auto_s, net_to_supplier = apply_levies(
            state, cfg, gross, ext_p_per_emp, "import",
            fisc_rate, year, month,
            supplier_holder_type="external", supplier_holder_id=ext.id if ext else None
        )
        # Levy was already deducted from gross by apply_levies (S burned for automation,
        # routed for gas + protocol). The remaining net_to_supplier is the S that
        # actually buys the imports — converted to USDC and shipped externally.
        usdc_to_external = net_to_supplier * fisc_rate
        co.monthly_costs_s += gross
        co.annual_costs_accum += gross
        co.monthly_imports_usd += usdc_to_external
        state.s_supply_total -= net_to_supplier   # the supplier-net S is also burned (sent as USDC)
        state.fisc_usdc -= usdc_to_external
        txs.add(year, month, "import",
                from_wallet=("company", co.id), to_wallet=("external", 0),
                s_amount=net_to_supplier, usdc_amount=usdc_to_external, fisc_rate=fisc_rate,
                related_company_id=co.id,
                description=f"supplier={ext.name if ext else 'unknown'} levy_auto={auto_s:.2f}" if cfg.levy_enabled else "")
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

    # 14.5. Month-end processing for the levy mechanism

    # Accumulate annual profit per company (revenue - costs, pre-levy)
    for co in state.companies:
        if co.closed_year is None:
            co.annual_profit_accum += (co.monthly_revenue_s - co.monthly_costs_s)

    # MCC federal tax remittance — convert collected S to USDC, ship out
    mcc_remitted_usdc = 0.0
    if cfg.mcc_federal_tax_enabled and state.mcc_federal_collected_s > 0 and mcc is not None:
        # Convert from MCC's S balance to USDC at current rate, send to external
        s_to_remit = min(state.mcc_federal_collected_s, mcc.s_balance)
        usdc_remitted = s_to_remit * fisc_rate
        if state.fisc_usdc >= usdc_remitted:
            mcc.s_balance -= s_to_remit
            state.s_supply_total -= s_to_remit
            state.fisc_usdc -= usdc_remitted
            state.mcc_federal_remitted_usdc_ytd += usdc_remitted
            mcc_remitted_usdc = usdc_remitted
            txs.add(year, month, "mcc_federal_remittance",
                    from_wallet=("company", mcc.id), to_wallet=("external", 0),
                    s_amount=s_to_remit, usdc_amount=usdc_remitted, fisc_rate=fisc_rate,
                    description="federal tax remittance")

    # Year-end recalibration (Phase C) — runs at month 12 of each year
    if month == cfg.recalibration_month and cfg.levy_enabled:
        _recalibrate_levy(state, cfg, year, fisc_rate, fisc_states, citizen_snaps)

    # 15. Snapshots — append to the in-memory accumulators
    fisc_states.append((year, month, fisc_rate, state.fisc_usdc, state.s_supply_total,
                        sum(c.s_balance for c in state.citizens),
                        sum(co.s_balance for co in state.companies),
                        basket_usd, basket_cost_s,
                        (state.fisc_usdc / (state.s_supply_total * fisc_rate))
                            if (state.s_supply_total > 0 and fisc_rate > 0) else 0.0,
                        1 if rate_compressed else 0))

    # Monthly levy snapshot for /levy dashboard
    if cfg.levy_enabled:
        gas_usdc = state.levy_accum.monthly_gas_s * fisc_rate
        prot_usdc = state.levy_accum.monthly_protocol_s * fisc_rate
        cumulative_protocol_usdc = state.protocol_treasury_usdc + prot_usdc
        state.protocol_treasury_usdc = cumulative_protocol_usdc
        state.gas_pool_usdc += gas_usdc
        PROTOCOL_TREASURY_RECORDS.append((
            year, month, state.levy_accum.monthly_protocol_s, prot_usdc, cumulative_protocol_usdc
        ))
        GAS_POOL_RECORDS.append((year, month, state.levy_accum.monthly_gas_s, gas_usdc))
    if cfg.mcc_federal_tax_enabled and mcc_remitted_usdc > 0:
        MCC_FEDERAL_REMITTANCE_RECORDS.append((
            year, month, state.mcc_federal_collected_s, mcc_remitted_usdc, fisc_rate
        ))

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

    # Levy aggregate tables (Phase B/C/D)
    if PROTOCOL_TREASURY_RECORDS:
        cur.executemany("""
            INSERT INTO protocol_treasury (year, month, monthly_revenue_s, monthly_revenue_usdc,
                cumulative_revenue_usdc)
            VALUES (?, ?, ?, ?, ?)
        """, PROTOCOL_TREASURY_RECORDS)
    if GAS_POOL_RECORDS:
        cur.executemany("""
            INSERT INTO gas_pool (year, month, monthly_gas_s, monthly_gas_usdc)
            VALUES (?, ?, ?, ?)
        """, GAS_POOL_RECORDS)
    if LEVY_CALIBRATION_RECORDS:
        cur.executemany("""
            INSERT INTO levy_calibration (year, p_threshold, p_baseline, alpha, k,
                projected_annual_levy_revenue, projected_annual_ubi_obligation,
                actual_levy_revenue_prior_year, actual_ubi_obligation_prior_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, LEVY_CALIBRATION_RECORDS)
    if SUPPLIER_LEVY_RECORDS:
        cur.executemany("""
            INSERT INTO supplier_levy_summary (year, holder_type, holder_id, name, sector,
                profit_per_employee, automation_levy_s, automation_levy_usdc, transaction_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, SUPPLIER_LEVY_RECORDS)
    if MCC_FEDERAL_REMITTANCE_RECORDS:
        cur.executemany("""
            INSERT INTO mcc_federal_remittances (year, month, total_collected_s,
                total_remitted_usdc, fisc_rate_at_remittance)
            VALUES (?, ?, ?, ?, ?)
        """, MCC_FEDERAL_REMITTANCE_RECORDS)
    # Reset module-level accumulators so subsequent runs in the same process don't double-count
    PROTOCOL_TREASURY_RECORDS.clear()
    GAS_POOL_RECORDS.clear()
    LEVY_CALIBRATION_RECORDS.clear()
    SUPPLIER_LEVY_RECORDS.clear()
    MCC_FEDERAL_REMITTANCE_RECORDS.clear()

    # Update companies with their final profit_per_employee + employee_count
    for co in state.companies:
        cur.execute("""
            UPDATE companies SET profit_per_employee=?, profit_per_employee_year=?,
                annual_profit=?, employee_count=? WHERE id=?
        """, (co.profit_per_employee, 0, co.annual_profit_accum, co.employee_count, co.id))

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
