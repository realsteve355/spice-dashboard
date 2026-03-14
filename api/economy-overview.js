// ─── HELPERS ────────────────────────────────────────────────────────────────

function getSeverity(displaced) {
  if (displaced < 0.15) return "benign";
  if (displaced < 0.35) return "moderate";
  if (displaced < 0.55) return "severe";
  return "extreme";
}

function getToneGuidance(severity, crisisTriggered) {
  if (severity === "benign" && !crisisTriggered) {
    return `This is a MILD scenario. System is adjusting, not breaking.
FORBIDDEN WORDS — do NOT use: "collapse", "catastrophic", "crisis", "disaster", "breakdown", "devastation"
APPROPRIATE LANGUAGE: "gradual pressure", "modest headwinds", "manageable adjustment", "noticeable but manageable", "building stress"`;
  }
  if (severity === "moderate" && !crisisTriggered) {
    return `This is a MODERATE scenario. Real challenges exist — avoid hyperbole.
AVOID: "collapse", "catastrophic", "breakdown" (crisis not yet triggered)
APPROPRIATE LANGUAGE: "significant challenges", "mounting pressure", "policy response needed", "material disruption", "correction required"`;
  }
  if (crisisTriggered) {
    return `Crisis IS UNDERWAY. Serious, urgent language is appropriate and accurate.
USE (grounded in numbers): "catastrophic", "systemic stress", "breakdown", "collapse"
Example: "unemployment at 22% and inflation at 16% constitute depression-level simultaneous shocks"`;
  }
  // severe/extreme, not yet triggered
  return `SEVERE scenario trending toward crisis. Signal danger — but crisis has not yet triggered.
SIGNAL: "crisis approaching", "break point nearing", "without intervention this trajectory leads to..."
DO NOT YET SAY: "crisis underway" — it hasn't triggered`;
}

// ─── PROMPT ─────────────────────────────────────────────────────────────────

function buildPrompt(t) {
  const crisisTriggered = t.crisisYear !== null;
  const severity        = getSeverity(t.displaced ?? 0.4);
  const toneGuidance    = getToneGuidance(severity, crisisTriggered);

  const fiscalName   = { none: "No fiscal intervention (baseline drift)", robot_ubi: "Robot Tax + Universal Basic Income", austerity: "Austerity (spending cap at 92% of baseline)" }[t.fiscalPolicy]   || t.fiscalPolicy;
  const monetaryName = { none: "No monetary intervention", qe: "Quantitative Easing (30% yield suppression)", ycc: "Yield Curve Control (hard 4.5% cap)", repression: "Financial Repression" }[t.monetaryPolicy] || t.monetaryPolicy;
  const cryptoName   = { ban: "Ban & Restrict", tax: "Tax & Regulate", none: "Ignore / Accommodate" }[t.cryptoPolicy]  || t.cryptoPolicy;

  return `You are an economic analyst synthesising a 10-year macroeconomic simulation for researchers.

TRAJECTORY DATA (2026–2035):
- Debt/GDP:     ${t.startDebt}% → ${t.endDebt}%  (peak: ${t.peakDebt}%)
- Unemployment: ${t.startUnemp}% → ${t.endUnemp}%  (peak: ${t.peakUnemp}%)
- Inflation:    ${t.startInfl}% → ${t.endInfl}%
- 10Y Yield:    ${t.startYld}% → ${t.endYld}%
- Crypto flight:${t.startCrypto}% → ${t.endCrypto}%  (peak: ${t.peakCrypto}%)
- Gini coeff:   ${t.startGini} → ${t.endGini}
- Crisis triggered: ${crisisTriggered ? `YES — in ${t.crisisYear}` : "NO"}
- AI displacement scenario: ${Math.round((t.displaced ?? 0.4) * 100)}% by 2035
- Fiscal Policy:   ${fiscalName}
- Monetary Policy: ${monetaryName}
- Crypto Regime:   ${cryptoName}

TONE CALIBRATION:
${toneGuidance}

TASK:
Write exactly 4 paragraphs analysing the FULL 2026–2035 ARC. Separate paragraphs with a blank line. No preamble, no conclusion beyond paragraph 4.

Paragraph 1 — BUILD-UP (2026–${t.crisisYear ? t.crisisYear : "2035"}): Starting conditions (debt ${t.startDebt}%, unemployment ${t.startUnemp}%), what accumulates, early warning signals${!crisisTriggered ? ", and why the system remained stable throughout" : ""}.

Paragraph 2 — ${crisisTriggered ? `CRISIS ONSET & CASCADE (${t.crisisYear} onwards)` : "ADJUSTMENT DYNAMICS"}: ${crisisTriggered ? `Which threshold breaks in ${t.crisisYear} and why, what cascades from there, feedback loops between debt, unemployment, and crypto flight.` : "How the system absorbs structural pressure without breaking; what prevents a crisis trigger."}

Paragraph 3 — POLICY RESPONSE & INEQUALITY: How ${fiscalName} and ${monetaryName} shape the trajectory over the full period. Crypto regime (${cryptoName}) — how capital flight evolves from ${t.startCrypto}% to ${t.endCrypto}%. K-shape inequality: Gini ${t.startGini} → ${t.endGini}, who gains and who loses across the decade.

Paragraph 4 — END STATE & INVESTMENT IMPLICATIONS (by 2035): Debt at ${t.endDebt}%, crypto adoption at ${t.endCrypto}%.${crisisTriggered ? " How conventional hedges (TIPS, 60/40, gold ETFs) performed and when they failed. Which assets preserved purchasing power." : " Whether traditional portfolio construction (60/40, TIPS) remains viable. Hard assets vs conventional allocation."}

RULES:
- Analyse the ARC across time, not a single snapshot
- Reference specific years for inflection points ("debt crosses 175% in 2030", "crypto flight accelerates from 2031")
- Ground every claim in the trajectory numbers above
- Explain causality — WHY things happen, not just WHAT
- No bullet points, no headers within paragraphs
- Do NOT mention "SPICE" or "ZPC"
- Tone: analytical narrative — tell the story of how this scenario unfolds`;
}

// ─── HANDLER ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const t = req.body;
  if (!t || !t.startDebt) return res.status(400).json({ error: "Missing trajectory data" });

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
        max_tokens: 650,
        messages: [{ role: "user", content: buildPrompt(t) }],
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
