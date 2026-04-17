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
spice-dashboard/                  # Root — main SPICE research site (zpc.finance)
│   src/                          # React pages: Home, Collision, Simulation, etc.
│   public/                       # Static assets, spice-methodology.html
│   api/                          # Vercel serverless functions for main site
│   │   ├── fred.js               # FRED API proxy
│   │   ├── economy-overview.js   # AI economic summary
│   │   └── log.js                # Activity log proxy (CORS issues — see colony-app/api/log.js)
│   vercel.json                   # Main site routing + CORS headers + ignoreCommand
│
├── colony-app/                   # Colony app (app.zpc.finance)
│   ├── src/
│   │   ├── App.jsx               # Router, WalletCtx, on-chain data loader
│   │   ├── pages/
│   │   │   ├── Directory.jsx     # Colony list (registry on-chain + contracts.json + localStorage)
│   │   │   ├── ColonyPage.jsx    # Public colony page + join flow + company directory
│   │   │   ├── Dashboard.jsx     # Citizen dashboard — balances, tx history, actions
│   │   │   ├── Admin.jsx         # MCC admin — services, citizens, billing
│   │   │   ├── Company.jsx       # Company page — overview, equity, accounts (double-entry)
│   │   │   ├── RegisterCompany.jsx  # Deploy new company via CompanyFactory
│   │   │   ├── Votes.jsx         # Governance proposals and voting (on-chain)
│   │   │   ├── Profile.jsx       # Citizen profile — on-chain identity, inheritance stub
│   │   │   ├── Guardian.jsx      # Guardian view for minor wallets (UI only, no chain contract yet)
│   │   │   ├── RequestPayment.jsx   # QR code payment request generator
│   │   │   ├── PaymentConfirm.jsx   # Payment confirmation + Colony.send()
│   │   │   └── CreateColony.jsx  # Deploy new colony — 18-step guided flow (see §8)
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Shell: header, back button, nav
│   │   │   └── SendSheet.jsx     # Reusable send S-tokens inline form
│   │   ├── utils/
│   │   │   └── logger.js         # Fire-and-forget activity logger → /api/log
│   │   └── data/
│   │       ├── contracts.json        # Deployed contract addresses (source of truth for known colonies)
│   │       └── deployArtifacts.js    # 215KB lazy-loaded ABIs + bytecodes for 10 contracts (used by CreateColony.jsx)
│   ├── api/
│   │   └── log.js                # Serverless function — writes to Supabase activity_log
│   ├── contracts/
│   │   ├── src/                  # Solidity source files (see §3)
│   │   ├── scripts/deploy.js     # Hardhat deploy script
│   │   └── hardhat.config.js
│   └── vercel.json               # Colony app routing (catch-all rewrite, excludes /api/*) + ignoreCommand
│
└── spice-admin/                  # Protocol admin panel (spice.zpc.finance)
    ├── index.html                # Single-page admin UI — no build step, ethers.js CDN
    ├── config.js                 # ColonyRegistry address + Supabase config
    └── vercel.json               # Static routing + ignoreCommand
```

---

## 3. Smart Contracts

Deployed on **Base Sepolia** (chain ID 84532).

### 3.1 Contract Addresses

#### ColonyRegistry (protocol-level, shared across all colonies)

| Contract | Address | Purpose |
|----------|---------|---------|
| ColonyRegistry | `0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d` | Global directory — all deployed colonies register here |

> Admin panel: `spice.zpc.finance` (spice-admin/) — read-only stats without wallet; owner actions require MetaMask.
> Owner functions: update fee rate, update treasury address, per-colony fee override, deregister/reregister colony.

#### Dave's Colony — primary test colony

| Contract | Address | Purpose |
|----------|---------|---------|
| Colony | `0xa4bCadeE7263AE5a26D921fD39453699B5D20A8b` | Main Fisc — entry point for all citizen/company actions |
| GToken | `0x36BEf50b0A340b4cF28E166b1504a4F4134eaA27` | ERC-721 soulbound governance NFT, one per citizen |
| SToken | `0xFe2eda69fb869B2BA8661501b38799Bf83E19429` | ERC-20 spending token (UBI-issued, 18 decimals) |
| VToken | `0x00E9177190c2945b2549Fc3Fa28329C0213F4920` | ERC-20 savings token (18 decimals) |
| OToken | `0x6058AB1E41b06971e79b41f3d6E9a3c8E7cAa5ab` | ERC-721 org token — one per company/MCC/cooperative |
| CompanyImpl | `0x2f9B9534e6222Ca5c83e738f91b4685853Fc7f41` | Beacon target — all company proxies implement this |
| CompanyBeacon | `0x9cECDDED964eB259808697567BEc97dA73425FaE` | UpgradeableBeacon — owned by deployer |
| CompanyFactory | `0xDe434AA890FEca4895B8cf22663fA532488438f0` | Deploys BeaconProxy per company, registers with Colony |
| MCCBilling | `0x9647A0Fa0277523693DCEe3B5612A09A51836Eb1` | Per-citizen monthly bill tracking |
| MCCServices | `0xbBE846695219F59a5123870a86AA4A92519E60ff` | MCC service registry (name, billing basis, price) |

> Full colony addresses also in `colony-app/src/data/contracts.json` (auto-generated by deploy.js).
> ABIs + bytecodes for all 10 contracts live in `colony-app/src/data/deployArtifacts.js` (215KB, lazy-loaded only during colony creation).

### 3.2 Colony.sol — Core Fisc

```
join(string name)
    → isCitizen[msg.sender] = true
    → citizenName[msg.sender] = name
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
    → pendingProtocolFee += registry.getFeeForColony()  // if registry set
    emits Sent(from indexed, to indexed, amount, note)

