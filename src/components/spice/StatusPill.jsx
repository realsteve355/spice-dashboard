import { C, F } from "../../tokens";

const tone = {
  ok:   { color: C.ok,   bg: C.okBg,   shadow: "rgba(93,211,158,0.55)" },
  warn: { color: C.warn, bg: C.warnBg, shadow: "rgba(212,160,74,0.55)" },
  crit: { color: C.crit, bg: C.critBg, shadow: "rgba(239,68,68,0.55)" },
  txt:  { color: C.txt,  bg: "transparent", shadow: "rgba(237,229,212,0.55)" },
};

export default function StatusPill({ label, status = "ok" }) {
  const t = tone[status] || tone.ok;
  const S = {
    pill: {
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "5px 10px",
      border: `1px solid ${t.color}`,
      background: t.bg,
      fontFamily: F.mono,
      fontSize: 10.5,
      color: t.color,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      lineHeight: 1,
    },
    dot: {
      width: 7, height: 7, borderRadius: "50%",
      background: t.color, boxShadow: `0 0 10px ${t.shadow}`,
      animation: "spice-pulse 1.6s infinite",
    },
  };
  return (
    <>
      <style>{`@keyframes spice-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }`}</style>
      <span style={S.pill}>
        <span style={S.dot} />
        <span>{label}</span>
      </span>
    </>
  );
}
