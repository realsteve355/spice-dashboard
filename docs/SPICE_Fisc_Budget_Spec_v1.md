# SPICE Protocol — Fisc Website: Standard Citizen Budget Page
## Technical Specification v1.0 — Claude Code Handoff

| Field | Value |
|---|---|
| Colony | Millbrook, Ohio (8,000 residents) |
| URL | `/budget` on the Fisc website |
| Stack | React / TypeScript / Base L2 / existing `spice-dashboard` repo |
| Status | Ready for implementation |

---

## 1. Purpose

The Standard Citizen Budget page is the canonical published record of what the MCC charges each resident per month, and the derivation of the UBI level, Fisc exchange rate, and bread basket price from those charges. It is the primary transparency mechanism for MCC billing decisions.

**Citizens** read it to understand their monthly bill and the economic basis of the UBI they receive. It is read-only for all citizens.

**The MCC CEO** edits it to publish changes to the bill structure. Changes take effect from the next period. Changes exceeding 20% of total in 12 months trigger a citizen vote before taking effect.

---

## 2. Access Levels

### Citizen (unauthenticated or wallet-authenticated)
- Read-only. Cannot interact with any inputs.
- Sees the currently published budget with version number and effective date.
- If wallet connected: sees personal bill derived from published budget, adjusted for housing status.

### MCC CEO (wallet-authenticated)
- Full edit access to all line items, bread price anchor, and SPICE labour discount.
- Sees draft state — changes are not visible to citizens until explicitly published.
- Publish button triggers on-chain governance event.
- Sees audit trail of all previous published versions.

### Authentication Implementation

Wallet-based. The MCC CEO wallet address is stored as a constant in the Fisc contract.

```typescript
// useRole.ts
const MCC_CEO_ADDRESS = import.meta.env.VITE_MCC_CEO_ADDRESS;
const isCEO = connectedWallet?.toLowerCase() === MCC_CEO_ADDRESS?.toLowerCase();
// For development: role toggle button in top-right corner
```

---

## 3. Data Model

```typescript
interface BudgetLine {
  id:              string;
  category:        'MCC' | 'Essential' | 'Discretionary' | 'Savings';
  name:            string;
  description:     string;        // one sentence shown to citizens
  sTokenAmount:    number;        // integer — no decimals
  dollarReference: number;        // Ohio dollar equivalent today
  spiceDiscount:   number;        // % cheaper due to UBI labour subsidy
  isOptional:      boolean;       // e.g. colony housing — not universal
  autoDeducted:    boolean;       // MCC lines deducted at period start
  active:          boolean;       // inactive lines show as 0 to citizens
}

interface PublishedBudget {
  version:             number;    // increments on each publish
  publishedAt:         string;    // ISO timestamp
  publishedBy:         string;    // MCC CEO wallet address
  effectiveFrom:       string;    // first period this applies
  breadPriceS:         number;    // S-tokens per standard loaf (anchor)
  spiceLabourDiscount: number;    // % avg labour cost reduction in colony
  lines:               BudgetLine[];
}
```

### Derived Numbers (computed, not stored)

```typescript
// useBudget.ts — computed from PublishedBudget

const OHIO_BREAD_REF = 2.80;  // $ real Ohio bread price reference

const totalMCC   = lines.filter(l => l.category === 'MCC' && l.active)
                        .reduce((s, l) => s + l.sTokenAmount, 0);
const totalEss   = lines.filter(l => l.category === 'Essential' && l.active)
                        .reduce((s, l) => s + l.sTokenAmount, 0);
const totalDisc  = lines.filter(l => l.category === 'Discretionary' && l.active)
                        .reduce((s, l) => s + l.sTokenAmount, 0);
const totalSave  = lines.filter(l => l.category === 'Savings' && l.active)
                        .reduce((s, l) => s + l.sTokenAmount, 0);
const totalUBI   = totalMCC + totalEss + totalDisc + totalSave;

const spiceBreadUSD   = OHIO_BREAD_REF * (1 - spiceLabourDiscount / 100);
const impliedFiscRate = spiceBreadUSD / breadPriceS;  // $ per S-token
const ubiUSD          = totalUBI * impliedFiscRate;

// Split percentages
const pctMCC   = totalMCC  / totalUBI * 100;
const pctEss   = totalEss  / totalUBI * 100;
const pctDisc  = totalDisc / totalUBI * 100;
const pctSave  = totalSave / totalUBI * 100;

// Consistency checks (used in CEO panel and system status)
const rateOK  = impliedFiscRate >= 0.30 && impliedFiscRate <= 1.20;
const ubiOK   = ubiUSD >= 300 && ubiUSD <= 1500;
const splitOK = Math.abs(pctSave - 20) < 5;
```

---

## 4. Budget Line Items — Founding Defaults

### Category: MCC (auto-deducted at period start)

