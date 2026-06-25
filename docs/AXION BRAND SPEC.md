# AXION / MOND — Brand Implementation Spec for Claude Code

**Audience:** Claude Code, working in the existing `spice-dashboard` React/Vite repo at `C:\Users\user\OneDrive\Documents\Crypto\spice-dashboard`.

**Goal:** Replace the existing SPICE branding with a complete AXION / MOND identity system. Wordmark assets, design tokens, typography, and component patterns are specified below. The rename sweep section covers SPICE → AXION terminology changes in code and content.

**Scope of this spec:** Visual identity and naming only. No protocol logic changes, no smart contract redeployments, no architectural restructuring.

-----

## 1. Context (one-paragraph version)

The project is being renamed: **SPICE → AXION** for the company/protocol, and **S token → MOND** for the unit of account. The “Particle in Vacuum” mark for AXION was chosen — a hairline geometric sans wordmark with characteristic notched X. MOND uses the same letterform DNA in a quieter form (no character-feature letters). Both wordmarks are provided as transparent PNGs. The brand register is institutional — Apple/SpaceX rather than retail-crypto — so the rest of the system (type, color, layout) must support that. No emojis. No decorative flourishes. No memecoin vibes.

-----

## 2. Asset placement

Four wordmark PNG files are provided in the handoff directory. Place them at:

```
public/brand/
├── axion-wordmark-dark.png      ← black letters, transparent bg (for light surfaces)
├── axion-wordmark-light.png     ← white letters, transparent bg (for dark surfaces)
├── mond-wordmark-dark.png       ← black letters, transparent bg (for light surfaces)
└── mond-wordmark-light.png      ← white letters, transparent bg (for dark surfaces)
```

