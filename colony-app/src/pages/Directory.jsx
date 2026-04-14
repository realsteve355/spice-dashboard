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
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC)
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider)
    registry.getAll()
      .then(async (addresses) => {
        const entries = await Promise.all(
          addresses.map(addr => registry.entries(addr))
        )
        setRegistryColonies(entries.map(e => ({
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
  }, [])

  // Build colony list: registry (if available) + contracts.json + localStorage fallback
  const allColonies = buildColonyList(registryColonies)

  const loading = REGISTRY_DEPLOYED && registryColonies === null

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

        {/* Colony list */}
        {loading ? (
          <div style={{ fontSize: 11, color: C.faint, textAlign: 'center', padding: '24px 0' }}>
            Loading colonies…
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              {allColonies.length} {allColonies.length === 1 ? 'COLONY' : 'COLONIES'}
              {REGISTRY_DEPLOYED && (
                <span style={{ marginLeft: 8, color: C.faint }}>· from registry</span>
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
  const seen = new Set()

  // Registry entries (most authoritative once deployed)
  const fromRegistry = (registryColonies || [])
  fromRegistry.forEach(c => seen.add(c.id))

  // contracts.json entries not already covered by registry
  const fromContracts = Object.entries(CONTRACTS.colonies)
    .filter(([id]) => !seen.has(id))
    .map(([id, cfg]) => {
      seen.add(id)
      return {
        id,
        name:        cfg.name || id,
        address:     cfg.colony || null,
        description: '',
        founded:     null,
        citizenCount: null,
        mcc:         { name: 'MCC' },
        source:      'contracts',
      }
    })

  // localStorage — user-deployed colonies not in registry or contracts.json
  const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
  const fromStorage = Object.entries(stored)
    .filter(([id]) => !seen.has(id))
    .map(([id, info]) => ({
      id,
      name:        info.name || id,
      address:     info.address || null,
      description: '',
      founded:     null,
      citizenCount: null,
      mcc:         { name: 'Not yet registered' },
      source:      'local',
    }))

  return [...fromRegistry, ...fromContracts, ...fromStorage]
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
