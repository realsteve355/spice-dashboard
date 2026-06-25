# AXION Brand Spec — Addendum: The MOND Currency Symbol

**This addendum extends `AXION_BRAND_SPEC.md`. Read the main spec first.**

## What it is

MOND has a dedicated currency symbol: a stylised M with a vertical strike through the centre, in the design family of $, £, €, ₿. The mark is used inline before any numeric MOND amount, exactly the way $ is used before a USD amount.

Visual shorthand from here: **Ɱ** (when referring to the symbol in prose). The actual rendered mark is the SVG, not the Unicode character — Unicode Ɱ (U+2C6E “Latin Capital Letter M with Hook”) is a rough approximation but its glyph varies wildly across fonts. Always use the SVG component, never the Unicode character.

## Files delivered

```
public/brand/mond-symbol.svg              ← canonical SVG, currentColor
src/components/MondSymbol.jsx             ← React component, auto-sizes stroke
```

The SVG uses `currentColor` for stroke, so it inherits text color from its parent element. The component handles stroke-weight scaling automatically — heavier strokes at small sizes, lighter at large sizes — so the symbol reads correctly whether it appears at 13px in a ledger row or 56px in a hero block.

## When to use the symbol vs. spell out “MOND”

**Use the symbol Ɱ when there is a number directly attached.**

- Prices: `Ɱ 2,500`
- Balances: `Balance: Ɱ 12,847.30`
- Transaction amounts: `+Ɱ 38.20`
- Data labels next to numbers: `Supply: Ɱ 847,291`
- Parity displays: `Ɱ 1 = 1.0000 USDC`

**Spell out “MOND” (always uppercase) when referring to the token as a concept.**

- In prose: “Citizens receive MOND through share dividends.”
- In nav labels: `MOND` (the menu item linking to the token page)
- In hero headlines: “Modified Newtonian dynamics, in monetary form.”
- In documentation: “The MOND token is non-tradeable outside the colony.”
- In smart contract identifiers and code: `MOND` (string), never the symbol

**Never use both together.** Write `Ɱ 2,500` OR `2,500 MOND`, never `Ɱ 2,500 MOND` — that’s the equivalent of writing `$2,500 USD` which is redundant.

## Placement and spacing

Place the symbol **before** the number, with a thin space between them (4–6px in CSS, achievable via `gap: 4px` on a flex container).

```jsx
<span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
  <MondSymbol size={22} />
  2,500
</span>
```

Do not place the symbol after the number except in tabular display where right-alignment is essential and the entire column is monospaced. Even then, prefer left-symbol placement; right-align the digits, not the symbol.

For credit/debit displays (transaction ledger), the +/− sign comes **before** the symbol:

```
+Ɱ 38.20    ← correct
Ɱ +38.20    ← incorrect
```

## Vertical alignment

The symbol is square (100×100 viewBox) so its baseline differs from the digit baseline of most fonts. The component applies `vertical-align: middle` by default. When pairing with IBM Plex Mono digits, a small `transform: translateY(2px)` on the symbol’s parent often improves visual baseline alignment — see usage examples below.

## Color rules

- **On light surfaces** (paper `#F6F2E9`): symbol uses `letterDark` (`#0A0A0A`)
- **On dark surfaces** (ink `#0A0A0A`): symbol uses `letterLight` (`#F0EDE6`)
- **In credit-positive transaction displays**: symbol can take an accent green (`#2D6E3F`)
- **In debit-negative displays**: symbol stays default text color, NOT a red accent — the minus sign carries the negation

The component inherits `currentColor` by default, so passing color usually means setting `color` on a parent CSS rule rather than passing it explicitly.

## Code examples

### Inline in a hero price block

