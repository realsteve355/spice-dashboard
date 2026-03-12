import { useState, useMemo, useTransition } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ─── ANCHORS ───────────────────────────────────────────────────────────────

const ANCHORS = [
  { pct:0.05, label:"CBO",      desc:"CBO 2025 baseline. Gradual adoption, minimal disruption." },
  { pct:0.10, label:"IMF/GS",   desc:"IMF + Goldman Sachs central estimate. Manageable disruption." },
  { pct:0.25, label:"McKinsey", desc:"McKinsey high-end. 25% of tasks automatable by 2030." },
  { pct:0.40, label:"SPICE",    desc:"SPICE thesis. Rapid displacement from agentic AI 2026–28." },
  { pct:0.60, label:"Collision",desc:"AGI-equivalent transition compressed into 3–4 years." },
];

// ─── POLICIES ──────────────────────────────────────────────────────────────

const FISCAL_POLICIES = [
  { id:"none",      label:"None",            desc:"No fiscal adjustment. Drift.",
    e:{ dM:1.00, iA:0,      uM:1.00, lD: 0,    cD: 0    }},
  { id:"robot_ubi", label:"Robot Tax + UBI", desc:"Tax automation, fund redistribution.",
    e:{ dM:0.72, iA:0.002,  uM:0.82, lD:+0.08, cD:-0.06 }},
  { id:"austerity", label:"Austerity",        desc:"Spending cuts. Reduces deficit, crushes demand.",
    e:{ dM:0.60, iA:-0.010, uM:1.15, lD:-0.02, cD: 0.01 }},
];

const MONETARY_POLICIES = [
  { id:"none",       label:"None",               desc:"No monetary intervention.",
    e:{ yM:1.00, iA:0,     gM:1.00, lD: 0,    cD: 0    }},
  { id:"qe",         label:"QE / Money Printing", desc:"Monetises deficits. Inflates asset prices. SPICE core hedge.",
    e:{ yM:0.70, iA:0.035, gM:1.55, lD:-0.05, cD:+0.07 }},
  { id:"ycc",        label:"Yield Curve Control", desc:"Hard cap on long-end yields. Japan 2016–23 playbook.",
    e:{ yM:0.58, iA:0.045, gM:1.70, lD:-0.06, cD:+0.08 }},
  { id:"repression", label:"Financial Repression",desc:"Force banks/pensions into bonds below market rates.",
    e:{ yM:0.72, iA:0.020, gM:1.35, lD:-0.03, cD:+0.04 }},
];

// ─── SIMULATION ────────────────────────────────────────────────────────────

