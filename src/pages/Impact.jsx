import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import {
  ANCHORS, FISCAL_POLICIES, MONETARY_POLICIES, SIM_LEVELS, runSim,
  IMPACT_GROUPS, impactCacheKey, getCached, setCache, parseAnalysis,
  loadSimState, saveSimState, kpiColor,
} from "../lib/sim-engine";

const THRESHOLD_DATA = [
  { label:"Debt / GDP",    rows:[{level:"GREEN",color:"#16a34a",range:"< 120%"},{level:"YELLOW",color:"#ca8a04",range:"120 – 150%"},{level:"ORANGE",color:"#ea580c",range:"150 – 175%"},{level:"RED",color:"#dc2626",range:"> 175%"}]},
  { label:"Unemployment",  rows:[{level:"GREEN",color:"#16a34a",range:"< 8%"},{level:"YELLOW",color:"#ca8a04",range:"8 – 12%"},{level:"ORANGE",color:"#ea580c",range:"12 – 20%"},{level:"RED",color:"#dc2626",range:"> 20%"}]},
  { label:"Inflation",     rows:[{level:"GREEN",color:"#16a34a",range:"2 – 6%"},{level:"YELLOW",color:"#ca8a04",range:"6 – 10%  or  −2 to 0%"},{level:"ORANGE",color:"#ea580c",range:"10 – 15%  or  −4 to −2%"},{level:"RED",color:"#dc2626",range:"> 15%  or  < −7%"}]},
  { label:"10Y Bond Yield", rows:[{level:"GREEN",color:"#16a34a",range:"< 5%"},{level:"YELLOW",color:"#ca8a04",range:"5 – 6%"},{level:"ORANGE",color:"#ea580c",range:"6 – 10%"},{level:"RED",color:"#dc2626",range:"> 10%  or  > 7% with Debt > 150%"}]},
  { label:"Crypto Flight",  rows:[{level:"GREEN",color:"#16a34a",range:"< 20%"},{level:"YELLOW",color:"#ca8a04",range:"20 – 40%"},{level:"ORANGE",color:"#ea580c",range:"40 – 60%"},{level:"RED",color:"#dc2626",range:"> 60%"}]},
  { label:"Gini Coefficient", rows:[{level:"GREEN",color:"#16a34a",range:"< 0.50  (US baseline ~0.48)"},{level:"YELLOW",color:"#ca8a04",range:"0.50 – 0.55"},{level:"ORANGE",color:"#ea580c",range:"0.55 – 0.60  (Venezuela ~0.55)"},{level:"RED",color:"#dc2626",range:"> 0.60  (revolutionary)"}]},
];

