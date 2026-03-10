// Vercel serverless function — proxies FRED API requests server-side.
// Avoids browser CORS restrictions. API key never exposed to the client.

export default async function handler(req, res) {
  const { series, limit = 3 } = req.query;

  if (!series) {
    return res.status(400).json({ error_message: "series parameter required" });
  }

  const key = process.env.VITE_FRED_API_KEY;
  if (!key) {
    return res.status(500).json({ error_message: "FRED API key not configured on server" });
  }

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${series}&api_key=${key}&limit=${limit}&sort_order=desc&file_type=json`;

  try {
    const r = await fetch(url);
    const j = await r.json();
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    res.status(200).json(j);
  } catch (e) {
    res.status(500).json({ error_message: e.message });
  }
}
