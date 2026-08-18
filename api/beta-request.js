// POST /api/beta-request { name, email, organization, interestedInvestor, interestedPilotSite }
// Stores an iOS closed-beta access request — see db/ios-beta-requests.sql.
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, organization, interestedInvestor, interestedPilotSite } = req.body || {}
  if (!name || !email) return res.status(400).json({ error: 'name and email required' })

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/ios_beta_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        name, email,
        organization: organization || null,
        interested_investor: !!interestedInvestor,
        interested_pilot_site: !!interestedPilotSite,
      }),
    })

    if (!r.ok) {
      const err = await r.text()
      console.error('[beta-request] supabase insert failed:', err)
      return res.status(500).json({ error: err })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[beta-request] handler error:', e?.message)
    return res.status(500).json({ error: e?.message })
  }
}
