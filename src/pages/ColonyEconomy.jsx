/**
 * ColonyEconomy — interactive 24-month sim of two twinned Earth colonies
 * sharing a single Fisc reserve.
 *
 * Mechanism:
 *   Each colony has its own S supply, V supply, citizens, companies, UBI mint.
 *   But all USD flows (exports in, imports out, cashouts out, LAT in) go
 *   through ONE shared USDC reserve. The Fisc rate is determined by the
 *   *combined* cover ratio (total USDC / total V across both colonies).
 *
 * The thesis: a colony alone may be a net importer and would collapse,
 * but twinned with a net-exporter colony, the combined reserve stays
 * healthy. Same maths as a federal currency union — Mississippi imports,
 * Connecticut exports, the dollar works because they share a Fed.
 */
import { useState, useMemo, startTransition } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'

// ── Design tokens ────────────────────────────────────────────────────────────
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

const COL_A = "#3dffa0"   // green-ish for Colony A
const COL_B = "#a78bfa"   // purple for Colony B

const CH = 180

// ── Defaults & presets ───────────────────────────────────────────────────────

// ── Basket anchor ────────────────────────────────────────────────────────────
// SPICE keeps a fixed basket of goods costing a constant number of S.
// USD volatility is absorbed by the floating Fisc rate; citizens see S as
// stable in real (basket) terms.
const TARGET_BASKET_S        = 28        // basket always costs 28 S to a citizen
const INITIAL_BASKET_USD     = 28        // basket starts at $28 → initial rate $1/S

const SHARED_DEFAULTS = {
  ubiPerMonth:            100,
  initialUsdcReserve:     50_000_000,
  usdInflationAnnual:     0.05,            // 5%/yr USD debasement (post-Collision baseline)
  citizenSpendRate:       0.85,
  citizenSaveRate:        0.05,
  citizenCashoutSize:     0.30,
  companyWagePct:         0.50,
  companyMccBillPct:      0.05,
  companyVSavePct:        0.10,
  companyDividendPct:     0.05,
  reserveTargetRatio:     0.30,
  reserveFloorRatio:      0.10,
  mccConsumesPct:         0.80,
  ubiClaimRate:           0.95,
  spendLargeCo:           0.25,
  spendMidCo:             0.35,
  spendSmallCo:           0.30,
  spendP2P:               0.10,
  months:                 24,
}

// Per-colony tunables. Citizens per-colony so towns of different sizes
// can be paired. Numbers below for real towns are PLAUSIBLE-MAGNITUDE
// estimates derived from public industry/employment knowledge — not
// measured balance-of-payments figures. A defensible methodology
// using BEA county GDP + Census County Business Patterns + USTR state
// export data is a separate piece of work.
function makeColony(name, citizens, exports, imports, lat, cashout) {
  return {
    name, citizens,
    monthlyExportUsd:    exports,
    monthlyImportUsd:    imports,
    latParticipation:    lat,
    citizenCashoutRate:  cashout,
  }
}

