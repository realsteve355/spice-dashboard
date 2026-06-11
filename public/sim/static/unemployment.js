// /unemployment page
runPage(d => [
  renderUnemploymentChart(d.unemployment),
  renderUnemploymentScenarios(d.unemployment),
  renderWorkforceComposition(d.unemployment),
].join('\n'));
