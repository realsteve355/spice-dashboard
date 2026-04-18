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
    // Current (v1): advances SToken + VToken epoch counters only
    // Target (v2, requires AToken.sol):
    //   1. For each liability A-token (obligation) due this epoch:
    //        AToken.settleObligationEpoch(liabilityTokenId)
    //        → deducts from obligor, transfers to creditor, or seizes collateral on default
    //   2. Issue UBI to all citizens (existing behaviour)
    //   3. Destroy all unspent S-tokens (existing behaviour via SToken.advanceEpoch)
    //   4. Unlock vesting tranches for all equity A-tokens whose vestingEpoch == currentEpoch
    //      (pull-based — holders call AToken.claimVestedTranche(); epoch advance just emits signal)
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

**Current interface (v1 — deployed):**

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
distributeVDividend()                           // secretary only — distributes entire V balance pro-rata

proposeShareTransfer(address to, uint256 newStake)   // secretary/CEO/FD — two-party approval flow
approveShareTransfer(uint256 proposalId)
cancelShareTransfer(uint256 proposalId)
```

**Target interface (v2 — required for v17 economic model):**

> These changes require a new `CompanyImplementation` beacon upgrade. All existing company
> proxies can be migrated simultaneously via `beacon.upgradeTo(newImpl)`.

```
// Equity issuance (replaces initialize stakes[])
issueVestingShares(
    address participant,
    uint256 totalStakeBps,
    uint256 numTranches,          // 1–12; month-numTranches tranche is 1.5× standard
    uint256 bonusMultiplierBps    // final tranche bonus factor in bps (e.g. 15000 = 1.5×)
)  // secretary only → AToken.issueEquityPair() with vesting schedule

issueOpenShares(
    address investor,
    uint256 stakeBps              // no vesting — immediate full ownership
)  // secretary only → AToken.issueEquityPair() without vesting

// Vesting lifecycle (called by participant)
claimVestedTranche(uint256 aTokenId)   // unlocks next tranche if epoch ≥ trancheEpoch
                                        // → unvested → vested; transferable from that point

// Forfeiture (called by secretary on participant departure)
forfeitUnvestedShares(address participant)  // burns all unvested tranches; returns bps to company pool

// Dividend declaration (replaces distributeVDividend)
declareDividend(uint256 vAmount)       // FD or secretary — declares specific V amount
                                        // distributes vAmount pro-rata to ALL holders (vested + unvested)
                                        // remainder stays in V reserve

// Share transfers (for vested shares only — AToken enforces)
transferShares(uint256 aTokenId, address to, uint256 bps)  // holder only; reverts if unvested
buybackShares(uint256 aTokenId, uint256 bps)               // secretary only; pays NAV in S; cancels A-token

// NAV helper
shareNAV(uint256 stakeBps) → uint256   // company V reserve × stakeBps / 10000

// Existing operations (unchanged)
pay(address to, uint256 amount, string note)   // secretary only
convertToV(uint256 amount)                     // secretary only
changeSecretary(address newSecretary)          // secretary only
appointOfficer(string role, address addr)      // secretary only
removeOfficer(string role)                     // secretary only
```

> **Equity storage in v2:** The internal `equityHolders[]` + `equityStakes[]` arrays are replaced
> by reads from AToken.sol. The company contract stores a `companyATokenId` (liability A-token ID).
> `getEquityTable()` reads from `IAToken.getEquityTokensOf(companyWallet)`.

> **MCC office-term equity:** MCC companies include an additional call path:
> `redeemDirectorShares(address exDirector)` — callable by Colony on board election/recall.
> Pays current NAV in V-tokens to the departing director; cancels their A-tokens. Incoming
> directors call `issueOpenShares()` or `issueVestingShares()` via the Colony governance flow.

> **O-token note:** The O-token is minted to the company contract address, not the secretary's
> wallet. It is a soulbound identity badge for the organisation. The secretary role is a plain
> address field inside the company contract, changeable by the current secretary.

### 3.5 AToken.sol — Economic Claims Registry

**Planned contract — not yet deployed.** The AToken contract is the Fisc's registry of all
economic claims. Every significant ownership right and financial obligation in the colony is
recorded here. Colony.sol is the sole caller for state-changing functions — citizens and
companies cannot interact with AToken directly.

Three forms of A-token, each with different rules enforced at the contract level:

```
// ── Form 1: Unilateral asset ─────────────────────────────────────────────────
// A physical object owned outright — robot, vehicle, land parcel.
// No counterparty. Yield is zero. Value = last transfer price.

