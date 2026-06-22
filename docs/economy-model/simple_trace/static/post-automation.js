// /post-automation — "It's the same economy."
//
// Today the economy pays out incomes (wages + welfare); people spend them; that
// spending is the firms' revenue; out of it they pay incomes again. It works.
// Replace every worker with a free robot, but have the firm keep paying the same
// amount — now as a charge (MAC) the Fisc hands out as a basic income — and the
// money flow is IDENTICAL. Same incomes, same spending, same revenue, same firm
// profit. The only changes: robots do the work, and the paycheck is called a
// basic income. No windfall, no leak, no closed-loop trick — just today's economy.

const usdM = v => '$' + (v / 1e6).toFixed(1) + 'M';
const usd = v => '$' + Math.round(v).toLocaleString();

function model(cfg) {
  const pool = cfg.N * cfg.income;                 // everything households receive / month
  const robotCost = pool * cfg.robotCost;          // 0 if robots are truly free — the only possible difference
  return { pool, robotCost, perPerson: cfg.income };
}

function flow(steps) {
  return `<div class="flow">${steps.map((s, i) => `
    <div class="flow-step${s.hl ? ' hl' : ''}">
      <div class="flow-label">${s.label}</div>
      <div class="flow-amt">${s.amt === null ? '' : usdM(s.amt)}</div>
    </div>${i < steps.length - 1 ? '<div class="flow-arrow">↓</div>' : ''}`).join('')}</div>`;
}

function render() {
  const g = (id, d) => { const e = document.getElementById(id); const v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; };
  const cfg = { N: g('N', 10000), income: g('income', 1440), robotCost: g('robotCost', 0) / 100 };
  const out = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  out('N_v', cfg.N.toLocaleString());
  out('income_v', usd(cfg.income));
  out('robotCost_v', Math.round(cfg.robotCost * 100) + '%');

  const m = model(cfg);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };

  set('today-flow', flow([
    { label: 'Firms pay out incomes (wages)', amt: m.pool, hl: true },
    { label: 'People earn them — by going to work', amt: m.pool },
    { label: 'People spend them', amt: m.pool },
    { label: "Firms' revenue", amt: m.pool },
  ]));
  set('robot-flow', flow([
    { label: 'Firms pay the same amount — as a charge (MAC)', amt: m.pool, hl: true },
    { label: 'The Fisc hands it out as a basic income', amt: m.pool },
    { label: 'People receive it — without going to work', amt: m.pool },
    { label: 'People spend it', amt: m.pool },
    { label: "Firms' revenue", amt: m.pool },
  ]));

  set('balance-stats', [
    ['What households receive', usdM(m.pool) + '/mo', 'var(--blue)'],
    ['Per person', usd(m.perPerson) + '/mo', 'var(--txt2)'],
    ['Today vs with robots', 'identical', 'var(--ok)'],
    ['Extra cost of the robots', m.robotCost > 0 ? usdM(m.robotCost) + '/mo' : 'none (free)', m.robotCost > 0 ? 'var(--warn)' : 'var(--ok)'],
  ].map(([l, v, c]) => `<div class="stat"><div class="label">${l}</div><div class="value" style="color:${c};">${v}</div></div>`).join(''));

  const verdict = document.getElementById('verdict');
  if (verdict) {
    verdict.style.borderLeftColor = 'var(--ok)';
    verdict.innerHTML =
      `Both sides circulate the same <strong>${usdM(m.pool)}</strong> a month — out as incomes, back as spending, out again. `
      + `The firms pay the same amount either way, so their <strong>profit is unchanged</strong>; people receive the same `
      + `<strong>${usd(m.perPerson)}</strong>, so their living standard is unchanged. `
      + `Nothing in the money has moved — the <strong>only</strong> differences are that <strong>robots do the work</strong> and the income is now called a `
      + `<strong>basic income</strong> instead of a wage. It works for exactly the reason today's economy works, because it <em>is</em> today's economy. `
      + (m.robotCost > 0
        ? `The one real change is the robots' running cost (<strong>${usdM(m.robotCost)}</strong>) — but with cheap, abundant energy that is small, and it is the only thing that differs from today.`
        : `With perfectly free robots there is <strong>no difference at all</strong>. The dividend from automation is simply that <strong>no one has to work</strong>.`);
  }
}

function buildControls() {
  const host = document.getElementById('controls');
  if (!host) return;
  host.innerHTML = `
    <label class="ctrl">
      <span class="ctrl-label">People in the economy</span>
      <input type="range" id="N" min="1000" max="100000" step="1000" value="10000">
      <span class="ctrl-val" id="N_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Income per person, per month (wage today → basic income tomorrow)</span>
      <input type="range" id="income" min="800" max="3000" step="50" value="1440">
      <span class="ctrl-val" id="income_v"></span>
    </label>
    <label class="ctrl">
      <span class="ctrl-label">Robots' running cost (0% = perfectly free, as you posited)</span>
      <input type="range" id="robotCost" min="0" max="15" step="1" value="0">
      <span class="ctrl-val" id="robotCost_v"></span>
    </label>
    <div class="assumptions">
      <span>The firm pays the <b>same</b> total either way — wages today, the MAC tomorrow</span>
      <span>The MAC each firm owes = the wage bill it no longer pays (its automation, captured)</span>
      <span>The gain is <b>leisure</b>, not corporate profit — the firm is exactly as well off as today</span>
    </div>`;
  ['N', 'income', 'robotCost'].forEach(id => document.getElementById(id).addEventListener('input', render));
}

function init() { buildControls(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
