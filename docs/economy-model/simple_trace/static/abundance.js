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
// Per-citizen monthly essential-spend baseline in 2026 dollars. Used to compute
// the basket deflator and "real UBI" (citizens get N baskets per month).
const BASKET_2026 = 350;
const STORAGE_KEY = 'axion_abundance_v1';
const INPUT_IDS = ['ubi','fisc_start','mpc_rate','c_external','c_internal',
                   'pottery_rev','pottery_sup','n_months','fx_pct','working_bal'];

function readNum(id, def = 0) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? def : v;
}

function saveInputs() {
  try {
    const o = {};
    for (const id of INPUT_IDS) {
      const el = document.getElementById(id);
      if (el) o[id] = el.value;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch (e) { /* localStorage may be disabled */ }
}

function restoreInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const o = JSON.parse(raw);
    for (const [id, v] of Object.entries(o)) {
      const el = document.getElementById(id);
      if (el && v !== undefined && v !== null && v !== '') el.value = v;
    }
  } catch (e) { /* ignore */ }
}

function resetInputs() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  location.reload();
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
    fx_pct:        readNum('fx_pct', 80) / 100,
    working_bal:   readNum('working_bal', 65),
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

  // ── Day 30: citizen FX investment — spare MOND → external USD savings ──
  // Earth-variant abundance: citizens park surplus in S&P/bonds/BTC/bank. MOND
  // above one month of working balance gets converted at the Fisc boundary.
  // Tracks per-citizen external USD savings so the chart can show that the
  // colony's total wealth (Fisc + citizen savings) doesn't vanish, it migrates.
  const fxOut = { Bob: 0, Alice: 0, John: 0, Jane: 0 };
  if (setup.fx_pct > 0) {
    const conversions = [];
    for (const c of CITIZENS) {
      const surplus = Math.max(0, accounts[c].mond - setup.working_bal);
      const conv = surplus * setup.fx_pct;
      if (conv > 0.5) conversions.push([c, conv]);
    }
    if (conversions.length > 0) {
      events.push({ section: `Day 30 — Citizen FX investment (${(setup.fx_pct * 100).toFixed(0)}% of surplus → external USD)` });
      for (const [c, conv] of conversions) {
        accounts[c].mond -= conv;
        mondOutstanding   -= conv;
        fiscUsd           -= conv;
        fxOut[c]          += conv;
        events.push({
          day: 30, from: c, to: 'External (S&P/bonds/BTC/bank)',
          amount: conv, currency: 'MOND',
          description: `Boundary swap — invest spare MOND as USD externally`,
          fiscDelta: -conv,
          isCapital: true,
        });
      }
    }
  }

  return { accounts, fiscUsd, mondOutstanding, events, fxOut };
}

// ── Multi-month projection ──
// Repeats the same monthly pattern, chaining balances forward.
// State that carries: accounts.mond per citizen, fiscUsd, mondOutstanding.

