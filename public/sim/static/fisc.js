// /fisc — The Fisc: annual income (MAC), outgoings (UBI / welfare) and balance.
//
// Brings together three flows from the shared MaryFontaine model (maryfontaine.js):
//   1. MAC income/yr  — countyByYear (business mix)
//   2. Basket cost/yr — basketPerPersonYr (the per-person UBI)
//   3. Unemployed/yr  — unemployedAt (working-age cohort × the ramp)
// Outgoings = UBI × recipients; reserves earn a 10yr-bond yield; balance is the
// running cumulative. Fully client-side / interactive.

const { HORIZON, ADULTS, CHILDREN, BOND_YIELD, countyByYear, unemployedAt,
        basketPerPersonYr, fmtBn, fmtMoney, lineChart } = MF;

const STORAGE_KEY = 'axion_fisc_v1';

// Implementation Profiles — rules for how the Fisc deploys UBI. Each returns the
// number of basket-equivalents to pay in year t (children count as 0.5). Add a
// new profile here and it appears in the dropdown automatically.
const PROFILES = [
  {
    id: 'p1', name: 'Profile 1 — Unemployed only',
    desc: 'UBI / welfare paid only to the unemployed during the transition; the employed support themselves on wages.',
    recipients: t => unemployedAt(t),
  },
  {
    id: 'p2', name: 'Profile 2 — All; children at 50%',
    desc: 'Universal: every adult receives a full basket and every child under 18 receives 50%.',
    recipients: () => ADULTS + 0.5 * CHILDREN,
  },
];

// ── Fisc P&L per year ──────────────────────────────────────────────────────
function fiscByYear(cfg) {
  const county = countyByYear(cfg.k);
  const out = [];
  let balance = 0;
  for (let t = 0; t <= HORIZON; t++) {
    const mac = county[t].mac;
    const ubiYr = basketPerPersonYr(t);                  // per person / yr
    const unemployed = unemployedAt(t);
    const recipients = cfg.profile.recipients(t);
    const outgoings = ubiYr * recipients;
    const interest = balance * cfg.yield;
    const net = mac + interest - outgoings;
    balance += net;
    out.push({ year: 2026 + t, mac, ubiYr, unemployed, recipients, outgoings, interest, net, balance });
  }
  return out;
}

// ── Charts ───────────────────────────────────────────────────────────────
const YEAR_TICKS = [2026, 2031, 2036, 2041, 2046];
const yBn = v => (v < 0 ? '-$' : '$') + (Math.abs(v) / 1e9).toFixed(1) + 'B';

function flowsChart(rows) {
  const maxV = Math.max(...rows.map(r => Math.max(r.mac + Math.max(r.interest, 0), r.outgoings)));
  const yMax = Math.ceil(maxV / 1e9) * 1e9 || 1e9;
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
  const pEl = document.getElementById('profile');
  const k = kEl ? parseFloat(kEl.value) : 1.0;
  const y = yEl ? parseFloat(yEl.value) : 4.1;
  const profile = PROFILES.find(p => p.id === (pEl ? pEl.value : PROFILES[0].id)) || PROFILES[0];
  return { k: isNaN(k) ? 1.0 : k, yield: (isNaN(y) ? 4.1 : y) / 100, profile };
}

function render() {
  const cfg = readCfg();
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.innerHTML = v; };
  const kOut = document.getElementById('k_v'), yOut = document.getElementById('yield_v');
  if (kOut) kOut.textContent = '×' + cfg.k.toFixed(2);
  if (yOut) yOut.textContent = (cfg.yield * 100).toFixed(1) + '%';

  set('profile-desc', cfg.profile.desc);
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
    verdict.innerHTML = everyYearPositive
      ? `Under <strong>${cfg.profile.name}</strong> at k=${cfg.k.toFixed(2)} and a ${(cfg.yield * 100).toFixed(1)}% reserve yield, the Fisc runs a `
        + `<strong>surplus every year</strong> — the MAC income covers outgoings with room to spare, and reserves `
        + `compound to a <strong>${fmtMoney(y20.balance)}</strong> balance by 2046.`
      : `Under <strong>${cfg.profile.name}</strong> at k=${cfg.k.toFixed(2)}, the Fisc runs a deficit in early years (balance negative for `
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
    <label class="ctrl ctrl-toggle">
      <span class="ctrl-label">Implementation profile — who receives UBI</span>
      <select id="profile" class="mf-select">
        ${PROFILES.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
      </select>
    </label>
    <div id="profile-desc" style="font-size:11px; color:var(--dim); margin:2px 0 0; max-width:760px; line-height:1.5;"></div>
    <div class="assumptions">
      <span>UBI / person = the <a href="cost-deflation" style="color:var(--ok);">basket</a> (~$1,600/mo → falls)</span>
      <span>Unemployed from the <a href="unemployment" style="color:var(--ok);">cohort ramp</a> (4.2%→75%)</span>
      <span>MAC income from the <a href="profitability" style="color:var(--ok);">business mix</a></span>
      <span>Reserves earn the bond yield; balance is cumulative</span>
    </div>`;
  document.getElementById('k').addEventListener('input', render);
  document.getElementById('yield').addEventListener('input', render);
  document.getElementById('profile').addEventListener('change', render);
}

function init() { buildControls(); render(); MF.load().then(render); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
