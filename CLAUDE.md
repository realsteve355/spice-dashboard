# CLAUDE.md — SPICE Protocol Project Context

This file is read automatically by Claude Code at the start of every session.
It contains everything needed to work on this project without prior context.

---

## What This Project Is

**SPICE Protocol** (`zpc.finance`) is a post-collapse community economic system,
not a hedge fund or investment vehicle. The concept has two distinct phases:

### Phase 1 — The Collision (precursor context)
The macro thesis: US sovereign debt is on an unsustainable trajectory
(CBO: 154–199% GDP by 2054), AI-driven automation is causing structural
unemployment, and governments will deploy monetary tools (QE, YCC, financial
repression) that debase fiat currency. This collision between debt, deflation
and capital flight to crypto leads to fiat breakdown.

### Phase 2 — The SPICE Colony Economy (the actual product)
After the Collision — fiat breakdown, AI unemployment, civil reorganisation —
communities self-organise into **colonies**. Each colony runs the SPICE system:

- **S-token (= SPICE coin = ZPC)** — the colony's everyday currency. Issued by
  the MCC as basic income (UBI). Used for all internal transactions. Not backed
  by fiat.
- **V-token** — long-term savings instrument. Accrues yield from colony economic
  activity and S-tax receipts. Not freely spent.
- **MCC (Monetary Control Committee)** — the colony's monetary authority. Issues
  S, backs V, distributes yield.
- **Fiscal citizens** — colony members. Receive S as UBI, spend S, may hold V.
- **Companies** — colony enterprises. Pay/receive S, hold V, pay S-tax to MCC.
- **External settlement** — inter-colony trade uses BTC, ETH, or SOL. Not part
  of the internal SPICE system.

### What SPICE is NOT
- Not a hedge fund or crypto investment vehicle
- Not backed by BTC/gold/bond shorts
- The old "IRON/SPICE two-token hedge fund" concept is **retired**
- A separate portfolio suggestion page may exist for pre-collapse investment
  ideas, but this is entirely separate from the SPICE system itself

The site serves:
1. **Potential co-founders / researchers** — interrogate the economic model
2. **Community builders** — understand the colony concept and how to participate

Research feel — no marketing language, no exclamation marks.

---

## Tech Stack

- **React 19 + Vite 6** — standard CRA-style setup
- **React Router v7** — client-side routing
- **recharts** — all charts (see gotchas below)
- **ethers.js v6** — wallet connection and on-chain reads
- **Inline styles only** — no CSS files, no Tailwind, no CSS modules
- **Vercel** — auto-deploys from `master` branch on GitHub
- **Base Sepolia testnet** (chain ID 84532) — for the dashboard

---

## Design System

Always follow these conventions. Do not introduce new fonts, colours, or
component patterns without discussion.

| Token          | Value                              |
|----------------|------------------------------------|
| Font           | `'IBM Plex Mono', monospace`       |
| Gold accent    | `#B8860B`                          |
| Background     | `#ffffff`                          |
| Text primary   | `#111`                             |
| Text secondary | `#555` or `#666`                   |
| Text faint     | `#aaa` or `#999`                   |
| Border / rule  | `#e2e2e2` or `#E0E0E0`             |
| Red (danger)   | `#ef4444`                          |
| Purple (unemp) | `#8b5cf6`                          |
| Blue (infl)    | `#3b82f6`                          |
| Yellow (yield) | `#eab308`                          |
| Green (labour) | `#16a34a`                          |

All styles are inline JS objects. Pattern:
```jsx
const S = {
  container: { padding: "40px", background: "#fff", fontFamily: "'IBM Plex Mono', monospace" },
};
// usage: <div style={S.container}>
```

---

## Site Structure

