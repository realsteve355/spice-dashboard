import { C, F } from "../tokens";
import TopBar             from "../components/spice/TopBar";
import TickerTape         from "../components/spice/TickerTape";
import SectionHead        from "../components/spice/SectionHead";
import Button             from "../components/spice/Button";
import StatusPill         from "../components/spice/StatusPill";
import Footer             from "../components/spice/Footer";
import TelemetryGrid      from "../components/spice/TelemetryGrid";
import ColonyStatusPanel  from "../components/spice/ColonyStatusPanel";
import EventLog           from "../components/spice/EventLog";

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
          <div style={S.label}>TelemetryGrid (4 columns × 2 rows)</div>
          <TelemetryGrid
            columns={4}
            cells={[
              { label: "SPICE Level",   value: "7.20 / 10",  delta: "+0.12 wk", dir: "up", progress: 0.72 },
              { label: "US Debt / GDP", value: "123 %",      delta: "+1.4 yr",  dir: "down", status: "crit", progress: 0.70 },
              { label: "10Y Yield",     value: "4.10 %",     delta: "±0.00",    dir: "flat" },
              { label: "Real Rate",     value: "1.80 %",     delta: "+0.08",    dir: "up" },
              { label: "CPI YoY",       value: "3.40 %",     delta: "+0.10 pp", dir: "down" },
              { label: "DXY",           value: "99.21",      delta: "−0.30 %",  dir: "up" },
              { label: "BTC",           value: "$112,400",   delta: "+1.40 %",  dir: "up" },
              { label: "Crisis Window", value: "2029—33",    delta: "CONF 0.74", dir: "flat", status: "crit" },
            ]}
          />
        </div>

        <div style={S.block}>
          <div style={S.label}>ColonyStatusPanel</div>
          <div style={{ maxWidth: 360 }}>
            <ColonyStatusPanel
              title="Colony Status"
              meta="v0.7 · TESTNET"
              rows={[
                { k: "Active colonies",   v: "1" },
                { k: "Citizens enrolled", v: "5" },
                { k: "S-token supply",    v: "12,440" },
                { k: "V-token supply",    v: "3,820" },
                { k: "Current epoch",     v: "13" },
                { k: "Network",           v: "Base Sepolia" },
              ]}
            />
          </div>
        </div>

        <div style={S.block}>
          <div style={S.label}>EventLog</div>
          <div style={{ maxWidth: 720 }}>
            <EventLog
              title="Event Log"
              meta="LIVE"
              events={[
                { time: "14:31", level: "INFO", msg: "Oracle sync · price feed nominal" },
                { time: "14:18", level: "INFO", msg: "Rebalance check · within band" },
                { time: "13:42", level: "WARN", msg: "CPI YoY rising · monitor" },
                { time: "12:05", level: "INFO", msg: "Deposit · 0.50 ₿ · 0xA1…2c" },
                { time: "09:51", level: "WARN", msg: "SPICE level → 7.20 (+0.12)" },
                { time: "08:30", level: "INFO", msg: "Treasury auction · 4.11% stop" },
              ]}
            />
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
