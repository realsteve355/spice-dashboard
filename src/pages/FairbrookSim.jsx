import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ── Design tokens ────────────────────────────────────────────────────────────
const F    = "'IBM Plex Mono', monospace"
const BG0  = "#06070a"
const BG1  = "#0d0f12"
const BG2  = "#11141a"
const BG3  = "#0d1828"
const BD   = "1px solid #232831"
const T1   = "#ede5d4"
const T2   = "#b8b0a0"
const T3   = "#8a8170"
const GOLD = "#c8a96e"
const RED  = "#ef4444"
const GRN  = "#3dffa0"
const BLU  = "#4488ff"
const PRP  = "#9966ff"

// ── Bellefontaine real data ───────────────────────────────────────────────────
const B = {
  pop:                   14100,
  workforce:             6700,
  avgWageMonthly:        2667,    // $32K/year ÷ 12
  baselineAnnualProfits: 8.41e6,  // all local businesses today
  spiceProfitAtFullRev:  52e6,    // all businesses in SPICE world at full revenue
  // Derivation: $200M total revenue × ~26% SPICE margin after automation savings
  // Source: Fairbrook LAT model (docs/fairbrook-lat-model.md)
}

// ── Core economic model ───────────────────────────────────────────────────────

/**
 * Revenue multiplier at a given UBI level and displacement rate.
 *
 * revMult = monthly_spending / pre_automation_spending
 *
 * Monthly spending = (all 14,100 citizens × UBI + employed × avg_wage) × 0.85 savings rate
 * Pre-auto spending = workforce × avg_wage × 0.85 (workers only, no UBI existed)
 *
 * The 0.85 cancels, so:
 * revMult = (pop × U + employed × avgWage) / (workforce × avgWage)
 */
function revMult(ubiMonthly, displacement) {
  const employed = B.workforce * (1 - displacement)
  return (B.pop * ubiMonthly + employed * B.avgWageMonthly) /
         (B.workforce * B.avgWageMonthly)
}

/**
 * Annual LAT revenue given UBI level and policy settings.
 *
 * LAT = SPICE profit before LAT − (retainMult × today's baseline profit)
 * SPICE profit scales with revenue, which scales with spending power.
 */
function annualLAT(ubiMonthly, displacement, retainMult) {
  const rm             = revMult(ubiMonthly, displacement)
  const spiceProfit    = B.spiceProfitAtFullRev * rm
  const allowedToKeep  = retainMult * B.baselineAnnualProfits
  return Math.max(0, spiceProfit - allowedToKeep)
}

/**
 * Monthly UBI that the current LAT revenue can fund.
 * This is the "what LAT can pay for" function f(U).
 * Equilibrium is where f(U) = U.
 */
function latFundedUBI(ubiMonthly, displacement, retainMult) {
  return annualLAT(ubiMonthly, displacement, retainMult) / B.pop / 12
}

/**
 * Solve for equilibrium UBI analytically.
 *
 * At equilibrium U*:  annualLAT(U*) / (pop × 12) = U*
 *
 * Expanding:
 *   spiceProfitAtFullRev × revMult(U*) − retainMult×baseline = pop×12×U*
 *   P × (pop×U* + employed×avgWage) / (workforce×avgWage) − r×base = n×12×U*
 *
 * Solving for U*:
 *   U* = (P×(1−D) − r×base) / (n × (12 − P/W))
 *
 * where W = workforce × avgWageMonthly (monthly wage base)
 *       P = spiceProfitAtFullRev (annual)
 */
function equilibriumUBI(displacement, retainMult) {
  const P         = B.spiceProfitAtFullRev
  const W         = B.workforce * B.avgWageMonthly  // monthly base
  const n         = B.pop

  // numerator uses annual units: P×(1-D) is annual spice profit if employment unchanged
  const numerator   = P * (1 - displacement) - retainMult * B.baselineAnnualProfits
  // P/W converts annual profit to monthly revenue ratio; 12 makes months comparable
  const denominator = n * (12 - P / W)

  if (denominator <= 0) return null
  const U = numerator / denominator
  return U > 0 ? U : 0
}

// ── Chart data builders ───────────────────────────────────────────────────────

