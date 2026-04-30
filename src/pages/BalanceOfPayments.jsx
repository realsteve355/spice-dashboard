/**
 * BalanceOfPayments — single-colony 24-month sim focused on trade balance.
 *
 * The earlier twinning page treats two colonies as a unit. This page asks
 * the harder question: can a single colony, on its own, run SPICE without
 * the protection of a partner? Drag the sliders and watch the peg break or
 * hold based purely on the colony's own export/import balance and citizen
 * cashout pressure.
 *
 * Basket-anchored: the Fisc keeps a fixed basket of goods costing 28 S.
 * USD inflation drives the target rate up; reserve adequacy determines
 * whether the actual rate can keep up. Peg "breaks" = actual rate drifts
 * below target = basket cost in S rises above 28 = real-terms loss.
 */
import { useState, useMemo, startTransition } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'

const F    = "'IBM Plex Mono', monospace"
const BG0  = "#06070a"
const BG1  = "#0d0f12"
const BG2  = "#11141a"
const BD   = "1px solid #232831"
const T1   = "#ede5d4"
const T2   = "#b8b0a0"
const T3   = "#8a8170"
const GOLD = "#c8a96e"
const RED  = "#ef4444"
const GRN  = "#3dffa0"
const BLU  = "#60a5fa"
const PRP  = "#a78bfa"
const CH   = 200

const TARGET_BASKET_S    = 28
const INITIAL_BASKET_USD = 28

const DEFAULTS = {
  citizenSpendRate:    0.85,
  citizenSaveRate:     0.05,
  citizenCashoutSize:  0.30,
  companyWagePct:      0.50,
  companyMccBillPct:   0.05,
  companyVSavePct:     0.10,
  companyDividendPct:  0.05,
  reserveTargetRatio:  0.30,
  reserveFloorRatio:   0.10,
  mccConsumesPct:      0.80,
  ubiClaimRate:        0.95,
  spendLargeCo:        0.25,
  spendMidCo:          0.35,
  spendSmallCo:        0.30,
  spendP2P:            0.10,
  latRateOnRevenue:    0.05,
  months:              24,
}

const PRESETS = {
  marysville: {
    label: 'Marysville, OH (Honda assembly)',
    citizens: 25_000, exports: 40_000_000, imports: 25_000_000,
    lat: 0, cashout: 0, ubi: 100, reserve: 30_000_000, usdInflation: 0.05,
  },
  bellefontaine: {
    label: 'Bellefontaine, OH (residential)',
    citizens: 14_000, exports: 5_000_000, imports: 18_000_000,
    lat: 0, cashout: 0, ubi: 100, reserve: 20_000_000, usdInflation: 0.05,
  },
  midland: {
    label: 'Midland, MI (Dow Chemical)',
    citizens: 42_000, exports: 60_000_000, imports: 30_000_000,
    lat: 0, cashout: 0, ubi: 100, reserve: 50_000_000, usdInflation: 0.05,
  },
  saginaw: {
    label: 'Saginaw, MI (post-GM)',
    citizens: 44_000, exports: 12_000_000, imports: 32_000_000,
    lat: 0, cashout: 0, ubi: 100, reserve: 40_000_000, usdInflation: 0.05,
  },
  bloomington: {
    label: 'Bloomington, IN (university)',
    citizens: 85_000, exports: 80_000_000, imports: 50_000_000,
    lat: 0, cashout: 0, ubi: 100, reserve: 60_000_000, usdInflation: 0.05,
  },
  terre_haute: {
    label: 'Terre Haute, IN (faded mfg)',
    citizens: 60_000, exports: 25_000_000, imports: 55_000_000,
    lat: 0, cashout: 0, ubi: 100, reserve: 40_000_000, usdInflation: 0.05,
  },
}

