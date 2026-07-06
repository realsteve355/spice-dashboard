import { C, F } from "../tokens";

// The Technology page — a proof-of-concept showcase. Axion is built on real
// technologies end to end so the PoC behaves like the production system. Each
// item below is wired and working on testnet + live services, not mocked.

const STACK = [
  { k: "Ethereum L2 — Base", s: "real", d: "All money is on-chain on Base (Sepolia testnet, chain 84532). Balances, UBI and revenue are contract state, not database numbers." },
  { k: "Solidity smart contracts", s: "real", d: "MOND currency, the Fisc (autonomous UBI + market-access charge), soulbound identity, and a multi-colony registry. Hardhat + OpenZeppelin, 26 unit tests." },
  { k: "USD stablecoin (MOND)", s: "real", d: "An ERC-20 pegged 1:1 to the dollar, minted as UBI and spent like cash. Designed to be USDC-backed / T-bill-backed for production." },
  { k: "Self-custody wallet", s: "real", d: "Citizens hold their own MOND in MetaMask and sign their own payments. No custodian." },
  { k: "Soulbound identity", s: "real", d: "Each citizen holds one non-transferable ERC-721 “G-token” — on-chain identity that can't be bought, sold or moved." },
  { k: "Autonomous fiscal engine", s: "real", d: "The Fisc mints UBI on time-based epochs (a day, week or month), meters the market-access charge, and settles the fee split on-chain." },
  { k: "Stripe invoicing + card/ACH", s: "real", d: "Each store is a Stripe customer; its market-access charge is a real hosted USD invoice, paid by card/ACH, confirmed by webhook." },
  { k: "Serverless backend", s: "real", d: "Vercel functions hold the operator key and perform privileged on-chain writes (UBI, registration, MAC settlement)." },
  { k: "Postgres (Supabase)", s: "real", d: "The metering ledger — per-store sales and invoices — with the chain remaining the source of truth for money." },
  { k: "On-chain event indexing", s: "real", d: "The operator console's revenue ledger is derived live from on-chain settlement events (no separate indexer)." },
  { k: "React SPA + CI/CD", s: "real", d: "React 19 / Vite front end, git-connected auto-deploy to Vercel, custom domains for the app and the operator console." },
  { k: "Card-at-till (MetaMask Card)", s: "sim", d: "The citizen→store leg models a MetaMask Card in Apple Pay converting MOND→USD at the till. Simulated where custom-token card issuing doesn't exist yet." },
];

const LAYERS = [
  { t: "Chain", b: "MOND · Reserve · ColonyRegistry (global) and a Fisc + CitizenRegistry per colony, on Base." },
  { t: "Rails", b: "MetaMask for citizen payments (MOND), Stripe for the store's USD market-access invoice." },
  { t: "Services", b: "Vercel serverless functions (operator writes) + Supabase (sales/invoice metering)." },
  { t: "Surfaces", b: "A citizen web app, an operator console, and a mobile viewer — each reading the same chain." },
];

const LOOP = [
  "The Fisc mints UBI in MOND to a citizen.",
  "The citizen buys at a store, paying MOND from MetaMask.",
  "The sale is metered per store.",
  "The operator runs billing — a real Stripe invoice is raised for each store's market-access charge.",
  "The store pays the invoice in USD.",
  "Payment is confirmed and settled on-chain: a small fee is skimmed to the protocol treasury and the colony's founder, and the rest funds the next round of UBI.",
];

const dot = (s) => ({
  display: "inline-block", width: 7, height: 7, borderRadius: 0, marginRight: 8,
  background: s === "real" ? C.ok : C.warn,
});

