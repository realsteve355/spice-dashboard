// MaryFontaine dashboard — vanilla JS + Chart.js
// Token aliases (mirror src/tokens.js)
const C = {
  txt: '#e8e8e8', dim: '#a4a4a4', faint: '#767676',
  ok: '#5dd39e', warn: '#d4a04a', crit: '#ef4444',
  panel: '#0d0f12', line: '#232831', lineHot: '#353c47',
  blue: '#3b82f6', purple: '#8b5cf6', amber: '#eab308',
};

// Chart.js global defaults (dark theme)
Chart.defaults.color = C.dim;
Chart.defaults.borderColor = C.line;
Chart.defaults.font.family = "'IBM Plex Mono', ui-monospace, monospace";
Chart.defaults.font.size = 11;
Chart.defaults.animation = false;

const charts = {};

// ── Slider wiring ──────────────────────────────────────────────────
const sliders = [
  { id: 'ubi', fmt: v => parseFloat(v).toFixed(0) },
  { id: 'ubi_children_pct', fmt: v => parseFloat(v).toFixed(1) },
  { id: 'cover', fmt: v => parseFloat(v).toFixed(2) },
  { id: 'lat', fmt: v => `${(parseFloat(v) * 100).toFixed(1)}%` },
  { id: 's_tax', fmt: v => `${(parseFloat(v) * 100).toFixed(1)}%` },
  { id: 'cashout_mult', fmt: v => parseFloat(v).toFixed(1) },
];
sliders.forEach(s => {
  const input = document.getElementById(s.id);
  const display = document.getElementById(s.id + '_v');
  input.addEventListener('input', () => display.textContent = s.fmt(input.value));
  display.textContent = s.fmt(input.value);  // initial
});

// Toggle rows — clicking the row toggles the checkbox + visual class
['ubi_retirees_only', 'mortgage_refi', 'ext_rent_refi'].forEach(id => {
  const row = document.getElementById(id + '_row');
  const cb = document.getElementById(id);
  const sync = () => row.classList.toggle('on', cb.checked);
  row.addEventListener('click', e => {
    if (e.target !== cb) cb.checked = !cb.checked;
    sync();
  });
  cb.addEventListener('change', sync);
  sync();
});

// ── Run flow ──────────────────────────────────────────────────────
const runBtn = document.getElementById('run-btn');
const progressEl = document.getElementById('progress');
const runStatusEl = document.getElementById('run-status');

function readConfig() {
  return {
    scenario: document.getElementById('scenario').value,
    months: parseInt(document.getElementById('months').value),
    ubi_s_per_citizen: parseFloat(document.getElementById('ubi').value),
    ubi_children_pct: parseFloat(document.getElementById('ubi_children_pct').value),
    ubi_retirees_only: document.getElementById('ubi_retirees_only').checked,
    cover_target: parseFloat(document.getElementById('cover').value),
    lat_enabled: parseFloat(document.getElementById('lat').value) > 0,
    lat_rate_pct: parseFloat(document.getElementById('lat').value),
    mortgage_refinance_to_s: document.getElementById('mortgage_refi').checked,
    external_rent_refinance: document.getElementById('ext_rent_refi').checked,
    s_tax_on_purchases_pct: parseFloat(document.getElementById('s_tax').value),
    cashout_multiplier: parseFloat(document.getElementById('cashout_mult').value),
  };
}

runBtn.addEventListener('click', async () => {
  runBtn.disabled = true;
  progressEl.textContent = 'starting...';
  try {
    const r = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readConfig())
    });
    if (r.status !== 202) {
      const err = await r.json();
      progressEl.textContent = `ERROR: ${err.error || r.status}`;
      runBtn.disabled = false;
      return;
    }
    pollProgress();
  } catch (e) {
    progressEl.textContent = `ERROR: ${e}`;
    runBtn.disabled = false;
  }
});

let pollTimer = null;
async function pollProgress() {
  if (pollTimer) clearTimeout(pollTimer);
  const r = await fetch('/api/state');
  const s = await r.json();
  if (s.is_running) {
    progressEl.textContent = s.progress || 'running...';
    pollTimer = setTimeout(pollProgress, 700);
  } else {
    progressEl.textContent = s.last_error ? `ERROR — see server logs` : 'complete';
    runBtn.disabled = false;
    refreshAll();
  }
}

