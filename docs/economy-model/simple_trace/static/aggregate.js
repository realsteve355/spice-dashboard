// Aggregate page — sums per-sector trajectories into colony-wide views.
//
// Reads SECTOR_DEFAULTS + BASKET_WEIGHTS from sector-defaults.js (the shared module).
// Velocity slider controls Phase 2 plateau year — same control as /sectors page.

const YEAR_START     = window.SECTORS_META.YEAR_START;
const PHASE_BOUNDARY = window.SECTORS_META.PHASE_BOUNDARY;
const YEAR_END       = window.SECTORS_META.YEAR_END;
const BASKET_2026    = window.SECTORS_META.BASKET_2026_USD;
const MF_ADULTS      = window.SECTORS_META.MF_ADULTS;
const MF_WORKFORCE   = window.SECTORS_META.MF_WORKFORCE;
const YEARS = Array.from({length: YEAR_END - YEAR_START + 1}, (_, i) => YEAR_START + i);

const SECTORS = window.SECTOR_DEFAULTS;
const WEIGHTS = window.BASKET_WEIGHTS;

// Colour per sector for stacked area (groups similar sectors visually)
const SECTOR_COLOURS = {
  software:          '#7dd3fc',
  legal:             '#94a3b8',
  financial:         '#a5b4fc',
  big_retail:        '#f59e0b',
  wholesale:         '#fb923c',
  manufacturing:     '#ef4444',
  energy:            '#fde047',
  transport:         '#f87171',
  construction:      '#fb7185',
  food_processed:    '#84cc16',
  food_fresh:        '#22c55e',
  education:         '#06b6d4',
  healthcare:        '#a855f7',
  hospitality:       '#ec4899',
  personal_services: '#d946ef',
  care_work:         '#c084fc',
  government:        '#64748b',
  self_employed:     '#475569',
};

function logistic(t, midpoint, k, ceiling) {
  return ceiling / (1 + Math.exp(-k * (t - midpoint)));
}

// For a single sector, compute the employment fraction (% of 2026 baseline)
// remaining each year.
function sectorTrajectory(s, velocityYear) {
  const p1_mid = 2031;
  const p1_k = 3 / (PHASE_BOUNDARY - p1_mid);
  const p2_mid = (PHASE_BOUNDARY + velocityYear) / 2;
  const p2_k = velocityYear > PHASE_BOUNDARY ? 3 / (velocityYear - p2_mid) : 1;

  const p1_ceil = s.p1_ceil / 100;
  const p2_ceil = s.p2_ceil / 100;
  const p1_defl = s.p1_defl / 100;
  const p2_defl = s.p2_defl / 100;
  const floor = s.floor / 100;

  return YEARS.map(year => {
    const phase1_at = logistic(year, p1_mid, p1_k, p1_ceil);
    const phase2_at = logistic(year, p2_mid, p2_k, Math.max(0, p2_ceil - p1_ceil));
    const displaced = Math.min(1, phase1_at + phase2_at);
    const employment = 1 - displaced;

    let price;
    if (year <= PHASE_BOUNDARY) {
      price = Math.max(floor, Math.pow(1 - p1_defl, year - YEAR_START));
    } else {
      const at_boundary = Math.max(floor, Math.pow(1 - p1_defl, PHASE_BOUNDARY - YEAR_START));
      price = Math.max(floor, at_boundary * Math.pow(1 - p2_defl, year - PHASE_BOUNDARY));
    }

    return { year, employment, displaced, price };
  });
}

// Build the colony-wide aggregate data structure.
// For each year: array of (sector_id → jobs_remaining), total_employed, total_unemployed,
// basket_factor, basket_usd.
function computeAggregate(velocityYear) {
  // Per-sector trajectories
  const traj = {};
  for (const s of SECTORS) {
    traj[s.id] = sectorTrajectory(s, velocityYear);
  }

  return YEARS.map((year, yi) => {
    const sectorJobs = {};
    let totalEmployed = 0;
    for (const s of SECTORS) {
      const jobs = Math.round(s.jobs * traj[s.id][yi].employment);
      sectorJobs[s.id] = jobs;
      totalEmployed += jobs;
    }
    const totalUnemployed = MF_ADULTS - totalEmployed;
    const unempPct = totalUnemployed / MF_ADULTS;

    // Basket cost: weighted blend of category price factors
    let basketFactor = 0;
    let totalWeight = 0;
    for (const s of SECTORS) {
      if (!s.basket_category) continue;
      const w = WEIGHTS[s.basket_category];
      if (w == null) continue;
      const priceFactor = traj[s.id][yi].price;
      basketFactor += (w / 100) * priceFactor;
      totalWeight += w / 100;
    }
    // If sector mappings don't cover full 100%, scale up (or treat the
    // missing categories as held constant at 100% — choice: hold at 100%).
    // Here: normalise by totalWeight so missing categories don't drop the
    // overall factor.
    if (totalWeight > 0) basketFactor /= totalWeight;
    const basketUsd = BASKET_2026 * basketFactor;

    return {
      year,
      sectorJobs,
      totalEmployed,
      totalUnemployed,
      unempPct,
      basketFactor,
      basketUsd,
      phase: year <= PHASE_BOUNDARY ? 1 : 2,
    };
  });
}

