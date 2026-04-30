# SPICE Visual Redesign

> **For Claude Code.** Read this document at the start of any session that involves UI, layout, copy, or visual identity work. The existing `CLAUDE.md` remains authoritative for project context, smart contracts, simulation logic, and recharts rules. **This document supersedes the "Design System" section of `CLAUDE.md` only.** Update `CLAUDE.md` to reference this file when implementation lands.
>
> **Canonical visual reference:** `docs/visual-reference.html` (the v8 mockup). When this spec is silent on a question, the HTML answers it.
>
> **Status:** Approved for implementation.
> **Scope:** Web app (`zpc.finance`, React 19 / Vite 6) and a future native iOS app.

---

## Quick Index

1. [Summary of the change](#1-summary)
2. [Design tokens](#2-design-tokens)
3. [Component library](#3-component-library)
4. [Page layouts](#4-page-layouts)
5. [Imagery rules](#5-imagery)
6. [Copy & positioning](#6-copy--positioning)
7. [Mobile / responsive](#7-mobile--responsive)
8. [iOS app](#8-ios-app)
9. [What stays vs what changes](#9-what-stays-vs-what-changes)
10. [Phased migration plan](#10-migration-plan)
11. [Standing rules](#11-standing-rules-for-claude-code)

---

## 1. Summary

SPICE moves from "research paper" identity (white background, gold accent, IBM Plex Mono throughout) to **mission-control terminal** identity (near-black background, monochrome warm-white, mono throughout, semantic status colours).

Driven by three things: the current light scheme reads dated; the gold accent fights the seriousness of the thesis; and the new aesthetic ties the macro-hedge product (Act I) and the Mars colony economy (Act II) into one visual world via shared "telemetry" / "field reports" language.

---

## 2. Design Tokens

All tokens live as inline-style JS objects, consistent with the project's existing convention. **No CSS files, no Tailwind, no CSS modules.**

### 2.1 Colours

Create `src/tokens.js`:

```js
export const C = {
  // Surfaces
  bg:       "#06070a",   // page background — near-black, slightly warm
  panel:    "#0d0f12",   // raised surface — top bar, cards, vault panel
  panel2:   "#11141a",   // hover/elevated panel

  // Lines
  line:     "#232831",   // hairline divider
  lineHot:  "#353c47",   // emphasised divider, button border

  // Text — all warm-tinted
  txt:      "#ede5d4",   // primary text, brand colour
  txt2:     "#d8cfba",   // soft primary — body copy
  dim:      "#b8b0a0",   // secondary — labels, secondary metadata
  faint:    "#8a8170",   // tertiary — timestamps (passes WCAG AA at 5.8:1)

  // Headline highlight (use only on h1 hero)
  headline: "#ffffff",

  // Semantic status — only on data and live indicators, never on chrome
  ok:       "#5dd39e",   // muted green — positive deltas, INFO log, "sys online"
  warn:     "#d4a04a",   // muted amber — caution, WARN log
  crit:     "#ef4444",   // red — critical, downward deltas, threat-level

  // Status background tints
  okBg:     "rgba(93,211,158,0.06)",
  warnBg:   "rgba(212,160,74,0.06)",
  critBg:   "rgba(239,68,68,0.06)",
};
```

**Discipline:** brand is monochrome. Logo, headline, primary buttons, navigation — all warm-white. Status colours appear only on data and live indicators. Never introduce a fourth status colour. Never use status colours for layout chrome, body text, or branding.

### 2.2 Typography

```js
export const F = {
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};
```

**Single font family.** IBM Plex Mono carries everything — headline, body, data, labels. No sans-serif anywhere on protocol pages.

| Use | Weight | Colour |
|---|---|---|
| Hero h1 | **700** | `#ffffff` (pure white) |
| Hero h1 secondary span | 600 | `#ede5d4` (warm off-white) |
| Component titles (h3, h4) | 600 | `#ede5d4` |
| Body copy | 400 | `#d8cfba` |
| Data values | 500 | `#ede5d4` |
| Labels, metadata | 400 | `#b8b0a0`, uppercase, letter-spaced |

Letter-spacing on uppercase labels: `0.18em–0.22em`. Brand wordmark: `0.24em`.

### 2.3 Spacing & layout

| Element | Value |
|---|---|
| Page horizontal padding | 26–36px desktop, 18–22px mobile |
| Section vertical rhythm | 38–52px between major blocks |
| Card internal padding | 22–24px |
| Hairline divider | 1px solid `#232831` |
| **Border radius** | **0** — all corners square. Never round anything. |

### 2.4 Background grid

Faint graph-paper grid overlays the page at ~2% opacity:

```css
background-image:
  linear-gradient(to right, rgba(237,229,212,0.022) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(237,229,212,0.022) 1px, transparent 1px);
background-size: 40px 40px;
```

Applied to body, behind everything, with `pointer-events: none` and `position: fixed`.

### 2.5 Done when…

- `src/tokens.js` exists with the values above.
- `CLAUDE.md` design-system table is replaced by a pointer to this file.
- Body background and base text colour updated in entry HTML and root component.
- Existing pages render in the new colour ramp (broken layouts on `/collision` etc. are expected at this point — fixed in Phase 4).

---

## 3. Component Library

Build each as a separate file in `src/components/spice/`. Use inline-styles via `const S = { ... }` pattern. Names below are required — Claude Code should match them.

### 3.1 `<TopBar />`

Four-column grid: `auto 1fr auto auto`. Background `C.panel`, 1px bottom border `C.line`, 13px vertical padding.

- **Brand**: SVG glyph (3-line collision mark, 18×18) + "SPICE" 600 weight 12px tracked uppercase + " / mission control" in `C.dim`
- **Navigation**: 11px uppercase, `C.dim`, with `›` prefix on active item (active item in `C.txt`)
- **System status**: green pulse dot + "Sys Online" + pipe separator in `C.faint` + "14:32 UTC"
- **Wallet button**: own column on far right, 11px uppercase, 1px white border, transparent background, inverts on hover

### 3.2 `<TickerTape />`

Marquee strip directly below TopBar. Continuous left-scroll (60s linear infinite). Items duplicated once for seamless loop. Each item: dim uppercase label + warm-white value + green/red delta. Fade gradients on left/right edges. Drive from same data feed as TelemetryGrid when wired.

### 3.3 `<TelemetryGrid />`

4×2 grid of macro indicators. Each cell:
- Dim uppercase 9.5px label
- 22px monospace value (warm-white, or `C.crit` for critical)
- 11px delta (`C.ok` / `C.crit` / `C.dim`)
- Optional 2px progress bar at the bottom

Border 1px around grid, 1px between cells. No rounded corners. Background `C.panel`.

Cells must be data-bound, not hand-coded. Eight default metrics: SPICE Level, US Debt/GDP, 10Y Yield, Real Rate, CPI YoY, DXY, BTC, Crisis Window.

### 3.4 `<ThreatVector />`

Used in groups of three for deflation/inflation/flight forces.
- 10px tracked uppercase ID line: `VEC-01 · DEFLATION`
- 19px h3 600 weight
- 13px body, 1.6 line-height, `C.txt2`
- Bottom-aligned stat row separated by hairline rule
- **Decorative corner brackets** — four 10px L-shapes in the four corners as absolutely-positioned spans. Required, not optional.

### 3.5 `<DispatchTile />`

Used in dispatches strip. Each tile:
- 16:10 image area at the top with corner tag (`Act I/II/III`)
- Image treatment via CSS:
  ```css
  filter: grayscale(1) contrast(1.05) brightness(0.85) sepia(0.18);
  mix-blend-mode: luminosity;
  ```
- Until real images arrive, use CSS gradient placeholders (see reference HTML)
- Body: dim label, h4 600, body paragraph, hairline rule, "Action →" footer

When real images arrive, drop them in as `background-image` on the `<i>` element inside `.dispatch-img`. CSS treatment desaturates and warm-tints automatically — no Photoshop preprocessing.

### 3.6 `<ThesisPreview />`

Bordered panel with terminal-prompt header (`> [T-03] From the thesis`), two paragraphs, and `Continue reading →` link with bottom-border underline.

### 3.7 `<VaultStatusPanel />`

Right-rail panel. Sequence of `vault-row` items: dim label left, warm-white value right, dotted border between. Header with title + meta.

### 3.8 `<HoldingsBar />`

Single horizontal bar split into greyscale tiers (lightest = largest holding). Five tiers: `#ede5d4`, `#b8b0a0`, `#807868`, `#4f4a40`, `#2d2b27`. Two-column legend below.

### 3.9 `<EventLog />`

3-column grid per row: time (dim, 50px) + level (`INFO`/`WARN`/`CRIT`, status-coloured) + message (`C.txt2`). Dotted bottom border between rows. Mono 11.5px.

### 3.10 `<Footer />`

Two-cluster horizontal row: status indicators left, build/network/version right. Pipe separators (`|` in `C.faint`) between items. 10.5px tracked uppercase.

### 3.11 `<SectionHead />`

Terminal-prompt label introducing every major section:

```
> [T-01]   FIELD TELEMETRY · MACRO INDICATORS   ────────   SYNC 14:31:55Z
```

Five elements: `>` prompt (in `C.txt`), `[T-NN]` tag (in `C.dim`), title (in `C.txt` tracked uppercase), flexible spacer hairline, timestamp (in `C.dim`). Bottom 1px border, 9px bottom padding.

### 3.12 `<StatusPill />`

Small inline pill (e.g. `Pre-collision · window open`). Pulse dot + uppercase label. 1px border in matching status colour, 5% tint background.

### 3.13 `<Button />`

Two variants only:
- **Primary**: warm-white background, near-black text, 600 weight, 11px tracked uppercase. Hover → pure white background.
- **Secondary**: transparent background, 1px `C.lineHot` border, warm-white text. Hover → border becomes warm-white.

No third variant. Square corners. 12px vertical / 22px horizontal padding.

### 3.14 Done when…

- All thirteen components built in `src/components/spice/`.
- A `/_components` route exists displaying every component in isolation.
- Each component uses tokens from `src/tokens.js` — no hard-coded hex values inside component files.

---

## 4. Page Layouts

### 4.1 Home (`/`) — full redesign

The current homepage is replaced entirely. New structure top-to-bottom:

1. `<TopBar />` (sticky)
2. `<TickerTape />` (sticky immediately below TopBar)
3. Two-column main grid, left `1fr`, right `360px`:

**Left (`<Main />`):**
- Hero brief: dark panel containing status pill, h1 headline (white), 70-char body paragraph, three CTAs (`Enter Vault →` primary, `Read Thesis`, `View Telemetry` secondaries)
- `[T-01] Field Telemetry`: TelemetryGrid (eight cells)
- `[T-02] Threat Vectors`: three ThreatVector cards in 1fr 1fr 1fr grid
- `[T-03] Dispatches`: three DispatchTile cards linking to Mars (Act II), Earth (Act III), Thesis (Act I)
- ThesisPreview

**Right (`<Aside />`, panel background):**
- VaultStatusPanel
- HoldingsBar with legend
- EventLog

4. `<Footer />`

**Critical:** the hero panel must have an explicit hard-coded `#06070a` background (not via CSS variable). iPad/Safari accessibility settings can flip page backgrounds to white in some configurations. Hard-coding the hero panel bypasses this.

### 4.2 The Collision (`/collision`) — token migration only

Keep four-tab structure: Dual Economy, Model Variables, Apocalypse Indicators, Policy Responses. Update tokens only:
- Background `C.bg`, not white
- All text uses new colour ramp
- Recharts colours unchanged (semantic — purple unemployment, blue inflation, etc.)
- Each chart panel sits in a `C.panel`-coloured card with hairline border

Do not redesign the tab interface. Do not change simulation logic.

### 4.3 Simulation (`/simulation`) — token migration only

Same treatment as `/collision`. Simulation chart, sliders, KPI chips keep behaviour and chart-colour semantics. Background and chrome adopt new tokens.

### 4.4 Dashboard (`/dashboard`) — token migration + telemetry alignment

Most aligned with the new mission-control aesthetic. Apply new tokens, then:
- Reuse `<TelemetryGrid />` for macro indicator section
- Reuse `<VaultStatusPanel />` for NAV/TVL/holdings
- Reuse `<EventLog />` for transaction history

This makes the dashboard a structural twin of the homepage right column, scaled up.

### 4.5 Methodology (`/spice-methodology.html`) — partial migration

Static HTML page. Migrate chrome (background, type, link colours) but preserve long-form readability — body line-height 1.7+, paragraph max-width ~680px, comfortable reading sizing. Mono throughout. Do not make denser.

### 4.6 Mars Colony (`/mars`, new) — Act II

Different register. Terminal aesthetic for chrome, navigation, footer — but body is more narrative. Layout:
- Hero: full-width image of colony, **graded full-colour** treatment (see §5.2 Treatment 3), headline overlaid
- Headline: **"Capitalist UBI. No tax. No welfare. Every citizen a shareholder."** (See §6.2.)
- Body: alternating prose blocks and data panels — citizen count, dividend rate, S-token mechanics, V-token mechanics, MCC structure
- Embed: link or iframe the existing Mars React dashboard (`MarsLayout`, `MarsOverview`, etc.)
- Footer matches site footer

### 4.7 Earth Implementation (`/earth-blueprint`, placeholder) — Act III

Reserve route. Same register as Mars page when written.

### 4.8 Done when…

- New homepage live at `/` with all six sections per §4.1.
- All four existing pages render correctly with new tokens.
- `/mars` exists with hero, narrative blocks, and embedded simulation.
- `/earth-blueprint` returns a "coming soon" placeholder using site chrome.

---

## 5. Imagery

### 5.1 Where images go

| Location | Imagery? | Treatment |
|---|---|---|
| Homepage hero | No | Pure type and data |
| Homepage telemetry / vectors | No | Pure data |
| Homepage dispatches strip | Yes — small thumbnails | Treatment 1 (warm monochrome) |
| Mars page hero | Yes — full bleed | Treatment 3 (graded colour) |
| Earth page hero | Yes — full bleed | Treatment 3 (graded colour) |
| Methodology page | No | Charts only |
| Substack/YouTube external | Full colour | No CSS treatment — separate brand layer |

### 5.2 Image treatments

**Treatment 1 — Warm monochrome (default):**
```css
filter: grayscale(1) contrast(1.05) brightness(0.85) sepia(0.18);
mix-blend-mode: luminosity;
```

**Treatment 2 — Duotone (special use):**
Two-colour gradient map from `#06070a` to `#ede5d4`. SVG filters or pre-process.

**Treatment 3 — Graded full colour (Mars/Earth chapter heroes):**
```css
filter: contrast(0.95) saturate(0.85) brightness(0.92) sepia(0.05);
```

### 5.3 SPICE wordmark and glyph

Glyph: three lines colliding at a circle.
- **Monochrome variant** (default): all lines and circle in `C.txt`
- **Functional variant** (legacy data-viz): two lines in `C.txt`, one in a status colour, circle in status colour. Reserved for places where the glyph is acting as a data marker, not as a brand.

Wordmark: "SPICE" in IBM Plex Mono 600, `0.24em` tracking, uppercase.

**Ticker: `SPICE`.** Not `SPC`, not `ZPC`. Ticker and brand are the same string. ZPC is retired.

---

## 6. Copy & Positioning

### 6.1 Master tagline

Homepage hero h1:

> **A frontier hedge for the failure mode of fiat itself.**

"of fiat itself" sits at `#ede5d4` (subordinate); rest at `#ffffff` (pure white).

### 6.2 Act II positioning — fixed

Mars Colony Economy single positioning line:

> **Capitalist UBI. No tax. No welfare. Every citizen a shareholder.**

Used identically on:
- Homepage Act II dispatch tile (h4)
- `/mars` page hero (headline)
- Substack tagline for any Mars-themed post
- YouTube video opener for any Mars-themed video

**Do not vary it.** Consistency across surfaces is what gives a tagline force.

Supporting paragraph for the dispatch tile:
> A working post-scarcity simulation. Sixty-six citizens, one hundred and sixty robots, an automated Fisc — and the economic model that survives AI displacement.

### 6.3 Tone rules

Carry forward from `CLAUDE.md`:
- No marketing language, no exclamation marks
- No "revolutionary," "powerful," "game-changing"
- Data first, claims second
- One-line declarative over paragraph-of-context

New additions:
- Use terminal/operations register: "telemetry," "dispatches," "field reports," "system nominal," "sync"
- Avoid "platform," "ecosystem," "solutions," "stakeholder"

---

## 7. Mobile / Responsive

Single breakpoint at **1000px**.

Below 1000px:
- Two-column main grid → single column. Right rail stacks below left.
- 4-column telemetry → 2 columns
- 3-column threat vectors → single column
- 3-column dispatches → single column
- Top bar nav → hidden (hamburger comes in a later phase, not v1)
- Top bar status text → hidden (keep only pulse dot and wallet button)
- Footer → vertical stack

Below 600px (no breakpoint, but tested):
- Hero h1 scales via `clamp(30px, 4vw, 52px)` — already handles it
- Ticker tape height drops to 32px

iPad portrait (~768px) sits below 1000px breakpoint — single column. iPad landscape (~1024px) above — two-column. Intentional.

---

## 8. iOS App

Native iOS app mirrors the design system using SwiftUI.

### 8.1 Design tokens (`Colors.swift`)

```swift
extension Color {
    static let spiceBg       = Color(red: 0.024, green: 0.027, blue: 0.039)  // #06070a
    static let spicePanel    = Color(red: 0.051, green: 0.059, blue: 0.071)  // #0d0f12
    static let spiceLine     = Color(red: 0.137, green: 0.157, blue: 0.192)  // #232831
    static let spiceTxt      = Color(red: 0.929, green: 0.898, blue: 0.831)  // #ede5d4
    static let spiceTxt2     = Color(red: 0.847, green: 0.812, blue: 0.729)  // #d8cfba
    static let spiceDim      = Color(red: 0.722, green: 0.690, blue: 0.627)  // #b8b0a0
    static let spiceFaint    = Color(red: 0.541, green: 0.506, blue: 0.439)  // #8a8170
    static let spiceOk       = Color(red: 0.365, green: 0.827, blue: 0.620)  // #5dd39e
    static let spiceWarn     = Color(red: 0.831, green: 0.627, blue: 0.290)  // #d4a04a
    static let spiceCrit     = Color(red: 0.937, green: 0.267, blue: 0.267)  // #ef4444
}
```

### 8.2 Typography

Bundle IBM Plex Mono (Regular 400, Medium 500, SemiBold 600, Bold 700). Register in `Info.plist`. Define text style modifiers:

```swift
extension Text {
    func spiceHeadline() -> some View {
        self.font(.custom("IBMPlexMono-Bold", size: 32))
            .foregroundColor(.white)
            .tracking(-0.5)
    }
    func spiceLabel() -> some View {
        self.font(.custom("IBMPlexMono-Regular", size: 10))
            .foregroundColor(.spiceDim)
            .tracking(2.0)
            .textCase(.uppercase)
    }
}
```

### 8.3 Components to build

Mirror the web library:
- `TopBarView`
- `TickerTapeView` — `TimelineView` driving horizontal scroll
- `TelemetryGridView` — `LazyVGrid`, two columns (mobile-native, no 4-col phase)
- `ThreatVectorCardView` — corner brackets via `Path` overlays
- `DispatchTileView` — image + body, treated via `colorMultiply`/`saturation`
- `VaultStatusPanelView`
- `HoldingsBarView` — `HStack` of greyscale rectangles
- `EventLogView` — `List` with custom row styling

### 8.4 Behaviour

- Force dark mode: `.preferredColorScheme(.dark)` at root
- Override `accentColor` to `.spiceTxt` (no system blue)
- No rounded corners on cards or buttons
- No SF Symbols where literal text would do — brand is plain-text-first

### 8.5 Scope for v1

Read-only. Mirror what `/dashboard` shows on web: NAV, TVL, holdings, telemetry, event log. Wallet connect via WalletConnect SDK comes in a later phase.

---

## 9. What Stays vs What Changes

### Stays unchanged
- `chart3-simulation.jsx` — simulation engine and KPI logic. Only chrome around it changes.
- All recharts gotchas in `CLAUDE.md` "Recharts — Critical Rules" section. Keep them.
- Simulation chart colours (purple unemployment, blue inflation, yellow yield, green labour) — semantic data colours, separate from brand status colours.
- Methodology citations and methodology HTML page content. Visual chrome only.
- All on-chain integration via ethers.js v6.
- All smart contracts on Base Sepolia.
- Existing route structure (`/`, `/collision`, `/simulation`, `/dashboard`, `/spice-methodology.html`).

### Changes
- All tokens in `CLAUDE.md` "Design System" section replaced by §2 of this document. **Update `CLAUDE.md` accordingly.**
- `Home.jsx` rewritten. `docs/visual-reference.html` is the canonical structural reference.
- `Collision.jsx`, `Dashboard.jsx`, simulation chrome — token migration.
- New routes: `/mars` (Act II), `/earth-blueprint` (Act III placeholder).
- Footer everywhere updates to new pattern.
- Top nav order: **Home · Thesis · Telemetry · Mars · Earth · Methodology**. (`Telemetry` is the new label for `/simulation`; `Thesis` replaces `The Collision` for brevity.)

### Retired
- ZPC as a ticker. Ticker is now SPICE.
- Gold accent `#B8860B` as brand colour. (Survives only inside chart panels where it's an existing data colour.)
- White page backgrounds.
- Sans-serif anywhere on protocol pages.

---

## 10. Migration Plan

Work in this order. Do not skip ahead.

### Phase 1 — Token foundation (1 PR)
- Add `src/tokens.js` with §2 values
- Update `CLAUDE.md` design-system section to point at this doc
- Replace `body` background and base text colour in entry HTML and root `App.jsx`
- Verify existing pages still render — they will look broken in places, that's expected

**Done when:** `tokens.js` exists, `CLAUDE.md` updated, app boots without crashing on the new background.

### Phase 2 — Component library (1–2 PRs)
- Build all components in §3 in `src/components/spice/`
- Add `/_components` route showing every component in isolation

**Done when:** all thirteen components present and rendered on the components route.

### Phase 3 — Homepage replacement (1 PR)
- Replace `Home.jsx` with new layout from §4.1
- Use placeholder data for telemetry/ticker/vault/log — wired in Phase 5
- Dispatches strip uses CSS-gradient placeholders for images

**Done when:** new homepage live at `/`, visually matches `docs/visual-reference.html` on desktop and mobile.

### Phase 4 — Existing pages migrated (1 PR)
- Apply tokens to `/collision`, `/simulation`, `/dashboard`, `/methodology`
- No structural changes, no chart-colour changes

**Done when:** all four pages render in new ramp without visual regressions.

### Phase 5 — Live data wiring (1 PR)
- Wire telemetry from FRED + on-chain feeds
- Wire ticker from same source
- Wire vault status and event log from on-chain data

**Done when:** homepage components show live data; dashboard is the data source of truth, homepage subscribes.

### Phase 6 — Mars page (1 PR)
- Build `/mars` per §4.6
- Embed/link existing Mars React dashboard
- Hero uses Treatment 3 on colony image

**Done when:** `/mars` live, headline reads exactly the line in §6.2, simulation embedded.

### Phase 7 — iOS app v1 (separate workstream)
Standalone — does not block web work. See §8.

### Phase 8 — Polish
- Hamburger nav for mobile
- `/earth-blueprint` page when content ready
- Subscriber/email capture, only if needed

---

## 11. Standing Rules for Claude Code

These extend the rules in `CLAUDE.md`:

1. **Always follow `docs/visual-reference.html`.** If this spec is silent, the HTML answers it.
2. **Inline styles only.** No CSS files, no Tailwind, no styled-components. Pattern: `const S = { container: { ... } }; <div style={S.container}>`.
3. **No new dependencies** without flagging first.
4. **Square corners everywhere.** No `borderRadius` anywhere except status pulse dots (which are circles).
5. **No emoji as UI.** No 🚀, no 💰. Closest the brand gets is `●` in footer status.
6. **No marketing language.** Data first, claims second.
7. **Status colours are data colours.** Never use `ok`, `warn`, `crit` for headings, body text, or chrome.
8. **Hard-code `#06070a` on hero panels.** Do not rely on CSS variable inheritance for the hero background — iPad/Safari accessibility can override CSS variables.
9. **Show proposed changes before applying them**, especially for any structural edit affecting more than one component.
10. **Commit message format unchanged:** `[area] brief description`, e.g. `[homepage] add dispatches strip`.
11. **Use the exact component names in §3.** No `Header` instead of `TopBar`, no `Card` instead of `ThreatVector`.
12. **Update `CLAUDE.md`** at the end of each phase to reflect new file locations and any newly-discovered constraints.

---

**End of redesign specification.**
