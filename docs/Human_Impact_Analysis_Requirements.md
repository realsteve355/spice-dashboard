# Human Impact Analysis Feature - Requirements Document

**Project:** SPICE Dashboard - Collision Page Enhancement  
**Feature:** AI-Powered Socioeconomic Impact Analysis  
**Target Implementation:** Claude Code  
**Date:** 2026-03-12

---

## 1. Overview

Add a new "Human Impact Analysis" section to the Collision page (`/collision`) that uses an AI agent to translate abstract macro-economic data into concrete impacts on four distinct socioeconomic groups. This feature demonstrates both technical sophistication and makes "The Great Collision" thesis tangible for users.

---

## 2. Placement & Layout

### 2.1 Position
- **Location:** Directly below the existing 6 economic graphs
- **Full-width section** spanning the page width
- **Clear visual separation** from graphs above (e.g., horizontal rule or margin spacing)

### 2.2 Section Header
```
HUMAN IMPACT ANALYSIS
Real-world effects on households at [SNAPSHOT_YEAR]
```
- Header styling consistent with existing page headers
- Snapshot year dynamically updates based on slider position

### 2.3 Card Grid Layout
- **4 cards in a responsive grid:**
  - Desktop: 2×2 grid (2 cards per row)
  - Tablet: 2×2 grid or 1×4 column (depending on width)
  - Mobile: 1×4 column (stacked vertically)
- **Equal height cards** with consistent spacing
- White background, light grey borders (consistent with current theme)

---

## 3. Socioeconomic Groups

Each card represents one group with distinct economic characteristics:

### Group 1: Low-Income Service Workers
**Defining Characteristics:**
- Income: <$35k household
- Employment: Gig economy, retail, hospitality, care work
- Assets: Minimal savings, renters
- Vulnerabilities: No wage protection from inflation, irregular hours, zero healthcare benefits

**Key Impact Factors to Consider:**
- Real wage erosion (inflation vs nominal wages)
- Unemployment rate changes
- Cost of living pressures
- Access to safety nets

---

### Group 2: Middle-Class Salary Workers
**Defining Characteristics:**
- Income: $35k-$100k household
- Employment: Teachers, nurses, office workers, tradespeople
- Assets: Mortgaged home, small 401k, some savings
- Vulnerabilities: Fixed salaries lag inflation, mortgage payment stress, modest investment exposure

**Key Impact Factors to Consider:**
- Real wage purchasing power
- Mortgage rate impacts (if refinancing needed)
- Retirement account losses
- Healthcare cost inflation

---

### Group 3: Affluent Professionals
**Defining Characteristics:**
- Income: $100k-$500k household
- Employment: Dual-income professionals, small business owners, tech workers
- Assets: Substantial equity portfolios, real estate, diversified investments
- Vulnerabilities: Significant equity/bond exposure, capital gains tax implications, real estate illiquidity

**Key Impact Factors to Consider:**
- Portfolio losses (equity/bond market performance)
- Real estate wealth effects
- Tax policy changes
- Alternative asset opportunities (crypto adoption)

---

### Group 4: Retirees & Fixed-Income
**Defining Characteristics:**
- Income: Social Security, pensions, fixed annuities, bond interest
- Age: 65+
- Assets: Bond-heavy portfolios, paid-off homes, structured products
- Vulnerabilities: Fixed income destroyed by inflation, healthcare cost exposure, cannot return to work

**Key Impact Factors to Consider:**
- Real value of fixed payments (inflation erosion)
- Bond portfolio losses (yield curve impacts)
- Healthcare cost inflation
- Legacy wealth preservation concerns

---

## 4. Data Inputs to AI Agent

### 4.1 Economic Indicators at Snapshot Year
The AI agent receives the following data points from the current state of the Collision page:

**From Graphs (at snapshot_year position):**
1. **Debt/GDP ratio** (%)
2. **10-Year Bond Yield** (%)
3. **Inflation Rate** (CPI YoY %)
4. **Unemployment Rate** (%)
5. **Crypto Adoption Rate** (% of population)
6. **Gini Coefficient** (wealth inequality measure)

**From Sliders:**
7. **Gini Coefficient Setting** (slider value)
8. **Crypto Adoption Wildcard** (slider value)
9. **Yield Curve Control Toggle** (on/off)
10. **Snapshot Year** (2020-2040)

### 4.2 Optional Context Data
If available from the model:
- Real vs Nominal GDP growth
- Wage growth vs inflation differential
- Asset price indices (equities, real estate)

---

## 5. AI Agent Implementation

