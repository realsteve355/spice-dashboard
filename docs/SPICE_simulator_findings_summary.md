# SPICE Colony Economy Simulator — Findings Summary

**Date: 5 May 2026**
**Purpose: standalone document for design-level discussion with claude.ai about fundamental remodelling**

---

## 1. What the simulator does

A transaction-level simulation of the **MaryFontaine** colony — a hypothetical SPICE community modelled on a politically-merged Marysville + Bellefontaine, Ohio (~39,000 citizens; sim runs at 10% scale = 3,900 citizens). Built fresh in Python, stdlib-only, with a stdlib HTTP-server dashboard for interaction.

**The economy modelled:**
- Citizens hold S-token wallets, get UBI from the Fisc, receive dividends from companies they hold equity in, may receive external USD income (remote workers, retiree pensions)
- Companies hold S-token wallets, receive revenue from internal sales + exports, pay imports + MCC bills, distribute surplus to shareholders as dividend
- The Fisc holds USDC reserve, mints S for UBI + against external income, defends a basket peg (target = 28 S per basket), enforces a cover ratio (USDC reserve must cover 30% of S supply × current rate)
- 4-category basket: energy, food, hard goods, services (loosely modelled on US BLS CPI proportions)
- 6 scenarios driving external USD prices over a 10-year horizon: AI Realist, AI Optimist, Stagflation, AI+Healthcare, **The Transition** (the credibility test — accelerating non-linear AI deflation in goods + simultaneous USD inflation in services/energy), Transition + Honda shock

**What the simulator answers:**
- How does the colony's basket-cost-in-S evolve under each scenario?
- When (if ever) does the basket peg break (rate forced below target by reserve compression)?
- What's the citizen real purchasing power trajectory over 10 years?
- Which design levers (MPC, mortgage refinancing, UBI level, capital controls, etc.) recover welfare under stress?

**Scope of v1 (deliberately):**
- Static workforce (no births/deaths/redundancy/founding-of-new-companies in v1)
- Rule-based citizens, not AI agents
- All transactions settle at month-end
- Honda factory is the only major exporter; 400 employees stay employed throughout

---

## 2. What it tested — 38-config parameter sweep

A 38-configuration sweep ran ~22 minutes and tested:
- 6 baselines (one per scenario, no mitigations)
- MPC (Market Participation Charge) rate: 2.5% → 15%
- UBI level: 50 → 150 S/citizen/month
- Mortgage refinance to S (toggle)
- External rent refinance to S (toggle)
- S-tax on internal purchases: 1% → 5%
- Cover ratio target: 0.15 → 0.40
- Cashout multiplier: 0 (capital controls) → 2.0 (capital flight)
- Retirees-only UBI (means-tested)
- Six combination tests
- Cross-scenario validation of best combo

---

## 3. Headline numerical findings

Under **The Transition** scenario at 10% scale, 120 months, default seed:

| Configuration | Y10 basket cost in S | PP loss | Tier |
|---|---|---|---|
| Unmitigated baseline | 84.46 | 67% | Worse than holding USD |
| MPC 5% + mortgage refi | 44.84 | 38% | Weak defence |
| MPC 5% + both refinancings | 39.57 | 29% | Partial defence |
| MPC 10% + both refi + S-tax 3% | 33.44 | 16% | Strong defence |
| **Capital controls (cashout=0)** | **28.00** | **0%** | **Full steady ground** |
| **Retirees-only UBI + MPC 3%** | **28.00** | **0%** | **Full steady ground** |
| **MPC 15% + both refi + S-tax 5%** | **28.00** | **0%** | **Full steady ground** |

**Cross-scenario validation** of the MPC 5% + both refi combo:
- AI Realist: 0% PP loss (peg holds)
- AI Optimist: 0% PP loss (peg holds)
- Stagflation: 0% PP loss (peg holds)
- The Transition: 29% PP loss (partial defence)
- Transition + Honda shock: 36% PP loss (weak defence)

