/**
 * checkProtocolFees.js — quick on-chain audit of protocol fee accrual.
 *
 * Reads from Base Sepolia:
 *   - Dave's Colony pendingProtocolFee  (ETH wei accrued so far)
 *   - ColonyRegistry feePerTx           (ETH wei added per send())
 *   - ColonyRegistry founder share bps  (global default)
 *   - Founder wallet override for Dave's Colony, if any
 *   - getFeeSplit() for the current pending amount
 *   - Founder + protocol treasury ETH balances
 *
 * Run: node scripts/checkProtocolFees.js
 *
 * No private key needed — read-only.
 */
const { ethers } = require('ethers')

const RPC      = 'https://sepolia.base.org'
const REGISTRY = '0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68'
const COLONY   = '0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5'  // Dave's Colony

const COLONY_ABI = [
  'function pendingProtocolFee() view returns (uint256)',
  'function colonyName() view returns (string)',
]

const REGISTRY_ABI = [
  'function feePerTx() view returns (uint256)',
  'function getFeeSplit(address colony, uint256 amount) view returns (uint256 protocolAmt, uint256 founderAmt, address founderWallet)',
  'function entries(address colony) view returns (uint256 tokenId, address founder, string name, string slug, uint256 registeredAt, bool active)',
]

const fmt = (wei) => `${ethers.formatEther(wei)} ETH (${wei.toString()} wei)`

async function main() {
  const rpc      = new ethers.JsonRpcProvider(RPC)
  const colony   = new ethers.Contract(COLONY, COLONY_ABI, rpc)
  const registry = new ethers.Contract(REGISTRY, REGISTRY_ABI, rpc)

  console.log(`\nProtocol fee audit — Dave's Colony on Base Sepolia\n${'─'.repeat(60)}\n`)

  // 1. Does the colony have the mechanism?
  let pending
  try {
    pending = await colony.pendingProtocolFee()
    console.log(`✓ pendingProtocolFee callable — colony has the fee mechanism`)
    console.log(`  Currently accrued: ${fmt(pending)}`)
  } catch (e) {
    console.log(`✗ pendingProtocolFee call failed — colony predates the fee mechanism`)
    console.log(`  ${e.shortMessage || e.message}`)
    return
  }

  // 2. Per-tx fee from the registry
  let feePerTx = 0n
  try {
    feePerTx = await registry.feePerTx()
    console.log(`\nfeePerTx (registry):  ${fmt(feePerTx)}`)
    if (feePerTx === 0n) {
      console.log(`  → Set to zero. No fee is accruing on send() calls.`)
    } else {
      const txCount = pending / feePerTx
      console.log(`  Implied tx count since last settle: ${txCount}`)
    }
  } catch (e) {
    console.log(`\n(could not read feePerTx — registry may not be at expected address)`)
  }

  // 3. Registry entry for Dave's Colony — who is the founder?
  try {
    const entry = await registry.entries(COLONY)
    console.log(`\nColony registry entry:`)
    console.log(`  Name:        ${entry.name}`)
    console.log(`  Slug:        ${entry.slug}`)
    console.log(`  Founder:     ${entry.founder}`)
    console.log(`  Registered:  ${new Date(Number(entry.registeredAt) * 1000).toISOString()}`)
  } catch {}

  // 4. What would happen if we settled now?
  if (pending > 0n) {
    try {
      const split = await registry.getFeeSplit(COLONY, pending)
      console.log(`\nIf settleProtocol() were called now:`)
      console.log(`  → Protocol treasury: ${fmt(split.protocolAmt)}`)
      console.log(`  → Founder wallet:    ${fmt(split.founderAmt)}`)
      console.log(`  → Founder address:   ${split.founderWallet}`)

      const founderBalance = await rpc.getBalance(split.founderWallet)
      console.log(`\nFounder wallet current ETH balance: ${fmt(founderBalance)}`)
    } catch (e) {
      console.log(`\n(could not compute fee split: ${e.shortMessage || e.message})`)
    }
  } else {
    console.log(`\nNo fees accrued yet — either feePerTx is 0 or no send() calls have happened\nsince the last settleProtocol().`)
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`To actually receive the founder share, settleProtocol() must be`)
  console.log(`called on the colony contract with msg.value == pendingProtocolFee.`)
  console.log(`Whoever calls it pays the gas; the contract splits and forwards.\n`)
}

main().catch(e => { console.error('Failed:', e); process.exit(1) })
