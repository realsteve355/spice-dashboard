# Methodology Page Upgrade Requirements

**Project:** SPICE Dashboard  
**Feature:** Methodology Page Enhancement - Add Theoretical Foundation & Navigation  
**Target Implementation:** Claude Code  
**Date:** 2026-03-12

---

## 1. Overview

The current methodology page (`/spice-methodology.html`) is excellent on technical modeling but lacks the historical/theoretical foundation that connects the SPICE thesis to Ray Dalio's reserve currency framework and explains why AI/crypto are structural wildcards.

This upgrade adds:
1. **Interactive Table of Contents** - sticky sidebar/collapsible navigation
2. **Part 0: Theoretical Foundation** - new section establishing Dalio framework + AI/crypto wildcards
3. **Updated navigation** - seamless integration with existing content

---

## 2. Table of Contents Implementation

### 2.1 Placement & Structure

**Location:** Insert immediately after page title, before "Overview" section

**HTML Structure:**
```html
<!-- TABLE OF CONTENTS -->
<nav id="toc" class="toc-container">
  <div class="toc-header">
    <h3>Contents</h3>
    <button class="toc-toggle" aria-label="Toggle contents">☰</button>
  </div>
  
  <div class="toc-content">
    <div class="toc-section">
      <a href="#overview" class="toc-link">Overview</a>
      <ul class="toc-subsection">
        <li><a href="#thesis" class="toc-sublink">The Core Thesis</a></li>
        <li><a href="#scope" class="toc-sublink">Model Scope & Limitations</a></li>
      </ul>
    </div>

    <div class="toc-section toc-new">
      <a href="#part0" class="toc-link">Part 0 — Theoretical Foundation</a>
      <span class="toc-badge">NEW</span>
      <ul class="toc-subsection">
        <li><a href="#dalio-cycle" class="toc-sublink">Dalio's Reserve Currency Cycle</a></li>
        <li><a href="#crisis-typology" class="toc-sublink">Historical Crisis Typology</a></li>
        <li><a href="#ai-wildcard" class="toc-sublink">The AI Wildcard</a></li>
        <li><a href="#crypto-wildcard" class="toc-sublink">The Crypto Wildcard</a></li>
        <li><a href="#timeline-compression" class="toc-sublink">Timeline Compression</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#ch1" class="toc-link">Part I — Debt</a>
      <ul class="toc-subsection">
        <li><a href="#ch1-starting" class="toc-sublink">US Fiscal Trajectory</a></li>
        <li><a href="#ch1-dynamics" class="toc-sublink">Debt Dynamics Formula</a></li>
        <li><a href="#ch1-rg" class="toc-sublink">r > g: The Break Condition</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#ch2" class="toc-link">Part II — AI</a>
      <ul class="toc-subsection">
        <li><a href="#ch2-anchors" class="toc-sublink">Scenario Anchors</a></li>
        <li><a href="#ch2-prod" class="toc-sublink">Productivity Dynamics</a></li>
        <li><a href="#ch2-lag" class="toc-sublink">Displacement Lag</a></li>
        <li><a href="#ch2-ghost" class="toc-sublink">Ghost GDP</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#ch3" class="toc-link">Part III — Collision</a>
      <ul class="toc-subsection">
        <li><a href="#ch3-fiscal" class="toc-sublink">Fiscal Channel</a></li>
        <li><a href="#ch3-yield" class="toc-sublink">Yield Dynamics</a></li>
        <li><a href="#ch3-break" class="toc-sublink">Break Point Logic</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#ch4" class="toc-link">Part IV — Responses</a>
      <ul class="toc-subsection">
        <li><a href="#ch4-fiscal" class="toc-sublink">Fiscal Options</a></li>
        <li><a href="#ch4-monetary" class="toc-sublink">Monetary Options</a></li>
        <li><a href="#ch4-combination" class="toc-sublink">Combinations</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#ch5" class="toc-link">Part V — K-Shaped Economy</a>
      <ul class="toc-subsection">
        <li><a href="#ch5-shares" class="toc-sublink">Income Shares</a></li>
        <li><a href="#ch5-policy" class="toc-sublink">Policy Effects</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#ch6" class="toc-link">Part VI — SPICE</a>
      <ul class="toc-subsection">
        <li><a href="#ch6-monetary-stress" class="toc-sublink">Monetary Stress Index</a></li>
        <li><a href="#ch6-rationale" class="toc-sublink">Hedge Rationale</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#ch7" class="toc-link">Crypto Flight Dynamics</a>
      <ul class="toc-subsection">
        <li><a href="#ch7-mechanism" class="toc-sublink">Flight Mechanism</a></li>
        <li><a href="#ch7-loops" class="toc-sublink">Four Feedback Loops</a></li>
        <li><a href="#ch7-policy" class="toc-sublink">Policy Regimes</a></li>
        <li><a href="#ch7-threshold" class="toc-sublink">Non-Monotonic Threshold</a></li>
        <li><a href="#ch7-btc" class="toc-sublink">Bitcoin Price Model</a></li>
      </ul>
    </div>

    <div class="toc-section">
      <a href="#appendix" class="toc-link">Appendix</a>
      <ul class="toc-subsection">
        <li><a href="#assumptions" class="toc-sublink">Key Assumptions</a></li>
        <li><a href="#sensitivity" class="toc-sublink">Sensitivity Analysis</a></li>
        <li><a href="#citations" class="toc-sublink">All Citations</a></li>
      </ul>
    </div>
  </div>
</nav>
```

