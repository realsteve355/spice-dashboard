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

## Next steps
1. Replace the first-pass figures above with BEA gross-output + Census employment +
   sector profit data.
2. Estimate the **in-area share** of each ◑ sector (how much of its sales land on
   buyers inside a colony).
3. Recompute the MAC base, k, and the per-sector distribution on this whole-economy
   footing — fixing the National page's scope fault.
