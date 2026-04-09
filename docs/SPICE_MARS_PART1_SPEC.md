# SPICE × Mars Colony — Integration Spec Part 1
## For Claude Code
## Target: Add /mars landing page to zpc.finance

---

## CRITICAL CONSTRAINT — READ FIRST

The existing SPICE site is working and live. The following files must NOT
be modified in any way except where this spec explicitly instructs:

DO NOT TOUCH:
  - src/pages/Home.jsx
  - src/pages/chart3-simulation.jsx
  - src/pages/Impact.jsx
  - src/pages/CrisisScenarios.jsx
  - src/pages/ApocalypseIndicator.jsx
  - src/pages/Portfolio.jsx
  - src/pages/Dashboard.jsx
  - src/pages/Collision.jsx
  - src/pages/CollisionArchive.jsx
  - src/pages/Config.jsx
  - src/App.css
  - src/index.css
  - src/data/
  - src/lib/
  - vercel.json
  - package.json

The ONLY file that may be modified is src/App.jsx, and only the three
additions specified below.

---

## Overview

Add a /mars route to the SPICE React site. This is a self-contained
landing page for Act 2 of the SPICE narrative — the Mars Colony Economy.

Files to CREATE:
  src/pages/Mars.jsx
  src/pages/Mars.css

Files to MODIFY:
  src/App.jsx  — 3 lines added only

---

## Step 1 — Modify src/App.jsx

Make exactly three additions. Do not change anything else.

### Addition 1 — Import (add with the other page imports at the top)
```jsx
import Mars from './pages/Mars.jsx'
```

### Addition 2 — Route (add inside the Routes block, after the last Route)
```jsx
<Route path="/mars" element={<Mars />} />
```

### Addition 3 — Nav link (add inside the Nav function)
Look at how the existing NavLinks are written and match that pattern exactly.
Add after the last existing nav item:
```jsx
<NavLink to="/mars">Mars Colony</NavLink>
```

---

## Step 2 — Create src/pages/Mars.css

This file is imported ONLY by Mars.jsx. It will not affect any other page.

