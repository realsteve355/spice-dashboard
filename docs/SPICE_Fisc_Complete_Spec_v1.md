# SPICE Protocol — The Fisc: Complete Technical Specification
## v1.0 — Claude Code Handoff

| Field | Value |
|---|---|
| Colony | Millbrook, Ohio (8,000 residents) |
| Chain | Base L2 (low gas, EVM-compatible) |
| Repo | `spice-dashboard` |
| Stack | React / TypeScript / Solidity / SQLite / Vite |
| Related specs | `SPICE_Fisc_Budget_Spec_v1.md` (budget page detail) |
| Status | Ready for implementation |

---

## Table of Contents

1. What the Fisc Is
2. Constitutional Principles
3. Token Architecture
4. The Ten Fisc Functions (F1–F10)
5. Local Robot Tax (LRT)
6. Exchange Rate Management
7. The USDC Reserve
8. Boundary Flows
9. The Citizen Wallet
10. Inter-Colony Settlement
11. Published Dashboard — All State Variables
12. Participant Types and Fisc Interactions
13. Governance Events (On-Chain)
14. Smart Contract Interface
15. Database Schema
16. File Structure
17. Key Invariants to Test
18. Build Order

---

## 1. What the Fisc Is

The Fisc is the autonomous financial infrastructure of the SPICE colony. It is simultaneously:

- **Token issuer** — the sole creator of S-tokens. V-tokens are created only via authorised conversions.
- **Reserve manager** — holds and manages the USDC float that backs all boundary transactions.
- **Currency exchange** — converts between S/V-tokens and USDC for all cross-boundary flows.
- **Tax collector** — receives LRT payments from businesses in USDC.
- **Rate setter** — publishes the S/V → USDC exchange rate daily via algorithm.
- **Transparency engine** — publishes all state on-chain in real time.

The Fisc is **not** a bank. It does not lend money it does not have. It does not operate fractional reserve. Every S-token in circulation is backed by the Fisc's issuance authority and the colony's productive economy. Every V-token redeemable for USDC is backed by the reserve.

The Fisc is **not** a government. It does not make policy decisions. It executes rules set by governance. Rate-setting, LRT-setting, and reserve management all follow published algorithms — no human discretion at execution time.

The Fisc is **not** the MCC. The MCC is a separate company that provides public services and bills residents. The Fisc provides the monetary infrastructure the MCC uses. See `MCC_Spec.md` for MCC detail.

---

## 2. Constitutional Principles

These principles are encoded in the smart contract and cannot be overridden by any governance vote without a supermajority (>66% of G-token holders):

```
P1. The Fisc is the sole issuer of S-tokens.
P2. S-tokens expire at period end. No exceptions.
P3. V-tokens never expire.
P4. S and V tokens are 1:1 in face value. Same exchange rate applies to both.
P5. The reserve minimum ratio must be maintained at all times.
    Below minimum: external conversions are suspended, RESERVE_ALERT emitted.
P6. The LRT rate is set to the minimum sustaining the reserve target.
    It is not a revenue maximisation tool.
P7. All Fisc state is public and on-chain. No hidden accounts.
P8. Citizens hold one wallet. No separate USDC wallet exists for residents.
P9. All prices in the colony are quoted in S-tokens.
    USDC equivalents are derived from the published rate, not separately set.
P10. The bread basket price is the Fisc's anchor target.
     The exchange rate floats to defend it.
```

---

## 3. Token Architecture

### S-Tokens (Spending tokens)

- Issued by the Fisc at period start to every registered resident
- Amount: `UBI_AMOUNT` (governance parameter, integer, currently 935)
- Expire at period end (last second of the calendar month)
- Cannot be created by any entity other than the Fisc
- Cannot accumulate — any unspent S-tokens burn at period end
- Used for: all local commerce, MCC bill payment, point-of-sale transactions
- Citizen conversion cap: max 20% of `UBI_AMOUNT` per period to V-tokens
- Business sweep: 100% of S-token receipts sweep to V at period end (uncapped)

### V-Tokens (Value tokens / savings)

- Created only via authorised conversion (F4, F5, F7, F8 sweep)
- Never expire
- Accumulate permanently in the holder's wallet
- Used for: savings, investment, external purchases (via Fisc F6), inter-colony payments
- Earn yield if governance votes to distribute LRT surplus (optional, currently 0%)
- Redeemable for USDC via Fisc at published rate (F6)

### The 1:1 Relationship

```
1 S-token = 1 V-token in face value
Both convert to USDC at the same published Fisc rate
S→V conversion is always 1:1 (no fee, no spread)
V→S conversion does not exist — V is permanent savings
```

### Price Convention

All prices in the colony are quoted in S-tokens. The USDC equivalent is always derived:

```typescript
const usdcEquivalent = priceInS * fiscRate;
// fiscRate = $ per token, published daily by Fisc
```

Merchants set prices in S-tokens. Visitors see the USDC equivalent computed from the live rate. Neither merchants nor citizens ever set dollar prices for local goods.

### Period Mechanics

```
Period = calendar month (UTC)

Period start (00:00:01 UTC, 1st of month):
  1. MCC bills deducted from all resident S-balances (F1b)
  2. New S-tokens issued to all residents (F1)

During period:
  - Commerce, conversions, LRT payments, boundary flows (ongoing)

Period end (23:59:59 UTC, last day of month):
  1. Citizen S→V conversions processed (F4, if requested)
  2. Business S-token balances swept 100% to V (F3)
  3. Remaining S-tokens burned (F2)
  4. Period report published on-chain (F11)
  5. New period begins
```

---

## 4. The Ten Fisc Functions

### F1 — Issue S-Tokens

```
Trigger:    Period start (automated)
Actor:      Fisc only

Inputs:
  - registered_residents[]  (from resident registry)
  - UBI_AMOUNT              (governance parameter)

Process:
  for each resident in registered_residents:
    resident.wallet.S += UBI_AMOUNT

Outputs:
  - S-token credit to every registered resident wallet
  - S_ISSUED event logged

Rules:
  - UBI_AMOUNT is integer. No fractional tokens.
  - Issuance is unconditional — income, employment status, 
    prior behaviour do not affect UBI receipt.
  - Deceased or deregistered residents do not receive issuance.
  - New residents registered mid-period receive pro-rata issuance
    (days remaining / days in period × UBI_AMOUNT, rounded down).
```

### F1b — Deduct MCC Bill

```
Trigger:    Period start, immediately after F1
Actor:      Fisc (on behalf of MCC)

Inputs:
  - resident_registry[]     (with housing_status per resident)
  - published_budget        (current MCC bill structure)

Process:
  for each resident:
    bill = sum of autoDeducted budget lines
    if resident.housing_status === 'external': exclude housing line
    resident.wallet.S -= bill
    mcc_wallet.S += bill

Outputs:
  - MCC S-token wallet credited
  - Resident S-balance reduced by bill amount
  - MCC_BILL_DEDUCTED event logged per resident

Rules:
  - If resident.wallet.S < bill after UBI issuance: 
    deduct what is available, log INSUFFICIENT_BALANCE alert.
    MCC absorbs shortfall — does not cut off services.
    Governance notified.
  - MCC bill is always in S-tokens. Never USDC.
```

