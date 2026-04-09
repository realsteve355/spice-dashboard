# Home Page Redesign - Requirements Document

**Project:** SPICE Dashboard - Home Page Redesign  
**Feature:** SPICE Thesis Presentation with Live Data Logo  
**Target Implementation:** Claude Code  
**Date:** 2026-03-16  
**Priority:** HIGH

---

## 1. Executive Summary

**Problem:**
Current home page doesn't clearly distinguish between "SPICE thesis" (what we believe) and "user exploration" (simulation). Homepage should present SPICE's fixed forecast and investment positioning, not user-controlled scenarios.

**Solution:**
Redesigned home page with:
1. **Logo as data visualization** - Shows debt/AI/crypto with colored circle indicating SPICE level
2. **Fixed SPICE parameters** - Hard-coded assumptions (not user sliders)
3. **Live data integration** - Pull current metrics from FRED/market data
4. **Clear investment focus** - Portfolio allocation is the primary CTA

**User Flow:**
```
Land on homepage
  ↓
See logo data viz (ORANGE = high risk)
  ↓
Understand SPICE thesis (debt + AI + crypto)
  ↓
View current indicators (live data)
  ↓
See crisis timeline (2029-2032 window)
  ↓
Understand why traditional hedges fail
  ↓
ACTION: View Portfolio OR Run Simulation
```

---

## 2. Logo Data Visualization

### 2.1 Design Specifications

**Visual Structure:**
```
  DEBT/GDP              AI JOBS
    122%                  8%
     ════●════
         ↓
    CRYPTO FLIGHT
        12%
```

**SVG Code:**
```jsx
<svg width="280" height="175" viewBox="0 0 280 175" xmlns="http://www.w3.org/2000/svg">
  {/* Circle - filled with SPICE level color */}
  <circle 
    cx="140" 
    cy="64" 
    r="38" 
    stroke={circleColor}    // GREEN/YELLOW/ORANGE/RED
    strokeWidth="3" 
    fill={circleColor}      // Same color
    fillOpacity="0.5"       // 50% opacity
  />
  
  {/* Left horizontal line (DEBT) */}
  <line x1="42" y1="64" x2="102" y2="64" stroke="#111" strokeWidth="2.5"/>
  
  {/* Right horizontal line (AI) */}
  <line x1="178" y1="64" x2="238" y2="64" stroke="#111" strokeWidth="2.5"/>
  
  {/* Arrow down (CRYPTO) */}
  <line x1="140" y1="102" x2="140" y2="144" stroke="#111" strokeWidth="2.5"/>
  <polygon points="140,144 134,134 146,134" fill="#111"/>
</svg>
```

### 2.2 Color Mapping

**SPICE Level → Circle Color:**
```javascript
const SPICE_COLORS = {
  'GREEN': '#16a34a',   // Safe
  'YELLOW': '#eab308',  // Elevated
  'ORANGE': '#f97316',  // High risk
  'RED': '#dc2626'      // Crisis
};
```

### 2.3 Data Labels (Positioned Around Logo)

**CSS Positioning:**
```css
.logo-svg-container {
  position: relative;
}

.data-label {
  position: absolute;
  font-size: 11px;
  color: #111;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'IBM Plex Mono', monospace;
}

.data-value {
  display: block;
  font-size: 16px;
  color: #dc2626;
  margin-top: 4px;
}

.label-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 12px;
  text-align: right;
}

.label-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 12px;
  text-align: left;
}

.label-bottom {
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  margin-top: 12px;
  text-align: center;
}
```

### 2.4 React Component

