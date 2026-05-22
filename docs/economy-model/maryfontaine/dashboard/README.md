# MaryFontaine Dashboard (Phase 4)

Interactive UI for the MaryFontaine simulator — sliders for parameters, click-to-run,
charts that refresh on completion. Stdlib HTTP server, no Flask. Chart.js from CDN.

## Run

```bash
python docs/economy-model/maryfontaine/dashboard/server.py
# Then open http://localhost:8765
```

Optional flags:
- `--port 8765` — change the port
- `--db <path>` — custom DB location (default: `dashboard/mf_dashboard.db`)
- `--bind 127.0.0.1` — interface to bind (default localhost-only)

## What you can play with

**Scenarios** — six pre-built USD-price trajectories:
- AI Realist (mild deflation, mild USD inflation)
- AI Optimist (aggressive deflation across the board)
- Stagflation (USD instability dominates)
- AI + Healthcare crisis (services spike from healthcare)
- **Transition** (the credibility test — accelerating non-linear AI deflation + monetary inflation)
- **Transition + Honda shock** (above + Honda exports drop 50% in Y4)

**UBI levers:**
- Per-citizen S/month (0–200, default 100)
- Children multiplier (0–1.0, default 1.0)
- Retirees-only mode (toggle)

**Fisc:**
- Cover-ratio target (0.10–0.50, default 0.30)

**Mitigations** (the search levers for the steady-ground config):
- MPC (Market Participation Charge) rate (0–20% of company revenue capacity)
- Honda Inc dividend vesting (toggle — keeps S in colony, no USDC cashout)
- Refinance mortgages → S (toggle — colony bank buyout, no USDC outflow)
- Refinance external rent → S (toggle — colony landlord buyout)
- S-tax on internal purchases (0–10%)
- Cashout multiplier (0–2.0)

## Charts

- **Basket cost in S** — the headline metric. 28 = peg held; > 28 = compression = welfare loss.
- **Fisc rate** — USD per S. Falling rate = S devaluing (compression regime).
- **USDC reserve** — the boundary defence.
- **S supply** — driven mostly by UBI minting; net of boundary outflows.
- **Boundary flows** — stacked bars: exports + remote income (positive), imports + mortgage + rent + dividends (negative).
- **Citizen real purchasing power** — p10 / median / p90 over years.
- **Archetype transitions** — annual flow from each archetype to each other.
- **Top companies** — balance ranking at end of run.

## Architecture

- `server.py` — stdlib `http.server.ThreadingHTTPServer`. Reads SQLite for query endpoints; spawns a daemon thread to run the sim on POST /api/run.
- `templates/dashboard.html` — single page, mission-control aesthetic ported from `src/tokens.js`.
- `static/dashboard.js` — vanilla JS, Chart.js for rendering, polls `/api/state` every 700ms while a run is in progress.
- Each Run regenerates founding data with the configured variant + scale, then runs the configured tick. Previous run's DB is overwritten — single-run-at-a-time. (Comparison view is a v2 feature.)

## What's deferred to v2

- Comparison view (run A vs run B side-by-side)
- Saving / naming runs
- Per-citizen drill-down (clickable timelines for individual citizens)
- Per-month per-archetype welfare curves
- Sensitivity analysis (sweep one parameter, plot outcome metric)
- Run length warning if memory pressure expected
- WebSocket progress streaming (current polling loop is fine for ~30-60s runs)
