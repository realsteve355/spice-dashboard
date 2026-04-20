import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'
import { shortAddr } from '../utils/addrLabel'

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

const CITIZEN_JOINED_TOPIC = ethers.id("CitizenJoined(address,uint256,string)")
const CITIZEN_IFACE = new ethers.Interface([
  "event CitizenJoined(address indexed citizen, uint256 gTokenId, string name)",
])

// Status is derived client-side from timestamps
function electionStatus(e, nowSec) {
  if (e.executed)                                                  return 'EXECUTED'
  if (e.cancelled)                                                 return 'FAILED'
  if (e.timelockEndsAt > 0 && nowSec >= e.timelockEndsAt)         return 'EXECUTE_READY'
  if (e.timelockEndsAt > 0)                                        return 'TIMELOCK'
  if (nowSec > e.votingEndsAt)                                     return 'FINALISE_READY'
  if (nowSec > e.nominationEndsAt)                                 return 'VOTING'
  return 'NOMINATING'
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

  const [elecs,         setElecs]         = useState([])
  const [citizens,      setCitizens]      = useState([])
  const [nameMap,       setNameMap]       = useState({})
  const [roleHolders,   setRoleHolders]   = useState([null, null, null])
  const [loading,       setLoading]       = useState(true)
  const [actionPending, setActionPending] = useState(null)
  const [actionError,   setActionError]   = useState(null)

  // Opening an election
  const [openingRole,   setOpeningRole]   = useState(null)  // roleIdx being opened

  // Nominating a candidate
  const [nomElecId,     setNomElecId]     = useState(null)  // electionId to nominate into
  const [nomCandidate,  setNomCandidate]  = useState('')

  async function load() {
    if (!govAddress || !colonyAddr || !provider) { setLoading(false); return }
    try {
      const rpc    = new ethers.JsonRpcProvider(RPC)
      const gov    = new ethers.Contract(govAddress, GOV_ABI, rpc)
      const nowSec = Math.floor(Date.now() / 1000)

      const [holders, citizenList] = await Promise.all([
        Promise.all([0, 1, 2].map(r => gov.roleHolder(r))),
        fetchCitizens(colonyAddr),
      ])
      setRoleHolders(holders)
      setCitizens(citizenList)
      const nm = Object.fromEntries(citizenList.map(c => [c.address.toLowerCase(), c.name]))
      setNameMap(nm)

      const nextId = Number(await gov.nextId())
      const loaded = []
      for (let i = 1; i < nextId; i++) {
        const e = await gov.elections(i)
        // Skip obligation slots (openedBy == zero address)
        if (e.openedBy === ethers.ZeroAddress) continue

        const [rawCandidates, myVoted] = await Promise.all([
          gov.getCandidates(i),
          address ? gov.hasVoted(address, i) : Promise.resolve(false),
        ])

        // Fetch vote counts for each candidate
        const candidateData = await Promise.all(
          rawCandidates.map(async addr => ({
            address: addr,
            votes:   Number(await gov.getCandidateVotes(i, addr)),
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
          myVotedFor:       null, // we don't store which candidate on-chain easily
        }
        entry.status = electionStatus(entry, nowSec)
        loaded.push(entry)
      }

      setElecs(prev => {
        const prevMap = Object.fromEntries(prev.map(e => [e.id, e]))
        return loaded.reverse().map(e => ({
          ...e,
          myVoted:    prevMap[e.id]?.myVoted    || e.myVoted,
          myVotedFor: prevMap[e.id]?.myVotedFor || e.myVotedFor,
        }))
      })
    } catch (err) {
      console.warn('Votes load error', err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [govAddress, colonyAddr, provider, address])

  // Recompute statuses every 15s so phase transitions appear without refresh
  useEffect(() => {
    const t = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000)
      setElecs(prev => prev.map(e => ({ ...e, status: electionStatus(e, nowSec) })))
    }, 15000)
    return () => clearInterval(t)
  }, [])

  function govErr(e) {
    return e?.reason || e?.shortMessage || e?.error?.reason || e?.error?.message || e?.message || 'Transaction failed'
  }

  const GAS = { gasLimit: 300000 }

  async function doOpenElection(roleIdx) {
    if (!signer || !govAddress) return
    setActionPending(`open-${roleIdx}`); setActionError(null); setOpeningRole(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)

      // If already active (prior tx succeeded but RPC was stale), skip straight to inject
      let skipSend = false
      try {
        await gov.openElection.staticCall(roleIdx)
      } catch (simErr) {
        if (govErr(simErr).includes('already active')) { skipSend = true }
        else throw simErr
      }

      if (!skipSend) {
        const tx      = await gov.openElection(roleIdx, GAS)
        const receipt = await tx.wait()

        // Parse ElectionOpened from receipt — MetaMask provider is already synced
        const iface = new ethers.Interface([
          "event ElectionOpened(uint256 indexed id, uint8 indexed role, address indexed openedBy)"
        ])
        let newElecId = null
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log)
            if (parsed?.name === 'ElectionOpened') { newElecId = Number(parsed.args.id); break }
          } catch {}
        }

        if (newElecId !== null) {
          // Read the new election via signer's provider (already on latest block)
          const e      = await gov.elections(newElecId)
          const nowSec = Math.floor(Date.now() / 1000)
          const entry  = {
            id:               newElecId,
            role:             Number(e.role),
            openedBy:         e.openedBy,
            openedAt:         Number(e.openedAt),
            nominationEndsAt: Number(e.nominationEndsAt),
            votingEndsAt:     Number(e.votingEndsAt),
            timelockEndsAt:   0,
            winner:           ethers.ZeroAddress,
            executed:         false,
            cancelled:        false,
            candidates:       [],
            myVoted:          false,
            myVotedFor:       null,
          }
          entry.status = electionStatus(entry, nowSec)
          setElecs(prev => [entry, ...prev])
        }
      }

      // Background refresh — public RPC will catch up eventually
      setTimeout(() => load(), 3000)
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  async function doNominate() {
    if (!signer || !govAddress || !nomElecId) return
    if (!ethers.isAddress(nomCandidate)) { setActionError('Select a candidate'); return }
    setActionPending(`nom-${nomElecId}`); setActionError(null)
    try {
      const gov = new ethers.Contract(govAddress, GOV_ABI, signer)
      const tx  = await gov.nominateCandidate(nomElecId, nomCandidate, GAS)
      await tx.wait()
      setNomElecId(null); setNomCandidate('')
      await load()
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
        ...e,
        myVoted:    true,
        myVotedFor: candidate,
        candidates: e.candidates.map(c => c.address === candidate
          ? { ...c, votes: c.votes + 1 }
          : c
        ),
      } : e))
      load()
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
      await load()
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
      await load()
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
      await load()
    } catch (e) {
      setActionError(govErr(e))
    }
    setActionPending(null)
  }

  const byRole = ROLES.map((_, i) => elecs.filter(e => e.role === i))

  const fmtTime = ts => ts
    ? new Date(ts * 1000).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <Layout title="Governance" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Header */}
        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
          {colonyName} · MCC ELECTIONS
        </div>

        {/* Current board */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>CURRENT MCC BOARD</div>
          {roleHolders.map((rh, i) => {
            const vacant     = !rh || rh.holder === ethers.ZeroAddress
            const expired    = rh && !rh.active && !vacant
            const holderName = rh && !vacant ? nameMap[rh.holder.toLowerCase()] : null
            const expDate    = rh && !vacant
              ? new Date(Number(rh.termEnd) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : null
            const isHolder   = rh && !vacant && address && rh.holder.toLowerCase() === address.toLowerCase()
            const hasActive  = byRole[i]?.some(e => !['EXECUTED','FAILED'].includes(e.status))
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < 2 ? 10 : 0 }}>
                <span style={{ fontSize: 11, color: C.faint, minWidth: 36 }}>{ROLES[i]}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 11, color: expired ? C.red : vacant ? C.faint : C.sub, textAlign: 'right' }}>
                    {vacant ? 'vacant' : `${holderName || shortAddr(rh.holder)} · expires ${expDate}${expired ? ' · EXPIRED' : ''}`}
                  </span>
                  {isCitizen && !hasActive && (
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

        {actionError && (
          <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{actionError}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>Loading elections…</div>
        )}

        {!loading && elecs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>
            No elections yet. Click "Open election" next to a role above to start one.
          </div>
        )}

        {/* Nominate candidate modal */}
        {nomElecId && (
          <div style={{ background: C.white, border: `1px solid ${C.gold}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NOMINATE A CANDIDATE</div>
            <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>Candidate</div>
            <select
              value={nomCandidate}
              onChange={e => { setNomCandidate(e.target.value); setActionError(null) }}
              style={selectStyle}
            >
              <option value="" style={{ background: C.bg, color: C.faint }}>— select a citizen —</option>
              {citizens
                .filter(c => {
                  // Exclude already-nominated candidates
                  const elec = elecs.find(e => e.id === nomElecId)
                  return !elec?.candidates.some(cd => cd.address.toLowerCase() === c.address.toLowerCase())
                })
                .map(c => (
                  <option key={c.address} value={c.address} style={{ background: C.bg, color: C.text }}>
                    {c.name} · {shortAddr(c.address)}
                  </option>
                ))
              }
            </select>
            {actionError && <div style={{ fontSize: 11, color: C.red, marginTop: 8 }}>{actionError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setNomElecId(null); setNomCandidate(''); setActionError(null) }} style={smallBtn(C.border, C.sub)}>
                Cancel
              </button>
              <button
                onClick={doNominate}
                disabled={actionPending === `nom-${nomElecId}` || !nomCandidate}
                style={{ ...smallBtn(C.gold, '#0a0e1a'), flex: 1, opacity: !nomCandidate ? 0.5 : 1 }}
              >
                {actionPending === `nom-${nomElecId}` ? 'Submitting…' : 'Nominate →'}
              </button>
            </div>
          </div>
        )}

        {/* Elections grouped by role */}
        {!loading && byRole.map((roleElecs, roleIdx) => {
          if (roleElecs.length === 0) return null
          const hasOpen = roleElecs.some(e => !['EXECUTED','FAILED'].includes(e.status))
          return (
            <div key={roleIdx} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: C.purple, border: `1px solid ${C.purple}`, borderRadius: 4, padding: '2px 8px', letterSpacing: '0.08em' }}>
                  {ROLES[roleIdx]}
                </span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 10, color: C.faint }}>
                  {roleElecs.length} election{roleElecs.length !== 1 ? 's' : ''}
                  {hasOpen ? ' · open' : ''}
                </span>
              </div>
              {roleElecs.map(e => (
                <ElectionCard
                  key={e.id}
                  election={e}
                  nameMap={nameMap}
                  isCitizen={isCitizen}
                  address={address}
                  actionPending={actionPending}
                  fmtTime={fmtTime}
                  onNominate={isCitizen && e.status === 'NOMINATING' ? () => { setNomElecId(e.id); setNomCandidate(''); setActionError(null) } : null}
                  onVote={isCitizen && e.status === 'VOTING' && !e.myVoted ? doVote : null}
                  onFinalise={e.status === 'FINALISE_READY' ? doFinalise : null}
                  onExecute={e.status === 'EXECUTE_READY' ? doExecute : null}
                />
              ))}
            </div>
          )
        })}

      </div>
    </Layout>
  )
}

function ElectionCard({ election, nameMap, isCitizen, address, actionPending, fmtTime, onNominate, onVote, onFinalise, onExecute }) {
  const { id, role, openedBy, nominationEndsAt, votingEndsAt, timelockEndsAt, winner, candidates, myVoted, myVotedFor, status } = election

  const statusMeta = {
    NOMINATING:     { label: 'NOMINATIONS OPEN', color: C.gold   },
    VOTING:         { label: 'VOTING OPEN',       color: C.green  },
    FINALISE_READY: { label: 'AWAITING FINALISE', color: C.gold   },
    TIMELOCK:       { label: 'TIMELOCK',          color: C.blue   },
    EXECUTE_READY:  { label: 'READY TO EXECUTE',  color: C.purple },
    EXECUTED:       { label: 'EXECUTED',          color: C.faint  },
    FAILED:         { label: 'FAILED',            color: C.red    },
  }[status] || { label: status, color: C.faint }

  const openedByName = nameMap[openedBy?.toLowerCase()] || shortAddr(openedBy)
  const totalVotes   = candidates.reduce((s, c) => s + c.votes, 0)
  const winnerName   = winner && winner !== ethers.ZeroAddress ? (nameMap[winner.toLowerCase()] || shortAddr(winner)) : null

  // Sort candidates by votes descending for display
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes)

  const isDoneVoting = !['NOMINATING','VOTING'].includes(status)

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 9, color: statusMeta.color, border: `1px solid ${statusMeta.color}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
          {statusMeta.label}
        </span>
        {myVoted && (
          <span style={{ fontSize: 9, color: C.green, border: `1px solid ${C.green}`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>VOTED</span>
        )}
      </div>

      {/* Opened by + timeline */}
      <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>
        Opened by {openedByName}
        <span style={{ color: C.border }}> · </span>
        {status === 'NOMINATING'
          ? <span>nominations close {fmtTime(nominationEndsAt)}</span>
          : status === 'VOTING'
          ? <span>voting closes {fmtTime(votingEndsAt)}</span>
          : status === 'TIMELOCK'
          ? <span>timelock ends {fmtTime(timelockEndsAt)}</span>
          : status === 'EXECUTE_READY'
          ? <span style={{ color: C.purple }}>ready to execute</span>
          : status === 'EXECUTED'
          ? <span>executed · {winnerName} elected as {ROLES[role]}</span>
          : <span>voting closed {fmtTime(votingEndsAt)}</span>
        }
      </div>

      {/* Candidates */}
      {candidates.length === 0 ? (
        <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic', marginBottom: 10 }}>
          No candidates nominated yet.
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
          {sorted.map(c => {
            const name      = nameMap[c.address.toLowerCase()] || shortAddr(c.address)
            const isWinner  = winner && c.address.toLowerCase() === winner.toLowerCase()
            const pct       = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0
            const myPick    = myVotedFor && c.address.toLowerCase() === myVotedFor.toLowerCase()
            return (
              <div key={c.address} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: isWinner ? C.green : C.text, fontWeight: isWinner ? 600 : 400 }}>
                    {isWinner ? '✓ ' : ''}{name}{myPick ? ' · your vote' : ''}
                  </span>
                  {isDoneVoting && (
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
                  {status === 'VOTING' && myVoted && (
                    <span style={{ fontSize: 10, color: C.green }}>voted</span>
                  )}
                </div>
                {/* Vote bar — only after voting closes */}
                {isDoneVoting && totalVotes > 0 && (
                  <div style={{ height: 3, borderRadius: 2, background: C.border, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isWinner ? C.green : C.faint }} />
                  </div>
                )}
              </div>
            )
          })}
          {status === 'VOTING' && (
            <div style={{ fontSize: 10, color: C.faint, marginTop: 4 }}>
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast · tally hidden until voting closes
            </div>
          )}
        </div>
      )}

      {/* Outcome */}
      {status === 'FAILED' && (
        <div style={{ fontSize: 11, color: C.red }}>
          {candidates.length === 0 ? 'Failed — no candidates nominated' :
           totalVotes === 0 ? 'Failed — no votes cast' :
           'Failed — tied vote'}
        </div>
      )}
      {status === 'EXECUTED' && winnerName && (
        <div style={{ fontSize: 11, color: C.green }}>✓ {winnerName} elected as {ROLES[role]}</div>
      )}

      {/* Add candidate button */}
      {status === 'NOMINATING' && onNominate && (
        <button
          onClick={onNominate}
          disabled={!!actionPending}
          style={{ ...smallBtn(C.gold, '#0a0e1a'), marginTop: 6 }}
        >
          + Nominate candidate
        </button>
      )}

      {/* Finalise */}
      {status === 'FINALISE_READY' && onFinalise && (
        <button
          onClick={() => onFinalise(id)}
          disabled={!!actionPending}
          style={{ ...smallBtn(C.gold, '#0a0e1a'), marginTop: 6 }}
        >
          {actionPending === `fin-${id}` ? '…' : 'Finalise Election →'}
        </button>
      )}

      {/* Execute */}
      {status === 'EXECUTE_READY' && onExecute && (
        <button
          onClick={() => onExecute(id)}
          disabled={!!actionPending}
          style={{ ...smallBtn(C.purple, '#fff'), marginTop: 6 }}
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
  background: '#f9f9f9',
  color: '#111',
  border: `1px solid #e2e2e2`,
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "'IBM Plex Mono', monospace",
}

function tinyBtn(bg, color) {
  return {
    fontSize: 10,
    color,
    background: bg,
    border: 'none',
    borderRadius: 4,
    padding: '3px 8px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace",
    whiteSpace: 'nowrap',
  }
}

function smallBtn(bg, color) {
  return {
    padding: '9px 14px',
    background: bg,
    color,
    border: 'none',
    borderRadius: 6,
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace",
  }
}
