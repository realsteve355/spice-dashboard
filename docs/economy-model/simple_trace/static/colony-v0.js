// Colony v0 dashboard. POSTs config to /api/colony-v0, renders 4 macro charts
// + the per-citizen wealth heatmap.

const INPUTS = ['months', 'automation_end', 'automation_months', 'seed'];
const STORAGE_KEY = 'axion_colony_v0_v1';

function readNum(id, def) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? def : v;
}
function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.abs(n) >= 1e3 ? Math.round(n).toLocaleString() : n.toFixed(0);
}
function pct(v) { return (v * 100).toFixed(1) + '%'; }

function setStatus(msg, err = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = err ? 'status err' : 'status';
}

async function fetchRun() {
  const cfg = {
    months:            readNum('months', 60),
    automation_end:    readNum('automation_end', 0.85),
    automation_months: readNum('automation_months', 60),
    seed:              readNum('seed', 42),
  };
  setStatus('running…');
  const r = await fetch('/api/colony-v0', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 200)}`);
  }
  return r.json();
}

// ── Generic line-chart renderer (multiple series allowed) ──────────────
function renderChart(svgId, traj, series, opts = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const W = 700, H = 240;
  const pad = { l: 60, r: 12, t: 22, b: 28 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const months = traj.length - 1;

  // Y domain
  let yMin = Infinity, yMax = -Infinity;
  for (const s of series) {
    for (const p of traj) {
      const v = s.fn(p);
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
  }
  if (!isFinite(yMin) || !isFinite(yMax)) { yMin = 0; yMax = 1; }
  if (yMin > 0) yMin = 0;
  yMax = yMax * 1.05 + 0.0001;

  const xScale = m => pad.l + (m / months) * innerW;
  const yScale = v => pad.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  let grid = '';
  const xStep = months >= 36 ? 6 : 3;
  for (let m = 0; m <= months; m += xStep) {
    grid += `<line x1="${xScale(m)}" y1="${pad.t}" x2="${xScale(m)}" y2="${pad.t + innerH}" stroke="#14171f"/>`;
    grid += `<text x="${xScale(m)}" y="${H - 10}" fill="#5a6373" font-size="10" text-anchor="middle">M${m}</text>`;
  }
  for (let i = 0; i <= 4; i++) {
    const yPx = pad.t + (innerH * i / 4);
    const yVal = yMax - (yMax - yMin) * (i / 4);
    grid += `<line x1="${pad.l}" y1="${yPx}" x2="${pad.l + innerW}" y2="${yPx}" stroke="#14171f"/>`;
    const lbl = opts.percent ? pct(yVal) : (opts.dollar ? '$' + fmt(yVal) : fmt(yVal));
    grid += `<text x="${pad.l - 6}" y="${yPx + 3}" fill="#9aa3b3" font-size="10" text-anchor="end">${lbl}</text>`;
  }

  let lines = '';
  for (const s of series) {
    const d = traj.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(s.fn(p)).toFixed(1)}`).join(' ');
    lines += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`;
    if (s.label) {
      // Stagger labels vertically when multiple
      const idx = series.indexOf(s);
      lines += `<text x="${pad.l}" y="${pad.t - 8 - idx * 0}" fill="${s.color}" font-size="10">${s.label}</text>`;
    }
  }

  // Title row of labels
  let labels = '';
  if (opts.title) {
    labels += `<text x="${pad.l}" y="${pad.t - 8}" fill="#9aa3b3" font-size="10" letter-spacing="0.1em">${opts.title}</text>`;
  }
  // Compact legend in top-right
  let legend = '';
  let lx = W - pad.r;
  for (let i = series.length - 1; i >= 0; i--) {
    const s = series[i];
    if (!s.label) continue;
    legend = `<text x="${lx}" y="${pad.t - 8}" fill="${s.color}" font-size="10" text-anchor="end">${s.label}</text>` + legend;
    lx -= (s.label.length * 6 + 18);
  }

  svg.innerHTML = grid + lines + labels + legend;
}

// ── Wealth heatmap (citizens × months) ─────────────────────────────────
function renderHeatmap(savingsGrid, productivities, employedGrid) {
  const svg = document.getElementById('heatmap');
  if (!svg) return;
  if (!savingsGrid || savingsGrid.length === 0) return;
  const nMonths = savingsGrid.length;
  const nCitizens = savingsGrid[0].length;

  // Sort citizen indices by productivity DESC (highest skilled on top)
  const order = productivities
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p - a.p)
    .map(x => x.i);

  const W = nMonths * 12, H = nCitizens * 14;
  const pad = { l: 36, r: 10, t: 4, b: 14 };
  const innerW = W, innerH = H;
  const fullW = innerW + pad.l + pad.r;
  const fullH = innerH + pad.t + pad.b;
  svg.setAttribute('viewBox', `0 0 ${fullW} ${fullH}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.height = (nCitizens * 12 + 30) + 'px';

  // Colour scale: log-ish, $0 → dark red, $500 → amber, $1500 → muted gold, $5000 → green
  function colour(savings) {
    if (savings < 1) return '#2d3a4a';     // destitute (dark slate)
    if (savings < 200) return '#7a3030';   // critical (dark red)
    if (savings < 600) return '#a05a30';   // strained (rust)
    if (savings < 1200) return '#c08838';  // moderate (amber)
    if (savings < 2500) return '#cfa340';  // healthy (gold)
    if (savings < 5000) return '#7eb24f';  // good (yellow-green)
    return '#3fb86c';                       // strong (green)
  }

  const cellW = innerW / nMonths, cellH = innerH / nCitizens;
  let cells = '';
  for (let row = 0; row < nCitizens; row++) {
    const citizenIdx = order[row];
    for (let m = 0; m < nMonths; m++) {
      const sav = savingsGrid[m][citizenIdx];
      const empl = employedGrid[m][citizenIdx];
      const x = pad.l + m * cellW;
      const y = pad.t + row * cellH;
      cells += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" fill="${colour(sav)}"`;
      // mark unemployed cells with darker stroke
      if (!empl) cells += ` stroke="#1a1d27" stroke-width="0.5"`;
      cells += `/>`;
    }
    // Productivity label on left
    const p = productivities[citizenIdx].toFixed(1);
    cells += `<text x="${pad.l - 4}" y="${(pad.t + row * cellH + cellH * 0.75).toFixed(2)}" fill="#5a6373" font-size="${Math.min(10, cellH - 1)}" text-anchor="end">p${p}</text>`;
  }
  // X axis: month markers
  const xStep = nMonths >= 60 ? 12 : (nMonths >= 24 ? 6 : 3);
  let axis = '';
  for (let m = 0; m <= nMonths; m += xStep) {
    axis += `<text x="${(pad.l + m * cellW).toFixed(2)}" y="${(pad.t + innerH + 12).toFixed(2)}" fill="#5a6373" font-size="9" text-anchor="middle">M${m}</text>`;
  }
  svg.innerHTML = cells + axis;
}

