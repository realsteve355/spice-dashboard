// /cost-deflation page — basket trajectory + composition + per-category detail
runPage(d => [
  renderBasketStat(d.basket_trajectory),
  renderBasketComposition(d.categories, d.basket_weights, d.basket_trajectory),
  renderCategoryChart(d.categories, d.basket_trajectory),
  renderSkeptic(d.skeptic),
  renderCategories(d.categories),
  renderSources(d.sources, "Full research synthesis: <code>basket_research.md</code>. Numbers in <code>forecasts.py</code> and <code>basket_model.py</code> — edit there to refine."),
].join('\n'));
