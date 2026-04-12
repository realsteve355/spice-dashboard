import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { MOCK_COLONIES } from '../data/mock'
import { useWallet } from '../App'
import { C } from '../theme'

export default function Directory() {
  const navigate = useNavigate()
  const { isConnected, isCitizenOf, onChain } = useWallet()

  // Merge mock colonies with any user-deployed colonies from localStorage
  const userColonies = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
  const mockIds = new Set(MOCK_COLONIES.map(c => c.id))
  const extraColonies = Object.entries(userColonies)
    .filter(([id]) => !mockIds.has(id))
    .map(([id, info]) => ({
      id,
      name:         info.name || id,
      description:  '',
      founded:      null,
      citizenCount: null,
      mcc:          { name: 'Not yet configured' },
    }))
  const allColonies = [...MOCK_COLONIES, ...extraColonies]

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
        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
          {allColonies.length} {allColonies.length === 1 ? 'COLONY' : 'COLONIES'}
        </div>

        {allColonies.map(colony => {
          const isCitizen = isCitizenOf(colony.id)
          const chain     = onChain?.[colony.id]
          const count     = chain?.isCitizen !== undefined
            ? null  // don't show mock count if we have chain data
            : colony.citizenCount
          return (
            <div
              key={colony.id}
              onClick={() => navigate(`/colony/${colony.id}`)}
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

        <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 11, color: C.faint }}>
          app.zpc.finance · Base Sepolia testnet
        </div>
      </div>
    </Layout>
  )
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
