# Categorical basket — research findings (8 May 2026)

Underpinning data for replacing the trajectory sim's single
`basket_decline_pct` slider with a per-category model.

## Productivity uplift estimates (full range)

| Source | Estimate | Notes |
|---|---|---|
| Acemoglu (NBER w32487, 2024) | 0.53–0.66% TFP over 10 years | Very sceptical. Only 20% of US labour tasks exposed to AI; even fewer profitably automatable |
| McKinsey MGI (2023) | 0.1–0.6%/yr from gen AI alone | Plus 0.2–3.3 ppt/yr from broader automation |
| McKinsey MGI (2023) | $2.6–4.4T/yr in global corp profits | 75% concentrated in customer ops, marketing/sales, software eng, R&D |
| McKinsey MGI (2023) | 60–70% of work activities theoretically automatable | Theoretical ceiling, not realised |

Implication: there's a wide range. Acemoglu floor (0.05%/yr) vs McKinsey ceiling (3.9 ppt/yr). The truth is probably non-uniform across sectors and SPICE colonies will land somewhere in between — but the right move is sector-specific deflation rates rather than a single number.

## Wright's Law / experience curves (price decline per doubling of cumulative production)

| Technology | Learning rate | Recent rate |
|---|---|---|
| Solar PV | 20%/doubling (40+ years) | accelerating |
| Lithium-ion batteries | 18%/doubling historically | 35%/doubling recently |
| Semiconductors | 20–30%/doubling | (per BCG analysis from 1966) |
| Wind power | 15%/doubling | slower |

Production typically doubles every 2–4 years in growing tech sectors → ~5–15%/yr nominal price decline for these categories.

## BLS CPI categorical data (US historical)

| Category | All-time avg annual change | Recent (2024–26) |
|---|---|---|
| Apparel | +1.98%/yr | **−0.5%/yr** (deflating) |
| Housing | +4.23%/yr | sticky high |
| Medical care | +4.56%/yr | +1.93%/yr (slowing) |
| Other goods/services | +4.92%/yr | high |
| Computers | **−16%/yr** (1990–2005) | −11%/yr (2001–2005) |
| Telephone hardware/calculators | **−4%/yr** (1998–2017) | continues |
| Used cars/trucks | volatile; **−3%/yr** (early 2026) | normalising after 2021 spike |

Pattern: anything with strong technology content has been deflating for decades (computers, phones, electronics). Service categories (housing, medical, education) inflating. Apparel transitioning from inflation to deflation.

## Land prices (Knoll/Schularick/Steger, 2017)

* 14 advanced economies, 1870–2012 (140 years)
* Real house prices essentially **constant 1870 → 1950**
* Strong rise post-1950
* **80% of the post-WWII house-price boom is LAND value, not construction cost**

Implication for SPICE: confirms Steve's thesis. Land is the structural inflationary force. Structures (the building on the land) follow a deflation trajectory similar to manufactured goods. Land is anti-deflationary because supply is fixed.

## AI in healthcare specifically

* 5–10% savings of US healthcare spend potentially achievable = $200–360B/yr
* Drug discovery: significant productivity gains
* Diagnostic imaging: AI matches or exceeds radiologists, reduces unnecessary procedures
* But aging demographics counter the productivity gains

Best estimate: AI could bring healthcare from +4.56%/yr to ~0–2%/yr inflation. Not deflation, but flatlining.

## Sources

