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
    │       ├── /api/log      →  Supabase (activity_log table)
    │       └── /api/citizens →  Base Sepolia RPC (GToken contract reads)
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
│   │   │   ├── Directory.jsx     # Colony list (ColonyRegistry on-chain only — single source of truth)
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
│   │   │   ├── logger.js         # Fire-and-forget activity logger → /api/log
│   │   │   ├── addrLabel.js      # Address display helpers: shortAddr, namedAddr, resolveNames
│   │   │   └── fetchCitizens.js  # Shared utility — GET /api/citizens → [{address,name}] sorted by name
│   │   └── data/
│   │       ├── contracts.json        # Deployed contract addresses (token-address cache for known colonies; not used for colony discovery)
│   │       └── deployArtifacts.js    # 215KB lazy-loaded ABIs + bytecodes for 10 contracts (used by CreateColony.jsx)
│   ├── api/
│   │   ├── log.js                # Serverless function — writes to Supabase activity_log
│   │   └── citizens.js           # Serverless function — enumerates colony citizens via GToken contract reads
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
| ColonyRegistry | `0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68` | Global directory — ERC-721 C-token registry; all deployed colonies register here |

> ERC-721 collection: "SPICE Colony" / "COLONY". Each `register()` mints a soulbound C-token to the Colony
> contract address. `deregister()` burns it; `reregister()` remints with the same token ID. `tokenURI()` returns
> on-chain JSON metadata (name, slug, address, founder, registration date). `ownerOf(tokenId)` == Colony contract —
> not the founder's EOA — so the colony cannot be orphaned by key loss.
>
> Admin panel: `spice.zpc.finance` (spice-admin/) — read-only stats without wallet; owner actions require MetaMask.
> Owner functions: update fee rate, update treasury address, per-colony fee override, deregister/reregister colony.

#### Dave's Colony — primary test colony (`daves-colony`, redeployed 20 April 2026 with multi-candidate Governance)

| Contract | Address | Purpose |
|----------|---------|---------|
| Colony | `0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5` | Main Fisc — entry point for all citizen/company actions |
| GToken | `0x08318fC33f0e57a6D196D5a3cF8d443A54C41449` | ERC-721 soulbound governance NFT, one per citizen |
| SToken | `0x8B9B98cf05C5dC6e43C5b74320B2B858b92D6a04` | ERC-20 spending token (UBI-issued, 18 decimals) |
| VToken | `0x86bC95CeD14E3fC1782393E63bc22ef142BEe433` | ERC-20 savings token (18 decimals) |
| OToken | `0x6cE1bD882b7abE3664f31C558F347CDeF1E32138` | ERC-721 org token — one per company/MCC/cooperative |
| AToken | `0xA85EaF14E3F85007db73Fd7e153009D081FE1B01` | ERC-721 economic claims registry — see §3.5 |
| CompanyImpl | `0xa961B7C6C593fFf33e63FB091aD2F93e0800FfDf` | Beacon target — all company proxies implement this |
| CompanyBeacon | `0x1bcacD3007AE3058575E8c35073127F1b1B5bF3C` | UpgradeableBeacon — owned by deployer |
| CompanyFactory | `0x00a41D63eF6fa60e15f26Dc46d6aad8994042e1a` | Deploys BeaconProxy per company, registers with Colony |
| MCCBilling | `0x7Ce46f4Ea8263C9038b546e2147939ce021a9e2E` | Per-citizen monthly bill tracking |
| MCCServices | `0xBD114C69130B43eA782F63C19e6e1ECB9D5B59c7` | MCC service registry (name, billing basis, price) |
| Governance | `0x7D885120a8766A6B6ce951f3fbf342046c485240` | MCC elections (CEO/CFO/COO) + obligation mutual-consent — see §3.9 |

> Full colony addresses also in `colony-app/src/data/contracts.json` (auto-generated by deploy.js).
> ABIs + bytecodes for all 10 contracts live in `colony-app/src/data/deployArtifacts.js` (215KB, lazy-loaded only during colony creation).

