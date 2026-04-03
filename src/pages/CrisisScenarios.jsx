import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const F    = "'IBM Plex Mono',monospace";
const BG0  = "#0a0e1a";
const BG2  = "#0f1520";
const BD   = "#1e2a42";
const T1   = "#e8eaf0";
const T2   = "#8899bb";
const T3   = "#4a5878";
const GOLD = "#c8a96e";

// ─── GOVERNMENT RESPONSE PATHS ───────────────────────────────────────────────
// Timeline entries use offset from collisionYear; absolute years computed at render.

const GOV_PATHS = [
  {
    id: "democratic",
    icon: "🇺🇸",
    title: "Democratic Capitulation",
    description:
      "Opposition parties promise crypto freedom, win elections. Gradual legal tender adoption. Least painful transition but requires democratic process.",
    countries: "USA, Canada, Australia",
    likelihood: "Most likely (democracy)",
    phaseColors: ["#dc2626", "#ea580c", "#ea580c", "#eab308"],
    timeline: [
      {
        offset: 0,
        phase: "Onset",
        title: "Crisis Triggers",
        description:
          "Debt crosses 175%, unemployment hits 12% from AI displacement. Fed deploys Yield Curve Control (YCC) capping rates at 4.5%. Bond purchases begin. Crypto adoption rising as citizens seek alternatives.",
      },
      {
        offset: 1,
        phase: "Acute",
        title: "Cascade Intensifies",
        description:
          "YCC drives inflation to 14% while AI sectors deflate. Crypto flight surges to 52%. Gini coefficient rising. Mid-term elections: opposition campaigns on 'crypto freedom' platform. Political pressure building.",
      },
      {
        offset: 3,
        phase: "Political Shift",
        title: "Policy Reversal",
        description:
          "New administration gradually legalises Bitcoin as legal tender. Tax regime shifts from ban to regulated. Capital controls abandoned as politically unviable. Debt 220% GDP but monetary escape valve opened.",
      },
      {
        offset: 5,
        phase: "Resolution",
        title: "New Equilibrium",
        description:
          "Bitcoin/USD dual standard emerges. Real debt burden inflated away via monetary expansion. AI productivity gains begin offsetting displacement. New social contract around basic income and digital assets.",
      },
    ],
  },
  {
    id: "authoritarian",
    icon: "🇨🇳",
    title: "CBDC Iron Fist",
    description:
      "Emergency powers declared. Bitcoin criminalised, CBDC mandatory for all transactions. Capital controls prevent offshore movement. Total financial surveillance state.",
    countries: "China, Russia, Iran",
    likelihood: "Possible (crisis powers)",
    phaseColors: ["#dc2626", "#dc2626", "#ea580c", "#6b7280"],
    timeline: [
      {
        offset: 0,
        phase: "Onset",
        title: "Crisis Triggers",
        description:
          "Debt crosses 175%, unemployment hits 12%. Emergency powers declared. CBDC rollout accelerated. Bitcoin holdings subject to mandatory disclosure. Crackdown framed as 'financial stability.'",
      },
      {
        offset: 1,
        phase: "Crackdown",
        title: "Total Ban Enforcement",
        description:
          "Bitcoin criminalised with 10-year prison sentences. Self-custody wallets banned. All crypto exchanges shut down. CBDC becomes mandatory for wages, rent, and all transactions.",
      },
      {
        offset: 2,
        phase: "Resistance",
        title: "Black Markets Emerge",
        description:
          "Underground crypto economy persists. Capital flight to neighbouring countries via physical cash and hawala networks. Brain drain as tech workers emigrate. Surveillance infrastructure expanded.",
      },
      {
        offset: 4,
        phase: "Bifurcation",
        title: "Digital Iron Curtain",
        description:
          "World splits into CBDC bloc vs crypto-permissive bloc. Trade barriers. Parallel financial systems. Cold War 2.0 monetary structure with no interoperability between systems.",
      },
    ],
  },
  {
    id: "muddle",
    icon: "🇬🇧",
    title: "Muddle Through",
    description:
      "Tax crypto heavily, restrict self-custody, require KYC for all transactions. Slow capital flight continues. Decade-plus decline with no clear resolution.",
    countries: "UK, EU, Japan",
    likelihood: "Possible (risk averse)",
    phaseColors: ["#dc2626", "#ea580c", "#eab308", "#6b7280"],
    timeline: [
      {
        offset: 0,
        phase: "Onset",
        title: "Crisis Triggers",
        description:
          "Debt crosses 175%, unemployment hits 12%. Government deploys traditional tools: QE, mild austerity, 70% crypto capital gains tax. No structural reform. Kicking the can begins.",
      },
      {
        offset: 2,
        phase: "Erosion",
        title: "Gradual Decline",
        description:
          "Self-custody wallets banned. KYC required for all transactions. Black markets flourish. Capital flight 5% per year to Dubai/Singapore. Real wages falling steadily.",
      },
      {
        offset: 5,
        phase: "Stagnation",
        title: "Lost Half-Decade",
        description:
          "Real wages down 20%. Unemployment 15%. Inflation 6% persistent. Crypto adoption plateaus (black market only). No resolution in sight. Political gridlock prevents bold action.",
      },
      {
        offset: 10,
        phase: "Delayed Collapse",
        title: "Reckoning Arrives",
        description:
          "Debt reaches 280% GDP. System finally breaks. Forced into crisis resolution (default or hyperinflation). Everyone lost wealth slowly over a decade instead of quickly.",
      },
    ],
  },
  {
    id: "hub",
    icon: "🇦🇪",
    title: "Crypto Hub Strategy",
    description:
      "Small, nimble countries welcome crypto capital. Become regional financial hubs. Bitcoin as settlement layer. Regional winners in a fragmenting global system.",
    countries: "UAE, Singapore, El Salvador",
    likelihood: "Possible (small countries)",
    phaseColors: ["#dc2626", "#ea580c", "#16a34a", "#16a34a"],
    timeline: [
      {
        offset: 0,
        phase: "Opportunity",
        title: "Crisis Creates Opening",
        description:
          "As US debt crisis unfolds, small countries see chance to attract capital. Dubai, Singapore announce 'crypto safe haven' policies. First capital inflows begin before West reacts.",
      },
      {
        offset: 1,
        phase: "Capital Inflow",
        title: "Hub Magnetism",
        description:
          "$2 trillion flows from West to crypto-permissive hubs within 18 months. Tech workers, founders, capital relocate. Real estate booms in Dubai, Singapore. New financial infrastructure built rapidly.",
      },
      {
        offset: 3,
        phase: "Regional Dominance",
        title: "New Financial Centers",
        description:
          "UAE-Singapore corridor becomes global crypto settlement hub. Regional currencies peg to Bitcoin. BRICS+ countries route trade through hubs to bypass dollar clearing system.",
      },
      {
        offset: 5,
        phase: "Multipolar",
        title: "Fragmented World",
        description:
          "No single reserve currency. Regional blocs settle in Bitcoin. Hub countries thrive with low taxes and high inflows. West relatively poorer. Deglobalisation complete but new network emerges.",
      },
    ],
  },
];

// ─── PERSONAS ────────────────────────────────────────────────────────────────
// Timeline: { pathId: [ { offset, content }, ... ] }
// offset = years from collisionYear; absolute year computed at render.

