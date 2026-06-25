# SPICE Per-Transaction Levy Mechanism — Build Specification

**For the MaryFontaine simulator extension**
**Version 1, May 2026**

This document specifies the per-transaction levy system that funds UBI from automation gains. Designed to drop into the existing MaryFontaine simulator as the next iteration after the structural-findings work.

The mechanism is the colony's revenue source in lieu of taxation. Every monetary transaction is split three ways at settlement: gas to the underlying chain, protocol fee to the SPICE founders, and automation levy to the Fisc reserve which funds UBI. All three are computed in the smart contract layer, applied atomically, and invisible in the user experience.

---

## 1. The Three-Layer Levy

Every transaction routed through the Fisc — internal commerce, external trade, dividend payments, MCC bills — has three deductions before settlement:

### Layer 1: Base gas levy

Standard L2 transaction cost (Base or equivalent). Paid to the chain validator/sequencer. Roughly fixed per-transaction in dollar terms (typically $0.001-0.01 per transaction on Base). Not specific to SPICE; it's the cost of executing on the underlying blockchain.

### Layer 2: Protocol levy

Goes to the SPICE protocol founders (Steve and Anthropic, or whoever holds protocol equity). This funds protocol development, governance, and founder economics. Typical rate: 0.05-0.10% of transaction value. Small, but accrues at network scale across many colonies.

### Layer 3: Automation levy (the colony levy)

Goes to the colony Fisc reserve, used to fund UBI. The rate depends on the supplier's profit-per-employee — high-automation firms pay more. This is the mechanism that funds the colony's redistributive function.

### The order of application

```
For a transaction of gross value V from buyer to supplier S:
    gas = fixed_chain_fee
    protocol_levy = V × protocol_rate
    automation_levy = V × k × f(P_S)
    
    supplier_net = V - gas - protocol_levy - automation_levy
    
    Route gas to chain
    Route protocol_levy to protocol_treasury
    Route automation_levy to Fisc reserve
    Route supplier_net to supplier
```

All four routings happen atomically in a single transaction. The buyer sends V; the supplier receives supplier_net; the three levies arrive at their destinations.

---

## 2. The Automation Levy Formula

The mechanism that distinguishes SPICE from a flat-rate transaction tax.

### Core formula

```
automation_levy = V × k × max(0, (P_firm − P_threshold) / P_baseline) ^ α
```

Where:
- `V` = transaction value
- `P_firm` = supplier's most recent annual profit-per-employee (USD)
- `P_threshold` = colony policy parameter, default $80,000
- `P_baseline` = colony policy parameter, default $100,000
- `α` = colony policy parameter, default 1.5
- `k` = budget-balancing parameter, recalculated annually

### How it works

A firm with profit-per-employee at or below `P_threshold` pays zero automation levy. A labour-intensive furniture maker at $50K profit-per-employee falls here.

A firm above the threshold pays a levy that scales with how far above the threshold it sits, raised to the power α. A firm at $200K profit-per-employee pays at a moderate rate. A firm at $1M profit-per-employee pays at a much higher rate (the α exponent makes the curve progressive).

The colony's governance sets P_threshold, P_baseline, and α as policy parameters. These rarely change — they're constitutional-level decisions about how aggressively to capture automation gains.

The k parameter is recalculated annually by the protocol to balance the colony's budget:

```
k = (annual_UBI_obligation) / (sum across all expected transactions of V × f(P_firm))
```

If projected levy revenue exceeds UBI need, k drops. If projected revenue falls short, k rises. The recalibration happens once per year based on the prior year's transaction data.

### Default parameters

| Parameter | Default | Notes |
|---|---|---|
| `P_threshold` | $80,000 | Firms below this pay nothing |
| `P_baseline` | $100,000 | Normalisation reference |
| `α` | 1.5 | Mild progressivity |
| `k` | computed | Set annually to balance UBI obligation |

### Annual P_firm update

Every business has a stored `profit_per_employee` value. Updated once per year from filed accounts. Between updates, the rate for that firm is locked. New businesses without prior accounts use the sector average until they have one year of operations.

---

## 3. Transaction Types Affected

