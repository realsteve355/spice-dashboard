import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// ── Contract Addresses (Base Sepolia Testnet) ─────────────────────
const CONTRACTS = {
  WBTC:  "0x9639915dB85ee83f3C1ed88AaC3BCb2E2104B70b",
  IRON:  "0x5C06fB67f24e06A7234a777F9220e083d2684976",
  VAULT: "0x0fCf6F860927c6cd94e974E7B9BfAb440E2b1FeE",
};

const BASE_SEPOLIA_CHAIN_ID = 84532;

const VAULT_ABI = [
  "function getPortfolioSnapshot() view returns (uint256 btcPrice, uint256 ethPrice, uint256 btcPositionSats, uint256 goldPositionUSD, uint256 bondShortPositionUSD, uint256 aiInfraPositionUSD, uint256 totalAUMusd, uint256 navPerIron, uint256 ironSupply, uint256 pendingFees, uint256 lastFeeAccrual)",
  "function deposit(uint256 wbtcAmount) external",
  "function redeem(uint256 ironAmount) external",
  "function navPerIron() view returns (uint256)",
  "function feeRecipient() view returns (address)",
];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) external returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function faucetOne() external",
  "function decimals() view returns (uint8)",
];

// ── Helpers ───────────────────────────────────────────────────────
const fmt8 = (v, dec = 2) => {
  if (!v && v !== 0) return "—";
  return (Number(v) / 1e8).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

const fmtUSD = (v, dec = 2) => {
  if (!v && v !== 0) return "—";
  const n = Number(v) / 1e8;
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

const fmt18 = (v, dec = 4) => {
  if (!v && v !== 0) return "—";
  return Number(ethers.formatUnits(v, 18)).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

const shortAddr = (addr) =>
  addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : "";

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [provider, setProvider]   = useState(null);
  const [signer, setSigner]       = useState(null);
  const [account, setAccount]     = useState(null);
  const [chainOk, setChainOk]     = useState(true);
  const [snapshot, setSnapshot]   = useState(null);
  const [userIron, setUserIron]   = useState(null);
  const [userWbtc, setUserWbtc]   = useState(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [redeemAmt, setRedeemAmt]   = useState("");
  const [txState, setTxState]     = useState("idle"); // idle | pending | success | error
  const [txMsg, setTxMsg]         = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lookupAddr, setLookupAddr] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | deposit | redeem | lookup

  // ── Read-only provider (public data without wallet) ───────────
  const getRpcProvider = useCallback(() => {
    return new ethers.JsonRpcProvider("https://sepolia.base.org");
  }, []);

  // ── Fetch on-chain snapshot ───────────────────────────────────
  const fetchSnapshot = useCallback(async () => {
    try {
      const rpc = getRpcProvider();
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, rpc);
      const snap = await vault.getPortfolioSnapshot();
      setSnapshot(snap);
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Snapshot fetch failed:", e);
    }
  }, [getRpcProvider]);

  // ── Fetch user balances ───────────────────────────────────────
  const fetchUserBalances = useCallback(async (addr) => {
    if (!addr) return;
    try {
      const rpc = getRpcProvider();
      const iron = new ethers.Contract(CONTRACTS.IRON, ERC20_ABI, rpc);
      const wbtc = new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, rpc);
      const [ironBal, wbtcBal] = await Promise.all([
        iron.balanceOf(addr),
        wbtc.balanceOf(addr),
      ]);
      setUserIron(ironBal);
      setUserWbtc(wbtcBal);
    } catch (e) {
      console.error("Balance fetch failed:", e);
    }
  }, [getRpcProvider]);

  // ── Auto-refresh every 30s ────────────────────────────────────
  useEffect(() => {
    fetchSnapshot();
    const id = setInterval(fetchSnapshot, 30000);
    return () => clearInterval(id);
  }, [fetchSnapshot]);

  useEffect(() => {
    if (account) fetchUserBalances(account);
  }, [account, fetchUserBalances]);

  // ── Connect wallet ────────────────────────────────────────────
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      const p = new ethers.BrowserProvider(window.ethereum);
      const accounts = await p.send("eth_requestAccounts", []);
      const net = await p.getNetwork();
      const ok = Number(net.chainId) === BASE_SEPOLIA_CHAIN_ID;
      setChainOk(ok);
      if (!ok) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + BASE_SEPOLIA_CHAIN_ID.toString(16) }],
          });
        } catch {}
      }
      const s = await p.getSigner();
      setProvider(p);
      setSigner(s);
      setAccount(accounts[0]);
    } catch (e) {
      console.error("Connect failed:", e);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setUserIron(null);
    setUserWbtc(null);
  };

  // ── Faucet ────────────────────────────────────────────────────
  const claimFaucet = async () => {
    if (!signer) return;
    setTxState("pending");
    setTxMsg("Claiming 1 testnet WBTC…");
    try {
      const wbtc = new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, signer);
      const tx = await wbtc.faucetOne();
      await tx.wait();
      setTxState("success");
      setTxMsg("1 testnet WBTC claimed!");
      fetchUserBalances(account);
    } catch (e) {
      setTxState("error");
      setTxMsg(e.reason || e.message || "Transaction failed");
    }
    setTimeout(() => setTxState("idle"), 4000);
  };

  // ── Deposit ───────────────────────────────────────────────────
  const doDeposit = async () => {
    if (!signer || !depositAmt) return;
    setTxState("pending");
    setTxMsg("Approving WBTC…");
    try {
      const amtSats = BigInt(Math.round(parseFloat(depositAmt) * 1e8));
      const wbtc = new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, signer);
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, signer);

      const allowance = await wbtc.allowance(account, CONTRACTS.VAULT);
      if (allowance < amtSats) {
        const approveTx = await wbtc.approve(CONTRACTS.VAULT, amtSats);
        await approveTx.wait();
      }

      setTxMsg("Depositing WBTC…");
      const tx = await vault.deposit(amtSats);
      await tx.wait();

      setTxState("success");
      setTxMsg("Deposit successful! IRON tokens minted.");
      setDepositAmt("");
      fetchSnapshot();
      fetchUserBalances(account);
    } catch (e) {
      setTxState("error");
      setTxMsg(e.reason || e.message || "Deposit failed");
    }
    setTimeout(() => setTxState("idle"), 5000);
  };

  // ── Redeem ────────────────────────────────────────────────────
  const doRedeem = async () => {
    if (!signer || !redeemAmt) return;
    setTxState("pending");
    setTxMsg("Redeeming IRON tokens…");
    try {
      const amtIron = ethers.parseUnits(redeemAmt, 18);
      const vault = new ethers.Contract(CONTRACTS.VAULT, VAULT_ABI, signer);
      const tx = await vault.redeem(amtIron);
      await tx.wait();

      setTxState("success");
      setTxMsg("Redemption successful! WBTC returned to wallet.");
      setRedeemAmt("");
      fetchSnapshot();
      fetchUserBalances(account);
    } catch (e) {
      setTxState("error");
      setTxMsg(e.reason || e.message || "Redemption failed");
    }
    setTimeout(() => setTxState("idle"), 5000);
  };

  // ── Wallet lookup ─────────────────────────────────────────────
  const doLookup = async () => {
    if (!lookupAddr) return;
    try {
      const rpc = getRpcProvider();
      const iron = new ethers.Contract(CONTRACTS.IRON, ERC20_ABI, rpc);
      const wbtc = new ethers.Contract(CONTRACTS.WBTC, ERC20_ABI, rpc);
      const [ironBal, wbtcBal] = await Promise.all([
        iron.balanceOf(lookupAddr),
        wbtc.balanceOf(lookupAddr),
      ]);
      setLookupResult({ ironBal, wbtcBal, addr: lookupAddr });
    } catch (e) {
      setLookupResult({ error: "Invalid address or lookup failed" });
    }
  };

  // ── Derived values ────────────────────────────────────────────
  const navPerIron = snapshot ? snapshot[7] : null;
  const totalAUM   = snapshot ? snapshot[6] : null;
  const ironSupply = snapshot ? snapshot[8] : null;
  const btcPrice   = snapshot ? snapshot[0] : null;
  const goldUSD    = snapshot ? snapshot[3] : null;
  const bondUSD    = snapshot ? snapshot[4] : null;
  const aiUSD      = snapshot ? snapshot[5] : null;
  const btcPosUSD  = snapshot && btcPrice ? (snapshot[2] * snapshot[0]) / BigInt(1e8) : null;

  const userIronValue = userIron && navPerIron
    ? (BigInt(userIron) * BigInt(navPerIron)) / BigInt(1e18)
    : null;

  const fundShare = userIron && ironSupply && ironSupply > 0n
    ? ((Number(userIron) / Number(ironSupply)) * 100).toFixed(4)
    : "0.0000";

  // ── Portfolio bars ────────────────────────────────────────────
  const positions = totalAUM && totalAUM > 0n ? [
    { label: "Bitcoin (BTC)", value: btcPosUSD, color: "#F7931A" },
    { label: "Gold (PAXG)",   value: goldUSD,   color: "#C9A84C" },
    { label: "Bond Short",    value: bondUSD,   color: "#4A9B8F" },
    { label: "AI Infra",      value: aiUSD,     color: "#7B68EE" },
  ].filter(p => p.value) : [];

  const totalPos = positions.reduce((s, p) => s + Number(p.value), 0);

  return (
    <div style={S.root}>
      {/* Grain overlay */}
      <div style={S.grain} />

      {/* Header */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logo}>
            <span style={S.logoMark}>◈</span>
            <span style={S.logoText}>SPICE</span>
            <span style={S.logoBracket}>[ZPC]</span>
          </div>
          <span style={S.tagline}>CRISIS HEDGE PROTOCOL · BASE SEPOLIA TESTNET</span>
        </div>
        <div style={S.headerRight}>
          {account ? (
            <div style={S.walletRow}>
              <div style={S.walletPill}>
                <span style={S.dot} />
                <span>{shortAddr(account)}</span>
              </div>
              <button style={S.disconnectBtn} onClick={disconnect}>disconnect</button>
            </div>
          ) : (
            <button style={S.connectBtn} onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Chain warning */}
      {account && !chainOk && (
        <div style={S.chainWarning}>
          ⚠ Wrong network — please switch to Base Sepolia in MetaMask
        </div>
      )}

      {/* Testnet banner */}
      <div style={S.testnetBanner}>
        TESTNET PROTOTYPE · No real assets · For demonstration purposes only
      </div>

      <main style={S.main}>

        {/* ── KPI Strip ── */}
        <div style={S.kpiStrip}>
          <KPI label="NAV per IRON" value={snapshot ? `$${fmt8(navPerIron, 4)}` : "Loading…"} sub="USD" accent />
          <KPI label="Total AUM" value={snapshot ? fmtUSD(totalAUM) : "Loading…"} sub="USD" />
          <KPI label="IRON Supply" value={snapshot ? fmt18(ironSupply, 2) : "Loading…"} sub="tokens" />
          <KPI label="BTC Price" value={snapshot ? `$${fmt8(btcPrice, 0)}` : "Loading…"} sub="USD" />
          <KPI label="Last Update" value={lastUpdate ? lastUpdate.toLocaleTimeString() : "—"} sub="auto-refresh 30s" />
        </div>

        {/* ── Tabs ── */}
        <div style={S.tabs}>
          {["overview", "deposit", "redeem", "lookup"].map(t => (
            <button
              key={t}
              style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div style={S.tabContent}>
            <div style={S.twoCol}>

              {/* Portfolio breakdown */}
              <div style={S.card}>
                <h3 style={S.cardTitle}>Portfolio Allocation</h3>
                {positions.length > 0 ? positions.map(p => {
                  const pct = totalPos > 0 ? (Number(p.value) / totalPos * 100) : 0;
                  return (
                    <div key={p.label} style={S.posRow}>
                      <div style={S.posLabel}>
                        <span style={{ ...S.posDot, background: p.color }} />
                        <span>{p.label}</span>
                      </div>
                      <div style={S.posBar}>
                        <div style={{ ...S.posBarFill, width: `${pct}%`, background: p.color }} />
                      </div>
                      <div style={S.posValues}>
                        <span style={S.posUSD}>{fmtUSD(p.value)}</span>
                        <span style={S.posPct}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                }) : (
                  <p style={S.muted}>Loading portfolio data…</p>
                )}
              </div>

              {/* User position */}
              <div style={S.card}>
                <h3 style={S.cardTitle}>Your Position</h3>
                {account ? (
                  <>
                    <div style={S.statRow}>
                      <span style={S.statLabel}>IRON Balance</span>
                      <span style={S.statValue}>{fmt18(userIron, 4)}</span>
                    </div>
                    <div style={S.statRow}>
                      <span style={S.statLabel}>Position Value</span>
                      <span style={{ ...S.statValue, color: "#C9A84C" }}>
                        {userIronValue ? fmtUSD(userIronValue) : "—"}
                      </span>
                    </div>
                    <div style={S.statRow}>
                      <span style={S.statLabel}>Fund Share</span>
                      <span style={S.statValue}>{fundShare}%</span>
                    </div>
                    <div style={S.statRow}>
                      <span style={S.statLabel}>WBTC Balance</span>
                      <span style={S.statValue}>{fmt8(userWbtc, 6)} BTC</span>
                    </div>
                    <div style={S.divider} />
                    <button style={S.faucetBtn} onClick={claimFaucet}>
                      🚰 Claim 1 Testnet WBTC
                    </button>
                  </>
                ) : (
                  <div style={S.connectPrompt}>
                    <p style={S.muted}>Connect your wallet to view your position</p>
                    <button style={S.connectBtn} onClick={connectWallet}>Connect Wallet</button>
                  </div>
                )}
              </div>
            </div>

            {/* Protocol info */}
            <div style={S.card}>
              <h3 style={S.cardTitle}>Protocol Status</h3>
              <div style={S.infoGrid}>
                <InfoItem label="Phase" value="Phase 1 — ETF Mode" />
                <InfoItem label="Network" value="Base Sepolia (Testnet)" />
                <InfoItem label="Vault" value={shortAddr(CONTRACTS.VAULT)} />
                <InfoItem label="IRON Token" value={shortAddr(CONTRACTS.IRON)} />
                <InfoItem label="WBTC Token" value={shortAddr(CONTRACTS.WBTC)} />
                <InfoItem label="Annual Fee" value="1.5%" />
              </div>
            </div>
          </div>
        )}

        {/* ── Deposit Tab ── */}
        {activeTab === "deposit" && (
          <div style={S.tabContent}>
            <div style={S.narrowCard}>
              <h3 style={S.cardTitle}>Deposit WBTC</h3>
              <p style={S.muted}>
                Deposit Wrapped Bitcoin to receive IRON tokens representing your share of the fund.
                IRON tokens are minted at the current NAV.
              </p>
              {!account ? (
                <div style={S.connectPrompt}>
                  <button style={S.connectBtn} onClick={connectWallet}>Connect Wallet to Deposit</button>
                </div>
              ) : (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>WBTC Amount</label>
                    <div style={S.inputRow}>
                      <input
                        style={S.input}
                        type="number"
                        placeholder="0.001"
                        step="0.0001"
                        value={depositAmt}
                        onChange={e => setDepositAmt(e.target.value)}
                      />
                      <span style={S.inputUnit}>WBTC</span>
                    </div>
                    <span style={S.inputHint}>
                      Balance: {fmt8(userWbtc, 6)} WBTC
                    </span>
                  </div>

                  {depositAmt && navPerIron && (
                    <div style={S.estimate}>
                      <span style={S.muted}>Estimated IRON received:</span>
                      <span style={S.estimateVal}>
                        ~{(parseFloat(depositAmt) * 1e8 / Number(navPerIron) * 1e18 / 1e18).toFixed(4)} IRON
                      </span>
                    </div>
                  )}

                  <button
                    style={{ ...S.actionBtn, opacity: txState === "pending" ? 0.6 : 1 }}
                    onClick={doDeposit}
                    disabled={txState === "pending" || !depositAmt}
                  >
                    {txState === "pending" ? "Processing…" : "Deposit WBTC"}
                  </button>

                  <button style={S.faucetBtn} onClick={claimFaucet}>
                    🚰 Need testnet WBTC? Claim from faucet
                  </button>
                </>
              )}
              <TxFeedback state={txState} msg={txMsg} />
            </div>
          </div>
        )}

        {/* ── Redeem Tab ── */}
        {activeTab === "redeem" && (
          <div style={S.tabContent}>
            <div style={S.narrowCard}>
              <div style={S.phase2Warning}>
                ⚠ Phase 2 Notice: Once the macro trigger fires, redemption via this interface is disabled.
                Phase 2 holders must use secondary markets (Aerodrome DEX).
              </div>
              <h3 style={S.cardTitle}>Redeem IRON Tokens</h3>
              <p style={S.muted}>
                Burn IRON tokens to receive WBTC at the current NAV. Available in Phase 1 only.
              </p>
              {!account ? (
                <div style={S.connectPrompt}>
                  <button style={S.connectBtn} onClick={connectWallet}>Connect Wallet to Redeem</button>
                </div>
              ) : (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>IRON Amount</label>
                    <div style={S.inputRow}>
                      <input
                        style={S.input}
                        type="number"
                        placeholder="1.0000"
                        step="0.0001"
                        value={redeemAmt}
                        onChange={e => setRedeemAmt(e.target.value)}
                      />
                      <span style={S.inputUnit}>IRON</span>
                    </div>
                    <span style={S.inputHint}>
                      Balance: {fmt18(userIron, 4)} IRON
                    </span>
                  </div>

                  {redeemAmt && navPerIron && (
                    <div style={S.estimate}>
                      <span style={S.muted}>Estimated WBTC returned:</span>
                      <span style={S.estimateVal}>
                        ~{(parseFloat(redeemAmt) * Number(navPerIron) / 1e8 / 1e10).toFixed(6)} WBTC
                      </span>
                    </div>
                  )}

                  <button
                    style={{ ...S.actionBtn, opacity: txState === "pending" ? 0.6 : 1 }}
                    onClick={doRedeem}
                    disabled={txState === "pending" || !redeemAmt}
                  >
                    {txState === "pending" ? "Processing…" : "Redeem IRON"}
                  </button>
                </>
              )}
              <TxFeedback state={txState} msg={txMsg} />
            </div>
          </div>
        )}

        {/* ── Lookup Tab ── */}
        {activeTab === "lookup" && (
          <div style={S.tabContent}>
            <div style={S.narrowCard}>
              <h3 style={S.cardTitle}>Wallet Lookup</h3>
              <p style={S.muted}>
                Enter any wallet address to view its SPICE position. No connection required.
              </p>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Wallet Address</label>
                <div style={S.inputRow}>
                  <input
                    style={{ ...S.input, fontFamily: "monospace", fontSize: 12 }}
                    type="text"
                    placeholder="0x..."
                    value={lookupAddr}
                    onChange={e => setLookupAddr(e.target.value)}
                  />
                </div>
              </div>
              <button style={S.actionBtn} onClick={doLookup}>
                Look Up Position
              </button>

              {lookupResult && !lookupResult.error && (
                <div style={S.lookupResult}>
                  <div style={S.statRow}>
                    <span style={S.statLabel}>Address</span>
                    <span style={{ ...S.statValue, fontSize: 11 }}>{shortAddr(lookupResult.addr)}</span>
                  </div>
                  <div style={S.statRow}>
                    <span style={S.statLabel}>IRON Balance</span>
                    <span style={S.statValue}>{fmt18(lookupResult.ironBal, 4)}</span>
                  </div>
                  <div style={S.statRow}>
                    <span style={S.statLabel}>WBTC Balance</span>
                    <span style={S.statValue}>{fmt8(lookupResult.wbtcBal, 6)} BTC</span>
                  </div>
                </div>
              )}
              {lookupResult?.error && (
                <p style={{ color: "#E05C5C", marginTop: 16, fontSize: 13 }}>{lookupResult.error}</p>
              )}
            </div>
          </div>
        )}

      </main>

      <footer style={S.footer}>
        <span>SPICE [ZPC] Protocol · Base Sepolia Testnet · Smart contracts verified on Basescan</span>
        <span style={S.muted}>Not a financial promotion · Testnet only · No real assets</span>
      </footer>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────
function KPI({ label, value, sub, accent }) {
  return (
    <div style={S.kpi}>
      <span style={S.kpiLabel}>{label}</span>
      <span style={{ ...S.kpiValue, color: accent ? "#C9A84C" : "#E8E4DC" }}>{value}</span>
      <span style={S.kpiSub}>{sub}</span>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={S.infoItem}>
      <span style={S.infoLabel}>{label}</span>
      <span style={S.infoValue}>{value}</span>
    </div>
  );
}

function TxFeedback({ state, msg }) {
  if (state === "idle") return null;
  const color = state === "success" ? "#4A9B8F" : state === "error" ? "#E05C5C" : "#C9A84C";
  return (
    <div style={{ ...S.txFeedback, borderColor: color, color }}>
      {state === "pending" && <span style={S.spinner}>◌ </span>}
      {msg}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: "#080809",
    color: "#E8E4DC",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    position: "relative",
  },
  grain: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 32px", borderBottom: "1px solid #1A1A1E",
    position: "relative", zIndex: 10, background: "#080809",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 24 },
  logo: { display: "flex", alignItems: "baseline", gap: 8 },
  logoMark: { fontSize: 20, color: "#C9A84C" },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", color: "#E8E4DC" },
  logoBracket: {
    fontSize: 11, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)",
    padding: "2px 7px", letterSpacing: "0.1em",
  },
  tagline: { fontSize: 10, color: "#444", letterSpacing: "0.08em" },
  headerRight: {},
  walletRow: { display: "flex", alignItems: "center", gap: 8 },
  walletPill: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 12px", border: "1px solid #222",
    fontSize: 12, color: "#888", background: "#0F0F11",
  },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#4A9B8F" },
  disconnectBtn: {
    background: "none", border: "1px solid #222", color: "#555",
    padding: "6px 12px", fontSize: 11, cursor: "pointer", letterSpacing: "0.05em",
  },
  connectBtn: {
    padding: "8px 20px", background: "#C9A84C", border: "none",
    color: "#080809", fontSize: 12, fontWeight: 700, cursor: "pointer",
    letterSpacing: "0.08em", fontFamily: "inherit",
  },
  chainWarning: {
    background: "#2A1A00", color: "#F7931A", padding: "10px 32px",
    fontSize: 12, borderBottom: "1px solid #3A2A00", textAlign: "center",
  },
  testnetBanner: {
    background: "#0F0F11", color: "#444", padding: "6px 32px",
    fontSize: 10, letterSpacing: "0.12em", textAlign: "center",
    borderBottom: "1px solid #131315",
  },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 1 },

  // KPI strip
  kpiStrip: {
    display: "flex", gap: 1, marginBottom: 32,
    background: "#0F0F11", border: "1px solid #1A1A1E",
  },
  kpi: {
    flex: 1, display: "flex", flexDirection: "column", gap: 4,
    padding: "16px 20px", borderRight: "1px solid #1A1A1E",
  },
  kpiLabel: { fontSize: 9, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" },
  kpiValue: { fontSize: 18, fontWeight: 700, letterSpacing: "0.02em" },
  kpiSub: { fontSize: 9, color: "#444" },

  // Tabs
  tabs: { display: "flex", gap: 1, marginBottom: 24, borderBottom: "1px solid #1A1A1E" },
  tab: {
    padding: "10px 20px", background: "none", border: "none",
    color: "#555", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer",
    fontFamily: "inherit", textTransform: "uppercase",
    borderBottom: "2px solid transparent", marginBottom: -1,
  },
  tabActive: { color: "#C9A84C", borderBottom: "2px solid #C9A84C" },
  tabContent: { marginTop: 8 },

  // Cards
  card: {
    background: "#0F0F11", border: "1px solid #1A1A1E",
    padding: "24px", marginBottom: 16,
  },
  narrowCard: {
    background: "#0F0F11", border: "1px solid #1A1A1E",
    padding: "28px", maxWidth: 520,
  },
  cardTitle: { fontSize: 11, color: "#555", letterSpacing: "0.15em", marginBottom: 20, margin: "0 0 20px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },

  // Portfolio positions
  posRow: { marginBottom: 14 },
  posLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#888", marginBottom: 6 },
  posDot: { width: 8, height: 8, borderRadius: "50%" },
  posBar: { height: 3, background: "#1A1A1E", marginBottom: 4 },
  posBarFill: { height: "100%", transition: "width 0.5s ease" },
  posValues: { display: "flex", justifyContent: "space-between", fontSize: 11 },
  posUSD: { color: "#E8E4DC" },
  posPct: { color: "#555" },

  // Stat rows
  statRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid #131315",
  },
  statLabel: { fontSize: 11, color: "#555", letterSpacing: "0.05em" },
  statValue: { fontSize: 13, color: "#E8E4DC", fontWeight: 600 },

  // Info grid
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 },
  infoItem: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "12px 0", borderBottom: "1px solid #131315", borderRight: "1px solid #131315",
    paddingRight: 16, marginRight: 16,
  },
  infoLabel: { fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" },
  infoValue: { fontSize: 12, color: "#888" },

  // Forms
  inputGroup: { marginBottom: 16 },
  inputLabel: { display: "block", fontSize: 10, color: "#555", letterSpacing: "0.1em", marginBottom: 8 },
  inputRow: { display: "flex", alignItems: "center", gap: 0 },
  input: {
    flex: 1, background: "#080809", border: "1px solid #222", color: "#E8E4DC",
    padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none",
  },
  inputUnit: {
    background: "#131315", border: "1px solid #222", borderLeft: "none",
    padding: "10px 12px", fontSize: 11, color: "#555",
  },
  inputHint: { fontSize: 10, color: "#444", marginTop: 6, display: "block" },

  estimate: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#0A0A0D", border: "1px solid #1A1A1E",
    padding: "10px 14px", marginBottom: 16, fontSize: 12,
  },
  estimateVal: { color: "#C9A84C", fontWeight: 600 },

  actionBtn: {
    width: "100%", padding: "12px", background: "#C9A84C", border: "none",
    color: "#080809", fontSize: 12, fontWeight: 700, cursor: "pointer",
    letterSpacing: "0.1em", fontFamily: "inherit", marginBottom: 12,
  },
  faucetBtn: {
    width: "100%", padding: "10px", background: "none",
    border: "1px solid #222", color: "#555", fontSize: 11,
    cursor: "pointer", letterSpacing: "0.05em", fontFamily: "inherit", marginTop: 8,
  },

  connectPrompt: { textAlign: "center", padding: "24px 0" },

  phase2Warning: {
    background: "#1A1200", border: "1px solid #3A2800",
    color: "#C9A84C", padding: "12px 16px", fontSize: 11,
    marginBottom: 20, lineHeight: 1.6,
  },

  lookupResult: {
    background: "#080809", border: "1px solid #1A1A1E",
    padding: "16px", marginTop: 20,
  },

  txFeedback: {
    marginTop: 16, padding: "12px 16px", border: "1px solid",
    fontSize: 12, lineHeight: 1.5,
  },
  spinner: { animation: "spin 1s linear infinite" },

  divider: { borderTop: "1px solid #131315", margin: "16px 0" },
  muted: { color: "#555", fontSize: 12, lineHeight: 1.6, margin: "0 0 16px" },

  footer: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 32px", borderTop: "1px solid #1A1A1E",
    fontSize: 10, color: "#333", letterSpacing: "0.05em",
    position: "relative", zIndex: 1,
  },
};