const PRESETS = {
  // ── Synthetic ────────────────────────────────────────────────────────
  symmetric: {
    label: 'Symmetric (both balanced)',
    A: makeColony('Colony A', 10_000,  5_000_000,  3_000_000, 0, 0),
    B: makeColony('Colony B', 10_000,  5_000_000,  3_000_000, 0, 0),
  },
  exporter_importer: {
    label: 'Pure exporter ↔ pure importer',
    A: makeColony('Net exporter', 10_000,  20_000_000,  4_000_000, 0, 0),
    B: makeColony('Net importer', 10_000,   2_000_000, 18_000_000, 0, 0),
  },

  // ── Ohio ─────────────────────────────────────────────────────────────
  // Marysville is the home of Honda of America's flagship assembly plant
  // (~4,400 employees, ~$0.5-1B/yr value-added, exports cars worldwide).
  // Bellefontaine is a smaller residential/retail centre 25 miles north,
  // with some Honda-parts suppliers but mostly serving Logan County
  // consumption demand.
  ohio: {
    label: 'Ohio · Marysville + Bellefontaine',
    A: makeColony('Marysville, OH',    25_000, 40_000_000, 25_000_000, 0, 0),
    B: makeColony('Bellefontaine, OH', 14_000,  5_000_000, 18_000_000, 0, 0),
  },

  // ── Michigan ─────────────────────────────────────────────────────────
  // Midland is the global HQ of Dow Inc. — chemicals plant + corporate
  // employment drives huge external earnings. Saginaw is a post-GM
  // decline town: ongoing population loss, residual auto-parts industry,
  // weakening retail.
  michigan: {
    label: 'Michigan · Midland + Saginaw',
    A: makeColony('Midland, MI',  42_000, 60_000_000, 30_000_000, 0, 0),
    B: makeColony('Saginaw, MI',  44_000, 12_000_000, 32_000_000, 0, 0),
  },

  // ── Indiana ──────────────────────────────────────────────────────────
  // Bloomington is home to Indiana University (~45k students, mostly
  // out-of-state tuition $) plus a medical/tech employer base. Terre
  // Haute is a faded manufacturing town; the federal penitentiary and
  // Indiana State University are smaller anchors.
  indiana: {
    label: 'Indiana · Bloomington + Terre Haute',
    A: makeColony('Bloomington, IN', 85_000, 80_000_000, 50_000_000, 0, 0),
    B: makeColony('Terre Haute, IN', 60_000, 25_000_000, 55_000_000, 0, 0),
  },
}

// ── Simulation engine ────────────────────────────────────────────────────────

function freshColonyState() {
  return {
    sCitizens: 0, sLargeCo: 0, sMidCo: 0, sSmallCo: 0, sMcc: 0,
    vCitizens: 0, vCompanies: 0,
    sSupply: 0, vSupply: 0,
  }
}

/**
 * Compute the target Fisc rate for a given month (USD inflation factored in)
 * and the actual rate the Fisc can pay given reserve adequacy.
 *
 * Target rate floats to keep the basket constant at TARGET_BASKET_S in S terms.
 * Actual rate compresses if reserve can't cover V supply at the target rate.
 */
function basketCostUsd(monthIdx, p) {
  const monthlyInflation = Math.pow(1 + p.usdInflationAnnual, 1/12) - 1
  return INITIAL_BASKET_USD * Math.pow(1 + monthlyInflation, monthIdx)
}

function targetRateAt(monthIdx, p) {
  return basketCostUsd(monthIdx, p) / TARGET_BASKET_S
}

function actualRate(targetRate, combinedV, reserve, p) {
  if (combinedV <= 0) return targetRate
  // Cover ratio in target-rate terms: reserve / (V × target_rate)
  // = how many V tokens worth of redemption we can honour at target
  const coverAtTarget = reserve / (combinedV * targetRate)
  if (coverAtTarget >= p.reserveTargetRatio) return targetRate
  if (coverAtTarget <= 0) return targetRate * 0.01
  return Math.max(targetRate * 0.01, targetRate * (coverAtTarget / p.reserveTargetRatio))
}

/**
 * Run one month for a single colony's *internal* flows (UBI / spend / wages
 * / bills / V conversions / dividends / MCC consumption). Does NOT touch the
 * USD reserve — that's done after both colonies' internal flows complete.
 *
 * Returns updated state plus the colony's USD demands for the month
 * (cashout intent, import intent) and supply (exports, LAT).
 */
