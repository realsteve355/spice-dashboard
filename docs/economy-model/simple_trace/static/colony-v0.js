// Colony v0 dashboard. POSTs config to /api/colony-v0, renders 4 macro charts
// + the per-citizen wealth heatmap.

const INPUTS = ['months', 'monthly_external_transfers', 'seed'];
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
    months:                     readNum('months', 60),
    monthly_external_transfers: readNum('monthly_external_transfers', 2800),
    seed:                       readNum('seed', 42),
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

  // Lines (no per-series labels here — legend handles those)
  let lines = '';
  for (const s of series) {
    const d = traj.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(s.fn(p)).toFixed(1)}`).join(' ');
    lines += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`;
  }

  // Title in top-left
  let labels = '';
  if (opts.title) {
    labels += `<text x="${pad.l}" y="${pad.t - 8}" fill="#9aa3b3" font-size="10" letter-spacing="0.1em">${opts.title}</text>`;
  }
  // Legend in top-right — lay out left-to-right with a swatch + label per series
  let legend = '';
  const labelled = series.filter(s => s.label);
  if (labelled.length > 0) {
    // Estimate widths: each entry needs ~ (8 + label.length*5.5 + 14) px
    const entries = labelled.map(s => ({
      label: s.label, color: s.color,
      w: 14 + s.label.length * 5.8 + 12,
    }));
    let totalW = entries.reduce((a, e) => a + e.w, 0);
    let cursor = W - pad.r - totalW;
    for (const e of entries) {
      legend += `<rect x="${cursor.toFixed(1)}" y="${pad.t - 13}" width="10" height="2" fill="${e.color}"/>`;
      legend += `<text x="${(cursor + 14).toFixed(1)}" y="${(pad.t - 8).toFixed(1)}" fill="${e.color}" font-size="10">${e.label}</text>`;
      cursor += e.w;
    }
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
  const netBoP = last.net_bop_step;
  const cells = [
    {
      lbl: 'Population',
      val: `${last.n_total_pop}`,
      sub: `${last.n_adults} adults + ${last.n_dependents} children`,
      color: 'var(--ok)',
    },
    {
      lbl: 'Employment rate', val: pct(last.employment_rate),
      sub: `local ${last.workers_local} · chain ${last.workers_chain} · public ${last.workers_public}`,
      color: last.employment_rate < 0.5 ? 'var(--crit)' : (last.employment_rate < 0.85 ? 'var(--warn)' : 'var(--ok)'),
    },
    {
      lbl: 'Money supply', val: '$' + fmt(last.money_supply),
      sub: `${moneyDelta >= 0 ? '+' : ''}$${fmt(moneyDelta)} vs start · transfers in $${fmt(last.transfers_in + (last.child_transfers || 0))}/mo`,
      color: Math.abs(moneyDelta) / Math.max(1, first.money_supply) < 0.20 ? 'var(--ok)' : 'var(--warn)',
    },
    {
      lbl: 'Net BoP (monthly)',
      val: (netBoP >= 0 ? '+' : '') + '$' + fmt(netBoP) + ' / mo',
      sub: `imports $${fmt(last.imports_step)} · exports + transfers $${fmt(last.exports_step)}`,
      color: Math.abs(netBoP) < 500 ? 'var(--ok)' : (netBoP < -2000 ? 'var(--crit)' : 'var(--warn)'),
    },
    {
      lbl: 'Money velocity (annual)',
      val: last.velocity_annual.toFixed(2) + ' / yr',
      sub: `transactions $${fmt(last.transactions)}/mo · basket $${fmt(last.basket_cost_avg)}`,
      color: last.velocity_annual > 1.5 ? 'var(--ok)' : (last.velocity_annual > 0.5 ? 'var(--warn)' : 'var(--crit)'),
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

function renderFirmsTable(firms) {
  const tbody = document.querySelector('#firms-table tbody');
  if (!tbody) return;
  const TYPE_COLOR = {
    local:   '#7eb24f',
    chain:   '#ffb86c',
    import:  '#ef4444',
    public:  '#7aa2ff',
    exports: '#a8e6a8',
    tax:     '#cfa340',
  };
  tbody.innerHTML = firms.map(f => {
    const color = TYPE_COLOR[f.type] || 'var(--dim)';
    let flow = '';
    if (f.type === 'local') {
      flow = `+$${fmt(f.exports_cum || 0)} cum. exports`;
    } else if (f.type === 'chain') {
      flow = `−$${fmt(f.corp_fee_cum || 0)} cum. corp fee → external HQ`;
    } else if (f.type === 'import') {
      flow = `−$${fmt(f.revenue_cum || 0)} cum. drained out of colony`;
    } else if (f.type === 'public') {
      flow = `+$${fmt(f.transfers_cum || 0)} cum. transfers in`;
    } else if (f.type === 'exports') {
      flow = `+$${fmt(f.exports_cum || 0)} cum. external earnings INTO colony`;
    } else if (f.type === 'tax') {
      flow = `−$${fmt(f.tax_drained_cum || 0)} drained · +$${fmt(f.tax_local_cum || 0)} stayed local`;
    }
    let revMonth = '—', revCum = '—', wagesCum = '—', txnMonth = '—', txnCum = '—';
    if (f.revenue_month !== undefined) revMonth = '$' + fmt(f.revenue_month);
    if (f.revenue_cum   !== undefined) revCum   = '$' + fmt(f.revenue_cum);
    if (f.wages_cum     !== undefined) wagesCum = '$' + fmt(f.wages_cum);
    if (f.txns_month    !== undefined) txnMonth = fmt(f.txns_month);
    if (f.txns_cum      !== undefined) txnCum   = fmt(f.txns_cum);
    // For synthetic entities show their cumulative flow in the revenue_cum slot
    if (f.type === 'exports' && f.exports_cum !== undefined) {
      revCum = '$' + fmt(f.exports_cum);
    }
    if (f.type === 'tax') {
      revCum = '$' + fmt((f.income_tax_cum || 0) + (f.sales_tax_cum || 0));
    }
    return `<tr style="border-bottom:1px solid #14171f;">
      <td style="padding:6px 8px; color:var(--headline);">${f.name}</td>
      <td style="padding:6px 8px;"><span style="color:${color}">●</span> ${f.type}</td>
      <td style="padding:6px 8px; color:var(--dim);">${f.sector}</td>
      <td style="padding:6px 8px; text-align:right; font-variant-numeric:tabular-nums;">${f.workers}</td>
      <td style="padding:6px 8px; text-align:right; color:var(--txt); font-variant-numeric:tabular-nums;">${txnMonth}</td>
      <td style="padding:6px 8px; text-align:right; color:var(--dim); font-variant-numeric:tabular-nums;">${txnCum}</td>
      <td style="padding:6px 8px; text-align:right; color:var(--txt); font-variant-numeric:tabular-nums;">${revMonth}</td>
      <td style="padding:6px 8px; text-align:right; color:var(--dim); font-variant-numeric:tabular-nums;">${revCum}</td>
      <td style="padding:6px 8px; text-align:right; color:var(--txt); font-variant-numeric:tabular-nums;">${wagesCum}</td>
      <td style="padding:6px 8px; color:var(--dim); font-size:10px;">${flow}</td>
    </tr>`;
  }).join('');
}

async function refresh() {
  try {
    saveInputs();
    const data = await fetchRun();
    const t = data.trajectory;

    renderChart('ch-employment', t, [
      { fn: p => p.workers_local + p.workers_chain + p.workers_public, color: '#a8e6a8', label: 'total jobs' },
      { fn: p => p.workers_local, color: '#7eb24f', label: 'truly-local', dash: '4 3' },
      { fn: p => p.workers_chain, color: '#ffb86c', label: 'chain-branch', dash: '4 3' },
      { fn: p => p.workers_public, color: '#7aa2ff', label: 'public sector', dash: '4 3' },
    ], { title: 'Employment by firm type (adult citizens)' });

    renderChart('ch-money', t, [
      { fn: p => p.money_supply, color: '#a8e6a8', label: 'money supply' },
      { fn: p => p.money_drained, color: '#ef4444', label: 'cumulative imports', dash: '4 3' },
      { fn: p => p.money_returned, color: '#7aa2ff', label: 'cumulative exports', dash: '4 3' },
    ], { dollar: true, title: 'Money supply + cumulative trade' });

    renderChart('ch-gini', t, [
      { fn: p => p.imports_step,        color: '#ef4444', label: 'imports / mo' },
      { fn: p => p.exports_step,        color: '#a8e6a8', label: 'exports / mo' },
    ], { dollar: true, title: 'Balance of payments (monthly)' });

    // Velocity replaces basket cost (the local-only basket line was meaningless —
    // citizens always buy a mix; basket cost is now in the snapshot tile).
    renderChart('ch-basket', t, [
      { fn: p => p.velocity_annual, color: '#cfa340', label: 'V annual (MV=PY)' },
      { fn: p => p.velocity_monthly, color: '#a05a30', label: 'V monthly', dash: '3 3' },
    ], { title: 'Money velocity (transactions ÷ supply)' });

    renderHeatmap(data.savings_grid, data.productivities, data.employed_grid);
    renderSnapshot(data);
    renderFirmsTable(data.firms || []);

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
