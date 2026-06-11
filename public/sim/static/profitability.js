// /profitability — Corporate Profitability in the Age of AI Abundance.
//
// MaryFontaine county scale (~180,000 adults). Fully client-side, so the page
// stays interactive on the static publish (no /api). Trajectories are FIXED
// research-based anchors (years 0,5,10,15,20); the MAC rate k is the only
// input. All figures real (today's prices).
//   unemployment + UBI/adult -> Grok V9.13 (matches colony-v0)
//   profit pool              -> realistic attributable pool, ~$14.4k/adult Y0 ($2.6B)
//   basket (family of 4)     -> research Aggregate Basket reference (cost-deflation)

const ADULTS = 180000;
const ANCHOR_YEARS = [0, 5, 10, 15, 20];
const A = {
  unemp:      [4.2, 18, 35, 55, 75],                       // %
  basket:     [980, 820, 650, 480, 320],                   // family of 4, $/mo
  pool:       [2.6e9, 4.1e9, 6.2e9, 9.1e9, 13.2e9],        // attributable profit pool, real $
  ubiAdultMo: [137, 232, 298, 355, 394],                   // $/adult/mo (Grok)
  grossMargin:[35, 42, 50, 54, 56],                        // % — research-derived
};
const LEA_Y0 = 2.6e9 / 0.18;
const HORIZON = 20;

// Productivity growth (% / yr): starts ~2.8%, accelerates to ~5% after
// widespread humanoid-robot deployment in the mid-2030s, then moderates.
// ~3.7-4.0% over 20yr. Source: McKinsey / PwC / RethinkX / Goldman Sachs.
const PROD_G = [{ y: 0, v: 2.8 }, { y: 5, v: 3.2 }, { y: 8, v: 4.5 }, { y: 10, v: 5.2 }, { y: 13, v: 5.3 }, { y: 20, v: 4.5 }];

const STORAGE_KEY = 'axion_profitability_v4';

// ── Helpers ──────────────────────────────────────────────────────────────
function interpA(arr, t) {
  if (t <= ANCHOR_YEARS[0]) return arr[0];
  if (t >= ANCHOR_YEARS[ANCHOR_YEARS.length - 1]) return arr[arr.length - 1];
  for (let i = 0; i < ANCHOR_YEARS.length - 1; i++) {
    if (t >= ANCHOR_YEARS[i] && t <= ANCHOR_YEARS[i + 1]) {
      const f = (t - ANCHOR_YEARS[i]) / (ANCHOR_YEARS[i + 1] - ANCHOR_YEARS[i]);
      return arr[i] + (arr[i + 1] - arr[i]) * f;
    }
  }
  return arr[arr.length - 1];
}
function interpYV(anchors, t) {
  if (t <= anchors[0].y) return anchors[0].v;
  if (t >= anchors[anchors.length - 1].y) return anchors[anchors.length - 1].v;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (t >= anchors[i].y && t <= anchors[i + 1].y) {
      const f = (t - anchors[i].y) / (anchors[i + 1].y - anchors[i].y);
      return anchors[i].v + (anchors[i + 1].v - anchors[i].v) * f;
    }
  }
  return anchors[anchors.length - 1].v;
}
function fmtBn(v) { return '$' + (v / 1e9).toFixed(2) + 'B'; }
function fmtMoney(v) { return v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : '$' + Math.round(v / 1e6) + 'M'; }
function fmtUSD(v) { return '$' + Math.round(v).toLocaleString(); }

function prodIndexSeries() {
  const idx = [1];
  for (let t = 1; t <= HORIZON; t++) idx[t] = idx[t - 1] * (1 + interpYV(PROD_G, t) / 100);
  return idx;
}
// Profit pool interpolated by cumulative productivity within each anchor
// segment — anchor years return exact values (table unchanged), the curve
// between them tracks the productivity ramp.
function poolAt(t, pidx) {
  if (t <= 0) return A.pool[0];
  if (t >= HORIZON) return A.pool[A.pool.length - 1];
  for (let i = 0; i < ANCHOR_YEARS.length - 1; i++) {
    const ya = ANCHOR_YEARS[i], yb = ANCHOR_YEARS[i + 1];
    if (t >= ya && t <= yb) {
      const w = (pidx[t] - pidx[ya]) / (pidx[yb] - pidx[ya]);
      return A.pool[i] + (A.pool[i + 1] - A.pool[i]) * w;
    }
  }
  return A.pool[A.pool.length - 1];
}

