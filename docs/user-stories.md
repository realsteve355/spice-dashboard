# SPICE Colony — User Stories & Requirements Spec

*Working spec for app.zpc.finance. Stories organised by role, then priority.*

**Priority:** P1 = MVP · P2 = Phase 1 extended · P3 = Phase 2 / future

**Status:** ✓ Done (on-chain) · ~ Partial / UI-only mock · — Not built

---

## Role 1 — Citizen

A registered member of a colony. Holds one G-token, receives 1,000 S-tokens monthly,
may save into V-tokens, spend with companies, hold equity, and vote on MCC governance.

### Registration & Identity

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-01 | As a citizen, I want to connect my MetaMask wallet so I can interact with the colony | P1 | ✓ |
| C-01a | As a returning user, I want the app to auto-connect my wallet on page load without prompting | P1 | ✓ |
| C-02 | As a prospective citizen, I want to browse a colony's public page so I can decide whether to join | P1 | ✓ |
| C-03 | As a prospective citizen, I want to read the founding constitution before committing | P1 | ✓ |
| C-04 | As a prospective citizen, I want to sign the founding constitution on-chain and receive my G-token and first UBI | P1 | ✓ |
| C-04a | As a prospective citizen, I want to register my name on-chain at signup so my identity is verifiable | P1 | ✓ |
| C-05 | As a new citizen, I want to see a confirmation screen after joining with a link to my dashboard | P1 | ✓ |
| C-06 | As a citizen, I want to register a partner wallet so inheritance defaults are set | P2 | ~ |
| C-07 | As a citizen, I want to register offspring wallet addresses for inheritance | P2 | ~ |
| C-08 | As a citizen, I want to update my inheritance designation at any time | P2 | ~ |
| C-09 | As a citizen of multiple colonies, I want to switch between colony dashboards | P1 | ✓ |
| C-30 | As a citizen, I want to see my name, G-token ID, and wallet address prominently on the dashboard so I know which account I am using | P1 | ✓ |
| C-31 | As a citizen, I want to see all A-tokens and L-tokens registered to my wallet in one place | P2 | — |

*C-06–C-08: Profile page UI exists; inheritance logic is display-only, not on-chain.*

### S-Token (Spending)

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-10 | As a citizen, I want to see my current S-token balance prominently | P1 | ✓ |
| C-11 | As a citizen, I want to see how many days remain until the monthly reset | P1 | ✓ |
| C-12 | As a citizen, I want to see a breakdown of my spending this month | P1 | ✓ |
| C-13 | As a citizen, I want to send S-tokens to any address with an optional note | P1 | ✓ |
| C-13a | As a citizen (payer), I want to scan a merchant's QR code — which opens MetaMask directly — and confirm payment in one tap | P1 | ✓ |
| C-13b | As a citizen, I want to pay my MCC services bill on-chain from the dashboard | P1 | ✓ |
| C-14 | As a citizen, I want to see my full on-chain transaction history (payments sent/received, UBI, savings, redeems) with dates and labels | P1 | ✓ |
| C-15 | As a citizen, I want to see my projected MCC bill for the current month | P1 | ~ |
| C-16 | As a citizen, I want a warning if my S-token balance will not cover my projected MCC bill | P2 | — |

*C-13a: QR encodes a MetaMask deep link (metamask.app.link). Scanning with iPhone camera opens MetaMask app automatically. No separate scanner or app switching required.*
*C-14: Queries Sent, UbiClaimed, Saved, Redeemed events from Colony contract. Uses deployBlock as fromBlock to comply with RPC 10,000-block limit.*
*C-15: Shows month-to-date actual MCC bill, not a forward projection.*

