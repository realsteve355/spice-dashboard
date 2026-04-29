/**
 * ColonyEconomy — interactive 24-month sim of an Earth colony's money flows.
 *
 * Same monthly loop as docs/economy-model/model.py, ported to JS so the user
 * can drag sliders and watch the peg hold or break in real time.
 *
 * Inputs (sliders):
 *   - Exporters (count)
 *   - USD per exporter per month
 *   - LAT participation (%)
 *   - Citizen cashout rate (%)
 *   - UBI per citizen per month ($)
 *   - Initial USDC reserve ($)
 *
 * Outputs (4 recharts panels):
 *   - USDC reserve over time
 *   - Fisc rate ($/S) — the peg
 *   - Reserve cover ratio
 *   - S token supply
 *
 * Plus KPI chips: end-state values + peg-break month.
 */
import { useState, useMemo, startTransition } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ── Design tokens (match /collision dark theme) ──────────────────────────────
const F    = "'IBM Plex Mono', monospace"
const BG0  = "#0a0e1a"
const BG1  = "#080c16"
const BG2  = "#0f1520"
const BD   = "1px solid #1e2a42"
const T1   = "#e8eaf0"
const T2   = "#8899bb"
const T3   = "#4a5878"
const GOLD = "#c8a96e"
const RED  = "#ef4444"
const GRN  = "#3dffa0"
const BLU  = "#60a5fa"
const PRP  = "#a78bfa"

const CH = 180  // chart height — explicit pixels per recharts rule

// ── Default scenario parameters ──────────────────────────────────────────────
const DEFAULTS = {
  nCitizens:              1000,
  nMidCompanies:          15,
  nSmallCompanies:        30,
  ubiClaimRate:           0.95,
  citizenSpendRate:       0.85,
  citizenSaveRate:        0.05,
  citizenCashoutSize:     0.30,
  spendLargeCo:           0.25,
  spendMidCo:             0.35,
  spendSmallCo:           0.30,
  spendP2P:               0.10,
  companyWagePct:         0.50,
  companyMccBillPct:      0.05,
  companyVSavePct:        0.10,
  companyDividendPct:     0.05,
  latRateOnRevenue:       0.05,
  reserveTargetRatio:     0.30,
  reserveFloorRatio:      0.10,
  mccConsumesPct:         0.80,
  targetFiscRate:         1.00,
  months:                 24,
}

const PRESETS = {
  healthy: {
    nLargeCompanies: 5,  exportUsdPerLargeCo: 8000, latParticipation: 0.80,
    citizenCashoutRate: 0.01, ubiPerMonth: 100, initialUsdcReserve: 50000,
  },
  balanced: {
    nLargeCompanies: 5,  exportUsdPerLargeCo: 5000, latParticipation: 0.60,
    citizenCashoutRate: 0.02, ubiPerMonth: 100, initialUsdcReserve: 50000,
  },
  importer: {
    nLargeCompanies: 1,  exportUsdPerLargeCo: 1500, latParticipation: 0.20,
    citizenCashoutRate: 0.05, ubiPerMonth: 100, initialUsdcReserve: 30000,
  },
}

// ── Simulation engine ────────────────────────────────────────────────────────

function updateFiscRate(state, p) {
  const r = state.usdcReserve / Math.max(state.vSupply, 1e-9)
  if (state.vSupply === 0) return p.targetFiscRate
  if (r >= p.reserveTargetRatio) return p.targetFiscRate
  if (r <= 0) return 0.01
  return Math.max(0.01, p.targetFiscRate * (r / p.reserveTargetRatio))
}

