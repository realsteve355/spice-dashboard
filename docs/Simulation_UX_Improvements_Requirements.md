# Simulation Page UX Improvements - Requirements Document

**Project:** SPICE Dashboard - Simulation Page  
**Feature:** Enhanced Visual Feedback & Threshold Transparency  
**Target Implementation:** Claude Code  
**Date:** 2026-03-13

---

## 1. Overview

Three UX improvements to make the simulation more intuitive:

**Problem 1:** Indicator boxes use graph colors (for visual linking) but this conflicts with criticality signaling  
**Problem 2:** Crisis thresholds are hidden - users must guess what triggers yellow/orange/red states  
**Problem 3:** Bitcoin/USD banner is inconsistent - it's an investment outcome, not a macro state indicator; K-shape graph has no banner representation

**Solution 1:** Use criticality-based text colors (green/yellow/red) independent of graph colors  
**Solution 2:** Add hoverable "Crisis Thresholds" info panel showing exact trigger levels  
**Solution 3:** Replace Bitcoin/USD banner with Gini Coefficient banner (represents K-shape graph)

---

## 2. Improvement 1: Replace Bitcoin Banner with Gini Coefficient

### 2.1 Current Behavior (Problem)

**Top indicator banners (left to right):**
1. Debt/GDP → Maps to Debt/GDP graph ✓
2. Inflation → Maps to Inflation graph ✓
3. Unemployment → Maps to Unemployment graph ✓
4. Bond Yields → Maps to Bond Yields graph ✓
5. Crypto Adoption → Maps to Crypto Adoption graph ✓
6. **Bitcoin/USD** → Investment outcome metric (inconsistent) ✗

**The inconsistency:**
- First 5 banners = **macro state indicators** (economic conditions)
- Bitcoin banner = **investment return** (SPICE portfolio performance)
- K-shape graph (Labour vs Capital) = **no banner representation**

**Problems:**
- Bitcoin/USD is an *outcome* (depends on other variables), not a state variable
- All other banners represent economic *conditions*, Bitcoin represents *investment performance*
- The K-shape graph is arguably the most important long-term indicator but has no banner
- Conceptually messy: mixing state indicators with outcome metrics

### 2.2 New Behavior (Solution)

**Replace Bitcoin/USD banner with Gini Coefficient banner:**

**New banner row:**
1. Debt/GDP → Maps to Debt/GDP graph ✓
2. Inflation → Maps to Inflation graph ✓
3. Unemployment → Maps to Unemployment graph ✓
4. Bond Yields → Maps to Bond Yields graph ✓
5. Crypto Adoption → Maps to Crypto Adoption graph ✓
6. **Gini Coefficient** → Maps to Labour vs Capital (K-shape) graph ✓

**Why this works:**
- All 6 banners now represent **macro state indicators** (consistent)
- Each banner maps cleanly to one of the 6 graphs below
- K-shape graph finally represented in banner row
- Bitcoin price still visible in Bitcoin Price graph (below banners) and Dashboard NAV
- Cleaner conceptual model: state indicators in banners, outcomes in graphs/dashboard

### 2.3 Gini Coefficient Details

**What it measures:** Income/wealth inequality (0 = perfect equality, 1 = perfect inequality)

**Real-world context:**
- Norway/Denmark: ~0.27-0.28 (low inequality)
- US current: ~0.48 (high for developed country)
- Brazil: ~0.54 (high inequality)
- South Africa: ~0.63 (highest globally)
- Pre-revolutionary France (1789): ~0.59

**SPICE model range:** 0.48 (starting) → 0.65+ (crisis scenarios)

### 2.4 Gini Criticality Thresholds

```javascript
function getGiniCriticalityColor(value) {
  if (value >= 0.60) return 'red';     // Crisis (revolutionary levels)
  if (value >= 0.55) return 'orange';  // Danger (extreme inequality)
  if (value >= 0.50) return 'yellow';  // Warning (high inequality)
  return 'green';                      // Safe (current US ~0.48)
}
```

**Color logic:**
- 🟢 **Green (<0.50):** Stable inequality, typical for developed economies
- 🟡 **Yellow (0.50-0.55):** High inequality (Brazil/South Africa range), warning sign
- 🟠 **Orange (0.55-0.60):** Extreme inequality, social instability risk
- 🔴 **Red (>0.60):** Revolutionary levels (pre-1789 France, failed states)

