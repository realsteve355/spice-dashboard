# SPICE Colony — User Stories

*Working spec for app.zpc.finance. Stories are organised by role, then by priority.*

**Priority:** P1 = MVP · P2 = Phase 1 extended · P3 = Phase 2 / future

**Status:** ✓ Done · ~ Partial · — Not built

---

## Role 1 — Citizen

A registered member of a colony. Holds one G-token, receives 1,000 S-tokens monthly,
may save into V-tokens, spend with companies, hold equity, and vote on MCC governance.

### Registration & Identity

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-01 | As a citizen, I want to connect my crypto wallet so I can interact with the colony | P1 | ✓ |
| C-02 | As a prospective citizen, I want to browse a colony's public page so I can decide whether to join | P1 | ✓ |
| C-03 | As a prospective citizen, I want to read the founding constitution before committing | P1 | ✓ |
| C-04 | As a prospective citizen, I want to sign the founding constitution on-chain and receive my G-token | P1 | ✓ |
| C-05 | As a new citizen, I want to see a confirmation of when my first UBI arrives | P1 | ✓ |
| C-06 | As a citizen, I want to register a partner wallet so inheritance defaults are set | P2 | ✓ |
| C-07 | As a citizen, I want to register offspring wallet addresses for inheritance | P2 | ✓ |
| C-08 | As a citizen, I want to update my inheritance designation at any time | P2 | ✓ |
| C-09 | As a citizen of multiple colonies, I want to switch between colony dashboards | P1 | ✓ |

### S-Token (Spending)

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-10 | As a citizen, I want to see my current S-token balance prominently | P1 | ✓ |
| C-11 | As a citizen, I want to see how many days remain until the monthly reset | P1 | ✓ |
| C-12 | As a citizen, I want to see a breakdown of my spending this month (MCC bill + discretionary) | P1 | ✓ |
| C-13 | As a citizen, I want to pay a company for goods or services in S-tokens | P1 | ✓ |
| C-14 | As a citizen, I want to see my full transaction history with dates and labels | P1 | ✓ |
| C-15 | As a citizen, I want to see my projected MCC bill for the current month | P1 | ~ |
| C-16 | As a citizen, I want to receive a warning if my S-token balance will not cover my projected MCC bill | P2 | — |

### V-Token (Savings)

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-17 | As a citizen, I want to convert S-tokens to V-tokens (up to 200 per month) | P1 | ✓ |
| C-18 | As a citizen, I want to see how much of my monthly savings allowance I have used | P1 | ✓ |
| C-19 | As a citizen, I want to see my total V-token balance | P1 | ✓ |
| C-20 | As a citizen, I want to redeem V-tokens back to S-tokens at any time, 1:1 | P1 | ✓ |
| C-21 | As a citizen, I want to see the mint date of my V-token batches so I can track the 100-year expiry | P2 | ✓ |
| C-22 | As a citizen, I want to receive a notification if a V-token batch is approaching its 100-year expiry | P3 | — |

### Governance

| # | Story | Priority | Status |
|---|-------|----------|--------|
| C-23 | As a citizen, I want to see the status of my G-token (token ID, issued date) | P1 | ✓ |
| C-24 | As a citizen, I want to vote in the annual MCC board election | P2 | ✓ |
| C-25 | As a citizen, I want to vote in a recall referendum if it is triggered | P2 | ✓ |
| C-26 | As a citizen, I want to vote on a constitutional amendment referendum | P2 | ~ |
| C-27 | As a citizen, I want to vote on a proposed MCC dividend distribution | P2 | ✓ |
| C-28 | As a citizen, I want to see the current recall trigger status (how close to the 20% threshold) | P2 | ~ |
| C-29 | As a citizen, I want to see a live list of all open votes and their deadlines | P2 | ✓ |

*C-15: Shows month-to-date MCC bill, not a forward projection.*
*C-26: Voting UI works; no constitutional amendment vote type in mock data yet.*
*C-28: Recall status visible in MCC admin panel only, not on citizen dashboard.*

---

## Role 2 — Company Founder / Owner

Any citizen may register a company. The company earns S-tokens, converts net earnings
to V-tokens at month end, and distributes dividends to equity holders.

### Company Registration

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-01 | As a citizen, I want to register a new company with the Fisc by providing a name | P1 | ✓ |
| F-02 | As a founder, I want to define founding equity stakes and assign them to wallet addresses | P1 | ✓ |
| F-03 | As a founder, I want to see my company's Fisc registration confirmed on-chain | P1 | ✓ |
| F-04 | As a founder, I want to view a company dashboard showing balance, revenue, and equity | P1 | ✓ |

