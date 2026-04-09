# Mars Colony Simulation — Version 2 Spec
## For Claude Code

This document specifies all changes to the Mars Colony simulation codebase.
The existing files are: `simulate.py`, `server.py`, `dashboard.html`.
All three require changes. A new file `life.py` is also required.

---

## CONTEXT

The Mars Colony simulation models a post-scarcity economy on Mars:
- Citizens receive 1,000 S-tokens UBI per month (expires monthly)
- Up to 20% can be converted to permanent V-tokens (savings)
- Companies earn S-tokens, pay monthly V-token dividends to equity holders
- MCC (Mars Colony Company) provides infrastructure, bills citizens for usage
- The Fisc is the automated financial institution (currently called "mint" in code — rename throughout)

---

## CHANGE 1 — simulate.py: Monthly dividends (currently annual)

### What to change
Companies currently convert S-tokens and pay dividends once per year at `is_year_end`.
Change this to happen every month at month end.

### Exact changes

**1a. Remove `annual_revenue` tracking from Company dataclass** — replace with
`monthly_revenue: float = 0.0` (reset each month).

**1b. Remove `last_annual_rev` from Company dataclass** — no longer needed.

**1c. Move the company dividend block** from the `if is_year_end:` section to
run every month, immediately before month-end S-token expiry.

The monthly company processing should be:
```python
# Every month, for each alive non-MCC company:
for co in companies:
    if not co.alive or co.is_mcc:
        continue
    co.monthly_revenue = co.s_buffer  # track for snapshots

    # Convert up to 20% of net S-buffer to V-tokens
    v_convert = co.s_buffer * MAX_V_COMPANY
    co.v_tokens += v_convert

    # Pay dividends from ALL current V-tokens (not just this month's)
    # Only pay if there are V-tokens and company is profitable
    if co.v_tokens > 0 and co.s_buffer > 0:
        dividend = co.v_tokens * 0.4
        co.v_tokens -= dividend
        owner_people = [(oid, people_lookup[oid]) for oid in co.owner_ids
                       if oid in people_lookup and people_lookup[oid].alive]
        total_shares = sum(p.co_shares.get(co.id, 0) for _, p in owner_people)
        if total_shares > 0:
            for oid, p in owner_people:
                shares = p.co_shares.get(co.id, 0)
                if shares > 0:
                    d = dividend * shares / total_shares
                    p.v_tokens += d
                    txn_batch.append((year, month_of_year, p.id, co.id,
                                    "Dividend Payment", round(d, 2), "dividend"))

    # Reset S-buffer (expires at month end)
    co.s_buffer = 0
    co.monthly_revenue = 0
```

**1d. MCC also moves to monthly** — same pattern. MCC converts 20% of monthly
net to V-tokens, pays board profit share monthly (not annually), resets s_buffer.
Remove the annual MCC block from `is_year_end`.

**1e. Keep `is_year_end` for:**
- Annual summaries to `annual_summaries` table
- New company formation (still annual)
- Citizen quintile assignment
- Infrastructure health repair for MCC

**1f. Update `annual_summaries`** — the `mcc_board_share_pct` column now
reflects the board's monthly take averaged across the year. Keep schema identical.

---

## CHANGE 2 — simulate.py: Variable itemised MCC billing

### What to change
Currently MCC charges a flat revenue figure based on population.
Change to per-citizen itemised billing based on individual consumption profiles.

### New citizen attributes (add to Citizen dataclass)
```python
# Consumption profile — set once on citizen creation, slight variation per person
habitat_size: float = 1.0      # multiplier: 0.5 (small) to 3.0 (large habitat)
power_usage: float = 1.0       # multiplier: 0.5 to 2.5
water_usage: float = 1.0       # multiplier: 0.5 to 2.0
```

Generate these in `mk_citizen()`:
```python
c.habitat_size = max(0.5, random.gauss(1.0, 0.35))   # capped 0.5-3.0
c.power_usage  = max(0.5, random.gauss(1.0, 0.30))   # capped 0.5-2.5
c.water_usage  = max(0.5, random.gauss(1.0, 0.25))   # capped 0.5-2.0
```

Wealthier citizens (higher V-tokens) should gradually increase habitat_size
over time — add a small annual drift:
```python
# In is_year_end, for each alive citizen:
if p.v_tokens > 2000:
    p.habitat_size = min(3.0, p.habitat_size + 0.02)
```

