import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'

import { C } from '../theme'

const TYPE_META = {
  ELECTION:  { label: 'ELECTION',  color: C.purple },
  DIVIDEND:  { label: 'DIVIDEND',  color: C.gold   },
  RECALL:    { label: 'RECALL',    color: C.red     },
  AMENDMENT: { label: 'AMENDMENT', color: C.blue    },
}

const GOV_ABI = [
  "function proposalCount() view returns (uint256)",
  "function getProposal(uint256) view returns (string, string, uint256, bool)",
  "function getOptions(uint256) view returns (string[])",
  "function getVoteCounts(uint256) view returns (uint256[])",
  "function hasVoted(uint256, address) view returns (bool)",
  "function vote(uint256, uint256) external",
  "function createProposal(string, string, string[], uint256) external returns (uint256)",
]

export default function Votes() {
  const { slug }  = useParams()
  const { isCitizenOf, provider, signer, address, contracts, onChain } = useWallet()

  const colonyName = onChain?.[slug]?.colonyName || slug
  const isCitizen  = isCitizenOf(slug)

  const [proposals, setProposals] = useState([])
  const [expanded,  setExpanded]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [voting,    setVoting]    = useState(null)   // proposalId being voted on
  const [voteError, setVoteError] = useState(null)
  const [creating,  setCreating]  = useState(false)
  const [newP, setNewP] = useState({ type: 'ELECTION', description: '', options: ['', ''], days: 7 })
  const [createPending, setCreatePending] = useState(false)

  const govAddress = contracts?.colonies?.[slug]?.governance

  async function loadProposals() {
    if (!govAddress || !provider) { setLoading(false); return }
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, provider)
      const count = Number(await gov.proposalCount())
      const loaded = []
      for (let i = 0; i < count; i++) {
        const [proposalType, description, deadline, isOpen] = await gov.getProposal(i)
        const options    = await gov.getOptions(i)
        const voteCounts = await gov.getVoteCounts(i)
        const myVoted    = address ? await gov.hasVoted(i, address) : false
        loaded.push({
          id: i,
          proposalType,
          description,
          deadline: Number(deadline),
          isOpen,
          options,
          voteCounts: voteCounts.map(Number),
          myVoted,
        })
      }
      setProposals(loaded.reverse()) // newest first
    } catch (e) {
      console.warn('Failed to load proposals', e)
    }
    setLoading(false)
  }

  useEffect(() => { loadProposals() }, [govAddress, provider, address])

  async function castVote(proposalId, optionIndex) {
    if (!signer || !govAddress) return
    setVoting(proposalId); setVoteError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx = await gov.vote(proposalId, optionIndex)
      await tx.wait()
      await loadProposals()
    } catch (e) {
      setVoteError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setVoting(null)
  }

  async function createProposal() {
    if (!signer || !govAddress) return
    setCreatePending(true)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const opts = newP.options.filter(o => o.trim())
      const tx = await gov.createProposal(newP.type, newP.description, opts, newP.days)
      await tx.wait()
      setCreating(false)
      setNewP({ type: 'ELECTION', description: '', options: ['', ''], days: 7 })
      await loadProposals()
    } catch (e) {
      console.error(e)
    }
    setCreatePending(false)
  }

  const open   = proposals.filter(p => p.isOpen)
  const closed = proposals.filter(p => !p.isOpen)

  return (
    <Layout title="Governance" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>
            {colonyName} · {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
          </div>
          {isCitizen && (
            <button
              onClick={() => setCreating(v => !v)}
              style={{ fontSize: 11, color: C.gold, background: 'none', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '3px 10px', cursor: 'pointer' }}
            >
              + Propose
            </button>
          )}
        </div>

        {/* Create proposal form */}
        {creating && (
          <div style={{ background: '#fffbf0', border: `1px solid ${C.gold}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NEW PROPOSAL</div>
            <select
              value={newP.type}
              onChange={e => setNewP(p => ({ ...p, type: e.target.value }))}
              style={{ width: '100%', padding: '9px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, marginBottom: 8, background: C.white }}
            >
              {['ELECTION','DIVIDEND','RECALL','AMENDMENT'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input
              style={{ width: '100%', padding: '9px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, marginBottom: 8, outline: 'none' }}
              placeholder="Description"
              value={newP.description}
              onChange={e => setNewP(p => ({ ...p, description: e.target.value }))}
            />
            {newP.options.map((opt, i) => (
              <input
                key={i}
                style={{ width: '100%', padding: '9px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, marginBottom: 8, outline: 'none' }}
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={e => setNewP(p => ({ ...p, options: p.options.map((o, idx) => idx === i ? e.target.value : o) }))}
              />
            ))}
            <button onClick={() => setNewP(p => ({ ...p, options: [...p.options, ''] }))} style={{ fontSize: 11, color: C.faint, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8 }}>
              + Add option
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setCreating(false)} style={smallBtn(C.faint, '#fff', C.border)}>Cancel</button>
              <button onClick={createProposal} disabled={createPending} style={{ ...smallBtn(C.gold), flex: 1 }}>
                {createPending ? 'Submitting...' : 'Create Proposal →'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>Loading proposals...</div>
        )}

        {!loading && proposals.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>
            No proposals yet. The first MCC election is scheduled for January 2027.
          </div>
        )}

        {voteError && (
          <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{voteError}</div>
        )}

        {open.length > 0 && (
          <>
            <SectionLabel label="OPEN" color={C.green} />
            {open.map(p => (
              <ProposalCard
                key={p.id}
                proposal={p}
                expanded={expanded === p.id}
                onToggle={() => setExpanded(e => e === p.id ? null : p.id)}
                onVote={(optIdx) => castVote(p.id, optIdx)}
                isCitizen={isCitizen}
                isPending={voting === p.id}
              />
            ))}
          </>
        )}

        {closed.length > 0 && (
          <>
            <SectionLabel label="CLOSED" color={C.faint} />
            {closed.map(p => (
              <ProposalCard
                key={p.id}
                proposal={p}
                expanded={expanded === p.id}
                onToggle={() => setExpanded(e => e === p.id ? null : p.id)}
                onVote={null}
                isCitizen={isCitizen}
                isPending={false}
              />
            ))}
          </>
        )}

      </div>
    </Layout>
  )
}

function ProposalCard({ proposal, expanded, onToggle, onVote, isCitizen, isPending }) {
  const meta      = TYPE_META[proposal.proposalType] || TYPE_META.ELECTION
  const totalVotes = proposal.voteCounts.reduce((s, v) => s + v, 0)
  const deadline   = new Date(proposal.deadline * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ background: C.white, border: `1px solid ${expanded ? C.gold : C.border}`, borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ padding: '14px 16px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, color: meta.color, border: `1px solid ${meta.color}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
                {meta.label}
              </span>
              {proposal.myVoted && (
                <span style={{ fontSize: 9, color: C.green, border: `1px solid ${C.green}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>VOTED</span>
              )}
              {!proposal.isOpen && (
                <span style={{ fontSize: 9, color: C.faint, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>CLOSED</span>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{proposal.description}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>
              {proposal.isOpen ? `Closes ${deadline}` : `Closed ${deadline}`} · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </div>
          </div>
          <span style={{ color: C.faint, fontSize: 14, flexShrink: 0 }}>{expanded ? '↑' : '↓'}</span>
        </div>
        {/* Mini bar */}
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 10, background: '#f0f0f0' }}>
          {proposal.voteCounts.map((v, i) => (
            <div key={i} style={{ width: totalVotes > 0 ? `${(v / totalVotes) * 100}%` : 0, background: optColor(i) }} />
          ))}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px' }}>
          {proposal.options.map((opt, i) => {
            const pct = totalVotes > 0 ? Math.round((proposal.voteCounts[i] / totalVotes) * 100) : 0
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.text }}>{opt}</span>
                  <span style={{ fontSize: 12, color: C.faint }}>{proposal.voteCounts[i]} ({pct}%)</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: optColor(i) }} />
                </div>
              </div>
            )
          })}

          <div style={{ fontSize: 11, color: C.faint, marginTop: 8, marginBottom: 12 }}>
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
          </div>

          {proposal.isOpen && !proposal.myVoted && isCitizen && (
            <div>
              <div style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>Cast your vote:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {proposal.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => onVote(i)}
                    disabled={isPending}
                    style={{ padding: '9px 16px', background: optColor(i), color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500, opacity: isPending ? 0.5 : 1 }}
                  >
                    {isPending ? '...' : opt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {proposal.isOpen && proposal.myVoted && (
            <div style={{ fontSize: 12, color: C.green }}>✓ Vote recorded on-chain</div>
          )}
          {proposal.isOpen && !isCitizen && (
            <div style={{ fontSize: 12, color: C.faint }}>Join the colony to participate in governance.</div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ label, color }) {
  return <div style={{ fontSize: 10, color, letterSpacing: '0.12em', marginBottom: 8, marginTop: 4 }}>{label}</div>
}

function optColor(i) {
  return ['#B8860B', '#16a34a', '#8b5cf6', '#3b82f6', '#ef4444'][i % 5]
}

function smallBtn(bg, color = '#fff', border) {
  return { padding: '9px 14px', background: bg, color, border: border ? `1px solid ${border}` : 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }
}
