// /post-automation — how a basic income pays for itself when robots do the work.
//
// The Fisc pays out the basic income; people spend it; the MAC (a cut of each
// sale) goes back to the Fisc. One round of spending only claws back the cut
// (~a third), so the money has to go round several times for the cuts to add up
// to the whole basic income. Realistic numbers (10,000 people, Amazon/Walmart-
// style firms, 5% robot running cost). A clean version of the broken Gemini code.

const N = 10000;                                  // citizens
const SPLIT = { amzn: 0.50, wmt: 0.35, human: 0.15 };   // where consumer spending goes
const TODAY = { amzn: 0.11, wmt: 0.03 };          // real-world net margins today

function usd(v) {
  if (!isFinite(v)) return '∞';
  const a = Math.abs(v), s = v < 0 ? '−' : '';
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(1) + 'M';
  return s + '$' + Math.round(a).toLocaleString();
}
const pct = v => Math.round(v * 100) + '%';

function model(cfg) {
  const ubi = cfg.basket * (1 + cfg.leisure);     // per person / month
  const pool = N * ubi;                           // Fisc pays this out
  // blended cut the MAC takes per dollar of consumer spending
  const blended = SPLIT.amzn * cfg.macA + SPLIT.wmt * cfg.macW + SPLIT.human * 0;
  // spending needed so the cuts add up to the whole basic income
  const volume = blended > 0 ? pool / blended : Infinity;
  const velocity = blended > 0 ? 1 / blended : Infinity;
  const oneRound = blended * pool;                // MAC from a single round
  // per-sector breakdown of that volume
  const amznRev = SPLIT.amzn * volume, wmtRev = SPLIT.wmt * volume, humanRev = SPLIT.human * volume;
  const macTotal = amznRev * cfg.macA + wmtRev * cfg.macW;   // = pool, by construction
  const amznMargin = Math.max(0, 1 - cfg.macA - cfg.cogs);
  const wmtMargin = Math.max(0, 1 - cfg.macW - cfg.cogs);
  return { ubi, pool, blended, volume, velocity, oneRound, amznRev, wmtRev, humanRev, macTotal, amznMargin, wmtMargin };
}

// ── Sector table — for every $100 of sales ──────────────────────────────────
function sectorTable(cfg) {
  const row = (name, share, mac, cogs, note) => {
    const keep = Math.max(0, 1 - mac - cogs);
    return `<tr>
      <td class="cat">${name}</td>
      <td class="num">${pct(share)}</td>
      <td class="num" style="color:var(--ok);">${pct(mac)}</td>
      <td class="num">${pct(cogs)}</td>
      <td class="num" style="color:var(--warn);"><strong>${pct(keep)}</strong>${note ? ` <span style="color:var(--dim);font-weight:normal;">${note}</span>` : ''}</td>
    </tr>`;
  };
  return `
  <table style="table-layout:fixed; width:100%; max-width:720px;">
    <colgroup><col style="width:34%;"><col style="width:16%;"><col style="width:16%;"><col style="width:14%;"><col style="width:20%;"></colgroup>
    <thead><tr>
      <th>Where the money is spent</th><th class="num">Share</th><th class="num">MAC</th>
      <th class="num">Robot cost</th><th class="num">Firm keeps</th>
    </tr></thead>
    <tbody>
      ${row('Amazon (automated)', SPLIT.amzn, cfg.macA, cfg.cogs)}
      ${row('Walmart (automated)', SPLIT.wmt, cfg.macW, cfg.cogs)}
      ${row('Human shops (art, care, craft)', SPLIT.human, 0, 0, '— their wage')}
    </tbody>
  </table>`;
}

// ── Today vs this model ─────────────────────────────────────────────────────
function comparisonTable(m, cfg) {
  const row = (name, today, now) => `<tr>
    <td class="cat">${name}</td>
    <td class="num">${pct(today)}</td>
    <td class="num" style="color:var(--ok);"><strong>${pct(now)}</strong></td>
    <td class="num">×${(now / today).toFixed(1)}</td>
  </tr>`;
  return `
  <table style="table-layout:fixed; width:100%; max-width:640px;">
    <colgroup><col style="width:34%;"><col style="width:22%;"><col style="width:28%;"><col style="width:16%;"></colgroup>
    <thead><tr>
      <th>Net profit margin</th><th class="num">Today</th><th class="num">This model</th><th class="num"></th>
    </tr></thead>
    <tbody>
      ${row('Amazon', TODAY.amzn, m.amznMargin)}
      ${row('Walmart', TODAY.wmt, m.wmtMargin)}
    </tbody>
  </table>`;
}

