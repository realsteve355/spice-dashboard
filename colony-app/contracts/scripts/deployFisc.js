/**
 * Deploy Fisc.sol for Dave's Colony (Base Sepolia).
 *
 * Initial parameters:
 *   fiscRate         = $0.75 per S/V token  (750_000 in 1e6)
 *   reserveUSDC      = $5,000 seed reserve  (5_000_000_000 in 1e6)
 *   totalVOutstanding = 0 at launch
 *   lrtRate          = 15%                  (1500 bps)
 *   breadBasketPriceS = 5 S-tokens per basket item
 *   ubiAmount        = 1000 S-tokens        (mirrors SToken.UBI_AMOUNT)
 *   periodEnd        = end of current calendar month (UTC)
 *
 * Usage:
 *   npx hardhat run scripts/deployFisc.js --network baseSepolia
 */

const hre = require("hardhat");

// Dave's Colony address
const COLONY_ADDRESS = "0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5";

function endOfMonthUTC() {
  const now = new Date();
  // Last moment of the last day of the current month (UTC)
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

  const params = {
    colony:             COLONY_ADDRESS,
    fiscRate:           750_000n,          // $0.75 per token (1e6)
    reserveUSDC:        5_000_000_000n,    // $5,000 (1e6)
    totalVOutstanding:  0n,                // no V in circulation yet
    lrtRate:            1500n,             // 15%
    breadBasketPriceS:  5n,               // 5 S-tokens per bread basket item
    ubiAmount:          1000n,             // 1000 S per citizen per period
    periodEnd:          BigInt(periodEnd),
  };

  console.log("\nDeploying Fisc with params:");
  console.log("  fiscRate:          $", Number(params.fiscRate) / 1e6, "per token");
  console.log("  reserveUSDC:       $", Number(params.reserveUSDC) / 1e6);
  console.log("  lrtRate:           ", Number(params.lrtRate) / 100, "%");
  console.log("  breadBasketPriceS: ", params.breadBasketPriceS.toString(), "S");
  console.log("  ubiAmount:         ", params.ubiAmount.toString(), "S");

  const Fisc = await hre.ethers.getContractFactory("Fisc");
  const fisc = await Fisc.deploy(
    params.colony,
    params.fiscRate,
    params.reserveUSDC,
    params.totalVOutstanding,
    params.lrtRate,
    params.breadBasketPriceS,
    params.ubiAmount,
    params.periodEnd,
  );

  await fisc.waitForDeployment();
  const fiscAddr = await fisc.getAddress();

  console.log("\n✓ Fisc deployed:", fiscAddr);

  // Verify initial state
  const snap = await fisc.snapshot();
  console.log("\nInitial snapshot:");
  console.log("  fiscRate:     $", Number(snap._fiscRate) / 1e6);
  console.log("  reserveUSDC:  $", Number(snap._reserveUSDC) / 1e6);
  console.log("  reserveRatio:", Number(snap._reserveRatio) / 1e4, "×");
  console.log("  reserveStatus:", snap._reserveStatus, "(2=healthy, 1=adequate, 0=alert)");
  console.log("  lrtRate:      ", Number(snap._lrtRate) / 100, "%");
  console.log("  breadBasket:  ", snap._breadBasketPriceS.toString(), "S");
  console.log("  ubiAmount:    ", snap._ubiAmount.toString(), "S");
  console.log("  daysLeft:     ", snap._daysLeft.toString(), "days");

  console.log("\n─────────────────────────────────────────────");
  console.log("Add this to colony-app-native/src/utils/contracts.js:");
  console.log(`  fisc: '${fiscAddr}',`);
  console.log("And to colony-app/src/data/contracts.json for Dave's Colony.");
  console.log("─────────────────────────────────────────────");
}

main().catch((e) => { console.error(e); process.exit(1); });