The three-layer levy applies to:

| Transaction type | Levies apply | Notes |
|---|---|---|
| `internal_purchase` | Yes | Citizen buys from colony business |
| `internal_b2b` | Yes | Colony business buys from colony business |
| `export` | Yes | Colony business sells externally |
| `import` | Yes | Colony business buys from external supplier |
| `external_income` | No | Citizen's external wages — the citizen isn't a business |
| `mortgage_payment` | No | Settling an existing obligation |
| `external_rent` | No | Same |
| `cashout` | No | Citizen converting to USDC |
| `inflow_from_savings` | No | Citizen converting external savings to S |
| `dividend_perm` | No | Internal capital return, not a commercial transaction |
| `dividend_timed` | No | Same |
| `external_dividend` | No | External shareholder cashing out — already counts as their company's profit being extracted, levy was applied when revenue earned |
| `mcc_bill` | Yes | MCC is a business with profit-per-employee |
| `ubi_mint` | No | Pure mint; no buyer or seller |

The principle: levies apply to commercial transactions where one party is a business earning revenue. They don't apply to citizen-side movements (UBI, mortgage payments, cashouts) or to capital flows (dividends).

---

## 4. Schema Changes

Extensions to existing tables; minimal schema disruption.

### Add to `companies` table

```sql
ALTER TABLE companies ADD COLUMN profit_per_employee REAL DEFAULT 100000;
ALTER TABLE companies ADD COLUMN profit_per_employee_year INTEGER;
ALTER TABLE companies ADD COLUMN annual_profit REAL DEFAULT 0;
ALTER TABLE companies ADD COLUMN employee_count INTEGER DEFAULT 1;
```

The `profit_per_employee_year` records when the value was last updated. If it's older than the current year, the value is recalculated from `annual_profit / employee_count`.

### Add new table for external suppliers

External businesses trading with the colony aren't in the `companies` table (which is for colony entities). They need their own table:

```sql
CREATE TABLE external_suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    sector TEXT,
    profit_per_employee REAL,
    annual_revenue REAL,
    employee_count INTEGER,
    annual_profit REAL,
    last_updated_year INTEGER
);
```

Populated from realistic data on companies that trade with a 39,000-person Ohio town. Initial seed data should cover ~200 representative external suppliers across major sectors.

### Extend `transactions` table

```sql
ALTER TABLE transactions ADD COLUMN gross_value REAL;
ALTER TABLE transactions ADD COLUMN gas_levy REAL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN protocol_levy REAL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN automation_levy REAL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN net_value REAL;
```

For each transaction, record gross, all three levy amounts, and net. Allows reconstructing the levy revenue stream after the fact.

### New tables for levy tracking

```sql
CREATE TABLE protocol_treasury (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    month INTEGER,
    monthly_revenue_usdc REAL,
    cumulative_revenue_usdc REAL
);

CREATE TABLE levy_calibration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    p_threshold REAL,
    p_baseline REAL,
    alpha REAL,
    k REAL,
    projected_annual_levy_revenue REAL,
    projected_annual_ubi_obligation REAL
);
```

The levy_calibration table records the parameters used for each year, supporting analysis of how the mechanism evolved.

---

## 5. Transaction Tick Modifications

The core change is in the transaction settlement function. Pseudocode:

```python
def settle_transaction(buyer, supplier, gross_value, transaction_type):
    """
    Settle a transaction with the three-layer levy applied.
    Returns the recorded transaction record.
    """
    
    # Layer 1: Gas levy
    gas_levy = CHAIN_GAS_FEE_USD  # constant, ~$0.005 per transaction
    
    # Layer 2: Protocol levy
    protocol_rate = colony_config['protocol_rate']  # default 0.001 (0.1%)
    protocol_levy = gross_value * protocol_rate
    
    # Layer 3: Automation levy
    if transaction_type in LEVIED_TYPES:
        p_firm = supplier.profit_per_employee
        f_p = max(0, (p_firm - colony_config['p_threshold']) 
                     / colony_config['p_baseline']) ** colony_config['alpha']
        automation_levy = gross_value * colony_config['k'] * f_p
    else:
        automation_levy = 0
    
    # Net to supplier
    net_value = gross_value - gas_levy - protocol_levy - automation_levy
    
    # Atomic settlement
    chain_treasury.s_balance += gas_levy
    protocol_treasury.s_balance += protocol_levy
    fisc.usdc_reserve += automation_levy_in_usdc(automation_levy)
    supplier.s_balance += net_value
    buyer.s_balance -= gross_value
    
    # Record transaction
    record_transaction(
        buyer, supplier, gross_value,
        gas_levy, protocol_levy, automation_levy,
        net_value, transaction_type
    )
```

