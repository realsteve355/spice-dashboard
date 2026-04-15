/**
 * Clear stuck pending transactions from previous failed deploy runs.
 *
 * Sends a 0-ETH self-transfer at each stuck nonce with a high gas price,
 * replacing the pending transactions cheaply (21,000 gas each).
 *
 * Usage:
 *   npx hardhat run scripts/clearMempool.js --network baseSepolia
 */
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const addr = deployer.address;

  const confirmed = await hre.ethers.provider.getTransactionCount(addr, "latest");
  const pending   = await hre.ethers.provider.getTransactionCount(addr, "pending");

  console.log("Address:          ", addr);
  console.log("Confirmed nonce:  ", confirmed);
  console.log("Pending nonce:    ", pending);
  console.log("Stuck txs:        ", pending - confirmed);

  if (pending <= confirmed) {
    console.log("\nMempool is clean — nothing to clear.");
    return;
  }

  const balance = await hre.ethers.provider.getBalance(addr);
  console.log("Balance:          ", hre.ethers.formatEther(balance), "ETH\n");

  // 5 gwei × 21,000 gas = 0.000105 ETH per stuck tx
  const GAS_PRICE = 5_000_000_000n;

  for (let nonce = confirmed; nonce < pending; nonce++) {
    console.log(`Clearing nonce ${nonce}…`);
    const tx = await deployer.sendTransaction({
      to:                    addr,
      value:                 0n,
      nonce:                 nonce,
      gasLimit:              21_000n,
      maxFeePerGas:          GAS_PRICE,
      maxPriorityFeePerGas:  GAS_PRICE,
    });
    const receipt = await tx.wait(1);
    console.log(`  ✓ nonce ${nonce} cleared (tx ${receipt.hash.slice(0, 12)}…)`);
  }

  const newPending = await hre.ethers.provider.getTransactionCount(addr, "pending");
  console.log("\nDone. Pending nonce now:", newPending, "(should equal confirmed)");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
