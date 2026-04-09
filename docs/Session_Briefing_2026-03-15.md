# Session Briefing — 2026-03-15
## For: Claude.ai
## Re: Changes made to SPICE Dashboard today

---

## Context

This is the SPICE Protocol dashboard (`zpc.finance`) — a pre-launch DeFi research project
modelling the collision between US sovereign debt, AI-driven deflation, and crypto capital
flight. The site has two primary interactive pages:

- `/collision` — `chart3-simulation.jsx` — the main simulation with 6 recharts panels
- `/impact` — `Impact.jsx` — AI-generated human impact analysis for 4 household groups

The tech stack is React 19 + Vite, recharts, inline styles only, Vercel deployment
(auto-deploys from `master`). API routes are Vercel serverless functions in `/api/`.

---

## What Was Built Today

### Feature: Post-Collision "Fog of War" — Simulation Page

**Problem:** When The Collision triggers (e.g. 2029), the simulation graphs continued
showing projections through 2035 as solid lines, implying the model "knows" what happens
post-collapse. In reality, post-crisis dynamics are discontinuous (war, hyperinflation,
crypto bans, political choices) and cannot be modelled from pre-crisis dynamics.

**Solution implemented:**

#### 1. SVG Hatch Pattern (`chart3-simulation.jsx`)
A hidden `<svg>` element defines `#hatchPattern` once at the top of the right panel.
Diagonal lines, 75% opacity, dense enough to clearly obscure the speculative zone.

```jsx
<svg width="0" height="0" style={{ position:"absolute", overflow:"hidden" }}>
  <defs>
    <pattern id="hatchPattern" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5" stroke="#555" strokeWidth="2" strokeOpacity="0.75" />
    </pattern>
  </defs>
</svg>
```

#### 2. `fogYear` Derived Value
`fogYear` is set only for THE COLLISION (not conventional crisis, not no-crisis):

```js
const fogYear = collisionStatus === "COLLISION" ? collisionYear : null;
```

`collisionStatus` is computed via `getCollisionStatus(crisisRow, displaced)` from
`sim-engine.js`. THE COLLISION requires: crisis thresholds breached AND (AI > 15% OR
crypto flight > 20%).

#### 3. Chart Data Truncated at `fogYear + 1`
```js
const chartRows = fogYear ? rows.filter(r => r.year <= fogYear + 1) : rows;
```
All 6 chart components receive `chartRows` instead of the full `rows`. The chart
naturally ends one year after the collision — showing a thin hatched strip as a
visual "cliff edge".

#### 4. `ReferenceArea` + `ReferenceLine` on All 6 Charts
Each chart component (`DebtChart`, `UnempChart`, `InflChart`, `YieldChart`,
`BitcoinChart`, `KShapeChart`) was updated to accept a `fogYear` prop and render:

```jsx
{fogYear ? (
  <ReferenceArea x1={fogYear} x2={fogYear + 1} fill="url(#hatchPattern)" fillOpacity={1}
    label={{ value:"SPECULATIVE", position:"insideTopLeft", fontSize:7, fill:"#ccc",
      fontStyle:"italic", fontFamily:"'IBM Plex Mono',monospace" }} />
) : firstRedYear && (
  <ReferenceLine x={firstRedYear} stroke="#dc262655" strokeWidth={1.5} strokeDasharray="4 3" />
)}
{fogYear && <ReferenceLine x={fogYear} stroke="#dc2626" strokeWidth={1.5} strokeDasharray="4 3"
  label={{ value:`◈ ${fogYear}`, position:"insideTopLeft", fontSize:7, fill:"#dc2626",
    fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }} />}
```

**Note:** `BitcoinChart` has dual Y-axes. Its `ReferenceArea` and `ReferenceLine` require
`yAxisId="idx"` to avoid silent recharts failures.

#### 5. Snapshot Year Slider Capped at `fogYear`
```js
const effectiveKpiYear = fogYear ? Math.min(kpiYear, fogYear) : kpiYear;
```
The slider `max` is set to `fogYear ?? 2035`. Year buttons are filtered to
`r.year <= (fogYear ?? 2035)`. KPI chip labels use `effectiveKpiYear`.
`last` (the row powering all KPI chips) uses `effectiveKpiYear`.

