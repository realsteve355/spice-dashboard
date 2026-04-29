/**
 * NFC utilities — read / write NDEF tags for tap-to-pay.
 *
 * Read flow (citizen):
 *   1. Till tag holds NDEF URI: "spice://pay?to=0xADDR&amount=N&note=TEXT"
 *   2. Citizen opens app, taps "Tap to Pay" → scanPayTag()
 *   3. App reads tag → parsePayUrl() → navigate to Pay screen
 *
 * Write flow (merchant — iPhone only):
 *   1. Merchant enters amount + note → writeNdefPayUrl(url)
 *   2. Merchant holds phone near a blank/rewritable NTAG sticker on the till
 *   3. Tag is overwritten with the new payment URL
 *   4. Customer phone taps the same sticker → reads URL → opens SPICE app
 *
 * react-native-nfc-manager is not in Expo Go.
 * Use: npx eas build --profile development for NFC testing.
 */
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager'
import { parsePayUrl } from './payurl'

let _started = false

async function ensureStarted() {
  if (_started) return
  await NfcManager.start()
  _started = true
}

/** Returns true if this device has NFC hardware (iPhone yes, iPad no). */
export async function isNfcSupported() {
  try {
    return await NfcManager.isSupported()
  } catch {
    return false
  }
}

/**
 * Scan an NDEF NFC tag and return parsed payment params.
 * Resolves to { to, amount, note, merchantName } or throws on error/cancel.
 */
export async function scanPayTag() {
  await ensureStarted()

  try {
    await NfcManager.requestTechnology([NfcTech.Ndef])
    const tag = await NfcManager.getTag()

    if (!tag?.ndefMessage?.length) {
      throw new Error('NFC tag is empty or unreadable.')
    }

    const record  = tag.ndefMessage[0]
    const payload = new Uint8Array(record.payload)
    const uri     = Ndef.uri.decodePayload(payload)

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
 * Write a SPICE payment URL to a writable NDEF tag.
 * iPhone-only (iPad has no app-accessible NFC writer).
 *
 * The user must hold their phone near the tag while this promise is pending.
 * iOS shows a system NFC sheet automatically.
 */
export async function writeNdefPayUrl(url) {
  await ensureStarted()

  try {
    await NfcManager.requestTechnology([NfcTech.Ndef])

    const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)])
    if (!bytes) throw new Error('Could not encode payment URL.')

    await NfcManager.ndefHandler.writeNdefMessage(bytes)
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {})
  }
}

// Re-export so callers don't have to import from two places
export { parsePayUrl } from './payurl'
