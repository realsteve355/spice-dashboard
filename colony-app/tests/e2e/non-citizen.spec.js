/**
 * non-citizen.spec.js — tests for wallet states that are NOT a registered citizen
 *
 * Covers:
 *   1. No wallet at all      → "Connect your wallet" prompt
 *   2. Connected, not a citizen → "You are not a citizen of this colony."
 *
 * Neither test requires real chain data.  The not-a-citizen path depends on a
 * single eth_call (isCitizen) returning false.  We mock ALL eth_calls to return
 * the zero word so the app resolves instantly, removing the ~90s cold RPC wait.
 */

import { fileURLToPath } from 'url'
import { dirname, join }  from 'path'
import { test as base, expect } from '@playwright/test'
import { ethers }               from 'ethers'

const __dirname        = dirname(fileURLToPath(import.meta.url))
const MOCK_WALLET_PATH = join(__dirname, '../helpers/mockWallet.js')

const SLUG = 'daves-colony'
const URL  = `/colony/${SLUG}/dashboard`

// A deterministic but unregistered address — never called join() on this colony.
const STRANGER_ADDRESS = new ethers.Wallet(
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
).address

// ── RPC mock helper ───────────────────────────────────────────────────────────
// Intercepts all POST requests to the Base Sepolia RPC endpoint and returns
// instant mock responses so tests do not depend on RPC latency.

const RPC_URL = 'https://sepolia.base.org'

const ZERO_WORD = '0x' + '0'.repeat(64)  // false / 0 / empty address

async function mockRpc(context) {
  await context.route(`${RPC_URL}*`, async (route) => {
    let body
    try { body = JSON.parse(route.request().postData() || '{}') } catch { body = {} }

    const method = body.method
    const id     = body.id ?? 1

    // eth_call — return 0/false for everything: isCitizen → false, balances → 0
    if (method === 'eth_call') {
      return route.fulfill({
        status:      200,
        contentType: 'application/json',
        body: JSON.stringify({ jsonrpc: '2.0', id, result: ZERO_WORD }),
      })
    }

    // eth_blockNumber — needed by some providers on init
    if (method === 'eth_blockNumber') {
      return route.fulfill({
        status:      200,
        contentType: 'application/json',
        body: JSON.stringify({ jsonrpc: '2.0', id, result: '0x1312D00' }),
      })
    }

    // eth_getBalance — return 0
    if (method === 'eth_getBalance') {
      return route.fulfill({
        status:      200,
        contentType: 'application/json',
        body: JSON.stringify({ jsonrpc: '2.0', id, result: '0x0' }),
      })
    }

    // eth_getLogs — return empty array
    if (method === 'eth_getLogs') {
      return route.fulfill({
        status:      200,
        contentType: 'application/json',
        body: JSON.stringify({ jsonrpc: '2.0', id, result: [] }),
      })
    }

    // Everything else — let through to real RPC (should be rare in this path)
    await route.continue()
  })
}

// ── Test 1: no wallet ─────────────────────────────────────────────────────────

base.describe('Dashboard — no wallet connected', () => {

  base.test('shows connect-wallet prompt', async ({ page }) => {
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

let strangerCtx
let strangerPage

base.describe('Dashboard — connected, not a citizen', () => {

  base.beforeAll(async ({ browser }) => {
    // Extend hook beyond global 60s in case RPC mock doesn't intercept
    base.setTimeout(120_000)
    strangerCtx = await browser.newContext()
    // Mock RPC so eth_call returns false instantly — no cold-start wait
    await mockRpc(strangerCtx)
    await strangerCtx.addInitScript(`window.__TEST_ADDRESS__ = '${STRANGER_ADDRESS}'`)
    await strangerCtx.addInitScript({ path: MOCK_WALLET_PATH })
    strangerPage = await strangerCtx.newPage()
    await strangerPage.goto(URL)
    // With the RPC mocked, isCitizen resolves in <1s
    await strangerPage
      .getByText('You are not a citizen of this colony.')
      .waitFor({ state: 'visible', timeout: 110_000 })
  })

  base.afterAll(async () => {
    await strangerCtx?.close()
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
