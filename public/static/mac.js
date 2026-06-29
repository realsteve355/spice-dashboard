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
//
// Base data, formula (K/BASE_RATE/REF_PPE/CATEGORIES/macRate) and formatters
// (money/count/n/pct) live in mac-data.js, loaded before this file and shared
// with /mac-y20.

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
      declares the profit it makes <strong>on its county sales</strong> (revenue × margin),
      and a share of its workforce is attributed to that business
      (county revenue ÷ revenue-per-employee). Both are <strong>county figures</strong>, not
      national totals — for a national chain it is the slice that serves Midwestville; for a
      local firm it is simply the firm. The Market Access Charge is then a charge on that
      county profit, at a rate that rises with the firm's profit <em>per employee</em>:
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
      <strong>k = 1 gives only the shape</strong> — <em>which</em> firms pay and in what proportion,
      not the funding level. k is the dial that scales the total up to the required UBI; it is not meant
      to sit at 1. So read the totals below as the distribution, before calibration.
      <br><br>
      Profit per employee here is the firm's <strong>company-wide</strong> figure
      (margin × revenue-per-employee), not a count of staff sitting in the county — an
      airline, a streaming service or an online casino may have <em>no</em> employees in
      Midwestville at all, yet sell heavily into it. What matters is how automated the
      firm is overall; the charge applies that rate to the profit it earns here.
      <br><br>
      The MAC is a <strong>business expense in the place of wages</strong>, not a slice of profit. Read the
      figures below as the <strong>distribution</strong> — each firm's relative share of the charge; k then scales
      the shares so the total equals the UBI. Affordability is the MAC vs the wage bill it replaces
      (<a href="/mac-national" style="color:var(--ok);">National →</a>), not vs profit.
      <br><br>
      These are <strong>today's</strong> figures — year 1, 2026. By year 20 automation
      pushes profit per employee up (raising each firm's share) even as employment falls, so the
      year-20 distribution differs; that evolution is a later page. First-pass estimates throughout.
    </div>
  </div>`;
}

function statRow() {
  return `
  <div class="card">
    <div class="stats">
      ${statBox("County profit / yr", money(T.profit), "from " + money(T.rev) + " county revenue")}
      ${statBox("Employees (county share)", "~" + n(T.emp), "workforce attributed to the county")}
      ${statBox("Transactions / yr", "~" + count(T.ntxn), "across all sectors")}
      ${statBox("Total MAC · shape (k = 1)", money(T.mac), "before calibration — k scales it to the UBI", "var(--ok)")}
      ${statBox("Effective rate", pct(T.effRate), "of declared profit, at k = 1")}
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
    <h3>County profit, employees and the charge</h3>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr>
        <th>Sector</th>
        <th class="num">County profit</th>
        <th class="num">Employees (county share)</th>
        <th class="num">Profit / emp (company-wide)</th>
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
      County profit and employees are <strong>attributed to the county's business</strong> — for national firms the
      slice serving Midwestville, not their national totals. Profit / emp is the firm's company-wide automation level
      and drives the rate.
      <br>
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
      (${pct(top3Mac / T.mac)}). Digital and media, on only ${money(R[6].rev)} of revenue,
      pay the highest rate because their profit per employee is enormous; groceries, retail and
      education — labour-heavy and thin-margin — pay almost nothing despite large turnover.
    </div>
  </div>`;
}

function nextCard() {
  // Required UBI figures are from the /ubi page (held here as reference points).
  const ubiToday = 0.373e9;
  const kToday = ubiToday / T.mac;
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>From shape to level — the role of k</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      At k = 1 the charge raises <strong>${money(T.mac)}/year</strong> — but that is the
      <strong>distribution</strong>, not the target. The job of k is to scale the whole pattern up to
      the <a href="/ubi" style="color:var(--ok);">required UBI</a> (${money(ubiToday)} today, at 4.2%
      unemployment). Here that would mean <strong>k ≈ ${kToday.toFixed(1)}</strong> — and because
      automation has lifted these firms' profit so far above their wage bill, paying it still leaves them
      better off than before. The displaced get a basket <em>and</em> their time back.
      <br><br>
      What k <em>cannot</em> do is conjure a base that isn't there. As automation deepens
      (<a href="/mac-y20" style="color:var(--ok);">year 20</a>) the UBI climbs to ${money(6.67e9)}, and
      the county's whole consumer-business profit is smaller than that — so no k closes it from consumer
      sales alone. The fix is a wider base (the whole economy,
      <a href="/mac-national" style="color:var(--ok);">nationally</a>), not a bigger k.
    </div>
  </div>`;
}

render();
