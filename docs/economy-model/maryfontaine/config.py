"""
SimConfig — tunable parameters exposed to the dashboard sliders.

Defaults match the v1 spec; the dashboard can override any of these per run
to search for the configuration that delivers the oasis-of-calm criterion.
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Dict, Optional, Any


@dataclass
class SimConfig:
    # ── Scenario + run length ─────────────────────────────────────────────
    scenario: str = "convulsion"
    months: int = 120
    seed: int = 42
    noise_sigma: float = 0.0                        # 0 = deterministic; 0.003 = ±0.3% monthly
    scale: float = 0.1

    # ── UBI ──────────────────────────────────────────────────────────────
    ubi_s_per_citizen: float = 100.0                # base UBI per adult citizen per month
    ubi_children_pct: float = 1.0                   # 1.0 = children get full UBI; 0.5 = half; 0 = none
    ubi_retirees_only: bool = False                 # if True, ONLY retirees + ubi_only_choice get UBI

    # ── Fisc ─────────────────────────────────────────────────────────────
    cover_target: float = 0.30                      # USDC reserve must cover this fraction of (S × rate)

    # ── LAT (Local Automation Tax) ───────────────────────────────────────
    lat_enabled: bool = False
    lat_rate_pct: float = 0.05                      # 5% of monthly revenue, charged to all companies
                                                    # paid in S, S is destroyed at Fisc (reduces supply)

    # ── Honda Inc dividend vesting ───────────────────────────────────────
    honda_dividend_vest: bool = False               # if True, Honda Inc dividends accrue in S, no immediate cashout

    # ── Mortgage refinance into S ────────────────────────────────────────
    mortgage_refinance_to_s: bool = False           # if True, mortgage payments stay in S (to Fisc, not burned)
                                                    # represents colony bank buyout of external mortgages

    # ── External rent refinance ──────────────────────────────────────────
    external_rent_refinance: bool = False           # if True, external rent payments stay in S

    # ── S-tax on internal purchases ──────────────────────────────────────
    s_tax_on_purchases_pct: float = 0.0             # 0-0.10 typical; goes to Fisc, S destroyed

    # ── Cashout multiplier ───────────────────────────────────────────────
    cashout_multiplier: float = 1.0                 # scales the per-archetype cashout fractions

    # ── Subsistence + transition thresholds ──────────────────────────────
    subsistence_s: float = 50.0
    surplus_multiplier: float = 1.5                 # threshold = subsistence × this
    surplus_duration_months: int = 6

    # ── MCC utility billing ──────────────────────────────────────────────
    mcc_household_base_s: float = 30.0
    mcc_per_adult_s: float = 15.0
    mcc_company_base_s: float = 80.0
    mcc_per_revenue_frac: float = 0.005

    # ── Company internal cost & dividend policy ──────────────────────────
    company_op_cost_frac: float = 0.55
    wc_target_months: Dict[str, float] = field(default_factory=lambda: {
        "conservative": 1.5,
        "aggressive_dividend": 0.7,
        "growth_focused": 1.0,
    })

    # ── Behavioural defaults (rarely tuned via slider) ───────────────────
    cashout_fraction: Dict[str, float] = field(default_factory=lambda: {
        "saver": 0.10, "balanced": 0.05, "striver": 0.02, "spender": 0.0
    })
    discr_propensity: Dict[str, float] = field(default_factory=lambda: {
        "saver": 0.20, "balanced": 0.50, "striver": 0.40, "spender": 0.80
    })

    # ── Founding state ───────────────────────────────────────────────────
    fisc_reserve_at_founding_usd: float = 5_000_000.0   # at 10% scale
    fisc_rate_at_founding: float = 1.0                  # USD per S


def to_json(cfg: SimConfig) -> Dict[str, Any]:
    """Convert to JSON-serialisable dict for storage/UI."""
    return asdict(cfg)


def from_json(data: Dict[str, Any]) -> SimConfig:
    """Restore from JSON dict, tolerating missing keys (uses defaults)."""
    defaults = asdict(SimConfig())
    merged = {**defaults, **(data or {})}
    return SimConfig(**merged)
