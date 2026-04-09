# Post-Collision Graph Treatment - Requirements Document

**Project:** SPICE Dashboard - Simulation Page Graphs  
**Feature:** Visual "Fog of War" for Post-Collision Periods  
**Target Implementation:** Claude Code  
**Date:** 2026-03-14  
**Priority:** HIGH

---

## 1. Executive Summary

**Problem:**
When The Collision occurs (e.g., 2029), graphs continue showing projections through 2035 as if the model "knows" what happens post-collapse. This is false—after a systemic break, outcomes depend on war, hyperinflation, crypto bans, political choices, etc., which cannot be modeled.

**Solution:**
Add **hatched overlay** to graphs marking post-collision periods as "SPECULATIVE". This visually signals that projections after the break point are highly uncertain and should not be taken as reliable forecasts.

**Alternative (if hatching too complex):**
Hard stop graphs at collision year + 1 year.

---

## 2. The Problem Clearly Stated

### 2.1 Current Behavior (Misleading)

**Scenario: Collision in 2029**
```
User sets AI=40%, Crypto=30%
Collision triggers in 2029 (debt 178%, unemployment 12%)

Graphs show solid lines from 2026-2035:
- Debt rises to 220% by 2035
- Unemployment reaches 18% by 2033
- Crypto flight hits 52% by 2033

PROBLEM: Implies model "knows" these will happen
REALITY: After 2029 break, anything could happen:
  - War (Ukraine-style disruption)
  - Hyperinflation (Weimar scenario)
  - Crypto ban (China 2021 model)
  - Gold confiscation (FDR 1933)
  - CBDC imposition (forced digital currency)
  - Debt jubilee (political reset)
  - None of which the model can predict
```

### 2.2 Why This Matters

**Intellectual honesty:**
- Model projects forward using pre-crisis dynamics
- Post-crisis dynamics are **discontinuous** (war, hyperinflation, bans)
- Showing solid lines implies false certainty

**User trust:**
- Sophisticated users know post-crisis is unknowable
- Showing "confident" projections undermines credibility
- Better to signal uncertainty explicitly

**Legal/regulatory:**
- Showing predictions of collapse could be regulatory issue
- Marking as "speculative" provides appropriate disclaimer

---

## 3. Solution: Hatched Overlay (RECOMMENDED)

### 3.1 Visual Treatment

**Before collision year:** Solid lines, normal appearance  
**After collision year:** Hatched diagonal overlay, labeled "SPECULATIVE"

**Example - Debt/GDP Graph:**
```
 300%│                          ╱╱╱╱╱╱╱╱╱╱╱╱╱╱
     │                         ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱
 200%│                    ────╱╱╱╱╱SPECULATIVE
     │               ────     ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱
 100%│─────────────           ↑
     └─────────────────────────────────────────
      2026              2029 = COLLISION  2035
                        │←── hatched area ──→│
```

**Visual elements:**
1. **Hatched pattern** - diagonal lines, semi-transparent
2. **Collision reference line** - red dashed vertical line at collision year
3. **"SPECULATIVE" label** - top-right of hatched area
4. **"COLLISION (year)" label** - on reference line
5. **Tooltip enhancement** - "(speculative)" suffix on post-collision values

### 3.2 Implementation (Recharts)

#### Pattern Definition (Once, at root level)

```jsx
// Add to SVG defs at top level of graph container
<svg width="0" height="0">
  <defs>
    <pattern 
      id="hatchPattern" 
      patternUnits="userSpaceOnUse" 
      width="6" 
      height="6"
      patternTransform="rotate(45)"
    >
      <line 
        x1="0" y1="0" 
        x2="0" y2="6" 
        stroke="#999" 
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
    </pattern>
  </defs>
</svg>
```

#### Apply to Each Graph

