# AI Commentary Improvements - Requirements Document

**Project:** SPICE Dashboard - AI-Generated Commentary  
**Affected Pages:** Simulation (`/collision`) and Impact (`/impact`)  
**Target Implementation:** Claude Code  
**Date:** 2026-03-14  
**Priority:** HIGH (currently generating misleading content)

---

## Executive Summary

Two critical fixes needed for AI-generated commentary:

**Problem 1: Simulation Page Commentary is Snapshot-Based (Should Be Trajectory-Based)**
- Current: Updates when year slider moves, describes single year
- Should: Analyze full 10-year trajectory (2026-2035), show story arc
- Impact: Users get redundant point-in-time analysis instead of narrative synthesis

**Problem 2: AI Catastrophizes Even Benign Scenarios**
- Current: Uses crisis language ("collapse", "catastrophic") even when AI=5%, no crisis
- Should: Calibrate tone based on scenario severity and crisis status
- Impact: Misleading - makes safe scenarios sound dangerous

---

## PROBLEM 1: Trajectory vs Snapshot Analysis

### 1.1 Current Behavior (Wrong)

**Economy Overview on Simulation page:**
```
User moves year slider from 2029 → 2031
→ Commentary updates: "In 2031, debt has reached 182%..."

User moves year slider from 2031 → 2033
→ Commentary updates: "In 2033, debt has reached 205%..."
```

**Problem:** This is **snapshot analysis** - same as Impact page, not what Simulation page needs.

### 1.2 Why This Is Wrong

**Simulation page purpose:**
- Show how crisis **unfolds over time**
- Explain causal mechanisms (debt → unemployment → crypto flight)
- Tell the story arc from 2026 to 2035

**Impact page purpose:**
- Show what life looks like **in a specific year**
- Help users plan ("What's 2031 like for me?")
- Personal scenario exploration

**They need different analysis types:**
- Impact page: "What does 2031 look like?" ✅ (snapshot is correct)
- Simulation page: "How does this scenario evolve?" ❌ (currently snapshot, should be trajectory)

### 1.3 Correct Behavior

**Economy Overview should analyze FULL TRAJECTORY:**

```
User changes AI slider from 25% → 40%
→ Commentary updates to analyze entire path:

"Under 40% AI displacement, the economy experiences cascading 
failure. Debt begins at 123% (2026) and accelerates to 220% 
by 2035 as the tax base collapses. The crisis triggers in 2029 
when debt crosses 175% simultaneously with 12% unemployment.

From 2029-2033, feedback loops intensify. AI displacement reaches 
40% by 2030, driving unemployment to 18% and forcing automatic 
stabilizers that widen deficits further. The Fed deploys yield 
curve control to prevent bond market collapse, but this monetary 
expansion drives inflation to 14%.

Capital flight accelerates sharply post-crisis. Crypto adoption 
surges from 8% in 2028 to 52% by 2033 as citizens flee the 
debasing currency. The Gini coefficient explodes from 0.48 to 
0.61—capital owners who exited early preserve wealth while 
workers face unemployment and currency loss simultaneously.

By 2035, conventional hedges have failed catastrophically. TIPS 
are negative in real terms, gold ETFs face counterparty risk, 
and the 60/40 portfolio has collapsed. Only those positioned in 
non-sovereign hard assets before 2029 preserved purchasing power 
through the transition."
```

**Year slider moves → Commentary does NOT change** (still analyzes full trajectory)

---

## PROBLEM 2: Tone Catastrophization

### 2.1 Current Behavior (Wrong)

**Benign scenario (AI=5%, Crypto=0%, No policies):**
- Debt: 140% (safe - below 175% threshold)
- Inflation: 3.2% (normal - below 15% threshold)  
- Unemployment: 6% (safe - below 20% threshold)
- **No crisis triggered**

**Current AI output:**
> "Middle-Class Salary Workers: Real purchasing power **COLLAPSE**: 
> 0.8% inflation officially masks AI-driven deflation while fixed 
> salaries **STAGNATE**, creating hidden wage cuts..."

**Problem:** Using **crisis language** ("collapse", "stagnate") when system is **stable and safe**.

### 2.2 Why This Happens

**AI has NO CONTEXT:**
- Doesn't know if crisis has been triggered (Debt >175%, etc.)
- Doesn't know if this is CBO baseline (benign) or Tsunami (extreme)
- Doesn't know what "normal" looks like vs "crisis"

