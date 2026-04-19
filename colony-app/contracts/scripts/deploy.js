const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

/**
 * Full fresh deploy for a SPICE colony.
 *
 * Each contract is deployed separately so the Colony constructor stays trivial
 * and every contract is independently verifiable on Basescan.
 *
 * Deploy order:
 *   1.  GToken              — colony governance token (soulbound ERC-721)
 *   2.  SToken              — colony spending currency (ERC-20)
 *   3.  VToken              — long-term savings (ERC-20, non-transferable P2P)
 *   4.  Colony              — Fisc; token addresses wired in constructor
 *   5.  Ownership           — GToken/SToken/VToken ownership transferred to Colony
 *   6.  OToken              — organisation identity token (ERC-721, soulbound to org)
 *   7.  OToken wiring       — ownership → Colony; MCC O-token minted to deployer; setOToken()
 *   8.  CompanyImpl         — CompanyImplementation template (beacon target)
 *   9.  UpgradeableBeacon   — beacon owned by deployer; points at CompanyImpl
 *   10. CompanyFactory      — deploys BeaconProxy per org; wired to Colony + OToken + beacon
 *   11. Factory wiring      — colony.setCompanyFactory()
 *   12. AToken              — Fisc economic claims registry (equity, assets, obligations)
 *   13. AToken wiring       — colony.setAToken()
 *   14. MCCBilling          — monthly bill tracking
 *   15. MCCServices         — MCC service registry
 *
 * Upgrade path (future):
 *   Deploy new CompanyImplementation, then call:
 *     beacon.upgradeTo(newImplAddress)
 *   All organisation contracts upgrade simultaneously. No re-registration needed.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network baseSepolia
 */

const COLONY_NAME   = "Dave's Colony";
const COLONY_TICKER = "DC";

// ColonyRegistry — global protocol directory (0x7c95b0C0d38F... on Base Sepolia)
// Used in step 16 to register the new colony; failure is non-fatal.
const COLONY_REGISTRY = "0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68";
const REGISTRY_ABI = [
  "function register(address colony, string name, string slug) external",
  "function slugToColony(string) view returns (address)",
];

// Gas override — high enough to bump any stuck pending tx from a previous run
// Nonce is managed explicitly from the on-chain CONFIRMED state so we
// overwrite any stuck pending transactions from previous failed runs.
// 10 gwei is high enough to replace any default-gas pending txs on Base Sepolia.
// Explicit nonce management: start from confirmed (mined) nonce so we never
// collide with anything pending. Gas price is left to hardhat auto-detect
// (Base Sepolia base fee is ~0.001 gwei — very cheap).
let _nonce;

async function gasOpts() {
  return { nonce: _nonce++ };
}

