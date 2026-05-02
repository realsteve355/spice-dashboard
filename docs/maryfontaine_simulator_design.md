# MaryFontaine — Transaction-Level Simulator Design

**Version 2, Working Draft** — revised 2 May 2026 with v1-build deltas (see §11). Original draft from Claude.ai dated 2 May 2026.

A 10-year, transaction-level simulation of the MaryFontaine colony at 10% scale (~3,900 citizens, ~100 companies). Output is a SQLite database recording every transaction and a Flask dashboard for inspection.

This document is the build specification. It pins down schema, founding data, monthly tick algorithm, archetype behaviour, and dashboard scope. The simulator instantiates the SPICE economic design as defined in `mars_colony_economy.md`, adapted for an Earth colony with external currency boundary, mortgages and other inherited obligations, and a narrow MCC scope (utilities billing only).

**Framing — what success looks like.** The simulation's job is to demonstrate that the colony provides an *oasis of calm* during the convulsive transition from a scarcity economy to an abundance economy — not to demonstrate steady-state stability under benign conditions. The credibility test is the **Convulsion** scenario (§3.6), not the mild AI-Realist baseline. If the colony can sustain citizen welfare and a stable basket-cost-in-S through accelerating non-linear AI deflation, simultaneous USD service/energy inflation, and discrete employer shocks, the design works. If it can't, we've found a fundamental flaw — exactly what we want to know before building real colonies on it.

**Note on framing.** This is rule-based with per-agent state and stochastic decisions, not agent-based modelling in the strict academic sense. Describe externally as "transaction-level colony economy simulation" rather than "agent-based simulation."

---

## 1. Scope and Goals

### What this simulator answers

- Does the SPICE colony design produce sustainable welfare for citizens over a 10-year horizon under realistic external economic conditions?
- Where does USDC flow at the colony boundary, and does it balance?
- What does income distribution look like across citizen archetypes (UBI-only retiree vs. Honda worker vs. tech striver)?
- How does the basket cost in S evolve under different deflation assumptions?
- Which colony companies thrive, which fail, and why?
- Does the strivers economy actually emerge — do new exporters get founded during the simulation?

### What this simulator does NOT do (in v1)

- Does not model legal disputes, governance changes, or constitutional amendments
- Does not model individual citizen decision-making at high fidelity (rule-based, not AI agents)
- Does not include external macro feedback (the colony does not affect external markets)
- Does not handle population growth/decline beyond a simple birth-death-immigration baseline
- Does not model intra-month timing — everything settles at month-end

### Scale

| Parameter | 10% scale | Full scale (for reference) |
|---|---|---|
| Citizens | 3,900 | 39,000 |
| Companies | ~100 | ~1,000 |
| Honda MaryFontaine workers | 320 | 3,200 |
| Honda exports | $4.5M/year | $45M/year |
| USDC reserve at founding | $5M | $50M |
| UBI | 100 S/citizen/month | 100 S/citizen/month |
| Simulation horizon | 120 months (10 years) | same |

UBI is per-citizen and does not scale with colony size. All other figures scale linearly.

---

## 2. Database Schema

SQLite. Modelled on the Mars `simulate.py` schema with Earth-specific extensions.

### Core tables

```sql
CREATE TABLE citizens (
    id INTEGER PRIMARY KEY,
    name TEXT,
    age_at_founding REAL,
    household_id INTEGER,
    archetype TEXT,         -- 'honda_worker' | 'retiree' | 'remote_worker' | etc — current
    behavioural_type TEXT,  -- 'saver' | 'spender' | 'striver' | 'balanced'
    death_year INTEGER,     -- null if alive
    arrival_year INTEGER,   -- 0 for founding citizens
    departure_year INTEGER  -- null if still resident
);

CREATE TABLE archetype_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id INTEGER,
    year INTEGER,
    month INTEGER,
    from_archetype TEXT,
    to_archetype TEXT,
    trigger TEXT          -- 'sustained_surplus' | 'company_founded' | 'company_survived_12mo' | 'job_loss'
);

CREATE TABLE households (
    id INTEGER PRIMARY KEY,
    composition TEXT,       -- 'single' | 'couple' | 'family_2k' | 'family_3k' | etc
    housing_type TEXT,      -- 'owner_free' | 'owner_mortgage' | 'renter_internal' | 'renter_external'
    monthly_housing_cost_usd REAL,
    monthly_housing_cost_s REAL,
    mortgage_balance_usd REAL,
    mortgage_rate REAL,
    mortgage_remaining_months INTEGER
);

CREATE TABLE companies (
    id INTEGER PRIMARY KEY,
    name TEXT,
    sector TEXT,
    founded_year INTEGER,
    closed_year INTEGER,
    is_external_owned INTEGER DEFAULT 0,    -- 1 if dominant external shareholder (Honda)
    cfo_policy TEXT                         -- 'conservative' | 'aggressive_dividend' | 'growth_focused'
);

CREATE TABLE equity_holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    holder_type TEXT,       -- 'citizen' | 'external'
    holder_id INTEGER,      -- citizen_id, or null with external_holder_name set
    external_holder_name TEXT,  -- 'Honda Inc' for external holders
    share_type TEXT,        -- 'permanent' | 'time_limited'
    share_count REAL,
    issued_year INTEGER,
    issued_month INTEGER,
    expiry_year INTEGER,    -- null for permanent
    expiry_month INTEGER,
    cancelled INTEGER DEFAULT 0
);
```

### Wallet and transaction tables

```sql
CREATE TABLE wallets (
    id INTEGER PRIMARY KEY,
    owner_type TEXT,        -- 'citizen' | 'company' | 'mcc' | 'fisc' | 'external'
    owner_id INTEGER,
    s_balance REAL DEFAULT 0,
    usdc_balance REAL DEFAULT 0  -- only Fisc and external have nonzero
);

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    month INTEGER,
    type TEXT,              -- see transaction types below
    from_wallet_id INTEGER,
    to_wallet_id INTEGER,
    s_amount REAL,
    usdc_amount REAL,       -- nonzero only for boundary crossings
    fisc_rate_at_time REAL, -- USD per S
    description TEXT,
    related_company_id INTEGER  -- for dividends, MCC bills, etc
);
```