function step(prev, p) {
  const s = { ...prev, month: prev.month + 1 }
  const f = { month: s.month }

  // 1. UBI mint
  f.ubi = p.nCitizens * p.ubiPerMonth * p.ubiClaimRate
  s.sCitizens += f.ubi

  // 2. Citizens spend
  const spend = s.sCitizens * p.citizenSpendRate
  s.sCitizens -= spend
  s.sLargeCo += spend * p.spendLargeCo
  s.sMidCo   += spend * p.spendMidCo
  s.sSmallCo += spend * p.spendSmallCo
  s.sCitizens += spend * p.spendP2P
  f.spend = spend

  // 3. Wages
  const wages = (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyWagePct
  s.sLargeCo *= (1 - p.companyWagePct)
  s.sMidCo   *= (1 - p.companyWagePct)
  s.sSmallCo *= (1 - p.companyWagePct)
  s.sCitizens += wages
  f.wages = wages

  // 4. MCC bills
  const bills = (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyMccBillPct
  s.sLargeCo *= (1 - p.companyMccBillPct)
  s.sMidCo   *= (1 - p.companyMccBillPct)
  s.sSmallCo *= (1 - p.companyMccBillPct)
  s.sMcc += bills
  f.bills = bills

  // 5. Companies S → V
  const coSave = (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyVSavePct
  s.sLargeCo *= (1 - p.companyVSavePct)
  s.sMidCo   *= (1 - p.companyVSavePct)
  s.sSmallCo *= (1 - p.companyVSavePct)
  s.vCompanies += coSave

  // 6. Citizens S → V
  const citSave = s.sCitizens * p.citizenSaveRate
  s.sCitizens -= citSave
  s.vCitizens += citSave

  // 7. Citizen cashouts
  const cashoutV   = s.vCitizens * p.citizenCashoutRate * p.citizenCashoutSize
  const cashoutUsd = cashoutV * s.fiscRate
  s.vCitizens -= cashoutV
  const actualPaid = Math.min(cashoutUsd, s.usdcReserve)
  s.usdcReserve -= actualPaid
  f.cashoutUsd = actualPaid

  // 8. Exports
  const exportUsd = p.nLargeCompanies * p.exportUsdPerLargeCo
  s.usdcReserve += exportUsd
  if (s.fiscRate > 0) s.sLargeCo += exportUsd / s.fiscRate
  f.exportUsd = exportUsd

  // 9. LAT
  const latUsd = exportUsd * p.latParticipation * p.latRateOnRevenue
  s.usdcReserve += latUsd
  f.latUsd = latUsd

  // 10. Dividends
  const divs = s.vCompanies * p.companyDividendPct
  s.vCompanies -= divs
  s.vCitizens  += divs

  // 11. MCC consumption
  s.sMcc *= (1 - p.mccConsumesPct)

  // 12. Update Fisc rate
  s.vSupply = s.vCitizens + s.vCompanies
  s.sSupply = s.sCitizens + s.sLargeCo + s.sMidCo + s.sSmallCo + s.sMcc
  s.fiscRate = updateFiscRate(s, p)

  return { state: s, flow: f }
}

function runSim(p) {
  const initial = {
    month: 0,
    sCitizens: 0, sLargeCo: 0, sMidCo: 0, sSmallCo: 0, sMcc: 0,
    vCitizens: 0, vCompanies: 0,
    sSupply: 0, vSupply: 0,
    usdcReserve: p.initialUsdcReserve,
    fiscRate: p.targetFiscRate,
  }
  const states = [initial]
  let totalExportUsd = 0, totalCashoutUsd = 0, totalLatUsd = 0
  let pegBreakMonth = null, floorBreachMonth = null

  for (let m = 0; m < p.months; m++) {
    const { state, flow } = step(states[states.length - 1], p)
    totalExportUsd  += flow.exportUsd
    totalCashoutUsd += flow.cashoutUsd
    totalLatUsd     += flow.latUsd
    if (pegBreakMonth === null && state.fiscRate < p.targetFiscRate * 0.99) {
      pegBreakMonth = state.month
    }
    if (floorBreachMonth === null && state.vSupply > 0 &&
        (state.usdcReserve / state.vSupply) < p.reserveFloorRatio) {
      floorBreachMonth = state.month
    }
    states.push(state)
  }

  const rows = states.map(s => ({
    month:        s.month,
    sSupply:      Math.round(s.sSupply),
    vSupply:      Math.round(s.vSupply),
    usdcReserve:  Math.round(s.usdcReserve),
    fiscRate:     +s.fiscRate.toFixed(4),
    coverRatio:   s.vSupply > 0 ? +(s.usdcReserve / s.vSupply).toFixed(4) : null,
  }))
  const end = rows[rows.length - 1]
  const summary = {
    endReserve:      end.usdcReserve,
    endRate:         end.fiscRate,
    endCover:        end.coverRatio,
    endSSupply:      end.sSupply,
    pegBreakMonth,
    floorBreachMonth,
    totalExportUsd:  Math.round(totalExportUsd),
    totalCashoutUsd: Math.round(totalCashoutUsd),
    totalLatUsd:     Math.round(totalLatUsd),
    netUsdInflow:    Math.round(totalExportUsd + totalLatUsd - totalCashoutUsd),
  }
  return { rows, summary }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ColonyEconomy() {
  // 6 sliders default to "balanced" preset
  const [nLargeCompanies,      setNLarge]    = useState(PRESETS.balanced.nLargeCompanies)
  const [exportUsdPerLargeCo,  setExportUsd] = useState(PRESETS.balanced.exportUsdPerLargeCo)
  const [latParticipation,     setLat]       = useState(PRESETS.balanced.latParticipation)
  const [citizenCashoutRate,   setCashout]   = useState(PRESETS.balanced.citizenCashoutRate)
  const [ubiPerMonth,          setUbi]       = useState(PRESETS.balanced.ubiPerMonth)
  const [initialUsdcReserve,   setReserve]   = useState(PRESETS.balanced.initialUsdcReserve)

  const params = {
    ...DEFAULTS,
    nLargeCompanies, exportUsdPerLargeCo, latParticipation,
    citizenCashoutRate, ubiPerMonth, initialUsdcReserve,
  }
  const { rows, summary } = useMemo(() => runSim(params), [
    nLargeCompanies, exportUsdPerLargeCo, latParticipation,
    citizenCashoutRate, ubiPerMonth, initialUsdcReserve,
  ])

  function applyPreset(name) {
    const p = PRESETS[name]
    startTransition(() => {
      setNLarge(p.nLargeCompanies)
      setExportUsd(p.exportUsdPerLargeCo)
      setLat(p.latParticipation)
      setCashout(p.citizenCashoutRate)
      setUbi(p.ubiPerMonth)
      setReserve(p.initialUsdcReserve)
    })
  }

  const pegBroken = summary.pegBreakMonth !== null

  return (
    <div style={{ minHeight: '100vh', background: BG0, color: T1, fontFamily: F, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ borderBottom: BD, padding: '20px 24px', background: BG1 }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: '0.3em', marginBottom: 8 }}>
          SPICE COLONY ECONOMY · INTERACTIVE MODEL
        </div>
        <div style={{ fontSize: 13, color: T2, lineHeight: 1.6, maxWidth: 720 }}>
          24-month deterministic simulation of an Earth-colony's money flows.
          Drag the sliders on the left to change the colony's external trade
          position and watch the peg hold or break.
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', gap: 0 }}>

        {/* LEFT — controls */}
        <div style={{ width: 300, flexShrink: 0, padding: 18, borderRight: BD, background: BG1 }}>

          {/* Presets */}
          <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 8 }}>PRESETS</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            <PresetBtn label="Healthy"  onClick={() => applyPreset('healthy')}  color={GRN} />
            <PresetBtn label="Balanced" onClick={() => applyPreset('balanced')} color={BLU} />
            <PresetBtn label="Importer" onClick={() => applyPreset('importer')} color={RED} />
          </div>

          <div style={{ borderTop: BD, marginBottom: 12 }} />

          <Slider
            label="Exporters"
            sub="Companies earning USD outside the colony"
            value={nLargeCompanies}
            min={0} max={15} step={1}
            display={`${nLargeCompanies}`}
            onChange={v => startTransition(() => setNLarge(v))}
          />
          <Slider
            label="USD per exporter / month"
            sub="Average external revenue"
            value={exportUsdPerLargeCo}
            min={0} max={15000} step={100}
            display={`$${exportUsdPerLargeCo.toLocaleString()}`}
            onChange={v => startTransition(() => setExportUsd(v))}
          />
          <Slider
            label="LAT participation"
            sub="Voluntary tax on USD revenue → reserve"
            value={latParticipation}
            min={0} max={1} step={0.05}
            display={`${Math.round(latParticipation * 100)}%`}
            onChange={v => startTransition(() => setLat(v))}
          />
          <Slider
            label="Citizen cashout rate"
            sub="Fraction of citizens cashing V → $ each month"
            value={citizenCashoutRate}
            min={0} max={0.10} step={0.005}
            display={`${(citizenCashoutRate * 100).toFixed(1)}%`}
            onChange={v => startTransition(() => setCashout(v))}
          />
          <Slider
            label="UBI per citizen / month"
            sub="S minted to each citizen monthly"
            value={ubiPerMonth}
            min={50} max={300} step={5}
            display={`${ubiPerMonth} S`}
            onChange={v => startTransition(() => setUbi(v))}
          />
          <Slider
            label="Initial USDC reserve"
            sub="Seed capital at colony launch"
            value={initialUsdcReserve}
            min={0} max={200000} step={1000}
            display={`$${initialUsdcReserve.toLocaleString()}`}
            onChange={v => startTransition(() => setReserve(v))}
          />

          <div style={{ borderTop: BD, marginTop: 16, paddingTop: 12 }}>
            <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 8 }}>FIXED</div>
            <FixedRow k="Citizens"      v="1,000" />
            <FixedRow k="Mid companies" v="15" />
            <FixedRow k="Small companies" v="30" />
            <FixedRow k="Citizen save rate" v="5% / mo" />
            <FixedRow k="Reserve target" v="30%" />
            <FixedRow k="Reserve floor"  v="10%" />
          </div>
        </div>

        {/* RIGHT — charts + KPIs */}
        <div style={{ flex: 1, padding: 18 }}>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 18 }}>
            <Kpi label="End reserve"    value={`$${summary.endReserve.toLocaleString()}`} colour={summary.endReserve > 50000 ? GRN : RED} />
            <Kpi label="End rate ($/S)" value={summary.endRate.toFixed(2)}                 colour={summary.endRate >= 0.99 ? GRN : RED} />
            <Kpi label="Cover ratio"     value={summary.endCover != null ? (summary.endCover * 100).toFixed(0) + '%' : '—'}  colour={summary.endCover >= 0.30 ? GRN : summary.endCover >= 0.10 ? GOLD : RED} />
            <Kpi label="Peg breaks"      value={pegBroken ? `month ${summary.pegBreakMonth}` : 'never'}               colour={pegBroken ? RED : GRN} />
            <Kpi label="Net $ inflow"    value={`$${summary.netUsdInflow.toLocaleString()}`} colour={summary.netUsdInflow > 0 ? GRN : RED} />
          </div>

          {/* Charts — 2x2 grid, explicit heights per recharts rule */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

            <ChartPanel title="USDC RESERVE — what's in the Fisc vault">
              <ResponsiveContainer width="100%" height={CH}>
                <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                  <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                    tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tipStyle} formatter={v => `$${Math.round(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="usdcReserve" stroke={GRN} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="FISC RATE — dollars per S token (peg = $1)">
              <ResponsiveContainer width="100%" height={CH}>
                <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                  <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                    domain={[0, 1.2]} ticks={[0, 0.25, 0.5, 0.75, 1.0]} />
                  <ReferenceLine y={1.0} stroke={T3} strokeDasharray="3 3" />
                  <Tooltip contentStyle={tipStyle} formatter={v => `$${Number(v).toFixed(3)}`} />
                  <Line type="monotone" dataKey="fiscRate" stroke={GOLD} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="RESERVE COVER — vault $ ÷ V deposits">
              <ResponsiveContainer width="100%" height={CH}>
                <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                  <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                    domain={[0, 1.0]} ticks={[0, 0.25, 0.5, 0.75]}
                    tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                  <ReferenceLine y={0.30} stroke={BLU} strokeDasharray="3 3" label={{ value: 'target', fill: BLU, fontSize: 9, position: 'right' }} />
                  <ReferenceLine y={0.10} stroke={RED} strokeDasharray="3 3" label={{ value: 'floor', fill: RED, fontSize: 9, position: 'right' }} />
                  <Tooltip contentStyle={tipStyle} formatter={v => `${(Number(v)*100).toFixed(1)}%`} />
                  <Line type="monotone" dataKey="coverRatio" stroke={PRP} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="S SUPPLY — total S tokens in circulation">
              <ResponsiveContainer width="100%" height={CH}>
                <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                  <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tipStyle} formatter={v => Math.round(v).toLocaleString()} />
                  <Line type="monotone" dataKey="sSupply" stroke={BLU} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

          </div>

          {/* Read-out */}
          <div style={{ marginTop: 18, padding: 14, background: BG2, border: BD, fontSize: 12, color: T2, lineHeight: 1.7 }}>
            {pegBroken ? (
              <>
                <strong style={{ color: RED }}>Peg breaking at month {summary.pegBreakMonth}.</strong>{' '}
                Reserve cover fell below 30% — the Fisc no longer has enough USDC to honour all V deposits.
                The exchange rate compresses each month from there. By month 24 it's at <strong style={{ color: T1 }}>${summary.endRate.toFixed(2)}/S</strong>.
                Citizens holding V take a real loss measured in dollars.
              </>
            ) : summary.endCover < 0.40 ? (
              <>
                <strong style={{ color: GOLD }}>Peg holds, but cover is thin.</strong>{' '}
                Reserve ends at {(summary.endCover * 100).toFixed(0)}% — above the 30% target but
                with little margin for shock. A cashout wave or export collapse would tip it over.
              </>
            ) : (
              <>
                <strong style={{ color: GRN }}>Peg holds comfortably.</strong>{' '}
                Net inflow of ${summary.netUsdInflow.toLocaleString()} over 24 months. End cover {(summary.endCover * 100).toFixed(0)}% — well above the 30% target.
                The colony's exports comfortably outpace its cashout liability.
              </>
            )}
          </div>

          {/* Methodology */}
          <details style={{ marginTop: 14, fontSize: 11, color: T3 }}>
            <summary style={{ cursor: 'pointer', color: T2 }}>Method · monthly loop</summary>
            <ol style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li>UBI mint — MCC issues new S to citizens (95% claim rate)</li>
              <li>Citizens spend 85% of held S — split across companies + P2P</li>
              <li>Companies pay wages — 50% of revenue back to citizens</li>
              <li>Companies pay MCC bills — 5% of revenue</li>
              <li>S → V conversions — 10% of company revenue, 5% of citizen S</li>
              <li>Citizen cashouts — V → USDC at current Fisc rate</li>
              <li>Exports — USD deposited at Fisc, S minted at current rate</li>
              <li>LAT — voluntary tax on USD revenue → reserve top-up</li>
              <li>Dividends — V from companies to citizen shareholders</li>
              <li>MCC consumes — 80% of collected S spent on services</li>
              <li>Fisc rate adjusts — compresses linearly when cover &lt; 30%</li>
            </ol>
            <div style={{ color: T3, marginTop: 6, fontSize: 10 }}>
              Reference implementation in Python at <code>docs/economy-model/model.py</code>.
              Spec write-up in <code>docs/SPICE-Economy.md</code> Part 4.
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Slider({ label, sub, value, min, max, step, display, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 11, color: T1, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, fontFamily: F }}>{display}</div>
      </div>
      <div style={{ fontSize: 9, color: T3, marginBottom: 6, lineHeight: 1.4 }}>{sub}</div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: GOLD, cursor: 'pointer' }} />
    </div>
  )
}

function PresetBtn({ label, onClick, color }) {
  return (
    <button onClick={onClick}
      style={{
        flex: 1, padding: '6px 4px', fontSize: 10, fontFamily: F,
        background: 'transparent', border: `1px solid ${color}`, color,
        cursor: 'pointer', borderRadius: 4, letterSpacing: '0.08em',
      }}>
      {label.toUpperCase()}
    </button>
  )
}

function FixedRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T2, marginBottom: 4 }}>
      <span>{k}</span><span style={{ color: T1 }}>{v}</span>
    </div>
  )
}

function Kpi({ label, value, colour }) {
  return (
    <div style={{ background: BG2, border: BD, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 14, color: colour, fontWeight: 700, fontFamily: F }}>{value}</div>
    </div>
  )
}

function ChartPanel({ title, children }) {
  return (
    <div style={{ background: BG2, border: BD, padding: 12 }}>
      <div style={{ fontSize: 10, color: T3, letterSpacing: '0.15em', marginBottom: 8 }}>{title}</div>
      <div style={{ height: CH }}>{children}</div>
    </div>
  )
}

const tipStyle = {
  background: BG1, border: '1px solid #2a3a5c',
  fontFamily: F, fontSize: 11, color: T1,
}