registerCompanyWallet(address)        // CompanyFactory only
    emits CompanyWalletRegistered

mintOrgToken(address, name, orgType)  // CompanyFactory only → OToken.mint()

saveToVCompany(uint256)               // company wallets only, no monthly cap
    emits Saved

transferVDividend(address to, uint256)  // company wallets only
    emits VDividendPaid(from indexed, to indexed, amount)

advanceEpoch()                        // founder only, monthly
    emits EpochAdvanced

pendingProtocolFee() → uint256        // accrued ETH owed to protocol
settleProtocol() payable              // MCC pays accumulated ETH to registry treasury
    emits ProtocolFeeSettled
```

### 3.3 CompanyFactory.sol

Deploys **BeaconProxy** instances pointing at a shared `UpgradeableBeacon`. All company
proxies can be upgraded simultaneously by calling `beacon.upgradeTo(newImpl)` — no
per-company migration needed.

```
deployCompany(
    string   name,
    address[] equityHolders,
    uint256[] equityStakes,   // in basis points (must sum to 10000)
    uint8    orgType          // 0=Company, 1=MCC, 2=Cooperative, 3=Civic
) → companyId
    1. Deploys BeaconProxy — calls initialize() on CompanyImplementation
    2. Mints O-token to the company contract address (soulbound identity)
    3. Registers company wallet with Colony (authorises Colony.send())
    4. Records company in factory directory
    emits CompanyDeployed(id indexed, wallet indexed, name, founder indexed, oTokenId)

getCompany(uint256 id) → (name, wallet, founder, oTokenId, registeredAt)
getCompaniesOf(address) → uint256[]   // IDs of companies this wallet holds equity in
companyCount() → uint256
```

> **Upgrade path**: deploy new `CompanyImplementation`, then call `beacon.upgradeTo(newImplAddress)`.
> All company proxies upgrade simultaneously. Beacon is currently owned by the deployer wallet.

### 3.4 CompanyImplementation.sol

Smart-contract wallet for each company (deployed as BeaconProxy). Holds S and V tokens.

```
initialize(colony, name, secretary, holders[], stakes[])  // called once by factory
name()           → string
secretary()      → address (admin role — can execute company operations)
sBalance()       → uint256
vBalance()       → uint256
oTokenId()       → uint256
getEquityTable() → (address[] holders, uint256[] stakes)   // stakes in bps

pay(address to, uint256 amount, string note)    // secretary only → Colony.send()
convertToV(uint256 amount)                      // secretary only → Colony.saveToVCompany()
distributeVDividend()                           // secretary only → Colony.transferVDividend() per holder

proposeShareTransfer(address to, uint256 newStake)   // secretary only — initiates transfer
```

> **O-token note:** The O-token is minted to the company contract address, not the secretary's
> wallet. It is a soulbound identity badge for the organisation. The secretary role is a plain
> address field inside the company contract, changeable by the current secretary.

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
    colonyName, colonyAddress (user-deployed only)
  }}
  connect()        → MetaMask prompt, loads on-chain data
  disconnect()     → revokes MetaMask permissions, clears state
  refresh(delayMs) → re-loads on-chain data (default 1500ms)
  isCitizenOf(id)  → bool (on-chain only; false if no contract data)
  isMccOf(id)      → bool (isFounder check; false if no contract data)
  citizenColonies  string[]
  contracts        augmented contracts.json + localStorage colonies
}
```

