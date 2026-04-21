/**
 * non-citizen.spec.js — tests for wallet states that are NOT a registered citizen
 *
 * Covers:
 *   1. No wallet at all      → "Connect your wallet" prompt
 *   2. Connected, not a citizen → "You are not a citizen of this colony."
 *
 * Neither test requires transaction signing or seeded bot wallets.
 */

import { fileURLToPath } from 'url'
import { dirname, join }  from 'path'
import { test as base, expect } from '@playwright/test'
import { ethers }               from 'ethers'

const __dirname        = dirname(fileURLToPath(import.meta.url))
const MOCK_WALLET_PATH = join(__dirname, '../helpers/mockWallet.js')

const SLUG = 'daves-colony'
const URL  = `/colony/${SLUG}/dashboard`

// A deterministic but unregistered address — this wallet has never called join()
// on the colony so isCitizen will always return false.
const STRANGER_ADDRESS = new ethers.Wallet(
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
).address

// ── Test 1: no wallet ─────────────────────────────────────────────────────────

base.describe('Dashboard — no wallet connected', () => {

  base.test('shows connect-wallet prompt', async ({ page }) => {
    // Navigate without injecting window.ethereum — app sees no wallet
    await page.goto(URL)

    await expect(
      page.getByText('Connect your wallet to view your dashboard.')
    ).toBeVisible({ timeout: 10_000 })

    await expect(
      page.getByRole('button', { name: 'Connect Wallet' }).first()
    ).toBeVisible()
  })

})

// ── Test 2: connected but not a citizen ───────────────────────────────────────

let strangerPage

base.describe('Dashboard — connected, not a citizen', () => {

  base.beforeAll(async ({ browser }) => {
    // isCitizen RPC can take up to 90s on cold Base Sepolia — extend hook timeout
    base.setTimeout(120_000)

    const ctx = await browser.newContext()
    // Inject mock wallet with the stranger address — no signing needed
    await ctx.addInitScript(`window.__TEST_ADDRESS__ = '${STRANGER_ADDRESS}'`)
    await ctx.addInitScript({ path: MOCK_WALLET_PATH })
    strangerPage = await ctx.newPage()
    await strangerPage.goto(URL)
    // Wait for chain data to load — the not-citizen message appears once
    // isCitizen(STRANGER_ADDRESS) resolves (false)
    await strangerPage
      .getByText('You are not a citizen of this colony.')
      .waitFor({ state: 'visible', timeout: 90_000 })
  })

  base.afterAll(async () => {
    await strangerPage?.context().close()
  })

  base.test('shows not-a-citizen message', async () => {
    await expect(
      strangerPage.getByText('You are not a citizen of this colony.')
    ).toBeVisible()
  })

  base.test('does not show the citizen dashboard', async () => {
    await expect(strangerPage.getByText('S-TOKEN BALANCE')).not.toBeVisible()
    await expect(strangerPage.getByText('RECENT TRANSACTIONS')).not.toBeVisible()
  })

})
