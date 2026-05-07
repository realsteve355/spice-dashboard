"""
MaryFontaine simulator — top-level driver.

Loads founding state from a generated DB, runs N months of ticks, writes
transactions + snapshots back to the DB.

Usage:
    # Generate founding data first
    python generate_founding.py --db mf.db --seed 42

    # Then run
    python run.py --db mf.db --scenario transition --months 120
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
from config import SimConfig


def main() -> None:
    ap = argparse.ArgumentParser(description="MaryFontaine simulator runner")
    ap.add_argument("--db", required=True, help="path to DB (must have founding data already)")
    ap.add_argument("--scenario", required=True, choices=list(ANNUAL_RATES.keys()))
    ap.add_argument("--months", type=int, default=120)
    ap.add_argument("--noise", type=float, default=0.0)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--progress", action="store_true", help="print per-year progress")
    # Mitigation levers (Phase 4 dashboard exposes these as sliders)
    ap.add_argument("--ubi", type=float, default=100.0, help="UBI per citizen per month in S")
    ap.add_argument("--cover-target", type=float, default=0.30)
    ap.add_argument("--lat", type=float, default=0.0,
                    help="LAT rate as fraction of company revenue capacity (0 = disabled)")
    ap.add_argument("--mortgage-refi", action="store_true",
                    help="refinance mortgages into S (colony bank buyout)")
    ap.add_argument("--ext-rent-refi", action="store_true",
                    help="refinance external rent into S (colony landlord buyout)")
    ap.add_argument("--s-tax", type=float, default=0.0,
                    help="S-tax on internal purchases (fraction)")
    ap.add_argument("--ubi-children", type=float, default=1.0,
                    help="UBI multiplier for children (1.0 = full)")
    ap.add_argument("--ubi-retirees-only", action="store_true",
                    help="restrict UBI to retirees + ubi_only_choice")
    ap.add_argument("--cashout-mult", type=float, default=1.0)
    # Levy mechanism (Phase B onwards)
    ap.add_argument("--levy", action="store_true",
                    help="enable three-layer levy (gas + protocol + automation)")
    ap.add_argument("--p-threshold", type=float, default=80_000,
                    help="levy threshold in USD profit-per-employee")
    ap.add_argument("--p-baseline", type=float, default=100_000)
    ap.add_argument("--alpha", type=float, default=1.5,
                    help="progressivity exponent for the automation levy")
    ap.add_argument("--k-init", type=float, default=0.05,
                    help="initial levy k (recalibrated annually)")
    ap.add_argument("--mcc-federal-tax", action="store_true",
                    help="enable MCC residual federal tax line item")
    args = ap.parse_args()

    cfg = SimConfig(
        scenario=args.scenario, months=args.months, seed=args.seed,
        noise_sigma=args.noise,
        ubi_s_per_citizen=args.ubi,
        ubi_children_pct=args.ubi_children,
        ubi_retirees_only=args.ubi_retirees_only,
        cover_target=args.cover_target,
        lat_enabled=args.lat > 0,
        lat_rate_pct=args.lat,
        mortgage_refinance_to_s=args.mortgage_refi,
        external_rent_refinance=args.ext_rent_refi,
        s_tax_on_purchases_pct=args.s_tax,
        cashout_multiplier=args.cashout_mult,
        levy_enabled=args.levy,
        p_threshold_usd=args.p_threshold,
        p_baseline_usd=args.p_baseline,
        alpha=args.alpha,
        k=args.k_init,
        mcc_federal_tax_enabled=args.mcc_federal_tax,
    )

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

    print(f"Building scenario trajectory: {cfg.scenario} ({cfg.months} months) ...", file=sys.stderr)
    trajectory = build_trajectory(cfg.scenario, months=cfg.months,
                                  noise_sigma=cfg.noise_sigma, seed=cfg.seed)

    print(f"Running ticks ...", file=sys.stderr)
    txs = TxRecorder()
    citizen_snaps = []
    company_snaps = []
    fisc_states = []
    unmet_demand = []

    t0 = time.time()
    for m in range(1, cfg.months + 1):
        tick_one_month(state, cfg, trajectory, m,
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
