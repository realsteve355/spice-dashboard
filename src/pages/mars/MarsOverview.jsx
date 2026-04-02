import { useColony } from './MarsLayout.jsx'
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
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
  const year   = data.year || 200
  const servicesByYear = data.services_by_year || {}

  if (!annual.length) return <div className="mars-loading">NO DATA</div>

  const snap = annual.find(r => r.year === year) || annual[annual.length - 1]
  const infraColor = snap.mcc_infra_health > 0.7 ? '#3dffa0'
                   : snap.mcc_infra_health > 0.5 ? '#e8a020' : '#ff4d6a'

  // Infra health as percentage for AreaChart
  const infraData = annual.map(r => ({ year: r.year, health: Math.round(r.mcc_infra_health * 100) }))

  // Top services for current year
  const topServices = (servicesByYear[String(year)] || []).slice(0, 8)
  const maxSvcTotal = topServices.length ? topServices[0].total : 1

  return (
    <div>
      {/* ── Stat cards ── */}
      <div className="md-stat-row" style={{ marginBottom: 20 }}>
        <StatCard label="Population"       value={fmt(snap.population)}      sub="active adults"          color="#e8a020" />
        <StatCard label="UBI Payment"      value="1,000 S"                   sub="5-tokens/month · fixed"  color="#3dffa0" />
        <StatCard label="Mean V-Holdings"  value={fmt(snap.mean_v)}          sub="per citizen"             color="#4488ff" />
        <StatCard label="Median V-Holdings" value={fmt(snap.median_v)}       sub="50th percentile"         color="#3dffa0" />
        <StatCard label="Colony GDP"       value={fmt(snap.colony_gdp)}      sub="cumulative"              color="#9966ff" />
        <StatCard label="Active Companies" value={snap.active_companies}     sub="cottage industries"      color="#c8a96e" />
      </div>

      {/* ── Row 1: Infra health + GDP ── */}
      <div className="md-grid-2">
        <div className="md-panel">
          <div className="md-panel-title">MCC Infrastructure Health — {Math.round(snap.mcc_infra_health * 100)}%</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={infraData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="infraGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={infraColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={infraColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} domain={[0, 100]} unit="%" width={38} />
              <Tooltip contentStyle={CS} formatter={v => [v + '%', 'Health']} />
              <ReferenceLine x={year} stroke={infraColor} strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area type="monotone" dataKey="health" stroke={infraColor} fill="url(#infraGrad)"
                strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">Colony Economic Output — Cumulative GDP</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} tickFormatter={fmt} width={44} />
              <Tooltip contentStyle={CS} formatter={v => [fmt(v) + ' S', 'GDP']} />
              <ReferenceLine x={year} stroke="#9966ff" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Line type="monotone" dataKey="colony_gdp" stroke="#9966ff" dot={false}
                strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: V-token pool · Mean/Median · Companies ── */}
      <div className="md-grid-3">
        <div className="md-panel">
          <div className="md-panel-title">V-Token Pool</div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="vtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c8a96e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c8a96e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={49} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} tickFormatter={fmt} width={40} />
              <Tooltip contentStyle={CS} formatter={v => [fmt(v) + ' V', 'Total']} />
              <Area type="monotone" dataKey="total_v_tokens" stroke="#c8a96e" fill="url(#vtGrad)"
                strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">Mean · Median · Max</div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={49} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} tickFormatter={fmt} width={40} />
              <Tooltip contentStyle={CS} formatter={(v, n) => [fmt(v) + ' V', n]} />
              <Line type="monotone" dataKey="mean_v"   stroke="#4488ff" dot={false} strokeWidth={1.5} name="Mean"   isAnimationActive={false} />
              <Line type="monotone" dataKey="median_v" stroke="#3dffa0" dot={false} strokeWidth={1.5} name="Median" isAnimationActive={false} />
              <Line type="monotone" dataKey="max_v"    stroke="#ff4d6a" dot={false} strokeWidth={1}   name="Max"    isAnimationActive={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">Active Companies</div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#9966ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9966ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={49} />
              <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} width={30} />
              <Tooltip contentStyle={CS} formatter={v => [v, 'Companies']} />
              <Area type="monotone" dataKey="active_companies" stroke="#9966ff" fill="url(#coGrad)"
                strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top services this year ── */}
      {topServices.length > 0 && (
        <div className="md-panel">
          <div className="md-panel-title">Top Services This Year</div>
          <div className="md-services">
            {topServices.map(svc => (
              <div key={svc.service_name} className="md-svc-row">
                <div className="md-svc-name">{svc.service_name}</div>
                <div className="md-svc-bar-wrap">
                  <div className="md-svc-bar" style={{ width: `${(svc.total / maxSvcTotal) * 100}%` }} />
                </div>
                <div className="md-svc-val">{fmt(svc.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
