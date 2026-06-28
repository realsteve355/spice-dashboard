// /mac — "The Market Access Charge — Midwestville County".
//
// STEP 2 of the MAC, building directly on /companies. For each sector we add a
// declared margin (revenue -> profit), a revenue-per-employee (-> employees), and
// an average transaction size (-> number of transactions), then apply the charge.
//
// MAC formula (the 50% cap is removed for now — see macRate):
//     rate = k × 22% × (profit / employees) / $200,000
//     MAC  = profit × rate
// k = 1 here. The rate rises with profit PER EMPLOYEE: highly automated firms
// (few employees, fat profit) pay a high rate; labour-heavy, thin-margin firms
// pay almost nothing. That is the design, not an accident.
//
// All figures are first-pass illustrative estimates, to be refined. Sector
// revenues match the /companies page ($13B total).

const K = 1;
const BASE_RATE = 0.22;     // charge at the reference profit-per-employee
const RATE_CAP = 0.50;      // max share of profit (cap removed for now — see macRate)
const REF_PPE = 200000;     // profit-per-employee reference ($)

// rev ($/yr from county), margin (profit/rev), rpe (revenue per employee $),
// txn (avg transaction size $), cos (number of companies — from /companies),
// wage (average annual wage per employee $ — drives the wage bill).
const CATEGORIES = [
  { name: "Housing & real estate",     rev: 3.9e9, margin: 0.28, rpe: 350000, txn: 1200, cos: 4000, wage: 55000 },
  { name: "Food — grocery & dining",   rev: 2.4e9, margin: 0.08, rpe: 120000, txn:   35, cos: 1600, wage: 30000 },
  { name: "Transport, autos & travel", rev: 1.8e9, margin: 0.12, rpe: 400000, txn:   90, cos:  350, wage: 55000 },
  { name: "Healthcare & pharma",       rev: 1.3e9, margin: 0.12, rpe: 200000, txn:  180, cos:  550, wage: 65000 },
  { name: "Retail goods & e-commerce", rev: 1.2e9, margin: 0.06, rpe: 250000, txn:   55, cos:  900, wage: 38000 },
  { name: "Utilities & telecom",       rev: 1.0e9, margin: 0.20, rpe: 800000, txn:  150, cos:   20, wage: 90000 },
  { name: "Digital, media & gambling", rev: 0.7e9, margin: 0.35, rpe: 1500000, txn:  20, cos:  150, wage: 120000 },
  { name: "Financial services",        rev: 0.4e9, margin: 0.25, rpe: 600000, txn:  250, cos:  220, wage: 95000 },
  { name: "Education & training",      rev: 0.3e9, margin: 0.08, rpe: 120000, txn:  400, cos:  110, wage: 50000 },
];

function macRate(profit, emp) {
  // Cap removed for now — reinstate with Math.min(RATE_CAP, …)
  return K * BASE_RATE * (profit / emp) / REF_PPE;
}

function derive() {
  return CATEGORIES.map(c => {
    const profit = c.rev * c.margin;
    const emp = c.rev / c.rpe;
    const ppe = profit / emp;
    const rate = macRate(profit, emp);
    const mac = profit * rate;
    const ntxn = c.rev / c.txn;
    const wageBill = emp * c.wage;
    return { ...c, profit, emp, ppe, rate, mac, ntxn, wageBill,
      macPerCo: mac / c.cos, macPerTxn: mac / ntxn,
      wageBillPerCo: wageBill / c.cos, macPctRev: mac / c.rev };
  });
}

function money(v) {
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return "$" + Math.round(v / 1e3) + "k";
  return "$" + (v >= 100 ? Math.round(v) : v.toFixed(2));
}
function count(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return Math.round(v / 1e3) + "k";
  return Math.round(v).toLocaleString();
}
const n = v => Math.round(v).toLocaleString();
const pct = v => (v * 100).toFixed(1) + "%";

let R, T;
function totals(R) {
  const t = { rev: 0, profit: 0, emp: 0, mac: 0, ntxn: 0, cos: 0, wageBill: 0 };
  for (const r of R) { t.rev += r.rev; t.profit += r.profit; t.emp += r.emp; t.mac += r.mac; t.ntxn += r.ntxn; t.cos += r.cos; t.wageBill += r.wageBill; }
  t.effRate = t.mac / t.profit;
  return t;
}

