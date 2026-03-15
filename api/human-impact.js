// ─── HELPERS ────────────────────────────────────────────────────────────────

function getSeverity(displaced) {
  if ((displaced ?? 0.4) < 0.15) return "benign";
  if ((displaced ?? 0.4) < 0.35) return "moderate";
  if ((displaced ?? 0.4) < 0.55) return "severe";
  return "extreme";
}

function isCrisisTriggered(d) {
  return d.debtGDP > 175 || d.unemp > 20 || d.infl < -7 || (d.yld > 6.5 && d.debtGDP > 150);
}

function getToneGuidance(severity, crisisTriggered) {
  if (severity === "benign" && !crisisTriggered) {
    return `This is a MILD scenario. The system is adjusting, not breaking.
FORBIDDEN WORDS — do NOT use: "collapse", "catastrophic", "crisis", "disaster", "breakdown", "devastation"
APPROPRIATE LANGUAGE: "gradual pressure", "modest headwinds", "manageable adjustment", "noticeable but manageable", "building stress"
Example tone: "Inflation of 3.2% creates gradual purchasing power pressure — noticeable but manageable with household budget adjustments."`;
  }
  if (severity === "moderate" && !crisisTriggered) {
    return `This is a MODERATE scenario. Acknowledge real challenges — avoid hyperbole.
AVOID: "collapse", "catastrophic", "breakdown" (crisis not yet triggered)
APPROPRIATE LANGUAGE: "significant challenges", "mounting pressure", "policy response needed", "material disruption"`;
  }
  if (crisisTriggered) {
    return `Crisis IS UNDERWAY. Serious, urgent language is appropriate and accurate.
USE (grounded in numbers): "catastrophic", "systemic stress", "breakdown", "collapse"
Ground severity in specific numbers: "unemployment at ${severity === "extreme" ? "25%+" : "18%"} and inflation at that level constitute severe simultaneous shocks"`;
  }
  return `SEVERE scenario trending toward crisis. Signal clear danger — but crisis has not yet triggered.
SIGNAL: "crisis approaching", "break point nearing", "without intervention this trajectory leads to..."
DO NOT YET SAY "crisis underway" — it hasn't triggered`;
}

// ─── GROUPS ─────────────────────────────────────────────────────────────────

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

// ─── PROMPT ─────────────────────────────────────────────────────────────────

function getCollisionContext(d) {
  const crisis = isCrisisTriggered(d);
  if (!crisis) return `NO CRISIS: System is stressed but all thresholds remain intact.`;
  const hasMaterialAI   = (d.displaced || 0) > 0.15;
  const hasSignifCrypto = (d.cryptoFlight || 0) > 20;
  if (hasMaterialAI || hasSignifCrypto) {
    return `THE COLLISION: This is the SPICE thesis — NOT a conventional crisis.
AI displacement ${Math.round((d.displaced || 0) * 100)}%, crypto flight ${d.cryptoFlight}%.
Unlike historical crises, the Fed cannot inflate away this debt (AI deflation constraint) and cannot trap capital (crypto flight). No historical playbook applies.
Emphasise the structural novelty; this is not a cyclical recession.`;
  }
  return `CONVENTIONAL CRISIS: Debt thresholds breached but below collision thresholds.
AI displacement ${Math.round((d.displaced || 0) * 100)}% (below 15%), crypto ${d.cryptoFlight}% (below 20%).
This resembles Greece 2010 or Argentina 2001. Fed tools (QE, repression) remain viable.
Note conventional nature; avoid implying unprecedented dynamics.`;
}

function buildPrompt(group, d) {
  const kGap      = (d.capShare - 25 + (60 - d.labShare)).toFixed(1);
  const severity  = getSeverity(d.displaced);
  const crisis    = isCrisisTriggered(d);
  const tone      = getToneGuidance(severity, crisis);
  const collision = getCollisionContext(d);

  return `You are analyzing the economic impact of "The Great Collision" — a structural scenario where AI-driven deflation collides with sovereign debt monetization.

Economic state in ${d.year}:
- Debt/GDP: ${d.debtGDP}%
- 10Y Bond Yield: ${d.yld}%
- Inflation (CPI): ${d.infl}%
- Unemployment: ${d.unemp}%
- Capital in crypto: ${d.cryptoFlight}% (was ~1% in 2026)
- Labour share of GDP: ${d.labShare}% (was 60% in 2026)
- Capital share of GDP: ${d.capShare}% (was 25% in 2026)
- K-shape inequality gap widened by ${kGap} percentage points since 2026

CRISIS CLASSIFICATION:
${collision}

CRISIS STATUS: ${crisis ? "TRIGGERED — thresholds breached" : "NOT TRIGGERED — structural stress building but system intact"}
SCENARIO SEVERITY: ${severity.toUpperCase()} (AI displacement: ${Math.round((d.displaced ?? 0.4) * 100)}%)

TONE CALIBRATION:
${tone}

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

Rules: clinical and honest, structural scenario not cyclical recession, ground every point in specific numbers, no generic advice, no named financial products or investment services.`;
}

// ─── HANDLER ────────────────────────────────────────────────────────────────

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
