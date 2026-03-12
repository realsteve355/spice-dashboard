import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import {
  ANCHORS, FISCAL_POLICIES, MONETARY_POLICIES, SIM_LEVELS, runSim,
  IMPACT_GROUPS, impactCacheKey, getCached, setCache, parseAnalysis,
} from "../lib/sim-engine";

// ─── CONTROLS (shared left-panel sub-components) ────────────────────────────

function PolicyButton({ label, desc, active, color, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display:"block", width:"100%", textAlign:"left", cursor:"pointer",
        padding:"5px 7px", marginBottom:3,
        background: active ? `${color}0f` : "transparent",
        border: `1px solid ${active ? color : "#e8e8e8"}`,
        fontFamily:"'IBM Plex Mono',monospace" }}>
      <div style={{ fontSize:9, fontWeight:700, color: active ? color : "#555" }}>{label}</div>
      <div style={{ fontSize:7, color:"#aaa", marginTop:1, lineHeight:1.4 }}>{desc}</div>
    </button>
  );
}

// ─── IMPACT CARD ────────────────────────────────────────────────────────────

function ImpactCard({ group, text, isGenerating, genError }) {
  const parsed = parseAnalysis(text);
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e2e2", padding:"20px 22px",
      display:"flex", flexDirection:"column" }}>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#111",
          textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
          {group.label}
        </div>
        <div style={{ fontSize:8, color:"#999" }}>{group.sub}</div>
      </div>
      <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:14, flex:1 }}>
        {genError ? (
          <span style={{ fontSize:10, color:"#aaa" }}>Unable to generate analysis. Check API configuration.</span>
        ) : isGenerating && !parsed ? (
          <span style={{ fontSize:10, color:"#ccc" }}>Analysing impact...</span>
        ) : parsed ? (
          parsed.map(section => (
            <div key={section.heading} style={{ marginBottom:14 }}>
              <div style={{ fontSize:8, fontWeight:700, color:"#555",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>
                {section.heading}
              </div>
              <ul style={{ margin:0, paddingLeft:14 }}>
                {section.bullets.map((b, i) => (
                  <li key={i} style={{ fontSize:11, color:"#333", lineHeight:1.7,
                    marginBottom:3, fontFamily:"'IBM Plex Mono',monospace" }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <span style={{ fontSize:10, color:"#ccc" }}>Loading...</span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

export default function Impact() {
  const [displaced,    setDisplaced]    = useState(0.40);
  const [fiscalId,     setFiscalId]     = useState("none");
  const [monetaryId,   setMonetaryId]   = useState("none");
  const [kpiYear,      setKpiYear]      = useState(2035);
  const [cryptoAdopt,  setCryptoAdopt]  = useState(0.5);
  const [cryptoPolicy, setCryptoPolicy] = useState("ban");
  const [, startTransition]             = useTransition();
  const [analyses,     setAnalyses]     = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError,     setGenError]     = useState(false);
  const debounceRef = useRef(null);

  const { rows, firstYear } = useMemo(
    () => runSim(displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy),
    [displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy]
  );

  const last    = rows.find(r => r.year === kpiYear) || rows[rows.length - 1];
  const anchor  = ANCHORS.reduce((a, b) =>
    Math.abs(a.pct - displaced) < Math.abs(b.pct - displaced) ? a : b);
  const lvl     = SIM_LEVELS[last.spiceLevel];

  // Debounced analysis generation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const key    = impactCacheKey(last);
      const cached = getCached(key);
      if (cached) { setAnalyses(cached); setGenError(false); return; }
      setIsGenerating(true);
      setGenError(false);
      try {
        const res = await fetch("/api/human-impact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(last),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAnalyses(data);
        setCache(key, data);
      } catch {
        setGenError(true);
      } finally {
        setIsGenerating(false);
      }
    }, 600);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last.year, last.debtGDP, last.unemp, last.infl, last.yld, last.cryptoFlight, last.labShare, last.capShare]);

  const axTick = { fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fill:"#bbb" };

  return (
    <div style={{ background:"#fff", color:"#111", fontFamily:"'IBM Plex Mono',monospace",
      display:"flex", height:"100vh", overflow:"hidden", maxWidth:1200, margin:"0 auto" }}>

      {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
      <div style={{ width:220, flexShrink:0, borderRight:"1px solid #f0f0f0",
        padding:"12px 12px", overflowY:"auto", background:"#fafafa" }}>

        {/* Header */}
        <div style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>
          Human <span style={{ color:"#B8860B" }}>Impact</span>
        </div>

        {/* Displacement */}
        <div style={{ fontSize:10, color:"#555", lineHeight:1.5, marginBottom:7 }}>
          What fraction of knowledge workers will be substantially displaced by AI{" "}
          <strong style={{ color:"#111" }}>BY 2030?</strong>
        </div>
        <input type="range" min={0} max={0.65} step={0.01} value={displaced}
          onChange={ev => { const v = +ev.target.value; startTransition(() => setDisplaced(v)); }}
          style={{ width:"100%", accentColor:"#B8860B", cursor:"pointer", marginBottom:4 }} />
        <div style={{ position:"relative", height:26, marginBottom:6 }}>
          {ANCHORS.map(a => {
            const lp = (a.pct / 0.65) * 100;
            const on = a === anchor;
            return (
              <div key={a.label} onClick={() => setDisplaced(a.pct)}
                style={{ position:"absolute", left:`${lp}%`, transform:"translateX(-50%)",
                  textAlign:"center", cursor:"pointer" }}>
                <div style={{ width:1, height:5, margin:"0 auto 2px", background:on?"#B8860B":"#ddd" }} />
                <div style={{ fontSize:8, whiteSpace:"nowrap", fontWeight:on?700:400,
                  color:on?"#B8860B":"#ccc" }}>{a.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ background:"#fff", border:"1px solid #ebebeb", padding:"5px 8px",
          fontSize:8, color:"#888", lineHeight:1.6, marginBottom:11 }}>
          <span style={{ color:"#B8860B", fontWeight:700 }}>
            {anchor.label} — {Math.round(displaced*100)}%
          </span><br />{anchor.desc}
        </div>

        <div style={{ borderTop:"1px solid #ebebeb", marginBottom:9 }} />

        {/* Crypto flight */}
        <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
          letterSpacing:"0.1em", marginBottom:6 }}>Crypto Flight Speed</div>
        <input type="range" min={0} max={1} step={0.05} value={cryptoAdopt}
          onChange={ev => { const v = +ev.target.value; startTransition(() => setCryptoAdopt(v)); }}
          style={{ width:"100%", accentColor:"#93c5fd", cursor:"pointer", marginBottom:4 }} />
        <div style={{ position:"relative", height:22, marginBottom:6 }}>
          {[{v:0,l:"None"},{v:0.25,l:"Slow"},{v:0.5,l:"Moderate"},{v:0.75,l:"Fast"},{v:1,l:"Venezuela"}].map(a => {
            const lp = a.v * 100;
            const on = Math.abs(a.v - cryptoAdopt) < 0.13;
            return (
              <div key={a.l} onClick={() => setCryptoAdopt(a.v)}
                style={{ position:"absolute", left:`${lp}%`, transform:"translateX(-50%)",
                  textAlign:"center", cursor:"pointer" }}>
                <div style={{ width:1, height:4, margin:"0 auto 2px", background:on?"#93c5fd":"#ddd" }} />
                <div style={{ fontSize:7, whiteSpace:"nowrap", fontWeight:on?700:400,
                  color:on?"#60a5fa":"#ccc" }}>{a.l}</div>
              </div>
            );
          })}
        </div>

        <div style={{ borderTop:"1px solid #ebebeb", marginBottom:9 }} />
        <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
          letterSpacing:"0.1em", marginBottom:7 }}>Government Response</div>

        <div style={{ fontSize:8, color:"#22c55e", fontWeight:700, textTransform:"uppercase",
          letterSpacing:"0.08em", marginBottom:4 }}>Fiscal</div>
        {FISCAL_POLICIES.map(opt => (
          <PolicyButton key={opt.id} label={opt.label} desc={opt.desc}
            active={fiscalId===opt.id} color="#22c55e"
            onClick={() => setFiscalId(opt.id)} />
        ))}

        <div style={{ fontSize:8, color:"#ef4444", fontWeight:700, textTransform:"uppercase",
          letterSpacing:"0.08em", marginTop:7, marginBottom:4 }}>Monetary</div>
        {MONETARY_POLICIES.map(opt => (
          <PolicyButton key={opt.id} label={opt.label} desc={opt.desc}
            active={monetaryId===opt.id} color="#ef4444"
            onClick={() => setMonetaryId(opt.id)} />
        ))}

        <div style={{ borderTop:"1px solid #ebebeb", margin:"9px 0 7px" }} />
        <div style={{ fontSize:8, color:"#93c5fd", fontWeight:700, textTransform:"uppercase",
          letterSpacing:"0.08em", marginBottom:4 }}>Crypto Policy</div>
        {[
          { id:"ban",  label:"Ban & restrict",       desc:"Capital controls + exchange bans." },
          { id:"tax",  label:"Tax & regulate",       desc:"On-chain reporting, capital gains tax." },
          { id:"none", label:"Ignore / accommodate", desc:"No intervention. Flight unimpeded." },
        ].map(opt => (
          <PolicyButton key={opt.id} label={opt.label} desc={opt.desc}
            active={cryptoPolicy===opt.id} color="#93c5fd"
            onClick={() => setCryptoPolicy(opt.id)} />
        ))}

        <div style={{ borderTop:"1px solid #ebebeb", margin:"9px 0 7px" }} />
        <div style={{ fontSize:7, color:"#ccc", lineHeight:1.9 }}>
          {SIM_LEVELS.map(lm => (
            <div key={lm.label}><span style={{ color:lm.color }}>■ </span>
              <span style={{ color:"#bbb" }}>{lm.label}</span></div>
          ))}
          <div style={{ marginTop:4, lineHeight:1.5 }}>
            CBO · IMF WP/2025/076 · Reinhart-Rogoff
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div style={{ flex:1, overflow:"auto", padding:"14px 16px",
        display:"flex", flexDirection:"column" }}>

        {/* Header row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom:"1px solid #f0f0f0", paddingBottom:10, marginBottom:12, flexShrink:0 }}>
          <div>
            <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
              letterSpacing:"0.18em", marginBottom:3 }}>Human Impact Analysis</div>
            <div style={{ fontSize:13, color:"#555" }}>
              Real-world effects on households at{" "}
              <span style={{ fontWeight:700, color:"#111" }}>{kpiYear}</span>
              {isGenerating && <span style={{ marginLeft:10, fontSize:9, color:"#aaa" }}>analysing...</span>}
            </div>
          </div>
          {/* Crisis level badges */}
          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            {SIM_LEVELS.map((lm, i) => {
              const yr = firstYear[i];
              return (
                <div key={lm.label}
                  style={{ padding:"3px 7px", fontSize:9, fontWeight:700,
                    background: yr ? lm.bg : "#f5f5f5",
                    border:`1px solid ${yr ? lm.color : "#ddd"}`,
                    color: yr ? lm.color : "#ccc",
                    minWidth:34, textAlign:"center" }}>
                  {yr ? String(yr).slice(2) : "—"}
                </div>
              );
            })}
          </div>
        </div>

        {/* Snapshot year selector */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexShrink:0 }}>
          <span style={{ fontSize:8, color:"#aaa", textTransform:"uppercase",
            letterSpacing:"0.1em", whiteSpace:"nowrap" }}>Snapshot year</span>
          <input type="range" min={2026} max={2035} step={1} value={kpiYear}
            onChange={ev => setKpiYear(+ev.target.value)}
            style={{ flex:1, accentColor:`${lvl.color}`, cursor:"pointer" }} />
          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
            {rows.map(r => {
              const lm = SIM_LEVELS[r.spiceLevel];
              return (
                <span key={r.year} onClick={() => setKpiYear(r.year)}
                  style={{ fontSize:7, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace",
                    fontWeight: r.year===kpiYear ? 700 : 400,
                    color: r.year===kpiYear ? lm.color : "#ccc" }}>
                  {r.year}
                </span>
              );
            })}
          </div>
        </div>

        {/* Key metrics for snapshot year */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)",
          gap:5, marginBottom:14, flexShrink:0 }}>
          {[
            { label:"Debt/GDP",   value:`${last.debtGDP}%`, color:"#ef4444" },
            { label:"Unemp",      value:`${last.unemp}%`,   color:"#8b5cf6" },
            { label:"Inflation",  value:`${last.infl}%`,    color:"#3b82f6" },
            { label:"10Y Yield",  value:`${last.yld}%`,     color:"#eab308" },
            { label:"Labour",     value:`${last.labShare}%`,color:"#22c55e" },
            { label:"Level",      value:lvl.label,          color:lvl.color },
          ].map(k => (
            <div key={k.label} style={{ background:"#f9f9f9", border:"1px solid #ebebeb",
              padding:"5px 8px" }}>
              <div style={{ fontSize:7, color:"#bbb", textTransform:"uppercase",
                letterSpacing:"0.1em", marginBottom:2 }}>{k.label}</div>
              <div style={{ fontSize:13, fontWeight:700, color:k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* 2×2 impact cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14, flex:1 }}>
          {IMPACT_GROUPS.map(g => (
            <ImpactCard key={g.key} group={g}
              text={analyses?.[g.key]}
              isGenerating={isGenerating}
              genError={genError} />
          ))}
        </div>

        <div style={{ fontSize:7, color:"#ccc", marginTop:12, flexShrink:0 }}>
          Analysis generated by AI from simulation outputs. Reflects structural crisis dynamics — not investment advice.
          Sources: CBO 2025 · IMF WP/2025/076 · Reinhart-Rogoff NBER w15639
        </div>
      </div>
    </div>
  );
}
