/**
 * ColonyEconomy — single merged colony "MaryFontaine" demonstrating the
 * Fisc's job under heterogeneous USD volatility.
 *
 * The basket of goods is broken into 4 categories, each with its own
 * USD inflation rate:
 *   - Energy     (typically inflating — gas, fuel, electricity)
 *   - Food       (volatile — automation deflation, climate inflation)
 *   - Hard goods (typically deflating — electronics, clothing under automation)
 *   - Services   (sticky — labour-driven, tracks wages)
 *
 * The Fisc's job is NOT to peg S to USD. It's to keep the TOTAL basket
 * costing a constant 28 S, even when individual components diverge.
 * Citizens never see S becoming worth more or less in real terms — the
 * volatility is absorbed entirely by the floating $/S rate.
 *
 * Population scaled to "Marysville + Bellefontaine merged" — 39k citizens,
 * combined trade flows representative of a small post-Collision US town.
 */
import { useState, useMemo, startTransition } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'

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
const ORG  = "#f59e0b"
const CH   = 200

// ── Basket composition ──────────────────────────────────────────────────────
// Initial USD prices sum to $28 (= 28 S at initial rate $1/S).
// Each category has its own USD inflation rate — the citizen-facing demo.
const BASKET_INITIAL = {
  energy:   { label: 'Energy',     usd: 8.0, colour: ORG },  // gas, electricity
  food:     { label: 'Food',       usd: 9.0, colour: GRN },  // groceries, restaurant
  goods:    { label: 'Hard goods', usd: 5.0, colour: BLU },  // electronics, clothing
  services: { label: 'Services',   usd: 6.0, colour: PRP },  // transit, healthcare
}
const TARGET_BASKET_S    = 28
const INITIAL_BASKET_USD =
  BASKET_INITIAL.energy.usd + BASKET_INITIAL.food.usd +
  BASKET_INITIAL.goods.usd + BASKET_INITIAL.services.usd

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

// MaryFontaine = Marysville + Bellefontaine merged. ~39k citizens,
// combined exports roughly cover combined imports.
const COLONY_DEFAULTS = {
  citizens:   39_000,
  exports:    45_000_000,   // Marysville Honda + Bellefontaine misc
  imports:    43_000_000,   // combined consumption demand
  lat:        0,
  cashout:    0,
  ubi:        100,
  reserve:    50_000_000,
}

// Plausible 2026-onwards trajectories per category, in line with the
// SPICE macro thesis: USD-debasement-via-policy hitting energy + services,
// AI-driven deflation in goods + parts of food.
const INFLATION_PRESETS = {
  baseline_2026: {
    label: 'Baseline (mild)',
    energy: 0.05, food: 0.03, goods: -0.02, services: 0.04,
  },
  collision_classic: {
    label: 'Collision-era',
    // Gas/energy spike from supply tightness, AI eats hard-goods prices,
    // services sticky-up as labour resists, food volatile.
    energy: 0.20, food: 0.06, goods: -0.10, services: 0.08,
  },
  hyperinflation: {
    label: 'USD hyperinflation',
    energy: 0.40, food: 0.30, goods: 0.20, services: 0.35,
  },
  deflation_shock: {
    label: 'Broad deflation',
    energy: -0.05, food: -0.08, goods: -0.15, services: -0.03,
  },
  zero: {
    label: 'No inflation',
    energy: 0, food: 0, goods: 0, services: 0,
  },
}

function basketAt(monthIdx, infl) {
  const grow = (annual) => Math.pow(1 + Math.pow(1 + annual, 1/12) - 1, monthIdx)
  const items = {}
  let total = 0
  for (const [k, init] of Object.entries(BASKET_INITIAL)) {
    const usd = init.usd * grow(infl[k])
    items[k] = usd
    total += usd
  }
  return { items, total }
}
const targetRateAt = (m, infl) => basketAt(m, infl).total / TARGET_BASKET_S

