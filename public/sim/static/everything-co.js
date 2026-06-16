// /everything-co — bottom-up: one company (Everything & Co) makes the whole basket.
//
// As it automates, the cost of making a basket collapses. But the price can't
// follow all the way down, because the price has to raise the charge (MAC) that
// funds a basic income for everyone now out of work — and a basic income only
// has a source if the company makes a surplus, which needs price above cost.
// We solve for the price each year where the company's surplus exactly funds the
// basic income, and watch its own margin get squeezed.

const { unempRateAt, HORIZON, lineChart } = MF;

const STORAGE_KEY = 'axion_everythingco_v1';
const POP = 1000;            // working-age people, each consuming one basket
const BASKET0 = 20000;       // today's basket price, $/yr
const e0 = 1 - unempRateAt(0) / 100;
const empMin = 1 - 0.75;
const dispMax = 1 - empMin / e0;

function usd(v) {
  if (v === null || !isFinite(v)) return '—';
  const a = Math.abs(v), s = v < 0 ? '−' : '';
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return s + '$' + (a / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'k';
  return s + '$' + Math.round(a);
}

function model(cfg) {
  const opCost0 = BASKET0 * (1 - cfg.margin0);     // today's cost to make a basket
  const rows = [];
  for (let t = 0; t <= HORIZON; t++) {
    const emp = 1 - unempRateAt(t) / 100;
    const disp = 1 - emp / e0;
    const prog = dispMax > 0 ? disp / dispMax : 0;          // automation progress 0 → 1
    const opCost = opCost0 * (1 - (1 - cfg.costFloor) * prog);   // cost to make a basket
    const opCostTotal = POP * opCost;
    const onUBI = POP * (unempRateAt(t) / 100);             // people out of work, on the basic income
    const marginPrice = opCost / (1 - cfg.margin0);         // price if it just kept its normal margin
    const denom = POP * (1 - cfg.keep) - onUBI;             // earners (minus kept margin) left to carry the charge
    const fundPrice = denom > 0 ? opCostTotal / denom : Infinity;   // price needed to fund the basic income
    const price = Math.max(marginPrice, fundPrice);
    const revenue = POP * price;
    const grossProfit = revenue - opCostTotal;
    const ubiBill = onUBI * price;
    const mac = Math.min(grossProfit, ubiBill);
    const retained = grossProfit - mac;                     // what Everything & Co keeps
    rows.push({
      year: 2026 + t, opCost, opCostTotal, onUBI, marginPrice, price, revenue,
      grossProfit, ubiBill, mac, retained,
      costPct: opCost / opCost0, pricePct: price / BASKET0, diverges: !isFinite(price),
    });
  }
  return rows;
}

// ── Chart: cost to make a basket vs its price ───────────────────────────────
function priceChart(rows) {
  const vals = rows.flatMap(r => [isFinite(r.price) ? r.price : 0, r.opCost]);
  const yMax = Math.max(BASKET0, Math.ceil(Math.max(...vals) / 5000) * 5000) || 5000;
  const yTicks = []; for (let v = 0; v <= yMax; v += 5000) yTicks.push(v);
  return lineChart({
    height: 360, padR: 170, xDomain: [2026, 2046], yDomain: [0, yMax],
    xTicks: [2026, 2031, 2036, 2041, 2046], yTicks, yFmt: usd,
    series: [
      { label: 'Cost to make a basket', color: 'var(--dim)', width: 2, dashed: true, pts: rows.map(r => ({ x: r.year, y: r.opCost })) },
      { label: 'Basket price', color: 'var(--ok)', width: 3, pts: rows.map(r => ({ x: r.year, y: isFinite(r.price) ? r.price : yMax })) },
    ],
  });
}

// ── Everything & Co's accounts: today vs 2046 ───────────────────────────────
function pnlTable(rows) {
  const a = rows[0], b = rows[HORIZON];
  const row = (label, av, bv, o = {}) => {
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
  return `
  <table style="table-layout:fixed; width:100%; max-width:640px;">
    <colgroup><col style="width:48%;"><col style="width:26%;"><col style="width:26%;"></colgroup>
    <thead><tr><th>Everything &amp; Co — for the year</th><th class="num">Today</th><th class="num">2046</th></tr></thead>
    <tbody>
      ${row('People out of work (on the basic income)', a.onUBI, b.onUBI, { count: true })}
      ${row('Cost to make one basket', a.opCost, b.opCost, {})}
      ${row('Basket price', a.price, b.price, { color: 'var(--ok)' })}
      ${row('Revenue (1,000 baskets)', a.revenue, b.revenue, { top: true })}
      ${row('Cost of making them', a.opCostTotal, b.opCostTotal, { minus: true })}
      ${row('Gross profit', a.grossProfit, b.grossProfit, { equals: true, top: true })}
      ${row('Charge (MAC → basic income)', a.mac, b.mac, { minus: true, color: 'var(--ok)' })}
      ${row('Everything & Co keeps', a.retained, b.retained, { equals: true, strong: true, top: true, color: b.retained > 0 ? 'var(--txt2)' : 'var(--warn)' })}
    </tbody>
  </table>`;
}

function yearTable(rows) {
  const body = [0, 5, 10, 15, 20].map(t => {
    const r = rows[t];
    return `<tr>
      <td class="cat">${r.year}</td>
      <td class="num">${Math.round(r.onUBI).toLocaleString()}</td>
      <td class="num">${usd(r.opCost)}</td>
      <td class="num" style="color:var(--ok);">${usd(r.price)}</td>
      <td class="num" style="color:var(--ok);">${usd(r.mac)}</td>
      <td class="num" style="color:${r.retained > 0 ? 'var(--txt2)' : 'var(--warn)'};">${usd(r.retained)}</td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:10%;"><col style="width:15%;"><col style="width:18%;"><col style="width:18%;"><col style="width:21%;"><col style="width:18%;"></colgroup>
    <thead><tr>
      <th>Year</th><th class="num">On basic income</th><th class="num">Cost / basket</th>
      <th class="num">Price / basket</th><th class="num">Charge (→ basic income)</th><th class="num">E&amp;Co keeps</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

// ── Render ──────────────────────────────────────────────────────────────────
function readCfg() {
  const cf = parseFloat((document.getElementById('costFloor') || {}).value);
  const mg = parseFloat((document.getElementById('margin') || {}).value);
  const kp = parseFloat((document.getElementById('keep') || {}).value);
  return {
    costFloor: isNaN(cf) ? 0.15 : cf / 100,
    margin0: isNaN(mg) ? 0.15 : mg / 100,
    keep: isNaN(kp) ? 0.0 : kp / 100,
  };
}

function render() {
  const cfg = readCfg();
  const out = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  out('costFloor_v', Math.round(cfg.costFloor * 100) + '%');
  out('margin_v', Math.round(cfg.margin0 * 100) + '%');
  out('keep_v', Math.round(cfg.keep * 100) + '%');

  const rows = model(cfg);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };
  set('price-chart', priceChart(rows));
  set('pnl-table', pnlTable(rows));
  set('year-table', yearTable(rows));

  const b = rows[HORIZON];
  set('headline-stats', [
    ['Cost to make a basket · 2046', usd(b.opCost) + ' (' + Math.round(b.costPct * 100) + '%)', 'var(--dim)'],
    ['Basket price · 2046', usd(b.price) + ' (' + Math.round(b.pricePct * 100) + '%)', 'var(--ok)'],
    ['Basic income / person · 2046', usd(b.price), 'var(--blue)'],
    ['Everything & Co keeps · 2046', usd(b.retained), b.retained > 0 ? 'var(--txt2)' : 'var(--warn)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    const a = rows[0];
    if (b.diverges) {
      verdict.style.borderLeftColor = 'var(--crit)';
      verdict.innerHTML = `At these settings there aren't enough earners left to carry the charge — the basic income can't be funded out of Everything & Co at all (the price runs away). Lower the profit it insists on keeping, or fewer people on the basic income.`;
    } else {
      verdict.style.borderLeftColor = 'var(--ok)';
      verdict.innerHTML =
        `Everything & Co's cost to make a basket falls from <strong>${usd(a.opCost)}</strong> to <strong>${usd(b.opCost)}</strong> — to `
        + `<strong>${Math.round(b.costPct * 100)}%</strong> of today. But the basket's price only falls to <strong>${usd(b.price)}</strong> `
        + `(<strong>${Math.round(b.pricePct * 100)}%</strong> of today), because the price has to raise the <strong>${usd(b.mac)}</strong> that funds `
        + `a basic income for the <strong>${Math.round(b.onUBI).toLocaleString()}</strong> people now out of work. Early on that charge fits easily inside the `
        + `company's profit; by 2046 it takes <strong>${b.retained > 0 ? 'most of' : 'all of'}</strong> its margin, leaving it <strong>${usd(b.retained)}</strong>. `
        + `The cost of making things collapses; the price falls far less — because the price is now also how everyone who can't work gets paid.`;
    }
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Cost to make a basket falls to (% of today) by 2046</span>
      <input type="range" id="costFloor" min="5" max="40" step="1" value="15">
      <span class="ctrl-val" id="costFloor_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Everything &amp; Co's profit margin today</span>
      <input type="range" id="margin" min="5" max="30" step="1" value="15">
      <span class="ctrl-val" id="margin_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Profit Everything &amp; Co insists on keeping</span>
      <input type="range" id="keep" min="0" max="15" step="1" value="0">
      <span class="ctrl-val" id="keep_v"></span>
    </label>
    <div class="assumptions">
      <span><b>1,000</b> working-age people, one basket each; today's basket = <b>$20,000</b></span>
      <span>Unemployment follows the <a href="unemployment" style="color:var(--ok);">cohort ramp</a> (4.2% → 75%)</span>
      <span>Price set so the charge exactly funds the basic income (= the basket) for those out of work</span>
    </div>`;
  ['costFloor', 'margin', 'keep'].forEach(id => document.getElementById(id).addEventListener('input', render));
}

function init() { buildControls(); render(); MF.load().then(render); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
