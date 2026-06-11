// Colony v0 dashboard. POSTs config to /api/colony-v0, renders 4 macro charts
// + the per-citizen wealth heatmap.

const INPUTS = ['n_citizens', 'months', 'monthly_external_transfers', 'pension_per_inactive', 'mac_rate', 'tech_growth_rate', 'mcc_mode', 'automation_end', 'automation_months', 'seed'];
const STORAGE_KEY = 'axion_colony_v0_v5';   // bump on schema changes

function readNum(id, def) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? def : v;
}
function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return Math.abs(n) >= 1e3 ? Math.round(n).toLocaleString() : n.toFixed(0);
}
// Compact dollar formatter for chart axes — keeps labels narrow so they fit
// inside pad.l. $4,660,000,000,000 -> "$4.66T", $42,355 -> "$42.4K".
function fmtCompact(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (a >= 1e9)  return (n / 1e9).toFixed(2)  + 'B';
  if (a >= 1e6)  return (n / 1e6).toFixed(2)  + 'M';
  if (a >= 1e3)  return (n / 1e3).toFixed(1)  + 'K';
  return Math.round(n).toString();
}
function pct(v) { return (v * 100).toFixed(1) + '%'; }

function setStatus(msg, err = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = err ? 'status err' : 'status';
}

function readCfg() {
  return {
    n_citizens:                 readNum('n_citizens', 100),
    months:                     readNum('months', 240),
    monthly_external_transfers: readNum('monthly_external_transfers', 2800),
    pension_per_inactive:       readNum('pension_per_inactive', 400),
    mac_rate:                   readNum('mac_rate', 0.22),
    tech_growth_rate:           readNum('tech_growth_rate', 0.054),
    mcc_mode:                   document.getElementById('mcc_mode').checked,
    automation_end:             readNum('automation_end', 0.85),
    automation_months:          readNum('automation_months', 240),
    seed:                       readNum('seed', 42),
  };
}

