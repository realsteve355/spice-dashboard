import { useNavigate, useLocation } from 'react-router-dom'
import { useWallet } from '../App'
import { C } from '../theme'

export default function Layout({ children, title, back, colonySlug }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isConnected, address, connect, citizenColonies } = useWallet()

  const path = location.pathname

  // Derive active tab for bottom nav
  const isHome      = path === '/'
  const isCreate    = path === '/create'
  const isDashboard = path.includes('/dashboard')

  // Primary colony for dashboard link (first citizen colony, or current slug)
  const dashSlug = colonySlug || citizenColonies[0] || null

  return (
    <div style={{ background: C.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>

      {/* ── Top bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: '0 16px',
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {back && (
            <button
              onClick={() => navigate(back)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.gold, padding: '4px 8px 4px 0', lineHeight: 1 }}
            >
              ←
            </button>
          )}
          <span style={{ fontSize: 13, fontWeight: 500, color: C.text, letterSpacing: '0.03em' }}>
            {title || 'SPICE Colony'}
          </span>
        </div>

        {isConnected ? (
          <div style={{
            fontSize: 11, color: C.gold, border: `1px solid ${C.gold}`,
            borderRadius: 20, padding: '4px 10px', letterSpacing: '0.04em',
          }}>
            {address}
          </div>
        ) : (
          <button
            onClick={connect}
            style={{
              fontSize: 11, color: C.bg, background: C.gold,
              border: 'none', borderRadius: 20, padding: '5px 12px',
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* ── Page content ── */}
      <div style={{ paddingBottom: isConnected ? 72 : 24 }}>
        {children}
      </div>

      {/* ── Bottom nav (connected only) ── */}
      {isConnected && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480,
          background: C.white,
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          <NavTab
            label="Colonies"
            icon="⬡"
            active={isHome}
            onClick={() => navigate('/')}
          />
          {dashSlug ? (
            <NavTab
              label="Dashboard"
              icon="◈"
              active={isDashboard}
              onClick={() => navigate(`/colony/${dashSlug}/dashboard`)}
            />
          ) : (
            <NavTab label="Dashboard" icon="◈" active={false} muted />
          )}
          <NavTab
            label="Create"
            icon="+"
            active={isCreate}
            onClick={() => navigate('/create')}
          />
        </div>
      )}
    </div>
  )
}

function NavTab({ label, icon, active, onClick, muted }) {
  return (
    <button
      onClick={onClick}
      disabled={muted}
      style={{
        flex: 1,
        background: 'none',
        border: 'none',
        cursor: muted ? 'default' : 'pointer',
        padding: '10px 0 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}
    >
      <span style={{ fontSize: 18, color: muted ? C.faint : active ? C.gold : C.text, lineHeight: 1 }}>
        {icon}
      </span>
      <span style={{ fontSize: 10, color: muted ? C.faint : active ? C.gold : C.text, letterSpacing: '0.06em' }}>
        {label}
      </span>
    </button>
  )
}
