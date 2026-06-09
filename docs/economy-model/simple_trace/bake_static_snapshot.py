"""Bake the colony-v0 trajectory as static JSON for publishing on zpc.finance.

Runs the model twice (mcc_mode=False for Traditional, mcc_mode=True for
AXION Colony Bill) with the dashboard's default parameters, dumps the
JSON payloads into the main site's public/colony-v0/ folder so the
static page can fetch them without a live Python server.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))

from server import run_colony_v0   # noqa: E402

DEFAULTS = {
    "n_citizens":                  100,
    "months":                      240,
    "monthly_external_transfers":  2800,
    "pension_per_inactive":        400,
    "mac_rate":                    0.22,
    "tech_growth_rate":            0.054,
    "automation_end":              0.85,
    "automation_months":           240,
    "seed":                        42,
}

OUT_DIR = HERE.parent.parent.parent / "public" / "colony-v0"
OUT_DIR.mkdir(parents=True, exist_ok=True)

for mcc_mode, fname in [(False, "data-trad.json"), (True, "data-axion.json")]:
    cfg = dict(DEFAULTS, mcc_mode=mcc_mode)
    print(f"running mcc_mode={mcc_mode} -> {fname}")
    data = run_colony_v0(cfg)
    out = OUT_DIR / fname
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, default=str, separators=(",", ":"))
    print(f"  -> wrote {out} ({out.stat().st_size:,} bytes)")

print("\ndone.")