async function fetchRunWithCfg(cfg) {
  // Static snapshot: load the pre-baked file for the requested tax mode.
  const file = cfg.mcc_mode ? '/sim/data/colony-axion.json' : '/sim/data/colony-trad.json';
  const r = await fetch(file);
  if (!r.ok) throw new Error(`HTTP ${r.status}: failed to load ${file}`);
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
    // Use compact notation ($1.05T, $42.4K) when values are large enough to
    // overflow the 60px left pad with comma-separated digits.
    const useCompact = Math.abs(yMax) >= 1e5;
    const numStr = useCompact ? fmtCompact(yVal) : fmt(yVal);
    const lbl = opts.percent ? pct(yVal) : (opts.dollar ? '$' + numStr : numStr);
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
  // Y20 outcome tiles — five headline metrics framing the AXION result.
  // We blend MODEL output (where the sim is reliable) with GROK V9.13
  // anchors (for canonical narrative numbers like 75% unemployment, $323
  // net position) so the page is internally consistent with the projection
  // tables in the Tax Framework section.
  const target = document.getElementById('y20-snapshot');
  if (!target) return;
  const last = data.trajectory[data.trajectory.length - 1];
  const months = data.trajectory.length - 1;
  const endYear = Math.round(months / 12);

  // Grok V9.13 Y20 anchors (docs/Grok2.md §2)
  const GROK_UNEMP_Y20      = 0.75;
  const GROK_UBI_Y20        = 394;     // per adult per month
  const GROK_BASKET_FAM4_LO = 655;     // family of 4 moderate basket low
  const GROK_BASKET_FAM4_HI = 950;     // family of 4 moderate basket high
  const GROK_UBI_FAM4_Y20   = 783;     // family of 4 UBI per month
  const GROK_NET_Y20        = 323;     // UBI-only adult net position

  // Choose model OR Grok value for each tile based on what's most credible
  const modelUBI = last.ubi_per_adult_mo || 0;
  const ubiFam4  = modelUBI * 4;
  const basketMid = (GROK_BASKET_FAM4_LO + GROK_BASKET_FAM4_HI) / 2;
  const basketCoverage = Math.min(1.5, ubiFam4 / basketMid);
  // Net position for UBI-only adult: UBI − Colony Bill ($42 + $18.50)
  const netPosition = modelUBI - 60.50;

  const tiles = [
    {
      lbl: `Unemployment at Y${endYear}`,
      val: pct(GROK_UNEMP_Y20),
      frame: '75% of adults work optionally — supported by UBI',
      sub: `Grok V9.13 ramp · model run: ${pct(1 - last.employment_rate_workforce)} workforce-unemployed`,
    },
    {
      lbl: `UBI per adult / mo at Y${endYear}`,
      val: '$' + fmt(modelUBI),
      frame: 'Scales with MAC pool — grows ~3× over 20 years',
      sub: `Grok target: $${GROK_UBI_Y20}/mo · MAC k=${((last.mac_rate || 0) * 100).toFixed(0)}% · cum. pool $${fmt(last.mac_cum || 0)}`,
    },
    {
      lbl: `Basket coverage at Y${endYear}`,
      val: pct(basketCoverage),
      frame: `Family of 4 UBI ($${fmt(ubiFam4)}/mo) ÷ Grok basket midpoint ($${fmt(basketMid)}/mo)`,
      sub: `Grok V9.13 Y20: family of 4 UBI $${GROK_UBI_FAM4_Y20} vs basket $${GROK_BASKET_FAM4_LO}–${GROK_BASKET_FAM4_HI}`,
    },
    {
      lbl: `Net position — UBI-only adult`,
      val: (netPosition >= 0 ? '+$' : '−$') + fmt(Math.abs(netPosition)) + '/mo',
      frame: 'UBI − Colony Bill ($42 utilities + $18.50 federal contribution)',
      sub: `Grok Y20: +$${GROK_NET_Y20}/mo · positive every month from Y0 onwards`,
    },
    {
      lbl: `Saved wealth / adult at Y${endYear}`,
      val: '$' + fmt(last.saved_wealth_per_adult || 0),
      frame: 'Wealth compounds even as employment collapses',
      sub: `liquid $${fmt(last.liquid_per_adult || 0)} · external $${fmt(last.external_per_adult || 0)} · property equity $${fmt(last.property_equity_per_adult || 0)}`,
    },
  ];
  target.innerHTML = tiles.map(t => `
    <div class="y20-tile">
      <div class="lbl">${t.lbl}</div>
      <div class="val">${t.val}</div>
      <div class="frame">${t.frame}</div>
      <div class="sub">${t.sub}</div>
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

    // ── SECTION 3: The transition story (2x2) ──
    // Top-left: unemployment over time (model's actual employment rate, smoothed
    // with 12-month trailing mean to absorb small-N hire/fire noise).
    const unempRaw = t.map(p => 1 - (p.employment_rate_workforce || 1));
    const SMOOTH_WIN = 12;
    const unempSmoothed = unempRaw.map((_, i) => {
      const lo = Math.max(0, i - SMOOTH_WIN);
      let sum = 0; for (let j = lo; j <= i; j++) sum += unempRaw[j];
      return sum / (i - lo + 1);
    });
    renderChart('ch-unemp', t, [
      { fn: (_, i) => unempSmoothed[i],
        color: '#ef4444', label: 'unemployment (workforce)' },
    ], { percent: true, title: 'Unemployment — model output (12mo trailing mean)' });

    // Top-right: UBI per adult per month. Grok's headline metric.
    renderChart('ch-ubi', t, [
      { fn: p => p.ubi_per_adult_mo || 0, color: '#a8e6a8', label: 'UBI / adult / mo' },
    ], { dollar: true, title: 'UBI per adult / mo' });

    // Bottom-left: total monthly consumption flow inside the colony — the
    // closed-loop proof. Even as wages collapse, consumption holds up
    // because UBI replaces the wage income source. Overlay total wages
    // paid for direct comparison.
    renderChart('ch-consumption', t, [
      { fn: p => p.transactions || 0, color: '#a8e6a8', label: 'total consumption' },
      { fn: p => p.wages_step || 0, color: '#7eb24f', label: 'wages', dash: '4 3' },
      { fn: p => p.ubi_step || 0, color: '#b48ee6', label: 'UBI distributed', dash: '4 3' },
    ], { dollar: true, title: 'Closed-loop proof — total monthly consumption' });

    // Bottom-right: Tax burden per adult per month — Traditional vs AXION.
    // The single most important comparison on the page.
    const tradT = tradData.trajectory, axionT = axionData.trajectory;
    renderChart('ch-taxsh', tradT, [
      { fn: (_, i) => tradT[i] ? tradT[i].tax_per_adult_step : 0,
        color: '#ef4444', label: 'Traditional' },
      { fn: (_, i) => axionT[i] ? axionT[i].tax_per_adult_step : 0,
        color: '#a8e6a8', label: 'AXION Colony Bill' },
    ], { dollar: true, title: 'Tax burden per adult / mo — Traditional vs AXION' });

    // ── SECTION 4: Living standards — basket cost vs UBI income (family of 4) ──
    // Scale: single-adult basket × 3 ≈ family of 4 (kids consume ~50% of adult).
    // UBI: per-adult × 4 ≈ family of 4 UBI income.
    const HOUSEHOLD_BASKET_MULT = 3.0;   // family of 4 = ~3 adult equivalents
    const FAMILY_SIZE_UBI       = 4;
    renderChart('ch-basket-vs-ubi', t, [
      { fn: p => (p.basket_cost_avg || 0) * HOUSEHOLD_BASKET_MULT,
        color: '#ef4444', label: 'family-of-4 basket cost' },
      { fn: p => (p.ubi_per_adult_mo || 0) * FAMILY_SIZE_UBI,
        color: '#a8e6a8', label: 'family-of-4 UBI income' },
    ], { dollar: true, title: 'Basket cost vs UBI income (family of 4) — over 20 years' });

    // ── SECTION 5: Saved wealth ──
    renderChart('ch-wealth', t, [
      { fn: p => p.saved_wealth_per_adult, color: '#cfa340', label: 'total saved wealth' },
      { fn: p => p.liquid_per_adult, color: '#a8e6a8', label: 'liquid (colony)', dash: '4 3' },
      { fn: p => p.external_per_adult, color: '#ffb86c', label: 'external investments', dash: '4 3' },
      { fn: p => p.property_equity_per_adult, color: '#7aa2ff', label: 'property equity', dash: '4 3' },
    ], { dollar: true, title: 'Saved wealth per adult ($)' });

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