registerAsset(
    address   holder,
    uint256   valueSTokens,         // declared value at registration
    uint256   weightKg,             // 0 if not applicable
    bool      hasAutonomousAI,      // triggers mandatory registration below threshold
    uint256   depreciationBps       // monthly depreciation rate; 0 = none
) → uint256 tokenId

transferAsset(
    uint256 tokenId,
    address to,
    uint256 newValueSTokens         // price agreed; becomes new declared value
)

updateDepreciation(
    uint256 tokenId,
    uint256 newDepreciationBps      // company assets only; secretary via Colony
)

currentValue(uint256 tokenId) → uint256   // declared value minus applied depreciation

// ── Form 2: Paired equity ────────────────────────────────────────────────────
// Company share. Fisc creates two tokens simultaneously.
// Asset token = held by shareholder (stakeBps, companyWallet, vesting state)
// Liability token = held by company contract (aggregate distribution obligation)

issueEquityPair(
    address   company,
    address   shareholder,
    uint256   totalStakeBps,
    uint256[] vestingEpochs,        // epoch number when each tranche vests; empty = immediate
    uint256[] vestingAmountsBps     // bps unlocked per tranche; must sum to totalStakeBps
) → (uint256 assetTokenId, uint256 liabilityTokenId)

claimVestedTranche(
    uint256 assetTokenId            // shareholder calls; unlocks tranches whose epoch has passed
) → uint256 vestedBps              // bps newly vested this call

forfeitUnvestedShares(
    uint256 assetTokenId            // Colony only; burns unvested tranches; returns bps
) → uint256 forfeitedBps

transferEquity(
    uint256 assetTokenId,
    address to,
    uint256 bps                     // vested only — reverts if bps exceeds vested amount
)

cancelEquity(
    uint256 assetTokenId,
    uint256 bps                     // buyback — Colony only; reduces liability token; increases NAV
)

// ── Form 3: Paired fixed-obligation ─────────────────────────────────────────
// Bilateral payment agreement. Fisc creates two tokens simultaneously.
// Asset token = held by creditor (payment entitlement)
// Liability token = held by obligor (payment schedule)
// Unsecured: Fisc enforces UBI cap at creation.
// Secured: collateral A-token held in Fisc escrow.

issueObligationPair(
    address  creditor,
    address  obligor,
    uint256  monthlyAmountS,        // S-token payment per epoch
    uint256  totalEpochs,           // number of payment periods
    uint256  collateralTokenId      // 0 = unsecured; > 0 = pledged collateral asset tokenId
) → (uint256 assetTokenId, uint256 liabilityTokenId)

settleObligationEpoch(
    uint256 liabilityTokenId        // Colony.advanceEpoch() calls before UBI issuance
)   // deducts monthlyAmountS from obligor; transfers to creditor;
    // if insufficient funds and unsecured → UBI cap should prevent this (never happens)
    // if insufficient funds and secured → triggers seizeCollateral

seizeCollateral(
    uint256 liabilityTokenId        // Colony only; on default with secured obligation
)   // transfers collateral A-token from escrow to creditor
    // marks obligation as defaulted

// ── Escrow ───────────────────────────────────────────────────────────────────

escrowedCollateral(uint256 liabilityTokenId) → uint256   // collateral tokenId, 0 if unsecured
isInEscrow(uint256 tokenId) → bool

// ── Views ────────────────────────────────────────────────────────────────────

getToken(uint256 tokenId) → (
    uint8   form,                   // 1=unilateral, 2=equity asset, 3=equity liability,
                                    // 4=obligation asset, 5=obligation liability
    address holder,
    address counterparty,           // address(0) for unilateral
    uint256 stakeBps,               // equity only
    uint256 value,                  // current value (depreciation applied)
    bool    isVested                // equity asset tokens only
)

