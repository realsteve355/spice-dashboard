// /mac-national — "Midwestville — the whole-economy MAC base (with B2B)".
//
// The question this page answers: retail sales alone cannot fund the UBI. Once the
// B2B layer (firms procuring inputs) is in scope, the base of chargeable
// transactions multiplies and the MAC becomes affordable. How much MAC can
// Midwestville raise if every transaction — B2C and B2B — is in scope?
//
// Data: real BEA 2024 GDP-by-Industry (value added + gross output) for the 20 NAICS
// sectors, scaled to Midwestville's 390,000 people (÷ the US population). Per-sector
// labour share (→ automation index A) is a first-pass estimate to firm up against
// BEA's compensation-by-industry table. Government is out of scope (tax-funded, no
// skimmable sale).
//
// The charge:  MAC = S × A × K
//   S = a firm's slice of a transaction (its value added / declared margin)
//   A = automation index = 1 − (wages ÷ revenue);  0 = all human, 1 = all robot
//   K = one county-wide number set so total MAC = the UBI bill
//         K = UBI ÷ Σ( value added × A )

const US_POP = 335e6, COUNTY_POP = 390000, SCALE = COUNTY_POP / US_POP;

// Demand-side aggregates (US $, 2024) — scaled to the county below.
const RETAIL_US = 8.3e12;    // retail + food-services sales (Census)
const PCE_US    = 19.8e12;   // personal consumption expenditure (BEA)

// UBI at maturity — same basis as the /ubi page (unemployed × basket, income-tax
// grossed up). Gross-up factors carried from /ubi: adult $31,200→$33,367,
// child $15,600→$15,667.
const WA = 240000, CH = 90000;
const u20 = MF.unempRateAt(20) / 100;        // 0.85 — year-20 displacement
const ADULT_GROSS = 33367, CHILD_GROSS = 15667;
const UBI = WA * u20 * ADULT_GROSS + CH * u20 * CHILD_GROSS;   // county gross UBI bill

// Real BEA 2024 GDP-by-Industry, US $ (value added + gross output), 20 NAICS sectors.
// labour = compensation ÷ gross output (first-pass); A = 1 − labour.
// scope: false = government (out of scope). All figures in absolute US dollars.
const SECTORS = [
  { naics: "11",    name: "Agriculture, forestry, fishing", va: 0.25e12, go: 0.65e12, labour: 0.10, scope: true },
  { naics: "21",    name: "Mining, oil & gas",              va: 0.35e12, go: 0.85e12, labour: 0.15, scope: true },
  { naics: "22",    name: "Utilities",                      va: 0.40e12, go: 0.70e12, labour: 0.15, scope: true },
  { naics: "23",    name: "Construction",                   va: 1.25e12, go: 2.50e12, labour: 0.30, scope: true },
  { naics: "31-33", name: "Manufacturing",                  va: 2.90e12, go: 7.50e12, labour: 0.18, scope: true },
  { naics: "42",    name: "Wholesale trade",                va: 1.75e12, go: 2.40e12, labour: 0.25, scope: true },
  { naics: "44-45", name: "Retail trade",                   va: 1.80e12, go: 2.60e12, labour: 0.30, scope: true },
  { naics: "48-49", name: "Transportation & warehousing",   va: 1.05e12, go: 1.90e12, labour: 0.35, scope: true },
  { naics: "51",    name: "Information",                    va: 1.70e12, go: 2.90e12, labour: 0.20, scope: true },
  { naics: "52",    name: "Finance & insurance",            va: 2.20e12, go: 5.50e12, labour: 0.25, scope: true },
  { naics: "53",    name: "Real estate & leasing",          va: 4.00e12, go: 5.50e12, labour: 0.05, scope: true },
  { naics: "54",    name: "Professional & technical",       va: 2.30e12, go: 3.50e12, labour: 0.45, scope: true },
  { naics: "55",    name: "Management of companies",        va: 0.55e12, go: 0.90e12, labour: 0.30, scope: true },
  { naics: "56",    name: "Administrative & waste",         va: 0.95e12, go: 1.50e12, labour: 0.45, scope: true },
  { naics: "61",    name: "Educational services",           va: 0.35e12, go: 0.50e12, labour: 0.50, scope: true },
  { naics: "62",    name: "Health care & social assist.",   va: 2.15e12, go: 3.50e12, labour: 0.45, scope: true },
  { naics: "71",    name: "Arts, entertainment & rec.",     va: 0.35e12, go: 0.60e12, labour: 0.35, scope: true },
  { naics: "72",    name: "Accommodation & food",           va: 1.05e12, go: 1.90e12, labour: 0.35, scope: true },
  { naics: "81",    name: "Other services",                 va: 0.65e12, go: 1.10e12, labour: 0.35, scope: true },
  { naics: "92",    name: "Government",                     va: 3.50e12, go: 5.00e12, labour: 0.55, scope: false },
];