### F2 — Burn S-Tokens

```
Trigger:    Period end (automated, after F3 and F4)
Actor:      Fisc only

Inputs:
  - all resident S-token balances

Process:
  for each resident_wallet:
    burned += wallet.S
    wallet.S = 0
  S_BURNED_TOTAL recorded to ledger

Outputs:
  - All remaining S-tokens destroyed
  - Burn total published in period report

Rules:
  - Burn is unconditional. No exceptions.
  - Business wallets are swept before burn (F3) — no business S-tokens burn.
  - Burn does not affect V-token balances.
  - Burn total is a key economic indicator: high burn = citizens 
    not spending = local economy underperforming.
```

### F3 — Business S→V Sweep

```
Trigger:    Period end (automated, before F2)
Actor:      Fisc only

Inputs:
  - all business S-token balances

Process:
  for each business_wallet:
    business_wallet.V += business_wallet.S
    business_wallet.S = 0

Outputs:
  - V-token credit to all business wallets
  - S-tokens removed from circulation (not burned — converted)
  - BUSINESS_SWEEP_TOTAL recorded

Rules:
  - 100% sweep. No cap. No fee.
  - Applies to all registered business wallets.
  - Business S-tokens never burn — they always become permanent V.
  - Swept V-tokens are immediately available for external purchases (F6).
```

### F4 — Citizen S→V Conversion

```
Trigger:    Citizen request (anytime during period, before period end)
Actor:      Citizen (via wallet UI)

Inputs:
  - citizen_wallet
  - requested_amount (integer S-tokens)

Validation:
  - requested_amount <= wallet.S
  - cumulative_converted_this_period + requested_amount 
    <= UBI_AMOUNT * 0.20  (20% cap)

Process:
  wallet.V += requested_amount
  wallet.S -= requested_amount
  period_conversion_total[citizen] += requested_amount

Outputs:
  - V-token credit (permanent)
  - S-token debit (removed from circulation)

Rules:
  - Cap is 20% of UBI_AMOUNT per period (not 20% of current balance).
  - Cap resets each period.
  - Conversion is immediate and irreversible within the period.
  - Citizens should be prompted to convert before period end if 
    they have unconverted S-tokens they intend to save.
  - Wallet UI defaults to prompting conversion at period-end - 3 days.
```

### F5 — V→S at Point of Sale

```
Trigger:    Payment event where payer has insufficient S-tokens
Actor:      Fisc (automated at payment processing)

Inputs:
  - payer_wallet
  - merchant_wallet
  - amount_S (price in S-tokens)

Process:
  shortfall = amount_S - payer_wallet.S
  if shortfall > 0:
    if payer_wallet.V >= shortfall:
      payer_wallet.V -= shortfall
      payer_wallet.S += shortfall   // temporary: immediately used in payment
    else:
      REJECT payment (insufficient funds)
  
  payer_wallet.S -= amount_S
  merchant_wallet.S += amount_S

Outputs:
  - Merchant S-token credit
  - Payer S and/or V debit
  - Payment confirmation

Rules:
  - Transparent to both parties. Neither sees the V→S conversion explicitly.
  - Wallet UI defaults to S-token payment. V is drawn only if S insufficient.
  - Citizen can choose to pay from V explicitly (e.g. to preserve S for other use).
  - The V→S conversion in this function is not subject to the 20% cap (F4).
    F4 cap applies only to explicit savings conversions, not point-of-sale draws.
  - Payment rejection emits PAYMENT_FAILED to payer wallet.
```

### F6 — V→USDC (External Payment / Outbound Conversion)

```
Trigger:    Citizen or business external purchase request
Actor:      Citizen or business (via wallet UI)

Inputs:
  - payer_wallet
  - usdc_amount ($ value of external purchase)
  - external_payee_address (USDC wallet or fiat offramp)

Validation:
  - reserve.USDC >= usdc_amount + reserve_minimum_buffer
  - payer_wallet.V >= usdc_amount / fisc_rate
  - If citizen: monthly_external_limit not exceeded (governance parameter)

Process:
  v_cost = ceil(usdc_amount / fisc_rate)   // ceiling to avoid fractional tokens
  payer_wallet.V -= v_cost
  reserve.USDC -= usdc_amount
  transfer usdc_amount to external_payee_address
  OUTBOUND_CONVERSION event logged

Outputs:
  - USDC transferred to external payee
  - V-tokens debited from payer
  - Reserve reduced

Rules:
  - Rate applied is the published fisc_rate at time of request (not at time of quote).
  - Reserve must remain above minimum after transaction. If not: reject, emit RESERVE_ALERT.
  - Non-crypto external payees (e.g. Ohio supplier without USDC wallet): 
    Fisc holds a fiat offramp account. USDC converts to ACH/wire. 
    This is an operational dependency — requires bank account setup.
  - Citizens may have a monthly external purchase limit set by governance.
    Default: no limit. Post-collision reserve stress: limit may be imposed.
  - All outbound conversions logged with anonymised amounts in period report.
```

### F7 — USDC→V (Inbound Conversion)

```
Trigger:    New resident capital import, visitor purchase, 
            inter-colony settlement, external business LRT pre-conversion
Actor:      Fisc (automated on USDC receipt)

Inputs:
  - usdc_received ($ amount)
  - recipient_wallet (colony wallet address)
  - conversion_type: 'new_resident' | 'visitor' | 'intercolony' | 'voluntary'

Process:
  v_amount = floor(usdc_received * fisc_rate_inverse)
  // fisc_rate_inverse = 1 / fisc_rate (tokens per $)
  recipient_wallet.V += v_amount
  reserve.USDC += usdc_received
  INBOUND_CONVERSION event logged

Outputs:
  - V-tokens credited to recipient
  - USDC added to reserve

Rules:
  - Reserve always gains on inbound conversion. This is always healthy.
  - Visitor conversions: recipient_wallet is a temporary visitor wallet.
    Visitor S-tokens (purchased via this mechanism) expire at period end.
    Visitor cannot hold V-tokens. USDC stays in reserve regardless of spend.
  - New resident: their dollar savings become V-tokens at current rate.
    This is a significant reserve inflow event — log separately.
  - floor() prevents creation of fractional tokens.
    Residual USDC (< 1 token's worth) stays in reserve as rounding surplus.
```

### F8 — Collect LRT

```
Trigger:    Monthly (business self-report + on-chain verification)
Actor:      Business (payment), Fisc (receipt and verification)

Inputs:
  - business_id
  - reported_local_net_profit ($ USDC)
  - supporting_data (revenue, cost breakdown — for audit)
  - LRT_RATE (current governance parameter, % of local net profit)

Process:
  lrt_due = reported_local_net_profit * LRT_RATE
  reserve.USDC += lrt_due
  LRT_RECEIPT issued to business
  lrt_period_total += lrt_due
  LRT_COLLECTED event logged

Outputs:
  - USDC received into reserve
  - LRT receipt (business's proof of payment)
  - Reserve increased

Rules:
  - LRT is on LOCAL net profit only.
    Local net profit = revenue from colony residents and local businesses
    minus locally-attributable costs.
  - National chain with partial local operations: 
    local profit = total local revenue × (local operating margin).
    Local operating margin assessed annually by Fisc audit function.
  - LRT replaces: Ohio Commercial Activity Tax (0.26% gross receipts) 
    and municipal income tax (1.5% net profit) for locally-operating businesses.
    Net new burden = LRT - replaced taxes.
  - LRT_RATE is set to minimum sustaining reserve_target_ratio.
    If reserve is growing above target: LRT_RATE falls at next governance review.
    If reserve is below target for 60+ days: LRT_RATE rises (GOVERNANCE_REVIEW event).
  - Payment timing: business pays estimated LRT mid-month (day 15).
    True-up payment or refund at period end based on actual profit.
  - Non-payment: LATE_LRT_PAYMENT event after 7-day grace period.
    Continued non-payment: business loses S-token acceptance privileges.
```

