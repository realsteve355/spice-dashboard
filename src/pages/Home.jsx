import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SPICE_PARAMS, LEVEL_COLORS, LEVEL_LABELS } from "../data/spice-params";

const F    = "'IBM Plex Mono', monospace";
const BG0  = "#0a0e1a";
const BG1  = "#080c16";
const BG2  = "#0f1520";
const BD   = "#1e2a42";
const T1   = "#e8eaf0";
const T2   = "#8899bb";
const T3   = "#4a5878";
const GOLD = "#c8a96e";

const { current: C, meta: M } = SPICE_PARAMS;

// ─── Crisis timeline ─────────────────────────────────────────────────────────

const TL = [
  { color:"#16a34a", year:"2026" },
  { color:"#3b82f6", year:"2027" },
  { color:"#ca8a04", year:"2028" },
  { color:"#ea580c", year:"2029" },
  { color:"#c2410c", year:"2030" },
  { color:"#dc2626", year:"2031" },
  { color:"#991b1b", year:"2032" },
];

// level 0-4 → index in TL (which segment "today" sits on)
const LEVEL_TO_TL = [0, 1, 2, 3, 5];

function CrisisTimeline({ level, levelColor }) {
  const tlIdx = LEVEL_TO_TL[level] ?? 0;
  const todayPct = ((tlIdx + 0.5) / TL.length) * 100;

  return (
    <div style={{ position:"relative", marginBottom:18, paddingBottom:18 }}>
      {/* label */}
      <div style={{ fontSize:7, color:T3, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:5 }}>
        Collision Status Today
      </div>
      {/* colour bar */}
      <div style={{ display:"flex", height:8, borderRadius:2, overflow:"hidden" }}>
        {TL.map(s => <div key={s.year} style={{ flex:1, background:s.color }} />)}
      </div>
      {/* year labels */}
      <div style={{ display:"flex" }}>
        {TL.map(s => (
          <div key={s.year} style={{ flex:1, fontSize:6, color:T3, fontFamily:F, textAlign:"center", marginTop:2 }}>
            {s.year}
          </div>
        ))}
      </div>
      {/* today marker — positioned at current SPICE level */}
      <div style={{
        position:"absolute", bottom:4,
        left:`${todayPct}%`, transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:2,
      }}>
        <div style={{
          width:10, height:10, borderRadius:"50%",
          background:"#fff", border:`2px solid ${levelColor}`,
        }} />
        <div style={{ fontSize:6.5, color:levelColor, fontFamily:F, fontWeight:700, whiteSpace:"nowrap" }}>
          today
        </div>
      </div>
      {/* crisis window label */}
      <div style={{
        position:"absolute", bottom:4, right:0,
        fontSize:6, color:"#dc2626", fontFamily:F, letterSpacing:"0.08em",
      }}>⚠ 2029–2032</div>
    </div>
  );
}

// ─── Collision logo ───────────────────────────────────────────────────────────

function CollisionLogo({ color, label }) {
  return (
    <svg viewBox="0 0 420 232" width="100%" style={{ display:"block", maxHeight:155 }}>
      <path d="M 53 30 A 52 34 0 0 1 53 98" fill="none" stroke={color} strokeWidth="1.5" />
      <text x="53" y="52" textAnchor="middle" fontSize="8" fill={T3} fontFamily={F} letterSpacing="1">DEBT/GDP</text>
      <text x="53" y="80" textAnchor="middle" fontSize="20" fontWeight="700" fill="#dc2626" fontFamily={F}>{C.debt}%</text>
      <line x1="105" y1="64" x2="178" y2="64" stroke={T3} strokeWidth="2" />
      <circle cx="210" cy="64" r="32" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.25" />
      <text x="210" y="58" textAnchor="middle" fontSize="7" fill={color} fontFamily={F} letterSpacing="1" fontWeight="700">SPICE</text>
      <text x="210" y="72" textAnchor="middle" fontSize="9" fill={color} fontFamily={F} fontWeight="700">{label}</text>
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

// ─── Image panel (Mars / Earth) ───────────────────────────────────────────────

// textAlign: "top" puts label in outer corner for panels where bottom is near the circle (Mars)
function ImagePanel({ to, src, eyebrow, title, color, textPos = "bottom" }) {
  const atTop = textPos === "top";
  return (
    <Link to={to} style={{ display:"block", height:"100%", textDecoration:"none", position:"relative", overflow:"hidden", borderRadius:6 }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:color, zIndex:3 }} />
      <img src={src} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
      {/* vignette overlays from all edges — softens image into dark background */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:[
          "linear-gradient(to right,  rgba(8,12,22,0.55) 0%, transparent 30%)",
          "linear-gradient(to left,   rgba(8,12,22,0.55) 0%, transparent 30%)",
          "linear-gradient(to bottom, rgba(8,12,22,0.55) 0%, transparent 30%)",
          "linear-gradient(to top,    rgba(8,12,22,0.55) 0%, transparent 30%)",
        ].join(", "),
      }} />
      {/* text overlay — positioned at outer corner away from circle */}
      <div style={{
        position:"absolute", inset:0,
        background: atTop
          ? "linear-gradient(to bottom, rgba(8,12,22,0.85) 0%, transparent 50%)"
          : "linear-gradient(to top,    rgba(8,12,22,0.85) 0%, transparent 50%)",
        display:"flex", flexDirection:"column",
        justifyContent: atTop ? "flex-start" : "flex-end",
        padding:"16px 18px",
      }}>
        <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:4 }}>
          {eyebrow}
        </div>
        <div style={{ fontSize:14, fontWeight:700, color, letterSpacing:"0.06em" }}>{title}</div>
        <div style={{ fontSize:8, color:T3, marginTop:6 }}>→ View colony</div>
      </div>
    </Link>
  );
}


