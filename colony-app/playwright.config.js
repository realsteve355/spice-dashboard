import { defineConfig, devices } from '@playwright/test'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.seed if it exists — gives BOT_0_KEY to the fixtures
const envFile = join(__dirname, '.env.seed')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

export default defineConfig({
  testDir:  './tests/e2e',
  timeout:  30_000,
  retries:  1,

  use: {
    baseURL:     'http://localhost:5174',
    trace:       'on-first-retry',
    screenshot:  'only-on-failure',
  },

  // Start the dev server automatically before running E2E tests
  webServer: {
    command:            'npm run dev',
    url:                'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout:            30_000,
  },

  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
  ],
})