```jsx
// Example: Debt/GDP graph
const collisionYear = collisionInfo.status === 'COLLISION' 
  ? collisionInfo.year 
  : null;

<ResponsiveContainer width="100%" height={280}>
  <LineChart 
    data={data}
    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
  >
    {/* X-axis */}
    <XAxis 
      dataKey="year" 
      stroke="#999"
      tick={{ fontSize: 11, fill: '#666', fontFamily: 'IBM Plex Mono' }}
      domain={[2026, 2035]}
    />
    
    {/* Y-axis */}
    <YAxis 
      stroke="#999"
      tick={{ fontSize: 11, fill: '#666', fontFamily: 'IBM Plex Mono' }}
      domain={[100, 310]}
    />
    
    {/* Grid */}
    <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
    
    {/* ===== HATCHED AREA (NEW) ===== */}
    {collisionYear && (
      <ReferenceArea
        x1={collisionYear}
        x2={2035}
        fill="url(#hatchPattern)"
        fillOpacity={1}
        label={{
          value: 'SPECULATIVE',
          position: 'insideTopRight',
          fontSize: 10,
          fill: '#666',
          fontStyle: 'italic',
          fontFamily: 'IBM Plex Mono, monospace'
        }}
      />
    )}
    
    {/* ===== COLLISION REFERENCE LINE (NEW) ===== */}
    {collisionYear && (
      <ReferenceLine
        x={collisionYear}
        stroke="#dc2626"
        strokeWidth={2}
        strokeDasharray="5 5"
        label={{
          value: `COLLISION (${collisionYear})`,
          position: 'insideTopLeft',
          fontSize: 10,
          fill: '#dc2626',
          fontWeight: 600,
          fontFamily: 'IBM Plex Mono, monospace'
        }}
      />
    )}
    
    {/* Data line */}
    <Line
      type="monotone"
      dataKey="debt"
      stroke="#dc2626"
      strokeWidth={2}
      dot={false}
      isAnimationActive={false}
    />
    
    {/* Tooltip with speculative suffix */}
    <Tooltip 
      contentStyle={{
        background: 'white',
        border: '1px solid #e2e2e2',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'IBM Plex Mono, monospace',
        padding: '8px 12px'
      }}
      formatter={(value, name, props) => {
        const year = props.payload.year;
        const suffix = collisionYear && year > collisionYear 
          ? ' (speculative)' 
          : '';
        return [`${value}${suffix}`, name];
      }}
    />
  </LineChart>
</ResponsiveContainer>
```

### 3.3 Apply to All 6 Graphs

**Same treatment for:**
1. Debt/GDP
2. Unemployment  
3. Inflation
4. Bond Yields
5. Gold/Crypto
6. K-Shape (Labour vs Capital)

**Consistent visual language:**
- All use same hatch pattern
- All show collision reference line
- All label "SPECULATIVE"
- All add tooltip suffix

---

## 4. Collision Warning Banner

**Add above graphs when collision detected:**

```jsx
{collisionInfo.status === 'COLLISION' && (
  <div style={{
    maxWidth: '1400px',
    margin: '0 auto 24px',
    padding: '16px 24px',
    background: '#fef2f2',
    border: '2px solid #dc2626',
    borderLeft: '6px solid #dc2626',
    borderRadius: '4px',
    fontFamily: 'IBM Plex Mono, monospace'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <div style={{
        fontSize: '20px',
        lineHeight: 1
      }}>
        ⚠️
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#991b1b',
          marginBottom: '6px'
        }}>
          THE COLLISION OCCURS IN {collisionInfo.year}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#333',
          lineHeight: '1.6'
        }}>
          Graphs show projections through 2035, but <strong>post-collision 
          periods are highly speculative</strong> (hatched areas on graphs). 
          After a systemic break, outcomes depend on war, hyperinflation, 
          crypto bans, political choices, and other discontinuous events 
          that cannot be modeled from pre-crisis dynamics.
          
          <div style={{ marginTop: '8px' }}>
            See <a 
              href="/crisis" 
              style={{ 
                color: '#dc2626', 
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Crisis Scenarios
            </a> for three possible resolution paths.
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

**Placement:** Between header/controls and graphs

---

## 5. Commentary Updates

### 5.1 Economy Overview Addition

**Add paragraph about post-collision uncertainty:**

```javascript
// In /api/economy-overview.js prompt

