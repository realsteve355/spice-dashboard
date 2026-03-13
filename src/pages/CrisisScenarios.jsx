import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { loadSimState, parseAnalysis } from "../lib/sim-engine";
import { runSim, SIM_LEVELS } from "../lib/sim-engine";

// ─── STATIC CONTENT ────────────────────────────────────────────────────────

const CRISIS_TYPES = [
  {
    icon: "⚡",
    type: "TYPE 1",
    name: "Fast Collapse",
    duration: "Months to 2 years",
    color: "#ef4444",
    bg: "#fef2f2",
    borderColor: "#fecaca",
    examples: [
      { name: "Weimar Germany", year: "1923", duration: "10 months", detail: "Hyperinflation following French Ruhr occupation" },
      { name: "Argentina",      year: "2001", duration: "2 years",   detail: "Bank run, corralito, peso devaluation" },
      { name: "Asian Crisis",   year: "1997", duration: "18 months", detail: "Currency peg breaks, IMF intervention" },
    ],
    pattern: [
      "External shock triggers cascade (war, embargo, speculative attack)",
      "Fixed exchange rate breaks under pressure",
      "Bank runs, immediate capital flight",
      "Currency replacement within 1–2 years",
    ],
    classicBar: 100,
    aiBar: 70,
    classicLabel: "10 months–2 years",
    aiLabel: "6–16 months (30% faster)",
    aiMods: [
      "Unemployment spikes deeper — AI displacement adds structural job losses on top of crisis-driven layoffs",
      "Deflation persists during hyperinflation — AI keeps costs falling while currency collapses",
      "Safety nets overwhelmed — government cannot tax AI productivity to fund displaced workers",
    ],
    cryptoMods: [
      "Capital flight instant — seconds to move Bitcoin vs weeks to smuggle gold",
      "Bank freezes partially bypassable — crypto wallets outside deposit system",
      "Organic currency substitution already underway before crisis peak",
    ],
    deepDive: {
      title: "Weimar Hyperinflation (1923)",
      timeline: [
        { date: "Jan 1923", event: "French occupy Ruhr, passive resistance funded by printing" },
        { date: "Aug 1923", event: "1 USD = 4.6 million marks" },
        { date: "Nov 1923", event: "1 USD = 4.2 trillion marks (peak)" },
        { date: "Nov 15 1923", event: "Rentenmark introduced; old currency abandoned" },
      ],
      outcome: "10 months acute hyperinflation. Complete currency replacement. Wealth transferred from bondholders and cash-holders to real asset holders.",
      lesson: "Speed and severity exceeded all government models. No policy intervention halted the collapse once confidence broke.",
    },
  },
  {
    icon: "📉",
    type: "TYPE 2",
    name: "Slow Decline",
    duration: "Decades",
    color: "#eab308",
    bg: "#fefce8",
    borderColor: "#fde68a",
    examples: [
      { name: "British Pound", year: "1914–1971", duration: "57 years", detail: "WWI debt spiral, managed handoff to dollar" },
      { name: "Portuguese Escudo", year: "1960–1999", duration: "39 years", detail: "Gradual devaluation, eventual euro adoption" },
    ],
    pattern: [
      "External manager coordinates transition (US managed British decline via Bretton Woods)",
      "Floating exchange rate allows gradual devaluation without acute crisis",
      "Deep bond markets absorb selling pressure over years",
      "Cooperative handoff to a willing and capable successor",
    ],
    classicBar: 100,
    aiBar: 40,
    classicLabel: "40–60 years",
    aiLabel: "8–15 years (AI compression)",
    aiMods: [
      "Mass unemployment destabilises politics faster — Britain's slow decline required stable employment. AI displacement removes that buffer.",
      "Tax base erosion accelerates — AI productivity gains don't translate to wage income, shrinking revenues faster",
    ],
    cryptoMods: [
      "No captive bond market — British citizens were trapped in sterling bonds. Modern savers have a non-sovereign exit.",
      "Front-running removes the time buffer — gradual devaluation gets front-run by capital that exits early via crypto",
    ],
    deepDive: {
      title: "British Pound Decline (1914–1971)",
      timeline: [
        { date: "1914–1918", event: "WWI debt explosion: Debt/GDP 25% → 140%" },
        { date: "1931", event: "Forced off gold standard — first acute crisis" },
        { date: "1944", event: "Bretton Woods: dollar becomes co-reserve" },
        { date: "1956", event: "Suez Crisis: US forces devaluation" },
        { date: "1967", event: "Final devaluation; reserve status lost" },
      ],
      outcome: "57 years from debt crisis to full reserve loss. Largest economy of its era managed an orderly transition because the US actively coordinated it.",
      lesson: "No such external manager exists for the US dollar today. China is non-convertible; Europe is structurally weak. The Type 2 path requires a Bretton Woods-style framework that has no modern equivalent.",
    },
  },
  {
    icon: "🌀",
    type: "TYPE 3",
    name: "Chaotic Transition",
    duration: "5–15 years",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    borderColor: "#ddd6fe",
    examples: [
      { name: "Dutch Guilder",  year: "1780–1795", duration: "15 years", detail: "Military defeat, no external manager, French invasion" },
      { name: "Soviet Ruble",   year: "1989–1998", duration: "9 years",  detail: "Political collapse, dollar adoption, IMF bailout" },
    ],
    pattern: [
      "No external manager available to coordinate transition",
      "Multiple failed stabilisation attempts before final collapse",
      "Political rupture or regime change accelerates timeline",
      "Fragmented successor landscape — no single reserve currency replacement",
    ],
    classicBar: 100,
    aiBar: 55,
    classicLabel: "9–15 years",
    aiLabel: "4–7 years (SPICE base case)",
    aiMods: [
      "AI unemployment reaches 12–20% — historical precedent: this triggers regime change within a decade, not patience",
      "Ghost GDP (productivity gains that don't appear in wages) destroys political legitimacy faster than visible GDP decline",
    ],
    cryptoMods: [
      "Digital capital flight compresses 15-year guilder pattern to 5–7 years — Dutch wealth took months to smuggle to London",
      "Multipolar fragmentation + crypto as neutral settlement layer emerges by default — no single successor needed",
    ],
    deepDive: {
      title: "Dutch Guilder Collapse (1780–1795)",
      timeline: [
        { date: "1770s", event: "Debt/GDP exceeds 150% from Anglo-Dutch wars" },
        { date: "1780–1784", event: "Fourth Anglo-Dutch War — military defeat exposes fiscal weakness" },
        { date: "1787", event: "Civil unrest; Prussian intervention requested" },
        { date: "1795", event: "French invasion; Batavian Republic formed; guilder effectively dead" },
      ],
      outcome: "15 years from crisis onset to collapse. British pound absorbed reserve functions. Dutch bondholders suffered severe haircuts.",
      lesson: "The most relevant historical analogue for the US: large, sophisticated economy with deep debt burden and no willing external manager to coordinate transition. The absence of a Bretton Woods framework is the critical missing piece.",
    },
  },
];