function renderSnapshot(data) {
  const last = data.trajectory[data.trajectory.length - 1];
  const first = data.trajectory[0];
  const moneyDelta = last.money_supply - first.money_supply;
  const drained = last.money_drained;
  const cells = [
    {
      lbl: 'Employment rate', val: pct(last.employment_rate),
      sub: `${Math.round(last.employment_rate * data.productivities.length)} / ${data.productivities.length} citizens employed`,
      color: last.employment_rate < 0.3 ? 'var(--crit)' : (last.employment_rate < 0.7 ? 'var(--warn)' : 'var(--ok)'),
    },
    {
      lbl: 'Money supply', val: '$' + fmt(last.money_supply),
      sub: `${moneyDelta >= 0 ? '+' : ''}$${fmt(moneyDelta)} vs start · $${fmt(drained)} drained abroad`,
      color: last.money_supply < first.money_supply * 0.3 ? 'var(--crit)' : (moneyDelta < 0 ? 'var(--warn)' : 'var(--ok)'),
    },
    {
      lbl: 'Wealth Gini', val: last.gini.toFixed(3),
      sub: `top 10% holds ${pct(last.top10_share)}`,
      color: last.gini > 0.7 ? 'var(--crit)' : (last.gini > 0.4 ? 'var(--warn)' : 'var(--ok)'),
    },
    {
      lbl: 'Destitute citizens', val: `${last.destitute_count} / ${data.productivities.length}`,
      sub: `basket cost: $${fmt(last.basket_cost_avg)} (was $${fmt(first.basket_cost_avg)})`,
      color: last.destitute_count > data.productivities.length * 0.5 ? 'var(--crit)' : (last.destitute_count > 5 ? 'var(--warn)' : 'var(--ok)'),
    },
  ];
  document.getElementById('snapshot').innerHTML = cells.map(c => `
    <div class="stat" style="border-left-color:${c.color}">
      <div class="lbl">${c.lbl}</div>
      <div class="val" style="color:${c.color}">${c.val}</div>
      <div class="sub">${c.sub}</div>
    </div>
  `).join('');
}

