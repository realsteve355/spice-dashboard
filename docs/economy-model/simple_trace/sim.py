"""
Simple SPICE colony trace — callable form.

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
    {"name": "Dave's Co",      "external_rev_usd": 80_000, "p_per_emp": 200_000,
     "employees": 4, "b2b_import_usd": 15_000, "b2b_import_sector": "retail_online"},
    {"name": "Colony Café",    "external_rev_usd": 0,      "p_per_emp":  15_000,
     "employees": 3, "b2b_import_usd":  4_000, "b2b_import_sector": "grocery"},
    {"name": "FixIt Repair",   "external_rev_usd": 0,      "p_per_emp":  40_000,
     "employees": 2, "b2b_import_usd":  2_000, "b2b_import_sector": "misc"},
    {"name": "Hilltop School", "external_rev_usd": 0,      "p_per_emp":  30_000,
     "employees": 5, "b2b_import_usd":  3_000, "b2b_import_sector": "retail_online"},
    {"name": "MedClinic",      "external_rev_usd": 0,      "p_per_emp":  80_000,
     "employees": 3, "b2b_import_usd":  6_000, "b2b_import_sector": "healthcare"},
]

DEFAULT_EXTERNAL_SUPPLIERS = [
    ("grocery",       "Walmart",                  18_000),
    ("grocery",       "Kroger",                   20_000),
    ("grocery",       "Costco",                   45_000),
    ("restaurant",    "McDonald's",               30_000),
    ("restaurant",    "Chipotle",                 38_000),
    ("restaurant",    "Local Diner",              22_000),
    ("utility",       "AEP Energy",              240_000),
    ("utility",       "Verizon",                 280_000),
    ("utility",       "Comcast",                 240_000),
    ("retail_online", "Amazon",                  180_000),
    ("retail_online", "Target",                   25_000),
    ("retail_online", "Best Buy",                 28_000),
    ("healthcare",    "Hospital",                100_000),
    ("healthcare",    "Pharmacy",                 22_000),
    ("healthcare",    "Specialist Clinic",       150_000),
    ("entertainment", "Netflix",                 400_000),
    ("entertainment", "Disney+",                 220_000),
    ("transport",     "Uber",                    140_000),
    ("transport",     "Local Gas Station",        50_000),
    ("professional",  "Law Firm (AI-heavy)",     400_000),
    ("professional",  "Accounting Co",           120_000),
    ("handmade",      "Furniture Maker",          50_000),
    ("handmade",      "Craft Bakery",             40_000),
    ("misc",          "Hardware Store",           35_000),
    ("misc",          "Pet Supplies",             45_000),
]

DEFAULT_SECTOR_SPEND_PATTERN = [
    ("grocery",       0.30,  6),
    ("restaurant",    0.10,  4),
    ("utility",       0.12,  3),
    ("retail_online", 0.18,  4),
    ("healthcare",    0.08,  2),
    ("entertainment", 0.04,  1),
    ("transport",     0.06,  3),
    ("professional",  0.03,  1),
    ("handmade",      0.02,  1),
    ("misc",          0.07,  2),
]

DEFAULT_INTERNAL_SECTOR_PATTERN = [
    ("Colony Café",    0.04, 6),
    ("FixIt Repair",   0.02, 1),
    ("Hilltop School", 0.05, 1),
    ("MedClinic",      0.03, 1),
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
    for sector, name, p_emp in external_suppliers:
        suppliers_by_sector[sector].append((name, p_emp))

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
                supplier_name, p_emp = sector_suppliers[i % len(sector_suppliers)]
                txs.append(Transaction(
                    family_id=f.family_id, sector=sector,
                    supplier_name=supplier_name, supplier_p_per_emp=p_emp,
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
                    supplier_kind="local", buyer_kind="family",
                    gross_usd=tx_amount,
                ))

    # Stream C: local company -> external (B2B imports)
    for co in local_companies:
        if co["b2b_import_usd"] <= 0: continue
        sector = co["b2b_import_sector"]
        sector_suppliers = suppliers_by_sector.get(sector, [])
        if not sector_suppliers: continue
        supplier_name, p_emp = sector_suppliers[0]
        txs.append(Transaction(
            family_id=0, sector=sector,
            supplier_name=supplier_name, supplier_p_per_emp=p_emp,
            supplier_kind="external", buyer_kind="local_company",
            gross_usd=co["b2b_import_usd"],
        ))

    return txs


def levy_rate_for(p_per_emp, a, formula, max_rate):
    """Compute the per-dollar levy rate for a supplier given P/employee."""
    if formula == "linear":
        return a * p_per_emp
    elif formula == "asymptotic":
        # rate = max_rate * (1 - exp(-P/scale))
        # `a` plays the role of 1/scale here (smaller a -> longer ramp)
        if a <= 0: return 0
        return max_rate * (1 - math.exp(-a * p_per_emp))
    return 0


def run(config: dict | None = None) -> dict:
    """Run one month of simulation, returning all data as JSON-serialisable dict."""
    cfg = {
        "basket_usd": 980.0,
        "ubi_multiplier": 1.10,           # UBI = basket * this
        "external_spend_fraction": 0.66,
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
        ubi_usd, cfg["external_spend_fraction"]
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

    # Calibrate `a`. Linear: a = total_UBI / Σ(V × P). Asymptotic: solve numerically.
    if total_v_x_p > 0:
        if cfg["levy_formula"] == "linear":
            a = total_ubi / total_v_x_p
        else:
            # asymptotic: rate = max_rate * (1 - exp(-a * P))
            # Solve for a such that sum(rate(P_i) * V_i) = total_ubi
            # Use bisection over a.
            def total_levy(a_):
                return sum(
                    t.gross_usd * cfg["levy_cap_rate"] * (1 - math.exp(-a_ * t.supplier_p_per_emp))
                    for t in txs
                )
            lo, hi = 1e-9, 1e-2
            target = total_ubi
            for _ in range(60):
                mid = (lo + hi) / 2
                if total_levy(mid) < target:
                    lo = mid
                else:
                    hi = mid
            a = (lo + hi) / 2
    else:
        a = 0

    # Apply levies (with cap)
    per_supplier = defaultdict(lambda: {
        "n": 0, "gross": 0.0, "automation_levy": 0.0,
        "gas_levy": 0.0, "protocol_levy": 0.0,
        "shortfall": 0.0, "p_emp": 0.0, "kind": "external",
    })
    total_auto = 0.0
    total_gas = 0.0
    total_protocol = 0.0
    total_shortfall = 0.0
    cap = cfg["levy_cap_rate"]

    for t in txs:
        s = per_supplier[t.supplier_name]
        s["n"] += 1
        s["gross"] += t.gross_usd
        s["p_emp"] = t.supplier_p_per_emp
        s["kind"] = t.supplier_kind

        gas = cfg["gas_levy_usd"]
        protocol = t.gross_usd * cfg["protocol_rate"]
        rate = levy_rate_for(t.supplier_p_per_emp, a, cfg["levy_formula"], cap)
        intended_auto = t.gross_usd * rate
        room = max(0, t.gross_usd * cap - gas - protocol)
        actual_auto = min(intended_auto, room)
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

    # Stream summary
    fam_to_ext = [t for t in txs if t.buyer_kind == "family" and t.supplier_kind == "external"]
    fam_to_local = [t for t in txs if t.buyer_kind == "family" and t.supplier_kind == "local"]
    co_to_ext = [t for t in txs if t.buyer_kind == "local_company" and t.supplier_kind == "external"]

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
        },
        "suppliers": [
            {
                "name": name,
                "kind": s["kind"],
                "p_per_emp": s["p_emp"],
                "implied_rate_pct": levy_rate_for(s["p_emp"], a, cfg["levy_formula"], cap) * 100,
                "n_tx": s["n"],
                "gross": s["gross"],
                "automation_levy": s["automation_levy"],
                "actual_rate_pct": (s["automation_levy"] / s["gross"] * 100) if s["gross"] > 0 else 0,
                "gas_levy": s["gas_levy"],
                "protocol_levy": s["protocol_levy"],
                "net_to_supplier": s["gross"] - s["automation_levy"] - s["protocol_levy"] - s["gas_levy"],
                "shortfall": s["shortfall"],
                "is_broken": levy_rate_for(s["p_emp"], a, cfg["levy_formula"], cap) > 1.0,
            }
            for name, s in per_supplier.items()
        ],
        "budget": {
            "ubi_obligation": total_ubi,
            "automation_collected": total_auto,
            "shortfall": total_shortfall,
            "shortfall_pct": (total_shortfall / total_ubi * 100) if total_ubi > 0 else 0,
            "gas_pool": total_gas,
            "protocol_treasury": total_protocol,
            "broken_suppliers": [
                {"name": s["name"], "rate_pct": s["implied_rate_pct"]}
                for s in (
                    {"name": name, "implied_rate_pct": levy_rate_for(d["p_emp"], a, cfg["levy_formula"], cap) * 100}
                    for name, d in per_supplier.items()
                )
                if s["implied_rate_pct"] > 100
            ],
        },
    }


if __name__ == "__main__":
    import json
    import sys
    result = run()
    json.dump(result, sys.stdout, indent=2, default=str)