### 5.1 API Integration
**Use Anthropic API (existing pattern from artifacts):**
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      { role: "user", content: constructPrompt(economicData) }
    ],
  })
});
```

### 5.2 Prompt Engineering

**Prompt Template:**
```
You are analyzing the economic impact of "The Great Collision" — a structural crisis where AI-driven deflation collides with sovereign debt monetization.

Current Economic State (Year [SNAPSHOT_YEAR]):
- Debt/GDP: [VALUE]%
- 10Y Bond Yield: [VALUE]%
- Inflation (CPI): [VALUE]%
- Unemployment: [VALUE]%
- Crypto Adoption: [VALUE]%
- Gini Coefficient: [VALUE]
- Yield Curve Control: [ON/OFF]

Task: Analyze the impact on [GROUP_NAME] households.

Group Profile:
[INSERT GROUP CHARACTERISTICS]

Provide a 120-150 word analysis covering:
1. Primary economic pressure (most acute pain point)
2. Secondary effects (cascading impacts)
3. Asset/income positioning (winners/losers)
4. Potential protective actions (if any viable options exist)

Tone: Clinical but empathetic. Ground analysis in the specific data points provided. Acknowledge when conventional hedges fail (this is a structural crisis, not cyclical recession). Be realistic about limited options for most groups.

