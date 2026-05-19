// src/components/MondSymbol.jsx
// MOND currency symbol — the Ɱ glyph.
// Used inline before any numeric MOND amount, like $ or £ before a number.
// Auto-adjusts stroke weight by size so it reads correctly at any scale.

import React from 'react';

/**
 * MOND currency symbol component.
 *
 * @param {number} size - Pixel size of the symbol (height). Defaults to 1em equivalent.
 * @param {string} color - Any valid CSS color. Defaults to currentColor (inherits from parent).
 * @param {object} style - Additional inline styles, merged in.
 * @param {string} className - Optional class name.
 * @param {object} rest - Any other props forwarded to the SVG.
 *
 * @example
 *   // Inline before a price (inherits parent font color and size)
 *   <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 28 }}>
 *     <MondSymbol size={22} /> 2,500
 *   </span>
 *
 * @example
 *   // Standalone, explicit color
 *   <MondSymbol size={44} color="#0A0A0A" />
 */
export default function MondSymbol({
  size = 16,
  color = 'currentColor',
  style = {},
  className,
  ...rest
}) {
  // Stroke weight scales inversely with display size:
  // — At tiny sizes (≤16px), strokes need to be heavier to remain visible
  // — At hero sizes (≥48px), strokes should be lighter to stay refined
  // The viewBox is 100×100, so strokeWidth is in viewBox units.
  let strokeWidth;
  if (size <= 14)      strokeWidth = 11;
  else if (size <= 20) strokeWidth = 9;
  else if (size <= 32) strokeWidth = 7;
  else if (size <= 56) strokeWidth = 6;
  else                 strokeWidth = 5;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="square"
      role="img"
      aria-label="MOND"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      {...rest}
    >
      <title>MOND</title>
      <path d="M 15 85 L 15 18 L 50 62 L 85 18 L 85 85" />
      <line x1="50" y1="6" x2="50" y2="94" />
    </svg>
  );
}
