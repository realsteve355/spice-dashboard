const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // ── Already deployed ──────────────────────────────────────────────────────
  const colonyAddr          = "0xAf94f5Da9c9c6Fa8F6509ad9CA11620fC357107D";
  const gTokenAddr          = "0x763f35CEC6102158d62d08CF5f79Fa878661033e";
  const sTokenAddr          = "0xa22cEe9037c7d44C05D7d813fcac3354ED03E4F0";
  const vTokenAddr          = "0x7Dd96B966C70305325aD1EF033b392C4e65D4901";
  const governanceAddr      = "0x5c25Ce397ff22Cbb1E65F518Fe1Af849B6b0a242";
  const companyRegistryAddr = "0x96B3fF20277D0E7c4cd3B22153072C29B9256602";
  console.log("All previous contracts confirmed.");

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