### 2.2 CSS Styling

```css
/* ========================================
   TABLE OF CONTENTS
   ======================================== */

.toc-container {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 30px 0 40px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.toc-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.toc-toggle {
  display: none; /* Hidden on desktop, shown on mobile */
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.toc-content {
  padding: 16px 24px 24px 24px;
}

.toc-section {
  margin-bottom: 16px;
  position: relative;
}

.toc-section.toc-new .toc-link {
  font-weight: 600;
  color: #2563eb; /* Blue to highlight new section */
}

.toc-badge {
  display: inline-block;
  background: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
}

.toc-link {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  text-decoration: none;
  padding: 6px 0;
  transition: color 0.2s;
}

.toc-link:hover {
  color: #2563eb;
}

.toc-link.active {
  color: #2563eb;
  font-weight: 600;
}

.toc-subsection {
  list-style: none;
  padding-left: 20px;
  margin: 4px 0 0 0;
}

.toc-sublink {
  display: block;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  padding: 4px 0;
  transition: color 0.2s;
}

.toc-sublink:hover {
  color: #2563eb;
}

.toc-sublink.active {
  color: #2563eb;
  font-weight: 500;
}

/* Desktop: Sticky Sidebar Layout */
@media (min-width: 1200px) {
  .methodology-page {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .toc-container {
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    margin: 0;
  }

  .main-content {
    min-width: 0; /* Prevent grid blowout */
  }
}

/* Tablet: Inline TOC */
@media (min-width: 768px) and (max-width: 1199px) {
  .toc-container {
    max-width: 800px;
    margin: 30px auto 40px auto;
  }
}

/* Mobile: Collapsible TOC */
@media (max-width: 767px) {
  .toc-toggle {
    display: block;
  }

  .toc-content {
    max-height: 0;
    overflow: hidden;
    padding: 0 24px;
    transition: max-height 0.3s ease, padding 0.3s ease;
  }

  .toc-container.expanded .toc-content {
    max-height: 1000px;
    padding: 16px 24px 24px 24px;
  }

  .toc-subsection {
    padding-left: 16px;
  }
}

/* Smooth Scroll Behavior */
html {
  scroll-behavior: smooth;
}

/* Active Section Highlighting (via JavaScript) */
.toc-link.active::before {
  content: "";
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #2563eb;
  border-radius: 2px;
}
```

### 2.3 JavaScript Functionality

```javascript
// Table of Contents Functionality
document.addEventListener('DOMContentLoaded', function() {
  
  // Mobile toggle
  const tocToggle = document.querySelector('.toc-toggle');
  const tocContainer = document.querySelector('.toc-container');
  
  if (tocToggle) {
    tocToggle.addEventListener('click', function() {
      tocContainer.classList.toggle('expanded');
    });
  }

  // Active section highlighting on scroll
  const tocLinks = document.querySelectorAll('.toc-link, .toc-sublink');
  const sections = document.querySelectorAll('section[id], div[id]');
  
  function updateActiveLink() {
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.pageYOffset >= sectionTop - 100) {
        currentSection = section.getAttribute('id');
      }
    });
    
    tocLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      
      if (href === currentSection) {
        link.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink(); // Initial call
  
  // Smooth scroll with offset for sticky header
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 20;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Close mobile TOC after click
        if (window.innerWidth < 768) {
          tocContainer.classList.remove('expanded');
        }
      }
    });
  });
});
```

