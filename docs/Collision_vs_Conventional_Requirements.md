# Collision vs Conventional Crisis - Requirements Document

**Project:** SPICE Dashboard - Crisis Distinction  
**Feature:** Distinguish "The Collision" from Conventional Sovereign Crises  
**Target Implementation:** Claude Code  
**Date:** 2026-03-14  
**Priority:** HIGH

---

## 1. Executive Summary

**Problem:** 
Current model treats all crises the same - any RED indicator is just "crisis". But there's a critical distinction:

- **Conventional Crisis:** Debt >175% with no AI/crypto (boring, Fed has playbook)
- **The Collision:** Debt crisis + AI displacement + crypto flight (novel, no historical precedent)

**Solution:**
Keep crisis indicators as-is (RED = crisis) but ADD classification of crisis TYPE and provide context about what makes The Collision different from conventional sovereign debt crises.

---

## 2. The Conceptual Distinction

### 2.1 What Is a Crisis? (Current Logic - KEEP THIS)

**Crisis triggers when ANY threshold exceeded:**
- Debt/GDP >175%
- Unemployment >20%
- Inflation >15% OR <-7%
- Bond yields >10% (or >6.5% + Debt >150%)

**Year boxes turn RED:** ✅ Correct behavior, don't change

**Examples:**
- AI=0%, Debt=182% (2032) → RED (is a crisis)
- AI=40%, Debt=178% (2029) → RED (is a crisis)

Both are crises. Both should show RED. **This is correct.**

---

### 2.2 What Is "The Collision"? (NEW DISTINCTION)

**The Collision = Crisis + Novel Dynamics**

**Criteria:**
```
Crisis triggered (RED)
AND
(AI displacement >15% OR Crypto flight >20%)
```

**Why the threshold?**
- AI <15%: Marginal impact, Fed tools still work
- AI >15%: Structural deflation, prevents inflating away debt
- Crypto <20%: Negligible capital flight, controls can work  
- Crypto >20%: Material exodus, can't trap capital

**What makes it different:**

| Conventional Crisis | The Collision |
|---------------------|---------------|
| Debt >175%, no AI/crypto | Debt >175% + AI >15% or Crypto >20% |
| Fed can inflate away debt | AI deflation prevents this |
| Capital controls can trap savings | Crypto flight beyond reach |
| Historical precedent (Greece, Argentina) | No historical precedent |
| Tools: QE, repression, austerity | Traditional tools constrained |
| **Boring but manageable** | **Novel and dangerous** |

---

### 2.3 Examples

**Example 1: Conventional Crisis**
- AI displacement: 0%
- Crypto adoption: 5%
- Debt: 182% (2032)
- **Status:** Crisis (RED) but NOT The Collision
- **Fed response:** QE, financial repression (historical playbook works)
- **User guidance:** "This is a standard sovereign debt crisis. To model The Collision, increase AI or Crypto sliders."

**Example 2: The Collision**
- AI displacement: 42%
- Crypto adoption: 38%
- Debt: 178% (2029)
- **Status:** Crisis (RED) AND The Collision
- **Fed response:** Traditional tools face novel constraints
- **User guidance:** "This is the SPICE thesis. Explore Crisis Scenarios page for resolution paths."

**Example 3: Near-Collision**
- AI displacement: 18%
- Crypto adoption: 12%
- Debt: 176% (2030)
- **Status:** Crisis (RED) AND The Collision (AI >15% threshold met)
- **Note:** Even modest AI/crypto changes the dynamics

**Example 4: No Crisis**
- AI displacement: 25%
- Crypto adoption: 15%
- Debt: 142% (stable)
- **Status:** No crisis, no collision
- **Commentary:** "Despite 25% AI displacement, debt remains manageable. The Collision is avoided."

---

## 3. Implementation

### 3.1 Add Collision Detection Function

**Location:** `src/lib/sim-engine.js` (or wherever crisis logic lives)

