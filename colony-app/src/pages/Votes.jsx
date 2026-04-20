import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'
import { shortAddr } from '../utils/addrLabel'

const ROLES = ['CEO', 'CFO', 'COO']

const GOV_ABI = [
  "function nextId() view returns (uint256)",
  "function elections(uint256) view returns (uint8 role, address candidate, address nominator, uint256 votingEndsAt, uint256 timelockEndsAt, uint256 votesFor, uint256 votesAgainst, bool executed, bool cancelled)",
  "function hasVoted(address, uint256) view returns (bool)",
  "function activeElections() view returns (uint256[])",
  "function roleHolder(uint8) view returns (address holder, uint256 termEnd, bool active)",
  "function nominateForElection(uint8 role, address candidate) external returns (uint256)",
  "function vote(uint256 electionId, bool support) external",
  "function finaliseElection(uint256 electionId) external",
  "function executeElection(uint256 electionId) external",
]

function electionStatus(e, nowSec) {
  if (e.executed)                               return 'EXECUTED'
  if (e.cancelled)                              return 'FAILED'
  if (e.timelockEndsAt > 0 && nowSec >= e.timelockEndsAt) return 'EXECUTE_READY'
  if (e.timelockEndsAt > 0)                     return 'TIMELOCK'
  if (nowSec > e.votingEndsAt)                  return 'FINALISE_READY'
  return 'VOTING'
}

