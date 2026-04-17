// Fallback colony list — shown while the registry is loading or if it fails.
// The home page fetches the live list from ColonyRegistry on mount and updates dynamically.

export const COLONIES = [
  { id: "dave-s-colony",    slug: "dave-s-colony",    address: "0xa4bCadeE7263AE5a26D921fD39453699B5D20A8b" },
  { id: "hitchin-colony",   slug: "hitchin-colony",   address: "0x73772BfF073f6a5F7b6Ba68d5105Db4870D9cE0C" },
  { id: "steves-4th-colony",slug: "steves-4th-colony",address: "0x23D92F9F6804b5Ae868aEec14DB0Ac93590dFAe1" },
  { id: "walkern-colony",   slug: "walkern-colony",   address: "0x9aA6d1D450319c4B4d04A17d7E185084b8772bdE" },
];

export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const COLONY_APP_HOST  = "https://app.zpc.finance";