```javascript
/**
 * Determine if a crisis is "The Collision" (SPICE thesis) or conventional
 * @param {Object} yearData - Simulation data for a single year
 * @returns {String} 'NO_CRISIS' | 'CONVENTIONAL' | 'COLLISION'
 */
export function getCollisionStatus(yearData) {
  // Check if any crisis threshold is exceeded
  const hasCrisis = 
    yearData.debt > 175 || 
    yearData.unemp > 20 || 
    yearData.infl > 15 || 
    yearData.infl < -7 ||
    (yearData.yld > 6.5 && yearData.debt > 150);
  
  if (!hasCrisis) {
    return 'NO_CRISIS';
  }
  
  // Crisis exists - check for novel dynamics
  // Use displaced (AI displacement rate) from simulation params
  // Use cryptoFlight (crypto adoption %) from year data
  
  const hasMaterialAI = (yearData.displaced || 0) > 0.15;  // >15% AI displacement
  const hasSignificantCrypto = (yearData.cryptoFlight || 0) > 0.20;  // >20% crypto adoption
  
  if (hasMaterialAI || hasSignificantCrypto) {
    return 'COLLISION';  // The SPICE thesis (novel dynamics)
  }
  
  return 'CONVENTIONAL';  // Standard sovereign debt crisis
}

/**
 * Get collision status for first crisis year in trajectory
 * @param {Array} data - Full simulation trajectory (10 years)
 * @param {Number} displaced - AI displacement rate (0-1)
 * @returns {Object} {status: String, year: Number|null, aiLevel: Number, cryptoLevel: Number}
 */
export function getFirstCollisionYear(data, displaced) {
  for (let i = 0; i < data.length; i++) {
    const yearData = {...data[i], displaced};  // Add displaced to year data
    const status = getCollisionStatus(yearData);
    
    if (status === 'COLLISION') {
      return {
        status: 'COLLISION',
        year: 2026 + i,
        aiLevel: Math.round(displaced * 100),
        cryptoLevel: Math.round((yearData.cryptoFlight || 0) * 100)
      };
    }
    
    if (status === 'CONVENTIONAL') {
      return {
        status: 'CONVENTIONAL',
        year: 2026 + i,
        aiLevel: Math.round(displaced * 100),
        cryptoLevel: Math.round((yearData.cryptoFlight || 0) * 100)
      };
    }
  }
  
  return {
    status: 'NO_CRISIS',
    year: null,
    aiLevel: Math.round(displaced * 100),
    cryptoLevel: 0
  };
}
```

---

### 3.2 Update Crisis Indicator Box

**Location:** Simulation page, below graphs/KPIs

**Current box (keep crisis level as-is):**
```jsx
<div>Crisis Level: {crisisLevel}</div>
<div>First RED: {firstRedYear}</div>
```

**Add collision type classification:**

```jsx
{firstRedYear && (
  <div style={{
    maxWidth: '900px',
    margin: '24px auto',
    padding: '24px',
    background: collisionInfo.status === 'COLLISION' ? '#fef2f2' : '#fefce8',
    border: `2px solid ${collisionInfo.status === 'COLLISION' ? '#dc2626' : '#eab308'}`,
    borderRadius: '8px',
    fontFamily: 'IBM Plex Mono, monospace'
  }}>
    {/* Header */}
    <div style={{
      fontSize: '16px',
      fontWeight: 600,
      color: collisionInfo.status === 'COLLISION' ? '#991b1b' : '#854d0e',
      marginBottom: '16px',
      borderBottom: `1px solid ${collisionInfo.status === 'COLLISION' ? '#fca5a5' : '#fde047'}`,
      paddingBottom: '8px'
    }}>
      {collisionInfo.status === 'COLLISION' 
        ? `★ THE COLLISION — ${collisionInfo.year}` 
        : `CONVENTIONAL CRISIS — ${collisionInfo.year}`
      }
    </div>
    
    {/* Crisis details */}
    <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#333' }}>
      {collisionInfo.status === 'COLLISION' ? (
        <>
          <div style={{ marginBottom: '12px' }}>
            <strong>Type:</strong> The Collision (SPICE thesis)
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Novel dynamics:</strong> AI displacement {collisionInfo.aiLevel}% 
            {collisionInfo.cryptoLevel > 20 && `, Crypto flight ${collisionInfo.cryptoLevel}%`}
          </div>
          <div style={{ marginBottom: '16px', fontStyle: 'italic' }}>
            This crisis combines sovereign debt stress with forces absent from all 
            historical precedents. AI-driven deflation prevents inflating away debt; 
            crypto-enabled capital flight prevents trapping savings. The Fed's traditional 
            playbook faces novel constraints.
          </div>
          <a 
            href="/crisis" 
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Explore Crisis Scenarios →
          </a>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '12px' }}>
            <strong>Type:</strong> Conventional sovereign debt crisis
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Dynamics:</strong> AI displacement {collisionInfo.aiLevel}%, 
            Crypto flight {collisionInfo.cryptoLevel}% (both below collision thresholds)
          </div>
          <div style={{ marginBottom: '16px' }}>
            This is a standard sovereign debt crisis similar to Greece 2010, Argentina 2001, 
            or UK post-WWII. The Federal Reserve has an established playbook: quantitative 
            easing, financial repression, gradual inflation to erode real debt burden.
          </div>
          <div style={{ 
            padding: '12px', 
            background: '#fffbeb', 
            border: '1px solid #fcd34d',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            💡 <strong>To model The Collision:</strong> Increase AI displacement to &gt;15% 
            or Crypto adoption to &gt;20% to introduce the novel dynamics that distinguish 
            the SPICE thesis from historical crises.
          </div>
        </>
      )}
    </div>
  </div>
)}
```

