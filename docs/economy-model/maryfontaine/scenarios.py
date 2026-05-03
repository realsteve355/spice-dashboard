"""
External environment scenarios — per-month USD cost trajectories per basket category.

Six scenarios per spec §3.6. Each is specified as annual % change per category for
years 1-10. Within-month evolution is geometric: monthly_factor = (1 + annual)^(1/12).
Optional Gaussian noise on top (default off for reproducibility).

Run standalone to dump CSV trajectories for inspection:
    python -m docs.economy-model.maryfontaine.scenarios --scenario transition --out trajectory.csv
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Tuple
import math
import random


# Basket weights at founding — scaled to realistic per-adult monthly USD consumption.
# Total = $980 USD = 28 S at parity rate of $35/S.
# Weights match US BLS CPI proportions: energy 28.6%, food 32.1%, goods 17.9%, services 21.4%.
# The simulation dynamics are scale-invariant in USD; this rescaling affects only the
# absolute dollar labels, not the peg-break timing or PP-loss percentages.
BASKET_WEIGHTS_USD: Dict[str, float] = {
    "energy":   280.0,  # 28.6%  — gasoline, electricity, heating
    "food":     315.0,  # 32.1%  — groceries
    "goods":    175.0,  # 17.9%  — manufactured goods (most exposed to AI deflation)
    "services": 210.0,  # 21.4%  — healthcare, education, restaurants, professional
}
BASKET_TARGET_S = 28.0  # the basket-cost-in-S the Fisc tries to maintain (S unit, not USD)


# ── Annual rate tables (per spec §3.6) ─────────────────────────────────────────
# Each value is annual fractional change (-0.10 = -10% per year).

ANNUAL_RATES: Dict[str, Dict[str, List[float]]] = {
    "ai_realist": {
        "energy":   [0.03] * 10,
        "food":     [0.02] * 10,
        "goods":    [-0.03, -0.04, -0.05, -0.05, -0.05, -0.05, -0.04, -0.03, -0.03, -0.02],
        "services": [0.02] * 10,
    },
    "ai_optimist": {
        "energy":   [0.0,   0.0,   -0.02, -0.03, -0.04, -0.05, -0.05, -0.04, -0.03, -0.02],
        "food":     [-0.01, -0.02, -0.03, -0.04, -0.04, -0.04, -0.03, -0.03, -0.02, -0.02],
        "goods":    [-0.08, -0.12, -0.15, -0.15, -0.14, -0.12, -0.10, -0.08, -0.06, -0.04],
        "services": [0.0,   -0.01, -0.02, -0.03, -0.04, -0.04, -0.04, -0.03, -0.02, -0.02],
    },
    "stagflation": {
        "energy":   [0.08,  0.10,  0.12,  0.10,  0.08,  0.06,  0.05,  0.04,  0.03,  0.03],
        "food":     [0.06,  0.08,  0.10,  0.09,  0.07,  0.05,  0.04,  0.03,  0.03,  0.02],
        "goods":    [-0.02, -0.02, -0.03, -0.03, -0.03, -0.02, -0.02, -0.01, -0.01,  0.0],
        "services": [0.06,  0.08,  0.09,  0.08,  0.06,  0.05,  0.04,  0.03,  0.03,  0.02],
    },
    "ai_healthcare_crisis": {
        # AI Optimist for goods/energy/food, but services hit by healthcare cost shock Y2-Y5
        "energy":   [0.0,   0.0,   -0.02, -0.03, -0.04, -0.05, -0.05, -0.04, -0.03, -0.02],
        "food":     [-0.01, -0.02, -0.03, -0.04, -0.04, -0.04, -0.03, -0.03, -0.02, -0.02],
        "goods":    [-0.08, -0.12, -0.15, -0.15, -0.14, -0.12, -0.10, -0.08, -0.06, -0.04],
        "services": [0.05,  0.12,  0.15,  0.12,  0.08,  0.06,  0.05,  0.05,  0.04,  0.03],
    },
    "transition": {
        # The credibility test. Accelerating non-linear AI deflation in goods peaking Y5;
        # simultaneous USD inflation in services + energy from monetary response peaking Y4.
        "energy":   [0.10,  0.14,  0.18,  0.22,  0.18,  0.12,  0.08,  0.05,  0.03,  0.02],
        "food":     [0.06,  0.10,  0.14,  0.16,  0.14,  0.10,  0.06,  0.04,  0.03,  0.02],
        "goods":    [-0.08, -0.16, -0.24, -0.32, -0.38, -0.34, -0.28, -0.20, -0.14, -0.10],
        "services": [0.08,  0.12,  0.16,  0.18,  0.14,  0.10,  0.07,  0.05,  0.03,  0.02],
    },
    "transition_honda_shock": {
        # Same per-category trajectory as Transition. The Honda export shock
        # is layered separately by the simulator (on company_revenue), not on
        # category prices. See HONDA_SHOCK_SCHEDULE below.
        "energy":   [0.10,  0.14,  0.18,  0.22,  0.18,  0.12,  0.08,  0.05,  0.03,  0.02],
        "food":     [0.06,  0.10,  0.14,  0.16,  0.14,  0.10,  0.06,  0.04,  0.03,  0.02],
        "goods":    [-0.08, -0.16, -0.24, -0.32, -0.38, -0.34, -0.28, -0.20, -0.14, -0.10],
        "services": [0.08,  0.12,  0.16,  0.18,  0.14,  0.10,  0.07,  0.05,  0.03,  0.02],
    },
}


# Honda shock schedule (per spec §3.6 Transition + Honda shock).
# Returns the multiplier to apply to Honda's monthly export USD baseline.
# Month index is 1-based (month 1 = first month of simulation).
def honda_shock_multiplier(month_index: int, scenario: str) -> float:
    if scenario != "transition_honda_shock":
        return 1.0
    # Months 1-38: full strength
    if month_index <= 38:
        return 1.0
    # Month 39: drop to 50% (start of Q3 of Y4 = month 39)
    # Months 39-63: linear ramp from 50% to 70% over 24 months
    if 39 <= month_index <= 63:
        progress = (month_index - 39) / 24.0  # 0.0 at month 39, ~1.0 at month 63
        return 0.50 + progress * 0.20  # 0.50 → 0.70
    # Months 64+: stable at 70%
    return 0.70


# ── Trajectory generation ──────────────────────────────────────────────────────

@dataclass
class EnvironmentTrajectory:
    """Per-month per-category USD price trajectory over the simulation horizon."""
    scenario: str
    months: int                                       # 120 for a 10-year run
    prices: Dict[str, List[float]]                    # category → [month1_usd, month2_usd, ...]

    def category_price(self, month_index: int, category: str) -> float:
        """1-based month index."""
        return self.prices[category][month_index - 1]

    def basket_cost_usd(self, month_index: int) -> float:
        return sum(self.category_price(month_index, c) for c in BASKET_WEIGHTS_USD)


def build_trajectory(scenario: str, months: int = 120,
                     noise_sigma: float = 0.0,
                     seed: int | None = None) -> EnvironmentTrajectory:
    """
    Build a per-month per-category USD price trajectory.

    Args:
        scenario: one of ANNUAL_RATES keys
        months: simulation horizon in months (default 120 = 10 years)
        noise_sigma: monthly multiplicative Gaussian noise std-dev (default 0 = deterministic)
                     0.003 ≈ ±0.3% per month per spec §3.6
        seed: RNG seed for reproducibility (only matters if noise_sigma > 0)

    Returns:
        EnvironmentTrajectory with prices[category] = [month1_usd, ..., monthN_usd]
    """
    if scenario not in ANNUAL_RATES:
        raise ValueError(f"unknown scenario: {scenario}; options: {list(ANNUAL_RATES)}")

    rng = random.Random(seed) if seed is not None else random.Random()
    rates = ANNUAL_RATES[scenario]
    prices: Dict[str, List[float]] = {}

    for category, base_usd in BASKET_WEIGHTS_USD.items():
        annual = rates[category]                       # length 10
        if len(annual) != 10:
            raise ValueError(f"{scenario}/{category}: expected 10 annual rates, got {len(annual)}")
        cat_series: List[float] = []
        current = base_usd
        for m in range(1, months + 1):
            year_index = (m - 1) // 12                 # 0..9
            if year_index >= len(annual):
                year_index = len(annual) - 1
            annual_rate = annual[year_index]
            monthly_factor = (1.0 + annual_rate) ** (1.0 / 12.0)
            current = current * monthly_factor
            if noise_sigma > 0:
                current = current * (1.0 + rng.gauss(0.0, noise_sigma))
                current = max(0.01, current)            # floor to avoid pathological negatives
            cat_series.append(current)
        prices[category] = cat_series

    return EnvironmentTrajectory(scenario=scenario, months=months, prices=prices)


# ── CLI for inspection ─────────────────────────────────────────────────────────

def _summary_table(traj: EnvironmentTrajectory) -> str:
    """Year-end USD price per category, plus basket cost USD and basket cost in S
    if the Fisc were perfectly tracking."""
    rows = []
    rows.append(f"{'Year':<6} " + " ".join(f"{c:>10}" for c in BASKET_WEIGHTS_USD) + f"  {'Basket$':>10}")
    for year in range(1, 11):
        month_index = year * 12   # year-end
        cells = [f"{traj.category_price(month_index, c):>10.2f}" for c in BASKET_WEIGHTS_USD]
        basket = traj.basket_cost_usd(month_index)
        rows.append(f"  Y{year:<3} " + " ".join(cells) + f"  {basket:>10.2f}")
    return "\n".join(rows)


def main() -> None:
    import argparse, csv, sys
    ap = argparse.ArgumentParser(description="Inspect MaryFontaine simulator scenarios")
    ap.add_argument("--scenario", required=True, choices=list(ANNUAL_RATES.keys()))
    ap.add_argument("--months", type=int, default=120)
    ap.add_argument("--noise", type=float, default=0.0, help="monthly noise std-dev (e.g. 0.003)")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--out", type=str, default=None, help="CSV output path; omit to print summary")
    args = ap.parse_args()

    traj = build_trajectory(args.scenario, months=args.months,
                            noise_sigma=args.noise, seed=args.seed)

    if args.out:
        with open(args.out, "w", newline="") as fh:
            writer = csv.writer(fh)
            writer.writerow(["month"] + list(BASKET_WEIGHTS_USD) + ["basket_usd"])
            for m in range(1, args.months + 1):
                row = [m] + [f"{traj.category_price(m, c):.4f}" for c in BASKET_WEIGHTS_USD]
                row.append(f"{traj.basket_cost_usd(m):.4f}")
                writer.writerow(row)
        print(f"wrote {args.out}", file=sys.stderr)
    else:
        print(f"Scenario: {args.scenario}  months={args.months}  noise={args.noise}\n")
        print(_summary_table(traj))


if __name__ == "__main__":
    main()
