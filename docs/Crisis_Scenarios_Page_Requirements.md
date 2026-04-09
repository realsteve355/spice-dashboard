# Crisis Scenarios Page Requirements

**Project:** SPICE Dashboard  
**Feature:** Crisis Scenarios Page (New)  
**Target Implementation:** Claude Code  
**Date:** 2026-03-12

---

## 1. Overview

Create a new standalone page (`/crisis-scenarios`) that serves as the educational bridge between the Simulation page (interactive model) and the Dashboard (investment interface). This page explains the three historical patterns of reserve currency collapse and how AI/crypto wildcards modify each pattern's timeline and severity.

**Purpose:**
- Educational: Teach users Dalio's historical framework
- Pattern Matching: AI-powered analysis maps simulation indicators to crisis types
- Credibility: Demonstrates sophisticated understanding (impresses potential co-founders)
- User Journey: Simulation → Crisis Scenarios → Dashboard (theory → pattern → action)

---

## 2. Page Structure & Layout

### 2.1 URL & Navigation

**URL:** `https://zpc.finance/crisis-scenarios`

**Navigation Bar Updates:**
```
Current: [Home] [The Collision] [Dashboard]
New:     [Home] [Simulation] [Crisis Scenarios] [Dashboard]
```

**Rename:** "The Collision" → "Simulation" (across entire site)

### 2.2 Page Sections

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ • Page title                                            │
│ • Introduction paragraph                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SECTION 1: INTRODUCTION                                 │
│ • Framework explanation                                 │
│ • Why AI/crypto change historical patterns              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SECTION 2: THREE CRISIS TYPES (CARDS/TABS)             │
│ • Type 1: Fast Collapse                                 │
│ • Type 2: Slow Decline                                  │
│ • Type 3: Chaotic Transition                            │
│                                                         │
│ Each card shows:                                        │
│ - Historical examples + timelines                       │
│ - Classic pattern description                           │
│ - AI Modifications subsection                           │
│ - Crypto Modifications subsection                       │
│ - Timeline comparison (classic vs AI/crypto era)        │
│ - Expandable deep dive (optional)                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SECTION 3: YOUR SIMULATION ANALYSIS (AI-POWERED)        │
│ • Current simulation indicators display                 │
│ • AI-generated pattern matching (150-200 words)         │
│ • Historical parallel identification                    │
│ • Timeline estimate with compression factors            │
│ • Link back to Simulation page                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SECTION 4: HISTORICAL DEEP DIVES (EXPANDABLE)           │
│ • Collapsible sections for each crisis                  │
│ • Timeline charts                                       │
│ • Outcome analysis                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Section 1: Introduction

### 3.1 Content

```html
<section class="crisis-intro">
  <h1>Crisis Scenarios</h1>
  <h2 class="subtitle">Understanding Reserve Currency Transitions</h2>

  <p class="intro-text">
    When a reserve currency fails, it doesn't follow a single pattern. History 
    shows three distinct crisis types, each with different triggers, timelines, 
    and outcomes. Understanding which pattern the US dollar transition might 
    follow is critical to estimating both the timeline and severity of the collision.
  </p>

  <div class="framework-box">
    <h3>Three Historical Patterns, Modified by AI and Crypto</h3>
    <p>
      Ray Dalio's analysis of 500 years of reserve currency cycles—Dutch Guilder 
      (1600s), British Pound (1800s), US Dollar (1900s)—reveals consistent patterns. 
      However, the AI and crypto era fundamentally changes how each pattern unfolds:
    </p>
    <ul>
      <li><strong>AI creates deflation/inflation collision</strong> (no historical precedent)</li>
      <li><strong>Crypto enables instant capital flight</strong> (versus weeks/months historically)</li>
      <li><strong>Digital communication compresses timelines</strong> (crises unfold 3–6× faster)</li>
    </ul>
    <p>
      Your simulation indicators suggest which pattern the dollar might follow—
      and how AI and crypto will modify that historical template.
    </p>
  </div>
</section>
```

### 3.2 Styling

```css
.crisis-intro {
  max-width: 900px;
  margin: 60px auto 40px auto;
  padding: 0 20px;
  text-align: center;
}

.crisis-intro h1 {
  font-size: 42px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 20px;
  font-weight: 400;
  color: #666;
  margin-bottom: 32px;
}

.intro-text {
  font-size: 18px;
  line-height: 1.7;
  color: #2d2d2d;
  margin-bottom: 32px;
  text-align: left;
}

.framework-box {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 32px;
  text-align: left;
}

.framework-box h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.framework-box ul {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.framework-box li {
  padding: 8px 0 8px 28px;
  position: relative;
  line-height: 1.6;
}

.framework-box li::before {
  content: "⚡";
  position: absolute;
  left: 0;
  color: #2563eb;
}
```

