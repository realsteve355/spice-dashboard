import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import simulate from "../lib/collision/simulate.js";
import { DEFAULT_PARAMS } from "../lib/collision/defaults.js";
import { PRESETS, REGIMES, POLICIES } from "../lib/collision/presets.js";

// ── Constants & helpers ────────────────────────────────────────────────────

const CRYPTO_LABELS = [
  'None','Very Low','Low','Moderate','Significant',
  'High','Very High','Aggressive','Rapid','Extreme','Maximum',
];
const GINI_LABELS = ['','Very Low','Low','Medium','High','Extreme'];
const LAG_FMT = v =>
  ({0:'None',0.5:'6 mo',1:'1 yr',1.5:'18 mo',2:'2 yr',2.5:'2.5 yr',3:'3 yr'}[v] ?? `${v}yr`);

function crisisInfo(score) {
  if (score < 12) return { label: 'MONITORING',         color: '#2E8B7A' };
  if (score < 28) return { label: 'EMERGING STRESS',    color: '#e0c030' };
  if (score < 45) return { label: 'FISCAL CRISIS',      color: '#E09933' };
  if (score < 62) return { label: 'ACUTE CRISIS',       color: '#CC4444' };
  if (score < 80) return { label: 'SYSTEMIC BREAKDOWN', color: '#C0392B' };
  return               { label: 'TERMINAL',             color: '#8B0000' };
}

// Slider definitions — values in simulate()-ready scale (matching DEFAULT_PARAMS)
const SLIDER_SECTIONS = [
  { title: 'Automation & Labour', sliders: [
    { key:'auto',      label:'Automation Rate',   min:0.01, max:0.20, step:0.005,  fmt:v=>`${(v*100).toFixed(1)}%`, color:'#CC4444' },
    { key:'reinstate', label:'Job Reinstatement', min:0,    max:1,    step:0.05,   fmt:v=>`${(v*100).toFixed(0)}%`, color:'#2E8B7A' },
    { key:'prod',      label:'Productivity',      min:1.1,  max:8,    step:0.1,    fmt:v=>`${v.toFixed(1)}×` },
    { key:'rec',       label:'AI Recursion',      min:1.00, max:1.30, step:0.01,   fmt:v=>`${v.toFixed(2)}×`,       color:'#CC4444' },
    { key:'lag',       label:'Adoption Lag',      min:0,    max:3,    step:0.5,    fmt:LAG_FMT },
  ]},
  { title: 'Fiscal & Monetary', sliders: [
    { key:'debt',   label:'Starting Debt/GDP', min:0.40, max:2.80, step:0.02,   fmt:v=>`${(v*100).toFixed(0)}%` },
    { key:'def',    label:'Primary Deficit',   min:0,    max:0.15, step:0.005,  fmt:v=>`${(v*100).toFixed(1)}%`, color:'#CC4444' },
    { key:'rate',   label:'Interest Rate',     min:0.01, max:0.12, step:0.0025, fmt:v=>`${(v*100).toFixed(2)}%` },
    { key:'captax', label:'Capital Tax',       min:0,    max:0.60, step:0.02,   fmt:v=>`${(v*100).toFixed(0)}%`, color:'#2E8B7A' },
    { key:'domcap', label:'Domestic Capture',  min:0,    max:1,    step:0.05,   fmt:v=>`${(v*100).toFixed(0)}%`, color:'#2E8B7A' },
    { key:'qe',     label:'QE Intensity',      min:0,    max:0.30, step:0.01,   fmt:v=>`${(v*100).toFixed(0)}%`, color:'#7B68EE' },
    { key:'ubi',    label:'UBI Level',         min:0,    max:0.80, step:0.05,   fmt:v=>`${(v*100).toFixed(0)}%`, color:'#3388CC' },
    { key:'gini',   label:'Inequality',        min:1,    max:5,    step:1,      fmt:v=>GINI_LABELS[v]??String(v), color:'#CC4444' },
    { key:'crypto', label:'Crypto Adoption',   min:0,    max:1,    step:0.1,    fmt:v=>CRYPTO_LABELS[Math.round(v*10)]??String(v), color:'#CC4444' },
  ]},
];
const YCC_SLIDER = {
  key:'ycccap', label:'YCC Yield Cap', min:0.005, max:0.08, step:0.0025,
  fmt:v=>`${(v*100).toFixed(2)}%`, color:'#7B68EE',
};

const AXIS_STYLE  = { fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fill:'#666' };
const GRID_PROPS  = { stroke:'#E0E0E0', strokeDasharray:'3 3' };
const TOOLTIP_STY = { background:'#1a1d23', border:'1px solid #333', borderRadius:3, fontSize:10, fontFamily:"'IBM Plex Mono',monospace", color:'#e8eaf0' };

// ── Shared micro-components ────────────────────────────────────────────────

function SliderRow({ def, value, onChange }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
        <span style={{ fontSize:10, color:'#333' }}>{def.label}</span>
        <span style={{ fontSize:11, fontWeight:700, color: def.color || '#B8860B', minWidth:46, textAlign:'right' }}>
          {def.fmt(value)}
        </span>
      </div>
      <input
        type="range" min={def.min} max={def.max} step={def.step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={S.range}
      />
    </div>
  );
}

function ChartCard({ title, subtitle, children, wide }) {
  return (
    <div style={{ ...S.chartCard, ...(wide ? { gridColumn:'span 2' } : {}) }}>
      <div style={S.chartTitle}>{title}</div>
      {subtitle && <div style={S.chartSub}>{subtitle}</div>}
      {children}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ borderTop:'1px solid #E0E0E0', paddingTop:8 }}>
      <div style={{ fontSize:8, color:'#666', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:700, color: color || '#000' }}>{value}</div>
    </div>
  );
}