// ─── Main ─────────────────────────────────────────────────────────────────────

const CIRCLE_D = 162; // diameter of centre circle

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
      position:"relative",
      background: BG0, color: T1, fontFamily: F,
      height: "calc(100vh - 57px)", overflow: "hidden",
    }}>

      {/* ── 2×2 grid — 8px gap for breathing space ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 8,
        padding: 8,
        boxSizing: "border-box",
        height: "100%",
      }}>

        {/* TOP LEFT: The Collision */}
        <Link to="/collision" style={{ display:"block", height:"100%", textDecoration:"none", borderRadius:6, overflow:"hidden" }}>
          <div style={{
            height:"100%", background:BG2, borderRadius:6,
            borderTop:`3px solid ${levelColor}`, padding:"20px 22px",
            display:"flex", flexDirection:"column", boxSizing:"border-box",
          }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:4 }}>
              The Collision — Precursor
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:levelColor, letterSpacing:"0.06em", marginBottom:14 }}>
              Alert: {levelLabel}
            </div>
            <CrisisTimeline level={level} levelColor={levelColor} />
            <div style={{ flex:1, minHeight:0, overflow:"visible" }}>
              <CollisionLogo color={levelColor} label={levelLabel} />
            </div>
          </div>
        </Link>

        {/* TOP RIGHT: Mars Colony */}
        <ImagePanel
          to="/mars"
          src="/MarsColonyWithoutLabels.png"
          eyebrow="Mars Colony Economy"
          title="Mars Colony"
          color="#3dffa0"
          textPos="top"
        />

        {/* BOTTOM LEFT: Earth Colony */}
        <ImagePanel
          to="/earth"
          src="/spice-town.png"
          eyebrow="Earth Colony Economy"
          title="Earth Colony"
          color="#4488ff"
        />

        {/* BOTTOM RIGHT: Coin */}
        <Link to="/coin" style={{ display:"block", height:"100%", textDecoration:"none", borderRadius:6, overflow:"hidden" }}>
          <div style={{
            height:"100%", background:BG2, borderRadius:6,
            borderTop:`3px solid ${GOLD}`, padding:"20px 22px",
            display:"flex", flexDirection:"column", boxSizing:"border-box",
          }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:4 }}>
              ZPC Token System
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:GOLD, letterSpacing:"0.06em", marginBottom:14 }}>
              COIN
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flex:1 }}>
              {[
                { sym:"S", name:"Spice",  color:"#ef4444", sub:"everyday currency" },
                { sym:"V", name:"Value",  color:GOLD,      sub:"permanent savings" },
                { sym:"A", name:"Asset",  color:"#3dffa0", sub:"colony property"   },
                { sym:"◈", name:"Vote",   color:"#4488ff", sub:"governance share"  },
              ].map(t => (
                <div key={t.name} style={{
                  background:`${t.color}0e`,
                  border:`1px solid ${t.color}40`,
                  borderRadius:4, padding:"10px 6px",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                }}>
                  <div style={{ fontSize:22, fontWeight:700, color:t.color, fontFamily:F, lineHeight:1 }}>{t.sym}</div>
                  <div style={{ fontSize:8, fontWeight:700, color:T1, letterSpacing:"0.1em" }}>{t.name.toUpperCase()}</div>
                  <div style={{ fontSize:6.5, color:T3, textAlign:"center" }}>{t.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:9, color:T2, marginTop:10, lineHeight:1.5 }}>
              Token framework — in development
            </div>
            <div style={{ fontSize:8, color:T3, marginTop:4 }}>→ Connect wallet</div>
          </div>
        </Link>

      </div>

      {/* ── SPICE circle — overlaid at grid intersection (64) ── */}
      <Link to="/spice-system" style={{
        position:"absolute",
        top:"50%", left:"50%",
        transform:"translate(-50%, -50%)",
        textDecoration:"none",
        zIndex:10,
      }}>
        <div style={{
          width:CIRCLE_D, height:CIRCLE_D, borderRadius:"50%",
          border:`2px solid ${GOLD}`,
          background:`linear-gradient(145deg, #13100a 0%, ${BG1} 60%)`,
          boxShadow:`0 0 0 4px ${BG0}, 0 0 30px rgba(200,169,110,0.22)`,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}>
          <div style={{ fontSize:32, color:GOLD, lineHeight:1 }}>◈</div>
          <div style={{ fontSize:10, fontWeight:700, color:T1, letterSpacing:"0.18em", marginTop:8 }}>SPICE</div>
          <div style={{ fontSize:7.5, color:T2, letterSpacing:"0.1em", marginTop:3 }}>ECONOMIC</div>
          <div style={{ fontSize:7.5, color:T2, letterSpacing:"0.1em" }}>SYSTEM</div>
        </div>
      </Link>

    </div>
  );
}