Do not use bullet points. Write in flowing prose paragraphs.
```

**Critical Prompt Rules:**
- NO generic advice ("diversify your portfolio," "build an emergency fund")
- Ground every statement in the provided economic data
- Acknowledge crisis severity honestly (don't sugarcoat)
- Reference specific vulnerabilities of each group
- Mention when conventional wisdom fails (e.g., "60/40 portfolio," "TIPS," "gold ETFs")

### 5.3 Response Handling
- Parse AI response text
- Display in card body
- Handle API errors gracefully (show fallback message)
- Consider caching responses for identical input states (optional optimization)

---

## 6. UI/UX Specifications

### 6.1 Card Design

**Card Structure:**
```
┌─────────────────────────────────────┐
│ [GROUP ICON] GROUP NAME             │
│ Income: $XX-$XX | Assets: [TYPE]    │
├─────────────────────────────────────┤
│                                     │
│ [AI-generated impact analysis]      │
│ [120-150 words of flowing prose]    │
│                                     │
└─────────────────────────────────────┘
```

**Visual Elements:**
- **Group Icon:** Simple SVG icon representing each group (optional but recommended)
  - Service Workers: Shopping cart or apron icon
  - Middle Class: House or briefcase icon
  - Affluent: Building or chart icon
  - Retirees: Clock or rocking chair icon
- **Header:** Bold group name + one-line demographic summary
- **Body:** AI-generated text with comfortable line-height (1.6)
- **Footer (optional):** Timestamp of last analysis generation

### 6.2 Styling (White Theme)
```css
.impact-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.impact-card-header {
  font-weight: 600;
  font-size: 18px;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.impact-card-subtitle {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}

.impact-card-body {
  font-size: 15px;
  line-height: 1.6;
  color: #2d2d2d;
}
```

### 6.3 Loading States
**While AI generates responses:**
- Show skeleton loaders or pulsing animation in cards
- Display "Analyzing impact..." message
- Disable slider interactions during generation (or queue requests)

**Error States:**
- If API fails: "Unable to generate analysis. Please try again."
- If data incomplete: "Insufficient data for analysis at this year."

---

## 7. Interaction Behavior

### 7.1 Trigger Conditions
**When to regenerate analysis:**
- User moves the **Snapshot Year slider** (debounced, 500ms delay)
- User changes **Gini Coefficient slider** (debounced)
- User changes **Crypto Adoption slider** (debounced)
- User toggles **Yield Curve Control**

**When NOT to regenerate:**
- User hovers over graphs
- User opens/closes policy analysis tab (no change to economic state)

### 7.2 Debouncing
- **500ms debounce** on slider movements
- Only generate analysis after user stops moving slider
- Show loading state immediately when generation starts

### 7.3 Accessibility
- Cards must be keyboard navigable
- Screen reader friendly (proper ARIA labels)
- Sufficient color contrast (already achieved with white theme)

---

## 8. Technical Implementation Notes

### 8.1 React Component Structure
```
CollisionPage
├── ExistingGraphsSection
│   ├── DebtGDPChart
│   ├── BondYieldChart
│   └── ... (4 more charts)
└── HumanImpactSection (NEW)
    ├── SectionHeader
    ├── ImpactCardGrid
    │   ├── ImpactCard (Low-Income)
    │   ├── ImpactCard (Middle-Class)
    │   ├── ImpactCard (Affluent)
    │   └── ImpactCard (Retirees)
    └── LoadingOverlay (conditional)
```

### 8.2 State Management
**Required State:**
- `humanImpactAnalyses`: Object containing analysis text for each of 4 groups
- `isGenerating`: Boolean for loading state
- `lastGeneratedState`: Object storing economic data of last generation (for debounce/caching)

**Data Flow:**
1. User moves slider → update snapshot year state
2. Debounce timer triggers → gather all economic data
3. Call API with data → set `isGenerating: true`
4. Receive responses → update `humanImpactAnalyses`, set `isGenerating: false`
5. Re-render cards with new analysis text

### 8.3 Performance Considerations
- **Parallel API calls:** Generate all 4 group analyses simultaneously (Promise.all)
- **Response caching:** CRITICAL - implement aggressive caching (see Section 8.4)
- **Lazy loading:** Only generate on first scroll into view (optional)

### 8.4 Caching Implementation (CRITICAL)

**Purpose:** Minimize API costs by storing generated analyses and reusing them for identical economic states.

#### 8.4.1 Cache Key Generation

Generate a unique cache key from the economic state:

```javascript
function generateCacheKey(economicData) {
  const {
    snapshotYear,
    debtGDP,
    bondYield,
    inflation,
    unemployment,
    cryptoAdoption,
    giniCoefficient,
    yieldCurveControl
  } = economicData;
  
  // Round values to 1 decimal place to increase cache hit rate
  const rounded = {
    debt: Math.round(debtGDP * 10) / 10,
    yield: Math.round(bondYield * 10) / 10,
    inflation: Math.round(inflation * 10) / 10,
    unemployment: Math.round(unemployment * 10) / 10,
    crypto: Math.round(cryptoAdoption * 10) / 10,
    gini: Math.round(giniCoefficient * 100) / 100,
  };
  
  // Create deterministic cache key
  return `impact-${snapshotYear}-${rounded.debt}-${rounded.yield}-${rounded.inflation}-${rounded.unemployment}-${rounded.crypto}-${rounded.gini}-${yieldCurveControl ? 'ycc' : 'no-ycc'}`;
}
```

**Key Design Decisions:**
- **Round to 1 decimal:** Increases cache hits (165.234% and 165.187% both round to 165.2%)
- **Include all variables:** Ensures cache invalidation when any slider moves significantly
- **Deterministic:** Same economic state always generates same key

#### 8.4.2 Storage Mechanism

**Use localStorage (persistent across browser sessions):**

```javascript
const CACHE_PREFIX = 'spice_human_impact_';
const CACHE_VERSION = 'v1_'; // Increment if prompt changes

function getCachedAnalysis(cacheKey) {
  try {
    const fullKey = CACHE_PREFIX + CACHE_VERSION + cacheKey;
    const cached = localStorage.getItem(fullKey);
    
    if (cached) {
      const parsed = JSON.parse(cached);
      
      // Optional: Check cache age (remove stale entries)
      const ageInDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays > 90) {
        localStorage.removeItem(fullKey);
        return null;
      }
      
      return parsed.analyses; // Object with 4 group analyses
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
}

function setCachedAnalysis(cacheKey, analyses) {
  try {
    const fullKey = CACHE_PREFIX + CACHE_VERSION + cacheKey;
    const cacheData = {
      analyses: analyses,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(fullKey, JSON.stringify(cacheData));
  } catch (error) {
    // Handle quota exceeded (localStorage is typically 5-10MB)
    if (error.name === 'QuotaExceededError') {
      console.warn('Cache quota exceeded, clearing old entries');
      clearOldCacheEntries();
    }
  }
}

function clearOldCacheEntries() {
  // Clear entries older than 30 days
  const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
  const now = Date.now();
  
  keys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      const ageInDays = (now - data.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays > 30) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      // Invalid cache entry, remove it
      localStorage.removeItem(key);
    }
  });
}
```

#### 8.4.3 Cache-First Request Flow

**Complete implementation pattern:**

```javascript
async function fetchHumanImpactAnalysis(economicData) {
  // 1. Generate cache key
  const cacheKey = generateCacheKey(economicData);
  
  // 2. Check cache first
  const cached = getCachedAnalysis(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }
  
  console.log('Cache miss, generating via API:', cacheKey);
  
  // 3. Cache miss - generate via API
  try {
    const analyses = await generateViaAPI(economicData);
    
    // 4. Store in cache
    setCachedAnalysis(cacheKey, analyses);
    
    return analyses;
  } catch (error) {
    console.error('API generation failed:', error);
    throw error;
  }
}

