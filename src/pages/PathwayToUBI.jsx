import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'

// ── Design tokens ─────────────────────────────────────────────────────────────
const F    = "'IBM Plex Mono', monospace"
const BG0  = "#0a0e1a"
const BG1  = "#080c16"
const BG2  = "#0f1520"
const BG3  = "#0d1828"
const BD   = "1px solid #1e2a42"
const T1   = "#e8eaf0"
const T2   = "#8899bb"
const T3   = "#4a5878"
const GOLD = "#c8a96e"
const RED  = "#ef4444"
const GRN  = "#3dffa0"
const BLU  = "#4488ff"
const ORG  = "#f97316"

// ── Economic model ────────────────────────────────────────────────────────────
//
// Calibrated to Bellefontaine, Ohio (Fairbrook colony):
//   Total business revenue: $350M (retail chains + full manufacturing sector)
//   Adults: 10,900  Workforce: 6,700  Avg wage: $2,667/month
//   Federal transfers today: $37M/year (Social Security + SNAP)
//   Daily bread basket: 5 S = $3.75 at today's Fisc rate ($0.75/S)
//
// Model assumptions:
//   Goods price deflation: P(A) = max(0.08, 1 − A × 0.80)
//   Business margin: 3.5% today, +56pp at A=1 (calibrated: $66M LAT at A=0.4)
//   Federal revenues: collapse 1.35× faster than automation grows
//   Price transmission: competitive markets pass automation savings to consumers
//
// Key result: crossing point (UBI real purchasing power = today's worker) at A ≈ 77%

const M = {
  adults:     10900,
  workforce:  6700,
  wage:       2667,        // $/month per employed worker
  revenue:    350e6,       // $/year all colony businesses
  baseMargin: 0.035,
  autoMargin: 0.560,       // additional margin gained at A=1.0
  priceSlope: 0.800,       // price falls by this × A
  priceFloor: 0.08,        // min price level (8% of today at full automation)
  federal:    37e6,        // $/year today
  fedDecay:   1.35,        // federal collapses faster than wages
  basket:     3.75,        // daily basket in USD today (= 5 S at $0.75/S)
  basketS:    5,           // daily basket in S (fixed anchor)
}

function computeAt(A) {
  // Goods price level (competitive market passes automation savings to consumers)
  const P        = Math.max(M.priceFloor, 1 - A * M.priceSlope)

  // Business margin and profit improve with automation
  const margin   = M.baseMargin + A * M.autoMargin
  const profit   = M.revenue * margin
  const baseline = M.revenue * M.baseMargin

  // LAT = automation windfall above 2× pre-automation baseline
  const lat      = Math.max(0, profit - 2 * baseline)

  // Fisc rate ($/S): anchored so daily basket always costs 5 S
  const fiscRate = (M.basket * P) / M.basketS

  // UBI: LAT flows through Fisc, distributed to all adults as S-tokens
  const ubiUSD   = lat / M.adults / 12         // $/adult/month
  const ubiSday  = ubiUSD / fiscRate / 30       // S/day

  // Federal transfers (collapse as income/payroll tax base shrinks)
  const fedTotal = M.federal * Math.max(0, 1 - A * M.fedDecay)
  const fedAdult = fedTotal / M.adults / 12    // $/adult/month

  // Wages: average across all adults (non-employed = $0)
  const wageAdult = M.workforce * M.wage * (1 - A) / M.adults  // $/adult/month

  // Daily basket cost in USD (falls with automation)
  const basketUSD = M.basket * P

  // Real purchasing power: measured in "today's daily bread baskets per month"
  // Today's employed worker = 711 baskets/month = index 100
  const ref         = M.wage / M.basket           // 711 baskets/month — the reference

  const ubiBaskets  = ubiUSD  / basketUSD          // baskets/month from UBI alone
  const wageBaskets = M.wage  / basketUSD          // baskets/month from unchanged wage

  const unemployedIndex = (ubiBaskets / ref) * 100                      // UBI only
  const employedIndex   = ((M.wage + ubiUSD) / basketUSD / ref) * 100   // wage + UBI
  const avgIndex        = ((wageAdult + fedAdult + ubiUSD) / basketUSD / ref) * 100

  return {
    pct:             Math.round(A * 100),
    // Income composition ($/month per adult, nominal)
    wages:           Math.round(wageAdult),
    federal:         Math.round(fedAdult),
    ubiUSD:          Math.round(ubiUSD),
    total:           Math.round(wageAdult + fedAdult + ubiUSD),
    // Real purchasing power (index, today employed worker = 100)
    unemployedIndex: Math.round(unemployedIndex),
    employedIndex:   Math.min(600, Math.round(employedIndex)),
    avgIndex:        Math.round(avgIndex),
    // Fisc
    fiscRate:        Math.round(fiscRate * 100) / 100,
    priceLevel:      Math.round(P * 100),
    basketUSD:       Math.round(basketUSD * 100) / 100,
    ubiSday:         Math.round(ubiSday * 10) / 10,
    latM:            Math.round(lat / 1e6),
  }
}

