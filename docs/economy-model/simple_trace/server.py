"""
Web dashboard for the simple_trace simulator.

Run:
    python server.py [--port 8766]

Then open http://localhost:8766 in a browser.

The server is stateless — each /api/run POST recomputes the full trace
in <100ms. No DB, no background sim, no scenarios.
"""
from __future__ import annotations
import argparse
import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from sim import run as run_sim
from trajectory import run as run_trajectory
from forecasts import get_forecasts


def run_abm(cfg):
    """Run a single Mesa-ABM scenario and a fixed 4-way policy comparison."""
    from abm.model import ColonyModel
    months = int(cfg.get("months", 24))

    def _series(model_cfg):
        model = ColonyModel(**model_cfg)
        for _ in range(months):
            model.step()
        df = model.datacollector.get_model_vars_dataframe()
        rows = df.to_dict(orient="records")
        for i, r in enumerate(rows):
            r["month"] = i
        return rows

    # Single scenario from user-supplied config
    base_cfg = dict(
        ubi_mode      = cfg.get("ubi_mode", "universal"),
        ubi_universal = float(cfg.get("ubi_universal", 1000)),
        ubi_floor     = float(cfg.get("ubi_floor", 600)),
        fisc_start    = float(cfg.get("fisc_start", 10000)),
        mpc_rate      = float(cfg.get("mpc_rate", 0.15)),
        c_mcd         = float(cfg.get("c_mcd", 300)),
        c_coffee      = float(cfg.get("c_coffee", 150)),
        c_external    = float(cfg.get("c_external", 150)),
        pottery_rev   = float(cfg.get("pottery_rev", 2000)),
        fx_pct        = float(cfg.get("fx_pct", 0.50)),
        working_bal   = float(cfg.get("working_bal", 600)),
    )
    single = _series(base_cfg)

    # Fixed 4-scenario policy comparison (independent of user config)
    compare_base = dict(
        ubi_universal=1000, ubi_floor=600, fisc_start=10000, mpc_rate=0.15,
        c_mcd=300, c_coffee=150, c_external=150, pottery_rev=2000,
        working_bal=600,
    )
    scenarios = [
        {"name": "Universal UBI · fx 50%",  "color": "#ef4444",
         "cfg": {**compare_base, "ubi_mode": "universal", "fx_pct": 0.50}},
        {"name": "Means-tested · fx 50%",   "color": "#a8e6a8",
         "cfg": {**compare_base, "ubi_mode": "targeted",  "fx_pct": 0.50}},
        {"name": "Universal UBI · fx 0%",   "color": "#ffb86c",
         "cfg": {**compare_base, "ubi_mode": "universal", "fx_pct": 0.00}},
        {"name": "Means-tested · fx 0%",    "color": "#7aa2ff",
         "cfg": {**compare_base, "ubi_mode": "targeted",  "fx_pct": 0.00}},
    ]
    for s in scenarios:
        s["trajectory"] = _series(s["cfg"])
        del s["cfg"]

    return {"single": single, "scenarios": scenarios, "months": months}


def run_colony_v0(cfg):
    """Pre-AXION colony baseline — heterogeneous citizens, external automation pressure."""
    from abm.colony_v0 import ColonyV0Model
    months = int(cfg.get("months", 60))
    seed = int(cfg.get("seed", 42))
    model = ColonyV0Model(
        seed=seed,
        n_citizens                  = int(cfg.get("n_citizens", 30)),
        pareto_alpha                = float(cfg.get("pareto_alpha", 1.6)),
        initial_savings             = float(cfg.get("initial_savings", 1500)),
        base_wage                   = float(cfg.get("base_wage", 400)),
        target_spend_pct            = float(cfg.get("target_spend_pct", 1.0)),
        subsistence_floor           = float(cfg.get("subsistence_floor", 250)),
        firm_initial_float          = float(cfg.get("firm_initial_float", 3000)),
        automation_end              = float(cfg.get("automation_end", 0.0)),
        automation_months           = int(cfg.get("automation_months", 60)),
        monthly_external_transfers  = float(cfg.get("monthly_external_transfers", 2800)),
    )
    for _ in range(months):
        model.step()
    df = model.datacollector.get_model_vars_dataframe()
    rows = df.to_dict(orient="records")
    for i, r in enumerate(rows):
        r["month"] = i
    return {
        "trajectory":   rows,
        "savings_grid": model.savings_history,   # [month][citizen]
        "employed_grid": model.employed_history,  # [month][citizen]
        "productivities": model.productivities,
        "months":       months,
        "n_citizens":   model.params if False else len(model.citizens),
    }


