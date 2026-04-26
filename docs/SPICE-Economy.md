# SPICE Economy
## Unified specification — Mars and Earth colony models

*Version 1 — April 2026. Working document. Gaps are named explicitly.*

---

## Part 1 — Shared Foundations

Both Mars and Earth colonies run the same token model, the same company model, and the same constitutional protections. The differences are extensions, not replacements.

---

### 1.1 The Two Monetary Tokens

| | S-token | V-token |
|---|---|---|
| **Role** | Day-to-day spending. The current account. | Wealth, savings, dividends, asset values. The savings account. |
| **Issued by** | Fisc — monthly, to every citizen | Fisc — via S→V conversion, $→V import, company dividends |
| **Expires** | Yes — unspent S destroyed at month end | Never |
| **Scope** | Internal colony only. No external value. | Internal + external boundary (Earth only — see Part 3) |
| **Spending** | All day-to-day transactions | Via V→S redemption first, then spend as S |
| **Asset valuation** | No | Yes — all significant assets and liabilities valued in V |

**Why S expires:** the monthly reset is the inflation control mechanism. The Fisc mints a fixed quantity of S each month. Every unspent S is destroyed at month end. The money supply resets to zero. Persistent inflation requires a growing money supply — this system has none. No policy decision, no override, no exception.

**Why two tokens:** S must expire to prevent hoarding and inflation. But citizens and companies need to carry wealth forward — to save, to invest, to fund large purchases. V is the permanent layer. Citizens convert S surplus to V. Companies convert all net S earnings to V. V is the colony's store of value.

---

### 1.2 The Three Governance and Identity Tokens

| Token | One per | Purpose | Economic value |
|---|---|---|---|
| **G** | Adult citizen | Governance — one vote in MCC elections, referenda, recall | None |
| **O** | Registered organisation | Identity — proves who speaks for the org on-chain | None |
| **A** | Any economic claim | Records every asset and liability in the colony | Yes — the claim itself |

**G-token:** soulbound. Non-transferable, non-purchasable, non-inheritable. Issued on signing the founding constitution at adulthood (18). Retired on death. Cannot be bought, sold, or delegated. One citizen, one vote, always.

**O-token:** held by the company secretary or MCC chair. Transfers to their successor when the role changes. Authorises on-chain operations for the organisation. No equity, no voting rights — pure identity.

**A-token:** the colony's unified economic claim. Every significant asset or liability is an A-token. Three forms:

1. **Unilateral asset** — physical object owned outright (robot, vehicle, land parcel). One A-token, one holder, no counterparty.
2. **Paired equity** — a company share. Fisc creates two simultaneously: asset A-token to the shareholder (records stake, receives dividends); liability A-token to the company (records aggregate distribution obligation). Fisc settles dividends automatically at month end.
3. **Paired fixed-obligation** — a bilateral payment agreement (loan, hire-purchase). Asset A-token to the creditor; liability A-token to the debtor. Fisc deducts from debtor before UBI is credited. Structural default is impossible for any Fisc-registered unsecured obligation — the Fisc will not register one that would push monthly obligations above the UBI floor.

**Net worth:** V-tokens + S-tokens + Σ(positive A-token values) − Σ(liability A-token values).

**Registration threshold:** A-tokens required for assets above 500 S-equivalent in value, above 50 kg, or with autonomous AI capability. Below threshold, possession implies ownership.

---

### 1.3 The Fisc

The Fisc is the colony's fully automated blockchain institution. Not a company. Not part of the MCC. A constitutional utility — created by the founding charter, governed by code not people.

**What the Fisc does:**
- Mints S-tokens on the 1st of each month — one fixed amount per registered citizen
- Destroys all unspent S-tokens at month end
- Processes S→V conversions (subject to colony cap rules)
- Processes V→S redemptions — uncapped, 1:1
- Settles all liability A-token obligations before crediting monthly UBI
- Settles MCC bills automatically from smart meter data
- Issues, transfers, and retires A-tokens — the sole creator of economic claim tokens
- Registers citizens, companies, assets, and share transfers
- Publishes all transaction data publicly
- Processes inheritance on registered death