async function deploy(name, ...args) {
  const Factory  = await hre.ethers.getContractFactory(name);
  const contract = await Factory.deploy(...args, await gasOpts());
  const receipt  = await contract.deploymentTransaction().wait(1);
  if (receipt.status === 0) throw new Error(`${name} deploy reverted`);

  const addr = receipt.contractAddress ?? await contract.getAddress();

  // On live networks pause briefly — load-balanced RPCs can lag behind writes
  if (!["hardhat","localhost"].includes(hre.network.name)) {
    await new Promise(r => setTimeout(r, 3000));
  }
  const code = await hre.ethers.provider.getCode(addr);
  if (code === "0x") throw new Error(`${name}: no code at ${addr} (tx ${receipt.hash})`);
  console.log(`${name.padEnd(24)} ${addr}  (${(code.length - 2) / 2} bytes)`);
  return { contract, addr };
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "ETH");

  // Start from confirmed (mined) nonce — overwrites any stuck pending txs
  _nonce = await hre.ethers.provider.getTransactionCount(deployer.address, "latest");
  console.log("Starting nonce (confirmed):", _nonce, "\n");

  // ── 1-3. Tokens ───────────────────────────────────────────────────────────
  console.log("── Tokens ──────────────────────────────────────────────────────");
  const { contract: gTokenC, addr: gTokenAddr } = await deploy("GToken", COLONY_NAME, COLONY_TICKER);
  const { contract: sTokenC, addr: sTokenAddr } = await deploy("SToken", COLONY_TICKER);
  const { contract: vTokenC, addr: vTokenAddr } = await deploy("VToken", COLONY_TICKER);

  // ── 4. Colony ─────────────────────────────────────────────────────────────
  console.log("\n── Colony ──────────────────────────────────────────────────────");
  const { contract: colonyC, addr: colonyAddr } = await deploy(
    "Colony",
    COLONY_NAME,
    hre.ethers.ZeroAddress,  // no ColonyRegistry
    gTokenAddr,
    sTokenAddr,
    vTokenAddr
  );

  // ── 5. Transfer token ownership to Colony ─────────────────────────────────
  console.log("\n── Token ownership → Colony ────────────────────────────────────");
  for (const [label, token] of [["GToken", gTokenC], ["SToken", sTokenC], ["VToken", vTokenC]]) {
    const tx = await token.transferOwnership(colonyAddr, await gasOpts());
    await tx.wait();
    console.log(`${label} ownership → Colony ✓`);
  }

  // ── 6. OToken ─────────────────────────────────────────────────────────────
  console.log("\n── OToken ──────────────────────────────────────────────────────");
  const { contract: oTokenC, addr: oTokenAddr } = await deploy("OToken", COLONY_NAME, colonyAddr);

  // ── 7. OToken wiring ──────────────────────────────────────────────────────
  console.log("\n── OToken wiring ───────────────────────────────────────────────");

  // Mint MCC O-token (id=1) to deployer as initial MCC chair (OrgType.MCC = 1)
  const mintTx = await oTokenC.mint(deployer.address, COLONY_NAME + " MCC", 1, await gasOpts());
  await mintTx.wait();
  console.log("MCC O-token minted to deployer ✓");

  // Transfer OToken ownership to Colony so it can mint company O-tokens
  const ownTx = await oTokenC.transferOwnership(colonyAddr, await gasOpts());
  await ownTx.wait();
  console.log("OToken ownership → Colony ✓");

  // Wire OToken address into Colony
  const setOTx = await colonyC.setOToken(oTokenAddr, await gasOpts());
  await setOTx.wait();
  console.log("colony.setOToken ✓");

  // ── 8-10. CompanyImplementation + Beacon + CompanyFactory ────────────────
  console.log("\n── Company contracts ───────────────────────────────────────────");
  const { addr: implAddr } = await deploy("CompanyImplementation");

  // Deploy UpgradeableBeacon — owned by deployer wallet.
  // To upgrade all organisations later: beacon.upgradeTo(newImplAddress)
  // Ownership can be transferred to a governance contract when ready.
  const { contract: beaconC, addr: beaconAddr } = await deploy(
    "UpgradeableBeacon",
    implAddr,
    deployer.address
  );

  const { contract: factoryC, addr: factoryAddr } = await deploy("CompanyFactory",
    colonyAddr,
    oTokenAddr,
    beaconAddr
  );

  // ── 11. Wire factory into Colony ──────────────────────────────────────────
  const setFTx = await colonyC.setCompanyFactory(factoryAddr, await gasOpts());
  await setFTx.wait();
  console.log("colony.setCompanyFactory ✓");

  // ── 12-13. AToken — Fisc economic claims registry ────────────────────────
  console.log("\n── AToken ──────────────────────────────────────────────────────");
  const { addr: aTokenAddr } = await deploy("AToken", colonyAddr);

  const setATx = await colonyC.setAToken(aTokenAddr, await gasOpts());
  await setATx.wait();
  console.log("colony.setAToken ✓");

  // ── 14-15. MCC contracts ─────────────────────────────────────────────────
  console.log("\n── MCC contracts ───────────────────────────────────────────────");
  const { addr: billingAddr  } = await deploy("MCCBilling",  colonyAddr);
  const { addr: servicesAddr } = await deploy("MCCServices", colonyAddr);

  // ── Write addresses ───────────────────────────────────────────────────────
  // Strip apostrophes before slugifying so "Dave's" → "daves" not "dave-s"
  const slug = COLONY_NAME.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Merge into existing contracts.json — preserves other colonies across redeploys
  const contractsPath = path.join(__dirname, "../../src/data/contracts.json");
  let existing = { network: hre.network.name, chainId: hre.network.config.chainId, colonies: {} };
  try { existing = JSON.parse(fs.readFileSync(contractsPath, "utf8")); } catch {}

  existing.network = hre.network.name;
  existing.chainId = hre.network.config.chainId;
  existing.colonies[slug] = {
    name:           COLONY_NAME,
    colony:         colonyAddr,
    gToken:         gTokenAddr,
    sToken:         sTokenAddr,
    vToken:         vTokenAddr,
    oToken:         oTokenAddr,
    aToken:         aTokenAddr,
    companyImpl:    implAddr,
    companyBeacon:  beaconAddr,
    companyFactory: factoryAddr,
    mccBilling:     billingAddr,
    mccServices:    servicesAddr,
  };

  fs.writeFileSync(contractsPath, JSON.stringify(existing, null, 2));
  console.log("\n✓ contracts.json updated (merged)");

  // Also write the main site's colonies.js — derived from contracts.json so they stay in sync.
  // This file is AUTO-GENERATED. Do not edit manually.
  const coloniesEntries = Object.entries(existing.colonies)
    .map(([id, cfg]) => `  { id: "${id}", slug: "${id}", address: "${cfg.colony}" },`)
    .join("\n");

  const coloniesJs =
`// AUTO-GENERATED by deploy.js — do not edit manually.
// Source of truth is colony-app/src/data/contracts.json.
// Re-run the deploy script to update after a fresh deploy.

export const COLONIES = [
${coloniesEntries}
];

export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const COLONY_APP_HOST  = "https://app.zpc.finance";
`;

  const coloniesPath = path.join(__dirname, "../../../src/data/colonies.js");
  fs.writeFileSync(coloniesPath, coloniesJs);
  console.log("✓ src/data/colonies.js updated");

  // ── 16. Register with ColonyRegistry (non-fatal) ─────────────────────────
  console.log("\n── ColonyRegistry ──────────────────────────────────────────────");
  try {
    const registry = new hre.ethers.Contract(COLONY_REGISTRY, REGISTRY_ABI, deployer);
    const existing_slug = await registry.slugToColony(slug);
    if (existing_slug !== hre.ethers.ZeroAddress) {
      console.log(`SKIP — slug "${slug}" already registered at ${existing_slug}`);
    } else {
      const regTx = await registry.register(colonyAddr, COLONY_NAME, slug, await gasOpts());
      await regTx.wait();
      console.log(`colony registered in ColonyRegistry as "${slug}" ✓`);
    }
  } catch (e) {
    console.warn("ColonyRegistry.register failed (non-fatal):", e.reason || e.shortMessage || e.message);
    console.warn("Register manually at spice.zpc.finance");
  }

  console.log("\n── Done ─────────────────────────────────────────────────────────");
  console.log(JSON.stringify(existing, null, 2));
  console.log("\nNext: update COLONY_ADDRESS etc in seedTestColony.js then re-run it.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