### V-Token (Savings)

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-17 | As a citizen, I want to convert S-tokens to V-tokens (max 200 per month) on-chain | P1 | ✓ |
| C-18 | As a citizen, I want to see how much of my monthly savings allowance I have used | P1 | ✓ |
| C-19 | As a citizen, I want to see my total V-token balance | P1 | ✓ |
| C-20 | As a citizen, I want to redeem V-tokens back to S-tokens at 1:1 at any time | P1 | ✓ |
| C-21 | As a citizen, I want to see the mint date of my V-token batches to track the 100-year expiry | P2 | ~ |
| C-22 | As a citizen, I want a notification if a V-token batch is approaching its 100-year expiry | P3 | — |

### Governance

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-23 | As a citizen, I want to see my G-token ID and issuance confirmation | P1 | ✓ |
| C-24 | As a citizen, I want to vote in the annual MCC board election | P2 | ✓ |
| C-25 | As a citizen, I want to vote in a recall referendum if triggered | P2 | ✓ |
| C-26 | As a citizen, I want to vote on a constitutional amendment referendum | P2 | ~ |
| C-27 | As a citizen, I want to vote on a proposed MCC dividend distribution | P2 | ✓ |
| C-28 | As a citizen, I want to see the recall trigger status | P2 | ~ |
| C-29 | As a citizen, I want to see all open votes and their deadlines | P2 | ✓ |

*C-26: Voting UI works; constitutional amendment proposal type not yet seeded.*
*C-28: Recall status visible in MCC admin only.*

---

## Role 2 — Company Founder / Owner

Any citizen may register a company. The company earns S-tokens, converts net earnings
to V-tokens at month end, and distributes dividends to equity holders.

### Company Registration

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-01 | As a citizen, I want to register a new company with the Fisc | P1 | ✓ |
| F-02 | As a founder, I want to define founding equity stakes and assign them to wallet addresses | P1 | ✓ |
| F-03 | As a founder, I want to see my company's Fisc registration confirmed on-chain | P1 | ✓ |
| F-04 | As a founder, I want to view a company dashboard showing balance, revenue, and equity | P1 | ✓ |

### Company Finances

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-05 | As a company owner, I want to see my company's current S-token balance | P1 | ✓ |
| F-06 | As a company owner, I want to see my company's V-token reserve | P1 | ✓ |
| F-07 | As a company owner, I want to see all inbound and outbound S-token transactions | P1 | ✓ |
| F-07a | As a company owner, I want on-chain payment history from Colony contract events | P1 | ✓ |
| F-07b | As a company owner (merchant), I want to generate a QR code that opens MetaMask on the customer's phone so they can pay immediately | P1 | ✓ |
| F-08 | As a company owner, I want the Fisc to automatically convert net S-tokens to V-tokens at month end | P1 | ~ |
| F-09 | As a company owner, I want to redeem V-tokens → S-tokens to fund operations | P1 | ✓ |
| F-10 | As a company owner, I want to pay another company or citizen in S-tokens | P1 | ✓ |
| F-11 | As a company owner, I want to distribute V-token dividends to all equity holders | P1 | ~ |
| F-12 | As a company owner, I want to see projected month-end V-token conversion | P2 | ~ |

### Equity Management

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-13 | As a company owner, I want to see the full equity register | P1 | ✓ |
| F-14 | As a company owner, I want to issue new shares to a wallet address | P2 | — |
| F-15 | As a company owner, I want to transfer shares atomically | P2 | ~ |
| F-16 | As a company owner, I want to see the history of all share transfers | P2 | — |

### Intra-Month Contracts

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-17 | As a company owner, I want to create a forward purchase contract with escrowed S-tokens | P2 | ~ |
| F-18 | As a company owner, I want to create an escrowed payment released on delivery confirmation | P2 | ~ |
| F-19 | As a company owner, I want a revenue-sharing agreement routing a % of inbound S-tokens to a partner | P2 | ~ |
| F-20 | As a company owner, I want to see all active intra-month contracts | P2 | ~ |
| F-21 | As a company owner, I want to confirm delivery to release escrowed tokens | P2 | ~ |