### 2.5 Implementation

**HTML - Remove Bitcoin banner:**
```html
<!-- OLD (REMOVE THIS) -->
<div class="indicator-box">
  <span class="indicator-label">Bitcoin/USD</span>
  <span class="indicator-value criticality-orange">$850,000</span>
</div>
```

**HTML - Add Gini banner:**
```html
<!-- NEW (ADD THIS) -->
<div class="indicator-box">
  <span class="indicator-label">Gini Coefficient</span>
  <span class="indicator-value criticality-red">0.62</span>
</div>
```

**JavaScript - Calculate Gini value:**
```javascript
// Gini calculation (already exists in model for K-shape graph)
// Labour share + Capital share ≈ 85% of GDP (see methodology)
// Gini approximation from income shares:
const gini = calculateGiniFromShares(labourShare, capitalShare);

// Apply criticality color
const giniColor = getGiniCriticalityColor(gini);
```

### 2.6 What Happens to Bitcoin Price Visibility?

**Bitcoin price remains highly visible:**
1. ✅ **Bitcoin Price graph** (below banners) - shows full 2026-2040 timeline
2. ✅ **Dashboard NAV section** - shows current Bitcoin price affecting portfolio value
3. ✅ **Gold/Crypto stress index graph** - shows combined hard asset performance

**The top banner row is for macro *state* indicators, not investment *outcomes*.**

Bitcoin price is an outcome that depends on:
- Monetary stress index
- Crypto flight dynamics  
- Policy regime
- Debt/GDP levels

It belongs in graphs/dashboard, not in the state indicator banner row.

### 2.7 Conceptual Consistency

**Before (inconsistent):**
```
State Indicators:              Outcome Metric:
Debt | Inflation | Unemployment | Yields | Crypto → Bitcoin Price
  ↓        ↓            ↓           ↓        ↓           ↑
Input   Input       Input       Input    Input      OUTPUT
```

**After (consistent):**
```
All State Indicators:
Debt | Inflation | Unemployment | Yields | Crypto | Inequality
  ↓        ↓            ↓           ↓        ↓          ↓
Graph 1  Graph 2     Graph 3     Graph 4  Graph 5   Graph 6 (K-shape)
```

**The story the 6 banners tell:**
1. **Debt/GDP** - Can government afford its debt?
2. **Inflation** - Is currency being debased?
3. **Unemployment** - How many displaced by AI?
4. **Bond Yields** - Are markets losing confidence?
5. **Crypto Adoption** - How fast is capital fleeing?
6. **Gini Coefficient** - Who's winning/losing from the crisis?

Together: **Complete snapshot of crisis state at any year.**

---

## 3. Improvement 2: Criticality-Based Text Colors

### 3.1 Current Behavior (Problem)

**Indicator boxes at top:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Debt/GDP     │  │ Inflation    │  │ Unemployment │
│ 175%         │  │ 12%          │  │ 9%           │
│ (blue text)  │  │ (red text)   │  │ (green text) │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Current logic:** Text color matches graph line color
- Debt/GDP: Blue (because graph line is blue)
- Inflation: Red (because graph line is red)
- Unemployment: Green (because graph line is green)

**The problem:**
- Unemployment at 9% shows GREEN (graph color) but should show YELLOW/RED (critical level)
- Inflation at 12% shows RED (graph color) but red also means "danger" - confusing if that's just the graph color
- Users can't tell if color means "this is the graph color" or "this is dangerous"

### 3.2 New Behavior (Solution)

**Decouple text color from graph color. Use criticality levels instead:**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Debt/GDP     │  │ Inflation    │  │ Unemployment │
│ 175%         │  │ 12%          │  │ 9%           │
│ (RED text)   │  │ (RED text)   │  │ (YELLOW text)│
└──────────────┘  └──────────────┘  └──────────────┘
     ↑                  ↑                  ↑
  Crisis level     Crisis level      Warning level
