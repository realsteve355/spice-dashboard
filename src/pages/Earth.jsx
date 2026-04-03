import { Link } from "react-router-dom";

const F   = "'IBM Plex Mono', monospace";
const BG0 = "#0a0e1a";
const BG1 = "#080c16";
const BG2 = "#0f1520";
const BD  = "1px solid #1e2a42";
const T1  = "#e8eaf0";
const T2  = "#8899bb";
const T3  = "#4a5878";
const GOLD = "#c8a96e";
const GREEN = "#3dffa0";
const BLUE  = "#4488ff";
const PURPLE = "#9966ff";

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({ children, alt }) {
  return (
    <section style={{
      background: alt ? BG1 : BG0,
      borderBottom: BD,
      padding: "80px 40px",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: F, fontSize: 9, letterSpacing: "0.3em",
      textTransform: "uppercase", color: T3,
      marginBottom: 20, borderBottom: BD, paddingBottom: 10,
    }}>
      {children}
    </div>
  );
}

function H2({ children, color }) {
  return (
    <h2 style={{
      fontFamily: F, fontSize: 28, fontWeight: 700,
      color: color || T1, margin: "0 0 24px 0",
      letterSpacing: "0.02em", lineHeight: 1.2,
    }}>
      {children}
    </h2>
  );
}

function Body({ children }) {
  return (
    <p style={{
      fontFamily: F, fontSize: 13, color: T2,
      lineHeight: 1.9, margin: "0 0 20px 0",
    }}>
      {children}
    </p>
  );
}

// ─── Token card ──────────────────────────────────────────────────────────────