```jsx
function SPICEDataLogo({ debt, ai, crypto, spiceLevel }) {
  const color = SPICE_COLORS[spiceLevel];
  
  return (
    <div className="logo-svg-container" style={{ position: 'relative' }}>
      {/* Left label - DEBT */}
      <div className="data-label label-left">
        DEBT/GDP
        <span className="data-value">{debt}%</span>
      </div>
      
      {/* Right label - AI */}
      <div className="data-label label-right">
        AI JOBS
        <span className="data-value">{ai}%</span>
      </div>
      
      {/* Bottom label - CRYPTO */}
      <div className="data-label label-bottom">
        CRYPTO FLIGHT
        <span className="data-value">{crypto}%</span>
      </div>
      
      {/* SVG Logo */}
      <svg width="280" height="175" viewBox="0 0 280 175">
        <circle 
          cx="140" cy="64" r="38" 
          stroke={color} 
          strokeWidth="3" 
          fill={color} 
          fillOpacity="0.5" 
        />
        <line x1="42" y1="64" x2="102" y2="64" stroke="#111" strokeWidth="2.5"/>
        <line x1="178" y1="64" x2="238" y2="64" stroke="#111" strokeWidth="2.5"/>
        <line x1="140" y1="102" x2="140" y2="144" stroke="#111" strokeWidth="2.5"/>
        <polygon points="140,144 134,134 146,134" fill="#111"/>
      </svg>
    </div>
  );
}
```

---

## 3. SPICE Parameters (Hard-Coded)

### 3.1 Fixed Assumptions

**Store in `/src/data/spice-params.js`:**

```javascript
// SPICE_PARAMS.js
// These are SPICE's base case assumptions
// Update these values periodically based on latest data/analysis
// Last updated: 2026-03-16

export const SPICE_PARAMS = {
  // Current values (2026)
  current: {
    debt: 122,        // Debt/GDP % (from FRED live data)
    ai: 8,            // AI displacement % (estimate)
    crypto: 12,       // Crypto adoption % (estimate)
    unemployment: 3.8, // From FRED
    inflation: 3.2,   // From FRED
    yields: 4.32,     // 10Y Treasury from FRED
    gini: 0.49        // Gini coefficient (estimate)
  },
  
  // Projected trajectory (SPICE thesis)
  projection: {
    debt: [
      { year: 2026, value: 122 },
      { year: 2027, value: 135 },
      { year: 2028, value: 150 },
      { year: 2029, value: 175 },  // Crisis threshold
      { year: 2030, value: 195 },
      { year: 2031, value: 220 },
      { year: 2032, value: 245 }
    ],
    
    ai: [
      { year: 2026, value: 8 },
      { year: 2027, value: 12 },
      { year: 2028, value: 18 },
      { year: 2029, value: 25 },
      { year: 2030, value: 35 },   // McKinsey base case
      { year: 2031, value: 42 },
      { year: 2032, value: 48 }
    ],
    
    crypto: [
      { year: 2026, value: 12 },
      { year: 2027, value: 16 },
      { year: 2028, value: 22 },
      { year: 2029, value: 30 },
      { year: 2030, value: 40 },   // Crisis acceleration
      { year: 2031, value: 52 },
      { year: 2032, value: 60 }
    ],
    
    unemployment: [
      { year: 2026, value: 3.8 },
      { year: 2027, value: 5 },
      { year: 2028, value: 7 },
      { year: 2029, value: 10 },
      { year: 2030, value: 15 },
      { year: 2031, value: 18 },
      { year: 2032, value: 20 }
    ],
    
    inflation: [
      { year: 2026, value: 3.2 },
      { year: 2027, value: 4 },
      { year: 2028, value: 5.5 },
      { year: 2029, value: 8 },    // YCC begins
      { year: 2030, value: 12 },
      { year: 2031, value: 14 },
      { year: 2032, value: 10 }    // Post-crisis
    ],
    
    yields: [
      { year: 2026, value: 4.32 },
      { year: 2027, value: 5.2 },
      { year: 2028, value: 6.5 },
      { year: 2029, value: 7.8 },  // Spike before YCC
      { year: 2030, value: 4.5 },  // YCC caps at 4.5%
      { year: 2031, value: 4.5 },
      { year: 2032, value: 4.5 }
    ],
    
    gini: [
      { year: 2026, value: 0.49 },
      { year: 2027, value: 0.51 },
      { year: 2028, value: 0.54 },
      { year: 2029, value: 0.57 },
      { year: 2030, value: 0.60 },
      { year: 2031, value: 0.61 },
      { year: 2032, value: 0.62 }
    ]
  },
  
  // Crisis thresholds
  thresholds: {
    debt: 175,
    unemployment: 20,
    inflationHigh: 15,
    inflationLow: -7,
    yields: 10,
    yieldsModerate: 6.5,
    debtModerate: 150,
    cryptoFlight: 40,
    aiDisplacement: 35,
    gini: 0.60
  },
  
  // Policy assumptions
  policy: {
    fiscal: 'none',          // No fiscal adjustment
    monetary: 'none',        // Fed stays course until crisis
    crypto: 'tax'            // Tax & Regulate regime
  },
  
  // Metadata
  meta: {
    lastUpdated: '2026-03-16',
    crisisWindow: { start: 2029, end: 2032 },
    currentSPICELevel: 'ORANGE',
    sources: [
      'CBO Long-Term Budget Outlook',
      'McKinsey Global Institute - AI Impact',
      'Goldman Sachs - AI Displacement Forecast',
      'FRED - Current Economic Data'
    ]
  }
};
```