---

## 4. Section 2: Three Crisis Type Cards

### 4.1 Layout Structure

**Desktop:** 3 cards in single row (33% width each)  
**Tablet:** 3 cards stacked vertically  
**Mobile:** 3 cards stacked, full width

**Alternative:** Tab interface where user clicks to switch between types

### 4.2 Card Template Structure

Each card follows this structure:

```html
<div class="crisis-card">
  <div class="crisis-card-header">
    <div class="crisis-icon">[ICON]</div>
    <h3 class="crisis-title">TYPE 1: FAST COLLAPSE</h3>
    <p class="crisis-duration">Months to 2 Years</p>
  </div>

  <div class="crisis-card-body">
    <!-- Historical Examples -->
    <div class="card-section">
      <h4>Historical Examples</h4>
      <ul class="examples-list">
        <li>
          <strong>Weimar (1923):</strong> 10 months
          <span class="example-detail">Hyperinflation following French occupation</span>
        </li>
        <li>
          <strong>Argentina (2001):</strong> 2 years
          <span class="example-detail">Bank run, corralito, peso devaluation</span>
        </li>
        <li>
          <strong>Asian Crisis (1997):</strong> 18 months
          <span class="example-detail">Currency peg breaks, IMF intervention</span>
        </li>
      </ul>
    </div>

    <!-- Classic Pattern -->
    <div class="card-section">
      <h4>Classic Pattern</h4>
      <ul class="pattern-list">
        <li>External shock triggers cascade (war, embargo, attack)</li>
        <li>Fixed exchange rate breaks</li>
        <li>Bank runs, immediate capital flight</li>
        <li>Currency replacement within 1–2 years</li>
      </ul>
    </div>

    <!-- Timeline Comparison -->
    <div class="timeline-bar">
      <div class="timeline-classic">
        <span class="timeline-label">Classic:</span>
        <div class="timeline-bar-fill" style="width: 100%;">10 months</div>
      </div>
      <div class="timeline-modified">
        <span class="timeline-label">AI/Crypto:</span>
        <div class="timeline-bar-fill timeline-compressed" style="width: 70%;">7 months</div>
        <span class="compression-badge">30% faster</span>
      </div>
    </div>

    <!-- AI Modifications -->
    <div class="card-section modifications">
      <h4>🤖 AI Modifications</h4>
      <ul class="mod-list">
        <li><strong>Unemployment spikes faster/deeper</strong> — AI displacement accelerates job losses during crisis</li>
        <li><strong>Deflation persists during hyperinflation</strong> — AI keeps producing cheaper while currency collapses</li>
        <li><strong>Safety nets overwhelmed</strong> — Government can't tax AI productivity to fund unemployed</li>
      </ul>
    </div>

    <!-- Crypto Modifications -->
    <div class="card-section modifications">
      <h4>₿ Crypto Modifications</h4>
      <ul class="mod-list">
        <li><strong>Capital flight instant</strong> — Not weeks to move gold bars, seconds to move Bitcoin</li>
        <li><strong>Bank runs digital</strong> — Corralito-style deposit freezes harder to enforce (crypto wallets)</li>
        <li><strong>Organic currency replacement</strong> — Don't need govt "Rentenmark," people already using Bitcoin</li>
        <li><strong>Front-running enabled</strong> — Crypto adoption rises during build-up (Weimar citizens couldn't buy dollars early)</li>
      </ul>
    </div>

    <!-- Expandable Deep Dive (Optional) -->
    <details class="deep-dive">
      <summary>Historical Deep Dive: Weimar Hyperinflation</summary>
      <div class="deep-dive-content">
        <h5>Timeline</h5>
        <ul>
          <li>Jan 1923: French occupy Ruhr, inflation accelerates</li>
          <li>Aug 1923: 1 USD = 4.6 million marks</li>
          <li>Nov 1923: 1 USD = 4.2 trillion marks (peak)</li>
          <li>Nov 15, 1923: Rentenmark introduced, old currency abandoned</li>
        </ul>
        <p>
          <strong>Duration:</strong> 10 months acute hyperinflation<br>
          <strong>Outcome:</strong> Complete currency replacement, wealth transfer from savers to asset holders
        </p>
      </div>
    </details>
  </div>
</div>
```

