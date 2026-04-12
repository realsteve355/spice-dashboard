import { useState } from 'react'
import { C } from '../theme'

/**
 * SendSheet — inline payment form
 *
 * Props:
 *   maxAmount  number        — max sendable S-tokens
 *   label      string        — e.g. "Send S-tokens", "Pay company"
 *   onClose    () => void
 *   onConfirm  (amount, recipient, note) => void
 */
export default function SendSheet({ maxAmount, label = 'Send S-tokens', onClose, onConfirm }) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount]       = useState('')
  const [note, setNote]           = useState('')
  const [sent, setSent]           = useState(false)

  const amt    = Number(amount)
  const valid  = recipient.trim() && amt > 0 && amt <= maxAmount

  function handleSend() {
    if (!valid) return
    onConfirm(amt, recipient, note)
    setSent(true)
  }

  if (sent) return (
    <div style={{ ...sheet, background: `${C.green}18`, borderColor: C.green }}>
      <div style={{ fontSize: 13, color: C.green, fontWeight: 500, marginBottom: 4 }}>
        ✓ {amt} S sent
      </div>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
        To: {recipient}
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

      <Field
        label={`Amount (max ${maxAmount} S)`}
        value={amount}
        onChange={setAmount}
        placeholder="S-tokens to send"
        type="number"
      />
      <Field
        label="Recipient — wallet address or company name"
        value={recipient}
        onChange={setRecipient}
        placeholder="0x... or company name"
      />
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
        style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.text, background: C.white, outline: 'none' }}
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
