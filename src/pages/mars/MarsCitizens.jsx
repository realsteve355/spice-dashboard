import { useColony } from './MarsLayout.jsx'
import { useState } from 'react'
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

export default function MarsCitizens() {
  const data = useColony()
  const citizens = data.citizens || []
  const snapshots = data.citizen_snapshots || []
  const stories   = data.life_stories || {}
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('stories') // 'stories' | 'all'

  const displayList = filter === 'stories'
    ? citizens.filter(c => stories[String(c.id)])
    : citizens.slice(0, 100)

  const sel = selected != null ? citizens.find(c => c.id === selected) : null
  const selSnaps = sel
    ? snapshots.filter(s => s.citizen_id === sel.id).sort((a,b) => a.year - b.year)
    : []
  const story = sel ? stories[String(sel.id)] : null

  return (
    <div>
      <div className="md-label">Citizens</div>

      <div className="md-grid-2">
        {/* ── Left: citizen list ── */}
        <div className="md-panel" style={{ maxHeight: 600, overflowY: 'auto' }}>
          <div className="md-panel-title">
            <span
              style={{ cursor:'pointer', color: filter==='stories' ? '#c8a96e' : '#8a8170', marginRight: 16 }}
              onClick={() => { setSelected(null); setFilter('stories') }}
            >
              Life Stories ({Object.keys(stories).length})
            </span>
            <span
              style={{ cursor:'pointer', color: filter==='all' ? '#c8a96e' : '#8a8170' }}
              onClick={() => { setSelected(null); setFilter('all') }}
            >
              All Citizens (first 100)
            </span>
          </div>
          <div className="md-citizen-grid">
            {displayList.map(c => (
              <div
                key={c.id}
                className="md-citizen-card"
                style={{ borderColor: c.id === selected ? '#c8a96e' : '' }}
                onClick={() => setSelected(c.id === selected ? null : c.id)}
              >
                <div className="md-citizen-name">{c.name}</div>
                <div className="md-citizen-prof">
                  {c.profession || 'Citizen'}{c.is_board_member ? ' · MCC Board' : ''}
                </div>
                <div className="md-citizen-v">{fmt(c.final_v_tokens)} V</div>
                <div style={{ fontSize: 9, color: '#8a8170', marginTop: 4 }}>
                  {c.death_year
                    ? `Yr ${c.birth_year < 1 ? 1 : c.birth_year} – Yr ${c.death_year}`
                    : `Born Yr ${c.birth_year < 1 ? 1 : c.birth_year}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: selected citizen detail ── */}
        <div>
          {sel ? (
            <>
              {/* V-token wealth chart */}
              <div className="md-panel">
                <div className="md-panel-title">{sel.name} — V-Token Wealth</div>
                {selSnaps.length > 1 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={selSnaps} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke="#232831" strokeDasharray="2 4" />
                      <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#8a8170' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#8a8170' }} tickFormatter={fmt} width={44} />
                      <Tooltip contentStyle={CS} formatter={v => [fmt(v) + ' V', 'Savings']} />
                      <Line type="monotone" dataKey="v_tokens" stroke="#c8a96e" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="mars-loading" style={{ minHeight: 80 }}>NO SNAPSHOT DATA</div>
                )}
              </div>

              {/* Stats */}
              <div className="md-panel">
                <div className="md-panel-title">Summary</div>
                <table className="md-table">
                  <tbody>
                    <tr><td>Profession</td><td className="val">{sel.profession || '—'}</td></tr>
                    <tr><td>MCC Board</td><td className="val">{sel.is_board_member ? 'Yes' : 'No'}</td></tr>
                    <tr><td>Peak V-tokens</td><td className="val gold">{fmt(story?.summary?.peak_v_tokens)} V</td></tr>
                    <tr><td>Total dividends</td><td className="val">{fmt(story?.summary?.total_dividends_received)} V</td></tr>
                    <tr><td>Total MCC paid</td><td className="val">{fmt(story?.summary?.total_mcc_paid)} S</td></tr>
                    <tr><td>Years in colony</td><td className="val">{story?.summary?.years_lived_in_colony || '—'}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Life events */}
              {story?.key_events?.length > 0 && (
                <div className="md-panel">
                  <div className="md-panel-title">Key Life Events</div>
                  {story.key_events.map((ev, i) => (
                    <div key={i} className="md-event-row">
                      <span className="md-event-year">Yr {ev.year}</span>
                      <span className="md-event-text">{ev.event}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="md-panel mars-loading" style={{ minHeight: 300 }}>
              SELECT A CITIZEN
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
