// Vercel serverless function — proxies FRED API requests server-side.
// Avoids browser CORS restrictions. API key never exposed to the client.
// Retries once on failure. Cache duration varies by series update frequency.

// Series that update monthly or quarterly get longer cache times so the
// page doesn't hammer FRED on every visit for data that won't have changed.
const LONG_CACHE = ["M2SL", "GFDEGDQ188S", "IRLTLT01ITM156N", "IRLTLT01DEM156N", "IRLTLT01JPM156N"];
const QUARTERLY  = ["GFDEGDQ188S"];

function cacheHeader(series) {
  if (QUARTERLY.includes(series))   return "s-maxage=172800, stale-while-revalidate=86400"; // 48h
  if (LONG_CACHE.includes(series))  return "s-maxage=43200,  stale-while-revalidate=21600"; // 12h
  return                                    "s-maxage=14400,  stale-while-revalidate=3600";  //  4h
}

async function fetchFred(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`FRED HTTP ${r.status}`);
  return r.json();
}

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
    // First attempt
    const j = await fetchFred(url);
    res.setHeader("Cache-Control", cacheHeader(series));
    return res.status(200).json(j);
  } catch (e1) {
    // Retry once after a short pause
    await new Promise(r => setTimeout(r, 800));
    try {
      const j = await fetchFred(url);
      res.setHeader("Cache-Control", cacheHeader(series));
      return res.status(200).json(j);
    } catch (e2) {
      return res.status(502).json({ error_message: `FRED unavailable after retry: ${e2.message}` });
    }
  }
}