function runMonths(setup, nMonths) {
  const accounts = {};
  const citizenUsd = {};
  for (const c of CITIZENS) { accounts[c] = { mond: 0 }; citizenUsd[c] = 0; }
  let fiscUsd = setup.fisc_start;
  let mondOutstanding = 0;
  const series = [{
    month: 0,
    fiscUsd,
    mondOutstanding,
    citizens: Object.fromEntries(CITIZENS.map(c => [c, 0])),
    citizenUsd: Object.fromEntries(CITIZENS.map(c => [c, 0])),
    citizenUsdTotal: 0,
    netToFisc: 0,
  }];

  for (let m = 1; m <= nMonths; m++) {
    const monthSetup = { ...setup, fisc_start: fiscUsd };
    const result = runMonth(monthSetup);

    for (const c of CITIZENS) {
      accounts[c].mond += result.accounts[c].mond;
      citizenUsd[c]    += (result.fxOut && result.fxOut[c]) || 0;
    }
    fiscUsd = result.fiscUsd;
    mondOutstanding += result.mondOutstanding;

    let netToFisc = 0;
    for (const ev of result.events) {
      if (ev.section || !ev.fiscDelta) continue;
      netToFisc += ev.fiscDelta;
    }
    const totalUsd = CITIZENS.reduce((s, c) => s + citizenUsd[c], 0);

    series.push({
      month: m,
      fiscUsd,
      mondOutstanding,
      citizens: Object.fromEntries(CITIZENS.map(c => [c, accounts[c].mond])),
      citizenUsd: Object.fromEntries(CITIZENS.map(c => [c, citizenUsd[c]])),
      citizenUsdTotal: totalUsd,
      netToFisc,
    });
  }
  return series;
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
  const fxOut = result.fxOut || {};
  const totalFx = Object.values(fxOut).reduce((s, v) => s + (v || 0), 0);
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
          <div class="row"><span class="lbl">FX outflow (mo)</span><span class="val" style="color:#ffb86c">${totalFx > 0 ? '−$' + fmt(totalFx) : '—'}</span></div>
        </div>
      `;
    }
    const a = result.accounts[e.key];
    const fx = fxOut[e.key] || 0;
    return `
      <div class="balance-card">
        <div class="name">${e.label}</div>
        <div class="row"><span class="lbl">MOND</span><span class="val">${fmt(a.mond)}</span></div>
        <div class="row"><span class="lbl">→ USD this mo</span><span class="val" style="color:${fx > 0 ? '#ffb86c' : 'var(--dim)'}">${fx > 0 ? '$' + fmt(fx) : '—'}</span></div>
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

function renderTrajectoryChart(series) {
  const svg = document.getElementById('traj-chart');
  if (!svg) return;
  const W = 1100, H = 280, pad = { l: 70, r: 70, t: 16, b: 32 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const months = series.map(p => p.month);
  const fiscMax = Math.max(...series.map(p => p.fiscUsd)) * 1.05;
  const fiscMin = Math.min(...series.map(p => p.fiscUsd)) * 0.95;
  const mondMax = Math.max(...series.map(p => p.mondOutstanding)) * 1.05;
  const xScale = m => pad.l + (m / months[months.length - 1]) * innerW;
  const yFisc = v => pad.t + innerH - ((v - fiscMin) / (fiscMax - fiscMin || 1)) * innerH;
  const yMond = v => pad.t + innerH - (v / (mondMax || 1)) * innerH;

  const fiscPath = series.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(p.month).toFixed(1)} ${yFisc(p.fiscUsd).toFixed(1)}`).join(' ');
  const mondPath = series.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(p.month).toFixed(1)} ${yMond(p.mondOutstanding).toFixed(1)}`).join(' ');

  // X grid + labels every 3 months
  let xGrid = '';
  for (let m = 0; m <= months[months.length - 1]; m += 3) {
    xGrid += `<line x1="${xScale(m)}" y1="${pad.t}" x2="${xScale(m)}" y2="${pad.t + innerH}" stroke="#14171f" stroke-width="1"/>`;
    xGrid += `<text x="${xScale(m)}" y="${H - 10}" fill="#5a6373" font-size="10" text-anchor="middle">M${m}</text>`;
  }
  // Y axes labels
  let yLabels = '';
  for (let i = 0; i <= 4; i++) {
    const yPx = pad.t + (innerH * i / 4);
    const fiscVal = fiscMax - (fiscMax - fiscMin) * (i / 4);
    const mondVal = mondMax - mondMax * (i / 4);
    yLabels += `<line x1="${pad.l}" y1="${yPx}" x2="${pad.l + innerW}" y2="${yPx}" stroke="#14171f" stroke-width="1"/>`;
    yLabels += `<text x="${pad.l - 8}" y="${yPx + 3}" fill="#a8e6a8" font-size="10" text-anchor="end">$${Math.round(fiscVal).toLocaleString()}</text>`;
    yLabels += `<text x="${pad.l + innerW + 8}" y="${yPx + 3}" fill="#7aa2ff" font-size="10" text-anchor="start">${Math.round(mondVal).toLocaleString()}</text>`;
  }

  svg.innerHTML = `
    ${xGrid}
    ${yLabels}
    <path d="${fiscPath}" fill="none" stroke="#a8e6a8" stroke-width="2"/>
    <path d="${mondPath}" fill="none" stroke="#7aa2ff" stroke-width="2"/>
    <text x="${pad.l}" y="${pad.t - 4}" fill="#a8e6a8" font-size="10">Fisc USD reserve</text>
    <text x="${pad.l + innerW}" y="${pad.t - 4}" fill="#7aa2ff" font-size="10" text-anchor="end">MOND outstanding</text>
  `;
}

