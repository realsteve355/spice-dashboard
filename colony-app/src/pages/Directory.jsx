import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { MOCK_COLONIES } from '../data/mock'
import { useWallet } from '../App'

const C = {
  gold:   '#B8860B',
  border: '#e2e2e2',
  white:  '#ffffff',
  text:   '#111',
  sub:    '#555',
  faint:  '#aaa',
}

export default function Directory() {
  const navigate = useNavigate()
  const { isConnected, isCitizenOf } = useWallet()

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
            background: C.gold, color: '#fff',
            border: 'none', borderRadius: 8,
            fontSize: 13, cursor: 'pointer', letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          + Create a Colony
        </button>

        {/* Colony list */}
        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
          {MOCK_COLONIES.length} COLONIES
        </div>

        {MOCK_COLONIES.map(colony => {
          const isCitizen = isCitizenOf(colony.id)
          return (
            <div
              key={colony.id}
              onClick={() => navigate(`/colony/${colony.id}`)}
              style={{
                background: C.white, border: `1px solid ${C.border}`,
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

              <div style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>
                {colony.citizenCount} citizens · Est. {fmtDate(colony.founded)} · {colony.mcc.name}
              </div>

              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                {colony.description}
              </div>
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
