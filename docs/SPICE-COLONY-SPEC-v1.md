# SPICE Colony — Comprehensive Specification
## Fiscal Citizen Functions · Budget Model · Mars/Earth Colony Types · External World Project
### Version 1 — April 2026

---

## Part 0 — The Two Colony Types

Every deployed SPICE colony is designated at founding as either a **Mars colony** or an **Earth colony**. The designation is set in the founding constitution and cannot be changed without an 80% G-token referendum.

| Property | Mars Colony | Earth Colony |
|---|---|---|
| **Economy** | Fully closed — S-tokens have no external value | Open — S-tokens have value wherever MCC and merchants accept them |
| **External trade** | Phase 2 only (not yet implemented) | Phase 2 features: Fisc rate, merchant acceptance, BTC settlement |
| **Land rules** | Harberger: owner declares value, force-purchasable, 0.5%/month stewardship fee | Existing private ownership at founding; ordinary A-token transfers thereafter |
| **Exit** | Not possible (physical reality) | Registered citizen remains a citizen; Phase 2 will introduce BTC conversion |
| **UBI value anchor** | Internal only — market pricing within the dome | Fisc rate (published daily): implied exchange rate S-tokens → external currency |
| **Fisc rate oracle** | Not applicable | Required — colony publishes daily rate, anchored to bread basket price |
| **Reference case** | Mars Colony simulation, 200-year model | Earth pilot: university campus, housing cooperative, town |

The Mars colony is the theoretical reference model — all rules derive from it. The Earth colony inherits all Mars colony rules and adds the external-world layer described in Part 6.

---

## Part 1 — The Token System

Five tokens. Each has a single non-overlapping purpose. The first two govern the daily economy; the other three govern identity, authority, and property.

| Token | Purpose | Who holds it |
|---|---|---|
| **S** | Spending currency — monthly UBI, all transactions, expires at month end | Citizens, companies, MCC |
| **V** | Permanent savings and company capital — never expires (citizen V expires after 100 years) | Citizens, companies, MCC |
| **G** | Citizen identity and governance voting — one per adult, soulbound | Citizens only |
| **O** | Organisation identity and on-chain authority — one per registered organisation | Company secretary, MCC chair |
| **A** | Economic claim — any asset or liability | Citizens, companies, MCC |

### 1.1 S-Tokens — Spending Currency

| Property | Value |
|---|---|
| Issued by | The Fisc — automatically on the 1st of each month |
| Amount | 1,000 S-tokens per adult citizen per month (governance parameter, default fixed) |
| Expiry | Midnight on the last day of the month — all unspent S destroyed |
| Purpose | Pay MCC bill, buy goods/services, pay company shares, convert to V |
| Children | Receive full UBI from birth, managed by registered guardian |

**Why this cannot cause inflation:** S-tokens that are not spent are destroyed at month end. Total supply resets to zero every 30 days. No money supply growth → no inflation. Fractional reserve banking is constitutionally prohibited — only the Fisc can mint S-tokens.

### 1.2 V-Tokens — Long-Term Savings

Citizens may convert up to **200 S/month** to V-tokens (savings cap). Companies convert **all net monthly S earnings** to V-tokens (uncapped).

V-tokens never expire for companies. Citizen V-tokens expire 100 years from mint date — long enough to outlast any realistic lifespan, short enough to prevent indefinite dynastic accumulation.

**Citizen V rules:** Receive dividends in V · spend S only · save via S→V conversion · redeem V→S 1:1 at any time
**Company V rules:** Earn S from revenue · convert ALL net S to V at month end · pay dividends in V to shareholders · redeem V→S for capital expenditure

**Why V-tokens do not cause inflation:** To spend V-tokens they must be redeemed to S first. Those S-tokens enter the same monthly supply and are destroyed at month end if unspent. The monthly reset is the final circuit breaker for all spending power.

### 1.3 The Monthly Token Flow

