const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const colonyAddr = "0x112240357669CC163011C729F0fE219A799838B5"; // Dave's Colony

  console.log("Deploying MCCBilling for Dave's Colony...");
  const MCCBilling = await hre.ethers.getContractFactory("MCCBilling");
  const billing    = await MCCBilling.deploy(colonyAddr);
  await billing.waitForDeployment();
  const billingAddr = await billing.getAddress();
  console.log("MCCBilling:", billingAddr);

  // Update contracts.json
  const outPath = path.join(__dirname, "../../src/data/contracts.json");
  const contracts = JSON.parse(fs.readFileSync(outPath));
  contracts.colonies["daves-colony"].mccBilling = billingAddr;
  fs.writeFileSync(outPath, JSON.stringify(contracts, null, 2));
  console.log("✓ contracts.json updated");
}

main().catch(e => { console.error(e); process.exitCode = 1; });