---

## 3. Part 0: Theoretical Foundation Content

### 3.1 Placement

**Insert after "Overview" section, before "Part I — Debt"**

Add this anchor/section wrapper:
```html
<section id="part0" class="methodology-part">
  <h2>Part 0 — Theoretical Foundation</h2>
  <!-- Content below -->
</section>
```

### 3.2 Section 0.1: Dalio's Reserve Currency Cycle

```html
<div id="dalio-cycle" class="methodology-subsection">
  <h3>0.1 Dalio's Reserve Currency Cycle</h3>

  <p>
    The SPICE thesis builds on Ray Dalio's historical framework from 
    <em>Principles for Dealing with the Changing World Order</em>, which 
    analyzed 500 years of reserve currency transitions. Dalio studied the 
    rise and fall of the Dutch Guilder (1600s–1780s), British Pound 
    (1815–1971), and the ongoing US Dollar cycle (1944–present), identifying 
    a consistent four-phase pattern that every reserve currency has followed.
  </p>

  <div class="cycle-diagram">
    <h4>The Four Phases of Reserve Currency Cycles</h4>
    
    <div class="phase-box">
      <strong>Phase 1: Rise (Strong Fundamentals)</strong>
      <ul>
        <li>Sound money, creditor nation status</li>
        <li>Innovation, productivity gains, competitive advantage</li>
        <li>Low debt-to-GDP, balanced budgets</li>
        <li>Rising global influence</li>
      </ul>
      <em>Historical examples: Dutch Republic 1600–1650, US 1945–1970</em>
    </div>

    <div class="phase-box">
      <strong>Phase 2: Peak (Bubble Period)</strong>
      <ul>
        <li>Reserve currency status enables printing without immediate consequences</li>
        <li>Debt accumulates (military overextension, entitlement expansion)</li>
        <li>Wealth gaps widen, internal conflict rises</li>
        <li>Overconfidence in perpetual dominance</li>
      </ul>
      <em>Historical examples: British Empire 1870s, US 1980s–2000s</em>
    </div>

    <div class="phase-box">
      <strong>Phase 3: Decline (Structural Deterioration)</strong>
      <ul>
        <li>Debt-to-GDP exceeds 100–150%</li>
        <li>Lost competitiveness to rising rivals</li>
        <li>Money printing to cover deficits (fiscal dominance)</li>
        <li>Political dysfunction, inability to self-correct</li>
        <li>External challengers emerge</li>
      </ul>
      <em>Historical examples: Britain 1914–1945, US 2008–present</em>
    </div>

    <div class="phase-box">
      <strong>Phase 4: Collapse/Transition (Crisis & Reset)</strong>
      <ul>
        <li>Debt crisis forces choice: default or currency debasement</li>
        <li>Reserve status lost to successor or multipolar fragmentation</li>
        <li>Hard assets preserve wealth; financial assets destroyed</li>
        <li>Timeline: 5–50 years depending on transition pattern</li>
      </ul>
      <em>Historical examples: Dutch Guilder 1780–1795, British Pound 1931–1971</em>
    </div>
  </div>

  <p>
    <strong>Dalio's Key Insight:</strong> Every reserve currency eventually fails. 
    The only variables are the timeline and severity of the transition. Managed 
    transitions (British Pound to US Dollar, 1944 Bretton Woods) take decades with 
    external coordination. Chaotic transitions (Dutch Guilder collapse after 1780) 
    happen in years with no willing successor ready to absorb capital flight.
  </p>

  <p>
    The US dollar is currently in <strong>Phase 3: Decline</strong>. Debt-to-GDP 
    has exceeded 120%, rivals (China, BRICS coalition) are challenging dollar 
    dominance, and fiscal deficits are structural rather than cyclical. The 
    simulation models what happens when this decline phase meets the AI and crypto 
    wildcards—forces absent from all prior reserve currency collapses.
  </p>

  <p class="citation-note">
    <sup>[24]</sup> Dalio, R. (2021). <em>Principles for Dealing with the Changing World Order: 
    Why Nations Succeed and Fail.</em> Avid Reader Press. Historical analysis of 
    Dutch, British, and US reserve currency cycles spanning 1600–present.
  </p>
</div>
```

