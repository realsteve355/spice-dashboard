// /post-automation — funding a basic income when robots do the work (honest version).
//
// No velocity hand-wave: the automated firms extract their profit, so the money
// makes ONE pass. The MAC recovers most of the basic income; firms keep a slim
// margin that still beats today (no wages); the part the MAC can't reach — mainly
// the untaxed human-craft sector plus whatever the firms keep — is issued as new
// money, which a deflationary automation economy can absorb. It rests on real
// abundance (goods nearly free), not on a magic closed loop.

const N = 10000;                                  // citizens
const RATIO_A = 0.50 / 0.85, RATIO_W = 0.35 / 0.85;   // Amazon:Walmart split of the automated share
const TODAY = { amzn: 0.11, wmt: 0.03 };          // real-world net margins today

function usd(v) {
  if (!isFinite(v)) return '∞';
  const a = Math.abs(v), s = v < 0 ? '−' : '';
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(1) + 'M';
  return s + '$' + Math.round(a).toLocaleString();
}
const pct = v => Math.round(v * 100) + '%';

function model(cfg) {
  const ubi = cfg.basket * (1 + cfg.leisure);
  const pool = N * ubi;                            // basic income paid out / month
  const auto = 1 - cfg.humanShare;
  const amznSpend = auto * RATIO_A * pool;
  const wmtSpend = auto * RATIO_W * pool;
  const humanSpend = cfg.humanShare * pool;
  const macCollected = amznSpend * cfg.macA + wmtSpend * cfg.macW;   // ONE pass — no re-spend
  const recovery = pool > 0 ? macCollected / pool : 0;
  const residual = pool - macCollected;            // issued as new money, absorbed by deflation
  const residualPct = pool > 0 ? residual / pool : 0;
  const amznMargin = Math.max(0, 1 - cfg.macA - cfg.cogs);
  const wmtMargin = Math.max(0, 1 - cfg.macW - cfg.cogs);
  return { ubi, pool, amznSpend, wmtSpend, humanSpend, macCollected, recovery, residual, residualPct, amznMargin, wmtMargin };
}

function sectorTable(cfg, m) {
  const row = (name, spend, mac, cogs, note) => {
    const keep = Math.max(0, 1 - mac - cogs);
    return `<tr>
      <td class="cat">${name}</td>
      <td class="num">${usd(spend)}</td>
      <td class="num" style="color:var(--ok);">${pct(mac)}</td>
      <td class="num">${pct(cogs)}</td>
      <td class="num" style="color:var(--warn);"><strong>${pct(keep)}</strong>${note ? ` <span style="color:var(--dim);font-weight:normal;">${note}</span>` : ''}</td>
    </tr>`;
  };
  return `
  <table style="table-layout:fixed; width:100%; max-width:760px;">
    <colgroup><col style="width:32%;"><col style="width:20%;"><col style="width:14%;"><col style="width:14%;"><col style="width:20%;"></colgroup>
    <thead><tr>
      <th>Where the money is spent</th><th class="num">Sales / mo</th><th class="num">MAC</th>
      <th class="num">Robot cost</th><th class="num">Firm keeps</th>
    </tr></thead>
    <tbody>
      ${row('Amazon (automated)', m.amznSpend, cfg.macA, cfg.cogs)}
      ${row('Walmart (automated)', m.wmtSpend, cfg.macW, cfg.cogs)}
      ${row('Human craft / care', m.humanSpend, 0, 0, '— their wage, not charged')}
    </tbody>
  </table>`;
}

function comparisonTable(m) {
  const row = (name, today, now) => `<tr>
    <td class="cat">${name}</td>
    <td class="num">${pct(today)}</td>
    <td class="num" style="color:${now >= today ? 'var(--ok)' : 'var(--crit)'};"><strong>${pct(now)}</strong></td>
    <td class="num">${now >= today ? '×' + (now / today).toFixed(1) : 'worse'}</td>
  </tr>`;
  return `
  <table style="table-layout:fixed; width:100%; max-width:640px;">
    <colgroup><col style="width:34%;"><col style="width:22%;"><col style="width:28%;"><col style="width:16%;"></colgroup>
    <thead><tr>
      <th>Net profit margin</th><th class="num">Today</th><th class="num">This model</th><th class="num"></th>
    </tr></thead>
    <tbody>${row('Amazon', TODAY.amzn, m.amznMargin)}${row('Walmart', TODAY.wmt, m.wmtMargin)}</tbody>
  </table>`;
}

