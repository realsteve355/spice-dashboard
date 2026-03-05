// Automation scenario presets — set auto/reinstate/prod/rec/crypto/lag only.
// Fiscal/monetary sliders are left untouched; combine with any REGIME.
export const PRESETS = {
  acemoglu:    { auto: 2,  reinstate: 75, prod: 1.3, rec: 1.01, crypto: 1,  lag: 2   },
  spice:       { auto: 15, reinstate: 20, prod: 4.0, rec: 1.20, crypto: 2,  lag: 1   },
  gradual:     { auto: 5,  reinstate: 60, prod: 2.0, rec: 1.03, crypto: 1,  lag: 2.5 },
  singularity: { auto: 10, reinstate: 5,  prod: 6.0, rec: 1.25, crypto: 5,  lag: 0.5 },
};

// Policy regime presets — set fiscal/monetary params only.
// Automation sliders are left untouched; combine with any PRESET.
// params values are raw slider values (as displayed), not the /100 scaled values
// that simulate() expects — conversion is the caller's responsibility.
export const REGIMES = {
  volcker: {
    label: 'Sound Money / Monetary Hawk',
    params: { def:3, rate:9, ubi:0, captax:10, qe:0, gini:2, domcap:60 },
    ycc: false,
    warning: "Political tradition: governments and central banks that treat currency credibility as the primary obligation. Prioritises low inflation and fiscal discipline over employment or growth in the short term. Accepts that the medicine is painful but necessary.\n\nPolicy toolkit: sharply higher interest rates · reduced government borrowing · no monetary expansion · fiscal consolidation · independent central bank with a hard inflation mandate.\n\nHistorical precedents: central banks across multiple countries raised rates aggressively in 1979-83 to break embedded inflation, accepting deep recessions. New Zealand adopted formal inflation targeting in 1990, later widely copied. Bundesbank credibility underpinned German monetary stability for decades. In each case, short-term pain was followed by sustained low-inflation growth.\n\nAI-transition question: this tradition assumes unemployment is cyclical — that workers displaced by recession are rehired when conditions improve. Structural AI displacement is different in kind. The model does not resolve whether tight monetary policy accelerates or retards automation adoption. High rates raise debt service costs on existing sovereign borrowing, potentially worsening the fiscal position before confidence is restored.",
  },
  repression: {
    label: 'Technocratic Status Quo',
    params: { def:5, rate:3, ubi:5, captax:12, qe:8, gini:3, domcap:50 },
    ycc: true, ycccap: 3.0,
    warning: "Political tradition: no hard choices are made. Governments of varying political colours drift toward this outcome when the alternatives are too politically costly. Real interest rates are held below inflation, debt is nominally serviced but quietly eroded, and the problem is deferred. This is the default path — not a deliberate strategy but the absence of one.\n\nPolicy toolkit: moderate deficit spending · nominal rates below inflation · gradual monetary expansion · yield curve management · slow-motion transfer from savers to debtors.\n\nHistorical precedents: post-WWII advanced economies reduced debt from ~250% to ~50% of GDP over 30 years through sustained financial repression rather than explicit default or austerity. Reinhart and Sbrancia (2011) estimate this transferred 3-4% of GDP annually from savers to sovereigns. It required two conditions: capital controls that prevented exit, and no alternative store of value.\n\nAI-transition question: crypto adoption directly undermines the captive savings pool that financial repression requires. As real rates turn negative, the rational response for savers with access to non-fiat alternatives changes. The model's crypto adoption slider and the Flight From Fiat chart show when this mechanism begins to break down.",
  },
  keynesian: {
    label: 'Social Democrat',
    params: { def:8, rate:4, ubi:35, captax:25, qe:10, gini:2, domcap:55 },
    ycc: false,
    warning: "Political tradition: active government role in managing the economic transition. The state borrows and spends to protect workers displaced by structural change, funds retraining, and taxes capital to redistribute productivity gains. Views the AI transition as a social challenge requiring a social response.\n\nPolicy toolkit: higher deficit spending · income transfers to displaced workers · increased capital taxation · public investment in retraining and infrastructure · progressive redistribution.\n\nHistorical precedents: Scandinavian economies have sustained high social spending alongside competitive private sectors. Post-war welfare states in multiple countries managed industrial transition with broad popular support. However, 1970s stimulus in response to oil supply shocks produced stagflation in several economies — evidence that deficit spending in a supply-side disruption behaves differently than in a demand shortfall.\n\nAI-transition question: this approach works if deficit spending restores employment — if new roles emerge to replace automated ones. The evidence on fiscal multipliers is genuinely contested in the economics literature. The critical empirical variable is the reinstatement rate: how many new human roles emerge alongside AI adoption. This model's reinstatement slider captures that uncertainty directly. At low reinstatement, transfers add to debt without rebuilding the tax base.",
  },
  austerity: {
    label: 'Fiscal Conservative',
    params: { def:1, rate:5.5, ubi:0, captax:30, qe:0, gini:4, domcap:40 },
    ycc: false,
    warning: "Political tradition: the state lives within its means. Debt is a burden on future generations. Private sector investment and entrepreneurship — not government spending — drive adaptation to change. Structural reform, not transfers, is the answer to displacement.\n\nPolicy toolkit: primary surplus target · spending cuts · market-determined interest rates · no monetary expansion · reliance on private sector adjustment.\n\nHistorical precedents: Canada (1994-98) cut spending by 9% of GDP, achieved sustained growth, and eliminated a structural deficit. Sweden (early 1990s) ran significant consolidation following a banking crisis and recovered strongly. New Zealand restructured its economy through deregulation and fiscal discipline. These cases are cited as evidence that consolidation can be expansionary. The evidence is context-dependent — outcomes varied significantly across episodes.\n\nAI-transition question: this tradition assumes private sector activity fills the gap left by government retrenchment. That requires AI-driven investment to flow domestically and generate taxable activity. At low domestic capture rates — where AI profits accrue to foreign firms — the crowding-in mechanism may not function as the historical cases assumed. The domestic capture slider is the key variable.",
  },
  mmt: {
    label: 'Progressive / Populist',
    params: { def:10, rate:2, ubi:50, captax:15, qe:25, gini:3, domcap:45 },
    ycc: true, ycccap: 2.0,
    warning: "Political tradition: currency-issuing governments cannot become insolvent in their own currency and should not be constrained by conventional deficit limits. The AI transition creates both a social need (displaced workers) and a fiscal space (AI-driven deflation offsets inflationary pressure from money creation). Government should fund the transition directly.\n\nPolicy toolkit: large deficit spending · universal basic income · monetary financing of deficits · yield curve control · minimal fiscal constraint.\n\nHistorical precedents: Japan has sustained debt above 200% of GDP for over a decade with the central bank owning more than half of government bonds, without hyperinflation. This is the primary empirical case. The counter-cases — Weimar Germany (1921-23), Zimbabwe (2000s), Venezuela (2010s) — show the failure mode when monetary financing loses credibility. The structural differences between these outcomes are real but not fully theorised.\n\nAI-transition question: AI-driven consumer deflation may provide additional room for monetary expansion — the deflationary and inflationary forces partially cancel in consumer price indices. However, asset price inflation and fiat exit can occur even without CPI inflation. The key structural question is whether this sovereign has Japan's advantages: a domestic savings pool, current account surplus, and limited alternatives for savers. The crypto adoption slider directly models the erosion of that last condition.",
  },
};

