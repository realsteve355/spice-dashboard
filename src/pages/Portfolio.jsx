import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ALLOCATIONS } from "../data/allocations";

function readCachedLevel() {
  try {
    const s = JSON.parse(localStorage.getItem("spice_level_cache"));
    if (s && Date.now() - s.timestamp < 24 * 60 * 60 * 1000) return s;
  } catch {}
  return null;
}

// CoinGecko IDs for assets we can price live
const PRICE_IDS = {
  "Bitcoin":   "bitcoin",
  "PAXG":      "pax-gold",
  "Silver":    "silver",
};

function fmt(n)    { return n.toLocaleString("en-US", { maximumFractionDigits: 0 }); }
function fmtBtc(n) { return n.toFixed(4); }

export default function Portfolio() {
  const [params] = useSearchParams();
  const currentLevel = (() => {
    const p = params.get("level");
    if (p !== null) return parseInt(p, 10);
    return readCachedLevel()?.level ?? 0;
  })();
  const [prices, setPrices] = useState(null);
  const [aum, setAum] = useState(10000);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold,silver&vs_currencies=usd")
      .then(r => r.json())
      .then(j => setPrices({
        btc:   j["bitcoin"]?.usd ?? null,
        paxg:  j["pax-gold"]?.usd ?? null,
        silver: j["silver"]?.usd ?? null,
      }))
      .catch(() => {});
  }, []);

  const activeAlloc = currentLevel !== null ? ALLOCATIONS[currentLevel] : null;

  return (
    <div style={S.page}>

      {/* ── Status banner ─────────────────────────────────────────────── */}
      {activeAlloc && (
        <div style={{ ...S.statusBanner, background: activeAlloc.bg, borderColor: activeAlloc.color }}>
          <div style={S.statusLeft}>
            <div style={S.statusEyebrow}>CURRENT SPICE SYSTEM STATUS</div>
            <div style={{ ...S.statusLevel, color: activeAlloc.color }}>{activeAlloc.label}</div>
            <div style={S.statusContext}>{activeAlloc.context}</div>
          </div>
          <div style={S.statusRight}>
            <div style={{ ...S.statusScoreRange, color: activeAlloc.color }}>
              Score {activeAlloc.scoreRange}
            </div>
            <a href="/indicators" style={{ ...S.statusLink, color: activeAlloc.color }}>
              → Live indicators
            </a>
          </div>
        </div>
      )}

      {/* ── AUM input ─────────────────────────────────────────────────── */}
      <div style={S.aumBox}>
        <div style={S.aumBoxLeft}>
          <div style={S.priceEyebrow}>INVESTMENT AMOUNT</div>
          <div style={S.aumInputRow}>
            <span style={S.aumCurrency}>$</span>
            <input
              type="number"
              min="0"
              value={aum}
              onChange={e => setAum(Math.max(0, Number(e.target.value)))}
              style={S.aumInput}
            />
          </div>
          <div style={S.aumHint}>Adjust to see notional allocation below</div>
        </div>
        <div style={S.aumBoxRight}>
          <div style={S.priceEyebrow}>SPOT PRICES</div>
          <div style={S.priceRow}>
            {[
              { label: "BTC", val: prices?.btc },
              { label: "PAXG", val: prices?.paxg },
              { label: "Silver", val: prices?.silver },
            ].map(p => (
              <div key={p.label} style={S.priceItem}>
                <div style={S.priceLabel}>{p.label}</div>
                <div style={S.priceValSm}>{p.val != null ? `$${fmt(p.val)}` : "—"}</div>
              </div>
            ))}
          </div>
          {prices && <div style={S.priceSrc}>CoinGecko · refreshed on page load</div>}
        </div>
      </div>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div style={S.pageHeader}>
        <div style={S.eyebrow}>SPICE PROTOCOL · INVESTABLE UNIVERSE</div>
        <h1 style={S.title}>Portfolio</h1>
        <p style={S.subtitle}>
          The SPICE portfolio shifts composition as the system alert level escalates.
          Each level is calibrated for a distinct crisis phase — from baseline
          preservation through to maximum crisis positioning.
        </p>
      </div>

      {/* ── Portfolio columns ─────────────────────────────────────────── */}
      <div style={S.grid}>
        {ALLOCATIONS.map(alloc => {
          const isActive = currentLevel === alloc.level;
          return (
            <div
              key={alloc.level}
              style={{
                ...S.column,
                border: isActive ? `2px solid ${alloc.color}` : "1px solid #e2e2e2",
                borderTop: `4px solid ${alloc.color}`,
                background: isActive ? alloc.bg : "#fff",
              }}
            >
              {isActive && (
                <div style={{ ...S.activeHeader, background: alloc.color }}>
                  ◈ CURRENT ALLOCATION
                </div>
              )}
              <div style={S.colHead}>
                <div style={{ ...S.levelBadge, background: alloc.bg, color: alloc.color, border: `1px solid ${alloc.color}50` }}>
                  {alloc.label}
                </div>
              </div>

              {/* Stacked bar */}
              <div style={S.stackBar}>
                {alloc.assets.map(a => (
                  <div key={a.name} title={`${a.name}: ${a.pct}%`}
                    style={{ width: `${a.pct}%`, background: a.color, height: "100%" }} />
                ))}
              </div>

              {/* Asset list */}
              <div style={S.assetList}>
                {alloc.assets.map(a => (
                  <div key={a.name} style={S.assetRow}>
                    <div style={S.assetLeft}>
                      <div style={{ ...S.dot, background: a.color }} />
                      <span style={S.assetName}>{a.name}</span>
                    </div>
                    <span style={{ ...S.assetPct, color: alloc.color }}>{a.pct}%</span>
                  </div>
                ))}
              </div>

              <div style={S.divider} />
              <div style={S.objectiveLabel}>objective</div>
              <div style={S.objective}>{alloc.objective}</div>
            </div>
          );
        })}
      </div>

      {/* ── Notional valuation (active level only) ────────────────────── */}
      {activeAlloc && (
        <div style={{ ...S.notionalWrap, borderColor: activeAlloc.color }}>
          <div style={S.notionalHeader}>
            <div>
              <div style={{ ...S.notionalEyebrow, color: activeAlloc.color }}>
                {activeAlloc.label} ALLOCATION — NOTIONAL VALUATION
              </div>
              <div style={S.notionalSub}>
                ${fmt(aum)} invested · asset quantities at current spot prices
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={S.notionalTotal}>${fmt(aum)}</div>
              <div style={S.notionalTotalUsd}>total investment</div>
            </div>
          </div>
          <div style={S.notionalTableHead}>
            <span style={{ flex: "0 0 160px" }}>Asset</span>
            <span style={{ flex: "0 0 50px", textAlign: "right" }}>Alloc</span>
            <span style={{ flex: 1, textAlign: "right" }}>USD value</span>
            <span style={{ flex: "0 0 160px", textAlign: "right" }}>Units (est.)</span>
            <span style={{ flex: "0 0 120px", textAlign: "right" }}>Spot ref</span>
          </div>
          {activeAlloc.assets.map(a => {
            const usdVal = aum * (a.pct / 100);
            const spotId = PRICE_IDS[a.name];
            const spot   = spotId === "bitcoin" ? prices?.btc
                         : spotId === "pax-gold" ? prices?.paxg
                         : spotId === "silver"   ? prices?.silver
                         : null;
            const units  = spot
              ? spotId === "bitcoin"
                ? fmtBtc(usdVal / spot) + " BTC"
                : (usdVal / spot).toFixed(3) + " oz"
              : "—";
            return (
              <div key={a.name} style={S.notionalRow}>
                <div style={{ flex: "0 0 160px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ ...S.dot, background: a.color }} />
                  <span style={{ fontSize: 11, color: "#333" }}>{a.name}</span>
                </div>
                <span style={{ flex: "0 0 50px", textAlign: "right", fontSize: 12, fontWeight: 700, color: activeAlloc.color }}>{a.pct}%</span>
                <span style={{ flex: 1, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#111" }}>${fmt(usdVal)}</span>
                <span style={{ flex: "0 0 160px", textAlign: "right", fontSize: 11, color: "#555" }}>
                  {spot ? units : "synthetic / basket"}
                </span>
                <span style={{ flex: "0 0 120px", textAlign: "right", fontSize: 10, color: "#aaa" }}>
                  {spot ? `$${fmt(spot)} / unit` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div style={S.footer}>
        <div>Instruments: PAXG · XAUT · BTC · NVDA synthetic · tokenised commodities · Synthetix perps for bond shorts.</div>
        <div>Sovereign bond shorts: primary targets JGB (highest conviction), Italian BTPs, UK Gilts. USD/JPY short via dYdX perpetuals at Orange/Red.</div>
        <div>
          Allocations editable via <a href="/config" style={{ color: "#B8860B" }}>configuration page</a>
          {" "}· Live indicators: <a href="/indicators" style={{ color: "#B8860B" }}>Indicators</a>
          {" "}· Prices: CoinGecko
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "48px 40px 80px",
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // Status banner
  statusBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 32px",
    border: "2px solid",
    marginBottom: 20,
  },
  statusLeft: { flex: 1 },
  statusEyebrow: { fontSize: 10, color: "#999", letterSpacing: "0.15em", marginBottom: 8 },
  statusLevel: { fontSize: 40, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 },
  statusContext: { fontSize: 12, color: "#444", lineHeight: 1.65, maxWidth: 560 },
  statusRight: { textAlign: "right", paddingTop: 4 },
  statusScoreRange: { fontSize: 22, fontWeight: 700, marginBottom: 10 },
  statusLink: { fontSize: 11, textDecoration: "none", letterSpacing: "0.06em" },
  noStatusBanner: {
    padding: "14px 20px",
    background: "#fafafa",
    border: "1px solid #e2e2e2",
    marginBottom: 20,
  },
  noStatusText: { fontSize: 12, color: "#aaa" },

  // AUM box
  aumBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 48,
    padding: "18px 24px",
    background: "#fafafa",
    border: "1px solid #e2e2e2",
    marginBottom: 32,
  },
  aumBoxLeft: { flex: "0 0 auto" },
  aumBoxRight: { flex: 1, position: "relative" },
  aumInputRow: { display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 },
  aumCurrency: { fontSize: 22, fontWeight: 700, color: "#111" },
  aumInput: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111",
    fontFamily: "'IBM Plex Mono', monospace",
    border: "none",
    background: "transparent",
    outline: "none",
    width: 180,
    padding: 0,
  },
  aumHint: { fontSize: 9, color: "#bbb", letterSpacing: "0.06em" },
  priceEyebrow: { fontSize: 9, color: "#aaa", letterSpacing: "0.12em", marginBottom: 10 },
  priceRow: { display: "flex", gap: 28 },
  priceItem: {},
  priceLabel: { fontSize: 9, color: "#aaa", letterSpacing: "0.06em", marginBottom: 3 },
  priceValSm: { fontSize: 14, fontWeight: 700, color: "#555" },
  priceSrc: {
    fontSize: 9,
    color: "#ccc",
    letterSpacing: "0.06em",
    marginTop: 10,
  },

  // Header
  pageHeader: {
    borderBottom: "1px solid #e2e2e2",
    paddingBottom: 28,
    marginBottom: 32,
  },
  eyebrow: { fontSize: 10, color: "#B8860B", letterSpacing: "0.15em", marginBottom: 10 },
  title: { fontSize: 30, fontWeight: 700, color: "#111", margin: "0 0 12px", letterSpacing: "-0.01em" },
  subtitle: { fontSize: 12, color: "#555", lineHeight: 1.75, maxWidth: 680, margin: 0 },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 16,
    marginBottom: 32,
  },
  column: {
    border: "1px solid #e2e2e2",
    padding: "18px 16px",
    transition: "box-shadow 0.2s",
  },
  colHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  levelBadge: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 2 },
  activeHeader: {
    fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.12em",
    textAlign: "center", padding: "4px 0", margin: "-18px -16px 14px",
  },
  scoreRange: { fontSize: 9, color: "#aaa", letterSpacing: "0.06em", marginBottom: 14 },
  stackBar: { display: "flex", height: 8, borderRadius: 3, overflow: "hidden", marginBottom: 14 },
  assetList: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  assetRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  assetLeft: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 },
  dot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  assetName: { fontSize: 10, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  assetPct: { fontSize: 12, fontWeight: 700, flexShrink: 0, paddingLeft: 6 },
  divider: { height: 1, background: "#f0f0f0", marginBottom: 10 },
  objectiveLabel: { fontSize: 8, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 },
  objective: { fontSize: 10, color: "#666", lineHeight: 1.6 },

  // Notional valuation
  notionalWrap: {
    border: "2px solid",
    padding: "20px 24px",
    marginBottom: 32,
  },
  notionalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: "1px solid #e8e8e8",
  },
  notionalEyebrow: { fontSize: 10, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 4 },
  notionalSub: { fontSize: 11, color: "#666" },
  notionalTotal: { fontSize: 20, fontWeight: 700, color: "#111" },
  notionalTotalUsd: { fontSize: 12, color: "#666" },
  notionalTableHead: {
    display: "flex",
    fontSize: 9,
    color: "#aaa",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    paddingBottom: 8,
    borderBottom: "1px solid #f0f0f0",
    marginBottom: 6,
  },
  notionalRow: {
    display: "flex",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    borderBottom: "1px solid #f8f8f8",
  },

  // Context row
  contextGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 16,
    marginBottom: 48,
    borderTop: "1px solid #e2e2e2",
    paddingTop: 20,
  },
  contextCell: { paddingRight: 8 },
  contextLabel: { fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 },
  contextText: { fontSize: 10, color: "#777", lineHeight: 1.65 },

  // Footer
  footer: {
    paddingTop: 24,
    borderTop: "1px solid #e2e2e2",
    fontSize: 10,
    color: "#aaa",
    lineHeight: 2,
    letterSpacing: "0.04em",
  },
};
