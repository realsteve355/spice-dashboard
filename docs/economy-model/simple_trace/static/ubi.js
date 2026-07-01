// /ubi — "The required UBI" page.
//
// The bill is (displaced adults + their children) × a PER-PERSON payment that
// moves through three phases:
//   • Welfare mode (2026 → inflection): a welfare-level floor (US SSI basis,
//     ~$12k/adult), deliberately below wages so no one quits a job to claim it,
//     and not yet MAC-sustainable. Government keeps the welfare it no longer pays
//     — the incentive to adopt Axion.
//   • Inflection (2036, default): the point where a firm gains more from Axion's
//     UBI-funded demand than the MAC costs it — the charge turns self-sustaining.
//   • UBI mode (inflection → 2046): the floor ramps up to the full basket as
//     automation displaces most work and the MAC can fund it.
//
// Headcount follows the unemployment ramp (Employment page). The basket is held
// at today's price (nominal) to isolate the effect. Inflection year and ramp
// shape are placeholders — both need a formula (see docs/MAC-market-access-model).

const ADULT_YR = 2600 * 12;        // $31,200/yr full basket  (UBI mode ceiling)
const CHILD_YR = ADULT_YR * 0.5;   // $15,600/yr per child <18

const WELFARE_ADULT = 12000;       // welfare-mode floor per adult (US SSI basis)
const WELFARE_CHILD = WELFARE_ADULT * 0.5;   // $6,000

const INFLECTION_YEAR = 2036;      // welfare mode ends; UBI mode begins ramping
const BASKET_YEAR     = 2046;      // full basket reached

// Midwestville County (Butler County, OH basis) — same cohorts as the Employment page.
const WORKING_AGE = 240000;        // 18–64
const CHILDREN    = 90000;         // under 18
const RETIRED     = 60000;         // 65+ (on pensions — excluded from the UBI bill here)
const ADULTS      = WORKING_AGE + RETIRED;   // 300,000  (18+)
const TOTAL_POP   = ADULTS + CHILDREN;       // 390,000

const HORIZON = 20;                // years, 2026–2046
const BASE_YEAR = 2026;

// Universal ceiling: every working-age adult + child on the full basket.
const CEILING = WORKING_AGE * ADULT_YR + CHILDREN * CHILD_YR;

// Tax layer — basket bought at retail + sales tax, UBI is taxable income (/tax).
const SALES_TAX  = 0.04;
const INCOME_TAX = 0.08;
const GROSS_UP   = (1 + SALES_TAX) / (1 - INCOME_TAX);   // ≈ 1.13

// Per-person payment by year: flat welfare floor to the inflection, then linear
// ramp up to the full basket by BASKET_YEAR.
function rampFrac(year) {
  if (year <= INFLECTION_YEAR) return 0;
  if (year >= BASKET_YEAR) return 1;
  return (year - INFLECTION_YEAR) / (BASKET_YEAR - INFLECTION_YEAR);
}
function payAdult(year) { return WELFARE_ADULT + (ADULT_YR - WELFARE_ADULT) * rampFrac(year); }
function payChild(year) { return WELFARE_CHILD + (CHILD_YR - WELFARE_CHILD) * rampFrac(year); }
function phaseOf(year) {
  if (year < INFLECTION_YEAR) return "Welfare";
  if (year === INFLECTION_YEAR) return "Inflection";
  return "UBI";
}

function rows() {
  const out = [];
  for (let t = 0; t <= HORIZON; t++) {
    const year = BASE_YEAR + t;
    const u = MF.unempRateAt(t) / 100;
    const unemployedAdults = WORKING_AGE * u;
    const supportedChildren = CHILDREN * u;
    const pa = payAdult(year), pc = payChild(year);
    const ubi = unemployedAdults * pa + supportedChildren * pc;
    out.push({
      year, u: MF.unempRateAt(t), unemployedAdults, supportedChildren,
      payAdult: pa, phase: phaseOf(year),
      ubi, grossUbi: ubi * GROSS_UP,
    });
  }
  return out;
}

function render() {
  const R = rows();
  const infl = R.find(r => r.year === INFLECTION_YEAR) || R[0];
  const last = R[R.length - 1];
  document.getElementById("results").innerHTML = [
    introCard(),
    phaseCard(infl, last),
    demographicsCard(),
    statRow(infl, last),
    taxCard(),
    chartCard(R),
    tableCard(R),
  ].join("\n");
}