function runInternalFlows(colState, colCfg, p, currentRate) {
  const s = { ...colState }

  // 1. UBI mint — uses this colony's citizen count, not a shared one
  const ubi = colCfg.citizens * p.ubiPerMonth * p.ubiClaimRate
  s.sCitizens += ubi

  // 2. Citizens spend
  const spend = s.sCitizens * p.citizenSpendRate
  s.sCitizens -= spend
  s.sLargeCo += spend * p.spendLargeCo
  s.sMidCo   += spend * p.spendMidCo
  s.sSmallCo += spend * p.spendSmallCo
  s.sCitizens += spend * p.spendP2P

  // 3. Wages
  s.sCitizens += (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyWagePct
  s.sLargeCo *= (1 - p.companyWagePct)
  s.sMidCo   *= (1 - p.companyWagePct)
  s.sSmallCo *= (1 - p.companyWagePct)

  // 4. MCC bills
  const bills = (s.sLargeCo + s.sMidCo + s.sSmallCo) * p.companyMccBillPct
  s.sLargeCo *= (1 - p.companyMccBillPct)
  s.sMidCo   *= (1 - p.companyMccBillPct)
  s.sSmallCo *= (1 - p.companyMccBillPct)
  s.sMcc += bills

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

  // 10. Dividends (out of order to keep the loop tidy)
  const divs = s.vCompanies * p.companyDividendPct
  s.vCompanies -= divs
  s.vCitizens  += divs

  // 11. MCC consumption
  s.sMcc *= (1 - p.mccConsumesPct)

  // Compute USD demands for the month
  const cashoutVintent = s.vCitizens * colCfg.citizenCashoutRate * p.citizenCashoutSize
  const cashoutUsdIntent = cashoutVintent * currentRate
  const importUsdIntent  = colCfg.monthlyImportUsd
  const exportUsdIn      = colCfg.monthlyExportUsd
  const latUsdIn         = exportUsdIn * colCfg.latParticipation * 0.05  // 5% of revenue

  return {
    state: s,
    cashoutVintent, cashoutUsdIntent,
    importUsdIntent,
    exportUsdIn, latUsdIn,
  }
}

/** Apply USD flows from both colonies to the shared reserve.
 *  When demand > supply, scale back proportionally (cashouts + imports compete
 *  for the same reserve). */
function settleSharedReserve(reserve, A, B, p, currentRate) {
  // Inflows: exports + LAT from both
  const totalIn  = A.exportUsdIn + A.latUsdIn + B.exportUsdIn + B.latUsdIn
  // Outflows wanted: cashouts + imports from both
  const totalOutWanted = A.cashoutUsdIntent + A.importUsdIntent
                       + B.cashoutUsdIntent + B.importUsdIntent

  reserve += totalIn

  // If demand exceeds reserve, scale back proportionally
  let scale = 1
  if (totalOutWanted > reserve) {
    scale = reserve / Math.max(totalOutWanted, 1e-9)
  }

  const aCashoutUsd = A.cashoutUsdIntent * scale
  const aImportUsd  = A.importUsdIntent  * scale
  const bCashoutUsd = B.cashoutUsdIntent * scale
  const bImportUsd  = B.importUsdIntent  * scale

  reserve -= (aCashoutUsd + aImportUsd + bCashoutUsd + bImportUsd)
  if (reserve < 0) reserve = 0  // numeric safety

  // Apply to colony states — burn V from cashouts, mint S for exports, burn S for imports
  const apply = (st, exportUsdIn, importUsd, cashoutUsd, intentVcashout) => {
    // Mint S for exporters
    if (currentRate > 0 && exportUsdIn > 0) {
      st.sLargeCo += exportUsdIn / currentRate
    }
    // Burn V for actual cashouts (proportional to intent)
    const vCashed = intentVcashout * scale
    st.vCitizens -= vCashed
    if (st.vCitizens < 0) st.vCitizens = 0
    // Burn company S for imports
    if (currentRate > 0 && importUsd > 0) {
      const sBurn = importUsd / currentRate
      const totalCoS = st.sLargeCo + st.sMidCo + st.sSmallCo
      if (totalCoS > 0) {
        const burnFrac = Math.min(1, sBurn / totalCoS)
        st.sLargeCo *= (1 - burnFrac)
        st.sMidCo   *= (1 - burnFrac)
        st.sSmallCo *= (1 - burnFrac)
      }
    }
    st.sSupply = st.sCitizens + st.sLargeCo + st.sMidCo + st.sSmallCo + st.sMcc
    st.vSupply = st.vCitizens + st.vCompanies
    return st
  }

  apply(A.state, A.exportUsdIn, aImportUsd, aCashoutUsd, A.cashoutVintent)
  apply(B.state, B.exportUsdIn, bImportUsd, bCashoutUsd, B.cashoutVintent)

  return {
    reserve,
    flows: {
      exportUsd:  totalIn - (A.latUsdIn + B.latUsdIn),
      latUsd:     A.latUsdIn + B.latUsdIn,
      importUsd:  aImportUsd + bImportUsd,
      cashoutUsd: aCashoutUsd + bCashoutUsd,
      shortfall:  totalOutWanted - (aCashoutUsd + aImportUsd + bCashoutUsd + bImportUsd),
      a: { import: aImportUsd, importIntent: A.importUsdIntent,
           cashout: aCashoutUsd, cashoutIntent: A.cashoutUsdIntent,
           export: A.exportUsdIn },
      b: { import: bImportUsd, importIntent: B.importUsdIntent,
           cashout: bCashoutUsd, cashoutIntent: B.cashoutUsdIntent,
           export: B.exportUsdIn },
    },
  }
}

function runSim(p, colA, colB) {
  let A = freshColonyState()
  let B = freshColonyState()
  let reserve = p.initialUsdcReserve
  let rate    = targetRateAt(0, p)
  let target  = rate

  const rows = [{
    month: 0,
    reserve,
    rate, target,
    basketUsd:    INITIAL_BASKET_USD,
    basketInS:    TARGET_BASKET_S,
    coverRatio:   null,
    coverAtTarget: null,
    aSSupply: 0, bSSupply: 0,
    aVSupply: 0, bVSupply: 0,
    tradeBalanceA: 0, tradeBalanceB: 0,
  }]
  let totals = { exports: 0, imports: 0, cashouts: 0, lat: 0, shortfall: 0,
                 aExports: 0, aImports: 0, bExports: 0, bImports: 0 }
  let pegBreakMonth = null

  for (let m = 1; m <= p.months; m++) {
    target = targetRateAt(m, p)

    // Run internal flows in parallel for both colonies (uses *current* rate)
    const aRun = runInternalFlows(A, colA, p, rate)
    const bRun = runInternalFlows(B, colB, p, rate)

    const settle = settleSharedReserve(reserve, aRun, bRun, p, rate)
    reserve = settle.reserve
    A = aRun.state
    B = bRun.state

    // Update actual rate against new target + reserve adequacy
    rate = actualRate(target, A.vSupply + B.vSupply, reserve, p)

    if (pegBreakMonth === null && rate < target * 0.99) {
      pegBreakMonth = m
    }

    totals.exports   += settle.flows.exportUsd
    totals.imports   += settle.flows.importUsd
    totals.cashouts  += settle.flows.cashoutUsd
    totals.lat       += settle.flows.latUsd
    totals.shortfall += settle.flows.shortfall
    totals.aExports  += settle.flows.a.export
    totals.aImports  += settle.flows.a.import
    totals.bExports  += settle.flows.b.export
    totals.bImports  += settle.flows.b.import

    const v = A.vSupply + B.vSupply
    const basketUsd = basketCostUsd(m, p)
    rows.push({
      month: m,
      reserve: Math.round(reserve),
      rate:    +rate.toFixed(4),
      target:  +target.toFixed(4),
      basketUsd: +basketUsd.toFixed(2),
      basketInS: +(basketUsd / rate).toFixed(2),  // citizen's experience: rises if peg breaks
      coverRatio:   v > 0 ? +(reserve / v).toFixed(4) : null,
      coverAtTarget: v > 0 ? +(reserve / (v * target)).toFixed(4) : null,
      aSSupply: Math.round(A.sSupply),
      bSSupply: Math.round(B.sSupply),
      aVSupply: Math.round(A.vSupply),
      bVSupply: Math.round(B.vSupply),
      tradeBalanceA: Math.round(totals.aExports - totals.aImports),
      tradeBalanceB: Math.round(totals.bExports - totals.bImports),
    })
  }

  const end = rows[rows.length - 1]
  return {
    rows,
    summary: {
      endReserve:    end.reserve,
      endRate:       end.rate,
      endTarget:     end.target,
      endBasketInS:  end.basketInS,
      endCover:      end.coverRatio,
      endCoverAtTarget: end.coverAtTarget,
      pegBreakMonth,
      totalExports:  Math.round(totals.exports),
      totalImports:  Math.round(totals.imports),
      totalCashouts: Math.round(totals.cashouts),
      totalLat:      Math.round(totals.lat),
      totalShortfall: Math.round(totals.shortfall),
      tradeBalance:  Math.round(totals.exports - totals.imports),
      netUsdInflow:  Math.round(totals.exports + totals.lat - totals.imports - totals.cashouts),
      aTradeBalance: Math.round(totals.aExports - totals.aImports),
      bTradeBalance: Math.round(totals.bExports - totals.bImports),
    },
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ColonyEconomy() {
  const [ubi,        setUbi]        = useState(SHARED_DEFAULTS.ubiPerMonth)
  const [reserve,    setReserve]    = useState(SHARED_DEFAULTS.initialUsdcReserve)
  const [usdInflation, setUsdInflation] = useState(SHARED_DEFAULTS.usdInflationAnnual)

  const [colA, setColA] = useState(PRESETS.ohio.A)
  const [colB, setColB] = useState(PRESETS.ohio.B)

  function applyPreset(name) {
    const p = PRESETS[name]
    startTransition(() => {
      setColA(p.A)
      setColB(p.B)
    })
  }

  const params = {
    ...SHARED_DEFAULTS,
    ubiPerMonth: ubi,
    initialUsdcReserve: reserve,
    usdInflationAnnual: usdInflation,
  }
  const { rows, summary } = useMemo(() => runSim(params, colA, colB), [
    ubi, reserve, usdInflation, colA, colB,
  ])

  // "What if alone" — re-run each colony with partner zeroed and reserve halved
  const partnerless = (c) => ({ ...c, citizens: 0, monthlyExportUsd: 0,
                                monthlyImportUsd: 0, latParticipation: 0,
                                citizenCashoutRate: 0 })
  const aAlone = useMemo(() => runSim(
    { ...params, initialUsdcReserve: reserve / 2 },
    colA, partnerless(colB),
  ), [ubi, reserve, usdInflation, colA, colB])
  const bAlone = useMemo(() => runSim(
    { ...params, initialUsdcReserve: reserve / 2 },
    partnerless(colA), colB,
  ), [ubi, reserve, usdInflation, colA, colB])

  const pegBroken = summary.pegBreakMonth !== null

  return (
    <div style={{ minHeight: '100vh', background: BG0, color: T1, fontFamily: F, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ borderBottom: BD, padding: '20px 24px', background: BG1 }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: '0.3em', marginBottom: 8 }}>
          SPICE COLONY ECONOMY · TWINNED SIMULATION
        </div>
        <div style={{ fontSize: 13, color: T2, lineHeight: 1.6, maxWidth: 880 }}>
          Two SPICE colonies sharing one Fisc reserve. S-tokens are anchored
          to a fixed basket of goods costing 28 S — the Fisc rate floats
          against USD as USD inflates or deflates, so citizens experience S
          as stable in real terms. The peg "breaks" when the reserve can't
          honour V redemption at the basket-anchored rate. The thesis: a
          colony that can't survive alone can be viable inside a currency
          union with a partner whose trade balance offsets it.
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 18 }}>

        {/* Preset row */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 6 }}>PRESETS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(PRESETS).map(([key, p]) => (
              <button key={key} onClick={() => applyPreset(key)}
                style={{
                  padding: '7px 12px', fontSize: 10, fontFamily: F,
                  background: 'transparent', border: `1px solid ${BLU}`, color: BLU,
                  cursor: 'pointer', borderRadius: 4, letterSpacing: '0.05em',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shared controls */}
        <div style={{ background: BG2, border: BD, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 10 }}>
            SHARED · APPLIES TO BOTH COLONIES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
            <Slider label="UBI per citizen / month" value={ubi}
              min={0} max={1000} step={10} display={`${ubi} S`}
              onChange={v => startTransition(() => setUbi(v))} />
            <Slider label="Shared initial USDC reserve" value={reserve}
              min={1_000_000} max={500_000_000} step={1_000_000}
              display={`$${(reserve/1_000_000).toFixed(0)}M`}
              onChange={v => startTransition(() => setReserve(v))} />
            <Slider label="USD inflation / yr" value={usdInflation}
              min={-0.10} max={0.50} step={0.01}
              display={`${(usdInflation*100).toFixed(0)}%`}
              onChange={v => startTransition(() => setUsdInflation(v))} />
          </div>
        </div>

        {/* Per-colony controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <ColonyPanel name={colA.name} colour={COL_A} colony={colA} setColony={setColA}
            soloSummary={aAlone.summary} />
          <ColonyPanel name={colB.name} colour={COL_B} colony={colB} setColony={setColB}
            soloSummary={bAlone.summary} />
        </div>

        {/* KPI strip — combined. Basket cost is the citizen-facing health metric. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 14 }}>
          <Kpi label="End basket cost"
               value={`${summary.endBasketInS.toFixed(1)} S`}
               sub={`target ${TARGET_BASKET_S} S`}
               colour={summary.endBasketInS <= TARGET_BASKET_S * 1.02 ? GRN
                     : summary.endBasketInS <= TARGET_BASKET_S * 1.10 ? GOLD : RED} />
          <Kpi label="End rate ($/S)"
               value={summary.endRate.toFixed(2)}
               sub={`target $${summary.endTarget.toFixed(2)}`}
               colour={summary.endRate >= summary.endTarget * 0.99 ? GRN : RED} />
          <Kpi label="End reserve" value={`$${(summary.endReserve/1_000_000).toFixed(1)}M`}
               colour={summary.endReserve > 0 ? GRN : RED} />
          <Kpi label="Peg breaks"  value={pegBroken ? `month ${summary.pegBreakMonth}` : 'never'}
               colour={pegBroken ? RED : GRN} />
          <Kpi label="Combined trade (24mo)" value={`$${(summary.tradeBalance/1_000_000).toFixed(0)}M`}
               colour={summary.tradeBalance > 0 ? GRN : RED} />
          <Kpi label="Net $ inflow (24mo)"   value={`$${(summary.netUsdInflow/1_000_000).toFixed(0)}M`}
               colour={summary.netUsdInflow > 0 ? GRN : RED} />
        </div>

        {/* Charts — 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          <ChartPanel title="SHARED USDC RESERVE">
            <ResponsiveContainer width="100%" height={CH}>
              <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tipStyle} formatter={v => `$${Math.round(v).toLocaleString()}`} />
                <Line type="monotone" dataKey="reserve" stroke={GRN} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="BASKET COST IN S — citizen experience (target = 28 S)">
            <ResponsiveContainer width="100%" height={CH}>
              <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                  domain={[20, 'auto']} />
                <ReferenceLine y={TARGET_BASKET_S} stroke={GRN} strokeDasharray="3 3" label={{ value: 'target', fill: GRN, fontSize: 9, position: 'right' }} />
                <Tooltip contentStyle={tipStyle} formatter={v => `${Number(v).toFixed(1)} S`} />
                <Line type="monotone" dataKey="basketInS" stroke={GOLD} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="FISC RATE ($/S) — actual vs target">
            <ResponsiveContainer width="100%" height={CH}>
              <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                  domain={[0, 'auto']} />
                <Tooltip contentStyle={tipStyle} formatter={v => `$${Number(v).toFixed(3)}`} />
                <Legend wrapperStyle={{ fontSize: 10, color: T2 }} />
                <Line type="monotone" dataKey="target" name="target" stroke={T3} strokeDasharray="4 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="rate"   name="actual" stroke={PRP} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="CUMULATIVE TRADE BALANCE — by colony">
            <ResponsiveContainer width="100%" height={CH}>
              <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#1e2a42" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42" />
                <YAxis tick={{ fill: T3, fontSize: 10 }} stroke="#1e2a42"
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <ReferenceLine y={0} stroke={T3} strokeDasharray="3 3" />
                <Tooltip contentStyle={tipStyle} formatter={v => `$${Math.round(v).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 10, color: T2 }} />
                <Line type="monotone" dataKey="tradeBalanceA" name={colA.name} stroke={COL_A} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="tradeBalanceB" name={colB.name} stroke={COL_B} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

        </div>

        {/* Read-out */}
        <div style={{ marginTop: 18, padding: 14, background: BG2, border: BD, fontSize: 12, color: T2, lineHeight: 1.7 }}>
          {summary.totalShortfall > 0 && (
            <div style={{ marginBottom: 10, color: GOLD }}>
              <strong>⚠ Combined import + cashout shortfall:</strong> ${(summary.totalShortfall/1_000_000).toFixed(1)}M of demand could not be met from the shared reserve over 24 months.
            </div>
          )}
          {pegBroken ? (
            <>
              <strong style={{ color: RED }}>Peg breaks at month {summary.pegBreakMonth}.</strong>{' '}
              Combined trade balance: <strong style={{ color: T1 }}>${(summary.tradeBalance/1_000_000).toFixed(0)}M</strong>{' '}
              over 24 months. The reserve can't honour V redemption at the basket-anchored rate.
              By month 24 the basket costs <strong style={{ color: T1 }}>{summary.endBasketInS.toFixed(1)} S</strong>{' '}
              (target {TARGET_BASKET_S}) — a {(((summary.endBasketInS / TARGET_BASKET_S) - 1) * 100).toFixed(0)}% real-terms loss for V holders.
            </>
          ) : summary.endBasketInS > TARGET_BASKET_S * 1.02 ? (
            <>
              <strong style={{ color: GOLD }}>Peg holds, citizens drifting off-anchor.</strong>{' '}
              Basket cost {summary.endBasketInS.toFixed(1)} S vs target {TARGET_BASKET_S} S — citizens are losing some real-terms purchasing power. Cover thin against shocks.
            </>
          ) : (
            <>
              <strong style={{ color: GRN }}>Twinning works.</strong>{' '}
              Combined trade balance ${(summary.tradeBalance/1_000_000).toFixed(0)}M{' '}
              ({colA.name}: ${(summary.aTradeBalance/1_000_000).toFixed(0)}M,{' '}
              {colB.name}: ${(summary.bTradeBalance/1_000_000).toFixed(0)}M).{' '}
              Basket holds at {summary.endBasketInS.toFixed(1)} S — citizens experience S as stable
              even though USD has {usdInflation >= 0 ? 'inflated' : 'deflated'} by{' '}
              {Math.abs(((rows[rows.length-1].basketUsd / INITIAL_BASKET_USD) - 1) * 100).toFixed(0)}% over 24 months.
              The colonies' surpluses and deficits offset each other across the shared Fisc.
            </>
          )}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: BD, fontSize: 11, color: T3 }}>
            <strong style={{ color: T2 }}>If they ran solo</strong> (each with half the seed reserve, no twinning):{' '}
            <span style={{ color: aAlone.summary.pegBreakMonth ? RED : GRN }}>
              {colA.name} {aAlone.summary.pegBreakMonth ? `peg breaks month ${aAlone.summary.pegBreakMonth}` : 'peg holds'}
            </span>;{' '}
            <span style={{ color: bAlone.summary.pegBreakMonth ? RED : GRN }}>
              {colB.name} {bAlone.summary.pegBreakMonth ? `peg breaks month ${bAlone.summary.pegBreakMonth}` : 'peg holds'}
            </span>.
            {(aAlone.summary.pegBreakMonth || bAlone.summary.pegBreakMonth) && !pegBroken && (
              <span style={{ color: GRN, marginLeft: 6 }}>
                ✓ Twinning rescues the failing colony.
              </span>
            )}
          </div>
        </div>

        {/* Method */}
        <details style={{ marginTop: 14, fontSize: 11, color: T3 }}>
          <summary style={{ cursor: 'pointer', color: T2 }}>Method · twinning mechanism</summary>
          <div style={{ paddingLeft: 6, lineHeight: 1.7, marginTop: 6 }}>
            Each colony runs its own monthly internal flows independently — UBI mint, citizen
            spending, wages, MCC bills, S→V conversions, dividends, MCC consumption.
            Then USD flows from both colonies hit ONE shared reserve in the same
            month: exports from A and B add to it, imports + cashouts from A and B draw
            from it. If demand exceeds reserve, draws are scaled back proportionally
            (cashouts and imports compete on equal footing).
          </div>
          <div style={{ paddingLeft: 6, marginTop: 8, color: T3 }}>
            The Fisc rate is determined by COMBINED cover (shared USDC ÷ total V across
            both colonies). Same rate applies to V holders in either colony — the union
            is single-rate. Reference Python implementation: <code>docs/economy-model/model.py</code>.
            Spec write-up: <code>docs/SPICE-Economy.md</code> Part 4.
          </div>
        </details>
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ColonyPanel({ name, colour, colony, setColony, soloSummary }) {
  const set = (k, v) => setColony({ ...colony, [k]: v })
  const trade = colony.monthlyExportUsd - colony.monthlyImportUsd
  return (
    <div style={{ background: BG2, border: `1px solid ${colour}33`, borderTop: `2px solid ${colour}`, padding: 14 }}>
      <input
        value={colony.name}
        onChange={e => set('name', e.target.value)}
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 13, color: colour, fontFamily: F, fontWeight: 700,
          width: '100%', marginBottom: 4,
        }}
      />
      <div style={{ fontSize: 10, color: trade >= 0 ? GRN : RED, marginBottom: 12 }}>
        {colony.citizens.toLocaleString()} citizens · monthly trade ${(trade/1_000_000).toFixed(1)}M ({trade >= 0 ? 'net exporter' : 'net importer'})
      </div>

      <Slider label="Citizens"
        value={colony.citizens} min={500} max={200_000} step={500}
        display={colony.citizens.toLocaleString()}
        onChange={v => startTransition(() => set('citizens', v))} />
      <Slider label="Monthly exports (USD)"
        value={colony.monthlyExportUsd} min={0} max={100_000_000} step={500_000}
        display={`$${(colony.monthlyExportUsd/1_000_000).toFixed(1)}M`}
        onChange={v => startTransition(() => set('monthlyExportUsd', v))} />
      <Slider label="Monthly imports (USD)"
        value={colony.monthlyImportUsd} min={0} max={100_000_000} step={500_000}
        display={`$${(colony.monthlyImportUsd/1_000_000).toFixed(1)}M`}
        onChange={v => startTransition(() => set('monthlyImportUsd', v))} />
      <Slider label="LAT participation"
        value={colony.latParticipation} min={0} max={1} step={0.05}
        display={`${Math.round(colony.latParticipation * 100)}%`}
        onChange={v => startTransition(() => set('latParticipation', v))} />
      <Slider label="Citizen cashout rate / month"
        value={colony.citizenCashoutRate} min={0} max={0.10} step={0.005}
        display={`${(colony.citizenCashoutRate * 100).toFixed(1)}%`}
        onChange={v => startTransition(() => set('citizenCashoutRate', v))} />

      <div style={{ marginTop: 8, paddingTop: 8, borderTop: BD, fontSize: 10, color: T3 }}>
        Solo would: <span style={{ color: soloSummary.pegBreakMonth ? RED : GRN, fontWeight: 600 }}>
          {soloSummary.pegBreakMonth ? `break peg at month ${soloSummary.pegBreakMonth}` : 'survive'}
        </span>
      </div>
    </div>
  )
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
      <div style={{ fontSize: 9, color: T3, letterSpacing: '0.15em', marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
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
