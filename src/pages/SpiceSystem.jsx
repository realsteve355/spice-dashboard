// SpiceSystem.jsx — SPICE Protocol Economic System Diagram
// Shows: S tokens (minted/burned), V tokens (persistent), MCC treasury,
//        fiscal citizens (individuals), companies (institutional actors)

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
  s:       "#ef4444",   // S token — red (volatile, transient)
  v:       "#c8a96e",   // V token — gold (persistent value)
  mcc:     "#4488ff",   // MCC treasury — blue
  citizen: "#3dffa0",   // Fiscal citizen — green
  company: "#9966ff",   // Company / institution — purple
  arrow:   "#2a3a5c",   // Default arrow
};

// ── Small reusable elements ───────────────────────────────────────────────────

function Box({ x, y, w, h, color, label, sub, icon }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={`${color}14`} stroke={color} strokeWidth={1.2} />
      {icon && (
        <text x={x + w / 2} y={y + 18} textAnchor="middle"
          fontSize={14} fill={color} fontFamily={F}>{icon}</text>
      )}
      <text x={x + w / 2} y={icon ? y + 34 : y + h / 2 - (sub ? 6 : 0)}
        textAnchor="middle" fontSize={9} fontWeight={700}
        fill={T1} fontFamily={F} letterSpacing="0.12em">{label}</text>
      {sub && (
        <text x={x + w / 2} y={icon ? y + 46 : y + h / 2 + 10}
          textAnchor="middle" fontSize={7.5} fill={T3}
          fontFamily={F}>{sub}</text>
      )}
    </g>
  );
}

function Token({ cx, cy, color, label, size = 26 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={size} fill={`${color}18`}
        stroke={color} strokeWidth={1.5} />
      <text x={cx} y={cy + 4} textAnchor="middle"
        fontSize={12} fontWeight={700} fill={color} fontFamily={F}>{label}</text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = C.arrow, label, dashed }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len, ny = dy / len;
  const ax = x2 - nx * 9, ay = y2 - ny * 9;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ax} y2={ay}
        stroke={color} strokeWidth={1.2}
        strokeDasharray={dashed ? "4 3" : undefined} />
      <polygon
        points={`${x2},${y2} ${ax - ny * 4},${ay + nx * 4} ${ax + ny * 4},${ay - nx * 4}`}
        fill={color} />
      {label && (
        <text x={mx} y={my - 5} textAnchor="middle"
          fontSize={7.5} fill={T2} fontFamily={F}>{label}</text>
      )}
    </g>
  );
}

