// ─── SHARED SIMULATION ENGINE ──────────────────────────────────────────────
// Imported by chart3-simulation.jsx and Impact.jsx

export const ANCHORS = [
  { pct:0.05, label:"CBO",      desc:"CBO 2025 baseline. Gradual adoption, minimal disruption." },
  { pct:0.10, label:"IMF/GS",   desc:"IMF + Goldman Sachs central estimate. Manageable disruption." },
  { pct:0.25, label:"McKinsey", desc:"McKinsey high-end. 25% of tasks automatable by 2030." },
  { pct:0.40, label:"SPICE",    desc:"SPICE thesis. Rapid displacement from agentic AI 2026–28." },
  { pct:0.60, label:"Collision",desc:"AGI-equivalent transition compressed into 3–4 years." },
];

export const FISCAL_POLICIES = [
  { id:"none",      label:"None",            desc:"No fiscal adjustment. Drift.",
    e:{ dM:1.00, iA:0,      uM:1.00, lD: 0,    cD: 0    }},
  { id:"robot_ubi", label:"Robot Tax + UBI", desc:"Tax automation, fund redistribution.",
    e:{ dM:0.72, iA:0.002,  uM:0.82, lD:+0.08, cD:-0.06 }},
  { id:"austerity", label:"Austerity",        desc:"Spending cuts. Reduces deficit, crushes demand.",
    e:{ dM:0.60, iA:-0.010, uM:1.15, lD:-0.02, cD: 0.01 }},
];

export const MONETARY_POLICIES = [
  { id:"none",       label:"None",               desc:"No monetary intervention.",
    e:{ yM:1.00, iA:0,     gM:1.00, lD: 0,    cD: 0    }},
  { id:"qe",         label:"QE / Money Printing", desc:"Monetises deficits. Inflates asset prices. SPICE core hedge.",
    e:{ yM:0.70, iA:0.035, gM:1.55, lD:-0.05, cD:+0.07 }},
  { id:"ycc",        label:"Yield Curve Control", desc:"Hard cap on long-end yields. Japan 2016–23 playbook.",
    e:{ yM:0.58, iA:0.045, gM:1.70, lD:-0.06, cD:+0.08 }},
  { id:"repression", label:"Financial Repression",desc:"Force banks/pensions into bonds below market rates.",
    e:{ yM:0.72, iA:0.020, gM:1.35, lD:-0.03, cD:+0.04 }},
];

export const SIM_LEVELS = [
  { label:"GREEN",  color:"#16a34a", bg:"#f0fdf4" },
  { label:"BLUE",   color:"#3b82f6", bg:"#eff6ff" },
  { label:"YELLOW", color:"#ca8a04", bg:"#fefce8" },
  { label:"ORANGE", color:"#ea580c", bg:"#fff7ed" },
  { label:"RED",    color:"#dc2626", bg:"#fef2f2" },
];

export function simSpiceLevel(row) {
  let s = 0;
  const d = row.debtGDP;
  if (d > 140) s += 4; else if (d > 120) s += 3; else if (d > 100) s += 2; else if (d > 80) s += 1;
  const u = row.unemp;
  if (u > 12) s += 4; else if (u > 8) s += 3; else if (u > 6) s += 2; else if (u > 4.5) s += 1;
  const inf = row.infl;
  if (inf > 9 || inf < -2) s += 4;
  else if (inf > 7 || inf < 0) s += 3;
  else if (inf > 5 || inf < 1) s += 2;
  else if (inf > 3.5 || inf < 1.5) s += 1;
  const y = row.yld;
  if (y > 7) s += 4; else if (y > 6) s += 3; else if (y > 5) s += 2; else if (y > 4) s += 1;
  if (s >= 13) return 4;
  if (s >= 10) return 3;
  if (s >=  6) return 2;
  if (s >=  3) return 1;
  return 0;
}

