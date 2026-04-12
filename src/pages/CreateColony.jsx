import { useState } from "react";
import { ethers } from "ethers";
import { COLONY_ABI, COLONY_BYTECODE } from "../data/colony-artifact";

const F    = "'IBM Plex Mono', monospace";
const BG0  = "#0a0e1a";
const BG2  = "#0f1520";
const BD   = "#1e2a42";
const T1   = "#e8eaf0";
const T2   = "#8899bb";
const T3   = "#4a5878";
const GOLD = "#c8a96e";
const RED  = "#ef4444";
const GREEN = "#16a34a";

const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_SEPOLIA_HEX      = "0x14A34";
const COLONY_APP_HOST       = "https://app.zpc.finance";
const EXPLORER              = "https://sepolia.basescan.org/tx/";

function toSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateColony() {
  const [name,          setName]          = useState("");
  const [wallet,        setWallet]        = useState(null);   // connected address
  const [step,          setStep]          = useState("form"); // form | deploying | success
  const [txHash,        setTxHash]        = useState(null);
  const [colonyAddress, setColonyAddress] = useState(null);
  const [error,         setError]         = useState(null);

  const slug      = toSlug(name);
  const canDeploy = name.trim().length >= 3 && wallet;

  async function connectWallet() {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask not detected. Install MetaMask to continue.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const chainId  = parseInt(
        await window.ethereum.request({ method: "eth_chainId" }), 16
      );
      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_SEPOLIA_HEX }],
          });
        } catch {
          setError("Switch MetaMask to Base Sepolia (chain 84532) and try again.");
          return;
        }
      }
      setWallet(accounts[0]);
    } catch {
      setError("Wallet connection cancelled.");
    }
  }

  async function deploy() {
    if (!canDeploy) return;
    setStep("deploying");
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const factory  = new ethers.ContractFactory(COLONY_ABI, COLONY_BYTECODE, signer);
      const contract = await factory.deploy(name.trim());
      setTxHash(contract.deploymentTransaction().hash);
      await contract.waitForDeployment();
      setColonyAddress(await contract.getAddress());
      setStep("success");
    } catch (e) {
      setError(e.message?.slice(0, 160) || "Deployment failed.");
      setStep("form");
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 57px)",
      background: BG0,
      fontFamily: F,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "60px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: T3, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            Colony Formation
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: GOLD, letterSpacing: "0.06em" }}>
            Create a Colony
          </div>
          <div style={{ fontSize: 11, color: T2, marginTop: 8, lineHeight: 1.6 }}>
            Deploys a new Colony contract to Base Sepolia. Your wallet becomes the colony founder.
          </div>
        </div>

        {/* ── FORM ── */}
        {(step === "form" || step === "deploying") && (
          <>
            {/* Colony name */}
            <div style={S.section}>
              <label style={S.label}>Colony name</label>
              <input
                style={{ ...S.input, opacity: step === "deploying" ? 0.5 : 1 }}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Turing Campus"
                maxLength={64}
                disabled={step === "deploying"}
              />
              {name.trim().length >= 3 && (
                <div style={{ fontSize: 10, color: T3, marginTop: 6 }}>
                  slug: <span style={{ color: T2 }}>{slug}</span>
                  &nbsp;·&nbsp;
                  url: <span style={{ color: T2 }}>app.zpc.finance/colony/{slug}</span>
                </div>
              )}
            </div>

            {/* Wallet */}
            <div style={S.section}>
              <label style={S.label}>Founder wallet (Base Sepolia)</label>
              {wallet ? (
                <div style={{ ...S.input, color: GOLD, cursor: "default" }}>
                  {wallet.slice(0, 10)}…{wallet.slice(-8)}
                  <span style={{ float: "right", fontSize: 9, color: GREEN }}>● connected</span>
                </div>
              ) : (
                <button onClick={connectWallet} style={S.ghostBtn}>
                  Connect MetaMask →
                </button>
              )}
            </div>

            {/* Fixed params summary */}
            <div style={{ ...S.card, marginBottom: 24 }}>
              <div style={{ fontSize: 9, color: T3, letterSpacing: "0.15em", marginBottom: 10 }}>
                FIXED COLONY PARAMETERS
              </div>
              {[
                ["UBI per citizen",       "1,000 S-tokens / epoch"],
                ["Max savings",           "200 S → V per epoch"],
                ["Stewardship fee",       "0.5% declared value / epoch"],
                ["Constitutional change", "80% referendum required"],
                ["MCC recall trigger",    "Bill +20% above 12m avg"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 5 }}>
                  <span style={{ color: T3 }}>{k}</span>
                  <span style={{ color: T2 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 11, color: RED, marginBottom: 16, padding: "10px 12px", border: `1px solid ${RED}40`, borderRadius: 6 }}>
                {error}
              </div>
            )}

            {/* Deploy button */}
            {step === "deploying" ? (
              <div style={{ ...S.primaryBtn, opacity: 0.7, cursor: "default", textAlign: "center" }}>
                Deploying… (confirm in MetaMask, then wait for block)
              </div>
            ) : (
              <button
                onClick={deploy}
                disabled={!canDeploy}
                style={{ ...S.primaryBtn, opacity: canDeploy ? 1 : 0.35, cursor: canDeploy ? "pointer" : "default" }}
              >
                Deploy Colony →
              </button>
            )}

            {/* Tx hash (once broadcast) */}
            {txHash && (
              <div style={{ fontSize: 10, color: T3, marginTop: 12, textAlign: "center" }}>
                tx: <a href={`${EXPLORER}${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: T2 }}>
                  {txHash.slice(0, 18)}…
                </a>
              </div>
            )}
          </>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <div style={S.card}>
            <div style={{ fontSize: 11, color: GREEN, letterSpacing: "0.1em", marginBottom: 16 }}>
              ✓ COLONY DEPLOYED
            </div>

            <Row label="Colony name"    value={name} />
            <Row label="Slug"           value={slug} />
            <Row label="Contract"       value={`${colonyAddress?.slice(0,10)}…${colonyAddress?.slice(-8)}`} mono />
            <Row label="Network"        value="Base Sepolia" />
            <Row label="Founder"        value={`${wallet?.slice(0,10)}…${wallet?.slice(-8)}`} mono />

            <div style={{ borderTop: `1px solid ${BD}`, margin: "16px 0" }} />

            <a
              href={`${COLONY_APP_HOST}/colony/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...S.primaryBtn, textDecoration: "none", display: "block", textAlign: "center" }}
            >
              Enter colony →
            </a>

            <a
              href={`${EXPLORER}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", fontSize: 10, color: T3, marginTop: 12, textDecoration: "none" }}
            >
              View deploy tx ↗
            </a>

            <div style={{ borderTop: `1px solid ${BD}`, margin: "20px 0 12px" }} />

            <div style={{ fontSize: 9, color: T3, letterSpacing: "0.12em", marginBottom: 8 }}>
              TO ADD TO THE PUBLIC DIRECTORY
            </div>
            <div style={{
              background: "#060910", border: `1px solid ${BD}`,
              borderRadius: 4, padding: "10px 12px",
              fontSize: 10, color: T2, fontFamily: "monospace", lineHeight: 1.7,
              wordBreak: "break-all",
            }}>
              {`{ id: "${slug}", slug: "${slug}", address: "${colonyAddress}" }`}
            </div>
            <div style={{ fontSize: 9, color: T3, marginTop: 6 }}>
              Add this entry to <span style={{ color: T2 }}>src/data/colonies.js</span> to appear in the homepage directory.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
      <span style={{ fontSize: 10, color: T3 }}>{label}</span>
      <span style={{ fontSize: mono ? 10 : 11, color: T1, fontFamily: mono ? "monospace" : F }}>{value}</span>
    </div>
  );
}

const S = {
  section: { marginBottom: 20 },
  label: {
    display: "block", fontSize: 9, color: T3,
    letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8,
  },
  input: {
    width: "100%", padding: "11px 14px",
    background: BG2, border: `1px solid ${BD}`,
    borderRadius: 6, fontSize: 13, color: T1,
    fontFamily: F, outline: "none", boxSizing: "border-box",
  },
  card: {
    background: BG2, border: `1px solid ${BD}`,
    borderRadius: 6, padding: "16px 18px",
  },
  primaryBtn: {
    width: "100%", padding: "13px 16px",
    background: GOLD, color: BG0,
    border: "none", borderRadius: 6,
    fontSize: 12, fontFamily: F, fontWeight: 700,
    letterSpacing: "0.08em", cursor: "pointer",
  },
  ghostBtn: {
    width: "100%", padding: "11px 14px",
    background: "none", color: GOLD,
    border: `1px solid ${GOLD}`, borderRadius: 6,
    fontSize: 12, fontFamily: F, cursor: "pointer",
    letterSpacing: "0.04em", textAlign: "left",
  },
};
