// Trajectory dashboard — 20-year iteration of the simple_trace sim.

const fmtUSD = n => {
  const abs = Math.abs(n);
  if (abs >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M';
  if (abs >= 1e4) return '$' + (n/1e3).toFixed(1) + 'K';
  return '$' + Math.round(n).toLocaleString();
};
const fmtPct = n => n.toFixed(1) + '%';

// Slider display sync
const sliders = [
  { id: 'years',              fmt: v => parseInt(v) + '' },
  { id: 'basket_decline_pct', fmt: v => parseFloat(v).toFixed(1) + '%' },
  { id: 'salary_decline_pct', fmt: v => parseFloat(v).toFixed(1) + '%' },
  { id: 'p_emp_growth_pct',   fmt: v => parseFloat(v).toFixed(1) + '%' },
  { id: 'levy_cap',           fmt: v => Math.round(parseFloat(v) * 100) + '%' },
];
sliders.forEach(s => {
  const inp = document.getElementById(s.id);
  const out = document.getElementById(s.id + '_v');
  if (inp && out) {
    inp.addEventListener('input', () => out.textContent = s.fmt(inp.value));
    out.textContent = s.fmt(inp.value);
  }
});

function readConfig() {
  return {
    years: parseInt(document.getElementById('years').value),
    basket_decline_pct: parseFloat(document.getElementById('basket_decline_pct').value),
    salary_decline_pct: parseFloat(document.getElementById('salary_decline_pct').value),
    p_emp_growth_pct: parseFloat(document.getElementById('p_emp_growth_pct').value),
    levy_cap_rate: parseFloat(document.getElementById('levy_cap').value),
    levy_formula: document.getElementById('levy_formula').value,
  };
}

const btn = document.getElementById('run-btn');
const status = document.getElementById('status');
const results = document.getElementById('results');

btn.addEventListener('click', async () => {
  btn.disabled = true;
  status.textContent = 'running…';
  try {
    const r = await fetch('/api/trajectory', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(readConfig()),
    });
    if (!r.ok) {
      const err = await r.json();
      status.textContent = 'ERROR: ' + (err.error || r.status);
      return;
    }
    status.textContent = 'done';
    render(await r.json());
  } catch (e) {
    status.textContent = 'ERROR: ' + e;
  } finally {
    btn.disabled = false;
  }
});

function render(d) {
  results.innerHTML = [
    renderVerdict(d),
    renderChart(d),
    renderEndpoints(d),
    renderTable(d),
  ].join('\n');
}

function renderVerdict(d) {
  const closed = d.crossover_year !== null;
  const cls = closed ? 'ok' : 'crit';
  const headline = closed
    ? `<strong>Funding gap closes in ${d.crossover_year}</strong> — automation curves alone fund UBI.`
    : `<strong>Gap never closes within ${d.config.years} years</strong> — cost decline alone is insufficient.`;
  const detail = `From ${d.first.funding_gap_pct.toFixed(1)}% gap in ${d.first.year} ` +
                 `to ${d.final.funding_gap_pct.toFixed(1)}% gap in ${d.final.year}.`;
  return `
  <div class="card">
    <div class="callout ${cls}">${headline}<br>
      <span style="color:var(--dim); font-size:11px;">${detail}</span>
    </div>
  </div>`;
}

