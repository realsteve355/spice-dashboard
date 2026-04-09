# Crisis Scenarios Page Redesign - Requirements Document

**Project:** SPICE Dashboard - Crisis Scenarios Page  
**Feature:** Contextual Crisis Analysis with Government Response Paths & Personal Impact Scenarios  
**Target Implementation:** Claude Code  
**Date:** 2026-03-15  
**Priority:** HIGH

---

## 1. Executive Summary

**Problem:**
Current Crisis page (`/crisis-scenarios`) shows abstract crisis types with no connection to user's simulation. Users don't understand what "The Collision" means for their personal situation or what actually happens in markets.

**Solution:**
Redesigned page that:
1. **Pulls crisis data from simulation** via URL parameters
2. **Shows concrete market impacts** (bond yields, unemployment, inflation specifics)
3. **Presents 4 government response paths** based on regime type × crypto policy
4. **Displays personal impact scenarios** for 9 different personas (country × profession)
5. **Provides interactive timeline** showing crisis progression for selected path

**User flow:**
```
Simulation page → Collision occurs → "Explore Crisis Scenarios" button
  ↓
Crisis page loads with URL params (debt=178, year=2029, crypto=38, etc.)
  ↓
Shows banner with THEIR crisis data
  ↓
User selects government response path (4 options)
  ↓
Timeline updates to show that path's progression
  ↓
User selects persona (Engineer in China, Lawyer in USA, etc.)
  ↓
Expandable card shows year-by-year impact for that person
```

---

## 2. URL Parameters (Passed from Simulation)

### 2.1 Required Parameters

```javascript
const params = new URLSearchParams({
  // Crisis identification
  collisionYear: 2029,           // Year collision occurred
  crisisType: 3,                 // 1=Fast Collapse, 2=Slow Decline, 3=Chaotic
  collisionStatus: 'COLLISION',  // 'COLLISION' | 'CONVENTIONAL' | 'NO_CRISIS'
  
  // Economic metrics at collision
  debt: 178,                     // Debt/GDP % at collision
  unemp: 12,                     // Unemployment % at collision
  infl: 8.2,                     // Inflation % at collision
  yields: 7.8,                   // Bond yields % at collision
  crypto: 38,                    // Crypto flight % at collision
  gini: 0.58,                    // Gini coefficient at collision
  ai: 42,                        // AI displacement % (from params, not year data)
  
  // Policy settings that led to crisis
  fiscalPolicy: 'none',          // User's fiscal policy choice
  monetaryPolicy: 'none',        // User's monetary policy choice
  cryptoPolicy: 'tax'            // User's crypto policy choice
});

window.location.href = `/crisis?${params}`;
```

### 2.2 Fallback Behavior

**If no URL params (user navigates directly to /crisis):**
- Show educational version of page
- No crisis banner (generic intro instead)
- All 4 government paths shown equally (no "your scenario" highlighting)
- Personal scenarios shown as examples (not "you")
- Note at top: "Run simulation first to see personalized crisis analysis"

---

## 3. Page Structure (Top to Bottom)

### 3.1 Crisis Banner (if params present)

**Visual:** Red gradient background, prominent warning icon

**Content:**
```jsx
<div className="crisis-banner">
  {/* Header */}
  <div className="banner-header">
    <div className="icon">⚠️</div>
    <div className="title-group">
      <h1>THE COLLISION — {collisionYear}</h1>
      <div className="subtitle">
        Crisis triggered when debt crossed 175% with {ai}% AI displacement 
        and {crypto}% crypto flight
      </div>
    </div>
  </div>
  
  {/* Metrics Grid - 6 cards */}
  <div className="metrics-grid">
    <MetricCard label="Debt/GDP" value={`${debt}%`} color="red" />
    <MetricCard label="Unemployment" value={`${unemp}%`} color="red" />
    <MetricCard label="Inflation" value={`${infl}%`} color="orange" />
    <MetricCard label="Bond Yields" value={`${yields}%`} color="orange" />
    <MetricCard label="Crypto Flight" value={`${crypto}%`} color="red" />
    <MetricCard label="Gini Coeff" value={gini} color="red" />
  </div>
</div>
```

**Styling:**
- Background: `linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)`
- Border: `3px solid #dc2626`, left border `8px solid #dc2626`
- Padding: `32px`
- Max width: `1200px`
- Margin bottom: `32px`

**Metrics grid:**
- `display: grid`
- `grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))`
- Gap: `12px`

**Each metric card:**
- White background
- Border: `1px solid #fca5a5`
- Border radius: `6px`
- Padding: `10px 14px`
- Label: `11px`, uppercase, `#666`
- Value: `18px`, bold, `#dc2626`

---

### 3.2 Crisis Type Identification Card

**Content:**
```jsx
<div className="crisis-type-card">
  <div className="type-header">
    <div className="badge">TYPE {crisisType}</div>
    <div className="title">{getTypeName(crisisType)}</div>
  </div>
  
  <div className="description">
    Your scenario most closely resembles <strong>Type {crisisType}: 
    {getTypeName(crisisType)}</strong>. {getTypeExplanation(crisisType, ai, crypto)}
  </div>
</div>

function getTypeName(type) {
  const names = {
    1: 'Fast Collapse',
    2: 'Slow Decline',
    3: 'Chaotic Transition (AI-Accelerated)'
  };
  return names[type] || 'Unknown';
}

function getTypeExplanation(type, ai, crypto) {
  if (type === 3) {
    return `AI displacement (${ai}%) prevents inflating away debt; crypto flight 
    (${crypto}%) prevents trapping capital. Multiple policy attempts with partial 
    effectiveness. Timeline compressed from 15-50 years (historical) to 5-10 years 
    by digital-era dynamics.`;
  }
  // ... similar for types 1 and 2
}
```

