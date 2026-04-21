#!/usr/bin/env node
/**
 * seed.js — seed a colony with test citizens and activity
 *
 * Usage (from colony-app/ directory):
 *   node --env-file=.env.seed scripts/seed.js
 *   node --env-file=.env.seed scripts/seed.js --colony daves-colony
 *   node --env-file=.env.seed scripts/seed.js --citizens 3   (only first 3 bots)
 *   node --env-file=.env.seed scripts/seed.js --transactions 5
 *   node --env-file=.env.seed scripts/seed.js --election     (open a CEO election + nominate)
 *   node --env-file=.env.seed scripts/seed.js --reset        (clear Supabase seed rows first)
 *   node --env-file=.env.seed scripts/seed.js --dry-run      (show plan, no txs)
 *
 * The script is idempotent: bots already registered as citizens are skipped.
 * On-chain state (S balances, tx history) accumulates — re-runs add more history.
 * Supabase rows are always cleared and re-inserted when --reset is passed.
 *
 * Intended for Goal 3 (simulation bots) later: scripts/bots.js will import the
 * same actors.js / colony.js layer and run a single "activity round" on a schedule.
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { ethers } from 'ethers'

import { getActors, getProvider } from './lib/actors.js'
import {
  ensureCitizen,
  sendS,
  getSBalance,
  openElection,
  nominate,
  getActiveElections,
  colonyContract,
  sTokenContract,
} from './lib/colony.js'
import {
  insertAnnouncement,
  broadcastNotification,
  clearSeedAnnouncements,
  clearNotifications,
} from './lib/supabase.js'

// ── Load contracts.json ───────────────────────────────────────────────────────

const __dirname  = dirname(fileURLToPath(import.meta.url))
const contracts  = JSON.parse(
  readFileSync(join(__dirname, '../src/data/contracts.json'), 'utf8')
)

// ── Parse args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const flag = name => args.includes(name)
const opt  = (name, def) => {
  const i = args.indexOf(name)
  return i !== -1 ? args[i + 1] : def
}

const COLONY_SLUG   = opt('--colony', 'daves-colony')
const CITIZEN_COUNT = parseInt(opt('--citizens', '5'), 10)
const TX_COUNT      = parseInt(opt('--transactions', '10'), 10)
const WITH_ELECTION = flag('--election')
const WITH_RESET    = flag('--reset')
const DRY_RUN       = flag('--dry-run')

// ── Seed transaction scenarios ────────────────────────────────────────────────
// Indices refer to actor slots (0–4). Keep amounts small and realistic.

const SEED_TXS = [
  { from: 0, to: 1, amount: 5,  note: 'coffee' },
  { from: 1, to: 2, amount: 15, note: 'lunch' },
  { from: 2, to: 3, amount: 8,  note: 'transport' },
  { from: 3, to: 4, amount: 25, note: 'groceries' },
  { from: 4, to: 0, amount: 10, note: 'book' },
  { from: 0, to: 2, amount: 20, note: 'dinner split' },
  { from: 1, to: 3, amount: 12, note: 'supplies' },
  { from: 2, to: 4, amount: 7,  note: 'snacks' },
  { from: 3, to: 0, amount: 18, note: 'tools rental' },
  { from: 4, to: 1, amount: 30, note: 'market stall' },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now()

  console.log('\nSPICE Colony Seed Script')
  console.log('========================')

  // ── Resolve colony config ─────────────────────────────────────────────────

  const cfg = contracts.colonies[COLONY_SLUG]
  if (!cfg) {
    console.error(`\nUnknown colony slug: "${COLONY_SLUG}"`)
    console.error('Available:', Object.keys(contracts.colonies).join(', '))
    process.exit(1)
  }

  console.log(`Colony:  ${cfg.name} (${COLONY_SLUG})`)
  console.log(`Address: ${cfg.colony}`)

  if (DRY_RUN) {
    console.log('\n[DRY RUN — no transactions will be sent]\n')
  }

  // ── Load actors ───────────────────────────────────────────────────────────

  const actors   = getActors({ count: CITIZEN_COUNT })
  const provider = getProvider()

  console.log(`\nActors: ${actors.length} bot wallet(s) loaded`)

  // ── [1] Check ETH balances ────────────────────────────────────────────────

  console.log('\n[1/4] Checking ETH balances…')
  const MIN_ETH = 0.005  // rough estimate: enough for 3–5 txs at Base Sepolia gas prices

  let anyLow = false
  for (const actor of actors) {
    const raw = await provider.getBalance(actor.address)
    const eth = parseFloat(ethers.formatEther(raw))
    const ok  = eth >= MIN_ETH
    if (!ok) anyLow = true
    console.log(
      `  ${ok ? '✓' : '✗'} ${actor.name.padEnd(8)} ${actor.address.slice(0,10)}…` +
      `  ${eth.toFixed(4)} ETH${ok ? '' : '  ← NEEDS FUNDING'}`
    )
  }
  if (anyLow) {
    console.log('\n  Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia')
    if (!DRY_RUN) {
      console.log('  Continuing — unfunded wallets will fail at the tx step.')
    }
  }

  if (DRY_RUN) {
    console.log('\n[2/4] Would register citizens:', actors.map(a => a.name).join(', '))
    console.log(`[3/4] Would send ${Math.min(TX_COUNT, SEED_TXS.length)} transactions`)
    console.log('[4/4] Would insert Supabase data (announcement + notifications)')
    if (WITH_ELECTION) console.log('[+]   Would open a CEO election and nominate candidates')
    console.log('\nDry run complete.')
    return
  }

  // ── [2] Register citizens ─────────────────────────────────────────────────

  console.log('\n[2/4] Registering citizens…')
  for (const actor of actors) {
    try {
      await ensureCitizen(cfg.colony, actor)
    } catch (e) {
      console.error(`  ✗ ${actor.name} join failed: ${e.message}`)
    }
  }

  // ── [3] Seed S token transactions ─────────────────────────────────────────

  console.log('\n[3/4] Sending S tokens…')

  // Check balances first — skip any tx where sender has < amount S
  const sTokenAddr = await colonyContract(cfg.colony, provider).sToken()

  const txsToRun = SEED_TXS.slice(0, TX_COUNT)
  for (const tx of txsToRun) {
    const fromActor = actors[tx.from]
    const toActor   = actors[tx.to]
    if (!fromActor || !toActor) continue

    try {
      const bal = await getSBalance(sTokenAddr, fromActor.address, provider)
      if (bal < tx.amount) {
        console.log(
          `  ⚠  Skipping ${fromActor.name} → ${toActor.name}: ` +
          `only ${bal.toFixed(0)} S (need ${tx.amount})`
        )
        continue
      }
      await sendS(cfg.colony, fromActor, toActor.address, tx.amount, tx.note)
    } catch (e) {
      console.error(`  ✗ ${fromActor.name} → ${toActor.name} failed: ${e.message}`)
    }
  }

  // ── [3b] Optional: open an election ──────────────────────────────────────

  if (WITH_ELECTION) {
    console.log('\n[3b] Opening CEO election…')
    try {
      const active = await getActiveElections(cfg.governance, provider)
      const ceoActive = active.filter(e => e.role === 0)

      if (ceoActive.length > 0) {
        console.log(`  ⚠  CEO election already active (id: ${ceoActive[0].id}) — skipping`)
      } else {
        // First actor opens the election
        const elecId = await openElection(cfg.governance, actors[0], 0)

        // Remaining actors nominate themselves
        const nominees = actors.slice(1, 3)  // up to 2 nominees
        for (const actor of nominees) {
          try {
            await nominate(cfg.governance, actors[0], elecId, actor.address)
          } catch (e) {
            console.warn(`  ⚠  Nominate ${actor.name} failed: ${e.message}`)
          }
        }
      }
    } catch (e) {
      console.error(`  ✗ Election failed: ${e.message}`)
    }
  }

  // ── [4] Supabase data ─────────────────────────────────────────────────────

  console.log('\n[4/4] Supabase data…')

  if (WITH_RESET) {
    console.log('  Clearing existing seed data…')
    try {
      await clearSeedAnnouncements(cfg.colony)
      await clearNotifications(cfg.colony, 'seed_welcome')
      console.log('  ✓ Cleared')
    } catch (e) {
      console.warn(`  ⚠  Clear failed: ${e.message}`)
    }
  }

  // Post a seed announcement from the first actor (colony founder stand-in)
  try {
    await insertAnnouncement(
      cfg.colony,
      '[SEED] Welcome to the colony',
      'The colony is open. Citizens may claim UBI, send S tokens, and participate in governance.',
      actors[0].address
    )
    console.log('  ✓ Inserted seed announcement')
  } catch (e) {
    console.warn(`  ⚠  Announcement failed: ${e.message}`)
  }

  // Welcome notification for each bot citizen
  try {
    await broadcastNotification(
      cfg.colony,
      actors.map(a => a.address),
      'seed_welcome',
      'Welcome to the colony',
      'Your UBI is ready to claim. Check your S balance on the Dashboard.',
      `/colony/${COLONY_SLUG}/dashboard`
    )
    console.log(`  ✓ Inserted welcome notification for ${actors.length} citizens`)
  } catch (e) {
    console.warn(`  ⚠  Notifications failed: ${e.message}`)
  }

  // ── Done ──────────────────────────────────────────────────────────────────

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\nSeed complete in ${elapsed}s`)
  console.log(`Dashboard: https://app.zpc.finance/colony/${COLONY_SLUG}/dashboard\n`)
}

main().catch(e => {
  console.error('\n[seed] Fatal error:', e.message)
  process.exit(1)
})