### 3.2 Colony.sol — Core Fisc

```
join(string name, uint256 dob)
    // dob is a birth year (e.g. 1985) — NOT a Unix timestamp.
    // Validated: 1900 ≤ dob ≤ 2100.
    // Stored in mapping(address => uint256) public dateOfBirth.
    // Governance uses year-arithmetic: 1970 + block.timestamp / 365 days >= dob + 18
    → isCitizen[msg.sender] = true
    → citizenName[msg.sender] = name
    → dateOfBirth[msg.sender] = dob
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

setGovernance(address gov)            // founder only, one-time — wires Governance.sol
    // Once set, issueObligation() is disabled; only issueObligationGov() callable
    // by governance contract.

issueObligationGov(                   // onlyGovernance — called by Governance._tryExecute()
    address creditor, address obligor,
    uint256 monthlyAmountS, uint256 totalEpochs, uint256 collateralId
) → (uint256 assetId, uint256 liabilityId)

advanceEpoch()                        // founder only, monthly
    // If governance is set and governance.ceoActive() == false → reverts
    //   ("Colony: CEO role vacant — elect a new CEO before advancing epoch")
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

### 3.5 AToken.sol — Economic Claims Registry (ERC-721)

**Deployed April 2026.** Address: `0xD0983C309f87Aa50e164a9876EAa64bA43Ac0Cd2` (Dave's Colony, Base Sepolia).

AToken inherits OZ v5 `ERC721("SPICE A-Token", "ATOKE")` — A-tokens are real NFTs visible in MetaMask and on Basescan. All three forms (unilateral asset, paired equity, paired fixed-obligation) are deployed and functional.

**ERC-721 restrictions:** Public `transferFrom`, `safeTransferFrom`, `approve`, and `setApprovalForAll` revert with "use Colony". All legitimate transfers go through Colony (which calls `super._transfer` internally). `tokenURI(id)` returns a `data:application/json;base64` URI with on-chain JSON metadata including form-specific attributes. Token IDs start at 1.

Colony.sol is the sole caller for all state-changing functions — citizens and companies reach AToken only through Colony.

```
// ── Form 1: Unilateral asset ─────────────────────────────────────────────────
// A physical object owned outright — robot, vehicle, land parcel.
// No counterparty. Yield is zero. Value = last transfer price.
// Registration threshold: value > 500 S, weight > 50 kg, or autonomous AI.

registerAsset(
    address holder,
    uint256 valueSTokens,           // declared value (18 dec)
    uint256 weightKg,               // 0 if not applicable
    bool    hasAI,                  // true = autonomous AI capability
    uint256 depreciationBps,        // per-epoch linear depreciation; 0 = none
    uint256 currentEpoch
) → uint256 id                      // ERC-721 token ID

transferAsset(uint256 id, address to, uint256 newValueS)
    // newValueS becomes new declared value; escrowed tokens cannot be transferred

currentAssetValue(uint256 id, uint256 currentEpoch) → uint256
    // declared value with linear depreciation applied

// ── Form 2: Paired equity ────────────────────────────────────────────────────
// Company share. Fisc creates two ERC-721 tokens simultaneously.
// EQUITY_ASSET = held by shareholder (stake in bps, vesting schedule)
// EQUITY_LIABILITY = held by company contract (one per company, reused)

issueEquity(
    address   company,
    address   holder,
    uint256   stakeBps,
    uint256[] vestingEpochs,        // empty = immediate full vest
    uint256[] trancheBps            // must sum to stakeBps if set
) → (uint256 assetId, uint256 liabilityId)

claimVestedTranches(uint256 assetId, uint256 currentEpoch) → uint256 newlyVestedBps
    // advances vestedBps for all tranches whose epoch has passed

forfeitUnvested(uint256 assetId) → uint256 forfeitedBps
    // Company secretary only; burns unvested tranches; returns bps for reallocation