```css
/* ═══════════════════════════════════════════════════════
   Mars.css — styles for Mars Colony landing page only
   Imported exclusively by Mars.jsx
═══════════════════════════════════════════════════════ */

.mars-page {
  min-height: 100vh;
  background: #0a0e1a;
  color: #e8eaf0;
  font-family: 'Share Tech Mono', monospace;
}

/* ── Layout ── */
.mars-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 28px 80px;
}

/* ── Act label ── */
.mars-act-label {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: #4a5878;
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-top: 52px;
}

/* ── Hero ── */
.mars-hero {
  text-align: center;
  padding-bottom: 44px;
}

.mars-hero-title {
  font-size: clamp(26px, 4.5vw, 48px);
  font-weight: 400;
  color: #e8eaf0;
  letter-spacing: 0.1em;
  margin: 0 0 22px;
  line-height: 1.2;
}

.mars-hero-title .gold {
  color: #c8a96e;
}

.mars-hero-subtitle {
  font-size: 12px;
  color: #8899bb;
  line-height: 1.9;
  max-width: 600px;
  margin: 0 auto;
  letter-spacing: 0.04em;
}

/* ── Dome image ── */
.mars-dome-wrap {
  margin: 0 0 36px;
  position: relative;
  background: #0f1520;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid #1e2a42;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mars-dome-img {
  width: 100%;
  height: auto;
  display: block;
}

.mars-dome-placeholder {
  font-size: 11px;
  color: #4a5878;
  text-align: center;
  padding: 60px 20px;
  letter-spacing: 0.08em;
}

.mars-dome-caption {
  font-size: 10px;
  color: #4a5878;
  letter-spacing: 0.1em;
  text-align: center;
  margin-top: -28px;
  margin-bottom: 36px;
  padding-bottom: 4px;
}

/* ── Philosophy block ── */
.mars-philosophy {
  border: 1px solid #2a3a5c;
  border-left: 3px solid #c8a96e;
  background: #0f1520;
  padding: 28px 32px;
  margin: 0 0 44px;
  border-radius: 2px;
}

.mars-philosophy-label {
  font-size: 9px;
  letter-spacing: 0.2em;
  color: #c8a96e;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.mars-philosophy p {
  font-size: 12px;
  color: #8899bb;
  line-height: 1.9;
  margin: 0 0 14px;
  letter-spacing: 0.03em;
}

.mars-philosophy p:last-child {
  margin: 0;
  color: #c8a96e;
  font-size: 13px;
  letter-spacing: 0.05em;
  border-top: 1px solid #1e2a42;
  padding-top: 16px;
  margin-top: 4px;
}

/* ── Three column cards ── */
.mars-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 0 0 44px;
}

@media (max-width: 680px) {
  .mars-cards {
    grid-template-columns: 1fr;
  }
}

.mars-card {
  background: #0f1520;
  border: 1px solid #1e2a42;
  border-radius: 2px;
  padding: 22px 20px;
  transition: border-color 0.2s;
}

.mars-card:hover {
  border-color: #2a3a5c;
}

.mars-card-symbol {
  font-size: 18px;
  color: #c8a96e;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.mars-card-title {
  font-size: 11px;
  color: #e8eaf0;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.mars-card-body {
  font-size: 11px;
  color: #8899bb;
  line-height: 1.75;
  letter-spacing: 0.03em;
}

/* ── Section heading ── */
.mars-section-label {
  font-size: 9px;
  letter-spacing: 0.22em;
  color: #4a5878;
  text-transform: uppercase;
  margin-bottom: 16px;
  border-bottom: 1px solid #1e2a42;
  padding-bottom: 10px;
}

/* ── Proof points ── */
.mars-proofs {
  margin: 0 0 44px;
}

.mars-proof-item {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #141c2e;
  align-items: flex-start;
}

.mars-proof-item:last-child {
  border-bottom: none;
}

.mars-proof-tick {
  color: #3dffa0;
  font-size: 12px;
  margin-top: 1px;
  flex-shrink: 0;
  letter-spacing: 0;
}

.mars-proof-text {
  font-size: 11px;
  color: #8899bb;
  line-height: 1.7;
  letter-spacing: 0.03em;
}

/* ── SPICE connection ── */
.mars-connection {
  background: #0f1520;
  border: 1px solid #1e2a42;
  border-radius: 2px;
  padding: 24px 28px;
  margin: 0 0 44px;
  font-size: 11px;
  color: #8899bb;
  line-height: 1.85;
  letter-spacing: 0.04em;
}

.mars-connection .highlight {
  color: #c8a96e;
}

/* ── CTA buttons ── */
.mars-cta {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
  margin: 0 0 44px;
}

.mars-btn-primary {
  background: transparent;
  border: 1px solid #c8a96e;
  color: #c8a96e;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  display: inline-block;
  border-radius: 2px;
}

.mars-btn-primary:hover {
  background: #c8a96e;
  color: #0a0e1a;
}

.mars-btn-secondary {
  background: transparent;
  border: 1px solid #2a3a5c;
  color: #4a5878;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 12px 24px;
  cursor: default;
  text-decoration: none;
  display: inline-block;
  border-radius: 2px;
}

.mars-btn-note {
  font-size: 9px;
  color: #4a5878;
  letter-spacing: 0.08em;
  margin-top: 8px;
}

/* ── Footer note ── */
.mars-footer-note {
  font-size: 9px;
  color: #2a3a5c;
  letter-spacing: 0.12em;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #141c2e;
  text-transform: uppercase;
}

/* ── Act ribbon ── */
.mars-act-ribbon {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 36px;
  padding: 10px 0;
  border-top: 1px solid #1e2a42;
  border-bottom: 1px solid #1e2a42;
}

.mars-act-ribbon-item {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: #4a5878;
  text-transform: uppercase;
}

.mars-act-ribbon-item.active {
  color: #c8a96e;
}

.mars-act-ribbon-divider {
  font-size: 9px;
  color: #1e2a42;
}
```

