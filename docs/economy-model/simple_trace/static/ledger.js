// Colony ledger — toy 4-person colony, full transaction trace for one month.
//
// 4 citizens:
//   Bob   — runs McDonald's franchise (internal-facing business with external obligations)
//   Alice — runs coffee shop (internal-facing business with external supplier costs)
//   John  — co-owner of pottery business (export earner — colony's USD inflow)
//   Jane  — co-owner of pottery business
//
// All MOND flows are tracked. Fisc reserve (USD) updates after each
// USD-affecting transaction.

// Track running balances per entity
function newState() {
  return {
    accounts: {
      'Bob':              { mond: 0, usd: 0 },
      'Alice':            { mond: 0, usd: 0 },
      'John':             { mond: 0, usd: 0 },
      'Jane':             { mond: 0, usd: 0 },
      "Bob's McDonald's": { mond: 0, usd: 0 },
      "Alice's Coffee":   { mond: 0, usd: 0 },
      'Fisc':             { mond: 0, usd: 0 },  // mond = total minted - retired (notional liability)
      'External':         { mond: 0, usd: 0 },  // sinks for outbound USD
    },
    events: [],
    fiscOverTime: [],  // [(day, reserveUsd)]
  };
}

function record(state, day, from, to, amount, currency, description) {
  // Update balances. MOND is held by accounts; USD circulates.
  const ev = { day, from, to, amount, currency, description };
  state.events.push(ev);

  if (currency === 'MOND') {
    if (from === 'Fisc')        { state.accounts.Fisc.mond += amount; }     // mint
    else                         { state.accounts[from].mond -= amount; }
    if (to === 'Fisc')           { state.accounts.Fisc.mond -= amount; }    // retire
    else                         { state.accounts[to].mond   += amount; }
  } else if (currency === 'USD') {
    state.accounts[from].usd -= amount;
    state.accounts[to].usd   += amount;
  }

  // Snapshot Fisc reserve after each USD-affecting transaction
  if (currency === 'USD') {
    state.fiscOverTime.push({ day, reserve: state.accounts.Fisc.usd });
  }
}

function readNum(id, def = 0) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? def : v;
}