---

### 3.3 Update Year Timeline Boxes

**Add visual distinction for collision years:**

**Option A: Add star symbol**
```jsx
{yearBoxes.map(year => {
  const isCollisionYear = collisionInfo.status === 'COLLISION' && 
                          year >= collisionInfo.year;
  
  return (
    <div 
      key={year}
      className={`year-box year-${getColorForYear(year)}`}
      title={isCollisionYear 
        ? `${year} - The Collision (AI ${collisionInfo.aiLevel}% + Crypto ${collisionInfo.cryptoLevel}%)`
        : `${year} - ${getColorForYear(year).toUpperCase()}`
      }
    >
      {year} {isCollisionYear && '★'}
    </div>
  );
})}
```

**Option B: Different background pattern**
```css
.year-box.collision-year {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(0,0,0,0.05) 4px,
    rgba(0,0,0,0.05) 8px
  );
}
```

**Option C: Just tooltip (simplest)**
```jsx
title={collisionInfo.status === 'COLLISION' && year >= collisionInfo.year
  ? `${year} - The Collision (novel dynamics)`
  : `${year} - ${crisisLevel}`
}
```

**Recommendation:** Option C (tooltip only) - keeps UI clean, provides context on hover

---

### 3.4 Update Crisis Thresholds Panel

**Add new section explaining collision vs conventional:**

**Location:** Inside thresholds modal/panel

```jsx
{/* Existing threshold tables for Debt, Inflation, etc. */}

{/* NEW SECTION */}
<div style={{
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: '2px solid #e2e2e2'
}}>
  <h4 style={{
    fontSize: '14px',
    fontWeight: 600,
    color: '#111',
    marginBottom: '12px',
    textTransform: 'uppercase'
  }}>
    Crisis vs Collision
  </h4>
  
  <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#333' }}>
    <div style={{ marginBottom: '16px' }}>
      <strong style={{ color: '#dc2626' }}>🔴 CRISIS (RED year indicator)</strong>
      <div style={{ marginLeft: '20px', marginTop: '6px' }}>
        Any year where crisis thresholds are exceeded:
        <ul style={{ marginTop: '6px', marginBottom: '0', paddingLeft: '20px' }}>
          <li>Debt/GDP &gt;175%</li>
          <li>Unemployment &gt;20%</li>
          <li>Inflation &gt;15% or &lt;-7%</li>
          <li>Bond yields &gt;10% (or &gt;6.5% + Debt &gt;150%)</li>
        </ul>
        This correctly flags that A crisis is happening (conventional or collision).
      </div>
    </div>
    
    <div style={{ marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
      <strong style={{ color: '#991b1b' }}>★ THE COLLISION (SPICE thesis)</strong>
      <div style={{ marginLeft: '20px', marginTop: '6px' }}>
        Crisis (above) PLUS novel dynamics:
        <ul style={{ marginTop: '6px', marginBottom: '6px', paddingLeft: '20px' }}>
          <li>Material AI displacement (&gt;15%), AND/OR</li>
          <li>Significant crypto flight (&gt;20%)</li>
        </ul>
        The Collision combines sovereign debt stress with forces absent from all 
        historical crises:
        <ul style={{ marginTop: '6px', marginBottom: '0', paddingLeft: '20px' }}>
          <li><strong>AI-driven deflation</strong> prevents inflating away debt</li>
          <li><strong>Crypto capital flight</strong> prevents trapping savings</li>
        </ul>
        <div style={{ 
          marginTop: '8px', 
          padding: '8px', 
          background: '#fef2f2',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Traditional Fed playbook (QE, YCC, repression) faces novel constraints. 
          No historical precedent for this combination.
        </div>
      </div>
    </div>
    
    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
      <strong style={{ color: '#854d0e' }}>CONVENTIONAL CRISIS</strong>
      <div style={{ marginLeft: '20px', marginTop: '6px' }}>
        Crisis thresholds exceeded BUT no AI/crypto dynamics.
        <div style={{ marginTop: '6px' }}>
          This is a standard sovereign debt crisis. The Fed has tools:
          <ul style={{ marginTop: '6px', marginBottom: '6px', paddingLeft: '20px' }}>
            <li>Quantitative easing</li>
            <li>Financial repression</li>
            <li>Gradual inflation to erode real debt</li>
          </ul>
          <strong>Examples:</strong> Greece 2010, Argentina 2001, UK 1945-1970
        </div>
        <div style={{ 
          marginTop: '8px', 
          padding: '8px', 
          background: '#fefce8',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Manageable with established policy responses. Not the SPICE thesis.
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### 3.5 Update AI Commentary

**Both `/api/economy-overview.js` and `/api/human-impact.js` need collision context.**

#### Add to API calls:

```javascript
// Calculate collision status
const collisionInfo = getFirstCollisionYear(data, displaced);