${collisionStatus === 'COLLISION' ? `

Paragraph 4 should include:

IMPORTANT: Note that projections beyond ${collisionYear + 1} are highly 
speculative. After The Collision, outcomes depend on discontinuous events:
- War or geopolitical rupture
- Hyperinflation (Weimar scenario) or deflation spiral
- Crypto bans (China model) or legal tender adoption (El Salvador model)
- Gold confiscation (FDR 1933) or monetary reset
- CBDC imposition or continued fiat system
- Debt jubilee or default

These cannot be modeled from pre-crisis dynamics. The simulation shows 
one possible trajectory, but actual resolution depends on political 
choices and events outside the model's scope. Reference Crisis Scenarios 
page for alternative resolution paths.

` : ''}
```

**Example output:**

> "Beyond 2031, the model's projections become highly speculative. The 
> Collision creates discontinuous risk that cannot be modeled from pre-crisis 
> dynamics: war, hyperinflation, crypto bans, gold confiscation, CBDC 
> imposition—outcomes that depend on political choices and geopolitical events. 
> The hatched areas on graphs signal this uncertainty. See Crisis Scenarios 
> page for three possible resolution paths, recognizing that actual outcomes 
> may differ substantially."

### 5.2 Impact Page (No Change)

Impact page focuses on specific year scenarios - no post-collision disclaimer needed there.

---

## 6. Alternative Solution: Hard Stop

**If hatching proves too complex or has technical issues:**

### 6.1 Truncate Data at Collision + 1

```javascript
/**
 * Get display data - truncate at collision + 1 year
 */
function getDisplayData(data, collisionYear) {
  if (!collisionYear) {
    return data;  // No collision → show full 2026-2035
  }
  
  // Collision → show until collision + 1 year
  const yearsToShow = collisionYear - 2026 + 2;  // +2 = collision year + 1
  return data.slice(0, yearsToShow);
}

// Apply to graphs
const displayData = getDisplayData(data, collisionInfo.year);

<LineChart data={displayData}>
  {/* Graph naturally ends where data ends */}
</LineChart>
```

### 6.2 Add Explanation Below Graphs

```jsx
{collisionInfo.status === 'COLLISION' && (
  <div style={{
    maxWidth: '1400px',
    margin: '16px auto 0',
    padding: '12px 16px',
    background: '#fefce8',
    border: '1px solid #fde047',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#333',
    fontFamily: 'IBM Plex Mono, monospace'
  }}>
    📊 Graphs end at {collisionInfo.year + 1}. Post-collision dynamics 
    are too uncertain to model reliably. See{' '}
    <a href="/crisis" style={{ color: '#854d0e', fontWeight: 600 }}>
      Crisis Scenarios
    </a>{' '}
    for possible resolution paths.
  </div>
)}
```

### 6.3 Example Visual

**Collision in 2029:**
```
Debt/GDP Graph:

 200%│         
     │    ────●  ← Graph ends here (2030)
 100%│────       
     └──────────
      2026  2030

"Graphs end at 2030. Post-collision too uncertain to model."
```

**Benefits:**
- ✅ Extremely simple implementation
- ✅ Very clear message: "we don't know what happens next"
- ✅ Forces users to Crisis Scenarios page

**Drawbacks:**
- ❌ Loses symmetry (different scenarios show different time spans)
- ❌ Can't see model's "best guess" at trajectory
- ❌ Might feel incomplete

---

## 7. Implementation Checklist

### Phase 1: Pattern Definition
- [ ] Create `#hatchPattern` SVG pattern
- [ ] Test pattern renders correctly (45° diagonal lines)
- [ ] Place in root component (render once, reference everywhere)

### Phase 2: Add to Graphs
- [ ] **Debt/GDP graph:** Add ReferenceArea + ReferenceLine
- [ ] **Unemployment graph:** Add ReferenceArea + ReferenceLine
- [ ] **Inflation graph:** Add ReferenceArea + ReferenceLine
- [ ] **Bond Yields graph:** Add ReferenceArea + ReferenceLine
- [ ] **Gold/Crypto graph:** Add ReferenceArea + ReferenceLine
- [ ] **K-Shape graph:** Add ReferenceArea + ReferenceLine
- [ ] Verify "SPECULATIVE" label appears on all 6
- [ ] Verify collision line appears on all 6

### Phase 3: Tooltips
- [ ] Update tooltip formatter to add "(speculative)" suffix
- [ ] Test: Hover over pre-collision year → no suffix
- [ ] Test: Hover over post-collision year → shows suffix

