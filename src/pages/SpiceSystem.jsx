// SpiceSystem.jsx — SPICE Colony Economic System
// Post-collapse communities organise as colonies using S/V tokens internally,
// BTC/ETH/SOL externally. The Collision is the precursor — this is what comes after.

const F    = "'IBM Plex Mono', monospace";
const BG0  = "#0a0e1a";
const BG1  = "#080c16";
const BG2  = "#0f1520";
const BD   = "#1e2a42";
const T1   = "#e8eaf0";
const T2   = "#8899bb";
const T3   = "#4a5878";
const GOLD = "#c8a96e";

const C = {
  s:       "#ef4444",   // S token (SPICE coin) — everyday currency
  v:       "#c8a96e",   // V token — long-term savings / yield
  mcc:     "#4488ff",   // MCC — colony monetary authority
  citizen: "#3dffa0",   // Fiscal citizen
  company: "#9966ff",   // Company / enterprise
  ext:     "#f97316",   // External settlement (BTC/ETH/SOL)
  colony:  "#2a3a5c",   // Colony boundary
};

function mk(col) { return `url(#ah-${col.replace("#","")})` }

function LegendItem({ color, label, sub }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:12 }}>
      <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0, marginTop:2 }} />
      <div>
        <div style={{ fontSize:10, color:T1, fontFamily:F, letterSpacing:"0.06em" }}>{label}</div>
        {sub && <div style={{ fontSize:8.5, color:T2, fontFamily:F, marginTop:2, lineHeight:1.5 }}>{sub}</div>}
      </div>
    </div>
  );
}

const W = 760, H = 460;