// Derive per sector (county scale), automation index, B2B (intermediate) and the
// value-added × A weight that drives the charge.
SECTORS.forEach(s => {
  s.A = 1 - s.labour;
  s.vaC = s.va * SCALE;                 // value added, county
  s.goC = s.go * SCALE;                 // gross output (all transactions), county
  s.b2b = (s.go - s.va) * SCALE;        // intermediate inputs = the B2B layer, county
  s.wages = s.go * s.labour * SCALE;    // wage bill, county
  s.weight = s.vaC * s.A;               // Σ of this = the MAC denominator
});

const mkt = SECTORS.filter(s => s.scope);   // market economy (ex government)
const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);

const totalGO   = sum(mkt, s => s.goC);       // all transactions in scope
const totalVA   = sum(mkt, s => s.vaC);       // value added (GDP ex-gov)
const totalB2B  = sum(mkt, s => s.b2b);       // the B2B / intermediate layer
const wageBill  = sum(mkt, s => s.wages);     // market wage bill
const freed     = wageBill * u20;             // wages automation frees at maturity
const weightSum = sum(mkt, s => s.weight);    // Σ( value added × A )
const K         = UBI / weightSum;            // the county-wide scalar (mature, Y20)

// Year-1 comparison: same base, but the UBI bill is tiny (few displaced yet), so
// the county rate is near zero. Automation held at today's level to isolate the
// effect of the growing UBI need.
const u1     = MF.unempRateAt(0) / 100;                 // ~4.2% displaced at year 1
const UBI_Y1 = WA * u1 * 12000 + CH * u1 * 6000;        // welfare floor, untaxed
const K_Y1   = UBI_Y1 / weightSum;                      // year-1 county rate

const retail = RETAIL_US * SCALE;             // narrow retail (shops + dining)
const pce    = PCE_US * SCALE;                // all consumer spend

// Retail-only counterfactual: if the MAC could reach only retail transactions.
const retailOnlyRate = UBI / retail;
const allTxnRate     = UBI / totalGO;

SECTORS.forEach(s => { s.mac = s.scope ? K * s.weight : 0; });

// Formatters — county scale is billions.
const B = v => (v < 0 ? "−$" : "$") + (Math.abs(v) / 1e9).toFixed(1) + "B";
const pct = v => (v * 100).toFixed(0) + "%";
const pct1 = v => (v * 100).toFixed(1) + "%";

function render() {
  document.getElementById("results").innerHTML = [
    introCard(), calcCard(), layersCard(), answerCard(), ceilingCard(), sectorTable(), noteCard(),
  ].join("\n");
}

function statBox(label, value, sub, color) {
  return `<div class="stat"><div class="label">${label}</div>
    <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
    <div class="sub">${sub}</div></div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>The question</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Retail sales alone cannot fund the basic income. Midwestville's consumers spend about
      <strong>${B(retail)}</strong> a year in shops — but the UBI bill at maturity is
      <strong>${B(UBI)}</strong>, which would need a ${pct(retailOnlyRate)} charge on every retail sale. Impossible.
      <br><br>
      The improvement is the <strong>B2B layer</strong>: a firm with no consumers in the county — an external
      battery maker supplying the solar grid, a software vendor licensing to the logistics hub — is still in scope,
      because its sale into the county clears the MOND gateway. Once every transaction counts, the base multiplies.
      How the charge on each transaction is worked out is set out in the next section; this page then sizes the
      base on real BEA 2024 industry data, scaled to Midwestville's ${COUNTY_POP.toLocaleString()} people.
    </div>
  </div>`;
}

