// SPICE Colony — shared mission-control theme
// Mirrors src/tokens.js on the research site (see docs/redesign.md §2).
// All pages and components import C from here.

export const C = {
  bg:     '#06070a',   // page background — near-black, slightly warm
  white:  '#11141a',   // card / surface background (legacy name; keep for back-compat)
  panel:  '#0d0f12',   // raised surface — top bar, panel
  panel2: '#11141a',   // hover/elevated panel
  text:   '#ede5d4',   // primary warm-white text
  sub:    '#b8b0a0',   // secondary text — labels
  faint:  '#8a8170',   // muted / timestamps
  border: '#232831',   // hairline divider
  borderHot: '#353c47', // emphasised divider, button border

  // Headline highlight — only for hero h1
  headline: '#ffffff',

  // Semantic status colours (data + live indicators only)
  gold:   '#c8a96e',   // legacy data accent — survives in chart panels
  red:    '#ef4444',   // critical
  green:  '#5dd39e',   // muted green — ok / positive deltas
  blue:   '#3b82f6',   // info / inflation chart
  purple: '#8b5cf6',   // governance / unemployment chart
  warn:   '#d4a04a',   // muted amber — caution
  ok:     '#5dd39e',   // alias for green
  crit:   '#ef4444',   // alias for red
}

export const F = {
  mono: "'IBM Plex Mono', ui-monospace, monospace",
}
