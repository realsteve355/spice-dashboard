import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useWallet } from '../App'
import { C } from '../theme'
import { useNotifications } from '../utils/useNotifications'

// Context-sensitive help content keyed by page type.
// Key is derived from the current URL path in getHelpKey().
const HELP = {
  mall: {
    title: 'The Colony Mall',
    sections: [
      {
        heading: 'Browsing stores',
        body: 'The Mall lists every company in the colony that has products for sale. Tap "Browse →" on any store to see what they\'re selling.',
      },
      {
        heading: 'Buying',
        body: 'Select a product and tap "Buy". You can optionally add a delivery note — a date, time, or collection preference. The payment is made directly from your S-token balance to the company wallet.',
      },
      {
        heading: 'Opening a store',
        body: 'If you are the secretary of a registered company, go to your company page and you will find the store linked from the Mall automatically. Add products from the store page.',
      },
    ],
  },
  store: {
    title: 'Store',
    sections: [
      {
        heading: 'Buying a product',
        body: 'Tap "Buy" on any product. You can optionally add delivery notes (e.g. a date, time, or address). You\'ll then confirm the S-token payment on the next screen.',
      },
      {
        heading: 'Managing your store',
        body: 'If you are the company secretary, you can add products, edit listings, hide items that are temporarily unavailable, and upload product photos. Photos can be added after a product is listed by tapping the image area.',
      },
      {
        heading: 'Pricing',
        body: 'Prices are set in S-tokens — the colony\'s everyday currency. Citizens receive S as basic income from the MCC, so prices should reflect what the colony economy can support.',
      },
    ],
  },
  governance: {
    title: 'MCC Governance',
    sections: [
      {
        heading: 'Election phases',
        body: 'Each election runs through four phases:\n\n1. NOMINATIONS — any citizen can open an election; citizens nominate candidates during this window\n2. VOTING — each citizen casts one vote for their preferred candidate\n3. FINALISE — after voting closes, anyone taps Finalise to count votes and record the winner\n4. EXECUTE — after the timelock expires, anyone taps Execute to install the winner in post',
      },
      {
        heading: 'Timings',
        body: 'On this testnet: nominations 15 min, voting 30 min, timelock 5 min. Mainnet will use 7 / 14 / 7 days respectively.',
      },
      {
        heading: 'Resign',
        body: 'Any current role holder can resign immediately using the Resign button. The role becomes vacant and a new election can be opened straight away.',
      },
    ],
  },
  dashboard: {
    title: 'Colony Dashboard',
    sections: [
      {
        heading: 'S-tokens',
        body: 'S-tokens are your everyday colony currency. Use them to pay local businesses, send to other citizens, or buy products in the Mall. The MCC issues S as basic income — claim yours daily with the UBI button.',
      },
      {
        heading: 'V-tokens',
        body: 'V-tokens are long-term savings. Convert S → V to lock earnings; V-tokens accrue yield from colony economic activity. V cannot be spent directly — redeem back to S when you need liquidity.',
      },
      {
        heading: 'Sending S',
        body: 'Tap "Send S" to transfer to any citizen or company address. You can add a note (e.g. "Coffee, 12 May") which appears in both wallets\' transaction history.',
      },
    ],
  },
  company: {
    title: 'Company',
    sections: [
      {
        heading: 'Tabs',
        body: 'Overview — company wallet balance and secretary actions\nEquity — shareholder register, vesting schedule, dividends\nAccounts — full transaction journal with P&L summary\nContracts — supply agreements with other colony companies',
      },
      {
        heading: 'Secretary role',
        body: 'The secretary controls the company wallet: send S to pay suppliers, convert S → V to lock earnings, declare V dividends to shareholders, and issue equity stakes.',
      },
      {
        heading: 'Equity',
        body: 'Open shares are freely transferable (for investors). Vesting shares unlock in monthly tranches and are forfeited if the participant stops contributing — the secretary can forfeit unvested shares.',
      },
    ],
  },
  assets: {
    title: 'Your Assets',
    sections: [
      {
        heading: 'Token types',
        body: 'S-tokens — spendable everyday currency\nV-tokens — long-term savings, earns yield\nG-token — your citizenship credential (soulbound, non-transferable)\nA-tokens — company equity stakes\nO-tokens — obligation tokens (work commitments)',
      },
    ],
  },
  default: {
    title: 'SPICE Colony',
    sections: [
      {
        heading: 'What is SPICE Colony?',
        body: 'A community economic system where citizens receive S-tokens as basic income and spend them within the colony. Companies issue equity, trade with each other, and sell products in the Mall.',
      },
      {
        heading: 'Getting started',
        body: '1. Connect your MetaMask wallet\n2. Find a colony in the directory and register as a citizen\n3. Claim your daily UBI from the Dashboard\n4. Browse the Mall, or register a company if you have something to offer',
      },
      {
        heading: 'Need help with a specific page?',
        body: 'Navigate to that page, then tap the Help tab for context-specific guidance.',
      },
    ],
  },
}