function TokenCard({ symbol, name, color, role, mechanics }) {
  return (
    <div style={{
      background: BG2, border: BD, borderTop: `3px solid ${color}`,
      padding: "24px 28px",
    }}>
      <div style={{
        fontFamily: F, fontSize: 28, fontWeight: 700,
        color, marginBottom: 6,
      }}>
        {symbol}
      </div>
      <div style={{
        fontFamily: F, fontSize: 10, letterSpacing: "0.2em",
        color: T3, textTransform: "uppercase", marginBottom: 16,
      }}>
        {name}
      </div>
      <div style={{
        fontFamily: F, fontSize: 12, color: T1,
        marginBottom: 12, lineHeight: 1.5,
      }}>
        {role}
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
        {mechanics.map((m, i) => (
          <li key={i} style={{
            fontFamily: F, fontSize: 11, color: T2,
            lineHeight: 1.8, marginBottom: 4,
          }}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Pilot concept card ──────────────────────────────────────────────────────

function PilotCard({ title, pop, type, note }) {
  return (
    <div style={{ background: BG2, border: BD, padding: "20px 24px" }}>
      <div style={{
        fontFamily: F, fontSize: 9, letterSpacing: "0.2em",
        color: T3, textTransform: "uppercase", marginBottom: 8,
      }}>
        {type}
      </div>
      <div style={{
        fontFamily: F, fontSize: 15, color: T1, marginBottom: 8,
        fontWeight: 600,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: F, fontSize: 10, color: GOLD,
        marginBottom: 12, letterSpacing: "0.05em",
      }}>
        {pop}
      </div>
      <div style={{
        fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.7,
      }}>
        {note}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Earth() {
  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: F }}>

      {/* ── I. Hero ── */}
      <Section>
        <SectionLabel>Earth Colony · SPICE Protocol</SectionLabel>
        <H2>The Next Colony Is Earth</H2>
        <Body>
          The Mars simulation proves the model under extreme scarcity. A closed
          community of 2,000 people, no outside capital, only robotic output and
          a currency backed by machine work — and the colony becomes self-sustaining
          within 30 years.
        </Body>
        <Body>
          The same mathematics applies on Earth. The Ergon breakeven threshold —
          where automated output exceeds community survival costs — is not a
          distant utopian horizon. It is an engineering target. SPICE is the
          instrument designed to cross it.
        </Body>
        <div style={{
          background: BG2, border: BD, borderLeft: `3px solid ${GOLD}`,
          padding: "20px 24px", marginTop: 32,
        }}>
          <div style={{
            fontFamily: "'Georgia', serif", fontSize: 22,
            color: GOLD, marginBottom: 8, letterSpacing: "0.05em",
          }}>
            η × P<sub style={{ fontSize: 14 }}>ai</sub> &gt; C<sub style={{ fontSize: 14 }}>min</sub>
          </div>
          <div style={{ fontFamily: F, fontSize: 11, color: T3, lineHeight: 1.7 }}>
            Machine efficiency (η) × AI productive output (P<sub>ai</sub>) must exceed
            community survival cost (C<sub>min</sub>). When this condition holds, a
            post-scarcity local economy is mathematically viable — independent of
            national debt trajectories.
          </div>
        </div>
      </Section>

      {/* ── II. The two tokens ── */}
      <Section alt>
        <SectionLabel>Currency Architecture · S-Token + V-Token</SectionLabel>
        <H2>Two Tokens, One Economy</H2>
        <Body>
          The SPICE currency system separates velocity from equity. S-tokens fund
          daily economic activity — they are issued as UBI, expire monthly, and
          circulate continuously. V-tokens represent accumulated productive value —
          earned through work and contribution, permanent, and appreciating with
          the colony's output.
        </Body>
        <Body>
          This dual structure solves the hoarding problem that breaks traditional
          UBI proposals. S-tokens cannot be accumulated; they must circulate.
          V-tokens cannot be printed; they can only be earned.
        </Body>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 20, marginTop: 8,
        }}>
          <TokenCard
            symbol="S"
            name="Spice Token — Velocity"
            color={GREEN}
            role="The circulation layer. Issued monthly as UBI to all colony members. Expire at month-end if not spent."
            mechanics={[
              "Fixed monthly issuance per adult member",
              "Expire at end of each 30-day cycle",
              "Accepted by all colony service providers",
              "Backed by the colony's service capacity",
              "Cannot be saved, hoarded, or exported",
            ]}
          />
          <TokenCard
            symbol="V"
            name="Value Token — Equity"
            color={BLUE}
            role="The equity layer. Earned through labour, services, and productive contribution. Permanent and transferable."
            mechanics={[
              "Issued only as compensation for work",
              "No expiry — permanent store of value",
              "Convertible to S at community-set rate",
              "Represents a share of colony productive capacity",
              "Governance rights proportional to V holdings",
            ]}
          />
        </div>
        <div style={{
          marginTop: 20, background: BG0, border: BD,
          padding: "18px 24px",
        }}>
          <div style={{
            fontFamily: F, fontSize: 10, letterSpacing: "0.2em",
            color: T3, textTransform: "uppercase", marginBottom: 10,
          }}>
            Settlement Layer
          </div>
          <div style={{
            fontFamily: F, fontSize: 13, color: GOLD,
            marginBottom: 8, letterSpacing: "0.05em",
          }}>
            ◈ ZPC
          </div>
          <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.7 }}>
            ZPC is the external settlement and reserve token — live on Base Sepolia,
            ultimately on mainnet. S and V tokens are issued and settled on-chain via
            the SPICE smart contract system. ZPC provides the liquidity bridge to
            external capital markets, Bitcoin, and gold reserves.
          </div>
        </div>
      </Section>

      {/* ── III. Pilot communities ── */}
      <Section>
        <SectionLabel>Pilot Communities · Proof of Concept</SectionLabel>
        <H2>Starting Small. Scaling with Evidence.</H2>
        <Body>
          The Mars simulation runs for 200 years. The Earth pilot needs to prove the
          model within 3–5 years. The target is a closed community of 500–2,000 people
          with sufficient automation, shared infrastructure, and willingness to operate
          under a dual-token economy.
        </Body>
        <Body>
          The community need not be remote or experimental. Any sufficiently bounded
          economic unit — a campus, a business park, a rural cooperative — can serve
          as the test environment, provided it can isolate the internal S/V token
          economy from external currency flows.
        </Body>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, marginTop: 8,
        }}>
          <PilotCard
            type="Academic Campus"
            title="University or research campus"
            pop="2,000–10,000 residents"
            note="Food, housing, services, and intellectual labour already partially communalised. S-tokens replace meal plans and campus credits. V-tokens reward teaching, research output, and maintenance work."
          />
          <PilotCard
            type="Rural Cooperative"
            title="Agricultural commune or eco-village"
            pop="200–800 members"
            note="Land, energy, and food production already shared. High amenability to experimental monetary systems. Ergon threshold reachable with modest automation of harvest and processing."
          />
          <PilotCard
            type="Business Park / SEZ"
            title="Special economic zone"
            pop="1,000–5,000 workers"
            note="Defined geographic and economic boundary. Employer buy-in replaces individual recruitment. S-tokens supplement wages; V-tokens reward productivity above baseline."
          />
          <PilotCard
            type="Remote Town"
            title="Declining manufacturing or mining town"
            pop="500–3,000 residents"
            note="Existing crisis of fiat unemployment makes dual-token UBI politically viable. Automation investment justified by absence of competing labour. Ideal Ergon test environment."
          />
        </div>
      </Section>

      {/* ── IV. The MCC on Earth ── */}
      <Section alt>
        <SectionLabel>Governance · The Community Capital Collective</SectionLabel>
        <H2>The MCC Model, Translated</H2>
        <Body>
          In the Mars simulation, the MCC (Mars Community Collective) is the
          infrastructure operator — it runs life support, energy, and transit,
          charging citizens for services and returning profit to the community
          through a board-approved dividend mechanism.
        </Body>
        <Body>
          On Earth, the equivalent is any community-owned entity that operates
          shared infrastructure: a housing cooperative, a municipal energy company,
          a collectively-owned logistics fleet. The MCC model requires only that:
        </Body>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 8 }}>
          {[
            { n: "01", label: "Infrastructure is owned collectively", desc: "The productive assets — robots, solar, transit — are community property, not private capital." },
            { n: "02", label: "Revenue is distributed as V-tokens", desc: "Surplus from MCC operations is issued as V-tokens to members, not extracted as profit." },
            { n: "03", label: "Governance is proportional to contribution", desc: "V-token holdings determine board voting weight. New members earn in; they cannot buy in." },
          ].map(({ n, label, desc }) => (
            <div key={n} style={{ background: BG0, border: BD, padding: "20px 20px" }}>
              <div style={{ fontFamily: F, fontSize: 28, color: T3, fontWeight: 700, marginBottom: 10 }}>{n}</div>
              <div style={{ fontFamily: F, fontSize: 12, color: T1, marginBottom: 10, lineHeight: 1.5 }}>{label}</div>
              <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── V. The collision context ── */}
      <Section>
        <SectionLabel>Macro Context · Why Now</SectionLabel>
        <H2>The Collision Creates the Opportunity</H2>
        <Body>
          SPICE does not assume a benevolent state or a smooth transition. The
          collision between sovereign debt and AI deflation is already underway.
          Governments will respond with inflation — financial repression, yield
          curve control, monetary expansion. The purchasing power of fiat wages will
          fall precisely as automation eliminates the jobs that generate them.
        </Body>
        <Body>
          This is not a worst-case scenario. It is the base case, modelled in the
          Collision simulation using CBO, IMF, and BLS data. The Earth colony
          model is designed for this environment — not as escapism, but as a
          practical hedge for communities that cannot wait for policy to catch up.
        </Body>
        <div style={{
          display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap",
        }}>
          {[
            { label: "US Debt/GDP", val: "123%", sub: "CBO 2025 baseline", color: "#ef4444" },
            { label: "Projected 2054", val: "154–199%", sub: "CBO long-term outlook", color: "#ef4444" },
            { label: "AI displacement (base)", val: "40%", sub: "SPICE estimate by 2035", color: PURPLE },
            { label: "Ergon threshold", val: "η × Pai > Cmin", sub: "Automation coverage needed", color: GOLD },
          ].map(({ label, val, sub, color }) => (
            <div key={label} style={{
              background: BG2, border: BD, padding: "18px 22px", flex: "1 1 180px",
            }}>
              <div style={{ fontFamily: F, fontSize: 9, letterSpacing: "0.2em", color: T3, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: F, fontSize: 16, color, fontWeight: 600, marginBottom: 4, lineHeight: 1.2 }}>{val}</div>
              <div style={{ fontFamily: F, fontSize: 10, color: T3 }}>{sub}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── VI. CTA ── */}
      <section style={{
        background: BG1, borderTop: BD,
        padding: "80px 40px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            fontFamily: F, fontSize: 9, letterSpacing: "0.3em",
            color: T3, textTransform: "uppercase", marginBottom: 20,
          }}>
            Start Here
          </div>
          <div style={{
            fontFamily: F, fontSize: 22, color: T1,
            marginBottom: 16, lineHeight: 1.4, fontWeight: 600,
          }}>
            See the model. Interrogate the data.
          </div>
          <div style={{
            fontFamily: F, fontSize: 12, color: T2,
            marginBottom: 40, lineHeight: 1.8,
          }}>
            The Mars simulation runs the Ergon model over 200 years with 2,000 citizens.
            The Collision simulation shows the debt trajectory that makes Earth colonies
            necessary. Start with either.
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/mars/dashboard" style={{
              fontFamily: F, fontSize: 11, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "#0a0e1a",
              background: GOLD, padding: "14px 28px",
              textDecoration: "none", fontWeight: 700,
            }}>
              Mars Colony Dashboard →
            </Link>
            <Link to="/collision" style={{
              fontFamily: F, fontSize: 11, letterSpacing: "0.15em",
              textTransform: "uppercase", color: GOLD,
              background: "transparent", padding: "14px 28px",
              textDecoration: "none", border: `1px solid ${GOLD}`,
            }}>
              Collision Simulation →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
