# SPICE Colony — Technical Architecture

*app.zpc.finance · Base Sepolia testnet · April 2026*

---

## 1. System Overview

The SPICE Colony app is a decentralised community economic system. Citizens hold
tokens, spend with companies, save in V-tokens, and govern the MCC — all on-chain.
The frontend is a React SPA; there is no backend server. All state lives on-chain or
in ethers.js in-memory context.

```
Browser (React SPA)
    │
    ├── MetaMask (wallet, transaction signing)
    │       └── Base Sepolia RPC (https://sepolia.base.org)
    │
    └── Vercel CDN (static hosting)
            └── app.zpc.finance
```

---

## 2. Repository Structure

```
spice-dashboard/                  # Root — main SPICE research site (zpc.finance)
│   src/                          # React pages: Home, Collision, Simulation, etc.
│   public/                       # Static assets, spice-methodology.html
│   vercel.json                   # Main site routing
│
└── colony-app/                   # Colony app (app.zpc.finance)
    ├── src/
    │   ├── App.jsx               # Router, WalletCtx, on-chain data loader
    │   ├── pages/                # One file per route
    │   │   ├── Directory.jsx
    │   │   ├── ColonyPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Admin.jsx
    │   │   ├── Company.jsx
    │   │   ├── RegisterCompany.jsx
    │   │   ├── Votes.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Guardian.jsx
    │   │   ├── RequestPayment.jsx
    │   │   └── PaymentConfirm.jsx
    │   ├── components/
    │   │   ├── Layout.jsx        # Shell: header, back button, nav
    │   │   └── SendSheet.jsx     # Reusable send S-tokens inline form
    │   └── data/
    │       ├── contracts.json    # Deployed contract addresses + deployBlock
    │       └── mock.js           # Mock data for features not yet on-chain
    ├── contracts/
    │   ├── src/                  # Solidity source files
    │   ├── scripts/deploy.js     # Hardhat deploy script
    │   └── hardhat.config.js
    └── vercel.json               # Colony app routing (catch-all rewrite)
```

---

## 3. Smart Contracts

Deployed on **Base Sepolia** (chain ID 84532). All contracts verified.

### 3.1 Contract Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| Colony | `0x112240357669CC163011C729F0fE219A799838B5` | Main Fisc — entry point for all citizen actions |
| GToken | `0x50568a432E91a85161FFDdE8dA9dFe333Ed73a5f` | ERC-721 soulbound governance NFT, one per citizen |
| SToken | `0xbEb225D184dD27Df728EE2871a8207F91ead32e4` | ERC-20 spending token (UBI-issued, 18 decimals) |
| VToken | `0xcdf651d4EE8f0FFD6f8cb857bFB8bF4FC721DEF1` | ERC-20 savings token (18 decimals) |
| Governance | `0xC60c72dc36Fe422E747C5A76ac76164fE3beB705` | Proposals and G-token voting |
| CompanyRegistry | `0x92d8F29F07889434559c9D9ab9EBc9444365FC94` | Fisc company registration |
| MCCServices | `0x1d7Abc42621729807d2Dfb6Fc6a60D50B79A45c4` | MCC services catalogue |

Deployment block: **40,073,500** (used as fromBlock for all event queries).

### 3.2 Colony.sol — Core Fisc

The central contract. Owns GToken, SToken, and VToken contracts.

```
constructor(string colonyName)
    → deploys GToken, SToken, VToken

join(string name)
    → isCitizen[msg.sender] = true
    → citizenName[msg.sender] = name
    → gToken.mint(msg.sender)
    → sToken.issueUbi(msg.sender)         // 1000 S immediately
    emits CitizenJoined, UbiClaimed

claimUbi()                                 // once per epoch
    → sToken.issueUbi(msg.sender)
    emits UbiClaimed

saveToV(uint256 amount)
    → sToken.burn(msg.sender, amount)
    → vToken.mint(msg.sender, amount)
    emits Saved

redeemV(uint256 amount)
    → vToken.burn(msg.sender, amount)
    → sToken.issueUbiRaw(msg.sender, amount)
    emits Redeemed

send(address to, uint256 amount, string note)
    → sToken.colonyTransfer(from, to, amount)
    emits Sent(from, to, amount, note)     // ← used for payment history

advanceEpoch()                             // founder only, monthly
setName(string name)                       // update citizen display name
```

**Key state:**
```solidity
mapping(address => bool)   public isCitizen;
mapping(address => string) public citizenName;
address[] public citizens;
address public founder;
```

### 3.3 GToken.sol — Governance NFT

- ERC-721, soulbound (transfers blocked except mint)
- On-chain SVG metadata — renders in MetaMask without external hosting
- `tokenOf(address)` returns token ID, or 0 if none