| ID | Name | Default S | Dollar ref | SPICE disc | Auto | Optional |
|---|---|---|---|---|---|---|
| elec | Electricity | 90 | $120 | 25% | Yes | No |
| water | Water & Sewage | 50 | $65 | 20% | Yes | No |
| waste | Waste & Recycling | 25 | $30 | 15% | Yes | No |
| broad | Broadband | 45 | $60 | 20% | Yes | No |
| ems | Roads / Fire / EMS | 40 | $55 | 30% | Yes | No |
| housing | Colony Housing | 100 | $750 | 87% | Yes | Yes |

> **Colony Housing note:** applies only to residents in MCC-provided accommodation. Residents with external housing (owned or privately rented — external USDC cost) have this line at 0S. Housing status is registered in the resident registry. The MCC CEO sets the per-unit amount based on actual MCC provision cost.

### Category: Essential (guidance allocation — not auto-deducted)

| ID | Name | Default S | Dollar ref | SPICE disc | Notes |
|---|---|---|---|---|---|
| grocery | Groceries & household | 280 | $420 | 30% | UBI subsidises retail labour |
| care | Personal care | 60 | $75 | 15% | Hair, pharmacy, basics |
| health | Healthcare co-pay | 90 | $120 | 20% | MCC covers base; supplementary |
| transport | Local transport | 40 | $65 | 35% | Bus, bike share — staff on UBI |
| edu | Education / childcare | 65 | $90 | 25% | Shared facility; staff on UBI |

### Category: Discretionary (guidance allocation — not auto-deducted)

| ID | Name | Default S | Dollar ref | SPICE disc | Notes |
|---|---|---|---|---|---|
| dining | Local dining & cafes | 100 | $160 | 35% | Kitchen labour on UBI baseline |
| entertain | Entertainment & social | 60 | $80 | 20% | Cinema, events, sports |
| nonessential | Non-essential goods | 80 | $100 | 10% | Clothing, gifts, hobbies |

### Category: Savings

| ID | Name | Default S | Notes |
|---|---|---|---|
| savings | S→V conversion | 110 | Target ~20% of UBI. Citizen-controlled. Converts to permanent V-tokens before period burn. |

---

## 5. Page Layout — Citizen View (Read-Only)

### 5.1 Header
- Colony name and SPICE logo
- Page title: **Standard Monthly Citizen Budget**
- Version number, effective date, published by: `[MCC CEO wallet, truncated to 0x1234…abcd]`
- Status badge: `PUBLISHED` (green) or `PENDING VOTE` (amber — if spike >20% triggered)

### 5.2 Three-Number Panel *(most prominent element on the page)*

Three boxes side by side. Always visible, always live-computed from current published budget.

| UBI | Fisc Rate | UBI Value |
|---|---|---|
| `[totalUBI] S/month` | `$[impliedFiscRate]/S` | `$[ubiUSD]/month` |

Caption beneath: *"These three numbers are mathematically linked. The Fisc publishes the rate daily. The UBI level is set by the MCC CEO. The bread basket price is the anchor the Fisc defends."*

### 5.3 Budget Breakdown Table

- One table grouped by category with shaded category subtotal rows
- Columns: **Service** | **What it covers** | **S-tokens/month** | **Dollar reference** | **SPICE saving**
- No inputs. No sliders. Clean read-only display.
- Colony housing row: if citizen has external housing status, shows `0S` and note *"external accommodation — see your MCC housing arrangement"*
- Grand total row: **Total UBI = `[totalUBI]` S/month**

### 5.4 Split Bar

Horizontal percentage bar divided into four colour bands:

- MCC (blue) | Essential (green) | Discretionary (orange) | Savings (purple)
- Percentage label inside each band if width >5%
- Ghost markers showing target percentages: 25 / 35 / 20 / 20

### 5.5 Personal Bill Panel *(wallet connected only)*

Heading: **Your Monthly Bill**

- Lists auto-deducted MCC items for this citizen (housing line shows 0S if external accommodation)
- Total S-tokens auto-deducted at period start
- Remaining UBI available after deductions
- Suggested S→V savings conversion this period

### 5.6 Governance Note *(fixed text at page bottom)*

> *"The MCC CEO may adjust this budget. Any increase exceeding 20% of total in a 12-month period automatically triggers a colony-wide citizen vote before taking effect. All changes are published on-chain with a full audit trail. Last 12-month change: [X]%."*

---

## 6. Page Layout — MCC CEO View (Edit Mode)

Same as citizen view with the following additions and modifications.

### 6.1 Edit Mode Banner
Amber full-width banner beneath header:
> **DRAFT MODE — changes are not visible to citizens until published**

### 6.2 Editable Fields

- Each line item's S-token amount: integer input (min 0, max 999). No decimals permitted.
- Dollar reference: editable number field (display/reference only — not functional)
- SPICE discount: editable integer field 0–50% (display/reference only)
- Description: editable single-line text field
- `breadPriceS`: integer input (1–20). Updates three-number panel live on change.
- `spiceLabourDiscount`: integer input (0–50%). Updates three-number panel live on change.

### 6.3 Add / Remove Lines

- CEO can add new line items: must choose category, enter name, description, S-amount
- CEO can mark lines as inactive — inactive lines display as `0S` with greyed style to citizens
- Core MCC lines (`elec`, `water`, `waste`, `broad`, `ems`) cannot be deleted, only set inactive
- CEO cannot set all MCC lines to inactive simultaneously (system integrity check)

