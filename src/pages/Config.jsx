import { ALLOCATIONS } from "../data/allocations";

// ─── Hidden configuration page — not linked from nav ──────────────────────────
// URL: /config
// Edit allocations by modifying src/data/allocations.js and redeploying.
// Future: AI agent voting panel (Claude, Gemini, Grok).

export default function Config() {
  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <div style={S.eyebrow}>SPICE PROTOCOL · INTERNAL</div>
        <h1 style={S.title}>Configuration</h1>
        <p style={S.subtitle}>
          This page is not publicly linked. It displays current portfolio allocations
          and is the designated location for future AI agent advisory connections.
        </p>
        <div style={S.editNote}>
          To edit allocations: modify <code style={S.code}>src/data/allocations.js</code> and redeploy.
          The Portfolio page and this page will update automatically.
        </div>
      </div>

      {/* Current allocations */}
      <div style={S.section}>
        <div style={S.sectionTitle}>PORTFOLIO ALLOCATIONS</div>
        <div style={S.sectionSub}>Current configuration — 5 alert levels</div>

        {ALLOCATIONS.map(alloc => (
          <div key={alloc.level} style={S.levelBlock}>
            <div style={S.levelHead}>
              <div style={{ ...S.levelLabel, color: alloc.color }}>{alloc.label}</div>
              <div style={S.levelRange}>score {alloc.scoreRange}</div>
            </div>

            {/* Stacked bar */}
            <div style={S.bar}>
              {alloc.assets.map(a => (
                <div
                  key={a.name}
                  style={{ width: `${a.pct}%`, background: a.color, height: "100%" }}
                  title={`${a.name}: ${a.pct}%`}
                />
              ))}
            </div>

            {/* Asset table */}
            <div style={S.assetTable}>
              {alloc.assets.map(a => (
                <div key={a.name} style={S.assetRow}>
                  <div style={{ ...S.dot, background: a.color }} />
                  <span style={S.assetName}>{a.name}</span>
                  <span style={S.assetPct}>{a.pct}%</span>
                  <span style={S.assetNote}>{a.note}</span>
                </div>
              ))}
            </div>

            <div style={S.objective}>{alloc.objective}</div>
          </div>
        ))}
      </div>

      {/* AI agent panel — future */}
      <div style={S.section}>
        <div style={S.sectionTitle}>AI ADVISORY AGENTS</div>
        <div style={S.sectionSub}>Future — not yet implemented</div>

        <div style={S.agentPanel}>
          {["Claude", "Gemini", "Grok", "ChatGPT"].map(agent => (
            <div key={agent} style={S.agentCard}>
              <div style={S.agentName}>{agent}</div>
              <div style={S.agentStatus}>not connected</div>
              <div style={S.agentVote}>—</div>
              <div style={S.agentLabel}>recommendation</div>
            </div>
          ))}
        </div>

        <div style={S.agentNote}>
          When connected, each agent will be prompted with current indicator data
          and asked to recommend a portfolio level (Green → Red) with reasoning.
          A majority vote or weighted consensus will flag proposed allocation changes
          for human review before any position adjustment.
        </div>
      </div>

      {/* Links */}
      <div style={S.links}>
        <a href="/apocalypse" style={S.link}>→ Indicators (live composite score)</a>
        <a href="/portfolio" style={S.link}>→ Portfolio (public view)</a>
      </div>
    </div>
  );
}

const S = {
  page: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "48px 40px 80px",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  pageHeader: {
    borderBottom: "1px solid #e2e2e2",
    paddingBottom: 28,
    marginBottom: 40,
  },
  eyebrow: {
    fontSize: 10,
    color: "#B8860B",
    letterSpacing: "0.15em",
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    lineHeight: 1.7,
    maxWidth: 580,
    margin: "0 0 12px",
  },
  editNote: {
    fontSize: 11,
    color: "#888",
    background: "#fafafa",
    border: "1px solid #e2e2e2",
    padding: "10px 14px",
    lineHeight: 1.6,
  },
  code: {
    background: "#f0f0f0",
    padding: "1px 5px",
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#333",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 10,
    color: "#aaa",
    marginBottom: 24,
  },
  levelBlock: {
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: 20,
    marginBottom: 20,
  },
  levelHead: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 10,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  levelRange: {
    fontSize: 10,
    color: "#aaa",
  },
  bar: {
    display: "flex",
    height: 8,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  assetTable: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 10,
  },
  assetRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  assetName: {
    fontSize: 11,
    color: "#333",
    width: 160,
    flexShrink: 0,
  },
  assetPct: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111",
    width: 36,
    flexShrink: 0,
  },
  assetNote: {
    fontSize: 10,
    color: "#aaa",
  },
  objective: {
    fontSize: 11,
    color: "#666",
    lineHeight: 1.65,
    marginTop: 8,
    borderLeft: "2px solid #e2e2e2",
    paddingLeft: 12,
  },
  // AI agent panel
  agentPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 16,
  },
  agentCard: {
    border: "1px solid #e2e2e2",
    padding: "16px",
    textAlign: "center",
    background: "#fafafa",
  },
  agentName: {
    fontSize: 12,
    fontWeight: 700,
    color: "#333",
    marginBottom: 8,
    letterSpacing: "0.06em",
  },
  agentStatus: {
    fontSize: 9,
    color: "#ccc",
    letterSpacing: "0.08em",
    marginBottom: 12,
  },
  agentVote: {
    fontSize: 24,
    fontWeight: 700,
    color: "#ddd",
    marginBottom: 4,
  },
  agentLabel: {
    fontSize: 9,
    color: "#ccc",
    letterSpacing: "0.08em",
  },
  agentNote: {
    fontSize: 11,
    color: "#777",
    lineHeight: 1.7,
    borderLeft: "2px solid #e2e2e2",
    paddingLeft: 14,
  },
  links: {
    display: "flex",
    gap: 32,
    paddingTop: 24,
    borderTop: "1px solid #e2e2e2",
  },
  link: {
    fontSize: 11,
    color: "#B8860B",
    textDecoration: "none",
    letterSpacing: "0.05em",
  },
};