// ── Model & Simulation tab ────────────────────────────────────────────────

function ModelTab({ simData, data10, allData, selLabel, yr, year, crisis }) {
  const cs = simData.score[yr];
  const wageChg  = yr > 0 ? ((simData.wage[yr]  / simData.wage[0]  - 1)*100).toFixed(0) : 0;
  const assetChg = yr > 0 ? ((simData.asset[yr] / simData.asset[0] - 1)*100).toFixed(0) : 0;

  let narrative;
  if (cs < 12) {
    narrative = `${year} — Pre-crisis drift. Debt/GDP ${simData.debt[yr]}%. Wage income share ${simData.ls[yr]}%. GDP growing but in the asset economy — wages ${wageChg >= 0 ? '+' : ''}${wageChg}% from baseline. Conventional analysis misses the structural deterioration underway.`;
  } else if (cs < 28) {
    narrative = `${year} — Emerging fiscal stress. Debt/GDP ${simData.debt[yr]}%. Wage share ${simData.ls[yr]}% — tax base eroding structurally. Unemployment ${simData.u[yr]}%. Bond markets watching. Comparable to Italy 2009–2010: the numbers look manageable until they don't.`;
  } else if (cs < 45) {
    narrative = `⚠ FISCAL CRISIS — ${year}. Debt/GDP ${simData.debt[yr]}% with this trajectory is not "stress" — it is a crisis. Italy triggered bond panic at 120%; Greece at 130%. Yield ${simData.marketYield[yr]}%. Wage share ${simData.ls[yr]}% — the tax base is structurally shrinking.`;
  } else if (cs < 62) {
    narrative = `🔴 ACUTE SOVEREIGN CRISIS — ${year}. Debt/GDP ${simData.debt[yr]}% — beyond any level a major economy has stabilised without restructuring or YCC. Yield ${simData.marketYield[yr]}%. The bond market is not pricing risk. It is pricing exit. Assets +${assetChg}% while the wage economy collapses.`;
  } else if (cs < 80) {
    narrative = `🚨 SYSTEMIC BREAKDOWN — ${year}. Debt/GDP ${simData.debt[yr]}%, yield ${simData.marketYield[yr]}%. No democratic government has managed debt at this level without defaulting or debasing. Wage share ${simData.ls[yr]}%, unemployment ${simData.u[yr]}%. The wage economy has ceased to function as a tax base.`;
  } else {
    narrative = `💀 TERMINAL — ${year}. Debt/GDP ${simData.debt[yr]}%, yield ${simData.marketYield[yr]}%. Restructuring is not a policy option — it is a mathematical certainty. Argentina 2001. Greece 2012. The question is no longer whether. It is who bears the losses.`;
  }

  const events = [
    { name: 'Wage Share Below 55%',     triggered: simData.ls.some(v => v < 55) },
    { name: 'Unemployment Exceeds 10%', triggered: simData.u.some(v => v > 10) },
    { name: 'Consumer Deflation',       triggered: simData.cons.some((v,i) => i > 0 && v < simData.cons[i-1]) },
    { name: 'Debt/GDP Exceeds 130%',    triggered: simData.debt.some(v => v > 130) },
    { name: 'Bond Yield Above 7.5%',    triggered: simData.marketYield.some(v => v > 7.5) },
    { name: 'SPICE Activated (≥ 35)',   triggered: simData.crisisYear !== null },
  ];

  return (
    <div style={S.tabContent}>
      <div style={{ ...S.narrative, borderLeftColor: crisis.color }}>
        <div style={{ fontSize:9, color: crisis.color, letterSpacing:'0.18em', fontWeight:700, marginBottom:8 }}>
          SCENARIO ANALYSIS — {selLabel}
        </div>
        <div style={{ fontSize:12, color:'#333', lineHeight:1.75 }}>{narrative}</div>
        {simData.crisisYear && (
          <div style={{ marginTop:10, fontSize:11, color:'#B8860B', fontWeight:700 }}>
            ◈ SPICE ACTIVATED: {simData.crisisYear} — crisis score crossed 35
          </div>
        )}
      </div>

      <div style={S.eventsRow}>
        {events.map(ev => (
          <div key={ev.name} style={{ ...S.eventChip, background: ev.triggered ? '#FFF8E1' : '#F8F8F8', borderColor: ev.triggered ? '#B8860B' : '#E0E0E0' }}>
            <span style={{ color: ev.triggered ? '#B8860B' : '#CCC', marginRight:5 }}>{ev.triggered ? '●' : '○'}</span>
            <span style={{ fontSize:10, color: ev.triggered ? '#000' : '#999' }}>{ev.name}</span>
          </div>
        ))}
      </div>

      <div style={S.chartsGrid}>
        <ChartCard title="DEBT / GDP" subtitle="200% reference — restructuring zone">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={data10}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="yr" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} unit="%" domain={['auto','auto']} />
              <Tooltip contentStyle={TOOLTIP_STY} />
              <ReferenceLine y={200} stroke="#CC4444" strokeDasharray="4 3" strokeWidth={1} />
              <ReferenceLine x={selLabel} stroke="#B8860B" strokeWidth={1.5} strokeDasharray="3 2" />
              <Line type="monotone" dataKey="debt" stroke="#3388CC" strokeWidth={2.5} dot={false} name="Debt/GDP %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="UNEMPLOYMENT" subtitle="Structural displacement + welfare load">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={data10}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="yr" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STY} />
              <ReferenceLine x={selLabel} stroke="#B8860B" strokeWidth={1.5} strokeDasharray="3 2" />
              <Line type="monotone" dataKey="u"       stroke="#d35400" strokeWidth={2.5} dot={false} name="Unemployment %" />
              <Line type="monotone" dataKey="welfare" stroke="#7d3c98" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Welfare/UBI %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="BOND MARKET" subtitle="7.5% = Italy 2011 panic · 5.5% = stress begins">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={allData}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="yr" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STY} />
              <ReferenceLine y={7.5} stroke="#CC4444" strokeDasharray="4 3" strokeWidth={1} />
              <ReferenceLine y={5.5} stroke="#E09933" strokeDasharray="4 3" strokeWidth={1} />
              <ReferenceLine x={selLabel} stroke="#B8860B" strokeWidth={1.5} strokeDasharray="3 2" />
              <Line type="monotone" dataKey="marketYield" stroke="#2E8B7A" strokeWidth={2.5} dot={false} name="Bond Yield %" />
              <Line type="monotone" dataKey="primaryDef"  stroke="#CC4444" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Primary Deficit %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="INFLATION & REAL RATES" subtitle="Consumer deflation vs monetary expansion — the collision">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={data10}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="yr" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STY} />
              <ReferenceLine y={0} stroke="#333" strokeWidth={1} />
              <ReferenceLine x={selLabel} stroke="#B8860B" strokeWidth={1.5} strokeDasharray="3 2" />
              <Line type="monotone" dataKey="inflation" stroke="#CC4444" strokeWidth={2.5} dot={false} name="Composite Inflation %" />
              <Line type="monotone" dataKey="realRate"  stroke="#3388CC" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Real Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Dual Economy tab ───────────────────────────────────────────────────────