**Styling:**
- Background: `#fef2f2`
- Border: `2px solid #dc2626`
- Border radius: `8px`
- Padding: `24px`
- Margin bottom: `32px`

**Badge:**
- Background: `#dc2626`
- Color: `white`
- Padding: `6px 12px`
- Border radius: `4px`
- Font size: `11px`, bold, uppercase

---

### 3.3 Government Response Path Selection

**4 Buttons - 2×2 Grid on Desktop, Stacked on Mobile**

**Paths:**
1. **🇺🇸 Democratic Capitulation**
2. **🇨🇳 CBDC Iron Fist**
3. **🇬🇧 Muddle Through**
4. **🇦🇪 Crypto Hub Strategy**

**Content:**
```jsx
<div className="policy-choice-section">
  <div className="section-header">Government Response Strategy</div>
  <div className="section-description">
    Select a government response path to see how it affects the crisis timeline 
    and personal outcomes. In reality, governments may attempt multiple strategies 
    or be forced into specific paths by political constraints.
  </div>
  
  <div className="policy-buttons">
    {paths.map(path => (
      <button 
        key={path.id}
        className={`policy-btn ${selectedPath === path.id ? 'active' : ''}`}
        onClick={() => setSelectedPath(path.id)}
      >
        <div className="btn-icon">{path.icon}</div>
        <div className="btn-title">{path.title}</div>
        <div className="btn-description">{path.description}</div>
        <div className="btn-tags">
          <span className="tag">{path.countries}</span>
          <span className="tag">{path.likelihood}</span>
        </div>
      </button>
    ))}
  </div>
</div>

const paths = [
  {
    id: 'democratic',
    icon: '🇺🇸',
    title: 'Democratic Capitulation',
    description: 'Opposition parties promise crypto freedom, win elections. Gradual legal tender adoption. Least painful transition but requires democratic process.',
    countries: 'USA, Canada, Australia',
    likelihood: 'Most likely (democracy)',
    timeline: [
      { year: collisionYear, phase: 'Onset', title: 'Crisis Triggers', description: 'Debt crosses 175%, unemployment hits 12% from AI displacement. Fed deploys Yield Curve Control (YCC) capping rates at 4.5%. Bond purchases begin. Crypto adoption 38%.' },
      { year: collisionYear + 1, phase: 'Acute', title: 'Cascade Intensifies', description: 'YCC drives inflation to 14% while AI sectors deflate. Crypto flight surges to 52%. Gini hits 0.61. Mid-term elections: opposition campaigns on "crypto freedom" platform.' },
      { year: collisionYear + 3, phase: 'Political', title: 'Policy Shift', description: 'New administration gradually legalizes Bitcoin as legal tender. Tax regime shifts from ban to regulate. Capital controls abandoned as politically unviable. Debt 220% GDP.' },
      { year: collisionYear + 5, phase: 'Resolution', title: 'New Equilibrium', description: 'Bitcoin/USD dual standard emerges. Real debt burden inflated away via monetary expansion. AI productivity gains begin offsetting displacement. New social contract.' }
    ]
  },
  {
    id: 'authoritarian',
    icon: '🇨🇳',
    title: 'CBDC Iron Fist',
    description: 'Emergency powers declared. Bitcoin criminalized, CBDC mandatory for all transactions. Capital controls prevent offshore movement. Total surveillance state.',
    countries: 'China, Russia, Iran',
    likelihood: 'Possible (crisis powers)',
    timeline: [
      { year: collisionYear, phase: 'Onset', title: 'Crisis Triggers', description: 'Debt crosses 175%, unemployment hits 12%. Emergency powers declared. CBDC rollout accelerated.' },
      { year: collisionYear + 1, phase: 'Crackdown', title: 'Total Ban Enforcement', description: 'Bitcoin criminalized with 10-year prison sentences. Self-custody banned. All crypto exchanges shut down. CBDC becomes mandatory for wages, rent, transactions.' },
      { year: collisionYear + 2, phase: 'Resistance', title: 'Black Markets Emerge', description: 'Underground crypto economy persists. Capital flight to neighboring countries. Brain drain as tech workers emigrate. Surveillance expanded.' },
      { year: collisionYear + 4, phase: 'Bifurcation', title: 'Digital Iron Curtain', description: 'World bifurcates into CBDC bloc vs crypto-permissive bloc. Trade barriers. Parallel financial systems. Cold War 2.0.' }
    ]
  },
  {
    id: 'muddle',
    icon: '🇬🇧',
    title: 'Muddle Through',
    description: 'Tax crypto heavily, restrict self-custody, require KYC for all transactions. Slow capital flight continues. Decade+ decline. No clear resolution.',
    countries: 'UK, EU, Japan',
    likelihood: 'Possible (risk averse)',
    timeline: [
      { year: collisionYear, phase: 'Onset', title: 'Crisis Triggers', description: 'Debt crosses 175%, unemployment hits 12%. Government deploys traditional tools: QE, mild austerity, crypto taxes.' },
      { year: collisionYear + 2, phase: 'Erosion', title: 'Gradual Decline Begins', description: 'Crypto taxed at 70% on gains. Self-custody wallets banned. KYC required for all transactions. Black markets flourish. Capital flight 5% per year.' },
      { year: collisionYear + 5, phase: 'Stagnation', title: 'Lost Decade', description: 'Real wages down 20%. Unemployment 15%. Inflation 6%. Crypto adoption plateaus at 40% (black market). No resolution in sight.' },
      { year: collisionYear + 10, phase: 'Collapse', title: 'Delayed Reckoning', description: 'Debt reaches 280% GDP. System finally breaks. Forced into crisis resolution (default or hyperinflation). Everyone lost wealth slowly.' }
    ]
  },
  {
    id: 'hub',
    icon: '🇦🇪',
    title: 'Crypto Hub Strategy',
    description: 'Small, nimble country welcomes crypto, attracts fleeing capital. Becomes regional financial hub. Bitcoin as settlement layer. Regional winner.',
    countries: 'UAE, Singapore, El Salvador',
    likelihood: 'Possible (small countries)',
    timeline: [
      { year: collisionYear, phase: 'Onset', title: 'Crisis Creates Opportunity', description: 'As US debt crisis unfolds, small countries see chance to attract capital. Dubai, Singapore announce "crypto safe haven" policies.' },
      { year: collisionYear + 1, phase: 'Capital Flight', title: 'Hub Magnetism', description: '$2 trillion flows from West to crypto-permissive hubs. Tech workers, crypto founders, capital relocate. Real estate booms in Dubai, Singapore.' },
      { year: collisionYear + 3, phase: 'Regional', title: 'New Financial Centers', description: 'UAE-Singapore corridor becomes crypto settlement hub. Regional currencies peg to Bitcoin. BRICS+ countries route trade through hubs to avoid dollar.' },
      { year: collisionYear + 5, phase: 'Multipolar', title: 'Fragmented World', description: 'No single reserve currency. Regional blocs with Bitcoin settlement. Hub countries thrive. West relatively poorer. Deglobalization complete.' }
    ]
  }
];
```

