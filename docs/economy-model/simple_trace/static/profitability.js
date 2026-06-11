// /profitability — Corporate Profitability in the Age of AI Abundance.
//
// Fully client-side simulator: all maths run in the browser from the slider
// values, so this page is interactive even on the static publish (no Python
// /api call). Constants below mirror the rest of the model for consistency:
//   - research Aggregate Basket  -> forecasts.py basket_trajectory (cost-deflation page)
//   - unemployment + UBI anchors -> Grok V9.13 (same as colony-v0)
//   - $7,500/yr profit per adult at Y0 -> colony-v0's Grok-implied $1T base.

// ── Reference data (read-only) ───────────────────────────────────────────
// Research Aggregate Basket — consumer price deflation. cost_index, 2026 = 100.
const BASKET = [
  { year: 2026, idx: 100.0 }, { year: 2030, idx: 62.9 }, { year: 2035, idx: 39.2 },
  { year: 2040, idx: 23.1 }, { year: 2045, idx: 15.5 },
];
const BASKET_TODAY_USD = 980;      // today's monthly basket ($), from cost-deflation

// Grok V9.13 national unemployment ramp (%), years 0..20 — matches colony-v0.
const GROK_UNEMP = [
  { y: 0, v: 4.2 }, { y: 5, v: 18 }, { y: 10, v: 35 }, { y: 15, v: 55 }, { y: 20, v: 75 },
];

// Calibration anchors.
const ADULTS = 133e6;              // working-age adults; $1T Y0 profit / $7,500 per adult
const GDP_PER_ADULT_Y0 = 7500 / 0.13;   // so 13% profit share => $7,500/adult/yr at Y0
const GROSS_MARGIN_Y0 = 0.35;      // illustrative starting gross margin for the rev/cost chart
const HORIZON = 20;                // years (2026–2046)

// ── Slider defaults / ranges ─────────────────────────────────────────────
const CONTROLS = [
  { id: 'g',  label: 'Productivity growth / yr', min: 2.0, max: 5.0, step: 0.1, def: 3.7, unit: '%', scale: 0.01 },
  { id: 's0', label: 'Initial profit share of GDP', min: 8, max: 18, step: 0.5, def: 13, unit: '%', scale: 0.01 },
  { id: 'm',  label: 'Margin expansion factor (automation)', min: 0.8, max: 2.2, step: 0.05, def: 1.4, unit: '×', scale: 1 },
  { id: 'k',  label: 'Market Access Charge rate (k)', min: 0.10, max: 0.35, step: 0.01, def: 0.22, unit: '', scale: 1 },
];
const STORAGE_KEY = 'axion_profitability_v1';

// ── Helpers ──────────────────────────────────────────────────────────────
function interpYear(anchors, year, key) {
  if (year <= anchors[0].year) return anchors[0][key];
  if (year >= anchors[anchors.length - 1].year) return anchors[anchors.length - 1][key];
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    if (year >= a.year && year <= b.year) {
      const f = (year - a.year) / (b.year - a.year);
      return a[key] + (b[key] - a[key]) * f;
    }
  }
  return anchors[anchors.length - 1][key];
}
function interpT(anchors, t) {
  if (t <= anchors[0].y) return anchors[0].v;
  if (t >= anchors[anchors.length - 1].y) return anchors[anchors.length - 1].v;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    if (t >= a.y && t <= b.y) return a.v + (b.v - a.v) * (t - a.y) / (b.y - a.y);
  }
  return anchors[anchors.length - 1].v;
}
const basketIdxAt = t => interpYear(BASKET, 2026 + t, 'idx');
const unempAt = t => interpT(GROK_UNEMP, t);

function fmtT(v) { return '$' + (v / 1e12).toFixed(2) + 'T'; }
function fmtB(v) { return '$' + Math.round(v / 1e9).toLocaleString() + 'B'; }
function fmtUSD(v) { return '$' + Math.round(v).toLocaleString(); }
function fmtPct1(v) { return v.toFixed(1) + '%'; }

