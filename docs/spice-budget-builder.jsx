import { useState, useMemo } from "react";

// ─── REAL OHIO REFERENCE DATA ─────────────────────────────────────────────────
// BLS Consumer Expenditure Survey + Ohio-specific utility data
// "Local" = spendable inside colony in S-tokens
// "SPICE discount" = % cheaper than dollar equivalent due to UBI labour subsidy
// Dollar ref = what this costs in Ohio today

const DEFAULT_ITEMS = [
  // ── MCC (mandatory, auto-deducted at period start) ──
  { id:"elec",    cat:"MCC",           name:"Electricity",              dollarRef:120, discount:25, s:90,  note:"Smart metering + collective purchasing" },
  { id:"water",   cat:"MCC",           name:"Water & Sewage",           dollarRef:65,  discount:20, s:50,  note:"Treatment + AI leak detection" },
  { id:"waste",   cat:"MCC",           name:"Waste & Recycling",        dollarRef:30,  discount:15, s:25,  note:"Collection staff on UBI baseline" },
  { id:"broad",   cat:"MCC",           name:"Broadband",                dollarRef:60,  discount:20, s:45,  note:"Colony mesh infrastructure" },
  { id:"ems",     cat:"MCC",           name:"Roads / Fire / EMS",       dollarRef:55,  discount:30, s:40,  note:"Shared infrastructure levy" },
  // ── Food & Household (essential) ──
  { id:"grocery", cat:"Essential",     name:"Groceries & household",    dollarRef:420, discount:30, s:280, note:"UBI subsidises retail labour; local produce cheaper" },
  { id:"care",    cat:"Essential",     name:"Personal care",            dollarRef:75,  discount:15, s:60,  note:"Hair, pharmacy, basics" },
  { id:"health",  cat:"Essential",     name:"Healthcare (co-pay/dental)",dollarRef:120, discount:20, s:90,  note:"MCC covers basic; this is supplementary" },
  { id:"transport",cat:"Essential",    name:"Local transport",          dollarRef:65,  discount:35, s:40,  note:"Bus, bike share — driver labour on UBI" },
  { id:"edu",     cat:"Essential",     name:"Education / childcare",    dollarRef:90,  discount:25, s:65,  note:"Shared facility; staff on UBI baseline" },
  // ── Discretionary (local spending, non-essential) ──
  { id:"dining",  cat:"Discretionary", name:"Local dining & cafes",     dollarRef:160, discount:35, s:100, note:"Kitchen labour on UBI; biggest discount sector" },
  { id:"entertain",cat:"Discretionary",name:"Entertainment & social",   dollarRef:80,  discount:20, s:60,  note:"Cinema, events, sports — local" },
  { id:"nonessential",cat:"Discretionary",name:"Non-essential goods",   dollarRef:100, discount:10, s:80,  note:"Clothing, gifts, hobby items" },
  // ── Savings (S→V conversion) ──
  { id:"savings", cat:"Savings",       name:"S→V conversion (savings)", dollarRef:0,   discount:0,  s:110, note:"20% target: holiday, washing machine, V-token wealth building" },
];

const CAT_COLORS = {
  MCC:          "#3a6888",
  Essential:    "#3a8855",
  Discretionary:"#b06820",
  Savings:      "#8858a8",
};
const CAT_ORDER = ["MCC","Essential","Discretionary","Savings"];

// Ohio real bread price reference
const OHIO_BREAD_USD = 2.80;
// SPICE bread: cheaper due to UBI labour subsidy on baking staff
const SPICE_BREAD_DISCOUNT = 0.28; // 28% cheaper to produce locally

const P = {
  bg:"#07090c", surf:"#0b0f16", border:"#182030",
  gold:"#c8a050", red:"#b04040", green:"#3a8855",
  blue:"#3a6888", purple:"#8858a8", orange:"#b06820",
  text:"#b0bccf", muted:"#3a4a5a", dim:"#101820",
};