```

**Keep graph line colors as-is** (for visual tracking) but text color signals criticality.

### 3.3 Criticality Thresholds

Define criticality levels for each indicator:

#### Debt/GDP
```javascript
function getDebtCriticalityColor(value) {
  if (value >= 175) return 'red';      // Crisis
  if (value >= 150) return 'orange';   // Danger
  if (value >= 120) return 'yellow';   // Warning
  return 'green';                      // Safe
}
```

#### Inflation
```javascript
function getInflationCriticalityColor(value) {
  if (value >= 15 || value <= -7) return 'red';     // Crisis (hyper or severe deflation)
  if (value >= 10 || value <= -4) return 'orange';  // Danger
  if (value >= 6 || value <= -2) return 'yellow';   // Warning
  return 'green';                                    // Safe (2-6%)
}
```

#### Unemployment
```javascript
function getUnemploymentCriticalityColor(value) {
  if (value >= 20) return 'red';       // Crisis (depression level)
  if (value >= 12) return 'orange';    // Danger
  if (value >= 8) return 'yellow';     // Warning
  return 'green';                      // Safe (<8%)
}
```

#### Bond Yields
```javascript
function getYieldCriticalityColor(value, debtLevel) {
  // Yields are crisis when combined with high debt
  if (value >= 10) return 'red';       // Crisis (markets panicking)
  if (value >= 7 && debtLevel >= 150) return 'red';   // Crisis combo
  if (value >= 6) return 'orange';     // Danger
  if (value >= 5) return 'yellow';     // Warning
  return 'green';                      // Safe
}
```

#### Crypto Adoption
```javascript
function getCryptoAdoptionCriticalityColor(value) {
  // High crypto adoption signals crisis (capital flight)
  if (value >= 60) return 'red';       // Crisis (mass exodus)
  if (value >= 40) return 'orange';    // Danger
  if (value >= 20) return 'yellow';    // Warning
  return 'green';                      // Normal
}
```

#### Gini Coefficient
```javascript
function getGiniCriticalityColor(value) {
  if (value >= 0.60) return 'red';     // Crisis (extreme inequality)
  if (value >= 0.55) return 'orange';  // Danger
  if (value >= 0.50) return 'yellow';  // Warning
  return 'green';                      // Safe
}
```

### 3.4 Implementation

**HTML Structure (current):**
```html
<div class="indicator-box">
  <span class="indicator-label">Debt/GDP</span>
  <span class="indicator-value" style="color: blue;">175%</span>
</div>
```

**HTML Structure (new):**
```html
<div class="indicator-box">
  <span class="indicator-label">Debt/GDP</span>
  <span class="indicator-value criticality-red">175%</span>
  <!-- Optional: small graph color dot for visual linking -->
  <span class="graph-color-indicator" style="background: blue;"></span>
</div>
```

**CSS:**
```css
.criticality-green {
  color: #10b981;  /* Green - safe */
  font-weight: 600;
}

.criticality-yellow {
  color: #f59e0b;  /* Amber/Yellow - warning */
  font-weight: 600;
}

.criticality-orange {
  color: #f97316;  /* Orange - danger */
  font-weight: 700;
}

.criticality-red {
  color: #dc2626;  /* Red - crisis */
  font-weight: 700;
}