### 3.3 Section 0.2: Historical Crisis Typology

```html
<div id="crisis-typology" class="methodology-subsection">
  <h3>0.2 Historical Crisis Typology</h3>

  <p>
    Reserve currency collapses do not follow a single pattern. Historical analysis 
    reveals three distinct crisis types, each with different triggers, timelines, 
    and outcomes. Understanding which type the US dollar transition might follow 
    is critical to estimating both the timeline and severity of the collision.
  </p>

  <table class="crisis-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Example</th>
        <th>Duration</th>
        <th>Trigger</th>
        <th>Outcome</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Type 1: Fast Collapse</strong></td>
        <td>Weimar (1923)<br>Argentina (2001)<br>Asian Crisis (1997)</td>
        <td>10 months<br>2 years<br>18 months</td>
        <td>External shock (occupation)<br>Bank run, capital flight<br>Currency peg breaks</td>
        <td>Currency replacement<br>Default, devaluation<br>IMF restructuring</td>
      </tr>
      <tr>
        <td><strong>Type 2: Slow Decline</strong></td>
        <td>British Pound (1914–1971)</td>
        <td>57 years</td>
        <td>WWI debt spiral</td>
        <td>Managed transition to dollar</td>
      </tr>
      <tr>
        <td><strong>Type 3: Chaotic Transition</strong></td>
        <td>Dutch Guilder (1780–1795)<br>Soviet Ruble (1989–1998)</td>
        <td>15 years<br>9 years</td>
        <td>Military defeat<br>Political collapse</td>
        <td>Pound becomes reserve<br>Dollar adoption</td>
      </tr>
    </tbody>
  </table>

  <h4>Pattern Recognition Indicators</h4>

  <div class="pattern-box">
    <strong>Type 1 (Fast Collapse) Triggers:</strong>
    <ul>
      <li>Fixed exchange rate breaks under speculative attack</li>
      <li>External military or economic shock</li>
      <li>Bank runs, immediate capital flight</li>
      <li>Small/medium economy (can collapse quickly)</li>
    </ul>
  </div>

  <div class="pattern-box">
    <strong>Type 2 (Slow Decline) Enablers:</strong>
    <ul>
      <li>External manager coordinates transition (e.g., US managed British decline)</li>
      <li>Floating exchange rate allows gradual devaluation</li>
      <li>Large economy with deep bond markets</li>
      <li>Cooperative handoff to willing successor</li>
    </ul>
  </div>

  <div class="pattern-box">
    <strong>Type 3 (Chaotic Transition) Characteristics:</strong>
    <ul>
      <li>No external manager available to coordinate</li>
      <li>Multiple false stabilization attempts</li>
      <li>Political revolution or regime change</li>
      <li>War or major geopolitical rupture</li>
    </ul>
  </div>

  <p>
    <strong>Which Pattern for the US Dollar?</strong> The US exhibits characteristics 
    of both Type 2 and Type 3. Like Britain's slow decline, the US has deep bond 
    markets, a floating currency, and global reserve status that delays the breaking 
    point. However, unlike Britain, there is <strong>no willing external manager</strong>—
    China is not prepared to absorb dollar reserve functions, Europe is structurally 
    weak, and no Bretton Woods-style cooperative framework exists.
  </p>

  <p>
    The simulation models a <strong>compressed Type 3 pattern</strong>: chaotic transition 
    over 5–8 years rather than Britain's 50+ year managed decline. The compression is 
    driven by AI and crypto wildcards, which fundamentally alter the dynamics of 
    historical patterns.
  </p>

  <p class="citation-note">
    <sup>[1]</sup> Reinhart, C.M. & Rogoff, K.S. (2010). <em>Growth in a Time of Debt.</em> 
    NBER Working Paper 15639. Foundational analysis of debt thresholds and sovereign 
    crisis patterns across 200 years of data.
  </p>
</div>
```

### 3.4 Section 0.3: The AI Wildcard

