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
const K         = UBI / weightSum;            // the county-wide scalar

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
    introCard(), layersCard(), answerCard(), ceilingCard(), sectorTable(), noteCard(),
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
      The charge on each firm's slice of a transaction is
      <strong>MAC = S × A × K</strong> (slice × automation × the county scalar). This page sizes the base on real
      BEA 2024 industry data, scaled to Midwestville's ${COUNTY_POP.toLocaleString()} people.
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