export default function Votes() {
  const { slug } = useParams()
  const { isCitizenOf, provider, signer, address, contracts, onChain } = useWallet()

  const colonyName = onChain?.[slug]?.colonyName || slug
  const isCitizen  = isCitizenOf(slug)

  const govAddress = contracts?.colonies?.[slug]?.governance

  const [elecs, setElecs]           = useState([])
  const [roleHolders, setRoleHolders] = useState([null, null, null])
  const [loading, setLoading]       = useState(true)
  const [actionPending, setActionPending] = useState(null)
  const [actionError, setActionError]   = useState(null)
  const [nominating, setNominating] = useState(false)
  const [newNom, setNewNom]         = useState({ role: 0, candidate: '' })

  async function load() {
    if (!govAddress || !provider) { setLoading(false); return }
    try {
      const rpc = new ethers.JsonRpcProvider('https://base-sepolia-rpc.publicnode.com')
      const gov = new ethers.Contract(govAddress, GOV_ABI, rpc)
      const nowSec = Math.floor(Date.now() / 1000)

      // Load role holders
      const holders = await Promise.all([0, 1, 2].map(r => gov.roleHolder(r)))
      setRoleHolders(holders)

      // Load all elections by iterating nextId
      const nextId = Number(await gov.nextId())
      const loaded = []
      for (let i = 1; i < nextId; i++) {
        const e = await gov.elections(i)
        // If nominator is zero address this slot is an obligation proposal, not an election
        if (e.nominator === ethers.ZeroAddress) continue
        const myVoted = address ? await gov.hasVoted(address, i) : false
        const entry = {
          id: i,
          role:            Number(e.role),
          candidate:       e.candidate,
          nominator:       e.nominator,
          votingEndsAt:    Number(e.votingEndsAt),
          timelockEndsAt:  Number(e.timelockEndsAt),
          votesFor:        Number(e.votesFor),
          votesAgainst:    Number(e.votesAgainst),
          executed:        e.executed,
          cancelled:       e.cancelled,
          myVoted,
        }
        entry.status = electionStatus(entry, nowSec)
        loaded.push(entry)
      }
      setElecs(loaded.reverse())
    } catch (err) {
      console.warn('Votes load error', err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [govAddress, provider, address])

  async function doVote(electionId, support) {
    if (!signer || !govAddress) return
    setActionPending(`vote-${electionId}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.vote(electionId, support)
      await tx.wait()
      await load()
    } catch (e) {
      setActionError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActionPending(null)
  }

  async function doFinalise(electionId) {
    if (!signer || !govAddress) return
    setActionPending(`fin-${electionId}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.finaliseElection(electionId)
      await tx.wait()
      await load()
    } catch (e) {
      setActionError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActionPending(null)
  }

  async function doExecute(electionId) {
    if (!signer || !govAddress) return
    setActionPending(`exec-${electionId}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.executeElection(electionId)
      await tx.wait()
      await load()
    } catch (e) {
      setActionError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActionPending(null)
  }

  async function doNominate() {
    if (!signer || !govAddress) return
    if (!ethers.isAddress(newNom.candidate)) {
      setActionError('Invalid candidate address')
      return
    }
    setActionPending('nominate'); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.nominateForElection(newNom.role, newNom.candidate)
      await tx.wait()
      setNominating(false)
      setNewNom({ role: 0, candidate: '' })
      await load()
    } catch (e) {
      setActionError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActionPending(null)
  }

  const openElecs   = elecs.filter(e => !['EXECUTED', 'FAILED'].includes(e.status))
  const closedElecs = elecs.filter(e =>  ['EXECUTED', 'FAILED'].includes(e.status))

  return (
    <Layout title="Governance" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>
            {colonyName} · MCC ELECTIONS
          </div>
          {isCitizen && (
            <button
              onClick={() => setNominating(v => !v)}
              style={{ fontSize: 11, color: C.gold, background: 'none', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '3px 10px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace" }}
            >
              + Nominate
            </button>
          )}
        </div>

        {/* Current board */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>CURRENT MCC BOARD</div>
          {roleHolders.map((rh, i) => {
            const vacant  = !rh || rh.holder === ethers.ZeroAddress
            const expired = rh && !rh.active && !vacant
            const expDate = rh && !vacant
              ? new Date(Number(rh.termEnd) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : null
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < 2 ? 8 : 0 }}>
                <span style={{ fontSize: 11, color: C.faint, minWidth: 36 }}>{ROLES[i]}</span>
                <span style={{ fontSize: 11, color: expired ? C.red : vacant ? C.faint : C.sub, textAlign: 'right' }}>
                  {vacant
                    ? 'vacant'
                    : `${shortAddr(rh.holder)} · expires ${expDate}${expired ? ' · EXPIRED' : ''}`}
                </span>
              </div>
            )
          })}
        </div>

        {/* Nominate form */}
        {nominating && (
          <div style={{ background: C.white, border: `1px solid ${C.gold}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NOMINATE FOR ELECTION</div>

            <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>Role</div>
            <select
              value={newNom.role}
              onChange={e => setNewNom(p => ({ ...p, role: Number(e.target.value) }))}
              style={{ width: '100%', padding: '9px 10px', background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {ROLES.map((r, i) => (
                <option key={i} value={i} style={{ background: C.bg, color: C.text }}>{r}</option>
              ))}
            </select>

            <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>Candidate address</div>
            <input
              style={{ width: '100%', padding: '9px 10px', background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, marginBottom: 12, outline: 'none', fontFamily: "'IBM Plex Mono', monospace", boxSizing: 'border-box' }}
              placeholder="0x…"
              value={newNom.candidate}
              onChange={e => setNewNom(p => ({ ...p, candidate: e.target.value }))}
            />

            {actionError && (
              <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>{actionError}</div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setNominating(false); setActionError(null) }} style={smallBtn(C.border, C.sub)}>
                Cancel
              </button>
              <button onClick={doNominate} disabled={actionPending === 'nominate'} style={{ ...smallBtn(C.gold, '#0a0e1a'), flex: 1 }}>
                {actionPending === 'nominate' ? 'Submitting…' : 'Nominate →'}
              </button>
            </div>
          </div>
        )}

        {actionError && !nominating && (
          <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{actionError}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>Loading elections…</div>
        )}

        {!loading && elecs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>
            No elections yet. Citizens may nominate candidates for CEO, CFO, or COO.
          </div>
        )}

        {openElecs.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: C.green, letterSpacing: '0.12em', marginBottom: 8, marginTop: 4 }}>OPEN</div>
            {openElecs.map(e => (
              <ElectionCard
                key={e.id}
                election={e}
                isCitizen={isCitizen}
                actionPending={actionPending}
                onVote={doVote}
                onFinalise={doFinalise}
                onExecute={doExecute}
              />
            ))}
          </>
        )}

        {closedElecs.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.12em', marginBottom: 8, marginTop: openElecs.length > 0 ? 12 : 4 }}>HISTORY</div>
            {closedElecs.map(e => (
              <ElectionCard
                key={e.id}
                election={e}
                isCitizen={false}
                actionPending={null}
                onVote={null}
                onFinalise={null}
                onExecute={null}
              />
            ))}
          </>
        )}

      </div>
    </Layout>
  )
}