function readCfg() {
  const g = (id, d) => { const e = document.getElementById(id); const v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; };
  return {
    basket: g('basket', 1200), leisure: g('leisure', 20) / 100,
    macA: g('macA', 80) / 100, macW: g('macW', 80) / 100,
    cogs: g('cogs', 5) / 100, humanShare: g('humanShare', 15) / 100,
  };
}

function render() {
  const cfg = readCfg();
  const out = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  out('basket_v', usd(cfg.basket)); out('leisure_v', pct(cfg.leisure));
  out('macA_v', pct(cfg.macA)); out('macW_v', pct(cfg.macW));
  out('cogs_v', pct(cfg.cogs)); out('humanShare_v', pct(cfg.humanShare));

  const m = model(cfg);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };

  set('ubi-summary',
    `Every one of the <strong>${N.toLocaleString()}</strong> citizens gets a <strong>${usd(m.ubi)}</strong> basic income a month — `
    + `a <strong>${usd(cfg.basket)}</strong> survival basket plus a <strong>${usd(cfg.basket * cfg.leisure)}</strong> leisure buffer. `
    + `Across everyone that is <strong>${usd(m.pool)}</strong> the Fisc issues each month.`);

  set('sector-table', sectorTable(cfg, m));
  set('comparison-table', comparisonTable(m));

  set('balance-stats', [
    ['Basic income issued', usd(m.pool) + '/mo', 'var(--blue)'],
    ['Recovered by the MAC', usd(m.macCollected) + ' (' + pct(m.recovery) + ')', 'var(--ok)'],
    ['Issued as new money', usd(m.residual) + ' (' + pct(m.residualPct) + ')', 'var(--warn)'],
    ['Amazon margin vs today', pct(m.amznMargin) + ' vs ' + pct(TODAY.amzn), m.amznMargin >= TODAY.amzn ? 'var(--ok)' : 'var(--crit)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    const beats = m.amznMargin >= TODAY.amzn;
    verdict.style.borderLeftColor = 'var(--ok)';
    verdict.innerHTML =
      `The Fisc issues <strong>${usd(m.pool)}</strong> in basic income. The money makes <strong>one pass</strong> — the automated firms `
      + `extract their profit, they don't re-spend it locally. So the MAC recovers <strong>${usd(m.macCollected)}</strong> — about <strong>${pct(m.recovery)}</strong> `
      + `of it. The firms keep a slim margin (Amazon <strong>${pct(m.amznMargin)}</strong>, ${beats ? 'beating' : '<strong>below</strong>'} today's ${pct(TODAY.amzn)}). `
      + `The remaining <strong>${usd(m.residual)}</strong> (<strong>${pct(m.residualPct)}</strong>) — mostly the human-craft sector, which isn't charged — is simply `
      + `<strong>issued as new money</strong>. That stays non-inflationary only if the automation economy grows output by roughly `
      + `<strong>${pct(m.residualPct)}</strong> a year to match — the one assumption this rests on. `
      + `Push the MAC higher and that money-issuance shrinks, but the firms' margin thins toward (or below) today's. That trade-off is the whole story, shown honestly — `
      + `no closed-loop magic.`;
  }

  try { localStorage.setItem('axion_postauto_v3', JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Survival basket — what a citizen needs to live, per month</span>
      <input type="range" id="basket" min="800" max="2000" step="50" value="1200">
      <span class="ctrl-val" id="basket_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Leisure buffer on top of the basket</span>
      <input type="range" id="leisure" min="0" max="50" step="5" value="20">
      <span class="ctrl-val" id="leisure_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">MAC rate at Amazon (higher → more recovered, thinner firm margin)</span>
      <input type="range" id="macA" min="40" max="95" step="1" value="80">
      <span class="ctrl-val" id="macA_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">MAC rate at Walmart</span>
      <input type="range" id="macW" min="40" max="95" step="1" value="80">
      <span class="ctrl-val" id="macW_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Robot running cost (electricity, upkeep) as a share of sales</span>
      <input type="range" id="cogs" min="0" max="15" step="1" value="5">
      <span class="ctrl-val" id="cogs_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Share of spending at human shops (never charged the MAC)</span>
      <input type="range" id="humanShare" min="0" max="40" step="1" value="15">
      <span class="ctrl-val" id="humanShare_v"></span>
    </label>
    <div class="assumptions">
      <span><b>10,000</b> citizens · the firms extract their profit (one pass, no re-spending)</span>
      <span>The MAC is a cut of each sale, not a markup — prices don't change</span>
      <span>The gap is issued money, held non-inflationary by automation's falling costs</span>
    </div>`;
  ['basket', 'leisure', 'macA', 'macW', 'cogs', 'humanShare'].forEach(id => document.getElementById(id).addEventListener('input', render));
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