### F9 — Set Exchange Rate

```
Trigger:    Daily (automated, 00:00 UTC)
Actor:      Fisc algorithm only — no human discretion

Inputs:
  - reserve.USDC                (current reserve balance)
  - total_V_outstanding         (all V-tokens in existence)
  - reserve_ratio_target        (governance parameter, default 4.0×)
  - reserve_minimum_ratio       (governance parameter, default 2.0×)
  - external_price_index        (% change in external dollar prices, rolling 30d)
  - abundance_index             (% change in local production costs, rolling 30d)
  - current fisc_rate

Algorithm:
  reserve_ratio = reserve.USDC / (total_V_outstanding * fisc_rate)

  net_pressure = external_price_index - abundance_index
  // positive = external inflation dominant (token should strengthen to defend bread price)
  // negative = abundance dominant (costs falling, token can weaken safely)

  if reserve_ratio >= reserve_ratio_target:
    policy_stance = 1.0      // fully defend bread price
  elif reserve_ratio >= reserve_minimum_ratio:
    policy_stance = (reserve_ratio - reserve_minimum_ratio) /
                    (reserve_ratio_target - reserve_minimum_ratio)
  else:
    policy_stance = 0.0      // reserve critical — stop defending
    emit RESERVE_ALERT

  rate_adjustment = net_pressure * policy_stance * RATE_SENSITIVITY
  // RATE_SENSITIVITY = 0.01 (governance parameter — how aggressively rate moves)

  new_rate = fisc_rate * (1 + rate_adjustment)
  new_rate = clamp(new_rate, MIN_RATE, MAX_RATE)
  // MIN_RATE = 0.10, MAX_RATE = 2.00 (governance parameters)

  if abs(new_rate - fisc_rate) / fisc_rate > 0.005:
    emit RATE_CHANGE(new_rate, rationale)

  fisc_rate = new_rate

Outputs:
  - Updated published fisc_rate
  - RATE_CHANGE event if move > 0.5%
  - RESERVE_ALERT if reserve below minimum

The bread basket anchor:
  The rate algorithm defends bread_price_S = BREAD_BASKET_TARGET (governance parameter).
  The Fisc does not target a USDC peg. The USDC rate is whatever it needs to be
  to keep the bread basket price stable in S-tokens.
  
  bread_price_S = bread_cost_USDC / fisc_rate
  To keep bread_price_S constant as bread_cost_USDC rises (external inflation):
    fisc_rate must rise proportionally.
  The rate algorithm achieves this via net_pressure and policy_stance.
```

### F10 — Inter-Colony Settlement

```
Trigger:    Payment received from another SPICE colony's Fisc
Actor:      Sending colony Fisc (initiates), receiving colony Fisc (processes)

Inputs:
  - sending_colony_fisc_address
  - usdc_amount
  - recipient_wallet (within receiving colony)
  - sending_colony_reserve_ratio (published on-chain by sending Fisc)

Validation:
  - sending_colony_reserve_ratio >= TRUST_MINIMUM (governance parameter, default 2.5×)
  - sending_colony_fisc_address in approved_colony_registry

Process:
  if validated:
    treat as F7 (USDC→V inbound conversion)
    recipient_wallet.V += floor(usdc_amount / fisc_rate)
    reserve.USDC += usdc_amount
    INTERCOLONY_SETTLEMENT event logged
  else:
    reject, emit INTERCOLONY_TRUST_FAILURE

Outputs:
  - V-tokens credited to recipient
  - USDC added to reserve
  - Settlement confirmation to sending colony

Rules:
  - Each Fisc publishes its reserve_ratio on-chain continuously.
  - If a connected colony's ratio falls below TRUST_MINIMUM:
    emit INTERCOLONY_TRUST_CHANGE — receiving colony suspends settlement until restored.
  - Inter-colony payments are the mechanism for professional services across colonies.
    Lawyer in Millbrook invoices client in Denver SPICE colony:
    Denver Fisc converts client's V-tokens → USDC → sends to Millbrook Fisc
    → Millbrook Fisc converts → credits lawyer's V-token wallet.
  - Lawyer quotes in S-tokens. Fisc translates. Neither party handles USDC.
```

### F11 — Period Report (publish)

```
Trigger:    Period end (after F2 burn)
Actor:      Fisc (automated)

Publishes to chain:
  - All state variables listed in Section 11
  - Period summary: issued, burned, swept, LRT collected, 
    boundary flows, rate history
  - Citizen count, merchant count, business count
  - Reserve position: opening, closing, net movement

This is the public record. Immutable once published.
```

---

## 5. Local Robot Tax (LRT)

### What It Is

The LRT is levied on **local net profit** — the profit earned by businesses operating in the parish from their local operations. It is the Fisc's primary USDC inflow and the mechanism by which automation value is redistributed to residents.

The name reflects its purpose: as businesses replace local workers with AI and robotics, their local profit margins expand. The LRT captures a share of that expanded margin and returns it to residents as UBI. The robots work for everyone.

### What It Replaces

LRT replaces existing local business taxes for participating businesses:

| Replaced | Rate | LRT equivalent |
|---|---|---|
| Ohio Commercial Activity Tax | 0.26% of gross receipts | Subsumed into LRT |
| Municipal income tax | 1.5% of net profit | Subsumed into LRT |

Net new burden on a business = `LRT_amount - previously_paid_local_taxes`

For most businesses in an 8,000-person Ohio town, existing local taxes are modest. The LRT may be higher in rate but replaces multiple fragmented taxes with one transparent one whose proceeds are visibly returned to residents.

### What It Is Levied On

```
LRT base = local net profit

local net profit = local_revenue - locally_attributable_costs

local_revenue:
  - Revenue from colony residents (in S-tokens or USDC)
  - Revenue from local businesses (B2B within colony)
  - NOT: revenue from external customers (those are external operations)

locally_attributable_costs:
  - Local labour (wages paid to colony residents in V-tokens)
  - Local supplier payments (S/V-token purchases from colony businesses)
  - MCC bill (S-tokens)
  - Portion of capital depreciation attributable to local operations
  - NOT: corporate overhead allocated from HQ
  - NOT: inter-company management fees (common manipulation — disallowed)
```

### LRT Rate Setting

