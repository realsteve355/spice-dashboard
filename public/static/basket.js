// /basket — "The basket today" page.
//
// Self-contained: the category data is authored here. The category SHARES mirror
// BASKET_WEIGHTS in forecasts.py (the canonical basket the trajectory / fisc
// pages use). The monthly anchor is a PER-ADULT figure: $2,600/mo, the cost for
// a single adult to live a basic-but-decent life in the county, close to the MIT
// Living Wage estimate for Butler County, Ohio.
//
// Household rule (decided 28 Jun 2026): each ADULT gets a full basket; each CHILD
// under 18 is counted at 50% of an adult, paid to the parents.
//
// NOTE: this supersedes the older $1,600/person placeholder. The shared
// maryfontaine.js anchor (and the Fisc / UBI maths that use it) still need
// re-anchoring to $2,600/adult to match — flagged, not yet done.
//
// The per-category SOURCE mapping (the kinds of stores and firms that supply
// each line) is the input to the future MAC sizing work: the MAC is charged on
// the firms that capture basket revenue, so we first need to know who they are.

const ADULT = 2600;            // $/mo per adult
const CHILD = ADULT * 0.5;     // $/mo per child under 18 (50%, paid to parents)
const ANNUAL = ADULT * 12;     // $31,200/yr per adult

// Each: name, weight (% of basket), what it covers, sources [strings], trend.
const BASKET = [
  {
    name: "Rent / mortgage (basic housing)", weight: 40.0,
    covers: "Rent or mortgage on basic engineered / modular housing — the structure only. Land value and premium housing are out of scope (a wealth asset, not a basket item).",
    trend: "Slowly deflating as construction industrialises (modular, 3D-print, robotic build). Land excluded.",
    sources: [
      "Local landlords & property-management companies (rent)",
      "Regional & national homebuilders — D.R. Horton, Lennar (new build)",
      "Mortgage lenders & banks (interest)",
    ],
  },
  {
    name: "Manufactured goods", weight: 11.0,
    covers: "Appliances, electronics, furniture, household durables, tools.",
    trend: "Deflating — global manufacturing + automation. Electronics fastest.",
    sources: [
      "Big-box retail — Walmart, Target, Best Buy",
      "Amazon & online marketplaces",
      "Home Depot / Lowe's, furniture retailers",
      "Made by global manufacturers (mostly Asia)",
    ],
  },
  {
    name: "Food (general groceries)", weight: 10.0,
    covers: "Produce, packaged goods, dairy, staples.",
    trend: "Roughly flat — automation offsets historical food inflation.",
    sources: [
      "Supermarkets — Kroger (HQ in the metro), Walmart, Aldi, Meijer, Costco",
      "Discount & dollar grocers",
      "Local farms, markets & independents",
    ],
  },
  {
    name: "Services (hospitality, care)", weight: 9.0,
    covers: "Restaurants, cafés, bars, salons, childcare, eldercare, gyms, repair.",
    trend: "Inflating (+2%/yr) — slowest to automate; physical presence + emotional labour.",
    sources: [
      "Local independent restaurants, cafés & trades",
      "Regional service chains & franchises",
      "Childcare, eldercare & care providers",
    ],
  },
  {
    name: "Transport", weight: 7.0,
    covers: "Vehicle purchase / lease, fuel, insurance, repair, rideshare, transit.",
    trend: "Deflating — EV cost decline + autonomy removes the driver cost.",
    sources: [
      "Auto dealers & automakers (vehicles)",
      "Gas stations / oil majors (fuel)",
      "Local repair shops & dealers (service)",
      "Insurers; Uber / Lyft; public transit",
    ],
  },
  {
    name: "Energy & utilities", weight: 6.0,
    covers: "Electricity, natural gas, water.",
    trend: "Deflating fast — solar 20%/doubling, batteries 18–35%/doubling (Wright curves).",
    sources: [
      "Regulated electric & gas utilities — e.g. Duke Energy Ohio",
      "Municipal water authorities",
    ],
  },
  {
    name: "Food (proteins)", weight: 5.0,
    covers: "Meat, poultry, fish.",
    trend: "Mild inflation → flat. Cultured / lab meat eases it later.",
    sources: [
      "Grocery meat counters & butchers (retail)",
      "Meat processors — Tyson, JBS (production)",
    ],
  },
  {
    name: "Healthcare", weight: 5.0,
    covers: "Out-of-pocket care, pharmacy, insurance premiums, dental.",
    trend: "Mild inflation — AI offsets cost but aging demographics push up.",
    sources: [
      "Hospitals & local health systems, clinics",
      "Pharmacies — CVS, Walgreens, Kroger Rx",
      "Health insurers",
    ],
  },
  {
    name: "Education", weight: 3.0,
    covers: "Tuition, tutoring, childcare-education, courses, materials.",
    trend: "Slight deflation — AI tutors deflate delivery; credentialing value sticky.",
    sources: [
      "Universities & colleges in the county (e.g. Miami University)",
      "Private tutoring, daycare & training",
      "Online platforms & courseware",
    ],
  },
  {
    name: "Intelligence / digital", weight: 2.0,
    covers: "Streaming, software, apps, cloud, mobile & internet service.",
    trend: "Deflating fast (−10%/yr) — approaches near-zero marginal cost.",
    sources: [
      "Streaming — Netflix, Disney+",
      "Software & cloud — Apple, Google, Microsoft",
      "Telecom / ISP — Spectrum, AT&T",
    ],
  },
  {
    name: "Apparel", weight: 2.0,
    covers: "Clothing, footwear, accessories.",
    trend: "Deflating (−3%/yr) — already falling in BLS data; AI accelerates.",
    sources: [
      "Clothing retailers — Walmart, Target, TJ Maxx, mall stores",
      "Amazon & fast-fashion platforms",
      "Manufactured offshore",
    ],
  },
];