// Pass to API
const params = {
  // ... existing params
  collisionStatus: collisionInfo.status,  // 'NO_CRISIS' | 'CONVENTIONAL' | 'COLLISION'
  collisionYear: collisionInfo.year,
  aiLevel: collisionInfo.aiLevel,
  cryptoLevel: collisionInfo.cryptoLevel
};
```

#### Update prompts:

**Add to both `/api/economy-overview.js` and `/api/human-impact.js`:**

```javascript
const collisionContext = getCollisionContext(
  collisionStatus, 
  collisionYear, 
  aiLevel, 
  cryptoLevel
);

function getCollisionContext(status, year, ai, crypto) {
  if (status === 'NO_CRISIS') {
    return `NO CRISIS: System remains stable. Debt/unemployment/inflation all below crisis thresholds.`;
  }
  
  if (status === 'COLLISION') {
    return `
THE COLLISION (${year}): SPICE thesis in action
This is NOT a conventional crisis. Novel dynamics:
- AI displacement: ${ai}% (>${ai >= 15 ? '15% threshold - material deflation' : '15% threshold not met'})
- Crypto flight: ${crypto}% (>${crypto >= 20 ? '20% threshold - significant capital exodus' : '20% threshold not met'})

What makes this different from historical crises:
1. AI-driven deflation prevents Fed from inflating away debt (new constraint)
2. Crypto-enabled capital flight prevents government from trapping savings (new constraint)
3. Traditional Fed playbook (QE, YCC, repression) faces novel limitations

This is the SPICE thesis: sovereign debt + AI deflation + crypto flight = 
no historical precedent. Reference Crisis Scenarios page for resolution paths.

CRITICAL: Emphasize that this is NOVEL, not just "another debt crisis."`;
  }
  
  if (status === 'CONVENTIONAL') {
    return `
CONVENTIONAL CRISIS (${year}): Standard sovereign debt crisis
This is NOT The Collision. It's a traditional crisis:
- AI displacement: ${ai}% (below 15% threshold - minimal deflation)
- Crypto flight: ${crypto}% (below 20% threshold - minimal capital exodus)

This resembles historical crises:
- Greece 2010 (debt crisis, resolved with EU bailout + austerity)
- Argentina 2001 (debt default, gradual recovery)
- UK 1945-1970 (post-WWII debt, inflated away via repression)

Federal Reserve has established tools:
- Quantitative easing (suppress yields)
- Financial repression (force institutions to hold bonds)
- Gradual inflation (erode real debt burden)

CRITICAL: Note this is MANAGEABLE with traditional policy. Not the SPICE thesis.
Suggest user increase AI (>15%) or Crypto (>20%) to model The Collision.`;
  }
}

