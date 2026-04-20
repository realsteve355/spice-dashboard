/**
 * Redeploy the Governance contract for an existing colony without touching
 * any other contracts. Use after Governance.sol changes.
 *
 * What this script does:
 *   1. Deploys a fresh Governance.sol pointing at the existing Colony
 *   2. Calls colony.setGovernance(newGovAddr) to wire it up
 *   3. Prints the new address — update contracts.json manually
 *
 * Usage:
 *   npx hardhat run scripts/redeployGovernance.js --network baseSepolia
 *
 * The signer must be the colony founder.
 */
const hre = require("hardhat");

// ── Config ────────────────────────────────────────────────────────────────────
const COLONY_ADDRESS = "0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5";

// Initial MCC role holders — use deployer address (founder holds all three on deploy)

// Colony ABI (only what we need)
const COLONY_ABI = [
  "function setGovernance(address) external",
  "function founder() view returns (address)",
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const colony = new hre.ethers.Contract(COLONY_ADDRESS, COLONY_ABI, deployer);
  const founder = await colony.founder();
  console.log("Colony founder:", founder);

  if (deployer.address.toLowerCase() !== founder.toLowerCase()) {
    throw new Error("Signer is not the colony founder — setGovernance will revert");
  }

  // 1. Deploy new Governance (founder holds all three MCC roles initially)
  process.stdout.write("Deploying Governance… ");
  const Governance = await hre.ethers.getContractFactory("Governance");
  const gov = await Governance.deploy(COLONY_ADDRESS, deployer.address, deployer.address, deployer.address, { gasLimit: 3000000n, maxFeePerGas: 10000000n });
  await gov.waitForDeployment();
  const govAddr = await gov.getAddress();
  console.log("✓", govAddr);

  // 2. Wire to colony
  process.stdout.write("Wiring colony.setGovernance… ");
  const tx = await colony.setGovernance(govAddr, { gasLimit: 100000n, maxFeePerGas: 10000000n });
  await tx.wait();
  console.log("✓");

  console.log("\n=== Done ===");
  console.log("New Governance address:", govAddr);
  console.log("\nUpdate colony-app/src/data/contracts.json:");
  console.log(`  "governance": "${govAddr}"`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
