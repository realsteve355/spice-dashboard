// Vercel serverless function — fetches daily bond yield data from stooq.com
// Avoids browser CORS restrictions by running server-side.
// Called by the Apocalypse Indicator page for Italian BTP, German Bund, and Japan 10Y yields.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  // stooq.com tickers for 10-year government bonds
  const symbols = {
    italy:   "10ity.b",
    germany: "10dey.b",
    japan:   "10jpy.b",
  };

  const results = {};

  await Promise.all(
    Object.entries(symbols).map(async ([key, sym]) => {
      try {
        // f=d2c → Date (ISO), Close. &h → include header row.
        const url = `https://stooq.com/q/l/?s=${sym}&f=d2c&h&e=csv`;
        const r = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)" },
        });
        if (!r.ok) throw new Error(`stooq HTTP ${r.status}`);

        const text = await r.text();
        const lines = text.trim().split("\n");
        // lines[0] = "Date,Close"  (header)
        // lines[1] = "2026-03-10,4.09"  (latest data)
        if (lines.length < 2) throw new Error("empty response");

        const parts = lines[1].split(",");
        const date  = parts[0].trim();
        const value = parseFloat(parts[1].trim());

        if (isNaN(value)) throw new Error(`invalid value: ${parts[1]}`);
        results[key] = { value, date };
      } catch (e) {
        results[key] = { error: e.message };
      }
    })
  );

  res.status(200).json(results);
}
