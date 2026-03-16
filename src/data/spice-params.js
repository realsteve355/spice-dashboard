// ─── SPICE FIXED PARAMETERS ──────────────────────────────────────────────────
// These are SPICE's base case assumptions — the thesis, not user scenarios.
// Update current{} values periodically as data changes.
// Last updated: 2026-03-16

export const SPICE_PARAMS = {
  // Current values (early 2026)
  current: {
    debt:         122,    // Debt/GDP % — CBO/House Budget
    ai:           8,      // AI displacement % of workforce — estimate
    crypto:       3,      // Crypto as % of global investable assets — estimate
    unemployment: 3.8,    // Unemployment % — BLS
    inflation:    3.2,    // CPI YoY % — BLS
    yields:       4.32,   // 10Y Treasury % — FRED
    gini:         0.49,   // Gini coefficient — estimate
  },

  // SPICE projected trajectory (base case, no major policy intervention)
  projection: {
    debt:         [122, 135, 150, 175, 195, 220, 245],   // 2026–2032
    ai:           [8,   12,  18,  25,  35,  42,  48],
    crypto:       [12,  16,  22,  30,  40,  52,  60],
    unemployment: [3.8, 5,   7,   10,  15,  18,  20],
    inflation:    [3.2, 4,   5.5, 8,   12,  14,  10],
    yields:       [4.32,5.2, 6.5, 7.8, 4.5, 4.5, 4.5],  // YCC kicks in ~2030
    gini:         [0.49,0.51,0.54,0.57,0.60,0.61,0.62],
    years:        [2026,2027,2028,2029,2030,2031,2032],
  },

  // Crisis thresholds (from sim-engine.js)
  thresholds: {
    debt:           175,
    unemployment:   20,
    inflationHigh:  15,
    inflationLow:   -7,
    yields:         10,
    yieldsModerate: 6.5,
    debtModerate:   150,
    cryptoFlight:   40,
    aiDisplacement: 15,   // Collision threshold
    gini:           0.60,
  },

  // Policy assumptions underlying the base case
  policy: {
    fiscal:   "none",   // No fiscal adjustment
    monetary: "none",   // Fed stays course until forced to act
    crypto:   "tax",    // Tax & Regulate regime
  },

  meta: {
    lastUpdated:      "2026-03-16",
    crisisWindow:     { start: 2029, end: 2032 },
    currentLevel:     3,      // 0=GREEN, 1=BLUE, 2=YELLOW, 3=ORANGE, 4=RED
    sources: [
      "CBO Long-Term Budget Outlook, March 2025",
      "McKinsey MGI (2023) — AI displacement forecast",
      "Goldman Sachs — AI impact on labour",
      "FRED — current economic data",
    ],
  },
};

// Level colour map (consistent with Home_LEVELS and indicators page)
export const LEVEL_COLORS = {
  0: "#16a34a",  // GREEN
  1: "#3b82f6",  // BLUE
  2: "#ca8a04",  // YELLOW
  3: "#ea580c",  // ORANGE
  4: "#dc2626",  // RED
};

export const LEVEL_LABELS = ["GREEN", "BLUE", "YELLOW", "ORANGE", "RED"];
