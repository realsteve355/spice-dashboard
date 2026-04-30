import { C, F } from "../../tokens";

const S = {
  head: {
    display: "flex", alignItems: "center", gap: 14,
    marginBottom: 18, paddingBottom: 9,
    borderBottom: `1px solid ${C.line}`,
    fontFamily: F.mono,
  },
  prompt: { color: C.txt, fontWeight: 500, fontSize: 11.5, letterSpacing: "0.04em" },
  tag: { fontSize: 10.5, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase" },
  ttl: { fontSize: 11, color: C.txt, letterSpacing: "0.18em", textTransform: "uppercase" },
  spacer: { flex: 1, height: 1, background: C.line },
  ts: { fontSize: 10.5, color: C.dim, letterSpacing: "0.06em" },
};

export default function SectionHead({ tag, title, timestamp }) {
  return (
    <div style={S.head}>
      <span style={S.prompt}>&gt;</span>
      {tag && <span style={S.tag}>[{tag}]</span>}
      <span style={S.ttl}>{title}</span>
      <span style={S.spacer} />
      {timestamp && <span style={S.ts}>{timestamp}</span>}
    </div>
  );
}
