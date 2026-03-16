import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SPICE_PARAMS, LEVEL_COLORS, LEVEL_LABELS } from "../data/spice-params";

const F = "'IBM Plex Mono', monospace";
const { current: C, projection: P, meta: M } = SPICE_PARAMS;

// ─── SPICE DATA LOGO ─────────────────────────────────────────────────────────

function SPICEDataLogo({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: F }}>
      {/* Left: DEBT/GDP */}
      <div style={{ textAlign: "right", minWidth: 110 }}>
        <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
          Debt / GDP
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626" }}>{C.debt}%</div>
      </div>

      {/* Centre: SVG */}
      <div style={{ textAlign: "center" }}>
        <svg width="200" height="130" viewBox="0 0 280 175" xmlns="http://www.w3.org/2000/svg">
          <circle cx="140" cy="64" r="38" stroke={color} strokeWidth="3" fill={color} fillOpacity="0.18" />
          <line x1="42" y1="64" x2="102" y2="64" stroke="#111" strokeWidth="2.5" />
          <line x1="178" y1="64" x2="238" y2="64" stroke="#111" strokeWidth="2.5" />
          <line x1="140" y1="102" x2="140" y2="142" stroke="#111" strokeWidth="2.5" />
          <polygon points="140,148 134,136 146,136" fill="#111" />
        </svg>
        {/* Bottom: CRYPTO FLIGHT */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>
            Crypto Flight
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color }}>
            {C.crypto}%
          </div>
        </div>
      </div>

      {/* Right: AI JOBS */}
      <div style={{ textAlign: "left", minWidth: 110 }}>
        <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
          AI Jobs Lost
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#8b5cf6" }}>{C.ai}%</div>
      </div>
    </div>
  );
}

// ─── INDICATOR CARD ───────────────────────────────────────────────────────────

