// /mac-national — "The MAC vs the wage bill — nationally".
//
// The MAC is a business expense in the place of wages. Total MAC = total UBI
// (set by k). So the real test isn't "is profit big enough" — it's whether the
// MAC is smaller than the WAGE BILL it replaces. It is: at year 20 firms pay
// (wages still paid + MAC) < the old wage bill, so they pay less AND fund the UBI.
//
// Scales the Midwestville year-20 model to the USA by population (×872).
// Loads maryfontaine.js (ramp) + mac-data.js.

const US_POP = 340e6, COUNTY_POP = 390000, SCALE = US_POP / COUNTY_POP;
const u1 = MF.unempRateAt(0) / 100, u20 = MF.unempRateAt(20) / 100;   // 85% — year 20
const RET = (1 - u20) / (1 - u1);
const WA = 240000, CH = 90000, AY = 31200, CY = 15600, AVG_WAGE = 60000;

// Whole-economy wage figures (ALL jobs), scaled national.
const wageBillOld = WA * (1 - u1) * AVG_WAGE * SCALE;     // what firms paid pre-automation
const wagesLeft   = WA * (1 - u20) * AVG_WAGE * SCALE;    // wages still paid at year 20
const UBI         = (WA * u20 * AY + CH * u20 * CY) * SCALE;   // = total MAC (by k)
const laborCostY20 = wagesLeft + UBI;                    // wages left + the MAC
const firmsKeep    = wageBillOld - laborCostY20;         // vs the old wage bill

// Per-sector distribution: who pays the larger SHARE (automation-weighted).
const SECTORS = CATEGORIES.map(c => {
  const p1 = c.rev * c.margin, e1 = c.rev / c.rpe, wb = e1 * c.wage;
  const emp = e1 * RET, profit = p1 + wb * (1 - RET);
  const weight = profit * Math.min(1, macRate(profit, emp));   // the k=1 shape = the relative weight
  return { name: c.name, weight };
}).sort((a, b) => b.weight - a.weight);
const totalWeight = SECTORS.reduce((s, x) => s + x.weight, 0);

const T = v => "$" + (v / 1e12).toFixed(2) + "T";

function render() {
  document.getElementById("results").innerHTML = [introCard(), statRow(), affordCard(), distTable(), sourceCard()].join("\n");
}
function statBox(label, value, sub, color) {
  return `<div class="stat"><div class="label">${label}</div>
    <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
    <div class="sub">${sub}</div></div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>The MAC replaces wages — is it smaller than the wage bill?</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6;">
      The MAC is a business expense in the place of wages, and k scales it so the total raised equals the
      total UBI. So funding isn't the question — it's funded by construction. The question is whether firms can
      <strong>bear</strong> it: is the MAC smaller than the wage bill it replaces? (US = Midwestville × ${Math.round(SCALE)}, year 20.)
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card"><div class="stats">
    ${statBox("Old wage bill", T(wageBillOld), "what firms paid before automation")}
    ${statBox("Total MAC = the UBI", T(UBI), (UBI / wageBillOld * 100).toFixed(0) + "% of the old wage bill", "var(--warn)")}
    ${statBox("Year-20 labour cost", T(laborCostY20), "wages still paid + the MAC", "var(--ok)")}
    ${statBox("Firms keep extra", T(firmsKeep), "vs the old wage bill — win-win", "var(--ok)")}
  </div></div>`;
}

function affordCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>It is affordable — firms pay less than before</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6;">
      At year 20 firms pay <strong>${T(wagesLeft)}</strong> in remaining wages + <strong>${T(UBI)}</strong> in MAC
      = <strong>${T(laborCostY20)}</strong> — less than the <strong>${T(wageBillOld)}</strong> wage bill they used
      to pay. They pay <strong>${T(firmsKeep)} less</strong>, and the UBI is fully funded. The displaced get a
      basket and their time. The MAC can fund the country precisely because it is smaller than the wages
      automation removed.
    </div>
  </div>`;
}

function distTable() {
  const max = SECTORS[0].weight;
  const rows = SECTORS.map(s => {
    const share = s.weight / totalWeight;
    const barPct = s.weight / max * 100;
    return `<tr>
      <td class="cat">${s.name}</td>
      <td class="num bar" style="background:linear-gradient(90deg, rgba(93,211,158,0.18) ${barPct.toFixed(0)}%, transparent ${barPct.toFixed(0)}%);">${(share * 100).toFixed(0)}%</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Who pays the larger share — the distribution</h3>
    <table>
      <thead><tr><th>Sector</th><th class="num">Share of the charge</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      The charge loads onto the most automated firms (highest profit per employee). Shown for the consumer-facing
      sectors; the same rule spreads it across the whole production chain. Profit-per-employee only sets the share —
      it is not what the charge is a percentage of.
    </div>
  </div>`;
}

function sourceCard() {
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>Source is revenue, not profit</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6;">
      The consumer-facing firms are only the point of sale; the charge spreads back through the whole production
      chain, whose combined wage bill (${T(wageBillOld)}) more than bears the ${T(UBI)} UBI. The source is the
      revenue and the wages the charge replaces — not profit. Profit only decides who pays the larger share, and
      k scales the total to the UBI (and may not be linear). &nbsp;<a href="/calibration" style="color:var(--ok);">Calibrating k →</a>
    </div>
  </div>`;
}

render();
