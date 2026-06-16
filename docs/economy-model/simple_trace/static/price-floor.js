// /price-floor — how far prices actually fall once a UBI must be funded.
//
// The naive AI-deflation story assumes the whole productivity saving passes
// through to lower prices. But the displaced need income to buy the goods, and
// that income (UBI) is funded by a charge (the MAC) loaded into production —
// part of what everyone buys. So the charge is self-referential: the price can't
// fall below the level needed to fund the demand that buys it.
//
//   price = (cost after productivity) / (1 − share of spending funded by UBI)
//
// The numerator is the naive floor; the denominator pushes it back up. As
// displacement deepens, the denominator shrinks and the floor climbs above the
// naive level — sharply in the limit where most demand is UBI-funded.

const { unempRateAt, HORIZON, WORKING_AGE, TOTAL_POP, lineChart } = MF;

const STORAGE_KEY = 'axion_pricefloor_v1';
const WA_SHARE = WORKING_AGE / TOTAL_POP;     // working-age share of population (~0.61)
const e0 = 1 - unempRateAt(0) / 100;          // employment fraction today (~0.96)
const NL_FLOOR = 0.12;                         // materials/energy deflation floor (% of today)

function model(cfg) {
  const empMin = 1 - 0.75;                      // employment at the end of the ramp (25%)
  const dispMax = 1 - empMin / e0;              // worker displacement by 2046 (~0.74)
  const Uend = 1 - WA_SHARE * empMin;           // ~0.85: share of ALL people on the basic income by 2046
  const rows = [];
  for (let t = 0; t <= HORIZON; t++) {
    const emp = 1 - unempRateAt(t) / 100;        // employment fraction of the working-age
    const disp = 1 - emp / e0;                   // share of workers displaced vs today
    const prog = dispMax > 0 ? disp / dispMax : 0;   // automation progress 0 → 1
    const g = 1 - (1 - cfg.gFloor) * prog;       // labour in each product: 1 → gFloor
    const rho = 1 - (1 - NL_FLOOR) * prog;       // materials/energy: 1 → NL_FLOOR
    const naive = cfg.lambda * g + (1 - cfg.lambda) * rho;   // price if every saving cut prices
    const U = Uend * prog;                       // share on the basic income, ramps 0 → ~0.85
    const ubiShare = Math.min(0.95, U * cfg.income);   // share of spending funded by the basic income
    const actual = Math.min(100, naive / Math.max(0.06, 1 - ubiShare) * 100);
    rows.push({ year: 2026 + t, naive: naive * 100, actual, U });
  }
  return rows;
}

function priceChart(rows) {
  return lineChart({
    height: 360, padR: 150, xDomain: [2026, 2046], yDomain: [0, 110],
    xTicks: [2026, 2031, 2036, 2041, 2046], yTicks: [0, 25, 50, 75, 100], yFmt: v => v + '%',
    series: [
      { label: 'Naive floor (all saving → prices)', color: 'var(--dim)', width: 2, dashed: true, pts: rows.map(r => ({ x: r.year, y: r.naive })) },
      { label: 'Actual floor (UBI funded)', color: 'var(--ok)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.actual })) },
    ],
  });
}

// ── Render ──────────────────────────────────────────────────────────────────
function readCfg() {
  const lam = parseFloat((document.getElementById('lambda') || {}).value);
  const gf = parseFloat((document.getElementById('gFloor') || {}).value);
  const inc = parseFloat((document.getElementById('income') || {}).value);
  return {
    lambda: isNaN(lam) ? 0.65 : lam / 100,
    gFloor: isNaN(gf) ? 0.10 : gf / 100,
    income: isNaN(inc) ? 1.0 : inc / 100,
  };
}

function render() {
  const cfg = readCfg();
  const lamOut = document.getElementById('lambda_v'), gfOut = document.getElementById('gFloor_v'), incOut = document.getElementById('income_v');
  if (lamOut) lamOut.textContent = Math.round(cfg.lambda * 100) + '%';
  if (gfOut) gfOut.textContent = Math.round(cfg.gFloor * 100) + '%';
  if (incOut) incOut.textContent = Math.round(cfg.income * 100) + '%';

  const rows = model(cfg);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };
  set('price-chart', priceChart(rows));

  const b = rows[HORIZON];
  set('headline-stats', [
    ['Cheaper production alone · 2046', Math.round(b.naive) + '%', 'var(--dim)'],
    ['With the basic income funded · 2046', Math.round(b.actual) + '%', 'var(--ok)'],
    ['How much higher prices stay · 2046', '+' + Math.round(b.actual - b.naive) + ' points', 'var(--warn)'],
    ['People living on the basic income · 2046', Math.round(b.U * 100) + '%', 'var(--blue)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.innerHTML =
      `If cheaper production were the only thing happening, prices would fall to about <strong>${Math.round(b.naive)}%</strong> `
      + `of today by 2046. But by then about <strong>${Math.round(b.U * 100)}%</strong> of people live on the basic income — only ~15% `
      + `are still in work — and the charge that funds everyone's basket is built into every price. So prices settle far higher, at about `
      + `<strong>${Math.round(b.actual)}%</strong>. Cheaper machines pull prices down; the basic income that nearly everyone now needs pushes `
      + `them most of the way back up. The "almost free" story only holds if you imagine the <strong>${Math.round(b.U * 100)}%</strong> who no `
      + `longer earn can somehow still buy.`;
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Of what a product costs to make today, how much is wages?</span>
      <input type="range" id="lambda" min="40" max="80" step="1" value="65">
      <span class="ctrl-val" id="lambda_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Once fully automated, the wages in each product fall to…</span>
      <input type="range" id="gFloor" min="5" max="40" step="1" value="10">
      <span class="ctrl-val" id="gFloor_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Basic income, as a share of a full basket of essentials</span>
      <input type="range" id="income" min="100" max="150" step="5" value="100">
      <span class="ctrl-val" id="income_v"></span>
    </label>
    <div class="assumptions">
      <span>By 2046 about <b>85%</b> of people live on the basic income — only ~15% still in work</span>
      <span>Materials &amp; energy deflate to <b>12%</b> of today</span>
      <span>The basic income always covers a full basket (100%) — below that, people couldn't live</span>
    </div>`;
  ['lambda', 'gFloor', 'income'].forEach(id => document.getElementById(id).addEventListener('input', render));
}

function init() { buildControls(); render(); MF.load().then(render); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
