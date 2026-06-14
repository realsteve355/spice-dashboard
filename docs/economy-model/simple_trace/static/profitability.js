// /profitability — MaryFontaine & Islara Abundance Model (v9.16).
//
// Targeted Market Access Charge based on profit-per-employee, funding a phased
// transition from means-tested support to full UBI. Fully client-side (no /api)
// so the page stays interactive on the static publish. County scale 180k adults.
// All figures real (today's prices).
//
// Per-firm charge:  MAC_i = profit_i × rate_i
//   rate_i = min(RATE_CAP, k × (profit_i / employees_i) / REF_PPE)
// k is the economy-wide average rate (profit-weighted); automated firms (high
// profit per employee) pay a larger share, labour-intensive firms pay little.

const ADULTS = 180000;
const HORIZON = 20;
const INFLECTION = 8;            // year means-tested support -> full universal UBI
const REF_PPE = 200000;         // profit/employee mapping to the average rate
const RATE_CAP = 0.50;          // max share of profit any firm pays

// Anchor trajectories {y: year-from-2026, v: value}.
const UNEMP  = [{ y: 0, v: 4.2 }, { y: 5, v: 18 }, { y: 8, v: 28 }, { y: 10, v: 35 }, { y: 15, v: 55 }, { y: 20, v: 75 }];          // %
const BASKET = [{ y: 0, v: 980 }, { y: 5, v: 850 }, { y: 8, v: 760 }, { y: 10, v: 700 }, { y: 15, v: 520 }, { y: 20, v: 380 }];   // family of 4, $/mo
const POOL   = [{ y: 0, v: 2.6e9 }, { y: 5, v: 4.1e9 }, { y: 8, v: 5.227e9 }, { y: 10, v: 6.2e9 }, { y: 15, v: 9.1e9 }, { y: 20, v: 13.2e9 }]; // attributable profit pool, real $
const UBI_MEANS = [{ y: 0, v: 180 }, { y: 5, v: 280 }, { y: 8, v: 300 }];      // Phase 1: means-tested $/recipient/mo
const UBI_FULL  = [{ y: 8, v: 260 }, { y: 10, v: 298 }, { y: 15, v: 355 }, { y: 20, v: 394 }]; // Phase 2: full universal UBI $/adult/mo

// Company-type examples (Year 15-20). Charges computed from the formula.
const COMPANIES = [
  { type: 'Bespoke handmade furniture', profit: 1.2e6, emp: 35 },
  { type: 'Local café / restaurant', profit: 180e3, emp: 18 },
  { type: 'Automated warehouse / logistics', profit: 18e6, emp: 80 },
  { type: 'Lights-out manufacturing plant', profit: 45e6, emp: 45 },
  { type: 'Amazon MaryFontaine (national share)', profit: 280e6, emp: 1400 },
];

// Year-20 moderate basket breakdown (family of 4, $/mo Mond).
const BASKET_BREAKDOWN = [
  { cat: 'Housing', lo: 180, hi: 280 },
  { cat: 'Food & groceries', lo: 95, hi: 135 },
  { cat: 'Transport', lo: 35, hi: 55 },
  { cat: 'Healthcare', lo: 45, hi: 70 },
  { cat: 'Clothing & personal', lo: 30, hi: 45 },
  { cat: 'Education / misc', lo: 90, hi: 145 },
];

const STORAGE_KEY = 'axion_profitability_v5';

// ── Helpers ──────────────────────────────────────────────────────────────
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
function fmtMoney(v) {
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e5) return '$' + Math.round(v / 1e3) + 'k';
  return '$' + Math.round(v).toLocaleString();
}
function fmtUSD(v) { return '$' + Math.round(v).toLocaleString(); }
function macRate(profit, emp, k) { return Math.min(RATE_CAP, k * (profit / emp) / REF_PPE); }

