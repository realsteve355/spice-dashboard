/**
 * /api/notifications — per-wallet notification inbox
 *
 * GET  ?colony=X&address=0x…&limit=50
 *   → { notifications: [...] }
 *
 * POST { colony, address, type, title, body?, link? }
 *   → notification row
 */

const SUPABASE_URL         = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

async function db(path, options = {}) {
  const { prefer, method = 'GET', body } = options
  const headers = {
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        prefer || 'return=representation',
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { method, headers, body })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`Supabase ${method} ${path} → ${r.status}: ${text}`)
  }
  return r.status === 204 ? null : r.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  // ── GET — fetch notifications for a wallet ─────────────────────────────────
  if (req.method === 'GET') {
    const { colony, address, limit = '50' } = req.query
    if (!colony || !address) {
      return res.status(400).json({ error: 'colony and address required' })
    }
    try {
      const rows = await db(
        `/notifications?colony=eq.${colony}&address=eq.${address.toLowerCase()}&order=created_at.desc&limit=${Number(limit)}`
      )
      return res.status(200).json({ notifications: rows || [] })
    } catch (e) {
      console.error('[notifications] GET failed:', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST — create a notification (single or broadcast) ────────────────────
  if (req.method === 'POST') {
    const body = req.body || {}
    const { colony, type, title, body: msgBody, link } = body

    // Broadcast: one insert per address (individual calls avoid batch-insert quirks)
    if (Array.isArray(body.addresses)) {
      if (!colony || !type || !title || body.addresses.length === 0) {
        return res.status(400).json({ error: 'colony, type, title, addresses required' })
      }
      try {
        await Promise.all(
          body.addresses.map(addr =>
            db('/notifications', {
              method: 'POST',
              prefer: 'return=minimal',
              body: JSON.stringify({
                colony,
                address: addr.toLowerCase(),
                type,
                title,
                body:    msgBody || null,
                link:    link    || null,
              }),
            }).catch(e => console.error('[notifications] broadcast insert failed for', addr, e.message))
          )
        )
        return res.status(200).json({ ok: true, count: body.addresses.length })
      } catch (e) {
        console.error('[notifications] broadcast failed:', e.message)
        return res.status(500).json({ error: e.message })
      }
    }

    // Single recipient
    const { address } = body
    if (!colony || !address || !type || !title) {
      return res.status(400).json({ error: 'colony, address, type, title required' })
    }
    try {
      const row = await db('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          colony,
          address: address.toLowerCase(),
          type,
          title,
          body:    msgBody || null,
          link:    link    || null,
        }),
      })
      return res.status(200).json(Array.isArray(row) ? row[0] : row)
    } catch (e) {
      console.error('[notifications] POST failed:', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
