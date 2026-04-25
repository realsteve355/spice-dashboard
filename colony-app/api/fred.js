// Vercel serverless — proxies FRED API to avoid browser CORS restrictions.
// API key is never exposed to the client.

const LONG_CACHE = ["CPIAUCSL", "APU0000702111", "APU0000709112", "APU000072610",
                    "CUSR0000SETG", "CUSR0000SEFV"];

function cacheHeader(series) {
  if (LONG_CACHE.includes(series)) return "s-maxage=43200, stale-while-revalidate=21600"; // 12h
  return "s-maxage=14400, stale-while-revalidate=3600"; // 4h
}

export default async function handler(req, res) {
  const { series, limit = 3 } = req.query;
  if (!series) return res.status(400).json({ error: "series required" });

  const key = process.env.VITE_FRED_API_KEY;
  if (!key)  return res.status(500).json({ error: "FRED API key not configured" });

  const url = `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${series}&api_key=${key}&limit=${limit}&sort_order=desc&file_type=json`;

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`FRED ${r.status}`);
    const j = await r.json();
    res.setHeader("Cache-Control", cacheHeader(series));
    return res.status(200).json(j);
  } catch (e) {
    await new Promise(r => setTimeout(r, 800));
    try {
      const r = await fetch(url);
      const j = await r.json();
      res.setHeader("Cache-Control", cacheHeader(series));
      return res.status(200).json(j);
    } catch (e2) {
      return res.status(502).json({ error: `FRED unavailable: ${e2.message}` });
    }
  }
}
