// /mac-national — "Scaling the MAC to the whole country".
//
// Takes the Midwestville year-20 model and scales it to the USA by population,
// to answer: does widening the base and going national cover the whole country?
// Loads maryfontaine.js (ramp) + mac-data.js (base + formula + formatters).
//
// The point it makes: the country is the county × 872. The CONSUMER-only MAC
// falls just as short nationally as it does locally (same ratio) — geography
// alone changes nothing. But the economy-wide automation surplus (the wages
// automation stops paying) EXCEEDS the UBI at both scales, so a WHOLE-ECONOMY
// MAC, charged in every jurisdiction, can fund the country.

const US_POP = 340e6;
const COUNTY_POP = 390000;
const SCALE = US_POP / COUNTY_POP;     // ≈ 872

const u1 = MF.unempRateAt(0) / 100;
const u20 = MF.unempRateAt(20) / 100;
const RETENTION = (1 - u20) / (1 - u1);
const WORKING_AGE = 240000, CHILDREN = 90000, ADULT_YR = 31200, CHILD_YR = 15600, AVG_WAGE = 60000;

// County year-20 (same transform as /mac-y20), recomputed here so the national
// figures derive from the identical model.
function countyY20() {
  let consumerProfit = 0, consumerMac = 0;
  for (const c of CATEGORIES) {
    const profit1 = c.rev * c.margin, emp1 = c.rev / c.rpe, wageBill1 = emp1 * c.wage;
    const emp = emp1 * RETENTION, profit = profit1 + wageBill1 * (1 - RETENTION);
    consumerProfit += profit;
    consumerMac += profit * Math.min(1, macRate(profit, emp));
  }
  const ubi = WORKING_AGE * u20 * ADULT_YR + CHILDREN * u20 * CHILD_YR;
  const displaced = WORKING_AGE * (u20 - u1);
  const savedWages = displaced * AVG_WAGE;   // ALL displaced workers, economy-wide
  return { consumerProfit, consumerMac, ubi, displaced, savedWages };
}

const C = countyY20();
const N = {
  pop: US_POP,
  workingAge: WORKING_AGE * SCALE,
  displaced: C.displaced * SCALE,
  ubi: C.ubi * SCALE,
  consumerProfit: C.consumerProfit * SCALE,
  consumerMac: C.consumerMac * SCALE,
  savedWages: C.savedWages * SCALE,
};
N.consumerCover = N.consumerMac / N.ubi;
N.surplusVsUbi = N.savedWages / N.ubi;
N.captureNeeded = N.ubi / N.savedWages;

