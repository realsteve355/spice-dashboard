"""
Parameter sweep for the MaryFontaine simulator.

Runs N configurations end-to-end, capturing Y3/Y6/Y10 basket cost in S,
peg-break year, and Y10 reserve. Output: sweep_results.csv + sweep_results.json.

Run:
    python docs/economy-model/maryfontaine/sweep.py [--out path]
"""
from __future__ import annotations
import argparse
import csv
import json
import sqlite3
import sys
import tempfile
import time
from pathlib import Path
from dataclasses import asdict
from typing import Dict, List

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from config import SimConfig
from scenarios import build_trajectory
from tick import SimState, load_state, tick_one_month, flush_to_db, TxRecorder
from generate_founding import (
    open_db, apply_schema, gen_citizens, gen_households, gen_companies,
    gen_equity, gen_wallets, write_to_db, GenContext, update_employee_counts
)
import random


def make_config(name: str, **overrides) -> Dict:
    """Build a config dict — base + overrides — and label it."""
    base = asdict(SimConfig())
    base.update(overrides)
    base["_name"] = name
    return base


def run_one(cfg_dict: Dict, base_db_template: Path | None = None) -> Dict:
    """Run a single configuration. Returns extracted summary metrics."""
    name = cfg_dict.pop("_name")
    cfg = SimConfig(**{k: v for k, v in cfg_dict.items()
                       if k in SimConfig.__dataclass_fields__})

    # Generate founding
    db_path = Path(tempfile.gettempdir()) / f"sweep_{int(time.time()*1000)}.db"
    if db_path.exists():
        db_path.unlink()
    rng = random.Random(cfg.seed)
    random.seed(cfg.seed)
    target_pop = int(round(39_000 * cfg.scale))
    target_hh = int(round(1_500 * cfg.scale))
    ctx = GenContext(rng=rng, scale=cfg.scale,
                     target_population=target_pop, target_households=target_hh)
    citizens = gen_citizens(ctx)
    households = gen_households(ctx, citizens)
    companies = gen_companies(ctx, citizens)
    equity = gen_equity(ctx, citizens, companies)
    update_employee_counts(companies, equity)
    wallets = gen_wallets(citizens, companies)
    conn = open_db(db_path)
    apply_schema(conn, HERE / "schema.sql")
    write_to_db(conn, citizens, households, companies, equity, wallets,
                scenario=cfg.scenario, scale=cfg.scale, seed=cfg.seed)
    conn.close()

    # Run sim
    conn = sqlite3.connect(str(db_path))
    state = load_state(conn, seed=cfg.seed)
    trajectory = build_trajectory(cfg.scenario, months=cfg.months,
                                  noise_sigma=cfg.noise_sigma, seed=cfg.seed)
    txs = TxRecorder()
    citizen_snaps = []; company_snaps = []; fisc_states = []; unmet = []
    t0 = time.time()
    for m in range(1, cfg.months + 1):
        tick_one_month(state, cfg, trajectory, m, txs,
                       citizen_snaps, company_snaps, fisc_states, unmet)
    elapsed = time.time() - t0

    # Extract summary
    def at_month(m):
        for fs in fisc_states:
            if fs[0] * 12 + fs[1] == m:
                return fs
        return None
    last = fisc_states[-1] if fisc_states else None
    y3 = at_month(36); y6 = at_month(72); y10 = at_month(120)
    peg_break = None
    for fs in fisc_states:
        if fs[10]:  # rate_compressed flag
            peg_break = fs[0] * 12 + fs[1]
            break

    summary = {
        "name": name,
        "scenario": cfg.scenario,
        "months": cfg.months,
        "ubi": cfg.ubi_s_per_citizen,
        "ubi_children_pct": cfg.ubi_children_pct,
        "ubi_retirees_only": cfg.ubi_retirees_only,
        "cover_target": cfg.cover_target,
        "lat_pct": cfg.mpc_rate_pct if cfg.mpc_enabled else 0,
        "mortgage_refi": cfg.mortgage_refinance_to_s,
        "ext_rent_refi": cfg.external_rent_refinance,
        "s_tax_pct": cfg.s_tax_on_purchases_pct,
        "cashout_mult": cfg.cashout_multiplier,
        "y3_basket_s": round(y3[8], 2) if y3 else None,
        "y6_basket_s": round(y6[8], 2) if y6 else None,
        "y10_basket_s": round(y10[8], 2) if y10 else None,
        "y10_reserve": round(y10[3], 0) if y10 else None,
        "y10_supply": round(y10[4], 0) if y10 else None,
        "y10_rate": round(y10[2], 4) if y10 else None,
        "peg_break_month": peg_break,
        "pp_loss_pct": round((1 - (cfg.ubi_s_per_citizen / y10[8]) /
                              (cfg.ubi_s_per_citizen / 28)) * 100, 1)
                        if (y10 and y10[8] > 0) else None,
        "elapsed_s": round(elapsed, 1),
    }

    conn.close()
    db_path.unlink(missing_ok=True)
    return summary


# ── Configurations to test ────────────────────────────────────────────────

