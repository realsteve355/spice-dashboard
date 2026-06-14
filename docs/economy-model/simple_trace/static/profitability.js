// /profitability — MaryFontaine: a targeted Market Access Charge on
// profit-per-employee. Fully client-side (no /api) so the page stays
// interactive on the static publish.
//
// Per-firm charge:  MAC_i = profit_i × rate_i
//   rate_i = min(RATE_CAP, k × BASE_RATE × (profit_i / employees_i) / REF_PPE)
// k is a multiplier (a constant, usually 1.0); BASE_RATE (22%) is the charge at
// the $200k/employee reference. Automated firms (high profit per employee) pay a
// larger share; labour-intensive firms pay little. The county MAC pool is summed
// bottom-up across the business mix; this page also shows how individual company
// profits diverge over 20 years as automation advances.

const REF_PPE = 200000;         // profit/employee reference (maps to the base rate)
const BASE_RATE = 0.22;         // charge rate at the reference when k = 1
const RATE_CAP = 0.50;          // max share of profit any firm pays
const HORIZON = 20;             // years (2026–2046)

// Company-type examples, with automation-driven real profit growth per year.
const COMPANIES = [
  { type: 'Bespoke handmade furniture', short: 'Bespoke furniture', profit: 1.2e6, emp: 35, growth: 0.020, auto: 'craft / low automation', color: '#7aa2ff' },
  { type: 'Local café / restaurant', short: 'Café / restaurant', profit: 180e3, emp: 18, growth: 0.015, auto: 'human-centric', color: '#8b93a0' },
  { type: 'Automated warehouse / logistics', short: 'Warehouse / logistics', profit: 18e6, emp: 80, growth: 0.090, auto: 'highly automated', color: '#cfa340' },
  { type: 'Lights-out manufacturing plant', short: 'Lights-out plant', profit: 45e6, emp: 45, growth: 0.110, auto: 'fully automated', color: '#ef4444' },
  { type: 'Amazon MaryFontaine (national share)', short: 'Amazon (national)', profit: 280e6, emp: 1400, growth: 0.070, auto: 'highly automated', color: '#7eb24f' },
];

// MaryFontaine's business population (Year 0). Summing each sector's targeted
// charge gives the county MAC pool bottom-up; the profit-weighted average works
// out to ~22% at k=1 (the base charge), which calibrates the headline.
// [sector, firm count, profit per firm, employees per firm]
const MARYFONTAINE = [
  { sector: 'Cafés & restaurants', count: 340, profitPerFirm: 45e3, empPerFirm: 14 },
  { sector: 'Retail & local services', count: 440, profitPerFirm: 70e3, empPerFirm: 9 },
  { sector: 'Trades & construction', count: 500, profitPerFirm: 90e3, empPerFirm: 7 },
  { sector: 'Professional & financial', count: 230, profitPerFirm: 250e3, empPerFirm: 11 },
  { sector: 'Healthcare & clinics', count: 165, profitPerFirm: 350e3, empPerFirm: 16 },
  { sector: 'Education & childcare', count: 110, profitPerFirm: 60e3, empPerFirm: 22 },
  { sector: 'Local manufacturing & workshops', count: 75, profitPerFirm: 600e3, empPerFirm: 28 },
  { sector: 'Regional automated logistics', count: 14, profitPerFirm: 18e6, empPerFirm: 90 },
  { sector: 'Attributed national retail share', count: 1, profitPerFirm: 800e6, empPerFirm: 3850 },
  { sector: 'Attributed manufacturing & energy', count: 1, profitPerFirm: 600e6, empPerFirm: 2680 },
  { sector: 'Attributed tech & platforms', count: 1, profitPerFirm: 690e6, empPerFirm: 2950 },
];

const STORAGE_KEY = 'axion_profitability_v6';

// ── Helpers ──────────────────────────────────────────────────────────────
function fmtBn(v) { return '$' + (v / 1e9).toFixed(2) + 'B'; }
function fmtMoney(v) {
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e5) return '$' + Math.round(v / 1e3) + 'k';
  return '$' + Math.round(v).toLocaleString();
}
function fmtUSD(v) { return '$' + Math.round(v).toLocaleString(); }
// k is a multiplier (usually 1.0); base charge is BASE_RATE at the reference.
function macRate(profit, emp, k) { return Math.min(RATE_CAP, k * BASE_RATE * (profit / emp) / REF_PPE); }

// Bottom-up county totals at multiplier k: each sector pays profit × its rate.
function compositionStats(k) {
  let totalProfit = 0, totalEmp = 0, totalMAC = 0;
  const rows = MARYFONTAINE.map(s => {
    const profit = s.count * s.profitPerFirm;
    const emp = s.count * s.empPerFirm;
    const ppe = profit / emp;
    const rate = macRate(profit, emp, k);
    const mac = profit * rate;
    totalProfit += profit; totalEmp += emp; totalMAC += mac;
    return { sector: s.sector, count: s.count, profit, emp, ppe, rate, mac };
  });
  return { rows, totalProfit, totalEmp, totalMAC, effRate: totalMAC / totalProfit };
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

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">${grid}${xLabels}${paths}${labelEls}</svg>`;
}