function runSim(displaced, fiscalId, monetaryId, cryptoAdoption, cryptoPolicy) {
  const fp = FISCAL_POLICIES.find(p => p.id === fiscalId)   || FISCAL_POLICIES[0];
  const mp = MONETARY_POLICIES.find(p => p.id === monetaryId) || MONETARY_POLICIES[0];
  const e = {
    dM: fp.e.dM,
    yM: mp.e.yM,
    iA: fp.e.iA + mp.e.iA,
    gM: mp.e.gM,
    uM: fp.e.uM,
    lD: fp.e.lD + mp.e.lD,
    cD: fp.e.cD + mp.e.cD,
  };

  const intensity       = displaced / 0.65;
  const aiSpeed         = 0.05 + intensity * 0.78;
  const dispRate        = intensity * 0.90;
  const peakProd        = 0.02 + aiSpeed * 0.12;
  const rampYrs         = 1 + (1 - aiSpeed) * 4;
  const peakDisp        = dispRate * 0.28;
  const yccCap          = monetaryId === "ycc" ? 0.045 : 0.14;

  let debtGDP     = 1.23;
  let employed    = 160;
  const lf        = 167;
  let priceLevel  = 1.0;
  const r0        = 0.041;
  const tax0      = 0.18;
  const spend0    = 0.245;

  let labShare = 0.60;
  let capShare = 0.25;

  let bitcoin         = 85000;
  let cryptoFlight    = 0.01;
  const cAdopt        = cryptoAdoption ?? 0.5;
  let yld             = r0;
  let breakYear       = null;
  let ghostYear       = null;

  const rows = [];

  for (let i = 0; i < 10; i++) {
    const yr = 2026 + i;
    const t  = i + 1;

    const ramp    = Math.min(1, t / rampYrs);
    const prod    = peakProd * ramp * Math.exp(-0.02 * Math.max(0, t - rampYrs));

    const dLag    = Math.max(0, t - 2);
    const dRamp   = Math.min(1, dLag / (rampYrs + 1));
    const annDisp = peakDisp * dRamp * Math.exp(-0.03 * Math.max(0, dLag - rampYrs)) * e.uM;

    employed = Math.max(employed * (1 - annDisp), lf * 0.55);
    const unemp = Math.max(0, 1 - employed / lf);

    if (!ghostYear && prod > 0.03 && unemp > 0.08) ghostYear = yr;

    const escapeValve = Math.min(cryptoFlight * cAdopt * 0.06, 0.015);

    const inflRaw = 0.025 - t * 0.0007 - prod * 0.5 + e.iA;
    const infl    = Math.max(-0.10, Math.min(0.20, inflRaw + escapeValve));
    priceLevel *= (1 + infl);

    const drag  = unemp > 0.07 ? (unemp - 0.07) * 1.2 : 0;
    const ghostDrag = cryptoFlight * cAdopt * 0.025;
    const gGDP  = Math.max(-0.05, 0.018 + prod * 0.65 - drag - ghostDrag);

    const postBreak = breakYear && yr >= breakYear;
    const taxOffset = (cryptoPolicy === "tax" && postBreak)
                      ? cryptoFlight * cAdopt * 0.04 : 0;

    const empR   = employed / (lf * 0.956);
    const robTax = fiscalId === "robot_ubi" ? 0.008 : 0;
    const taxErosion = Math.max(0, cryptoFlight * cAdopt * 0.08 - taxOffset);
    const tax    = Math.max(0.10, tax0 * Math.pow(empR, 1.2) + robTax - taxErosion);
    const welf   = Math.max(0, unemp - 0.05) * 2.2;
    const ubi    = fiscalId === "robot_ubi" ? 0.022 : 0;
    const rawSpd = spend0 + welf + ubi;
    const spd    = fiscalId === "austerity" ? Math.min(rawSpd, spend0 * 0.92) : rawSpd;
    const seigniorageLoss = cryptoFlight * cAdopt * 0.018;
    const pDef   = (spd - tax) * e.dM + seigniorageLoss;

    const yldRaw = r0 + Math.max(0, (debtGDP - 1.2) * 0.012 + pDef * 0.18);
    yld = Math.min(yccCap, yldRaw * e.yM);

    const rawDebt = debtGDP * (1 + yld) / (1 + gGDP + infl) + pDef;
    debtGDP = Math.min(rawDebt, 3.0);

    if (!breakYear && (debtGDP > 1.75 || unemp > 0.20 || infl < -0.07 || (yld > 0.065 && debtGDP > 1.5)))
      breakYear = yr;

    const mStress = Math.max(0, yld - 0.04) * 4
      + Math.max(0, -infl) * 3
      + Math.max(0, infl - 0.04) * 4
      + Math.max(0, debtGDP - 1.4) * 0.8;

    const crackdown   = (cryptoPolicy === "ban"  && postBreak) ? 0.55
                      : (cryptoPolicy === "tax"  && postBreak) ? 0.78
                      : 1.0;
    const flightPush  = mStress * 0.022 * cAdopt * crackdown;
    const flightDrift = 0.003 * cAdopt;
    cryptoFlight = Math.min(cryptoFlight + flightPush + flightDrift, 0.35);

    const kShift       = annDisp * 0.45;
    const flightKBoost = cryptoFlight * cAdopt * 0.12;
    labShare = Math.max(0.35, labShare - kShift - flightKBoost + e.lD * 0.025);
    capShare = Math.min(0.52, capShare + kShift * 0.55 + flightKBoost * 0.6 + e.cD * 0.025);

    const btcBase     = mStress * 0.22 * e.gM * cAdopt;
    const btcFlight   = cryptoFlight * 0.55;
    const btcVol      = (cryptoPolicy === "ban"  && breakYear && yr === breakYear) ? -0.25
                      : (cryptoPolicy === "tax"  && breakYear && yr === breakYear) ? -0.08
                      : 0;
    const btcRecovery = (cryptoPolicy === "ban"  && breakYear && yr > breakYear) ? 0.18 * cAdopt
                      : (cryptoPolicy === "tax"  && breakYear && yr > breakYear) ? 0.06 * cAdopt
                      : 0;
    bitcoin = Math.min(
      bitcoin * (1 + Math.min(btcBase + btcFlight, 0.80) + btcVol + btcRecovery + 0.02),
      5000000
    );

    const rowData = {
      year:        yr,
      debtGDP:     +(debtGDP * 100).toFixed(1),
      unemp:       +(unemp * 100).toFixed(1),
      infl:        +(infl * 100).toFixed(1),
      yld:         +(yld * 100).toFixed(2),
      bitcoin:     Math.round(bitcoin),
      cryptoFlight:+(cryptoFlight * 100).toFixed(1),
      labShare:    +(labShare * 100).toFixed(1),
      capShare:    +(capShare * 100).toFixed(1),
    };
    rowData.spiceLevel = simSpiceLevel(rowData);
    rows.push(rowData);
  }

  // first year each crisis level is reached
  const firstYear = [0,1,2,3,4].map(lvl => {
    const r = rows.find(r => r.spiceLevel >= lvl);
    return r ? r.year : null;
  });
  const firstRedYear = firstYear[4];

  return { rows, firstYear, firstRedYear };
}

// ─── SPICE CRISIS LEVEL ────────────────────────────────────────────────────

const SIM_LEVELS = [
  { label:"GREEN",  color:"#16a34a", bg:"#f0fdf4" },
  { label:"BLUE",   color:"#3b82f6", bg:"#eff6ff" },
  { label:"YELLOW", color:"#ca8a04", bg:"#fefce8" },
  { label:"ORANGE", color:"#ea580c", bg:"#fff7ed" },
  { label:"RED",    color:"#dc2626", bg:"#fef2f2" },
];

