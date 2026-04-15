# SPICE Colony — Technical Architecture

*app.zpc.finance · Base Sepolia testnet · April 2026*

---

## 1. System Overview

The SPICE Colony app is a decentralised community economic system. Citizens hold
tokens, spend with companies, save in V-tokens, and govern the MCC — all on-chain.
The frontend is a React SPA. All financial state lives on-chain. Off-chain infrastructure
is limited to Vercel hosting and a Supabase activity log.

```
Browser (React SPA — app.zpc.finance)
    │
    ├── MetaMask (wallet, transaction signing)
    │       └── Base Sepolia RPC (https://base-sepolia-rpc.publicnode.com)
    │
    ├── Vercel CDN (static hosting + serverless functions)
    │       └── /api/log  →  Supabase (activity_log table)
    │
    └── PublicNode RPC (read-only event queries — getLogs)
```

---

## 2. Repository Structure

```
spice-dashboard/                  # Root — main SPICE research site (zpc.finance / spice.zpc.finance)
│   src/                          # React pages: Home, Collision, Simulation, etc.
│   public/                       # Static assets, spice-methodology.html
│   api/                          # Vercel serverless functions for main site
│   │   ├── fred.js               # FRED API proxy
│   │   ├── economy-overview.js   # AI economic summary
│   │   └── log.js                # Activity log proxy (CORS issues — see colony-app/api/log.js)
│   vercel.json                   # Main site routing + CORS headers
│
└── colony-app/                   # Colony app (app.zpc.finance)
    ├── src/
    │   ├── App.jsx               # Router, WalletCtx, on-chain data loader
    │   ├── pages/
    │   │   ├── Directory.jsx     # Colony list (on-chain + localStorage)
    │   │   ├── ColonyPage.jsx    # Public colony page + join flow + company directory
    │   │   ├── Dashboard.jsx     # Citizen dashboard — balances, tx history, actions
    │   │   ├── Admin.jsx         # MCC admin — services, citizens, billing
    │   │   ├── Company.jsx       # Company page — overview, equity, accounts (double-entry)
    │   │   ├── RegisterCompany.jsx  # Deploy new company via CompanyFactory
    │   │   ├── Votes.jsx         # Governance proposals and voting
    │   │   ├── Profile.jsx       # Citizen profile — V batches, inheritance
    │   │   ├── Guardian.jsx      # Guardian view for minor wallets
    │   │   ├── RequestPayment.jsx   # QR code payment request generator
    │   │   ├── PaymentConfirm.jsx   # Payment confirmation + Colony.send()
    │   │   └── CreateColony.jsx  # Deploy new colony via ColonyFactory
    │   ├── components/
    │   │   ├── Layout.jsx        # Shell: header, back button, nav
    │   │   └── SendSheet.jsx     # Reusable send S-tokens inline form
    │   ├── utils/
    │   │   └── logger.js         # Fire-and-forget activity logger → /api/log
    │   └── data/
    │       ├── contracts.json    # Deployed contract addresses
    │       └── mock.js           # Mock data for features not yet on-chain
    ├── api/
    │   └── log.js                # Serverless function — writes to Supabase activity_log
    ├── contracts/
    │   ├── src/                  # Solidity source files (see §3)
    │   ├── scripts/deploy.js     # Hardhat deploy script
    │   └── hardhat.config.js
    └── vercel.json               # Colony app routing (catch-all rewrite, excludes /api/*)
```

---

## 3. Smart Contracts

Deployed on **Base Sepolia** (chain ID 84532).

### 3.1 Contract Addresses (Dave's Colony — primary test colony)

| Contract | Address | Purpose |
|----------|---------|---------|
| Colony | `0xcc50c7c853efb0826da823641010333eb3ff5338` | Main Fisc — entry point for all citizen/company actions |
| GToken | — | ERC-721 soulbound governance NFT, one per citizen |
| SToken | — | ERC-20 spending token (UBI-issued, 18 decimals) |
| VToken | — | ERC-20 savings token (18 decimals) |
| OToken | — | ERC-721 org token — one per company/MCC/cooperative |
| CompanyFactory | — | Deploys EIP-1167 clones of CompanyImplementation |

> Full addresses in `colony-app/src/data/contracts.json`

### 3.2 Colony.sol — Core Fisc