// ── Model ────────────────────────────────────────────────────────────────
function runModel(cfg) {
  const rows = [];
  const e0 = 1 - A.unemp[0] / 100;
  const pidx = prodIndexSeries();
  for (let t = 0; t <= HORIZON; t++) {
    const unemp = interpA(A.unemp, t);
    const basket = interpA(A.basket, t);
    const pool = poolAt(t, pidx);
    const ubiMo = interpA(A.ubiAdultMo, t);
    const grossMargin = interpA(A.grossMargin, t) / 100;

    const profitPerAdult = pool / ADULTS;
    const macPool = cfg.k * pool;
    const ubiCost = ubiMo * 12 * ADULTS;
    const coverage = macPool / ubiCost * 100;

    const e = 1 - unemp / 100;
    const poolUnchecked = pool * (e / e0);

    const priceIdx = basket / A.basket[0] * 100;
    const costIdx = priceIdx * (1 - grossMargin);
    const lea = LEA_Y0 * pidx[t];
    const profitShareLocal = pool / lea * 100;
    const prodGrowth = interpYV(PROD_G, t);

    rows.push({
      t, year: 2026 + t, unemp, basket, pool, ubiMo,
      profitPerAdult, macPool, ubiCost, coverage, poolUnchecked,
      grossMargin: grossMargin * 100, priceIdx, costIdx, profitShareLocal, prodGrowth,
    });
  }
  return rows;
}

// ── Generic SVG line chart ───────────────────────────────────────────────
function lineChart(opts) {
  const W = opts.width || 1280, H = opts.height || 320;
  const PAD = { l: 78, r: opts.padR || 210, t: 26, b: 42 };
  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const [x0, x1] = opts.xDomain, [y0, y1] = opts.yDomain;
  const xPx = x => PAD.l + plotW * (x - x0) / (x1 - x0);
  const yPx = y => PAD.t + plotH * (1 - (y - y0) / (y1 - y0));

  const grid = (opts.yTicks || []).map(t => `
    <line x1="${PAD.l}" y1="${yPx(t)}" x2="${PAD.l + plotW}" y2="${yPx(t)}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="2 3"/>
    <text x="${PAD.l - 8}" y="${yPx(t) + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${opts.yFmt ? opts.yFmt(t) : t}</text>
  `).join('');
  const xLabels = (opts.xTicks || []).map(x => `<text x="${xPx(x)}" y="${H - PAD.b + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${x}</text>`).join('');

  const areas = opts.series.filter(s => s.area).map(s => {
    const top = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPx(p.x).toFixed(1)} ${yPx(p.y).toFixed(1)}`).join(' ');
    const base = `L ${xPx(s.pts[s.pts.length - 1].x).toFixed(1)} ${yPx(y0).toFixed(1)} L ${xPx(s.pts[0].x).toFixed(1)} ${yPx(y0).toFixed(1)} Z`;
    return `<path d="${top} ${base}" fill="${s.color}" fill-opacity="${s.areaOpacity || 0.08}" stroke="none"/>`;
  }).join('');

  const labels = [];
  const paths = opts.series.map(s => {
    const d = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPx(p.x).toFixed(1)} ${yPx(p.y).toFixed(1)}`).join(' ');
    const last = s.pts[s.pts.length - 1];
    if (s.label) labels.push({ label: s.label, color: s.color, desiredY: yPx(last.y), endX: xPx(last.x) });
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.5}" ${s.dashed ? 'stroke-dasharray="6 4"' : ''}/>`;
  }).join('');

  labels.sort((a, b) => a.desiredY - b.desiredY);
  if (labels.length) {
    labels[0].placedY = labels[0].desiredY;
    for (let i = 1; i < labels.length; i++) labels[i].placedY = Math.max(labels[i].desiredY, labels[i - 1].placedY + 15);
  }
  const labelEls = labels.map(L => `
    <line x1="${L.endX + 4}" y1="${L.desiredY}" x2="${PAD.l + plotW + 12}" y2="${L.placedY}" stroke="${L.color}" stroke-width="0.5" opacity="0.5"/>
    <text x="${PAD.l + plotW + 14}" y="${L.placedY + 4}" fill="${L.color}" font-size="10" font-family="var(--mono)">${L.label}</text>
  `).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">${grid}${xLabels}${areas}${paths}${labelEls}</svg>`;
}

