// /companies — "Companies doing business in Midwestville County" — the MAC base.
//
// STEP 1 of the MAC: size the business done in the county and the revenue per
// company, categorised. STEP 2 (a later page) applies margins -> profit -> the
// Market Access Charge. This page does NOT compute the charge.
//
// "Business done" = annual revenue companies earn from county residents. We
// assume every company that sells into the county signs up for the MAC. The
// total is anchored on consumer spending and ties to the earlier pages:
//   • basket (essentials, whole population) ≈ $10.8B   (basket page)
//   • discretionary on top (travel, leisure, gambling, premium) ≈ $2.2B
//   → ~$13B/yr of consumer business done.
// B2B and government spending are excluded for now (a later extension).
//
// All figures are first-pass illustrative estimates, to be refined.

const TOTAL = 13.0e9;   // $/yr consumer business done in the county

// Business done by sector / company type. rev = $/yr from the county; cos = approx
// number of companies; examples = representative firms.
const CATEGORIES = [
  { name: "Housing & real estate",      rev: 3.9e9, cos: 4000,
    examples: "Landlords & property managers, homebuilders (D.R. Horton, Lennar), mortgage lenders & banks" },
  { name: "Food — grocery & dining",    rev: 2.4e9, cos: 1600,
    examples: "Kroger, Walmart, Aldi, Meijer, Costco; restaurants, cafés, fast food" },
  { name: "Transport, autos & travel",  rev: 1.8e9, cos: 350,
    examples: "Automakers (Tesla, Ford, GM), dealers, fuel / oil majors, airlines (United, Delta), Uber / Lyft" },
  { name: "Healthcare & pharma",        rev: 1.3e9, cos: 550,
    examples: "Hospitals & health systems, clinics, pharmacies (CVS, Walgreens), insurers, pharma" },
  { name: "Retail goods & e-commerce",  rev: 1.2e9, cos: 900,
    examples: "Amazon, Walmart, Target, Best Buy, Home Depot, apparel & furniture retailers" },
  { name: "Utilities & telecom",        rev: 1.0e9, cos: 20,
    examples: "Duke Energy, gas & water utilities, Spectrum, AT&T, Verizon" },
  { name: "Digital and media",          rev: 0.7e9, cos: 150,
    examples: "Netflix, Disney+, Apple, Google, Microsoft, gaming & online platforms" },
  { name: "Financial services",         rev: 0.4e9, cos: 220,
    examples: "Banks, insurers, credit cards & payments, fintech" },
  { name: "Education & training",       rev: 0.3e9, cos: 110,
    examples: "Universities (Miami University), private tutoring, daycare, online courses" },
];

// The same business cut by company SCALE — the concentration that matters for the MAC.
const TIERS = [
  { name: "National & global giants", rev: 8.0e9, cos: 150, color: "var(--crit)",
    examples: "Amazon, Walmart, Kroger, Tesla, United, Duke Energy, CVS, Netflix, major banks & insurers" },
  { name: "Regional firms",           rev: 3.0e9, cos: 750, color: "var(--warn)",
    examples: "Regional grocery & restaurant chains, hospital systems, auto-dealer groups, homebuilders" },
  { name: "Local small & medium businesses", rev: 2.0e9, cos: 7000, color: "var(--ok)",
    examples: "Independent restaurants, trades, shops, landlords, clinics, salons" },
];

const TOTAL_COS = CATEGORIES.reduce((s, c) => s + c.cos, 0);

function money(v) {
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(0) + "M";
  if (v >= 1e3) return "$" + Math.round(v / 1e3) + "k";
  return "$" + Math.round(v);
}
const n = v => Math.round(v).toLocaleString();

function render() {
  document.getElementById("results").innerHTML = [
    introCard(),
    statRow(),
    categoryCard(),
    tierCard(),
    nextCard(),
  ].join("\n");
}

function statBox(label, value, sub, color) {
  return `
    <div class="stat">
      <div class="label">${label}</div>
      <div class="value" ${color ? `style="color:${color};"` : ""}>${value}</div>
      <div class="sub">${sub}</div>
    </div>`;
}

function introCard() {
  return `
  <div class="card" style="border-left:3px solid var(--blue);">
    <h3>What this page does</h3>
    <div style="font-size:11px; color:var(--ok); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">Snapshot · year 1 · 2026 (today)</div>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      The Market Access Charge is paid by the companies that do business in the
      county — assume here that <strong>every one of them signs up</strong>. There is
      a vast number, from corner shops to United Airlines, Tesla and a streaming
      service in California, so the first job is to size them and group them.
      <br><br>
      <strong>Business done ≈ ${money(TOTAL)}/year</strong> — the revenue companies earn
      from county residents. It is anchored on consumer spending and ties to the
      earlier pages: the <a href="/basket" style="color:var(--ok);">basket</a>
      (essentials, whole population) is ~$10.8B, plus ~$2.2B of discretionary
      spending — travel, leisure, gambling, premium goods — beyond basic needs.
      Business-to-business and government spending are excluded for now.
      <br><br>
      <span style="color:var(--dim); font-size:12px;">
        This page sizes the business and the revenue per company. Applying margins,
        profit and the charge itself comes on a later page — the MAC is not computed here.
        These are <strong>today's</strong> figures (year 1, 2026); by year 20 automation
        will have changed both the business done and the companies doing it. All figures
        are first-pass estimates, to be refined.
      </span>
    </div>
  </div>`;
}