// Profit growth by company type, indexed to 100 at 2026.
function profitGrowthChart() {
  return lineChart({
    height: 360, padR: 200, xDomain: [2026, 2046], yDomain: [0, 850],
    xTicks: [2026, 2031, 2036, 2041, 2046], yTicks: [0, 200, 400, 600, 800], yFmt: v => v,
    series: COMPANIES.map(c => ({
      label: `${c.short} (${(c.growth * 100).toFixed(1)}%/yr)`,
      color: c.color, width: c.growth >= 0.05 ? 2.8 : 2,
      pts: Array.from({ length: HORIZON + 1 }, (_, t) => ({ x: 2026 + t, y: Math.pow(1 + c.growth, t) * 100 })),
    })),
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

function compositionTable(k) {
  const st = compositionStats(k);
  const body = st.rows.map(r => `
    <tr>
      <td class="cat" style="white-space:normal;">${r.sector}</td>
      <td class="num">${r.count.toLocaleString()}</td>
      <td class="num">${fmtMoney(r.profit)}</td>
      <td class="num">${Math.round(r.emp).toLocaleString()}</td>
      <td class="num">${fmtUSD(r.ppe)}</td>
      <td class="num">${(r.rate * 100).toFixed(1)}%</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(r.mac)}</td>
    </tr>`).join('');
  const avgPpe = st.totalProfit / st.totalEmp;
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:28%;"><col style="width:9%;"><col style="width:14%;"><col style="width:13%;"><col style="width:13%;"><col style="width:10%;"><col style="width:13%;"></colgroup>
    <thead><tr>
      <th>Sector</th>
      <th class="num">Firms</th>
      <th class="num">Total profit</th>
      <th class="num">Employees</th>
      <th class="num">Profit / emp</th>
      <th class="num">Rate</th>
      <th class="num">MAC</th>
    </tr></thead>
    <tbody>${body}
      <tr style="border-top:1px solid var(--line-hot);">
        <td class="cat"><strong>MaryFontaine total</strong></td>
        <td class="num"><strong>${st.rows.reduce((s, r) => s + r.count, 0).toLocaleString()}</strong></td>
        <td class="num"><strong style="color:var(--headline);">${fmtBn(st.totalProfit)}</strong></td>
        <td class="num"><strong>${Math.round(st.totalEmp).toLocaleString()}</strong></td>
        <td class="num"><strong>${fmtUSD(avgPpe)}</strong></td>
        <td class="num"><strong>${(st.effRate * 100).toFixed(1)}%</strong></td>
        <td class="num"><strong style="color:var(--ok);">${fmtMoney(st.totalMAC)}</strong></td>
      </tr>
    </tbody>
  </table>`;
}

// ── Render ───────────────────────────────────────────────────────────────
function readCfg() {
  const kEl = document.getElementById('k');
  const k = kEl ? parseFloat(kEl.value) : 1.0;
  return { k: isNaN(k) ? 1.0 : k };
}

function render() {
  const cfg = readCfg();
  const kEl = document.getElementById('k'), kOut = document.getElementById('k_v');
  if (kEl && kOut) kOut.textContent = '×' + parseFloat(kEl.value).toFixed(2);

  const set = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
  set('company-table', companyTable(cfg.k));
  set('composition-table', compositionTable(cfg.k));
  set('chart-profit-growth', profitGrowthChart());

  const st = compositionStats(cfg.k);
  set('headline-stats', [
    ['Total profit pool', fmtBn(st.totalProfit), 'var(--headline)'],
    ['MAC pool (from business mix)', fmtMoney(st.totalMAC), 'var(--ok)'],
    ['Effective MAC rate (% of total profit)', (st.effRate * 100).toFixed(1) + '%', 'var(--blue)'],
  ].map(([l, v, c]) => `
    <div class="stat">
      <div class="label">${l}</div>
      <div class="value" style="color:${c};">${v}</div>
    </div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.innerHTML =
      `The <strong>effective MAC rate</strong> is the share of the county's total profit the charge `
      + `collects — <strong>${(st.effRate * 100).toFixed(1)}%</strong> at the base multiplier (k=${cfg.k.toFixed(2)}). `
      + `It rises over time because the automated, high-rate firms grow their profits far faster than `
      + `human-centric ones — shown below.`;
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Charge multiplier (k) — a constant, usually 1.0</span>
      <input type="range" id="k" min="0.5" max="2.0" step="0.05" value="1.0">
      <span class="ctrl-val" id="k_v"></span>
    </label>
    <div class="assumptions">
      <span>Per-firm rate = min(<b>50%</b>, k × <b>22%</b> × profit-per-emp / <b>$200k</b>)</span>
      <span>k is a multiplier, usually <b>1.0</b></span>
      <span>MAC pool summed from the <b>business mix</b> below</span>
    </div>`;
  document.getElementById('k').addEventListener('input', render);
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