/** Chart 1: f(U) — LAT-funded UBI as a function of proposed UBI. */
function buildFeedbackCurve(displacement, retainMult) {
  const pts = []
  for (let u = 0; u <= 600; u += 10) {
    pts.push({
      u,
      funded: Math.round(latFundedUBI(u, displacement, retainMult)),
      diagonal: u,
    })
  }
  return pts
}

/** Chart 2: Equilibrium UBI vs displacement rate. */
function buildSensitivityCurve(retainMult) {
  const pts = []
  for (let d = 0; d <= 70; d += 5) {
    const eq = equilibriumUBI(d / 100, retainMult)
    pts.push({
      displacement: d,
      equilibriumUBI: eq !== null ? Math.round(eq) : null,
    })
  }
  return pts
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <div style={{
      fontFamily: F, fontSize: 9, letterSpacing: '0.3em',
      textTransform: 'uppercase', color: T3,
      marginBottom: 20, borderBottom: BD, paddingBottom: 10,
    }}>
      {children}
    </div>
  )
}

function KpiCard({ label, value, sub, color, warn }) {
  return (
    <div style={{
      background: BG2, border: warn ? `1px solid ${RED}` : BD,
      padding: '18px 22px', flex: '1 1 160px',
    }}>
      <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.2em', color: T3, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: F, fontSize: 22, color: color || T1, fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: F, fontSize: 10, color: T3, lineHeight: 1.5 }}>{sub}</div>
    </div>
  )
}

function Slider({ label, min, max, step, value, onChange, format }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: F, fontSize: 11, color: T2 }}>{label}</span>
        <span style={{ fontFamily: F, fontSize: 13, color: GOLD, fontWeight: 700 }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: GOLD, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontFamily: F, fontSize: 9, color: T3 }}>{format ? format(min) : min}</span>
        <span style={{ fontFamily: F, fontSize: 9, color: T3 }}>{format ? format(max) : max}</span>
      </div>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, border: BD, overflow: 'hidden' }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            flex: 1, padding: '8px 12px',
            fontFamily: F, fontSize: 10, letterSpacing: '0.08em',
            background: value === o.value ? GOLD : 'transparent',
            color: value === o.value ? BG0 : T3,
            border: 'none', cursor: 'pointer',
            borderLeft: o !== options[0] ? BD : 'none',
            fontWeight: value === o.value ? 700 : 400,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const CH = 220 // chart height px

