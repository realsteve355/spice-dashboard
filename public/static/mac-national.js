// /mac-national — "Scaling the MAC to the whole country".
//
// Scales the Midwestville year-20 model to the USA by population (×872) and
// shows, by sector, how much MAC the consumer base actually raises against the
// national year-20 UBI. Loads maryfontaine.js (ramp) + mac-data.js.

const US_POP = 340e6;
const COUNTY_POP = 390000;
const SCALE = US_POP / COUNTY_POP;          // ≈ 872

const u1 = MF.unempRateAt(0) / 100;
const u20 = MF.unempRateAt(20) / 100;        // 75% — year 20
const RETENTION = (1 - u20) / (1 - u1);
const WORKING_AGE = 240000, CHILDREN = 90000, ADULT_YR = 31200, CHILD_YR = 15600, AVG_WAGE = 60000;

// Year-20 per sector (same transform as /mac-y20: wages → profit), scaled national.
const SECTORS = CATEGORIES.map(c => {
  const p1 = c.rev * c.margin, e1 = c.rev / c.rpe, wb = e1 * c.wage;
  const emp = e1 * RETENTION, profit = p1 + wb * (1 - RETENTION);
  const mac = profit * Math.min(1, macRate(profit, emp));
  return { name: c.name, profit: profit * SCALE, mac: mac * SCALE };
}).sort((a, b) => b.mac - a.mac);

const UBI = (WORKING_AGE * u20 * ADULT_YR + CHILDREN * u20 * CHILD_YR) * SCALE;   // year-20 UBI
const PROFIT = SECTORS.reduce((s, x) => s + x.profit, 0);
const MAC = SECTORS.reduce((s, x) => s + x.mac, 0);                                // consumer-sector MAC
const SURPLUS = WORKING_AGE * (u20 - u1) * AVG_WAGE * SCALE;                       // whole-economy wages freed
const T = v => "$" + (v / 1e12).toFixed(2) + "T";

function render() {
  document.getElementById("results").innerHTML = [introCard(), statRow(), sectorTable(), conclusionCard()].join("\n");
}

function statBox(label, value, sub, color) {
  return `<div class="stat"><div class="label">${label}</div>
    <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
    <div class="sub">${sub}</div></div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>The country is Midwestville × ${Math.round(SCALE)}</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6;">
      If the whole US looked like the county, every figure scales by population. At
      <strong>year 20 — ${(u20 * 100).toFixed(0)}% unemployment</strong> — does a national MAC fund the
      national UBI?
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card"><div class="stats">
    ${statBox("National UBI · year 20", T(UBI), (u20 * 100).toFixed(0) + "% unemployment", "var(--warn)")}
    ${statBox("Consumer-sector MAC", T(MAC), "the 9 sectors below", "var(--crit)")}
    ${statBox("Share of UBI funded", (MAC / UBI * 100).toFixed(0) + "%", "consumer base alone", "var(--crit)")}
    ${statBox("Automation surplus", T(SURPLUS), (SURPLUS / UBI).toFixed(1) + "× the UBI · whole economy", "var(--ok)")}
  </div></div>`;
}

function sectorTable() {
  const max = Math.max(...SECTORS.map(s => s.mac));
  const rows = SECTORS.map(s => {
    const barPct = s.mac / max * 100;
    return `<tr>
      <td class="cat">${s.name}</td>
      <td class="num">${T(s.profit)}</td>
      <td class="num bar" style="background:linear-gradient(90deg, rgba(93,211,158,0.18) ${barPct.toFixed(0)}%, transparent ${barPct.toFixed(0)}%);">${T(s.mac)}</td>
      <td class="num">${(s.mac / MAC * 100).toFixed(0)}%</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>How the MAC is raised — consumer sectors (national, year 20)</h3>
    <table>
      <thead><tr><th>Sector</th><th class="num">Profit</th><th class="num">MAC</th><th class="num">Share</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num"><strong>${T(PROFIT)}</strong></td>
        <td class="num"><strong>${T(MAC)}</strong></td>
        <td class="num"><strong>${(MAC / UBI * 100).toFixed(0)}% of UBI</strong></td>
      </tr></tfoot>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      These nine consumer-facing sectors are the only base charged here. Even 100% of their profit (${T(PROFIT)})
      is below the ${T(UBI)} UBI — business-to-business, government and exports are untouched.
    </div>
  </div>`;
}

function conclusionCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>Does it cover the country?</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6;">
      Consumer sectors raise <strong>${(MAC / UBI * 100).toFixed(0)}%</strong> of the UBI — and no k changes
      that, since their whole profit is below the bill. But the whole-economy automation surplus
      (<strong>${T(SURPLUS)}</strong>, ${(SURPLUS / UBI).toFixed(1)}× the UBI) more than covers it. A
      <strong>whole-economy</strong> MAC, charged in every jurisdiction, funds the country.
      &nbsp;<a href="/calibration" style="color:var(--ok);">Calibrating k →</a>
    </div>
  </div>`;
}

render();