### 3.2 Calculate Current SPICE Level

**Create `/src/lib/spice-level.js`:**

```javascript
import { getCollisionStatus } from './sim-engine.js';

/**
 * Calculate current SPICE level based on current data
 */
export function calculateCurrentSPICELevel(currentData) {
  // Use existing sim-engine logic
  const status = getCollisionStatus(currentData, currentData.ai / 100);
  
  // Map to SPICE levels
  if (status === 'NO_CRISIS') {
    // Check if approaching thresholds
    if (currentData.debt > 140 || currentData.ai > 12) {
      return 'YELLOW';  // Elevated
    }
    return 'GREEN';  // Safe
  }
  
  if (status === 'CONVENTIONAL') {
    return 'ORANGE';  // High risk but not collision yet
  }
  
  if (status === 'COLLISION') {
    return 'RED';  // Crisis
  }
  
  return 'GREEN';
}

/**
 * Get first crisis year from projection
 */
export function getProjectedCrisisYear(projection, displaced) {
  for (let year = 2026; year <= 2035; year++) {
    const idx = year - 2026;
    
    // Get data for this year
    const debt = projection.debt[idx]?.value || 0;
    const unemp = projection.unemployment[idx]?.value || 0;
    const infl = projection.inflation[idx]?.value || 0;
    const crypto = projection.crypto[idx]?.value || 0;
    const ai = projection.ai[idx]?.value || 0;
    
    const yearData = { debt, unemp, infl, crypto, displaced: ai / 100 };
    const status = getCollisionStatus(yearData, ai / 100);
    
    if (status === 'COLLISION') {
      return year;
    }
  }
  
  return null;  // No crisis in projection window
}
```

---

## 4. Page Structure (Top to Bottom)

### 4.1 Hero Section

**Layout:**
```jsx
<div className="hero">
  <div className="container">
    {/* Logo Data Visualization - CENTERPIECE */}
    <SPICEDataLogo 
      debt={SPICE_PARAMS.current.debt}
      ai={SPICE_PARAMS.current.ai}
      crypto={SPICE_PARAMS.current.crypto}
      spiceLevel={currentSPICELevel}
    />
    
    <h1>THE COLLISION IS COMING</h1>
    
    <p className="hero-subtitle">
      We model the crisis where US sovereign debt meets AI-driven deflation 
      and crypto-enabled capital flight. Traditional hedges will fail. SPICE 
      provides exposure to assets that benefit from systemic breakdown.
    </p>
    
    <div className="hero-buttons">
      <a href="/portfolio" className="btn btn-primary">View Portfolio Allocation</a>
      <a href="/simulation" className="btn btn-secondary">Run Simulation</a>
    </div>
  </div>
</div>
```

**Styling:**
```css
.hero {
  text-align: center;
  padding: 80px 20px 60px;
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  color: #111;
  margin: 40px 0 16px;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 18px;
  color: #555;
  max-width: 800px;
  margin: 0 auto 40px;
  line-height: 1.7;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }
  .hero-subtitle {
    font-size: 16px;
  }
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}
```

### 4.2 SPICE Thesis Parameters

**Three cards showing fixed assumptions:**