function renderTrajectoryTable(series) {
  const tbody = document.querySelector('#traj-table tbody');
  if (!tbody) return;
  // Show every 3rd month + final
  const last = series[series.length - 1].month;
  const rows = series.filter(p => p.month === 0 || p.month % 3 === 0 || p.month === last);
  const startFisc = series[0].fiscUsd;
  tbody.innerHTML = rows.map(p => {
    const fiscDelta = p.fiscUsd - startFisc;
    const fiscDeltaClass = fiscDelta >= 0 ? 'pos' : 'neg';
    return `<tr>
      <td class="day">${p.month}</td>
      <td class="fisc">$${fmt(p.fiscUsd)}</td>
      <td class="${fiscDeltaClass}">${fiscDelta >= 0 ? '+' : ''}$${fmt(fiscDelta)}</td>
      <td class="mond-out">${fmt(p.mondOutstanding)}</td>
      <td>${fmt(p.citizens.Bob)}</td>
      <td>${fmt(p.citizens.Alice)}</td>
      <td>${fmt(p.citizens.John)}</td>
      <td>${fmt(p.citizens.Jane)}</td>
    </tr>`;
  }).join('');
}

// ── Feasibility indicators — textbook small-open-economy diagnostics ──
// Six headline numbers an economist would track for this colony:
//   1. Current account balance   — exports + MPC − imports − supplies (USD/mo)
//   2. Reserve cover             — Fisc USD / monthly USD outflow (months)
//   3. Money supply              — MOND outstanding + net seigniorage/mo
//   4. Velocity (Fisher MV=PY)   — MOND transactions / average M
//   5. Inflation / basket        — basket cost vs 2026 baseline
//   6. Real UBI                  — UBI / monthly basket cost (baskets/mo)

function computeIndicators(setup, m1) {
  // Decompose the month's events into current vs capital flows.
  let exports = 0, mpcUsd = 0, imports = 0, supplies = 0, fxOut = 0;
  let mondTxnVolume = 0;
  for (const ev of m1.events) {
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
      if (/Clay|kiln|postage|suppl/i.test(desc)) supplies += -ev.fiscDelta;
      else                                       imports  += -ev.fiscDelta;
    }
  }
  // 1. Current account (USD/mo)
  const currentAccount = exports + mpcUsd - imports - supplies;
  // 2. Reserve cover (months): Fisc / (current-account outflow + capital outflow)
  const monthlyOut = imports + supplies + fxOut;
  const reserveCover = monthlyOut > 0 ? m1.fiscUsd / monthlyOut : null;
  // 3. Money supply: MOND outstanding now + seigniorage = net mint this month
  const M = m1.mondOutstanding;
  const minted = (4 * setup.ubi) + setup.pottery_rev;
  const retired = imports + supplies + fxOut;
  const seigniorage = minted - retired;
  // 4. Velocity (Fisher MV=PY): transactions ÷ average outstanding M
  // Use end-of-month M as proxy for M_avg (single-month sim has no prior).
  const velocity = M > 0 ? mondTxnVolume / M : null;
  // 5. Basket / inflation
  const basket = setup.c_external + setup.c_internal;     // per-citizen monthly spend (MOND/USD 1:1)
  const basketRatio = basket / BASKET_2026;                // e.g. 0.186
  const cumulativeDeflation = 1 - basketRatio;             // 0.81 = 81% below 2026
  // 6. Real UBI: how many basket-cycles UBI buys
  const realUBI = basket > 0 ? setup.ubi / basket : null;
  return {
    currentAccount, reserveCover,
    M, seigniorage, velocity,
    basket, basketRatio, cumulativeDeflation,
    realUBI,
    flows: { exports, mpcUsd, imports, supplies, fxOut },
  };
}