| Step | What happens |
|---|---|
| 1st of month | Fisc issues 1,000 S-tokens to every citizen wallet |
| During month | Citizens spend S on MCC services, goods, companies |
| During month | Citizens may redeem V→S for large purchases |
| During month | Companies earn S, convert ALL net earnings to V, pay V dividends |
| During month | Citizens convert up to 200 S→V as savings |
| Month end | All remaining S-tokens in every wallet destroyed |

### 1.4 Budget Split — Target Allocations

| Category | Target % | S-tokens/month (at 1,000 UBI) | Notes |
|---|---|---|---|
| **MCC** (mandatory, auto-deducted) | ~25% | ~250 S | Electricity, water, waste, broadband, roads/EMS |
| **Essentials** | ~35% | ~350 S | Groceries, healthcare, transport, education, personal care |
| **Discretionary** | ~20% | ~200 S | Local dining, entertainment, non-essential goods |
| **Savings (S→V)** | ~20% | ~200 S | V-token wealth building (capped at 200 S/month) |

**The Bread Anchor (Earth colony calibration):** The implied exchange rate between S and the external currency is derived from: `fisc_rate = local_bread_price_external / bread_price_in_S`. This three-number consistency check — bread price, Fisc rate, and UBI value in external currency — must be calibrated at colony founding and monitored daily.

**Three citizen profiles:**

| Profile | Monthly income | Notes |
|---|---|---|
| Basic Citizen | 1,000 S UBI only | Covers all essentials; saves 200 S→V; 200 S discretionary |
| Working Citizen | 1,000 S UBI + ~800 V wages | Spends freely in S; accumulates V from company equity |
| Professional | 1,000 S UBI + ~3,500 V fees | Large V accumulation; may buy externally from V savings |

### 1.5 A-Tokens — Economic Claims

An A-token is a Fisc-registered economic claim. Every significant ownership right and every financial obligation in the colony is recorded as an A-token. The Fisc is the sole issuer.

**Three forms:**

**1. Unilateral asset token** — a physical object owned outright (robot, vehicle, land parcel). No counterparty. Yield zero. Value = last transfer price. Registration required for assets above 500 S-token equivalent, >50 kg, or with autonomous AI capability.

**2. Paired equity tokens** — a company share. The Fisc creates two simultaneously:
- **Asset A-token** held by shareholder — records stake in basis points, entitles holder to pro-rata monthly V dividends
- **Liability A-token** held by company — records aggregate distribution obligation; one token regardless of shareholder count

The Fisc reads the liability token at month end and distributes V-tokens to all asset token holders automatically. No action required from the company secretary.

**3. Paired fixed-obligation tokens** — a bilateral payment agreement (hire-purchase, loan, advance). Two tokens:
- **Asset A-token** held by recipient — entitles holder to receive fixed periodic payments
- **Liability A-token** held by obligor — records payment obligation

**Settlement priority:** The Fisc settles all liability A-token obligations before crediting monthly UBI. An obligation within the UBI amount cannot be defaulted — payment is automatic.

**Obligation cap:** The Fisc will not register an unsecured liability A-token that would push total monthly S obligations beyond 1,000 S (the UBI). Structural default is impossible for any Fisc-registered unsecured obligation.

**Secured obligations:** A fixed-obligation A-token may be secured by pledged collateral A-tokens. The Fisc holds these in escrow. No cap on secured obligations — the collateral is the protection. On default, Fisc transfers collateral to creditor.

**Net worth = V-tokens + S-tokens + Σ(positive A-token values) − Σ(liability A-token values)**

---

## Part 2 — The Four Entities

| Entity | Earns | Governed by |
|---|---|---|
| **Citizen** | UBI (S) · equity dividends (V) · service/goods income (S) | Founding constitution · annual MCC election |
| **Company** | S-tokens from sales → V-token reserve → V dividends to shareholders | Market competition · equity holders |
| **MCC** | S-tokens from metered bills and company levies | Board elected annually by G-token holders |
| **The Fisc** | Nothing — constitutional utility, no profit motive | Founding constitution only |

---