// ── Employment chart (stacked area) ──
function drawEmploymentChart(data) {
  const svg = document.getElementById('emp-chart');
  const W = 1400, H = 380;
  const ml = 70, mr = 80, mt = 12, mb = 32;
  const pw = W - ml - mr, ph = H - mt - mb;

  const maxY = 18000;  // matches initial total
  const xs = year => ml + ((year - YEAR_START) / (YEAR_END - YEAR_START)) * pw;
  const ys = v    => mt + (1 - v / maxY) * ph;

  let parts = '';

  // Phase 2 background
  parts += `<rect x="${xs(2036)}" y="${mt}" width="${xs(2046) - xs(2036)}" height="${ph}" fill="#a855f7" fill-opacity="0.08"/>`;

  // Y grid (every 3,000)
  for (let v = 0; v <= 18000; v += 3000) {
    const y = ys(v);
    parts += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" stroke="var(--line-hot)" stroke-width="0.5" stroke-opacity="0.5"/>`;
    parts += `<text x="${ml - 6}" y="${y + 3}" font-size="10" fill="var(--dim)" text-anchor="end">${(v/1000).toFixed(0)}k</text>`;
  }

  // X labels
  for (const yr of [2026, 2031, 2036, 2041, 2046]) {
    const x = xs(yr);
    parts += `<text x="${x}" y="${mt + ph + 18}" font-size="11" fill="var(--dim)" text-anchor="middle">${yr}</text>`;
  }

  // Stacked areas (largest sector at the bottom of each stack for readability)
  const sectorOrder = [...SECTORS].sort((a,b) => b.jobs - a.jobs);

  // For each year, compute the cumulative position of each band's top
  const stackTops = data.map(d => {
    const m = {};
    let cum = 0;
    for (const s of sectorOrder) {
      cum += d.sectorJobs[s.id];
      m[s.id] = cum;
    }
    return m;
  });

  // Draw each band from top of stack downward
  let cumBelow = data.map(_ => 0);
  for (const s of sectorOrder) {
    const top = data.map(d => stackTops[YEARS.indexOf(d.year)][s.id]);
    const bot = cumBelow.slice();
    // Build polygon: top across years, then bottom backwards
    let path = `M ${xs(YEARS[0])} ${ys(top[0])}`;
    for (let i = 1; i < YEARS.length; i++) path += ` L ${xs(YEARS[i])} ${ys(top[i])}`;
    for (let i = YEARS.length - 1; i >= 0; i--) path += ` L ${xs(YEARS[i])} ${ys(bot[i])}`;
    path += ' Z';
    parts += `<path d="${path}" fill="${SECTOR_COLOURS[s.id] || '#888'}" fill-opacity="0.85" stroke="#06070a" stroke-width="0.5"/>`;
    cumBelow = top;
  }

  // Total-employment line on top
  const totalPath = 'M ' + data.map(d => `${xs(d.year)} ${ys(d.totalEmployed)}`).join(' L ');
  parts += `<path d="${totalPath}" stroke="#ede5d4" stroke-width="2" fill="none"/>`;

  // Phase boundary
  parts += `<line x1="${xs(2036)}" y1="${mt}" x2="${xs(2036)}" y2="${mt + ph}" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4 4"/>`;

  // Endpoint labels — total at 2026, 2036, 2046
  for (const yr of [2026, 2036, 2046]) {
    const d = data.find(x => x.year === yr);
    if (!d) continue;
    const x = xs(yr);
    const y = ys(d.totalEmployed);
    parts += `<circle cx="${x}" cy="${y}" r="3.5" fill="#ede5d4"/>`;
    const lbl = `${d.totalEmployed.toLocaleString()}`;
    const off = yr === 2046 ? -6 : (yr === 2026 ? 6 : 6);
    parts += `<text x="${x + off}" y="${y - 8}" font-size="11" fill="#ede5d4" text-anchor="${yr === 2046 ? 'end' : 'start'}">${lbl}</text>`;
  }

  // Y axis label
  parts += `<text x="14" y="${mt + ph / 2}" font-size="11" fill="var(--dim)" text-anchor="middle" transform="rotate(-90, 14, ${mt + ph / 2})">MF employed (count)</text>`;

  // Axes
  parts += `<line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="var(--line-hot)" stroke-width="1"/>`;
  parts += `<line x1="${ml}" y1="${mt + ph}" x2="${ml + pw}" y2="${mt + ph}" stroke="var(--line-hot)" stroke-width="1"/>`;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = parts;

  // Render legend
  const legend = document.getElementById('emp-legend');
  legend.innerHTML = sectorOrder.map(s => `
    <span><span class="area-swatch" style="background:${SECTOR_COLOURS[s.id] || '#888'}"></span>${s.label}</span>
  `).join('');
}

