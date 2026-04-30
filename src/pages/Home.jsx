import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { C, F } from "../tokens";
import { SPICE_PARAMS, LEVEL_LABELS } from "../data/spice-params";
import { COLONIES, BASE_SEPOLIA_RPC, COLONY_APP_HOST } from "../data/colonies";
import StatusPill  from "../components/spice/StatusPill";
import SectionHead from "../components/spice/SectionHead";
import Button      from "../components/spice/Button";
import TickerTape  from "../components/spice/TickerTape";

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

const SAMPLE_TICKER = [
  { k: "BTC",       v: "$112,400", d: "+1.40%",  dir: "up" },
  { k: "PAXG",      v: "$3,840",   d: "+0.62%",  dir: "up" },
  { k: "DXY",       v: "99.21",    d: "−0.30%",  dir: "down" },
  { k: "10Y",       v: "4.10%",    d: "±0.00",   dir: "flat" },
  { k: "CPI",       v: "3.40%",    d: "+0.10pp", dir: "down" },
  { k: "Debt/GDP",  v: "123%",     d: "+1.4yr",  dir: "down" },
  { k: "SPICE Lvl", v: "7.20",     d: "+0.12",   dir: "up" },
];

const S = {
  page:  { background: C.bg, color: C.txt, fontFamily: F.mono, minHeight: "calc(100vh - 57px)" },
  inner: { maxWidth: 1280, margin: "0 auto", padding: "0 36px" },
  hero:  { padding: "48px 0 56px", borderBottom: `1px solid ${C.line}`, marginBottom: 48 },
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

  videoWrap: {
    background: C.panel, border: `1px solid ${C.line}`,
    aspectRatio: "16 / 9", maxWidth: 960,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: C.dim, marginBottom: 14,
  },
  videoMeta: { fontSize: 11.5, color: C.faint, letterSpacing: "0.06em", marginBottom: 56 },

  telemetry: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    border: `1px solid ${C.line}`,
    background: C.panel, marginBottom: 56,
  },
  telCell: { padding: "20px 22px", borderRight: `1px solid ${C.line}` },
  telLab:  { fontSize: 9.5, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8 },
  telVal:  { fontSize: 22, fontWeight: 500, color: C.txt, fontFamily: F.mono },
  telDelta:{ fontSize: 11, color: C.dim, marginTop: 6 },

  dispatches: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24, marginBottom: 56,
  },
  dispatch: {
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

  return (
    <div style={S.page}>
      <TickerTape items={SAMPLE_TICKER} speed={60} />
      <div style={S.inner}>

        {/* HERO */}
        <div style={S.hero}>
          <StatusPill status="ok" label="Pre-launch · research" />
          <h1 style={S.h1}>
            The economic model for{" "}
            <span style={S.h1soft}>after the collision.</span>
          </h1>
          <p style={S.lead}>
            SPICE is a community currency designed for the post-fiat transition.
            Citizens receive a monthly basic income in S-tokens, hold long-term
            wealth in V-tokens, and own dividend-bearing shares in colony
            enterprises. <strong style={{ color: C.txt }}>Capitalist UBI. No tax. No welfare. Every citizen a shareholder.</strong>
          </p>
          <div style={S.ctas}>
            <Button variant="primary" to="/collision">Read the thesis →</Button>
            <Button to="/mars">View Mars colony</Button>
            <Button href={COLONY_APP_HOST}>Enter colony app</Button>
          </div>
        </div>

        {/* INTRO VIDEO */}
        <SectionHead tag="V-01" title="Introduction · the SPICE colony economy" timestamp="2-MIN OVERVIEW" />
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

        {/* TELEMETRY */}
        <SectionHead tag="T-01" title="Field Telemetry · Live" timestamp="BASE SEPOLIA · 84532" />
        <div style={S.telemetry}>
          <div style={S.telCell}>
            <div style={S.telLab}>SPICE Level</div>
            <div style={S.telVal}>{level} / 4</div>
            <div style={S.telDelta}>{levelLabel}</div>
          </div>
          <div style={S.telCell}>
            <div style={S.telLab}>Active Colonies</div>
            <div style={S.telVal}>{colonies.length}</div>
            <div style={S.telDelta}>on-chain registry</div>
          </div>
          <div style={S.telCell}>
            <div style={S.telLab}>Citizens Enrolled</div>
            <div style={S.telVal}>{totalCitizens}</div>
            <div style={S.telDelta}>across all colonies</div>
          </div>
          <div style={{ ...S.telCell, borderRight: 0 }}>
            <div style={S.telLab}>Crisis Window</div>
            <div style={{ ...S.telVal, color: C.crit }}>2029—33</div>
            <div style={S.telDelta}>conf 0.74</div>
          </div>
        </div>

        {/* DISPATCHES */}
        <SectionHead tag="T-02" title="Dispatches · Three Acts" timestamp="3 ENTRIES" />
        <div style={S.dispatches}>
          <Link to="/collision" style={S.dispatch}>
            <span style={S.dTag}>Act I · The Collision</span>
            <h3 style={S.dTtl}>Why fiat breaks first.</h3>
            <p style={S.dBody}>
              The macro thesis. AI deflation collides with sovereign debt
              monetisation. Reinhart-Rogoff territory crossed. Capital flight to
              crypto. The precursor.
            </p>
            <div style={S.dSep}>Read the thesis →</div>
          </Link>
          <Link to="/mars" style={S.dispatch}>
            <span style={S.dTag}>Act II · Mars Colony</span>
            <h3 style={S.dTtl}>Capitalist UBI. Every citizen a shareholder.</h3>
            <p style={S.dBody}>
              A working post-scarcity simulation. Sixty-six citizens, one hundred
              and sixty robots, an automated Fisc — the economic model that
              survives AI displacement.
            </p>
            <div style={S.dSep}>Enter simulation →</div>
          </Link>
          <Link to="/earth" style={S.dispatch}>
            <span style={S.dTag}>Act III · Earth Implementation</span>
            <h3 style={S.dTtl}>Bringing the model home.</h3>
            <p style={S.dBody}>
              How the principles tested on Mars adapt to existing nation-states.
              A blueprint for the post-fiat transition, ground up.
            </p>
            <div style={S.dSep}>Read blueprint →</div>
          </Link>
        </div>

        <div style={{ height: 56 }} />
      </div>
    </div>
  );
}
