import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ALLOCATIONS } from "../data/allocations";

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
  const currentLevel = params.get("level") !== null ? parseInt(params.get("level"), 10) : 0;
  const [prices, setPrices] = useState(null);

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
      {activeAlloc ? (
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

      {/* ── Live prices ───────────────────────────────────────────────── */}
      <div style={S.priceBar}>
        <div style={S.priceBarLeft}>
          <div style={S.priceEyebrow}>LIVE ASSET PRICES</div>
          <div style={S.priceRow}>
            {[
              { label: "Bitcoin (BTC)", val: prices?.btc,   prefix: "$" },
              { label: "PAXG (gold oz)", val: prices?.paxg, prefix: "$" },
              { label: "Silver (oz)",   val: prices?.silver, prefix: "$" },
            ].map(p => (
              <div key={p.label} style={S.priceItem}>
                <div style={S.priceLabel}>{p.label}</div>
                <div style={S.priceVal}>
                  {p.val != null ? `${p.prefix}${fmt(p.val)}` : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.priceBarRight}>
          <div style={S.priceEyebrow}>FUND AUM</div>
          <div style={S.aumVal}>Pre-launch</div>
          <div style={S.aumSub}>On-chain vault not yet deployed</div>
        </div>
        {prices && (
          <div style={S.priceSrc}>CoinGecko · refreshed on page load</div>
        )}
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
                borderTop: `4px solid ${alloc.color}`,
                boxShadow: isActive ? `0 0 0 2px ${alloc.color}` : "none",
                background: isActive ? alloc.bg : "#fff",
              }}
            >
              <div style={S.colHead}>
                <div style={{ ...S.levelBadge, background: alloc.bg, color: alloc.color, border: `1px solid ${alloc.color}50` }}>
                  {alloc.label}
                </div>
                {isActive && <div style={{ ...S.activePill, color: alloc.color }}>◈ current</div>}
              </div>
              <div style={S.scoreRange}>{alloc.scoreRange} composite</div>

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
      {activeAlloc && prices?.btc && (
        <div style={{ ...S.notionalWrap, borderColor: activeAlloc.color }}>
          <div style={S.notionalHeader}>
            <div>
              <div style={{ ...S.notionalEyebrow, color: activeAlloc.color }}>
                {activeAlloc.label} ALLOCATION — NOTIONAL VALUATION
              </div>
              <div style={S.notionalSub}>
                Per 1 BTC invested at current prices (BTC = ${fmt(prices.btc)})
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={S.notionalTotal}>1.0000 BTC</div>
              <div style={S.notionalTotalUsd}>${fmt(prices.btc)}</div>
            </div>
          </div>
          <div style={S.notionalTableHead}>
            <span style={{ flex: "0 0 140px" }}>Asset</span>
            <span style={{ flex: "0 0 50px", textAlign: "right" }}>Alloc</span>
            <span style={{ flex: "0 0 90px", textAlign: "right" }}>BTC equiv</span>
            <span style={{ flex: 1, textAlign: "right" }}>USD value</span>
            <span style={{ flex: "0 0 130px", textAlign: "right" }}>Spot ref</span>
          </div>
          {activeAlloc.assets.map(a => {
            const btcEq  = a.pct / 100;
            const usdEq  = btcEq * prices.btc;
            const spotId = PRICE_IDS[a.name];
            const spot   = spotId === "bitcoin" ? prices.btc
                         : spotId === "pax-gold" ? prices.paxg
                         : spotId === "silver"   ? prices.silver
                         : null;
            return (
              <div key={a.name} style={S.notionalRow}>
                <div style={{ flex: "0 0 140px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ ...S.dot, background: a.color }} />
                  <span style={{ fontSize: 11, color: "#333" }}>{a.name}</span>
                </div>
                <span style={{ flex: "0 0 50px", textAlign: "right", fontSize: 12, fontWeight: 700, color: activeAlloc.color }}>{a.pct}%</span>
                <span style={{ flex: "0 0 90px", textAlign: "right", fontSize: 11, color: "#555" }}>{fmtBtc(btcEq)} BTC</span>
                <span style={{ flex: 1, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#111" }}>${fmt(usdEq)}</span>
                <span style={{ flex: "0 0 130px", textAlign: "right", fontSize: 10, color: "#aaa" }}>
                  {spot ? `$${fmt(spot)} / unit` : "synthetic / basket"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Context row ───────────────────────────────────────────────── */}
      <div style={S.contextGrid}>
        {ALLOCATIONS.map(alloc => (
          <div key={alloc.level} style={S.contextCell}>
            <div style={{ ...S.contextLabel, color: alloc.color }}>{alloc.label}</div>
            <div style={S.contextText}>{alloc.context}</div>
          </div>
        ))}
      </div>

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

  // Price bar
  priceBar: {
    display: "flex",
    alignItems: "flex-start",
    gap: 32,
    padding: "18px 24px",
    background: "#fafafa",
    border: "1px solid #e2e2e2",
    marginBottom: 32,
    position: "relative",
  },
  priceBarLeft: { flex: 1 },
  priceBarRight: { textAlign: "right" },
  priceEyebrow: { fontSize: 9, color: "#aaa", letterSpacing: "0.12em", marginBottom: 10 },
  priceRow: { display: "flex", gap: 32 },
  priceItem: {},
  priceLabel: { fontSize: 9, color: "#aaa", letterSpacing: "0.06em", marginBottom: 3 },
  priceVal: { fontSize: 18, fontWeight: 700, color: "#111" },
  aumVal: { fontSize: 18, fontWeight: 700, color: "#aaa" },
  aumSub: { fontSize: 9, color: "#ccc", marginTop: 3 },
  priceSrc: {
    position: "absolute",
    bottom: 8,
    right: 14,
    fontSize: 9,
    color: "#ccc",
    letterSpacing: "0.06em",
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
  activePill: { fontSize: 9, letterSpacing: "0.08em", fontWeight: 700 },
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