**Colony sources:** `contracts.json` (known colonies) + `localStorage['spice_user_colonies']`
(user-deployed colonies). `contracts.json` always takes priority — localStorage entries
with matching IDs are silently ignored.

**No mock fallback.** All citizen and MCC status checks are on-chain only. Pages that need
chain data show a loading state or "not a citizen" message — never stale mock data.

### 4.3 Route Map

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Directory | Lists all known + user-deployed colonies |
| `/colony/:slug` | ColonyPage | Public info, citizen list, company directory, join |
| `/colony/:slug/dashboard` | Dashboard | Balances, tx history, UBI, save/redeem, send |
| `/colony/:slug/admin` | Admin | MCC board: services, citizens, billing |
| `/colony/:slug/company/new` | RegisterCompany | Deploy company via CompanyFactory |
| `/colony/:slug/company/:wallet` | Company | Overview, equity, accounts (double-entry) |
| `/colony/:slug/votes` | Votes | Governance proposals + voting (on-chain) |
| `/colony/:slug/profile` | Profile | On-chain identity, inheritance designation stub |
| `/colony/:slug/guardian` | Guardian | Minor wallet management (UI only, no chain contract) |
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
   → Enter name, equity holders + % stakes, org type
   → CompanyFactory.deployCompany(name, holders[], stakes[], orgType)
   → BeaconProxy deployed, pointing at CompanyImplementation via UpgradeableBeacon
   → CompanyImplementation.initialize() called (wires colony, name, secretary, equity)
   → Colony.mintOrgToken(companyWallet, name, orgType)  → O-token minted to company address
   → Colony.registerCompanyWallet(wallet)
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
| O-token | ERC-721 | — | Soulbound to org contract, one per organisation |

**UBI:** 1,000 S per citizen per epoch. First tranche on join().
**Savings cap:** 200 S→V per epoch for citizens. No cap for companies.
**V dividend:** Company secretary calls distributeVDividend() → pro-rata to equity holders.
**Protocol fee:** Each Colony.send() accrues 0.000001 ETH to pendingProtocolFee. MCC settles monthly via settleProtocol().

---

## 8. Deployment

### Three Vercel Projects

All three projects auto-deploy from the same `master` branch on GitHub. Each has an
`ignoreCommand` in its `vercel.json` so pushes to unrelated parts of the monorepo do not
trigger unnecessary rebuilds.

