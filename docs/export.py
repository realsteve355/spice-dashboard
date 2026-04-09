"""
Mars Colony Economy — Data Export
===================================
Reads colony.db and writes a set of compact JSON files to mars-data/
for deployment to Vercel as static assets.

Run AFTER simulate.py:
    python simulate.py    (generates colony.db, ~3 mins)
    python export.py      (generates mars-data/*.json, ~30 seconds)

Then commit mars-data/ to the SPICE repo and push to trigger Vercel deploy.

Output files:
    mars-data/meta.json               — simulation metadata and run info
    mars-data/annual_summaries.json   — 200 years of colony-wide stats
    mars-data/viability.json          — pre-computed health check data
    mars-data/companies.json          — all companies, lifetime stats
    mars-data/citizens.json           — all citizens, summary only
    mars-data/citizen_snapshots.json  — annual wealth snapshots per citizen
    mars-data/mcc.json                — MCC history and board votes
    mars-data/services_by_year.json   — top services aggregated per year
    mars-data/company_revenue.json    — revenue per company per year
    mars-data/life_stories.json       — full transaction history for
                                        20 curated citizens
    mars-data/mcc_bills_sample.json   — sampled MCC bills (year 6 of each decade)
"""

import sqlite3
import json
import os
import time
from pathlib import Path

DB_PATH   = "colony.db"
OUT_DIR   = "mars-data"
N_STORIES = 20   # number of citizens to include full life stories for

# ── Helpers ───────────────────────────────────────────────────────

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def write(filename, data):
    path = Path(OUT_DIR) / filename
    with open(path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))  # compact, no whitespace
    size = path.stat().st_size
    print(f"  {filename:45s} {size/1024:6.1f} KB")
    return size

def rows(conn, sql, params=()):
    return [dict(r) for r in conn.execute(sql, params).fetchall()]

# ── Main export ───────────────────────────────────────────────────

