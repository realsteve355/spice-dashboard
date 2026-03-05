import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  return (
    <main style={S.main}>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.eyebrow}>BASE SEPOLIA TESTNET · PROTOTYPE</div>
          <h1 style={S.h1}>
            THE WORLD IS HEADING<br />
            FOR <span style={S.gold}>A COLLISION.</span>
          </h1>
          <p style={S.heroSub}>
            AI-driven deflation is destroying the tax base governments need to service
            their debts. The only exit is inflation. Both forces are building simultaneously.
            When they collide, conventional hedges fail.
          </p>
          <div style={S.heroCta}>
            <button style={S.btnPrimary} onClick={() => nav("/collision")}>
              Explore The Collision Model →
            </button>
            <button style={S.btnSecondary} onClick={() => nav("/dashboard")}>
              View Live Protocol
            </button>
          </div>
        </div>
        <div style={S.heroRight}>
          <CollisionDiagram />
        </div>
      </section>

      {/* Three pillars */}
      <section style={S.pillars}>
        <Pillar
          number="01"
          title="The Deflation Force"
          color="#3388CC"
          text="AI and automation are collapsing the cost of labour and goods. Consumer prices fall. Tax revenues collapse. Governments face a structural funding crisis with no cyclical solution."
        />
        <Pillar
          number="02"
          title="The Inflation Response"
          color="#CC4444"
          text="Governments with unsustainable debt loads have one exit: inflate it away. Quantitative easing, yield curve control, debt monetisation. The response is predictable and inevitable."
        />
        <Pillar
          number="03"
          title="The Crisis Hedge"
          color="#B8860B"
          text="SPICE holds Bitcoin, tokenised gold, and synthetic shorts on long-dated treasuries — assets that benefit from the collision rather than suffer from it. No counterparty. No trust required."
        />
      </section>

      {/* Why conventional hedges fail */}
      <section style={S.section}>
        <h2 style={S.h2}>Why Conventional Hedges Fail</h2>
        <p style={S.body}>
          TIPS, gold ETFs, equity puts, VIX — every conventional hedge fails in a structural
          sovereign debt crisis because counterparty risk IS the system itself. The institutions
          that guarantee these instruments are the institutions in crisis.
        </p>
        <div style={S.failGrid}>
          <FailItem hedge="TIPS" reason="Issued by the government in crisis. CPI can be redefined." />
          <FailItem hedge="Gold ETFs" reason="Custodied by banks in the failing system. Paper claim, not metal." />
          <FailItem hedge="Equity Puts" reason="Counterparty is a broker in a failing financial system." />
          <FailItem hedge="VIX" reason="Cyclical hedge. Structural crises look calm until they don't." />
          <FailItem hedge="Cash" reason="Directly inflated away. That's the whole point of the response." />
          <FailItem hedge="Bonds" reason="The asset being shorted. Duration risk is the exposure." />
        </div>
      </section>

      {/* What SPICE holds */}
      <section style={S.section}>
        <h2 style={S.h2}>What SPICE Holds Instead</h2>
        <p style={S.body}>
          Every position in the SPICE portfolio is held on-chain, publicly verifiable in real time.
          No trust required. No manager letter. Just code.
        </p>
        <div style={S.holdGrid}>
          <HoldItem
            asset="Bitcoin (BTC)"
            color="#F7931A"
            pct="~40%"
            why="Scarce, decentralised, no sovereign issuer. Survives the system it exits."
          />
          <HoldItem
            asset="Tokenised Gold (PAXG)"
            color="#B8860B"
            pct="~35%"
            why="Physical gold custody. No paper claim. 5,000 years of monetary history."
          />
          <HoldItem
            asset="Synthetic Bond Short"
            color="#2E8B7A"
            pct="~25%"
            why="Direct short on long-dated treasuries. Pays out when the crisis hits hardest."
          />
        </div>
      </section>

      {/* Protocol mechanics */}
      <section style={S.section}>
        <h2 style={S.h2}>Protocol Mechanics</h2>
        <div style={S.mechGrid}>
          <MechItem step="1" title="Deposit WBTC" text="Investors deposit Wrapped Bitcoin. Smart contract mints IRON tokens at current NAV. Instant. On-chain. No intermediary." />
          <MechItem step="2" title="Fund Allocates" text="WBTC is deployed across the three positions. Every allocation is visible on-chain in real time." />
          <MechItem step="3" title="Crisis Triggers" text="When macro indicators breach threshold — debt/GDP, yield spreads, monetary base — the protocol transitions to Phase 2 automatically." />
          <MechItem step="4" title="Phase 2: Trust Mode" text="Minting closes. IRON becomes a closed-end investment trust. Secondary market trading only. The portfolio now runs as a crisis hedge fund." />
        </div>
      </section>

      {/* CTA */}
      <section style={S.cta}>
        <h2 style={S.h2}>Explore The Thesis</h2>
        <p style={S.body}>
          The interactive collision model lets you adjust the pace of AI adoption,
          government debt levels, and monetary policy responses — and see how each
          scenario affects the crisis timeline and SPICE portfolio.
        </p>
        <div style={S.ctaButtons}>
          <button style={S.btnPrimary} onClick={() => nav("/collision")}>
            Open The Collision Model →
          </button>
          <button style={S.btnSecondary} onClick={() => nav("/dashboard")}>
            Connect Wallet & Explore Protocol
          </button>
        </div>
        <p style={S.disclaimer}>
          TESTNET PROTOTYPE · No real assets · Not a financial promotion ·
          Base Sepolia only · For demonstration purposes only
        </p>
      </section>

    </main>
  );
}