async function generateViaAPI(economicData) {
  // Generate all 4 groups in parallel
  const groups = [
    { name: 'Low-Income Service Workers', profile: '...' },
    { name: 'Middle-Class Salary Workers', profile: '...' },
    { name: 'Affluent Professionals', profile: '...' },
    { name: 'Retirees & Fixed-Income', profile: '...' }
  ];
  
  const promises = groups.map(group => 
    callClaudeAPI(economicData, group)
  );
  
  const results = await Promise.all(promises);
  
  return {
    lowIncome: results[0],
    middleClass: results[1],
    affluent: results[2],
    retirees: results[3]
  };
}
```

#### 8.4.4 Cache Statistics & Monitoring

**Optional but recommended - track cache performance:**

```javascript
function getCacheStats() {
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_PREFIX + CACHE_VERSION));
  
  return {
    totalEntries: keys.length,
    estimatedSize: JSON.stringify(localStorage).length,
    oldestEntry: Math.min(...keys.map(k => {
      try {
        return JSON.parse(localStorage.getItem(k)).timestamp;
      } catch {
        return Date.now();
      }
    }))
  };
}

// Log cache stats on component mount (development only)
console.log('Cache stats:', getCacheStats());
```

#### 8.4.5 Cache Invalidation Strategy

**When to clear cache:**

1. **Version bump:** Increment `CACHE_VERSION` if prompt engineering changes significantly
2. **Manual clear:** Provide admin function to wipe cache if needed
3. **Automatic cleanup:** Remove entries >90 days old
4. **Quota management:** Auto-clear oldest 20% of entries if localStorage quota exceeded

```javascript
// Admin function (expose in dev tools or settings)
function clearAllCache() {
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
  console.log(`Cleared ${keys.length} cache entries`);
}
```

#### 8.4.6 Expected Cache Performance

**Assumptions:**
- Snapshot year slider: 21 possible values (2020-2040)
- Gini slider: ~10 meaningful positions
- Crypto slider: ~10 meaningful positions
- YCC toggle: 2 states
- Other values vary continuously but round to 1 decimal

**Maximum unique combinations:** ~4,200 possible states

**Realistic user behavior:**
- Users explore 5-10 slider combinations per session
- 80% of users explore common scenarios (Debt/GDP 150-180%, Inflation 8-15%)
- Cache hit rate after 50 unique visitors: **~60-70%**
- Cache hit rate after 200 unique visitors: **~85-90%**

**Cost projection with caching:**
- First 100 unique states: $0.40 total (100 × $0.004)
- Next 100 unique states: $0.40 total
- Ongoing (after 200 states): ~$10-20/month (cache hit rate 85%+)

**Without caching (for comparison):**
- 100 users/day × 8 slider moves × $0.004 = **$96/month**

**With caching:**
- Same usage = **$10-20/month** (80-90% cost reduction)

---

## 9. Future Enhancements (Out of Scope for V1)

- **Historical comparison:** Show how impact changed from previous snapshot year
- **Percentile drill-down:** Let users click a group to see P25/P50/P75 impacts
- **Export analysis:** Download button for PDF/text export
- **Localization:** Adjust currency/terminology for non-US users

---

## 10. Success Criteria

**V1 is successful if:**
1. ✅ 4 cards render correctly below existing graphs
2. ✅ AI generates grounded, thesis-aligned analysis for each group
3. ✅ Analysis updates when sliders move (with appropriate debounce)
4. ✅ Loading states provide clear feedback
5. ✅ Mobile responsive layout works smoothly
6. ✅ No console errors, API calls succeed reliably
7. ✅ Analysis demonstrates that conventional hedges fail in structural crisis
8. ✅ Technical quality impresses potential co-founders

---

## 11. Example Output (for reference)

**Group: Middle-Class Salary Workers**  
**Snapshot Year: 2032 | Inflation: 12% | Debt/GDP: 175% | Unemployment: 8%**

*At these levels, middle-class households face a severe purchasing power crisis. With inflation at 12% but typical wage growth of 3-4%, real incomes decline by roughly 8% annually. A family earning $75,000 in 2025 purchasing power now needs $95,000 just to stand still—yet nominal raises rarely keep pace during debt crises. Mortgage holders with fixed rates see some relief, but those needing to refinance face punitive yields. Retirement accounts, typically 60/40 stock/bond portfolios, suffer dual losses as both equities and bonds reprice for structural crisis. TIPS and I-Bonds provide minimal protection when sovereign debt itself is the risk. The conventional "save more, diversify" playbook fails because there's nowhere safe to save. Some households begin exploring crypto adoption (currently 23% of population) as a non-sovereign store of value, though volatility remains a barrier for risk-averse savers.*

---

## 12. Questions for Steve (if any)

1. Should the analysis include specific mentions of SPICE/ZPC as a hedge option? (Probably NO for legal separation reasons)
2. Preferred icon style (minimal line icons vs solid shapes)?
3. Any specific economic scenarios you want the AI to emphasize?

---

**END OF REQUIREMENTS DOCUMENT**
