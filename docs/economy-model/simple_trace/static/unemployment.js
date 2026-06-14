// /unemployment page
runPage(d => [
  renderUnemploymentChart(d.unemployment),
  renderUnemploymentScenarios(d.unemployment),
  renderWorkforceComposition(d.unemployment),
  renderCohortTable(),
].join('\n'));

// MaryFontaine population by cohort, per year. Unemployment applies to the
// working-age cohort; retired and children are out of the labour force.
// Cohorts held constant for illustration; only the employed/unemployed split moves.
function renderCohortTable() {
  const CHILDREN = 50000;      // under 18 (~22% of population)
  const RETIRED = 40000;       // 65+ (~22% of 180k adults)
  const WORKING_AGE = 140000;  // 18-64 (~78% of 180k adults)
  const TOTAL = CHILDREN + RETIRED + WORKING_AGE;  // 230,000 (180,000 adults)
  // Colony planning unemployment ramp (matches the profitability + colony model).
  const RAMP = [{ y: 0, v: 4.2 }, { y: 5, v: 18 }, { y: 10, v: 35 }, { y: 15, v: 55 }, { y: 20, v: 75 }];
  const rateAt = t => {
    if (t <= RAMP[0].y) return RAMP[0].v;
    if (t >= RAMP[RAMP.length - 1].y) return RAMP[RAMP.length - 1].v;
    for (let i = 0; i < RAMP.length - 1; i++) {
      if (t >= RAMP[i].y && t <= RAMP[i + 1].y) {
        const f = (t - RAMP[i].y) / (RAMP[i + 1].y - RAMP[i].y);
        return RAMP[i].v + (RAMP[i + 1].v - RAMP[i].v) * f;
      }
    }
    return RAMP[RAMP.length - 1].v;
  };
  const n = v => Math.round(v).toLocaleString();
  let rows = '';
  for (let t = 0; t <= 20; t++) {
    const u = rateAt(t);
    const unemployed = WORKING_AGE * u / 100;
    const employed = WORKING_AGE - unemployed;
    rows += `<tr>
      <td class="cat">${2026 + t}</td>
      <td class="num">${u.toFixed(1)}%</td>
      <td class="num">${n(WORKING_AGE)}</td>
      <td class="num">${n(employed)}</td>
      <td class="num" style="color:var(--crit);">${n(unemployed)}</td>
      <td class="num">${n(RETIRED)}</td>
      <td class="num">${n(CHILDREN)}</td>
      <td class="num">${n(TOTAL)}</td>
    </tr>`;
  }
  return `
  <div class="card" style="margin-top:14px;">
    <h3>MaryFontaine population &amp; unemployment by year</h3>
    <div style="font-size:12px; color:var(--dim); font-style:italic; margin-bottom:12px; line-height:1.6;">
      Population of ~230,000 — 180,000 adults (140,000 working-age + 40,000 retired) + 50,000 children.
      Unemployment applies only to the working-age cohort; retired and children are outside the labour force. Ramp is
      the colony planning case (4.2% → 75% over 20 years), matching the profitability and colony models.
    </div>
    <table style="table-layout:fixed; width:100%;">
      <colgroup><col style="width:8%;"><col style="width:11%;"><col style="width:14%;"><col style="width:14%;"><col style="width:15%;"><col style="width:13%;"><col style="width:13%;"><col style="width:12%;"></colgroup>
      <thead><tr>
        <th>Year</th>
        <th class="num">Unemp rate</th>
        <th class="num">Working-age</th>
        <th class="num">Employed</th>
        <th class="num">Unemployed</th>
        <th class="num">Retired</th>
        <th class="num">Children</th>
        <th class="num">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Cohort sizes held constant for illustration; only the employed / unemployed split changes. By Year 20,
      ~105,000 of 140,000 working-age adults are unemployed (work optional) under the colony planning case.
    </div>
  </div>`;
}
