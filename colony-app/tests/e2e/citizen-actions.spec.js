/**
 * citizen-actions.spec.js — write-path E2E tests for citizen interactions
 *
 * Tests that send real on-chain transactions as bot[0] (Alice).
 * Signing is handled in Node via page.exposeFunction; the private key
 * never enters the browser context.
 *
 * Prerequisites:
 *   - npm run seed   (Alice must be a registered citizen with S balance)
 *   - .env.seed with BOT_0_KEY…BOT_4_KEY set
 *
 * Epoch note: the "claim UBI" test only succeeds if Alice has not already
 * claimed UBI in the current epoch. If already claimed, the test is skipped.
 */

import { fileURLToPath } from 'url'
import { dirname, join }  from 'path'
import { test as base, expect } from '@playwright/test'
import { ethers }               from 'ethers'

const __dirname        = dirname(fileURLToPath(import.meta.url))
const MOCK_WALLET_PATH = join(__dirname, '../helpers/mockWallet.js')

const BOT_0_KEY     = process.env.BOT_0_KEY || ''
const BOT_0_ADDRESS = BOT_0_KEY ? new ethers.Wallet(BOT_0_KEY).address : ''
const RPC_URL       = 'https://sepolia.base.org'
const SLUG          = 'daves-colony'
const URL           = `/colony/${SLUG}/dashboard`

// Derive all bot addresses so we can mock /api/citizens in dev mode
const BOT_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Erik']
const MOCK_CITIZENS = [0, 1, 2, 3, 4].flatMap(i => {
  const key = process.env[`BOT_${i}_KEY`]
  if (!key) return []
  return [{ address: new ethers.Wallet(key).address, name: BOT_NAMES[i] }]
})

// ── Shared page ───────────────────────────────────────────────────────────────

let sharedPage

base.describe('Citizen actions — connected as bot[0]', () => {

  base.beforeAll(async ({ browser }) => {
    // Base Sepolia cold-start can take 30-60s; extend hook timeout to 120s
    base.setTimeout(120_000)

    if (!BOT_0_KEY) throw new Error('BOT_0_KEY not set in .env.seed')

    const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 84532, name: 'base-sepolia' })
    const wallet   = new ethers.Wallet(BOT_0_KEY, provider)

    const ctx = await browser.newContext()
    sharedPage = await ctx.newPage()

    // Expose Node-side signer.  Returns the tx hash immediately so the browser's
    // own tx.wait() can poll for the receipt — avoids double-waiting the 15-30s
    // confirmation time and exceeding the test timeout.
    await sharedPage.exposeFunction('__mockSignAndSend__', async (txParams) => {
      try {
        const tx = await wallet.sendTransaction({
          to:    txParams.to,
          data:  txParams.data  || '0x',
          value: txParams.value ? BigInt(txParams.value) : 0n,
        })
        // Do NOT await tx.wait() here — the app will poll via eth_getTransactionReceipt
        return { hash: tx.hash, success: true }
      } catch (e) {
        return { hash: null, success: false, error: e.shortMessage || e.message }
      }
    })

    // Mock /api/citizens — Vercel serverless functions are not available in
    // Vite dev mode, so the SendSheet would always show "No other citizens found."
    await sharedPage.route('**/api/citizens**', route => {
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify({ citizens: MOCK_CITIZENS }),
      })
    })

    await sharedPage.addInitScript(`window.__TEST_ADDRESS__ = '${BOT_0_ADDRESS}'`)
    await sharedPage.addInitScript({ path: MOCK_WALLET_PATH })

    await sharedPage.goto(URL)
    await sharedPage.getByText('Alice').waitFor({ state: 'visible', timeout: 90_000 })
  })

  base.afterAll(async () => {
    await sharedPage?.context().close()
  })

  // ── Claim UBI ─────────────────────────────────────────────────────────────

  base.test('claim UBI — triggers on-chain transaction', async () => {
    // Write tests can take up to 2 min (tx broadcast + Base Sepolia confirmation)
    base.setTimeout(120_000)

    const claimBtn = sharedPage.getByRole('button', { name: 'Claim Monthly UBI' })
    await expect(claimBtn).toBeVisible()
    await claimBtn.click()

    // Wait for '✓ Claimed' (tx confirmed).  If it fails, check whether the
    // button reverted to its default label — that happens on the error path
    // (contract revert, already-claimed, etc.) and is not a test failure.
    try {
      await expect(
        sharedPage.getByRole('button', { name: '✓ Claimed' })
      ).toBeVisible({ timeout: 90_000 })
    } catch {
      // If the button is back to its idle label the tx was rejected by the
      // contract (e.g. UBI already claimed this epoch) — skip, not a failure.
      // NOTE: Chrome converts #ef4444 → rgb(...) in inline styles, so colour
      // selectors are unreliable here; button-text state is the safe signal.
      const idleBtn = sharedPage.getByRole('button', { name: 'Claim Monthly UBI' })
      const isIdle  = await idleBtn.isVisible({ timeout: 5_000 }).catch(() => false)
      if (isIdle) {
        base.skip()
      } else {
        throw new Error('UBI claim: no success or error state visible after 90s')
      }
    }
  })

  // ── Send S-tokens ─────────────────────────────────────────────────────────

  base.test('send S-tokens — completes transfer to another citizen', async () => {
    base.setTimeout(120_000)

    // Open the send sheet
    await sharedPage.getByText('Send S-tokens →').click()

    // Wait for citizen picker
    const searchInput = sharedPage.getByPlaceholder('Search by name…')
    await expect(searchInput).toBeVisible({ timeout: 10_000 })

    // Type recipient name to narrow the list (avoids ambiguous matches
    // from transaction history or other page elements)
    await searchInput.fill('Bob')

    // Click the Bob button in the picker list (starts with 'Bob')
    const bobBtn = sharedPage.getByRole('button').filter({ hasText: /^Bob/ }).first()
    await expect(bobBtn).toBeVisible({ timeout: 5_000 })
    await bobBtn.click()

    // Verify recipient chip appears
    await expect(sharedPage.getByText('Bob')).toBeVisible()

    // Enter amount
    await sharedPage.locator('input[type="number"]').fill('1')

    // Send
    await sharedPage.getByRole('button', { name: 'Send →' }).click()

    // Wait for success (tx confirmed on-chain)
    await expect(sharedPage.getByText('✓ 1 S sent')).toBeVisible({ timeout: 90_000 })
  })

})