const S = {
  root:{ fontFamily:"'IBM Plex Mono',monospace", background:P.bg, color:P.text,
         minHeight:"100vh", padding:"22px 20px", boxSizing:"border-box", fontSize:"11px" },
  hdr:{ borderBottom:`1px solid ${P.border}`, paddingBottom:"14px", marginBottom:"20px" },
  tag:{ fontSize:"9px", letterSpacing:"0.18em", color:P.muted, textTransform:"uppercase", marginBottom:"4px" },
  h1:{ fontSize:"17px", fontWeight:400, color:"#d8e4f0", letterSpacing:"-0.02em", marginBottom:"3px" },
  sub:{ fontSize:"10px", color:P.muted },
  layout:{ display:"grid", gridTemplateColumns:"380px 1fr", gap:"18px", alignItems:"start" },
  panel:{ background:P.surf, border:`1px solid ${P.border}`, padding:"14px", marginBottom:"12px" },
  ptitle:{ fontSize:"9px", letterSpacing:"0.12em", color:P.muted, textTransform:"uppercase",
           marginBottom:"12px", paddingBottom:"7px", borderBottom:`1px solid ${P.dim}` },
  catLabel:(cat)=>({ fontSize:"8px", letterSpacing:"0.12em", color:CAT_COLORS[cat],
                     textTransform:"uppercase", marginTop:"10px", marginBottom:"6px",
                     paddingLeft:"6px", borderLeft:`2px solid ${CAT_COLORS[cat]}` }),
  itemRow:{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"7px" },
  itemName:{ fontSize:"10px", color:"#8a9aaa", width:"150px", flexShrink:0 },
  itemSlider:{ flex:1, accentColor:P.gold, cursor:"pointer" },
  itemVal:{ fontSize:"10px", color:P.gold, fontWeight:600, width:"40px", textAlign:"right", flexShrink:0 },
  itemNote:{ fontSize:"8px", color:P.muted, marginTop:"-4px", marginBottom:"4px", paddingLeft:"158px" },
  divider:{ border:"none", borderTop:`1px solid ${P.dim}`, margin:"10px 0" },
  flowRow:{ display:"flex", justifyContent:"space-between", padding:"4px 0",
            borderBottom:`1px solid #0c1420`, fontSize:"10px" },
  mGrid:(n)=>({ display:"grid", gridTemplateColumns:`repeat(${n},1fr)`, gap:"8px", marginBottom:"12px" }),
  metric:(s,color)=>({ background:"#080c12",
                 border:`1px solid ${s===1?"#183322":s===-1?"#321818":P.border}`,
                 padding:"10px", textAlign:"center" }),
  mLbl:{ fontSize:"8px", letterSpacing:"0.09em", color:P.muted, textTransform:"uppercase", marginBottom:"4px" },
  mVal:(s,c)=>({ fontSize:"15px", fontWeight:600,
               color:c||(s===1?"#4a9a68":s===-1?"#a84848":P.gold) }),
  note:{ fontSize:"9px", color:P.muted, lineHeight:1.6, marginTop:"6px" },
  insight:(ok)=>({ background:ok?"#071210":"#120707",
                   border:`1px solid ${ok?"#183022":"#301818"}`,
                   padding:"11px 13px", fontSize:"10px", lineHeight:1.7,
                   color:ok?"#5a9a78":"#a05050", marginBottom:"12px" }),
  walletCard:(color)=>({
    background:"#080c12", border:`1px solid ${color}22`,
    borderLeft:`3px solid ${color}`, padding:"12px", marginBottom:"10px",
  }),
  wName:{ fontSize:"11px", fontWeight:600, marginBottom:"8px" },
  wBalance:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginBottom:"8px" },
  wBal:(c)=>({ background:P.surf, padding:"8px", textAlign:"center", border:`1px solid ${P.border}` }),
  wBalLbl:{ fontSize:"8px", color:P.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"3px" },
  wBalVal:(c)=>({ fontSize:"13px", fontWeight:600, color:c||P.gold }),
  wFlow:{ fontSize:"9px", color:P.muted, lineHeight:1.8, borderTop:`1px solid ${P.dim}`, paddingTop:"8px" },
};

function pct(v,t){ return t===0?0:Math.round(v/t*100); }
function fmt$(n){ return `$${Math.abs(n).toFixed(0)}`; }

// ── Bar chart (pure CSS) ──────────────────────────────────────────────────────
function StackBar({ items, total }) {
  return (
    <div style={{ display:"flex", height:"28px", width:"100%", borderRadius:"2px", overflow:"hidden", marginBottom:"6px" }}>
      {items.map(({cat,val})=>(
        <div key={cat} style={{
          width:`${pct(val,total)}%`, background:CAT_COLORS[cat],
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"8px", color:"rgba(255,255,255,0.7)", overflow:"hidden",
          transition:"width 0.2s",
        }}>
          {pct(val,total)>5?`${pct(val,total)}%`:""}
        </div>
      ))}
    </div>
  );
}