```
/                     Home.jsx          Research landing page — abstract + contents
/collision            Collision.jsx     Macro thesis explorer, 4 tabs (see below)
/simulation           chart3-simulation.jsx   Interactive debt tsunami simulation
/spice-methodology.html  (static)       Model methodology, formulae, all citations
/dashboard            Dashboard.jsx     Live testnet dashboard (Base Sepolia)
```

### Nav links (in order)
Home · The Collision · Simulation · Methodology · Dashboard

### Collision.jsx — 4 tabs (Model & Simulation tab was removed)
1. **Dual Economy** (`dual`) — capital vs labour split, "The Scissor" chart
2. **Model Variables** (`indicators`) — 8 indicator cards with colour scale
3. **Apocalypse Indicators** (`apoc`) — 10 real-world market indicators to watch
4. **Policy Responses** (`policy`) — 4 policy scenarios compared on debt trajectory

---

## Simulation Engine (chart3-simulation.jsx)

The entire simulation is a pure function `runSim(displaced, fiscalId, monetaryId)`
returning `{ rows, breakYear, ghostYear }` — 10 annual snapshots (2026–2035).

### Key starting parameters
| Parameter       | Value  | Source                        |
|-----------------|--------|-------------------------------|
| Debt/GDP        | 1.23   | 123% gross, CBO/House Budget  |
| Base yield (r0) | 0.041  | 10Y Treasury early 2026       |
| Base growth     | 1.8%   | CBO 10-year projection        |
| Base tax rev    | 18%    | CBO                           |
| Base spending   | 24.5%  | CBO                           |
| Labour share    | 60%    | BEA NIPA 2024                 |
| Capital share   | 25%    | BEA NIPA 2024                 |
| Labour force    | 167M   | BLS 2025                      |
| Starting empl   | 160M   | BLS 2025                      |

### Core debt identity
```
D(t+1) = min(D(t) × (1 + yld) / (1 + gGDP + infl) + pDef, 3.0)
```
Capped at 3.0 (300% GDP) — above this, crisis/restructuring is assumed.

### Break point triggers
- Debt/GDP > 175%
- Unemployment > 20%
- Inflation < −7% (Fisher debt-deflation spiral)
- Yield > 6.5% AND Debt > 150%

### Displacement scenario anchors
| Label    | Displaced by 2035 | Source                  |
|----------|-------------------|-------------------------|
| CBO      | 5%                | CBO 2025 baseline       |
| IMF/GS   | 10%               | IMF WP/2025/076         |
| McKinsey | 25%               | McKinsey MGI 2023       |
| SPICE    | 40%               | SPICE base case         |
| Tsunami  | 60%               | AGI-equivalent scenario |

### Fiscal policies
| id          | Effect summary                                      |
|-------------|-----------------------------------------------------|
| `none`      | Baseline drift                                      |
| `robot_ubi` | Robot tax funds UBI — only credible pairing         |
| `austerity` | Spending cap 92% of base — deflationary             |

### Monetary policies
| id           | Effect summary                                     |
|--------------|----------------------------------------------------|
| `none`       | No intervention                                    |
| `qe`         | 30% yield suppression, +3.5% inflation             |
| `ycc`        | Hard 4.5% yield cap (Japan 2016–23), +4.5% infl   |
| `repression` | Regulatory yield suppression, +2.0% inflation      |

### KPI snapshot year
State: `kpiYear` (default 2035). Slider above KPI chips lets user scrub
to any year 2026–2035 to read off values. KPI labels update dynamically.

---

## Recharts — Critical Rules

**Violating these causes silent failures with no error messages.**

### 1. Never wrap recharts children in custom components
Recharts scans children by component type identity. Custom wrappers are silently dropped.
```jsx
// ❌ WRONG
const gridEl = <CartesianGrid />;
return <LineChart>{gridEl}</LineChart>;

// ✅ CORRECT — always inline directly
return <LineChart><CartesianGrid strokeDasharray="3 3" /></LineChart>;
```