### 4.3 Card Styling

```css
.crisis-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 20px;
}

.crisis-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: box-shadow 0.3s;
}

.crisis-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.crisis-card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.crisis-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.crisis-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.crisis-duration {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin: 0;
}

.crisis-card-body {
  padding: 24px;
}

.card-section {
  margin-bottom: 24px;
}

.card-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.examples-list li {
  margin-bottom: 12px;
  line-height: 1.5;
}

.example-detail {
  display: block;
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.pattern-list,
.mod-list {
  list-style: none;
  padding: 0;
}

.pattern-list li,
.mod-list li {
  padding: 8px 0 8px 20px;
  position: relative;
  line-height: 1.6;
  font-size: 14px;
}

.pattern-list li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #2563eb;
}

.mod-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #2563eb;
  font-weight: bold;
}

.modifications {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.modifications h4 {
  margin-top: 0;
}

/* Timeline Bar */
.timeline-bar {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.timeline-classic,
.timeline-modified {
  margin-bottom: 12px;
}

.timeline-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.timeline-bar-fill {
  background: #cbd5e1;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  display: inline-block;
}

.timeline-compressed {
  background: #2563eb;
  color: white;
}

.compression-badge {
  display: inline-block;
  background: #10b981;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
}

/* Expandable Deep Dive */
.deep-dive {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 16px;
}

.deep-dive summary {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
  padding: 8px 0;
}

.deep-dive summary:hover {
  color: #1d4ed8;
}

.deep-dive-content {
  padding: 16px 0;
  font-size: 14px;
  line-height: 1.6;
}

.deep-dive-content h5 {
  font-size: 14px;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

@media (max-width: 768px) {
  .crisis-cards-container {
    grid-template-columns: 1fr;
  }
}
```

### 4.4 Icons for Each Type

**Type 1 (Fast Collapse):** ⚡ Lightning bolt  
**Type 2 (Slow Decline):** 📉 Downward stairs/chart  
**Type 3 (Chaotic Transition):** 🌀 Cyclone/earthquake

---

## 5. Section 3: AI Pattern Matching (Dynamic)

### 5.1 Data Flow

**Source:** Simulation page passes economic indicators via:
- **Option A:** URL parameters (e.g., `/crisis-scenarios?year=2031&debt=175&inflation=12...`)
- **Option B:** Session storage / localStorage
- **Option C:** Shared React state (if both pages are React components)

**Recommended:** Option A (URL params) for simplicity and shareability

### 5.2 Component Structure

```html
<section class="pattern-analysis">
  <h2>Your Simulation Analysis</h2>
  
  <div class="indicators-display">
    <h3>Current Simulation State (Year: <span id="snapshot-year">2031</span>)</h3>
    <div class="indicators-grid">
      <div class="indicator">
        <span class="indicator-label">Debt/GDP</span>
        <span class="indicator-value" id="debt-value">175%</span>
      </div>
      <div class="indicator">
        <span class="indicator-label">Inflation</span>
        <span class="indicator-value" id="inflation-value">12%</span>
      </div>
      <div class="indicator">
        <span class="indicator-label">Bond Yields</span>
        <span class="indicator-value" id="yield-value">9%</span>
      </div>
      <div class="indicator">
        <span class="indicator-label">Crypto Adoption</span>
        <span class="indicator-value" id="crypto-value">28%</span>
      </div>
      <div class="indicator">
        <span class="indicator-label">Unemployment</span>
        <span class="indicator-value" id="unemployment-value">9%</span>
      </div>
      <div class="indicator">
        <span class="indicator-label">Gini Coefficient</span>
        <span class="indicator-value" id="gini-value">0.58</span>
      </div>
    </div>
  </div>

  <div class="ai-analysis-box">
    <div class="analysis-header">
      <h3>AI-Generated Crisis Pattern Analysis</h3>
      <div class="loading-spinner" id="analysis-loading" style="display: none;">
        Analyzing...
      </div>
    </div>
    
    <div class="analysis-content" id="analysis-text">
      <!-- AI-generated content inserted here -->
    </div>

    <div class="analysis-footer">
      <a href="/simulation" class="back-link">← Back to Simulation</a>
      <button class="regenerate-btn" id="regenerate-analysis">Regenerate Analysis</button>
    </div>
  </div>
</section>
```

### 5.3 AI Prompt Template

