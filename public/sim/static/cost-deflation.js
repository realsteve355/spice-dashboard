// /cost-deflation page — basket trajectory + composition + per-category detail
runPage(d => [
  renderBasketStat(d.basket_trajectory),
  renderBasketComposition(d.categories, d.basket_weights, d.basket_trajectory),
  renderCategoryChart(d.categories, d.basket_trajectory),
  renderSkeptic(d.skeptic),
  renderCategories(d.categories),
  renderSources(d.sources, "Full research synthesis: <a href=\"basket_research.md\" target=\"_blank\" style=\"color: var(--txt2);\">basket_research.md</a>. Numbers in <code>forecasts.py</code> and <code>basket_model.py</code> — edit there to refine."),
].join('\n'));