class Handler(BaseHTTPRequestHandler):
    static_dir = HERE / "static"
    templates_dir = HERE / "templates"

    def log_message(self, fmt, *args):
        sys.stderr.write(f"[{self.address_string()}] {fmt % args}\n")

    def _send_json(self, code, payload):
        body = json.dumps(payload, default=str).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path, content_type):
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

    def do_GET(self):
        p = urlparse(self.path).path
        if p in ("/", "/index.html"):
            self._send_file(self.templates_dir / "index.html", "text/html; charset=utf-8")
        elif p == "/trajectory":
            self._send_file(self.templates_dir / "trajectory.html", "text/html; charset=utf-8")
        elif p == "/forecasts":
            self._send_file(self.templates_dir / "forecasts.html", "text/html; charset=utf-8")
        elif p == "/cost-deflation":
            self._send_file(self.templates_dir / "cost-deflation.html", "text/html; charset=utf-8")
        elif p == "/unemployment":
            self._send_file(self.templates_dir / "unemployment.html", "text/html; charset=utf-8")
        elif p == "/profitability":
            self._send_file(self.templates_dir / "profitability.html", "text/html; charset=utf-8")
        elif p == "/references":
            self._send_file(self.templates_dir / "references.html", "text/html; charset=utf-8")
        elif p == "/sectors":
            self._send_file(self.templates_dir / "sectors.html", "text/html; charset=utf-8")
        elif p == "/aggregate":
            self._send_file(self.templates_dir / "aggregate.html", "text/html; charset=utf-8")
        elif p == "/ledger":
            self._send_file(self.templates_dir / "ledger.html", "text/html; charset=utf-8")
        elif p == "/abundance":
            self._send_file(self.templates_dir / "abundance.html", "text/html; charset=utf-8")
        elif p == "/abm":
            self._send_file(self.templates_dir / "abm.html", "text/html; charset=utf-8")
        elif p == "/colony-v0":
            self._send_file(self.templates_dir / "colony-v0.html", "text/html; charset=utf-8")
        elif p.startswith("/static/"):
            rel = p[len("/static/"):]
            ct = ("application/javascript" if rel.endswith(".js")
                  else "text/css" if rel.endswith(".css")
                  else "application/octet-stream")
            self._send_file(self.static_dir / rel, ct)
        elif p == "/api/defaults":
            self._send_json(200, run_sim())
        elif p == "/api/forecasts":
            self._send_json(200, get_forecasts())
        else:
            self.send_error(404, "unknown path")

    def do_POST(self):
        p = urlparse(self.path).path
        if p in ("/api/run", "/api/trajectory", "/api/abm", "/api/colony-v0"):
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                cfg = json.loads(body or "{}")
            except json.JSONDecodeError as e:
                self._send_json(400, {"error": f"bad JSON: {e}"})
                return
            try:
                runner = {
                    "/api/run":        run_sim,
                    "/api/trajectory": run_trajectory,
                    "/api/abm":        run_abm,
                    "/api/colony-v0":  run_colony_v0,
                }[p]
                result = runner(cfg)
                self._send_json(200, result)
            except Exception as e:
                import traceback
                self._send_json(500, {"error": str(e), "trace": traceback.format_exc()})
        else:
            self.send_error(404, "unknown path")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8766)
    ap.add_argument("--bind", default="127.0.0.1")
    args = ap.parse_args()

    httpd = ThreadingHTTPServer((args.bind, args.port), Handler)
    print(f"Simple-trace dashboard at http://{args.bind}:{args.port}", file=sys.stderr)
    print("Ctrl-C to stop.", file=sys.stderr)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.", file=sys.stderr)
        httpd.shutdown()


if __name__ == "__main__":
    main()
