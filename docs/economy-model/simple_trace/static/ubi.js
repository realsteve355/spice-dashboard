// /ubi — "The required UBI" page.
//
// Brings together three things already on the site:
//   • the basket (basket page)            — $2,600/adult/mo, child <18 = 50%
//   • Midwestville County demographics     — 240k working-age, 90k children, 60k retired
//   • the unemployment ramp (Employment)   — MF.unempRateAt(t), 4.2% → 85% over 20yr
//
// and computes the annual UBI bill as automation displaces workers. UBI here
// REPLACES LOST INCOME: it is paid to working-age adults who are unemployed, plus
// 50% per child in those households. Employed adults earn wages; retired are on
// pensions (excluded for now). The bill therefore climbs with unemployment toward
// a universal ceiling (everyone in the labour-force cohort + their children).
//
// Constants are defined locally for now (mirroring the basket + employment pages);
// they will be centralised when the shared model is re-anchored to $2,600/adult.

const ADULT_YR = 2600 * 12;        // $31,200/yr per adult  (basket page)
const CHILD_YR = ADULT_YR * 0.5;   // $15,600/yr per child <18 (50%, paid to parents)

// Midwestville County (Butler County, OH basis) — same cohorts as the Employment page.
const WORKING_AGE = 240000;        // 18–64
const CHILDREN    = 90000;         // under 18
const RETIRED     = 60000;         // 65+ (on pensions — excluded from the UBI bill here)
const ADULTS      = WORKING_AGE + RETIRED;   // 300,000  (18+)
const TOTAL_POP   = ADULTS + CHILDREN;       // 390,000

const HORIZON = 20;                // years, 2026–2046
const BASE_YEAR = 2026;

// Universal ceiling: every working-age adult + every child receives the basket,
// regardless of employment. The needs-based bill approaches this as unemployment → 100%.
const CEILING = WORKING_AGE * ADULT_YR + CHILDREN * CHILD_YR;

// Tax layer — the basket is bought at retail + sales tax, and the UBI is taxable
// income (see /tax). So the Fisc must pay a GROSSED-UP amount to leave the citizen
// enough net to buy the basket: gross = basket × (1 + sales tax) ÷ (1 − income tax).
// Both are EFFECTIVE rates: rent + most groceries are exempt from sales tax, and the
// standard deduction shelters much of a basket-level income.
const SALES_TAX  = 0.04;   // effective, blended across the basket
const INCOME_TAX = 0.08;   // effective on a basket-level income
const GROSS_UP   = (1 + SALES_TAX) / (1 - INCOME_TAX);   // ≈ 1.13

function rows() {
  const out = [];
  for (let t = 0; t <= HORIZON; t++) {
    const u = MF.unempRateAt(t) / 100;             // fraction of working-age unemployed
    const unemployedAdults = WORKING_AGE * u;
    const supportedChildren = CHILDREN * u;         // children allocated to unemployed households pro-rata
    const ubi = unemployedAdults * ADULT_YR + supportedChildren * CHILD_YR;
    out.push({
      year: BASE_YEAR + t,
      u: MF.unempRateAt(t),
      unemployedAdults,
      supportedChildren,
      ubi,                          // net basket bill (what citizens spend)
      grossUbi: ubi * GROSS_UP,     // what the Fisc pays, grossed up for tax
    });
  }
  return out;
}

