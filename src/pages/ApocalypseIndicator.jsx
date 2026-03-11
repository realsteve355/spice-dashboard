import React, { useState, useEffect } from "react";

// ─── Level metadata ────────────────────────────────────────────────────────────
const LEVEL_META = [
  { id: 0, label: "GREEN",  color: "#16a34a", bg: "#f0fdf4", range: "0–9"   },
  { id: 1, label: "BLUE",   color: "#3b82f6", bg: "#eff6ff", range: "10–19" },
  { id: 2, label: "YELLOW", color: "#ca8a04", bg: "#fefce8", range: "20–29" },
  { id: 3, label: "ORANGE", color: "#ea580c", bg: "#fff7ed", range: "30–38" },
  { id: 4, label: "RED",    color: "#dc2626", bg: "#fef2f2", range: "39–56" },
];

const COMPOSITE_DESC = [
  "Background noise. Structural debt concerns exist but the system is functioning normally.",
  "Early warning signals active. Thesis beginning to develop. Monitor closely.",
  "Active alert. Multiple indicators breached. Defensive positioning warranted.",
  "Crisis mode. Systemic stress visible across sovereign, monetary and hard asset domains.",
  "Structural fracture. IRON-to-SPICE switchover trigger under active evaluation.",
];

// ─── Composite scoring ─────────────────────────────────────────────────────────
function compositeLevel(total) {
  if (total >= 39) return 4;
  if (total >= 30) return 3;
  if (total >= 20) return 2;
  if (total >= 10) return 1;
  return 0;
}

// ─── FRED fetch helper ─────────────────────────────────────────────────────────
// Calls /api/fred (Vercel serverless proxy) to avoid CORS restrictions.
// The FRED API key lives server-side only.