/* Optional: Small graph color dot for visual linking */
.graph-color-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 6px;
  vertical-align: middle;
}
```

### 3.5 Optional: Keep Graph Color as Accent

If you still want visual linking to graphs, add small colored dot:

```
┌──────────────────────┐
│ Debt/GDP             │
│ 175% • ← red text    │
│      ↑               │
│   blue dot (graph)   │
└──────────────────────┘
```

**This gives you both:**
- Red text = criticality (dangerous!)
- Blue dot = graph color (for visual tracking)

---

## 4. Improvement 3: Crisis Thresholds Info Panel

### 4.1 Current Behavior (Problem)

**Timeline boxes at top change color:**
```
[2026] [2027] [2028] [2029] [2030] [2031]
Green  Green  Yellow Orange  Red    Red
```

**But users don't know:**
- Why did 2029 turn orange?
- What exactly triggers red?
- What are the thresholds for each indicator?

**Missing:** Transparent explanation of crisis logic

### 4.2 New Behavior (Solution)

**Add "Crisis Thresholds" info button/panel near timeline**

**Location:** Top-right of simulation area, near year timeline

**UI Element:**
```
┌─────────────────────────────────────────────────┐
│ [2026] [2027] [2028] [2029] [2030]  [ℹ️ Thresholds] │
│ Green  Green  Yellow Orange  Red                │
└─────────────────────────────────────────────────┘
```

**On hover/click, show panel:**

```
┌──────────────────────────────────────────────────┐
│ CRISIS THRESHOLDS                          [×]   │
├──────────────────────────────────────────────────┤
│                                                  │
│ Year Color Logic:                                │
│ • GREEN: All indicators safe                     │
│ • YELLOW: One warning threshold exceeded         │
│ • ORANGE: One danger threshold exceeded          │
│ • RED: Crisis threshold exceeded                 │
│                                                  │
│ ────────────────────────────────────────────     │
│                                                  │
│ Debt/GDP:                                        │
│ 🟢 Safe: <120%                                   │
│ 🟡 Warning: 120-150%                             │
│ 🟠 Danger: 150-175%                              │
│ 🔴 Crisis: >175%                                 │
│                                                  │
│ Inflation:                                       │
│ 🟢 Safe: 2-6%                                    │
│ 🟡 Warning: 6-10% or (-2)-0%                     │
│ 🟠 Danger: 10-15% or (-4)-(-2%)                  │
│ 🔴 Crisis: >15% or <-7%                          │
│                                                  │
│ Unemployment:                                    │
│ 🟢 Safe: <8%                                     │
│ 🟡 Warning: 8-12%                                │
│ 🟠 Danger: 12-20%                                │
│ 🔴 Crisis: >20%                                  │
│                                                  │
│ Bond Yields:                                     │
│ 🟢 Safe: <5%                                     │
│ 🟡 Warning: 5-6%                                 │
│ 🟠 Danger: 6-7%                                  │
│ 🔴 Crisis: >10% OR (>7% AND Debt>150%)           │
│                                                  │
│ Crypto Adoption:                                 │
│ 🟢 Normal: <20%                                  │
│ 🟡 Warning: 20-40%                               │
│ 🟠 Danger: 40-60%                                │
│ 🔴 Crisis: >60%                                  │
│                                                  │
│ Gini Coefficient:                                │
│ 🟢 Safe: <0.50 (US current ~0.48)                │
│ 🟡 Warning: 0.50-0.55 (Brazil level)             │
│ 🟠 Danger: 0.55-0.60 (extreme inequality)        │
│ 🔴 Crisis: >0.60 (revolutionary levels)          │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 4.3 Implementation

#### HTML Structure:
```html
<!-- Near timeline boxes -->
<div class="timeline-container">
  <div class="year-boxes">
    <div class="year-box year-green">2026</div>
    <div class="year-box year-green">2027</div>
    <div class="year-box year-yellow">2028</div>
    <div class="year-box year-orange">2029</div>
    <div class="year-box year-red">2030</div>
  </div>
  
  <!-- NEW: Thresholds button -->
  <button class="thresholds-button" id="show-thresholds">
    <span class="icon">ℹ️</span>
    <span class="text">Crisis Thresholds</span>
  </button>
</div>

<!-- NEW: Thresholds panel (hidden by default) -->
<div class="thresholds-panel" id="thresholds-panel" style="display: none;">
  <div class="panel-header">
    <h3>Crisis Thresholds</h3>
    <button class="close-button" id="close-thresholds">×</button>
  </div>
  
  <div class="panel-content">
    <div class="threshold-section">
      <h4>Year Color Logic:</h4>
      <ul class="logic-list">
        <li><span class="dot green"></span> GREEN: All indicators safe</li>
        <li><span class="dot yellow"></span> YELLOW: Warning threshold exceeded</li>
        <li><span class="dot orange"></span> ORANGE: Danger threshold exceeded</li>
        <li><span class="dot red"></span> RED: Crisis threshold exceeded</li>
      </ul>
    </div>
    
    <hr>
    
    <!-- Repeat for each indicator -->
    <div class="threshold-indicator">
      <h4>Debt/GDP:</h4>
      <div class="threshold-levels">
        <div class="level safe">🟢 Safe: <120%</div>
        <div class="level warning">🟡 Warning: 120-150%</div>
        <div class="level danger">🟠 Danger: 150-175%</div>
        <div class="level crisis">🔴 Crisis: >175%</div>
      </div>
    </div>
    
    <!-- ... more indicators ... -->
  </div>
</div>
```

