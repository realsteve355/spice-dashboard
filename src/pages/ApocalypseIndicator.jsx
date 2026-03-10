import { useState, useEffect } from "react";

// ─── Level metadata ────────────────────────────────────────────────────────────
const LEVEL_META = [
  { id: 0, label: "GREEN",  color: "#16a34a", bg: "#f0fdf4", range: "0–8"   },
  { id: 1, label: "BLUE",   color: "#3b82f6", bg: "#eff6ff", range: "9–16"  },
  { id: 2, label: "YELLOW", color: "#ca8a04", bg: "#fefce8", range: "17–24" },
  { id: 3, label: "ORANGE", color: "#ea580c", bg: "#fff7ed", range: "25–32" },
  { id: 4, label: "RED",    color: "#dc2626", bg: "#fef2f2", range: "33–40" },
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
  if (total >= 33) return 4;
  if (total >= 25) return 3;
  if (total >= 17) return 2;
  if (total >= 9)  return 1;
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

// ─── Indicator definitions ─────────────────────────────────────────────────────
const INDICATORS = [
  {
    id: "real_yield",
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
    name: "MOVE Index",
    abbr: "Treasury market volatility",
    description:
      "Implied volatility in US Treasury options — the bond market equivalent of the VIX. Critically, MOVE spikes when sovereign debt itself is questioned. The crisis being hedged here is a bond crisis, not an equity crisis.",
    source: "FRED · BAMLMOVE",
    freq: "daily",
    thresholds: [
      { label: "Green",  range: "below 100  (calm)" },
      { label: "Blue",   range: "100 to 130  (elevated)" },
      { label: "Yellow", range: "130 to 160  (2022 rate shock peak: ~180)" },
      { label: "Orange", range: "160 to 200" },
      { label: "Red",    range: "above 200  (severe dysfunction)" },
    ],
    score: v => {
      if (v > 200) return 4;
      if (v > 160) return 3;
      if (v > 130) return 2;
      if (v > 100) return 1;
      return 0;
    },
    fetchData: async () => {
      const { v, date } = await fredGet("BAMLMOVE");
      return { value: v, display: v.toFixed(1), date };
    },
  },
  {
    id: "m2",
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
    name: "Italian BTP − Bund Spread",
    abbr: "10Y eurozone sovereign stress",
    description:
      "The premium Italy pays over Germany on 10-year debt. Europe's primary canary: Italy carries ~145% debt/GDP with limited monetary sovereignty. This spread was the defining signal during the 2011–12 eurozone crisis (peak: ~550 bps).",
    source: "stooq.com  (10ITY.B − 10DEY.B)",
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
      if (j.italy?.error)   throw new Error(`Italy: ${j.italy.error}`);
      if (j.germany?.error) throw new Error(`Germany: ${j.germany.error}`);
      const spread = (j.italy.value - j.germany.value) * 100;
      return { value: spread, display: Math.round(spread) + " bps", date: j.italy.date };
    },
  },
  {
    id: "boj",
    name: "Japan 10Y Government Yield",
    abbr: "BOJ yield curve control gauge",
    description:
      "Japan carries ~260% debt/GDP and has historically suppressed yields via YCC. Rising yields signal the BOJ is losing control — forcing a choice between hyperinflation and default. A YCC collapse triggers large repatriation of Japan's ~$1T US Treasury holdings.",
    source: "stooq.com  (10JPY.B)",
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
      if (j.japan?.error) throw new Error(`Japan: ${j.japan.error}`);
      return { value: j.japan.value, display: j.japan.value.toFixed(2) + "%", date: j.japan.date };
    },
  },
  {
    id: "btc_dom",
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
];

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

  return (
    <div style={S.page}>
      {/* Page header */}
      <div style={S.pageHeader}>
        <div style={S.eyebrow}>SPICE PROTOCOL · MACRO INTELLIGENCE</div>
        <h1 style={S.title}>Apocalypse Indicator</h1>
        <p style={S.subtitle}>
          Ten publicly-observable signals across sovereign debt stress, monetary debasement, hard asset
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
            <span style={S.scoreMax}>&thinsp;/&thinsp;40</span>
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
        </div>
      </div>

      {/* Indicator grid */}
      <div style={S.grid}>
        {INDICATORS.map(ind => (
          <IndicatorCard key={ind.id} ind={ind} state={states[ind.id]} />
        ))}
      </div>

      {/* Scoring methodology note */}
      <div style={S.methodNote}>
        <strong>Composite scoring:</strong> Each indicator contributes 0 (Green) to 4 (Red) points.
        Total: 0–8 = Green · 9–16 = Blue · 17–24 = Yellow · 25–32 = Orange · 33–40 = Red.
        Scores are independent; the system can be Red on one indicator while Green overall.
        The composite captures the breadth of stress, not depth in any single domain.
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <div>Data: Federal Reserve Economic Database (FRED) · stooq.com · CoinGecko</div>
        <div>Updated on page load · FRED series update daily, monthly, or quarterly · stooq daily · CoinGecko real-time</div>
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
