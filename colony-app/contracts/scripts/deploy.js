const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

/**
 * Full fresh deploy for a SPICE colony.
 *
 * Deploys the complete contract set in dependency order:
 *   Colony  (deploys GToken, SToken, VToken, OToken internally)
 *   CompanyImplementation  (template — deployed once)
 *   CompanyFactory         (clones CompanyImplementation per company)
 *   MCCBilling             (bill tracking)
 *   MCCServices            (service registry)
 *
 * After deployment:
 *   colony.setCompanyFactory(factory) is called to wire the factory in.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network baseSepolia
 *
 * Set COLONY_NAME and COLONY_TICKER in .env or edit the constants below.
 */

const COLONY_NAME   = "Dave's Colony";
const COLONY_TICKER = "DC";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "ETH\n");

  // ── 1. Colony ─────────────────────────────────────────────────────────────
  // Colony deploys GToken, SToken, VToken, OToken internally and issues the
  // MCC O-token (id=1) to the deployer as initial MCC chair.
  console.log(`Deploying Colony: "${COLONY_NAME}" (${COLONY_TICKER})…`);
  const ColonyFactory = await hre.ethers.getContractFactory("Colony");
  const colony = await ColonyFactory.deploy(COLONY_NAME, COLONY_TICKER, hre.ethers.ZeroAddress);
  await colony.waitForDeployment();
  const colonyAddr = await colony.getAddress();
  console.log("Colony:          ", colonyAddr);

  // Read sub-token addresses from the Colony contract
  const gTokenAddr = await colony.gToken();
  const sTokenAddr = await colony.sToken();
  const vTokenAddr = await colony.vToken();
  const oTokenAddr = await colony.oToken();
  console.log("GToken:          ", gTokenAddr);
  console.log("SToken:          ", sTokenAddr);
  console.log("VToken:          ", vTokenAddr);
  console.log("OToken:          ", oTokenAddr);

  // ── 2. CompanyImplementation ──────────────────────────────────────────────
  console.log("\nDeploying CompanyImplementation (template)…");
  const ImplFactory = await hre.ethers.getContractFactory("CompanyImplementation");
  const impl = await ImplFactory.deploy();
  await impl.waitForDeployment();
  const implAddr = await impl.getAddress();
  console.log("CompanyImpl:     ", implAddr);

  // ── 3. CompanyFactory ─────────────────────────────────────────────────────
  console.log("\nDeploying CompanyFactory…");
  const FactoryContract = await hre.ethers.getContractFactory("CompanyFactory");
  const factory = await FactoryContract.deploy(colonyAddr, oTokenAddr, implAddr);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("CompanyFactory:  ", factoryAddr);

  // Wire factory into Colony
  console.log("\nWiring factory into Colony…");
  const tx = await colony.setCompanyFactory(factoryAddr);
  await tx.wait();
  console.log("✓ colony.setCompanyFactory done");

  // ── 4. MCCBilling ─────────────────────────────────────────────────────────
  console.log("\nDeploying MCCBilling…");
  const BillingContract = await hre.ethers.getContractFactory("MCCBilling");
  const billing = await BillingContract.deploy(colonyAddr);
  await billing.waitForDeployment();
  const billingAddr = await billing.getAddress();
  console.log("MCCBilling:      ", billingAddr);

  // ── 5. MCCServices ────────────────────────────────────────────────────────
  console.log("\nDeploying MCCServices…");
  const ServicesContract = await hre.ethers.getContractFactory("MCCServices");
  const services = await ServicesContract.deploy(colonyAddr);
  await services.waitForDeployment();
  const servicesAddr = await services.getAddress();
  console.log("MCCServices:     ", servicesAddr);

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
  console.log("\n✓ Addresses written to src/data/contracts.json");
  console.log(JSON.stringify(addresses, null, 2));
  console.log("\nNext: run seedTestColony.js to populate citizens and test data.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