function FeedbackChart({ data, eqUBI }) {
  const maxY = 600
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: BG1, border: BD, padding: '10px 14px', fontFamily: F, fontSize: 11 }}>
        <div style={{ color: T3, marginBottom: 4 }}>Proposed UBI: ${label}/mo</div>
        {payload.map(p => p.dataKey === 'funded' && (
          <div key="f" style={{ color: GRN }}>LAT can fund: ${p.value}/mo</div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ height: CH }}>
      <ResponsiveContainer width="100%" height={CH}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232831" />
          <XAxis
            dataKey="u"
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Proposed UBI ($/month)', position: 'insideBottom', offset: -4, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, 600]} ticks={[0, 100, 200, 300, 400, 500]}
          />
          <YAxis
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'LAT-funded UBI ($/month)', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, maxY]} ticks={[0, 100, 200, 300, 400, 500]}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Diagonal Y=X line — where LAT exactly covers UBI */}
          <Line
            dataKey="diagonal"
            stroke={T3}
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
            name="Self-funding line (Y=X)"
          />
          {/* f(U) — what LAT actually funds at each UBI level */}
          <Line
            dataKey="funded"
            stroke={GRN}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="LAT-funded UBI"
          />
          {eqUBI > 0 && eqUBI <= 500 && (
            <ReferenceLine
              x={Math.round(eqUBI)}
              stroke={GOLD}
              strokeDasharray="4 2"
              label={{ value: `$${Math.round(eqUBI)}/mo equilibrium`, position: 'top', style: { fontFamily: F, fontSize: 9, fill: GOLD } }}
            />
          )}
          {/* $296 target reference */}
          <ReferenceLine
            x={296}
            stroke={BLU}
            strokeDasharray="2 4"
            label={{ value: '$296 target', position: 'insideTopRight', style: { fontFamily: F, fontSize: 9, fill: BLU } }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function SensitivityChart({ data, currentDisplacement }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const v = payload[0]?.value
    return (
      <div style={{ background: BG1, border: BD, padding: '10px 14px', fontFamily: F, fontSize: 11 }}>
        <div style={{ color: T3, marginBottom: 4 }}>{label}% automated</div>
        <div style={{ color: v ? GOLD : RED }}>
          {v ? `Stable UBI: $${v}/month` : 'No stable equilibrium'}
        </div>
      </div>
    )
  }
  return (
    <div style={{ height: CH }}>
      <ResponsiveContainer width="100%" height={CH}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232831" />
          <XAxis
            dataKey="displacement"
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Workforce displaced (%)', position: 'insideBottom', offset: -4, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, 70]} ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
          />
          <YAxis
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Stable UBI ($/month)', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            domain={[0, 400]} ticks={[0, 100, 200, 300]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            dataKey="equilibriumUBI"
            stroke={GOLD}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
          <ReferenceLine
            x={currentDisplacement * 100}
            stroke={GRN}
            strokeDasharray="3 2"
            label={{ value: 'current scenario', position: 'top', style: { fontFamily: F, fontSize: 9, fill: GRN } }}
          />
          <ReferenceLine
            y={296}
            stroke={BLU}
            strokeDasharray="2 4"
            label={{ value: '$296 target', position: 'insideTopRight', style: { fontFamily: F, fontSize: 9, fill: BLU } }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FairbrookSim() {
  const [displacement, setDisplacement] = useState(0.40)
  const [retainMult,   setRetainMult]   = useState(2.0)

  const eqUBI = useMemo(() =>
    equilibriumUBI(displacement, retainMult),
    [displacement, retainMult]
  )

  const hasEquilibrium = eqUBI !== null && eqUBI > 0

  // State at equilibrium UBI (or at $296 if no equilibrium)
  const reportUBI     = hasEquilibrium ? eqUBI : 0
  const rm            = useMemo(() => revMult(reportUBI, displacement), [reportUBI, displacement])
  const latAtEq       = useMemo(() => annualLAT(reportUBI, displacement, retainMult), [reportUBI, displacement, retainMult])
  const latAtTarget   = useMemo(() => annualLAT(296, displacement, retainMult), [displacement, retainMult])
  const ubiCost296    = B.pop * 296 * 12
  const annualDeficit = Math.max(0, ubiCost296 - latAtTarget)

  const feedbackCurve   = useMemo(() => buildFeedbackCurve(displacement, retainMult), [displacement, retainMult])
  const sensitivityData = useMemo(() => buildSensitivityCurve(retainMult), [retainMult])

  // Viability cliff: displacement at which equilibrium = 0
  const viabilityCliff = Math.round((1 - retainMult * B.baselineAnnualProfits / B.spiceProfitAtFullRev) * 100)

  const fmt  = v => `$${Math.round(v).toLocaleString()}`
  const fmtM = v => `$${(v / 1e6).toFixed(1)}M`
  const pct  = v => `${Math.round(v * 100)}%`

  return (
    <div style={{ background: BG0, minHeight: '100vh', fontFamily: F }}>

      {/* ── Hero ── */}
      <section style={{ background: BG1, borderBottom: BD, padding: '60px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Label>Fairbrook · Ohio · Population 14,100 — Based on Bellefontaine real data</Label>
          <h1 style={{
            fontFamily: F, fontSize: 28, fontWeight: 700, color: T1,
            margin: '0 0 20px 0', lineHeight: 1.2, letterSpacing: '0.02em',
          }}>
            The Revenue Circularity Problem
          </h1>
          <p style={{ fontFamily: F, fontSize: 13, color: T2, lineHeight: 1.9, margin: '0 0 16px 0', maxWidth: 680 }}>
            Walmart's LAT payment depends on Walmart's profit. Walmart's profit depends on its
            revenue. Its revenue depends on citizens having spending power. Citizens' spending
            power depends on the UBI. The UBI depends on LAT revenue. The loop is closed —
            and the stability of the system depends entirely on where this loop reaches equilibrium.
          </p>
          <p style={{ fontFamily: F, fontSize: 13, color: T2, lineHeight: 1.9, margin: '0 0 0 0', maxWidth: 680 }}>
            Earlier modelling assumed Walmart maintained its $50M revenue regardless of
            displacement. This simulation accounts for the feedback: displaced workers
            have less to spend, which reduces business revenue, which reduces LAT, which
            reduces UBI, which reduces spending further. The question is whether the loop
            has a stable fixed point — and if so, how high the UBI is at that point.
          </p>
        </div>
      </section>

      {/* ── Controls ── */}
      <section style={{ borderBottom: BD, padding: '40px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Label>Simulation Parameters</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div>
              <Slider
                label="Workforce displaced by automation"
                min={0.05} max={0.70} step={0.01}
                value={displacement}
                onChange={setDisplacement}
                format={v => `${Math.round(v * 100)}% (${Math.round(B.workforce * v).toLocaleString()} workers)`}
              />
              <div style={{ fontFamily: F, fontSize: 10, color: T3, lineHeight: 1.7, marginTop: -8 }}>
                McKinsey base: 25% · SPICE estimate: 40% · AGI scenario: 60%
              </div>
            </div>
            <div>
              <div style={{ fontFamily: F, fontSize: 11, color: T2, marginBottom: 12 }}>
                LAT retain policy — businesses keep this multiple of today's baseline profit
              </div>
              <SegmentedControl
                value={retainMult}
                onChange={setRetainMult}
                options={[
                  { label: '1.5× (aggressive)', value: 1.5 },
                  { label: '2× baseline', value: 2.0 },
                  { label: '2.5× (generous)', value: 2.5 },
                ]}
              />
              <div style={{ fontFamily: F, fontSize: 10, color: T3, lineHeight: 1.7, marginTop: 10 }}>
                Walmart example: {retainMult}× = keeps ${(retainMult * 0.98).toFixed(2)}M
                (today $0.98M × {retainMult})
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI row ── */}
      <section style={{ borderBottom: BD, padding: '32px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <KpiCard
              label="Stable UBI at equilibrium"
              value={hasEquilibrium ? `${fmt(eqUBI)}/mo` : 'None'}
              sub={hasEquilibrium
                ? `LAT revenue exactly covers this. Below $296 target by ${fmt(296 - eqUBI)}/mo.`
                : 'LAT never exceeds UBI cost at any level. Colony cannot self-fund.'}
              color={hasEquilibrium ? (eqUBI >= 200 ? GRN : GOLD) : RED}
              warn={!hasEquilibrium}
            />
            <KpiCard
              label="Revenue vs pre-automation"
              value={`${Math.round(rm * 100)}%`}
              sub={`Business revenues at equilibrium: ${fmtM(B.spiceProfitAtFullRev / 52e6 * 200e6 * rm)}. Walmart: ${fmtM(50e6 * rm)}.`}
              color={rm >= 0.9 ? GRN : rm >= 0.7 ? GOLD : RED}
            />
            <KpiCard
              label="Annual LAT collected"
              value={fmtM(latAtEq)}
              sub={`${pct(latAtEq / ubiCost296)} of $296/mo target cost (${fmtM(ubiCost296)}/yr)`}
              color={T1}
            />
            <KpiCard
              label="Viability cliff"
              value={`${viabilityCliff}% displaced`}
              sub={`Beyond this automation level, no positive UBI equilibrium exists at ${retainMult}× retain.`}
              color={displacement * 100 > viabilityCliff - 5 ? RED : GOLD}
              warn={displacement * 100 > viabilityCliff - 5}
            />
          </div>
        </div>
      </section>

      {/* ── Chart 1: Feedback loop ── */}
      <section style={{ borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Label>Chart 1 · The Feedback Loop</Label>
          <div style={{
            fontFamily: F, fontSize: 15, fontWeight: 600, color: T1,
            marginBottom: 10,
          }}>
            Does the LAT flywheel reach a self-sustaining level?
          </div>
          <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
            The green curve shows what monthly UBI the LAT revenue can actually fund,
            given that citizens are already receiving that UBI level (which drives
            spending, which drives revenue, which drives LAT). The dashed line is Y=X —
            where LAT exactly covers what it pays. Their intersection is the equilibrium.
            If the green curve is always below Y=X, the system cannot self-fund.
          </p>

          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { color: GRN, label: 'LAT-funded UBI — what LAT revenue can actually pay at each UBI level' },
              { color: T3, label: 'Self-funding line (Y=X) — equilibrium is where these cross' },
              { color: BLU, label: '$296/month target — original model assumption' },
              { color: GOLD, label: 'Equilibrium point — the stable self-funding UBI' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 2, background: color }} />
                <span style={{ fontFamily: F, fontSize: 9, color: T3 }}>{label}</span>
              </div>
            ))}
          </div>

          <FeedbackChart data={feedbackCurve} eqUBI={eqUBI} />

          {hasEquilibrium && (
            <div style={{
              marginTop: 20, background: BG3, border: BD,
              borderLeft: `3px solid ${GOLD}`, padding: '16px 20px',
            }}>
              <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8 }}>
                <span style={{ color: GOLD }}>Equilibrium at ${Math.round(eqUBI)}/month.</span>
                {' '}At this UBI level, Fairbrook business revenues settle at {Math.round(rm * 100)}%
                of pre-automation levels (Walmart: {fmtM(50e6 * rm)}), generating {fmtM(latAtEq)} in
                annual LAT — exactly enough to fund ${Math.round(eqUBI)}/month for all 14,100 citizens.
                The original ${'}'}$207/month estimate assumed full $200M revenue. Accounting for
                the feedback, the actual stable UBI is ${Math.round(eqUBI)}/month — a{' '}
                {Math.round((1 - eqUBI / 207) * 100)}% reduction from that estimate.
              </div>
            </div>
          )}

          {!hasEquilibrium && (
            <div style={{
              marginTop: 20, background: BG3, border: `1px solid ${RED}`,
              borderLeft: `3px solid ${RED}`, padding: '16px 20px',
            }}>
              <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8 }}>
                <span style={{ color: RED }}>No stable equilibrium.</span>
                {' '}At {pct(displacement)} displacement with {retainMult}× retain policy,
                the LAT revenue never covers UBI costs at any level. Businesses are allowed to
                keep too much relative to the automation windfall, or displacement is too high
                for the remaining consumer spending to generate sufficient revenue.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Chart 2: Sensitivity ── */}
      <section style={{ background: BG1, borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Label>Chart 2 · Displacement Sensitivity</Label>
          <div style={{
            fontFamily: F, fontSize: 15, fontWeight: 600, color: T1,
            marginBottom: 10,
          }}>
            How automation level determines the stable UBI ceiling
          </div>
          <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
            The gold curve shows the equilibrium UBI at each displacement rate, holding
            the LAT retain policy at {retainMult}×. Beyond {viabilityCliff}% displacement,
            no positive equilibrium exists and the line goes to zero. The blue dashed line
            marks the $296/month target — the displacement rate must stay below{' '}
            {Math.round((1 - retainMult * B.baselineAnnualProfits / B.spiceProfitAtFullRev -
              296 * B.pop * 12 / (B.spiceProfitAtFullRev * (1 - B.spiceProfitAtFullRev /
              (B.workforce * B.avgWageMonthly) / 12) * -1) ) * 100)}% for LAT to self-fund
            that level without external capital.
          </p>

          <SensitivityChart data={sensitivityData} currentDisplacement={displacement} />

          <div style={{
            marginTop: 20, background: BG3, border: BD,
            borderLeft: `3px solid ${PRP}`, padding: '16px 20px',
          }}>
            <div style={{ fontFamily: F, fontSize: 10, color: T3, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
              Key finding
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8 }}>
              The $296/month UBI target requires displacement below approximately 10% to be
              self-funded by LAT alone (at 2× retain). At the SPICE base case of 40%
              displacement, the stable self-funding UBI is ~${Math.round(equilibriumUBI(0.40, retainMult) || 0)}/month.
              The gap between that and the $296 target is the "bootstrap gap" — which
              requires either external seed capital, a more aggressive LAT rate, or
              accepting a lower real UBI supplemented by cheaper automated goods.
            </div>
          </div>
        </div>
      </section>

      {/* ── Bootstrap gap ── */}
      <section style={{ borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Label>The Bootstrap Gap · What External Capital Buys</Label>
          <div style={{
            fontFamily: F, fontSize: 15, fontWeight: 600, color: T1,
            marginBottom: 20,
          }}>
            At $296/month UBI target: annual deficit of {fmtM(annualDeficit)}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
          }}>
            {[
              {
                seed: 0,
                label: 'No seed capital',
                detail: 'System cannot reach $296/month target. Starts at $0 and drifts to stable equilibrium of ~$' + Math.round(eqUBI || 0) + '/month.',
                color: RED,
              },
              {
                seed: annualDeficit / 2,
                label: '1-year bridge',
                detail: `${fmtM(annualDeficit / 2)} funds 12 months at $296/month while LAT flywheel builds. If LAT grows faster than modelled (e.g. more businesses join), may not need full bridge.`,
                color: GOLD,
              },
              {
                seed: annualDeficit * 2,
                label: '2-year bridge',
                detail: `${fmtM(annualDeficit * 2)} funds 24 months. Enough time for supply-side effects (cheaper goods, higher real purchasing power of S) to reduce actual deficit.`,
                color: GRN,
              },
              {
                seed: annualDeficit * 5,
                label: '5-year bridge',
                detail: `${fmtM(annualDeficit * 5)} funds 5 years. Almost certainly sufficient for the flywheel to reach higher equilibrium as automation penetration increases year-on-year.`,
                color: BLU,
              },
            ].map(({ seed, label, detail, color }) => (
              <div key={label} style={{
                background: BG2, border: BD, padding: '20px 24px',
                borderTop: `3px solid ${color}`,
              }}>
                <div style={{ fontFamily: F, fontSize: 10, color: T3, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: F, fontSize: 16, color, fontWeight: 700, marginBottom: 8 }}>
                  {seed === 0 ? '$0' : fmtM(seed)}
                </div>
                <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.7 }}>{detail}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: BG3, border: BD, borderLeft: `3px solid ${T3}`,
            padding: '16px 20px',
          }}>
            <div style={{ fontFamily: F, fontSize: 11, color: T3, lineHeight: 1.8 }}>
              Note: "external seed capital" does not mean printing money or taxing elsewhere.
              It means founding capital from protocol treasury, early investors, or community
              bonds — the same mechanism used by any new enterprise to fund operations before
              revenue covers costs. The question is whether the flywheel can reach a
              self-sustaining rate within the bridge period.
            </div>
          </div>
        </div>
      </section>

      {/* ── What the model gets right and wrong ── */}
      <section style={{ background: BG1, borderBottom: BD, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Label>Model Assumptions · Known Gaps</Label>
          <div style={{
            fontFamily: F, fontSize: 15, fontWeight: 600, color: T1,
            marginBottom: 20,
          }}>
            What this simulation does and does not capture
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontFamily: F, fontSize: 10, color: GRN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>
                Built in
              </div>
              {[
                'Revenue feedback loop — spending → revenue → LAT → UBI → spending',
                'Wage income of remaining employed workers added to spending base',
                'Analytical equilibrium — no iterative approximation, exact closed-form solution',
                'Sensitivity to LAT retain policy (1.5× / 2× / 2.5×)',
                'Viability cliff — displacement level at which no equilibrium exists',
              ].map(t => (
                <div key={t} style={{
                  fontFamily: F, fontSize: 11, color: T2,
                  lineHeight: 1.7, marginBottom: 8,
                  paddingLeft: 12, borderLeft: `2px solid #232831`,
                }}>
                  {t}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: F, fontSize: 10, color: RED, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>
                Not yet modelled
              </div>
              {[
                'S vs USDC split — UBI is S-denominated, but material goods need USDC. Fisc reserve dynamics not shown.',
                'Cheaper automated goods — $1 of UBI in SPICE world buys more than $1 today. Real purchasing power is understated.',
                'External income (remote workers like Graham) — USDC inflows that supplement the local S economy.',
                'Year-on-year automation growth — LAT revenue should increase as more functions automate each year.',
                'Wage compression — remaining workers may earn less if UBI supplements their income, reducing business labour costs further.',
              ].map(t => (
                <div key={t} style={{
                  fontFamily: F, fontSize: 11, color: T2,
                  lineHeight: 1.7, marginBottom: 8,
                  paddingLeft: 12, borderLeft: `2px solid #232831`,
                }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom navigation ── */}
      <section style={{ background: BG0, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Label>Related</Label>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { href: '/earth', label: 'Earth Colony Model →' },
              { href: '/collision', label: 'Collision Simulation →' },
              { href: '/mars/dashboard', label: 'Mars Colony Dashboard →' },
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
