// Shared MAC base data + formula — loaded by BOTH /mac (year 1, today) and
// /mac-y20 (year 20). Keeping the base in one place means the two snapshots can
// never drift apart: year 20 is the same companies, transformed by automation.
//
// MAC formula (the 50% cap is removed for now — see macRate):
//     rate = k × 22% × (profit / employees) / $200,000
//     MAC  = profit × rate
// k = 1. The rate rises with profit PER EMPLOYEE (the firm's company-wide
// automation level); the charge applies it to the profit earned in the county.
//
// All figures are first-pass illustrative estimates. Sector revenues match the
// /companies page ($13B total).

const K = 1;
const BASE_RATE = 0.22;     // charge at the reference profit-per-employee
const RATE_CAP = 0.50;      // policy cap (currently NOT applied — see macRate)
const REF_PPE = 200000;     // profit-per-employee reference ($)

// rev ($/yr from county), margin (profit/rev), rpe (revenue per employee $),
// txn (avg transaction size $), cos (number of companies — from /companies),
// wage (average annual wage per employee $ — drives the wage bill).
const CATEGORIES = [
  { name: "Housing & real estate",     rev: 3.9e9, margin: 0.04, rpe: 180000, txn: 1200, cos: 4000, wage: 55000 },
  { name: "Food — grocery & dining",   rev: 2.4e9, margin: 0.08, rpe: 120000, txn:   35, cos: 1600, wage: 30000 },
  { name: "Transport, autos & travel", rev: 1.8e9, margin: 0.12, rpe: 400000, txn:   90, cos:  350, wage: 55000 },
  { name: "Healthcare & pharma",       rev: 1.3e9, margin: 0.12, rpe: 200000, txn:  180, cos:  550, wage: 65000 },
  { name: "Retail goods & e-commerce", rev: 1.2e9, margin: 0.06, rpe: 250000, txn:   55, cos:  900, wage: 38000 },
  { name: "Utilities & telecom",       rev: 1.0e9, margin: 0.20, rpe: 800000, txn:  150, cos:   20, wage: 90000 },
  { name: "Digital, media & gambling", rev: 0.7e9, margin: 0.35, rpe: 1500000, txn:  20, cos:  150, wage: 120000 },
  { name: "Financial services",        rev: 0.4e9, margin: 0.25, rpe: 600000, txn:  250, cos:  220, wage: 95000 },
  { name: "Education & training",      rev: 0.3e9, margin: 0.08, rpe: 120000, txn:  400, cos:  110, wage: 50000 },
];

function macRate(profit, emp) {
  // Cap removed for now — reinstate with Math.min(RATE_CAP, …)
  return K * BASE_RATE * (profit / emp) / REF_PPE;
}

// Shared formatters.
function money(v) {
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return "$" + Math.round(v / 1e3) + "k";
  return "$" + (v >= 100 ? Math.round(v) : v.toFixed(2));
}
function count(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return Math.round(v / 1e3) + "k";
  return Math.round(v).toLocaleString();
}
const n = v => Math.round(v).toLocaleString();
const pct = v => (v * 100).toFixed(1) + "%";
