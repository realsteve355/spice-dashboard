"""Grok V8.3 Stable Simulation Framework — top-down projection.

Per Steve's brief on 2026-05-31: reproduce Grok's MaryFontaine projection
using his exact Section 3 parameters and key data points. This is a
*top-down* aggregate calculator, not an agent-based model — its job is
to faithfully output Grok's intended trajectory so the ABM (in colony_v0)
has a clean target to be evaluated against.

Section 3 (recommended starting values):
  N_adults                       = 180,000   (MaryFontaine scale)
  initial_employment_rate        = 0.45
  A_max                          = 0.85
  productivity_growth            = 0.037/yr
  k (MAC factor)                 = 0.22
  initial_profit_per_employee    = $16,667/yr
  consumption_proportion_UBI     = 0.85
  consumption_proportion_wages   = 0.75
  tradable_deflation_rate        = -0.02/yr
  housing_inflation_rate         = 0.012/yr

Key data points (Y0/Y5/Y12/Y20) from Sections 1-2 anchor the trajectory;
intermediate months are interpolated.
"""
from __future__ import annotations
from math import exp


# Per Grok Section 3 + Section 2 key data points (MaryFontaine pilot)
N_ADULTS = 180_000
A_MAX = 0.85
K_MAC = 0.22
PRODUCTIVITY_GROWTH = 0.037          # per year
TRADABLE_DEFLATION = -0.02           # per year (-2%)
HOUSING_INFLATION = 0.012            # per year (+1.2%)
CONSUMPTION_PROPENSITY_UBI = 0.85
CONSUMPTION_PROPENSITY_WAGES = 0.75
INITIAL_PROFIT_PER_EMPLOYEE = 16_667 # $/year per employee

# Key trajectory anchors per Grok's Section 2 (MaryFontaine)
# (year, employed_count, total_profit_millions_per_year)
KEY_POINTS = [
    (0,  81_000, 1_350),   # Y0:  45% employed
    (5,  40_000, 2_050),   # Y5:  22%
    (12, 27_000, 2_680),   # Y12: 15%
    (20, 45_000, 3_450),   # Y20: 25% (voluntary/creative work)
]


def _interp_linear(months_elapsed: float, key_points, value_idx: int):
    """Linearly interpolate the value at a given month between Grok's
    anchor years. Beyond Y20, hold the Y20 value."""
    year = months_elapsed / 12.0
    if year <= key_points[0][0]:
        return key_points[0][value_idx]
    if year >= key_points[-1][0]:
        return key_points[-1][value_idx]
    for i in range(len(key_points) - 1):
        y0, *_ = key_points[i]
        y1, *_ = key_points[i + 1]
        if y0 <= year <= y1:
            v0 = key_points[i][value_idx]
            v1 = key_points[i + 1][value_idx]
            frac = (year - y0) / (y1 - y0)
            return v0 + (v1 - v0) * frac
    return key_points[-1][value_idx]


def run(cfg=None):
    """Run the V8.3 projection. cfg is accepted for API compatibility but
    most values are fixed by Grok's spec."""
    cfg = cfg or {}
    months = int(cfg.get("months", 240))
    k = float(cfg.get("mac_rate", K_MAC))
    n_adults = int(cfg.get("n_adults", N_ADULTS))
    prod_growth = float(cfg.get("productivity_growth", PRODUCTIVITY_GROWTH))
    trad_defl = float(cfg.get("tradable_deflation", TRADABLE_DEFLATION))
    hous_infl = float(cfg.get("housing_inflation", HOUSING_INFLATION))
    cp_ubi = float(cfg.get("consumption_propensity_ubi", CONSUMPTION_PROPENSITY_UBI))
    cp_wage = float(cfg.get("consumption_propensity_wages", CONSUMPTION_PROPENSITY_WAGES))

    # Assume monthly wage scales with productivity * starting wage baseline.
    # Anchored so initial wages × cp_wages × employed roughly equals
    # initial consumption from labour at Y0.
    base_monthly_wage = INITIAL_PROFIT_PER_EMPLOYEE / 12.0 * 2.0  # rough — wage ~ 2× profit/emp

    rows = []
    for m in range(months + 1):
        years = m / 12.0
        # Anchored employment and profit from Grok's data points
        employed = _interp_linear(m, KEY_POINTS, 1)
        profit_annual_total = _interp_linear(m, KEY_POINTS, 2) * 1_000_000

        # Indices
        tradable_index = (1.0 + trad_defl) ** years
        housing_index = (1.0 + hous_infl) ** years
        productivity_index = (1.0 + prod_growth) ** years

        # Per-firm derived metrics
        profit_per_emp_annual = profit_annual_total / max(1, employed)
        revenue_total = profit_annual_total / 0.26  # implied ~26% margin (Grok's Amazon example)

        # MAC + UBI
        mac_pool_annual = profit_annual_total * k
        ubi_per_adult_annual = mac_pool_annual / n_adults
        ubi_per_adult_monthly = ubi_per_adult_annual / 12.0
        real_ubi_annual = ubi_per_adult_annual / tradable_index

        # Wages and consumption
        avg_wage_monthly = base_monthly_wage * productivity_index
        labour_income_monthly = avg_wage_monthly * employed
        ubi_consumption_monthly = ubi_per_adult_monthly * n_adults * cp_ubi
        wage_consumption_monthly = labour_income_monthly * cp_wage
        total_consumption_monthly = ubi_consumption_monthly + wage_consumption_monthly

        rows.append({
            "month": m,
            "year": round(years, 2),
            "automation_level": min(A_MAX, A_MAX * (years / 20.0)),
            "adults": n_adults,
            "employed": int(employed),
            "employment_rate": employed / n_adults,
            "unemployment_rate": 1.0 - employed / n_adults,
            "profit_annual_total": profit_annual_total,
            "profit_per_employee_annual": profit_per_emp_annual,
            "revenue_annual_total": revenue_total,
            "mac_pool_monthly": mac_pool_annual / 12.0,
            "mac_pool_annual": mac_pool_annual,
            "ubi_per_adult_monthly": ubi_per_adult_monthly,
            "ubi_per_adult_annual": ubi_per_adult_annual,
            "real_ubi_annual_y0": real_ubi_annual,
            "tradable_index": tradable_index,
            "housing_index": housing_index,
            "productivity_index": productivity_index,
            "avg_monthly_wage": avg_wage_monthly,
            "labour_income_monthly": labour_income_monthly,
            "ubi_consumption_monthly": ubi_consumption_monthly,
            "wage_consumption_monthly": wage_consumption_monthly,
            "total_consumption_monthly": total_consumption_monthly,
        })

    # Highlight the key milestones for the table view
    milestones = [0, 12, 60, 120, 240]
    return {"trajectory": rows, "milestones": milestones, "params": {
        "k": k,
        "n_adults": n_adults,
        "productivity_growth": prod_growth,
        "tradable_deflation": trad_defl,
        "housing_inflation": hous_infl,
        "consumption_propensity_ubi": cp_ubi,
        "consumption_propensity_wages": cp_wage,
    }}