// Household compositions for the single / family analysis.
const HOUSEHOLDS = [
  { label: "Single adult",            adults: 1, children: 0 },
  { label: "Couple (2 adults)",       adults: 2, children: 0 },
  { label: "Single parent + 1 child", adults: 1, children: 1 },
  { label: "Family — 2 adults + 2 children", adults: 2, children: 2 },
];

const usd = n => "$" + Math.round(n).toLocaleString();

function render() {
  document.getElementById("results").innerHTML = [
    introCard(),
    householdCard(),
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
      energy, transport, care, and the rest, priced today. It is the yardstick the
      whole model is built on: a basic income only works if it can buy the basket,
      and the colony's currency (Mond) is pegged to it.
      <br><br>
      We anchor it at <strong>${usd(ADULT)} / month per adult</strong>
      (<strong>${usd(ANNUAL)} / year</strong>) — the cost for a single adult to live
      a basic but decent life in the county, close to the MIT Living Wage estimate
      for the area. It is a <strong>per-adult</strong> figure: each adult's basket
      covers their own housing, food, transport and the rest.
      <strong>Children under 18 count at 50% of an adult</strong> (${usd(CHILD)}/mo),
      paid to their parents.
      <br><br>
      <strong>Land is excluded</strong> — it is an appreciating wealth asset acquired
      through company ownership and dividends, not a monthly cost the basic income
      covers.
    </div>
  </div>`;
}

function householdCard() {
  const rows = HOUSEHOLDS.map(h => {
    const monthly = h.adults * ADULT + h.children * CHILD;
    const make = h.adults && h.children
      ? `${h.adults}×${usd(ADULT)} + ${h.children}×${usd(CHILD)}`
      : (h.children ? `${h.children}×${usd(CHILD)}` : `${h.adults}×${usd(ADULT)}`);
    return `<tr>
      <td class="cat">${h.label}</td>
      <td class="num">${h.adults}</td>
      <td class="num">${h.children}</td>
      <td class="num" style="color:var(--dim);">${make}</td>
      <td class="num">${usd(monthly)}</td>
      <td class="num">${usd(monthly * 12)}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>What the basket costs by household</h3>
    <table style="width:100%;">
      <thead><tr>
        <th>Household</th>
        <th class="num">Adults</th>
        <th class="num">Children</th>
        <th class="num">Build-up</th>
        <th class="num">$/month</th>
        <th class="num">$/year</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px; line-height:1.5;">
      Each adult is one full basket; each child under 18 is half a basket, paid to the parents. A flat per-adult
      figure is used for clarity — in practice a shared household spends a little less per adult on housing.
    </div>
  </div>`;
}

function categoryCards() {
  const cards = BASKET.slice()
    .sort((a, b) => b.weight - a.weight)
    .map(c => {
      const monthly = ADULT * c.weight / 100;
      const srcRows = c.sources.map(s => `<div style="margin-bottom:2px;">· ${s}</div>`).join("");
      return `
      <div class="cat-card">
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
    <div style="font-size:12px; color:var(--dim); margin-bottom:4px;">Dollar amounts are per adult, per month.</div>
    <div class="cat-grid">${cards}</div>
  </div>`;
}

function fullTable() {
  const rows = BASKET.slice().sort((a, b) => b.weight - a.weight).map(c => {
    const monthly = ADULT * c.weight / 100;
    return `<tr>
      <td class="cat">${c.name}</td>
      <td class="num">${c.weight.toFixed(0)}%</td>
      <td class="num">${usd(monthly)}</td>
      <td class="num">${usd(monthly * 12)}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Basket summary — per adult</h3>
    <table style="width:100%;">
      <thead><tr>
        <th>Category</th>
        <th class="num">Share</th>
        <th class="num">$/month</th>
        <th class="num">$/year</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num"><strong>100%</strong></td>
        <td class="num"><strong>${usd(ADULT)}</strong></td>
        <td class="num"><strong>${usd(ANNUAL)}</strong></td>
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
      is what funds the basic income. So the basket is also a map of <strong>who the
      MAC is collected from</strong>: the supermarkets, landlords, utilities,
      carmakers, manufacturers, platforms and local services behind each line.
      <br><br>
      Sizing the MAC starts here — with who captures basket spending and how
      profitable they are per employee. That firm-by-firm picture is the next
      modelling step.
    </div>
    <div style="font-size:11px; color:var(--faint); margin-top:10px;">
      Category shares mirror <code>BASKET_WEIGHTS</code> (forecasts.py); the per-adult anchor is the
      MIT Living Wage basis. Category price trends are detailed on the Trajectory page.
      Underlying rate research: <a href="/basket_research.md" style="color:var(--ok);">basket_research.md</a>.
    </div>
  </div>`;
}

render();
