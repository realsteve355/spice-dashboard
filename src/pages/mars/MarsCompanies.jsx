import { useColony } from './MarsLayout.jsx'
import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const CS = {
  backgroundColor: '#0f1520', border: '1px solid #1e2a42', borderRadius: 2,
  fontSize: 10, fontFamily: 'Share Tech Mono, monospace', color: '#8899bb',
}

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n/1000).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

export default function MarsCompanies() {
  const data = useColony()
  const companies = (data.companies || []).filter(c => !c.is_mcc)
  const mcc = (data.companies || []).find(c => c.is_mcc)
  const revenue = data.company_revenue || []
  const [selected, setSelected] = useState(null)

  const sel = selected != null ? companies.find(c => c.id === selected) : null
  const selRevenue = sel
    ? revenue.filter(r => r.company_id === sel.id).map(r => ({ year: r.year, revenue: r.revenue }))
    : []

  return (
    <div>
      <div className="md-label">Company Ecosystem</div>

      {/* ── MCC summary ── */}
      {mcc && (
        <div className="md-panel" style={{ borderLeftColor: '#c8a96e', borderLeftWidth: 3 }}>
          <div className="md-panel-title">Mars Colony Company (MCC) — infrastructure provider</div>
          <table className="md-table">
            <tbody>
              <tr><td>Total lifetime revenue</td><td className="val gold">{fmt(mcc.total_revenue)} S</td></tr>
              <tr><td>Founded</td><td className="val">Year {mcc.founded_year}</td></tr>
              <tr><td>Status</td><td className="val green">Active — citizen owned</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="md-grid-2">
        {/* ── Company list ── */}
        <div className="md-panel">
          <div className="md-panel-title">All Companies — click to inspect</div>
          <table className="md-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sector</th>
                <th style={{ textAlign:'right' }}>Revenue</th>
                <th style={{ textAlign:'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(co => (
                <tr key={co.id} onClick={() => setSelected(co.id === selected ? null : co.id)}
                  style={{ background: co.id === selected ? '#141c2e' : '' }}>
                  <td style={{ color: co.id === selected ? '#c8a96e' : '#e8eaf0' }}>{co.name}</td>
                  <td>{co.sector}</td>
                  <td className="val">{fmt(co.total_revenue)}</td>
                  <td className="val">
                    {co.closed_year
                      ? <span className="red">Closed yr {co.closed_year}</span>
                      : <span className="green">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Selected company detail ── */}
        <div className="md-panel">
          {sel ? (
            <>
              <div className="md-panel-title">{sel.name} — Revenue History</div>
              <table className="md-table" style={{ marginBottom: 16 }}>
                <tbody>
                  <tr><td>Sector</td><td className="val">{sel.sector}</td></tr>
                  <tr><td>Founded</td><td className="val">Year {sel.founded_year}</td></tr>
                  {sel.closed_year && <tr><td>Closed</td><td className="val red">Year {sel.closed_year}</td></tr>}
                  <tr><td>Lifetime revenue</td><td className="val gold">{fmt(sel.total_revenue)} S</td></tr>
                  <tr><td>Total customers</td><td className="val">{fmt(sel.total_customers)}</td></tr>
                </tbody>
              </table>
              {selRevenue.length > 0 && (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={selRevenue} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="#1e2a42" strokeDasharray="2 4" />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#4a5878' }} interval={19} />
                    <YAxis tick={{ fontSize: 9, fill: '#4a5878' }} tickFormatter={fmt} width={44} />
                    <Tooltip contentStyle={CS} formatter={v => [fmt(v) + ' S', 'Revenue']} />
                    <Bar dataKey="revenue" fill="#c8a96e" radius={[1,1,0,0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <div className="mars-loading" style={{ minHeight: 200 }}>
              SELECT A COMPANY
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