function DualTab({ simData, allData, yr }) {
  const gdpChg  = yr > 0 ? ((simData.gdp[yr]  / simData.gdp[0]  - 1)*100).toFixed(0) : 0;
  const wageChg = yr > 0 ? ((simData.wage[yr] / simData.wage[0] - 1)*100).toFixed(0) : 0;

  return (
    <div style={S.tabContent}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ ...S.econCard, borderTop:'4px solid #B8860B' }}>
          <div style={{ fontSize:17, fontWeight:700, color:'#B8860B', letterSpacing:'0.06em', marginBottom:4 }}>CAPITAL ECONOMY</div>
          <div style={{ fontSize:10, color:'#666', marginBottom:12, lineHeight:1.4 }}>AI productivity, asset inflation, corporate profits. Growing independently of the wage economy.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Stat label="GDP Index"    value={simData.gdp[yr].toFixed(0)}  color="#B8860B" />
            <Stat label="GDP Change"   value={`+${gdpChg}%`}               color="#B8860B" />
            <Stat label="Capital Share" value={`${simData.capShare[yr]}%`} color="#B8860B" />
            <Stat label="Asset Index"  value={simData.asset[yr].toFixed(0)} color="#B8860B" />
          </div>
        </div>
        <div style={{ ...S.econCard, borderTop:'4px solid #CC4444' }}>
          <div style={{ fontSize:17, fontWeight:700, color:'#CC4444', letterSpacing:'0.06em', marginBottom:4 }}>LABOUR ECONOMY</div>
          <div style={{ fontSize:10, color:'#666', marginBottom:12, lineHeight:1.4 }}>Wages, employment, consumer demand. The tax base governments need to service their debts.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Stat label="Wage Index"   value={simData.wage[yr].toFixed(0)} color="#CC4444" />
            <Stat label="Wage Change"  value={`${wageChg >= 0 ? '+' : ''}${wageChg}%`}    color="#CC4444" />
            <Stat label="Labour Share" value={`${simData.ls[yr]}%`}        color="#CC4444" />
            <Stat label="Consumer Idx" value={simData.cons[yr].toFixed(0)} color="#CC4444" />
          </div>
        </div>
      </div>

      <ChartCard title="THE SCISSOR — GDP vs Wages vs Consumer Demand" subtitle="Capital and labour economies diverging — the fiscal collapse made visible">
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={allData}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="yr" tick={AXIS_STYLE} />
            <YAxis tick={AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STY} />
            <Line type="monotone" dataKey="gdp"    stroke="#B8860B" strokeWidth={2.5} dot={false} name="GDP Index" />
            <Line type="monotone" dataKey="wage"   stroke="#CC4444" strokeWidth={2.5} dot={false} name="Wage Index" />
            <Line type="monotone" dataKey="demand" stroke="#3388CC" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Consumer Demand" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ marginTop:12 }}>
        <ChartCard title="LABOUR vs CAPITAL INCOME SHARE" subtitle="55% reference — below this, wage tax base erosion accelerates">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={allData}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="yr" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STY} />
              <ReferenceLine y={55} stroke="#CC4444" strokeDasharray="4 3" strokeWidth={1} />
              <Line type="monotone" dataKey="ls"       stroke="#CC4444" strokeWidth={2.5} dot={false} name="Labour Share %" />
              <Line type="monotone" dataKey="capShare" stroke="#B8860B" strokeWidth={2.5} dot={false} name="Capital Share %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Apocalypse Indicators tab ─────────────────────────────────────────────