function LegendItem({ color, label, sub }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:12 }}>
      <div style={{ width:10, height:10, borderRadius:"50%",
        background:color, flexShrink:0, marginTop:2 }} />
      <div>
        <div style={{ fontSize:10, color:T1, fontFamily:F, letterSpacing:"0.06em" }}>{label}</div>
        {sub && <div style={{ fontSize:8.5, color:T2, fontFamily:F, marginTop:2, lineHeight:1.5 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Main diagram ──────────────────────────────────────────────────────────────

const W = 720, H = 420;

export default function SpiceSystem() {
  return (
    <div style={{ background:BG0, minHeight:"100vh",
      fontFamily:F, padding:"40px 24px 80px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>

        {/* Title */}
        <div style={{ fontSize:9, color:T3, letterSpacing:"0.3em",
          textTransform:"uppercase", marginBottom:8 }}>
          Protocol Mechanics
        </div>
        <h1 style={{ margin:"0 0 6px", fontSize:22, fontWeight:700,
          color:T1, letterSpacing:"0.04em" }}>
          SPICE Economic System
        </h1>
        <p style={{ margin:"0 0 32px", fontSize:12, color:T2, lineHeight:1.7 }}>
          How value flows between fiscal citizens, companies, the MCC treasury,
          and the two token types that form the protocol's core mechanism.
        </p>

        {/* SVG diagram */}
        <div style={{ background:BG1, border:`1px solid ${BD}`,
          borderRadius:4, padding:"24px 16px", marginBottom:32 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto"
            style={{ overflow:"visible", display:"block" }}>
            <defs>
              {[C.s, C.v, C.mcc, C.citizen, C.company, C.arrow, "#dc2626"].map(col => (
                <marker key={col}
                  id={`ah-${col.replace("#","")}`}
                  markerWidth={6} markerHeight={6}
                  refX={5} refY={3} orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill={col} />
                </marker>
              ))}
            </defs>

            {/* ── Background zones ── */}
            <rect x={8} y={8} width={196} height={H - 16} rx={4}
              fill="rgba(61,255,160,0.03)" stroke={C.citizen} strokeWidth={0.5} strokeDasharray="4 4" />
            <text x={20} y={24} fontSize={7.5} fill={C.citizen} fontFamily={F}
              letterSpacing="0.2em">FISCAL ZONE</text>

            <rect x={232} y={8} width={256} height={H - 16} rx={4}
              fill="rgba(68,136,255,0.03)" stroke={C.mcc} strokeWidth={0.5} strokeDasharray="4 4" />
            <text x={244} y={24} fontSize={7.5} fill={C.mcc} fontFamily={F}
              letterSpacing="0.2em">PROTOCOL ZONE</text>

            <rect x={508} y={8} width={204} height={H - 16} rx={4}
              fill="rgba(153,102,255,0.03)" stroke={C.company} strokeWidth={0.5} strokeDasharray="4 4" />
            <text x={520} y={24} fontSize={7.5} fill={C.company} fontFamily={F}
              letterSpacing="0.2em">MARKET ZONE</text>

            {/* ── Fiscal Citizens ── */}
            <Box x={20} y={50} w={82} h={60} color={C.citizen}
              icon="◉" label="CITIZEN" sub="individual" />
            <Box x={114} y={50} w={82} h={60} color={C.citizen}
              icon="◉" label="CITIZEN" sub="individual" />

            {/* Citizens → MCC (tax / mint premium) */}
            <Arrow x1={80} y1={92} x2={280} y2={130} color={C.citizen} label="ZPC tax" />
            <Arrow x1={156} y1={92} x2={300} y2={130} color={C.citizen} />

            {/* ── MCC Treasury ── */}
            <Box x={244} y={140} w={192} h={68} color={C.mcc}
              icon="▣" label="MCC TREASURY" sub="Monetary Control Committee" />

            {/* ── S Token ── */}
            <Token cx={108} cy={260} color={C.s} label="S" />
            <text x={108} y={296} textAnchor="middle" fontSize={8}
              fill={C.s} fontFamily={F}>TRANSIENT</text>
            <text x={108} y={307} textAnchor="middle" fontSize={7}
              fill={T3} fontFamily={F}>minted / burned</text>

            {/* MCC mints S */}
            <Arrow x1={252} y1={192} x2={138} y2={248} color={C.s} label="mints" />

            {/* S burned → MCC */}
            <path d="M 82 268 Q 60 320 60 360 Q 60 390 200 382 Q 270 376 270 340 Q 270 310 268 290"
              fill="none" stroke={C.s} strokeWidth={1.2} strokeDasharray="4 3"
              markerEnd={`url(#ah-${C.s.replace("#","")})`} />
            <text x={95} y={375} textAnchor="middle" fontSize={7.5}
              fill={C.s} fontFamily={F}>burned / redeemed</text>

            {/* Citizens hold S */}
            <Arrow x1={108} y1={110} x2={108} y2={234} color={C.s} label="hold S" />

            {/* ── V Token ── */}
            <Token cx={360} cy={278} color={C.v} label="V" />
            <text x={360} y={314} textAnchor="middle" fontSize={8}
              fill={C.v} fontFamily={F}>PERSISTENT</text>
            <text x={360} y={325} textAnchor="middle" fontSize={7}
              fill={T3} fontFamily={F}>accrues yield</text>

            {/* MCC backs V */}
            <Arrow x1={360} y1={208} x2={360} y2={252} color={C.v} label="backs" />

            {/* ── Company ── */}
            <Box x={520} y={50} w={176} h={64} color={C.company}
              icon="⬡" label="COMPANY" sub="ZPC participant" />

            {/* Company stakes ZPC → MCC */}
            <Arrow x1={520} y1={108} x2={436} y2={168} color={C.mcc} label="stake ZPC" dashed />

            {/* MCC → Company (V yield) */}
            <Arrow x1={436} y1={158} x2={520} y2={95} color={C.v} label="V yield" />

            {/* Company holds V */}
            <Arrow x1={608} y1={114} x2={408} y2={265} color={C.v} label="hold V" />

            {/* ── Crisis box ── */}
            <rect x={20} y={334} width={176} height={58} rx={3}
              fill="rgba(220,38,38,0.08)" stroke="#dc2626" strokeWidth={0.8} strokeDasharray="3 3" />
            <text x={108} y={354} textAnchor="middle" fontSize={8}
              fontWeight={700} fill="#dc2626" fontFamily={F} letterSpacing="0.1em">
              ◈ COLLISION EVENT
            </text>
            <text x={108} y={368} textAnchor="middle" fontSize={7.5}
              fill={T2} fontFamily={F}>debt spiral · AI displacement</text>
            <text x={108} y={380} textAnchor="middle" fontSize={7.5}
              fill={T2} fontFamily={F}>triggers S demand spike</text>

            {/* Crisis → S demand */}
            <Arrow x1={140} y1={334} x2={122} y2={300} color="#dc2626" label="↑ S demand" />

            {/* Crisis → V safe haven */}
            <Arrow x1={184} y1={356} x2={328} y2={300} color={C.v} label="↑ V safe-haven" />

          </svg>
        </div>

        {/* Legend + Notes */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

          <div style={{ background:BG2, border:`1px solid ${BD}`,
            borderRadius:3, padding:"20px 20px" }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em",
              textTransform:"uppercase", marginBottom:16,
              borderBottom:`1px solid #141c2e`, paddingBottom:8 }}>
              Legend
            </div>
            <LegendItem color={C.s} label="S Token (SPICE)"
              sub="Minted when crisis stress rises, burned on redemption. Fungible, liquid, volatile." />
            <LegendItem color={C.v} label="V Token (Vault)"
              sub="Persistent yield-bearing position. Long-term stake; accrues yield from ZPC tax flows." />
            <LegendItem color={C.mcc} label="MCC Treasury"
              sub="Monetary Control Committee. Issues tokens, manages reserves, distributes yield." />
            <LegendItem color={C.citizen} label="Fiscal Citizen"
              sub="Individual participant. Pays ZPC tax, holds S tokens, receives V yield distributions." />
            <LegendItem color={C.company} label="Company / Institution"
              sub="Institutional actor. Stakes ZPC, holds V tokens, receives yield from MCC." />
          </div>

          <div style={{ background:BG2, border:`1px solid ${BD}`,
            borderRadius:3, padding:"20px 20px" }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em",
              textTransform:"uppercase", marginBottom:16,
              borderBottom:`1px solid #141c2e`, paddingBottom:8 }}>
              Key Mechanics
            </div>
            {[
              { head:"S Token lifecycle",
                body:"Minted by the MCC in response to SPICE-level stress indicators. Circulates among citizens as a crisis hedge. Burned (and redeemed for underlying value) when the crisis resolves or the holder exits." },
              { head:"V Token persistence",
                body:"Represents a long-duration stake in the protocol treasury. Accrues yield from ZPC taxes and MCC operations. Cannot be freely burned — designed to persist through the full crisis cycle." },
              { head:"MCC role",
                body:"The Monetary Control Committee manages minting, yield distribution, and reserves. Its mandate: preserve purchasing power through the fiat debt spiral. Analogous to a central bank for the protocol economy." },
              { head:"Collision response",
                body:"When SPICE indicators reach COLLISION threshold, S token demand spikes as citizens seek the crisis hedge. V token becomes the primary store of value for institutional participants." },
            ].map(({ head, body }) => (
              <div key={head} style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, fontWeight:700, color:GOLD,
                  letterSpacing:"0.08em", marginBottom:4 }}>{head}</div>
                <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
