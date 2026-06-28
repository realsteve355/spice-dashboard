// /basket — "The basket today" page.
//
// Self-contained: the category data is authored here. The category SHARES
// mirror BASKET_WEIGHTS in forecasts.py (the canonical basket the trajectory /
// fisc pages use); the monthly anchor mirrors MF.BASKET_TODAY ($1,600/mo per
// person, incl. basic housing, excl. land). The NEW content on this page is the
// per-category SOURCE mapping — the kinds of stores and firms that capture each
// line of spending — which is the input to the future MAC sizing work: the MAC
// is charged on the firms that capture basket revenue, so we first need to know
// who they are and whether they sit inside the colony or outside it.
//
// scope: 'local'    — spending captured mostly by firms physically in the county
//        'external' — flows out to national / global firms and platforms
//        'mixed'    — split between the two

const BASKET_TODAY = 1600;          // $/mo per person — mirrors MF.BASKET_TODAY
const ANNUAL = BASKET_TODAY * 12;   // $19,200/yr per person

// Each: name, weight (% of basket), what it covers, sources [{ name, scope }],
// scope (dominant), trend (price direction note).
const BASKET = [
  {
    name: "Rent / mortgage (basic housing)", weight: 40.0, scope: "mixed",
    covers: "Rent or mortgage on basic engineered / modular housing — the structure only. Land value and premium housing are out of scope (a wealth asset, not a basket item).",
    trend: "Slowly deflating as construction industrialises (modular, 3D-print, robotic build). Land excluded.",
    sources: [
      { name: "Local landlords & property-management companies (rent)", scope: "local" },
      { name: "Regional & national homebuilders — D.R. Horton, Lennar (new build)", scope: "external" },
      { name: "Mortgage lenders & banks (interest)", scope: "external" },
    ],
  },
  {
    name: "Manufactured goods", weight: 11.0, scope: "external",
    covers: "Appliances, electronics, furniture, household durables, tools.",
    trend: "Deflating — global manufacturing + automation. Electronics fastest.",
    sources: [
      { name: "Big-box retail — Walmart, Target, Best Buy", scope: "external" },
      { name: "Amazon & online marketplaces", scope: "external" },
      { name: "Home Depot / Lowe's, furniture retailers", scope: "external" },
      { name: "Made by global manufacturers (mostly Asia)", scope: "external" },
    ],
  },
  {
    name: "Food (general groceries)", weight: 10.0, scope: "mixed",
    covers: "Produce, packaged goods, dairy, staples.",
    trend: "Roughly flat — automation offsets historical food inflation.",
    sources: [
      { name: "Supermarkets — Kroger (HQ in the metro), Walmart, Aldi, Meijer, Costco", scope: "mixed" },
      { name: "Discount & dollar grocers", scope: "external" },
      { name: "Local farms, markets & independents (small share)", scope: "local" },
    ],
  },
  {
    name: "Services (hospitality, care)", weight: 9.0, scope: "local",
    covers: "Restaurants, cafés, bars, salons, childcare, eldercare, gyms, repair.",
    trend: "Inflating (+2%/yr) — slowest to automate; physical presence + emotional labour.",
    sources: [
      { name: "Local independent restaurants, cafés & trades", scope: "local" },
      { name: "Regional service chains & franchises", scope: "mixed" },
      { name: "Childcare, eldercare & care providers", scope: "local" },
    ],
  },
  {
    name: "Transport", weight: 7.0, scope: "mixed",
    covers: "Vehicle purchase / lease, fuel, insurance, repair, rideshare, transit.",
    trend: "Deflating — EV cost decline + autonomy removes the driver cost.",
    sources: [
      { name: "Auto dealers & automakers (vehicles)", scope: "external" },
      { name: "Gas stations / oil majors (fuel)", scope: "external" },
      { name: "Local repair shops & dealers (service)", scope: "local" },
      { name: "Insurers; Uber / Lyft; public transit", scope: "mixed" },
    ],
  },
  {
    name: "Energy & utilities", weight: 6.0, scope: "external",
    covers: "Electricity, natural gas, water.",
    trend: "Deflating fast — solar 20%/doubling, batteries 18–35%/doubling (Wright curves).",
    sources: [
      { name: "Regulated electric & gas utilities — e.g. Duke Energy Ohio", scope: "external" },
      { name: "Municipal water authorities", scope: "local" },
    ],
  },
  {
    name: "Food (proteins)", weight: 5.0, scope: "mixed",
    covers: "Meat, poultry, fish.",
    trend: "Mild inflation → flat. Cultured / lab meat eases it later.",
    sources: [
      { name: "Grocery meat counters & butchers (retail)", scope: "mixed" },
      { name: "Meat processors — Tyson, JBS (production)", scope: "external" },
    ],
  },
  {
    name: "Healthcare", weight: 5.0, scope: "mixed",
    covers: "Out-of-pocket care, pharmacy, insurance premiums, dental.",
    trend: "Mild inflation — AI offsets cost but aging demographics push up.",
    sources: [
      { name: "Hospitals & local health systems, clinics", scope: "local" },
      { name: "Pharmacies — CVS, Walgreens, Kroger Rx", scope: "mixed" },
      { name: "Health insurers", scope: "external" },
    ],
  },
  {
    name: "Education", weight: 3.0, scope: "mixed",
    covers: "Tuition, tutoring, childcare-education, courses, materials.",
    trend: "Slight deflation — AI tutors deflate delivery; credentialing value sticky.",
    sources: [
      { name: "Universities & colleges in the county (e.g. Miami University)", scope: "local" },
      { name: "Private tutoring, daycare & training", scope: "local" },
      { name: "Online platforms & courseware", scope: "external" },
    ],
  },
  {
    name: "Intelligence / digital", weight: 2.0, scope: "external",
    covers: "Streaming, software, apps, cloud, mobile & internet service.",
    trend: "Deflating fast (−10%/yr) — approaches near-zero marginal cost.",
    sources: [
      { name: "Streaming — Netflix, Disney+", scope: "external" },
      { name: "Software & cloud — Apple, Google, Microsoft", scope: "external" },
      { name: "Telecom / ISP — Spectrum, AT&T", scope: "external" },
    ],
  },
  {
    name: "Apparel", weight: 2.0, scope: "external",
    covers: "Clothing, footwear, accessories.",
    trend: "Deflating (−3%/yr) — already falling in BLS data; AI accelerates.",
    sources: [
      { name: "Clothing retailers — Walmart, Target, TJ Maxx, mall stores", scope: "external" },
      { name: "Amazon & fast-fashion platforms", scope: "external" },
      { name: "Manufactured offshore", scope: "external" },
    ],
  },
];

