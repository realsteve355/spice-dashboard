const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { level = 'info', event, colony, address, tx_hash, message, meta } = req.body || {}

  if (!event) return res.status(400).json({ error: 'event required' })

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ level, event, colony, address, tx_hash, message, meta }),
    })

    if (!r.ok) {
      const err = await r.text()
      console.error('[log] supabase insert failed:', err)
      return res.status(500).json({ error: err })
    }

    return res.status(200).end()
  } catch (e) {
    console.error('[log] handler error:', e?.message)
    return res.status(500).json({ error: e?.message })
  }
}