// ── Render ──────────────────────────────────────────────────────────────────
function readCfg() {
  const g = (id, d) => { const e = document.getElementById(id); const v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; };
  return {
    basket: g('basket', 1200),
    leisure: g('leisure', 20) / 100,
    macA: g('macA', 45) / 100,
    macW: g('macW', 30) / 100,
    cogs: g('cogs', 5) / 100,
  };
}

function render() {
  const cfg = readCfg();
  const out = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  out('basket_v', usd(cfg.basket));
  out('leisure_v', pct(cfg.leisure));
  out('macA_v', pct(cfg.macA));
  out('macW_v', pct(cfg.macW));
  out('cogs_v', pct(cfg.cogs));

  const m = model(cfg);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };

  set('ubi-summary',
    `Every one of the <strong>${N.toLocaleString()}</strong> citizens gets a <strong>${usd(m.ubi)}</strong> basic income a month — `
    + `a <strong>${usd(cfg.basket)}</strong> survival basket plus a <strong>${usd(cfg.basket * cfg.leisure)}</strong> leisure buffer. `
    + `Across everyone that is <strong>${usd(m.pool)}</strong> the Fisc pays out each month.`);

  set('sector-table', sectorTable(cfg));
  set('comparison-table', comparisonTable(m, cfg));

  set('balance-stats', [
    ['Basic income paid out', usd(m.pool) + '/mo', 'var(--blue)'],
    ['MAC collected back', usd(m.macTotal) + '/mo', 'var(--ok)'],
    ['Times the money goes round', '×' + m.velocity.toFixed(1), 'var(--warn)'],
    ['Total spending it creates', usd(m.volume) + '/mo', 'var(--txt2)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.style.borderLeftColor = 'var(--ok)';
    verdict.innerHTML =
      `The Fisc pays out <strong>${usd(m.pool)}</strong> in basic income. The MAC takes about <strong>${pct(m.blended)}</strong> of every sale `
      + `(${pct(cfg.macA)} at Amazon, ${pct(cfg.macW)} at Walmart, nothing at the human shops). So one round of spending only brings back `
      + `<strong>${usd(m.oneRound)}</strong>. But the money keeps moving — the shops' takings get spent again, and again — and the MAC takes its cut `
      + `each time. After it has gone round about <strong>${m.velocity.toFixed(1)} times</strong>, total spending reaches <strong>${usd(m.volume)}</strong> `
      + `and the MAC has collected the whole <strong>${usd(m.macTotal)}</strong> back. <strong>The loop balances</strong> — the Fisc can pay the same basic income again next month. `
      + `And the firms do <strong>better</strong> than today: even paying the MAC, Amazon keeps <strong>${pct(m.amznMargin)}</strong> of each sale against ${pct(TODAY.amzn)} now, because it has no wages to pay.`;
  }

  try { localStorage.setItem('axion_postauto_v2', JSON.stringify(cfg)); } catch (e) {}
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
      <span class="ctrl-label">MAC rate at Amazon (high automation → high rate)</span>
      <input type="range" id="macA" min="20" max="60" step="1" value="45">
      <span class="ctrl-val" id="macA_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">MAC rate at Walmart</span>
      <input type="range" id="macW" min="15" max="50" step="1" value="30">
      <span class="ctrl-val" id="macW_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Robot running cost (electricity, upkeep) as a share of sales</span>
      <input type="range" id="cogs" min="0" max="15" step="1" value="5">
      <span class="ctrl-val" id="cogs_v"></span>
    </label>
    <div class="assumptions">
      <span><b>10,000</b> citizens · spending split <b>50%</b> Amazon / <b>35%</b> Walmart / <b>15%</b> human shops</span>
      <span>The MAC is a cut of each sale, not a markup — prices don't change</span>
      <span>Lower the MAC rates and watch the money have to go round more times to close the loop</span>
    </div>`;
  ['basket', 'leisure', 'macA', 'macW', 'cogs'].forEach(id => document.getElementById(id).addEventListener('input', render));
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