```typescript
// Runs at governance review (triggered after 60 days of reserve trend negative,
// or quarterly as standard review)

function calculateLRTRate(fiscState: FiscState): number {
  const { reserve_USDC, reserve_target_ratio, total_V_outstanding, fisc_rate,
          monthly_usdc_outflow_avg, monthly_lrt_inflow_avg } = fiscState;

  const target_reserve = reserve_target_ratio * monthly_usdc_outflow_avg;
  const current_reserve = reserve_USDC;
  const monthly_gap = monthly_usdc_outflow_avg - monthly_lrt_inflow_avg;

  // LRT rate needed to close the gap
  const total_local_profit = getTotalLocalProfitEstimate();  // from business reports
  const required_lrt = Math.max(0, monthly_gap) / total_local_profit;

  // Apply bounds
  const new_rate = clamp(required_lrt, MIN_LRT_RATE, MAX_LRT_RATE);
  // MIN_LRT_RATE = 0.05 (5%) — floor prevents gaming
  // MAX_LRT_RATE = 0.60 (60%) — ceiling prevents confiscation

  return new_rate;
}
```

### LRT Collection Mechanics

**Day 15 of each month:** Businesses pay estimated LRT based on mid-month profit estimate.

**Period end:** True-up payment or refund based on actual profit.

**Verification:** Businesses submit profit reports on-chain. Fisc runs automated cross-checks against S-token revenue (which is fully visible on-chain). Discrepancies trigger audit flag.

**National chains:** Local profit assessed on local operating margin × local revenue. Annual audit establishes the margin. Cannot use corporate allocation to reduce local profit to zero (transfer pricing rules apply).

**New businesses:** 90-day LRT holiday on founding. Encourages new business creation.

**LRT receipt:** On-chain proof of payment. Required to maintain S-token acceptance privileges and colony trading status.

---

## 6. Exchange Rate Management

### The Rate

```
fisc_rate = $ USDC per S-token (or V-token — same rate)

Published: daily at 00:00 UTC
Mechanism: algorithmic (F9)
Human discretion: none at execution time
Governance role: set algorithm parameters only
```

### The Bread Basket Anchor

The Fisc does not target a USDC peg. It targets **bread basket price stability in S-tokens**.

```
BREAD_BASKET_TARGET = governance parameter (integer S-tokens)
Current default: the basket that costs BREAD_BASKET_TARGET S-tokens 
should cost the same next month.

Components of the bread basket (illustrative — exact items set by governance):
  1 standard loaf of bread
  1 litre of milk  
  10 kWh electricity (via MCC)
  1 local bus journey
  1 standard meal at a local restaurant

Basket price in S-tokens = sum of each item's S-token price
Fisc defends this sum staying constant.

If external inflation pushes basket costs up in USDC:
  → fisc_rate must rise (token strengthens against dollar)
  → same S-tokens buy same basket
  → residents experience zero internal inflation

If abundance (AI deflation) pushes basket costs down in USDC:
  → fisc_rate may fall (token weakens slightly)
  → same S-tokens buy more basket
  → residents experience real improvement in living standard
```

### Rate Algorithm (Full)

See F9 above. Key parameters (all governance-settable):

| Parameter | Default | Description |
|---|---|---|
| `reserve_ratio_target` | 4.0× | Full defence above this ratio |
| `reserve_minimum_ratio` | 2.0× | Alert + zero defence below this |
| `RATE_SENSITIVITY` | 0.01 | How aggressively rate moves per unit pressure |
| `MIN_RATE` | $0.10/S | Floor — prevents collapse |
| `MAX_RATE` | $2.00/S | Ceiling — prevents excessive appreciation |
| `max_daily_rate_change` | 2.0% | Single-day movement cap |

### Two-Tier Spread (Optional — Governance Decision)

The Fisc may implement a two-tier rate:

```
citizen_rate = fisc_rate                    // converting V→USDC for external purchase
visitor_rate = fisc_rate * (1 - spread)     // visitors buying S-tokens with USDC

spread = VISITOR_SPREAD (governance parameter, default 0.02 = 2%)
```

The spread means visitors pay slightly more per token than the published rate. The Fisc earns on both directions of boundary crossing. Default: no spread (single rate). Governance may enable spread as a reserve sustainability tool.

---

## 7. The USDC Reserve

### What It Is

The reserve is the pool of USDC held by the Fisc that backs all cross-boundary flows. It is the system's single point of external financial exposure.

### Reserve Composition

```
Primary reserve:  USDC (Circle) — operating reserve, day-to-day settlement
Strategic reserve: BTC — crisis buffer, held as % of primary reserve
                   Default: 0% (no BTC) until governance votes to add
```

### Reserve Flows

**Inflows (reserve grows):**
- LRT payments from businesses (monthly)
- Visitor S-token purchases (USDC in, S-tokens out)
- New resident capital conversions (bring dollar savings)
- Inter-colony inbound settlements
- Voluntary citizen USDC→V conversions

**Outflows (reserve shrinks):**
- Citizen external purchases (V→USDC, F6)
- Business external supply payments (V→USDC, F6)
- Inter-colony outbound settlements

### Reserve Ratio

```
reserve_ratio = reserve.USDC / (total_V_outstanding × fisc_rate)

Interpretation: months of V-token redemption the reserve could survive
if all V-tokens were redeemed simultaneously at current rate.
(In practice, simultaneous redemption cannot happen — see below.)

Policy levels:
  >= 4.0×  : Healthy. Full rate defence. LRT rate review for possible reduction.
  2.0–4.0× : Adequate. Partial defence. LRT rate stable.
  < 2.0×   : RESERVE_ALERT. Zero rate defence. LRT rate review for increase.
              External purchases may be rationed (governance decision).
  < 1.0×   : RESERVE_CRITICAL. External purchases suspended.
              Emergency governance convened within 48 hours.
```

### Why Simultaneous Redemption Cannot Happen

V-token redemption requires Fisc approval and is rate-limited by the monthly external purchase flow. Citizens do not have an unilateral right to demand immediate USDC — they request external purchases (F6), which the Fisc processes subject to reserve availability. This is not a fractional reserve — it is a managed redemption mechanism. The distinction matters.

### Reserve Transparency

The reserve balance is published on-chain continuously (not just at period end). Every citizen and every investor can see:

```
reserve.USDC          (live balance)
reserve_ratio         (live)
reserve_trend_30d     (growing / stable / declining)
monthly_inflow_avg    (trailing 3-month average)
monthly_outflow_avg   (trailing 3-month average)
projected_months_to_minimum  (at current trend)
```

---

## 8. Boundary Flows

The boundary is the line between the colony's S/V-token economy and the external USDC/dollar world. All boundary crossings route through the Fisc.

### Citizen Buying Externally

```
Scenario: Citizen wants to buy a $400 appliance from an external retailer.

1. Citizen opens wallet → External Purchase → enters $400 / retailer address
2. Fisc calculates V cost: ceil(400 / fisc_rate) tokens
3. Fisc checks: citizen V-balance sufficient + reserve has $400 + above minimum
4. Citizen confirms
5. Fisc debits V-tokens, sends USDC to retailer
6. Citizen receives delivery externally
7. F6 logged, reserve reduced, V reduced

If retailer has no USDC wallet:
  Fisc uses fiat offramp → ACH/wire transfer
  (Requires Fisc bank account — operational setup)
```

### Citizen Travelling Outside Colony

