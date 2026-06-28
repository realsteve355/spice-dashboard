// /mac-y20 — "The MAC at year 20".
//
// The SAME companies as the /mac (year 1) page, transformed by 20 years of
// automation. Base data + formula + formatters come from mac-data.js; the
// unemployment ramp comes from maryfontaine.js (MF.unempRateAt) — the same
// ramp the Employment page uses.
//
// The transform (per sector, all first-pass and deliberately simple):
//   • Revenue held at today's level (nominal) — isolates the employment effect.
//   • Employment falls with the ramp: retention r = (1−u20)/(1−u1) ≈ 0.26, so
//     ~74% of the workforce is gone.
//   • The wages no longer paid become PROFIT (automation removes the wage cost;
//     prices/revenue held). This is the optimistic "cheap robots" case — robot
//     capital/energy costs would temper it.
//   • Profit per employee therefore soars, so the MAC rate climbs with it.
//
// A logical ceiling of 100% is applied to the rate (you cannot charge more than
// the profit that exists); sectors that hit it are flagged.

const u1 = MF.unempRateAt(0) / 100;     // ≈ 0.042
const u20 = MF.unempRateAt(20) / 100;   // ≈ 0.75
const RETENTION = (1 - u20) / (1 - u1); // employment retained at year 20

// Required UBI at year 20 — same basis as the /ubi page (held here for the comparison).
const WORKING_AGE = 240000, CHILDREN = 90000, ADULT_YR = 31200, CHILD_YR = 15600;
const UBI_Y20 = WORKING_AGE * u20 * ADULT_YR + CHILDREN * u20 * CHILD_YR;

function deriveY20() {
  return CATEGORIES.map(c => {
    // Year 1 baseline
    const profit1 = c.rev * c.margin;
    const emp1 = c.rev / c.rpe;
    const wageBill1 = emp1 * c.wage;
    const macY1 = profit1 * macRate(profit1, emp1);
    // Year 20
    const emp = emp1 * RETENTION;
    const wagesSaved = wageBill1 * (1 - RETENTION);
    const profit = profit1 + wagesSaved;        // saved wages become profit
    const ppe = profit / emp;
    const rateRaw = macRate(profit, emp);
    const rate = Math.min(1, rateRaw);           // can't charge more than the profit
    const mac = profit * rate;
    return { ...c, profit1, emp1, macY1, emp, wagesSaved, profit, ppe, rateRaw, rate, mac, capped: rateRaw > 1 };
  });
}

let R, T;
function totals(R) {
  const t = { rev: 0, profit1: 0, emp1: 0, macY1: 0, emp: 0, profit: 0, mac: 0, wagesSaved: 0 };
  for (const r of R) {
    t.rev += r.rev; t.profit1 += r.profit1; t.emp1 += r.emp1; t.macY1 += r.macY1;
    t.emp += r.emp; t.profit += r.profit; t.mac += r.mac; t.wagesSaved += r.wagesSaved;
  }
  t.effRate = t.mac / t.profit;
  return t;
}