const YEAR_TICKS = [2026, 2031, 2036, 2041, 2046];
const yB = v => '$' + (v / 1e9).toFixed(0) + 'B';

function primaryChart(rows) {
  return lineChart({
    height: 380,
    xDomain: [2026, 2046], yDomain: [0, 14e9],
    xTicks: YEAR_TICKS, yTicks: [0, 2e9, 4e9, 6e9, 8e9, 10e9, 12e9, 14e9], yFmt: yB,
    series: [
      { label: 'With MAC + UBI loop', color: 'var(--ok)', area: true, width: 3,
        pts: rows.map(r => ({ x: r.year, y: r.pool })) },
      { label: 'Unchecked capital capture', color: 'var(--crit)', width: 2.5, dashed: true,
        pts: rows.map(r => ({ x: r.year, y: r.poolUnchecked })) },
      { label: 'MAC pool', color: 'var(--blue)', width: 2, area: true, areaOpacity: 0.10,
        pts: rows.map(r => ({ x: r.year, y: r.macPool })) },
    ],
  });
}

function sufficiencyChart(rows) {
  const maxV = Math.max(...rows.map(r => r.macPool));
  const yMax = Math.ceil(maxV / 1e9 / 0.5) * 0.5e9 + 0.5e9;
  const yTicks = []; for (let v = 0; v <= yMax + 1; v += 0.5e9) yTicks.push(v);
  return lineChart({
    height: 340, padR: 220,
    xDomain: [2026, 2046], yDomain: [0, yMax],
    xTicks: YEAR_TICKS, yTicks, yFmt: v => '$' + (v / 1e9).toFixed(1) + 'B',
    series: [
      { label: 'MAC pool (k)', color: 'var(--ok)', area: true, width: 3, areaOpacity: 0.10,
        pts: rows.map(r => ({ x: r.year, y: r.macPool })) },
      { label: 'Total UBI cost', color: 'var(--warn)', width: 2.5,
        pts: rows.map(r => ({ x: r.year, y: r.ubiCost })) },
    ],
  });
}

function productivityChart(rows) {
  return lineChart({
    height: 280, padR: 200,
    xDomain: [2026, 2046], yDomain: [0, 6],
    xTicks: YEAR_TICKS, yTicks: [0, 1.5, 3, 4.5, 6], yFmt: v => v + '%',
    series: [
      { label: 'Productivity growth', color: 'var(--ok)', width: 3,
        pts: rows.map(r => ({ x: r.year, y: r.prodGrowth })) },
    ],
  });
}

function marginChart(rows) {
  return lineChart({
    height: 280, padR: 230,
    xDomain: [2026, 2046], yDomain: [0, 60],
    xTicks: YEAR_TICKS, yTicks: [0, 15, 30, 45, 60], yFmt: v => v + '%',
    series: [
      { label: 'Gross margin', color: 'var(--ok)', width: 2.5,
        pts: rows.map(r => ({ x: r.year, y: r.grossMargin })) },
      { label: 'Profit share of local activity', color: 'var(--blue)', width: 2.5,
        pts: rows.map(r => ({ x: r.year, y: r.profitShareLocal })) },
    ],
  });
}

function revCostChart(rows) {
  return lineChart({
    height: 280, padR: 210,
    xDomain: [2026, 2046], yDomain: [0, 100],
    xTicks: YEAR_TICKS, yTicks: [0, 25, 50, 75, 100], yFmt: v => v + '',
    series: [
      { label: 'Revenue / unit (price)', color: 'var(--headline)', width: 2.5,
        pts: rows.map(r => ({ x: r.year, y: r.priceIdx })) },
      { label: 'Cost / unit', color: 'var(--warn)', width: 2.5, area: true,
        pts: rows.map(r => ({ x: r.year, y: r.costIdx })) },
    ],
  });
}