export default function SpiceSystem() {
  return (
    <div style={{ background:BG0, minHeight:"100vh", fontFamily:F, padding:"40px 24px 80px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>

        <div style={{ fontSize:9, color:T3, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:8 }}>
          Post-Collision Economy
        </div>
        <h1 style={{ margin:"0 0 6px", fontSize:22, fontWeight:700, color:T1, letterSpacing:"0.04em" }}>
          The SPICE Colony Economic System
        </h1>
        <p style={{ margin:"0 0 32px", fontSize:12, color:T2, lineHeight:1.7, maxWidth:700 }}>
          After the Collision — fiat breakdown, AI unemployment, civil reorganisation —
          communities form self-governing colonies. Each colony runs the SPICE system internally.
          The S-token is the colony's everyday currency. V-tokens are long-term savings.
          External trade with other colonies settles in BTC, ETH, or SOL.
        </p>

        <div style={{ background:BG1, border:`1px solid ${BD}`, borderRadius:4, padding:"24px 16px", marginBottom:32 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" style={{ display:"block", overflow:"visible" }}>
            <defs>
              {[C.s, C.v, C.mcc, C.citizen, C.company, C.ext, C.colony, "#dc2626"].map(col => (
                <marker key={col} id={`ah-${col.replace("#","")}`}
                  markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill={col} />
                </marker>
              ))}
              <marker id="ah-both-s" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={C.s} />
              </marker>
            </defs>

            {/* ── Colony boundary ── */}
            <rect x={8} y={8} width={560} height={H-16} rx={6}
              fill="rgba(42,58,92,0.15)" stroke={C.colony} strokeWidth={1.5} strokeDasharray="6 4"/>
            <text x={24} y={28} fontSize={8} fill={T3} fontFamily={F} letterSpacing="0.22em">COLONY</text>
            <text x={24} y={40} fontSize={7} fill={T3} fontFamily={F}>self-governing · post-collapse community</text>

            {/* ── External settlement zone ── */}
            <rect x={588} y={8} width={164} height={H-16} rx={6}
              fill="rgba(249,115,22,0.04)" stroke={C.ext} strokeWidth={1} strokeDasharray="4 4"/>
            <text x={604} y={28} fontSize={8} fill={C.ext} fontFamily={F} letterSpacing="0.18em">EXTERNAL</text>
            <text x={604} y={40} fontSize={7} fill={T3} fontFamily={F}>inter-colony settlement</text>

            {/* External assets */}
            {[
              { label:"BTC",  y:90,  color:"#f97316" },
              { label:"ETH",  y:180, color:"#8b9cf6" },
              { label:"SOL",  y:270, color:"#9966ff" },
            ].map(a => (
              <g key={a.label}>
                <rect x={608} y={a.y} width={124} height={52} rx={3}
                  fill={`${a.color}10`} stroke={a.color} strokeWidth={1}/>
                <text x={670} y={a.y+22} textAnchor="middle" fontSize={16} fill={a.color} fontFamily={F} fontWeight="700">{a.label}</text>
                <text x={670} y={a.y+38} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>settlement asset</text>
              </g>
            ))}

            {/* Colony ↔ External arrow */}
            <line x1={568} y1={200} x2={608} y2={200}
              stroke={C.ext} strokeWidth={1.2} strokeDasharray="3 3"
              markerEnd={mk(C.ext)}/>
            <line x1={608} y1={216} x2={568} y2={216}
              stroke={C.ext} strokeWidth={1.2} strokeDasharray="3 3"
              markerEnd={mk(C.ext)}/>
            <text x={588} y={196} textAnchor="middle" fontSize={6.5} fill={C.ext} fontFamily={F}>trade out</text>
            <text x={588} y={228} textAnchor="middle" fontSize={6.5} fill={C.ext} fontFamily={F}>import in</text>

            {/* ── Citizens (inside colony) ── */}
            {[30, 128].map((x, i) => (
              <g key={i}>
                <rect x={x} y={60} width={88} height={60} rx={3}
                  fill={`${C.citizen}14`} stroke={C.citizen} strokeWidth={1.2}/>
                <text x={x+44} y={80} textAnchor="middle" fontSize={13} fill={C.citizen} fontFamily={F}>◉</text>
                <text x={x+44} y={96} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">CITIZEN</text>
                <text x={x+44} y={108} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>colony member</text>
              </g>
            ))}

            {/* ── Company ── */}
            <rect x={390} y={60} width={148} height={60} rx={3}
              fill={`${C.company}14`} stroke={C.company} strokeWidth={1.2}/>
            <text x={464} y={80} textAnchor="middle" fontSize={13} fill={C.company} fontFamily={F}>⬡</text>
            <text x={464} y={96} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">COMPANY</text>
            <text x={464} y={108} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>colony enterprise</text>

            {/* ── MCC Treasury ── */}
            <rect x={180} y={230} width={220} height={72} rx={3}
              fill={`${C.mcc}14`} stroke={C.mcc} strokeWidth={1.5}/>
            <text x={290} y={254} textAnchor="middle" fontSize={13} fill={C.mcc} fontFamily={F}>▣</text>
            <text x={290} y={272} textAnchor="middle" fontSize={9} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">MCC TREASURY</text>
            <text x={290} y={285} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>Monetary Control Committee</text>
            <text x={290} y={296} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>issues S · backs V · colony monetary authority</text>

            {/* ── S Token ── */}
            <circle cx={144} cy={210} r={26} fill={`${C.s}18`} stroke={C.s} strokeWidth={1.5}/>
            <text x={144} y={207} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.s} fontFamily={F}>S</text>
            <text x={144} y={219} textAnchor="middle" fontSize={6.5} fill={C.s} fontFamily={F}>SPICE</text>
            <text x={144} y={245} textAnchor="middle" fontSize={7} fill={C.s} fontFamily={F}>everyday currency</text>
            <text x={144} y={255} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>colony-internal</text>

            {/* ── V Token ── */}
            <circle cx={430} cy={210} r={26} fill={`${C.v}18`} stroke={C.v} strokeWidth={1.5}/>
            <text x={430} y={207} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.v} fontFamily={F}>V</text>
            <text x={430} y={219} textAnchor="middle" fontSize={6.5} fill={C.v} fontFamily={F}>VAULT</text>
            <text x={430} y={245} textAnchor="middle" fontSize={7} fill={C.v} fontFamily={F}>long-term savings</text>
            <text x={430} y={255} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>accrues yield</text>

            {/* MCC → Citizens: issue S (UBI / basic income) */}
            <line x1={220} y1={244} x2={118} y2={220} stroke={C.s} strokeWidth={1.2} markerEnd={mk(C.s)}/>
            <text x={160} y={226} textAnchor="middle" fontSize={7} fill={C.s} fontFamily={F}>issue S</text>
            <text x={152} y={236} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>(UBI)</text>

            {/* Citizens → MCC: S tax */}
            <line x1={100} y1={240} x2={194} y2={252} stroke={C.s} strokeWidth={1.2} strokeDasharray="4 3" markerEnd={mk(C.s)}/>
            <text x={136} y={258} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>S tax</text>

            {/* Citizens spend S → Companies */}
            <line x1={230} y1={80} x2={390} y2={80} stroke={C.s} strokeWidth={1.4} markerEnd={mk(C.s)}/>
            <text x={310} y={72} textAnchor="middle" fontSize={7} fill={C.s} fontFamily={F}>spend S (goods · services)</text>

            {/* Companies → MCC: S tax */}
            <line x1={430} y1={120} x2={370} y2={234} stroke={C.s} strokeWidth={1.2} strokeDasharray="4 3" markerEnd={mk(C.s)}/>
            <text x={420} y={190} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>S tax</text>

            {/* MCC → V: backs */}
            <line x1={400} y1={244} x2={456} y2={236} stroke={C.v} strokeWidth={1.2} markerEnd={mk(C.v)}/>
            <text x={436} y={234} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>backs</text>

            {/* V → Company/Citizen: yield */}
            <line x1={430} y1={184} x2={430} y2={120} stroke={C.v} strokeWidth={1.2} markerEnd={mk(C.v)}/>
            <text x={446} y={155} textAnchor="middle" fontSize={7} fill={C.v} fontFamily={F}>yield</text>

            {/* Citizens hold V (savings) */}
            <path d="M 118 90 Q 290 130 404 192"
              fill="none" stroke={C.v} strokeWidth={1} strokeDasharray="3 3" markerEnd={mk(C.v)}/>
            <text x={265} y={124} textAnchor="middle" fontSize={7} fill={C.v} fontFamily={F}>hold V (savings)</text>

            {/* ── S token note at bottom of colony ── */}
            <rect x={100} y={358} width={380} height={36} rx={3}
              fill="rgba(239,68,68,0.06)" stroke={`${C.s}50`} strokeWidth={0.8}/>
            <text x={290} y={372} textAnchor="middle" fontSize={8} fontWeight={700} fill={C.s} fontFamily={F} letterSpacing="0.08em">
              S TOKEN = SPICE COIN (ZPC)
            </text>
            <text x={290} y={385} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>
              The colony's unit of account · issued by MCC · not backed by fiat
            </text>

          </svg>
        </div>

        {/* Legend + Key Mechanics */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

          <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:3, padding:"20px" }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase",
              marginBottom:16, borderBottom:`1px solid #141c2e`, paddingBottom:8 }}>Legend</div>
            <LegendItem color={C.s}       label="S Token — SPICE Coin (ZPC)"
              sub="The colony's everyday currency. Issued by the MCC. Used for all internal transactions, wages, and basic income." />
            <LegendItem color={C.v}       label="V Token — Vault"
              sub="Long-term savings instrument. Accrues yield from colony economic activity. Not freely spent — held as a store of value." />
            <LegendItem color={C.mcc}     label="MCC — Monetary Control Committee"
              sub="The colony's monetary authority. Issues S tokens, backs V tokens, distributes yield, manages reserve." />
            <LegendItem color={C.citizen} label="Fiscal Citizen"
              sub="Colony member. Receives S as basic income (UBI), spends S on goods and services, may hold V as savings." />
            <LegendItem color={C.company} label="Company / Enterprise"
              sub="Colony-internal business. Pays and receives S, holds V, pays S tax to MCC." />
            <LegendItem color={C.ext}     label="BTC · ETH · SOL"
              sub="External settlement layer. Used for inter-colony trade, imports, and exports. Not part of the internal SPICE system." />
          </div>

          <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:3, padding:"20px" }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase",
              marginBottom:16, borderBottom:`1px solid #141c2e`, paddingBottom:8 }}>Key Mechanics</div>
            {[
              { head:"Why colonies?",
                body:"After the Collision — fiat breakdown, AI-driven unemployment, civil reorganisation — existing economic institutions fail. Communities self-organise into colonies with shared governance and a shared currency. The SPICE system is designed for this environment." },
              { head:"S token — the everyday currency",
                body:"The MCC issues S tokens as the colony's unit of account. Citizens receive a basic income in S (funded by robot/AI tax revenues). Companies pay wages in S and accept S for goods and services. S tax flows back to the MCC." },
              { head:"V token — long-term savings",
                body:"The MCC also issues V tokens as a savings vehicle. V accrues yield from colony economic activity and S tax receipts. Citizens and companies hold V as a store of value across the crisis cycle." },
              { head:"External settlement",
                body:"Colonies are not autarkic. Inter-colony trade and external imports are settled in neutral assets — BTC, ETH, or SOL. The colony MCC manages the exchange between internal S and external assets." },
            ].map(({ head, body }) => (
              <div key={head} style={{ marginBottom:16 }}>
                <div style={{ fontSize:9, fontWeight:700, color:GOLD, letterSpacing:"0.08em", marginBottom:4 }}>{head}</div>
                <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>{body}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