```
Scenario: Citizen going to Columbus for a weekend — needs spending money.

1. Citizen requests Travel Allowance: $200 USDC
2. Fisc converts: citizen's V-tokens debited, USDC loaded to 
   citizen's colony debit card (Fisc-issued, USDC-denominated)
   OR: USDC sent to citizen's external wallet
3. Citizen spends freely outside — Fisc does not track external spend
4. Unused USDC: citizen may convert back to V-tokens on return (F7)

Privacy: Fisc does not know what citizen spent externally.
         It only knows the USDC amount released.
```

### Visitor Buying Locally

```
Scenario: Visitor from Cleveland arrives at Millbrook farmers market.

Option A (pre-purchase):
  Visitor downloads colony wallet app (visitor mode)
  Purchases S-tokens via app: $50 USDC → floor(50 * fisc_rate_inverse) S-tokens
  Spends S-tokens at market stalls
  Unspent S-tokens expire at period end — USDC stays in reserve

Option B (at-till conversion, future feature):
  Merchant till accepts USDC (card/wallet)
  Fisc processes: USDC in → S-tokens to merchant → visitor's card charged
  Visitor never holds S-tokens — merchant receives S-tokens directly

Option A is the near-term implementation. Option B requires payment processor integration.
```

### Business Buying External Supplies

```
Scenario: Steve's Bakery needs to pay Miller's Grain Co $800 for flour.

1. Bakery submits external payment request: $800 to Miller's Grain
2. Fisc checks: bakery V-balance >= ceil(800 / fisc_rate)
3. Fisc debits bakery V-tokens
4. Fisc sends $800 USDC to Miller's Grain (or via fiat offramp)
5. Flour delivered, enters colony economy
6. Bakery prices bread in S-tokens to recover its V-token cost

Miller's Grain never touches S-tokens. Never knows about SPICE.
Everything external faces USDC. Everything internal faces S/V.
```

### Remote Professional Invoice

```
Scenario: Lawyer in Millbrook invoices remote client in Columbus (non-SPICE).

1. Lawyer quotes 500 S-tokens (= $X USDC at published rate)
2. Invoice shows: 500 S / $[500 × fisc_rate] USDC
3. Columbus client pays $[500 × fisc_rate] USDC to Millbrook Fisc address
4. Fisc receives USDC → credits lawyer 500 V-tokens (F7)
5. Lawyer's wallet: +500V. No USDC ever touches lawyer's wallet.

Remote SPICE colony client:
  Denver SPICE Fisc converts client's tokens → sends USDC to Millbrook Fisc
  Millbrook Fisc converts → credits lawyer V-tokens
  Lawyer receives identical V-tokens regardless of client location
```

---

## 9. The Citizen Wallet

### One Wallet, Three Balances

```
MILLBROOK COLONY WALLET
════════════════════════
[Resident Name]
[Colony] · [Period]

  2,340 S    spending   expires [last day of month]
 18,750 V    savings    permanent

──────────────────────
 21,090 T    total  ·  ≈ $[21090 × fisc_rate]
                        at today's rate $[fisc_rate]/T

FISC RATE   $[rate]/T   ↑/↓ [change]% today
RESERVE     $[balance]  ([ratio]× cover)  ● [status]
```

**No USDC balance is shown.** Citizens do not hold USDC. The dollar equivalent shown is derived from the live rate for reference only.

### Wallet Functions (Citizen-Facing)

```
PAY             → send S (or V if S insufficient) to merchant or citizen
REQUEST EXTERNAL → submit V→USDC request for external purchase (F6)
TRAVEL ALLOWANCE → request USDC travel budget (F6 variant)
CONVERT S→V     → explicitly save S-tokens as V before period end (F4)
VIEW HISTORY    → all transactions this period and historical
VIEW BILL       → upcoming MCC bill, breakdown by service
VIEW RATE       → current Fisc rate, 30-day chart, bread basket price
```

### Wallet Functions (Business-Facing)

```
RECEIVE PAYMENT → S/V-token inbound (shown as pending until confirmed)
PAY SUPPLIER    → external payment request (F6) or internal S/V transfer
PAY MCC BILL    → auto-deducted but viewable
VIEW SWEEP      → preview of end-of-period S→V sweep
FILE LRT        → submit monthly profit report and LRT payment (F8)
VIEW LRT RECEIPT → on-chain proof of LRT payment
```

---

## 10. Inter-Colony Settlement

### Colony Registry

```typescript
interface ColonyRegistry {
  colony_id:      string;        // unique identifier
  fisc_address:   string;        // on-chain address
  reserve_ratio:  number;        // published continuously
  currency:       string;        // 'S' (all SPICE colonies use same token name)
  status:         'active' | 'suspended' | 'pending';
  trust_since:    string;        // date added to registry
}
```

### Settlement Flow

```
Sending colony (Denver SPICE):
  1. Denver citizen pays lawyer in Millbrook
  2. Denver Fisc: debit Denver citizen V-tokens
  3. Denver Fisc: send USDC to Millbrook Fisc address
  4. Denver Fisc: emit INTERCOLONY_PAYMENT_SENT

Receiving colony (Millbrook SPICE):
  1. Millbrook Fisc receives USDC
  2. Verify Denver reserve_ratio >= TRUST_MINIMUM
  3. Credit Millbrook lawyer V-tokens (F7/F10)
  4. Emit INTERCOLONY_SETTLEMENT

Exchange rate: each colony applies its own fisc_rate.
  Denver converts citizen V → USDC at Denver rate
  Millbrook converts USDC → V at Millbrook rate
  No fixed inter-colony exchange rate required.
  USDC is the settlement layer between colonies.
```

---

## 11. Published Dashboard — All State Variables

The Fisc homepage displays these variables. All are on-chain. All update in real time or at period end as noted.

### Reserve

| Variable | Description | Update frequency |
|---|---|---|
| `reserve_USDC` | Current USDC balance | Real-time |
| `reserve_ratio` | USDC / (V_outstanding × rate) | Real-time |
| `reserve_trend_30d` | Growing / stable / declining | Daily |
| `reserve_minimum` | Policy minimum balance | On governance change |
| `projected_months_to_min` | At current trend | Daily |
| `reserve_composition` | USDC % / BTC % | Real-time |

### Rate

| Variable | Description | Update frequency |
|---|---|---|
| `fisc_rate` | Current $ per S/V token | Daily |
| `rate_change_today` | % change from yesterday | Daily |
| `rate_30d_chart` | 30-day rate history | Daily |
| `rate_policy_stance` | 0.0–1.0 (defence aggressiveness) | Daily |
| `bread_basket_price_S` | Current basket cost in S-tokens | Daily |
| `bread_basket_target_S` | Target basket cost in S-tokens | On governance change |
| `basket_drift_pct` | How far basket price is from target | Daily |

### Token Ledger (Period)

| Variable | Description | Update frequency |
|---|---|---|
| `S_issued_period` | S-tokens issued at period start | Period start |
| `S_in_circulation` | Current S-tokens outstanding | Real-time |
| `S_burned_last_period` | S-tokens burned at last period end | Period end |
| `S_swept_last_period` | S-tokens swept to V by businesses | Period end |
| `V_outstanding_total` | All V-tokens in existence | Real-time |
| `V_created_period` | New V-tokens this period | Real-time |
| `V_redeemed_period` | V-tokens converted to USDC this period | Real-time |
| `citizen_conversion_total` | S→V conversions by citizens this period | Real-time |