function render() {
  R = deriveY20();
  T = totals(R);
  document.getElementById("results").innerHTML = [
    introCard(),
    statRow(),
    table(),
    gapCard(),
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
    <h3>What changes by year 20</h3>
    <div style="font-size:11px; color:var(--warn); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">Snapshot · year 20 · 2046 (${(u20 * 100).toFixed(0)}% unemployment)</div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      These are the <strong>same companies</strong> as the
      <a href="/mac" style="color:var(--ok);">year-1 page</a>, after twenty years of automation.
      Revenue is held at today's level. Employment falls with the
      <a href="/unemployment" style="color:var(--ok);">employment ramp</a> —
      retention is <strong>${(RETENTION * 100).toFixed(0)}%</strong>, so roughly
      ${((1 - RETENTION) * 100).toFixed(0)}% of the workforce is gone. The wages no longer paid
      become <strong>profit</strong> (the robots do the work; prices held), so profit per employee
      soars and the MAC rate climbs with it.
    </div>
    <div class="formula">
      rate = <code>k</code> × 22% × (profit ÷ employees) ÷ $200,000 &nbsp;·&nbsp; <code>k = 1</code> &nbsp;·&nbsp; ceiling 100%<br>
      MAC = profit × rate
    </div>
    <div style="font-size:12px; color:var(--dim); line-height:1.7; margin-top:12px;">
      As before, <strong>k = 1 is the shape</strong>, not the funding level — k is the dial that scales the
      total to the UBI. What follows tests whether the <em>base</em> is big enough for any k to reach the
      bill. Optimistic "cheap robots" case — robot capital and energy costs would temper the profit rise.
      Revenue held nominal; basket deflation (which lowers the UBI bill) is a separate effect. First-pass estimates.
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card">
    <div class="stats">
      ${statBox("Employment · year 20", "~" + count(T.emp), "down from ~" + count(T.emp1) + " — automation", "var(--crit)")}
      ${statBox("County profit · year 20", money(T.profit), "up from " + money(T.profit1) + " — wages → profit", "var(--ok)")}
      ${statBox("Total MAC · shape (k = 1)", money(T.mac), "up from " + money(T.macY1) + " (year 1) — before calibration", "var(--ok)")}
      ${statBox("Required UBI · year 20", money(UBI_Y20), "from the UBI page", "var(--warn)")}
      ${statBox("Whole profit pool", money(T.profit), (T.profit / UBI_Y20 * 100).toFixed(0) + "% of the UBI — even 100% falls short", "var(--crit)")}
      ${statBox("Effective rate", pct(T.effRate), "of year-20 profit, at k = 1")}
    </div>
  </div>`;
}

function table() {
  const max = Math.max(...R.map(r => r.mac));
  const rows = R.slice().sort((a, b) => b.mac - a.mac).map(r => {
    const barPct = r.mac / max * 100;
    const rateCell = r.capped
      ? `${pct(r.rate)} <span style="color:var(--crit);">ceiling</span>`
      : pct(r.rate);
    return `<tr>
      <td class="cat">${r.name}</td>
      <td class="num">${money(r.profit)}</td>
      <td class="num">${n(r.emp)}</td>
      <td class="num">${money(r.ppe)}</td>
      <td class="num">${rateCell}</td>
      <td class="num">${money(r.macY1)}</td>
      <td class="num bar" style="background:linear-gradient(90deg, rgba(93,211,158,0.18) ${barPct.toFixed(0)}%, transparent ${barPct.toFixed(0)}%);">${money(r.mac)}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Year-20 profit, employees and the charge</h3>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr>
        <th>Sector</th>
        <th class="num">County profit (Y20)</th>
        <th class="num">Employees (Y20)</th>
        <th class="num">Profit / emp (Y20)</th>
        <th class="num">MAC rate</th>
        <th class="num">MAC · year 1</th>
        <th class="num">MAC · year 20</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num"><strong>${money(T.profit)}</strong></td>
        <td class="num"><strong>~${n(T.emp)}</strong></td>
        <td class="num">${money(T.profit / T.emp)}</td>
        <td class="num"><strong>${pct(T.effRate)}</strong></td>
        <td class="num">${money(T.macY1)}</td>
        <td class="num"><strong>${money(T.mac)}</strong></td>
      </tr></tfoot>
    </table>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Rate is the raw formula value, held to a 100% logical ceiling (you cannot charge more than the profit).
      Only the most automated sector breaches it — its uncapped rate would be far higher.
    </div>
  </div>`;
}

function gapCard() {
  const displaced = WORKING_AGE * (u20 - u1);
  const formerWages = displaced * 60000;  // ~avg county wage
  const allJobsY1 = WORKING_AGE * (1 - u1);     // employment page: all jobs, year 1
  const unemployedY20 = WORKING_AGE * u20;       // UBI page: all unemployed at year 20
  const macDisplaced = T.emp1 - T.emp;           // workers this MAC slice sheds
  const mismatch = unemployedY20 / macDisplaced;
  return `
  <div class="card" style="border-left:3px solid var(--crit);">
    <h3>The gap — and why a bigger k cannot close it</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      At k = 1 the shape raises <strong>${money(T.mac)}</strong> — about
      ${(T.mac / T.macY1).toFixed(0)}× the year-1 figure, as automation turns wages into profit and
      drives profit per employee through the roof. Normally k would now scale that up to the
      <strong>${money(UBI_Y20)}</strong> UBI — but here it can't.
      <br><br>
      Turning k up cannot conjure a base that isn't there: the county's <em>entire</em> consumer-business
      profit at year 20 is only <strong>${money(T.profit)}</strong> — less than the
      ${money(UBI_Y20)} bill. Even charging 100% of every firm's profit would fall short. The base is
      too small.
      <br><br>
      Seen through the <a href="/unemployment" style="color:var(--ok);">employment page</a>: it tracks all
      ~${count(allJobsY1)} of the county's jobs, but this MAC sees only the ~${count(T.emp1)} in
      consumer-facing business — under a quarter. Both fall at the same rate (to ${(RETENTION * 100).toFixed(0)}%),
      yet the UBI must support all ~${count(unemployedY20)} people unemployed by year 20, while this slice's
      automation frees up only ~${count(macDisplaced)} workers' wages — a <strong>${mismatch.toFixed(1)}×</strong>
      mismatch. The charge sees a quarter of the workforce but is asked to fund all of it.
      <br><br>
      The reason is scope. This MAC is levied on <strong>consumer-facing business only</strong>
      (the ${money(T.rev)} from the basket + discretionary spending). But automation eliminates wages
      across the <em>whole</em> economy: the ~${count(displaced)} displaced workers earned on the order
      of <strong>${money(formerWages)}</strong> in wages — far more than the UBI bill — and most of that
      sits outside this consumer slice (business-to-business, government, exports). To fund the UBI the
      MAC base must widen to the whole economy; with the basket also deflating (lowering the bill) and
      the multiplier <code style="color:var(--ok);">k</code> available, the gap can close — but not from
      consumer profit alone.
    </div>
  </div>`;
}

render();
