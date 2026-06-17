// /post-automation — how the UBI loop closes in a fully-automated economy.
//
// Based on "The Mathematics of a Post-Automation Economy" (the MAC + UBI loop).
// In a single transaction loop a firm that funds its customers and sells to them
// nets Π = M − (COGS + M) = −COGS, so the loop stalls. With COGS = 0 the fix is
// VELOCITY: the UBI is skimmed by the MAC at every automated transaction. One
// pass recovers only the MAC rate; a second pass (business-to-business) recaptures
// the rest, so the Fisc gets the whole UBI back and can pay it out again.

const N = 100;            // citizens
const BASKET = 100;       // survival basket, $/capita/month
const SPLIT = 0.6;        // automated revenue split: OmniCorp 60% / MegaStore 40% (illustrative)

function usd(v) {
  if (v === null || v === undefined || !isFinite(v)) return '—';
  const a = Math.abs(v), s = v < 0 ? '−' : '';
  return s + '$' + Math.round(a).toLocaleString();
}

function model(cfg) {
  const ubi = BASKET * (1 + cfg.leisure);          // per capita
  const pool = N * ubi;                            // Fisc monthly outflow
  // Phase 1 — consumer loop
  const autoConsumer = cfg.autoShare * pool;
  const humanConsumer = pool - autoConsumer;
  const omniC = SPLIT * autoConsumer, megaC = (1 - SPLIT) * autoConsumer;
  const consumerMAC = cfg.rate * autoConsumer;     // 0% on the human sector
  const consumerKept = autoConsumer - consumerMAC;
  const shortfall = pool - consumerMAC;            // what leaks out of the first loop
  // Phase 2 — B2B recapture loop
  const b2b = cfg.b2b;
  const omniB = SPLIT * b2b, megaB = (1 - SPLIT) * b2b;
  const b2bMAC = cfg.rate * b2b;
  const b2bKept = b2b - b2bMAC;
  // Totals
  const totalMAC = consumerMAC + b2bMAC;
  const fiscBalance = totalMAC - pool;             // 0 = perfectly closed
  const autoProfit = consumerKept + b2bKept;       // retained by automated firms
  const humanBalance = humanConsumer - b2b;        // negative = funded by credit
  const autoVolume = autoConsumer + b2b;
  const turnover = pool > 0 ? autoVolume / pool : 0;
  const b2bNeeded = shortfall / cfg.rate;          // B2B turnover that closes the loop
  return {
    ubi, pool, autoConsumer, humanConsumer, omniC, megaC, consumerMAC, consumerKept, shortfall,
    b2b, omniB, megaB, b2bMAC, b2bKept, totalMAC, fiscBalance, autoProfit, humanBalance,
    autoVolume, turnover, b2bNeeded,
  };
}

// ── Ledger tables ───────────────────────────────────────────────────────────
function ledger(rows, totals) {
  const body = rows.map(r => `
    <tr>
      <td class="cat">${r.name}</td>
      <td class="num">${usd(r.rev)}</td>
      <td class="num">${r.rate === null ? '—' : Math.round(r.rate * 100) + '%'}</td>
      <td class="num" style="color:var(--ok);">${r.mac === null ? '—' : usd(r.mac)}</td>
      <td class="num" style="color:${r.kept < 0 ? 'var(--crit)' : 'var(--txt2)'};">${usd(r.kept)}</td>
    </tr>`).join('');
  return `
  <table style="table-layout:fixed; width:100%;">
    <colgroup><col style="width:34%;"><col style="width:18%;"><col style="width:14%;"><col style="width:17%;"><col style="width:17%;"></colgroup>
    <thead><tr>
      <th>Sector / firm</th><th class="num">Revenue</th><th class="num">MAC rate</th>
      <th class="num">MAC collected</th><th class="num">Kept</th>
    </tr></thead>
    <tbody>${body}
      <tr style="border-top:1px solid var(--line-hot);">
        <td class="cat"><strong>${totals.name}</strong></td>
        <td class="num"><strong>${usd(totals.rev)}</strong></td>
        <td class="num">—</td>
        <td class="num"><strong style="color:var(--ok);">${usd(totals.mac)}</strong></td>
        <td class="num"><strong>${usd(totals.kept)}</strong></td>
      </tr>
    </tbody>
  </table>`;
}

// ── Render ──────────────────────────────────────────────────────────────────
function readCfg() {
  const lp = parseFloat((document.getElementById('leisure') || {}).value);
  const rt = parseFloat((document.getElementById('rate') || {}).value);
  const as = parseFloat((document.getElementById('autoShare') || {}).value);
  const bb = parseFloat((document.getElementById('b2b') || {}).value);
  return {
    leisure: isNaN(lp) ? 0.20 : lp / 100,
    rate: isNaN(rt) ? 0.80 : rt / 100,
    autoShare: isNaN(as) ? 0.833 : as / 100,
    b2b: isNaN(bb) ? 5000 : bb,
  };
}

