import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { shortAddr } from '../utils/addrLabel'
import { C } from '../theme'

const ROLES = ['CEO', 'CFO', 'COO']
const RPC   = 'https://sepolia.base.org'

const COLONY_ABI = [
  "function colonyName() view returns (string)",
  "function citizenCount() view returns (uint256)",
  "function founder() view returns (address)",
  "function citizenName(address) view returns (string)",
]

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function symbol() view returns (string)",
]

const GOV_ABI = [
  "function roleHolder(uint8) view returns (address holder, uint256 termEnd, bool active)",
  "function nextId() view returns (uint256)",
  "function elections(uint256) view returns (uint8 role, address openedBy, uint256 openedAt, uint256 nominationEndsAt, uint256 votingEndsAt, uint256 timelockEndsAt, address winner, bool executed, bool cancelled)",
]

// MCC O-token is minted as tokenId 1 in CreateColony deploy step 7 (orgType = 1 = MCC)
const OTOKEN_ABI = [
  "function ownerOf(uint256) view returns (address)",
  "function orgs(uint256) view returns (string name, uint8 orgType, uint256 registeredAt)",
]

function electionStatus(e, nowSec) {
  if (e.executed)                                              return 'EXECUTED'
  if (e.cancelled)                                             return 'FAILED'
  if (e.timelockEndsAt > 0 && nowSec >= e.timelockEndsAt)     return 'EXECUTE_READY'
  if (e.timelockEndsAt > 0)                                    return 'TIMELOCK'
  if (nowSec > e.votingEndsAt)                                 return 'FINALISE_READY'
  if (nowSec > e.nominationEndsAt)                             return 'VOTING'
  return 'NOMINATING'
}