function indicatorClass(value, thresholds) {
  // thresholds = { green: fn, red: fn }
  if (value === null || value === undefined || isNaN(value)) return 'ind-flat';
  if (thresholds.green(value)) return 'ind-ok';
  if (thresholds.red(value))   return 'ind-crit';
  return 'ind-warn';
}

function renderIndicators(ind) {
  const grid = document.getElementById('indicators');
  if (!grid) return;

  const cards = [
    {
      title: '1 · Current account',
      big: (ind.currentAccount >= 0 ? '+' : '') + '$' + fmt(ind.currentAccount) + ' / mo',
      sub: `exports $${fmt(ind.flows.exports)} + MPC $${fmt(ind.flows.mpcUsd)} − imports $${fmt(ind.flows.imports)} − supplies $${fmt(ind.flows.supplies)}`,
      verdict: ind.currentAccount >= 0
        ? 'colony pays its own way on goods + services'
        : 'colony spending more abroad than it earns',
      cls: indicatorClass(ind.currentAccount, {
        green: v => v > 0, red: v => v < -50,
      }),
    },
    {
      title: '2 · Reserve cover',
      big: ind.reserveCover === null
        ? '∞'
        : fmt(ind.reserveCover) + ' months',
      sub: `Fisc USD ÷ monthly outflow ($${fmt(ind.flows.imports + ind.flows.supplies + ind.flows.fxOut)})`,
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
      verdict: Math.abs(ind.seigniorage) < 20
        ? 'stable — mint roughly matches retirement'
        : ind.seigniorage > 0
          ? 'expanding — new MOND faster than burn'
          : 'contracting — burn exceeds new mint',
      cls: indicatorClass(Math.abs(ind.seigniorage), {
        green: v => v < 50, red: v => v > 200,
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
      big: '−' + fmt(ind.cumulativeDeflation * 100) + '% vs 2026',
      sub: `basket cost: $${fmt(ind.basket)}/mo (was $${BASKET_2026} in 2026)`,
      verdict: ind.cumulativeDeflation > 0.5
        ? 'deep deflation — automation has slashed real costs'
        : ind.cumulativeDeflation > 0
          ? 'moderate deflation'
          : 'no deflation — abundance not yet reached',
      cls: 'ind-flat',
    },
    {
      title: '6 · Real UBI',
      big: ind.realUBI === null ? '—' : ind.realUBI.toFixed(2) + '× basket',
      sub: `${fmt(parseFloat(document.getElementById('ubi').value))} MOND UBI ÷ $${fmt(ind.basket)} basket`,
      verdict: ind.realUBI === null ? '—'
        : ind.realUBI >= 1.5 ? 'generous — surplus available for savings'
        : ind.realUBI >= 1.0 ? 'sufficient — exactly covers essentials'
        : 'insufficient — citizens fall short',
      cls: indicatorClass(ind.realUBI, {
        green: v => v >= 1, red: v => v < 0.8,
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
  const months = Math.max(1, Math.min(60, parseInt(document.getElementById('n_months').value, 10) || 24));
  // Single-month detail
  const m1 = runMonth(setup);
  renderLog(m1);
  renderBalances(m1);
  renderFlowCheck(m1);
  // Indicators
  const ind = computeIndicators(setup, m1);
  renderIndicators(ind);
  // Multi-month trajectory
  const series = runMonths(setup, months);
  renderTrajectoryChart(series);
  renderTrajectoryTable(series);
}

INPUT_IDS.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => { saveInputs(); render(); });
    el.addEventListener('change', () => { saveInputs(); render(); });
  }
});

const resetBtn = document.getElementById('reset-defaults');
if (resetBtn) resetBtn.addEventListener('click', resetInputs);

restoreInputs();
render();
