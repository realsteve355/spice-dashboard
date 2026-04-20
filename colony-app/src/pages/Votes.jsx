import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'
import { shortAddr } from '../utils/addrLabel'
import { fetchCitizens } from '../utils/fetchCitizens'

const ROLES = ['CEO', 'CFO', 'COO']
const RPC   = 'https://base-sepolia-rpc.publicnode.com'

const GOV_ABI = [
  "function nextId() view returns (uint256)",
  "function elections(uint256) view returns (uint8 role, address openedBy, uint256 openedAt, uint256 nominationEndsAt, uint256 votingEndsAt, uint256 timelockEndsAt, address winner, bool executed, bool cancelled)",
  "function getCandidates(uint256) view returns (address[])",
  "function getCandidateVotes(uint256, address) view returns (uint256)",
  "function hasVoted(address, uint256) view returns (bool)",
  "function roleHolder(uint8) view returns (address holder, uint256 termEnd, bool active)",
  "function openElection(uint8 role) external returns (uint256)",
  "function nominateCandidate(uint256 electionId, address candidate) external",
  "function vote(uint256 electionId, address candidate) external",
  "function finaliseElection(uint256 electionId) external",
  "function executeElection(uint256 electionId) external",
  "function resign(uint8 role) external",
]

function electionStatus(e, nowSec) {
  if (e.executed)                                                  return 'EXECUTED'
  if (e.cancelled)                                                 return 'FAILED'
  if (e.timelockEndsAt > 0 && nowSec >= e.timelockEndsAt)         return 'EXECUTE_READY'
  if (e.timelockEndsAt > 0)                                        return 'TIMELOCK'
  if (nowSec > e.votingEndsAt)                                     return 'FINALISE_READY'
  if (nowSec > e.nominationEndsAt)                                 return 'VOTING'
  return 'NOMINATING'
}

// Decode Base Sepolia / MetaMask revert reasons robustly
function govErr(e) {
  // Walk every path ethers.js v6 + MetaMask might put the reason
  const paths = [
    e?.reason,
    e?.shortMessage,
    e?.cause?.reason,
    e?.cause?.shortMessage,
    e?.cause?.message,
    e?.error?.reason,
    e?.error?.shortMessage,
    e?.error?.message,
    e?.info?.error?.message,
    e?.info?.error?.data?.message,   // MetaMask nested path
    e?.info?.error?.data,
    e?.data,
  ]
  for (const p of paths) {
    if (typeof p === 'string' && p.length > 0 && !p.startsWith('0x')) {
      const stripped = p.replace(/^.*execution reverted:\s*/i, '').trim()
      if (stripped.length > 0 && stripped !== 'execution reverted') return stripped
    }
  }
  // Try to ABI-decode a 0x08c379a0 revert string from any hex data field
  for (const p of [e?.data, e?.info?.error?.data]) {
    if (typeof p === 'string' && p.startsWith('0x08c379a0')) {
      try {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['string'], '0x' + p.slice(10))
        if (decoded[0]) return decoded[0]
      } catch {}
    }
  }
  // Log full error so we can see the structure in the browser console
  console.error('[govErr] full error object:', e)
  return e?.message || 'Transaction failed'
}

