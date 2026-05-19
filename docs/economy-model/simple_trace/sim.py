"""
Simple AXION colony trace — callable form.

Importable as `sim.run(config)` returning structured results dict suitable
for JSON serialisation. The same logic prints to stdout when invoked via
`scaled_trace.py` for hand-traceable terminal output.

Three transaction streams are levied (per Steve's destination-principle):
  A) family -> external supplier
  B) family -> local company
  C) local company -> external supplier
External-customer -> local-company is NOT levied (the destination's Fisc gets it).
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Tuple
from collections import defaultdict
import math


# ── Defaults ─────────────────────────────────────────────────────────────────

DEFAULT_FAMILY_TYPES = [
    # (count, label, working, retired, workless, children, salary_each, pension_each)
    (4, "single workless",            0, 0, 1, 0,    0,        0),
    (3, "single retired",             0, 1, 0, 0,    0,    1_200),
    (3, "retired couple",             0, 2, 0, 0,    0,    1_000),
    (3, "single worker",              1, 0, 0, 0, 4_000,        0),
    (2, "couple, both working",       2, 0, 0, 0, 4_000,        0),
    (1, "Dave's family (founder)",    2, 0, 0, 2, 6_000,        0),
    (4, "family-with-kids, 1 earner", 1, 0, 1, 2, 4_000,        0),
]

DEFAULT_LOCAL_COMPANIES = [
    # external_rev_usd is NOT levied (visitor or export revenue arriving as USDC).
    # Internal revenue (from colony families) IS levied at the company's p_per_emp rate.
    # Headcount + salaries are now realistic for a small US business serving 40 colony
    # residents PLUS visiting external customers (per Steve's "café packed with locals
    # AND visitors").
    {"name": "Dave's Co",      "external_rev_usd": 80_000, "p_per_emp": 200_000,
     "margin_pct": 35.0,  # SaaS-like — high margin
     "employees": 4, "b2b_import_usd": 15_000, "b2b_import_sector": "retail_online"},
    # Colony Café: 2 FT + 3 PT = 5 employees. Per Steve: high proportion of revenue
    # from visitors (truckers, salesmen, business visitors, tourists). $30K visitor, ~$6-8K local.
    {"name": "Colony Café",    "external_rev_usd": 30_000, "p_per_emp":  15_000,
     "margin_pct":  8.0,  # small café typical
     "employees": 5, "b2b_import_usd":  6_000, "b2b_import_sector": "grocery"},
    # FixIt Repair: 2 employees. Some pass-through visitor traffic (per Steve).
    {"name": "FixIt Repair",   "external_rev_usd":  3_000, "p_per_emp":  40_000,
     "margin_pct": 15.0,  # small workshop
     "employees": 2, "b2b_import_usd":  2_500, "b2b_import_sector": "misc"},
    # Hilltop School: 2 teachers (small colony has only 5 family-with-kids = ~10 kids).
    # No visitor revenue per Steve — schools are exclusively local.
    {"name": "Hilltop School", "external_rev_usd":      0, "p_per_emp":  30_000,
     "margin_pct":  5.0,  # private school typical
     "employees": 2, "b2b_import_usd":  4_000, "b2b_import_sector": "retail_online"},
    # MedClinic: 3 employees. A little visitor revenue per Steve (occasional walk-ins).
    {"name": "MedClinic",      "external_rev_usd":  2_000, "p_per_emp":  80_000,
     "margin_pct": 12.0,  # small clinic
     "employees": 3, "b2b_import_usd":  8_000, "b2b_import_sector": "healthcare"},
]

DEFAULT_EXTERNAL_SUPPLIERS = [
    # (sector, name, P/emp $, net margin %).
    # Margins are real-world 10-K filings 2023-2024 where available; small/private
    # firms estimated from industry benchmarks. Slim margins in retail/grocery/utility
    # are a HARD CONSTRAINT — applying any meaningful levy here would put them
    # under water (Walmart at 2% margin can't pay a 30% levy on revenue).
    ("grocery",       "Walmart",                  18_000,  2.0),
    ("grocery",       "Kroger",                   20_000,  1.5),
    ("grocery",       "Costco",                   45_000,  2.5),
    ("restaurant",    "McDonald's",               30_000, 31.0),  # high — franchise model
    ("restaurant",    "Chipotle",                 38_000, 13.0),
    ("restaurant",    "Local Diner",              22_000,  3.0),
    ("utility",       "AEP Energy",              240_000, 14.0),
    ("utility",       "Verizon",                 280_000, 15.0),
    ("utility",       "Comcast",                 240_000, 13.0),
    ("retail_online", "Amazon",                  180_000,  6.0),
    ("retail_online", "Target",                   25_000,  4.0),
    ("retail_online", "Best Buy",                 28_000,  3.0),
    ("healthcare",    "Hospital",                100_000,  4.0),
    ("healthcare",    "Pharmacy",                 22_000,  3.0),
    ("healthcare",    "Specialist Clinic",       150_000, 10.0),
    ("entertainment", "Netflix",                 400_000, 16.0),
    ("entertainment", "Disney+",                 220_000,  7.0),
    ("transport",     "Uber",                    140_000,  5.0),
    ("transport",     "Local Gas Station",        50_000,  3.0),
    ("professional",  "Law Firm (AI-heavy)",     400_000, 30.0),  # high — AI cuts costs
    ("professional",  "Accounting Co",           120_000, 15.0),
    ("handmade",      "Furniture Maker",          50_000,  8.0),
    ("handmade",      "Craft Bakery",             40_000, 10.0),
    ("misc",          "Hardware Store",           35_000,  5.0),
    ("misc",          "Pet Supplies",             45_000,  8.0),
]

# Sector spend pattern: % of family external spend, # transactions/family/month.
# Calibrated for realistic Amazon-era US household — many small online orders,
# more restaurant visits, more frequent utility bills (split across providers).
DEFAULT_SECTOR_SPEND_PATTERN = [
    # (sector, %_of_external_spend, #txs/family/month)
    ("grocery",       0.28,  6),   # 6 trips × $150 ≈ $900
    ("restaurant",    0.12, 12),   # 12 visits × ~$30 — mix of fast food + sit-down
    ("utility",       0.12,  6),   # 6 bills (electric, gas, water, internet, mobile, cable) × ~$60
    ("retail_online", 0.18, 10),   # Amazon-era — many small orders
    ("healthcare",    0.06,  2),
    ("entertainment", 0.04,  4),   # Netflix + Disney+ + Spotify + 1 ad-hoc
    ("transport",     0.08,  8),   # gas fills + Uber rides
    ("professional",  0.02,  1),
    ("handmade",      0.02,  1),
    ("misc",          0.08,  5),   # hardware store, pet supplies, etc.
]

# Internal sector pattern: % of family income spent at each local colony company.
# Higher than before — Steve's note that local cafés get heavy local + visitor traffic
# means the local economy carries more weight in family budgets than the previous trace.
DEFAULT_INTERNAL_SECTOR_PATTERN = [
    # (local_co, %_of_family_income, #txs/family/month)
    ("Colony Café",    0.06, 12),  # ~6% of income, 12 visits — coffee + lunch
    ("FixIt Repair",   0.02,  1),
    ("Hilltop School", 0.20,  1),  # 20% of income for families with kids (private tuition equiv)
    ("MedClinic",      0.04,  1),
]


# ── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class Family:
    family_id: int
    label: str
    adults_working: int
    adults_retired: int
    adults_workless: int
    children: int
    salary_each_usd: float
    pension_each_usd: float

    @property
    def total_members(self):
        return self.adults_working + self.adults_retired + self.adults_workless + self.children

    def monthly_ubi(self, ubi_usd):
        # UBI is unconditional in AXION. Every citizen gets the same amount.
        # No taper, no means-testing — work pays in full as upside above UBI.
        return self.total_members * ubi_usd

    def monthly_salary(self):
        return self.adults_working * self.salary_each_usd

    def monthly_pension(self):
        return self.adults_retired * self.pension_each_usd

    def monthly_income(self, ubi_usd):
        return self.monthly_ubi(ubi_usd) + self.monthly_salary() + self.monthly_pension()


@dataclass
class Transaction:
    family_id: int
    sector: str
    supplier_name: str
    supplier_p_per_emp: float
    supplier_margin_pct: float
    supplier_kind: str
    buyer_kind: str
    gross_usd: float


# ── Core logic ───────────────────────────────────────────────────────────────

def build_families(family_types) -> List[Family]:
    families = []
    fid = 0
    for (count, label, w, r, wo, k, salary, pension) in family_types:
        for _ in range(count):
            fid += 1
            families.append(Family(fid, label, w, r, wo, k, salary, pension))
    return families


def generate_transactions(families, local_companies, external_suppliers,
                          sector_spend_pattern, internal_sector_pattern,
                          ubi_usd, external_spend_fraction):
    txs = []
    suppliers_by_sector = defaultdict(list)
    for sector, name, p_emp, margin in external_suppliers:
        suppliers_by_sector[sector].append((name, p_emp, margin))

    # Stream A: family -> external
    for f in families:
        external_budget = f.monthly_income(ubi_usd) * external_spend_fraction
        for sector, share, n_tx in sector_spend_pattern:
            if n_tx <= 0: continue
            sector_budget = external_budget * share
            tx_amount = sector_budget / n_tx
            sector_suppliers = suppliers_by_sector.get(sector, [])
            if not sector_suppliers: continue
            for i in range(n_tx):
                supplier_name, p_emp, margin = sector_suppliers[i % len(sector_suppliers)]
                txs.append(Transaction(
                    family_id=f.family_id, sector=sector,
                    supplier_name=supplier_name, supplier_p_per_emp=p_emp,
                    supplier_margin_pct=margin,
                    supplier_kind="external", buyer_kind="family",
                    gross_usd=tx_amount,
                ))

    # Stream B: family -> local company (internal commerce)
    local_co_by_name = {co["name"]: co for co in local_companies}
    for f in families:
        for co_name, share, n_tx in internal_sector_pattern:
            if co_name not in local_co_by_name: continue
            if co_name == "Hilltop School" and f.children == 0: continue
            if n_tx <= 0: continue
            sector_budget = f.monthly_income(ubi_usd) * share
            tx_amount = sector_budget / n_tx
            co = local_co_by_name[co_name]
            for _ in range(n_tx):
                txs.append(Transaction(
                    family_id=f.family_id, sector="internal",
                    supplier_name=co_name, supplier_p_per_emp=co["p_per_emp"],
                    supplier_margin_pct=co.get("margin_pct", 10.0),
                    supplier_kind="local", buyer_kind="family",
                    gross_usd=tx_amount,
                ))

    # Stream C: local company -> external (B2B imports)
    for co in local_companies:
        if co["b2b_import_usd"] <= 0: continue
        sector = co["b2b_import_sector"]
        sector_suppliers = suppliers_by_sector.get(sector, [])
        if not sector_suppliers: continue
        supplier_name, p_emp, margin = sector_suppliers[0]
        txs.append(Transaction(
            family_id=0, sector=sector,
            supplier_name=supplier_name, supplier_p_per_emp=p_emp,
            supplier_margin_pct=margin,
            supplier_kind="external", buyer_kind="local_company",
            gross_usd=co["b2b_import_usd"],
        ))

    return txs


def profit_capture_for(p_per_emp, a, formula, max_capture):
    """Compute the fraction of a supplier's PROFIT that the levy captures.

    Returns a number in [0, max_capture]. The levy on a transaction is then:
        levy_$ = capture × margin × gross
    so it can never exceed the supplier's profit on that sale.

    `linear`:    capture = a × P/emp,  capped at max_capture.
    `asymptotic`: capture = max_capture × (1 − exp(−a × P/emp));
                  always < max_capture, smoother roll-on for low-P/emp firms.
    """
    if formula == "linear":
        return min(max_capture, a * p_per_emp)
    elif formula == "asymptotic":
        if a <= 0: return 0
        return max_capture * (1 - math.exp(-a * p_per_emp))
    return 0


def run(config: dict | None = None) -> dict:
    """Run one month of simulation, returning all data as JSON-serialisable dict."""
    cfg = {
        "basket_usd": 980.0,
        "ubi_multiplier": 1.10,           # UBI = basket * this
        "external_spend_fraction": 0.55,  # was 0.66; lower because internal share grew
        "levy_cap_rate": 0.80,
        "levy_formula": "linear",         # 'linear' or 'asymptotic'
        "gas_levy_usd": 0.005,
        "protocol_rate": 0.001,
        "fisc_rate": 35.00,
        # Mutable lists
        "family_types": DEFAULT_FAMILY_TYPES,
        "local_companies": DEFAULT_LOCAL_COMPANIES,
        "external_suppliers": DEFAULT_EXTERNAL_SUPPLIERS,
        "sector_spend_pattern": DEFAULT_SECTOR_SPEND_PATTERN,
        "internal_sector_pattern": DEFAULT_INTERNAL_SECTOR_PATTERN,
    }
    if config:
        cfg.update(config)

    ubi_usd = cfg["basket_usd"] * cfg["ubi_multiplier"]

    families = build_families(cfg["family_types"])
    txs = generate_transactions(
        families, cfg["local_companies"], cfg["external_suppliers"],
        cfg["sector_spend_pattern"], cfg["internal_sector_pattern"],
        ubi_usd, cfg["external_spend_fraction"],
    )

    # Population summary
    n_citizens = sum(f.total_members for f in families)
    n_working = sum(f.adults_working for f in families)
    n_retired = sum(f.adults_retired for f in families)
    n_workless = sum(f.adults_workless for f in families)
    n_children = sum(f.children for f in families)

    # Income
    total_ubi = sum(f.monthly_ubi(ubi_usd) for f in families)
    total_salary = sum(f.monthly_salary() for f in families)
    total_pension = sum(f.monthly_pension() for f in families)
    total_income = total_ubi + total_salary + total_pension

    # Transaction volume
    n_txs = len(txs)
    total_gross = sum(t.gross_usd for t in txs)
    total_v_x_p = sum(t.gross_usd * t.supplier_p_per_emp for t in txs)
    # Total pre-levy profit available for the levy to draw on. THIS is the
    # constraint — Marysville's Fisc can only fund UBI from internal commerce
    # profits (Streams A+B+C). Visitor revenue at local cos is NOT levied here
    # (destination principle).
    total_profit_pool = sum(t.gross_usd * t.supplier_margin_pct / 100 for t in txs)

    # Calibrate `a` so total profit captured = total UBI.
    #   Linear:     a × Σ(P/emp × margin × gross) = UBI
    #   Asymptotic: solve numerically.
    # `a` is interpreted differently from before — it scales how aggressively
    # capture-rate climbs with P/emp. The capture is BOUNDED at max_capture
    # (= levy_cap_rate config), so we cannot extract more than that fraction
    # of any supplier's profit no matter how high P/emp goes.
    profit_weighted_p = sum(
        t.supplier_p_per_emp * t.supplier_margin_pct / 100 * t.gross_usd
        for t in txs
    )
    cap = cfg["levy_cap_rate"]

    if profit_weighted_p > 0:
        if cfg["levy_formula"] == "linear":
            # Naïve linear a = UBI / Σ(P/emp × margin × gross).
            # If this gives capture > cap for some supplier, those caps will
            # bite during application and the shortfall surfaces in the budget.
            a = total_ubi / profit_weighted_p
        else:
            # Asymptotic: capture = cap × (1 − exp(−a × P/emp))
            # Solve for a such that Σ capture × margin × gross = total_ubi.
            def total_capture(a_):
                return sum(
                    t.gross_usd * (t.supplier_margin_pct / 100)
                    * cap * (1 - math.exp(-a_ * t.supplier_p_per_emp))
                    for t in txs
                )
            lo, hi = 1e-9, 1e-2
            for _ in range(60):
                mid = (lo + hi) / 2
                if total_capture(mid) < total_ubi:
                    lo = mid
                else:
                    hi = mid
            a = (lo + hi) / 2
            # If even maximum capture (cap × profit pool) < UBI, the formula
            # has no solution — `a` will pin to `hi` and shortfall appears.
    else:
        a = 0

    # Apply levies. Under Option A:
    #   profit         = margin × gross  (pre-levy)
    #   intended_auto  = capture(P/emp) × profit
    #   room_left      = profit − gas − protocol
    #   actual_auto    = min(intended_auto, room_left)
    # The supplier ALWAYS retains (1 − total_levies/profit) of their profit;
    # they can never go underwater on a sale (unless gas+protocol alone
    # exceed their profit, which is rare and signals an unsustainable supplier).
    per_supplier = defaultdict(lambda: {
        "n": 0, "gross": 0.0, "automation_levy": 0.0,
        "gas_levy": 0.0, "protocol_levy": 0.0,
        "shortfall": 0.0, "p_emp": 0.0, "margin_pct": 0.0,
        "kind": "external",
    })
    total_auto = 0.0
    total_gas = 0.0
    total_protocol = 0.0
    total_shortfall = 0.0

    for t in txs:
        s = per_supplier[t.supplier_name]
        s["n"] += 1
        s["gross"] += t.gross_usd
        s["p_emp"] = t.supplier_p_per_emp
        s["margin_pct"] = t.supplier_margin_pct
        s["kind"] = t.supplier_kind

        gas = cfg["gas_levy_usd"]
        protocol = t.gross_usd * cfg["protocol_rate"]
        margin_dec = t.supplier_margin_pct / 100
        profit = t.gross_usd * margin_dec

        # `capture` is already capped at max_capture. To detect if we WOULD have
        # taken more from this supplier given more capacity, also compute the
        # uncapped capture for the shortfall diagnostic.
        capture = profit_capture_for(t.supplier_p_per_emp, a, cfg["levy_formula"], cap)
        intended_auto = capture * profit
        room_left = max(0.0, profit - gas - protocol)
        actual_auto = min(intended_auto, room_left)
        # Shortfall on this transaction = capture cap reached (we'd extract more if allowed)
        # PLUS room ran out (gas+protocol crowded out automation levy on a thin-margin sale).
        shortfall = intended_auto - actual_auto

        s["gas_levy"] += gas
        s["protocol_levy"] += protocol
        s["automation_levy"] += actual_auto
        s["shortfall"] += shortfall

        total_gas += gas
        total_protocol += protocol
        total_auto += actual_auto
        total_shortfall += shortfall

    # Per-family-type aggregate
    by_type = defaultdict(lambda: {"n_families": 0, "total_income": 0,
                                    "total_external_spend": 0, "members": 0})
    for f in families:
        bt = by_type[f.label]
        bt["n_families"] += 1
        bt["members"] += f.total_members
        bt["total_income"] += f.monthly_income(ubi_usd)
        bt["total_external_spend"] += f.monthly_income(ubi_usd) * cfg["external_spend_fraction"]
        bt["total_ubi_paid"] = bt.get("total_ubi_paid", 0) + f.monthly_ubi(ubi_usd)
        bt["total_salary"] = bt.get("total_salary", 0) + f.monthly_salary()
        bt["total_pension"] = bt.get("total_pension", 0) + f.monthly_pension()

    # Stream summary
    fam_to_ext = [t for t in txs if t.buyer_kind == "family" and t.supplier_kind == "external"]
    fam_to_local = [t for t in txs if t.buyer_kind == "family" and t.supplier_kind == "local"]
    co_to_ext = [t for t in txs if t.buyer_kind == "local_company" and t.supplier_kind == "external"]

    # Local-company viability (per-employee revenue check)
    local_co_summary = []
    for co in cfg["local_companies"]:
        s = per_supplier.get(co["name"], {"n": 0, "gross": 0.0})
        internal_rev_usd = s["gross"]                  # from family-to-local txs
        external_rev_usd = co["external_rev_usd"]      # visitors / exports (NOT levied)
        total_rev_usd = internal_rev_usd + external_rev_usd
        per_emp_per_year = (total_rev_usd * 12) / co["employees"] if co["employees"] > 0 else 0
        local_co_summary.append({
            "name": co["name"],
            "employees": co["employees"],
            "internal_rev_usd": internal_rev_usd,
            "external_rev_usd": external_rev_usd,
            "total_rev_usd": total_rev_usd,
            "rev_per_employee_yr": per_emp_per_year,
            "b2b_import_usd": co["b2b_import_usd"],
        })

    total_visitor_revenue_usd = sum(co["external_rev_usd"] for co in cfg["local_companies"])

    # Build output
    return {
        "config": {**cfg, "ubi_usd": ubi_usd, "a": a},
        "population": {
            "n_citizens": n_citizens,
            "n_families": len(families),
            "n_working": n_working,
            "n_retired": n_retired,
            "n_workless": n_workless,
            "n_children": n_children,
        },
        "income": {
            "total_ubi": total_ubi,
            "total_salary": total_salary,
            "total_pension": total_pension,
            "total_income": total_income,
            "ubi_usd_per_citizen": ubi_usd,
        },
        "by_family_type": [
            {
                "label": label,
                "n_families": d["n_families"],
                "members": d["members"],
                "avg_income_per_family": d["total_income"] / d["n_families"],
                "avg_external_spend_per_family": d["total_external_spend"] / d["n_families"],
                "avg_ubi_per_family": d.get("total_ubi_paid", 0) / d["n_families"],
                "avg_salary_per_family": d.get("total_salary", 0) / d["n_families"],
                "avg_pension_per_family": d.get("total_pension", 0) / d["n_families"],
            }
            for label, d in by_type.items()
        ],
        "streams": {
            "family_to_external": {
                "n": len(fam_to_ext),
                "gross": sum(t.gross_usd for t in fam_to_ext),
                "v_x_p": sum(t.gross_usd * t.supplier_p_per_emp for t in fam_to_ext),
            },
            "family_to_local": {
                "n": len(fam_to_local),
                "gross": sum(t.gross_usd for t in fam_to_local),
                "v_x_p": sum(t.gross_usd * t.supplier_p_per_emp for t in fam_to_local),
            },
            "local_to_external_b2b": {
                "n": len(co_to_ext),
                "gross": sum(t.gross_usd for t in co_to_ext),
                "v_x_p": sum(t.gross_usd * t.supplier_p_per_emp for t in co_to_ext),
            },
        },
        "transactions": {
            "total_n": n_txs,
            "total_gross": total_gross,
            "total_v_x_p": total_v_x_p,
            "avg_p_per_emp_weighted": total_v_x_p / max(1, total_gross),
            "txs_per_family": n_txs / max(1, len(families)),
        },
        "local_companies": local_co_summary,
        "visitor_revenue_total_usd": total_visitor_revenue_usd,
        "suppliers": [
            {
                "name": name,
                "kind": s["kind"],
                "p_per_emp": s["p_emp"],
                "margin_pct": s["margin_pct"],
                "profit_usd": s["gross"] * s["margin_pct"] / 100,
                # Profit capture rate (the f in Option A): % of profit captured
                "capture_pct": profit_capture_for(s["p_emp"], a, cfg["levy_formula"], cap) * 100,
                # The net rate on revenue the supplier sees on their bill
                "actual_rate_pct": (s["automation_levy"] / s["gross"] * 100) if s["gross"] > 0 else 0,
                # Should be False under Option A by construction
                "exceeds_margin": (s["automation_levy"] / s["gross"] * 100) > s["margin_pct"] if s["gross"] > 0 else False,
                "n_tx": s["n"],
                "gross": s["gross"],
                "automation_levy": s["automation_levy"],
                "gas_levy": s["gas_levy"],
                "protocol_levy": s["protocol_levy"],
                "net_to_supplier": s["gross"] - s["automation_levy"] - s["protocol_levy"] - s["gas_levy"],
                "post_levy_profit_usd": s["gross"] * s["margin_pct"] / 100 - s["automation_levy"] - s["gas_levy"] - s["protocol_levy"],
                "shortfall": s["shortfall"],
                # 'broken' under Option A means cap was reached AND profit pool insufficient
                "is_broken": profit_capture_for(s["p_emp"], a, cfg["levy_formula"], cap) >= cap and s["shortfall"] > 0.01,
            }
            for name, s in per_supplier.items()
        ],
        "budget": {
            "ubi_obligation": total_ubi,
            "automation_collected": total_auto,
            # Funding gap = what UBI needs minus what the levy can extract.
            # This is the structural deficit the colony has to plug from
            # somewhere else (reserves, minting, LAT, etc.).
            "funding_gap": max(0.0, total_ubi - total_auto),
            "funding_gap_pct": (max(0.0, total_ubi - total_auto) / total_ubi * 100) if total_ubi > 0 else 0,
            # Per-supplier shortfall = sum of (intended − actual) across all txs.
            # Distinct from funding_gap above. Non-zero when cap was binding or
            # gas+protocol crowded out the automation levy.
            "per_tx_shortfall": total_shortfall,
            "gas_pool": total_gas,
            "protocol_treasury": total_protocol,
            "total_profit_pool": total_profit_pool,
            "max_capturable": total_profit_pool * cap,
            # Suppliers at the capture cap — would cede more profit if cap allowed
            "capped_suppliers": [
                {"name": name,
                 "capture_pct": profit_capture_for(d["p_emp"], a, cfg["levy_formula"], cap) * 100}
                for name, d in per_supplier.items()
                if profit_capture_for(d["p_emp"], a, cfg["levy_formula"], cap) >= cap - 1e-9
                   and d["n"] > 0
            ],
        },
    }


if __name__ == "__main__":
    import json
    import sys
    result = run()
    json.dump(result, sys.stdout, indent=2, default=str)