```javascript
async function generatePatternAnalysis(economicData) {
  const {
    snapshotYear,
    debtGDP,
    inflation,
    bondYield,
    cryptoAdoption,
    unemployment,
    giniCoefficient,
    yieldCurveControl
  } = economicData;

  const prompt = `You are analyzing US sovereign debt crisis through Ray Dalio's reserve currency framework, modified by AI and crypto wildcards.

Historical Context:
- Dutch Guilder collapsed 1780-1795 (15 years, chaotic)
- British Pound declined 1914-1971 (57 years, managed)
- Weimar hyperinflation 1923 (10 months, fast)

Current Indicators (Year ${snapshotYear}):
- Debt/GDP: ${debtGDP}%
- Inflation: ${inflation}%
- 10Y Bond Yield: ${bondYield}%
- Crypto Adoption: ${cryptoAdoption}%
- Unemployment: ${unemployment}%
- Gini Coefficient: ${giniCoefficient}
- Yield Curve Control: ${yieldCurveControl ? 'Active' : 'Inactive'}

Task: Identify which of the three crisis patterns this most resembles:
1. Type 1: Fast Collapse (months to 2 years) - like Weimar, Argentina
2. Type 2: Slow Decline (decades) - like British Pound
3. Type 3: Chaotic Transition (5-15 years) - like Dutch Guilder

Provide 150-200 word analysis covering:
1. Which crisis type (1, 2, or 3) and confidence level
2. Historical parallel percentage breakdown (e.g., "60% Dutch pattern, 30% British, 10% novel")
3. Classic timeline vs AI/crypto modified timeline
4. Key AI wildcard effects (unemployment, deflation collision)
5. Key crypto wildcard effects (capital flight, front-running)
6. Most likely catalyst event

Tone: Analytical, historically grounded, specific dates/precedents.
Acknowledge Dalio framework applies, but emphasize AI/crypto create unprecedented dynamics.
Do NOT sugarcoat severity. Be realistic about limited policy options.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        { role: "user", content: prompt }
      ],
    })
  });

  const data = await response.json();
  return data.content[0].text;
}
```

### 5.4 Caching Strategy

**Same as Human Impact Analysis:**

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
  
  // Round to 1 decimal for better cache hit rate
  const rounded = {
    debt: Math.round(debtGDP * 10) / 10,
    yield: Math.round(bondYield * 10) / 10,
    inflation: Math.round(inflation * 10) / 10,
    unemployment: Math.round(unemployment * 10) / 10,
    crypto: Math.round(cryptoAdoption * 10) / 10,
    gini: Math.round(giniCoefficient * 100) / 100,
  };
  
  return `crisis-pattern-${snapshotYear}-${rounded.debt}-${rounded.yield}-${rounded.inflation}-${rounded.unemployment}-${rounded.crypto}-${rounded.gini}-${yieldCurveControl ? 'ycc' : 'no-ycc'}`;
}

function getCachedAnalysis(cacheKey) {
  try {
    const cached = localStorage.getItem(`spice_crisis_v1_${cacheKey}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      const ageInDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays < 90) {
        return parsed.analysis;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
}

