# MAC redesign — session checkpoint (1 Jul 2026)

Resume point. Full design in `docs/MAC-market-access-model.md`.

## Decisions LOCKED
- **Retail (in-colony):** keep the formula unchanged — **MAC = k × transaction value
  × (profit ÷ employees)**. One tunable number k, set so all charges in the area
  sum to the UBI. ("base" was a mis-wording; there is no base. Per-firm variation
  comes only from profit/employees. Flat-k was considered and **rejected**.)
- **Automation disincentive:** acknowledged but **deliberately ignored** — the MAC is
  framed as *a customer charging a potential supplier for participation in the market*.
- **MAC = market-access charge:** no payment, no business in the colony, wherever a
  firm sits in the chain. Enforced because the colony owns its market (Mond rail).
- **UBI = three phases:** Welfare mode → Inflection → UBI mode. Built into `/ubi`
  (see below). Welfare floor = **$12k/adult** (US SSI basis), child at half.
  Government keeps the welfare it no longer pays = the adoption carrot.
- **Who pays whom (destination principle):** each firm pays its own local Fisc on its
  own sales, once, never apportioned; imports caught at the destination border. Lone
  colony (nobody upstream has a Fisc): levy at the till only.

## BUILT this session
- `/ubi` page rebuilt to three phases (`public/static/ubi.js` + dev copy synced):
  flat $12k/adult welfare floor to the **2036 inflection**, then linear ramp to the
  **$31,200 basket by 2046**. Bill: $0.14B (2026) → $1.33B (2036) → $7.56B (2046).
  Committed + pushed.
- Docs written + pushed: `MAC-market-access-model.md`, `MAC-collection-vat.md`,
  `naics-sectors.md` (whole-economy base + scope-fix), `tax-treatment.md`.

## OPEN — next session
1. **B2B k** — e.g. law firm → Apple. Same formula, **different k** (their sales span
   many areas). MAC → a **B2B Fisc** → forwarded to area Fiscs **pro rata**. k formula
   TBD (candidate: their total sales ÷ total UBI across all areas). NOT YET WORKED OUT.
2. **Inflection-year formula** — currently a fixed 2036 placeholder. Definition agreed:
   "the flip when a firm's gain from Axion's UBI-funded demand outweighs the MAC it
   pays." Needs to become a formula (drivers: network spread × wage displacement).
3. **UBI ramp-shape formula** — currently linear welfare→basket. Needs a real formula
   (governed by displacement + MAC capacity each year).
4. **Rework `/mac-y20`, `/mac-national`, `/calibration`** — still tell the old
   consumer-slice + per-firm-dial story; supersede onto this model.

## Key numbers
- Midwestville = 390k (240k working-age, 90k children, 60k retired).
- Basket $31,200/adult/yr, child 50%. Welfare floor $12k/adult. Gross-up ≈ ×1.13.
- Unemployment ramp 4.2% → 85% over 2026–2046 (39% at the 2036 inflection).
