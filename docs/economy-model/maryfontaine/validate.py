"""
MaryFontaine simulator — founding data validator.

Sanity-checks the DB after generate_founding.py runs. Surfaces issues that
would only manifest deep in the simulation if not caught at founding.

Run:
    python -m docs.economy-model.maryfontaine.validate --db mf.db
"""
from __future__ import annotations
import argparse
import sqlite3
import sys
from pathlib import Path

from scenarios import BASKET_WEIGHTS_USD, BASKET_TARGET_S


class Check:
    def __init__(self, name: str):
        self.name = name
        self.passed = True
        self.notes: list[str] = []

    def expect(self, condition: bool, msg: str) -> None:
        if not condition:
            self.passed = False
            self.notes.append(msg)

    def warn(self, msg: str) -> None:
        self.notes.append(f"WARN: {msg}")


def q(conn, sql, params=()):
    return conn.execute(sql, params).fetchall()


def q1(conn, sql, params=()):
    row = conn.execute(sql, params).fetchone()
    return row[0] if row else None


# ── Individual checks ────────────────────────────────────────────────────────

def check_population(conn, scale: float) -> Check:
    c = Check("population")
    n = q1(conn, "SELECT COUNT(*) FROM citizens")
    expected = int(round(39_000 * scale))
    c.expect(n == expected, f"expected {expected} citizens, got {n}")
    children = q1(conn, "SELECT COUNT(*) FROM citizens WHERE archetype='children_under_18'")
    pct_children = children / n if n else 0
    c.expect(0.20 <= pct_children <= 0.26, f"children pct {pct_children:.2%} outside 20-26%")
    return c


def check_archetypes(conn) -> Check:
    c = Check("archetype distribution")
    expected_pcts = {
        "children_under_18": 0.231, "honda_assembly": 0.082, "honda_admin": 0.021,
        "other_manufacturing": 0.064, "healthcare_worker": 0.046, "education_worker": 0.031,
        "retail_services": 0.103, "small_business_owner": 0.038, "sole_trader": 0.051,
        "remote_worker": 0.038, "retiree": 0.218, "ubi_only_choice": 0.077,
    }
    n = q1(conn, "SELECT COUNT(*) FROM citizens")
    for archetype, expected_pct in expected_pcts.items():
        got = q1(conn, "SELECT COUNT(*) FROM citizens WHERE archetype=?", (archetype,))
        actual_pct = got / n
        c.expect(abs(actual_pct - expected_pct) < 0.005,
                 f"{archetype}: expected ~{expected_pct:.3f}, got {actual_pct:.3f} ({got}/{n})")
    return c


def check_households(conn) -> Check:
    c = Check("households")
    n_hh = q1(conn, "SELECT COUNT(*) FROM households")
    n_assigned = q1(conn, "SELECT COUNT(*) FROM citizens WHERE household_id IS NOT NULL")
    n_total = q1(conn, "SELECT COUNT(*) FROM citizens")
    c.expect(n_assigned == n_total, f"{n_total - n_assigned} citizens not assigned to a household")

    # Every household has a primary citizen
    orphan_hh = q1(conn, "SELECT COUNT(*) FROM households WHERE primary_citizen_id IS NULL")
    c.expect(orphan_hh == 0, f"{orphan_hh} households without a primary citizen")

    # Every primary citizen exists and is non-child
    bad_primary = q1(conn, """
        SELECT COUNT(*) FROM households h
        JOIN citizens c ON c.id = h.primary_citizen_id
        WHERE c.archetype = 'children_under_18'
    """)
    c.expect(bad_primary == 0, f"{bad_primary} households have a child as primary citizen")

    # No child without a household
    orphan_kids = q1(conn, """
        SELECT COUNT(*) FROM citizens c
        WHERE c.archetype='children_under_18' AND c.household_id IS NULL
    """)
    c.expect(orphan_kids == 0, f"{orphan_kids} children without households")

    # Housing distribution
    for housing in ("owner_free_and_clear", "owner_with_mortgage", "renter_internal", "renter_external"):
        cnt = q1(conn, "SELECT COUNT(*) FROM households WHERE housing_type=?", (housing,))
        pct = cnt / n_hh
        c.notes.append(f"  {housing}: {cnt} ({pct:.1%})")

    # Mortgage households all have positive mortgage_balance + monthly cost
    bad_mort = q1(conn, """
        SELECT COUNT(*) FROM households
        WHERE housing_type='owner_with_mortgage'
          AND (mortgage_balance_usd <= 0 OR monthly_housing_cost_usd <= 0)
    """)
    c.expect(bad_mort == 0, f"{bad_mort} mortgage households have invalid balance/cost")

    return c