#### CSS:
```css
/* Thresholds Button */
.thresholds-button {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  transition: all 0.2s;
}

.thresholds-button:hover {
  background: #f8f9fa;
  border-color: #2563eb;
}

.thresholds-button .icon {
  font-size: 16px;
}

/* Thresholds Panel */
.thresholds-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border: 2px solid #2563eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 1000;
  padding: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #1a1a1a;
}

.panel-content {
  padding: 20px 24px;
}

.threshold-section {
  margin-bottom: 20px;
}

.threshold-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.logic-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.logic-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: #2d2d2d;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.dot.green { background: #10b981; }
.dot.yellow { background: #f59e0b; }
.dot.orange { background: #f97316; }
.dot.red { background: #dc2626; }

.threshold-indicator {
  margin-bottom: 24px;
}

.threshold-indicator h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.threshold-levels {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.level.safe {
  background: #d1fae5;
  color: #065f46;
}

.level.warning {
  background: #fef3c7;
  color: #92400e;
}

.level.danger {
  background: #fed7aa;
  color: #9a3412;
}

.level.crisis {
  background: #fee2e2;
  color: #991b1b;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .thresholds-panel {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
}
```

#### JavaScript:
```javascript
// Show/hide thresholds panel
document.getElementById('show-thresholds').addEventListener('click', function() {
  const panel = document.getElementById('thresholds-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('close-thresholds').addEventListener('click', function() {
  document.getElementById('thresholds-panel').style.display = 'none';
});

// Close panel when clicking outside
document.addEventListener('click', function(event) {
  const panel = document.getElementById('thresholds-panel');
  const button = document.getElementById('show-thresholds');
  
  if (!panel.contains(event.target) && !button.contains(event.target)) {
    panel.style.display = 'none';
  }
});
```

### 4.4 Alternative: Tooltip on Hover

**Simpler implementation:** Tooltip instead of full panel

```html
<button class="thresholds-button" 
        title="Click to see crisis thresholds">
  ℹ️ Thresholds
</button>
```

**Or use a library like Tippy.js for rich tooltips:**
```javascript
tippy('#show-thresholds', {
  content: document.getElementById('thresholds-content'),
  allowHTML: true,
  interactive: true,
  theme: 'light-border',
  placement: 'bottom-end',
  maxWidth: 400
});
```

---

## 5. Update Methodology Page

### Add to existing break point logic section:

**Current text (Section 3.3):**
> The simulation flags a fiscal break point — the year in which the system crosses a threshold suggesting a major disruptive event...

**Add new subsection:**

```markdown
#### Visual Criticality Indicators

The simulation uses color-coded indicators to signal criticality levels 
across all six tracked variables. These colors represent **economic risk**, 
not graph line colors.

**Criticality Levels:**

| Color | Meaning | Example |
|-------|---------|---------|
| 🟢 **Green** | Safe | Debt/GDP <120%, Inflation 2-6%, Unemployment <8% |
| 🟡 **Yellow** | Warning | Debt/GDP 120-150%, Inflation 6-10%, Unemployment 8-12% |
| 🟠 **Orange** | Danger | Debt/GDP 150-175%, Inflation 10-15%, Unemployment 12-20% |
| 🔴 **Red** | Crisis | Debt/GDP >175%, Inflation >15%, Unemployment >20% |

**Timeline Year Colors:**

Each year in the simulation timeline (2026-2040) is colored based on the 
**worst indicator** for that year:
- **Green:** All indicators safe
- **Yellow:** At least one indicator in warning zone
- **Orange:** At least one indicator in danger zone  
- **Red:** At least one indicator in crisis zone (break point triggered)

See full threshold table in the simulation's "Crisis Thresholds" panel.
```

---

## 6. Testing & Validation

### 6.1 Test Cases

**Test 1: Safe Scenario (CBO)**
- Debt/GDP: 130% → should show YELLOW text
- Inflation: 3% → should show GREEN text
- Unemployment: 5% → should show GREEN text
- Timeline: Mostly GREEN years

