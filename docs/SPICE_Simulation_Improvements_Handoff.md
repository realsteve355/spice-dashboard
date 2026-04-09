# SPICE Simulation Page - Improvement Package

**Project:** SPICE Dashboard (zpc.finance)  
**Target:** Simulation Page  
**Implementation:** Claude Code  
**Date:** 2026-03-13  
**Priority:** HIGH

---

## Executive Summary

Three critical improvements to the Simulation page:

1. **Fix Crypto Flight Cap** - Remove unrealistic 35% ceiling, replace with regime-specific caps (30-75%)
2. **Replace Bitcoin Banner with Gini** - Better conceptual consistency (all state indicators, not outcomes)
3. **Add Transparency Features** - Criticality colors + Crisis Thresholds panel

**Total effort:** ~4-6 hours  
**Impact:** Makes model realistic (Venezuela scenarios), transparent (visible thresholds), and conceptually clean (consistent banners)

---

## IMPROVEMENT 1: Fix Crypto Flight Cap

### Problem
Crypto flight is capped at 35% of capital stock, preventing realistic high-adoption scenarios.

**Real-world data:**
- Venezuela: 60-70%+ adoption (Chainalysis top-5 globally)
- Turkey: 18-30% during lira crisis
- Argentina: 25-40% informal adoption
- Nigeria: 35-45% despite restrictions

**Current model:** Can't exceed ~25% even with Venezuela slider setting

**Impact:** Severely underestimates crisis in extreme scenarios

### Solution
Replace hard 35% cap with **regime-specific caps** based on government policy:

```javascript
const CRYPTO_FLIGHT_CAPS = {
  ignore: 0.75,      // Venezuela/El Salvador - weak/absent enforcement
  tax: 0.50,         // UK/EU - legal but heavily regulated
  ban: 0.30          // China - draconian enforcement, underground only
};

// Apply appropriate cap
const currentCap = CRYPTO_FLIGHT_CAPS[cryptoPolicyRegime];
cryptoFlight = Math.min(cryptoFlight + incrementalGrowth, currentCap);
```

### Files to Update
- Crypto flight calculation logic (look for `Math.min(cryptoFlight, 0.35)`)
- Policy regime definitions (add `flightCap` property)
- Methodology page Section 7 (update cap explanation)

### Success Criteria
✅ Venezuela scenario reaches 70-75% crypto flight by 2033-2035  
✅ UK/EU scenario caps at ~50%  
✅ China scenario caps at ~30%  
✅ Crisis becomes appropriately severe in high-adoption scenarios

**Full requirements:** `/mnt/user-data/outputs/Crypto_Flight_Cap_Fix_Requirements.md`

---

## IMPROVEMENT 2: Replace Bitcoin Banner with Gini Coefficient

### Problem
**Current top banners:**
1. Debt/GDP → macro state ✓
2. Inflation → macro state ✓
3. Unemployment → macro state ✓
4. Bond Yields → macro state ✓
5. Crypto Adoption → macro state ✓
6. **Bitcoin/USD** → investment outcome ✗ (inconsistent!)

**Issues:**
- Bitcoin price is an *outcome*, not a state variable
- Mixes state indicators with investment returns (conceptually messy)
- K-shape graph (Labour vs Capital) has no banner representation

### Solution
**Replace Bitcoin/USD banner with Gini Coefficient:**

**New banner row:**
1. Debt/GDP → Debt/GDP graph ✓
2. Inflation → Inflation graph ✓
3. Unemployment → Unemployment graph ✓
4. Bond Yields → Bond Yields graph ✓
5. Crypto Adoption → Crypto Adoption graph ✓
6. **Gini Coefficient** → K-shape graph ✓

**Why this works:**
- All 6 banners now represent macro state indicators (consistent)
- Each maps to one of the 6 graphs below
- Bitcoin price still visible in Bitcoin Price graph and Dashboard NAV
- K-shape finally represented in top indicators

### Gini Criticality Thresholds

```javascript
function getGiniCriticalityColor(value) {
  if (value >= 0.60) return 'red';     // Crisis (revolutionary levels)
  if (value >= 0.55) return 'orange';  // Danger (extreme inequality)
  if (value >= 0.50) return 'yellow';  // Warning (high inequality)
  return 'green';                      // Safe (US current ~0.48)
}
```

### Implementation

**Remove:**
```html
<div class="indicator-box">
  <span class="indicator-label">Bitcoin/USD</span>
  <span class="indicator-value">$850,000</span>
</div>
```

