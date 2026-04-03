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
  ext:     "#f97316",
};

function mk(col) { return `url(#hah-${col.replace("#","")})` }

function SystemDiagram() {
  const W = 640, H = 360;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display:"block" }}>
      <defs>
        {[SC.s, SC.v, SC.mcc, SC.citizen, SC.company, SC.ext].map(col => (
          <marker key={col} id={`hah-${col.replace("#","")}`}
            markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={col} />
          </marker>
        ))}
      </defs>

      {/* Colony boundary */}
      <rect x={4} y={4} width={490} height={H-8} rx={5}
        fill="rgba(42,58,92,0.15)" stroke="#2a3a5c" strokeWidth={1.5} strokeDasharray="6 4"/>
      <text x={16} y={20} fontSize={7} fill={T3} fontFamily={F} letterSpacing="0.2em">COLONY — internal economy</text>

      {/* External zone */}
      <rect x={504} y={4} width={132} height={H-8} rx={5}
        fill="rgba(249,115,22,0.04)" stroke={SC.ext} strokeWidth={1} strokeDasharray="4 4"/>
      <text x={516} y={20} fontSize={7} fill={SC.ext} fontFamily={F} letterSpacing="0.15em">EXTERNAL</text>

      {/* External assets */}
      {[["BTC","#f97316",52],["ETH","#8b9cf6",156],["SOL","#9966ff",260]].map(([l,c,y]) => (
        <g key={l}>
          <rect x={518} y={y} width={104} height={44} rx={3} fill={`${c}10`} stroke={c} strokeWidth={1}/>
          <text x={570} y={y+18} textAnchor="middle" fontSize={13} fill={c} fontFamily={F} fontWeight="700">{l}</text>
          <text x={570} y={y+32} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>settlement</text>
        </g>
      ))}

      {/* Colony ↔ External */}
      <line x1={494} y1={160} x2={518} y2={160} stroke={SC.ext} strokeWidth={1.2} strokeDasharray="3 2" markerEnd={mk(SC.ext)}/>
      <line x1={518} y1={175} x2={494} y2={175} stroke={SC.ext} strokeWidth={1.2} strokeDasharray="3 2" markerEnd={mk(SC.ext)}/>

      {/* Citizens */}
      {[18, 108].map((x, i) => (
        <g key={i}>
          <rect x={x} y={36} width={78} height={52} rx={3} fill={`${SC.citizen}14`} stroke={SC.citizen} strokeWidth={1.2}/>
          <text x={x+39} y={54} textAnchor="middle" fontSize={12} fill={SC.citizen} fontFamily={F}>◉</text>
          <text x={x+39} y={68} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F}>CITIZEN</text>
          <text x={x+39} y={79} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>colony member</text>
        </g>
      ))}

      {/* Company */}
      <rect x={352} y={36} width={126} height={52} rx={3} fill={`${SC.company}14`} stroke={SC.company} strokeWidth={1.2}/>
      <text x={415} y={54} textAnchor="middle" fontSize={12} fill={SC.company} fontFamily={F}>⬡</text>
      <text x={415} y={68} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F}>COMPANY</text>
      <text x={415} y={79} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>enterprise</text>

      {/* MCC */}
      <rect x={158} y={200} width={186} height={60} rx={3} fill={`${SC.mcc}14`} stroke={SC.mcc} strokeWidth={1.5}/>
      <text x={251} y={220} textAnchor="middle" fontSize={11} fill={SC.mcc} fontFamily={F}>▣</text>
      <text x={251} y={236} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">MCC TREASURY</text>
      <text x={251} y={250} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>issues S · backs V · colony authority</text>

      {/* S Token */}
      <circle cx={82} cy={188} r={22} fill={`${SC.s}18`} stroke={SC.s} strokeWidth={1.5}/>
      <text x={82} y={185} textAnchor="middle" fontSize={10} fontWeight={700} fill={SC.s} fontFamily={F}>S</text>
      <text x={82} y={197} textAnchor="middle" fontSize={6} fill={SC.s} fontFamily={F}>SPICE</text>
      <text x={82} y={218} textAnchor="middle" fontSize={6.5} fill={SC.s} fontFamily={F}>everyday currency</text>

      {/* V Token */}
      <circle cx={415} cy={188} r={22} fill={`${SC.v}18`} stroke={SC.v} strokeWidth={1.5}/>
      <text x={415} y={185} textAnchor="middle" fontSize={10} fontWeight={700} fill={SC.v} fontFamily={F}>V</text>
      <text x={415} y={197} textAnchor="middle" fontSize={6} fill={SC.v} fontFamily={F}>VAULT</text>
      <text x={415} y={218} textAnchor="middle" fontSize={6.5} fill={SC.v} fontFamily={F}>savings · yield</text>

      {/* MCC → Citizens: issue S */}
      <line x1={188} y1={214} x2={106} y2={200} stroke={SC.s} strokeWidth={1.2} markerEnd={mk(SC.s)}/>
      <text x={142} y={201} textAnchor="middle" fontSize={6.5} fill={SC.s} fontFamily={F}>issue S (UBI)</text>

      {/* Citizens → MCC: S tax */}
      <line x1={96} y1={210} x2={172} y2={224} stroke={SC.s} strokeWidth={1} strokeDasharray="3 3" markerEnd={mk(SC.s)}/>
      <text x={126} y={225} textAnchor="middle" fontSize={6.5} fill={T2} fontFamily={F}>S tax</text>

      {/* Citizens spend S → Company */}
      <line x1={196} y1={60} x2={352} y2={60} stroke={SC.s} strokeWidth={1.4} markerEnd={mk(SC.s)}/>
      <text x={274} y={53} textAnchor="middle" fontSize={6.5} fill={SC.s} fontFamily={F}>spend S · goods · services</text>

      {/* Company → MCC: S tax */}
      <line x1={390} y1={88} x2={318} y2={204} stroke={SC.s} strokeWidth={1} strokeDasharray="3 3" markerEnd={mk(SC.s)}/>
      <text x={368} y={158} textAnchor="middle" fontSize={6.5} fill={T2} fontFamily={F}>S tax</text>

      {/* MCC → V: backs */}
      <line x1={344} y1={222} x2={437} y2={206} stroke={SC.v} strokeWidth={1.2} markerEnd={mk(SC.v)}/>
      <text x={398} y={210} textAnchor="middle" fontSize={6.5} fill={T2} fontFamily={F}>backs</text>

      {/* V → Company: yield */}
      <line x1={415} y1={166} x2={415} y2={88} stroke={SC.v} strokeWidth={1.2} markerEnd={mk(SC.v)}/>
      <text x={430} y={130} textAnchor="middle" fontSize={6.5} fill={SC.v} fontFamily={F}>yield</text>

      {/* Citizens save → V */}
      <path d="M 108 72 Q 260 110 393 178" fill="none" stroke={SC.v} strokeWidth={1} strokeDasharray="3 3" markerEnd={mk(SC.v)}/>
      <text x={250} y={118} textAnchor="middle" fontSize={6.5} fill={SC.v} fontFamily={F}>hold V (savings)</text>

      {/* S = ZPC label */}
      <rect x={90} y={290} width={310} height={30} rx={3}
        fill="rgba(239,68,68,0.06)" stroke={`${SC.s}40`} strokeWidth={0.8}/>
      <text x={245} y={302} textAnchor="middle" fontSize={7.5} fontWeight={700} fill={SC.s} fontFamily={F} letterSpacing="0.08em">S TOKEN = SPICE COIN (ZPC)</text>
      <text x={245} y={314} textAnchor="middle" fontSize={6.5} fill={T2} fontFamily={F}>colony unit of account · issued by MCC · not backed by fiat</text>
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
      gridTemplateColumns: "1fr 1.6fr 1fr",
      gridTemplateRows: "1fr 1fr",
      gap: 1,
    }}>

      {/* ── TOP LEFT: Collision ── */}
      <div style={{ gridColumn:1, gridRow:1 }}>
      <Panel to="/collision" color={levelColor} eyebrow="The Collision — Precursor" title={`Alert: ${levelLabel}`}>
        <CollisionLogo color={levelColor} />
        <div style={{ marginTop:"auto" }}>
          <Stat label="Debt / GDP"      value={`${C.debt}%`}   color="#ef4444" />
          <Stat label="AI Penetration"  value={`${C.ai}%`}     color="#8b5cf6" />
          <Stat label="Crypto Flight"   value={`${C.crypto}%`} color={levelColor} />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ Run the simulation</div>
      </Panel>
      </div>

      {/* ── CENTRE: SPICE System (spans both rows) ── */}
      <div style={{
        gridColumn: 2, gridRow: "1 / 3", background: BG1,
        borderLeft:`1px solid ${BD}`, borderRight:`1px solid ${BD}`,
        display:"flex", flexDirection:"column",
        padding:"16px 12px 12px",
      }}>
        <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:4 }}>
          Post-Collision Economy
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:GOLD, letterSpacing:"0.06em", marginBottom:4 }}>
          SPICE Colony Economic System
        </div>
        <div style={{ fontSize:9, color:T2, lineHeight:1.6, marginBottom:10 }}>
          After fiat breakdown, communities self-organise into colonies.
          S-token (ZPC) is the everyday currency. V-token is savings.
          External trade settles in BTC · ETH · SOL.
        </div>
        <div style={{ flex:1, minHeight:0 }}>
          <SystemDiagram />
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginTop:8, paddingTop:8,
          borderTop:`1px solid ${BD}` }}>
          {[
            { color:"#ef4444", label:"S (SPICE coin)" },
            { color:GOLD,      label:"V (savings)" },
            { color:"#4488ff", label:"MCC" },
            { color:"#3dffa0", label:"Citizen" },
            { color:"#9966ff", label:"Company" },
            { color:"#f97316", label:"BTC/ETH/SOL" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:color }} />
              <span style={{ fontSize:7.5, color:T2 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOP RIGHT: Mars Colony Economy ── */}
      <div style={{ gridColumn:3, gridRow:1 }}>
      <Panel to="/mars" color="#3dffa0" eyebrow="Mars Colony Economy" title="Mars Colony Economy">
        <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>
          The SPICE economic model running at colony scale — 200 simulated years.
          S and V tokens govern citizens, companies and the MCC treasury.
        </div>
        <div style={{ marginTop:"auto" }}>
          <Stat label="Simulation Years" value="200"       color="#3dffa0" />
          <Stat label="Economic Model"   value="ZPC/SPICE" color="#3dffa0" />
          <Stat label="Token Types"      value="S + V"     color={GOLD} />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ View colony dashboard</div>
      </Panel>
      </div>

      {/* ── BOTTOM LEFT: Earth Colony Economy ── */}
      <div style={{ gridColumn:1, gridRow:2 }}>
      <Panel to="/earth" color="#4488ff" eyebrow="Earth Colony Economy" title="Earth Colony Economy">
        <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>
          Real-world deployment of the SPICE model within national economies
          under fiscal stress, AI displacement and crypto capital flight.
        </div>
        <div style={{ marginTop:"auto" }}>
          <Stat label="Ergon Threshold" value="≥ 30%"     color="#4488ff" />
          <Stat label="Fiscal Policy"   value="Robot UBI" color="#3dffa0" />
          <Stat label="Monetary Policy" value="QE"        color="#eab308" />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ Read the deployment model</div>
      </Panel>
      </div>

      {/* ── BOTTOM RIGHT: Coin ── */}
      <div style={{ gridColumn:3, gridRow:2 }}>
      <Panel to="/coin" color={GOLD} eyebrow="ZPC Token" title="COIN">
        <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>
          The live ZPC protocol on Base Sepolia testnet.
          Connect a wallet to interact with the SPICE vault.
        </div>
        <div style={{ marginTop:"auto" }}>
          <Stat label="Network" value="Base Sepolia" color={GOLD} />
          <Stat label="Phase"   value="Testnet"      color={T3} />
          <Stat label="Token"   value="ZPC"          color={GOLD} />
        </div>
        <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ Connect wallet</div>
      </Panel>
      </div>

    </div>
  );
}
