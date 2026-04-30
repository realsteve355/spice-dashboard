import { useColony } from './MarsLayout.jsx'

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n/1000).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

function sparkSVG(vals, maxVal, col, w=140, h=36) {
  if (!vals || !vals.length) return null
  const valid = vals.filter(v => v != null)
  if (!valid.length) return null
  const mn = Math.min(0, ...valid)
  const mx = maxVal || Math.max(...valid) || 1
  const rng = mx - mn || 1
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = v != null ? h - ((v - mn) / rng) * (h - 4) - 2 : null
    return y != null ? `${x.toFixed(1)},${y.toFixed(1)}` : null
  }).filter(Boolean)
  if (pts.length < 2) return null
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h, display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={col}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const UBI = 1000

export default function MarsHealth() {
  const data   = useColony()
  const annual = data.annual_summaries || []
  const viab   = data.viability || {}
  const rows   = viab.rows || []
  const formed = viab.companies_formed || 0
  const closed = viab.companies_closed || 0

  if (!rows.length) return <div className="mars-loading">NO VIABILITY DATA</div>

  const years      = rows.map(r => r.year)
  const infra      = rows.map(r => r.mcc_infra_health)
  const avg_bills  = rows.map(r => r.avg_mcc_bill)
  const dividends  = rows.map(r => r.total_dividends)
  const median_v   = rows.map(r => r.median_v)
  const v_conc     = rows.map(r => r.v_concentration_pct)
  const cos        = rows.map(r => r.active_companies)
  const pop        = rows.map(r => r.population)
  const mcc_rev    = rows.map(r => r.mcc_revenue)

  const min_infra    = Math.min(...infra)
  const final_infra  = infra[infra.length - 1]
  const valid_bills  = avg_bills.filter(b => b > 0)
  const avg_bill     = valid_bills.length ? valid_bills.reduce((a,b)=>a+b,0)/valid_bills.length : null
  const bill_pct     = avg_bill ? avg_bill / UBI * 100 : null
  const early_divs   = dividends.slice(0, 10)
  const late_divs    = dividends.slice(-10)
  const pop_early    = pop.slice(0, 10).reduce((a,b)=>a+b,0) / 10
  const early_div_pc = early_divs.reduce((a,b)=>a+b,0) / Math.max(1, pop_early) * 10
  const late_div_tot = late_divs.reduce((a,b)=>a+b,0)
  const early_div_tot= early_divs.reduce((a,b)=>a+b,0)
  const final_conc   = v_conc[v_conc.length - 1]
  const final_med_v  = median_v[median_v.length - 1]
  const min_cos      = Math.min(...cos)
  const final_cos    = cos[cos.length - 1]
  const survival     = (formed - closed) / Math.max(1, formed) * 100

  // Annual GDP
  const gdp_cum    = rows.map(r => r.colony_gdp)
  const annual_gdp = [gdp_cum[0], ...gdp_cum.slice(1).map((v,i) => v - gdp_cum[i])]
  const early_gdp  = annual_gdp.slice(0, 10).reduce((a,b)=>a+b,0) / 10
  const late_gdp   = annual_gdp.slice(-10).reduce((a,b)=>a+b,0) / 10
  const gdp_growth = (late_gdp - early_gdp) / Math.max(1, early_gdp) * 100

  const pop_min    = Math.min(...pop)
  const pop_drop   = (pop[0] - pop_min) / Math.max(1, pop[0]) * 100
  const pop_change = (pop[pop.length-1] - pop[0]) / Math.max(1, pop[0]) * 100

  const rev_pc     = rows.map(r => r.mcc_revenue / Math.max(1, r.population))
  const avg_rpc    = rev_pc.reduce((a,b)=>a+b,0) / rev_pc.length

  // Verdicts
  function v3(cond_green, cond_amber) {
    return cond_green ? 'green' : cond_amber ? 'amber' : 'red'
  }

  const checks = [
    {
      name: 'MCC Solvency',
      verdict: v3(min_infra >= 0.60 && final_infra >= 0.55, min_infra >= 0.40),
      status:  min_infra >= 0.60 ? 'Solvent' : min_infra >= 0.40 ? 'At risk' : 'Failed',
      metric:  `Min infra: ${Math.round(min_infra*100)}%  ·  Final: ${Math.round(final_infra*100)}%`,
      interp:  `Infrastructure health ${min_infra>=0.60?'remained stable':'degraded'} over 200 years.`,
      spark:   infra, sparkMax: 1,
    },
    {
      name: 'UBI Adequacy',
      verdict: bill_pct == null ? 'amber' : v3(bill_pct <= 25, bill_pct <= 35),
      status:  bill_pct == null ? 'No data' : bill_pct <= 25 ? 'Adequate' : bill_pct <= 35 ? 'Drifting' : 'Unaffordable',
      metric:  bill_pct != null ? `Avg MCC bill: ${bill_pct.toFixed(1)}% of UBI` : 'No billing data',
      interp:  `Target is ~20% of UBI (200 S-tokens). ${bill_pct<=25?'Citizens retain meaningful discretionary income.':'Bills are high relative to UBI.'}`,
      spark:   avg_bills, sparkMax: UBI,
    },
    {
      name: 'Dividend Viability',
      verdict: v3(early_div_pc >= 30 && late_div_tot >= early_div_tot, early_div_pc >= 8),
      status:  early_div_pc >= 30 ? 'Growing' : early_div_pc >= 8 ? 'Weak but present' : 'Negligible',
      metric:  `Early V/citizen/yr: ${early_div_pc.toFixed(1)}  ·  Late total: ${fmt(late_div_tot)} V`,
      interp:  `${early_div_pc>=30?'Dividends grew — cooperative model working.':early_div_pc>=8?'Dividends modest but present.':'Dividends negligible — citizens rely on UBI only.'}`,
      spark:   dividends, sparkMax: Math.max(...dividends),
    },
    {
      name: 'V-Token Accumulation',
      verdict: v3(final_conc < 5 && final_med_v > 500, final_conc < 12),
      status:  final_conc < 5 ? 'Healthy' : final_conc < 12 ? 'Mild concentration' : 'Concentrated',
      metric:  `Median final: ${fmt(final_med_v)} V  ·  Top holder: ${final_conc.toFixed(1)}% of pool`,
      interp:  `${final_conc<5?'No dangerous concentration — wealth distributed broadly.':'Concentration present — monitor across generations.'}`,
      spark:   median_v, sparkMax: Math.max(...median_v),
    },
    {
      name: 'Company Ecosystem',
      verdict: v3(min_cos >= 8 && survival >= 50, min_cos >= 4),
      status:  min_cos >= 8 ? 'Thriving' : min_cos >= 4 ? 'Thin' : 'Collapsed',
      metric:  `Min active: ${min_cos}  ·  Final: ${final_cos}  ·  Survival: ${survival.toFixed(0)}%`,
      interp:  `${formed} companies formed, ${closed} closed. ${min_cos>=8?'Healthy diversity throughout.':'Company numbers fell dangerously low at times.'}`,
      spark:   cos, sparkMax: Math.max(...cos),
    },
    {
      name: 'Colony GDP Growth',
      verdict: v3(gdp_growth >= 10, gdp_growth >= -5),
      status:  gdp_growth >= 10 ? 'Growing' : gdp_growth >= -5 ? 'Stagnant' : 'Contracting',
      metric:  `Annual GDP change early→late: ${gdp_growth >= 0 ? '+' : ''}${gdp_growth.toFixed(1)}%`,
      interp:  `${gdp_growth>=10?'Colony economic output expanded over 200 years.':gdp_growth>=-5?'Economic output broadly flat.':'Economic output contracted — population decline likely cause.'}`,
      spark:   annual_gdp, sparkMax: Math.max(...annual_gdp),
    },
    {
      name: 'Population Stability',
      verdict: v3(pop_drop < 15 && pop[pop.length-1] >= pop[0]*0.85, pop_drop < 30),
      status:  pop_drop < 15 ? 'Stable' : pop_drop < 30 ? 'Declining' : 'Collapsing',
      metric:  `Start: ${fmt(pop[0])}  ·  End: ${fmt(pop[pop.length-1])}  ·  Max drop: ${pop_drop.toFixed(1)}%`,
      interp:  `${pop_drop<15?'Births replacing deaths — population self-sustaining.':'Population declining — birth replacement lag or high death rates.'}  Total change: ${pop_change>=0?'+':''}${pop_change.toFixed(1)}%.`,
      spark:   pop, sparkMax: Math.max(...pop),
    },
    {
      name: 'Viability Equation',
      verdict: v3(avg_rpc >= 180, avg_rpc >= 120),
      status:  avg_rpc >= 180 ? 'Viable' : avg_rpc >= 120 ? 'Marginal' : 'Not viable',
      metric:  `Avg MCC revenue per citizen: ${fmt(avg_rpc)} S/month`,
      interp:  `${avg_rpc>=180?'Colony output covers MCC costs — Condition A met.':avg_rpc>=120?'Colony output marginal relative to MCC costs.':'Colony output does not cover MCC costs.'}`,
      spark:   rev_pc, sparkMax: Math.max(...rev_pc),
    },
  ]

  const verdicts = checks.map(c => c.verdict)
  const overall  = verdicts.includes('red') ? 'red'
                 : verdicts.filter(v=>v==='amber').length > 2 ? 'amber' : 'green'

  const overallText = {
    green: 'SYSTEM VIABLE — all key checks passed',
    amber: 'SYSTEM MARGINAL — some checks need attention',
    red:   'SYSTEM FAILURE — critical checks failed',
  }[overall]

  const verdictColor = { green:'#3dffa0', amber:'#e8a020', red:'#ff4d6a' }
  const verdictBg    = { green:'rgba(61,255,160,0.07)', amber:'rgba(232,160,32,0.07)', red:'rgba(255,77,106,0.07)' }
  const verdictIcon  = { green:'✓', amber:'⚠', red:'✗' }

  return (
    <div>
      <div className="md-label">Health Check — 200-Year Viability</div>

      {/* Overall banner */}
      <div style={{
        background: verdictBg[overall],
        border: `1px solid ${verdictColor[overall]}33`,
        borderRadius: 2,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span style={{ fontSize: 24, color: verdictColor[overall] }}>{verdictIcon[overall]}</span>
        <div>
          <div style={{ fontSize: 12, color: verdictColor[overall], letterSpacing: '0.12em' }}>
            {overallText}
          </div>
          <div style={{ fontSize: 9, color: '#8a8170', marginTop: 4, letterSpacing: '0.1em' }}>
            {verdicts.filter(v=>v==='green').length} passed ·{' '}
            {verdicts.filter(v=>v==='amber').length} warnings ·{' '}
            {verdicts.filter(v=>v==='red').length} failed
          </div>
        </div>
      </div>

      {/* Eight check cards */}
      <div className="md-health-grid">
        {checks.map(chk => (
          <div key={chk.name} className={`md-health-card ${chk.verdict}`}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
              <div className="md-health-name">{chk.name}</div>
              <span className={`md-verdict ${chk.verdict}`}>{chk.status}</span>
            </div>
            <div className={`md-health-metric ${chk.verdict}`}>{chk.metric}</div>
            <div className="md-health-interp">{chk.interp}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
              <div style={{ fontSize: 8, color: '#8a8170' }}>200-year trend</div>
              {sparkSVG(chk.spark, chk.sparkMax, verdictColor[chk.verdict])}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