```html
<div id="ai-wildcard" class="methodology-subsection">
  <h3>0.3 The AI Wildcard: Deflation Meets Inflation</h3>

  <p>
    Historical reserve currency collapses faced <strong>either</strong> inflation 
    (Weimar, Argentina) <strong>or</strong> deflation (Japan 1990s). They never 
    faced both simultaneously. Artificial intelligence creates an unprecedented 
    collision: governments need inflation to erode debt burdens, but AI produces 
    structural deflation precisely when that inflation is most needed.
  </p>

  <div class="collision-diagram">
    <div class="collision-left">
      <h4>Government Needs Inflation</h4>
      <ul>
        <li>Debt-to-GDP >150% requires real debt erosion</li>
        <li>Social programs need funding (entitlements, safety nets)</li>
        <li>Political pressure demands spending, not austerity</li>
        <li><strong>Traditional solution:</strong> Print money, accept 5–8% inflation, 
            debt-to-GDP gradually falls as nominal GDP rises faster than debt stock</li>
      </ul>
    </div>

    <div class="collision-arrow">⚡</div>

    <div class="collision-right">
      <h4>AI Produces Deflation</h4>
      <ul>
        <li>Productivity boom lowers goods/services costs</li>
        <li>Labor displacement reduces wage pressure</li>
        <li>Automation eliminates pricing power</li>
        <li><strong>AI delivers:</strong> Falling prices across the economy, 
            productivity gains that don't translate to measured GDP growth</li>
      </ul>
    </div>

    <div class="collision-result">
      <h4>The Collision Result</h4>
      <p>
        Government prints money → <strong>Asset inflation</strong> (stocks, real estate soar)<br>
        AI produces goods → <strong>Consumer deflation</strong> (goods, services cheaper)<br>
        <strong>K-Shaped Economy:</strong> Wealth gap explodes. Middle class crushed 
        (assets unaffordable, wages stagnant). Political legitimacy crisis.
      </p>
    </div>
  </div>

  <h4>Why This Is Different From Historical Precedents</h4>

  <table class="comparison-table">
    <thead>
      <tr>
        <th>Historical Crises</th>
        <th>AI Era Crisis (SPICE Thesis)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Industrial Revolution: <strong>Inflationary</strong> (urbanization, 
            infrastructure, new demand created faster than supply)</td>
        <td>AI Revolution: <strong>Deflationary</strong> (replaces labor, lowers 
            costs, reduces aggregate demand as workers displaced)</td>
      </tr>
      <tr>
        <td>1990s Tech Boom: Mildly deflationary, limited to manufactured goods. 
            Services sector (60% of economy) unaffected.</td>
        <td>2020s AI: Deflationary across <strong>entire economy</strong>—goods, 
            services, and cognitive labor all automated simultaneously</td>
      </tr>
      <tr>
        <td>Government could inflate away debt using standard playbook: print money, 
            generate 5–8% inflation, debt-to-GDP falls over 10–15 years</td>
        <td>Government tries to inflate but <strong>AI fights back</strong>: 
            productivity gains produce deflation faster than monetary expansion 
            produces inflation. Playbook broken.</td>
      </tr>
    </tbody>
  </table>

  <p>
    The IMF estimates AI could boost productivity 0.5–1.5% annually in exposed 
    sectors,<sup>[9]</sup> while McKinsey's high-adoption scenario models 25% of 
    tasks automatable by 2030.<sup>[18]</sup> The SPICE simulation explores the 
    upper range of this distribution: what happens if agentic AI systems (2026–2028) 
    displace 40–60% of knowledge workers by 2035, producing sustained deflation 
    while government debt requires sustained inflation to stabilize.
  </p>

  <p class="key-insight">
    <strong>Key Insight:</strong> This is not a cyclical recession where stimulus 
    works. It is a structural collision where the traditional debt-reduction playbook 
    (inflate it away) no longer functions because technology is producing the opposite 
    force (deflation) at industrial scale.
  </p>
</div>
```

### 3.5 Section 0.4: The Crypto Wildcard

