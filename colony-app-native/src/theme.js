// Design tokens — matches colony-app/src/theme.js
import { Platform } from 'react-native'

export const C = {
  gold:    '#B8860B',
  bg:      '#ffffff',
  text:    '#111111',
  sub:     '#555555',
  faint:   '#999999',
  border:  '#e2e2e2',
  red:     '#ef4444',
  purple:  '#8b5cf6',
  blue:    '#3b82f6',
  yellow:  '#eab308',
  green:   '#16a34a',
  white:   '#ffffff',
  card:    '#f9f9f9',
}

export const font = Platform.OS === 'ios' ? 'Courier New' : 'monospace'

export const card = {
  backgroundColor: C.white,
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
