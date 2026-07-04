// /calibration — "Calibrating k".
//
// k is set so the total charge equals the UBI:  k = UBI ÷ Σ(revenue × profit/emp).
// Shown today and at year 20. Year-20 profit = margin + the wages automation freed.
// In aggregate the charge is affordable — it's smaller than the wages it replaces,
// so firms keep the difference.

const u1 = MF.unempRateAt(0) / 100, u20 = MF.unempRateAt(20) / 100;
const WA = 240000, CH = 90000, AY = 31200, CY = 15600, AVG_WAGE = 60000, GROSS = 1.13;
const UBI_TODAY = (WA * u1 * AY + CH * u1 * CY) * GROSS;
const UBI_Y20   = (WA * u20 * AY + CH * u20 * CY) * GROSS;

// Σ(revenue × profit-per-employee) at a given unemployment level, corrected profit.
function sigma(u) {
  const RET = (1 - u) / (1 - u1);
  return CATEGORIES.reduce((s, c) => {
    const emp1 = c.rev / c.rpe, emp = emp1 * RET;
    const wagesFreed = emp1 * c.wage * (1 - RET);
    const profit = c.rev * c.margin + wagesFreed;
    return s + c.rev * (profit / emp);
  }, 0);
}
const tw1 = sigma(u1), tw20 = sigma(u20);
const k1 = UBI_TODAY / tw1, k20 = UBI_Y20 / tw20;

const freedWages   = WA * (u20 - u1) * AVG_WAGE;   // wages automation stops paying, whole economy
const employerKeeps = freedWages - UBI_Y20;

function render() {
  document.getElementById("results").innerHTML = [introCard(), statRow(), winwinCard(), chickenEggCard()].join("\n");
}
function statBox(label, value, sub, color) {
  return `<div class="stat"><div class="label">${label}</div>
    <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
    <div class="sub">${sub}</div></div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>Setting k</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The formula <em>distributes</em> the charge; <strong>k</strong> sets its size. k is whatever makes the total
      charge equal the UBI — the UBI divided by the sum, over every firm, of revenue × profit-per-employee:
    </div>
    <div style="background:var(--panel2); border:1px solid var(--line-hot); padding:12px 16px; margin-top:12px; font-size:13px; color:var(--txt);">
      k = UBI ÷ Σ( revenue × profit ÷ employees )
    </div>
    <div style="font-size:12px; color:var(--dim); line-height:1.7; margin-top:12px;">
      It rises as the UBI grows (more people displaced) and as profit-per-employee climbs (fewer staff). The
      per-sector charge it produces is on the <a href="/mac" style="color:var(--ok);">MAC</a> and
      <a href="/mac-y20" style="color:var(--ok);">year-20</a> pages.
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card"><div class="stats">
    ${statBox("UBI today (= total MAC)", money(UBI_TODAY), (u1 * 100).toFixed(1) + "% unemployed", "var(--ok)")}
    ${statBox("k today", k1.toExponential(2), "small UBI → small k")}
    ${statBox("UBI year 20 (= total MAC)", money(UBI_Y20), (u20 * 100).toFixed(0) + "% unemployed", "var(--warn)")}
    ${statBox("k year 20", k20.toExponential(2), "× " + (k20 / k1).toFixed(1) + " vs today")}
  </div></div>`;
}

function winwinCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>Affordable — and a three-way win</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The total charge is the UBI, <strong>${money(UBI_Y20)}</strong>. Across the whole economy automation frees
      <strong>${money(freedWages)}</strong> of wages — more than the UBI — so funding it takes only
      <strong>${(UBI_Y20 / freedWages * 100).toFixed(0)}%</strong> of the freed wages, and firms keep the rest:
    </div>
    <div class="stats">
      ${statBox("Wages automation frees", money(freedWages), "whole economy", "var(--ok)")}
      ${statBox("MAC = the UBI", money(UBI_Y20), (UBI_Y20 / freedWages * 100).toFixed(0) + "% of freed wages", "var(--warn)")}
      ${statBox("Firms keep", money(employerKeeps), "on top of pre-automation profit", "var(--ok)")}
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:14px;">
      Three ways the automation windfall splits: <strong>citizens' income</strong> (the UBI), <strong>citizens'
      time</strong> (the work no longer needed), and <strong>companies' profit</strong> (${money(employerKeeps)}
      extra). It works because the UBI replaces income only at <em>basket</em> level, below the old wage — so the
      wages freed are larger than the bill.
      <br><br>
      <span style="color:var(--faint); font-size:11px;">
        This is the aggregate. The per-firm distribution still over-concentrates on the most automated sectors
        (see National) — the profit-per-employee dial needs a bound, and the base should be every firm in the area.
      </span>
    </div>
  </div>`;
}

function chickenEggCard() {
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>The chicken-and-egg — and how it's broken</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The charge is weighted by profit per employee — but profit is revenue minus costs minus wages minus the MAC.
      So profit seems to depend on the charge, which depends on profit. Circular.
      <br><br>
      It's broken the way income tax is: the charge is assessed on the firm's <strong>declared (pre-charge)
      profit</strong>, then booked as an expense. The weight uses the figure already on the books, so there's no
      loop within a quarter — the MAC simply lands in the next quarter's profit. Run quarterly, it settles.
    </div>
  </div>`;
}

render();
