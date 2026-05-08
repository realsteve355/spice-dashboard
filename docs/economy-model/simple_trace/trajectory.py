"""
Trajectory sim — iterate simple_trace's per-month sim over N years
while automation progresses.

Three-phase model:
  - Implementation (no payouts): reserves accumulate, building infrastructure
  - Welfare (M1 onward): SPICE replaces State welfare for colony residents,
                         cost-neutral to the State, means-tested as today
  - Full UBI (M2 onward): universal payment to every citizen at target level

Two milestones detected on the trajectory:
  M1 = first year levy can fund the welfare obligation
  M2 = first year levy can fund full UBI for every citizen

Annual snapshots (20 data points for a 20-year window).
"""
from __future__ import annotations
from copy import deepcopy
from sim import (
    run as run_one_month,
    DEFAULT_FAMILY_TYPES,
    DEFAULT_LOCAL_COMPANIES,
    DEFAULT_EXTERNAL_SUPPLIERS,
    DEFAULT_SECTOR_SPEND_PATTERN,
    DEFAULT_INTERNAL_SECTOR_PATTERN,
)


# Existing-State welfare cost per family per month (rough US 2026 baseline).
# This is what the State currently pays for these residents — SPICE takes over
# at Milestone 1 and pays the SAME amounts cost-neutral to the State.
#   - single workless:  SSI ($700) + SNAP ($200) ≈ $900
#   - single retired:   small SNAP supplement on top of pension ≈ $200
#   - retired couple:   SNAP + SSA supplement (low pension) ≈ $500
#   - single worker:    minimal at $4K income; small SNAP ≈ $50
#   - couple working:   $0 (income too high)
#   - Dave's family:    $0 (income too high)
#   - family-with-kids: SNAP ($500) + EITC ($300) + CTC ($300) ≈ $1,100
DEFAULT_WELFARE_PER_FAMILY = {
    "single workless":              900,
    "single retired":               200,
    "retired couple":               500,
    "single worker":                 50,
    "couple, both working":           0,
    "Dave's family (founder)":        0,
    "family-with-kids, 1 earner": 1_100,
}


def welfare_obligation(family_types, welfare_table):
    """Sum the State welfare cost for these residents."""
    total = 0.0
    for fam in family_types:
        count, label = fam[0], fam[1]
        total += count * welfare_table.get(label, 0)
    return total


def run(config: dict | None = None) -> dict:
    cfg = {
        "years": 20,
        "start_year": 2026,
        "basket_decline_pct": 5.0,        # % per year basket cost falls
        "salary_decline_pct": 3.0,        # % per year salaries decline (AI wage pressure)
        "p_emp_growth_pct": 5.0,          # % per year supplier P/emp rises
        "welfare_growth_pct": 1.0,        # % per year welfare obligation grows (more displacement)
        "ubi_multiplier": 1.10,           # held constant — UBI = basket × this
        "external_spend_fraction": 0.55,
        "levy_cap_rate": 0.80,
        "levy_formula": "linear",
        "welfare_per_family": DEFAULT_WELFARE_PER_FAMILY,
    }
    if config:
        cfg.update(config)

    years = cfg["years"]
    basket_factor   = lambda y: (1 - cfg["basket_decline_pct"]  / 100) ** y
    salary_factor   = lambda y: (1 - cfg["salary_decline_pct"]  / 100) ** y
    p_emp_factor    = lambda y: (1 + cfg["p_emp_growth_pct"]   / 100) ** y
    welfare_factor  = lambda y: (1 + cfg["welfare_growth_pct"] / 100) ** y

    snapshots = []
    crossover_year = None

    for y in range(years + 1):
        # Decay salaries year-on-year (AI wage pressure on workers)
        family_types = []
        for (count, label, w, r, wo, k, salary, pension) in DEFAULT_FAMILY_TYPES:
            family_types.append((count, label, w, r, wo, k,
                                 salary * salary_factor(y), pension))

        # Grow P/emp on external suppliers (automation makes them more profitable
        # per worker — this is the mechanism that grows the colony's profit pool)
        external_suppliers = []
        for (sector, name, p_emp, margin) in DEFAULT_EXTERNAL_SUPPLIERS:
            external_suppliers.append(
                (sector, name, p_emp * p_emp_factor(y), margin)
            )

        # Local cos held constant — small colony cos don't auto-automate the same way
        local_companies = deepcopy(DEFAULT_LOCAL_COMPANIES)

        sim_cfg = {
            "basket_usd": 980.0 * basket_factor(y),
            "ubi_multiplier": cfg["ubi_multiplier"],
            "external_spend_fraction": cfg["external_spend_fraction"],
            "levy_cap_rate": cfg["levy_cap_rate"],
            "levy_formula": cfg["levy_formula"],
            "family_types": family_types,
            "local_companies": local_companies,
            "external_suppliers": external_suppliers,
            "sector_spend_pattern": DEFAULT_SECTOR_SPEND_PATTERN,
            "internal_sector_pattern": DEFAULT_INTERNAL_SECTOR_PATTERN,
        }
        result = run_one_month(sim_cfg)
        b = result["budget"]
        i = result["income"]

        # Welfare obligation: based on the family-type composition (the residents
        # the State would have been paying welfare for), grown by welfare_growth_pct
        # per year to capture wage decline and displacement pushing more people
        # below welfare thresholds.
        welfare_ob = welfare_obligation(family_types, cfg["welfare_per_family"]) * welfare_factor(y)

        snap = {
            "year": cfg["start_year"] + y,
            "year_offset": y,
            "basket_usd": sim_cfg["basket_usd"],
            "ubi_per_citizen": i["ubi_usd_per_citizen"],
            "ubi_obligation": b["ubi_obligation"],
            "welfare_obligation": welfare_ob,
            "profit_pool": b["total_profit_pool"],
            "max_capturable": b["max_capturable"],
            "levy_collected": b["automation_collected"],
            "funding_gap": b["funding_gap"],
            "funding_gap_pct": b["funding_gap_pct"],
            "total_salary": i["total_salary"],
        }
        snapshots.append(snap)

        if crossover_year is None and b["funding_gap"] <= 0.01:
            crossover_year = cfg["start_year"] + y

    # Two milestones: M1 = welfare-capable, M2 = full-UBI-capable
    m1_year = m2_year = None
    for s in snapshots:
        if m1_year is None and s["levy_collected"] >= s["welfare_obligation"]:
            m1_year = s["year"]
        if m2_year is None and s["levy_collected"] >= s["ubi_obligation"]:
            m2_year = s["year"]

    return {
        "config": cfg,
        "snapshots": snapshots,
        "crossover_year": crossover_year,
        "milestone_1_year": m1_year,
        "milestone_2_year": m2_year,
        "first": snapshots[0],
        "final": snapshots[-1],
    }


if __name__ == "__main__":
    import json
    import sys
    json.dump(run(), sys.stdout, indent=2, default=str)
