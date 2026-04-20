import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { logInfo, logError } from '../utils/logger'
import { C } from '../theme'

const FACTORY_ABI = [
  "function deployCompany(string, address[], uint256[], uint8) external returns (uint256)",
]

const CITIZEN_JOINED_TOPIC = ethers.id("CitizenJoined(address,uint256,string)")
const CITIZEN_IFACE = new ethers.Interface([
  "event CitizenJoined(address indexed citizen, uint256 gTokenId, string name)",
])

async function fetchCitizens(colonyAddr) {
  const rpc     = new ethers.JsonRpcProvider('https://sepolia.base.org')
  const toBlock = await rpc.getBlockNumber()
  const CHUNK   = 9000
  const chunks  = await Promise.all(
    Array.from({ length: 5 }, (_, i) => {
      const to   = toBlock - i * CHUNK
      const from = Math.max(0, to - CHUNK + 1)
      return rpc.getLogs({ address: colonyAddr, fromBlock: from, toBlock: to, topics: [CITIZEN_JOINED_TOPIC] }).catch(() => [])
    })
  )
  const map = {}
  for (const log of chunks.flat()) {
    try {
      const { args } = CITIZEN_IFACE.parseLog({ topics: log.topics, data: log.data })
      map[args.citizen.toLowerCase()] = { address: args.citizen, name: args.name }
    } catch {}
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
}

export default function RegisterCompany() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { address, signer, contracts } = useWallet()

  const [name, setName]           = useState('')
  const [holders, setHolders]     = useState([{ wallet: address || '', pct: 100 }])
  const [holderErrors, setHolderErrors] = useState({})
  const [deploying, setDeploy]    = useState(false)
  const [done, setDone]           = useState(false)
  const [txError, setTxError]     = useState(null)
  const [companyId, setCompanyId] = useState(null)
  const [citizens,  setCitizens]  = useState([])
  const [companyPhoto, setCompanyPhoto] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef()

  useEffect(() => {
    const colonyAddr = contracts?.colonies?.[slug]?.colony
    if (!colonyAddr) return
    fetchCitizens(colonyAddr).then(setCitizens).catch(() => {})
  }, [slug, contracts])

  const totalPct    = holders.reduce((s, h) => s + Number(h.pct || 0), 0)
  const pctValid    = totalPct === 100
  const allWallets  = holders.every((h, i) => i === 0 ? !!address : !!h.wallet)
  const canSubmit   = name.trim() && pctValid && allWallets

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
      const tx = await factory.deployCompany(name.trim(), wallets, stakes, 0)
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

  async function handlePhotoUpload(file) {
    if (!file || !companyId) return
    setPhotoUploading(true)
    const reader = new FileReader()
    reader.onload = async ev => {
      const raw = ev.target.result
      const img = new Image()
      img.onload = async () => {
        const scale = Math.min(1, 400 / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        setCompanyPhoto(dataUrl)
        try {
          await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ colony: slug, entityType: 'company', entityId: companyId.toLowerCase(), dataUrl }),
          })
        } catch {}
        setPhotoUploading(false)
      }
      img.src = raw
    }
    reader.readAsDataURL(file)
  }

  if (done) return (
    <Layout title="Company Registered" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>◈</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8 }}>
          {name} registered
        </div>
        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 20 }}>
          Your company is live on the Fisc blockchain.<br />
          Equity stakes have been assigned.
        </div>

        {/* Optional company photo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>Add a company logo (optional)</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
            {companyPhoto ? (
              <img src={companyPhoto} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: `1px solid ${C.border}` }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 8, border: `1px dashed ${C.border}`, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: C.faint }}>◈</div>
            )}
            <div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                style={{ ...ghostBtn, display: 'block', marginBottom: 6 }}
              >
                {photoUploading ? 'Uploading…' : companyPhoto ? 'Change logo' : 'Upload logo'}
              </button>
              {companyPhoto && (
                <div style={{ fontSize: 11, color: C.green }}>✓ Logo saved</div>
              )}
            </div>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handlePhotoUpload(f) }}
          />
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

          {holders.map((h, i) => {
            // Addresses already chosen by other rows (excluding self for i>0)
            const chosenAddrs = holders
              .filter((_, j) => j !== i && j > 0)
              .map(x => x.wallet.toLowerCase())
            return (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {i === 0 ? (
                    <div style={{ ...inputStyle, flex: 1, color: C.sub, display: 'flex', alignItems: 'center' }}>
                      {citizens.find(c => c.address.toLowerCase() === address?.toLowerCase())?.name || address || 'You (founder)'}
                    </div>
                  ) : (
                    <select
                      style={{ ...selectStyle, flex: 1 }}
                      value={h.wallet}
                      onChange={e => updateHolder(i, 'wallet', e.target.value)}
                    >
                      <option value="">Select citizen…</option>
                      {citizens
                        .filter(c => c.address.toLowerCase() !== address?.toLowerCase())
                        .filter(c => !chosenAddrs.includes(c.address.toLowerCase()))
                        .map(c => (
                          <option key={c.address} value={c.address}>{c.name}</option>
                        ))
                      }
                    </select>
                  )}
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
              </div>
            )
          })}

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
  boxSizing: 'border-box',
}
const selectStyle = {
  padding: '11px 12px',
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 13, color: C.text, background: C.white,
  fontFamily: "'IBM Plex Mono', monospace", boxSizing: 'border-box',
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
