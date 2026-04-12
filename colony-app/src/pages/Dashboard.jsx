import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import SendSheet from '../components/SendSheet'
import { MOCK_COLONIES, MOCK_CITIZEN_DATA, MOCK_MY_EQUITY, DAYS_TO_RESET, RESET_DATE, CURRENT_MONTH } from '../data/mock'
import { useWallet } from '../App'

const COLONY_ABI = [
  "function claimUbi() external",
  "function saveToV(uint256) external",
  "function redeemV(uint256) external",
  "function send(address, uint256, string) external",
  "function founder() view returns (address)",
  "event Sent(address indexed from, address indexed to, uint256 amount, string note)",
  "event UbiClaimed(address indexed citizen, uint256 amount, uint256 epoch)",
  "event Saved(address indexed citizen, uint256 amount)",
  "event Redeemed(address indexed citizen, uint256 amount)",
]

const MCC_BILLING_ABI = [
  "function billOf(address) view returns (uint256)",
]

import { C } from '../theme'

export default function Dashboard() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { address, isConnected, isCitizenOf, isMccOf, citizenColonies, connect, onChain, onChainLoading, refresh, signer, contracts } = useWallet()

  const chain     = onChain?.[slug]
  const isCitizen = isCitizenOf(slug)
  const isMcc     = isMccOf(slug)

  const mockColony = MOCK_COLONIES.find(c => c.id === slug)
  // Synthesize a minimal colony object from chain data for user-deployed colonies
  const colony = mockColony || (chain ? {
    id: slug,
    name: chain.colonyName || slug,
    description: '',
    founded: new Date().toISOString().slice(0, 10),
    citizenCount: 1,
    mcc: { name: 'Not yet configured', board: [] },
    services: [],
  } : null)

  const mockData  = MOCK_CITIZEN_DATA[slug]
  // Use on-chain balances when available, else mock; synthesize from chain for new colonies
  const data = mockData ? {
    ...mockData,
    sBalance: chain ? chain.sBalance : mockData.sBalance,
    vBalance: chain ? chain.vBalance : mockData.vBalance,
    gTokenId: chain?.gTokenId > 0 ? chain.gTokenId : mockData.gTokenId,
  } : chain ? {
    sBalance:        chain.sBalance,
    vBalance:        chain.vBalance,
    gTokenId:        chain.gTokenId,
    vSavedThisMonth: 0,
    vMaxMonthly:     200,
    ubiAmount:       1000,
    mccBill:         { total: 0, breakdown: [] },
    transactions:    [],
  } : null

  const [claimPending, setClaimPending] = useState(false)
  const [claimError, setClaimError] = useState(null)
  const [claimDone, setClaimDone]   = useState(false)

  const [founderAddr, setFounderAddr] = useState(null)
  const [billPending, setBillPending] = useState(false)
  const [billError,   setBillError]   = useState(null)
  const [billDone,    setBillDone]    = useState(false)
  const [onChainBill, setOnChainBill] = useState(null)  // S whole tokens, or null if not loaded

  const mccBillingAddr = contracts?.colonies?.[slug]?.mccBilling

  useEffect(() => {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg?.colony || !signer) return
    const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
    colony.founder().then(setFounderAddr).catch(() => {})
  }, [contracts, slug, signer])

  // Use chain founderAddr if available (from App.jsx polling)
  const resolvedFounder = founderAddr || chain?.founderAddr

  // Read on-chain bill from MCCBilling
  useEffect(() => {
    if (!mccBillingAddr || !address) return
    const prov = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const c = new ethers.Contract(mccBillingAddr, MCC_BILLING_ABI, prov)
    c.billOf(address)
      .then(wei => setOnChainBill(Math.floor(Number(ethers.formatEther(wei)))))
      .catch(() => {})
  }, [mccBillingAddr, address])

  const [txHistory, setTxHistory] = useState(null)  // null = not loaded yet

  useEffect(() => {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg || !address) return
    const rpc = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const contract = new ethers.Contract(cfg.colony, COLONY_ABI, rpc)
    const fromBlock = cfg.deployBlock || 0
    async function loadTx() {
      try {
        const [sentFrom, sentTo, ubis, saves, redeems] = await Promise.all([
          contract.queryFilter(contract.filters.Sent(address, null),    fromBlock),
          contract.queryFilter(contract.filters.Sent(null, address),    fromBlock),
          contract.queryFilter(contract.filters.UbiClaimed(address),    fromBlock),
          contract.queryFilter(contract.filters.Saved(address),         fromBlock),
          contract.queryFilter(contract.filters.Redeemed(address),      fromBlock),
        ])
        const allEvents = [...sentFrom, ...sentTo, ...ubis, ...saves, ...redeems]
        // Batch-fetch all unique block timestamps in parallel
        const uniqueBlocks = [...new Set(allEvents.map(e => e.blockNumber))]
        const blockMap = {}
        await Promise.all(uniqueBlocks.map(async n => {
          const b = await rpc.getBlock(n)
          if (b) blockMap[n] = b.timestamp
        }))
        const fmtDate = ts => ts ? new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
        const rows = []
        for (const e of sentFrom) {
          const amt = Math.floor(Number(ethers.formatEther(e.args.amount)))
          const to  = e.args.to
          rows.push({ type: 'sent',     label: e.args.note || `To ${to.slice(0,6)}…${to.slice(-4)}`,     amount: -amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of sentTo) {
          const amt  = Math.floor(Number(ethers.formatEther(e.args.amount)))
          const from = e.args.from
          rows.push({ type: 'received', label: e.args.note || `From ${from.slice(0,6)}…${from.slice(-4)}`, amount: +amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of ubis) {
          const amt = Math.floor(Number(ethers.formatEther(e.args.amount)))
          rows.push({ type: 'ubi',    label: 'UBI allocation',          amount: +amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of saves) {
          const amt = Math.floor(Number(ethers.formatEther(e.args.amount)))
          rows.push({ type: 'save',   label: 'Saved to V-tokens',       amount: -amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of redeems) {
          const amt = Math.floor(Number(ethers.formatEther(e.args.amount)))
          rows.push({ type: 'redeem', label: 'Redeemed from V-tokens',  amount: +amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        rows.sort((a, b) => b.blockNumber - a.blockNumber)
        setTxHistory(rows)
      } catch (e) {
        console.warn('tx history load failed', e)
        setTxHistory([])
      }
    }
    loadTx()
  }, [contracts, slug, address])

  const [saving, setSaving]       = useState(false)
  const [saveAmt, setSaveAmt]     = useState('')
  const [savePending, setSavePending] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const [redeeming, setRedeem]    = useState(false)
  const [redeemAmt, setRedeemAmt] = useState('')
  const [redeemPending, setRedeemPending] = useState(false)
  const [redeemError, setRedeemError] = useState(null)

  const [sending, setSending]     = useState(false)

  async function handlePayBill() {
    const contract = colonyContract()
    const billAmount = onChainBill ?? data.mccBill.total
    if (!contract || !resolvedFounder || !billAmount) return
    setBillPending(true); setBillError(null); setBillDone(false)
    try {
      const tx = await contract.send(resolvedFounder, ethers.parseEther(String(billAmount)), 'MCC services bill')
      await tx.wait()
      setBillDone(true)
      setOnChainBill(0)
      refresh()
    } catch (e) {
      setBillError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setBillPending(false)
  }

  async function addToMetaMask(type, address, symbol, decimals, tokenId) {
    if (!window.ethereum) return
    try {
      if (type === 'ERC20') {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: { type: 'ERC20', options: { address, symbol, decimals } },
        })
      } else if (type === 'ERC721') {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: { type: 'ERC721', options: { address, tokenId: String(tokenId) } },
        })
      }
    } catch (e) {
      console.warn('wallet_watchAsset failed', e)
    }
  }

  async function handleClaimUbi() {
    const contract = colonyContract()
    if (!contract) return
    setClaimPending(true); setClaimError(null); setClaimDone(false)
    try {
      const tx = await contract.claimUbi()
      await tx.wait()
      setClaimDone(true)
      refresh()
    } catch (e) {
      setClaimError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setClaimPending(false)
  }

  function colonyContract() {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg || !signer) return null
    return new ethers.Contract(cfg.colony, COLONY_ABI, signer)
  }

  async function handleSave() {
    const contract = colonyContract()
    if (!contract) return
    setSavePending(true); setSaveError(null)
    try {
      const tx = await contract.saveToV(ethers.parseEther(String(saveAmt)))
      await tx.wait()
      setSaveAmt(''); setSaving(false); refresh()
    } catch (e) {
      setSaveError(e?.reason || e?.shortMessage || 'Transaction failed')
    } finally { setSavePending(false) }
  }

  async function handleRedeem() {
    const contract = colonyContract()
    if (!contract) return
    setRedeemPending(true); setRedeemError(null)
    try {
      const tx = await contract.redeemV(ethers.parseEther(String(redeemAmt)))
      await tx.wait()
      setRedeemAmt(''); setRedeem(false); refresh()
    } catch (e) {
      setRedeemError(e?.reason || e?.shortMessage || 'Transaction failed')
    } finally { setRedeemPending(false) }
  }

  async function handleSend(amt, recipient, note) {
    const contract = colonyContract()
    if (!contract) { setSending(false); return }
    try {
      const tx = await contract.send(recipient, ethers.parseEther(String(amt)), note)
      await tx.wait()
      refresh()
    } catch (e) {
      console.error(e)
    }
    setSending(false)
  }

  if (!isConnected) return (
    <Layout title="Dashboard" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Connect your wallet to view your dashboard.</div>
        <button onClick={connect} style={primaryBtn}>Connect Wallet</button>
      </div>
    </Layout>
  )

  // Show loading while on-chain data is being fetched for this colony
  const isUserColony = !!JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')[slug]
  if (onChainLoading || (isUserColony && !chain)) return (
    <Layout title="Dashboard" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        Loading colony data…
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

        {/* Wallet identity bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '10px 14px', marginBottom: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
              {chain?.citizenName || '—'}
            </div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 2, letterSpacing: '0.04em' }}>
              {chain?.citizenName ? 'citizen · ' : ''}{colony.name}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace' }}>
              {chain?.gTokenId > 0 ? `G#${String(chain.gTokenId).padStart(4,'0')}` : ''}
            </div>
            <div style={{ fontSize: 9, color: C.faint, marginTop: 2, fontFamily: 'monospace' }}>
              {address ? `${address.slice(0,6)}…${address.slice(-4)}` : ''}
            </div>
          </div>
        </div>

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
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => refresh(0)}
                title="Refresh balances"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: onChainLoading ? C.gold : C.faint, padding: 0, lineHeight: 1 }}
              >
                {onChainLoading ? '↻' : '↻'}
              </button>
              <div style={{ fontSize: 11, color: C.faint }}>Resets in {DAYS_TO_RESET}d</div>
              {contracts?.colonies?.[slug]?.sToken && (
                <button
                  onClick={() => addToMetaMask('ERC20', contracts.colonies[slug].sToken, chain?.sSymbol || 'S-SPICE', 18)}
                  style={mmBtn}
                  title="Add S-token to MetaMask"
                >
                  + MetaMask
                </button>
              )}
            </div>
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

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              onClick={handleClaimUbi}
              disabled={claimPending}
              style={{ ...smallBtn(C.green), flex: 1, opacity: claimPending ? 0.5 : 1 }}
            >
              {claimPending ? '...' : claimDone ? '✓ Claimed' : 'Claim Monthly UBI'}
            </button>
          </div>
          {claimError && <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>{claimError}</div>}
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
                onConfirm={handleSend}
              />
            </div>
          )}

          <button
            onClick={() => navigate(`/colony/${slug}/request`)}
            style={{ ...smallBtn(C.sub, '#fff', C.border), width: '100%', marginTop: 8 }}
          >
            Request Payment (show QR) →
          </button>
          <button
            onClick={() => document.getElementById('tx-history').scrollIntoView({ behavior: 'smooth' })}
            style={{ ...smallBtn(C.faint, '#fff', C.border), width: '100%', marginTop: 8 }}
          >
            View Transactions ↓
          </button>
        </div>

        {/* V-token balance */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>V-TOKEN BALANCE</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: C.green }}>never expires</div>
              {contracts?.colonies?.[slug]?.vToken && (
                <button
                  onClick={() => addToMetaMask('ERC20', contracts.colonies[slug].vToken, chain?.vSymbol || 'V-SPICE', 18)}
                  style={mmBtn}
                  title="Add V-token to MetaMask"
                >
                  + MetaMask
                </button>
              )}
            </div>
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
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inlineInput, flex: 1 }}
                  placeholder={`max ${data.vMaxMonthly - data.vSavedThisMonth} S this month`}
                  value={saveAmt}
                  onChange={e => setSaveAmt(e.target.value)}
                  type="number"
                />
                <button
                  onClick={handleSave}
                  disabled={savePending || !saveAmt}
                  style={{ ...smallBtn(C.green), opacity: savePending ? 0.5 : 1 }}
                >
                  {savePending ? '...' : 'Confirm'}
                </button>
              </div>
              {saveError && <div style={{ fontSize: 11, color: C.red, marginTop: 6 }}>{saveError}</div>}
            </div>
          )}
          {redeeming && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inlineInput, flex: 1 }}
                  placeholder={`max ${data.vBalance} V`}
                  value={redeemAmt}
                  onChange={e => setRedeemAmt(e.target.value)}
                  type="number"
                />
                <button
                  onClick={handleRedeem}
                  disabled={redeemPending || !redeemAmt}
                  style={{ ...smallBtn(C.sub, '#fff', C.border), opacity: redeemPending ? 0.5 : 1 }}
                >
                  {redeemPending ? '...' : 'Confirm'}
                </button>
              </div>
              {redeemError && <div style={{ fontSize: 11, color: C.red, marginTop: 6 }}>{redeemError}</div>}
            </div>
          )}
        </div>

        {/* MCC bill */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>MCC BILL — {CURRENT_MONTH}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.red }}>
              {onChainBill !== null ? onChainBill : data.mccBill.total} S
              {onChainBill !== null && <span style={{ fontSize: 9, color: C.green, marginLeft: 6 }}>live</span>}
            </div>
          </div>
          {/* On-chain bill takes precedence; show breakdown from mock if available */}
          {onChainBill === null && data.mccBill.breakdown.length > 0 && (
            data.mccBill.breakdown.map((b, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.sub,
                paddingBottom: i < data.mccBill.breakdown.length - 1 ? 8 : 0,
                marginBottom:  i < data.mccBill.breakdown.length - 1 ? 8 : 0,
                borderBottom:  i < data.mccBill.breakdown.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <span>{b.service}</span><span style={{ color: C.red }}>{b.amount} S</span>
              </div>
            ))
          )}
          {onChainBill === 0 && (
            <div style={{ fontSize: 12, color: C.faint }}>No bill outstanding this month.</div>
          )}
          {onChainBill === null && data.mccBill.breakdown.length === 0 && (
            <div style={{ fontSize: 12, color: C.faint }}>No charges this month.</div>
          )}
          {((onChainBill ?? data.mccBill.total) > 0) && resolvedFounder && (
            <div style={{ marginTop: 12 }}>
              {billError && <div style={{ fontSize: 11, color: C.red, marginBottom: 6 }}>{billError}</div>}
              <button
                onClick={handlePayBill}
                disabled={billPending || billDone}
                style={{ ...smallBtn(billDone ? C.green : C.red), width: '100%', opacity: billPending ? 0.5 : 1 }}
              >
                {billPending ? '...' : billDone ? '✓ Bill paid' : `Pay ${onChainBill ?? data.mccBill.total} S to MCC →`}
              </button>
            </div>
          )}
        </div>

        {/* Governance / G-token */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>GOVERNANCE</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {contracts?.colonies?.[slug]?.gToken && data.gTokenId > 0 && (
                <button
                  onClick={() => addToMetaMask('ERC721', contracts.colonies[slug].gToken, 'GSPICE', 0, data.gTokenId)}
                  style={mmBtn}
                  title="Add G-token NFT to MetaMask"
                >
                  + MetaMask
                </button>
              )}
              <button
                onClick={() => navigate(`/colony/${slug}/profile`)}
                style={{ fontSize: 11, color: C.faint, background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '3px 10px', cursor: 'pointer' }}
              >
                My Profile
              </button>
            </div>
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
                style={{ ...smallBtn(C.sub, '#fff', C.border), flex: 1 }}
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
        <div id="tx-history" style={{ ...card, marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>RECENT TRANSACTIONS</div>
          {txHistory === null ? (
            <div style={{ fontSize: 11, color: C.faint, textAlign: 'center', padding: '8px 0' }}>Loading...</div>
          ) : txHistory.length === 0 ? (
            <div style={{ fontSize: 11, color: C.faint, textAlign: 'center', padding: '8px 0' }}>No transactions yet</div>
          ) : txHistory.map((tx, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: i < txHistory.length - 1 ? 10 : 0,
              marginBottom: i < txHistory.length - 1 ? 10 : 0,
              borderBottom: i < txHistory.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 12, color: C.text }}>{tx.label}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{tx.date}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: tx.amount > 0 ? C.green : C.red }}>
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
  background: C.white, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: 16, marginBottom: 10,
}

const primaryBtn = {
  padding: '13px 16px', background: C.gold, color: C.bg,
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
}

function smallBtn(bg, color = C.text, border) {
  return {
    padding: '9px 14px', background: bg, color,
    border: border ? `1px solid ${border}` : 'none',
    borderRadius: 6, fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
  }
}

const inlineInput = {
  padding: '9px 10px', border: `1px solid ${C.border}`,
  borderRadius: 6, fontSize: 12, color: C.text, background: C.white, outline: 'none',
}

const mmBtn = {
  fontSize: 10, color: '#e2761b', background: 'none',
  border: '1px solid #e2761b', borderRadius: 10,
  padding: '2px 7px', cursor: 'pointer', letterSpacing: '0.04em',
  fontFamily: "'IBM Plex Mono', monospace",
}
