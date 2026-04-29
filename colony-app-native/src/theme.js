// Design tokens — dark scheme for the native app.
// Web stays light per spice-dashboard CLAUDE.md design system; native diverges
// because phones use dark UI more comfortably and OLED screens save power.
import { Platform } from 'react-native'

export const C = {
  gold:    '#D9A53D',   // slightly brighter gold for dark-bg contrast
  bg:      '#0a0a0a',   // near-black, AMOLED-friendly
  text:    '#f2f2f2',
  sub:     '#b8b8b8',
  faint:   '#8a8a8a',
  border:  '#2a2a2a',
  red:     '#f87171',
  purple:  '#a78bfa',
  blue:    '#60a5fa',
  yellow:  '#facc15',
  green:   '#4ade80',
  white:   '#1a1a1a',   // "white" is the elevated card surface, not page-white
  card:    '#141414',
}

export const font = Platform.OS === 'ios' ? 'Courier New' : 'monospace'

export const card = {
  backgroundColor: C.card,
  borderWidth: 1,
  borderColor: C.border,
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
}

export const label = {
  fontSize: 10,
  color: C.faint,
  letterSpacing: 1.2,
  fontFamily: font,
}

export const value = {
  fontSize: 22,
  fontWeight: '600',
  color: C.gold,
  fontFamily: font,
}

export function shortAddr(addr) {
  if (!addr || addr.length < 10) return addr || ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
