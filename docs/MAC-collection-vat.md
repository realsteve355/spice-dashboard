# How the MAC is collected — the VAT model

*Captured 30 Jun 2026. Resolves "how do you charge the MAC to firms whose
transactions don't pass through the Fisc" (e.g. Apple selling an iPhone via
Walmart; Samsung importing). Conclusion: per-firm sign-up + supply-chain tracing
is unworkable; the MAC must be collected VAT-style. This note is how.*

## Why per-firm collection fails
- Businesses won't voluntarily register and file MAC returns (a colony can't
  compel Apple the way a national VAT authority can).
- Nobody can decompose a product into its embedded firms — we don't know what's
  "inside" an iPhone or who added what value.

So the charge can't be assessed per firm along a traced chain.

## The model that works: a differentiated VAT
1. **Collected at the final sale** to the resident — the point where money already
   moves through the Fisc in Mond. The seller (e.g. Walmart) applies it; nothing
   upstream has to register. Same rails as VAT collection.
2. **Rated per product/sector category**, not per firm and not one flat rate. The
   Fisc sets a MAC rate for each category, calibrated to the **automation embedded
   in that category** — its profit-per-worker from the NAICS sector data.
   Electronics: high. Restaurant meals, haircuts, fresh food: low.
3. **Calibrated by k** — the whole set of category rates is scaled so the total
   collected equals the UBI.

The per-transaction formula survives:
> **MAC = rate × sale value**, where **rate ≈ k × (the category's profit-per-worker)**

— but profit-per-worker is taken at the **category** level, not the individual
seller's.

## Worked: the iPhone
- An iPhone is an **electronics** purchase → it carries the high electronics rate,
  applied at the Walmart till.
- That rate reflects the **category's** automation (Apple, Samsung, the whole
  automated-electronics chain), **regardless of who sells it or where it was made.**
- A $1,000 restaurant meal carries the low hospitality rate instead.

So Apple's automation is captured — at the category level — **without ever touching
Apple.** Walmart applies "electronics rate" the way it already applies sales tax.

## What it solves
- **No sign-up** — only the final seller (already in the Fisc) does anything.
- **No chain tracing** — the category rate embeds the typical chain; products are
  never decomposed.
- **Imports handled for free** — a Samsung phone sold here is an electronics sale at
  the till; the rate doesn't care where it was made. No separate import-tax regime.
- **Channel-neutral** — direct or via Walmart, an iPhone is "electronics" either
  way, so the transfer-pricing / channel-gaming problem disappears.

## What it costs
- **Per-firm precision is lost.** Apple, Samsung and a sleepy electronics maker all
  pay the same electronics rate. Targeting is now *which kind of product*, not
  *which firm*. This is the price of a runnable mechanism.

## The one consequence to model
Collected at the till, the MAC behaves like VAT in **incidence**: for high-automation
goods it is partly absorbed by fat-margin producers (the intent) and partly in the
price (consumers). The price component feeds the **price → basket → UBI** loop
(higher prices → bigger basket → bigger UBI). Manageable (VAT economies index for
it), but it must be in the model.

## Government as a carrot (adoption)
Government is a **net winner** under Axion, which makes it a **carrot** for adoption,
not an obstacle:
- The MAC is **separate from and on top of** existing taxes — local services (trash,
  schools, police) keep being funded as now.
- The UBI **takes load off welfare budgets** (mostly federal/state — SNAP, Medicaid,
  TANF; some local) **without government funding it** — the MAC does.
- A community with a basic income **spends more**, raising local sales and property
  tax revenue.
- Local taxes are themselves payment-for-services; those continue. Government keeps
  its tax base, sheds welfare cost, and sees more activity.

So pitch government adoption on the **fiscal win**: lower welfare spend + more
local economic activity, at no cost to their budgets.

## Open / next
- Set the category rate schedule from NAICS automation (profit-per-worker) data.
- Model the price → basket → UBI feedback (how much of the MAC lands in prices).
- Decide the category granularity (NAICS sectors? a consumer-facing category map?).
