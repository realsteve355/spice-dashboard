import { useState, useMemo } from "react";
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
  { pct:0.60, label:"Tsunami",  desc:"AGI-equivalent transition compressed into 3–4 years." },
];

// ─── POLICIES ──────────────────────────────────────────────────────────────

// Fiscal and monetary policies are independent — both can be active simultaneously
// Effects are multiplied/added together in the simulation
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
  // Combine effects: multipliers multiply, additive terms add
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
  const peakProd        = 0.02 + aiSpeed * 0.12;   // capped lower — realistic 14% max prod boost
  const rampYrs         = 1 + (1 - aiSpeed) * 4;
  const peakDisp        = dispRate * 0.28;          // annual displacement rate, lower ceiling
  const yccCap          = monetaryId === "ycc" ? 0.045 : 0.14;

  let debtGDP     = 1.23;
  let employed    = 160;
  const lf        = 167;
  let priceLevel  = 1.0;
  const r0        = 0.041;
  const tax0      = 0.18;
  const spend0    = 0.245;

  // K-shape starting shares
  let labShare = 0.60;
  let capShare = 0.25;

  let bitcoin         = 85000; // bitcoin price USD, starting ~$85k (Mar 2026)
  let cryptoFlight    = 0.01;  // % of capital in crypto (starts ~1%)
  const cAdopt        = cryptoAdoption ?? 0.5; // 0=none, 1=Venezuela-speed
  let yld             = r0;
  let breakYear       = null;
  let ghostYear       = null;

  const rows = [];

  for (let i = 0; i < 10; i++) {
    const yr = 2026 + i;
    const t  = i + 1;

    // ── Productivity
    const ramp    = Math.min(1, t / rampYrs);
    const prod    = peakProd * ramp * Math.exp(-0.02 * Math.max(0, t - rampYrs));

    // ── Displacement — lags productivity by ~2 years
    const dLag    = Math.max(0, t - 2);
    const dRamp   = Math.min(1, dLag / (rampYrs + 1));
    const annDisp = peakDisp * dRamp * Math.exp(-0.03 * Math.max(0, dLag - rampYrs)) * e.uM;

    employed = Math.max(employed * (1 - annDisp), lf * 0.55);
    const unemp = Math.max(0, 1 - employed / lf);

    if (!ghostYear && prod > 0.03 && unemp > 0.08) ghostYear = yr;

    // ── LOOP 3 (escape valve): high crypto flight reduces inflationary pressure
    // People saving in stablecoins rather than spending fiat → fiat velocity falls
    // Effect is small at low flight, meaningful above ~15% capital shift
    // Calibration: max -1.5pp dampening at full Venezuela adoption
    const escapeValve = Math.min(cryptoFlight * cAdopt * 0.06, 0.015);

    // ── Inflation: AI deflation vs stimulus, moderated by escape valve at high adoption
    const inflRaw = 0.025 - t * 0.0007 - prod * 0.5 + e.iA;
    const infl    = Math.max(-0.10, Math.min(0.20, inflRaw + escapeValve));
    priceLevel *= (1 + infl);

    // ── GDP growth
    const drag  = unemp > 0.07 ? (unemp - 0.07) * 1.2 : 0;
    // LOOP 4 (ghost GDP): activity migrating to informal crypto economy
    // disappears from measured GDP — worsens the debt/GDP denominator
    // Calibration: up to -0.8pp off measured growth at Venezuela-speed
    const ghostDrag = cryptoFlight * cAdopt * 0.025;
    const gGDP  = Math.max(-0.05, 0.018 + prod * 0.65 - drag - ghostDrag);

    // ── Policy state — needed by fiscal block below
    const postBreak = breakYear && yr >= breakYear;
    // Tax regime partially restores tax base (Loop 1 offset)
    const taxOffset = (cryptoPolicy === "tax" && postBreak)
                      ? cryptoFlight * cAdopt * 0.04 : 0;

    // ── Fiscal
    const empR   = employed / (lf * 0.956);
    const robTax = fiscalId === "robot_ubi" ? 0.008 : 0;
    // LOOP 1 (tax erosion): crypto economy is informal → tax base shrinks with flight
    // Calibration: up to -2pp tax revenue at full adoption (Grok: +0.5-1% GDP deficit impact)
    const taxErosion = Math.max(0, cryptoFlight * cAdopt * 0.08 - taxOffset);
    const tax    = Math.max(0.10, tax0 * Math.pow(empR, 1.2) + robTax - taxErosion);
    const welf   = Math.max(0, unemp - 0.05) * 2.2;
    const ubi    = fiscalId === "robot_ubi" ? 0.022 : 0;
    const rawSpd = spend0 + welf + ubi;
    const spd    = fiscalId === "austerity" ? Math.min(rawSpd, spend0 * 0.92) : rawSpd;
    // LOOP 1 (seigniorage loss): government loses inflation tax as currency shrinks
    // Calibration: up to +0.5pp on deficit at high flight (Reinhart-Sbrancia: seigniorage ~2% GDP)
    const seigniorageLoss = cryptoFlight * cAdopt * 0.018;
    const pDef   = (spd - tax) * e.dM + seigniorageLoss;

    // ── Yields — rise with debt stress + ghost GDP making ratio look worse, capped by YCC
    const yldRaw = r0 + Math.max(0, (debtGDP - 1.2) * 0.012 + pDef * 0.18);
    yld = Math.min(yccCap, yldRaw * e.yM);

    // ── Debt/GDP
    // LOOP 4: ghost GDP shrinks measured denominator → ratio worsens beyond true level
    // This spooks bond markets → yield spike feedback already captured via yldRaw above
    const rawDebt = debtGDP * (1 + yld) / (1 + gGDP + infl) + pDef;
    debtGDP = Math.min(rawDebt, 3.0);

    // ── Break point
    if (!breakYear && (debtGDP > 1.75 || unemp > 0.20 || infl < -0.07 || (yld > 0.065 && debtGDP > 1.5)))
      breakYear = yr;

    // ── Monetary stress index
    const mStress = Math.max(0, yld - 0.04) * 4
      + Math.max(0, -infl) * 3
      + Math.max(0, infl - 0.04) * 4
      + Math.max(0, debtGDP - 1.4) * 0.8;

    // ── Crypto flight: capital fleeing to crypto (dollarization analogue)
    // mStress drives flight; government response modifies the trajectory
    // "ban"  — crackdown suppresses flight but triggers backfire recovery (Venezuela/Argentina)
    // "tax"  — flight slows as informal advantage narrows; tax erosion partially offset
    // "none" — no intervention; flight continues unimpeded
    const crackdown   = (cryptoPolicy === "ban"  && postBreak) ? 0.55
                      : (cryptoPolicy === "tax"  && postBreak) ? 0.78
                      : 1.0;
    const flightPush  = mStress * 0.022 * cAdopt * crackdown;
    const flightDrift = 0.003 * cAdopt;
    cryptoFlight = Math.min(cryptoFlight + flightPush + flightDrift, 0.35);

    // ── LOOP 2 (K-shape acceleration): flight is wealth-stratified
    // Only those with savings/tech access can flee → those left in fiat bear full devaluation
    // Labour share falls faster at high adoption; capital share rises faster
    // Calibration: up to +30% faster K-shape divergence at Venezuela-speed
    const kShift       = annDisp * 0.45;
    const flightKBoost = cryptoFlight * cAdopt * 0.12; // extra K-shape push from stratified flight
    labShare = Math.max(0.35, labShare - kShift - flightKBoost + e.lD * 0.025);
    capShare = Math.min(0.52, capShare + kShift * 0.55 + flightKBoost * 0.6 + e.cD * 0.025);

    // ── Bitcoin: volatile, crisis-amplified, adoption-driven
    // ban:  sharp dip at break (regulatory fear), then strong backfire recovery
    // tax:  mild dip (compliance uncertainty), modest recovery — price not suppressed long-term
    // none: no intervention dip; steady climb
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

    rows.push({
      year:        yr,
      debtGDP:     +(debtGDP * 100).toFixed(1),
      unemp:       +(unemp * 100).toFixed(1),
      infl:        +(infl * 100).toFixed(1),
      yld:         +(yld * 100).toFixed(2),
      bitcoin:     Math.round(bitcoin),
      cryptoFlight:+(cryptoFlight * 100).toFixed(1),
      labShare:    +(labShare * 100).toFixed(1),
      capShare:    +(capShare * 100).toFixed(1),
      isBreak:     yr === breakYear,
      isGhost:     yr === ghostYear,
    });
  }
  return { rows, breakYear, ghostYear };
}