### 3.4 SToken.sol — Spending Token

- ERC-20, 18 decimals
- `issueUbi(address)` — mints 1,000 tokens, enforces one-per-epoch
- `colonyTransfer(from, to, amount)` — colony-authorised transfer (bypasses allowance)
- `burn(address, amount)` — colony-authorised burn for S→V conversion

### 3.5 VToken.sol — Savings Token

- ERC-20, 18 decimals
- Minted by Colony on `saveToV()`, burned on `redeemV()`
- Monthly savings cap (200 S per epoch) enforced in Colony

### 3.6 Governance.sol

- `createProposal(type, description, options[], durationDays)`
- `vote(proposalId, optionIndex)` — one vote per G-token
- `getProposal(id)` — returns proposal state and vote counts

### 3.7 CompanyRegistry.sol

- `register(name, wallets[], stakes[])` — stakes in basis points (100 = 1%)
- emits `CompanyRegistered(id, name, founder)`

### 3.8 MCCServices.sol

- `addService(name, billing, price)` — MCC board only
- `editService(index, name, billing, price)`
- `removeService(index)`
- `getServices()` — returns full catalogue

---

## 4. Frontend Architecture

### 4.1 Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 19 | Vite 6 build |
| Routing | React Router v7 | Client-side, catch-all rewrite on Vercel |
| Web3 | ethers.js v6 | Wallet connection, contract calls, event queries |
| Styling | Inline JS objects only | No CSS files, no Tailwind, no CSS modules |
| Font | IBM Plex Mono | Monospace throughout |
| QR codes | qrcode.react (QRCodeSVG) | Payment request QR generation |
| Hosting | Vercel | Manual deploy of colony-app; main site auto-deploys |

### 4.2 WalletCtx — Global State

`App.jsx` provides a single React context (`WalletCtx`) consumed by all pages via `useWallet()`.

```
WalletCtx {
  address          string | null      Connected wallet address
  provider         BrowserProvider    ethers.js provider
  signer           Signer             For write transactions
  chainId          number             Should be 84532 (Base Sepolia)
  isConnected      bool
  onChainLoading   bool               True while loadOnChainData running
  onChain          { [colonyId]: {    Loaded on connect and refresh
    sBalance, vBalance, gTokenId,
    isCitizen, citizenName
  }}
  connect()        → prompts MetaMask, loads on-chain data
  disconnect()     → clears all state
  refresh(delayMs) → re-loads on-chain data (default 1500ms delay for RPC lag)
  isCitizenOf(id)  → bool (on-chain if contract exists, mock fallback otherwise)
  isMccOf(id)      → bool (mock only for now)
  citizenColonies  string[]           Colony IDs this wallet is a citizen of
  contracts        contracts.json     Injected for contract address lookups
}
```

**Auto-connect:** On mount, App.jsx calls `eth_accounts` (read-only, no popup). If MetaMask has a previously authorised account, `connect()` is called silently. This means the dashboard loads with real on-chain data without requiring the user to click Connect.

### 4.3 Route Map

| Path | Component | Auth |
|------|-----------|------|
| `/` | Directory | Public |
| `/colony/:slug` | ColonyPage | Public |
| `/colony/:slug/dashboard` | Dashboard | Citizen |
| `/colony/:slug/admin` | Admin | MCC board |
| `/colony/:slug/company/new` | RegisterCompany | Citizen |
| `/colony/:slug/company/:id` | Company | Citizen |
| `/colony/:slug/votes` | Votes | Citizen |
| `/colony/:slug/profile` | Profile | Citizen |
| `/colony/:slug/guardian` | Guardian | Citizen |
| `/colony/:slug/request` | RequestPayment | Citizen |
| `/colony/:slug/pay` | PaymentConfirm | Citizen |
| `/create` | CreateColony | Public |

### 4.4 On-Chain Data Loading

`loadOnChainData(addr, provider)` runs on connect and on explicit refresh.
For each colony in `contracts.json` it reads:

```
Promise.all([
  sToken.balanceOf(addr),
  vToken.balanceOf(addr),
  gToken.tokenOf(addr),
  colony.isCitizen(addr),
])
// then, if citizen:
colony.citizenName(addr)
```

Results stored in `onChain[colonyId]`. Errors are caught per-colony and logged; other colonies still load.

### 4.5 Transaction History

Dashboard queries five event types from the Colony contract, scoped to `deployBlock` → latest to stay within the Base Sepolia public RPC 10,000-block `eth_getLogs` limit:

