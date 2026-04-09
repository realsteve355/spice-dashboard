# Economy Overview Card - Requirements Document

**Project:** SPICE Dashboard - Simulation Page  
**Feature:** AI-Generated Economic Overview  
**Target Implementation:** Claude Code  
**Date:** 2026-03-14  
**Priority:** MEDIUM

---

## 1. Overview

Add an AI-generated narrative synthesis below the graphs on the Simulation page (`/collision`) that explains what's happening in the economy based on current slider settings.

**Purpose:** Provide narrative context for the 6 graphs - answer "what does this mean?" without requiring users to interpret raw data.

**Similar to:** Human Impact Analysis on `/impact` page, but focused on macro/systemic dynamics instead of individual group impacts.

---

## 2. Page Location

### **Simulation Page (`/collision`) Layout:**

```
[Header Bar - Policy Badges + Crisis Onset Indicators]
   ↓
[6 Economic Graphs - 2×3 Grid]
   ↓
[KPI Strip - Year Slider + 6 Chips + Thresholds Button]
   ↓
→ [NEW] Economy Overview Card ← ADD HERE
   ↓
[End of page]
```

**Why Simulation page, not Impact page:**
- Impact page already has long scroll (multiple AI cards)
- Simulation page has available space below graphs
- Natural follow-up: user sees graphs → wants interpretation
- Keeps Impact page focused on group-specific impacts

---

## 3. Design Specifications

### 3.1 Compact Card Design

**Goal:** Minimal vertical space, unobtrusive, readable

**Container:**
```jsx
{
  maxWidth: '800px',
  margin: '24px auto',
  padding: '20px 24px',
  background: '#fafafa',          // Light gray (visual separation)
  border: '1px solid #e2e2e2',
  borderRadius: '4px',
  fontFamily: 'IBM Plex Mono, monospace'
}
```

**Header:**
```jsx
{
  fontSize: '13px',
  fontWeight: 600,
  color: '#111',
  marginBottom: '12px',
  borderBottom: '1px solid #e2e2e2',
  paddingBottom: '8px'
}
```

**Content (body text):**
```jsx
{
  fontSize: '12px',              // Small font for compactness
  lineHeight: '1.6',
  color: '#333'
}
```

**Paragraphs:**
```jsx
{
  marginBottom: '10px'           // Tight spacing between paragraphs
}
// Last paragraph: marginBottom: '0'
```

### 3.2 Loading State

While generating (500ms debounce before API call):

```jsx
<div style={{
  maxWidth: '800px',
  margin: '24px auto',
  padding: '40px 24px',
  background: '#fafafa',
  border: '1px solid #e2e2e2',
  borderRadius: '4px',
  textAlign: 'center',
  fontFamily: 'IBM Plex Mono, monospace'
}}>
  <div style={{
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  }}>
    Generating economic overview...
  </div>
</div>
```

### 3.3 Expected Dimensions

**Collapsed (loading):** ~100px height  
**Expanded (4 paragraphs):** ~220px height  
**Width:** 800px max (centered)

**Total page scroll increase:** Minimal (~220px)

---

## 4. API Endpoint

### 4.1 Create New Endpoint: `/api/economy-overview.js`

**Location:** `/api/economy-overview.js` (Vercel serverless function)

**Similar to:** `/api/human-impact.js` (same pattern, single response instead of array)

**Input Parameters (query string):**
```javascript
{
  year: '2031',
  debt: '182',              // Debt/GDP %
  inflation: '11.2',        // %
  unemployment: '14.5',     // %
  yields: '8.2',            // 10Y Bond Yield %
  crypto: '38',             // Crypto adoption %
  gini: '0.58',             // Gini coefficient
  fiscalPolicy: 'baseline', // or 'robotTax', 'austerity'
  monetaryPolicy: 'ycc',    // or 'qe', 'repression', 'none'
  cryptoPolicy: 'tax'       // or 'ban', 'ignore'
}
```