## Part 3 — Citizen Functions (Complete Reference)

### 3.1 Onboarding

**Join the colony**
- **Contract:** `Colony.join(string name, uint256 dob)`
- **Where:** Colony landing page
- **What:** Registers caller as citizen. Mints soulbound G-token. Sets display name and year of birth on-chain.
- **Condition:** Not already a citizen. Wallet connected.
- **One-time, permanent.** No leave function exists.
- **Children:** Registered by guardian at birth. G-token not issued until age 18. Guardian manages wallet and V conversions until then.

**At adulthood (18)**
The citizen signs the constitution in their own right. G-token issued. Accumulated V-token pool from guardian transfers entirely to citizen's wallet. A child whose guardian converted the maximum each month holds at least 43,200 V-tokens at adulthood.

### 3.2 Daily Economy

**Claim UBI**
- **Contract:** `Colony.claimUbi()`
- **Where:** Dashboard — "Claim Monthly UBI" button
- **What:** Pulls the citizen's monthly S-token UBI from the MCC. Amount is the colony's governance parameter (default 1,000 S).
- **Epoch rule:** One claim per epoch (calendar month). Second claim in same epoch reverts.
- **Earth colony note:** UBI value in external currency depends on the published Fisc rate.

**Send S-tokens to a citizen**
- **Contract:** `Colony.send(address to, uint256 amount, string note)`
- **Where:** Dashboard → "Send S-tokens →" → SendSheet
- **What:** Transfers S-tokens to another citizen. Note stored on-chain, visible in both parties' tx histories. Payment notification sent to recipient.
- **Picker:** Citizens selected by name search via `/api/citizens`. Companies paid via the Mall.

**Pay MCC services bill**
- **Contract:** `Colony.send(address mccBilling, uint256 billAmount, "MCC services bill")`
- **Where:** Dashboard — bill notice when `MCCBilling.billOf(address) > 0`
- **What:** Pays outstanding MCC services bill. The bill is set by the MCC, read from `MCCBilling.billOf`. Clears on-chain after payment.
- **Mars colony:** Bill itemised: Atmosphere · Water · Power · Habitat · Medical · Comms · Waste
- **Earth colony:** Bill itemised per founding constitution (e.g. Canteen access · Printing · Space hire)

**Commerce income (sole trader)**
A citizen may provide goods or services to any other citizen or company and receive S-tokens in return. This is a standard `send()` in the other direction — no special mechanism. Sole traders have no ongoing equity relationship and accumulate wealth by converting S surplus to V-tokens.

### 3.3 Savings

**Save to V**
- **Contract:** `Colony.saveToV(uint256 amount)`
- **Where:** Dashboard — savings section
- **What:** Converts S-tokens to V-tokens. Maximum 200 S per month (savings cap). V-tokens are permanent savings — do not expire for 100 years.
- **Use case:** Holiday fund, large purchase capital, long-term wealth building.

**Redeem V**
- **Contract:** `Colony.redeemV(uint256 amount)`
- **Where:** Dashboard — savings section
- **What:** Converts V-tokens back to S-tokens at 1:1 rate. Uncapped. Redeemed S enters the current month's supply and expires at month end if unspent.
- **Use case:** Large purchase, company stake, capital deployment.

### 3.4 Governance (Voting)

All governance functions use the `Governance` contract.

**Open an election**
- **Contract:** `Governance.openElection(uint8 role)`
- **Roles:** CEO = 0, CFO = 1, COO = 2 (current app); full Mars model: CEO, Operations Director, Finance Director, Security Director, Medical Director, Citizen Representative
- **Who:** Any citizen
- **Condition:** Role vacant or current holder's term expired
- **Triggers:** Election notification broadcast to all citizens

**Nominate a candidate**
- **Contract:** `Governance.nominateCandidate(uint256 electionId, address candidate)`
- **Who:** Any citizen. Can self-nominate.
- **Phase:** Nomination window only (15 min testnet / governance-set in production)