---

## Step 3 — Create src/pages/Mars.jsx

```jsx
import './Mars.css'

const COLONY_DASHBOARD_URL = 'http://localhost:5000'

const PROOF_POINTS = [
  'Population stabilises using an Earth-realistic age distribution — births replace deaths across all age groups over 200 simulated years.',
  'MCC infrastructure remains solvent when citizen bills are kept near 20% of UBI, with the board accountable through annual elections.',
  'Equity dividends grow over time as the cooperative economy matures — contributors become owners, receiving V-token dividends monthly.',
  'V-token savings accumulate at the median citizen level without dangerous concentration — the Gini coefficient stays within bounds.',
  'The company ecosystem sustains 10–20 active cottage industries throughout the simulation, providing genuine market diversity.',
]

const CARDS = [
  {
    symbol: 'S → V',
    title: 'Two-token currency',
    body: 'S-tokens are issued monthly as UBI and expire at month end — driving velocity with no inflation. V-tokens are permanent savings, earned through equity dividends and converted from UBI surplus.'
  },
  {
    symbol: '⬡',
    title: 'Worker-owned enterprise',
    body: 'Every company distributes monthly V-token dividends to equity holders. Contributors are owners — the John Lewis cooperative model applied to a post-AI economy where robots do the capital-intensive work.'
  },
  {
    symbol: '◈',
    title: 'Citizen-owned infrastructure',
    body: 'The Mars Colony Company provides life support, power, water, and justice. Every citizen holds one equal non-transferable share. The board is elected annually and held accountable through transparent blockchain governance.'
  },
]

export default function Mars() {
  return (
    <div className="mars-page">
      <div className="mars-container">

        {/* ── Act ribbon ── */}
        <div className="mars-act-ribbon">
          <span className="mars-act-ribbon-item">Act I — The Collision</span>
          <span className="mars-act-ribbon-divider">→</span>
          <span className="mars-act-ribbon-item active">Act II — The Solution</span>
          <span className="mars-act-ribbon-divider">→</span>
          <span className="mars-act-ribbon-item">Act III — The Blueprint</span>
          <span className="mars-act-ribbon-divider">→</span>
          <span className="mars-act-ribbon-item">Act IV — The Infrastructure</span>
        </div>

        {/* ── Hero ── */}
        <div className="mars-hero">
          <div className="mars-act-label">Act II — The Solution</div>
          <h1 className="mars-hero-title">
            The <span className="gold">Mars Colony</span> Economy
          </h1>
          <p className="mars-hero-subtitle">
            If the fiat system is structurally failing, what comes next?
            The Mars Colony is a 200-year simulation of a post-scarcity economy
            built on Universal Basic Income, cooperative enterprise, and
            citizen-owned infrastructure — running in real time.
          </p>
        </div>

        {/* ── Dome image ── */}
        <div className="mars-dome-wrap">
          <img
            className="mars-dome-img"
            src="/mars-dome.jpg"
            alt="Mars Colony Dome Alpha — interior cross-section view"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="mars-dome-placeholder" style={{display:'none'}}>
            [ mars-dome.jpg not found — copy image to public/mars-dome.jpg ]
          </div>
        </div>
        <div className="mars-dome-caption">
          Colony Dome Alpha — cross-section view · 16 functional zones across 6 levels
        </div>

        {/* ── Founding philosophy ── */}
        <div className="mars-philosophy">
          <div className="mars-philosophy-label">Founding Philosophy</div>
          <p>
            Due to enormous advances in AI, automation, and robotics, the Mars Colony
            exists in a post-scarcity world where basic human needs can be met at
            extremely low cost.
          </p>
          <p>
            Every citizen is provided with a universal income sufficient to pay for
            all services they use, with enough left over to lead a minimally
            fulfilling life.
          </p>
          <p>
            "Money" is still needed to drive efficiency, to manage the consumption
            of scarce resources, and to incentivise enterprise and endeavour.
          </p>
          <p>
            The floor of basic social support is guaranteed for all,
            and the opportunity ceiling is infinite.
          </p>
        </div>

        {/* ── Three cards ── */}
        <div className="mars-section-label">How it works</div>
        <div className="mars-cards">
          {CARDS.map(card => (
            <div key={card.title} className="mars-card">
              <div className="mars-card-symbol">{card.symbol}</div>
              <div className="mars-card-title">{card.title}</div>
              <div className="mars-card-body">{card.body}</div>
            </div>
          ))}
        </div>

        {/* ── What the simulation proves ── */}
        <div className="mars-section-label">What 200 years of simulation shows</div>
        <div className="mars-proofs">
          {PROOF_POINTS.map((pt, i) => (
            <div key={i} className="mars-proof-item">
              <span className="mars-proof-tick">✓</span>
              <span className="mars-proof-text">{pt}</span>
            </div>
          ))}
        </div>

        {/* ── SPICE connection ── */}
        <div className="mars-section-label">The connection to Act I</div>
        <div className="mars-connection">
          The <span className="highlight">SPICE Collision</span> model shows where
          the current fiat economy is heading — AI displacement compressing the wage
          base, sovereign debt spiralling, fiscal systems under terminal stress.
          The <span className="highlight">Mars Colony</span> model shows what a
          functioning alternative looks like. These are not unrelated. The colony
          economy is a working implementation of the post-scarcity transition the
          SPICE thesis predicts is coming. The question is not whether the transition
          will happen. The question is whether anyone is ready for it.
        </div>

        {/* ── CTA ── */}
        <div className="mars-section-label">Explore the simulation</div>
        <div className="mars-cta">
          <div>
            <a
              className="mars-btn-primary"
              href={COLONY_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Launch Colony Dashboard →
            </a>
            <div className="mars-btn-note">
              Running locally · mars.zpc.finance coming soon
            </div>
          </div>
          <div>
            <span className="mars-btn-secondary">
              Economic Design Doc →
            </span>
            <div className="mars-btn-note">
              Coming soon
            </div>
          </div>
        </div>

        {/* ── Footer note ── */}
        <div className="mars-footer-note">
          Mars Colony Economy · Version 6 · Open Simulation · Built with Claude
        </div>

      </div>
    </div>
  )
}
```