const DEEP_DIVES = [
  {
    icon: "🇩🇪",
    title: "Weimar Hyperinflation (Jan–Nov 1923)",
    timeline: [
      { date: "Jan 1923", event: "French and Belgian troops occupy Ruhr industrial region to extract war reparations" },
      { date: "Jan–Jul 1923", event: "German government funds 'passive resistance' by printing marks. Inflation accelerates from 100% to 10,000% annually." },
      { date: "Aug 1923", event: "Acceleration: 1 USD = 4.6 million marks. Prices changing hourly." },
      { date: "Oct 1923", event: "Wheelbarrows of cash to buy bread. Real wages near zero." },
      { date: "Nov 1923", event: "Peak: 1 USD = 4.2 trillion marks. Bank of England refuses further lending." },
      { date: "Nov 15 1923", event: "Rentenmark introduced at 1:1,000,000,000,000. Old currency worthless." },
    ],
    outcome: "Winners: Real asset holders (farmland, factories, foreign currency). Losers: Middle class savers, bondholders, pensioners (savings destroyed).",
  },
  {
    icon: "🇬🇧",
    title: "British Pound Decline (1914–1971)",
    timeline: [
      { date: "1914–1918", event: "WWI: Debt/GDP rises from 25% to 140%. Gold standard suspended." },
      { date: "1925", event: "Churchill returns to gold at pre-war parity — misjudged, causes deflation." },
      { date: "1931", event: "Great Depression: forced off gold standard. First acute crisis." },
      { date: "1944", event: "Bretton Woods: dollar pegged to gold, sterling pegged to dollar." },
      { date: "1956", event: "Suez Crisis: US refuses to support pound, forces withdrawal." },
      { date: "1967", event: "Final devaluation from $2.80 to $2.40. Reserve status lost." },
      { date: "1971", event: "Nixon ends Bretton Woods. Dollar also unpegged from gold." },
    ],
    outcome: "57-year managed decline. Possible only because the US actively supported the transition via Marshall Plan, Bretton Woods, and ongoing credit facilities.",
  },
  {
    icon: "🇳🇱",
    title: "Dutch Guilder Collapse (1780–1795)",
    timeline: [
      { date: "1650–1780", event: "Dutch Republic at peak: world's financial centre, Debt/GDP manageable via trade surpluses." },
      { date: "1780–1784", event: "Fourth Anglo-Dutch War: British blockade destroys trade. Debt spirals." },
      { date: "1784–1787", event: "Multiple failed stabilisation attempts. Capital flight to London." },
      { date: "1787", event: "Prussian military intervention to restore order — temporary." },
      { date: "1795", event: "French invasion: Batavian Republic. Guilder ceases to function. British pound absorbs reserve role." },
    ],
    outcome: "15 years. Most relevant precedent for the US: large sophisticated creditor economy that lost reserve status with no external manager to coordinate a soft landing.",
  },
  {
    icon: "🇦🇷",
    title: "Argentina Default (1999–2002)",
    timeline: [
      { date: "1999", event: "Convertibility (peso pegged 1:1 to dollar) under severe strain. Recession deepens." },
      { date: "2001 Mar", event: "Economy minister resigns. IMF suspends support." },
      { date: "2001 Nov", event: "Corralito: deposits frozen. Bank runs begin." },
      { date: "2001 Dec", event: "President de la Rúa resigns. Five presidents in 10 days." },
      { date: "2002 Jan", event: "Convertibility abandoned. Peso devalued 75%. Debt restructured ($100B default)." },
      { date: "2002–2003", event: "Economic contraction 10.9%. Unemployment peaks 21.5%." },
    ],
    outcome: "2 years from stress to resolution. Largest sovereign default in history at the time. Middle class savings destroyed by forced peso conversion from dollar accounts.",
  },
];