**Vote**
- **Contract:** `Governance.vote(uint256 electionId, address candidate)`
- **Who:** Any citizen aged 18+ (G-token holder)
- **Limit:** One vote per citizen per election
- **Phase:** Voting window only (30 min testnet / governance-set in production)

**Finalise an election**
- **Contract:** `Governance.finaliseElection(uint256 electionId)`
- **Who:** Any citizen, once voting window closes
- **What:** Counts votes, sets winner, starts timelock

**Execute an election**
- **Contract:** `Governance.executeElection(uint256 electionId)`
- **Who:** Any citizen, once timelock expires
- **What:** Installs winner into their role, starts their term

**Resign from a role**
- **Contract:** `Governance.resign(uint8 role)`
- **Who:** Current role holder only
- **What:** Vacates role immediately, freeing it for a new election

**Recall referendum (Mars full model)**
Automatic recall trigger fires when the standard MCC bill rises more than 20% above its 12-month rolling average in any single month. When triggered, the Fisc initiates a colony-wide recall referendum — no petition required.

### 3.5 Property and Assets (A-Token Functions)

*(Planned — not yet in app UI)*

**Register a physical asset**
- **Fisc action:** Issue unilateral A-token to citizen wallet
- **Threshold:** Required for assets above 500 S-token equivalent, >50 kg, or autonomous AI capability
- **What:** Creates on-chain record of ownership. Below threshold, possession implies ownership.

**Transfer a physical asset**
- **Fisc action:** Both parties sign transfer on-chain; A-token moves to new holder
- **Value:** Last transfer price recorded. May carry declared depreciation schedule.

**Buy company shares**
- **Fisc action:** Creates paired equity A-tokens — asset token to buyer, updates company liability token
- **What:** Entitles holder to pro-rata V-token dividends. All shareholdings publicly visible.
- **Vesting (participant equity):** Monthly tranches over 1–12 months. Month-12 tranche larger (commitment bonus). Unvested shares pay dividends but cannot be transferred. Unvested shares forfeited on departure; vested shares permanent.
- **Open shares (investor equity):** No vesting or shorter lock-up. Freely tradeable.

**Sell company shares**
- **Options:** Sell on open market at market price · sell back to company at NAV (company's V reserve × holder's fraction)
- **Fisc action:** Seller's asset A-token split; portion transferred to buyer. Company liability token unchanged.

**Create a secured obligation (loan / hire-purchase)**
- **Fisc action:** Creates paired fixed-obligation A-tokens. Pledged collateral held in Fisc escrow.
- **Condition:** Collateral must cover obligation value. Fisc checks this before creating tokens.
- **Settlement:** Fisc auto-deducts payments before crediting UBI. Collateral returned on full settlement; transferred to creditor on default.

**Register a land parcel (Mars colony — Harberger rules)**
- **First registration:** Any citizen or company claims an unregistered surface parcel by declaring a V-token value and paying the first month's stewardship fee (0.5% of declared value/month)
- **Ongoing:** Pay 0.5% monthly stewardship fee in V-tokens. Any citizen may force-purchase at declared price at any time. Owner cannot refuse.
- **Incentive:** Price too high → expensive monthly fee. Price too low → someone buys immediately.

**Register a land parcel (Earth colony)**
- A-tokens issued at founding to reflect existing ownership. Transfer by mutual agreement. No force-purchase unless founding constitution explicitly adopts Harberger rules.

### 3.6 Profile

**View own profile**
- **Where:** `/colony/:slug/profile`
- **Shows:** Citizen name, G-token ID, date of birth, age, joined date, voting eligibility

**View another citizen's profile**
- **Where:** `/colony/:slug/profile/:address`
- **Shows:** Same fields. Read-only.

**Wallet disconnect**
- **Where:** Profile page
- **What:** Local state only. No on-chain transaction.

### 3.7 Citizen Lifecycle Events (Fisc-automated, not citizen-initiated)