#### 6. X-Axis Labels Fixed
Changed from `interval={3}` (showed every 4th label) to `ticks={rows.map(r => r.year)}`
on all 6 charts. This derives tick positions directly from the data, so whether the chart
shows 5 years (2026–2030) or 10 years (2026–2035) every year label renders.

#### 7. Crisis Classification Box — Always Visible
Replaced the conditional `{collisionStatus !== "NO_CRISIS" && ...}` with an always-visible
box using an IIFE pattern. Three states:

| Status | Background | Header colour | Text |
|--------|-----------|---------------|------|
| NO_CRISIS | `#f9fafb` | `#16a34a` (green) | "NO CRISIS — SYSTEM STABLE 2026–2035" |
| CONVENTIONAL | `#fefce8` | `#92400e` (amber) | "CONVENTIONAL CRISIS — YYYY" |
| COLLISION | `#fef2f2` | `#dc2626` (red) | "◈ THE COLLISION — YYYY" |

#### 8. Economy Overview API Update (`api/economy-overview.js`)
When `isCollision` is true (crisis + AI > 15% or peakCrypto > 20%), Paragraph 4 of the
AI-generated overview now includes a post-collision uncertainty note:

> "projections beyond [year+1] are highly speculative. After The Collision, outcomes depend
> on discontinuous events: war, hyperinflation, crypto bans, debt jubilee, CBDC imposition..."

---

### Feature: Impact Page Alignment

**Problem:** The Impact page (`/impact`) had a snapshot year slider that could scroll into
post-collision years, and no crisis classification box.

**Changes to `Impact.jsx`:**

1. **`getCollisionStatus` imported** from `sim-engine.js`
2. **Same derived values** computed: `crisisRow`, `collisionStatus`, `collisionYear`,
   `collisionCrypto`, `fogYear`, `effectiveKpiYear`
3. **Snapshot slider capped** at `fogYear` — same logic as simulation page
4. **Year buttons filtered** to `r.year <= (fogYear ?? 2035)`
5. **KPI chip labels** use `effectiveKpiYear` not `kpiYear`
6. **Header year display** updated to `effectiveKpiYear`
7. **Always-visible crisis classification box** added between KPI chips and the 2×2
   impact cards grid — identical three-state logic (NO_CRISIS / CONVENTIONAL / COLLISION)

---

## Key Architecture Notes

### `getCollisionStatus(row, displaced)` — `src/lib/sim-engine.js`
```js
export function getCollisionStatus(row, displaced) {
  const hasCrisis =
    row.debtGDP > 175 || row.unemp > 20 || row.infl < -7 ||
    (row.yld > 6.5 && row.debtGDP > 150);
  if (!hasCrisis) return "NO_CRISIS";
  if ((displaced || 0) > 0.15 || (row.cryptoFlight || 0) > 20) return "COLLISION";
  return "CONVENTIONAL";
}
```

### Recharts Critical Rules (don't break these)
- Never wrap recharts children in custom components
- Always explicit pixel heights (`CH = 148`)
- `isAnimationActive={false}` on all `<Line>` components
- `KShapeChart` must be fully standalone
- `BitcoinChart` dual-axis: `ReferenceArea`/`ReferenceLine` need `yAxisId="idx"`
- `ticks` and `tickCount` cannot be used together — pick one

### `fogYear` Propagation Pattern
```
runSim() → rows (full 10yr)
  ↓
crisisRow → collisionStatus → fogYear
  ↓                              ↓
effectiveKpiYear            chartRows (filtered)
  ↓                              ↓
last (KPI row)             chart components
  ↓
KPI chips / slider / year buttons
```

---

## Files Modified Today

| File | Changes |
|------|---------|
| `src/pages/chart3-simulation.jsx` | Fog of war: hatch pattern, ReferenceArea/Line on 6 charts, chartRows, effectiveKpiYear, capped slider, always-visible crisis box, x-axis ticks fix |
| `src/pages/Impact.jsx` | Import getCollisionStatus, compute fogYear/effectiveKpiYear, cap slider, always-visible crisis box |
| `api/economy-overview.js` | Post-collision uncertainty note in Paragraph 4 prompt |

---

## Current Deployment

- **URL:** zpc.finance
- **Branch:** master
- **Last commit:** `c1a0017` — [impact] remove redundant system break sentence from collision banner
- **Platform:** Vercel (auto-deploy from GitHub master)

---

*Prepared by Claude Code — 2026-03-15*