### Assets & Land

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-22 | As a company owner, I want to register a physical asset above the threshold so it is on-chain verifiable | P2 | — |
| F-23 | As a company owner, I want to file a Harberger surface land claim by declaring a V-token value and paying the first epoch's stewardship fee | P2 | — |
| F-24 | As a company owner, I want to update my declared land value at any time to adjust the force-purchase price | P2 | — |
| F-25 | As a company owner, I want to see my outstanding stewardship fee per land parcel so I can pay before falling into arrears | P2 | — |
| F-26 | As a company owner, I want a notification when another citizen force-purchases one of my land parcels | P3 | — |

*F-08: Auto-conversion is a smart contract concern; UI shows estimated projection only.*
*F-11: Dividend distribution UI is display-only; on-chain distribution not yet wired.*
*F-15: Share listing (sell side) built; buy side not yet implemented.*
*F-17–F-21: Contracts tab UI is built; no on-chain contract; display-only mock.*
*F-22–F-26: AssetRegistry.sol is written and ready to deploy; no UI built yet.*

---

## Role 3 — Shareholder

Any citizen holding equity in one or more colony companies.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| S-01 | As a shareholder, I want to see all my equity positions (company, %, V-token value) | P1 | ✓ |
| S-02 | As a shareholder, I want to see my dividend history | P1 | ~ |
| S-03 | As a shareholder, I want to buy shares by paying S-tokens (atomic on-chain swap) | P2 | — |
| S-04 | As a shareholder, I want to sell shares to another citizen | P2 | ~ |
| S-05 | As a shareholder, I want to see a company's revenue and V-token reserve before buying | P2 | ✓ |
| S-06 | As a shareholder, I want to transfer shares as a gift | P2 | — |
| S-07 | As a shareholder, I want my shares included in my inheritance designation | P2 | — |

*S-02: Dividend history UI exists; data is mock.*
*S-04: Seller can list shares; buyer flow not yet built.*

---

## Role 4 — MCC Board Member

Elected annually by G-token holders. Runs essential services infrastructure and sets prices.

### Services & Billing

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-01 | As an MCC board member, I want to add a new service with name, billing basis, and price | P1 | ✓ |
| M-02 | As an MCC board member, I want to edit an existing service price | P1 | ✓ |
| M-03 | As an MCC board member, I want to remove a service | P1 | ✓ |
| M-04 | As an MCC board member, I want to see total MCC revenue for the current month | P1 | ~ |
| M-05 | As an MCC board member, I want to see revenue broken down by service | P1 | ~ |
| M-06 | As an MCC board member, I want to see each citizen's current month bill | P1 | ~ |
| M-07 | As an MCC board member, I want the Fisc to auto-deduct MCC bills at month end | P1 | ~ |

### Governance & Accountability

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-08 | As an MCC board member, I want to see the recall trigger status in real time | P1 | ~ |
| M-09 | As an MCC board member, I want an alert when approaching the recall threshold | P2 | — |
| M-10 | As an MCC board member, I want to propose a dividend distribution | P2 | — |
| M-11 | As an MCC board member, I want to see results of all G-token votes | P2 | ~ |
| M-12 | As an MCC board member, I want to see MCC V-token reserve and profit | P2 | — |
| M-13 | As an MCC board member, I want to add or remove a board member (subject to G-token vote) | P3 | — |

*M-01–M-03: Fully on-chain via MCCServices contract.*
*M-04–M-08: UI built; revenue/billing data is currently mock.*

---

## Role 5 — Guardian

