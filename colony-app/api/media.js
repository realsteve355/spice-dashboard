/**
 * /api/media — image upload for colony entities (citizens, companies, assets).
 *
 * POST { colony, entityType, entityId, dataUrl }
 *   → uploads to Supabase Storage bucket "colony-media"
 *   → returns { url }
 *
 * Images are stored at: {colony}/{entityType}/{entityId}.jpg
 * All uploads are converted to JPEG client-side before sending.
 *
 * Required env vars (already set for colony-app):
 *   SUPABASE_URL       — e.g. https://xxxx.supabase.co
 *   SUPABASE_ANON_KEY  — anon key (bucket must allow anon INSERT via RLS policy)
 */

const SUPABASE_URL         = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY  // bypasses RLS — server-side only
const BUCKET               = 'colony-media'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { colony, entityType, entityId, dataUrl } = req.body || {}

  if (!colony || !entityType || !entityId || !dataUrl) {
    return res.status(400).json({ error: 'colony, entityType, entityId, dataUrl required' })
  }

  // Validate entity type
  if (!['citizen', 'company', 'asset'].includes(entityType)) {
    return res.status(400).json({ error: 'entityType must be citizen, company, or asset' })
  }

  // Validate data URL shape
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
  if (!match) return res.status(400).json({ error: 'invalid dataUrl — must be data:image/...;base64,...' })
  const [, mimeType, b64] = match

  // Decode
  let buffer
  try { buffer = Buffer.from(b64, 'base64') }
  catch { return res.status(400).json({ error: 'base64 decode failed' }) }

  // Enforce 2 MB limit
  if (buffer.length > 2 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image too large (max 2 MB). Resize before uploading.' })
  }

  // Always store as .jpg regardless of source mime (client always sends JPEG from canvas)
  const ext  = mimeType === 'image/png' ? 'png' : 'jpg'
  const path = `${colony}/${entityType}/${entityId}.${ext}`

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_KEY not configured' })
  }

  // Upload to Supabase Storage using service role key (bypasses RLS)
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`
  const r = await fetch(uploadUrl, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey':        SUPABASE_SERVICE_KEY,
      'Content-Type':  mimeType,
      'x-upsert':      'true',
    },
    body: buffer,
  })

  if (!r.ok) {
    const err = await r.text()
    console.error('[media] Supabase upload failed:', r.status, err)
    return res.status(500).json({ error: `Storage upload failed: ${err}` })
  }

  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
  return res.status(200).json({ url })
}
