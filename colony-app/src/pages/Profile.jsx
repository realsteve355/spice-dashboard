import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { MOCK_PROFILE, MOCK_COLONIES, MOCK_CITIZEN_DATA } from '../data/mock'
import { useWallet } from '../App'

const C = {
  gold:   '#B8860B',
  border: '#e2e2e2',
  white:  '#ffffff',
  text:   '#111',
  sub:    '#555',
  faint:  '#aaa',
  bg:     '#f5f5f5',
  green:  '#16a34a',
  red:    '#ef4444',
  purple: '#8b5cf6',
}

export default function Profile() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { address, disconnect, isCitizenOf } = useWallet()

  const colony    = MOCK_COLONIES.find(c => c.id === slug)
  const profile   = MOCK_PROFILE[slug]
  const citizen   = MOCK_CITIZEN_DATA[slug]
  const isCitizen = isCitizenOf(slug)

  const [partner,  setPartner]  = useState(profile?.partner  || '')
  const [offspring, setOff]     = useState(profile?.offspring || [])
  const [customDes, setCustom]  = useState(profile?.inheritanceDesignation || '')
  const [editInherit, setEdit]  = useState(false)
  const [saved, setSaved]       = useState(false)

  function addOffspring() { setOff(o => [...o, '']) }
  function updateOff(i, v) { setOff(o => o.map((x, idx) => idx === i ? v : x)) }
  function removeOff(i)    { setOff(o => o.filter((_, idx) => idx !== i)) }

  function saveInheritance() {
    setSaved(true)
    setEdit(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!isCitizen || !profile) return (
    <Layout title="Profile" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        You are not a citizen of this colony.
      </div>
    </Layout>
  )

  const inheritSummary = partner
    ? `Partner (${partner.slice(0, 12)}...)` + (offspring.length > 0 ? `, then ${offspring.length} offspring` : '')
    : offspring.length > 0
    ? `${offspring.length} offspring`
    : 'Default: Fisc pool'

  return (
    <Layout title="My Profile" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Identity */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>IDENTITY</div>

          <Row label="Colony"      value={colony?.name || slug} />
          <Div />
          <Row label="Wallet"      value={address || '—'} mono />
          <Div />
          <Row label="G-token"     value={`#${String(profile.gTokenId).padStart(4, '0')}`} color={C.purple} />
          <Div />
          <Row label="Registered"  value={profile.registeredDate} />
          <Div />
          <Row label="UBI"         value={`${citizen?.ubiAmount || 1000} S / month`} color={C.gold} />
        </div>

        {/* V-token batches */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>V-TOKEN BATCHES</div>
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>
            V-tokens expire 100 years from mint date.
          </div>
          {profile.vBatches.map((b, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: i < profile.vBatches.length - 1 ? 8 : 0,
              marginBottom:  i < profile.vBatches.length - 1 ? 8 : 0,
              borderBottom:  i < profile.vBatches.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <span style={{ fontSize: 12, color: C.sub }}>Minted {b.minted}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: C.green }}>{b.amount} V</div>
                <div style={{ fontSize: 10, color: C.faint }}>expires {b.expiresYear}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: C.sub }}>Total</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>
              {profile.vBatches.reduce((s, b) => s + b.amount, 0)} V
            </span>
          </div>
        </div>

        {/* Inheritance */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>INHERITANCE</div>
            {!editInherit && (
              <button
                onClick={() => setEdit(true)}
                style={{ fontSize: 11, color: C.gold, background: 'none', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '3px 10px', cursor: 'pointer' }}
              >
                Edit
              </button>
            )}
          </div>

          {saved && (
            <div style={{ fontSize: 12, color: C.green, marginBottom: 10 }}>
              ✓ Inheritance designation saved on-chain
            </div>
          )}

          {!editInherit ? (
            <div>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>{inheritSummary}</div>
              <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
                Default order: registered partner → equal split among offspring → Fisc pool.
                You may designate an alternative at any time.
              </div>
            </div>
          ) : (
            <div>
              {/* Partner */}
              <div style={fieldGroup}>
                <label style={fieldLabel}>Registered partner wallet</label>
                <input
                  style={inputStyle}
                  placeholder="0x... (leave blank if none)"
                  value={partner}
                  onChange={e => setPartner(e.target.value)}
                />
              </div>

              {/* Offspring */}
              <div style={fieldGroup}>
                <label style={fieldLabel}>Registered offspring</label>
                {offspring.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="0x wallet address"
                      value={w}
                      onChange={e => updateOff(i, e.target.value)}
                    />
                    <button
                      onClick={() => removeOff(i)}
                      style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: C.faint }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={addOffspring} style={{ ...ghostBtn, width: '100%' }}>
                  + Add offspring
                </button>
              </div>

              {/* Custom designation */}
              <div style={fieldGroup}>
                <label style={fieldLabel}>Custom designation <span style={{ color: C.faint }}>(overrides defaults)</span></label>
                <input
                  style={inputStyle}
                  placeholder="0x wallet address (optional)"
                  value={customDes}
                  onChange={e => setCustom(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEdit(false)} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
                <button onClick={saveInheritance} style={{ ...primaryBtn, flex: 2 }}>Save on-chain →</button>
              </div>
            </div>
          )}
        </div>

        {/* Dependants */}
        <div
          onClick={() => navigate(`/colony/${slug}/guardian`)}
          style={{ ...card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 2 }}>Dependants</div>
            <div style={{ fontSize: 11, color: C.faint }}>Manage child wallets and savings</div>
          </div>
          <span style={{ fontSize: 18, color: C.faint }}>›</span>
        </div>

        {/* Danger zone */}
        <div style={{ ...card, borderColor: '#fee2e2' }}>
          <div style={{ fontSize: 11, color: C.red, letterSpacing: '0.1em', marginBottom: 12 }}>WALLET</div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, lineHeight: 1.6 }}>
            Disconnecting your wallet does not affect your colony membership,
            token balances, or G-token. Your registration remains on the Fisc blockchain.
          </div>
          <button
            onClick={() => { disconnect(); navigate('/') }}
            style={{
              width: '100%', padding: '11px', background: 'none',
              border: `1px solid ${C.red}`, borderRadius: 8,
              color: C.red, fontSize: 12, cursor: 'pointer',
            }}
          >
            Disconnect wallet
          </button>
        </div>

      </div>
    </Layout>
  )
}

function Row({ label, value, color, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
      <span style={{
        fontSize: mono ? 11 : 12,
        color: color || '#111',
        fontFamily: mono ? 'monospace' : 'inherit',
        maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}

function Div() {
  return <div style={{ borderBottom: '1px solid #e2e2e2', margin: '8px 0' }} />
}

const card       = { background: '#ffffff', border: '1px solid #e2e2e2', borderRadius: 8, padding: 16, marginBottom: 10 }
const fieldGroup = { marginBottom: 14 }
const fieldLabel = { display: 'block', fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }
const inputStyle = { width: '100%', padding: '11px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.text, background: C.white, outline: 'none' }
const primaryBtn = { padding: '11px 16px', background: C.gold, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500 }
const ghostBtn   = { padding: '10px 14px', background: '#fff', color: C.sub, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em' }