transferEquity(uint256 assetId, address to, uint256 bps) → uint256 newAssetId
    // vested bps only; creates a new EQUITY_ASSET token for the recipient

cancelEquity(uint256 assetId, uint256 bps)
    // buyback — Colony only; reduces stake; burns token if stake reaches zero

// ── Views — equity ───────────────────────────────────────────────────────────

getEquityTable(address company) → (address[] holders, uint256[] totalStakeBps, uint256[] vestedStakeBps)
getVestingStake(uint256 assetId) → (uint256 totalStakeBps, uint256 vestedBps, address company)

// ── Form 3: Paired fixed-obligation ─────────────────────────────────────────
// Bilateral payment agreement. Fisc creates two ERC-721 tokens simultaneously.
// OBLIGATION_ASSET = held by creditor (payment entitlement)
// OBLIGATION_LIABILITY = held by obligor (payment schedule)
// Unsecured: UBI cap enforced at creation (citizen obligors only).
// Secured: collateral UNILATERAL A-token locked in escrow.

issueObligation(
    address creditor,
    address obligor,
    uint256 monthlyAmountS,         // S-tokens per epoch (18 dec)
    uint256 totalEpochs,
    uint256 collateralId,           // 0 = unsecured; > 0 = pledged asset token ID
    uint256 maxMonthlyS             // UBI cap in S (0 = no cap, for company obligors)
) → (uint256 assetId, uint256 liabilityId)

markObligationPaid(uint256 liabilityId) → bool completed
    // Colony calls after performing the S-token transfer; returns true if fully settled

markObligationDefaulted(uint256 liabilityId, address creditor)
    // secured obligations only; transfers collateral to creditor; burns both tokens

// ── Views — obligations ───────────────────────────────────────────────────────

getObligation(uint256 liabilityId) → (
    address obligor, address creditor,
    uint256 monthlyAmountS, uint256 totalEpochs, uint256 epochsPaid,
    uint256 collateralId, bool defaulted
)
activeObligationIds() → uint256[]   // all outstanding liability IDs; iterated at epoch advance
totalMonthlyUnsecuredObligations(address obligor) → uint256

// ── General views ─────────────────────────────────────────────────────────────

tokensOf(address holder) → uint256[]   // all active A-token IDs held
getTokenHolder(uint256 id) → address
tokens(uint256 id) → (Form form, address holder, address counterparty, uint256 linkedId, bool active)

// ── Escrow mappings (public state) ───────────────────────────────────────────

escrowedFor(uint256 collateralId) → uint256    // liabilityId (0 if free)
collateralFor(uint256 liabilityId) → uint256   // collateralId (0 if unsecured)
```

> **Gas model:** Settlement of all obligation epochs in `Colony.advanceEpoch()` is a push-based
> model — the Fisc iterates all outstanding liability tokens. At colony scale (tens to low hundreds
> of obligations) this is manageable. At large scale, consider a pull-based claim model or
> a settlement queue. This is noted in §10 Future Architecture.

> **UBI cap enforcement (unsecured obligations):** At `issueObligation()` time, AToken.sol reads
> the obligor's total existing monthly unsecured obligation and reverts if
> `existing + monthlyAmountS > maxMonthlyS`. Pass `maxMonthlyS = 0` for company obligors (no UBI).
> Citizens cannot accumulate unsecured obligations beyond their guaranteed UBI (1,000 S/month).

> **Colony.sol v1 limitation:** `advanceEpoch()` does not yet call `markObligationPaid()` on
> outstanding obligation liability tokens. Obligation settlement at epoch advance requires
> Colony.sol v2 (new deploy). The AToken contract is fully ready; the caller integration
> is the remaining gap.

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

### 3.9 Governance.sol — MCC Elections + Obligation Consent

**Deployed 20 April 2026.** Address: `0x7D885120a8766A6B6ce951f3fbf342046c485240` (Dave's Colony).
Wired to Colony via `Colony.setGovernance()` (one-time, founder only).

**Two proposal types:**

#### MCC Elections (CEO / CFO / COO) — multi-candidate model

Elections proceed in four phases: nomination → voting → timelock → execute.

```
openElection(uint8 role) → uint256 id
    // Any citizen may open an election for any role (including occupied roles).
    // Starts a nomination window.
    emits ElectionOpened(id indexed, role indexed, openedBy indexed)

