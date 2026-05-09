// /unemployment page
runPage(d => [
  renderUnemploymentChart(d.unemployment),
  renderUnemploymentScenarios(d.unemployment),
].join('\n'));
