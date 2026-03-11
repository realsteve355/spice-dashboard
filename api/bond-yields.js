// Vercel serverless function — fetches daily 10Y government bond yields.
// Returns: { italy, germany, japan }
//
// Strategy:
//   1. Fetch Yahoo Finance session cookie + crumb token
//   2. Fetch Italy, Germany, Japan yields in parallel (daily data)
//   3. If Yahoo fails or times out (5s), fall back to FRED OECD monthly

const FRED_KEY = process.env.VITE_FRED_API_KEY;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const YAHOO_TICKERS = {
  italy:   "GBTPIT10Y=X",
  germany: "GDBR10YR=X",
  japan:   "GJGB10YR=X",
};

const FRED_SERIES = {
  italy:   "IRLTLT01ITM156N",
  germany: "IRLTLT01DEM156N",
  japan:   "IRLTLT01JPM156N",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=14400, stale-while-revalidate=3600"); // 4h

  // Try Yahoo Finance first (daily). Abort the whole attempt after 5 seconds.
  const yahooController = new AbortController();
  const yahooTimeout = setTimeout(() => yahooController.abort(), 5000);

  try {
    const { crumb, cookieStr } = await getYahooCrumb(yahooController.signal);

    const entries = await Promise.all(
      Object.entries(YAHOO_TICKERS).map(async ([key, ticker]) => {
        const data = await fetchYahooChart(ticker, crumb, cookieStr, yahooController.signal);
        return [key, data];
      })
    );

    clearTimeout(yahooTimeout);
    return res.status(200).json(Object.fromEntries(entries));

  } catch (yahooErr) {
    clearTimeout(yahooTimeout);
    // Yahoo failed or timed out — fall back to FRED monthly
    const entries = await Promise.all(
      Object.entries(FRED_SERIES).map(async ([key, series]) => {
        try {
          const data = await fetchFred(series);
          return [key, data];
        } catch (e) {
          return [key, { error: e.message }];
        }
      })
    );
    return res.status(200).json(Object.fromEntries(entries));
  }
}

// ─── Yahoo Finance crumb auth ─────────────────────────────────────────────────
async function getYahooCrumb(signal) {
  const cookieRes = await fetch("https://fc.yahoo.com", {
    headers: { "User-Agent": UA },
    redirect: "follow",
    signal,
  });

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
    { headers: { "User-Agent": UA, "Cookie": cookieStr }, signal }
  );

  const crumb = await crumbRes.text();
  if (!crumb || crumb.includes("<") || crumb.length > 30) {
    throw new Error(`invalid crumb`);
  }

  return { crumb, cookieStr };
}

// ─── Yahoo Finance chart data ─────────────────────────────────────────────────
async function fetchYahooChart(ticker, crumb, cookieStr, signal) {
  const encoded = encodeURIComponent(ticker);
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}` +
    `?range=5d&interval=1d&includePrePost=false&crumb=${encodeURIComponent(crumb)}`;

  const r = await fetch(url, {
    headers: { "User-Agent": UA, "Cookie": cookieStr, "Accept": "application/json" },
    signal,
  });
  if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);

  const j = await r.json();
  const result = j.chart?.result?.[0];
  if (!result) throw new Error("no chart result");

  const closes     = result.indicators?.quote?.[0]?.close || [];
  const timestamps = result.timestamp || [];

  for (let i = closes.length - 1; i >= 0; i--) {
    if (closes[i] != null) {
      return {
        value: closes[i],
        date:  new Date(timestamps[i] * 1000).toISOString().split("T")[0],
        src:   "yahoo",
      };
    }
  }
  throw new Error("no valid close");
}

// ─── FRED fallback ────────────────────────────────────────────────────────────
async function fetchFred(series) {
  if (!FRED_KEY) throw new Error("no FRED key");
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${series}&api_key=${FRED_KEY}&limit=3&sort_order=desc&file_type=json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`FRED HTTP ${r.status}`);
  const j = await r.json();
  if (j.error_message) throw new Error(j.error_message);
  const obs = (j.observations || []).filter(o => o.value !== ".");
  if (!obs.length) throw new Error("no data");
  return { value: parseFloat(obs[0].value), date: obs[0].date, src: "fred" };
}