// ─── CACHE HELPERS ─────────────────────────────────────────────────────────

const CACHE_PREFIX = "spice_crisis_v1_";

function cacheKey(r) {
  const r1 = v => Math.round(v * 10) / 10;
  return `${CACHE_PREFIX}${r.year}-${r1(r.debtGDP)}-${r1(r.unemp)}-${r1(r.infl)}-${Math.round(r.yld * 100) / 100}-${r1(r.cryptoFlight)}`;
}

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > 90 * 24 * 60 * 60 * 1000) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function setCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// ─── CRISIS CARD ────────────────────────────────────────────────────────────

function CrisisCard({ ct }) {
  const [open, setOpen] = useState(false);
  const S = {
    card: { background:"#fff", border:`1px solid ${ct.borderColor}`, display:"flex", flexDirection:"column" },
    header: { background:ct.bg, borderBottom:`1px solid ${ct.borderColor}`, padding:"20px 20px 16px", textAlign:"center" },
    icon: { fontSize:32, marginBottom:8 },
    type: { fontSize:8, fontWeight:700, color:ct.color, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:3 },
    name: { fontSize:14, fontWeight:700, color:"#111", marginBottom:4 },
    dur:  { fontSize:9, color:"#888" },
    body: { padding:"16px 18px", flex:1 },
    sHead: { fontSize:8, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:7, marginTop:14 },
    ex:   { fontSize:9, color:"#555", lineHeight:1.7, marginBottom:4 },
    exName: { fontWeight:700, color:"#111" },
    exDetail: { color:"#888", fontSize:8 },
    bullet: { fontSize:10, color:"#333", lineHeight:1.7, marginBottom:3, paddingLeft:12, position:"relative" },
    dot: { position:"absolute", left:0, color:ct.color },
    barWrap: { background:"#f5f5f5", padding:"10px 12px", marginTop:12, marginBottom:4 },
    barLabel: { fontSize:7, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 },
    barTrack: { background:"#e5e5e5", height:12, borderRadius:2, marginBottom:6, overflow:"hidden" },
    barFill: { height:"100%", borderRadius:2, display:"flex", alignItems:"center", paddingLeft:6,
      fontSize:7, fontWeight:700, color:"#fff" },
    mod: { background:ct.bg, padding:"10px 12px", marginTop:8 },
    modHead: { fontSize:8, fontWeight:700, color:ct.color, marginBottom:5 },
    toggle: { fontSize:8, color:ct.color, cursor:"pointer", background:"none", border:"none",
      fontFamily:"'IBM Plex Mono',monospace", padding:"8px 0", textDecoration:"underline" },
    dive: { borderTop:`1px solid ${ct.borderColor}`, padding:"12px 18px", background:ct.bg },
    diveT: { fontSize:8, color:"#555", lineHeight:1.8 },
  };

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div style={S.icon}>{ct.icon}</div>
        <div style={S.type}>{ct.type}</div>
        <div style={S.name}>{ct.name}</div>
        <div style={S.dur}>{ct.duration}</div>
      </div>
      <div style={S.body}>

        <div style={S.sHead}>Historical Examples</div>
        {ct.examples.map(ex => (
          <div key={ex.name} style={S.ex}>
            <span style={S.exName}>{ex.name} ({ex.year})</span> — {ex.duration}
            <div style={S.exDetail}>{ex.detail}</div>
          </div>
        ))}

        <div style={S.sHead}>Classic Pattern</div>
        {ct.pattern.map((p, i) => (
          <div key={i} style={S.bullet}>
            <span style={S.dot}>→</span>{p}
          </div>
        ))}

        <div style={S.barWrap}>
          <div style={S.barLabel}>Timeline</div>
          <div style={{ ...S.barLabel, marginBottom:2 }}>Classic</div>
          <div style={S.barTrack}>
            <div style={{ ...S.barFill, width:`${ct.classicBar}%`, background:"#cbd5e1" }}>
              {ct.classicLabel}
            </div>
          </div>
          <div style={{ ...S.barLabel, marginBottom:2 }}>AI / Crypto Era</div>
          <div style={S.barTrack}>
            <div style={{ ...S.barFill, width:`${ct.aiBar}%`, background:ct.color }}>
              {ct.aiLabel}
            </div>
          </div>
        </div>

        <div style={S.mod}>
          <div style={S.modHead}>🤖 AI Modifications</div>
          {ct.aiMods.map((m, i) => (
            <div key={i} style={{ ...S.bullet, fontSize:9 }}>
              <span style={S.dot}>•</span>{m}
            </div>
          ))}
        </div>

        <div style={{ ...S.mod, marginTop:6 }}>
          <div style={{ ...S.modHead }}>₿ Crypto Modifications</div>
          {ct.cryptoMods.map((m, i) => (
            <div key={i} style={{ ...S.bullet, fontSize:9 }}>
              <span style={S.dot}>•</span>{m}
            </div>
          ))}
        </div>

        <button style={S.toggle} onClick={() => setOpen(o => !o)}>
          {open ? "▲ Hide" : "▼ Historical deep dive"}
        </button>
      </div>

      {open && (
        <div style={S.dive}>
          <div style={{ fontSize:9, fontWeight:700, color:"#111", marginBottom:8 }}>{ct.deepDive.title}</div>
          {ct.deepDive.timeline.map((t, i) => (
            <div key={i} style={S.diveT}>
              <span style={{ fontWeight:700, color:"#555" }}>{t.date}</span> — {t.event}
            </div>
          ))}
          <div style={{ marginTop:10, fontSize:9, color:"#555", lineHeight:1.7,
            borderTop:"1px solid #e5e5e5", paddingTop:8 }}>
            {ct.deepDive.outcome}
          </div>
          <div style={{ marginTop:6, fontSize:9, color:"#888", lineHeight:1.7, fontStyle:"italic" }}>
            {ct.deepDive.lesson}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

export default function CrisisScenarios() {
  const [analysis,     setAnalysis]     = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError,     setGenError]     = useState(false);
  const [openDives,    setOpenDives]    = useState({});
  const hasFetched = useRef(false);

  // Load sim state from localStorage
  const saved = loadSimState();
  const simState = saved
    ? (() => {
        const { rows } = runSim(saved.displaced ?? 0.40, saved.fiscalId ?? "none",
          saved.monetaryId ?? "none", saved.cryptoAdopt ?? 0.5, saved.cryptoPolicy ?? "ban");
        return rows.find(r => r.year === (saved.kpiYear ?? 2035)) || rows[rows.length - 1];
      })()
    : null;

  useEffect(() => {
    if (hasFetched.current || !simState) return;
    hasFetched.current = true;

    const key = cacheKey(simState);
    const cached = getCached(key);
    if (cached) { setAnalysis(cached); return; }

    setIsGenerating(true);
    fetch("/api/crisis-pattern", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(simState),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.error) throw new Error();
        setAnalysis(data.analysis);
        setCache(key, data.analysis);
      })
      .catch(() => setGenError(true))
      .finally(() => setIsGenerating(false));
  }, []);

  const parsed = parseAnalysis(analysis);
  const lvl = simState ? SIM_LEVELS[simState.spiceLevel] : null;

  const F = "'IBM Plex Mono',monospace";

  return (
    <div style={{ background:"#fff", color:"#111", fontFamily:F,
      maxWidth:1200, margin:"0 auto", padding:"32px 24px 64px" }}>

      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:800, marginBottom:40 }}>
        <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
          letterSpacing:"0.18em", marginBottom:8 }}>
          SPICE Research — Dalio Framework + AI/Crypto Wildcards
        </div>
        <h1 style={{ fontSize:28, fontWeight:700, margin:"0 0 12px",
          fontFamily:F, lineHeight:1.2 }}>
          Crisis <span style={{ color:"#B8860B" }}>Scenarios</span>
        </h1>
        <p style={{ fontSize:12, color:"#555", lineHeight:1.8, margin:"0 0 20px" }}>
          When a reserve currency fails, it doesn't follow a single pattern.
          History reveals three distinct crisis types, each with different triggers,
          timelines, and outcomes. AI and crypto fundamentally alter how each pattern
          unfolds — compressing timelines and removing the policy buffers that made
          historical managed transitions possible.
        </p>
        <div style={{ background:"#fafafa", border:"1px solid #e2e2e2",
          padding:"14px 18px", fontSize:10, color:"#555", lineHeight:1.8 }}>
          <span style={{ fontWeight:700, color:"#111" }}>Framework: </span>
          Ray Dalio's 500-year analysis of reserve currency cycles (Dutch Guilder 1600s,
          British Pound 1800s, US Dollar 1900s) identifies consistent patterns.
          Three structural wildcards absent from all prior collapses modify each pattern:
          AI-driven deflation, digital capital flight, and the absence of an external
          transition manager.
        </div>
      </div>

      {/* ── THREE CRISIS CARDS ────────────────────────────────────────── */}
      <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
        letterSpacing:"0.14em", marginBottom:14 }}>Three Historical Patterns</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:48 }}>
        {CRISIS_TYPES.map(ct => <CrisisCard key={ct.type} ct={ct} />)}
      </div>

      {/* ── AI PATTERN ANALYSIS ───────────────────────────────────────── */}
      <div style={{ borderTop:"2px solid #f0f0f0", paddingTop:36, marginBottom:48 }}>
        <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
          letterSpacing:"0.14em", marginBottom:6 }}>
          Your Simulation Analysis
        </div>
        <div style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>
          AI Pattern Match
        </div>

        {simState ? (
          <>
            {/* KPI display */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)",
              gap:6, marginBottom:20 }}>
              {[
                { label:"Year",      value:simState.year,          color:"#111" },
                { label:"Debt/GDP",  value:`${simState.debtGDP}%`, color:"#ef4444" },
                { label:"Unemp",     value:`${simState.unemp}%`,   color:"#8b5cf6" },
                { label:"Inflation", value:`${simState.infl}%`,    color:"#3b82f6" },
                { label:"Yield",     value:`${simState.yld}%`,     color:"#eab308" },
                { label:"Level",     value:lvl?.label,             color:lvl?.color },
              ].map(k => (
                <div key={k.label} style={{ background:"#f9f9f9",
                  border:"1px solid #ebebeb", padding:"6px 8px" }}>
                  <div style={{ fontSize:7, color:"#bbb", textTransform:"uppercase",
                    letterSpacing:"0.1em", marginBottom:2 }}>{k.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Analysis */}
            <div style={{ border:"1px solid #e2e2e2", padding:"20px 22px" }}>
              {genError ? (
                <span style={{ fontSize:10, color:"#aaa" }}>
                  Unable to generate analysis. Check API configuration.
                </span>
              ) : isGenerating ? (
                <span style={{ fontSize:10, color:"#ccc" }}>Analysing pattern match...</span>
              ) : parsed ? (
                parsed.map(section => (
                  <div key={section.heading} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:8, fontWeight:700, color:"#555",
                      textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>
                      {section.heading}
                    </div>
                    <ul style={{ margin:0, paddingLeft:14 }}>
                      {section.bullets.map((b, i) => (
                        <li key={i} style={{ fontSize:11, color:"#333",
                          lineHeight:1.7, marginBottom:3 }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <span style={{ fontSize:10, color:"#ccc" }}>Loading...</span>
              )}
              <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:10, marginTop:8,
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:7, color:"#ccc" }}>
                  Based on simulation state from The Collision page. Visit{" "}
                  <Link to="/collision" style={{ color:"#B8860B" }}>The Collision</Link>{" "}
                  to adjust scenario.
                </span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ background:"#fafafa", border:"1px solid #e2e2e2",
            padding:"20px 22px", fontSize:10, color:"#aaa" }}>
            No simulation state found. Visit{" "}
            <Link to="/collision" style={{ color:"#B8860B" }}>The Collision</Link>{" "}
            to run a scenario first.
          </div>
        )}
      </div>

      {/* ── BEYOND THE CRISIS ────────────────────────────────────────── */}
      <div style={{ borderTop:"2px solid #f0f0f0", paddingTop:36, marginBottom:48 }}>
        <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
          letterSpacing:"0.14em", marginBottom:6 }}>Post-2035 — Speculative</div>
        <div style={{ fontSize:18, fontWeight:700, marginBottom:12 }}>
          Beyond the Crisis: The Monetary Reset Question
        </div>
        <p style={{ fontSize:11, color:"#555", lineHeight:1.8, marginBottom:10, maxWidth:780 }}>
          This simulation models the crisis itself — the collision between unsustainable
          sovereign debt, AI-driven deflation, and crypto-enabled capital flight. The
          investment thesis is straightforward: hedge the transition with hard assets.
          What comes after the crisis is deliberately out of scope.
        </p>
        <div style={{ background:"#fafafa", border:"1px solid #e2e2e2",
          padding:"12px 16px", fontSize:10, color:"#555", lineHeight:1.8,
          marginBottom:28, maxWidth:780 }}>
          <strong style={{ color:"#111" }}>We make no prediction.</strong> History shows
          reserve currency transitions resolve in unexpected ways. Three scenarios — all
          possible, none certain.
        </div>

        {/* Scenario cards */}
        {[
          {
            num: "01",
            icon: "₿",
            title: "The Bitcoin Standard",
            sub: "Permissionless Reset",
            color: "#f59e0b",
            bg: "#fffbeb",
            border: "#fde68a",
            analog: "Gold Standard 1870s — countries chose it voluntarily for credibility",
            thesis: "Bitcoin becomes the global reserve because it is the only credible neutral option — neither US nor China controls it, its supply is fixed, and by 2034–35 network effects from crisis adoption make it the path-dependent choice.",
            pros: [
              "Post-crisis populations demand sound money — historical pattern after hyperinflation",
              "Neutrality — no nation controls it, acceptable compromise in multipolar world",
              "Network effects — 40–60% already using = liquidity, infrastructure, familiarity",
              "Can't be suspended by any government — unlike gold standard abandoned in wartime",
            ],
            cons: [
              "Governments lose monetary control — existential threat, fierce resistance",
              "Volatility remains high — problematic for reserve currency function",
              "Coordination problem — who moves first? First-mover political risk",
              "Authoritarian rejection — China, Russia refuse to participate",
            ],
            timeline: "2033: Political capitulation in democracies · 2034: First major economy adopts · 2035–38: Global cascade",
          },
          {
            num: "02",
            icon: "🌐",
            title: "Multipolar Fragmentation",
            sub: "No Single Reserve",
            color: "#3b82f6",
            bg: "#eff6ff",
            border: "#bfdbfe",
            analog: "Pre-1914 system — British pound, French franc, German mark all functioned as reserves; gold was the neutral settlement layer",
            thesis: "No single reserve emerges. Dollar weakened, yuan constrained, euro structural. Bitcoin becomes the neutral settlement layer between regional blocs — not a global reserve but a bridge.",
            pros: [
              "Reflects geopolitical reality — multipolar world, no single hegemon prepared",
              "Bitcoin acceptable to all sides — neutral, no political strings attached",
              "Allows domestic monetary control — governments keep fiat for local use",
              "Pragmatic compromise — doesn't require full Bitcoin standard",
            ],
            cons: [
              "High coordination costs — multiple currencies create friction and complexity",
              "Volatility problematic for daily trade settlement",
              "Unstable equilibrium — tends to collapse into Scenario 1 or 3 over time",
              "Nationalist resistance — governments prefer full monetary sovereignty",
            ],
            timeline: "2029–35: Regional blocs solidify · 2033–36: Bitcoin emerges as neutral settlement · 2040+: Fragmented equilibrium",
          },
          {
            num: "03",
            icon: "🔒",
            title: "CBDC Authoritarianism",
            sub: "Bifurcated World",
            color: "#64748b",
            bg: "#f8fafc",
            border: "#cbd5e1",
            analog: "Cold War monetary split — dollar bloc vs ruble bloc; two incompatible systems, limited interchange",
            thesis: "Authoritarian states (China, Russia) enforce Central Bank Digital Currencies. Democratic states capitulate to voter pressure and legalise crypto. Result: a digital iron curtain splitting the global monetary system.",
            pros: [
              "China demonstrates enforcement can work — 2021 crypto ban partially succeeded domestically",
              "CBDCs attractive to autocrats — surveillance, programmable controls, capital management",
              "Democratic voter pressure forces crypto adoption — political survival requires it",
              "Reflects existing ideological divide between authoritarian and democratic systems",
            ],
            cons: [
              "Brain drain unsustainable — talent and capital flee the authoritarian bloc",
              "Underground markets persist — even China cannot fully suppress crypto",
              "Economic underperformance — closed systems lose to open crypto economies over time",
              "Authoritarian holdouts eventually forced to engage or fall irreversibly behind",
            ],
            timeline: "2030–35: CBDC enforcement in authoritarian states · 2033–36: Democratic crypto legalisation · 2037+: Bifurcated equilibrium",
          },
        ].map(sc => (
          <div key={sc.num} style={{ border:`1px solid ${sc.border}`, marginBottom:16,
            background:"#fff" }}>
            <div style={{ background:sc.bg, borderBottom:`1px solid ${sc.border}`,
              padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>{sc.icon}</span>
              <div>
                <div style={{ fontSize:8, color:sc.color, fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:2 }}>
                  Scenario {sc.num} — {sc.sub}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:"#111" }}>{sc.title}</div>
              </div>
            </div>
            <div style={{ padding:"16px 18px" }}>
              <div style={{ fontSize:10, color:"#555", lineHeight:1.8, marginBottom:12 }}>
                {sc.thesis}
              </div>
              <div style={{ fontSize:8, color:"#888", fontStyle:"italic",
                marginBottom:14, paddingLeft:10, borderLeft:`2px solid ${sc.color}40` }}>
                Historical analogue: {sc.analog}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:8, fontWeight:700, color:"#22c55e",
                    textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>
                    Why it could work
                  </div>
                  {sc.pros.map((p, i) => (
                    <div key={i} style={{ fontSize:9, color:"#333", lineHeight:1.7,
                      marginBottom:3, paddingLeft:12, position:"relative" }}>
                      <span style={{ position:"absolute", left:0, color:"#22c55e" }}>✓</span>
                      {p}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:8, fontWeight:700, color:"#ef4444",
                    textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>
                    Why it could fail
                  </div>
                  {sc.cons.map((c, i) => (
                    <div key={i} style={{ fontSize:9, color:"#333", lineHeight:1.7,
                      marginBottom:3, paddingLeft:12, position:"relative" }}>
                      <span style={{ position:"absolute", left:0, color:"#ef4444" }}>✗</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize:8, color:"#888", background:"#f9f9f9",
                padding:"6px 10px", borderLeft:`3px solid ${sc.color}` }}>
                {sc.timeline}
              </div>
            </div>
          </div>
        ))}

        {/* SPICE Position */}
        <div style={{ border:"2px solid #B8860B", background:"#fffdf5",
          padding:"20px 22px", marginBottom:24 }}>
          <div style={{ fontSize:9, color:"#B8860B", fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>
            The SPICE Position — Agnostic on Endgame
          </div>
          <p style={{ fontSize:11, color:"#333", lineHeight:1.8, margin:"0 0 10px" }}>
            We don't know which scenario prevails. What we do know:
          </p>
          {[
            "Current system is unsustainable — Dollar reserve + Debt/GDP >175% + AI deflation = structural break",
            "Crisis window 2029–2035 — bond market break, hyperinflation/deflation collision, acute phase",
            "Hard assets outperform — empirical law during every reserve currency transition",
            "Post-crisis order takes decades — stabilisation period 2035–2050+",
          ].map((p, i) => (
            <div key={i} style={{ fontSize:10, color:"#333", lineHeight:1.7,
              marginBottom:4, paddingLeft:14, position:"relative" }}>
              <span style={{ position:"absolute", left:0, color:"#B8860B" }}>◈</span>
              {p}
            </div>
          ))}
          <div style={{ borderTop:"1px solid #e2d5a0", marginTop:14, paddingTop:12,
            fontSize:12, fontWeight:700, color:"#111", lineHeight:1.6 }}>
            SPICE hedges the transition, not the endpoint. We're not betting on the
            new world order — we're betting against the current one.
          </div>
        </div>

        {/* Performance table */}
        <div style={{ marginBottom:24, overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse",
            fontFamily:F, fontSize:10 }}>
            <thead>
              <tr style={{ background:"#f5f5f5" }}>
                {["Scenario", "Outcome", "SPICE Performance"].map(h => (
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left",
                    fontSize:8, color:"#555", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.08em", border:"1px solid #e2e2e2" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Scenario 1 — Bitcoin Standard",          "Bitcoin becomes global reserve",                "Wins big — 10–50× from crisis lows, secular bull 2035+"],
                ["Scenario 2 — Multipolar Fragmentation",  "Bitcoin as trade settlement layer",             "Wins medium — 5–15× from crisis lows, stable role 2035+"],
                ["Scenario 3 — CBDC Authoritarianism",     "Bitcoin niche asset in democratic world",       "Wins small — 3–8× from crisis lows, regional adoption"],
                ["No crisis — system stabilises",          "Debt/GDP stabilises, no structural break",      "Loses — opportunity cost vs equities"],
              ].map(([sc, out, perf], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding:"8px 12px", border:"1px solid #e2e2e2",
                    fontWeight:700, color:"#111" }}>{sc}</td>
                  <td style={{ padding:"8px 12px", border:"1px solid #e2e2e2",
                    color:"#555" }}>{out}</td>
                  <td style={{ padding:"8px 12px", border:"1px solid #e2e2e2",
                    color: i === 3 ? "#ef4444" : "#16a34a", fontWeight:700 }}>{perf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Further reading */}
        <div style={{ background:"#fafafa", border:"1px solid #e2e2e2",
          padding:"14px 18px", marginBottom:24 }}>
          <div style={{ fontSize:8, fontWeight:700, color:"#555",
            textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
            Further Reading
          </div>
          {[
            ["Scenario 1 (Bitcoin Standard)", "Ammous, The Bitcoin Standard (2018) · Gladstein, Check Your Financial Privilege (2022)"],
            ["Scenario 2 (Multipolar)",        "Eichengreen, Exorbitant Privilege (2011) · Prasad, The Dollar Trap (2014)"],
            ["Scenario 3 (CBDC)",              "Brunnermeier et al., The Digitalization of Money (2019) · BIS Working Papers on CBDCs"],
            ["Historical precedent",           "Kindleberger, A Financial History of Western Europe (1984) · Eichengreen, Globalizing Capital (2008)"],
          ].map(([label, refs]) => (
            <div key={label} style={{ fontSize:9, color:"#555", lineHeight:1.7,
              marginBottom:4 }}>
              <span style={{ fontWeight:700, color:"#111" }}>{label}:</span> {refs}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign:"center", padding:"24px 0 8px" }}>
          <div style={{ fontSize:10, color:"#888", marginBottom:10 }}>
            Ready to hedge the transition?
          </div>
          <Link to="/coin" style={{ display:"inline-block",
            background:"#B8860B", color:"#fff", padding:"10px 24px",
            fontFamily:F, fontSize:11, fontWeight:700,
            textDecoration:"none", letterSpacing:"0.08em" }}>
            Explore the SPICE Vault →
          </Link>
        </div>
      </div>

      {/* ── HISTORICAL DEEP DIVES ─────────────────────────────────────── */}
      <div style={{ borderTop:"2px solid #f0f0f0", paddingTop:36 }}>
        <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
          letterSpacing:"0.14em", marginBottom:6 }}>Historical Record</div>
        <div style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>
          Deep Dives
        </div>

        {DEEP_DIVES.map((d, i) => (
          <div key={d.title} style={{ border:"1px solid #e2e2e2", marginBottom:8 }}>
            <button
              onClick={() => setOpenDives(o => ({ ...o, [i]: !o[i] }))}
              style={{ display:"flex", alignItems:"center", gap:12, width:"100%",
                textAlign:"left", padding:"14px 18px", background:"none", border:"none",
                cursor:"pointer", fontFamily:F }}>
              <span style={{ fontSize:20 }}>{d.icon}</span>
              <span style={{ fontSize:11, fontWeight:700, color:"#111", flex:1 }}>{d.title}</span>
              <span style={{ fontSize:10, color:"#aaa" }}>{openDives[i] ? "▲" : "▼"}</span>
            </button>
            {openDives[i] && (
              <div style={{ padding:"0 18px 18px 50px", borderTop:"1px solid #f0f0f0" }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#555",
                  textTransform:"uppercase", letterSpacing:"0.1em",
                  margin:"14px 0 8px" }}>Timeline</div>
                {d.timeline.map((t, j) => (
                  <div key={j} style={{ fontSize:10, color:"#333", lineHeight:1.8,
                    marginBottom:2 }}>
                    <span style={{ fontWeight:700, color:"#555", minWidth:80,
                      display:"inline-block" }}>{t.date}</span>
                    {" — "}{t.event}
                  </div>
                ))}
                <div style={{ marginTop:12, padding:"10px 14px", background:"#f9f9f9",
                  border:"1px solid #ebebeb", fontSize:10, color:"#555", lineHeight:1.7 }}>
                  {d.outcome}
                </div>
              </div>
            )}
          </div>
        ))}

        <div style={{ fontSize:7, color:"#ccc", marginTop:20, lineHeight:1.8 }}>
          Sources: Dalio (2021) Changing World Order · Reinhart &amp; Rogoff NBER w15639 ·
          Reinhart &amp; Sbrancia (2015) · CBO 2025 · IMF WP/2025/076
        </div>
      </div>
    </div>
  );
}