```jsx
import MondSymbol from './components/MondSymbol';
import theme from './theme';

<div style={{
  fontFamily: theme.fonts.mono,
  fontWeight: theme.fontWeights.medium,
  fontSize: '56px',
  letterSpacing: '-0.018em',
  color: theme.colors.letterDark,
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '4px',
}}>
  <span style={{ display: 'inline-flex', alignItems: 'center', transform: 'translateY(2px)' }}>
    <MondSymbol size={44} />
  </span>
  2,500
  <span style={{ opacity: 0.5, fontSize: '0.6em', marginLeft: '6px' }}>.00</span>
</div>
```

### Inline in body copy

```jsx
<p style={{ fontFamily: theme.fonts.sans, fontSize: '15px', lineHeight: 1.7 }}>
  A monthly citizen dividend of{' '}
  <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: '-2px' }}>
    <MondSymbol size={13} />
  </span>
  {' '}2,500 clears comfortable life inside any colony.
</p>
```

### In a transaction ledger row

```jsx
<div style={{
  fontFamily: theme.fonts.mono,
  fontSize: '13.5px',
  fontWeight: theme.fontWeights.medium,
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '3px',
  color: isCredit ? '#2D6E3F' : theme.colors.letterDark,
}}>
  {isCredit ? '+' : '−'}
  <span style={{ display: 'inline-flex', alignItems: 'center', transform: 'translateY(2px)' }}>
    <MondSymbol size={13} />
  </span>
  {amount.toFixed(2)}
</div>
```

### As a standalone mark (rare — favicon, badge, etc.)

```jsx
<MondSymbol size={48} color="#0A0A0A" />
```

## Size guidance for stroke weight

The component handles this automatically, but for reference:

|Display size|Stroke width (viewBox units)|Context                       |
|------------|----------------------------|------------------------------|
|≤ 14px      |11                          |Body copy, micro labels       |
|15–20px     |9                           |Small data, badges            |
|21–32px     |7                           |Dashboard tiles, table headers|
|33–56px     |6                           |Hero prices, marketing copy   |
|≥ 57px      |5                           |Standalone showcase           |

If you ever need to override the stroke weight, pass it as an SVG prop (`strokeWidth={9}`) which will override the component’s default.

## Accessibility

The component includes `role="img"` and `aria-label="MOND"`, so screen readers announce the symbol as “MOND” rather than reading it as a graphic with no label. This means `<MondSymbol /> 2,500` is read aloud as “MOND 2,500” — the same way “$2,500” is read as “dollars 2,500” or “2,500 dollars” depending on the screen reader.

If the symbol appears in a context where it’d be announced redundantly (e.g. the surrounding text already says “MOND”), pass `aria-hidden="true"`:

```jsx
<p>You received <MondSymbol size={13} aria-hidden="true" /> 2,500 MOND this month.</p>
```

## Favicon and app icon

The MOND symbol is a candidate for the favicon and PWA app icon, since it’s the most compact and recognisable mark in the brand system. Generate the favicon set from `mond-symbol.svg`:

- `favicon.ico` (16×16, 32×32, 48×48)
- `apple-touch-icon.png` (180×180)
- `icon-192.png` and `icon-512.png` for PWA manifest

For the favicon, use stroke-width 11 (the smallest-size default) and render against a transparent or paper-tone background. Test that it’s recognisable at 16×16 in a browser tab.

## What NOT to do

1. **Don’t use the symbol decoratively.** It’s a currency mark, not a brand logo. The AXION wordmark is the brand mark; the MOND symbol is the unit of account symbol. Don’t put it on a t-shirt, in a hero section alone, or as a watermark.
1. **Don’t pair it with currencies other than MOND.** No `Ɱ 2,500 / £ 1,800` comparisons. If you need to show a USDC equivalent, use the parity line: `Ɱ 1 = 1.0000 USDC`.
1. **Don’t use the Unicode character (Ɱ U+2C6E).** It varies too much across fonts. Always use the SVG.
1. **Don’t put it inside the AXION wordmark.** The wordmark and the currency symbol are separate brand assets.
1. **Don’t animate it.** It’s a typographic mark; it sits still.

-----

*End of addendum.*
*Append to or read alongside `AXION_BRAND_SPEC.md`.*