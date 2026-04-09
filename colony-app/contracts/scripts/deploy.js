const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Colony already deployed — attach to existing address
  const colonyAddr = "0x7190c7A1B8E6F63e92269351e4a7457A1A3B252b";
  console.log("\nAttaching to Colony:", colonyAddr);
  const Colony = await hre.ethers.getContractFactory("Colony");
  const colony = Colony.attach(colonyAddr);

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
