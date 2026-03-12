const GROUPS = [
  {
    key: "lowIncome",
    name: "Low-Income Service Workers",
    profile:
      "Household income below $35k. Employed in gig economy, retail, hospitality, or care work. Minimal savings, renting. No wage protection from inflation, irregular hours, no healthcare benefits. No meaningful asset holdings.",
  },
  {
    key: "middleClass",
    name: "Middle-Class Salary Workers",
    profile:
      "Household income $35k–$100k. Teachers, nurses, office workers, tradespeople. Mortgaged home, small retirement account (mostly 60/40 stock/bond), modest savings. Fixed salaries lag inflation; mortgage stress if refinancing needed.",
  },
  {
    key: "affluent",
    name: "Affluent Professionals",
    profile:
      "Household income $100k–$500k. Dual-income professionals, small business owners, tech workers. Substantial equity portfolios, real estate, diversified investments including some alternatives. Significant exposure to equity and bond repricing.",
  },
  {
    key: "retirees",
    name: "Retirees & Fixed-Income",
    profile:
      "Age 65+. Income from Social Security, pensions, fixed annuities, bond interest. Bond-heavy portfolios, paid-off homes. Fixed income is destroyed by inflation; healthcare costs rising faster than CPI; cannot return to work.",
  },
];

function buildPrompt(group, d) {
  const kGap = (d.capShare - 25 + (60 - d.labShare)).toFixed(1);
  return `You are analyzing the economic impact of "The Great Collision" — a structural crisis where AI-driven deflation collides with sovereign debt monetization.

Economic state in ${d.year}:
- Debt/GDP: ${d.debtGDP}%
- 10Y Bond Yield: ${d.yld}%
- Inflation (CPI): ${d.infl}%
- Unemployment: ${d.unemp}%
- Capital in crypto: ${d.cryptoFlight}% (was ~1% in 2026)
- Labour share of GDP: ${d.labShare}% (was 60% in 2026)
- Capital share of GDP: ${d.capShare}% (was 25% in 2026)
- K-shape inequality gap widened by ${kGap} percentage points since 2026

Group: ${group.name}
Profile: ${group.profile}

Respond with exactly 4 sections. Each section: one ALL-CAPS heading on its own line, then 2 bullet points starting with •. One blank line between sections. No other text.

PRIMARY PRESSURE
• [most acute pain point grounded in the data]
• [second key pressure]

SECONDARY EFFECTS
• [cascading impact]
• [further consequence]

ASSETS & INCOME
• [what happens to their savings/home/pension/portfolio at these levels]
• [whether conventional hedges work — be honest if they fail]

REALISTIC OPTIONS
• [what they can actually do — be direct if options are limited]
• [second option or honest assessment of constraints]

Rules: clinical and honest, structural crisis not cyclical recession, ground every point in the specific numbers provided, no generic advice, no named financial products or investment services.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const d = req.body;
  if (!d || !d.year) return res.status(400).json({ error: "Missing data" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const results = await Promise.all(
      GROUPS.map(async (group) => {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 350,
            messages: [{ role: "user", content: buildPrompt(group, d) }],
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Anthropic error ${response.status}: ${err}`);
        }

        const json = await response.json();
        return { key: group.key, text: json.content[0].text };
      })
    );

    const analyses = {};
    results.forEach((r) => { analyses[r.key] = r.text; });
    res.status(200).json(analyses);
  } catch (err) {
    console.error("human-impact error:", err.message);
    res.status(500).json({ error: "Generation failed" });
  }
}