**Styling:**
- Background: `#fffbeb`
- Border: `2px solid #eab308`
- Border radius: `8px`
- Padding: `24px`
- Margin bottom: `32px`

**Policy buttons grid:**
- `display: grid`
- `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`
- Gap: `12px`

**Each button:**
- Background: `white`
- Border: `2px solid #d1d5db`
- Border radius: `6px`
- Padding: `16px`
- Cursor: `pointer`
- Text align: `left`
- Transition: `all 0.2s`

**Active state:**
- Border color: `#eab308`
- Background: `#fefce8`
- Box shadow: `0 2px 12px rgba(234, 179, 8, 0.3)`

**Hover state:**
- Border color: `#eab308`
- Box shadow: `0 2px 8px rgba(234, 179, 8, 0.2)`

---

### 3.4 Horizontal Crisis Timeline

**Shows 4 phases for selected government path**

**Content:**
```jsx
<div className="timeline-section">
  <div className="timeline-header">
    Crisis Timeline: {paths.find(p => p.id === selectedPath).title}
  </div>
  <div className="timeline-subheader">
    Showing {paths.find(p => p.id === selectedPath).timeline.length}-phase 
    progression for this government response strategy
  </div>
  
  {/* Horizontal gradient track */}
  <div className="timeline-track-container">
    <div className="timeline-track"></div>
  </div>
  
  {/* 4 phase cards below track */}
  <div className="timeline-phases">
    {paths.find(p => p.id === selectedPath).timeline.map((phase, idx) => (
      <div key={idx} className="timeline-phase">
        <div className="phase-year">{phase.year} — {phase.phase}</div>
        <div className="phase-title">{phase.title}</div>
        <div className="phase-description">{phase.description}</div>
      </div>
    ))}
  </div>
</div>
```

**Styling:**

**Timeline track:**
- Height: `6px`
- Background: `linear-gradient(90deg, #dc2626 0%, #dc2626 30%, #ea580c 30%, #ea580c 70%, #eab308 70%, #eab308 100%)`
- Border radius: `3px`
- Margin: `0 60px 40px 60px`

**Timeline phases grid:**
- `display: grid`
- `grid-template-columns: repeat(4, 1fr)`
- Gap: `20px`

**Each phase card:**
- Background: `white`
- Border: `2px solid #e2e2e2`
- Border radius: `8px`
- Padding: `20px 16px`
- Position: `relative`

**Phase dot (connects to track above):**
```css
.timeline-phase:before {
  content: '';
  position: absolute;
  top: -42px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 4px solid #dc2626;
}

.timeline-phase:nth-child(2):before { border-color: #ea580c; }
.timeline-phase:nth-child(3):before { border-color: #ea580c; }
.timeline-phase:nth-child(4):before { border-color: #eab308; }
```

**Hover effect:**
```css
.timeline-phase:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}
```

**Responsive (mobile):**
```css
@media (max-width: 1024px) {
  .timeline-phases {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .timeline-phases {
    grid-template-columns: 1fr;
  }
  .timeline-track-container {
    display: none; /* Hide horizontal track on mobile */
  }
  .timeline-phase:before {
    left: -20px;
    top: 20px;
  }
}
```

---

### 3.5 Personal Impact Scenarios

**9 Personas in 3×3 Grid (Country × Profession)**

