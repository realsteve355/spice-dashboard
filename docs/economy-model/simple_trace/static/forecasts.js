// Forecasts page — presents structured forecast data as a timeline chart
// + per-category cards + quotes + skeptic + sources. No parameters,
// no simulation. Just data.

const results = document.getElementById('results');

// Map color_class strings to actual CSS variable names
const colorVar = name => `var(--${name})`;

(async function init() {
  try {
    const r = await fetch('/api/forecasts');
    if (!r.ok) {
      results.innerHTML = `<div class="callout crit">Failed to load forecasts: ${r.status}</div>`;
      return;
    }
    render(await r.json());
  } catch (e) {
    results.innerHTML = `<div class="callout crit">Error: ${e}</div>`;
  }
})();

function render(d) {
  results.innerHTML = [
    renderHeadline(d),
    renderQuotes(d.quotes),
    renderChart(d.categories),
    renderSkeptic(d.skeptic),
    renderCategories(d.categories),
    renderSources(d.sources),
  ].join('\n');
}

function renderHeadline(d) {
  return `
  <div class="card" style="padding:20px; margin-bottom:14px;">
    <div style="font-size: 16px; color: var(--headline); line-height: 1.5; letter-spacing: 0.02em;">
      ${d.headline}
    </div>
  </div>`;
}

function renderQuotes(quotes) {
  return `
  <div class="quote-grid">
    ${quotes.map(q => `
      <div class="quote">
        <div class="body">"${q.quote}"</div>
        <div class="attrib">
          ${q.author} · ${q.role} · ${q.year}<br>
          <a href="${q.source_url}" target="_blank">${q.source}</a>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// SVG chart — log Y-axis from 1% to 500% of 2026 cost. Each category
// is a line. Land highlighted, going UP.
function renderChart(categories) {
  const W = 1200, H = 480;
  const PAD_L = 70, PAD_R = 220, PAD_T = 30, PAD_B = 50;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  // X axis: 2026 to 2045 (5 anchor years: 2026, 2030, 2035, 2040, 2045)
  const years = [2026, 2030, 2035, 2040, 2045];
  const xToPx = year => PAD_L + plotW * (year - 2026) / (2045 - 2026);

  // Y axis: log scale from 1 to 500 (% of 2026 cost)
  const yMin = 1, yMax = 500;
  const yToPx = v => PAD_T + plotH * (1 - Math.log(v / yMin) / Math.log(yMax / yMin));

  // Y gridlines at major decades
  const yTicks = [1, 5, 10, 25, 50, 100, 200, 500];
  const yGrid = yTicks.map(t => {
    const y = yToPx(t);
    const isReference = t === 100;
    return `
      <line x1="${PAD_L}" y1="${y}" x2="${PAD_L + plotW}" y2="${y}"
            stroke="${isReference ? 'var(--line-hot)' : 'var(--line)'}"
            stroke-width="${isReference ? 1 : 0.5}"
            stroke-dasharray="${isReference ? '' : '2 3'}"/>
      <text x="${PAD_L - 8}" y="${y + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${t}%</text>
    `;
  }).join('');

  // X labels
  const xLabels = years.map(yr => `
    <text x="${xToPx(yr)}" y="${H - PAD_B + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${yr}</text>
    <line x1="${xToPx(yr)}" y1="${PAD_T}" x2="${xToPx(yr)}" y2="${H - PAD_B}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="2 3"/>
  `).join('');

  // Category lines
  const lines = categories.map((cat, i) => {
    const color = colorVar(cat.color_class);
    const points = [{year: 2026, cost_index: cat.today_index}, ...cat.checkpoints];
    const path = points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${xToPx(p.year).toFixed(1)} ${yToPx(p.cost_index).toFixed(1)}`).join(' ');
    const dots = points.map(p => `<circle cx="${xToPx(p.year)}" cy="${yToPx(p.cost_index)}" r="3" fill="${color}"/>`).join('');
    // Label at the right end of the line
    const last = points[points.length - 1];
    const label = `<text x="${xToPx(last.year) + 8}" y="${yToPx(last.cost_index) + 4}" fill="${color}" font-size="10" font-family="var(--mono)">${cat.name} (${last.cost_index}%)</text>`;
    const isLand = cat.name === "LAND";
    const strokeWidth = isLand ? 3 : 1.6;
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>${dots}${label}`;
  }).join('');

  return `
  <div class="card">
    <h3>Cost trajectory by category · 2026 = 100%</h3>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">
      <rect x="${PAD_L}" y="${PAD_T}" width="${plotW}" height="${plotH}" fill="none" stroke="var(--line-hot)" stroke-width="0.5"/>
      ${yGrid}
      ${xLabels}
      ${lines}
    </svg>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Y-axis is logarithmic — each gridline is a roughly 2× change. The 100% line is the 2026 baseline.
      Lines below 100% deflate; lines above inflate.
      <strong style="color: var(--crit);">LAND</strong> is the only category that rises — Sam Altman's exact words: "the price of luxury goods and a few inherently limited resources like land may rise even more dramatically".
    </div>
  </div>`;
}

function renderSkeptic(s) {
  return `
  <div class="card" style="border-left: 3px solid var(--warn); margin-top:14px;">
    <h3>Skeptic counterpoint</h3>
    <div style="font-size:13px; color: var(--txt); line-height:1.5;">
      <strong style="color: var(--headline);">${s.author}</strong> (${s.role}, ${s.year}) — <em>${s.estimate}</em>
    </div>
    <div style="font-size:12px; color: var(--dim); margin-top: 8px; line-height: 1.5;">
      ${s.argument}
    </div>
    <div style="font-size:10px; color: var(--faint); margin-top: 8px; letter-spacing: 0.1em; text-transform: uppercase;">
      <a href="${s.source_url}" target="_blank" style="color: var(--faint);">${s.source}</a>
    </div>
  </div>`;
}

function renderCategories(categories) {
  return `
  <div class="card" style="margin-top:14px;">
    <h3>Category detail · per-source predictions</h3>
    <div class="cat-grid">
      ${categories.map(cat => `
        <div class="cat-card ${cat.color_class}">
          <div class="cat-head">
            <div class="cat-name">${cat.name}</div>
            <div style="font-size:10px; color:var(--dim);">2026 = 100%</div>
          </div>
          <div class="cat-mech">${cat.mechanism}</div>
          <table>
            <thead><tr>
              <th>Year</th><th class="num">Cost %</th><th>Anchored to</th>
            </tr></thead>
            <tbody>
              ${cat.checkpoints.map(cp => `
                <tr>
                  <td class="cat">${cp.year}</td>
                  <td class="num">${cp.cost_index}%</td>
                  <td style="font-size:10px;">${cp.anchor}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="cat-anchors"><strong>Sources:</strong> ${cat.sources.join(' · ')}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function renderSources(sources) {
  return `
  <div class="card" style="margin-top:14px;">
    <h3>All sources</h3>
    <ul style="margin:0; padding-left: 18px; font-size: 11px; line-height: 1.7;">
      ${sources.map(s => `<li><a href="${s.url}" target="_blank" style="color: var(--txt2);">${s.label}</a></li>`).join('')}
    </ul>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Full research synthesis in <code>docs/economy-model/simple_trace/automation_forecasts.md</code>.
      Forecast data at <code>forecasts.py</code> — edit values there to refine.
    </div>
  </div>`;
}
