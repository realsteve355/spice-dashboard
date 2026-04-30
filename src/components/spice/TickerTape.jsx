import { C, F } from "../../tokens";

const S = {
  wrap: {
    borderBottom: `1px solid ${C.line}`,
    background: C.bg,
    overflow: "hidden",
    position: "relative",
    height: 36,
    display: "flex",
    alignItems: "center",
    fontFamily: F.mono,
  },
  fadeL: {
    content: '""', position: "absolute", top: 0, bottom: 0, left: 0, width: 60,
    background: `linear-gradient(to right, ${C.bg}, transparent)`,
    zIndex: 2, pointerEvents: "none",
  },
  fadeR: {
    content: '""', position: "absolute", top: 0, bottom: 0, right: 0, width: 60,
    background: `linear-gradient(to left, ${C.bg}, transparent)`,
    zIndex: 2, pointerEvents: "none",
  },
  track: {
    display: "flex", gap: 48, whiteSpace: "nowrap",
    paddingLeft: 26,
  },
  item: {
    display: "inline-flex", alignItems: "center", gap: 10,
    fontSize: 11.5, letterSpacing: "0.04em",
  },
  k: {
    color: C.dim, textTransform: "uppercase",
    letterSpacing: "0.12em", fontSize: 10.5,
  },
  v: { color: C.txt, fontWeight: 500 },
  d: { fontSize: 10.5 },
};

const dirColor = {
  up:   C.ok,
  down: C.crit,
  flat: C.dim,
};

export default function TickerTape({ items = [], speed = 60 }) {
  // Duplicate once for seamless infinite scroll
  const looped = [...items, ...items];
  return (
    <div style={S.wrap}>
      <style>{`
        @keyframes spice-ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <div style={S.fadeL} />
      <div style={S.fadeR} />
      <div style={{ ...S.track, animation: `spice-ticker-scroll ${speed}s linear infinite` }}>
        {looped.map((it, i) => (
          <span key={i} style={S.item}>
            <span style={S.k}>{it.k}</span>
            <span style={S.v}>{it.v}</span>
            {it.d && <span style={{ ...S.d, color: dirColor[it.dir || "flat"] }}>{it.d}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