const STATUS_LABEL = {
  NOMINATING:     'Nominations open',
  VOTING:         'Voting underway',
  FINALISE_READY: 'Ready to finalise',
  TIMELOCK:       'Timelock period',
  EXECUTE_READY:  'Ready to execute',
}
const STATUS_COLOR = {
  NOMINATING:     '#8b5cf6',
  VOTING:         '#3b82f6',
  FINALISE_READY: '#eab308',
  TIMELOCK:       '#eab308',
  EXECUTE_READY:  '#16a34a',
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtAnnDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Mcc() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { contracts, address, isConnected } = useWallet()

  const [board,         setBoard]         = useState([])
  const [stats,         setStats]         = useState(null)
  const [activeElecs,   setActiveElecs]   = useState([])
  const [loading,       setLoading]       = useState(true)
  const [isAuthored,    setIsAuthored]    = useState(false)  // can post announcements
  const [oTokenHolder,  setOTokenHolder]  = useState(null)   // M-23: who holds the MCC O-token

  const [announcements, setAnnouncements] = useState([])
  const [annLoading,    setAnnLoading]    = useState(true)

  const [posting,       setPosting]       = useState(false)
  const [newTitle,      setNewTitle]      = useState('')
  const [newBody,       setNewBody]       = useState('')
  const [postPending,   setPostPending]   = useState(false)
  const [postError,     setPostError]     = useState(null)

  const cfg = contracts?.colonies?.[slug]

  // Load chain data
  useEffect(() => {
    if (!cfg) { setLoading(false); return }
    let cancelled = false
    const rpc     = new ethers.JsonRpcProvider(RPC)

    async function load() {
      const colony = new ethers.Contract(cfg.colony,  COLONY_ABI, rpc)
      const sToken = new ethers.Contract(cfg.sToken,  ERC20_ABI,  rpc)
      const vToken = new ethers.Contract(cfg.vToken,  ERC20_ABI,  rpc)
      const gov    = new ethers.Contract(cfg.governance, GOV_ABI,  rpc)

      const [colonyName, citizenCount, founder, sSupplyRaw, vSupplyRaw, sSym, vSym] =
        await Promise.all([
          colony.colonyName(),
          colony.citizenCount(),
          colony.founder(),
          sToken.totalSupply(),
          vToken.totalSupply(),
          sToken.symbol(),
          vToken.symbol(),
        ])

      const roleData = await Promise.all(
        [0, 1, 2].map(i => gov.roleHolder(i).catch(() => [ethers.ZeroAddress, 0n, false]))
      )

      // Resolve citizen names for role holders
      const boardData = await Promise.all(
        ROLES.map(async (role, i) => {
          const [holder, termEnd, active] = roleData[i]
          let name = ''
          if (active && holder && holder !== ethers.ZeroAddress) {
            try { name = await colony.citizenName(holder) } catch {}
          }
          return { role, holder, termEnd: Number(termEnd), active, name }
        })
      )

      if (cancelled) return

      const myAddr = address?.toLowerCase()
      const isFounder = founder.toLowerCase() === myAddr
      const isBoardMember = boardData.some(b => b.active && b.holder.toLowerCase() === myAddr)

      setBoard(boardData)
      setStats({
        colonyName,
        citizenCount: Number(citizenCount),
        sSupply:  Math.floor(Number(ethers.formatEther(sSupplyRaw))),
        vSupply:  Math.floor(Number(ethers.formatEther(vSupplyRaw))),
        sSym, vSym, founder,
      })
      setIsAuthored(isFounder || isBoardMember)

      // M-23: read the MCC O-token holder. It is tokenId 1 by deploy convention
      // (first OToken mint is the MCC badge in CreateColony step 7).
      if (cfg.oToken) {
        try {
          const oToken = new ethers.Contract(cfg.oToken, OTOKEN_ABI, rpc)
          const [holder, org] = await Promise.all([
            oToken.ownerOf(1),
            oToken.orgs(1),
          ])
          let holderName = ''
          if (holder && holder !== ethers.ZeroAddress) {
            try { holderName = await colony.citizenName(holder) } catch {}
          }
          if (!cancelled) setOTokenHolder({
            address: holder,
            name:    holderName,
            isMcc:   Number(org.orgType) === 1, // OrgType.MCC
          })
        } catch (e) {
          if (!cancelled) setOTokenHolder({ unavailable: true })
        }
      }

      setLoading(false)
    }

    load().catch(e => { console.warn('[Mcc] load failed:', e); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [cfg, address])

  // Load active elections in a separate effect so it isn't cut short by the
  // board-load cancelled guard and can't silently swallow a thrown error there.
  const [elecsLoading, setElecsLoading] = useState(true)
  useEffect(() => {
    if (!cfg?.governance) { setElecsLoading(false); return }
    const rpc = new ethers.JsonRpcProvider(RPC)
    const gov = new ethers.Contract(cfg.governance, GOV_ABI, rpc)
    async function loadElections() {
      try {
        const nextId = Number(await gov.nextId())
        const nowSec = Math.floor(Date.now() / 1000)
        const result = []
        for (let i = 1; i < nextId; i++) {
          try {
            const e = await gov.elections(i)
            if (e.openedBy === ethers.ZeroAddress) continue
            if (e.executed || e.cancelled) continue
            const status = electionStatus({
              nominationEndsAt: Number(e.nominationEndsAt),
              votingEndsAt:     Number(e.votingEndsAt),
              timelockEndsAt:   Number(e.timelockEndsAt),
              executed:         e.executed,
              cancelled:        e.cancelled,
            }, nowSec)
            if (!STATUS_LABEL[status]) continue
            result.push({ id: i, role: Number(e.role), status })
          } catch {}
        }
        setActiveElecs(result)
      } catch (e) {
        console.warn('[Mcc] loadElections failed:', e)
      }
      setElecsLoading(false)
    }
    loadElections()
  }, [cfg])

  // Load announcements separately so chain load doesn't block them
  async function loadAnnouncements() {
    setAnnLoading(true)
    try {
      const r = await fetch(`/api/announcements?colony=${slug}`)
      if (r.ok) {
        const data = await r.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {}
    setAnnLoading(false)
  }

  useEffect(() => { loadAnnouncements() }, [slug])

  async function handlePost() {
    if (!newTitle.trim()) return
    setPostPending(true); setPostError(null)
    try {
      const r = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          colony: slug,
          title: newTitle.trim(),
          body:  newBody.trim() || undefined,
          author_addr: address,
        }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        throw new Error(d.error || 'Post failed')
      }
      setNewTitle(''); setNewBody(''); setPosting(false)
      await loadAnnouncements()
    } catch (e) {
      setPostError(e.message)
    }
    setPostPending(false)
  }

  async function handleDelete(id) {
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch {}
  }

  return (
    <Layout title="MCC" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 40px' }}>

        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 18 }}>
          {stats?.colonyName || slug} · MONETARY CONTROL COMMITTEE
        </div>

        {/* Board ─────────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
            BOARD
          </div>

          {loading ? (
            <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
          ) : (
            ROLES.map((role, i) => {
              const member = board[i] || {}
              const isVacant = !member.active || !member.holder || member.holder === ethers.ZeroAddress
              return (
                <div
                  key={role}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: i < ROLES.length - 1 ? 12 : 0,
                    marginBottom:  i < ROLES.length - 1 ? 12 : 0,
                    borderBottom:  i < ROLES.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.06em', marginBottom: 2 }}>
                      {role}
                    </div>
                    <div style={{ fontSize: 13, color: isVacant ? C.faint : C.text }}>
                      {isVacant
                        ? 'vacant'
                        : member.name || shortAddr(member.holder)}
                    </div>
                    {!isVacant && member.name && (
                      <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace', marginTop: 2 }}>
                        {shortAddr(member.holder)}
                      </div>
                    )}
                  </div>
                  {!isVacant && member.termEnd > 0 && (
                    <div style={{ fontSize: 10, color: C.faint, textAlign: 'right' }}>
                      term ends<br />
                      {fmtDate(member.termEnd)}
                    </div>
                  )}
                </div>
              )
            })
          )}

          {/* M-23: cryptographic authority — who currently holds the MCC O-token */}
          {oTokenHolder && !oTokenHolder.unavailable && oTokenHolder.address !== ethers.ZeroAddress && (() => {
            const ceo = board[0]
            const ceoAddr = ceo?.holder?.toLowerCase()
            const oAddr   = oTokenHolder.address.toLowerCase()
            const matches = ceo?.active && ceoAddr === oAddr
            return (
              <div style={{
                marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`,
                fontSize: 10, color: C.faint, lineHeight: 1.6,
              }}>
                <div style={{ letterSpacing: '0.06em' }}>O-TOKEN #1 (MCC IDENTITY)</div>
                <div style={{ marginTop: 4, color: C.sub, fontFamily: 'monospace' }}>
                  {oTokenHolder.name || shortAddr(oTokenHolder.address)}
                  {oTokenHolder.name && (
                    <span style={{ color: C.faint, marginLeft: 6 }}>{shortAddr(oTokenHolder.address)}</span>
                  )}
                </div>
                {!matches && (
                  <div style={{ marginTop: 4, color: '#eab308' }}>
                    note: O-token holder differs from elected CEO — handover pending
                  </div>
                )}
              </div>
            )
          })()}

          <button
            onClick={() => navigate(`/colony/${slug}/votes`)}
            style={{
              marginTop: 14, width: '100%', padding: '10px 0',
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: 11, color: C.sub,
              cursor: 'pointer', letterSpacing: '0.04em',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Elections →
          </button>
        </div>

        {/* Active elections ───────────────────────────────────────── */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
            LIVE ELECTIONS
          </div>

          {elecsLoading ? (
            <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
          ) : activeElecs.length === 0 ? (
            <div style={{ fontSize: 12, color: C.faint }}>No active elections.</div>
          ) : (
            activeElecs.map((e, i) => {
              const color = STATUS_COLOR[e.status] || C.faint
              return (
                <div
                  key={e.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: i < activeElecs.length - 1 ? 10 : 0,
                    marginBottom:  i < activeElecs.length - 1 ? 10 : 0,
                    borderBottom:  i < activeElecs.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                >
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                    {ROLES[e.role]}
                  </div>
                  <span style={{
                    fontSize: 10, color, border: `1px solid ${color}`,
                    borderRadius: 10, padding: '3px 9px', letterSpacing: '0.04em',
                  }}>
                    {STATUS_LABEL[e.status]}
                  </span>
                </div>
              )
            })
          )}

          <button
            onClick={() => navigate(`/colony/${slug}/votes`)}
            style={{
              marginTop: 12, width: '100%', padding: '9px 0',
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: 11, color: C.sub,
              cursor: 'pointer', letterSpacing: '0.04em',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Go to Votes →
          </button>
        </div>

        {/* Colony stats ────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
            COLONY STATS
          </div>

          {[
            ['Citizens',  stats ? String(stats.citizenCount)              : '…'],
            ['S supply',  stats ? `${stats.sSupply.toLocaleString()} ${stats.sSym}` : '…'],
            ['V supply',  stats ? `${stats.vSupply.toLocaleString()} ${stats.vSym}` : '…'],
          ].map(([label, value], i, arr) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between',
                paddingBottom: i < arr.length - 1 ? 10 : 0,
                marginBottom:  i < arr.length - 1 ? 10 : 0,
                borderBottom:  i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <span style={{ fontSize: 12, color: C.sub }}>{label}</span>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Announcements ───────────────────────────────────────────── */}
        <div style={card}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>ANNOUNCEMENTS</div>
            {isAuthored && !posting && (
              <button
                onClick={() => setPosting(true)}
                style={{
                  fontSize: 11, color: C.gold, background: 'none',
                  border: `1px solid ${C.gold}`, borderRadius: 10,
                  padding: '3px 10px', cursor: 'pointer',
                }}
              >
                + Post
              </button>
            )}
          </div>

          {/* New announcement form */}
          {posting && (
            <div style={{ marginBottom: 16, padding: 14, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Title"
                maxLength={120}
                style={inputStyle}
              />
              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Body (optional)"
                rows={3}
                maxLength={600}
                style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }}
              />
              {postError && (
                <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>{postError}</div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handlePost}
                  disabled={postPending || !newTitle.trim()}
                  style={{
                    flex: 1, padding: '9px 0',
                    background: C.gold, color: C.bg,
                    border: 'none', borderRadius: 6,
                    fontSize: 11, cursor: 'pointer',
                    opacity: postPending || !newTitle.trim() ? 0.4 : 1,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {postPending ? 'Posting…' : 'Post'}
                </button>
                <button
                  onClick={() => { setPosting(false); setNewTitle(''); setNewBody(''); setPostError(null) }}
                  style={{
                    flex: 1, padding: '9px 0',
                    background: 'none', color: C.sub,
                    border: `1px solid ${C.border}`, borderRadius: 6,
                    fontSize: 11, cursor: 'pointer',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {annLoading ? (
            <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
          ) : announcements.length === 0 ? (
            <div style={{ fontSize: 12, color: C.faint }}>No announcements yet.</div>
          ) : (
            announcements.map((ann, i) => (
              <div
                key={ann.id}
                style={{
                  paddingBottom: i < announcements.length - 1 ? 14 : 0,
                  marginBottom:  i < announcements.length - 1 ? 14 : 0,
                  borderBottom:  i < announcements.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                  {ann.title}
                </div>
                {ann.body && (
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 6, whiteSpace: 'pre-line' }}>
                    {ann.body}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 10, color: C.faint }}>
                    {fmtAnnDate(ann.created_at)} · {shortAddr(ann.author_addr)}
                  </div>
                  {isAuthored && (
                    <button
                      onClick={() => handleDelete(ann.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 10, color: C.faint, padding: 0,
                      }}
                    >
                      delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </Layout>
  )
}

const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '16px 16px',
  marginBottom: 12,
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 10px', marginBottom: 8,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 12, color: C.text,
  background: C.white,
  fontFamily: "'IBM Plex Mono', monospace",
  outline: 'none',
}