function IndicatorCard({ name, value, unit, trend, status, statusText, projection }) {
  const trendSymbol = { up: "↗", down: "↘", flat: "→" }[trend] ?? "→";
  const statusStyle = {
    green:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    yellow: { bg: "#fefce8", color: "#92400e", border: "#fde68a" },
    orange: { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
    red:    { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  }[status] ?? { bg: "#f9fafb", color: "#555", border: "#e2e2e2" };

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e2e2", padding: "18px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>{name}</div>
        <div style={{ fontSize: 14, color: statusStyle.color }}>{trendSymbol}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>
        {value}{unit}
      </div>
      <div style={{ fontSize: 8, fontWeight: 700, color: statusStyle.color, background: statusStyle.bg,
        border: `1px solid ${statusStyle.border}`, padding: "3px 7px", display: "inline-block",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {statusText}
      </div>
      <div style={{ fontSize: 9, color: "#888", lineHeight: 1.5 }}>{projection}</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [cachedLevel, setCachedLevel] = useState(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("spice_level_cache"));
      if (s && Date.now() - s.timestamp < 24 * 60 * 60 * 1000) setCachedLevel(s.level);
    } catch {}
  }, []);

  // Use cached level if available; fall back to SPICE_PARAMS default (ORANGE)
  const level      = cachedLevel ?? M.currentLevel;
  const levelColor = LEVEL_COLORS[level];
  const levelLabel = LEVEL_LABELS[level];

  const INDICATORS = [
    { name: "Debt / GDP",        value: C.debt,         unit: "%",   trend: "up",   status: "yellow", statusText: "Approaching threshold", projection: `SPICE projection 2029: 175% — crisis threshold` },
    { name: "Unemployment",      value: C.unemployment, unit: "%",   trend: "flat", status: "green",  statusText: "Within baseline",       projection: `SPICE projection 2029: 10% — pre-collision surge` },
    { name: "Inflation (CPI)",   value: C.inflation,    unit: "%",   trend: "flat", status: "yellow", statusText: "Above Fed target",      projection: `SPICE projection 2029: 8% — YCC onset` },
    { name: "10Y Treasury",      value: C.yields,       unit: "%",   trend: "up",   status: "yellow", statusText: "Elevated, rising",      projection: `SPICE projection 2029: 7.8% — before YCC cap` },
    { name: "AI Displacement",   value: C.ai,           unit: "%",   trend: "up",   status: "yellow", statusText: "Early stage",           projection: `SPICE projection 2030: 35% — McKinsey base case` },
    { name: "Crypto Adoption",   value: C.crypto,       unit: "%",   trend: "up",   status: "green",  statusText: "Building",              projection: `SPICE projection 2029: 30% — crisis acceleration` },
  ];

  const TIMELINE_PHASES = [
    { years: "2026",      label: "Safe",         color: "#16a34a", desc: "Debt 122% GDP. Fed holding. AI displacement early. System functioning within baseline parameters." },
    { years: "2027–2028", label: "Elevated",     color: "#ca8a04", desc: "Debt crosses 140%. AI displacement 12–18%. Yield curve steepening. Multiple indicators breached." },
    { years: "2029",      label: "High Risk",    color: "#ea580c", desc: "Debt hits 175%. Unemployment 10%+. Bond market stress visible. Crypto flight accelerating." },
    { years: "2029–2032", label: "Crisis Window",color: "#dc2626", desc: "The Collision. YCC deployed. Debt 195–245%. AI-driven deflation prevents traditional escape routes." },
  ];

  // "WE ARE HERE" marker: 2026 = 0%, 2032 = 100%. Now = 2026 ≈ 5% from left.
  const markerPct = 5;

  return (
    <div style={{ background: "#fff", color: "#111", fontFamily: F }}>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "64px 24px 56px", background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)", borderBottom: "1px solid #e2e2e2" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* SPICE level badge */}
          <div style={{ marginBottom: 32, display: "inline-block", background: levelColor + "18",
            border: `1px solid ${levelColor}40`, padding: "6px 14px" }}>
            <span style={{ fontSize: 8, color: levelColor, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.14em" }}>
              SPICE LEVEL — {levelLabel}
              {cachedLevel === null && <span style={{ color: "#aaa", fontWeight: 400 }}> (default · visit Indicators for live data)</span>}
            </span>
          </div>

          {/* Logo data viz */}
          <div style={{ marginBottom: 36 }}>
            <SPICEDataLogo color={levelColor} />
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            The Collision Is Coming
          </h1>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, maxWidth: 720, margin: "0 auto 36px" }}>
            US sovereign debt, AI-driven deflation, and crypto-enabled capital flight are on a collision course.
            Traditional hedges will fail when the crisis IS the financial system.
            SPICE models the collision and positions for the transition.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/portfolio" style={{ display: "inline-block", background: "#B8860B", color: "#fff",
              padding: "11px 28px", fontFamily: F, fontSize: 11, fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.08em" }}>
              View Portfolio Allocation →
            </Link>
            <Link to="/collision" style={{ display: "inline-block", background: "#fff", color: "#111",
              padding: "10px 28px", fontFamily: F, fontSize: 11, fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.08em", border: "1px solid #e2e2e2" }}>
              Run Simulation →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SPICE THESIS ───────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", background: "#fafafa", borderBottom: "1px solid #e2e2e2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>
              SPICE Thesis
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Three Forces. One Collision.</div>
            <p style={{ fontSize: 11, color: "#555", lineHeight: 1.8, maxWidth: 680, margin: 0 }}>
              SPICE's base case combines the government debt trajectory, AI adoption rate, and crypto flight dynamics.
              These are fixed parameters representing our view of the most likely path — not adjustable scenarios.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              {
                icon: "📊",
                title: "Government Debt Trajectory",
                color: "#ef4444",
                rows: [
                  { label: "Current (2026)",      value: `${C.debt}% debt/GDP` },
                  { label: "Crisis threshold",    value: "175% debt/GDP" },
                  { label: "Projected crisis",    value: `${M.crisisWindow.start}` },
                  { label: "Assumption",          value: "No fiscal adjustment" },
                ],
                note: "Based on CBO projections with no policy changes. Crisis occurs when debt service exceeds tax revenue at market rates — the math breaks around 2029.",
              },
              {
                icon: "🤖",
                title: "AI Displacement Forecast",
                color: "#8b5cf6",
                rows: [
                  { label: "Current (2026)",    value: `${C.ai}% of workforce` },
                  { label: "Projected (2030)",  value: "35% of workforce" },
                  { label: "Collision trigger", value: ">15% displacement" },
                  { label: "Source",            value: "McKinsey / Goldman" },
                ],
                note: "Structural unemployment from AI drives deflation in affected sectors. This is the key constraint: the Fed cannot inflate away debt when AI is simultaneously deflating the economy.",
              },
              {
                icon: "₿",
                title: "Crypto Flight Model",
                color: "#B8860B",
                rows: [
                  { label: "Current (2026)",    value: `${C.crypto}% adoption` },
                  { label: "Crisis trigger",    value: ">40% adoption" },
                  { label: "Projected (2029)",  value: "30% — accelerating" },
                  { label: "Policy regime",     value: "Tax & Regulate" },
                ],
                note: "Once crisis hits, citizens flee to permissionless assets despite tax penalties. Government cannot enforce capital controls on self-custody Bitcoin — removing the traditional last-resort tool.",
              },
            ].map(card => (
              <div key={card.title} style={{ background: "#fff", border: "1px solid #e2e2e2", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>{card.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{card.title}</span>
                </div>
                {card.rows.map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                    padding: "6px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <span style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{row.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0f0f0",
                  fontSize: 9, color: "#999", lineHeight: 1.7, fontStyle: "italic" }}>
                  {card.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEY INDICATORS ─────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", borderBottom: "1px solid #e2e2e2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>
              Current Readings
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Key Indicators</div>
            <p style={{ fontSize: 11, color: "#555", lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
              Current values and SPICE base case projections across six critical metrics. Each tracks toward the crisis thresholds identified in the model.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
            {INDICATORS.map(ind => <IndicatorCard key={ind.name} {...ind} />)}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link to="/indicators" style={{ fontSize: 10, color: "#B8860B", textDecoration: "none",
              borderBottom: "1px solid #B8860B", letterSpacing: "0.08em" }}>
              → View live indicator analysis
            </Link>
          </div>
        </div>
      </section>

      {/* ── CRISIS TIMELINE ────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", background: "#fafafa", borderBottom: "1px solid #e2e2e2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>
              SPICE Base Case
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Estimated Crisis Progression</div>
            <p style={{ fontSize: 11, color: "#555", lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
              Based on SPICE thesis parameters and current trajectory. Crisis window 2029–2032. Timeline is sensitive to policy choices.
            </p>
          </div>

          {/* Gradient track */}
          <div style={{ position: "relative", marginBottom: 40 }}>
            <div style={{ height: 8, borderRadius: 4, background: "linear-gradient(90deg, #16a34a 0%, #16a34a 20%, #ca8a04 20%, #ca8a04 40%, #ea580c 40%, #ea580c 60%, #dc2626 60%, #dc2626 100%)" }} />
            {/* WE ARE HERE marker */}
            <div style={{ position: "absolute", top: -6, left: `${markerPct}%`, transform: "translateX(-50%)" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff",
                border: "3px solid #ea580c", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} />
              <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
                fontSize: 7, color: "#ea580c", fontWeight: 700, letterSpacing: "0.08em",
                whiteSpace: "nowrap", textTransform: "uppercase" }}>
                ← now
              </div>
            </div>
          </div>

          {/* Phase cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 32 }}>
            {TIMELINE_PHASES.map((ph, i) => (
              <div key={i} style={{ background: "#fff", border: `2px solid ${ph.color}30`, padding: "16px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: ph.color, textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 4 }}>
                  {ph.years}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 8 }}>{ph.label}</div>
                <div style={{ fontSize: 9, color: "#555", lineHeight: 1.7 }}>{ph.desc}</div>
              </div>
            ))}
          </div>

          {/* Sensitivity factors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#fff",
            border: "1px solid #e2e2e2", padding: "20px 22px" }}>
            {[
              {
                title: "⚡ Accelerates if:",
                color: "#dc2626",
                items: ["Fiscal policy loosens further", "AI adoption faster than forecast", "Government bans crypto (drives flight)", "Geopolitical shock — war, pandemic, trade war"],
              },
              {
                title: "⏸ Delays if:",
                color: "#16a34a",
                items: ["Credible fiscal consolidation enacted", "AI productivity offsets displacement", "Crypto adoption slower than expected", "Fed successfully manages yield curve"],
              },
            ].map(group => (
              <div key={group.title}>
                <div style={{ fontSize: 9, fontWeight: 700, color: group.color, textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 8 }}>
                  {group.title}
                </div>
                {group.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 9, color: "#555", lineHeight: 1.7, marginBottom: 3,
                    paddingLeft: 12, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: group.color }}>•</span>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SPICE ──────────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", borderBottom: "1px solid #e2e2e2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>
              Investment Thesis
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Why Traditional Hedges Fail</div>
            <p style={{ fontSize: 11, color: "#555", lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
              When the crisis IS the financial system, counterparty risk and sovereign risk become the same risk. Every conventional hedge has exposure to the institution that is failing.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ border: "1px solid #fecaca", background: "#fef2f2", padding: "22px 24px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 14 }}>
                The Problem — Conventional Hedges
              </div>
              {[
                ["TIPS",            "Counterparty risk — can the government pay inflation adjustments when broke?"],
                ["Gold ETFs",       "Counterparty risk — can you redeem for physical during a crisis?"],
                ["60/40 Portfolio", "Both equities and bonds crash simultaneously in a fiscal crisis"],
                ["Cash",            "Inflating at 12–15%/year under Yield Curve Control"],
                ["VIX / Options",   "Counterparty risk on the clearing house"],
              ].map(([name, reason]) => (
                <div key={name} style={{ marginBottom: 10, paddingBottom: 10,
                  borderBottom: "1px solid #fecaca" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#111", marginBottom: 2 }}>
                    <span style={{ color: "#dc2626", marginRight: 6 }}>✗</span>{name}
                  </div>
                  <div style={{ fontSize: 9, color: "#666", lineHeight: 1.6, paddingLeft: 16 }}>{reason}</div>
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", padding: "22px 24px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 14 }}>
                The Solution — Hard Asset Positioning
              </div>
              {[
                ["Physical Gold (PAXG)",     "No counterparty risk — you own the metal, not a promise"],
                ["Bitcoin (self-custody)",   "Permissionless capital exit — no government can freeze a wallet"],
                ["Bond Shorts",              "Direct hedge — benefits as yields rise and bond prices fall"],
                ["Inelastic Commodities",    "Demand persists through crisis; real asset protection"],
                ["Rates Volatility",         "Benefits from the very uncertainty being hedged against"],
              ].map(([name, reason]) => (
                <div key={name} style={{ marginBottom: 10, paddingBottom: 10,
                  borderBottom: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#111", marginBottom: 2 }}>
                    <span style={{ color: "#16a34a", marginRight: 6 }}>✓</span>{name}
                  </div>
                  <div style={{ fontSize: 9, color: "#555", lineHeight: 1.6, paddingLeft: 16 }}>{reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", background: "#fafafa", borderBottom: "1px solid #e2e2e2" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Explore SPICE Protocol</div>
          <p style={{ fontSize: 11, color: "#555", lineHeight: 1.7, marginBottom: 36 }}>
            Deep dive into the thesis, test your own assumptions, or examine the portfolio allocation.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              {
                to: "/portfolio",
                icon: "◈",
                title: "Portfolio Allocation",
                desc: "See how SPICE positions across five crisis levels — GREEN to RED. Notional allocation for any AUM.",
              },
              {
                to: "/collision",
                icon: "⚙",
                title: "Run the Simulation",
                desc: "Adjust AI displacement, fiscal policy, and monetary response. See when the collision triggers.",
              },
              {
                href: "/spice-methodology.html",
                icon: "◻",
                title: "Read the Methodology",
                desc: "Full academic treatment: model formulae, parameter sources, and citations.",
              },
            ].map(item => {
              const style = {
                display: "block", background: "#fff", border: "1px solid #e2e2e2",
                padding: "24px 20px", textDecoration: "none", textAlign: "left",
                fontFamily: F,
              };
              const inner = (
                <>
                  <div style={{ fontSize: 18, color: "#B8860B", marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: 9, color: "#666", lineHeight: 1.7 }}>{item.desc}</div>
                </>
              );
              return item.to
                ? <Link key={item.title} to={item.to} style={style}>{inner}</Link>
                : <a key={item.title} href={item.href} style={style}>{inner}</a>;
            })}
          </div>
        </div>
      </section>

      {/* ── ABSTRACT ───────────────────────────────────────────────────── */}
      <section style={{ padding: "48px 24px", borderBottom: "1px solid #e2e2e2" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#B8860B", marginBottom: 14 }}>
            Abstract
          </div>
          <p style={{ fontSize: 13, color: "#333", lineHeight: 1.9, margin: 0 }}>
            This project models the structural collision between two simultaneous macro forces:
            AI-driven deflation suppressing the wage base that governments rely on for tax revenue,
            and the resulting fiscal pressure on over-indebted sovereigns to inflate their way out
            of unsustainable debt loads. The thesis holds that conventional hedges fail in this
            environment because counterparty risk and sovereign risk become the same risk.
            SPICE is a prototype on-chain protocol — holding Bitcoin, tokenised gold, and synthetic
            bond shorts — designed to benefit from the collision rather than suffer from it.
            The models and assumptions are published here for scrutiny and peer review.
          </p>
        </div>
      </section>

      {/* ── STATUS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "40px 24px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#B8860B", marginBottom: 14 }}>
            Status
          </div>
          <p style={{ fontSize: 13, color: "#333", lineHeight: 1.8, margin: "0 0 16px" }}>
            Pre-launch research project. The protocol runs on Base Sepolia testnet only —
            no real assets are involved. The simulation models are under active development.
            Comments and peer review welcome.{" "}
            <a href="/spice-methodology.html" style={{ color: "#B8860B", textDecoration: "none", borderBottom: "1px solid #B8860B" }}>
              Read the methodology →
            </a>
          </p>
          <p style={{ fontSize: 10, color: "#999", letterSpacing: "0.08em", margin: 0 }}>
            TESTNET PROTOTYPE · No real assets · Not a financial promotion ·
            Base Sepolia only · For demonstration purposes only
          </p>
        </div>
      </section>

    </div>
  );
}
