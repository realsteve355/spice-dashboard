import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { MOCK_COLONIES } from '../data/mock'
import { useWallet } from '../App'

const RPC = 'https://sepolia.base.org'

const COLONY_ABI = [
  "function join(string) external",
  "function isCitizen(address) view returns (bool)",
  "function colonyName() view returns (string)",
  "function citizenCount() view returns (uint256)",
]

import { C } from '../theme'

const CONSTITUTION_TEXT = `FOUNDING CONSTITUTION OF THIS COLONY

1. UBI FLOOR
   Every registered citizen receives 1,000 S-tokens on the 1st of each month, unconditionally, for life.

2. UBI UNIVERSALITY
   The UBI may not be conditional, means-tested, or withheld for any reason.

3. G-TOKEN UNIVERSALITY
   Every adult citizen (18+) holds exactly one G-token, issued on registration.

4. G-TOKEN NON-TRANSFERABILITY
   G-tokens cannot be bought, sold, inherited, or transferred.

5. MCC MANDATE
   The MCC may not compete commercially with private companies within the colony.

6. CITIZEN V-TOKEN PROTECTION
   No authority may confiscate citizen V-tokens.

7. BLOCKCHAIN TRANSPARENCY
   All ownership — wallets, shares, assets — is publicly visible at all times.

8. MCC ASSET PROTECTION
   MCC infrastructure may not be privatised.

9. COMPANY FREEDOM
   No licence is required to operate a company beyond Fisc registration.

10. FISC AUTONOMY
    The Fisc may not be placed under MCC or company control.

These protections may only be amended by a blockchain referendum of 80% of all registered citizens.`

