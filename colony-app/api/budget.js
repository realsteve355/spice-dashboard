/**
 * /api/budget — Colony standard citizen budget
 *
 * GET  ?colony=0x…
 *   → { published: PublishedBudget | null, history: PublishedBudget[] }
 *
 * GET  ?colony=0x…&draft=true
 *   → { draft: PublishedBudget | null }
 *
 * POST { action: 'save_draft', colony, lines, breadPriceS, spiceLabourDiscount, updatedBy }
 *   → { ok: true }
 *
 * POST { action: 'publish', colony, publishedBy, effectiveFrom }
 *   → { ok: true, version: number }
 *
 * Supabase tables required:
 *
 *   budget_published (
 *     id          bigserial primary key,
 *     colony      text not null,
 *     version     integer not null,
 *     published_at timestamptz default now(),
 *     published_by text not null,
 *     effective_from text not null,
 *     bread_price_s integer not null,
 *     spice_labour_discount integer not null default 28,
 *     lines       jsonb not null,
 *     total_s     integer not null,
 *     change_from_prior real
 *   );
 *
 *   budget_draft (
 *     colony      text primary key,
 *     lines       jsonb not null,
 *     bread_price_s integer not null,
 *     spice_labour_discount integer not null default 28,
 *     updated_at  timestamptz default now(),
 *     updated_by  text not null
 *   );
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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Supabase not configured' })

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { colony, draft } = req.query
    if (!colony) return res.status(400).json({ error: 'colony required' })

    try {
      if (draft === 'true') {
        const rows = await db(`/budget_draft?colony=eq.${colony}`)
        return res.status(200).json({ draft: rows?.[0] || null })
      }

      // Published: latest version + history
      const rows = await db(
        `/budget_published?colony=eq.${colony}&order=version.desc&limit=20`
      )
      return res.status(200).json({
        published: rows?.[0] || null,
        history:   rows || [],
      })
    } catch (e) {
      console.error('[budget] GET failed:', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST ────────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {}

    try {
      // ── save_draft ──────────────────────────────────────────────────────────
      if (body.action === 'save_draft') {
        const { colony, lines, breadPriceS, spiceLabourDiscount, updatedBy } = body
        if (!colony || !lines || !updatedBy)
          return res.status(400).json({ error: 'colony, lines, updatedBy required' })

        await db('/budget_draft', {
          method: 'POST',
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: JSON.stringify({
            colony:                 colony.toLowerCase(),
            lines,
            bread_price_s:          Number(breadPriceS)          || 4,
            spice_labour_discount:  Number(spiceLabourDiscount)   || 28,
            updated_at:             new Date().toISOString(),
            updated_by:             updatedBy.toLowerCase(),
          }),
        })
        return res.status(200).json({ ok: true })
      }

      // ── publish ─────────────────────────────────────────────────────────────
      if (body.action === 'publish') {
        const { colony, publishedBy, effectiveFrom } = body
        if (!colony || !publishedBy || !effectiveFrom)
          return res.status(400).json({ error: 'colony, publishedBy, effectiveFrom required' })

        const colonyLower = colony.toLowerCase()

        // Fetch draft
        const draftRows = await db(`/budget_draft?colony=eq.${colonyLower}`)
        const draft = draftRows?.[0]
        if (!draft) return res.status(400).json({ error: 'No draft to publish' })

        // Get last version number
        const prevRows = await db(
          `/budget_published?colony=eq.${colonyLower}&order=version.desc&limit=1`
        )
        const prevVersion = prevRows?.[0]?.version || 0
        const prevTotalS  = prevRows?.[0]?.total_s  || null
        const newVersion  = prevVersion + 1

        // Compute total_s from draft lines
        const lines = Array.isArray(draft.lines) ? draft.lines : JSON.parse(draft.lines)
        const totalS = lines
          .filter(l => l.active !== false)
          .reduce((s, l) => s + (Number(l.sTokenAmount) || 0), 0)

        const changePct = prevTotalS
          ? Math.round(((totalS - prevTotalS) / prevTotalS) * 10000) / 100
          : null

        await db('/budget_published', {
          method: 'POST',
          prefer: 'return=minimal',
          body: JSON.stringify({
            colony:                 colonyLower,
            version:                newVersion,
            published_by:           publishedBy.toLowerCase(),
            effective_from:         effectiveFrom,
            bread_price_s:          draft.bread_price_s,
            spice_labour_discount:  draft.spice_labour_discount,
            lines:                  draft.lines,
            total_s:                totalS,
            change_from_prior:      changePct,
          }),
        })

        return res.status(200).json({ ok: true, version: newVersion })
      }

      return res.status(400).json({ error: `Unknown action: ${body.action}` })
    } catch (e) {
      console.error('[budget] POST failed:', body.action, e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
