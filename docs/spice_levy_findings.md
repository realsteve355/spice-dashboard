# SPICE Per-Transaction Levy — Validation Findings

**Date: 7 May 2026**
**Status: Phase F validation in progress; this document will be updated when the 5-test suite completes (~24 min runtime).**

This document reports the validation findings from implementing the per-transaction levy mechanism specified in `spice_levy_build_spec.md`. The mechanism was built into the MaryFontaine simulator across Phases A-E; Phase F runs the five validation tests from spec §10.

---

## 1. The mechanism in one paragraph

Every monetary transaction routed through the Fisc — internal commerce, external trade, MCC bills — has three deductions before settlement: a small fixed gas levy ($0.005/tx), a 0.1% protocol levy to SPICE founders, and the **automation levy** which goes to the Fisc reserve to fund UBI. The automation levy scales with the supplier's profit-per-employee: firms below a $80K threshold pay nothing, firms above pay at a rate that rises progressively with α=1.5 exponent. The k parameter is recalibrated annually to balance projected next-year UBI obligation against projected weighted transaction volume.

The mechanism's design intent: capture wealth from highly automated firms (whose profit-per-employee is high precisely *because* automation has displaced workers) and redirect it to fund the colony's universal income. **High-automation = high P/employee = high levy. Labour-intensive small businesses pay little or nothing.**

---

## 2. Initial results (pre-validation, single 120-month run)

The first long run before formal validation produced striking numbers:

| Configuration | Y10 basket S | Y10 reserve | PP loss |
|---|---|---|---|
| Transition, no levy (baseline) | 198.88 | $147M | 86% |
| **Transition, with levy** | **72.73** | **$325M** | **62%** |

**The levy more than doubles the reserve and cuts PP loss by ~25 percentage points** — but doesn't fully save the peg under Transition (still breaks at Y4). The reserve grows steadily throughout the decade because levy revenue exceeds UBI minting cost most years.

---

## 3. Validation tests (Phase F results)

*Will be populated when the validation suite completes.*

### Test 1: Baseline funding adequacy (AI Realist)

**Result: levy halves the PP loss but doesn't fully restore the peg.**

| | Y10 basket S | Y10 PP loss |
|---|---|---|
| AI Realist, no levy | 115.30 | 75.7% |
| AI Realist, with levy | **46.52** | **39.8%** |

The levy cuts AI Realist PP loss roughly in half. But this is the *benign* baseline scenario, and even with the levy on, citizens lose ~40% real purchasing power. **At realistic scale, AI Realist alone is already stressful for the colony** — the previous findings document explained why (UBI is S-denominated, reserve is USD-denominated, asymmetry compounds at realistic parity).

The levy is a meaningful improvement but doesn't single-handedly deliver steady ground even under the mild AI Realist conditions. This suggests the levy is necessary-but-not-sufficient — combinable with other mitigations (LAT, mortgage refi) to reach steady ground.

### Test 2: Transition stress

**Result: levy is dramatically helpful but doesn't fully save the peg under Transition.**

| | Y10 basket S | Y10 PP loss |
|---|---|---|
| Transition, no levy | 198.92 | 85.9% |
| Transition, with levy | **72.73** | **61.5%** |

Levy cuts ~24 percentage points off the PP loss under the credibility test. The reserve more than doubles ($147M → $325M from the earlier full run). But the peg still breaks at Y4 — the levy alone can't keep up with the pace of UBI minting + reserve drain under harsh Transition deflation.

This is the **counter-cyclical** property the design intended: as automation accelerates, more firms reach high P/employee, the levy collects more revenue. But the levy's marginal contribution is bounded by transaction volume × levy rate; under deep Transition stress this isn't enough by itself to fully bridge the structural gap.

### Test 3: Parameter sweep (α, P_threshold)

**Result so far (α=1.0, 1.5, 2.0 complete; α=3.0 in progress):**

| α | P_thr=$40K | P_thr=$80K | P_thr=$150K |
|---|---|---|---|
| **1.0** | **58.7%** | 60.5% | 61.5% |
| 1.5 | 61.0% | 61.5% (default) | 61.8% |
| 2.0 | 61.6% | 61.8% | 62.0% |
| 3.0 | _pending_ | _pending_ | _pending_ |

PP loss values, all under The Transition with `levy_enabled` and otherwise default config.

**Key finding:** the sweep is remarkably flat (range 58.7% – 62.0%, just 3.3pp variation across 9 configurations). This is **by design** — the annual k recalibration auto-balances the levy rate so that projected next-year levy revenue covers the projected UBI obligation. Different α/threshold combinations converge to similar total annual revenue; what varies is the early-year transient before k recalibration kicks in (Y1) and the inter-firm allocation of the levy burden.