function statRow() {
  const giants = TIERS[0];
  return `
  <div class="card">
    <div class="stats">
      ${statBox("Business done / year", money(TOTAL), "consumer revenue captured", "var(--ok)")}
      ${statBox("Companies", "~" + n(TOTAL_COS), "selling into the county")}
      ${statBox("Avg revenue / company", money(TOTAL / TOTAL_COS), "highly skewed — see below")}
      ${statBox("Captured by national giants", (giants.rev / TOTAL * 100).toFixed(0) + "%", "~" + n(giants.cos) + " firms (~" + (giants.cos / TOTAL_COS * 100).toFixed(0) + "% of companies)", "var(--crit)")}
    </div>
  </div>`;
}

function categoryCard() {
  const max = Math.max(...CATEGORIES.map(c => c.rev));
  const rows = CATEGORIES.slice().sort((a, b) => b.rev - a.rev).map(c => {
    const pct = c.rev / max * 100;
    const avg = c.rev / c.cos;
    return `<tr>
      <td class="cat" style="vertical-align:top;">${c.name}<div class="examples">${c.examples}</div></td>
      <td class="num bar" style="vertical-align:top; background:linear-gradient(90deg, rgba(91,160,230,0.18) ${pct.toFixed(0)}%, transparent ${pct.toFixed(0)}%);">${money(c.rev)}</td>
      <td class="num" style="vertical-align:top;">${n(c.cos)}</td>
      <td class="num" style="vertical-align:top;">${money(avg)}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card">
    <h3>Business done by sector</h3>
    <table>
      <thead><tr>
        <th>Sector · examples</th>
        <th class="num">County revenue / yr</th>
        <th class="num">Companies</th>
        <th class="num">Avg / company</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="border-top:2px solid var(--line-hot);">
        <td class="cat"><strong>Total</strong></td>
        <td class="num"><strong>${money(TOTAL)}</strong></td>
        <td class="num"><strong>~${n(TOTAL_COS)}</strong></td>
        <td class="num"><strong>${money(TOTAL / TOTAL_COS)}</strong></td>
      </tr></tfoot>
    </table>
  </div>`;
}

function tierCard() {
  const rows = TIERS.map(t => {
    const avg = t.rev / t.cos;
    return `<tr>
      <td class="cat" style="vertical-align:top;">
        <span style="color:${t.color};">●</span> ${t.name}
        <div class="examples">${t.examples}</div>
      </td>
      <td class="num" style="vertical-align:top;">${money(t.rev)}</td>
      <td class="num" style="vertical-align:top;">${(t.rev / TOTAL * 100).toFixed(0)}%</td>
      <td class="num" style="vertical-align:top;">${n(t.cos)}</td>
      <td class="num" style="vertical-align:top;">${money(avg)}</td>
    </tr>`;
  }).join("");
  return `
  <div class="card" style="border-left:3px solid var(--warn);">
    <h3>The concentration — business done by company scale</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.6; margin-bottom:6px;">
      Revenue is heavily concentrated. A small number of national and global firms
      capture most of the county's spending; thousands of local businesses split the rest.
    </div>
    <table>
      <thead><tr>
        <th>Company scale · examples</th>
        <th class="num">County revenue / yr</th>
        <th class="num">Share</th>
        <th class="num">Companies</th>
        <th class="num">Avg / company</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="font-size:11px; color:var(--faint); margin-top:8px;">
      Roughly ${(TIERS[0].cos / TOTAL_COS * 100).toFixed(0)}% of companies — the national giants — capture about
      ${(TIERS[0].rev / TOTAL * 100).toFixed(0)}% of the revenue, at ${money(TIERS[0].rev / TIERS[0].cos)} each from the county.
    </div>
  </div>`;
}

function nextCard() {
  return `
  <div class="card" style="border-left:3px solid var(--ok);">
    <h3>Where this leads — the MAC</h3>
    <div style="font-size:13px; color:var(--txt); line-height:1.7;">
      This is the base. The Market Access Charge will be levied on these companies'
      profit — scaled by profit per employee — so the next steps are to attach a
      margin to each category (revenue → profit) and an employee count (profit per
      employee), then apply the charge. The concentration above is the headline:
      the handful of high-revenue, highly automated national firms will carry most of
      the MAC, even though they have little physical presence in the county.
    </div>
  </div>`;
}

render();
