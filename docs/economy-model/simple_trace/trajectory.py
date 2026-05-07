"""
Trajectory sim — iterate simple_trace's per-month sim over N years
while automation progresses.

Hypothesis being tested: the funding gap closes naturally as the basket
cost falls (cheaper goods from automation) and supplier profit-per-employee
rises (more profit per worker). No bonds, no minting, no reserves —
just the cost curves.

Annual snapshots, no monthly granularity (20 data points for a 20-year
window is enough to see the trend).
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


def run(config: dict | None = None) -> dict:
    cfg = {
        "years": 20,
        "start_year": 2026,
        "basket_decline_pct": 5.0,        # % per year basket cost falls
        "salary_decline_pct": 3.0,        # % per year salaries decline (AI wage pressure)
        "p_emp_growth_pct": 5.0,          # % per year supplier P/emp rises
        "ubi_multiplier": 1.10,           # held constant — UBI = basket × this
        "external_spend_fraction": 0.55,
        "levy_cap_rate": 0.80,
        "levy_formula": "linear",
    }
    if config:
        cfg.update(config)

    years = cfg["years"]
    basket_factor = lambda y: (1 - cfg["basket_decline_pct"] / 100) ** y
    salary_factor = lambda y: (1 - cfg["salary_decline_pct"] / 100) ** y
    p_emp_factor  = lambda y: (1 + cfg["p_emp_growth_pct"]  / 100) ** y

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

        snap = {
            "year": cfg["start_year"] + y,
            "year_offset": y,
            "basket_usd": sim_cfg["basket_usd"],
            "ubi_per_citizen": i["ubi_usd_per_citizen"],
            "ubi_obligation": b["ubi_obligation"],
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

    return {
        "config": cfg,
        "snapshots": snapshots,
        "crossover_year": crossover_year,
        "first": snapshots[0],
        "final": snapshots[-1],
    }


if __name__ == "__main__":
    import json
    import sys
    json.dump(run(), sys.stdout, indent=2, default=str)
