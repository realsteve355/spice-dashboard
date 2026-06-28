// /ubi — "The required UBI" page.
//
// Brings together three things already on the site:
//   • the basket (basket page)            — $2,600/adult/mo, child <18 = 50%
//   • Midwestville County demographics     — 240k working-age, 90k children, 60k retired
//   • the unemployment ramp (Employment)   — MF.unempRateAt(t), 4.2% → 75% over 20yr
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
      ubi,
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
  const pctOfCeiling = last.ubi / CEILING * 100;
  const cell = (label, value, sub, color) => `
    <div class="stat">
      <div class="label">${label}</div>
      <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
      <div class="sub">${sub}</div>
    </div>`;
  return `
  <div class="card">
    <div class="stats">
      ${cell("Required UBI · " + first.year, MF.fmtMoney(first.ubi), first.u.toFixed(1) + "% unemployed", "var(--ok)")}
      ${cell("Required UBI · " + last.year, MF.fmtMoney(last.ubi), last.u.toFixed(0) + "% unemployed", "var(--warn)")}
      ${cell("Universal ceiling", MF.fmtMoney(CEILING), "all adults + children", "var(--dim)")}
      ${cell("Year-" + HORIZON + " vs ceiling", pctOfCeiling.toFixed(0) + "%", "of the universal cost", "var(--txt2)")}
    </div>
  </div>`;
}

function chartCard(R) {
  const needs = R.map(r => ({ x: r.year, y: r.ubi }));
  const ceiling = [{ x: R[0].year, y: CEILING }, { x: R[R.length - 1].year, y: CEILING }];
  const svg = MF.lineChart({
    xDomain: [BASE_YEAR, BASE_YEAR + HORIZON],
    xTicks: [2026, 2031, 2036, 2041, 2046],
    yDomain: [0, 9e9],
    yTicks: [0, 3e9, 6e9, 9e9],
    yFmt: v => "$" + (v / 1e9).toFixed(0) + "B",
    series: [
      { pts: ceiling, color: "var(--dim)", width: 1.5, dashed: true, label: "Universal ceiling (" + MF.fmtBn(CEILING) + ")" },
      { pts: needs, color: "var(--warn)", width: 2.5, area: true, areaOpacity: 0.1, label: "Required UBI (" + MF.fmtBn(R[R.length - 1].ubi) + ")" },
    ],
  });
  return `
  <div class="card">
    <h3>Required UBI per year, ${R[0].year}–${R[R.length - 1].year}</h3>
    ${svg}
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      The shaded line is the needs-based bill — it rises as the employment ramp displaces more workers.
      The dashed line is the universal ceiling. By ${R[R.length - 1].year} the two have nearly converged:
      at ${R[R.length - 1].u.toFixed(0)}% unemployment, most of the labour force is already on the basic income.
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
        <th class="num">Required UBI / yr</th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Children are allocated to unemployed households in proportion to the working-age unemployment rate.
      Adult basket ${"$" + ADULT_YR.toLocaleString()}/yr · child basket ${"$" + CHILD_YR.toLocaleString()}/yr · held at today's prices.
    </div>
  </div>`;
}

render();