// Then in prompt:
`
${collisionContext}

[Rest of prompt...]
`
```

---

### 3.6 Example AI Outputs After Fix

#### **Collision Crisis (AI=42%, Crypto=38%, 2029):**

**Economy Overview:**
> "The Collision occurs in 2029—this is the SPICE thesis in action, not a 
> conventional sovereign debt crisis. Debt crosses 178% while AI displacement 
> reaches 42%, creating dynamics fundamentally different from historical precedents.
> 
> Unlike Greece 2010 or Argentina 2001, the Fed cannot inflate away this debt. 
> AI-driven deflation in 40% of the economy prevents the traditional escape route. 
> Unlike UK post-WWII where financial repression trapped savings, 38% crypto 
> adoption means capital flees beyond government reach.
> 
> [Continues with trajectory...]
> 
> What unfolds after 2031 depends on which crisis type emerges. Traditional Fed 
> tools face constraints never seen in historical crises. See Crisis Scenarios 
> page for three possible resolution paths."

**Impact Page (Middle-Class card):**
> "Catastrophic dual shock unprecedented in peacetime history. The 82% still 
> employed face 20-30% real wage cuts as AI deflation (goods/services) collides 
> with monetary inflation (assets/housing). Unlike 2008 where Fed rescue worked, 
> crypto flight means capital escapes before Fed can trap it. The 18% displaced 
> by AI cannot find equivalent work—this is structural, not cyclical unemployment."

---

#### **Conventional Crisis (AI=0%, Crypto=5%, 2032):**

**Economy Overview:**
> "A sovereign debt crisis triggers in 2032 when debt crosses 182%. However, 
> this is a CONVENTIONAL crisis—not The Collision that the SPICE thesis explores.
> 
> With zero AI displacement and minimal crypto adoption (5%), this resembles 
> historical debt crises: Greece 2010, Argentina 2001, UK post-WWII. The Federal 
> Reserve has an established playbook: quantitative easing to suppress yields, 
> financial repression to force institutions into bonds, gradual inflation to 
> erode real debt burden.
> 
> [Continues with trajectory...]
> 
> This scenario is manageable with traditional tools. The SPICE thesis explores 
> what happens when AI-driven deflation and crypto-enabled capital flight break 
> that playbook. To model The Collision, increase AI displacement above 15% or 
> crypto adoption above 20%."

**Impact Page (Middle-Class card):**
> "Standard recession dynamics similar to 2008-2010. Real wage pressure from 
> 4% inflation, modest job insecurity from cyclical unemployment (7%). Government 
> tools available: QE stabilizes asset markets, unemployment insurance cushions 
> impact. Unlike The Collision where AI displaces jobs structurally and crypto 
> enables capital flight, this follows the historical playbook. Recovery expected 
> within 3-5 years."

---

## 4. Testing & Validation

### 4.1 Test Scenarios

| AI % | Crypto % | Debt % | Expected Status | Expected Messaging |
|------|----------|--------|-----------------|-------------------|
| 0    | 0        | 140    | NO_CRISIS       | System stable |
| 0    | 5        | 182    | CONVENTIONAL    | Standard crisis, Fed has tools |
| 5    | 10       | 178    | CONVENTIONAL    | Below AI/crypto thresholds |
| 18   | 12       | 176    | COLLISION       | AI >15%, novel dynamics |
| 12   | 25       | 180    | COLLISION       | Crypto >20%, capital flight |
| 42   | 38       | 178    | COLLISION       | Both AI and crypto high |
| 25   | 15       | 145    | NO_CRISIS       | AI high but debt safe |

### 4.2 Visual Testing

**Test 1: Collision Crisis**
- Set AI=40%, Crypto=30%
- Wait for crisis (should trigger ~2029)
- **Expected:**
  - Year boxes turn RED in 2029+
  - Crisis box shows "★ THE COLLISION — 2029"
  - Background red/pink (#fef2f2)
  - "Explore Crisis Scenarios" button prominent
  - Commentary emphasizes novel dynamics

**Test 2: Conventional Crisis**
- Set AI=0%, Crypto=0%
- Wait for crisis (should trigger ~2032)
- **Expected:**
  - Year boxes turn RED in 2032+
  - Crisis box shows "CONVENTIONAL CRISIS — 2032"
  - Background yellow/amber (#fefce8)
  - Suggestion to increase AI/crypto sliders
  - Commentary notes Fed has tools

**Test 3: No Crisis**
- Set AI=5% (CBO), all other defaults
- **Expected:**
  - No RED years
  - No crisis box appears
  - Commentary notes system stable

**Test 4: Tooltip Accuracy**
- Hover over RED year in collision scenario
- **Expected:** Tooltip mentions "The Collision (novel dynamics)"
- Hover over RED year in conventional scenario
- **Expected:** Tooltip mentions "Crisis" (no collision note)

### 4.3 Commentary Quality

**Check collision commentary for:**
- ✅ Explicit statement: "This is The Collision" or "Not The Collision"
- ✅ Explanation of what makes it different/same as historical
- ✅ If conventional: suggestion to increase AI/crypto
- ✅ If collision: reference to Crisis Scenarios page
- ✅ Grounded in specific AI% and Crypto% numbers

---

## 5. Success Criteria

**Feature successful if:**

1. ✅ Crisis detection unchanged (RED when thresholds exceeded)
2. ✅ Collision status correctly identified (collision vs conventional vs none)
3. ✅ Crisis box shows collision type with appropriate styling
4. ✅ Collision crisis (AI >15% OR Crypto >20%): Red background, star, "Explore Crisis" CTA
5. ✅ Conventional crisis (AI <15% AND Crypto <20%): Yellow background, suggestion to increase
6. ✅ AI commentary distinguishes collision from conventional
7. ✅ Thresholds panel explains collision vs conventional clearly
8. ✅ Tooltips provide context on hover
9. ✅ No regression in existing crisis detection
10. ✅ Mobile responsive (crisis box readable on small screens)

---

## 6. Files to Modify

**Backend:**
- `/api/economy-overview.js` - Add collision context to prompt
- `/api/human-impact.js` - Add collision context to prompt

**Frontend:**
- `src/lib/sim-engine.js` - Add `getCollisionStatus()` and `getFirstCollisionYear()` functions
- `src/pages/chart3-simulation.jsx` - Add crisis box, pass collision info to APIs
- `src/components/ThresholdsPanel.jsx` (or wherever panel is) - Add "Crisis vs Collision" section

**Styling:**
- All inline (no CSS files per project standards)
- Use existing color tokens where possible

---

## 7. Optional Enhancements

### 7.1 Crisis Type Badge on Year Boxes

**Instead of just RED, show type:**

```
[2029★]  ← Red with star (Collision)
[2032]   ← Red without star (Conventional)
```

### 7.2 Animated Transition

**When collision status changes:**

```javascript
const [justDetected, setJustDetected] = useState(false);