```html
<div id="crypto-wildcard" class="methodology-subsection">
  <h3>0.4 The Crypto Wildcard: Non-Sovereign Exit</h3>

  <p>
    In every historical reserve currency transition, capital fled <strong>from</strong> 
    one sovereign currency <strong>to</strong> another sovereign currency. The pattern 
    was consistent: find the next hegemon, move your wealth there.
  </p>

  <ul>
    <li><strong>1780s:</strong> Dutch Guilder → British Pound</li>
    <li><strong>1931:</strong> British Pound → US Dollar</li>
    <li><strong>1990s:</strong> Soviet Ruble → US Dollar</li>
  </ul>

  <p>
    Crypto fundamentally changes this dynamic. For the first time in monetary history, 
    capital can exit the sovereign system <strong>entirely</strong>—not fleeing to 
    "Currency B" but to Bitcoin, Ethereum, and stablecoins that exist outside any 
    government's control.
  </p>

  <h4>Four Ways Crypto Changes Reserve Currency Transitions</h4>

  <div class="crypto-change-box">
    <strong>1. Front-Running the Crisis</strong>
    <p>
      <em>Historical:</em> Capital flight happened <strong>after</strong> crisis 
      onset (too late for most citizens).<br>
      <em>Crypto Era:</em> Adoption rises <strong>during</strong> build-up phase. 
      People see the crisis coming and exit early.
    </p>
    <p class="example">
      Example: Weimar citizens in 1920 could not buy US dollars or gold easily. 
      Modern citizens buy Bitcoin in 2024 before crisis hits in 2029.
    </p>
  </div>

  <div class="crypto-change-box">
    <strong>2. No Captive Bond Market</strong>
    <p>
      <em>Historical:</em> Citizens <strong>had to</strong> hold domestic bonds 
      (no alternative, capital controls enforceable).<br>
      <em>Crypto Era:</em> Exit to Bitcoin possible. Government loses captive buyers.
    </p>
    <p class="example">
      Example: British citizens in 1950s were trapped in sterling bonds via financial 
      repression. Americans today can move savings to self-custodied Bitcoin, 
      beyond reach of negative real rates.
    </p>
  </div>

  <div class="crypto-change-box">
    <strong>3. Instant Capital Flight</strong>
    <p>
      <em>Historical:</em> Moving gold or foreign currency took weeks/months. 
      Required physical transport, bank cooperation, border crossings.<br>
      <em>Crypto Era:</em> Moving Bitcoin takes seconds. Borderless, permissionless, 
      self-custodied.
    </p>
    <p class="example">
      Example: Dutch wealth flight in 1780s required smuggling gold to London. 
      Modern capital flight is a Bitcoin transaction—10 minutes, unstoppable.
    </p>
  </div>

  <div class="crypto-change-box">
    <strong>4. No Clear Successor Required</strong>
    <p>
      <em>Historical:</em> Required a willing hegemon to absorb reserve functions 
      (US managed British decline via Bretton Woods).<br>
      <em>Crypto Era:</em> Multipolar fragmentation + crypto as settlement layer. 
      No single successor needed.
    </p>
    <p class="example">
      Example: When the pound declined, the dollar was ready. When the dollar 
      declines, China's yuan is non-convertible, Europe is weak. Bitcoin becomes 
      neutral settlement layer by default—not by design, but by absence of alternatives.
    </p>
  </div>

  <p>
    <strong>Empirical Evidence:</strong> Chainalysis consistently ranks Venezuela, 
    Ukraine, Russia, and Argentina among the highest per-capita crypto adoption 
    nations globally—every one experiencing acute fiat stress during their adoption 
    surge.<sup>[21]</sup> Turkey's lira crisis (2021–2022) drove crypto adoption 
    from 5% to 18% of the population in under 18 months. Nigeria's naira collapse 
    triggered similar flight despite aggressive CBN restrictions.
  </p>

  <p class="key-insight">
    <strong>Key Insight:</strong> Crypto is not a speculative tech bubble in the 
    SPICE thesis. It is the <strong>emergency exit</strong> from a failing monetary 
    system—the only credible alternative when sovereign currencies are being debased 
    and no trustworthy replacement hegemon exists. The simulation models what happens 
    when 25–70% of private capital executes this exit over a 5–7 year window.
  </p>
</div>
```

### 3.6 Section 0.5: Timeline Compression