const S = {
  page:  { background: C.bg, color: C.txt, fontFamily: F.mono, minHeight: "calc(100vh - 57px)" },
  inner: { maxWidth: 1080, margin: "0 auto", padding: "48px 36px 80px" },
  hero:  { paddingBottom: 40, borderBottom: `1px solid ${C.lineHot}`, marginBottom: 44 },
  tag:   { fontSize: 10, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 14 },
  h1:    { fontSize: "clamp(28px, 3.6vw, 46px)", fontWeight: 700, color: C.headline, letterSpacing: "-0.01em", lineHeight: 1.1, margin: "0 0 22px" },
  lead:  { fontSize: 14, color: C.txt2, lineHeight: 1.7, maxWidth: 760 },
  secTag:{ fontSize: 10, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 20px" },
  grid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 56 },
  tile:  { background: C.panel, border: `1px solid ${C.line}`, padding: 18 },
  tileH: { fontSize: 13.5, fontWeight: 600, color: C.txt, margin: "0 0 8px", display: "flex", alignItems: "center" },
  tileB: { fontSize: 12, color: C.txt2, lineHeight: 1.65, margin: 0 },
  layers:{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 56 },
  layer: { background: C.panel, border: `1px solid ${C.line}`, padding: 18 },
  layerT:{ fontSize: 11, color: C.ok, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" },
  layerB:{ fontSize: 12, color: C.txt2, lineHeight: 1.6, margin: 0 },
  loop:  { counterReset: "step", listStyle: "none", padding: 0, margin: "0 0 56px", maxWidth: 820 },
  step:  { display: "flex", gap: 14, padding: "12px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13, color: C.txt2, lineHeight: 1.6 },
  num:   { color: C.ok, fontWeight: 700, minWidth: 22 },
  legend:{ fontSize: 11, color: C.faint, marginTop: -40, marginBottom: 56, display: "flex", gap: 22, flexWrap: "wrap" },
  foot:  { fontSize: 12, color: C.dim, lineHeight: 1.7, borderTop: `1px solid ${C.line}`, paddingTop: 24 },
};

export default function Technology() {
  return (
    <div style={S.page}>
      <div style={S.inner}>

        <div style={S.hero}>
          <div style={S.tag}>Proof of concept</div>
          <h1 style={S.h1}>Technology</h1>
          <p style={S.lead}>
            Axion is not a mock-up. It is a working proof of concept built on real
            technologies end to end — a live stablecoin, a self-custody wallet, an
            autonomous on-chain fiscal engine, and real invoicing and card rails — so it
            behaves like the production system. The goal of the PoC is to prove as many
            of the load-bearing technologies as possible, together, in one working loop.
          </p>
        </div>

        <div style={S.secTag}>The stack — proven in the PoC</div>
        <div style={S.grid}>
          {STACK.map((x) => (
            <div key={x.k} style={S.tile}>
              <div style={S.tileH}><span style={dot(x.s)} />{x.k}</div>
              <p style={S.tileB}>{x.d}</p>
            </div>
          ))}
        </div>
        <div style={S.legend}>
          <span><span style={dot("real")} />Live / on-chain / real service</span>
          <span><span style={dot("sim")} />Simulated (production path noted)</span>
        </div>

        <div style={S.secTag}>How it fits together</div>
        <div style={S.layers}>
          {LAYERS.map((l) => (
            <div key={l.t} style={S.layer}>
              <div style={S.layerT}>{l.t}</div>
              <p style={S.layerB}>{l.b}</p>
            </div>
          ))}
        </div>

        <div style={S.secTag}>The economic loop, on real rails</div>
        <ol style={S.loop}>
          {LOOP.map((step, i) => (
            <li key={i} style={{ ...S.step, ...(i === LOOP.length - 1 ? { borderBottom: "none" } : {}) }}>
              <span style={S.num}>{i + 1}</span><span>{step}</span>
            </li>
          ))}
        </ol>

        <div style={S.foot}>
          One shared dollar stablecoin, many independent colonies, each with its own
          fiscal engine. Every element above is wired to the same chain. A full technical
          architecture is maintained alongside the source code.
        </div>

      </div>
    </div>
  );
}