const PERSONAS = [
  {
    id: "sf-engineer",
    flag: "🇺🇸",
    title: "Software Engineer",
    location: "San Francisco",
    starting:
      "Age 32. $180k salary at tech company. $320k in stocks/RSUs. $50k in Bitcoin (bought at $90k in 2027). Rents $3,500/month apartment. $45k student loans. No dependents.",
    timeline: {
      democratic: [
        {
          offset: 0,
          content:
            "Tech stocks crash 40% ($320k → $190k). Bitcoin spikes to $400k (nominal gain, purchasing power unclear). Rent stable at $3,500 but groceries +15%. Salary $180k but worried about AI displacement of junior devs on the team.",
        },
        {
          offset: 1,
          content:
            "Inflation 14%. Salary raised to $200k but real purchasing power = $130k (2026 dollars). Bitcoin now $800k nominal — cashed out 50% for house downpayment. Company offers 'BTC or USD?' salary option. 30% of team laid off (AI doing junior dev work).",
        },
        {
          offset: 3,
          content:
            "New government legalises Bitcoin as legal tender. Can pay rent and taxes in BTC directly. Bought house for $900k (50% down in BTC, 50% mortgage). Tech stocks recovering. Salary $220k, real = $160k. Kept job — senior enough that AI augments rather than replaces.",
        },
        {
          offset: 5,
          content:
            "Crisis moderating. Dual BTC/USD economy normalised. Home worth $1.1M. Remaining Bitcoin worth $600k. Net worth $1.5M despite crisis. Winner: held crypto early, had skills AI couldn't replace, bought real assets during chaos.",
        },
      ],
      authoritarian: [
        {
          offset: 0,
          content:
            "Tech stocks crash 40%. Bitcoin $400k nominal but rumours of ban circulating. Rent $3,500, groceries +15%. Salary $180k. Starts researching how to move assets offshore quickly.",
        },
        {
          offset: 1,
          content:
            "BITCOIN CRIMINALISED. Must sell or face 10 years prison. Forced to sell $800k BTC for $200k (price crashed after ban announcement). Lost 75% of crypto wealth. CBDC account mandatory — every purchase tracked by government.",
        },
        {
          offset: 2,
          content:
            "Tech company offers relocation to Singapore office — seriously considering it. Many colleagues already left. Can't move more than $50k/year offshore (capital controls). Feels trapped. Inflation still 10%.",
        },
        {
          offset: 4,
          content:
            "Stayed in US. CBDC system normalised but dystopian — government sees every transaction, can freeze account for 'non-approved' purchases. Net worth $400k (stocks recovered somewhat). Loser: crypto confiscated, freedom lost, wealth destroyed.",
        },
      ],
      muddle: [
        {
          offset: 0,
          content:
            "Tech stocks crash 40%. Bitcoin $400k but government announces 70% capital gains tax on crypto. Considering selling but tax would destroy most gains. Decides to hold and hope for policy change.",
        },
        {
          offset: 2,
          content:
            "Self-custody wallets banned. Must move BTC to regulated exchange (KYC required). Bitcoin $600k but can't sell without 70% tax hit. Salary $200k, real purchasing power = $140k. Inflation 8% ongoing.",
        },
        {
          offset: 5,
          content:
            "Bitcoin black market thriving but legally risky. Tech sector talent bleeding out to Dubai/Singapore. Salary $210k, real = $120k. Inflation 6% persistent. Bitcoin nominally $500k but effectively illiquid under current tax regime.",
        },
        {
          offset: 10,
          content:
            "Lost decade confirmed. Real wages down 30%. Bitcoin worth $800k but 70% tax still in effect. Net worth stagnant in real terms. Best engineers left for crypto-friendly countries. Loser: slow wealth destruction with no effective escape route.",
        },
      ],
      hub: [
        // TODO: add sf-engineer / hub path scenario
      ],
    },
  },
  {
    id: "london-doctor",
    flag: "🇬🇧",
    title: "Doctor",
    location: "London",
    starting:
      "Age 45. £95k NHS salary. £180k in pension. £60k savings. Owns £400k flat (£180k mortgage remaining). Married with 2 kids. No crypto holdings.",
    timeline: {
      democratic: [
        // TODO: add london-doctor / democratic path scenario
      ],
      authoritarian: [
        // TODO: add london-doctor / authoritarian path scenario
      ],
      muddle: [
        {
          offset: 0,
          content:
            "NHS pension value drops 25% (bond market crash). Savings losing 8% real value to inflation. Flat stable at £400k. Salary £95k but real purchasing power declining. No crypto exposure — completely missed the escape route.",
        },
        {
          offset: 2,
          content:
            "Inflation 10%. Salary raised to £105k but real = £85k (2026 pounds). Groceries +25%. NHS cuts mean longer hours for less real pay. Pension value still down 20%. Considered buying Bitcoin but 70% capital gains tax made it economically pointless.",
        },
        {
          offset: 5,
          content:
            "Real salary down 20% over 5 years. Pension will provide 40% less than planned. Kids' university costs up 40%. Forced to delay retirement by 5 years. Flat worth £450k but unclear what that means with ongoing purchasing power erosion.",
        },
        {
          offset: 10,
          content:
            "Lost decade confirmed. Real income down 30%. Pension crisis — may receive 50% of expected payout. NHS strained from budget cuts. Cannot afford retirement at 60 as planned. Loser: no escape route, public sector dependency, fixed income erosion.",
        },
      ],
      hub: [
        // TODO: add london-doctor / hub path scenario
      ],
    },
  },
  {
    id: "ohio-driver",
    flag: "🇺🇸",
    title: "Delivery Driver",
    location: "Ohio",
    starting:
      "Age 38. $52k/year driving for logistics company. $8k savings. Rents $1,200/month house. Married with 1 kid. No stocks, no crypto. High school education.",
    timeline: {
      democratic: [
        {
          offset: 0,
          content:
            "Job at risk — company testing autonomous delivery trucks. Rent still $1,200 but groceries +20%. Savings $8k earning 0.5% while inflation runs 8%. No stocks, no crypto — no assets to preserve wealth.",
        },
        {
          offset: 1,
          content:
            "LAID OFF — autonomous trucks deployed at scale. Unemployment benefit $420/week (replaces 40% of income, not 100%). Savings depleted in 4 months. Can't find equivalent work — AI displaced 25% of logistics jobs. Wife working two part-time jobs.",
        },
        {
          offset: 2,
          content:
            "Unemployment benefits expired. Took gig work at $15/hour (was making $25/hour equivalent before). Real income: $52k → $18k (job loss + inflation). Rent now $1,600. Medical insurance lost. Kid's school struggling with budget cuts.",
        },
        {
          offset: 5,
          content:
            "Crisis moderating but damage is permanent. Bitcoin is legal tender but don't own any. Still making $20/hour in gig economy. Real income permanently 60% lower. Moved to cheaper apartment. Loser: no assets, structural unemployment, no hedge available.",
        },
      ],
      authoritarian: [
        // TODO: add ohio-driver / authoritarian path scenario (CBDC adds surveillance to already dire situation)
      ],
      muddle: [
        // TODO: add ohio-driver / muddle path scenario (slow grind — same outcome, slower pace)
      ],
      hub: [
        // TODO: add ohio-driver / hub path scenario (not relevant — cannot afford to relocate to Dubai)
      ],
    },
  },
  {
    id: "shenzhen-engineer",
    flag: "🇨🇳",
    title: "AI Engineer",
    location: "Shenzhen",
    starting:
      "Age 29. ¥600k salary ($85k USD) at tech company. ¥800k in stocks. ¥200k in Bitcoin (bought secretly via VPN). Rents ¥8,000/month. Single. No debt.",
    timeline: {
      democratic: [
        // TODO: add shenzhen-engineer / democratic path scenario (shows unlikely China non-crackdown)
      ],
      authoritarian: [
        {
          offset: 0,
          content:
            "US crisis creates opportunity for China's tech sector. Company stocks stable (insulated from dollar turbulence). Bitcoin secretly worth ¥1.2M but illegal — kept in cold storage wallet. Government announces 'digital yuan only' policy incoming.",
        },
        {
          offset: 1,
          content:
            "BITCOIN ILLEGAL — 10 year prison for possession. Forced to abandon ¥1.2M in wallet (cannot sell without triggering arrest). Digital yuan CBDC mandatory for all transactions. Every purchase tracked. Salary ¥650k but all locked in digital yuan.",
        },
        {
          offset: 2,
          content:
            "CBDC normalised. Social credit score tied to spending patterns. Can't book international flights if spending labelled 'excessive.' AI work thriving (China gaining ground while US in crisis). Salary ¥750k. Considering emigration to Singapore.",
        },
        {
          offset: 4,
          content:
            "Digital iron curtain established. Cannot access Western financial system. China-Russia-Iran CBDC bloc vs West. High salary (¥900k) but no financial freedom. Lost: crypto wealth, privacy, right to emigrate. Gained: stable job in dominant geopolitical bloc.",
        },
      ],
      muddle: [
        // TODO: add shenzhen-engineer / muddle path scenario (very unlikely for China)
      ],
      hub: [
        {
          offset: 0,
          content:
            "Watching US crisis unfold. Considering relocation to Singapore before crackdown. Bitcoin ¥1.2M but illegal in China. Salary ¥600k. Contacted Singapore companies — two job offers received. Timing is critical: wait too long and capital controls will trap assets.",
        },
        {
          offset: 1,
          content:
            "RELOCATED to Singapore on tech visa before crackdown tightened. Moved ¥200k legally (maximum permitted). Transferred ¥1.2M in Bitcoin via self-custody wallet — no border officials can seize it. New salary SGD 180k ($135k USD). Singapore welcoming crypto talent openly.",
        },
        {
          offset: 3,
          content:
            "Singapore thriving as crypto hub. Bitcoin now worth SGD 800k. Real estate up 40%. Salary SGD 220k. Granted permanent residency. Former Shenzhen colleagues message constantly — trapped in CBDC surveillance with no exit.",
        },
        {
          offset: 5,
          content:
            "Winner. Escaped China CBDC crackdown, preserved Bitcoin wealth, Singapore hub provides: high salary, low taxes, financial freedom. Net worth SGD 1.2M. Made right decision to emigrate before the curtain fell.",
        },
      ],
    },
  },
  {
    id: "florida-retiree",
    flag: "🇺🇸",
    title: "Retiree",
    location: "Florida",
    starting:
      "Age 68, retired. $1.2M portfolio (60% stocks, 40% bonds). Withdrawing $60k/year (5% rule). Social Security $32k/year. Owns home outright. Married. No crypto. Healthcare via Medicare.",
    timeline: {
      democratic: [
        {
          offset: 0,
          content:
            "Portfolio crashes: stocks down 40%, bonds down 30% (yields spiked). Value: $1.2M → $780k. Can only safely withdraw $39k/year now (5% rule). Social Security COLA lags inflation by 18 months. Real income: $92k → $60k. Own home but property taxes up 30%.",
        },
        {
          offset: 1,
          content:
            "Inflation 14% eroding savings rapidly. Healthcare costs up 25% (Medicare cuts during debt crisis). Portfolio recovering slowly ($850k). Real income $55k. Cancelling travel, cutting expenses. No crypto — missed the escape route entirely.",
        },
        {
          offset: 3,
          content:
            "Portfolio $950k (stocks recovered, bonds still depressed). Bitcoin legal tender but own none. Real income $65k (2026 dollars) — 30% wealth destruction. May need part-time work if portfolio doesn't fully recover.",
        },
        {
          offset: 5,
          content:
            "Crisis moderating. Portfolio $1.1M. Survived but permanently poorer. Real income $70k — 24% worse off than pre-crisis in real terms. Healthcare costs still elevated. Loser: fixed income, no hard asset hedge, wealth gap widened further.",
        },
      ],
      authoritarian: [
        // TODO: add florida-retiree / authoritarian path scenario (CBDC controls spending categories — particularly dystopian for retirees)
      ],
      muddle: [
        // TODO: add florida-retiree / muddle path scenario (slow grind, may run out of money by age 78)
      ],
      hub: [
        // TODO: add florida-retiree / hub path scenario (not viable — too old and asset-poor to relocate)
      ],
    },
  },
  {
    id: "nyc-lawyer",
    flag: "🇺🇸",
    title: "Lawyer",
    location: "New York",
    starting: "// TODO: define starting position for nyc-lawyer",
    timeline: {
      democratic: [], // TODO
      authoritarian: [], // TODO
      muddle: [], // TODO
      hub: [], // TODO
    },
  },
  {
    id: "beijing-professor",
    flag: "🇨🇳",
    title: "Professor",
    location: "Beijing",
    starting: "// TODO: define starting position for beijing-professor",
    timeline: {
      democratic: [], // TODO
      authoritarian: [], // TODO
      muddle: [], // TODO
      hub: [], // TODO
    },
  },
  {
    id: "tokyo-student",
    flag: "🇯🇵",
    title: "Student",
    location: "Tokyo",
    starting: "// TODO: define starting position for tokyo-student",
    timeline: {
      democratic: [], // TODO
      authoritarian: [], // TODO
      muddle: [], // TODO
      hub: [], // TODO
    },
  },
  {
    id: "dubai-business",
    flag: "🇦🇪",
    title: "Business Owner",
    location: "Dubai",
    starting: "// TODO: define starting position for dubai-business",
    timeline: {
      democratic: [], // TODO
      authoritarian: [], // TODO
      muddle: [], // TODO
      hub: [], // TODO
    },
  },
];

