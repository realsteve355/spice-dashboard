/**
 * Deploy ColonyRegistry to Base Sepolia.
 *
 * Usage:
 *   npx hardhat run scripts/deployRegistry.js --network baseSepolia
 *
 * After deploy, copy the registry address into:
 *   src/pages/CreateColony.jsx  → COLONY_REGISTRY_ADDRESS constant
 *   colony-app/src/pages/Directory.jsx → REGISTRY_ADDRESS constant
 *   colony-app/src/App.jsx            → REGISTRY_ADDRESS constant (if reading on-chain)
 */
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "ETH");

  const protocolTreasury = deployer.address;   // use your own wallet initially
  const feePerTx         = hre.ethers.parseUnits("0.000001", "ether"); // 0.000001 ETH per send()

  console.log("\nProtocol treasury:", protocolTreasury);
  console.log("Fee per tx:       ", hre.ethers.formatEther(feePerTx), "ETH");

  const Registry = await hre.ethers.getContractFactory("ColonyRegistry");
  const registry = await Registry.deploy(protocolTreasury, feePerTx);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();

  console.log("\n✓ ColonyRegistry deployed:", registryAddr);
  console.log("\nNext steps:");
  console.log("  1. Copy this address into src/pages/CreateColony.jsx  (COLONY_REGISTRY_ADDRESS)");
  console.log("  2. Copy this address into colony-app/src/pages/Directory.jsx (REGISTRY_ADDRESS)");
  console.log("  3. Re-run npm run build in both projects");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
