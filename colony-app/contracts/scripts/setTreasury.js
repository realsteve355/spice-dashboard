/**
 * Set the protocol treasury address on the ColonyRegistry.
 * Run this script when you want to redirect fee settlements to a new wallet.
 *
 * Usage:
 *   TREASURY=0xYourNewWallet npx hardhat run scripts/setTreasury.js --network baseSepolia
 *
 * Or edit NEW_TREASURY below directly.
 */
const hre = require("hardhat");

const REGISTRY_ADDRESS = "0x7c95b0C0d38F2c8a8d0af51014B778bbF1859c39";
const NEW_TREASURY     = process.env.TREASURY || "0x15b22a3C4b321237fe53E350214A032b2289501B";

const ABI = [
  "function setTreasury(address) external",
  "function protocolTreasury() view returns (address)",
];

async function main() {
  if (NEW_TREASURY === "0x0000000000000000000000000000000000000000") {
    console.error("Error: set TREASURY env var or edit NEW_TREASURY in this script.");
    process.exitCode = 1;
    return;
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Caller:       ", deployer.address);
  console.log("New treasury: ", NEW_TREASURY);

  const registry = new hre.ethers.Contract(REGISTRY_ADDRESS, ABI, deployer);
  const current  = await registry.protocolTreasury();
  console.log("Current treasury:", current);

  const tx = await registry.setTreasury(NEW_TREASURY);
  await tx.wait();
  console.log("✓ Treasury updated to:", NEW_TREASURY);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