**Sees Debt 140% and thinks:** "That's high! Must be bad!"  
**Reality:** 140% is elevated but **safe** (crisis threshold is 175%)

### 2.3 Correct Behavior

**Same benign scenario, proper tone:**
> "Middle-Class Salary Workers: **Gradual purchasing power pressure** 
> as 3.2% inflation slightly outpaces nominal wage growth of 2.5%, 
> creating modest real wage compression of ~0.7% annually. A $60k 
> salary loses $420/year in purchasing power—**noticeable but manageable** 
> with household budget adjustments."

**Severe scenario (AI=40%, Crisis triggered), proper tone:**
> "Middle-Class Salary Workers: **Catastrophic purchasing power destruction** 
> as 14% inflation while unemployment reaches 18% creates a dual shock. 
> A $60k salary (if still employed) loses $8,400/year in purchasing power. 
> The 82% still working face 20-30% real wage cuts over three years while 
> the 18% unemployed face income loss entirely."

**Same AI, different context → dramatically different tone.**

---

## SOLUTION 1: Fix Simulation Page (Trajectory Analysis)

### 1.1 Remove Year Dependency

**Current code (wrong):**
```javascript
useEffect(() => {
  // Re-fetches every time year slider moves
  const timer = setTimeout(async () => {
    const params = {
      year: kpiYear,  // ← Single snapshot year
      debt: data[kpiYear - 2026].debt,
      // ... other snapshot values
    };
    // Fetch commentary for this year
  }, 600);
  
  return () => clearTimeout(timer);
}, [kpiYear, displaced, fiscalId, monetaryId, ...]);
//  ^^^^^^^ Year slider triggers re-fetch - WRONG
```

**Fixed code:**
```javascript
useEffect(() => {
  // Only re-fetches when policy/slider settings change
  // Year slider movement does NOT trigger re-fetch
  const timer = setTimeout(async () => {
    const params = buildTrajectoryParams(data, fiscalId, monetaryId, ...);
    // Fetch commentary for FULL TRAJECTORY
  }, 600);
  
  return () => clearTimeout(timer);
}, [displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy, data]);
// Removed kpiYear from dependencies ←  Year slider now ignored
```

### 1.2 Pass Trajectory Data Instead of Snapshot

**Current (wrong):**
```javascript
const params = {
  year: kpiYear,
  debt: data[kpiYear - 2026].debt,
  inflation: data[kpiYear - 2026].infl,
  // ... single year values
};
```

**Fixed (trajectory):**
```javascript
function buildTrajectoryParams(data, fiscalId, monetaryId, cryptoPolicy) {
  // Calculate key trajectory metrics
  const startYear = 2026;
  const endYear = 2035;
  const startData = data[0];
  const endData = data[data.length - 1];
  
  // Find crisis year (if any)
  const crisisYear = data.findIndex(d => 
    d.debt > 175 || d.unemp > 20 || d.infl > 15 || d.infl < -7
  );
  
  return {
    // Trajectory overview
    startYear,
    endYear,
    crisisTriggered: crisisYear !== -1,
    crisisYear: crisisYear !== -1 ? (2026 + crisisYear) : null,
    
    // Debt trajectory
    startDebt: Math.round(startData.debt),
    endDebt: Math.round(endData.debt),
    peakDebt: Math.round(Math.max(...data.map(d => d.debt))),
    
    // Unemployment trajectory
    startUnemployment: startData.unemp.toFixed(1),
    endUnemployment: endData.unemp.toFixed(1),
    peakUnemployment: Math.max(...data.map(d => d.unemp)).toFixed(1),
    
    // Inflation trajectory
    startInflation: startData.infl.toFixed(1),
    endInflation: endData.infl.toFixed(1),
    
    // Crypto flight trajectory
    startCrypto: Math.round(startData.cryptoFlight || 0),
    endCrypto: Math.round(endData.cryptoFlight || 0),
    peakCrypto: Math.round(Math.max(...data.map(d => d.cryptoFlight || 0))),
    
    // Inequality trajectory
    startGini: (startData.gini || 0.48).toFixed(2),
    endGini: (endData.gini || 0.48).toFixed(2),
    
    // Policy settings
    fiscalPolicy: fiscalId,
    monetaryPolicy: monetaryId,
    cryptoPolicy: cryptoPolicy
  };
}
```

### 1.3 Update API Prompt for Trajectory Analysis