```html
<div id="timeline-compression" class="methodology-subsection">
  <h3>0.5 Timeline Compression: Why Historical Patterns Run 3–6× Faster</h3>

  <p>
    The British Pound took 57 years to lose reserve status (1914–1971). The Dutch 
    Guilder collapsed over 15 years (1780–1795). The SPICE simulation models a 
    US dollar transition in 5–8 years (2029–2035). Why the dramatic compression?
  </p>

  <p>
    Two factors—AI-driven unemployment and digital capital flight—fundamentally 
    accelerate the timeline compared to historical precedents.
  </p>

  <h4>Compression Factor 1: AI Unemployment Creates Political Crisis Faster</h4>

  <p>
    Britain's 50+ year decline was politically manageable because the economy still 
    functioned. Workers remained employed. Living standards declined gradually 
    (the "British disease"), but the social contract held. This bought time for 
    orderly transition.
  </p>

  <p>
    AI displacement at 40–60% (SPICE scenarios) produces 12–20% unemployment within 
    3–5 years. At these levels, political systems destabilize rapidly. Historical 
    precedent: Weimar Germany (1930–33), Great Depression US (1930–33), Greek 
    youth unemployment crisis (2010–15). Mass unemployment does not produce 50 years 
    of patient managed decline—it produces regime change in under a decade.
  </p>

  <div class="timeline-comparison">
    <div class="timeline-historical">
      <strong>British Decline Timeline (1914–1971)</strong>
      <ul>
        <li>1914–1918: WWI debt explosion (Debt/GDP: 25% → 140%)</li>
        <li>1931: Forced off gold standard (first acute crisis)</li>
        <li>1945: Bretton Woods (dollar becomes co-reserve)</li>
        <li>1956: Suez Crisis (US forces devaluation)</li>
        <li>1967: Final devaluation, reserve status lost</li>
      </ul>
      <p><strong>57 years</strong> from debt crisis to full reserve loss</p>
      <p><em>Why so slow?</em> External manager (US) coordinated transition. 
         Employment remained stable. Gradual devaluation politically tolerable.</p>
    </div>

    <div class="timeline-spice">
      <strong>SPICE Projected Timeline (2029–2035)</strong>
      <ul>
        <li>2029–2030: Bond market crisis (yields >10%, Debt/GDP >175%)</li>
        <li>2030–2031: AI unemployment spike (12–15%), political crisis</li>
        <li>2031: Crypto adoption 60–70% (mass capital flight)</li>
        <li>2031–2033: Debt restructuring forced, currency regime change</li>
        <li>2033–2035: New equilibrium (multipolar + crypto settlement layer)</li>
      </ul>
      <p><strong>5–7 years</strong> from bond crisis to new regime</p>
      <p><em>Why so fast?</em> No external manager. Digital capital flight. 
         AI unemployment destabilizes politics. System cannot buy time.</p>
    </div>
  </div>

  <h4>Compression Factor 2: Digital Capital Flight Is Instant</h4>

  <table class="speed-table">
    <thead>
      <tr>
        <th>Era</th>
        <th>Capital Flight Mechanism</th>
        <th>Speed</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1780s (Dutch Guilder)</td>
        <td>Physical gold smuggled to London</td>
        <td>Weeks to months per shipment</td>
      </tr>
      <tr>
        <td>1930s (British Pound)</td>
        <td>Sterling converted to dollars via banks, gold physically shipped</td>
        <td>Days to weeks (telegraph era)</td>
      </tr>
      <tr>
        <td>1990s (Soviet Ruble)</td>
        <td>Wire transfers to offshore banks, suitcases of cash across borders</td>
        <td>Hours to days (early internet era)</td>
      </tr>
      <tr>
        <td>2020s (US Dollar → Crypto)</td>
        <td>Bitcoin transaction, self-custodied, borderless</td>
        <td><strong>10 minutes, unstoppable</strong></td>
      </tr>
    </tbody>
  </table>

  <p>
    When capital can exit in 10 minutes rather than 10 weeks, the government has 
    no time to implement capital controls, negotiate IMF support, or coordinate 
    international intervention. The crisis accelerates from "manageable stress" 
    to "systemic rupture" in months rather than years.
  </p>

  <p>
    <strong>Dalio's Estimate:</strong> Ray Dalio projects the US is "10–15 years 
    away from a significant restructuring" based on historical patterns.<sup>[24]</sup> 
    The SPICE simulation models the <strong>lower end of this range</strong> (5–8 years 
    acute transition) because AI and crypto compress timelines compared to the 
    pre-digital historical cases Dalio analyzed.
  </p>

  <p class="key-insight">
    <strong>Key Insight:</strong> This is not speculation. Historical reserve 
    currency transitions <em>always</em> happened faster when external coordination 
    was absent (Dutch: 15 years vs British: 57 years). AI unemployment and digital 
    capital flight are structural accelerators—they remove the time buffer that 
    made Britain's slow decline possible.
  </p>
</div>
```