### Phase 4: Warning Banner
- [ ] Create banner component
- [ ] Place above graphs
- [ ] Show only when `collisionInfo.status === 'COLLISION'`
- [ ] Include link to Crisis Scenarios page
- [ ] Test: Shows for collision, hidden for conventional/no crisis

### Phase 5: Commentary
- [ ] Update `/api/economy-overview.js` prompt
- [ ] Add post-collision uncertainty paragraph
- [ ] Reference hatched areas explicitly
- [ ] Test: Collision scenario generates uncertainty note

### Phase 6: Cross-Browser Testing
- [ ] Chrome: Hatching renders correctly
- [ ] Firefox: Hatching renders correctly
- [ ] Safari: Hatching renders correctly
- [ ] Mobile: Hatching visible on small screens

---

## 8. Edge Cases

### 8.1 Late Collision (2034)

**Collision in 2034 → Only 1 year post-collision (2035)**

```
Hatched area: 2034-2035 (very narrow)
Reference line: 2034
Label: Still shows "SPECULATIVE"
```

**Still apply treatment** - even 1 year is speculative post-collapse.

### 8.2 Very Early Collision (2027)

**Collision in 2027 → 8 years of hatching (2027-2035)**

```
Hatched area: Covers most of graph
Reference line: 2027
```

**This is correct** - most of the projection is speculative.

### 8.3 No Collision

**No collision triggered:**

```
No hatching
No reference line
Graphs show solid lines 2026-2035
```

**Normal behavior.**

### 8.4 Conventional Crisis (Not Collision)

**Crisis but no collision (AI=0%, Debt>175%):**

```
No hatching (conventional crisis, not systemic break)
Graphs show solid lines 2026-2035
```

**Conventional crises are modelable** - Fed has playbook, precedents exist.

Only THE COLLISION (AI+crypto+debt) gets hatching.

---

## 9. Visual Examples

### 9.1 All 6 Graphs with Hatching

```
┌─────────────────────────────────────────────┐
│ DEBT/GDP                                    │
│ 300%│                    ╱╱╱╱╱SPECULATIVE    │
│ 200%│              ─────╱╱╱╱╱╱╱╱╱            │
│ 100%│────────          ↑                     │
│     └──────────────────────────              │
│      2026          2029    2035              │
│               COLLISION (2029)               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ UNEMPLOYMENT                                │
│  25%│                    ╱╱╱╱╱SPECULATIVE    │
│  15%│              ─────╱╱╱╱╱╱╱╱╱            │
│   5%│────────          ↑                     │
│     └──────────────────────────              │
│      2026          2029    2035              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ INFLATION                                   │
│  20%│                    ╱╱╱╱╱SPECULATIVE    │
│  10%│              ─────╱╱╱╱╱╱╱╱╱            │
│   0%│────────          ↑                     │
│     └──────────────────────────              │
│      2026          2029    2035              │
└─────────────────────────────────────────────┘

[Bond Yields, Gold/Crypto, K-Shape - same pattern]
```

### 9.2 With Warning Banner

```
┌───────────────────────────────────────────────────────┐
│ ⚠️ THE COLLISION OCCURS IN 2029                       │
│                                                       │
│ Graphs show projections through 2035, but post-      │
│ collision periods are highly speculative (hatched).  │
│ See Crisis Scenarios for resolution paths.           │
└───────────────────────────────────────────────────────┘

[6 graphs below with hatching from 2029 onwards]
```

---

## 10. Success Criteria

**Feature successful if:**

1. ✅ Hatched overlay appears post-collision on all 6 graphs
2. ✅ "SPECULATIVE" label visible in hatched area
3. ✅ Red dashed collision reference line at correct year
4. ✅ "COLLISION (year)" label on reference line
5. ✅ Tooltips show "(speculative)" suffix for post-collision years
6. ✅ Warning banner appears above graphs when collision detected
7. ✅ Commentary references post-collision uncertainty
8. ✅ No hatching for conventional crisis or no crisis
9. ✅ Pattern renders correctly across browsers
10. ✅ Mobile responsive (hatching visible on small screens)

---

## 11. Testing Matrix

