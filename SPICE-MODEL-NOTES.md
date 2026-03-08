# SPICE — Debt Tsunami Simulation: Developer Notes

> This file documents the simulation engine, UI architecture, parameter values,
> and hard-won debugging lessons for `chart3-simulation.jsx`.  
> Commit this alongside the JSX. Last updated: March 2026.

---

## Table of Contents

1. [File Map](#1-file-map)
2. [Simulation Engine](#2-simulation-engine)
3. [Policy System](#3-policy-system)
4. [Chart Architecture](#4-chart-architecture)
5. [Recharts Gotchas — Critical](#5-recharts-gotchas--critical)
6. [UI Layout Notes](#6-ui-layout-notes)
7. [How to Extend the Model](#7-how-to-extend-the-model)
8. [Parameter Quick Reference](#8-parameter-quick-reference)
9. [Design System](#9-design-system)
10. [Outstanding TODOs](#10-outstanding-todos)

---

## 1. File Map

```
src/
  pages/
    Collision.jsx           ← main page hosting Chart 3 (and 1, 2, 4)
    chart3-simulation.jsx   ← the simulation (this document's subject)

public/
  methodology.html          ← standalone methodology doc (drop in public/, no routing needed)

docs/
  SPICE-MODEL-NOTES.md      ← this file
```

The methodology page (`methodology.html`) is a self-contained HTML file — no React,
no build step. Just drop it in `public/` and it's live at `/methodology`.

Link from chart3 footer:
```jsx
<a href="/methodology" target="_blank">Model methodology & citations →</a>
```

---

## 2. Simulation Engine

The entire simulation lives in a single pure function `runSim(displaced, fiscalId, monetaryId)`
that returns `{ rows, breakYear, ghostYear }`.

`rows` is an array of 10 annual snapshots (2026–2035), each containing:

```js
{
  year,       // 2026–2035
  debtGDP,    // % e.g. 145.2
  unemp,      // % e.g. 12.4
  infl,       // % e.g. -2.1 (negative = deflation)
  yld,        // % e.g. 6.80 (10Y Treasury yield)
  gold,       // index, starts 100, max capped 8000
  labShare,   // % labour share of GDP e.g. 54.3
  capShare,   // % capital share of GDP e.g. 31.1
  isBreak,    // bool — year of break point
  isGhost,    // bool — year ghost GDP onset detected
}
```

### Execution Order Per Year

Each annual step runs in this strict order (order matters — later calculations
depend on earlier ones):

```
1. Productivity boost (prod)
2. Displacement rate (annDisp) — lags prod by 2 years
3. Employment update
4. Unemployment rate
5. Ghost GDP detection
6. Inflation rate
7. Price level accumulation
8. Real GDP growth (gGDP)
9. Tax revenue
10. Welfare spending
11. Primary deficit (pDef)
12. Yield (yld) — endogenous, rises with debt + deficit
13. Debt/GDP — core debt identity, capped at 300%
14. Break point detection
15. Gold/crypto index
16. K-shape income shares
17. Push row
```

### Core Debt Identity

```
D(t+1) = min(D(t) × (1 + yld) / (1 + gGDP + infl) + pDef, 3.0)
```

- Starting `D` = 1.23 (123% of GDP, gross federal debt, 2026)
- Capped at 3.0 (300%) — above this, a crisis/restructuring is assumed
- `pDef` is positive when government runs a deficit (spending > revenue)

### Yield Formula

```js
const yldRaw = r0 + Math.max(0, (debtGDP - 1.2) * 0.012 + pDef * 0.18);
yld = Math.min(yccCap, yldRaw * e.yM);
```

- `r0` = 0.041 (4.1% base, early 2026 10Y yield)
- Yield premium kicks in above 120% debt/GDP: `0.012` per 1pp excess
- Deficit sensitivity: `0.18` — higher deficit raises yield
- Multiplied by monetary policy yield multiplier `e.yM` (0.58–1.00)
- Hard-capped by YCC ceiling if active (4.5%)

### Inflation Formula

```js
const infl = Math.max(-0.10, Math.min(0.20,
  0.025 - t * 0.0007 - prod * 0.5 + e.iA));
```

- Base starts at 2.5%, decays by 0.07pp/year
- AI productivity creates deflation: `prod × 0.5` pass-through
- Monetary policy adds inflation via `e.iA` (0 to +4.5%)
- Clamped to [−10%, +20%]

### GDP Growth Formula

```js
const drag = unemp > 0.07 ? (unemp - 0.07) * 1.2 : 0;
const gGDP = Math.max(-0.05, 0.018 + prod * 0.65 - drag);
```

- Base 1.8% real growth (CBO projection)
- AI adds `prod × 0.65` to growth (65% of productivity translates to output)
- Demand drag: each 1pp unemployment above 7% costs 1.2pp growth (Okun's Law)
- Floor: −5% (no deeper than Great Recession)

### Ghost GDP Detection

```js
if (!ghostYear && prod > 0.03 && unemp > 0.08) ghostYear = yr;
```

Ghost GDP = productivity is high (AI works) AND unemployment is also high (workers
already displaced). The economy looks fine on output, bad on employment.
This is the most politically dangerous phase — governments underreact because
headline GDP masks the problem.

### Gold / Crypto Index

```js
const mStress = Math.max(0, yld - 0.04) * 4       // yield stress
              + Math.max(0, -infl) * 3              // deflation stress
              + Math.max(0, infl - 0.04) * 4        // excess inflation
              + Math.max(0, debtGDP - 1.4) * 0.8;  // debt overhang

gold = Math.min(gold * (1 + Math.min(mStress * 0.12 * e.gM, 0.6) + 0.03), 8000);
```

- Starts at index 100 (not dollars — use for relative change)
- 3% base growth per year (gold long-run real return + BTC network premium)
- Each stress component compounds multiplicatively
- Annual return capped at 60% (prevents absurd single-year numbers)
- Hard ceiling at 8000 (80× from start)
- Multiplied by monetary policy gold multiplier `e.gM` (1.00–1.70)

### K-Shape Income Shares

```js
const kShift = annDisp * 0.45;
labShare = Math.max(0.35, labShare - kShift + e.lD * 0.025);
capShare = Math.min(0.52, capShare + kShift * 0.55 + e.cD * 0.025);
```

- Labour starts at 60%, capital at 25% (BEA NIPA 2024)
- Each 1pp displacement shifts 0.45pp from labour share
- Capital captures 55% of that shift (45% goes to residual/depreciation)
- Labour floor: 35%, Capital ceiling: 52%
- Policy effects applied via `e.lD` and `e.cD` (see policy table below)
- **Note:** Labour + Capital ≠ 100% by design — residual ~15% is taxes,
  depreciation, net interest. This matches BEA methodology.

### Break Point Logic

```js
if (!breakYear && (
  debtGDP > 1.75 ||          // Debt/GDP > 175% (Reinhart-Rogoff danger zone)
  unemp > 0.20 ||            // Unemployment > 20% (depression level)
  infl < -0.07 ||            // Deflation below −7% (Fisher debt-deflation spiral)
  (yld > 0.065 && debtGDP > 1.5)  // Yield > 6.5% + Debt > 150% (Italy 2011 analogue)
)) breakYear = yr;
```

Break point = a flag, not a prediction. Signals that historical precedent
suggests major disruption becomes likely. Does NOT model which crisis type.

---

## 3. Policy System

Fiscal and monetary policies are **independent** — both selectors are always
active and their effects combine. This models reality: a government can
simultaneously run austerity AND have the central bank do YCC.

### Effect Object Schema

Each policy has an `e` object:

```js
{
  dM: 1.0,   // deficit multiplier (fiscal only) — multiplies pDef
  yM: 1.0,   // yield multiplier (monetary only) — multiplies yld
  iA: 0.0,   // inflation additive — sums across fiscal + monetary
  gM: 1.0,   // gold/crypto multiplier (monetary only)
  uM: 1.0,   // unemployment multiplier (fiscal only) — multiplies annDisp
  lD: 0.0,   // labour share delta — sums across both
  cD: 0.0,   // capital share delta — sums across both
}
```

### Combining Effects

```js
const e = {
  dM: fp.e.dM,                    // fiscal multiplier only
  yM: mp.e.yM,                    // monetary multiplier only
  iA: fp.e.iA + mp.e.iA,          // additives sum
  gM: mp.e.gM,                    // monetary multiplier only
  uM: fp.e.uM,                    // fiscal multiplier only
  lD: fp.e.lD + mp.e.lD,          // deltas sum
  cD: fp.e.cD + mp.e.cD,          // deltas sum
};
```

### Full Policy Parameter Table

**Fiscal:**

| id          | dM   | iA     | uM   | lD    | cD    | Notes                          |
|-------------|------|--------|------|-------|-------|--------------------------------|
| `none`      | 1.00 | 0      | 1.00 | 0     | 0     | Baseline drift                 |
| `robot_ubi` | 0.72 | +0.002 | 0.82 | +0.08 | −0.06 | Revenue from robot tax offsets |
| `austerity` | 0.60 | −0.010 | 1.15 | −0.02 | +0.01 | Spending cap at 92% of base    |

**Monetary:**

| id           | yM   | iA     | gM   | lD    | cD    | Notes                          |
|--------------|------|--------|------|-------|-------|--------------------------------|
| `none`       | 1.00 | 0      | 1.00 | 0     | 0     | No intervention                |
| `qe`         | 0.70 | +0.035 | 1.55 | −0.05 | +0.07 | 30% yield suppression          |
| `ycc`        | 0.58 | +0.045 | 1.70 | −0.06 | +0.08 | 4.5% hard yield cap            |
| `repression` | 0.72 | +0.020 | 1.35 | −0.03 | +0.04 | Regulatory yield suppression   |

---

## 4. Chart Architecture

### Six Panels

| # | Metric           | Color     | Domain       | Ticks               | Ref lines         |
|---|------------------|-----------|--------------|---------------------|-------------------|
| 1 | Debt/GDP         | `#ef4444` | [100, 310]   | 125, 175, 225, 275  | 130%, 175%        |
| 2 | Unemployment     | `#8b5cf6` | [0, 50]      | 5, 15, 25, 35, 45   | 10%, 20%          |
| 3 | Inflation        | `#3b82f6` | [−12, 20]    | −10,−5, 0, 5,10,15  | (none — 0 line)   |
| 4 | 10Y Bond Yield   | `#eab308` | [2, 14]      | 3, 5, 7, 9, 11, 13  | 4.5% (YCC cap)    |
| 5 | Gold/Crypto idx  | `#B8860B` | [0, 8000]    | 1000, 2500, 5000, 7500 | —              |
| 6 | K-Shaped Economy | dual      | [20, 65]     | 25, 35, 45, 55      | labour+capital    |

Panel 6 uses two `Line` elements on the same chart: labour share (green `#16a34a`)
and capital share (red `#ef4444`). It is implemented as a completely standalone
`KShapeChart` component — see Recharts Gotchas below for why.

### KPI Bar

6 chip components across the top of the right panel. Values come from:

```js
const last = rows.find(r => r.year === kpiYear) || rows[rows.length - 1];
```

`kpiYear` is state (default 2035), controlled by the snapshot year slider.
The slider runs 2026–2035 with clickable year labels below it.

---

## 5. Recharts Gotchas — CRITICAL

These were discovered through painful iteration and cost significant debugging time.
**Do not violate these rules when modifying the charts.**

### Rule 1: Never wrap recharts children in custom components

Recharts scans its children using `React.Children` and matches by **component type
identity**. If you wrap `<CartesianGrid>` or `<YAxis>` in your own function/component,
Recharts silently drops it. Zero error message.

```jsx
// ❌ WRONG — Recharts will silently ignore gridEl
const gridEl = <CartesianGrid strokeDasharray="3 3" />;
return <LineChart>{gridEl}<Line .../></LineChart>;

// ❌ WRONG — wrapper function breaks type identity
function MyAxis() { return <YAxis tick={...} />; }
return <LineChart><MyAxis /><Line .../></LineChart>;

// ✅ CORRECT — always inline directly
return (
  <LineChart>
    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
    <YAxis tick={{ fontFamily:"...", fontSize:8 }} domain={[0,50]} ticks={[5,15,25,35,45]} />
    <Line ... />
  </LineChart>
);
```

### Rule 2: Never use height="100%" inside a flex/grid container

`ResponsiveContainer` with `height="100%` renders at 0px inside a flex or grid
parent unless the parent has an **explicit pixel height**. No explicit height = invisible chart.

```jsx
// ❌ WRONG — renders at 0px
<div style={{ flex: 1 }}>
  <ResponsiveContainer width="100%" height="100%">

// ✅ CORRECT — explicit pixel height everywhere
const CH = 148; // define once, use everywhere
<div style={{ height: CH }}>
  <ResponsiveContainer width="100%" height={CH}>
```

This applies to the grid container too:
```jsx
// ✅ CORRECT
style={{ display:"grid", gridTemplateRows: `repeat(2, ${CH+32}px)` }}
```

### Rule 3: domain and ticks must be consistent

Recharts clips or ignores ticks that fall outside the domain. If your domain is
`[0, 50]` and you have a tick at `50`, it may render partially or not at all.
Keep all ticks strictly inside the domain.

```jsx
// ❌ Risky — 50 is at the domain boundary
domain={[0, 50]} ticks={[5, 15, 25, 35, 45, 50]}

// ✅ Safe
domain={[0, 50]} ticks={[5, 15, 25, 35, 45]}
```

### Rule 4: tickCount and explicit ticks conflict

Use one or the other, never both on the same axis.

```jsx
// ❌ WRONG — tickCount overrides your ticks array
<YAxis tickCount={5} ticks={[5, 15, 25, 35, 45]} />

// ✅ CORRECT
<YAxis ticks={[5, 15, 25, 35, 45]} />
```

### Rule 5: isAnimationActive={false} for performance

With 10 data points per panel × 6 panels, animations cause noticeable lag on
every slider move. Disable them.

```jsx
<Line isAnimationActive={false} ... />
```

### Rule 6: KShapeChart must be a standalone component

The K-shape panel has two lines and custom behaviour. It went invisible for multiple
versions when it shared conditional rendering logic with other panels. The fix was
to extract it as a completely independent component that always renders, owns its
own `ResponsiveContainer`, and has no shared state with the panel grid.

---

## 6. UI Layout Notes

### Overall Structure

```
┌─────────────────────────────────────────────────────┐
│  Header (title, scenario badges)                    │
├──────────────┬──────────────────────────────────────┤
│  LEFT PANEL  │  RIGHT PANEL                         │
│  (240px)     │  (flex: 1)                           │
│              │                                      │
│  Displacement│  Snapshot year slider                │
│  slider      │  6 × KPI chips                       │
│              │  2×3 chart grid                      │
│  Fiscal      │    [Debt/GDP]  [Unemp]  [Infl]      │
│  selector    │    [Yield]    [Gold]   [K-shape]     │
│              │                                      │
│  Monetary    │  Break/Ghost footnote                │
│  selector    │                                      │
│              │  K-shape footnote                    │
└──────────────┴──────────────────────────────────────┘
```

### Key Layout Rules

- Overall: `display:flex, height:100vh, overflow:hidden` — nothing scrolls
- Left panel: `width:240px, flexShrink:0` — fixed, never grows
- Right panel: `flex:1, overflowY:auto` — scrollable if content overflows
- Chart grid: `display:grid, gridTemplateColumns:repeat(3,1fr)`
- `gridTemplateRows: repeat(2, ${CH+32}px)` — **must be explicit pixels**

### Displacement Slider

The slider maps 0–65% displaced workers. Five anchor labels are positioned
absolutely above the track using percentage-based `left` values:

```js
const ANCHORS = [
  { pct:0.05, label:"CBO" },      // left: (5/65 × 100)%
  { pct:0.10, label:"IMF/GS" },
  { pct:0.25, label:"McKinsey" },
  { pct:0.40, label:"SPICE" },    // default
  { pct:0.60, label:"Tsunami" },
];
```

Click on any anchor label jumps the slider to that value.

### Snapshot Year Slider

Sits above the KPI chips. Runs 2026–2035. Year labels below it are clickable.
State: `const [kpiYear, setKpiYear] = useState(2035)`.

---

## 7. How to Extend the Model

### Add a new policy

1. Add an entry to `FISCAL_POLICIES` or `MONETARY_POLICIES` with a new `id` and `e` object
2. Calibrate the effect parameters against historical precedents
3. Add a badge colour in the header badge renderer
4. Document it in `SPICE-MODEL-NOTES.md` and `spice-methodology.html`

### Add a new output variable

1. Compute it inside the `for` loop in `runSim` and add to the `rows.push({...})` call
2. Add a new panel in the chart grid (or replace an existing one)
3. Choose domain/ticks carefully following Recharts Rule 3
4. Add a KPI chip if appropriate

### Extend to 2040 (20 years)

Change `for (let i = 0; i < 10; i++)` to `< 20` and adjust the snapshot
year slider range from `max={2035}` to `max={2045}`. The model will compound
correctly — but note that the 300% debt cap becomes more likely to trigger,
and the gold ceiling (8000) may need raising.

### Add a new scenario anchor

Add to the `ANCHORS` array. The slider max is hardcoded to `0.65` (65%) — if
you add an anchor beyond this, update `max="0.65"` on the range input and the
`intensity = displaced / 0.65` normalisation.

---

## 8. Parameter Quick Reference

### Simulation Constants

| Constant      | Value  | Meaning                                    |
|---------------|--------|--------------------------------------------|
| `debtGDP`     | 1.23   | Starting debt/GDP (123%)                   |
| `employed`    | 160    | Starting employment (M workers)            |
| `lf`          | 167    | Labour force (M workers)                   |
| `r0`          | 0.041  | Base 10Y yield (4.1%)                      |
| `tax0`        | 0.18   | Base tax revenue (18% of GDP)              |
| `spend0`      | 0.245  | Base government spending (24.5% of GDP)    |
| `labShare`    | 0.60   | Starting labour share (60% of GDP)         |
| `capShare`    | 0.25   | Starting capital share (25% of GDP)        |
| `gold`        | 100    | Starting gold/crypto index                 |

### Key Multipliers / Sensitivities

| Parameter                     | Value | Meaning                                     |
|-------------------------------|-------|---------------------------------------------|
| Prod → GDP pass-through       | 0.65  | 65% of AI productivity → real output        |
| Prod → deflation pass-through | 0.50  | 50% of AI productivity → price falls        |
| Yield premium above 120% debt | 0.012 | 1.2bp per 1pp excess debt-to-GDP            |
| Yield sensitivity to deficit  | 0.18  | Yield rises 18bp per 1pp primary deficit    |
| Okun multiplier               | 1.2   | 1pp excess unemp → 1.2pp GDP drag           |
| Welfare multiplier            | 2.2   | 1pp unemp above 5% → 2.2pp spending/GDP    |
| kShift multiplier             | 0.45  | Displacement → labour share loss rate       |
| Capital capture fraction      | 0.55  | 55% of labour loss → capital share gain     |
| Gold stress multiplier        | 0.12  | mStress → annual gold return                |
| Max annual gold return        | 0.60  | 60% cap on single-year gold return          |

### Floors and Ceilings

| Variable     | Floor / Ceiling | Why                                          |
|--------------|-----------------|----------------------------------------------|
| Debt/GDP     | max 300%        | Crisis/restructuring assumed above this      |
| GDP growth   | min −5%         | No deeper than Great Recession modelled      |
| Inflation    | min −10%        | Fisher spiral capped at −10%                 |
| Inflation    | max +20%        | Hyperinflation excluded from base model      |
| Gold index   | max 8000        | 80× from start; prevents compounding absurdity |
| Employment   | min 55% of LF   | 45% unemployment floor (societal breakdown)  |
| Labour share | min 35%         | Even extreme scenarios leave some labour     |
| Capital share| max 52%         | Bounded by residual ~15% + labour floor      |

---

## 9. Design System

Consistent across all SPICE charts and the methodology doc.

| Token          | Value                        |
|----------------|------------------------------|
| Primary font   | `'IBM Plex Mono', monospace` |
| Gold accent    | `#B8860B`                    |
| Red (danger)   | `#ef4444`                    |
| Purple (unemp) | `#8b5cf6`                    |
| Blue (infl)    | `#3b82f6`                    |
| Yellow (yield) | `#eab308`                    |
| Green (labour) | `#16a34a`                    |
| Background     | `#ffffff`                    |
| Text primary   | `#111`                       |
| Text secondary | `#555`                       |
| Text faint     | `#aaa`                       |
| Border         | `#e2e2e2`                    |

Chart height constant: `const CH = 148` (px). Use this everywhere — never `"100%"`.

---

## 10. Outstanding TODOs

### Immediate
- [ ] Link Chart 3 footer to `/methodology` page
- [ ] Add `methodology.html` to the repo (`public/methodology.html`)
- [ ] Confirm Chart 3 route in React Router (`/collision` or `/simulation`)

### Near-term
- [ ] Chart 5: SPICE protocol mechanics — how the DeFi product works
- [ ] Add mobile layout for Chart 3 (currently desktop-only)
- [ ] Add comment/feedback mechanism to methodology page (GitHub Discussions?)

### Model improvements (if desired)
- [ ] International feedback loop — dollar weakness / EM crisis spillover
- [ ] Sectoral heterogeneity — not all workers equally exposed
- [ ] Extend to 2040 (20-year window)
- [ ] Stochastic variant — show confidence bands around SPICE base case
- [ ] Calibrate YCC inflation additive against actual BOJ data 2016–2023

### DeFi / Product
- [ ] Technical co-founder search (DeFi-experienced, willing to work for token allocation)
- [ ] IRONVAULT ticker: IRON — whitepaper draft

---

*This document was compiled from session transcripts, debugging notes, and the
final simulation code. For the full academic citation basis, see `methodology.html`.*