### Transaction types

```
ubi_mint              — Fisc mints UBI to citizen
dividend_perm         — Company pays dividend on permanent shares
dividend_timed        — Company pays dividend on time-limited shares
mcc_bill              — Citizen pays MCC bill in S
internal_purchase     — Citizen buys from colony company (S → company)
internal_b2b          — Company pays company in S
external_income       — Citizen's external wage arrives (USDC → S via Fisc)
external_dividend     — External shareholder cashes out S dividend (S → USDC)
import                — Company imports from external supplier (S → USDC via Fisc)
export                — Company sells to external buyer (USDC → S via Fisc)
mortgage_payment      — Citizen pays external bank (S → USDC via Fisc)
external_rent         — Citizen pays external landlord (S → USDC via Fisc)
internal_rent         — Citizen pays colony landlord (S, internal)
cashout               — Citizen converts S to USDC for external assets
inflow_from_savings   — Citizen converts external savings to S
share_issue           — Company issues equity (no token transfer, just registration)
share_cancel          — Worker leaves; time-limited shares cancelled
```

### State and environment tables

```sql
CREATE TABLE fisc_state (
    year INTEGER,
    month INTEGER,
    fisc_rate REAL,             -- USD per S
    usdc_reserve REAL,
    s_supply_total REAL,
    s_supply_citizens REAL,
    s_supply_companies REAL,
    basket_cost_usd REAL,
    basket_cost_s REAL,         -- should stay near 28
    cover_ratio REAL,
    PRIMARY KEY (year, month)
);

CREATE TABLE basket_categories (
    name TEXT PRIMARY KEY,
    weight_at_founding_usd REAL,
    weight_pct REAL
);

CREATE TABLE external_environment (
    year INTEGER,
    month INTEGER,
    category TEXT,
    cost_usd REAL,              -- external USD cost of category, evolves under deflation
    PRIMARY KEY (year, month, category)
);

CREATE TABLE annual_summaries (
    year INTEGER PRIMARY KEY,
    population INTEGER,
    active_companies INTEGER,
    new_companies INTEGER,
    failed_companies INTEGER,
    total_exports_usd REAL,
    total_imports_usd REAL,
    net_usdc_flow REAL,
    avg_citizen_income_s REAL,
    median_citizen_income_s REAL,
    gini_coefficient REAL,
    fisc_rate_year_end REAL,
    reserve_year_end REAL
);
```

### Snapshot tables

```sql
CREATE TABLE citizen_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id INTEGER,
    year INTEGER,
    month INTEGER,
    s_balance REAL,
    monthly_income_s REAL,
    monthly_dividend_s REAL,
    monthly_external_usd REAL,
    monthly_basket_spend_s REAL,
    real_purchasing_power REAL    -- monthly_income_s / current basket_cost_s
);

CREATE TABLE company_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    year INTEGER,
    month INTEGER,
    s_balance REAL,                    -- end-of-month
    min_s_balance_within_month REAL,   -- intra-month minimum (liquidity-stress instrumentation)
    monthly_revenue_s REAL,
    monthly_costs_s REAL,
    monthly_imports_usd REAL,
    monthly_exports_usd REAL,
    monthly_dividend_distributed_s REAL,
    import_default_count INTEGER DEFAULT 0,   -- how many imports the company couldn't pay this month
    employee_count INTEGER,
    permanent_share_count REAL,
    timed_share_count REAL
);
```

---

## 3. Founding Data

The simulator starts from a fully-instantiated MaryFontaine at month 0. Founding data is generated parametrically from a configuration file.

### Citizen distribution (10% scale = 3,900 citizens)

| Archetype | Count | % | Behaviour notes |
|---|---|---|---|
| children_under_18 | 900 | 23.1% | UBI accumulates, no economic decisions |
| honda_assembly | 320 | 8.2% | Time-limited shares in Honda MaryFontaine |
| honda_admin | 80 | 2.1% | Time-limited shares (more per worker) |
| other_manufacturing | 250 | 6.4% | Time-limited shares in their company |
| healthcare_worker | 180 | 4.6% | Time-limited shares + small permanent |
| education_worker | 120 | 3.1% | Time-limited shares |
| retail_services | 400 | 10.3% | Time-limited shares |
| small_business_owner | 150 | 3.8% | Permanent equity in their company |
| sole_trader | 200 | 5.1% | 100% permanent in single-person company |
| remote_worker | 150 | 3.8% | External USDC income, no internal employment |
| retiree | 850 | 21.8% | Accumulated permanent equity, possibly external pension |
| ubi_only_choice | 300 | 7.7% | No employment, no equity, just UBI |

### Household generation

Citizens are grouped into ~1,500 households at 10% scale. Distribution:

| Household type | Count | Description |
|---|---|---|
| single_adult | 600 | One adult, no children |
| couple_no_kids | 350 | Two adults |
| family_with_kids | 450 | Two adults + 1-3 children |
| single_parent | 100 | One adult + 1-2 children |

### Housing distribution

For all 1,500 households:

| Housing type | % | Notes |
|---|---|---|
| owner_free_and_clear | 30% | No monthly housing cost |
| owner_with_mortgage | 35% | Monthly mortgage USD payment to external bank |
| renter_internal | 25% | Rent S to colony landlord |
| renter_external | 10% | Rent USDC to external landlord |

For owners with mortgages: random remaining balance $50K-$300K, rate 4-7%, remaining months 60-360.

### Companies (~100 at 10% scale)