```jsx
<div className="thesis-section">
  <div className="container">
    <div className="section-header">
      <h2>The SPICE Thesis</h2>
      <p>
        Our base case forecast combining government debt trajectory, AI adoption, 
        and crypto flight dynamics. These are fixed parameters representing SPICE's 
        view of the most likely path forward.
      </p>
    </div>
    
    <div className="thesis-grid">
      {/* Debt Card */}
      <div className="thesis-card">
        <div className="thesis-card-title">
          <span className="icon">📊</span>
          Government Debt Trajectory
        </div>
        <div className="thesis-metric">
          <div className="label">Current (2026)</div>
          <div className="value">{SPICE_PARAMS.current.debt}% debt/GDP</div>
        </div>
        <div className="thesis-metric">
          <div className="label">Crisis Threshold (2029)</div>
          <div className="value">175% debt/GDP</div>
        </div>
        <div className="thesis-metric">
          <div className="label">Assumption</div>
          <div className="value">No fiscal adjustment</div>
        </div>
        <div className="thesis-note">
          Based on CBO projections with no policy changes. Crisis occurs when 
          debt service exceeds tax revenue at market rates.
        </div>
      </div>
      
      {/* AI Card */}
      <div className="thesis-card">
        <div className="thesis-card-title">
          <span className="icon">🤖</span>
          AI Displacement Forecast
        </div>
        <div className="thesis-metric">
          <div className="label">Current (2026)</div>
          <div className="value">{SPICE_PARAMS.current.ai}% of jobs</div>
        </div>
        <div className="thesis-metric">
          <div className="label">Projected (2030)</div>
          <div className="value">35% of jobs</div>
        </div>
        <div className="thesis-metric">
          <div className="label">Source</div>
          <div className="value">McKinsey/Goldman base case</div>
        </div>
        <div className="thesis-note">
          Structural unemployment drives deflation in affected sectors while 
          creating wage pressure elsewhere. Fed cannot inflate away debt.
        </div>
      </div>
      
      {/* Crypto Card */}
      <div className="thesis-card">
        <div className="thesis-card-title">
          <span className="icon">₿</span>
          Crypto Flight Model
        </div>
        <div className="thesis-metric">
          <div className="label">Current (2026)</div>
          <div className="value">{SPICE_PARAMS.current.crypto}% adoption</div>
        </div>
        <div className="thesis-metric">
          <div className="label">Crisis Trigger</div>
          <div className="value">40%+ adoption</div>
        </div>
        <div className="thesis-metric">
          <div className="label">Policy Regime</div>
          <div className="value">Tax & Regulate</div>
        </div>
        <div className="thesis-note">
          Once crisis hits, citizens flee to crypto despite tax penalties. 
          Government cannot enforce capital controls on permissionless assets.
        </div>
      </div>
    </div>
  </div>
</div>
```

**Styling:**
```css
.thesis-section {
  padding: 60px 20px;
  background: #fafafa;
}

.thesis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.thesis-card {
  background: white;
  border: 2px solid #e2e2e2;
  border-radius: 8px;
  padding: 28px;
}

.thesis-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.thesis-metric {
  margin-bottom: 12px;
}

.thesis-metric .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.thesis-metric .value {
  font-size: 18px;
  font-weight: 600;
  color: #111;
}

.thesis-note {
  font-size: 11px;
  color: #999;
  font-style: italic;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
```

### 4.3 Key Indicators (6 Cards)

**Show current values + projections:**

```jsx
<div className="indicators-section">
  <div className="container">
    <div className="section-header">
      <h2>Key Indicators</h2>
      <p>
        Live data and SPICE projections across six critical metrics. 
        Each indicator tracks toward crisis thresholds.
      </p>
    </div>
    
    <div className="indicators-grid">
      {/* Debt */}
      <IndicatorCard
        name="Debt/GDP"
        current={SPICE_PARAMS.current.debt}
        unit="%"
        trend="up"
        status="yellow"
        statusText="Approaching threshold"
        projection={`Projected 2029: 175% (crisis threshold)`}
      />
      
      {/* ... 5 more indicator cards */}
    </div>
    
    <div style={{ textAlign: 'center', marginTop: '32px' }}>
      <a href="/indicators" className="btn btn-secondary">View Detailed Analysis</a>
    </div>
  </div>
</div>
```

