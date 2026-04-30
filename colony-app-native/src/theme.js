// Design tokens — mission-control scheme for the native app.
// Mirrors src/tokens.js on the research site (see docs/redesign.md §2).
// Native uses warm-tinted near-black instead of the previous cool grey scheme,
// and shares the same warm-white text colour with the web side.
import { Platform } from 'react-native'

export const C = {
  gold:    '#D9A53D',   // legacy data accent — survives in chart panels
  bg:      '#06070a',   // near-black, slightly warm — same as web
  text:    '#ede5d4',   // primary warm-white
  sub:     '#b8b0a0',   // secondary text — labels
  faint:   '#8a8170',   // muted / timestamps
  border:  '#232831',   // hairline divider
  red:     '#f87171',
  purple:  '#a78bfa',
  blue:    '#60a5fa',
  yellow:  '#facc15',
  green:   '#5dd39e',   // muted green — ok / positive deltas
  white:   '#11141a',   // elevated card surface (legacy name)
  card:    '#0d0f12',   // raised surface — top bar, panel
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