**Output:**
```javascript
{
  overview: "The economy has entered acute crisis. Debt has reached...\n\nAI displacement has accelerated...\n\nCapital flight has intensified...\n\nConventional hedges have failed..."
}
```

### 4.2 Implementation

```javascript
// /api/economy-overview.js
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  const { 
    year, debt, inflation, unemployment, yields, crypto, gini,
    fiscalPolicy, monetaryPolicy, cryptoPolicy 
  } = req.query;
  
  // Optional: Add caching layer (localStorage on client side)
  // For now, keep it simple - generate fresh each time
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: constructPrompt(
          year, debt, inflation, unemployment, yields, crypto, gini,
          fiscalPolicy, monetaryPolicy, cryptoPolicy
        )
      }]
    });
    
    res.status(200).json({ 
      overview: message.content[0].text 
    });
    
  } catch (error) {
    console.error('Economy overview generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate overview',
      overview: 'Economic analysis temporarily unavailable. Please try adjusting sliders.'
    });
  }
}

function constructPrompt(year, debt, inflation, unemployment, yields, crypto, gini, fiscal, monetary, cryptoPol) {
  // Determine if crisis has occurred
  const isPostCrisis = parseFloat(debt) > 175 || 
                       parseFloat(unemployment) > 20 || 
                       parseFloat(inflation) < -7 ||
                       (parseFloat(yields) > 6.5 && parseFloat(debt) > 150);
  
  const crisisContext = isPostCrisis 
    ? "The crisis break point has been triggered. The system is in acute distress."
    : "The system is pre-crisis but structural imbalances are building.";
  
  // Map policy IDs to readable names
  const fiscalName = {
    'baseline': 'No intervention',
    'robotTax': 'Robot Tax + UBI',
    'austerity': 'Austerity (spending cuts)'
  }[fiscal] || fiscal;
  
  const monetaryName = {
    'none': 'No monetary intervention',
    'qe': 'Quantitative Easing',
    'ycc': 'Yield Curve Control',
    'repression': 'Financial Repression'
  }[monetary] || monetary;
  
  const cryptoName = {
    'ban': 'Ban & Restrict',
    'tax': 'Tax & Regulate',
    'ignore': 'Ignore/Accommodate'
  }[cryptoPol] || cryptoPol;
  
  return `You are an economic analyst synthesizing a macroeconomic simulation for investors.

SCENARIO DATA (Year ${year}):
- Debt/GDP: ${debt}%
- Inflation: ${inflation}%
- Unemployment: ${unemployment}%
- 10-Year Bond Yield: ${yields}%
- Crypto Adoption: ${crypto}%
- Gini Coefficient: ${gini}
- Fiscal Policy: ${fiscalName}
- Monetary Policy: ${monetaryName}
- Crypto Regime: ${cryptoName}

CONTEXT:
This simulates the collision between AI-driven deflation and unsustainable sovereign debt. 
${crisisContext}

Crisis triggers: Debt>175%, Unemployment>20%, Inflation<-7%, or (Yields>6.5% AND Debt>150%).

TASK:
Write a 4-paragraph economic overview (200-250 words total). Structure:

Paragraph 1: FISCAL STRESS & DEBT DYNAMICS
- Current debt level, sustainability, interest burden
- Reference specific debt % and yield % from data
- Explain r vs g dynamics (interest rate vs growth)

Paragraph 2: AI DISPLACEMENT & LABOR MARKETS
- Unemployment level and trajectory
- AI productivity effects vs job destruction
- Ghost GDP phenomenon (if applicable - productivity rising but employment falling)
- Automatic stabilizers impact on deficit

Paragraph 3: MONETARY POLICY & CAPITAL FLIGHT
- Federal Reserve response (${monetaryName})
- Inflation/deflation dynamics (explain the collision if both present)
- Crypto capital flight % and government response (${cryptoName})
- K-shape inequality (Gini ${gini}) - who's winning/losing