| Event | What Fisc does automatically |
|---|---|
| **Month start** | Issues 1,000 S to every citizen wallet after settling all liability A-token obligations |
| **Month end** | Destroys all remaining S-tokens in all wallets |
| **Death (registered)** | Retires G-token · processes inheritance per registered designation · discharges outstanding obligations in priority order (MCC bills first, then creditors pro-rata, then remainder to heirs) |
| **Adulthood (18)** | Issues G-token · transfers V-token pool from guardian to citizen |
| **Term end (board member)** | Redeems all MCC shares at current NAV, pays in V-tokens |

---

## Part 4 — MCC Functions

### 4.1 What MCC Is

MCC is a company governed by the same token rules as every other company. The board are the shareholders for the duration of their term — they own MCC commercially and receive its profits as dividends. MCC equity is an office-term instrument: auto-redeemed at NAV when a term ends; fresh issuance to incoming directors.

Citizens hold G-tokens — governance rights only, not commercial ownership. The MCC holds one O-token held by the designated MCC chair, conferring administrative authority without equity.

### 4.2 MCC Services

| Service | Mars colony billing basis | Earth colony example |
|---|---|---|
| Atmospheric processing | Flat rate per month | — |
| Water | Per litre consumed | Utilities |
| Power | Per kWh consumed | Utilities |
| Habitat | Per m² occupied | Space hire |
| Medical AI | Flat monthly subscription | Healthcare co-pay |
| Internal communications | Flat monthly fee | Broadband / printing |
| Waste processing | Per kg processed | Waste & recycling |
| Security and justice | From MCC general revenue | — |
| Company infrastructure levies | For companies using dome/power/water | Venue/facilities levy |

### 4.3 MCC Governance Constraints

- May **not** compete commercially with private companies
- Mandate fixed in founding constitution — changeable only by 80% referendum
- **Automatic recall trigger:** If standard citizen bill rises >20% above 12-month rolling average in any single month, Fisc initiates colony-wide recall referendum automatically

### 4.4 MCC Board (Full Mars model)

| Role | Responsible for |
|---|---|
| Chief Executive | Strategy, constitutional compliance |
| Operations Director | Dome, life support, power, water, waste |
| Finance Director | Billing, accounts, Fisc liaison |
| Security Director | Physical safety, property rights, justice |
| Medical Director | AI diagnostics, health emergency response |
| Citizen Representative | Voice of non-entrepreneurial citizens |

Board compensation comes through MCC equity dividends. One-year terms. Elected annually by G-token holders.

### 4.5 MCC Announcements

- **Where:** Mcc.jsx — announcements board
- **Who can post:** Colony founder and current board members
- **What:** Colony-wide messages to all citizens via `/api/announcements` (Supabase)

---

## Part 5 — Company Functions

*(For reference — these are company-side operations, not citizen-initiated directly)*

**Register a company**
- Any citizen may found a company via the Mall / RegisterCompany
- No licence required — registration is administrative (access to the payment system)
- No exclusive territories; no state protection from competition
- Founding equity agreed at formation and registered on-chain

**Monthly company cycle**
- Earn S-tokens from customers throughout month
- Pay sole-trader contractors and suppliers in S-tokens
- No wages to participants — participants are equity holders
- At month end: FD declares dividend; Fisc distributes declared V amount to shareholders pro-rata; remaining V stays in reserve

**Company insolvency**
A company that cannot cover its costs fails. No subsidy, no bailout. Fisc dissolves the company, cancels outstanding equity A-tokens, and pays creditors from remaining V reserve before returning any residual to shareholders.

---

## Part 6 — Earth Colony Extensions

### 6.1 The Fisc Rate

The Fisc publishes an implied exchange rate between S-tokens and the external currency (e.g. USD) daily. This rate is derived from the **bread basket anchor**:

```
fisc_rate = SPICE_bread_price_external / bread_price_in_S
```

The bread basket price is the colony's anchor — the Fisc defends this rate. The three-number consistency triangle that must hold:

- **Bread price in S** (governance parameter, e.g. 4 S/loaf)
- **Fisc rate** (derived, e.g. $0.51/S)
- **UBI value in external currency** (e.g. $510/month at 1,000 S × rate)

