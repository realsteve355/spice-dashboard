import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { logInfo, logError } from '../utils/logger'

const COLONY_ABI = [
  "function send(address, uint256, string) external",
]

import { C } from '../theme'

export default function PaymentConfirm() {
  const { slug }       = useParams()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const { isConnected, connect, signer, contracts, onChain, refresh, address } = useWallet()

  const to       = searchParams.get('to')       || ''
  const amount   = searchParams.get('amount')   || ''
  const note     = searchParams.get('note')     || ''
  const returnTo = searchParams.get('returnTo') || `/colony/${slug}/dashboard`

  const [pending, setPending] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState(null)

  const chain      = onChain?.[slug]
  const sBalance   = chain?.sBalance ?? 0
  const sufficient = Number(amount) <= sBalance

  async function handlePay() {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg || !signer) return
    setPending(true); setError(null)
    try {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.send(to, ethers.parseEther(String(amount)), note)
      logInfo('tx.submitted', { colony: slug, address: signer.address, txHash: tx.hash, message: `pay ${amount} S`, meta: { to, note } })
      await tx.wait()
      logInfo('tx.confirmed', { colony: slug, address: signer.address, txHash: tx.hash, message: `pay ${amount} S confirmed` })
      refresh()   // update S balance in wallet context

      // Notify recipient (fire-and-forget — don't block UI on failure)
      const fromShort = `${signer.address.slice(0, 6)}…${signer.address.slice(-4)}`
      const senderName = onChain?.[slug]?.citizenName
      const fromLabel  = senderName ? `${senderName} (${fromShort})` : fromShort
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colony: slug,
          address: to,
          type: 'payment_received',
          title: `${amount} S received`,
          body: note ? `"${note}" from ${fromLabel}` : `From ${fromLabel}`,
          link: `/colony/${slug}/dashboard`,
        }),
      }).catch(() => {})

      setDone(true)
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || e?.message || 'Transaction failed'
      logError('tx.failed', { colony: slug, address: signer?.address, message: msg, meta: { action: 'payment', to, amount, note } })
      setError(msg)
    }
    setPending(false)
  }

  // Invalid URL
  if (!to || !amount) return (
    <Layout title="Payment" back={returnTo} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: C.faint }}>
        Invalid payment request.
      </div>
    </Layout>
  )

  // Success
  if (done) return (
    <Layout title="Payment Sent" back={returnTo} colonySlug={slug}>
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: C.green, marginBottom: 8 }}>
          {amount} S sent
        </div>
        {note && (
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 24 }}>{note}</div>
        )}
        <button
          onClick={() => navigate(returnTo)}
          style={primaryBtn}
        >
          {returnTo.includes('/mall') ? '← Back to store' : 'Back to Dashboard →'}
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout title="Confirm Payment" back={returnTo} colonySlug={slug}>
      <div style={{ padding: '24px 16px 0' }}>

        {/* Payment summary card */}
        <div style={{
          background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 20, marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>YOU ARE PAYING</div>
          <div style={{ fontSize: 48, fontWeight: 500, color: C.gold, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {amount} <span style={{ fontSize: 22, color: C.faint }}>S</span>
          </div>
          {note && (
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>{note}</div>
          )}
          <div style={{ fontSize: 11, color: C.faint, fontFamily: 'monospace' }}>
            → {to.slice(0, 10)}...{to.slice(-8)}
          </div>
        </div>

        {/* Balance check */}
        {isConnected && (
          <div style={{
            background: sufficient ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${sufficient ? C.green : C.red}`,
            borderRadius: 6, padding: '10px 14px', marginBottom: 16,
            display: 'flex', justifyContent: 'space-between', fontSize: 12,
          }}>
            <span style={{ color: C.sub }}>Your S balance</span>
            <span style={{ color: sufficient ? C.green : C.red, fontWeight: 500 }}>
              {sBalance} S {sufficient ? '✓' : '— insufficient'}
            </span>
          </div>
        )}

        {error && (
          <div style={{ fontSize: 12, color: C.red, marginBottom: 12 }}>{error}</div>
        )}

        {!isConnected ? (
          <button onClick={connect} style={primaryBtn}>Connect Wallet to Pay</button>
        ) : (
          <button
            onClick={handlePay}
            disabled={pending || !sufficient}
            style={{ ...primaryBtn, opacity: pending || !sufficient ? 0.4 : 1 }}
          >
            {pending ? 'Confirming...' : `Pay ${amount} S →`}
          </button>
        )}

        <button
          onClick={() => navigate(returnTo)}
          style={{ ...primaryBtn, background: 'none', color: C.faint, border: `1px solid ${C.border}`, marginTop: 10 }}
        >
          Cancel
        </button>
      </div>
    </Layout>
  )
}

const primaryBtn = {
  width: '100%', padding: '14px',
  background: C.gold, color: C.bg,
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
  marginBottom: 0,
}
