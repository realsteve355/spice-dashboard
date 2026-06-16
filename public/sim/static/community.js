// /community — "A community of 1,000: the robot's wage".
//
// The closed-loop model that reconciles. Output (value added) splits THREE ways:
//   output = wages + MAC + profit
// The MAC is the "robot's wage" — a business expense that replaces the wages
// automation removes, handed to the displaced as UBI. As employment falls, the
// wage share drains into the MAC (→ UBI) and profit; demand is maintained (every
// basket of output is consumed by someone) and firms stay profitable because the
// MAC funds a basic basket, which is cheaper than the wage it replaces.
//
// Worked in BASKETS (1 basket = one person's annual basic consumption) so the
// deflation cancels; the $ value of a basket is shown alongside (it falls from
// ~$19,200 to ~$3,000 as goods get cheaper — see the Cost Deflation page).

const { WORKING_AGE, RETIRED, CHILDREN, TOTAL_POP, basketPerPersonYr, unempRateAt,
        HORIZON, fmtMoney } = MF;

const PER = 1000;
const S = PER / TOTAL_POP;                 // scale MaryFontaine → 1,000 people
const WA = WORKING_AGE * S;                // working-age in the community (~609)
const RET = RETIRED * S;                   // retired (~174)
const CH = CHILDREN * S;                   // children (~217)
const STORAGE_KEY = 'axion_community_v1';

// ── Model ──────────────────────────────────────────────────────────────────
// cfg.output = average output per person (baskets); cfg.wage = wage per worker (baskets).
function model(cfg) {
  const rows = [];
  for (let t = 0; t <= HORIZON; t++) {
    const emp = WA * (1 - unempRateAt(t) / 100);     // employed workers
    const unemp = WA * unempRateAt(t) / 100;         // displaced workers
    const wages = emp * cfg.wage;                    // baskets
    const ubi = unemp * 1 + RET * 1 + CH * 0.5;      // support to all non-earners (children @50%)
    const output = PER * cfg.output;                 // baskets (real, roughly constant)
    const profit = output - wages - ubi;             // the residual → capital
    const basketUSD = basketPerPersonYr(t);          // $/yr per basket (deflates)
    rows.push({
      year: 2026 + t, unemp: unempRateAt(t), emp, output, wages, ubi, profit, basketUSD,
      wagesUSD: wages * basketUSD, ubiUSD: ubi * basketUSD, profitUSD: profit * basketUSD, outputUSD: output * basketUSD,
    });
  }
  return rows;
}

// ── Stacked-band chart (output split, baskets) ─────────────────────────────
function splitChart(rows) {
  const W = 1280, H = 380, PAD = { l: 84, r: 170, t: 26, b: 42 };
  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const x0 = 2026, x1 = 2046;
  const yMax = Math.max(...rows.map(r => r.output)) * 1.04 || 1;
  const xPx = x => PAD.l + plotW * (x - x0) / (x1 - x0);
  const yPx = y => PAD.t + plotH * (1 - y / yMax);
  const yTicks = []; const step = yMax > 1500 ? 500 : 250; for (let v = 0; v <= yMax; v += step) yTicks.push(v);
  const grid = yTicks.map(v => `
    <line x1="${PAD.l}" y1="${yPx(v)}" x2="${PAD.l + plotW}" y2="${yPx(v)}" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="2 3"/>
    <text x="${PAD.l - 8}" y="${yPx(v) + 4}" fill="var(--dim)" font-size="10" text-anchor="end" font-family="var(--mono)">${v}</text>`).join('');
  const xLabels = [2026, 2031, 2036, 2041, 2046].map(x => `<text x="${xPx(x)}" y="${H - PAD.b + 16}" fill="var(--dim)" font-size="10" text-anchor="middle" font-family="var(--mono)">${x}</text>`).join('');
  const band = (loFn, hiFn, color) => {
    const top = rows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xPx(r.year).toFixed(1)} ${yPx(hiFn(r)).toFixed(1)}`).join(' ');
    const bot = rows.slice().reverse().map(r => `L ${xPx(r.year).toFixed(1)} ${yPx(loFn(r)).toFixed(1)}`).join(' ');
    return `<path d="${top} ${bot} Z" fill="${color}" fill-opacity="0.5" stroke="${color}" stroke-width="1"/>`;
  };
  const wages = band(() => 0, r => r.wages, 'var(--blue)');
  const mac = band(r => r.wages, r => r.wages + r.ubi, 'var(--ok)');
  const profit = band(r => r.wages + r.ubi, r => r.output, 'var(--warn)');
  const last = rows[rows.length - 1];
  const lbl = (y, text, color) => `<text x="${PAD.l + plotW + 12}" y="${yPx(y) + 4}" fill="${color}" font-size="11" font-family="var(--mono)">${text}</text>`;
  const labels = lbl(last.wages / 2, 'Wages', 'var(--blue)')
    + lbl(last.wages + last.ubi / 2, 'MAC → UBI', 'var(--ok)')
    + lbl(last.wages + last.ubi + last.profit / 2, 'Profit', 'var(--warn)');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; background:var(--panel2);">${grid}${xLabels}${wages}${mac}${profit}${labels}</svg>`;
}

