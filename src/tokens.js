// Mission-control design tokens — see docs/redesign.md §2.
// Inline-style only; do not introduce CSS files, Tailwind, or styled-components.

export const C = {
  // Surfaces
  bg:       "#06070a",   // page background — near-black, slightly warm
  panel:    "#0d0f12",   // raised surface — top bar, cards, vault panel
  panel2:   "#11141a",   // hover/elevated panel

  // Lines
  line:     "#232831",   // hairline divider
  lineHot:  "#353c47",   // emphasised divider, button border

  // Text — all warm-tinted
  txt:      "#ede5d4",   // primary text, brand colour
  txt2:     "#d8cfba",   // soft primary — body copy
  dim:      "#b8b0a0",   // secondary — labels, secondary metadata
  faint:    "#8a8170",   // tertiary — timestamps (passes WCAG AA at 5.8:1)

  // Headline highlight (use only on h1 hero)
  headline: "#ffffff",

  // Semantic status — only on data and live indicators, never on chrome
  ok:       "#5dd39e",   // muted green — positive deltas, INFO log, "sys online"
  warn:     "#d4a04a",   // muted amber — caution, WARN log
  crit:     "#ef4444",   // red — critical, downward deltas, threat-level

  // Status background tints
  okBg:     "rgba(93,211,158,0.06)",
  warnBg:   "rgba(212,160,74,0.06)",
  critBg:   "rgba(239,68,68,0.06)",
};

export const F = {
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};