```
Sent(from=addr, *)      → outbound payments
Sent(*, to=addr)        → inbound payments
UbiClaimed(citizen=addr)
Saved(citizen=addr)
Redeemed(citizen=addr)
```

Block timestamps are fetched in parallel (unique blocks only) then formatted. Events sorted by block number descending.

---

## 5. Payment Flow

The QR payment flow is the primary point-of-sale mechanism.

```
Merchant (PC or phone)                  Customer (iPhone)
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

                                        4. Point iPhone camera at QR
                                        5. iOS universal link opens MetaMask app
                                        6. MetaMask in-app browser loads /pay URL
                                        7. PaymentConfirm page shows:
                                           - amount, note, recipient
                                           - S balance check (green/red)
                                        8. Tap "Confirm & Pay"
                                           → colony.send(to, amount, note)
                                        9. MetaMask signs + broadcasts

4. Dashboard refreshes after 1.5s
   showing new balance and Sent event
   in transaction history
```

**No backend required.** Payment details travel in the URL. The transaction is a direct on-chain call from the customer's wallet.

---

## 6. Token Economics (Testnet)

| Token | Ticker | Standard | Decimals | Supply mechanism |
|-------|--------|----------|----------|-----------------|
| S-token (SPICE) | SSPICE | ERC-20 | 18 | Minted by Colony on UBI claim |
| V-token | VSPICE | ERC-20 | 18 | Minted by Colony on saveToV() |
| G-token | GSPICE | ERC-721 | — | One per citizen, soulbound |

**UBI:** 1,000 S-tokens per citizen per epoch. First tranche issued on `join()`.

**Savings cap:** 200 S → V per epoch (enforced in Colony contract).

**Redemption:** V → S is unrestricted in quantity.

**Inter-colony settlement:** Not yet implemented. Reserved for BTC/ETH/SOL.

---

## 7. Deployment

### Colony App (app.zpc.finance)

- Separate Vercel project from the main site
- **Not** auto-deployed on git push — must be manually promoted in Vercel dashboard
- Build process: `npm run build` in `colony-app/`, then promote latest Vercel deployment to production
- `vercel.json`: catch-all rewrite to `/` for React Router

### Main Site (zpc.finance)

- Auto-deploys from `master` branch on GitHub push
- Vercel project at root of repo
- `vercel.json`: catch-all rewrite excluding `/spice-methodology.html`

### Smart Contract Deployment

- Hardhat v2, Solidity 0.8.25, evmVersion: cancun
- Deploy via `npx hardhat run scripts/deploy.js --network baseSepolia`
- Writes new addresses to `colony-app/src/data/contracts.json` automatically
- Each deploy is a full fresh deployment (Colony deploys GToken/SToken/VToken internally)
- **Note:** Base Sepolia public RPC sometimes has stuck mempool issues ("replacement transaction underpriced"). Pattern: hardcode successfully deployed addresses in deploy script and resume from next contract.

---

## 8. Known Limitations & Technical Debt

| Item | Impact | Fix |
|------|--------|-----|
| Base Sepolia RPC 10,000-block log limit | Event queries must use deployBlock as fromBlock | Already fixed; deployBlock in contracts.json |
| RPC staleness after tx.wait() | Balances show stale for ~1.5s after transaction | refresh() has 1500ms delay; manual ↻ button on dashboard |
| No auto-deployment of colony-app | Every code change requires manual Vercel promotion | Connect colony-app to GitHub auto-deploy in Vercel settings |
| MetaMask only (no WalletConnect) | iOS users must use MetaMask in-app browser | Add WalletConnect v2 for broader wallet support |
| QR payment requires MetaMask installed | Limits payment to MetaMask users | WalletConnect would broaden this |
| Mock data for MCC billing, guardians, intra-month contracts | These features show UI but no real data | Requires additional smart contracts |
| Colony directory is static mock | New colonies don't appear automatically | Deploy a ColonyRegistry contract |
| Single colony hardcoded in contracts.json | Multi-colony support requires registry | ColonyRegistry + dynamic contracts.json |
| No mainnet deployment | Testnet only | Audit contracts → deploy to Base mainnet |

---

## 9. Future Architecture — Native App

For a production payment experience, the web app should be complemented by a native app:

- **React Native** — shares token/contract logic, adds NFC tap-to-pay
- **WalletConnect v2** — connects any mobile wallet without MetaMask dependency
- **NFC tap** — requires native iOS/Android app; Apple restricts NFC to native code
- **Push notifications** — for received payments and UBI issuance

Recommended sequence:
1. WalletConnect v2 integration (web app, no new app needed)
2. React Native app with WalletConnect
3. NFC tap when native app is stable

---

*SPICE Colony · Technical Architecture · v1*
*Last updated: April 2026*