useEffect(() => {
  if (collisionInfo.status === 'COLLISION') {
    setJustDetected(true);
    setTimeout(() => setJustDetected(false), 2000);
  }
}, [collisionInfo.status]);

// Apply border animation
style={{
  border: justDetected 
    ? '3px solid #dc2626' 
    : '2px solid #dc2626',
  transition: 'border 0.3s'
}}
```

### 7.3 Share Collision Scenario

**Add copy/share button:**

```jsx
<button onClick={() => {
  const url = `${window.location.origin}/collision?ai=${aiLevel}&crypto=${cryptoLevel}&...`;
  navigator.clipboard.writeText(url);
  alert('Collision scenario URL copied!');
}}>
  Share This Collision →
</button>
```

---

## 8. Edge Cases

### 8.1 Borderline Cases

**AI = 14.9%, Crypto = 19.8%:**
- Just below both thresholds
- Status: CONVENTIONAL
- Note in commentary: "Near-collision scenario. Slight increase in AI or crypto would trigger novel dynamics."

**AI = 15.1%, Crypto = 5%:**
- Just above AI threshold, low crypto
- Status: COLLISION (AI threshold met)
- Note: "Collision triggered primarily by AI displacement. Crypto flight remains low."

### 8.2 Late-Stage Collision

**Collision triggers in 2034:**
- Only 1 year left to show (2034-2035)
- Still display collision box
- Commentary notes: "Late-stage collision. Crisis emerges near end of modeled period. Extend analysis via Crisis Scenarios page."

### 8.3 Multiple Threshold Crossings

**Debt >175% in 2029, Unemployment >20% in 2031:**
- First RED: 2029 (debt)
- Collision status based on first RED year
- If AI >15% in 2029 → Collision
- Box shows: "The Collision — 2029 (debt trigger), cascades to unemployment crisis by 2031"

---

## 9. Migration & Rollback

### 9.1 No Breaking Changes

**Existing functionality preserved:**
- Crisis detection logic unchanged
- Year box colors unchanged  
- Thresholds unchanged
- API endpoints unchanged (just extended)

**New functionality additive:**
- New `getCollisionStatus()` function
- New crisis type box (doesn't replace anything)
- Extended API prompts (backward compatible)

### 9.2 Rollback Plan

**Quick disable:**
```javascript
const ENABLE_COLLISION_DETECTION = false;