**Indicator Card Component:**
```jsx
function IndicatorCard({ name, current, unit, trend, status, statusText, projection }) {
  const trendIcon = {
    up: '↗',
    down: '↘',
    flat: '→'
  }[trend];
  
  const statusColors = {
    green: { bg: '#d1fae5', text: '#065f46' },
    yellow: { bg: '#fef3c7', text: '#92400e' },
    orange: { bg: '#fed7aa', text: '#9a3412' },
    red: { bg: '#fecaca', text: '#991b1b' }
  };
  
  return (
    <div className="indicator-card">
      <div className="indicator-header">
        <div className="indicator-name">{name}</div>
        <div className="indicator-trend">{trendIcon}</div>
      </div>
      <div className="indicator-value">{current}{unit}</div>
      <div 
        className="indicator-status" 
        style={{ 
          background: statusColors[status].bg, 
          color: statusColors[status].text 
        }}
      >
        {statusText}
      </div>
      <div className="indicator-projection">{projection}</div>
    </div>
  );
}
```

### 4.4 Crisis Timeline

**Horizontal gradient bar showing progression:**

```jsx
<div className="timeline-section">
  <div className="container">
    <div className="section-header">
      <h2>Estimated Crisis Progression</h2>
      <p>Based on SPICE thesis parameters and current trajectory</p>
    </div>
    
    <div className="timeline-container">
      <div className="timeline-track">
        <div className="timeline-marker" style={{ left: '40%' }}>
          <div className="timeline-marker-label">← WE ARE HERE</div>
        </div>
      </div>
      
      <div className="timeline-phases">
        <div className="timeline-phase">
          <div className="phase-year">2026</div>
          <div className="phase-label">🟢 Safe</div>
        </div>
        <div className="timeline-phase">
          <div className="phase-year">2027-2028</div>
          <div className="phase-label">🟡 Elevated</div>
        </div>
        <div className="timeline-phase">
          <div className="phase-year">2029</div>
          <div className="phase-label">🟠 High Risk</div>
        </div>
        <div className="timeline-phase">
          <div className="phase-year">2029-2032</div>
          <div className="phase-label">🔴 Crisis Window</div>
        </div>
      </div>
      
      {/* Timeline sensitivity factors */}
      <div className="timeline-note">
        <strong>Timeline Sensitivity:</strong>
        <div className="timeline-factors">
          <div className="factor-group">
            <div className="factor-group-title">⚡ Accelerates if:</div>
            <div className="factor-item">Fiscal policy loosens further</div>
            <div className="factor-item">AI adoption faster than forecast</div>
            <div className="factor-item">Government bans crypto (drives flight)</div>
            <div className="factor-item">Geopolitical shock (war, pandemic)</div>
          </div>
          
          <div className="factor-group">
            <div className="factor-group-title">⏸️ Delays if:</div>
            <div className="factor-item">Fiscal consolidation enacted</div>
            <div className="factor-item">AI productivity offsets displacement</div>
            <div className="factor-item">Crypto adoption slower than expected</div>
            <div className="factor-item">Fed successfully manages transition</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Timeline styling:**
```css
.timeline-track {
  position: relative;
  height: 8px;
  background: linear-gradient(90deg, 
    #16a34a 0%, #16a34a 20%,
    #eab308 20%, #eab308 40%,
    #f97316 40%, #f97316 60%,
    #dc2626 60%, #dc2626 100%
  );
  border-radius: 4px;
  margin: 40px 0 60px;
}