function ElectionCard({ election, isCitizen, actionPending, onVote, onFinalise, onExecute }) {
  const { id, role, candidate, nominator, votesFor, votesAgainst, myVoted, status, timelockEndsAt } = election
  const totalVotes = votesFor + votesAgainst

  const statusMeta = {
    VOTING:         { label: 'VOTING',           color: C.green  },
    FINALISE_READY: { label: 'AWAITING FINALISE', color: C.gold   },
    TIMELOCK:       { label: 'TIMELOCK',          color: C.blue   },
    EXECUTE_READY:  { label: 'READY TO EXECUTE',  color: C.purple },
    EXECUTED:       { label: 'EXECUTED',          color: C.faint  },
    FAILED:         { label: 'FAILED',            color: C.red    },
  }[status] || { label: status, color: C.faint }

  const timelockDate = timelockEndsAt > 0
    ? new Date(timelockEndsAt * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>

      {/* Top row: role + status badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 9, color: C.purple, border: `1px solid ${C.purple}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
          {ROLES[role]}
        </span>
        <span style={{ fontSize: 9, color: statusMeta.color, border: `1px solid ${statusMeta.color}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
          {statusMeta.label}
        </span>
        {myVoted && (
          <span style={{ fontSize: 9, color: C.green, border: `1px solid ${C.green}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>VOTED</span>
        )}
      </div>

      {/* Candidate + vote tally */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: totalVotes > 0 ? 10 : 0 }}>
        <div>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 3 }}>{shortAddr(candidate)}</div>
          <div style={{ fontSize: 11, color: C.faint }}>Nominated by {shortAddr(nominator)}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 12, color: C.green }}>{votesFor} FOR</div>
          <div style={{ fontSize: 12, color: C.red }}>{votesAgainst} AGAINST</div>
        </div>
      </div>

      {/* Vote bar */}
      {totalVotes > 0 && (
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: C.border, marginBottom: 10 }}>
          <div style={{ width: `${(votesFor / totalVotes) * 100}%`, background: C.green }} />
          <div style={{ width: `${(votesAgainst / totalVotes) * 100}%`, background: C.red }} />
        </div>
      )}

      {timelockDate && status === 'TIMELOCK' && (
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>Timelock expires {timelockDate}</div>
      )}

      {/* Action buttons */}
      {status === 'VOTING' && !myVoted && isCitizen && onVote && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            onClick={() => onVote(id, true)}
            disabled={!!actionPending}
            style={{ ...smallBtn(C.green, '#fff'), flex: 1 }}
          >
            {actionPending === `vote-${id}` ? '…' : 'FOR'}
          </button>
          <button
            onClick={() => onVote(id, false)}
            disabled={!!actionPending}
            style={{ ...smallBtn(C.red, '#fff'), flex: 1 }}
          >
            {actionPending === `vote-${id}` ? '…' : 'AGAINST'}
          </button>
        </div>
      )}
      {status === 'VOTING' && myVoted && (
        <div style={{ fontSize: 12, color: C.green, marginTop: 8 }}>✓ Vote recorded on-chain</div>
      )}
      {status === 'FINALISE_READY' && onFinalise && (
        <button
          onClick={() => onFinalise(id)}
          disabled={!!actionPending}
          style={{ ...smallBtn(C.gold, '#0a0e1a'), marginTop: 10 }}
        >
          {actionPending === `fin-${id}` ? '…' : 'Finalise Election →'}
        </button>
      )}
      {status === 'EXECUTE_READY' && onExecute && (
        <button
          onClick={() => onExecute(id)}
          disabled={!!actionPending}
          style={{ ...smallBtn(C.purple, '#fff'), marginTop: 10 }}
        >
          {actionPending === `exec-${id}` ? '…' : 'Execute →'}
        </button>
      )}
    </div>
  )
}

function smallBtn(bg, color = C.text, border) {
  return {
    padding: '9px 14px',
    background: bg,
    color,
    border: border ? `1px solid ${border}` : 'none',
    borderRadius: 6,
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace",
  }
}