export const POLICIES = [
  {
    name:'1. Austerity',
    desc:'Governments cut spending to reduce primary deficit. The first instinct, always politically painful. Historically counterproductive — reduces GDP faster than it reduces debt.',
    effects:[
      {text:'Primary deficit reduction:', val:'-2 to -4% GDP', positive:true},
      {text:'GDP impact:', val:'-3 to -8% (multiplier effect)', positive:false},
      {text:'Wage income share impact:', val:'Neutral to negative', positive:false},
      {text:'Debt/GDP net effect:', val:'Usually rises (GDP falls faster)', positive:false},
    ],
    historical:'UK 2010-15: deficit fell but debt/GDP still rose. Greece 2010-13: catastrophic GDP collapse.'
  },
  {
    name:'2. QE / Money Printing',
    desc:'Central bank creates money to buy government bonds, suppressing yields. Buys time but inflates assets, widens inequality, and creates future inflation risk.',
    effects:[
      {text:'Bond yield suppression:', val:'Effective short-term', positive:true},
      {text:'Asset price inflation:', val:'+30-100% (flows to asset owners owners)', positive:false},
      {text:'Consumer inflation:', val:'Limited while demand depressed', positive:true},
      {text:'Debt/GDP:', val:'Reduces temporarily, rebounds', positive:false},
    ],
    historical:'Fed 2020: balance sheet +$3T in months. Asset prices +80% in 18 months. Workers\' real wages fell.'
  },
  {
    name:'3. Financial Repression',
    desc:'Keep interest rates below inflation so debt erodes in real terms. Requires yield curve control or regulatory forcing of domestic institutions to hold government bonds.',
    effects:[
      {text:'Real debt reduction:', val:'Gradual — 2-3% GDP/year at best', positive:true},
      {text:'Saver wealth destruction:', val:'Equivalent to a wealth tax', positive:false},
      {text:'Capital flight risk:', val:'High if visible — crypto accelerates this', positive:false},
      {text:'Requires:', val:'Inflation > interest rates — hard in deflation', positive:false},
    ],
    historical:'UK/US post-WWII: 30 years of negative real rates eroded debt from 250% to 50% GDP. Required closed capital accounts.'
  },
  {
    name:'4. UBI / Helicopter Money',
    desc:'Direct transfers to citizens. Restores consumer demand, reduces deflationary spiral. Funded by money printing unless paired with capital tax. Changes the inflation dynamic.',
    effects:[
      {text:'Consumer demand restoration:', val:'Significant — high MPC recipients', positive:true},
      {text:'Consumer inflation:', val:'Creates genuine demand-pull inflation', positive:true},
      {text:'Cost:', val:'Enormous — 15-25% of GDP at full coverage', positive:false},
      {text:'Net debt effect:', val:'Worsens unless capital-tax-funded', positive:false},
    ],
    historical:'No historical precedent at scale. COVID payments gave glimpse — 2021 US CPI spike followed direct transfers.'
  },
  {
    name:'5. Capital / Wealth Tax',
    desc:'Tax the asset economy that has captured the AI productivity gains. The only policy that can simultaneously fund government and reduce inequality without printing money.',
    effects:[
      {text:'Revenue potential:', val:'Enormous — capital share now 38%+ of GDP', positive:true},
      {text:'Inequality reduction:', val:'Direct — reverses concentration', positive:true},
      {text:'Capital flight risk:', val:'Severe without international coordination', positive:false},
      {text:'Political feasibility:', val:'Extremely low — capital owns democracy', positive:false},
    ],
    historical:'French wealth tax 2012: €35B fled before implementation. Post-WWII capital levies worked when capital controls existed.'
  },
  {
    name:'6. Debt Restructuring / Default',
    desc:'When all else fails. Governments extend maturities, reduce coupons, or impose losses on bondholders. The endgame the model\'s terminal debt/GDP trajectory implies.',
    effects:[
      {text:'Immediate debt relief:', val:'Can eliminate 30-60% of debt stock', positive:true},
      {text:'Future borrowing costs:', val:'+300-500bp for years afterward', positive:false},
      {text:'Banking system:', val:'Severe stress — banks hold sovereign bonds', positive:false},
      {text:'Currency:', val:'Usually collapses — capital flight', positive:false},
    ],
    historical:'Greece 2012: 53% haircut. Argentina 2001, 2020. Always more painful than prevented.'
  },
];
