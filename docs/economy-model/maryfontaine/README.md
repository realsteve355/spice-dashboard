# MaryFontaine simulator

Transaction-level simulation of the MaryFontaine Earth colony per
[`../../maryfontaine_simulator_design.md`](../../maryfontaine_simulator_design.md) (spec v2,
2 May 2026).

## Build status — Phase 1: Foundation

- [x] Schema (`schema.sql`) — citizens, households, companies, equity_holdings, wallets,
      transactions, fisc_state, basket_categories, external_environment, citizen_snapshots,
      company_snapshots, archetype_history, unmet_demand, annual_summaries, run_metadata
- [x] Scenario engine (`scenarios.py`) — six scenarios pre-computed to per-month per-category
      USD price arrays (AI Realist, AI Optimist, Stagflation, AI+Healthcare, Transition,
      Transition+Honda-shock); deterministic by default; optional Gaussian monthly noise
- [x] Founding data generator (`generate_founding.py`) — instantiates colony at month 0
      from parameters; 3,900 citizens / 2,200 households / 285 companies at 10% scale
- [x] Validator (`validate.py`) — 8 sanity checks against the generated DB
- [ ] Monthly tick (`tick.py`) — Phase 2
- [ ] Lifecycle dynamics (births, deaths, founding, failure) — Phase 3
- [ ] Flask dashboard — Phase 4
- [ ] End-to-end runs across all six scenarios — Phase 5

## Run

```bash
# Generate founding data at 10% scale, deterministic
python docs/economy-model/maryfontaine/generate_founding.py --db mf.db --seed 42

# Validate
python docs/economy-model/maryfontaine/validate.py --db mf.db

# Inspect a scenario trajectory
python docs/economy-model/maryfontaine/scenarios.py --scenario transition
python docs/economy-model/maryfontaine/scenarios.py --scenario ai_realist --out ai_realist.csv
```

## Spec contradictions resolved during Phase 1

1. **Founding S supply** *(resolved by Steve, 2 May 2026)*. Spec §3 states both "Total S supply:
   0 (gets minted via UBI starting month 1)" *and* "Each company at founding has Initial S balance
   (working capital, ~1 month of operating costs)." These contradict. **Resolution: companies
   inherit working capital from the pre-colony environment.** The S held by companies at founding
   represents the dollar value of pre-colony assets (cash, inventory, capital) brought into the
   colony economy at founding and converted to S at the parity rate. The Fisc's USDC reserve does
   not back this S directly — it backs the post-founding S supply growth. At 10% scale the founding
   company-held S is ~$2.5M, against a $5M Fisc reserve (2:1 at parity), comfortably solvent.
   The "Total S supply: 0" line in the original spec referred to citizen-held S only.

2. **Household count** *(resolved by Steve, 2 May 2026 — "1,500 or whatever makes sense")*.
   Spec §3 specifies 1,500 households at 10% scale, but the archetype distribution implies
   ~3,000 adults, which cannot all fit in 1,500 households of the spec'd composition mix
   (avg 1.53 adults/household × 1,500 = 2,300 adults, not 3,000). **Resolution: generator allows
   households to drift to ~2,200 to absorb the actual adult count.** Primary effect is more
   `single_adult` households than spec suggests; rent and basket flows scale with household count
   so the macro behaviour is unchanged. Steve's framing: scale true MaryFontaine numbers back to
   something manageable now; tune up once the model is useful.

## Stdlib only

Phase 1 uses only the Python stdlib (sqlite3, random, math, dataclasses, argparse, csv).
No numpy / pandas / scipy. Reasoning: keeps the simulator portable, reproducible,
and easy to read. If Phase 2 or 5 need vectorised performance for a large run we can
add numpy as a dependency then.

## Where this fits

- **Mars sim** (`../model.py`): existing 24-month deterministic illustrative model. Stays as-is.
- **MaryFontaine sim** (this directory): the credibility-grade Earth simulation. 10-year
  transaction-level. Built fresh; does not extend `model.py`.
- **Future Simple Colony sim**: Mars-style closed-economy simulator (university campus / religious
  community scale). Will share schema + scenario patterns from here. Not started.