### LRT

| Variable | Description | Update frequency |
|---|---|---|
| `lrt_rate` | Current LRT % on local net profit | On governance change |
| `lrt_received_period` | USDC received in LRT this period | Real-time |
| `lrt_received_last_period` | Previous period total | Period end |
| `lrt_by_sector` | Breakdown by business sector | Period end |
| `lrt_rate_last_changed` | Date of last LRT rate change | On change |

### Boundary Flows

| Variable | Description | Update frequency |
|---|---|---|
| `boundary_inflow_period` | USDC received across boundary | Real-time |
| `boundary_outflow_period` | USDC paid across boundary | Real-time |
| `net_boundary_period` | Inflow − outflow | Real-time |
| `visitor_purchases_period` | USDC received from visitors | Real-time |
| `intercolony_inflow_period` | USDC from other colonies | Real-time |
| `intercolony_outflow_period` | USDC to other colonies | Real-time |

### Economy

| Variable | Description | Update frequency |
|---|---|---|
| `merchant_count` | Active merchants accepting S/V | Daily |
| `token_velocity` | Transactions / S_issued (how many times each token changed hands) | Period end |
| `citizen_count` | Registered residents | Daily |
| `business_count` | Registered businesses | Daily |
| `avg_citizen_S_balance_midperiod` | Economic health indicator | Weekly |
| `burn_rate_pct` | S_burned / S_issued — low = healthy spending | Period end |

---

## 12. Participant Types and Fisc Interactions

### Standard Bot Interface

```typescript
interface SpiceBot {
  id:     string;
  type:   ParticipantType;
  wallet: { S: number; V: number; };

  onPeriodStart(fiscState: FiscState): void;
  onPaymentReceived(amount: number, currency: 'S'|'V', from: string): void;
  onPeriodEnd(fiscState: FiscState): Transaction[];
  tick(fiscState: FiscState, priceIndex: PriceIndex): Transaction[];
}

type ParticipantType = 
  'citizen_basic' | 'citizen_professional' | 
  'local_business' | 'external_business' | 
  'visitor' | 'fisc';

interface FiscState {
  fisc_rate:          number;
  reserve_USDC:       number;
  reserve_ratio:      number;
  lrt_rate:           number;
  period:             number;
  S_issued_total:     number;
  V_outstanding:      number;
  UBI_AMOUNT:         number;
}

interface Transaction {
  type: 'TRANSFER_S' | 'TRANSFER_V' | 'REQUEST_V_TO_USDC' | 
        'REQUEST_USDC_TO_V' | 'PAY_LRT' | 'CONVERT_S_TO_V';
  amount:   number;
  to?:      string;
  memo?:    string;
}
```

### Participant: Basic Citizen

```
Wallet:       S (UBI only), V (savings)
Receives:     UBI S-tokens (F1), MCC services
Pays:         MCC bill (F1b auto), local merchants (S/V)
Fisc uses:    F5 (V→S at till if needed), F4 (save S→V), F6 (external purchase)
Period end:   MCC deducted, optional S→V, remaining S burned
Invariants:   Cannot create tokens. S >= 0, V >= 0 at all times.
```

### Participant: Professional Citizen

```
Wallet:       S (UBI only), V (UBI savings + professional earnings)
Receives:     UBI S-tokens, V-tokens from client invoices, 
              V-tokens via Fisc from remote client USDC payments
Pays:         MCC bill, local spending (S/V), LRT on professional V earnings
Fisc uses:    F4 (save), F6 (external), F7 (remote client USDC→V)
Quotes:       Always in S-tokens. Fisc publishes USDC equivalent.
Invariant:    All professional income — local and remote — arrives as V-tokens.
              No separate USDC wallet. No dollar income stream visible in wallet.
```

### Participant: Local Business

```
Wallet:       S (current period receipts), V (capital + swept earnings)
Receives:     S-tokens from citizen purchases, V from B2B sales
Pays:         Local suppliers (S/V), MCC bill, external suppliers via Fisc (V→USDC), LRT
Fisc uses:    F3 (end-of-period sweep), F6 (external payments), F8 (LRT)
Period end:   S swept 100% to V, LRT calculated and paid
Invariant:    S receipts always become V — never expire.
```

### Participant: External Business (National Chain)

```
Wallet:       Local S-balance (if accepting S payments), USDC external
Receives:     USDC from external operations, optional S from local sales
Pays:         LRT on local net profit (USDC → Fisc F8), MCC business bill
Fisc uses:    F8 (LRT collection), optionally F7 (convert S receipts → USDC)
Invariant:    LRT is mandatory for all businesses operating in parish.
              Cannot opt out while operating locally.
```

### Participant: Visitor

```
Wallet:       S (purchased for visit) — temporary, no V
Receives:     S-tokens purchased with USDC (F7 variant)
Pays:         Local merchants in S-tokens
Fisc uses:    F7 (USDC→S purchase on arrival)
Period end:   Unspent S expires — USDC stays in reserve (Fisc earns)
Invariant:    Visitors cannot hold V-tokens.
              Visitor S purchase = pure reserve inflow regardless of spend.
```

### Participant: The Fisc

```
Wallet:       reserve.USDC, internal accounting ledgers
Receives:     LRT (F8), inbound conversions (F7), visitor purchases
Pays:         UBI issuance (F1 — S-tokens created), outbound conversions (F6)
Executes:     F1–F11 (all functions)
Publishes:    All state variables (Section 11), period reports
Invariants:   
  - reserve_USDC >= reserve_minimum at all times
  - LRT_rate = minimum sustaining reserve_target
  - fisc_rate set algorithmically — no discretion
  - All state on-chain — no hidden accounts
  - Cannot issue V-tokens except via authorised conversion
```

---

## 13. Governance Events (On-Chain)

All events are immutable once emitted. Citizens and investors can subscribe.

```
// Token events
S_ISSUED              { period, total_S, resident_count }
S_BURNED              { period, total_burned, pct_of_issued }
BUSINESS_SWEEP        { period, total_swept, business_count }
PERIOD_REPORT         { period, full_state_snapshot }

// Rate events  
RATE_CHANGE           { old_rate, new_rate, pct_change, rationale, reserve_ratio }
RESERVE_ALERT         { reserve_USDC, reserve_ratio, threshold }
RESERVE_CRITICAL      { reserve_USDC, reserve_ratio }
RESERVE_RESTORED      { reserve_ratio }

// LRT events
LRT_COLLECTED         { business_id, amount_USDC, period }
LRT_RATE_CHANGE       { old_rate, new_rate, effective_from, rationale }
LATE_LRT_PAYMENT      { business_id, days_overdue }
LRT_AUDIT_FLAG        { business_id, discrepancy_description }

// Boundary events
INBOUND_CONVERSION    { type, usdc_amount, V_issued, recipient_type }
OUTBOUND_CONVERSION   { usdc_amount, V_debited }  // anonymised
VISITOR_PURCHASE      { usdc_amount, S_issued }

// Budget events (see Budget Spec)
BUDGET_PUBLISHED      { version, totalS, changeFromPrior, publishedBy }
BUDGET_VOTE_REQUIRED  { version, changePct, voteDeadline }
BUDGET_VOTE_PASSED    { version, effectiveFrom }
BUDGET_VOTE_FAILED    { version }

// Inter-colony events
INTERCOLONY_SETTLEMENT      { colony_id, usdc_amount, V_issued }
INTERCOLONY_TRUST_CHANGE    { colony_id, old_ratio, new_ratio, action }
INTERCOLONY_TRUST_FAILURE   { colony_id, reason }

// Governance events
GOVERNANCE_REVIEW_TRIGGERED { reason, parameter, current_value }
PARAMETER_CHANGED           { parameter, old_value, new_value, effective_from }
```

