import { useState, useEffect } from 'react'
import { fetchCitizens } from '../utils/fetchCitizens'
import { shortAddr } from '../utils/addrLabel'
import { C } from '../theme'

/**
 * SendSheet — inline payment form
 *
 * Props:
 *   maxAmount      number        — max sendable S-tokens
 *   label          string        — sheet heading
 *   colonyAddr     string        — colony contract address; enables citizen picker
 *   senderAddress  string        — filters sender out of citizen list
 *   onClose        () => void
 *   onConfirm      (amount, recipient, note) => void
 */
export default function SendSheet({ maxAmount, label = 'Send S-tokens', onClose, onConfirm, colonyAddr, senderAddress }) {
  const [citizens, setCitizens] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)   // { address, name }

  const [amount, setAmount] = useState('')
  const [note,   setNote]   = useState('')
  const [sent,   setSent]   = useState(false)

  // Load colony citizens
  useEffect(() => {
    if (!colonyAddr) return
    setLoading(true)
    fetchCitizens(colonyAddr)
      .then(list => {
        setCitizens(
          list.filter(c =>
            !senderAddress || c.address.toLowerCase() !== senderAddress.toLowerCase()
          )
        )
      })
      .finally(() => setLoading(false))
  }, [colonyAddr, senderAddress])

  const filtered = citizens.filter(c => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
  })

  const amt   = Number(amount)
  const valid = selected && amt > 0 && amt <= maxAmount

  function handleSend() {
    if (!valid) return
    onConfirm(amt, selected.address, note)
    setSent(true)
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (sent) return (
    <div style={{ ...sheet, background: `${C.green}18`, borderColor: C.green }}>
      <div style={{ fontSize: 13, color: C.green, fontWeight: 500, marginBottom: 4 }}>
        ✓ {amt} S sent
      </div>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
        To: {selected?.name || selected?.address}
        {note && <><br />Note: {note}</>}
      </div>
      <button onClick={onClose} style={closeBtn}>Done</button>
    </div>
  )

  return (
    <div style={sheet}>
      <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>
        {label.toUpperCase()}
      </div>

      {/* ── Recipient picker ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>
          RECIPIENT
        </div>

        {selected ? (
          // Selected state — show chip + change link
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: `${C.gold}12`, border: `1px solid ${C.gold}`,
            borderRadius: 6, padding: '8px 12px',
          }}>
            <div>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{selected.name}</div>
              <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace', marginTop: 2 }}>
                {shortAddr(selected.address)}
              </div>
            </div>
            <button
              onClick={() => { setSelected(null); setSearch('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.gold, padding: 0 }}
            >
              change
            </button>
          </div>
        ) : (
          // Picker — search input + scrollable list
          <div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={loading ? 'Loading citizens…' : 'Search by name…'}
              disabled={loading}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px', border: `1px solid ${C.border}`,
                borderRadius: '6px 6px 0 0', fontSize: 12,
                color: C.text, background: C.white, outline: 'none',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
            <div style={{
              maxHeight: 160, overflowY: 'auto',
              border: `1px solid ${C.border}`, borderTop: 'none',
              borderRadius: '0 0 6px 6px',
              background: C.white,
            }}>
              {loading ? (
                <div style={{ padding: '12px 12px', fontSize: 12, color: C.faint }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '12px 12px', fontSize: 12, color: C.faint }}>
                  {citizens.length === 0 ? 'No other citizens found.' : 'No match.'}
                </div>
              ) : (
                filtered.map((c, i) => (
                  <button
                    key={c.address}
                    onClick={() => setSelected(c)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      width: '100%', padding: '9px 12px',
                      background: 'none', border: 'none',
                      borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    <span style={{ fontSize: 12, color: C.text }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: C.faint }}>{shortAddr(c.address)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Amount ────────────────────────────────────────────────────── */}
      <Field
        label={`Amount (max ${maxAmount} S)`}
        value={amount}
        onChange={setAmount}
        placeholder="S-tokens to send"
        type="number"
      />

      {/* ── Note ──────────────────────────────────────────────────────── */}
      <Field
        label="Note (optional)"
        value={note}
        onChange={setNote}
        placeholder="e.g. Coffee order, March invoice"
      />

      {amt > maxAmount && (
        <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>
          Exceeds available balance ({maxAmount} S).
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ ...btn(C.faint, '#fff', C.border), flex: 1 }}>
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={!valid}
          style={{ ...btn(C.gold), flex: 2, opacity: valid ? 1 : 0.4 }}
        >
          Send →
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <input
        style={{
          width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`,
          borderRadius: 6, fontSize: 13, color: C.text, background: C.white,
          outline: 'none', boxSizing: 'border-box',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        type={type || 'text'}
      />
    </div>
  )
}

const sheet = {
  background: C.white, border: `1px solid ${C.gold}`,
  borderRadius: 8, padding: 16, marginBottom: 10,
}

const closeBtn = {
  width: '100%', padding: '10px', background: C.white,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 12, cursor: 'pointer', color: C.sub,
}

function btn(bg, color = '#fff', border) {
  return {
    padding: '11px 14px', background: bg, color,
    border: border ? `1px solid ${border}` : 'none',
    borderRadius: 6, fontSize: 12, cursor: 'pointer',
    letterSpacing: '0.04em', fontWeight: 500,
  }
}