def build_configs() -> List[Dict]:
    cfgs = []

    # === Baseline + cross-scenario sanity ===
    for scen in ["ai_realist", "ai_optimist", "stagflation", "ai_healthcare_crisis",
                 "transition", "transition_honda_shock"]:
        cfgs.append(make_config(f"baseline_{scen}", scenario=scen))

    # === Single-lever sweeps under Transition ===

    # MPC rate sweep
    for mpc in [0.025, 0.05, 0.075, 0.10, 0.15]:
        cfgs.append(make_config(f"lat_{int(mpc*1000):03d}",
                                scenario="transition", mpc_enabled=True, mpc_rate_pct=mpc))

    # UBI level sweep
    for ubi in [50, 75, 125, 150]:
        cfgs.append(make_config(f"ubi_{ubi}",
                                scenario="transition", ubi_s_per_citizen=ubi))

    # Mortgage / rent refi
    cfgs.append(make_config("mortgage_refi", scenario="transition",
                            mortgage_refinance_to_s=True))
    cfgs.append(make_config("ext_rent_refi", scenario="transition",
                            external_rent_refinance=True))
    cfgs.append(make_config("both_refi", scenario="transition",
                            mortgage_refinance_to_s=True, external_rent_refinance=True))

    # S-tax sweep
    for st in [0.01, 0.03, 0.05]:
        cfgs.append(make_config(f"stax_{int(st*1000):03d}",
                                scenario="transition", s_tax_on_purchases_pct=st))

    # Cover ratio sweep
    for cr in [0.15, 0.20, 0.40]:
        cfgs.append(make_config(f"cover_{int(cr*100):02d}",
                                scenario="transition", cover_target=cr))

    # Cashout multiplier (capital flight stress)
    for cm in [0, 0.5, 2.0]:
        cfgs.append(make_config(f"cashout_{cm}",
                                scenario="transition", cashout_multiplier=cm))

    # Retirees-only UBI
    cfgs.append(make_config("retirees_only_ubi",
                            scenario="transition", ubi_retirees_only=True))

    # === Combination tests under Transition ===

    cfgs.append(make_config("combo_lat5_mortrefi",
                            scenario="transition",
                            mpc_enabled=True, mpc_rate_pct=0.05,
                            mortgage_refinance_to_s=True))

    cfgs.append(make_config("combo_lat5_both_refi",
                            scenario="transition",
                            mpc_enabled=True, mpc_rate_pct=0.05,
                            mortgage_refinance_to_s=True,
                            external_rent_refinance=True))

    cfgs.append(make_config("combo_lat10_both_refi_stax3",
                            scenario="transition",
                            mpc_enabled=True, mpc_rate_pct=0.10,
                            mortgage_refinance_to_s=True,
                            external_rent_refinance=True,
                            s_tax_on_purchases_pct=0.03))

    cfgs.append(make_config("combo_welfare_first",
                            scenario="transition",
                            ubi_s_per_citizen=150,
                            mpc_enabled=True, mpc_rate_pct=0.08,
                            mortgage_refinance_to_s=True))

    cfgs.append(make_config("combo_meanstested",
                            scenario="transition",
                            ubi_retirees_only=True,
                            mpc_enabled=True, mpc_rate_pct=0.03))

    cfgs.append(make_config("combo_max_defence",
                            scenario="transition",
                            mpc_enabled=True, mpc_rate_pct=0.15,
                            mortgage_refinance_to_s=True,
                            external_rent_refinance=True,
                            s_tax_on_purchases_pct=0.05))

    # === Best combo cross-scenario ===
    best = dict(mpc_enabled=True, mpc_rate_pct=0.05,
                mortgage_refinance_to_s=True,
                external_rent_refinance=True)
    for scen in ["ai_realist", "stagflation", "transition", "transition_honda_shock"]:
        cfgs.append(make_config(f"best_under_{scen}", scenario=scen, **best))

    return cfgs


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(HERE / "sweep_results"),
                    help="output basename (writes .csv + .json)")
    ap.add_argument("--limit", type=int, default=None,
                    help="run only first N configs (for testing)")
    args = ap.parse_args()

    cfgs = build_configs()
    if args.limit:
        cfgs = cfgs[:args.limit]

    print(f"Sweep: {len(cfgs)} configurations", file=sys.stderr)
    results = []
    t0 = time.time()
    for i, cfg in enumerate(cfgs, 1):
        name = cfg.get("_name", f"cfg_{i}")
        print(f"[{i}/{len(cfgs)}] {name} ...", file=sys.stderr)
        try:
            r = run_one(cfg)
            results.append(r)
            print(f"  -> y10_basket_s={r['y10_basket_s']}  pp_loss={r['pp_loss_pct']}%  peg_break_m={r['peg_break_month']}",
                  file=sys.stderr)
        except Exception as e:
            print(f"  -> ERROR: {e}", file=sys.stderr)
            results.append({"name": name, "error": str(e)})
        elapsed = time.time() - t0
        avg = elapsed / i
        remaining = (len(cfgs) - i) * avg
        print(f"  ({elapsed:.0f}s elapsed, ~{remaining:.0f}s remaining)", file=sys.stderr)

    # Write CSV
    out_csv = Path(args.out + ".csv")
    fieldnames = sorted({k for r in results for k in r.keys()})
    with open(out_csv, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fieldnames)
        w.writeheader()
        for r in results:
            w.writerow(r)
    out_json = Path(args.out + ".json")
    with open(out_json, "w") as fh:
        json.dump(results, fh, indent=2, default=str)
    print(f"\nWrote {out_csv} + {out_json}", file=sys.stderr)
    print(f"Total elapsed: {(time.time() - t0):.0f}s", file=sys.stderr)


if __name__ == "__main__":
    main()
