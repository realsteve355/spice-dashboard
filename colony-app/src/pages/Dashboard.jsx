import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import SendSheet from '../components/SendSheet'
import { useWallet } from '../App'
import { resolveNames, namedAddr } from '../utils/addrLabel'

// Compute epoch display values from current date
function getEpochDisplay() {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysToReset = lastDay.getDate() - now.getDate() + 1
  const currentMonth = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const resetDate = lastDay.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return { daysToReset, currentMonth, resetDate }
}
const { daysToReset: DAYS_TO_RESET, currentMonth: CURRENT_MONTH } = getEpochDisplay()
import { logInfo, logError } from '../utils/logger'

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
  "event VDividendPaid(address indexed from, address indexed to, uint256 amount)",
]

const MCC_BILLING_ABI = [
  "function billOf(address) view returns (uint256)",
]

const COMPANY_FACTORY_ABI = [
  "function companyCount() view returns (uint256)",
  "function getCompany(uint256) view returns (string, address, address, uint256, uint256)",
]

const COMPANY_IMPL_ABI = [
  "function secretary() view returns (address)",
  "function getEquityTable() view returns (address[], uint256[], uint256[])",
]

const OTOKEN_ABI = [
  "function tokensOf(address) view returns (uint256[])",
  "function orgs(uint256) view returns (string, uint8, uint256)",
  "function ownerOf(uint256) view returns (address)",
]

const GOV_ABI_MINI = [
  "function activeElections() view returns (uint256[])",
]

import { C } from '../theme'

