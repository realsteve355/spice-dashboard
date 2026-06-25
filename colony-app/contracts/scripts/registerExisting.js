/**
 * Retroactively register existing colonies with the ColonyRegistry.
 *
 * Usage:
 *   npx hardhat run scripts/registerExisting.js --network baseSepolia
 *
 * The signer must be the wallet that deployed the ColonyRegistry (the owner).
 * Each colony can only be registered once — re-running is safe (already-registered
 * colonies will fail silently and be skipped).
 */
const hre = require("hardhat");

const REGISTRY_ADDRESS = "0x5f7b7Bfe21204793Fc89e768313e45dFeA1bc417";

// Add any colony you want to retroactively register here.
// slug must be unique in the registry.
const COLONIES = [
  {
    address: "0x112240357669CC163011C729F0fE219A799838B5",
    name:    "Dave's Colony",
    slug:    "daves-colony",
  },
  // Add more here as needed:
  // { address: "0x...", name: "My Colony", slug: "my-colony" },
];

const REGISTRY_ABI = [
  "function register(address colony, string calldata name, string calldata slug) external",
  "function entries(address) view returns (address colony, string name, string slug, address founder, uint256 registeredAt)",
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Registering with wallet:", deployer.address);

  const registry = new hre.ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, deployer);

  for (const colony of COLONIES) {
    // Check if already registered
    const existing = await registry.entries(colony.address);
    if (existing.colony !== hre.ethers.ZeroAddress) {
      console.log(`  SKIP  ${colony.slug} — already registered`);
      continue;
    }

    process.stdout.write(`  REG   ${colony.slug} (${colony.address.slice(0,10)}…) … `);
    try {
      const tx = await registry.register(colony.address, colony.name, colony.slug);
      await tx.wait();
      console.log("✓");
    } catch (e) {
      console.log("FAILED:", e.reason || e.shortMessage || e.message?.slice(0, 80));
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
