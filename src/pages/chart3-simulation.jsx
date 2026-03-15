import { useState, useMemo, useTransition, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { ANCHORS, FISCAL_POLICIES, MONETARY_POLICIES, SIM_LEVELS, runSim, loadSimState, saveSimState, kpiColor, getCollisionStatus } from "../lib/sim-engine";

// ─── CHART HELPERS ─────────────────────────────────────────────────────────

const CH = 148;
const axTick = { fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fill:"#bbb" };

function PanelHead({ label, color, children }) {
  return (
    <div style={{ fontSize:8, fontFamily:"'IBM Plex Mono',monospace",
      textTransform:"uppercase", letterSpacing:"0.1em",
      color, fontWeight:700, marginBottom:3 }}>
      {label}{children}
    </div>
  );
}

function SimpleTip({ active, payload, label, color, unit, rows }) {
  if (!active || !payload?.length) return null;
  const d   = payload[0]?.payload;
  const val = payload[0]?.value;
  const raw = rows?.find(r => r.year === d?.year);
  return (
    <div style={{ background:"#fff", border:`1px solid ${color}50`,
      padding:"6px 10px", fontFamily:"'IBM Plex Mono',monospace",
      fontSize:11, boxShadow:"0 2px 8px rgba(0,0,0,.1)", pointerEvents:"none" }}>
      <div style={{ color:"#999", fontSize:9, marginBottom:2 }}>
        {label}
        {d?.spiceLevel !== undefined && (
          <span style={{ marginLeft:5, color: SIM_LEVELS[d.spiceLevel].color, fontWeight:700 }}>
            ■ {SIM_LEVELS[d.spiceLevel].label}
          </span>
        )}
      </div>
      <div style={{ color, fontWeight:700, fontSize:15 }}>{raw ? raw[payload[0].dataKey] : val}{unit}</div>
    </div>
  );
}

// ─── (InfoTooltip / BREAK_TOOLTIP / GHOST_TOOLTIP removed — replaced by SPICE level badges) ───

// ─── CHART COMPONENTS ──────────────────────────────────────────────────────

function DebtChart({ rows, firstRedYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="Debt / GDP" color="#ef4444">
        <span style={{ fontSize:7, fontWeight:400, color:"#bbb", marginLeft:6 }}>capped at 300%</span>
        <span style={{ fontSize:7, fontWeight:700, color:"#ef444470", marginLeft:8, letterSpacing:"0.08em" }}>DEBT</span>
      </PanelHead>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} />
            <XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[100,310]} ticks={[125,175,225,275]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#ef4444" unit="%" rows={rows} />} />
            <ReferenceLine y={130} stroke="#ef444440" strokeDasharray="3 4" label={{ value:"130%", fill:"#ef444460", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={175} stroke="#ef444480" strokeDasharray="3 4" label={{ value:"175%", fill:"#ef444480", fontSize:7, position:"insideTopRight" }} />
            {firstRedYear && <ReferenceLine x={firstRedYear} stroke="#dc262655" strokeWidth={1.5} strokeDasharray="4 3" />}
            <Line type="monotone" dataKey="debtGDP" stroke="#ef4444" strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#ef4444", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UnempChart({ rows, firstRedYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="Unemployment" color="#8b5cf6">
        <span style={{ fontSize:7, fontWeight:700, color:"#8b5cf670", marginLeft:8, letterSpacing:"0.08em" }}>UNEMPLOYMENT</span>
      </PanelHead>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} />
            <XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[0,50]} ticks={[5,15,25,35,45]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#8b5cf6" unit="%" rows={rows} />} />
            <ReferenceLine y={10} stroke="#8b5cf640" strokeDasharray="3 4" label={{ value:"10%", fill:"#8b5cf660", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={20} stroke="#8b5cf670" strokeDasharray="3 4" label={{ value:"20% depression", fill:"#8b5cf670", fontSize:7, position:"insideTopRight" }} />
            {firstRedYear && <ReferenceLine x={firstRedYear} stroke="#dc262655" strokeWidth={1.5} strokeDasharray="4 3" />}
            <Line type="monotone" dataKey="unemp" stroke="#8b5cf6" strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#8b5cf6", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InflChart({ rows, firstRedYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="Inflation / Deflation" color="#3b82f6">
        <span style={{ fontSize:7, fontWeight:700, color:"#3b82f670", marginLeft:8, letterSpacing:"0.08em" }}>INFLATION</span>
      </PanelHead>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} />
            <XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[-12,20]} ticks={[-10,-5,0,5,10,15]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#3b82f6" unit="%" rows={rows} />} />
            <ReferenceLine y={0} stroke="#3b82f680" strokeDasharray="3 4" label={{ value:"0%", fill:"#3b82f680", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={-8} stroke="#3b82f6aa" strokeDasharray="3 4" label={{ value:"−8% Fisher", fill:"#3b82f6aa", fontSize:7, position:"insideTopRight" }} />
            {firstRedYear && <ReferenceLine x={firstRedYear} stroke="#dc262655" strokeWidth={1.5} strokeDasharray="4 3" />}
            <Line type="monotone" dataKey="infl" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#3b82f6", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function YieldChart({ rows, firstRedYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="10Y Bond Yield" color="#eab308">
        <span style={{ fontSize:7, fontWeight:700, color:"#eab30870", marginLeft:8, letterSpacing:"0.08em" }}>DEBT</span>
      </PanelHead>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} />
            <XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[2,14]} ticks={[3,5,7,9,11,13]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#eab308" unit="%" rows={rows} />} />
            <ReferenceLine y={4.5} stroke="#eab30850" strokeDasharray="3 4" label={{ value:"YCC cap", fill:"#eab30870", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={6} stroke="#eab30880" strokeDasharray="3 4" label={{ value:"6% stress", fill:"#eab30880", fontSize:7, position:"insideTopRight" }} />
            {firstRedYear && <ReferenceLine x={firstRedYear} stroke="#dc262655" strokeWidth={1.5} strokeDasharray="4 3" />}
            <Line type="monotone" dataKey="yld" stroke="#eab308" strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#eab308", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BitcoinChart({ rows, firstRedYear }) {
  const maxBtc    = Math.max(...rows.map(r => r.bitcoin));
  const roundTo   = maxBtc < 200000 ? 25000 : maxBtc < 500000 ? 50000 : 100000;
  const axMax     = Math.ceil(maxBtc * 1.15 / roundTo) * roundTo;
  const step      = axMax / 4;
  const idxTicks  = [1,2,3,4].map(n => Math.round(n * step / roundTo) * roundTo);
  const maxFlight = Math.max(...rows.map(r => r.cryptoFlight));
  const pctCeil   = Math.max(50, Math.ceil(maxFlight * 1.35 / 10) * 10);
  const pctStep   = pctCeil <= 50 ? 10 : pctCeil <= 80 ? 20 : 25;
  const pctTicks  = Array.from({ length: Math.floor((pctCeil - 1) / pctStep) },
    (_, i) => (i + 1) * pctStep);

  const refLines = [
    { y: 170000, label: "2×" },
    { y: 425000, label: "5×" },
    { y: 850000, label: "10×" },
  ].filter(r => r.y < axMax * 0.92);

  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <div style={{ fontSize:8, fontFamily:"'IBM Plex Mono',monospace",
        textTransform:"uppercase", letterSpacing:"0.1em",
        color:"#555", fontWeight:700, marginBottom:3 }}>
        Crypto Flight
        <span style={{ marginLeft:8, fontSize:7, fontWeight:400 }}>
          <span style={{ color:"#f59e0b" }}>&#x2501; Bitcoin (USD)  </span>
          <span style={{ color:"#93c5fd" }}>&#x254C; Capital in crypto %</span>
        </span>
        <span style={{ fontSize:7, fontWeight:700, color:"#B8860B70", marginLeft:8, letterSpacing:"0.08em" }}>CRYPTO</span>
      </div>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:36, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} />
            <XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis yAxisId="idx" domain={[0, axMax]} ticks={idxTicks}
              tick={axTick} tickLine={false} axisLine={false} width={52}
              tickFormatter={v => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
            <YAxis yAxisId="pct" orientation="right" domain={[0,pctCeil]} ticks={pctTicks}
              tick={axTick} tickLine={false} axisLine={false} width={28}
              tickFormatter={v => `${v}%`} />
            <Tooltip content={p => {
              if (!p.active || !p.payload?.length) return null;
              const d = p.payload[0]?.payload;
              if (!d) return null;
              const fmtUsd = v => v >= 1000000
                ? `$${(v/1000000).toFixed(2)}M`
                : `$${v >= 1000 ? (v/1000).toFixed(1)+"k" : v}`;
              const mult = (d.bitcoin / 85000).toFixed(1);
              return (
                <div style={{ background:"#fff", border:"1px solid #e8e8e8",
                  padding:"5px 8px", fontSize:8, fontFamily:"'IBM Plex Mono',monospace" }}>
                  <div style={{ fontWeight:700, marginBottom:3 }}>{d.year}</div>
                  <div style={{ color:"#f59e0b" }}>Bitcoin: {fmtUsd(d.bitcoin)} ({mult}×)</div>
                  <div style={{ color:"#93c5fd" }}>Crypto flight: {d.cryptoFlight}%</div>
                  {d.spiceLevel !== undefined && <div style={{ color: SIM_LEVELS[d.spiceLevel].color, marginTop:3 }}>■ {SIM_LEVELS[d.spiceLevel].label}</div>}
                </div>
              );
            }} />
            {firstRedYear && <ReferenceLine yAxisId="idx" x={firstRedYear} stroke="#dc262655" strokeWidth={1.5} strokeDasharray="4 3" />}
            {refLines.map(r => (
              <ReferenceLine key={r.label} yAxisId="idx" y={r.y} stroke="#f59e0b30" strokeDasharray="3 4"
                label={{ value:r.label, fill:"#f59e0b70", fontSize:6, position:"insideTopRight" }} />
            ))}
            <Line yAxisId="idx" type="monotone" dataKey="bitcoin" stroke="#f59e0b" strokeWidth={2.5}
              dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#f59e0b", strokeWidth:0 }} />
            <Line yAxisId="pct" type="monotone" dataKey="cryptoFlight" stroke="#93c5fd" strokeWidth={1.5}
              strokeDasharray="5 2" dot={false} isAnimationActive={false}
              activeDot={{ r:2, fill:"#93c5fd", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KShapeChart({ rows, firstRedYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <div style={{ fontSize:8, fontFamily:"'IBM Plex Mono',monospace",
        textTransform:"uppercase", letterSpacing:"0.1em",
        color:"#555", fontWeight:700, marginBottom:3 }}>
        K-Shaped Economy
        <span style={{ marginLeft:8, fontSize:7, fontWeight:400 }}>
          <span style={{ color:"#22c55e" }}>━ Labour  </span>
          <span style={{ color:"#ef4444" }}>━ Capital</span>
        </span>
        <span style={{ fontSize:7, fontWeight:700, color:"#8b5cf670", marginLeft:8, letterSpacing:"0.08em" }}>UNEMPLOYMENT</span>
      </div>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} />
            <XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[20,65]} ticks={[25,35,45,55]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              if (!d) return null;
              return (
                <div style={{ background:"#fff", border:"1px solid #ddd",
                  padding:"6px 10px", fontFamily:"'IBM Plex Mono',monospace",
                  fontSize:11, boxShadow:"0 2px 8px rgba(0,0,0,.1)", pointerEvents:"none" }}>
                  <div style={{ color:"#999", fontSize:9, marginBottom:4 }}>{label}</div>
                  <div style={{ color:"#22c55e", fontWeight:700 }}>Labour: {d.labShare}%</div>
                  <div style={{ color:"#ef4444", fontWeight:700 }}>Capital: {d.capShare}%</div>
                  <div style={{ color:"#888", fontSize:8, marginTop:2 }}>
                    Gap widened: +{Math.max(0, (d.capShare - 25) + (60 - d.labShare)).toFixed(1)}pp
                  </div>
                </div>
              );
            }} />
            <ReferenceLine y={60} stroke="#22c55e30" strokeDasharray="3 4" label={{ value:"Labour 2026", fill:"#22c55e50", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={25} stroke="#ef444430" strokeDasharray="3 4" label={{ value:"Capital 2026", fill:"#ef444450", fontSize:7, position:"insideTopRight" }} />
            {firstRedYear && <ReferenceLine x={firstRedYear} stroke="#dc262655" strokeWidth={1.5} strokeDasharray="4 3" />}
            <Line type="monotone" dataKey="labShare" stroke="#22c55e" strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#22c55e", strokeWidth:0 }} />
            <Line type="monotone" dataKey="capShare" stroke="#ef4444" strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#ef4444", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize:7, color:"#aaa", fontFamily:"'IBM Plex Mono',monospace",
        marginTop:3, lineHeight:1.5, paddingLeft:2 }}>
        Labour + Capital ≈ 85% of GDP. Residual ~15% = depreciation, taxes, proprietors' income.
        The K-shape shows the <em>transfer within</em> that 85%.
      </div>
    </div>
  );
}

// ─── KPI CHIP ──────────────────────────────────────────────────────────────

function KPI({ label, value, color, warn }) {
  return (
    <div style={{ background:warn?"#fff5f5":"#f9f9f9",
      border:`1px solid ${warn?"#ef444440":"#ebebeb"}`, padding:"5px 8px" }}>
      <div style={{ fontSize:7, color:"#bbb", fontFamily:"'IBM Plex Mono',monospace",
        textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:700, color,
        fontFamily:"'IBM Plex Mono',monospace" }}>{value}</div>
    </div>
  );
}

// ─── THRESHOLDS PANEL ──────────────────────────────────────────────────────

const THRESHOLD_DATA = [
  { label: "Debt / GDP", rows: [
    { level:"GREEN",  color:"#16a34a", range:"< 120%" },
    { level:"YELLOW", color:"#ca8a04", range:"120 – 150%" },
    { level:"ORANGE", color:"#ea580c", range:"150 – 175%" },
    { level:"RED",    color:"#dc2626", range:"> 175%" },
  ]},
  { label: "Unemployment", rows: [
    { level:"GREEN",  color:"#16a34a", range:"< 8%" },
    { level:"YELLOW", color:"#ca8a04", range:"8 – 12%" },
    { level:"ORANGE", color:"#ea580c", range:"12 – 20%" },
    { level:"RED",    color:"#dc2626", range:"> 20% (depression)" },
  ]},
  { label: "Inflation", rows: [
    { level:"GREEN",  color:"#16a34a", range:"2 – 6%" },
    { level:"YELLOW", color:"#ca8a04", range:"6 – 10%  or  −2 to 0%" },
    { level:"ORANGE", color:"#ea580c", range:"10 – 15%  or  −4 to −2%" },
    { level:"RED",    color:"#dc2626", range:"> 15%  or  < −7% (Fisher spiral)" },
  ]},
  { label: "10Y Bond Yield", rows: [
    { level:"GREEN",  color:"#16a34a", range:"< 5%" },
    { level:"YELLOW", color:"#ca8a04", range:"5 – 6%" },
    { level:"ORANGE", color:"#ea580c", range:"6 – 10%" },
    { level:"RED",    color:"#dc2626", range:"> 10%  or  > 7% with Debt > 150%" },
  ]},
  { label: "Crypto Flight", rows: [
    { level:"GREEN",  color:"#16a34a", range:"< 20%" },
    { level:"YELLOW", color:"#ca8a04", range:"20 – 40%" },
    { level:"ORANGE", color:"#ea580c", range:"40 – 60%" },
    { level:"RED",    color:"#dc2626", range:"> 60% (mass capital exit)" },
  ]},
  { label: "Gini Coefficient", rows: [
    { level:"GREEN",  color:"#16a34a", range:"< 0.50  (US baseline ~0.48)" },
    { level:"YELLOW", color:"#ca8a04", range:"0.50 – 0.55  (elevated inequality)" },
    { level:"ORANGE", color:"#ea580c", range:"0.55 – 0.60  (extreme — Venezuela ~0.55)" },
    { level:"RED",    color:"#dc2626", range:"> 0.60  (revolutionary levels)" },
  ]},
];

function ThresholdsPanel({ onClose }) {
  const F = "'IBM Plex Mono',monospace";
  return (
    <div style={{ position:"fixed", top:"50%", left:"50%",
      transform:"translate(-50%,-50%)", zIndex:9999,
      width:380, maxHeight:"80vh", overflowY:"auto",
      background:"#fff", border:"1px solid #e2e2e2",
      boxShadow:"0 8px 32px rgba(0,0,0,0.18)", fontFamily:F }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"10px 14px", borderBottom:"1px solid #f0f0f0", background:"#fafafa" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#111",
          textTransform:"uppercase", letterSpacing:"0.12em" }}>
          Crisis Thresholds
        </div>
        <button onClick={onClose}
          style={{ background:"none", border:"none", cursor:"pointer",
            fontSize:16, color:"#aaa", fontFamily:F, lineHeight:1 }}>✕</button>
      </div>
      <div style={{ padding:"12px 14px 8px" }}>
        <div style={{ fontSize:9, color:"#888", lineHeight:1.6, marginBottom:10 }}>
          Each year's colour is set by the <strong style={{ color:"#111" }}>worst indicator</strong> for that year.
          Indicator chip colours below use the same logic — independent of graph line colours.
        </div>
        {THRESHOLD_DATA.map(ind => (
          <div key={ind.label} style={{ marginBottom:12 }}>
            <div style={{ fontSize:8, fontWeight:700, color:"#555",
              textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>
              {ind.label}
            </div>
            {ind.rows.map(r => (
              <div key={r.level} style={{ display:"flex", alignItems:"center",
                gap:7, marginBottom:3 }}>
                <span style={{ width:6, height:6, borderRadius:"50%",
                  background:r.color, flexShrink:0, display:"inline-block" }} />
                <span style={{ fontSize:8, color:r.color, fontWeight:700,
                  minWidth:46 }}>{r.level}</span>
                <span style={{ fontSize:8, color:"#555" }}>{r.range}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:10, marginTop:4 }}>
          <div style={{ fontSize:8, fontWeight:700, color:"#111",
            textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
            Crisis vs Collision
          </div>
          <div style={{ fontSize:8, color:"#555", lineHeight:1.6, marginBottom:8 }}>
            <span style={{ color:"#dc2626", fontWeight:700 }}>RED</span> years flag that a crisis is occurring — conventional or collision.
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:8, fontWeight:700, color:"#dc2626", marginBottom:3 }}>
              ◈ THE COLLISION
            </div>
            <div style={{ fontSize:8, color:"#555", lineHeight:1.6 }}>
              Crisis + AI displacement {">"}15% or crypto flight {">"}20%.
              AI-driven deflation prevents inflating away debt; crypto capital flight
              prevents trapping savings. No historical precedent.
            </div>
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:8, fontWeight:700, color:"#ca8a04", marginBottom:3 }}>
              CONVENTIONAL CRISIS
            </div>
            <div style={{ fontSize:8, color:"#555", lineHeight:1.6 }}>
              Crisis thresholds breached but AI {"<"}15% and crypto {"<"}20%.
              Fed has an established playbook: QE, financial repression, gradual inflation.
              Historical precedents: Greece 2010, Argentina 2001, UK 1945–70.
            </div>
          </div>
        </div>
        <div style={{ fontSize:7, color:"#ccc", borderTop:"1px solid #f0f0f0",
          paddingTop:8, lineHeight:1.6 }}>
          Sources: Reinhart-Rogoff NBER w15639 · CBO 2025 · Fisher (1933)
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

export default function Chart3Simulation() {
  const _s = loadSimState();
  const [displaced,    setDisplaced]    = useState(_s?.displaced    ?? 0.40);
  const [fiscalId,     setFiscalId]     = useState(_s?.fiscalId     ?? "none");
  const [monetaryId,   setMonetaryId]   = useState(_s?.monetaryId   ?? "none");
  const [kpiYear,      setKpiYear]      = useState(_s?.kpiYear      ?? 2035);
  const [cryptoAdopt,  setCryptoAdopt]  = useState(_s?.cryptoAdopt  ?? 0.5);
  const [cryptoPolicy, setCryptoPolicy] = useState(_s?.cryptoPolicy ?? "ban");
  const [, startTransition] = useTransition();
  const [showThresholds,  setShowThresholds]  = useState(false);
  const [economyOverview, setEconomyOverview] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(false);
  const overviewDebounce = useRef(null);
  const overviewCache    = useRef({});

  useEffect(() => {
    saveSimState({ displaced, fiscalId, monetaryId, kpiYear, cryptoAdopt, cryptoPolicy });
  }, [displaced, fiscalId, monetaryId, kpiYear, cryptoAdopt, cryptoPolicy]);

  const { rows, firstYear, firstRedYear } = useMemo(
    () => runSim(displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy),
    [displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy]
  );

  const last        = rows.find(r => r.year === kpiYear) || rows[rows.length - 1];
  const actFiscal   = FISCAL_POLICIES.find(p => p.id === fiscalId);
  const actMonetary = MONETARY_POLICIES.find(p => p.id === monetaryId);
  const anchor      = ANCHORS.reduce((a,b) =>
    Math.abs(a.pct - displaced) < Math.abs(b.pct - displaced) ? a : b);

  const crisisRow      = rows.find(r => r.debtGDP > 175 || r.unemp > 20 || r.infl < -7 || (r.yld > 6.5 && r.debtGDP > 150));
  const collisionStatus = crisisRow ? getCollisionStatus(crisisRow, displaced) : "NO_CRISIS";
  const collisionYear   = crisisRow?.year ?? null;
  const collisionCrypto = crisisRow ? Math.round(crisisRow.cryptoFlight) : 0;

  useEffect(() => {
    const r0 = rows[0], rN = rows[rows.length - 1];
    const gini = r => +(0.48 + ((r.capShare - 25) + (60 - r.labShare)) * 0.008).toFixed(2);
    const crisisRow = rows.find(r =>
      r.debtGDP > 175 || r.unemp > 20 || r.infl < -7 || (r.yld > 6.5 && r.debtGDP > 150)
    );
    const traj = {
      startDebt:  r0.debtGDP,  endDebt:  rN.debtGDP,  peakDebt:  Math.max(...rows.map(r => r.debtGDP)),
      startUnemp: r0.unemp,    endUnemp: rN.unemp,    peakUnemp: +Math.max(...rows.map(r => r.unemp)).toFixed(1),
      startInfl:  r0.infl,     endInfl:  rN.infl,
      startYld:   r0.yld,      endYld:   rN.yld,
      startCrypto:r0.cryptoFlight, endCrypto: rN.cryptoFlight, peakCrypto: Math.round(Math.max(...rows.map(r => r.cryptoFlight))),
      startGini:  gini(r0),    endGini:  gini(rN),
      crisisYear: crisisRow ? crisisRow.year : null,
      displaced,
      fiscalPolicy: fiscalId,  monetaryPolicy: monetaryId,  cryptoPolicy,
    };
    const cacheKey = `${fiscalId}|${monetaryId}|${cryptoPolicy}|${Math.round(displaced * 100)}|${Math.round(cryptoAdopt * 100)}`;
    if (overviewCache.current[cacheKey]) {
      setEconomyOverview(overviewCache.current[cacheKey]);
      return;
    }
    if (overviewDebounce.current) clearTimeout(overviewDebounce.current);
    overviewDebounce.current = setTimeout(async () => {
      setOverviewLoading(true);
      try {
        const res = await fetch("/api/economy-overview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(traj),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        overviewCache.current[cacheKey] = data.overview;
        setEconomyOverview(data.overview);
      } catch {
        setEconomyOverview("Economic analysis temporarily unavailable.");
      } finally {
        setOverviewLoading(false);
      }
    }, 600);
    return () => clearTimeout(overviewDebounce.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy]);

  return (
    <div style={{ background:"#fff", color:"#111",
      fontFamily:"'IBM Plex Mono',monospace",
      display:"flex", flexDirection:"column",
      height:"100vh", overflow:"hidden", maxWidth:1200, margin:"0 auto" }}>

      {/* HEADER */}
      <div style={{ borderBottom:"2px solid #f0f0f0", padding:"7px 18px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div>
          <span style={{ fontSize:15, fontWeight:700 }}>
            Debt <span style={{ color:"#B8860B" }}>Collision</span> Simulation
          </span>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
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

          {/* SPICE crisis level onset badges */}
          {SIM_LEVELS.map((lm, i) => {
            const yr = firstYear[i];
            return (
              <div key={lm.label}
                style={{ padding:"3px 7px", fontSize:9, fontWeight:700, cursor:"default",
                  background: yr ? lm.bg : "#f5f5f5",
                  border:`1px solid ${yr ? lm.color : "#ddd"}`,
                  color: yr ? lm.color : "#ccc",
                  minWidth:38, textAlign:"center" }}>
                {yr ? String(yr).slice(2) : "—"}
              </div>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* LEFT PANEL */}
        <div style={{ width:220, flexShrink:0, borderRight:"1px solid #f0f0f0",
          padding:"12px 12px", overflowY:"auto", background:"#fafafa" }}>

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
                  style={{ position:"absolute", left:`${lp}%`,
                    transform:"translateX(-50%)", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ width:1, height:5, margin:"0 auto 2px",
                    background:on?"#B8860B":"#ddd" }} />
                  <div style={{ fontSize:8, whiteSpace:"nowrap",
                    fontWeight:on?700:400, color:on?"#B8860B":"#ccc" }}>{a.label}</div>
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
          <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
            letterSpacing:"0.1em", marginBottom:6 }}>Crypto Flight Speed</div>
          <div style={{ fontSize:10, color:"#555", lineHeight:1.5, marginBottom:7 }}>
            How fast does capital{" "}
            <strong style={{ color:"#111" }}>flee to crypto</strong> when stress rises?
          </div>

          <input type="range" min={0} max={1} step={0.05} value={cryptoAdopt}
            onChange={ev => { const v = +ev.target.value; startTransition(() => setCryptoAdopt(v)); }}
            style={{ width:"100%", accentColor:"#93c5fd", cursor:"pointer", marginBottom:4 }} />

          <div style={{ position:"relative", height:22, marginBottom:6 }}>
            {[{v:0,l:"None"},{v:0.25,l:"Slow"},{v:0.5,l:"Moderate"},{v:0.75,l:"Fast"},{v:1,l:"Venezuela"}].map(a => {
              const lp = a.v * 100;
              const on = Math.abs(a.v - cryptoAdopt) < 0.13;
              return (
                <div key={a.l} onClick={() => setCryptoAdopt(a.v)}
                  style={{ position:"absolute", left:`${lp}%`,
                    transform:"translateX(-50%)", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ width:1, height:4, margin:"0 auto 2px",
                    background:on?"#93c5fd":"#ddd" }} />
                  <div style={{ fontSize:7, whiteSpace:"nowrap",
                    fontWeight:on?700:400, color:on?"#60a5fa":"#ccc" }}>{a.l}</div>
                </div>
              );
            })}
          </div>

          <div style={{ background:"#fff", border:"1px solid #ebebeb", padding:"5px 8px",
            fontSize:8, color:"#888", lineHeight:1.6, marginBottom:3 }}>
            <span style={{ color:"#60a5fa", fontWeight:700 }}>
              {cryptoAdopt === 0 ? "No flight" :
               cryptoAdopt < 0.3 ? "Slow drift" :
               cryptoAdopt < 0.6 ? "Argentina-speed" :
               cryptoAdopt < 0.85 ? "Turkey-speed" : "Venezuela-speed"}
            </span><br />
            {cryptoAdopt === 0 ? "Capital stays in fiat. No crypto adoption." :
             cryptoAdopt < 0.3 ? "Gradual portfolio shift. Institutional only." :
             cryptoAdopt < 0.6 ? "Informal adoption mirrors Argentina 2000s. K-shape accelerator." :
             cryptoAdopt < 0.85 ? "Rapid flight as in Turkey 2021-22. Significant parallel economy." :
             "Full informal dollarization via crypto. P2P stablecoin economy."}
          </div>

          <div style={{ borderTop:"1px solid #ebebeb", marginBottom:9 }} />
          <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
            letterSpacing:"0.1em", marginBottom:7 }}>Government Response</div>

          <div style={{ fontSize:8, color:"#22c55e", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:4 }}>Fiscal</div>
          {FISCAL_POLICIES.map(opt => (
            <button key={opt.id} onClick={() => setFiscalId(opt.id)}
              style={{ display:"block", width:"100%", textAlign:"left", cursor:"pointer",
                padding:"5px 7px", marginBottom:3,
                background:fiscalId===opt.id?"#22c55e0f":"transparent",
                border:`1px solid ${fiscalId===opt.id?"#22c55e":"#e8e8e8"}`,
                fontFamily:"'IBM Plex Mono',monospace" }}>
              <div style={{ fontSize:9, fontWeight:700,
                color:fiscalId===opt.id?"#22c55e":"#555" }}>{opt.label}</div>
              <div style={{ fontSize:7, color:"#aaa", marginTop:1, lineHeight:1.4 }}>{opt.desc}</div>
            </button>
          ))}

          <div style={{ fontSize:8, color:"#ef4444", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", marginTop:7, marginBottom:4 }}>Monetary</div>
          {MONETARY_POLICIES.map(opt => (
            <button key={opt.id} onClick={() => setMonetaryId(opt.id)}
              style={{ display:"block", width:"100%", textAlign:"left", cursor:"pointer",
                padding:"5px 7px", marginBottom:3,
                background:monetaryId===opt.id?"#ef44440f":"transparent",
                border:`1px solid ${monetaryId===opt.id?"#ef4444":"#e8e8e8"}`,
                fontFamily:"'IBM Plex Mono',monospace" }}>
              <div style={{ fontSize:9, fontWeight:700,
                color:monetaryId===opt.id?"#ef4444":"#555" }}>{opt.label}</div>
              <div style={{ fontSize:7, color:"#aaa", marginTop:1, lineHeight:1.4 }}>{opt.desc}</div>
            </button>
          ))}

          <div style={{ borderTop:"1px solid #ebebeb", margin:"9px 0 7px" }} />

          <div style={{ fontSize:8, color:"#93c5fd", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:4 }}>Crypto Policy</div>
          {[
            { id:"ban",  label:"Ban & restrict",       desc:"Capital controls + exchange bans. Crackdown dip then backfire. (Venezuela, China)" },
            { id:"tax",  label:"Tax & regulate",       desc:"On-chain reporting, capital gains tax. Flight slows; tax base partially recovered. (US, EU path)" },
            { id:"none", label:"Ignore / accommodate", desc:"No intervention. Flight continues unimpeded. (El Salvador, weak-state scenario)" },
          ].map(opt => (
            <button key={opt.id} onClick={() => setCryptoPolicy(opt.id)}
              style={{ display:"block", width:"100%", textAlign:"left", cursor:"pointer",
                padding:"5px 7px", marginBottom:3,
                background:cryptoPolicy===opt.id?"#93c5fd0f":"transparent",
                border:`1px solid ${cryptoPolicy===opt.id?"#93c5fd":"#e8e8e8"}`,
                fontFamily:"'IBM Plex Mono',monospace" }}>
              <div style={{ fontSize:9, fontWeight:700,
                color:cryptoPolicy===opt.id?"#93c5fd":"#555" }}>{opt.label}</div>
              <div style={{ fontSize:7, color:"#aaa", marginTop:1, lineHeight:1.4 }}>{opt.desc}</div>
            </button>
          ))}

          <div style={{ borderTop:"1px solid #ebebeb", margin:"9px 0 7px" }} />
          <div style={{ fontSize:7, color:"#ccc", lineHeight:1.9 }}>
            {SIM_LEVELS.map(lm => (
              <div key={lm.label}>
                <span style={{ color: lm.color }}>■ </span>
                <span style={{ color:"#bbb" }}>{lm.label}</span>
              </div>
            ))}
            <div style={{ marginTop:3, lineHeight:1.5 }}>
              <span style={{ color:"#dc262660" }}>━ </span>Red line = RED level onset
            </div>
            <div>
              <span style={{ color:"#93c5fd" }}>╌ </span>
              Crypto ceiling:{" "}
              <span style={{ color:"#60a5fa", fontWeight:700 }}>
                {cryptoPolicy === "ban" ? "30%" : cryptoPolicy === "tax" ? "50%" : "75%"}
              </span>
            </div>
            <div style={{ marginTop:3, lineHeight:1.5 }}>
              Debt/GDP(t+1) = Debt/GDP(t) × (1+r)/(1+g) + deficit<br/>
              CBO · IMF WP/2025/076 · Reinhart-Rogoff
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex:1, overflow:"auto", padding:"10px 12px",
          display:"flex", flexDirection:"column" }}>

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

          {/* KPIs + thresholds button */}
          <div style={{ display:"flex", alignItems:"center", gap:5,
            marginBottom:8, flexShrink:0 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)",
              gap:5, flex:1 }}>
              <KPI label={`Debt/GDP ${kpiYear}`} value={`${last.debtGDP}%`}
                color={kpiColor("debt",   last.debtGDP)} warn={last.debtGDP>=150} />
              <KPI label={`Unemp ${kpiYear}`}    value={`${last.unemp}%`}
                color={kpiColor("unemp",  last.unemp)}   warn={last.unemp>=12} />
              <KPI label={`Inflation ${kpiYear}`}value={`${last.infl}%`}
                color={kpiColor("infl",   last.infl)}     warn={Math.abs(last.infl)>=10} />
              <KPI label={`10Y Yield ${kpiYear}`}value={`${last.yld}%`}
                color={kpiColor("yld",    last.yld, last.debtGDP)} warn={last.yld>=6} />
              <KPI label={`Crypto ${kpiYear}`}    value={`${last.cryptoFlight}%`}
                color={kpiColor("crypto", last.cryptoFlight)} warn={last.cryptoFlight>=40} />
              <KPI label={`Gini ${kpiYear}`}     value={(0.48 + ((last.capShare - 25) + (60 - last.labShare)) * 0.008).toFixed(2)}
                color={kpiColor("gini", 0.48 + ((last.capShare - 25) + (60 - last.labShare)) * 0.008)}
                warn={(0.48 + ((last.capShare - 25) + (60 - last.labShare)) * 0.008) >= 0.55} />
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

          {/* 3×2 chart grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gridTemplateRows:`repeat(2,${CH+32}px)`, gap:8, flexShrink:0 }}>
            <DebtChart    rows={rows} firstRedYear={firstRedYear} />
            <UnempChart   rows={rows} firstRedYear={firstRedYear} />
            <InflChart    rows={rows} firstRedYear={firstRedYear} />
            <YieldChart   rows={rows} firstRedYear={firstRedYear} />
            <BitcoinChart rows={rows} firstRedYear={firstRedYear} />
            <KShapeChart  rows={rows} firstRedYear={firstRedYear} />
          </div>

          <div style={{ fontSize:7, color:"#ccc", marginTop:7, flexShrink:0 }}>
            Sources: CBO 2025 · IMF WP/2025/076 · Reinhart-Rogoff NBER w15639 · Goldman Sachs · Dallas Fed 2025
          </div>

          {/* Collision vs Conventional box */}
          {collisionStatus !== "NO_CRISIS" && (
            <div style={{ margin:"14px 0 0", padding:"12px 16px", flexShrink:0,
              background: collisionStatus === "COLLISION" ? "#fef2f2" : "#fefce8",
              border: `1px solid ${collisionStatus === "COLLISION" ? "#dc262640" : "#ca8a0440"}` }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em",
                color: collisionStatus === "COLLISION" ? "#dc2626" : "#92400e",
                marginBottom:6 }}>
                {collisionStatus === "COLLISION" ? `◈ THE COLLISION — ${collisionYear}` : `CONVENTIONAL CRISIS — ${collisionYear}`}
              </div>
              <div style={{ fontSize:10, color:"#444", lineHeight:1.6, marginBottom: collisionStatus === "CONVENTIONAL" ? 8 : 0 }}>
                {collisionStatus === "COLLISION" ? (
                  <>
                    AI displacement {Math.round(displaced * 100)}%{collisionCrypto > 20 ? `, crypto flight ${collisionCrypto}%` : ""} — novel dynamics absent from all historical crises.
                    AI-driven deflation prevents inflating away debt; crypto-enabled capital flight constrains traditional tools.
                  </>
                ) : (
                  <>
                    AI displacement {Math.round(displaced * 100)}%, crypto flight {collisionCrypto}% — both below collision thresholds.
                    This resembles Greece 2010, Argentina 2001, or UK post-WWII. The Fed has an established playbook.
                  </>
                )}
              </div>
              {collisionStatus === "CONVENTIONAL" && (
                <div style={{ fontSize:9, color:"#92400e" }}>
                  Increase AI above 15% or Crypto above 20% to model The Collision.
                </div>
              )}
            </div>
          )}

          {/* Economy Overview Card */}
          {overviewLoading ? (
            <div style={{ margin:"16px 0 8px", padding:"28px 20px",
              background:"#fafafa", border:"1px solid #e2e2e2",
              textAlign:"center", flexShrink:0 }}>
              <span style={{ fontSize:11, color:"#aaa", fontStyle:"italic" }}>
                Generating economic overview...
              </span>
            </div>
          ) : economyOverview && (
            <div style={{ margin:"16px 0 8px", padding:"16px 20px",
              background:"#fafafa", border:"1px solid #e2e2e2", flexShrink:0 }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#111",
                textTransform:"uppercase", letterSpacing:"0.12em",
                borderBottom:"1px solid #e2e2e2", paddingBottom:7, marginBottom:12 }}>
                Economic Overview — {last.year}
              </div>
              <div style={{ fontSize:11, lineHeight:1.7, color:"#333" }}>
                {economyOverview.split("\n\n").map((para, i, arr) => (
                  <p key={i} style={{ margin:0, marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
