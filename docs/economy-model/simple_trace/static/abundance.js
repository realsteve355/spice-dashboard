// Abundance ledger — 4-person colony at the end state (~2046).
//
// What changed vs /ledger:
//   - Universal UBI for all 4 citizens (no means-testing)
//   - Basket has deflated to ~15% of 2026 cost
//   - Only John has external income (pottery, by vocation)
//   - Bob's McDonald's franchise closed (robotic location runs without him)
//   - Alice's coffee shop closed (kitchen automation made it unviable)
//   - Some informal internal MOND trade between citizens

const CITIZENS = ['Bob', 'Alice', 'John', 'Jane'];

function readNum(id, def = 0) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? def : v;
}

function readSetup() {
  return {
    ubi:           readNum('ubi', 100),
    fisc_start:    readNum('fisc_start', 20000),
    mpc_rate:      readNum('mpc_rate', 15) / 100,
    c_external:    readNum('c_external', 50),
    c_internal:    readNum('c_internal', 15),
    pottery_rev:   readNum('pottery_rev', 300),
    pottery_sup:   readNum('pottery_sup', 20) / 100,
  };
}

function runMonth(setup) {
  const accounts = {
    'Bob':   { mond: 0 },
    'Alice': { mond: 0 },
    'John':  { mond: 0 },
    'Jane':  { mond: 0 },
  };
  let fiscUsd = setup.fisc_start;
  let mondOutstanding = 0;
  const events = [];
  const mpcAccrued = {};

  function eventInternal(day, from, to, mondAmount, description) {
    accounts[from].mond -= mondAmount;
    accounts[to].mond   += mondAmount;
    events.push({ day, from, to, amount: mondAmount, currency: 'MOND', description, fiscDelta: 0 });
  }
  function eventUbiMint(day, to, mondAmount, description) {
    accounts[to].mond += mondAmount;
    mondOutstanding   += mondAmount;
    events.push({ day, from: 'Fisc', to, amount: mondAmount, currency: 'MOND', description, fiscDelta: 0 });
  }
  function eventPayExternal(day, from, mondAmount, description, mpcRecipient) {
    accounts[from].mond -= mondAmount;
    mondOutstanding     -= mondAmount;
    fiscUsd             -= mondAmount;
    if (mpcRecipient) mpcAccrued[mpcRecipient] = (mpcAccrued[mpcRecipient] || 0) + mondAmount;
    events.push({ day, from, to: 'External', amount: mondAmount, currency: 'MOND', description, fiscDelta: -mondAmount });
  }
  function eventExportEarning(day, to, mondAmount, description) {
    accounts[to].mond += mondAmount;
    mondOutstanding   += mondAmount;
    fiscUsd           += mondAmount;
    events.push({ day, from: 'External', to, amount: mondAmount, currency: 'MOND', description, fiscDelta: +mondAmount });
  }
  function eventMpc(day, externalSource, usdAmount, description) {
    fiscUsd += usdAmount;
    events.push({ day, from: `External (${externalSource})`, to: 'Fisc', amount: usdAmount, currency: 'USD', description, fiscDelta: +usdAmount });
  }

  // ── Day 1: Universal UBI ──
  events.push({ section: `Day 1 — Universal UBI (${setup.ubi} MOND each)` });
  for (const c of CITIZENS) {
    eventUbiMint(1, c, setup.ubi, 'Universal UBI');
  }

  // ── Days 5-15: External imports (basket goods, deflated) ──
  events.push({ section: 'Days 5-15 — External imports (deflated basket from automated retailers)' });
  CITIZENS.forEach((c, i) => {
    eventPayExternal(5 + i * 2, c, setup.c_external,
      'Cheap automated retail (Amazon-style)', 'External retailers');
  });

  // ── Days 16-17: Pottery export (John's vocational business) ──
  events.push({ section: 'Day 16 — John\'s pottery export' });
  eventExportEarning(16, 'John', setup.pottery_rev, 'Etsy pottery sale (boundary mints MOND)');

  // ── Day 18: Pottery supplies ──
  if (setup.pottery_sup > 0 && setup.pottery_rev > 0) {
    events.push({ section: 'Day 18 — Pottery supplies' });
    const supplies = setup.pottery_rev * setup.pottery_sup;
    eventPayExternal(18, 'John', supplies, 'Clay, kiln gas, postage', 'Pottery suppliers');
  }

  // ── Days 22-26: Informal internal economy ──
  // Citizens help each other in small ways. Demonstrates the internal MOND cycle.
  if (setup.c_internal > 0) {
    events.push({ section: 'Days 22-26 — Informal internal economy (citizen-to-citizen)' });
    // Round-robin: each pays the next, demonstrating MOND circulating internally.
    const pairs = [
      [22, 'Bob',   'Alice', 'Repaired Alice\'s electric kettle'],
      [23, 'Alice', 'Jane',  'Knitted Jane a winter sweater'],
      [24, 'Jane',  'John',  'Gardening help with raised beds'],
      [25, 'John',  'Bob',   'Glazed a custom pot for Bob\'s herbs'],
    ];
    for (const [day, from, to, desc] of pairs) {
      eventInternal(day, from, to, setup.c_internal, desc);
    }
  }

  // ── Day 30: MPC collection ──
  if (setup.mpc_rate > 0 && Object.keys(mpcAccrued).length > 0) {
    events.push({ section: `Day 30 — MPC collected from external companies @ ${(setup.mpc_rate * 100).toFixed(0)}%` });
    const recipients = Object.entries(mpcAccrued).sort((a,b) => b[1] - a[1]);
    for (const [source, revenue] of recipients) {
      const mpcUsd = revenue * setup.mpc_rate;
      eventMpc(30, source, mpcUsd,
        `${(setup.mpc_rate * 100).toFixed(0)}% MPC on $${revenue.toLocaleString()} colony revenue`);
    }
  }

  return { accounts, fiscUsd, mondOutstanding, events };
}

