# SPICE Protocol — Current Site State
## Context document for AI assistants (Claude.ai, etc.)
### Last updated: March 2026

This document describes the current state of www.zpc.finance — a pre-launch
DeFi research project. Use it to understand what is already built before
proposing new features or changes.

---

## What the site is

**SPICE Protocol** (`ZPC`) is a macro hedge thesis and prototype DeFi protocol
exploring the collision between:
- US sovereign debt on an unsustainable trajectory
- AI-driven deflation compressing the tax base
- Government imperative to inflate its way out of debt

The site serves sceptical researchers and potential co-founders, not retail
investors. It has a **research / working-paper aesthetic**, not a product feel.

**Status:** Pre-launch. Testnet only (Base Sepolia). No real assets.

---

## Tech stack

- React 19 + Vite 6, React Router v7
- Recharts for all charts
- Inline styles only (no CSS files, no Tailwind, no CSS modules)
- IBM Plex Mono font throughout
- Vercel, auto-deploys from `master` branch on GitHub
- Serverless API routes in `/api/` (Vercel functions)

---

## Design system (do not deviate)

| Token          | Value            |
|----------------|------------------|
| Font           | IBM Plex Mono    |
| Gold accent    | `#B8860B`        |
| Background     | `#ffffff`        |
| Text primary   | `#111`           |
| Text secondary | `#555` / `#666`  |
| Text faint     | `#aaa` / `#999`  |
| Border         | `#e2e2e2`        |
| Red (danger)   | `#ef4444`        |
| Purple (unemp) | `#8b5cf6`        |
| Blue (infl)    | `#3b82f6`        |
| Yellow (yield) | `#eab308`        |
| Green (labour) | `#16a34a`        |

---

## Navigation (current, left to right)

```
Home · Collision · Impact · Crisis · Indicators · Portfolio · Coin · Methodology
```

Note: "Impact" and "Crisis" are newer pages added after the original design.
"Methodology" links to a static HTML page (`/spice-methodology.html`).

---

## Routes and pages

### `/` — Home (`Home.jsx`)
- Title: "SPICE Protocol"
- Subtitle: "A macro hedge thesis at the intersection of sovereign debt, AI displacement, and hard monetary assets"
- **CrisisLevelWidget**: reads `localStorage["spice_level_cache"]` (set by Indicators page). Shows current SPICE level (GREEN/BLUE/YELLOW/ORANGE/RED) with score, description, and links to /indicators and /portfolio. If no cached data, shows "Visit Indicators to load live data."
- **Abstract**: ~100 words explaining the thesis
- **Contents table**: links to Collision, Indicators, Portfolio, Coin, Methodology with one-line descriptions
- **Status section**: pre-launch disclaimer, testnet notice

### `/collision` (also `/simulation`) — The Collision Simulation (`chart3-simulation.jsx`)
Full-viewport interactive simulation. Layout: narrow left panel of controls + main chart grid (2×3) + right KPI panel.

**Left panel controls:**
- AI displacement slider (0–65%) with named anchors: CBO 5%, IMF/GS 10%, McKinsey 25%, SPICE 40%, Tsunami 60%
- Crypto flight speed slider (0–100%, anchors: None/Slow/Moderate/Fast/Venezuela)
- Fiscal policy buttons: Baseline / Robot Tax+UBI / Austerity
- Monetary policy buttons: None / QE / Yield Curve Control / Financial Repression
- Crypto policy buttons: Ban & Restrict / Tax & Regulate / Ignore
- Crisis level legend (GREEN–RED) + "Red line = RED onset" note

**Header bar:**
- Title: "Debt Collision Simulation"
- Fiscal/monetary/crypto policy badges
- SPICE crisis level onset badges (5 boxes showing first year each level GREEN→RED is reached; blank "—" if never reached)

