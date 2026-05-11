// /forecasts (central overview) page — headline, quotes, 3 nav cards out
// to sub-pages, synthesis verdict + per-year math + explanation.

runPage(d => [
  renderHeadline(d.headline),
  renderQuotes(d.quotes),
  renderNavCards(d),
  renderSynthesisVerdict(d.synthesis),
  renderBuildUrgency(d.synthesis),
  renderSynthesisTable(d.synthesis),
  renderSynthesisExplanation(d.synthesis),
  renderHenryFordCallout(d.profitability),
].join('\n'));

// MS1 working backwards — build window for SPICE.
function renderBuildUrgency(syn) {
  const ms1 = syn.milestone_1_year;
  if (!ms1) return '';
  const today = 2026;
  // Working back from MS1: operational ~1 yr before, pilot ~3 yr before, MVP ~5 yr before
  const operationalYear = ms1 - 1;
  const pilotYear = ms1 - 3;
  const mvpYear = ms1 - 5;
  const yrsUntilMVP = mvpYear - today;
  const urgencyClass = yrsUntilMVP <= 2 ? 'crit' : yrsUntilMVP <= 5 ? 'warn' : 'ok';
  const yrsLabel = yrsUntilMVP <= 0 ? `MVP IS DUE NOW (${Math.abs(yrsUntilMVP)} years overdue)` : `${yrsUntilMVP} years to MVP`;

  return `
  <div class="card" style="margin-bottom:14px; border-left: 3px solid var(--${urgencyClass});">
    <h3>Build urgency — working back from MS1: Welfare</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:14px;">
      MS1 is the year SPICE must be operational and absorbing displaced citizens.
      Working back: SPICE needs to be at scale 1 year before, in pilot 3 years before,
      and MVP-ready 5 years before. <strong style="color:var(--${urgencyClass});">${yrsLabel}.</strong>
    </div>
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      <div class="stat">
        <div class="label">MVP build</div>
        <div class="value" style="font-size:18px;">${mvpYear}</div>
        <div class="sub">${yrsUntilMVP <= 0 ? 'overdue' : `${yrsUntilMVP} yrs from now`}</div>
      </div>
      <div class="stat">
        <div class="label">Pilot colonies</div>
        <div class="value" style="font-size:18px;">${pilotYear}</div>
        <div class="sub">${pilotYear - today} yrs from now</div>
      </div>
      <div class="stat">
        <div class="label">Operational at scale</div>
        <div class="value" style="font-size:18px;">${operationalYear}</div>
        <div class="sub">${operationalYear - today} yrs from now</div>
      </div>
      <div class="stat">
        <div class="label">MS1: Welfare hits</div>
        <div class="value ok" style="font-size:18px;">${ms1}</div>
        <div class="sub">${ms1 - today} yrs from now</div>
      </div>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px;">
      The synthesis math currently lands MS1 in ${ms1} under the default scenario.
      Bull-case scenarios (faster automation) push MS1 earlier and shorten this window.
    </div>
  </div>`;
}

function renderHenryFordCallout(prof) {
  const pe = prof && prof.political_economy;
  if (!pe) return '';
  return `
  <div class="card" style="margin-top:14px; border-left: 3px solid var(--ok);">
    <h3>${pe.title}</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:10px;">
      The synthesis above shows that SPICE math closes only under capital-heavy
      profit capture (margins expand, levy grows). Capital owners will fight to
      retain those margins — but the deeper logic actually <em>aligns</em> them
      with the levy.
    </div>
    <div style="background:var(--panel2); border-left: 2px solid var(--ok); padding:14px 18px; margin: 12px 0;">
      <div style="font-size:14px; color:var(--headline); font-style:italic; line-height:1.5; margin-bottom:6px;">"${pe.key_quote.text}"</div>
      <div style="font-size:11px; color:var(--dim); letter-spacing:0.1em; text-transform:uppercase;">— ${pe.key_quote.author}</div>
    </div>
    <div style="font-size:13px; color:var(--txt); line-height:1.6;">
      ${pe.alignment} — <a href="/profitability" style="color:var(--ok);">full argument on /profitability</a>.
    </div>
  </div>`;
}