### 6.4 Running Consistency Panel *(sticky sidebar or fixed panel)*

Live-updating on every edit:

- Draft total vs last published total
- Percentage change from published — amber if >15%, red if >20%
- Three indicators: **Rate OK** | **UBI OK** | **Split OK** — green / amber / red
- Warning if any MCC category sums to zero
- Split bar updates live

### 6.5 Spike Warning

If draft total would exceed the lowest published total in the trailing 12 months by >20%:

Full-width red block above the publish button:
> **⚠ This change exceeds the 20% annual spike limit. Publishing will automatically trigger a citizen vote. The new budget will not take effect until the vote passes. Citizens will be notified on-chain.**

### 6.6 Publish Button

- **Disabled** if: any consistency check fails, or draft equals published (no changes)
- On click: confirmation modal showing:
  - Summary of changed lines (name | previous S | new S | diff)
  - Effective date: first day of next period (next calendar month)
  - Spike warning block if applicable
- **Confirm** → publishes to chain → emits governance event
- **Cancel** → returns to draft, no change

### 6.7 Audit Trail *(below main form)*

Table of all previous published versions:

Columns: **Version** | **Published** | **By** | **Total S** | **Change from prior**

Each row expandable to full line-item diff: name | previous S | new S | delta.

---

## 7. Governance Events (On-Chain)

```
BUDGET_PUBLISHED
  version:          number
  effectiveFrom:    string    // ISO date — first day of next period
  totalS:           number
  changeFromPrior:  number    // %
  publishedBy:      string    // MCC CEO wallet address

BUDGET_VOTE_REQUIRED
  version:          number
  proposedTotalS:   number
  currentTotalS:    number
  changePct:        number
  voteDeadline:     string    // 30 days from emit

BUDGET_VOTE_PASSED
  version:          number
  effectiveFrom:    string

BUDGET_VOTE_FAILED
  version:          number
  // draft discarded — current budget remains in force
```

---

## 8. File Structure

```
src/
  pages/
    Budget.tsx                   // main page — role-aware render (citizen vs CEO)
  components/
    BudgetTable.tsx              // line item table, citizen and CEO views
    BudgetEditor.tsx             // CEO edit controls overlay
    ThreeNumberPanel.tsx         // UBI / rate / USD value — always visible
    SplitBar.tsx                 // category percentage bar with ghost targets
    ConsistencyPanel.tsx         // CEO-only live consistency checks
    SpikeWarning.tsx             // CEO-only >20% red alert block
    PublishModal.tsx             // confirmation modal with diff summary
    AuditTrail.tsx               // version history table with expandable diffs
    PersonalBillPanel.tsx        // citizen wallet-connected personal bill
  hooks/
    useBudget.ts                 // fetch published + draft, all derived calculations
    useRole.ts                   // wallet auth + CEO role resolution
    useBudgetDraft.ts            // CEO draft state management + dirty tracking
  constants/
    budgetDefaults.ts            // founding default line items (this spec)
```

---

## 9. Key Invariants to Test

**Token conservation**
`totalUBI === sum(all active line items)` must hold exactly after every edit. All values are integers. No rounding at any point.

**Three-number consistency**
`impliedFiscRate = spiceBreadUSD / breadPriceS` and `ubiUSD = totalUBI * impliedFiscRate`. These must be recomputed on every change, never independently cached.

**Spike calculation**
The 20% threshold compares draft total against the **lowest** published total in the trailing 12 months, not just the immediately prior version.

**Colony housing**
A citizen with `housingStatus === 'external'` must see `0S` for the housing line in their Personal Bill Panel, even if the published housing line amount is `> 0`.

**Draft isolation**
CEO draft state must never appear in the citizen view, even in the same browser session.

**Publish atomicity**
Either the full draft publishes (all lines, bread price, discount) or nothing publishes. No partial state.

---

## 10. Integration Points

### Reads from
- `getPublishedBudget()` → `PublishedBudget`
- `getDraftBudget()` → `PublishedBudget | null`  *(CEO only)*
- `getResidentHousingStatus(walletAddress)` → `'colony' | 'external'`
- `getBudgetVersionHistory()` → `PublishedBudget[]`
- `getTrailing12MonthLowest()` → `number`  *(S-token total — for spike check)*

### Writes (CEO only)
- `saveDraft(lines, breadPriceS, spiceLabourDiscount)` — persists draft, not yet visible
- `publishBudget()` → emits `BUDGET_PUBLISHED` or `BUDGET_VOTE_REQUIRED` on-chain

---

## 11. Mars / Earth Compatibility Note

This page does not exist in the Mars simulation. For Earth deployment it is the live equivalent of the `simulate.py` MCC billing section. The `BudgetLine[]` data model is structurally compatible with the Mars MCC billing categories and can be mapped directly when Earth and Mars are integrated in the codebase.

---

*SPICE Protocol — Fisc Budget Page Spec v1.0 | Millbrook, Ohio | Claude Code handoff*