def check_companies(conn, scale: float) -> Check:
    c = Check("companies")
    total = q1(conn, "SELECT COUNT(*) FROM companies")
    sole = q1(conn, "SELECT COUNT(*) FROM companies WHERE sector='sole_trader'")
    catalogue = total - sole
    # Catalogue target ~85 at 10% scale (per COMPANY_CATALOGUE summed)
    c.expect(60 <= catalogue <= 110, f"catalogue companies = {catalogue}, expected ~85 at 10% scale")
    c.notes.append(f"  catalogue: {catalogue}, sole_traders: {sole}, total: {total}")

    # Honda exists, has correct flags
    honda = q1(conn, "SELECT COUNT(*) FROM companies WHERE sector='automotive_manufacturing' AND is_external_owned=1 AND is_exporter=1")
    c.expect(honda == 1, f"expected 1 Honda (external-owned, exporter), got {honda}")

    # MCC exists, is utilities-only
    mcc = q1(conn, "SELECT COUNT(*) FROM companies WHERE is_mcc=1")
    c.expect(mcc == 1, f"expected 1 MCC, got {mcc}")
    mcc_sector = q1(conn, "SELECT sector FROM companies WHERE is_mcc=1")
    c.expect(mcc_sector == "utilities", f"MCC sector = {mcc_sector}, expected 'utilities'")

    # Healthcare and education sectors are private (not flagged as MCC)
    private_health = q1(conn, "SELECT COUNT(*) FROM companies WHERE sector='healthcare' AND is_mcc=0")
    private_edu = q1(conn, "SELECT COUNT(*) FROM companies WHERE sector='education' AND is_mcc=0")
    c.expect(private_health > 0, "no private healthcare companies")
    c.expect(private_edu > 0, "no private education companies")

    return c


def check_equity(conn) -> Check:
    c = Check("equity")
    # Honda equity: 60% Honda Inc + 5% colony stakeholders + 35% time-limited
    honda_id = q1(conn, "SELECT id FROM companies WHERE sector='automotive_manufacturing' LIMIT 1")
    if honda_id:
        total_shares = q1(conn,
            "SELECT SUM(share_count) FROM equity_holdings WHERE company_id=? AND cancelled=0", (honda_id,))
        honda_inc_shares = q1(conn,
            "SELECT SUM(share_count) FROM equity_holdings WHERE company_id=? AND external_holder_name='Honda Inc'", (honda_id,))
        timed_shares = q1(conn,
            "SELECT SUM(share_count) FROM equity_holdings WHERE company_id=? AND share_type='time_limited' AND cancelled=0", (honda_id,))
        if total_shares and total_shares > 0:
            honda_pct = honda_inc_shares / total_shares
            timed_pct = timed_shares / total_shares
            c.expect(0.55 <= honda_pct <= 0.65, f"Honda Inc shareholding {honda_pct:.1%}, expected ~60%")
            c.expect(0.30 <= timed_pct <= 0.40, f"Honda time-limited {timed_pct:.1%}, expected ~35%")

    # Sole trader companies: each has exactly one permanent holding of 100 shares from the citizen owner
    bad_sole = q1(conn, """
        SELECT COUNT(*) FROM companies c
        WHERE c.sector='sole_trader' AND c.id NOT IN (
            SELECT company_id FROM equity_holdings
            WHERE share_type='permanent' AND share_count = 100.0 AND holder_type='citizen'
        )
    """)
    c.expect(bad_sole == 0, f"{bad_sole} sole_trader companies missing canonical 100-share owner equity")

    # Every company has at least one holding
    no_equity = q1(conn, """
        SELECT COUNT(*) FROM companies WHERE id NOT IN (SELECT DISTINCT company_id FROM equity_holdings)
    """)
    c.expect(no_equity == 0, f"{no_equity} companies have no equity holdings")

    return c


