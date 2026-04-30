import { useColony } from './MarsLayout.jsx'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const CS = {
  backgroundColor: '#11141a', border: '1px solid #232831', borderRadius: 2,
  fontSize: 10, fontFamily: 'Share Tech Mono, monospace', color: '#b8b0a0',
}

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n/1000).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

export default function MarsMCC() {
  const data = useColony()
  const mcc  = data.mcc || []
  const annual = data.annual_summaries || []

  const withPct = mcc.map(r => ({
    ...r,
    infra_pct: Math.round((r.mcc_infra_health || 0) * 100),
    approval_pct: Math.round((r.mcc_approval || 0) * 100),
    board_share_pct_display: Math.round((r.mcc_board_share_pct || 0) * 100),
  }))

  return (
    <div>
      <div className="md-label">Mars Colony Company</div>

      <div className="md-panel" style={{ borderLeft: '3px solid #c8a96e' }}>
        <div className="md-panel-title">What MCC does</div>
        <p style={{ fontSize: 11, color: '#b8b0a0', lineHeight: 1.8, letterSpacing: '0.03em' }}>
          MCC is a company like any other — subject to the same token rules — with one difference:
          every citizen owns exactly one equal non-transferable share. It provides dome integrity,
          atmospheric processing, water recycling, power distribution, and the justice system.
          The board is elected annually. All revenues and costs are published on the blockchain.
        </p>
      </div>

      <div className="md-grid-2">
        <div className="md-panel">
          <div className="md-panel-title">Infrastructure Health · 200 years</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={withPct} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#232831" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#8a8170' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#8a8170' }} domain={[0, 100]} unit="%" width={42} />
              <Tooltip contentStyle={CS} formatter={v => [v + '%', 'Health']} />
              <Line type="monotone" dataKey="infra_pct" stroke="#20d4b0" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">Board Approval · 200 years</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={withPct} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#232831" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#8a8170' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#8a8170' }} domain={[0, 100]} unit="%" width={42} />
              <Tooltip contentStyle={CS} formatter={v => [v + '%', 'Approval']} />
              <Line type="monotone" dataKey="approval_pct" stroke="#9966ff" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">MCC Revenue · 200 years (S-tokens)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={annual} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#232831" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#8a8170' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#8a8170' }} tickFormatter={fmt} width={44} />
              <Tooltip contentStyle={CS} formatter={v => [fmt(v) + ' S', 'Revenue']} />
              <Line type="monotone" dataKey="mcc_revenue" stroke="#c8a96e" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="md-panel">
          <div className="md-panel-title">Board Profit Share % · 200 years</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={withPct} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#232831" strokeDasharray="2 4" />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#8a8170' }} interval={39} />
              <YAxis tick={{ fontSize: 9, fill: '#8a8170' }} domain={[0, 35]} unit="%" width={42} />
              <Tooltip contentStyle={CS} formatter={v => [v + '%', 'Board share']} />
              <Line type="monotone" dataKey="board_share_pct_display" stroke="#ff4d6a" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