// ─── REUSABLE CHART HELPERS ────────────────────────────────────────────────

const CH = 148; // chart height px — explicit everywhere

const axTick = { fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fill:"#bbb" };

// ─── PANEL HEADER ──────────────────────────────────────────────────────────

function PanelHead({ label, color, children }) {
  return (
    <div style={{ fontSize:8, fontFamily:"'IBM Plex Mono',monospace",
      textTransform:"uppercase", letterSpacing:"0.1em",
      color, fontWeight:700, marginBottom:3 }}>
      {label}{children}
    </div>
  );
}

// ─── SIMPLE TOOLTIP ────────────────────────────────────────────────────────

function SimpleTip({ active, payload, label, color, unit, rows }) {
  if (!active || !payload?.length) return null;
  const d   = payload[0]?.payload;
  const val = payload[0]?.value;
  // look up true value from rows (in case of clamping)
  const raw = rows?.find(r => r.year === d?.year);
  return (
    <div style={{ background:"#fff", border:`1px solid ${color}50`,
      padding:"6px 10px", fontFamily:"'IBM Plex Mono',monospace",
      fontSize:11, boxShadow:"0 2px 8px rgba(0,0,0,.1)", pointerEvents:"none" }}>
      <div style={{ color:"#999", fontSize:9, marginBottom:2 }}>
        {label}
        {d?.isBreak && <span style={{ color:"#ef4444", marginLeft:5 }}>⚠ break</span>}
        {d?.isGhost && !d?.isBreak && <span style={{ color:"#f97316", marginLeft:5 }}>👻 ghost</span>}
      </div>
      <div style={{ color, fontWeight:700, fontSize:15 }}>{raw ? raw[payload[0].dataKey] : val}{unit}</div>
    </div>
  );
}