The implementation should preserve atomicity: either all four routings happen, or none do. This matches how on-chain settlement actually works.

### Currency conversion

The automation levy goes to the Fisc reserve, which is in USDC. If the transaction is in S, the levy must be converted at the current Fisc rate. The cleanest approach is to compute the levy in S, deduct it from the supplier's S settlement, and have the Fisc immediately convert that S to USDC at the current rate. The Fisc rate's behaviour is unaffected.

### Annual recalibration

Once per simulation year (Month 12 of each year):

```python
def recalibrate_k(colony_state):
    # Sum f(P_firm) × annual transaction volume across all expected transactions
    total_weighted_volume = 0
    for firm in all_businesses:
        f_p = max(0, (firm.profit_per_employee - p_threshold) 
                     / p_baseline) ** alpha
        annual_volume = firm.annual_transaction_volume_estimate
        total_weighted_volume += annual_volume * f_p
    
    annual_ubi_obligation = colony_state.population * UBI_PER_CAPITA * 12 * fisc_rate
    
    new_k = annual_ubi_obligation / total_weighted_volume
    colony_config['k'] = new_k
    
    record_calibration(year, p_threshold, p_baseline, alpha, new_k, ...)
```

The new k applies for the next year's transactions. Drift between projection and reality is absorbed by the Fisc reserve buffer.

---

## 6. External Supplier Data

The simulator needs realistic profit-per-employee data for external businesses trading with MaryFontaine. This is the seed data that drives the levy mechanism.

### Categories and indicative values

| Sector | Example firms | Typical profit/employee |
|---|---|---|
| AI software & services | Specialised AI firms, automated SaaS | $400K - $2M |
| Big tech | Apple, Microsoft, Google | $300K - $700K |
| Pharmaceutical | Pfizer, Merck | $200K - $500K |
| Financial services | JPMorgan, Goldman Sachs | $150K - $400K |
| Automated manufacturing | Tesla, Foxconn | $80K - $200K |
| Traditional manufacturing | Ford, Caterpillar | $60K - $120K |
| Big retail | Walmart, Costco, Target | $20K - $50K |
| Restaurants chains | McDonald's, Chipotle | $15K - $40K |
| Healthcare providers | Hospitals, clinics | $50K - $120K |
| Construction | National builders | $40K - $80K |
| Hospitality | Hotels, restaurants | $20K - $40K |
| Logistics | UPS, FedEx | $50K - $90K |
| Utilities | National utilities | $200K - $500K |
| Media | Netflix, Disney | $300K - $600K |
| Auto manufacturers | GM, Ford, Toyota | $80K - $150K |

These are 2024 ballpark figures. The simulator should use specific values from publicly available financial data for the modelled suppliers.

### MaryFontaine's actual external suppliers

A 39,000-person Ohio town has commerce with maybe 200-500 external businesses that capture meaningful market share. The simulator should model a representative sample — perhaps 100 external suppliers covering the major spending categories of the colony's basket.

Specific seed data needs research. The build agent should generate a list of ~100 realistic external suppliers with:
- Name (real or stylised)
- Sector
- Annual profit-per-employee
- Estimated annual revenue from MaryFontaine commerce
- Estimated annual import volume from external trade

---

## 7. Configuration Parameters

New colony-level configuration:

