function buildPrompt(d) {
  const gini = (0.48 + ((d.capShare - 25) + (60 - d.labShare)) * 0.008).toFixed(2);
  const isPostCrisis =
    d.debtGDP > 175 ||
    d.unemp   > 20  ||
    d.infl    < -7  ||
    (d.yld > 6.5 && d.debtGDP > 150);

  const crisisContext = isPostCrisis
    ? "The crisis break point has been triggered. The system is in acute distress."
    : "The system is pre-crisis but structural imbalances are building.";

  const fiscalName = {
    none:      "No fiscal intervention (baseline drift)",
    robot_ubi: "Robot Tax + Universal Basic Income",
    austerity: "Austerity (spending cap at 92% of baseline)",
  }[d.fiscalPolicy] || d.fiscalPolicy;

  const monetaryName = {
    none:       "No monetary intervention",
    qe:         "Quantitative Easing (30% yield suppression)",
    ycc:        "Yield Curve Control (hard 4.5% cap)",
    repression: "Financial Repression (regulatory yield suppression)",
  }[d.monetaryPolicy] || d.monetaryPolicy;

  const cryptoName = {
    ban:  "Ban & Restrict (capital controls, exchange bans)",
    tax:  "Tax & Regulate (on-chain reporting, capital gains tax)",
    none: "Ignore / Accommodate (no intervention)",
  }[d.cryptoPolicy] || d.cryptoPolicy;

  return `You are an economic analyst synthesising a macroeconomic simulation for researchers.

SCENARIO DATA (Year ${d.year}):
- Debt/GDP: ${d.debtGDP}%
- Inflation: ${d.infl}%
- Unemployment: ${d.unemp}%
- 10-Year Bond Yield: ${d.yld}%
- Crypto capital flight: ${d.cryptoFlight}% (was ~1% in 2026)
- Labour share of GDP: ${d.labShare}% (was 60% in 2026)
- Capital share of GDP: ${d.capShare}% (was 25% in 2026)
- Gini coefficient: ${gini} (was ~0.48 in 2026)
- Fiscal Policy: ${fiscalName}
- Monetary Policy: ${monetaryName}
- Crypto Regime: ${cryptoName}

CONTEXT:
This simulates the collision between AI-driven deflation compressing the tax base and unsustainable sovereign debt forcing monetary debasement.
${crisisContext}

Crisis triggers: Debt>175%, Unemployment>20%, Inflation<-7%, or (Yield>6.5% AND Debt>150%).

TASK:
Write exactly 4 paragraphs (200-250 words total). No preamble, no conclusion beyond paragraph 4. Paragraphs separated by a single blank line.

Paragraph 1 — FISCAL STRESS & DEBT DYNAMICS: current debt sustainability, interest burden, r vs g dynamics. Reference specific numbers.

Paragraph 2 — AI DISPLACEMENT & LABOUR MARKETS: unemployment trajectory, AI productivity effects, ghost GDP (productivity rising while employment falls), automatic stabiliser drag on the deficit.

Paragraph 3 — MONETARY POLICY & CAPITAL FLIGHT: Federal Reserve response (${monetaryName}), inflation/deflation dynamics, crypto flight at ${d.cryptoFlight}% and government response (${cryptoName}), K-shape inequality (Gini ${gini}).

Paragraph 4 — INVESTMENT IMPLICATIONS: which hedges work and which fail at these levels, who preserves wealth versus who loses purchasing power.${isPostCrisis ? " Conventional hedges (TIPS, 60/40, gold ETFs) have failed — explain why." : ""}

RULES:
- Ground every claim in specific numbers from the data
- Explain causality — WHY things are happening, not just WHAT
- Plain prose only — no bullet points, no headers, no bold
- Do not mention SPICE, ZPC, or any token names
- Tone: analytical, factual, like a high-quality economic briefing`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const d = req.body;
  if (!d || !d.year) return res.status(400).json({ error: "Missing data" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

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
        max_tokens: 600,
        messages: [{ role: "user", content: buildPrompt(d) }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${err}`);
    }

    const json = await response.json();
    res.status(200).json({ overview: json.content[0].text });
  } catch (err) {
    console.error("economy-overview error:", err.message);
    res.status(500).json({ error: "Generation failed" });
  }
}