// ── Table (baskets, with $/basket reference) ───────────────────────────────
function table(rows) {
  const pick = [0, 5, 10, 15, 20].map(t => rows[t]);
  const b = v => Math.round(v).toLocaleString();
  const body = pick.map(r => {
    const negative = r.profit < 0;
    return `
    <tr>
      <td class="cat">${r.year}</td>
      <td class="num">${r.unemp.toFixed(0)}%</td>
      <td class="num">${b(r.output)}</td>
      <td class="num" style="color:var(--blue);">${b(r.wages)}</td>
      <td class="num" style="color:var(--ok);">${b(r.ubi)}</td>
      <td class="num" style="color:${negative ? 'var(--crit)' : 'var(--warn)'};">${b(r.profit)}</td>
      <td class="num">${(r.profit / r.output * 100).toFixed(0)}%</td>
      <td class="num">${fmtMoney(r.basketUSD)}</td>
    </tr>`;
  }).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:8%;"><col style="width:9%;"><col style="width:13%;"><col style="width:14%;"><col style="width:16%;"><col style="width:13%;"><col style="width:11%;"><col style="width:16%;"></colgroup>
    <thead><tr>
      <th>Year</th>
      <th class="num">Unemp</th>
      <th class="num">Output</th>
      <th class="num">Wages</th>
      <th class="num">MAC → UBI</th>
      <th class="num">Profit</th>
      <th class="num">Profit %</th>
      <th class="num">1 basket =</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>
  <div style="font-size:11px; color:var(--faint); margin-top:8px; line-height:1.6;">
    All quantities in <strong style="color:var(--txt2);">baskets / year</strong> (1 basket = one person's
    annual basic consumption). The last column is the $ cost of a basket that year — it falls as goods get
    cheaper, so the same real split is worth fewer dollars over time. Output ≈ wages + MAC + profit.
  </div>`;
}

// ── Render ─────────────────────────────────────────────────────────────────
function readCfg() {
  const o = parseFloat((document.getElementById('output') || {}).value);
  const w = parseFloat((document.getElementById('wage') || {}).value);
  return { output: isNaN(o) ? 1.85 : o, wage: isNaN(w) ? 2.3 : w };
}

function render() {
  const cfg = readCfg();
  const oOut = document.getElementById('output_v'), wOut = document.getElementById('wage_v');
  if (oOut) oOut.textContent = cfg.output.toFixed(2);
  if (wOut) wOut.textContent = cfg.wage.toFixed(2);

  const rows = model(cfg);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };
  set('split-chart', splitChart(rows));
  set('community-table', table(rows));

  const y0 = rows[0], y20 = rows[HORIZON];
  const everPositive = rows.every(r => r.profit >= 0);
  set('headline-stats', [
    ['Wage share · 2026 → 2046', (y0.wages / y0.output * 100).toFixed(0) + '% → ' + (y20.wages / y20.output * 100).toFixed(0) + '%', 'var(--blue)'],
    ['MAC → UBI share · 2046', (y20.ubi / y20.output * 100).toFixed(0) + '%', 'var(--ok)'],
    ['Profit share · 2026 → 2046', (y0.profit / y0.output * 100).toFixed(0) + '% → ' + (y20.profit / y20.output * 100).toFixed(0) + '%', 'var(--warn)'],
    ['Profit positive throughout?', everPositive ? 'Yes' : 'No', everPositive ? 'var(--ok)' : 'var(--crit)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.style.borderLeftColor = everPositive ? 'var(--ok)' : 'var(--crit)';
    verdict.innerHTML = everPositive
      ? `Output is fully distributed every year (wages + MAC + profit = output), so <strong>demand never falls</strong>. `
        + `As automation displaces workers, the wage share drains from <strong>${(y0.wages / y0.output * 100).toFixed(0)}%</strong> to `
        + `<strong>${(y20.wages / y20.output * 100).toFixed(0)}%</strong>; the MAC picks it up and hands it to the displaced as UBI; `
        + `and profit <strong>rises</strong> (${(y0.profit / y0.output * 100).toFixed(0)}% → ${(y20.profit / y20.output * 100).toFixed(0)}%) — firms stay profitable because the basic basket costs less than the wage it replaces.`
      : `At these settings the residual profit goes <strong>negative</strong> — output is too low (or the wage too high) to cover wages + the UBI bill. Raise output per person or lower the wage.`;
  }

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Average output per person (baskets / yr)</span>
      <input type="range" id="output" min="1.4" max="3.0" step="0.05" value="1.85">
      <span class="ctrl-val" id="output_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Wage per worker (× the basket)</span>
      <input type="range" id="wage" min="1.5" max="3.5" step="0.1" value="2.3">
      <span class="ctrl-val" id="wage_v"></span>
    </label>
    <div class="assumptions">
      <span><b>1,000</b> people — ${Math.round(WA)} working-age, ${Math.round(RET)} retired, ${Math.round(CH)} children</span>
      <span>Non-earners get the basket (children at 50%), funded by the MAC</span>
      <span>Unemployment <b>4.2% → 75%</b>; basket <b>$19,200 → $3,000</b>/yr</span>
    </div>`;
  document.getElementById('output').addEventListener('input', render);
  document.getElementById('wage').addEventListener('input', render);
}

function init() { buildControls(); render(); MF.load().then(render); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
