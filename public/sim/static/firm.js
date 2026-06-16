// /firm — following one manufacturing firm through automation.
//
// A single factory, tracked in today's money as machines replace its workers.
// As it automates it earns more profit per worker, so it pays a larger Market
// Access Charge (MAC) for the right to sell into the colony's market — yet it
// stays profitable even as its goods get cheaper. What the colony does with the
// pooled charges is a separate question (see the Fisc page).

const { unempRateAt, HORIZON, macRate, RATE_CAP, lineChart } = MF;

const STORAGE_KEY = 'axion_firm_v2';

// The factory today (2026), in today's money.
const WORKERS0 = 100;          // people employed
const WAGE = 50000;            // average pay per person / yr
const REVENUE0 = 12e6;         // sales / yr
const MATERIALS0 = 4e6;        // materials + energy / yr
// today's operating profit = 12.0M sales − 5.0M wages − 4.0M materials = 3.0M

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
  const wages = workers * WAGE;
  const priceFall = cfg.priceFall * (t / HORIZON);        // its goods get cheaper over the years
  const revenue = REVENUE0 * (1 - priceFall);
  const materials = MATERIALS0 * (1 - 0.3 * (1 - share)); // inputs a little cheaper as it automates
  const opProfit = Math.max(0, revenue - wages - materials);
  const rate = macRate(opProfit, workers, cfg.k);         // market-access rate, rises with profit/worker
  const charge = opProfit * rate;
  const profit = opProfit - charge;
  return { year: 2026 + t, workers, wages, materials, revenue, opProfit, rate, charge, profit };
}

// ── The path: wages, charge and profit as the factory automates ─────────────
function pathChart(rows) {
  const all = rows.flatMap(r => [r.wages, r.charge, r.profit]);
  const yMax = Math.ceil(Math.max(...all) / 1e6) * 1e6 || 1e6;
  const yTicks = []; for (let v = 0; v <= yMax + 0.5e6; v += 1e6) yTicks.push(v);
  return lineChart({
    height: 360, padR: 160, xDomain: [2026, 2046], yDomain: [0, yMax],
    xTicks: [2026, 2031, 2036, 2041, 2046], yTicks, yFmt: usd,
    series: [
      { label: 'Wages', color: 'var(--blue)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.wages })) },
      { label: 'Market-access charge', color: 'var(--ok)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.charge })) },
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
      <td class="num" style="color:${c};${fw}">${pre}${fmt(av)}</td>
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
      ${line('Operating profit', a.opProfit, b.opProfit, { equals: true, top: true })}
      ${line('Market Access Charge', a.charge, b.charge, { minus: true, color: 'var(--ok)' })}
      ${line('Profit', a.profit, b.profit, { equals: true, strong: true, top: true, color: profitColor })}
    </tbody>
  </table>
  <div style="font-size:11px; color:var(--faint); margin-top:10px; line-height:1.6;">
    The Market Access Charge is worked out from <strong style="color:var(--txt2);">operating profit</strong>
    (the line above it) and its profit-per-worker — never from the final profit line below it. So the charge
    does not depend on itself.
  </div>`;
}

// ── Render ──────────────────────────────────────────────────────────────────
function readCfg() {
  const pf = parseFloat((document.getElementById('priceFall') || {}).value);
  const k = parseFloat((document.getElementById('k') || {}).value);
  return { priceFall: isNaN(pf) ? 0.33 : pf / 100, k: isNaN(k) ? 1.0 : k };
}

function render() {
  const cfg = readCfg();
  const pfOut = document.getElementById('priceFall_v'), kOut = document.getElementById('k_v');
  if (pfOut) pfOut.textContent = Math.round(cfg.priceFall * 100) + '%';
  if (kOut) kOut.textContent = '×' + cfg.k.toFixed(2);

  const rows = Array.from({ length: HORIZON + 1 }, (_, t) => firmAt(t, cfg));
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };
  set('path-chart', pathChart(rows));
  set('accounts', accountsTable(rows));

  const a = rows[0], b = rows[HORIZON];
  set('headline-stats', [
    ['People employed', Math.round(a.workers) + ' → ' + Math.round(b.workers), 'var(--blue)'],
    ['Sales (revenue)', usd(a.revenue) + ' → ' + usd(b.revenue), 'var(--txt2)'],
    ['Market Access Charge', usd(a.charge) + ' → ' + usd(b.charge), 'var(--ok)'],
    ['Profit', usd(a.profit) + ' → ' + usd(b.profit), b.profit >= a.profit ? 'var(--ok)' : (b.profit >= 0 ? 'var(--warn)' : 'var(--crit)')],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    const ok = b.profit >= 0;
    const capped = b.rate >= RATE_CAP - 1e-9;
    verdict.style.borderLeftColor = ok ? 'var(--ok)' : 'var(--crit)';
    if (ok) {
      verdict.innerHTML =
        `Once the factory is fully automated it employs <strong>${Math.round(b.workers)}</strong> people instead of `
        + `<strong>${Math.round(a.workers)}</strong>. Because it now earns far more profit for each worker, it pays a much larger `
        + `charge for access to the market — <strong>${usd(b.charge)}</strong> (a ${(b.rate * 100).toFixed(0)}% rate${capped ? ', at the cap' : ''}), `
        + `up from <strong>${usd(a.charge)}</strong> today. Even so, and even though its goods now sell for `
        + `<strong>${Math.round(cfg.priceFall * 100)}% less</strong>, it makes <strong>${usd(b.profit)}</strong> profit — `
        + `${b.profit >= a.profit ? 'more than' : 'close to'} the <strong>${usd(a.profit)}</strong> it makes today. Automation leaves the `
        + `factory more profitable and a bigger contributor to the market it sells into.`;
    } else {
      verdict.innerHTML =
        `At a <strong>${Math.round(cfg.priceFall * 100)}%</strong> fall in its prices, the charge plus its other costs exceed its sales — `
        + `the factory makes a <strong>loss</strong> of <strong>${usd(-b.profit)}</strong>. Lower the price fall or the charge multiplier to see where it stays viable.`;
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
      <span class="ctrl-label">Market-access charge multiplier (k) — usually 1.0</span>
      <input type="range" id="k" min="0.5" max="2.0" step="0.05" value="1.0">
      <span class="ctrl-val" id="k_v"></span>
    </label>
    <div class="assumptions">
      <span>Starts at <b>100</b> staff on <b>$50k</b>; <b>$12M</b> sales, <b>$4M</b> materials, <b>$3M</b> profit</span>
      <span>By the end machines do ~<b>three-quarters</b> of the work</span>
      <span>Charge rate = min(<b>50%</b>, k × <b>22%</b> × operating-profit-per-worker / <b>$200k</b>)</span>
    </div>`;
  document.getElementById('priceFall').addEventListener('input', render);
  document.getElementById('k').addEventListener('input', render);
}

function init() { buildControls(); render(); MF.load().then(render); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