function actualRate(targetRate, vSupply, reserve, p) {
  if (vSupply <= 0) return targetRate
  const cover = reserve / (vSupply * targetRate)
  if (cover >= p.reserveTargetRatio) return targetRate
  if (cover <= 0) return targetRate * 0.01
  return Math.max(targetRate * 0.01, targetRate * (cover / p.reserveTargetRatio))
}

function runSim(p) {
  let s = {
    sCitizens: 0, sLargeCo: 0, sMidCo: 0, sSmallCo: 0, sMcc: 0,
    vCitizens: 0, vCompanies: 0,
  }
  let reserve = p.reserve
  let rate    = targetRateAt(0, p.infl)

  const initBasket = basketAt(0, p.infl)
  const rows = [{
    month: 0, reserve, rate, target: rate,
    basketUsd: initBasket.total,
    basketInS: TARGET_BASKET_S,
    energyUsd:   initBasket.items.energy,
    foodUsd:     initBasket.items.food,
    goodsUsd:    initBasket.items.goods,
    servicesUsd: initBasket.items.services,
    energyS:     initBasket.items.energy   / rate,
    foodS:       initBasket.items.food     / rate,
    goodsS:      initBasket.items.goods    / rate,
    servicesS:   initBasket.items.services / rate,
  }]
  let totals = { exports: 0, imports: 0, cashouts: 0 }
  let pegBreakMonth = null

  for (let m = 1; m <= p.months; m++) {
    const target = targetRateAt(m, p.infl)
    const ns = { ...s }

    ns.sCitizens += p.citizens * p.ubi * p.ubiClaimRate
    const spend = ns.sCitizens * p.citizenSpendRate
    ns.sCitizens -= spend
    ns.sLargeCo += spend * p.spendLargeCo
    ns.sMidCo   += spend * p.spendMidCo
    ns.sSmallCo += spend * p.spendSmallCo
    ns.sCitizens += spend * p.spendP2P
    const wages = (ns.sLargeCo + ns.sMidCo + ns.sSmallCo) * p.companyWagePct
    ns.sLargeCo *= (1 - p.companyWagePct)
    ns.sMidCo   *= (1 - p.companyWagePct)
    ns.sSmallCo *= (1 - p.companyWagePct)
    ns.sCitizens += wages
    const bills = (ns.sLargeCo + ns.sMidCo + ns.sSmallCo) * p.companyMccBillPct
    ns.sLargeCo *= (1 - p.companyMccBillPct)
    ns.sMidCo   *= (1 - p.companyMccBillPct)
    ns.sSmallCo *= (1 - p.companyMccBillPct)
    ns.sMcc += bills
    const coSave = (ns.sLargeCo + ns.sMidCo + ns.sSmallCo) * p.companyVSavePct
    ns.sLargeCo *= (1 - p.companyVSavePct)
    ns.sMidCo   *= (1 - p.companyVSavePct)
    ns.sSmallCo *= (1 - p.companyVSavePct)
    ns.vCompanies += coSave
    const citSave = ns.sCitizens * p.citizenSaveRate
    ns.sCitizens -= citSave
    ns.vCitizens += citSave
    const divs = ns.vCompanies * p.companyDividendPct
    ns.vCompanies -= divs
    ns.vCitizens  += divs
    ns.sMcc *= (1 - p.mccConsumesPct)

    const exportUsd = p.exports
    const latUsd    = exportUsd * p.lat * p.latRateOnRevenue
    const cashoutVintent   = ns.vCitizens * p.cashout * p.citizenCashoutSize
    const cashoutUsdIntent = cashoutVintent * rate
    const importUsdIntent  = p.imports
    const inflow  = exportUsd + latUsd
    const outWant = cashoutUsdIntent + importUsdIntent
    const newReserve = reserve + inflow
    let scale = 1
    if (outWant > newReserve) scale = newReserve / Math.max(outWant, 1e-9)
    const cashoutUsd = cashoutUsdIntent * scale
    const importUsd  = importUsdIntent  * scale
    reserve = Math.max(0, newReserve - cashoutUsd - importUsd)

    if (rate > 0) ns.sLargeCo += exportUsd / rate
    ns.vCitizens = Math.max(0, ns.vCitizens - cashoutVintent * scale)
    if (rate > 0 && importUsd > 0) {
      const sBurn    = importUsd / rate
      const totalCoS = ns.sLargeCo + ns.sMidCo + ns.sSmallCo
      if (totalCoS > 0) {
        const f = Math.min(1, sBurn / totalCoS)
        ns.sLargeCo *= (1 - f); ns.sMidCo *= (1 - f); ns.sSmallCo *= (1 - f)
      }
    }

    s = ns
    const vSupply = s.vCitizens + s.vCompanies
    rate = actualRate(target, vSupply, reserve, p)
    if (pegBreakMonth === null && rate < target * 0.99) pegBreakMonth = m

    totals.exports += exportUsd
    totals.imports += importUsd
    totals.cashouts += cashoutUsd

    const b = basketAt(m, p.infl)
    rows.push({
      month: m,
      reserve: Math.round(reserve),
      rate:    +rate.toFixed(4),
      target:  +target.toFixed(4),
      basketUsd: +b.total.toFixed(2),
      basketInS: +(b.total / rate).toFixed(2),
      energyUsd:   +b.items.energy.toFixed(2),
      foodUsd:     +b.items.food.toFixed(2),
      goodsUsd:    +b.items.goods.toFixed(2),
      servicesUsd: +b.items.services.toFixed(2),
      energyS:   +(b.items.energy   / rate).toFixed(2),
      foodS:     +(b.items.food     / rate).toFixed(2),
      goodsS:    +(b.items.goods    / rate).toFixed(2),
      servicesS: +(b.items.services / rate).toFixed(2),
    })
  }

  const end = rows[rows.length - 1]
  return {
    rows,
    summary: {
      endReserve: end.reserve,
      endRate:    end.rate,
      endTarget:  end.target,
      endBasketInS: end.basketInS,
      endBasketUsd: end.basketUsd,
      pegBreakMonth,
      tradeBalance: Math.round(totals.exports - totals.imports),
    },
  }
}