export function runSim(displaced, fiscalId, monetaryId, cryptoAdoption, cryptoPolicy) {
  const fp = FISCAL_POLICIES.find(p => p.id === fiscalId)    || FISCAL_POLICIES[0];
  const mp = MONETARY_POLICIES.find(p => p.id === monetaryId) || MONETARY_POLICIES[0];
  const e = {
    dM: fp.e.dM, yM: mp.e.yM, iA: fp.e.iA + mp.e.iA,
    gM: mp.e.gM, uM: fp.e.uM, lD: fp.e.lD + mp.e.lD, cD: fp.e.cD + mp.e.cD,
  };

  const intensity = displaced / 0.65;
  const aiSpeed   = 0.05 + intensity * 0.78;
  const dispRate  = intensity * 0.90;
  const peakProd  = 0.02 + aiSpeed * 0.12;
  const rampYrs   = 1 + (1 - aiSpeed) * 4;
  const peakDisp  = dispRate * 0.28;
  const yccCap    = monetaryId === "ycc" ? 0.045 : 0.14;

  let debtGDP = 1.23, employed = 160, priceLevel = 1.0;
  const lf = 167, r0 = 0.041, tax0 = 0.18, spend0 = 0.245;
  let labShare = 0.60, capShare = 0.25;
  let bitcoin = 85000, cryptoFlight = 0.01;
  const cAdopt = cryptoAdoption ?? 0.5;
  let yld = r0, breakYear = null, ghostYear = null;
  const rows = [];

  for (let i = 0; i < 10; i++) {
    const yr = 2026 + i;
    const t  = i + 1;

    const ramp    = Math.min(1, t / rampYrs);
    const prod    = peakProd * ramp * Math.exp(-0.02 * Math.max(0, t - rampYrs));
    const dLag    = Math.max(0, t - 2);
    const dRamp   = Math.min(1, dLag / (rampYrs + 1));
    const annDisp = peakDisp * dRamp * Math.exp(-0.03 * Math.max(0, dLag - rampYrs)) * e.uM;

    employed = Math.max(employed * (1 - annDisp), lf * 0.55);
    const unemp = Math.max(0, 1 - employed / lf);
    if (!ghostYear && prod > 0.03 && unemp > 0.08) ghostYear = yr;

    const escapeValve = Math.min(cryptoFlight * cAdopt * 0.06, 0.015);
    const inflRaw = 0.025 - t * 0.0007 - prod * 0.5 + e.iA;
    const infl    = Math.max(-0.10, Math.min(0.20, inflRaw + escapeValve));
    priceLevel *= (1 + infl);

    const drag      = unemp > 0.07 ? (unemp - 0.07) * 1.2 : 0;
    const ghostDrag = cryptoFlight * cAdopt * 0.025;
    const gGDP      = Math.max(-0.05, 0.018 + prod * 0.65 - drag - ghostDrag);

    const postBreak   = breakYear && yr >= breakYear;
    const taxOffset   = (cryptoPolicy === "tax" && postBreak) ? cryptoFlight * cAdopt * 0.04 : 0;
    const empR        = employed / (lf * 0.956);
    const robTax      = fiscalId === "robot_ubi" ? 0.008 : 0;
    const taxErosion  = Math.max(0, cryptoFlight * cAdopt * 0.08 - taxOffset);
    const tax         = Math.max(0.10, tax0 * Math.pow(empR, 1.2) + robTax - taxErosion);
    const welf        = Math.max(0, unemp - 0.05) * 2.2;
    const ubi         = fiscalId === "robot_ubi" ? 0.022 : 0;
    const rawSpd      = spend0 + welf + ubi;
    const spd         = fiscalId === "austerity" ? Math.min(rawSpd, spend0 * 0.92) : rawSpd;
    const seigniorage = cryptoFlight * cAdopt * 0.018;
    const pDef        = (spd - tax) * e.dM + seigniorage;

    const yldRaw = r0 + Math.max(0, (debtGDP - 1.2) * 0.012 + pDef * 0.18);
    yld = Math.min(yccCap, yldRaw * e.yM);

    const rawDebt = debtGDP * (1 + yld) / (1 + gGDP + infl) + pDef;
    debtGDP = Math.min(rawDebt, 3.0);

    if (!breakYear && (debtGDP > 1.75 || unemp > 0.20 || infl < -0.07 || (yld > 0.065 && debtGDP > 1.5)))
      breakYear = yr;

    const mStress = Math.max(0, yld - 0.04) * 4
      + Math.max(0, -infl) * 3 + Math.max(0, infl - 0.04) * 4
      + Math.max(0, debtGDP - 1.4) * 0.8;

    const crackdown  = (cryptoPolicy === "ban" && postBreak) ? 0.55
                     : (cryptoPolicy === "tax" && postBreak) ? 0.78 : 1.0;
    // Regime-specific flight ceiling: ban=30%, tax=50%, none/ignore=75%
    const flightCap = cryptoPolicy === "ban" ? 0.30 : cryptoPolicy === "tax" ? 0.50 : 0.75;
    cryptoFlight = Math.min(cryptoFlight + mStress * 0.022 * cAdopt * crackdown + 0.003 * cAdopt, flightCap);

    const kShift       = annDisp * 0.45;
    const flightKBoost = cryptoFlight * cAdopt * 0.12;
    labShare = Math.max(0.35, labShare - kShift - flightKBoost + e.lD * 0.025);
    capShare = Math.min(0.52, capShare + kShift * 0.55 + flightKBoost * 0.6 + e.cD * 0.025);

    const btcBase     = mStress * 0.22 * e.gM * cAdopt;
    const btcFlight   = cryptoFlight * 0.55;
    const btcVol      = (cryptoPolicy === "ban" && breakYear && yr === breakYear) ? -0.25
                      : (cryptoPolicy === "tax" && breakYear && yr === breakYear) ? -0.08 : 0;
    const btcRecovery = (cryptoPolicy === "ban" && breakYear && yr > breakYear) ? 0.18 * cAdopt
                      : (cryptoPolicy === "tax" && breakYear && yr > breakYear) ? 0.06 * cAdopt : 0;
    bitcoin = Math.min(bitcoin * (1 + Math.min(btcBase + btcFlight, 0.80) + btcVol + btcRecovery + 0.02), 5000000);

    const rowData = {
      year: yr,
      debtGDP:     +(debtGDP * 100).toFixed(1),
      unemp:       +(unemp * 100).toFixed(1),
      infl:        +(infl * 100).toFixed(1),
      yld:         +(yld * 100).toFixed(2),
      bitcoin:     Math.round(bitcoin),
      cryptoFlight:+(cryptoFlight * 100).toFixed(1),
      labShare:    +(labShare * 100).toFixed(1),
      capShare:    +(capShare * 100).toFixed(1),
    };
    rowData.spiceLevel = simSpiceLevel(rowData);
    rows.push(rowData);
  }

  const firstYear    = [0,1,2,3,4].map(lvl => { const r = rows.find(r => r.spiceLevel >= lvl); return r ? r.year : null; });
  const firstRedYear = firstYear[4];
  return { rows, firstYear, firstRedYear };
}