**Personas:**

| | **USA** | **UK** | **China** |
|---|---|---|---|
| **Tech Worker** | Software Engineer in SF | Data Scientist in London | AI Engineer in Shenzhen |
| **Professional** | Lawyer in NYC | Doctor in Manchester | Professor in Beijing |
| **Blue Collar** | Delivery Driver in Ohio | Retail Worker in Birmingham | Factory Worker in Guangzhou |

**Additional personas:**
- **Retiree in Florida (USA)** - Fixed income
- **Student in Tokyo (Japan)** - Debt, no assets
- **Small Business Owner in Dubai (UAE)** - Crypto-friendly hub

**Content:**
```jsx
<div className="impact-section">
  <div className="section-header">What This Means For You</div>
  <div className="section-description">
    Select a persona to see year-by-year impact of the crisis and government 
    response path. These scenarios are illustrative based on typical situations 
    for each profile.
  </div>
  
  {/* Persona selector - 3x3 grid */}
  <div className="persona-grid">
    {personas.map(persona => (
      <button
        key={persona.id}
        className={`persona-btn ${selectedPersona === persona.id ? 'active' : ''}`}
        onClick={() => setSelectedPersona(persona.id)}
      >
        <div className="persona-flag">{persona.flag}</div>
        <div className="persona-title">{persona.title}</div>
        <div className="persona-location">{persona.location}</div>
      </button>
    ))}
  </div>
  
  {/* Expandable scenario card */}
  {selectedPersona && (
    <div className="scenario-card">
      <div className="scenario-header">
        <span className="scenario-flag">{getPersona(selectedPersona).flag}</span>
        <span className="scenario-title">
          {getPersona(selectedPersona).title} in {getPersona(selectedPersona).location}
        </span>
      </div>
      
      {/* Starting situation */}
      <div className="scenario-section">
        <div className="scenario-year">Starting Position (2028)</div>
        <div className="scenario-content">
          {getPersona(selectedPersona).starting}
        </div>
      </div>
      
      {/* Year-by-year progression based on selected government path */}
      {getPersona(selectedPersona).timeline[selectedPath].map((year, idx) => (
        <div key={idx} className="scenario-section">
          <div className="scenario-year">{year.year}</div>
          <div className="scenario-content">{year.content}</div>
        </div>
      ))}
    </div>
  )}
</div>

const personas = [
  {
    id: 'sf-engineer',
    flag: '🇺🇸',
    title: 'Software Engineer',
    location: 'San Francisco',
    starting: `Age 32, $180k salary at tech company, $320k in stocks/RSUs, $50k 
    in Bitcoin (bought at $90k in 2027), rents $3,500/month apartment, $45k student 
    loans, no dependents.`,
    timeline: {
      democratic: [
        {
          year: collisionYear,
          content: `Tech stocks crash 40% ($320k → $190k). Bitcoin spikes to $400k 
          (nominal gain, but unclear if "real"). Rent stable at $3,500 but groceries 
          +15%. Salary still $180k but worried about AI displacement of junior devs.`
        },
        {
          year: collisionYear + 1,
          content: `Inflation 14%, salary raised to $200k but real purchasing power = 
          $130k (2026 dollars). Bitcoin now $800k nominal - cashed out 50% to buy house 
          downpayment. Company offers "BTC or USD?" salary option. 30% of team laid off 
          (AI tools doing junior work).`
        },
        {
          year: collisionYear + 3,
          content: `New government legalizes Bitcoin as legal tender. Can pay rent, taxes 
          in BTC directly. Bought house for $900k (50% down in BTC, 50% mortgage). Tech 
          stocks recovering. Salary $220k, real = $160k. Kept job - senior enough that 
          AI augments rather than replaces.`
        },
        {
          year: collisionYear + 5,
          content: `Crisis moderating. Dual BTC/USD economy normalized. Home worth $1.1M. 
          Remaining Bitcoin worth $600k. Net worth $1.5M despite crisis. Winner: held 
          crypto early, had skills AI couldn't replace, bought real assets during chaos.`
        }
      ],
      authoritarian: [
        {
          year: collisionYear,
          content: `Tech stocks crash 40%. Bitcoin $400k nominal but rumors of ban 
          coming. Rent $3,500, groceries +15%. Salary $180k.`
        },
        {
          year: collisionYear + 1,
          content: `BITCOIN CRIMINALIZED. Must sell or face 10 years prison. Forced to 
          sell $800k BTC for $200k (price crashed after ban announcement). Lost 75% 
          of crypto wealth. CBDC account mandatory - every purchase tracked. Salary 
          $200k but tracked spending.`
        },
        {
          year: collisionYear + 2,
          content: `Tech company offers to relocate to Singapore office - considering 
          leaving US. Many colleagues already left. Can't move more than $50k/year 
          offshore (capital controls). Feels trapped. Inflation still 10%.`
        },
        {
          year: collisionYear + 4,
          content: `Stayed in US. CBDC system normalized but dystopian - government sees 
          every transaction, can freeze account. Net worth $400k (stocks recovered somewhat). 
          Loser: crypto confiscated, freedom lost, wealth destroyed.`
        }
      ],
      muddle: [
        {
          year: collisionYear,
          content: `Tech stocks crash 40%. Bitcoin $400k but government announces 70% 
          capital gains tax on crypto. Considering selling but tax would destroy gains.`
        },
        {
          year: collisionYear + 2,
          content: `Self-custody wallets banned. Must move BTC to regulated exchange 
          (KYC required). Bitcoin $600k but can't sell without 70% tax. Feels trapped. 
          Salary $200k, real = $140k. Inflation 8%.`
        },
        {
          year: collisionYear + 5,
          content: `Bitcoin black market thriving but risky. Capital slowly leaving UK 
          for Dubai/Singapore. Tech sector shrinking. Salary $210k, real = $120k. 
          Inflation 6% ongoing. Bitcoin $500k but still can't sell.`
        },
        {
          year: collisionYear + 10,
          content: `Lost decade. Real wages down 30%. Bitcoin worth $800k but 70% tax 
          still in effect. Net worth stagnant. Brain drain - best engineers left for 
          crypto-friendly countries. Loser: slow wealth destruction, no escape.`
        }
      ],
      hub: [
        /* Similar structure for hub path */
      ]
    }
  },
  {
    id: 'london-doctor',
    flag: '🇬🇧',
    title: 'Doctor',
    location: 'London',
    starting: `Age 45, £95k NHS salary, £180k in pension, £60k savings, owns £400k 
    flat (£180k mortgage remaining), married with 2 kids, no crypto.`,
    timeline: {
      democratic: [/* year-by-year for democratic path */],
      authoritarian: [/* year-by-year for authoritarian path */],
      muddle: [
        {
          year: collisionYear,
          content: `NHS pension value drops 25% (bonds crash). Savings losing 8% real 
          purchasing power to inflation. Flat value stable at £400k. Salary £95k but 
          real purchasing power down. No crypto exposure - missed escape route.`
        },
        {
          year: collisionYear + 2,
          content: `Inflation 10%, salary raised to £105k but real = £85k (2026 pounds). 
          Groceries +25%, NHS cuts mean working longer hours for less real pay. Pension 
          value still down 20%. Considered buying Bitcoin but 70% tax made it pointless.`
        },
        {
          year: collisionYear + 5,
          content: `Real salary down 20% over 5 years. Pension will provide 40% less 
          than expected. Kids' university costs up 40%. Forced to delay retirement by 
          5 years. Flat worth £450k but purchasing power unclear with inflation.`
        },
        {
          year: collisionYear + 10,
          content: `Lost decade confirmed. Real income down 30%. Pension crisis - may 
          get 50% of expected payout. Healthcare system strained from cuts. Can't afford 
          retirement. Loser: no escape route, public sector, fixed income.`
        }
      ],
      hub: [/* year-by-year for hub path */]
    }
  },
  {
    id: 'ohio-driver',
    flag: '🇺🇸',
    title: 'Delivery Driver',
    location: 'Ohio',
    starting: `Age 38, $52k/year driving for logistics company, $8k savings, rents 
    $1,200/month house, married with 1 kid, no stocks, no crypto, high school education.`,
    timeline: {
      democratic: [
        {
          year: collisionYear,
          content: `Job at risk - company testing autonomous delivery trucks. Rent 
          still $1,200 but groceries +20%. Savings $8k earning 0.5% while inflation 8%. 
          No stocks, no crypto - no assets to preserve wealth.`
        },
        {
          year: collisionYear + 1,
          content: `LAID OFF - autonomous trucks deployed at scale. Unemployment $420/week 
          (replaces 40% of income, not 100%). Savings depleted in 4 months paying rent 
          ($1,500 now, up 25%). Can't find equivalent work - AI displaced 25% of logistics 
          jobs. Wife working two part-time jobs.`
        },
        {
          year: collisionYear + 2,
          content: `Unemployment expired. Took gig work at $15/hour (was making $25/hour 
          equivalent before). Real income: $52k → $18k (job loss + inflation). Rent 
          $1,600. Medical insurance lost - using ER for care. Kid's school struggling 
          with cuts.`
        },
        {
          year: collisionYear + 5,
          content: `Crisis moderating but damage done. Bitcoin legal tender but don't own 
          any. Still making $20/hour gig work. Real income permanently 60% lower. Moved 
          to cheaper apartment. Loser: no assets, structural unemployment, no hedge.`
        }
      ],
      authoritarian: [/* Similar but with CBDC surveillance adding insult to injury */],
      muddle: [/* Similar but slower grind */],
      hub: [/* Not relevant - can't afford to relocate to Dubai */]
    }
  },
  {
    id: 'shenzhen-engineer',
    flag: '🇨🇳',
    title: 'AI Engineer',
    location: 'Shenzhen',
    starting: `Age 29, ¥600k salary ($85k USD) at tech company, ¥800k in stocks, 
    ¥200k in Bitcoin (bought secretly via VPN), rents ¥8,000/month, single, no debt.`,
    timeline: {
      democratic: [/* Shows what happens if China doesn't crack down - unlikely */],
      authoritarian: [
        {
          year: collisionYear,
          content: `US crisis creates opportunity for China. Company stocks stable 
          (Chinese tech insulated). Bitcoin ¥1.2M but illegal - kept in self-custody 
          wallet. Rent ¥8,000, salary ¥600k. Government announces "digital yuan only" 
          policy coming.`
        },
        {
          year: collisionYear + 1,
          content: `BITCOIN ILLEGAL - 10 year prison for possession. Forced to abandon 
          ¥1.2M in wallet (can't sell without arrest). Digital yuan CBDC mandatory. Every 
          purchase tracked. Salary ¥650k but all in digital yuan. Lost entire crypto wealth.`
        },
        {
          year: collisionYear + 2,
          content: `CBDC system normalized. Social credit tied to spending. Can't buy 
          plane tickets if spend "too much" on luxury. AI work thriving (China winning 
          AI race while US in crisis). Salary ¥750k. Considering emigration to Singapore 
          but capital controls allow max ¥200k/year transfer.`
        },
        {
          year: collisionYear + 4,
          content: `Digital iron curtain established. Can't access Western financial 
          system. China-Russia-Iran CBDC bloc vs West. High salary (¥900k) but no freedom. 
          Lost: crypto wealth, privacy, freedom to emigrate. Gained: stable job in winning 
          geopolitical bloc.`
        }
      ],
      muddle: [/* Shows if China takes moderate path - very unlikely */],
      hub: [
        {
          year: collisionYear,
          content: `Watching US crisis unfold. Considering relocation to Singapore. 
          Bitcoin ¥1.2M but illegal in China. Salary ¥600k. Reached out to Singapore 
          companies.`
        },
        {
          year: collisionYear + 1,
          content: `RELOCATED to Singapore on tech visa. Moved ¥200k legally (max allowed), 
          snuck out ¥1.2M Bitcoin via self-custody wallet. Singapore welcomes crypto. 
          New salary SGD 180k ($135k USD). Rent SGD 4,000.`
        },
        {
          year: collisionYear + 3,
          content: `Singapore thriving as crypto hub. Bitcoin worth SGD 800k now. Real 
          estate up 40%. Salary SGD 220k. Gained permanent residency. China colleagues 
          jealous - they're stuck in CBDC surveillance.`
        },
        {
          year: collisionYear + 5,
          content: `Winner: escaped China CBDC crackdown, preserved Bitcoin wealth, 
          Singapore hub status means high salary + low taxes + freedom. Net worth SGD 
          1.2M. Made right choice to emigrate early.`
        }
      ]
    }
  },
  {
    id: 'florida-retiree',
    flag: '🇺🇸',
    title: 'Retiree',
    location: 'Florida',
    starting: `Age 68, retired, $1.2M portfolio (60% stocks, 40% bonds), withdrawing 
    $60k/year (5% rule), Social Security $32k/year, owns home outright, married, 
    no crypto, healthcare via Medicare.`,
    timeline: {
      democratic: [
        {
          year: collisionYear,
          content: `Portfolio crashes: stocks down 40%, bonds down 30% (yields spiked). 
          Value: $1.2M → $780k. Can only safely withdraw $39k/year now (5% rule). Social 
          Security COLA lags inflation by 18 months. Real income: $92k → $60k. Own home 
          (no rent) but property taxes up 30%.`
        },
        {
          year: collisionYear + 1,
          content: `Inflation 14% eating savings. Healthcare costs up 25% (Medicare cuts 
          due to debt crisis). Portfolio recovering slowly ($850k). Real income $55k. 
          Delaying travel plans, cutting expenses. No crypto - missed escape route.`
        },
        {
          year: collisionYear + 3,
          content: `Portfolio $950k (stocks recovered, bonds still weak). Bitcoin legal 
          tender but don't own any. Real income $65k (2026 dollars) - 30% wealth destruction. 
          May need to work part-time if portfolio doesn't fully recover.`
        },
        {
          year: collisionYear + 5,
          content: `Crisis moderating. Portfolio $1.1M. Survived but poorer. Real income 
          $70k - permanently 24% worse off. Healthcare costs still elevated. Loser: fixed 
          income, no hedge, wealth gap widened.`
        }
      ],
      authoritarian: [/* Even worse - CBDC controls spending categories */],
      muddle: [/* Slow grind - run out of money by age 78 */],
      hub: [/* Not relevant - too old to relocate */]
    }
  }
  // ... more personas
];
```

**Persona grid styling:**
- `display: grid`
- `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- Gap: `12px`
- Margin bottom: `24px`

