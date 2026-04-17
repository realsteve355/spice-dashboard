import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import CONTRACTS from '../data/contracts.json'
import { useWallet } from '../App'
import { C } from '../theme'

// ColonyRegistry deployed on Base Sepolia
// Set to address(0) until registry is deployed — falls back to localStorage + contracts.json
const REGISTRY_ADDRESS = "0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d"
const REGISTRY_ABI = [
  "function getAll() view returns (address[])",
  "function entries(address) view returns (address colony, string name, string slug, address founder, uint256 registeredAt)",
  "function count() view returns (uint256)",
]
const BASE_SEPOLIA_RPC = "https://sepolia.base.org"

const REGISTRY_DEPLOYED = REGISTRY_ADDRESS !== "0x6F0Cb784E977f45f9c5D6c99BE30A988F2EA807C"

export default function Directory() {
  const navigate = useNavigate()
  const { isConnected, isCitizenOf, onChain } = useWallet()

  const [registryColonies, setRegistryColonies] = useState(null)  // null = loading, [] = loaded
  const [registryError,    setRegistryError]    = useState(null)

  // Read all colonies from ColonyRegistry if deployed
  useEffect(() => {
    if (!REGISTRY_DEPLOYED) {
      setRegistryColonies([])
      return
    }
    // Fallback: if registry doesn't respond within 8s, show localStorage entries anyway
    const timeout = setTimeout(() => {
      setRegistryColonies(prev => prev === null ? [] : prev)
    }, 8000)

    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC)
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider)
    registry.getAll()
      .then(async (addresses) => {
        if (addresses.length === 0) { setRegistryColonies([]); return }
        const entries = await Promise.all(
          addresses.map(addr => registry.entries(addr))
        )
        const filtered = entries.filter(e => e.slug && e.name && e.colony !== ethers.ZeroAddress)
        console.log('[Directory] registry getAll:', addresses.length, 'addresses,', filtered.length, 'valid entries', filtered.map(e => e.slug))
        setRegistryColonies(filtered
          .map(e => ({
            id:          e.slug,
            name:        e.name,
            address:     e.colony,
            founder:     e.founder,
            description: '',
            founded:     null,
            citizenCount: null,
            mcc:         { name: 'MCC' },
            source:      'registry',
          })))
      })
      .catch(err => {
        console.warn('ColonyRegistry read failed:', err)
        setRegistryError(true)
        setRegistryColonies([])
      })
      .finally(() => clearTimeout(timeout))
  }, [])

  // Build colony list: registry (if available) + contracts.json + localStorage fallback
  const allColonies = buildColonyList(registryColonies)

  // Only show spinner if registry is still loading AND we have nothing at all to display yet.
  // contracts.json + localStorage colonies are always available immediately — never hide them
  // behind a registry spinner.
  const loading = REGISTRY_DEPLOYED && registryColonies === null && allColonies.length === 0

  return (
    <Layout title="SPICE Colony">
      <div style={{ padding: '20px 16px 0' }}>

        {/* Hero */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            SPICE Protocol
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>
            Active Colonies
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
            Each colony is an independent closed-loop economy running the SPICE token system.
            Join one or create your own.
          </div>
        </div>

        {/* Create CTA */}
        <button
          onClick={() => navigate('/create')}
          style={{
            width: '100%', padding: '13px', marginBottom: 24,
            background: C.gold, color: C.bg,
            border: 'none', borderRadius: 8,
            fontSize: 13, cursor: 'pointer', letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          + Create a Colony
        </button>

        {/* TEMP DEBUG — remove once directory issue resolved */}
        {(() => {
          const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
          const keys = Object.keys(stored)
          return (
            <div style={{ background: '#f0f4ff', border: '1px solid #99b', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 10, color: '#444', lineHeight: 1.8 }}>
              <div>localStorage keys: {keys.length > 0 ? keys.join(', ') : '(none)'}</div>
              <div>registry: {registryColonies === null ? 'loading…' : registryColonies.length + ' entries'}</div>
              <div>allColonies: {allColonies.length} — {allColonies.map(c => c.id).join(', ')}</div>
            </div>
          )
        })()}

        {/* Colony list */}
        {loading ? (
          <div style={{ fontSize: 11, color: C.faint, textAlign: 'center', padding: '24px 0' }}>
            Loading colonies…
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              {allColonies.length} {allColonies.length === 1 ? 'COLONY' : 'COLONIES'}
              {REGISTRY_DEPLOYED && registryColonies !== null && (
                <span style={{ marginLeft: 8, color: C.faint }}>· registry</span>
              )}
              {REGISTRY_DEPLOYED && registryColonies === null && (
                <span style={{ marginLeft: 8, color: C.faint }}>· syncing…</span>
              )}
              {registryError && (
                <span style={{ marginLeft: 8, color: '#ef4444' }}>· registry unavailable</span>
              )}
            </div>

            {allColonies.map(colony => {
              const isCitizen = isCitizenOf(colony.id)
              const chain     = onChain?.[colony.id]
              const count     = chain?.isCitizen !== undefined ? null : colony.citizenCount
              return (
                <div
                  key={colony.id}
                  onClick={() => navigate(`/colony/${colony.id}${colony.address ? `?address=${colony.address}` : ''}`)}
                  style={{
                    background: C.white, border: `1px solid ${isCitizen ? C.gold : C.border}`,
                    borderRadius: 8, padding: '16px', marginBottom: 10,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{colony.name}</div>
                    {isCitizen && (
                      <div style={{
                        fontSize: 10, color: C.gold, border: `1px solid ${C.gold}`,
                        borderRadius: 10, padding: '2px 8px', letterSpacing: '0.06em', flexShrink: 0,
                      }}>
                        CITIZEN
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 11, color: C.faint, marginBottom: colony.description ? 8 : 0 }}>
                    {count !== null ? `${count} citizens · ` : ''}
                    {colony.founded ? `Est. ${fmtDate(colony.founded)} · ` : ''}
                    {colony.mcc.name}
                  </div>

                  {colony.description && (
                    <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginTop: 8 }}>
                      {colony.description}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 11, color: C.faint }}>
          app.zpc.finance · Base Sepolia testnet
        </div>
      </div>
    </Layout>
  )
}

/**
 * Merge colony sources in priority order:
 *   1. ColonyRegistry (on-chain, canonical — used when deployed)
 *   2. contracts.json (manually curated — always shown)
 *   3. localStorage spice_user_colonies (user-deployed, not yet in registry)
 */
function buildColonyList(registryColonies) {
  const seenIds      = new Set()
  const seenAddrs    = new Set()

  const add = (entry) => {
    seenIds.add(entry.id)
    if (entry.address) seenAddrs.add(entry.address.toLowerCase())
    return entry
  }

  // Registry entries (most authoritative once deployed)
  const fromRegistry = (registryColonies || []).map(add)

  // contracts.json entries not already covered by registry
  const fromContracts = Object.entries(CONTRACTS.colonies)
    .filter(([id, cfg]) => !seenIds.has(id) && (!cfg.colony || !seenAddrs.has(cfg.colony.toLowerCase())))
    .map(([id, cfg]) => add({
      id,
      name:        cfg.name || id,
      address:     cfg.colony || null,
      description: '',
      founded:     null,
      citizenCount: null,
      mcc:         { name: 'MCC' },
      source:      'contracts',
    }))

  // localStorage — user-deployed colonies not already shown by slug.
  // Only include entries with a real on-chain address — skip stale/fake entries
  // that may have been saved by earlier test deploys with no real contract.
  const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
  const fromStorage = Object.entries(stored)
    .filter(([id, info]) => !seenIds.has(id) && info.address && info.address !== '0x')
    .map(([id, info]) => add({
      id,
      name:        info.name || id,
      address:     info.address,
      description: '',
      founded:     null,
      citizenCount: null,
      mcc:         { name: 'Not yet registered' },
      source:      'local',
    }))

  // Final dedup pass — deduplicate by slug, address, OR name.
  // Catches "daves-colony" (registry) vs "dave-s-colony" (local) — same colony,
  // different slugs and potentially different addresses. Registry entry wins.
  const finalSlugs  = new Set()
  const finalAddrs  = new Set()
  const finalNames  = new Set()
  const all = [...fromRegistry, ...fromContracts, ...fromStorage].filter(c => {
    if (finalSlugs.has(c.id)) return false
    const addr = c.address?.toLowerCase()
    if (addr && finalAddrs.has(addr)) return false
    const name = c.name?.toLowerCase().trim()
    if (name && finalNames.has(name)) return false
    finalSlugs.add(c.id)
    if (addr) finalAddrs.add(addr)
    if (name) finalNames.add(name)
    return true
  })

  console.log('[Directory] registry:', fromRegistry.length, 'contracts:', fromContracts.length, 'localStorage:', fromStorage.length, '→ total:', all.length, all.map(c => c.id))
  return all
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