### 6.2 External Trade (Phase 2)

*Not yet implemented. Planned.*

S-tokens have no external value. Phase 2 will introduce inter-colony and external settlement via BTC or equivalent. S-tokens will remain internal. V-tokens remain colony-specific and non-portable. A citizen wishing to exit will convert V-tokens via BTC conversion mechanism.

### 6.3 What Makes an Earth Colony Work

The UBI's real value depends entirely on what the MCC and participating merchants accept in S-tokens. The founding group's most important decision is what the MCC provides and at what price.

**Examples:**
- **University campus:** MCC provides canteen access, printing, space hire, event services
- **Housing cooperative:** MCC provides utilities, maintenance, shared facilities
- **Town pilot:** MCC provides local services merchants agree to denominate in S-tokens

A colony where the canteen, library, and a dozen local businesses accept S-tokens gives the UBI real practical value. A colony where only one coffee stand accepts S-tokens gives it almost none.

---

## Part 7 — Constitutional Protections

Require 80% G-token referendum to amend:

| # | Protection |
|---|---|
| 1 | UBI may not fall below 1,000 S/month per adult |
| 2 | UBI may not be conditional, means-tested, or withheld |
| 3 | Every adult citizen holds exactly one G-token |
| 4 | G-tokens cannot be bought, sold, or inherited |
| 5 | MCC may not compete commercially with private companies |
| 6 | No authority may confiscate citizen V-tokens |
| 7 | All ownership publicly visible at all times |
| 8 | MCC infrastructure may not be privatised |
| 9 | No licence required beyond Fisc registration to operate a company |
| 10 | The Fisc may not be placed under MCC or company control |
| 11 | Citizen positive A-tokens may not be confiscated by any authority |
| 12 | Only the Fisc may mint S-tokens or V-tokens. Fractional reserve banking prohibited. |

---

## Part 8 — Read-Only State (Citizen-Facing)

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
| Candidates + vote counts | `Governance.getCandidates(id)`, `getCandidateVotes(id, addr)` |
| Has voted | `Governance.hasVoted(address, id)` |
| Colony announcements | `/api/announcements` (Supabase) |
| Notifications | `/api/notifications` (Supabase) |
| Citizens list | `/api/citizens?colony=0x…` (GToken enumeration) |
| Fisc rate (Earth colony) | Published daily — oracle endpoint (planned) |

---

## Part 9 — Function Reference Table

| Function | Contract | Who | Phase |
|---|---|---|---|
| `join(name, dob)` | Colony | Any unregistered address | One-time |
| `claimUbi()` | Colony | Registered citizen | Monthly |
| `send(to, amount, note)` | Colony | Registered citizen | Anytime |
| `saveToV(amount)` | Colony | Registered citizen | ≤200 S/month |
| `redeemV(amount)` | Colony | Registered citizen | Anytime |
| `openElection(role)` | Governance | Any citizen | Role vacant |
| `nominateCandidate(id, addr)` | Governance | Any citizen | Nomination phase |
| `vote(id, addr)` | Governance | Citizen aged 18+ | Voting phase |
| `finaliseElection(id)` | Governance | Any citizen | After voting closes |
| `executeElection(id)` | Governance | Any citizen | After timelock |
| `resign(role)` | Governance | Current role holder | Anytime |

---

## Part 10 — The External World Project

### 10.1 The Need

Earth colonies have an external dimension Mars colonies do not — they sit inside an existing economy with real prices, real exchange rates, and real merchants. To build and test Earth colony features correctly, a separate project is needed that models and simulates the external world.

This is particularly important for:
- The **Fisc rate oracle** — something must publish the daily S/external-currency rate
- **Merchant POS** — the cafeteria payment scenario requires a till-side app
- **Budget calibration** — the bread basket anchor needs real reference prices to validate
- **Phase 2 external trade** — BTC settlement needs a test harness

### 10.2 Recommended Architecture