function ThresholdsPanel({ onClose }) {
  const F = "'IBM Plex Mono',monospace";
  return (
    <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
      zIndex:9999, width:380, maxHeight:"80vh", overflowY:"auto",
      background:"#fff", border:"1px solid #e2e2e2",
      boxShadow:"0 8px 32px rgba(0,0,0,0.18)", fontFamily:F }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"10px 14px", borderBottom:"1px solid #f0f0f0", background:"#fafafa" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#111", textTransform:"uppercase", letterSpacing:"0.12em" }}>
          Crisis Thresholds
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer",
          fontSize:16, color:"#aaa", fontFamily:F, lineHeight:1 }}>✕</button>
      </div>
      <div style={{ padding:"12px 14px 8px" }}>
        <div style={{ fontSize:9, color:"#888", lineHeight:1.6, marginBottom:10 }}>
          Each year's colour is set by the <strong style={{ color:"#111" }}>worst indicator</strong> for that year.
        </div>
        {THRESHOLD_DATA.map(ind => (
          <div key={ind.label} style={{ marginBottom:12 }}>
            <div style={{ fontSize:8, fontWeight:700, color:"#555", textTransform:"uppercase",
              letterSpacing:"0.1em", marginBottom:5 }}>{ind.label}</div>
            {ind.rows.map(r => (
              <div key={r.level} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:r.color,
                  flexShrink:0, display:"inline-block" }} />
                <span style={{ fontSize:8, color:r.color, fontWeight:700, minWidth:46 }}>{r.level}</span>
                <span style={{ fontSize:8, color:"#555" }}>{r.range}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{ fontSize:7, color:"#ccc", borderTop:"1px solid #f0f0f0", paddingTop:8 }}>
          Sources: Reinhart-Rogoff NBER w15639 · CBO 2025 · Fisher (1933)
        </div>
      </div>
    </div>
  );
}

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
  const _s = loadSimState();
  const [displaced,    setDisplaced]    = useState(_s?.displaced    ?? 0.40);
  const [fiscalId,     setFiscalId]     = useState(_s?.fiscalId     ?? "none");
  const [monetaryId,   setMonetaryId]   = useState(_s?.monetaryId   ?? "none");
  const [kpiYear,      setKpiYear]      = useState(_s?.kpiYear      ?? 2035);
  const [cryptoAdopt,  setCryptoAdopt]  = useState(_s?.cryptoAdopt  ?? 0.5);
  const [cryptoPolicy, setCryptoPolicy] = useState(_s?.cryptoPolicy ?? "ban");
  const [, startTransition]             = useTransition();
  const [showThresholds, setShowThresholds] = useState(false);

  useEffect(() => {
    saveSimState({ displaced, fiscalId, monetaryId, kpiYear, cryptoAdopt, cryptoPolicy });
  }, [displaced, fiscalId, monetaryId, kpiYear, cryptoAdopt, cryptoPolicy]);
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
  const lvl        = SIM_LEVELS[last.spiceLevel];
  const actFiscal  = FISCAL_POLICIES.find(p => p.id === fiscalId);
  const actMonetary = MONETARY_POLICIES.find(p => p.id === monetaryId);

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
          {/* Policy badges */}
          <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
            {fiscalId !== "none" && (
              <div style={{ padding:"3px 8px", fontSize:8,
                background:"#f0fdf4", border:"1px solid #22c55e50", color:"#22c55e" }}>
                📋 {fiscalId==="robot_ubi" ? "Robot+UBI" : "Austerity"}
              </div>
            )}
            {monetaryId !== "none" && (
              <div style={{ padding:"3px 8px", fontSize:8,
                background:"#fff5f5", border:"1px solid #ef444450", color:"#ef4444" }}>
                🖨 {monetaryId==="qe" ? "QE" : monetaryId==="ycc" ? "YCC" : "Repression"}
              </div>
            )}
            <div style={{ padding:"3px 8px", fontSize:8,
              background:"#eff6ff", border:"1px solid #3b82f650", color:"#3b82f6" }}>
              ₿ {cryptoPolicy==="ban" ? "Ban" : cryptoPolicy==="tax" ? "Tax" : "Ignore"}
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
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexShrink:0 }}>
          <span style={{ fontSize:8, color:"#aaa", fontFamily:"'IBM Plex Mono',monospace",
            textTransform:"uppercase", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>
            Snapshot year
          </span>
          <input type="range" min={2026} max={2035} step={1} value={kpiYear}
            onChange={ev => setKpiYear(+ev.target.value)}
            style={{ flex:1, accentColor:"#555", cursor:"pointer" }} />
          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
            {rows.map(r => (
              <span key={r.year} onClick={() => setKpiYear(r.year)}
                style={{ fontSize:7, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace",
                  fontWeight: r.year===kpiYear ? 700 : 400,
                  color: r.year===kpiYear ? "#111" : "#ccc" }}>
                {r.year}
              </span>
            ))}
          </div>
        </div>

        {/* KPI chips + thresholds button */}
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:14, flexShrink:0 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:5, flex:1 }}>
            {[
              { label:`Debt/GDP ${kpiYear}`, value:`${last.debtGDP}%`, color:kpiColor("debt",  last.debtGDP),            warn:last.debtGDP>=150 },
              { label:`Unemp ${kpiYear}`,    value:`${last.unemp}%`,   color:kpiColor("unemp", last.unemp),               warn:last.unemp>=12 },
              { label:`Inflation ${kpiYear}`,value:`${last.infl}%`,    color:kpiColor("infl",  last.infl),                warn:Math.abs(last.infl)>=10 },
              { label:`10Y Yield ${kpiYear}`,value:`${last.yld}%`,     color:kpiColor("yld",   last.yld, last.debtGDP),   warn:last.yld>=6 },
              { label:`Crypto ${kpiYear}`,   value:`${last.cryptoFlight}%`, color:kpiColor("crypto", last.cryptoFlight), warn:last.cryptoFlight>=40 },
              { label:`Gini ${kpiYear}`,     value:(0.48 + ((last.capShare - 25) + (60 - last.labShare)) * 0.008).toFixed(2),
                color:kpiColor("gini", 0.48 + ((last.capShare - 25) + (60 - last.labShare)) * 0.008),
                warn:(0.48 + ((last.capShare - 25) + (60 - last.labShare)) * 0.008) >= 0.55 },
            ].map(k => (
              <div key={k.label} style={{ background:k.warn?"#fff5f5":"#f9f9f9",
                border:`1px solid ${k.warn?"#ef444440":"#ebebeb"}`, padding:"5px 8px" }}>
                <div style={{ fontSize:7, color:"#bbb", fontFamily:"'IBM Plex Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>{k.label}</div>
                <div style={{ fontSize:14, fontWeight:700, color:k.color,
                  fontFamily:"'IBM Plex Mono',monospace" }}>{k.value}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowThresholds(s => !s)}
            style={{ flexShrink:0, padding:"4px 7px", fontSize:8, cursor:"pointer",
              background:"#f9f9f9", border:"1px solid #e2e2e2", color:"#888",
              fontFamily:"'IBM Plex Mono',monospace" }}>
            ℹ
          </button>
        </div>
        {showThresholds && <>
          <div onClick={() => setShowThresholds(false)}
            style={{ position:"fixed", inset:0, zIndex:9998 }} />
          <ThresholdsPanel onClose={() => setShowThresholds(false)} />
        </>}

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
