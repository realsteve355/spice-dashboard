/**
 * Payment URL build/parse — shared between NFC tags, QR codes, and OS deep-links.
 *
 * Format:  spice://pay?to=0xADDR&amount=N&note=TEXT&name=MERCHANT
 *
 * Kept as plain strings so the URL can be embedded in NDEF tag, QR code,
 * or sent as a deep link. amount is left as a string so the receiving end
 * can parse it (the on-chain transfer always works in 18-decimal wei).
 */

/** Build a SPICE pay URL. Returns a string suitable for QR / NDEF. */
export function buildPayUrl({ to, amount, note = '', merchantName = '' }) {
  if (!to || !/^0x[0-9a-fA-F]{40}$/.test(to)) {
    throw new Error('buildPayUrl: invalid "to" address')
  }
  const parts = [`to=${to}`]
  if (amount !== undefined && amount !== null && amount !== '') {
    parts.push(`amount=${encodeURIComponent(String(amount))}`)
  }
  if (note)         parts.push(`note=${encodeURIComponent(note)}`)
  if (merchantName) parts.push(`name=${encodeURIComponent(merchantName)}`)
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
    return {
      to:           params.to,
      amount:       params.amount || '',
      note:         params.note   || '',
      merchantName: params.name   || '',
    }
  } catch {
    return null
  }
}
