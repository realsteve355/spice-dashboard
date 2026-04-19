/**
 * Deregister an old colony address and register a new one with the same slug.
 * Use after redeploying a colony contract (e.g. after contract upgrades).
 *
 * Usage:
 *   npx hardhat run scripts/reregisterColony.js --network baseSepolia
 *
 * The signer must be the registry owner.
 */
const hre = require("hardhat");

const REGISTRY_ADDRESS = "0x9B8Eee5C078166d1b89A38Dae774773C89e53B9a";

const OLD_COLONY = "0x17FD0a408cFE22481B5Ea5C045F3495D5E277D36";
const NEW_COLONY = "0x66A14e119c079d1df18eC01c20f07634044b72Ab";
const NAME       = "Dave's Colony";
const SLUG       = "daves-colony";

const ABI = [
  "function register(address colony, string calldata name, string calldata slug) external",
  "function deregister(address colony) external",
  "function entries(address) view returns (address colony, string name, string slug, address founder, uint256 registeredAt, uint256 tokenId)",
  "function slugToColony(string) view returns (address)",
  "function deregistered(address) view returns (bool)",
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Caller:", deployer.address);

  const registry = new hre.ethers.Contract(REGISTRY_ADDRESS, ABI, deployer);

  // 1. Deregister old colony (frees slug)
  const oldEntry = await registry.entries(OLD_COLONY);
  const alreadyDereg = await registry.deregistered(OLD_COLONY);

  if (oldEntry.colony === hre.ethers.ZeroAddress) {
    console.log("OLD colony not registered — skipping deregister");
  } else if (alreadyDereg) {
    console.log("OLD colony already deregistered — slug should be free");
  } else {
    process.stdout.write(`Deregistering ${OLD_COLONY.slice(0,10)}… … `);
    const tx1 = await registry.deregister(OLD_COLONY);
    await tx1.wait();
    console.log("✓ deregistered");
  }

  // 2. Register new colony
  const newEntry = await registry.entries(NEW_COLONY);
  if (newEntry.colony !== hre.ethers.ZeroAddress) {
    console.log(`NEW colony already registered as slug "${newEntry.slug}" — done`);
    return;
  }

  const slugOwner = await registry.slugToColony(SLUG);
  if (slugOwner !== hre.ethers.ZeroAddress) {
    console.error(`Slug "${SLUG}" still taken by ${slugOwner} — cannot register`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`Registering ${NEW_COLONY.slice(0,10)}… as "${SLUG}" … `);
  const tx2 = await registry.register(NEW_COLONY, NAME, SLUG);
  await tx2.wait();
  console.log("✓ registered");

  console.log("\nDone. Slug 'daves-colony' now points to", NEW_COLONY);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