**CRITICAL:** `ignoreCommand` paths are relative to each project's own root directory
(as configured in Vercel's "Root Directory" setting), not to the repo root. A path like
`colony-app/src/` would mean `colony-app/colony-app/src/` if run from `colony-app/` — always
use paths relative to the project root.

| Domain | Vercel root dir | ignoreCommand triggers on changes to |
|--------|----------------|--------------------------------------|
| `zpc.finance` | `/` (repo root) | `src/ api/ public/ index.html vite.config.js` |
| `app.zpc.finance` | `colony-app/` | `src/ public/ package.json vite.config.js` |
| `spice.zpc.finance` | `spice-admin/` | `.` (any change to spice-admin/) |

### zpc.finance (main research site)
- Build: `npm run build` in repo root
- `vercel.json`: catch-all rewrite excluding `/spice-methodology.html` and `/api/*`; CORS headers on all `/api/*` routes
- Dynamic registry fetch in `src/pages/Home.jsx` — reads ColonyRegistry on mount, falls back to `src/data/colonies.js`

### app.zpc.finance (colony app)
- Build: `npm run build` in `colony-app/`
- `vercel.json`: catch-all rewrite to `/`, excludes `/api/*`
- Colony list sources (priority order): ColonyRegistry on-chain → `contracts.json` → `localStorage['spice_user_colonies']`
- Final dedup pass in `Directory.jsx`: deduplicate by slug AND address AND name (catches same colony registered under different slugs)

### spice.zpc.finance (protocol admin)
- **No build step** — `spice-admin/index.html` is served as static HTML with ethers.js loaded from CDN
- `spice-admin/config.js` contains ColonyRegistry address (`0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d`)
- Stats (colony count, fee rate, total pending fees, treasury address) load read-only on page open
- Owner actions (update fee, update treasury, per-colony overrides) require MetaMask connect

### Colony Deploy Flow (CreateColony.jsx) — 18 steps

The colony deploy wizard in `app.zpc.finance/create` guides the founder through a single
MetaMask-confirmed flow. All ABIs and bytecodes are loaded lazily from `deployArtifacts.js`.

**Pre-flight checks (before first MetaMask prompt):**
1. Network check — must be Base Sepolia (chain ID 84532)
2. Balance check — deployer wallet must hold ≥ 0.005 ETH
3. Slug availability check — `ColonyRegistry.slugToColony(slug)` must return `address(0)`

**Deploy steps (steps 1–17 — each requires MetaMask confirmation):**
GToken deploy → SToken deploy → VToken deploy → Colony deploy → GToken ownership transfer →
SToken ownership transfer → VToken ownership transfer → OToken deploy → Colony mint O-token →
OToken ownership transfer → Colony setOToken → CompanyImpl deploy → UpgradeableBeacon deploy →
CompanyFactory deploy → Colony setCompanyFactory → MCCBilling deploy → MCCServices deploy

**Step 17.5:** Save colony to `localStorage['spice_user_colonies']` — done before step 18 so
the colony is usable even if registry registration fails.

**Step 18 (non-fatal):** `ColonyRegistry.register(colonyAddr, name, slug)` — if this fails,
the colony is still fully functional; it just won't appear in the global directory until
manually registered via `spice.zpc.finance`.

### Smart Contracts
- Hardhat v2, Solidity 0.8.25, evmVersion: cancun
- `npx hardhat run scripts/deploy.js --network baseSepolia`
- Writes all addresses to `colony-app/src/data/contracts.json` (merged, preserves other colonies)
- Also auto-generates `src/data/colonies.js` for the main site fallback list
- Base Sepolia public RPC can have stuck mempool — hardcode deployed addresses and resume
- ColonyRegistry deploy: `npx hardhat run scripts/deployRegistry.js --network baseSepolia`

### Test Data
- `npx hardhat run scripts/seedTestColony.js --network baseSepolia`
- Seeds citizens, company registrations, payments — all real on-chain transactions
- No mock data in the frontend; all test data must come from the seed script

---

## 9. Known Limitations & Technical Debt

| Item | Impact | Fix |
|------|--------|-----|
| getLogs 10,000-block limit | Only ~25h history visible (5×9k chunks) | Use an indexer (The Graph) or Alchemy for longer history |
| RPC staleness post-tx | Balances stale ~1.5s after transaction | refresh() has 1500ms delay; manual ↻ button |
| MetaMask only | iOS users need MetaMask in-app browser | Add WalletConnect v2 |
| Guardian management UI, no contract | Guardian page exists but has no on-chain equivalent | Deploy Guardian.sol; wire UI |
| Intra-month contracts UI, no contract | Contracts tab shows empty list | Deploy IntraMonthContracts.sol |
| Inheritance designation UI stub | Profile page shows placeholder; not on-chain | Add to Colony.sol or separate contract |
| V dividend distribution is manual | Secretary must call distributeVDividend() | Automate via epoch advance trigger |
| Governance contract not in deploy script | Votes.sol compiled; not wired to deploy.js | Add to deploy sequence, set govAddress in contracts.json |
| No mainnet | Testnet only | Audit → Base mainnet |
| Supabase activity log has no auth | Anyone with the anon key can insert | Add row-level security or switch to service key |
| Beacon ownership | UpgradeableBeacon owned by deployer EOA | Transfer to governance contract when ready |

---

## 10. Future Architecture

- **WalletConnect v2** — broader wallet support, removes MetaMask dependency
- **React Native** — NFC tap-to-pay, push notifications
- **The Graph** — event indexer, removes getLogs pagination workaround
- **Guardian.sol** — on-chain minor wallet management with automatic 18th-birthday transfer
- **Governance beacon upgrade** — transfer UpgradeableBeacon ownership to Governance.sol
- **ColonyRegistry v2** — add per-colony fee override + deregister/reregister (contract written; needs redeployment)

---

*SPICE Colony · Technical Architecture · v4*
*Last updated: 17 April 2026*
*v4 changes: ColonyRegistry deployed (§3.1); spice-admin/ repo structure (§2); 18-step deploy flow + pre-flight checks (§8); three-project Vercel setup with ignoreCommand (§8); deployArtifacts.js noted (§2, §3); "No ColonyRegistry" removed from Known Limitations (§9); ColonyRegistry removed from Future Architecture (§10).*