function runMonth() {
  const setup = {
    ubi_mode:      document.getElementById('ubi_mode').value,
    ubi_floor:     readNum('ubi_floor', 600),
    ubi_universal: readNum('ubi_universal', 1000),
    fisc_start:    readNum('fisc_start', 10000),

    c_mcd:         readNum('c_mcd', 300),
    c_coffee:      readNum('c_coffee', 150),
    c_external:    readNum('c_external', 150),

    mcd_corp:      readNum('mcd_corp', 60) / 100,
    coffee_sup:    readNum('coffee_sup', 40) / 100,
    pottery_rev:   readNum('pottery_rev', 2000),
    pottery_sup:   readNum('pottery_sup', 20) / 100,
  };

  const state = newState();
  state.accounts.Fisc.usd = setup.fisc_start;
  state.fiscOverTime.push({ day: 0, reserve: setup.fisc_start });

  const citizens = ['Bob', 'Alice', 'John', 'Jane'];

  // ── Day 1: Compute business profits to determine means-tested UBI ──
  // Pre-compute the expected profit per citizen for this month, used by the
  // means-tested UBI calculation. (In reality this is messy — for our toy, we
  // assume profits are predictable monthly.)

  const totalMcdRev    = setup.c_mcd    * citizens.length;       // 4×300 = 1200
  const totalCoffeeRev = setup.c_coffee * citizens.length;       // 4×150 = 600
  const totalPotteryRev = setup.pottery_rev;                     // $2000 → 2000 MOND (parity)

  const bobProfit    = totalMcdRev    * (1 - setup.mcd_corp);    // 1200 × 0.4 = 480
  const aliceProfit  = totalCoffeeRev * (1 - setup.coffee_sup);  // 600 × 0.6  = 360
  const potteryProfit = totalPotteryRev * (1 - setup.pottery_sup); // 2000 × 0.8 = 1600
  const johnProfit   = potteryProfit / 2;
  const janeProfit   = potteryProfit / 2;

  const profitOf = { Bob: bobProfit, Alice: aliceProfit, John: johnProfit, Jane: janeProfit };

  function ubiFor(name) {
    if (setup.ubi_mode === 'universal') return setup.ubi_universal;
    return Math.max(0, setup.ubi_floor - profitOf[name]);
  }

  // ── Section: UBI issuance ──
  state.events.push({ section: 'Day 1 — UBI issuance' });
  for (const c of citizens) {
    const amt = ubiFor(c);
    if (amt > 0) {
      record(state, 1, 'Fisc', c, amt, 'MOND', setup.ubi_mode === 'universal'
        ? 'Universal UBI'
        : `Top-up to floor (${c}'s business profit ${profitOf[c].toFixed(0)} < floor)`);
    } else {
      state.events.push({ day: 1, from: 'Fisc', to: c, amount: 0, currency: 'MOND',
        description: `No UBI needed (${c}'s profit ${profitOf[c].toFixed(0)} ≥ floor)` });
    }
  }

  // ── Section: Citizens spend at McDonald's ──
  state.events.push({ section: 'Days 3-7 — McDonald\'s purchases' });
  citizens.forEach((c, i) => {
    record(state, 3 + i, c, "Bob's McDonald's", setup.c_mcd, 'MOND', 'Lunch');
  });

  // ── Section: Citizens spend at coffee ──
  state.events.push({ section: 'Days 8-12 — Coffee purchases' });
  citizens.forEach((c, i) => {
    record(state, 8 + i, c, "Alice's Coffee", setup.c_coffee, 'MOND', 'Coffee');
  });

  // ── Section: External imports ──
  state.events.push({ section: 'Days 13-17 — External imports (MOND → USD → External)' });
  citizens.forEach((c, i) => {
    const day = 13 + i;
    // Citizen converts MOND → USD at Fisc
    record(state, day, c, 'Fisc', setup.c_external, 'MOND', 'Convert for external import');
    record(state, day, 'Fisc', c, setup.c_external, 'USD', 'Boundary: MOND→USD (Fisc rate 1:1)');
    // Citizen sends USD to external
    record(state, day, c, 'External', setup.c_external, 'USD', 'Amazon/groceries/gas');
  });

  // ── Section: Pottery exports come in ──
  state.events.push({ section: 'Days 18-20 — Pottery exports (USD inflow)' });
  // External buyers pay John and Jane
  record(state, 18, 'External', 'John', setup.pottery_rev / 2, 'USD', 'Etsy pottery sales');
  record(state, 19, 'External', 'Jane', setup.pottery_rev / 2, 'USD', 'Etsy pottery sales');

  // ── Section: Pottery supplies ──
  state.events.push({ section: 'Day 21 — Pottery supplies' });
  const potterySuppliesPerOwner = setup.pottery_rev * setup.pottery_sup / 2;
  record(state, 21, 'John', 'External', potterySuppliesPerOwner, 'USD', 'Clay, kiln gas, postage');
  record(state, 21, 'Jane', 'External', potterySuppliesPerOwner, 'USD', 'Clay, kiln gas, postage');

  // ── Section: John & Jane convert remaining USD → MOND for internal use ──
  state.events.push({ section: 'Days 22-23 — John & Jane convert pottery proceeds to MOND' });
  const johnConvertAmt = state.accounts.John.usd;   // whatever they have left
  const janeConvertAmt = state.accounts.Jane.usd;
  record(state, 22, 'John', 'Fisc', johnConvertAmt, 'USD', 'Hand USD to Fisc');
  record(state, 22, 'Fisc', 'John', johnConvertAmt, 'MOND', 'Boundary: USD→MOND minted');
  record(state, 23, 'Jane', 'Fisc', janeConvertAmt, 'USD', 'Hand USD to Fisc');
  record(state, 23, 'Fisc', 'Jane', janeConvertAmt, 'MOND', 'Boundary: USD→MOND minted');

  // ── Section: Bob pays McDonald's corporate ──
  state.events.push({ section: 'Day 26 — McDonald\'s corporate fee' });
  const mcdCorpMond = totalMcdRev * setup.mcd_corp;
  record(state, 26, "Bob's McDonald's", 'Fisc', mcdCorpMond, 'MOND', 'Convert to USD for corporate');
  record(state, 26, 'Fisc', "Bob's McDonald's", mcdCorpMond, 'USD', 'Boundary: MOND→USD');
  record(state, 26, "Bob's McDonald's", 'External', mcdCorpMond, 'USD', 'McDonald\'s HQ franchise fee + supplies');

  // ── Section: Alice pays coffee supplier ──
  state.events.push({ section: 'Day 27 — Coffee supplier' });
  const coffeeSupMond = totalCoffeeRev * setup.coffee_sup;
  record(state, 27, "Alice's Coffee", 'Fisc', coffeeSupMond, 'MOND', 'Convert to USD for supplier');
  record(state, 27, 'Fisc', "Alice's Coffee", coffeeSupMond, 'USD', 'Boundary: MOND→USD');
  record(state, 27, "Alice's Coffee", 'External', coffeeSupMond, 'USD', 'Coffee bean wholesaler');

  // ── Section: Business profits passed to owners (book entry) ──
  state.events.push({ section: 'Day 30 — Business owners take month-end draw' });
  const bobNetMond   = state.accounts["Bob's McDonald's"].mond;
  const aliceNetMond = state.accounts["Alice's Coffee"].mond;
  if (bobNetMond > 0)   record(state, 30, "Bob's McDonald's", 'Bob',     bobNetMond,   'MOND', 'Owner draw (Bob = his McDonald\'s)');
  if (aliceNetMond > 0) record(state, 30, "Alice's Coffee",   'Alice',   aliceNetMond, 'MOND', 'Owner draw (Alice = her shop)');

  return { setup, state, profitOf };
}

// ── Rendering ──