getEquityTokensOf(address holder) → uint256[]   // asset equity token IDs
getObligationsOf(address holder) → (uint256[] assets, uint256[] liabilities)
getNetWorth(address holder) → (uint256 positiveV, uint256 liabilityV)
    // Σ(positive A-token values) − Σ(liability A-token values) in S-token equivalent
```

> **Gas model:** Settlement of all obligation epochs in `Colony.advanceEpoch()` is a push-based
> model — the Fisc iterates all outstanding liability tokens. At colony scale (tens to low hundreds
> of obligations) this is manageable. At large scale, consider a pull-based claim model or
> a settlement queue. This is noted in §10 Future Architecture.

> **UBI cap enforcement (unsecured obligations):** At `issueObligationPair()` time, AToken.sol
> reads the obligor's total existing monthly obligation (sum of all unsecured liability tokens'
> `monthlyAmountS`) and reverts if `existingTotal + monthlyAmountS > 1000 × 1e18` (UBI floor).
> Citizens cannot accumulate unsecured obligations beyond their guaranteed UBI. Companies
> have no UBI and therefore no UBI cap — they must use secured obligations.

### 3.6 OToken.sol — Org Token

ERC-721 role-bound NFT. One per organisation (company, MCC, cooperative, civic).

```
tokensOf(address) → uint256[]      // all O-token IDs held
orgs(uint256 id)  → (name, orgType, registeredAt)
ownerOf(uint256)  → address
```

OrgType: `0=Company, 1=MCC, 2=Cooperative, 3=Civic`

### 3.7 GToken.sol — Governance NFT

- ERC-721, soulbound
- On-chain SVG metadata
- `tokenOf(address)` → token ID (0 if none)

### 3.8 SToken.sol / VToken.sol

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
| O-token | ERC-721 | — | Soulbound to org contract address, one per organisation |
| A-token | Custom registry | — | Fisc-registered economic claims — see §3.5. Not yet deployed. |

**UBI:** 1,000 S per citizen per epoch. First tranche on join().
**Savings cap:** 200 S→V per epoch for citizens. No cap for companies.
**V dividend:** FD or secretary calls `declareDividend(uint256 vAmount)` → distributes declared amount pro-rata to all equity holders (vested and unvested). Remainder stays in V reserve. Current deployed implementation distributes the entire V balance (v1 behaviour — see §3.4).
**Equity:** Company shares are A-token pairs (§3.5). Participant equity vests over 1–12 monthly tranches; month-N tranche is larger (commitment bonus). Unvested shares receive dividends, cannot be transferred. Vested shares are permanently transferable. Not yet deployed — current v1 stores equity as internal arrays in CompanyImplementation.
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
| ~~Intra-month contracts UI, no contract~~ | **Superseded** — removed from economic model (v16). Forward purchase, escrow, and revenue-sharing instruments replaced by V-token reserve + A-token bilateral framework. Contracts tab can be repurposed for A-token obligation view. | No new contract needed |
| Inheritance designation UI stub | Profile page shows placeholder; not on-chain | Add to Colony.sol or separate contract |
| V dividend distribution (v1) distributes entire V balance | Conflicts with v17 model (FD should declare a specific amount) | Deploy CompanyImplementation v2 with `declareDividend(uint256 vAmount)`; beacon upgrade all companies |
| Equity stored as internal arrays (v1) | Conflicts with v17 A-token model; equity is not on-chain verifiable via registry | Deploy AToken.sol; deploy CompanyImplementation v2; migrate equity to A-token pairs |
| AToken.sol not deployed | No on-chain A-token registry; physical assets, secured obligations, vesting equity all unavailable | Deploy AToken.sol (§3.5); integrate with Colony.sol v2 and CompanyImplementation v2 |
| Colony.sol epoch advance (v1) does not settle obligations | A-token obligation settlement requires epoch advance to iterate liability tokens pre-UBI | Colony.sol v2 — add obligation settlement loop to advanceEpoch(); new deploy required |
| MCC office-term equity not implemented | Board compensation via permanent equity; no auto-redemption on term end | CompanyImplementation v2 `redeemDirectorShares()` + Colony governance integration |
| Governance contract not in deploy script | Votes.sol compiled; not wired to deploy.js | Add to deploy sequence, set govAddress in contracts.json |
| No mainnet | Testnet only | Audit → Base mainnet |
| Supabase activity log has no auth | Anyone with the anon key can insert | Add row-level security or switch to service key |
| Beacon ownership | UpgradeableBeacon owned by deployer EOA | Transfer to governance contract when ready |

---

## 10. Future Architecture

### Core v2 contracts (required for v17 economic model)

- **AToken.sol** — Fisc economic claims registry. Three forms: unilateral asset, paired equity, paired fixed-obligation. Escrow sub-registry for secured obligations. See §3.5 for full spec. Replaces AssetRegistry.sol as the unified ownership layer.
- **CompanyImplementation v2** — replaces internal equity arrays with AToken reads; adds `declareDividend(uint256 vAmount)`, vesting issuance (`issueVestingShares`, `issueOpenShares`), `forfeitUnvestedShares`, `buybackShares`, `redeemDirectorShares` for MCC office-term. Beacon upgrade — all existing companies upgrade simultaneously.
- **Colony.sol v2** — advanceEpoch settles all liability A-token obligations before UBI issuance; adds escrow integration (`seizeCollateral`, `releaseEscrow`); wires AToken.sol address. New colony deploy required (Colony.sol is not proxy-upgradeable in v1).

### Gas model decision (open — required before AToken deploy)

Two settlement models for obligation epoch advance:
- **Push-based (current plan):** Colony.advanceEpoch() iterates all outstanding liability tokens. Simple, deterministic. Acceptable at colony scale (tens to low hundreds of obligations). Above ~500 obligations, gas cost of a single advanceEpoch() call may exceed block gas limit.
- **Pull-based:** advanceEpoch() emits a settlement signal. Obligors (or anyone) call `AToken.claimSettlement(liabilityTokenId)` per obligation. Gas cost is O(1) per call. Requires a grace period mechanism for defaults.

Recommended: push-based for Phase 1 (small colonies, testnet). Pull-based model for mainnet scale. Architect the AToken contract to support both patterns.

### Infrastructure

- **WalletConnect v2** — broader wallet support, removes MetaMask dependency
- **React Native** — NFC tap-to-pay, push notifications
- **The Graph** — event indexer, removes getLogs pagination workaround
- **Guardian.sol** — on-chain minor wallet management with automatic 18th-birthday transfer
- **Governance beacon upgrade** — transfer UpgradeableBeacon ownership to Governance.sol
- **ColonyRegistry v2** — add per-colony fee override + deregister/reregister (contract written; needs redeployment)

---

*SPICE Colony · Technical Architecture · v5*
*Last updated: 18 April 2026*
*v4 changes: ColonyRegistry deployed (§3.1); spice-admin/ repo structure (§2); 18-step deploy flow + pre-flight checks (§8); three-project Vercel setup with ignoreCommand (§8); deployArtifacts.js noted (§2, §3); "No ColonyRegistry" removed from Known Limitations (§9); ColonyRegistry removed from Future Architecture (§10).*
*v5 changes: AToken.sol planned contract spec added (§3.5) — three forms (unilateral asset, paired equity, paired fixed-obligation), escrow sub-registry, UBI cap enforcement, vesting schedule. CompanyImplementation updated (§3.4) — v1 current interface vs v2 target interface with vesting, declareDividend, office-term equity. Colony.sol advanceEpoch target behaviour documented (obligation settlement before UBI). Section numbers updated (§3.5 AToken, §3.6 OToken, §3.7 GToken, §3.8 SToken/VToken). Token economics table updated (§7) — A-token and v17 dividend model. Known Limitations updated (§9) — intra-month contracts superseded, v1/v2 delta items added, AToken and Colony v2 gaps listed. Future Architecture expanded (§10) — core v2 contracts, gas model decision.*
