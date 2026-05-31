// Grok V8.3 Projection — top-down reference trajectory.
// Fetches /api/grok-projection and renders milestone table + 4 charts.

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(2) + 'm'
       : Math.abs(n) >= 1e3 ? (n / 1e3).toFixed(1) + 'k'
       : Math.round(n).toLocaleString();
}
function pct(v) { return (v * 100).toFixed(1) + '%'; }
function setStatus(msg, err = false) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = msg;
  el.className = err ? 'status err' : 'status';
}

function renderChart(svgId, traj, fn, opts = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const W = 700, H = 260;
  const pad = { l: 70, r: 12, t: 22, b: 28 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const months = traj.length - 1;

  let yMin = Infinity, yMax = -Infinity;
  for (const p of traj) {
    const v = fn(p);
    if (v < yMin) yMin = v;
    if (v > yMax) yMax = v;
  }
  if (yMin > 0) yMin = 0;
  yMax = yMax * 1.05 + 0.0001;
  if (yMin === yMax) yMax = 1;

  const xScale = m => pad.l + (m / months) * innerW;
  const yScale = v => pad.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  let grid = '';
  const xStep = 24; // every 2 years
  for (let m = 0; m <= months; m += xStep) {
    grid += `<line x1="${xScale(m)}" y1="${pad.t}" x2="${xScale(m)}" y2="${pad.t + innerH}" stroke="#14171f"/>`;
    grid += `<text x="${xScale(m)}" y="${H - 8}" fill="#5a6373" font-size="10" text-anchor="middle">Y${(m/12).toFixed(0)}</text>`;
  }
  for (let i = 0; i <= 4; i++) {
    const yPx = pad.t + (innerH * i / 4);
    const yVal = yMax - (yMax - yMin) * (i / 4);
    grid += `<line x1="${pad.l}" y1="${yPx}" x2="${pad.l + innerW}" y2="${yPx}" stroke="#14171f"/>`;
    const lbl = opts.percent ? pct(yVal) : (opts.dollar ? '$' + fmt(yVal) : fmt(yVal));
    grid += `<text x="${pad.l - 6}" y="${yPx + 3}" fill="#9aa3b3" font-size="10" text-anchor="end">${lbl}</text>`;
  }

  const d = traj.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(fn(p)).toFixed(1)}`
  ).join(' ');
  const line = `<path d="${d}" fill="none" stroke="${opts.color || '#b48ee6'}" stroke-width="2"/>`;

  // Mark anchor years
  let markers = '';
  for (const y of [0, 5, 12, 20]) {
    const m = y * 12;
    if (m <= months) {
      markers += `<circle cx="${xScale(m)}" cy="${yScale(fn(traj[m]))}" r="3" fill="${opts.color || '#b48ee6'}"/>`;
    }
  }

  const title = opts.title ?
    `<text x="${pad.l}" y="${pad.t - 8}" fill="${opts.color || '#9aa3b3'}" font-size="10" letter-spacing="0.1em">${opts.title}</text>` : '';

  svg.innerHTML = grid + line + markers + title;
}

function renderTable(data) {
  const tbody = document.querySelector('#milestone-table tbody');
  if (!tbody) return;
  const milestones = data.milestones;
  const rows = milestones.map(m => data.trajectory[m]).filter(r => r);
  tbody.innerHTML = rows.map(r => `
    <tr class="milestone">
      <td>${r.month}</td>
      <td>${r.year}</td>
      <td class="amt">${fmt(r.employed)}</td>
      <td class="amt">${pct(r.employment_rate)}</td>
      <td class="amt">$${fmt(r.profit_annual_total)}</td>
      <td class="amt">$${fmt(r.mac_pool_annual)}</td>
      <td class="amt">$${fmt(r.ubi_per_adult_annual)}</td>
      <td class="amt">$${fmt(r.real_ubi_annual_y0)}</td>
      <td class="amt">$${fmt(r.ubi_per_adult_monthly)}</td>
      <td class="amt">${r.tradable_index.toFixed(3)}</td>
    </tr>
  `).join('');
}

function renderSnapshot(data) {
  const traj = data.trajectory;
  const last = traj[traj.length - 1];
  const first = traj[0];
  const snap = document.getElementById('snapshot');
  if (!snap) return;
  const cells = [
    {lbl: 'Adults', val: fmt(last.adults), sub: 'population (Grok scale)'},
    {lbl: 'Employed (Y20)', val: fmt(last.employed), sub: pct(last.employment_rate) + ' of adults — 75% on optional/voluntary work'},
    {lbl: 'Total profit (annual)', val: '$' + fmt(last.profit_annual_total), sub: `vs Y0 $${fmt(first.profit_annual_total)} · ${((last.profit_annual_total / first.profit_annual_total - 1) * 100).toFixed(0)}% growth`},
    {lbl: 'MAC pool (annual)', val: '$' + fmt(last.mac_pool_annual), sub: `k=22% × profits`},
    {lbl: 'UBI per adult (nominal/yr)', val: '$' + fmt(last.ubi_per_adult_annual), sub: '$' + fmt(last.ubi_per_adult_monthly) + '/month'},
    {lbl: 'Real UBI (Y0 prices)', val: '$' + fmt(last.real_ubi_annual_y0), sub: `tradable deflation -2%/yr · ${pct(1 - last.tradable_index)} cum.`},
  ];
  snap.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px;';
  snap.innerHTML = cells.map(c => `
    <div style="background:#0b0d12; border:1px solid var(--line-hot); border-left:3px solid #b48ee6; padding:12px 14px;">
      <div style="font-size:10px; color:var(--dim); letter-spacing:0.16em; text-transform:uppercase;">${c.lbl}</div>
      <div style="font-size:18px; color:#b48ee6; font-variant-numeric:tabular-nums; margin:4px 0 2px;">${c.val}</div>
      <div style="font-size:10px; color:var(--dim);">${c.sub}</div>
    </div>
  `).join('');
}

async function refresh() {
  setStatus('computing…');
  try {
    const r = await fetch('/api/grok-projection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ months: 240 }),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const traj = data.trajectory;

    renderSnapshot(data);
    renderTable(data);

    renderChart('ch-ubi', traj,
      p => p.ubi_per_adult_monthly,
      { dollar: true, color: '#b48ee6', title: 'UBI per adult / month (nominal $)' });

    renderChart('ch-employment', traj,
      p => p.employment_rate,
      { percent: true, color: '#a8e6a8', title: 'Employment rate' });

    renderChart('ch-revenue', traj,
      p => p.revenue_annual_total,
      { dollar: true, color: '#7aa2ff', title: 'Total annual revenue ($)' });

    renderChart('ch-profits', traj,
      p => p.profit_annual_total,
      { dollar: true, color: '#cfa340', title: 'Total annual profit ($)' });

    setStatus(`${traj.length} months projected · k=${data.params.k} · adults=${data.params.n_adults.toLocaleString()}`);
  } catch (err) {
    setStatus('error: ' + err.message, true);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', refresh);
} else {
  refresh();
}