**Main chart grid (6 panels, 2 rows × 3 cols):**
1. Debt/GDP (red, domain 100–310%)
2. Unemployment (purple, domain 0–50%)
3. Inflation/Deflation (blue, domain −12–20%)
4. 10Y Bond Yield (yellow, domain 2–14%)
5. Gold/Crypto (gold, dual axis: Bitcoin USD + crypto flight %)
6. K-Shape (dual line: Labour share green / Capital share red, domain 20–65%)

All charts show 10 annual snapshots (2026–2035). Red dashed reference line marks first RED year (if reached).

**KPI strip (below charts):**
- Snapshot year slider (2026–2035) with clickable year labels
- 6 KPI chips (colour-coded by criticality): Debt/GDP, Unemployment, Inflation, 10Y Yield, Crypto Flight, Gini coefficient
- "Thresholds" button opens a modal explaining the scoring thresholds

**Simulation engine (`src/lib/sim-engine.js`):**
Pure function `runSim(displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy)` → `{rows, firstYear, firstRedYear}`.
10 annual rows (2026–2035). Core debt identity: `D(t+1) = min(D(t) × (1+yld)/(1+gGDP+infl) + pDef, 3.0)`.
Capped at 300% GDP. Break triggers: Debt>175%, Unemp>20%, Infl<−7%, or Yield>6.5%+Debt>150%.

SPICE level composite scoring (0=GREEN, 4=RED) based on debt, unemployment, inflation, yield.

### `/impact` — Human Impact (`Impact.jsx`)
Same left-panel controls as /collision (shared `loadSimState`/`saveSimState` so settings persist across pages).

Right panel shows:
- Header: "Human Impact Analysis" with snapshot year, policy badges, crisis onset badges
- Snapshot year slider + KPI chips (identical to /collision)
- Grid of **AI-generated impact cards** (fetched from `/api/human-impact` — a Vercel serverless function calling Claude API)
- Cards cover groups defined in `IMPACT_GROUPS` from sim-engine (e.g. workers, households, government, financial system)
- Each card shows bullet-pointed analysis of real-world effects at the selected year/scenario
- Results are cached in-memory to avoid re-fetching on every slider change (600ms debounce)

### `/crisis` — Crisis Scenarios (`CrisisScenarios.jsx`)
Static + AI-generated hybrid page.

**Static content — 3 historical crisis types:**
1. **TYPE 1: Fast Collapse** (months–2 years) — Weimar 1923, Argentina 2001, Asian Crisis 1997
2. **TYPE 2: Slow Decline** (decades) — British Pound 1914–1971, Portuguese Escudo
3. **TYPE 3: Chaotic Transition** — Dutch Guilder 1780–1795, Soviet Ruble 1989–1998

Each card shows: historical examples, crisis pattern steps, timeline bar (classic vs AI-modified duration), AI modification bullets ("how AI changes this crisis type"), crypto modification bullets, and an expandable "deep dive" timeline for the key example.

**AI-generated section:**
Uses current sim state (read from localStorage) to call `/api/crisis-pattern` (Vercel function → Claude API), returning a pattern-matching analysis of which crisis type best fits the current simulation scenario.

### `/indicators` (also `/apocalypse`) — Live Indicators (`ApocalypseIndicator.jsx`)
14 live macro indicators, grouped into 4 categories:

**DEBT (red):** Real Yield (DFII10), Yield Curve (T10Y2Y), HY Credit Spread (BAMLH0A0HYM2), US Federal Debt/GDP (GFDEGDQ188S), Italian BTP–Bund Spread, Japan 10Y Yield

**UNEMPLOYMENT (purple):** US Unemployment Rate (UNRATE), Job Openings/JOLTS (JTSJOL)

**INFLATION (blue):** 5Y5Y Breakeven (T5YIFR), M2 Growth (M2SL), Broad US Dollar Index (DTWEXBGS), US CPI YoY (CPIAUCSL)

**CRYPTO (gold):** Bitcoin Dominance, Total Crypto Market Cap

Each indicator: fetches live data, scores 0–4 against defined thresholds, shows value + colour-coded score chip + threshold table.

**Composite score:** sum of all 14 scores (max 56). Bands:
- GREEN: 0–9 | BLUE: 10–19 | YELLOW: 20–29 | ORANGE: 30–38 | RED: 39+

