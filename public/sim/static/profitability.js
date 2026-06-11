// /profitability — Corporate Profitability in the Age of AI Abundance.
//
// MaryFontaine county scale (~180,000 adults). Fully client-side: all maths run
// in the browser, so the page stays interactive on the static publish (no /api).
//
// Per the spec, every trajectory below is a FIXED research-based anchor set;
// the MAC rate k is the only adjustable input (sensitivity on sufficiency).
// All figures are real (today's prices). Anchors at years 0,5,10,15,20:
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
  grossMargin:[35, 42, 50, 54, 56],                        // % — research-derived, accel then moderate
};
const LEA_Y0 = 2.6e9 / 0.18;     // local economic activity base: pool0 is ~18% of it
const PROD_G = 0.037;            // productivity growth / yr (fixed)
const HORIZON = 20;

const CONTROLS = [
  { id: 'k', label: 'Market Access Charge rate (k)', min: 0.15, max: 0.30, step: 0.01, def: 0.22 },
];
const STORAGE_KEY = 'axion_profitability_v2';

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
function fmtBn(v) { return '$' + (v / 1e9).toFixed(2) + 'B'; }
function fmtMoney(v) { return v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : '$' + Math.round(v / 1e6) + 'M'; }
function fmtUSD(v) { return '$' + Math.round(v).toLocaleString(); }

function sufficiency(cov) {
  if (cov >= 300) return { label: 'Strongly sufficient', color: 'var(--ok)' };
  if (cov >= 100) return { label: 'Sufficient', color: 'var(--ok)' };
  return { label: 'Insufficient', color: 'var(--crit)' };
}