```
Honda MaryFontaine (1)        — manufacturer, 400 workers, external-owned
MaryFontaine Cooperative (MCC) (1)  — utilities billing only, internal-owned
Bellefontaine Manufacturing (3-5)  — small manufacturers, $1-3M annual revenue each
Healthcare entities (5-8)         — clinic, hospital, dental, pharmacy, mental health (PRIVATE companies, not MCC)
Education entities (4-6)          — elementary, middle, high, vocational (PRIVATE companies, not MCC)
Major retail (10-15)              — supermarkets, hardware, pharmacy
Restaurants and food (15-20)      — diners, cafes, take-away
Professional services (10-15)     — legal, accounting, IT services
Construction and trades (5-10)    — builders, electricians, plumbers
Auto services (5-8)               — repair, used cars, dealerships
Other (10-15)                     — miscellaneous local businesses
Sole traders (200)                — single-citizen companies
```

**MCC scope is deliberately narrow in v1.** The MaryFontaine Cooperative bills only for utilities (electricity, water, sewer, waste, internet — collective infrastructure with natural monopoly characteristics). Healthcare and education are operated by private colony companies that compete on quality and price like any other sector. This is a design decision, not a placeholder — Steve's view (2 May 2026) is that the colony's resilience under stress is the question, and a fat MCC blunts the test by socialising too much of the risk. If the model fails without a wider MCC, we'll know it needs one.

**LAT (Local Automation Tax) is excluded from v1.** The colony operates without an automation tax to fund the Fisc; the reserve is depleted/replenished only via boundary trade and external income flows. If welfare cannot be sustained over the 10-year horizon, LAT becomes a candidate v2 mechanism. See §8.7.

Each company at founding has:
- Initial S balance (working capital, ~1 month of operating costs)
- Equity allocation per archetype rules
- Sector-typical revenue/cost profile
- CFO policy (random initial assignment)

### Honda MaryFontaine specifics

```
Sector: automotive_manufacturing
Workers: 400 (320 assembly + 80 admin/management)
Annual revenue: $4.5M USD via exports + small internal sales (~$0.3M)
Annual import costs: $2.5M (parts from external suppliers)
Annual MCC and internal services: $0.3M
Permanent equity: 60% Honda Inc, 5% long-term colony stakeholders (founders)
Time-limited equity: 35% across 400 workers
  - Assembly workers: 0.5 shares each = 160 shares total
  - Admin/management: 1.5 shares each = 120 shares total
  - Total time-limited: 280 shares
  - As % of company total: 35% (so total shares = 280 / 0.35 = 800 shares)
  - Honda Inc holds: 480 permanent shares (60%)
  - Colony stakeholders hold: 40 permanent shares (5%)
```

### Initial economic state

```
Fisc USDC reserve: $5,000,000
Total S supply: 0 (gets minted via UBI starting month 1)
Fisc rate: $1.00 / S
Basket cost target in S: 28 (anchored)
Initial basket categories and weights (as in macro page):
  - Energy: $8 USD weight, 28.6%
  - Food: $9 USD weight, 32.1%
  - Hard goods: $5 USD weight, 17.9%
  - Services: $6 USD weight, 21.4%
  - Total: $28 USD = 28 S at parity
```

Note: I've kept the 4-category basket from the macro page for consistency. A v2 could expand to a 9-category basket per the BLS data, but consistency between the macro page and the simulator is more important than basket fidelity in v1.

### 3.6 External environment scenarios

Six scenarios. The first four are baselines (sanity-check the engine produces sensible numbers under benign-to-moderate conditions). The last two — **Convulsion** and **Convulsion + Honda shock** — are the credibility tests, calibrated to the convulsive scarcity→abundance transition that motivates the project.

Each scenario specifies **annual percentage change per basket category** for years 1–10. Within-month evolution uses geometric compounding: `monthly_factor = (1 + annual_rate) ** (1/12)`. Optional ±0.3% monthly Gaussian noise can be added for realism (configurable; off by default for reproducibility).

#### Scenario tables (annual % change, USD price per category)

**AI Realist** (default baseline — mild AI deflation, mild USD inflation):
```
Year:        1    2    3    4    5    6    7    8    9   10
Energy:     +3   +3   +3   +3   +3   +3   +3   +3   +3   +3
Food:       +2   +2   +2   +2   +2   +2   +2   +2   +2   +2
Goods:      -3   -4   -5   -5   -5   -5   -4   -3   -3   -2
Services:   +2   +2   +2   +2   +2   +2   +2   +2   +2   +2
```

**AI Optimist** (aggressive deflation across the board — productivity wins everywhere):
```
Year:        1    2    3    4    5    6    7    8    9   10
Energy:      0    0   -2   -3   -4   -5   -5   -4   -3   -2
Food:       -1   -2   -3   -4   -4   -4   -3   -3   -2   -2
Goods:      -8  -12  -15  -15  -14  -12  -10   -8   -6   -4
Services:    0   -1   -2   -3   -4   -4   -4   -3   -2   -2
```

**Stagflation** (USD instability dominates AI deflation; classic policy-failure regime):
```
Year:        1    2    3    4    5    6    7    8    9   10
Energy:     +8  +10  +12  +10   +8   +6   +5   +4   +3   +3
Food:       +6   +8  +10   +9   +7   +5   +4   +3   +3   +2
Goods:      -2   -2   -3   -3   -3   -2   -2   -1   -1    0
Services:   +6   +8   +9   +8   +6   +5   +4   +3   +3   +2
```