Paragraph 4: INVESTMENT IMPLICATIONS
- Which hedges work and which fail in this scenario
${isPostCrisis ? '- Conventional hedges (TIPS, gold ETFs, 60/40) have failed - explain why' : '- Traditional portfolio positioning vs hard assets'}
- Who preserves wealth vs who loses purchasing power

CRITICAL RULES:
1. Ground EVERY claim in specific numbers from the data (don't say "debt is high", say "debt has reached ${debt}% of GDP")
2. Explain causality - WHY things are happening, not just WHAT
3. Use clear, professional prose - NO bullet points, NO headers within paragraphs
4. When crisis has occurred, acknowledge severity honestly
5. Do NOT mention "SPICE" or "ZPC" token (legal separation)
6. Focus on economic mechanics, not investment advice
7. If deflation AND inflation both present, explain the collision (AI deflation in some sectors, money printing inflation in others)
8. Reference actual policy choices (${fiscalName}, ${monetaryName}, ${cryptoName}) and their effects

Tone: Analytical, factual, accessible. Like a high-quality economic briefing, not academic jargon.

Write the 4 paragraphs now, separated by double newlines. No preamble, no conclusion beyond paragraph 4.`;
}
```

---

## 5. Client-Side Implementation

### 5.1 Add to Simulation Page Component

**File:** `src/pages/chart3-simulation.jsx` (or wherever `/collision` route is defined)

**State Management:**
```jsx
const [economyOverview, setEconomyOverview] = useState('');
const [overviewLoading, setOverviewLoading] = useState(false);
```

**Fetch Logic (with debounce):**
```jsx
useEffect(() => {
  // Debounce: wait 600ms after user stops moving sliders (same as Impact page)
  const timer = setTimeout(async () => {
    setOverviewLoading(true);
    
    try {
      // Get current simulation data
      const currentYearData = data[kpiYear - 2026];
      
      const params = new URLSearchParams({
        year: kpiYear.toString(),
        debt: Math.round(currentYearData.debt).toString(),
        inflation: currentYearData.infl.toFixed(1),
        unemployment: currentYearData.unemp.toFixed(1),
        yields: currentYearData.yld.toFixed(1),
        crypto: Math.round(currentYearData.cryptoFlight || 0).toString(),
        gini: (currentYearData.gini || 0.48).toFixed(2),
        fiscalPolicy: fiscalId,
        monetaryPolicy: monetaryId,
        cryptoPolicy: cryptoPolicy
      });
      
      const res = await fetch(`/api/economy-overview?${params}`);
      const json = await res.json();
      
      setEconomyOverview(json.overview || 'Analysis unavailable.');
      
    } catch (error) {
      console.error('Failed to fetch economy overview:', error);
      setEconomyOverview('Economic analysis temporarily unavailable. Please try adjusting sliders.');
    } finally {
      setOverviewLoading(false);
    }
  }, 600); // 600ms debounce (same as Impact page)
  
  return () => clearTimeout(timer);
}, [kpiYear, displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy, data]);
```

**Render (after KPI strip):**
```jsx
{/* Economy Overview Card */}
{overviewLoading ? (
  <div style={{
    maxWidth: '800px',
    margin: '24px auto',
    padding: '40px 24px',
    background: '#fafafa',
    border: '1px solid #e2e2e2',
    borderRadius: '4px',
    textAlign: 'center',
    fontFamily: 'IBM Plex Mono, monospace'
  }}>
    <div style={{
      fontSize: '12px',
      color: '#999',
      fontStyle: 'italic'
    }}>
      Generating economic overview...
    </div>
  </div>
) : economyOverview && (
  <div style={{
    maxWidth: '800px',
    margin: '24px auto',
    padding: '20px 24px',
    background: '#fafafa',
    border: '1px solid #e2e2e2',
    borderRadius: '4px',
    fontFamily: 'IBM Plex Mono, monospace'
  }}>
    {/* Header */}
    <div style={{
      fontSize: '13px',
      fontWeight: 600,
      color: '#111',
      marginBottom: '12px',
      borderBottom: '1px solid #e2e2e2',
      paddingBottom: '8px'
    }}>
      ECONOMIC OVERVIEW — {kpiYear}
    </div>
    
    {/* Content */}
    <div style={{
      fontSize: '12px',
      lineHeight: '1.6',
      color: '#333'
    }}>
      {economyOverview.split('\n\n').map((para, i, arr) => (
        <p key={i} style={{ 
          marginBottom: i < arr.length - 1 ? '10px' : '0' 
        }}>
          {para}
        </p>
      ))}
    </div>
  </div>
)}
```

### 5.2 Data Requirements

**Ensure these fields exist in simulation data:**
```javascript
{
  debt: number,        // Debt/GDP % (e.g. 182)
  infl: number,        // Inflation % (e.g. 11.2)
  unemp: number,       // Unemployment % (e.g. 14.5)
  yld: number,         // 10Y Bond Yield % (e.g. 8.2)
  cryptoFlight: number, // Crypto adoption % (e.g. 38)
  gini: number         // Gini coefficient (e.g. 0.58)
}
```

**If `gini` not in simulation data, calculate from labour/capital shares:**
```javascript
// Gini approximation from income shares
const gini = calculateGiniFromShares(labourShare, capitalShare);
// Or use a simplified proxy:
const gini = 0.48 + (capitalShare - 0.25) * 0.8; // 0.48 base + inequality growth
```

**If `cryptoFlight` not in simulation data, use `cryptoAdopt` slider value directly.**

---

## 6. Caching Strategy

### 6.1 Use Same Pattern as Impact Page

**Impact page implementation:**
- Results cached **in-memory** (useState)
- **600ms debounce** on slider changes
- Avoids re-fetching on every movement
- Simple, effective pattern

**Apply identical approach to Economy Overview:**

```javascript
const [economyOverview, setEconomyOverview] = useState('');
const [overviewLoading, setOverviewLoading] = useState(false);
const [cachedParams, setCachedParams] = useState(null);

useEffect(() => {
  // Build current params
  const currentParams = {
    year: kpiYear,
    debt: Math.round(data[kpiYear - 2026].debt),
    inflation: data[kpiYear - 2026].infl.toFixed(1),
    unemployment: data[kpiYear - 2026].unemp.toFixed(1),
    yields: data[kpiYear - 2026].yld.toFixed(1),
    crypto: Math.round(data[kpiYear - 2026].cryptoFlight || 0),
    gini: (data[kpiYear - 2026].gini || 0.48).toFixed(2),
    fiscalPolicy: fiscalId,
    monetaryPolicy: monetaryId,
    cryptoPolicy: cryptoPolicy
  };
  
  // Check if params changed
  const paramsKey = JSON.stringify(currentParams);
  if (paramsKey === cachedParams) {
    return; // Already have this result, don't re-fetch
  }
  
  // 600ms debounce (same as Impact page)
  const timer = setTimeout(async () => {
    setOverviewLoading(true);
    
    try {
      const params = new URLSearchParams(currentParams);
      const res = await fetch(`/api/economy-overview?${params}`);
      const json = await res.json();
      
      setEconomyOverview(json.overview || 'Analysis unavailable.');
      setCachedParams(paramsKey); // Cache these params
      
    } catch (error) {
      console.error('Failed to fetch economy overview:', error);
      setEconomyOverview('Economic analysis temporarily unavailable.');
    } finally {
      setOverviewLoading(false);
    }
  }, 600); // 600ms debounce (same as Impact page)
  
  return () => clearTimeout(timer);
}, [kpiYear, displaced, fiscalId, monetaryId, cryptoAdopt, cryptoPolicy, data]);
```

### 6.2 Why In-Memory vs localStorage

**In-memory cache (what Impact page uses):**
- ✅ Simple implementation
- ✅ Survives slider movements within session
- ✅ No quota management needed
- ✅ Clears on page refresh (good for development)
- ❌ Doesn't persist across sessions

**localStorage cache (what we discussed earlier):**
- ✅ Persists across sessions
- ✅ Reduces API costs long-term
- ❌ More complex (quota management, expiry logic)
- ❌ Can show stale data

**Recommendation:** **Use in-memory cache** (same as Impact page)
- Consistent with existing pattern
- Simpler code
- Adequate for current usage
- Can upgrade to localStorage later if needed

### 6.3 Cost Estimate

**Per session:**
- User explores 5-10 slider combinations
- Each unique combination = 1 API call
- 600ms debounce prevents spam
- In-memory cache prevents duplicate calls

**Cost:**
- ~$0.003 per unique combination
- 5-10 calls per session = $0.015-$0.030 per user
- 1000 users/month = **$15-30/month**

**Acceptable at current scale.** Can add localStorage caching later if costs grow.

---

## 7. Testing & Validation

### 7.1 Test Scenarios

**Test 1: Pre-Crisis (CBO baseline, 2027)**
- Debt: 128%, Inflation: 3.2%, Unemployment: 6.5%
- Expected: Calm narrative, notes "building imbalances"
- Should mention: Ghost GDP, debt dynamics turning unfavorable

**Test 2: Crisis Onset (SPICE, 2029)**
- Debt: 165%, Inflation: 8%, Unemployment: 11%
- Expected: Warning tone, crisis approaching
- Should mention: Break point nearing, policy dilemmas

**Test 3: Acute Crisis (SPICE + YCC, 2031)**
- Debt: 182%, Inflation: 11%, Unemployment: 14%
- Expected: Crisis language, acknowledge severity
- Should mention: Conventional hedges failing, capital flight

**Test 4: Extreme Scenario (Tsunami + YCC, 2033)**
- Debt: 240%, Inflation: 16%, Unemployment: 28%
- Expected: Catastrophic tone, system breakdown
- Should mention: Depression-level unemployment, hyperinflation risk

### 7.2 Quality Checks

**Content quality:**
✅ All 4 paragraphs present  
✅ Specific numbers referenced (not vague "high debt")  
✅ Causality explained (WHY, not just WHAT)  
✅ No bullet points or headers within paragraphs  
✅ No mention of SPICE/ZPC token  
✅ Appropriate tone for crisis severity  

**Technical:**
✅ Loads within 2 seconds (after debounce)  
✅ Error handling works (shows fallback message)  
✅ Debounce prevents spam (only calls after 500ms idle)  
✅ Card renders correctly (proper styling, readable)  
✅ Paragraph spacing correct (10px between, 0 on last)  

### 7.3 Edge Cases

**API timeout/failure:**
- Show fallback message: "Economic analysis temporarily unavailable. Please try adjusting sliders."
- Don't break page layout

**Very long response (>300 tokens):**
- AI should self-limit to 4 paragraphs, ~250 words
- If exceeds, truncate gracefully or adjust prompt

**Empty/invalid data:**
- Handle missing `gini` or `cryptoFlight` fields gracefully
- Use defaults: gini = 0.48, cryptoFlight = 0

---

## 8. Success Criteria

**Feature is successful if:**

1. ✅ Card renders below KPI strip on Simulation page
2. ✅ Loads within 2 seconds (post-debounce)
3. ✅ 4 paragraphs generated with specific data references
4. ✅ Compact design (~220px height, doesn't overwhelm page)
5. ✅ Debounce works (600ms idle before API call - same as Impact page)
6. ✅ Error handling graceful (fallback message, no crash)
7. ✅ Tone appropriate to scenario (calm pre-crisis, severe post-crisis)
8. ✅ No SPICE/ZPC mentions (legal compliance)
9. ✅ Mobile responsive (readable on small screens)
10. ✅ Updates correctly when sliders move

---

## 9. Optional Enhancements (Future)

### 9.1 Collapsible Card

If users find it too long, add collapse toggle:

```jsx
const [expanded, setExpanded] = useState(true); // Default open

<div onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
  ECONOMIC OVERVIEW — {kpiYear} {expanded ? '▼' : '▶'}
</div>

{expanded && (
  <div>{/* content */}</div>
)}
```

### 9.2 Copy Button

Allow users to copy overview text:

```jsx
<button 
  onClick={() => navigator.clipboard.writeText(economyOverview)}
  style={{ fontSize: '11px', float: 'right' }}
>
  Copy
</button>
```

### 9.3 Highlight Changes

When year changes, briefly highlight card to draw attention:

```jsx
const [justUpdated, setJustUpdated] = useState(false);

useEffect(() => {
  setJustUpdated(true);
  setTimeout(() => setJustUpdated(false), 1000);
}, [economyOverview]);

<div style={{
  ...cardStyle,
  border: justUpdated ? '2px solid #B8860B' : '1px solid #e2e2e2',
  transition: 'border 0.3s'
}}>
```

---

## 10. Implementation Checklist

**Backend (API):**
- [ ] Create `/api/economy-overview.js`
- [ ] Implement prompt construction function
- [ ] Add error handling (try/catch, fallback response)
- [ ] Test with various parameter combinations
- [ ] Verify Anthropic API key in environment variables

**Frontend (Simulation page):**
- [ ] Add state variables (`economyOverview`, `overviewLoading`)
- [ ] Implement useEffect with 500ms debounce
- [ ] Build API call with proper parameters
- [ ] Add loading state UI (centered, gray text)
- [ ] Add overview card UI (compact, small font)
- [ ] Handle paragraph splitting (`\n\n`)
- [ ] Add error handling (fallback message)
- [ ] Verify placement (after KPI strip, before page end)

**Testing:**
- [ ] Test CBO scenario (pre-crisis)
- [ ] Test SPICE scenario (mid-crisis)
- [ ] Test Tsunami scenario (extreme crisis)
- [ ] Test all policy combinations
- [ ] Test error handling (API timeout)
- [ ] Test debounce (rapid slider movement)
- [ ] Mobile responsiveness
- [ ] Verify no SPICE/ZPC mentions in output

**Polish:**
- [ ] Adjust spacing if needed
- [ ] Verify IBM Plex Mono font applied
- [ ] Check paragraph spacing (10px / 0px)
- [ ] Ensure light gray background (#fafafa)
- [ ] Test on different screen sizes

---

## 11. Files to Modify

**New files:**
- `/api/economy-overview.js` (new serverless function)

**Modified files:**
- `src/pages/chart3-simulation.jsx` (add overview card component)

**No changes needed:**
- Simulation engine (`sim-engine.js`) - already has required data
- Styling - all inline, no CSS files

---

## 12. Rollback Plan

If feature causes issues:

**Quick disable:**
- Comment out overview card rendering (keep API endpoint)
- Page returns to pre-feature state

**Full rollback:**
- Delete `/api/economy-overview.js`
- Remove overview state/useEffect/render from simulation page
- Git revert to pre-feature commit

---

**END OF REQUIREMENTS**

---

## Quick Reference for Claude Code

**TL;DR:**
1. Create `/api/economy-overview.js` (serverless function, calls Anthropic API)
2. Add economy overview card to Simulation page below KPI strip
3. Use compact styling (800px max, 12px font, gray background)
4. Debounce 600ms before API call (same as Impact page)
5. In-memory caching (same pattern as Impact page)
6. 4-paragraph format: Fiscal → AI → Monetary → Hedges

**Priority:** MEDIUM  
**Difficulty:** MEDIUM (new API endpoint + client integration)  
**Time estimate:** 60-90 minutes  
**Impact:** HIGH (makes model more accessible and interpretable)