### MCC billing constants (add near top of file)
```python
# MCC per-unit prices (S-tokens)
MCC_ATMOS_RATE   = 80    # per month flat (everyone breathes the same air)
MCC_POWER_RATE   = 60    # × power_usage multiplier
MCC_WATER_RATE   = 40    # × water_usage multiplier
MCC_HABITAT_RATE = 80    # × habitat_size multiplier
MCC_COMMS_RATE   = 20    # flat per month
MCC_AI_HEALTH    = 20    # flat per month
# Total for average citizen (all multipliers = 1.0): 300 S ≈ 30% of UBI
# Target is ~20% so tune these constants as needed after testing
```

### New function: `calculate_mcc_bill(citizen)`
```python
def calculate_mcc_bill(citizen):
    """Return itemised MCC bill dict and total for this citizen."""
    bill = {
        "Atmospheric Processing": MCC_ATMOS_RATE,
        "Power":    round(MCC_POWER_RATE   * citizen.power_usage,   2),
        "Water":    round(MCC_WATER_RATE   * citizen.water_usage,   2),
        "Habitat":  round(MCC_HABITAT_RATE * citizen.habitat_size,  2),
        "Communications": MCC_COMMS_RATE,
        "AI Diagnostics": MCC_AI_HEALTH,
    }
    return bill, sum(bill.values())
```

### Replace MCC monthly revenue block
Replace the current flat MCC revenue calculation with:
```python
if mcc.alive:
    total_mcc_rev = 0
    for p in people:
        bill, total = calculate_mcc_bill(p)
        # Citizen pays from their spend_budget (already calculated above)
        # Cap bill at citizen's available S-tokens to prevent negative balances
        actual_bill = min(total, p.current_s_balance)  # see note below
        mcc.s_buffer += actual_bill
        total_mcc_rev += actual_bill
        # Log as transaction (one per citizen per month — batch append)
        txn_batch.append((year, month_of_year, p.id, mcc.id,
                         "MCC Bill", round(actual_bill, 2), "mcc_bill"))
    mcc.annual_revenue += total_mcc_rev
    mcc.infra_health = max(0.30, mcc.infra_health - 0.002)
```

**Note on citizen S-balance tracking:** Add `current_s_balance: float = 0.0`
to Citizen dataclass. At the start of each month set it to UBI (1000). Deduct
as citizen spends. MCC bill is deducted from this balance. This replaces the
current `spend_budget` local variable with a tracked attribute so MCC billing
can reference it.

### New DB table: `mcc_bills`
Add to `setup_db()`:
```sql
CREATE TABLE IF NOT EXISTS mcc_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id INTEGER,
    year INTEGER,
    month INTEGER,
    atmos REAL,
    power REAL,
    water REAL,
    habitat REAL,
    comms REAL,
    ai_health REAL,
    total REAL
);
CREATE INDEX IF NOT EXISTS idx_bills_citizen ON mcc_bills(citizen_id);
CREATE INDEX IF NOT EXISTS idx_bills_year ON mcc_bills(year, month);
```

Write bills to this table annually (sample month 6 of each year) to keep
DB size manageable — not every month for every citizen.

### Update citizen_snapshots table
Add columns `habitat_size`, `power_usage`, `water_usage`, `mcc_bill_total`
to the annual citizen snapshot so the dashboard can show consumption profiles.

Update the snap_batch append to include these fields.

---

## CHANGE 3 — simulate.py: Rename "mint" to "Fisc" throughout

Search and replace all references:
- Comments mentioning "mint" → "Fisc"
- Any string literals "mint" → "Fisc"
- Variable names if any reference mint explicitly

---

## CHANGE 4 — New file: `life.py` — Micro simulation / life story generator

This is a new standalone script in the same `mars/` folder.
It reads from the existing `colony.db` and generates a detailed life story
for a specific citizen or a user-defined persona.

### Two modes

**Mode A — Follow existing citizen from colony.db**
```
python life.py --citizen-id 42
```
Pulls all data for citizen 42 from the DB and renders their complete life story.