```
join(string name)
    → isCitizen[msg.sender] = true
    → gToken.mint(msg.sender)         // soulbound G-token
    → sToken.issueUbi(msg.sender)     // 1000 S immediately
    emits CitizenJoined, UbiClaimed

claimUbi()                            // once per epoch (monthly)
    emits UbiClaimed

saveToV(uint256 amount)               // max 200/epoch for citizens, unlimited for companies
    → sToken.burn + vToken.mint
    emits Saved

redeemV(uint256 amount)
    → vToken.burn + sToken.issueUbiRaw
    emits Redeemed

send(address to, uint256 amount, string note)   // citizens + registered company wallets
    → sToken.colonyTransfer
    emits Sent(from indexed, to indexed, amount, note)

registerCompanyWallet(address)        // CompanyFactory only
    emits CompanyWalletRegistered

mintOrgToken(address, name, orgType)  // CompanyFactory only → OToken.mint()
    emits (on OToken)

saveToVCompany(uint256)               // company wallets only, no monthly cap
    emits Saved

transferVDividend(address to, uint256)  // company wallets only
    emits VDividendPaid(from indexed, to indexed, amount)

advanceEpoch()                        // founder only, monthly
```

### 3.3 CompanyFactory.sol

Deploys EIP-1167 minimal proxy clones of CompanyImplementation.

```
deployCompany(string name, address[] holders, uint256[] stakes)
    → clones CompanyImplementation
    → colony.registerCompanyWallet(wallet)
    → colony.mintOrgToken(founder, name, 0)   // orgType 0 = Company
    emits CompanyDeployed(id indexed, wallet indexed, name, founder indexed, oTokenId)

getCompany(uint256 id) → (name, wallet, founder, registeredAt, oTokenId)
companyCount() → uint256
```

### 3.4 CompanyImplementation.sol

Smart-contract wallet for each company. Holds S and V tokens.

```
name()           → string
secretary()      → address (O-token holder — has admin rights)
sBalance()       → uint256
vBalance()       → uint256
oTokenId()       → uint256
getEquityTable() → (address[] holders, uint256[] stakes)   // stakes in bps

pay(address to, uint256 amount, string note)    // secretary only → Colony.send()
convertToV(uint256 amount)                      // secretary only → Colony.saveToVCompany()
distributeVDividend()                           // secretary only → Colony.transferVDividend() per holder
```

### 3.5 OToken.sol — Org Token

ERC-721 role-bound NFT. One per organisation (company, MCC, cooperative, civic).

```
tokensOf(address) → uint256[]      // all O-token IDs held
orgs(uint256 id)  → (name, orgType, registeredAt)
ownerOf(uint256)  → address
```

OrgType: `0=Company, 1=MCC, 2=Cooperative, 3=Civic`

### 3.6 GToken.sol — Governance NFT

- ERC-721, soulbound
- On-chain SVG metadata
- `tokenOf(address)` → token ID (0 if none)

### 3.7 SToken.sol / VToken.sol

- ERC-20, 18 decimals
- Colony-authorised mint/burn/transfer
- SToken: `issueUbi()`, `colonyTransfer()`, `burn()`
- VToken: `mint()`, `mintCompany()`, `colonyTransfer()`, `burn()`

---

## 4. Frontend Architecture

### 4.1 Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 19 | Vite 6 build |
| Routing | React Router v7 | Client-side, catch-all rewrite on Vercel |
| Web3 | ethers.js v6 | Wallet connection, contract calls, event queries |
| Styling | Inline JS objects only | No CSS files, no Tailwind |
| Font | IBM Plex Mono | Monospace throughout |
| QR codes | qrcode.react (QRCodeSVG) | Payment request QR generation |
| Hosting | Vercel | Auto-deploys from master branch on GitHub push |
| Activity log | Supabase (Postgres) | Via /api/log serverless function |

### 4.2 WalletCtx — Global State

`App.jsx` provides a React context (`WalletCtx`) consumed via `useWallet()`.

```
WalletCtx {
  address          string | null
  provider         BrowserProvider
  signer           Signer
  chainId          number             84532 (Base Sepolia)
  isConnected      bool
  onChainLoading   bool
  onChain          { [colonyId]: {
    sBalance, vBalance, gTokenId,
    isCitizen, citizenName, isFounder,
    founderAddr, sSymbol, vSymbol,
    colonyAddress (user-deployed only)
  }}
  connect()        → MetaMask prompt, loads on-chain data
  disconnect()     → revokes MetaMask permissions, clears state
  refresh(delayMs) → re-loads on-chain data (default 1500ms)
  isCitizenOf(id)  → bool
  isMccOf(id)      → bool (isFounder check)
  citizenColonies  string[]
  contracts        augmented contracts.json + localStorage colonies
}
```

