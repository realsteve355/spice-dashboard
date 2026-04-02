import { useColony } from './MarsLayout.jsx'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts'

const CHART_STYLE = {
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

function StatCard({ label, value, sub, color = '#e8eaf0' }) {
  return (
    <div className="md-stat">
      <div className="md-stat-label">{label}</div>
      <div className="md-stat-value" style={{ color }}>{value}</div>
      {sub && <div className="md-stat-sub">{sub}</div>}
    </div>
  )
}

export default function MarsOverview() {
  const data = useColony()
  const annual = data.annual_summaries || []
  const meta   = data.meta || {}
  const [year, setYear] = useState(200)

  if (!annual.length) return <div className="mars-loading">NO DATA</div>

  const snap = annual.find(r => r.year === year) || annual[annual.length - 1]
  const infraColor = snap.mcc_infra_health > 0.7 ? '#3dffa0'
                   : snap.mcc_infra_health > 0.5 ? '#e8a020' : '#ff4d6a'

  return (
    <div>
      {/* ── Header ── */}
      <div className="md-label">Colony Overview — Year {year}</div>

      {/* ── Year slider ── */}
      <div className="md-year-control">
        <span>Year</span>
        <input
          type="range" min={1} max={annual.length}
          value={year} onChange={e => setYear(+e.target.value)}
        />
        <span className="md-year-value">{year}</span>
      </div>

      {/* ── Stat cards ── */}
      <div className="md-stat-row">
        <StatCard label="Population"     value={fmt(snap.population)}      sub="active adults"        color="#e8a020" />
        <StatCard label="UBI"            value="1,000 S"                   sub="per citizen · monthly" color="#3dffa0" />
        <StatCard label="Median savings" value={fmt(snap.median_v) + ' V'} sub="V-tokens per citizen"  color="#4488ff" />
        <StatCard label="Active companies" value={snap.active_companies}   sub="cottage industries"    color="#9966ff" />
        <StatCard label="MCC health"     value={Math.round(snap.mcc_infra_health * 100) + '%'} sub="infrastructure" color={infraColor} />
        <StatCard label="Colony GDP"     value={fmt(snap.colony_gdp)}      sub="cumulative S-tokens"   color="#c8a96e" />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="md-grid-2">
        <div className="md-panel">
          <div className="md-panel-title">Population · 200 years</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} tickFormatter={fmt} width={42} />
              <Tooltip contentStyle={CHART_STYLE} formatter={v => [fmt(v), 'Population']} />
              <Line type="monotone" dataKey="population" stroke="#e8a020" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">MCC Infrastructure Health · 200 years</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={annual.map(r => ({ ...r, health_pct: Math.round(r.mcc_infra_health * 100) }))} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} domain={[0, 100]} unit="%" width={42} />
              <Tooltip contentStyle={CHART_STYLE} formatter={v => [v + '%', 'Health']} />
              <Line type="monotone" dataKey="health_pct" stroke="#20d4b0" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="md-grid-2">
        <div className="md-panel">
          <div className="md-panel-title">V-Token Pool · Mean · Median</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} tickFormatter={fmt} width={42} />
              <Tooltip contentStyle={CHART_STYLE} formatter={(v, n) => [fmt(v), n]} />
              <Line type="monotone" dataKey="mean_v"   stroke="#4488ff" dot={false} strokeWidth={1.5} name="Mean" isAnimationActive={false} />
              <Line type="monotone" dataKey="median_v" stroke="#3dffa0" dot={false} strokeWidth={1.5} name="Median" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">Active Companies · 200 years</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} width={42} />
              <Tooltip contentStyle={CHART_STYLE} formatter={v => [v, 'Companies']} />
              <Line type="monotone" dataKey="active_companies" stroke="#9966ff" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Meta ── */}
      <div className="md-panel">
        <div className="md-panel-title">Simulation Metadata</div>
        <table className="md-table">
          <tbody>
            <tr><td>Simulation run</td><td className="val">{meta.generated_at || '—'}</td></tr>
            <tr><td>Version</td><td className="val">{meta.version || '—'}</td></tr>
            <tr><td>Years simulated</td><td className="val">{meta.simulation_years || '—'}</td></tr>
            <tr><td>Total citizens ever</td><td className="val">{fmt(meta.total_citizens_ever)}</td></tr>
            <tr><td>Total companies ever</td><td className="val">{meta.total_companies_ever || '—'}</td></tr>
            <tr><td>Total transactions</td><td className="val">{fmt(meta.total_transactions)}</td></tr>
            <tr><td>Starting population</td><td className="val">{meta.population_start || '—'}</td></tr>
            <tr><td>Final population</td><td className="val">{meta.population_end || '—'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
