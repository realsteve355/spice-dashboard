# The MAC — market-access model (redesign)

*Captured 30 Jun 2026. This supersedes the per-firm transaction formula as the
**launch** mechanism. It records a long redesign that started from "how do you
charge the MAC to firms that don't transact through the Fisc" and ended at a
different shape entirely: the MAC as a market-access charge, levied at the point
of final sale, with the per-firm chain version as the mature/networked end-state.*

Companion notes: `MAC-methodology.md` (the original per-transaction formula),
`MAC-collection-vat.md` (the VAT-style collection attempt), `naics-sectors.md`
(the whole-economy base), `tax-treatment.md` (tax + gross-up).

---

## 1. What broke the original formula

The canonical formula was `MAC = k × transaction value × (profit ÷ employees)`,
k set so total MAC = total UBI. Two faults, both from the `profit ÷ employees`
weighting:

1. **It disincentivises automation.** The leaner you run, the higher your rate —
   structurally a robot tax. It makes the marginal decision to automate worse,
   when automation is the engine of the abundance the whole project is for. The
   funding tool fought the thesis.
2. **It passes through.** Collected on transactions, it rides prices down the
   chain to whoever has least pricing power — usually the consumer. The charge
   meant for Apple lands on the citizen.

## 2. The constraint we proved (not a failure — a property)

Attempts to collect per-firm value-added at colony scale all failed for one
reason:

- You can't trace supply chains, and firms won't voluntarily register.
- Value-added is a **firm-over-a-period** quantity (Apple buys a machine; its
  cost spreads over many products and years) — it does **not** exist at the level
  of a single sale, so you can't apportion it per product.

> **The per-firm value-added MAC is irreducibly firm-level, period-level and
> system-wide.** It can't be collapsed to a per-sale charge, and it can't run on a
> slice of the economy (the chain crosses the colony boundary). There is no
> colony-scale version of it. It is a *national* mechanism.

And Axion cannot start national. So the launch mechanism has to be something else.

## 3. The model that resolves it

Four ideas, together, invert the problem — the bootstrap becomes a feature.

### 3a. UBI ramps from welfare level to basket level
You don't owe a basket UBI on day one. UBI starts at **welfare-replacement level**
and ramps to the **full basket** over ~20 years, tracking automation.

- This couples funding **need** to funding **capacity**: both are driven by the
  same variable (how far automation has gone), so the need never outruns capacity.
- It's also a safety interlock: set UBI at average salary too early and low-wage
  workers quit **before** automation can replace their output → shortage, not
  abundance. UBI can only rise as fast as automation actually frees real capacity.

### 3b. The MAC is literally a *market-access* charge
Without paying it, a company **cannot do business in the colony — regardless of
where it sits in the supply chain.** Access to the market (the colony's residents
and their purchasing power) is the thing being sold, and the MAC is its price.
This is the enforcement lever a colony actually holds: it controls its own market
(the Mond rail), even though it can't legislate over San Francisco.

### 3c. The inflection point
Somewhere in the 20 years, paying the MAC flips from optional to existential:

- Early, the colony is one county of 390k — a firm can skip it and lose little.
  The access threat is weak; enforcement bites only on **local** firms, which are
  captive to the local market and can't flee it.
- In **abundance mode**, wages → 0, so the **UBI is the only purchasing power left**.
  The MAC funds the UBI. So **the MAC-funded UBI *is* the market.** A firm that
  won't pay isn't dodging a tax — it's defunding the only demand its customers
  have. Underfund the MAC and the whole economy seizes from underconsumption.

So past the inflection, market access is irresistible, and the flywheel is
self-sustaining: the community funds demand (UBI) ← the MAC ← access to that demand.
The MAC is the **circulatory system of an abundance economy**, not a parasite on it.

### 3d. k is computable from public data
Profit and headcount of public companies are published. So the colony can compute
**k for every company** itself, with no cooperation, and publish what each owes —
turning "they won't file" into "we already know."

## 4. Who pays the MAC, to whom, and how much

The destination principle, with the colony's till as the point of collection.

**Mature/networked state** (firms have Fiscs): each firm pays the MAC on its **own
sales, to its own local Fisc, once** — never apportioned to a downstream sale.
Paying clears its value for sale anywhere in Axion. Value made inside Axion is
taxed where it's made; imported value is taxed at the **destination border**. This
is exactly how VAT treats domestic vs. imported value — charged once, to one Fisc.

**Launch / lone-colony state** (nobody upstream has a Fisc — the chain is San
Francisco, Cupertino, Taiwan): the MAC can only be levied where the colony has a
hold — **the final sale at the colony's till.** So:

- An upstream supplier (e.g. a San Francisco legal consultant selling to Apple)
  **pays no one and needs no Fisc.** He is never the colony's counterparty.
- His value is caught **downstream**, at the till, attributed to the **brand**: the
  finished product is charged at the **brand's public k** on its imported value.
  *Apple owns its product's market access; the consultant is Apple's commercial
  problem, not the colony's.*
- Plus the **local final seller's** own margin, charged at **its** k (that firm is
  in the colony — enforceable).

So a product's till-charge ≈

> **k(brand) × (imported value)  +  k(local seller) × (its margin)**

One knowable k for the import, one for the local slice. No chain, no apportionment,
nobody-with-no-Fisc to chase.

**The approximation, stated honestly:** upstream value is charged at the *brand's*
k, not each upstream firm's own k — the brand's automation level stands in for its
whole supply chain. That's the price of not having the chain. It still captures the
thing that matters (the brand's automation, at the till, computably).

## 5. How the two states connect (the ramp, cash side)

It's one mechanism at different network sizes:

- **Early:** almost the whole chain is outside Axion, so the colony's till charge
  (brand's k on imports + local margin) carries it, funding a small welfare-level
  UBI mostly off local firms.
- **Late:** as Axion spreads and firms come on-rail (because market access is now
  worth it), each pays its **own** home Fisc and its value arrives **pre-cleared**,
  so the destination border charge shrinks to the genuinely-foreign slice. The
  brand's-k approximation is progressively replaced by each firm's real k.

**Same total MAC on a product — the collection point migrates from "all at the
colony till" to "spread up the chain" as the network grows.** Enforcement strength,
base coverage, and UBI level all rise on the same curve.

## 6. Open questions / next work

1. **The coupling rule** — what exactly ties the UBI level each year to automation /
   MAC capacity, so the two ramps stay locked? (This is essentially the simulation
   already being built.)
2. **The inflection timing** — at what automation level / network size does "pay or
   no market" flip from toothless to decisive? Worth locating; it's when the model
   becomes self-sustaining.
3. **The pre-inflection bridge** — is the local-firm MAC enough to carry a
   welfare-level UBI alone, or does something seed it early (e.g. government's
   redirected welfare budget — the "carrot": government sheds welfare cost, keeps
   its tax base, gains local activity)?
4. **The brand attribution rule** — how to assign a product to a responsible brand /
   importer, and how to value its "imported value" at the till (gross margins,
   teardowns, a product/SKU table).
5. **k definition** — the `profit ÷ employees` weighting caused the original
   automation-disincentive. Decide what k is measured on before it's re-used.
6. Rework `/mac-y20`, `/mac-national`, `/calibration` off the old consumer-slice +
   per-firm-dial framing onto this model.
