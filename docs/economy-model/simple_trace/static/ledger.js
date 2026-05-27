// Colony ledger — toy 4-person colony, 12-month run.
//
// Model assumption (post-simplification):
//   - Citizens and businesses hold MOND only.
//   - External companies hold USD only (tracked implicitly).
//   - The Fisc sits at the boundary. It holds a USD reserve and tracks MOND outstanding.
//   - Any "external" transaction (import, export, supplier payment, corporate fee) is
//     ONE event in MOND terms; the Fisc USD reserve adjusts silently. 1 MOND = $1.
//
// 4 citizens:
//   Bob   — McDonald's franchise
//   Alice — coffee shop
//   John, Jane — pottery export

const CITIZENS = ['Bob', 'Alice', 'John', 'Jane'];
// 2026 baseline basket: total per-citizen monthly consumption at support-phase
// prices (McDonald's $300 + Coffee $150 + External imports $150 = $600).
// Used by the inflation/deflation indicator.
const BASKET_2026 = 600;

function readNum(id, def = 0) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? def : v;
}

function readSetup() {
  return {
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

    fx_pct:        readNum('fx_pct', 50) / 100,
    working_bal:   readNum('working_bal', 600),
  };
}

// ── Single-month simulation ──────────────────────────────────────────────
// Input:  carry-over state (or null for month 1).
// Output: { state, events, monthSummary, profitOf }