def export():
    if not os.path.exists(DB_PATH):
        print(f"ERROR: {DB_PATH} not found. Run simulate.py first.")
        exit(1)

    Path(OUT_DIR).mkdir(exist_ok=True)
    print(f"\nMars Colony Data Export")
    print(f"{'='*55}")
    print(f"Reading: {DB_PATH}")
    print(f"Writing: {OUT_DIR}/\n")

    t0 = time.time()
    conn = db()
    total_bytes = 0

    # ── Meta ──────────────────────────────────────────────────────
    years = conn.execute("SELECT COUNT(*) FROM annual_summaries").fetchone()[0]
    citizens = conn.execute("SELECT COUNT(*) FROM citizens").fetchone()[0]
    companies = conn.execute("SELECT COUNT(*) FROM companies").fetchone()[0]
    txns = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
    pop_start = conn.execute("SELECT population FROM annual_summaries ORDER BY year LIMIT 1").fetchone()
    pop_end   = conn.execute("SELECT population FROM annual_summaries ORDER BY year DESC LIMIT 1").fetchone()

    meta = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "simulation_years": years,
        "total_citizens_ever": citizens,
        "total_companies_ever": companies,
        "total_transactions": txns,
        "population_start": pop_start[0] if pop_start else 0,
        "population_end":   pop_end[0]   if pop_end   else 0,
        "version": "V2",
        "description": "Mars Colony Economy simulation — 200 year run"
    }
    total_bytes += write("meta.json", meta)

    # ── Annual summaries ──────────────────────────────────────────
    annual = rows(conn, """
        SELECT year, population, total_v_tokens, mean_v, median_v, max_v,
               active_companies, mcc_infra_health, mcc_revenue,
               mcc_v_tokens, mcc_board_share_pct, mcc_approval,
               colony_gdp, total_transactions, total_s_issued
        FROM annual_summaries ORDER BY year
    """)
    # Round floats to 2dp to reduce file size
    for r in annual:
        for k, v in r.items():
            if isinstance(v, float):
                r[k] = round(v, 2)
    total_bytes += write("annual_summaries.json", annual)

    # ── Viability ─────────────────────────────────────────────────
    viab_rows = rows(conn, """
        SELECT a.year, a.population, a.total_v_tokens, a.mean_v, a.median_v,
               a.max_v, a.active_companies, a.mcc_infra_health, a.mcc_revenue,
               a.mcc_v_tokens, a.mcc_approval, a.colony_gdp,
               COALESCE(v.avg_mcc_bill, 0) as avg_mcc_bill,
               COALESCE(v.total_dividends, 0) as total_dividends,
               COALESCE(v.dividend_recipients, 0) as dividend_recipients,
               COALESCE(v.v_concentration_pct, 0) as v_concentration_pct
        FROM annual_summaries a
        LEFT JOIN viability_summary v ON v.year = a.year
        ORDER BY a.year
    """)
    for r in viab_rows:
        for k, v in r.items():
            if isinstance(v, float):
                r[k] = round(v, 2)

    formed = conn.execute("SELECT COUNT(*) FROM companies WHERE is_mcc=0").fetchone()[0]
    closed = conn.execute("SELECT COUNT(*) FROM companies WHERE closed_year IS NOT NULL AND is_mcc=0").fetchone()[0]

    total_bytes += write("viability.json", {
        "rows": viab_rows,
        "companies_formed": formed,
        "companies_closed": closed
    })

    # ── Companies ─────────────────────────────────────────────────
    cos = rows(conn, """
        SELECT c.id, c.name, c.sector, c.founded_year, c.closed_year,
               c.is_mcc, c.founder_ids,
               COALESCE(SUM(CASE WHEN t.transaction_type='purchase'
                            THEN t.amount END), 0) as total_revenue,
               COALESCE(COUNT(DISTINCT CASE WHEN t.transaction_type='purchase'
                              THEN t.citizen_id END), 0) as total_customers
        FROM companies c
        LEFT JOIN transactions t ON t.company_id = c.id
        GROUP BY c.id
        ORDER BY c.is_mcc DESC, total_revenue DESC
    """)
    for r in cos:
        r['total_revenue'] = round(r['total_revenue'], 0)
    total_bytes += write("companies.json", cos)

    # ── Company revenue by year ───────────────────────────────────
    co_rev = rows(conn, """
        SELECT company_id, year,
               ROUND(SUM(amount), 0) as revenue,
               COUNT(*) as transactions
        FROM transactions
        WHERE transaction_type = 'purchase'
        GROUP BY company_id, year
        ORDER BY company_id, year
    """)
    total_bytes += write("company_revenue.json", co_rev)

    # ── Citizens summary ──────────────────────────────────────────
    cits = rows(conn, """
        SELECT ci.id, ci.name, ci.birth_year, ci.death_year,
               ci.profession, ci.is_board_member,
               cs.v_tokens as final_v_tokens,
               cs.age as final_age,
               cs.mcc_bill_total as avg_mcc_bill,
               cs.habitat_size, cs.power_usage, cs.water_usage
        FROM citizens ci
        LEFT JOIN citizen_snapshots cs ON cs.citizen_id = ci.id
            AND cs.year = (
                SELECT MAX(year) FROM citizen_snapshots
                WHERE citizen_id = ci.id
            )
        ORDER BY ci.id
    """)
    for r in cits:
        for k, v in r.items():
            if isinstance(v, float):
                r[k] = round(v, 2)
    total_bytes += write("citizens.json", cits)

    # ── Citizen snapshots (annual, all citizens) ──────────────────
    snaps = rows(conn, """
        SELECT citizen_id, year, age, v_tokens, mcc_bill_total
        FROM citizen_snapshots
        ORDER BY citizen_id, year
    """)
    for r in snaps:
        for k, v in r.items():
            if isinstance(v, float):
                r[k] = round(v, 1)
    total_bytes += write("citizen_snapshots.json", snaps)

    # ── MCC history ───────────────────────────────────────────────
    mcc_hist = rows(conn, """
        SELECT a.year, a.mcc_infra_health, a.mcc_revenue,
               a.mcc_v_tokens, a.mcc_board_share_pct, a.mcc_approval,
               v.infra_health, v.for_pct, v.board_share_pct,
               v.approval, v.board_total_earnings
        FROM annual_summaries a
        LEFT JOIN mcc_votes v ON v.year = a.year
        ORDER BY a.year
    """)
    for r in mcc_hist:
        for k, v in r.items():
            if isinstance(v, float):
                r[k] = round(v, 3)
    total_bytes += write("mcc.json", mcc_hist)

    # ── Services by year (top 15 per year) ───────────────────────
    # This is the aggregation that was slow in live queries
    svc_rows = rows(conn, """
        SELECT year, service_name,
               ROUND(SUM(amount), 0) as total,
               COUNT(*) as count
        FROM transactions
        WHERE transaction_type = 'purchase'
        GROUP BY year, service_name
        ORDER BY year, total DESC
    """)
    # Keep top 15 per year to limit size
    from itertools import groupby
    svc_by_year = {}
    for year, group in groupby(svc_rows, key=lambda x: x['year']):
        svc_by_year[str(year)] = list(group)[:15]
    total_bytes += write("services_by_year.json", svc_by_year)

    # ── MCC bills sample (every 5 years) ─────────────────────────
    bill_years = [y for y in range(1, years+1, 5)]
    if bill_years:
        placeholders = ','.join('?' * len(bill_years))
        bills = rows(conn, f"""
            SELECT citizen_id, year, atmos, power, water,
                   habitat, comms, ai_health, total
            FROM mcc_bills
            WHERE year IN ({placeholders})
            ORDER BY year, citizen_id
        """, bill_years)
        for r in bills:
            for k, v in r.items():
                if isinstance(v, float):
                    r[k] = round(v, 1)
        total_bytes += write("mcc_bills_sample.json", bills)

    # ── Life stories — 20 curated citizens ───────────────────────
    # Select interesting citizens:
    # - longest-lived (top 5)
    # - highest final V-tokens (top 5)
    # - board members (up to 5)
    # - most average (median wealth at final year, up to 5)

    all_snaps_last = rows(conn, """
        SELECT cs.citizen_id, cs.v_tokens, cs.age, ci.name,
               ci.birth_year, ci.death_year, ci.profession,
               ci.is_board_member
        FROM citizen_snapshots cs
        JOIN citizens ci ON ci.id = cs.citizen_id
        WHERE cs.year = (
            SELECT MAX(year) FROM citizen_snapshots
            WHERE citizen_id = cs.citizen_id
        )
        ORDER BY cs.v_tokens DESC
    """)

    story_ids = set()

    # Top 5 by V-tokens
    for r in all_snaps_last[:5]:
        story_ids.add(r['citizen_id'])

    # Board members (up to 5)
    for r in all_snaps_last:
        if r['is_board_member'] and len([x for x in story_ids]) < 10:
            story_ids.add(r['citizen_id'])

    # Longest lived
    long_lived = rows(conn, """
        SELECT id FROM citizens
        WHERE death_year IS NOT NULL
        ORDER BY (death_year - birth_year) DESC
        LIMIT 5
    """)
    for r in long_lived:
        story_ids.add(r['id'])

    # Most average (closest to median V-tokens)
    if all_snaps_last:
        sorted_by_v = sorted(all_snaps_last, key=lambda x: x['v_tokens'])
        mid = len(sorted_by_v) // 2
        for r in sorted_by_v[mid-2:mid+3]:
            story_ids.add(r['citizen_id'])
            if len(story_ids) >= N_STORIES:
                break

    story_ids = list(story_ids)[:N_STORIES]
    print(f"\n  Generating life stories for {len(story_ids)} citizens...")

    life_stories = {}
    for cid in story_ids:
        citizen = rows(conn, "SELECT * FROM citizens WHERE id=?", (cid,))
        if not citizen:
            continue
        citizen = citizen[0]

        wealth_hist = rows(conn, """
            SELECT year, age, v_tokens, mcc_bill_total,
                   habitat_size, power_usage, water_usage
            FROM citizen_snapshots
            WHERE citizen_id=? ORDER BY year
        """, (cid,))
        for r in wealth_hist:
            for k, v in r.items():
                if isinstance(v, float):
                    r[k] = round(v, 2)

        txn_hist = rows(conn, """
            SELECT t.year, t.month, t.service_name, t.amount,
                   t.transaction_type, c.name as company_name
            FROM transactions t
            LEFT JOIN companies c ON c.id = t.company_id
            WHERE t.citizen_id = ?
            AND t.transaction_type IN (
                'dividend','inheritance','board_payment',
                'v_redeem','mcc_bill'
            )
            ORDER BY t.year, t.month
            LIMIT 500
        """, (cid,))
        for r in txn_hist:
            if isinstance(r.get('amount'), float):
                r['amount'] = round(r['amount'], 2)

        # Key life events
        events = []
        if txn_hist:
            first_div = next((t for t in txn_hist if t['transaction_type']=='dividend'), None)
            if first_div:
                events.append({"year": first_div['year'], "event": "First equity dividend received"})

        # V-token milestones
        milestones = [1000, 5000, 10000, 50000]
        prev_v = 0
        for snap in wealth_hist:
            for m in milestones:
                if prev_v < m <= snap['v_tokens']:
                    events.append({"year": snap['year'],
                                   "event": f"V-token milestone: {m:,} V-tokens accumulated"})
            prev_v = snap['v_tokens']

        # Inheritance received
        inheritance = [t for t in txn_hist if t['transaction_type']=='inheritance']
        if inheritance:
            events.append({"year": inheritance[0]['year'],
                           "event": f"Received inheritance of {sum(t['amount'] for t in inheritance):,.0f} V-tokens"})

        # Board payment
        board_pays = [t for t in txn_hist if t['transaction_type']=='board_payment']
        if board_pays:
            events.append({"year": board_pays[0]['year'],
                           "event": "First MCC board profit share payment received"})

        events.sort(key=lambda e: e['year'])

        # Summary stats
        all_divs = [t for t in txn_hist if t['transaction_type']=='dividend']
        all_bills = [t for t in txn_hist if t['transaction_type']=='mcc_bill']

        life_stories[str(cid)] = {
            "citizen": citizen,
            "wealth_history": wealth_hist,
            "key_events": events[:20],
            "summary": {
                "total_dividends_received": round(sum(t['amount'] for t in all_divs), 0),
                "total_mcc_paid": round(sum(t['amount'] for t in all_bills), 0),
                "peak_v_tokens": round(max((s['v_tokens'] for s in wealth_hist), default=0), 0),
                "final_v_tokens": round(wealth_hist[-1]['v_tokens'] if wealth_hist else 0, 0),
                "years_lived_in_colony": (citizen['death_year'] or years) - max(1, citizen['birth_year']),
            }
        }

    total_bytes += write("life_stories.json", life_stories)

    # ── Done ─────────────────────────────────────────────────────
    conn.close()
    elapsed = time.time() - t0
    print(f"\n{'='*55}")
    print(f"Export complete in {elapsed:.1f}s")
    print(f"Total size: {total_bytes/1024:.0f} KB ({total_bytes/1024/1024:.2f} MB)")
    print(f"\nNext steps:")
    print(f"  1. Copy mars-data/ into the SPICE repo")
    print(f"  2. git add mars-data/")
    print(f"  3. git commit -m 'Update Mars Colony simulation data'")
    print(f"  4. git push  →  Vercel auto-deploys")

if __name__ == "__main__":
    export()