**File:** `/api/economy-overview.js`

**Current prompt (wrong - snapshot focused):**
```javascript
`Analyze the economy in year ${year}:
- Debt: ${debt}%
- Inflation: ${inflation}%
...`
```

**Fixed prompt (trajectory focused):**
```javascript
`You are analyzing a 10-year economic simulation (${startYear}-${endYear}).

TRAJECTORY DATA:
- Starting debt (${startYear}): ${startDebt}% GDP
- Ending debt (${endYear}): ${endDebt}% GDP
- Peak debt: ${peakDebt}%
- Crisis onset: ${crisisTriggered ? crisisYear : 'No crisis triggered'}
- Peak unemployment: ${peakUnemployment}%
- Ending inflation: ${endInflation}%
- Ending crypto adoption: ${endCrypto}%
- Ending Gini coefficient: ${endGini}
- Policy settings: ${fiscalPolicy}, ${monetaryPolicy}, ${cryptoPolicy}

TASK:
Write a 4-paragraph analysis of this FULL TRAJECTORY (not a single year).

Paragraph 1: INITIAL CONDITIONS & BUILD-UP PHASE (${startYear}-${crisisYear || endYear})
- Starting state (debt ${startDebt}%, unemployment ${startUnemployment}%)
- What accumulates during build-up
- Early warning signs (if any)
- If no crisis: explain why system remained stable

Paragraph 2: CRISIS TRIGGER & ACUTE PHASE (if crisis occurred)
${crisisTriggered 
  ? `- Crisis triggers in ${crisisYear} - explain WHY (which threshold crossed)
     - What cascades from ${crisisYear} to ${endYear}
     - Feedback loops that accelerate/dampen crisis`
  : `- No crisis triggered - explain why
     - System adjusts gradually rather than breaking
     - What prevented crisis (low displacement, effective policy, etc.)`
}

Paragraph 3: POLICY RESPONSE & DYNAMICS (across full period)
- Government/Fed actions: ${fiscalPolicy} + ${monetaryPolicy}
- How policies affect trajectory over time
- Crypto regime (${cryptoPolicy}) and capital flight evolution
- K-shape inequality: Gini ${startGini} → ${endGini}

Paragraph 4: END STATE & INVESTMENT IMPLICATIONS (by ${endYear})
- Where trajectory leads: debt ${endDebt}%, crypto ${endCrypto}%
- Who wins/loses across the full period
${crisisTriggered
  ? `- Conventional hedges (TIPS, gold ETFs, 60/40) failed - explain why and when
     - Only non-sovereign hard assets preserved purchasing power`
  : `- Traditional portfolio construction remains viable
     - Hard asset positioning vs conventional allocation`
}

CRITICAL RULES:
1. Analyze the ARC across time, not a snapshot
2. Reference specific years for key inflection points
3. Explain causality (WHY things happen, not just WHAT)
4. Show how variables interact (debt → unemployment → crypto flight)
5. Ground in trajectory data (debt rises from X to Y, unemployment peaks at Z in year W)
6. No bullet points, no headers within paragraphs
7. Do NOT mention "SPICE" or "ZPC" token

Tone: Analytical narrative, telling the story of how this scenario unfolds.`
```

---

## SOLUTION 2: Fix Tone Calibration (Both Pages)

### 2.1 Add Context Calculation

**Both `/api/human-impact.js` and `/api/economy-overview.js` need:**

```javascript
// Calculate crisis status
function getCrisisStatus(debt, unemployment, inflation, yields) {
  const crisisTriggered = 
    debt > 175 || 
    unemployment > 20 || 
    inflation > 15 || 
    inflation < -7 ||
    (yields > 6.5 && debt > 150);
  
  return {
    triggered: crisisTriggered,
    reasons: [
      debt > 175 && 'Debt exceeded 175% threshold',
      unemployment > 20 && 'Unemployment exceeded 20% threshold',
      inflation > 15 && 'Hyperinflation (>15%)',
      inflation < -7 && 'Severe deflation (<-7%)',
      (yields > 6.5 && debt > 150) && 'Bond market stress (yields >6.5% + debt >150%)'
    ].filter(Boolean)
  };
}

// Calculate scenario severity
function getScenarioSeverity(aiDisplacement) {
  // Map displacement rate to severity level
  if (aiDisplacement < 0.15) return 'benign';      // 0-15%: CBO/IMF baseline
  if (aiDisplacement < 0.35) return 'moderate';    // 15-35%: McKinsey
  if (aiDisplacement < 0.55) return 'severe';      // 35-55%: SPICE base case
  return 'extreme';                                 // 55%+: Tsunami
}

// Map severity to descriptive labels
const SEVERITY_LABELS = {
  benign: 'CBO/IMF baseline - gradual adjustment, manageable pressures',
  moderate: 'McKinsey scenario - significant displacement, policy response required',
  severe: 'SPICE base case - crisis likely without decisive intervention',
  extreme: 'Tsunami scenario - systemic breakdown almost certain'
};
```