// ─── INDIVIDUAL CHART COMPONENTS (no conditional rendering) ────────────────

function DebtChart({ rows, breakYear, ghostYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="Debt / GDP" color="#ef4444">
        <span style={{ fontSize:7, fontWeight:400, color:"#bbb", marginLeft:6 }}>capped at 300%</span>
      </PanelHead>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} /><XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[100,310]} ticks={[125,175,225,275]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#ef4444" unit="%" rows={rows} />} />
            <ReferenceLine y={130} stroke="#ef444440" strokeDasharray="3 4"
              label={{ value:"130%", fill:"#ef444460", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={175} stroke="#ef444480" strokeDasharray="3 4"
              label={{ value:"175%", fill:"#ef444480", fontSize:7, position:"insideTopRight" }} />
            <>{breakYear && <ReferenceLine x={breakYear} stroke="#ef444455" strokeWidth={1.5} strokeDasharray="4 3" />}{ghostYear && ghostYear !== breakYear && <ReferenceLine x={ghostYear} stroke="#f9731655" strokeWidth={1} strokeDasharray="2 4" />}</>
            <Line type="monotone" dataKey="debtGDP" stroke="#ef4444" strokeWidth={2.5}
              dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#ef4444", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UnempChart({ rows, breakYear, ghostYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="Unemployment" color="#8b5cf6" />
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} /><XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[0,50]} ticks={[5,15,25,35,45]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#8b5cf6" unit="%" rows={rows} />} />
            <ReferenceLine y={10} stroke="#8b5cf640" strokeDasharray="3 4"
              label={{ value:"10%", fill:"#8b5cf660", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={20} stroke="#8b5cf670" strokeDasharray="3 4"
              label={{ value:"20% depression", fill:"#8b5cf670", fontSize:7, position:"insideTopRight" }} />
            <>{breakYear && <ReferenceLine x={breakYear} stroke="#ef444455" strokeWidth={1.5} strokeDasharray="4 3" />}{ghostYear && ghostYear !== breakYear && <ReferenceLine x={ghostYear} stroke="#f9731655" strokeWidth={1} strokeDasharray="2 4" />}</>
            <Line type="monotone" dataKey="unemp" stroke="#8b5cf6" strokeWidth={2.5}
              dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#8b5cf6", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InflChart({ rows, breakYear, ghostYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="Inflation / Deflation" color="#3b82f6" />
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} /><XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[-12,20]} ticks={[-10,-5,0,5,10,15]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#3b82f6" unit="%" rows={rows} />} />
            <ReferenceLine y={0} stroke="#3b82f680" strokeDasharray="3 4"
              label={{ value:"0%", fill:"#3b82f680", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={-8} stroke="#3b82f6aa" strokeDasharray="3 4"
              label={{ value:"−8% Fisher", fill:"#3b82f6aa", fontSize:7, position:"insideTopRight" }} />
            <>{breakYear && <ReferenceLine x={breakYear} stroke="#ef444455" strokeWidth={1.5} strokeDasharray="4 3" />}{ghostYear && ghostYear !== breakYear && <ReferenceLine x={ghostYear} stroke="#f9731655" strokeWidth={1} strokeDasharray="2 4" />}</>
            <Line type="monotone" dataKey="infl" stroke="#3b82f6" strokeWidth={2.5}
              dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#3b82f6", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function YieldChart({ rows, breakYear, ghostYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <PanelHead label="10Y Bond Yield" color="#eab308" />
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} /><XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
            <YAxis domain={[2,14]} ticks={[3,5,7,9,11,13]} tick={axTick} tickLine={false} axisLine={false} width={42} tickFormatter={v => `${v}%`} />
            <Tooltip content={p => <SimpleTip {...p} color="#eab308" unit="%" rows={rows} />} />
            <ReferenceLine y={4.5} stroke="#eab30850" strokeDasharray="3 4"
              label={{ value:"YCC cap", fill:"#eab30870", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={6} stroke="#eab30880" strokeDasharray="3 4"
              label={{ value:"6% stress", fill:"#eab30880", fontSize:7, position:"insideTopRight" }} />
            <>{breakYear && <ReferenceLine x={breakYear} stroke="#ef444455" strokeWidth={1.5} strokeDasharray="4 3" />}{ghostYear && ghostYear !== breakYear && <ReferenceLine x={ghostYear} stroke="#f9731655" strokeWidth={1} strokeDasharray="2 4" />}</>
            <Line type="monotone" dataKey="yld" stroke="#eab308" strokeWidth={2.5}
              dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#eab308", strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BitcoinChart({ rows, breakYear, ghostYear }) {
  // Auto-scale: derive domain and ticks from actual data (USD prices)
  const maxBtc  = Math.max(...rows.map(r => r.bitcoin));
  const roundTo = maxBtc < 200000 ? 25000 : maxBtc < 500000 ? 50000 : 100000;
  const axMax   = Math.ceil(maxBtc * 1.15 / roundTo) * roundTo;
  const step    = axMax / 4;
  const idxTicks = [1,2,3,4].map(n => Math.round(n * step / roundTo) * roundTo);

  // Dollar reference lines — multiples of $85k baseline
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
                  {d.isBreak && <div style={{ color:"#ef4444", marginTop:3 }}>↯ Break point</div>}
                </div>
              );
            }} />
            <>{breakYear && <ReferenceLine yAxisId="idx" x={breakYear} stroke="#ef444455" strokeWidth={1.5} strokeDasharray="4 3" />}
              {ghostYear && ghostYear !== breakYear && <ReferenceLine yAxisId="idx" x={ghostYear} stroke="#f9731655" strokeWidth={1} strokeDasharray="2 4" />}</>
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

// K-shape: completely standalone component, no shared panel logic
function KShapeChart({ rows, breakYear, ghostYear }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", padding:"8px 8px 4px" }}>
      <div style={{ fontSize:8, fontFamily:"'IBM Plex Mono',monospace",
        textTransform:"uppercase", letterSpacing:"0.1em",
        color:"#555", fontWeight:700, marginBottom:3 }}>
        K-Shaped Economy
        <span style={{ marginLeft:8, fontSize:7, fontWeight:400 }}>
          <span style={{ color:"#22c55e" }}>━ Labour  </span>
          <span style={{ color:"#ef4444" }}>━ Capital</span>
          <span style={{ color:"#aaa" }}>  % of GDP</span>
        </span>
      </div>
      <div style={{ width:"100%", height:CH }}>
        <ResponsiveContainer width="100%" height={CH}>
          <LineChart data={rows} margin={{ top:4, right:6, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 5" stroke="#f4f4f4" vertical={false} /><XAxis dataKey="year" tick={axTick} tickLine={false} axisLine={{ stroke:"#ebebeb" }} interval={3} />
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
            <ReferenceLine y={60} stroke="#22c55e30" strokeDasharray="3 4"
              label={{ value:"Labour 2026", fill:"#22c55e50", fontSize:7, position:"insideTopRight" }} />
            <ReferenceLine y={25} stroke="#ef444430" strokeDasharray="3 4"
              label={{ value:"Capital 2026", fill:"#ef444450", fontSize:7, position:"insideTopRight" }} />
            <>{breakYear && <ReferenceLine x={breakYear} stroke="#ef444455" strokeWidth={1.5} strokeDasharray="4 3" />}{ghostYear && ghostYear !== breakYear && <ReferenceLine x={ghostYear} stroke="#f9731655" strokeWidth={1} strokeDasharray="2 4" />}</>
            <Line type="monotone" dataKey="labShare" stroke="#22c55e" strokeWidth={2.5}
              dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#22c55e", strokeWidth:0 }} />
            <Line type="monotone" dataKey="capShare" stroke="#ef4444" strokeWidth={2.5}
              dot={false} isAnimationActive={false} activeDot={{ r:3, fill:"#ef4444", strokeWidth:0 }} />
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
  const [displaced,  setDisplaced]  = useState(0.40);
  const [fiscalId,   setFiscalId]   = useState("none");
  const [monetaryId, setMonetaryId] = useState("none");
  const [kpiYear,    setKpiYear]    = useState(2035);
  const [cryptoAdopt, setCryptoAdopt] = useState(0.5);
  const [cryptoPolicy, setCryptoPolicy] = useState("ban");

  const { rows, breakYear, ghostYear } = useMemo(
    () => runSim(displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy),
    [displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy]
  );

  const last       = rows.find(r => r.year === kpiYear) || rows[rows.length - 1];
  const actFiscal  = FISCAL_POLICIES.find(p => p.id === fiscalId);
  const actMonetary= MONETARY_POLICIES.find(p => p.id === monetaryId);
  const anchor     = ANCHORS.reduce((a,b) =>
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
          <span style={{ fontSize:9, color:"#aaa", letterSpacing:"0.18em",
            textTransform:"uppercase", marginRight:10 }}>SPICE Thesis — Chart 3</span>
          <span style={{ fontSize:15, fontWeight:700 }}>
            Debt Tsunami <span style={{ color:"#B8860B" }}>Simulation</span>
          </span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {fiscalId !== "none" && <div style={{ padding:"3px 8px", fontSize:8,
            background:"#f0fdf4", border:"1px solid #22c55e50", color:"#22c55e" }}>
            📋 {actFiscal?.label}
          </div>}
          {monetaryId !== "none" && <div style={{ padding:"3px 8px", fontSize:8,
            background:"#fff5f5", border:"1px solid #ef444450", color:"#ef4444" }}>
            🖨 {actMonetary?.label}
          </div>}
          {fiscalId === "none" && monetaryId === "none" && <div style={{ padding:"3px 8px", fontSize:8,
            background:"#f9f9f9", border:"1px solid #e8e8e8", color:"#aaa" }}>
            No policy response
          </div>}
          {breakYear
            ? <div style={{ padding:"3px 8px", fontSize:9, fontWeight:700,
                background:"#fff5f5", border:"1px solid #ef4444", color:"#ef4444" }}>⚠ BREAK {breakYear}</div>
            : <div style={{ padding:"3px 8px", fontSize:9, fontWeight:700,
                background:"#f0fdf4", border:"1px solid #22c55e40", color:"#22c55e" }}>✓ NO BREAK</div>
          }
          {ghostYear && <div style={{ padding:"3px 8px", fontSize:9, fontWeight:700,
            background:"#fff8f0", border:"1px solid #f9731650", color:"#f97316" }}>👻 GHOST {ghostYear}</div>}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* LEFT */}
        <div style={{ width:220, flexShrink:0, borderRight:"1px solid #f0f0f0",
          padding:"12px 12px", overflowY:"auto", background:"#fafafa" }}>

          <div style={{ fontSize:9, color:"#aaa", textTransform:"uppercase",
            letterSpacing:"0.1em", marginBottom:6 }}>Displacement by 2030</div>
          <div style={{ fontSize:10, color:"#555", lineHeight:1.5, marginBottom:7 }}>
            What fraction of knowledge workers will be{" "}
            <strong style={{ color:"#111" }}>substantially displaced</strong> by AI?
          </div>

          <input type="range" min={0} max={0.65} step={0.01} value={displaced}
            onChange={ev => setDisplaced(+ev.target.value)}
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
            onChange={ev => setCryptoAdopt(+ev.target.value)}
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
            { id:"ban",  label:"Ban & restrict",  desc:"Capital controls + exchange bans. Crackdown dip then backfire. (Venezuela, China)" },
            { id:"tax",  label:"Tax & regulate",  desc:"On-chain reporting, capital gains tax. Flight slows; tax base partially recovered. (US, EU path)" },
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
            <div><span style={{ color:"#ef444460" }}>━ </span>Red = break point year</div>
            <div><span style={{ color:"#f9731660" }}>╌ </span>Orange = ghost GDP onset</div>
            <div style={{ marginTop:3, lineHeight:1.5 }}>
              Debt/GDP(t+1) = Debt/GDP(t) × (1+r)/(1+g) + deficit<br/>
              CBO · IMF WP/2025/076 · Reinhart-Rogoff
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex:1, overflow:"hidden", padding:"10px 12px",
          display:"flex", flexDirection:"column" }}>

          {/* KPI year selector */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexShrink:0 }}>
            <span style={{ fontSize:8, color:"#aaa", fontFamily:"'IBM Plex Mono',monospace",
              textTransform:"uppercase", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>
              Snapshot year
            </span>
            <input type="range" min={2026} max={2035} step={1} value={kpiYear}
              onChange={ev => setKpiYear(+ev.target.value)}
              style={{ flex:1, accentColor:"#555", cursor:"pointer" }} />
            <div style={{ position:"relative", width:180, flexShrink:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:"#ccc" }}>
                {rows.map(r => (
                  <span key={r.year}
                    onClick={() => setKpiYear(r.year)}
                    style={{ cursor:"pointer", fontWeight:r.year===kpiYear?700:400,
                      color:r.year===kpiYear?"#111":"#ccc" }}>
                    {r.year}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)",
            gap:5, marginBottom:8, flexShrink:0 }}>
            <KPI label={`Debt/GDP ${kpiYear}`}  value={`${last.debtGDP}%`}    color="#ef4444" warn={last.debtGDP>175} />
            <KPI label={`Unemp ${kpiYear}`}      value={`${last.unemp}%`}      color="#8b5cf6" warn={last.unemp>15} />
            <KPI label={`Inflation ${kpiYear}`}  value={`${last.infl}%`}       color={last.infl<0?"#3b82f6":"#22c55e"} warn={Math.abs(last.infl)>7} />
            <KPI label={`10Y Yield ${kpiYear}`}  value={`${last.yld}%`}        color="#eab308" warn={last.yld>5.5} />
            <KPI label={`Bitcoin ${kpiYear}`}    value={last.bitcoin >= 1000000 ? `$${(last.bitcoin/1000000).toFixed(2)}M` : `$${(last.bitcoin/1000).toFixed(0)}k`} color="#f59e0b" warn={false} />
            <KPI label={`Labour ${kpiYear}`}     value={`${last.labShare}%`}   color="#22c55e" warn={last.labShare<40} />
          </div>

          {/* 3×2 grid — each cell explicitly sized in px */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gridTemplateRows:`repeat(2,${CH+32}px)`, gap:8, flexShrink:0 }}>
            <DebtChart   rows={rows} breakYear={breakYear} ghostYear={ghostYear} />
            <UnempChart  rows={rows} breakYear={breakYear} ghostYear={ghostYear} />
            <InflChart   rows={rows} breakYear={breakYear} ghostYear={ghostYear} />
            <YieldChart  rows={rows} breakYear={breakYear} ghostYear={ghostYear} />
            <BitcoinChart rows={rows} breakYear={breakYear} ghostYear={ghostYear} />
            <KShapeChart rows={rows} breakYear={breakYear} ghostYear={ghostYear} />
          </div>

          <div style={{ fontSize:7, color:"#ccc", marginTop:7, flexShrink:0 }}>
            Sources: CBO 2025 · IMF WP/2025/076 · Reinhart-Rogoff NBER w15639 · Goldman Sachs · Dallas Fed 2025
          </div>
        </div>
      </div>
    </div>
  );
}
