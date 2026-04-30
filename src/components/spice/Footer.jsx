import { C, F } from "../../tokens";

const S = {
  foot: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 26px",
    borderTop: `1px solid ${C.line}`,
    background: C.panel,
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.dim,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  cluster: { display: "flex", alignItems: "center", gap: 12 },
  sep: { color: C.faint },
  ok: { color: C.ok },
};

export default function Footer({
  status = "All systems nominal",
  build  = "master",
  network = "Base Sepolia · 84532",
  version = "v0.7",
}) {
  return (
    <footer style={S.foot}>
      <div style={S.cluster}>
        <span style={S.ok}>●</span>
        <span>{status}</span>
        <span style={S.sep}>|</span>
        <span>Build · {build}</span>
      </div>
      <div style={S.cluster}>
        <span>{network}</span>
        <span style={S.sep}>|</span>
        <span>SPICE / SPICE</span>
        <span style={S.sep}>|</span>
        <span>{version}</span>
      </div>
    </footer>
  );
}
