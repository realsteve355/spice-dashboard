/**
 * Seed Dave's Colony with test citizens, companies, and transactions.
 *
 * Usage:
 *   npx hardhat run scripts/seedTestColony.js --network baseSepolia
 *
 * The script signer (from .env PRIVATE_KEY) must be Steve — the colony founder.
 * All other citizens must have already joined manually, OR will be joined here
 * if their private keys are available. Since we only have Steve's key, this
 * script does everything Steve's wallet CAN do:
 *   - Claim UBI for Steve
 *   - Register companies under Steve's wallet
 *   - Send S-tokens to the other citizen wallets
 *   - Set MCC bills for each citizen
 *   - Advance the epoch (founder-only)
 *
 * The other citizens (Brian, Carla, Emily, Jay) must join manually via the app
 * at app.zpc.finance/colony/daves-colony — this gives them their G-token and
 * first UBI. Once joined, re-run this script to send them tokens and set bills.
 */
const hre = require("hardhat");

// ── Addresses ──────────────────────────────────────────────────────────────────
const COLONY_ADDRESS   = "0x112240357669CC163011C729F0fE219A799838B5";
const BILLING_ADDRESS  = "0x8B2dD9D2C35e59FDfED6071056AEE66AC11D19Cb";
const SERVICES_ADDRESS = "0x1d7Abc42621729807d2Dfb6Fc6a60D50B79A45c4";
const COMPANY_REG      = "0x92d8F29F07889434559c9D9ab9EBc9444365FC94";

const CITIZENS = {
  Steve: "0x92378C9b6e556C695F91eB6675E142d7114C43BC",
  Brian: "0x0819d9c4b6f2E412c69604930EAdaD633192c76A",
  Carla: "0xE0135583Df71C2ba5ba8ee00dFd2358bFDaC66B1",
  Emily: "0x2BdF90d490C6B61ed93e1F8E0913A5f44c9E3958",
  Jay:   "0xBDcD197bC460032Cfd9DdB00E9eF3f04ddf898cb",
};

// ── ABIs ───────────────────────────────────────────────────────────────────────
const COLONY_ABI = [
  "function isCitizen(address) view returns (bool)",
  "function citizenName(address) view returns (string)",
  "function claimUbi() external",
  "function send(address, uint256, string) external",
  "function advanceEpoch() external",
  "function sToken() view returns (address)",
];

const STOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
];

const SERVICES_ABI = [
  "function addService(string, string, uint256) external",
  "function getServices() view returns (tuple(uint256 id, string name, string billingBasis, uint256 priceS, bool active)[])",
];

const BILLING_ABI = [
  "function setBill(address, uint256, uint256) external",
  "function getBill(address) view returns (tuple(uint256 serviceId, uint256 amountS, bool paid, uint256 month))",
];

const COMPANY_ABI = [
  "function registerCompany(string, address[], uint256[]) external returns (uint256)",
  "function getCompaniesByOwner(address) view returns (uint256[])",
];

const S = (n) => hre.ethers.parseUnits(String(n), 18);

