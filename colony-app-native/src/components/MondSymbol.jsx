// MondSymbol — React Native version using react-native-svg.
//
// Mirrors the web src/components/MondSymbol.jsx. Renders the designed
// Ɱ glyph (M with vertical stroke through the centre) at any size,
// with stroke weight that auto-scales by display size so it stays
// readable from a 13px ledger row to a 56px hero block.
//
// Usage:
//   <MondSymbol size={18} />                          // inherits parent color
//   <MondSymbol size={44} color="#f0ede6" />          // explicit color
//
// Aligned to baseline by default (slight upward translation handled
// at call sites — see brand spec §Vertical alignment).
import React from 'react'
import Svg, { Path, Line } from 'react-native-svg'

export default function MondSymbol({ size = 16, color = '#ede5d4', style }) {
  // Stroke weight scales inversely with display size — matches web.
  let strokeWidth
  if (size <= 14)      strokeWidth = 11
  else if (size <= 20) strokeWidth = 9
  else if (size <= 32) strokeWidth = 7
  else if (size <= 56) strokeWidth = 6
  else                 strokeWidth = 5

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="square"
      style={style}
    >
      <Path d="M 15 85 L 15 18 L 50 62 L 85 18 L 85 85" />
      <Line x1="50" y1="6" x2="50" y2="94" />
    </Svg>
  )
}