// ── Gauge (pure CSS) ─────────────────────────────────────────────────────────
function Gauge({ value, target, label, color }) {
  const pctVal = Math.min(100, Math.round(value/target*100));
  const ok = Math.abs(pctVal-100) < 5;
  return (
    <div style={{ textAlign:"center", padding:"10px" }}>
      <div style={{ fontSize:"9px", color:P.muted, marginBottom:"4px" }}>{label}</div>
      <div style={{ fontSize:"18px", fontWeight:600, color:ok?P.green:color||P.gold }}>
        {pctVal}%
      </div>
      <div style={{ background:P.dim, height:"3px", borderRadius:"2px", marginTop:"4px" }}>
        <div style={{ width:`${pctVal}%`, height:"100%", background:ok?P.green:color||P.gold, transition:"width 0.2s" }}/>
      </div>
      <div style={{ fontSize:"8px", color:P.muted, marginTop:"3px" }}>target {Math.round(target*100)}%</div>
    </div>
  );
}

export default function BudgetBuilder() {
  const [items, setItems] = useState(DEFAULT_ITEMS.map(x=>({...x})));
  const [breadS, setBreadS] = useState(4);   // S-tokens per loaf (the anchor)
  const [spiceDiscount, setSpiceDiscount] = useState(28); // % cheaper in SPICE colony

  function setItemS(id, val) {
    setItems(prev => prev.map(x => x.id===id ? {...x, s:val} : x));
  }

  const model = useMemo(() => {
    const bycat = {};
    CAT_ORDER.forEach(c => bycat[c]=0);
    items.forEach(x => bycat[x.cat] += x.s);

    const mcc   = bycat["MCC"];
    const ess   = bycat["Essential"];
    const disc  = bycat["Discretionary"];
    const save  = bycat["Savings"];
    const total = mcc + ess + disc + save;

    const pMCC  = pct(mcc,  total);
    const pEss  = pct(ess,  total);
    const pDisc = pct(disc, total);
    const pSave = pct(save, total);

    // UBI = total S-tokens needed
    const ubiRequired = total;

    // Bread cross-check
    // SPICE bread costs less to produce because labour is UBI-subsidised
    const spiceBreadUSD = OHIO_BREAD_USD * (1 - spiceDiscount/100);
    // Exchange rate implied by bread price
    const impliedRate = spiceBreadUSD / breadS;

    // UBI in dollar terms at implied rate
    const ubiUSD = ubiRequired * impliedRate;

    // Total local spending in dollar terms
    const localSpendUSD = (mcc + ess + disc) * impliedRate;

    // What Ohio resident earns locally vs our UBI
    const ohioLocalSpend = items.filter(x=>x.cat!=="Savings")
      .reduce((s,x) => s + x.dollarRef, 0);

    // SPICE purchasing power premium: same S-tokens buy more real goods
    // because local prices are lower due to labour discount
    const avgDiscount = items.filter(x=>x.cat!=="Savings" && x.discount>0)
      .reduce((s,x,_,a) => s + x.discount/a.length, 0);
    const realPurchasingPower = localSpendUSD / (1 - avgDiscount/100);

    // Three citizen profiles
    const profiles = [
      {
        name:"Basic Citizen", color:P.blue,
        desc:"UBI only. No external income. Relies entirely on colony economy.",
        incomeS: ubiRequired, incomeV: 0, incomeSource:"UBI only",
        afterMCC: ubiRequired - mcc,
        essentialsCovered: (ubiRequired - mcc) >= ess,
        endMonthS: disc,  // discretionary left
        endMonthV: save,  // saved to V
        example:`Spends ${disc}S on local goods/dining. Saves ${save}S→V tokens. No external purchases this month.`,
      },
      {
        name:"Working Citizen", color:P.green,
        desc:"UBI + local employment wages in V-tokens. Comfortable colony life.",
        incomeS: ubiRequired, incomeV: Math.round(ubiRequired * 0.8),
        incomeSource:`UBI + ${Math.round(ubiRequired*0.8)}V wages`,
        afterMCC: ubiRequired - mcc,
        essentialsCovered: true,
        endMonthS: disc + Math.round(ubiRequired*0.1),
        endMonthV: save + Math.round(ubiRequired*0.8),
        example:`Spends freely in S-tokens. Accumulates V-tokens from wages. May buy externally — e.g. car payment — from V savings.`,
      },
      {
        name:"Lawyer / Professional", color:P.orange,
        desc:"UBI + substantial V-token professional income, local and remote clients.",
        incomeS: ubiRequired, incomeV: Math.round(ubiRequired * 3.5),
        incomeSource:`UBI + ${Math.round(ubiRequired*3.5)}V professional fees`,
        afterMCC: ubiRequired - mcc,
        essentialsCovered: true,
        endMonthS: disc,
        endMonthV: save + Math.round(ubiRequired * 3.5),
        example:`Quotes clients in S-tokens. Remote clients pay USDC → Fisc converts → V credited. Large V accumulation — holiday, investment, external capital.`,
      },
    ];

    // Target splits
    const targetMCC  = 0.25; // ~25% MCC
    const targetEss  = 0.35; // ~35% essentials
    const targetDisc = 0.20; // ~20% discretionary
    const targetSave = 0.20; // ~20% savings

    const splitOK = Math.abs(pSave - 20) < 5;
    const rateOK  = impliedRate > 0.30 && impliedRate < 1.20;
    const ubiOK   = ubiUSD > 400 && ubiUSD < 1500;

    return {
      bycat, mcc, ess, disc, save, total, ubiRequired,
      pMCC, pEss, pDisc, pSave,
      spiceBreadUSD, impliedRate, ubiUSD, localSpendUSD,
      ohioLocalSpend, avgDiscount, realPurchasingPower,
      profiles, splitOK, rateOK, ubiOK,
      targetMCC, targetEss, targetDisc, targetSave,
    };
  }, [items, breadS, spiceDiscount]);

  const stackItems = CAT_ORDER.map(cat=>({ cat, val:model.bycat[cat] }));

  const systemOK = model.splitOK && model.rateOK && model.ubiOK;

  return (
    <div style={S.root}>
      <div style={S.hdr}>
        <div style={S.tag}>SPICE Protocol · Millbrook Ohio · Standard Citizen Budget</div>
        <div style={S.h1}>What should 1,000 S-tokens buy?</div>
        <div style={S.sub}>Build the real budget → derive UBI level → cross-check bread price → lock the exchange rate</div>
      </div>

      <div style={S.layout}>

        {/* ── LEFT: Budget Builder ── */}
        <div>
          <div style={S.panel}>
            <div style={S.ptitle}>Monthly Citizen Budget — Millbrook, Ohio</div>
            {CAT_ORDER.map(cat=>(
              <div key={cat}>
                <div style={S.catLabel(cat)}>{cat} — {model.bycat[cat]} S / month</div>
                {items.filter(x=>x.cat===cat).map(item=>(
                  <div key={item.id}>
                    <div style={S.itemRow}>
                      <span style={S.itemName}>{item.name}</span>
                      <input type="range" min={0} max={
                        cat==="MCC"?200:cat==="Savings"?300:cat==="Discretionary"?200:400
                      } step={5} value={item.s}
                        onChange={e=>setItemS(item.id,Number(e.target.value))}
                        style={{...S.itemSlider, accentColor:CAT_COLORS[cat]}}
                      />
                      <span style={S.itemVal}>{item.s}S</span>
                      {item.dollarRef>0 && (
                        <span style={{fontSize:"8px",color:P.muted,width:"42px",textAlign:"right",flexShrink:0}}>
                          ${item.dollarRef}
                        </span>
                      )}
                    </div>
                    <div style={S.itemNote}>{item.note}</div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{...S.divider,marginTop:"14px"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"11px",color:"#a0b0c0",fontWeight:600}}>TOTAL UBI REQUIRED</span>
              <span style={{fontSize:"18px",color:P.gold,fontWeight:600}}>{model.total} S/month</span>
            </div>
          </div>

          {/* Bread anchor */}
          <div style={S.panel}>
            <div style={S.ptitle}>The Bread Anchor</div>
            <div style={S.itemRow}>
              <span style={S.itemName}>Bread price (S-tokens)</span>
              <input type="range" min={1} max={20} step={1} value={breadS}
                onChange={e=>setBreadS(Number(e.target.value))}
                style={{...S.itemSlider}}/>
              <span style={S.itemVal}>{breadS}S</span>
            </div>
            <div style={S.itemRow}>
              <span style={S.itemName}>SPICE labour discount</span>
              <input type="range" min={0} max={50} step={1} value={spiceDiscount}
                onChange={e=>setSpiceDiscount(Number(e.target.value))}
                style={{...S.itemSlider}}/>
              <span style={S.itemVal}>{spiceDiscount}%</span>
            </div>
            <div style={S.note}>
              Ohio bread today: ${OHIO_BREAD_USD.toFixed(2)}. 
              In SPICE colony (baker staff on UBI baseline): ${model.spiceBreadUSD.toFixed(2)}.
              At {breadS}S/loaf → implied rate: <span style={{color:P.gold}}>${model.impliedRate.toFixed(3)}/S</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Derived Numbers ── */}
        <div>

          {/* System consistency check */}
          <div style={S.insight(systemOK)}>
            <strong>System consistency:</strong>{" "}
            {systemOK
              ? `Budget is internally consistent. UBI of ${model.total}S at $${model.impliedRate.toFixed(2)}/S = $${model.ubiUSD.toFixed(0)}/month real purchasing power. Bread costs ${breadS}S = $${model.spiceBreadUSD.toFixed(2)} in SPICE. All three numbers agree.`
              : `System has tension. `+
                (!model.rateOK ? `Exchange rate $${model.impliedRate.toFixed(2)}/S is ${model.impliedRate<0.30?"too low — UBI barely worth anything":"very high — bread price too cheap relative to budget"}. ` : "")+
                (!model.ubiOK  ? `UBI value $${model.ubiUSD.toFixed(0)}/month is ${model.ubiUSD<400?"too low for a real income floor":"higher than a typical Ohio wage — may be hard to fund"}. ` : "")+
                (!model.splitOK? `Savings at ${model.pSave}% is ${model.pSave<15?"too low — citizens can't build wealth":"above target — less discretionary spending"}.` : "")
            }
          </div>

          {/* Key derived numbers */}
          <div style={S.mGrid(3)}>
            {[
              ["UBI required",       `${model.total} S/mo`,  0, null],
              ["Implied rate",       `$${model.impliedRate.toFixed(2)}/S`, model.rateOK?1:-1, null],
              ["UBI value (USD)",    `$${model.ubiUSD.toFixed(0)}/mo`, model.ubiOK?1:-1, null],
              ["Bread in SPICE",     `$${model.spiceBreadUSD.toFixed(2)}`, 0, P.blue],
              ["SPICE price discount",`${model.avgDiscount.toFixed(0)}% avg`, 1, P.green],
              ["Real buying power",  `$${model.realPurchasingPower.toFixed(0)}/mo`, 1, P.teal],
            ].map(([l,v,sg,c])=>(
              <div key={l} style={S.metric(sg)}>
                <div style={S.mLbl}>{l}</div>
                <div style={S.mVal(sg,c)}>{v}</div>
              </div>
            ))}
          </div>

          {/* Stack bar + split gauges */}
          <div style={S.panel}>
            <div style={S.ptitle}>Budget Split — Target 25 / 35 / 20 / 20</div>
            <StackBar items={stackItems} total={model.total}/>
            <div style={{display:"flex",gap:"6px",marginBottom:"10px"}}>
              {CAT_ORDER.map(cat=>(
                <div key={cat} style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"9px",color:CAT_COLORS[cat]}}>
                  <div style={{width:10,height:10,background:CAT_COLORS[cat],borderRadius:1}}/>
                  {cat} {model.bycat[cat]}S
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
              <Gauge value={model.pMCC}  target={25} label="MCC"          color={P.blue}/>
              <Gauge value={model.pEss}  target={35} label="Essential"    color={P.green}/>
              <Gauge value={model.pDisc} target={20} label="Discretionary"color={P.orange}/>
              <Gauge value={model.pSave} target={20} label="Savings"      color={P.purple}/>
            </div>
            <div style={S.note}>
              MCC auto-deducted at period start ({model.mcc}S).
              Remaining {model.total - model.mcc}S for citizen to allocate.
              Savings of {model.save}S converts to V-tokens at period end (1:1, permanent).
            </div>
          </div>

          {/* Bread-rate-UBI triangle */}
          <div style={S.panel}>
            <div style={S.ptitle}>The Three-Number Consistency Triangle</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1px",background:P.border}}>
              {[
                { label:"Bread price",  val:`${breadS} S`, sub:`$${model.spiceBreadUSD.toFixed(2)} in colony`, color:P.gold },
                { label:"Fisc rate",    val:`$${model.impliedRate.toFixed(3)}`, sub:"per S-token", color:P.teal },
                { label:"UBI value",    val:`$${model.ubiUSD.toFixed(0)}/mo`, sub:`${model.total}S × rate`, color:P.green },
              ].map(x=>(
                <div key={x.label} style={{background:P.surf,padding:"14px",textAlign:"center"}}>
                  <div style={{fontSize:"8px",color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"6px"}}>{x.label}</div>
                  <div style={{fontSize:"20px",fontWeight:600,color:x.color,marginBottom:"4px"}}>{x.val}</div>
                  <div style={{fontSize:"9px",color:P.muted}}>{x.sub}</div>
                </div>
              ))}
            </div>
            <div style={{background:P.dim,padding:"10px",marginTop:"1px"}}>
              <div style={{fontSize:"9px",color:"#5a7a6a",lineHeight:1.8}}>
                These three numbers must be consistent. Change one and the others must follow.
                The Fisc publishes the rate daily. The bread price is the anchor the Fisc defends.
                The UBI level is a governance parameter, set at founding and adjustable by vote.
                <br/>
                <span style={{color:P.muted}}>
                  Ohio dollar equivalent for same goods: ~${model.ohioLocalSpend}/mo.
                  SPICE colony provides equivalent for ${model.ubiUSD.toFixed(0)}/mo 
                  ({Math.round((1-model.ubiUSD/model.ohioLocalSpend)*100)}% cheaper) 
                  due to UBI labour subsidy across all local services.
                </span>
              </div>
            </div>
          </div>

          {/* Three citizen profiles */}
          <div style={S.panel}>
            <div style={S.ptitle}>Sample Month — Three Citizen Types</div>
            {model.profiles.map(p=>(
              <div key={p.name} style={S.walletCard(p.color)}>
                <div style={{...S.wName,color:p.color}}>{p.name}</div>
                <div style={{fontSize:"9px",color:P.muted,marginBottom:"8px"}}>{p.desc}</div>
                <div style={S.wBalance}>
                  <div style={S.wBal()}>
                    <div style={S.wBalLbl}>Income this period</div>
                    <div style={S.wBalVal(p.color)}>{p.incomeS}S + {p.incomeV}V</div>
                    <div style={{fontSize:"8px",color:P.muted}}>{p.incomeSource}</div>
                  </div>
                  <div style={S.wBal()}>
                    <div style={S.wBalLbl}>End of month V savings</div>
                    <div style={S.wBalVal(P.purple)}>{p.endMonthV}V</div>
                    <div style={{fontSize:"8px",color:P.muted}}>≈${(p.endMonthV*model.impliedRate).toFixed(0)} USDC equiv</div>
                  </div>
                </div>
                <div style={S.wFlow}>
                  {[
                    [`UBI received`,              `+${model.total}S`],
                    [`MCC bill (auto-deducted)`,  `-${model.mcc}S`],
                    [`Essentials + discretionary`,`-${model.ess+model.disc}S`],
                    [`S→V conversion (savings)`,  `-${model.save}S → +${model.save}V`],
                    ...(p.incomeV>0?[[`Professional V income`,`+${p.incomeV}V`]]:[]),
                    [`S burned at period end`,    `-0S (fully spent)`],
                  ].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:P.muted}}>{l}</span>
                      <span style={{color:v.startsWith("+")?P.green:v.startsWith("-")?P.red:P.gold}}>{v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:"6px",paddingTop:"6px",borderTop:`1px solid ${P.dim}`,fontSize:"9px",color:"#5a6a7a"}}>
                    {p.example}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Design notes */}
          <div style={{...S.panel,borderColor:P.dim}}>
            <div style={S.ptitle}>Design Notes for Claude Code</div>
            <div style={{fontSize:"9px",color:"#3a4a5a",lineHeight:1.9}}>
              <p style={{marginTop:0}}>
                <span style={{color:P.muted}}>UBI_AMOUNT</span> = governance parameter, set at founding.
                Default: {model.total}S/month. Adjustable by colony vote with 90-day notice.
              </p>
              <p>
                <span style={{color:P.muted}}>FISC_RATE</span> = ${model.impliedRate.toFixed(3)}/S at launch.
                Adjusted daily by algorithm. Published on-chain. Bread basket price is the anchor target.
              </p>
              <p>
                <span style={{color:P.muted}}>MCC_BILL</span> = {model.mcc}S/month per resident.
                Auto-deducted at period start before citizen sees their balance.
                Itemised: {items.filter(x=>x.cat==="MCC").map(x=>`${x.name} ${x.s}S`).join(" · ")}.
              </p>
              <p style={{marginBottom:0}}>
                <span style={{color:P.muted}}>SAVINGS_CAP</span> = 20% of UBI_AMOUNT = {model.save}S/month
                maximum S→V conversion for citizens. Business sweep is 100%, uncapped.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
