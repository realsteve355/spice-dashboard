import { C, F } from "../../tokens";

const S = {
  grid: {
    display: "grid",
    border: `1px solid ${C.line}`,
    background: C.panel,
    fontFamily: F.mono,
  },
  cell: {
    padding: "20px 22px",
    borderRight: `1px solid ${C.line}`,
    borderTop: `1px solid ${C.line}`,
    position: "relative",
  },
  lab: {
    fontSize: 9.5,
    color: C.dim,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  val: {
    fontSize: 22,
    fontWeight: 500,
    color: C.txt,
    fontFamily: F.mono,
    lineHeight: 1.1,
  },
  delta: {
    fontSize: 11,
    color: C.dim,
    marginTop: 6,
  },
  bar: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    height: 2,
    background: C.line,
  },
  barInner: {
    height: "100%",
    background: C.txt,
  },
};

const valTone = {
  ok:   C.ok,
  warn: C.warn,
  crit: C.crit,
};

const deltaTone = {
  up:   C.ok,
  down: C.crit,
  flat: C.dim,
};

/**
 * TelemetryGrid — 4-column macro indicator grid.
 *
 * Each cell: { label, value, delta?, dir?, status?, progress? }
 *  - status: "ok" | "warn" | "crit" — colours the value
 *  - dir:    "up"  | "down" | "flat" — colours the delta
 *  - progress: 0-1 — thin bar at cell bottom
 *
 * Cells flow into a 4-column grid. Rows wrap automatically. Borders form a
 * unified outer border with hairline dividers between cells.
 */
export default function TelemetryGrid({ cells = [], columns = 4 }) {
  return (
    <div style={{ ...S.grid, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {cells.map((c, i) => {
        // Top row: drop top border. Right column: drop right border.
        const isTopRow    = i < columns;
        const isRightEdge = (i + 1) % columns === 0;
        return (
          <div
            key={i}
            style={{
              ...S.cell,
              borderTop:   isTopRow    ? "none" : S.cell.borderTop,
              borderRight: isRightEdge ? "none" : S.cell.borderRight,
            }}
          >
            <div style={S.lab}>{c.label}</div>
            <div style={{ ...S.val, color: valTone[c.status] || C.txt }}>{c.value}</div>
            {c.delta != null && (
              <div style={{ ...S.delta, color: deltaTone[c.dir] || C.dim }}>{c.delta}</div>
            )}
            {c.progress != null && (
              <div style={S.bar}>
                <div style={{
                  ...S.barInner,
                  width: `${Math.max(0, Math.min(1, c.progress)) * 100}%`,
                  background: valTone[c.status] || C.txt,
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
