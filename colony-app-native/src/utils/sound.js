/**
 * Audio + haptic feedback for celebration moments (PAID, etc).
 *
 * Today: just a "ka-ching"-shaped vibration pattern (no native deps, no
 * rebuild needed). The visual KERRRCHING text + animation carries most of
 * the impact.
 *
 * Tomorrow: bundle a real cash-register sample and play it via expo-audio.
 * That requires `npx expo install expo-audio` + a fresh EAS build.
 */
import { Vibration, Platform } from 'react-native'

/**
 * Play the "ka-ching" feedback.
 * Two short pulses with a brief gap — the rhythm of an old cash-register bell.
 */
export async function playKaChing() {
  // Pattern: [delay, vibrate, gap, vibrate]. iOS only respects pattern lengths,
  // not amplitudes — so we keep it simple. Total ~340ms.
  if (Platform.OS === 'ios') {
    // iOS treats each value as a duration to vibrate, alternating on/off
    Vibration.vibrate([0, 80, 60, 200])
  } else {
    Vibration.vibrate([0, 80, 60, 200])
  }
}
