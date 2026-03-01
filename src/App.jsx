import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// ── Contract Config ───────────────────────────────────────────────
const CONTRACTS = {
  WBTC:  "0x9639915dB85ee83f3C1ed88AaC3BCb2E2104B70b",
  IRON:  "0x5C06fB67f24e06A7234a777F9220e083d2684976",
  VAULT: "0x0fCf6F860927c6cd94e974E7B9BfAb440E2b1FeE",
};

const VAULT_ABI = [
  "function getPortfolioSnapshot() view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  "function deposit(uint256 wbtcAmount) external",
  "function redeem(uint256 ironAmount) external",
  "function navPerIron() view returns (uint256)",
];
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) external returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function faucetOne() external",
];

// ── Helpers ───────────────────────────────────────────────────────
const fmt8 = (v, decimals = 2) =>
  v ? (Number(v) / 1e8).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "—";
const fmt18 = (v, decimals = 2) =>
  v ? (Number(ethers.formatUnits(v, 18))).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "—";
const short = (addr) => addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : "";

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [wbtcBalance, setWbtcBalance] = useState(null);
  const [ironBalance, setIronBalance] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [txStatus, setTxStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");
  const [tick, setTick] = useState(0);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Load snapshot
  const loadData = useCallback(async (prov, addr) => {
    try {
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, prov);
      const wbtc  = new ethers.Contract(CONTRACTS.WBTC,  ERC20_ABI, prov);
      const iron  = new ethers.Contract(CONTRACTS.IRON,  ERC20_ABI, prov);
      const snap  = await vault.getPortfolioSnapshot();
      setSnapshot(snap);
      if (addr) {
        setWbtcBalance(await wbtc.balanceOf(addr));
        setIronBalance(await iron.balanceOf(addr));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Connect wallet
  const connect = async () => {
    if (!window.ethereum) { alert("MetaMask not found. Please install it."); return; }
    const prov = new ethers.BrowserProvider(window.ethereum);
    await prov.send("eth_requestAccounts", []);
    const s = await prov.getSigner();
    const addr = await s.getAddress();
    setProvider(prov); setSigner(s); setWallet(addr);
    await loadData(prov, addr);
  };

// Load public data on mount even without wallet
  useEffect(() => {
    const readProvider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    loadData(readProvider, null);
  }, [loadData]);

  // Reload on tick
  useEffect(() => {
    if (provider) loadData(provider, wallet);
    else {
      const readProvider = new ethers.JsonRpcProvider("https://sepolia.base.org");
      loadData(readProvider, null);
    }
  }, [tick, provider, wallet, loadData]);

  // Faucet
  const getFaucet = async () => {
    try {
      setTxStatus({ type: "pending", msg: "Minting 1 testnet WBTC…" });
      const wbtc = new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, signer);
      const tx = await wbtc.faucetOne();
      await tx.wait();
      setTxStatus({ type: "success", msg: "1 WBTC minted to your wallet." });
      await loadData(provider, wallet);
    } catch (e) { setTxStatus({ type: "error", msg: e.reason || e.message }); }
  };

  // Deposit
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount)) return;
    try {
      setLoading(true);
      const satoshis = BigInt(Math.round(parseFloat(depositAmount) * 1e8));
      setTxStatus({ type: "pending", msg: "Approving WBTC…" });
      const wbtc  = new ethers.Contract(CONTRACTS.WBTC,  ERC20_ABI, signer);
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, signer);
      const allowance = await wbtc.allowance(wallet, CONTRACTS.VAULT);
      if (allowance < satoshis) {
        const approveTx = await wbtc.approve(CONTRACTS.VAULT, satoshis);
        await approveTx.wait();
      }
      setTxStatus({ type: "pending", msg: "Depositing WBTC…" });
      const tx = await vault.deposit(satoshis);
      await tx.wait();
      setTxStatus({ type: "success", msg: `Deposited ${depositAmount} WBTC. IRON tokens minted.` });
      setDepositAmount("");
      await loadData(provider, wallet);
    } catch (e) { setTxStatus({ type: "error", msg: e.reason || e.message }); }
    finally { setLoading(false); }
  };

  // Redeem
  const handleRedeem = async () => {
    if (!redeemAmount || isNaN(redeemAmount)) return;
    try {
      setLoading(true);
      const ironAmt = ethers.parseUnits(redeemAmount, 18);
      setTxStatus({ type: "pending", msg: "Redeeming IRON…" });
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, signer);
      const tx = await vault.redeem(ironAmt);
      await tx.wait();
      setTxStatus({ type: "success", msg: `Redeemed ${redeemAmount} IRON for WBTC.` });
      setRedeemAmount("");
      await loadData(provider, wallet);
    } catch (e) { setTxStatus({ type: "error", msg: e.reason || e.message }); }
    finally { setLoading(false); }
  };

  // Derived values
  const snap = snapshot;
  const totalUSD    = snap ? Number(snap[0]) / 1e8 : null;
  const nav         = snap ? Number(snap[2]) / 1e8 : null;
  const ironSupply  = snap ? Number(ethers.formatUnits(snap[3], 18)) : null;
  const wbtcInVault = snap ? Number(snap[4]) / 1e8 : null;
  const btcPrice    = snap ? Number(snap[5]) / 1e8 : null;
  const goldUSD     = snap ? Number(snap[6]) / 1e8 : null;
  const bondUSD     = snap ? Number(snap[7]) / 1e8 : null;
  const aiUSD       = snap ? Number(snap[8]) / 1e8 : null;
  const wbtcUSD     = snap ? Number(snap[9]) / 1e8 : null;
  const depositors  = snap ? Number(snap[10]) : null;

  const alloc = totalUSD ? [
    { label: "Bitcoin",       value: wbtcUSD,  pct: (wbtcUSD / totalUSD) * 100,  color: "#F7931A" },
    { label: "Gold",          value: goldUSD,  pct: (goldUSD / totalUSD) * 100,  color: "#C9A84C" },
    { label: "Bond Shorts",   value: bondUSD,  pct: (bondUSD / totalUSD) * 100,  color: "#4A9B8F" },
    { label: "AI Infra",      value: aiUSD,    pct: (aiUSD   / totalUSD) * 100,  color: "#7B6FE8" },
  ] : [];

  return (
    <div style={styles.root}>
      {/* Grain overlay */}
      <div style={styles.grain} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>⬡</span>
            <span style={styles.logoText}>SPICE</span>
            <span style={styles.logoSub}>ZPC</span>
          </div>
          <div style={styles.tagline}>Crisis Hedge Protocol · Base Sepolia Testnet</div>
        </div>
        <div style={styles.headerRight}>
          {wallet ? (
            <div style={styles.walletPill}>
              <span style={styles.walletDot} />
              {short(wallet)}
            </div>
          ) : (
            <button style={styles.connectBtn} onClick={connect}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Hero NAV Strip */}
      <section style={styles.heroStrip}>
        <div style={styles.heroItem}>
          <div style={styles.heroLabel}>NAV per IRON</div>
          <div style={styles.heroValue}>${nav ? nav.toFixed(2) : "—"}</div>
        </div>
        <div style={styles.heroDivider} />
        <div style={styles.heroItem}>
          <div style={styles.heroLabel}>Total Portfolio Value</div>
          <div style={styles.heroValue}>${totalUSD ? totalUSD.toLocaleString("en-US", {maximumFractionDigits: 0}) : "—"}</div>
        </div>
        <div style={styles.heroDivider} />
        <div style={styles.heroItem}>
          <div style={styles.heroLabel}>BTC Price</div>
          <div style={styles.heroValue}>${btcPrice ? btcPrice.toLocaleString("en-US", {maximumFractionDigits: 0}) : "—"}</div>
        </div>
        <div style={styles.heroDivider} />
        <div style={styles.heroItem}>
          <div style={styles.heroLabel}>IRON Supply</div>
          <div style={styles.heroValue}>{ironSupply ? ironSupply.toLocaleString("en-US", {maximumFractionDigits: 0}) : "—"}</div>
        </div>
        <div style={styles.heroDivider} />
        <div style={styles.heroItem}>
          <div style={styles.heroLabel}>Depositors</div>
          <div style={styles.heroValue}>{depositors ?? "—"}</div>
        </div>
      </section>

      <main style={styles.main}>
        {/* Left column: Portfolio */}
        <div style={styles.leftCol}>

          {/* Portfolio Breakdown */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Portfolio Allocation</span>
              <span style={styles.cardBadge}>PHASE 1 · DEFENSE</span>
            </div>

            {alloc.map((a) => (
              <div key={a.label} style={styles.allocRow}>
                <div style={styles.allocLeft}>
                  <div style={{...styles.allocDot, background: a.color}} />
                  <span style={styles.allocLabel}>{a.label}</span>
                </div>
                <div style={styles.allocRight}>
                  <span style={styles.allocPct}>{a.pct.toFixed(1)}%</span>
                  <span style={styles.allocVal}>${a.value ? a.value.toLocaleString("en-US", {maximumFractionDigits: 0}) : "—"}</span>
                </div>
                <div style={styles.allocBarBg}>
                  <div style={{...styles.allocBarFill, width: `${a.pct}%`, background: a.color}} />
                </div>
              </div>
            ))}

            <div style={styles.cardDivider} />

            <div style={styles.thesisBox}>
              <div style={styles.thesisTitle}>Investment Thesis</div>
              <div style={styles.thesisText}>
                SPICE is designed to hedge The Collision — the simultaneous occurrence of 
                AI-driven deflation and government-led inflation as sovereigns attempt to 
                resolve unsustainable debt. Conventional hedges fail precisely when needed 
                most. This protocol holds direct on-chain exposure to assets that survive 
                fiat credibility collapse.
              </div>
              <div style={styles.thesisTags}>
                <span style={styles.tag}>Bitcoin</span>
                <span style={styles.tag}>Physical Gold</span>
                <span style={styles.tag}>Bond Shorts</span>
                <span style={styles.tag}>AI Infrastructure</span>
              </div>
            </div>
          </div>

          {/* Collision Watch */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Collision Watch</span>
              <span style={{...styles.cardBadge, color: "#4A9B8F", borderColor: "#4A9B8F33", background: "#4A9B8F11"}}>MONITORING</span>
            </div>
            <div style={styles.collisionGrid}>
              {[
                { label: "Sovereign Stress",    status: "monitoring", desc: "G7 bond markets" },
                { label: "Monetary Debasement", status: "monitoring", desc: "M2 growth / CB balance sheets" },
                { label: "Hard Asset Surge",    status: "monitoring", desc: "Gold threshold" },
                { label: "Phase 2 Trigger",     status: "inactive",  desc: "All conditions unmet" },
              ].map((c) => (
                <div key={c.label} style={styles.collisionRow}>
                  <div style={{
                    ...styles.statusDot,
                    background: c.status === "monitoring" ? "#C9A84C" : "#333",
                    boxShadow: c.status === "monitoring" ? "0 0 8px #C9A84C66" : "none"
                  }} />
                  <div>
                    <div style={styles.collisionLabel}>{c.label}</div>
                    <div style={styles.collisionDesc}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.phaseNote}>
              Phase 2 macro indicator dashboard coming soon. Oracle integration pending.
            </div>
          </div>
        </div>

        {/* Right column: Invest */}
        <div style={styles.rightCol}>

          {/* Wallet Balances */}
          {wallet && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Your Balances</span>
                <button style={styles.faucetBtn} onClick={getFaucet}>
                  Get 1 WBTC
                </button>
              </div>
              <div style={styles.balanceGrid}>
                <div style={styles.balanceItem}>
                  <div style={styles.balanceLabel}>WBTC</div>
                  <div style={styles.balanceValue}>
                    {wbtcBalance !== null ? (Number(wbtcBalance) / 1e8).toFixed(4) : "—"}
                  </div>
                </div>
                <div style={styles.balanceItem}>
                  <div style={styles.balanceLabel}>IRON</div>
                  <div style={styles.balanceValue}>
                    {ironBalance !== null ? Number(ethers.formatUnits(ironBalance, 18)).toLocaleString("en-US", {maximumFractionDigits: 2}) : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deposit / Redeem */}
          <div style={styles.card}>
            <div style={styles.tabRow}>
              <button
                style={{...styles.tab, ...(activeTab === "deposit" ? styles.tabActive : {})}}
                onClick={() => setActiveTab("deposit")}
              >Deposit</button>
              <button
                style={{...styles.tab, ...(activeTab === "redeem" ? styles.tabActive : {})}}
                onClick={() => setActiveTab("redeem")}
              >Redeem</button>
            </div>

            {activeTab === "deposit" ? (
              <div style={styles.formBody}>
                <div style={styles.formLabel}>Amount (WBTC)</div>
                <div style={styles.inputRow}>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="0.01"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                  />
                  <span style={styles.inputUnit}>WBTC</span>
                </div>
                {depositAmount && btcPrice && (
                  <div style={styles.estimate}>
                    ≈ ${(parseFloat(depositAmount) * btcPrice).toLocaleString("en-US", {maximumFractionDigits: 0})} USD
                    {nav && ` · ≈ ${((parseFloat(depositAmount) * btcPrice) / nav).toLocaleString("en-US", {maximumFractionDigits: 2})} IRON`}
                  </div>
                )}
                <button
                  style={{...styles.actionBtn, opacity: (!wallet || loading) ? 0.5 : 1}}
                  onClick={wallet ? handleDeposit : connect}
                  disabled={loading}
                >
                  {!wallet ? "Connect to Deposit" : loading ? "Processing…" : "Deposit WBTC"}
                </button>
                <div style={styles.minNote}>Minimum deposit: 0.001 WBTC</div>
              </div>
            ) : (
              <div style={styles.formBody}>
                <div style={styles.formLabel}>Amount (IRON)</div>
                <div style={styles.inputRow}>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="100"
                    value={redeemAmount}
                    onChange={e => setRedeemAmount(e.target.value)}
                  />
                  <span style={styles.inputUnit}>IRON</span>
                </div>
                {redeemAmount && nav && (
                  <div style={styles.estimate}>
                    ≈ ${(parseFloat(redeemAmount) * nav).toLocaleString("en-US", {maximumFractionDigits: 2})} USD
                  </div>
                )}
                <button
                  style={{...styles.actionBtn, opacity: (!wallet || loading) ? 0.5 : 1}}
                  onClick={wallet ? handleRedeem : connect}
                  disabled={loading}
                >
                  {!wallet ? "Connect to Redeem" : loading ? "Processing…" : "Redeem IRON"}
                </button>
                <div style={styles.minNote}>IRON tokens are burned on redemption</div>
              </div>
            )}
          </div>

          {/* Tx Status */}
          {txStatus && (
            <div style={{
              ...styles.txCard,
              borderColor: txStatus.type === "success" ? "#4A9B8F44" :
                           txStatus.type === "error"   ? "#E5534B44" : "#C9A84C44",
              background:  txStatus.type === "success" ? "#4A9B8F11" :
                           txStatus.type === "error"   ? "#E5534B11" : "#C9A84C11",
            }}>
              <span style={{
                color: txStatus.type === "success" ? "#4A9B8F" :
                       txStatus.type === "error"   ? "#E5534B" : "#C9A84C"
              }}>
                {txStatus.type === "success" ? "✓ " : txStatus.type === "error" ? "✕ " : "⟳ "}
              </span>
              {txStatus.msg}
              <button style={styles.dismissBtn} onClick={() => setTxStatus(null)}>×</button>
            </div>
          )}

          {/* Contract Addresses */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Contract Addresses</span>
              <span style={{...styles.cardBadge, color: "#C9A84C", borderColor: "#C9A84C33", background: "#C9A84C11"}}>BASE SEPOLIA</span>
            </div>
            {[
              { label: "SPICEVault", addr: CONTRACTS.VAULT },
              { label: "IRON Token", addr: CONTRACTS.IRON  },
              { label: "Mock WBTC",  addr: CONTRACTS.WBTC  },
            ].map(c => (
              <div key={c.label} style={styles.addrRow}>
                <span style={styles.addrLabel}>{c.label}</span>
                <a
                  style={styles.addrLink}
                  href={`https://sepolia.basescan.org/address/${c.addr}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {short(c.addr)} ↗
                </a>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={styles.disclaimer}>
            This is a testnet prototype. No real assets are involved. 
            Not a financial promotion or offer to invest.
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <span>SPICE [ZPC] Protocol · Phase 1 Prototype · Base Sepolia</span>
        <span>Updates every 30s · {new Date().toLocaleTimeString()}</span>
      </footer>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0A0A0B",
    color: "#E8E4DC",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    position: "relative",
    overflow: "hidden",
  },
  grain: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
    opacity: 0.4,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 32px", borderBottom: "1px solid #1E1E22",
    position: "relative", zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 20 },
  logo: { display: "flex", alignItems: "baseline", gap: 8 },
  logoMark: { fontSize: 22, color: "#C9A84C" },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: "0.15em", color: "#E8E4DC" },
  logoSub: {
    fontSize: 11, color: "#C9A84C", border: "1px solid #C9A84C55",
    padding: "1px 6px", letterSpacing: "0.1em",
  },
  tagline: { fontSize: 11, color: "#555", letterSpacing: "0.05em" },
  headerRight: {},
  walletPill: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 14px", border: "1px solid #2A2A2E",
    fontSize: 12, color: "#888", background: "#111",
  },
  walletDot: { width: 6, height: 6, borderRadius: "50%", background: "#4A9B8F" },
  connectBtn: {
    padding: "8px 20px", background: "#C9A84C", border: "none",
    color: "#0A0A0B", fontSize: 12, fontFamily: "inherit",
    fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer",
  },
  heroStrip: {
    display: "flex", alignItems: "center",
    borderBottom: "1px solid #1E1E22",
    background: "#0D0D0F",
    position: "relative", zIndex: 10,
    overflowX: "auto",
  },
  heroItem: { padding: "18px 32px", flexShrink: 0 },
  heroLabel: { fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 },
  heroValue: { fontSize: 22, fontWeight: 700, color: "#E8E4DC", letterSpacing: "0.02em" },
  heroDivider: { width: 1, height: 40, background: "#1E1E22", flexShrink: 0 },
  main: {
    display: "flex", gap: 24, padding: "28px 32px",
    position: "relative", zIndex: 10,
    maxWidth: 1200, margin: "0 auto",
    flexWrap: "wrap",
  },
  leftCol: { flex: "1 1 520px", display: "flex", flexDirection: "column", gap: 20 },
  rightCol: { flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 20 },
  card: {
    background: "#0D0D0F", border: "1px solid #1E1E22",
    padding: 24,
  },
  cardHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20,
  },
  cardTitle: { fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#E8E4DC" },
  cardBadge: {
    fontSize: 10, letterSpacing: "0.12em",
    padding: "3px 8px", border: "1px solid #2A2A2E",
    color: "#555", background: "#111",
  },
  cardDivider: { height: 1, background: "#1E1E22", margin: "20px 0" },
  allocRow: { marginBottom: 16 },
  allocLeft: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  allocDot: { width: 8, height: 8, borderRadius: "50%" },
  allocLabel: { fontSize: 12, color: "#AAA", letterSpacing: "0.05em" },
  allocRight: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  allocPct: { fontSize: 13, fontWeight: 700, color: "#E8E4DC" },
  allocVal: { fontSize: 12, color: "#555" },
  allocBarBg: { height: 3, background: "#1A1A1E", width: "100%" },
  allocBarFill: { height: 3, transition: "width 0.8s ease" },
  thesisBox: { background: "#111", padding: 16, border: "1px solid #1A1A1E" },
  thesisTitle: { fontSize: 10, color: "#C9A84C", letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" },
  thesisText: { fontSize: 12, color: "#666", lineHeight: 1.7, marginBottom: 14 },
  thesisTags: { display: "flex", gap: 8, flexWrap: "wrap" },
  tag: {
    fontSize: 10, padding: "3px 8px", border: "1px solid #2A2A2E",
    color: "#555", letterSpacing: "0.08em",
  },
  collisionGrid: { display: "flex", flexDirection: "column", gap: 14 },
  collisionRow: { display: "flex", alignItems: "flex-start", gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0 },
  collisionLabel: { fontSize: 12, color: "#AAA", marginBottom: 2 },
  collisionDesc: { fontSize: 11, color: "#444" },
  phaseNote: {
    marginTop: 16, fontSize: 11, color: "#333",
    borderTop: "1px solid #1A1A1E", paddingTop: 14,
  },
  balanceGrid: { display: "flex", gap: 16 },
  balanceItem: {
    flex: 1, background: "#111", padding: "12px 16px",
    border: "1px solid #1A1A1E",
  },
  balanceLabel: { fontSize: 10, color: "#555", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" },
  balanceValue: { fontSize: 18, fontWeight: 700, color: "#E8E4DC" },
  faucetBtn: {
    fontSize: 10, padding: "4px 10px",
    background: "transparent", border: "1px solid #2A2A2E",
    color: "#555", fontFamily: "inherit", cursor: "pointer",
    letterSpacing: "0.08em",
  },
  tabRow: { display: "flex", marginBottom: 20, borderBottom: "1px solid #1E1E22" },
  tab: {
    flex: 1, padding: "10px", background: "transparent",
    border: "none", borderBottom: "2px solid transparent",
    color: "#444", fontFamily: "inherit", fontSize: 12,
    letterSpacing: "0.1em", cursor: "pointer",
    marginBottom: -1, textTransform: "uppercase",
  },
  tabActive: { color: "#C9A84C", borderBottomColor: "#C9A84C" },
  formBody: { display: "flex", flexDirection: "column", gap: 12 },
  formLabel: { fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" },
  inputRow: {
    display: "flex", alignItems: "center",
    border: "1px solid #2A2A2E", background: "#111",
  },
  input: {
    flex: 1, background: "transparent", border: "none",
    color: "#E8E4DC", fontFamily: "inherit", fontSize: 16,
    padding: "12px 14px", outline: "none",
  },
  inputUnit: { padding: "0 14px", color: "#444", fontSize: 11, letterSpacing: "0.1em" },
  estimate: { fontSize: 11, color: "#555", letterSpacing: "0.03em" },
  actionBtn: {
    padding: "14px", background: "#C9A84C", border: "none",
    color: "#0A0A0B", fontFamily: "inherit", fontSize: 12,
    fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer",
    textTransform: "uppercase", transition: "opacity 0.2s",
  },
  minNote: { fontSize: 10, color: "#333", letterSpacing: "0.05em" },
  txCard: {
    padding: "14px 16px", border: "1px solid",
    fontSize: 12, display: "flex", alignItems: "flex-start",
    gap: 8, lineHeight: 1.5, position: "relative",
  },
  dismissBtn: {
    marginLeft: "auto", background: "transparent", border: "none",
    color: "#555", cursor: "pointer", fontSize: 16, lineHeight: 1,
    fontFamily: "inherit",
  },
  addrRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid #141416",
  },
  addrLabel: { fontSize: 11, color: "#555" },
  addrLink: { fontSize: 11, color: "#C9A84C", textDecoration: "none", letterSpacing: "0.05em" },
  disclaimer: {
    fontSize: 10, color: "#2A2A2E", lineHeight: 1.6,
    letterSpacing: "0.03em", textAlign: "center",
  },
  footer: {
    display: "flex", justifyContent: "space-between",
    padding: "16px 32px", borderTop: "1px solid #1E1E22",
    fontSize: 10, color: "#2A2A2E", letterSpacing: "0.05em",
    position: "relative", zIndex: 10,
  },
};
