"""
MaryFontaine simulator dashboard — stdlib HTTP server.

No external deps. Run:
    python docs/economy-model/maryfontaine/dashboard/server.py [--port 8765] [--db /tmp/mf.db]

Then open http://localhost:8765 in a browser.

Endpoints:
    GET  /                         — serves dashboard.html
    GET  /static/<path>            — serves static files (css/js)
    GET  /api/state                — current run config + summary
    GET  /api/macro                — fisc_state timeline (rate/reserve/supply/basket)
    GET  /api/boundary             — USDC inflows/outflows by month + type
    GET  /api/welfare              — citizen purchasing-power deciles by year
    GET  /api/transitions          — archetype transitions per year/from/to
    GET  /api/companies            — top companies by Y10 balance
    POST /api/run                  — body = SimConfig JSON; runs simulation, returns status
"""
from __future__ import annotations
import argparse
import json
import os
import sqlite3
import sys
import threading
import time
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Local imports — this script lives at maryfontaine/dashboard/server.py;
# the simulator modules are one dir up
HERE = Path(__file__).resolve().parent
SIM_DIR = HERE.parent
sys.path.insert(0, str(SIM_DIR))

from config import SimConfig, from_json, to_json
from scenarios import build_trajectory, ANNUAL_RATES, BASKET_WEIGHTS_USD, BASKET_TARGET_S
from tick import SimState, load_state, tick_one_month, flush_to_db, TxRecorder
from generate_founding import (
    open_db, apply_schema, gen_citizens, gen_households, gen_companies,
    gen_equity, gen_wallets, write_to_db, GenContext
)
import random


# ── Run state (single-run-at-a-time) ─────────────────────────────────────────

class RunState:
    """In-process tracker of the current/last run."""
    def __init__(self):
        self.lock = threading.Lock()
        self.is_running = False
        self.current_config: dict | None = None
        self.progress = ""           # e.g. "Y3 of 10"
        self.last_error: str | None = None
        self.last_completed_at: float = 0.0

RUN = RunState()


# ── Helpers ──────────────────────────────────────────────────────────────────

def ensure_founding(db_path: Path, cfg: SimConfig) -> None:
    """If db_path exists, blow it away and regenerate founding."""
    if db_path.exists():
        db_path.unlink()
    rng = random.Random(cfg.seed)
    random.seed(cfg.seed)
    target_pop = int(round(39_000 * cfg.scale))
    target_hh = int(round(1_500 * cfg.scale))
    ctx = GenContext(rng=rng, scale=cfg.scale, target_population=target_pop, target_households=target_hh)
    citizens = gen_citizens(ctx)
    households = gen_households(ctx, citizens)
    companies = gen_companies(ctx, citizens)
    equity = gen_equity(ctx, citizens, companies)
    wallets = gen_wallets(citizens, companies)
    conn = open_db(db_path)
    apply_schema(conn, SIM_DIR / "schema.sql")
    write_to_db(conn, citizens, households, companies, equity, wallets,
                scenario=cfg.scenario, scale=cfg.scale, seed=cfg.seed)
    conn.close()


def run_simulation(db_path: Path, cfg: SimConfig) -> None:
    """Full pipeline: regenerate founding, load state, run all months, flush."""
    ensure_founding(db_path, cfg)
    conn = sqlite3.connect(str(db_path))
    state = load_state(conn, seed=cfg.seed)
    trajectory = build_trajectory(cfg.scenario, months=cfg.months,
                                  noise_sigma=cfg.noise_sigma, seed=cfg.seed)
    txs = TxRecorder()
    citizen_snaps = []; company_snaps = []; fisc_states = []; unmet_demand = []
    for m in range(1, cfg.months + 1):
        tick_one_month(state, cfg, trajectory, m,
                       txs, citizen_snaps, company_snaps, fisc_states, unmet_demand)
        if m % 12 == 0:
            with RUN.lock:
                RUN.progress = f"Y{m // 12} of {cfg.months // 12}"
    flush_to_db(conn, state, txs, citizen_snaps, company_snaps, fisc_states, unmet_demand)
    conn.close()