// ── Rendering ──

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.abs(n) >= 1e3 ? Math.round(n).toLocaleString() : n.toFixed(0);
}

function renderLog(result) {
  const tbody = document.querySelector('#log-table tbody');
  let html = '';
  let fisc = parseFloat(document.getElementById('fisc_start').value);
  for (const ev of result.events) {
    if (ev.section) {
      html += `<tr class="section"><td colspan="7">${ev.section}</td></tr>`;
      continue;
    }
    fisc += (ev.fiscDelta || 0);
    const amtClass = ev.currency === 'USD' ? 'amt usd' : 'amt';
    const amtStr = ev.currency === 'USD' ? '$' + fmt(ev.amount) : fmt(ev.amount);
    html += `<tr>
      <td class="day">${ev.day}</td>
      <td class="from">${ev.from}</td>
      <td class="to">${ev.to}</td>
      <td class="${amtClass}">${amtStr}</td>
      <td>${ev.currency}</td>
      <td class="desc">${ev.description}</td>
      <td class="fisc">$${fmt(fisc)}</td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

function renderBalances(result) {
  const grid = document.getElementById('balance-grid');
  const entities = [
    { key: 'Bob',   label: 'Bob' },
    { key: 'Alice', label: 'Alice' },
    { key: 'John',  label: 'John' },
    { key: 'Jane',  label: 'Jane' },
    { fisc: true,   label: 'Fisc' },
  ];
  grid.innerHTML = entities.map(e => {
    if (e.fisc) {
      return `
        <div class="balance-card fisc">
          <div class="name">${e.label}</div>
          <div class="row"><span class="lbl">USD reserve</span><span class="val">$${fmt(result.fiscUsd)}</span></div>
          <div class="row"><span class="lbl">MOND outstanding</span><span class="val">${fmt(result.mondOutstanding)}</span></div>
        </div>
      `;
    }
    const a = result.accounts[e.key];
    return `
      <div class="balance-card">
        <div class="name">${e.label}</div>
        <div class="row"><span class="lbl">MOND</span><span class="val">${fmt(a.mond)}</span></div>
      </div>
    `;
  }).join('');
}

function renderFlowCheck(result) {
  let inflows = 0, outflows = 0;
  const inMap = {}, outMap = {};
  for (const ev of result.events) {
    if (ev.section || !ev.fiscDelta) continue;
    const key = ev.from + ' — ' + ev.description;
    if (ev.fiscDelta > 0) {
      inflows += ev.fiscDelta;
      inMap[key] = (inMap[key] || 0) + ev.fiscDelta;
    } else {
      outflows += -ev.fiscDelta;
      outMap[key] = (outMap[key] || 0) + (-ev.fiscDelta);
    }
  }
  const net = inflows - outflows;
  const netClass = net >= 0 ? 'var(--ok)' : 'var(--crit)';

  const inHtml = Object.entries(inMap).map(([k,v]) =>
    `<div class="row"><span>${k}</span><span>$${fmt(v)}</span></div>`).join('');
  const outHtml = Object.entries(outMap).map(([k,v]) =>
    `<div class="row"><span>${k}</span><span>$${fmt(v)}</span></div>`).join('');

  document.getElementById('flow-check').innerHTML = `
    <div class="flow">
      <div class="title">USD into Fisc</div>
      ${inHtml || '<div class="row"><span style="color: var(--faint);">(none)</span><span></span></div>'}
      <div class="row total"><span>Total inflows</span><span>$${fmt(inflows)}</span></div>
    </div>
    <div class="flow">
      <div class="title">USD out of Fisc</div>
      ${outHtml || '<div class="row"><span style="color: var(--faint);">(none)</span><span></span></div>'}
      <div class="row total"><span>Total outflows</span><span>$${fmt(outflows)}</span></div>
      <div class="row total" style="border-top: 1px solid var(--line-hot); margin-top: 8px; padding-top: 8px;">
        <span>Net change to Fisc reserve</span>
        <span style="color: ${netClass}">${net >= 0 ? '+' : ''}$${fmt(net)}</span>
      </div>
    </div>
  `;
}

function render() {
  const setup = readSetup();
  const result = runMonth(setup);
  renderLog(result);
  renderBalances(result);
  renderFlowCheck(result);
}

['ubi','fisc_start','mpc_rate','c_external','c_internal','pottery_rev','pottery_sup'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  }
});

render();