### 2.2 Add Tone Guidance to Prompts

**Insert into BOTH `/api/human-impact.js` and `/api/economy-overview.js` prompts:**

```javascript
const crisis = getCrisisStatus(debt, unemployment, inflation, yields);
const severity = getScenarioSeverity(displaced);

const toneGuidance = `
CRISIS STATUS: ${crisis.triggered ? 'TRIGGERED' : 'NOT TRIGGERED'}
${crisis.triggered ? `Crisis reasons: ${crisis.reasons.join('; ')}` : ''}

SCENARIO SEVERITY: ${severity.toUpperCase()} (${SEVERITY_LABELS[severity]})

TONE CALIBRATION:
${getToneGuidance(severity, crisis.triggered)}
`;

function getToneGuidance(severity, crisisTriggered) {
  if (severity === 'benign' && !crisisTriggered) {
    return `This is a MILD scenario. The system is adjusting, not breaking.

FORBIDDEN WORDS: Do NOT use "collapse", "catastrophic", "crisis" (crisis not triggered), 
"disaster", "breakdown", "apocalyptic", "devastation"

APPROPRIATE LANGUAGE:
- "gradual pressure", "modest headwinds", "manageable adjustment"
- "requires monitoring", "building stress" (not "imminent collapse")
- "noticeable but manageable", "challenges emerging"

