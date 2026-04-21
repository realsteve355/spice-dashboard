/**
 * fixtures.js — shared Playwright test fixtures
 *
 * Usage in a test file:
 *   import { test, expect } from '../helpers/fixtures.js'
 *
 *   test('dashboard loads', async ({ walletPage }) => {
 *     await walletPage.goto('/colony/daves-colony/dashboard')
 *     ...
 *   })
 *
 * Prerequisites:
 *   - BOT_0_KEY set in .env.seed (used to derive the bot wallet address)
 *   - Bot wallet must be a registered citizen for citizen-specific tests
 *     Run `npm run seed` first if it isn't.
 */

import { test as base } from '@playwright/test'
import { ethers }        from 'ethers'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Derive bot[0] address from its private key
const BOT_0_KEY     = process.env.BOT_0_KEY || ''
const BOT_0_ADDRESS = BOT_0_KEY
  ? new ethers.Wallet(BOT_0_KEY).address
  : ''

export const test = base.extend({
  /**
   * walletPage — a page with window.ethereum pre-mocked to bot[0]'s address.
   *
   * The app's auto-connect fires on load and connects as bot[0].
   * loadOnChainData reads the real chain via its own JsonRpcProvider,
   * so any on-chain state the bot has (S balance, citizen status, etc.)
   * will appear in the UI exactly as a real user would see it.
   */
  walletPage: async ({ page }, use) => {
    if (!BOT_0_ADDRESS) {
      throw new Error(
        'BOT_0_KEY not found.\n' +
        'Make sure .env.seed exists and contains BOT_0_KEY.\n' +
        'The playwright.config.js loads it automatically.'
      )
    }

    // Set the test address before app scripts load
    await page.addInitScript(`window.__TEST_ADDRESS__ = '${BOT_0_ADDRESS}'`)

    // Inject the ethereum mock
    await page.addInitScript({ path: join(__dirname, 'mockWallet.js') })

    await use(page)
  },
})

export { expect } from '@playwright/test'

// Export the address so tests can assert against it
export { BOT_0_ADDRESS }
