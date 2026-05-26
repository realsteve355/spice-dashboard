// Sectors dashboard — per-sector bridge-year trajectories.
//
// Editable parameter table at the top; one mini-chart per sector in the grid below.
// Single velocity slider at the top controls Phase 2 plateau year across all charts.
//
// Two-phase model:
//   Phase 1 (2026–2036) — "imaginable" automation (LLMs at scale, robotaxis live,
//     AV trucking, automated warehouses, AI tutors)
//   Phase 2 (2036–velocity) — "unimaginable" (robotic surgeons, humanoid carers,
//     autonomous construction crews)

const YEAR_START = 2026;
const PHASE_BOUNDARY = 2036;
const YEAR_END = 2046;
const YEARS = Array.from({length: YEAR_END - YEAR_START + 1}, (_, i) => YEAR_START + i);

// Research-anchored defaults per sector.
// Numbers are %/year (deflation) and % (ceiling, floor).
// See basket_model.py (deflation) and GPT-doability literature (displacement).
const DEFAULTS = [
  { id: 'software',          label: 'Software / digital',         p1_defl: 15,  p1_ceil: 70, p2_defl: 25, p2_ceil: 92, floor:  3, jobs:  300,
    note: 'LLMs eat coding, design, content, analysis. P2: software writes software, marginal cost ≈ 0.' },
  { id: 'legal',             label: 'Legal / professional',       p1_defl:  7,  p1_ceil: 60, p2_defl: 15, p2_ceil: 85, floor: 10, jobs:  200,
    note: 'Contract review, research, drafting → automated. P2: AI judges, autonomous compliance.' },
  { id: 'financial',         label: 'Financial / banking',        p1_defl:  5,  p1_ceil: 50, p2_defl: 10, p2_ceil: 75, floor: 20, jobs:  250,
    note: 'Branch closures, robo-advisors, automated underwriting. P2: agentic banking, AI treasury.' },
  { id: 'big_retail',        label: 'Big retail (incl. pass-through)', p1_defl: 3.5, p1_ceil: 50, p2_defl: 7, p2_ceil: 75, floor: 40, jobs: 1200,
    note: 'Walmart-style. Slow own value-add deflation + fast upstream products. P2: lights-out warehouses, drone delivery.' },
  { id: 'manufacturing',     label: 'Manufacturing (auto + traditional)', p1_defl: 3, p1_ceil: 30, p2_defl: 5, p2_ceil: 55, floor: 25, jobs: 1500,
    note: 'Already heavily industrial-automated. Modest P1 (admin, QC vision). P2: lights-out factories + finish work.' },
  { id: 'energy',            label: 'Energy / utilities',         p1_defl:  6,  p1_ceil: 40, p2_defl: 8,  p2_ceil: 65, floor: 10, jobs:  350,
    note: 'Smart grids, automated generation, predictive maintenance. P2: line-worker robots, distributed renewables.' },
  { id: 'transport',         label: 'Transport / logistics',      p1_defl:  4,  p1_ceil: 40, p2_defl: 10, p2_ceil: 80, floor: 20, jobs:  600,
    note: 'Robotaxis rolling out 2024+. P1: AV trucking matures. P2: drone delivery, near-zero driver demand.' },
  { id: 'construction',      label: 'Construction',               p1_defl:  2,  p1_ceil: 25, p2_defl: 6,  p2_ceil: 60, floor: 30, jobs:  450,
    note: '3D-printed homes, modular. P2: robotic site workers, autonomous excavators — the impossible-today wave.' },
  { id: 'food_processed',    label: 'Food (processed)',           p1_defl:  2,  p1_ceil: 35, p2_defl: 5,  p2_ceil: 60, floor: 30, jobs:  250,
    note: 'Vertical farms, lab-grown meat at scale. P2: fully automated from raw inputs to packaged.' },
  { id: 'food_fresh',        label: 'Food (fresh)',               p1_defl:  0,  p1_ceil: 20, p2_defl: 2,  p2_ceil: 40, floor: 50, jobs:  180,
    note: 'Land-bound, consumer prefers human-touched local. P2: robotic picking at scale, autonomous greenhouses.' },
  { id: 'education',         label: 'Education',                  p1_defl:  3,  p1_ceil: 30, p2_defl: 6,  p2_ceil: 50, floor: 25, jobs:  350,
    note: 'AI tutors deflate content delivery hard. P2: AI mentors, automated accreditation.' },
  { id: 'healthcare',        label: 'Healthcare (provider)',      p1_defl:  1,  p1_ceil: 25, p2_defl: 8,  p2_ceil: 60, floor: 30, jobs:  800,
    note: 'P1: diagnostic AI assists. P2: robotic surgeons, AI primary care, autonomous nursing aides.' },
  { id: 'hospitality',       label: 'Hospitality / restaurants',  p1_defl: -1,  p1_ceil: 15, p2_defl: 2,  p2_ceil: 40, floor: 50, jobs:  400,
    note: 'Kitchen back-of-house automates. P2: full kitchen robotics, robotic baristas, AI hosts.' },
  { id: 'personal_services', label: 'Personal services',          p1_defl:  0,  p1_ceil: 10, p2_defl: 2,  p2_ceil: 30, floor: 50, jobs:  280,
    note: 'Hair, repair, beauty. Near-zero P1. P2: home robots for cleaning, basic care, simple repair.' },
  { id: 'care_work',         label: 'Care work',                  p1_defl:  0,  p1_ceil: 10, p2_defl: 3,  p2_ceil: 50, floor: 40, jobs:  320,
    note: 'Childcare, eldercare. AI assistance in P1. P2: humanoid carers — accepted when budgets are tight.' },
];

