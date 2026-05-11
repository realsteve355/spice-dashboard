// /cost-deflation page — basket trajectory + composition + per-category detail
runPage(d => [
  renderBasketStat(d.basket_trajectory),
  renderSpiceBasketStat(d.spice_basket_trajectory),
  renderBasketComposition(d.categories, d.basket_weights, d.basket_trajectory),
  renderCategoryChart(d.categories, d.basket_trajectory, d.spice_basket_trajectory),
  renderSkeptic(d.skeptic),
  renderCategories(d.categories),
  renderSources(d.sources, "Full research synthesis: <code>basket_research.md</code>. Numbers in <code>forecasts.py</code> and <code>basket_model.py</code> — edit there to refine."),
].join('\n'));

function renderSpiceBasketStat(traj) {
  if (!traj || traj.length === 0) return '';
  const todayBasket = 980;
  const stat = pt => `
    <div class="stat" style="border-left: 2px solid var(--crit);">
      <div class="label" style="color: var(--crit);">${pt.year}</div>
      <div class="value">${pt.cost_index.toFixed(0)}%</div>
      <div class="sub">$${Math.round(todayBasket * pt.cost_index / 100).toLocaleString()}/mo</div>
    </div>
  `;
  return `
  <div class="card" style="margin-bottom:14px; border-left: 3px solid var(--crit);">
    <h3>SPICE basket — planning projection (more aggressive than research aggregate)</h3>
    <div class="stats" style="grid-template-columns: repeat(${traj.length}, 1fr);">
      ${traj.map(stat).join('')}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      SPICE colonies plan against this more aggressive deflation curve: ~95% basket cost reduction by 2045 (vs ~85% in the research aggregate above).
      Used as the design case for SPICE architecture. The forecast charts below show both lines.
    </div>
  </div>`;
}