function statBox(label, value, sub, color) {
  return `
    <div class="stat">
      <div class="label">${label}</div>
      <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
      <div class="sub">${sub}</div>
    </div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>How the bill is built</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The basic income replaces income lost to automation. Each year the
      <a href="/unemployment" style="color:var(--ok);">employment ramp</a> displaces more of the county's
      ${WORKING_AGE.toLocaleString()} working-age adults, and each displaced adult (plus their children at half)
      receives a payment. But the <strong>size</strong> of that payment is not fixed — it moves through three
      phases, because paying the full basket from day one would simply pull people out of work before the economy
      can carry it.
      <br><br>
      <strong>Required UBI = (displaced adults × adult payment) + (their children × half payment)</strong>,
      where the payment ramps from a welfare floor to the full basket. Employed adults still earn wages; the
      ${RETIRED.toLocaleString()} retired are on pensions and excluded here.
    </div>
  </div>`;
}

function phaseCard(infl, last) {
  const box = (name, years, pay, note, color) => `
    <div class="stat" style="border-left:3px solid ${color}; padding-left:12px;">
      <div class="label" style="color:${color};">${name}</div>
      <div class="value" style="font-size:15px;">${pay}</div>
      <div class="sub">${years}</div>
      <div style="font-size:11px; color:var(--faint); margin-top:6px; line-height:1.5;">${note}</div>
    </div>`;
  return `
  <div class="card">
    <h3>Three phases of the payment</h3>
    <div class="stats">
      ${box("Welfare mode", `${BASE_YEAR}–${INFLECTION_YEAR}`, "$" + WELFARE_ADULT.toLocaleString() + "/adult",
        "A welfare-level floor (US SSI basis), kept below wages so no one quits to claim it. Not yet MAC-sustainable — government keeps the welfare it no longer pays, the incentive to adopt.", "var(--dim)")}
      ${box("Inflection", `~${INFLECTION_YEAR}`, "turns self-funding",
        "Where a firm gains more from Axion's UBI-funded demand than the MAC costs it. The charge becomes sustainable and the payment starts to climb. Year is a placeholder — needs a formula.", "var(--warn)")}
      ${box("UBI mode", `${INFLECTION_YEAR}–${BASKET_YEAR}`, "→ $" + ADULT_YR.toLocaleString() + "/adult",
        "The floor ramps up to the full basket as automation displaces most work and the MAC can fund it. Linear ramp for now — will be a formula.", "var(--ok)")}
    </div>
  </div>`;
}

function demographicsCard() {
  const n = v => v.toLocaleString();
  const population = [
    statBox("Overall population", n(TOTAL_POP), "Butler County, OH basis"),
    statBox("Adults (18+)", n(ADULTS), "77% of the population"),
    statBox("Working-age (18–64)", n(WORKING_AGE), "the labour-force cohort"),
    statBox("Retired (65+)", n(RETIRED), "on pensions"),
    statBox("Children (under 18)", n(CHILDREN), "basket at 50%"),
  ].join("");
  const households = [
    statBox("Households", "~155,000", "avg 2.5 people"),
    statBox("Families with children", "~47,000", "incl. ~13,000 single-parent"),
    statBox("One-person households", "~45,000", "live alone"),
    statBox("Couples & shared adult homes", "~63,000", "no children"),
  ].join("");
  return `
  <div class="card">
    <h3>Midwestville County — demographic makeup</h3>
    <div style="font-size:11px; color:var(--dim); letter-spacing:0.15em; text-transform:uppercase; margin-top:6px;">Population</div>
    <div class="stats">${population}</div>
    <div style="font-size:11px; color:var(--dim); letter-spacing:0.15em; text-transform:uppercase; margin-top:16px;">Households</div>
    <div class="stats">${households}</div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px; line-height:1.5;">
      Population cohorts are the model's anchor (390,000 = 300,000 adults + 90,000 children; adults = 240,000
      working-age + 60,000 retired). Household figures are approximate, based on US Census household patterns for a
      county this size — the UBI calculation works at the individual level (adults + children), not households.
    </div>
  </div>`;
}

function statRow(infl, last) {
  const cell = (label, value, sub, color) => `
    <div class="stat">
      <div class="label">${label}</div>
      <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
      <div class="sub">${sub}</div>
    </div>`;
  return `
  <div class="card">
    <div class="stats">
      ${cell("Welfare-mode bill · " + infl.year, MF.fmtMoney(infl.ubi), "$" + WELFARE_ADULT.toLocaleString() + "/adult · " + infl.u.toFixed(0) + "% unemployed", "var(--dim)")}
      ${cell("Full-UBI bill · " + last.year, MF.fmtMoney(last.ubi), "$" + ADULT_YR.toLocaleString() + "/adult · " + last.u.toFixed(0) + "% unemployed", "var(--ok)")}
      ${cell("Gross · " + last.year, MF.fmtMoney(last.grossUbi), "what the Fisc pays (+ tax)", "var(--warn)")}
      ${cell("Universal ceiling", MF.fmtMoney(CEILING), "net · all adults + children", "var(--dim)")}
    </div>
  </div>`;
}