**Persona button:**
- Background: `white`
- Border: `2px solid #e2e2e2`
- Border radius: `6px`
- Padding: `16px`
- Cursor: `pointer`
- Text align: `center`

**Active state:**
- Border color: `#dc2626`
- Background: `#fef2f2`

**Scenario card:**
- Background: `white`
- Border: `2px solid #dc2626`
- Border radius: `8px`
- Padding: `24px`
- Margin top: `24px`

**Scenario sections:**
- Each year gets its own section
- Year label: `11px`, bold, color varies (red → orange → yellow)
- Content: `13px`, line height `1.7`
- Padding between sections: `16px`

---

### 3.6 Market Mechanics Explainer (Optional Accordion)

**For sophisticated users who want to understand bond market mechanics**

**Content:**
```jsx
<div className="mechanics-section">
  <button 
    className="mechanics-toggle"
    onClick={() => setShowMechanics(!showMechanics)}
  >
    <span>Understanding Bond Market Mechanics</span>
    <span>{showMechanics ? '▼' : '▶'}</span>
  </button>
  
  {showMechanics && (
    <div className="mechanics-content">
      <h4>What "Bond Market Meltdown" Actually Means</h4>
      
      <div className="mechanics-subsection">
        <h5>Normal Times (Pre-Crisis)</h5>
        <ul>
          <li>US 10-year Treasury yields 4.5%</li>
          <li>Considered "risk-free rate" - safest asset on Earth</li>
          <li>Foreign holders: China $1T, Japan $1.1T</li>
          <li>Fed balance sheet: $8 trillion</li>
        </ul>
      </div>
      
      <div className="mechanics-subsection">
        <h5>Crisis Begins ({collisionYear})</h5>
        <ul>
          <li><strong>Yields spike to {yields}%</strong> - bond prices crash (inverse relationship)</li>
          <li><strong>Foreign holders dump</strong> - China/Japan sell $400B+ in 3 months</li>
          <li><strong>Death spiral:</strong> Higher yields → Higher debt service costs → Larger deficit → More issuance → Even higher yields</li>
          <li><strong>Math breaks:</strong> At {yields}% on $35T debt = ${(35 * yields / 100).toFixed(1)}T/year in interest vs $1.2T tax revenue</li>
          <li>Government literally cannot afford market rates</li>
        </ul>
      </div>
      
      <div className="mechanics-subsection">
        <h5>Fed Response: Yield Curve Control (YCC)</h5>
        <ul>
          <li>"We will buy unlimited Treasuries to keep yields at 4.5%"</li>
          <li>Printing money to buy bonds no one else wants</li>
          <li>Fed balance sheet: $8T → $15T → $25T</li>
          <li><strong>Result:</strong> Inflation (money printing) + Recession (unemployment)</li>
        </ul>
      </div>
      
      <div className="mechanics-subsection">
        <h5>Why Traditional Hedges Fail</h5>
        <ul>
          <li><strong>TIPS?</strong> Counterparty risk - can government pay inflation adjustments?</li>
          <li><strong>Gold ETFs?</strong> Counterparty risk - can you redeem for physical during crisis?</li>
          <li><strong>Stocks?</strong> Earnings collapse from recession + inflation destroys multiples</li>
          <li><strong>Cash?</strong> Inflating at 14%/year</li>
          <li><strong>What works:</strong> Physical gold, physical Bitcoin (actual custody, not ETF/exchange)</li>
        </ul>
      </div>
    </div>
  )}
</div>
```

