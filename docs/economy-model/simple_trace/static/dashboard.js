// Simple-trace dashboard: vanilla JS, no charts (yet — the data tables are the point)

const fmtUSD = n => {
  const abs = Math.abs(n);
  if (abs >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M';
  if (abs >= 1e4) return '$' + (n/1e3).toFixed(1) + 'K';
  return '$' + Math.round(n).toLocaleString();
};
const fmtN = n => Math.round(n).toLocaleString();
const fmtPct = n => n.toFixed(1) + '%';

// Slider display sync
const sliders = [
  { id: 'levy_cap',     fmt: v => Math.round(parseFloat(v) * 100) + '%' },
  { id: 'ubi_mult',     fmt: v => parseFloat(v).toFixed(2) + 'x' },
  { id: 'ext_spend',    fmt: v => Math.round(parseFloat(v) * 100) + '%' },
  { id: 'daves_rev',    fmt: v => '$' + (parseInt(v) / 1000) + 'K' },
  { id: 'daves_b2b',    fmt: v => '$' + (parseInt(v) / 1000) + 'K' },
  { id: 'daves_salary', fmt: v => '$' + (parseInt(v) / 1000) + 'K' },
];
sliders.forEach(s => {
  const inp = document.getElementById(s.id);
  const out = document.getElementById(s.id + '_v');
  if (inp && out) {
    inp.addEventListener('input', () => out.textContent = s.fmt(inp.value));
    out.textContent = s.fmt(inp.value);
  }
});

function readConfig() {
  // Build a config dict that overrides the server defaults.
  // For Dave's Co specifically, we override its row in local_companies.
  const ubi_mult = parseFloat(document.getElementById('ubi_mult').value);
  const ext_spend = parseFloat(document.getElementById('ext_spend').value);
  const levy_cap = parseFloat(document.getElementById('levy_cap').value);
  const daves_rev = parseInt(document.getElementById('daves_rev').value);
  const daves_b2b = parseInt(document.getElementById('daves_b2b').value);
  const daves_salary = parseInt(document.getElementById('daves_salary').value);
  const formula = document.getElementById('levy_formula').value;

  // We need to pass the local_companies list with the modified Dave's Co.
  // Defaults from server (mirror sim.py):
  const local_companies = [
    {name: "Dave's Co",      external_rev_usd: daves_rev, p_per_emp: 200000,
     employees: 4, b2b_import_usd: daves_b2b, b2b_import_sector: "retail_online"},
    {name: "Colony Café",    external_rev_usd: 0,      p_per_emp:  15000,
     employees: 3, b2b_import_usd:  4000, b2b_import_sector: "grocery"},
    {name: "FixIt Repair",   external_rev_usd: 0,      p_per_emp:  40000,
     employees: 2, b2b_import_usd:  2000, b2b_import_sector: "misc"},
    {name: "Hilltop School", external_rev_usd: 0,      p_per_emp:  30000,
     employees: 5, b2b_import_usd:  3000, b2b_import_sector: "retail_online"},
    {name: "MedClinic",      external_rev_usd: 0,      p_per_emp:  80000,
     employees: 3, b2b_import_usd:  6000, b2b_import_sector: "healthcare"},
  ];

  // Family types — also adjust Dave's family salary from the slider.
  const family_types = [
    [4, "single workless",            0, 0, 1, 0,    0,        0],
    [3, "single retired",             0, 1, 0, 0,    0,    1200],
    [3, "retired couple",             0, 2, 0, 0,    0,    1000],
    [3, "single worker",              1, 0, 0, 0, 4000,        0],
    [2, "couple, both working",       2, 0, 0, 0, 4000,        0],
    [1, "Dave's family (founder)",    2, 0, 0, 2, daves_salary, 0],
    [4, "family-with-kids, 1 earner", 1, 0, 1, 2, 4000,        0],
  ];

  return {
    ubi_multiplier: ubi_mult,
    external_spend_fraction: ext_spend,
    levy_cap_rate: levy_cap,
    levy_formula: formula,
    local_companies,
    family_types,
  };
}

const btn = document.getElementById('run-btn');
const status = document.getElementById('status');
const results = document.getElementById('results');

btn.addEventListener('click', async () => {
  btn.disabled = true;
  status.textContent = 'running…';
  try {
    const r = await fetch('/api/run', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(readConfig()),
    });
    if (!r.ok) {
      const err = await r.json();
      status.textContent = 'ERROR: ' + (err.error || r.status);
      return;
    }
    status.textContent = 'done';
    render(await r.json());
  } catch (e) {
    status.textContent = 'ERROR: ' + e;
  } finally {
    btn.disabled = false;
  }
});

