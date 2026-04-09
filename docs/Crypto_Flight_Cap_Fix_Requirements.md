# Crypto Flight Cap Fix - Requirements Document

**Project:** SPICE Dashboard - Simulation Page  
**Issue:** Crypto flight capped at 35%, preventing realistic Venezuela-level scenarios (60-70%+)  
**Target Implementation:** Claude Code  
**Date:** 2026-03-13

---

## 1. Problem Statement

### Current Behavior:
- Crypto flight variable has hard cap of 35% of capital stock
- Even with "Venezuela" crypto adoption slider setting, cannot exceed ~25% in practice
- This severely underestimates crisis severity in high-adoption scenarios

### Real-World Data:
- **Venezuela:** 60-70%+ crypto adoption (Chainalysis top-5 globally)
- **Turkey 2022:** 18-30% adoption during lira crisis
- **Argentina:** 25-40% informal crypto use (rising)
- **Nigeria:** 35-45% adoption despite CBN restrictions

### Impact:
The 35% cap makes the model **unrealistically optimistic** about government's ability to prevent capital flight, even in extreme scenarios.

---

## 2. Root Cause

### Location in Code:
Look for crypto flight accumulation logic, likely in:
- `src/models/cryptoFlight.js` (or similar)
- Simulation calculation functions
- State update functions for crypto adoption

### Current Implementation (from methodology):
```javascript
cryptoFlight(t) = cryptoFlight(t-1) 
                + mStress × 0.022 × cAdopt × crackdown
                + 0.003 × cAdopt

// PROBLEM: Hard cap applied here
cryptoFlight = Math.min(cryptoFlight, 0.35); // ← THIS IS THE ISSUE
```

---

## 3. Required Fix

### Recommended Solution: Variable Cap by Policy Regime

**Replace hard 35% cap with regime-specific caps:**

```javascript
// Define caps based on government response
const CRYPTO_FLIGHT_CAPS = {
  ignore: 0.75,      // Permissive/weak state (Venezuela, El Salvador)
  tax: 0.50,         // Regulated but legal (US/EU model)
  ban: 0.30          // Draconian enforcement (China model)
};

// Apply appropriate cap based on selected policy regime
const currentCap = CRYPTO_FLIGHT_CAPS[cryptoPolicyRegime];
cryptoFlight(t) = Math.min(
  cryptoFlight(t-1) + incrementalGrowth,
  currentCap
);
```

### Rationale:

**75% Cap (Ignore/Permissive):**
- Venezuela real-world: 60-70%+
- El Salvador: Bitcoin legal tender (theoretically 100% but realistically 40-60%)
- Weak/failed states: Unable to enforce restrictions
- **Justification:** Some fiat use persists (taxes, government services), 75% represents ~max realistic adoption

**50% Cap (Tax/Regulate):**
- US/EU restrictive scenario
- Heavy KYC, high taxes (30%+), compliance costs
- Legal but heavily monitored
- **Justification:** ~Half of capital flees despite friction, half stays compliant

**30% Cap (Ban/Draconian):**
- China 2021 model
- Illegal, harsh enforcement, exchange bans
- Underground market only
- **Justification:** Represents hardcore users only, most citizens comply with ban

---

## 4. Implementation Details

### 4.1 If Crypto Policy Dropdown Exists

**Easiest:** Just update the caps associated with each policy option.

**Find code like:**
```javascript
const cryptoPolicy = {
  ignore: { crackdown: 1.0, /* other params */ },
  tax: { crackdown: 0.78, /* other params */ },
  ban: { crackdown: 0.55, /* other params */ }
};
```

**Update to:**
```javascript
const cryptoPolicy = {
  ignore: { 
    crackdown: 1.0,
    flightCap: 0.75,  // ← ADD THIS
    label: "Ignore/Accommodate (Venezuela model)"
  },
  tax: { 
    crackdown: 0.78,
    flightCap: 0.50,  // ← ADD THIS
    label: "Tax & Regulate (UK/EU model)"
  },
  ban: { 
    crackdown: 0.55,
    flightCap: 0.30,  // ← ADD THIS
    label: "Ban & Restrict (China model)"
  }
};
```

**Then in crypto flight calculation:**
```javascript
const policy = cryptoPolicy[selectedPolicy];
const incrementalFlight = mStress * 0.022 * cAdopt * policy.crackdown 
                        + 0.003 * cAdopt;

cryptoFlight = Math.min(
  cryptoFlight + incrementalFlight,
  policy.flightCap  // ← USE REGIME-SPECIFIC CAP
);
```

### 4.2 If No Crypto Policy Dropdown (Just Slider)

