// Colony registry — one entry per deployed colony.
// Slug must match the colony-app route (/colony/:slug).
// Address is the Colony.sol deployment on Base Sepolia.

export const COLONIES = [
  {
    id:      "daves-colony",
    slug:    "daves-colony",
    address: "0x112240357669CC163011C729F0fE219A799838B5",
  },
];

export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const COLONY_APP_HOST  = "https://app.zpc.finance";
