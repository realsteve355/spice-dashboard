import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'

// ColonyRegistry — on-chain source of truth for all active colonies.
// Each registered colony holds a soulbound C-token (ERC-721) minted to its
// Colony contract address. This is the canonical list. contracts.json and
// localStorage are no longer used as colony sources.
const REGISTRY_ADDRESS = "0x2c82B62Cf3b258D95a8b5bf4F2658D0D509C9FF8"
const REGISTRY_ABI = [
  "function getActive() view returns (address[])",
  "function entries(address) view returns (address colony, string name, string slug, address founder, uint256 registeredAt, uint256 tokenId)",
  "function tokenURI(uint256) view returns (string)",
  "function tokenIdToColony(uint256) view returns (address)",
]
const BASE_SEPOLIA_RPC = "https://sepolia.base.org"

export default function Directory() {
  const navigate = useNavigate()
  const { isConnected, isCitizenOf, onChain } = useWallet()

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
              {colonies.length} {colonies.length === 1 ? 'COLONY' : 'COLONIES'}
              {!registryError && (
                <span style={{ marginLeft: 8, color: C.faint }}>· on-chain</span>
              )}
              {registryError && (
                <span style={{ marginLeft: 8, color: '#ef4444' }}>· registry unavailable</span>
              )}
            </div>

            {colonies.map(colony => {
              const isCitizen = isCitizenOf(colony.id)
              const chain     = onChain?.[colony.id]
              const count     = chain?.isCitizen !== undefined ? null : null
              return (
                <div
                  key={colony.id}
                  onClick={() => navigate(`/colony/${colony.id}?address=${colony.address}`)}
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
                  <div style={{ fontSize: 11, color: C.faint }}>
                    {colony.id}
                  </div>
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