// Working copy of sector data (mutated by inputs)
let SECTORS = JSON.parse(JSON.stringify(DEFAULTS));

function logistic(t, midpoint, k, ceiling) {
  return ceiling / (1 + Math.exp(-k * (t - midpoint)));
}

function computeSector(s, velocityYear) {
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

    return { year, price, employment, displaced };
  });
}

function renderTable() {
  const tbody = document.querySelector('#param-table tbody');
  tbody.innerHTML = SECTORS.map((s, i) => `
    <tr data-idx="${i}">
      <td class="sector-name">${s.label}</td>
      <td><input type="number" min="0" step="50"  data-field="jobs"    value="${s.jobs}"></td>
      <td><input type="number" min="-10" max="50" step="0.5" data-field="p1_defl" value="${s.p1_defl}"></td>
      <td><input type="number" min="0" max="100"  step="5"   data-field="p1_ceil" value="${s.p1_ceil}"></td>
      <td><input type="number" min="-10" max="50" step="0.5" data-field="p2_defl" value="${s.p2_defl}"></td>
      <td><input type="number" min="0" max="100"  step="5"   data-field="p2_ceil" value="${s.p2_ceil}"></td>
      <td><input type="number" min="0" max="100"  step="5"   data-field="floor"   value="${s.floor}"></td>
      <td class="note">${s.note}</td>
    </tr>
  `).join('');

  // Wire up input change handlers
  tbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      const tr = input.closest('tr');
      const idx = +tr.dataset.idx;
      const field = input.dataset.field;
      SECTORS[idx][field] = parseFloat(input.value) || 0;
      renderChartForSector(idx);
      updateTotalJobs();
    });
  });

  updateTotalJobs();
}

function updateTotalJobs() {
  const total = SECTORS.reduce((sum, s) => sum + s.jobs, 0);
  document.getElementById('total-jobs').textContent = total.toLocaleString();
}

