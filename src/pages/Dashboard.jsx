import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const CONTRACTS = {
  WBTC:  "0x9639915dB85ee83f3C1ed88AaC3BCb2E2104B70b",
  IRON:  "0x5C06fB67f24e06A7234a777F9220e083d2684976",
  VAULT: "0x0fCf6F860927c6cd94e974E7B9BfAb440E2b1FeE",
};
const BASE_SEPOLIA_CHAIN_ID = 84532;
const VAULT_ABI = [
  "function getPortfolioSnapshot() view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  "function deposit(uint256 wbtcAmount) external",
  "function redeem(uint256 ironAmount) external",
];
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) external returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function faucetOne() external",
];

const fmt8 = (v, dec = 2) => {
  if (!v && v !== 0) return "—";
  return (Number(v) / 1e8).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};
const fmtUSD = (v) => {
  if (!v && v !== 0) return "—";
  const n = Number(v) / 1e8;
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmt18 = (v, dec = 4) => {
  if (!v && v !== 0) return "—";
  return Number(ethers.formatUnits(v, 18)).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};
const shortAddr = (addr) => addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : "";

export default function Dashboard() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner]     = useState(null);
  const [account, setAccount]   = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [userIron, setUserIron] = useState(null);
  const [userWbtc, setUserWbtc] = useState(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [redeemAmt, setRedeemAmt]   = useState("");
  const [txState, setTxState]   = useState("idle");
  const [txMsg, setTxMsg]       = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lookupAddr, setLookupAddr] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getRpc = useCallback(() => new ethers.JsonRpcProvider("https://sepolia.base.org"), []);

  const fetchSnapshot = useCallback(async () => {
    try {
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, getRpc());
      setSnapshot(await vault.getPortfolioSnapshot());
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
  }, [getRpc]);

  const fetchBalances = useCallback(async (addr) => {
    if (!addr) return;
    try {
      const rpc = getRpc();
      const [ib, wb] = await Promise.all([
        new ethers.Contract(CONTRACTS.IRON, ERC20_ABI, rpc).balanceOf(addr),
        new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, rpc).balanceOf(addr),
      ]);
      setUserIron(ib); setUserWbtc(wb);
    } catch (e) { console.error(e); }
  }, [getRpc]);

  useEffect(() => { fetchSnapshot(); const id = setInterval(fetchSnapshot, 30000); return () => clearInterval(id); }, [fetchSnapshot]);
  useEffect(() => { if (account) fetchBalances(account); }, [account, fetchBalances]);

  const connectWallet = async () => {
    if (!window.ethereum) { alert("MetaMask not detected."); return; }
    try {
      const p = new ethers.BrowserProvider(window.ethereum);
      const accounts = await p.send("eth_requestAccounts", []);
      const net = await p.getNetwork();
      if (Number(net.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
        try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x" + BASE_SEPOLIA_CHAIN_ID.toString(16) }] }); } catch {}
      }
      setProvider(p); setSigner(await p.getSigner()); setAccount(accounts[0]);
    } catch (e) { console.error(e); }
  };

  const disconnect = () => { setProvider(null); setSigner(null); setAccount(null); setUserIron(null); setUserWbtc(null); };

  const claimFaucet = async () => {
    if (!signer) return;
    setTxState("pending"); setTxMsg("Claiming 1 testnet WBTC…");
    try {
      const tx = await new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, signer).faucetOne();
      await tx.wait();
      setTxState("success"); setTxMsg("1 testnet WBTC claimed!");
      fetchBalances(account);
    } catch (e) { setTxState("error"); setTxMsg(e.reason || e.message || "Failed"); }
    setTimeout(() => setTxState("idle"), 4000);
  };

  const doDeposit = async () => {
    if (!signer || !depositAmt) return;
    setTxState("pending"); setTxMsg("Approving WBTC…");
    try {
      const amt = BigInt(Math.round(parseFloat(depositAmt) * 1e8));
      const wbtc = new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, signer);
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, signer);
      if (await wbtc.allowance(account, CONTRACTS.VAULT) < amt) {
        await (await wbtc.approve(CONTRACTS.VAULT, amt)).wait();
      }
      setTxMsg("Depositing…");
      await (await vault.deposit(amt)).wait();
      setTxState("success"); setTxMsg("Deposit successful!"); setDepositAmt("");
      fetchSnapshot(); fetchBalances(account);
    } catch (e) { setTxState("error"); setTxMsg(e.reason || e.message || "Failed"); }
    setTimeout(() => setTxState("idle"), 5000);
  };

  const doRedeem = async () => {
    if (!signer || !redeemAmt) return;
    setTxState("pending"); setTxMsg("Redeeming IRON…");
    try {
      await (await new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, signer).redeem(ethers.parseUnits(redeemAmt, 18))).wait();
      setTxState("success"); setTxMsg("Redemption successful!"); setRedeemAmt("");
      fetchSnapshot(); fetchBalances(account);
    } catch (e) { setTxState("error"); setTxMsg(e.reason || e.message || "Failed"); }
    setTimeout(() => setTxState("idle"), 5000);
  };

  const doLookup = async () => {
    if (!lookupAddr) return;
    try {
      const rpc = getRpc();
      const [ib, wb] = await Promise.all([
        new ethers.Contract(CONTRACTS.IRON, ERC20_ABI, rpc).balanceOf(lookupAddr),
        new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, rpc).balanceOf(lookupAddr),
      ]);
      setLookupResult({ ironBal: ib, wbtcBal: wb, addr: lookupAddr });
    } catch { setLookupResult({ error: "Invalid address or lookup failed" }); }
  };

  const navPerIron = snapshot?.[7];
  const totalAUM   = snapshot?.[6];
  const ironSupply = snapshot?.[8];
  const btcPrice   = snapshot?.[0];
  const goldUSD    = snapshot?.[3];
  const bondUSD    = snapshot?.[4];
  const aiUSD      = snapshot?.[5];
  const btcPosUSD  = snapshot && btcPrice ? (snapshot[2] * snapshot[0]) / BigInt(1e8) : null;
  const userIronValue = userIron && navPerIron ? (BigInt(userIron) * BigInt(navPerIron)) / BigInt(1e18) : null;
  const fundShare = userIron && ironSupply && ironSupply > 0n ? ((Number(userIron) / Number(ironSupply)) * 100).toFixed(4) : "0.0000";

  const positions = totalAUM && totalAUM > 0n ? [
    { label: "Bitcoin (BTC)", value: btcPosUSD, color: "#F7931A" },
    { label: "Gold (PAXG)",   value: goldUSD,   color: "#B8860B" },
    { label: "Bond Short",    value: bondUSD,   color: "#2E8B7A" },
    { label: "AI Infra",      value: aiUSD,     color: "#7B68EE" },
  ].filter(p => p.value) : [];
  const totalPos = positions.reduce((s, p) => s + Number(p.value), 0);

  return (
    <div style={S.page}>
      <div style={S.testnetBanner}>
        TESTNET PROTOTYPE · No real assets · For demonstration purposes only
      </div>

      {/* Wallet bar */}
      <div style={S.walletBar}>
        {account ? (
          <div style={S.walletRow}>
            <div style={S.walletPill}><span style={S.dot} />{shortAddr(account)}</div>
            <button style={S.disconnectBtn} onClick={disconnect}>disconnect</button>
          </div>
        ) : (
          <button style={S.connectBtn} onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>

      <div style={S.inner}>
        {/* KPI Strip */}
        <div style={S.kpiStrip}>
          <KPI label="NAV per IRON" value={snapshot ? `$${fmt8(navPerIron, 4)}` : "Loading…"} accent />
          <KPI label="Total AUM"    value={snapshot ? fmtUSD(totalAUM) : "Loading…"} />
          <KPI label="IRON Supply"  value={snapshot ? fmt18(ironSupply, 2) : "Loading…"} />
          <KPI label="BTC Price"    value={snapshot ? `$${fmt8(btcPrice, 0)}` : "Loading…"} />
          <KPI label="Last Update"  value={lastUpdate ? lastUpdate.toLocaleTimeString() : "—"} />
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {["overview","deposit","redeem","lookup"].map(t => (
            <button key={t} style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={S.twoCol}>
            <div style={S.card}>
              <h3 style={S.cardTitle}>Portfolio Allocation</h3>
              {positions.length > 0 ? positions.map(p => {
                const pct = totalPos > 0 ? (Number(p.value) / totalPos * 100) : 0;
                return (
                  <div key={p.label} style={S.posRow}>
                    <div style={S.posLabel}><span style={{ ...S.posDot, background: p.color }} />{p.label}</div>
                    <div style={S.posBar}><div style={{ ...S.posBarFill, width: `${pct}%`, background: p.color }} /></div>
                    <div style={S.posValues}><span>{fmtUSD(p.value)}</span><span style={{ color: "#666" }}>{pct.toFixed(1)}%</span></div>
                  </div>
                );
              }) : <p style={S.muted}>Loading…</p>}
            </div>
            <div style={S.card}>
              <h3 style={S.cardTitle}>Your Position</h3>
              {account ? (
                <>
                  <StatRow label="IRON Balance" value={fmt18(userIron, 4)} />
                  <StatRow label="Position Value" value={userIronValue ? fmtUSD(userIronValue) : "—"} accent />
                  <StatRow label="Fund Share" value={fundShare + "%"} />
                  <StatRow label="WBTC Balance" value={fmt8(userWbtc, 6) + " BTC"} />
                  <div style={S.divider} />
                  <button style={S.faucetBtn} onClick={claimFaucet}>🚰 Claim 1 Testnet WBTC</button>
                </>
              ) : (
                <div style={S.connectPrompt}>
                  <p style={S.muted}>Connect wallet to view your position</p>
                  <button style={S.connectBtn} onClick={connectWallet}>Connect Wallet</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "deposit" && (
          <div style={S.narrowCard}>
            <h3 style={S.cardTitle}>Deposit WBTC</h3>
            {!account ? <div style={S.connectPrompt}><button style={S.connectBtn} onClick={connectWallet}>Connect Wallet to Deposit</button></div> : (
              <>
                <InputGroup label="WBTC Amount" value={depositAmt} onChange={setDepositAmt} unit="WBTC" hint={`Balance: ${fmt8(userWbtc, 6)} WBTC`} />
                <button style={{ ...S.actionBtn, opacity: txState === "pending" ? 0.6 : 1 }} onClick={doDeposit} disabled={txState === "pending" || !depositAmt}>
                  {txState === "pending" ? "Processing…" : "Deposit WBTC"}
                </button>
                <button style={S.faucetBtn} onClick={claimFaucet}>🚰 Need testnet WBTC? Claim from faucet</button>
              </>
            )}
            <TxFeedback state={txState} msg={txMsg} />
          </div>
        )}

        {activeTab === "redeem" && (
          <div style={S.narrowCard}>
            <div style={S.phase2Warning}>⚠ Phase 2: Redemption via this interface will be disabled. Secondary market only.</div>
            <h3 style={S.cardTitle}>Redeem IRON Tokens</h3>
            {!account ? <div style={S.connectPrompt}><button style={S.connectBtn} onClick={connectWallet}>Connect Wallet to Redeem</button></div> : (
              <>
                <InputGroup label="IRON Amount" value={redeemAmt} onChange={setRedeemAmt} unit="IRON" hint={`Balance: ${fmt18(userIron, 4)} IRON`} />
                <button style={{ ...S.actionBtn, opacity: txState === "pending" ? 0.6 : 1 }} onClick={doRedeem} disabled={txState === "pending" || !redeemAmt}>
                  {txState === "pending" ? "Processing…" : "Redeem IRON"}
                </button>
              </>
            )}
            <TxFeedback state={txState} msg={txMsg} />
          </div>
        )}

        {activeTab === "lookup" && (
          <div style={S.narrowCard}>
            <h3 style={S.cardTitle}>Wallet Lookup</h3>
            <p style={S.muted}>View any wallet's SPICE position without connecting.</p>
            <InputGroup label="Wallet Address" value={lookupAddr} onChange={setLookupAddr} unit="" hint="" mono />
            <button style={S.actionBtn} onClick={doLookup}>Look Up Position</button>
            {lookupResult && !lookupResult.error && (
              <div style={{ ...S.card, marginTop: 16 }}>
                <StatRow label="Address" value={shortAddr(lookupResult.addr)} />
                <StatRow label="IRON Balance" value={fmt18(lookupResult.ironBal, 4)} />
                <StatRow label="WBTC Balance" value={fmt8(lookupResult.wbtcBal, 6) + " BTC"} />
              </div>
            )}
            {lookupResult?.error && <p style={{ color: "#CC4444", marginTop: 16, fontSize: 13 }}>{lookupResult.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, accent }) {
  return (
    <div style={S.kpi}>
      <span style={S.kpiLabel}>{label}</span>
      <span style={{ ...S.kpiValue, color: accent ? "#B8860B" : "#000000" }}>{value}</span>
    </div>
  );
}
function StatRow({ label, value, accent }) {
  return (
    <div style={S.statRow}>
      <span style={S.statLabel}>{label}</span>
      <span style={{ ...S.statValue, color: accent ? "#B8860B" : "#000000" }}>{value}</span>
    </div>
  );
}
function InputGroup({ label, value, onChange, unit, hint, mono }) {
  return (
    <div style={S.inputGroup}>
      <label style={S.inputLabel}>{label}</label>
      <div style={S.inputRow}>
        <input style={{ ...S.input, fontFamily: mono ? "monospace" : "inherit", fontSize: mono ? 12 : 14 }}
          type="text" value={value} onChange={e => onChange(e.target.value)} />
        {unit && <span style={S.inputUnit}>{unit}</span>}
      </div>
      {hint && <span style={S.inputHint}>{hint}</span>}
    </div>
  );
}
function TxFeedback({ state, msg }) {
  if (state === "idle") return null;
  const color = state === "success" ? "#2E8B7A" : state === "error" ? "#CC4444" : "#B8860B";
  return <div style={{ ...S.txFeedback, borderColor: color, color }}>{msg}</div>;
}

const S = {
  page: { position: "relative", zIndex: 1, background: "#FFFFFF" },
  testnetBanner: { 
    background: "#F8F8F8", 
    color: "#666666", 
    padding: "8px 32px", 
    fontSize: 10, 
    letterSpacing: "0.12em", 
    textAlign: "center", 
    borderBottom: "1px solid #E0E0E0",
    fontWeight: 600
  },
  walletBar: { 
    display: "flex", 
    justifyContent: "flex-end", 
    padding: "12px 32px", 
    borderBottom: "2px solid #E0E0E0",
    background: "#FFFFFF"
  },
  walletRow: { display: "flex", alignItems: "center", gap: 8 },
  walletPill: { 
    display: "flex", 
    alignItems: "center", 
    gap: 8, 
    padding: "6px 12px", 
    border: "1px solid #CCCCCC", 
    fontSize: 12, 
    color: "#333333", 
    background: "#F8F8F8" 
  },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#2E8B7A" },
  disconnectBtn: { 
    background: "none", 
    border: "1px solid #CCCCCC", 
    color: "#666666", 
    padding: "6px 12px", 
    fontSize: 11, 
    cursor: "pointer", 
    fontFamily: "inherit" 
  },
  connectBtn: { 
    padding: "8px 20px", 
    background: "#B8860B", 
    border: "none", 
    color: "#FFFFFF", 
    fontSize: 12, 
    fontWeight: 700, 
    cursor: "pointer", 
    letterSpacing: "0.08em", 
    fontFamily: "inherit" 
  },
  inner: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  kpiStrip: { 
    display: "flex", 
    gap: 1, 
    marginBottom: 32, 
    background: "#F8F8F8", 
    border: "2px solid #E0E0E0" 
  },
  kpi: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    gap: 4, 
    padding: "16px 20px", 
    borderRight: "1px solid #E0E0E0" 
  },
  kpiLabel: { 
    fontSize: 9, 
    color: "#666666", 
    letterSpacing: "0.12em", 
    textTransform: "uppercase",
    fontWeight: 600
  },
  kpiValue: { fontSize: 18, fontWeight: 700 },
  tabs: { 
    display: "flex", 
    gap: 1, 
    marginBottom: 24, 
    borderBottom: "2px solid #E0E0E0" 
  },
  tab: { 
    padding: "10px 20px", 
    background: "none", 
    border: "none", 
    color: "#666666", 
    fontSize: 11, 
    letterSpacing: "0.1em", 
    cursor: "pointer", 
    fontFamily: "inherit", 
    textTransform: "uppercase", 
    borderBottom: "2px solid transparent", 
    marginBottom: -2,
    fontWeight: 600
  },
  tabActive: { color: "#B8860B", borderBottom: "2px solid #B8860B" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: { 
    background: "#FFFFFF", 
    border: "2px solid #E0E0E0", 
    padding: "24px", 
    marginBottom: 16 
  },
  narrowCard: { 
    background: "#FFFFFF", 
    border: "2px solid #E0E0E0", 
    padding: "28px", 
    maxWidth: 520 
  },
  cardTitle: { 
    fontSize: 11, 
    color: "#666666", 
    letterSpacing: "0.15em", 
    margin: "0 0 20px",
    fontWeight: 700,
    textTransform: "uppercase"
  },
  posRow: { marginBottom: 14 },
  posLabel: { 
    display: "flex", 
    alignItems: "center", 
    gap: 8, 
    fontSize: 12, 
    color: "#333333", 
    marginBottom: 6,
    fontWeight: 600
  },
  posDot: { width: 8, height: 8, borderRadius: "50%" },
  posBar: { height: 4, background: "#E0E0E0", marginBottom: 4 },
  posBarFill: { height: "100%", transition: "width 0.5s ease" },
  posValues: { display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 },
  statRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "10px 0", 
    borderBottom: "1px solid #E0E0E0" 
  },
  statLabel: { fontSize: 11, color: "#666666", fontWeight: 600 },
  statValue: { fontSize: 13, fontWeight: 700 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { 
    display: "block", 
    fontSize: 10, 
    color: "#666666", 
    letterSpacing: "0.1em", 
    marginBottom: 8,
    fontWeight: 700,
    textTransform: "uppercase"
  },
  inputRow: { display: "flex", alignItems: "center" },
  input: { 
    flex: 1, 
    background: "#FFFFFF", 
    border: "2px solid #CCCCCC", 
    color: "#000000", 
    padding: "10px 14px", 
    fontSize: 14, 
    fontFamily: "inherit", 
    outline: "none" 
  },
  inputUnit: { 
    background: "#F8F8F8", 
    border: "2px solid #CCCCCC", 
    borderLeft: "none", 
    padding: "10px 12px", 
    fontSize: 11, 
    color: "#666666",
    fontWeight: 600
  },
  inputHint: { fontSize: 10, color: "#999999", marginTop: 6, display: "block" },
  actionBtn: { 
    width: "100%", 
    padding: "12px", 
    background: "#B8860B", 
    border: "none", 
    color: "#FFFFFF", 
    fontSize: 12, 
    fontWeight: 700, 
    cursor: "pointer", 
    letterSpacing: "0.1em", 
    fontFamily: "inherit", 
    marginBottom: 12 
  },
  faucetBtn: { 
    width: "100%", 
    padding: "10px", 
    background: "none", 
    border: "2px solid #CCCCCC", 
    color: "#666666", 
    fontSize: 11, 
    cursor: "pointer", 
    fontFamily: "inherit", 
    marginTop: 8,
    fontWeight: 600
  },
  connectPrompt: { textAlign: "center", padding: "24px 0" },
  phase2Warning: { 
    background: "#FFF8E1", 
    border: "2px solid #FFD54F", 
    color: "#B8860B", 
    padding: "12px 16px", 
    fontSize: 11, 
    marginBottom: 20, 
    lineHeight: 1.6,
    fontWeight: 600
  },
  txFeedback: { 
    marginTop: 16, 
    padding: "12px 16px", 
    border: "2px solid", 
    fontSize: 12, 
    lineHeight: 1.5,
    fontWeight: 600
  },
  divider: { borderTop: "1px solid #E0E0E0", margin: "16px 0" },
  muted: { color: "#666666", fontSize: 12, lineHeight: 1.6, margin: "0 0 16px" },
};
