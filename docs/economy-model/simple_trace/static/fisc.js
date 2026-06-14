// /fisc — The Fisc: annual income (MAC), outgoings (UBI / welfare) and balance.
//
// Brings together three flows already shown on other pages:
//   1. MAC income/yr  — from the MaryFontaine business mix (profitability page)
//   2. Basket cost/yr — the per-person UBI (cost-deflation page)
//   3. Unemployed/yr  — the working-age cohort (unemployment page)
// Outgoings = UBI × recipients; reserves earn a 10yr-bond yield; balance is the
// running cumulative. Self-contained (mirrors the other pages' numbers — these
// should be consolidated into one shared model later). Fully client-side.

// ── MaryFontaine model (mirror of profitability.js + unemployment.js) ──
const REF_PPE = 200000, BASE_RATE = 0.22, RATE_CAP = 0.50, HORIZON = 20;
const ADULTS = 180000, WORKING_AGE = 140000, CHILDREN = 50000;
const BASKET_TODAY = 1600;                 // per person / month, 2026

const DEFLATION = {
  goods:       [{ y: 2026, v: 100 }, { y: 2030, v: 60 }, { y: 2035, v: 30 }, { y: 2040, v: 15 }, { y: 2045, v: 10 }],
  transport:   [{ y: 2026, v: 100 }, { y: 2030, v: 30 }, { y: 2035, v: 15 }, { y: 2040, v: 10 }, { y: 2045, v: 8 }],
  craftLabour: [{ y: 2026, v: 100 }, { y: 2045, v: 90 }],
  hospLand:    [{ y: 2026, v: 100 }, { y: 2045, v: 105 }],
};
const MARYFONTAINE = [
  { count: 340, profitPerFirm: 45e3, empPerFirm: 14, driver: 'hospLand', margin0: 0.35 },
  { count: 440, profitPerFirm: 70e3, empPerFirm: 9, driver: 'goods', margin0: 0.35 },
  { count: 500, profitPerFirm: 90e3, empPerFirm: 7, driver: 'craftLabour', margin0: 0.40 },
  { count: 230, profitPerFirm: 250e3, empPerFirm: 11, driver: 'goods', margin0: 0.35 },
  { count: 165, profitPerFirm: 350e3, empPerFirm: 16, driver: 'craftLabour', margin0: 0.40 },
  { count: 110, profitPerFirm: 60e3, empPerFirm: 22, driver: 'craftLabour', margin0: 0.40 },
  { count: 75, profitPerFirm: 600e3, empPerFirm: 28, driver: 'goods', margin0: 0.30 },
  { count: 14, profitPerFirm: 18e6, empPerFirm: 90, driver: 'transport', margin0: 0.25 },
  { count: 1, profitPerFirm: 800e6, empPerFirm: 3850, driver: 'goods', margin0: 0.30 },
  { count: 1, profitPerFirm: 600e6, empPerFirm: 2680, driver: 'goods', margin0: 0.25 },
  { count: 1, profitPerFirm: 690e6, empPerFirm: 2950, driver: 'goods', margin0: 0.28 },
];
// Research aggregate basket trajectory (cost_index, 2026 = 100) — mirrors forecasts.py.
const BASKET_TRAJ = [{ y: 2026, v: 100 }, { y: 2030, v: 62.9 }, { y: 2035, v: 39.1 }, { y: 2040, v: 23.0 }, { y: 2045, v: 15.7 }];
// Colony planning unemployment ramp (% of working-age).
const UNEMP_RAMP = [{ t: 0, v: 4.2 }, { t: 5, v: 18 }, { t: 10, v: 35 }, { t: 15, v: 55 }, { t: 20, v: 75 }];

const STORAGE_KEY = 'axion_fisc_v1';

