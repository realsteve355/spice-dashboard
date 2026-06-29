// /mac-national — "The MAC distribution — winners and losers".
//
// Applies the actual MAC formula at national scale (year 20):
//   MAC_sector = k × revenue × (profit ÷ employees),  k set so Σ MAC = UBI.
// In aggregate it's affordable (total MAC < the wages automation removed, so firms
// keep the difference). But it lands unevenly: the most automated firms (high
// profit per employee) are NET LOSERS; labour-heavy firms are NET WINNERS.
//
// Loads maryfontaine.js (ramp) + mac-data.js. Scaled to the US by population.

const US_POP = 340e6, COUNTY_POP = 390000, SCALE = US_POP / COUNTY_POP;
const u1 = MF.unempRateAt(0) / 100, u20 = MF.unempRateAt(20) / 100;   // 85% — year 20
const RET = (1 - u20) / (1 - u1);
const WA = 240000, CH = 90000, AY = 31200, CY = 15600, AVG_WAGE = 60000;
const GROSS = 1.13;   // tax gross-up from the UBI page

const UBI = (WA * u20 * AY + CH * u20 * CY) * GROSS * SCALE;   // gross UBI = total MAC
const wageBillOld   = WA * (1 - u1) * AVG_WAGE * SCALE;        // before automation
const wagesLeft     = WA * (1 - u20) * AVG_WAGE * SCALE;       // still paid at year 20
const wagesFreedTot = wageBillOld - wagesLeft;
const firmsKeep     = wagesFreedTot - UBI;                     // aggregate, net of the charge

// Per sector: apply the formula.
const SECTORS = CATEGORIES.map(c => {
  const revenue = c.rev * SCALE;
  const profit  = c.rev * c.margin * SCALE;
  const emp     = (c.rev / c.rpe) * RET * SCALE;        // year-20 (automation-reduced) headcount
  const ppe     = profit / emp;                         // profit per employee — the dial
  const wagesFreed = (c.rev / c.rpe) * c.wage * (1 - RET) * SCALE;
  return { name: c.name, revenue, profit, ppe, wagesFreed, weight: revenue * ppe };
});
const totalWeight = SECTORS.reduce((s, x) => s + x.weight, 0);
const k = UBI / totalWeight;
SECTORS.forEach(s => { s.mac = k * s.weight; s.pctRev = s.mac / s.revenue; s.net = s.wagesFreed - s.mac; });
SECTORS.sort((a, b) => a.net - b.net);   // biggest net losers first
const losers  = SECTORS.filter(s => s.net < 0).length;
const overRev = SECTORS.filter(s => s.pctRev > 1).length;

const T = v => (v < 0 ? "−$" : "$") + (Math.abs(v) / 1e12).toFixed(2) + "T";
const M = v => v >= 1e6 ? "$" + (v / 1e6).toFixed(1) + "M" : "$" + Math.round(v / 1e3) + "k";

function render() {
  document.getElementById("results").innerHTML = [introCard(), statRow(), distTable(), noteCard()].join("\n");
}
function statBox(label, value, sub, color) {
  return `<div class="stat"><div class="label">${label}</div>
    <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
    <div class="sub">${sub}</div></div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>The charge applied, sector by sector</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6;">
      Each sector's charge is <strong>MAC = k × revenue × (profit ÷ employees)</strong>, with k set so the total
      equals the UBI. In aggregate it's affordable — the total MAC is less than the wages automation removed, so
      firms keep the difference. But it lands <strong>unevenly</strong>: the firms that gained most from automation
      (high profit per employee) are <span style="color:var(--crit);">net losers</span>; labour-heavy firms are
      <span style="color:var(--ok);">net winners</span>. (US = Midwestville × ${Math.round(SCALE)}, year 20.)
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card"><div class="stats">
    ${statBox("Old wage bill", T(wageBillOld), "before automation")}
    ${statBox("Total MAC = the UBI", T(UBI), "what the charge raises (gross)", "var(--warn)")}
    ${statBox("Firms keep, in aggregate", T(firmsKeep), "wages freed − MAC", "var(--ok)")}
    ${statBox("Net-loser sectors", losers + " of " + SECTORS.length, "pay more than they saved", "var(--crit)")}
  </div></div>`;
}

function distTable() {
  const rows = SECTORS.map(s => {
    const pctCol = s.pctRev > 1
      ? `<span style="color:var(--crit);">${(s.pctRev * 100).toFixed(0)}%</span>`
      : `${(s.pctRev * 100).toFixed(0)}%`;
    const netCol = `<span style="color:${s.net < 0 ? "var(--crit)" : "var(--ok)"};">${T(s.net)}</span>`;
    return `<tr>
      <td class="cat">${s.name}</td>
      <td class="num">${M(s.ppe)}</td>
      <td class="num">${T(s.mac)}</td>
      <td class="num">${pctCol}</td>
      <td class="num">${T(s.wagesFreed)}</td>
      <td class="num">${netCol}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Who pays, who comes out ahead</h3>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr>
        <th>Sector</th>
        <th class="num">Profit / emp</th>
        <th class="num">MAC</th>
        <th class="num">% of revenue</th>
        <th class="num">Wages freed</th>
        <th class="num">Net (freed − MAC)</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num">—</td>
        <td class="num"><strong>${T(UBI)}</strong></td>
        <td class="num">—</td>
        <td class="num">${T(wagesFreedTot)}</td>
        <td class="num"><strong style="color:var(--ok);">${T(firmsKeep)}</strong></td>
      </tr></tfoot>
    </table>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Net = the wages a sector saved to automation, minus its MAC. Positive = net winner; negative = net loser.
      Profit per employee is the dial that loads the charge.
    </div>
  </div>`;
}

function noteCard() {
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>What it shows — and the dial's limit</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      As expected, the automation winners — <strong>digital, utilities, finance</strong> — are the big net losers:
      already lean, they saved little in wages but carry most of the charge. Labour-heavy firms
      (<strong>housing, food</strong>) are net winners. That is the design working.
      <br><br>
      But the raw dial <strong>over-concentrates</strong>: <strong>${overRev} of ${SECTORS.length} sectors</strong>
      are assigned <em>more than 100% of their revenue</em> (digital ${(SECTORS[0].pctRev * 100).toFixed(0)}%) —
      impossible to actually collect. The principle is right; the unbounded profit-per-employee multiplier needs a
      bound so no firm is charged more than its transactions can bear.
    </div>
  </div>`;
}

render();