**AI + Healthcare crisis** (AI Optimist for goods/services, but a healthcare cost shock — implemented as +20%/yr for the healthcare sub-category in services for years 2–5, tapering to +5% by year 10):
```
Year:        1    2    3    4    5    6    7    8    9   10
Energy:      0    0   -2   -3   -4   -5   -5   -4   -3   -2
Food:       -1   -2   -3   -4   -4   -4   -3   -3   -2   -2
Goods:      -8  -12  -15  -15  -14  -12  -10   -8   -6   -4
Services:   +5  +12  +15  +12   +8   +6   +5   +5   +4   +3
```
*(Healthcare-driven services inflation; if healthcare were broken out as a 5th category we'd target it at +20% Y2–5; v1 lumps it into services.)*

**Convulsion** (the credibility test — accelerating non-linear AI deflation in goods, simultaneous USD inflation in services and energy from monetary response, peaking mid-horizon then tapering as the new equilibrium emerges):
```
Year:        1    2    3    4    5    6    7    8    9   10
Energy:    +10  +14  +18  +22  +18  +12   +8   +5   +3   +2
Food:       +6  +10  +14  +16  +14  +10   +6   +4   +3   +2
Goods:      -8  -16  -24  -32  -38  -34  -28  -20  -14  -10
Services:   +8  +12  +16  +18  +14  +10   +7   +5   +3   +2
```

Reading: by end of Y5 the USD price of hard goods has fallen by ~75% cumulatively (compounded), while services and energy have roughly doubled. That divergence is what the basket-anchoring has to absorb. The Fisc's job is keeping the basket costing 28 S throughout — citizens experience S as stable in real terms even as USD prices go wild in opposite directions.

**Convulsion + Honda shock** (all of Convulsion plus a discrete employer shock — automotive demand collapses mid-decade as AI-driven design changes obsolete the existing line; the colony's largest external earner takes a structural hit):
- Same per-category trajectory as Convulsion
- Honda MaryFontaine exports drop **50% in month 39 (start of Q3 of Y4)** — implemented as a step function on `company_revenue.honda_export_usd`
- Recovery: linear ramp from 50% back to **70% of original** over months 40–63 (24 months)
- New baseline of 70% holds for months 64–120 (Honda has restructured around a smaller, more automated production line)

This tests whether the reserve and the basket peg survive a simultaneous structural deflation regime *and* a single-employer cashflow shock. Honda Inc as external shareholder still expects dividends; mortgages still need paying in USD; UBI still mints. If the colony muddles through this, the design is robust enough to credibly recommend.

#### Within-month timing

Per-category USD prices are interpolated month-by-month using geometric compounding from the annual rates above. The Fisc reads this month's basket-cost-USD at the start of each tick (§4.1) and recomputes the rate (§4.2).

#### Stochasticity

Default scenarios are deterministic for reproducibility. A `--noise` flag adds ±0.3% Gaussian monthly multiplicative noise per category. Run with multiple seeds to bound the outcome distribution. v2 may add larger discrete shocks (supplier failures, immigration spikes) as configurable events.

### Citizen initial S balances

All citizens start at 0 S. They receive their first UBI on month 1.

### Citizen initial USDC balances

Most start at 0. Exceptions:
- Retirees: ~$5K-50K savings (passed through Fisc to start as S balance after conversion)
- Some immigrants/late-arrivers: variable

For simplicity, I'll model these as initial S balances based on Fisc-rate-at-founding conversion, and not track per-citizen USDC balances.

---

## 4. Monthly Tick Algorithm

For each month from 1 to 120:

### 4.1. External environment update

Read this month's USD prices per basket category from the scenario data.

### 4.2. Fisc rate adjustment

Compute the rate that keeps `basket_cost_s = 28` given current external USD prices:

```python
basket_usd = sum(category_cost_usd for each basket category)
fisc_rate = basket_usd / 28
```

Validate against reserve cover:
```python
required_reserve = total_s_supply * fisc_rate * cover_target  # cover_target = 0.30
if usdc_reserve < required_reserve:
    fisc_rate = usdc_reserve / (total_s_supply * cover_target)
    # Basket cost in S will exceed 28 — flag as 'rate compressed'
```

### 4.3. UBI mint

For each living citizen:
```
issue 100 S to citizen wallet
record transaction: ubi_mint, fisc → citizen, 100 S
```

### 4.4. External income arrivals

For each remote_worker citizen:
```
external_usd = monthly external salary (per citizen profile)
s_minted = external_usd / fisc_rate
issue s_minted S to citizen wallet
record transaction: external_income, fisc → citizen
update fisc reserve: usdc_reserve += external_usd
```

For each retiree with external pension:
```
similar mechanism, smaller amounts
```

### 4.5. Company operations (per company, per month)

For each active company:

**Liquidity instrumentation.** Each company tracks `min_s_balance_within_month`, initialised to the start-of-month balance and updated on every debit. End-of-month settlement masks intra-month liquidity stress; this metric exposes it. A company that ends the month at +200 S but dipped to −150 S after paying imports before its dividend revenue arrived has a liquidity problem the snapshot would otherwise hide. v2 may move to within-month timing; v1 instruments-then-defers.

#### 4.5.1. Generate revenue

For colony companies serving local market:
```
internal_revenue_s = sum of citizen purchases this month for this sector × company market share
# (citizen purchases happen in step 4.7; company revenue is computed there and accumulates here)
```

For exporting companies (Honda, others):
```
export_usd = monthly export volume (per company profile, may vary stochastically)
s_received = export_usd / fisc_rate
record transaction: export, fisc → company, s_received S
update fisc reserve: usdc_reserve += export_usd
```

#### 4.5.2. Pay imports

For companies needing external inputs:
```
import_usd = monthly import volume (per company profile)
s_required = import_usd / fisc_rate
if company.s_balance >= s_required:
    company.s_balance -= s_required
    fisc_reserve_usdc -= import_usd
    record transaction: import, company → fisc → external_supplier
else:
    # Company defaults on this import. May fail if persistent.
    log_company_stress(company, 'import_default')
```

#### 4.5.3. Pay MCC bills and internal services

```
mcc_bill_s = company.utility_consumption_share * MCC_pricing
company.s_balance -= mcc_bill_s
mcc_company.s_balance += mcc_bill_s
record transaction: mcc_bill, company → mcc

# Internal services (legal, IT, maintenance, etc.)
for service_provider in company.service_dependencies:
    payment_s = company.service_spend[service_provider]
    company.s_balance -= payment_s
    service_provider.s_balance += payment_s
    record transaction: internal_b2b
```

#### 4.5.4. Compute distributable surplus

```
end_of_month_s = company.s_balance
working_capital_target = 1 month of operating costs (per CFO policy)
retain = working_capital_target if cfo_policy == 'conservative' else 0.5 * working_capital_target
distributable = max(0, end_of_month_s - retain)
```

#### 4.5.5. Distribute dividend

Pro rata across all share holders (permanent + time-limited):
```
total_active_shares = sum of all non-cancelled shares for this company
for each holding (permanent + time-limited, not cancelled):
    holder_dividend = distributable * (holding.share_count / total_active_shares)
    # Convert to specific transactions:
    if holding.holder_type == 'citizen':
        company.s_balance -= holder_dividend
        citizen.s_balance += holder_dividend
        record transaction: dividend_perm or dividend_timed
    elif holding.holder_type == 'external':
        # External shareholder receives in S, immediately cashes out
        company.s_balance -= holder_dividend
        usdc_amount = holder_dividend * fisc_rate
        fisc_reserve_usdc -= usdc_amount
        record transaction: external_dividend (effectively cashout for external holder)
```

### 4.6. MCC operations

The MCC has its own balance and books. It charges citizens monthly bills based on consumption.

```
for each household:
    consumption_s = household_specific_consumption_pattern * MCC_pricing
    household_primary_citizen.s_balance -= consumption_s
    mcc.s_balance += consumption_s
    record transaction: mcc_bill, citizen → mcc

# MCC has its own costs (some imports, some internal labour)
mcc_costs_s = MCC_operating_cost
mcc.s_balance -= mcc_costs_s
# (Distributed to MCC suppliers and dividend pool similar to other companies)

# MCC distributes dividends to shareholders (all citizens, equal shares)
```

### 4.7. Citizen consumption

For each citizen (or rather, household):

```python
# Compute monthly basket spending
household_basket_spend_s = household.basket_baseline * basket_cost_s

# Allocate across categories (different fractions per archetype)
for category in basket_categories:
    spend_s = household_basket_spend_s * household.allocation[category]
    # Find which colony company supplies this category (see supplier picker below)
    supplier = pick_colony_supplier_for_category(category, household)
    household_primary.s_balance -= spend_s
    supplier.s_balance += spend_s
    record transaction: internal_purchase

# Housing payments
if household.housing_type == 'owner_with_mortgage':
    mortgage_payment_usd = household.monthly_mortgage_usd
    s_required = mortgage_payment_usd / fisc_rate
    household_primary.s_balance -= s_required
    fisc_reserve_usdc -= mortgage_payment_usd
    # USDC sent to external bank
    record transaction: mortgage_payment
elif household.housing_type == 'renter_external':
    # Similar — S converted to USDC, sent to external landlord
    ...
elif household.housing_type == 'renter_internal':
    # S to colony landlord (a company)
    ...

# Discretionary spending (non-basket)
discretionary_s = max(0, citizen.s_balance - target_savings) * household.discretionary_propensity
# Spent at colony retailers, restaurants, services
```

#### 4.7.1. Supplier picker (v1 proxy — no explicit price competition)

The simulator does not model per-good prices or competitive pricing. Companies are instead allocated demand by a weighted-random pick across all companies in the relevant category:

```python
def pick_colony_supplier_for_category(category, household):
    candidates = [c for c in active_companies if category in c.sectors_served]
    weights = []
    for c in candidates:
        # Per-household preference vector — drawn at founding from a Dirichlet
        # over candidates in the category, with mild archetype-driven bias
        # (e.g. retail_services workers favour their employer slightly).
        pref = household.preferences[category].get(c.id, 1.0)
        # Spare capacity: each company has max_revenue_per_month_s; this falls
        # toward zero as the company saturates this month.
        spare = max(0.0, c.max_revenue_per_month_s - c.revenue_so_far_this_month_s)
        weights.append(pref * spare)
    if sum(weights) <= 0:
        # All in-category companies saturated; fall back to nearest-uniform pick.
        # In stress periods this may force "import" instead — track as 'unmet demand'.
        return None  # caller routes spend to import or carries over
    return weighted_random_choice(candidates, weights)
```

**Per-citizen preference vector.** At founding, each household draws a preference distribution over all in-category companies via Dirichlet(α). α is mildly biased by archetype (e.g. retail_services workers get slightly higher weight on their employer; remote_workers are closer to uniform). Preferences are static for v1 — preference drift is a v2 candidate.

**Capacity model.** Each company has `max_revenue_per_month_s`, derived at founding from sector-typical revenue divided by 12. Companies that saturate this stop attracting new demand that month — proxy for "queue is full / shelves are empty / appointment book is closed." Companies that consistently saturate are candidates for expansion (v2); companies that consistently run far below capacity are candidates for failure (§4.10).

**What this captures, what it doesn't.** Captures: market share emerging from preference + supply-side capacity, demand routing under stress, unmet demand as a stress signal. Doesn't capture: price competition, quality differentiation, advertising, network effects, switching costs. v1 is "good enough to test whether the macroeconomy works"; v2 can layer pricing dynamics if useful.

**Instrumentation.** Track `unmet_demand_s` per category per month. If this is consistently > 5% of total demand under Convulsion, the failure mechanism (§4.10) isn't pruning the right companies and supply isn't reorganising — that's a finding worth surfacing.

### 4.8. Citizen behaviour decisions

After basket and discretionary spending, citizens with surplus S make choices based on `behavioural_type`:

```python
for citizen in active_citizens:
    surplus = citizen.s_balance - subsistence_target
    if surplus <= 0:
        continue
    
    if citizen.behavioural_type == 'saver':
        # Hold most as S savings; convert some to USDC for external assets
        cashout_pct = 0.10
        ...
    elif citizen.behavioural_type == 'spender':
        # Spend most; minimal saving
        # (already handled in discretionary spending)
        ...
    elif citizen.behavioural_type == 'striver':
        # Look for company-founding opportunities; buy permanent shares
        if surplus > company_founding_threshold:
            maybe_found_new_company(citizen)
        else:
            buy_equity_in_existing_company(citizen, surplus * 0.5)
    elif citizen.behavioural_type == 'balanced':
        # Mix
        ...
```

### 4.8.1. Archetype transitions

After behavioural decisions, evaluate each citizen for archetype transition. Transitions are recorded in `archetype_history` and reflected in `citizens.archetype`. Citizens may transition more than once over the 10-year horizon.

```python
SUBSISTENCE_S = 50  # citizen-monthly subsistence proxy in S; tune via config
SURPLUS_THRESHOLD = 1.5 * SUBSISTENCE_S
SURPLUS_DURATION_MONTHS = 6

for citizen in active_citizens:
    # ubi_only_choice → striver
    if citizen.archetype == 'ubi_only_choice':
        if (citizen.recent_surplus_streak >= SURPLUS_DURATION_MONTHS
                and citizen.s_balance >= SURPLUS_THRESHOLD * 3
                and citizen.has_made_first_equity_purchase):
            transition(citizen, to='striver', trigger='sustained_surplus')

    # worker → striver (any worker archetype)
    elif citizen.archetype in WORKER_ARCHETYPES:
        if (citizen.recent_surplus_streak >= SURPLUS_DURATION_MONTHS * 2  # higher bar — workers already have income
                and citizen.s_balance >= SURPLUS_THRESHOLD * 5
                and citizen.has_made_first_equity_purchase):
            transition(citizen, to='striver', trigger='sustained_surplus')

    # striver → small_business_owner
    elif citizen.archetype == 'striver':
        founded = citizen.companies_founded
        for c in founded:
            if c.is_active and (current_month - c.founded_month) >= 12:
                transition(citizen, to='small_business_owner', trigger='company_survived_12mo')
                break

    # any → ubi_only_choice (job loss / company failure)
    if citizen.lost_employment_this_month and not citizen.has_other_income:
        transition(citizen, to='ubi_only_choice', trigger='job_loss')
```

**What this captures.** The pathway from "passive UBI recipient" to "active equity-holding striver" to "small business owner with permanent equity" is the colony's social-mobility mechanism. If the simulation runs and almost no ubi_only_choice citizens transition to striver, the system isn't producing the dynamism Steve's vision requires — that's a finding. Conversely, if many transition out of ubi_only_choice into productive archetypes, the colony is doing its job. Reverse transitions (job loss back to UBI) are the safety-net mechanism — losing your job in MaryFontaine should be uncomfortable but not catastrophic.

**Tuning.** SUBSISTENCE_S and SURPLUS_DURATION_MONTHS are config-driven. Calibrate at first run such that under AI-Realist baseline, ~10–20% of ubi_only_choice citizens transition over 10 years. Under Convulsion, observe what happens — too many or too few transitions are both signals.

### 4.9. Company founding (the strivers mechanism)

Each month, a few strivers may decide to found new companies if:
- They have sufficient S savings
- The colony has unmet demand in some sector
- The probability check (random) hits

```python
for striver in citizens_with_high_savings:
    if random() < monthly_founding_probability:
        sector = identify_underserved_sector(colony_state)
        new_company = found_company(founder=striver, sector=sector, capital=striver_investment)
        record transaction: share_issue (founder gets permanent equity)
        # Hire workers via time-limited shares
        for worker in pick_workers_for_new_company(new_company):
            issue_time_limited_shares(worker, new_company)
```

### 4.10. Company failure

Each month, companies may fail if:
- S balance is persistently negative (cannot meet obligations)
- Revenue trajectory is declining for N consecutive months
- Sector has too much competition for size of demand

```python
for company in active_companies:
    if company.failure_check():
        company.closed_year = current_year
        # Time-limited shares cancel
        # Permanent shares lose value (wallet S balance distributed pro rata)
        # Workers go back to UBI-only or find new jobs
        record_company_failure(company)
```

### 4.11. End-of-month snapshot

Take snapshots:
- For each citizen: balance, income, spending
- For each company: balance, revenue, dividends, employees
- Fisc state: reserve, rate, S supply, basket cost

### 4.12. End-of-year processing

Once per 12 months:
- Compute annual summaries
- Population events: ageing, deaths, births, immigration, departures
- Citizens age 1 year; some die based on life tables; some children turn 18
- New citizens may arrive (immigrants — small number per year)
- Some citizens may depart (rare in early years; more if colony stress is high)

---

## 5. Citizen Archetype Behaviour Profiles

Each archetype has default values for:

```
basket_baseline_multiplier: how much basket they consume relative to standard
  (children: 0.5x, single: 1.0x, family: depends on size)
discretionary_propensity: fraction of surplus S spent on non-basket
  (saver: 0.2, balanced: 0.5, spender: 0.8)
external_income_usd: monthly external wage/pension if any
target_savings_s: how much S they aim to keep on hand
behavioural_type_distribution: probabilities of each behavioural type
```

### Detailed profiles

**honda_assembly worker** (320 citizens):
- Time-limited shares in Honda MaryFontaine (0.5 shares each, fixed)
- No permanent equity by default
- Basket multiplier: 1.0
- Behavioural type distribution: 30% saver, 50% balanced, 15% striver, 5% spender
- Monthly income expected: ~100 S UBI + ~150 S Honda dividend

**honda_admin** (80 citizens):
- Time-limited shares 1.5 each
- Some have small permanent equity from founding allocation
- Behavioural type: 25% saver, 40% balanced, 30% striver, 5% spender

**retiree** (850 citizens):
- Permanent equity from past employment (varies widely by individual: 0-50 shares across various companies)
- ~30% have external pension income ($500-2000/month USDC)
- Basket multiplier: 0.8 (smaller household, lower consumption)
- Behavioural type: 60% saver, 30% balanced, 10% spender

**remote_worker** (150 citizens):
- External USD income (distribution: 60% at $50K, 30% at $75K, 10% at $120K annual)
- May or may not have colony equity
- Behavioural type: 20% saver, 30% balanced, 35% striver, 15% spender

**ubi_only_choice** (300 citizens):
- No external income, no internal employment
- May hold small permanent equity (inherited or bought-in)
- Basket multiplier: 0.9 (slightly thrifty)
- Behavioural type: 40% saver, 40% balanced, 5% striver, 15% spender

**children_under_18** (900 citizens):
- UBI accumulates in their wallet (under guardian's control via household structure)
- No basket consumption directly (handled at household level)
- No equity decisions

(... full set of 12 archetypes specified similarly)

---

## 6. Output and Dashboard Scope

### Static output: SQLite database

After 120-month simulation completes, the database contains:
- Full transaction history (~50M rows at 10% scale)
- Monthly snapshots for all citizens and companies
- Annual summaries
- Fisc state per month

### Flask dashboard

Following Mars patterns (`server.py` + `dashboard.html`).

#### Page 1: Overview

- Population and company count over time
- Total S supply and USDC reserve over time
- Basket cost in S (should hover near 28)
- Fisc rate over time
- Net USDC flow per year
- Aggregate income distribution (Gini, deciles)

#### Page 2: Citizens

- Searchable/filterable citizen list
- Drill-down: individual citizen's life trajectory (monthly income, balance, transactions)
- Archetype-aggregate views: average income for each archetype over time
- Distribution visualisations: histogram of income, savings, equity holdings

#### Page 3: Companies

- Company performance: revenue, profit, dividends, employee count over time
- Sector aggregate views
- Founding/failure rates
- Honda MaryFontaine special view (large external-owned exporter)
- MCC view (utilities entity)

#### Page 4: External flows

- Imports/exports by month and category
- USDC reserve trajectory
- Citizen mortgage payments (cumulative outflow)
- External wage inflows

#### Page 5: Strivers and innovation

- New companies founded over time (total + sector breakdown)
- Companies that successfully exported externally (boundary-crossing strivers)
- Wealth accumulation profiles for top citizens
- **Archetype transition flow** — Sankey or stacked-area showing citizens moving between archetypes over 120 months. Driven by `archetype_history` table (§2). Particular focus: ubi_only_choice → striver → small_business_owner pathway, and reverse flows from job loss.
- Transition rate per scenario (compare AI-Realist vs Convulsion side-by-side)
- "Stuck" citizens: cohort that remains in ubi_only_choice the entire run despite running surplus — diagnose whether colony has barriers to mobility, or these citizens are content there

---

## 7. Build Plan

### Phase 1: Foundation (~3-4 days)
1. Schema implementation (`schema.sql`)
2. Founding data generator (`generate_founding.py`) — fiddly: 1,500 households with internally-consistent housing/mortgage/archetype distributions, ~100 companies with consistent equity allocations, household-level preference vectors over in-category companies
3. External environment scenario tables (per §3.6 — six scenarios pre-computed to per-month per-category USD price arrays)
4. Validation: instantiate MaryFontaine, verify totals match macro page (39k×0.1 citizens, $5M reserve, 28 S basket, 4-category split)

### Phase 2: Monthly tick (~4-5 days)
1. Fisc rate adjustment (basket-anchoring + cover-ratio compression)
2. UBI mint
3. External income flows (remote workers + retiree pensions)
4. Company operations (revenue, costs, imports, exports, intra-month min-balance tracking)
5. MCC billing (utilities only)
6. Dividend distribution (permanent + time-limited, with external cashout for Honda Inc)
7. Citizen consumption + supplier picker (§4.7.1)
8. Citizen behavioural decisions
9. Archetype transitions (§4.8.1)
10. Snapshot recording

### Phase 3: Lifecycle dynamics (~2-3 days)
1. Population events (births, deaths, immigration, departures)
2. Company founding (striver mechanism)
3. Company failure (revenue trajectory + persistent negative balance)
4. Equity transfers (rare in v1)

### Phase 4: Dashboard (~3 days)
1. Flask server with API endpoints
2. Five dashboard pages (Overview, Citizens, Companies, External flows, Strivers/innovation)
3. Charts using Recharts or Chart.js
4. Drill-down navigation
5. Sankey or stacked-area for archetype transition flow on Page 5

### Phase 5: Validation and analysis (~2-3 days)
1. Run all six scenarios end-to-end
2. Sanity-check outputs against macro-page expectations under AI-Realist
3. **Convulsion scenario is the credibility test** — if the basket peg breaks, the reserve depletes, or median citizen welfare collapses, that's the finding to investigate
4. Side-by-side scenario comparison; identify which mechanisms are load-bearing
5. Adjust parameters that produce obviously wrong results; re-run

**Total: 14–18 days of focused work** (revised upward from initial 8–11 estimate; the founding generator and scenario calibration are heavier than they look)

---

## 8. Open Questions for Resolution During Build

1. **Mortgage burden mechanism.** Citizens with external mortgages have persistent USDC outflow obligation. Does the simulator handle this as raw friction (each mortgage payment is an S→USDC conversion that drains the reserve) or does the colony provide a refinancing mechanism? V1: raw friction. Track impact, decide later.

2. **External wage rate sensitivity.** Remote worker external income arrives in USDC and is converted at the current Fisc rate. If the rate moves (S strengthens against deflating USD), workers' S income falls in nominal terms. Is this realistic? Yes — it's the same purchasing power but different nominal numbers.

3. **Honda Inc behaviour.** Honda Inc holds permanent equity, receives monthly dividend in S, immediately cashes out to USDC. This creates persistent USDC outflow. Realistic but potentially destabilising for the reserve. The simulator will show whether this is sustainable.

4. **Company founding parameters.** What's a realistic monthly probability of a striver founding a new company? What's the success rate? V1: pick reasonable defaults (~2% monthly founding probability for high-savings strivers, ~50% first-year survival rate), tune based on outputs.

5. **Time-limited share issuance dynamics.** When a company hires a new worker, how many shares do they get? V1: per-archetype defaults (assembly 0.5, admin 1.5, etc.). Adjustable via per-company policy.

6. **Inter-month timing.** All transactions settle at month-end. This is unrealistic but vastly simpler. V1 accepts this; v2 could simulate within-month timing. v1 mitigation: track `min_s_balance_within_month` per company (§4.5) so monthly snapshots don't hide intra-month liquidity stress.

### Resolved decisions (2 May 2026)

7. **LAT (Local Automation Tax) — excluded from v1.** Decision: operate the colony without an automation tax. The Fisc reserve is replenished only via boundary trade (export earnings, external income, cashout fees) and depleted by imports + cashouts + mortgage USD outflows. If welfare cannot be sustained over the 10-year horizon under realistic conditions, LAT is the leading v2 mechanism to add. We want to know whether the design works without it before assuming it needs it.

8. **MCC scope — utilities only.** Decision: the MCC bills only for utilities (electricity, water, sewer, waste, internet). Healthcare, education, and other public-good-adjacent sectors are operated by private colony companies. A fat MCC blunts the resilience test by socialising too much of the risk; a narrow MCC stresses the private sector and surfaces flaws faster. If the model fails because too much critical infrastructure is in the private sector, we'll know it needs a wider MCC.

9. **Framing — "agent-based" vs "transaction-level."** Decision: describe the simulator as "transaction-level colony economy simulation" rather than "agent-based simulation." The internal architecture is rule-based with per-agent state and stochastic decisions, which is sufficient for the question being asked but doesn't meet the strict ABM definition. Honest framing avoids credibility risk with economically-literate viewers.

---

## 9. Reuse from Mars Simulator

Components to copy directly from Mars `simulate.py`:
- SQLite schema patterns (snapshots, transactions, summaries)
- Flask server structure (`server.py`)
- Dashboard HTML/JS patterns
- Citizen and company iteration patterns
- Annual summary generation

Components to redesign:
- Population growth dynamics (Mars grows; MaryFontaine is roughly stable)
- Robot fleet (does not exist on Earth)
- V-tokens (eliminated per recent decisions)
- Harberger land mechanism (does not apply on Earth)

Components to add (Earth-specific):
- External environment (basket prices over time)
- Fisc rate mechanism (currency-board logic)
- Boundary transactions (import/export/cashout/external_income)
- Mortgage/external-rent obligations
- External shareholder cashout (Honda Inc)
- Time-limited share dividend distribution (replaces wages)

---

## 10. Notes on the Build

The simulator is research code. It optimises for clarity and inspectability over performance. It runs once per simulation (not interactively). Output is a fixed database which the dashboard then reads.

For interactive exploration, parameters that user might want to vary (deflation scenario, behavioural type mixes, company founding rates) are exposed as configuration in `generate_founding.py` and re-running the simulator with different config produces different databases that can be compared.

The dashboard is meant for inspection and finding insights, not for running new simulations from the UI.

If we later want a fully interactive version on zpc.finance, we'd port the simulator engine to JavaScript and run it in the browser, with parameters exposed via sliders. That's a separate v2 project.

---

## 11. v2 Changelog (deltas from Claude.ai original draft)

Recorded 2 May 2026 after Steve's review of the original spec.

**Strategic reframing**
- Added top-level "oasis of calm during the convulsive scarcity→abundance transition" framing as the simulation's success criterion
- Reframed externally as "transaction-level simulation" not "agent-based simulation" (§8.9)
- Two-product end-state acknowledged: this Earth simulator + a future Simple Colony simulator (university campus / religious community scale, Mars-style closed economy)

**Scope decisions resolved**
- §3, §8.7: **LAT (Local Automation Tax) excluded from v1.** Confirmed never to be Land Appreciation Tax; LAT means Local Automation Tax in SPICE.
- §3, §8.8: **MCC scope narrowed to utilities billing only** (originally ambiguous "small MCC scope"). Healthcare and education explicitly moved to private colony companies.

**Mechanisms specified that were previously stubs or hand-waves**
- §3.6: External environment scenarios fully numerically specified for all four originals (AI Realist, AI Optimist, Stagflation, AI+Healthcare crisis), plus two new scenarios — **Convulsion** and **Convulsion + Honda shock** — calibrated as the credibility tests
- §4.7.1: Supplier-picker / market-share mechanism specified as preference × spare-capacity weighted random pick (Dirichlet-drawn household preferences, sector-typical max-revenue capacity)
- §4.8.1 + §2: Archetype transition mechanism specified (ubi_only_choice → striver → small_business_owner pathway with thresholds and reverse flows). New `archetype_history` table.

**Instrumentation added**
- §2 + §4.5: `min_s_balance_within_month` per company snapshot — exposes intra-month liquidity stress that end-of-month settlement masks
- §2: `import_default_count` per company per month
- §4.7.1: `unmet_demand_s` per category per month (signal that supply-side isn't reorganising under stress)

**Build estimate revised**
- §7: 8–11 days → 14–18 days. Founding generator and scenario calibration are heavier than the original estimate suggested.

**Out of scope for v1** (deferred to v2)
- Within-month transaction timing
- Price competition / quality differentiation between in-category companies
- Preference drift (citizen preferences static after founding)
- Macro feedback (colony does not affect external prices)
- Population growth/decline beyond simple birth-death-immigration baseline