async function fredGet(series, limit = 3) {
  const r = await fetch(`/api/fred?series=${series}&limit=${limit}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  if (j.error_message) throw new Error(j.error_message);
  const obs = (j.observations || []).filter(o => o.value !== ".");
  if (!obs.length) throw new Error("no data");
  return { v: parseFloat(obs[0].value), date: obs[0].date, all: obs };
}

// ─── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "debt",         label: "DEBT",         color: "#ef4444", desc: "Sovereign stress · credit markets · yield dynamics" },
  { id: "unemployment", label: "UNEMPLOYMENT",  color: "#8b5cf6", desc: "Labour market displacement · AI structural job loss" },
  { id: "inflation",    label: "INFLATION",     color: "#3b82f6", desc: "Monetary debasement · purchasing power erosion" },
  { id: "crypto",       label: "CRYPTO",        color: "#B8860B", desc: "Non-sovereign asset adoption · fiat exit signal" },
];

// ─── Indicator definitions ─────────────────────────────────────────────────────
const INDICATORS = [
  // ── DEBT ──────────────────────────────────────────────────────────────────
  {
    id: "real_yield",
    category: "debt",
    name: "US 10Y Real Yield",
    abbr: "TIPS-derived inflation-adjusted rate",
    description:
      "The real cost of US sovereign borrowing after inflation. Sustained deeply negative values signal financial repression — the government deliberately inflating away its obligations at savers' expense.",
    source: "FRED · DFII10",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "−0.5% to +2.0%  (normal range)" },
      { label: "Blue",   range: "+2.0 to +2.5%  or  −0.5 to −0.75%  (mild stress)" },
      { label: "Yellow", range: "+2.5 to +3.0%  or  −0.75 to −1.5%  (significant pressure)" },
      { label: "Orange", range: "+3.0 to +3.5%  or  −1.5 to −2.5%  (acute stress)" },
      { label: "Red",    range: "above +3.5%  or  below −2.5%  (historical extremes)" },
    ],
    score: v => {
      if (v < -2.5 || v > 3.5) return 4;
      if (v < -1.5 || v > 3.0) return 3;
      if (v < -0.75 || v > 2.5) return 2;
      if (v < -0.5 || v > 2.0) return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("DFII10");
      return { value: v, display: v.toFixed(2) + "%", date };
    },
  },
  {
    id: "yield_curve",
    category: "debt",
    name: "Yield Curve (10Y − 2Y)",
    abbr: "US Treasury term spread",
    description:
      "Spread between 10-year and 2-year US Treasury yields. Sustained inversion signals debt rollover fragility and policy error, and has preceded every US recession since the 1970s.",
    source: "FRED · T10Y2Y",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "above +1.0%  (healthy term premium)" },
      { label: "Blue",   range: "+0.5 to +1.0%  (flattening)" },
      { label: "Yellow", range: "0 to +0.5%  (near flat)" },
      { label: "Orange", range: "−1.0 to 0%  (inverted — policy stress)" },
      { label: "Red",    range: "below −1.0%  (deep inversion)" },
    ],
    score: v => {
      if (v < -1.0) return 4;
      if (v < 0)    return 3;
      if (v < 0.5)  return 2;
      if (v < 1.0)  return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("T10Y2Y");
      return { value: v, display: v.toFixed(2) + "%", date };
    },
  },
  {
    id: "breakeven",
    category: "inflation",
    name: "5Y5Y Inflation Breakeven",
    abbr: "Long-run inflation expectations",
    description:
      "Market-implied inflation expectation for the 5-year period starting 5 years from now. Captures whether sophisticated bond investors believe monetary policy will remain credible over the medium term.",
    source: "FRED · T5YIFR",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "below 2.2%  (well anchored)" },
      { label: "Blue",   range: "2.2 to 2.5%  (drifting)" },
      { label: "Yellow", range: "2.5 to 3.0%  (credibility weakening)" },
      { label: "Orange", range: "3.0 to 4.0%  (de-anchoring)" },
      { label: "Red",    range: "above 4.0%  (credibility fracture)" },
    ],
    score: v => {
      if (v > 4.0) return 4;
      if (v > 3.0) return 3;
      if (v > 2.5) return 2;
      if (v > 2.2) return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("T5YIFR");
      return { value: v, display: v.toFixed(2) + "%", date };
    },
  },
  {
    id: "move",
    category: "debt",
    name: "HY Credit Spread",
    abbr: "ICE BofA US High Yield OAS",
    description:
      "The extra yield investors demand to hold US high yield bonds over Treasuries. Spikes sharply during financial stress and sovereign credibility concerns — highly correlated with the MOVE index but reliably available via FRED.",
    source: "FRED · BAMLH0A0HYM2  (ICE BofA)",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "below 400 bps  (normal)" },
      { label: "Blue",   range: "400 to 500 bps  (mildly elevated)" },
      { label: "Yellow", range: "500 to 700 bps  (stress)" },
      { label: "Orange", range: "700 to 1000 bps  (acute stress)" },
      { label: "Red",    range: "above 1000 bps  (2020 COVID: ~1100 · 2008: ~1800)" },
    ],
    score: v => {
      if (v > 1000) return 4;
      if (v > 700)  return 3;
      if (v > 500)  return 2;
      if (v > 400)  return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("BAMLH0A0HYM2");
      return { value: v, display: v.toFixed(0) + " bps", date };
    },
  },
  {
    id: "m2",
    category: "inflation",
    name: "M2 Money Supply Growth",
    abbr: "Year-on-year change",
    description:
      "Annual growth rate of US broad money supply. When money creation persistently exceeds real output, the excess chases goods — this is the debasement thesis rendering itself visible in real time.",
    source: "FRED · M2SL",
    freq: "monthly",
    thresholds: [
      { label: "Green",  range: "below 5% YoY" },
      { label: "Blue",   range: "5 to 10% YoY" },
      { label: "Yellow", range: "10 to 15% YoY" },
      { label: "Orange", range: "15 to 20% YoY" },
      { label: "Red",    range: "above 20% YoY  (COVID 2020 peak: +25%)" },
    ],
    score: v => {
      if (v > 20) return 4;
      if (v > 15) return 3;
      if (v > 10) return 2;
      if (v > 5)  return 1;
      return 0;
    },
    fetchData: async () => {
      const { all } = await fredGet("M2SL", 15);
      if (all.length < 13) throw new Error("insufficient history");
      const current = parseFloat(all[0].value);
      const prior   = parseFloat(all[12].value);
      const yoy = ((current - prior) / prior) * 100;
      return { value: yoy, display: yoy.toFixed(1) + "%", date: all[0].date };
    },
  },
  {
    id: "debt_gdp",
    category: "debt",
    name: "US Federal Debt / GDP",
    abbr: "Sovereign debt sustainability",
    description:
      "Total US public debt as a percentage of GDP. The base vulnerability metric for the entire SPICE thesis. Already in Orange territory. Above 140% is the Reinhart-Rogoff historical danger zone.",
    source: "FRED · GFDEGDQ188S",
    freq: "quarterly",
    thresholds: [
      { label: "Green",  range: "below 80%" },
      { label: "Blue",   range: "80 to 100%" },
      { label: "Yellow", range: "100 to 120%" },
      { label: "Orange", range: "120 to 140%  (current)" },
      { label: "Red",    range: "above 140%  (Reinhart-Rogoff danger zone)" },
    ],
    score: v => {
      if (v > 140) return 4;
      if (v > 120) return 3;
      if (v > 100) return 2;
      if (v > 80)  return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("GFDEGDQ188S");
      return { value: v, display: v.toFixed(1) + "%", date };
    },
  },
  {
    id: "dxy",
    category: "inflation",
    name: "Broad US Dollar Index",
    abbr: "Trade-weighted dollar strength",
    description:
      "Trade-weighted nominal US dollar index (Jan 2006 = 100). A sustained fall during elevated debt and inflation signals capital flight from dollar assets — fiat credibility erosion made visible in FX markets.",
    source: "FRED · DTWEXBGS",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "above 118  (strong dollar)" },
      { label: "Blue",   range: "110 to 118" },
      { label: "Yellow", range: "102 to 110" },
      { label: "Orange", range: "94 to 102" },
      { label: "Red",    range: "below 94  (rapid debasement signal)" },
    ],
    score: v => {
      if (v < 94)  return 4;
      if (v < 102) return 3;
      if (v < 110) return 2;
      if (v < 118) return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("DTWEXBGS");
      return { value: v, display: v.toFixed(2), date };
    },
  },
  {
    id: "btp_bund",
    category: "debt",
    name: "Italian BTP − Bund Spread",
    abbr: "10Y eurozone sovereign stress",
    description:
      "The premium Italy pays over Germany on 10-year debt. Europe's primary canary: Italy carries ~145% debt/GDP with limited monetary sovereignty. This spread was the defining signal during the 2011–12 eurozone crisis (peak: ~550 bps).",
    source: "Yahoo Finance · daily  (FRED OECD fallback)",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "below 150 bps" },
      { label: "Blue",   range: "150 to 250 bps" },
      { label: "Yellow", range: "250 to 350 bps" },
      { label: "Orange", range: "350 to 500 bps" },
      { label: "Red",    range: "above 500 bps  (2011 crisis peak: ~550 bps)" },
    ],
    score: v => {
      if (v > 500) return 4;
      if (v > 350) return 3;
      if (v > 250) return 2;
      if (v > 150) return 1;
      return 0;
    },
    fetchData: async () => {
      const r = await fetch("/api/bond-yields");
      if (!r.ok) throw new Error(`API HTTP ${r.status}`);
      const j = await r.json();
      if (j.italy?.error)   throw new Error(j.italy.error);
      if (j.germany?.error) throw new Error(j.germany.error);
      const spread = (j.italy.value - j.germany.value) * 100;
      return { value: spread, display: Math.round(spread) + " bps", date: j.italy.date };
    },
  },
  {
    id: "boj",
    category: "debt",
    name: "Japan 10Y Government Yield",
    abbr: "BOJ yield curve control gauge",
    description:
      "Japan carries ~260% debt/GDP and has historically suppressed yields via YCC. Rising yields signal the BOJ is losing control — forcing a choice between hyperinflation and default. A YCC collapse triggers large repatriation of Japan's ~$1T US Treasury holdings.",
    source: "Yahoo Finance · daily  (FRED OECD fallback)",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "below 1.0%  (YCC territory)" },
      { label: "Blue",   range: "1.0 to 1.5%" },
      { label: "Yellow", range: "1.5 to 2.0%  (YCC under pressure)" },
      { label: "Orange", range: "2.0 to 2.5%" },
      { label: "Red",    range: "above 2.5%  (YCC collapse / free float)" },
    ],
    score: v => {
      if (v > 2.5) return 4;
      if (v > 2.0) return 3;
      if (v > 1.5) return 2;
      if (v > 1.0) return 1;
      return 0;
    },
    fetchData: async () => {
      const r = await fetch("/api/bond-yields");
      if (!r.ok) throw new Error(`API HTTP ${r.status}`);
      const j = await r.json();
      if (j.japan?.error) throw new Error(j.japan.error);
      return { value: j.japan.value, display: j.japan.value.toFixed(2) + "%", date: j.japan.date };
    },
  },
  {
    id: "btc_dom",
    category: "crypto",
    name: "Bitcoin Dominance",
    abbr: "Crypto fiat-exit signal",
    description:
      "BTC share of total crypto market cap. Rising dominance outside altcoin bull markets signals capital concentrating into the hardest non-sovereign asset. A leading indicator of fiat credibility fracture at the system level.",
    source: "CoinGecko · /api/v3/global",
    freq: "real-time",
    thresholds: [
      { label: "Green",  range: "40 to 55%  (normal market conditions)" },
      { label: "Blue",   range: "55 to 60%  (risk-off rotation into BTC)" },
      { label: "Yellow", range: "60 to 65%  (flight to crypto safety)" },
      { label: "Orange", range: "65 to 70%  (clear derisking into BTC)" },
      { label: "Red",    range: "above 70%  (structural fiat alternative adoption)" },
    ],
    score: v => {
      if (v > 70) return 4;
      if (v > 65) return 3;
      if (v > 60) return 2;
      if (v > 55) return 1;
      return 0;
    },
    fetchData: async () => {
      const r = await fetch("https://api.coingecko.com/api/v3/global");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const dom = j.data.market_cap_percentage.btc;
      return {
        value: dom,
        display: dom.toFixed(1) + "%",
        date: new Date().toISOString().split("T")[0],
      };
    },
  },
  {
    id: "crypto_mcap",
    category: "crypto",
    name: "Total Crypto Market Cap",
    abbr: "Non-sovereign asset adoption scale",
    description:
      "Total market capitalisation of all crypto assets in USD. Growth at scale signals capital rotation away from fiat-denominated instruments. Viewed alongside BTC dominance, it distinguishes between speculative altcoin cycles and genuine fiat exit behaviour.",
    source: "CoinGecko · /api/v3/global",
    freq: "real-time",
    thresholds: [
      { label: "Green",  range: "below $1T  (nascent asset class)" },
      { label: "Blue",   range: "$1T to $2T  (growing adoption)" },
      { label: "Yellow", range: "$2T to $4T  (mainstream asset class)" },
      { label: "Orange", range: "$4T to $7T  (systemic fiat competition)" },
      { label: "Red",    range: "above $7T  (structural fiat displacement)" },
    ],
    score: v => {
      const t = v / 1e12;
      if (t > 7) return 4;
      if (t > 4) return 3;
      if (t > 2) return 2;
      if (t > 1) return 1;
      return 0;
    },
    fetchData: async () => {
      const r = await fetch("https://api.coingecko.com/api/v3/global");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const mcap = j.data.total_market_cap.usd;
      const t = mcap / 1e12;
      return {
        value: mcap,
        display: "$" + t.toFixed(2) + "T",
        date: new Date().toISOString().split("T")[0],
      };
    },
  },

  // ── UNEMPLOYMENT ──────────────────────────────────────────────────────────
  {
    id: "unemployment",
    category: "unemployment",
    name: "US Unemployment Rate",
    abbr: "Civilian unemployment",
    description:
      "The share of the labour force without work. In the SPICE thesis, rising unemployment signals AI displacement is materialising — compressing the tax base, expanding social spending, and compounding the fiscal deficit.",
    source: "FRED · UNRATE",
    freq: "monthly",
    thresholds: [
      { label: "Green",  range: "below 4.5%  (tight labour market)" },
      { label: "Blue",   range: "4.5 to 6%  (softening)" },
      { label: "Yellow", range: "6 to 8%  (labour market stress)" },
      { label: "Orange", range: "8 to 12%  (significant displacement)" },
      { label: "Red",    range: "above 12%  (structural unemployment crisis)" },
    ],
    score: v => {
      if (v > 12)  return 4;
      if (v > 8)   return 3;
      if (v > 6)   return 2;
      if (v > 4.5) return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("UNRATE");
      return { value: v, display: v.toFixed(1) + "%", date };
    },
  },
  {
    id: "jolts",
    category: "unemployment",
    name: "Job Openings (JOLTS)",
    abbr: "Forward-looking labour demand",
    description:
      "Total nonfarm job vacancies reported by US employers. A leading indicator of future unemployment: when openings fall sharply, hiring freezes precede layoffs by 3–6 months. Structural AI displacement would first appear as a sustained collapse in vacancy levels before showing up in the unemployment rate.",
    source: "FRED · JTSJOL",
    freq: "monthly",
    thresholds: [
      { label: "Green",  range: "above 8M  (tight labour market)" },
      { label: "Blue",   range: "6M to 8M  (softening demand)" },
      { label: "Yellow", range: "4M to 6M  (hiring slowdown)" },
      { label: "Orange", range: "2M to 4M  (structural demand collapse)" },
      { label: "Red",    range: "below 2M  (labour market fracture)" },
    ],
    score: v => {
      if (v < 2000) return 4;
      if (v < 4000) return 3;
      if (v < 6000) return 2;
      if (v < 8000) return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("JTSJOL");
      return { value: v, display: (v / 1000).toFixed(1) + "M", date };
    },
  },

  // ── INFLATION (additional) ────────────────────────────────────────────────
  {
    id: "cpi",
    category: "inflation",
    name: "US CPI Inflation",
    abbr: "Year-on-year consumer prices",
    description:
      "Annual change in US consumer prices. Scored two-tailed: both hyperinflation (government monetising debt) and deflation (AI structural price collapse → Fisher debt-deflation spiral) are crisis signals for the SPICE thesis.",
    source: "FRED · CPIAUCSL",
    freq: "monthly",
    thresholds: [
      { label: "Green",  range: "1.5 to 3.5%  (near-target, controlled)" },
      { label: "Blue",   range: "3.5 to 5%  or  1 to 1.5%  (drifting)" },
      { label: "Yellow", range: "5 to 7%  or  0 to 1%  (concerning)" },
      { label: "Orange", range: "7 to 9%  or  negative  (acute in either direction)" },
      { label: "Red",    range: "above 9%  or  below −2%  (hyperinflation or deflation spiral)" },
    ],
    score: v => {
      if (v > 9   || v < -2)  return 4;
      if (v > 7   || v < 0)   return 3;
      if (v > 5   || v < 1)   return 2;
      if (v > 3.5 || v < 1.5) return 1;
      return 0;
    },
    fetchData: async () => {
      const { all } = await fredGet("CPIAUCSL", 15);
      if (all.length < 13) throw new Error("insufficient history");
      const current = parseFloat(all[0].value);
      const prior   = parseFloat(all[12].value);
      const yoy = ((current - prior) / prior) * 100;
      return { value: yoy, display: yoy.toFixed(1) + "%", date: all[0].date };
    },
  },
];

// ─── Category header ───────────────────────────────────────────────────────────
function CategoryHeader({ cat }) {
  return (
    <div style={{ gridColumn: "1 / -1", ...SC.catWrap }}>
      <span style={{ ...SC.catLabel, color: cat.color }}>{cat.label}</span>
      <span style={SC.catDesc}>{cat.desc}</span>
    </div>
  );
}

const SC = {
  catWrap: {
    display: "flex",
    alignItems: "baseline",
    gap: 16,
    paddingBottom: 8,
    borderBottom: "1px solid #e2e2e2",
    marginBottom: 4,
    marginTop: 24,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.15em",
  },
  catDesc: {
    fontSize: 10,
    color: "#aaa",
    letterSpacing: "0.04em",
  },
};

// ─── Indicator card ────────────────────────────────────────────────────────────
function IndicatorCard({ ind, state }) {
  const { status, display, date, score, error } = state;
  const lm = score !== null ? LEVEL_META[score] : null;

  return (
    <div style={{ ...S.card, borderTop: `3px solid ${lm ? lm.color : "#e2e2e2"}` }}>
      {/* Header row */}
      <div style={S.cardHead}>
        <div>
          <div style={S.cardName}>{ind.name}</div>
          <div style={S.cardAbbr}>{ind.abbr}</div>
        </div>
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          {status === "loading" && (
            <span style={S.badgeLoading}>LOADING</span>
          )}
          {status === "error" && (
            <span style={S.badgeError} title={error}>ERROR</span>
          )}
          {lm && (
            <span style={{
              ...S.badge,
              background: lm.bg,
              color: lm.color,
              border: `1px solid ${lm.color}50`,
            }}>
              {lm.label}
            </span>
          )}
        </div>
      </div>

      {/* Value */}
      <div style={S.cardValue}>
        {status === "loading" && <span style={{ color: "#ddd" }}>—</span>}
        {status === "error"   && (
          <span style={{ fontSize: 13, color: "#ef4444" }} title={error}>
            data unavailable
          </span>
        )}
        {status === "ok" && (
          <span style={{ color: lm?.color || "#111" }}>{display}</span>
        )}
      </div>

      {/* Score */}
      {score !== null && (
        <div style={S.scorePill}>indicator score {score} / 4</div>
      )}

      {/* Threshold bar — 5 equal segments, current level highlighted */}
      <div style={S.threshBar}>
        {LEVEL_META.map((l, i) => (
          <div
            key={i}
            title={ind.thresholds[i]?.range}
            style={{
              flex: 1,
              height: 6,
              background: i === score ? l.color : "#e8e8e8",
              borderRadius:
                i === 0 ? "3px 0 0 3px" : i === 4 ? "0 3px 3px 0" : 0,
            }}
          />
        ))}
      </div>

      {/* Current threshold description */}
      {score !== null ? (
        <div style={S.threshText}>{ind.thresholds[score]?.range}</div>
      ) : (
        <div style={{ ...S.threshText, color: "#ddd" }}>—</div>
      )}

      {/* Description */}
      <div style={S.cardDesc}>{ind.description}</div>

      {/* Footer */}
      <div style={S.cardFoot}>
        <span>{ind.source}</span>
        {date && <span>· {date}</span>}
        <span>· {ind.freq}</span>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ApocalypseIndicator() {
  const [states, setStates] = useState(() =>
    Object.fromEntries(
      INDICATORS.map(i => [
        i.id,
        { status: "loading", value: null, display: null, date: null, score: null, error: null },
      ])
    )
  );

  useEffect(() => {
    INDICATORS.forEach(ind => {
      ind
        .fetchData()
        .then(({ value, display, date }) => {
          setStates(prev => ({
            ...prev,
            [ind.id]: { status: "ok", value, display, date, score: ind.score(value), error: null },
          }));
        })
        .catch(err => {
          setStates(prev => ({
            ...prev,
            [ind.id]: {
              status: "error",
              value: null,
              display: null,
              date: null,
              score: null,
              error: err.message,
            },
          }));
        });
    });
  }, []);

  // Composite score from all indicators that have loaded successfully
  const loaded = INDICATORS.map(i => states[i.id]).filter(s => s.score !== null);
  const totalScore = loaded.reduce((sum, s) => sum + s.score, 0);
  const cl = compositeLevel(totalScore);
  const lm = LEVEL_META[cl];

  // Persist level to localStorage so Portfolio + Home page can read it
  useEffect(() => {
    if (loaded.length < INDICATORS.length) return;
    try {
      localStorage.setItem("spice_level_cache", JSON.stringify({
        level: cl, score: totalScore, max: INDICATORS.length * 4, timestamp: Date.now(),
      }));
    } catch {}
  }, [cl, totalScore, loaded.length]);

  return (
    <div style={S.page}>
      {/* Page header */}
      <div style={S.pageHeader}>
        <div style={S.eyebrow}>SPICE PROTOCOL · MACRO INTELLIGENCE</div>
        <h1 style={S.title}>Indicators</h1>
        <p style={S.subtitle}>
          Twelve publicly-observable signals across sovereign debt stress, monetary debasement, hard asset
          behaviour, and crypto adoption. Each indicator scores 0–4; composite score determines system
          alert level. Thresholds are calibrated to the collision thesis — not to cyclical recession risk.
        </p>
      </div>

      {/* Composite banner */}
      <div style={{ ...S.banner, borderColor: lm.color, background: lm.bg }}>
        <div style={S.bannerLeft}>
          <div style={S.bannerEyebrow}>SYSTEM ALERT LEVEL</div>
          <div style={{ ...S.bannerLevel, color: lm.color }}>{lm.label}</div>
          <div style={S.bannerDesc}>{COMPOSITE_DESC[cl]}</div>
        </div>
        <div style={S.bannerRight}>
          <div style={{ marginBottom: 2 }}>
            <span style={{ ...S.scoreBig, color: lm.color }}>{totalScore}</span>
            <span style={S.scoreMax}>&thinsp;/&thinsp;{INDICATORS.length * 4}</span>
          </div>
          <div style={S.scoreSub}>
            composite score · {loaded.length}/{INDICATORS.length} indicators loaded
          </div>
          {/* Level progress bar */}
          <div style={S.progressBar}>
            {LEVEL_META.map((l, i) => (
              <div
                key={l.id}
                title={`${l.label} · ${l.range}`}
                style={{
                  height: 10,
                  flex: 1,
                  background: i <= cl ? l.color : "#e2e2e2",
                  opacity: i === cl ? 1 : i < cl ? 0.55 : 0.25,
                  borderRadius:
                    i === 0 ? "3px 0 0 3px" : i === 4 ? "0 3px 3px 0" : 0,
                }}
              />
            ))}
          </div>
          <div style={S.progressLabels}>
            {LEVEL_META.map(l => (
              <span
                key={l.id}
                style={{
                  ...S.progressLabel,
                  color: cl === l.id ? l.color : "#bbb",
                  fontWeight: cl === l.id ? 700 : 400,
                }}
              >

                {l.label}
              </span>
            ))}
          </div>
          {loaded.length > 0 && (
            <div style={{ textAlign: "right", marginTop: 10 }}>
              <a
                href={`/portfolio?level=${cl}`}
                style={{ fontSize: 10, color: lm.color, textDecoration: "none", letterSpacing: "0.06em" }}
              >
                → View {lm.label} portfolio
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Indicator grid — grouped by category */}
      <div style={S.grid}>
        {CATEGORIES.map(cat => (
          <React.Fragment key={cat.id}>
            <CategoryHeader cat={cat} />
            {INDICATORS.filter(i => i.category === cat.id).map(ind => (
              <IndicatorCard key={ind.id} ind={ind} state={states[ind.id]} />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Scoring methodology note */}
      <div style={S.methodNote}>
        <strong>Composite scoring:</strong> Each indicator contributes 0 (Green) to 4 (Red) points.
        {INDICATORS.length} indicators; max score {INDICATORS.length * 4}.
        Bands: 0–9 = Green · 10–19 = Blue · 20–29 = Yellow · 30–38 = Orange · 39+ = Red.
        Scores are independent; the system can be Red on one indicator while Green overall.
        The composite captures the breadth of stress, not depth in any single domain.
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <div>Data: Federal Reserve Economic Database (FRED) · Yahoo Finance · CoinGecko</div>
        <div>Updated on page load · FRED series update daily, monthly, or quarterly · CoinGecko real-time</div>
        <div>Scoring methodology based on consensus of Claude, ChatGPT, Gemini and Grok analysis, March 2026</div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "48px 40px 80px",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  pageHeader: {
    borderBottom: "1px solid #e2e2e2",
    paddingBottom: 32,
    marginBottom: 40,
  },
  eyebrow: {
    fontSize: 10,
    color: "#B8860B",
    letterSpacing: "0.15em",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 14px",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    lineHeight: 1.75,
    maxWidth: 700,
    margin: 0,
  },
  // Banner
  banner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "28px 32px",
    border: "2px solid",
    marginBottom: 40,
    gap: 48,
  },
  bannerLeft: { flex: 1 },
  bannerEyebrow: {
    fontSize: 10,
    color: "#999",
    letterSpacing: "0.15em",
    marginBottom: 8,
  },
  bannerLevel: {
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: "0.08em",
    marginBottom: 12,
  },
  bannerDesc: {
    fontSize: 12,
    color: "#444",
    lineHeight: 1.7,
    maxWidth: 480,
  },
  bannerRight: {
    textAlign: "right",
    minWidth: 230,
  },
  scoreBig: {
    fontSize: 54,
    fontWeight: 700,
    lineHeight: 1,
  },
  scoreMax: {
    fontSize: 22,
    color: "#aaa",
  },
  scoreSub: {
    fontSize: 10,
    color: "#aaa",
    letterSpacing: "0.06em",
    marginBottom: 18,
  },
  progressBar: {
    display: "flex",
    gap: 2,
    marginBottom: 6,
  },
  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 8,
    letterSpacing: "0.08em",
  },
  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  // Cards
  card: {
    border: "1px solid #e2e2e2",
    padding: "20px 22px 16px",
    background: "#fff",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111",
    marginBottom: 3,
  },
  cardAbbr: {
    fontSize: 9,
    color: "#aaa",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  badge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    borderRadius: 2,
  },
  badgeLoading: {
    fontSize: 9,
    color: "#ccc",
    letterSpacing: "0.1em",
  },
  badgeError: {
    fontSize: 9,
    color: "#ef4444",
    letterSpacing: "0.1em",
    cursor: "help",
  },
  cardValue: {
    fontSize: 34,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    marginBottom: 4,
    minHeight: 44,
  },
  scorePill: {
    fontSize: 10,
    color: "#999",
    marginBottom: 10,
  },
  threshBar: {
    display: "flex",
    gap: 2,
    marginBottom: 6,
  },
  threshText: {
    fontSize: 10,
    color: "#666",
    marginBottom: 14,
    minHeight: 16,
  },
  cardDesc: {
    fontSize: 11,
    color: "#555",
    lineHeight: 1.65,
    marginBottom: 14,
  },
  cardFoot: {
    fontSize: 9,
    color: "#bbb",
    letterSpacing: "0.04em",
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    paddingTop: 10,
    borderTop: "1px solid #f0f0f0",
  },
  // Method note
  methodNote: {
    marginTop: 40,
    padding: "18px 22px",
    background: "#fafafa",
    border: "1px solid #e2e2e2",
    fontSize: 11,
    color: "#555",
    lineHeight: 1.75,
  },
  // No key warning
  noKey: {
    maxWidth: 560,
    margin: "60px auto",
    padding: 36,
    border: "1px solid #e2e2e2",
  },
  noKeyTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    letterSpacing: "0.1em",
    marginBottom: 16,
  },
  // Footer
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: "1px solid #e2e2e2",
    fontSize: 10,
    color: "#aaa",
    lineHeight: 2,
    letterSpacing: "0.04em",
  },
};
