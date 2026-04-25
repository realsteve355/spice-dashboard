# Fairbrook Colony — Persona & Flow Specification

**Based on:** Bellefontaine, Ohio (Logan County seat, pop. ~14,000)
**Colony name:** Fairbrook
**Colony type:** Earth (open economy — USDC reserve, Fisc rate, LAT)
**Modelled citizens:** ~300 (representative sample of a real town)
**Chain:** Base Sepolia testnet

---

## 1. The Town

Fairbrook is a mid-size Ohio county seat. It has a small downtown with local businesses,
a community college (Fairbrook CC), a regional hospital, a light industrial zone,
and surrounding residential neighbourhoods. Some residents commute or work remotely
for companies based elsewhere. National chains operate alongside local independents.

The colony was formed when the Collision began to bite — automation had eliminated
enough local jobs that a group of residents organised around the SPICE model to
create a parallel local economy with a guaranteed basic income.

---

## 2. Personas

### Citizens (inside colony, receive UBI)

---

#### Maya Chen — Nurse
- **Role:** Registered nurse at Fairbrook Regional Hospital
- **Employment:** Hospital employs her in S-tokens (colony employer)
- **Income:** UBI (935 S/month) + salary (~2,000 S/month)
- **Property:** Rents apartment from Priya
- **Savings:** Saves 200 S/month into V
- **Spending:** Carla's Coffee, BurgerMac, Kromart, local market
- **Key flows:**
  - Receives UBI from MCC
  - Receives salary via Colony.send() from Hospital
  - Pays rent in S to Priya
  - Saves to V periodically
- **System coverage:** Pure S-economy citizen. UBI → spend → circulate.

---

#### Carla Reyes — Coffee Shop Owner
- **Business:** Carla's Coffee, downtown Fairbrook
- **Employment:** Self-employed, employs 2 humans (no automation)
- **Property:** Leases her shopfront from Priya (rent in S)
- **Income:** UBI + coffee shop S revenue
- **LAT:** Zero — no automation, human-run
- **Spending:** Buys supplies from local market and Kromart
- **Key flows:**
  - Receives S from customers via Colony.send()
  - Pays rent to Priya
  - Pays staff wages in S
  - Claims UBI
  - No LAT liability
- **System coverage:** Small local business. No tax burden. S circulates locally.

---

#### Dave Kowalski — Lawyer
- **Business:** Kowalski & Partners, Main Street
- **Property:** Owns his office building + owns his home
- **Employment:** Self-employed; some colony clients (billed in S), some external clients (billed in USDC)
- **Income:** UBI + S billings + USDC billings (converted at boundary)
- **Savings:** Significant V holdings — uses V as long-term store of value
- **LAT:** Modest — uses AI legal research tools (document review, case analysis)
  but still employs a paralegal and receptionist
- **Key flows:**
  - Bills colony clients in S via Colony.send()
  - Receives USDC from external clients → boundary import → S
  - Pays LAT quarterly on AI tool usage
  - Holds V for yield
  - Property registered in asset register (home + office) — no tax, record only
- **System coverage:** Professional services. Boundary import. V savings. Modest LAT. Property registration.

---

#### Priya Patel — Landlord
- **Property:** Owns 3 residential properties + 2 commercial units downtown
- **Income:** UBI + rental income in S
- **LAT:** Zero — purely human relationships, no automation
- **Spending:** Local businesses, some external (converted to S at boundary)
- **Key flows:**
  - Collects rent in S from Maya (residential) and Carla (commercial)
  - All 5 properties registered in asset register
  - Receives UBI
  - Converts some S → USDC for external purchases (boundary export)
- **System coverage:** Landlord/property owner. Asset register. Boundary export.

---

#### Graham Foster — Remote Tech Contractor
- **Employment:** Works remotely for ExaTech (external Silicon Valley firm), paid in USDC
- **Residence:** Lives in Fairbrook colony
- **Income:** UBI + USDC salary from ExaTech → boundary import → S
- **LAT:** Zero — he is a worker, not an employer using automation
- **Spending:** All local — Carla's, Kromart, rent, savings
- **Key flows:**
  - Receives USDC from ExaTech (external, no colony presence)
  - Converts USDC → S at Fisc boundary (import flow)
  - Receives UBI
  - Spends S locally
  - Saves some V
- **System coverage:** Key boundary import flow. USDC → S conversion. Remote worker persona.

---

#### Father Tomas Novak — Parish Priest
- **Role:** Runs St. Brendan's Parish, Fairbrook
- **Income:** UBI + parish donations (in S from citizens, in USDC from external donors)
- **LAT:** Zero
- **Key flows:**
  - Parish receives S donations from citizens
  - Parish receives USDC donations from external supporters → boundary import
  - Parish makes donations to MCC reserve (voluntary contribution)
  - Pays staff (parish secretary, groundskeeper) in S
