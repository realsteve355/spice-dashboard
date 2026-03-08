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
              The macro thesis in full — dual-economy divergence, fiscal indicators,
              policy response comparisons, and real-world monitoring signals.
            </span>
          </li>
          <li style={S.contentsItem}>
            <a href="/simulation" style={S.contentsLink}>Simulation</a>
            <span style={S.contentsDesc}>
              Interactive debt tsunami model — adjust AI displacement rate and
              government policy response; observe debt/GDP, unemployment, yields,
              and inflation trajectories to 2035.
            </span>
          </li>
          <li style={S.contentsItem}>
            <a href="/spice-methodology.html" style={S.contentsLink}>Methodology</a>
            <span style={S.contentsDesc}>
              Model assumptions, simulation formulae, parameter sources, and
              academic citations.
            </span>
          </li>
          <li style={S.contentsItem}>
            <a href="/dashboard" style={S.contentsLink}>Dashboard</a>
            <span style={S.contentsDesc}>
              Live testnet protocol on Base Sepolia — deposit WBTC, mint IRON tokens,
              view real-time portfolio allocation.
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
