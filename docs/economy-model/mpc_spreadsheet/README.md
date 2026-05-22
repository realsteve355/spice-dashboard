# MPC spreadsheet starter pack

Calibration data for thinking about the Market Participation Charge in the
Maryfontaine model (39,000 people, ~15,000 households).

Generated 22 May 2026 from `docs/economy-model/maryfontaine/external_suppliers.py`.

## Files

| File | Contents |
|---|---|
| `maryfontaine_headlines.csv` | Population, households, citizens, businesses, transactions, UBI obligation, Fisc reserve — one-page headline summary |
| `external_companies.csv` | 105 named external firms — employees, profit-per-employee, total firm profit, annual revenue to Maryfontaine |
| `external_by_sector.csv` | Same data rolled up by sector (~20 rows) — sum employees, sum profit, sum MF revenue, avg P/emp |
| `transactions_per_business.csv` | Per sector: txs/HH/month, total colony monthly txs, # firms (named + long-tail estimate), avg txs and revenue per firm |
| `mpc_calc_per_company.csv` | Per-firm MPC at flat 5% vs progressive (k=0.05, threshold $80k P/emp, exponent 1.5, capped at 25%) |

## Key numbers at default settings

- Modelled external outflow: **$134.6M/year** (sample, ~17% of realistic $750–900M)
- MPC collected at 5% flat: **$6.7M/year**
- MPC collected progressive: **$10.5M/year**
- Maryfontaine UBI obligation at 100 MOND/citizen/month: **47M MOND/year**
  - At $1/MOND parity, flat MPC covers ~14% of UBI; progressive ~22%
  - This is the **sampled tip** of external revenue — the real number with long-tail included would be 5–6× larger

## Where the gap is

The 105-firm dataset captures the named brands (Walmart, Amazon, OpenAI, Honda, etc.).
What's missing — and what dominates a real town's outflow — is the long tail:

- Independent restaurants, hairdressers, plumbers, contractors
- Local grocery stores, gas stations, dry cleaners
- Small medical practices, dentists, vets
- Independent repair shops

US Census Business Patterns suggests **~6.5 firms per 100 people** at the local level,
which means ~2,500 independent small businesses serving Maryfontaine. These have
**low profit-per-employee** ($30–60k typical), so progressive MPC barely touches them —
but a flat MPC would draw heavily from them and could hurt local businesses.

This is the central MPC design question: **flat (broad-base, includes locals)
vs. progressive (only the most-automated firms pay)**.

## A caveat on sector averages

`transactions_per_business.csv` shows the **average** txs/firm/month within
each sector. This hides huge concentration: Walmart probably handles 30,000+
grocery transactions/month from Maryfontaine while a local independent
grocer handles 200. Use the averages as a rough sanity-check, not as a
basis for per-firm calculations.

For the MPC calculation, what matters is the **total revenue × MPC rate**,
not the per-firm number. The per-firm count is only useful for visualising
the burden distribution: "Walmart pays X, the local café pays Y".

## How to extend

1. Add long-tail rows to `external_companies.csv` for sectors that are under-represented.
   Useful starting buckets: independent restaurants (~50 firms, ~$50k P/emp, ~$500k MF rev each), independent retail (~80, $30k P/emp, ~$300k rev each), local services (~150, $40k P/emp, ~$200k rev each).
2. Re-run `mpc_calc_per_company.csv` after editing by regenerating from the Python script in `docs/economy-model/maryfontaine/external_suppliers.py`.
3. For sensitivity analysis: vary `k`, `p_threshold`, `cap` in the progressive formula and see how MPC yield changes.
