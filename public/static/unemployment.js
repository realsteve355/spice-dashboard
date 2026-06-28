// /unemployment page — uses the shared unemployment ramp (maryfontaine.js) but
// its OWN demographics: Midwestville County, an anonymised public name for a
// real ~390,000-person US Midwest county (Butler County, OH basis).
//
// NOTE: this is an employment-page-only override. The shared maryfontaine.js
// anchor (230k / 180k adults) still drives the per-adult MAC/UBI maths on the
// Fisc and Profitability pages until those pages are re-anchored to the county.
const { unempRateAt } = MF;

// Midwestville County age structure (US Census basis, rounded):
const WORKING_AGE = 240000; // 18–64   (~62%)
const RETIRED     = 60000;  // 65+     (~15%)
const CHILDREN    = 90000;  // under 18 (~23%)
const TOTAL_POP   = WORKING_AGE + RETIRED + CHILDREN; // 390,000

runPage(d => [
  renderUnemploymentChart(d.unemployment),
  renderUnemploymentScenarios(d.unemployment),
  renderWorkforceComposition(d.unemployment),
  renderCohortTable(),
].join('\n'));

// Midwestville County population by cohort, per year. Unemployment applies
// to the working-age cohort; retired and children are out of the labour force.
// Cohorts held constant for illustration; only the employed/unemployed split moves.
function renderCohortTable() {
  const n = v => Math.round(v).toLocaleString();
  let rows = '';
  for (let t = 0; t <= 20; t++) {
    const u = unempRateAt(t);
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
      <td class="num">${n(TOTAL_POP)}</td>
    </tr>`;
  }
  return `
  <div class="card" style="margin-top:14px;">
    <h3>Midwestville County population &amp; unemployment by year</h3>
    <div style="font-size:12px; color:var(--dim); font-style:italic; margin-bottom:12px; line-height:1.6;">
      Population of ~390,000 — 300,000 adults (240,000 working-age + 60,000 retired) + 90,000 children.
      Modelled on a real US Midwest county. Unemployment applies only to the working-age cohort; retired and
      children are outside the labour force. Ramp is the colony planning case (4.2% → 75% over 20 years),
      matching the profitability and Fisc models.
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
      ~180,000 of 240,000 working-age adults are unemployed (work optional) under the colony planning case.
    </div>
  </div>`;
}