function IndicatorsTab({ simData, yr }) {
  const d = simData;
  const LEVEL_COLOR = { green:'#2E8B7A', blue:'#3388CC', yellow:'#e0c030', orange:'#E09933', red:'#CC4444' };
  const LEVEL_BG    = { green:'rgba(76,175,122,0.12)', blue:'rgba(85,153,221,0.12)', yellow:'rgba(224,192,48,0.12)', orange:'rgba(224,153,51,0.12)', red:'rgba(224,85,85,0.12)' };

  const indicators = [
    {
      name: 'Debt / GDP', value: `${d.debt[yr]}%`,
      level: d.debt[yr] < 90 ? 'green' : d.debt[yr] < 110 ? 'blue' : d.debt[yr] < 130 ? 'yellow' : d.debt[yr] < 160 ? 'orange' : 'red',
      desc: 'Primary fiscal stress signal. Above 90% markets begin monitoring; above 130% solvency questions emerge.',
      thresholds: ['<90%','90-110%','110-130%','130-160%','>160%'],
    },
    {
      name: 'Bond Yield', value: `${d.marketYield[yr]}%`,
      level: d.marketYield[yr] < 3.5 ? 'green' : d.marketYield[yr] < 5.5 ? 'blue' : d.marketYield[yr] < 7.5 ? 'yellow' : d.marketYield[yr] < 10 ? 'orange' : 'red',
      desc: 'Bond market verdict. 5.5% = risk pricing begins. 7.5% = Italy 2011 panic. 10% = IMF territory.',
      thresholds: ['<3.5%','3.5-5.5%','5.5-7.5%','7.5-10%','>10%'],
    },
    {
      name: 'Unemployment', value: `${d.u[yr]}%`,
      level: d.u[yr] < 5 ? 'green' : d.u[yr] < 8 ? 'blue' : d.u[yr] < 12 ? 'yellow' : d.u[yr] < 20 ? 'orange' : 'red',
      desc: 'Structural displacement plus cyclical. Compounds welfare spending and reduces income tax revenues simultaneously.',
      thresholds: ['<5%','5-8%','8-12%','12-20%','>20%'],
    },
    {
      name: 'Wage Income Share', value: `${d.ls[yr]}%`,
      level: d.ls[yr] > 60 ? 'green' : d.ls[yr] > 55 ? 'blue' : d.ls[yr] > 50 ? 'yellow' : d.ls[yr] > 40 ? 'orange' : 'red',
      desc: 'Fraction of GDP going to labour. Governments tax wages at ~22%; capital at lower effective rates. This is the tax base.',
      thresholds: ['>60%','55-60%','50-55%','40-50%','<40%'],
    },
    {
      name: 'Crisis Score', value: `${d.score[yr]}/100`,
      level: d.score[yr] < 12 ? 'green' : d.score[yr] < 28 ? 'blue' : d.score[yr] < 45 ? 'yellow' : d.score[yr] < 62 ? 'orange' : 'red',
      desc: 'Composite score across debt, yields, wage share and unemployment. SPICE activates when score first crosses 35.',
      thresholds: ['0-11','12-27','28-44','45-61','62+'],
    },
    {
      name: 'Consumer Price Index', value: `${d.cons[yr].toFixed(0)}`,
      level: d.cons[yr] > 115 ? 'red' : d.cons[yr] > 108 ? 'orange' : d.cons[yr] > 100 ? 'yellow' : d.cons[yr] > 93 ? 'blue' : 'green',
      desc: 'Consumer price level (base 100). AI displacement drives deflation; QE fights back. The collision is this divergence.',
      thresholds: ['Deflation','Below 100','100-108','108-115','Inflation'],
    },
    {
      name: 'Asset Price Index', value: `${d.asset[yr].toFixed(0)}`,
      level: d.asset[yr] < 120 ? 'green' : d.asset[yr] < 150 ? 'blue' : d.asset[yr] < 200 ? 'yellow' : d.asset[yr] < 300 ? 'orange' : 'red',
      desc: 'Asset price level (base 100). Divergence from consumer prices is the collision made visible — QE inflates capital, not labour.',
      thresholds: ['<120','120-150','150-200','200-300','>300'],
    },
    {
      name: 'SPICE Return', value: `${d.spice[yr]}%`,
      level: d.spice[yr] < 10 ? 'green' : d.spice[yr] < 20 ? 'blue' : d.spice[yr] < 35 ? 'yellow' : d.spice[yr] < 50 ? 'orange' : 'red',
      desc: 'Modelled portfolio return. Rises with crisis score and asset inflation — the hedge activating as the thesis plays out.',
      thresholds: ['<10%','10-20%','20-35%','35-50%','>50%'],
    },
  ];

  return (
    <div style={S.tabContent}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {indicators.map(ind => (
          <div key={ind.name} style={S.indCard}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700 }}>{ind.name}</div>
              <div style={{ fontSize:13, fontWeight:700, padding:'2px 8px', background: LEVEL_BG[ind.level], color: LEVEL_COLOR[ind.level] }}>
                {ind.value}
              </div>
            </div>
            <div style={{ fontSize:10, color:'#555', lineHeight:1.5, marginBottom:8 }}>{ind.desc}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2 }}>
              {ind.thresholds.map((t, i) => {
                const lvls = ['green','blue','yellow','orange','red'];
                const active = ind.level === lvls[i];
                return (
                  <div key={t} style={{ fontSize:8, textAlign:'center', padding:'3px 2px', background: active ? LEVEL_BG[lvls[i]] : '#F8F8F8', color: active ? LEVEL_COLOR[lvls[i]] : '#999' }}>
                    {t}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Apocalypse Indicators tab (real-world data sources) ───────────────────

const INDICATORS = [
  {
    name: 'US 10-Year Real Yield (TIPS)',
    source: 'FRED: DFII10 — Daily, free',
    current: '~2.1%',
    desc: 'Real cost of US sovereign borrowing. Negative = financial repression. High positive = debt sustainability crisis.',
    relationship: 'As debt/GDP rises and wage income share falls, the model implies real yields must either spike (debt crisis) or go deeply negative (repression). Watch for the squeeze.',
    thresholds: ['-0.5→+2%', '+2.5% or <-0.75%', '+3% or <-1.5%', '+3.5% or <-2.5%', '+4%+ or <-3.5%'],
    currentLevel: 'blue',
  },
  {
    name: 'BTP-Bund Spread (Italy vs Germany 10yr)',
    source: 'ECB SDW / Investing.com — Daily, free',
    current: '~120bp',
    desc: "Eurozone's most sensitive sovereign stress indicator. Italy has 145% debt/GDP and limited monetary sovereignty.",
    relationship: "When the model's debt/GDP trajectory hits crisis levels, European spreads widen first — Italy is the canary. BTP-Bund >350bp historically triggers ECB emergency intervention.",
    thresholds: ['<150bp', '150-250bp', '250-350bp', '350-500bp', '500bp+'],
    currentLevel: 'green',
  },
  {
    name: 'MOVE Index (Bond Volatility)',
    source: 'ICE BofA / FRED: BAMLMOVE — Daily',
    current: '~95',
    desc: "Treasury market implied volatility. The VIX of bond markets. Spikes when sovereign debt itself is questioned.",
    relationship: "SPICE-specific volatility index. Rises when the model's debt/GDP hits critical levels and bond markets start repricing risk. Crisis events correlate with MOVE >160.",
    thresholds: ['<100', '100-130', '130-160', '160-200', '200+'],
    currentLevel: 'green',
  },
  {
    name: 'US Sovereign CDS (5-Year)',
    source: 'Markit via TradingEconomics / Bloomberg',
    current: '~38bp',
    desc: 'The price of insuring against US government default. The most direct measure of sovereign credibility.',
    relationship: "The model's debt/GDP trajectory implies CDS should widen as the fiscal gap becomes visible. US CDS >80bp would be historically unprecedented.",
    thresholds: ['<30bp', '30-50bp', '50-80bp', '80-150bp', '150bp+'],
    currentLevel: 'blue',
  },
  {
    name: 'Gold / S&P 500 Ratio',
    source: 'LBMA + any market feed — Daily, free',
    current: '~0.52 (gold oz / SP500 level)',
    desc: 'Capital rotating from productive assets into preservation assets. Sustained rising trend = structural, not cyclical stress.',
    relationship: "As the model's scissor opens (asset economy booming, labour collapsing), gold outperforms equities. Rising ratio is cross-asset confirmation of the dual-economy split.",
    thresholds: ['Flat/falling', 'Rising 3mo+', '5-yr high', '20-yr high', 'Approaching 1:1'],
    currentLevel: 'blue',
  },
  {
    name: '5Y5Y Forward Inflation Breakeven',
    source: 'FRED: T5YIFR — Daily, free',
    current: '~2.4%',
    desc: 'Where bond professionals expect inflation to be in 5-10 years. More sophisticated than spot CPI — captures structural expectations.',
    relationship: "In the deflationary scenario, this should collapse toward zero or negative. In the stagflation scenario (QE + UBI + debt), it should spike above 4%. The model's consumer price path implies which direction.",
    thresholds: ['<2.2%', '2.2-2.5%', '2.5-3%', '3-4%', '>4% sustained'],
    currentLevel: 'blue',
  },
  {
    name: 'G7 Central Bank Balance Sheets (YoY)',
    source: 'Fed FRED: WALCL + ECB + BOJ — Monthly',
    current: '~flat',
    desc: 'Rate of monetary base expansion across major economies. High growth = active money printing. The debasement indicator.',
    relationship: "The QE slider directly maps to this indicator. As the model's fiscal gap widens and UBI is funded by printing, watch for G7 balance sheet expansion to accelerate to 20%+ YoY.",
    thresholds: ['Flat to +5%', '+5-10%', '+10-20%', '+20-35%', '+35%+'],
    currentLevel: 'green',
  },
  {
    name: 'M2 Growth vs. Real GDP Gap',
    source: 'FRED: M2SL + GDPC1 — Monthly/Quarterly',
    current: '~2% gap',
    desc: 'Money creation vs. real economic output. Persistent gap = inflation-in-waiting. The debasement arithmetic made visible.',
    relationship: "The model's QE slider + falling labour GDP creates exactly this gap. Money supply rises with printing; the wage economy's real GDP contribution falls. Gap widening = debasement thesis validating.",
    thresholds: ['<2% gap', '2-4%', '4-6%', '6-10%', '10%+'],
    currentLevel: 'green',
  },
  {
    name: 'BOJ 10Y Yield / YCC Breach',
    source: 'Bank of Japan boj.or.jp — Daily, free',
    current: '~1.5%',
    desc: 'Japan is the most leveraged sovereign debt position in the world (260% debt/GDP). YCC collapse = global bond market shock.',
    relationship: "Japan represents the extreme end of the model's debt/GDP trajectory — already at 2040 levels by the model's reckoning. BOJ losing control is a leading indicator for the crisis affecting all sovereigns.",
    thresholds: ['<1.0%', '1.0-1.5%', '1.5-2.0%', '2.0-2.5%', '2.5%+ or YCC abandon'],
    currentLevel: 'blue',
  },
  {
    name: 'BTC Dominance + Stablecoin Market Cap %',
    source: 'CoinGecko API — Real-time, free',
    current: 'BTC dom ~55%, stables ~15%',
    desc: 'Capital flowing into crypto as system alternative to fiat. BTC + stablecoins rising together = crisis adoption, not speculation.',
    relationship: "The indicator unique to the SPICE thesis. As the model's wage economy collapses and government credibility deteriorates, watch for the public exercising the crypto opt-out.",
    thresholds: ['BTC <55%, stable <15%', 'BTC >55%, stable >15%', 'BTC >60%, stable >20%', 'BTC >65%, stable >25%', 'BTC >70%, stable >30%'],
    currentLevel: 'blue',
  },
];

function ApocIndicatorsTab() {
  const LEVEL_COLOR = { green:'#2E8B7A', blue:'#3388CC', yellow:'#e0c030', orange:'#E09933', red:'#CC4444' };
  const LEVEL_BG    = { green:'rgba(76,175,122,0.12)', blue:'rgba(85,153,221,0.12)', yellow:'rgba(224,192,48,0.12)', orange:'rgba(224,153,51,0.12)', red:'rgba(224,85,85,0.12)' };
  const LVLS = ['green','blue','yellow','orange','red'];

  return (
    <div style={S.tabContent}>
      <div style={{ fontSize:11, color:'#666', marginBottom:14, lineHeight:1.6, borderLeft:'3px solid #B8860B', paddingLeft:12, background:'#FFF8E1', padding:'10px 14px' }}>
        Real-world indicators to monitor alongside the model. These are the signals that confirm whether the collision thesis is playing out in live markets. Check these sources directly — no live data is fetched here.
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {INDICATORS.map(ind => (
          <div key={ind.name} style={S.indCard}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div style={{ fontSize:12, fontWeight:700, flex:1, paddingRight:8 }}>{ind.name}</div>
              <div style={{ fontSize:11, fontWeight:700, padding:'2px 8px', whiteSpace:'nowrap', background: LEVEL_BG[ind.currentLevel], color: LEVEL_COLOR[ind.currentLevel] }}>
                {ind.currentLevel.toUpperCase()}
              </div>
            </div>
            <div style={{ fontSize:9, color:'#B8860B', letterSpacing:'0.08em', marginBottom:4, fontWeight:600 }}>
              SOURCE: {ind.source}
            </div>
            <div style={{ fontSize:11, color:'#B8860B', fontWeight:700, marginBottom:6 }}>
              Current: {ind.current}
            </div>
            <div style={{ fontSize:10, color:'#555', lineHeight:1.5, marginBottom:8 }}>{ind.desc}</div>
            <div style={{ fontSize:10, color:'#333', lineHeight:1.5, borderTop:'1px solid #E0E0E0', paddingTop:6, marginBottom:8 }}>
              <span style={{ fontSize:9, color:'#B8860B', fontWeight:700, letterSpacing:'0.08em' }}>MODEL LINK → </span>
              {ind.relationship}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2 }}>
              {ind.thresholds.map((t, i) => {
                const active = ind.currentLevel === LVLS[i];
                return (
                  <div key={t} style={{ fontSize:8, textAlign:'center', padding:'3px 2px', background: active ? LEVEL_BG[LVLS[i]] : '#F8F8F8', color: active ? LEVEL_COLOR[LVLS[i]] : '#999' }}>
                    {t}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Policy Responses tab ───────────────────────────────────────────────────

function PolicyTab({ sliderParams }) {
  const policyComparison = useMemo(() => {
    const base = sliderParams;
    return [
      { name:'No Response',       color:'#c0392b', p:{...base, ubi:0,    captax:0.08, qe:0.01} },
      { name:'QE Only',           color:'#7d3c98', p:{...base, ubi:0,    captax:0.08, qe:0.15} },
      { name:'UBI (40% wage)',    color:'#2471a3', p:{...base, ubi:0.40, captax:0.08, qe:0.10} },
      { name:'Capital Tax + UBI', color:'#1e7e4e', p:{...base, ubi:0.40, captax:0.40, qe:0.05} },
    ].map(sc => ({ ...sc, data: simulate(sc.p) }));
  }, [sliderParams]);

  const compData = policyComparison[0].data.years.map((yr, i) => {
    const row = { yr: `'${String(yr).slice(2)}` };
    policyComparison.forEach(sc => { row[sc.name] = sc.data.debt[i]; });
    return row;
  });

  return (
    <div style={S.tabContent}>
      <ChartCard title="POLICY RESPONSE COMPARISON — Debt/GDP Trajectories" subtitle="Same automation scenario, four fiscal responses. None were designed for AI displacement.">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={compData}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="yr" tick={AXIS_STYLE} />
            <YAxis tick={AXIS_STYLE} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STY} />
            <ReferenceLine y={200} stroke="#CC4444" strokeDasharray="4 3" strokeWidth={1} />
            {policyComparison.map(sc => (
              <Line key={sc.name} type="monotone" dataKey={sc.name}
                stroke={sc.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:20 }}>
        {POLICIES.map(pol => (
          <div key={pol.name} style={S.policyCard}>
            <div style={S.policyName}>{pol.name}</div>
            <div style={S.policyDesc}>{pol.desc}</div>
            {pol.effects.map((ef, i) => (
              <div key={i} style={{ marginBottom:5 }}>
                <div style={{ fontSize:9, color:'#666' }}>{ef.text}</div>
                <div style={{ fontSize:10, fontWeight:700, color: ef.positive ? '#2E8B7A' : '#CC4444' }}>{ef.val}</div>
              </div>
            ))}
            <div style={{ fontSize:9, color:'#666', borderTop:'1px solid #E0E0E0', paddingTop:6, marginTop:6, fontStyle:'italic', lineHeight:1.5 }}>
              {pol.historical}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Collision() {
  const [sliderParams, setSliderParams] = useState(DEFAULT_PARAMS);
  const [activeTab,    setActiveTab]    = useState('model');
  const [selectedYear, setSelectedYear] = useState(0);
  const [activePreset, setActivePreset] = useState(null);
  const [activeRegime, setActiveRegime] = useState(null);

  const simData = useMemo(() => simulate(sliderParams), [sliderParams]);
  const setParam = (key, val) => setSliderParams(p => ({ ...p, [key]: val }));

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setActivePreset(key);
    setSliderParams(prev => ({
      ...prev,
      auto:      p.auto      / 100,
      reinstate: p.reinstate / 100,
      prod:      p.prod,
      rec:       p.rec,
      crypto:    p.crypto    / 10,
      lag:       p.lag,
    }));
  };

  const applyRegime = (key) => {
    const r = REGIMES[key];
    setActiveRegime(key);
    setSliderParams(prev => ({
      ...prev,
      def:    r.params.def    / 100,
      rate:   r.params.rate   / 100,
      ubi:    r.params.ubi    / 100,
      captax: r.params.captax / 100,
      qe:     r.params.qe     / 100,
      gini:   r.params.gini,
      domcap: r.params.domcap / 100,
      ycc:    r.ycc || false,
      ycccap: (r.ycccap || 2.0) / 100,
    }));
  };

  const yr     = selectedYear;
  const year   = simData.years[yr];
  const crisis = crisisInfo(simData.score[yr]);

  const allData = simData.years.map((y, i) => ({
    yr: `'${String(y).slice(2)}`,
    debt: simData.debt[i],         u: simData.u[i],
    welfare: simData.welfare[i],   marketYield: simData.marketYield[i],
    primaryDef: simData.primaryDeficit[i],
    inflation: simData.inflation[i], realRate: simData.realRate[i],
    gdp: simData.gdp[i],           wage: simData.wage[i],
    demand: simData.demand[i],     ls: simData.ls[i],
    capShare: simData.capShare[i], asset: simData.asset[i],
    cons: simData.cons[i],
  }));
  const data10    = allData.slice(0, 11);
  const selLabel  = `'${String(year).slice(2)}`;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.eyebrow}>SPICE [ZPC] — Macro Simulation Engine v2.0</div>
          <div style={S.title}>THE <span style={{ color:'#B8860B' }}>COLLISION</span> MODEL</div>
        </div>
        <div style={S.headerRight}>
          <div style={S.crisisLabel}>CRISIS LEVEL — {year}</div>
          <div style={{ ...S.crisisMeter, color: crisis.color }}>{crisis.label}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {[
          ['model',      'Model & Simulation'],
          ['dual',       'Dual Economy'],
          ['indicators', 'Model Variables'],
          ['apoc',       'Apocalypse Indicators'],
          ['policy',     'Policy Responses'],
        ].map(([key, label]) => (
          <button
            key={key}
            style={{ ...S.tab, ...(activeTab === key ? S.tabActive : {}) }}
            onClick={() => setActiveTab(key)}
          >{label}</button>
        ))}
      </div>

      {/* Body */}
      <div style={S.body}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <div style={S.sideInner}>

            <div style={S.sideSection}>
              <div style={S.sideTitle}>Automation Scenarios</div>
              <div style={S.presetGrid}>
                {Object.entries(PRESETS).map(([key]) => (
                  <button
                    key={key}
                    style={{ ...S.presetBtn, ...(activePreset === key ? S.presetActive : {}) }}
                    onClick={() => applyPreset(key)}
                  >{key.charAt(0).toUpperCase() + key.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={S.sideSection}>
              <div style={S.sideTitle}>Policy Regime</div>
              {Object.entries(REGIMES).map(([key, r]) => (
                <button
                  key={key}
                  style={{ ...S.regimeBtn, ...(activeRegime === key ? S.regimeActive : {}) }}
                  onClick={() => applyRegime(key)}
                >
                  <span style={S.regimeName}>{r.label}</span>
                </button>
              ))}
            </div>

            <div style={S.sideSection}>
              <div style={S.sideTitle}>Yield Curve Control</div>
              <div style={{ display:'flex', gap:6, marginBottom: sliderParams.ycc ? 10 : 0 }}>
                <button style={{ ...S.yccBtn, ...(sliderParams.ycc  ? S.yccActive : {}) }} onClick={() => setParam('ycc', true)}>ON</button>
                <button style={{ ...S.yccBtn, ...(!sliderParams.ycc ? S.yccActive : {}) }} onClick={() => setParam('ycc', false)}>OFF</button>
              </div>
              {sliderParams.ycc && (
                <SliderRow def={YCC_SLIDER} value={sliderParams.ycccap} onChange={v => setParam('ycccap', v)} />
              )}
            </div>

            {SLIDER_SECTIONS.map(sec => (
              <div key={sec.title} style={S.sideSection}>
                <div style={S.sideTitle}>{sec.title}</div>
                {sec.sliders.map(def => (
                  <SliderRow key={def.key} def={def} value={sliderParams[def.key]} onChange={v => setParam(def.key, v)} />
                ))}
              </div>
            ))}

            <div style={S.sideSection}>
              <div style={S.sideTitle}>View Year</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input
                  type="range" min={0} max={15} step={1} value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  style={{ ...S.range, flex:1 }}
                />
                <span style={S.yearDisplay}>{year}</span>
              </div>
            </div>

          </div>
        </aside>

        {/* Content */}
        <div style={S.content}>
          {/* KPI strip */}
          <div style={S.kpiStrip}>
            {[
              { label:'Debt/GDP',     val:`${simData.debt[yr]}%`,        danger: simData.debt[yr] > 110 },
              { label:'Bond Yield',   val:`${simData.marketYield[yr]}%`, danger: simData.marketYield[yr] > 7.5 },
              { label:'Unemployment', val:`${simData.u[yr]}%`,           danger: simData.u[yr] > 10 },
              { label:'Wage Share',   val:`${simData.ls[yr]}%`,          danger: simData.ls[yr] < 55 },
              { label:'Crisis Score', val:`${simData.score[yr]}/100`,    accent: true, danger: simData.score[yr] >= 35 },
              { label:'SPICE Return', val:`${simData.spice[yr]}%`,       accent: true },
            ].map(k => (
              <div key={k.label} style={S.kpi}>
                <span style={S.kpiLabel}>{k.label}</span>
                <span style={{ ...S.kpiValue, color: k.accent ? '#B8860B' : k.danger ? '#CC4444' : '#000' }}>
                  {k.val}
                </span>
              </div>
            ))}
          </div>

          {activeTab === 'model' && (
            <ModelTab simData={simData} data10={data10} allData={allData}
              selLabel={selLabel} yr={yr} year={year} crisis={crisis} />
          )}
          {activeTab === 'dual'       && <DualTab       simData={simData} allData={allData} yr={yr} />}
          {activeTab === 'indicators' && <IndicatorsTab simData={simData} yr={yr} />}
          {activeTab === 'apoc'       && <ApocIndicatorsTab />}
          {activeTab === 'policy'     && <PolicyTab     sliderParams={sliderParams} />}
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const S = {
  page: {
    fontFamily:"'IBM Plex Mono','Courier New',monospace",
    background:'#FFF', color:'#000',
    height:'calc(100vh - 56px)', display:'flex', flexDirection:'column', overflow:'hidden',
  },
  header: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'10px 24px 9px', borderBottom:'2px solid #E0E0E0',
    background:'#FFF', flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
  },
  eyebrow:    { fontSize:9, letterSpacing:'0.2em', color:'#B8860B', marginBottom:2, fontWeight:600 },
  title:      { fontSize:22, fontWeight:700, letterSpacing:'0.04em', lineHeight:1 },
  headerRight:{ textAlign:'right' },
  crisisLabel:{ fontSize:9, color:'#666', letterSpacing:'0.14em', marginBottom:3, textTransform:'uppercase' },
  crisisMeter:{ fontSize:18, fontWeight:700, letterSpacing:'0.04em', transition:'color 0.4s' },

  tabBar: { display:'flex', borderBottom:'2px solid #E0E0E0', background:'#F8F8F8', flexShrink:0 },
  tab: {
    padding:'10px 20px', background:'none', border:'none', cursor:'pointer',
    fontSize:10, letterSpacing:'0.12em', color:'#666', textTransform:'uppercase',
    borderBottom:'3px solid transparent', marginBottom:-2, fontFamily:'inherit', fontWeight:600,
  },
  tabActive: { color:'#B8860B', borderBottomColor:'#B8860B', background:'#FFF' },

  body:    { display:'flex', flex:1, overflow:'hidden', minHeight:0 },
  sidebar: { width:272, background:'#FFF', borderRight:'1px solid #E0E0E0', overflowY:'auto', flexShrink:0 },
  sideInner:   { padding:'12px 12px 20px' },
  sideSection: { marginBottom:16 },
  sideTitle:   { fontSize:9, letterSpacing:'0.18em', color:'#B8860B', textTransform:'uppercase', fontWeight:600, marginBottom:7, paddingBottom:4, borderBottom:'1px solid #E0E0E0' },

  presetGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 },
  presetBtn: {
    padding:'6px 4px', border:'1px solid #E0E0E0', background:'#F8F8F8',
    color:'#444', fontSize:9, letterSpacing:'0.05em', cursor:'pointer',
    borderRadius:2, fontFamily:'inherit', textAlign:'center',
  },
  presetActive: { borderColor:'#B8860B', color:'#B8860B', background:'#FFF8E1', fontWeight:700 },

  regimeBtn: {
    width:'100%', padding:'6px 8px', border:'1px solid #E0E0E0', background:'#F8F8F8',
    borderRadius:2, cursor:'pointer', textAlign:'left', marginBottom:4,
    display:'flex', flexDirection:'column', fontFamily:'inherit',
  },
  regimeActive: { borderColor:'#B8860B', background:'#FFF8E1', borderLeft:'3px solid #B8860B' },
  regimeName:   { fontSize:10, fontWeight:600, color:'#333' },

  yccBtn: {
    padding:'5px 14px', border:'1px solid #E0E0E0', background:'#F8F8F8',
    fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', borderRadius:2,
  },
  yccActive: { borderColor:'#7B68EE', background:'rgba(123,104,238,0.1)', color:'#7B68EE' },

  range: { width:'100%', appearance:'none', WebkitAppearance:'none', height:3, background:'#E0E0E0', borderRadius:2, outline:'none', cursor:'pointer' },
  yearDisplay: { fontSize:18, fontWeight:700, color:'#B8860B', letterSpacing:'0.04em', minWidth:40, textAlign:'right' },

  content:  { flex:1, overflowY:'auto', display:'flex', flexDirection:'column', minWidth:0 },
  kpiStrip: { display:'flex', gap:1, background:'#F8F8F8', border:'2px solid #E0E0E0', margin:'14px 16px 0', flexShrink:0 },
  kpi:      { flex:1, display:'flex', flexDirection:'column', gap:3, padding:'12px 14px', borderRight:'1px solid #E0E0E0' },
  kpiLabel: { fontSize:8, color:'#666', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600 },
  kpiValue: { fontSize:16, fontWeight:700 },

  tabContent: { padding:'14px 16px 24px', flex:1 },

  narrative: {
    background:'#FFF8E1', border:'1px solid #D4A017', borderLeft:'4px solid #B8860B',
    padding:'14px 18px', marginBottom:12, borderRadius:'0 3px 3px 0',
  },

  eventsRow: { display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 },
  eventChip: { display:'flex', alignItems:'center', padding:'5px 10px', border:'1px solid', borderRadius:2 },

  chartsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  chartCard:  { background:'#FFF', border:'1px solid #E0E0E0', padding:'12px 14px', borderRadius:3, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  chartTitle: { fontSize:9, color:'#333', letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:600, marginBottom:2 },
  chartSub:   { fontSize:9, color:'#888', marginBottom:10, lineHeight:1.4 },

  econCard: { background:'#FFF', border:'1px solid #E0E0E0', padding:'16px', borderRadius:3 },

  indCard: { background:'#FFF', border:'1px solid #E0E0E0', padding:'14px', borderRadius:3, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' },

  policyCard: { background:'#FFF', border:'1px solid #E0E0E0', padding:'14px', borderRadius:3 },
  policyName: { fontSize:12, fontWeight:700, marginBottom:4 },
  policyDesc: { fontSize:10, color:'#555', lineHeight:1.5, marginBottom:10 },
};