### 2. Never use height="100%" inside flex/grid
Always use explicit pixel heights.
```jsx
const CH = 148; // defined once, used everywhere

// ❌ WRONG
<div style={{ flex: 1 }}><ResponsiveContainer height="100%">

// ✅ CORRECT
<div style={{ height: CH }}><ResponsiveContainer height={CH}>
```

Grid rows must also be explicit:
```jsx
style={{ gridTemplateRows: `repeat(2, ${CH + 32}px)` }}
```

### 3. Keep ticks strictly inside domain
```jsx
// ❌ Risky — 50 is at boundary
domain={[0, 50]} ticks={[5, 15, 25, 35, 45, 50]}

// ✅ Safe
domain={[0, 50]} ticks={[5, 15, 25, 35, 45]}
```

### 4. Never use tickCount and ticks together — pick one

### 5. Always use isAnimationActive={false} on Line components
6 panels × 10 data points causes noticeable lag on every slider interaction.

### 6. KShapeChart must be a fully standalone component
The dual-line K-shape panel must own its own ResponsiveContainer with no
shared conditional logic with the other panels. It went invisible multiple
times when it shared rendering logic.

---

## Chart Panel Specs

| Panel | Metric         | Color     | Domain    | Ticks                  |
|-------|----------------|-----------|-----------|------------------------|
| 1     | Debt/GDP       | `#ef4444` | [100,310] | 125,175,225,275        |
| 2     | Unemployment   | `#8b5cf6` | [0,50]    | 5,15,25,35,45          |
| 3     | Inflation      | `#3b82f6` | [−12,20]  | −10,−5,0,5,10,15       |
| 4     | 10Y Yield      | `#eab308` | [2,14]    | 3,5,7,9,11,13          |
| 5     | Gold/Crypto    | `#B8860B` | [0,8000]  | 1000,2500,5000,7500    |
| 6     | K-Shape (dual) | green+red | [20,65]   | 25,35,45,55            |

---

## Key Source Documents in the Repo

| File                          | Location       | Purpose                              |
|-------------------------------|----------------|--------------------------------------|
| `chart3-simulation.jsx`       | `src/pages/`   | Interactive simulation — Chart 3     |
| `spice-methodology.html`      | `public/`      | Full methodology doc, all citations  |
| `SPICE-MODEL-NOTES.md`        | `docs/`        | Developer notes, all parameters      |
| `CLAUDE.md`                   | `/` (root)     | This file                            |

---

## Methodology & Citations

Full academic basis documented in `public/spice-methodology.html`.
Key sources:

1. Reinhart & Rogoff (2010) — NBER w15639 — debt danger zones, financial repression
2. Reinhart & Sbrancia (2015) — liquidation of government debt via repression
3. CBO Long-Term Budget Outlook, March 2025 — cbo.gov/publication/61270
4. CBO Budget & Economic Outlook 2025–2035 — cbo.gov/publication/62105
5. IMF WP/2025/076 — global AI impact on productivity and labour
6. McKinsey MGI (2023) — economic potential of generative AI
7. Dallas Fed (Aug 2025) — AI productivity effects, sectoral evidence
8. World Gold Council (Jun 2025) — fiscal concerns and gold
9. Grayscale Research (2025) — tariffs, stagflation, Bitcoin
10. WisdomTree (2025) — Bitcoin and gold model forecasts
11. NYDIG (2025) — comparing Bitcoin and gold as macro hedges
12. CRFB (2025) — analysis of CBO March 2025 outlook
13. NBER (Jan 2026) — Auerbach/Gale projecting federal deficits

---

## Colony App & Multi-Project Architecture

This repo contains **three Vercel projects** deployed from the same `master` branch:

| Domain | Root dir | Purpose |
|--------|----------|---------|
| `zpc.finance` | `/` (repo root) | Main research site — Home, Collision, Simulation, Methodology, Dashboard |
| `app.zpc.finance` | `colony-app/` | Colony app — React SPA, full on-chain colony economy |
| `spice.zpc.finance` | `spice-admin/` | Protocol admin — static HTML, no build step, ethers.js CDN |

