import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import SendSheet from '../components/SendSheet'
import { MOCK_COLONIES, MOCK_CITIZEN_DATA, MOCK_MY_EQUITY, DAYS_TO_RESET, RESET_DATE, CURRENT_MONTH } from '../data/mock'
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

export default function Dashboard() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { isConnected, isCitizenOf, isMccOf, citizenColonies, connect } = useWallet()

  const colony    = MOCK_COLONIES.find(c => c.id === slug)
  const data      = MOCK_CITIZEN_DATA[slug]
  const isCitizen = isCitizenOf(slug)
  const isMcc     = isMccOf(slug)

  const [saving, setSaving]     = useState(false)
  const [saveAmt, setSaveAmt]   = useState('')
  const [redeeming, setRedeem]  = useState(false)
  const [redeemAmt, setRedeemAmt] = useState('')
  const [sending, setSending]   = useState(false)

  if (!isConnected) return (
    <Layout title="Dashboard" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Connect your wallet to view your dashboard.</div>
        <button onClick={connect} style={primaryBtn}>Connect Wallet</button>
      </div>
    </Layout>
  )

  if (!colony || !data || !isCitizen) return (
    <Layout title="Dashboard" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        You are not a citizen of this colony.
      </div>
    </Layout>
  )

  const spentOnMcc  = data.mccBill.total
  const savedToV    = data.vSavedThisMonth
  const totalUsed   = spentOnMcc + savedToV
  const remaining   = data.sBalance
  const spentPct    = Math.round((spentOnMcc / data.ubiAmount) * 100)
  const savedPct    = Math.round((savedToV   / data.ubiAmount) * 100)
  const remainPct   = Math.round((remaining  / data.ubiAmount) * 100)

  return (
    <Layout title={colony.name} back={`/colony/${slug}`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Colony switcher (if citizen of multiple) */}
        {citizenColonies.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {citizenColonies.map(id => {
              const c = MOCK_COLONIES.find(x => x.id === id)
              return (
                <button
                  key={id}
                  onClick={() => navigate(`/colony/${id}/dashboard`)}
                  style={{
                    flexShrink: 0,
                    padding: '5px 12px', borderRadius: 16,
                    border: `1px solid ${id === slug ? C.gold : C.border}`,
                    background: id === slug ? C.gold : C.white,
                    color: id === slug ? '#fff' : C.sub,
                    fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
                  }}
                >
                  {c?.name || id}
                </button>
              )
            })}
          </div>
        )}

        {/* S-token balance */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>S-TOKEN BALANCE</div>
            <div style={{ fontSize: 11, color: C.faint }}>Resets in {DAYS_TO_RESET}d</div>
          </div>

          <div style={{ fontSize: 40, fontWeight: 500, color: C.gold, marginBottom: 2, letterSpacing: '-0.02em' }}>
            {remaining.toLocaleString()} <span style={{ fontSize: 18, color: C.faint }}>S</span>
          </div>
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 14 }}>{CURRENT_MONTH}</div>

          {/* Progress bar */}
          <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ width: `${spentPct}%`,  background: C.red    }} />
              <div style={{ width: `${savedPct}%`,  background: C.green  }} />
              <div style={{ width: `${remainPct}%`, background: C.gold   }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 10, color: C.faint, marginBottom: 14 }}>
            <LegendDot color={C.red}   label={`${spentOnMcc} S MCC`}    />
            <LegendDot color={C.green} label={`${savedToV} S saved`}    />
            <LegendDot color={C.gold}  label={`${remaining} S remaining`} />
          </div>

          <button
            onClick={() => setSending(v => !v)}
            style={{ ...smallBtn(C.gold), width: '100%' }}
          >
            Send S-tokens →
          </button>

          {sending && (
            <div style={{ marginTop: 10 }}>
              <SendSheet
                maxAmount={remaining}
                label="Send S-tokens"
                onClose={() => setSending(false)}
                onConfirm={(amt, recipient, note) => setSending(false)}
              />
            </div>
          )}
        </div>

        {/* V-token balance */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>V-TOKEN BALANCE</div>
            <div style={{ fontSize: 11, color: C.green }}>never expires</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 500, color: C.green, marginBottom: 12, letterSpacing: '-0.02em' }}>
            {data.vBalance.toLocaleString()} <span style={{ fontSize: 16, color: C.faint }}>V</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setSaving(v => !v)}
              style={{ ...smallBtn(C.green), flex: 1 }}
            >
              Save S → V
            </button>
            <button
              onClick={() => setRedeem(v => !v)}
              style={{ ...smallBtn(C.sub, '#fff', C.border), flex: 1 }}
            >
              Redeem V → S
            </button>
          </div>

          {saving && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input
                style={{ ...inlineInput, flex: 1 }}
                placeholder={`max ${data.vMaxMonthly - data.vSavedThisMonth} S this month`}
                value={saveAmt}
                onChange={e => setSaveAmt(e.target.value)}
                type="number"
              />
              <button onClick={() => setSaving(false)} style={smallBtn(C.green)}>Confirm</button>
            </div>
          )}
          {redeeming && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input
                style={{ ...inlineInput, flex: 1 }}
                placeholder={`max ${data.vBalance} V`}
                value={redeemAmt}
                onChange={e => setRedeemAmt(e.target.value)}
                type="number"
              />
              <button onClick={() => setRedeem(false)} style={smallBtn(C.sub, '#fff', C.border)}>Confirm</button>
            </div>
          )}
        </div>

        {/* MCC bill */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>MCC BILL — {CURRENT_MONTH}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.red }}>{data.mccBill.total} S</div>
          </div>
          {data.mccBill.breakdown.length === 0 ? (
            <div style={{ fontSize: 12, color: C.faint }}>No charges this month.</div>
          ) : (
            data.mccBill.breakdown.map((b, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 12, color: C.sub,
                paddingBottom: i < data.mccBill.breakdown.length - 1 ? 8 : 0,
                marginBottom: i < data.mccBill.breakdown.length - 1 ? 8 : 0,
                borderBottom: i < data.mccBill.breakdown.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <span>{b.service}</span>
                <span style={{ color: C.red }}>{b.amount} S</span>
              </div>
            ))
          )}
        </div>

        {/* Governance / G-token */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>GOVERNANCE</div>
            <button
              onClick={() => navigate(`/colony/${slug}/profile`)}
              style={{ fontSize: 11, color: C.faint, background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '3px 10px', cursor: 'pointer' }}
            >
              My Profile
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.sub }}>G-token</span>
            <span style={{ fontSize: 12, color: C.purple }}>#{String(data.gTokenId).padStart(4, '0')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: C.sub }}>Open votes</span>
            <span
              onClick={() => navigate(`/colony/${slug}/votes`)}
              style={{ fontSize: 12, color: C.gold, cursor: 'pointer', textDecoration: 'underline' }}
            >
              2 open →
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate(`/colony/${slug}/votes`)}
              style={{ ...smallBtn(C.purple), flex: 1 }}
            >
              Vote →
            </button>
            {isMcc && (
              <button
                onClick={() => navigate(`/colony/${slug}/admin`)}
                style={{ ...smallBtn('#555', '#fff', C.border), flex: 1 }}
              >
                MCC Admin →
              </button>
            )}
          </div>
        </div>

        {/* My Companies */}
        {(() => {
          const myEquity = MOCK_MY_EQUITY[slug] || []
          return (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>MY COMPANIES</div>
                <button
                  onClick={() => navigate(`/colony/${slug}/company/new`)}
                  style={{ fontSize: 11, color: C.gold, background: 'none', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '3px 10px', cursor: 'pointer' }}
                >
                  + Register
                </button>
              </div>
              {myEquity.length === 0 ? (
                <div style={{ fontSize: 12, color: C.faint }}>No companies yet.</div>
              ) : (
                myEquity.map((co, i) => (
                  <div
                    key={co.companyId}
                    onClick={() => navigate(`/colony/${slug}/company/${co.companyId}`)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingBottom: i < myEquity.length - 1 ? 10 : 0,
                      marginBottom: i < myEquity.length - 1 ? 10 : 0,
                      borderBottom: i < myEquity.length - 1 ? `1px solid ${C.border}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: C.text }}>{co.name}</div>
                      <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>
                        {co.pct}% equity
                        {co.lastDividendV > 0 && ` · last div: ${co.lastDividendV} V`}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: C.faint }}>›</span>
                  </div>
                ))
              )}
            </div>
          )
        })()}

        {/* Transactions */}
        <div style={{ ...card, marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>RECENT TRANSACTIONS</div>
          {data.transactions.map((tx, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: i < data.transactions.length - 1 ? 10 : 0,
              marginBottom: i < data.transactions.length - 1 ? 10 : 0,
              borderBottom: i < data.transactions.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 12, color: C.text }}>{tx.label}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{tx.date}</div>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 500,
                color: tx.amount > 0 ? C.green : C.red,
              }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} {txUnit(tx.type)}
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  )
}

function txUnit(type) {
  if (type === 'save')   return 'S→V'
  if (type === 'redeem') return 'V→S'
  return 'S'
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  )
}

const card = {
  background: '#ffffff', border: '1px solid #e2e2e2',
  borderRadius: 8, padding: 16, marginBottom: 10,
}

const primaryBtn = {
  padding: '13px 16px', background: C.gold, color: '#fff',
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
}

function smallBtn(bg, color = '#fff', border) {
  return {
    padding: '9px 14px', background: bg, color,
    border: border ? `1px solid ${border}` : 'none',
    borderRadius: 6, fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
  }
}

const inlineInput = {
  padding: '9px 10px', border: '1px solid #e2e2e2',
  borderRadius: 6, fontSize: 12, color: '#111', background: '#fff', outline: 'none',
}