**Map slider position to regime assumption:**

```javascript
// Crypto adoption slider (0-1) maps to implicit regime
function getCryptoFlightCap(adoptionSpeed) {
  if (adoptionSpeed >= 0.75) {
    // Venezuela-speed (slider at 75-100%) = Ignore regime
    return 0.75;
  } else if (adoptionSpeed >= 0.40) {
    // Medium speed (slider at 40-75%) = Tax regime
    return 0.50;
  } else {
    // Slow speed (slider at 0-40%) = Ban regime
    return 0.30;
  }
}

const cap = getCryptoFlightCap(cryptoAdoptionSlider);
cryptoFlight = Math.min(cryptoFlight + incrementalGrowth, cap);
```

**Rationale:** Higher slider = assumes weaker government resistance, higher ceiling

---

## 5. User-Facing Changes

### 5.1 Update Slider Label/Description

**Current (if exists):**
> "Crypto Flight Speed: How fast capital migrates to crypto"

**New:**
> "Crypto Flight Speed: How fast capital migrates to crypto  
> **Venezuela (75-100%):** 60-75% max adoption (weak enforcement)  
> **Medium (40-75%):** 40-50% max adoption (regulated but legal)  
> **Slow (0-40%):** 15-30% max adoption (harsh restrictions)"

### 5.2 Add Policy Regime Dropdown (If Not Present)

**Recommended:** Add explicit "Crypto Policy" dropdown separate from speed slider

**Options:**
- **Ignore/Accommodate** (Venezuela, El Salvador) - Max 75% flight
- **Tax & Regulate** (UK, EU, US) - Max 50% flight
- **Ban & Restrict** (China) - Max 30% flight

**Placement:** Near other policy dropdowns (Fiscal Policy, Monetary Policy)

**Default:** "Tax & Regulate" (realistic base case for Western democracies)

---

## 6. Validation & Testing

### 6.1 Test Cases

**Test 1: Venezuela Scenario**
- Crypto slider: 100% (Venezuela speed)
- Policy: Ignore/Accommodate
- Debt/GDP: >175%
- Expected: Crypto flight should reach **70-75%** by 2033-2035

**Test 2: UK/EU Scenario**  
- Crypto slider: 50% (medium)
- Policy: Tax & Regulate
- Debt/GDP: >175%
- Expected: Crypto flight should cap at **~50%** by 2033-2035

**Test 3: China Scenario**
- Crypto slider: 25% (low - represents underground)
- Policy: Ban & Restrict
- Debt/GDP: >175%
- Expected: Crypto flight should cap at **~30%** by 2033-2035

### 6.2 Visual Indicators

**When crypto flight approaches cap:**
- Show warning/indicator: "Crypto adoption approaching policy ceiling (75%)"
- Graph line flattens as it hits cap
- Tooltip explains: "Government policy regime limits maximum adoption to X%"

---

## 7. Methodology Page Updates

### Update Section 7 (Crypto Flight Dynamics)

**Current text:**
> "cryptoFlight capped at 35% of capital stock (model ceiling)"

**Replace with:**
> "cryptoFlight capped at regime-dependent ceiling:
> - **Ignore/Accommodate regime:** 75% max (Venezuela, weak state enforcement)
> - **Tax & Regulate regime:** 50% max (UK/EU heavy regulation)
> - **Ban & Restrict regime:** 30% max (China draconian enforcement)
> 
> Caps reflect empirical limits: Even Venezuela (~70% adoption) retains some 
> fiat use for taxes and government services. China's ban (~5% formal adoption) 
> still permits 25-30% underground market. The caps are not arbitrary—they 
> represent observed real-world ceilings based on government response severity."

### Add Table:

| Policy Regime | Crypto Flight Cap | Real-World Examples | Rationale |
|---------------|-------------------|---------------------|-----------|
| **Ignore/Accommodate** | 75% | Venezuela (60-70%), El Salvador (40-60%) | Weak/absent enforcement, crypto becomes de facto currency. Some fiat persists for government services. |
| **Tax & Regulate** | 50% | UK (restrictive), EU (MiCA), India (30% tax) | Legal but heavily monitored. ~50% flee despite friction, ~50% stay compliant. |
| **Ban & Restrict** | 30% | China (2021 ban), Vietnam (illegal) | Underground only. Most citizens comply, hardcore users persist. |

---

## 8. Code Changes Summary

### Files Likely Affected:
1. **Crypto flight calculation logic** - Update cap from 0.35 to regime-specific
2. **Policy regime definitions** - Add `flightCap` property to each regime
3. **UI components** - Update slider labels, add policy dropdown if needed
4. **Methodology page** - Update Section 7 text and add cap explanation table

