import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { logInfo, logError } from '../utils/logger'

const FACTORY_ABI = [
  "function deployCompany(string, address[], uint256[]) external returns (uint256)",
]

import { C } from '../theme'

export default function RegisterCompany() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { address, signer, contracts } = useWallet()

  const [name, setName]         = useState('')
  const [holders, setHolders]   = useState([{ wallet: address || '', pct: 100 }])
  const [deploying, setDeploy]  = useState(false)
  const [done, setDone]         = useState(false)
  const [txError, setTxError]   = useState(null)
  const [companyId, setCompanyId] = useState(null)

  const totalPct  = holders.reduce((s, h) => s + Number(h.pct || 0), 0)
  const pctValid  = totalPct === 100
  const canSubmit = name.trim() && pctValid

  function addHolder() {
    const remaining = 100 - totalPct
    setHolders(h => [...h, { wallet: '', pct: remaining > 0 ? remaining : 0 }])
  }

  function updateHolder(i, field, val) {
    setHolders(h => h.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  }

  function removeHolder(i) {
    setHolders(h => h.filter((_, idx) => idx !== i))
  }

  async function handleRegister() {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg || !signer) {
      // No contract configured — mock fallback
      setDeploy(true)
      setTimeout(() => { setDeploy(false); setDone(true) }, 1500)
      return
    }
    setDeploy(true); setTxError(null)
    try {
      const factory = new ethers.Contract(cfg.companyFactory, FACTORY_ABI, signer)
      const wallets = holders.map((h, i) => i === 0 ? address : h.wallet)
      const stakes  = holders.map(h => Math.round(Number(h.pct) * 100))  // bps (pct × 100, must sum to 10000)
      const tx = await factory.deployCompany(name.trim(), wallets, stakes)
      const receipt = await tx.wait()
      // Extract company wallet address from CompanyDeployed event
      const iface = new ethers.Interface(["event CompanyDeployed(uint256 indexed id, address indexed wallet, string name, address indexed founder, uint256 oTokenId)"])
      let companyWallet = null
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log)
          if (parsed) { companyWallet = parsed.args.wallet; setCompanyId(companyWallet); break }
        } catch {}
      }
      logInfo('company.deployed', { colony: slug, address, meta: { name: name.trim(), wallet: companyWallet } })
      setDone(true)
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || 'Transaction failed'
      logError('company.deploy_failed', { colony: slug, address, message: msg, meta: { name: name.trim() } })
      setTxError(msg)
    }
    setDeploy(false)
  }

  const slugId = companyId !== null ? String(companyId) : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  if (done) return (
    <Layout title="Company Registered" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>◈</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8 }}>
          {name} registered
        </div>
        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 24 }}>
          Your company is live on the Fisc blockchain.<br />
          Equity stakes have been assigned.
        </div>
        <button
          onClick={() => navigate(`/colony/${slug}/company/${slugId}`)}
          style={primaryBtn}
        >
          Go to Company Dashboard →
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout title="Register a Company" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '20px 16px 0' }}>

        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 20 }}>
          Any citizen may register a company. Registration is administrative — access to the
          payment system, not a licence to operate. No exclusive territories, no state protection.
        </div>

        {/* Company name */}
        <div style={fieldGroup}>
          <label style={fieldLabel}>Company name</label>
          <input
            style={inputStyle}
            placeholder="e.g. Campus Coffee Co."
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Equity register */}
        <div style={fieldGroup}>
          <label style={fieldLabel}>Founding equity</label>
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>
            Must total exactly 100%. Minimum unit: 0.01%.
          </div>

          {holders.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder={i === 0 ? address || '0x...' : '0x wallet address'}
                value={i === 0 ? address || '' : h.wallet}
                onChange={e => i > 0 && updateHolder(i, 'wallet', e.target.value)}
                readOnly={i === 0}
              />
              <div style={{ position: 'relative', width: 72, flexShrink: 0 }}>
                <input
                  style={{ ...inputStyle, paddingRight: 20, textAlign: 'right' }}
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={h.pct}
                  onChange={e => updateHolder(i, 'pct', e.target.value)}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.faint }}>%</span>
              </div>
              {i > 0 && (
                <button
                  onClick={() => removeHolder(i)}
                  style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: C.faint, height: 40, flexShrink: 0 }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {/* Total indicator */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            fontSize: 12, color: pctValid ? C.green : C.red,
            marginBottom: 10,
          }}>
            Total: {totalPct}% {pctValid ? '✓' : `(need ${100 - totalPct > 0 ? '+' : ''}${100 - totalPct}%)`}
          </div>

          {holders.length < 10 && (
            <button onClick={addHolder} style={{ ...ghostBtn, width: '100%' }}>
              + Add equity holder
            </button>
          )}
        </div>

        {/* Info box */}
        <div style={{
          background: '#fffbf0', border: `1px solid ${C.gold}`,
          borderRadius: 8, padding: 14, marginBottom: 20,
          fontSize: 11, color: C.sub, lineHeight: 1.7,
        }}>
          <div style={{ color: C.gold, marginBottom: 4, letterSpacing: '0.06em' }}>HOW COMPANY TOKENS WORK</div>
          During the month your company earns S-tokens from customers and pays suppliers in S-tokens.
          At month end the Fisc converts all net S-tokens to V-tokens automatically.
          You then distribute V-tokens as dividends to equity holders at any time.
          Shares may not be pledged as collateral.
        </div>

        <button
          onClick={handleRegister}
          disabled={!canSubmit || deploying}
          style={{ ...primaryBtn, opacity: canSubmit && !deploying ? 1 : 0.4 }}
        >
          {deploying ? 'Registering...' : 'Register Company →'}
        </button>

        {deploying && (
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: C.faint }}>
            Writing to Fisc blockchain...
          </div>
        )}

        {txError && (
          <div style={{ marginTop: 10, fontSize: 12, color: C.red }}>{txError}</div>
        )}
      </div>
    </Layout>
  )
}

const fieldGroup  = { marginBottom: 20 }
const fieldLabel  = { display: 'block', fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }
const inputStyle  = {
  width: '100%', padding: '11px 12px',
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 13, color: C.text, background: C.white, outline: 'none',
}
const primaryBtn  = {
  width: '100%', padding: '13px', background: C.gold, color: C.bg,
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
}
const ghostBtn    = {
  padding: '10px 14px', background: C.white, color: C.sub,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
}
