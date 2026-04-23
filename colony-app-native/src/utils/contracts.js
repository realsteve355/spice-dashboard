/**
 * Colony contract interaction — mirrors colony-app web patterns.
 *
 * Uses ethers.JsonRpcProvider pointing directly at Base Sepolia RPC.
 * No MetaMask dependency.
 *
 * Colony addresses hardcoded for Dave's Colony (MVP demo colony).
 * TODO: extend to read from ColonyRegistry for multi-colony support.
 */
import { ethers } from 'ethers'

export const RPC      = 'https://sepolia.base.org'
export const CHAIN_ID = 84532

/** Dave's Colony — primary demo colony */
export const COLONY = {
  colony:     '0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5',
  sToken:     '0x8B9B98cf05C5dC6e43C5b74320B2B858b92D6a04',
  vToken:     '0x86bC95CeD14E3fC1782393E63bc22ef142BEe433',
  gToken:     '0x08318fC33f0e57a6D196D5a3cF8d443A54C41449',
  governance: '0xe2af55fe189B18678187eF48eB49b9bA8bF24534',
  name:       "Dave's Colony",
  slug:       'daves-colony',
}

// ── ABIs ────────────────────────────────────────────────────────────────────────

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
]

const COLONY_ABI = [
  'function isCitizen(address) view returns (bool)',
  'function citizenName(address) view returns (string)',
  'function join(string name, uint256 dob) external',
  'function claimUbi() external',
  'function send(address to, uint256 amount, string note) external',
  'function saveToV(uint256 amount) external',
  'function redeemV(uint256 amount) external',
  'function epochStart() view returns (uint256)',
]

// ── Provider ────────────────────────────────────────────────────────────────────

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC)
}

// ── Read operations ─────────────────────────────────────────────────────────────

/** Fetch S balance, V balance, citizen status, and name for a wallet address. */
export async function fetchColonyState(address) {
  const rpc    = getProvider()
  const sToken = new ethers.Contract(COLONY.sToken, ERC20_ABI, rpc)
  const vToken = new ethers.Contract(COLONY.vToken, ERC20_ABI, rpc)
  const colony = new ethers.Contract(COLONY.colony, COLONY_ABI, rpc)

  const [sRaw, vRaw, isCitizen] = await Promise.all([
    sToken.balanceOf(address),
    vToken.balanceOf(address),
    colony.isCitizen(address),
  ])

  let citizenName = ''
  if (isCitizen) {
    try { citizenName = await colony.citizenName(address) } catch {}
  }

  const epochStart = await colony.epochStart().catch(() => 0n)

  return {
    sBalance:    Math.floor(Number(ethers.formatEther(sRaw))),
    vBalance:    Math.floor(Number(ethers.formatEther(vRaw))),
    isCitizen,
    citizenName,
    epochStart:  Number(epochStart),
  }
}

/** Fetch recent transaction history from Colony contract events. */
export async function fetchTxHistory(address) {
  const rpc = getProvider()

  const SENT_TOPIC     = ethers.id('Sent(address,address,uint256,string)')
  const UBI_TOPIC      = ethers.id('UbiClaimed(address,uint256)')
  const SAVED_TOPIC    = ethers.id('Saved(address,uint256)')
  const REDEEMED_TOPIC = ethers.id('Redeemed(address,uint256)')

  const iface = new ethers.Interface([
    'event Sent(address indexed from, address indexed to, uint256 amount, string note)',
    'event UbiClaimed(address indexed citizen, uint256 amount)',
    'event Saved(address indexed citizen, uint256 amount)',
    'event Redeemed(address indexed citizen, uint256 amount)',
  ])

  const addrTopic = '0x' + address.slice(2).toLowerCase().padStart(64, '0')

  const toBlock  = await rpc.getBlockNumber()
  const CHUNK    = 9000
  const N_CHUNKS = 5

  const queries = []
  for (let i = 0; i < N_CHUNKS; i++) {
    const to   = toBlock - i * CHUNK
    const from = Math.max(0, to - CHUNK)

    // Sent (from or to this address)
    queries.push(
      rpc.getLogs({ address: COLONY.colony, fromBlock: from, toBlock: to,
        topics: [SENT_TOPIC] }).catch(() => [])
    )
    // UBI, Saved, Redeemed
    queries.push(
      rpc.getLogs({ address: COLONY.colony, fromBlock: from, toBlock: to,
        topics: [[UBI_TOPIC, SAVED_TOPIC, REDEEMED_TOPIC], addrTopic] }).catch(() => [])
    )
  }

  const results = await Promise.all(queries)
  const allLogs = results.flat()

  const events = []
  for (const log of allLogs) {
    try {
      const parsed = iface.parseLog(log)
      if (!parsed) continue
      const { name, args } = parsed
      const me = address.toLowerCase()

      if (name === 'Sent') {
        const isSender   = args.from.toLowerCase() === me
        const isReceiver = args.to.toLowerCase()   === me
        if (!isSender && !isReceiver) continue
        events.push({
          type:         isSender ? 'sent' : 'received',
          amount:       Math.floor(Number(ethers.formatEther(args.amount))),
          counterparty: isSender ? args.to : args.from,
          note:         args.note,
          block:        log.blockNumber,
        })
      } else if (name === 'UbiClaimed' && args.citizen.toLowerCase() === me) {
        events.push({ type: 'ubi',      amount: Math.floor(Number(ethers.formatEther(args.amount))), block: log.blockNumber })
      } else if (name === 'Saved'      && args.citizen.toLowerCase() === me) {
        events.push({ type: 'saved',    amount: Math.floor(Number(ethers.formatEther(args.amount))), block: log.blockNumber })
      } else if (name === 'Redeemed'   && args.citizen.toLowerCase() === me) {
        events.push({ type: 'redeemed', amount: Math.floor(Number(ethers.formatEther(args.amount))), block: log.blockNumber })
      }
    } catch {}
  }

  events.sort((a, b) => b.block - a.block)
  return events.slice(0, 30)
}

/** Fetch citizens from /api/citizens endpoint (mirrors web app). */
export async function fetchCitizens() {
  try {
    const r = await fetch(`https://app.zpc.finance/api/citizens?colony=${COLONY.colony}`)
    const d = await r.json()
    return d.citizens || []
  } catch {
    return []
  }
}

// ── Write operations (require ethers.Wallet instance) ───────────────────────────

const GAS = { gasLimit: 150000 }

export async function txClaimUbi(wallet) {
  const w      = wallet.connect(getProvider())
  const colony = new ethers.Contract(COLONY.colony, COLONY_ABI, w)
  const tx     = await colony.claimUbi(GAS)
  return tx.wait()
}

export async function txSend(wallet, toAddress, amount, note = '') {
  const w      = wallet.connect(getProvider())
  const colony = new ethers.Contract(COLONY.colony, COLONY_ABI, w)
  const wei    = ethers.parseEther(String(amount))
  const tx     = await colony.send(toAddress, wei, note, GAS)
  return tx.wait()
}

export async function txSaveToV(wallet, amount) {
  const w      = wallet.connect(getProvider())
  const colony = new ethers.Contract(COLONY.colony, COLONY_ABI, w)
  const wei    = ethers.parseEther(String(amount))
  const tx     = await colony.saveToV(wei, GAS)
  return tx.wait()
}

export async function txJoin(wallet, name, birthYear) {
  const w      = wallet.connect(getProvider())
  const colony = new ethers.Contract(COLONY.colony, COLONY_ABI, w)
  const tx     = await colony.join(name, birthYear, GAS)
  return tx.wait()
}
