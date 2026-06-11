"""Bake the whole simple_trace dashboard as static JSON for zpc.finance/sim/.

Each interactive page POSTs a config to an /api/* endpoint and renders the
result. For the static publish we run each endpoint once at its initial-load
default config (mirroring the HTML input defaults) and dump the JSON into
public/sim/data/, so the ported pages can fetch a flat file instead of a
live Python server.

Run:  python bake_sim_static.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from server import (                       # noqa: E402
    run_sim, run_trajectory, run_abm, run_colony_v0, run_grok_v83,
)
from forecasts import get_forecasts        # noqa: E402

OUT = HERE.parent.parent.parent / "public" / "sim" / "data"
OUT.mkdir(parents=True, exist_ok=True)

# Initial-load configs — match each page's HTML input defaults exactly.
COLONY_DEFAULTS = {
    "n_citizens": 100, "months": 240, "monthly_external_transfers": 2800,
    "pension_per_inactive": 400, "mac_rate": 0.22, "tech_growth_rate": 0.054,
    "automation_end": 0.85, "automation_months": 240, "seed": 42,
}

JOBS = [
    # filename, callable, config
    ("run.json", run_sim, {
        "ubi_multiplier": 1.10, "external_spend_fraction": 0.55,
        "levy_cap_rate": 0.80, "levy_formula": "linear",
    }),
    ("trajectory.json", run_trajectory, {
        "years": 20, "salary_decline_pct": 3.0, "p_emp_growth_pct": 8.0,
        "margin_growth_pct": 5.0, "margin_ceiling_pct": 90,
        "welfare_displacement_pct": 1.0, "levy_cap_rate": 0.80,
        "levy_formula": "asymptotic",
    }),
    ("abm.json", run_abm, {"months": 24}),
    ("grok-projection.json", run_grok_v83, {"months": 240}),
    ("forecasts.json", lambda _cfg: get_forecasts(), {}),
    ("colony-trad.json", run_colony_v0, dict(COLONY_DEFAULTS, mcc_mode=False)),
    ("colony-axion.json", run_colony_v0, dict(COLONY_DEFAULTS, mcc_mode=True)),
]

for fname, fn, cfg in JOBS:
    print(f"baking {fname} …", flush=True)
    data = fn(cfg)
    out = OUT / fname
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, default=str, separators=(",", ":"))
    print(f"  -> {out.name} ({out.stat().st_size:,} bytes)")

print("\ndone.")