// ── Model ────────────────────────────────────────────────────────────────
function runModel(cfg) {
  const rows = [];
  const e0 = 1 - UNEMP[0].v / 100;
  for (let t = 0; t <= HORIZON; t++) {
    const unemp = interpYV(UNEMP, t);
    const basket = interpYV(BASKET, t);
    const pool = interpYV(POOL, t);
    const phase = t < INFLECTION ? 1 : 2;
    const ubiMo = phase === 1 ? interpYV(UBI_MEANS, t) : interpYV(UBI_FULL, t);

    const profitPerAdult = pool / ADULTS;
    const macPool = cfg.k * pool;
    // Full universal UBI cost only applies once Phase 2 begins.
    const ubiCostFull = phase === 2 ? interpYV(UBI_FULL, t) * 12 * ADULTS : null;
    const coverage = ubiCostFull ? macPool / ubiCostFull * 100 : null;
    const ubiFamily = phase === 2 ? ubiMo * 2 : null;

    const e = 1 - unemp / 100;
    const poolUnchecked = pool * (e / e0);

    rows.push({
      t, year: 2026 + t, unemp, basket, pool, phase, ubiMo, ubiFamily,
      profitPerAdult, macPool, ubiCostFull, coverage, poolUnchecked,
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
  const vlines = (opts.vlines || []).map(vl => `
    <line x1="${xPx(vl.x)}" y1="${PAD.t}" x2="${xPx(vl.x)}" y2="${PAD.t + plotH}" stroke="var(--dim)" stroke-width="0.75" stroke-dasharray="3 3"/>
    <text x="${xPx(vl.x) + 5}" y="${PAD.t + 11}" fill="var(--dim)" font-size="9" font-family="var(--mono)">${vl.label}</text>
  `).join('');

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

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">${grid}${vlines}${xLabels}${areas}${paths}${labelEls}</svg>`;
}

const YEAR_TICKS = [2026, 2031, 2034, 2036, 2041, 2046];
const yB = v => '$' + (v / 1e9).toFixed(0) + 'B';
const PHASE_VLINE = { x: 2026 + INFLECTION, label: 'Phase 2 — full UBI →' };

function primaryChart(rows) {
  return lineChart({
    height: 380, xDomain: [2026, 2046], yDomain: [0, 14e9],
    xTicks: YEAR_TICKS, yTicks: [0, 2e9, 4e9, 6e9, 8e9, 10e9, 12e9, 14e9], yFmt: yB,
    vlines: [PHASE_VLINE],
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
    height: 340, padR: 230, xDomain: [2026, 2046], yDomain: [0, yMax],
    xTicks: YEAR_TICKS, yTicks, yFmt: v => '$' + (v / 1e9).toFixed(1) + 'B',
    vlines: [PHASE_VLINE],
    series: [
      { label: 'MAC pool (k)', color: 'var(--ok)', area: true, width: 3, areaOpacity: 0.10,
        pts: rows.map(r => ({ x: r.year, y: r.macPool })) },
      { label: 'Full UBI cost (Phase 2)', color: 'var(--warn)', width: 2.5,
        pts: rows.filter(r => r.phase === 2).map(r => ({ x: r.year, y: r.ubiCostFull })) },
    ],
  });
}

// ── Tables ───────────────────────────────────────────────────────────────
function companyTable(k) {
  const body = COMPANIES.map(c => {
    const ppe = c.profit / c.emp;
    const rate = macRate(c.profit, c.emp, k);
    const charge = c.profit * rate;
    const capped = rate >= RATE_CAP - 1e-9;
    return `
    <tr>
      <td class="cat" style="white-space:normal;">${c.type}</td>
      <td class="num">${fmtMoney(c.profit)}</td>
      <td class="num">${c.emp.toLocaleString()}</td>
      <td class="num">${fmtUSD(ppe)}</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(charge)}</td>
      <td class="num" style="color:var(--ok);"><strong>${(rate * 100).toFixed(1)}%${capped ? ' <span style="color:var(--dim); font-weight:normal;">(cap)</span>' : ''}</strong></td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:30%;"><col style="width:13%;"><col style="width:11%;"><col style="width:15%;"><col style="width:15%;"><col style="width:16%;"></colgroup>
    <thead><tr>
      <th>Company type</th>
      <th class="num">Annual profit</th>
      <th class="num">Employees</th>
      <th class="num">Profit / emp</th>
      <th class="num">MAC charge</th>
      <th class="num">% of profit</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

function rampTable(rows) {
  const pick = [0, 5, 8, 10, 15, 20].map(t => rows[t]);
  const body = pick.map(r => {
    const phaseLabel = r.t < INFLECTION ? 'Phase 1' : (r.t === INFLECTION ? 'Inflection' : 'Phase 2');
    const ubiCell = r.phase === 1
      ? `${fmtUSD(r.ubiMo)} <span style="color:var(--dim);">MT</span>`
      : `${fmtUSD(r.ubiMo)}`;
    const fam = r.ubiFamily ? fmtUSD(r.ubiFamily) : '—';
    const cov = r.coverage == null
      ? '<span style="color:var(--dim);">N/A</span>'
      : `<strong style="color:var(--ok);">${Math.round(r.coverage)}%</strong>`;
    return `
    <tr>
      <td class="cat">${r.t}</td>
      <td class="num">${r.unemp.toFixed(1)}%</td>
      <td class="num">${fmtUSD(r.basket)}</td>
      <td>${phaseLabel}</td>
      <td class="num">${ubiCell}</td>
      <td class="num">${fam}</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(r.macPool)}</td>
      <td class="num">${cov}</td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:6%;"><col style="width:11%;"><col style="width:12%;"><col style="width:13%;"><col style="width:16%;"><col style="width:14%;"><col style="width:14%;"><col style="width:14%;"></colgroup>
    <thead><tr>
      <th>Year</th>
      <th class="num">Unemp</th>
      <th class="num">Basket (fam 4)</th>
      <th>Phase</th>
      <th class="num">UBI / adult / mo</th>
      <th class="num">UBI / fam 4 / mo</th>
      <th class="num">MAC pool</th>
      <th class="num">MAC coverage</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

function basketBreakdown() {
  const loTot = BASKET_BREAKDOWN.reduce((s, b) => s + b.lo, 0);
  const hiTot = BASKET_BREAKDOWN.reduce((s, b) => s + b.hi, 0);
  const rows = BASKET_BREAKDOWN.map(b => `
    <tr><td class="cat">${b.cat}</td><td class="num">$${b.lo}–${b.hi}</td></tr>`).join('');
  return `
  <table style="table-layout:fixed; width:100%; max-width:460px;">
    <colgroup><col style="width:62%;"><col style="width:38%;"></colgroup>
    <thead><tr><th>Category</th><th class="num">Mond / mo</th></tr></thead>
    <tbody>
      ${rows}
      <tr><td class="cat" style="color:var(--dim);">Utilities &amp; infrastructure</td><td class="num" style="color:var(--dim);">in Colony Bill</td></tr>
      <tr style="border-top:1px solid var(--line-hot);"><td class="cat"><strong>Total</strong></td><td class="num"><strong style="color:var(--headline);">$${loTot}–${hiTot}</strong></td></tr>
    </tbody>
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
  set('company-table', companyTable(cfg.k));
  set('ramp-table', rampTable(rows));
  set('basket-breakdown', basketBreakdown());

  const y20 = rows[20], inflect = rows[INFLECTION];
  set('headline-stats', [
    ['Profit pool · Y20', fmtBn(y20.pool), 'var(--headline)'],
    ['MAC pool · Y20', fmtMoney(y20.macPool), 'var(--ok)'],
    ['Full UBI · fam 4 · Y20', fmtUSD(y20.ubiFamily) + '/mo', 'var(--ok)'],
    ['MAC coverage · Y20', Math.round(y20.coverage) + '%', 'var(--ok)'],
    ['Full UBI begins', 'Year ' + INFLECTION + ' · ' + Math.round(inflect.coverage) + '%', 'var(--blue)'],
  ].map(([l, v, c]) => `
    <div class="stat">
      <div class="label">${l}</div>
      <div class="value" style="color:${c};">${v}</div>
    </div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.innerHTML =
      `Phase 1 (Years 0–${INFLECTION - 1}) runs means-tested support during the steep displacement ramp. `
      + `Full universal UBI begins at the Year-${INFLECTION} inflection (~28% unemployment), where the MAC `
      + `pool already covers <strong>${Math.round(inflect.coverage)}%</strong> of its cost. At k=${cfg.k.toFixed(2)} `
      + `coverage then climbs to <strong>${Math.round(y20.coverage)}%</strong> by Year 20 — the charge funds `
      + `UBI with widening headroom as automation expands the profit pool.`;
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Market Access Charge rate (k) — economy-wide average</span>
      <input type="range" id="k" min="0.15" max="0.30" step="0.01" value="0.22">
      <span class="ctrl-val" id="k_v"></span>
    </label>
    <div class="assumptions">
      <span><b>180,000</b> adults</span>
      <span>Charge rate per firm = min(<b>50%</b>, k × profit-per-emp / <b>$200k</b>)</span>
      <span>Profit pool Y0 <b>$2.6B</b> (~$14.4k/adult)</span>
      <span>Full UBI from <b>Year ${INFLECTION}</b> (inflection)</span>
      <span>Deflation → <a href="cost-deflation" style="color:var(--ok);">research Aggregate Basket</a></span>
    </div>`;
  document.getElementById('k').addEventListener('input', render);
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
