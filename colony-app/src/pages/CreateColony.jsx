import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useWallet } from '../App'

import { C } from '../theme'

const FIXED_PARAMS = [
  { label: 'UBI per citizen',        value: '1,000 S-tokens / month' },
  { label: 'Max monthly savings',    value: '200 S-tokens → V'       },
  { label: 'Adulthood',              value: '18 years'               },
  { label: 'MCC recall trigger',     value: 'Bill +20% above 12m avg'},
  { label: 'Constitutional change',  value: '80% referendum required'},
  { label: 'V-token expiry',         value: '100 years from mint'    },
  { label: 'Harberger fee',          value: '0.5% declared value/mo' },
]

export default function CreateColony() {
  const navigate  = useNavigate()
  const { isConnected, connect, address } = useWallet()

  const [step, setStep]           = useState(1)
  const [name, setName]           = useState('')
  const [ticker, setTicker]       = useState('')
  const [tickerEdited, setTickerEdited] = useState(false)
  const [description, setDesc]    = useState('')
  const [boards, setBoards]       = useState([''])
  const [accepted, setAccepted]   = useState(false)
  const [deploying, setDeploying] = useState(false)

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  function handleNameChange(e) {
    const v = e.target.value
    setName(v)
    if (!tickerEdited) {
      const words = v.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
      const derived = words.map(w => w[0]).join('').toUpperCase().slice(0, 5) || v.slice(0, 3).toUpperCase()
      setTicker(derived)
    }
  }

  function handleTickerChange(e) {
    setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))
    setTickerEdited(true)
  }

  function addBoard() { setBoards(b => [...b, '']) }
  function updateBoard(i, v) { setBoards(b => b.map((x, idx) => idx === i ? v : x)) }
  function removeBoard(i) { setBoards(b => b.filter((_, idx) => idx !== i)) }

  function handleDeploy() {
    setDeploying(true)
    setTimeout(() => {
      setDeploying(false)
      setStep(4)
    }, 1800)
  }

  if (!isConnected) return (
    <Layout title="Create a Colony" back="/">
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.6 }}>
          You need a wallet to create a colony.
        </div>
        <button onClick={connect} style={primaryBtn}>Connect Wallet</button>
      </div>
    </Layout>
  )

  return (
    <Layout title="Create a Colony" back="/">
      <div style={{ padding: '20px 16px 0' }}>

        {/* Step indicator */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: step >= n ? C.gold : C.border,
              }} />
            ))}
          </div>
        )}

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div>
            <div style={stepTitle}>Name your colony</div>
            <div style={stepSub}>This becomes your colony's permanent identity on the blockchain.</div>

            <div style={fieldGroup}>
              <label style={fieldLabel}>Colony name</label>
              <input
                style={input}
                placeholder="e.g. Turing Campus"
                value={name}
                onChange={handleNameChange}
                autoFocus
              />
              {slug && (
                <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                  URL: app.zpc.finance/colony/<span style={{ color: C.gold }}>{slug}</span>
                </div>
              )}
            </div>

            <div style={fieldGroup}>
              <label style={fieldLabel}>Token ticker (1–5 letters)</label>
              <input
                style={input}
                placeholder="e.g. TC"
                value={ticker}
                onChange={handleTickerChange}
                maxLength={5}
              />
              {ticker && (
                <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                  tokens:&nbsp;
                  <span style={{ color: C.gold }}>S-{ticker}</span>
                  &nbsp;·&nbsp;
                  <span style={{ color: C.gold }}>V-{ticker}</span>
                  &nbsp;·&nbsp;
                  <span style={{ color: C.gold }}>G-{ticker}</span>
                </div>
              )}
            </div>

            <div style={fieldGroup}>
              <label style={fieldLabel}>Description <span style={{ color: C.faint }}>(optional)</span></label>
              <textarea
                style={{ ...input, height: 80, resize: 'none' }}
                placeholder="A short description of your colony and its purpose."
                value={description}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim() || !ticker.trim()}
              style={{ ...primaryBtn, opacity: name.trim() && ticker.trim() ? 1 : 0.4 }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: MCC Board ── */}
        {step === 2 && (
          <div>
            <div style={stepTitle}>Designate the MCC board</div>
            <div style={stepSub}>
              The MCC provides essential services and bills citizens monthly.
              The founding board is not elected — the first election is at Year 1 end.
            </div>

            {boards.map((addr, i) => (
              <div key={i} style={fieldGroup}>
                <label style={fieldLabel}>
                  {i === 0 ? 'Board member 1 (you)' : `Board member ${i + 1}`}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...input, flex: 1 }}
                    placeholder={i === 0 ? address : '0x...'}
                    value={i === 0 ? address : addr}
                    onChange={e => i > 0 && updateBoard(i, e.target.value)}
                    readOnly={i === 0}
                  />
                  {i > 0 && (
                    <button
                      onClick={() => removeBoard(i)}
                      style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '0 12px', cursor: 'pointer', color: C.faint }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            {boards.length < 6 && (
              <button
                onClick={addBoard}
                style={{ ...ghostBtn, width: '100%', marginBottom: 20 }}
              >
                + Add board member
              </button>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ ...ghostBtn, flex: 1 }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ ...primaryBtn, flex: 2 }}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Constitution ── */}
        {step === 3 && (
          <div>
            <div style={stepTitle}>Review the founding constitution</div>
            <div style={stepSub}>
              These rules are fixed. They may only be amended by 80% referendum of all registered citizens.
            </div>

            {/* Fixed parameters */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>
                FIXED PARAMETERS
              </div>
              {FIXED_PARAMS.map((p, i) => (
                <div key={i} style={{
                  padding: '10px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: i < FIXED_PARAMS.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: 11, color: C.sub }}>{p.label}</span>
                  <span style={{ fontSize: 11, color: C.gold, fontWeight: 500 }}>{p.value}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 11, color: C.sub, lineHeight: 1.7 }}>
              <span style={{ color: C.gold }}>Colony:</span> {name}<br />
              <span style={{ color: C.gold }}>Tokens:</span> S-{ticker} · V-{ticker} · G-{ticker}<br />
              <span style={{ color: C.gold }}>URL:</span> app.zpc.finance/colony/{slug}<br />
              <span style={{ color: C.gold }}>MCC board:</span> {boards.length} member{boards.length !== 1 ? 's' : ''}<br />
              <span style={{ color: C.gold }}>Network:</span> Base Sepolia
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: C.gold, flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                I have read and accept the founding constitution. I understand that these rules are fixed and may only be amended by 80% referendum.
              </span>
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(2)} style={{ ...ghostBtn, flex: 1 }}>← Back</button>
              <button
                onClick={handleDeploy}
                disabled={!accepted || deploying}
                style={{ ...primaryBtn, flex: 2, opacity: accepted && !deploying ? 1 : 0.4 }}
              >
                {deploying ? 'Deploying...' : 'Deploy Colony →'}
              </button>
            </div>

            {deploying && (
              <div style={{ marginTop: 12, fontSize: 11, color: C.faint, textAlign: 'center' }}>
                Deploying Fisc contracts to Base Sepolia...
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Confirmation ── */}
        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⬡</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: C.text, marginBottom: 8 }}>
              Colony deployed
            </div>
            <div style={{ fontSize: 13, color: C.gold, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 11, color: C.faint, marginBottom: 24, lineHeight: 1.6 }}>
              G-token issued · G-token #0001<br />
              Your first 1,000 S-tokens arrive 1 May 2026
            </div>

            {/* Share */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 16, marginBottom: 20, textAlign: 'left',
            }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>SHARE YOUR COLONY</div>
              <div style={{
                fontSize: 12, color: C.sub, background: C.bg,
                padding: '10px 12px', borderRadius: 6, marginBottom: 10,
                wordBreak: 'break-all',
              }}>
                app.zpc.finance/colony/{slug}
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(`https://app.zpc.finance/colony/${slug}`)}
                style={{ ...ghostBtn, width: '100%' }}
              >
                Copy invite link
              </button>
            </div>

            <button
              onClick={() => navigate(`/colony/${slug}/dashboard`)}
              style={{ ...primaryBtn, width: '100%' }}
            >
              Go to Dashboard →
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}

const primaryBtn = {
  padding: '13px 16px', background: C.gold, color: C.bg,
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
  width: '100%',
}

const ghostBtn = {
  padding: '12px 16px', background: C.white, color: C.sub,
  border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12,
  cursor: 'pointer', letterSpacing: '0.04em',
}

const stepTitle = { fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8 }
const stepSub   = { fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 20 }
const fieldGroup = { marginBottom: 16 }
const fieldLabel = { display: 'block', fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }
const input = {
  width: '100%', padding: '11px 12px',
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 13, color: C.text, background: C.white,
  outline: 'none',
}