**Test 2: Warning Scenario (IMF)**
- Debt/GDP: 155% → should show ORANGE text
- Inflation: 8% → should show YELLOW text
- Unemployment: 10% → should show YELLOW text
- Timeline: YELLOW/ORANGE years

**Test 3: Crisis Scenario (SPICE)**
- Debt/GDP: 180% → should show RED text
- Inflation: 14% → should show RED text
- Unemployment: 15% → should show ORANGE text
- Timeline: RED years from 2029+

### 6.2 Visual Verification

**Before fix:**
- Unemployment at 12% shows GREEN (confusing - graph color)
- Users don't know why 2029 is orange

**After fix:**
- Unemployment at 12% shows ORANGE (correct - danger level)
- Users can hover "Thresholds" button to see exact criteria

---

## 7. Success Criteria

**Fixes are successful if:**

### Bitcoin → Gini Replacement:
1. ✅ Bitcoin/USD banner removed from top indicator row
2. ✅ Gini Coefficient banner added in its place
3. ✅ Gini value reflects K-shape graph (labour vs capital shares)
4. ✅ Bitcoin price still visible in Bitcoin Price graph and Dashboard
5. ✅ All 6 top banners now represent macro state indicators (conceptually consistent)

### Criticality Colors:
1. ✅ Text colors in indicator boxes reflect **criticality**, not graph colors
2. ✅ Green = safe, Yellow = warning, Orange = danger, Red = crisis (consistent meaning)
3. ✅ Unemployment at 12% shows ORANGE (not green), Debt at 180% shows RED, etc.
4. ✅ No confusion between "graph color" and "criticality color"

### Crisis Thresholds Panel:
1. ✅ "Crisis Thresholds" button/panel is easily discoverable
2. ✅ Thresholds panel shows all 6 indicators (including Gini) with exact numeric ranges
3. ✅ Users can understand why a year turned yellow/orange/red
4. ✅ Mobile responsive (panel fits on smaller screens)

**Overall:**
- Model is transparent and self-documenting
- Users don't need to guess or memorize thresholds
- Conceptual consistency: all top banners = state indicators, outcomes in graphs

---

## 8. Optional Enhancements

### 8.1 Dynamic Threshold Highlighting

**When hovering over a year box, highlight which threshold triggered the color:**

```
[Hover over 2029 ORANGE year]

Tooltip shows:
┌─────────────────────────┐
│ 2029: DANGER            │
├─────────────────────────┤
│ Triggered by:           │
│ • Debt/GDP: 162% 🟠     │
│ • Unemployment: 11% 🟡  │
│ • Inflation: 9% 🟡      │
└─────────────────────────┘
```

### 8.2 Indicator Box Tooltips

**Hover over indicator value to see threshold context:**

```
[Hover over "Debt/GDP: 175%"]

Tooltip shows:
┌─────────────────────────┐
│ CRISIS LEVEL            │
│ Current: 175%           │
│ Threshold: >175%        │
│                         │
│ Safe: <120%             │
│ Warning: 120-150%       │
│ Danger: 150-175%        │
│ Crisis: >175% ← YOU ARE HERE
└─────────────────────────┘
```

---

**END OF REQUIREMENTS**

---

## Quick Reference for Claude Code

**TL;DR Improvement 1 (Bitcoin → Gini):**
1. Find Bitcoin/USD banner component
2. Replace with Gini Coefficient banner
3. Pull Gini value from K-shape calculation (labour/capital shares)
4. Use criticality colors: Green <0.50, Yellow 0.50-0.55, Orange 0.55-0.60, Red >0.60

**TL;DR Improvement 2 (Criticality Colors):**
1. Find indicator box value rendering
2. Replace graph color with criticality color based on thresholds
3. Green <120%, Yellow 120-150%, Orange 150-175%, Red >175% (for Debt/GDP example)
4. Apply similar logic to all 6 indicators

**TL;DR Improvement 3 (Thresholds Panel):**
1. Add "ℹ️ Crisis Thresholds" button near timeline
2. Create panel showing all threshold ranges for all 6 indicators (including Gini)
3. Make it hoverable/clickable with close button

**Priority:** MEDIUM - UX improvement, not breaking  
**Difficulty:** MEDIUM - Requires threshold logic + new UI component + banner replacement  
**Impact:** HIGH - Makes model transparent and conceptually consistent