function render(d) {
  const html = [];
  html.push(renderSummary(d));
  html.push(renderPopulation(d));
  html.push(renderIncome(d));
  html.push(renderStreams(d));
  html.push(renderLocalCompanies(d));
  html.push(renderSuppliers(d));
  html.push(renderBudget(d));
  html.push(renderFamilyTypes(d));
  results.innerHTML = html.join('\n');
}

function renderSummary(d) {
  const b = d.budget;
  const sLossClass = b.shortfall_pct > 20 ? 'crit' : b.shortfall_pct > 5 ? 'warn' : 'ok';
  const broken = b.broken_suppliers.length;
  const brokenClass = broken === 0 ? 'ok' : broken <= 3 ? 'warn' : 'crit';
  const aValue = d.config.a;
  return `
  <div class="card">
    <h3>Headline</h3>
    <div class="stats">
      <div class="stat">
        <div class="label">UBI obligation</div>
        <div class="value">${fmtUSD(b.ubi_obligation)}</div>
        <div class="sub">monthly · ${d.population.n_citizens} citizens × ${fmtUSD(d.income.ubi_usd_per_citizen)}</div>
      </div>
      <div class="stat">
        <div class="label">Levy collected</div>
        <div class="value">${fmtUSD(b.automation_collected)}</div>
        <div class="sub">automation · gas+protocol additionally ${fmtUSD(b.gas_pool + b.protocol_treasury)}</div>
      </div>
      <div class="stat">
        <div class="label">Shortfall</div>
        <div class="value ${sLossClass}">${fmtPct(b.shortfall_pct)}</div>
        <div class="sub">${fmtUSD(b.shortfall)} of UBI uncovered</div>
      </div>
      <div class="stat">
        <div class="label">Broken suppliers</div>
        <div class="value ${brokenClass}">${broken}</div>
        <div class="sub">rate would exceed cap</div>
      </div>
    </div>
    <div style="margin-top:12px; font-size: 11px; color: var(--dim);">
      Levy coefficient a = ${aValue.toExponential(3)}
      &middot; formula: ${d.config.levy_formula}
      &middot; cap: ${Math.round(d.config.levy_cap_rate * 100)}%
    </div>
  </div>`;
}

function renderPopulation(d) {
  const p = d.population;
  return `
  <div class="card">
    <h3>Population</h3>
    <div class="stats">
      <div class="stat"><div class="label">Citizens</div><div class="value">${p.n_citizens}</div><div class="sub">${p.n_families} families</div></div>
      <div class="stat"><div class="label">Working</div><div class="value">${p.n_working}</div><div class="sub">${Math.round(p.n_working/p.n_citizens*100)}%</div></div>
      <div class="stat"><div class="label">Retired</div><div class="value">${p.n_retired}</div><div class="sub">${Math.round(p.n_retired/p.n_citizens*100)}%</div></div>
      <div class="stat"><div class="label">Workless</div><div class="value">${p.n_workless}</div><div class="sub">${Math.round(p.n_workless/p.n_citizens*100)}% (excl. children)</div></div>
    </div>
    <div style="margin-top:8px; color:var(--faint); font-size:11px;">
      Children: ${p.n_children} (${Math.round(p.n_children/p.n_citizens*100)}%)
    </div>
  </div>`;
}

function renderIncome(d) {
  const i = d.income;
  return `
  <div class="card">
    <h3>Monthly income flows</h3>
    <table>
      <thead><tr><th>Stream</th><th class="num">USD/month</th></tr></thead>
      <tbody>
        <tr><td>Total UBI minted by Fisc</td><td class="num">${fmtUSD(i.total_ubi)}</td></tr>
        <tr><td>Total salary (from local cos' external revenue)</td><td class="num">${fmtUSD(i.total_salary)}</td></tr>
        <tr><td>Total pension (from external)</td><td class="num">${fmtUSD(i.total_pension)}</td></tr>
        <tr><td><strong>Total income</strong></td><td class="num"><strong>${fmtUSD(i.total_income)}</strong></td></tr>
      </tbody>
    </table>
  </div>`;
}