export default function ColonyPage() {
  const { slug }            = useParams()
  const [searchParams]      = useSearchParams()
  const addressParam        = searchParams.get('address')
  const navigate            = useNavigate()
  const { isConnected, onChainLoading, isCitizenOf, isMccOf, connect, signer, contracts, refresh } = useWallet()

  const mockColony = MOCK_COLONIES.find(c => c.id === slug)
  const isCitizen  = isCitizenOf(slug)
  const isMcc      = isMccOf(slug)

  // Fall back to localStorage if URL param is absent (e.g. after in-app navigation)
  const stored0     = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
  const storedEntry = stored0[slug]
  const storedAddr  = storedEntry?.address
  const resolvedAddr = addressParam || storedAddr

  // Extra addresses passed in URL from CreateColony
  const mccTreasuryParam = searchParams.get('mccTreasury')
  const mccBillingParam  = searchParams.get('mccBilling')
  const mccServicesParam = searchParams.get('mccServices')

  // Start in loading state if we have an address to fetch — avoids "not found" flash
  const [chainColony, setChainColony] = useState(null)
  const [chainLoading, setChainLoading] = useState(!mockColony && !!resolvedAddr)

  const [showConstitution, setShowConstitution] = useState(false)
  const [joining, setJoining]     = useState(false)
  const [citizenName, setName]    = useState('')
  const [accepted, setAccepted]   = useState(false)
  const [joined, setJoined]       = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [txError, setTxError]     = useState(null)

  const [citizens, setCitizens]         = useState(null)  // null = not loaded, [] = empty
  const [citizensLoading, setCitizensLoading] = useState(false)

  // If not in mock list but we have an address, load from chain
  useEffect(() => {
    if (mockColony || !resolvedAddr) return
    setChainLoading(true)
    const prov = new ethers.JsonRpcProvider(RPC)
    const c = new ethers.Contract(resolvedAddr, COLONY_ABI, prov)
    Promise.all([c.colonyName(), c.citizenCount()])
      .then(([name, count]) => {
        const info = {
          id: slug,
          name,
          description: '',
          founded: new Date().toISOString().slice(0, 10),
          citizenCount: Number(count),
          mcc: { name: 'Not yet configured', board: [] },
          services: [],
          address: resolvedAddr,
        }
        setChainColony(info)
        // Persist to app.zpc.finance localStorage, including any extra addresses from URL
        const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
        stored[slug] = {
          ...(stored[slug] || {}),
          address: resolvedAddr,
          name,
          ...(mccTreasuryParam ? { mccTreasury: mccTreasuryParam } : {}),
          ...(mccBillingParam  ? { mccBilling:  mccBillingParam  } : {}),
          ...(mccServicesParam ? { mccServices: mccServicesParam } : {}),
        }
        localStorage.setItem('spice_user_colonies', JSON.stringify(stored))
        // Trigger App.jsx to poll this colony immediately
        refresh(0)
      })
      .catch(() => setChainColony(null))
      .finally(() => setChainLoading(false))
  }, [slug, resolvedAddr, mockColony])

  const colony = mockColony || chainColony

  if (!colony && chainLoading) return (
    <Layout title="Loading…" back="/">
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>Loading colony from chain…</div>
    </Layout>
  )

  if (!colony) return (
    <Layout title="Not Found" back="/">
      <div style={{ padding: 32, textAlign: 'center', color: C.faint }}>Colony not found.</div>
    </Layout>
  )

  function handleJoin() {
    if (!isConnected) { connect(); return }
    setJoining(true)
  }

  async function handleSign() {
    const contractAddress = contracts?.colonies?.[slug]?.colony || resolvedAddr
    if (!contractAddress || !signer) {
      setJoining(false)
      setJoined(true)
      return
    }
    setTxPending(true)
    setTxError(null)
    try {
      const colony = new ethers.Contract(contractAddress, COLONY_ABI, signer)
      const tx = await colony.join(citizenName.trim())
      await tx.wait()
      setJoining(false)
      setJoined(true)
      refresh()
    } catch (e) {
      console.error(e)
      setTxError(e?.reason || e?.message || 'Transaction failed')
    } finally {
      setTxPending(false)
    }
  }

  // Resolve contract address once (stable string, not the contracts object)
  const colonyContractAddr = contracts?.colonies?.[slug]?.colony || resolvedAddr || null

  useEffect(() => {
    if (!colonyContractAddr) return
    let cancelled = false
    setCitizensLoading(true)
    const prov = new ethers.JsonRpcProvider(RPC)
    const CITIZEN_ABI = [
      "function citizenCount() view returns (uint256)",
      "function citizens(uint256) view returns (address)",
      "function citizenName(address) view returns (string)",
    ]
    const c = new ethers.Contract(colonyContractAddr, CITIZEN_ABI, prov)
    c.citizenCount()
      .then(async (count) => {
        const n = Number(count)
        const addrs = await Promise.all(
          Array.from({ length: n }, (_, i) => c.citizens(i))
        )
        const names = await Promise.all(addrs.map(a => c.citizenName(a)))
        if (!cancelled) setCitizens(addrs.map((addr, i) => ({ addr, name: names[i] })))
      })
      .catch((e) => { if (!cancelled) { console.warn('[citizens] load failed:', e); setCitizens([]) } })
      .finally(() => { if (!cancelled) setCitizensLoading(false) })
    return () => { cancelled = true }
  }, [slug, colonyContractAddr])

  return (
    <Layout title={colony.name} back="/" colonySlug={isCitizen ? slug : null}>
      <div style={{ padding: '20px 16px 0' }}>

        {/* Colony header */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: C.text, marginBottom: 4 }}>{colony.name}</div>
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>
            Est. {fmtDate(colony.founded)} · MCC: {colony.mcc.name} · Base Sepolia
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 16 }}>
            {colony.description}
          </div>

          {/* Citizen count badge */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip label={`${colony.citizenCount} citizens`} />
            <Chip label="Active" color={C.green} />
            {isCitizen && <Chip label="You are a citizen" color={C.gold} />}
            {isMcc    && <Chip label="You are MCC board" color="#8b5cf6" />}
          </div>
        </div>

        {/* Action buttons */}
        {joined ? (
          <div style={{
            background: '#f0fdf4', border: `1px solid ${C.green}`,
            borderRadius: 8, padding: 16, marginBottom: 12, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, color: C.green, fontWeight: 500, marginBottom: 4 }}>Welcome to {colony.name}</div>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
              G-token issued. 1,000 S-tokens have been credited to your wallet.
            </div>
            <button onClick={() => navigate(`/colony/${slug}/dashboard`)} style={btn(C.green)}>
              Go to Dashboard →
            </button>
          </div>
        ) : isCitizen ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => navigate(`/colony/${slug}/dashboard`)} style={{ ...btn(C.gold), flex: 1 }}>
              Dashboard →
            </button>
            {isMcc && (
              <button onClick={() => navigate(`/colony/${slug}/admin`)} style={{ ...btn('#8b5cf6'), flex: 1 }}>
                MCC Admin →
              </button>
            )}
          </div>
        ) : onChainLoading ? (
          <div style={{ textAlign: 'center', padding: '14px 0', fontSize: 12, color: C.faint, marginBottom: 12 }}>
            Checking citizenship...
          </div>
        ) : (
          <button onClick={handleJoin} style={{ ...btn(C.gold), width: '100%', marginBottom: 12 }}>
            {isConnected ? 'Join this Colony' : 'Connect Wallet to Join'}
          </button>
        )}

        {/* Join confirmation sheet */}
        {joining && (
          <div style={{
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: 16, marginBottom: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>
              Read and accept the founding constitution
            </div>
            <div style={{
              fontSize: 11, color: C.sub, lineHeight: 1.7,
              maxHeight: 180, overflowY: 'auto',
              background: C.bg, borderRadius: 6, padding: 12, marginBottom: 12,
              whiteSpace: 'pre-wrap',
            }}>
              {CONSTITUTION_TEXT}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: C.sub, marginBottom: 6 }}>
                Your citizen name (stored on-chain)
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alice Smith"
                maxLength={64}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 12px', fontSize: 12,
                  border: `1px solid ${C.border}`, borderRadius: 6,
                  fontFamily: 'inherit', color: C.text, background: C.bg,
                  outline: 'none',
                }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: C.gold }}
              />
              <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                I have read and accept the founding constitution of {colony.name}
              </span>
            </label>
            {txError && (
              <div style={{ fontSize: 11, color: C.red, marginBottom: 10 }}>{txError}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setJoining(false)} disabled={txPending} style={{ ...btn(C.faint, '#fff', C.faint), flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={!accepted || txPending || !citizenName.trim()}
                style={{ ...btn(accepted && citizenName.trim() ? C.gold : C.faint), flex: 2, opacity: accepted && citizenName.trim() && !txPending ? 1 : 0.5 }}
              >
                {txPending ? 'Waiting for confirmation...' : 'Sign & Join →'}
              </button>
            </div>
          </div>
        )}

        {/* MCC Services */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
            MCC SERVICES
          </div>
          {colony.services.map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              paddingBottom: i < colony.services.length - 1 ? 10 : 0,
              marginBottom: i < colony.services.length - 1 ? 10 : 0,
              borderBottom: i < colony.services.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.faint }}>{s.billing}</div>
              </div>
              <div style={{ fontSize: 12, color: C.gold, fontWeight: 500, textAlign: 'right' }}>
                {s.price}
              </div>
            </div>
          ))}
        </div>

        {/* Citizens */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>CITIZENS</div>
          {citizensLoading ? (
            <div style={{ fontSize: 11, color: C.faint }}>Loading…</div>
          ) : !citizens || citizens.length === 0 ? (
            <div style={{ fontSize: 11, color: C.faint }}>No citizens yet.</div>
          ) : citizens.map(({ addr, name }, i) => (
            <div key={addr} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: i < citizens.length - 1 ? 10 : 0,
              marginBottom: i < citizens.length - 1 ? 10 : 0,
              borderBottom: i < citizens.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 12, color: C.text }}>{name || '(unnamed)'}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2, fontFamily: 'monospace' }}>
                  {addr.slice(0, 10)}…{addr.slice(-6)}
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.faint }}>#{i + 1}</div>
            </div>
          ))}
        </div>

        {/* Constitution accordion */}
        <div
          style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 20 }}
        >
          <button
            onClick={() => setShowConstitution(v => !v)}
            style={{
              width: '100%', background: 'none', border: 'none',
              padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>FOUNDING CONSTITUTION</span>
            <span style={{ fontSize: 14, color: C.faint }}>{showConstitution ? '↑' : '↓'}</span>
          </button>
          {showConstitution && (
            <div style={{
              padding: '0 16px 16px',
              fontSize: 11, color: C.sub, lineHeight: 1.8,
              whiteSpace: 'pre-wrap', borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
            }}>
              {CONSTITUTION_TEXT}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}

function Chip({ label, color }) {
  const col = color || '#888'
  return (
    <span style={{
      fontSize: 10, color: col, border: `1px solid ${col}`,
      borderRadius: 10, padding: '2px 8px', letterSpacing: '0.06em',
    }}>
      {label}
    </span>
  )
}

function btn(bg, color = '#fff', border) {
  return {
    padding: '12px 16px', background: bg, color,
    border: border ? `1px solid ${border}` : 'none',
    borderRadius: 8, fontSize: 12, cursor: 'pointer',
    letterSpacing: '0.04em', fontWeight: 500,
  }
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
