/**
 * Returns the human-readable name of the biometric available on this device.
 * "Face ID" on Face-ID iPhones / iPads, "Touch ID" on Touch-ID devices,
 * "Biometric" as a fallback (Android, or older devices).
 */
import { useEffect, useState } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'

const T = LocalAuthentication.AuthenticationType

export async function biometricLabel() {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    if (types.includes(T.FACIAL_RECOGNITION)) return 'Face ID'
    if (types.includes(T.FINGERPRINT))        return 'Touch ID'
    if (types.includes(T.IRIS))               return 'Iris'
    return 'Biometric'
  } catch {
    return 'Biometric'
  }
}

/** React hook variant — returns a string that updates once async lookup completes. */
export function useBiometricLabel() {
  const [label, setLabel] = useState('Biometric')
  useEffect(() => {
    let alive = true
    biometricLabel().then(l => { if (alive) setLabel(l) })
    return () => { alive = false }
  }, [])
  return label
}