// Pre-compute all 101 points (0–100% automation)
const ALL = Array.from({ length: 101 }, (_, i) => computeAt(i / 100))

// Crossing point: first A where unemployed real index ≥ 100
const CROSSING = ALL.find(d => d.unemployedIndex >= 100)?.pct ?? null

// ── Stage definitions ─────────────────────────────────────────────────────────
function getStage(pct) {
  if (pct < 20)  return { label: 'Today',              color: T3,   desc: 'Wages dominant. Federal safety net intact. SPICE not yet needed.' }
  if (pct < 40)  return { label: 'Colony launches',    color: BLU,  desc: 'LAT emerges. UBI begins as a supplement. Federal transfers still present.' }
  if (pct < CROSSING || pct < 77)
                 return { label: 'The hard zone',       color: ORG,  desc: 'Wages falling. Federal collapsing. UBI growing but not yet above today\'s standard.' }
  if (pct < 90)  return { label: 'Crossing',           color: GOLD, desc: 'Real UBI purchasing power crosses today\'s worker standard. Colony self-sufficient.' }
  return           { label: 'Post-Collision',           color: GRN,  desc: 'Everyone wealthier than today\'s workers in real terms. Federal welfare irrelevant.' }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const CH = 230

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: BG2, border: BD, padding: '16px 20px', flex: '1 1 140px' }}>
      <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.2em', color: T3, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: F, fontSize: 22, color: color || T1, fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: F, fontSize: 10, color: T3, lineHeight: 1.5 }}>{sub}</div>
    </div>
  )
}