// ── Basket cost chart ──
function drawBasketChart(data) {
  const svg = document.getElementById('basket-chart');
  const W = 1400, H = 320;
  const ml = 70, mr = 80, mt = 12, mb = 32;
  const pw = W - ml - mr, ph = H - mt - mb;

  const maxY = BASKET_2026;  // 2026 is the highest in this trajectory
  const xs = year => ml + ((year - YEAR_START) / (YEAR_END - YEAR_START)) * pw;
  const ys = v    => mt + (1 - v / maxY) * ph;

  let parts = '';

  // Phase 2 background
  parts += `<rect x="${xs(2036)}" y="${mt}" width="${xs(2046) - xs(2036)}" height="${ph}" fill="#a855f7" fill-opacity="0.08"/>`;

  // Y grid (every $200)
  for (let v = 0; v <= maxY; v += 200) {
    const y = ys(v);
    parts += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" stroke="var(--line-hot)" stroke-width="0.5" stroke-opacity="0.5"/>`;
    parts += `<text x="${ml - 6}" y="${y + 3}" font-size="10" fill="var(--dim)" text-anchor="end">$${v}</text>`;
  }

  // X labels
  for (const yr of [2026, 2031, 2036, 2041, 2046]) {
    const x = xs(yr);
    parts += `<text x="${x}" y="${mt + ph + 18}" font-size="11" fill="var(--dim)" text-anchor="middle">${yr}</text>`;
  }

  // Area under line
  let areaPath = `M ${xs(data[0].year)} ${ys(0)}`;
  data.forEach(d => areaPath += ` L ${xs(d.year)} ${ys(d.basketUsd)}`);
  areaPath += ` L ${xs(data[data.length-1].year)} ${ys(0)} Z`;
  parts += `<path d="${areaPath}" fill="var(--blue)" fill-opacity="0.15"/>`;

  // Basket line
  const path = 'M ' + data.map(d => `${xs(d.year)} ${ys(d.basketUsd)}`).join(' L ');
  parts += `<path d="${path}" stroke="var(--blue)" stroke-width="2.5" fill="none"/>`;

  // Phase boundary
  parts += `<line x1="${xs(2036)}" y1="${mt}" x2="${xs(2036)}" y2="${mt + ph}" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4 4"/>`;

  // Endpoint labels
  for (const yr of [2026, 2036, 2046]) {
    const d = data.find(x => x.year === yr);
    if (!d) continue;
    const x = xs(yr);
    const y = ys(d.basketUsd);
    parts += `<circle cx="${x}" cy="${y}" r="4" fill="var(--blue)"/>`;
    parts += `<text x="${x + 8}" y="${y - 8}" font-size="11" fill="var(--blue)">$${Math.round(d.basketUsd)}</text>`;
  }

  // Axes + label
  parts += `<text x="14" y="${mt + ph / 2}" font-size="11" fill="var(--dim)" text-anchor="middle" transform="rotate(-90, 14, ${mt + ph / 2})">monthly basket (USD)</text>`;
  parts += `<line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="var(--line-hot)" stroke-width="1"/>`;
  parts += `<line x1="${ml}" y1="${mt + ph}" x2="${ml + pw}" y2="${mt + ph}" stroke="var(--line-hot)" stroke-width="1"/>`;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = parts;
}

// ── Snapshot table ──
function drawSnapshot(data) {
  const tbody = document.querySelector('#snap-table tbody');
  const yrs = [2026, 2031, 2036, 2041, 2046];
  let html = '';
  for (const yr of yrs) {
    const d = data.find(x => x.year === yr);
    if (!d) continue;
    const annualUbiUsd = d.basketUsd * 12 * MF_ADULTS;  // basket × 12 × adults
    const phaseTag = d.phase === 1
      ? '<span style="color: var(--blue);">P1</span>'
      : '<span style="color: #a855f7;">P2</span>';
    const isBoundary = yr === 2036;
    html += `<tr${isBoundary ? ' class="boundary"' : ''}>
      <td>${yr}</td>
      <td>${phaseTag}</td>
      <td>${d.totalEmployed.toLocaleString()}</td>
      <td>${d.totalUnemployed.toLocaleString()}</td>
      <td>${(d.unempPct * 100).toFixed(1)}%</td>
      <td>$${Math.round(d.basketUsd)}</td>
      <td>${(d.basketFactor * 100).toFixed(1)}%</td>
      <td>$${(annualUbiUsd / 1e6).toFixed(0)}M</td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

// ── Headline stats panel ──
function updateHeadline(data) {
  const d2046 = data.find(d => d.year === 2046);
  document.getElementById('emp-2046').textContent = d2046.totalEmployed.toLocaleString();
  document.getElementById('unemp-2046').textContent = `${(d2046.unempPct * 100).toFixed(0)}%`;
  document.getElementById('basket-2046').textContent = `$${Math.round(d2046.basketUsd)}`;
}

function render() {
  document.getElementById('velocity-val').textContent = document.getElementById('velocity').value;
  const velocity = parseInt(document.getElementById('velocity').value);
  const data = computeAggregate(velocity);
  drawEmploymentChart(data);
  drawBasketChart(data);
  drawSnapshot(data);
  updateHeadline(data);
}

document.getElementById('velocity').addEventListener('input', render);
render();