---

### 3.7 Crisis Types Reference (Bottom of Page)

**Moved to bottom - educational context**

**Same 3 cards as before:**
- Type 1: Fast Collapse
- Type 2: Slow Decline  
- Type 3: Chaotic Transition

**With "active" highlighting on user's type**

---

## 4. State Management

### 4.1 React State

```javascript
const [selectedPath, setSelectedPath] = useState('democratic');
const [selectedPersona, setSelectedPersona] = useState(null);
const [showMechanics, setShowMechanics] = useState(false);

// Read URL params on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setCollisionYear(parseInt(params.get('collisionYear')) || null);
  setDebt(parseFloat(params.get('debt')) || null);
  // ... etc for all params
}, []);
```

### 4.2 URL Param Defaults

**If param missing:**
- `collisionYear`: null (show educational version)
- `crisisType`: 3 (default to Chaotic)
- `debt`, `unemp`, etc.: null (hide metrics grid)

---

## 5. Responsive Design

### 5.1 Breakpoints

```css
/* Desktop: 1400px+ */
.timeline-phases { grid-template-columns: repeat(4, 1fr); }
.policy-buttons { grid-template-columns: repeat(2, 1fr); }
.persona-grid { grid-template-columns: repeat(3, 1fr); }

/* Tablet: 768px - 1400px */
@media (max-width: 1400px) {
  .timeline-phases { grid-template-columns: repeat(2, 1fr); }
  .persona-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile: <768px */
@media (max-width: 768px) {
  .timeline-phases { grid-template-columns: 1fr; }
  .policy-buttons { grid-template-columns: 1fr; }
  .persona-grid { grid-template-columns: 1fr; }
  .crisis-metrics { grid-template-columns: 1fr 1fr; }
  
  .timeline-track-container { display: none; }
  .timeline-phase:before {
    left: -20px;
    top: 20px;
  }
}
```

