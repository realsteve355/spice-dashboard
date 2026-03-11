import { useState, useEffect } from "react";

const HOME_LEVELS = [
  { label: "GREEN",  color: "#16a34a", bg: "#f0fdf4", desc: "System functioning within baseline parameters. No collision imminent." },
  { label: "BLUE",   color: "#3b82f6", bg: "#eff6ff", desc: "Early warning signals active. Thesis beginning to develop." },
  { label: "YELLOW", color: "#ca8a04", bg: "#fefce8", desc: "Active alert. Multiple indicators breached." },
  { label: "ORANGE", color: "#ea580c", bg: "#fff7ed", desc: "Crisis mode. Systemic stress visible across multiple domains." },
  { label: "RED",    color: "#dc2626", bg: "#fef2f2", desc: "Structural fracture. Maximum crisis positioning warranted." },
];

function CrisisLevelWidget() {
  const [cached, setCached] = useState(null);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("spice_level_cache"));
      if (s && Date.now() - s.timestamp < 24 * 60 * 60 * 1000) setCached(s);
    } catch {}
  }, []);

  if (!cached) {
    return (
      <div style={SW.widget}>
        <div style={SW.eyebrow}>SPICE CRISIS LEVEL</div>
        <div style={SW.unknown}>
          Visit <a href="/indicators" style={{ color: "#B8860B" }}>Indicators</a> to load live data
        </div>
      </div>
    );
  }

  const lm = HOME_LEVELS[cached.level];
  return (
    <div style={{ ...SW.widget, background: lm.bg, border: `1px solid ${lm.color}40` }}>
      <div style={SW.eyebrow}>SPICE CRISIS LEVEL</div>
      <div style={SW.row}>
        <span style={{ ...SW.level, color: lm.color }}>{lm.label}</span>
        <span style={SW.score}>{cached.score} / {cached.max ?? 48}</span>
      </div>
      <div style={SW.desc}>{lm.desc}</div>
      <div style={SW.links}>
        <a href="/indicators" style={{ ...SW.link, color: lm.color }}>→ Live indicators</a>
        <a href={`/portfolio?level=${cached.level}`} style={{ ...SW.link, color: lm.color }}>→ Current portfolio</a>
      </div>
    </div>
  );
}

