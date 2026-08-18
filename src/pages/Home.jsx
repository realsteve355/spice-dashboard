import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { C, F } from "../tokens";
import { SPICE_PARAMS, LEVEL_LABELS } from "../data/spice-params";
import { COLONIES, BASE_SEPOLIA_RPC, COLONY_APP_HOST } from "../data/colonies";
import StatusPill     from "../components/spice/StatusPill";
import SectionHead    from "../components/spice/SectionHead";
import Button         from "../components/spice/Button";
import TickerTape     from "../components/spice/TickerTape";
import TelemetryGrid  from "../components/spice/TelemetryGrid";
import CornerFrame    from "../components/spice/CornerFrame";

const REGISTRY_ADDRESS = "0x9B8Eee5C078166d1b89A38Dae774773C89e53B9a";
const REGISTRY_ABI = [
  "function getActive() view returns (address[])",
  "function entries(address) view returns (address colony, string name, string slug, address founder, uint256 registeredAt)",
];
const COLONY_ABI = [
  "function colonyName() view returns (string)",
  "function citizenCount() view returns (uint256)",
  "function sToken() view returns (address)",
];
const STOKEN_ABI = ["function currentEpoch() view returns (uint256)"];

const { meta: M } = SPICE_PARAMS;

// Note: Crisis Level + Crisis Window are injected dynamically inside the
// component so the level is sourced from spice-params + cache.
const STATIC_TICKER = [
  { k: "BTC",      v: "$112,400", d: "+1.40%",  dir: "up" },
  { k: "PAXG",     v: "$3,840",   d: "+0.62%",  dir: "up" },
  { k: "DXY",      v: "99.21",    d: "−0.30%",  dir: "down" },
  { k: "10Y",      v: "4.10%",    d: "±0.00",   dir: "flat" },
  { k: "CPI",      v: "3.40%",    d: "+0.10pp", dir: "down" },
  { k: "Debt/GDP", v: "123%",     d: "+1.4yr",  dir: "down" },
];

const S = {
  page:  { background: C.bg, color: C.txt, fontFamily: F.mono, minHeight: "calc(100vh - 57px)" },
  inner: { maxWidth: 1280, margin: "0 auto", padding: "0 36px" },
  hero:  { padding: "48px 0 56px", borderBottom: `1px solid ${C.lineHot}`, marginBottom: 48 },
  h1: {
    fontSize: "clamp(30px, 4vw, 52px)",
    fontWeight: 700, color: C.headline,
    letterSpacing: "-0.01em", lineHeight: 1.1,
    margin: "20px 0 22px",
  },
  h1soft: { color: C.txt, fontWeight: 600 },
  lead: {
    fontSize: 14.5, color: C.txt2,
    lineHeight: 1.7, maxWidth: 760,
    marginBottom: 32,
  },
  ctas: { display: "flex", gap: 12, flexWrap: "wrap" },

  webAppCta:  { display: "flex", justifyContent: "center", marginBottom: 24 },
  webAppLink: { fontSize: 13, padding: "16px 40px", letterSpacing: "0.2em" },

  videoWrap: {
    background: C.panel, border: `1px solid ${C.lineHot}`,
    aspectRatio: "16 / 9", maxWidth: 720, margin: "0 auto",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: C.dim, marginBottom: 14,
  },
  videoMeta: { fontSize: 11.5, color: C.faint, letterSpacing: "0.06em", marginBottom: 24, textAlign: "center" },
  videoSegments: {
    display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
    marginBottom: 56,
  },
  handoff: {
    display: "flex", justifyContent: "center", marginTop: 24, marginBottom: 56,
  },

  dispatches: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24, marginBottom: 56,
  },
  dispatch: {
    position: "relative",
    background: C.panel, border: `1px solid ${C.line}`,
    padding: 24, textDecoration: "none", color: C.txt,
    display: "flex", flexDirection: "column", gap: 14,
    transition: "border-color 0.2s",
  },
  dTag:  { fontSize: 10, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase" },
  dTtl:  { fontSize: 17, fontWeight: 600, color: C.txt, letterSpacing: "0.02em", lineHeight: 1.3, margin: 0 },
  dBody: { fontSize: 13, color: C.txt2, lineHeight: 1.6, margin: 0 },
  dSep:  { borderTop: `1px solid ${C.line}`, paddingTop: 12, marginTop: "auto", fontSize: 11, color: C.dim, letterSpacing: "0.06em" },
};