| Scenario | Collision Year | Expected Hatching | Expected Banner |
|----------|----------------|-------------------|-----------------|
| AI=40%, Crypto=30% | 2029 | 2029-2035 hatched | Yes, shown |
| AI=0%, Debt>175% | 2032 | None (conventional) | No |
| AI=5% (CBO) | None | None | No |
| AI=18%, Crypto=12% | 2030 | 2030-2035 hatched | Yes, shown |
| AI=25%, Debt safe | None | None | No |

---

## 12. Files to Modify

**Frontend only (no backend changes):**
- `src/pages/chart3-simulation.jsx` - Add pattern def, banner, apply to graphs
- Each graph component (if separated) - Add ReferenceArea + ReferenceLine
- Tooltip formatters - Add speculative suffix

**No changes needed:**
- API endpoints (no backend impact)
- Simulation engine (calculations unchanged)
- Other pages (Impact, Crisis, etc.)

---

## 13. Rollback Plan

**Quick disable:**
```javascript
const ENABLE_POST_COLLISION_HATCHING = false;

{ENABLE_POST_COLLISION_HATCHING && collisionYear && (
  <ReferenceArea ... />
)}
```

**Full rollback:**
- Remove ReferenceArea components
- Remove ReferenceLine components
- Remove pattern definition
- Remove banner
- Revert tooltip formatters
- Graphs return to solid lines throughout

**No breaking changes** - purely visual enhancement.

---

## 14. Performance Considerations

**Pattern rendering:**
- SVG patterns are efficient (GPU-accelerated)
- One pattern definition, referenced 6 times
- No performance impact expected

**Large datasets:**
- Same data volume (10 years)
- One additional ReferenceArea per graph (6 total)
- Negligible impact

**Mobile:**
- Hatching may be harder to see on small screens
- Consider slightly thicker hatch lines for mobile (media query)

---

## 15. Accessibility

**Screen readers:**
- Add `aria-label` to hatched areas
- Tooltip suffix "(speculative)" helps understanding

**Color blindness:**
- Hatching is pattern-based (not color-dependent)
- Works for all color vision types
- Reference line uses distinct pattern (dashes)

**Keyboard navigation:**
- No interactive elements in hatching
- Warning banner is static text
- All existing keyboard nav preserved

---

## 16. Future Enhancements

### 16.1 Configurable Post-Collision Display

**Allow users to toggle speculation visibility:**

```jsx
<label>
  <input 
    type="checkbox" 
    checked={showPostCollision}
    onChange={(e) => setShowPostCollision(e.target.checked)}
  />
  Show speculative post-collision projections
</label>
```

**If unchecked:** Graphs stop at collision + 1 (hard stop approach)

### 16.2 Alternative Scenarios Post-Collision

**Show multiple possible paths:**

```jsx
// Three post-collision trajectories (faded, dashed)
<Line dataKey="debtOptimistic" stroke="#dc2626" strokeOpacity={0.3} strokeDasharray="2 2" />
<Line dataKey="debtBase" stroke="#dc2626" strokeOpacity={0.3} strokeDasharray="2 2" />
<Line dataKey="debtPessimistic" stroke="#dc2626" strokeOpacity={0.3} strokeDasharray="2 2" />
```

**Labeled:** "Optimistic / Base / Pessimistic scenarios"

### 16.3 Link to Crisis Type from Graph

**Click on hatched area → navigate to Crisis Scenarios page:**

```jsx
<ReferenceArea
  onClick={() => window.location.href = '/crisis'}
  style={{ cursor: 'pointer' }}
  ...
/>
```

---

**END OF REQUIREMENTS**

---

## Quick Reference for Claude Code

**Primary approach (RECOMMENDED):**
1. Create `#hatchPattern` SVG pattern (diagonal lines)
2. Add `<ReferenceArea>` to all 6 graphs from collision year to 2035
3. Add `<ReferenceLine>` at collision year (red dashed)
4. Add "SPECULATIVE" label to hatched areas
5. Add warning banner above graphs
6. Update tooltips with "(speculative)" suffix

**Fallback approach (if hatching difficult):**
1. Truncate data at collision + 1 year
2. Add note below graphs explaining truncation

**Priority:** HIGH (intellectual honesty about model limits)  
**Difficulty:** MEDIUM (Recharts patterns, testing)  
**Time estimate:** 2-3 hours  
**Impact:** HIGH (credibility, transparency, legal disclaimer)