**Add:**
```html
<div class="indicator-box">
  <span class="indicator-label">Gini Coefficient</span>
  <span class="indicator-value criticality-red">0.62</span>
</div>
```

### Success Criteria
✅ Bitcoin/USD banner removed from top row  
✅ Gini Coefficient banner added  
✅ Gini value reflects K-shape graph calculation  
✅ Bitcoin price still visible in graph and dashboard  
✅ All 6 banners conceptually consistent

---

## IMPROVEMENT 3: Transparency Features

### A) Criticality-Based Text Colors

**Current problem:**
- Unemployment at 12% shows GREEN (graph color) but should show ORANGE (danger)
- Users can't tell if color means "graph color" or "dangerous"

**Solution:**
Decouple text color from graph color. Use criticality levels:

```javascript
// Example for Debt/GDP
function getDebtCriticalityColor(value) {
  if (value >= 175) return 'red';      // Crisis
  if (value >= 150) return 'orange';   // Danger
  if (value >= 120) return 'yellow';   // Warning
  return 'green';                      // Safe
}
```

**CSS:**
```css
.criticality-green { color: #10b981; font-weight: 600; }
.criticality-yellow { color: #f59e0b; font-weight: 600; }
.criticality-orange { color: #f97316; font-weight: 700; }
.criticality-red { color: #dc2626; font-weight: 700; }
```

**Apply to all 6 indicators:**
- Debt/GDP
- Inflation (bidirectional: >15% OR <-7% = red)
- Unemployment
- Bond Yields
- Crypto Adoption
- Gini Coefficient

### B) Crisis Thresholds Panel

**Current problem:**
Year boxes turn yellow/orange/red but users don't know why.

**Solution:**
Add "ℹ️ Crisis Thresholds" button near timeline that shows panel with all thresholds.

**Panel content:**
```
CRISIS THRESHOLDS

Year Color Logic:
• GREEN: All indicators safe
• YELLOW: Warning threshold exceeded
• ORANGE: Danger threshold exceeded  
• RED: Crisis threshold exceeded

────────────────────────────────

Debt/GDP:
🟢 Safe: <120%
🟡 Warning: 120-150%
🟠 Danger: 150-175%
🔴 Crisis: >175%

[... similar for all 6 indicators including Gini ...]
```

**UI:**
- Button: Top-right near timeline
- Panel: Click/hover to open, X to close
- Mobile responsive
- Close on outside click

### Success Criteria
✅ Text colors reflect criticality, not graph colors  
✅ Thresholds panel accessible and clear  
✅ All 6 indicators (including Gini) shown with ranges  
✅ Users understand what triggers each year color  
✅ Mobile responsive

**Full requirements:** `/mnt/user-data/outputs/Simulation_UX_Improvements_Requirements.md`

---

## Implementation Order

**Phase 1: Crypto Flight Cap (30 min)**
1. Find crypto flight cap logic
2. Replace 0.35 with regime-specific caps
3. Test Venezuela scenario → should hit 70-75%

**Phase 2: Bitcoin → Gini Banner (45 min)**
1. Remove Bitcoin/USD banner component
2. Add Gini Coefficient banner
3. Wire to K-shape calculation
4. Apply criticality colors

**Phase 3: Criticality Colors (1 hour)**
1. Define threshold functions for all 6 indicators
2. Replace graph colors with criticality colors
3. Test all scenarios (safe/warning/danger/crisis)

**Phase 4: Thresholds Panel (2 hours)**
1. Create panel UI (HTML/CSS)
2. Add button near timeline
3. Wire show/hide/close logic
4. Populate with all 6 threshold tables
5. Test mobile responsive

**Phase 5: Testing (1 hour)**
1. Test all slider combinations
2. Verify colors accurate across scenarios
3. Check thresholds panel completeness
4. Mobile testing
5. Update methodology page

**Total: ~5 hours**

---

## Testing Checklist

### Crypto Flight Cap
- [ ] Venezuela (ignore) → 70-75% max
- [ ] UK/EU (tax) → ~50% max
- [ ] China (ban) → ~30% max
- [ ] Crisis severity increases appropriately

### Bitcoin → Gini
- [ ] Bitcoin banner removed
- [ ] Gini banner present
- [ ] Value matches K-shape graph
- [ ] Bitcoin price still visible in graph/dashboard
- [ ] Criticality color applied correctly

### Criticality Colors
- [ ] Debt 180% → RED
- [ ] Unemployment 12% → ORANGE
- [ ] Inflation 14% → RED
- [ ] All 6 indicators have correct colors
- [ ] No confusion with graph colors