**Colony sources:** `contracts.json` (known colonies) + `localStorage['spice_user_colonies']`
(user-deployed colonies). `contracts.json` always takes priority — localStorage entries
with matching IDs are silently ignored.

### 4.3 Route Map

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Directory | Lists all known + user-deployed colonies |
| `/colony/:slug` | ColonyPage | Public info, citizen list, company directory, join |
| `/colony/:slug/dashboard` | Dashboard | Balances, tx history, UBI, save/redeem, send |
| `/colony/:slug/admin` | Admin | MCC board: services, citizens, billing |
| `/colony/:slug/company/new` | RegisterCompany | Deploy company via CompanyFactory |
| `/colony/:slug/company/:wallet` | Company | Overview, equity, accounts (double-entry) |
| `/colony/:slug/votes` | Votes | Governance proposals |
| `/colony/:slug/profile` | Profile | V batches, inheritance |
| `/colony/:slug/guardian` | Guardian | Minor wallet management |
| `/colony/:slug/request` | RequestPayment | QR payment request |
| `/colony/:slug/pay` | PaymentConfirm | Confirm + submit payment |
| `/create` | CreateColony | Deploy new colony |

### 4.4 Event Queries — getLogs Pattern

All on-chain history queries use raw `provider.getLogs()` + `Interface.parseLog()`.
`contract.queryFilter()` / `contract.filters.*` are avoided — they trigger LavaMoat
"unpermitted intrinsics" errors in MetaMask-hardened browser environments.

**Block range:** Public RPCs cap `eth_getLogs` at 10,000 blocks. Base Sepolia runs at
~2s/block = 10,000 blocks ≈ 5.5 hours. To cover ~25 hours of history we paginate:
5 chunks × 9,000 blocks in parallel, results merged.

**RPC:** `https://base-sepolia-rpc.publicnode.com` — more permissive than the official
`https://sepolia.base.org` node.

```js
// Pattern used in Dashboard.jsx and Company.jsx
const toBlock = await rpc.getBlockNumber()
const CHUNK = 9000
const chunkResults = await Promise.all(
  Array.from({ length: 5 }, (_, i) => {
    const chunkTo = toBlock - i * CHUNK
    const chunkFrom = Math.max(0, chunkTo - CHUNK)
    return Promise.all([
      safeLogs({ address: colonyAddr, fromBlock: chunkFrom, toBlock: chunkTo, topics: [...] }),
      // ... more queries
    ])
  })
)
```

### 4.5 Activity Logging

A fire-and-forget logger (`src/utils/logger.js`) POSTs to `/api/log` on the same
domain (app.zpc.finance). The serverless function writes to Supabase `activity_log`.
Errors are silently swallowed — logging never blocks the UI.

**Instrumented events:**

| Event | Trigger |
|-------|---------|
| `wallet.connected` | Successful MetaMask connect |
| `wallet.connect_failed` | MetaMask error/rejection |
| `wallet.signer_failed` | getSigner() failure |
| `colony.joined` | Successful join() tx |
| `colony.join_failed` | join() revert |
| `ubi.claimed` | Successful claimUbi() |
| `ubi.claim_failed` | claimUbi() revert |
| `v.saved` | Successful saveToV() |
| `v.save_failed` | saveToV() revert |
| `v.redeemed` | Successful redeemV() |
| `v.redeem_failed` | redeemV() revert |
| `tx.submitted` | Payment tx broadcast |
| `tx.confirmed` | Payment tx confirmed |
| `tx.failed` | Payment tx revert |
| `company.deployed` | Successful deployCompany() |
| `company.deploy_failed` | deployCompany() revert |

Ops console: **Supabase dashboard → Table Editor → activity_log**

---

## 5. Payment Flow

