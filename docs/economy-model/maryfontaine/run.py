"""
MaryFontaine simulator — top-level driver.

Loads founding state from a generated DB, runs N months of ticks, writes
transactions + snapshots back to the DB.

Usage:
    # Generate founding data first
    python generate_founding.py --db mf.db --seed 42

    # Then run
    python run.py --db mf.db --scenario convulsion --months 120
    python run.py --db mf.db --scenario ai_realist --months 12   # quick sanity check

After running, the DB contains the full transaction history and snapshots.
"""
from __future__ import annotations
import argparse
import sqlite3
import sys
import time
from pathlib import Path

from scenarios import build_trajectory, ANNUAL_RATES
from tick import (
    SimState, load_state, tick_one_month, flush_to_db,
    TxRecorder
)


def main() -> None:
    ap = argparse.ArgumentParser(description="MaryFontaine simulator runner")
    ap.add_argument("--db", required=True, help="path to DB (must have founding data already)")
    ap.add_argument("--scenario", required=True, choices=list(ANNUAL_RATES.keys()))
    ap.add_argument("--months", type=int, default=120)
    ap.add_argument("--noise", type=float, default=0.0)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--progress", action="store_true", help="print per-year progress")
    args = ap.parse_args()

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"ERROR: {db_path} does not exist; run generate_founding.py first", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA foreign_keys = ON")

    print(f"Loading state from {db_path} ...", file=sys.stderr)
    t0 = time.time()
    state = load_state(conn, seed=args.seed)
    print(f"  loaded {len(state.citizens)} citizens, {len(state.companies)} companies "
          f"in {time.time() - t0:.1f}s", file=sys.stderr)
    print(f"  founding S supply: {state.s_supply_total:,.2f}", file=sys.stderr)
    print(f"  founding USDC reserve: ${state.fisc_usdc:,.2f}", file=sys.stderr)

    print(f"Building scenario trajectory: {args.scenario} ({args.months} months) ...", file=sys.stderr)
    trajectory = build_trajectory(args.scenario, months=args.months,
                                  noise_sigma=args.noise, seed=args.seed)

    print(f"Running ticks ...", file=sys.stderr)
    txs = TxRecorder()
    citizen_snaps = []
    company_snaps = []
    fisc_states = []
    unmet_demand = []

    t0 = time.time()
    for m in range(1, args.months + 1):
        tick_one_month(state, args.scenario, trajectory, m,
                       txs, citizen_snaps, company_snaps, fisc_states, unmet_demand)
        if args.progress and m % 12 == 0:
            year = m // 12
            elapsed = time.time() - t0
            last_fisc = fisc_states[-1]
            print(f"  Y{year:>2}: rate=${last_fisc[2]:.4f}/S  reserve=${last_fisc[3]:,.0f}  "
                  f"S_supply={last_fisc[4]:,.0f}  basket_S={last_fisc[8]:.2f}  "
                  f"compressed={'Y' if last_fisc[10] else 'N'}  "
                  f"({elapsed:.1f}s)", file=sys.stderr)

    print(f"Tick complete: {len(txs)} transactions in {time.time() - t0:.1f}s",
          file=sys.stderr)

    print("Flushing to DB ...", file=sys.stderr)
    t0 = time.time()
    flush_to_db(conn, state, txs, citizen_snaps, company_snaps, fisc_states, unmet_demand)
    print(f"  done in {time.time() - t0:.1f}s", file=sys.stderr)

    conn.close()
    print(f"\nFinal state:", file=sys.stderr)
    print(f"  Fisc USDC reserve: ${state.fisc_usdc:,.2f}", file=sys.stderr)
    print(f"  S supply: {state.s_supply_total:,.2f}", file=sys.stderr)
    print(f"  Last basket cost in S: {fisc_states[-1][8]:.2f} (target 28.0)", file=sys.stderr)


if __name__ == "__main__":
    main()