function IncomeChart({ data, highlightPct }) {
  const TooltipEl = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: BG1, border: BD, padding: '10px 14px', fontFamily: F, fontSize: 11 }}>
        <div style={{ color: T3, marginBottom: 6 }}>{label}% automation</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 2 }}>
            {p.name}: ${p.value}/mo per adult
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ height: CH }}>
      <ResponsiveContainer width="100%" height={CH}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
          <XAxis
            dataKey="pct"
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Automation level (%)', position: 'insideBottom', offset: -8, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]}
          />
          <YAxis
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: '$/month per adult', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, 1800]} ticks={[300, 600, 900, 1200, 1500]}
          />
          <Tooltip content={<TooltipEl />} />
          {/* Hard zone */}
          <ReferenceArea x1={40} x2={CROSSING || 77} fill={ORG} fillOpacity={0.04} />
          {/* Current position */}
          <ReferenceLine x={highlightPct} stroke={GOLD} strokeWidth={1.5} strokeDasharray="3 2" />
          <Line dataKey="wages"   stroke={ORG}  strokeWidth={2} dot={false} isAnimationActive={false} name="Wages" />
          <Line dataKey="federal" stroke={BLU}  strokeWidth={2} dot={false} isAnimationActive={false} name="Federal transfers" />
          <Line dataKey="ubiUSD"  stroke={GRN}  strokeWidth={2} dot={false} isAnimationActive={false} name="UBI (LAT-funded)" />
          <Line dataKey="total"   stroke={T2}   strokeWidth={1} strokeDasharray="4 2" dot={false} isAnimationActive={false} name="Total" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function RealPowerChart({ data, highlightPct }) {
  const TooltipEl = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: BG1, border: BD, padding: '10px 14px', fontFamily: F, fontSize: 11 }}>
        <div style={{ color: T3, marginBottom: 6 }}>{label}% automation</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 2 }}>
            {p.name}: {p.value}% of today's standard
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ height: CH }}>
      <ResponsiveContainer width="100%" height={CH}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
          <XAxis
            dataKey="pct"
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Automation level (%)', position: 'insideBottom', offset: -8, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]}
          />
          <YAxis
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Purchasing power (today = 100)', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, 550]} ticks={[100, 200, 300, 400, 500]}
          />
          <Tooltip content={<TooltipEl />} />
          {/* Hard zone shading */}
          <ReferenceArea x1={40} x2={CROSSING || 77} fill={ORG} fillOpacity={0.04} />
          {/* Today's standard */}
          <ReferenceLine
            y={100}
            stroke={T3}
            strokeDasharray="6 3"
            label={{ value: "Today's standard", position: 'insideTopRight', style: { fontFamily: F, fontSize: 9, fill: T3 } }}
          />
          {/* Crossing point */}
          {CROSSING && (
            <ReferenceLine
              x={CROSSING}
              stroke={GOLD}
              strokeDasharray="3 2"
              label={{ value: `${CROSSING}% — crossing point`, position: 'top', style: { fontFamily: F, fontSize: 9, fill: GOLD } }}
            />
          )}
          {/* Current position */}
          <ReferenceLine x={highlightPct} stroke={GOLD} strokeWidth={1.5} strokeDasharray="3 2" />
          <Line
            dataKey="unemployedIndex"
            stroke={GRN}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
            name="UBI recipient (no wage)"
          />
          <Line
            dataKey="employedIndex"
            stroke={BLU}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Employed (wage + UBI)"
          />
          <Line
            dataKey="avgIndex"
            stroke={T2}
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={false}
            name="Average adult"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PathwayToUBI() {
  const [automation, setAutomation] = useState(20)

  const snap    = ALL[automation]
  const stage   = getStage(automation)

  const legend1 = [
    { color: ORG,  label: 'Wages (per adult average)' },
    { color: BLU,  label: 'Federal transfers (Social Security, SNAP)' },
    { color: GRN,  label: 'UBI — LAT flowing through Fisc to all adults' },
    { color: T2,   label: 'Total (dashed)' },
  ]

  const legend2 = [
    { color: GRN,  label: 'UBI recipient only (no wage) — starts near zero, crosses 100 at ~77%' },
    { color: BLU,  label: 'Employed worker (wage + UBI) — always above 100, rising steeply' },
    { color: T2,   label: 'Average adult (weighted mix)' },
    { color: T3,   label: "Dashed: today's standard = 100" },
  ]

  return (
    <div style={{ background: BG0, minHeight: '100vh', fontFamily: F }}>

      {/* ── Hero ── */}
      <section style={{ background: BG1, borderBottom: BD, padding: '60px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 20, borderBottom: BD, paddingBottom: 10 }}>
            SPICE Protocol · Economic Model · Bellefontaine calibration
          </div>
          <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: T1, margin: '0 0 20px 0', lineHeight: 1.2 }}>
            The Pathway to UBI
          </h1>
          <p style={{ fontFamily: F, fontSize: 13, color: T2, lineHeight: 1.9, margin: '0 0 16px 0', maxWidth: 700 }}>
            Automation drives goods prices toward zero. The welfare state — funded by income
            and payroll taxes on wages — collapses as those wages disappear. SPICE replaces it:
            LAT taxes the automation windfall, the Fisc distributes it as S-token UBI,
            and the S/USD exchange rate stabilises real purchasing power as prices fall.
          </p>
          <p style={{ fontFamily: F, fontSize: 13, color: T2, lineHeight: 1.9, margin: 0, maxWidth: 700 }}>
            The destination is not austerity — it is abundance. As automation deepens,
            the same UBI buys more, because goods become cheaper faster than UBI grows.
            Citizens with no wage eventually live better than today's workers.
            The path there contains a hard zone. The charts below show both.
          </p>
        </div>
      </section>

      {/* ── Slider + Stage + KPIs ── */}
      <section style={{ borderBottom: BD, padding: '40px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Stage indicator */}
          <div style={{
            background: BG3, border: `1px solid ${stage.color}`,
            borderLeft: `4px solid ${stage.color}`,
            padding: '12px 20px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ fontFamily: F, fontSize: 13, color: stage.color, fontWeight: 700, minWidth: 160 }}>
              {stage.label}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.6 }}>
              {stage.desc}
            </div>
          </div>

          {/* Slider */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: F, fontSize: 11, color: T2 }}>Automation level</span>
              <span style={{ fontFamily: F, fontSize: 15, color: GOLD, fontWeight: 700 }}>
                {automation}% of work automated
              </span>
            </div>
            <input
              type="range" min={0} max={100} step={1} value={automation}
              onChange={e => setAutomation(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: GOLD, cursor: 'pointer' }}
            />
            {/* Stage markers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {[
                { pct: 0,   label: 'Today',      color: T3 },
                { pct: 20,  label: 'Colony',     color: BLU },
                { pct: 40,  label: 'Hard zone',  color: ORG },
                { pct: CROSSING || 77, label: 'Crossing', color: GOLD },
                { pct: 90,  label: 'Post-Collision', color: GRN },
              ].map(({ pct, label, color }) => (
                <div
                  key={pct}
                  onClick={() => setAutomation(pct)}
                  style={{
                    fontFamily: F, fontSize: 9, color,
                    letterSpacing: '0.08em', cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {pct}% {label}
                </div>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <KpiCard
              label="Monthly UBI"
              value={snap.ubiUSD > 0 ? `$${snap.ubiUSD.toLocaleString()}` : '—'}
              sub={snap.ubiSday > 0 ? `${snap.ubiSday} S/day at $${snap.fiscRate}/S` : 'LAT not yet above 2× baseline'}
              color={snap.ubiUSD > 0 ? GRN : T3}
            />
            <KpiCard
              label="Daily basket cost"
              value={`$${snap.basketUSD}`}
              sub={`${snap.priceLevel}% of today · always 5 S`}
              color={GOLD}
            />
            <KpiCard
              label="Fisc rate"
              value={`$${snap.fiscRate}/S`}
              sub="Falls as goods get cheaper. Bread basket stays fixed at 5 S."
              color={T1}
            />
            <KpiCard
              label="UBI purchasing power"
              value={snap.unemployedIndex > 0 ? `${snap.unemployedIndex}%` : '—'}
              sub={
                snap.unemployedIndex >= 100
                  ? 'Above today\'s worker standard'
                  : snap.unemployedIndex > 0
                  ? `${100 - snap.unemployedIndex}pp below today's standard`
                  : 'UBI not yet funded'
              }
              color={snap.unemployedIndex >= 100 ? GRN : snap.unemployedIndex > 50 ? GOLD : snap.unemployedIndex > 0 ? ORG : T3}
            />
          </div>
        </div>
      </section>

      {/* ── Chart 1: Income composition ── */}
      <section style={{ borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 16, borderBottom: BD, paddingBottom: 10 }}>
            Chart 1 · Income composition — who funds the citizen's monthly income
          </div>
          <div style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: T1, marginBottom: 8 }}>
            Wages and welfare collapse. LAT/UBI rises to replace them.
          </div>
          <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 20px 0' }}>
            Monthly income per adult averaged across all citizens. Wages fall as workers are displaced.
            Federal transfers collapse as income and payroll tax revenues shrink — Social Security
            and SNAP cannot survive the loss of their funding base. UBI, funded by LAT on automation
            profits flowing through the Fisc, grows to fill the gap.
          </p>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            {legend1.map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 2, background: color }} />
                <span style={{ fontFamily: F, fontSize: 9, color: T3 }}>{label}</span>
              </div>
            ))}
          </div>
          <IncomeChart data={ALL} highlightPct={automation} />
          <div style={{ marginTop: 16, background: BG3, border: BD, borderLeft: `3px solid ${ORG}`, padding: '14px 18px' }}>
            <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8 }}>
              <span style={{ color: ORG }}>The hard zone (shaded):</span>
              {' '}wages and federal transfers fall faster than UBI rises, creating a nominal income
              dip. In real terms this is partially offset by falling prices. The transition requires
              the colony to have launched before the hard zone arrives — the UBI mechanism must be
              running before wages collapse, not after.
            </div>
          </div>
        </div>
      </section>

      {/* ── Chart 2: Real purchasing power ── */}
      <section style={{ background: BG1, borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 16, borderBottom: BD, paddingBottom: 10 }}>
            Chart 2 · Real purchasing power — what income actually buys (today's worker = 100)
          </div>
          <div style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: T1, marginBottom: 8 }}>
            The destination: everyone above 100. The path: one line crosses first.
          </div>
          <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 20px 0' }}>
            Measured in "daily bread baskets per month" — the real purchasing power of income
            relative to today's employed worker (= 100). As prices fall with automation, the same
            number of dollars buys more. The UBI recipient's line (green) crosses 100 at{' '}
            <span style={{ color: GOLD }}>~{CROSSING || 77}% automation</span> — from that
            point, even someone with no wage lives better in real terms than today's workers.
            Employed workers (wage + UBI + cheaper goods) reach 300–500% by post-Collision.
          </p>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            {legend2.map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 2, background: color }} />
                <span style={{ fontFamily: F, fontSize: 9, color: T3 }}>{label}</span>
              </div>
            ))}
          </div>
          <RealPowerChart data={ALL} highlightPct={automation} />
          <div style={{ marginTop: 16, background: BG3, border: BD, borderLeft: `3px solid ${GRN}`, padding: '14px 18px' }}>
            <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8 }}>
              <span style={{ color: GRN }}>Why the green line accelerates:</span>
              {' '}two effects compound. LAT revenue grows as automation profits expand.
              Simultaneously, the price of goods falls — so the same UBI buys more baskets each year.
              Real purchasing power rises faster than automation level in a self-reinforcing dynamic.
              This is the mathematical basis for the SPICE claim: citizens will be materially
              better off than any previous generation.
            </div>
          </div>
        </div>
      </section>

      {/* ── The Fisc mechanism ── */}
      <section style={{ borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 20, borderBottom: BD, paddingBottom: 10 }}>
            The Fisc · How the exchange rate stabilises everything
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              {
                label: 'Today (A = 20%)',
                data: ALL[20],
                color: BLU,
              },
              {
                label: `Hard zone (A = ${Math.round((40 + (CROSSING || 77)) / 2)}%)`,
                data: ALL[Math.round((40 + (CROSSING || 77)) / 2)],
                color: ORG,
              },
              {
                label: 'Post-Collision (A = 90%)',
                data: ALL[90],
                color: GRN,
              },
            ].map(({ label, data, color }) => (
              <div key={label} style={{ background: BG2, border: BD, borderTop: `3px solid ${color}`, padding: '20px 20px' }}>
                <div style={{ fontFamily: F, fontSize: 9, color: T3, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
                {[
                  { k: 'Fisc rate',      v: `$${data.fiscRate}/S` },
                  { k: 'Basket (USD)',   v: `$${data.basketUSD}/day` },
                  { k: 'Basket (S)',     v: `5 S/day (fixed)` },
                  { k: 'Monthly UBI',   v: data.ubiUSD > 0 ? `$${data.ubiUSD.toLocaleString()}` : '—' },
                  { k: 'UBI in S/day',  v: data.ubiSday > 0 ? `${data.ubiSday} S` : '—' },
                  { k: 'Price level',   v: `${data.priceLevel}% of today` },
                ].map(({ k, v }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: F, fontSize: 10, color: T3 }}>{k}</span>
                    <span style={{ fontFamily: F, fontSize: 11, color: T1 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, background: BG3, border: BD, padding: '16px 20px' }}>
            <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.9 }}>
              The Fisc rate falls as goods get cheaper. A citizen holding S tokens sees their
              purchasing power rise even though the nominal exchange rate declines — because
              the basket costs less in USD. Citizens do not need to track exchange rates:
              the bread basket always costs 5 S, regardless of what is happening to the dollar.
              The colony is insulated from dollar debasement and deflation simultaneously.
            </div>
          </div>
        </div>
      </section>

      {/* ── Formal math ── */}
      <section style={{ background: BG1, borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 20, borderBottom: BD, paddingBottom: 10 }}>
            Formal model · Key equations
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              {
                title: 'Price deflation',
                eq: 'P(A) = max(ε, 1 − A · 0.80)',
                note: 'Goods prices fall as automation penetrates production and supply chains. ε is the energy/materials floor (≈8%). Services priced in S are not subject to this deflation.',
              },
              {
                title: 'Automation profit',
                eq: 'Π(A) = R · (m₀ + A · 0.56)',
                note: 'Business profit margin rises from 3.5% today to ~59% at full automation, as labour and COGS costs collapse. R is held constant (volume compensates for price falls).',
              },
              {
                title: 'LAT',
                eq: 'LAT(A) = max(0, Π(A) − 2·Π(0))',
                note: 'Captures the automation windfall above 2× today\'s baseline profit. Businesses are genuinely better off. The excess flows to the colony via the Fisc.',
              },
              {
                title: 'Fisc rate (S/USD)',
                eq: 'r(A) = B₀ · P(A) / 5',
                note: 'Anchored so the daily basket always costs 5 S. Falls as goods get cheaper. Citizens are insulated from dollar debasement — they think in S, not dollars.',
              },
              {
                title: 'UBI per adult',
                eq: 'UBI(A) = LAT(A) / (N_adults · 12)',
                note: 'Monthly USD equivalent, distributed by the Fisc as S-tokens at the current rate. All adults receive equally — no means test, no taper.',
              },
              {
                title: 'Real purchasing power',
                eq: 'U_real(A) = UBI(A) / (B₀ · P(A))',
                note: 'Baskets per month. Both numerator (LAT) and denominator (basket cost) move in the citizen\'s favour as A increases. Real power accelerates non-linearly.',
              },
            ].map(({ title, eq, note }) => (
              <div key={title} style={{ background: BG2, border: BD, padding: '18px 20px' }}>
                <div style={{ fontFamily: F, fontSize: 10, color: T3, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>{title}</div>
                <div style={{
                  fontFamily: "'Courier New', monospace", fontSize: 13, color: GOLD,
                  background: BG0, padding: '8px 12px', marginBottom: 10,
                  borderLeft: `2px solid ${GOLD}`,
                }}>
                  {eq}
                </div>
                <div style={{ fontFamily: F, fontSize: 10, color: T2, lineHeight: 1.7 }}>{note}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, background: BG3, border: BD, borderLeft: `3px solid ${GOLD}`, padding: '16px 20px' }}>
            <div style={{ fontFamily: F, fontSize: 10, color: T3, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Crossing point — the key threshold</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: GOLD, marginBottom: 8 }}>
              U_real(A*) = today_worker_standard
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8 }}>
              Solved at <span style={{ color: GOLD }}>A* ≈ {CROSSING || 77}%</span> for
              the Bellefontaine calibration. Beyond this point, a citizen with no wage and
              no government benefit lives better in real purchasing-power terms than today's
              employed worker — solely from the automation dividend distributed as UBI.
              This is the mathematical destination of the SPICE model.
            </div>
          </div>
        </div>
      </section>

      {/* ── What this replaces ── */}
      <section style={{ borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 20, borderBottom: BD, paddingBottom: 10 }}>
            Context · SPICE is the evolved welfare state
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { label: 'Today: corporation tax', arrow: 'LAT', desc: 'Today\'s corporation tax is flat on all profit. LAT taxes only the automation windfall — the productivity gain above baseline. Human employment is implicitly exempt.' },
              { label: 'Today: targeted welfare', arrow: 'Universal UBI', desc: 'Today\'s welfare is means-tested, tapered, and stigmatised. UBI is universal — no means test, no taper, no poverty trap. Work always pays because UBI is not withdrawn.' },
              { label: 'Today: fiat currency', arrow: 'S-token', desc: 'The dollar is being debased to manage sovereign debt. S is anchored to the bread basket — it cannot be inflated away. Citizens hold a store of value the government cannot debase.' },
              { label: 'Today: national redistribution', arrow: 'Local colony', desc: 'National welfare systems cannot respond to local automation patterns. A colony with 70% automation needs more redistribution than one with 20%. SPICE calibrates locally.' },
            ].map(({ label, arrow, desc }) => (
              <div key={label} style={{ background: BG2, border: BD, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontFamily: F, fontSize: 10, color: T3 }}>{label}</span>
                  <span style={{ fontFamily: F, fontSize: 9, color: T3 }}>→</span>
                  <span style={{ fontFamily: F, fontSize: 11, color: GOLD, fontWeight: 600 }}>{arrow}</span>
                </div>
                <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Navigation ── */}
      <section style={{ background: BG1, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 20 }}>Related</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { href: '/fairbrook', label: 'Fairbrook circularity model →' },
              { href: '/earth',     label: 'Earth colony design →' },
              { href: '/collision', label: 'The Collision simulation →' },
            ].map(({ href, label }) => (
              <a key={href} href={href} style={{
                fontFamily: F, fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: GOLD,
                textDecoration: 'none', border: `1px solid ${GOLD}`,
                padding: '10px 20px',
              }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