function taxCard() {
  const usd = v => "$" + Math.round(v).toLocaleString();
  const atTill = ADULT_YR * (1 + SALES_TAX);
  const gross = atTill / (1 - INCOME_TAX);
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>The tax layer — the Fisc pays more than the basket</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The basket is bought at retail <strong>plus sales tax</strong>, and the UBI is
      <strong>taxable income</strong> (<a href="/tax" style="color:var(--ok);">tax page</a>). So to leave a
      citizen enough <em>net</em> to buy the basket, the Fisc must pay a grossed-up amount (shown at the full-basket
      rate below).
    </div>
    <div style="background:var(--panel2); border:1px solid var(--line-hot); padding:12px 16px; margin-top:12px; font-size:13px; color:var(--txt);">
      basket &nbsp;→&nbsp; × (1 + sales tax) &nbsp;→&nbsp; ÷ (1 − income tax) &nbsp;→&nbsp; <span style="color:var(--ok);">gross UBI</span>
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.8; margin-top:12px;">
      Per adult: <strong>${usd(ADULT_YR)}</strong> basket →
      × ${(1 + SALES_TAX).toFixed(2)} (${(SALES_TAX * 100).toFixed(0)}% sales tax) = ${usd(atTill)} at the till →
      ÷ ${(1 - INCOME_TAX).toFixed(2)} (${(INCOME_TAX * 100).toFixed(0)}% income tax) =
      <strong style="color:var(--warn);">${usd(gross)} gross</strong>
      — a <strong>+${((GROSS_UP - 1) * 100).toFixed(0)}%</strong> gross-up.
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px; line-height:1.5;">
      Effective rates: rent and most groceries are exempt from sales tax, and the standard deduction shelters much
      of a basket-level income — so both sit below the headline rates. The gross-up flows to the IRS and the state,
      not the citizen.
    </div>
  </div>`;
}

function chartCard(R) {
  const net = R.map(r => ({ x: r.year, y: r.ubi }));
  const gross = R.map(r => ({ x: r.year, y: r.grossUbi }));
  const svg = MF.lineChart({
    xDomain: [BASE_YEAR, BASE_YEAR + HORIZON],
    xTicks: [2026, 2031, 2036, 2041, 2046],
    yDomain: [0, 9e9],
    yTicks: [0, 3e9, 6e9, 9e9],
    yFmt: v => "$" + (v / 1e9).toFixed(0) + "B",
    series: [
      { pts: gross, color: "var(--warn)", width: 2.5, label: "Gross UBI · Fisc pays (" + MF.fmtBn(R[R.length - 1].grossUbi) + ")" },
      { pts: net, color: "var(--ok)", width: 2.5, area: true, areaOpacity: 0.1, label: "Net basket bill (" + MF.fmtBn(R[R.length - 1].ubi) + ")" },
    ],
  });
  return `
  <div class="card">
    <h3>Required UBI per year, ${R[0].year}–${R[R.length - 1].year}</h3>
    ${svg}
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Flat-ish through <strong>welfare mode</strong> (the payment is fixed at the floor; the bill rises only as more
      workers are displaced), then steepening after the <strong>${INFLECTION_YEAR} inflection</strong> as the
      per-person payment ramps toward the full basket. The upper line is grossed up for sales + income tax
      (+${((GROSS_UP - 1) * 100).toFixed(0)}%).
    </div>
  </div>`;
}

function tableCard(R) {
  const n = v => Math.round(v).toLocaleString();
  const phaseColor = p => p === "Welfare" ? "var(--dim)" : p === "Inflection" ? "var(--warn)" : "var(--ok)";
  const body = R.map(r => `
    <tr>
      <td class="cat">${r.year}</td>
      <td class="num" style="color:${phaseColor(r.phase)};">${r.phase}</td>
      <td class="num">${r.u.toFixed(1)}%</td>
      <td class="num">$${n(r.payAdult)}</td>
      <td class="num">${n(r.unemployedAdults)}</td>
      <td class="num">${MF.fmtMoney(r.ubi)}</td>
      <td class="num">${MF.fmtMoney(r.grossUbi)}</td>
    </tr>`).join("");
  return `
  <div class="card">
    <h3>Year-by-year</h3>
    <table style="width:100%;">
      <thead><tr>
        <th>Year</th>
        <th class="num">Phase</th>
        <th class="num">Unemployment</th>
        <th class="num">Pay / adult</th>
        <th class="num">Displaced adults</th>
        <th class="num">Net bill / yr</th>
        <th class="num">Gross / yr</th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Pay/adult ramps from the $${WELFARE_ADULT.toLocaleString()} welfare floor (to ${INFLECTION_YEAR}) up to the
      $${ADULT_YR.toLocaleString()} basket (by ${BASKET_YEAR}); children at half. Displaced counts follow the
      unemployment ramp; children allocated to displaced households pro-rata. Held at today's prices. Gross =
      net +${((GROSS_UP - 1) * 100).toFixed(0)}% for sales + income tax.
    </div>
  </div>`;
}

render();