function drawSectorChart(svg, data, sector) {
  const W = 360, H = 180;
  const ml = 30, mr = 8, mt = 8, mb = 22;
  const pw = W - ml - mr, ph = H - mt - mb;

  const maxPrice = Math.max(1.0, ...data.map(d => d.price));
  const yMax = Math.max(1.0, Math.ceil(maxPrice * 10) / 10);

  const xs = year => ml + ((year - YEAR_START) / (YEAR_END - YEAR_START)) * pw;
  const ys = v    => mt + (1 - v / yMax) * ph;

  let parts = '';

  // Phase 2 shading
  const x2036 = xs(2036);
  const x2046 = xs(2046);
  parts += `<rect x="${x2036}" y="${mt}" width="${x2046 - x2036}" height="${ph}" fill="#a855f7" fill-opacity="0.08"/>`;

  // Y grid (every 25%)
  for (let t = 0; t <= yMax + 0.001; t += 0.25) {
    const y = ys(t);
    parts += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" stroke="var(--line-hot)" stroke-width="0.5" stroke-opacity="0.5"/>`;
    parts += `<text x="${ml - 4}" y="${y + 3}" font-size="9" fill="var(--dim)" text-anchor="end">${Math.round(t * 100)}</text>`;
  }

  // X labels
  for (const t of [2026, 2036, 2046]) {
    const x = xs(t);
    parts += `<text x="${x}" y="${mt + ph + 14}" font-size="9" fill="var(--dim)" text-anchor="middle">${t}</text>`;
  }

  // Bridge gap (positive only)
  let gapPath = `M ${xs(data[0].year)} ${ys(data[0].employment)}`;
  for (let i = 0; i < data.length; i++) gapPath += ` L ${xs(data[i].year)} ${ys(data[i].employment)}`;
  for (let i = data.length - 1; i >= 0; i--) gapPath += ` L ${xs(data[i].year)} ${ys(data[i].price)}`;
  gapPath += ' Z';
  parts += `<path d="${gapPath}" fill="var(--warn)" fill-opacity="0.20"/>`;

  // Lines
  const pricePath = 'M ' + data.map(d => `${xs(d.year)} ${ys(d.price)}`).join(' L ');
  parts += `<path d="${pricePath}" stroke="var(--blue)" stroke-width="2" fill="none"/>`;
  const empPath = 'M ' + data.map(d => `${xs(d.year)} ${ys(d.employment)}`).join(' L ');
  parts += `<path d="${empPath}" stroke="var(--crit)" stroke-width="2" fill="none"/>`;

  // Phase boundary dashed
  parts += `<line x1="${x2036}" y1="${mt}" x2="${x2036}" y2="${mt + ph}" stroke="#a855f7" stroke-width="1" stroke-dasharray="3 3" stroke-opacity="0.6"/>`;

  // Axes
  parts += `<line x1="${ml}" y1="${mt + ph}" x2="${ml + pw}" y2="${mt + ph}" stroke="var(--line-hot)" stroke-width="0.5"/>`;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = parts;
}

function renderChartForSector(idx) {
  const s = SECTORS[idx];
  const velocity = parseInt(document.getElementById('velocity').value);
  const data = computeSector(s, velocity);
  const card = document.querySelector(`.chart-card[data-idx="${idx}"]`);
  if (!card) return;
  const svg = card.querySelector('svg');
  drawSectorChart(svg, data, s);

  // Endpoint stats
  const d2026 = data[0];
  const d2046 = data[data.length - 1];
  card.querySelector('.ch-endpoints').innerHTML = `
    <span>
      2046: <span class="pt-price">${Math.round(d2046.price * 100)}% price</span> ·
      <span class="pt-emp">${Math.round(d2046.employment * 100)}% jobs</span>
    </span>
    <span style="color: var(--faint);">~${Math.round(s.jobs * d2046.employment)} of ${s.jobs} jobs remain</span>
  `;
}

function renderChartsGrid() {
  const grid = document.getElementById('charts-grid');
  grid.innerHTML = SECTORS.map((s, i) => `
    <div class="chart-card" data-idx="${i}">
      <div class="ch-title">${s.label}</div>
      <div class="ch-sub">${s.jobs.toLocaleString()} jobs · ${s.note.split('.')[0]}.</div>
      <svg></svg>
      <div class="ch-endpoints"></div>
    </div>
  `).join('');

  for (let i = 0; i < SECTORS.length; i++) {
    renderChartForSector(i);
  }
}

function renderAll() {
  renderChartsGrid();
}

document.getElementById('velocity').addEventListener('input', () => {
  document.getElementById('velocity-val').textContent = document.getElementById('velocity').value;
  for (let i = 0; i < SECTORS.length; i++) {
    renderChartForSector(i);
  }
});

document.getElementById('reset-btn').addEventListener('click', () => {
  SECTORS = JSON.parse(JSON.stringify(DEFAULTS));
  renderTable();
  renderChartsGrid();
});

// Initial render
renderTable();
renderAll();
