"""CLI runner for the ABM colony model.

Usage:
    python -m abm.run                    # 24 months, defaults matching /ledger
    python -m abm.run --months 36
    python -m abm.run --ubi_mode targeted --fx_pct 0.3
    python -m abm.run --json > out.json  # JSON for dashboard consumption

Run from docs/economy-model/simple_trace/:
    python -m abm.run
"""
import argparse
import json
import sys

from .model import ColonyModel


def main(argv=None):
    ap = argparse.ArgumentParser(description="AXION toy colony — Mesa ABM run")
    ap.add_argument("--months",         type=int,   default=24)
    ap.add_argument("--ubi_mode",       choices=["universal", "targeted"], default="universal")
    ap.add_argument("--ubi_universal",  type=float, default=1000.0)
    ap.add_argument("--ubi_floor",      type=float, default=600.0)
    ap.add_argument("--fisc_start",     type=float, default=10000.0)
    ap.add_argument("--mpc_rate",       type=float, default=0.15)
    ap.add_argument("--c_mcd",          type=float, default=300.0)
    ap.add_argument("--c_coffee",       type=float, default=150.0)
    ap.add_argument("--c_external",     type=float, default=150.0)
    ap.add_argument("--pottery_rev",    type=float, default=2000.0)
    ap.add_argument("--fx_pct",         type=float, default=0.50)
    ap.add_argument("--working_bal",    type=float, default=600.0)
    ap.add_argument("--json",           action="store_true", help="Emit JSON instead of table")
    args = ap.parse_args(argv)

    model = ColonyModel(
        ubi_mode=args.ubi_mode,
        ubi_universal=args.ubi_universal,
        ubi_floor=args.ubi_floor,
        fisc_start=args.fisc_start,
        mpc_rate=args.mpc_rate,
        c_mcd=args.c_mcd,
        c_coffee=args.c_coffee,
        c_external=args.c_external,
        pottery_rev=args.pottery_rev,
        fx_pct=args.fx_pct,
        working_bal=args.working_bal,
    )
    for _ in range(args.months):
        model.step()

    df = model.datacollector.get_model_vars_dataframe()
    # The first row is the initial month-0 snapshot; the rest are post-step.
    records = df.to_dict(orient="records")
    for i, r in enumerate(records):
        r["month"] = i  # row index = month number

    if args.json:
        json.dump(records, sys.stdout, indent=2, default=str)
        sys.stdout.write("\n")
        return

    # Pretty table for terminal viewing
    print(f"AXION toy colony — ABM run ({args.months} months, ubi_mode={args.ubi_mode}, "
          f"fx_pct={args.fx_pct}, working_bal={args.working_bal})")
    print()
    print(f"{'Month':>5} {'Fisc USD':>11} {'MOND out':>10} {'USD saved':>11} "
          f"{'Bob':>7} {'Alice':>7} {'John':>7} {'Jane':>7} {'FX out':>8}")
    print("-" * 95)
    for r in records:
        m = r["month"]
        if not (m in (0, 1, 2, 3, 6, 12, 18) or m == args.months):
            continue
        usd_save = (r["bob_usd_save"] + r["alice_usd_save"]
                    + r["john_usd_save"] + r["jane_usd_save"])
        print(f"{m:>5} {r['fisc_usd']:>11,.0f} {r['mond_outstanding']:>10,.0f} "
              f"{usd_save:>11,.0f} "
              f"{r['bob_mond']:>7,.0f} {r['alice_mond']:>7,.0f} "
              f"{r['john_mond']:>7,.0f} {r['jane_mond']:>7,.0f} "
              f"{r['fx_outflow']:>8,.0f}")


if __name__ == "__main__":
    main()
