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
  { id: 'years',                    fmt: v => parseInt(v) + '' },
  { id: 'salary_decline_pct',       fmt: v => parseFloat(v).toFixed(1) + '%' },
  { id: 'p_emp_growth_pct',         fmt: v => parseFloat(v).toFixed(1) + '%' },
  { id: 'margin_growth_pct',        fmt: v => parseFloat(v).toFixed(1) + '%' },
  { id: 'margin_ceiling_pct',       fmt: v => Math.round(parseFloat(v)) + '%' },
  { id: 'welfare_displacement_pct', fmt: v => parseFloat(v).toFixed(1) + '%' },
  { id: 'levy_cap',                 fmt: v => Math.round(parseFloat(v) * 100) + '%' },
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
    salary_decline_pct: parseFloat(document.getElementById('salary_decline_pct').value),
    p_emp_growth_pct: parseFloat(document.getElementById('p_emp_growth_pct').value),
    margin_growth_pct: parseFloat(document.getElementById('margin_growth_pct').value),
    margin_ceiling_pct: parseFloat(document.getElementById('margin_ceiling_pct').value),
    welfare_displacement_pct: parseFloat(document.getElementById('welfare_displacement_pct').value),
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
    renderBasketBreakdown(d),
    renderTable(d),
  ].join('\n');
}

function renderBasketBreakdown(d) {
  const first = d.basket_breakdown_first || [];
  const final = d.basket_breakdown_final || [];
  if (first.length === 0) return '';
  // Sort by share-now in final year, descending
  const indexed = first.map((c, i) => ({ first: c, final: final[i] }))
                       .sort((a, b) => b.final.share_pct_now - a.final.share_pct_now);
  const row = pair => {
    const c = pair.first, f = pair.final;
    const rateColor = c.annual_change_pct > 0 ? 'var(--warn)' : (c.annual_change_pct < -3 ? 'var(--ok)' : 'var(--txt2)');
    const isStruct = c.name.includes("STRUCTURE");
    const cls = isStruct ? 'high' : '';
    return `<tr class="${cls}">
      <td class="cat">${c.name}</td>
      <td class="num">${c.share_pct_today.toFixed(1)}%</td>
      <td class="num" style="color:${rateColor};">${c.annual_change_pct >= 0 ? '+' : ''}${c.annual_change_pct.toFixed(1)}%</td>
      <td class="num">${c.floor_pct === null ? '—' : c.floor_pct.toFixed(0) + '%'}</td>
      <td class="num">${f.price_factor.toFixed(2)}×</td>
      <td class="num">${f.share_pct_now.toFixed(1)}%</td>
    </tr>`;
  };
  const finalYear = d.final.year;
  return `
  <div class="card">
    <h3>Basket category breakdown · today vs ${finalYear}</h3>
    <table>
      <thead><tr>
        <th>Category</th>
        <th class="num">Share today</th>
        <th class="num">Annual change</th>
        <th class="num">Floor</th>
        <th class="num">${finalYear} factor</th>
        <th class="num">${finalYear} share</th>
      </tr></thead>
      <tbody>${indexed.map(row).join('')}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      <strong>LAND is out of scope</strong> — deferred to a separate model where
      land acquisition flows through SPICE company ownership and dividends,
      not the UBI basket. The 10 categories here represent everything else a
      citizen needs to live. Rates sourced from <code>basket_model.py</code>
      (research-derived in <code>basket_research.md</code>).
    </div>
  </div>`;
}

function renderVerdict(d) {
  const m1 = d.milestone_1_year, m2 = d.milestone_2_year;
  let cls, headline;

  if (m2) {
    cls = 'ok';
    headline = `<strong>Welfare-capable in ${m1} · UBI-capable in ${m2}</strong> — both milestones hit within the projection window.`;
  } else if (m1) {
    cls = 'warn';
    headline = `<strong>Welfare-capable in ${m1} · full UBI not reached within ${d.config.years} years.</strong>`;
  } else {
    cls = 'crit';
    headline = `<strong>Neither milestone reached within ${d.config.years} years.</strong> Levy cannot fund welfare under these settings.`;
  }
  const detail = `Basket (ex-land): ${fmtUSD(d.first.basket_usd)} → ${fmtUSD(d.final.basket_usd)} · ` +
                 `Levy ${d.first.year}: ${fmtUSD(d.first.levy_collected)} → ${d.final.year}: ${fmtUSD(d.final.levy_collected)} · ` +
                 `Land deferred to separate model.`;
  return `
  <div class="card">
    <div class="callout ${cls}">${headline}<br>
      <span style="color:var(--dim); font-size:11px;">${detail}</span>
    </div>
  </div>`;
}

