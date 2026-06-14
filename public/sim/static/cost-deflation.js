// /cost-deflation page — basket trajectory + composition + per-category detail
runPage(d => [
  renderBasketStat(d.basket_trajectory),
  renderBasketComposition(d.categories, d.basket_weights, d.basket_trajectory),
  renderCategoryChart(d.categories, d.basket_trajectory),
  renderSkeptic(d.skeptic),
  renderCategories(d.categories),
  renderBasketTable(d.basket_trajectory),
  renderSources(d.sources, "Full research synthesis: <a href=\"basket_research.md\" target=\"_blank\" style=\"color: var(--txt2);\">basket_research.md</a>. Numbers in <code>forecasts.py</code> and <code>basket_model.py</code> — edit there to refine."),
].join('\n'));

// Year-by-year aggregate basket cost (2026–2046), interpolated from the
// research basket trajectory. Today's basket ≈ $980/mo (2026 = 100%).
function renderBasketTable(traj) {
  if (!traj || traj.length === 0) return '';
  const todayBasket = 980;
  const idxAt = year => {
    if (year <= traj[0].year) return traj[0].cost_index;
    if (year >= traj[traj.length - 1].year) return traj[traj.length - 1].cost_index;
    for (let i = 0; i < traj.length - 1; i++) {
      const a = traj[i], b = traj[i + 1];
      if (year >= a.year && year <= b.year) {
        const f = (year - a.year) / (b.year - a.year);
        return a.cost_index + (b.cost_index - a.cost_index) * f;
      }
    }
    return traj[traj.length - 1].cost_index;
  };
  let rows = '';
  for (let y = 2026; y <= 2046; y++) {
    const idx = idxAt(y);
    rows += `<tr><td class="cat">${y}</td><td class="num">${idx.toFixed(1)}%</td><td class="num">$${Math.round(todayBasket * idx / 100).toLocaleString()}/mo</td></tr>`;
  }
  return `
  <div class="card" style="margin-bottom:14px;">
    <h3>Aggregate basket cost by year</h3>
    <table style="table-layout:fixed; width:100%; max-width:440px;">
      <colgroup><col style="width:30%;"><col style="width:34%;"><col style="width:36%;"></colgroup>
      <thead><tr><th>Year</th><th class="num">Cost index</th><th class="num">Basket / mo</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Linear interpolation of the aggregate-basket trajectory (2026 = 100%, today ≈ $980/mo).
      2046 held at the 2045 value — the research horizon.
    </div>
  </div>`;
}