async function main() {
  const [steve] = await hre.ethers.getSigners();
  console.log("Seeding with wallet:", steve.address);
  console.log("─".repeat(60));

  const colony   = new hre.ethers.Contract(COLONY_ADDRESS,   COLONY_ABI,   steve);
  const services = new hre.ethers.Contract(SERVICES_ADDRESS, SERVICES_ABI, steve);
  const billing  = new hre.ethers.Contract(BILLING_ADDRESS,  BILLING_ABI,  steve);
  const compReg  = new hre.ethers.Contract(COMPANY_REG,      COMPANY_ABI,  steve);

  const sTokenAddr = await colony.sToken();
  const sToken = new hre.ethers.Contract(sTokenAddr, STOKEN_ABI, steve);

  // ── 1. Check citizen status ────────────────────────────────────────────────
  console.log("\n1. Citizen status:");
  for (const [name, addr] of Object.entries(CITIZENS)) {
    const joined = await colony.isCitizen(addr);
    const bal    = await sToken.balanceOf(addr);
    console.log(`   ${name.padEnd(6)} ${addr.slice(0,10)}…  citizen=${joined}  balance=${hre.ethers.formatUnits(bal,18)} S`);
  }

  // ── 2. Claim UBI for Steve ─────────────────────────────────────────────────
  console.log("\n2. Claiming UBI for Steve…");
  try {
    const tx = await colony.claimUbi();
    await tx.wait();
    console.log("   ✓ UBI claimed");
  } catch (e) {
    console.log("   SKIP:", e.reason || e.shortMessage || "already claimed this epoch");
  }

  // ── 3. Send S-tokens to each citizen ──────────────────────────────────────
  console.log("\n3. Sending S-tokens to citizens (200 S each)…");
  for (const [name, addr] of Object.entries(CITIZENS)) {
    if (addr === CITIZENS.Steve) continue;
    const isCit = await colony.isCitizen(addr);
    if (!isCit) {
      console.log(`   SKIP ${name} — not yet a citizen (join via app first)`);
      continue;
    }
    try {
      const tx = await colony.send(addr, S(200), `Welcome payment to ${name}`);
      await tx.wait();
      console.log(`   ✓ Sent 200 S to ${name}`);
    } catch (e) {
      console.log(`   FAIL ${name}:`, e.reason || e.shortMessage);
    }
  }

  // ── 4. Add MCC services (skip if already exist) ───────────────────────────
  console.log("\n4. Setting up MCC services…");
  let existingServices = [];
  try {
    existingServices = await services.getServices();
  } catch {}

  const SERVICE_DEFS = [
    { name: "Infrastructure",    basis: "per month",  price: 50  },
    { name: "Water & Sanitation", basis: "per month", price: 80  },
    { name: "Education Levy",    basis: "per month",  price: 40  },
    { name: "Broadband",         basis: "per month",  price: 30  },
  ];

  if (existingServices.length >= SERVICE_DEFS.length) {
    console.log(`   SKIP — ${existingServices.length} services already configured`);
  } else {
    for (const svc of SERVICE_DEFS) {
      try {
        const tx = await services.addService(svc.name, svc.basis, S(svc.price));
        await tx.wait();
        console.log(`   ✓ Added service: ${svc.name} (${svc.price} S/month)`);
      } catch (e) {
        console.log(`   SKIP ${svc.name}:`, e.reason || e.shortMessage);
      }
    }
  }

  // ── 5. Set MCC bills for joined citizens ──────────────────────────────────
  console.log("\n5. Setting MCC bills…");
  const BILLS = {
    Steve: 120,
    Brian: 95,
    Carla: 110,
    Emily: 85,
    Jay:   100,
  };
  for (const [name, addr] of Object.entries(CITIZENS)) {
    const isCit = await colony.isCitizen(addr);
    if (!isCit) {
      console.log(`   SKIP ${name} — not yet a citizen`);
      continue;
    }
    try {
      const tx = await billing.setBill(addr, S(BILLS[name]), 1);
      await tx.wait();
      console.log(`   ✓ Bill set for ${name}: ${BILLS[name]} S`);
    } catch (e) {
      console.log(`   FAIL ${name}:`, e.reason || e.shortMessage);
    }
  }

  // ── 6. Register test companies ────────────────────────────────────────────
  console.log("\n6. Registering test companies…");
  let existingCos = [];
  try {
    existingCos = await compReg.getCompaniesByOwner(steve.address);
  } catch {}

  const COMPANIES = [
    { name: "Dave's Coffee",    founders: [CITIZENS.Steve], stakes: [100] },
    { name: "Colony Bakery",    founders: [CITIZENS.Steve], stakes: [100] },
    { name: "Solar Co-op",      founders: [CITIZENS.Steve], stakes: [100] },
  ];

  if (existingCos.length >= COMPANIES.length) {
    console.log(`   SKIP — ${existingCos.length} companies already registered`);
  } else {
    for (const co of COMPANIES) {
      try {
        const tx = await compReg.registerCompany(co.name, co.founders, co.stakes);
        await tx.wait();
        console.log(`   ✓ Registered: ${co.name}`);
      } catch (e) {
        console.log(`   SKIP ${co.name}:`, e.reason || e.shortMessage);
      }
    }
  }

  // ── 7. Summary ────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("Done. Balances after seeding:");
  for (const [name, addr] of Object.entries(CITIZENS)) {
    const bal = await sToken.balanceOf(addr);
    console.log(`   ${name.padEnd(6)} ${hre.ethers.formatUnits(bal, 18)} S`);
  }
  console.log("\nNext steps:");
  console.log("  • Any citizen not yet joined: visit app.zpc.finance/colony/daves-colony");
  console.log("  • Re-run this script after they join to send them tokens + set bills");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