- McKinsey MGI 2023 — [The economic potential of generative AI](https://www.mckinsey.com/featured-insights/mckinsey-live/webinars/the-economic-potential-of-generative-ai-the-next-productivity-frontier)
- Acemoglu 2024 — [The Simple Macroeconomics of AI (NBER w32487)](https://www.nber.org/papers/w32487)
- Knoll, Schularick & Steger 2017 — [No Price Like Home: Global House Prices, 1870–2012 (AER)](https://www.aeaweb.org/articles?id=10.1257%2Faer.20150501)
- BLS — [Long-term price trends for computers, TVs](https://www.bls.gov/opub/ted/2015/long-term-price-trends-for-computers-tvs-and-related-items.htm)
- BLS — [CPI category historical tables](https://www.bls.gov/cpi/)
- Our World in Data — [Learning curves / Wright's Law](https://ourworldindata.org/learning-curve)
- Nature — [Systematic review of AI cost-effectiveness in healthcare](https://www.nature.com/articles/s41746-025-01722-y)

---

## Proposed categorical model

Replace `basket_decline_pct` with this 11-category structure. Each category has:
- `share_pct` — share of today's $980 basket
- `base_inflation_pct` — annual nominal price change WITHOUT AI acceleration (BLS historical baseline)
- `ai_deflation_pct` — additional annual deflation from AI/automation
- `floor_pct_of_today` — physical price floor (as % of 2026 price)

Aggregate basket(year) = Σ share × max(floor, (1 + base + ai_def)^year) × 980

```
Category                    Share  Base infl  AI accel  Net      Floor  Notes
--------------------------------------------------------------------------------
Food (processed)             18%   +2.0%/yr   -3.0%/yr  -1.0%/yr  40%   Vertical farms, automated logistics
Food (fresh)                  6%   +2.5%/yr   -1.5%/yr  +1.0%/yr  60%   Land-bound, slower automation
Energy & utilities            8%   +3.0%/yr   -8.0%/yr  -5.0%/yr  15%   Solar/battery Wright curves
Transport                     8%   +2.5%/yr   -5.0%/yr  -2.5%/yr  30%   EVs + autonomous
Healthcare                    5%   +4.5%/yr   -4.0%/yr  +0.5%/yr  60%   AI offsets, aging keeps positive
Education                     3%   +3.0%/yr   -4.0%/yr  -1.0%/yr  30%   AI tutors, but networking value sticky
Services (hospitality, care)  6%   +3.0%/yr   -1.0%/yr  +2.0%/yr  90%   Slow automation, physical/emotional
Apparel & manufactured        7%   +1.0%/yr   -4.0%/yr  -3.0%/yr  30%   Already deflating
Digital/electronics/comms     4%   -5.0%/yr   -5.0%/yr -10.0%/yr   5%   Already deep deflation
Housing — STRUCTURE          15%   +1.5%/yr   -3.0%/yr  -1.5%/yr  40%   Construction automatable
Housing — LAND               20%   +5.0%/yr   +2.0%/yr  +7.0%/yr   ∞    RISES under abundance — Knoll-Schularick

Total share: 100%
```

Note shares: this is a renter's basket. Land + structure together = 35% of monthly outgoings (real US data). Single biggest line.

### Aggregate behaviour

Under defaults, basket trajectory looks like:
- 2026: $980 (every category at 100%)
- 2030: ~$870 (manufactured/electronics deflation, land already +28% on its share)
- 2040: ~$650 (most categories at floor, land at 1.97x its 2026 share)
- 2046: ~$580 (steady-state — land share now 50%+ of basket)

By 2046, **land alone exceeds 50% of the basket** even though most other categories have collapsed. This is the Steve thesis made arithmetic.

### What this changes about UBI affordability

The UBI obligation falls but slower than the simplistic 8%/yr basket decline. Around -4%/yr aggregate over the 20-year window. So UBI 2046 ≈ $640 × 1.10 × 40 = $25K/mo. Combined with margin expansion in the supplier side, the levy should cover it but with less margin than the 8% decline scenario. MS2 likely shifts from 2045 to ~2042.

### What this exposes

The land cost trajectory makes the company-equity story essential. By 2046, a UBI-only citizen pays ~50% of their basket toward land rent. The colony's job is providing routes (companies, S-token equity, Harberger land for those who can buy in) that compound faster than land does. Without those routes, the colony delivers UBI but hands citizens to a permanent landlord class.
