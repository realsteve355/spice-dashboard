const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // ── Already deployed ─────────────────────────────────────────────────────
  const colonyAddr         = "0x5517dc693F5EbB226c1594b7bb441A10DBE95738";
  const gTokenAddr         = "0x222707CB09F9bDF860E4539D502d807077dcBba3";
  const sTokenAddr         = "0xD3aBA269caadDcB4503Bc1c3a4E3d07D105C1512";
  const vTokenAddr         = "0x5c9E9782716c36d42aFeEdDd5dfae3d07cbAfE0b";
  const governanceAddr     = "0xF7c8fa17e40c80fDfCD0b03b6E4Dc879c0Fb102F";
  const companyRegistryAddr = "0xf9c691994b60cbd6eb8c1fEDf869931e8CBf028d";
  console.log("Colony (existing):          ", colonyAddr);
  console.log("Governance (existing):      ", governanceAddr);
  console.log("CompanyRegistry (existing): ", companyRegistryAddr);

  // ── MCCServices ──────────────────────────────────────────────────────────
  console.log("\nDeploying MCCServices...");
  const MCCServices = await hre.ethers.getContractFactory("MCCServices");
  const mccServices = await MCCServices.deploy(colonyAddr);
  await mccServices.waitForDeployment();
  const mccServicesAddr = await mccServices.getAddress();
  console.log("MCCServices:     ", mccServicesAddr);

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
  console.log("\nAddresses written to src/data/contracts.json");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