function fmt(n, currency) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  const v = Math.abs(n) >= 1e6 ? (n/1e6).toFixed(2) + 'M' :
            Math.abs(n) >= 1e3 ? n.toLocaleString() : n.toFixed(0);
  return currency === 'USD' ? '$' + v : v;
}

function renderLog(state) {
  const tbody = document.querySelector('#log-table tbody');
  let html = '';
  let runningFisc = state.accounts.Fisc.usd; // we'll recompute as we walk
  // recompute the Fisc trail by simulating order again — easier: track per event
  let fisc = parseFloat(document.getElementById('fisc_start').value);
  for (const ev of state.events) {
    if (ev.section) {
      html += `<tr class="section"><td colspan="7">${ev.section}</td></tr>`;
      continue;
    }
    // Update Fisc reserve if USD transaction
    if (ev.currency === 'USD') {
      if (ev.from === 'Fisc') fisc -= ev.amount;
      else if (ev.to === 'Fisc') fisc += ev.amount;
    }
    const amtClass = ev.currency === 'USD' ? 'amt usd' : 'amt';
    const amtStr = ev.currency === 'USD' ? '$' + fmt(ev.amount, 'USD').replace('$','') : fmt(ev.amount, 'MOND');
    html += `<tr>
      <td class="day">${ev.day}</td>
      <td class="from">${ev.from}</td>
      <td class="to">${ev.to}</td>
      <td class="${amtClass}">${amtStr}</td>
      <td>${ev.currency}</td>
      <td class="desc">${ev.description}</td>
      <td class="fisc">$${fisc.toLocaleString()}</td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

function renderBalances(state) {
  const grid = document.getElementById('balance-grid');
  const entities = ['Bob', 'Alice', 'John', 'Jane', 'Fisc'];
  grid.innerHTML = entities.map(name => {
    const a = state.accounts[name];
    const isFisc = name === 'Fisc';
    return `
      <div class="balance-card${isFisc ? ' fisc' : ''}">
        <div class="name">${name}</div>
        <div class="row"><span class="lbl">MOND</span><span class="val">${fmt(a.mond, 'MOND')}</span></div>
        <div class="row"><span class="lbl">USD</span><span class="val">$${fmt(a.usd, 'USD').replace('$','')}</span></div>
      </div>
    `;
  }).join('');
}

function renderFlowCheck(state, setup) {
  // Compute the USD ledger: into Fisc, out of Fisc, net.
  let inflows = 0, outflows = 0;
  const inflowItems = [];
  const outflowItems = [];

  for (const ev of state.events) {
    if (ev.section) continue;
    if (ev.currency !== 'USD') continue;
    if (ev.to === 'Fisc') {
      inflows += ev.amount;
      inflowItems.push({ from: ev.from, desc: ev.description, amount: ev.amount });
    } else if (ev.from === 'Fisc') {
      outflows += ev.amount;
      outflowItems.push({ to: ev.to, desc: ev.description, amount: ev.amount });
    }
  }

  // Reduce items by source/destination + description
  function reduce(items) {
    const map = {};
    for (const item of items) {
      const key = (item.from || item.to) + '|' + item.desc;
      if (!map[key]) map[key] = { ...item, amount: 0 };
      map[key].amount += item.amount;
    }
    return Object.values(map);
  }

  const inRows = reduce(inflowItems);
  const outRows = reduce(outflowItems);

  const inflowHtml = inRows.map(r =>
    `<div class="row"><span>${r.from} — ${r.desc}</span><span>$${r.amount.toLocaleString()}</span></div>`
  ).join('');
  const outflowHtml = outRows.map(r =>
    `<div class="row"><span>${r.to} — ${r.desc}</span><span>$${r.amount.toLocaleString()}</span></div>`
  ).join('');

  const net = inflows - outflows;
  const netClass = net >= 0 ? 'var(--ok)' : 'var(--crit)';

  document.getElementById('flow-check').innerHTML = `
    <div class="flow">
      <div class="title">USD → Fisc (inflows)</div>
      ${inflowHtml}
      <div class="row total"><span>Total inflows</span><span>$${inflows.toLocaleString()}</span></div>
    </div>
    <div class="flow">
      <div class="title">Fisc → USD (outflows)</div>
      ${outflowHtml}
      <div class="row total"><span>Total outflows</span><span>$${outflows.toLocaleString()}</span></div>
      <div class="row total" style="border-top: 1px solid var(--line-hot); margin-top: 8px; padding-top: 8px;">
        <span>Net change to Fisc reserve</span>
        <span style="color: ${netClass}">${net >= 0 ? '+' : ''}$${net.toLocaleString()}</span>
      </div>
    </div>
  `;
}

function render() {
  const { setup, state, profitOf } = runMonth();
  renderLog(state);
  renderBalances(state);
  renderFlowCheck(state, setup);
}

// Wire up inputs
['ubi_mode','ubi_floor','ubi_universal','fisc_start',
 'c_mcd','c_coffee','c_external',
 'mcd_corp','coffee_sup','pottery_rev','pottery_sup'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  }
});

render();