### Company Finances

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-05 | As a company owner, I want to see my company's current S-token balance | P1 | ✓ |
| F-06 | As a company owner, I want to see my company's V-token reserve | P1 | ✓ |
| F-07 | As a company owner, I want to see all inbound and outbound S-token transactions this month | P1 | ✓ |
| F-08 | As a company owner, I want the Fisc to automatically convert all net S-tokens to V-tokens at month end | P1 | ~ |
| F-09 | As a company owner, I want to manually redeem V-tokens → S-tokens to fund operations | P1 | ✓ |
| F-10 | As a company owner, I want to pay another company or citizen in S-tokens | P1 | ✓ |
| F-11 | As a company owner, I want to distribute V-token dividends to all equity holders | P1 | ✓ |
| F-12 | As a company owner, I want to see projected month-end V-token conversion based on current net balance | P2 | ✓ |

### Equity Management

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-13 | As a company owner, I want to see the full equity register — all holders and their percentage stakes | P1 | ✓ |
| F-14 | As a company owner, I want to issue new shares to a wallet address | P2 | — |
| F-15 | As a company owner, I want to transfer shares atomically (payment and ownership simultaneously) | P2 | ~ |
| F-16 | As a company owner, I want to see the history of all share transfers | P2 | — |

### Intra-Month Contracts

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-17 | As a company owner, I want to create a forward purchase contract committing a buyer's S-tokens in escrow | P2 | ✓ |
| F-18 | As a company owner, I want to create an escrowed payment released on delivery confirmation | P2 | ✓ |
| F-19 | As a company owner, I want to set up a revenue-sharing agreement routing a % of inbound S-tokens to a partner | P2 | ✓ |
| F-20 | As a company owner, I want to see all active intra-month contracts and their status | P2 | ✓ |
| F-21 | As a company owner, I want to confirm delivery on a contract to release escrowed tokens | P2 | ✓ |

### Assets & Land

| # | Story | Priority | Status |
|---|-------|----------|--------|
| F-22 | As a company owner, I want to register a physical asset above the registration threshold | P2 | — |
| F-23 | As a company owner, I want to file a Harberger surface land claim by declaring a V-token value | P2 | — |
| F-24 | As a company owner, I want to update my declared land value at any time | P2 | — |
| F-25 | As a company owner, I want to see my monthly Harberger stewardship fee based on declared value | P2 | — |
| F-26 | As a company owner, I want to receive a notification if someone initiates a forced purchase of my land | P3 | — |

*F-08: UI shows estimated month-end V conversion; auto-conversion is a smart contract concern.*
*F-15: Share listing (sell side) built; buy side not yet implemented.*

---

## Role 3 — Shareholder

Any citizen who holds equity in one or more colony companies.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| S-01 | As a shareholder, I want to see all my equity positions in one view (company, %, current V-token value) | P1 | ✓ |
| S-02 | As a shareholder, I want to see my dividend history — how much V-tokens received, from which company, when | P1 | ✓ |
| S-03 | As a shareholder, I want to buy shares in a company by paying S-tokens (atomic on-chain swap) | P2 | — |
| S-04 | As a shareholder, I want to sell shares to another citizen for S-tokens | P2 | ~ |
| S-05 | As a shareholder, I want to see a company's revenue, V-token reserve, and dividend history before buying | P2 | ✓ |
| S-06 | As a shareholder, I want to transfer shares as a gift to another citizen wallet | P2 | — |
| S-07 | As a shareholder, I want my shares to be included in my inheritance designation | P2 | — |

*S-04: Seller can list shares with a price; buyer flow not yet built.*

---

## Role 4 — MCC Board Member

Elected annually by G-token holders. Runs the essential services infrastructure and
sets prices. Subject to the automatic recall trigger.

### Services & Billing

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-01 | As an MCC board member, I want to add a new service with a name, billing basis, and price | P1 | ✓ |
| M-02 | As an MCC board member, I want to edit an existing service price | P1 | ✓ |
| M-03 | As an MCC board member, I want to remove a service | P1 | ✓ |
| M-04 | As an MCC board member, I want to see total MCC revenue for the current month | P1 | ✓ |
| M-05 | As an MCC board member, I want to see revenue broken down by service | P1 | ✓ |
| M-06 | As an MCC board member, I want to see each citizen's current month bill | P1 | ✓ |
| M-07 | As an MCC board member, I want the Fisc to automatically deduct MCC bills from citizen wallets at month end | P1 | ~ |