An adult citizen managing a child citizen's wallet.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| G-01 | As a guardian, I want to register a child with the Fisc and link them to my wallet | P2 | ~ |
| G-02 | As a guardian, I want to see the child's S-token balance and MCC bill | P2 | ~ |
| G-03 | As a guardian, I want to convert up to 200 of the child's S-tokens to V-tokens each month | P2 | ~ |
| G-04 | As a guardian, I want to see the child's accumulated V-token balance | P2 | ~ |
| G-05 | As a guardian, I want to pay the child's MCC bill from their S-token allocation | P2 | ~ |
| G-06 | As a guardian, I want the wallet to automatically transfer to the child at age 18 | P2 | ~ |
| G-07 | As a guardian, I want to designate a backup guardian | P3 | — |

*G-01–G-06: Guardian page UI is fully built; all data is mock. No on-chain guardian contract exists yet.*

---

## Role 6 — Colony Founder

A citizen deploying a new colony.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| N-01 | As a colony founder, I want to name my colony and generate a unique URL slug | P1 | ✓ |
| N-02 | As a colony founder, I want to designate founding MCC board wallet addresses | P1 | ✓ |
| N-03 | As a colony founder, I want to review and accept the fixed founding constitution | P1 | ✓ |
| N-04 | As a colony founder, I want to deploy the Fisc contracts to the blockchain in one transaction | P1 | ✓ |
| N-05 | As a colony founder, I want to receive the first G-token and start receiving UBI from Month 1 | P1 | ✓ |
| N-06 | As a colony founder, I want a shareable invite URL and QR code to recruit citizens | P1 | ~ |
| N-07 | As a colony founder, I want to see my colony appear in the public directory immediately | P1 | ~ |
| N-08 | As a colony founder, I want to set an optional colony description and logo | P2 | ~ |
| N-09 | As a colony founder, I want to create my colony from zpc.finance (the platform layer) rather than from inside the colony app | P1 | ✓ |

*N-04: Deploy wizard available on both zpc.finance/create-colony (primary) and app.zpc.finance/create (legacy, to be removed).*
*N-06: Invite URL copyable; QR not yet generated.*
*N-07: Colony directory on zpc.finance reads live on-chain data (citizenCount, epoch) via JsonRpcProvider. Still requires manual colonies.js update after each new deploy — auto-listing requires a ColonyRegistry contract.*
*N-09: zpc.finance/create-colony — name input, MetaMask connect, deploy, success screen with colony URL and colonies.js entry to add.*

---

## Role 7 — Asset Owner

Any citizen or company wallet that has registered a physical asset (A-token) or
claimed surface land (L-token) via the AssetRegistry contract. Both assets are
ERC-721 tokens; A-tokens transfer freely between owners, L-tokens change hands
only via force-purchase at the declared Harberger price.

### Physical Assets (A-tokens)

Registration is required when: declared S-equivalent value > 500 S, weight > 50 kg,
or the asset has autonomous AI capability. Below those thresholds, possession
implies ownership with no on-chain record needed.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| A-01 | As a citizen, I want to register a physical asset (robot, vehicle, AI hardware) on-chain so that ownership is verifiable by any party | P2 | — |
| A-02 | As an asset owner, I want to transfer an A-token to another citizen or company wallet so that ownership changes are recorded on-chain | P2 | — |
| A-03 | As any citizen, I want to browse the public asset registry and see all registered assets, their owners, declared values, and weight | P2 | — |
| A-04 | As an asset owner, I want to see all A-tokens registered to my wallet with their details on a single page | P2 | — |

*A-01: threshold check: valueSTokens > 500 × 10^18 OR weightKg > 50 OR hasAutonomousAI. Below threshold, no registration required.*
*A-02: uses AssetRegistry.transferAsset(tokenId, to) — standard ERC-721 transferFrom is blocked.*
*A-01–A-04: AssetRegistry.sol written; not yet deployed; no UI built.*

### Harberger Land (L-tokens)

