// Colony v0 dashboard — STATIC SNAPSHOT version for zpc.finance publication.
// Fetches pre-baked JSON trajectories instead of running the Mesa model live.
// See docs/economy-model/simple_trace/bake_static_snapshot.py for how
// data-trad.json and data-axion.json are produced.

const INPUTS = ['mcc_mode'];                 // only the mode toggle remains live
const STORAGE_KEY = 'axion_colony_v0_static_v1';

// The snapshot was baked with these defaults — shown to the user.
const STATIC_DEFAULTS = {
  n_citizens: 100, months: 240, monthly_external_transfers: 2800,
  pension_per_inactive: 400, mac_rate: 0.22, tech_growth_rate: 0.054,
  automation_end: 0.85, automation_months: 240, seed: 42,
};

function readNum(id, def) {
  const el = document.getElementById(id);
  if (!el) return def;
  const v = parseFloat(el.value);
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

function readCfg() {
  return {
    ...STATIC_DEFAULTS,
    mcc_mode: document.getElementById('mcc_mode').checked,
  };
}

async function fetchRunWithCfg(cfg) {
  // Static snapshot: fetch the pre-baked file matching the requested mcc_mode.
  // The cfg's other fields are ignored — the snapshot is baked at fixed
  // defaults, so non-default tweaks would have no effect here.
  const file = cfg.mcc_mode ? './data-axion.json' : './data-trad.json';
  const r = await fetch(file);
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}: failed to load ${file}`);
  }
  return r.json();
}

async function fetchRun() {
  return fetchRunWithCfg(readCfg());
}

// ── Generic line-chart renderer (multiple series allowed) ──────────────
function renderChart(svgId, traj, series, opts = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const W = 700, H = 240;
  const pad = { l: 60, r: 12, t: 22, b: 28 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const months = traj.length - 1;

  // Y domain — fn may be called as fn(p) or fn(p, i)
  let yMin = Infinity, yMax = -Infinity;
  for (const s of series) {
    for (let i = 0; i < traj.length; i++) {
      const v = s.fn(traj[i], i);
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
  }
  if (!isFinite(yMin) || !isFinite(yMax)) { yMin = 0; yMax = 1; }
  if (yMin > 0 && !opts.noZero) yMin = 0;
  if (opts.noZero) yMin = yMin * 0.95;   // shrink baseline so range fits
  yMax = yMax * 1.05 + 0.0001;

  const xScale = m => pad.l + (m / months) * innerW;
  const yScale = v => pad.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  let grid = '';
  // Adaptive label density and format. For long horizons (≥120mo) label every
  // 24 months and show as Y0/Y2/... year labels; for medium show every 6mo;
  // for short show every 3mo.
  const xStep = months >= 120 ? 24 : (months >= 36 ? 12 : 3);
  const yearLabels = months >= 60;
  for (let m = 0; m <= months; m += xStep) {
    grid += `<line x1="${xScale(m)}" y1="${pad.t}" x2="${xScale(m)}" y2="${pad.t + innerH}" stroke="#14171f"/>`;
    const lbl = yearLabels ? `Y${Math.round(m / 12)}` : `M${m}`;
    grid += `<text x="${xScale(m)}" y="${H - 10}" fill="#5a6373" font-size="10" text-anchor="middle">${lbl}</text>`;
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
      `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(s.fn(p, i)).toFixed(1)}`).join(' ');
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
  const endYear = Math.round((data.trajectory.length - 1) / 12);
  const endTag = `at Y${endYear}`;
  const cells = [
    {
      lbl: 'Population',
      val: `${last.n_total_pop}`,
      sub: `${last.n_adults} adults · ${last.n_workforce} workforce + ${last.n_retirees ?? 0} retirees + ${last.n_other_inactive ?? 0} other-inactive + ${last.n_dependents} kids`,
      color: 'var(--ok)',
    },
    {
      lbl: `Unemployment ${endTag}`, val: pct(1 - last.employment_rate_workforce),
      sub: `${pct(last.employment_rate_workforce)} of workforce employed · local ${last.workers_local} · chain ${last.workers_chain} · public ${last.workers_public}`,
      color: last.employment_rate_workforce > 0.9 ? 'var(--ok)' : (last.employment_rate_workforce > 0.6 ? 'var(--warn)' : 'var(--crit)'),
    },
    {
      lbl: 'Homeowners / renters',
      val: `${last.n_homeowners || 0} / ${(last.n_adults || 0) - (last.n_homeowners || 0)}`,
      sub: `mortgage interest cum. $${fmt(last.mortgage_int_step ? (last.mortgage_int_step * data.months) : 0)}`,
      color: 'var(--ok)',
    },
    {
      lbl: `UBI per adult / mo ${endTag}`,
      val: '$' + fmt(last.ubi_per_adult_mo || 0),
      sub: `k=${((last.mac_rate || 0) * 100).toFixed(0)}% · MAC pool cum. $${fmt(last.mac_cum || 0)} · started at $0`,
      color: 'var(--ok)',
    },
    {
      lbl: `Saved wealth / adult ${endTag}`,
      val: '$' + fmt(last.saved_wealth_per_adult || 0),
      sub: `liquid $${fmt(last.liquid_per_adult || 0)} + external $${fmt(last.external_per_adult || 0)} + property equity $${fmt(last.property_equity_per_adult || 0)}`,
      color: 'var(--ok)',
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
    bank:    '#c08838',
    ubi:     '#b48ee6',
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
    } else if (f.type === 'bank') {
      flow = `mortgages: $${fmt(f.outstanding_mortgages || 0)} outstanding · −$${fmt(f.drained_cum || 0)} drained ext.`;
    } else if (f.type === 'ubi') {
      flow = `k=${(f.mac_rate * 100).toFixed(0)}% · +$${fmt(f.ubi_cum || 0)} cum. UBI to all citizens`;
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
    if (f.type === 'bank') {
      revCum = '$' + fmt((f.mortgage_int_cum || 0) + (f.rent_cum || 0));
    }
    if (f.type === 'ubi') {
      revCum = '$' + fmt(f.mac_cum || 0);
    }
    const macPaid = f.mac_paid_cum !== undefined ? '$' + fmt(f.mac_paid_cum) : '—';
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
      <td style="padding:6px 8px; text-align:right; color:#b48ee6; font-variant-numeric:tabular-nums;">${macPaid}</td>
      <td style="padding:6px 8px; color:var(--dim); font-size:10px;">${flow}</td>
    </tr>`;
  }).join('');
}