// Mission-control SVG line chart. No dependencies.
function renderChart(d) {
  const W = 800, H = 320;
  const PAD_L = 70, PAD_R = 30, PAD_T = 30, PAD_B = 50;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const snaps = d.snapshots;
  const years = snaps.map(s => s.year);
  const series = [
    { key: 'ubi_obligation',  label: 'UBI obligation', color: 'var(--warn)' },
    { key: 'levy_collected',  label: 'Levy collected', color: 'var(--ok)'   },
    { key: 'funding_gap',     label: 'Funding gap',    color: 'var(--crit)' },
  ];

  // Y-scale: linear from 0 to max of all series
  const maxY = Math.max(...snaps.flatMap(s => series.map(sr => s[sr.key])));
  const yMax = Math.ceil(maxY / 5000) * 5000;  // round up to nearest $5K
  const yToPx = v => PAD_T + plotH * (1 - v / yMax);

  // X-scale: linear by year index
  const xToPx = i => PAD_L + (snaps.length === 1 ? plotW / 2 : plotW * i / (snaps.length - 1));

  // Build paths
  const pathFor = key => snaps.map((s, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(i).toFixed(1)} ${yToPx(s[key]).toFixed(1)}`).join(' ');

  // Y gridlines + labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => t * yMax);
  const yGrid = yTicks.map(t => {
    const y = yToPx(t);
    return `<line x1="${PAD_L}" y1="${y}" x2="${W-PAD_R}" y2="${y}" stroke="var(--line)" stroke-width="0.5"/>
            <text x="${PAD_L - 8}" y="${y + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${fmtUSD(t)}</text>`;
  }).join('');

  // X labels — every 2 years, plus first and last
  const xLabels = snaps.map((s, i) => {
    if (i !== 0 && i !== snaps.length - 1 && (s.year - snaps[0].year) % 2 !== 0) return '';
    return `<text x="${xToPx(i)}" y="${H - PAD_B + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${s.year}</text>`;
  }).join('');

  // Crossover marker
  let crossLine = '';
  if (d.crossover_year !== null) {
    const idx = years.indexOf(d.crossover_year);
    if (idx >= 0) {
      const x = xToPx(idx);
      crossLine = `
        <line x1="${x}" y1="${PAD_T}" x2="${x}" y2="${H - PAD_B}" stroke="var(--ok)" stroke-width="1" stroke-dasharray="4 3"/>
        <text x="${x + 4}" y="${PAD_T + 12}" fill="var(--ok)" font-size="10" font-family="var(--mono)">crossover ${d.crossover_year}</text>
      `;
    }
  }

  // Series lines + dots
  const lines = series.map(sr =>
    `<path d="${pathFor(sr.key)}" fill="none" stroke="${sr.color}" stroke-width="2"/>` +
    snaps.map((s, i) => `<circle cx="${xToPx(i)}" cy="${yToPx(s[sr.key])}" r="2" fill="${sr.color}"/>`).join('')
  ).join('');

  // Legend
  const legend = series.map((sr, i) => `
    <g transform="translate(${PAD_L + i * 160}, ${H - 12})">
      <line x1="0" y1="0" x2="20" y2="0" stroke="${sr.color}" stroke-width="2"/>
      <text x="26" y="4" fill="var(--txt2)" font-size="11" font-family="var(--mono)">${sr.label}</text>
    </g>
  `).join('');

  return `
  <div class="card">
    <h3>Trajectory chart</h3>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">
      <rect x="${PAD_L}" y="${PAD_T}" width="${plotW}" height="${plotH}" fill="none" stroke="var(--line-hot)" stroke-width="0.5"/>
      ${yGrid}
      ${xLabels}
      ${crossLine}
      ${lines}
      ${legend}
    </svg>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Each annual snapshot reruns the per-month sim with parameters adjusted for elapsed years.
      All values are monthly $ at that year.
    </div>
  </div>`;
}

function renderEndpoints(d) {
  const f = d.first;
  const l = d.final;
  const stat = (label, v0, v1, color) => `
    <div class="stat">
      <div class="label">${label}</div>
      <div class="value" ${color ? `style="color:${color};"` : ''}>${fmtUSD(v0)} → ${fmtUSD(v1)}</div>
      <div class="sub">${f.year} → ${l.year} · Δ ${((v1-v0)/v0*100).toFixed(1)}%</div>
    </div>
  `;
  return `
  <div class="card">
    <h3>Endpoints</h3>
    <div class="stats">
      ${stat('UBI obligation',  f.ubi_obligation,  l.ubi_obligation,  'var(--warn)')}
      ${stat('Profit pool',     f.profit_pool,     l.profit_pool,     null)}
      ${stat('Levy collected',  f.levy_collected,  l.levy_collected,  'var(--ok)')}
      ${stat('Funding gap',     f.funding_gap,     l.funding_gap,     'var(--crit)')}
    </div>
  </div>`;
}

function renderTable(d) {
  const row = s => `
    <tr>
      <td class="cat">${s.year}</td>
      <td class="num">${fmtUSD(s.basket_usd)}</td>
      <td class="num">${fmtUSD(s.ubi_obligation)}</td>
      <td class="num">${fmtUSD(s.profit_pool)}</td>
      <td class="num">${fmtUSD(s.max_capturable)}</td>
      <td class="num">${fmtUSD(s.levy_collected)}</td>
      <td class="num">${fmtUSD(s.funding_gap)}</td>
      <td class="num">${fmtPct(s.funding_gap_pct)}</td>
    </tr>
  `;
  return `
  <div class="card">
    <h3>Year-by-year snapshots</h3>
    <table>
      <thead><tr>
        <th>Year</th>
        <th class="num">Basket</th>
        <th class="num">UBI</th>
        <th class="num">Profit pool</th>
        <th class="num">Max cap</th>
        <th class="num">Levy</th>
        <th class="num">Gap $</th>
        <th class="num">Gap %</th>
      </tr></thead>
      <tbody>${d.snapshots.map(row).join('')}</tbody>
    </table>
  </div>`;
}

// Auto-run on page load
window.addEventListener('DOMContentLoaded', () => btn.click());
