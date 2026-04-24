/**
 * NFC utilities — tag scanning for tap-to-pay.
 *
 * Flow:
 *   1. Till writes NDEF URI tag: "spice://pay?to=0xADDR&amount=N&note=TEXT"
 *   2. Citizen opens app, taps "Tap to Pay" → scanPayTag()
 *   3. App reads tag → parsePayUrl() → navigate to Pay screen
 *
 * react-native-nfc-manager must be installed (not in Expo Go).
 * Use: npx eas build --profile development for NFC testing.
 */
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager'

let _started = false

/** Returns true if this device has NFC hardware. */
export async function isNfcSupported() {
  try {
    return await NfcManager.isSupported()
  } catch {
    return false
  }
}

/**
 * Scan an NDEF NFC tag and return parsed payment params.
 * Resolves to { to, amount, note } or throws on error/cancel.
 */
export async function scanPayTag() {
  if (!_started) {
    await NfcManager.start()
    _started = true
  }

  try {
    await NfcManager.requestTechnology([NfcTech.Ndef])
    const tag = await NfcManager.getTag()

    if (!tag?.ndefMessage?.length) {
      throw new Error('NFC tag is empty or unreadable.')
    }

    // First record — expect a URI record
    const record = tag.ndefMessage[0]
    const payload = new Uint8Array(record.payload)
    const uri = Ndef.uri.decodePayload(payload)

    const params = parsePayUrl(uri)
    if (!params) {
      throw new Error('NFC tag does not contain a valid SPICE payment URL.')
    }
    return params
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {})
  }
}

/**
 * Parse "spice://pay?to=0x…&amount=5&note=Lunch" into { to, amount, note }.
 * Returns null if the URL is not a valid pay URL.
 */
export function parsePayUrl(urlStr) {
  try {
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
    // Require at least a recipient address
    if (!params.to || !/^0x[0-9a-fA-F]{40}$/.test(params.to)) return null
    return {
      to:           params.to,
      amount:       params.amount  || '',
      note:         params.note    || '',
      merchantName: params.name    || '',
    }
  } catch {
    return null
  }
}