function renderNavCards(d) {
  // Show SPICE projection numbers — that's what the synthesis below uses
  const spiceBasket = d.spice_basket_trajectory[d.spice_basket_trajectory.length - 1];
  const spiceUnemp = d.unemployment.scenarios.find(s => s.name.startsWith("SPICE"));
  const spiceUnempFinal = spiceUnemp.checkpoints[spiceUnemp.checkpoints.length - 1];
  const spiceProfit = d.profitability.scenarios.find(s => s.name.startsWith("SPICE"));
  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Three drivers · SPICE projection · click for detail</h3>
    <div class="cat-grid" style="grid-template-columns: repeat(3, 1fr);">
      <a href="/cost-deflation" style="text-decoration:none;">
        <div class="cat-card crit" style="cursor:pointer; height:100%;">
          <div class="cat-name" style="margin-bottom:6px;">Cost deflation →</div>
          <div style="font-size:11px; color:var(--dim); margin-bottom:8px;">10 categories + basket aggregate + SPICE planning curve.</div>
          <div style="font-size:18px; color:var(--crit); font-variant-numeric:tabular-nums;">${spiceBasket.cost_index.toFixed(0)}%</div>
          <div style="font-size:10px; color:var(--faint);">SPICE basket cost in ${spiceBasket.year} (vs 100% today)</div>
        </div>
      </a>
      <a href="/unemployment" style="text-decoration:none;">
        <div class="cat-card crit" style="cursor:pointer; height:100%;">
          <div class="cat-name" style="margin-bottom:6px;">Unemployment →</div>
          <div style="font-size:11px; color:var(--dim); margin-bottom:8px;">Four scenarios: mainstream, bull, SPICE, sceptic + workforce breakdown.</div>
          <div style="font-size:18px; color:var(--crit); font-variant-numeric:tabular-nums;">${spiceUnempFinal.unemployment_pct}%</div>
          <div style="font-size:10px; color:var(--faint);">SPICE projection for ${spiceUnempFinal.year}</div>
        </div>
      </a>
      <a href="/profitability" style="text-decoration:none;">
        <div class="cat-card crit" style="cursor:pointer; height:100%;">
          <div class="cat-name" style="margin-bottom:6px;">Profitability →</div>
          <div style="font-size:11px; color:var(--dim); margin-bottom:8px;">Acemoglu-Restrepo split + SPICE insulation + Henry Ford.</div>
          <div style="font-size:18px; color:var(--crit); font-variant-numeric:tabular-nums;">${spiceProfit.capital_pct}%</div>
          <div style="font-size:10px; color:var(--faint);">SPICE: capital share of AI gains</div>
        </div>
      </a>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px;">
      The synthesis below uses the <strong style="color:var(--crit);">SPICE projection</strong>
      consistently across all three drivers. This is the design case for SPICE colony architecture —
      more aggressive than the public bull voices.
    </div>
  </div>`;
}

function renderSynthesisVerdict(syn) {
  const m1 = syn.milestone_1_year;
  const m2 = syn.milestone_2_year;
  const m1Class = m1 ? 'ok' : 'crit';
  const m2Class = m2 ? 'ok' : 'crit';
  const a = syn.assumptions;
  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Synthesis verdict — when do MS1 and MS2 land?</h3>
    <div class="stats" style="grid-template-columns: repeat(2, 1fr);">
      <div class="stat">
        <div class="label">MS1 — Welfare-capable</div>
        <div class="value ${m1Class}" style="font-size: 28px;">${m1 || '—'}</div>
        <div class="sub">first year levy ≥ State welfare obligation (cost-neutral switch-on)</div>
      </div>
      <div class="stat">
        <div class="label">MS2 — Full UBI-capable</div>
        <div class="value ${m2Class}" style="font-size: 28px;">${m2 || '—'}</div>
        <div class="sub">first year levy ≥ basket-pegged UBI for all citizens</div>
      </div>
    </div>
    <div style="font-size:12px; color:var(--txt2); margin-top:12px; line-height:1.5;">
      Under: <strong style="color:var(--headline);">${a.unemployment_scenario}</strong>
      and <strong style="color:var(--headline);">${a.profitability_scenario}</strong>.
      Margin trajectory: ${a.today_margin_pct}% (today) → ${a.target_margin_pct}% (${syn.snapshots[syn.snapshots.length-1].year}),
      driven by capital share = ${a.capital_share_of_gains}%.
    </div>
  </div>`;
}