**Mode B — Generate persona**
```
python life.py --name "Dave" --occupation engineering --arrival-year 15 --age 32
```
Creates a synthetic citizen, inserts them into the colony at the specified year,
runs their personal simulation forward using colony.db for context (MCC bills,
company health, etc), and generates their life story.

### Occupation archetypes (for Mode B)
```python
ARCHETYPES = {
    "engineering":   {"sector": "manufacturing", "base_equity": 0.15, "s_income": 200},
    "medical":       {"sector": "health",         "base_equity": 0.20, "s_income": 250},
    "entertainment": {"sector": "entertainment",  "base_equity": 0.10, "s_income": 100},
    "mining":        {"sector": "mining",         "base_equity": 0.25, "s_income": 150},
    "farming":       {"sector": "food_premium",   "base_equity": 0.20, "s_income": 120},
    "merchant":      {"sector": "commerce",       "base_equity": 0.15, "s_income": 180},
    "teacher":       {"sector": "education",      "base_equity": 0.10, "s_income": 80},
    "builder":       {"sector": "construction",   "base_equity": 0.20, "s_income": 160},
    "administrator": {"sector": "professional",   "base_equity": 0.12, "s_income": 100},
}
```

### Life story data model
For each month of the citizen's life, track:
```python
@dataclass
class LifeMonth:
    year: int
    month: int
    age: float
    ubi_received: float        # always 1000
    mcc_bill: float            # from calculate_mcc_bill()
    s_spent: float             # on goods and services
    v_saved: float             # converted this month
    dividend_received: float   # V-tokens from equity
    v_balance: float           # cumulative V-token total
    s_balance_eom: float       # S-tokens at month end (before expiry)
    events: list               # significant events this month
```

### Life events to detect and record
- First month (arrival)
- Equity stake acquired or increased
- Large dividend received (>100 V-tokens in a month)
- V-token milestone crossed (1,000 / 5,000 / 10,000 / 50,000)
- V-token redemption (spending savings)
- Crisis month (MCC bill spikes due to infra degradation)
- Retirement (age 65+)
- Death (final month)

### Output format
Print a structured life story to stdout. Example:

```
═══════════════════════════════════════════════════
LIFE STORY: Dave Chen
Engineering Manager · Arrived Year 15, Age 32
═══════════════════════════════════════════════════

YEAR 15 (Age 32-33)
  Month 1   Arrived in the colony. UBI: 1,000 S. MCC bill: 287 S.
            Joined the Engineering Guild with a 15% equity stake.
            First month discretionary balance: 713 S.
  Month 4   First dividend payment: 42 V-tokens.
  Month 12  Year end V-balance: 1,847 V-tokens.
            MCC bill averaged 291 S this year (29.1% of UBI).

YEAR 20 (Age 37-38)
  Month 3   V-token milestone: 5,000 V-tokens accumulated.
  Month 7   Large dividend: 312 V-tokens (Engineering Guild strong month).
  Month 11  Crisis: dome seal repair — MCC bill spiked to 480 S this month.

YEAR 45 (Age 62-63)
  Month 2   Approaching retirement. Equity stake now 23% after 30 years.
  Month 9   V-token milestone: 50,000 V-tokens.

YEAR 47 (Age 64)  — FINAL YEAR
  Month 4   Dave died aged 64. V-tokens (52,340) and equity (23%) passed
            to registered next of kin.

SUMMARY
  Life span:          32 years in colony (Year 15 – Year 47)
  Peak V-balance:     52,340 V-tokens
  Total dividends:    38,420 V-tokens received
  Total MCC paid:     131,040 S-tokens across lifetime
  Avg MCC bill:       ~341 S/month (34% of UBI)
  Final equity stake: 23% in Engineering Guild
═══════════════════════════════════════════════════
```

### API endpoint for life story (add to server.py)

```python
@app.route("/api/life/<int:citizen_id>")
def life_story(citizen_id):
    """Full month-by-month life story for a citizen."""
    # Pull citizen basic info
    # Pull all citizen_snapshots ordered by year, month
    # Pull all transactions for this citizen ordered by year, month
    # Pull all dividend payments for this citizen
    # Return structured JSON suitable for dashboard rendering
```

---

## CHANGE 5 — dashboard.html: Life Story tab

Add a new nav item "Life Story" with icon 🧬.

### Tab content
Two sub-modes selectable at top:

