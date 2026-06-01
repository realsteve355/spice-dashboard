// Colony v0 dashboard. POSTs config to /api/colony-v0, renders 4 macro charts
// + the per-citizen wealth heatmap.

const INPUTS = ['n_citizens', 'months', 'monthly_external_transfers', 'pension_per_inactive', 'mac_rate', 'mcc_mode', 'automation_end', 'automation_months', 'seed'];
const STORAGE_KEY = 'axion_colony_v0_v4';   // bump on schema changes

function readNum(id, def) {
  const v = parseFloat(document.getElementById(id).value);
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

function renderComparison(tradData, axionData) {
  const tbody = document.querySelector('#compare-table tbody');
  if (!tbody) return;
  const t = tradData.trajectory[tradData.trajectory.length - 1];
  const a = axionData.trajectory[axionData.trajectory.length - 1];
  const rows = [
    { label: 'Unemployment rate (of workforce)', t: 1 - t.employment_rate_workforce, a: 1 - a.employment_rate_workforce, fmt: pct, important: true, sign: -1, note: 'traditional definition: % of workforce-active adults seeking work but not employed' },
    { label: 'UBI per adult / mo', t: t.ubi_per_adult_mo, a: a.ubi_per_adult_mo, fmt: v => '$' + fmt(v), important: true, note: 'driven primarily by MAC, similar across modes' },
    { label: 'Liquid wealth / adult', t: t.liquid_wealth / Math.max(1, t.n_adults), a: a.liquid_wealth / Math.max(1, a.n_adults), fmt: v => '$' + fmt(v), important: true, note: 'cash + bank deposits per adult' },
    { label: 'Net worth / adult', t: t.net_worth / Math.max(1, t.n_adults), a: a.net_worth / Math.max(1, a.n_adults), fmt: v => '$' + fmt(v), important: true, note: 'liquid + external investments + property equity, per adult' },
    { label: 'Cumulative tax paid', t: t.income_tax_cum + (t.sales_tax_cum || 0), a: a.mcc_charge_cum || a.income_tax_cum, fmt: v => '$' + fmt(v), important: true, sign: -1, note: 'AXION should be lower — that\'s the citizen win' },
    { label: 'Money supply (colony)', t: t.money_supply, a: a.money_supply, fmt: v => '$' + fmt(v), note: 'higher = more capital retained locally' },
    { label: 'MOND outstanding', t: t.mond_outstanding || 0, a: a.mond_outstanding || 0, fmt: v => '$' + fmt(v), note: 'AXION local-currency portion of citizen savings' },
    { label: 'MAC cumulative', t: t.mac_cum, a: a.mac_cum, fmt: v => '$' + fmt(v), note: 'total MAC pool collected over the run' },
    { label: 'Pension cumulative', t: t.pension_cum, a: a.pension_cum, fmt: v => '$' + fmt(v), note: 'social-security inflow to non-workforce' },
  ];
  tbody.innerHTML = rows.map(r => {
    const delta = r.a - r.t;
    const sign = r.sign || 1;
    const winning = (sign * delta) > 0;
    const deltaColor = delta === 0 ? 'var(--dim)' : (winning ? 'var(--ok)' : 'var(--crit)');
    const sym = delta >= 0 ? '+' : '';
    const dStr = r.fmt === pct ? sym + pct(delta) : sym + (r.fmt(Math.abs(delta)).replace('$', delta < 0 ? '-$' : '$'));
    const label = r.important ? `<strong>${r.label}</strong>` : r.label;
    return `<tr style="border-bottom:1px solid #14171f;">
      <td style="padding:6px 8px; color:var(--headline);">${label}</td>
      <td style="padding:6px 8px; text-align:right; font-variant-numeric:tabular-nums;">${r.fmt(r.t)}</td>
      <td style="padding:6px 8px; text-align:right; font-variant-numeric:tabular-nums;">${r.fmt(r.a)}</td>
      <td style="padding:6px 8px; text-align:right; color:${deltaColor}; font-variant-numeric:tabular-nums;">${dStr}</td>
      <td style="padding:6px 8px; color:var(--dim); font-size:10px;">${r.note}</td>
    </tr>`;
  }).join('');
}

function readCfg() {
  return {
    n_citizens:                 readNum('n_citizens', 100),
    months:                     readNum('months', 240),
    monthly_external_transfers: readNum('monthly_external_transfers', 2800),
    pension_per_inactive:       readNum('pension_per_inactive', 400),
    mac_rate:                   readNum('mac_rate', 0.22),
    mcc_mode:                   document.getElementById('mcc_mode').checked,
    automation_end:             readNum('automation_end', 0.85),
    automation_months:          readNum('automation_months', 240),
    seed:                       readNum('seed', 42),
  };
}

async function fetchRunWithCfg(cfg) {
  const r = await fetch('/api/colony-v0', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 200)}`);
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
  const moneyDelta = last.money_supply - first.money_supply;
  const netBoP = last.net_bop_step;
  const cells = [
    {
      lbl: 'Population',
      val: `${last.n_total_pop}`,
      sub: `${last.n_adults} adults (${last.n_workforce} workforce + ${last.n_inactive} inactive) + ${last.n_dependents} kids`,
      color: 'var(--ok)',
    },
    {
      lbl: 'Unemployment (of workforce)', val: pct(1 - last.employment_rate_workforce),
      sub: `${pct(last.employment_rate_workforce)} employed of workforce · local ${last.workers_local} · chain ${last.workers_chain} · public ${last.workers_public} · ${pct(last.employment_rate)} of all adults`,
      color: last.employment_rate_workforce > 0.9 ? 'var(--ok)' : (last.employment_rate_workforce > 0.6 ? 'var(--warn)' : 'var(--crit)'),
    },
    {
      lbl: 'Money supply', val: '$' + fmt(last.money_supply),
      sub: `${moneyDelta >= 0 ? '+' : ''}$${fmt(moneyDelta)} vs start · transfers in $${fmt(last.transfers_in + (last.child_transfers || 0))}/mo`,
      color: Math.abs(moneyDelta) / Math.max(1, first.money_supply) < 0.20 ? 'var(--ok)' : 'var(--warn)',
    },
    {
      lbl: 'Net worth / adult',
      val: '$' + fmt((last.net_worth || 0) / Math.max(1, last.n_adults)),
      sub: `colony total $${fmt(last.net_worth || 0)} · ${(last.net_worth - first.net_worth) >= 0 ? '+' : ''}$${fmt((last.net_worth - first.net_worth) / Math.max(1, last.n_adults))} per adult vs start`,
      color: (last.net_worth >= first.net_worth) ? 'var(--ok)' : 'var(--warn)',
    },
    {
      lbl: 'Homeowners / renters',
      val: `${last.n_homeowners || 0} / ${(last.n_adults || 0) - (last.n_homeowners || 0)}`,
      sub: `mortgage interest cum. $${fmt(last.mortgage_int_step ? (last.mortgage_int_step * data.months) : 0)} (mostly drained externally)`,
      color: 'var(--ok)',
    },
    {
      lbl: 'UBI per adult (mo)',
      val: '$' + fmt(last.ubi_per_adult_mo || 0),
      sub: `k=${((last.mac_rate || 0) * 100).toFixed(0)}% · MAC pool cum. $${fmt(last.mac_cum || 0)}`,
      color: 'var(--ok)',
    },
    {
      lbl: 'Saved wealth / adult',
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
    // Fetch current mode AND the opposite tax mode in parallel for the
    // Traditional vs AXION MCC comparison.
    const cfg = readCfg();
    setStatus('running both tax modes…');
    const [tradData, axionData] = await Promise.all([
      fetchRunWithCfg({ ...cfg, mcc_mode: false }),
      fetchRunWithCfg({ ...cfg, mcc_mode: true }),
    ]);
    renderComparison(tradData, axionData);
    const data = cfg.mcc_mode ? axionData : tradData;
    const t = data.trajectory;

    renderChart('ch-employment', t, [
      { fn: p => p.workers_local + p.workers_chain + p.workers_public, color: '#a8e6a8', label: 'total' },
      { fn: p => p.workers_local, color: '#7eb24f', label: 'local', dash: '4 3' },
      { fn: p => p.workers_chain, color: '#ffb86c', label: 'chain', dash: '4 3' },
      { fn: p => p.workers_public, color: '#7aa2ff', label: 'public', dash: '4 3' },
    ], { title: 'Employment by firm type' });

    // Mond circulation: cumulative minted (= total UBI ever distributed) vs
    // currently outstanding in citizen wallets. Difference = Mond that's been
    // spent (retired by transactions).
    renderChart('ch-mond', t, [
      { fn: p => p.mond_minted_cum, color: '#b48ee6', label: 'cum. minted (= UBI distributed)' },
      { fn: p => p.mond_outstanding, color: '#cfa340', label: 'currently in wallets', dash: '4 3' },
    ], { dollar: true, title: 'Mond circulation (USD-pegged stablecoin)' });

    // Average citizen income by source, per adult per month
    const nA = data.productivities.length || 1;
    renderChart('ch-income', t, [
      { fn: p => ((p.wages_step || 0) + (p.ubi_step || 0) + (p.pension_paid_step || 0) + (p.child_transfers || 0)) / nA,
        color: '#a8e6a8', label: 'total / adult / mo' },
      { fn: p => (p.wages_step || 0) / nA,            color: '#7eb24f', label: 'wages', dash: '3 3' },
      { fn: p => (p.ubi_step || 0) / nA,              color: '#b48ee6', label: 'UBI', dash: '3 3' },
      { fn: p => (p.pension_paid_step || 0) / nA,     color: '#ffb86c', label: 'pensions', dash: '3 3' },
    ], { dollar: true, title: 'Citizen income per adult per month' });

    // MAC pool monthly trajectory (replaces velocity in the macro grid)
    renderChart('ch-velocity', t, [
      { fn: p => p.mac_step || 0, color: '#cfa340', label: 'MAC pool / mo' },
    ], { dollar: true, title: 'MAC pool collected per month' });

    // AXION mechanism chart — UBI trajectory
    renderChart('ch-ubi', t, [
      { fn: p => p.ubi_per_adult_mo, color: '#b48ee6', label: 'UBI per adult / mo' },
    ], { dollar: true, title: 'UBI per adult per month' });

    // MAC split chart — local vs national over time. Monthly deltas from cumulative.
    let prevLocal = 0, prevNational = 0;
    const localSteps = [], nationalSteps = [];
    for (const p of t) {
      const lc = p.mac_local_cum || 0;
      const nc = p.mac_national_cum || 0;
      localSteps.push(lc - prevLocal);
      nationalSteps.push(nc - prevNational);
      prevLocal = lc; prevNational = nc;
    }
    renderChart('ch-mac-split', t, [
      { fn: (_, i) => nationalSteps[i] || 0, color: '#b48ee6', label: 'national (frontier-tech)' },
      { fn: (_, i) => localSteps[i] || 0, color: '#cfa340', label: 'local firms', dash: '3 3' },
    ], { dollar: true, title: 'MAC contribution by source (monthly)' });

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
