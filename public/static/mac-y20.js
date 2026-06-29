// /mac-y20 — "The MAC at year 20" (county scale, canonical formula).
//
// Applies MAC = k × revenue × (profit ÷ employees), k set so Σ MAC = the UBI.
// Year-20 profit = margin profit + the wages automation freed (revenue held, so
// saved wages drop to profit). Shows today → year 20 for each sector. No cap.

const u1 = MF.unempRateAt(0) / 100, u20 = MF.unempRateAt(20) / 100;
const RET = (1 - u20) / (1 - u1);
const WA = 240000, CH = 90000, AY = 31200, CY = 15600, GROSS = 1.13;
const UBI_TODAY = (WA * u1 * AY + CH * u1 * CY) * GROSS;
const UBI_Y20   = (WA * u20 * AY + CH * u20 * CY) * GROSS;

const SECTORS = CATEGORIES.map(c => {
  const revenue = c.rev;
  const emp1 = c.rev / c.rpe;                 // today's employees
  const emp  = emp1 * RET;                    // year-20 (automation-reduced)
  const wagesFreed = emp1 * c.wage * (1 - RET);
  const profit1 = c.rev * c.margin;            // today's margin profit
  const profit  = profit1 + wagesFreed;        // year-20: margin + freed wages
  return { name: c.name, revenue, profit1, profit, emp1, emp, wagesFreed,
    ppe: profit / emp, w1: revenue * (profit1 / emp1), w: revenue * (profit / emp) };
});
const tw1 = SECTORS.reduce((s, x) => s + x.w1, 0);
const tw  = SECTORS.reduce((s, x) => s + x.w, 0);
const k1 = UBI_TODAY / tw1, k = UBI_Y20 / tw;
SECTORS.forEach(s => { s.macToday = k1 * s.w1; s.mac = k * s.w; s.pctRev = s.mac / s.revenue; s.net = s.wagesFreed - s.mac; });
SECTORS.sort((a, b) => a.net - b.net);
const overRev = SECTORS.filter(s => s.pctRev > 1).length;

function render() {
  document.getElementById("results").innerHTML = [introCard(), statRow(), table(), noteCard()].join("\n");
}
function statBox(label, value, sub, color) {
  return `<div class="stat"><div class="label">${label}</div>
    <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
    <div class="sub">${sub}</div></div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>What changes by year 20</h3>
    <div style="font-size:11px; color:var(--warn); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">County · year 20 · ${(u20 * 100).toFixed(0)}% unemployment</div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The charge is <strong>MAC = k × revenue × (profit ÷ employees)</strong>. By year 20 employment falls with the
      <a href="/unemployment" style="color:var(--ok);">ramp</a> (retention ${(RET * 100).toFixed(0)}%), and the
      wages automation frees drop to <strong>profit</strong> (revenue held). So profit per employee soars and the
      charge loads onto the leanest firms. k rises with the UBI; there is no cap. National scale, the same
      arithmetic with winners and losers, is on the <a href="/mac-national" style="color:var(--ok);">National page</a>.
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card"><div class="stats">
    ${statBox("UBI today (= total MAC)", money(UBI_TODAY), (u1 * 100).toFixed(1) + "% unemployed", "var(--ok)")}
    ${statBox("UBI year 20 (= total MAC)", money(UBI_Y20), (u20 * 100).toFixed(0) + "% unemployed", "var(--warn)")}
    ${statBox("k · today → year 20", k1.toExponential(1) + " → " + k.toExponential(1), "rises with the UBI")}
    ${statBox("Sectors over 100% of revenue", overRev + " of " + SECTORS.length, "the dial over-concentrates", "var(--crit)")}
  </div></div>`;
}

function table() {
  const rows = SECTORS.map(s => {
    const pctCol = s.pctRev > 1 ? `<span style="color:var(--crit);">${(s.pctRev * 100).toFixed(0)}%</span>` : `${(s.pctRev * 100).toFixed(0)}%`;
    const netCol = `<span style="color:${s.net < 0 ? "var(--crit)" : "var(--ok)"};">${money(s.net)}</span>`;
    return `<tr>
      <td class="cat">${s.name}</td>
      <td class="num">${money(s.profit)}</td>
      <td class="num">${money(s.ppe)}</td>
      <td class="num">${money(s.macToday)}</td>
      <td class="num">${money(s.mac)}</td>
      <td class="num">${pctCol}</td>
      <td class="num">${netCol}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Each sector — today vs year 20</h3>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr>
        <th>Sector</th>
        <th class="num">Profit (Y20)</th>
        <th class="num">Profit / emp</th>
        <th class="num">MAC today</th>
        <th class="num">MAC Y20</th>
        <th class="num">% of revenue</th>
        <th class="num">Net (freed − MAC)</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num">—</td><td class="num">—</td>
        <td class="num">${money(UBI_TODAY)}</td>
        <td class="num"><strong>${money(UBI_Y20)}</strong></td>
        <td class="num">—</td><td class="num">—</td>
      </tr></tfoot>
    </table>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Profit (Y20) = margin profit + the wages automation freed. Net = wages freed − MAC.
      MAC totals each equal the UBI for that year (that's what k does).
    </div>
  </div>`;
}

function noteCard() {
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>Two limits at year 20</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The charge climbs from today's modest level to year 20, loading onto the most automated firms — the design
      working. But the same two limits as nationally show up: <strong>(1)</strong> the raw profit-per-employee dial
      <strong>over-concentrates</strong> (${overRev} of ${SECTORS.length} sectors over 100% of revenue), so it
      needs a bound; and <strong>(2)</strong> the whole charge sits on these few consumer-facing sectors, when it
      should fall on <em>every</em> firm with transactions in the area.
    </div>
  </div>`;
}

render();