nominateCandidate(uint256 electionId, address candidate)
    // Any citizen may nominate any other citizen during the nomination window.
    // Multiple candidates allowed per election.
    // Caller may nominate themselves.
    emits CandidateNominated(id indexed, candidate indexed)

vote(uint256 electionId, address candidate)
    // Citizen 18+ only (uses Colony.dateOfBirth — year arithmetic).
    // One vote per citizen per election; must vote for a nominated candidate.
    // Called during voting window (after nomination window closes).
    emits VoteCast(id indexed, voter indexed, candidate indexed)

finaliseElection(uint256 electionId)
    // Anyone may call after voting window closes.
    // No candidates → cancelled (FAILED).
    // One or more candidates → winner = highest vote count; starts timelock.
    // Tie → first-nominated candidate wins (deterministic tiebreak).
    emits ElectionFinalised | ElectionCancelled

executeElection(uint256 electionId)
    // Anyone may call after timelock expires.
    // Installs winner as role holder for TERM (365 days).
    emits ElectionExecuted(id indexed, role indexed, winner indexed)

resign(uint8 role)
    // Incumbent only. Vacates the role immediately with no election.
    // After resign(), the role is vacant; next election winner fills it.
    emits Resigned(role indexed, holder indexed)
```

**Timing constants (testnet — reduced for testing):**
```solidity
uint256 public constant NOMINATION_WINDOW =  5 minutes;   // mainnet: 7 days
uint256 public constant VOTING_WINDOW     = 15 minutes;   // mainnet: 14 days
uint256 public constant TIMELOCK          =  5 minutes;   // mainnet: 7 days
uint256 public constant TERM              = 365 days;
uint256 public constant OBLIGATION_EXPIRY = 30 days;
```

**Election struct:**
```solidity
struct Election {
    uint8   role;
    address openedBy;
    uint256 openedAt;
    uint256 nominationEndsAt;
    uint256 votingEndsAt;
    uint256 timelockEndsAt;    // 0 until finalised with a winner
    address winner;            // zero address until finalised
    bool    executed;
    bool    cancelled;
}
```

**CEO vacancy freeze:** `ceoActive()` returns false if CEO slot is vacant or term expired.
`Colony.advanceEpoch()` calls `IGovernance.ceoActive()` and reverts if false — no UBI
can be issued until a new CEO is elected and executed.

**Term:** 365 days. On deploy, the colony founder is assigned all three roles with a
1-year term. Renewal requires a new election before the term expires. Roles may also
be vacated early via `resign()`.

**Views:**
```
roleHolder(uint8) → (address holder, uint256 termEnd, bool active)
ceoActive()       → bool            // used by Colony.advanceEpoch()
nextId()          → uint256         // next election ID (IDs start at 1)
elections(uint256) → Election       // full election struct
getCandidates(uint256) → address[]  // all nominated candidates for an election
getCandidateVotes(uint256, address) → uint256
hasVoted(address, uint256) → bool
isCandidate(uint256, address) → bool
```

#### Obligation Mutual Consent

Replaces direct `Colony.issueObligation()`. Both creditor and obligor must consent
before any obligation is created on-chain.

```
proposeObligation(
    address creditor, address obligor,
    uint256 monthlyAmountS, uint256 totalEpochs,
    uint256 collateralId        // 0 = unsecured
) → uint256 id
    // Caller may be either party or a third-party arranger.
    // If caller is a party, their signature is auto-applied.
    // Expires after 30 days if not fully signed.
    emits ObligationProposed

