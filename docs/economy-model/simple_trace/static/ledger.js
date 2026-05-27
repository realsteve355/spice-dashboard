// Colony ledger — toy 4-person colony, full transaction trace for one month.
//
// Model assumption (post-simplification):
//   - Citizens and businesses hold MOND only.
//   - External companies hold USD only (we don't track them in detail except for MPC).
//   - The Fisc sits at the boundary. It holds a USD reserve and tracks MOND outstanding.
//   - Any "external" transaction (import, export, supplier payment, corporate fee) is
//     shown as ONE event from the citizen/business perspective in MOND, with the Fisc's
//     USD reserve adjusting silently. Boundary conversion is at 1 MOND = 1 USD.
//
// 4 citizens:
//   Bob   — runs McDonald's franchise (internal-facing biz with external obligations)
//   Alice — runs coffee shop (internal-facing biz with external supplier costs)
//   John, Jane — co-owners of pottery business (export earners, colony's USD inflow)

function newState() {
  return {
    accounts: {
      'Bob':              { mond: 0 },
      'Alice':            { mond: 0 },
      'John':             { mond: 0 },
      'Jane':             { mond: 0 },
      "Bob's McDonald's": { mond: 0 },
      "Alice's Coffee":   { mond: 0 },
    },
    fiscUsd: 0,
    mondOutstanding: 0,  // total MOND minted - retired
    events: [],
    mpcAccrued: {},  // by recipient: external company → USD revenue from MF
  };
}

function readNum(id, def = 0) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? def : v;
}

// ── Event helpers ─────────────────────────────────────────────────────────

function eventInternal(state, day, from, to, mondAmount, description) {
  // Internal MOND transfer — no Fisc USD change.
  state.accounts[from].mond -= mondAmount;
  state.accounts[to].mond   += mondAmount;
  state.events.push({
    day, from, to, amount: mondAmount, currency: 'MOND',
    description, fiscDelta: 0,
  });
}

function eventUbiMint(state, day, to, mondAmount, description) {
  // Fisc prints MOND for citizen.
  state.accounts[to].mond += mondAmount;
  state.mondOutstanding   += mondAmount;
  state.events.push({
    day, from: 'Fisc', to, amount: mondAmount, currency: 'MOND',
    description, fiscDelta: 0,
  });
}

function eventPayExternal(state, day, from, mondAmount, description, mpcRecipient) {
  // Citizen/business pays external — one logical transaction.
  // Under the hood: MOND retired by Fisc, USD reserve decreases, USD lands at external.
  state.accounts[from].mond -= mondAmount;
  state.mondOutstanding     -= mondAmount;
  state.fiscUsd             -= mondAmount;  // 1:1 boundary

  // Track MPC accrual on this external recipient
  if (mpcRecipient) {
    state.mpcAccrued[mpcRecipient] = (state.mpcAccrued[mpcRecipient] || 0) + mondAmount;
  }

  state.events.push({
    day, from, to: 'External', amount: mondAmount, currency: 'MOND',
    description, fiscDelta: -mondAmount,
  });
}

function eventExportEarning(state, day, to, mondAmount, description) {
  // External buyer pays the colony. Fisc receives USD, mints MOND to recipient.
  state.accounts[to].mond += mondAmount;
  state.mondOutstanding   += mondAmount;
  state.fiscUsd           += mondAmount;
  state.events.push({
    day, from: 'External', to, amount: mondAmount, currency: 'MOND',
    description, fiscDelta: +mondAmount,
  });
}

function eventMpc(state, day, externalSource, usdAmount, description) {
  // External company pays MPC to Fisc. Reserve goes up. No MOND minted (MPC is a USD inflow).
  state.fiscUsd += usdAmount;
  state.events.push({
    day, from: `External (${externalSource})`, to: 'Fisc',
    amount: usdAmount, currency: 'USD',
    description, fiscDelta: +usdAmount,
  });
}

// ── Main month simulation ────────────────────────────────────────────────

