import { useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../components/Layout'
import { useWallet } from '../App'

import { C } from '../theme'

export default function RequestPayment() {
  const { slug }         = useParams()
  const [searchParams]   = useSearchParams()
  const { address, isConnected, connect } = useWallet()

  // Optional: company can pre-fill its own address via ?from=0x...
  const fromAddr = searchParams.get('from') || address || ''
  const fromLabel = searchParams.get('label') || null

  const [amount, setAmount]     = useState('')
  const [note,   setNote]       = useState('')
  const [generated, setGen]     = useState(false)
  const [copied, setCopied]     = useState(false)

  const DAPP_HOST = 'app.zpc.finance'
  const payPath  = `/colony/${slug}/pay?to=${fromAddr}&amount=${encodeURIComponent(amount)}&note=${encodeURIComponent(note)}`
  // MetaMask deep link — scanning this with iPhone camera opens MetaMask app directly
  const payUrl   = `https://metamask.app.link/dapp/${DAPP_HOST}${payPath}`

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(payUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [payUrl])

  const canGenerate = amount && Number(amount) > 0 && fromAddr

  if (!isConnected && !fromAddr) return (
    <Layout title="Request Payment" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Connect your wallet to request payment.</div>
        <button onClick={connect} style={primaryBtn}>Connect Wallet</button>
      </div>
    </Layout>
  )

  if (generated) return (
    <Layout title="Awaiting Payment" back={null} colonySlug={slug}>
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Amount display */}
        <div style={{ marginBottom: 4, fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>AMOUNT DUE</div>
        <div style={{ fontSize: 48, fontWeight: 500, color: C.gold, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {amount} <span style={{ fontSize: 22, color: C.faint }}>S</span>
        </div>
        {note && (
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 20, textAlign: 'center' }}>{note}</div>
        )}
        {!note && <div style={{ marginBottom: 20 }} />}

        {/* QR code */}
        <div style={{
          background: C.white, border: `2px solid ${C.gold}`,
          borderRadius: 12, padding: 20, marginBottom: 20,
        }}>
          <QRCodeSVG
            value={payUrl}
            size={220}
            fgColor={C.text}
            bgColor="#ffffff"
            level="M"
          />
        </div>

        <div style={{ fontSize: 11, color: C.faint, marginBottom: 4, textAlign: 'center' }}>
          {fromLabel ? fromLabel : `${fromAddr.slice(0, 8)}...${fromAddr.slice(-6)}`}
        </div>
        <div style={{ fontSize: 10, color: C.faint, marginBottom: 8, textAlign: 'center' }}>
          Customer scans with iPhone camera — opens MetaMask automatically
        </div>
        <div style={{ fontSize: 10, color: C.faint, marginBottom: 24, textAlign: 'center' }}>
          MetaMask must be installed on customer's phone
        </div>

        <button onClick={copyLink} style={{ ...primaryBtn, background: C.sub, marginBottom: 10 }}>
          {copied ? 'Copied!' : 'Copy link (fallback)'}
        </button>

        <button
          onClick={() => { setGen(false); setAmount(''); setNote('') }}
          style={{ ...primaryBtn, background: '#888' }}
        >
          New Request
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout title="Request Payment" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '20px 16px 0' }}>

        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 20 }}>
          Enter the amount and an optional note. The buyer scans the QR code to pay instantly.
        </div>

        {fromLabel && (
          <div style={{ fontSize: 11, color: C.gold, marginBottom: 16, letterSpacing: '0.06em' }}>
            RECEIVING AS: {fromLabel}
          </div>
        )}

        {/* Amount */}
        <div style={fieldGroup}>
          <label style={fieldLabel}>AMOUNT (S-TOKENS)</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: 28 }}
              type="number"
              min="1"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.faint }}>S</span>
          </div>
        </div>

        {/* Note */}
        <div style={fieldGroup}>
          <label style={fieldLabel}>NOTE (optional)</label>
          <input
            style={inputStyle}
            placeholder="e.g. Coffee and cake"
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={80}
          />
        </div>

        <button
          onClick={() => setGen(true)}
          disabled={!canGenerate}
          style={{ ...primaryBtn, opacity: canGenerate ? 1 : 0.4 }}
        >
          Generate QR Code →
        </button>
      </div>
    </Layout>
  )
}

const fieldGroup  = { marginBottom: 20 }
const fieldLabel  = { display: 'block', fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }
const inputStyle  = {
  width: '100%', padding: '12px 12px',
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 16, color: C.text, background: C.white, outline: 'none',
}
const primaryBtn  = {
  width: '100%', padding: '14px',
  background: C.gold, color: C.bg,
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
}