// Mission-control SVG line chart. No dependencies.
function renderChart(d) {
  const W = 800, H = 340;
  const PAD_L = 70, PAD_R = 30, PAD_T = 40, PAD_B = 50;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const snaps = d.snapshots;
  const years = snaps.map(s => s.year);
  const series = [
    { key: 'ubi_obligation',     label: 'UBI obligation',     color: 'var(--warn)' },
    { key: 'welfare_obligation', label: 'Welfare obligation', color: 'var(--blue)' },
    { key: 'levy_collected',     label: 'Levy collected',     color: 'var(--ok)'   },
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

  // Phase background bands (subtle): impl band (default), welfare band (MS1+), UBI band (MS2+)
  const m1 = d.milestone_1_year, m2 = d.milestone_2_year;
  const m1Idx = m1 ? years.indexOf(m1) : -1;
  const m2Idx = m2 ? years.indexOf(m2) : -1;
  let phaseBands = '';
  if (m1Idx > 0) {
    const xEnd = m2Idx > 0 ? xToPx(m2Idx) : (W - PAD_R);
    phaseBands += `<rect x="${xToPx(m1Idx)}" y="${PAD_T}" width="${xEnd - xToPx(m1Idx)}" height="${plotH}" fill="var(--blue)" opacity="0.05"/>`;
  }
  if (m2Idx > 0) {
    phaseBands += `<rect x="${xToPx(m2Idx)}" y="${PAD_T}" width="${(W - PAD_R) - xToPx(m2Idx)}" height="${plotH}" fill="var(--ok)" opacity="0.07"/>`;
  }

  // Phase labels at top of chart
  let phaseLabels = '';
  const labelAt = (xStart, xEnd, text, color) => {
    const xMid = (xStart + xEnd) / 2;
    return `<text x="${xMid}" y="${PAD_T - 10}" fill="${color}" font-size="10" font-family="var(--mono)" text-anchor="middle" letter-spacing="0.15em">${text}</text>`;
  };
  const implEnd = m1Idx > 0 ? xToPx(m1Idx) : (W - PAD_R);
  phaseLabels += labelAt(PAD_L, implEnd, 'IMPLEMENTATION', 'var(--dim)');
  if (m1Idx > 0) {
    const welfareEnd = m2Idx > 0 ? xToPx(m2Idx) : (W - PAD_R);
    phaseLabels += labelAt(xToPx(m1Idx), welfareEnd, 'WELFARE', 'var(--blue)');
  }
  if (m2Idx > 0) {
    phaseLabels += labelAt(xToPx(m2Idx), (W - PAD_R), 'FULL UBI', 'var(--ok)');
  }

  // Milestone markers
  let milestoneLines = '';
  if (m1Idx >= 0) {
    const x = xToPx(m1Idx);
    milestoneLines += `
      <line x1="${x}" y1="${PAD_T}" x2="${x}" y2="${H - PAD_B}" stroke="var(--blue)" stroke-width="1" stroke-dasharray="4 3"/>
      <text x="${x + 4}" y="${PAD_T + 14}" fill="var(--blue)" font-size="10" font-family="var(--mono)">MS1 ${m1}</text>
    `;
  }
  if (m2Idx >= 0) {
    const x = xToPx(m2Idx);
    milestoneLines += `
      <line x1="${x}" y1="${PAD_T}" x2="${x}" y2="${H - PAD_B}" stroke="var(--ok)" stroke-width="1" stroke-dasharray="4 3"/>
      <text x="${x + 4}" y="${PAD_T + 14}" fill="var(--ok)" font-size="10" font-family="var(--mono)">MS2 ${m2}</text>
    `;
  }

  // Series lines + dots
  const lines = series.map(sr =>
    `<path d="${pathFor(sr.key)}" fill="none" stroke="${sr.color}" stroke-width="2"/>` +
    snaps.map((s, i) => `<circle cx="${xToPx(i)}" cy="${yToPx(s[sr.key])}" r="2" fill="${sr.color}"/>`).join('')
  ).join('');

  // Legend
  const legend = series.map((sr, i) => `
    <g transform="translate(${PAD_L + i * 180}, ${H - 12})">
      <line x1="0" y1="0" x2="20" y2="0" stroke="${sr.color}" stroke-width="2"/>
      <text x="26" y="4" fill="var(--txt2)" font-size="11" font-family="var(--mono)">${sr.label}</text>
    </g>
  `).join('');

  return `
  <div class="card">
    <h3>Trajectory chart — three phases</h3>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">
      ${phaseBands}
      <rect x="${PAD_L}" y="${PAD_T}" width="${plotW}" height="${plotH}" fill="none" stroke="var(--line-hot)" stroke-width="0.5"/>
      ${yGrid}
      ${xLabels}
      ${phaseLabels}
      ${milestoneLines}
      ${lines}
      ${legend}
    </svg>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      MS1 = first year levy ≥ welfare obligation (SPICE replaces State welfare cost-neutrally).
      MS2 = first year levy ≥ full UBI obligation (universal payment becomes affordable).
      Three phases: implementation (no payouts) · welfare (means-tested) · full UBI (universal).
    </div>
  </div>`;
}

function renderEndpoints(d) {
  const f = d.first;
  const l = d.final;
  const stat = (label, v0, v1, color, fmtFn) => {
    const fmt = fmtFn || fmtUSD;
    return `
    <div class="stat">
      <div class="label">${label}</div>
      <div class="value" ${color ? `style="color:${color};"` : ''}>${fmt(v0)} → ${fmt(v1)}</div>
      <div class="sub">${f.year} → ${l.year} · Δ ${((v1-v0)/Math.max(1,v0)*100).toFixed(1)}%</div>
    </div>
  `;
  };
  const fmtPctVal = n => n.toFixed(1) + '%';
  return `
  <div class="card">
    <h3>Endpoints</h3>
    <div class="stats">
      ${stat('Basket cost',         f.basket_usd,         l.basket_usd,         'var(--warn)')}
      ${stat('UBI obligation',      f.ubi_obligation,     l.ubi_obligation,     'var(--warn)')}
      ${stat('Welfare obligation',  f.welfare_obligation, l.welfare_obligation, 'var(--blue)')}
      ${stat('Levy collected',      f.levy_collected,     l.levy_collected,     'var(--ok)')}
      ${stat('Profit pool',         f.profit_pool,        l.profit_pool,        null)}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Basket excludes LAND — deferred to a separate model. Land acquisition is
      via company-equity / dividends, not via the UBI basket.
    </div>
  </div>`;
}

function renderTable(d) {
  const m1 = d.milestone_1_year, m2 = d.milestone_2_year;
  const phaseFor = year => {
    if (m2 && year >= m2) return '<span style="color:var(--ok);">FULL UBI</span>';
    if (m1 && year >= m1) return '<span style="color:var(--blue);">WELFARE</span>';
    return '<span style="color:var(--dim);">IMPL</span>';
  };
  const row = s => `
    <tr>
      <td class="cat">${s.year}</td>
      <td>${phaseFor(s.year)}</td>
      <td class="num">${fmtUSD(s.basket_usd)}</td>
      <td class="num">${fmtUSD(s.welfare_obligation)}</td>
      <td class="num">${fmtUSD(s.ubi_obligation)}</td>
      <td class="num">${fmtUSD(s.levy_collected)}</td>
      <td class="num">${fmtUSD(s.profit_pool)}</td>
    </tr>
  `;
  return `
  <div class="card">
    <h3>Year-by-year snapshots</h3>
    <table>
      <thead><tr>
        <th>Year</th>
        <th>Phase</th>
        <th class="num">Basket</th>
        <th class="num">Welfare</th>
        <th class="num">UBI target</th>
        <th class="num">Levy</th>
        <th class="num">Profit pool</th>
      </tr></thead>
      <tbody>${d.snapshots.map(row).join('')}</tbody>
    </table>
  </div>`;
}

// Auto-run on page load
window.addEventListener('DOMContentLoaded', () => btn.click());