Naming convention: `{brand}-wordmark-{theme}.png`. The “theme” is the background, not the letter color (i.e., `-light` means “for use on light backgrounds” — confusingly *contains white letters*, because that’s what appears on a dark background… reversed. **Actually use the simpler convention:** the suffix describes the letter color. `-dark` = dark letters. `-light` = light letters. Pick whichever feels more natural and apply consistently — just be consistent.

**Long-term:** these PNGs should be converted to SVG before production. PNG works for now; SVG is the production endpoint for infinite scaling and smaller file size. Treat the PNG as the immediate stand-in.

-----

## 3. Design tokens

Create `src/theme/tokens.js` with the following structure. Inline styles read from these tokens; nothing should hardcode values outside this file.

```javascript
// src/theme/tokens.js
// Brand design tokens for AXION / MOND.
// Read by inline styles throughout the app. Never hardcode values elsewhere.

export const colors = {
  // Surface — light theme (the primary brand surface)
  paper:       '#F6F2E9',  // primary background, warm off-white
  paperSubtle: '#F2EDE2',  // slightly recessed surface (cards on paper)

  // Surface — dark theme
  ink:         '#0A0A0A',  // primary dark background
  inkSubtle:   '#141414',  // slightly elevated surface (cards on ink)

  // Letter / text colors
  letterDark:  '#0A0A0A',  // primary text on light surfaces (matches logo letter color)
  letterLight: '#F0EDE6',  // primary text on dark surfaces (warm white, matches institutional tone)

  // Semantic opacities (apply via rgba or opacity property)
  // — Use these instead of arbitrary opacity numbers.
  opacity: {
    primary:   1.0,    // headlines, logo, prices
    body:      0.78,   // body text
    secondary: 0.55,   // labels, captions, metadata
    tertiary:  0.4,    // disabled, borderless dividers
    faint:     0.1,    // hairline borders
  },

  // Accent — used sparingly. Single accent only.
  accent:      '#C58A4D',  // copper. Use for: active state, single highlight, particle-mark dot.
  accentMuted: '#8C6F3D',  // pressed/hover state for accent elements.
};

export const fonts = {
  // Display + body. Geist is Vercel's neo-grotesque; works at all weights.
  // Loaded via Google Fonts in index.html (see Section 4).
  sans:  "'Geist', system-ui, -apple-system, sans-serif",

  // Data, code, prices, contract addresses, technical annotations.
  // IBM Plex Mono is already in the existing stack — keep it.
  mono:  "'IBM Plex Mono', 'SF Mono', Menlo, monospace",
};

export const fontWeights = {
  light:    300,  // hairline display use, e.g. uppercase nav at small sizes
  regular:  400,
  medium:   500,  // primary headline weight — matches the wordmark
  semibold: 600,
  bold:     700,
};

export const fontSizes = {
  // Display scale — for hero copy, page-defining type
  displayXL:  'clamp(56px, 9vw, 132px)',
  displayLG:  'clamp(40px, 6vw, 80px)',
  displayMD:  'clamp(32px, 4.5vw, 56px)',

  // Heading scale
  h1: 'clamp(28px, 3.4vw, 42px)',
  h2: 'clamp(22px, 2.4vw, 30px)',
  h3: '20px',

  // Body scale
  bodyLG:   'clamp(17px, 1.4vw, 20px)',
  body:     '16px',
  bodySM:   '14px',

  // Caption / data scale (paired with mono font)
  caption:  '12px',
  micro:    '11px',     // tracking-heavy uppercase, IBM Plex Mono
  nano:     '10px',
};

export const letterSpacing = {
  // For wordmark-echoing nav labels and section headers
  wide:     '0.28em',   // primary uppercase nav, mono
  wider:    '0.32em',   // section labels, meta tags
  widest:   '0.4em',    // logo-adjacent labels (e.g. PROTOCOL beneath the wordmark)

  // For display headlines (tight tracking)
  tight:    '-0.025em',
  tighter:  '-0.035em', // hero headlines only

  normal:   '0em',
};

export const lineHeights = {
  tight:  0.95,   // display headlines
  snug:   1.15,   // h2, h3
  normal: 1.55,   // body text
  relaxed: 1.7,
};

export const spacing = {
  // 4-pt grid
  xs:  '4px',
  sm:  '8px',
  md:  '16px',
  lg:  '24px',
  xl:  '36px',
  xxl: '56px',
  xxxl: '88px',
  jumbo: '120px',
};

export const radii = {
  none:    '0',
  sm:      '4px',
  md:      '8px',
  pill:    '100px',  // primary button shape
  full:    '9999px',
};

export const breakpoints = {
  mobile:  '720px',
  tablet:  '1024px',
  desktop: '1440px',
};

// Convenience: a `theme` aggregator for components that want a single import
export const theme = {
  colors,
  fonts,
  fontWeights,
  fontSizes,
  letterSpacing,
  lineHeights,
  spacing,
  radii,
  breakpoints,
};

export default theme;
```

Also create `src/theme/index.js` that re-exports the above:

```javascript
// src/theme/index.js
export * from './tokens';
export { theme as default } from './tokens';
```

-----

## 4. Font loading

Add Geist to `index.html` in the `<head>` (IBM Plex Mono is already there — verify it remains):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
```

Verify there are no `<style>` blocks or `.css` files added. **The project uses inline styles only** — see Section 9 (constraints).

-----

## 5. Component patterns

These are the canonical patterns. Use them as templates; do not add competing styles.

### 5.1 Navbar

```jsx
// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import theme from '../theme';

const NavLink = ({ to, children, isCta = false }) => (
  <Link
    to={to}
    style={{
      color: isCta ? theme.colors.paper : theme.colors.letterDark,
      backgroundColor: isCta ? theme.colors.letterDark : 'transparent',
      padding: isCta ? '12px 22px' : '0',
      borderRadius: isCta ? theme.radii.pill : 0,
      textDecoration: 'none',
      fontFamily: theme.fonts.mono,
      fontWeight: isCta ? theme.fontWeights.medium : theme.fontWeights.regular,
      fontSize: theme.fontSizes.micro,
      letterSpacing: isCta ? '0.18em' : theme.letterSpacing.wide,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      transition: 'opacity 0.2s',
    }}
  >
    {children}
  </Link>
);

export default function Navbar() {
  return (
    <nav style={{
      padding: '36px 6vw',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '32px',
      borderBottom: `1px solid rgba(10,10,10,0.1)`,
    }}>
      <Link to="/" style={{ display: 'block' }}>
        <img
          src="/brand/axion-wordmark-dark.png"
          alt="Axion"
          style={{
            width: 'clamp(140px, 16vw, 220px)',
            height: 'auto',
            display: 'block',
          }}
        />
      </Link>
      <div style={{ display: 'flex', gap: '36px', alignItems: 'center', flexWrap: 'wrap' }}>
        <NavLink to="/protocol">Protocol</NavLink>
        <NavLink to="/colony">Colony</NavLink>
        <NavLink to="/mond">MOND</NavLink>
        <NavLink to="/thesis">Thesis</NavLink>
        <NavLink to="/docs">Docs</NavLink>
        <NavLink to="/vault" isCta>Open Vault</NavLink>
      </div>
    </nav>
  );
}
```

**Mobile rule:** at `< 720px`, the navbar should stack: logo on its own line, links below, full width.

### 5.2 Hero section

```jsx
// src/components/Hero.jsx
import theme from '../theme';

export default function Hero({ eyebrow, headline, headlineEm, lede, actions }) {
  return (
    <section style={{
      padding: '100px 6vw 120px',
      maxWidth: '1500px',
    }}>
      {eyebrow && (
        <div style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSizes.micro,
          letterSpacing: theme.letterSpacing.wider,
          textTransform: 'uppercase',
          color: theme.colors.letterDark,
          opacity: theme.colors.opacity.body,
          marginBottom: '36px',
        }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{
        fontFamily: theme.fonts.sans,
        fontWeight: theme.fontWeights.medium,
        fontSize: theme.fontSizes.displayXL,
        letterSpacing: theme.letterSpacing.tighter,
        lineHeight: theme.lineHeights.tight,
        marginBottom: '36px',
        maxWidth: '14ch',
        color: theme.colors.letterDark,
      }}>
        {headline}
        {headlineEm && (
          <em style={{ fontStyle: 'normal', color: `rgba(10,10,10,0.4)` }}>
            {' '}{headlineEm}
          </em>
        )}
      </h1>
      {lede && (
        <p style={{
          fontFamily: theme.fonts.sans,
          fontSize: theme.fontSizes.bodyLG,
          lineHeight: theme.lineHeights.normal,
          color: `rgba(10,10,10,0.78)`,
          maxWidth: '60ch',
          marginBottom: '44px',
        }}>
          {lede}
        </p>
      )}
      {actions && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </section>
  );
}
```

### 5.3 Button (primary + secondary)

```jsx
// src/components/Button.jsx
import theme from '../theme';

export default function Button({ children, variant = 'primary', ...props }) {
  const baseStyle = {
    fontFamily: theme.fonts.sans,
    fontWeight: theme.fontWeights.medium,
    fontSize: theme.fontSizes.bodySM,
    padding: '14px 28px',
    borderRadius: theme.radii.pill,
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    display: 'inline-block',
    transition: 'opacity 0.2s, background-color 0.2s',
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.letterDark,
      color: theme.colors.paper,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.letterDark,
      border: `1px solid rgba(10,10,10,0.3)`,
    },
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant] }} {...props}>
      {children}
    </button>
  );
}
```

### 5.4 Data display (MOND price, etc.)

For all numeric / contract / protocol data, use IBM Plex Mono. Example:

```jsx
<div style={{
  fontFamily: theme.fonts.mono,
  fontSize: '48px',
  fontWeight: theme.fontWeights.medium,
  letterSpacing: '-0.015em',
  color: theme.colors.letterDark,
}}>
  1.0000 <span style={{
    fontSize: '14px',
    color: `rgba(10,10,10,0.5)`,
    letterSpacing: '0.1em',
  }}>USDC</span>
