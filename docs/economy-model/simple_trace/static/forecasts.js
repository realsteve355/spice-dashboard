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
    renderBasketStat(d.basket_trajectory),
    renderChart(d.categories, d.basket_trajectory),
    renderSkeptic(d.skeptic),
    renderCategories(d.categories),
    renderSources(d.sources),
  ].join('\n');
}

function renderBasketStat(traj) {
  if (!traj || traj.length === 0) return '';
  const todayBasket = 980;
  const stat = pt => `
    <div class="stat">
      <div class="label">${pt.year}</div>
      <div class="value">${pt.cost_index.toFixed(0)}%</div>
      <div class="sub">$${Math.round(todayBasket * pt.cost_index / 100).toLocaleString()}/mo</div>
    </div>
  `;
  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Aggregate basket — typical year's purchases (excl. land)</h3>
    <div class="stats" style="grid-template-columns: repeat(${traj.length}, 1fr);">
      ${traj.map(stat).join('')}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Weighted aggregate of the 11 categories below (LAND excluded — handled by separate model).
      Today's basket of ~$980/mo collapses to ~$${Math.round(todayBasket * traj[traj.length-1].cost_index / 100)}/mo by 2045 under the bull consensus —
      <strong>${(100 - traj[traj.length-1].cost_index).toFixed(0)}% deflation in 20 years</strong>.
      That means a UBI calibrated to this basket also falls in nominal $.
    </div>
  </div>`;
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
// is a line. Land highlighted (going UP). Basket aggregate as thick line.
// Labels at the right edge are collision-resolved.
function renderChart(categories, basketTrajectory) {
  const W = 1280, H = 520;
  const PAD_L = 70, PAD_R = 260, PAD_T = 30, PAD_B = 50;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const years = [2026, 2030, 2035, 2040, 2045];
  const xToPx = year => PAD_L + plotW * (year - 2026) / (2045 - 2026);

  const yMin = 1, yMax = 500;
  const yToPx = v => PAD_T + plotH * (1 - Math.log(v / yMin) / Math.log(yMax / yMin));

  // Y gridlines
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

  // Build series list including basket as a special line (drawn on top)
  const series = categories.map(cat => ({
    label: cat.name,
    color: colorVar(cat.color_class),
    points: [{year: 2026, cost_index: cat.today_index}, ...cat.checkpoints],
    strokeWidth: cat.name === "LAND" ? 3 : 1.6,
    isBasket: false,
  }));
  if (basketTrajectory && basketTrajectory.length > 0) {
    series.push({
      label: "BASKET (aggregate)",
      color: "var(--headline)",
      points: basketTrajectory,
      strokeWidth: 3.5,
      isBasket: true,
    });
  }

  // Lines + dots (no inline labels — those are collision-resolved below)
  const lines = series.map(s => {
    const path = s.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${xToPx(p.year).toFixed(1)} ${yToPx(p.cost_index).toFixed(1)}`).join(' ');
    const dots = s.points.map(p => `<circle cx="${xToPx(p.year)}" cy="${yToPx(p.cost_index)}" r="${s.isBasket ? 4 : 3}" fill="${s.color}"/>`).join('');
    const dasharray = s.isBasket ? 'stroke-dasharray="6 3"' : '';
    return `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="${s.strokeWidth}" ${dasharray}/>${dots}`;
  }).join('');

  // ----- Collision-resolved right-edge labels -----
  // For each series, compute the desired label Y (where the line ends).
  // Then sort by desired Y and walk through, ensuring minimum vertical separation.
  const minSpacing = 14;
  const labels = series.map(s => {
    const last = s.points[s.points.length - 1];
    return {
      label: `${s.label} (${last.cost_index}%)`,
      color: s.color,
      lineEndX: xToPx(last.year),
      lineEndY: yToPx(last.cost_index),
      desiredY: yToPx(last.cost_index),
      isBasket: s.isBasket,
    };
  });
  // Sort by desired Y ascending
  labels.sort((a, b) => a.desiredY - b.desiredY);
  // Walk through and push down any that overlap
  for (let i = 1; i < labels.length; i++) {
    const minY = labels[i - 1].placedY + minSpacing;
    labels[i].placedY = Math.max(labels[i].desiredY, minY);
  }
  labels[0].placedY = labels[0].desiredY;
  // Render with leader lines
  const labelEls = labels.map(L => {
    const labelX = xToPx(2045) + 14;
    const leader = `<line x1="${L.lineEndX + 4}" y1="${L.lineEndY}" x2="${labelX - 2}" y2="${L.placedY}" stroke="${L.color}" stroke-width="0.5" opacity="0.5"/>`;
    const fontWeight = L.isBasket ? 'bold' : 'normal';
    return `${leader}<text x="${labelX}" y="${L.placedY + 4}" fill="${L.color}" font-size="10" font-weight="${fontWeight}" font-family="var(--mono)">${L.label}</text>`;
  }).join('');

  return `
  <div class="card">
    <h3>Cost trajectory by category · 2026 = 100%</h3>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">
      <rect x="${PAD_L}" y="${PAD_T}" width="${plotW}" height="${plotH}" fill="none" stroke="var(--line-hot)" stroke-width="0.5"/>
      ${yGrid}
      ${xLabels}
      ${lines}
      ${labelEls}
    </svg>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Y-axis logarithmic — each gridline ≈ 2× change. <strong style="color: var(--headline);">BASKET</strong> (dashed white)
      is the weighted aggregate of all categories. <strong style="color: var(--crit);">LAND</strong> is the only category that rises —
      Altman's words: "inherently limited resources like land may rise dramatically".
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
