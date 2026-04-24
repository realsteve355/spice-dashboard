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
- ColonyRegistry: `0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68` (global ERC-721 registry — each colony gets a soulbound C-token)
- Dave's Colony (Colony contract): `0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5` (redeployed 20 April 2026)
- Dave's Colony (Governance): `0xe2af55fe189B18678187eF48eB49b9bA8bF24534` (multi-candidate + auto-finalise + 15/30min windows, 20 April 2026)
- Full per-colony addresses: `colony-app/src/data/contracts.json` (token-address cache only — not the colony directory)
- ABIs + bytecodes for deploy: `colony-app/src/data/deployArtifacts.js` (215KB, lazy-loaded)

**C-token model:** Each `register()` call mints a soulbound ERC-721 C-token to the Colony contract address
(not the founder's EOA). `ownerOf(tokenId)` == Colony contract — the colony cannot be orphaned by key loss.
`deregister()` burns it; `reregister()` remints with the same token ID. On-chain tokenURI with metadata JSON.

**Colony types:** Each colony is either `earth` (open economy — USDC reserve, Fisc rate, LRT) or `mars`
(closed economy — no external USDC, Harberger land). Chosen in `CreateColony.jsx` step 2.
Stored in `localStorage['spice_user_colonies'][slug].colonyType`. Drives Fisc.jsx badge + feature gating.

**Colony deploy flow** (`CreateColony.jsx`): 18-step guided wizard (plus a Mars/Earth type choice at step 2).
Pre-flight: network (84532) + balance (≥0.005 ETH) + slug availability.
Steps 1–17: deploy 10 contracts + wiring (each MetaMask confirmation).
Step 17.5: save to localStorage (colony usable from here, colonyType also saved here).
Step 18 (non-fatal): `ColonyRegistry.register(colonyAddr, name, slug)` — mints C-token.

**Directory colony source:** ColonyRegistry on-chain only (`getActive()` + `entries(addr)`).
`contracts.json` and `localStorage['spice_user_colonies']` are no longer used for colony discovery.

**Event queries:** use raw `provider.getLogs()` + `Interface.parseLog()` — never
`contract.queryFilter()` (triggers LavaMoat intrinsics errors in MetaMask).

**Citizen enumeration:** use `/api/citizens?colony=0x…` serverless endpoint — reads GToken contract
directly (`nextTokenId` + `ownerOf` + `citizenName` per token). Do NOT use getLogs for CitizenJoined —
this consistently fails on Base Sepolia across multiple RPC providers. Shared utility: `src/utils/fetchCitizens.js`.

**Activity logging:** fire-and-forget POST to `/api/log` → Supabase `activity_log` table.

**Notifications:** per-wallet inbox in Supabase `notifications` table via `/api/notifications`.
`useNotifications.js` hook polls every 30s. Bell button in Layout.jsx with unread badge.
Payment notifications fire on Colony.send() confirm (with sender name). Election notifications
broadcast to all citizens on openElection(). Seen state in localStorage.

**Announcements:** colony-wide message board in Supabase `announcements` table via `/api/announcements`.
MCC board/founder can post/delete from Mcc.jsx.

**MCC page** (`Mcc.jsx`): `/colony/:slug/mcc` — board roles, token supply stats, live elections
(nextId+loop pattern), announcements. Quick-nav MCC/Fisc pills on Dashboard citizen card.

**Fisc page** (`Fisc.jsx`): `/colony/:slug/fisc` — three-number panel (UBI/rate/value computed from
published budget), Mars/Earth badge, "View Budget →" link. Earth-only placeholder sections for
USDC Reserve, LRT, Boundary Flows.

**Budget page** (`Budget.jsx`): `/colony/:slug/budget` — 15 default line items (4 categories: MCC,
Essential, Discretionary, Savings). Citizen read-only view with split bar. CEO edit mode: per-line
inputs, on/off toggles (CORE_IDS cannot be disabled), bread price + labour discount inputs,
consistency panel, spike warning (>20% vs trailing 12-version low). Publish modal with version
history audit trail. CEO detected via `Governance.roleHolder(0)`. Backed by `/api/budget` + Supabase
tables `budget_draft` + `budget_published`. Fisc rate = `($2.80 × (1 − discount%)) / breadPriceS`.

**getLogs RPC:** `https://sepolia.base.org` — switched from publicnode.com (silent failures).
15 chunks × 9,000 blocks = ~75 hours of history.

**SendSheet:** citizen picker (via fetchCitizens) instead of free-text address input. Companies
are paid via the Mall, not by entering addresses manually.

**Test infrastructure** (`colony-app/scripts/` + `colony-app/tests/`):
- Seed script: `npm run seed` — registers bot wallets (Alice/Bob/Charlie/Diana/Erik) as citizens,
  sends S transactions, seeds Supabase. Idempotent. `.env.seed` with `BOT_0_KEY…BOT_4_KEY`.
- Vitest unit tests: `npm test` — covers addrLabel.js pure functions.
- Playwright E2E: `npm run test:e2e` — 11 tests across 3 spec files. mockWallet fixture injects
  window.ethereum without MetaMask. Bypasses eth_estimateGas, eth_gasPrice, eth_feeHistory to
  prevent RPC hangs on write-path tests. Requires seed to have been run first.
  - `dashboard.spec.js` — 6 read-only smoke tests (name, address, citizen, balance, nav, tx history)
  - `citizen-actions.spec.js` — claim UBI (skip if already claimed this epoch), send S-tokens
  - `non-citizen.spec.js` — no wallet state, stranger address (not a citizen)
- See `colony-app/.env.seed.example` for required env vars.

### Native Mobile App (`colony-app-native/`) — In Progress

Scaffolded 23 April 2026. Steps 1–4 complete (commit `683a2bf`).

**Goal:** Genuine iOS/Android app (App Store distributed) with embedded wallet and NFC tap-to-pay.
The key demo scenario is a citizen paying S-tokens at a physical merchant (e.g. university cafeteria).

**Stack:** Expo SDK 54, React Native 0.81.5, ethers.js v6, expo-secure-store, expo-local-authentication, react-native-nfc-manager.

**NFC payment flow (both paths):**
- **Path A (in-app):** Dashboard → "⬡ Tap to Pay" → `NfcManager.requestTechnology(Ndef)` → citizen holds phone to till tag → `parsePayUrl()` → navigate to Pay screen
- **Path B (OS deep-link):** App closed, iOS/Android reads tag → `spice://pay?...` URL scheme → opens Pay screen via React Navigation `linking` config

**Till page:** `colony-app/public/till.html` → `app.zpc.finance/till.html`. Merchant enters amount + note. Chrome Android: Web NFC writes NDEF URI tag. Any browser: QR code fallback. After writing, polls Base Sepolia `eth_getLogs` for Sent event confirmation.

**Wallet:** expo-secure-store with `requireAuthentication: true` — mnemonic stored behind FaceID/TouchID/PIN. Address stored without auth. All write txs require `authenticate()` first. `gasLimit: 150000` hardcoded on all write txs.

**Build order:**
1. ✓ Embedded wallet (keygen, Keychain storage, FaceID, seed phrase) — `src/utils/wallet.js`
2. ✓ Dashboard + WalletContext + contracts utils — `src/screens/Dashboard.js`
3. ✓ Send flow (citizen picker, amount, FaceID, broadcast) — `src/screens/Send.js`
4. ✓ NFC tap-to-pay (scan tag → Pay screen → FaceID → success) — `src/screens/Pay.js`, `src/utils/nfc.js`, till.html
5. — UBI claim — button exists in Dashboard; needs device testing
6. — Multi-colony support (Dave's Colony hardcoded; future: read ColonyRegistry)

**Costs:** Apple Developer Program $99/year, Google Play $25 one-time. All libraries free/open source.

**To run:**
```bash
cd colony-app-native && npm install
npm start                                                    # Expo Go — read-only (balance, tx history)
npx eas build --profile development --platform ios          # dev build — FaceID + NFC
```

**Protocol admin** (`spice-admin/`): single static HTML page at `spice.zpc.finance`.
Reads ColonyRegistry read-only on load. Owner actions require MetaMask wallet connect.
Config: `spice-admin/config.js` (ColonyRegistry address).
Has founder share controls: global default % + per-colony override + founder wallet update.
Colony.settleProtocol() splits ETH between protocol treasury and founder wallet per getFeeSplit().

**Full technical reference:** `docs/technical-architecture.md` (v12)
**Full requirements spec:** `docs/user-stories.md` (v19)

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

- [x] **Native mobile app** — steps 1–4 done (wallet, dashboard, send, NFC tap-to-pay); till.html live at app.zpc.finance/till.html
- [ ] Chart 5 — SPICE protocol mechanics page
- [ ] Mobile layout for /simulation
- [ ] Feedback / comment mechanism on methodology page
- [ ] Technical co-founder (DeFi-experienced, token allocation)
- [ ] IRONVAULT (ticker: IRON) — whitepaper

*Last updated: 24 April 2026*
