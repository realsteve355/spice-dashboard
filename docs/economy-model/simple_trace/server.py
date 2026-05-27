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
        if p in ("/api/run", "/api/trajectory"):
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                cfg = json.loads(body or "{}")
            except json.JSONDecodeError as e:
                self._send_json(400, {"error": f"bad JSON: {e}"})
                return
            try:
                runner = run_sim if p == "/api/run" else run_trajectory
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