**Why the Fisc must be separate from MCC:** the body that sets its own revenue cannot control the institution that issues currency. The Fisc serves all participants equally. No elected body has authority over its operation.

**Only the Fisc mints.** No private entity may create S or V tokens by any mechanism — including lending, debt issuance, or securitisation. Fractional reserve banking is constitutionally prohibited and mechanically impossible.

---

### 1.4 The MCC

The MCC (colony's essential services provider — named Mars Colony Company on Mars, may have any name on Earth) provides the services every citizen depends on that cannot safely be left to market competition.

- Provides essential shared services and bills in S-tokens
- The board are commercial shareholders — they own MCC during their term and receive profits as dividends
- Citizens hold G-tokens — governance rights only, not commercial ownership
- Board serves one-year terms, elected annually by G-token holders
- All MCC revenue, costs, and profit publicly visible on-chain in real time
- **Automatic recall trigger:** MCC bill rises >20% above 12-month rolling average in any single month — Fisc initiates colony-wide recall referendum automatically
- MCC may not compete commercially with private companies

---

### 1.5 The Company Model

Companies have no wages. This is not a constraint — it is the design.

- Any citizen may register a company with the Fisc (administrative registration, not a licence)
- Companies earn S from customers, pay suppliers and contractors in S
- At month end: all net S earnings convert to V. The Finance Director declares a dividend. Fisc distributes declared V pro-rata to all shareholders automatically.
- Participants hold vesting equity — monthly tranches over 1–12 months. Month-12 tranche is larger (commitment bonus). Unvested shares pay dividends but cannot be transferred. Unvested shares forfeited if participant leaves; vested shares are permanent.
- One-off goods and services between parties are paid in S as commerce. This is trade, not employment.
- A **sole trader** is a citizen providing goods or services for S with no equity relationship. Accumulates wealth by converting S surplus to V.
- Companies fail if they cannot cover costs. No subsidy, no bailout.

**Share value:** floor = company V reserve × (shares held / total shares outstanding). Market price may exceed floor on growth expectations. Buybacks at market value; bought-back shares cancelled.

---

### 1.6 Citizenship

- Any person signs the founding constitution on-chain. Fisc issues G-token. UBI begins the 1st of the following month.
- No vetting, no fee, no approval process.
- Children registered by guardian at birth. Full UBI from birth, managed by guardian. G-token issued at 18 when the citizen signs the constitution themselves.
- By adulthood: a child whose guardian converted the monthly maximum to V holds at least 43,200 V-tokens — a capital foundation entirely their own.

---

### 1.7 Constitutional Protections

The following require 80% of all registered citizens to amend.

| # | Protection |
|---|---|
| 1 | UBI may not fall below the founding floor |
| 2 | UBI may not be conditional, means-tested, or withheld |
| 3 | Every adult citizen holds exactly one G-token |
| 4 | G-tokens cannot be bought, sold, or inherited |
| 5 | MCC may not compete commercially with private companies |
| 6 | Citizen V-tokens may not be confiscated by any authority |
| 7 | All ownership publicly visible on-chain at all times |
| 8 | MCC infrastructure may not be privatised |
| 9 | No licence required to register a company beyond Fisc registration |
| 10 | The Fisc may not be placed under MCC or company control |
| 11 | Citizen positive A-tokens may not be confiscated by any public or private authority |
| 12 | Only the Fisc may mint S or V tokens. Fractional reserve banking prohibited. |

---

## Part 2 — Mars Colony Economy

Mars is a closed economy. S and V have no value outside the colony. There is no external currency boundary. The economy is self-contained by design and by physical necessity.

---

### 2.1 S-Token — Mars

| Property | Value |
|---|---|
| Monthly UBI amount | 1,000 S per adult citizen — fixed |
| Expiry | All unspent S destroyed at month end |
| External value | None |
| Fractional reserve | Prohibited |
| Inflation | Impossible — see §1.3 |

**Why 1,000 is fixed:** in a closed colony the S-token is pure scrip. Its value comes from what MCC and participating companies accept. The fixed quantity and monthly reset is the complete inflation control mechanism. No basket anchor is needed — prices are set by supply and demand within the fixed monthly budget.

---

### 2.2 V-Token — Mars

| Property | Value |
|---|---|
| Monthly citizen conversion cap | 200 S → V per citizen per month |
| Company conversion | All net monthly S earnings → V (uncapped) |
| Expiry | 100 years from mint date (prevents dynastic accumulation across generations) |
| External value | None |
| Redemption | V → S at 1:1, uncapped, at any time |

**Why the citizen cap exists on Mars:** in a small founding colony, an uncapped conversion would allow a handful of participants to accumulate V rapidly and dominate the economy before competition develops. The cap is a founding-phase protection. It may be relaxed by referendum as the colony matures.

---

### 2.3 Land — Mars (Harberger)

Land parcels are A-tokens. On Mars, surface land is unowned at founding. The Fisc operates Harberger stewardship:
- Owner declares a V-token value
- Monthly stewardship fee: 0.5% of declared value in V, paid to colony treasury
- Any citizen or company may force-purchase at the declared price at any time — the owner cannot refuse
- Self-correcting: price too high → expensive fee. Price too low → immediate purchase. Honest pricing is the equilibrium.
- First registration: first-come-first-served by declaring a value and paying the first month's fee.

---

### 2.4 What MCC Provides on Mars

Atmosphere, water, power, habitat, food baseline, medical AI, communications, waste processing, security. Billed in S at metered rates via smart contracts. Citizens see their real-time bill on-chain at any moment.

---

### 2.5 Known Gaps — Mars

| Gap | Status |
|---|---|
| Inter-colony trade | Phase 2 — instrument will be BTC or equivalent. Not in scope here. |
| Colony exit | Phase 2 — V-tokens are non-portable. Exit mechanism via external settlement not yet designed. |
| V cap relaxation schedule | Open — at what colony size or maturity does the 200/month cap become counterproductive? |
| UBI floor adjustments | Open — the founding UBI is fixed. What is the mechanism for a colony-wide vote to raise it? |
| Multiple colonies, one Fisc | Open — do colonies share a Fisc instance or run independent instances? |

---

## Part 3 — Earth Colony Economy

Earth is an open economy. A dollar boundary exists. S remains purely internal. V is the bridge between the colony economy and the external dollar world.

Everything in Parts 1 and 2 applies to Earth with the following extensions and differences.

---

### 3.1 S-Token — Earth

Same as Mars. UBI amount set at colony founding. Expires monthly. Internal only. No change.

---

### 3.2 V-Token — Earth

| Property | Mars | Earth |
|---|---|---|
| Citizen conversion cap | 200 S/month | **None — uncapped** |
| Dollar imports | Not applicable | **$ → V at Fisc rate** |
| External conversion | None | **V ↔ $ at Fisc rate (two-way)** |
| Asset valuation | V | V (same) |
| Expiry | 100 years | 100 years (same) |

**Why no cap on Earth:** wealth arrives from outside the colony in V (dollar imports, asset valuations, dividend income). A cap would penalise citizens whose wealth is in assets rather than accumulated from UBI savings — the asset-poor would have room to save; the asset-rich would be arbitrarily constrained. The cap is a small-colony founding protection, not a permanent principle.

**Why V, not S, for dollar imports:** someone converting $200,000 for a property purchase is not buying groceries. S is the spending layer and expires monthly — the wrong instrument for wealth storage or large asset transactions. V is permanent, the correct destination for any capital entering the colony from outside.

---

### 3.3 The Fisc Rate and Dollar Boundary

The Fisc rate ($/V) is set so the colony's reference basket always costs a fixed number of V-tokens. As automation drives goods prices down, the Fisc rate falls — but the basket cost in V remains stable. Citizens think in V, not in dollars.

**Dollar import ($ → V):**
1. Citizen or company brings dollars to the Fisc
2. Fisc mints V at the current Fisc rate
3. Fisc immediately converts received dollars to BTC (or gold) — not held as dollars
4. The V is fully backed by hard assets in the reserve

**Dollar export (V → $):**
1. Citizen or company requests dollar redemption
2. Fisc sells BTC from reserve at market price
3. Pays out dollars at current Fisc rate
4. Burns the redeemed V

**Why BTC, not dollars, in the reserve:** the entire premise of the Earth model is that the dollar is debasing. Holding dollars in reserve means the backing for V erodes alongside the dollar — defeating the purpose. BTC appreciates as the dollar weakens. The reserve strengthens as conditions deteriorate.

**Why two-way conversion matters for adoption:** a one-way street feels like a trap. If participants know they can exit to dollars if the colony fails, they are far less reluctant to convert in. The reserve must be large enough to honour redemptions — see §3.6 (open gaps).

---

### 3.4 The Fisc Reserve

The Fisc reserve is the colony's hard-asset backing for all V-tokens issued via dollar import. It does not back UBI-minted V (which is ex nihilo, like the S-token mint).

| Reserve property | Detail |
|---|---|
| Assets held | BTC (primary), gold (secondary) |
| Funded by | Dollar imports from purchase scheme |
| Purpose | Back two-way V↔$ conversion |
| Appreciation | As dollar weakens, BTC reserve appreciates — reserve strengthens |
| Managed by | Fisc autonomously — no board discretion |

The reserve is publicly visible on-chain at all times. Any citizen can verify the backing ratio.

---

### 3.5 Asset and Liability Valuation

The Fisc offers on-chain denomination of any asset or liability in V-tokens.

- Bring any asset (property, business, equipment) or liability (mortgage, loan)
- Provide current dollar market value (self-reported, or evidenced by market transaction)
- Fisc records: asset ID, V value at current Fisc rate, timestamp
- Valuation **floats** — updates as dollar price and Fisc rate change
- Asset is now in the colony ecosystem: tradeable in V, usable as collateral, visible on ledger

**Why floating, not fixed:** a fixed valuation is a hedge. A floating valuation is a denomination service — it brings the asset inside the S/V economy without making a promise about future dollar value. The value in V changes as the world changes. Citizens who want to hedge should hold V in the reserve, not fix asset valuations.

**Liability standoff:** debtors do not want their liabilities S-valued (they prefer dollar debt to inflate away). Creditors do. Resolved by original contract terms or negotiation. The Fisc will register either party's position — it does not adjudicate the dispute.

**Land on Earth:** pre-existing private property. A-tokens issued at founding to reflect existing ownership. Transfers by mutual agreement at freely negotiated prices. No Harberger mechanism unless the founding constitution explicitly adopts it.

---

### 3.6 Corporate SPICE Supporters

External companies — national chains, regional employers — may voluntarily register as SPICE supporters. The agreement:
- Accept S-tokens as payment within the colony boundary
- Optionally: pay a voluntary LAT (Local Automation Tax) on declared automation profits, distributed as additional UBI via the Fisc
- In return: recognised as colony participants, listed on-chain, access to the S-token customer base

**LAT is opt-in, not compulsory.** A legally enforceable tax requires legislative authority the colony does not have. Voluntary LAT is a partnership agreement — companies sign because their customers have UBI and their participation makes business sense. The automation dividend flows to citizens not through coercion but through the price mechanism and voluntary commitment.

**The incentive:** a company whose customers are colony citizens needs those citizens to have spending power. UBI creates the customer base. Accepting S and contributing to UBI is not charity — it is the price of having customers in an automated world.

---

### 3.7 What MCC Provides on Earth

The MCC on Earth provides whatever essential shared services the colony depends on. Examples:

| Colony type | MCC services |
|---|---|
| University campus | Canteen access, printing, space hire, student services |
| Housing cooperative | Utilities, maintenance, shared facilities |
| Tech campus | Employee services, gym, childcare, canteen |
| Town pilot | Local services agreed by founding merchants and residents |

The MCC handles external purchasing (flour, equipment, utilities) in dollars centrally. Individual colony businesses receive S and never touch external suppliers directly. The dollar/S boundary is managed at the institutional level, invisibly to participants.

---

### 3.8 The Two Kinds of S in Circulation

Two sources of S, naturally segmenting by use without any policy rule:

| | UBI-minted S | Purchase-minted S (via V redemption) |
|---|---|---|
| Origin | Fisc monthly mint | V→S redemption by citizens with dollar-imported V |
| Backing | None — sovereign money | BTC reserve (indirectly, via V) |
| Inflation effect | Mild, predictable, fixed formula | None — backed by reserve |
| Typical transaction | Groceries, services, daily needs | Large purchases after V→S redemption |
| Velocity | High | Low |

The colony's S economy is dominated by UBI-minted S in daily circulation. Purchase-minted S (redeemed from dollar-imported V) appears only when someone converts wealth for a specific large transaction.

---

### 3.9 The Flipping Point

The Earth model has a transition dynamic that Mars does not: a gradual shift from dollar as reference currency to V as reference currency.

- **Pre-flip:** assets quoted in dollars, V value derived. Dollar is the anchor.
- **Post-flip:** assets quoted in V, dollar value irrelevant or unavailable. V is the anchor.

The flip is not decreed. It happens when enough assets are denominated in V on-chain that buyers and sellers naturally quote in V — because that is where the liquidity is. The Fisc valuation service and the purchase scheme accelerate it. The dollar collapse accelerates it further.

---

### 3.10 Known Gaps — Earth

| Gap | Status |
|---|---|
| Reserve ratio | What minimum BTC reserve is required to honour redemptions? No floor set. |
| Redemption gates | If redemption demand exceeds reserve, what happens? No limit or delay mechanism designed. |
| Fisc rate mechanism | Who sets the reference basket? How is the rate updated? Frequency? Oracle? |
| Corporate LAT auditing | Voluntary LAT requires a declared automation profit figure. Who verifies it? |
| Transition period LAT | During partial automation, LAT on windfall is conceptually valid but operationally complex. Left open. |
| Earth Lite | A middle-ground model between campus (fully closed, institution as Fisc) and full Earth (open, BTC reserve, Collision-ready) is referenced but not yet specified. |
| Inter-colony trade | Same as Mars — Phase 2. BTC settlement between colonies not yet designed. |
| Regulatory environment | S-tokens and V-tokens are not legally recognised currencies. No legal framework for the Fisc valuation service. Tax treatment of V gains unclear. All open. |
| Dollar collapse timing | The Earth model is designed for a Collision that may or may not occur on any given timeline. The colony must be viable without the Collision as well as with it. |

---

## Summary — Mars vs Earth

| | Mars | Earth |
|---|---|---|
| Economy type | Closed | Open — $ boundary |
| S UBI amount | Fixed (e.g. 1,000/month) | Fixed (set at founding) |
| S expiry | Monthly | Monthly |
| V citizen cap | 200 S/month | None |
| V external value | None | Two-way V↔$ at Fisc rate |
| Dollar imports | Not applicable | $ → V, Fisc buys BTC |
| Asset valuation | V | V (same) |
| Land | Harberger stewardship | Pre-existing private property |
| LAT | Not applicable | Voluntary opt-in only |
| BTC reserve | Not applicable | Yes — backs V↔$ conversion |
| Collapse dependency | No — self-contained | No — viable before and after Collision |

---

*SPICE Economy · Unified Specification · v1 · April 2026*
*Supersedes: mars_colony_economy.md (economic model sections). mars_colony_economy.md remains the reference for operational detail (robot fleet, founding colony, frontier stories).*
*Earth model extensions are new — not yet reflected in any prior document.*
