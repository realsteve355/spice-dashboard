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
 *   1.  GToken          — colony governance token (soulbound ERC-721)
 *   2.  SToken          — colony spending currency (ERC-20)
 *   3.  VToken          — long-term savings (ERC-20, non-transferable P2P)
 *   4.  Colony          — Fisc; token addresses wired in constructor
 *   5.  Ownership       — GToken/SToken/VToken ownership transferred to Colony
 *   6.  OToken          — organisation identity token (ERC-721)
 *   7.  OToken wiring   — ownership → Colony; MCC O-token minted; setOToken()
 *   8.  CompanyImpl     — CompanyImplementation clone template
 *   9.  CompanyFactory  — deploys company clones, wired to Colony + OToken
 *   10. Factory wiring  — colony.setCompanyFactory()
 *   11. MCCBilling      — monthly bill tracking
 *   12. MCCServices     — MCC service registry
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network baseSepolia
 */

const COLONY_NAME   = "Dave's Colony";
const COLONY_TICKER = "DC";

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

  // ── 8-9. CompanyImplementation + CompanyFactory ───────────────────────────
  console.log("\n── Company contracts ───────────────────────────────────────────");
  const { addr: implAddr }    = await deploy("CompanyImplementation");
  const { contract: factoryC, addr: factoryAddr } = await deploy("CompanyFactory",
    colonyAddr,
    oTokenAddr,
    implAddr
  );

  // ── 10. Wire factory into Colony ──────────────────────────────────────────
  const setFTx = await colonyC.setCompanyFactory(factoryAddr, await gasOpts());
  await setFTx.wait();
  console.log("colony.setCompanyFactory ✓");

  // ── 11-12. MCC contracts ──────────────────────────────────────────────────
  console.log("\n── MCC contracts ───────────────────────────────────────────────");
  const { addr: billingAddr  } = await deploy("MCCBilling",  colonyAddr);
  const { addr: servicesAddr } = await deploy("MCCServices", colonyAddr);

  // ── Write addresses ───────────────────────────────────────────────────────
  const slug = COLONY_NAME.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const addresses = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    colonies: {
      [slug]: {
        name:           COLONY_NAME,
        colony:         colonyAddr,
        gToken:         gTokenAddr,
        sToken:         sTokenAddr,
        vToken:         vTokenAddr,
        oToken:         oTokenAddr,
        companyImpl:    implAddr,
        companyFactory: factoryAddr,
        mccBilling:     billingAddr,
        mccServices:    servicesAddr,
      }
    }
  };

  const outPath = path.join(__dirname, "../../src/data/contracts.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));

  console.log("\n── Done ─────────────────────────────────────────────────────────");
  console.log(JSON.stringify(addresses, null, 2));
  console.log("\n✓ Addresses written to src/data/contracts.json");
  console.log("Next: update COLONY_ADDRESS etc in seedTestColony.js then re-run it.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