```python
DEFAULT_LEVY_CONFIG = {
    # Layer 1: Gas
    'chain_gas_fee_usd': 0.005,  # ~$0.005 per transaction on Base
    
    # Layer 2: Protocol
    'protocol_rate': 0.001,  # 0.1% — for SPICE founders
    
    # Layer 3: Automation
    'p_threshold': 80000,
    'p_baseline': 100000,
    'alpha': 1.5,
    'k': 0.05,  # initial guess; recalibrated annually
    
    # Recalibration
    'recalibration_month': 12,  # December of each year
    'min_k': 0.001,  # safety floors
    'max_k': 0.50,
}
```

Adjustable per-colony at founding. Some parameters might be subject to constitutional protection (preventing trivial governance change of α, for instance).

---

## 8. MCC Tax Compliance Function

The MCC handles legacy federal taxes on behalf of citizens, presenting them as line items on the monthly bill rather than separate tax obligations.

### What the MCC computes per citizen per month

```python
def compute_residual_federal_tax(citizen, year, month):
    """
    Calculate citizen's residual federal tax obligation for the month.
    Covers things SPICE doesn't replace: military, federal judiciary,
    selected federal programs.
    """
    base_share = FEDERAL_OBLIGATION_PER_CITIZEN_USD / 12
    
    # Could vary by income but we keep it simple — flat per citizen
    return base_share
```

The MCC includes this in the citizen's monthly bill. Citizen pays MCC in S. MCC converts to USDC at month-end via the Fisc and remits to federal authorities.

### What the citizen experiences

A monthly MCC bill arrives showing:
- Utilities (water, power, gas, sewer): $X in S
- Federal share (military, judiciary, etc.): $Y in S
- Total: $Z in S

The citizen pays one bill in S. The MCC handles conversion and external settlement. The citizen never sees a tax form.

### What the MCC tracks

```sql
CREATE TABLE mcc_federal_remittances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    month INTEGER,
    total_collected_s REAL,
    total_remitted_usdc REAL,
    fisc_rate_at_remittance REAL
);
```

This tracks the colony's residual federal tax obligation. The simulator records it as USDC outflow from the Fisc reserve.

---

## 9. Output and Diagnostics

Extensions to the dashboard:

### Levy revenue tracking

A new dashboard page showing:
- Monthly levy revenue by layer (gas, protocol, automation)
- Cumulative levy revenue
- Levy revenue by transaction type (internal_purchase, import, export, etc.)
- Top 10 levy-paying suppliers (by total automation levy paid)
- Average levy rate by sector

### UBI funding adequacy

- Annual UBI obligation vs annual levy revenue
- Funding ratio over time (should converge to 100% or above)
- Years where shortfall occurred (Fisc reserve drained to make up)
- Years where surplus occurred (Fisc reserve grew)

### Sector analysis

Show how the levy distributes across sectors:
- Total levy paid by sector
- Average levy rate within sector
- Which sectors are net contributors vs net beneficiaries

---

## 10. Validation Tests

After implementation, run these scenarios to verify the mechanism:

### Test 1: Baseline — does the colony fund itself?

Run the standard MaryFontaine simulation with default levy parameters under the AI Realist scenario. Expected outcome: levy revenue covers UBI obligation within ±10% by year 3-5. Fisc reserve stable or growing.

### Test 2: Stress test — does it survive The Transition?

Run under The Transition scenario. As displacement progresses, more firms have high profit-per-employee, so levy revenue should grow with the crisis (counter-cyclical). Expected outcome: levy revenue keeps pace with UBI obligation; Fisc reserve grows even as external economy collapses.

### Test 3: Parameter sweep

Vary `α` from 1.0 (linear) to 3.0 (steeply progressive). Vary `P_threshold` from $40K to $150K. See which combinations produce sustainable funding without crushing internal commerce.

### Test 4: Internal commerce impact

Compare colony internal commerce volume with and without internal levy application. Quantify the wedge effect — does internal levy meaningfully suppress colony-internal trade?

### Test 5: Comparison to previous failure modes

The previous simulation showed unmitigated colonies failing under realistic-scale Transition. Re-run that exact scenario with the new levy mechanism. Expected outcome: substantial improvement in PP retention, possibly to "full steady ground" without the heavy-handed mitigations (capital controls, means-tested UBI) the previous design needed.

---