---

## 4. Integration Instructions

### 4.1 File Structure

Current file: `public/spice-methodology.html`

**Changes required:**
1. Add TOC HTML after `<h1>` title, before "Overview"
2. Add CSS to `<style>` block (or external stylesheet if preferred)
3. Add JavaScript to `<script>` block at end of `<body>`
4. Insert Part 0 content after "Overview" section, before "Part I — Debt"
5. Add new citations [24] to the citations appendix

### 4.2 Citation Addition

Add to the **All Citations** appendix:

```html
<p id="citation-24">
  <strong>[24]</strong> Dalio, R. (2021). <em>Principles for Dealing with the 
  Changing World Order: Why Nations Succeed and Fail.</em> Avid Reader Press. 
  Historical analysis of reserve currency cycles spanning Dutch Guilder (1600s–1780s), 
  British Pound (1815–1971), and US Dollar (1944–present). Dalio estimates the US 
  is 10–15 years from major restructuring based on pattern analysis.
</p>
```

### 4.3 Styling Consistency

**Match existing methodology page styles:**
- Font family: Current page uses system fonts
- Headings: H2 for parts, H3 for subsections, H4 for sub-subsections
- Colors: Black text `#1a1a1a`, gray subtext `#666`, blue links `#2563eb`
- Spacing: Generous line-height (1.6–1.8), paragraph margins
- Tables: Bordered, alternating row colors for readability
- Boxes/callouts: Light gray background `#f5f5f5`, rounded corners

**New styles added:**
- `.phase-box` - for Dalio cycle phases
- `.collision-diagram` - for AI wildcard collision visual
- `.crypto-change-box` - for crypto wildcard points
- `.timeline-comparison` - for timeline compression comparison
- `.key-insight` - highlighted insight boxes (light blue background)

### 4.4 Responsive Behavior

**Desktop (>1200px):**
- TOC sticky sidebar on left
- Main content on right
- Two-column grid layout

**Tablet (768px–1199px):**
- TOC inline at top (not sticky)
- Full-width content below
- Single column layout

**Mobile (<768px):**
- TOC collapsible (hidden by default)
- Hamburger toggle button
- All content single column
- Tables scroll horizontally if needed

---

## 5. Testing Checklist

Before deploying, verify:

### 5.1 Functionality
- ✅ TOC toggle works on mobile
- ✅ All anchor links jump to correct sections
- ✅ Active section highlighting updates on scroll
- ✅ Smooth scroll behavior works
- ✅ Sticky sidebar stays visible on desktop
- ✅ Mobile TOC collapses after link click

### 5.2 Content
- ✅ All Part 0 subsections render correctly
- ✅ Tables format properly (no overflow on mobile)
- ✅ Diagrams/boxes display correctly
- ✅ Citations [24] link works
- ✅ No typos or formatting errors

### 5.3 Responsiveness
- ✅ Desktop: Sidebar + content grid works
- ✅ Tablet: TOC inline, content full-width
- ✅ Mobile: TOC collapsible, no horizontal scroll
- ✅ All screen sizes tested (320px–2560px)

### 5.4 Performance
- ✅ Page loads in <2 seconds
- ✅ Scroll performance smooth (60fps)
- ✅ No JavaScript errors in console
- ✅ Images/diagrams optimized

---

## 6. Success Criteria

**Upgrade is successful if:**

1. ✅ TOC provides clear navigation to all 7 parts + appendix
2. ✅ Part 0 establishes theoretical foundation (Dalio + AI/crypto wildcards)
3. ✅ Content flows logically: Theory (Part 0) → Technical Model (Parts I-VI)
4. ✅ Page remains readable and scannable despite increased length
5. ✅ Mobile experience is smooth (collapsible TOC works well)
6. ✅ No regressions to existing content (Parts I-VI unchanged)
7. ✅ New content matches existing academic tone and citation rigor

---

## 7. Future Enhancements (Out of Scope for V1)

- **Back to Top buttons** at end of each part
- **Print stylesheet** for PDF export
- **Dark mode toggle** (if site-wide theme added)
- **Expandable footnotes** (hover to preview citation)
- **Progress indicator** showing % of page read

---

**END OF METHODOLOGY PAGE UPGRADE REQUIREMENTS**
