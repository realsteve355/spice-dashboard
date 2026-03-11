import { useSearchParams } from "react-router-dom";
import { ALLOCATIONS } from "../data/allocations";

export default function Portfolio() {
  const [params] = useSearchParams();
  const currentLevel = params.get("level") !== null ? parseInt(params.get("level"), 10) : null;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.pageHeader}>
        <div style={S.eyebrow}>SPICE PROTOCOL · INVESTABLE UNIVERSE</div>
        <h1 style={S.title}>Portfolio</h1>
        <p style={S.subtitle}>
          The SPICE portfolio shifts composition as the system alert level escalates.
          Each level is calibrated for a distinct crisis phase — from baseline preservation
          through to maximum crisis positioning. Asset proportions are guidelines,
          not fixed allocations; the configuration page holds editable values.
        </p>
        {currentLevel !== null && (
          <div style={{ ...S.currentBadge, background: ALLOCATIONS[currentLevel].bg, borderColor: ALLOCATIONS[currentLevel].color, color: ALLOCATIONS[currentLevel].color }}>
            Current system level: <strong>{ALLOCATIONS[currentLevel].label}</strong> — portfolio highlighted below
          </div>
        )}
        {currentLevel === null && (
          <div style={S.noLevelNote}>
            No current level set. Visit the{" "}
            <a href="/indicators" style={{ color: "#B8860B" }}>Indicators page</a>
            {" "}to see live composite score, then return here with level highlighted.
          </div>
        )}
      </div>

      {/* Portfolio columns */}
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
              {/* Level header */}
              <div style={S.colHead}>
                <div style={{ ...S.levelBadge, background: alloc.bg, color: alloc.color, border: `1px solid ${alloc.color}50` }}>
                  {alloc.label}
                </div>
                {isActive && (
                  <div style={{ ...S.activePill, color: alloc.color }}>◈ current</div>
                )}
              </div>
              <div style={S.scoreRange}>{alloc.scoreRange} composite</div>

              {/* Stacked allocation bar */}
              <div style={S.stackBar}>
                {alloc.assets.map(a => (
                  <div
                    key={a.name}
                    title={`${a.name}: ${a.pct}%`}
                    style={{ width: `${a.pct}%`, background: a.color, height: "100%" }}
                  />
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

              {/* Objective */}
              <div style={S.divider} />
              <div style={S.objectiveLabel}>objective</div>
              <div style={S.objective}>{alloc.objective}</div>
            </div>
          );
        })}
      </div>

      {/* Context row below */}
      <div style={S.contextGrid}>
        {ALLOCATIONS.map(alloc => (
          <div key={alloc.level} style={S.contextCell}>
            <div style={{ ...S.contextLabel, color: alloc.color }}>{alloc.label}</div>
            <div style={S.contextText}>{alloc.context}</div>
          </div>
        ))}
      </div>

      {/* Footer notes */}
      <div style={S.footer}>
        <div>Asset proportions are indicative. Instruments: PAXG · XAUT · BTC · NVDA synthetic · tokenised commodities · Synthetix perps for bond shorts.</div>
        <div>Sovereign bond shorts: primary targets JGB (highest conviction), Italian BTPs, UK Gilts. USD/JPY short via dYdX perpetuals at Orange/Red.</div>
        <div>
          Allocations editable via{" "}
          <a href="/config" style={{ color: "#B8860B" }}>configuration page</a>.
          {" "}· Composite score and current level: <a href="/indicators" style={{ color: "#B8860B" }}>Indicators</a>.
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
  pageHeader: {
    borderBottom: "1px solid #e2e2e2",
    paddingBottom: 32,
    marginBottom: 40,
  },
  eyebrow: {
    fontSize: 10,
    color: "#B8860B",
    letterSpacing: "0.15em",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 14px",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    lineHeight: 1.75,
    maxWidth: 680,
    margin: "0 0 16px",
  },
  currentBadge: {
    display: "inline-block",
    fontSize: 11,
    padding: "6px 14px",
    border: "1px solid",
    borderRadius: 2,
    marginTop: 4,
  },
  noLevelNote: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 4,
  },
  // Column grid
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
  colHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  levelBadge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    borderRadius: 2,
  },
  activePill: {
    fontSize: 9,
    letterSpacing: "0.08em",
    fontWeight: 700,
  },
  scoreRange: {
    fontSize: 9,
    color: "#aaa",
    letterSpacing: "0.06em",
    marginBottom: 14,
  },
  // Stacked bar
  stackBar: {
    display: "flex",
    height: 8,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 14,
  },
  // Asset list
  assetList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 16,
  },
  assetRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetLeft: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
  },
  assetName: {
    fontSize: 10,
    color: "#333",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  assetPct: {
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    paddingLeft: 6,
  },
  divider: {
    height: 1,
    background: "#f0f0f0",
    marginBottom: 10,
  },
  objectiveLabel: {
    fontSize: 8,
    color: "#bbb",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  objective: {
    fontSize: 10,
    color: "#666",
    lineHeight: 1.6,
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
  contextCell: {
    paddingRight: 8,
  },
  contextLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    marginBottom: 6,
  },
  contextText: {
    fontSize: 10,
    color: "#777",
    lineHeight: 1.65,
  },
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
