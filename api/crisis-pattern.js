export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const d = req.body;
  if (!d || !d.year) return res.status(400).json({ error: "Missing data" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "API key not configured" });

  const kGap = (d.capShare - 25 + (60 - d.labShare)).toFixed(1);

  const prompt = `You are analyzing a US sovereign debt crisis through Ray Dalio's reserve currency framework, modified by AI and crypto wildcards.

Simulation indicators at ${d.year}:
- Debt/GDP: ${d.debtGDP}%
- 10Y Bond Yield: ${d.yld}%
- Inflation: ${d.infl}%
- Unemployment: ${d.unemp}%
- Capital in crypto: ${d.cryptoFlight}% (was ~1% in 2026)
- K-shape inequality gap widened by ${d.labShare < 60 ? kGap : "0"} percentage points

Historical reference patterns:
- Type 1 Fast Collapse: Weimar 1923 (10 months), Argentina 2001 (2 years)
- Type 2 Slow Decline: British Pound 1914–1971 (57 years, managed)
- Type 3 Chaotic Transition: Dutch Guilder 1780–1795 (15 years, no external manager)

Respond with exactly 4 sections. Each section: one ALL-CAPS heading on its own line, then 2–3 bullet points starting with •. One blank line between sections. No other text.

CRISIS PATTERN MATCH
• [Which type (1/2/3) this most resembles and why, citing specific indicators]
• [Historical parallel percentage — e.g. "65% Type 3 Dutch pattern, 25% Type 2 British, 10% novel"]
• [Confidence level and key uncertainty]

AI WILDCARD EFFECTS
• [How AI displacement accelerates or changes the crisis dynamic at these unemployment levels]
• [The deflation/inflation collision at these specific numbers]

CRYPTO WILDCARD EFFECTS
• [How capital flight at ${d.cryptoFlight}% changes the timeline vs historical precedent]
• [Whether this front-runs or accelerates the break point]

TIMELINE ESTIMATE
• [Classic historical timeline for this pattern type]
• [AI/crypto compressed timeline estimate with specific years]
• [Most likely catalyst event given these indicators]

Rules: historically grounded, cite specific precedents with dates, be direct about severity, no sugarcoating.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);
    const json = await response.json();
    res.status(200).json({ analysis: json.content[0].text });
  } catch (err) {
    console.error("crisis-pattern error:", err.message);
    res.status(500).json({ error: "Generation failed" });
  }
}
