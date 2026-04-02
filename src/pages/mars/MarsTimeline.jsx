import { useColony } from './MarsLayout.jsx'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts'

const CS = {
  backgroundColor: '#0f1520',
  border: '1px solid #1e2a42',
  borderRadius: 2,
  fontSize: 10,
  fontFamily: 'Share Tech Mono, monospace',
  color: '#8899bb',
}

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n/1000).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

export default function MarsTimeline() {
  const data = useColony()
  const annual = data.annual_summaries || []
  const viab   = (data.viability?.rows) || []

  // Derive annual GDP from cumulative (diff year over year)
  const withAnnualGdp = annual.map((r, i) => ({
    ...r,
    annual_gdp: i === 0 ? r.colony_gdp : r.colony_gdp - annual[i-1].colony_gdp,
    infra_pct: Math.round(r.mcc_infra_health * 100),
    avg_bill: viab[i]?.avg_mcc_bill || 0,
    dividends: viab[i]?.total_dividends || 0,
    v_conc: viab[i]?.v_concentration_pct || 0,
  }))

  const charts = [
    {
      title: 'Population',
      keys: [{ key: 'population', color: '#e8a020', name: 'Population' }],
    },
    {
      title: 'Annual GDP (S-tokens)',
      keys: [{ key: 'annual_gdp', color: '#9966ff', name: 'Annual GDP' }],
    },
    {
      title: 'V-Token Pool — Mean & Median',
      keys: [
        { key: 'mean_v',   color: '#4488ff', name: 'Mean' },
        { key: 'median_v', color: '#3dffa0', name: 'Median' },
      ],
    },
    {
      title: 'MCC Infrastructure Health %',
      keys: [{ key: 'infra_pct', color: '#20d4b0', name: 'Health %' }],
      unit: '%', domain: [0, 100],
    },
    {
      title: 'Total Dividends Distributed (V/yr)',
      keys: [{ key: 'dividends', color: '#c8a96e', name: 'Dividends' }],
    },
    {
      title: 'Average MCC Bill (S-tokens)',
      keys: [{ key: 'avg_bill', color: '#ff4d6a', name: 'Avg bill' }],
    },
    {
      title: 'Active Companies',
      keys: [{ key: 'active_companies', color: '#9966ff', name: 'Companies' }],
    },
    {
      title: 'V-Token Concentration — Top Holder %',
      keys: [{ key: 'v_conc', color: '#ff4d6a', name: 'Top holder %' }],
    },
  ]

  return (
    <div>
      <div className="md-label">200-Year Timeline</div>
      <div className="md-grid-2">
        {charts.map(chart => (
          <div key={chart.title} className="md-panel">
            <div className="md-panel-title">{chart.title}</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={withAnnualGdp} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={49} />
                <YAxis
                  tick={{ fontSize: 9, fill: '#4a5878' }}
                  tickFormatter={fmt}
                  width={44}
                  domain={chart.domain}
                  unit={chart.unit}
                />
                <Tooltip contentStyle={CS} formatter={(v, n) => [fmt(v) + (chart.unit||''), n]} />
                {chart.keys.map(k => (
                  <Line key={k.key} type="monotone" dataKey={k.key}
                    stroke={k.color} dot={false} strokeWidth={1.5} name={k.name} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}