export default function ColonyEconomy() {
  const [citizens,  setCitizens]  = useState(COLONY_DEFAULTS.citizens)
  const [exports_,  setExports]   = useState(COLONY_DEFAULTS.exports)
  const [imports_,  setImports]   = useState(COLONY_DEFAULTS.imports)
  const [ubi,       setUbi]       = useState(COLONY_DEFAULTS.ubi)
  const [reserve_,  setReserve]   = useState(COLONY_DEFAULTS.reserve)
  const [colName,   setColName]   = useState('MaryFontaine')

  const [infl, setInfl] = useState(INFLATION_PRESETS.collision_classic)

  const params = {
    ...DEFAULTS,
    citizens, exports: exports_, imports: imports_,
    lat: 0, cashout: 0, ubi, reserve: reserve_, infl,
  }
  const { rows, summary } = useMemo(() => runSim(params), [
    citizens, exports_, imports_, ubi, reserve_, infl,
  ])

  function applyInflPreset(k) {
    startTransition(() => setInfl({ ...INFLATION_PRESETS[k] }))
  }

  const pegBroken = summary.pegBreakMonth !== null
  const usdBasketGrowth = ((summary.endBasketUsd / INITIAL_BASKET_USD) - 1) * 100

  return (
    <div style={{ minHeight: '100vh', background: BG0, color: T1, fontFamily: F, paddingBottom: 40 }}>
      <div style={{ borderBottom: BD, padding: '20px 24px', background: BG1 }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: '0.3em', marginBottom: 8 }}>
          SPICE COLONY · BASKET STABILITY UNDER USD VOLATILITY
        </div>
        <div style={{ fontSize: 13, color: T2, lineHeight: 1.6, maxWidth: 900 }}>
          A single merged colony — <strong style={{ color: T1 }}>MaryFontaine</strong>{' '}
          (Marysville + Bellefontaine, OH, scaled). The basket of goods has four
          categories — energy, food, hard goods, services — each with its own
          USD inflation rate. The Fisc's job is to keep the TOTAL basket
          costing a constant 28 S regardless of how individual goods diverge.
          Citizens experience S as stable in real terms even when energy is
          rocketing and electronics are crashing.
        </div>
      </div>

      <div style={{ padding: 18 }}>

        {/* Inflation presets */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 6 }}>USD INFLATION SCENARIOS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(INFLATION_PRESETS).map(([k, p]) => (
              <button key={k} onClick={() => applyInflPreset(k)} style={presetBtn}>{p.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>

          {/* Sliders */}
          <div>
            <div style={{ background: BG2, border: BD, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 8 }}>COLONY</div>
              <input value={colName} onChange={e => setColName(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none',
                         fontSize: 13, color: GOLD, fontFamily: F, fontWeight: 700,
                         width: '100%', marginBottom: 10 }} />
              <Slider label="Citizens" value={citizens}
                min={1000} max={500_000} step={1000} display={citizens.toLocaleString()}
                onChange={v => startTransition(() => setCitizens(v))} />
              <Slider label="Monthly exports (USD)" value={exports_}
                min={0} max={200_000_000} step={1_000_000}
                display={`$${(exports_/1_000_000).toFixed(0)}M`}
                onChange={v => startTransition(() => setExports(v))} />
              <Slider label="Monthly imports (USD)" value={imports_}
                min={0} max={200_000_000} step={1_000_000}
                display={`$${(imports_/1_000_000).toFixed(0)}M`}
                onChange={v => startTransition(() => setImports(v))} />
              <Slider label="UBI per citizen / month" value={ubi}
                min={0} max={1000} step={10} display={`${ubi} S`}
                onChange={v => startTransition(() => setUbi(v))} />
              <Slider label="Initial USDC reserve" value={reserve_}
                min={1_000_000} max={500_000_000} step={1_000_000}
                display={`$${(reserve_/1_000_000).toFixed(0)}M`}
                onChange={v => startTransition(() => setReserve(v))} />
            </div>

            <div style={{ background: BG2, border: BD, padding: 14 }}>
              <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 8 }}>USD INFLATION (annual, by category)</div>
              {Object.entries(BASKET_INITIAL).map(([k, item]) => (
                <Slider key={k}
                  label={item.label}
                  value={infl[k]}
                  min={-0.20} max={0.50} step={0.01}
                  display={`${(infl[k]*100).toFixed(0)}%`}
                  colour={item.colour}
                  onChange={v => startTransition(() => setInfl({ ...infl, [k]: v }))} />
              ))}
            </div>
          </div>

          {/* Charts */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 14 }}>
              <Kpi label="End basket cost"
                   value={`${summary.endBasketInS.toFixed(1)} S`}
                   sub={`target ${TARGET_BASKET_S} S`}
                   colour={summary.endBasketInS <= TARGET_BASKET_S * 1.02 ? GRN
                         : summary.endBasketInS <= TARGET_BASKET_S * 1.10 ? GOLD : RED} />
              <Kpi label="End rate ($/S)"
                   value={summary.endRate.toFixed(2)}
                   sub={`target $${summary.endTarget.toFixed(2)}`}
                   colour={summary.endRate >= summary.endTarget * 0.99 ? GRN : RED} />
              <Kpi label="USD basket move"
                   value={`${usdBasketGrowth >= 0 ? '+' : ''}${usdBasketGrowth.toFixed(0)}%`}
                   sub="over 24mo"
                   colour={GOLD} />
              <Kpi label="End reserve"
                   value={`$${(summary.endReserve/1_000_000).toFixed(0)}M`}
                   colour={summary.endReserve > 0 ? GRN : RED} />
              <Kpi label="Peg breaks"
                   value={pegBroken ? `month ${summary.pegBreakMonth}` : 'never'}
                   colour={pegBroken ? RED : GRN} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              {/* The headline: total basket in S — should be flat at 28 */}
              <ChartPanel title="TOTAL BASKET COST IN S — citizen experience">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" domain={[20, 'auto']} />
                    <ReferenceLine y={TARGET_BASKET_S} stroke={GRN} strokeDasharray="3 3" label={{ value: 'target 28 S', fill: GRN, fontSize: 9, position: 'right' }} />
                    <Tooltip contentStyle={tipStyle} formatter={v => `${Number(v).toFixed(1)} S`} />
                    <Line type="monotone" dataKey="basketInS" stroke={GOLD} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              {/* The volatility: components in USD, diverging */}
              <ChartPanel title="BASKET COMPONENTS IN USD — diverging">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                      tickFormatter={v => `$${v.toFixed(0)}`} />
                    <Tooltip contentStyle={tipStyle} formatter={v => `$${Number(v).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 10, color: T2 }} />
                    <Line type="monotone" dataKey="energyUsd"   name="Energy"     stroke={ORG} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="foodUsd"     name="Food"       stroke={GRN} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="goodsUsd"    name="Hard goods" stroke={BLU} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="servicesUsd" name="Services"   stroke={PRP} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="FISC RATE ($/S) — actual vs target">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" domain={[0, 'auto']} />
                    <Tooltip contentStyle={tipStyle} formatter={v => `$${Number(v).toFixed(3)}`} />
                    <Legend wrapperStyle={{ fontSize: 10, color: T2 }} />
                    <Line type="monotone" dataKey="target" name="target" stroke={T3} strokeDasharray="4 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="rate"   name="actual" stroke={PRP} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

              {/* The internal repricing: components in S — they diverge but sum to 28 */}
              <ChartPanel title="BASKET COMPONENTS IN S — internal repricing">
                <ResponsiveContainer width="100%" height={CH}>
                  <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                    <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                      tickFormatter={v => `${v.toFixed(0)}S`} />
                    <Tooltip contentStyle={tipStyle} formatter={v => `${Number(v).toFixed(1)} S`} />
                    <Legend wrapperStyle={{ fontSize: 10, color: T2 }} />
                    <Line type="monotone" dataKey="energyS"   name="Energy"     stroke={ORG} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="foodS"     name="Food"       stroke={GRN} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="goodsS"    name="Hard goods" stroke={BLU} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="servicesS" name="Services"   stroke={PRP} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>

            </div>

            {/* Read-out */}
            <div style={{ marginTop: 18, padding: 14, background: BG2, border: BD, fontSize: 12, color: T2, lineHeight: 1.7 }}>
              {pegBroken ? (
                <>
                  <strong style={{ color: RED }}>Peg breaks at month {summary.pegBreakMonth}.</strong>{' '}
                  Despite the basket-anchoring mechanism, the colony's reserve couldn't keep up
                  with the redemption demand. By month 24 the basket costs {summary.endBasketInS.toFixed(1)} S
                  ({((summary.endBasketInS / TARGET_BASKET_S - 1) * 100).toFixed(0)}% real loss to V holders).
                </>
              ) : Math.abs(usdBasketGrowth) > 5 ? (
                <>
                  <strong style={{ color: GRN }}>The Fisc absorbed the volatility.</strong>{' '}
                  Over 24 months the basket {usdBasketGrowth > 0 ? 'inflated' : 'deflated'}{' '}
                  <strong style={{ color: T1 }}>{Math.abs(usdBasketGrowth).toFixed(0)}%</strong>{' '}
                  in USD terms — and individual components diverged sharply. Yet citizens
                  consistently paid <strong style={{ color: GOLD }}>{summary.endBasketInS.toFixed(1)} S</strong>{' '}
                  for the basket the entire way. That is the Fisc earning its keep: USD volatility
                  visible only on the rate line, never in citizens' pockets.
                </>
              ) : (
                <>
                  <strong style={{ color: GRN }}>Basket holds at {summary.endBasketInS.toFixed(1)} S.</strong>{' '}
                  Mild USD environment over these 24 months. The Fisc has light work; rate barely moves.
                  Try the "Collision-era" or "USD hyperinflation" presets to see the mechanism stress-tested.
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

function Slider({ label, value, min, max, step, display, onChange, colour }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 11, color: colour || T1 }}>{label}</div>
        <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, fontFamily: F }}>{display}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: colour || GOLD, cursor: 'pointer', marginTop: 4 }} />
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