function renderSynthesisTable(syn) {
  const fmtUSDk = n => n >= 1e6 ? '$' + (n/1e6).toFixed(2) + 'M' : '$' + (n/1000).toFixed(0) + 'K';
  const row = s => {
    const m1Hit = syn.milestone_1_year === s.year;
    const m2Hit = syn.milestone_2_year === s.year;
    let phase = 'IMPL';
    if (syn.milestone_2_year && s.year >= syn.milestone_2_year) phase = '<span style="color:var(--ok);">FULL UBI</span>';
    else if (syn.milestone_1_year && s.year >= syn.milestone_1_year) phase = '<span style="color:var(--blue);">WELFARE</span>';
    else phase = '<span style="color:var(--dim);">IMPL</span>';

    // Wage-vs-founder share of total income — the headline pivot
    const totalIncome = s.wage_income + s.founder_income;
    const founderSharePct = (s.founder_income / Math.max(1, totalIncome)) * 100;

    return `<tr ${m2Hit ? 'style="background:rgba(93, 211, 158, 0.08);"' : (m1Hit ? 'style="background:rgba(59, 130, 246, 0.08);"' : '')}>
      <td class="cat">${s.year}${m1Hit ? ' ⬢' : ''}${m2Hit ? ' ★' : ''}</td>
      <td>${phase}</td>
      <td class="num">$${Math.round(s.basket_usd).toLocaleString()}</td>
      <td class="num">${s.unemployment_pct}%</td>
      <td class="num">${fmtUSDk(s.wage_income)}</td>
      <td class="num" style="color: ${founderSharePct > 50 ? 'var(--warn)' : 'var(--txt2)'};">${fmtUSDk(s.founder_income)}</td>
      <td class="num">${founderSharePct.toFixed(0)}%</td>
      <td class="num">${s.margin_pct}%</td>
      <td class="num">${fmtUSDk(s.levy_capacity)}</td>
      <td class="num">${fmtUSDk(s.welfare_obligation)}</td>
      <td class="num">${fmtUSDk(s.ubi_obligation)}</td>
    </tr>`;
  };

  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Per-year synthesis math</h3>
    <table>
      <thead><tr>
        <th>Year</th><th>Phase</th>
        <th class="num">Basket $/mo</th><th class="num">Unemp %</th>
        <th class="num">Wage income</th><th class="num">Founder income</th><th class="num">Founder %</th>
        <th class="num">Margin</th>
        <th class="num">Levy</th>
        <th class="num">Welfare</th><th class="num">UBI</th>
      </tr></thead>
      <tbody>${syn.snapshots.map(row).join('')}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      ⬢ = MS1 (welfare-capable). ★ = MS2 (UBI-capable). MS1 row tinted blue, MS2 tinted green.
      <strong style="color:var(--warn);">Founder income</strong> turns orange when it overtakes wage income — the pivot from labour-economy to capital-economy.
      Levy = (wage spending + founder spending) × margin × 80%.
    </div>
  </div>`;
}

function renderSynthesisExplanation(syn) {
  const a = syn.assumptions;
  const first = syn.snapshots[0];
  const last = syn.snapshots[syn.snapshots.length - 1];
  const founderShareFirst = first.founder_income / Math.max(1, first.wage_income + first.founder_income) * 100;
  const founderShareLast = last.founder_income / Math.max(1, last.wage_income + last.founder_income) * 100;
  return `
  <div class="card">
    <h3>How the math works</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      <p>
        SPICE funds <strong>welfare</strong> (MS1) and eventually <strong>universal UBI</strong> (MS2)
        by levying transactions in the colony's commerce. Three driver inputs:
      </p>
      <ul style="padding-left: 20px;">
        <li><strong style="color:var(--ok);">Cost deflation</strong> drives the UBI obligation down: basket from $${Math.round(first.basket_usd)} to $${Math.round(last.basket_usd)} → UBI obligation from $${Math.round(first.ubi_obligation/1000)}K to $${Math.round(last.ubi_obligation/1000)}K/yr.</li>
        <li><strong style="color:var(--blue);">Unemployment</strong> drives wage income DOWN. Wage component falls from $${Math.round(first.wage_income/1000)}K to $${Math.round(last.wage_income/1000)}K/yr.</li>
        <li><strong style="color:var(--warn);">Founder capital income</strong> drives total income BACK UP. Capital owners who captured AI gains spend in the colony — from $${Math.round(first.founder_income/1000)}K (${founderShareFirst.toFixed(0)}% of income) to ${last.founder_income > 1e6 ? '$' + (last.founder_income/1e6).toFixed(1) + 'M' : '$' + Math.round(last.founder_income/1000) + 'K'} (${founderShareLast.toFixed(0)}% of income).</li>
      </ul>
      <p>
        <strong style="color:var(--headline);">The pivot:</strong> the colony's economy transitions from labour-funded
        (today, ~${founderShareFirst.toFixed(0)}% founder) to capital-funded
        (${last.year}, ~${founderShareLast.toFixed(0)}% founder). The displaced eat from the table; the founders set the table; the levy is the price of dining there.
      </p>
      <p style="background: var(--panel2); border-left: 2px solid var(--ok); padding: 12px 16px; font-size: 13px;">
        <strong style="color:var(--headline);">Earlier finding revised.</strong> A previous version of this synthesis showed
        bull-unemployment <em>breaking</em> the model. That was an artefact of treating wages as the only income.
        Once we recognise that capital owners (founders, automation winners) live in the colony and spend their
        capital income locally, the levy base survives even as wage labour collapses. Bull-unemployment + capital-heavy
        profit now hits MS1 in <strong style="color:var(--ok);">${syn.milestone_1_year}</strong>
        and MS2 in <strong style="color:var(--ok);">${syn.milestone_2_year}</strong>.
      </p>
      <p style="font-size:12px; color:var(--dim);">
        Closed-form synthesis. Full per-supplier simulation at
        <a href="/trajectory" style="color:var(--dim);">/trajectory</a>.
        Switch assumptions in <code>forecasts.py</code> compute_synthesis defaults.
        Sources at <a href="/references" style="color:var(--dim);">/references</a>.
      </p>
    </div>
  </div>`;
}