</div>
```

### 5.5 Section label (recurring eyebrow pattern)

```jsx
<div style={{
  fontFamily: theme.fonts.mono,
  fontSize: theme.fontSizes.micro,
  letterSpacing: theme.letterSpacing.wider,
  textTransform: 'uppercase',
  color: theme.colors.letterDark,
  opacity: theme.colors.opacity.body,
  marginBottom: '36px',
}}>
  The Great Collision · Act I
</div>
```

-----

## 6. Page-level layout

Wrap every page in a top-level layout component that:

- Sets the page background (`theme.colors.paper` for light pages, `theme.colors.ink` for dark)
- Sets the default text color (`theme.colors.letterDark` or `theme.colors.letterLight`)
- Imports the appropriate Navbar logo variant (light vs. dark)

For pages that should be dark-themed (e.g. the MOND product page, the protocol page), use the `axion-wordmark-light.png` and reverse the color tokens.

-----

## 7. Brand rename sweep

The codebase currently uses SPICE branding. Apply the following text replacements across the repo:

|Find                                       |Replace with                                                          |Scope                                                                                           |
|-------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
|`SPICE` (as brand name in user-facing copy)|`AXION`                                                               |All `.jsx`, `.js`, `.md`, `.html`, `.json` (where it’s a brand reference, not a code identifier)|
|`S token` / `S-token`                      |`MOND`                                                                |User-facing copy                                                                                |
|`SPICEVault` (smart contract name in code) |Leave as-is in contract code; in any UI label use “Axion Vault”       |Frontend UI only                                                                                |
|`spice-dashboard` (folder name)            |Leave as folder name for now (rename out-of-band when domain migrates)|—                                                                                               |
|`zpc.finance`                              |Leave as-is until domain migration is confirmed                       |—                                                                                               |

**Important:** Do NOT rename the deployed smart contract symbols on Base Sepolia (`SPICEVault` at `0x0fCf6F860927c6cd94e974E7B9BfAb440E2b1FeE`, `IRONToken`, `MockWBTC`). These are immutable on-chain. The frontend can refer to them by their AXION-branded names in UI copy while still calling them by their contract names in code.

**Files likely to need rename of identifiers (not content):**

- `src/components/ColonyDeflationExplorer.jsx` — keep filename, but verify all UI strings inside say AXION/MOND
- Any `SpiceVault*` React components → rename to `AxionVault*`
- Any references to `useSpice*` hooks → rename to `useAxion*`
- Any `spiceConfig` or similar → rename to `axionConfig`

**Files NOT to rename (yet):**

- `package.json` `name` field — wait until domain migration
- `vite.config.js` — leave alone
- Any deployment scripts — leave alone until ready to migrate hosting

-----

## 8. Phased implementation plan

Don’t try to do everything at once. Do this in order:

### Phase 1 — Tokens and assets (smallest reversible change)

1. Drop the four PNG files into `public/brand/`
1. Add Geist to `index.html`
1. Create `src/theme/tokens.js` and `src/theme/index.js`
1. Verify Vite picks them up (run `npm run dev`, check no warnings)

### Phase 2 — Top-level brand visibility

1. Replace the existing logo/wordmark in the Navbar with `axion-wordmark-dark.png`
1. Update Navbar typography to match Section 5.1
1. Test at mobile breakpoint

### Phase 3 — Hero and primary page templates

1. Apply Section 5.2 Hero pattern to the landing page
1. Apply Section 5.3 Button pattern site-wide
1. Verify text contrast on both light and dark surfaces

### Phase 4 — Content rename sweep

1. Run a text-content sweep of SPICE → AXION as per Section 7
1. Run the S token → MOND sweep
1. Test that no UI label still says SPICE

### Phase 5 — Component refresh

1. Refresh card components (e.g. data display cards) to use the new token system
1. Refresh ColonyDeflationExplorer.jsx visual treatment (typography only — don’t touch the recharts data layer)
1. Refresh any existing dashboards / vault views

### Phase 6 — Verification

1. Lighthouse run — should not regress
1. Visual test on iPhone (Steve will do this manually)
1. Verify all four wordmark PNGs are actually used somewhere in the app

**Stopping points:** After each phase, ensure the site still builds, deploys to Vercel cleanly, and renders without console errors. Don’t proceed to the next phase until current phase is verified.

-----

## 9. What NOT to change (constraints)

These are deliberate. Do not deviate without checking with Steve first.

1. **No CSS files. No Tailwind. No styled-components.** All styles are inline, using the token system. This is a deliberate architectural choice — do not “improve” it by introducing a styling library.
1. **No emojis** anywhere in the UI. Not in buttons, not in section labels, not in error messages.
1. **No icon libraries** (lucide, heroicons, etc.) without checking. The aesthetic favours type-only and minimal SVG where icons are needed.
1. **No animation libraries** (framer-motion, etc.) — CSS transitions only, sparingly.
1. **No dark-mode toggle** — the design uses light theme for primary pages and dark theme for specific sections, but the user does not switch between them globally.
1. **Don’t redeploy contracts.** Anything that touches `ethers.js` or contract ABIs is out of scope.
1. **Don’t migrate hosting.** Stay on Vercel, stay on zpc.finance until Steve confirms domain migration.
1. **Don’t add new dependencies** unless absolutely necessary. The stack is React 19, Vite 6, React Router v7, Recharts, ethers.js v6. That’s it.
1. **Don’t touch the contract addresses or ABI files.**
1. **Don’t introduce TypeScript** if the project isn’t already TS. Match what’s there.

-----

## 10. Tone and copy guidance

Where copy is touched during the rename sweep, the voice is:

- **Direct and uninflated.** “Axion is a parallel economic protocol.” Not “Axion is reimagining the future of finance.”
- **Specific over abstract.** Use concrete nouns. Citizens. Dividends. MOND. Colony. Fisc. Not “stakeholders” or “value capture.”
- **No marketing exclamations.** No “Discover Axion!” No “Welcome to the future!”
- **Title case for headings, sentence case for navigation.** Headings: “The Great Collision.” Nav: “Protocol”, “Colony”, “MOND”.
- **Brand names are capitalized as written:** AXION (all caps in wordmark, but “Axion” in body copy is acceptable). MOND (always all caps in body copy too — it’s a ticker-style name).

Phrases to use, where natural:

- “Capitalist UBI. No tax. No welfare. Every citizen a shareholder.”
- “The economy doesn’t adapt. It jumps.”
- “Modified Newtonian dynamics, in monetary form.”
- “A parallel economic protocol.”

Phrases to avoid:

- “Disrupting” anything
- “Web3”
- “DeFi” (we are not generic DeFi)
- “Tokenomics”
- “Community” (overused)

-----

## 11. Verification checklist (for Steve to sign off)

After Claude Code completes the work, the following should all be true. Walk through this on iPhone first.

- [ ] Navbar shows AXION wordmark at proper size (140–220px wide depending on viewport).
- [ ] Hero headline is visible, well-contrasted, fits within ~14ch width.
- [ ] “Open Vault” button is visible (black background, paper-toned letters readable).
- [ ] Body copy is readable on the warm paper background (#F6F2E9).
- [ ] No console errors.
- [ ] No CSS files exist in `src/` (the inline-styles-only rule is preserved).
- [ ] No UI text still says “SPICE” or “S token”.
- [ ] Site builds locally (`npm run dev`) without warnings.
- [ ] Vercel preview deploy succeeds.
- [ ] iPhone view: logo readable, menu doesn’t overflow, hero stacks correctly.

-----

## 12. Open questions

These are deliberately left open for Steve to resolve:

1. **Logo SVG conversion.** Should this be part of this engagement or deferred? PNG works for now; SVG is correct for production.
1. **Dark-themed pages.** Which pages should be dark vs light? Default assumption: marketing/landing/about pages are light; product/vault/data pages can be either, but recommend dark for emphasis (e.g. MOND product page).
1. **Favicon.** Currently shows the old SPICE favicon. Generate a new one from the AXION wordmark (just the X, or just the O, or the full mark scaled down). Decision pending — fine to ship without updated favicon for now.
1. **Domain migration.** When zpc.finance → axion.fi or axion.app.finance happens, this spec needs a follow-up. For now, leave domain references alone.

-----

*End of spec.*
*Created May 2026. Hand to Claude Code with the four PNG assets in the same handoff bundle.*