```
Merchant (PC or phone)                  Customer (phone)
──────────────────────                  ─────────────────
1. Dashboard → Request Payment
2. Enter amount + note
3. Generate QR

   QR encodes:
   https://metamask.app.link/dapp/
   app.zpc.finance/colony/{slug}/pay
   ?to={merchantAddr}
   &amount={amount}
   &note={note}

                                        4. Camera → MetaMask in-app browser
                                        5. PaymentConfirm shows amount, note,
                                           balance check
                                        6. Tap Pay → Colony.send(to, amt, note)
                                        7. MetaMask signs + broadcasts
                                        8. tx.submitted + tx.confirmed logged

4. Dashboard refreshes (1.5s delay)
   → new balance + Sent event in history
```

No backend required for payments. Transaction details travel in the URL.

---

## 6. Company Flow

```
1. Citizen → /colony/:slug/company/new
   → Enter name, equity holders + % stakes
   → CompanyFactory.deployCompany(name, holders[], stakes[])
   → EIP-1167 clone of CompanyImplementation deployed
   → Colony.registerCompanyWallet(wallet)
   → Colony.mintOrgToken(founder, name, 0)  → O-token minted
   emits CompanyDeployed

2. Company appears in ColonyPage COMPANIES section
   (reads CompanyFactory.getCompany() for each id 0..companyCount)

3. Customer visits /colony/:slug/company/:wallet
   → PAY card (non-secretary citizens)
   → Fills amount + note → PaymentConfirm → Colony.send(companyWallet, amt, note)

4. Secretary visits company page
   → Overview: balances, equity table
   → Accounts tab: double-entry journal of all Colony events to/from company wallet
   → Equity tab: holder list with bps stakes
   → Actions: Convert S→V, Distribute V Dividend
```

---

## 7. Token Economics (Testnet)

| Token | Standard | Decimals | Mechanism |
|-------|----------|----------|-----------|
| S-token | ERC-20 | 18 | Minted by Colony on UBI claim |
| V-token | ERC-20 | 18 | Minted by Colony on saveToV() |
| G-token | ERC-721 | — | Soulbound, one per citizen |
| O-token | ERC-721 | — | Role-bound, one per organisation |

**UBI:** 1,000 S per citizen per epoch. First tranche on join().
**Savings cap:** 200 S→V per epoch for citizens. No cap for companies.
**V dividend:** Company secretary calls distributeVDividend() → pro-rata to equity holders.

---

## 8. Deployment

### Colony App (app.zpc.finance)
- Vercel project connected to GitHub — **auto-deploys on push to master**
- Build: `npm run build` in `colony-app/`
- `vercel.json`: catch-all rewrite to `/`, excludes `/api/*`

### Main Site (spice.zpc.finance)
- Auto-deploys from master branch
- `vercel.json`: catch-all rewrite excluding `/spice-methodology.html` and `/api/*`

### Smart Contracts
- Hardhat v2, Solidity 0.8.25, evmVersion: cancun
- `npx hardhat run scripts/deploy.js --network baseSepolia`
- Writes addresses to `colony-app/src/data/contracts.json`
- Base Sepolia public RPC can have stuck mempool — hardcode deployed addresses and resume

---

## 9. Known Limitations & Technical Debt

| Item | Impact | Fix |
|------|--------|-----|
| getLogs 10,000-block limit | Only ~25h history visible (5×9k chunks) | Use an indexer (The Graph) or Alchemy for longer history |
| RPC staleness post-tx | Balances stale ~1.5s after transaction | refresh() has 1500ms delay; manual ↻ button |
| MetaMask only | iOS users need MetaMask in-app browser | Add WalletConnect v2 |
| Mock data: MCC billing, guardians, intra-month contracts | UI shown but no real data | Requires MCCBilling, Guardian contracts |
| V dividend distribution is manual | Secretary must call distributeVDividend() | Automate via epoch advance trigger |
| No governance on-chain | Votes page shows mock data | Wire to Governance.sol |
| No ColonyRegistry | Directory uses static JSON + localStorage | Deploy ColonyRegistry, dynamic lookup |
| No mainnet | Testnet only | Audit → Base mainnet |
| Supabase activity log has no auth | Anyone with the anon key can insert | Add row-level security or switch to service key |

---

## 10. Future Architecture

- **WalletConnect v2** — broader wallet support, removes MetaMask dependency
- **React Native** — NFC tap-to-pay, push notifications
- **The Graph** — event indexer, removes getLogs pagination workaround
- **ColonyRegistry** — on-chain colony discovery
- **MCCBilling contract** — automate citizen bills from service usage

---

*SPICE Colony · Technical Architecture · v2*
*Last updated: 15 April 2026*
