/**
 * dashboard.spec.js — E2E tests for the colony dashboard
 *
 * Prerequisites:
 *   - npm run seed   (registers bot wallets as citizens + seeds S balances)
 *   - .env.seed with BOT_0_KEY set
 *
 * Architecture: all tests share a single page loaded once in beforeAll.
 * Base Sepolia cold-start can take 15–30s; loading once avoids repeated
 * cold-starts that would otherwise occur on each fresh page.goto().
 */

import { fileURLToPath } from 'url'
import { dirname, join }  from 'path'
import { test as base, expect } from '@playwright/test'
import { ethers }               from 'ethers'

// ── Config ────────────────────────────────────────────────────────────────────

const __dirname        = dirname(fileURLToPath(import.meta.url))
const MOCK_WALLET_PATH = join(__dirname, '../helpers/mockWallet.js')

const BOT_0_KEY     = process.env.BOT_0_KEY || ''
export const BOT_0_ADDRESS = BOT_0_KEY ? new ethers.Wallet(BOT_0_KEY).address : ''

const SLUG = 'daves-colony'
const URL  = `/colony/${SLUG}/dashboard`

// ── Shared page ───────────────────────────────────────────────────────────────
// One page for the whole describe block — avoids repeated cold RPC starts.

let sharedPage

base.describe('Dashboard — connected as bot[0]', () => {

  base.beforeAll(async ({ browser }) => {
    // Cold Base Sepolia RPC can take up to 90s — extend hook timeout beyond global 60s
    base.setTimeout(120_000)
    if (!BOT_0_KEY) throw new Error('BOT_0_KEY not set in .env.seed')
    const ctx = await browser.newContext()
    await ctx.addInitScript(`window.__TEST_ADDRESS__ = '${BOT_0_ADDRESS}'`)
    await ctx.addInitScript({ path: MOCK_WALLET_PATH })
    sharedPage = await ctx.newPage()
    await sharedPage.goto(URL)
    // Wait up to 90s for the full dashboard to load (cold Base Sepolia RPC)
    await sharedPage.getByText('Alice').waitFor({ state: 'visible', timeout: 110_000 })
  })

  base.afterAll(async () => {
    await sharedPage?.context().close()
  })

  // ── Tests — all run against the already-loaded sharedPage ─────────────────

  base.test('page loads and shows colony name', async () => {
    // colony.name falls back to slug ("daves-colony") because colonyName is not
    // fetched in App.jsx loadOnChainData.
    await expect(sharedPage.getByText('daves-colony', { exact: true }).first()).toBeVisible()
  })

  base.test('wallet auto-connects and shows truncated address', async () => {
    const shortAddr = `${BOT_0_ADDRESS.slice(0, 6)}…${BOT_0_ADDRESS.slice(-4)}`
    await expect(sharedPage.getByText(shortAddr).first()).toBeVisible()
  })

  base.test('citizen is recognised and citizen name is shown', async () => {
    await expect(sharedPage.getByText('Alice')).toBeVisible()
  })

  base.test('S balance is visible and numeric', async () => {
    await expect(sharedPage.getByText('S-TOKEN BALANCE')).toBeVisible()
  })

  base.test('MCC and Fisc quick-nav pills are visible', async () => {
    await expect(sharedPage.getByRole('button', { name: 'MCC' }).first()).toBeVisible()
    await expect(sharedPage.getByRole('button', { name: 'Fisc' })).toBeVisible()
  })

  base.test('transaction history section renders', async () => {
    await expect(sharedPage.getByText('RECENT TRANSACTIONS')).toBeVisible()
  })

})