function getHelpKey(path) {
  if (/\/mall\//.test(path))     return 'store'
  if (/\/mall/.test(path))       return 'mall'
  if (/\/votes/.test(path))      return 'governance'
  if (/\/dashboard/.test(path))  return 'dashboard'
  if (/\/company\//.test(path))  return 'company'
  if (/\/assets/.test(path))     return 'assets'
  return 'default'
}

export default function Layout({ children, title, back, colonySlug }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isConnected, address, connect, disconnect, citizenColonies } = useWallet()

  const [helpOpen,  setHelpOpen]  = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const { notifications, unseenCount, markAllSeen } = useNotifications(
    isConnected ? colonySlug : null,
    isConnected ? address    : null,
  )

  // Mark all seen when the drawer opens
  useEffect(() => {
    if (notifOpen && unseenCount > 0) markAllSeen()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifOpen])

  const path = location.pathname

  // Derive active tab states
  const isMall      = path.includes('/mall')
  const isDashboard = path.includes('/dashboard')

  // Colony to link to for Mall + Dashboard (current slug, else first citizen colony)
  const navSlug = colonySlug || citizenColonies[0] || null

  // Help content for current page
  const helpKey     = getHelpKey(path)
  const helpContent = HELP[helpKey] || HELP.default

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Notification bell — only when on a colony page */}
            {colonySlug && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  title="Notifications"
                  style={{
                    background: 'none', border: `1px solid ${C.border}`,
                    borderRadius: '50%', width: 24, height: 24,
                    cursor: 'pointer', color: unseenCount > 0 ? C.gold : C.faint,
                    fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0, lineHeight: 1, flexShrink: 0,
                  }}
                >
                  ◎
                </button>
                {unseenCount > 0 && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#ef4444', color: '#fff',
                    borderRadius: '50%', minWidth: 14, height: 14,
                    fontSize: 9, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 2px', lineHeight: 1, pointerEvents: 'none',
                  }}>
                    {unseenCount > 9 ? '9+' : unseenCount}
                  </div>
                )}
              </div>
            )}
            <div style={{
              fontSize: 11, color: C.gold, border: `1px solid ${C.gold}`,
              borderRadius: 20, padding: '4px 10px', letterSpacing: '0.04em',
            }}>
              {address?.slice(0, 6)}…{address?.slice(-4)}
            </div>
            <button
              onClick={disconnect}
              title="Disconnect wallet"
              style={{
                background: 'none', border: `1px solid ${C.border}`,
                borderRadius: '50%', width: 22, height: 22,
                cursor: 'pointer', color: C.faint, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, lineHeight: 1, flexShrink: 0,
              }}
            >
              ×
            </button>
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
          {/* Mall */}
          {navSlug ? (
            <NavTab
              label="Mall"
              icon="⊞"
              active={isMall}
              onClick={() => navigate(`/colony/${navSlug}/mall`)}
            />
          ) : (
            <NavTab label="Mall" icon="⊞" active={false} muted />
          )}

          {/* Dashboard */}
          {navSlug ? (
            <NavTab
              label="Dashboard"
              icon="◈"
              active={isDashboard}
              onClick={() => navigate(`/colony/${navSlug}/dashboard`)}
            />
          ) : (
            <NavTab label="Dashboard" icon="◈" active={false} muted />
          )}

          {/* Help */}
          <NavTab
            label="Help"
            icon="?"
            active={helpOpen}
            onClick={() => setHelpOpen(v => !v)}
          />
        </div>
      )}

      {/* ── Notification bottom sheet ── */}
      {notifOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) setNotifOpen(false) }}
        >
          <div style={{
            background: C.white, borderRadius: '16px 16px 0 0',
            padding: '20px 20px 48px', width: '100%', maxWidth: 480,
            maxHeight: '75vh', overflowY: 'auto',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 18px' }} />
            <div style={{ fontSize: 12, color: C.gold, letterSpacing: '0.1em', marginBottom: 16 }}>
              NOTIFICATIONS
            </div>

            {notifications.length === 0 ? (
              <div style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: '24px 0' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id}
                  onClick={() => { if (n.link) { navigate(n.link); setNotifOpen(false) } }}
                  style={{
                    paddingBottom: i < notifications.length - 1 ? 12 : 0,
                    marginBottom:  i < notifications.length - 1 ? 12 : 0,
                    borderBottom:  i < notifications.length - 1 ? `1px solid ${C.border}` : 'none',
                    cursor: n.link ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{n.title}</div>
                  {n.body && (
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>{n.body}</div>
                  )}
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                    {n.link && <span style={{ color: C.gold, marginLeft: 6 }}>view →</span>}
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => setNotifOpen(false)}
              style={{
                width: '100%', marginTop: 16,
                padding: '11px 0', background: 'none',
                border: `1px solid ${C.border}`, borderRadius: 8,
                fontSize: 11, color: C.sub, cursor: 'pointer',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Help bottom sheet ── */}
      {helpOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) setHelpOpen(false) }}
        >
          <div style={{
            background: C.white, borderRadius: '16px 16px 0 0',
            padding: '20px 20px 48px', width: '100%', maxWidth: 480,
            maxHeight: '75vh', overflowY: 'auto',
          }}>
            {/* Handle bar */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 18px' }} />

            <div style={{ fontSize: 12, color: C.gold, letterSpacing: '0.1em', marginBottom: 16 }}>
              {helpContent.title.toUpperCase()}
            </div>

            {helpContent.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 6, letterSpacing: '0.03em' }}>
                  {section.heading}
                </div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {section.body}
                </div>
              </div>
            ))}

            <button
              onClick={() => setHelpOpen(false)}
              style={{
                width: '100%', marginTop: 8,
                padding: '11px 0', background: 'none',
                border: `1px solid ${C.border}`, borderRadius: 8,
                fontSize: 11, color: C.sub, cursor: 'pointer',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Close
            </button>
          </div>
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
