import { C, F } from "../tokens";
import StatusPill   from "../components/spice/StatusPill";
import SectionHead  from "../components/spice/SectionHead";
import CornerFrame  from "../components/spice/CornerFrame";
import Button       from "../components/spice/Button";

const S = {
  page:  { background: C.bg, color: C.txt, fontFamily: F.mono, minHeight: "calc(100vh - 57px)" },
  inner: { maxWidth: 1080, margin: "0 auto", padding: "48px 36px 80px" },
  hero:  { paddingBottom: 48, borderBottom: `1px solid ${C.lineHot}`, marginBottom: 48 },
  h1: {
    fontSize: "clamp(28px, 3.6vw, 46px)",
    fontWeight: 700, color: C.headline,
    letterSpacing: "-0.01em", lineHeight: 1.1,
    margin: "20px 0 22px",
  },
  lead: { fontSize: 14, color: C.txt2, lineHeight: 1.7, maxWidth: 720 },

  card: {
    position: "relative",
    background: C.panel,
    border: `1px solid ${C.line}`,
    padding: 28,
    marginBottom: 32,
  },
  cardTag:  { fontSize: 10, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 14 },
  cardH:    { fontSize: 19, fontWeight: 600, color: C.txt, letterSpacing: "-0.01em", margin: "0 0 14px" },
  cardBody: { fontSize: 13, color: C.txt2, lineHeight: 1.7, margin: 0 },
  cardTodo: {
    marginTop: 18, paddingTop: 14,
    borderTop: `1px solid ${C.line}`,
    fontSize: 11, color: C.dim, letterSpacing: "0.04em",
  },
  ctas: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 },
};

export default function Invest() {
  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* HERO */}
        <div style={S.hero}>
          <StatusPill status="warn" label="Page in progress" />
          <h1 style={S.h1}>Invest in AXION</h1>
          <p style={S.lead}>
            How the protocol generates revenue, how to get involved as a contributor
            or backer, and our open Wefunder campaign. Detailed terms and the
            offering deck are being prepared — leave your email to be notified
            when each section opens.
          </p>
        </div>

        {/* HOW AXION GENERATES REVENUE */}
        <SectionHead tag="I-01" title="How AXION generates revenue" timestamp="DRAFT" />
        <article style={S.card}>
          <CornerFrame />
          <div style={S.cardTag}>Protocol economics</div>
          <h2 style={S.cardH}>Protocol fees on colony S→V boundary</h2>
          <p style={S.cardBody}>
            {/* TODO: Steve — replace with the canonical revenue narrative.
               Should cover: protocol fee on every S→V conversion / external
               settlement, founder share split (configurable per colony, default
               in spice-admin), revenue routed to a protocol treasury that funds
               continued development and the founder team. Tie back to the
               on-chain split contract logic in colony-app/contracts. */}
            Placeholder — protocol economics and the founder-share split mechanism
            are documented separately. To be drafted here in plain language for
            non-technical readers.
          </p>
          <div style={S.cardTodo}>TODO · revenue narrative + diagram</div>
        </article>

        {/* HOW TO GET INVOLVED */}
        <SectionHead tag="I-02" title="How to get involved" timestamp="DRAFT" />
        <article style={S.card}>
          <CornerFrame />
          <div style={S.cardTag}>Contributors · backers · operators</div>
          <h2 style={S.cardH}>Three ways in</h2>
          <p style={S.cardBody}>
            {/* TODO: Steve — three lanes:
               1. Contributors: build AXION — DeFi, simulation, design, ops
               2. Backers: invest via Wefunder (see below) or direct equity
               3. Operators: launch a colony when the protocol opens to public deploys
               Add a contact form / Calendly / email here. */}
            Placeholder — three lanes (contribute, back, operate) to be detailed
            here, each with a clear next step (email, GitHub, Wefunder, Calendly).
          </p>
          <div style={S.cardTodo}>TODO · contact + onboarding paths</div>
        </article>

        {/* WEFUNDER CAMPAIGN */}
        <SectionHead tag="I-03" title="Wefunder campaign" timestamp="OPENING SOON" />
        <article style={S.card}>
          <CornerFrame />
          <div style={S.cardTag}>Equity crowdfunding</div>
          <h2 style={S.cardH}>Back the AXION protocol on Wefunder</h2>
          <p style={S.cardBody}>
            {/* TODO: Steve — Wefunder campaign details:
               raise size, valuation, security type (SAFE / Reg CF), use of funds,
               minimum investment, link to the live campaign page.
               Add the official Wefunder embed or link button. */}
            Placeholder — campaign page link, raise terms, use of funds, and the
            Wefunder embed will go here once the campaign is live.
          </p>
          <div style={S.ctas}>
            <Button variant="primary" href="https://wefunder.com" target="_blank" rel="noopener noreferrer">
              View on Wefunder →
            </Button>
            <Button to="/">Back to home</Button>
          </div>
          <div style={S.cardTodo}>TODO · Wefunder URL + raise terms</div>
        </article>

      </div>
    </div>
  );
}