---

## 14. Smart Contract Interface

```solidity
// IFisc.sol — Interface for Claude Code implementation

interface IFisc {
    // ── State getters ──────────────────────────────────────────────────
    function fiscRate() external view returns (uint256);           // scaled 1e18
    function reserveUSDC() external view returns (uint256);
    function reserveRatio() external view returns (uint256);       // scaled 1e4
    function totalVOutstanding() external view returns (uint256);
    function totalSIssued() external view returns (uint256);       // this period
    function lrtRate() external view returns (uint256);            // scaled 1e4
    function currentPeriod() external view returns (uint256);
    function mccCEOAddress() external view returns (address);

    // ── F1: Issue S-tokens (period start) ─────────────────────────────
    function issuePeriod() external;  // callable by automation only

    // ── F2: Burn (period end) ──────────────────────────────────────────
    function burnPeriod() external;

    // ── F3: Business sweep ────────────────────────────────────────────
    function sweepBusinessS(address business) external;

    // ── F4: Citizen S→V ───────────────────────────────────────────────
    function convertStoV(uint256 amount) external;

    // ── F6: V→USDC outbound ───────────────────────────────────────────
    function requestExternalPayment(
        uint256 usdcAmount, 
        address payee
    ) external;

    // ── F7: USDC→V inbound ────────────────────────────────────────────
    function receiveUSDC(
        address recipient,
        string calldata conversionType
    ) external payable;

    // ── F8: LRT payment ───────────────────────────────────────────────
    function payLRT(
        uint256 localNetProfit,
        bytes calldata profitReport
    ) external payable;

    // ── F9: Rate update (automated) ───────────────────────────────────
    function updateRate() external;  // callable by Chainlink automation

    // ── Budget (see Budget Spec) ───────────────────────────────────────
    function publishBudget(bytes calldata budgetData) external;  // CEO only
    function getPublishedBudget() external view returns (bytes memory);
    function getDraftBudget() external view returns (bytes memory);  // CEO only

    // ── Wallet queries ────────────────────────────────────────────────
    function sBalance(address wallet) external view returns (uint256);
    function vBalance(address wallet) external view returns (uint256);

    // ── Events ────────────────────────────────────────────────────────
    event RateChange(uint256 oldRate, uint256 newRate, uint256 reserveRatio);
    event ReserveAlert(uint256 reserveUSDC, uint256 reserveRatio);
    event LRTCollected(address indexed business, uint256 amount);
    event PeriodReport(uint256 period, bytes reportData);
    event InboundConversion(address indexed recipient, uint256 usdc, uint256 vTokens);
    event OutboundConversion(uint256 usdc, uint256 vTokens);
}
```

---

## 15. Database Schema

```sql
-- SQLite (consistent with existing simulate.py pattern)

CREATE TABLE residents (
  id              TEXT PRIMARY KEY,
  wallet_address  TEXT UNIQUE NOT NULL,
  name            TEXT,
  housing_status  TEXT DEFAULT 'external', -- 'colony' | 'external'
  registered_at   TEXT,
  active          INTEGER DEFAULT 1
);

CREATE TABLE businesses (
  id              TEXT PRIMARY KEY,
  wallet_address  TEXT UNIQUE NOT NULL,
  name            TEXT,
  type            TEXT,  -- 'local' | 'external_chain'
  sector          TEXT,
  registered_at   TEXT,
  lrt_holiday_ends TEXT,  -- 90-day new business holiday
  active          INTEGER DEFAULT 1
);

CREATE TABLE wallets (
  address         TEXT PRIMARY KEY,
  owner_id        TEXT NOT NULL,
  owner_type      TEXT NOT NULL,  -- 'resident' | 'business' | 'fisc' | 'mcc'
  S_balance       INTEGER DEFAULT 0,  -- integer only
  V_balance       INTEGER DEFAULT 0,
  updated_at      TEXT
);

CREATE TABLE transactions (
  id              TEXT PRIMARY KEY,
  period          INTEGER,
  timestamp       TEXT,
  type            TEXT,  -- TRANSFER_S | TRANSFER_V | CONVERT_S_TO_V | etc.
  from_wallet     TEXT,
  to_wallet       TEXT,
  amount          INTEGER,
  currency        TEXT,  -- 'S' | 'V' | 'USDC'
  memo            TEXT,
  tx_hash         TEXT   -- on-chain tx if applicable
);

CREATE TABLE period_state (
  period          INTEGER PRIMARY KEY,
  start_date      TEXT,
  end_date        TEXT,
  fisc_rate_open  REAL,
  fisc_rate_close REAL,
  reserve_open    REAL,
  reserve_close   REAL,
  S_issued        INTEGER,
  S_burned        INTEGER,
  S_swept         INTEGER,
  V_created       INTEGER,
  V_redeemed      INTEGER,
  lrt_collected   REAL,
  boundary_in     REAL,
  boundary_out    REAL,
  citizen_count   INTEGER,
  merchant_count  INTEGER,
  token_velocity  REAL,
  published_at    TEXT
);

CREATE TABLE lrt_payments (
  id              TEXT PRIMARY KEY,
  business_id     TEXT,
  period          INTEGER,
  reported_profit REAL,
  lrt_rate        REAL,
  lrt_paid_USDC   REAL,
  paid_at         TEXT,
  tx_hash         TEXT,
  audit_flag      INTEGER DEFAULT 0
);

CREATE TABLE rate_history (
  id              TEXT PRIMARY KEY,
  timestamp       TEXT,
  rate            REAL,
  reserve_ratio   REAL,
  policy_stance   REAL,
  net_pressure    REAL,
  rationale       TEXT
);

CREATE TABLE governance_events (
  id              TEXT PRIMARY KEY,
  timestamp       TEXT,
  event_type      TEXT,
  payload         TEXT,  -- JSON
  tx_hash         TEXT
);

CREATE TABLE budget_versions (
  version         INTEGER PRIMARY KEY,
  published_at    TEXT,
  published_by    TEXT,
  effective_from  TEXT,
  total_S         INTEGER,
  bread_price_S   INTEGER,
  spice_discount  REAL,
  lines           TEXT,  -- JSON array of BudgetLine
  change_from_prior REAL
);

CREATE TABLE intercolony_registry (
  colony_id       TEXT PRIMARY KEY,
  fisc_address    TEXT,
  reserve_ratio   REAL,
  status          TEXT,
  trust_since     TEXT,
  last_settlement TEXT
);
```