function simSpiceLevel(row) {
  let s = 0;
  const d = row.debtGDP;
  if (d > 140) s += 4; else if (d > 120) s += 3; else if (d > 100) s += 2; else if (d > 80) s += 1;
  const u = row.unemp;
  if (u > 12) s += 4; else if (u > 8) s += 3; else if (u > 6) s += 2; else if (u > 4.5) s += 1;
  const inf = row.infl;
  if (inf > 9 || inf < -2) s += 4;
  else if (inf > 7 || inf < 0) s += 3;
  else if (inf > 5 || inf < 1) s += 2;
  else if (inf > 3.5 || inf < 1.5) s += 1;
  const y = row.yld;
  if (y > 7) s += 4; else if (y > 6) s += 3; else if (y > 5) s += 2; else if (y > 4) s += 1;
  // 0–2 GREEN · 3–5 BLUE · 6–9 YELLOW · 10–12 ORANGE · 13–16 RED
  if (s >= 13) return 4;
  if (s >= 10) return 3;
  if (s >=  6) return 2;
  if (s >=  3) return 1;
  return 0;
}

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
  const maxBtc  = Math.max(...rows.map(r => r.bitcoin));
  const roundTo = maxBtc < 200000 ? 25000 : maxBtc < 500000 ? 50000 : 100000;
  const axMax   = Math.ceil(maxBtc * 1.15 / roundTo) * roundTo;
  const step    = axMax / 4;
  const idxTicks = [1,2,3,4].map(n => Math.round(n * step / roundTo) * roundTo);

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
            <YAxis yAxisId="pct" orientation="right" domain={[0,40]} ticks={[5,15,25,35]}
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

// ─── MAIN ──────────────────────────────────────────────────────────────────

export default function Chart3Simulation() {
  const [displaced,    setDisplaced]    = useState(0.40);
  const [fiscalId,     setFiscalId]     = useState("none");
  const [monetaryId,   setMonetaryId]   = useState("none");
  const [kpiYear,      setKpiYear]      = useState(2035);
  const [cryptoAdopt,  setCryptoAdopt]  = useState(0.5);
  const [cryptoPolicy, setCryptoPolicy] = useState("ban");
  const [, startTransition] = useTransition();

  const { rows, firstYear, firstRedYear } = useMemo(
    () => runSim(displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy),
    [displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy]
  );

  const last        = rows.find(r => r.year === kpiYear) || rows[rows.length - 1];
  const actFiscal   = FISCAL_POLICIES.find(p => p.id === fiscalId);
  const actMonetary = MONETARY_POLICIES.find(p => p.id === monetaryId);
  const anchor      = ANCHORS.reduce((a,b) =>
    Math.abs(a.pct - displaced) < Math.abs(b.pct - displaced) ? a : b);

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
              📋 {actFiscal?.label}
            </div>
          )}
          {monetaryId !== "none" && (
            <div style={{ padding:"3px 8px", fontSize:8,
              background:"#fff5f5", border:"1px solid #ef444450", color:"#ef4444" }}>
              🖨 {actMonetary?.label}
            </div>
          )}
          {fiscalId === "none" && monetaryId === "none" && (
            <div style={{ padding:"3px 8px", fontSize:8,
              background:"#f9f9f9", border:"1px solid #e8e8e8", color:"#aaa" }}>
              No policy response
            </div>
          )}

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
            <div style={{ marginTop:3, lineHeight:1.5 }}>
              Debt/GDP(t+1) = Debt/GDP(t) × (1+r)/(1+g) + deficit<br/>
              CBO · IMF WP/2025/076 · Reinhart-Rogoff
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex:1, overflow:"hidden", padding:"10px 12px",
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

          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)",
            gap:5, marginBottom:8, flexShrink:0 }}>
            <KPI label={`Debt/GDP ${kpiYear}`} value={`${last.debtGDP}%`}    color="#ef4444" warn={last.debtGDP>175} />
            <KPI label={`Unemp ${kpiYear}`}    value={`${last.unemp}%`}      color="#8b5cf6" warn={last.unemp>15} />
            <KPI label={`Inflation ${kpiYear}`}value={`${last.infl}%`}       color={last.infl<0?"#3b82f6":"#22c55e"} warn={Math.abs(last.infl)>7} />
            <KPI label={`10Y Yield ${kpiYear}`}value={`${last.yld}%`}        color="#eab308" warn={last.yld>5.5} />
            <KPI label={`Bitcoin ${kpiYear}`}  value={last.bitcoin >= 1000000 ? `$${(last.bitcoin/1000000).toFixed(2)}M` : `$${(last.bitcoin/1000).toFixed(0)}k`} color="#f59e0b" warn={false} />
            <KPI label={`Labour ${kpiYear}`}   value={`${last.labShare}%`}   color="#22c55e" warn={last.labShare<40} />
          </div>

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
        </div>
      </div>
    </div>
  );
}