// ─── KPI CRITICALITY COLORS ────────────────────────────────────────────────

export function kpiColor(type, v, debt) {
  const G = "#16a34a", Y = "#ca8a04", O = "#ea580c", R = "#dc2626";
  if (type === "debt")   return v >= 175 ? R : v >= 150 ? O : v >= 120 ? Y : G;
  if (type === "unemp")  return v >= 20  ? R : v >= 12  ? O : v >= 8   ? Y : G;
  if (type === "infl")   return (v >= 15 || v <= -7) ? R : (v >= 10 || v <= -4) ? O : (v >= 6 || v <= -2) ? Y : G;
  if (type === "yld")    return (v >= 10 || (v >= 7 && (debt ?? 0) >= 150)) ? R : v >= 6 ? O : v >= 5 ? Y : G;
  if (type === "crypto") return v >= 60  ? R : v >= 40  ? O : v >= 20  ? Y : G;
  if (type === "labour") return v <= 40  ? R : v <= 47  ? O : v <= 53  ? Y : G;
  if (type === "gini")   return v >= 0.60 ? R : v >= 0.55 ? O : v >= 0.50 ? Y : G;
  return "#111";
}

// ─── SHARED SIM STATE (persists across page navigation) ────────────────────

const SIM_STATE_KEY = "spice_sim_state";

export function loadSimState() {
  try {
    const raw = localStorage.getItem(SIM_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveSimState(state) {
  try { localStorage.setItem(SIM_STATE_KEY, JSON.stringify(state)); } catch {}
}

// ─── HUMAN IMPACT SHARED HELPERS ───────────────────────────────────────────

export const IMPACT_GROUPS = [
  { key:"lowIncome",   label:"Low-Income Service Workers",  sub:"<$35k  ·  gig / retail / care  ·  renter" },
  { key:"middleClass", label:"Middle-Class Salary Workers", sub:"$35k–$100k  ·  mortgaged  ·  401k" },
  { key:"affluent",    label:"Affluent Professionals",      sub:"$100k–$500k  ·  equity portfolios  ·  real estate" },
  { key:"retirees",    label:"Retirees & Fixed-Income",     sub:"65+  ·  bonds / pensions  ·  Social Security" },
];

const CACHE_PREFIX = "spice_impact_v1_";

export function impactCacheKey(r) {
  const r1 = v => Math.round(v * 10) / 10;
  return `${CACHE_PREFIX}${r.year}-${r1(r.debtGDP)}-${r1(r.unemp)}-${r1(r.infl)}-${Math.round(r.yld * 100) / 100}-${r1(r.cryptoFlight)}-${r1(r.labShare)}-${r1(r.capShare)}`;
}

export function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > 90 * 24 * 60 * 60 * 1000) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

export function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k));
    }
  }
}

// Parse structured AI response (sections separated by blank lines, • bullets)
export function parseAnalysis(text) {
  if (!text) return null;
  return text.trim().split(/\n\n+/).map(block => {
    const lines = block.trim().split("\n").filter(Boolean);
    const heading = lines[0].replace(/^[#*\s]+|[#*\s]+$/g, "").trim();
    const bullets = lines.slice(1).map(l => l.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);
    return { heading, bullets };
  }).filter(s => s.heading && s.bullets.length > 0);
}