function runMonth(monthNum, prevState, setup) {
  // Start with prior balances or fresh
  const accounts = prevState ? structuredClone(prevState.accounts) : {
    'Bob':              { mond: 0 },
    'Alice':            { mond: 0 },
    'John':             { mond: 0 },
    'Jane':             { mond: 0 },
    "Bob's McDonald's": { mond: 0 },
    "Alice's Coffee":   { mond: 0 },
  };
  let fiscUsd = prevState ? prevState.fiscUsd : setup.fisc_start;
  let mondOutstanding = prevState ? prevState.mondOutstanding : 0;
  const events = [];
  const mpcAccrued = {};
  let totalUbiMinted = 0;

  // Helpers (closures over state)
  function eventInternal(day, from, to, mondAmount, description) {
    accounts[from].mond -= mondAmount;
    accounts[to].mond   += mondAmount;
    events.push({ day, from, to, amount: mondAmount, currency: 'MOND', description, fiscDelta: 0 });
  }
  function eventUbiMint(day, to, mondAmount, description) {
    accounts[to].mond += mondAmount;
    mondOutstanding   += mondAmount;
    totalUbiMinted    += mondAmount;
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

  // Profit calculations (used for means-tested UBI)
  const totalMcdRev    = setup.c_mcd    * CITIZENS.length;
  const totalCoffeeRev = setup.c_coffee * CITIZENS.length;
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
  events.push({ section: 'Day 1 — UBI issuance' });
  for (const c of CITIZENS) {
    const amt = ubiFor(c);
    if (amt > 0) {
      eventUbiMint(1, c, amt, setup.ubi_mode === 'universal'
        ? 'Universal UBI'
        : `Top-up to floor (profit ${profitOf[c].toFixed(0)} < ${setup.ubi_floor})`);
    } else {
      events.push({ day: 1, from: 'Fisc', to: c, amount: 0, currency: 'MOND',
        description: `No UBI needed (profit ${profitOf[c].toFixed(0)} ≥ floor)`, fiscDelta: 0 });
    }
  }

  events.push({ section: 'Days 3-7 — McDonald\'s purchases' });
  CITIZENS.forEach((c, i) => eventInternal(3 + i, c, "Bob's McDonald's", setup.c_mcd, 'Lunch'));

  events.push({ section: 'Days 8-12 — Coffee purchases' });
  CITIZENS.forEach((c, i) => eventInternal(8 + i, c, "Alice's Coffee", setup.c_coffee, 'Coffee'));

  events.push({ section: 'Days 13-17 — External imports (via Fisc boundary)' });
  CITIZENS.forEach((c, i) => eventPayExternal(13 + i, c, setup.c_external, 'Amazon / groceries / gas', 'External retailers'));

  events.push({ section: 'Days 18-19 — Pottery exports (USD into Fisc, MOND to owners)' });
  eventExportEarning(18, 'John', setup.pottery_rev / 2, 'Etsy pottery sale (boundary mints MOND)');
  eventExportEarning(19, 'Jane', setup.pottery_rev / 2, 'Etsy pottery sale (boundary mints MOND)');

  events.push({ section: 'Day 21 — Pottery supplies' });
  const potterySupOwner = setup.pottery_rev * setup.pottery_sup / 2;
  eventPayExternal(21, 'John', potterySupOwner, 'Clay, kiln gas, postage', 'Pottery suppliers');
  eventPayExternal(21, 'Jane', potterySupOwner, 'Clay, kiln gas, postage', 'Pottery suppliers');

  events.push({ section: 'Day 26 — McDonald\'s corporate fee' });
  const mcdCorpMond = totalMcdRev * setup.mcd_corp;
  eventPayExternal(26, "Bob's McDonald's", mcdCorpMond, 'McDonald\'s HQ franchise fee + supplies', 'McDonald\'s HQ');

  events.push({ section: 'Day 27 — Coffee supplier' });
  const coffeeSupMond = totalCoffeeRev * setup.coffee_sup;
  eventPayExternal(27, "Alice's Coffee", coffeeSupMond, 'Coffee bean wholesaler', 'Coffee supplier');

  events.push({ section: 'Day 28 — Business owners take month-end draw' });
  const bobNet   = accounts["Bob's McDonald's"].mond;
  const aliceNet = accounts["Alice's Coffee"].mond;
  if (bobNet > 0)   eventInternal(28, "Bob's McDonald's", 'Bob',   bobNet,   'Owner draw');
  if (aliceNet > 0) eventInternal(28, "Alice's Coffee",   'Alice', aliceNet, 'Owner draw');

  let totalMpcCollected = 0;
  if (setup.mpc_rate > 0) {
    events.push({ section: `Day 30 — MPC collected from external companies @ ${(setup.mpc_rate * 100).toFixed(0)}%` });
    const recipients = Object.entries(mpcAccrued).sort((a,b) => b[1] - a[1]);
    for (const [source, revenue] of recipients) {
      const mpcUsd = revenue * setup.mpc_rate;
      totalMpcCollected += mpcUsd;
      eventMpc(30, source, mpcUsd,
        `${(setup.mpc_rate * 100).toFixed(0)}% MPC on $${revenue.toLocaleString()} colony revenue`);
    }
  }

  // ── Day 30: citizen FX investment — spare MOND above working balance → external USD ──
  // Earth-variant escape valve: citizens convert spare MOND to USD at the
  // Fisc boundary and invest externally (S&P/bonds/BTC/bank). MOND retires;
  // Fisc USD reserve drops; citizen owns USD outside the colony.
  if (setup.fx_pct > 0) {
    const conversions = [];
    for (const c of CITIZENS) {
      const surplus = Math.max(0, accounts[c].mond - setup.working_bal);
      const conv = surplus * setup.fx_pct;
      if (conv > 0.5) conversions.push([c, conv]);
    }
    if (conversions.length > 0) {
      events.push({ section: `Day 30 — Citizen FX investment (${(setup.fx_pct * 100).toFixed(0)}% of spare MOND → external USD)` });
      for (const [c, conv] of conversions) {
        accounts[c].mond -= conv;
        mondOutstanding  -= conv;
        fiscUsd          -= conv;
        events.push({
          day: 30, from: c, to: 'External (S&P/bonds/BTC/bank)',
          amount: conv, currency: 'MOND',
          description: 'Boundary swap — invest spare MOND as USD externally',
          fiscDelta: -conv,
          isCapital: true,
        });
      }
    }
  }

  const monthSummary = {
    month: monthNum,
    ubiMinted: totalUbiMinted,
    mpcCollected: totalMpcCollected,
    fiscReserveEnd: fiscUsd,
    mondOutstandingEnd: mondOutstanding,
    bob:   accounts['Bob'].mond,
    alice: accounts['Alice'].mond,
    john:  accounts['John'].mond,
    jane:  accounts['Jane'].mond,
  };

  return {
    state: { accounts, fiscUsd, mondOutstanding },
    events,
    monthSummary,
    profitOf,
  };
}

// ── Rendering ─────────────────────────────────────────────────────────────

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
    const amtStr   = ev.currency === 'USD' ? '$' + fmt(ev.amount) : fmt(ev.amount);
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

function renderBalances(state) {
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
      <div class="title">USD into Fisc (per month)</div>
      ${inHtml}
      <div class="row total"><span>Total inflows</span><span>$${fmt(inflows)}</span></div>
    </div>
    <div class="flow">
      <div class="title">USD out of Fisc (per month)</div>
      ${outHtml}
      <div class="row total"><span>Total outflows</span><span>$${fmt(outflows)}</span></div>
      <div class="row total" style="border-top: 1px solid var(--line-hot); margin-top: 8px; padding-top: 8px;">
        <span>Net change per month</span>
        <span style="color: ${netClass}">${net >= 0 ? '+' : ''}$${fmt(net)}</span>
      </div>
    </div>
  `;
}

// ── Feasibility indicators — textbook small-open-economy diagnostics ──
// Same six as /abundance, calibrated for support-phase scale:
//   1. Current account     exports + MPC − imports − supplies − corporate fees
//   2. Reserve cover       Fisc USD / monthly USD outflow (months)
//   3. Money supply (M)    MOND outstanding + seigniorage (net mint/mo)
//   4. Velocity            MOND transactions / average outstanding
//   5. Inflation / basket  basket cost vs 2026 baseline ($600/citizen/mo)
//   6. Real UBI            mean UBI received ÷ monthly basket cost

function computeIndicators(setup, result, profitOf) {
  // Decompose the month's events into current vs capital flows.
  let exports = 0, mpcUsd = 0, imports = 0, supplies = 0, fxOut = 0, corpFees = 0;
  let mondTxnVolume = 0;
  for (const ev of result.events) {
    if (ev.section) continue;
    if (ev.currency === 'MOND') mondTxnVolume += ev.amount;
    if (!ev.fiscDelta) continue;
    if (ev.isCapital) {
      fxOut += -ev.fiscDelta;
    } else if (ev.fiscDelta > 0) {
      if (ev.currency === 'USD') mpcUsd += ev.fiscDelta;
      else exports += ev.fiscDelta;
    } else {
      const desc = ev.description || '';
      if (/Clay|kiln|postage/i.test(desc))         supplies += -ev.fiscDelta;
      else if (/HQ|franchise|wholesaler/i.test(desc)) corpFees += -ev.fiscDelta;
      else                                         imports  += -ev.fiscDelta;
    }
  }
  // 1. Current account — all goods/services on the boundary except citizen FX
  const currentAccount = exports + mpcUsd - imports - supplies - corpFees;
  // 2. Reserve cover
  const monthlyOut = imports + supplies + corpFees + fxOut;
  const reserveCover = monthlyOut > 0 ? result.state.fiscUsd / monthlyOut : null;
  // 3. Money supply + seigniorage
  const M = result.state.mondOutstanding;
  const seigniorage = result.monthSummary.ubiMinted + setup.pottery_rev - (imports + supplies + corpFees + fxOut);
  // 4. Velocity (Fisher MV = PY): single-month proxy uses end-of-month M
  const velocity = M > 0 ? mondTxnVolume / M : null;
  // 5. Basket / inflation — support phase IS the 2026 baseline, so deflation ≈ 0
  const basket = setup.c_mcd + setup.c_coffee + setup.c_external;
  const basketRatio = basket / BASKET_2026;
  const cumulativeDeflation = 1 - basketRatio;
  // 6. Real UBI — mean UBI received ÷ basket
  let totalUbi = 0;
  if (setup.ubi_mode === 'universal') {
    totalUbi = setup.ubi_universal * CITIZENS.length;
  } else {
    for (const c of CITIZENS) totalUbi += Math.max(0, setup.ubi_floor - (profitOf[c] || 0));
  }
  const meanUbi = totalUbi / CITIZENS.length;
  const realUBI = basket > 0 ? meanUbi / basket : null;

  return {
    currentAccount, reserveCover,
    M, seigniorage, velocity,
    basket, basketRatio, cumulativeDeflation,
    realUBI, meanUbi,
    flows: { exports, mpcUsd, imports, supplies, corpFees, fxOut },
  };
}

function indicatorClass(value, thresholds) {
  if (value === null || value === undefined || isNaN(value)) return 'ind-flat';
  if (thresholds.green(value)) return 'ind-ok';
  if (thresholds.red(value))   return 'ind-crit';
  return 'ind-warn';
}

function renderIndicators(ind, setup) {
  const grid = document.getElementById('indicators');
  if (!grid) return;
  const totalOut = ind.flows.imports + ind.flows.supplies + ind.flows.corpFees + ind.flows.fxOut;

  const cards = [
    {
      title: '1 · Current account',
      big: (ind.currentAccount >= 0 ? '+' : '') + '$' + fmt(ind.currentAccount) + ' / mo',
      sub: `exports $${fmt(ind.flows.exports)} + MPC $${fmt(ind.flows.mpcUsd)} − imports $${fmt(ind.flows.imports)} − supplies $${fmt(ind.flows.supplies)} − corp fees $${fmt(ind.flows.corpFees)}`,
      verdict: ind.currentAccount >= 0
        ? 'colony pays its own way on goods + services'
        : 'colony spending more abroad than it earns',
      cls: indicatorClass(ind.currentAccount, {
        green: v => v > 0, red: v => v < -500,
      }),
    },
    {
      title: '2 · Reserve cover',
      big: ind.reserveCover === null ? '∞' : fmt(ind.reserveCover) + ' months',
      sub: `Fisc USD ÷ monthly outflow ($${fmt(totalOut)})`,
      verdict: ind.reserveCover === null ? 'no outflow'
        : ind.reserveCover >= 6 ? 'comfortable (IMF: ≥3 mo adequate)'
        : ind.reserveCover >= 3 ? 'adequate (IMF floor)'
        : 'vulnerable — below IMF floor',
      cls: indicatorClass(ind.reserveCover, {
        green: v => v >= 6, red: v => v < 3,
      }),
    },
    {
      title: '3 · Money supply (M)',
      big: fmt(ind.M) + ' MOND',
      sub: `seigniorage this month: ${ind.seigniorage >= 0 ? '+' : ''}${fmt(ind.seigniorage)} MOND (mint − retire)`,
      verdict: Math.abs(ind.seigniorage) < 500
        ? 'stable — mint roughly matches retirement'
        : ind.seigniorage > 0
          ? 'expanding — new MOND faster than burn'
          : 'contracting — burn exceeds new mint',
      cls: indicatorClass(Math.abs(ind.seigniorage), {
        green: v => v < 500, red: v => v > 2000,
      }),
    },
    {
      title: '4 · Velocity (V)',
      big: ind.velocity === null ? '—' : ind.velocity.toFixed(2) + ' / mo',
      sub: 'MOND transactions ÷ average outstanding (Fisher MV = PY)',
      verdict: ind.velocity === null ? 'no MOND in circulation yet'
        : ind.velocity > 5  ? 'fast circulation — money working hard'
        : ind.velocity > 1  ? 'healthy circulation'
        : 'slow — MOND piling up rather than spent',
      cls: indicatorClass(ind.velocity, {
        green: v => v >= 1 && v <= 10, red: v => v < 0.5 || v > 15,
      }),
    },
    {
      title: '5 · Inflation / basket',
      big: ind.cumulativeDeflation > 0
        ? '−' + fmt(ind.cumulativeDeflation * 100) + '% vs 2026'
        : 'at 2026 baseline',
      sub: `basket cost: $${fmt(ind.basket)}/mo per citizen (baseline $${BASKET_2026})`,
      verdict: ind.cumulativeDeflation > 0.5
        ? 'deep deflation — automation has slashed real costs'
        : ind.cumulativeDeflation > 0
          ? 'moderate deflation'
          : 'no deflation — support phase still at 2026 prices',
      cls: 'ind-flat',
    },
    {
      title: '6 · Real UBI',
      big: ind.realUBI === null ? '—' : ind.realUBI.toFixed(2) + '× basket',
      sub: setup.ubi_mode === 'universal'
        ? `${fmt(setup.ubi_universal)} MOND universal ÷ $${fmt(ind.basket)} basket`
        : `mean UBI ${fmt(ind.meanUbi)} MOND (means-tested) ÷ $${fmt(ind.basket)} basket`,
      verdict: ind.realUBI === null ? '—'
        : ind.realUBI >= 1.5 ? 'generous — surplus available for savings'
        : ind.realUBI >= 1.0 ? 'sufficient — exactly covers essentials'
        : 'insufficient — citizens rely on business income too',
      cls: indicatorClass(ind.realUBI, {
        green: v => v >= 1, red: v => v < 0.5,
      }),
    },
  ];

  grid.innerHTML = cards.map(c => `
    <div class="indicator ${c.cls}">
      <div class="ind-title">${c.title}</div>
      <div class="ind-big">${c.big}</div>
      <div class="ind-sub">${c.sub}</div>
      <div class="ind-verdict">${c.verdict}</div>
    </div>
  `).join('');
}

function render() {
  const setup = readSetup();
  const result = runMonth(1, null, setup);
  renderLog(result);
  renderBalances(result.state);
  renderFlowCheck(result);
  const ind = computeIndicators(setup, result, result.profitOf);
  renderIndicators(ind, setup);
}

// Wire up inputs
['ubi_mode','ubi_floor','ubi_universal','fisc_start','mpc_rate',
 'c_mcd','c_coffee','c_external',
 'mcd_corp','coffee_sup','pottery_rev','pottery_sup',
 'fx_pct','working_bal'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  }
});

render();