// ── Data fetching + rendering ─────────────────────────────────────
async function refreshAll() {
  const [state, macro, boundary, welfare, transitions, companies] = await Promise.all([
    fetch('/api/state').then(r => r.json()),
    fetch('/api/macro').then(r => r.json()),
    fetch('/api/boundary').then(r => r.json()),
    fetch('/api/welfare').then(r => r.json()),
    fetch('/api/transitions').then(r => r.json()),
    fetch('/api/companies').then(r => r.json()),
  ]);
  renderSummary(state);
  renderMacro(macro);
  renderBoundary(boundary);
  renderWelfare(welfare);
  renderTransitions(transitions);
  renderCompanies(companies);
}

function renderSummary(s) {
  const el = document.getElementById('summary');
  if (!s.has_run) {
    el.innerHTML = '<div class="empty" style="grid-column:span 6">Run a simulation to see results</div>';
    document.getElementById('run-status').textContent = 'No run yet';
    return;
  }
  document.getElementById('run-status').textContent =
    `${s.metadata?.scenario || '?'} · variant ${s.metadata?.seed || '?'}`;

  const ppl = s.purchasing_power_loss_pct;
  const pplClass = ppl > 50 ? 'crit' : ppl > 20 ? 'warn' : 'ok';
  const basketClass = s.basket_s > 35 ? 'crit' : s.basket_s > 30 ? 'warn' : 'ok';
  const compressedClass = s.rate_compressed ? 'crit' : 'ok';
  const fmtUsd = n => '$' + (n / 1e6).toFixed(1) + 'M';
  const fmtS = n => (n / 1e6).toFixed(1) + 'M S';
  el.innerHTML = `
    <div class="stat">
      <div class="label">Basket cost (S)</div>
      <div class="value ${basketClass}">${s.basket_s.toFixed(2)}</div>
      <div class="sub">target 28.00</div>
    </div>
    <div class="stat">
      <div class="label">PP loss</div>
      <div class="value ${pplClass}">${ppl > 0 ? '-' : '+'}${Math.abs(ppl).toFixed(0)}%</div>
      <div class="sub">vs. founding</div>
    </div>
    <div class="stat">
      <div class="label">Fisc rate</div>
      <div class="value">$${s.fisc_rate.toFixed(3)}</div>
      <div class="sub">USD per S</div>
    </div>
    <div class="stat">
      <div class="label">Reserve</div>
      <div class="value">${fmtUsd(s.reserve)}</div>
      <div class="sub">USDC</div>
    </div>
    <div class="stat">
      <div class="label">S supply</div>
      <div class="value">${fmtS(s.supply)}</div>
      <div class="sub">${s.n_citizens.toLocaleString()} citizens</div>
    </div>
    <div class="stat">
      <div class="label">Compressed</div>
      <div class="value ${compressedClass}">${s.rate_compressed ? 'YES' : 'NO'}</div>
      <div class="sub">peg defence active</div>
    </div>
  `;
}

function lineDataset(label, data, color, opts = {}) {
  return {
    label, data,
    borderColor: color,
    backgroundColor: color + '22',
    borderWidth: 1.5,
    pointRadius: 0,
    tension: 0.1,
    fill: opts.fill || false,
    ...opts
  };
}

function lineChart(canvasId, labels, datasets, opts = {}) {
  if (charts[canvasId]) charts[canvasId].destroy();
  const ctx = document.getElementById(canvasId);
  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: opts.showLegend !== false, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          title: { display: true, text: 'Month', color: C.faint, font: { size: 10 } },
          ticks: { maxTicksLimit: 12 },
          grid: { color: C.line }
        },
        y: {
          beginAtZero: opts.beginAtZero !== false,
          grid: { color: C.line },
          ticks: { color: C.dim }
        }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
    }
  });
}

function renderMacro(d) {
  const months = d.months || [];
  // Basket cost in S — show with reference line at 28
  const target = months.map(_ => 28);
  lineChart('chart-basket', months, [
    lineDataset('Basket cost (S)', d.basket_s, C.warn),
    lineDataset('Target (28)', target, C.faint, { borderDash: [5, 5] })
  ]);
  // Fisc rate
  lineChart('chart-rate', months, [lineDataset('USD per S', d.rate, C.amber)], {
    beginAtZero: false
  });
  // Reserve
  lineChart('chart-reserve', months, [lineDataset('USDC reserve', d.reserve, C.ok)]);
  // S supply
  lineChart('chart-supply', months, [lineDataset('S supply', d.supply, C.blue)]);
}