// ── Collision diagram SVG ─────────────────────────────────────────
function CollisionDiagram() {
  return (
    <svg viewBox="0 0 400 320" style={{ width: "100%", maxWidth: 400 }}>
      {/* Background glow */}
      <defs>
        <radialGradient id="explosion" cx="50%" cy="45%" r="30%">
          <stop offset="0%" stopColor="#B8860B" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blueGlow" cx="20%" cy="45%" r="25%">
          <stop offset="0%" stopColor="#3388CC" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3388CC" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="redGlow" cx="80%" cy="45%" r="25%">
          <stop offset="0%" stopColor="#CC4444" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#CC4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="320" fill="none" />
      <circle cx="200" cy="140" r="80" fill="url(#explosion)" />
      <circle cx="80" cy="140" r="60" fill="url(#blueGlow)" />
      <circle cx="320" cy="140" r="60" fill="url(#redGlow)" />

      {/* Left arrow — AI Deflation */}
      <polygon points="20,125 160,125 160,105 200,140 160,175 160,155 20,155" fill="#3388CC" opacity="0.9" />

      {/* Right arrow — Gov Inflation */}
      <polygon points="380,125 240,125 240,105 200,140 240,175 240,155 380,155" fill="#CC4444" opacity="0.9" />

      {/* Explosion centre */}
      <circle cx="200" cy="140" r="18" fill="#B8860B" opacity="0.9" />
      <text x="200" y="144" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">💥</text>

      {/* Spark lines */}
      {[[200,122,185,95],[200,122,215,95],[200,158,185,185],[200,158,215,185],
        [182,140,155,125],[218,140,245,125],[182,140,155,155],[218,140,245,155]].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8860B" strokeWidth="1.5" opacity="0.6" />
      ))}

      {/* Labels */}
      <text x="60" y="88" textAnchor="middle" fill="#3388CC" fontSize="11" fontFamily="monospace" letterSpacing="1" fontWeight="600">AI DEFLATION</text>
      <text x="340" y="88" textAnchor="middle" fill="#CC4444" fontSize="11" fontFamily="monospace" letterSpacing="1" fontWeight="600">GOV INFLATION</text>
      <text x="200" y="78" textAnchor="middle" fill="#B8860B" fontSize="13" fontFamily="monospace" letterSpacing="2" fontWeight="bold">THE COLLISION</text>

      {/* Down arrow to crypto */}
      <line x1="200" y1="158" x2="200" y2="215" stroke="#B8860B" strokeWidth="2" strokeDasharray="4,3" opacity="0.7" />
      <polygon points="195,215 205,215 200,228" fill="#B8860B" opacity="0.7" />

      {/* Crypto box */}
      <rect x="130" y="230" width="140" height="48" rx="2" fill="none" stroke="#B8860B" strokeWidth="1.5" />
      <text x="200" y="249" textAnchor="middle" fill="#B8860B" fontSize="10" fontFamily="monospace" letterSpacing="2" fontWeight="600">◈ SPICE [ZPC]</text>
      <text x="200" y="266" textAnchor="middle" fill="#666666" fontSize="9" fontFamily="monospace">CRISIS HEDGE PROTOCOL</text>

      {/* Release valve label */}
      <text x="245" y="210" fill="#666666" fontSize="9" fontFamily="monospace">release valve</text>
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────
function Pillar({ number, title, color, text }) {
  return (
    <div style={{ ...S.pillar, borderTop: `3px solid ${color}` }}>
      <span style={{ ...S.pillarNum, color }}>{number}</span>
      <h3 style={{ ...S.pillarTitle, color }}>{title}</h3>
      <p style={S.pillarText}>{text}</p>
    </div>
  );
}

