import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SPICE_PARAMS, LEVEL_COLORS, LEVEL_LABELS } from "../data/spice-params";

const F   = "'IBM Plex Mono', monospace";
const BG0 = "#0a0e1a";
const BG1 = "#080c16";
const BG2 = "#0f1520";
const BD  = "#1e2a42";
const T1  = "#e8eaf0";
const T2  = "#8899bb";
const T3  = "#4a5878";
const GOLD = "#c8a96e";

const { current: C, meta: M } = SPICE_PARAMS;

// ─── Collision logo ───────────────────────────────────────────────────────────

function CollisionLogo({ color }) {
  return (
    <svg viewBox="0 0 420 232" width="100%" style={{ display:"block", maxHeight:180 }}>
      <path d="M 53 30 A 52 34 0 0 1 53 98" fill="none" stroke={color} strokeWidth="1.5" />
      <text x="53" y="52" textAnchor="middle" fontSize="8" fill={T3} fontFamily={F} letterSpacing="1">DEBT/GDP</text>
      <text x="53" y="80" textAnchor="middle" fontSize="20" fontWeight="700" fill="#dc2626" fontFamily={F}>{C.debt}%</text>
      <line x1="105" y1="64" x2="178" y2="64" stroke={T3} strokeWidth="2" />
      <circle cx="210" cy="64" r="32" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.25" />
      <text x="210" y="58" textAnchor="middle" fontSize="7" fill={color} fontFamily={F} letterSpacing="1" fontWeight="700">SPICE</text>
      <text x="210" y="72" textAnchor="middle" fontSize="9" fill={color} fontFamily={F} fontWeight="700">{LEVEL_LABELS[M.currentLevel]}</text>
      <line x1="242" y1="64" x2="315" y2="64" stroke={T3} strokeWidth="2" />
      <path d="M 367 30 A 52 34 0 0 0 367 98" fill="none" stroke={color} strokeWidth="1.5" />
      <text x="367" y="52" textAnchor="middle" fontSize="8" fill={T3} fontFamily={F} letterSpacing="1">AI PENETRATION</text>
      <text x="367" y="80" textAnchor="middle" fontSize="20" fontWeight="700" fill="#8b5cf6" fontFamily={F}>{C.ai}%</text>
      <line x1="210" y1="96" x2="210" y2="170" stroke={T3} strokeWidth="2" />
      <path d="M 142 198 A 68 28 0 0 0 278 198" fill="none" stroke={color} strokeWidth="1.5" />
      <text x="210" y="188" textAnchor="middle" fontSize="8" fill={T3} fontFamily={F} letterSpacing="1">CRYPTO FLIGHT</text>
      <text x="210" y="214" textAnchor="middle" fontSize="20" fontWeight="700" fill={color} fontFamily={F}>{C.crypto}%</text>
    </svg>
  );
}

// ─── SPICE System SVG (inline, no page wrapper) ───────────────────────────────

const SC = {
  s:       "#ef4444",
  v:       "#c8a96e",
  mcc:     "#4488ff",
  citizen: "#3dffa0",
  company: "#9966ff",
  arrow:   "#2a3a5c",
};

function mk(col) { return `url(#ah-${col.replace("#","")})` }

