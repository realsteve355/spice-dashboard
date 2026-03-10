// Vercel serverless function — fetches daily market data that would be
// blocked by CORS if requested directly from the browser.
//
// Returns: { italy, germany, japan, move }
//   italy/germany/japan: { value: number (yield %), date: string }
//   move: { value: number (index level), date: string }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  const [bonds, move] = await Promise.all([
    fetchBondYields(),
    fetchMove(),
  ]);

  res.status(200).json({ ...bonds, move });
}

// ─── stooq.com bond yields ────────────────────────────────────────────────────
// URL format: /q/d/l/?s=SYMBOL&i=d
// Returns CSV: Date,Open,High,Low,Close,Volume
// Close (index 4) is the yield in %.

async function fetchBondYields() {
  const symbols = {
    italy:   "10ity.b",
    germany: "10dey.b",
    japan:   "10jpy.b",
  };

  const results = {};

  await Promise.all(
    Object.entries(symbols).map(async ([key, sym]) => {
      try {
        const url = `https://stooq.com/q/d/l/?s=${sym}&i=d`;
        const r = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)" },
        });
        if (!r.ok) throw new Error(`stooq HTTP ${r.status}`);

        const text = await r.text();
        const lines = text.trim().split("\n");
        // lines[0] = "Date,Open,High,Low,Close,Volume"
        // lines[1] = most recent row
        if (lines.length < 2) throw new Error("empty response");

        const parts = lines[1].split(",");
        const date  = parts[0].trim();
        const value = parseFloat(parts[4].trim()); // Close = yield %

        if (isNaN(value)) throw new Error(`invalid close: "${parts[4]}"`);
        results[key] = { value, date };
      } catch (e) {
        results[key] = { error: e.message };
      }
    })
  );

  return results;
}

// ─── MOVE index via Yahoo Finance ─────────────────────────────────────────────
// Yahoo Finance chart API for ^MOVE (ICE BofA MOVE Index).
// Fetches 5 days of daily data and returns the most recent close.

async function fetchMove() {
  try {
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EMOVE" +
      "?range=5d&interval=1d&includePrePost=false";

    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);

    const j = await r.json();
    const result = j.chart?.result?.[0];
    if (!result) throw new Error("no chart result");

    const closes     = result.indicators?.quote?.[0]?.close || [];
    const timestamps = result.timestamp || [];

    // Walk back from most recent to find the last non-null close
    for (let i = closes.length - 1; i >= 0; i--) {
      if (closes[i] != null) {
        const date = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
        return { value: closes[i], date };
      }
    }
    throw new Error("no valid close found");
  } catch (e) {
    return { error: e.message };
  }
}