---

## 6. Implementation Checklist

### Phase 1: Structure & Data
- [ ] Create `/crisis` route component
- [ ] Read URL parameters on mount
- [ ] Define `paths` array with 4 government responses + timelines
- [ ] Define `personas` array with 9+ personas + year-by-year scenarios
- [ ] Create fallback for no params (educational version)

### Phase 2: Crisis Banner
- [ ] Crisis banner component with gradient background
- [ ] 6 metric cards in responsive grid
- [ ] Show/hide based on param presence
- [ ] Mobile responsive (2 columns)

### Phase 3: Crisis Type Card
- [ ] Type identification card
- [ ] Dynamic text based on `crisisType` param
- [ ] AI/crypto explanation with specific percentages

### Phase 4: Policy Path Selection
- [ ] 4 clickable policy buttons in grid
- [ ] Active state styling
- [ ] onClick updates `selectedPath` state
- [ ] Mobile responsive (stack vertically)

### Phase 5: Horizontal Timeline
- [ ] Gradient track with 4 colored segments
- [ ] 4 phase cards below track
- [ ] Dots connecting cards to track
- [ ] Update timeline when `selectedPath` changes
- [ ] Mobile: hide track, show vertical layout

### Phase 6: Personal Scenarios
- [ ] Persona selection grid
- [ ] Active state on selected persona
- [ ] Expandable scenario card
- [ ] Year-by-year sections
- [ ] Timeline updates based on `selectedPath`