**Implication for the design:** the choice of α and P_threshold is mostly a **distributive** question (which firms bear the levy load), not a quantitative one (how much total revenue is collected). The k recalibration handles the quantity. This means policy choices about α and P_threshold can prioritise political fairness ("highly automated firms pay much more") without fundamentally changing the colony's funding adequacy.

**Best in sweep so far:** **α = 1.0, P_threshold = $40K → 58.7% PP loss.** Linear progressivity with a low entry threshold collects the most revenue in early years (before k stabilises), giving the colony a slightly stronger founding-period reserve buffer.

### Test 4: Internal commerce wedge

Covered by test 1's levy on/off comparison. *Will report whether internal levy meaningfully suppresses internal trade volume.*

### Test 5: Comparison to previous failure modes

[Pending — three runs: best-mitigation combo (LAT+both refi) without levy / with levy / levy-only. Tells us: does levy + mitigations stack additively, or does levy alone suffice?]

---

## 4. What the mechanism does that the previous design didn't

The previous simulation surfaced a **structural problem**: UBI is denominated in S (constant per citizen), reserve is denominated in USD (constant external boundary inflows). At realistic scale, each S of new supply requires $10.50 of reserve at the 0.30 cover floor. UBI mints 390K S/month → needs $4M/month of new reserve. Boundary inflows (Honda exports + remote wages + retiree pensions) deliver only ~$1.6M/month. The reserve couldn't keep up.

The levy mechanism directly addresses this asymmetry. **Every transaction now adds USDC to the reserve** (via the automation levy) at a rate that scales with the colony's economic activity. Previously the reserve only grew via boundary inflows; now it grows via internal commerce too — at a rate that rises as transaction volume rises. The k recalibration ensures levy revenue tracks UBI obligation as both grow.

The levy also has a **counter-cyclical** property under The Transition. As AI deflation accelerates, more firms hit high profit-per-employee (because they've automated their workers away). High-P/employee firms pay more levy. So precisely when the colony needs more reserve replenishment, the levy delivers it. The mechanism gets stronger as the crisis it's defending against deepens.

---

## 5. Caveats — what the validation can't tell us

- **External supplier representativeness.** Our 105 external suppliers are illustrative; real commerce involves thousands of firms in long-tail distributions. The validation depends on the supplier dataset's profit-per-employee distribution being roughly right.
- **Transaction frequency.** The simulation aggregates monthly; real payment flows are continuous. Per-transaction settlement at month-end loses the timing dynamics.
- **Strategic behaviour.** Firms might restructure to lower headline P/employee (avoidance), or pass the levy through to consumers (incidence). The simulator doesn't model strategic responses.
- **Internal levy on internal commerce.** v1 applies the levy uniformly. A real design might exempt small internal businesses below some threshold (cf P_threshold) but the wedge effect on inter-citizen-business trade should be measured.

---

## 6. Implications for the SPICE design (preliminary)

If the validation confirms the initial result:

1. **The levy is a load-bearing mechanism, not optional.** Without it, UBI minting structurally outpaces reserve replenishment. With it, the colony has a self-funding redistributive mechanism.

2. **The mechanism is robust to misparameterisation.** Annual k recalibration auto-corrects projection errors. Misjudgments at year-1 get corrected by year-2's recalibration.

3. **The levy redirects wealth from automation winners to citizens via UBI**, mathematically. This is the design intent of the SPICE economy: AI-driven productivity gains are recaptured and redistributed, rather than concentrating in capital.

4. **Combined with mitigations (LAT, mortgage refi)**, the levy may be sufficient to deliver full steady ground under The Transition. Validation Test 5 will tell us.

5. **The redundancy problem from the previous findings document remains unaddressed** — the simulator still doesn't model worker job loss as automation progresses. But the levy mechanism is **automatically responsive to redundancy**: when Honda automates, its P/employee rises sharply, its levy rises, its workers (whose time-limited shares cancel) are funded by UBI from the levy revenue. This is the loop the SPICE design needs.

---

## 7. Next steps

Once the validation finishes:

1. Update §3 with actual test results
2. Identify which parameter combinations produce best outcomes
3. Compare to the "best configurations" findings from the previous sweep (without levy) — does the picture change?
4. Recommend a default configuration for the SPICE design
5. Consider follow-up work:
   - Phase 3 lifecycle (worker redundancy modelling) — now more interesting because the levy provides the funding
   - Anti-avoidance mechanisms (group-level P/employee, max levy rate)
   - Time-varying parameters (founding-period high levy → relaxed steady-state)

---

*Validation progress: see `levy_validation_results.json` once the run completes. Dashboard `/levy` page provides interactive drill-down. Source: `docs/economy-model/maryfontaine/`.*