{ENABLE_COLLISION_DETECTION && collisionInfo.status !== 'NO_CRISIS' && (
  <CollisionBox {...collisionInfo} />
)}
```

**Full rollback:**
- Remove `getCollisionStatus()` calls
- Remove crisis type box
- Revert API prompt extensions
- Keep crisis detection as-is (no changes there)

---

## 10. Cost Impact

**No additional API costs:**
- Same number of calls
- Slightly longer prompts (~150 tokens) for collision context
- Same output length
- Net cost change: <5%

**Better value:**
- More accurate guidance (collision vs conventional)
- Reduces user confusion ("Why is AI=0% showing crisis?")
- Directs users to appropriate next steps

---

## 11. Documentation Updates

### 11.1 Update Methodology Page

**Add section after Crisis Break Point Logic:**

```markdown
#### The Collision vs Conventional Crises

The simulation distinguishes between two types of crises:

**Conventional Crisis:**
Standard sovereign debt crisis (debt >175%, unemployment >20%, or 
inflation extremes) without material AI displacement or crypto flight. 
The Federal Reserve has an established playbook: quantitative easing, 
financial repression, gradual inflation to erode real debt burden. 
Historical precedents: Greece 2010, Argentina 2001, UK 1945-1970.

**The Collision (SPICE Thesis):**
Crisis (above) combined with novel dynamics absent from all historical 
precedents:
- Material AI displacement (>15%): Creates structural deflation that 
  prevents inflating away debt
- Significant crypto flight (>20%): Enables capital to escape government 
  reach, preventing traditional capital controls

The Collision represents uncharted territory. Traditional Fed tools face 
constraints never encountered in historical crises. Resolution paths 
explored in Crisis Scenarios section.

**Threshold rationale:**
- AI <15%: Marginal productivity effects, conventional tools work
- AI >15%: Structural deflation, breaks inflation-based debt reduction
- Crypto <20%: Capital controls remain viable
- Crypto >20%: Material exodus, controls become futile
```

### 11.2 Update Home Page Abstract

**Add one sentence:**

```markdown
The simulation distinguishes The Collision (debt crisis + AI + crypto) 
from conventional sovereign crises where traditional Fed tools remain viable.
```

---

## 12. Priority Justification

**HIGH priority because:**

1. **Conceptual clarity:** Users confused why AI=0% shows RED
2. **Thesis focus:** SPICE is about THE COLLISION, not all crises
3. **User guidance:** Tells users when they're modeling SPICE thesis vs not
4. **No breaking changes:** Purely additive enhancement
5. **Simple implementation:** One new function + UI box + prompt extension

---

**END OF REQUIREMENTS**

---

## Quick Reference for Claude Code

**What to add:**

1. **`getCollisionStatus()` function** in sim-engine.js
   - Returns 'NO_CRISIS' | 'CONVENTIONAL' | 'COLLISION'
   - Checks: crisis + (AI >15% OR Crypto >20%)

2. **Crisis Type Box** on Simulation page
   - Red background if Collision, yellow if Conventional
   - Star (★) for Collision
   - Different messaging and CTAs

3. **Collision context in API prompts**
   - Pass collision status to both APIs
   - Add context explaining collision vs conventional
   - Adjust tone/messaging accordingly

4. **Thresholds panel section**
   - Explain Crisis vs Collision distinction
   - Show thresholds (AI >15%, Crypto >20%)

**What NOT to change:**
- Crisis detection logic (Debt >175%, etc.) - keep as-is
- Year box coloring (RED/ORANGE/etc.) - keep as-is
- When boxes turn RED - keep as-is

**Priority:** HIGH  
**Difficulty:** MEDIUM (new logic + UI + prompts)  
**Time estimate:** 2-3 hours  
**Impact:** CRITICAL (clarifies SPICE thesis vs conventional crises)