### Required Changes:

**Change 1: Remove Hard Cap**
```javascript
// OLD (REMOVE THIS):
cryptoFlight = Math.min(cryptoFlight + growth, 0.35);

// NEW (REPLACE WITH):
const cap = getCryptoFlightCap(selectedPolicy);
cryptoFlight = Math.min(cryptoFlight + growth, cap);
```

**Change 2: Add Cap Getter Function**
```javascript
function getCryptoFlightCap(policyRegime) {
  const caps = {
    ignore: 0.75,
    tax: 0.50,
    ban: 0.30
  };
  return caps[policyRegime] || 0.50; // Default to tax regime
}
```

**Change 3: Update Policy Definitions**
```javascript
const CRYPTO_POLICIES = {
  ignore: {
    name: "Ignore/Accommodate",
    description: "Venezuela model - weak enforcement",
    crackdown: 1.0,
    flightCap: 0.75,
    taxOffset: 0,
    btcPriceShock: 0
  },
  tax: {
    name: "Tax & Regulate",
    description: "UK/EU model - legal but restrictive",
    crackdown: 0.78,
    flightCap: 0.50,
    taxOffset: 0.04,
    btcPriceShock: -0.08
  },
  ban: {
    name: "Ban & Restrict",
    description: "China model - illegal, harsh enforcement",
    crackdown: 0.55,
    flightCap: 0.30,
    taxOffset: 0,
    btcPriceShock: -0.25
  }
};
```

---

## 9. Success Criteria

**Fix is successful if:**

1. ✅ Venezuela scenario (ignore regime) reaches **70-75% crypto flight** by 2033-2035
2. ✅ UK/EU scenario (tax regime) caps at **~50% crypto flight**
3. ✅ China scenario (ban regime) caps at **~30% crypto flight**
4. ✅ No console errors or broken functionality
5. ✅ Methodology page updated with new caps and rationale
6. ✅ User can clearly see which regime is active and what cap applies
7. ✅ Crisis becomes appropriately severe in Venezuela scenario (should be worse than current)

---

## 10. Expected Impact on Crisis Severity

### Before Fix (35% cap):
- Max crypto flight: 25-35%
- Fiscal erosion: Moderate
- Crisis severity: Understated

### After Fix (75% cap in Venezuela scenario):
- Max crypto flight: 70-75%
- Fiscal erosion: Severe (Loop 1 + Loop 4 fully active)
- Crisis severity: Realistic

**Specific changes in Venezuela scenario:**
- Tax erosion: Doubles (from ~2.8% to ~6% of GDP)
- Seigniorage loss: Doubles (from ~0.6% to ~1.4% of GDP)
- Ghost GDP drag: Doubles (from ~0.9% to ~1.9% annual growth loss)
- K-shape acceleration: Increases (capital holders exit, labor trapped)

**Result:** Crisis breaks faster and harder in high-adoption scenarios (as it should)

---

## 11. Optional Enhancement: Dynamic Cap Messaging

**Add tooltip/indicator showing active cap:**

```javascript
// In UI near crypto flight graph
if (cryptoFlight > policy.flightCap * 0.9) {
  showWarning(
    `Crypto adoption approaching ${policy.name} policy ceiling (${policy.flightCap * 100}%). 
     Government ${policy.name} enforcement limits maximum adoption.`
  );
}
```

**Visual:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Crypto Adoption: 68%                 │
│ Approaching policy ceiling (75%)        │
│                                         │
│ Current regime: Ignore/Accommodate      │
│ Max adoption: 75% (Venezuela model)     │
└─────────────────────────────────────────┘
```

---

## 12. Rollback Plan

**If changes cause issues:**

1. **Quick fix:** Revert to 35% hard cap
2. **Partial rollback:** Use 50% cap universally (middle ground)
3. **Full rollback:** Restore original code from git history

**Testing before deploy:**
- Test all 3 policy regimes
- Verify graphs render correctly
- Check no infinite loops or crashes
- Validate methodology page updates

---

**END OF REQUIREMENTS**

---

## Quick Reference for Claude Code

**TL;DR:**
1. Find where `cryptoFlight` is capped at 0.35
2. Replace with regime-specific caps: 0.75 (ignore), 0.50 (tax), 0.30 (ban)
3. Update methodology page Section 7 to explain new caps
4. Test Venezuela scenario reaches 70-75% adoption

**Priority:** HIGH - This is preventing realistic crisis modeling
**Difficulty:** LOW - Simple cap value change + policy regime awareness
**Impact:** HIGH - Makes Venezuela/severe scenarios appropriately catastrophic