## 11. Implementation Plan

### Phase A: Schema and data (1 day)
1. Add columns to companies and transactions tables
2. Create external_suppliers, protocol_treasury, levy_calibration, mcc_federal_remittances tables
3. Generate initial external supplier data (~100 entries with realistic profit-per-employee)
4. Add levy configuration to colony state

### Phase B: Transaction settlement (1-2 days)
1. Implement three-layer levy calculation in transaction settlement
2. Add atomic routing to gas, protocol, Fisc, and supplier
3. Update all existing transaction types to use new settlement
4. Verify levy correctly applied to internal_purchase, internal_b2b, export, import, mcc_bill

### Phase C: Annual recalibration (1 day)
1. Implement k recalibration at year-end
2. Update profit-per-employee for each business based on annual results
3. Record calibration history

### Phase D: MCC tax compliance (0.5 day)
1. Implement federal tax computation per citizen per month
2. Include in MCC bills
3. Track aggregate remittance from MCC to federal

### Phase E: Dashboard extensions (1-2 days)
1. New levy revenue page
2. UBI funding adequacy charts
3. Sector analysis

### Phase F: Validation (1 day)
1. Run all five test scenarios
2. Generate findings document comparing to previous simulator results
3. Identify any remaining issues

**Total: 5-7 days of focused work**

---

## 12. Open Design Questions

These are policy choices the colony's governance must make. The simulator can test alternatives but cannot decide them.

### 12.1 Should P_threshold scale with cost of living?

A $80K threshold today is meaningful; in 10 years after deflation it might be too high (excluding most automated firms). Options:
- Fixed in nominal terms (current default)
- Indexed to colony basket cost
- Indexed to median external profit-per-employee

### 12.2 How does the colony handle firms that strategically restructure?

A large firm could split into many smaller firms to lower their headline profit-per-employee. The protocol needs anti-avoidance rules. Options:
- Use group-level profit-per-employee for related entities
- Look at parent ownership structure
- Apply the levy per-transaction regardless of firm structure (treats every transaction's levy independently of firm structure)

### 12.3 Should there be a maximum levy rate?

Without a cap, very high profit-per-employee firms could pay 50%+ of transaction value. This might cause them to abandon the market entirely. Options:
- No cap (trust the formula)
- Cap at 30% of transaction value
- Variable cap based on supplier's elasticity

### 12.4 Cross-colony levy coordination?

When the federation forms, do colonies have unified levy parameters or independent ones? Options:
- Each colony sets independently (colony-level competition)
- Federation sets uniform parameters
- Federation sets minimums; colonies can set higher

### 12.5 What about tip-based or non-formal commerce?

A citizen tipping another citizen, or paying a friend for occasional help, should probably not trigger the levy. The simulator treats these as `internal_purchase` if any business is involved, or as `internal_p2p_transfer` (a new type) for purely citizen-to-citizen exchange. The latter is not levied.

---

## 13. Notes for the Build Agent

This specification is meant to be implementable directly by Claude Code with reference to the existing MaryFontaine simulator codebase.

Key principles:

The mechanism is *atomic and per-transaction*. Don't batch levies at month-end. Each transaction settles its three levies immediately.

The mechanism is *formula-based*. No human discretion at the per-transaction level. The colony's only discretion is setting the four policy parameters (P_threshold, P_baseline, α, k recalibration rules).

The mechanism is *protocol-locked*. Levies route to fixed destinations (chain, protocol treasury, Fisc reserve). Cannot be diverted by governance to other purposes.

The data structures are *additive*. Existing transaction records get new fields; existing tables get new columns. No deletions or radical restructuring of existing simulator state.

The MCC tax compliance function is a *separate concern* from the levy. The levy funds UBI; MCC tax compliance handles citizens' residual federal obligations to legacy government. Both are colony services but they're administratively distinct.

Output should be *interpretable*. The dashboard must let users see clearly how much levy revenue was generated, by whom, and how that compares to UBI obligation. The point of the simulator is to demonstrate the mechanism works.

---

*End of specification. Submit to Claude Code for implementation. Verify with the five validation tests before reporting findings.*
