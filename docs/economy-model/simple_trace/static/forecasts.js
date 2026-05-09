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
  const row = s => {
    const m1Hit = syn.milestone_1_year === s.year;
    const m2Hit = syn.milestone_2_year === s.year;
    let phase = 'IMPL';
    if (syn.milestone_2_year && s.year >= syn.milestone_2_year) phase = '<span style="color:var(--ok);">FULL UBI</span>';
    else if (syn.milestone_1_year && s.year >= syn.milestone_1_year) phase = '<span style="color:var(--blue);">WELFARE</span>';
    else phase = '<span style="color:var(--dim);">IMPL</span>';

    return `<tr ${m2Hit ? 'style="background:rgba(93, 211, 158, 0.08);"' : (m1Hit ? 'style="background:rgba(59, 130, 246, 0.08);"' : '')}>
      <td class="cat">${s.year}${m1Hit ? ' ⬢' : ''}${m2Hit ? ' ★' : ''}</td>
      <td>${phase}</td>
      <td class="num">$${Math.round(s.basket_usd).toLocaleString()}</td>
      <td class="num">${s.unemployment_pct}%</td>
      <td class="num">$${Math.round(s.income).toLocaleString()}</td>
      <td class="num">${s.margin_pct}%</td>
      <td class="num">$${Math.round(s.profit_pool).toLocaleString()}</td>
      <td class="num">$${Math.round(s.levy_capacity).toLocaleString()}</td>
      <td class="num">$${Math.round(s.welfare_obligation).toLocaleString()}</td>
      <td class="num">$${Math.round(s.ubi_obligation).toLocaleString()}</td>
    </tr>`;
  };

  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Per-year synthesis math</h3>
    <table>
      <thead><tr>
        <th>Year</th><th>Phase</th>
        <th class="num">Basket $/mo</th><th class="num">Unemp %</th>
        <th class="num">Income $/yr</th><th class="num">Margin</th>
        <th class="num">Profit pool $/yr</th><th class="num">Levy capacity $/yr</th>
        <th class="num">Welfare $/yr</th><th class="num">UBI $/yr</th>
      </tr></thead>
      <tbody>${syn.snapshots.map(row).join('')}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      ⬢ = M1 (welfare-capable). ★ = M2 (UBI-capable). M1 row highlighted blue, M2 row highlighted green.
      Income = UBI + (working-adults × salary × employment-factor). Spending = income × 55%.
      Profit pool = spending × margin. Levy = profit × 80% capture cap.
    </div>
  </div>`;
}

function renderSynthesisExplanation(syn) {
  const a = syn.assumptions;
  const first = syn.snapshots[0];
  const last = syn.snapshots[syn.snapshots.length - 1];
  return `
  <div class="card">
    <h3>How the math works</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      <p>
        SPICE's job is to fund <strong>welfare</strong> (M1) and eventually <strong>universal UBI</strong> (M2).
        The model needs three numbers per year, all of which come from the sub-pages:
      </p>
      <ul style="padding-left: 20px;">
        <li><strong style="color:var(--ok);">Cost deflation</strong> drives the UBI obligation. Basket falls from $${Math.round(first.basket_usd)} to $${Math.round(last.basket_usd)} → UBI obligation falls from $${Math.round(first.ubi_obligation/1000)}K to $${Math.round(last.ubi_obligation/1000)}K/yr.</li>
        <li><strong style="color:var(--blue);">Unemployment</strong> drives the income side. Working-adult employment factor falls from ${(first.employment_factor*100).toFixed(0)}% to ${(last.employment_factor*100).toFixed(0)}% — wages collapse with displacement, reducing spending and therefore the profit pool.</li>
        <li><strong style="color:var(--warn);">Profitability split</strong> determines margin growth. Capital-heavy scenario expands margins from ${a.today_margin_pct}% to ${a.target_margin_pct}% — this is what offsets shrinking spending volume.</li>
      </ul>
      <p>
        The synthesis: per-year levy capacity = (UBI + salary income) × 55% spending share × margin × 80% capture cap. Compare against welfare and UBI obligations to find M1 and M2.
      </p>
      <p>
        <strong style="color:var(--headline);">Critical finding:</strong> the math only closes under <em>capital-heavy profitability</em>. Bull-case unemployment (90% by 2045) actually <em>breaks</em> the model — when nobody is employed, salary income vanishes, spending shrinks, the profit pool isn't there to levy. SPICE depends on the colony retaining a working economy that produces a profit pool, even as automation expands.
      </p>
      <p style="font-size:12px; color:var(--dim);">
        These numbers are a closed-form back-of-envelope. The full per-supplier, per-transaction simulation lives at
        <a href="/trajectory" style="color:var(--dim);">/trajectory</a>. Switch sub-page assumptions
        in <code>forecasts.py</code> (compute_synthesis defaults) to explore alternative scenarios.
        Deep references at <a href="/references" style="color:var(--dim);">/references</a>.
      </p>
    </div>
  </div>`;
}