.timeline-marker {
  position: absolute;
  top: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 4px solid #f97316;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.timeline-phases {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
```

### 4.5 Why SPICE (Problem/Solution)

**Two-column layout:**

```jsx
<div className="investment-section">
  <div className="container">
    <div className="section-header">
      <h2>Why SPICE?</h2>
      <p>Traditional hedges fail when the crisis IS the financial system</p>
    </div>
    
    <div className="problem-solution">
      <div className="problem-box">
        <div className="box-title">The Problem</div>
        <ul className="hedge-list">
          <li className="hedge-item">
            <span className="hedge-name">TIPS:</span> Counterparty risk if government can't pay
          </li>
          <li className="hedge-item">
            <span className="hedge-name">Gold ETFs:</span> Can you redeem for physical?
          </li>
          <li className="hedge-item">
            <span className="hedge-name">60/40 Portfolio:</span> Both crash together
          </li>
          <li className="hedge-item">
            <span className="hedge-name">Cash:</span> Inflates away at 10-15%/year
          </li>
          <li className="hedge-item">
            <span className="hedge-name">VIX/Puts:</span> Counterparty risk
          </li>
        </ul>
      </div>
      
      <div className="solution-box">
        <div className="box-title">The Solution</div>
        <ul className="hedge-list">
          <li className="hedge-item">
            <span className="hedge-name">Physical Gold:</span> No counterparty risk
          </li>
          <li className="hedge-item">
            <span className="hedge-name">Bitcoin:</span> Permissionless capital exit
          </li>
          <li className="hedge-item">
            <span className="hedge-name">Inelastic Commodities:</span> Demand persists
          </li>
          <li className="hedge-item">
            <span className="hedge-name">Sovereign Shorts:</span> Direct hedge
          </li>
          <li className="hedge-item">
            <span className="hedge-name">Volatility Instruments:</span> Rates vol
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

### 4.6 CTA Section

**Three big buttons:**

```jsx
<div className="cta-section">
  <div className="container">
    <h2>Explore SPICE Protocol</h2>
    <p>Deep dive into the thesis, test your own assumptions, or see the portfolio allocation</p>
    
    <div className="cta-buttons">
      <a href="/portfolio" className="cta-button">
        <div className="cta-button-title">📊 View Portfolio</div>
        <div className="cta-button-description">
          See how SPICE allocates across crisis levels from Green to Red
        </div>
      </a>
      
      <a href="/simulation" className="cta-button">
        <div className="cta-button-title">🎛️ Run Simulation</div>
        <div className="cta-button-description">
          Test your own assumptions with interactive controls and scenarios
        </div>
      </a>
      
      <a href="/methodology" className="cta-button">
        <div className="cta-button-title">📖 Read Methodology</div>
        <div className="cta-button-description">
          Full academic treatment of the thesis with citations and framework
        </div>
      </a>
    </div>
  </div>
</div>
```

---

## 5. Navigation Updates

### 5.1 Header

**Add static monochrome logo to header:**

```jsx
<div className="header">
  <div className="container">
    <div className="header-content">
      <div className="logo-area">
        {/* Static monochrome logo */}
        <svg width="70" height="44" viewBox="0 0 175 110">
          <circle cx="87.5" cy="40" r="24" stroke="#111" strokeWidth="2" fill="none"/>
          <line x1="26.5" y1="40" x2="63.5" y2="40" stroke="#111" strokeWidth="2"/>
          <line x1="111.5" y1="40" x2="148.5" y2="40" stroke="#111" strokeWidth="2"/>
          <line x1="87.5" y1="64" x2="87.5" y2="90" stroke="#111" strokeWidth="2"/>
          <polygon points="87.5,90 82.5,82 92.5,82" fill="#111"/>
        </svg>
        <div className="logo-text">SPICE Protocol</div>
      </div>
      
      <nav className="nav">
        <a href="/">Home</a>
        <a href="/simulation">Simulation</a>
        <a href="/portfolio">Portfolio</a>
        <a href="/indicators">Indicators</a>
        <a href="/methodology">Methodology</a>
      </nav>
    </div>
  </div>
</div>
```

### 5.2 Simulation Page Rename

**Update navigation to clarify:**
- **Home** = SPICE thesis (fixed parameters, our forecast)
- **Simulation** = User exploration (sliders, "what if")

---

## 6. Data Integration

### 6.1 Live Data (Future Enhancement)

**For initial version, use hard-coded values from SPICE_PARAMS**

**For future versions, integrate FRED API:**

```javascript
// /api/fred-current.js
export default async function handler(req, res) {
  const apiKey = process.env.FRED_API_KEY;
  
  // Fetch current debt/GDP
  const debtResponse = await fetch(
    `https://api.stlouisfed.org/fred/series/observations?series_id=GFDEGDQ188S&api_key=${apiKey}&limit=1&sort_order=desc&file_type=json`
  );
  
  // ... similar for other indicators
  
  res.json({
    debt: debtData.value,
    unemployment: unempData.value,
    inflation: inflData.value,
    yields: yieldsData.value
  });
}
```

### 6.2 Update Frequency

**Initial version:** Static values from SPICE_PARAMS  
**Future:** Pull live data on page load, cache for 1 hour

---

## 7. Files to Create/Modify

### 7.1 New Files

```
src/
  data/
    spice-params.js          # Fixed SPICE assumptions
  lib/
    spice-level.js           # Calculate current SPICE level
  components/
    SPICEDataLogo.jsx        # Logo data visualization
    IndicatorCard.jsx        # Key indicator cards
  pages/
    Home.jsx                 # New home page (replace existing)