function render() {
  R = derive();
  T = totals(R);
  document.getElementById("results").innerHTML = [
    introCard(),
    statRow(),
    chargeTable(),
    txnTable(),
    whoPaysCard(),
    nextCard(),
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
    <h3>How the charge is computed</h3>
    <div style="font-size:11px; color:var(--ok); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">Snapshot · year 1 · 2026 (today)</div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Taking the ${money(T.rev)} of business done in the county
      (<a href="/companies" style="color:var(--ok);">previous page</a>), each sector
      declares a profit margin, an employee count, and an average transaction size.
      The Market Access Charge is then a charge on profit whose rate rises with profit
      <em>per employee</em>:
    </div>
    <div class="formula">
      rate = <code>k</code> × 22% × (profit ÷ employees) ÷ $200,000 &nbsp;·&nbsp; <code>k = 1</code><br>
      MAC = profit × rate
    </div>
    <div style="font-size:12px; color:var(--dim); line-height:1.7; margin-top:12px;">
      A firm earning the reference $200,000 profit per employee pays 22%. Highly
      automated firms — few employees, fat profit — pay proportionally more, with no
      ceiling for now; labour-heavy, thin-margin firms (groceries, restaurants, shops)
      pay almost nothing. The charge targets automation, by design.
      <br><br>
      These are <strong>today's</strong> figures — year 1, 2026. By year 20 automation
      pushes profit per employee up (raising MAC rates) even as employment falls, so the
      year-20 charge differs; that evolution is a later page. First-pass estimates throughout.
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card">
    <div class="stats">
      ${statBox("Declared profit / yr", money(T.profit), "from " + money(T.rev) + " revenue")}
      ${statBox("Employees", "~" + n(T.emp), "attributed to county business")}
      ${statBox("Transactions / yr", "~" + count(T.ntxn), "across all sectors")}
      ${statBox("Total MAC (k = 1)", money(T.mac), "per year", "var(--ok)")}
      ${statBox("Effective rate", pct(T.effRate), "of declared profit")}
      ${statBox("Avg MAC / company", money(T.mac / T.cos), "skewed — see table")}
    </div>
  </div>`;
}

function chargeTable() {
  const max = Math.max(...R.map(r => r.mac));
  const rows = R.slice().sort((a, b) => b.mac - a.mac).map(r => {
    const barPct = r.mac / max * 100;
    return `<tr>
      <td class="cat">${r.name}</td>
      <td class="num">${money(r.profit)}</td>
      <td class="num">${n(r.emp)}</td>
      <td class="num">${money(r.ppe)}</td>
      <td class="num">${pct(r.rate)}</td>
      <td class="num bar" style="background:linear-gradient(90deg, rgba(93,211,158,0.18) ${barPct.toFixed(0)}%, transparent ${barPct.toFixed(0)}%);">${money(r.mac)}</td>
      <td class="num">${money(r.macPerCo)}</td>
      <td class="num">${money(r.wageBillPerCo)}</td>
      <td class="num">${pct(r.macPctRev)}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Declared profit, employees and the charge</h3>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr>
        <th>Sector</th>
        <th class="num">Declared profit</th>
        <th class="num">Employees</th>
        <th class="num">Profit / emp</th>
        <th class="num">MAC rate</th>
        <th class="num">MAC / yr</th>
        <th class="num">MAC / company</th>
        <th class="num">Avg wage bill / co</th>
        <th class="num">MAC % of rev</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num"><strong>${money(T.profit)}</strong></td>
        <td class="num"><strong>~${n(T.emp)}</strong></td>
        <td class="num">${money(T.profit / T.emp)}</td>
        <td class="num"><strong>${pct(T.effRate)}</strong></td>
        <td class="num"><strong>${money(T.mac)}</strong></td>
        <td class="num">${money(T.mac / T.cos)}</td>
        <td class="num">${money(T.wageBill / T.cos)}</td>
        <td class="num"><strong>${pct(T.mac / T.rev)}</strong></td>
      </tr></tfoot>
    </table>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Avg wage bill / company = attributed employees × average sector wage, divided by the number of companies —
      a yardstick for the charge (the MAC is meant to sit alongside wages as a business expense). Total wage bill
      ${money(T.wageBill)}/yr. MAC % of rev = the charge as a share of the sector's county sales (= margin × rate).
    </div>
  </div>`;
}

function txnTable() {
  const rows = R.slice().sort((a, b) => b.ntxn - a.ntxn).map(r => `
    <tr>
      <td class="cat">${r.name}</td>
      <td class="num">${money(r.txn)}</td>
      <td class="num">${count(r.ntxn)}</td>
      <td class="num">${money(r.mac)}</td>
      <td class="num">${money(r.macPerTxn)}</td>
    </tr>`).join("");
  return `
  <div class="card">
    <h3>Transactions — number, size and the charge per transaction</h3>
    <table>
      <thead><tr>
        <th>Sector</th>
        <th class="num">Avg transaction</th>
        <th class="num">Transactions / yr</th>
        <th class="num">MAC / yr</th>
        <th class="num">MAC / transaction</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num">—</td>
        <td class="num"><strong>~${count(T.ntxn)}</strong></td>
        <td class="num"><strong>${money(T.mac)}</strong></td>
        <td class="num">${money(T.mac / T.ntxn)}</td>
      </tr></tfoot>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Average transaction sizes are blended per sector (a monthly rent and a coffee sit in different rows).
      MAC per transaction is the charge implied if it were collected at the point of sale.
    </div>
  </div>`;
}

function whoPaysCard() {
  const ranked = R.slice().sort((a, b) => b.mac - a.mac);
  const top3 = ranked.slice(0, 3);
  const top3Mac = top3.reduce((s, r) => s + r.mac, 0);
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>Who actually pays</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The charge is concentrated, but not on the biggest sellers — on the most
      <em>profitable per employee</em>. The top three —
      <strong>${top3.map(r => r.name.replace(/ —.*/, "")).join(", ")}</strong> —
      contribute ${money(top3Mac)} of the ${money(T.mac)} total
      (${pct(top3Mac / T.mac)}). Digital and gambling, on only ${money(R[6].rev)} of revenue,
      pay the highest rate because their profit per employee is enormous; groceries, retail and
      education — labour-heavy and thin-margin — pay almost nothing despite large turnover.
    </div>
  </div>`;
}

function nextCard() {
  // Required UBI figures are from the /ubi page (held here as reference points).
  const ubiToday = 0.373e9, ubiY20 = 6.67e9;
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>The reckoning — MAC vs the UBI bill</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      At k = 1 the charge raises <strong>${money(T.mac)}/year</strong>. The
      <a href="/ubi" style="color:var(--ok);">required UBI</a> is ${money(ubiToday)} today
      (at 4.2% unemployment) and climbs to ${money(ubiY20)} by year 20 (at 75%).
      So today's MAC nearly covers today's bill, but falls far short of the automated
      end-state. Closing that gap is the next question — through the charge multiplier
      <code style="color:var(--ok);">k</code>, a broader base (business-to-business and
      government), and the basket deflation that lowers the bill over time. That funding
      comparison, year by year, is the next page.
    </div>
  </div>`;
}

render();