A separate project: **`spice-world/`** — a lightweight Node/React app that runs alongside the colony app for development and demonstration purposes.

**What it provides:**

| Component | What it does |
|---|---|
| **Fisc Rate Oracle** | Publishes daily S→USD rate to a public endpoint. Anchored to a configured bread basket price. Colony app reads this to show citizens external value of their balance. |
| **Merchant POS** | Browser-based till app. Cashier enters amount → generates NFC tag URL or QR code. Polls on-chain for incoming `send()` to merchant address. Shows receipt on confirmation. Powers the cafeteria demo. |
| **Price Reference Board** | Configurable table of real-world reference prices (Ohio BLS data default). Used by the budget builder to show dollar equivalents and compute implied exchange rates. |
| **World Scenario Engine** | Set external economic parameters: inflation rate, unemployment, commodity prices, exchange rate pressure. Used to test how Earth colony economics respond to external shocks. |
| **Merchant Registry** | Simple list of merchants who "accept S-tokens" in a test environment — name, address, logo, category. The colony mall reads from this in test mode. |

**What it is NOT:**
- Not a blockchain node
- Not part of the Fisc (the Fisc is the Colony smart contract)
- Not a financial institution — it has no custody of funds
- Not required for Mars colony functionality

### 10.3 The NFC Demo Flow (spice-world POS + colony native app)

```
Cashier opens spice-world/pos on tablet
Cashier enters: 4 S · recipient: 0xCAFE… (University Cafeteria company)
POS generates NFC tag URL: https://app.zpc.finance/pay?to=0xCAFE&amount=4&ref=042

Citizen taps phone to NFC tag on counter
  → iOS reads tag (background NFC)
  → Colony native app opens at /pay screen
  → Shows: "Pay 4 S to University Cafeteria"
  → Citizen approves with FaceID
  → colony.send() signed and broadcast
  → ~5s for Base Sepolia confirmation

POS polls /api or on-chain for colony.send() to 0xCAFE with ref=042
  → Detects confirmed tx
  → Shows receipt: "✓ Payment received — 4 S"
```

This is the proof-of-concept demo. Everything required to run it:
1. Company registered in the colony (address = 0xCAFE)
2. Citizen registered with S-token balance
3. `spice-world/pos` running on a tablet
4. Colony native app on citizen's phone with embedded wallet

### 10.4 Project Location

```
spice-dashboard/
  colony-app/          ← existing web colony app
  colony-app-native/   ← React Native mobile app (planned)
  spice-admin/         ← protocol admin
  spice-world/         ← new: external world simulator + POS
```

`spice-world/` would have its own `package.json` and Vercel project, deployed to `world.zpc.finance` or similar. Lightweight — no smart contracts, no blockchain dependency. Pure web app that reads the colony chain and provides the external-world layer on top.

---

## Appendix — What Has Not Been Built Yet

| Feature | Notes |
|---|---|
| A-token UI (asset registration, equity, obligations) | Full spec in mars_colony_economy.md. Not yet in colony app. |
| Fisc rate oracle | Earth colony only. Needs `spice-world/` project. |
| Children / guardian wallets | Part of citizenship lifecycle. Not in app. |
| Automatic recall trigger | Contract-level feature. Not in current Governance contract. |
| Full 6-role board | Current app has CEO/CFO/COO only. Full Mars model has 6 roles. |
| S-token auto-expiry | Month-end destruction. Not in current SToken contract. |
| Company V-conversion (full sweep) | Current app has manual saveToV. Full model = automatic company sweep at month end. |
| Phase 2 external trade | BTC settlement. Not designed yet. |
| `spice-world/` project | Fisc rate, POS, price reference, world scenarios. Planned. |

---

*SPICE Colony Comprehensive Spec v1 — synthesised from: fisc-functions.md, mars_colony_economy.md (v17), spice-budget-builder.jsx, SPICE_MARS_PART1_SPEC.md, SPICE_MARS_PART2_SPEC.md*
*April 2026*