Each has an `ignoreCommand` in its `vercel.json` so unrelated changes don't trigger
unnecessary rebuilds. **CRITICAL:** paths in `ignoreCommand` are relative to each project's
own root directory, not the repo root.

### Colony App (`colony-app/`) — Key Facts

- **Tech stack:** React 19, Vite 6, React Router v7, ethers.js v6, inline styles only
- **Chain:** Base Sepolia testnet (chain ID 84532)
- **Design system:** same tokens as main site (`colony-app/src/theme.js`)
- **No mock data** — all state reads from chain; pages show clean empty states when no data

**Contract addresses (Base Sepolia):**
- ColonyRegistry: `0x9B8Eee5C078166d1b89A38Dae774773C89e53B9a` (global ERC-721 registry — each colony gets a soulbound C-token)
- Dave's Colony (Colony contract): `0xDc546810b73b499DB79a0DF2A662170660Bf3902`
- Full per-colony addresses: `colony-app/src/data/contracts.json` (token-address cache only — not the colony directory)
- ABIs + bytecodes for deploy: `colony-app/src/data/deployArtifacts.js` (215KB, lazy-loaded)

**C-token model:** Each `register()` call mints a soulbound ERC-721 C-token to the Colony contract address
(not the founder's EOA). `ownerOf(tokenId)` == Colony contract — the colony cannot be orphaned by key loss.
`deregister()` burns it; `reregister()` remints with the same token ID. On-chain tokenURI with metadata JSON.

**Colony deploy flow** (`CreateColony.jsx`): 18-step guided wizard.
Pre-flight: network (84532) + balance (≥0.005 ETH) + slug availability.
Steps 1–17: deploy 10 contracts + wiring (each MetaMask confirmation).
Step 17.5: save to localStorage (colony usable from here).
Step 18 (non-fatal): `ColonyRegistry.register(colonyAddr, name, slug)` — mints C-token.

**Directory colony source:** ColonyRegistry on-chain only (`getActive()` + `entries(addr)`).
`contracts.json` and `localStorage['spice_user_colonies']` are no longer used for colony discovery.

**Event queries:** use raw `provider.getLogs()` + `Interface.parseLog()` — never
`contract.queryFilter()` (triggers LavaMoat intrinsics errors in MetaMask).

**Activity logging:** fire-and-forget POST to `/api/log` → Supabase `activity_log` table.

**Protocol admin** (`spice-admin/`): single static HTML page at `spice.zpc.finance`.
Reads ColonyRegistry read-only on load. Owner actions require MetaMask wallet connect.
Config: `spice-admin/config.js` (ColonyRegistry address).

**Full technical reference:** `docs/technical-architecture.md` (v7)
**Full requirements spec:** `docs/user-stories.md` (v14)`

---

## Standing Instructions for Claude Code

- **Always show proposed changes before applying them**
- **Never introduce new dependencies** without flagging it first
- **Never use CSS files, Tailwind, or external styling** — inline styles only
- **Never add placeholder/lorem ipsum content** — leave a clear TODO comment instead
- **Match the research tone** — no marketing language, no exclamation marks,
  no "revolutionary" or "powerful" language
- **Prefer small focused edits** over large rewrites
- **After any edit to a .jsx file**, check that all recharts rules above are
  still satisfied
- **Commit message format**: `[area] brief description` e.g. `[simulation] add 2040 extension`

---

## Project Status

Pre-launch research project. Key next steps:

- [ ] Chart 5 — SPICE protocol mechanics page
- [ ] Mobile layout for /simulation
- [ ] Feedback / comment mechanism on methodology page
- [ ] Technical co-founder (DeFi-experienced, token allocation)
- [ ] IRONVAULT (ticker: IRON) — whitepaper

*Last updated: March 2026*
