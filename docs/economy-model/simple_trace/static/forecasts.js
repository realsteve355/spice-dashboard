// /forecasts (central overview) page — headline, quotes, 3 nav cards out
// to sub-pages, synthesis verdict + per-year math + explanation.

runPage(d => [
  renderHeadline(d.headline),
  renderQuotes(d.quotes),
  renderNavCards(d),
  renderSynthesisVerdict(d.synthesis),
  renderSynthesisTable(d.synthesis),
  renderSynthesisExplanation(d.synthesis),
  renderHenryFordCallout(d.profitability),
].join('\n'));

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
  const lastBasket = d.basket_trajectory[d.basket_trajectory.length - 1];
  const mainstreamUnemp = d.unemployment.scenarios[0].checkpoints[d.unemployment.scenarios[0].checkpoints.length - 1];
  const capitalScenario = d.profitability.scenarios[0];
  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Three drivers · click for detail</h3>
    <div class="cat-grid" style="grid-template-columns: repeat(3, 1fr);">
      <a href="/cost-deflation" style="text-decoration:none;">
        <div class="cat-card ok" style="cursor:pointer; height:100%;">
          <div class="cat-name" style="margin-bottom:6px;">Cost deflation →</div>
          <div style="font-size:11px; color:var(--dim); margin-bottom:8px;">11 categories with research-anchored cost trajectories. Land excluded.</div>
          <div style="font-size:18px; color:var(--ok); font-variant-numeric:tabular-nums;">${lastBasket.cost_index.toFixed(0)}%</div>
          <div style="font-size:10px; color:var(--faint);">basket cost in ${lastBasket.year} (vs 100% today)</div>
        </div>
      </a>
      <a href="/unemployment" style="text-decoration:none;">
        <div class="cat-card blue" style="cursor:pointer; height:100%;">
          <div class="cat-name" style="margin-bottom:6px;">Unemployment →</div>
          <div style="font-size:11px; color:var(--dim); margin-bottom:8px;">Three scenarios: mainstream, bull, sceptic. Spread is enormous.</div>
          <div style="font-size:18px; color:var(--blue); font-variant-numeric:tabular-nums;">${mainstreamUnemp.unemployment_pct}%</div>
          <div style="font-size:10px; color:var(--faint);">mainstream forecast for ${mainstreamUnemp.year}</div>
        </div>
      </a>
      <a href="/profitability" style="text-decoration:none;">
        <div class="cat-card warn" style="cursor:pointer; height:100%;">
          <div class="cat-name" style="margin-bottom:6px;">Profitability →</div>
          <div style="font-size:11px; color:var(--dim); margin-bottom:8px;">Acemoglu-Restrepo: who captures the gains — capital, consumer, labour?</div>
          <div style="font-size:18px; color:var(--warn); font-variant-numeric:tabular-nums;">${capitalScenario.capital_pct}%</div>
          <div style="font-size:10px; color:var(--faint);">capital share in current US trajectory</div>
        </div>
      </a>
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px;">
      Each sub-page presents the source-attributed forecast data for that driver.
      The synthesis below combines all three to compute when SPICE reaches
      welfare-capable (M1) and full-UBI-capable (M2).
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
    <h3>Synthesis verdict — when do M1 and M2 land?</h3>
    <div class="stats" style="grid-template-columns: repeat(2, 1fr);">
      <div class="stat">
        <div class="label">M1 — Welfare-capable</div>
        <div class="value ${m1Class}" style="font-size: 28px;">${m1 || '—'}</div>
        <div class="sub">first year levy ≥ State welfare obligation (cost-neutral switch-on)</div>
      </div>
      <div class="stat">
        <div class="label">M2 — Full UBI-capable</div>
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
      ⬢ = M1 (welfare-capable). ★ = M2 (UBI-capable). M1 row tinted blue, M2 tinted green.
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
        SPICE funds <strong>welfare</strong> (M1) and eventually <strong>universal UBI</strong> (M2)
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
        profit now hits M1 in <strong style="color:var(--ok);">${syn.milestone_1_year}</strong>
        and M2 in <strong style="color:var(--ok);">${syn.milestone_2_year}</strong>.
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