def check_wallets(conn) -> Check:
    c = Check("wallets")
    # One wallet per citizen
    n_citizens = q1(conn, "SELECT COUNT(*) FROM citizens")
    n_citizen_wallets = q1(conn, "SELECT COUNT(*) FROM wallets WHERE owner_type='citizen'")
    c.expect(n_citizens == n_citizen_wallets, f"{n_citizens} citizens but {n_citizen_wallets} citizen wallets")

    # One wallet per company
    n_companies = q1(conn, "SELECT COUNT(*) FROM companies")
    n_company_wallets = q1(conn, "SELECT COUNT(*) FROM wallets WHERE owner_type='company'")
    c.expect(n_companies == n_company_wallets, f"{n_companies} companies but {n_company_wallets} company wallets")

    # Exactly one Fisc wallet
    n_fisc = q1(conn, "SELECT COUNT(*) FROM wallets WHERE owner_type='fisc'")
    c.expect(n_fisc == 1, f"expected 1 fisc wallet, got {n_fisc}")

    # Fisc has the founding USDC reserve ($5M at 10% scale, $50M at full)
    fisc_usdc = q1(conn, "SELECT usdc_balance FROM wallets WHERE owner_type='fisc'")
    c.notes.append(f"  fisc USDC reserve: ${fisc_usdc:,.2f}")

    # Total founding S supply should be very small (only retiree starting balances)
    total_s = q1(conn, "SELECT SUM(s_balance) FROM wallets")
    c.notes.append(f"  total S supply at founding: {total_s:,.2f}")

    return c


def check_basket(conn) -> Check:
    c = Check("basket")
    rows = q(conn, "SELECT name, weight_at_founding_usd FROM basket_categories ORDER BY name")
    cats = {r[0]: r[1] for r in rows}
    c.expect(set(cats.keys()) == set(BASKET_WEIGHTS_USD.keys()),
             f"basket categories mismatch: db={set(cats)} expected={set(BASKET_WEIGHTS_USD)}")
    total = sum(cats.values())
    c.expect(abs(total - BASKET_TARGET_S) < 0.01, f"basket total {total} != {BASKET_TARGET_S}")
    return c


def check_metadata(conn) -> Check:
    c = Check("run_metadata")
    rows = dict(q(conn, "SELECT key, value FROM run_metadata"))
    for k in ("scenario", "scale", "seed", "spec_version", "started_at"):
        c.expect(k in rows, f"missing metadata key: {k}")
    c.notes.append(f"  metadata: {rows}")
    return c


# ── Runner ────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    args = ap.parse_args()

    conn = sqlite3.connect(args.db)
    scale = float(q1(conn, "SELECT value FROM run_metadata WHERE key='scale'") or 0.1)

    checks = [
        check_population(conn, scale),
        check_archetypes(conn),
        check_households(conn),
        check_companies(conn, scale),
        check_equity(conn),
        check_wallets(conn),
        check_basket(conn),
        check_metadata(conn),
    ]

    all_pass = True
    print(f"\nMaryFontaine validation -- db={args.db} scale={scale}\n" + "-" * 60)
    for c in checks:
        status = "PASS" if c.passed else "FAIL"
        print(f"[{status}] {c.name}")
        for note in c.notes:
            print(f"  {note}")
        if not c.passed:
            all_pass = False
    print("-" * 60)
    print("OVERALL:", "PASS" if all_pass else "FAIL")
    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
