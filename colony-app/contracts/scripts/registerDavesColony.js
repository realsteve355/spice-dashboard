const hre = require("hardhat");

const REGISTRY = "0x2c82B62Cf3b258D95a8b5bf4F2658D0D509C9FF8";
const COLONY   = "0xDc546810b73b499DB79a0DF2A662170660Bf3902";
const NAME     = "Dave's Colony";
const SLUG     = "daves-colony";

const ABI = [
  "function register(address colony, string name, string slug) external",
  "function slugToColony(string) view returns (address)",
];

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const registry = new hre.ethers.Contract(REGISTRY, ABI, signer);

  const existing = await registry.slugToColony(SLUG);
  if (existing !== hre.ethers.ZeroAddress) {
    console.log("Slug already registered at:", existing);
    return;
  }

  const tx = await registry.register(COLONY, NAME, SLUG);
  await tx.wait();
  console.log("✓ Registered:", SLUG, "→", COLONY);
}

main().catch(e => { console.error(e); process.exitCode = 1; });