async function refresh() {
  try {
    saveInputs();
    const data = await fetchRun();
    const t = data.trajectory;

    renderChart('ch-employment', t, [
      { fn: p => p.employment_rate, color: '#a8e6a8', label: 'total' },
      { fn: p => p.workers_food / data.productivities.length, color: '#ef4444', label: 'food', dash: '3 3' },
      { fn: p => p.workers_goods / data.productivities.length, color: '#eab308', label: 'goods', dash: '3 3' },
      { fn: p => p.workers_serv / data.productivities.length, color: '#7aa2ff', label: 'services', dash: '3 3' },
    ], { percent: true, title: 'Employment rate' });

    renderChart('ch-money', t, [
      { fn: p => p.money_supply, color: '#a8e6a8', label: 'inside colony' },
      { fn: p => p.money_drained, color: '#ef4444', label: 'cumulative drained', dash: '4 3' },
    ], { dollar: true, title: 'Money supply' });

    renderChart('ch-gini', t, [
      { fn: p => p.gini, color: '#ef4444', label: 'Gini' },
      { fn: p => p.top10_share, color: '#eab308', label: 'top 10% share' },
    ], { percent: false, title: 'Wealth concentration' });

    renderChart('ch-basket', t, [
      { fn: p => p.basket_cost_avg, color: '#7aa2ff', label: 'avg basket cost' },
      { fn: p => p.basket_cost_local, color: '#a8e6a8', label: 'local-only basket', dash: '3 3' },
    ], { dollar: true, title: 'Basket cost (deflation)' });

    renderHeatmap(data.savings_grid, data.productivities, data.employed_grid);
    renderSnapshot(data);

    setStatus(`${data.months} months, ${data.productivities.length} citizens, seed ${readNum('seed', 42)}`);
  } catch (err) {
    setStatus('error: ' + err.message, true);
  }
}

function saveInputs() {
  try {
    const o = {};
    for (const id of INPUTS) o[id] = document.getElementById(id).value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch (e) {}
}
function restoreInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const o = JSON.parse(raw);
    for (const [id, v] of Object.entries(o)) {
      const el = document.getElementById(id);
      if (el && v) el.value = v;
    }
  } catch (e) {}
}
function resetInputs() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  location.reload();
}

// Defensive: wait for DOM ready before wiring (script tag is at bottom of body
// so this usually fires immediately, but explicit guard avoids race conditions).
function init() {
  for (const id of INPUTS) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', refresh);
      el.addEventListener('input',  refresh);
    }
  }
  const resetBtn = document.getElementById('reset');
  if (resetBtn) resetBtn.addEventListener('click', resetInputs);
  restoreInputs();
  refresh().catch(err => {
    console.error('[colony-v0] init failed:', err);
    setStatus('init failed: ' + (err && err.message ? err.message : err), true);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