function SystemDiagram() {
  const W = 720, H = 380;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ display:"block" }}>
      <defs>
        {[SC.s, SC.v, SC.mcc, SC.citizen, SC.company, SC.arrow, "#dc2626"].map(col => (
          <marker key={col} id={`ah-${col.replace("#","")}`}
            markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={col} />
          </marker>
        ))}
      </defs>

      {/* Zones */}
      <rect x={8} y={8} width={190} height={H-16} rx={4}
        fill="rgba(61,255,160,0.03)" stroke={SC.citizen} strokeWidth={0.5} strokeDasharray="4 4"/>
      <text x={20} y={24} fontSize={7} fill={SC.citizen} fontFamily={F} letterSpacing="0.2em">FISCAL ZONE</text>

      <rect x={224} y={8} width={272} height={H-16} rx={4}
        fill="rgba(68,136,255,0.03)" stroke={SC.mcc} strokeWidth={0.5} strokeDasharray="4 4"/>
      <text x={236} y={24} fontSize={7} fill={SC.mcc} fontFamily={F} letterSpacing="0.2em">PROTOCOL ZONE</text>

      <rect x={512} y={8} width={200} height={H-16} rx={4}
        fill="rgba(153,102,255,0.03)" stroke={SC.company} strokeWidth={0.5} strokeDasharray="4 4"/>
      <text x={524} y={24} fontSize={7} fill={SC.company} fontFamily={F} letterSpacing="0.2em">MARKET ZONE</text>

      {/* Citizens */}
      {[20, 106].map((x, i) => (
        <g key={i}>
          <rect x={x} y={44} width={78} height={56} rx={3}
            fill={`${SC.citizen}14`} stroke={SC.citizen} strokeWidth={1.2}/>
          <text x={x+39} y={62} textAnchor="middle" fontSize={12} fill={SC.citizen} fontFamily={F}>◉</text>
          <text x={x+39} y={78} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">CITIZEN</text>
          <text x={x+39} y={90} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>individual</text>
        </g>
      ))}

      {/* Citizens → MCC */}
      <line x1={74} y1={86} x2={266} y2={128} stroke={SC.citizen} strokeWidth={1.2}
        markerEnd={mk(SC.citizen)}/>
      <text x={165} y={98} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>ZPC tax</text>
      <line x1={152} y1={86} x2={284} y2={128} stroke={SC.citizen} strokeWidth={1.2}
        markerEnd={mk(SC.citizen)}/>

      {/* MCC */}
      <rect x={240} y={134} width={200} height={64} rx={3}
        fill={`${SC.mcc}14`} stroke={SC.mcc} strokeWidth={1.2}/>
      <text x={340} y={156} textAnchor="middle" fontSize={12} fill={SC.mcc} fontFamily={F}>▣</text>
      <text x={340} y={172} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">MCC TREASURY</text>
      <text x={340} y={184} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>Monetary Control Committee</text>

      {/* S Token */}
      <circle cx={100} cy={258} r={24} fill={`${SC.s}18`} stroke={SC.s} strokeWidth={1.5}/>
      <text x={100} y={262} textAnchor="middle" fontSize={11} fontWeight={700} fill={SC.s} fontFamily={F}>S</text>
      <text x={100} y={292} textAnchor="middle" fontSize={7} fill={SC.s} fontFamily={F}>TRANSIENT</text>
      <text x={100} y={302} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>minted / burned</text>

      {/* MCC → S */}
      <line x1={248} y1={184} x2={126} y2={244} stroke={SC.s} strokeWidth={1.2}
        markerEnd={mk(SC.s)}/>
      <text x={182} y={207} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>mints</text>

      {/* S burned → MCC */}
      <path d="M 76 264 Q 52 316 52 348 Q 52 372 190 366 Q 258 360 256 332 Q 254 308 252 296"
        fill="none" stroke={SC.s} strokeWidth={1.2} strokeDasharray="4 3"
        markerEnd={mk(SC.s)}/>
      <text x={88} y={362} textAnchor="middle" fontSize={7} fill={SC.s} fontFamily={F}>burned</text>

      {/* Citizens → S */}
      <line x1={100} y1={100} x2={100} y2={234} stroke={SC.s} strokeWidth={1.2}
        markerEnd={mk(SC.s)}/>
      <text x={82} y={168} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>hold S</text>

      {/* V Token */}
      <circle cx={340} cy={268} r={24} fill={`${SC.v}18`} stroke={SC.v} strokeWidth={1.5}/>
      <text x={340} y={272} textAnchor="middle" fontSize={11} fontWeight={700} fill={SC.v} fontFamily={F}>V</text>
      <text x={340} y={302} textAnchor="middle" fontSize={7} fill={SC.v} fontFamily={F}>PERSISTENT</text>
      <text x={340} y={312} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>accrues yield</text>

      {/* MCC → V */}
      <line x1={340} y1={198} x2={340} y2={244} stroke={SC.v} strokeWidth={1.2}
        markerEnd={mk(SC.v)}/>
      <text x={356} y={224} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>backs</text>

      {/* Company */}
      <rect x={524} y={44} width={172} height={60} rx={3}
        fill={`${SC.company}14`} stroke={SC.company} strokeWidth={1.2}/>
      <text x={610} y={64} textAnchor="middle" fontSize={12} fill={SC.company} fontFamily={F}>⬡</text>
      <text x={610} y={80} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">COMPANY</text>
      <text x={610} y={92} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>ZPC participant</text>

      {/* Company → MCC (stake) */}
      <line x1={524} y1={104} x2={440} y2={162} stroke={SC.mcc} strokeWidth={1.2} strokeDasharray="4 3"
        markerEnd={mk(SC.mcc)}/>
      <text x={494} y={126} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>stake ZPC</text>

      {/* MCC → Company (yield) */}
      <line x1={440} y1={152} x2={524} y2={90} stroke={SC.v} strokeWidth={1.2}
        markerEnd={mk(SC.v)}/>
      <text x={494} y={112} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>V yield</text>

      {/* Company → V */}
      <line x1={610} y1={104} x2={368} y2={254} stroke={SC.v} strokeWidth={1.2}
        markerEnd={mk(SC.v)}/>
      <text x={506} y={164} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>hold V</text>

      {/* Crisis */}
      <rect x={20} y={318} width={168} height={54} rx={3}
        fill="rgba(220,38,38,0.08)" stroke="#dc2626" strokeWidth={0.8} strokeDasharray="3 3"/>
      <text x={104} y={338} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#dc2626" fontFamily={F} letterSpacing="0.1em">◈ COLLISION EVENT</text>
      <text x={104} y={352} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>debt spiral · AI displacement</text>
      <text x={104} y={363} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>triggers S demand spike</text>

      {/* Crisis → S */}
      <line x1={132} y1={318} x2={114} y2={294} stroke="#dc2626" strokeWidth={1.2}
        markerEnd={mk("#dc2626")}/>
      {/* Crisis → V */}
      <line x1={178} y1={340} x2={314} y2={296} stroke={SC.v} strokeWidth={1.2}
        markerEnd={mk(SC.v)}/>
      <text x={252} y={308} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>↑ V safe-haven</text>
    </svg>
  );
}