function FailItem({ hedge, reason }) {
  return (
    <div style={S.failItem}>
      <div style={S.failHedge}>{hedge}</div>
      <div style={S.failReason}>✗ {reason}</div>
    </div>
  );
}

function HoldItem({ asset, color, pct, why }) {
  return (
    <div style={{ ...S.holdItem, borderLeft: `3px solid ${color}` }}>
      <div style={S.holdTop}>
        <span style={{ ...S.holdAsset, color }}>{asset}</span>
        <span style={{ ...S.holdPct, color }}>{pct}</span>
      </div>
      <p style={S.holdWhy}>{why}</p>
    </div>
  );
}

function MechItem({ step, title, text }) {
  return (
    <div style={S.mechItem}>
      <div style={S.mechStep}>{step}</div>
      <div>
        <div style={S.mechTitle}>{title}</div>
        <p style={S.mechText}>{text}</p>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const S = {
  main: { position: "relative", zIndex: 1 },
  hero: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
    padding: "80px 80px 64px", alignItems: "center",
    borderBottom: "2px solid #E0E0E0",
    maxWidth: 1200, margin: "0 auto",
  },
  heroInner: {},
  heroRight: { display: "flex", justifyContent: "center" },
  eyebrow: { fontSize: 9, color: "#B8860B", letterSpacing: "0.2em", marginBottom: 20, fontWeight: 600 },
  h1: {
    fontSize: 48, fontWeight: 700, lineHeight: 1.1,
    letterSpacing: "0.02em", marginBottom: 24, color: "#000000",
  },
  gold: { color: "#B8860B" },
  heroSub: { fontSize: 14, color: "#333333", lineHeight: 1.8, marginBottom: 36, maxWidth: 480 },
  heroCta: { display: "flex", gap: 16, flexWrap: "wrap" },

  btnPrimary: {
    padding: "12px 28px", background: "#B8860B", border: "none",
    color: "#FFFFFF", fontSize: 12, fontWeight: 700, cursor: "pointer",
    letterSpacing: "0.08em", fontFamily: "inherit",
  },
  btnSecondary: {
    padding: "12px 28px", background: "none",
    border: "2px solid #333333", color: "#333333",
    fontSize: 12, cursor: "pointer", letterSpacing: "0.08em", fontFamily: "inherit",
  },

  pillars: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
    borderBottom: "2px solid #E0E0E0", maxWidth: 1200, margin: "0 auto",
  },
  pillar: {
    padding: "40px", borderRight: "1px solid #E0E0E0",
  },
  pillarNum: { fontSize: 10, letterSpacing: "0.2em", display: "block", marginBottom: 12, fontWeight: 700 },
  pillarTitle: { fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 16 },
  pillarText: { fontSize: 13, color: "#333333", lineHeight: 1.8 },

  section: {
    padding: "64px 80px", borderBottom: "2px solid #E0E0E0",
    maxWidth: 1200, margin: "0 auto",
  },
  h2: { fontSize: 22, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 20, color: "#000000" },
  body: { fontSize: 13, color: "#333333", lineHeight: 1.8, marginBottom: 32, maxWidth: 640 },

  failGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1,
    background: "#E0E0E0",
  },
  failItem: {
    background: "#F8F8F8", padding: "20px 24px",
  },
  failHedge: { fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 8 },
  failReason: { fontSize: 12, color: "#CC4444", lineHeight: 1.6 },

  holdGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  holdItem: { background: "#F8F8F8", padding: "24px", paddingLeft: 20, border: "1px solid #E0E0E0" },
  holdTop: { display: "flex", justifyContent: "space-between", marginBottom: 12 },
  holdAsset: { fontSize: 13, fontWeight: 700 },
  holdPct: { fontSize: 13, fontWeight: 700 },
  holdWhy: { fontSize: 12, color: "#333333", lineHeight: 1.7 },

  mechGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  mechItem: { display: "flex", gap: 20, background: "#F8F8F8", padding: "24px", border: "1px solid #E0E0E0" },
  mechStep: {
    fontSize: 28, fontWeight: 700, color: "#B8860B",
    opacity: 0.5, lineHeight: 1, flexShrink: 0, width: 32,
  },
  mechTitle: { fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 8 },
  mechText: { fontSize: 12, color: "#333333", lineHeight: 1.7 },

  cta: {
    padding: "64px 80px 80px", textAlign: "center",
    maxWidth: 1200, margin: "0 auto",
  },
  ctaButtons: { display: "flex", gap: 16, justifyContent: "center", marginBottom: 40 },
  disclaimer: { fontSize: 10, color: "#666666", letterSpacing: "0.08em" },
};