public/
  logo-mono-light.svg        # Monochrome logo for header
  logo-mono-dark.svg         # Monochrome logo for dark bg
```

### 7.2 Modified Files

```
src/
  App.jsx                    # Update route for new Home
  pages/
    chart3-simulation.jsx    # Rename nav from "Collision" to "Simulation"
```

---

## 8. Implementation Phases

### Phase 1: Core Structure (2-3 hours)
- [ ] Create SPICE_PARAMS.js with all data
- [ ] Create SPICEDataLogo component
- [ ] Build hero section with logo viz
- [ ] Add thesis parameter cards (3 cards)
- [ ] Basic styling

### Phase 2: Indicators & Timeline (2 hours)
- [ ] Create IndicatorCard component
- [ ] Build 6 indicator cards
- [ ] Add crisis timeline section
- [ ] Timeline styling with gradient

### Phase 3: Investment Thesis & CTA (1 hour)
- [ ] Problem/Solution two-column layout
- [ ] CTA section with 3 buttons
- [ ] Polish styling

### Phase 4: Testing & Polish (1 hour)
- [ ] Mobile responsive
- [ ] Cross-browser testing
- [ ] Logo color accuracy
- [ ] Data value formatting

**Total: 6-7 hours**

---

## 9. Success Criteria

✅ Logo data viz shows current debt/AI/crypto with colored circle  
✅ Circle color matches current SPICE level (ORANGE)  
✅ Three thesis cards explain fixed assumptions  
✅ Six indicator cards show current + projected values  
✅ Timeline shows 2026 (now) → 2029-2032 (crisis window)  
✅ Problem/Solution clearly presented  
✅ CTAs prominently displayed  
✅ Mobile responsive  
✅ Static monochrome logo in header  

---

## 10. Testing Checklist

- [ ] Logo renders correctly (filled circle, 50% opacity)
- [ ] Data labels positioned correctly (left/right/bottom)
- [ ] Circle color changes based on SPICE level
- [ ] Thesis cards show correct values from SPICE_PARAMS
- [ ] Indicator cards show status badges correctly
- [ ] Timeline gradient renders smoothly
- [ ] "WE ARE HERE" marker at correct position
- [ ] Problem/Solution boxes side by side (desktop)
- [ ] CTA buttons all link correctly
- [ ] Mobile: Logo stacks properly
- [ ] Mobile: Thesis cards stack vertically
- [ ] Mobile: Indicator cards stack vertically
- [ ] Mobile: Timeline shows 2×2 grid
- [ ] Mobile: Problem/Solution stack vertically
- [ ] Header logo (monochrome) shows correctly

---

**END OF REQUIREMENTS**

---

## Quick Start for Claude Code

**What to build:**
New home page with:
1. Logo as data viz (debt/AI/crypto with colored circle)
2. SPICE thesis (3 cards with fixed assumptions)
3. 6 indicator cards (current + projected)
4. Crisis timeline (2026-2032)
5. Why SPICE (problem/solution)
6. CTA section (3 buttons)

**Key files:**
- `src/data/spice-params.js` - All assumptions
- `src/components/SPICEDataLogo.jsx` - Logo viz
- `src/pages/Home.jsx` - Main page

**Priority:** HIGH  
**Difficulty:** MEDIUM  
**Time:** 6-7 hours  
**Impact:** CRITICAL (clarifies product positioning)