// ── Model ────────────────────────────────────────────────────────────────
function runModel(cfg) {
  const rows = [];
  const e0 = 1 - A.unemp[0] / 100;
  for (let t = 0; t <= HORIZON; t++) {
    const unemp = interpA(A.unemp, t);
    const basket = interpA(A.basket, t);
    const pool = interpA(A.pool, t);                  // sustained (MAC+UBI) profit pool
    const ubiMo = interpA(A.ubiAdultMo, t);
    const grossMargin = interpA(A.grossMargin, t) / 100;

    const profitPerAdult = pool / ADULTS;             // $/yr
    const macPool = cfg.k * pool;                     // real $
    const ubiCost = ubiMo * 12 * ADULTS;              // real $/yr, universal
    const coverage = macPool / ubiCost * 100;         // %

    // Unchecked capital capture: without recycling, demand erodes with
    // employment, so realised profit stalls then declines (Henry Ford).
    const e = 1 - unemp / 100;
    const poolUnchecked = pool * (e / e0);

    const priceIdx = basket / A.basket[0] * 100;      // 2026 = 100
    const costIdx = priceIdx * (1 - grossMargin);
    const lea = LEA_Y0 * Math.pow(1 + PROD_G, t);
    const profitShareLocal = pool / lea * 100;

    rows.push({
      t, year: 2026 + t, unemp, basket, pool, ubiMo,
      profitPerAdult, macPool, ubiCost, coverage, poolUnchecked,
      grossMargin: grossMargin * 100, priceIdx, costIdx, profitShareLocal,
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
    labels.push({ label: s.label, color: s.color, desiredY: yPx(last.y), endX: xPx(last.x) });
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
      { label: 'UBI cost (180k adults)', color: 'var(--warn)', width: 2.5,
        pts: rows.map(r => ({ x: r.year, y: r.ubiCost })) },
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
    const suf = sufficiency(r.coverage);
    return `
    <tr>
      <td class="cat">${r.t}</td>
      <td class="num">${r.unemp.toFixed(1)}%</td>
      <td class="num">${fmtUSD(r.basket)}</td>
      <td class="num">${fmtBn(r.pool)}</td>
      <td class="num">${fmtUSD(r.profitPerAdult)}</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(r.macPool)}</td>
      <td class="num">${fmtMoney(r.ubiCost)}</td>
      <td class="num" style="color:var(--ok);"><strong>${Math.round(r.coverage)}%</strong></td>
      <td style="color:${suf.color}; font-size:11px;">${suf.label}</td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup>
      <col style="width:6%;"><col style="width:11%;"><col style="width:11%;"><col style="width:12%;">
      <col style="width:12%;"><col style="width:12%;"><col style="width:11%;"><col style="width:10%;"><col style="width:15%;">
    </colgroup>
    <thead><tr>
      <th>Year</th>
      <th class="num">Unemp</th>
      <th class="num">Basket (fam 4)</th>
      <th class="num">Profit pool</th>
      <th class="num">Profit / adult</th>
      <th class="num">MAC pool (k)</th>
      <th class="num">UBI cost</th>
      <th class="num">MAC coverage</th>
      <th>Sufficiency</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

// ── Render ───────────────────────────────────────────────────────────────
function readCfg() {
  const el = document.getElementById('k');
  const k = el ? parseFloat(el.value) : CONTROLS[0].def;
  return { k: isNaN(k) ? CONTROLS[0].def : k };
}

function render() {
  const cfg = readCfg();
  const kEl = document.getElementById('k'), kOut = document.getElementById('k_v');
  if (kEl && kOut) kOut.textContent = parseFloat(kEl.value).toFixed(2);

  const rows = runModel(cfg);
  const set = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
  set('chart-primary', primaryChart(rows));
  set('chart-sufficiency', sufficiencyChart(rows));
  set('chart-margin', marginChart(rows));
  set('chart-revcost', revCostChart(rows));
  set('metrics-table', metricsTable(rows));

  const y0 = rows[0], y20 = rows[20];
  const minCov = Math.min(...rows.map(r => r.coverage));
  set('headline-stats', [
    ['Profit pool · Y20', fmtBn(y20.pool), 'var(--headline)'],
    ['MAC pool · Y20', fmtMoney(y20.macPool), 'var(--ok)'],
    ['UBI cost · Y20', fmtMoney(y20.ubiCost), 'var(--warn)'],
    ['MAC coverage · Y20', Math.round(y20.coverage) + '%', 'var(--ok)'],
    ['Lowest coverage (k=' + cfg.k.toFixed(2) + ')', Math.round(minCov) + '%', minCov >= 100 ? 'var(--ok)' : 'var(--crit)'],
  ].map(([l, v, c]) => `
    <div class="stat">
      <div class="label">${l}</div>
      <div class="value" style="color:${c};">${v}</div>
    </div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    const ok = minCov >= 100;
    verdict.style.borderLeftColor = ok ? 'var(--ok)' : 'var(--crit)';
    verdict.innerHTML = ok
      ? `At k=${cfg.k.toFixed(2)}, the MAC pool fully funds UBI at every point in the 20-year ramp — `
        + `coverage never drops below <strong>${Math.round(minCov)}%</strong> and grows to `
        + `<strong>${Math.round(y20.coverage)}%</strong> by Year 20.`
      : `At k=${cfg.k.toFixed(2)}, the MAC pool falls short of UBI — coverage dips to `
        + `<strong style="color:var(--crit);">${Math.round(minCov)}%</strong>. Raise k to restore sufficiency.`;
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  const c = CONTROLS[0];
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">${c.label}</span>
      <input type="range" id="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.def}">
      <span class="ctrl-val" id="${c.id}_v"></span>
    </label>
    <div class="assumptions">
      <span><b>180,000</b> adults</span>
      <span>Profit pool Y0 <b>$2.6B</b> (~$14.4k/adult)</span>
      <span>Productivity <b>+3.7%/yr</b></span>
      <span>Deflation → <a href="cost-deflation" style="color:var(--ok);">research Aggregate Basket</a></span>
      <span>UBI ramp <b>$137→$394</b>/mo (Grok V9.13)</span>
    </div>`;
  document.getElementById('k').addEventListener('input', render);
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
