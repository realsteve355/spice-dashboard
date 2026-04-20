import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'
import { shortAddr, namedAddr } from '../utils/addrLabel'

const ROLES = ['CEO', 'CFO', 'COO']
const RPC   = 'https://base-sepolia-rpc.publicnode.com'

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

const CITIZEN_JOINED_TOPIC = ethers.id("CitizenJoined(address,uint256,string)")
const CITIZEN_IFACE = new ethers.Interface([
  "event CitizenJoined(address indexed citizen, uint256 gTokenId, string name)",
])

function electionStatus(e, nowSec) {
  if (e.executed)                                              return 'EXECUTED'
  if (e.cancelled)                                             return 'FAILED'
  if (e.timelockEndsAt > 0 && nowSec >= e.timelockEndsAt)     return 'EXECUTE_READY'
  if (e.timelockEndsAt > 0)                                    return 'TIMELOCK'
  if (nowSec > e.votingEndsAt)                                 return 'FINALISE_READY'
  return 'VOTING'
}

async function fetchCitizens(colonyAddr) {
  const rpc     = new ethers.JsonRpcProvider(RPC)
  const toBlock = await rpc.getBlockNumber()
  const CHUNK   = 9000
  const chunks  = await Promise.all(
    Array.from({ length: 5 }, (_, i) => {
      const chunkTo   = toBlock - i * CHUNK
      const chunkFrom = Math.max(0, chunkTo - CHUNK + 1)
      return rpc.getLogs({
        address:   colonyAddr,
        fromBlock: chunkFrom,
        toBlock:   chunkTo,
        topics:    [CITIZEN_JOINED_TOPIC],
      }).catch(() => [])
    })
  )
  // Parse and deduplicate by address (keep last join event per citizen)
  const map = {}
  for (const log of chunks.flat()) {
    try {
      const { args } = CITIZEN_IFACE.parseLog({ topics: log.topics, data: log.data })
      map[args.citizen.toLowerCase()] = { address: args.citizen, name: args.name }
    } catch {}
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
}

export default function Votes() {
  const { slug } = useParams()
  const { isCitizenOf, provider, signer, address, contracts, onChain } = useWallet()

  const colonyName = onChain?.[slug]?.colonyName || slug
  const isCitizen  = isCitizenOf(slug)
  const colonyAddr = contracts?.colonies?.[slug]?.colony
  const govAddress = contracts?.colonies?.[slug]?.governance

  const [elecs,       setElecs]       = useState([])
  const [citizens,    setCitizens]    = useState([])   // [{ address, name }]
  const [nameMap,     setNameMap]     = useState({})   // addr.lower → name
  const [roleHolders, setRoleHolders] = useState([null, null, null])
  const [loading,     setLoading]     = useState(true)
  const [actionPending, setActionPending] = useState(null)
  const [actionError,   setActionError]   = useState(null)
  const [nominating,  setNominating]  = useState(false)
  const [newNom,      setNewNom]      = useState({ role: 0, candidate: '' })

  async function load() {
    if (!govAddress || !colonyAddr || !provider) { setLoading(false); return }
    try {
      const rpc    = new ethers.JsonRpcProvider(RPC)
      const gov    = new ethers.Contract(govAddress, GOV_ABI, rpc)
      const nowSec = Math.floor(Date.now() / 1000)

      // Load role holders and citizen list in parallel
      const [holders, citizenList] = await Promise.all([
        Promise.all([0, 1, 2].map(r => gov.roleHolder(r))),
        fetchCitizens(colonyAddr),
      ])
      setRoleHolders(holders)
      setCitizens(citizenList)
      const nm = Object.fromEntries(citizenList.map(c => [c.address.toLowerCase(), c.name]))
      setNameMap(nm)

      // Load all elections by iterating nextId
      const nextId = Number(await gov.nextId())
      const loaded = []
      for (let i = 1; i < nextId; i++) {
        const e = await gov.elections(i)
        // Skip obligation proposal slots (nominator == zero address)
        if (e.nominator === ethers.ZeroAddress) continue
        const myVoted = address ? await gov.hasVoted(address, i) : false
        const entry = {
          id:             i,
          role:           Number(e.role),
          candidate:      e.candidate,
          nominator:      e.nominator,
          votingEndsAt:   Number(e.votingEndsAt),
          timelockEndsAt: Number(e.timelockEndsAt),
          votesFor:       Number(e.votesFor),
          votesAgainst:   Number(e.votesAgainst),
          executed:       e.executed,
          cancelled:      e.cancelled,
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

  useEffect(() => { load() }, [govAddress, colonyAddr, provider, address])

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
      setActionError('Select a candidate')
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
              style={ghostBtn(C.gold)}
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
            const holderName = rh && !vacant ? nameMap[rh.holder.toLowerCase()] : null
            const expDate = rh && !vacant
              ? new Date(Number(rh.termEnd) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : null
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < 2 ? 8 : 0 }}>
                <span style={{ fontSize: 11, color: C.faint, minWidth: 36 }}>{ROLES[i]}</span>
                <span style={{ fontSize: 11, color: expired ? C.red : vacant ? C.faint : C.sub, textAlign: 'right' }}>
                  {vacant
                    ? 'vacant'
                    : `${holderName || shortAddr(rh.holder)} · expires ${expDate}${expired ? ' · EXPIRED' : ''}`}
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
              style={selectStyle}
            >
              {ROLES.map((r, i) => (
                <option key={i} value={i} style={{ background: C.bg, color: C.text }}>{r}</option>
              ))}
            </select>

            <div style={{ fontSize: 11, color: C.faint, marginBottom: 4, marginTop: 12 }}>Candidate</div>
            {citizens.length > 0 ? (
              <select
                value={newNom.candidate}
                onChange={e => setNewNom(p => ({ ...p, candidate: e.target.value }))}
                style={selectStyle}
              >
                <option value="" style={{ background: C.bg, color: C.faint }}>— select a citizen —</option>
                {citizens.map(c => (
                  <option key={c.address} value={c.address} style={{ background: C.bg, color: C.text }}>
                    {c.name} · {shortAddr(c.address)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                style={inputStyle}
                placeholder="0x…"
                value={newNom.candidate}
                onChange={e => setNewNom(p => ({ ...p, candidate: e.target.value }))}
              />
            )}

            {actionError && (
              <div style={{ fontSize: 11, color: C.red, marginTop: 8 }}>{actionError}</div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setNominating(false); setActionError(null) }} style={smallBtn(C.border, C.sub)}>
                Cancel
              </button>
              <button
                onClick={doNominate}
                disabled={actionPending === 'nominate' || !newNom.candidate}
                style={{ ...smallBtn(C.gold, '#0a0e1a'), flex: 1, opacity: !newNom.candidate ? 0.5 : 1 }}
              >
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
                nameMap={nameMap}
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
                nameMap={nameMap}
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

function ElectionCard({ election, nameMap, isCitizen, actionPending, onVote, onFinalise, onExecute }) {
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

  const candidateName = nameMap[candidate?.toLowerCase()] || shortAddr(candidate)
  const nominatorName = nameMap[nominator?.toLowerCase()] || shortAddr(nominator)

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>

      {/* Role + status badges */}
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

      {/* Candidate + tally */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: totalVotes > 0 ? 10 : 0 }}>
        <div>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 500, marginBottom: 3 }}>{candidateName}</div>
          <div style={{ fontSize: 11, color: C.faint }}>Nominated by {nominatorName}</div>
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

// ── Shared styles ─────────────────────────────────────────────────────────────

const selectStyle = {
  width: '100%',
  padding: '9px 10px',
  background: C.bg,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "'IBM Plex Mono', monospace",
}

const inputStyle = {
  width: '100%',
  padding: '9px 10px',
  background: C.bg,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  fontSize: 12,
  outline: 'none',
  fontFamily: "'IBM Plex Mono', monospace",
  boxSizing: 'border-box',
}

function ghostBtn(color) {
  return { fontSize: 11, color, background: 'none', border: `1px solid ${color}`, borderRadius: 10, padding: '3px 10px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace" }
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
