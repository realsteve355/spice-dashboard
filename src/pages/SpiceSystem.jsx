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
  s:       "#ef4444",   // S token — everyday currency, expires monthly
  v:       "#c8a96e",   // V token — permanent savings
  fisc:    "#4488ff",   // The Fisc — automated constitutional utility
  mcc:     "#3dffa0",   // MCC — infrastructure company
  citizen: "#9966ff",   // Citizen
  company: "#f97316",   // Company
  ext:     "#38bdf8",   // External settlement (BTC/ETH/SOL)
  colony:  "#1e3a5f",   // Colony boundary
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

const W = 780, H = 500;

export default function SpiceSystem() {
  return (
    <div style={{ background:BG0, minHeight:"100vh", fontFamily:F, padding:"40px 24px 80px" }}>
      <div style={{ maxWidth:980, margin:"0 auto" }}>

        <div style={{ fontSize:9, color:T3, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:8 }}>
          Post-Collision Economy
        </div>
        <h1 style={{ margin:"0 0 6px", fontSize:22, fontWeight:700, color:T1, letterSpacing:"0.04em" }}>
          The SPICE Colony Economic System
        </h1>
        <p style={{ margin:"0 0 32px", fontSize:12, color:T2, lineHeight:1.7, maxWidth:740 }}>
          After the Collision — fiat breakdown, AI unemployment, civil reorganisation —
          communities form self-governing colonies. The Fisc issues 1,000 S-tokens to every
          citizen monthly as Universal Basic Income. S-tokens expire at month end — an
          automatic anti-inflation mechanism. Up to 20% may be converted to permanent V-tokens.
          External trade settles in BTC, ETH, or SOL.
        </p>

        <div style={{ background:BG1, border:`1px solid ${BD}`, borderRadius:4, padding:"24px 16px", marginBottom:32 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" style={{ display:"block", overflow:"visible" }}>
            <defs>
              {[C.s, C.v, C.fisc, C.mcc, C.citizen, C.company, C.ext, "#dc2626", "#6ee7b7"].map(col => (
                <marker key={col} id={`ah-${col.replace("#","")}`}
                  markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill={col} />
                </marker>
              ))}
            </defs>

            {/* ── Colony boundary ── */}
            <rect x={8} y={8} width={580} height={H-16} rx={6}
              fill="rgba(30,58,95,0.12)" stroke={C.colony} strokeWidth={1.5} strokeDasharray="6 4"/>
            <text x={24} y={28} fontSize={8} fill={T3} fontFamily={F} letterSpacing="0.22em">COLONY</text>
            <text x={24} y={40} fontSize={7} fill={T3} fontFamily={F}>self-governing · post-collapse community</text>

            {/* ── External settlement zone ── */}
            <rect x={608} y={8} width={164} height={H-16} rx={6}
              fill="rgba(56,189,248,0.04)" stroke={C.ext} strokeWidth={1} strokeDasharray="4 4"/>
            <text x={624} y={28} fontSize={8} fill={C.ext} fontFamily={F} letterSpacing="0.18em">EXTERNAL</text>
            <text x={624} y={40} fontSize={7} fill={T3} fontFamily={F}>inter-colony settlement</text>

            {/* External assets */}
            {[
              { label:"BTC",  y:80,  color:"#f97316" },
              { label:"ETH",  y:185, color:"#8b9cf6" },
              { label:"SOL",  y:290, color:"#9966ff" },
            ].map(a => (
              <g key={a.label}>
                <rect x={624} y={a.y} width={132} height={52} rx={3}
                  fill={`${a.color}10`} stroke={a.color} strokeWidth={1}/>
                <text x={690} y={a.y+22} textAnchor="middle" fontSize={16} fill={a.color} fontFamily={F} fontWeight="700">{a.label}</text>
                <text x={690} y={a.y+38} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>settlement asset</text>
              </g>
            ))}

            {/* Colony ↔ External arrow */}
            <line x1={588} y1={200} x2={624} y2={200}
              stroke={C.ext} strokeWidth={1.2} strokeDasharray="3 3"
              markerEnd={mk(C.ext)}/>
            <line x1={624} y1={218} x2={588} y2={218}
              stroke={C.ext} strokeWidth={1.2} strokeDasharray="3 3"
              markerEnd={mk(C.ext)}/>
            <text x={606} y={196} textAnchor="middle" fontSize={6.5} fill={C.ext} fontFamily={F}>export</text>
            <text x={606} y={230} textAnchor="middle" fontSize={6.5} fill={C.ext} fontFamily={F}>import</text>

            {/* ── The Fisc (centre) ── */}
            <rect x={215} y={195} width={180} height={72} rx={3}
              fill={`${C.fisc}14`} stroke={C.fisc} strokeWidth={1.5}/>
            <text x={305} y={216} textAnchor="middle" fontSize={11} fill={C.fisc} fontFamily={F}>▣</text>
            <text x={305} y={233} textAnchor="middle" fontSize={9} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">THE FISC</text>
            <text x={305} y={247} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>automated constitutional utility</text>
            <text x={305} y={259} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>issues S · maintains blockchain</text>

            {/* ── Citizens ── */}
            <rect x={28} y={55} width={100} height={68} rx={3}
              fill={`${C.citizen}14`} stroke={C.citizen} strokeWidth={1.2}/>
            <text x={78} y={78} textAnchor="middle" fontSize={13} fill={C.citizen} fontFamily={F}>◉</text>
            <text x={78} y={95} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">CITIZEN</text>
            <text x={78} y={108} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>colony member</text>

            {/* ── Companies ── */}
            <rect x={390} y={55} width={148} height={68} rx={3}
              fill={`${C.company}14`} stroke={C.company} strokeWidth={1.2}/>
            <text x={464} y={78} textAnchor="middle" fontSize={13} fill={C.company} fontFamily={F}>⬡</text>
            <text x={464} y={95} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">COMPANY</text>
            <text x={464} y={108} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>colony enterprise</text>

            {/* ── MCC ── */}
            <rect x={28} y={350} width={160} height={72} rx={3}
              fill={`${C.mcc}12`} stroke={C.mcc} strokeWidth={1.2}/>
            <text x={108} y={372} textAnchor="middle" fontSize={11} fill={C.mcc} fontFamily={F}>⬢</text>
            <text x={108} y={389} textAnchor="middle" fontSize={8} fontWeight={700} fill={T1} fontFamily={F} letterSpacing="0.1em">MCC</text>
            <text x={108} y={402} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>infrastructure company</text>
            <text x={108} y={413} textAnchor="middle" fontSize={7} fill={T3} fontFamily={F}>dome · power · water · air</text>

            {/* ── S Token ── */}
            <circle cx={155} cy={200} r={28} fill={`${C.s}18`} stroke={C.s} strokeWidth={1.5}/>
            <text x={155} y={196} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.s} fontFamily={F}>S</text>
            <text x={155} y={209} textAnchor="middle" fontSize={6.5} fill={C.s} fontFamily={F}>SPICE</text>
            <text x={155} y={240} textAnchor="middle" fontSize={7} fill={C.s} fontFamily={F}>expires month end</text>

            {/* ── V Token ── */}
            <circle cx={460} cy={200} r={28} fill={`${C.v}18`} stroke={C.v} strokeWidth={1.5}/>
            <text x={460} y={196} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.v} fontFamily={F}>V</text>
            <text x={460} y={209} textAnchor="middle" fontSize={6.5} fill={C.v} fontFamily={F}>VAULT</text>
            <text x={460} y={240} textAnchor="middle" fontSize={7} fill={C.v} fontFamily={F}>never expires</text>

            {/* ── FLOWS ── */}

            {/* Fisc → S → Citizen: 1,000 S UBI */}
            <line x1={215} y1={222} x2={200} y2={210}
              stroke={C.s} strokeWidth={1.5} markerEnd={mk(C.s)}/>
            <line x1={155} y1={172} x2={102} y2={120}
              stroke={C.s} strokeWidth={1.5} markerEnd={mk(C.s)}/>
            <text x={136} y={148} textAnchor="middle" fontSize={7} fill={C.s} fontFamily={F}>1,000 S</text>
            <text x={136} y={158} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>(UBI · monthly)</text>
            <text x={184} y={218} textAnchor="middle" fontSize={6} fill={T3} fontFamily={F}>issues</text>

            {/* Citizen → MCC: bill ~200 S */}
            <line x1={78} y1={123} x2={78} y2={350}
              stroke={C.s} strokeWidth={1.2} strokeDasharray="4 3" markerEnd={mk(C.s)}/>
            <text x={62} y={245} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F} transform="rotate(-90,62,245)">MCC bill ~200 S</text>

            {/* Citizen → Company: spend S on goods/services */}
            <line x1={128} y1={80} x2={390} y2={80}
              stroke={C.s} strokeWidth={1.4} markerEnd={mk(C.s)}/>
            <text x={260} y={72} textAnchor="middle" fontSize={7} fill={C.s} fontFamily={F}>spend S (goods · services)</text>

            {/* Citizen → V: convert up to 200 S */}
            <path d="M 128 100 Q 290 150 432 185"
              fill="none" stroke={C.v} strokeWidth={1.2} strokeDasharray="4 3" markerEnd={mk(C.v)}/>
            <text x={280} y={148} textAnchor="middle" fontSize={7} fill={C.v} fontFamily={F}>convert → V (max 200 S/mo)</text>

            {/* S expires */}
            <text x={155} y={256} textAnchor="middle" fontSize={7} fill={`${C.s}99`} fontFamily={F}>↓ expires</text>
            <rect x={120} y={259} width={70} height={14} rx={2} fill={`${C.s}15`} stroke={`${C.s}40`} strokeWidth={0.8}/>
            <text x={155} y={269} textAnchor="middle" fontSize={6.5} fill={`${C.s}88`} fontFamily={F}>destroyed at midnight</text>

            {/* Company → V dividends to citizens */}
            <line x1={460} y1={172} x2={460} y2={120}
              stroke={C.v} strokeWidth={1.2} markerEnd={mk(C.v)}/>
            <line x1={460} y1={120} x2={148} y2={120}
              stroke={C.v} strokeWidth={1.2} markerEnd={mk(C.v)}/>
            <text x={310} y={113} textAnchor="middle" fontSize={7} fill={C.v} fontFamily={F}>V dividends → equity holders</text>

            {/* Company: 20% of S → V */}
            <line x1={488} y1={175} x2={488} y2={226}
              stroke={C.v} strokeWidth={1} strokeDasharray="3 3" markerEnd={mk(C.v)}/>
            <text x={510} y={208} textAnchor="middle" fontSize={6.5} fill={T3} fontFamily={F}>20%→V</text>

            {/* ── S token note ── */}
            <rect x={160} y={390} width={390} height={52} rx={3}
              fill="rgba(239,68,68,0.06)" stroke={`${C.s}50`} strokeWidth={0.8}/>
            <text x={355} y={408} textAnchor="middle" fontSize={8} fontWeight={700} fill={C.s} fontFamily={F} letterSpacing="0.08em">
              S TOKEN = SPICE COIN (ZPC)
            </text>
            <text x={355} y={422} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>
              Issued by the Fisc · colony unit of account · not backed by fiat
            </text>
            <text x={355} y={434} textAnchor="middle" fontSize={7} fill={T2} fontFamily={F}>
              1,000 S/citizen/month · expires at midnight on last day of month
            </text>

          </svg>
        </div>

        {/* Legend + Key Mechanics */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

          <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:3, padding:"20px" }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase",
              marginBottom:16, borderBottom:`1px solid #141c2e`, paddingBottom:8 }}>Legend</div>
            <LegendItem color={C.fisc}    label="The Fisc"
              sub="The colony's fully automated constitutional utility. Issues 1,000 S-tokens to every citizen on the 1st of each month. Maintains the blockchain registry. Cannot be lobbied, voted out, or placed under MCC control." />
            <LegendItem color={C.s}       label="S Token — SPICE Coin (ZPC)"
              sub="The colony's everyday currency. Expires at midnight on the last day of every month. The month-end reset is the anti-inflation mechanism — unspent supply is destroyed, not accumulated." />
            <LegendItem color={C.v}       label="V Token — Vault"
              sub="Permanent savings. Citizens may convert up to 200 S/month to V (20% of UBI). Companies convert up to 20% of net monthly earnings. V-tokens never expire and cannot be seized." />
            <LegendItem color={C.mcc}     label="MCC — Infrastructure Company"
              sub="Provides dome, life support, power, water, waste, comms. Owned equally by all citizens (one non-transferable share each). Bills citizens for actual consumption — target ~200 S/month average." />
            <LegendItem color={C.citizen} label="Citizen"
              sub="Receives 1,000 S monthly from the Fisc. Pays MCC bill. Spends remaining S on goods/services. May convert up to 200 S to V as savings. Holds equity in companies and receives V dividends." />
            <LegendItem color={C.company} label="Company"
              sub="Provides goods or services for S-tokens. At month end, converts up to 20% of net earnings to V, distributed as dividends to equity holders. Remaining S expires." />
            <LegendItem color={C.ext}     label="BTC · ETH · SOL"
              sub="External settlement layer. Used for inter-colony trade, imports, and exports. Not part of the internal SPICE system." />
          </div>

          <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:3, padding:"20px" }}>
            <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase",
              marginBottom:16, borderBottom:`1px solid #141c2e`, paddingBottom:8 }}>Key Mechanics</div>
            {[
              { head:"The anti-inflation mechanism",
                body:"S-tokens expire at midnight on the last day of every month. The total supply resets to zero regardless of what was spent. There is no mechanism by which unspent money can chase a fixed supply of goods. Inflation in S-tokens is structurally impossible." },
              { head:"UBI as the foundation",
                body:"Every citizen receives 1,000 S-tokens unconditionally from the Fisc — for life, from birth, without means testing. This covers the MCC infrastructure bill (~200 S average) with enough remaining for goods and services. The floor is guaranteed; the ceiling is infinite." },
              { head:"Savings via V-tokens",
                body:"Citizens and companies may convert S-tokens to V-tokens — permanent savings that never expire. The conversion cap (20% for citizens, 20% of net earnings for companies) prevents V from accumulating faster than colony output grows, which is the system's only inflation risk." },
              { head:"The Fisc — constitutional, not political",
                body:"The Fisc is not a company and not part of MCC. It is a constitutional utility — operated entirely by software, governed by rules not people. Changing its rules requires an 80% blockchain referendum of all registered citizens. It cannot be lobbied, controlled, or voted out." },
            ].map(({ head, body }) => (
              <div key={head} style={{ marginBottom:16 }}>
                <div style={{ fontSize:9, fontWeight:700, color:GOLD, letterSpacing:"0.08em", marginBottom:4 }}>{head}</div>
                <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>{body}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Benefits panel */}
        <div style={{ background:BG2, border:`1px solid ${BD}`, borderRadius:3, padding:"20px", marginTop:24 }}>
          <div style={{ fontSize:8, color:T3, letterSpacing:"0.2em", textTransform:"uppercase",
            marginBottom:16, borderBottom:`1px solid #141c2e`, paddingBottom:8 }}>Benefits of the SPICE System</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}>
            {[
              { head:"Security", body:"Full universal basic income throughout life — sufficient to cover all basic needs including housing, food, medical, and infrastructure. The target: public services at 20% of basic income." },
              { head:"No tax", body:"Citizens pay only for services they actually use, at metered rates set by the MCC board. No income tax, no VAT, no mandatory contribution beyond the monthly MCC bill." },
              { head:"No inflation", body:"No money printing, no fractional reserve banking. S-tokens reset to zero monthly. V-token accumulation is capped. The system is structurally non-inflationary." },
              { head:"Responsibility", body:"No such thing as a free lunch — you pay for all services you consume, incentivising efficient use of resources. Waste processing, power, water — all metered." },
              { head:"Entrepreneurship", body:"Accumulated V-tokens and company equity provide incentive to save, strive, and prosper. No licence required to found a company — register with the Fisc and compete." },
              { head:"Transparency", body:"All ownership — wallets, shares, assets, land rights — is publicly visible on the blockchain at all times. MCC financials are published in real time. No anonymous ownership." },
            ].map(({ head, body }) => (
              <div key={head}>
                <div style={{ fontSize:9, fontWeight:700, color:GOLD, letterSpacing:"0.08em", marginBottom:6 }}>{head}</div>
                <div style={{ fontSize:9, color:T2, lineHeight:1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