signObligation(uint256 obligationId)
    // Creditor or obligor calls to add their consent.
    // On second signature: Colony.issueObligationGov() is called immediately.
    emits ObligationSigned, ObligationCreated

pendingSignaturesFor(address party) → uint256[]
    // Returns all proposal IDs where party still needs to sign.
```

**Age check for voters:** `1970 + block.timestamp / 365 days >= birthYear + 18`.
Birth years (stored in `Colony.dateOfBirth`) are epoch years (e.g. 1985), not
Unix timestamps — this avoids uint256 underflow for pre-1970 dates.

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

**Colony sources:** ColonyRegistry on-chain only. `contracts.json` and `localStorage['spice_user_colonies']`
are no longer used for colony discovery. `contracts.json` is retained as a token-address cache for
known colonies (sToken/vToken/gToken lookup); it is not the primary source for the directory.

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
| `/colony/:slug/assets` | Assets | Register physical assets (Form 1 UNILATERAL A-token), create obligations (Form 3), view all A-tokens held |
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
| A-token | ERC-721 (OZ v5) | — | Fisc-registered economic claims — see §3.5. Name: "SPICE A-Token", symbol: "ATOKE". Public transfers blocked; Colony-mediated only. On-chain tokenURI. |
| C-token | ERC-721 (OZ v5) | — | Colony identity token. Name: "SPICE Colony", symbol: "COLONY". Minted to Colony contract address by ColonyRegistry on register(). Soulbound. Burned on deregister(), reminted on reregister(). ownerOf(id) == Colony contract — cannot be orphaned by key loss. On-chain tokenURI with name/slug/address/founder/date. |

**UBI:** 1,000 S per citizen per epoch. First tranche on join().
**Savings cap:** 200 S→V per epoch for citizens. No cap for companies.
**V dividend:** FD or secretary calls `declareDividend(uint256 vAmount)` → distributes declared amount pro-rata to all equity holders (vested and unvested). Remainder stays in V reserve. Current deployed v1 distributes the entire V balance (see §3.4). V dividend events (`VDividendPaid`) appear in the citizen dashboard transaction history.
**Equity:** Company shares are A-token pairs (§3.5). Participant equity vests over 1–12 monthly tranches; month-N tranche is larger (commitment bonus). Unvested shares receive dividends, cannot be transferred. Vested shares are permanently transferable. AToken.sol is deployed (April 2026) — equity A-tokens are visible as NFTs. CompanyImplementation v1 still stores founding equity as internal arrays; v2 (beacon upgrade) needed to issue A-token equity for new participants.
**Assets & Obligations:** Citizens and companies register physical assets and create payment obligations via `/colony/:slug/assets` (Assets.jsx). AToken.sol (Form 1 + Form 3) handles registration and settlement on-chain.
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
- Colony list source: ColonyRegistry on-chain only — no `contracts.json` or `localStorage` fallbacks
- `contracts.json` retained as a token-address lookup cache (sToken/vToken/gToken per colony slug)

### spice.zpc.finance (protocol admin)
- **No build step** — `spice-admin/index.html` is served as static HTML with ethers.js loaded from CDN
- `spice-admin/config.js` contains ColonyRegistry address (`0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68`)
- Stats (colony count, fee rate, total pending fees, treasury address) load read-only on page open
- Owner actions (update fee, update treasury, per-colony overrides) require MetaMask connect

### Colony Deploy Flow (CreateColony.jsx) — 18 steps

The colony deploy wizard in `app.zpc.finance/create` guides the founder through a single
MetaMask-confirmed flow. All ABIs and bytecodes are loaded lazily from `deployArtifacts.js`.

**Pre-flight checks (before first MetaMask prompt):**
1. Network check — must be Base Sepolia (chain ID 84532)
2. Balance check — deployer wallet must hold ≥ 0.005 ETH
3. Slug availability check — `ColonyRegistry.slugToColony(slug)` must return `address(0)`

**Deploy steps (steps 1–18 — each requires MetaMask confirmation):**
GToken deploy → SToken deploy → VToken deploy → Colony deploy → GToken ownership transfer →
SToken ownership transfer → VToken ownership transfer → OToken deploy → Colony mint O-token →
OToken ownership transfer → Colony setOToken → CompanyImpl deploy → UpgradeableBeacon deploy →
CompanyFactory deploy → Colony setCompanyFactory → MCCBilling deploy → MCCServices deploy →
Governance deploy (constructor: colonyAddr, founder×3) → Colony setGovernance(govAddr)

> The deploy script (`scripts/deploy.js`) handles all 18 steps. Governance is step 16:
> `deploy("Governance", colonyAddr, deployer.address, deployer.address, deployer.address)` →
> `colonyC.setGovernance(govAddr)`. Governance address is written to `contracts.json` as `governance`.

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
| Equity stored as internal arrays (v1) | CompanyImplementation founding equity is in internal arrays, not AToken pairs — no NFT representation for founding shares | CompanyImplementation v2 (beacon upgrade) — issue equity via AToken.issueEquity(); migrate founding arrays |
| Colony.sol epoch advance (v1) does not settle obligations | AToken obligations exist on-chain but advanceEpoch() does not call markObligationPaid() yet — obligations must be settled manually or wait for Colony.sol v2 | Colony.sol v2 — add obligation settlement loop to advanceEpoch(); new deploy required |
| Debug console.logs in Company.jsx | [Company] getEquityTable raw + AToken.getVestingStake logs left in after debugging vesting display bug | Remove before next major release |
| MCC office-term equity not implemented | Board compensation via permanent equity; no auto-redemption on term end | CompanyImplementation v2 `redeemDirectorShares()` + Colony governance integration |
| Governance testnet timing constants | NOMINATION=5min, VOTING=15min, TIMELOCK=5min. Fine for testing; must be changed for mainnet (7/14/7 days) | Update constants in Governance.sol before mainnet deploy |
| Citizen enumeration relies on GToken loop | /api/citizens.js calls ownerOf+citizenName for each tokenId 1..nextTokenId. O(n) on-chain calls; fine at colony scale (10s of citizens) | At large scale use an indexer (The Graph) |
| No mainnet | Testnet only | Audit → Base mainnet |
| Supabase activity log has no auth | Anyone with the anon key can insert | Add row-level security or switch to service key |
| Beacon ownership | UpgradeableBeacon owned by deployer EOA | Transfer to governance contract when ready |

---

## 10. Future Architecture

### Core v2 contracts (required for v17 economic model)

- **~~AToken.sol~~** — ✓ **Deployed April 2026.** ERC-721 economic claims registry at `0xD0983C309f87Aa50e164a9876EAa64bA43Ac0Cd2`. All three forms (unilateral asset, paired equity, paired fixed-obligation) are live. Obligation settlement at epoch advance is the remaining gap (Colony.sol v2 required).
- **CompanyImplementation v2** — replaces internal equity arrays with AToken reads; adds `declareDividend(uint256 vAmount)`, vesting issuance (`issueEquity` via AToken), `forfeitUnvestedShares`, `buybackShares`, `redeemDirectorShares` for MCC office-term. Beacon upgrade — all existing companies upgrade simultaneously.
- **Colony.sol v2** — advanceEpoch settles all outstanding obligation liability tokens before UBI issuance; calls `AToken.markObligationPaid()` / `markObligationDefaulted()` as appropriate. New colony deploy required (Colony.sol is not proxy-upgradeable in v1).

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
- **~~ColonyRegistry v2~~** — ✓ **Deployed 19 April 2026.** ColonyRegistry redeployed as ERC-721 at `0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68`. Per-colony fee override, deregister/reregister, and soulbound C-token all live.

---

*SPICE Colony · Technical Architecture · v9*
*Last updated: 20 April 2026*
*v4 changes: ColonyRegistry deployed (§3.1); spice-admin/ repo structure (§2); 18-step deploy flow + pre-flight checks (§8); three-project Vercel setup with ignoreCommand (§8); deployArtifacts.js noted (§2, §3); "No ColonyRegistry" removed from Known Limitations (§9); ColonyRegistry removed from Future Architecture (§10).*
*v5 changes: AToken.sol planned contract spec added (§3.5) — three forms (unilateral asset, paired equity, paired fixed-obligation), escrow sub-registry, UBI cap enforcement, vesting schedule. CompanyImplementation updated (§3.4) — v1 current interface vs v2 target interface with vesting, declareDividend, office-term equity. Colony.sol advanceEpoch target behaviour documented (obligation settlement before UBI). Section numbers updated (§3.5 AToken, §3.6 OToken, §3.7 GToken, §3.8 SToken/VToken). Token economics table updated (§7) — A-token and v17 dividend model. Known Limitations updated (§9) — intra-month contracts superseded, v1/v2 delta items added, AToken and Colony v2 gaps listed. Future Architecture expanded (§10) — core v2 contracts, gas model decision.*
*v6 changes (18 April 2026): AToken.sol deployed as full ERC-721 (§3.5 rewritten) — address 0xD0983C309f87Aa50e164a9876EAa64bA43Ac0Cd2, OZ v5 ERC721 inheritance, Colony-controlled transfers, on-chain tokenURI. Dave's Colony redeployed with new addresses (slug: daves-colony). Assets.jsx added — route /colony/:slug/assets for citizen asset and obligation management (§4.3 route map). Token economics table updated — A-token is ERC-721. Known Limitations updated — AToken not deployed removed; Colony.sol v1 obligation settlement gap noted; debug console.log cleanup noted. Future Architecture updated — AToken.sol marked deployed.*
*v7 changes (19 April 2026): ColonyRegistry redeployed as ERC-721 (§3.1 rewritten) — address 0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68. Each register() mints a soulbound C-token ("SPICE Colony"/"COLONY") to the Colony contract address; deregister() burns it; reregister() remints same token ID; tokenURI() returns on-chain JSON. C-token design rationale: ownerOf == Colony contract (not founder EOA), so colony cannot be orphaned by key loss. Directory.jsx updated to read registry exclusively — contracts.json and localStorage no longer colony sources. Token table updated — C-token added. Repository structure comments updated. Future Architecture: ColonyRegistry v2 marked deployed.*
*v8 changes (19 April 2026): Governance.sol deployed and wired (§3.9 new section). Dave's Colony redeployed — all contract addresses updated (§3.1). Colony.sol join() updated: accepts birth year (not Unix timestamp) + setGovernance() + issueObligationGov() + CEO active check in advanceEpoch() (§3.2). addrLabel.js added to repo structure (§2) — shortAddr, namedAddr, resolveNames batch helpers. Deploy steps updated to 18+Governance (§8). Known Limitations: "Governance not in deploy script" replaced with "Votes.jsx elections UI incomplete" (§9). MCC Ledger tab added to Admin.jsx — double-entry events view for all colony financial activity.*
*v9 changes (20 April 2026): Governance.sol redesigned to multi-candidate plurality elections (§3.9 rewritten) — openElection / nominateCandidate / vote(candidate) / finaliseElection / executeElection / resign(). New Election struct with nominationEndsAt, votingEndsAt, timelockEndsAt, winner, executed, cancelled. New Governance address 0x7D885120a8766A6B6ce951f3fbf342046c485240. Dave's Colony redeployed — all contract addresses updated (§3.1). citizens.js serverless function added (§2) — enumerates citizens via GToken.nextTokenId() + ownerOf() + citizenName() loop; more reliable than getLogs. fetchCitizens.js utility added (§2). System overview diagram updated (§1). Known Limitations: "Votes.jsx UI incomplete" replaced with testnet timing constants + citizen enumeration scale note (§9).*
