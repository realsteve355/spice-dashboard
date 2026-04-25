/**
 * Deploy Fisc.sol for Dave's Colony (Base Sepolia).
 *
 * Initial parameters (matching published budget v1):
 *   fiscRate         = $0.75/token   (750_000 × 1e6)
 *   reserveUSDC      = $5,000        (5_000_000_000 × 1e6)
 *   totalVOutstanding = 0
 *   lrtRate          = 15%           (1500 bps)
 *   breadBasketPriceS = 5 S/item
 *   ubiAmount        = 935 S         (matches published budget total)
 *   periodEnd        = end of current calendar month (UTC)
 *
 * Usage:
 *   npx hardhat run scripts/deployFisc.js --network baseSepolia
 */

const hre = require("hardhat");

const COLONY_ADDRESS = "0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5";

function endOfMonthUTC() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
  return Math.floor(end.getTime() / 1000);
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance: ", hre.ethers.formatEther(balance), "ETH");

  const periodEnd = endOfMonthUTC();
  console.log("Period end:", new Date(periodEnd * 1000).toISOString());

  const Fisc  = await hre.ethers.getContractFactory("Fisc");
  const fisc  = await Fisc.deploy(
    COLONY_ADDRESS,
    750_000n,         // fiscRate $0.75 (1e6)
    5_000_000_000n,   // reserveUSDC $5,000 (1e6)
    0n,               // totalVOutstanding
    1500n,            // lrtRate 15%
    5n,               // breadBasketPriceS
    935n,             // ubiAmount — matches published budget total
    BigInt(periodEnd),
  );

  await fisc.waitForDeployment();
  const fiscAddr = await fisc.getAddress();
  console.log("\n✓ Fisc deployed:", fiscAddr);

  // Verify
  const rate   = await fisc.fiscRate();
  const ubi    = await fisc.ubiAmount();
  const lrt    = await fisc.lrtRate();
  const days   = await fisc.daysUntilPeriodEnd();
  console.log(`  fiscRate:  $${Number(rate)/1e6}`);
  console.log(`  ubiAmount: ${ubi} S`);
  console.log(`  lrtRate:   ${Number(lrt)/100}%`);
  console.log(`  daysLeft:  ${days}`);

  console.log("\n─────────────────────────────────────────────");
  console.log("Update contracts.json fisc address to:", fiscAddr);
  console.log("─────────────────────────────────────────────");
}

main().catch((e) => { console.error(e); process.exit(1); });