### Phase 7: Market Mechanics
- [ ] Accordion toggle button
- [ ] Expandable content with subsections
- [ ] Dynamic values from URL params

### Phase 8: Crisis Types Reference
- [ ] 3 type cards at bottom
- [ ] Highlight active type
- [ ] Hover effects

### Phase 9: Testing
- [ ] Test with collision params from simulation
- [ ] Test without params (educational version)
- [ ] Test all 4 government paths
- [ ] Test all personas across all paths
- [ ] Test mobile responsive
- [ ] Test cross-browser

---

## 7. Example Data Structures

### 7.1 Government Path Object

```javascript
{
  id: 'democratic',
  icon: '🇺🇸',
  title: 'Democratic Capitulation',
  description: 'Opposition wins elections on crypto freedom platform...',
  countries: 'USA, Canada, Australia',
  likelihood: 'Most likely (democracy)',
  duration: '5-7 years',
  outcome: 'Dual BTC/USD standard',
  winner: 'Crypto holders, tech workers',
  loser: 'Fixed-income retirees, cash holders',
  timeline: [
    {
      year: collisionYear,
      phase: 'Onset',
      title: 'Crisis Triggers',
      description: '...'
    },
    // ... 3 more phases
  ]
}
```

### 7.2 Persona Object

```javascript
{
  id: 'sf-engineer',
  flag: '🇺🇸',
  title: 'Software Engineer',
  location: 'San Francisco',
  age: 32,
  income: 180000,
  assets: {
    stocks: 320000,
    bitcoin: 50000,
    savings: 20000
  },
  debts: {
    student: 45000
  },
  starting: 'Age 32, $180k salary...',
  timeline: {
    democratic: [
      { year: 2029, content: '...' },
      { year: 2030, content: '...' },
      { year: 2032, content: '...' },
      { year: 2034, content: '...' }
    ],
    authoritarian: [...],
    muddle: [...],
    hub: [...]
  }
}
```

---

## 8. Success Criteria

**Feature successful if:**

1. ✅ URL params correctly populate crisis banner
2. ✅ All 4 government paths selectable
3. ✅ Timeline updates when path selected
4. ✅ All personas selectable
5. ✅ Scenario card updates based on persona + path
6. ✅ Mobile responsive (all sections)
7. ✅ Works without URL params (educational mode)
8. ✅ Cross-browser compatible
9. ✅ Crisis type correctly highlighted
10. ✅ Market mechanics accordion functional

---

## 9. Future Enhancements

### 9.1 AI-Generated Scenarios

**Instead of hardcoded persona timelines:**
- Call `/api/crisis-scenario` with params
- Generate personalized scenario on-the-fly
- Cache results in localStorage

### 9.2 Share Scenario

**Button to share specific combination:**
```javascript
const shareUrl = `${window.location.origin}/crisis?${params}&path=${selectedPath}&persona=${selectedPersona}`;
navigator.clipboard.writeText(shareUrl);
```

### 9.3 Download Report

**Export selected scenario as PDF:**
- Crisis banner data
- Selected path timeline
- Selected persona year-by-year

### 9.4 Compare Paths

**Side-by-side comparison:**
- Show 2 paths simultaneously
- Highlight differences
- Show same persona across both

---

## 10. Files to Create/Modify

**New files:**
- `src/pages/Crisis.jsx` - Main crisis page component
- `src/components/CrisisBanner.jsx` - Crisis data banner
- `src/components/PolicyPath.jsx` - Government path selection
- `src/components/CrisisTimeline.jsx` - Horizontal timeline
- `src/components/PersonaScenario.jsx` - Personal impact scenarios
- `src/data/crisis-paths.js` - Government response path data
- `src/data/personas.js` - Persona definitions + timelines

**Modified files:**
- `src/pages/chart3-simulation.jsx` - Add "Explore Crisis" button with params
- `src/App.jsx` or router - Add `/crisis` route

---

## 11. Priority & Timeline

**Priority:** HIGH (core feature for understanding crisis impact)  
**Difficulty:** HIGH (complex data structures, many scenarios)  
**Time estimate:** 8-12 hours  
**Dependencies:** None (standalone page)

**Phased rollout:**
1. **Phase 1 (4 hours):** Structure + banner + policy paths + timeline
2. **Phase 2 (4 hours):** Personal scenarios (start with 3 personas)
3. **Phase 3 (2 hours):** Add remaining personas
4. **Phase 4 (2 hours):** Market mechanics + polish + testing

---

**END OF REQUIREMENTS**

---

## Quick Reference for Claude Code

**What to build:**
Redesigned Crisis Scenarios page that shows:
1. Crisis data from simulation (via URL params)
2. 4 government response paths (selectable)
3. Horizontal timeline for selected path
4. 9 personal impact scenarios (country × profession)
5. Year-by-year progression based on path + persona

**Key components:**
- CrisisBanner (shows collision year + metrics)
- PolicyPathSelector (4 buttons: Democratic/Authoritarian/Muddle/Hub)
- HorizontalTimeline (4 phases with gradient track)
- PersonaSelector (3×3 grid of personas)
- ScenarioCard (expandable year-by-year impact)

**Data flow:**
Simulation page → URL params → Crisis page → User selects path + persona → Shows timeline + scenario

**Priority:** HIGH  
**Difficulty:** HIGH (complex data structures)  
**Time:** 8-12 hours  
**Impact:** CRITICAL (helps users understand what crisis actually means)