On full load, saves to `localStorage["spice_level_cache"]` (read by Home and Portfolio pages).

**Data sources:**
- FRED data → `/api/fred.js` proxy (CORS fix, tiered cache: daily=4h, monthly=12h, quarterly=48h)
- Italian BTP/German Bund/Japan 10Y → `/api/bond-yields.js` (Yahoo Finance + FRED fallback)
- CoinGecko `/api/v3/global` for BTC dominance + total market cap

### `/portfolio` — Portfolio (`Portfolio.jsx`)
5-column table showing allocations at each crisis level (GREEN → RED).

**Allocations (`src/data/allocations.js`):**
- GREEN:  75% PAXG, 15% BTC, 10% AI equity
- BLUE:   60% PAXG, 20% BTC, 10% AI equity, 5% Commodities, 5% Bond shorts
- YELLOW: 45% PAXG, 25% BTC, 10% Silver, 10% Bond shorts, 5% Commodities, 5% Rates vol
- ORANGE: 30% PAXG, 35% BTC, 10% Silver, 15% Bond shorts, 5% Commodities, 5% Rates vol
- RED:    20% PAXG, 45% BTC, 10% Silver, 15% Bond shorts, 10% Rates vol, 5% Commodities

**Features:**
- Current level read from: URL param `?level=N` → localStorage → default GREEN
- Status banner at top showing current level + score
- AUM input (default $10,000, editable) — shows notional USD breakdown and unit quantities (BTC/oz from spot prices)
- Active column highlighted with border + "◈ CURRENT ALLOCATION" header band
- Spot prices shown smaller alongside AUM box

### `/coin` (also `/dashboard`) — Coin (`Dashboard.jsx`)
Live testnet dashboard. Connects to Base Sepolia (chain ID 84532). Wallet connect, on-chain vault state, real-time portfolio allocation display. Not the focus of current development.

### `/collision-detail` — Old Collision page (`Collision.jsx`)
**Not in navigation.** Legacy 4-tab page (Dual Economy, Model Variables, Apocalypse Indicators, Policy Responses). Kept for reference only.

### `/config` — Config (`Config.jsx`)
**Not in navigation.** Hidden page for portfolio config and AI agent placeholder.

### `/spice-methodology.html` — Static methodology doc
Full academic methodology: model assumptions, simulation formulae, parameter sources, 13 academic citations (Reinhart-Rogoff, CBO, IMF, McKinsey, Dallas Fed, World Gold Council, Grayscale, WisdomTree, NYDIG, CRFB, NBER).

---

## API routes (Vercel serverless, `/api/`)

| Route | Purpose |
|-------|---------|
| `/api/fred.js` | Proxies FRED API (CORS fix). Retry once. Tiered cache. |
| `/api/bond-yields.js` | Italian/German/Japan 10Y via Yahoo Finance (crumb auth) + FRED fallback |
| `/api/human-impact` | Calls Claude API → human impact analysis for /impact page |
| `/api/crisis-pattern` | Calls Claude API → crisis type pattern match for /crisis page |

---

## Shared state between pages

`loadSimState()` / `saveSimState()` in `sim-engine.js` reads/writes these keys to localStorage:
`displaced, fiscalId, monetaryId, kpiYear, cryptoAdopt, cryptoPolicy`

This means slider settings set on /collision are preserved when you navigate to /impact, and vice versa.

---

## Key constraints for any new work

1. **Inline styles only** — no CSS files, no Tailwind, no CSS modules
2. **No new dependencies** without discussion
3. **Recharts rules** (critical — violations cause silent failures):
   - Never wrap recharts children in custom components
   - Always explicit pixel heights (never `height="100%"` inside flex)
   - `isAnimationActive={false}` on all Line components
   - Never use `tickCount` and `ticks` together
4. **Research tone** — no marketing language, no exclamation marks
5. **IBM Plex Mono** font throughout
6. **Commit format:** `[area] brief description`