**The same configuration delivers full steady ground in 3 of 4 scenarios; The Transition's harder case requires more aggressive intervention.**

---

## 4. Counter-intuitive findings

These came as surprises and changed our intuition about lever interactions:

1. **Higher UBI makes things much worse under stress.** UBI 150 → 78% PP loss (vs baseline 67%). UBI 50 → 39%. More S minted = more pressure on cover ratio, even though citizens nominally have more S. Welfare-first policy backfires without reserve replenishment.

2. **Cover ratio target 0.40 is WORSE than 0.30.** Counter-intuitive: a fatter reserve buffer should be safer. But forcing higher cover means the Fisc compresses the rate sooner, accelerating the death-spiral. Cover 0.15 (looser) actually helps slightly.

3. **S-tax on internal purchases is essentially useless.** Even 5% S-tax saves only 0.5pp of PP loss. Internal purchase volume is small (~120K S/month at 10% scale) compared to UBI mint (~390K S/month). S-tax burns at most ~6K S/month, marginal against supply growth.

4. **External rent refinance alone is marginal** (saves ~3pp). 208 external-rent households vs 746 mortgage households — mortgage refi does most of the work.

5. **The biggest movers are flow restrictions, not flow taxes.** Stopping outflows (capital controls, refinancings) does much more than taxing internal flows.

6. **Means-tested UBI is mechanically the strongest single lever** but requires giving up the "U" in UBI. Cuts ~70% of UBI mint by serving only retirees + ubi-only-by-choice citizens. Politically very different from the original SPICE design.

---

## 5. The fundamental structural problem (the realistic-scale finding)

The simulation was originally calibrated at a **stylised scale**: $28 basket, $1/S parity, $5M reserve. These numbers were inherited from spec docs and worked mathematically but were obviously unrealistic ($8/month for energy was the giveaway).

Rescaled to **realistic per-adult monthly consumption**: $980 basket, $35/S parity, $175M reserve. UBI 100 S × $35/S = **$3,500/month real**. This matches roughly a US living-wage equivalent.

**Surprising finding:** scale invariance is BROKEN. The colony fares meaningfully WORSE at realistic scale.

**Why:**
- UBI is denominated in S (constant 100 S/citizen/month, regardless of scale)
- Reserve is denominated in USD (initial $175M, fed by external boundary flows in USD)
- At realistic parity ($35/S), each 1 S of new supply requires $10.50 of reserve to back at the 0.30 cover floor (vs $0.30 at stylised parity)
- UBI mint = 390K S/month → needs $4M/month of new reserve to maintain cover
- Boundary inflows (Honda exports $375K/month + remote-worker wages + retiree pensions − imports − mortgages) deliver ~$1.6M/month
- **Reserve can't keep up — gap is ~$2.4M/month structural**

**Numerical impact at realistic scale:**

| | At stylised scale ($28 basket) | At realistic scale ($980 basket) |
|---|---|---|
| Y10 basket cost in S (unmitigated) | 84.46 | **198.88** |
| Y10 PP loss (unmitigated) | 67% | **86%** |
| Y10 UBI value (real USD) | n/a | $1,020 |
| Capital controls (cashout=0) Y10 basket S | 28 (perfect) | 147 |
| Capital controls Y10 PP loss | 0% | 81% |

**The realistic numbers reveal that even capital controls don't fully fix the colony.** At realistic scale, the structural mismatch between S-denominated UBI minting and USD-denominated reserve replenishment dominates.

---

## 6. The fundamental design issues exposed

These are the deeper questions that emerged through the iteration. They are NOT parameter-tuning issues; they suggest the SPICE design needs structural rethinking.

### 6.1 The mortgage problem

Joe — the canonical Honda assembly worker — has $1,400/month USD mortgage. His SPICE income is $3,500 UBI (founding) + ~$100/month worker dividend. Family of 4 needs ~$4,000-6,000 of basket consumption + the mortgage. **Joe is structurally insolvent at founding, even before any Transition stress.**

