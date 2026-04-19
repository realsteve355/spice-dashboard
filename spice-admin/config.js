// SPICE Protocol Admin — Configuration
// Edit this file only if you redeploy the ColonyRegistry contract.
// Wallet addresses (Registry Owner, Revenue Wallet) are stored on-chain
// and managed directly from the admin page — no editing needed here.
// ─────────────────────────────────────────────────────────────────────────────

window.SPICE_CONFIG = {

  // The ColonyRegistry smart contract on Base Sepolia.
  // Only update this if you run scripts/deployRegistry.js again.
  registry: "0x7c95b0C0d38F2c8a8d0af51014B778bbF1859c39",

  // Network — do not change
  chainId:  84532,
  chainHex: "0x14A34",
  rpc:      "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  app:      "https://app.zpc.finance",
};