function setCachedAnalysis(cacheKey, analysis) {
  try {
    const cacheData = {
      analysis: analysis,
      timestamp: Date.now(),
      version: 'v1'
    };
    localStorage.setItem(`spice_crisis_v1_${cacheKey}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}
```

### 5.5 Styling for AI Analysis Section

```css
.pattern-analysis {
  max-width: 900px;
  margin: 80px auto;
  padding: 0 20px;
}

.pattern-analysis h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 32px;
  text-align: center;
}

.indicators-display {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.indicators-display h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.indicator {
  background: white;
  padding: 16px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.indicator-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.indicator-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.ai-analysis-box {
  background: white;
  border: 2px solid #2563eb;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.analysis-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.loading-spinner {
  font-size: 14px;
  color: #2563eb;
  font-weight: 500;
}

.analysis-content {
  font-size: 16px;
  line-height: 1.8;
  color: #2d2d2d;
  margin-bottom: 24px;
  min-height: 200px;
}

.analysis-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.back-link {
  font-size: 14px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.regenerate-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.regenerate-btn:hover {
  background: #1d4ed8;
}

.regenerate-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
```

---

## 6. Section 4: Historical Deep Dives (Optional Expandable)

### 6.1 Structure

```html
<section class="deep-dives">
  <h2>Historical Deep Dives</h2>
  <p class="section-intro">
    Explore detailed timelines and outcomes of key historical crises to understand 
    the patterns and precedents.
  </p>

  <details class="dive-section">
    <summary>
      <span class="dive-icon">📊</span>
      <span class="dive-title">The Dutch Guilder Collapse (1780–1795)</span>
    </summary>
    <div class="dive-content">
      <h4>Timeline</h4>
      <ul class="timeline-list">
        <li><strong>1770s:</strong> Debt/GDP climbs above 150% from wars with Britain/France</li>
        <li><strong>1780–1784:</strong> Fourth Anglo-Dutch War - military defeat exposes fiscal weakness</li>
        <li><strong>1784:</strong> Peace treaty, but financial crisis continues</li>
        <li><strong>1787:</strong> Civil unrest, Prussian intervention</li>
        <li><strong>1795:</strong> French invasion, Batavian Republic formed, guilder effectively dead</li>
      </ul>

      <h4>Outcome</h4>
      <p>
        <strong>Duration:</strong> 15 years (1780–1795) from crisis onset to collapse<br>
        <strong>Winners:</strong> British asset holders, gold holders, productive land owners<br>
        <strong>Losers:</strong> Dutch bondholders (haircuts), guilder cash holders (debasement)<br>
        <strong>Successor:</strong> British pound becomes dominant reserve currency
      </p>

      <h4>Lessons for Today</h4>
      <p>
        The Dutch pattern is chaotic transition without external manager. When Britain's 
        pound later declined (1914–1971), the US actively managed the transition via 
        Bretton Woods. No such manager exists for the US dollar today.
      </p>
    </div>
  </details>

  <details class="dive-section">
    <summary>
      <span class="dive-icon">🇬🇧</span>
      <span class="dive-title">The British Pound Decline (1914–1971)</span>
    </summary>
    <div class="dive-content">
      <!-- Similar structure -->
    </div>
  </details>

  <details class="dive-section">
    <summary>
      <span class="dive-icon">💸</span>
      <span class="dive-title">Weimar Hyperinflation (1921–1923)</span>
    </summary>
    <div class="dive-content">
      <!-- Similar structure -->
    </div>
  </details>

  <details class="dive-section">
    <summary>
      <span class="dive-icon">🇦🇷</span>
      <span class="dive-title">Argentina Default (2001)</span>
    </summary>
    <div class="dive-content">
      <!-- Similar structure -->
    </div>
  </details>
</section>
```

### 6.2 Styling

```css
.deep-dives {
  max-width: 900px;
  margin: 80px auto;
  padding: 0 20px;
}

.deep-dives h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
}

.section-intro {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

.dive-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.dive-section summary {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  transition: background 0.2s;
}

.dive-section summary:hover {
  background: #f8f9fa;
}

.dive-icon {
  font-size: 24px;
  margin-right: 16px;
}

.dive-title {
  flex: 1;
}

.dive-content {
  padding: 0 24px 24px 64px;
  font-size: 15px;
  line-height: 1.7;
}

.dive-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 24px 0 12px 0;
}

.timeline-list {
  list-style: none;
  padding: 0;
}

.timeline-list li {
  padding: 8px 0 8px 24px;
  position: relative;
  line-height: 1.6;
}

.timeline-list li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #2563eb;
  font-weight: bold;
}
```

---

## 7. Integration with Simulation Page

### 7.1 Add Crisis Type Indicator to Simulation Page

**Location:** Below the 6 economic graphs, above Human Impact Analysis section

```html
<div class="crisis-type-indicator">
  <h3>Projected Crisis Pattern</h3>
  
  <div class="crisis-type-box">
    <div class="crisis-type-name" id="crisis-type-name">
      TYPE 3: Chaotic Transition (Modified)
    </div>
    
    <div class="crisis-type-details">
      <div class="detail-row">
        <span class="detail-label">Historical Parallel:</span>
        <span class="detail-value" id="historical-parallel">Dutch Guilder 1780–1795</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Classic Timeline:</span>
        <span class="detail-value">15 years</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">AI/Crypto Modified:</span>
        <span class="detail-value" id="modified-timeline">4–5 years (3× faster)</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Projected Period:</span>
        <span class="detail-value" id="projected-period">2029–2033</span>
      </div>
    </div>

    <a href="/crisis-scenarios?[URL_PARAMS]" class="learn-more-btn">
      Learn About Crisis Patterns →
    </a>
  </div>
</div>
```

### 7.2 Styling for Simulation Page Indicator

```css
.crisis-type-indicator {
  max-width: 1200px;
  margin: 60px auto 40px auto;
  padding: 0 20px;
}

.crisis-type-indicator h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.crisis-type-box {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 28px;
}

.crisis-type-name {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #cbd5e1;
}

.crisis-type-details {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.learn-more-btn {
  display: inline-block;
  background: #2563eb;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s;
}

.learn-more-btn:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }
}
```

### 7.3 JavaScript for URL Parameter Passing

```javascript
// On Simulation page - when user clicks "Learn More"
function generateCrisisScenariosURL() {
  const economicData = {
    year: getCurrentSnapshotYear(),
    debt: getCurrentDebtGDP(),
    inflation: getCurrentInflation(),
    yield: getCurrentBondYield(),
    crypto: getCurrentCryptoAdoption(),
    unemployment: getCurrentUnemployment(),
    gini: getCurrentGini(),
    ycc: isYCCActive() ? '1' : '0'
  };

  const params = new URLSearchParams(economicData);
  return `/crisis-scenarios?${params.toString()}`;
}

// Update link href when sliders change
document.querySelector('.learn-more-btn').addEventListener('click', function(e) {
  e.preventDefault();
  window.location.href = generateCrisisScenariosURL();
});
```

---

## 8. Responsive Design

### 8.1 Breakpoints

- **Desktop:** >1200px - full layout
- **Tablet:** 768px–1199px - adjusted spacing
- **Mobile:** <768px - single column, stacked cards

### 8.2 Mobile Optimizations

```css
@media (max-width: 768px) {
  .crisis-intro h1 {
    font-size: 32px;
  }

  .crisis-cards-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .indicators-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ai-analysis-box {
    padding: 20px;
  }

  .analysis-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .back-link,
  .regenerate-btn {
    width: 100%;
    text-align: center;
  }

  .deep-dives {
    padding: 0 16px;
  }

  .dive-content {
    padding: 0 16px 20px 16px;
  }
}
```

---

## 9. Performance & Optimization

### 9.1 Loading Strategy

**Initial Load:**
1. Load page structure + static content immediately
2. Parse URL parameters
3. Display economic indicators from URL params
4. Check cache for analysis
5. If cache miss, show loading spinner, call AI API
6. Render analysis when received

**Cache Strategy:**
- localStorage for AI-generated analyses (90-day expiry)
- Same cache key logic as Human Impact Analysis
- Expected cache hit rate: 70–85% after 50 unique combinations

### 9.2 Error Handling

```javascript
async function loadAnalysis(economicData) {
  const cacheKey = generateCacheKey(economicData);
  const cached = getCachedAnalysis(cacheKey);

  if (cached) {
    displayAnalysis(cached);
    return;
  }

  try {
    showLoadingSpinner();
    const analysis = await generatePatternAnalysis(economicData);
    setCachedAnalysis(cacheKey, analysis);
    displayAnalysis(analysis);
  } catch (error) {
    console.error('Analysis generation failed:', error);
    displayErrorMessage(
      "Unable to generate analysis. Please try again or return to the simulation."
    );
  } finally {
    hideLoadingSpinner();
  }
}

function displayErrorMessage(message) {
  document.getElementById('analysis-text').innerHTML = `
    <div class="error-box">
      <p>${message}</p>
      <button onclick="location.reload()">Retry</button>
    </div>
  `;
}
```

---

## 10. Success Criteria

**Page is successful if:**

1. ✅ Three crisis type cards render correctly with all content
2. ✅ AI pattern matching generates grounded, thesis-aligned analysis
3. ✅ Analysis updates when arriving from Simulation page with different parameters
4. ✅ Loading states provide clear feedback
5. ✅ Mobile responsive layout works smoothly
6. ✅ Historical deep dives expand/collapse correctly
7. ✅ Caching reduces API costs to <$10/month
8. ✅ Page loads in <2 seconds (excluding AI generation)
9. ✅ Navigation between Simulation → Crisis Scenarios → Dashboard is seamless
10. ✅ Technical quality impresses potential co-founders

---

## 11. Future Enhancements (Out of Scope for V1)

- **Interactive timeline slider** showing how crisis evolves year-by-year
- **Comparison mode** showing multiple scenarios side-by-side
- **Export analysis** as PDF or shareable link
- **Historical crisis charts** (inflation charts, debt charts, etc.)
- **"What-if" scenarios** ("What if crypto banned?" "What if UBI enacted?")

---

**END OF CRISIS SCENARIOS PAGE REQUIREMENTS**
