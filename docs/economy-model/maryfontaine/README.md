# MaryFontaine simulator

Transaction-level simulation of the MaryFontaine Earth colony per
[`../../maryfontaine_simulator_design.md`](../../maryfontaine_simulator_design.md) (spec v2,
2 May 2026).

## Build status — Phase 1: Foundation

- [x] Schema (`schema.sql`) — citizens, households, companies, equity_holdings, wallets,
      transactions, fisc_state, basket_categories, external_environment, citizen_snapshots,
      company_snapshots, archetype_history, unmet_demand, annual_summaries, run_metadata
- [x] Scenario engine (`scenarios.py`) — six scenarios pre-computed to per-month per-category
      USD price arrays (AI Realist, AI Optimist, Stagflation, AI+Healthcare, Convulsion,
      Convulsion+Honda-shock); deterministic by default; optional Gaussian monthly noise
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
python docs/economy-model/maryfontaine/scenarios.py --scenario convulsion
python docs/economy-model/maryfontaine/scenarios.py --scenario ai_realist --out ai_realist.csv
```

## Spec contradictions resolved during Phase 1

1. **Founding S supply.** Spec §3 states both "Total S supply: 0 (gets minted via UBI starting
   month 1)" *and* "Each company at founding has Initial S balance (working capital, ~1 month
   of operating costs)." These contradict. Resolution: companies start with working capital
   (~40% of `max_revenue_per_month_s`); founding S supply at 10% scale is ~$2.5M of S held by
   companies. This represents the initial capitalisation of the colony from external sources
   prior to month 1. The Fisc's $5M USDC reserve at 10% scale covers this 2:1 at parity.
   Documented in `validate.py` output. v2 may make this an explicit `founding_capitalisation`
   transaction type for auditability.

2. **Household count.** Spec §3 specifies 1,500 households at 10% scale, but the archetype
   distribution implies ~3,000 adults — yielding ~2,000 households even with maximum couple
   pairing. Resolution: generator allows households to drift above 1,500; primary effect is
   slightly more `single_adult` households than spec suggests. Validation tolerates this.

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