Possible cause: founding data assumes 35% of households arrive at the colony with US-style mortgages. But SPICE colonies are *new intentional communities* — citizens joining one likely settle external debt first, sell previous houses, or join into colony-owned housing. The 35% mortgage assumption may be fundamentally wrong for the SPICE concept.

### 6.2 The redundancy problem (the deepest issue)

The simulation has Honda's 400 workers staying employed for 10 years. **Reality**: under The Transition scenario where AI deflation in goods accelerates to -38% by Y5, that deflation is happening BECAUSE automation is replacing workers. By Y10 Honda's "400 workers" is probably 30 workers + 370 robots.

The simulation models the **cause** (deflation) but not the **effect** (the worker who's no longer a worker). When a worker's job is automated:
- Their time-limited shares cancel
- They lose their dividend income
- They're left with UBI alone
- Their accumulated S savings provide a buffer, but UBI must support them indefinitely

**The SPICE colony's real test isn't "does it support employed Joe?"** It's "does it support Joe-the-redundant — the citizen with no time-limited equity, only UBI and accumulated savings?" That's the citizen the design must support, because that's the future of every blue-collar and most white-collar workers under the Transition.

The current sim is silent on this. Phase 3 lifecycle work (births/deaths/founding/failure/redundancy) was deferred. **Steve's observation makes this mandatory** — without modelling redundancy, the simulation is blind to the central dynamic of the Transition.

### 6.3 The UBI level problem

UBI 100 S × $35/S = $3,500/month at parity. US living wage is closer to $4,000-5,000+ depending on region/family size. So UBI is below realistic living wage even at colony founding, before any stress.

But the sweep showed: higher UBI without reserve growth makes things WORSE (more S minted, more cover-ratio pressure). So you can't just raise UBI — you need to fund it with reserve-replenishment (MPC or equivalent).

### 6.4 The reserve-replenishment problem

UBI mints S unconditionally; the simulation has no mechanism that replenishes reserve at the rate UBI mints. MPC in current form taxes company revenue capacity (mostly Honda's spare capacity), which doesn't scale with S supply growth. A proper SPICE design probably needs MPC or equivalent that scales as a fraction of S minted — "every UBI dollar minted has a corresponding MPC dollar burned to maintain cover."

This is the structural fix that the sweep didn't fully test.

### 6.5 The cashout-vs-capital-controls tension

The simulation shows that **capital controls (cashout = 0) is the cleanest single lever** for peg defence. But it's a serious policy choice — citizens cannot convert S to USDC. In real terms: they're locked into the colony economy. This may be acceptable as a founding-period rule (5 years no cashout), relaxing as reserve grows. But it raises the question: **is SPICE a closed currency union, or an open one?** The design implications are very different.

### 6.6 The Honda-Inc-doesn't-extract realisation

Honda Inc as a manufacturing parent doesn't extract dividends from a subsidiary; it extracts cars. The original sim had Honda Inc receiving 60% of distributable surplus monthly, cashing out to USDC — a major reserve drain. **This was wrong.** Fixed: Honda Inc holds 60% paper equity for governance/sale purposes but extracts no monthly dividend. Worker citizens now receive 87.5% of distributable surplus (instead of 35%). But this only marginally improves the headline metric because the redistributed S triggers more citizen cashouts.

---

## 7. Open questions for redesign

These are the questions the simulator has surfaced that need design-level answers, not parameter tweaks:

1. **Founding state.** What's a realistic founding configuration for a SPICE colony? Specifically:
   - Do citizens arrive with external mortgages? If so, does the colony bank buy them out at founding (one-time reserve hit)?
   - Do citizens arrive with external savings? Are those savings converted to S, kept in USDC, or lost?
   - What's the colony's founding USDC reserve? Where does it come from (founders, sovereign, impact capital)?

2. **Worker redundancy and severance.**
   - As automation displaces workers, what happens to their time-limited shares?
   - Should they vest into permanent shares (severance pay)?
   - Should the colony provide a "displaced workers' fund" that scales with automation level?
   - Is there a "retirement equity" mechanism distinct from voluntary retirement?

3. **UBI architecture.**
   - Is UBI a fixed amount, or does it scale with colony economic activity?
   - Should UBI rise with the automation level (more redundant citizens = more UBI funded by MPC)?
   - Is "universal" or "means-tested" the right model? Or both, with different floors?

4. **Reserve replenishment.**
   - Should MPC scale with S supply minted (a "monetisation tax")?
   - Should the colony issue debt to external investors to maintain reserve (sovereign borrowing analog)?
   - Should the colony auto-cut UBI when reserve coverage falls below threshold (transparent stress response)?

5. **Capital controls.**
   - Is SPICE a closed currency union (cashout limited or banned)?
   - Or an open one (citizens can freely convert)?
   - Or tiered (cashout limit per citizen per year, scaling with colony stability)?

6. **Citizen income mix.**
   - The current model has UBI + worker dividend + (small) external income. Under realistic redundancy, worker dividend disappears for most citizens.
   - Should the design rebalance toward higher UBI + colony-wide profit-sharing (so all citizens benefit from automation, not just shareholders)?

7. **Founding-period vs steady-state.**
   - Many of the design tensions ease in steady state if reserve has built up. The real test is the transition from founding to maturity.
   - Should the design have explicitly different rules for the founding period (e.g. capital controls Y0-Y5, relaxing thereafter)?

---

## 8. What I'd ask claude.ai

The simulator has surfaced a set of structural design questions that the parameter-tuning approach can't answer. The most important questions for redesign discussion:

1. **What does the SPICE colony's social contract look like for the redundant citizen?** UBI + accumulated savings + some mechanism for displaced-worker support? The existing time-limited equity model assumes ongoing employment.

2. **How should the Fisc reserve grow as the colony grows?** Specifically: should there be a mint-tied reserve mechanism (every S of UBI minted triggers some reserve growth, via MPC or equivalent), so the structural mismatch between S supply and USD reserve doesn't compound?

3. **Should SPICE colonies inherit external debt?** Or do they require fresh-start onboarding (no external mortgages, no external creditors)?

4. **What's the right founding USDC reserve scale?** $175M for 4,000 people = $43,750 per citizen of reserve. Real-world equivalents: how big is the Eurozone monetary base per capita? The Swiss reserve? National wealth funds?

5. **Is the right SPICE colony a closed currency union, an open one, or a tiered one?** The cashout question is fundamental and the design literature is split.

6. **How should the SPICE design handle the "70% of citizens are redundant by Y10" reality?** This is the central question — and the simulator currently ducks it by assuming static employment.

---

## 9. What I have running, ready to explore design alternatives

Once we have a redesign direction, the simulator can test it quickly:
- Configurable UBI rules (per-citizen amount, eligibility, scaling)
- Configurable MPC (rate, base, can be made supply-tied with code change)
- Configurable cashout (per-archetype rates, multiplier, can add caps)
- Configurable mortgage/rent refinancing
- 6 scenarios + custom (any annual rate × category × year vector)
- Per-citizen drill-down on /families page (six representative households)
- 38-config sweep can be re-run in 22 minutes when parameters change
- Adding new mechanisms (severance equity vesting, supply-tied MPC, redundancy modeling) is 1-3 days each

The simulator has already paid for itself by surfacing the design issues above. The next phase is design-level decisions, then targeted simulation testing of those decisions.

---

*Generated from the simulator state at commit f790872, after the realistic-scale rescaling and the Honda-Inc-doesn't-extract fix. Lives at `docs/economy-model/maryfontaine/` in the SPICE Protocol repo.*