function runMonth() {
  const setup = {
    ubi_mode:      document.getElementById('ubi_mode').value,
    ubi_floor:     readNum('ubi_floor', 600),
    ubi_universal: readNum('ubi_universal', 1000),
    fisc_start:    readNum('fisc_start', 10000),
    mpc_rate:      readNum('mpc_rate', 15) / 100,

    c_mcd:         readNum('c_mcd', 300),
    c_coffee:      readNum('c_coffee', 150),
    c_external:    readNum('c_external', 150),

    mcd_corp:      readNum('mcd_corp', 60) / 100,
    coffee_sup:    readNum('coffee_sup', 40) / 100,
    pottery_rev:   readNum('pottery_rev', 2000),
    pottery_sup:   readNum('pottery_sup', 20) / 100,
  };

  const state = newState();
  state.fiscUsd = setup.fisc_start;

  const citizens = ['Bob', 'Alice', 'John', 'Jane'];

  // Compute expected business profits this month (used for means-tested UBI)
  const totalMcdRev    = setup.c_mcd    * citizens.length;
  const totalCoffeeRev = setup.c_coffee * citizens.length;
  const totalPotteryRev = setup.pottery_rev;

  const bobProfit    = totalMcdRev    * (1 - setup.mcd_corp);
  const aliceProfit  = totalCoffeeRev * (1 - setup.coffee_sup);
  const potteryProfit = totalPotteryRev * (1 - setup.pottery_sup);
  const johnProfit   = potteryProfit / 2;
  const janeProfit   = potteryProfit / 2;

  const profitOf = { Bob: bobProfit, Alice: aliceProfit, John: johnProfit, Jane: janeProfit };

  function ubiFor(name) {
    if (setup.ubi_mode === 'universal') return setup.ubi_universal;
    return Math.max(0, setup.ubi_floor - profitOf[name]);
  }

  // ── Day 1: UBI ──
  state.events.push({ section: 'Day 1 — UBI issuance' });
  for (const c of citizens) {
    const amt = ubiFor(c);
    if (amt > 0) {
      eventUbiMint(state, 1, c, amt, setup.ubi_mode === 'universal'
        ? 'Universal UBI'
        : `Top-up to floor (profit ${profitOf[c].toFixed(0)} < ${setup.ubi_floor})`);
    } else {
      state.events.push({ day: 1, from: 'Fisc', to: c, amount: 0, currency: 'MOND',
        description: `No UBI needed (profit ${profitOf[c].toFixed(0)} ≥ floor)`, fiscDelta: 0 });
    }
  }

  // ── Days 3-7: McDonald's purchases ──
  state.events.push({ section: 'Days 3-7 — McDonald\'s purchases' });
  citizens.forEach((c, i) => {
    eventInternal(state, 3 + i, c, "Bob's McDonald's", setup.c_mcd, 'Lunch');
  });

  // ── Days 8-12: Coffee purchases ──
  state.events.push({ section: 'Days 8-12 — Coffee purchases' });
  citizens.forEach((c, i) => {
    eventInternal(state, 8 + i, c, "Alice's Coffee", setup.c_coffee, 'Coffee');
  });

  // ── Days 13-17: External imports ──
  state.events.push({ section: 'Days 13-17 — External imports (via Fisc boundary)' });
  citizens.forEach((c, i) => {
    eventPayExternal(state, 13 + i, c, setup.c_external,
      'Amazon / groceries / gas', 'External retailers');
  });

  // ── Days 18-19: Pottery export earnings ──
  state.events.push({ section: 'Days 18-19 — Pottery exports (USD into Fisc, MOND to owners)' });
  eventExportEarning(state, 18, 'John', setup.pottery_rev / 2,
    'Etsy pottery sale (boundary mints MOND)');
  eventExportEarning(state, 19, 'Jane', setup.pottery_rev / 2,
    'Etsy pottery sale (boundary mints MOND)');

  // ── Day 21: Pottery supplies ──
  state.events.push({ section: 'Day 21 — Pottery supplies' });
  const potterySupOwner = setup.pottery_rev * setup.pottery_sup / 2;
  eventPayExternal(state, 21, 'John', potterySupOwner,
    'Clay, kiln gas, postage', 'Pottery suppliers');
  eventPayExternal(state, 21, 'Jane', potterySupOwner,
    'Clay, kiln gas, postage', 'Pottery suppliers');

  // ── Day 26: Bob pays McDonald's corporate ──
  state.events.push({ section: 'Day 26 — McDonald\'s corporate fee' });
  const mcdCorpMond = totalMcdRev * setup.mcd_corp;
  eventPayExternal(state, 26, "Bob's McDonald's", mcdCorpMond,
    'McDonald\'s HQ franchise fee + supplies', 'McDonald\'s HQ');

  // ── Day 27: Alice pays coffee supplier ──
  state.events.push({ section: 'Day 27 — Coffee supplier' });
  const coffeeSupMond = totalCoffeeRev * setup.coffee_sup;
  eventPayExternal(state, 27, "Alice's Coffee", coffeeSupMond,
    'Coffee bean wholesaler', 'Coffee supplier');

  // ── Day 28: Owner draws ──
  state.events.push({ section: 'Day 28 — Business owners take month-end draw' });
  const bobNet   = state.accounts["Bob's McDonald's"].mond;
  const aliceNet = state.accounts["Alice's Coffee"].mond;
  if (bobNet > 0)   eventInternal(state, 28, "Bob's McDonald's", 'Bob',   bobNet,   'Owner draw');
  if (aliceNet > 0) eventInternal(state, 28, "Alice's Coffee",   'Alice', aliceNet, 'Owner draw');

  // ── Day 30: MPC collection ──
  if (setup.mpc_rate > 0) {
    state.events.push({ section: `Day 30 — MPC collected from external companies @ ${(setup.mpc_rate * 100).toFixed(0)}%` });
    // Sort recipients by accrued amount for readable order
    const recipients = Object.entries(state.mpcAccrued).sort((a,b) => b[1] - a[1]);
    for (const [source, revenue] of recipients) {
      const mpcUsd = revenue * setup.mpc_rate;
      eventMpc(state, 30, source, mpcUsd,
        `${(setup.mpc_rate * 100).toFixed(0)}% MPC on $${revenue.toLocaleString()} colony revenue`);
    }
  }

  return { setup, state, profitOf };
}

