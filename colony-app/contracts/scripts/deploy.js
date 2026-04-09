const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy Dave's Colony
  console.log("\nDeploying Colony: Dave's Colony...");
  const Colony = await hre.ethers.getContractFactory("Colony");
  const colony = await Colony.deploy("Dave's Colony");
  await colony.waitForDeployment();
  const colonyAddr = await colony.getAddress();
  console.log("Colony deployed to:", colonyAddr);

  // Wait for confirmations before reading state
  console.log("Waiting for confirmations...");
  await colony.deploymentTransaction().wait(3);

  // Read sub-contract addresses
  const gTokenAddr  = await colony.gToken();
  const sTokenAddr  = await colony.sToken();
  const vTokenAddr  = await colony.vToken();

  console.log("GToken:", gTokenAddr);
  console.log("SToken:", sTokenAddr);
  console.log("VToken:", vTokenAddr);

  // Write addresses to a JSON file the React app can import
  const addresses = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    colonies: {
      "daves-colony": {
        name: "Dave's Colony",
        colony:  colonyAddr,
        gToken:  gTokenAddr,
        sToken:  sTokenAddr,
        vToken:  vTokenAddr,
      }
    }
  };

  const outPath = path.join(__dirname, "../../src/data/contracts.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\nAddresses written to src/data/contracts.json");
  console.log("\nDone. Add this colony address to your app config:");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
