import { C, F } from "../../tokens";

const tone = {
  INFO: C.txt2,
  WARN: C.warn,
  CRIT: C.crit,
};

const S = {
  panel: {
    background: C.panel,
    border: `1px solid ${C.line}`,
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
    display: "grid",
    gridTemplateColumns: "60px 60px 1fr",
    gap: 12,
    padding: "10px 18px",
    borderBottom: `1px dotted ${C.line}`,
    fontSize: 11.5,
    alignItems: "baseline",
  },
  t:   { color: C.dim },
  msg: { color: C.txt2, lineHeight: 1.4 },
  lvl: { fontWeight: 600, letterSpacing: "0.12em" },
};

/**
 * EventLog — 3-column time / level / message log.
 *
 * Props:
 *   title  — header text (default "Event Log")
 *   meta   — optional right-aligned header tag (e.g. "LIVE")
 *   events — array of { time, level, msg } where level ∈ {INFO, WARN, CRIT}
 */
export default function EventLog({ title = "Event Log", meta = "LIVE", events = [] }) {
  return (
    <div style={S.panel}>
      <div style={S.head}>
        <span style={S.ttl}>{title}</span>
        {meta && <span style={S.meta}>{meta}</span>}
      </div>
      {events.map((e, i) => (
        <div
          key={i}
          style={{
            ...S.row,
            borderBottom: i === events.length - 1 ? "none" : S.row.borderBottom,
          }}
        >
          <span style={S.t}>{e.time}</span>
          <span style={{ ...S.lvl, color: tone[e.level] || C.txt2 }}>{e.level}</span>
          <span style={S.msg}>{e.msg}</span>
        </div>
      ))}
    </div>
  );
}
