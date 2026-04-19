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
| C-31 | As a citizen, I want to see all A-tokens registered to my wallet in one portfolio view — assets, equity positions, and bilateral obligations | P2 | ~ |

*C-06–C-08: Profile page shows on-chain identity (name, G-token, balances). Inheritance designation form replaced with a stub — on-chain implementation pending.*

### S-Token (Spending)

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-10 | As a citizen, I want to see my current S-token balance prominently | P1 | ✓ |
| C-11 | As a citizen, I want to see how many days remain until the monthly reset | P1 | ✓ |
| C-12 | As a citizen, I want to see a breakdown of my spending this month | P1 | ✓ |
| C-13 | As a citizen, I want to send S-tokens to any address with an optional note | P1 | ✓ |
| C-13a | As a citizen (payer), I want to scan a merchant's QR code — which opens MetaMask directly — and confirm payment in one tap | P1 | ✓ |
| C-13b | As a citizen, I want to pay my MCC services bill on-chain from the dashboard, with payment going to the MCC treasury (not the founder's personal wallet) | P1 | ✓ |
| C-14 | As a citizen, I want to see my full on-chain transaction history (payments sent/received, UBI, savings, redeems, V dividends received) with dates and labels | P1 | ✓ |
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
| F-08 | As a company owner, I want the Fisc to automatically convert all net S-tokens to V-tokens at epoch advance so no earnings are destroyed by the monthly reset | P1 | ~ |
| F-09 | As a company owner, I want to redeem V-tokens → S-tokens to fund operations | P1 | ✓ |
| F-10 | As a company owner, I want to pay another company or citizen in S-tokens | P1 | ✓ |
| F-11 | As the company FD, I want to declare a specific V-token dividend amount each month so that the Fisc distributes that amount pro-rata to all shareholders (vested and unvested) while the remainder stays in the company's V reserve | P1 | ~ |
| F-11a | As a shareholder, I want to see the declared dividend amount and my expected share before the Fisc distributes | P2 | — |
| F-12 | As a company owner, I want to see projected month-end V-token conversion | P2 | ~ |

### Equity Management

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-13 | As a company owner, I want to see the full equity register — all current holders with their vested and unvested stakes in basis points | P1 | ~ |
| F-14 | As a company secretary, I want to issue vesting shares to a participant — specifying total stake and number of monthly tranches (1–12) — so they earn equity progressively | P2 | — |
| F-14a | As a company secretary, I want to issue open shares (no vesting) to an investor so they hold equity immediately | P2 | — |
| F-15 | As a shareholder, I want to transfer vested shares to another wallet atomically; unvested shares may not be transferred | P2 | ~ |
| F-15a | As a company secretary, I want to buy back shares from a holder at current NAV in S-tokens, with the bought-back shares cancelled (increasing NAV for remaining holders) | P2 | — |
| F-16 | As a company owner, I want to see the full history of share issuances, vesting events, transfers, buybacks, and forfeitures | P2 | — |

### Vesting Lifecycle

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-23 | As a participant, I want to claim my vested share tranches each month as they unlock so I can see and use my earned equity | P2 | — |
| F-24 | As a participant, I want to receive V-token dividends on both my vested and unvested shares from the first month I hold them | P2 | — |
| F-25 | As a company secretary, I want to forfeit a departing participant's unvested shares — returning them to the company for reallocation — in a single transaction | P2 | — |
| F-26 | As a participant, I want to see my vesting schedule: which tranches have vested, which are upcoming, and what V-token dividends I have received | P2 | — |

### Intra-Month Contracts — Superseded

> **F-17–F-21 are superseded.** Forward purchase contracts, escrowed payments, and revenue-sharing agreements were removed from the economic model in v16. Company cashflow timing is handled by V-token reserves (redeem V→S when expenditure precedes revenue). Commitments are handled by fixed-obligation A-tokens (§3.5 AToken.sol). These user stories are retained as historical record only.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-17 | ~~As a company owner, I want to create a forward purchase contract with escrowed S-tokens~~ | ~~P2~~ | Superseded |
| F-18 | ~~As a company owner, I want to create an escrowed payment released on delivery confirmation~~ | ~~P2~~ | Superseded |
| F-19 | ~~As a company owner, I want a revenue-sharing agreement routing a % of inbound S-tokens to a partner~~ | ~~P2~~ | Superseded |
| F-20 | ~~As a company owner, I want to see all active intra-month contracts~~ | ~~P2~~ | Superseded |
| F-21 | ~~As a company owner, I want to confirm delivery to release escrowed tokens~~ | ~~P2~~ | Superseded |

### Assets & Land

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-22 | As a company owner, I want to register a physical asset above the threshold so it is on-chain verifiable | P2 | ~ |
| F-23 | As a company owner, I want to file a Harberger surface land claim by declaring a V-token value and paying the first epoch's stewardship fee | P2 | — |
| F-24 | As a company owner, I want to update my declared land value at any time to adjust the force-purchase price | P2 | — |
| F-25 | As a company owner, I want to see my outstanding stewardship fee per land parcel so I can pay before falling into arrears | P2 | — |
| F-26 | As a company owner, I want a notification when another citizen force-purchases one of my land parcels | P3 | — |

### Company as Smart Contract

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-27 | As a citizen registering a company, I want the registration flow to deploy a company smart contract so the company has its own on-chain wallet address — not just a ledger entry | P1 | ✓ |
| F-28 | As a company owner, I want to share the company wallet address so customers can pay us directly via colony.send() without knowing anything about our internal equity structure | P1 | ✓ |

*F-08: Auto-conversion is a smart contract concern — requires Colony.sol v2 epoch advance trigger. Manual convertToV() call available in deployed v1 contracts.*
*F-11: Current deployed v1 `distributeVDividend()` distributes the **entire** V balance. v17 model requires FD to declare a specific amount via `declareDividend(uint256 vAmount)` — requires CompanyImplementation v2 (beacon upgrade).*
*F-13: Current v1 equity register reads internal `equityHolders[]` / `equityStakes[]` arrays on CompanyImplementation. v2 will read from AToken.sol equity pairs — shows vested vs unvested split per holder.*
*F-14/F-14a/F-23–F-26: Require AToken.sol (§3.5) and CompanyImplementation v2. Not yet deployed.*
*F-15: Current v1 proposeShareTransfer() on CompanyImplementation; full two-party approval flow. v2 replaces with AToken.transferEquity() — enforces vested-only transfer at contract level.*
*F-17–F-21: Superseded — intra-month contracts removed in v16 design decision. V-token reserve handles cashflow; A-token bilateral framework handles commitment. No contract to build.*
*F-22 (asset registration): AssetRegistry.sol written (pre-unification). Will be superseded by AToken.sol unilateral asset form; no separate UI built yet.*
*F-27–F-28: Completed April 2026. CompanyFactory deploys BeaconProxy instances of CompanyImplementation via UpgradeableBeacon. Company wallet address used as route param.*

---

## Role 2b — Organisation Secretary

The citizen who currently holds the O-token for a registered organisation. Initially the
founding citizen on company registration. May be transferred to any registered citizen when
the role changes hands. The MCC chair is also an O-token holder; their stories are in Role 4.

The O-token is not a voting instrument. The secretary votes in colony governance as a
citizen, using their personal G-token. The O-token authorises them to perform on-chain
operations on behalf of the organisation.

### O-Token Identity

| # | Story | Priority | Status |
|---|-------|----------|--------|
| OS-01 | As a citizen registering a company, I want to automatically receive the company O-token so I am the verified on-chain representative from day one | P1 | ✓ |
| OS-02 | As an organisation secretary, I want to see the O-token in my wallet with the company name, registration number, and org type so I can confirm my authority at a glance | P1 | ✓ |
| OS-03 | As any citizen, I want to look up any company and see who currently holds its O-token so I know who is authorised to act on its behalf | P1 | ✓ |
| OS-04 | As an organisation secretary, I want to transfer the O-token to another registered citizen when I hand over the role so the incoming secretary has full on-chain authority immediately | P1 | — |
| OS-05 | As any citizen, I want to see the O-token transfer history for a company so I can audit who has held the secretary role over time | P2 | — |

### Company Wallet Operations

| # | Story | Priority | Status |
|---|-------|----------|--------|
| OS-06 | As an organisation secretary, I want to see the company wallet's S-token balance, V-token reserve, and list of registered A-tokens and L-tokens in one dashboard view | P1 | — |
| OS-07 | As an organisation secretary, I want to convert the company's net S-token earnings to V-tokens in a single on-chain transaction | P1 | — |
| OS-08 | As an organisation secretary, I want to distribute V-token dividends to all equity holders in one transaction — amounts calculated automatically from the equity register in basis points | P1 | — |
| OS-09 | As an organisation secretary, I want to see a dividend history showing each distribution: date, total V-tokens distributed, and the per-holder breakdown | P2 | — |
| OS-10 | As an organisation secretary, I want to pay a supplier (citizen or company) in S-tokens from the company wallet with a note recorded on-chain | P1 | — |

### Asset Management

| # | Story | Priority | Status |
|---|-------|----------|--------|
| OS-11 | As an organisation secretary, I want to register a physical asset to the company wallet so it appears on-chain as company-owned | P2 | — |
| OS-12 | As an organisation secretary, I want to transfer a company-owned A-token to a citizen's wallet (e.g. on sale of company equipment) | P2 | — |
| OS-13 | As an organisation secretary, I want to file a Harberger land claim in the company's name, paying the first epoch's stewardship fee from the company's V-token reserve | P2 | — |

*OS-01–OS-03: Completed April 2026. OToken.sol deployed, CompanyFactory mints O-token on deployCompany(). Dashboard shows Active Roles section. OS-04+ not yet built.*

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

*S-02: Dividend history section exists in Company page; populated from VDividendPaid events once secretary calls distributeVDividend() on-chain.*
*S-04: Share transfer proposal UI exists in CompanyImplementation; full buy/sell flow not yet built.*

---

## Role 4 — MCC Board Member

Elected annually by G-token holders. Runs essential services infrastructure and sets prices.

### Services & Billing

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-01 | As an MCC board member, I want to add a new service with name, billing basis, and price | P1 | ✓ |
| M-02 | As an MCC board member, I want to edit an existing service price | P1 | ✓ |
| M-03 | As an MCC board member, I want to remove a service | P1 | ✓ |
| M-04 | As an MCC board member, I want to see total MCC revenue confirmed for the current month | P1 | ✓ |
| M-05 | As an MCC board member, I want to see revenue broken down by service | P1 | ~ |
| M-06 | As an MCC board member, I want to set and see each citizen's current month bill | P1 | ✓ |
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

### MCC Treasury & Roles

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-14 | As a colony founder, I want the MCC to have its own on-chain treasury wallet, separate from my personal wallet, so that colony funds and personal funds are never mixed | P1 | ✓ |
| M-15 | As MCC Chair, I want to grant the FD (Financial Director) role to another wallet address so that treasury operations can be delegated without giving away founder access | P1 | ✓ |
| M-16 | As MCC Chair, I want to revoke an MCC role from any address at any time | P1 | ✓ |
| M-17 | As MCC FD or Chair, I want to withdraw S-tokens from the treasury to a specified address with a reason recorded on-chain | P1 | ✓ |
| M-18 | As MCC Chair, I want to see all current MCC board role-holders in one panel | P1 | ✓ |
| M-19 | As MCC Chair, I want the founder to retain emergency Chair powers even if no explicit role is granted, so the colony cannot be locked out | P1 | ✓ |
| M-20 | As MCC Chair, I want to replace the MCC Chair role via a G-token governance referendum so the founder is not permanent | P2 | — |

### O-Token & Succession

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-21 | As MCC chair, I want to hold the MCC O-token so my authority over MCC on-chain operations — epoch advance, service pricing, billing — is cryptographically verifiable by any citizen | P1 | — |
| M-22 | As MCC chair, I want to transfer the MCC O-token to my elected successor immediately after the annual election so they have full operational authority from day one of their term | P1 | — |
| M-23 | As any citizen, I want to see who currently holds the MCC O-token so I know who is authorised to act as MCC chair on-chain | P1 | — |

### MCC Office-Term Equity

MCC equity is an office-term instrument. Board members receive shares on election and have them
redeemed at NAV when their term ends. The O-token is a pure identity token — it carries no equity.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-24 | As an incoming MCC board member, I want to receive a fresh allotment of MCC equity shares at the start of my term — sized to my board role — so I am commercially aligned with MCC performance from day one | P2 | — |
| M-25 | As a departing MCC board member (whether by election, resignation, or recall), I want the Fisc to automatically redeem all my MCC shares at current NAV and pay the proceeds to my wallet in V-tokens so no MCC equity accumulates in the hands of former directors | P2 | — |
| M-26 | As any citizen, I want to see the current MCC equity register — who holds what stake and when it was issued — so I can verify that the board's commercial interest is properly constituted | P2 | — |

*M-01–M-03: Fully on-chain via MCCServices contract.*
*M-04: Revenue MTD tracked on-chain via MCCBilling.totalRevenueMTD(); increments when Chair/FD confirms payment.*
*M-06: Bills set and read on-chain via MCCBilling.setBill() / getBills().*
*M-14–M-19: MCCTreasury contract deployed as part of 4-contract colony creation. Bill payments route to treasury address, not founder wallet.*
*M-20: Requires governance referendum → future work.*
*M-21–M-23: Requires OToken.sol and integration with colony deploy flow. MCC O-token currently not issued; founder controls MCC operations via private key.*

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

*G-01–G-06: Guardian page UI is built; starts with empty state (no mock data). No on-chain guardian contract exists yet — children cannot be registered on-chain.*

---

## Role 6 — Colony Founder

A citizen deploying a new colony.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| N-01 | As a colony founder, I want to name my colony and generate a unique URL slug | P1 | ✓ |
| N-02 | As a colony founder, I want to designate founding MCC board wallet addresses | P1 | ✓ |
| N-03 | As a colony founder, I want to review and accept the fixed founding constitution | P1 | ✓ |
| N-04 | As a colony founder, I want to deploy all colony contracts (Colony, MCCTreasury, MCCServices, MCCBilling) in a single guided flow | P1 | ✓ |
| N-05 | As a colony founder, I want to receive the first G-token and start receiving UBI from Month 1 | P1 | ✓ |
| N-06 | As a colony founder, I want a shareable invite URL and QR code to recruit citizens | P1 | ~ |
| N-07 | As a colony founder, I want to see my colony appear in the public directory immediately | P1 | ✓ |
| N-08 | As a colony founder, I want to set an optional colony description and logo | P2 | ~ |
| N-09 | As a colony founder, I want to create my colony from zpc.finance (the platform layer) rather than from inside the colony app | P1 | ✓ |

| N-10 | As a colony founder, I want my colony to appear automatically in the global directory for all users without any manual step by the protocol team | P1 | ✓ |
| N-11 | As a colony founder, I want the deploy flow to register my colony with the ColonyRegistry contract so it is publicly discoverable | P1 | ✓ |

*N-04: Deploy wizard at app.zpc.finance/create runs an 18-step guided flow: 17 contract deploys/wires (GToken, SToken, VToken, Colony, ownership transfers, OToken, CompanyImpl, UpgradeableBeacon, CompanyFactory, MCCBilling, MCCServices) + step 18: registry.register() (non-fatal). Pre-flight: network check (84532), balance check (≥0.005 ETH), slug availability check via slugToColony().*
*N-06: Invite URL copyable; QR not yet generated.*
*N-07: Directory.jsx reads ColonyRegistry (0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68) on-chain exclusively — no contracts.json or localStorage fallbacks. The registry is the single source of truth.*
*N-09: app.zpc.finance/create — name input, MetaMask connect, 18-step deploy, success screen with colony URL.*
*N-10: ColonyRegistry redeployed as ERC-721 at 0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68 (19 April 2026). REGISTRY_ADDRESS updated in CreateColony.jsx, Directory.jsx, spice-admin/config.js, and all deploy scripts.*
*N-11: CreateColony.jsx step 18 calls registry.register(colonyAddr, name, slug) — non-fatal. Mints a soulbound C-token to the Colony contract address. If registration fails, the colony is not yet in the directory and can be manually registered via spice.zpc.finance.*

---

## Role 6b — Protocol (SPICE Infrastructure)

The SPICE Protocol is the deployer of the ColonyRegistry contract and recipient
of infrastructure fees from all colonies. Fees are denominated in ETH, accumulate
per colony, and are settled monthly by each MCC Fisc — appearing as a line item
on the colony's monthly infrastructure bill rather than a visible per-transaction skim.

### Colony Registry

| # | Story | Priority | Status |
|---|-------|----------|--------|
| P-01 | As the protocol, I want a single on-chain registry that records every deployed colony (address, name, slug, founder, timestamp) so the directory is always accurate | P1 | ✓ |
| P-01a | As the protocol, I want each registered colony to receive a soulbound ERC-721 C-token minted to its Colony contract address, so the registry is the canonical on-chain source of truth with no off-chain sync required | P1 | ✓ |
| P-02 | As the protocol, I want to update the fee-per-transaction rate at any time without redeploying any colony contract | P1 | ✓ |
| P-03 | As the protocol, I want to update the protocol treasury address without touching any colony contract | P1 | ✓ |
| P-04 | As the protocol, I want only the registry owner to be able to change fee rates and treasury address | P1 | ✓ |

### Protocol Admin Panel (spice.zpc.finance)

| # | Story | Priority | Status |
|---|-------|----------|--------|
| P-11 | As the protocol owner, I want a dedicated admin panel at spice.zpc.finance to manage the ColonyRegistry without writing scripts | P1 | ✓ |
| P-12 | As the protocol owner, I want to see all registered colonies sorted by pending fee so I can see who owes the most at a glance | P1 | ✓ |
| P-13 | As the protocol owner, I want to update the global fee-per-transaction rate from the admin panel | P1 | ✓ |
| P-14 | As the protocol owner, I want to register a new colony by address, name, and slug from the admin panel (for retroactive registration) | P1 | ✓ |
| P-15 | As the protocol owner, I want to transfer registry ownership to a new address with an on-screen confirmation warning | P1 | ✓ |
| P-16 | As any visitor, I want to view registry stats (colony count, global fee, total pending fees, revenue wallet) without connecting a wallet | P1 | ✓ |
| P-17 | As the protocol owner, I want to click a colony and open a detail drawer showing address, founder, pending fee, and ProtocolFeeSettled payment history | P1 | ✓ |
| P-18 | As the protocol owner, I want to set a per-colony fee override in the detail drawer so that different colonies can pay different rates | P1 | ✓ |
| P-19 | As the protocol owner, I want to deregister a colony (soft-remove from directory) or re-register it from the detail drawer | P1 | ✓ |
| P-20 | As the protocol owner, I want the protocol treasury address to be set via a deployment script only, not exposed in the web UI, to reduce attack surface | P1 | ✓ |

### Infrastructure Fee

| # | Story | Priority | Status |
|---|-------|----------|--------|
| P-05 | As the protocol, I want each Colony.send() call to silently accrue a small ETH amount to pendingProtocolFee so the colony owes the protocol without any citizen seeing a per-transaction charge | P1 | ✓ |
| P-06 | As the MCC Fisc, I want to see the accumulated infrastructure fee in the Admin billing panel as a line item, separate from citizen bills | P1 | ✓ |
| P-07 | As the MCC Fisc, I want to settle the protocol fee on-chain in one click by sending ETH to the protocol treasury | P1 | ✓ |
| P-08 | As the protocol, I want each colony to have an independent pendingProtocolFee counter, so large colonies pay more than small ones | P1 | ✓ |
| P-09 | As the protocol, I want fee settlements to be recorded as on-chain events (ProtocolFeeSettled) for auditability | P1 | ✓ |
| P-10 | As the protocol, I want colonies deployed before the registry existed (no registry address) to skip fee accrual gracefully | P1 | ✓ |

*P-01–P-04, P-01a: ColonyRegistry.sol redeployed as ERC-721 at 0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68 (19 April 2026). Each register() call mints a soulbound C-token ("SPICE Colony" / "COLONY") to the Colony contract address. Deregister burns it; reregister remints with the same token ID. tokenURI() returns on-chain JSON metadata. ownerOf(tokenId) == Colony contract (not founder EOA) — the colony cannot be orphaned by key loss.*
*P-05–P-10: Colony.send() increments pendingProtocolFee += registry.getFeeForColony(address(this)) (default 0.000001 ETH). settleProtocol() is payable; caller sends exact ETH amount. registry == address(0) → fee silently skipped.*
*P-11–P-20: spice.zpc.finance — standalone HTML, no build step, ethers.js CDN. Separate Vercel project at spice-admin/. Stats load read-only on page open; owner actions require wallet connect. Colony list sorted by pending fee descending. Treasury address set only via scripts/setTreasury.js (not web UI). Per-colony fee override and deregister/reregister in colony detail drawer.*
*Fee model rationale: ETH-denominated (real-world value), monthly billing via MCC (not per-tx skim), MCC is accountable for payment — citizens see it as an infrastructure bill, not a tax on every send.*

---

## Role 7 — Asset Owner

Any citizen or company wallet that has registered a physical asset or land parcel as an A-token
via the Fisc. All owned assets — including surface land — are unilateral A-tokens registered
in AToken.sol. The separate L-token type was retired in v15; land parcels are unilateral A-tokens
whose founding constitution specifies Harberger rules (applies on Mars, not on Earth colonies with
pre-existing private land).

Registration threshold: declared value > 500 S-token equivalent, weight > 50 kg, or autonomous
AI capability. Below threshold, possession implies ownership with no on-chain record needed.

### Physical Assets

| # | Story | Priority | Status |
|---|-------|----------|--------|
| A-01 | As a citizen, I want to register a physical asset (robot, vehicle, AI hardware) on-chain as a unilateral A-token so that ownership is verifiable by any party | P2 | ~ |
| A-02 | As an asset owner, I want to transfer an A-token to another citizen or company wallet, with the agreed transfer price recorded on-chain as the new declared value | P2 | ~ |
| A-03 | As any citizen, I want to browse the public A-token registry and see all registered assets, their owners, declared values, and weight | P2 | — |
| A-04 | As an asset owner, I want to see all A-tokens registered to my wallet — assets, equity positions, and obligations — in a single portfolio view | P2 | ~ |

*A-01: Citizen asset registration live via Assets.jsx (/colony/:slug/assets). Company assets require an extension to Company.jsx — not yet built.*
*A-02: Transfer form built in Assets.jsx; calls Colony.transferAsset() → AToken.transferAsset().*
*A-03: Public browse not yet built — only the connected wallet's own tokens are visible.*
*A-04: Assets.jsx shows all A-tokens held by the connected wallet — UNILATERAL, EQUITY (showing vesting state), and OBLIGATION pairs. Company-held assets visible on company page (not yet implemented).*

### Harberger Land (A-tokens — Harberger variant)

Surface land in founding-constitution Harberger colonies (Mars) is a unilateral A-token with additional
Harberger rules enforced by the Fisc: declared value, force-purchase right, and monthly stewardship fee.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| A-05 | As a citizen, I want to claim an unclaimed surface parcel by declaring a V-token value and paying the first epoch's stewardship fee (0.5% of declared value) — registering a Harberger A-token | P2 | — |
| A-06 | As a land owner, I want to update my declared land value at any time, which also updates the force-purchase price and future stewardship fee | P2 | — |
| A-07 | As a land owner, I want to see my outstanding stewardship fees and pay them in V-tokens before accruing arrears | P2 | — |
| A-08 | As any citizen, I want to browse all land parcels with their declared values so I can identify land available for force-purchase | P2 | — |
| A-09 | As a citizen, I want to force-purchase a land parcel at its declared V-token price — the Fisc executes the transfer atomically; the current owner cannot refuse | P2 | — |
| A-10 | As a land owner, I want to see a warning on my dashboard when I have unpaid stewardship epochs outstanding | P2 | — |
| A-11 | As a land owner, I want to see the ownership and valuation history of my parcel | P3 | — |

*A-05–A-11: Require AToken.sol with Harberger variant support. Not yet deployed.*
*Stewardship fee: 0.5% × declaredValueV × epochsDue, paid in V-tokens to colony treasury.*

### Secured Obligations (A-token fixed-obligation form)

| # | Story | Priority | Status |
|---|-------|----------|--------|
| A-12 | As a citizen or company, I want to create a secured fixed-obligation by pledging an A-token as collateral held in Fisc escrow, so I can borrow beyond the unsecured UBI cap | P2 | ~ |
| A-13 | As a creditor, I want to see collateral A-tokens escrowed against obligations I hold, with a clear view of what I receive if the obligor defaults | P2 | ~ |
| A-14 | As any citizen, I want to see the Fisc escrow registry — which collateral tokens are pledged against which obligations — so the system is fully transparent | P2 | — |

*A-12: Obligation creation form in Assets.jsx supports both secured and unsecured. Secured path: user selects a UNILATERAL A-token they own as collateral. AToken.issueObligation() validates escrow and enforces UBI cap.*
*A-13: Assets.jsx Obligations tab shows creditor's OBLIGATION_ASSET tokens with progress bars; secured obligations display the collateral token ID. Full default-seizure detail view not yet built.*
*A-14: Public escrow browse not yet built.*

---

## Status Summary

| Status | Count | % |
|--------|-------|---|
| ✓ Done (on-chain) | 70 | 41% |
| ~ Partial / UI mock | 27 | 16% |
| — Not built | 59 | 35% |
| Superseded | 5 | 3% |
| New (v13, not yet built) | 10 | 6% |
| **Total** | **171** | |

*v9 additions (April 2026): F-27–F-28 (company as smart contract); Role 2b Organisation Secretary (OS-01–OS-13); M-21–M-23 (MCC O-token and succession).*
*v10 updates (15 April 2026): F-27, F-28, OS-01–OS-03 marked ✓ — CompanyFactory + OToken.sol deployed and wired. Company accounts (double-entry), activity log, and getLogs pagination fix also shipped.*
*v11 updates (16 April 2026): All mock data removed from frontend. Pages read from chain or show clean empty states. Footnotes updated to reflect actual state. CompanyFactory corrected to BeaconProxy (not EIP-1167). Guardian and contracts features note they have UI but no on-chain contract.*
*v12 updates (17 April 2026): N-07, N-10, N-11 marked ✓ — ColonyRegistry deployed at 0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d. Directory.jsx reads registry live; falls back to contracts.json + localStorage. EIP-1167 → BeaconProxy corrected in on-chain table. Colony auto-registration and directory-from-registry rows updated to ✓ Live. N-07/P-01 removed from Remaining P1 gaps. Footnotes for N-04/N-07/N-10/N-11 updated with registry address and 18-step deploy details.*
*v13 updates (18 April 2026): Economic model updated to reflect v16/v17 mars_colony_economy.md. F-08 footnote clarified (requires Colony.sol v2). F-11 reworked — FD declares specific V amount rather than distributing entire V balance; F-11a added. F-13 updated — equity register shows vested vs unvested split. F-14/F-14a added — vesting shares and open shares. F-15 updated — vested-only transfer; F-15a added (buyback). F-16 updated (full event history). F-17–F-21 marked Superseded — intra-month contracts removed from economic model; replaced by V-token reserve + A-token bilateral framework. Vesting Lifecycle stories added (F-23–F-26). MCC Office-Term Equity stories added (M-24–M-26). C-31 updated — L-tokens retired, all assets are A-tokens. A-12–A-14 added (secured obligation stories). Role 7 rewritten — L-tokens retired, land is a Harberger-variant A-token; AssetRegistry.sol superseded by AToken.sol. On-chain table updated (AToken, vesting, FD dividend, intra-month superseded). F-22 (old asset registration) footnote updated to note AssetRegistry.sol superseded by AToken.sol.*
*v14 updates (19 April 2026): C-token (ERC-721) added to ColonyRegistry — P-01a added. ColonyRegistry redeployed at 0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68 as ERC-721. Directory.jsx now reads registry exclusively (no contracts.json / localStorage fallbacks). N-07/N-10/N-11/P-01 footnotes updated. P-01a footnote added. On-chain table: colony auto-registration row updated to reflect C-token mint.*

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
| Pay MCC bill | Colony.send() to MCCTreasury | ✓ Live |
| QR payment request (MetaMask deep link) | — (URL params) | ✓ Live |
| Transaction history | Event log queries | ✓ Live |
| Claim UBI | Colony.claimUbi() | ✓ Live |
| MCC services CRUD | MCCServices contract | ✓ Live |
| MCC Treasury (separate wallet) | MCCTreasury contract | ✓ Live |
| MCC roles (FD / Chair) + withdrawal | MCCTreasury.setRole() / withdraw() | ✓ Live |
| MCC billing — set & confirm bills | MCCBilling.setBill() / recordPayment() | ✓ Live |
| MCC revenue MTD | MCCBilling.totalRevenueMTD() | ✓ Live |
| Governance proposals + voting | Governance contract | ✓ Live |
| Company registration + equity | CompanyFactory + CompanyImplementation (BeaconProxy) | ✓ Live |
| Company smart-contract wallet | CompanyImplementation | ✓ Live |
| O-token issuance (org NFT) | OToken.sol | ✓ Live |
| Company accounts (double-entry journal) | Colony event queries | ✓ Live |
| Activity log (ops/audit) | Supabase via /api/log | ✓ Live |
| Asset registration (physical A-tokens) | AToken.registerAsset() | ✓ Live — AToken.sol deployed as ERC-721 at 0xD0983C309f87Aa50e164a9876EAa64bA43Ac0Cd2 |
| Asset transfer (A-token → new holder) | AToken.transferAsset() | ✓ Live — Assets.jsx transfer form |
| Citizen A-token portfolio view | AToken.tokensOf() | ~ Partial — Assets.jsx shows all held tokens; company-held assets not yet in Company.jsx |
| Obligation creation (unsecured + secured) | AToken.issueObligation() | ~ Partial — Assets.jsx form; epoch settlement requires Colony.sol v2 |
| Harberger land claims (land A-tokens) | AToken — Harberger variant | Not built — unilateral A-token base is live; Harberger rules need Colony.sol + UI extension |
| Vesting equity (paired equity A-tokens) | AToken.issueEquity() | ~ Partial — AToken.sol deployed; Company.jsx reads vesting state; issuance UI requires CompanyImpl v2 |
| V dividend in citizen tx history | Colony.VDividendPaid event | ✓ Live — Dashboard shows dividend receipts in transaction feed |
| FD dividend declaration | CompanyImplementation.declareDividend() | Not deployed — v1 distributes all V; v2 requires beacon upgrade |
| Protocol infrastructure fee accrual | Colony.pendingProtocolFee + send() | ✓ Live (contracts compiled; new colonies only) |
| Protocol fee settlement | Colony.settleProtocol() payable | ✓ Live (contracts compiled; new colonies only) |
| Colony auto-registration | ColonyRegistry.register() | ✓ Live (step 18 of CreateColony deploy flow) |
| Colony directory from registry | ColonyRegistry.getAll() | ✓ Live (0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d) |
| MCC revenue by service | — | Not built — MCCBilling tracks total only; per-service breakdown needs service-level billing |
| Intra-month contracts | — | **Superseded** — replaced by V-token reserve + A-token bilateral framework (v16 design decision) |
| Guardian management | — | UI built, starts empty; no on-chain guardian contract |
| Share trading (buy side) | — | Not built |

### Remaining P1 gaps

| # | Story | Notes |
|---|-------|-------|
| C-15 | Forward MCC bill projection | Shows MTD actual; forward estimate needs usage-rate model |
| M-05 | MCC revenue by service | MCCBilling tracks total only; per-service breakdown needs service-level billing |
| M-07 | Auto-deduct MCC bills at month end | Manual confirm flow currently; needs epoch-triggered auto-collection |
| M-20 | Replace MCC Chair via referendum | MCCTreasury roles currently founder-controlled; governance vote not yet wired |
| F-08 | Auto S→V company conversion at epoch | Manual convertToV() workaround; requires Colony.sol v2 |
| F-11 | FD dividend declaration | v1 distributes entire V balance; v2 `declareDividend(uint256)` requires CompanyImplementation beacon upgrade |

### v2 contract blockers

AToken.sol is deployed (April 2026). The remaining blockers are **CompanyImplementation v2** (beacon upgrade) and **Colony.sol v2** (new deploy):

| Blocked stories | Blocker | Description |
|----------------|---------|-------------|
| F-13 (vested split) | CompanyImpl v2 | Equity register vested/unvested split via AToken — founding equity still in internal arrays |
| F-14, F-14a | CompanyImpl v2 | Vesting share issuance + open share issuance |
| F-15a | CompanyImpl v2 | Share buyback at NAV |
| F-16 | CompanyImpl v2 | Full share event history (vesting events, forfeitures) |
| F-23–F-26 | CompanyImpl v2 | Vesting lifecycle (claim tranches, forfeit UI, schedule view) |
| M-24–M-26 | CompanyImpl v2 + Colony v2 | MCC office-term equity (issue on election, redeem on term end) |
| A-05–A-11 | Colony v2 | Harberger land (stewardship fee collection at epoch advance) |
| Obligation auto-settlement | Colony v2 | advanceEpoch() must iterate AToken.activeObligationIds() and call markObligationPaid() |

---

*SPICE Colony · User Stories & Requirements Spec · v14*
*Last updated: 18 April 2026*
*v14 changes (18 April 2026): AToken.sol deployed as full ERC-721 (§3.5). Dave's Colony redeployed (slug: daves-colony). Assets.jsx built — citizen asset registration, transfer, obligation creation, and A-token portfolio view at /colony/:slug/assets. On-chain table updated: asset registration, asset transfer, obligation creation, citizen portfolio, V dividend tx history all live. A-01/A-02/A-04/A-12/A-13 updated to ~ partial. C-31 updated to ~. F-22 updated to ~. C-14 updated to include V dividends. v2 blockers section rewritten: AToken.sol removed as blocker; CompanyImpl v2 and Colony.sol v2 are the remaining blockers with specific story mapping.*
