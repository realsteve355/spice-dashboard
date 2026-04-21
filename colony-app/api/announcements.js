/**
 * /api/announcements — MCC colony announcements board
 *
 * GET  ?colony=X&limit=20
 *   → { announcements: [...] }
 *
 * POST { action: 'create', colony, title, body?, author_addr }
 *   → announcement row
 *
 * POST { action: 'delete', id }
 *   → { ok: true }
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

  // ── GET — fetch announcements for a colony ─────────────────────────────────
  if (req.method === 'GET') {
    const { colony, limit = '20' } = req.query
    if (!colony) return res.status(400).json({ error: 'colony required' })
    try {
      const rows = await db(
        `/announcements?colony=eq.${colony}&order=created_at.desc&limit=${Number(limit)}`
      )
      return res.status(200).json({ announcements: rows || [] })
    } catch (e) {
      console.error('[announcements] GET failed:', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST — mutations ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body   = req.body || {}
    const { action } = body

    try {
      if (action === 'create') {
        const { colony, title, body: msgBody, author_addr } = body
        if (!colony || !title || !author_addr) {
          return res.status(400).json({ error: 'colony, title, author_addr required' })
        }
        const row = await db('/announcements', {
          method: 'POST',
          body: JSON.stringify({
            colony,
            title:       title.trim(),
            body:        msgBody?.trim() || null,
            author_addr: author_addr.toLowerCase(),
          }),
        })
        return res.status(200).json(Array.isArray(row) ? row[0] : row)
      }

      if (action === 'delete') {
        const { id } = body
        if (!id) return res.status(400).json({ error: 'id required' })
        await db(`/announcements?id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' })
        return res.status(200).json({ ok: true })
      }

      return res.status(400).json({ error: `Unknown action: ${action}` })
    } catch (e) {
      console.error('[announcements] POST failed:', action, e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
