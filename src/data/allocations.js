// SPICE Protocol — portfolio allocations by alert level.
// Edit this file to adjust compositions. Changes take effect on next deploy.
// The Config page (/config) displays these values.

export const ALLOCATIONS = [
  {
    level: 0,
    label: "GREEN",
    scoreRange: "0–8",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.12)",
    objective:
      "Preserve capital in hard assets while the thesis develops. " +
      "Earn a real return above cash without crisis leverage.",
    context:
      "System functioning within baseline parameters. No collision imminent. " +
      "The portfolio holds its hard asset base and begins building the crypto position.",
    assets: [
      { name: "PAXG",              pct: 75, color: "#c8a96e", note: "Tokenised gold — primary store of value" },
      { name: "Bitcoin",           pct: 15, color: "#f97316", note: "Non-sovereign hard asset, crypto-native" },
      { name: "AI equity",         pct: 10, color: "#3b82f6", note: "NVDA / AMD synthetic — thesis-consistent growth" },
    ],
  },
  {
    level: 1,
    label: "BLUE",
    scoreRange: "9–16",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    objective:
      "Begin building the short positions before they become expensive. " +
      "Maintain hard asset base while introducing early convexity.",
    context:
      "Early fragility visible. Indicators beginning to reflect structural pressures. " +
      "Enter sovereign bond shorts while carry cost is still low.",
    assets: [
      { name: "PAXG",              pct: 60, color: "#c8a96e", note: "Core gold position" },
      { name: "Bitcoin",           pct: 20, color: "#f97316", note: "Increase crypto exposure" },
      { name: "AI equity",         pct: 10, color: "#3b82f6", note: "Maintain growth leg" },
      { name: "Commodities",       pct: 5,  color: "#16a34a", note: "Copper, uranium — inflation hedge" },
      { name: "Sovereign shorts",  pct: 5,  color: "#ef4444", note: "Initial JGB / BTP short — enter cheap" },
    ],
  },
  {
    level: 2,
    label: "YELLOW",
    scoreRange: "17–24",
    color: "#ca8a04",
    bg: "rgba(202,138,4,0.12)",
    objective:
      "Shift from defence to active positioning. Short book at ~60% of maximum. " +
      "Hard asset base protecting capital while shorts begin generating alpha.",
    context:
      "Structural stress accumulating. Multiple indicators breached. " +
      "McKinsey-level displacement conditions compounding fiscal pressure.",
    assets: [
      { name: "PAXG",              pct: 45, color: "#c8a96e", note: "Core unchanged" },
      { name: "Bitcoin",           pct: 25, color: "#f97316", note: "Increase — fiat credibility weakening" },
      { name: "Silver",            pct: 10, color: "#94a3b8", note: "Monetary metal, higher beta than gold" },
      { name: "Sovereign shorts",  pct: 10, color: "#ef4444", note: "JGB, BTP — scale up" },
      { name: "Commodities",       pct: 5,  color: "#16a34a", note: "Energy security premium activating" },
      { name: "Rates volatility",  pct: 5,  color: "#8b5cf6", note: "MOVE-equivalent — begin accumulating" },
    ],
  },
  {
    level: 3,
    label: "ORANGE",
    scoreRange: "25–32",
    color: "#ea580c",
    bg: "rgba(234,88,12,0.12)",
    objective:
      "Maximum alpha generation from short book. Hard asset base protecting capital. " +
      "Volatility structures crystallising. Exit AI equity — equities under broad pressure.",
    context:
      "SPICE base case conditions met. Sovereign, monetary and market stress aligned. " +
      "Collision likely within 3–7 years without significant policy intervention.",
    assets: [
      { name: "Bitcoin",           pct: 35, color: "#f97316", note: "Dominant position — fiat exit signal" },
      { name: "PAXG",              pct: 30, color: "#c8a96e", note: "Safe haven absolute" },
      { name: "Sovereign shorts",  pct: 15, color: "#ef4444", note: "JGB, BTP, potentially US 30Y — max sizing" },
      { name: "Silver",            pct: 10, color: "#94a3b8", note: "Outperforms gold in acute phase" },
      { name: "Rates volatility",  pct: 5,  color: "#8b5cf6", note: "Crystallising rapidly" },
      { name: "Commodities",       pct: 5,  color: "#16a34a", note: "Real-world value anchors" },
    ],
  },
  {
    level: 4,
    label: "RED",
    scoreRange: "33–40",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.12)",
    objective:
      "Maximum exit from fiat exposure. Begin orderly exit from short positions " +
      "as maximum profits captured. Evaluate IRON-to-SPICE switchover.",
    context:
      "Structural fracture. At least one G7 sovereign under genuine stress. " +
      "Gold up 100%+ from inception NAV. Crypto adoption accelerating as fiat alternative.",
    assets: [
      { name: "Bitcoin",           pct: 45, color: "#f97316", note: "Mobility premium — BTC confiscation-resistant vs gold" },
      { name: "PAXG",              pct: 20, color: "#c8a96e", note: "Reduce — confiscation risk rises in extremis" },
      { name: "Sovereign shorts",  pct: 15, color: "#ef4444", note: "Begin scaling out as bonds reprice" },
      { name: "Silver",            pct: 10, color: "#94a3b8", note: "Monetary metal" },
      { name: "Rates volatility",  pct: 5,  color: "#8b5cf6", note: "Crystallise remaining positions" },
      { name: "Commodities",       pct: 5,  color: "#16a34a", note: "Energy / commodity producers" },
    ],
  },
];