export default function Home() {
  const [cachedLevel, setCachedLevel] = useState(null);
  const [colonies, setColonies] = useState(COLONIES);
  const [colonyData, setColonyData] = useState({});

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("spice_level_cache"));
      if (s && Date.now() - s.timestamp < 24 * 60 * 60 * 1000) setCachedLevel(s.level);
    } catch {}
  }, []);

  // Live colony list from registry — falls back to COLONIES while loading
  useEffect(() => {
    let cancelled = false;
    async function fetchRegistry() {
      try {
        const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
        const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
        const addresses = await registry.getActive();
        if (!addresses.length) return;
        const entries = await Promise.all(addresses.map((a) => registry.entries(a)));
        const list = entries
          .filter((e) => e.slug && e.name && e.colony !== ethers.ZeroAddress)
          .map((e) => ({ id: e.slug, slug: e.slug, address: e.colony }));
        if (!cancelled && list.length > 0) setColonies(list);
      } catch {
        // Registry unavailable — keep fallback, fail silent
      }
    }
    fetchRegistry();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
      const results = await Promise.all(
        colonies.map(async (c) => {
          try {
            const contract = new ethers.Contract(c.address, COLONY_ABI, provider);
            const [name, count, sTokenAddr] = await Promise.all([
              contract.colonyName(),
              contract.citizenCount(),
              contract.sToken(),
            ]);
            const sToken = new ethers.Contract(sTokenAddr, STOKEN_ABI, provider);
            const epoch = await sToken.currentEpoch();
            return [c.id, { name, citizens: Number(count), epoch: Number(epoch) }];
          } catch {
            return [c.id, null];
          }
        })
      );
      if (!cancelled) setColonyData(Object.fromEntries(results));
    }
    load();
    return () => { cancelled = true; };
  }, [colonies]);

  const level = cachedLevel ?? M.currentLevel;
  const levelLabel = LEVEL_LABELS[level];
  const totalCitizens = Object.values(colonyData).reduce((sum, d) => sum + (d?.citizens || 0), 0);

  // TODO: derive Mars/Earth colony counts from on-chain colonyType (currently
  // stored in localStorage on the colony app). All current on-chain colonies
  // are Earth — Mars exists as a simulation only.
  const earthCount = colonies.length;
  const marsCount  = 0;

  const tickerItems = [
    { k: "Crisis Level",  v: `${level} / 4`, d: levelLabel,    dir: level >= 3 ? "down" : "flat" },
    { k: "Crisis Window", v: "2029—33",      d: "conf 0.74",   dir: "down" },
    ...STATIC_TICKER,
  ];

  return (
    <div style={S.page}>
      <TickerTape items={tickerItems} speed={60} />
      <div style={S.inner}>

        {/* HERO */}
        <div style={S.hero}>
          <StatusPill status="ok" label="Pre-launch · research" />
          <h1 style={S.h1}>UBI for a Capitalist Economy</h1>
          <p style={S.lead}>
            AXION/MOND is a blockchain-based product designed to implement a
            citizen UBI system within an established capitalist economy. The
            AXION product is available for online demonstration and will
            shortly be seeking a live pilot site. To view the Axion Inc
            investment proposition,{" "}
            <Link to="/invest" style={{ color: C.ok, textDecoration: "underline" }}>click here</Link>.
          </p>
        </div>

        {/* INTRO VIDEO */}
        <SectionHead tag="V-01" title="Introduction · the AXION pitch" timestamp="2-MIN OVERVIEW" />
        <div style={S.videoWrap}>
          {/* TODO: drop in YouTube embed once script is recorded */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, color: C.faint, marginBottom: 8 }}>▶</div>
            <div style={{ fontSize: 12, color: C.dim, letterSpacing: "0.06em" }}>Intro video — pending</div>
          </div>
        </div>
        <div style={S.videoMeta}>
          Two-minute overview of the colony economy — citizens, companies, the Fisc, S/V tokens.
        </div>

        {/* TRY AXION — live entry points */}
        <SectionHead tag="A-00" title="Try Axion · live demo" timestamp="ONLINE NOW" />
        <div style={S.webAppCta}>
          <Button variant="primary" href="https://app.axion-labs.xyz" style={S.webAppLink}>
            Open the Web App →
          </Button>
        </div>
        <div style={S.dispatches}>
          <a href="https://stores.axion-labs.xyz/mall" target="_blank" rel="noreferrer" style={S.dispatch}>
            <CornerFrame />
            <span style={S.dTag}>The Mall</span>
            <h3 style={S.dTtl}>Shop the colony</h3>
            <p style={S.dBody}>
              Browse the county's stores and pay in MOND with the Mond card — the
              shopper's side of the economy.
            </p>
            <div style={S.dSep}>Open the Mall →</div>
          </a>
          <a href="https://central.axion-labs.xyz" target="_blank" rel="noreferrer" style={S.dispatch}>
            <CornerFrame />
            <span style={S.dTag}>Axion Central</span>
            <h3 style={S.dTtl}>The clearing house</h3>
            <p style={S.dBody}>
              Where every colony's Market Access Charge nets out across vendors —
              the cross-colony processing hub.
            </p>
            <div style={S.dSep}>Open Axion Central →</div>
          </a>
          <Link to="/ios-access" style={S.dispatch}>
            <CornerFrame />
            <span style={S.dTag}>iOS App · Closed Beta</span>
            <h3 style={S.dTtl}>Mond Pay for iPhone</h3>
            <p style={S.dBody}>
              Tap-to-pay with NFC and Face ID — request access to the native
              wallet beta (Android to follow).
            </p>
            <div style={S.dSep}>Request access →</div>
          </Link>
        </div>

        {/* DISPATCHES */}
        <SectionHead tag="T-01" title="Dispatches · Three Acts" timestamp="3 ENTRIES" />
        <div style={S.dispatches}>
          <Link to="/collision" style={S.dispatch}>
            <CornerFrame />
            <span style={S.dTag}>Act I · The Collision</span>
            <h3 style={S.dTtl}>Why fiat breaks first.</h3>
            <p style={S.dBody}>
              The macro thesis. AI deflation collides with sovereign debt
              monetisation. Reinhart-Rogoff territory crossed. Capital flight to
              crypto. The precursor.
            </p>
            <div style={S.dSep}>Read the thesis →</div>
          </Link>
          <a href="/forecasts" style={S.dispatch}>
            <CornerFrame />
            <span style={S.dTag}>Act II · The Model</span>
            <h3 style={S.dTtl}>Pricing market participation. A basic income that funds itself.</h3>
            <p style={S.dBody}>
              The economic model behind Axion — the Market Access Charge, the
              Fisc, and the Time Dividend that automation actually pays out.
            </p>
            <div style={S.dSep}>Open the models →</div>
          </a>
          <a href="/fisc" style={S.dispatch}>
            <CornerFrame />
            <span style={S.dTag}>Act III · The Area</span>
            <h3 style={S.dTtl}>Bringing the model home.</h3>
            <p style={S.dBody}>
              How a real place runs it — a county-scale treasury collecting the
              charge and paying a basic income, in dollar-pegged Mond.
            </p>
            <div style={S.dSep}>See the Fisc →</div>
          </a>
        </div>

        {/* TELEMETRY */}
        <SectionHead tag="T-02" title="Field Telemetry · Live" timestamp="BASE SEPOLIA · 84532" />
        <div>
          <TelemetryGrid
            columns={4}
            cells={[
              { label: "Active Colonies",   value: String(colonies.length), delta: "on-chain registry" },
              { label: "Citizens Enrolled", value: String(totalCitizens),   delta: "across all colonies" },
              { label: "Mars Colonies",     value: String(marsCount),       delta: "simulation only" },
              { label: "Earth Colonies",    value: String(earthCount),      delta: "live on testnet" },
            ]}
          />
        </div>
        <div style={S.handoff}>
          <Button variant="primary" href={COLONY_APP_HOST}>Browse all colonies →</Button>
        </div>

        <div style={{ height: 56 }} />
      </div>
    </div>
  );
}
