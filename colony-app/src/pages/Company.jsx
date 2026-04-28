import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import SendSheet from '../components/SendSheet'
import EntityImage from '../components/EntityImage'
import { useWallet } from '../App'
import { resolveNames, namedAddr, shortAddr } from '../utils/addrLabel'

import { fetchCitizens as fetchColonyCitizens } from '../utils/fetchCitizens'

// Colony contract — for send() and citizen checks; includes the per-citizen
// vesting-claim relay used for F-23, and transferEquity for S-06 share gifting.
const COLONY_ABI = [
  "function send(address, uint256, string) external",
  "function isCitizen(address) view returns (bool)",
  "function claimVestedTranches(uint256) external returns (uint256 newlyVestedBps)",
  "function transferEquity(uint256 assetId, address to, uint256 bps) external returns (uint256 newAssetId)",
]
const COLONY_EVENTS_ABI = [
  "event Sent(address indexed from, address indexed to, uint256 amount, string note)",
  "event Saved(address indexed citizen, uint256 amount)",
  "event VDividendPaid(address indexed from, address indexed to, uint256 amount)",
]

// CompanyImplementation v2 events surfaced for F-16 share-event history
const COMPANY_EVENTS_ABI = [
  "event SharesIssued(address indexed holder, uint256 stakeBps, bool hasVesting)",
  "event SharesForfeited(uint256 indexed assetId, uint256 forfeitedBps)",
  "event SharesBoughtBack(uint256 indexed assetId, uint256 bps, uint256 priceS)",
  "event DividendDeclared(uint256 vAmount, uint256 holderCount)",
]

// CompanyImplementation v2 — no internal equity state, all equity via AToken
const COMPANY_ABI = [
  "function name() view returns (string)",
  "function secretary() view returns (address)",
  "function sBalance() view returns (uint256)",
  "function vBalance() view returns (uint256)",
  "function getEquityTable() view returns (address[], uint256[], uint256[])",
  "function pay(address, uint256, string) external",
  "function convertToV(uint256) external",
  "function declareDividend(uint256) external",
  "function issueVestingShares(address, uint256, uint256[], uint256[]) external",
  "function issueOpenShares(address, uint256) external",
  "function forfeitShares(uint256) external",
  "function buybackShares(uint256, uint256, uint256) external",
  "function shareNAV(uint256) view returns (uint256)",
  "function setName(string) external",
  "function changeSecretary(address) external",
  "function registerAsset(string, uint256, uint256, bool, uint256) external returns (uint256)",
  "function transferAsset(uint256, address, uint256) external",
]

// AToken — for reading equity token IDs (assetId lookups for forfeit/buyback)
// and the F-26 per-tranche vesting schedule getter (only available on AToken
// deployments compiled with the v3+ source; older colonies fall back gracefully).
const ATOKEN_ABI = [
  "function tokensOf(address) view returns (uint256[])",
  "function tokens(uint256) view returns (uint8 form, address holder, address counterparty, uint256 linkedId, bool active)",
  "function assetData(uint256) view returns (uint256 valueSTokens, uint256 weightKg, bool hasAI, uint256 depreciationBps, uint256 registrationEpoch)",
  "function assetLabel(uint256) view returns (string)",
  "function getVestingStake(uint256) view returns (uint256, uint256, address)",
  "function getVestingSchedule(uint256) view returns (uint256 totalStakeBps, uint256 vestedBps, address company, uint256[] vestingEpochs, uint256[] trancheBps, uint256 nextTranche)",
]

// OToken — for reading the secretary's organisation badge, handing it over,
// and reading historical handover events for the secretary-history view (OS-05).
const OTOKEN_ABI = [
  "function tokensOf(address) view returns (uint256[])",
  "function orgs(uint256) view returns (string name, uint8 orgType, uint256 registeredAt)",
  "function handOver(uint256, address) external",
  "event RoleHandedOver(uint256 indexed tokenId, address indexed from, address indexed to)",
  "event OrgRegistered(uint256 indexed tokenId, address indexed holder, uint8 orgType, string name)",
]

import { C } from '../theme'

function isAddress(id) {
  return typeof id === 'string' && id.startsWith('0x') && id.length === 42
}