function basketCostUsd(monthIdx, usdInflationAnnual) {
  const monthly = Math.pow(1 + usdInflationAnnual, 1/12) - 1
  return INITIAL_BASKET_USD * Math.pow(1 + monthly, monthIdx)
}
const targetRateAt = (m, infl) => basketCostUsd(m, infl) / TARGET_BASKET_S
function actualRate(targetRate, vSupply, reserve, p) {
  if (vSupply <= 0) return targetRate
  const cover = reserve / (vSupply * targetRate)
  if (cover >= p.reserveTargetRatio) return targetRate
  if (cover <= 0) return targetRate * 0.01
  return Math.max(targetRate * 0.01, targetRate * (cover / p.reserveTargetRatio))
}

function runSim(p) {
  let state = {
    sCitizens: 0, sLargeCo: 0, sMidCo: 0, sSmallCo: 0, sMcc: 0,
    vCitizens: 0, vCompanies: 0,
  }
  let reserve = p.reserve
  let rate    = targetRateAt(0, p.usdInflation)
  let target  = rate

  const rows = [{
    month: 0, reserve, rate, target,
    basketUsd: INITIAL_BASKET_USD, basketInS: TARGET_BASKET_S,
    sSupply: 0, vSupply: 0, tradeBalance: 0,
  }]
  let totals = { exports: 0, imports: 0, cashouts: 0, lat: 0, shortfall: 0 }
  let pegBreakMonth = null

  for (let m = 1; m <= p.months; m++) {
    target = targetRateAt(m, p.usdInflation)
    const s = { ...state }

    // 1. UBI mint
    s.sCitizens += p.citizens * p.ubi * p.ubiClaimRate

    // 2. Citizen spend
    const spend = s.sCitizens * p.citizenSpendRate
    s.sCitizens -= spend
    s.sLargeCo += spend * p.spendLargeCo
    s.sMidCo   += spend * p.spendMidCo
    s.sSmallCo += spend * p.spendSmallCo
    s.sCitizens += spend * p.spendP2P

    // 3. Wages
    const wages = (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyWagePct
    s.sLargeCo *= (1 - p.companyWagePct)
    s.sMidCo   *= (1 - p.companyWagePct)
    s.sSmallCo *= (1 - p.companyWagePct)
    s.sCitizens += wages

    // 4. MCC bills
    const bills = (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyMccBillPct
    s.sLargeCo *= (1 - p.companyMccBillPct)
    s.sMidCo   *= (1 - p.companyMccBillPct)
    s.sSmallCo *= (1 - p.companyMccBillPct)
    s.sMcc += bills

    // 5. S → V
    const coSave = (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyVSavePct
    s.sLargeCo *= (1 - p.companyVSavePct)
    s.sMidCo   *= (1 - p.companyVSavePct)
    s.sSmallCo *= (1 - p.companyVSavePct)
    s.vCompanies += coSave
    const citSave = s.sCitizens * p.citizenSaveRate
    s.sCitizens -= citSave
    s.vCitizens += citSave

    // 6. Dividends + MCC consumption
    const divs = s.vCompanies * p.companyDividendPct
    s.vCompanies -= divs
    s.vCitizens  += divs
    s.sMcc *= (1 - p.mccConsumesPct)

    // 7. USD flows: exports + LAT + cashouts + imports
    const exportUsd = p.exports
    const latUsd    = exportUsd * p.lat * p.latRateOnRevenue
    const cashoutVintent   = s.vCitizens * p.cashout * p.citizenCashoutSize
    const cashoutUsdIntent = cashoutVintent * rate
    const importUsdIntent  = p.imports

    const inflow = exportUsd + latUsd
    const outflowWanted = cashoutUsdIntent + importUsdIntent
    let scale = 1
    const newReserve = reserve + inflow
    if (outflowWanted > newReserve) scale = newReserve / Math.max(outflowWanted, 1e-9)
    const cashoutUsd = cashoutUsdIntent * scale
    const importUsd  = importUsdIntent  * scale
    reserve = Math.max(0, newReserve - cashoutUsd - importUsd)

    // Mint S for exporters, burn V for cashouts, burn S for imports
    if (rate > 0) s.sLargeCo += exportUsd / rate
    s.vCitizens = Math.max(0, s.vCitizens - cashoutVintent * scale)
    if (rate > 0 && importUsd > 0) {
      const sBurn    = importUsd / rate
      const totalCoS = s.sLargeCo + s.sMidCo + s.sSmallCo
      if (totalCoS > 0) {
        const f = Math.min(1, sBurn / totalCoS)
        s.sLargeCo *= (1 - f); s.sMidCo *= (1 - f); s.sSmallCo *= (1 - f)
      }
    }

    state = s
    const vSupply = s.vCitizens + s.vCompanies
    const sSupply = s.sCitizens + s.sLargeCo + s.sMidCo + s.sSmallCo + s.sMcc
    rate = actualRate(target, vSupply, reserve, p)
    if (pegBreakMonth === null && rate < target * 0.99) pegBreakMonth = m

    totals.exports   += exportUsd
    totals.imports   += importUsd
    totals.cashouts  += cashoutUsd
    totals.lat       += latUsd
    totals.shortfall += (outflowWanted - cashoutUsd - importUsd)

    const basketUsd = basketCostUsd(m, p.usdInflation)
    rows.push({
      month: m,
      reserve: Math.round(reserve),
      rate: +rate.toFixed(4), target: +target.toFixed(4),
      basketUsd: +basketUsd.toFixed(2),
      basketInS: +(basketUsd / rate).toFixed(2),
      sSupply: Math.round(sSupply), vSupply: Math.round(vSupply),
      tradeBalance: Math.round(totals.exports - totals.imports),
    })
  }

  const end = rows[rows.length - 1]
  return {
    rows,
    summary: {
      endReserve: end.reserve,
      endRate: end.rate, endTarget: end.target,
      endBasketInS: end.basketInS,
      pegBreakMonth,
      totalExports: Math.round(totals.exports),
      totalImports: Math.round(totals.imports),
      totalCashouts: Math.round(totals.cashouts),
      totalLat: Math.round(totals.lat),
      tradeBalance: Math.round(totals.exports - totals.imports),
    },
  }
}

export default function BalanceOfPayments() {
  const [citizens,    setCitizens]    = useState(PRESETS.marysville.citizens)
  const [exports_,    setExports]     = useState(PRESETS.marysville.exports)
  const [imports_,    setImports]     = useState(PRESETS.marysville.imports)
  const [lat,         setLat]         = useState(0)
  const [cashout,     setCashout]     = useState(0)
  const [ubi,         setUbi]         = useState(100)
  const [reserve_,    setReserve]     = useState(PRESETS.marysville.reserve)
  const [usdInflation,setUsdInflation]= useState(0.05)

  const params = {
    ...DEFAULTS,
    citizens, exports: exports_, imports: imports_, lat, cashout,
    ubi, reserve: reserve_, usdInflation,
  }
  const { rows, summary } = useMemo(() => runSim(params), [
    citizens, exports_, imports_, lat, cashout, ubi, reserve_, usdInflation,
  ])

  function applyPreset(k) {
    const p = PRESETS[k]
    startTransition(() => {
      setCitizens(p.citizens); setExports(p.exports); setImports(p.imports)
      setLat(p.lat); setCashout(p.cashout); setUbi(p.ubi)
      setReserve(p.reserve); setUsdInflation(p.usdInflation)
    })
  }

  const pegBroken = summary.pegBreakMonth !== null
  const trade = exports_ - imports_

  return (
    <div style={{ minHeight: '100vh', background: BG0, color: T1, fontFamily: F, paddingBottom: 40 }}>
      <div style={{ borderBottom: BD, padding: '20px 24px', background: BG1 }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: '0.3em', marginBottom: 8 }}>
          SPICE COLONY · BALANCE OF PAYMENTS
        </div>
        <div style={{ fontSize: 13, color: T2, lineHeight: 1.6, maxWidth: 880 }}>
          Single-colony 24-month sim. The hard question: can this colony, on
          its own, run SPICE without a twin partner? Drag the sliders to model
          a real US municipality and watch the peg hold or break based on its
          export/import balance, citizen cashout pressure, and the surrounding
          USD volatility.
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 6 }}>PRESETS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(PRESETS).map(([k, p]) => (
              <button key={k} onClick={() => applyPreset(k)} style={presetBtn}>{p.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>

          {/* Sliders */}
          <div style={{ background: BG2, border: BD, padding: 14 }}>
            <div style={{ fontSize: 10, color: trade >= 0 ? GRN : RED, marginBottom: 12 }}>
              {citizens.toLocaleString()} citizens · monthly trade ${(trade/1_000_000).toFixed(1)}M
              ({trade >= 0 ? 'net exporter' : 'net importer'})
            </div>
            <Slider label="Citizens" value={citizens}
              min={500} max={200_000} step={500} display={citizens.toLocaleString()}
              onChange={v => startTransition(() => setCitizens(v))} />
            <Slider label="Monthly exports (USD)" value={exports_}
              min={0} max={100_000_000} step={500_000}
              display={`$${(exports_/1_000_000).toFixed(1)}M`}
              onChange={v => startTransition(() => setExports(v))} />
            <Slider label="Monthly imports (USD)" value={imports_}
              min={0} max={100_000_000} step={500_000}
              display={`$${(imports_/1_000_000).toFixed(1)}M`}
              onChange={v => startTransition(() => setImports(v))} />
            <Slider label="LAT participation" value={lat}
              min={0} max={1} step={0.05} display={`${Math.round(lat*100)}%`}
              onChange={v => startTransition(() => setLat(v))} />
            <Slider label="Citizen cashout / month" value={cashout}
              min={0} max={0.10} step={0.005} display={`${(cashout*100).toFixed(1)}%`}
              onChange={v => startTransition(() => setCashout(v))} />
            <Slider label="UBI per citizen / month" value={ubi}
              min={0} max={1000} step={10} display={`${ubi} S`}
              onChange={v => startTransition(() => setUbi(v))} />
            <Slider label="Initial USDC reserve" value={reserve_}
              min={1_000_000} max={500_000_000} step={1_000_000}
              display={`$${(reserve_/1_000_000).toFixed(0)}M`}
              onChange={v => startTransition(() => setReserve(v))} />
            <Slider label="USD inflation / yr" value={usdInflation}
              min={-0.10} max={0.50} step={0.01}
              display={`${(usdInflation*100).toFixed(0)}%`}
              onChange={v => startTransition(() => setUsdInflation(v))} />
          </div>

          {/* Charts */}
          <div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 14 }}>
              <Kpi label="End basket cost"
                   value={`${summary.endBasketInS.toFixed(1)} S`}
                   sub={`target ${TARGET_BASKET_S} S`}
                   colour={summary.endBasketInS <= TARGET_BASKET_S * 1.02 ? GRN
                         : summary.endBasketInS <= TARGET_BASKET_S * 1.10 ? GOLD : RED} />
              <Kpi label="End rate ($/S)" value={summary.endRate.toFixed(2)}
                   sub={`target $${summary.endTarget.toFixed(2)}`}
                   colour={summary.endRate >= summary.endTarget * 0.99 ? GRN : RED} />
              <Kpi label="End reserve" value={`$${(summary.endReserve/1_000_000).toFixed(1)}M`}
                   colour={summary.endReserve > 0 ? GRN : RED} />
              <Kpi label="Peg breaks" value={pegBroken ? `month ${summary.pegBreakMonth}` : 'never'}
                   colour={pegBroken ? RED : GRN} />
              <Kpi label="Trade balance" value={`$${(summary.tradeBalance/1_000_000).toFixed(0)}M`}
                   colour={summary.tradeBalance > 0 ? GRN : RED} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <ChartPanel title="USDC RESERVE">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#232831" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#232831" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#232831"
                      tickFormatter={v => `$${(v/1_000_000).toFixed(0)}M`} />
                    <Tooltip contentStyle={tipStyle} formatter={v => `$${Math.round(v).toLocaleString()}`} />
                    <Line type="monotone" dataKey="reserve" stroke={GRN} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="BASKET COST IN S — citizen experience">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#232831" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#232831" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#232831" domain={[20, 'auto']} />
                    <ReferenceLine y={TARGET_BASKET_S} stroke={GRN} strokeDasharray="3 3" label={{ value: 'target', fill: GRN, fontSize: 9, position: 'right' }} />
                    <Tooltip contentStyle={tipStyle} formatter={v => `${Number(v).toFixed(1)} S`} />
                    <Line type="monotone" dataKey="basketInS" stroke={GOLD} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="FISC RATE ($/S) — actual vs target">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#232831" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#232831" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#232831" domain={[0, 'auto']} />
                    <Tooltip contentStyle={tipStyle} formatter={v => `$${Number(v).toFixed(3)}`} />
                    <Legend wrapperStyle={{ fontSize: 10, color: T2 }} />
                    <Line type="monotone" dataKey="target" name="target" stroke={T3} strokeDasharray="4 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="rate"   name="actual" stroke={PRP} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="CUMULATIVE TRADE BALANCE">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#232831" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#232831" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#232831"
                      tickFormatter={v => `$${(v/1_000_000).toFixed(0)}M`} />
                    <ReferenceLine y={0} stroke={T3} strokeDasharray="3 3" />
                    <Tooltip contentStyle={tipStyle} formatter={v => `$${Math.round(v).toLocaleString()}`} />
                    <Line type="monotone" dataKey="tradeBalance" stroke={BLU} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

            {/* Read-out */}
            <div style={{ marginTop: 18, padding: 14, background: BG2, border: BD, fontSize: 12, color: T2, lineHeight: 1.7 }}>
              {pegBroken ? (
                <>
                  <strong style={{ color: RED }}>Peg breaks at month {summary.pegBreakMonth}.</strong>{' '}
                  Trade balance: ${(summary.tradeBalance/1_000_000).toFixed(0)}M over 24 months.
                  By month 24 the basket costs <strong style={{ color: T1 }}>{summary.endBasketInS.toFixed(1)} S</strong>{' '}
                  ({((summary.endBasketInS / TARGET_BASKET_S - 1) * 100).toFixed(0)}% real-terms loss for V holders).
                  This colony cannot run SPICE on its own — it needs a twin partner with surplus exports.
                </>
              ) : summary.endBasketInS > TARGET_BASKET_S * 1.02 ? (
                <>
                  <strong style={{ color: GOLD }}>Drift.</strong>{' '}
                  Basket cost {summary.endBasketInS.toFixed(1)} S vs target {TARGET_BASKET_S} S — citizens losing real-terms purchasing power. Workable but on a thin margin.
                </>
              ) : (
                <>
                  <strong style={{ color: GRN }}>Peg holds.</strong>{' '}
                  Trade balance ${(summary.tradeBalance/1_000_000).toFixed(0)}M over 24 months.
                  Basket holds at {summary.endBasketInS.toFixed(1)} S — citizens experience S as stable.
                  This colony can run SPICE on its own.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const presetBtn = {
  padding: '7px 12px', fontSize: 10, fontFamily: F,
  background: 'transparent', border: `1px solid ${BLU}`, color: BLU,
  cursor: 'pointer', borderRadius: 4, letterSpacing: '0.05em',
}

function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 11, color: T1 }}>{label}</div>
        <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, fontFamily: F }}>{display}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: GOLD, cursor: 'pointer', marginTop: 4 }} />
    </div>
  )
}

function Kpi({ label, value, sub, colour }) {
  return (
    <div style={{ background: BG2, border: BD, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 14, color: colour, fontWeight: 700, fontFamily: F }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: T3, fontFamily: F, marginTop: 2 }}>{sub}</div>}
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