// ─── CRISIS TYPES ────────────────────────────────────────────────────────────

const CRISIS_TYPES = [
  {
    icon: "⚡",
    type: "TYPE 1",
    name: "Fast Collapse",
    duration: "Months to 2 years",
    color: "#ef4444",
    bg: "rgba(220,38,38,0.08)",
    borderColor: "rgba(220,38,38,0.3)",
    examples: [
      { name: "Weimar Germany", year: "1923", duration: "10 months", detail: "Hyperinflation following French Ruhr occupation" },
      { name: "Argentina",      year: "2001", duration: "2 years",   detail: "Bank run, corralito, peso devaluation" },
      { name: "Asian Crisis",   year: "1997", duration: "18 months", detail: "Currency peg breaks, IMF intervention" },
    ],
    pattern: [
      "External shock triggers cascade (war, embargo, speculative attack)",
      "Fixed exchange rate breaks under pressure",
      "Bank runs, immediate capital flight",
      "Currency replacement within 1–2 years",
    ],
    classicBar: 100,
    aiBar: 70,
    classicLabel: "10 months–2 years",
    aiLabel: "6–16 months (30% faster)",
    aiMods: [
      "Unemployment spikes deeper — AI displacement adds structural job losses on top of crisis-driven layoffs",
      "Deflation persists during hyperinflation — AI keeps costs falling while currency collapses",
      "Safety nets overwhelmed — government cannot tax AI productivity to fund displaced workers",
    ],
    cryptoMods: [
      "Capital flight instant — seconds to move Bitcoin vs weeks to smuggle gold",
      "Bank freezes partially bypassable — crypto wallets outside deposit system",
      "Organic currency substitution already underway before crisis peak",
    ],
    deepDive: {
      title: "Weimar Hyperinflation (1923)",
      timeline: [
        { date: "Jan 1923", event: "French occupy Ruhr, passive resistance funded by printing" },
        { date: "Aug 1923", event: "1 USD = 4.6 million marks" },
        { date: "Nov 1923", event: "1 USD = 4.2 trillion marks (peak)" },
        { date: "Nov 15 1923", event: "Rentenmark introduced; old currency abandoned" },
      ],
      outcome: "10 months acute hyperinflation. Complete currency replacement. Wealth transferred from bondholders and cash-holders to real asset holders.",
      lesson: "Speed and severity exceeded all government models. No policy intervention halted the collapse once confidence broke.",
    },
  },
  {
    icon: "📉",
    type: "TYPE 2",
    name: "Slow Decline",
    duration: "Decades",
    color: "#eab308",
    bg: "rgba(234,179,8,0.08)",
    borderColor: "rgba(234,179,8,0.3)",
    examples: [
      { name: "British Pound",      year: "1914–1971", duration: "57 years", detail: "WWI debt spiral, managed handoff to dollar" },
      { name: "Portuguese Escudo",  year: "1960–1999", duration: "39 years", detail: "Gradual devaluation, eventual euro adoption" },
    ],
    pattern: [
      "External manager coordinates transition (US managed British decline via Bretton Woods)",
      "Floating exchange rate allows gradual devaluation without acute crisis",
      "Deep bond markets absorb selling pressure over years",
      "Cooperative handoff to a willing and capable successor",
    ],
    classicBar: 100,
    aiBar: 40,
    classicLabel: "40–60 years",
    aiLabel: "8–15 years (AI compression)",
    aiMods: [
      "Mass unemployment destabilises politics faster — Britain's slow decline required stable employment. AI displacement removes that buffer.",
      "Tax base erosion accelerates — AI productivity gains don't translate to wage income, shrinking revenues faster",
    ],
    cryptoMods: [
      "No captive bond market — British citizens were trapped in sterling bonds. Modern savers have a non-sovereign exit.",
      "Front-running removes the time buffer — gradual devaluation gets front-run by capital that exits early via crypto",
    ],
    deepDive: {
      title: "British Pound Decline (1914–1971)",
      timeline: [
        { date: "1914–1918", event: "WWI debt explosion: Debt/GDP 25% → 140%" },
        { date: "1931",       event: "Forced off gold standard — first acute crisis" },
        { date: "1944",       event: "Bretton Woods: dollar becomes co-reserve" },
        { date: "1956",       event: "Suez Crisis: US forces devaluation" },
        { date: "1967",       event: "Final devaluation; reserve status lost" },
      ],
      outcome: "57 years from debt crisis to full reserve loss. Largest economy of its era managed an orderly transition because the US actively coordinated it.",
      lesson: "No such external manager exists for the US dollar today. China is non-convertible; Europe is structurally weak. The Type 2 path requires a Bretton Woods-style framework that has no modern equivalent.",
    },
  },
  {
    icon: "🌀",
    type: "TYPE 3",
    name: "Chaotic Transition",
    duration: "5–15 years",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.06)",
    borderColor: "rgba(139,92,246,0.3)",
    examples: [
      { name: "Dutch Guilder", year: "1780–1795", duration: "15 years", detail: "Military defeat, no external manager, French invasion" },
      { name: "Soviet Ruble",  year: "1989–1998", duration: "9 years",  detail: "Political collapse, dollar adoption, IMF bailout" },
    ],
    pattern: [
      "No external manager available to coordinate transition",
      "Multiple failed stabilisation attempts before final collapse",
      "Political rupture or regime change accelerates timeline",
      "Fragmented successor landscape — no single reserve currency replacement",
    ],
    classicBar: 100,
    aiBar: 55,
    classicLabel: "9–15 years",
    aiLabel: "4–7 years (SPICE base case)",
    aiMods: [
      "AI unemployment reaches 12–20% — historical precedent: this triggers regime change within a decade, not patience",
      "Ghost GDP (productivity gains that don't appear in wages) destroys political legitimacy faster than visible GDP decline",
    ],
    cryptoMods: [
      "Digital capital flight compresses 15-year guilder pattern to 5–7 years — Dutch wealth took months to smuggle to London",
      "Multipolar fragmentation + crypto as neutral settlement layer emerges by default — no single successor needed",
    ],
    deepDive: {
      title: "Dutch Guilder Collapse (1780–1795)",
      timeline: [
        { date: "1770s",      event: "Debt/GDP exceeds 150% from Anglo-Dutch wars" },
        { date: "1780–1784",  event: "Fourth Anglo-Dutch War — military defeat exposes fiscal weakness" },
        { date: "1787",       event: "Civil unrest; Prussian intervention requested" },
        { date: "1795",       event: "French invasion; Batavian Republic formed; guilder effectively dead" },
      ],
      outcome: "15 years from crisis onset to collapse. British pound absorbed reserve functions. Dutch bondholders suffered severe haircuts.",
      lesson: "The most relevant historical analogue for the US: large, sophisticated economy with deep debt burden and no willing external manager to coordinate transition. The absence of a Bretton Woods framework is the critical missing piece.",
    },
  },
];