const SW = {
  widget: {
    border: "1px solid #e2e2e2",
    padding: "16px 20px",
    marginBottom: 32,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  eyebrow: { fontSize: 9, color: "#aaa", letterSpacing: "0.15em", marginBottom: 10 },
  unknown: { fontSize: 11, color: "#aaa" },
  row: { display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 },
  level: { fontSize: 26, fontWeight: 700, letterSpacing: "0.06em" },
  score: { fontSize: 11, color: "#999" },
  desc: { fontSize: 11, color: "#555", lineHeight: 1.6, marginBottom: 10 },
  links: { display: "flex", gap: 24 },
  link: { fontSize: 10, textDecoration: "none", letterSpacing: "0.06em" },
};

export default function Home() {
  return (
    <main style={S.main}>

      <section style={S.header}>
        <h1 style={S.title}>SPICE Protocol</h1>
        <p style={S.descriptor}>
          A macro hedge thesis at the intersection of sovereign debt, AI displacement,
          and hard monetary assets
        </p>
      </section>

      <CrisisLevelWidget />

      <section style={S.section}>
        <h2 style={S.sectionLabel}>Abstract</h2>
        <p style={S.abstract}>
          This project models the structural collision between two simultaneous macro forces:
          AI-driven deflation suppressing the wage base that governments rely on for tax revenue,
          and the resulting fiscal pressure on over-indebted sovereigns to inflate their way out
          of unsustainable debt loads. The thesis holds that conventional hedges fail in this
          environment because counterparty risk and sovereign risk become the same risk.
          SPICE is a prototype on-chain protocol — holding Bitcoin, tokenised gold, and synthetic
          bond shorts — designed to benefit from the collision rather than suffer from it.
          The models and assumptions are published here for scrutiny and peer review.
        </p>
      </section>

      <section style={S.section}>
        <h2 style={S.sectionLabel}>Contents</h2>
        <ol style={S.contents}>
          <li style={S.contentsItem}>
            <a href="/collision" style={S.contentsLink}>The Collision</a>
            <span style={S.contentsDesc}>
              Interactive debt collision model — adjust AI displacement rate and
              government policy response; observe debt/GDP, unemployment, yields,
              and inflation trajectories to 2035.
            </span>
          </li>
          <li style={S.contentsItem}>
            <a href="/indicators" style={S.contentsLink}>Indicators</a>
            <span style={S.contentsDesc}>
              Twelve live macro signals across debt, unemployment, inflation, and
              crypto — each scored 0–4. Composite score determines the current
              SPICE system alert level.
            </span>
          </li>
          <li style={S.contentsItem}>
            <a href="/portfolio" style={S.contentsLink}>Portfolio</a>
            <span style={S.contentsDesc}>
              Investable universe across five crisis levels. Allocation shifts from
              capital preservation at GREEN through to maximum crisis positioning at RED.
            </span>
          </li>
          <li style={S.contentsItem}>
            <a href="/coin" style={S.contentsLink}>Coin</a>
            <span style={S.contentsDesc}>
              Live testnet protocol on Base Sepolia — connect wallet, view on-chain
              vault state and real-time portfolio allocation.
            </span>
          </li>
          <li style={S.contentsItem}>
            <a href="/spice-methodology.html" style={S.contentsLink}>Methodology</a>
            <span style={S.contentsDesc}>
              Model assumptions, simulation formulae, parameter sources, and
              academic citations.
            </span>
          </li>
        </ol>
      </section>

      <section style={S.status}>
        <h2 style={S.sectionLabel}>Status</h2>
        <p style={S.statusText}>
          Pre-launch research project. The protocol runs on Base Sepolia testnet only —
          no real assets are involved. The simulation models are under active development.
          Comments and peer review are welcome.{" "}
          <a href="/spice-methodology.html" style={S.inlineLink}>
            Read the methodology →
          </a>
        </p>
        <p style={S.disclaimer}>
          TESTNET PROTOTYPE · No real assets · Not a financial promotion ·
          Base Sepolia only · For demonstration purposes only
        </p>
      </section>

    </main>
  );
}

const S = {
  main: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "64px 40px 96px",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  header: {
    marginBottom: 56,
    paddingBottom: 32,
    borderBottom: "2px solid #E0E0E0",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: "#000000",
    margin: "0 0 12px",
  },
  descriptor: {
    fontSize: 13,
    color: "#555555",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 560,
  },
  section: {
    marginBottom: 48,
    paddingBottom: 48,
    borderBottom: "1px solid #E0E0E0",
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#B8860B",
    margin: "0 0 16px",
  },
  abstract: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 1.9,
    margin: 0,
  },
  contents: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    counterReset: "contents",
  },
  contentsItem: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: 16,
    alignItems: "baseline",
    padding: "12px 0",
    borderBottom: "1px solid #F0F0F0",
  },
  contentsLink: {
    fontSize: 13,
    fontWeight: 700,
    color: "#000000",
    textDecoration: "none",
    letterSpacing: "0.04em",
    borderBottom: "1px solid #B8860B",
    paddingBottom: 1,
  },
  contentsDesc: {
    fontSize: 12,
    color: "#555555",
    lineHeight: 1.6,
  },
  status: {
    marginBottom: 0,
  },
  statusText: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 1.8,
    margin: "0 0 20px",
  },
  inlineLink: {
    color: "#B8860B",
    textDecoration: "none",
    borderBottom: "1px solid #B8860B",
  },
  disclaimer: {
    fontSize: 10,
    color: "#999999",
    letterSpacing: "0.08em",
    margin: 0,
  },
};