function render() {
  document.getElementById("results").innerHTML = [
    introCard(),
    statRow(),
    microcosmCard(),
    surplusCard(),
    federatedCard(),
    conclusionCard(),
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
    <h3>The country is the county × ${Math.round(SCALE)}</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Midwestville is ${(COUNTY_POP / 1e3).toFixed(0)}k of the country's ${(US_POP / 1e6).toFixed(0)} million people.
      If the whole United States looked like it, every figure scales by the population ratio,
      ~${Math.round(SCALE)}×. So we can take the
      <a href="/mac-y20" style="color:var(--ok);">year-20 county model</a> and ask the national
      question directly: <strong>does a national MAC fund a national basic income?</strong>
      <br><br>
      The single county fell short because it only ever charged its own slice of nationwide
      companies. Going national should fix that — but the arithmetic has a twist.
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card">
    <div class="stats">
      ${statBox("US population", (N.pop / 1e6).toFixed(0) + "M", "~" + (N.displaced / 1e6).toFixed(0) + "M displaced by year 20", "var(--dim)")}
      ${statBox("National UBI · year 20", money(N.ubi), "basket-level, all unemployed", "var(--warn)")}
      ${statBox("Consumer-only MAC", money(N.consumerMac), (N.consumerCover * 100).toFixed(0) + "% of the UBI", "var(--crit)")}
      ${statBox("Automation surplus", money(N.savedWages), (N.surplusVsUbi).toFixed(1) + "× the UBI — wages automation stops paying", "var(--ok)")}
      ${statBox("Capture needed", (N.captureNeeded * 100).toFixed(0) + "%", "of the surplus, to fund the UBI", "var(--ok)")}
    </div>
  </div>`;
}

function microcosmCard() {
  return `
  <div class="card" style="border-left:3px solid var(--crit);">
    <h3>Going national doesn't change the ratio</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Scaled up, the consumer-business MAC raises <strong>${money(N.consumerMac)}</strong> — exactly
      <strong>${(N.consumerCover * 100).toFixed(0)}%</strong> of the <strong>${money(N.ubi)}</strong> national UBI.
      That is the <em>same</em> 30% it managed in one county, because the country is just the county
      repeated. Even 100% of all national consumer-business profit (${money(N.consumerProfit)}) is still
      below the bill.
      <br><br>
      So the answer to "will more counties cover it?" is <strong>no</strong> — adding jurisdictions
      doesn't raise the ratio of consumer profit to UBI. The fix was never <em>more of the same base</em>.
      It is a <em>wider</em> base.
    </div>
  </div>`;
}

function surplusCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>The money is there — economy-wide</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The ~${(N.displaced / 1e6).toFixed(0)} million Americans displaced by year 20 used to earn about
      <strong>${money(N.savedWages)}</strong> in wages — <strong>${(N.surplusVsUbi).toFixed(1)}×</strong>
      the ${money(N.ubi)} UBI (the UBI only has to replace income at basket level, below the old wage).
      When automation stops paying those wages, that money becomes <strong>profit somewhere in the
      economy</strong> — not just in the shops that sell the basket, but across manufacturing, logistics,
      business services, finance, the lot.
      <br><br>
      A MAC on that <strong>whole-economy</strong> profit only has to capture
      <strong>${(N.captureNeeded * 100).toFixed(0)}%</strong> of the surplus to fund the entire national
      UBI. The consumer slice was too small; the whole economy is more than big enough.
    </div>
  </div>`;
}

function federatedCard() {
  return `
  <div class="card">
    <h3>How it tiles the country</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The Market Access Charge is collected <strong>locally</strong>, where the sales land. So every
      jurisdiction charges each company for the business it does there, and a national firm — Amazon,
      United, an insurer, a streaming platform — pays its slice to <em>every</em> region it sells into.
      Summed across all of them, that is the firm's <strong>entire</strong> nationwide profit, captured
      without any central tax authority, and each region keeps what it collects to fund its own UBI.
      <br><br>
      That is exactly why one county looked too small: it was only ever holding one county's slice of
      national companies. The union of all the slices is the whole country.
    </div>
  </div>`;
}

function conclusionCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>So — does it cover the whole country?</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      <strong>Yes — but only as a national, whole-economy charge.</strong> Two conditions, both visible above:
      <ul style="margin:10px 0; padding-left:20px; line-height:1.7;">
        <li><strong>Whole-economy base, not consumer-only.</strong> The automation surplus
        (${money(N.savedWages)}) sits across the entire economy and exceeds the UBI; the consumer slice
        (${money(N.consumerMac)}) never will, at any number of counties.</li>
        <li><strong>Near-universal adoption.</strong> The charge is local, but the capital it taxes is
        national, so it has to be levied wherever those companies sell — i.e. everywhere.</li>
      </ul>
      The honest corollary: a <strong>single isolated pilot county cannot self-fund</strong> its UBI from a
      local MAC — it demonstrates the mechanism and relies on the wider system for the rest. The model is
      national by nature. Deeper margin expansion (basket deflation) and the multiplier
      <code style="color:var(--ok);">k</code> only widen the headroom further.
      <br><br>
      <span style="color:var(--faint); font-size:11px;">
        National figures are the Midwestville year-20 model scaled by population (×${Math.round(SCALE)}),
        assuming the country resembles the county. First-pass estimates throughout.
      </span>
    </div>
  </div>`;
}

render();
