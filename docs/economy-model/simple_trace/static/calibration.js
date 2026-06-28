// /calibration — "Calibrating k".
//
// k is the dial: set it so the total MAC equals the required UBI, then read off
// the profit left with the companies. Done for today (year 1) and the automated
// end-state (year 20). Uses mac-data.js (base + formula) + maryfontaine.js (ramp).

const u1 = MF.unempRateAt(0) / 100;
const u20 = MF.unempRateAt(20) / 100;
const RET = (1 - u20) / (1 - u1);
const WA = 240000, CH = 90000, AY = 31200, CY = 15600, AVG_WAGE = 60000;

const ubiAt = u => WA * u * AY + CH * u * CY;
const UBI_TODAY = ubiAt(u1);
const UBI_Y20 = ubiAt(u20);

// Year-1 per sector.
function deriveY1() {
  return CATEGORIES.map(c => {
    const profit = c.rev * c.margin, emp = c.rev / c.rpe;
    const rate1 = macRate(profit, emp);
    return { name: c.name, profit, rate1, mac1: profit * rate1 };
  });
}
// Year-20 per sector (the /mac-y20 transform: wages -> profit).
function deriveY20() {
  return CATEGORIES.map(c => {
    const p1 = c.rev * c.margin, e1 = c.rev / c.rpe, wb = e1 * c.wage;
    const emp = e1 * RET, profit = p1 + wb * (1 - RET);
    const rate1 = macRate(profit, emp);
    return { name: c.name, profit, rate1, mac1: profit * Math.min(1, rate1) };
  });
}

const Y1 = deriveY1(), Y20 = deriveY20();
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);

const profitY1 = sum(Y1, x => x.profit), macK1Y1 = sum(Y1, x => x.mac1);
const profitY20 = sum(Y20, x => x.profit), macK1Y20 = sum(Y20, x => x.mac1);
const K_TODAY = UBI_TODAY / macK1Y1;
const K_Y20 = UBI_Y20 / macK1Y20;
const freedWages = WA * (u20 - u1) * AVG_WAGE;   // wages automation stops paying, economy-wide