# ── Query helpers ────────────────────────────────────────────────────────────

def macro_data(db_path: Path) -> dict:
    if not db_path.exists():
        return {"months": [], "rate": [], "reserve": [], "supply": [],
                "basket_s": [], "basket_usd": [], "compressed": []}
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT year, month, fisc_rate, usdc_reserve, s_supply_total,
               basket_cost_s, basket_cost_usd, rate_compressed
        FROM fisc_state ORDER BY year, month
    """).fetchall()
    conn.close()
    return {
        "months": [r[0] * 12 + r[1] for r in rows],
        "rate": [r[2] for r in rows],
        "reserve": [r[3] for r in rows],
        "supply": [r[4] for r in rows],
        "basket_s": [r[5] for r in rows],
        "basket_usd": [r[6] for r in rows],
        "compressed": [bool(r[7]) for r in rows],
    }


def boundary_data(db_path: Path) -> dict:
    """Aggregate USDC flows by month and type."""
    if not db_path.exists():
        return {"months": [], "inflows": {}, "outflows": {}}
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    inflows: dict = {}
    outflows: dict = {}
    months = []
    rows = cur.execute("""
        SELECT year, month, type, SUM(usdc_amount)
        FROM transactions
        WHERE usdc_amount != 0
        GROUP BY year, month, type
        ORDER BY year, month
    """).fetchall()
    month_set = set()
    for r in rows:
        ym = r[0] * 12 + r[1]
        month_set.add(ym)
        type_ = r[2]
        amt = r[3] or 0
        target = inflows if type_ in ("export", "external_income") else outflows
        target.setdefault(type_, {})[ym] = target.setdefault(type_, {}).get(ym, 0) + amt
    months_sorted = sorted(month_set)
    # Convert per-type dicts to lists aligned to months_sorted
    def to_lists(bucket: dict) -> dict:
        out = {}
        for k, monthmap in bucket.items():
            out[k] = [monthmap.get(m, 0) for m in months_sorted]
        return out
    conn.close()
    return {
        "months": months_sorted,
        "inflows": to_lists(inflows),
        "outflows": to_lists(outflows),
    }


def welfare_data(db_path: Path) -> dict:
    """Citizen purchasing power per year — deciles of (monthly_income_s / basket_cost_s)."""
    if not db_path.exists():
        return {"years": [], "deciles": []}
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT year, real_purchasing_power
        FROM citizen_snapshots
        WHERE real_purchasing_power IS NOT NULL
        ORDER BY year, real_purchasing_power
    """).fetchall()
    by_year: dict = {}
    for y, pp in rows:
        by_year.setdefault(y, []).append(pp)
    years = sorted(by_year.keys())
    deciles = []
    for y in years:
        vals = by_year[y]
        n = len(vals)
        if n == 0:
            deciles.append([0]*11)
            continue
        d = []
        for i in range(11):  # min, p10, p20, ..., p90, max
            idx = min(n - 1, max(0, int(round(i * (n - 1) / 10))))
            d.append(vals[idx])
        deciles.append(d)
    conn.close()
    return {"years": years, "deciles": deciles}


