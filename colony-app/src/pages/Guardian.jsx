import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useWallet } from '../App'

import { C } from '../theme'

function ageFrom(dob) {
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function yearsToAdulthood(dob) {
  return Math.max(0, 18 - ageFrom(dob))
}

export default function Guardian() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const { isCitizenOf } = useWallet()

  const isCitizen = isCitizenOf(slug)

  const [children, setChildren]     = useState([])
  const [selected, setSelected]     = useState(children[0]?.id || null)
  const [registering, setReg]       = useState(false)
  const [savingChild, setSaving]    = useState(null)
  const [saveAmt, setSaveAmt]       = useState('')
  const [expanded, setExpanded]     = useState(null)

  // Register new child form state
  const [newName,  setNewName]  = useState('')
  const [newDob,   setNewDob]   = useState('')
  const [newWallet,setNewWallet]= useState('')

  const child = children.find(c => c.id === selected)

  function registerChild() {
    const age = ageFrom(newDob)
    if (age >= 18) return
    const c = {
      id: `child-${Date.now()}`,
      name: newName || 'Minor',
      dateOfBirth: newDob,
      registeredDate: '9 Apr 2026',
      sBalance: 0,
      vBalance: 0,
      vSavedThisMonth: 0,
      vMaxMonthly: 200,
      ubiAmount: 1000,
      mccBill: { total: 0, breakdown: [] },
      transactions: [],
    }
    setChildren(cs => [...cs, c])
    setSelected(c.id)
    setReg(false)
    setNewName(''); setNewDob(''); setNewWallet('')
  }

  function confirmSave(childId) {
    const amt = Number(saveAmt)
    if (!amt || amt <= 0) return
    setChildren(cs => cs.map(c =>
      c.id === childId
        ? {
            ...c,
            sBalance: Math.max(0, c.sBalance - amt),
            vBalance: c.vBalance + amt,
            vSavedThisMonth: c.vSavedThisMonth + amt,
            transactions: [
              { label: 'Saved to V (guardian)', amount: -amt, date: '9 Apr 2026' },
              ...c.transactions,
            ],
          }
        : c
    ))
    setSaving(null)
    setSaveAmt('')
  }

  if (!isCitizen) return (
    <Layout title="Guardianship" back={`/colony/${slug}/profile`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        You are not a citizen of this colony.
      </div>
    </Layout>
  )

  return (
    <Layout title="Guardianship" back={`/colony/${slug}/profile`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 16 }}>
          Children are registered from birth and receive full UBI immediately.
          As guardian you manage their wallet until they turn 18 and sign the constitution themselves.
        </div>

        {/* Child selector */}
        {children.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 16,
                  border: `1px solid ${c.id === selected ? C.gold : C.border}`,
                  background: c.id === selected ? C.gold : C.white,
                  color: c.id === selected ? '#fff' : C.sub,
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Register new child button */}
        {!registering && (
          <button onClick={() => setReg(true)} style={{ ...ghostBtn, width: '100%', marginBottom: 14 }}>
            + Register a child
          </button>
        )}

        {/* Register form */}
        {registering && (
          <div style={{ ...card, borderColor: C.gold, background: '#fffbf0', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>REGISTER CHILD</div>
            <Field label="Child's name (for your reference)" value={newName} onChange={setNewName} placeholder="e.g. Alex" />
            <Field label="Date of birth" value={newDob} onChange={setNewDob} placeholder="YYYY-MM-DD" type="date" />
            <Field label="Child's wallet address (optional)" value={newWallet} onChange={setNewWallet} placeholder="0x... (can be added later)" />
            {newDob && ageFrom(newDob) >= 18 && (
              <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>
                This person is 18 or over and must register themselves.
              </div>
            )}
            <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginBottom: 12 }}>
              UBI starts on the 1st of next month. You will manage this wallet until the child turns 18
              and signs the constitution themselves, at which point the V-token pool transfers to them automatically.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setReg(false)} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
              <button
                onClick={registerChild}
                disabled={!newDob || ageFrom(newDob) >= 18}
                style={{ ...primaryBtn, flex: 2, opacity: newDob && ageFrom(newDob) < 18 ? 1 : 0.4 }}
              >
                Register on-chain →
              </button>
            </div>
          </div>
        )}

        {/* Child dashboard */}
        {child && (
          <div>
            {/* Age / adulthood countdown */}
            <div style={{ ...card, background: '#fffbf0', borderColor: C.gold }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 2 }}>{child.name}</div>
                  <div style={{ fontSize: 11, color: C.faint }}>
                    Age {ageFrom(child.dateOfBirth)} · Registered {child.registeredDate}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: C.gold }}>{yearsToAdulthood(child.dateOfBirth)} years</div>
                  <div style={{ fontSize: 10, color: C.faint }}>until adulthood</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: C.sub, lineHeight: 1.5 }}>
                At 18 this citizen signs the constitution, receives their G-token, and the V-token
                pool (currently <span style={{ color: C.green }}>{child.vBalance} V</span>) transfers to their wallet automatically.
              </div>
            </div>

            {/* Token balances */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>S BALANCE</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: C.gold }}>{child.sBalance}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>resets end of month</div>
              </div>
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>V BALANCE</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: C.green }}>{child.vBalance}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>accumulated</div>
              </div>
            </div>

            {/* MCC bill */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: child.mccBill.breakdown.length > 0 ? 10 : 0 }}>
                <span style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>MCC BILL MTD</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.red }}>{child.mccBill.total} S</span>
              </div>
              {child.mccBill.breakdown.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.sub }}>
                  <span>{b.service}</span>
                  <span style={{ color: C.red }}>{b.amount} S</span>
                </div>
              ))}
            </div>

            {/* Save to V action */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>SAVE TO V-TOKENS</span>
                <span style={{ fontSize: 11, color: C.sub }}>
                  {child.vSavedThisMonth} / {child.vMaxMonthly} this month
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ background: '#f0f0f0', borderRadius: 3, height: 4, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  width: `${(child.vSavedThisMonth / child.vMaxMonthly) * 100}%`,
                  height: '100%', background: C.green,
                }} />
              </div>

              {savingChild === child.id ? (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      style={{ ...inlineInput, flex: 1 }}
                      placeholder={`max ${child.vMaxMonthly - child.vSavedThisMonth} S`}
                      value={saveAmt}
                      onChange={e => setSaveAmt(e.target.value)}
                      type="number"
                      min="1"
                      max={child.vMaxMonthly - child.vSavedThisMonth}
                    />
                    <button
                      onClick={() => confirmSave(child.id)}
                      disabled={!saveAmt}
                      style={{ ...primaryBtn, padding: '9px 14px', fontSize: 11, opacity: saveAmt ? 1 : 0.4 }}
                    >
                      Confirm
                    </button>
                  </div>
                  <button onClick={() => setSaving(null)} style={{ fontSize: 11, color: C.faint, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setSaving(child.id); setSaveAmt('') }}
                  disabled={child.vSavedThisMonth >= child.vMaxMonthly}
                  style={{
                    ...primaryBtn, width: '100%',
                    opacity: child.vSavedThisMonth < child.vMaxMonthly ? 1 : 0.4,
                  }}
                >
                  Save S → V (guardian)
                </button>
              )}
            </div>

            {/* Transaction history */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>TRANSACTIONS</div>
              {child.transactions.length === 0 ? (
                <div style={{ fontSize: 12, color: C.faint }}>No transactions yet.</div>
              ) : (
                child.transactions.map((tx, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: i < child.transactions.length - 1 ? 10 : 0,
                    marginBottom:  i < child.transactions.length - 1 ? 10 : 0,
                    borderBottom:  i < child.transactions.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.text }}>{tx.label}</div>
                      <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{tx.date}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: tx.amount > 0 ? C.green : C.red }}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} S
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {children.length === 0 && !registering && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.faint, fontSize: 12 }}>
            No dependants registered. Children may be registered from birth.
          </div>
        )}

      </div>
    </Layout>
  )
}

function Field({ label, value, onChange, placeholder, type }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>{label.toUpperCase()}</div>
      <input
        style={{ width: '100%', padding: '11px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.text, background: C.white, outline: 'none' }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        type={type || 'text'}
      />
    </div>
  )
}

const card       = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 10 }
const primaryBtn = { padding: '11px 16px', background: C.gold, color: C.bg, border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500 }
const ghostBtn   = { padding: '11px 14px', background: C.white, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', letterSpacing: '0.04em' }
const inlineInput = { padding: '9px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.text, background: C.white, outline: 'none' }