async function refresh() {
  try {
    saveInputs();
    // Fetch both tax modes in parallel so the Tax burden chart can compare
    // them. The rest of the dashboard renders from whichever mode the user
    // currently has selected.
    const cfg = readCfg();
    setStatus('running both tax modes…');
    const [tradData, axionData] = await Promise.all([
      fetchRunWithCfg({ ...cfg, mcc_mode: false }),
      fetchRunWithCfg({ ...cfg, mcc_mode: true }),
    ]);
    const data = cfg.mcc_mode ? axionData : tradData;
    const t = data.trajectory;

    // ── National trajectories — macro context (above colony detail) ──
    // Three charts pull from the same trajectory series:
    //   1. CBO/BLS baseline national unemployment — linear ramp 4% → 5.5%
    //      over the run, independent of controls. The conventional view.
    //   2. National AI/robotics corporate profits — productivity_idx
    //      (compounds at tech_growth_rate) × $1T base. These are the firms
    //      paying MAC into colony UBI pools.
    //   3. AXION-thesis national unemployment scenario — the colony's
    //      workforce-unemployment rate + a 4% structural floor. Driven by
    //      automation_end / automation_months. Shows what national
    //      unemployment looks like if displacement plays out as modelled.
    const monthsRun = t.length - 1;
    const NATIONAL_AI_PROFIT_Y0 = 1.0e12;   // $1T base — Big Tech + NVDA + AI/robotics adjacent
    renderChart('ch-nat-unemp-base', t, [
      { fn: (_, i) => 0.04 + (0.015 * i / Math.max(1, monthsRun)),
        color: '#7aa2ff', label: 'CBO baseline' },
    ], { percent: true, title: 'National unemployment (CBO baseline projection)' });
    renderChart('ch-nat-profits', t, [
      { fn: p => NATIONAL_AI_PROFIT_Y0 * (p.productivity_idx || 1),
        color: '#cfa340', label: 'AI + robotics' },
    ], { dollar: true, title: 'National AI / robotics corporate profits ($)' });
    // AXION-thesis national unemployment is hardcoded to Grok V9.13's
    // MaryFontaine 20-year projection table (Y0=4.2%, Y5=18%, Y10=35%,
    // Y15=55%, Y20=75%) and linearly interpolated to monthly resolution.
    // Source: docs/Grok2.md Section 2 ramp dynamics.
    const GROK_UNEMP = [
      { y: 0,  v: 0.042 },
      { y: 5,  v: 0.180 },
      { y: 10, v: 0.350 },
      { y: 15, v: 0.550 },
      { y: 20, v: 0.750 },
    ];
    const grokAt = (monthIdx) => {
      const y = monthIdx / 12;
      for (let k = 0; k < GROK_UNEMP.length - 1; k++) {
        const a = GROK_UNEMP[k], b = GROK_UNEMP[k + 1];
        if (y >= a.y && y <= b.y) {
          const f = (y - a.y) / (b.y - a.y);
          return a.v + (b.v - a.v) * f;
        }
      }
      return GROK_UNEMP[GROK_UNEMP.length - 1].v;
    };
    renderChart('ch-nat-unemp-ai', t, [
      { fn: (_, i) => grokAt(i),
        color: '#ef4444', label: 'AXION (Grok V9.13)' },
      { fn: (_, i) => 0.04 + (0.015 * i / Math.max(1, monthsRun)),
        color: '#7aa2ff', label: 'CBO', dash: '4 3' },
    ], { percent: true, title: 'National unemployment — AXION vs CBO' });

    renderChart('ch-employment', t, [
      { fn: p => p.workers_local + p.workers_chain + p.workers_public, color: '#a8e6a8', label: 'total' },
      { fn: p => p.workers_local, color: '#7eb24f', label: 'local', dash: '4 3' },
      { fn: p => p.workers_chain, color: '#ffb86c', label: 'chain', dash: '4 3' },
      { fn: p => p.workers_public, color: '#7aa2ff', label: 'public', dash: '4 3' },
    ], { title: 'Employment by firm type' });

    // Average income per adult per month — colony-wide. Aggregate income
    // flow (wages + pensions + UBI) divided by total adults. The cohort
    // composition behind this average is in the bottom-left chart.
    const nAd = p => Math.max(1, p.n_adults || 1);
    renderChart('ch-income', t, [
      { fn: p => ((p.wages_step || 0) + (p.pension_paid_step || 0) + (p.ubi_step || 0)) / nAd(p),
        color: '#a8e6a8', label: 'avg' },
    ], { dollar: true, title: 'Avg income / person / mo' });

    // Cohort sizes over time — the recipient counts behind the income chart.
    // Workers fall as automation displaces them; pensioners fall as the
    // legacy Group 1 cohort ages out at 8.5%/yr; the "everyone else" pool
    // (unemployed workforce + other-inactive) grows to absorb both flows.
    renderChart('ch-velocity', t, [
      { fn: p => p.n_adults || 0,
        color: '#a8e6a8', label: 'total' },
      { fn: p => (p.workers_local || 0) + (p.workers_chain || 0) + (p.workers_public || 0),
        color: '#7eb24f', label: 'workers', dash: '3 3' },
      { fn: p => p.n_retirees || 0,
        color: '#ffb86c', label: 'pensioners', dash: '3 3' },
      { fn: p => (p.n_adults || 0)
                 - ((p.workers_local || 0) + (p.workers_chain || 0) + (p.workers_public || 0))
                 - (p.n_retirees || 0),
        color: '#b48ee6', label: 'others', dash: '3 3' },
    ], { title: 'Cohort sizes (adults)' });

    // AXION mechanism chart — UBI trajectory
    renderChart('ch-ubi', t, [
      { fn: p => p.ubi_per_adult_mo, color: '#b48ee6', label: 'UBI per adult / mo' },
    ], { dollar: true, title: 'UBI per adult per month' });

    // Saved wealth chart (single wide chart, three components)
    renderChart('ch-wealth', t, [
      { fn: p => p.saved_wealth_per_adult, color: '#cfa340', label: 'total saved wealth' },
      { fn: p => p.liquid_per_adult, color: '#a8e6a8', label: 'liquid (colony)', dash: '4 3' },
      { fn: p => p.external_per_adult, color: '#ffb86c', label: 'external investments', dash: '4 3' },
      { fn: p => p.property_equity_per_adult, color: '#7aa2ff', label: 'property equity', dash: '4 3' },
    ], { dollar: true, title: 'Saved wealth per adult ($)' });

    // Detailed metrics — basket cost broken out by channel + weighted
    renderChart('ch-basket', t, [
      { fn: p => p.basket_cost_local, color: '#7eb24f', label: 'local indy' },
      { fn: p => p.basket_cost_chain, color: '#ffb86c', label: 'chain', dash: '4 3' },
      { fn: p => p.basket_cost_import, color: '#ef4444', label: 'import', dash: '4 3' },
      { fn: p => p.basket_cost_avg, color: '#a8e6a8', label: 'consumer-weighted' },
    ], { dollar: true, title: 'Basket cost by channel' });

    renderChart('ch-prod', t, [
      { fn: p => p.productivity_idx, color: '#a8e6a8', label: 'productivity index' },
    ], { title: 'Productivity index (1.0 = Y0)', noZero: true });

    renderChart('ch-profits', t, [
      { fn: p => p.corp_profit_step, color: '#cfa340', label: 'corporate profit / mo' },
      { fn: p => p.mac_step, color: '#b48ee6', label: 'MAC collected / mo', dash: '4 3' },
    ], { dollar: true, title: 'Corporate profits + MAC collected (this colony, $)' });

    // Tax chart shows BOTH modes so the AXION reduction is visible regardless
    // of which mode is currently selected.
    const tradT = tradData.trajectory, axionT = axionData.trajectory;
    renderChart('ch-taxsh', tradT, [
      { fn: (_, i) => tradT[i] ? tradT[i].tax_per_adult_step : 0, color: '#ef4444', label: 'Traditional / adult / mo' },
      { fn: (_, i) => axionT[i] ? axionT[i].tax_per_adult_step : 0, color: '#a8e6a8', label: 'AXION Colony Bill / adult / mo' },
    ], { dollar: true, title: 'Tax burden per adult / month — Traditional vs AXION Colony Bill' });

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
    for (const id of INPUTS) {
      const el = document.getElementById(id);
      if (!el) continue;
      o[id] = el.type === 'checkbox' ? el.checked : el.value;
    }
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
      if (!el) continue;
      if (el.type === 'checkbox') el.checked = !!v;
      else if (v !== undefined && v !== null && v !== '') el.value = v;
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