const usd = n => "$" + Math.round(n).toLocaleString();
const SCOPE_LABEL = { local: "Stays local", external: "Flows out", mixed: "Split" };

function render() {
  document.getElementById("results").innerHTML = [
    introCard(),
    summaryRow(),
    categoryCards(),
    fullTable(),
    macCard(),
  ].join("\n");
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>What the basket is</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The basket is everything a person needs to live for a month — housing, food,
      energy, transport, care, and the rest — priced today. It is the yardstick the
      whole model is built on: a basic income only works if it can buy the basket,
      and the colony's currency (Mond) is pegged to it.
      <br><br>
      We hold the basket at <strong>${usd(BASKET_TODAY)} / month per person</strong>
      (<strong>${usd(ANNUAL)} / year</strong>). It is measured <em>per person</em>, not per
      household — housing and other shared costs are divided across the people who
      share them, which is why the housing line looks modest. <strong>Land is
      deliberately excluded</strong>: it is an appreciating wealth asset acquired
      through company ownership and dividends, not a monthly cost the basic income
      covers.
    </div>
  </div>`;
}

function summaryRow() {
  const localPct = BASKET.filter(c => c.scope === "local").reduce((s, c) => s + c.weight, 0);
  const extPct   = BASKET.filter(c => c.scope === "external").reduce((s, c) => s + c.weight, 0);
  const mixedPct = BASKET.filter(c => c.scope === "mixed").reduce((s, c) => s + c.weight, 0);
  const cell = (label, value, color) => `
    <div>
      <div style="font-size:10px; color:var(--dim); letter-spacing:0.15em; text-transform:uppercase;">${label}</div>
      <div style="font-size:20px; color:${color || "var(--headline)"}; font-variant-numeric:tabular-nums;">${value}</div>
    </div>`;
  return `
  <div class="card">
    <div style="display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap;">
      ${cell("Per month / person", usd(BASKET_TODAY))}
      ${cell("Per year / person", usd(ANNUAL))}
      ${cell("Categories", BASKET.length)}
      ${cell("Stays local", localPct.toFixed(0) + "%", "var(--ok)")}
      ${cell("Split", mixedPct.toFixed(0) + "%", "var(--warn)")}
      ${cell("Flows out", extPct.toFixed(0) + "%", "var(--crit)")}
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px; line-height:1.5;">
      Local / split / flows-out classes the <em>dominant</em> destination of each category's spending — whether it is
      captured by firms physically in the county or by national / global firms. It is indicative; the precise split is
      what the MAC sizing work pins down (see the closing note).
    </div>
  </div>`;
}

function categoryCards() {
  const cards = BASKET.slice()
    .sort((a, b) => b.weight - a.weight)
    .map(c => {
      const monthly = BASKET_TODAY * c.weight / 100;
      const srcRows = c.sources.map(s =>
        `<div style="margin-bottom:3px;">
           <span class="scope-tag ${s.scope}">${SCOPE_LABEL[s.scope]}</span>
           ${s.name}
         </div>`).join("");
      return `
      <div class="cat-card ${c.scope}">
        <div class="cat-head">
          <div class="cat-name">${c.name}</div>
          <div class="cat-money">${c.weight.toFixed(0)}% · ${usd(monthly)}/mo</div>
        </div>
        <div class="covers">${c.covers}</div>
        <div class="src-label">Where it's bought</div>
        <div class="src">${srcRows}</div>
        <div style="font-size:11px; color:var(--dim); margin-top:8px; line-height:1.4; font-style:italic;">${c.trend}</div>
      </div>`;
    }).join("");
  return `
  <div class="card">
    <h3>The eleven categories — share, cost, and source</h3>
    <div class="cat-grid">${cards}</div>
  </div>`;
}

function fullTable() {
  const rows = BASKET.slice().sort((a, b) => b.weight - a.weight).map(c => {
    const monthly = BASKET_TODAY * c.weight / 100;
    const scopeColor = c.scope === "local" ? "var(--ok)" : c.scope === "external" ? "var(--crit)" : "var(--warn)";
    return `<tr>
      <td class="cat">${c.name}</td>
      <td class="num">${c.weight.toFixed(0)}%</td>
      <td class="num">${usd(monthly)}</td>
      <td class="num">${usd(monthly * 12)}</td>
      <td style="color:${scopeColor};">${SCOPE_LABEL[c.scope]}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Basket summary</h3>
    <table style="width:100%;">
      <thead><tr>
        <th>Category</th>
        <th class="num">Share</th>
        <th class="num">$/month</th>
        <th class="num">$/year</th>
        <th>Spending captured</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num"><strong>100%</strong></td>
        <td class="num"><strong>${usd(BASKET_TODAY)}</strong></td>
        <td class="num"><strong>${usd(ANNUAL)}</strong></td>
        <td></td>
      </tr></tfoot>
    </table>
  </div>`;
}

function macCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>Why the source matters — the link to the MAC</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      Every dollar in the basket is revenue to some firm. The Market Access Charge
      (MAC) is levied on those firms — scaled by their profit per employee — and it
      is what funds the basic income. So to size the MAC, the first question is:
      <strong>who actually captures basket spending, and do they sit inside the
      colony or outside it?</strong>
      <br><br>
      That is what the source mapping above is for. Two patterns stand out:
      <ul style="margin:10px 0; padding-left:20px; line-height:1.7;">
        <li><strong>Local, labour-heavy lines</strong> — hospitality, care, trades,
        local healthcare and education — are captured by firms physically in the
        county. They employ a lot of people per dollar of profit, so each one pays a
        smaller MAC, but they are unambiguously chargeable.</li>
        <li><strong>External, automated lines</strong> — manufactured goods, digital,
        apparel, much of transport and energy — flow out to national and global
        firms with very high profit per employee. These are exactly the firms the MAC
        is designed to reach. The "market access" in the name is the point: a firm
        selling into the colony's consumer market pays for that access, even when it
        has no premises in the county.</li>
      </ul>
      A large share of basket spending leaves the county for external firms — nearly
      all of manufactured goods, digital, apparel and energy, plus much of transport,
      groceries and housing finance. Turning that leakage into a charge — without
      raising the price of the basket — is the core of the AXION mechanism. The exact
      local-versus-external split, firm by firm, is the next modelling step.
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px;">
      Shares mirror <code>BASKET_WEIGHTS</code> (forecasts.py); monthly anchor mirrors
      <code>MF.BASKET_TODAY</code>. Category price trends are detailed on the Trajectory page.
      Underlying rate research: <a href="/basket_research.md" style="color:var(--ok);">basket_research.md</a>.
    </div>
  </div>`;
}

render();
