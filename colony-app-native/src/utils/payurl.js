/**
 * Payment URL build/parse — shared between NFC tags, QR codes, and OS deep-links.
 *
 * Format:  spice://pay?to=0xADDR&amount=N&note=TEXT&name=MERCHANT
 *
 * Kept as plain strings so the URL can be embedded in NDEF tag, QR code,
 * or sent as a deep link. amount is left as a string so the receiving end
 * can parse it (the on-chain transfer always works in 18-decimal wei).
 */

/** Decode an "id1x2,id2x1" items string into an array of { id, qty }. */
export function decodeItems(str) {
  if (!str) return []
  return str
    .split(',')
    .map(s => {
      const x = s.lastIndexOf('x')
      if (x < 0) return null
      const id  = s.slice(0, x)
      const qty = parseInt(s.slice(x + 1), 10) || 0
      return id && qty > 0 ? { id, qty } : null
    })
    .filter(Boolean)
}

/**
 * Build a SPICE pay URL. Returns a string suitable for QR / NDEF.
 *
 * `items` is an optional array of { id, qty } — encoded as `items=id1x2,id2x1`
 * so the customer's Pay screen can look up product names + photos.
 */
export function buildPayUrl({ to, amount, note = '', merchantName = '', items = [] }) {
  if (!to || !/^0x[0-9a-fA-F]{40}$/.test(to)) {
    throw new Error('buildPayUrl: invalid "to" address')
  }
  const parts = [`to=${to}`]
  if (amount !== undefined && amount !== null && amount !== '') {
    parts.push(`amount=${encodeURIComponent(String(amount))}`)
  }
  if (note)         parts.push(`note=${encodeURIComponent(note)}`)
  if (merchantName) parts.push(`name=${encodeURIComponent(merchantName)}`)
  if (items.length) {
    const enc = items
      .filter(i => i.id && i.qty > 0)
      .map(i => `${i.id}x${i.qty}`)
      .join(',')
    if (enc) parts.push(`items=${encodeURIComponent(enc)}`)
  }
  return `spice://pay?${parts.join('&')}`
}

/**
 * Parse "spice://pay?to=0x…&amount=5&note=Lunch&name=Steve's%20Bakery".
 * Returns null if the URL is not a valid SPICE pay URL.
 */
export function parsePayUrl(urlStr) {
  try {
    if (!urlStr || typeof urlStr !== 'string') return null
    const qIdx = urlStr.indexOf('?')
    if (qIdx < 0) return null
    const params = {}
    urlStr.slice(qIdx + 1).split('&').forEach(pair => {
      const eq = pair.indexOf('=')
      if (eq < 0) return
      const k = decodeURIComponent(pair.slice(0, eq))
      const v = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '))
      params[k] = v
    })
    if (!params.to || !/^0x[0-9a-fA-F]{40}$/.test(params.to)) return null
    const items = decodeItems(params.items)
    return {
      to:           params.to,
      amount:       params.amount || '',
      note:         params.note   || '',
      merchantName: params.name   || '',
      items,
    }
  } catch {
    return null
  }
}