// ── Model ────────────────────────────────────────────────────────────────
function runModel(cfg) {
  const rows = [];
  const e0 = 1 - GROK_UNEMP[0].v / 100;          // Y0 employed share (0.958)
  for (let t = 0; t <= HORIZON; t++) {
    const prodIdx = Math.pow(1 + cfg.g, t);
    const gdpPerAdult = GDP_PER_ADULT_Y0 * prodIdx;
    // Margin/profit-share expansion: linear ramp from s0 to s0×m over the horizon.
    const profitShare = Math.min(cfg.s0 * (1 + (cfg.m - 1) * (t / HORIZON)), 0.5);
    const potentialPerAdult = gdpPerAdult * profitShare;       // $/yr at full demand

    const e = 1 - unempAt(t) / 100;
    const demandUnchecked = e / e0;        // purchasing power collapses with employment
    const demandMac = 1.0;                 // UBI keeps consumer demand whole

    const profitUnchecked = potentialPerAdult * demandUnchecked;
    const profitMac = potentialPerAdult * demandMac;
    const macPoolPerAdult = cfg.k * profitMac;                 // $/yr
    const ubiPerAdultMo = macPoolPerAdult / 12;                // MAC funds UBI

    // Illustrative gross margin for the revenue-vs-cost view.
    const grossMargin = Math.min(GROSS_MARGIN_Y0 * (1 + (cfg.m - 1) * (t / HORIZON)), 0.85);
    const priceIdx = basketIdxAt(t);                           // revenue / unit
    const costIdx = priceIdx * (1 - grossMargin);              // cost / unit

    rows.push({
      t, year: 2026 + t,
      unemployment: unempAt(t),
      basketCostMo: BASKET_TODAY_USD * basketIdxAt(t) / 100,
      profitShare, grossMargin, priceIdx, costIdx,
      potentialPerAdult,
      profitUncheckedPerAdult: profitUnchecked,
      profitMacPerAdult: profitMac,
      macPoolPerAdult, ubiPerAdultMo,
      poolUnchecked: profitUnchecked * ADULTS,
      poolMac: profitMac * ADULTS,
      macPoolTotal: macPoolPerAdult * ADULTS,
    });
  }
  return rows;
}

