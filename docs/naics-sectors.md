# Whole-economy sector base (NAICS) — MAC foundation

*Drafted 29 Jun 2026. Replaces the 9 consumer-facing categories with the full
20-sector NAICS economy, so the MAC base = the whole economy, not the consumer
slice. Figures are FIRST-PASS US approximations (gross output / receipts,
employment, typical net margin) — to be replaced with BEA / Census data.*

## Fisc-applicability key
Whether the colony Fisc can apply the MAC — i.e. whether the sector's transactions
have a **buyer inside the area**, settled through Mond:
- **✓ direct-to-resident** — people in the area buy it → captured.
- **◑ business-to-business** — captured only on the share sold to *in-area*
  businesses; exports / sales to external firms are not visible to the Fisc.
- **✗ non-market / external** — government (tax-funded, not a sale) or pure export.

## The 20 sectors

| NAICS | Sector | ~US revenue | ~Employees | ~Net margin | Fisc-applicable |
|---|---|---|---|---|---|
| 11 | Agriculture, forestry, fishing | $0.5T | 2.6M | 8% | ◑ |
| 21 | Mining, oil & gas extraction | $0.7T | 0.6M | 15% | ◑ |
| 22 | Utilities | $0.5T | 0.6M | 12% | ✓ |
| 23 | Construction | $2.1T | 8.0M | 5% | ◑ (homes ✓ / infra ◑) |
| 31‑33 | Manufacturing | $7.0T | 13.0M | 8% | ◑ (mostly B2B / export) |
| 42 | Wholesale trade | $2.5T | 6.0M | 4% | ◑ |
| 44‑45 | Retail trade | $2.3T | 16.0M | 4% | ✓ |
| 48‑49 | Transportation & warehousing | $1.5T | 6.5M | 6% | ✓ / ◑ |
| 51 | Information (media, telecom, software) | $2.2T | 3.0M | 25% | ✓ |
| 52 | Finance & insurance | $5.0T | 6.6M | 20% | ✓ / ◑ |
| 53 | Real estate & rental/leasing | $2.5T | 2.5M | 25% | ✓ |
| 54 | Professional, scientific & technical | $3.5T | 10.0M | 12% | ◑ (mostly B2B) |
| 55 | Management of companies | $0.7T | 2.4M | 15% | ✗ / ◑ (internal) |
| 56 | Administrative & support / waste | $1.2T | 9.0M | 6% | ◑ |
| 61 | Educational services | $0.4T | 3.7M | 5% | ✓ |
| 62 | Health care & social assistance | $3.0T | 22.0M | 6% | ✓ |
| 71 | Arts, entertainment & recreation | $0.4T | 2.5M | 8% | ✓ |
| 72 | Accommodation & food services | $1.5T | 14.0M | 5% | ✓ |
| 81 | Other services | $1.0T | 6.0M | 7% | ✓ |
| 92 | Public administration (government) | $2.5T | 22.0M | — | ✗ (tax-funded) |

## How the old 9 categories map

| Old category (consumer view) | NAICS |
|---|---|
| Housing & real estate | 53 + part of 23 |
| Food — grocery & dining | part of 44‑45 + 72 |
| Transport, autos & travel | 48‑49 + part of 44‑45 |
| Healthcare & pharma | 62 |
| Retail goods & e-commerce | 44‑45 |
| Utilities & telecom | 22 + part of 51 |
| Digital and media | 51 |
| Financial services | 52 |
| Education & training | 61 |

The old 9 are the **✓ direct-to-resident** end. The new sectors added — Manufacturing,
Wholesale, Professional services, Mining, Agriculture, Admin services, Government —
are the **B2B / production / non-market** rest of the economy.

## The key consequence for the MAC base

Widening to all 20 NAICS sectors does **not** mean the whole economy is taxable by
one colony. The MAC can only reach **fisc-based transactions** — sales with a buyer
inside the area:
- The **✓** sectors are fully in the base (residents buy from them in Mond).
- The **◑** sectors (manufacturing, wholesale, professional, mining) are mostly
  **B2B and export** — a single colony's Fisc captures only the portion sold to
  in-area buyers, not the exports. This is the same reason a single colony can't
  capture national capital: much of the production economy transacts *outside* the
  area.
- The **✗** sectors (government, internal management) have no skimmable sale.

So the real MAC base for one colony ≈ all **✓** transactions + the **in-area share**
of the **◑** transactions. Quantifying that in-area share is the next modelling step
(and it's why the colony model and the national model differ: nationally, every
transaction is in *some* jurisdiction, so the ◑ exports are someone else's ✓).

## RESULT — the whole-economy base fixes the scope fault (29 Jun)

Applying the canonical MAC to the full NAICS market economy (all sectors except
government), year 20:

| | Consumer slice (9 sectors) | Whole economy (NAICS) |
|---|---|---|
| Transaction base | $11.3T | **$43.7T** |
| Average MAC rate | 66% of every sale | **17%** |
| Sectors charged > 100% of revenue | 3 of 9 | **0 of 19** |
| Highest sector | Digital, 577% | Real estate, **55%** |

The "impossible" charges were an artefact of the narrow base. On the whole economy
the formula works: ~17% average, nothing over 100%, real estate (highest
profit-per-worker) tops out at 55%. **The formula was right; the base was wrong.**

## In-area share (single-colony capture, first-pass)
National base uses ~100% of every market sector (every US transaction is in *some*
jurisdiction). A single colony multiplies each sector by its in-area share:

Agriculture 10% · Mining 10% · Utilities 100% · Construction 80% · Manufacturing
15% · Wholesale 20% · Retail 95% · Transport 60% · Information 80% · Finance 70% ·
Real estate 95% · Professional 30% · Mgmt 5% · Admin 40% · Education 95% ·
Health 95% · Arts 90% · Accommodation/food 95% · Other services 95% · Government 0%.

So one colony's base = Σ(sector revenue × in-area share) — far smaller than the
national $43.7T (manufacturing/wholesale/professional mostly export), which is why
a colony can't self-fund as cleanly as the nation.

## Next steps
1. Firm the figures with the actual BEA gross-output + Census/BLS employment tables
   (sources below) and a real per-sector profit measure.
2. Rebuild mac-data.js on the NAICS 20 (market) sectors and recompute the National
   page on this base — replacing the consumer-slice model that caused the scope fault.
3. Quantify the single-colony base (Σ revenue × in-area share) for the colony view.

## Sources
- BEA — Gross Output by Industry: https://www.bea.gov/data/industries/gross-output-by-industry
- BEA — GDP by Industry: https://www.bea.gov/itable/gdp-by-industry
- BLS — Industries by Supersector and NAICS: https://www.bls.gov/iag/tgs/iag_index_naics.htm