const DEEP_DIVES = [
  {
    icon: "🇩🇪",
    title: "Weimar Hyperinflation (Jan–Nov 1923)",
    timeline: [
      { date: "Jan 1923",     event: "French and Belgian troops occupy Ruhr industrial region to extract war reparations" },
      { date: "Jan–Jul 1923", event: "German government funds 'passive resistance' by printing marks. Inflation accelerates from 100% to 10,000% annually." },
      { date: "Aug 1923",     event: "Acceleration: 1 USD = 4.6 million marks. Prices changing hourly." },
      { date: "Oct 1923",     event: "Wheelbarrows of cash to buy bread. Real wages near zero." },
      { date: "Nov 1923",     event: "Peak: 1 USD = 4.2 trillion marks. Bank of England refuses further lending." },
      { date: "Nov 15 1923",  event: "Rentenmark introduced at 1:1,000,000,000,000. Old currency worthless." },
    ],
    outcome: "Winners: Real asset holders (farmland, factories, foreign currency). Losers: Middle class savers, bondholders, pensioners (savings destroyed).",
  },
  {
    icon: "🇬🇧",
    title: "British Pound Decline (1914–1971)",
    timeline: [
      { date: "1914–1918", event: "WWI: Debt/GDP rises from 25% to 140%. Gold standard suspended." },
      { date: "1925",      event: "Churchill returns to gold at pre-war parity — misjudged, causes deflation." },
      { date: "1931",      event: "Great Depression: forced off gold standard. First acute crisis." },
      { date: "1944",      event: "Bretton Woods: dollar pegged to gold, sterling pegged to dollar." },
      { date: "1956",      event: "Suez Crisis: US refuses to support pound, forces withdrawal." },
      { date: "1967",      event: "Final devaluation from $2.80 to $2.40. Reserve status lost." },
      { date: "1971",      event: "Nixon ends Bretton Woods. Dollar also unpegged from gold." },
    ],
    outcome: "57-year managed decline. Possible only because the US actively supported the transition via Marshall Plan, Bretton Woods, and ongoing credit facilities.",
  },
  {
    icon: "🇳🇱",
    title: "Dutch Guilder Collapse (1780–1795)",
    timeline: [
      { date: "1650–1780",  event: "Dutch Republic at peak: world's financial centre, Debt/GDP manageable via trade surpluses." },
      { date: "1780–1784",  event: "Fourth Anglo-Dutch War: British blockade destroys trade. Debt spirals." },
      { date: "1784–1787",  event: "Multiple failed stabilisation attempts. Capital flight to London." },
      { date: "1787",       event: "Prussian military intervention to restore order — temporary." },
      { date: "1795",       event: "French invasion: Batavian Republic. Guilder ceases to function. British pound absorbs reserve role." },
    ],
    outcome: "15 years. Most relevant precedent for the US: large sophisticated creditor economy that lost reserve status with no external manager to coordinate a soft landing.",
  },
  {
    icon: "🇦🇷",
    title: "Argentina Default (1999–2002)",
    timeline: [
      { date: "1999",      event: "Convertibility (peso pegged 1:1 to dollar) under severe strain. Recession deepens." },
      { date: "2001 Mar",  event: "Economy minister resigns. IMF suspends support." },
      { date: "2001 Nov",  event: "Corralito: deposits frozen. Bank runs begin." },
      { date: "2001 Dec",  event: "President de la Rúa resigns. Five presidents in 10 days." },
      { date: "2002 Jan",  event: "Convertibility abandoned. Peso devalued 75%. Debt restructured ($100B default)." },
      { date: "2002–2003", event: "Economic contraction 10.9%. Unemployment peaks 21.5%." },
    ],
    outcome: "2 years from stress to resolution. Largest sovereign default in history at the time. Middle class savings destroyed by forced peso conversion from dollar accounts.",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getTypeName(type) {
  return { 1: "Fast Collapse", 2: "Slow Decline", 3: "Chaotic Transition (AI-Accelerated)" }[type] || "Unknown";
}

function getTypeExplanation(type, ai, crypto) {
  if (type === 3) {
    return `AI displacement (${ai ?? "?"}%) prevents inflating away debt — the traditional escape route. Crypto flight (${crypto ?? "?"}%) prevents trapping capital via controls. Multiple policy attempts with partial effectiveness. Timeline compressed from 15–50 years (historical) to 5–10 years by digital-era dynamics.`;
  }
  if (type === 1) {
    return `High crypto flight (${crypto ?? "?"}%) with ${ai ?? "?"}% AI displacement creates conditions for rapid, acute collapse. Speed of digital capital flight removes the weeks-long buffer that historical fast collapses relied on. Expect 6–16 months from onset to resolution.`;
  }
  return `Lower AI displacement (${ai ?? "?"}%) suggests partial capacity to inflate away debt. However, crypto flight (${crypto ?? "?"}%) front-runs any managed decline. Without an external manager equivalent to the US in 1944, the historical 40–60 year pattern compresses to 8–15 years.`;
}

// ─── CRISIS CARD COMPONENT ───────────────────────────────────────────────────

function CrisisCard({ ct, active }) {
  const [open, setOpen] = useState(false);
  const borderColor = active ? ct.color : ct.borderColor;
  const S = {
    card: { background: "#0f1520", border: `${active ? 2 : 1}px solid ${borderColor}`, display: "flex", flexDirection: "column" },
    header: { background: ct.bg, borderBottom: `1px solid ${ct.borderColor}`, padding: "20px 20px 16px", textAlign: "center" },
    icon: { fontSize: 32, marginBottom: 8 },
    type: { fontSize: 8, fontWeight: 700, color: ct.color, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 3 },
    name: { fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 4 },
    dur:  { fontSize: 9, color: "#4a5878" },
    body: { padding: "16px 18px", flex: 1 },
    sHead: { fontSize: 8, fontWeight: 700, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7, marginTop: 14 },
    ex:   { fontSize: 9, color: "#8899bb", lineHeight: 1.7, marginBottom: 4 },
    exName: { fontWeight: 700, color: "#e8eaf0" },
    exDetail: { color: "#4a5878", fontSize: 8 },
    bullet: { fontSize: 10, color: "#c8d0e0", lineHeight: 1.7, marginBottom: 3, paddingLeft: 12, position: "relative" },
    dot: { position: "absolute", left: 0, color: ct.color },
    barWrap: { background: "#141c2e", padding: "10px 12px", marginTop: 12, marginBottom: 4 },
    barLabel: { fontSize: 7, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 },
    barTrack: { background: "#1e2a42", height: 12, borderRadius: 2, marginBottom: 6, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 2, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 7, fontWeight: 700, color: "#fff" },
    mod: { background: ct.bg, padding: "10px 12px", marginTop: 8 },
    modHead: { fontSize: 8, fontWeight: 700, color: ct.color, marginBottom: 5 },
    toggle: { fontSize: 8, color: ct.color, cursor: "pointer", background: "none", border: "none", fontFamily: F, padding: "8px 0", textDecoration: "underline" },
    dive: { borderTop: `1px solid ${ct.borderColor}`, padding: "12px 18px", background: ct.bg },
    diveT: { fontSize: 8, color: "#8899bb", lineHeight: 1.8 },
  };

  return (
    <div style={S.card}>
      {active && (
        <div style={{ background: ct.color, color: "#fff", fontSize: 7, fontWeight: 700, textAlign: "center", padding: "4px 0", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ◈ YOUR SCENARIO
        </div>
      )}
      <div style={S.header}>
        <div style={S.icon}>{ct.icon}</div>
        <div style={S.type}>{ct.type}</div>
        <div style={S.name}>{ct.name}</div>
        <div style={S.dur}>{ct.duration}</div>
      </div>
      <div style={S.body}>
        <div style={S.sHead}>Historical Examples</div>
        {ct.examples.map(ex => (
          <div key={ex.name} style={S.ex}>
            <span style={S.exName}>{ex.name} ({ex.year})</span> — {ex.duration}
            <div style={S.exDetail}>{ex.detail}</div>
          </div>
        ))}
        <div style={S.sHead}>Classic Pattern</div>
        {ct.pattern.map((p, i) => (
          <div key={i} style={S.bullet}><span style={S.dot}>→</span>{p}</div>
        ))}
        <div style={S.barWrap}>
          <div style={S.barLabel}>Timeline Comparison</div>
          <div style={{ ...S.barLabel, marginBottom: 2 }}>Classic</div>
          <div style={S.barTrack}>
            <div style={{ ...S.barFill, width: `${ct.classicBar}%`, background: "#2a3a5c" }}>{ct.classicLabel}</div>
          </div>
          <div style={{ ...S.barLabel, marginBottom: 2 }}>AI / Crypto Era</div>
          <div style={S.barTrack}>
            <div style={{ ...S.barFill, width: `${ct.aiBar}%`, background: ct.color }}>{ct.aiLabel}</div>
          </div>
        </div>
        <div style={S.mod}>
          <div style={S.modHead}>🤖 AI Modifications</div>
          {ct.aiMods.map((m, i) => (
            <div key={i} style={{ ...S.bullet, fontSize: 9 }}><span style={S.dot}>•</span>{m}</div>
          ))}
        </div>
        <div style={{ ...S.mod, marginTop: 6 }}>
          <div style={S.modHead}>₿ Crypto Modifications</div>
          {ct.cryptoMods.map((m, i) => (
            <div key={i} style={{ ...S.bullet, fontSize: 9 }}><span style={S.dot}>•</span>{m}</div>
          ))}
        </div>
        <button style={S.toggle} onClick={() => setOpen(o => !o)}>
          {open ? "▲ Hide" : "▼ Historical deep dive"}
        </button>
      </div>
      {open && (
        <div style={S.dive}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>{ct.deepDive.title}</div>
          {ct.deepDive.timeline.map((t, i) => (
            <div key={i} style={S.diveT}>
              <span style={{ fontWeight: 700, color: "#8899bb" }}>{t.date}</span> — {t.event}
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 9, color: "#8899bb", lineHeight: 1.7, borderTop: "1px solid #e5e5e5", paddingTop: 8 }}>
            {ct.deepDive.outcome}
          </div>
          <div style={{ marginTop: 6, fontSize: 9, color: "#4a5878", lineHeight: 1.7, fontStyle: "italic" }}>
            {ct.deepDive.lesson}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE DOT COLORS ────────────────────────────────────────────────────────

const PHASE_DOT_COLORS = ["#dc2626", "#ea580c", "#ea580c", "#eab308"];

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function CrisisScenarios() {
  const [searchParams] = useSearchParams();
  const [selectedPath,    setSelectedPath]    = useState("democratic");
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showMechanics,   setShowMechanics]   = useState(false);
  const [openDives,       setOpenDives]       = useState({});

  // ── Parse URL params ──────────────────────────────────────────────────────
  const collisionYear  = parseInt(searchParams.get("collisionYear"))  || null;
  const crisisType     = parseInt(searchParams.get("crisisType"))     || 3;
  const debt           = parseFloat(searchParams.get("debt"))         || null;
  const unemp          = parseFloat(searchParams.get("unemp"))        || null;
  const infl           = parseFloat(searchParams.get("infl"))         || null;
  const yields         = parseFloat(searchParams.get("yields"))       || null;
  const crypto         = parseFloat(searchParams.get("crypto"))       || null;
  const gini           = parseFloat(searchParams.get("gini"))         || null;
  const ai             = parseInt(searchParams.get("ai"))             || null;
  const hasParams      = !!collisionYear;

  // Fallback year for timeline display when no params
  const cy = collisionYear ?? 2029;

  const path    = GOV_PATHS.find(p => p.id === selectedPath);
  const persona = PERSONAS.find(p => p.id === selectedPersona);
  const personaTimeline = persona ? (persona.timeline[selectedPath] ?? []) : [];

  return (
    <div style={{ background: BG0, color: T1, fontFamily: F, maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 800, marginBottom: hasParams ? 32 : 40 }}>
        <div style={{ fontSize: 9, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 8 }}>
          SPICE Research — Government Response Paths &amp; Personal Impact
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px", fontFamily: F, lineHeight: 1.2 }}>
          Crisis <span style={{ color: "#c8a96e" }}>Scenarios</span>
        </h1>
        {hasParams ? (
          <p style={{ fontSize: 12, color: "#8899bb", lineHeight: 1.8, margin: 0 }}>
            Your simulation triggered The Collision in <strong>{collisionYear}</strong>. Below: four government response paths, their crisis timelines, and what they mean for nine different household situations.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 12, color: "#8899bb", lineHeight: 1.8, margin: "0 0 16px" }}>
              When a reserve currency fails, governments choose between four response paths. Each path produces different outcomes for different people. Select a path to see the crisis timeline; select a persona to see year-by-year personal impact.
            </p>
            <div style={{ background: "#080c16", border: "1px solid #e2e2e2", padding: "10px 14px", fontSize: 10, color: "#4a5878" }}>
              Run the{" "}
              <Link to="/collision" style={{ color: "#c8a96e" }}>simulation</Link>
              {" "}first to see this page populated with your specific crisis data.
            </div>
          </>
        )}
      </div>

      {/* ── CRISIS BANNER ──────────────────────────────────────────────── */}
      {hasParams && (
        <div style={{
          background: "rgba(220,38,38,0.08)",
          border: "2px solid #dc2626",
          borderLeft: "8px solid #dc2626",
          padding: "24px 28px",
          marginBottom: 28,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>⚠</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#dc2626", letterSpacing: "0.04em", marginBottom: 4 }}>
                THE COLLISION — {collisionYear}
              </div>
              <div style={{ fontSize: 10, color: "#8899bb", lineHeight: 1.7 }}>
                Crisis triggered when debt crossed 175%
                {ai ? ` with ${ai}% AI displacement` : ""}
                {crypto ? ` and ${crypto}% crypto flight` : ""}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {[
              { label: "Debt/GDP",     value: debt ? `${debt}%` : "—",    color: "#dc2626" },
              { label: "Unemployment", value: unemp ? `${unemp}%` : "—",  color: "#dc2626" },
              { label: "Inflation",    value: infl ? `${infl}%` : "—",    color: "#ea580c" },
              { label: "Bond Yields",  value: yields ? `${yields}%` : "—", color: "#ea580c" },
              { label: "Crypto Flight",value: crypto ? `${crypto}%` : "—", color: "#dc2626" },
              { label: "Gini Coeff",   value: gini ? gini.toFixed(2) : "—", color: "#dc2626" },
            ].map(k => (
              <div key={k.label} style={{ background: "#0f1520", border: "1px solid rgba(220,38,38,0.3)", padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  {k.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CRISIS TYPE CARD ───────────────────────────────────────────── */}
      {hasParams && (
        <div style={{ background: "rgba(220,38,38,0.08)", border: "2px solid #dc2626", padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ background: "#dc2626", color: "#fff", padding: "5px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              TYPE {crisisType}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{getTypeName(crisisType)}</div>
          </div>
          <div style={{ fontSize: 11, color: "#8899bb", lineHeight: 1.8 }}>
            Your scenario most closely resembles <strong>Type {crisisType}: {getTypeName(crisisType)}</strong>.{" "}
            {getTypeExplanation(crisisType, ai, crypto)}
          </div>
        </div>
      )}

      {/* ── GOVERNMENT RESPONSE PATH SELECTION ────────────────────────── */}
      <div style={{ background: "rgba(234,179,8,0.08)", border: "2px solid #eab308", padding: "22px 24px", marginBottom: 28 }}>
        <div style={{ fontSize: 9, color: "#d4a017", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>
          Government Response Strategy
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
          Select a Response Path
        </div>
        <div style={{ fontSize: 10, color: "#8899bb", lineHeight: 1.7, marginBottom: 18 }}>
          Four plausible government responses to a debt/AI/crypto collision. In reality, governments may attempt multiple strategies or be forced into specific paths by political constraints. Select to see the crisis timeline and personal outcomes for each path.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          {GOV_PATHS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPath(p.id)}
              style={{
                background: selectedPath === p.id ? "rgba(234,179,8,0.08)" : "#0f1520",
                border: `2px solid ${selectedPath === p.id ? "#eab308" : "#2a3a5c"}`,
                padding: "14px 16px",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: F,
                boxShadow: selectedPath === p.id ? "0 2px 12px rgba(234,179,8,0.3)" : "none",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e8eaf0", marginBottom: 5 }}>{p.title}</div>
              <div style={{ fontSize: 9, color: "#8899bb", lineHeight: 1.6, marginBottom: 8 }}>{p.description}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[p.countries, p.likelihood].map(tag => (
                  <span key={tag} style={{ fontSize: 7, color: "#4a5878", background: "#f3f4f6", padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── CRISIS TIMELINE ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 9, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>
          Crisis Progression
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>
          Timeline: {path.title}
        </div>
        <div style={{ fontSize: 10, color: "#4a5878", marginBottom: 20 }}>
          {path.timeline.length}-phase progression for this government response strategy
        </div>

        {/* Gradient track */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #dc2626 0%, #dc2626 30%, #ea580c 30%, #ea580c 70%, #eab308 70%, #eab308 100%)", borderRadius: 3, margin: "0 0 32px" }} />

        {/* Phase cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {path.timeline.map((phase, idx) => {
            const dotColor = path.phaseColors[idx] ?? "#eab308";
            return (
              <div key={idx} style={{ position: "relative", background: "#0f1520", border: "2px solid #e2e2e2", padding: "18px 16px" }}>
                {/* connecting dot */}
                <div style={{
                  position: "absolute", top: -23, left: "50%", transform: "translateX(-50%)",
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#0f1520", border: `3px solid ${dotColor}`,
                }} />
                <div style={{ fontSize: 8, color: dotColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  {cy + phase.offset} — {phase.phase}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
                  {phase.title}
                </div>
                <div style={{ fontSize: 9, color: "#8899bb", lineHeight: 1.7 }}>
                  {phase.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PERSONAL IMPACT SCENARIOS ──────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 9, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>
          Personal Impact
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
          What This Means For You
        </div>
        <div style={{ fontSize: 10, color: "#8899bb", lineHeight: 1.7, marginBottom: 20 }}>
          Select a persona to see year-by-year impact under the <strong>{path.title}</strong> government response path. Scenarios are illustrative based on typical situations for each profile.
        </div>

        {/* Persona selector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 24 }}>
          {PERSONAS.map(p => {
            const isActive = selectedPersona === p.id;
            const hasContent = (p.timeline[selectedPath] ?? []).length > 0;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(prev => prev === p.id ? null : p.id)}
                style={{
                  background: isActive ? "rgba(220,38,38,0.08)" : "#0f1520",
                  border: `2px solid ${isActive ? "#dc2626" : "#1e2a42"}`,
                  padding: "14px 12px",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: F,
                  opacity: hasContent ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{p.flag}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#e8eaf0", marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 8, color: "#4a5878" }}>{p.location}</div>
                {!hasContent && (
                  <div style={{ fontSize: 7, color: "#4a5878", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    coming soon
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Scenario card */}
        {selectedPersona && persona && (() => {
          const timeline = persona.timeline[selectedPath] ?? [];
          return (
            <div style={{ background: "#0f1520", border: "2px solid #dc2626", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 28 }}>{persona.flag}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0" }}>
                    {persona.title} — {persona.location}
                  </div>
                  <div style={{ fontSize: 9, color: "#4a5878", marginTop: 2 }}>
                    Under: {path.icon} {path.title}
                  </div>
                </div>
              </div>

              {/* Starting position */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  Starting Position (pre-crisis)
                </div>
                <div style={{ fontSize: 10, color: "#c8d0e0", lineHeight: 1.8, background: "#080c16", padding: "10px 14px", border: "1px solid #ebebeb" }}>
                  {persona.starting.startsWith("// TODO") ? (
                    <span style={{ color: "#4a5878" }}>Starting position not yet defined for this persona.</span>
                  ) : persona.starting}
                </div>
              </div>

              {/* Year-by-year */}
              {timeline.length > 0 ? (
                timeline.map((entry, idx) => {
                  const yearColors = ["#dc2626", "#ea580c", "#ea580c", "#eab308", "#4a5878"];
                  const yc = yearColors[Math.min(idx, yearColors.length - 1)];
                  return (
                    <div key={idx} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: idx < timeline.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: yc, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                        {cy + entry.offset}
                      </div>
                      <div style={{ fontSize: 10, color: "#c8d0e0", lineHeight: 1.8 }}>{entry.content}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 10, color: "#4a5878", fontStyle: "italic", padding: "16px 0" }}>
                  Scenario content not yet available for this persona × path combination.
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── MARKET MECHANICS ACCORDION ─────────────────────────────────── */}
      <div style={{ marginBottom: 40, border: "1px solid #e2e2e2" }}>
        <button
          onClick={() => setShowMechanics(m => !m)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: "14px 18px", background: "#080c16",
            border: "none", cursor: "pointer", fontFamily: F, textAlign: "left",
          }}
        >
          <div>
            <div style={{ fontSize: 9, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>
              Bond Market Mechanics
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#e8eaf0" }}>
              Understanding What "Bond Market Meltdown" Actually Means
            </div>
          </div>
          <span style={{ fontSize: 12, color: "#4a5878", marginLeft: 12 }}>{showMechanics ? "▲" : "▼"}</span>
        </button>

        {showMechanics && (
          <div style={{ padding: "20px 22px", borderTop: "1px solid #e2e2e2" }}>
            {[
              {
                title: "Normal Times (Pre-Crisis)",
                items: [
                  "US 10-year Treasury yields 4.1% — considered 'risk-free rate', safest asset on Earth",
                  "Foreign holders: China ~$770B, Japan ~$1.1T",
                  "Fed balance sheet: ~$7 trillion",
                  "Global financial system prices everything relative to this rate",
                ],
              },
              {
                title: `Crisis Begins (${cy})`,
                items: [
                  `Yields spike to ${yields ? `${yields}%` : "7–9%"} — bond prices crash (inverse relationship)`,
                  "Foreign holders dump — China/Japan sell $400B+ in months",
                  "Death spiral: Higher yields → Higher debt service costs → Larger deficit → More issuance → Even higher yields",
                  `At ${yields ?? 8}% on $35T debt = $${((35 * (yields ?? 8)) / 100).toFixed(1)}T/year in interest alone vs ~$5T total federal revenue`,
                  "Government literally cannot afford market rates — financial repression becomes inevitable",
                ],
              },
              {
                title: "Fed Response: Yield Curve Control (YCC)",
                items: [
                  "\"We will buy unlimited Treasuries to keep yields at 4.5%\"",
                  "Printing money to buy bonds no one else wants to hold",
                  "Fed balance sheet: $7T → $15T → $25T within 2–3 years",
                  "Result: inflation (money printing) + recession (unemployment) simultaneously",
                  "Japan ran YCC 2016–2023; eventual collapse forced abandonment",
                ],
              },
              {
                title: "Why Traditional Hedges Fail",
                items: [
                  "TIPS? Counterparty risk — can government pay inflation adjustments when broke?",
                  "Gold ETFs? Counterparty risk — can you redeem for physical during crisis?",
                  "Stocks? Earnings collapse from recession + inflation destroys price multiples",
                  "Cash? Inflating at 12–14%/year under YCC",
                  "What works: physical gold, physical Bitcoin with self-custody (not ETF/exchange)",
                ],
              },
            ].map(section => (
              <div key={section.title} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#e8eaf0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  {section.title}
                </div>
                {section.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 10, color: "#c8d0e0", lineHeight: 1.7, marginBottom: 3, paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "#c8a96e" }}>◈</span>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CRISIS TYPES REFERENCE ─────────────────────────────────────── */}
      <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: 36, marginBottom: 48 }}>
        <div style={{ fontSize: 9, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
          Historical Framework
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Three Crisis Types
        </div>
        <p style={{ fontSize: 11, color: "#8899bb", lineHeight: 1.8, maxWidth: 780, marginBottom: 24 }}>
          Ray Dalio's 500-year analysis identifies three distinct patterns for reserve currency transitions. AI displacement and crypto capital flight modify each pattern — compressing timelines and removing the policy buffers that made historical managed transitions possible.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {CRISIS_TYPES.map(ct => (
            <CrisisCard key={ct.type} ct={ct} active={hasParams && parseInt(ct.type.replace("TYPE ", "")) === crisisType} />
          ))}
        </div>
      </div>

      {/* ── BEYOND THE CRISIS ──────────────────────────────────────────── */}
      <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: 36, marginBottom: 48 }}>
        <div style={{ fontSize: 9, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
          Post-Crisis — Speculative
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Beyond the Crisis: The Monetary Reset Question
        </div>
        <p style={{ fontSize: 11, color: "#8899bb", lineHeight: 1.8, marginBottom: 10, maxWidth: 780 }}>
          This simulation models the crisis itself — the collision between unsustainable sovereign debt, AI-driven deflation, and crypto-enabled capital flight. What comes after is deliberately out of scope.
        </p>
        <div style={{ background: "#080c16", border: "1px solid #e2e2e2", padding: "12px 16px", fontSize: 10, color: "#8899bb", lineHeight: 1.8, marginBottom: 28, maxWidth: 780 }}>
          <strong style={{ color: "#e8eaf0" }}>We make no prediction.</strong> History shows reserve currency transitions resolve in unexpected ways. Three scenarios — all possible, none certain.
        </div>

        {[
          {
            num: "01", icon: "₿", title: "The Bitcoin Standard", sub: "Permissionless Reset",
            color: "#f59e0b", bg: "rgba(234,179,8,0.08)", border: "#fde68a",
            analog: "Gold Standard 1870s — countries chose it voluntarily for credibility",
            thesis: "Bitcoin becomes the global reserve because it is the only credible neutral option — neither US nor China controls it, its supply is fixed, and by 2034–35 network effects from crisis adoption make it the path-dependent choice.",
            pros: ["Post-crisis populations demand sound money — historical pattern after hyperinflation", "Neutrality — no nation controls it, acceptable compromise in multipolar world", "Network effects — 40–60% already using = liquidity, infrastructure, familiarity", "Can't be suspended by any government — unlike gold standard abandoned in wartime"],
            cons: ["Governments lose monetary control — existential threat, fierce resistance", "Volatility remains high — problematic for reserve currency function", "Coordination problem — who moves first? First-mover political risk", "Authoritarian rejection — China, Russia refuse to participate"],
            timeline: "2033: Political capitulation in democracies · 2034: First major economy adopts · 2035–38: Global cascade",
          },
          {
            num: "02", icon: "🌐", title: "Multipolar Fragmentation", sub: "No Single Reserve",
            color: "#3b82f6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.3)",
            analog: "Pre-1914 system — British pound, French franc, German mark all functioned as reserves; gold was the neutral settlement layer",
            thesis: "No single reserve emerges. Dollar weakened, yuan constrained, euro structural. Bitcoin becomes the neutral settlement layer between regional blocs — not a global reserve but a bridge.",
            pros: ["Reflects geopolitical reality — multipolar world, no single hegemon prepared", "Bitcoin acceptable to all sides — neutral, no political strings attached", "Allows domestic monetary control — governments keep fiat for local use", "Pragmatic compromise — doesn't require full Bitcoin standard"],
            cons: ["High coordination costs — multiple currencies create friction and complexity", "Volatility problematic for daily trade settlement", "Unstable equilibrium — tends to collapse into Scenario 1 or 3 over time", "Nationalist resistance — governments prefer full monetary sovereignty"],
            timeline: "2029–35: Regional blocs solidify · 2033–36: Bitcoin emerges as neutral settlement · 2040+: Fragmented equilibrium",
          },
          {
            num: "03", icon: "🔒", title: "CBDC Authoritarianism", sub: "Bifurcated World",
            color: "#64748b", bg: "#0f1520", border: "#2a3a5c",
            analog: "Cold War monetary split — dollar bloc vs ruble bloc; two incompatible systems, limited interchange",
            thesis: "Authoritarian states enforce Central Bank Digital Currencies. Democratic states capitulate to voter pressure and legalise crypto. Result: a digital iron curtain splitting the global monetary system.",
            pros: ["China demonstrates enforcement can work — 2021 crypto ban partially succeeded domestically", "CBDCs attractive to autocrats — surveillance, programmable controls, capital management", "Democratic voter pressure forces crypto adoption — political survival requires it", "Reflects existing ideological divide between authoritarian and democratic systems"],
            cons: ["Brain drain unsustainable — talent and capital flee the authoritarian bloc", "Underground markets persist — even China cannot fully suppress crypto", "Economic underperformance — closed systems lose to open crypto economies over time", "Authoritarian holdouts eventually forced to engage or fall irreversibly behind"],
            timeline: "2030–35: CBDC enforcement in authoritarian states · 2033–36: Democratic crypto legalisation · 2037+: Bifurcated equilibrium",
          },
        ].map(sc => (
          <div key={sc.num} style={{ border: `1px solid ${sc.border}`, marginBottom: 16, background: "#0f1520" }}>
            <div style={{ background: sc.bg, borderBottom: `1px solid ${sc.border}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{sc.icon}</span>
              <div>
                <div style={{ fontSize: 8, color: sc.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>
                  Scenario {sc.num} — {sc.sub}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0" }}>{sc.title}</div>
              </div>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 10, color: "#8899bb", lineHeight: 1.8, marginBottom: 12 }}>{sc.thesis}</div>
              <div style={{ fontSize: 8, color: "#4a5878", fontStyle: "italic", marginBottom: 14, paddingLeft: 10, borderLeft: `2px solid ${sc.color}40` }}>
                Historical analogue: {sc.analog}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why it could work</div>
                  {sc.pros.map((p, i) => (
                    <div key={i} style={{ fontSize: 9, color: "#c8d0e0", lineHeight: 1.7, marginBottom: 3, paddingLeft: 12, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#22c55e" }}>✓</span>{p}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why it could fail</div>
                  {sc.cons.map((c, i) => (
                    <div key={i} style={{ fontSize: 9, color: "#c8d0e0", lineHeight: 1.7, marginBottom: 3, paddingLeft: 12, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "#ef4444" }}>✗</span>{c}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 8, color: "#4a5878", background: "#0f1520", padding: "6px 10px", borderLeft: `3px solid ${sc.color}` }}>
                {sc.timeline}
              </div>
            </div>
          </div>
        ))}

        {/* SPICE Position */}
        <div style={{ border: "2px solid #B8860B", background: "rgba(200,169,110,0.06)", padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 9, color: "#c8a96e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            The SPICE Position — Agnostic on Endgame
          </div>
          <p style={{ fontSize: 11, color: "#c8d0e0", lineHeight: 1.8, margin: "0 0 10px" }}>We don't know which scenario prevails. What we do know:</p>
          {[
            "Current system is unsustainable — Dollar reserve + Debt/GDP >175% + AI deflation = structural break",
            "Crisis window 2029–2035 — bond market break, hyperinflation/deflation collision, acute phase",
            "Hard assets outperform — empirical law during every reserve currency transition",
            "Post-crisis order takes decades — stabilisation period 2035–2050+",
          ].map((p, i) => (
            <div key={i} style={{ fontSize: 10, color: "#c8d0e0", lineHeight: 1.7, marginBottom: 4, paddingLeft: 14, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#c8a96e" }}>◈</span>{p}
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(200,169,110,0.3)", marginTop: 14, paddingTop: 12, fontSize: 12, fontWeight: 700, color: "#e8eaf0", lineHeight: 1.6 }}>
            SPICE hedges the transition, not the endpoint. We're not betting on the new world order — we're betting against the current one.
          </div>
        </div>

        {/* Performance table */}
        <div style={{ marginBottom: 24, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: 10 }}>
            <thead>
              <tr style={{ background: "#141c2e" }}>
                {["Scenario", "Outcome", "SPICE Performance"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 8, color: "#8899bb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid #e2e2e2" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Scenario 1 — Bitcoin Standard",         "Bitcoin becomes global reserve",                "Wins big — 10–50× from crisis lows, secular bull 2035+"],
                ["Scenario 2 — Multipolar Fragmentation", "Bitcoin as trade settlement layer",             "Wins medium — 5–15× from crisis lows, stable role 2035+"],
                ["Scenario 3 — CBDC Authoritarianism",    "Bitcoin niche asset in democratic world",       "Wins small — 3–8× from crisis lows, regional adoption"],
                ["No crisis — system stabilises",         "Debt/GDP stabilises, no structural break",      "Loses — opportunity cost vs equities"],
              ].map(([sc, out, perf], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#0f1520" : "#080c16" }}>
                  <td style={{ padding: "8px 12px", border: "1px solid #e2e2e2", fontWeight: 700, color: "#e8eaf0" }}>{sc}</td>
                  <td style={{ padding: "8px 12px", border: "1px solid #e2e2e2", color: "#8899bb" }}>{out}</td>
                  <td style={{ padding: "8px 12px", border: "1px solid #e2e2e2", color: i === 3 ? "#ef4444" : "#16a34a", fontWeight: 700 }}>{perf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Further reading */}
        <div style={{ background: "#080c16", border: "1px solid #e2e2e2", padding: "14px 18px", marginBottom: 24 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Further Reading</div>
          {[
            ["Scenario 1 (Bitcoin Standard)", "Ammous, The Bitcoin Standard (2018) · Gladstein, Check Your Financial Privilege (2022)"],
            ["Scenario 2 (Multipolar)",        "Eichengreen, Exorbitant Privilege (2011) · Prasad, The Dollar Trap (2014)"],
            ["Scenario 3 (CBDC)",              "Brunnermeier et al., The Digitalization of Money (2019) · BIS Working Papers on CBDCs"],
            ["Historical precedent",           "Kindleberger, A Financial History of Western Europe (1984) · Eichengreen, Globalizing Capital (2008)"],
          ].map(([label, refs]) => (
            <div key={label} style={{ fontSize: 9, color: "#8899bb", lineHeight: 1.7, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: "#e8eaf0" }}>{label}:</span> {refs}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
          <div style={{ fontSize: 10, color: "#4a5878", marginBottom: 10 }}>Ready to hedge the transition?</div>
          <Link to="/coin" style={{ display: "inline-block", background: "#c8a96e", color: "#fff", padding: "10px 24px", fontFamily: F, fontSize: 11, fontWeight: 700, textDecoration: "none", letterSpacing: "0.08em" }}>
            Explore the SPICE Vault →
          </Link>
        </div>
      </div>

      {/* ── HISTORICAL DEEP DIVES ──────────────────────────────────────── */}
      <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: 36 }}>
        <div style={{ fontSize: 9, color: "#4a5878", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Historical Record</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Deep Dives</div>
        {DEEP_DIVES.map((d, i) => (
          <div key={d.title} style={{ border: "1px solid #e2e2e2", marginBottom: 8 }}>
            <button
              onClick={() => setOpenDives(o => ({ ...o, [i]: !o[i] }))}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "14px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: F }}
            >
              <span style={{ fontSize: 20 }}>{d.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#e8eaf0", flex: 1 }}>{d.title}</span>
              <span style={{ fontSize: 10, color: "#4a5878" }}>{openDives[i] ? "▲" : "▼"}</span>
            </button>
            {openDives[i] && (
              <div style={{ padding: "0 18px 18px 50px", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.1em", margin: "14px 0 8px" }}>Timeline</div>
                {d.timeline.map((t, j) => (
                  <div key={j} style={{ fontSize: 10, color: "#c8d0e0", lineHeight: 1.8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: "#8899bb", minWidth: 80, display: "inline-block" }}>{t.date}</span>
                    {" — "}{t.event}
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#0f1520", border: "1px solid #ebebeb", fontSize: 10, color: "#8899bb", lineHeight: 1.7 }}>
                  {d.outcome}
                </div>
              </div>
            )}
          </div>
        ))}
        <div style={{ fontSize: 7, color: "#4a5878", marginTop: 20, lineHeight: 1.8 }}>
          Sources: Dalio (2021) Changing World Order · Reinhart &amp; Rogoff NBER w15639 ·
          Reinhart &amp; Sbrancia (2015) · CBO 2025 · IMF WP/2025/076
        </div>
      </div>

    </div>
  );
}