function render() {
  const R = rows();
  const first = R[0], last = R[R.length - 1];
  document.getElementById("results").innerHTML = [
    introCard(),
    demographicsCard(),
    statRow(first, last),
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

function demographicsCard() {
  const n = v => v.toLocaleString();
  const population = [
    statBox("Overall population", n(TOTAL_POP), "Butler County, OH basis"),
    statBox("Adults (18+)", n(ADULTS), "77% of the population"),
    statBox("Working-age (18–64)", n(WORKING_AGE), "the labour-force cohort"),
    statBox("Retired (65+)", n(RETIRED), "on pensions"),
    statBox("Children (under 18)", n(CHILDREN), "basket at 50%"),
  ].join("");
  // Household figures are approximate (US Census patterns for a county this size).
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

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>How the bill is built</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The basic income replaces income lost to automation. Each year, the
      <a href="/unemployment" style="color:var(--ok);">employment ramp</a> displaces
      more of the county's ${(WORKING_AGE).toLocaleString()} working-age
      adults; every displaced adult needs the
      <a href="/basket" style="color:var(--ok);">basket</a>
      (${"$" + ADULT_YR.toLocaleString()}/yr), and every child under 18 in their household needs
      half (${"$" + CHILD_YR.toLocaleString()}/yr, paid to the parents).
      <br><br>
      <strong>Required UBI = (unemployed adults × adult basket) + (their children × half basket).</strong>
      Employed adults still earn wages, so they need no payment; the
      ${(RETIRED).toLocaleString()} retired residents are on pensions and are excluded here.
      The bill climbs with unemployment toward a <strong>universal ceiling</strong> —
      the cost if every working-age adult and child were paid regardless of employment.
      <br><br>
      <span style="color:var(--dim); font-size:12px;">
        The basket is held at today's price (nominal) to isolate the effect of rising
        unemployment. Basket deflation (the Trajectory page) would lower the nominal
        bill over time — a separate effect, layered in later.
      </span>
    </div>
  </div>`;
}

function statRow(first, last) {
  const cell = (label, value, sub, color) => `
    <div class="stat">
      <div class="label">${label}</div>
      <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
      <div class="sub">${sub}</div>
    </div>`;
  return `
  <div class="card">
    <div class="stats">
      ${cell("Net basket bill · " + last.year, MF.fmtMoney(last.ubi), "what citizens spend · " + last.u.toFixed(0) + "% unemployed", "var(--ok)")}
      ${cell("Gross UBI · " + last.year, MF.fmtMoney(last.grossUbi), "what the Fisc pays (+ tax)", "var(--warn)")}
      ${cell("Tax gross-up", "+" + ((GROSS_UP - 1) * 100).toFixed(0) + "%", "sales + income tax", "var(--txt2)")}
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
      citizen enough <em>net</em> to buy the basket, the Fisc must pay a grossed-up amount.
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
      The shaded line is the net basket the displaced need to spend; the line above is what the Fisc actually
      pays once the basket is grossed up for sales and income tax (+${((GROSS_UP - 1) * 100).toFixed(0)}%). Both
      climb as the employment ramp displaces more workers.
    </div>
  </div>`;
}

function tableCard(R) {
  const n = v => Math.round(v).toLocaleString();
  const body = R.map(r => `
    <tr>
      <td class="cat">${r.year}</td>
      <td class="num">${r.u.toFixed(1)}%</td>
      <td class="num">${n(r.unemployedAdults)}</td>
      <td class="num">${n(r.supportedChildren)}</td>
      <td class="num">${MF.fmtMoney(r.ubi)}</td>
      <td class="num">${MF.fmtMoney(r.grossUbi)}</td>
    </tr>`).join("");
  return `
  <div class="card">
    <h3>Year-by-year</h3>
    <table style="width:100%;">
      <thead><tr>
        <th>Year</th>
        <th class="num">Unemployment</th>
        <th class="num">Unemployed adults</th>
        <th class="num">Children supported</th>
        <th class="num">Net basket / yr</th>
        <th class="num">Gross UBI / yr</th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Children are allocated to unemployed households in proportion to the working-age unemployment rate.
      Adult basket ${"$" + ADULT_YR.toLocaleString()}/yr · child basket ${"$" + CHILD_YR.toLocaleString()}/yr · held at today's prices.
      Gross UBI = net basket grossed up +${((GROSS_UP - 1) * 100).toFixed(0)}% for sales + income tax.
    </div>
  </div>`;
}

render();
