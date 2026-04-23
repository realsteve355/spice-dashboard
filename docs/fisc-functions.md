# SPICE Colony — Fiscal Citizen Functions

A complete reference of every action a fiscal citizen can take within a colony.
Covers onboarding, daily economy, savings, governance, and obligations.

---

## 1. Onboarding

### Join the colony
**Contract:** `Colony.join(string name, uint256 dob)`
**Where:** Colony landing page (`/colony/:slug`)
**What it does:** Registers the caller as a citizen. Mints a soulbound G-token (citizen ID NFT) to their wallet. Sets their display name and year of birth on-chain.
**Pre-conditions:** Not already a citizen. Wallet connected on Base Sepolia.
**One-time action.** Cannot be undone (no leave function).

---

## 2. Daily Economy

### Claim UBI
**Contract:** `Colony.claimUbi()`
**Where:** Dashboard — "Claim Monthly UBI" button
**What it does:** Pulls the citizen's monthly S-token basic income allocation from the MCC. Amount is set by the MCC (configurable per colony).
**Epoch rule:** One claim per epoch (calendar month). Attempting a second claim in the same epoch reverts. The button shows "✓ Claimed" on success and resets at the next epoch.

### Send S-tokens
**Contract:** `Colony.send(address to, uint256 amount, string note)`
**Where:** Dashboard — "Send S-tokens →" button → SendSheet
**What it does:** Transfers S-tokens from the citizen to another citizen or company address. The `note` field is stored on-chain and appears in both parties' transaction histories. A payment notification is sent to the recipient via the off-chain notifications system.
**Recipient picker:** Citizens are selected by name search (via `/api/citizens`). Companies are paid via the Mall, not this flow.

### Pay MCC services bill
**Contract:** `Colony.send(address mccBilling, uint256 amount, string "MCC services bill")`
**Where:** Dashboard — bill notice when `billOf(address) > 0`
**What it does:** Pays the outstanding MCC services bill. The bill is set by the MCC and read from `MCCBilling.billOf(address)`. Payment is a standard `send()` to the MCC billing address with a fixed note. The bill clears on-chain after payment.

---

## 3. Savings (V-tokens)

### Save to V
**Contract:** `Colony.saveToV(uint256 amount)`
**Where:** Dashboard — savings section
**What it does:** Converts S-tokens to V-tokens at the current rate. V-tokens are a long-term savings instrument that accrue yield from colony economic activity. They cannot be freely spent — only redeemed back to S.
**S-tokens are burned on save; V-tokens are minted.**

### Redeem V
**Contract:** `Colony.redeemV(uint256 amount)`
**Where:** Dashboard — savings section
**What it does:** Converts V-tokens back to S-tokens at the current rate. The rate may differ from the save rate (V accrues yield over time, so redeems are typically at a better rate than saves).
**V-tokens are burned on redeem; S-tokens are minted.**

---

## 4. Governance (Voting)

All governance functions use the `Governance` contract, which is separate from `Colony`.

### Open an election
**Contract:** `Governance.openElection(uint8 role)`
**Where:** Votes page (`/colony/:slug/votes`)
**What it does:** Any citizen can open an election for a vacant or expiring board role (CEO=0, CFO=1, COO=2). This starts the nomination phase. Emits an election notification to all citizens.
**Condition:** Role must be vacant or the current holder's term must have ended.

### Nominate a candidate
**Contract:** `Governance.nominateCandidate(uint256 electionId, address candidate)`
**Where:** Votes page — active election card
**What it does:** Nominates any citizen (including yourself) as a candidate in the specified election. Can only be done during the nomination phase.
**Phase window:** 15 minutes (testnet) from election open.

### Vote
**Contract:** `Governance.vote(uint256 electionId, address candidate)`
**Where:** Votes page — active election card
**What it does:** Casts one vote for a candidate in the specified election. Each citizen gets one vote per election. Can only be done during the voting phase.
**Phase window:** 30 minutes (testnet) from nomination close.
**Eligibility:** Citizen must be 18 or older (based on date of birth registered at join).

### Finalise an election
**Contract:** `Governance.finaliseElection(uint256 electionId)`
**Where:** Votes page — "Finalise" button appears when voting phase ends
**What it does:** Counts votes and sets the winner. Starts the timelock period. Any citizen can call this once voting closes.
**Auto-finalise:** The contract auto-finalises if a new tx is sent after voting ends (no manual step strictly required, but the UI button is available).

### Execute an election
**Contract:** `Governance.executeElection(uint256 electionId)`
**Where:** Votes page — "Execute" button appears after timelock
**What it does:** Installs the winner into their role. Starts their term. Any citizen can call this once the timelock expires.
**Timelock:** Brief delay between finalise and execute (governance safety window).

### Resign from a role
**Contract:** `Governance.resign(uint8 role)`
**Where:** Votes page — "Resign" button shown to the current role holder
**What it does:** The current holder of a board role (CEO, CFO, COO) can voluntarily vacate it. Frees the role for a new election immediately.
**Only the current holder can resign from their own role.**

---

## 5. Profile

### View profile
**Where:** `/colony/:slug/profile` (own) or `/colony/:slug/profile/:address` (others)
**What it shows:** Citizen name, G-token ID, date of birth / age, joined date, voting eligibility (18+).
**Read-only for other citizens' profiles.**

### Wallet disconnect
**Where:** Profile page
**What it does:** Disconnects the wallet from the app. No on-chain transaction. Local state only.

---

## 6. Obligations Summary

| Obligation | Nature | Consequence of non-payment |
|---|---|---|
| MCC services bill | Off-chain bill set by MCC, paid via `Colony.send()` | Bill accumulates; enforced socially / by board |
| S-tax on company income | Automatic — deducted at contract level on company revenue | Cannot be avoided; built into token flow |

There is no on-chain enforcement mechanism that locks a citizen's wallet for non-payment of the MCC bill. Enforcement is at the colony governance level (board can take action against non-paying citizens via governance votes).

---

## Function Reference

| Function | Contract | Called from |
|---|---|---|
| `join(name, dob)` | Colony | Colony landing page |
| `claimUbi()` | Colony | Dashboard |
| `send(to, amount, note)` | Colony | Dashboard SendSheet, bill payment |
| `saveToV(amount)` | Colony | Dashboard savings section |
| `redeemV(amount)` | Colony | Dashboard savings section |
| `openElection(role)` | Governance | Votes page |
| `nominateCandidate(elecId, addr)` | Governance | Votes page |
| `vote(elecId, addr)` | Governance | Votes page |
| `finaliseElection(elecId)` | Governance | Votes page |
| `executeElection(elecId)` | Governance | Votes page |
| `resign(role)` | Governance | Votes page |

---

## Read-only State (citizen-facing)

These are not actions but values the citizen sees on their dashboard:

| Value | Source |
|---|---|
| S-token balance | `SToken.balanceOf(address)` |
| V-token balance | `VToken.balanceOf(address)` |
| Current epoch | `SToken.currentEpoch()` |
| MCC bill outstanding | `MCCBilling.billOf(address)` |
| Transaction history | `provider.getLogs()` — Sent, UbiClaimed, Saved, Redeemed, VDividendPaid events |
| Citizen name | `Colony.citizenName(address)` |
| Board composition | `Governance.roleHolder(0/1/2)` |
| Active elections | `Governance.elections(id)` loop |
| Colony announcements | `/api/announcements` (Supabase) |
| Notifications | `/api/notifications` (Supabase) |
