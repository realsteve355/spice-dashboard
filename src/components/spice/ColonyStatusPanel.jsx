import { C, F } from "../../tokens";

const S = {
  panel: {
    background: C.panel,
    border: `1px solid ${C.lineHot}`,
    fontFamily: F.mono,
  },
  head: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: `1px solid ${C.line}`,
  },
  ttl: {
    fontSize: 11, color: C.txt,
    letterSpacing: "0.18em", textTransform: "uppercase",
  },
  meta: {
    fontSize: 10, color: C.dim,
    letterSpacing: "0.16em", textTransform: "uppercase",
  },
  row: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    padding: "11px 18px",
    borderBottom: `1px dashed ${C.line}`,
    fontSize: 12,
  },
  k: { color: C.dim },
  v: { color: C.txt, fontWeight: 500 },
};

/**
 * ColonyStatusPanel — vertical label-value rows, dotted dividers between.
 *
 * Props:
 *   title  — header text (e.g. "Colony Status")
 *   meta   — optional right-aligned header tag (e.g. "v0.7 · TESTNET")
 *   rows   — array of { k, v }
 */
export default function ColonyStatusPanel({ title, meta, rows = [] }) {
  return (
    <div style={S.panel}>
      <div style={S.head}>
        <span style={S.ttl}>{title}</span>
        {meta && <span style={S.meta}>{meta}</span>}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            ...S.row,
            borderBottom: i === rows.length - 1 ? "none" : S.row.borderBottom,
          }}
        >
          <span style={S.k}>{r.k}</span>
          <span style={S.v}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}
