/**
 * dashboard.spec.js — E2E tests for the colony dashboard
 *
 * Prerequisites:
 *   - npm run seed   (registers bot wallets as citizens + seeds S balances)
 *   - .env.seed with BOT_0_KEY set
 *
 * These tests connect as bot[0] (Alice) via the mockWallet fixture and verify
 * that key UI elements load and display real on-chain data correctly.
 */

import { test, expect, BOT_0_ADDRESS } from '../helpers/fixtures.js'

const SLUG = 'daves-colony'
const URL  = `/colony/${SLUG}/dashboard`

test.describe('Dashboard — connected as bot[0]', () => {

  test('page loads and shows colony name', async ({ walletPage: page }) => {
    await page.goto(URL)

    // Colony name appears in the header / layout title
    await expect(page.getByText("Dave's Colony")).toBeVisible({ timeout: 10_000 })
  })

  test('wallet auto-connects and shows truncated address', async ({ walletPage: page }) => {
    await page.goto(URL)

    // Short address format: 0xXXXX…XXXX
    const shortAddr = `${BOT_0_ADDRESS.slice(0, 6)}…${BOT_0_ADDRESS.slice(-4)}`
    await expect(page.getByText(shortAddr)).toBeVisible({ timeout: 10_000 })
  })

  test('citizen is recognised and citizen name is shown', async ({ walletPage: page }) => {
    // Requires bot[0] to be a registered citizen (run npm run seed first)
    await page.goto(URL)

    // The citizen name "Alice" should appear in the citizen card
    await expect(page.getByText('Alice')).toBeVisible({ timeout: 15_000 })
  })

  test('S balance is visible and numeric', async ({ walletPage: page }) => {
    await page.goto(URL)

    // Wait for on-chain load — S balance widget shows "N S"
    // We just verify the S symbol is present and a number precedes it
    await expect(page.locator('text=/\\d+ S/')).toBeVisible({ timeout: 15_000 })
  })

  test('MCC and Fisc quick-nav pills are visible', async ({ walletPage: page }) => {
    await page.goto(URL)

    await expect(page.getByText('MCC')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Fisc')).toBeVisible({ timeout: 15_000 })
  })

  test('transaction history section renders', async ({ walletPage: page }) => {
    await page.goto(URL)

    // Section heading appears even if history is empty
    await expect(
      page.getByText(/recent activity|transaction history/i)
    ).toBeVisible({ timeout: 15_000 })
  })

})
