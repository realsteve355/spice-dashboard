// SPICE Protocol Admin — Configuration
// Edit this file only if you redeploy the ColonyRegistry contract.
// Wallet addresses (Registry Owner, Revenue Wallet) are stored on-chain
// and managed directly from the admin page — no editing needed here.
// ─────────────────────────────────────────────────────────────────────────────

window.SPICE_CONFIG = {

  // The ColonyRegistry smart contract on Base Sepolia.
  // Only update this if you run scripts/deployRegistry.js again.
  registry: "0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d",

  // Network — do not change
  chainId:  84532,
  chainHex: "0x14A34",
  rpc:      "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  app:      "https://app.zpc.finance",
};
