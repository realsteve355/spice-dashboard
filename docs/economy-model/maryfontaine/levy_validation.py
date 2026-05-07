"""
Phase F: Five validation tests from spice_levy_build_spec §10.

Test 1: Baseline — does the colony fund itself? (AI Realist, default levy)
Test 2: Stress test — does it survive The Transition?
Test 3: Parameter sweep — α 1.0..3.0, P_threshold $40K..$150K
Test 4: Internal commerce wedge effect — levy on vs off, AI Realist
Test 5: Comparison to previous failure modes — best mitigated config + levy

Output: levy_validation_results.json + a markdown findings file.
"""
from __future__ import annotations
import json
import sys
import time
import sqlite3
import tempfile
import random
from pathlib import Path
from dataclasses import asdict

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from config import SimConfig
from scenarios import build_trajectory
from tick import (
    SimState, load_state, tick_one_month, flush_to_db, TxRecorder,
    LEVY_CALIBRATION_RECORDS, SUPPLIER_LEVY_RECORDS,
    PROTOCOL_TREASURY_RECORDS, GAS_POOL_RECORDS, MCC_FEDERAL_REMITTANCE_RECORDS,
)
from generate_founding import (
    open_db, apply_schema, gen_citizens, gen_households, gen_companies,
    gen_equity, gen_wallets, write_to_db, GenContext, update_employee_counts,
)


def run_one(name: str, **overrides) -> dict:
    """Generate founding + run sim with overrides. Returns summary."""
    base = asdict(SimConfig())
    base.update(overrides)
    cfg = SimConfig(**{k: v for k, v in base.items() if k in SimConfig.__dataclass_fields__})

    db_path = Path(tempfile.gettempdir()) / f"validate_{int(time.time()*1000)}.db"
    if db_path.exists():
        db_path.unlink()
    rng = random.Random(cfg.seed); random.seed(cfg.seed)
    target_pop = int(round(39_000 * cfg.scale))
    target_hh = int(round(1_500 * cfg.scale))
    ctx = GenContext(rng=rng, scale=cfg.scale, target_population=target_pop, target_households=target_hh)
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

    # Reset module-level levy accumulators between runs
    LEVY_CALIBRATION_RECORDS.clear()
    SUPPLIER_LEVY_RECORDS.clear()
    PROTOCOL_TREASURY_RECORDS.clear()
    GAS_POOL_RECORDS.clear()
    MCC_FEDERAL_REMITTANCE_RECORDS.clear()

    conn = sqlite3.connect(str(db_path))
    state = load_state(conn, seed=cfg.seed)
    trajectory = build_trajectory(cfg.scenario, months=cfg.months, noise_sigma=cfg.noise_sigma, seed=cfg.seed)
    txs = TxRecorder()
    citizen_snaps = []; company_snaps = []; fisc_states = []; unmet = []
    t0 = time.time()
    for m in range(1, cfg.months + 1):
        tick_one_month(state, cfg, trajectory, m, txs, citizen_snaps, company_snaps, fisc_states, unmet)
    elapsed = time.time() - t0
    flush_to_db(conn, state, txs, citizen_snaps, company_snaps, fisc_states, unmet)
    conn.close()

    # Extract summary
    last = fisc_states[-1] if fisc_states else None
    y3 = next((f for f in fisc_states if f[0] * 12 + f[1] == 36), None)
    y6 = next((f for f in fisc_states if f[0] * 12 + f[1] == 72), None)
    y10 = last
    peg_break = next((f[0]*12+f[1] for f in fisc_states if f[10]), None)

    # Levy aggregates from in-memory records
    total_levy_usdc = sum(r[7] for r in SUPPLIER_LEVY_RECORDS) if SUPPLIER_LEVY_RECORDS else 0
    total_protocol_usdc = sum(r[3] for r in PROTOCOL_TREASURY_RECORDS) if PROTOCOL_TREASURY_RECORDS else 0
    total_gas_usdc = sum(r[3] for r in GAS_POOL_RECORDS) if GAS_POOL_RECORDS else 0
    final_k = LEVY_CALIBRATION_RECORDS[-1][4] if LEVY_CALIBRATION_RECORDS else cfg.k

    # PP loss
    pp_loss = (1 - (cfg.ubi_s_per_citizen / y10[8]) / (cfg.ubi_s_per_citizen / 28)) * 100 if (y10 and y10[8] > 0) else None

    db_path.unlink(missing_ok=True)
    return {
        "name": name,
        "scenario": cfg.scenario,
        "months": cfg.months,
        "levy_enabled": cfg.levy_enabled,
        "alpha": cfg.alpha,
        "p_threshold_usd": cfg.p_threshold_usd,
        "y3_basket_s": round(y3[8], 2) if y3 else None,
        "y6_basket_s": round(y6[8], 2) if y6 else None,
        "y10_basket_s": round(y10[8], 2) if y10 else None,
        "y10_reserve": round(y10[3], 0) if y10 else None,
        "y10_supply": round(y10[4], 0) if y10 else None,
        "y10_rate": round(y10[2], 4) if y10 else None,
        "peg_break_month": peg_break,
        "pp_loss_pct": round(pp_loss, 1) if pp_loss is not None else None,
        "total_levy_usdc": round(total_levy_usdc, 0),
        "total_protocol_usdc": round(total_protocol_usdc, 0),
        "total_gas_usdc": round(total_gas_usdc, 0),
        "final_k": round(final_k, 5),
        "elapsed_s": round(elapsed, 1),
    }