---

## 16. File Structure

```
src/
  pages/
    FiscDashboard.tsx          // main Fisc homepage — all published state
    Budget.tsx                 // standard citizen budget page (see Budget Spec)
    Wallet.tsx                 // citizen/business wallet view
    RateHistory.tsx            // exchange rate chart and history
    LRTPortal.tsx              // business LRT filing and receipts
    ReserveStatus.tsx          // reserve detail page
    ColonyRegistry.tsx         // inter-colony trust and settlement
    GovernanceEvents.tsx       // on-chain event log

  components/
    // Dashboard
    ReservePanel.tsx           // live reserve balance and ratio
    RatePanel.tsx              // current rate, trend, bread basket
    TokenLedger.tsx            // S/V issuance, burn, sweep stats
    BoundaryFlows.tsx          // inflow/outflow summary
    LRTSummary.tsx             // LRT received, by sector
    EconomyStats.tsx           // velocity, merchant count, etc.
    
    // Budget (full spec in Budget Spec)
    BudgetTable.tsx
    BudgetEditor.tsx
    ThreeNumberPanel.tsx
    SplitBar.tsx
    ConsistencyPanel.tsx
    SpikeWarning.tsx
    PublishModal.tsx
    AuditTrail.tsx
    PersonalBillPanel.tsx

    // Wallet
    WalletBalance.tsx          // S / V / total display
    PaymentFlow.tsx            // send payment UI
    ExternalPurchase.tsx       // V→USDC request
    ConvertStoV.tsx            // savings conversion
    TransactionHistory.tsx

    // Rate
    RateChart.tsx              // 30-day rate history
    BreadBasketTracker.tsx     // basket price vs target
    RateAlgorithmStatus.tsx    // policy stance, pressure indicators

    // LRT
    LRTFilingForm.tsx          // business profit report + payment
    LRTReceipt.tsx             // on-chain proof of payment
    LRTLeaderboard.tsx         // sector contributions (public)

  hooks/
    useFiscState.ts            // live Fisc state from chain
    useBudget.ts               // published budget + derived calcs
    useWallet.ts               // wallet balances and transactions
    useRate.ts                 // rate history and algorithm state
    useLRT.ts                  // LRT filing and receipt
    useRole.ts                 // wallet auth + role resolution
    usePeriod.ts               // current period, countdown to end
    useGovernanceEvents.ts     // on-chain event stream

  simulation/
    FiscEngine.ts              // implements F1–F11
    WalletStore.ts             // SQLite-backed wallet state
    BasicCitizenBot.ts
    ProfessionalCitizenBot.ts
    LocalBusinessBot.ts
    ExternalBusinessBot.ts
    VisitorBot.ts
    SimulationRunner.ts        // orchestrates period ticks
    PriceIndex.ts              // external price + abundance tracking

  constants/
    fiscParams.ts              // governance parameters (all defaults)
    budgetDefaults.ts          // founding budget line items
    sectorData.ts              // Ohio business sector composition

  contracts/
    IFisc.sol                  // interface (see Section 14)
    Fisc.sol                   // implementation
    FiscToken.sol              // ERC-20 for S and V (same contract, two modes)
```

---

## 17. Key Invariants to Test

**Token conservation (critical)**
```
After every period:
  S_issued === S_burned + S_swept_to_V + S_transferred_to_MCC + S_in_circulation
  
Any deviation is a bug. Token conservation must hold exactly.
All values are integers. No rounding at any step.
```

**Reserve integrity**
```
reserve.USDC must equal:
  sum(all_inbound_USDC) - sum(all_outbound_USDC) since genesis

Verified against on-chain balance after every transaction.
```

**Rate algorithm determinism**
```
Given identical inputs (reserve_ratio, external_price_index, abundance_index, current_rate):
  algorithm always produces identical output rate.
No randomness. No timestamp dependency beyond the daily trigger.
```

**Three-number consistency (budget)**
```
impliedFiscRate === spiceBreadUSD / breadPriceS
ubiUSD === totalUBI * impliedFiscRate
totalUBI === sum(all active budget line sTokenAmounts)
All recomputed on every change. Never cached independently.
```

**Citizen 20% cap**
```
At no point in a period may a citizen's cumulative S→V conversion
exceed UBI_AMOUNT * 0.20.
The cap resets at period start.
Business sweep (F3) is not subject to this cap.
```

**Colony housing adjustment**
```
A resident with housing_status === 'external' must have 
their personal MCC bill exclude the housing line sTokenAmount,
even if the published budget housing line is active and > 0.
```

**Draft isolation**
```
getDraftBudget() must return null for any caller whose wallet
is not mccCEOAddress. No other access path to draft state exists.
```

**Visitor V-token prohibition**
```
Visitor wallets may hold S-tokens only.
Any attempt to credit V-tokens to a visitor wallet must be rejected.
```

**LRT floor**
```
lrt_rate must never fall below MIN_LRT_RATE (5%) regardless of 
reserve health. Prevents gaming where businesses lobby to zero the rate.
```

---

## 18. Build Order

Recommended sequence for Claude Code:

```
Phase 1 — Foundation
  1.  WalletStore.ts           SQLite-backed wallet state
  2.  FiscEngine.ts (F1, F2)   Issue and burn only
  3.  BasicCitizenBot.ts       Validates core S-token flows
  4.  SimulationRunner.ts      Single-period tick
  5.  Token conservation test  Must pass before proceeding

Phase 2 — Business layer
  6.  FiscEngine.ts (F3, F8)   Business sweep and LRT
  7.  LocalBusinessBot.ts      S-sweep + LRT logic
  8.  ExternalBusinessBot.ts   National chain LRT calculation
  9.  LRT collection test      Reserve grows on LRT payment

Phase 3 — Boundary
  10. FiscEngine.ts (F6, F7)   Outbound and inbound conversions
  11. ProfessionalCitizenBot.ts Remote client income routing
  12. VisitorBot.ts            USDC→S purchase, expiry
  13. Boundary flow test       Reserve in/out balances

Phase 4 — Rate and reserve
  14. FiscEngine.ts (F9)       Rate algorithm
  15. PriceIndex.ts            External price + abundance inputs
  16. RateChart.tsx            Rate history display
  17. BreadBasketTracker.tsx   Basket price vs target
  18. Rate algorithm test      Determinism + bread price stability

Phase 5 — Frontend
  19. FiscDashboard.tsx        All published state variables
  20. Wallet.tsx               Citizen/business wallet
  21. Budget.tsx               Standard citizen budget (see Budget Spec)
  22. LRTPortal.tsx            Business LRT filing

Phase 6 — Inter-colony
  23. ColonyRegistry.tsx       Trust registry
  24. FiscEngine.ts (F10)      Inter-colony settlement
  25. Settlement test          Cross-colony V-token payment

Phase 7 — Hardening
  26. All invariant tests      Full suite
  27. IFisc.sol                Smart contract interface
  28. Fisc.sol                 Contract implementation
  29. Testnet deployment       Base Sepolia
```

---

*SPICE Protocol — Complete Fisc Specification v1.0*
*Millbrook, Ohio · Claude Code handoff · See also: SPICE_Fisc_Budget_Spec_v1.md*
