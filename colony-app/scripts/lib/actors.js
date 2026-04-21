/**
 * actors.js — bot wallet definitions
 *
 * Loads BOT_0_KEY … BOT_4_KEY from the environment and returns
 * ethers.Wallet instances ready to sign transactions on Base Sepolia.
 *
 * Each actor also carries a human profile (name, dob) so they register
 * as believable colony citizens — the same wallets work for seeding,
 * E2E tests, and later as scheduled simulation bots.
 */

import { ethers } from 'ethers'

export const RPC      = 'https://sepolia.base.org'
export const CHAIN_ID = 84532

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC, { chainId: CHAIN_ID, name: 'base-sepolia' })
}

// Human profiles for each bot slot.
// Keep names realistic — these will show up in the UI as colony members.
export const BOT_PROFILES = [
  { name: 'Alice',   dob: 1990 },
  { name: 'Bob',     dob: 1985 },
  { name: 'Charlie', dob: 1992 },
  { name: 'Diana',   dob: 1988 },
  { name: 'Erik',    dob: 1995 },
]

/**
 * Load and return all configured bot actors.
 * Throws if no keys are found.
 *
 * @param {object} [opts]
 * @param {number} [opts.count]  Only load first N actors (default: all)
 * @returns {{ wallet: ethers.Wallet, address: string, name: string, dob: number }[]}
 */
export function getActors({ count } = {}) {
  const provider = getProvider()
  const actors   = []
  const limit    = count ?? BOT_PROFILES.length

  for (let i = 0; i < limit; i++) {
    const key = process.env[`BOT_${i}_KEY`]
    if (!key) {
      console.warn(`  ⚠  BOT_${i}_KEY not set — skipping ${BOT_PROFILES[i].name}`)
      continue
    }
    const wallet = new ethers.Wallet(key, provider)
    actors.push({
      wallet,
      address: wallet.address,
      ...BOT_PROFILES[i],
    })
  }

  if (actors.length === 0) {
    throw new Error(
      'No bot keys found.\n' +
      'Set BOT_0_KEY … BOT_4_KEY in your .env.seed file.\n' +
      'See .env.seed.example for the required format.'
    )
  }

  return actors
}