def transitions_data(db_path: Path) -> dict:
    if not db_path.exists():
        return {"by_year": []}
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT year, from_archetype, to_archetype, COUNT(*)
        FROM archetype_history
        GROUP BY year, from_archetype, to_archetype
        ORDER BY year
    """).fetchall()
    conn.close()
    return {"by_year": [{"year": r[0], "from": r[1], "to": r[2], "n": r[3]} for r in rows]}


def companies_data(db_path: Path) -> dict:
    if not db_path.exists():
        return {"top_balance": [], "top_revenue": [], "honda": None, "mcc": None}
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    # Top by final balance
    top_bal = cur.execute("""
        SELECT c.name, c.sector, w.s_balance
        FROM companies c JOIN wallets w ON w.owner_type='company' AND w.owner_id=c.id
        WHERE c.closed_year IS NULL
        ORDER BY w.s_balance DESC LIMIT 20
    """).fetchall()
    # Honda + MCC summary timeline
    honda_id = (cur.execute("SELECT id FROM companies WHERE sector='automotive_manufacturing' LIMIT 1").fetchone() or [None])[0]
    mcc_id = (cur.execute("SELECT id FROM companies WHERE is_mcc=1 LIMIT 1").fetchone() or [None])[0]
    def co_timeline(cid):
        if cid is None:
            return None
        rows = cur.execute("""
            SELECT year, month, s_balance, monthly_revenue_s, monthly_dividend_distributed_s
            FROM company_snapshots WHERE company_id=? ORDER BY year, month
        """, (cid,)).fetchall()
        return {
            "months": [r[0]*12+r[1] for r in rows],
            "balance": [r[2] for r in rows],
            "revenue": [r[3] for r in rows],
            "dividend": [r[4] for r in rows],
        }
    out = {
        "top_balance": [{"name": r[0], "sector": r[1], "balance": r[2]} for r in top_bal],
        "honda": co_timeline(honda_id),
        "mcc": co_timeline(mcc_id),
    }
    conn.close()
    return out


def state_summary(db_path: Path) -> dict:
    """High-level summary for the dashboard header."""
    if not db_path.exists():
        return {"has_run": False}
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    meta = dict(cur.execute("SELECT key, value FROM run_metadata").fetchall())
    last = cur.execute("""
        SELECT year, month, fisc_rate, usdc_reserve, s_supply_total,
               basket_cost_s, basket_cost_usd, rate_compressed
        FROM fisc_state ORDER BY year DESC, month DESC LIMIT 1
    """).fetchone()
    n_citizens = cur.execute("SELECT COUNT(*) FROM citizens WHERE death_year IS NULL").fetchone()[0]
    n_companies = cur.execute("SELECT COUNT(*) FROM companies WHERE closed_year IS NULL").fetchone()[0]
    conn.close()
    if not last:
        return {"has_run": False, "metadata": meta}
    return {
        "has_run": True,
        "metadata": meta,
        "n_citizens": n_citizens,
        "n_companies": n_companies,
        "last_year": last[0], "last_month": last[1],
        "fisc_rate": last[2], "reserve": last[3], "supply": last[4],
        "basket_s": last[5], "basket_usd": last[6],
        "rate_compressed": bool(last[7]),
        "purchasing_power_loss_pct": (1 - (100 / last[5]) / (100 / 28)) * 100 if last[5] > 0 else 0,
    }


# ── HTTP handler ─────────────────────────────────────────────────────────────

class DashboardHandler(BaseHTTPRequestHandler):
    db_path: Path = None
    static_dir: Path = None
    templates_dir: Path = None

    def log_message(self, fmt, *args):
        # Quieter: prefix with timestamp, drop pesky ones
        sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] {self.address_string()} {fmt % args}\n")

    def _send_json(self, code: int, payload) -> None:
        body = json.dumps(payload, default=str).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path: Path, content_type: str) -> None:
        if not path.exists():
            self.send_error(404, f"not found: {path.name}")
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        url = urlparse(self.path)
        p = url.path
        try:
            if p == "/" or p == "/index.html":
                self._send_file(self.templates_dir / "dashboard.html", "text/html; charset=utf-8")
            elif p == "/how":
                self._send_file(self.templates_dir / "how.html", "text/html; charset=utf-8")
            elif p == "/story":
                self._send_file(self.templates_dir / "story.html", "text/html; charset=utf-8")
            elif p == "/levers":
                self._send_file(self.templates_dir / "levers.html", "text/html; charset=utf-8")
            elif p.startswith("/static/"):
                rel = p[len("/static/"):]
                content_type = "application/javascript" if rel.endswith(".js") else \
                               "text/css" if rel.endswith(".css") else \
                               "application/octet-stream"
                self._send_file(self.static_dir / rel, content_type)
            elif p == "/api/state":
                with RUN.lock:
                    rs = {
                        "is_running": RUN.is_running,
                        "current_config": RUN.current_config,
                        "progress": RUN.progress,
                        "last_error": RUN.last_error,
                        "last_completed_at": RUN.last_completed_at,
                    }
                self._send_json(200, {**rs, **state_summary(self.db_path)})
            elif p == "/api/macro":
                self._send_json(200, macro_data(self.db_path))
            elif p == "/api/boundary":
                self._send_json(200, boundary_data(self.db_path))
            elif p == "/api/welfare":
                self._send_json(200, welfare_data(self.db_path))
            elif p == "/api/transitions":
                self._send_json(200, transitions_data(self.db_path))
            elif p == "/api/companies":
                self._send_json(200, companies_data(self.db_path))
            elif p == "/api/scenarios":
                self._send_json(200, {"scenarios": list(ANNUAL_RATES.keys())})
            elif p == "/api/defaults":
                self._send_json(200, to_json(SimConfig()))
            else:
                self.send_error(404, "unknown path")
        except Exception:
            traceback.print_exc()
            self._send_json(500, {"error": traceback.format_exc(limit=2)})

    def do_POST(self) -> None:
        url = urlparse(self.path)
        p = url.path
        try:
            if p == "/api/run":
                length = int(self.headers.get("Content-Length", "0"))
                body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
                data = json.loads(body or "{}")
                cfg = from_json(data)

                with RUN.lock:
                    if RUN.is_running:
                        self._send_json(409, {"error": "a run is already in progress"})
                        return
                    RUN.is_running = True
                    RUN.current_config = to_json(cfg)
                    RUN.progress = "starting..."
                    RUN.last_error = None

                t = threading.Thread(target=self._run_thread, args=(cfg,), daemon=True)
                t.start()
                self._send_json(202, {"status": "started"})
            else:
                self.send_error(404, "unknown path")
        except Exception:
            traceback.print_exc()
            with RUN.lock:
                RUN.is_running = False
                RUN.last_error = traceback.format_exc(limit=2)
            self._send_json(500, {"error": traceback.format_exc(limit=2)})

    def _run_thread(self, cfg: SimConfig) -> None:
        try:
            run_simulation(self.db_path, cfg)
            with RUN.lock:
                RUN.progress = "complete"
                RUN.last_completed_at = time.time()
        except Exception:
            traceback.print_exc()
            with RUN.lock:
                RUN.last_error = traceback.format_exc(limit=4)
        finally:
            with RUN.lock:
                RUN.is_running = False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--db", default=str(HERE / "mf_dashboard.db"),
                    help="SQLite DB path; will be regenerated on each Run")
    ap.add_argument("--bind", default="127.0.0.1")
    args = ap.parse_args()

    DashboardHandler.db_path = Path(args.db)
    DashboardHandler.static_dir = HERE / "static"
    DashboardHandler.templates_dir = HERE / "templates"

    httpd = ThreadingHTTPServer((args.bind, args.port), DashboardHandler)
    print(f"MaryFontaine dashboard at http://{args.bind}:{args.port}", file=sys.stderr)
    print(f"DB: {args.db}", file=sys.stderr)
    print(f"Static: {DashboardHandler.static_dir}", file=sys.stderr)
    print(f"Templates: {DashboardHandler.templates_dir}", file=sys.stderr)
    print(f"Press Ctrl-C to stop.", file=sys.stderr)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.", file=sys.stderr)
        httpd.shutdown()


if __name__ == "__main__":
    main()