export default function Votes() {
  const { slug } = useParams()
  const { isCitizenOf, provider, signer, address, contracts, onChain } = useWallet()

  const colonyName = onChain?.[slug]?.colonyName || slug
  const isCitizen  = isCitizenOf(slug)
  const colonyAddr = contracts?.colonies?.[slug]?.colony
  const govAddress = contracts?.colonies?.[slug]?.governance

  const [elecs,         setElecs]         = useState([])
  const [citizens,      setCitizens]      = useState([])
  const [nameMap,       setNameMap]       = useState({})
  const [roleHolders,   setRoleHolders]   = useState([null, null, null])
  const [loading,       setLoading]       = useState(true)
  const [actionPending, setActionPending] = useState(null)
  const [actionError,   setActionError]   = useState(null)

  // Nominate form
  const [nomElecId,    setNomElecId]    = useState(null)
  const [nomCandidate, setNomCandidate] = useState('')

  const GAS = { gasLimit: 300000 }
  const COLONY_ABI_CITIZEN = ["function isCitizen(address) view returns (bool)"]

  // Pre-flight citizen check — gives a clear message before wasting a MetaMask popup
  async function guardCitizen() {
    if (!signer || !colonyAddr || !address) return false
    try {
      const colony = new ethers.Contract(colonyAddr, COLONY_ABI_CITIZEN, signer)
      const ok = await colony.isCitizen(address)
      if (!ok) { setActionError('You are not registered as a citizen of this colony. Join the colony first.'); return false }
    } catch { /* if the check itself fails, let the tx proceed and show the real error */ }
    return true
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  async function loadFull(govContract) {
    const nowSec = Math.floor(Date.now() / 1000)
    const holders = await Promise.all([0, 1, 2].map(r => govContract.roleHolder(r)))
    setRoleHolders(holders)

    const nextId = Number(await govContract.nextId())
    const loaded = []
    for (let i = 1; i < nextId; i++) {
      const e = await govContract.elections(i)
      if (e.openedBy === ethers.ZeroAddress) continue
      const [rawCandidates, myVoted] = await Promise.all([
        govContract.getCandidates(i),
        address ? govContract.hasVoted(address, i) : Promise.resolve(false),
      ])
      const candidateData = await Promise.all(
        rawCandidates.map(async addr => ({
          address: addr,
          votes: Number(await govContract.getCandidateVotes(i, addr)),
        }))
      )
      const entry = {
        id:               i,
        role:             Number(e.role),
        openedBy:         e.openedBy,
        openedAt:         Number(e.openedAt),
        nominationEndsAt: Number(e.nominationEndsAt),
        votingEndsAt:     Number(e.votingEndsAt),
        timelockEndsAt:   Number(e.timelockEndsAt),
        winner:           e.winner,
        executed:         e.executed,
        cancelled:        e.cancelled,
        candidates:       candidateData,
        myVoted,
        myVotedFor:       null,
      }
      entry.status = electionStatus(entry, nowSec)
      loaded.push(entry)
    }
    return loaded.reverse()
  }

  function applyCitizens(citizenList) {
    if (citizenList.length > 0) {
      setCitizens(citizenList)
      setNameMap(Object.fromEntries(citizenList.map(c => [c.address.toLowerCase(), c.name])))
    }
  }

  async function load() {
    if (!govAddress || !colonyAddr || !provider) { setLoading(false); return }
    // Fetch citizens independently — a loadFull failure must not suppress citizen names
    fetchCitizens(colonyAddr).then(applyCitizens).catch(() => {})
    try {
      // Prefer MetaMask signer (always latest block) over public RPC which can lag by minutes
      const readProv = signer ?? new ethers.JsonRpcProvider(RPC)
      const gov = new ethers.Contract(govAddress, GOV_ABI, readProv)
      const loaded = await loadFull(gov)
      setElecs(prev => mergeElecs(prev, loaded))
    } catch (err) {
      console.warn('Votes load error', err)
    }
    setLoading(false)
  }

  // After writes, re-read via signer (MetaMask provider — always current)
  async function loadAfterWrite() {
    if (!signer || !govAddress) return
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const loaded = await loadFull(gov)
      setElecs(prev => mergeElecs(prev, loaded))
      const holders = await Promise.all([0, 1, 2].map(r => gov.roleHolder(r)))
      setRoleHolders(holders)
    } catch (err) {
      console.warn('loadAfterWrite error', err)
    }
  }

  function mergeElecs(prev, next) {
    const nextMap = Object.fromEntries(next.map(e => [e.id, e]))
    // Update elections we have fresh data for.
    // myVoted is ALWAYS taken from the fresh chain read — preserving it from prev
    // would carry the current account's vote status onto a different MetaMask account.
    const result = next.map(e => ({ ...e }))
    // Keep elections from prev that weren't in this read — signer may lag briefly
    for (const e of prev) {
      if (!nextMap[e.id]) result.push(e)
    }
    return result.sort((a, b) => b.id - a.id)
  }

  useEffect(() => { load() }, [govAddress, colonyAddr, provider, signer, address])

  // Retry citizen fetch when nominate form opens in case initial load was empty
  useEffect(() => {
    if (nomElecId && citizens.length === 0 && colonyAddr) {
      fetchCitizens(colonyAddr).then(applyCitizens).catch(() => {})
    }
  }, [nomElecId])

  // Refresh statuses every 20s
  useEffect(() => {
    const t = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000)
      setElecs(prev => prev.map(e => ({ ...e, status: electionStatus(e, nowSec) })))
    }, 20000)
    return () => clearInterval(t)
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  async function doOpenElection(roleIdx) {
    if (!signer || !govAddress) return
    setActionPending(`open-${roleIdx}`); setActionError(null)
    if (!await guardCitizen()) { setActionPending(null); return }
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx      = await gov.openElection(roleIdx, GAS)
      const receipt = await tx.wait()
      // Parse new election from receipt for optimistic update
      const iface = new ethers.Interface([
        "event ElectionOpened(uint256 indexed id, uint8 indexed role, address indexed openedBy)"
      ])
      let newId = null
      for (const log of receipt.logs) {
        try {
          const p = iface.parseLog(log)
          if (p?.name === 'ElectionOpened') { newId = Number(p.args.id); break }
        } catch {}
      }
      if (newId !== null) {
        const e = await gov.elections(newId)
        if (e.openedBy !== ethers.ZeroAddress) {
          const nowSec = Math.floor(Date.now() / 1000)
          const nomEnd = Number(e.nominationEndsAt)
          const entry  = {
            id: newId, role: Number(e.role), openedBy: e.openedBy,
            openedAt: Number(e.openedAt), nominationEndsAt: nomEnd,
            votingEndsAt: nomEnd + 30 * 60, timelockEndsAt: 0,
            winner: ethers.ZeroAddress, executed: false, cancelled: false,
            candidates: [], myVoted: false, myVotedFor: null,
          }
          entry.status = electionStatus(entry, nowSec)
          setElecs(prev => [entry, ...prev.filter(x => x.id !== newId)])
        }
      }
      // Also mark any FINALISE_READY election for this role as cancelled (auto-finalised by contract)
      setElecs(prev => prev.map(e =>
        e.role === roleIdx && e.status === 'FINALISE_READY'
          ? { ...e, cancelled: true, status: 'FAILED' }
          : e
      ))
      setTimeout(() => loadAfterWrite(), 3000)
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  async function doNominate() {
    if (!signer || !govAddress || !nomElecId) return
    if (!ethers.isAddress(nomCandidate)) { setActionError('Enter a valid wallet address'); return }
    setActionPending(`nom-${nomElecId}`); setActionError(null)
    if (!await guardCitizen()) { setActionPending(null); return }
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.nominateCandidate(nomElecId, nomCandidate, GAS)
      await tx.wait()
      setNomElecId(null); setNomCandidate('')
      await loadAfterWrite()
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  async function doVote(electionId, candidate) {
    if (!signer || !govAddress) return
    setActionPending(`vote-${electionId}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.vote(electionId, candidate, GAS)
      await tx.wait()
      setElecs(prev => prev.map(e => e.id === electionId ? {
        ...e, myVoted: true, myVotedFor: candidate,
        candidates: e.candidates.map(c =>
          c.address.toLowerCase() === candidate.toLowerCase() ? { ...c, votes: c.votes + 1 } : c
        ),
      } : e))
      loadAfterWrite()
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  async function doFinalise(electionId) {
    if (!signer || !govAddress) return
    setActionPending(`fin-${electionId}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.finaliseElection(electionId, GAS)
      await tx.wait()
      await loadAfterWrite()
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  async function doExecute(electionId) {
    if (!signer || !govAddress) return
    setActionPending(`exec-${electionId}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.executeElection(electionId, GAS)
      await tx.wait()
      await loadAfterWrite()
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  async function doResign(roleIdx) {
    if (!signer || !govAddress) return
    setActionPending(`resign-${roleIdx}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.resign(roleIdx, GAS)
      await tx.wait()
      await loadAfterWrite()
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const byRole = ROLES.map((_, i) =>
    elecs.filter(e => e.role === i && e.openedBy !== ethers.ZeroAddress)
  )

  const fmtTime = ts => ts
    ? new Date(ts * 1000).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '—'

  function countdown(ts) {
    const secs = ts - Math.floor(Date.now() / 1000)
    if (secs <= 0) return null
    const m = Math.floor(secs / 60), s = secs % 60
    const h = Math.floor(m / 60), mm = m % 60
    if (h > 0) return `${h}h ${mm}m remaining`
    return `${m}m ${s}s remaining`
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout title="Governance" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 40px' }}>

        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
          {colonyName} · MCC ELECTIONS
        </div>

        {/* Current board */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>CURRENT MCC BOARD</div>
          {roleHolders.map((rh, i) => {
            const vacant     = !rh || rh.holder === ethers.ZeroAddress
            const expired    = rh && !rh.active && !vacant
            const holderName = rh && !vacant ? (nameMap[rh.holder.toLowerCase()] || shortAddr(rh.holder)) : null
            const expDate    = rh && !vacant
              ? new Date(Number(rh.termEnd) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : null
            const isHolder   = rh && !vacant && address && rh.holder.toLowerCase() === address.toLowerCase()
            // Only show "Open election" when no active (non-terminal) election exists for this role
            const activeElec = byRole[i]?.find(e => !['EXECUTED', 'FAILED'].includes(e.status))
            const canOpen    = isCitizen && !activeElec
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < 2 ? 10 : 0, marginBottom: i < 2 ? 10 : 0, borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: 11, color: C.faint, minWidth: 36 }}>{ROLES[i]}</span>
                <div style={{ flex: 1, padding: '0 12px', fontSize: 11, color: expired ? C.red : vacant ? C.faint : C.sub }}>
                  {vacant ? 'vacant'
                    : `${holderName} · expires ${expDate}${expired ? ' · EXPIRED' : ''}`}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {canOpen && (
                    <button
                      onClick={() => doOpenElection(i)}
                      disabled={!!actionPending}
                      style={tinyBtn(C.gold, '#0a0e1a')}
                    >
                      {actionPending === `open-${i}` ? '…' : 'Open election'}
                    </button>
                  )}
                  {isHolder && (
                    <button
                      onClick={() => doResign(i)}
                      disabled={!!actionPending}
                      style={{ ...tinyBtn(C.red, '#fff'), opacity: actionPending === `resign-${i}` ? 0.5 : 1 }}
                    >
                      {actionPending === `resign-${i}` ? '…' : 'Resign'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Error */}
        {actionError && (
          <div style={{ background: '#fff5f5', border: `1px solid ${C.red}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: C.red }}>
            {actionError}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>Loading elections…</div>
        )}

        {/* Nominate form */}
        {nomElecId && (
          <div style={{ background: '#fffbf0', border: `1px solid ${C.gold}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NOMINATE A CANDIDATE</div>
            <div style={{ fontSize: 11, color: C.faint, marginBottom: 6 }}>Select citizen</div>
            {citizens.length > 0 && (
              <select
                value={nomCandidate}
                onChange={e => { setNomCandidate(e.target.value); setActionError(null) }}
                style={{ ...selectStyle, marginBottom: 8 }}
              >
                <option value="">— select a citizen —</option>
                {citizens
                  .filter(c => {
                    const elec = elecs.find(e => e.id === nomElecId)
                    return !elec?.candidates.some(cd => cd.address.toLowerCase() === c.address.toLowerCase())
                  })
                  .map(c => (
                    <option key={c.address} value={c.address}>
                      {c.name}
                    </option>
                  ))
                }
              </select>
            )}
            <input
              value={nomCandidate}
              onChange={e => { setNomCandidate(e.target.value); setActionError(null) }}
              placeholder={citizens.length > 0 ? 'or paste wallet address…' : '0x… wallet address'}
              style={{ ...selectStyle, outline: 'none', boxSizing: 'border-box', background: C.white }}
            />
            {actionError && <div style={{ fontSize: 11, color: C.red, marginTop: 8 }}>{actionError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setNomElecId(null); setNomCandidate(''); setActionError(null) }}
                style={smallBtn(C.border, C.sub)}>Cancel</button>
              <button
                onClick={doNominate}
                disabled={!!actionPending || !nomCandidate}
                style={{ ...smallBtn(C.gold, '#0a0e1a'), flex: 1, opacity: !nomCandidate ? 0.5 : 1 }}
              >
                {actionPending === `nom-${nomElecId}` ? 'Submitting…' : 'Nominate →'}
              </button>
            </div>
          </div>
        )}

        {/* Elections per role */}
        {!loading && ROLES.map((roleName, roleIdx) => {
          const roleElecs = byRole[roleIdx]
          if (roleElecs.length === 0) return null

          // Active = any non-terminal election
          const active  = roleElecs.find(e => !['EXECUTED', 'FAILED'].includes(e.status))
          // Historical = terminal elections, show collapsed
          const history = roleElecs.filter(e => ['EXECUTED', 'FAILED'].includes(e.status))

          return (
            <div key={roleIdx} style={{ marginBottom: 20 }}>
              {/* Role header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: C.purple, border: `1px solid ${C.purple}`, borderRadius: 4, padding: '2px 8px', letterSpacing: '0.1em' }}>
                  {roleName}
                </span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Active election card */}
              {active && (
                <ElectionCard
                  election={active}
                  nameMap={nameMap}
                  isCitizen={isCitizen}
                  address={address}
                  actionPending={actionPending}
                  fmtTime={fmtTime}
                  countdown={countdown}
                  citizens={citizens}
                  onNominate={isCitizen && active.status === 'NOMINATING'
                    ? () => { setNomElecId(active.id); setNomCandidate(''); setActionError(null) }
                    : null}
                  onVote={isCitizen && active.status === 'VOTING' && !active.myVoted ? doVote : null}
                  onFinalise={active.status === 'FINALISE_READY' ? doFinalise : null}
                  onExecute={active.status === 'EXECUTE_READY' ? doExecute : null}
                />
              )}

              {/* Historical — collapsed */}
              {history.length > 0 && (
                <div style={{ marginTop: active ? 6 : 0 }}>
                  {history.map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, opacity: 0.6 }}>
                      <span style={{ fontSize: 10, color: e.status === 'EXECUTED' ? C.green : C.red, letterSpacing: '0.06em' }}>
                        {e.status === 'EXECUTED' ? '✓ ELECTED' : '✗ FAILED'}
                      </span>
                      <span style={{ fontSize: 10, color: C.faint }}>
                        {e.status === 'EXECUTED' && e.winner && e.winner !== ethers.ZeroAddress
                          ? (nameMap[e.winner.toLowerCase()] || shortAddr(e.winner))
                          : e.candidates.length === 0 ? 'no candidates'
                          : 'no votes / tie'}
                      </span>
                      <span style={{ fontSize: 10, color: C.faint }}>{fmtTime(e.votingEndsAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {!loading && elecs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>
            No elections yet. Click "Open election" next to a role above to start one.
          </div>
        )}

      </div>
    </Layout>
  )
}

// ── Election card ─────────────────────────────────────────────────────────────

function ElectionCard({ election, nameMap, isCitizen, address, actionPending, fmtTime, countdown, citizens, onNominate, onVote, onFinalise, onExecute }) {
  const { id, role, openedBy, nominationEndsAt, votingEndsAt, timelockEndsAt, winner, candidates, myVoted, myVotedFor, status } = election

  const statusMeta = {
    NOMINATING:     { label: 'NOMINATIONS OPEN',  color: C.gold,   bg: '#fffbf0' },
    VOTING:         { label: 'VOTING OPEN',        color: C.green,  bg: '#f0fff4' },
    FINALISE_READY: { label: 'VOTING CLOSED',      color: C.sub,    bg: C.white   },
    TIMELOCK:       { label: 'TIMELOCK',           color: C.blue,   bg: '#f0f8ff' },
    EXECUTE_READY:  { label: 'READY TO EXECUTE',   color: C.purple, bg: '#f9f0ff' },
    EXECUTED:       { label: 'EXECUTED',           color: C.green,  bg: C.white   },
    FAILED:         { label: 'FAILED',             color: C.red,    bg: C.white   },
  }[status] || { label: status, color: C.faint, bg: C.white }

  const openedByName = nameMap[openedBy?.toLowerCase()] || shortAddr(openedBy)
  const totalVotes   = candidates.reduce((s, c) => s + c.votes, 0)
  const winnerName   = winner && winner !== ethers.ZeroAddress
    ? (nameMap[winner.toLowerCase()] || shortAddr(winner)) : null
  const sorted       = [...candidates].sort((a, b) => b.votes - a.votes)
  const showVoteBars = !['NOMINATING', 'VOTING'].includes(status)

  // Deadline text
  const deadlineText = status === 'NOMINATING'
    ? `Nominations close ${fmtTime(nominationEndsAt)}`
    : status === 'VOTING'
    ? `Voting closes ${fmtTime(votingEndsAt)}`
    : status === 'TIMELOCK'
    ? `Timelock ends ${fmtTime(timelockEndsAt)}`
    : status === 'FINALISE_READY'
    ? `Voting closed ${fmtTime(votingEndsAt)}`
    : status === 'EXECUTED' && winnerName
    ? `${winnerName} elected as ${ROLES[role]}`
    : null

  const timer = status === 'NOMINATING' ? countdown(nominationEndsAt)
    : status === 'VOTING'  ? countdown(votingEndsAt)
    : status === 'TIMELOCK' ? countdown(timelockEndsAt)
    : null

  return (
    <div style={{ background: statusMeta.bg, border: `1px solid ${statusMeta.color}22`, borderRadius: 8, padding: '14px 16px', marginBottom: 6 }}>

      {/* Status + timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: statusMeta.color, border: `1px solid ${statusMeta.color}`, borderRadius: 4, padding: '2px 7px', letterSpacing: '0.08em' }}>
            {statusMeta.label}
          </span>
          {myVoted && (
            <span style={{ fontSize: 10, color: C.green, border: `1px solid ${C.green}`, borderRadius: 4, padding: '2px 7px', letterSpacing: '0.06em' }}>VOTED</span>
          )}
        </div>
        {timer && (
          <span style={{ fontSize: 10, color: statusMeta.color, fontVariantNumeric: 'tabular-nums' }}>{timer}</span>
        )}
      </div>

      {/* Deadline */}
      {deadlineText && (
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>
          {deadlineText}
        </div>
      )}

      {/* Phase guidance */}
      {status === 'NOMINATING' && isCitizen && (
        <div style={{ fontSize: 11, color: C.sub, marginBottom: 10, lineHeight: 1.5 }}>
          Nominations are open. Click "+ Nominate" to put a candidate forward.
          Multiple candidates can be nominated before voting opens.
        </div>
      )}
      {status === 'VOTING' && isCitizen && !myVoted && (
        <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>
          Voting is open. Click "Vote" next to your preferred candidate.
        </div>
      )}
      {status === 'FINALISE_READY' && (
        <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>
          Voting has closed. Click "Finalise" to count the votes and determine the winner.
        </div>
      )}
      {status === 'EXECUTE_READY' && (
        <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>
          Timelock expired. Click "Execute" to install the winner in post.
        </div>
      )}

      {/* Candidates */}
      {candidates.length === 0 ? (
        <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic', marginBottom: 10 }}>
          No candidates nominated yet.
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
          {sorted.map(c => {
            const name     = nameMap[c.address.toLowerCase()] || shortAddr(c.address)
            const isWinner = winner && c.address.toLowerCase() === winner.toLowerCase()
            const pct      = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0
            const myPick   = myVotedFor && c.address.toLowerCase() === myVotedFor.toLowerCase()
            return (
              <div key={c.address} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: isWinner ? C.green : C.text, fontWeight: isWinner ? 600 : 400 }}>
                      {isWinner ? '✓ ' : ''}{name}
                    </span>
                    {myPick && <span style={{ fontSize: 10, color: C.green }}>your vote</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {showVoteBars && (
                      <span style={{ fontSize: 11, color: C.sub }}>{c.votes} vote{c.votes !== 1 ? 's' : ''}</span>
                    )}
                    {status === 'VOTING' && !myVoted && onVote && (
                      <button
                        onClick={() => onVote(id, c.address)}
                        disabled={!!actionPending}
                        style={{ ...tinyBtn(C.green, '#fff'), opacity: actionPending === `vote-${id}` ? 0.5 : 1 }}
                      >
                        {actionPending === `vote-${id}` ? '…' : 'Vote'}
                      </button>
                    )}
                  </div>
                </div>
                {showVoteBars && totalVotes > 0 && (
                  <div style={{ height: 3, borderRadius: 2, background: C.border, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isWinner ? C.green : C.faint }} />
                  </div>
                )}
              </div>
            )
          })}
          {status === 'VOTING' && (
            <div style={{ fontSize: 10, color: C.faint, marginTop: 4 }}>
              Vote counts hidden until voting closes.
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {status === 'NOMINATING' && onNominate && (
        <button onClick={onNominate} disabled={!!actionPending} style={{ ...smallBtn(C.gold, '#0a0e1a'), marginTop: 2 }}>
          + Nominate candidate
        </button>
      )}
      {status === 'FINALISE_READY' && onFinalise && (
        <button onClick={() => onFinalise(id)} disabled={!!actionPending} style={{ ...smallBtn(C.gold, '#0a0e1a'), marginTop: 2 }}>
          {actionPending === `fin-${id}` ? '…' : 'Finalise →'}
        </button>
      )}
      {status === 'EXECUTE_READY' && onExecute && (
        <button onClick={() => onExecute(id)} disabled={!!actionPending} style={{ ...smallBtn(C.purple, '#fff'), marginTop: 2 }}>
          {actionPending === `exec-${id}` ? '…' : 'Execute →'}
        </button>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const selectStyle = {
  width: '100%', padding: '9px 10px',
  background: '#f9f9f9', color: '#111',
  border: '1px solid #e2e2e2', borderRadius: 6,
  fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
  boxSizing: 'border-box',
}

function tinyBtn(bg, color) {
  return {
    fontSize: 10, color, background: bg,
    border: 'none', borderRadius: 4, padding: '3px 8px',
    cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap',
  }
}

function smallBtn(bg, color) {
  return {
    padding: '9px 14px', background: bg, color,
    border: 'none', borderRadius: 6, fontSize: 11,
    cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace",
  }
}