- **System coverage:** Donation flow. Voluntary MCC contribution. Religious community model.

---

#### Sofia Brandt — Student (Fairbrook CC)
- **Role:** Full-time student, part-time barista at Carla's
- **Income:** UBI + part-time wages in S from Carla
- **LAT:** Zero
- **Key flows:**
  - Receives UBI
  - Receives wages from Carla via Colony.send()
  - Spends entirely locally
- **System coverage:** Low-income citizen. Shows UBI is meaningful floor even without full employment.

---

### Businesses (colony-registered)

---

#### Carla's Coffee (sole trader)
- **Owner:** Carla Reyes (citizen)
- **Staff:** 2 humans (Sofia + one other)
- **Revenue:** S-tokens from customers
- **LAT:** Zero
- **Asset:** Commercial lease (not owned) — not in asset register
- **System coverage:** Small local business, zero LAT. Shows system doesn't penalise human employment.

---

#### Kowalski & Partners (professional services)
- **Owner:** Dave Kowalski (citizen)
- **Staff:** 1 paralegal, 1 receptionist (humans) + AI research tools
- **Revenue:** S (colony clients) + USDC (external clients)
- **LAT:** Low — AI tools assist but don't replace majority of staff
- **Asset:** Office building owned by Dave — registered in asset register
- **System coverage:** Mixed S/USDC revenue. Modest LAT. Property in register.

---

#### Fairbrook Regional Hospital
- **Type:** Colony institution (non-profit, community-owned)
- **Staff:** Large human workforce — nurses, doctors, admin
- **LAT:** Low — some diagnostic AI tools, but primarily human care
- **Revenue:** Mix of S (colony patients), USDC (insurance, external patients)
- **Key flows:**
  - Pays wages in S to citizen staff (Maya etc.)
  - Receives USDC from external insurance → boundary import
  - Pays modest LAT on diagnostic AI
- **System coverage:** Large colony employer. Boundary import (insurance). Institutional LAT.

---

### National Chains (external entities with colony presence)

---

#### BurgerMac (3 outlets)
- **Type:** National fast food chain, external HQ
- **Local structure:** Franchised to Marco Rossi (citizen), who owns all 3 Fairbrook outlets
- **Staff:** ~40 humans across 3 sites + automated ordering kiosks + AI inventory system
- **Revenue:** S-tokens from colony customers
- **LAT:** Significant — automated kiosks replaced 8 cashier positions; AI inventory system
  replaced 2 stock management roles
- **Profit repatriation:** Marco takes his franchisee cut in S; BurgerMac national takes
  royalties → boundary export (S → USDC)
- **Key flows:**
  - Receives S from customers
  - Pays LAT quarterly to MCC (based on automation level)
  - Marco (franchisee citizen) takes profit in S, saves some V
  - National royalty → boundary export → USDC leaves colony
- **System coverage:** Multi-outlet national chain. Significant LAT. Boundary export. Franchisee split.

---

#### Kromart (1 store)
- **Type:** National supermarket chain, no local ownership
- **Staff:** ~60 humans + automated checkouts (12 self-serve, replaced ~8 cashiers)
  + AI supply chain / ordering system
- **Revenue:** S-tokens from colony customers (accepts S at checkout)
- **LAT:** High — largest automation footprint in the colony
- **Profit repatriation:** All net revenue → boundary export (S → USDC) to national HQ
- **Key flows:**
  - Receives S from customers
  - Pays LAT quarterly — largest single LAT contributor in Fairbrook
  - Converts all S profit → USDC at Fisc boundary (boundary export)
  - USDC exits colony → national supply chain
- **System coverage:** Largest LAT payer. Pure boundary export. No citizen ownership.
  Demonstrates the system captures value from external extractive businesses.

---

#### ExaTech (no colony presence)
- **Type:** External Silicon Valley tech firm
- **Relationship:** Employs Graham as a remote contractor
- **Colony interaction:** Pays Graham in USDC only. No S exposure. No colony registration.
- **Key flows:**
  - USDC payment to Graham → Graham converts at boundary
- **System coverage:** Purely external employer. Triggers import flow only.

---

### Visitors

---

#### Sofia's Parents (weekend visit)
- **Type:** External visitors, no colony membership
- **Duration:** 2-day visit
- **Key flows:**
  - Convert €/USD → S at colony boundary entry (visitor conversion)
  - Spend S at Carla's, downtown market, BurgerMac
  - Reconvert remaining S → USD on exit
- **System coverage:** Visitor boundary flow (in and out). Short-term S holder.

---

#### The Maplewood Delegation (inter-colony visit)
- **Type:** Representatives from Maplewood Colony (neighbouring SPICE colony)
- **Duration:** 1-day visit for inter-colony trade discussion
- **Key flows:**
  - Arrive with Maplewood S-tokens
  - Require inter-colony exchange rate (Fairbrook S vs Maplewood S)
  - Settle inter-colony obligations in ETH/USDC
