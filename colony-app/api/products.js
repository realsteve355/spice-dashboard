/**
 * /api/products — colony mall product management
 *
 * GET ?colony=X
 *   → { products: [...] }  all products for the colony (secretary sees all; public sees available only)
 *
 * GET ?colony=X&companyAddr=0x…
 *   → { products: [...] }  products for a specific company
 *
 * POST { action: 'add',    colony, companyAddr, companyName, name, description, price, category }
 * POST { action: 'update', productId, name?, description?, price?, category?, available? }
 * POST { action: 'delete', productId }
 *
 * Supabase table (create once):
 *   CREATE TABLE products (
 *     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     colony       text NOT NULL,
 *     company_addr text NOT NULL,
 *     company_name text NOT NULL,
 *     name         text NOT NULL,
 *     description  text,
 *     price        integer NOT NULL DEFAULT 0,
 *     category     text,
 *     available    boolean NOT NULL DEFAULT true,
 *     created_at   timestamptz DEFAULT now()
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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { colony, companyAddr } = req.query
    if (!colony) return res.status(400).json({ error: 'colony required' })
    try {
      let path = `/products?colony=eq.${encodeURIComponent(colony)}&order=created_at.asc`
      if (companyAddr) {
        path += `&company_addr=eq.${encodeURIComponent(companyAddr.toLowerCase())}`
      }
      const rows = await db(path)
      return res.json({ products: rows || [] })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST ───────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body   = req.body || {}
    const { action } = body

    try {
      if (action === 'add') {
        const { colony, companyAddr, companyName, name, description, price, category } = body
        if (!colony || !companyAddr || !name) {
          return res.status(400).json({ error: 'colony, companyAddr, name required' })
        }
        const row = await db('/products', {
          method: 'POST',
          prefer: 'return=representation',
          body: JSON.stringify({
            colony,
            company_addr: companyAddr.toLowerCase(),
            company_name: companyName || '',
            name:         name.trim(),
            description:  description?.trim() || null,
            price:        Number(price) || 0,
            category:     category?.trim() || null,
            available:    true,
          }),
        })
        return res.status(201).json(Array.isArray(row) ? row[0] : row)
      }

      if (action === 'update') {
        const { productId, name, description, price, category, available } = body
        if (!productId) return res.status(400).json({ error: 'productId required' })
        const update = {}
        if (name        !== undefined) update.name        = name.trim()
        if (description !== undefined) update.description = description?.trim() || null
        if (price       !== undefined) update.price       = Number(price) || 0
        if (category    !== undefined) update.category    = category?.trim() || null
        if (available   !== undefined) update.available   = Boolean(available)
        await db(`/products?id=eq.${productId}`, {
          method: 'PATCH',
          prefer: 'return=minimal',
          body:   JSON.stringify(update),
        })
        return res.json({ ok: true })
      }

      if (action === 'delete') {
        const { productId } = body
        if (!productId) return res.status(400).json({ error: 'productId required' })
        await db(`/products?id=eq.${productId}`, { method: 'DELETE', prefer: 'return=minimal' })
        return res.json({ ok: true })
      }

      return res.status(400).json({ error: `Unknown action: ${action}` })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