// ── Helpers ──────────────────────────────────────────────────────────────
function interpYear(a, year) {
  if (year <= a[0].y) return a[0].v;
  if (year >= a[a.length - 1].y) return a[a.length - 1].v;
  for (let i = 0; i < a.length - 1; i++) if (year >= a[i].y && year <= a[i + 1].y) {
    return a[i].v + (a[i + 1].v - a[i].v) * (year - a[i].y) / (a[i + 1].y - a[i].y);
  }
  return a[a.length - 1].v;
}
function interpT(a, t) {
  if (t <= a[0].t) return a[0].v;
  if (t >= a[a.length - 1].t) return a[a.length - 1].v;
  for (let i = 0; i < a.length - 1; i++) if (t >= a[i].t && t <= a[i + 1].t) {
    return a[i].v + (a[i + 1].v - a[i].v) * (t - a[i].t) / (a[i + 1].t - a[i].t);
  }
  return a[a.length - 1].v;
}
function fmtSignedBn(v) { return (v < 0 ? '-$' : '$') + (Math.abs(v) / 1e9).toFixed(2) + 'B'; }
function fmtBn(v) { return '$' + (v / 1e9).toFixed(2) + 'B'; }
function fmtMoney(v) {
  const s = v < 0 ? '-' : '', a = Math.abs(v);
  if (a >= 1e9) return s + '$' + (a / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(0) + 'M';
  return s + '$' + Math.round(a).toLocaleString();
}
function fmtUSD(v) { return '$' + Math.round(v).toLocaleString(); }
function macRate(profit, emp, k) { return Math.min(RATE_CAP, k * BASE_RATE * (profit / emp) / REF_PPE); }
function marginMult(driver, margin0, t) {
  const cost = interpYear(DEFLATION[driver], 2026 + t) / 100;
  return (1 - (1 - margin0) * cost) / margin0;
}
function macIncomeAt(k, t) {
  let mac = 0;
  for (const s of MARYFONTAINE) {
    const p = s.count * s.profitPerFirm * marginMult(s.driver, s.margin0, t);
    mac += p * macRate(p, s.count * s.empPerFirm, k);
  }
  return mac;
}

// ── Fisc P&L per year ──────────────────────────────────────────────────────
function fiscByYear(cfg) {
  const out = [];
  let balance = 0;
  for (let t = 0; t <= HORIZON; t++) {
    const mac = macIncomeAt(cfg.k, t);
    const ubiYr = BASKET_TODAY * interpYear(BASKET_TRAJ, 2026 + t) / 100 * 12;   // per person / yr
    const unemployed = WORKING_AGE * interpT(UNEMP_RAMP, t) / 100;
    const recipients = cfg.coverage === 'universal' ? (ADULTS + CHILDREN * 0.5) : unemployed;
    const outgoings = ubiYr * recipients;
    const interest = balance * cfg.yield;
    const net = mac + interest - outgoings;
    balance += net;
    out.push({ year: 2026 + t, mac, ubiYr, unemployed, recipients, outgoings, interest, net, balance });
  }
  return out;
}

// ── SVG line chart ─────────────────────────────────────────────────────────
function lineChart(opts) {
  const W = 1280, H = opts.height || 340;
  const PAD = { l: 84, r: opts.padR || 220, t: 26, b: 42 };
  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const [x0, x1] = opts.xDomain, [y0, y1] = opts.yDomain;
  const xPx = x => PAD.l + plotW * (x - x0) / (x1 - x0);
  const yPx = y => PAD.t + plotH * (1 - (y - y0) / (y1 - y0));
  const grid = (opts.yTicks || []).map(t => `
    <line x1="${PAD.l}" y1="${yPx(t)}" x2="${PAD.l + plotW}" y2="${yPx(t)}" stroke="${t === 0 ? 'var(--line-hot)' : 'var(--line)'}" stroke-width="${t === 0 ? 1 : 0.5}" stroke-dasharray="${t === 0 ? '' : '2 3'}"/>
    <text x="${PAD.l - 8}" y="${yPx(t) + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${opts.yFmt ? opts.yFmt(t) : t}</text>`).join('');
  const xLabels = (opts.xTicks || []).map(x => `<text x="${xPx(x)}" y="${H - PAD.b + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${x}</text>`).join('');
  const labels = [];
  const paths = opts.series.map(s => {
    const d = s.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPx(p.x).toFixed(1)} ${yPx(p.y).toFixed(1)}`).join(' ');
    const last = s.pts[s.pts.length - 1];
    if (s.label) labels.push({ label: s.label, color: s.color, desiredY: yPx(last.y), endX: xPx(last.x) });
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.5}" ${s.dashed ? 'stroke-dasharray="6 4"' : ''}/>`;
  }).join('');
  labels.sort((a, b) => a.desiredY - b.desiredY);
  if (labels.length) { labels[0].placedY = labels[0].desiredY; for (let i = 1; i < labels.length; i++) labels[i].placedY = Math.max(labels[i].desiredY, labels[i - 1].placedY + 15); }
  const labelEls = labels.map(L => `
    <line x1="${L.endX + 4}" y1="${L.desiredY}" x2="${PAD.l + plotW + 12}" y2="${L.placedY}" stroke="${L.color}" stroke-width="0.5" opacity="0.5"/>
    <text x="${PAD.l + plotW + 14}" y="${L.placedY + 4}" fill="${L.color}" font-size="10" font-family="var(--mono)">${L.label}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">${grid}${xLabels}${paths}${labelEls}</svg>`;
}

const YEAR_TICKS = [2026, 2031, 2036, 2041, 2046];
const yBn = v => (v < 0 ? '-$' : '$') + (Math.abs(v) / 1e9).toFixed(1) + 'B';

function flowsChart(rows) {
  const maxV = Math.max(...rows.map(r => Math.max(r.mac + Math.max(r.interest, 0), r.outgoings)));
  const yMax = Math.ceil(maxV / 1e9) * 1e9;
  const yTicks = []; for (let v = 0; v <= yMax + 0.5e9; v += yMax > 6e9 ? 2e9 : 1e9) yTicks.push(v);
  return lineChart({
    height: 360, xDomain: [2026, 2046], yDomain: [0, yMax], xTicks: YEAR_TICKS, yTicks, yFmt: yBn,
    series: [
      { label: 'MAC income', color: 'var(--ok)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.mac })) },
      { label: 'UBI outgoings', color: 'var(--crit)', width: 2.5, pts: rows.map(r => ({ x: r.year, y: r.outgoings })) },
    ],
  });
}
function balanceChart(rows) {
  const vals = rows.map(r => r.balance);
  const maxV = Math.max(0, ...vals), minV = Math.min(0, ...vals);
  const yMax = Math.ceil(maxV / 1e9) * 1e9 || 1e9, yMin = Math.floor(minV / 1e9) * 1e9;
  const step = (yMax - yMin) > 40e9 ? 10e9 : (yMax - yMin) > 12e9 ? 5e9 : 2e9;
  const yTicks = []; for (let v = yMin; v <= yMax + step / 2; v += step) yTicks.push(v);
  return lineChart({
    height: 320, padR: 180, xDomain: [2026, 2046], yDomain: [yMin, yMax], xTicks: YEAR_TICKS, yTicks, yFmt: yBn,
    series: [{ label: 'Fisc balance', color: 'var(--blue)', width: 3, pts: rows.map(r => ({ x: r.year, y: r.balance })) }],
  });
}

function fiscTable(rows) {
  const body = rows.map(r => {
    const netC = r.net >= 0 ? 'var(--ok)' : 'var(--crit)';
    const balC = r.balance >= 0 ? 'var(--ok)' : 'var(--crit)';
    return `
    <tr>
      <td class="cat">${r.year}</td>
      <td class="num">${fmtMoney(r.mac)}</td>
      <td class="num">${Math.round(r.recipients).toLocaleString()}</td>
      <td class="num">${fmtMoney(r.outgoings)}</td>
      <td class="num">${fmtMoney(r.interest)}</td>
      <td class="num" style="color:${netC};">${fmtMoney(r.net)}</td>
      <td class="num" style="color:${balC};"><strong>${fmtMoney(r.balance)}</strong></td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:8%;"><col style="width:15%;"><col style="width:15%;"><col style="width:15%;"><col style="width:13%;"><col style="width:15%;"><col style="width:19%;"></colgroup>
    <thead><tr>
      <th>Year</th>
      <th class="num">MAC income</th>
      <th class="num">UBI recipients</th>
      <th class="num">UBI outgoings</th>
      <th class="num">Interest</th>
      <th class="num">Net</th>
      <th class="num">Fisc balance</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

// ── Render ───────────────────────────────────────────────────────────────
function readCfg() {
  const kEl = document.getElementById('k'), yEl = document.getElementById('yield');
  const covEl = document.querySelector('input[name="coverage"]:checked');
  const k = kEl ? parseFloat(kEl.value) : 1.0;
  const y = yEl ? parseFloat(yEl.value) : 4.1;
  return { k: isNaN(k) ? 1.0 : k, yield: (isNaN(y) ? 4.1 : y) / 100, coverage: covEl ? covEl.value : 'unemployed' };
}

function render() {
  const cfg = readCfg();
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.innerHTML = v; };
  const kOut = document.getElementById('k_v'), yOut = document.getElementById('yield_v');
  if (kOut) kOut.textContent = '×' + cfg.k.toFixed(2);
  if (yOut) yOut.textContent = (cfg.yield * 100).toFixed(1) + '%';

  const rows = fiscByYear(cfg);
  set('chart-flows', flowsChart(rows));
  set('chart-balance', balanceChart(rows));
  set('fisc-table', fiscTable(rows));

  const y20 = rows[HORIZON];
  const everyYearPositive = rows.every(r => r.net >= 0);
  const deficits = rows.filter(r => r.balance < 0).length;
  set('headline-stats', [
    ['MAC income · 2046', fmtMoney(y20.mac), 'var(--ok)'],
    ['UBI outgoings · 2046', fmtMoney(y20.outgoings), 'var(--crit)'],
    ['Net · 2046', fmtMoney(y20.net), y20.net >= 0 ? 'var(--ok)' : 'var(--crit)'],
    ['Fisc balance · 2046', fmtMoney(y20.balance), y20.balance >= 0 ? 'var(--ok)' : 'var(--crit)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.style.borderLeftColor = y20.balance >= 0 ? 'var(--ok)' : 'var(--crit)';
    const cov = cfg.coverage === 'universal' ? 'universal UBI (all adults + children at 50%)' : 'UBI paid to the unemployed';
    verdict.innerHTML = everyYearPositive
      ? `With ${cov} at k=${cfg.k.toFixed(2)} and a ${(cfg.yield * 100).toFixed(1)}% reserve yield, the Fisc runs a `
        + `<strong>surplus every year</strong> — the MAC income covers outgoings with room to spare, and reserves `
        + `compound to a <strong>${fmtMoney(y20.balance)}</strong> balance by 2046.`
      : `With ${cov} at k=${cfg.k.toFixed(2)}, the Fisc runs a deficit in early years (balance negative for `
        + `${deficits} year${deficits === 1 ? '' : 's'}), then recovers as MAC income grows — ending at `
        + `<strong>${fmtMoney(y20.balance)}</strong> by 2046.`;
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Charge multiplier (k) — drives MAC income</span>
      <input type="range" id="k" min="0.5" max="2.0" step="0.05" value="1.0">
      <span class="ctrl-val" id="k_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Reserve yield (10yr bond, % / yr)</span>
      <input type="range" id="yield" min="0" max="8" step="0.1" value="4.1">
      <span class="ctrl-val" id="yield_v"></span>
    </label>
    <div class="ctrl ctrl-toggle">
      <span class="ctrl-label">UBI coverage</span>
      <span class="toggle">
        <label><input type="radio" name="coverage" value="unemployed" checked> Unemployed only</label>
        <label><input type="radio" name="coverage" value="universal"> Universal (all adults)</label>
      </span>
    </div>
    <div class="assumptions">
      <span>UBI / person = the <a href="cost-deflation" style="color:var(--ok);">basket</a> (~$1,600/mo → falls)</span>
      <span>Unemployed from the <a href="unemployment" style="color:var(--ok);">cohort ramp</a> (4.2%→75%)</span>
      <span>MAC income from the <a href="profitability" style="color:var(--ok);">business mix</a></span>
      <span>Reserves earn the bond yield; balance is cumulative</span>
    </div>`;
  document.getElementById('k').addEventListener('input', render);
  document.getElementById('yield').addEventListener('input', render);
  document.querySelectorAll('input[name="coverage"]').forEach(el => el.addEventListener('change', render));
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
