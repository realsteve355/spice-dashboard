/**
 * Address display helpers — resolve citizen names from on-chain and format
 * short addresses with optional name suffix.
 */
import { ethers } from 'ethers'

const CITIZEN_NAME_ABI = ["function citizenName(address) view returns (string)"]
const RPC = 'https://sepolia.base.org'

/** "0xabcd…1234" */
export function shortAddr(addr) {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

/** "0xabcd…1234 · Steve" — falls back to shortAddr if name unknown */
export function namedAddr(addr, nameMap) {
  if (!addr) return '—'
  const short = shortAddr(addr)
  const name  = nameMap?.[addr.toLowerCase()]
  return name ? `${short} · ${name}` : short
}

/**
 * Batch-fetch citizen names for a list of addresses from the colony contract.
 * Returns { "0xabc...lower": "Steve", ... } — unknown/non-citizens are omitted.
 */
export async function resolveNames(addresses, colonyAddress) {
  if (!addresses?.length || !colonyAddress) return {}
  const rpc    = new ethers.JsonRpcProvider(RPC)
  const colony = new ethers.Contract(colonyAddress, CITIZEN_NAME_ABI, rpc)
  const unique = [...new Set(
    addresses.filter(a => a && ethers.isAddress(a)).map(a => a.toLowerCase())
  )]
  const entries = await Promise.all(
    unique.map(a => colony.citizenName(a).then(n => [a, n]).catch(() => [a, '']))
  )
  return Object.fromEntries(entries.filter(([, n]) => n))
}