function renderBoundary(d) {
  const months = d.months || [];
  const colors = {
    export: C.ok,
    external_income: '#7dd3fc',
    import: C.crit,
    mortgage_payment: '#fb923c',
    external_rent: '#f472b6',
    cashout: '#a78bfa',
    external_dividend: C.warn,
    external_dividend_vested: C.faint,
  };
  const datasets = [];
  for (const [type, vals] of Object.entries(d.inflows || {})) {
    datasets.push({
      label: type, data: vals, borderColor: colors[type] || C.txt,
      backgroundColor: (colors[type] || C.txt) + '88', borderWidth: 1, type: 'bar', stack: 'in'
    });
  }
  for (const [type, vals] of Object.entries(d.outflows || {})) {
    datasets.push({
      label: type, data: vals.map(v => -v),
      borderColor: colors[type] || C.txt, backgroundColor: (colors[type] || C.txt) + '88',
      borderWidth: 1, type: 'bar', stack: 'out'
    });
  }
  if (charts['chart-boundary']) charts['chart-boundary'].destroy();
  charts['chart-boundary'] = new Chart(document.getElementById('chart-boundary'), {
    type: 'bar',
    data: { labels: months, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
      scales: {
        x: { stacked: true, grid: { color: C.line } },
        y: {
          stacked: true, grid: { color: C.line },
          ticks: { callback: v => '$' + (Math.abs(v) / 1e6).toFixed(1) + 'M' }
        }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

function renderWelfare(d) {
  // Plot p10, median, p90 over years — as lines
  const years = d.years || [];
  if (years.length === 0) {
    if (charts['chart-welfare']) charts['chart-welfare'].destroy();
    return;
  }
  const p10 = d.deciles.map(arr => arr[1]);
  const median = d.deciles.map(arr => arr[5]);
  const p90 = d.deciles.map(arr => arr[9]);
  const labels = years.map(y => `Y${y}`);
  lineChart('chart-welfare', labels, [
    lineDataset('p90 (rich citizen)', p90, C.ok, { fill: '+1', backgroundColor: C.ok + '11' }),
    lineDataset('median', median, C.txt, { borderWidth: 2 }),
    lineDataset('p10 (poor citizen)', p10, C.crit, { fill: '-1', backgroundColor: C.crit + '11' }),
  ]);
}

function renderTransitions(d) {
  const byYear = {};
  for (const t of d.by_year || []) {
    const k = `${t.from} → ${t.to}`;
    if (!byYear[k]) byYear[k] = {};
    byYear[k][t.year] = t.n;
  }
  const allYears = Array.from(new Set((d.by_year || []).map(x => x.year))).sort((a, b) => a - b);
  if (allYears.length === 0) {
    if (charts['chart-transitions']) charts['chart-transitions'].destroy();
    return;
  }
  const colorPool = [C.ok, C.warn, C.blue, C.purple, C.crit, C.amber];
  const datasets = Object.keys(byYear).map((k, i) => ({
    label: k,
    data: allYears.map(y => byYear[k][y] || 0),
    borderColor: colorPool[i % colorPool.length],
    backgroundColor: colorPool[i % colorPool.length] + '88',
    borderWidth: 1,
  }));
  if (charts['chart-transitions']) charts['chart-transitions'].destroy();
  charts['chart-transitions'] = new Chart(document.getElementById('chart-transitions'), {
    type: 'bar',
    data: { labels: allYears.map(y => `Y${y}`), datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
      scales: { x: { stacked: true, grid: { color: C.line } }, y: { stacked: true, grid: { color: C.line } } }
    }
  });
}

function renderCompanies(d) {
  const el = document.getElementById('company-table');
  const rows = (d.top_balance || []).slice(0, 12);
  if (rows.length === 0) {
    el.innerHTML = '<div class="empty">no data</div>';
    return;
  }
  el.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Sector</th><th class="num">Balance (S)</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.name}</td>
            <td>${r.sector}</td>
            <td class="num">${(r.balance / 1000).toFixed(1)}K</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── Initial load ──────────────────────────────────────────────────
refreshAll();