### Thresholds Panel
- [ ] Button visible and clickable
- [ ] Panel shows all 6 indicators (including Gini)
- [ ] Ranges accurate and clear
- [ ] Opens/closes cleanly
- [ ] Mobile responsive
- [ ] Close on outside click works

---

## Methodology Page Updates

### Section 7 (Crypto Flight Dynamics)

**Current:**
> "cryptoFlight capped at 35% of capital stock (model ceiling)"

**Replace with:**
> "cryptoFlight capped at regime-dependent ceiling:
> - **Ignore/Accommodate regime:** 75% max (Venezuela, weak state)
> - **Tax & Regulate regime:** 50% max (UK/EU heavy regulation)  
> - **Ban & Restrict regime:** 30% max (China draconian enforcement)
> 
> Caps reflect empirical limits based on government response severity."

**Add table:**

| Policy Regime | Cap | Real Examples | Rationale |
|---------------|-----|---------------|-----------|
| Ignore/Accommodate | 75% | Venezuela (60-70%), El Salvador | Weak enforcement, crypto becomes de facto currency |
| Tax & Regulate | 50% | UK, EU, India | Legal but monitored, ~half flee despite friction |
| Ban & Restrict | 30% | China, Vietnam | Underground only, most comply |

### New Section: Visual Criticality Indicators

Add after Section 3.3 (Break Point Logic):

```markdown
#### Visual Criticality Indicators

The simulation uses color-coded indicators to signal criticality levels:

| Color | Meaning | Example |
|-------|---------|---------|
| 🟢 Green | Safe | Debt <120%, Inflation 2-6%, Unemployment <8%, Gini <0.50 |
| 🟡 Yellow | Warning | Debt 120-150%, Inflation 6-10%, Unemployment 8-12%, Gini 0.50-0.55 |
| 🟠 Orange | Danger | Debt 150-175%, Inflation 10-15%, Unemployment 12-20%, Gini 0.55-0.60 |
| 🔴 Red | Crisis | Debt >175%, Inflation >15%, Unemployment >20%, Gini >0.60 |

**Timeline Year Colors:** Based on worst indicator for that year.

See full threshold table in simulation's "Crisis Thresholds" panel.
```

---

## Files Likely Affected

**JavaScript/React:**
- `src/components/Simulation.jsx` (or similar) - main simulation page
- `src/models/cryptoFlight.js` - crypto flight calculation
- `src/components/IndicatorBanners.jsx` - top indicator boxes
- `src/components/ThresholdsPanel.jsx` - NEW component
- `src/utils/criticalityColors.js` - NEW utility functions

**CSS:**
- `src/styles/simulation.css` - criticality colors, panel styles

**Static:**
- `public/spice-methodology.html` - methodology page updates

---

## Rollback Plan

If issues arise:

**Quick fixes:**
1. Crypto cap: Revert to 50% universal cap (middle ground)
2. Gini banner: Revert to Bitcoin/USD temporarily
3. Criticality colors: Keep graph colors temporarily
4. Thresholds panel: Hide button (feature flag)

**Full rollback:** Git revert to pre-change commit

---

## Priority & Impact

**Priority:** HIGH
- Crypto cap: Makes Venezuela scenarios realistic (currently broken)
- Gini banner: Conceptual consistency (currently messy)
- Transparency: User trust (currently opaque)

**Difficulty:** MEDIUM
- Crypto cap: LOW (simple value change)
- Gini banner: LOW-MEDIUM (component swap)
- Criticality colors: MEDIUM (threshold logic)
- Thresholds panel: MEDIUM (new UI component)

**Impact:** HIGH
- Venezuela scenarios become appropriately catastrophic
- Model becomes self-documenting
- Conceptual clarity for users
- Professional polish

---

## Expected Results

### Before Improvements:
- Crypto flight capped at 25-35% (unrealistic)
- Bitcoin banner inconsistent with other state indicators
- Users confused by color meanings
- Crisis thresholds hidden (requires guessing)

### After Improvements:
- Crypto flight reaches 70-75% in Venezuela scenarios (realistic)
- All 6 banners are macro state indicators (clean)
- Colors clearly signal danger levels
- Thresholds transparent and discoverable

**Net result:** Model is more realistic, more transparent, and more professional.

---

## Contact & Questions

Full detailed requirements available in:
- `/mnt/user-data/outputs/Crypto_Flight_Cap_Fix_Requirements.md`
- `/mnt/user-data/outputs/Simulation_UX_Improvements_Requirements.md`

For questions or clarifications, reference these documents or ask Steve.

---

**END OF HANDOFF DOCUMENT**