function renderStreams(d) {
  const s = d.streams;
  const totalGross = s.family_to_external.gross + s.family_to_local.gross + s.local_to_external_b2b.gross;
  const totalVxP = s.family_to_external.v_x_p + s.family_to_local.v_x_p + s.local_to_external_b2b.v_x_p;
  return `
  <div class="card">
    <h3>Transaction streams (this month)</h3>
    <table>
      <thead><tr>
        <th>Stream</th><th class="num"># tx</th><th class="num">Gross $</th>
        <th class="num">Σ(V × P)</th><th class="num">% of Σ(V × P)</th>
      </tr></thead>
      <tbody>
        <tr>
          <td>A · family → external supplier (levied)</td>
          <td class="num">${s.family_to_external.n}</td>
          <td class="num">${fmtUSD(s.family_to_external.gross)}</td>
          <td class="num">${fmtUSD(s.family_to_external.v_x_p)}</td>
          <td class="num">${(s.family_to_external.v_x_p / totalVxP * 100).toFixed(1)}%</td>
        </tr>
        <tr>
          <td>B · family → local company (levied)</td>
          <td class="num">${s.family_to_local.n}</td>
          <td class="num">${fmtUSD(s.family_to_local.gross)}</td>
          <td class="num">${fmtUSD(s.family_to_local.v_x_p)}</td>
          <td class="num">${(s.family_to_local.v_x_p / totalVxP * 100).toFixed(1)}%</td>
        </tr>
        <tr>
          <td>C · local company → external (B2B import, levied)</td>
          <td class="num">${s.local_to_external_b2b.n}</td>
          <td class="num">${fmtUSD(s.local_to_external_b2b.gross)}</td>
          <td class="num">${fmtUSD(s.local_to_external_b2b.v_x_p)}</td>
          <td class="num">${(s.local_to_external_b2b.v_x_p / totalVxP * 100).toFixed(1)}%</td>
        </tr>
        <tr style="color: var(--faint);">
          <td>(external customer → local company — NOT levied; destination's Fisc)</td>
          <td class="num">—</td><td class="num">—</td><td class="num">—</td><td class="num">—</td>
        </tr>
        <tr>
          <td><strong>Total levied</strong></td>
          <td class="num"><strong>${d.transactions.total_n}</strong></td>
          <td class="num"><strong>${fmtUSD(totalGross)}</strong></td>
          <td class="num"><strong>${fmtUSD(totalVxP)}</strong></td>
          <td class="num">100.0%</td>
        </tr>
      </tbody>
    </table>
    <div style="font-size: 11px; color: var(--faint); margin-top: 8px;">
      Avg P/emp weighted by gross: ${fmtUSD(d.transactions.avg_p_per_emp_weighted)} ·
      Avg ${d.transactions.txs_per_family.toFixed(1)} levied transactions/family/month ·
      Plus ${fmtUSD(d.visitor_revenue_total_usd)}/mo flowing INTO the colony from external visitors at local cos (NOT levied)
    </div>
  </div>`;
}

function renderLocalCompanies(d) {
  const realisticThreshold = 60000;  // $/employee/year — below this, undersized
  const row = c => {
    const ok = c.rev_per_employee_yr >= realisticThreshold;
    const cls = ok ? '' : 'broken';
    const flag = ok ? '' : ' ⚠';
    return `<tr class="${cls}">
      <td class="cat">${c.name}${flag}</td>
      <td class="num">${c.employees}</td>
      <td class="num">${fmtUSD(c.internal_rev_usd)}</td>
      <td class="num">${fmtUSD(c.external_rev_usd)}</td>
      <td class="num">${fmtUSD(c.total_rev_usd)}</td>
      <td class="num">${fmtUSD(c.rev_per_employee_yr)}</td>
      <td class="num">${fmtUSD(c.b2b_import_usd)}</td>
    </tr>`;
  };
  return `
  <div class="card">
    <h3>Local company viability</h3>
    <table>
      <thead><tr>
        <th>Company</th>
        <th class="num">Emps</th>
        <th class="num">Internal rev (levied)</th>
        <th class="num">External rev (visitors, NOT levied)</th>
        <th class="num">Total rev</th>
        <th class="num">$/emp/yr</th>
        <th class="num">B2B imports</th>
      </tr></thead>
      <tbody>${d.local_companies.map(row).join('')}</tbody>
    </table>
    <div style="font-size: 11px; color: var(--faint); margin-top: 8px;">
      Red = revenue/employee below $60K/year (undersized — couldn't realistically support staff).
      External revenue = visitors paying USDC into the colony (per Steve's destination-principle, not levied here).
    </div>
  </div>`;
}