function calcCard() {
  // Worked example — a $1,000 phone at Walmart, supplied by Apple, at year 1 and
  // year 20. Uses the page's own rates (K_Y1, K) so the numbers stay consistent.
  const wVA = 100, wA = 0.5, aVA = 800, aA = 0.95;
  const usd = v => "$" + (Math.abs(v) < 10 ? v.toFixed(2) : Math.round(v).toLocaleString());
  const wY1 = K_Y1 * wVA * wA, wY20 = K * wVA * wA;
  const aY1 = K_Y1 * aVA * aA, aY20 = K * aVA * aA;
  const twoCol = (label, y1, y20, bold) => `<tr>
    <td class="cat">${bold ? `<strong>${label}</strong>` : label}</td>
    <td class="num">${bold ? `<strong>${y1}</strong>` : y1}</td>
    <td class="num">${bold ? `<strong>${y20}</strong>` : y20}</td>
  </tr>`;
  return `
  <div class="card" style="border-left:3px solid var(--headline);">
    <h3>How the MAC is calculated</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Every company pays a charge on each sale, worked out from three things.
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:12px;">
      <strong>1. The value it adds.</strong> A company pays on the value <em>it</em> adds, not the whole shelf
      price. When Walmart sells a $1,000 phone it adds ${usd(wVA)} (its mark-up); the $900 it paid for the phone is
      the supplier's value, and the supplier pays on that. So the charge is never counted twice along the chain.
      <br><br>
      <strong>2. How automated it is.</strong> Measured as the share of the company's money that no longer goes to
      wages — a number from 0 to 1. A company run on robots with almost no staff is near 1 and pays the most; a
      company that is mostly people (a care home, a restaurant) is near 0 and pays little. This is what makes the
      MAC a charge on automation rather than a flat sales tax: it lands on the firms that replaced workers.
      <br><br>
      <strong>3. One county-wide rate.</strong> A single number, the same for every company, set each period so
      that all the charges collected add up to exactly the UBI bill — no more, no less. It starts near zero, when
      almost no one is displaced and the UBI bill is tiny, and rises as automation displaces work — reaching about
      <strong>${K.toFixed(2)}</strong> at maturity (the ${B(UBI)} UBI ÷ the automation-weighted total of every
      firm's value added).
    </div>
    <div style="background:var(--panel2); border:1px solid var(--line-hot); padding:14px 18px; margin-top:14px; font-size:14px; color:var(--txt); text-align:center;">
      MAC = (the value a company adds) × (how automated it is) × (the county rate)
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:14px;">
      <strong>The same phone at the beginning and the end</strong> — a $1,000 phone at Walmart, supplied by Apple.
      What changes is the county rate: at the start barely anyone needs the UBI, so the charge is trivial; by year
      20 most work is automated and the UBI bill is ${B(UBI)}.
    </div>
    <div style="overflow-x:auto; margin-top:12px;">
    <table style="width:100%;">
      <thead><tr><th></th><th class="num">Year 1 (2026)</th><th class="num">Year 20 (2046)</th></tr></thead>
      <tbody>
        ${twoCol("People displaced", pct(u1), pct(u20))}
        ${twoCol("County UBI bill", B(UBI_Y1), B(UBI))}
        ${twoCol("County rate", K_Y1.toFixed(3), K.toFixed(2))}
        ${twoCol("Walmart's charge ($100 added × 0.5)", usd(wY1), usd(wY20))}
        ${twoCol("Apple's charge ($800 added × 0.95)", usd(aY1), usd(aY20))}
        ${twoCol("MAC on the phone", usd(wY1 + aY1), usd(wY20 + aY20), true)}
      </tbody>
    </table>
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:12px;">
      The phone's MAC grows from about <strong>${usd(wY1 + aY1)}</strong> to <strong>${usd(wY20 + aY20)}</strong> —
      nearly all of it on Apple, the most automated maker; Walmart, still people-heavy, barely pays. The shelf
      price never changes; the charge comes out of the value automation created, not off the customer's bill.
      (Automation is held at today's level here to isolate the growing UBI; in practice it rises too, shifting even
      more of the charge onto the most-automated firms.)
    </div>
  </div>`;
}

function layersCard() {
  const row = (label, val, note) => `<tr>
    <td class="cat">${label}</td>
    <td class="num">${B(val)}</td>
    <td class="num" style="color:var(--dim);">${note}</td>
  </tr>`;
  return `
  <div class="card">
    <h3>The layers of transactions in Midwestville (per year)</h3>
    <div style="overflow-x:auto;">
    <table style="width:100%;">
      <thead><tr><th>Layer</th><th class="num">Value</th><th class="num">What it is</th></tr></thead>
      <tbody>
        ${row("Narrow retail (shops + dining)", retail, "what consumers buy in stores")}
        ${row("All consumer spend (B2C)", pce, "incl. services, housing, health")}
        ${row("Business-to-business (B2B)", totalB2B, "procurement & supply chain")}
        ${row("All transactions (gross output)", totalGO, "every sale through the gateway")}
        ${row("Value added (GDP ex-government)", totalVA, "the base, no double-counting")}
        ${row("Wage bill (labour share)", wageBill, "the pool the MAC replaces")}
      </tbody>
    </table>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px; line-height:1.5;">
      US totals (BEA 2024) scaled to Midwestville by population (÷${Math.round(1 / SCALE)}). Gross output is every
      transaction including the B2B middle; value added strips the double-counting (each dollar of real production
      counted once). Government excluded — tax-funded, no skimmable sale.
    </div>
  </div>`;
}

function answerCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>How much MAC can Midwestville raise?</h3>
    <div class="stats">
      ${statBox("Retail-only base", B(retail), "shops + dining", "var(--dim)")}
      ${statBox("Retail-only charge needed", pct(retailOnlyRate), "of every retail sale — breaks", "var(--crit)")}
      ${statBox("All-transaction base", B(totalGO), "B2C + B2B through the gateway", "var(--ok)")}
      ${statBox("All-transaction charge", pct(allTxnRate), "of transactions — works", "var(--ok)")}
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:14px;">
      Including the B2B layer takes the base from <strong>${B(retail)}</strong> (retail only) to
      <strong>${B(totalGO)}</strong> (all transactions) — roughly <strong>${(totalGO / retail).toFixed(0)}×</strong>.
      The same ${B(UBI)} UBI bill drops from an impossible ${pct(retailOnlyRate)} charge on retail to about
      <strong>${pct(allTxnRate)}</strong> across all transactions. That is the B2B layer doing the work.
    </div>
  </div>`;
}

function ceilingCard() {
  const headroom = freed - UBI;
  return `
  <div class="card">
    <h3>The ceiling — what the MAC can sustainably take</h3>
    <div class="stats">
      ${statBox("Wages automation frees", B(freed), pct(u20) + " of the wage bill", "var(--warn)")}
      ${statBox("UBI to fund", B(UBI), "at maturity, gross of tax", "var(--ok)")}
      ${statBox("Headroom", B(headroom), "freed wages − UBI", "var(--ok)")}
      ${statBox("Coverage", (freed / UBI).toFixed(1) + "×", "freed wages ÷ UBI need")}
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:14px;">
      The MAC skims gross transactions, but what it can remove <em>without</em> forcing firms to raise prices is
      capped at the value automation frees up — the disappearing wage bill, about <strong>${B(freed)}</strong> at
      maturity. Against a UBI of <strong>${B(UBI)}</strong>, that is roughly <strong>${(freed / UBI).toFixed(1)}×</strong>
      cover: firms fund the basic income and still keep <strong>${B(headroom)}</strong> more than the old wage bill
      cost them. The county scalar comes out at <strong>K = ${K.toFixed(2)}</strong>
      (UBI ÷ Σ of value added × automation).
    </div>
  </div>`;
}

function sectorTable() {
  const rows = SECTORS.slice().sort((a, b) => b.goC - a.goC).map(s => {
    const scopeMark = s.scope ? "" : ` <span style="color:var(--crit);">✗</span>`;
    return `<tr ${s.scope ? "" : 'style="color:var(--faint);"'}>
      <td class="cat">${s.name}${scopeMark}</td>
      <td class="num">${B(s.goC)}</td>
      <td class="num">${B(s.vaC)}</td>
      <td class="num">${B(s.b2b)}</td>
      <td class="num">${s.A.toFixed(2)}</td>
      <td class="num">${s.scope ? B(s.mac) : "—"}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Sector by sector — where the base sits</h3>
    <div style="overflow-x:auto;">
    <table style="width:100%;">
      <thead><tr>
        <th>Sector (NAICS)</th>
        <th class="num">Transactions</th>
        <th class="num">Value added</th>
        <th class="num">B2B layer</th>
        <th class="num">Automation A</th>
        <th class="num">MAC</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Market economy</strong></td>
        <td class="num"><strong>${B(totalGO)}</strong></td>
        <td class="num"><strong>${B(totalVA)}</strong></td>
        <td class="num"><strong>${B(totalB2B)}</strong></td>
        <td class="num">—</td>
        <td class="num"><strong>${B(UBI)}</strong></td>
      </tr></tfoot>
    </table>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px; line-height:1.5;">
      Transactions = gross output; B2B layer = gross output − value added (the intermediate purchases). Automation
      A = 1 − labour share; higher A carries more of the charge (real estate, manufacturing, information, finance).
      Government (✗) is out of scope. MAC = K × value added × A.
    </div>
  </div>`;
}

function noteCard() {
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>What to firm up</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Value added and gross output per sector are real BEA 2024 figures scaled to the county by population. Two
      things are first-pass and should be replaced with measured data:
      <strong>(1) the automation index A</strong> (labour share) per sector — estimated here, to be taken from BEA's
      compensation-by-industry table; <strong>(2) the in-area share</strong> — a real county reaches all of some
      sectors (retail, utilities, real estate) but only part of others (manufacturing, wholesale) whose output is
      mostly sold out of the area. Scaling by population assumes Midwestville is a representative slice of the US
      economy, which overstates the reach of the export-heavy sectors.
    </div>
  </div>`;
}

render();