**"Follow a citizen"** — search box (reuse existing citizen search API).
User types a name, selects from results, clicks "Show Life Story".

**"Create a persona"** — form with fields:
- Name (text input)
- Occupation (dropdown of archetypes)
- Arrival year (number, 1-190)
- Starting age (number, 18-45)
- Disposition (dropdown: Cautious Saver / Balanced / Entrepreneur)

On submit, calls `GET /api/life/persona?name=Dave&occupation=engineering&year=15&age=32&disposition=balanced`

### Life story display
A vertical timeline. Each year is a collapsible row.
Expanded year shows month-by-month detail.
Key metrics shown at top:
- Total V-tokens accumulated
- Peak V-balance
- Total dividends received
- Lifetime MCC costs
- Final equity positions

Charts (using the existing miniChart helper):
- V-token balance over life
- Monthly dividend income over life
- MCC bill over life (shows spikes during crises)

---

## CHANGE 6 — server.py: New API endpoints

### `/api/life/<int:citizen_id>` (GET)
Returns full month-by-month life data for a citizen from colony.db.
Joins citizen_snapshots + transactions for that citizen_id.
Groups transactions by year/month.
Returns:
```json
{
  "citizen": {...},
  "months": [
    {
      "year": 1, "month": 3, "age": 18.2,
      "v_balance": 420.0,
      "mcc_bill": 287.0,
      "dividends": 42.0,
      "purchases": 380.0,
      "events": ["First dividend payment"]
    }
  ],
  "summary": {
    "total_dividends": 38420,
    "total_mcc_paid": 131040,
    "peak_v_balance": 52340,
    "final_equity": {"Engineering Guild": 0.23}
  }
}
```

### `/api/life/persona` (GET)
Runs a lightweight synthetic life simulation for the given parameters.
Does NOT write to colony.db — runs in memory only.
Uses colony.db for context:
- Reads MCC infra_health by year to affect billing spikes
- Reads active companies in arrival year to determine which company to join
- Uses actual annual_summaries for colony GDP context

Returns same JSON structure as `/api/life/<citizen_id>`.

### `/api/citizen/<int:cid>/family` (GET)
Returns the citizen plus any citizens who share equity stakes in the same
companies, or who received inheritance from this citizen.
Useful for building family/group views.

---

## CHANGE 7 — dashboard.html: MCC billing charts

In the existing MCC tab, add:
- Average citizen MCC bill per year (line chart over 200 years)
- Distribution of MCC bills in selected year (bar chart showing low/med/high consumers)
- MCC bill as % of UBI over time

In the existing Citizens tab, add to each citizen card:
- Small habitat/power/water icons showing their consumption profile
- Their average monthly MCC bill

In the citizen detail view (showCitizen), add:
- MCC bill history chart (annual average)
- Consumption profile breakdown

---

## IMPLEMENTATION ORDER

Claude Code should implement in this order to avoid dependency issues:

1. **simulate.py changes** (Changes 1, 2, 3) — the DB schema changes must come first
2. **Delete colony.db** and re-run simulate.py to populate with new data
3. **server.py changes** (Change 6) — new API endpoints
4. **life.py** (Change 4) — standalone script
5. **dashboard.html changes** (Changes 5, 7) — frontend last

---

## IMPORTANT NOTES FOR CLAUDE CODE

- The existing DB schema has `gini` column in `annual_summaries` — keep it even though the dashboard no longer shows it
- The `company_snapshots` table exists in schema but is not actively written to — leave as-is
- Performance matters — the simulation must complete in under 5 minutes. Monthly dividends increase processing per month but the removal of annual complexity roughly balances it
- All batch write patterns must be preserved — no individual cursor.execute calls inside the main month loop
- The `people_lookup` and `co_lookup` dicts must be kept in sync when new citizens/companies are added
- `life.py` should work even if colony.db doesn't exist yet — print a helpful error message
- The persona simulation in `/api/life/persona` must be fast (under 2 seconds) — it runs synchronously in Flask

---

## FILE LOCATIONS

All files live in the same directory (the `mars/` folder):
- `simulate.py` — modify in place
- `server.py` — modify in place  
- `dashboard.html` — modify in place
- `life.py` — create new
- `colony.db` — delete and regenerate after simulate.py changes