// ─── Panel card ───────────────────────────────────────────────────────────────

function Panel({ to, color, title, eyebrow, children, style = {} }) {
  return (
    <Link to={to} style={{ textDecoration:"none", display:"block", height:"100%" }}>
      <div style={{
        height:"100%", background:BG2, border:`1px solid ${BD}`,
        borderTop:`3px solid ${color}`, padding:"16px 18px",
        display:"flex", flexDirection:"column", gap:10,
        transition:"border-color 0.2s, background 0.2s", cursor:"pointer",
        boxSizing:"border-box", ...style,
      }}>
        <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase" }}>{eyebrow}</div>
        <div style={{ fontSize:14, fontWeight:700, color, letterSpacing:"0.06em" }}>{title}</div>
        {children}
      </div>
    </Link>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
      borderBottom:`1px solid ${BD}`, paddingBottom:6 }}>
      <span style={{ fontSize:8, color:T3, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</span>
      <span style={{ fontSize:15, fontWeight:700, color: color || T1, fontFamily:F }}>{value}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [cachedLevel, setCachedLevel] = useState(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("spice_level_cache"));
      if (s && Date.now() - s.timestamp < 24 * 60 * 60 * 1000) setCachedLevel(s.level);
    } catch {}
  }, []);

  const level      = cachedLevel ?? M.currentLevel;
  const levelColor = LEVEL_COLORS[level];
  const levelLabel = LEVEL_LABELS[level];

  return (
    <div style={{
      background: BG0, color: T1, fontFamily: F,
      height: "calc(100vh - 57px)", overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "280px 1fr 280px",
      gridTemplateRows: "1fr 1fr",
      gap: 1,
    }}>

      {/* ── TOP LEFT: Collision ── */}
      <Panel to="/collision" color={levelColor} eyebrow="The Collision" title={`Alert: ${levelLabel}`}>
        <CollisionLogo color={levelColor} />
        <div style={{ marginTop:"auto" }}>
          <Stat label="Debt / GDP"      value={`${C.debt}%`}   color="#ef4444" />
          <Stat label="AI Penetration"  value={`${C.ai}%`}     color="#8b5cf6" />
          <Stat label="Crypto Flight"   value={`${C.crypto}%`} color={levelColor} />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ Run the simulation</div>
      </Panel>

      {/* ── CENTRE: SPICE System (spans both rows) ── */}
      <div style={{
        gridRow: "1 / 3", background: BG1,
        borderLeft:`1px solid ${BD}`, borderRight:`1px solid ${BD}`,
        display:"flex", flexDirection:"column",
        padding:"16px 12px 12px",
      }}>
        <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:4 }}>
          Protocol Mechanics
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:GOLD, letterSpacing:"0.06em", marginBottom:12 }}>
          SPICE Economic System
        </div>
        <div style={{ flex:1, minHeight:0 }}>
          <SystemDiagram />
        </div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:8, paddingTop:8,
          borderTop:`1px solid ${BD}` }}>
          {[
            { color:"#ef4444", label:"S Token — transient" },
            { color:GOLD,      label:"V Token — persistent" },
            { color:"#4488ff", label:"MCC Treasury" },
            { color:"#3dffa0", label:"Fiscal Citizen" },
            { color:"#9966ff", label:"Company" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:color }} />
              <span style={{ fontSize:7.5, color:T2 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOP RIGHT: Mars ── */}
      <Panel to="/mars" color="#3dffa0" eyebrow="Mars Colony" title="Mars Economy">
        <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>
          A simulation of the SPICE economic model operating at colony scale.
          S and V tokens govern a population of fiscal citizens across 200 simulated years.
        </div>
        <div style={{ marginTop:"auto" }}>
          <Stat label="Simulation Years"   value="200"      color="#3dffa0" />
          <Stat label="Economic Model"     value="ZPC/SPICE" color="#3dffa0" />
          <Stat label="Token Types"        value="S + V"    color={GOLD} />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ View colony dashboard</div>
      </Panel>

      {/* ── BOTTOM LEFT: Earth ── */}
      <Panel to="/earth" color="#4488ff" eyebrow="Earth Economy" title="ZPC on Earth">
        <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>
          The real-world deployment thesis. How S and V tokens function
          within national economies under fiscal stress and AI displacement.
        </div>
        <div style={{ marginTop:"auto" }}>
          <Stat label="Ergon Threshold"  value="≥ 30%"     color="#4488ff" />
          <Stat label="Fiscal Response"  value="Robot UBI" color="#3dffa0" />
          <Stat label="Monetary Policy"  value="QE"        color="#eab308" />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ Read the deployment model</div>
      </Panel>

      {/* ── BOTTOM RIGHT: Coin ── */}
      <Panel to="/coin" color={GOLD} eyebrow="ZPC Token" title="SPICE Coin">
        <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>
          The live protocol on Base Sepolia testnet. Connect a wallet to
          interact with the SPICE vault and track on-chain positions.
        </div>
        <div style={{ marginTop:"auto" }}>
          <Stat label="Network"     value="Base Sepolia" color={GOLD} />
          <Stat label="Phase"       value="Testnet"      color="#4a5878" />
          <Stat label="Token"       value="ZPC"          color={GOLD} />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ Connect wallet</div>
      </Panel>

    </div>
  );
}