### Governance & Accountability

| # | Story | Priority | Status |
|---|-------|----------|--------|
| M-08 | As an MCC board member, I want to see the current recall trigger status in real time | P1 | ✓ |
| M-09 | As an MCC board member, I want to receive an alert if the average bill is approaching the recall threshold | P2 | — |
| M-10 | As an MCC board member, I want to propose a dividend distribution to G-token holders | P2 | — |
| M-11 | As an MCC board member, I want to see the results of all G-token votes | P2 | ~ |
| M-12 | As an MCC board member, I want to see MCC's V-token reserve and profit for the current period | P2 | — |
| M-13 | As an MCC board member, I want to add or remove a board member wallet (subject to G-token vote) | P3 | — |

*M-07: Auto-deduction is a Fisc smart contract concern — no UI action required.*
*M-11: Votes page exists but is not linked from the MCC admin panel.*

---

## Role 5 — Guardian

An adult citizen who manages the wallet of a child citizen.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| G-01 | As a guardian, I want to register a child with the Fisc and link them to my wallet | P2 | ✓ |
| G-02 | As a guardian, I want to see the child's S-token balance and MCC bill | P2 | ✓ |
| G-03 | As a guardian, I want to convert up to 200 of the child's S-tokens to V-tokens each month | P2 | ✓ |
| G-04 | As a guardian, I want to see the child's accumulated V-token balance | P2 | ✓ |
| G-05 | As a guardian, I want to pay the child's MCC bill from their S-token allocation | P2 | ~ |
| G-06 | As a guardian, I want the wallet to automatically transfer to the child at age 18 | P2 | ~ |
| G-07 | As a guardian, I want to designate a backup guardian in case I die before the child turns 18 | P3 | — |

*G-05: MCC bill is shown but there is no explicit "pay bill" action — payment is automatic in the model.*
*G-06: Adulthood countdown and transfer explanation shown in UI; auto-transfer is a smart contract concern.*

---

## Role 6 — Colony Founder

A citizen who deploys a new colony. Becomes the first citizen and founding MCC board.

| # | Story | Priority | Status |
|---|-------|----------|--------|
| N-01 | As a colony founder, I want to name my colony and generate a unique URL slug | P1 | ✓ |
| N-02 | As a colony founder, I want to designate the founding MCC board wallet addresses | P1 | ✓ |
| N-03 | As a colony founder, I want to review and accept the fixed founding constitution | P1 | ✓ |
| N-04 | As a colony founder, I want to deploy the Fisc contracts to the blockchain in one transaction | P1 | ✓ |
| N-05 | As a colony founder, I want to receive the first G-token and start receiving UBI from Month 1 | P1 | ✓ |
| N-06 | As a colony founder, I want a shareable invite URL and QR code to recruit citizens | P1 | ~ |
| N-07 | As a colony founder, I want to see my colony appear in the public directory immediately | P1 | ✓ |
| N-08 | As a colony founder, I want to set an optional colony description and logo | P2 | ~ |

*N-06: Invite URL shown and copyable; QR code not yet generated.*
*N-08: Description field built; logo upload not yet built.*

---

## Status Summary

| Status | Count | % |
|--------|-------|---|
| ✓ Done | 51 | 64% |
| ~ Partial | 12 | 15% |
| — Not built | 17 | 21% |
| **Total** | **80** | |

### Remaining P1 gaps (must-have before release)

| # | Story |
|---|-------|
| M-07 | Auto-deduct MCC bills at month end — smart contract concern, not UI |

### Remaining P2 gaps (important but not blocking)

| # | Story |
|---|-------|
| C-16 | Warn citizen if balance won't cover projected MCC bill |
| F-14 | Issue new shares to a wallet |
| S-03 | Buy shares (buyer side of share trading) |
| S-06 | Transfer shares as a gift |
| S-07 | Shares included in inheritance designation |
| F-22–F-25 | Asset and Harberger land registration |
| M-09 | MCC alert when approaching recall threshold |
| M-10 | MCC propose dividend from admin panel |
| M-11 | Link votes page from MCC admin |
| M-12 | MCC V-token reserve and profit view |

---

*SPICE Colony · User Stories · Working Document — v2*
*Last updated: April 2026*
