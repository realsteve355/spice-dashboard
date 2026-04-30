import { C, F } from "../tokens";
import TopBar     from "../components/spice/TopBar";
import TickerTape from "../components/spice/TickerTape";
import SectionHead from "../components/spice/SectionHead";
import Button     from "../components/spice/Button";
import StatusPill from "../components/spice/StatusPill";
import Footer     from "../components/spice/Footer";

const S = {
  page: { minHeight: "calc(100vh - 57px)", background: C.bg, color: C.txt, fontFamily: F.mono },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "32px 36px 56px" },
  block: { marginBottom: 48 },
  label: { fontSize: 10, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8 },
  meta:  { fontSize: 11, color: C.faint, marginTop: 6 },
  row:   { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  panel: { background: C.panel, border: `1px solid ${C.line}`, padding: 24 },
};

const SAMPLE_TICKER = [
  { k: "BTC",         v: "$112,400",     d: "+1.40%",  dir: "up" },
  { k: "PAXG",        v: "$3,840",       d: "+0.62%",  dir: "up" },
  { k: "DXY",         v: "99.21",        d: "−0.30%",  dir: "down" },
  { k: "10Y",         v: "4.10%",        d: "±0.00",   dir: "flat" },
  { k: "CPI",         v: "3.40%",        d: "+0.10pp", dir: "down" },
  { k: "Debt/GDP",    v: "123%",         d: "+1.4yr",  dir: "down" },
  { k: "SPICE Lvl",   v: "7.20",         d: "+0.12",   dir: "up" },
];

const SAMPLE_NAV = [
  { label: "Mission",     to: "/",            end: true },
  { label: "Components",  to: "/_components" },
  { label: "Methodology", to: "/spice-methodology.html" },
];

export default function Components() {
  return (
    <div style={S.page}>
      <div style={S.inner}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.headline, letterSpacing: "-0.01em", marginBottom: 8 }}>
          SPICE component showroom
        </h1>
        <p style={{ fontSize: 13, color: C.txt2, marginBottom: 40 }}>
          Every chrome component from the mission-control library. See <code style={{ color: C.dim }}>docs/redesign.md</code> §3 for the full spec.
        </p>

        <div style={S.block}>
          <div style={S.label}>TopBar — used at /_components</div>
          <div style={{ border: `1px solid ${C.line}` }}>
            <TopBar
              navItems={SAMPLE_NAV}
              status="Sys Online"
              clock="14:32 UTC"
              wallet={{ label: "Connect Wallet", onClick: () => {} }}
            />
          </div>
          <div style={S.meta}>Already mounted as the page nav above. Inline copy renders the same component with sample props.</div>
        </div>

        <div style={S.block}>
          <div style={S.label}>TickerTape</div>
          <TickerTape items={SAMPLE_TICKER} speed={60} />
          <div style={S.meta}>60s linear infinite scroll. Items duplicated once for seamless loop. Fade gradients on left/right edges.</div>
        </div>

        <div style={S.block}>
          <div style={S.label}>SectionHead</div>
          <div style={S.panel}>
            <SectionHead tag="T-01" title="Field Telemetry · Macro Indicators" timestamp="SYNC 14:31:55Z" />
            <SectionHead tag="T-02" title="Threat Vectors · Three Forces" timestamp="CONF 0.74" />
            <SectionHead tag="T-03" title="Dispatches · Field Reports" timestamp="3 ENTRIES" />
          </div>
        </div>

        <div style={S.block}>
          <div style={S.label}>Button</div>
          <div style={{ ...S.panel, ...S.row }}>
            <Button variant="primary">Enter Vault →</Button>
            <Button variant="secondary">Read Thesis</Button>
            <Button variant="secondary">View Telemetry</Button>
          </div>
          <div style={S.meta}>Two variants only. Square corners. No third variant.</div>
        </div>

        <div style={S.block}>
          <div style={S.label}>StatusPill</div>
          <div style={{ ...S.panel, ...S.row }}>
            <StatusPill status="ok"   label="Pre-collision · window open" />
            <StatusPill status="warn" label="Caution · monitoring" />
            <StatusPill status="crit" label="Breach · reserve floor" />
            <StatusPill status="txt"  label="Standby" />
          </div>
        </div>

        <div style={S.block}>
          <div style={S.label}>Footer</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