function render() {
  document.getElementById("results").innerHTML = [
    introCard(),
    todayCard(),
    endstateConsumerCard(),
    wholeEconomyCard(),
    chickenEggCard(),
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
    <h3>The calibration</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The formula decides <em>who</em> pays; <strong>k</strong> sets the level. To fund the basic income
      you turn k until the total charge equals the required UBI:
    </div>
    <div class="formula">
      k = required UBI ÷ MAC(k = 1) &nbsp;·&nbsp; then &nbsp; profit kept = profit − MAC
    </div>
    <div style="font-size:12px; color:var(--dim); line-height:1.7; margin-top:12px;">
      Below: today, and the automated end-state (year 20). The only ceiling is that no firm can pay more
      than 100% of its profit — which is exactly where the consumer-only base runs out.
    </div>
  </div>`;
}

function todayCard() {
  const macTotal = UBI_TODAY;                 // by construction
  const kept = profitY1 - macTotal;
  const rows = Y1.slice().sort((a, b) => b.profit - a.profit).map(r => {
    const rate = Math.min(1, K_TODAY * r.rate1);
    const mac = r.profit * rate;
    const left = r.profit - mac;
    return `<tr>
      <td class="cat">${r.name}</td>
      <td class="num">${money(r.profit)}</td>
      <td class="num">${pct(rate)}</td>
      <td class="num">${money(mac)}</td>
      <td class="num">${money(left)}</td>
      <td class="num">${pct(left / r.profit)}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>Today — k ≈ ${K_TODAY.toFixed(1)} funds the UBI, firms keep ${(kept / profitY1 * 100).toFixed(0)}%</h3>
    <div class="stats">
      ${statBox("Required UBI", money(UBI_TODAY), "at " + (u1 * 100).toFixed(1) + "% unemployment")}
      ${statBox("k to fund it", "≈ " + K_TODAY.toFixed(2), "= UBI ÷ MAC(k=1)", "var(--ok)")}
      ${statBox("Total profit", money(profitY1), "consumer business")}
      ${statBox("Profit kept by firms", money(kept), (kept / profitY1 * 100).toFixed(0) + "% of profit", "var(--ok)")}
    </div>
    <table style="margin-top:14px;">
      <thead><tr>
        <th>Sector</th>
        <th class="num">Profit</th>
        <th class="num">MAC rate (k=${K_TODAY.toFixed(1)})</th>
        <th class="num">MAC</th>
        <th class="num">Profit kept</th>
        <th class="num">% kept</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num"><strong>${money(profitY1)}</strong></td>
        <td class="num">${pct(macTotal / profitY1)}</td>
        <td class="num"><strong>${money(macTotal)}</strong></td>
        <td class="num"><strong>${money(kept)}</strong></td>
        <td class="num"><strong>${pct(kept / profitY1)}</strong></td>
      </tr></tfoot>
    </table>
    <div style="font-size:12px; color:var(--dim); margin-top:10px; line-height:1.6;">
      A small k (~${K_TODAY.toFixed(1)}) covers today's bill and the firms keep the overwhelming majority of profit.
      Only the most automated sectors pay a noticeable rate; the rest are barely touched. The win-win holds easily —
      but at 4.2% unemployment almost no one is displaced yet.
    </div>
  </div>`;
}

function endstateConsumerCard() {
  const shortfall = UBI_Y20 - profitY20;
  return `
  <div class="card" style="border-left:3px solid var(--crit);">
    <h3>Year 20 — the consumer base runs out before k can</h3>
    <div class="stats">
      ${statBox("Required UBI", money(UBI_Y20), "at " + (u20 * 100).toFixed(0) + "% unemployment", "var(--warn)")}
      ${statBox("k that would be needed", "≈ " + K_Y20.toFixed(1), "UBI ÷ MAC(k=1)")}
      ${statBox("Total consumer profit", money(profitY20), "the entire pool")}
      ${statBox("Profit kept by firms", "—", "even 100% short by " + money(shortfall), "var(--crit)")}
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:12px;">
      The dial would have to reach <strong>k ≈ ${K_Y20.toFixed(1)}</strong> — but it can't get there. The whole
      consumer-business profit pool is <strong>${money(profitY20)}</strong>, below the <strong>${money(UBI_Y20)}</strong>
      bill. You cannot take more than 100% of profit, so there is simply <strong>nothing left for the firms</strong>,
      and the UBI is still ${money(shortfall)} short. This is a base problem, not a k problem — the charge is sitting
      on too small a slice of the economy.
    </div>
  </div>`;
}

function wholeEconomyCard() {
  const macTake = UBI_Y20;
  const employerKeeps = freedWages - macTake;
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>Year 20 — on the whole economy, the win-win is real</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Widen the base and the arithmetic flips. Across the whole economy, automation stops paying
      <strong>${money(freedWages)}</strong> of wages — and that money becomes profit. Funding the entire
      <strong>${money(UBI_Y20)}</strong> UBI takes just
      <strong>${(macTake / freedWages * 100).toFixed(0)}%</strong> of that freed-up profit:
    </div>
    <div class="stats">
      ${statBox("Wages → profit", money(freedWages), "freed by automation, economy-wide", "var(--ok)")}
      ${statBox("MAC = the UBI", money(macTake), (macTake / freedWages * 100).toFixed(0) + "% of the freed profit", "var(--warn)")}
      ${statBox("Extra profit kept", money(employerKeeps), (employerKeeps / freedWages * 100).toFixed(0) + "% — on top of pre-automation profit", "var(--ok)")}
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7; margin-top:14px;">
      So the firms end up with <strong>${money(employerKeeps)} more</strong> profit than before automation —
      they kept the whole wage bill except the slice that funds the UBI. The displaced get a basket, and they get
      their time back. Three ways the automation windfall is split:
      <ul style="margin:10px 0; padding-left:20px; line-height:1.7;">
        <li><strong>Citizens — income:</strong> the UBI, ${money(macTake)} (a basket for everyone).</li>
        <li><strong>Citizens — time:</strong> the work no longer needed — the time dividend.</li>
        <li><strong>Companies — profit:</strong> ${money(employerKeeps)} extra, and they're better off than before.</li>
      </ul>
      The number that makes it work: the UBI only replaces income at <em>basket</em> level, well below the old
      wage — so the wages automation frees up (${money(freedWages)}) are larger than the bill (${money(UBI_Y20)}),
      and everyone can come out ahead.
      <br><br>
      <span style="color:var(--faint); font-size:11px;">
        Freed-wages framing avoids double-counting pre-existing profit. The exact k depends on the whole-economy
        profit-per-employee mix (a model still to build); what's fixed is the size of the pool and the take.
        First-pass estimates.
      </span>
    </div>
  </div>`;
}

function chickenEggCard() {
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>The chicken-and-egg — and how it's broken</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The charge is weighted by profit per employee — but profit in the accounts is revenue minus costs minus
      wages minus the MAC. So profit seems to depend on the charge, which depends on profit. Circular.
      <br><br>
      It's broken the way income tax is: the charge is assessed on <strong>pre-charge profit</strong>
      (revenue − costs − the reduced wages), then booked as an expense. The weight uses the pre-charge figure,
      which doesn't contain the MAC, so there's no loop. <strong>Post-charge profit = pre-charge profit − MAC.</strong>
      The only real limit is solvency — a firm's MAC can't exceed its pre-charge profit — which holds across the
      whole economy because the total UBI is smaller than the wages automation freed.
    </div>
  </div>`;
}

render();