Surface land operates under Harberger taxation. The owner always has a publicly
declared price; anyone may force-purchase at that price at any time. The stewardship
fee (0.5% of declared value per epoch) is paid in V-tokens to the colony treasury.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| A-05 | As a citizen, I want to claim an unclaimed surface parcel by declaring a V-token value and paying the first epoch's stewardship fee | P2 | — |
| A-06 | As a land owner, I want to update my declared value at any time, which also updates the force-purchase price and future fee amount | P2 | — |
| A-07 | As a land owner, I want to see my outstanding stewardship fees and pay them in V-tokens before accruing more epochs of arrears | P2 | — |
| A-08 | As any citizen, I want to browse all land parcels with their declared values so I can identify land available for force-purchase | P2 | — |
| A-09 | As a citizen, I want to force-purchase a land parcel at its declared V-token price — the current owner cannot refuse | P2 | — |
| A-10 | As a land owner, I want to see a warning on my dashboard when I have unpaid stewardship epochs outstanding | P2 | — |
| A-11 | As a land owner, I want to see the ownership and valuation history of my parcel (LandPurchased, LandValueUpdated events) | P3 | — |

*A-05: claimLand(name, description, declaredValueV, currentEpoch) — pulls first-epoch fee via ERC-20 transferFrom.*
*A-06: updateLandValue — owner only; does not charge a fee at time of change.*
*A-07: paystewardship(tokenId, currentEpoch) — fee = 0.5% × declaredValueV × epochsDue.*
*A-09: purchaseLand(tokenId) — buyer pays declaredValueV in V-tokens; NFT transfers immediately.*
*A-05–A-11: AssetRegistry.sol written; not yet deployed; no UI built.*

---

## Status Summary

| Status | Count | % |
|--------|-------|---|
| ✓ Done (on-chain) | 43 | 42% |
| ~ Partial / UI mock | 28 | 27% |
| — Not built | 32 | 31% |
| **Total** | **103** | |

### On-chain vs mock — what is genuinely live on Base Sepolia

| Feature | Contract | Status |
|---------|----------|--------|
| Wallet connect + auto-connect | MetaMask / ethers.js | ✓ Live |
| Create colony (zpc.finance) | ContractFactory.deploy() on zpc.finance | ✓ Live |
| Join colony + citizen name | Colony.join(string) | ✓ Live |
| G-token issuance (soulbound NFT, on-chain SVG) | GToken.mint() | ✓ Live |
| S-token UBI issuance | SToken.issueUbi() | ✓ Live |
| S-token balance | SToken.balanceOf() | ✓ Live |
| V-token balance | VToken.balanceOf() | ✓ Live |
| S → V conversion | Colony.saveToV() | ✓ Live |
| V → S redemption | Colony.redeemV() | ✓ Live |
| Send S-tokens (with note) | Colony.send() | ✓ Live |
| Pay MCC bill | Colony.send() to founder | ✓ Live |
| QR payment request (MetaMask deep link) | — (URL params) | ✓ Live |
| Transaction history | Event log queries | ✓ Live |
| Claim UBI | Colony.claimUbi() | ✓ Live |
| MCC services CRUD | MCCServices contract | ✓ Live |
| Governance proposals + voting | Governance contract | ✓ Live |
| Company registration + equity | CompanyRegistry contract | ✓ Live |
| Asset registration (A-tokens) | AssetRegistry.registerAsset() | Not deployed |
| Harberger land claims (L-tokens) | AssetRegistry.claimLand() | Not deployed |
| MCC revenue / citizen billing | — | Mock only |
| Intra-month contracts | — | Mock only |
| Guardian management | — | Mock only |
| Share trading (buy side) | — | Not built |

### Remaining P1 gaps

| # | Story | Notes |
|---|-------|-------|
| C-15 | Forward MCC bill projection | Shows MTD actual; forward estimate needs usage-rate model |
| N-07 | Auto-list deployed colonies in directory | Directory is static mock |
| M-04–M-06 | MCC revenue and billing data | Needs on-chain billing aggregation |

---

*SPICE Colony · User Stories & Requirements Spec · v5*
*Last updated: April 2026*
