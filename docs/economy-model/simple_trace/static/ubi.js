// /ubi — "The required UBI" page.
//
// The basic income serves the unemployed. The bill is (unemployed adults + their
// children at half) × a per-person payment that runs in two modes:
//   • Welfare mode (2026 → inflection): a welfare-level floor (US SSI basis,
//     ~$12k/adult), kept below wages so no one leaves work to claim it.
//   • UBI mode (inflection → 2046): the floor rises to the full basket as
//     automation displaces most work.
// The inflection is the point where the payment starts to climb from the welfare
// floor toward the basket. The MAC funds the payment from day one.
//
// Unemployment (the recipient count) is the employment-page figure (MF.unempRateAt).
// The basket is held at today's price (nominal) to isolate the effect.
//
// The basket defines the UBI (net). UBI is taxable income (the Fisc issues 1099s —
// see /tax), so the Fisc grosses the payment up so that, after income tax, the net
// still buys the basket. Real US treatment: the standard deduction shelters the
// welfare floor (~0% tax), so the gross-up only appears as the payment climbs.

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
  return year <= INFLECTION_YEAR ? "Welfare" : "UBI";
}

// Income tax on the UBI (single filer, 2025 basis). Federal standard deduction +
// brackets; Ohio simplified (0% under $26,050, 2.75% above). Applied per payment.
const STD_DEDUCTION = 15000;
const FED_BRACKETS = [[0, 0.10], [11925, 0.12], [48475, 0.22], [103350, 0.24]];
function fedTax(gross) {
  const ti = Math.max(0, gross - STD_DEDUCTION);
  let tax = 0;
  for (let i = 0; i < FED_BRACKETS.length; i++) {
    const lo = FED_BRACKETS[i][0], rate = FED_BRACKETS[i][1];
    const hi = i + 1 < FED_BRACKETS.length ? FED_BRACKETS[i + 1][0] : Infinity;
    if (ti > lo) tax += (Math.min(ti, hi) - lo) * rate;
  }
  return tax;
}
function ohioTax(gross) { return Math.max(0, gross - 26050) * 0.0275; }
function incomeTax(gross) { return fedTax(gross) + ohioTax(gross); }
// Gross-up: solve gross − incomeTax(gross) = net (net-of-tax is monotonic → bisect).
function grossUp(net) {
  if (net <= 0) return 0;
  let lo = net, hi = net * 1.6;
  for (let i = 0; i < 44; i++) {
    const mid = (lo + hi) / 2;
    if (mid - incomeTax(mid) < net) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function rows() {
  const out = [];
  for (let t = 0; t <= HORIZON; t++) {
    const year = BASE_YEAR + t;
    const u = MF.unempRateAt(t) / 100;
    const unemployedAdults = WORKING_AGE * u;
    const supportedChildren = CHILDREN * u;
    const pa = payAdult(year), pc = payChild(year);
    const grossPa = grossUp(pa), grossPc = grossUp(pc);
    const ubi = unemployedAdults * pa + supportedChildren * pc;            // net (basket)
    const grossUbi = unemployedAdults * grossPa + supportedChildren * grossPc;  // Fisc pays
    out.push({
      year, u: MF.unempRateAt(t), unemployedAdults, supportedChildren,
      payAdult: pa, grossPayAdult: grossPa, phase: phaseOf(year), ubi, grossUbi,
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
      The basic income serves the county's unemployed. Each unemployed working-age adult (plus their children
      at half) receives a payment; employed adults still earn wages, and the ${RETIRED.toLocaleString()} retired
      are on pensions and excluded here. The number of recipients is the unemployment figure from the
      <a href="/unemployment" style="color:var(--ok);">employment page</a>.
      <br><br>
      <strong>Required UBI = (unemployed adults × adult payment) + (their children × half payment)</strong>,
      where the payment runs in two modes — a welfare floor early on, rising to the full basket as automation
      displaces most work. The MAC funds it from day one.
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
    <h3>Two modes of the payment</h3>
    <div class="stats">
      ${box("Welfare mode", `${BASE_YEAR}–${INFLECTION_YEAR}`, "$" + WELFARE_ADULT.toLocaleString() + "/adult",
        "A welfare-level floor (US SSI basis), kept below wages so no one leaves work to claim it.", "var(--dim)")}
      ${box("UBI mode", `${INFLECTION_YEAR}–${BASKET_YEAR}`, "→ $" + ADULT_YR.toLocaleString() + "/adult",
        "The floor rises to the full basket as automation displaces most work.", "var(--ok)")}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px; line-height:1.5;">
      The <strong>inflection</strong> (~${INFLECTION_YEAR}) is the point between the two modes — where the payment
      starts to climb from the welfare floor toward the basket.
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
      ${cell("Gross · " + last.year, MF.fmtMoney(last.grossUbi), "what the Fisc pays (+ income tax)", "var(--warn)")}
      ${cell("Universal ceiling", MF.fmtMoney(CEILING), "all adults + children on full basket", "var(--dim)")}
    </div>
  </div>`;
}

function taxCard() {
  const usd = v => "$" + Math.round(v).toLocaleString();
  const gWelfare = grossUp(WELFARE_ADULT), gFull = grossUp(ADULT_YR);
  const upWelfare = (gWelfare / WELFARE_ADULT - 1) * 100;
  const upFull = (gFull / ADULT_YR - 1) * 100;
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>Income tax — the Fisc grosses up the UBI</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The basket defines the UBI, but the UBI is <strong>taxable income</strong>
      (<a href="/tax" style="color:var(--ok);">tax page</a>). So the Fisc pays a grossed-up amount, and after the
      citizen's income tax the <em>net</em> still buys the basket. Because the standard deduction shelters low
      incomes, the welfare floor is effectively untaxed and the gross-up only appears as the payment climbs toward
      the full basket.
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.8; margin-top:12px;">
      Welfare floor: <strong>${usd(WELFARE_ADULT)}</strong> net → <strong>${usd(gWelfare)}</strong> gross
      (<strong>+${upWelfare.toFixed(1)}%</strong>).<br>
      Full basket: <strong>${usd(ADULT_YR)}</strong> net → <strong style="color:var(--warn);">${usd(gFull)}</strong>
      gross (<strong>+${upFull.toFixed(1)}%</strong>).
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px; line-height:1.5;">
      Single-filer basis (federal standard deduction + brackets, Ohio state at 2.75% above $26,050). Computed per
      payment — the adult and child streams are grossed up separately; household aggregation and child credits are
      not modelled. The gross-up flows to the IRS and the state, not the citizen.
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
      { pts: gross, color: "var(--warn)", width: 2.5, label: "Gross · Fisc pays (" + MF.fmtBn(R[R.length - 1].grossUbi) + ")" },
      { pts: net, color: "var(--ok)", width: 2.5, area: true, areaOpacity: 0.1, label: "Net basket bill (" + MF.fmtBn(R[R.length - 1].ubi) + ")" },
    ],
  });
  return `
  <div class="card">
    <h3>Required UBI per year, ${R[0].year}–${R[R.length - 1].year}</h3>
    ${svg}
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Flat-ish through <strong>welfare mode</strong> (the payment is fixed at the floor; the bill rises only as more
      workers become unemployed), then steepening after the <strong>${INFLECTION_YEAR} inflection</strong> as the
      per-person payment climbs toward the full basket. The two lines diverge as the payment rises: the welfare floor
      is untaxed, so the gross-up for income tax only opens up in UBI mode.
    </div>
  </div>`;
}

function tableCard(R) {
  const n = v => Math.round(v).toLocaleString();
  const phaseColor = p => p === "Welfare" ? "var(--dim)" : "var(--ok)";
  const body = R.map(r => `
    <tr>
      <td class="cat">${r.year}</td>
      <td class="num" style="color:${phaseColor(r.phase)};">${r.phase}</td>
      <td class="num">${r.u.toFixed(1)}%</td>
      <td class="num">$${n(r.payAdult)}</td>
      <td class="num">${n(r.unemployedAdults)}</td>
      <td class="num">${MF.fmtMoney(r.ubi)}</td>
      <td class="num" style="color:var(--warn);">${MF.fmtMoney(r.grossUbi)}</td>
    </tr>`).join("");
  return `
  <div class="card">
    <h3>Year-by-year</h3>
    <table style="width:100%;">
      <thead><tr>
        <th>Year</th>
        <th class="num">Mode</th>
        <th class="num">Unemployment</th>
        <th class="num">Pay / adult</th>
        <th class="num">Unemployed adults</th>
        <th class="num">Net bill / yr</th>
        <th class="num">Gross / yr</th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Pay/adult holds at the $${WELFARE_ADULT.toLocaleString()} welfare floor (to ${INFLECTION_YEAR}), then climbs to
      the $${ADULT_YR.toLocaleString()} basket (by ${BASKET_YEAR}); children at half. Unemployed counts are the
      employment-page figure; children allocated to unemployed households pro-rata. Held at today's prices. Gross =
      net + income tax the Fisc must cover so the citizen's after-tax UBI still buys the basket.
    </div>
  </div>`;
}

render();