// ── Rendering ──

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.abs(n) >= 1e3 ? n.toLocaleString() : n.toFixed(0);
}

function renderLog(state) {
  const tbody = document.querySelector('#log-table tbody');
  let html = '';
  let fisc = parseFloat(document.getElementById('fisc_start').value);
  for (const ev of state.events) {
    if (ev.section) {
      html += `<tr class="section"><td colspan="7">${ev.section}</td></tr>`;
      continue;
    }
    fisc += (ev.fiscDelta || 0);

    let amtClass, amtStr;
    if (ev.currency === 'USD') {
      amtClass = 'amt usd';
      amtStr = '$' + fmt(ev.amount);
    } else {
      amtClass = 'amt';
      amtStr = fmt(ev.amount);
    }

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
  const entities = [
    { key: 'Bob',              label: 'Bob' },
    { key: 'Alice',            label: 'Alice' },
    { key: 'John',             label: 'John' },
    { key: 'Jane',             label: 'Jane' },
    { key: 'fisc',             label: 'Fisc',  fisc: true },
  ];
  grid.innerHTML = entities.map(e => {
    if (e.fisc) {
      return `
        <div class="balance-card fisc">
          <div class="name">${e.label}</div>
          <div class="row"><span class="lbl">USD reserve</span><span class="val">$${fmt(state.fiscUsd)}</span></div>
          <div class="row"><span class="lbl">MOND outstanding</span><span class="val">${fmt(state.mondOutstanding)}</span></div>
        </div>
      `;
    }
    const a = state.accounts[e.key];
    return `
      <div class="balance-card">
        <div class="name">${e.label}</div>
        <div class="row"><span class="lbl">MOND</span><span class="val">${fmt(a.mond)}</span></div>
      </div>
    `;
  }).join('');
}

function renderFlowCheck(state, setup) {
  // USD-side: aggregate inflows and outflows to the Fisc.
  let inflows = 0, outflows = 0;
  const inflowItems = [];
  const outflowItems = [];

  for (const ev of state.events) {
    if (ev.section) continue;
    if (!ev.fiscDelta) continue;
    if (ev.fiscDelta > 0) {
      inflows += ev.fiscDelta;
      inflowItems.push({ key: ev.from + ' — ' + ev.description, amount: ev.fiscDelta });
    } else {
      outflows += -ev.fiscDelta;
      outflowItems.push({ key: ev.from + ' — ' + ev.description, amount: -ev.fiscDelta });
    }
  }

  function reduce(items) {
    const map = {};
    for (const item of items) {
      if (!map[item.key]) map[item.key] = { key: item.key, amount: 0 };
      map[item.key].amount += item.amount;
    }
    return Object.values(map);
  }

  const inRows = reduce(inflowItems);
  const outRows = reduce(outflowItems);

  const inflowHtml = inRows.map(r =>
    `<div class="row"><span>${r.key}</span><span>$${r.amount.toLocaleString()}</span></div>`
  ).join('');
  const outflowHtml = outRows.map(r =>
    `<div class="row"><span>${r.key}</span><span>$${r.amount.toLocaleString()}</span></div>`
  ).join('');

  const net = inflows - outflows;
  const netClass = net >= 0 ? 'var(--ok)' : 'var(--crit)';

  document.getElementById('flow-check').innerHTML = `
    <div class="flow">
      <div class="title">USD into Fisc</div>
      ${inflowHtml}
      <div class="row total"><span>Total inflows</span><span>$${inflows.toLocaleString()}</span></div>
    </div>
    <div class="flow">
      <div class="title">USD out of Fisc</div>
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
['ubi_mode','ubi_floor','ubi_universal','fisc_start','mpc_rate',
 'c_mcd','c_coffee','c_external',
 'mcd_corp','coffee_sup','pottery_rev','pottery_sup'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  }
});

render();
