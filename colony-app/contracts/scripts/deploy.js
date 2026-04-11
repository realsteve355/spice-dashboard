const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // ── Already deployed ──────────────────────────────────────────────────────
  const colonyAddr          = "0x112240357669CC163011C729F0fE219A799838B5";
  const gTokenAddr          = "0x50568a432E91a85161FFDdE8dA9dFe333Ed73a5f";
  const sTokenAddr          = "0xbEb225D184dD27Df728EE2871a8207F91ead32e4";
  const vTokenAddr          = "0xcdf651d4EE8f0FFD6f8cb857bFB8bF4FC721DEF1";
  const governanceAddr      = "0xC60c72dc36Fe422E747C5A76ac76164fE3beB705";
  const companyRegistryAddr = "0x92d8F29F07889434559c9D9ab9EBc9444365FC94";

  console.log("Colony:          ", colonyAddr);
  console.log("GToken:          ", gTokenAddr);
  console.log("SToken:          ", sTokenAddr);
  console.log("VToken:          ", vTokenAddr);
  console.log("Governance:      ", governanceAddr);
  console.log("CompanyRegistry: ", companyRegistryAddr);

  // ── MCCServices ──────────────────────────────────────────────────────────
  console.log("\nDeploying MCCServices...");
  const MCCServices = await hre.ethers.getContractFactory("MCCServices");
  const mccServices = await MCCServices.deploy(colonyAddr);
  await mccServices.waitForDeployment();
  const mccServicesAddr = await mccServices.getAddress();
  console.log("MCCServices:", mccServicesAddr);

  // ── Write addresses ───────────────────────────────────────────────────────
  const addresses = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    colonies: {
      "daves-colony": {
        name:            "Dave's Colony",
        colony:          colonyAddr,
        gToken:          gTokenAddr,
        sToken:          sTokenAddr,
        vToken:          vTokenAddr,
        governance:      governanceAddr,
        companyRegistry: companyRegistryAddr,
        mccServices:     mccServicesAddr,
      }
    }
  };

  const outPath = path.join(__dirname, "../../src/data/contracts.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\n✓ Addresses written to src/data/contracts.json");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