- **System coverage:** Inter-colony flow. Cross-colony exchange rate. ETH settlement.

---

#### Marcus Webb (business visitor)
- **Type:** BurgerMac regional manager, external
- **Duration:** Day visit to inspect 3 outlets
- **Key flows:**
  - Buys lunch at BurgerMac (uses personal card → USD, BurgerMac handles S internally)
  - No direct S interaction — handled by BurgerMac's colony account
- **System coverage:** Shows external business visitors don't need direct S exposure
  if the business they visit handles conversion.

---

## 3. Economic Flow Map

### UBI cycle (monthly)
```
MCC mints S → Maya, Carla, Dave, Priya, Graham, Sofia, Father Tomas, Marco
→ spend at local businesses → S circulates → some saved to V
```

### LAT collection (quarterly)
```
BurgerMac assesses automation level → calculates LAT → pays S or USDC to MCC
Kromart (highest LAT) → pays to MCC
Hospital (low LAT) → pays to MCC
Dave/Kowalski (minimal LAT) → pays to MCC
→ MCC converts to USDC → deposits to Fisc reserve
→ reserve funds future UBI backing
```

### Boundary imports (ongoing)
```
Graham receives USDC from ExaTech → Fisc.deposit() → receives S at fisc rate
Dave receives USDC from external client → Fisc.deposit() → receives S
Hospital receives USDC from insurance → Fisc.deposit() → receives S
Parish receives USDC donation → Fisc.deposit() → receives S
Visitor converts USD → Fisc.deposit() → receives S for stay
```

### Boundary exports (ongoing)
```
BurgerMac national royalty → Fisc.withdraw() → USDC exits to national HQ
Kromart daily sweep → Fisc.withdraw() → USDC exits to national supply chain
Priya buys external goods → Fisc.withdraw() → small USDC exit
```

### Savings / V yield (ongoing)
```
Maya, Graham, Dave save S → V
V earns yield from colony economic activity
Yield distributed to V holders periodically
```

### Voluntary reserve contribution
```
St. Brendan's Parish → donates USDC to Fisc reserve (IncomeSource.Donation)
Federal/state grant (future) → Fisc reserve (IncomeSource.Federal)
```

---

## 4. System Coverage Checklist

| Scenario | Covered by | Built? |
|----------|-----------|--------|
| UBI issuance | Maya, all citizens | ✓ |
| S circulation (spend/send) | Carla, Maya, Sofia | ✓ |
| V savings | Dave, Maya, Graham | ✓ |
| Salary payment in S | Maya (hospital), Sofia (Carla) | ✓ |
| Small business, zero LAT | Carla's Coffee | ✓ contract exists |
| LAT — modest | Dave, Hospital | ✗ LAT sweep not built |
| LAT — significant | BurgerMac | ✗ |
| LAT — high | Kromart | ✗ |
| Boundary import (USDC→S) | Graham, Dave, Hospital, Parish | ✗ Fisc.deposit() |
| Boundary export (S→USDC) | BurgerMac, Kromart, Priya | ✗ Fisc.withdraw() |
| Visitor conversion | Sofia's parents | ✗ |
| Asset register — property | Dave (office+home), Priya (×5) | ✗ property type |
| Asset register — business | BurgerMac outlets, Kromart | ✗ |
| Voluntary donation to reserve | St. Brendan's | ✗ depositReserve() |
| V yield distribution | Dave, Maya, Graham | ✗ |
| Inter-colony settlement | Maplewood delegation | ✗ |
| Franchise structure | Marco / BurgerMac split | ✗ |
| Multi-outlet company | BurgerMac | partial (Mall exists) |

---

## 5. Proposed Build Sequence

1. **Fisc boundary flows** — `depositReserve(amount, source)` + `deposit()`/`withdraw()` for S↔USDC
   conversion. Unlocks Graham, Dave, Hospital, Kromart, BurgerMac export.

2. **LAT assessment + sweep** — Company contract records automation level; quarterly
   sweep collects LAT to MCC. Unlocks BurgerMac and Kromart's primary contribution.

3. **Asset register — property type** — Extend A-token register with PROPERTY type.
   APN reference, owner wallet, assessed value. Dave and Priya's properties.

4. **V yield distribution** — MCC surplus distributed to V holders. Dave and Maya's
   savings start earning.

5. **Visitor wallet** — Lightweight temporary account. Boundary in + out. Expiry.

6. **Inter-colony settlement** — ETH/USDC settlement between colonies. Maplewood delegation.

---

*Document version: 1.0 — 25 April 2026*
*Based on Bellefontaine, Ohio (Logan County)*
