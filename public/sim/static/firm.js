// /firm — following one manufacturing firm through automation.
//
// A single factory, tracked in today's money as machines replace its workers.
// The point: the money a firm stops paying in wages does not vanish. Part of it
// becomes a charge that pays a basic income to the people who lost their jobs;
// the rest becomes extra profit. So the firm stays profitable, the displaced
// keep an income, and demand for the firm's goods holds up.

const { unempRateAt, HORIZON, lineChart } = MF;

const STORAGE_KEY = 'axion_firm_v1';

// The factory today (2026), in today's money.
const WORKERS0 = 100;          // people employed
const WAGE = 50000;            // average pay per person / yr
const REVENUE0 = 12e6;         // sales / yr
const MATERIALS0 = 4e6;        // materials + energy / yr
// today's profit = 12.0M sales − 5.0M wages − 4.0M materials = 3.0M

const empShare0 = 1 - unempRateAt(0) / 100;

function usd(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return (v < 0 ? '−$' : '$') + (a / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return (v < 0 ? '−$' : '$') + Math.round(a / 1e3) + 'k';
  return (v < 0 ? '−$' : '$') + Math.round(a);
}

function firmAt(t, cfg) {
  const share = (1 - unempRateAt(t) / 100) / empShare0;   // workforce vs today: 1 → ~0.26
  const workers = WORKERS0 * share;
  const displaced = WORKERS0 - workers;
  const wages = workers * WAGE;
  const charge = displaced * cfg.basicIncome;             // pays a basic income to those who left
  const priceFall = cfg.priceFall * (t / HORIZON);        // its goods get cheaper over the years
  const revenue = REVENUE0 * (1 - priceFall);
  const materials = MATERIALS0 * (1 - 0.3 * (1 - share)); // inputs a little cheaper as it automates
  const profit = revenue - wages - materials - charge;
  return { year: 2026 + t, workers, displaced, wages, materials, charge, revenue, profit };
}

// ── The path: wages, charge and profit as the factory automates ─────────────
function pathChart(rows) {
  const all = rows.flatMap(r => [r.wages, r.charge, r.profit]);
  const yMax = Math.ceil(Math.max(...all) / 1e6) * 1e6 || 1e6;
  const yTicks = []; for (let v = 0; v <= yMax + 0.5e6; v += 1e6) yTicks.push(v);
  return lineChart({
    height: 360, padR: 150, xDomain: [2026, 2046], yDomain: [0, yMax],
    xTicks: [2026, 2031, 2036, 2041, 2046], yTicks, yFmt: usd,
    series: [
      { label: 'Wages', color: 'var(--blue)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.wages })) },
      { label: 'Charge (basic income)', color: 'var(--ok)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.charge })) },
      { label: 'Profit', color: 'var(--warn)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.profit })) },
    ],
  });
}

// ── Side-by-side accounts: today vs fully automated ─────────────────────────
function accountsTable(rows) {
  const a = rows[0], b = rows[HORIZON];
  const line = (label, av, bv, o = {}) => {
    const c = o.color || 'var(--txt2)';
    const fw = o.strong ? 'font-weight:bold;' : '';
    const pre = o.minus ? '− ' : (o.equals ? '= ' : '');
    const fmt = o.count ? (v => Math.round(v).toLocaleString()) : usd;
    return `<tr style="${o.top ? 'border-top:1px solid var(--line-hot);' : ''}">
      <td class="cat" style="${fw}">${label}</td>
      <td class="num" style="color:${c};${fw}">${o.count ? '' : ''}${pre}${fmt(av)}</td>
      <td class="num" style="color:${c};${fw}">${pre}${fmt(bv)}</td>
    </tr>`;
  };
  const profitColor = b.profit >= a.profit ? 'var(--ok)' : (b.profit >= 0 ? 'var(--warn)' : 'var(--crit)');
  return `
  <table style="table-layout:fixed; width:100%; max-width:620px;">
    <colgroup><col style="width:46%;"><col style="width:27%;"><col style="width:27%;"></colgroup>
    <thead><tr><th>The factory's year</th><th class="num">Today</th><th class="num">Fully automated</th></tr></thead>
    <tbody>
      ${line('People employed', a.workers, b.workers, { count: true })}
      ${line('Sales (revenue)', a.revenue, b.revenue, { top: true })}
      ${line('Wages', a.wages, b.wages, { minus: true, color: 'var(--blue)' })}
      ${line('Materials & energy', a.materials, b.materials, { minus: true })}
      ${line('Charge (pays the basic income)', a.charge, b.charge, { minus: true, color: 'var(--ok)' })}
      ${line('Profit', a.profit, b.profit, { equals: true, strong: true, top: true, color: profitColor })}
    </tbody>
  </table>`;
}

// ── Render ──────────────────────────────────────────────────────────────────
function readCfg() {
  const pf = parseFloat((document.getElementById('priceFall') || {}).value);
  const bi = parseFloat((document.getElementById('basicIncome') || {}).value);
  return { priceFall: isNaN(pf) ? 0.33 : pf / 100, basicIncome: isNaN(bi) ? 20000 : bi };
}

function render() {
  const cfg = readCfg();
  const pfOut = document.getElementById('priceFall_v'), biOut = document.getElementById('basicIncome_v');
  if (pfOut) pfOut.textContent = Math.round(cfg.priceFall * 100) + '%';
  if (biOut) biOut.textContent = usd(cfg.basicIncome) + '/yr';

  const rows = Array.from({ length: HORIZON + 1 }, (_, t) => firmAt(t, cfg));
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };
  set('path-chart', pathChart(rows));
  set('accounts', accountsTable(rows));

  const a = rows[0], b = rows[HORIZON];
  const wageSaving = a.wages - b.wages;
  set('headline-stats', [
    ['People employed', Math.round(a.workers) + ' → ' + Math.round(b.workers), 'var(--blue)'],
    ['Wages it no longer pays', usd(wageSaving), 'var(--txt2)'],
    ['Charge it pays instead', usd(b.charge), 'var(--ok)'],
    ['Profit', usd(a.profit) + ' → ' + usd(b.profit), b.profit >= a.profit ? 'var(--ok)' : (b.profit >= 0 ? 'var(--warn)' : 'var(--crit)')],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    const ok = b.profit >= 0;
    verdict.style.borderLeftColor = ok ? 'var(--ok)' : 'var(--crit)';
    if (ok) {
      verdict.innerHTML =
        `Once the factory is fully automated it employs <strong>${Math.round(b.workers)}</strong> people instead of `
        + `<strong>${Math.round(a.workers)}</strong>. It no longer pays <strong>${usd(wageSaving)}</strong> of wages each year. `
        + `Out of that saving it pays a <strong>${usd(b.charge)}</strong> charge — enough to give each of the `
        + `<strong>${Math.round(b.displaced)}</strong> people who left a <strong>${usd(cfg.basicIncome)}</strong> basic income — and keeps the rest. `
        + `Even though its goods now sell for <strong>${Math.round(cfg.priceFall * 100)}% less</strong>, its profit is `
        + `<strong>${usd(b.profit)}</strong> — ${b.profit >= a.profit ? 'more than' : 'close to'} the <strong>${usd(a.profit)}</strong> it makes today. `
        + `And because the people who lost their jobs still have an income, they can still afford to buy what the factory makes.`;
    } else {
      verdict.innerHTML =
        `At a <strong>${Math.round(cfg.priceFall * 100)}%</strong> fall in its prices and a <strong>${usd(cfg.basicIncome)}</strong> basic income, `
        + `the charge plus its remaining costs are more than its sales — the factory makes a <strong>loss</strong> of `
        + `<strong>${usd(-b.profit)}</strong>. Lower the basic income or the price fall to see where it stays viable.`;
    }
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">How much cheaper its goods are by the end (price fall)</span>
      <input type="range" id="priceFall" min="0" max="50" step="1" value="33">
      <span class="ctrl-val" id="priceFall_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Basic income for each person who lost their job</span>
      <input type="range" id="basicIncome" min="10000" max="30000" step="1000" value="20000">
      <span class="ctrl-val" id="basicIncome_v"></span>
    </label>
    <div class="assumptions">
      <span>Starts at <b>100</b> staff on <b>$50k</b>; <b>$12M</b> sales, <b>$4M</b> materials, <b>$3M</b> profit</span>
      <span>By the end machines do ~<b>three-quarters</b> of the work</span>
      <span>A <b>$20k</b> basic income is roughly the <a href="cost-deflation" style="color:var(--ok);">basket</a> of essentials</span>
    </div>`;
  document.getElementById('priceFall').addEventListener('input', render);
  document.getElementById('basicIncome').addEventListener('input', render);
}

function init() { buildControls(); render(); MF.load().then(render); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