Example tone: "Inflation of 3.2% creates gradual purchasing power pressure as it 
slightly outpaces wage growth. A $60k salary loses $420/year—noticeable but manageable 
with household budget adjustments."`;
  }
  
  if (severity === 'moderate' && !crisisTriggered) {
    return `This is a MODERATE scenario. Acknowledge challenges seriously but avoid hyperbole.

USE WITH CAUTION: "significant stress", "mounting pressure", "correction required"
AVOID: "collapse", "catastrophic", "breakdown" (crisis not yet triggered)

APPROPRIATE LANGUAGE:
- "significant challenges", "policy response needed", "building stress"
- "correction required", "intervention recommended"
- "material impact", "meaningful disruption"

The system faces real stress but has policy tools and hasn't broken yet.`;
  }
  
  if (severity === 'severe' || severity === 'extreme') {
    if (crisisTriggered) {
      return `This is a ${severity.toUpperCase()} scenario and CRISIS IS UNDERWAY.

Serious, urgent tone is APPROPRIATE. Use crisis language accurately:
- "catastrophic", "breakdown", "systemic failure" ← CORRECT for this scenario
- "collapse", "crisis", "devastating impact" ← APPROPRIATE
- Reference specific failure modes: "TIPS negative in real terms", "60/40 portfolio collapsed"

Ground severity in numbers: Don't just say "crisis", say "unemployment 22%, inflation 16%—
depression-level simultaneous shocks unprecedented since 1930s"`;
    } else {
      return `This is a ${severity.toUpperCase()} scenario. Crisis has NOT triggered yet but is likely.

SIGNAL DANGER CLEARLY but acknowledge crisis hasn't hit:
- "crisis approaching", "break point nearing", "mounting toward systemic stress"
- NOT "crisis underway" (it hasn't triggered yet)
- "without intervention, trajectory leads to..." (conditional, not inevitable)

Appropriate alarm level: High. This scenario will likely trigger crisis, but hasn't yet.`;
    }
  }
}
```

### 2.3 Example Outputs After Fix

#### **Benign Scenario (AI=5%, No crisis) - Impact Page:**

**Before:**
> "Middle-Class Salary Workers: Real purchasing power COLLAPSE: inflation 
> masks deflation while salaries STAGNATE..."

**After:**
> "Middle-Class Salary Workers: Gradual purchasing power pressure as 3.2% 
> inflation slightly outpaces 2.5% nominal wage growth. A $60k salary loses 
> ~$420/year in real terms—noticeable but manageable with budget adjustments. 
> AI displacement remains low (5%), so job security stable for most workers."

---

#### **Severe Scenario (AI=40%, Crisis triggered) - Impact Page:**

**Before (same catastrophic tone everywhere):**
> "Middle-Class Salary Workers: Real purchasing power COLLAPSE..."

**After (appropriately severe):**
> "Middle-Class Salary Workers: Catastrophic dual shock—14% inflation while 
> unemployment hits 18%. The 82% still employed face 20-30% real wage cuts 
> over three years as $60k salaries lose $8,400/year in purchasing power. 
> The 18% displaced by AI face total income loss. Traditional hedges (401k 
> stocks, bond funds) have collapsed; only those who fled to hard assets 
> before 2029 preserved wealth."

---

#### **Benign Scenario - Economy Overview (Simulation page):**

**After (calm, trajectory-based):**
> "Under conservative 5% AI displacement, the economy adjusts gradually over 
> the decade. Debt rises from 123% to 142% of GDP—elevated but well below 
> the 175% crisis threshold. Unemployment peaks at 7.2% in 2029 before 
> stabilizing, and inflation averages 2.8%.
>
> No crisis triggers. The absence of policy intervention allows slow drift 
> but avoids acute rupture. Bond yields remain anchored below 5% as markets 
> price gradual adjustment. Crypto adoption stays minimal (under 10%)—no 
> capital flight signal emerges.
>
> Inequality widens modestly (Gini 0.48 to 0.52) as AI productivity gains 
> accrue to capital, but the K-shape remains gradual. The Fed maintains 
> standard monetary policy; no emergency interventions required.
>
> By 2035, traditional portfolio construction (60/40, TIPS) continues to 
> function as designed. This is the benign scenario—manageable adjustment 
> rather than systemic crisis. The collision remains hypothetical."

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Fix Simulation Page (Trajectory)

**Backend (`/api/economy-overview.js`):**
- [ ] Update function signature to accept trajectory params (not snapshot)
- [ ] Modify prompt to request trajectory analysis (4 phases across time)
- [ ] Test with benign scenario → should analyze 2026-2035 arc
- [ ] Test with severe scenario → should show crisis onset + cascade

**Frontend (`chart3-simulation.jsx`):**
- [ ] Remove `kpiYear` from useEffect dependencies
- [ ] Create `buildTrajectoryParams()` function
- [ ] Pass full trajectory data to API (start/end/peak values)
- [ ] Verify year slider movement does NOT trigger re-fetch
- [ ] Test: Change year slider → commentary stays same ✓
- [ ] Test: Change AI slider → commentary updates with new trajectory ✓

### Phase 2: Fix Tone Calibration (Both Pages)

**Backend (both `/api/human-impact.js` and `/api/economy-overview.js`):**
- [ ] Add `getCrisisStatus()` function
- [ ] Add `getScenarioSeverity()` function  
- [ ] Add `getToneGuidance()` function
- [ ] Insert tone guidance into prompts
- [ ] Test benign scenario → calm, measured language
- [ ] Test severe+crisis → urgent, serious language
- [ ] Verify forbidden words NOT used in benign scenarios

**Frontend (both pages - pass severity to API):**
- [ ] Pass `displaced` (AI displacement %) to API
- [ ] API uses it to calculate severity (benign/moderate/severe/extreme)
- [ ] Test CBO (5%) → benign tone
- [ ] Test McKinsey (25%) → moderate tone
- [ ] Test SPICE (40%) → severe tone
- [ ] Test Tsunami (60%) → extreme tone

---

## TESTING MATRIX

### Test Scenarios:

| AI % | Crisis? | Expected Severity | Expected Tone |
|------|---------|-------------------|---------------|
| 5%   | No      | Benign            | Calm, measured - avoid "collapse" |
| 25%  | No      | Moderate          | Serious but not catastrophic |
| 40%  | Yes     | Severe            | Urgent, crisis language appropriate |
| 60%  | Yes     | Extreme           | Catastrophic language appropriate |

### Simulation Page Tests:

**Test 1: Year Slider Movement**
- Set AI=40%, wait for commentary
- Move year slider 2029 → 2033
- **Expected:** Commentary does NOT change (analyzes full trajectory)
- **Current (broken):** Commentary updates to new year snapshot

**Test 2: AI Slider Movement**  
- Set AI=25%, note commentary (moderate trajectory)
- Change AI to 40%
- **Expected:** Commentary updates to new trajectory (crisis path)

**Test 3: Trajectory Language**
- Set AI=40%
- **Expected:** Commentary mentions "from 2026 to 2035", "crisis triggers in 2029", "by 2033, X happens"
- **Current (broken):** Only describes single year

### Impact Page Tests:

**Test 4: Benign Scenario Tone**
- Set AI=5%, Crypto=0%, No policies
- Check Middle-Class card
- **Expected:** "gradual pressure", "manageable", NO "collapse"
- **Current (broken):** Uses "collapse", "stagnate"

**Test 5: Severe Scenario Tone**
- Set AI=40%, YCC, Crisis triggered
- Check Middle-Class card
- **Expected:** "catastrophic", "dual shock", serious language
- **Should work:** Severity matches crisis reality

---

## SUCCESS CRITERIA

### Simulation Page:
1. ✅ Year slider movement does NOT trigger API call
2. ✅ Commentary analyzes full 2026-2035 trajectory
3. ✅ References specific years for inflection points ("crisis triggers in 2029")
4. ✅ Shows causal chains ("debt rises → unemployment follows → crypto flight accelerates")
5. ✅ Updates only when policy/AI/crypto sliders change

### Impact Page:
6. ✅ Benign scenarios use calm language ("gradual", "manageable")
7. ✅ Forbidden words NOT used in safe scenarios ("collapse", "catastrophic")
8. ✅ Severe scenarios use appropriate crisis language
9. ✅ Tone matches reality (crisis triggered = serious; no crisis = measured)

### Both Pages:
10. ✅ AI receives crisis status (triggered Y/N, which threshold)
11. ✅ AI receives scenario severity (benign/moderate/severe/extreme)
12. ✅ Tone guidance explicitly included in prompts
13. ✅ No SPICE/ZPC mentions (legal compliance)
14. ✅ Grounded in specific numbers (not vague "high debt")

---

## FILES TO MODIFY

**Backend:**
- `/api/economy-overview.js` - Add trajectory analysis + tone calibration
- `/api/human-impact.js` - Add tone calibration only

**Frontend:**
- `src/pages/chart3-simulation.jsx` - Remove year dependency, pass trajectory data
- `src/pages/Impact.jsx` - Pass AI displacement % for severity calculation

**No new files needed.**

---

## ROLLBACK PLAN

If changes cause issues:

**Quick disable:**
- Revert prompt changes (remove tone guidance)
- Revert to year-based params for economy-overview
- Pages return to previous (flawed) behavior

**Partial rollback:**
- Keep trajectory analysis, revert tone calibration (or vice versa)
- Issues are independent - can roll back separately

**Full rollback:**
- Git revert to pre-fix commits
- Restore previous API prompt templates

---

## COST IMPACT

**No cost increase:**
- Same number of API calls
- Slightly longer prompts (~100 tokens) but same output length
- Net cost change: negligible (<5%)

**Better value:**
- More accurate tone = better user experience
- Trajectory analysis = more useful insights per API call

---

## PRIORITY JUSTIFICATION

**HIGH priority because:**

1. **Currently misleading users** - calling safe scenarios "catastrophic"
2. **Redundant on Simulation page** - year-based analysis duplicates Impact page
3. **Undermines credibility** - catastrophizing everything makes model look hysterical
4. **Simple fixes** - prompt engineering, no architecture changes
5. **High impact** - dramatically improves user experience and trust

---

**END OF REQUIREMENTS**

---

## Quick Reference for Claude Code

### Fix 1: Simulation Page Trajectory Analysis

**What to change:**
1. Remove `kpiYear` from useEffect dependencies in `chart3-simulation.jsx`
2. Create `buildTrajectoryParams()` to pass start/end/peak values
3. Update `/api/economy-overview.js` prompt to analyze full arc (not single year)

**Test:** Year slider moves → commentary stays same

### Fix 2: Tone Calibration (Both Pages)

**What to add:**
1. `getCrisisStatus()`, `getScenarioSeverity()`, `getToneGuidance()` functions
2. Tone guidance section in both API prompts
3. Pass `displaced` value from frontend to APIs

**Test:** AI=5% → calm language; AI=60% → crisis language

**Priority:** HIGH  
**Difficulty:** MEDIUM (prompt engineering, logic changes)  
**Time estimate:** 2-3 hours  
**Impact:** CRITICAL (fixes misleading content)