def main():
    results = {}
    print("Phase F validation — five tests", file=sys.stderr)
    print("=" * 60, file=sys.stderr)

    # Test 1: Baseline funding adequacy
    print("\nTest 1: AI Realist baseline with levy", file=sys.stderr)
    results["test1_baseline"] = [
        run_one("ai_realist_no_levy", scenario="ai_realist", months=120, levy_enabled=False),
        run_one("ai_realist_with_levy", scenario="ai_realist", months=120, levy_enabled=True),
    ]
    for r in results["test1_baseline"]:
        print(f"  {r['name']}: y10_basket_s={r['y10_basket_s']} pp_loss={r['pp_loss_pct']}%  "
              f"levy_total={r['total_levy_usdc']:,}", file=sys.stderr)

    # Test 2: Transition stress
    print("\nTest 2: Transition stress with levy", file=sys.stderr)
    results["test2_transition"] = [
        run_one("transition_no_levy", scenario="transition", months=120, levy_enabled=False),
        run_one("transition_with_levy", scenario="transition", months=120, levy_enabled=True),
    ]
    for r in results["test2_transition"]:
        print(f"  {r['name']}: y10_basket_s={r['y10_basket_s']} pp_loss={r['pp_loss_pct']}%  "
              f"levy_total={r['total_levy_usdc']:,}", file=sys.stderr)

    # Test 3: Parameter sweep
    print("\nTest 3: Parameter sweep on Transition", file=sys.stderr)
    results["test3_sweep"] = []
    for alpha in [1.0, 1.5, 2.0, 3.0]:
        for thresh in [40_000, 80_000, 150_000]:
            r = run_one(f"trans_alpha{alpha}_thr{thresh//1000}k",
                        scenario="transition", months=120, levy_enabled=True,
                        alpha=alpha, p_threshold_usd=thresh)
            results["test3_sweep"].append(r)
            print(f"  α={alpha} P_thr=${thresh//1000}K: y10_basket_s={r['y10_basket_s']} pp_loss={r['pp_loss_pct']}%",
                  file=sys.stderr)

    # Test 4: Internal commerce wedge — already covered by test1 levy on/off
    # (the comparison reveals whether internal levy suppresses commerce)
    print("\nTest 4: covered by test1 (levy on/off comparison)", file=sys.stderr)

    # Test 5: Best-mitigation combo with vs without levy
    print("\nTest 5: Best mitigations + levy vs without", file=sys.stderr)
    results["test5_combo"] = [
        run_one("trans_LATmortrefi_no_levy", scenario="transition", months=120,
                lat_enabled=True, lat_rate_pct=0.05,
                mortgage_refinance_to_s=True, external_rent_refinance=True,
                levy_enabled=False),
        run_one("trans_LATmortrefi_with_levy", scenario="transition", months=120,
                lat_enabled=True, lat_rate_pct=0.05,
                mortgage_refinance_to_s=True, external_rent_refinance=True,
                levy_enabled=True),
        run_one("trans_levy_only", scenario="transition", months=120, levy_enabled=True),
    ]
    for r in results["test5_combo"]:
        print(f"  {r['name']}: y10_basket_s={r['y10_basket_s']} pp_loss={r['pp_loss_pct']}%  "
              f"levy_total={r['total_levy_usdc']:,}", file=sys.stderr)

    out_path = HERE / "levy_validation_results.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nWrote {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