// ── Metrics table ────────────────────────────────────────────────────────
function metricsTable(rows) {
  const pick = [0, 5, 10, 15, 20].map(t => rows[t]);
  const body = pick.map(r => {
    const cov = `${Math.round(r.coverage)}%`
      + (r.t === 0 ? ' <span style="color:var(--dim); font-weight:normal;">(early ramp)</span>' : '');
    return `
    <tr>
      <td class="cat">${r.t}</td>
      <td class="num">${r.unemp.toFixed(1)}%</td>
      <td class="num">${fmtUSD(r.basket)}</td>
      <td class="num">${fmtBn(r.pool)}</td>
      <td class="num">${fmtUSD(r.profitPerAdult)}</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(r.macPool)}</td>
      <td class="num">${fmtMoney(r.ubiCost)}</td>
      <td class="num" style="color:var(--ok);"><strong>${cov}</strong></td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup>
      <col style="width:6%;"><col style="width:11%;"><col style="width:13%;"><col style="width:13%;">
      <col style="width:13%;"><col style="width:13%;"><col style="width:12%;"><col style="width:19%;">
    </colgroup>
    <thead><tr>
      <th>Year</th>
      <th class="num">Unemp</th>
      <th class="num">Basket (fam 4)</th>
      <th class="num">Profit pool</th>
      <th class="num">Profit / adult</th>
      <th class="num">MAC pool (k)</th>
      <th class="num">Total UBI cost</th>
      <th class="num">MAC coverage</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

// ── Render ───────────────────────────────────────────────────────────────
function readCfg() {
  const kEl = document.getElementById('k');
  const k = kEl ? parseFloat(kEl.value) : 0.22;
  return { k: isNaN(k) ? 0.22 : k };
}

function render() {
  const cfg = readCfg();
  const kEl = document.getElementById('k'), kOut = document.getElementById('k_v');
  if (kEl && kOut) kOut.textContent = parseFloat(kEl.value).toFixed(2);

  const rows = runModel(cfg);
  const set = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
  set('chart-primary', primaryChart(rows));
  set('chart-sufficiency', sufficiencyChart(rows));
  set('chart-productivity', productivityChart(rows));
  set('chart-margin', marginChart(rows));
  set('chart-revcost', revCostChart(rows));
  set('metrics-table', metricsTable(rows));

  const y0 = rows[0], y20 = rows[20];
  set('headline-stats', [
    ['Profit pool · Y20', fmtBn(y20.pool), 'var(--headline)'],
    ['MAC pool · Y20', fmtMoney(y20.macPool), 'var(--ok)'],
    ['Total UBI cost · Y20', fmtMoney(y20.ubiCost), 'var(--warn)'],
    ['MAC coverage · Y0', Math.round(y0.coverage) + '%', 'var(--ok)'],
    ['MAC coverage · Y20', Math.round(y20.coverage) + '%', 'var(--ok)'],
  ].map(([l, v, c]) => `
    <div class="stat">
      <div class="label">${l}</div>
      <div class="value" style="color:${c};">${v}</div>
    </div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.innerHTML =
      `At k=${cfg.k.toFixed(2)}, MAC coverage strengthens from <strong>${Math.round(y0.coverage)}%</strong> `
      + `in Year 0 to <strong>${Math.round(y20.coverage)}%</strong> by Year 20 as automation expands the `
      + `profit pool. In the earliest displacement years the system may lean on transitional sovereign `
      + `support; by mid-period the MAC is strongly sufficient on its own.`;
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Market Access Charge rate (k)</span>
      <input type="range" id="k" min="0.15" max="0.30" step="0.01" value="0.22">
      <span class="ctrl-val" id="k_v"></span>
    </label>
    <div class="assumptions">
      <span><b>180,000</b> adults</span>
      <span>Profit pool Y0 <b>$2.6B</b> (~$14.4k/adult)</span>
      <span>Productivity <b>2.8% → ~5%</b>/yr (avg ~3.7–4%)</span>
      <span>Deflation → <a href="cost-deflation" style="color:var(--ok);">research Aggregate Basket</a></span>
      <span>UBI ramp <b>$137→$394</b>/mo (Grok V9.13)</span>
    </div>`;
  document.getElementById('k').addEventListener('input', render);
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
