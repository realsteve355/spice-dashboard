// Mesa-ABM policy explorer. Calls /api/abm to get 4 trajectories, overlays them.
//
// All chart rendering is vanilla SVG (matches the rest of the simple_trace
// dashboard). No D3, no recharts. Each chart shares the same axis layout.

const STORAGE_KEY = 'axion_abm_v1';

function readMonths() {
  const v = parseInt(document.getElementById('months').value, 10);
  return Math.max(6, Math.min(60, isNaN(v) ? 24 : v));
}

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.abs(n) >= 1e3 ? Math.round(n).toLocaleString() : n.toFixed(0);
}

function setStatus(msg, err = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = err ? 'status err' : 'status';
}

async function fetchTrajectories(months) {
  setStatus('running 4 scenarios…');
  const r = await fetch('/api/abm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ months }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 200)}`);
  }
  return r.json();
}

// ── Chart rendering ────────────────────────────────────────────────────
// Generic multi-line chart: takes scenarios array, an accessor for the
// series value, viewBox dimensions. Auto-fits Y axis. Includes Y-zero line.

function renderMultiLine(svgId, scenarios, accessor, opts = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const W = opts.W || 700, H = opts.H || 300;
  const pad = { l: 70, r: 16, t: 24, b: 28 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Domain
  const months = scenarios[0].trajectory.length - 1;
  let yMin = Infinity, yMax = -Infinity;
  for (const s of scenarios) {
    for (const p of s.trajectory) {
      const v = accessor(p);
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
  }
  // Pad and snap to nice round numbers
  if (yMin > 0) yMin = 0;
  if (yMax < 0) yMax = 0;
  yMin = yMin * 1.05;
  yMax = yMax * 1.05;
  if (yMin === 0 && yMax === 0) yMax = 1;

  const xScale = m => pad.l + (m / months) * innerW;
  const yScale = v => pad.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  // Grid + axes
  let grid = '';
  const xStep = months >= 24 ? 6 : 3;
  for (let m = 0; m <= months; m += xStep) {
    grid += `<line x1="${xScale(m)}" y1="${pad.t}" x2="${xScale(m)}" y2="${pad.t + innerH}" stroke="#14171f" stroke-width="1"/>`;
    grid += `<text x="${xScale(m)}" y="${H - 8}" fill="#5a6373" font-size="10" text-anchor="middle">M${m}</text>`;
  }
  for (let i = 0; i <= 4; i++) {
    const yPx = pad.t + (innerH * i / 4);
    const yVal = yMax - (yMax - yMin) * (i / 4);
    grid += `<line x1="${pad.l}" y1="${yPx}" x2="${pad.l + innerW}" y2="${yPx}" stroke="#14171f" stroke-width="1"/>`;
    const lbl = opts.dollar ? '$' + fmt(yVal) : fmt(yVal);
    grid += `<text x="${pad.l - 8}" y="${yPx + 3}" fill="#9aa3b3" font-size="10" text-anchor="end">${lbl}</text>`;
  }
  // Y-zero emphasis
  if (yMin < 0 && yMax > 0) {
    const yz = yScale(0);
    grid += `<line x1="${pad.l}" y1="${yz}" x2="${pad.l + innerW}" y2="${yz}" stroke="#3a4255" stroke-width="1" stroke-dasharray="3 3"/>`;
  }

  // Lines
  let paths = '';
  for (const s of scenarios) {
    const d = s.trajectory.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(accessor(p)).toFixed(1)}`
    ).join(' ');
    paths += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
  }

  // Title
  const title = opts.title ? `<text x="${pad.l}" y="${pad.t - 8}" fill="${opts.titleColor || '#9aa3b3'}" font-size="10" letter-spacing="0.1em">${opts.title}</text>` : '';

  svg.innerHTML = grid + paths + title;
}

function renderLegend(scenarios) {
  const el = document.getElementById('legend');
  el.innerHTML = scenarios.map(s =>
    `<span class="item"><span class="sw" style="background:${s.color}"></span>${s.name}</span>`
  ).join('');
}

function renderSnapshot(scenarios) {
  const tbody = document.querySelector('#snap-table tbody');
  tbody.innerHTML = scenarios.map(s => {
    const last = s.trajectory[s.trajectory.length - 1];
    const first = s.trajectory[0];
    const fiscDelta = last.fisc_usd - first.fisc_usd;
    const usdSave = (last.bob_usd_save || 0) + (last.alice_usd_save || 0)
                  + (last.john_usd_save || 0) + (last.jane_usd_save || 0);
    const fiscColor = last.fisc_usd < 0 ? 'var(--crit)' : (fiscDelta > 0 ? 'var(--ok)' : 'var(--warn)');
    const dColor = fiscDelta < 0 ? 'var(--crit)' : 'var(--ok)';
    let verdict;
    if (last.fisc_usd < 0)             verdict = 'bankrupt — reserve gone';
    else if (last.mond_outstanding > 30000) verdict = 'monetary inflation — MOND piling up';
    else if (fiscDelta > 1000)         verdict = 'Fisc growing — sustainable';
    else                                verdict = 'stable equilibrium';
    return `<tr style="border-bottom:1px solid #14171f;">
      <td style="padding:6px 8px;"><span style="color:${s.color}">●</span> ${s.name}</td>
      <td style="padding:6px 8px; text-align:right; color:${fiscColor}; font-variant-numeric:tabular-nums;">$${fmt(last.fisc_usd)}</td>
      <td style="padding:6px 8px; text-align:right; color:${dColor}; font-variant-numeric:tabular-nums;">${fiscDelta >= 0 ? '+' : ''}$${fmt(fiscDelta)}</td>
      <td style="padding:6px 8px; text-align:right; color:#7aa2ff; font-variant-numeric:tabular-nums;">${fmt(last.mond_outstanding)}</td>
      <td style="padding:6px 8px; text-align:right; color:#ffb86c; font-variant-numeric:tabular-nums;">$${fmt(usdSave)}</td>
      <td style="padding:6px 8px; color:var(--dim);">${verdict}</td>
    </tr>`;
  }).join('');
}

async function refresh() {
  try {
    const months = readMonths();
    const data = await fetchTrajectories(months);
    renderLegend(data.scenarios);
    renderMultiLine('chart-fisc', data.scenarios, p => p.fisc_usd,
      { title: 'Fisc USD reserve', titleColor: '#a8e6a8', dollar: true });
    renderMultiLine('chart-mond', data.scenarios, p => p.mond_outstanding,
      { title: 'MOND outstanding', titleColor: '#7aa2ff' });
    renderMultiLine('chart-usd', data.scenarios, p =>
      (p.bob_usd_save || 0) + (p.alice_usd_save || 0)
      + (p.john_usd_save || 0) + (p.jane_usd_save || 0),
      { W: 1400, title: 'Citizens\' cumulative external USD savings', titleColor: '#ffb86c', dollar: true });
    renderSnapshot(data.scenarios);
    setStatus(`4 scenarios × ${months} months computed`);
    try { localStorage.setItem(STORAGE_KEY, String(months)); } catch (e) {}
  } catch (err) {
    setStatus('error: ' + err.message, true);
  }
}

// Restore months
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) document.getElementById('months').value = saved;
} catch (e) {}

document.getElementById('months').addEventListener('change', refresh);
document.getElementById('months').addEventListener('input', refresh);

refresh();
