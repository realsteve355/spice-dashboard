/**
 * supabase.js — direct Supabase REST helpers for scripts
 *
 * Uses the service key (bypasses RLS) — only run server-side or in seed scripts.
 * Never bundle this into the frontend.
 */

const SUPABASE_URL         = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

function assertConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.\n' +
      'Add them to your .env.seed file.'
    )
  }
}

async function db(path, options = {}) {
  assertConfig()
  const { method = 'GET', body, prefer = 'return=representation' } = options
  const headers = {
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        prefer,
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { method, headers, body })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`Supabase ${method} ${path} → ${r.status}: ${text}`)
  }
  return r.status === 204 ? null : r.json()
}

// ── Announcements ─────────────────────────────────────────────────────────────

export async function insertAnnouncement(colony, title, body, authorAddr) {
  return db('/announcements', {
    method: 'POST',
    prefer: 'return=minimal',
    body: JSON.stringify({
      colony,
      title,
      body:        body || null,
      author_addr: authorAddr.toLowerCase(),
    }),
  })
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function insertNotification(colony, address, type, title, body, link) {
  return db('/notifications', {
    method: 'POST',
    prefer: 'return=minimal',
    body: JSON.stringify({
      colony,
      address: address.toLowerCase(),
      type,
      title,
      body:  body || null,
      link:  link || null,
    }),
  })
}

/**
 * Send a notification to multiple addresses at once.
 */
export async function broadcastNotification(colony, addresses, type, title, body, link) {
  await Promise.all(
    addresses.map(addr =>
      insertNotification(colony, addr, type, title, body, link).catch(e =>
        console.warn(`  ⚠  notification failed for ${addr}: ${e.message}`)
      )
    )
  )
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

/**
 * Delete all announcements tagged [SEED] for a colony.
 * Useful for --reset before re-seeding.
 */
export async function clearSeedAnnouncements(colony) {
  await db(
    `/announcements?colony=eq.${colony}&title=like.*%5BSEED%5D*`,
    { method: 'DELETE', prefer: 'return=minimal' }
  )
}

/**
 * Delete notifications of a given type for a colony.
 * Pass type=null to delete all notifications for the colony.
 */
export async function clearNotifications(colony, type = null) {
  const filter = type
    ? `/notifications?colony=eq.${colony}&type=eq.${type}`
    : `/notifications?colony=eq.${colony}`
  await db(filter, { method: 'DELETE', prefer: 'return=minimal' })
}
