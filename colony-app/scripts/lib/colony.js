/**
 * colony.js — contract ABIs and interaction helpers
 *
 * All functions take an already-connected ethers.Contract or wallet/signer.
 * Nothing here has side-effects beyond what's passed in — safe to import
 * from both seed scripts and future test helpers.
 */

import { ethers } from 'ethers'

// ── ABIs (only the functions the seed / test layer needs) ─────────────────────

export const COLONY_ABI = [
  // State reads
  "function isCitizen(address) view returns (bool)",
  "function citizenName(address) view returns (string)",
  "function citizenCount() view returns (uint256)",
  "function sToken() view returns (address)",
  "function vToken() view returns (address)",
  "function currentEpoch() view returns (uint256)",
  "function pendingProtocolFee() view returns (uint256)",
  // Citizen actions
  "function join(string name, uint256 dob) external",
  "function claimUbi() external",
  "function send(address to, uint256 amount, string note) external",
  "function saveToV(uint256 amount) external",
  "function redeemV(uint256 amount) external",
]

export const STOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function currentEpoch() view returns (uint256)",
]

export const VTOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
]

export const GOV_ABI = [
  "function nextId() view returns (uint256)",
  "function elections(uint256) view returns (uint8 role, address openedBy, uint256 openedAt, uint256 nominationEndsAt, uint256 votingEndsAt, uint256 timelockEndsAt, address winner, bool executed, bool cancelled)",
  "function getCandidates(uint256) view returns (address[])",
  "function getCandidateVotes(uint256, address) view returns (uint256)",
  "function hasVoted(address, uint256) view returns (bool)",
  "function roleHolder(uint8) view returns (address holder, uint256 termEnd, bool active)",
  "function openElection(uint8 role) external returns (uint256)",
  "function nominateCandidate(uint256 electionId, address candidate) external",
  "function vote(uint256 electionId, address candidate) external",
  "function finaliseElection(uint256 electionId) external",
  "function executeElection(uint256 electionId) external",
]

// ── Contract factories ────────────────────────────────────────────────────────

export function colonyContract(address, signerOrProvider) {
  return new ethers.Contract(address, COLONY_ABI, signerOrProvider)
}

export function sTokenContract(address, provider) {
  return new ethers.Contract(address, STOKEN_ABI, provider)
}

export function vTokenContract(address, provider) {
  return new ethers.Contract(address, VTOKEN_ABI, provider)
}

export function govContract(address, signerOrProvider) {
  return new ethers.Contract(address, GOV_ABI, signerOrProvider)
}

// ── Citizen helpers ───────────────────────────────────────────────────────────

/**
 * Join the colony if not already a citizen.
 * Returns true if a new join tx was sent, false if already registered.
 */
export async function ensureCitizen(colonyAddr, actor) {
  const provider = actor.wallet.provider
  const ro       = colonyContract(colonyAddr, provider)
  const already  = await ro.isCitizen(actor.address)

  if (already) {
    const existing = await ro.citizenName(actor.address)
    console.log(`  ✓ ${existing} (${short(actor.address)}) already a citizen`)
    return false
  }

  console.log(`  → Joining as ${actor.name}…`)
  const rw = colonyContract(colonyAddr, actor.wallet)
  const tx = await rw.join(actor.name, actor.dob)
  await tx.wait()
  console.log(`  ✓ ${actor.name} joined  tx: ${tx.hash}`)
  return true
}

/**
 * Send S tokens from one actor to an address.
 * amount is a plain number (e.g. 5 → 5 S, i.e. 5e18 wei).
 */
export async function sendS(colonyAddr, fromActor, toAddress, amount, note = '') {
  const amountWei = ethers.parseEther(String(amount))
  const rw = colonyContract(colonyAddr, fromActor.wallet)
  const tx = await rw.send(toAddress, amountWei, note)
  await tx.wait()
  console.log(`  ✓ ${fromActor.name} → ${short(toAddress)}: ${amount} S  "${note}"`)
  return tx
}

/**
 * Return S balance as a plain number (not wei).
 */
export async function getSBalance(sTokenAddr, address, provider) {
  const token = sTokenContract(sTokenAddr, provider)
  const raw   = await token.balanceOf(address)
  return Number(ethers.formatEther(raw))
}

// ── Governance helpers ────────────────────────────────────────────────────────

/**
 * Open a governance election for a role (0=CEO, 1=CFO, 2=COO).
 * Returns the new election ID.
 */
export async function openElection(govAddr, actor, role) {
  const rw = govContract(govAddr, actor.wallet)
  const tx = await rw.openElection(role)
  const receipt = await tx.wait()
  // The return value from a tx isn't easily readable; re-query nextId
  const ro     = govContract(govAddr, actor.wallet.provider)
  const nextId = Number(await ro.nextId())
  const elecId = nextId - 1
  console.log(`  ✓ Election #${elecId} opened (role ${role})  tx: ${tx.hash}`)
  return elecId
}

/**
 * Nominate a candidate in an election.
 */
export async function nominate(govAddr, actor, electionId, candidateAddr) {
  const rw = govContract(govAddr, actor.wallet)
  const tx = await rw.nominateCandidate(electionId, candidateAddr)
  await tx.wait()
  console.log(`  ✓ ${actor.name} nominated ${short(candidateAddr)} in election #${electionId}`)
}

/**
 * Cast a vote.
 */
export async function castVote(govAddr, actor, electionId, candidateAddr) {
  const rw = govContract(govAddr, actor.wallet)
  const tx = await rw.vote(electionId, candidateAddr)
  await tx.wait()
  console.log(`  ✓ ${actor.name} voted for ${short(candidateAddr)} in election #${electionId}`)
}

/**
 * Get all active (non-executed, non-cancelled) elections.
 * Returns array of { id, role, status, nominationEndsAt, votingEndsAt }
 */
export async function getActiveElections(govAddr, provider) {
  const ro     = govContract(govAddr, provider)
  const nextId = Number(await ro.nextId())
  const nowSec = Math.floor(Date.now() / 1000)
  const result = []

  for (let i = 1; i < nextId; i++) {
    const e = await ro.elections(i)
    if (e.openedBy === ethers.ZeroAddress) continue
    if (e.executed || e.cancelled)         continue
    result.push({
      id:               i,
      role:             Number(e.role),
      nominationEndsAt: Number(e.nominationEndsAt),
      votingEndsAt:     Number(e.votingEndsAt),
      timelockEndsAt:   Number(e.timelockEndsAt),
      status:           electionStatus(e, nowSec),
    })
  }
  return result
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function short(addr) {
  return `${addr.slice(0, 8)}…`
}

function electionStatus(e, nowSec) {
  if (e.timelockEndsAt > 0 && nowSec >= Number(e.timelockEndsAt)) return 'EXECUTE_READY'
  if (e.timelockEndsAt > 0)                                        return 'TIMELOCK'
  if (nowSec > Number(e.votingEndsAt))                             return 'FINALISE_READY'
  if (nowSec > Number(e.nominationEndsAt))                         return 'VOTING'
  return 'NOMINATING'
}
