// SPICE Protocol Admin — Configuration
// Edit this file when addresses change, then push to redeploy.
// ─────────────────────────────────────────────────────────────────────────────

window.SPICE_CONFIG = {

  // ── Contracts ───────────────────────────────────────────────────────────────
  // The ColonyRegistry smart contract on Base Sepolia.
  // Update this if you redeploy ColonyRegistry, then push this file.
  registry: "0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d",

  // ── Wallets ─────────────────────────────────────────────────────────────────
  // The wallet that deployed the ColonyRegistry (i.e. the owner).
  // This is the ONLY wallet that can make changes on the admin page.
  // To sign in: click "Sign in" and select this account in MetaMask.
  registryOwner: "0x92378C9b6e556C695F91eB6675E142d7114C43BC",

  // The wallet that receives ETH fee settlements from colonies.
  // Read-only on this page — displayed for reference only.
  // To change it, run from colony-app/contracts/:
  //   set TREASURY=0xNewAddress && npx hardhat run scripts/setTreasury.js --network baseSepolia
  // Then update revenueWallet here to match.
  revenueWallet: "0x15b22a3C4b321237fe53E350214A032b2289501B",

  // ── Network ─────────────────────────────────────────────────────────────────
  chainId:  84532,
  chainHex: "0x14A34",
  rpc:      "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  app:      "https://app.zpc.finance",
};
