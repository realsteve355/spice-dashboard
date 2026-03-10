// Vercel serverless function — fetches daily market data server-side.
// Returns: { italy, germany, japan, move }
// Bond yields: Yahoo Finance (daily) with FRED OECD fallback (monthly).
// MOVE index: Yahoo Finance with crumb token auth.

const FRED_KEY = process.env.VITE_FRED_API_KEY;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  const [italy, germany, japan, move] = await Promise.all([
    fetchYield("GBTPIT10Y=X", "IRLTLT01ITM156N"),
    fetchYield("GDBR10YR=X",  "IRLTLT01DEM156N"),
    fetchYield("GJGB10YR=X",  "IRLTLT01JPM156N"),
    fetchMove(),
  ]);

  res.status(200).json({ italy, germany, japan, move });
}

// ─── Yahoo Finance crumb auth ─────────────────────────────────────────────────
// Yahoo Finance requires a session cookie + crumb token since 2023.
// We fetch both server-side before making the data request.

async function getYahooCrumb() {
  const cookieRes = await fetch("https://fc.yahoo.com", {
    headers: { "User-Agent": UA },
    redirect: "follow",
  });

  // Collect all Set-Cookie headers (Node 18+ supports getSetCookie)
  const setCookies =
    typeof cookieRes.headers.getSetCookie === "function"
      ? cookieRes.headers.getSetCookie()
      : [cookieRes.headers.get("set-cookie") || ""];

  const cookieStr = setCookies
    .map(c => c.split(";")[0])
    .filter(Boolean)
    .join("; ");

  const crumbRes = await fetch(
    "https://query1.finance.yahoo.com/v1/test/getcrumb",
    { headers: { "User-Agent": UA, "Cookie": cookieStr } }
  );

  const crumb = await crumbRes.text();
  if (!crumb || crumb.includes("<") || crumb.length > 30) {
    throw new Error(`bad crumb: ${crumb.slice(0, 40)}`);
  }

  return { crumb, cookieStr };
}

// ─── Yahoo Finance chart fetch (with crumb) ───────────────────────────────────
async function fetchYahoo(ticker, crumb, cookieStr) {
  const encoded = encodeURIComponent(ticker);
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}` +
    `?range=5d&interval=1d&includePrePost=false&crumb=${encodeURIComponent(crumb)}`;

  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Cookie": cookieStr,
      "Accept": "application/json",
    },
  });
  if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);

  const j = await r.json();
  const result = j.chart?.result?.[0];
  if (!result) throw new Error("no chart result");

  const closes     = result.indicators?.quote?.[0]?.close || [];
  const timestamps = result.timestamp || [];

  for (let i = closes.length - 1; i >= 0; i--) {
    if (closes[i] != null) {
      const date = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
      return { value: closes[i], date, src: "yahoo" };
    }
  }
  throw new Error("no valid close found");
}

// ─── FRED fallback (monthly) ──────────────────────────────────────────────────
async function fetchFredYield(series) {
  if (!FRED_KEY) throw new Error("no FRED key");
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${series}&api_key=${FRED_KEY}&limit=3&sort_order=desc&file_type=json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`FRED HTTP ${r.status}`);
  const j = await r.json();
  if (j.error_message) throw new Error(j.error_message);
  const obs = (j.observations || []).filter(o => o.value !== ".");
  if (!obs.length) throw new Error("no FRED data");
  return { value: parseFloat(obs[0].value), date: obs[0].date, src: "fred" };
}

// ─── Bond yields: Yahoo first, FRED fallback ──────────────────────────────────
// Crumb is fetched once and shared across all Yahoo calls.
let _crumbCache = null;

async function getCrumb() {
  if (!_crumbCache) _crumbCache = getYahooCrumb();
  return _crumbCache;
}

async function fetchYield(yahooTicker, fredSeries) {
  try {
    const { crumb, cookieStr } = await getCrumb();
    return await fetchYahoo(yahooTicker, crumb, cookieStr);
  } catch (yahooErr) {
    try {
      return await fetchFredYield(fredSeries);
    } catch (fredErr) {
      return { error: `Yahoo: ${yahooErr.message} / FRED: ${fredErr.message}` };
    }
  }
}

// ─── MOVE index (^MOVE via Yahoo Finance with crumb) ─────────────────────────
async function fetchMove() {
  try {
    const { crumb, cookieStr } = await getCrumb();
    return await fetchYahoo("%5EMOVE", crumb, cookieStr);
  } catch (e) {
    return { error: e.message };
  }
}
