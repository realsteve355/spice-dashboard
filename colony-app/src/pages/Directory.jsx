import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'

// ColonyRegistry — on-chain source of truth for all active colonies.
const REGISTRY_ADDRESS = "0x9B8Eee5C078166d1b89A38Dae774773C89e53B9a"
const REGISTRY_ABI = [
  "function getActive() view returns (address[])",
  "function entries(address) view returns (address colony, string name, string slug, address founder, uint256 registeredAt, uint256 tokenId)",
  "function tokenURI(uint256) view returns (string)",
  "function tokenIdToColony(uint256) view returns (address)",
]
const BASE_SEPOLIA_RPC = "https://sepolia.base.org"

// TODO: colony type and visibility should ultimately come from on-chain
// (Colony contract or registry metadata). Currently:
//   type — read from localStorage if the user has visited this colony before;
//          falls back to 'earth' (only existing colonies are Earth).
//   visibility — placeholder 'public' for every colony until the access-list
//          mechanism is designed and shipped.
function getColonyMeta(slug) {
  let type = 'earth'
  try {
    const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
    if (stored[slug]?.colonyType) type = stored[slug].colonyType
  } catch {}
  return { type, visibility: 'public' }
}

const TYPE_LABEL = { earth: 'EARTH', mars: 'MARS' }

export default function Directory() {
  const navigate = useNavigate()
  const { isCitizenOf } = useWallet()

  const [colonies,       setColonies]       = useState(null)   // null = loading
  const [registryError,  setRegistryError]  = useState(false)

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC)
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider)

    registry.getActive()
      .then(async (addresses) => {
        if (addresses.length === 0) { setColonies([]); return }
        const entries = await Promise.all(addresses.map(addr => registry.entries(addr)))
        const valid = entries.filter(e => e.slug && e.name && e.colony !== ethers.ZeroAddress)
        setColonies(valid.map(e => ({
          id:      e.slug,
          name:    e.name,
          address: e.colony,
          founder: e.founder,
          tokenId: Number(e.tokenId),
          ...getColonyMeta(e.slug),
        })))
      })
      .catch(err => {
        console.warn('ColonyRegistry read failed:', err)
        setRegistryError(true)
        setColonies([])
      })
  }, [])

  const loading = colonies === null

  return (
    <Layout title="SPICE Colony">
      <div style={{ padding: '20px 16px 0' }}>

        {/* Hero */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>
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

        {/* Create CTA — primary button, square corners, warm-white bg */}
        <button
          onClick={() => navigate('/create')}
          style={{
            width: '100%', padding: '13px', marginBottom: 24,
            background: C.text, color: C.bg,
            border: `1px solid ${C.text}`, borderRadius: 0,
            fontSize: 11, cursor: 'pointer',
            letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
            fontFamily: "'IBM Plex Mono', monospace",
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
            <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.18em', marginBottom: 12, textTransform: 'uppercase' }}>
              {colonies.length} {colonies.length === 1 ? 'COLONY' : 'COLONIES'}
              {!registryError && (
                <span style={{ marginLeft: 8, color: C.faint }}>· on-chain</span>
              )}
              {registryError && (
                <span style={{ marginLeft: 8, color: C.red }}>· registry unavailable</span>
              )}
            </div>

            {colonies.map(colony => {
              const isCitizen = isCitizenOf(colony.id)
              const isMars    = colony.type === 'mars'
              return (
                <div
                  key={colony.id}
                  onClick={() => navigate(`/colony/${colony.id}?address=${colony.address}`)}
                  style={{
                    background: C.panel || C.white,
                    border: `1px solid ${isCitizen ? C.text : (C.borderHot || C.border)}`,
                    borderRadius: 0, padding: '16px', marginBottom: 10,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{colony.name}</div>
                    {isCitizen && <Badge label="CITIZEN" tone={C.text} />}
                  </div>
                  <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>
                    {colony.id}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge
                      label={TYPE_LABEL[colony.type] || colony.type.toUpperCase()}
                      tone={isMars ? '#f87171' : '#60a5fa'}
                    />
                    <Badge
                      label={colony.visibility.toUpperCase()}
                      tone={C.sub}
                    />
                  </div>
                </div>
              )
            })}
          </>
        )}

        <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 10, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          app.zpc.finance · Base Sepolia testnet
        </div>
      </div>
    </Layout>
  )
}

function Badge({ label, tone }) {
  return (
    <span style={{
      fontSize: 9, color: tone, border: `1px solid ${tone}`,
      borderRadius: 0, padding: '2px 8px',
      letterSpacing: '0.18em', textTransform: 'uppercase', flexShrink: 0,
      lineHeight: 1.4,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {label}
    </span>
  )
}
