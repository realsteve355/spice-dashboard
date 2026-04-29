/**
 * Haptic feedback for celebration moments (PAID, payment-sent, etc).
 *
 * Audio playback in RN requires a native module (expo-audio) and therefore
 * a fresh EAS build, so for now we lean entirely on Vibration. The pattern
 * below approximates a "ka-ching" rhythm: short pulse, gap, longer pulse.
 *
 * To upgrade to real audio later: `npx expo install expo-audio`, drop a
 * sample at assets/kaching.mp3, queue a rebuild, then load + play here.
 */
import { Vibration } from 'react-native'

/**
 * Triple-pulse vibration — short / short / long. Distinct enough on iOS
 * that you'll notice it through the table at the till; not so long that
 * it feels alarming.
 */
export async function playKaChing() {
  Vibration.vibrate([0, 60, 50, 60, 70, 250])
}