// ── Generic SVG line chart ───────────────────────────────────────────────
// series: [{ label, color, pts:[{x,y}], dashed, area }]
function lineChart(opts) {
  const W = opts.width || 1280, H = opts.height || 320;
  const PAD = { l: 78, r: opts.padR || 210, t: 26, b: 42 };
  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const [x0, x1] = opts.xDomain, [y0, y1] = opts.yDomain;
  const xPx = x => PAD.l + plotW * (x - x0) / (x1 - x0);
  const yPx = y => PAD.t + plotH * (1 - (y - y0) / (y1 - y0));

  const yTicks = opts.yTicks || [];
  const grid = yTicks.map(t => `
    <line x1="${PAD.l}" y1="${yPx(t)}" x2="${PAD.l + plotW}" y2="${yPx(t)}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="2 3"/>
    <text x="${PAD.l - 8}" y="${yPx(t) + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${opts.yFmt ? opts.yFmt(t) : t}</text>
  `).join('');
  const xTicks = opts.xTicks || [];
  const xLabels = xTicks.map(x => `<text x="${xPx(x)}" y="${H - PAD.b + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${opts.xFmt ? opts.xFmt(x) : x}</text>`).join('');

  const areas = opts.series.filter(s => s.area).map(s => {
    const top = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPx(p.x).toFixed(1)} ${yPx(p.y).toFixed(1)}`).join(' ');
    const base = `L ${xPx(s.pts[s.pts.length - 1].x).toFixed(1)} ${yPx(y0).toFixed(1)} L ${xPx(s.pts[0].x).toFixed(1)} ${yPx(y0).toFixed(1)} Z`;
    return `<path d="${top} ${base}" fill="${s.color}" fill-opacity="0.08" stroke="none"/>`;
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

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">
    ${grid}${xLabels}${areas}${paths}${labelEls}</svg>`;
}

const yearTicks = [2026, 2031, 2036, 2041, 2046];
const xFmtYear = x => x;

function primaryChart(rows) {
  const maxPool = Math.max(...rows.map(r => Math.max(r.poolUnchecked, r.poolMac)));
  const yMax = Math.ceil(maxPool / 1e12 / 0.5) * 0.5e12 + 0.5e12;
  const yTicks = [];
  for (let v = 0; v <= yMax + 1; v += 0.5e12) yTicks.push(v);
  return lineChart({
    height: 380,
    xDomain: [2026, 2046], yDomain: [0, yMax],
    xTicks: yearTicks, xFmt: xFmtYear,
    yTicks, yFmt: v => '$' + (v / 1e12).toFixed(1) + 'T',
    series: [
      { label: 'With MAC + UBI loop', color: 'var(--ok)', area: true, width: 3,
        pts: rows.map(r => ({ x: r.year, y: r.poolMac })) },
      { label: 'Unchecked capital capture', color: 'var(--crit)', width: 2.5, dashed: true,
        pts: rows.map(r => ({ x: r.year, y: r.poolUnchecked })) },
    ],
  });
}

function marginChart(rows) {
  return lineChart({
    height: 280, padR: 230,
    xDomain: [2026, 2046], yDomain: [0, 60],
    xTicks: yearTicks, xFmt: xFmtYear,
    yTicks: [0, 15, 30, 45, 60], yFmt: v => v + '%',
    series: [
      { label: 'Gross margin', color: 'var(--ok)', width: 2.5,
        pts: rows.map(r => ({ x: r.year, y: r.grossMargin * 100 })) },
      { label: 'Profit share of GDP', color: 'var(--blue)', width: 2.5,
        pts: rows.map(r => ({ x: r.year, y: r.profitShare * 100 })) },
    ],
  });
}

function revCostChart(rows) {
  return lineChart({
    height: 280, padR: 210,
    xDomain: [2026, 2046], yDomain: [0, 100],
    xTicks: yearTicks, xFmt: xFmtYear,
    yTicks: [0, 25, 50, 75, 100], yFmt: v => v + '',
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
  const body = pick.map(r => `
    <tr>
      <td class="cat" style="vertical-align:top;">${r.t}</td>
      <td class="num">${fmtPct1(r.unemployment)}</td>
      <td class="num">${fmtUSD(r.basketCostMo)}</td>
      <td class="num">${fmtT(r.poolMac)}</td>
      <td class="num">${fmtUSD(r.profitMacPerAdult)}</td>
      <td class="num">${fmtB(r.macPoolTotal)}</td>
      <td class="num" style="color:var(--ok);">${fmtUSD(r.ubiPerAdultMo)}</td>
    </tr>`).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup>
      <col style="width:8%;"><col style="width:14%;"><col style="width:16%;">
      <col style="width:17%;"><col style="width:15%;"><col style="width:15%;"><col style="width:15%;">
    </colgroup>
    <thead><tr>
      <th>Year</th>
      <th class="num">Unemployment</th>
      <th class="num">Basket / mo</th>
      <th class="num">Profit pool</th>
      <th class="num">Profit / adult / yr</th>
      <th class="num">MAC pool (k)</th>
      <th class="num">UBI / adult / mo</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

// ── Render ───────────────────────────────────────────────────────────────
function readCfg() {
  const cfg = {};
  for (const c of CONTROLS) {
    const el = document.getElementById(c.id);
    const raw = el ? parseFloat(el.value) : c.def;
    cfg[c.id] = (isNaN(raw) ? c.def : raw) * c.scale;
  }
  return cfg;
}

function render() {
  const cfg = readCfg();
  // reflect live slider values
  for (const c of CONTROLS) {
    const out = document.getElementById(c.id + '_v');
    const el = document.getElementById(c.id);
    if (out && el) out.textContent = parseFloat(el.value).toFixed(c.step < 0.1 ? 2 : 1) + (c.unit || '');
  }
  const rows = runModel(cfg);
  const set = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
  set('chart-primary', primaryChart(rows));
  set('chart-margin', marginChart(rows));
  set('chart-revcost', revCostChart(rows));
  set('metrics-table', metricsTable(rows));

  const y20 = rows[20];
  set('headline-stats', [
    ['Profit pool · Y20 (MAC loop)', fmtT(y20.poolMac), 'var(--ok)'],
    ['MAC pool · Y20', fmtB(y20.macPoolTotal), 'var(--blue)'],
    ['UBI / adult / mo · Y20', fmtUSD(y20.ubiPerAdultMo), 'var(--ok)'],
    ['Unchecked pool · Y20', fmtT(y20.poolUnchecked), 'var(--crit)'],
  ].map(([l, v, c]) => `
    <div class="stat">
      <div class="label">${l}</div>
      <div class="value" style="color:${c};">${v}</div>
    </div>`).join(''));

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = CONTROLS.map(c => `
    <label class="ctrl">
      <span class="ctrl-label">${c.label}</span>
      <input type="range" id="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.def}">
      <span class="ctrl-val" id="${c.id}_v"></span>
    </label>
  `).join('') + `
    <label class="ctrl ctrl-ref">
      <span class="ctrl-label">Deflation source</span>
      <span style="font-size:11px; color:var(--txt2);">Research Aggregate Basket →
        <a href="cost-deflation" style="color:var(--ok);">cost-deflation</a> (read-only)</span>
    </label>`;
  for (const c of CONTROLS) {
    const el = document.getElementById(c.id);
    el.addEventListener('input', render);
  }
}

function init() {
  buildControls();
  render();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
