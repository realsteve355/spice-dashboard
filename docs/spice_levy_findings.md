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

[Pending validation results — expected to show: levy ON delivers full steady ground; reserve grows; UBI obligation covered]

### Test 2: Transition stress

[Pending — expected: levy substantially reduces PP loss but doesn't fully restore peg]

### Test 3: Parameter sweep (α, P_threshold)

[Pending — sweep over α ∈ {1.0, 1.5, 2.0, 3.0} × P_threshold ∈ {$40K, $80K, $150K}. Looking for: which combination produces sustainable funding without crushing internal commerce]

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