function render() {
  const cfg = readCfg();
  const out = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  out('leisure_v', Math.round(cfg.leisure * 100) + '%');
  out('rate_v', Math.round(cfg.rate * 100) + '%');
  out('autoShare_v', Math.round(cfg.autoShare * 100) + '%');
  out('b2b_v', usd(cfg.b2b));

  const m = model(cfg);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };

  set('phase1', ledger([
    { name: 'OmniCorp (automated)', rev: m.omniC, rate: cfg.rate, mac: cfg.rate * m.omniC, kept: m.omniC * (1 - cfg.rate) },
    { name: 'MegaStore (automated)', rev: m.megaC, rate: cfg.rate, mac: cfg.rate * m.megaC, kept: m.megaC * (1 - cfg.rate) },
    { name: 'Human leisure sector', rev: m.humanConsumer, rate: 0, mac: 0, kept: m.humanConsumer },
  ], { name: 'Consumer loop', rev: m.pool, mac: m.consumerMAC, kept: m.consumerKept + m.humanConsumer }));

  set('phase2', ledger([
    { name: 'OmniCorp (B2B compute)', rev: m.omniB, rate: cfg.rate, mac: cfg.rate * m.omniB, kept: m.omniB * (1 - cfg.rate) },
    { name: 'MegaStore (B2B logistics)', rev: m.megaB, rate: cfg.rate, mac: cfg.rate * m.megaB, kept: m.megaB * (1 - cfg.rate) },
    { name: 'Human sector (buys infrastructure)', rev: -m.b2b, rate: null, mac: null, kept: -m.b2b },
  ], { name: 'B2B recapture loop', rev: 0, mac: m.b2bMAC, kept: m.b2bKept - m.b2b }));

  const closed = Math.abs(m.fiscBalance) < 1;
  set('balance-stats', [
    ['UBI paid out by the Fisc', usd(m.pool), 'var(--blue)'],
    ['MAC recovered (both loops)', usd(m.totalMAC), 'var(--ok)'],
    ['Fisc balance', (m.fiscBalance >= 0 ? '+' : '') + usd(m.fiscBalance), closed ? 'var(--ok)' : 'var(--crit)'],
    ['Money turnover through automated firms', '×' + m.turnover.toFixed(2), 'var(--warn)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.style.borderLeftColor = closed ? 'var(--ok)' : 'var(--crit)';
    if (closed) {
      verdict.innerHTML =
        `The Fisc pays out <strong>${usd(m.pool)}</strong> in UBI and gets <strong>${usd(m.totalMAC)}</strong> back through the MAC — `
        + `<strong>a perfect 1:1</strong>, so it can pay the same UBI again next month. One pass of spending only recovered `
        + `<strong>${usd(m.consumerMAC)}</strong> (the ${Math.round(cfg.rate * 100)}% skim on ${usd(m.autoConsumer)} of automated sales); the `
        + `<strong>${usd(m.b2b)}</strong> business-to-business loop recaptured the missing <strong>${usd(m.shortfall)}</strong>. The money has to pass `
        + `through automated hands <strong>×${m.turnover.toFixed(2)}</strong> for an ${Math.round(cfg.rate * 100)}% rate to add up to the whole UBI. `
        + `Automated firms still keep <strong>${usd(m.autoProfit)}</strong> in profit — though note the human sector runs <strong>${usd(m.humanBalance)}</strong>, `
        + `funded by credit, which is the mirror image of that profit.`;
    } else if (m.fiscBalance < 0) {
      verdict.innerHTML =
        `The Fisc pays <strong>${usd(m.pool)}</strong> but only recovers <strong>${usd(m.totalMAC)}</strong> — <strong>short by ${usd(-m.fiscBalance)}</strong>. `
        + `The loop doesn't close: it would drain the treasury. To close it, the money needs to turn over more through automated firms — `
        + `raise the B2B recapture to about <strong>${usd(m.b2bNeeded)}</strong>, lift the automated share, or raise the MAC rate.`;
    } else {
      verdict.innerHTML =
        `The Fisc recovers <strong>${usd(m.totalMAC)}</strong> against <strong>${usd(m.pool)}</strong> paid — a <strong>${usd(m.fiscBalance)} surplus</strong>. `
        + `It over-collects; it could lower the MAC rate, raise the UBI, or build a reserve.`;
    }
  }

  try { localStorage.setItem('axion_postauto_v1', JSON.stringify(cfg)); } catch (e) {}
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">Leisure buffer on top of the survival basket</span>
      <input type="range" id="leisure" min="0" max="50" step="5" value="20">
      <span class="ctrl-val" id="leisure_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">MAC rate — the skim on each automated transaction</span>
      <input type="range" id="rate" min="50" max="95" step="1" value="80">
      <span class="ctrl-val" id="rate_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Share of spending going to automated firms (rest is human boutiques)</span>
      <input type="range" id="autoShare" min="50" max="100" step="1" value="83">
      <span class="ctrl-val" id="autoShare_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Business-to-business recapture (the money's second pass)</span>
      <input type="range" id="b2b" min="0" max="8000" step="250" value="5000">
      <span class="ctrl-val" id="b2b_v"></span>
    </label>
    <div class="assumptions">
      <span><b>100</b> citizens · survival basket <b>$100</b>/mo · robots make everything at <b>zero</b> cost (COGS = 0)</span>
      <span>The MAC is a skim on transactions, not a markup — prices don't change</span>
      <span>The loop closes when the MAC recovers the whole UBI pool</span>
    </div>`;
  ['leisure', 'rate', 'autoShare', 'b2b'].forEach(id => document.getElementById(id).addEventListener('input', render));
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
