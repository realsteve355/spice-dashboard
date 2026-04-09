import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { MOCK_VOTES, MOCK_COLONIES } from '../data/mock'
import { useWallet } from '../App'

const C = {
  gold:   '#B8860B',
  border: '#e2e2e2',
  white:  '#ffffff',
  text:   '#111',
  sub:    '#555',
  faint:  '#aaa',
  bg:     '#f5f5f5',
  green:  '#16a34a',
  red:    '#ef4444',
  purple: '#8b5cf6',
  blue:   '#3b82f6',
}

const TYPE_META = {
  election: { label: 'ELECTION',   color: C.purple },
  dividend: { label: 'DIVIDEND',   color: C.gold   },
  recall:   { label: 'RECALL',     color: C.red    },
  amendment:{ label: 'AMENDMENT',  color: C.blue   },
}

export default function Votes() {
  const { slug }  = useParams()
  const { isCitizenOf } = useWallet()

  const colony    = MOCK_COLONIES.find(c => c.id === slug)
  const isCitizen = isCitizenOf(slug)

  const [votes, setVotes]       = useState(MOCK_VOTES[slug] || [])
  const [expanded, setExpanded] = useState(null)

  const open   = votes.filter(v => v.status === 'open')
  const closed = votes.filter(v => v.status === 'closed')

  function castVote(voteId, optionId) {
    setVotes(vs => vs.map(v =>
      v.id === voteId
        ? {
            ...v,
            yourVote: optionId,
            totalVoted: v.yourVote === null ? v.totalVoted + 1 : v.totalVoted,
            options: v.options.map(o =>
              o.id === optionId ? { ...o, votes: o.votes + 1 } : o
            ),
          }
        : v
    ))
  }

  return (
    <Layout title="Governance" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Colony header */}
        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 16 }}>
          {colony?.name} · {votes.length} vote{votes.length !== 1 ? 's' : ''}
        </div>

        {votes.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>
            No votes yet. The first MCC election is scheduled for January 2027.
          </div>
        )}

        {/* Open votes */}
        {open.length > 0 && (
          <>
            <SectionLabel label="OPEN" color={C.green} />
            {open.map(vote => (
              <VoteCard
                key={vote.id}
                vote={vote}
                expanded={expanded === vote.id}
                onToggle={() => setExpanded(e => e === vote.id ? null : vote.id)}
                onVote={(optId) => castVote(vote.id, optId)}
                isCitizen={isCitizen}
              />
            ))}
          </>
        )}

        {/* Closed votes */}
        {closed.length > 0 && (
          <>
            <SectionLabel label="CLOSED" color={C.faint} />
            {closed.map(vote => (
              <VoteCard
                key={vote.id}
                vote={vote}
                expanded={expanded === vote.id}
                onToggle={() => setExpanded(e => e === vote.id ? null : vote.id)}
                onVote={null}
                isCitizen={isCitizen}
              />
            ))}
          </>
        )}

      </div>
    </Layout>
  )
}

function VoteCard({ vote, expanded, onToggle, onVote, isCitizen }) {
  const meta    = TYPE_META[vote.type] || TYPE_META.election
  const hasVoted = vote.yourVote !== null
  const totalV   = vote.totalVoted
  const winner   = vote.status === 'closed'
    ? [...vote.options].sort((a, b) => b.votes - a.votes)[0]
    : null

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${expanded ? C.gold : C.border}`,
      borderRadius: 8, marginBottom: 10, overflow: 'hidden',
    }}>
      {/* Card header — always visible */}
      <div
        onClick={onToggle}
        style={{ padding: '14px 16px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 9, color: meta.color, border: `1px solid ${meta.color}`,
                borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em', flexShrink: 0,
              }}>
                {meta.label}
              </span>
              {hasVoted && (
                <span style={{ fontSize: 9, color: C.green, border: `1px solid ${C.green}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
                  VOTED
                </span>
              )}
              {vote.status === 'closed' && (
                <span style={{ fontSize: 9, color: C.faint, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
                  CLOSED
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{vote.title}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>
              {vote.status === 'open' ? `Closes ${vote.deadline}` : `Closed ${vote.deadline}`}
              {' · '}{totalV} of {vote.totalEligible} voted
            </div>
          </div>
          <span style={{ color: C.faint, fontSize: 14, flexShrink: 0, marginTop: 2 }}>
            {expanded ? '↑' : '↓'}
          </span>
        </div>

        {/* Mini progress bar (always visible) */}
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 10, background: '#f0f0f0' }}>
          {vote.options.map((opt, i) => {
            const pct = totalV > 0 ? (opt.votes / vote.totalEligible) * 100 : 0
            return <div key={opt.id} style={{ width: `${pct}%`, background: optColor(i) }} />
          })}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 14 }}>
            {vote.description}
          </div>

          {/* Options */}
          {vote.options.map((opt, i) => {
            const pct      = totalV > 0 ? Math.round((opt.votes / totalV) * 100) : 0
            const isYours  = vote.yourVote === opt.id
            const isWinner = winner?.id === opt.id

            return (
              <div key={opt.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: isYours ? C.gold : C.text, fontWeight: isYours ? 600 : 400 }}>
                      {opt.label}
                    </span>
                    {isYours  && <span style={{ fontSize: 9, color: C.gold }}>YOUR VOTE</span>}
                    {isWinner && vote.status === 'closed' && <span style={{ fontSize: 9, color: C.green }}>PASSED</span>}
                  </div>
                  <span style={{ fontSize: 12, color: C.faint }}>{opt.votes} ({pct}%)</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: isYours ? C.gold : optColor(i) }} />
                </div>
              </div>
            )
          })}

          {/* Quorum info */}
          <div style={{ fontSize: 11, color: C.faint, marginTop: 8, marginBottom: 12 }}>
            {totalV} of {vote.totalEligible} G-tokens cast · {Math.round((totalV / vote.totalEligible) * 100)}% participation
          </div>

          {/* Vote buttons (open votes, not yet voted, is citizen) */}
          {vote.status === 'open' && !hasVoted && isCitizen && (
            <div>
              <div style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>Cast your vote:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {vote.options.map((opt, i) => (
                  <button
                    key={opt.id}
                    onClick={() => onVote(opt.id)}
                    style={{
                      padding: '9px 16px',
                      background: optColor(i), color: '#fff',
                      border: 'none', borderRadius: 6,
                      fontSize: 12, cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {vote.status === 'open' && hasVoted && (
            <div style={{ fontSize: 12, color: C.green }}>
              ✓ Vote recorded on-chain
            </div>
          )}

          {vote.status === 'open' && !isCitizen && (
            <div style={{ fontSize: 12, color: C.faint }}>
              Join the colony to participate in governance.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ label, color }) {
  return (
    <div style={{ fontSize: 10, color, letterSpacing: '0.12em', marginBottom: 8, marginTop: 4 }}>
      {label}
    </div>
  )
}

function optColor(i) {
  return ['#B8860B', '#16a34a', '#8b5cf6', '#3b82f6', '#ef4444'][i % 5]
}