export default function Company() {
  const { slug, companyId } = useParams()
  const navigate = useNavigate()
  const { address, signer, contracts: deployedContracts, refresh } = useWallet()

  const onChain = isAddress(companyId)

  const [chainCo,      setChainCo]      = useState(null)
  const [chainLoading, setChainLoading] = useState(onChain)
  const [reloadKey,    setReloadKey]    = useState(0)

  useEffect(() => {
    if (!onChain) return
    const rpc = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const co  = new ethers.Contract(companyId, COMPANY_ABI, rpc)
    let cancelled = false
    setChainLoading(true)

    async function load() {
      try {
        const [name, secretary, sRaw, vRaw, equityResult] = await Promise.all([
          co.name(),
          co.secretary(),
          co.sBalance(),
          co.vBalance(),
          co.getEquityTable(),
        ])
        if (cancelled) return

        const [holders, totalStakes, vestedStakes] = equityResult
        console.log('[Company] getEquityTable raw:',
          'holders:', Array.from(holders),
          'totalStakes:', Array.from(totalStakes).map(x => x.toString()),
          'vestedStakes:', Array.from(vestedStakes).map(x => x.toString()),
        )
        const totalOutstandingBps = holders.reduce((sum, _, i) => sum + Number(totalStakes[i]), 0)

        // Load equity assetIds from AToken so Secretary can forfeit/buyback
        // Also cross-check vestedBps directly from AToken.getVestingStake for accuracy
        const aTokenAddr = deployedContracts?.colonies?.[slug]?.aToken
        let equityAssetIds = holders.map(() => null)
        let perTokenVested = vestedStakes.map(v => Number(v))  // default from getEquityTable
        if (aTokenAddr && holders.length > 0) {
          const aToken = new ethers.Contract(aTokenAddr, ATOKEN_ABI, rpc)
          // For each holder entry, find their assetId for this company and read vestedBps directly
          const perEntryIds = await Promise.all(holders.map(async (holderAddr) => {
            try {
              const tokenIds = await aToken.tokensOf(holderAddr)
              // Return ALL matching token IDs for this holder+company (may be multiple)
              const matching = []
              for (const id of tokenIds) {
                const [totalBps, vestedBps, company] = await aToken.getVestingStake(id)
                if (company.toLowerCase() === companyId.toLowerCase()) {
                  console.log(`[Company] AToken.getVestingStake(${id}): total=${totalBps}, vested=${vestedBps}, company=${company}`)
                  matching.push({ id: id.toString(), totalBps: Number(totalBps), vestedBps: Number(vestedBps) })
                }
              }
              return matching
            } catch {}
            return []
          }))
          // perEntryIds[i] = array of {id, totalBps, vestedBps} matching entries for holders[i]
          // We need to match each equity table row to the correct assetId.
          // Strategy: for each row i, among matching tokens for holders[i], pick the one
          // whose totalBps matches totalStakes[i]. This handles duplicate holders correctly.
          const usedIds = new Set()
          equityAssetIds = holders.map((_, i) => {
            const rowTotal = Number(totalStakes[i])
            const candidates = perEntryIds[i]
            const match = candidates.find(c => c.totalBps === rowTotal && !usedIds.has(c.id))
              || candidates.find(c => !usedIds.has(c.id))  // fallback: first unused
            if (match) { usedIds.add(match.id); return match.id }
            return null
          })
          // Override vestedBps with directly-read values from AToken (more reliable)
          perTokenVested = holders.map((_, i) => {
            const rowTotal = Number(totalStakes[i])
            const candidates = perEntryIds[i]
            const id = equityAssetIds[i]
            const match = candidates.find(c => c.id === id) || candidates.find(c => c.totalBps === rowTotal)
            return match ? match.vestedBps : Number(vestedStakes[i])
          })
        }

        if (cancelled) return
        // Resolve citizen names for equity holders
        const colonyAddr = deployedContracts?.colonies?.[slug]?.colony
        const holderNameMap = await resolveNames(holders, colonyAddr).catch(() => ({}))
        setChainCo({
          name,
          secretary:          secretary.toLowerCase(),
          sBalance:           Math.floor(Number(ethers.formatEther(sRaw))),
          vReserve:           Math.floor(Number(ethers.formatEther(vRaw))),
          totalOutstandingBps,
          equity:             holders.map((addr, i) => ({
            wallet:    addr,
            label:     namedAddr(addr, holderNameMap),
            totalBps:  Number(totalStakes[i]),
            vestedBps: perTokenVested[i],
            pct:       totalOutstandingBps > 0
                         ? Number(totalStakes[i]) / totalOutstandingBps * 100
                         : 0,
            assetId:   equityAssetIds[i],
          })),
          dividendHistory: [],
          transactions:    [],
        })
      } catch (e) {
        console.warn('[Company] load chain data failed:', e?.message || e)
      }
      if (!cancelled) setChainLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [companyId, onChain, deployedContracts, slug, reloadKey])

  const company = onChain ? chainCo : null

  const [tab, setTab] = useState('overview')

  // ── F-16: Share event history ──────────────────────────────────────────────
  const [shareEvents,    setShareEvents]    = useState([])
  const [eventsLoading,  setEventsLoading]  = useState(false)

  useEffect(() => {
    if (!onChain || !companyId) return
    let cancelled = false
    setEventsLoading(true)

    async function loadShareEvents() {
      try {
        const rpc   = new ethers.JsonRpcProvider('https://sepolia.base.org')
        const iface = new ethers.Interface(COMPANY_EVENTS_ABI)
        const toBlock = await rpc.getBlockNumber()
        // sepolia.base.org getLogs is capped at 10,000 blocks per request — chunk
        const CHUNK = 9000, N_CHUNKS = 6
        const chunks = await Promise.all(
          Array.from({ length: N_CHUNKS }, (_, i) => {
            const cTo   = toBlock - i * CHUNK
            const cFrom = Math.max(0, cTo - CHUNK)
            return rpc.getLogs({ address: companyId, fromBlock: cFrom, toBlock: cTo })
              .catch(() => [])
          })
        )
        const logs = chunks.flat()

        // Resolve block timestamps
        const blocks = [...new Set(logs.map(l => l.blockNumber))]
        const blockMap = {}
        await Promise.all(blocks.map(async n => {
          const b = await rpc.getBlock(n)
          if (b) blockMap[n] = b.timestamp
        }))
        const fmtDate = ts => ts
          ? new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : ''

        const parsedAddrs = new Set()
        const parsed = logs.map(log => {
          let p
          try { p = iface.parseLog(log) } catch { return null }
          if (!p) return null
          if (p.name === 'SharesIssued') parsedAddrs.add(String(p.args[0]))
          return { log, parsed: p }
        }).filter(Boolean)

        const cfg = deployedContracts?.colonies?.[slug]
        const nameMap = await resolveNames([...parsedAddrs], cfg?.colony).catch(() => ({})) || {}

        if (cancelled) return
        const events = parsed.map(({ log, parsed: p }) => {
          const date = fmtDate(blockMap[log.blockNumber])
          if (p.name === 'SharesIssued') {
            const holder = String(p.args[0])
            return {
              kind: 'issued', date, blockNumber: log.blockNumber,
              text: `Issued ${Number(p.args[1])} bps to ${nameMap[holder.toLowerCase()] || shortAddr(holder)}${p.args[2] ? ' (vesting)' : ' (open)'}`,
              color: C.green,
            }
          }
          if (p.name === 'SharesForfeited') {
            return {
              kind: 'forfeit', date, blockNumber: log.blockNumber,
              text: `Forfeited ${Number(p.args[1])} bps from asset #${String(p.args[0])}`,
              color: C.red,
            }
          }
          if (p.name === 'SharesBoughtBack') {
            return {
              kind: 'buyback', date, blockNumber: log.blockNumber,
              text: `Bought back ${Number(p.args[1])} bps from asset #${String(p.args[0])} for ${Number(ethers.formatEther(p.args[2]))} S`,
              color: C.gold,
            }
          }
          if (p.name === 'DividendDeclared') {
            return {
              kind: 'dividend', date, blockNumber: log.blockNumber,
              text: `Declared ${Number(ethers.formatEther(p.args[0]))} V dividend across ${Number(p.args[1])} holders`,
              color: C.purple,
            }
          }
          return null
        }).filter(Boolean).sort((a, b) => b.blockNumber - a.blockNumber)

        setShareEvents(events)
      } catch (e) {
        console.warn('[Company] share events load failed:', e?.message || e)
        if (!cancelled) setShareEvents([])
      }
      if (!cancelled) setEventsLoading(false)
    }
    loadShareEvents()
    return () => { cancelled = true }
  }, [onChain, companyId, deployedContracts, slug, reloadKey])

  // ── OS-05: Secretary handover history ──────────────────────────────────────
  const [secretaryHistory, setSecretaryHistory] = useState([])
  const [historyLoading,   setHistoryLoading]   = useState(false)

  useEffect(() => {
    const cfg = deployedContracts?.colonies?.[slug]
    const oTokenAddr = cfg?.oToken
    const currentSecretary = chainCo?.secretary
    if (!oTokenAddr || !currentSecretary) return
    let cancelled = false
    setHistoryLoading(true)

    async function load() {
      try {
        const rpc    = new ethers.JsonRpcProvider('https://sepolia.base.org')
        const oToken = new ethers.Contract(oTokenAddr, OTOKEN_ABI, rpc)

        // Find this company's tokenId by walking the secretary's O-tokens
        const tokenIds = await oToken.tokensOf(currentSecretary)
        let companyTokenId = null
        for (const id of tokenIds) {
          const org = await oToken.orgs(id)
          if (String(org.name) === String(chainCo?.name)) { companyTokenId = id; break }
        }
        if (companyTokenId === null) { setSecretaryHistory([]); setHistoryLoading(false); return }

        // Query handover events filtered by tokenId. sepolia.base.org caps
        // eth_getLogs at 10,000 blocks; chunk to stay under.
        const iface = new ethers.Interface(OTOKEN_ABI)
        const tokenIdHex  = ethers.zeroPadValue(ethers.toBeHex(companyTokenId), 32)
        const handoverTopic = ethers.id("RoleHandedOver(uint256,address,address)")
        const registerTopic = ethers.id("OrgRegistered(uint256,address,uint8,string)")
        const toBlock = await rpc.getBlockNumber()
        const CHUNK = 9000, N_CHUNKS = 6
        const queryChunked = (topic) => Promise.all(
          Array.from({ length: N_CHUNKS }, (_, i) => {
            const cTo   = toBlock - i * CHUNK
            const cFrom = Math.max(0, cTo - CHUNK)
            return rpc.getLogs({ address: oTokenAddr, fromBlock: cFrom, toBlock: cTo,
              topics: [topic, tokenIdHex] }).catch(() => [])
          })
        ).then(arrs => arrs.flat())

        const [handoverLogs, registerLogs] = await Promise.all([
          queryChunked(handoverTopic),
          queryChunked(registerTopic),
        ])

        const events = []
        for (const log of registerLogs) {
          const parsed = iface.parseLog(log)
          events.push({
            kind: 'register',
            blockNumber: log.blockNumber,
            from: null,
            to:   String(parsed.args[1]),
          })
        }
        for (const log of handoverLogs) {
          const parsed = iface.parseLog(log)
          events.push({
            kind: 'handover',
            blockNumber: log.blockNumber,
            from: String(parsed.args[1]),
            to:   String(parsed.args[2]),
          })
        }
        events.sort((a, b) => a.blockNumber - b.blockNumber)

        // Resolve block timestamps + citizen names
        const blocks = [...new Set(events.map(e => e.blockNumber))]
        const blockMap = {}
        await Promise.all(blocks.map(async n => {
          const b = await rpc.getBlock(n)
          if (b) blockMap[n] = b.timestamp
        }))
        const fmtDate = ts => ts
          ? new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : ''
        const allAddrs = events.flatMap(e => [e.from, e.to]).filter(Boolean)
        const nameMap = await resolveNames(allAddrs, cfg.colony).catch(() => ({}))

        if (cancelled) return
        setSecretaryHistory(events.map(e => ({
          ...e,
          date: fmtDate(blockMap[e.blockNumber]),
          fromName: e.from ? (nameMap[e.from.toLowerCase()] || null) : null,
          toName:   nameMap[e.to.toLowerCase()] || null,
        })))
      } catch (e) {
        console.warn('[Company] secretary history load failed:', e?.message || e)
        if (!cancelled) setSecretaryHistory([])
      }
      if (!cancelled) setHistoryLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [deployedContracts, slug, chainCo, reloadKey])

  // ── On-chain transaction history ───────────────────────────────────────────
  const [onChainTxs, setOnChainTxs] = useState([])
  const [txLoading,  setTxLoading]  = useState(false)

  useEffect(() => {
    if (tab !== 'transactions') return
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg?.colony) return
    const queryAddr = companyId
    if (!queryAddr) return
    setTxLoading(true)
    const rpc = new ethers.JsonRpcProvider('https://sepolia.base.org')

    async function load() {
      try {
        const iface = new ethers.Interface(COLONY_EVENTS_ABI)
        const toBlock = await rpc.getBlockNumber()
        const T_SENT  = ethers.id('Sent(address,address,uint256,string)')
        const T_SAVED = ethers.id('Saved(address,uint256)')
        const T_VDIV  = ethers.id('VDividendPaid(address,address,uint256)')
        const pad     = (addr) => ethers.zeroPadValue(addr, 32)
        const safeLogs = async (filter) => {
          try { return await rpc.getLogs(filter) }
          catch (e) { console.warn('[Accounts] getLogs failed:', e?.message); return [] }
        }
        const CHUNK = 9000
        const chunkResults = await Promise.all(
          Array.from({ length: 20 }, (_, i) => {
            const chunkTo   = toBlock - i * CHUNK
            const chunkFrom = Math.max(0, chunkTo - CHUNK)
            const base      = { address: cfg.colony, fromBlock: chunkFrom, toBlock: chunkTo }
            return Promise.all([
              safeLogs({ ...base, topics: [T_SENT,  null,           pad(queryAddr)] }),
              safeLogs({ ...base, topics: [T_SENT,  pad(queryAddr), null]           }),
              onChain ? safeLogs({ ...base, topics: [T_SAVED, pad(queryAddr)]         }) : Promise.resolve([]),
              onChain ? safeLogs({ ...base, topics: [T_VDIV,  pad(queryAddr), null]   }) : Promise.resolve([]),
            ])
          })
        )
        const decode = (log) => { try { return iface.parseLog(log) } catch { return null } }
        const flat   = (idx) => chunkResults.flatMap(c => c[idx]).map(l => ({ ...l, parsed: decode(l) })).filter(l => l.parsed)
        const received  = flat(0)
        const sent      = flat(1)
        const saves     = flat(2)
        const dividends = flat(3)
        const allEvents = [...received, ...sent, ...saves, ...dividends]
        const uniqueBlocks = [...new Set(allEvents.map(e => e.blockNumber))]
        const blockMap = {}
        await Promise.all(uniqueBlocks.map(async n => {
          const b = await rpc.getBlock(n)
          if (b) blockMap[n] = b.timestamp
        }))
        const fmtDate = ts => ts
          ? new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : ''
        // Resolve citizen names for counterparties in this tx set
        const cpAddrs = [
          ...received.map(e => String(e.parsed.args[0])),
          ...sent.map(e => String(e.parsed.args[1])),
          ...dividends.map(e => String(e.parsed.args[1])),
        ]
        const txNameMap = await resolveNames(cpAddrs, cfg.colony).catch(() => ({}))

        const rows = [
          ...received.map(e => ({
            hash: e.transactionHash, blockNumber: e.blockNumber,
            date: fmtDate(blockMap[e.blockNumber]),
            type: 'revenue',
            description: e.parsed.args[3] || 'Payment received',
            counterparty: String(e.parsed.args[0]),
            counterpartyName: txNameMap[String(e.parsed.args[0]).toLowerCase()] || null,
            dr: Math.floor(Number(ethers.formatEther(e.parsed.args[2]))),
            cr: null,
          })),
          ...sent.map(e => ({
            hash: e.transactionHash, blockNumber: e.blockNumber,
            date: fmtDate(blockMap[e.blockNumber]),
            type: 'expense',
            description: e.parsed.args[3] || 'Payment sent',
            counterparty: String(e.parsed.args[1]),
            counterpartyName: txNameMap[String(e.parsed.args[1]).toLowerCase()] || null,
            dr: null,
            cr: Math.floor(Number(ethers.formatEther(e.parsed.args[2]))),
          })),
          ...saves.map(e => ({
            hash: e.transactionHash, blockNumber: e.blockNumber,
            date: fmtDate(blockMap[e.blockNumber]),
            type: 'convert',
            description: 'S → V conversion',
            counterparty: null, counterpartyName: null,
            dr: null,
            cr: Math.floor(Number(ethers.formatEther(e.parsed.args[1]))),
          })),
          ...dividends.map(e => ({
            hash: e.transactionHash, blockNumber: e.blockNumber,
            date: fmtDate(blockMap[e.blockNumber]),
            type: 'dividend',
            description: `V dividend → ${namedAddr(String(e.parsed.args[1]), txNameMap)}`,
            counterparty: String(e.parsed.args[1]),
            counterpartyName: txNameMap[String(e.parsed.args[1]).toLowerCase()] || null,
            dr: null,
            cr: Math.floor(Number(ethers.formatEther(e.parsed.args[2]))),
          })),
        ].sort((a, b) => b.blockNumber - a.blockNumber)
        setOnChainTxs(rows)
      } catch (e) {
        console.warn('Failed to load on-chain txs', e)
      }
      setTxLoading(false)
    }
    load()
  }, [tab, deployedContracts, slug, address, companyId, onChain])

  // ── Action state ───────────────────────────────────────────────────────────
  const [renaming,        setRenaming]       = useState(false)
  const [newName,         setNewName]        = useState('')
  const [renamePending,   setRenamePending]  = useState(false)
  const [renameError,     setRenameError]    = useState(null)

  async function handleRename() {
    if (!signer || !newName.trim()) return
    setRenamePending(true); setRenameError(null)
    try {
      const co = new ethers.Contract(companyId, COMPANY_ABI, signer)
      const tx = await co.setName(newName.trim())
      await tx.wait()
      setRenaming(false); setNewName('')
      setReloadKey(k => k + 1)
    } catch (e) {
      setRenameError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setRenamePending(false)
  }

  const [converting,      setConverting]     = useState(false)
  const [convertAmt,      setConvertAmt]     = useState('')
  const [dividending,     setDiv]            = useState(false)
  const [dividendAmt,     setDividendAmt]    = useState('')
  const [sending,         setSending]        = useState(false)
  const [issuingShares,   setIssuingShares]  = useState(false)
  const [issueType,       setIssueType]      = useState('open')
  const [issueHolder,     setIssueHolder]    = useState('')
  const [issueStakeBps,   setIssueStakeBps]  = useState('')
  const [issueVestMonths, setIssueVestMonths] = useState('12')
  const [handingOver,     setHandingOver]    = useState(false)
  const [handoverTarget,  setHandoverTarget] = useState('')
  const [handoverStep,    setHandoverStep]   = useState('') // '' | 'changing' | 'handing' | 'done'
  const [buybackForId,    setBuybackForId]   = useState(null)  // assetId being bought back
  const [buybackBps,      setBuybackBps]     = useState('')
  const [buybackPriceS,   setBuybackPriceS]  = useState('')
  const [scheduleForId,   setScheduleForId]  = useState(null)  // F-26: assetId showing schedule
  const [scheduleData,    setScheduleData]   = useState({})    // assetId → schedule object
  const [giftForId,       setGiftForId]      = useState(null)  // S-06: assetId being gifted
  const [giftTarget,      setGiftTarget]     = useState('')
  const [giftBps,         setGiftBps]        = useState('')
  const [registeringAsset, setRegisteringAsset] = useState(false)  // OS-11
  const [assetLabel,      setAssetLabel]     = useState('')
  const [assetValue,      setAssetValue]     = useState('')
  const [assetWeight,     setAssetWeight]    = useState('')
  const [assetHasAI,      setAssetHasAI]     = useState(false)
  const [companyAssets,   setCompanyAssets]  = useState([])     // OS-06: company-held A-tokens
  const [citizens,        setCitizens]       = useState([])

  useEffect(() => {
    const colonyAddr = deployedContracts?.colonies?.[slug]?.colony
    if (!colonyAddr) return
    fetchColonyCitizens(colonyAddr).then(setCitizens).catch(() => {})
  }, [slug, deployedContracts])
  const [actionPending,   setActPending]     = useState(false)
  const [actionError,     setActError]       = useState(null)
  const [actionDone,      setActDone]        = useState(null)

  // Pay state (any citizen)
  const [payAmt,  setPayAmt]  = useState('')
  const [payNote, setPayNote] = useState('')

  function companyContract() {
    if (!signer || !onChain) return null
    return new ethers.Contract(companyId, COMPANY_ABI, signer)
  }

  async function handleConvertToV() {
    const co = companyContract()
    const amt = Number(convertAmt)
    if (!co || !amt) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const tx = await co.convertToV(ethers.parseEther(String(amt)))
      await tx.wait()
      setActDone(`Converted ${amt} S → V`)
      setConverting(false); setConvertAmt('')
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  async function handleDeclareDividend() {
    const co = companyContract()
    const amt = Number(dividendAmt)
    if (!co || !amt) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const tx = await co.declareDividend(ethers.parseEther(String(amt)))
      await tx.wait()
      setActDone(`Declared ${amt} V dividend to shareholders`)
      setDiv(false); setDividendAmt('')
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  async function handleIssueShares() {
    const co = companyContract()
    if (!co || !issueHolder || !issueStakeBps) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const bps = Number(issueStakeBps)
      let tx
      if (issueType === 'open') {
        tx = await co.issueOpenShares(issueHolder, bps)
      } else {
        const months = Math.max(1, Number(issueVestMonths) || 12)
        const perTranche = Math.floor(bps / months)
        const last = bps - perTranche * (months - 1)
        const vestingEpochs = Array.from({ length: months }, (_, i) => i + 1)
        const trancheBps    = Array.from({ length: months }, (_, i) => i === months - 1 ? last : perTranche)
        tx = await co.issueVestingShares(issueHolder, bps, vestingEpochs, trancheBps)
      }
      await tx.wait()
      setActDone(`Issued ${(bps / 100).toFixed(2)}% to ${issueHolder.slice(0, 8)}…`)
      setIssuingShares(false); setIssueHolder(''); setIssueStakeBps('')
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  async function handleForfeitShares(assetId) {
    const co = companyContract()
    if (!co || assetId == null) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const tx = await co.forfeitShares(BigInt(assetId))
      await tx.wait()
      setActDone('Unvested shares forfeited')
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  // F-26: load per-tranche schedule for an equity token. Falls back gracefully
  // on older AToken deployments that lack getVestingSchedule.
  async function toggleSchedule(assetId) {
    if (scheduleForId === assetId) { setScheduleForId(null); return }
    setScheduleForId(assetId)
    if (scheduleData[assetId]) return  // cached
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg?.aToken) return
    try {
      const rpc    = new ethers.JsonRpcProvider('https://sepolia.base.org')
      const aToken = new ethers.Contract(cfg.aToken, ATOKEN_ABI, rpc)
      const r      = await aToken.getVestingSchedule(BigInt(assetId))
      setScheduleData(prev => ({
        ...prev,
        [assetId]: {
          totalStakeBps: Number(r[0]),
          vestedBps:     Number(r[1]),
          epochs:        r[3].map(Number),
          tranches:      r[4].map(Number),
          nextTranche:   Number(r[5]),
        },
      }))
    } catch (e) {
      setScheduleData(prev => ({
        ...prev,
        [assetId]: { unavailable: true },
      }))
    }
  }

  // S-06: shareholder transfers vested equity as a gift via Colony relay.
  async function handleGiftShares(assetId) {
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg?.colony || !signer) return
    if (!ethers.isAddress(giftTarget)) { setActError('Invalid recipient address'); return }
    const bps = Number(giftBps)
    if (!(bps > 0)) { setActError('bps must be > 0'); return }
    setActPending(true); setActError(null); setActDone(null)
    try {
      const colonyContract = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colonyContract.transferEquity(BigInt(assetId), giftTarget, BigInt(bps))
      await tx.wait()
      setActDone(`Gifted ${bps} bps to ${shortAddr(giftTarget)}`)
      setGiftForId(null); setGiftTarget(''); setGiftBps('')
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  // F-23: participant claims all newly-vested tranches via Colony relay.
  async function handleClaimVested(assetId) {
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg?.colony || !signer || !assetId) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const colonyContract = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colonyContract.claimVestedTranches(BigInt(assetId))
      await tx.wait()
      setActDone(`Vested tranches claimed`)
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Nothing to claim, or transaction failed')
    }
    setActPending(false)
  }

  // OS-11: secretary registers a physical asset to the company wallet.
  async function handleRegisterAsset() {
    const co = companyContract()
    if (!co) return
    const v = Number(assetValue)
    const w = Number(assetWeight) || 0
    if (!assetLabel.trim() || (!(v > 500) && !(w > 50) && !assetHasAI)) {
      setActError('Asset must be > 500 S OR > 50 kg OR have autonomous AI')
      return
    }
    setActPending(true); setActError(null); setActDone(null)
    try {
      const tx = await co.registerAsset(
        assetLabel.trim(),
        ethers.parseEther(String(v || 0)),
        BigInt(w),
        Boolean(assetHasAI),
        0n,  // no depreciation by default — secretary can set later via direct AToken call if needed
      )
      await tx.wait()
      setActDone(`Asset "${assetLabel}" registered to company`)
      setRegisteringAsset(false); setAssetLabel(''); setAssetValue(''); setAssetWeight(''); setAssetHasAI(false)
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  // OS-12: secretary transfers a company-held A-token to another wallet (sale).
  async function handleTransferCompanyAsset(assetId, toAddr, newValueS) {
    const co = companyContract()
    if (!co) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const tx = await co.transferAsset(BigInt(assetId), toAddr, ethers.parseEther(String(newValueS || 0)))
      await tx.wait()
      setActDone(`Asset transferred`)
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  // OS-06: load company-held UNILATERAL A-tokens for the Overview asset card.
  useEffect(() => {
    if (!onChain || !companyId) return
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg?.aToken) return
    let cancelled = false

    async function loadCompanyAssets() {
      try {
        const rpc    = new ethers.JsonRpcProvider('https://sepolia.base.org')
        const aToken = new ethers.Contract(cfg.aToken, ATOKEN_ABI, rpc)
        const ids    = await aToken.tokensOf(companyId)
        const items  = await Promise.all(ids.map(async id => {
          try {
            const t = await aToken.tokens(id)
            const form = Number(t[0])
            const active = Boolean(t[4])
            if (!active || form !== 0) return null  // UNILATERAL only
            const [valRaw, wt, hasAI] = await aToken.assetData(id)
            let label = ''
            try { label = await aToken.assetLabel(id) } catch {}
            return {
              id:       String(id),
              label,
              value:    Math.floor(Number(ethers.formatEther(valRaw))),
              weightKg: Number(wt),
              hasAI:    Boolean(hasAI),
            }
          } catch { return null }
        }))
        if (!cancelled) setCompanyAssets(items.filter(Boolean))
      } catch (e) {
        console.warn('[Company] company assets load failed:', e?.message || e)
      }
    }
    loadCompanyAssets()
    return () => { cancelled = true }
  }, [onChain, companyId, deployedContracts, slug, reloadKey])

  // F-15a: buy back vested equity from a holder at a secretary-set S-token price.
  // Cancels the bps from the holder's stake, increasing NAV for remaining shareholders.
  async function handleBuyback(assetId) {
    const co = companyContract()
    if (!co || !assetId) return
    const bps   = Number(buybackBps)
    const price = Number(buybackPriceS)
    if (!(bps > 0) || !(price > 0)) {
      setActError('Enter both bps and S-token price (each > 0)')
      return
    }
    setActPending(true); setActError(null); setActDone(null)
    try {
      const tx = await co.buybackShares(BigInt(assetId), BigInt(bps), ethers.parseEther(String(price)))
      await tx.wait()
      setActDone(`Bought back ${bps} bps for ${price} S — shares cancelled`)
      setBuybackForId(null); setBuybackBps(''); setBuybackPriceS('')
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  // OS-04: Hand over secretary role + O-token identity to another citizen.
  // Two on-chain calls (Company.changeSecretary then OToken.handOver) so the
  // incoming holder gets both authority and identity in a single user flow.
  async function handleHandover() {
    const co = companyContract()
    const oTokenAddr = deployedContracts?.colonies?.[slug]?.oToken
    if (!co || !signer || !handoverTarget || !oTokenAddr) return
    if (handoverTarget.toLowerCase() === address?.toLowerCase()) {
      setActError('Cannot hand over to yourself')
      return
    }
    setActPending(true); setActError(null); setActDone(null)
    try {
      // Locate the O-token id for this company by matching org name on tokens
      // currently held by the outgoing secretary.
      const oToken   = new ethers.Contract(oTokenAddr, OTOKEN_ABI, signer)
      const tokenIds = await oToken.tokensOf(address)
      let companyTokenId = null
      for (const id of tokenIds) {
        const org = await oToken.orgs(id)
        if (String(org.name) === String(company?.name)) {
          companyTokenId = id
          break
        }
      }
      if (companyTokenId === null) {
        throw new Error('O-token for this company not found in your wallet')
      }

      // 1. Company.changeSecretary — moves on-chain authority
      setHandoverStep('changing')
      const tx1 = await co.changeSecretary(handoverTarget)
      await tx1.wait()

      // 2. OToken.handOver — moves the identity badge (recipient must be a citizen)
      setHandoverStep('handing')
      const tx2 = await oToken.handOver(companyTokenId, handoverTarget)
      await tx2.wait()

      setHandoverStep('done')
      setActDone(`Secretary role handed over to ${shortAddr(handoverTarget)}`)
      setHandingOver(false); setHandoverTarget('')
      refresh(); setReloadKey(k => k + 1)
    } catch (e) {
      const stage = handoverStep === 'handing'
        ? ' — secretary changed but O-token transfer failed; the outgoing wallet still holds the badge and can retry the handover'
        : ''
      setActError((e?.reason || e?.shortMessage || e?.message || 'Transaction failed') + stage)
    }
    setHandoverStep('')
    setActPending(false)
  }

  async function handleCompanyPay(amt, recipient, note) {
    const co = companyContract()
    if (!co) { setSending(false); return }
    try {
      const tx = await co.pay(recipient, ethers.parseEther(String(amt)), note)
      await tx.wait()
      refresh()
    } catch (e) {
      console.error(e)
    }
    setSending(false)
  }

  async function handlePersonalSend(amt, recipient, note) {
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg || !signer) { setSending(false); return }
    try {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.send(recipient, ethers.parseEther(String(amt)), note)
      await tx.wait()
      refresh()
    } catch (e) {
      console.error(e)
    }
    setSending(false)
  }

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (onChain && chainLoading) return (
    <Layout title="Company" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        Loading company…
      </div>
    </Layout>
  )

  if (!company) return (
    <Layout title="Company" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        Company not found.
      </div>
    </Layout>
  )

  const myAddr         = address?.toLowerCase()
  const myStake        = company.equity.find(e => e.wallet.toLowerCase() === myAddr)
  const isSecretary    = chainCo?.secretary === myAddr
  const isEquityHolder = !!myStake

  return (
    <Layout title={company.name} back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Header card */}
        <div style={card}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <EntityImage
              colony={slug}
              entityType="company"
              entityId={companyId.toLowerCase()}
              editable={isSecretary}
              size={56}
              label={company.name.slice(0, 2).toUpperCase()}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{company.name}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                  {myStake && (
                    <span style={{ fontSize: 10, color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 10, padding: '2px 8px' }}>
                      {myStake.pct.toFixed(1)}% EQUITY
                    </span>
                  )}
                  {isSecretary && (
                    <span style={{ fontSize: 10, color: '#8b5cf6', border: '1px solid #8b5cf6', borderRadius: 10, padding: '2px 8px' }}>
                      SECRETARY
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.faint }}>
                {company.equity.length} shareholder{company.equity.length !== 1 ? 's' : ''} · {companyId.slice(0,8)}…{companyId.slice(-4)}
              </div>
              {isSecretary && !renaming && (
                <button
                  onClick={() => { setRenaming(true); setNewName(company.name) }}
                  style={{ fontSize: 10, color: C.faint, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: 4, textAlign: 'left' }}
                >
                  Rename company
                </button>
              )}
              {renaming && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      style={{ ...inlineInput, flex: 1, fontSize: 13 }}
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleRename} disabled={renamePending || !newName.trim()}
                      style={{ ...actionBtn(C.gold), opacity: (!newName.trim() || renamePending) ? 0.4 : 1 }}>
                      {renamePending ? '…' : 'Save'}
                    </button>
                    <button onClick={() => { setRenaming(false); setRenameError(null) }}
                      style={{ ...actionBtn(C.faint, C.white), border: `1px solid ${C.border}` }}>
                      Cancel
                    </button>
                  </div>
                  {renameError && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{renameError}</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', marginBottom: 12, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', background: C.white }}>
          {[['overview','Overview'],['equity','Equity'],['transactions','Accounts'],['contracts','Contracts']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0', background: tab === t ? C.gold : 'none',
              border: 'none', color: tab === t ? '#fff' : C.sub,
              fontSize: 10, cursor: 'pointer', letterSpacing: '0.04em',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div>
            {/* Balance row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>S BALANCE</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: C.gold }}>{company.sBalance}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>current</div>
              </div>
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>V RESERVE</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: C.green }}>{company.vReserve}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>accumulated</div>
              </div>
            </div>

            {/* Actions — Secretary */}
            {isSecretary && (
              <div style={card}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>ACTIONS</div>

                {actionDone  && <div style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>✓ {actionDone}</div>}
                {actionError && <div style={{ fontSize: 12, color: C.red,   marginBottom: 8 }}>{actionError}</div>}

                {/* Send S from company wallet */}
                <button onClick={() => setSending(v => !v)} style={{ ...actionBtn(C.sub, '#fff'), width: '100%', marginBottom: 8, border: `1px solid ${C.border}` }}>
                  Send S from company wallet →
                </button>
                {sending && (
                  <div style={{ marginBottom: 8 }}>
                    <SendSheet
                      maxAmount={company.sBalance}
                      label="Pay supplier / citizen"
                      onClose={() => setSending(false)}
                      onConfirm={onChain ? handleCompanyPay : handlePersonalSend}
                    />
                  </div>
                )}

                {/* Convert S → V */}
                <button onClick={() => setConverting(v => !v)} style={{ ...actionBtn(C.sub), width: '100%', marginBottom: 8 }}>
                  Convert S → V (lock earnings)
                </button>
                {converting && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      style={{ ...inlineInput, flex: 1 }}
                      placeholder={`max ${company.sBalance} S`}
                      value={convertAmt}
                      onChange={e => setConvertAmt(e.target.value)}
                      type="number"
                    />
                    <button
                      onClick={handleConvertToV}
                      disabled={actionPending}
                      style={{ ...actionBtn(C.gold), opacity: actionPending ? 0.5 : 1 }}
                    >
                      {actionPending ? '…' : 'Convert'}
                    </button>
                  </div>
                )}

                {/* Declare V dividend */}
                <button onClick={() => setDiv(v => !v)} style={{ ...actionBtn(C.sub), width: '100%', marginBottom: 8 }}>
                  Declare V dividend to shareholders
                </button>
                {dividending && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: C.faint, marginBottom: 8, lineHeight: 1.6 }}>
                      V reserve: {company.vReserve} V. Enter amount to distribute pro-rata to all equity holders.
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        style={{ ...inlineInput, flex: 1 }}
                        placeholder={`max ${company.vReserve} V`}
                        value={dividendAmt}
                        onChange={e => setDividendAmt(e.target.value)}
                        type="number"
                      />
                    </div>
                    {Number(dividendAmt) > 0 && company.equity.map(e => (
                      <div key={e.wallet} style={{ fontSize: 11, color: C.sub, marginBottom: 3 }}>
                        {e.label}: {(Number(dividendAmt) * e.pct / 100).toFixed(1)} V ({e.pct.toFixed(1)}%)
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => { setDiv(false); setDividendAmt('') }}
                        style={{ ...actionBtn(C.faint, '#fff'), border: `1px solid ${C.border}`, flex: 1 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeclareDividend}
                        disabled={actionPending || !dividendAmt || Number(dividendAmt) <= 0}
                        style={{ ...actionBtn(C.gold), flex: 2, opacity: (actionPending || !dividendAmt || Number(dividendAmt) <= 0) ? 0.4 : 1 }}
                      >
                        {actionPending ? 'Sending…' : 'Declare →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Issue shares */}
                <button onClick={() => setIssuingShares(v => !v)} style={{ ...actionBtn(C.sub), width: '100%', marginBottom: 8 }}>
                  Issue shares to participant / investor
                </button>
                {issuingShares && (
                  <div style={{ background: `${C.gold}08`, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      {[['open','Open (investor)'],['vesting','Vesting (participant)']].map(([t, label]) => (
                        <button key={t} onClick={() => setIssueType(t)} style={{
                          flex: 1, padding: '7px 4px', fontSize: 10,
                          background: issueType === t ? C.gold : C.white,
                          color: issueType === t ? '#fff' : C.sub,
                          border: `1px solid ${issueType === t ? C.gold : C.border}`,
                          borderRadius: 6, cursor: 'pointer',
                        }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: C.faint, marginBottom: 10, lineHeight: 1.6 }}>
                      {issueType === 'open'
                        ? 'Immediately transferable. Suitable for investors paying S-tokens upfront.'
                        : 'Earned in monthly tranches. Unvested shares forfeit if the participant stops contributing.'}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>HOLDER</div>
                      <select
                        style={{ ...inlineInput, width: '100%', fontFamily: "'IBM Plex Mono', monospace" }}
                        value={issueHolder}
                        onChange={e => setIssueHolder(e.target.value)}
                      >
                        <option value="">Select citizen…</option>
                        {citizens.map(c => (
                          <option key={c.address} value={c.address}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <CField label="Stake in basis points (10000 = 100%)" value={issueStakeBps} onChange={setIssueStakeBps} placeholder="e.g. 2000 = 20%" type="number" />
                    {issueType === 'vesting' && (
                      <CField label="Vesting period (months, equal tranches)" value={issueVestMonths} onChange={setIssueVestMonths} placeholder="12" type="number" />
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => setIssuingShares(false)} style={{ ...actionBtn(C.faint, '#fff'), border: `1px solid ${C.border}`, flex: 1 }}>
                        Cancel
                      </button>
                      <button
                        onClick={handleIssueShares}
                        disabled={actionPending || !issueHolder || !issueStakeBps}
                        style={{ ...actionBtn(C.gold), flex: 2, opacity: (actionPending || !issueHolder || !issueStakeBps) ? 0.4 : 1 }}
                      >
                        {actionPending ? 'Issuing…' : 'Issue shares →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Register company asset (OS-11) */}
                <button onClick={() => setRegisteringAsset(v => !v)} style={{ ...actionBtn(C.sub), width: '100%', marginBottom: 8 }}>
                  Register company asset
                </button>
                {registeringAsset && (
                  <div style={{ background: `${C.gold}08`, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: C.faint, marginBottom: 10, lineHeight: 1.6 }}>
                      Register a physical asset on-chain to the company wallet. Threshold: value &gt; 500 S, weight &gt; 50 kg, or autonomous AI.
                    </div>
                    <CField label="Label (e.g. 'Truck VIN-1234')" value={assetLabel} onChange={setAssetLabel} placeholder="describe the asset" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <CField label="Declared value (S)" value={assetValue} onChange={setAssetValue} placeholder="600" type="number" />
                      <CField label="Weight (kg, optional)" value={assetWeight} onChange={setAssetWeight} placeholder="0" type="number" />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.sub, marginBottom: 10 }}>
                      <input type="checkbox" checked={assetHasAI} onChange={e => setAssetHasAI(e.target.checked)} />
                      Autonomous AI capability
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setRegisteringAsset(false)} disabled={actionPending} style={{ ...actionBtn(C.faint, '#fff'), border: `1px solid ${C.border}`, flex: 1, opacity: actionPending ? 0.4 : 1 }}>
                        Cancel
                      </button>
                      <button onClick={handleRegisterAsset} disabled={actionPending || !assetLabel.trim()} style={{ ...actionBtn(C.gold), flex: 2, opacity: (actionPending || !assetLabel.trim()) ? 0.4 : 1 }}>
                        {actionPending ? 'Registering…' : 'Register asset →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Hand over secretary role (OS-04) */}
                <button onClick={() => setHandingOver(v => !v)} style={{ ...actionBtn(C.sub), width: '100%', marginBottom: 8 }}>
                  Hand over secretary role
                </button>
                {handingOver && (
                  <div style={{ background: `${C.gold}08`, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: C.faint, marginBottom: 10, lineHeight: 1.6 }}>
                      Transfer this company's secretary authority and the O-token identity badge to another citizen.
                      Two on-chain transactions will be requested in sequence.
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>NEW SECRETARY</div>
                      <select
                        style={{ ...inlineInput, width: '100%', fontFamily: "'IBM Plex Mono', monospace" }}
                        value={handoverTarget}
                        onChange={e => setHandoverTarget(e.target.value)}
                      >
                        <option value="">Select citizen…</option>
                        {citizens
                          .filter(c => c.address.toLowerCase() !== address?.toLowerCase())
                          .map(c => (
                            <option key={c.address} value={c.address}>{c.name}</option>
                          ))
                        }
                      </select>
                    </div>
                    {handoverStep && (
                      <div style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>
                        {handoverStep === 'changing' && 'Step 1/2 — transferring secretary authority…'}
                        {handoverStep === 'handing'  && 'Step 2/2 — handing over O-token identity badge…'}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => { setHandingOver(false); setHandoverTarget('') }}
                        disabled={actionPending}
                        style={{ ...actionBtn(C.faint, '#fff'), border: `1px solid ${C.border}`, flex: 1, opacity: actionPending ? 0.4 : 1 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleHandover}
                        disabled={actionPending || !handoverTarget}
                        style={{ ...actionBtn(C.gold), flex: 2, opacity: (actionPending || !handoverTarget) ? 0.4 : 1 }}
                      >
                        {actionPending ? 'Handing over…' : 'Hand over →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Request payment */}
                <button
                  onClick={() => navigate(`/colony/${slug}/request?from=${onChain ? companyId : address}&label=${encodeURIComponent(company.name)}`)}
                  style={{ ...actionBtn(C.gold), width: '100%' }}
                >
                  Request Payment (show QR) →
                </button>
              </div>
            )}

            {/* Equity holder — request payment only */}
            {!isSecretary && isEquityHolder && (
              <div style={card}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>ACTIONS</div>
                <button
                  onClick={() => navigate(`/colony/${slug}/request?from=${onChain ? companyId : address}&label=${encodeURIComponent(company.name)}`)}
                  style={{ ...actionBtn(C.gold), width: '100%' }}
                >
                  Request Payment (show QR) →
                </button>
              </div>
            )}
          </div>
        )}

        {/* OS-06 + OS-12: Company-held assets list, with secretary transfer action */}
        {tab === 'overview' && companyAssets.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              COMPANY ASSETS · {companyAssets.length}
            </div>
            {companyAssets.map((a, i) => (
              <div key={a.id} style={{
                paddingBottom: i < companyAssets.length - 1 ? 10 : 0,
                marginBottom:  i < companyAssets.length - 1 ? 10 : 0,
                borderBottom:  i < companyAssets.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 12, color: C.text }}>
                    {a.label || `Asset #${a.id}`}
                    <span style={{ fontSize: 10, color: C.faint, marginLeft: 6 }}>#{a.id}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.gold }}>{a.value} S</div>
                </div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>
                  {a.weightKg > 0 && <>{a.weightKg} kg · </>}
                  {a.hasAI && <>autonomous AI · </>}
                  declared value
                </div>
                {isSecretary && (
                  <button
                    onClick={() => {
                      const to = window.prompt('Recipient wallet address:')
                      if (!to || !ethers.isAddress(to)) return
                      const newVal = window.prompt('Agreed transfer price (S):', String(a.value))
                      if (!newVal || isNaN(Number(newVal))) return
                      handleTransferCompanyAsset(a.id, to, newVal)
                    }}
                    disabled={actionPending}
                    style={{
                      marginTop: 6, fontSize: 9, padding: '2px 7px',
                      background: 'none', border: `1px solid ${C.faint}`,
                      color: C.faint, borderRadius: 4, cursor: 'pointer',
                      opacity: actionPending ? 0.4 : 1,
                    }}
                  >
                    Transfer →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* OS-05: Secretary history — visible to all viewers on overview */}
        {tab === 'overview' && (
          <div style={card}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              SECRETARY HISTORY
            </div>
            {historyLoading ? (
              <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
            ) : secretaryHistory.length === 0 ? (
              <div style={{ fontSize: 12, color: C.faint }}>No on-chain handover history yet (founding secretary only).</div>
            ) : (
              secretaryHistory.map((h, i) => (
                <div key={i} style={{
                  paddingBottom: i < secretaryHistory.length - 1 ? 10 : 0,
                  marginBottom:  i < secretaryHistory.length - 1 ? 10 : 0,
                  borderBottom:  i < secretaryHistory.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 12, color: C.text }}>
                      {h.kind === 'register'
                        ? <>Founded — {h.toName || shortAddr(h.to)}</>
                        : <>{h.fromName || shortAddr(h.from)} → {h.toName || shortAddr(h.to)}</>}
                    </div>
                    <div style={{ fontSize: 10, color: C.faint }}>{h.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pay this company — visible to any connected citizen who isn't the secretary */}
        {tab === 'overview' && address && !isSecretary && (
          <div style={card}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              PAY {company.name.toUpperCase()}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ position: 'relative', width: 100, flexShrink: 0 }}>
                <input
                  style={{ ...inlineInput, width: '100%', paddingRight: 20 }}
                  type="number" min="1" placeholder="0"
                  value={payAmt} onChange={e => setPayAmt(e.target.value)}
                />
                <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.faint }}>S</span>
              </div>
              <input
                style={{ ...inlineInput, flex: 1 }}
                placeholder="Note (e.g. Coffee)"
                value={payNote} onChange={e => setPayNote(e.target.value)}
                maxLength={80}
              />
            </div>
            <button
              onClick={() => navigate(`/colony/${slug}/pay?to=${companyId}&amount=${encodeURIComponent(payAmt)}&note=${encodeURIComponent(payNote)}`)}
              disabled={!payAmt || Number(payAmt) <= 0}
              style={{ ...actionBtn(C.gold), width: '100%', opacity: payAmt && Number(payAmt) > 0 ? 1 : 0.4 }}
            >
              Pay →
            </button>
          </div>
        )}

        {/* ── Equity ── */}
        {tab === 'equity' && (
          <div>
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>EQUITY REGISTER</div>

              {/* Visual equity bar */}
              <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                {company.equity.map((e, i) => (
                  <div key={i} style={{ width: `${e.pct}%`, background: equityColor(i) }} />
                ))}
              </div>

              {/* Action feedback */}
              {actionDone  && <div style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>✓ {actionDone}</div>}
              {actionError && <div style={{ fontSize: 12, color: C.red,   marginBottom: 8 }}>{actionError}</div>}

              {company.equity.map((e, i) => (
                <div key={i} style={{
                  paddingBottom: i < company.equity.length - 1 ? 12 : 0,
                  marginBottom: i < company.equity.length - 1 ? 12 : 0,
                  borderBottom: i < company.equity.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: equityColor(i), flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: C.text }}>{e.label}</div>
                        <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace' }}>{shortAddr(e.wallet)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: equityColor(i) }}>{e.pct.toFixed(1)}%</div>
                      <div style={{ fontSize: 10, color: C.faint }}>{e.totalBps} bps total</div>
                    </div>
                  </div>

                  {/* Vesting progress */}
                  {e.totalBps > 0 && (
                    <div style={{ marginTop: 6, marginLeft: 18 }}>
                      <div style={{ height: 3, borderRadius: 2, background: C.border, overflow: 'hidden', marginBottom: 3 }}>
                        <div style={{
                          height: '100%',
                          width: `${e.vestedBps / e.totalBps * 100}%`,
                          background: equityColor(i), opacity: 0.75,
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: C.faint }}>
                          {e.vestedBps === e.totalBps
                            ? 'Fully vested'
                            : `${e.vestedBps} / ${e.totalBps} bps vested (${Math.round(e.vestedBps / e.totalBps * 100)}%)`}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {/* F-23: the holder of this equity row may claim newly-vested tranches */}
                          {e.assetId != null && e.wallet?.toLowerCase() === address?.toLowerCase() && e.vestedBps < e.totalBps && (
                            <button
                              onClick={() => handleClaimVested(e.assetId)}
                              disabled={actionPending}
                              style={{
                                fontSize: 9, padding: '2px 7px',
                                background: 'none', border: `1px solid ${C.green}`,
                                color: C.green, borderRadius: 4, cursor: 'pointer',
                                opacity: actionPending ? 0.4 : 1,
                              }}
                            >
                              Claim vested
                            </button>
                          )}
                          {/* S-06: holder can gift vested shares to another wallet */}
                          {e.assetId != null && e.wallet?.toLowerCase() === address?.toLowerCase() && e.vestedBps > 0 && (
                            <button
                              onClick={() => {
                                if (giftForId === e.assetId) { setGiftForId(null) }
                                else { setGiftForId(e.assetId); setGiftBps(String(Math.min(100, e.vestedBps))); setGiftTarget('') }
                              }}
                              disabled={actionPending}
                              style={{
                                fontSize: 9, padding: '2px 7px',
                                background: 'none', border: `1px solid ${C.purple}`,
                                color: C.purple, borderRadius: 4, cursor: 'pointer',
                                opacity: actionPending ? 0.4 : 1,
                              }}
                            >
                              {giftForId === e.assetId ? 'Cancel gift' : 'Gift'}
                            </button>
                          )}
                          {isSecretary && e.assetId != null && e.vestedBps > 0 && e.wallet?.toLowerCase() !== address?.toLowerCase() && (
                            <button
                              onClick={() => {
                                if (buybackForId === e.assetId) { setBuybackForId(null) }
                                else { setBuybackForId(e.assetId); setBuybackBps(String(e.vestedBps)); setBuybackPriceS('') }
                              }}
                              disabled={actionPending}
                              style={{
                                fontSize: 9, padding: '2px 7px',
                                background: 'none', border: `1px solid ${C.gold}`,
                                color: C.gold, borderRadius: 4, cursor: 'pointer',
                                opacity: actionPending ? 0.4 : 1,
                              }}
                            >
                              {buybackForId === e.assetId ? 'Cancel' : 'Buy back'}
                            </button>
                          )}
                          {isSecretary && e.assetId != null && e.vestedBps < e.totalBps && (
                            <button
                              onClick={() => handleForfeitShares(e.assetId)}
                              disabled={actionPending}
                              style={{
                                fontSize: 9, padding: '2px 7px',
                                background: 'none', border: `1px solid ${C.red}`,
                                color: C.red, borderRadius: 4, cursor: 'pointer',
                                opacity: actionPending ? 0.4 : 1,
                              }}
                            >
                              Forfeit unvested
                            </button>
                          )}
                        </div>
                      </div>

                      {/* S-06: inline gift form when this row's button is active */}
                      {giftForId === e.assetId && (
                        <div style={{ marginTop: 8, padding: 10, background: `${C.purple}08`, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                          <div style={{ fontSize: 10, color: C.faint, lineHeight: 1.6, marginBottom: 8 }}>
                            Gift vested bps from your stake to another wallet — recipient gets a fully-vested token. No payment exchanged.
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <select
                              style={{ ...inlineInput, width: '100%', fontFamily: "'IBM Plex Mono', monospace" }}
                              value={giftTarget}
                              onChange={ev => setGiftTarget(ev.target.value)}
                            >
                              <option value="">Select recipient citizen…</option>
                              {citizens
                                .filter(c => c.address.toLowerCase() !== address?.toLowerCase())
                                .map(c => (
                                  <option key={c.address} value={c.address}>{c.name}</option>
                                ))
                              }
                            </select>
                          </div>
                          <input
                            style={{ ...inlineInput, width: '100%', marginBottom: 8 }}
                            type="number"
                            placeholder={`bps to gift (max ${e.vestedBps})`}
                            value={giftBps}
                            onChange={ev => setGiftBps(ev.target.value)}
                          />
                          <button
                            onClick={() => handleGiftShares(e.assetId)}
                            disabled={actionPending || !giftTarget || !giftBps}
                            style={{ ...actionBtn(C.purple), width: '100%', fontSize: 11, opacity: (actionPending || !giftTarget || !giftBps) ? 0.4 : 1 }}
                          >
                            {actionPending ? 'Gifting…' : `Gift ${giftBps || '0'} bps →`}
                          </button>
                        </div>
                      )}

                      {/* F-26: per-tranche vesting schedule expandable */}
                      {e.assetId != null && e.totalBps > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <button
                            onClick={() => toggleSchedule(e.assetId)}
                            style={{
                              fontSize: 9, padding: '0', border: 'none',
                              background: 'none', color: C.faint, cursor: 'pointer',
                              textDecoration: 'underline', letterSpacing: '0.04em',
                            }}
                          >
                            {scheduleForId === e.assetId ? 'Hide schedule' : 'Show schedule'}
                          </button>
                          {scheduleForId === e.assetId && (() => {
                            const sd = scheduleData[e.assetId]
                            if (!sd) {
                              return <div style={{ marginTop: 6, fontSize: 10, color: C.faint }}>Loading…</div>
                            }
                            if (sd.unavailable) {
                              return (
                                <div style={{
                                  marginTop: 6, padding: 8, fontSize: 10,
                                  background: `${C.border}40`, borderRadius: 4, color: C.faint,
                                }}>
                                  Per-tranche schedule unavailable for this colony's AToken (deployed before F-26 added). Total/vested still correct.
                                </div>
                              )
                            }
                            if (sd.epochs.length === 0) {
                              return (
                                <div style={{ marginTop: 6, padding: 8, fontSize: 10, color: C.faint }}>
                                  No schedule — equity vested immediately at issue.
                                </div>
                              )
                            }
                            return (
                              <div style={{
                                marginTop: 6, padding: 8,
                                background: `${C.gold}06`, border: `1px solid ${C.border}`, borderRadius: 4,
                              }}>
                                {sd.epochs.map((ep, idx) => {
                                  const claimed = idx < sd.nextTranche
                                  return (
                                    <div key={idx} style={{
                                      display: 'flex', justifyContent: 'space-between',
                                      fontSize: 10, color: claimed ? C.text : C.faint,
                                      paddingTop: idx > 0 ? 4 : 0,
                                    }}>
                                      <span>Tranche {idx + 1} · epoch {ep}</span>
                                      <span style={{ color: claimed ? equityColor(i) : C.faint }}>
                                        {sd.tranches[idx]} bps · {claimed ? 'vested' : 'pending'}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      {/* F-15a: inline buyback form when this row's button is active */}
                      {buybackForId === e.assetId && (
                        <div style={{ marginTop: 8, padding: 10, background: `${C.gold}08`, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                          <div style={{ fontSize: 10, color: C.faint, lineHeight: 1.6, marginBottom: 8 }}>
                            Buy back vested bps from {e.label} at an S-token price you set. Bought-back shares are cancelled, increasing NAV for remaining holders.
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <input
                              style={{ ...inlineInput, flex: 1 }}
                              type="number"
                              placeholder={`bps (max ${e.vestedBps})`}
                              value={buybackBps}
                              onChange={ev => setBuybackBps(ev.target.value)}
                            />
                            <input
                              style={{ ...inlineInput, flex: 1 }}
                              type="number"
                              placeholder="price in S"
                              value={buybackPriceS}
                              onChange={ev => setBuybackPriceS(ev.target.value)}
                            />
                          </div>
                          <button
                            onClick={() => handleBuyback(e.assetId)}
                            disabled={actionPending || !buybackBps || !buybackPriceS}
                            style={{ ...actionBtn(C.gold), width: '100%', fontSize: 11, opacity: (actionPending || !buybackBps || !buybackPriceS) ? 0.4 : 1 }}
                          >
                            {actionPending ? 'Buying back…' : `Pay ${buybackPriceS || '0'} S → cancel ${buybackBps || '0'} bps`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {company.equity.length === 0 && (
                <div style={{ fontSize: 12, color: C.faint }}>No equity issued yet.</div>
              )}
            </div>

            {/* F-16: Share event history */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>SHARE HISTORY</div>
              {eventsLoading ? (
                <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
              ) : shareEvents.length === 0 ? (
                <div style={{ fontSize: 12, color: C.faint }}>No share events yet.</div>
              ) : (
                shareEvents.map((ev, i) => (
                  <div key={i} style={{
                    paddingBottom: i < shareEvents.length - 1 ? 8 : 0,
                    marginBottom:  i < shareEvents.length - 1 ? 8 : 0,
                    borderBottom:  i < shareEvents.length - 1 ? `1px solid ${C.border}` : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  }}>
                    <span style={{ fontSize: 11, color: ev.color, flex: 1 }}>{ev.text}</span>
                    <span style={{ fontSize: 10, color: C.faint, marginLeft: 8 }}>{ev.date}</span>
                  </div>
                ))
              )}
            </div>

            {/* Dividend history */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>DIVIDEND HISTORY</div>
              {company.dividendHistory.length === 0 ? (
                <div style={{ fontSize: 12, color: C.faint }}>No dividends declared yet.</div>
              ) : (
                company.dividendHistory.map((d, i) => {
                  const myShare = d.perHolder?.[address] || 0
                  return (
                    <div key={i} style={{
                      paddingBottom: i < company.dividendHistory.length - 1 ? 10 : 0,
                      marginBottom: i < company.dividendHistory.length - 1 ? 10 : 0,
                      borderBottom: i < company.dividendHistory.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, color: C.sub }}>{d.date}</span>
                        <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>{d.totalV} V total</span>
                      </div>
                      {myShare > 0 && (
                        <div style={{ fontSize: 11, color: C.gold }}>Your share: {myShare} V</div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── Contracts ── */}
        {tab === 'contracts' && (
          <ContractsTab
            companyId={companyId}
            companyName={company.name}
            isSecretary={isSecretary}
            slug={slug}
            signer={signer}
            address={address}
            deployedContracts={deployedContracts}
          />
        )}

        {/* ── Transactions ── */}
        {tab === 'transactions' && (
          <div>
            {txLoading && (
              <div style={{ ...card, textAlign: 'center', color: C.faint, fontSize: 12, padding: 24 }}>Loading…</div>
            )}

            {/* P&L summary */}
            {!txLoading && onChain && onChainTxs.length > 0 && (() => {
              const revenue  = onChainTxs.filter(t => t.type === 'revenue') .reduce((s, t) => s + (t.dr || 0), 0)
              const expenses = onChainTxs.filter(t => t.type === 'expense') .reduce((s, t) => s + (t.cr || 0), 0)
              const locked   = onChainTxs.filter(t => t.type === 'convert') .reduce((s, t) => s + (t.cr || 0), 0)
              const divs     = onChainTxs.filter(t => t.type === 'dividend').reduce((s, t) => s + (t.cr || 0), 0)
              const net = revenue - expenses
              return (
                <div style={card}>
                  <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>P&amp;L SUMMARY</div>
                  <Row label="Revenue (S in)"     value={`+${revenue} S`}   color={C.green} />
                  <Divider />
                  <Row label="Expenses (S out)"   value={`−${expenses} S`}  color={C.red} />
                  <Divider />
                  <Row label="Net"                value={`${net >= 0 ? '+' : ''}${net} S`} color={net >= 0 ? C.gold : C.red} bold />
                  {locked > 0 && <><Divider /><Row label="Locked to V"      value={`${locked} S → V`} color={C.green} /></>}
                  {divs > 0 && <><Divider /><Row label="V dividends declared" value={`${divs} V`} color='#8b5cf6' /></>}
                </div>
              )
            })()}

            {/* Journal */}
            {!txLoading && onChainTxs.length > 0 && (
              <div style={card}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>JOURNAL</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em' }}>DESCRIPTION</div>
                  <div style={{ fontSize: 9, color: C.green, letterSpacing: '0.1em', textAlign: 'right', minWidth: 56 }}>DR</div>
                  <div style={{ fontSize: 9, color: C.red,   letterSpacing: '0.1em', textAlign: 'right', minWidth: 56 }}>CR</div>
                </div>
                {onChainTxs.map((tx, i) => {
                  const typeColor = { revenue: C.green, expense: C.red, convert: C.gold, dividend: '#8b5cf6' }[tx.type] || C.faint
                  const unit = tx.type === 'dividend' ? 'V' : 'S'
                  return (
                    <div key={tx.hash + i} style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8,
                      paddingBottom: i < onChainTxs.length - 1 ? 10 : 0,
                      marginBottom: i < onChainTxs.length - 1 ? 10 : 0,
                      borderBottom: i < onChainTxs.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: C.text }}>{tx.description}</div>
                        <div style={{ fontSize: 10, color: C.faint, marginTop: 1, fontFamily: 'monospace' }}>
                          {tx.date}
                          {tx.counterparty && ` · ${tx.counterpartyName ? `${shortAddr(tx.counterparty)} · ${tx.counterpartyName}` : shortAddr(tx.counterparty)}`}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.green, textAlign: 'right', minWidth: 56, alignSelf: 'center' }}>
                        {tx.dr != null ? `${tx.dr} ${unit}` : ''}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: typeColor, textAlign: 'right', minWidth: 56, alignSelf: 'center' }}>
                        {tx.cr != null ? `${tx.cr} ${unit}` : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!txLoading && onChainTxs.length === 0 && (
              <div style={{ ...card, fontSize: 12, color: C.faint }}>No transactions yet.</div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const FACTORY_ABI_CO = [
  "function companyCount() view returns (uint256)",
  "function getCompany(uint256) view returns (string, address, address, uint256, uint256)",
]
const COMPANY_PAY_ABI = [
  "function pay(address, uint256, string) external",
]

function ContractsTab({ companyId, companyName, isSecretary, slug, signer, address, deployedContracts }) {
  const addr = companyId?.toLowerCase()

  // ── Data loading ───────────────────────────────────────────────────────────
  const [contracts,    setContracts]    = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [companies,    setCompanies]    = useState([])   // other colony companies for buyer picker
  const [loading,      setLoading]      = useState(true)
  const [reloadKey,    setReloadKey]    = useState(0)

  useEffect(() => {
    if (!addr || !slug) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/contracts?colony=${slug}&companyAddr=${addr}`)
      .then(r => r.json())
      .then(({ contracts: cs, invoices: inv }) => {
        setContracts(cs || [])
        setInvoices(inv  || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [addr, slug, reloadKey])

  useEffect(() => {
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg?.companyFactory) return
    const rpc     = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const factory = new ethers.Contract(cfg.companyFactory, FACTORY_ABI_CO, rpc)
    const nameAbi = ['function name() view returns (string)']
    factory.companyCount().then(async count => {
      const all = await Promise.all(
        Array.from({ length: Number(count) }, (_, i) =>
          factory.getCompany(i).then(async ([, wallet]) => {
            const co   = new ethers.Contract(wallet, nameAbi, rpc)
            const name = await co.name().catch(() => wallet.slice(0, 10))
            return { name, address: wallet.toLowerCase() }
          })
        )
      )
      setCompanies(all.filter(c => c.address !== addr))
    }).catch(() => {})
  }, [slug, deployedContracts, addr])

  // ── Create contract form state ─────────────────────────────────────────────
  const [creating,  setCreating]  = useState(false)
  const [cBuyer,    setCBuyer]    = useState('')
  const [cDesc,     setCDesc]     = useState('')
  const [cPrice,    setCPrice]    = useState('')
  const [cSchedule, setCSchedule] = useState('on delivery')
  const [cEndsAt,   setCEndsAt]   = useState('')
  const [cSaving,   setCSaving]   = useState(false)
  const [cError,    setCError]    = useState(null)

  async function handleCreate() {
    if (!cBuyer || !cDesc) return
    setCSaving(true); setCError(null)
    const buyer = companies.find(c => c.address === cBuyer)
    try {
      const r = await fetch('/api/contracts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create', colony: slug,
          sellerAddr: addr, buyerAddr: cBuyer,
          sellerName: companyName, buyerName: buyer?.name || cBuyer.slice(0, 10),
          description: cDesc,
          pricePerDelivery: Number(cPrice) || 0,
          schedule: cSchedule,
          endsAt: cEndsAt || null,
        }),
      })
      if (!r.ok) throw new Error((await r.json()).error)
      setCreating(false)
      setCBuyer(''); setCDesc(''); setCPrice(''); setCSchedule('on delivery'); setCEndsAt('')
      setReloadKey(k => k + 1)
    } catch (e) {
      setCError(e.message)
    }
    setCSaving(false)
  }

  // ── Invoice state (per contract) ───────────────────────────────────────────
  const [invoicing,   setInvoicing]   = useState(null)  // contractId
  const [invAmt,      setInvAmt]      = useState('')
  const [invDesc,     setInvDesc]     = useState('')
  const [invSaving,   setInvSaving]   = useState(false)
  const [invError,    setInvError]    = useState(null)

  async function handleInvoice(contract) {
    setInvSaving(true); setInvError(null)
    try {
      const r = await fetch('/api/contracts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invoice', contractId: contract.id,
          amount: Number(invAmt) || contract.price_per_delivery,
          description: invDesc || contract.description,
        }),
      })
      if (!r.ok) throw new Error((await r.json()).error)
      setInvoicing(null); setInvAmt(''); setInvDesc('')
      setReloadKey(k => k + 1)
    } catch (e) {
      setInvError(e.message)
    }
    setInvSaving(false)
  }

  // ── Payment ────────────────────────────────────────────────────────────────
  const [paying,    setPaying]    = useState(null)   // invoiceId
  const [payError,  setPayError]  = useState(null)

  async function handlePay(invoice) {
    if (!signer) return
    setPaying(invoice.id); setPayError(null)
    try {
      const co = new ethers.Contract(companyId, COMPANY_PAY_ABI, signer)
      const tx = await co.pay(
        invoice.seller_addr,
        ethers.parseEther(String(invoice.amount)),
        `Invoice #${invoice.invoice_number} — ${invoice.description}`,
      )
      const receipt = await tx.wait()
      await fetch('/api/contracts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay_invoice', invoiceId: invoice.id, txHash: receipt.hash }),
      })
      setReloadKey(k => k + 1)
    } catch (e) {
      setPayError(invoice.id + ':' + (e?.reason || e?.shortMessage || e.message))
    }
    setPaying(null)
  }

  async function handleStatus(contractId, status) {
    await fetch('/api/contracts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: status, contractId }),
    })
    setReloadKey(k => k + 1)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const active = contracts.filter(c => c.status === 'active')
  const closed = contracts.filter(c => c.status !== 'active')

  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  if (loading) return <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: C.faint }}>Loading…</div>

  return (
    <div>
      {/* New contract button — only secretary/seller can initiate */}
      {isSecretary && !creating && (
        <button onClick={() => setCreating(true)} style={{ ...ghostBtn, width: '100%', marginBottom: 12 }}>
          + New supply contract
        </button>
      )}

      {/* Create form */}
      {creating && (
        <div style={{ ...card, borderColor: C.gold, background: `${C.gold}08`, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NEW SUPPLY CONTRACT</div>
          <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginBottom: 12 }}>
            {companyName} is the supplier. Select the buyer company, describe what is being supplied, and set the standard invoice price.
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>BUYER</div>
            <select style={{ ...inlineInput, width: '100%', fontFamily: "'IBM Plex Mono', monospace" }}
              value={cBuyer} onChange={e => setCBuyer(e.target.value)}>
              <option value="">Select company…</option>
              {companies.map(c => <option key={c.address} value={c.address}>{c.name}</option>)}
            </select>
          </div>

          <CField label="What is being supplied" value={cDesc} onChange={setCDesc} placeholder="e.g. Daily delivery of cream buns" />
          <CField label="Standard price per delivery (S)" value={cPrice} onChange={setCPrice} placeholder="e.g. 50" type="number" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>SCHEDULE</div>
              <select style={{ ...inlineInput, width: '100%', fontFamily: "'IBM Plex Mono', monospace" }}
                value={cSchedule} onChange={e => setCSchedule(e.target.value)}>
                {['on delivery','daily','weekly','monthly','per batch'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <CField label="Contract end date" value={cEndsAt} onChange={setCEndsAt} placeholder="e.g. 31 May 2026" />
          </div>

          {cError && <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>{cError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setCreating(false); setCError(null) }} style={{ ...actionBtn(C.faint, C.white), border: `1px solid ${C.border}`, flex: 1 }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={cSaving || !cBuyer || !cDesc}
              style={{ ...actionBtn(C.gold), flex: 2, opacity: (!cBuyer || !cDesc || cSaving) ? 0.4 : 1 }}>
              {cSaving ? 'Saving…' : 'Create contract →'}
            </button>
          </div>
        </div>
      )}

      {/* Active contracts */}
      {active.map(contract => {
        const isSeller = contract.seller_addr === addr
        const isBuyer  = contract.buyer_addr  === addr
        const contractInvoices = invoices.filter(inv => inv.contract_id === contract.id)
        const pending  = contractInvoices.filter(inv => inv.status === 'pending')
        const paid     = contractInvoices.filter(inv => inv.status === 'paid')
        const isRaisingInvoice = invoicing === contract.id

        return (
          <div key={contract.id} style={{ ...card, borderColor: C.border }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  <Badge label="SUPPLY" color={C.gold} />
                  <Badge label="ACTIVE" color={C.green} />
                  <Badge label={isSeller ? 'SELLER' : 'BUYER'} color={isSeller ? C.green : '#3b82f6'} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 2 }}>{contract.description}</div>
                <div style={{ fontSize: 11, color: C.faint }}>
                  {isSeller ? `Buyer: ${contract.buyer_name}` : `Supplier: ${contract.seller_name}`}
                  {' · '}{contract.schedule}
                  {contract.price_per_delivery > 0 && ` · ${contract.price_per_delivery} S/delivery`}
                  {contract.ends_at && ` · ends ${fmtDate(contract.ends_at)}`}
                </div>
              </div>
              {isSecretary && (
                <button onClick={() => handleStatus(contract.id, 'complete')}
                  style={{ fontSize: 10, color: C.faint, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
                  Mark complete
                </button>
              )}
            </div>

            {/* Pending invoices — buyer sees these with Pay button */}
            {pending.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>PENDING INVOICES</div>
                {pending.map(inv => {
                  const errKey = `${inv.id}:${inv.description}`
                  return (
                    <div key={inv.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px', background: '#fffbf0', border: `1px solid ${C.gold}40`,
                      borderRadius: 6, marginBottom: 4,
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.text }}>Invoice #{inv.invoice_number} — {inv.description}</div>
                        <div style={{ fontSize: 10, color: C.faint }}>{fmtDate(inv.created_at)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.gold }}>{inv.amount} S</div>
                        {isBuyer && isSecretary && (
                          <button
                            onClick={() => handlePay(inv)}
                            disabled={paying === inv.id}
                            style={{ ...actionBtn(C.gold), fontSize: 10, padding: '6px 12px', opacity: paying === inv.id ? 0.4 : 1 }}
                          >
                            {paying === inv.id ? 'Paying…' : 'Pay →'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {payError && payError.startsWith(pending[0]?.id) && (
                  <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{payError.split(':').slice(1).join(':')}</div>
                )}
              </div>
            )}

            {/* Paid invoices — individual entries */}
            {paid.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>
                  DELIVERY HISTORY · {paid.reduce((s, i) => s + i.amount, 0)} S paid
                </div>
                {paid.map(inv => (
                  <div key={inv.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.sub }}>
                        #{inv.invoice_number} — {inv.description}
                      </div>
                      <div style={{ fontSize: 10, color: C.faint }}>{fmtDate(inv.paid_at || inv.created_at)}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.green, flexShrink: 0, marginLeft: 12 }}>
                      +{inv.amount} S
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Raise invoice — seller only */}
            {isSeller && isSecretary && !isRaisingInvoice && (
              <button onClick={() => { setInvoicing(contract.id); setInvAmt(String(contract.price_per_delivery || '')); setInvDesc('') }}
                style={{ ...ghostBtn, width: '100%', fontSize: 10 }}>
                + Raise invoice
              </button>
            )}
            {isRaisingInvoice && (
              <div style={{ background: '#f9f9f9', border: `1px solid ${C.border}`, borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 8 }}>RAISE INVOICE</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 2 }}>
                    <input style={{ ...inlineInput, width: '100%' }} placeholder="Delivery note (optional)"
                      value={invDesc} onChange={e => setInvDesc(e.target.value)} />
                  </div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input style={{ ...inlineInput, width: '100%', paddingRight: 18 }} type="number" placeholder="Amount"
                      value={invAmt} onChange={e => setInvAmt(e.target.value)} />
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: C.faint }}>S</span>
                  </div>
                </div>
                {invError && <div style={{ fontSize: 11, color: C.red, marginBottom: 6 }}>{invError}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setInvoicing(null); setInvError(null) }} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
                  <button onClick={() => handleInvoice(contract)} disabled={invSaving || !invAmt}
                    style={{ ...actionBtn(C.gold), flex: 2, opacity: (!invAmt || invSaving) ? 0.4 : 1 }}>
                    {invSaving ? 'Sending…' : 'Send invoice →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Closed contracts */}
      {closed.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>CLOSED</div>
          {closed.map(contract => {
            const contractInvoices = invoices.filter(inv => inv.contract_id === contract.id)
            const total = contractInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
            return (
              <div key={contract.id} style={{ ...card, opacity: 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <Badge label="SUPPLY" color={C.faint} />
                      <Badge label={contract.status.toUpperCase()} color={C.faint} />
                    </div>
                    <div style={{ fontSize: 12, color: C.sub }}>{contract.description}</div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                      {contract.seller_name} → {contract.buyer_name}
                    </div>
                  </div>
                  {total > 0 && <div style={{ fontSize: 13, fontWeight: 500, color: C.faint, flexShrink: 0, marginLeft: 12 }}>{total} S</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {contracts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 24, color: C.faint, fontSize: 12 }}>
          No supply contracts yet.{isSecretary ? ' Create one above.' : ''}
        </div>
      )}
    </div>
  )
}

function CField({ label, value, onChange, onBlur, placeholder, type, error }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>{label.toUpperCase()}</div>
      <input
        style={{ ...inlineInput, width: '100%', borderColor: error ? C.red : undefined }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        type={type || 'text'}
      />
      {error && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 9, color, border: `1px solid ${color}`,
      borderRadius: 4, padding: '2px 5px', letterSpacing: '0.06em', flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function equityColor(i) {
  return ['#B8860B', '#16a34a', '#8b5cf6', '#3b82f6', '#ef4444'][i % 5]
}

function Row({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: C.sub }}>{label}</span>
      <span style={{ fontSize: 12, color: color || C.text, fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  )
}

function Divider() {
  return <div style={{ borderBottom: `1px solid ${C.border}`, margin: '8px 0' }} />
}

const card = {
  background: C.white, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: 16, marginBottom: 10,
}

function actionBtn(bg, color = C.bg) {
  return {
    padding: '10px 14px', background: bg, color,
    border: 'none', borderRadius: 6, fontSize: 11,
    cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
  }
}

const ghostBtn = {
  padding: '10px 14px', background: C.white, color: C.sub,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
}

const inlineInput = {
  padding: '9px 10px', border: `1px solid ${C.border}`,
  borderRadius: 6, fontSize: 12, color: C.text, background: C.white, outline: 'none',
}
