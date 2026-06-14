// /profitability — MaryFontaine: a targeted Market Access Charge on profit-per-
// employee. Uses the shared MaryFontaine model in maryfontaine.js (loaded first);
// page-specific bits below are the five company-type examples and the
// profit-evolution chart. Fully client-side / interactive.

const { HORIZON, RATE_CAP, macRate, marginMult, compositionStats, countyByYear,
        lineChart, fmtBn, fmtMoney, mfUSD: fmtUSD } = MF;

const STORAGE_KEY = 'axion_profitability_v6';

// Company-type examples (illustrative). Each maps to a deflating (or not) cost
// driver and a starting margin; profit_index = margin(t)/margin(0), so it saturates.
const COMPANIES = [
  { type: 'Bespoke handmade furniture', short: 'Bespoke furniture', profit: 1.2e6, emp: 35, driver: 'craftLabour', margin0: 0.40, color: '#7aa2ff' },
  { type: 'Local café / restaurant', short: 'Café / restaurant', profit: 180e3, emp: 18, driver: 'hospLand', margin0: 0.35, color: '#8b93a0' },
  { type: 'Automated warehouse / logistics', short: 'Warehouse / logistics', profit: 18e6, emp: 80, driver: 'transport', margin0: 0.25, color: '#cfa340' },
  { type: 'Lights-out manufacturing plant', short: 'Lights-out plant', profit: 45e6, emp: 45, driver: 'goods', margin0: 0.20, color: '#ef4444' },
  { type: 'Amazon MaryFontaine (national share)', short: 'Amazon (national)', profit: 280e6, emp: 1400, driver: 'goods', margin0: 0.30, color: '#7eb24f' },
];

function profitIndex(c, t) { return marginMult(c.driver, c.margin0, t) * 100; }

function profitGrowthChart() {
  return lineChart({
    height: 360, padR: 210, xDomain: [2026, 2046], yDomain: [0, 500],
    xTicks: [2026, 2031, 2036, 2041, 2046], yTicks: [0, 100, 200, 300, 400, 500], yFmt: v => v,
    series: COMPANIES.map(c => ({
      label: `${c.short} (×${(profitIndex(c, HORIZON) / 100).toFixed(1)})`,
      color: c.color, width: c.margin0 <= 0.30 ? 2.8 : 2,
      pts: Array.from({ length: HORIZON + 1 }, (_, t) => ({ x: 2026 + t, y: profitIndex(c, t) })),
    })),
  });
}

// ── Tables ───────────────────────────────────────────────────────────────
function companyTable(k) {
  const body = COMPANIES.map(c => {
    const revenue = c.profit / c.margin0;
    const ppe = c.profit / c.emp;
    const rate = macRate(c.profit, c.emp, k);
    const charge = c.profit * rate;
    const capped = rate >= RATE_CAP - 1e-9;
    return `
    <tr>
      <td class="cat" style="white-space:normal;">${c.type}</td>
      <td class="num">${fmtMoney(revenue)}</td>
      <td class="num">${fmtMoney(c.profit)}</td>
      <td class="num">${c.emp.toLocaleString()}</td>
      <td class="num">${fmtUSD(ppe)}</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(charge)}</td>
      <td class="num" style="color:var(--ok);"><strong>${(rate * 100).toFixed(1)}%${capped ? ' <span style="color:var(--dim); font-weight:normal;">(cap)</span>' : ''}</strong></td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:26%;"><col style="width:13%;"><col style="width:12%;"><col style="width:10%;"><col style="width:13%;"><col style="width:13%;"><col style="width:13%;"></colgroup>
    <thead><tr>
      <th>Company type</th>
      <th class="num">Annual revenue</th>
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
      <td class="num">${fmtMoney(r.revenue)}</td>
      <td class="num">${fmtMoney(r.profit)}</td>
      <td class="num">${Math.round(r.emp).toLocaleString()}</td>
      <td class="num">${fmtUSD(r.ppe)}</td>
      <td class="num">${(r.rate * 100).toFixed(1)}%</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(r.mac)}</td>
    </tr>`).join('');
  const avgPpe = st.totalProfit / st.totalEmp;
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:24%;"><col style="width:8%;"><col style="width:13%;"><col style="width:13%;"><col style="width:12%;"><col style="width:12%;"><col style="width:8%;"><col style="width:10%;"></colgroup>
    <thead><tr>
      <th>Sector</th>
      <th class="num">Firms</th>
      <th class="num">Revenue</th>
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
        <td class="num"><strong>${fmtBn(st.totalRevenue)}</strong></td>
        <td class="num"><strong style="color:var(--headline);">${fmtBn(st.totalProfit)}</strong></td>
        <td class="num"><strong>${Math.round(st.totalEmp).toLocaleString()}</strong></td>
        <td class="num"><strong>${fmtUSD(avgPpe)}</strong></td>
        <td class="num"><strong>${(st.effRate * 100).toFixed(1)}%</strong></td>
        <td class="num"><strong style="color:var(--ok);">${fmtMoney(st.totalMAC)}</strong></td>
      </tr>
    </tbody>
  </table>`;
}

function yearlyTable(k) {
  const body = countyByYear(k).map(r => `
    <tr>
      <td class="cat">${r.year}</td>
      <td class="num">${fmtBn(r.profit)}</td>
      <td class="num">${(r.effRate * 100).toFixed(1)}%</td>
      <td class="num" style="color:var(--ok);">${fmtMoney(r.mac)}</td>
    </tr>`).join('');
  return `
  <table style="table-layout:fixed; width:100%; max-width:580px;">
    <colgroup><col style="width:20%;"><col style="width:30%;"><col style="width:20%;"><col style="width:30%;"></colgroup>
    <thead><tr>
      <th>Year</th>
      <th class="num">Corporate profit / yr</th>
      <th class="num">Effective rate</th>
      <th class="num">MAC income / yr</th>
    </tr></thead>
    <tbody>${body}</tbody>
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
  set('yearly-table', yearlyTable(cfg.k));

  const st = compositionStats(cfg.k);
  set('headline-stats', [
    ['Total profit pool · 2026', fmtBn(st.totalProfit), 'var(--headline)'],
    ['MAC income · 2026 (from business mix)', fmtMoney(st.totalMAC), 'var(--ok)'],
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
      + `These are the <strong>2026 baseline</strong> figures; the pool grows from here as automated, `
      + `high-rate firms compound their profits far faster than human-centric ones — shown below.`;
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
      <span>MAC income summed from the <b>business mix</b> below</span>
    </div>`;
  document.getElementById('k').addEventListener('input', render);
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