export default function Dashboard() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { address, isConnected, isCitizenOf, isMccOf, connect, onChain, onChainLoading, refresh, signer, contracts } = useWallet()

  const chain     = onChain?.[slug]
  const isCitizen = isCitizenOf(slug)
  const isMcc     = isMccOf(slug)

  // Synthesize a minimal colony object from chain data
  const colony = chain ? {
    id: slug,
    name: chain.colonyName || slug,
    description: '',
    founded: new Date().toISOString().slice(0, 10),
    citizenCount: 1,
    mcc: { name: 'Not yet configured', board: [] },
    services: [],
  } : null

  const data = chain ? {
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
  const [openVoteCount, setOpenVoteCount] = useState(null)

  const mccBillingAddr  = contracts?.colonies?.[slug]?.mccBilling
  const mccTreasuryAddr = contracts?.colonies?.[slug]?.mccTreasury

  useEffect(() => {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg?.colony || !signer) return
    const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
    colony.founder().then(setFounderAddr).catch(() => {})
  }, [contracts, slug, signer])

  // Bill payments go to treasury if deployed, otherwise fall back to founder wallet
  const resolvedFounder = founderAddr || chain?.founderAddr
  const billRecipient   = mccTreasuryAddr || resolvedFounder

  // Read on-chain bill from MCCBilling
  useEffect(() => {
    if (!mccBillingAddr || !address) return
    const prov = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const c = new ethers.Contract(mccBillingAddr, MCC_BILLING_ABI, prov)
    c.billOf(address)
      .then(wei => setOnChainBill(Math.floor(Number(ethers.formatEther(wei)))))
      .catch(() => {})
  }, [mccBillingAddr, address])

  // Load live open election count from Governance
  useEffect(() => {
    const govAddr = contracts?.colonies?.[slug]?.governance
    if (!govAddr) return
    const prov = new ethers.JsonRpcProvider('https://base-sepolia-rpc.publicnode.com')
    new ethers.Contract(govAddr, GOV_ABI_MINI, prov)
      .activeElections()
      .then(ids => setOpenVoteCount(ids.length))
      .catch(() => setOpenVoteCount(0))
  }, [contracts, slug])

  const [txHistory, setTxHistory] = useState(null)  // null = not loaded yet

  useEffect(() => {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg || !address) return
    const rpc = new ethers.JsonRpcProvider('https://base-sepolia-rpc.publicnode.com')
    const iface = new ethers.Interface(COLONY_ABI)
    async function loadTx() {
      try {
        const toBlock = await rpc.getBlockNumber()
        const CHUNK   = 9000
        const T_SENT     = ethers.id('Sent(address,address,uint256,string)')
        const T_UBI      = ethers.id('UbiClaimed(address,uint256,uint256)')
        const T_SAVED    = ethers.id('Saved(address,uint256)')
        const T_REDEEMED = ethers.id('Redeemed(address,uint256)')
        const T_VDIV     = ethers.id('VDividendPaid(address,address,uint256)')
        const pad = (addr) => ethers.zeroPadValue(addr, 32)

        const safeLogs = async (filter) => {
          try { return await rpc.getLogs(filter) } catch { return [] }
        }

        // 5 chunks × 9,000 blocks ≈ 25 hours of Base Sepolia history
        const chunkResults = await Promise.all(
          Array.from({ length: 5 }, (_, i) => {
            const chunkTo   = toBlock - i * CHUNK
            const chunkFrom = Math.max(0, chunkTo - CHUNK)
            const base      = { address: cfg.colony, fromBlock: chunkFrom, toBlock: chunkTo }
            return Promise.all([
              safeLogs({ ...base, topics: [T_SENT,     pad(address), null]  }),
              safeLogs({ ...base, topics: [T_SENT,     null, pad(address)]  }),
              safeLogs({ ...base, topics: [T_UBI,      pad(address)]        }),
              safeLogs({ ...base, topics: [T_SAVED,    pad(address)]        }),
              safeLogs({ ...base, topics: [T_REDEEMED, pad(address)]        }),
              safeLogs({ ...base, topics: [T_VDIV,     null, pad(address)]  }),
            ])
          })
        )

        const decode = (log) => { try { return iface.parseLog(log) } catch { return null } }
        const flat = (idx) => chunkResults.flatMap(c => c[idx]).map(l => ({ ...l, parsed: decode(l) })).filter(l => l.parsed)
        const sentFrom  = flat(0)
        const sentTo    = flat(1)
        const ubis      = flat(2)
        const saves     = flat(3)
        const redeems   = flat(4)
        const dividends = flat(5)

        const allEvents = [...sentFrom, ...sentTo, ...ubis, ...saves, ...redeems, ...dividends]
        const uniqueBlocks = [...new Set(allEvents.map(e => e.blockNumber))]
        const blockMap = {}
        await Promise.all(uniqueBlocks.map(async n => {
          const b = await rpc.getBlock(n)
          if (b) blockMap[n] = b.timestamp
        }))
        const fmtDate = ts => ts ? new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

        // Resolve names for all counterparty addresses
        const counterpartyAddrs = [
          ...sentFrom.map(e => String(e.parsed.args[1])),
          ...sentTo.map(e => String(e.parsed.args[0])),
          ...dividends.map(e => String(e.parsed.args[0])),
        ]
        const nameMap = await resolveNames(counterpartyAddrs, cfg.colony).catch(() => ({}))

        const rows = []
        for (const e of sentFrom) {
          const amt = Math.floor(Number(ethers.formatEther(e.parsed.args[2])))
          const to  = String(e.parsed.args[1])
          rows.push({ type: 'sent',     label: e.parsed.args[3] || `To ${namedAddr(to, nameMap)}`,         amount: -amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of sentTo) {
          const amt  = Math.floor(Number(ethers.formatEther(e.parsed.args[2])))
          const from = String(e.parsed.args[0])
          rows.push({ type: 'received', label: e.parsed.args[3] || `From ${namedAddr(from, nameMap)}`, amount: +amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of ubis) {
          const amt = Math.floor(Number(ethers.formatEther(e.parsed.args[1])))
          rows.push({ type: 'ubi',    label: 'UBI allocation',         amount: +amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of saves) {
          const amt = Math.floor(Number(ethers.formatEther(e.parsed.args[1])))
          rows.push({ type: 'save',   label: 'Saved to V-tokens',      amount: -amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of redeems) {
          const amt = Math.floor(Number(ethers.formatEther(e.parsed.args[1])))
          rows.push({ type: 'redeem', label: 'Redeemed from V-tokens', amount: +amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        for (const e of dividends) {
          const amt  = Math.floor(Number(ethers.formatEther(e.parsed.args[2])))
          const from = String(e.parsed.args[0])
          rows.push({ type: 'dividend', label: `V dividend from ${namedAddr(from, nameMap)}`, amount: +amt, date: fmtDate(blockMap[e.blockNumber]), blockNumber: e.blockNumber })
        }
        rows.sort((a, b) => b.blockNumber - a.blockNumber)
        setTxHistory(rows)
      } catch (e) {
        console.warn('tx history load failed', e)
        setTxHistory([])
      }
    }
    loadTx()
  // onChain[slug]?.sBalance changes after every refresh() — re-queries tx history automatically
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts, slug, address, onChain?.[slug]?.sBalance])

  // On-chain companies this user holds equity in
  const [myCompanies, setMyCompanies] = useState(null)  // null = loading

  useEffect(() => {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg?.companyFactory || !address) { setMyCompanies([]); return }
    const rpc = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const factory = new ethers.Contract(cfg.companyFactory, COMPANY_FACTORY_ABI, rpc)
    let cancelled = false
    async function load() {
      try {
        const count = Number(await factory.companyCount())
        const allCompanies = await Promise.all(
          Array.from({ length: count }, (_, i) => i).map(async id => {
            const [, wallet] = await factory.getCompany(id)
            let name = wallet.slice(0, 10)
            let isSecretary = false
            let isEquityHolder = false
            try {
              const companyContract = new ethers.Contract(wallet, COMPANY_IMPL_ABI, rpc)
              const [liveNameRaw, secretary, equityResult] = await Promise.all([
                companyContract.name(),
                companyContract.secretary(),
                companyContract.getEquityTable().catch(() => [[], [], []]),
              ])
              name           = liveNameRaw
              const myAddr   = address.toLowerCase()
              isSecretary    = secretary.toLowerCase() === myAddr
              isEquityHolder = equityResult[0].some(h => h.toLowerCase() === myAddr)
            } catch {}
            return { id, name, wallet, isSecretary, isEquityHolder }
          })
        )
        const companies = allCompanies.filter(co => co.isSecretary || co.isEquityHolder)
        if (!cancelled) setMyCompanies(companies)
      } catch (e) {
        console.warn('[Dashboard] load companies failed:', e?.message || e)
        if (!cancelled) setMyCompanies([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [contracts, slug, address])

  // O-tokens are now soulbound to company contracts (not held by citizens).
  // isSecretary is determined by calling company.secretary() directly.
  const myOTokens = []

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
    if (!contract || !billRecipient || !billAmount) return
    setBillPending(true); setBillError(null); setBillDone(false)
    try {
      const tx = await contract.send(billRecipient, ethers.parseEther(String(billAmount)), 'MCC services bill')
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
      logInfo('ubi.claimed', { colony: slug, address })
      setClaimDone(true)
      refresh()
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || 'Transaction failed'
      logError('ubi.claim_failed', { colony: slug, address, message: msg })
      setClaimError(msg)
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
      logInfo('v.saved', { colony: slug, address, meta: { amount: saveAmt } })
      setSaveAmt(''); setSaving(false); refresh()
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || 'Transaction failed'
      logError('v.save_failed', { colony: slug, address, message: msg, meta: { amount: saveAmt } })
      setSaveError(msg)
    } finally { setSavePending(false) }
  }

  async function handleRedeem() {
    const contract = colonyContract()
    if (!contract) return
    setRedeemPending(true); setRedeemError(null)
    try {
      const tx = await contract.redeemV(ethers.parseEther(String(redeemAmt)))
      await tx.wait()
      logInfo('v.redeemed', { colony: slug, address, meta: { amount: redeemAmt } })
      setRedeemAmt(''); setRedeem(false); refresh()
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || 'Transaction failed'
      logError('v.redeem_failed', { colony: slug, address, message: msg, meta: { amount: redeemAmt } })
      setRedeemError(msg)
    } finally { setRedeemPending(false) }
  }

  async function handleSend(amt, recipient, note) {
    const contract = colonyContract()
    if (!contract) { setSending(false); return }
    try {
      const tx = await contract.send(recipient, ethers.parseEther(String(amt)), note)
      await tx.wait()
      logInfo('tx.confirmed', { colony: slug, address, txHash: tx.hash, message: `send ${amt} S`, meta: { to: recipient, note } })
      refresh()
    } catch (e) {
      logError('tx.failed', { colony: slug, address, message: e?.reason || e?.shortMessage || e?.message, meta: { action: 'send', to: recipient, amount: amt } })
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
  // (contracts.json entries and localStorage colonies are both "real" and need chain data)
  const isRealColony = !!contracts?.colonies?.[slug]
    || !!JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')[slug]
  if (onChainLoading || (isRealColony && !chain)) return (
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
        <div
          onClick={() => navigate(`/colony/${slug}/profile`)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 12,
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
              {chain?.citizenName || '—'}
            </div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 2, letterSpacing: '0.04em' }}>
              {chain?.citizenName ? 'citizen · ' : ''}{colony.name}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace' }}>
                {chain?.gTokenId > 0 ? `G#${String(chain.gTokenId).padStart(4,'0')}` : ''}
              </div>
              <div style={{ fontSize: 9, color: C.faint, marginTop: 2, fontFamily: 'monospace' }}>
                {address ? `${address.slice(0,6)}…${address.slice(-4)}` : ''}
              </div>
            </div>
            <span style={{ fontSize: 18, color: C.faint }}>›</span>
          </div>
        </div>

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
          {((onChainBill ?? data.mccBill.total) > 0) && billRecipient && (
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
            <span style={{ fontSize: 12, color: C.purple }}>
              #{String(data.gTokenId).padStart(4, '0')}
              {colony?.name && (
                <span style={{ fontSize: 10, color: C.faint, marginLeft: 6 }}>· {colony.name}</span>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: C.sub }}>Open votes</span>
            <span
              onClick={() => navigate(`/colony/${slug}/votes`)}
              style={{ fontSize: 12, color: C.gold, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {openVoteCount === null ? '…' : openVoteCount} open →
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

        {/* Active Roles (O-tokens) */}
        {myOTokens.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>ACTIVE ROLES</div>
            {myOTokens.map((tok, i) => {
              const typeLabel = ['COMPANY', 'MCC', 'COOPERATIVE', 'CIVIC'][tok.orgType] || 'ORG'
              const typeColor = [C.gold, '#8b5cf6', '#16a34a', '#3b82f6'][tok.orgType] || C.faint
              return (
                <div key={tok.tokenId} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < myOTokens.length - 1 ? 10 : 0,
                  marginBottom: i < myOTokens.length - 1 ? 10 : 0,
                  borderBottom: i < myOTokens.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.text }}>{tok.name}</div>
                    <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>
                      O#{String(tok.tokenId).padStart(4, '0')} · secretary
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9, color: typeColor, border: `1px solid ${typeColor}`,
                    borderRadius: 10, padding: '2px 7px', letterSpacing: '0.06em', flexShrink: 0,
                  }}>{typeLabel}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* My Companies */}
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
          {myCompanies === null ? (
            <div style={{ fontSize: 12, color: C.faint }}>Loading...</div>
          ) : myCompanies.length === 0 ? (
            <div style={{ fontSize: 12, color: C.faint }}>No companies yet.</div>
          ) : (
            myCompanies.map((co, i) => (
              <div
                key={co.wallet}
                onClick={() => navigate(`/colony/${slug}/company/${co.wallet}`)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < myCompanies.length - 1 ? 10 : 0,
                  marginBottom: i < myCompanies.length - 1 ? 10 : 0,
                  borderBottom: i < myCompanies.length - 1 ? `1px solid ${C.border}` : 'none',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: C.text }}>{co.name}</div>
                  {co.isSecretary && (
                    <div style={{ fontSize: 10, color: '#8b5cf6', marginTop: 2 }}>secretary</div>
                  )}
                </div>
                <span style={{ fontSize: 14, color: C.faint }}>›</span>
              </div>
            ))
          )}
        </div>

        {/* Assets & Obligations */}
        <div
          onClick={() => navigate(`/colony/${slug}/assets`)}
          style={{ ...card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 4 }}>ASSETS & OBLIGATIONS</div>
            <div style={{ fontSize: 12, color: C.sub }}>Register physical assets · create payment obligations</div>
          </div>
          <span style={{ fontSize: 18, color: C.faint, marginLeft: 12 }}>›</span>
        </div>

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
  if (type === 'save')     return 'S→V'
  if (type === 'redeem')   return 'V→S'
  if (type === 'dividend') return 'V'
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
