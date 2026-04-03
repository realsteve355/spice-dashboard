import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SPICE_PARAMS, LEVEL_COLORS, LEVEL_LABELS } from "../data/spice-params";

const F  = "'IBM Plex Mono', monospace";
const { current: C, meta: M } = SPICE_PARAMS;

// ─── SPICE DATA LOGO (dark) ───────────────────────────────────────────────────

function SPICEDataLogo({ color }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg width="420" height="232" viewBox="0 0 420 232" xmlns="http://www.w3.org/2000/svg">
        <path d="M 53 30 A 52 34 0 0 1 53 98" fill="none" stroke={color} strokeWidth="1.5" />
        <text x="53" y="52" textAnchor="middle" fontSize="8" fill="#4a5878" fontFamily="'IBM Plex Mono',monospace" letterSpacing="1">DEBT/GDP</text>
        <text x="53" y="80" textAnchor="middle" fontSize="20" fontWeight="700" fill="#dc2626" fontFamily="'IBM Plex Mono',monospace">{C.debt}%</text>
        <line x1="105" y1="64" x2="178" y2="64" stroke="#4a5878" strokeWidth="2" />
        <circle cx="210" cy="64" r="32" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.15" />
        <line x1="242" y1="64" x2="315" y2="64" stroke="#4a5878" strokeWidth="2" />
        <path d="M 367 30 A 52 34 0 0 0 367 98" fill="none" stroke={color} strokeWidth="1.5" />
        <text x="367" y="52" textAnchor="middle" fontSize="8" fill="#4a5878" fontFamily="'IBM Plex Mono',monospace" letterSpacing="1">AI PENETRATION</text>
        <text x="367" y="80" textAnchor="middle" fontSize="20" fontWeight="700" fill="#8b5cf6" fontFamily="'IBM Plex Mono',monospace">{C.ai}%</text>
        <line x1="210" y1="96" x2="210" y2="170" stroke="#4a5878" strokeWidth="2" />
        <path d="M 142 198 A 68 28 0 0 0 278 198" fill="none" stroke={color} strokeWidth="1.5" />
        <text x="210" y="188" textAnchor="middle" fontSize="8" fill="#4a5878" fontFamily="'IBM Plex Mono',monospace" letterSpacing="1">CRYPTO FLIGHT</text>
        <text x="210" y="214" textAnchor="middle" fontSize="20" fontWeight="700" fill={color} fontFamily="'IBM Plex Mono',monospace">{C.crypto}%</text>
      </svg>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [cachedLevel, setCachedLevel] = useState(null);
  const [showPhaseDetail, setShowPhaseDetail] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("spice_level_cache"));
      if (s && Date.now() - s.timestamp < 24 * 60 * 60 * 1000) setCachedLevel(s.level);
    } catch {}
  }, []);

  const level      = cachedLevel ?? M.currentLevel;
  const levelColor = LEVEL_COLORS[level];
  const markerPct  = 2;

  const TIMELINE_PHASES = [
    { years: "2026",      label: "Safe",          color: "#16a34a", desc: "Debt 122% GDP. Fed holding. AI displacement early. System functioning within baseline parameters." },
    { years: "2027–2028", label: "Elevated",      color: "#ca8a04", desc: "Debt crosses 140%. AI displacement 12–18%. Yield curve steepening. Multiple indicators breached." },
    { years: "2029",      label: "High Risk",     color: "#ea580c", desc: "Debt hits 175%. Unemployment 10%+. Bond market stress visible. Crypto flight accelerating." },
    { years: "2029–2032", label: "Crisis Window", color: "#dc2626", desc: "The Collision. YCC deployed. Debt 195–245%. AI-driven deflation prevents traditional escape routes." },
  ];

  const BG0 = "#0a0e1a";
  const BG1 = "#080c16";
  const BG2 = "#0f1520";
  const BD  = "1px solid #1e2a42";
  const BD2 = "1px solid #141c2e";
  const T1  = "#e8eaf0";
  const T2  = "#8899bb";
  const T3  = "#4a5878";

  return (
    <div style={{ background: BG0, color: T1, fontFamily: F }}>

      {/* ══════════════════════════════════════════════════════════════════
          ACT I — THE COLLISION
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: BD }}>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "36px 24px 40px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 20 }}>
              Act I
            </div>
            <SPICEDataLogo color={levelColor} />

            {/* Policy badges */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", margin: "20px 0 28px" }}>
              {[
                { label: "Fiscal",   value: "Robot tax + UBI", border: "#86efac", text: "#3dffa0", bg: "rgba(61,255,160,0.07)" },
                { label: "Monetary", value: "QE",              border: "#fde047", text: "#e8a020", bg: "rgba(232,160,32,0.07)"  },
                { label: "Crypto",   value: "Tax & regulate",  border: "#93c5fd", text: "#4488ff", bg: "rgba(68,136,255,0.07)"  },
              ].map(b => (
                <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.border}`,
                  padding: "4px 10px", fontSize: 8, letterSpacing: "0.06em" }}>
                  <span style={{ color: T3, textTransform: "uppercase" }}>{b.label}:</span>
                  {" "}<span style={{ color: b.text, fontWeight: 700, textTransform: "uppercase" }}>{b.value}</span>
                </div>
              ))}
            </div>

            <h1 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, margin: "0 0 16px",
              letterSpacing: "0.04em", color: T1 }}>
              The Collision
            </h1>
            <p style={{ fontSize: 13, color: T2, lineHeight: 1.85, maxWidth: 680, margin: "0 auto 32px" }}>
              The sovereign debt crisis has been building for decades. Governments have relied on
              inflation to erode their debt loads — but the AI revolution is causing structural
              deflation, directly blocking that escape route. The result is a trap: debt that cannot
              be inflated away, wages compressed by automation, and wealth concentrating at a rate
              the financial system was never designed to handle.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/collision" style={{ background: "#B8860B", color: "#fff",
                padding: "11px 28px", fontFamily: F, fontSize: 11, fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.08em", display: "inline-block" }}>
                Run the Simulator →
              </Link>
              <Link to="/collision/indicators" style={{ background: "transparent", color: T2,
                padding: "10px 28px", fontFamily: F, fontSize: 11, fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.08em", border: BD,
                display: "inline-block" }}>
                Live Indicators →
              </Link>
            </div>
          </div>
        </div>

        {/* Timeline bar */}
        <div style={{ padding: "28px 24px 36px", background: BG1 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
                  SPICE Base Case
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Projected Crisis Timeline</div>
              </div>
              <div style={{ fontSize: 8, color: T3, letterSpacing: "0.06em" }}>hover for detail</div>
            </div>

            <div style={{ position: "relative" }}
              onMouseEnter={() => setShowPhaseDetail(true)}
              onMouseLeave={() => setShowPhaseDetail(false)}>
              <div style={{ height: 10, borderRadius: 5, cursor: "default",
                background: "linear-gradient(90deg,#16a34a 0%,#16a34a 20%,#3b82f6 20%,#3b82f6 40%,#ca8a04 40%,#ca8a04 60%,#ea580c 60%,#ea580c 80%,#dc2626 80%,#dc2626 100%)" }} />
              <div style={{ position: "absolute", top: -4, left: `${markerPct}%`, transform: "translateX(-50%)" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: BG0, border: `3px solid ${levelColor}` }} />
                <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)",
                  fontSize: 7, color: levelColor, fontWeight: 700, letterSpacing: "0.08em",
                  whiteSpace: "nowrap", textTransform: "uppercase" }}>
                  today
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                {["2026","2027","2028","2029","2030","2031","2032"].map(yr => (
                  <div key={yr} style={{ fontSize: 8, color: T3, textAlign: "center" }}>
                    <div style={{ width: 1, height: 4, background: "#2a3a5c", margin: "0 auto 3px" }} />
                    {yr}
                  </div>
                ))}
              </div>

              {showPhaseDetail && (
                <div style={{ position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0, zIndex: 30,
                  background: BG2, border: BD, padding: "18px 20px",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.4)" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: T3, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 6 }}>
                      Crisis level:
                    </span>
                    {LEVEL_LABELS.map((lbl, i) => (
                      <div key={lbl} style={{
                        padding: i === level ? "4px 10px" : "3px 8px",
                        background: i === level ? LEVEL_COLORS[i] : `${LEVEL_COLORS[i]}18`,
                        border: `2px solid ${i === level ? LEVEL_COLORS[i] : `${LEVEL_COLORS[i]}60`}`,
                        fontSize: i === level ? 9 : 8, fontWeight: i === level ? 700 : 400,
                        color: i === level ? "#fff" : LEVEL_COLORS[i],
                        letterSpacing: "0.06em", textTransform: "uppercase",
                      }}>{lbl}</div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                    {TIMELINE_PHASES.map((ph, i) => (
                      <div key={i} style={{ background: BG0, border: `1px solid ${ph.color}30`, padding: "12px" }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: ph.color, textTransform: "uppercase",
                          letterSpacing: "0.1em", marginBottom: 3 }}>{ph.years}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T1, marginBottom: 6 }}>{ph.label}</div>
                        <div style={{ fontSize: 8, color: T2, lineHeight: 1.7 }}>{ph.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Three forces */}
        <div style={{ padding: "32px 24px 56px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              {[
                {
                  label: "Force I", title: "Sovereign Debt", color: "#dc2626",
                  stat: `${C.debt}% debt/GDP`, statSub: "today",
                  body: "Decades of deficit spending, compounded by COVID and structural welfare commitments. Crisis threshold is 175% — the SPICE base case reaches it by 2029. Above this, debt service exceeds tax revenue at any market-clearing yield.",
                },
                {
                  label: "Force II", title: "AI Deflation", color: "#8b5cf6",
                  stat: `${C.ai}% displaced`, statSub: "today — 40% by 2030",
                  body: "Structural unemployment from AI compresses the wage base governments rely on for tax revenue. Critically, it also causes sector-wide deflation — blocking the traditional escape route of inflating away sovereign debt. The cure is unavailable.",
                },
                {
                  label: "Force III", title: "Crypto Flight", color: "#B8860B",
                  stat: `${C.crypto}% adoption`, statSub: "today — accelerating",
                  body: "As trust in fiat institutions erodes, capital migrates to permissionless assets. Governments cannot enforce capital controls on self-custody Bitcoin. When the traditional last-resort tool is unavailable, the playbook ends.",
                },
              ].map(card => (
                <div key={card.title} style={{ background: BG2, border: BD, padding: "24px" }}>
                  <div style={{ fontSize: 8, color: card.color, textTransform: "uppercase",
                    letterSpacing: "0.2em", marginBottom: 6 }}>{card.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 12 }}>{card.title}</div>
                  <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: BD2 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.stat}</span>
                    <span style={{ fontSize: 9, color: T3, marginLeft: 8 }}>{card.statSub}</span>
                  </div>
                  <p style={{ fontSize: 10, color: T2, lineHeight: 1.8, margin: 0 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ACT II — THE ABUNDANCE PARADOX
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "64px 24px", borderBottom: BD, background: BG1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 12 }}>
              Act II
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, margin: "0 0 16px", color: T1 }}>
              The Abundance Paradox
            </h2>
            <p style={{ fontSize: 13, color: T2, lineHeight: 1.85, maxWidth: 660, margin: "0 auto" }}>
              The same AI and robotics that are breaking the fiat economy are also creating
              a level of productive capacity the world has never seen. We are heading into a
              world that is simultaneously economically broken and materially abundant.
              The outcome depends entirely on how we organise ourselves.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, maxWidth: 900, margin: "0 auto" }}>
            <div style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)",
              borderRight: "none", padding: "32px 28px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase",
                letterSpacing: "0.14em", marginBottom: 16 }}>Path A — Breakdown</div>
              <p style={{ fontSize: 11, color: T2, lineHeight: 1.85, margin: "0 0 16px" }}>
                AI productivity accrues to capital owners. Jobs disappear faster than new ones
                are created. Tax revenues collapse as the wage base shrinks. Governments lose the
                ability to fund welfare systems. Social contracts fracture.
              </p>
              {["Mass structural unemployment","Currency collapse and hyperinflation",
                "Extreme wealth concentration","Erosion of public services","Social and political instability"
              ].map(item => (
                <div key={item} style={{ fontSize: 9, color: T2, lineHeight: 1.7, marginBottom: 4,
                  paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "#dc2626" }}>✗</span>{item}
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.25)",
              padding: "32px 28px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#3dffa0", textTransform: "uppercase",
                letterSpacing: "0.14em", marginBottom: 16 }}>Path B — Post-Scarcity</div>
              <p style={{ fontSize: 11, color: T2, lineHeight: 1.85, margin: "0 0 16px" }}>
                AI productivity is organised as a collective resource. Machine output funds
                Universal Basic Income. Citizens contribute through enterprise, creativity,
                and community. The cooperative model distributes abundance rather than
                concentrating it.
              </p>
              {["UBI funded by automated output","New currency model decoupled from labour",
                "Worker-owned cooperative enterprise","Citizen-owned infrastructure","Post-scarcity community economics"
              ].map(item => (
                <div key={item} style={{ fontSize: 9, color: T2, lineHeight: 1.7, marginBottom: 4,
                  paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "#3dffa0" }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 11, color: T3, textAlign: "center", marginTop: 24, fontStyle: "italic" }}>
            The question is not which path technology takes us down. The question is whether
            the economic architecture exists to choose Path B when the moment arrives.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ACT III — THE BREAKEVEN
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "64px 24px", borderBottom: BD }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 12 }}>
              Act III
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, margin: "0 0 16px", color: T1 }}>
              The Breakeven
            </h2>
            <p style={{ fontSize: 13, color: T2, lineHeight: 1.85, maxWidth: 620, margin: "0 auto" }}>
              Path B is not guaranteed — it requires a mathematical condition to be met.
              There must be enough automated productive capacity to fund the baseline needs
              of every citizen. We call this threshold the <span style={{ color: "#c8a96e" }}>Ergon</span>.
            </p>
          </div>

          {/* Formula */}
          <div style={{ background: BG2, border: BD, borderLeft: "4px solid #B8860B",
            padding: "32px 36px", marginBottom: 32, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 20 }}>
              The Ergon Condition
            </div>
            <div style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 700, letterSpacing: "0.05em",
              color: "#c8a96e", marginBottom: 24, fontFamily: "Georgia, serif" }}>
              η × P<sub style={{ fontSize: "0.6em" }}>ai</sub>
              {" > "}
              C<sub style={{ fontSize: "0.6em" }}>min</sub>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, maxWidth: 600, margin: "0 auto" }}>
              {[
                { sym: "η",    label: "Machine efficiency", desc: "The fraction of AI/robotic capacity directed toward community output" },
                { sym: "Pₐᵢ", label: "AI potential output", desc: "Total productive capacity of automated systems available to the community" },
                { sym: "Cₘᵢₙ",label: "Survival cost",      desc: "Minimum per-capita cost of housing, food, energy, healthcare, and infrastructure" },
              ].map(v => (
                <div key={v.sym} style={{ textAlign: "center", padding: "16px 12px", background: BG0, border: BD }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#c8a96e", marginBottom: 6,
                    fontFamily: "Georgia, serif" }}>{v.sym}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T1, textTransform: "uppercase",
                    letterSpacing: "0.1em", marginBottom: 6 }}>{v.label}</div>
                  <div style={{ fontSize: 9, color: T3, lineHeight: 1.6 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: BG2, border: BD, borderLeft: "3px solid #dc2626", padding: "22px 24px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 10 }}>Below the threshold</div>
              <p style={{ fontSize: 10, color: T2, lineHeight: 1.8, margin: 0 }}>
                Automated output is insufficient to fund UBI. The economy cannot support
                a post-scarcity model. Any attempt at the SPICE transition fails without
                a bridging mechanism or external funding to simulate the Ergon economy.
              </p>
            </div>
            <div style={{ background: BG2, border: BD, borderLeft: "3px solid #3dffa0", padding: "22px 24px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#3dffa0", textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 10 }}>Above the threshold</div>
              <p style={{ fontSize: 10, color: T2, lineHeight: 1.8, margin: 0 }}>
                Machine output covers survival costs. UBI becomes self-funding. The SPICE
                economic model — S-tokens, V-tokens, cooperative enterprise, citizen-owned
                infrastructure — is viable and self-sustaining.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ACT IV — THE PROOF
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: BG1, padding: "64px 24px", borderBottom: BD }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 12 }}>
              Act IV
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, margin: "0 0 16px", color: T1 }}>
              The <span style={{ color: "#c8a96e" }}>Mars Colony</span> Proof
            </h2>
            <p style={{ fontSize: 13, color: T2, lineHeight: 1.85, maxWidth: 640, margin: "0 auto" }}>
              A 200-year closed-loop simulation of the SPICE economic model. If the architecture
              works in a post-scarcity colony with citizen-owned infrastructure and UBI from the
              start, it is structurally sound. The simulation runs in real time and the data is open.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 40 }}>
            {[
              { label: "Years simulated",     value: "200",      color: "#c8a96e" },
              { label: "Final population",    value: "2,252",    color: "#e8a020" },
              { label: "Infra health yr 200", value: "100%",     color: "#3dffa0" },
              { label: "Median V-savings",    value: "11,416 V", color: "#4488ff" },
              { label: "Active companies",    value: "55",       color: "#9966ff" },
              { label: "Total transactions",  value: "18.7M",    color: "#c8a96e" },
            ].map(stat => (
              <div key={stat.label} style={{ background: BG2, border: BD, padding: "16px 18px" }}>
                <div style={{ fontSize: 8, color: T3, textTransform: "uppercase",
                  letterSpacing: "0.18em", marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 20, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { title: "Population is stable",        body: "Births replace deaths across a realistic age distribution over 200 years. The colony is self-sustaining without immigration." },
              { title: "Infrastructure stays solvent", body: "The MCC — citizen-owned, board-elected annually — maintains 100% infrastructure health when citizen bills remain near 20% of UBI." },
              { title: "Wealth distributes, not concentrates", body: "V-token savings grow at the median citizen level. Gini coefficients remain within bounds. The cooperative model distributes equity." },
              { title: "Enterprise ecosystem thrives",  body: "10–55 active cottage industries maintain genuine market diversity. Companies form, compete, and close without systemic collapse." },
            ].map(item => (
              <div key={item.title} style={{ background: BG2, border: BD, padding: "22px 20px" }}>
                <div style={{ fontSize: 14, color: "#3dffa0", marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 11, color: T1, letterSpacing: "0.04em", marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: T2, lineHeight: 1.75 }}>{item.body}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link to="/mars/dashboard" style={{ display: "inline-block", border: "1px solid #c8a96e",
              color: "#c8a96e", padding: "11px 28px", fontFamily: F, fontSize: 11,
              textDecoration: "none", letterSpacing: "0.12em" }}>
              Explore the Mars Simulation →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ACT V — THE BLUEPRINT
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "64px 24px", borderBottom: BD }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 12 }}>
              Act V
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, margin: "0 0 16px", color: T1 }}>
              The Blueprint
            </h2>
            <p style={{ fontSize: 13, color: T2, lineHeight: 1.85, maxWidth: 640, margin: "0 auto" }}>
              The SPICE cryptocurrency is not an investment wrapper. It is the economic
              architecture itself — S-tokens, V-tokens, and smart contracts implementing
              the post-scarcity model for real communities in an Earth context.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 32 }}>
            {[
              {
                symbol: "S", color: "#3dffa0",
                title: "S-Tokens — Velocity Currency",
                body: "Issued monthly as Universal Basic Income. Expire at month-end, driving economic velocity without inflation. S-tokens pay for services — food, shelter, energy, healthcare. They cannot be hoarded.",
              },
              {
                symbol: "V", color: "#4488ff",
                title: "V-Tokens — Savings & Equity",
                body: "Permanent savings tokens earned through equity dividends and converted from UBI surplus. V-tokens accumulate wealth, fund enterprise, and represent ownership stakes in cooperative companies.",
              },
              {
                symbol: "◈", color: "#c8a96e",
                title: "Smart Contracts — Governance",
                body: "UBI distribution, cooperative equity dividends, infrastructure billing, board elections — all on-chain. Every financial flow is transparent, auditable, and rule-governed without human discretion.",
              },
            ].map(item => (
              <div key={item.title} style={{ background: BG2, border: BD,
                borderTop: `3px solid ${item.color}`, padding: "24px 22px" }}>
                <div style={{ fontSize: 26, color: item.color, marginBottom: 12,
                  fontFamily: "Georgia, serif" }}>{item.symbol}</div>
                <div style={{ fontSize: 11, color: T1, letterSpacing: "0.04em", marginBottom: 10 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: T2, lineHeight: 1.8 }}>{item.body}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link to="/earth" style={{ display: "inline-block", border: "1px solid #4488ff",
              color: "#4488ff", padding: "11px 28px", fontFamily: F, fontSize: 11,
              textDecoration: "none", letterSpacing: "0.12em" }}>
              The Earth Colony →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ACT VI — THE COLONY
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: BG1, padding: "72px 24px 80px", borderBottom: BD }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 16 }}>
            Act VI
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 700, margin: "0 0 24px",
            letterSpacing: "0.04em", color: T1 }}>
            The <span style={{ color: "#c8a96e" }}>Colony</span>
          </h2>
          <p style={{ fontSize: 13, color: T2, lineHeight: 1.9, maxWidth: 600, margin: "0 auto 16px" }}>
            The next step is not theoretical. We are looking for a real community — a university
            campus, a village, a commune — willing to adopt the SPICE economic model and prove
            it works at human scale.
          </p>
          <p style={{ fontSize: 13, color: T2, lineHeight: 1.9, maxWidth: 600, margin: "0 auto 40px" }}>
            A community that reaches the Ergon threshold — where its automated productive output
            covers the cost of UBI for all members — becomes the first Earth Colony.
            The Mars simulation is the proof. The Colony is the implementation.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/earth" style={{ display: "inline-block", background: "#c8a96e", color: BG0,
              padding: "12px 32px", fontFamily: F, fontSize: 11,
              textDecoration: "none", letterSpacing: "0.12em" }}>
              The Earth Colony →
            </Link>
            <Link to="/mars" style={{ display: "inline-block", border: BD,
              color: T2, padding: "11px 32px", fontFamily: F, fontSize: 11,
              textDecoration: "none", letterSpacing: "0.12em" }}>
              The Mars Colony →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section style={{ padding: "32px 24px", background: BG0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#1e2a42", letterSpacing: "0.14em", marginBottom: 6, textTransform: "uppercase" }}>
            SPICE Protocol · Pre-launch research · Base Sepolia testnet · Not a financial promotion
          </div>
          <div style={{ fontSize: 9, color: "#141c2e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Models and assumptions published for scrutiny and peer review
          </div>
        </div>
      </section>

    </div>
  );
}
