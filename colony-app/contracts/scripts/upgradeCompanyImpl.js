/**
 * upgradeCompanyImpl.js
 *
 * Deploys a new CompanyImplementation and points the UpgradeableBeacon at it.
 * All existing BeaconProxy companies instantly get the new implementation.
 *
 * Usage:
 *   npx hardhat run scripts/upgradeCompanyImpl.js --network base-sepolia
 */

const BEACON_ADDRESS = "0x1bcacD3007AE3058575E8c35073127F1b1B5bF3C"

const BEACON_ABI = [
  "function implementation() view returns (address)",
  "function upgradeTo(address newImplementation) external",
]

async function gasOpts() {
  return { maxFeePerGas: 10000000n, maxPriorityFeePerGas: 5000000n }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  console.log("Deployer:", deployer.address)

  // 1. Deploy new CompanyImplementation
  console.log("\nDeploying new CompanyImplementation…")
  const Factory = await hre.ethers.getContractFactory("CompanyImplementation")
  const impl    = await Factory.deploy(await gasOpts())
  await impl.waitForDeployment()
  const implAddr = await impl.getAddress()
  console.log("New implementation:", implAddr)

  // 2. Point beacon at new implementation
  const beacon = new hre.ethers.Contract(BEACON_ADDRESS, BEACON_ABI, deployer)
  console.log("\nUpgrading beacon…")
  const tx = await beacon.upgradeTo(implAddr, await gasOpts())
  await tx.wait()
  console.log("Beacon upgraded ✓")

  // 3. Verify
  const current = await beacon.implementation()
  console.log("Beacon now points to:", current)
  console.log(current.toLowerCase() === implAddr.toLowerCase() ? "✓ Confirmed" : "✗ Mismatch!")
}

main().catch(e => { console.error(e); process.exit(1) })
