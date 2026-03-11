// Vercel serverless function — fetches 10Y government bond yields server-side.
// Returns: { italy, germany, japan }
// Source: FRED OECD series (monthly, reliable).

const FRED_KEY = process.env.VITE_FRED_API_KEY;

const SERIES = {
  italy:   "IRLTLT01ITM156N",
  germany: "IRLTLT01DEM156N",
  japan:   "IRLTLT01JPM156N",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=43200, stale-while-revalidate=21600"); // 12h

  if (!FRED_KEY) {
    return res.status(500).json({ error: "FRED API key not configured" });
  }

  const results = await Promise.all(
    Object.entries(SERIES).map(async ([key, series]) => {
      const url =
        `https://api.stlouisfed.org/fred/series/observations` +
        `?series_id=${series}&api_key=${FRED_KEY}&limit=3&sort_order=desc&file_type=json`;
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (j.error_message) throw new Error(j.error_message);
        const obs = (j.observations || []).filter(o => o.value !== ".");
        if (!obs.length) throw new Error("no data");
        return [key, { value: parseFloat(obs[0].value), date: obs[0].date }];
      } catch (e) {
        return [key, { error: e.message }];
      }
    })
  );

  res.status(200).json(Object.fromEntries(results));
}