---

## Step 4 — Image instruction

After all code changes are made, output this message to the user:

```
ACTION REQUIRED — Dome image:

Please copy the Gemini dome image to:
  [repo root]/public/mars-dome.jpg

The /mars page will show a placeholder until the image is in place.
Once copied, commit and push — Vercel will serve it at /mars-dome.jpg.
```

---

## Step 5 — Testing checklist

Before committing, verify:
  [ ] npm run dev starts without errors or warnings
  [ ] / route still works and looks identical to before
  [ ] /collision, /impact, /crisis, /indicators, /portfolio, /coin all work
  [ ] /mars route renders without console errors
  [ ] Nav shows "Mars Colony" link alongside existing nav items
  [ ] Dome image shows (or placeholder shows gracefully if image not yet copied)
  [ ] Three cards display in a row on desktop, stack on narrow viewport
  [ ] Proof points and CTA buttons render correctly
  [ ] npm run build completes without errors

---

## Step 6 — Commit message

```
feat: add Mars Colony landing page (/mars route)

- Add Mars.jsx and Mars.css (new files, no effect on existing pages)
- Add /mars route and nav link to App.jsx
- Act II of the SPICE narrative — post-scarcity economy simulation
```

---

## What NOT to do

- Do not modify any existing page or CSS file
- Do not add any npm packages
- Do not fetch external fonts or resources
- Do not change vercel.json
- Do not embed the Flask simulation (link only)
- Do not change the colour scheme or layout of any existing page
- Do not add Tailwind or any CSS framework