function renderSuppliers(d) {
  // Sort: external first, then local; within each, by gross desc.
  const ext = d.suppliers.filter(s => s.kind === 'external' && s.n_tx > 0).sort((a,b)=>b.gross-a.gross);
  const loc = d.suppliers.filter(s => s.kind === 'local' && s.n_tx > 0).sort((a,b)=>b.gross-a.gross);
  const row = s => {
    const cls = s.is_broken ? 'broken' : (s.implied_rate_pct > 50 ? 'high' : '');
    const flag = s.shortfall > 0.01 ? ' ⚠' : '';
    return `<tr class="${cls}">
      <td><span class="pill ${s.kind}">${s.kind}</span></td>
      <td class="cat">${s.name}${flag}</td>
      <td class="num">${fmtUSD(s.p_per_emp)}</td>
      <td class="num">${s.n_tx}</td>
      <td class="num">${fmtUSD(s.gross)}</td>
      <td class="num">${s.implied_rate_pct.toFixed(1)}%</td>
      <td class="num">${s.actual_rate_pct.toFixed(1)}%</td>
      <td class="num">${fmtUSD(s.automation_levy)}</td>
      <td class="num">${fmtUSD(s.net_to_supplier)}</td>
    </tr>`;
  };
  return `
  <div class="card">
    <h3>Suppliers (sorted by gross)</h3>
    <table>
      <thead><tr>
        <th>Kind</th><th>Supplier</th>
        <th class="num">P/emp</th><th class="num"># tx</th><th class="num">Gross</th>
        <th class="num">Rate (formula)</th><th class="num">Rate (capped)</th>
        <th class="num">Auto levy</th><th class="num">Net</th>
      </tr></thead>
      <tbody>${ext.map(row).join('')}${loc.map(row).join('')}</tbody>
    </table>
    <div style="margin-top:8px; font-size:11px; color: var(--faint);">
      Red rows = formula breaks (rate &gt; 100%); orange = high (&gt; 50%).
      ⚠ = capped at ${Math.round(d.config.levy_cap_rate * 100)}% with shortfall.
    </div>
  </div>`;
}

function renderBudget(d) {
  const b = d.budget;
  const cls = b.shortfall_pct > 20 ? 'crit' : b.shortfall_pct > 5 ? '' : 'ok';
  const brokenList = b.broken_suppliers.length === 0
    ? '<em style="color:var(--ok);">none — formula stays under the cap for every supplier.</em>'
    : '<ul style="margin: 4px 0 0 0; padding-left: 18px;">' +
      b.broken_suppliers.map(s => `<li>${s.name}: would-be rate ${s.rate_pct.toFixed(0)}%</li>`).join('') +
      '</ul>';
  return `
  <div class="card">
    <h3>Budget balance</h3>
    <table>
      <tr><td>UBI obligation</td><td class="num">${fmtUSD(b.ubi_obligation)}</td></tr>
      <tr><td>Automation levy collected (capped)</td><td class="num">${fmtUSD(b.automation_collected)}</td></tr>
      <tr><td>Shortfall</td><td class="num">${fmtUSD(b.shortfall)} (${fmtPct(b.shortfall_pct)})</td></tr>
      <tr><td>Gas pool (chain validators)</td><td class="num">${fmtUSD(b.gas_pool)}</td></tr>
      <tr><td>Protocol treasury (founders)</td><td class="num">${fmtUSD(b.protocol_treasury)}</td></tr>
    </table>
    <div class="callout ${cls}" style="margin-top:10px;">
      <strong>Suppliers where the formula breaks:</strong><br>${brokenList}
    </div>
  </div>`;
}

function renderFamilyTypes(d) {
  return `
  <div class="card">
    <h3>By family type</h3>
    <table>
      <thead><tr>
        <th>Family type</th><th class="num">Count</th><th class="num">Members</th>
        <th class="num">Avg income</th><th class="num">Avg external spend</th>
      </tr></thead>
      <tbody>
        ${d.by_family_type.map(t => `
          <tr>
            <td class="cat">${t.label}</td>
            <td class="num">${t.n_families}</td>
            <td class="num">${t.members}</td>
            <td class="num">${fmtUSD(t.avg_income_per_family)}</td>
            <td class="num">${fmtUSD(t.avg_external_spend_per_family)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
}

// Auto-run on page load
window.addEventListener('DOMContentLoaded', () => btn.click());
