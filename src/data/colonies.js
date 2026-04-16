// Colony registry — one entry per deployed colony.
// Slug must match the colony-app route (/colony/:slug).
// Address is the Colony.sol deployment on Base Sepolia.

export const COLONIES = [
  {
    id:      "dave-s-colony",
    slug:    "dave-s-colony",
    address: "0xa4bCadeE7263AE5a26D921fD39453699B5D20A8b",
  },
  {
    id:      "steves-first-colony",
    slug:    "steves-first-colony",
    address: "0xdAfA3B61A9061F3C28b67C43e8beAb67d3c4c75F",
  },
];

export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const COLONY_APP_HOST  = "https://app.zpc.finance";
