# SPICE [ZPC] - Claude Code Configuration

## Project Overview

SPICE is a crypto-native macro hedge protocol - a smart contract vault holding hard assets, crisis-resilient positions, and AI infrastructure exposure, represented by the ZPC token.

**Status:** Prototype/demo phase - building working proof-of-concept to attract technical co-founder

**Live Demo:** https://zpc.finance (React/Vite on Vercel, Base Sepolia testnet)

## Core Thesis (Summary)

**The Great Collision:** AI-driven deflation vs. government need for inflation to resolve unsustainable sovereign debt. Resolution = financial repression, currency debasement, capital controls. Timeline: 3-5 years, gradually then all at once.

**SPICE Response:** Crypto-native vault outside fiat infrastructure. Bitcoin-denominated, fully on-chain, capital control resistant.

**Asset Basket:** Bitcoin (30-40%), Tokenised Gold (20-25%), Short Long-Dated Bonds (15-20%), AI Infrastructure (10-15%), Commodities (5-10%)

## Current Tech Stack

### Frontend
- **Framework:** React 18.3 + Vite 6.0
- **Routing:** React Router v7.1.1  
- **Blockchain:** ethers.js v6.13.5
- **Styling:** Pure CSS (white theme: `#FFFFFF` bg, `#000000` text, `#E0E0E0` borders)
- **Deployment:** Vercel (auto-deploy from GitHub)

### Smart Contracts (Base Sepolia Testnet)
- **MockWBTC:** `0x9639915dB85ee83f3C1ed88AaC3BCb2E2104B70b`
- **IRONToken:** `0x5C06fB67f24e06A7234a777F9220e083d2684976`  
- **SPICEVault:** `0x0fCf6F860927c6cd94e974E7B9BfAb440E2b1FeE`

### Site Structure
- **Home:** `/` - Landing page
- **The Collision:** `/collision` - Interactive macro thesis visualisation  
- **Dashboard:** `/dashboard` - Vault stats and investor interface

## Project Documentation (CRITICAL - READ THESE)

All strategic documents are in `/docs` - **Claude Code CAN read these**:

1. **SPICE_Project_Brief_v1.md** - Master context document (15KB)
2. **SPICE_Pitch_v1.md** - Investor/partner pitch (12KB)
3. **SPICE_Product_Decisions.md** - Design decisions with rationale (53KB - 867 lines!)
4. **SPICE_Macro_Thesis_v2.md** - Full macro thesis (66KB - 30+ pages)
5. **SPICE_Investment_Strategy_v4.md** - Asset analysis and portfolio construction (34KB)
6. **SPICE_Legal_Architecture_v1.md** - Regulatory positioning (49KB)
7. **SPICE_Technical_Requirements_v4.md** - Smart contract architecture (45KB)
8. **SPICECode.txt** - Current contract code (23KB)

**When working on any feature, first check the relevant doc file** - e.g., for vault mechanics, read Product_Decisions.md; for asset selection, read Investment_Strategy_v4.md.

## Key Architecture Decisions

### Design Principles

**Visual Identity:**
- Clean white aesthetic: Professional, not flashy crypto
- Minimal ornamentation: Content over decoration  
- Serious tone: This is macro analysis, not meme coins
- Typography: Clear hierarchy, readable at all sizes

**Narrative Differentiation:**
- "SPICE passes the zombie apocalypse test - Bitcoin doesn't" (belief vs. real holdings)
- Three-layer legal separation for communications:
  - Layer 1: YouTube macro thesis content (no investment product mention)
  - Layer 2: Substack portfolio disclosure (Investors Chronicle model)  
  - Layer 3: Geoblocked offshore fund
- Conventional hedges (TIPS, VIX, gold ETFs) fail in structural crises - only work for cyclical downturns

**Critical Don'ts:**
- ❌ NAV-floor redemptions in Phase 2 (would cause bank runs)
- ❌ Conflating communications layers (regulatory risk)
- ❌ Assuming AI outputs are correct without verification (Steve challenges conventional wisdom)

### The Collision Model (Advanced Component)

- Lives in `public/collision.html` (served via iframe)
- Dual economy visualisation with crisis timeline
- Interactive sliders: Gini coefficient, crypto adoption, yield curve control
- Policy analysis tab with colour-coded KPI danger levels
- **Recently recovered from being lost** - now updated to white theme

## Technical Constraints

### Blockchain
- **Base Sepolia only** (for now - mainnet TBD)
- Chainlink price feeds (primary), Pyth/RedStone (backup oracles)
- Remix IDE for contract development
- Blockscout/Sourcify for verification

### Security
- **Audit targets:** Cyfrin or Hacken (staged approach)
- No mainnet deployment without audit
- Test all oracle failover scenarios

## Development Environment

### Local Setup
- **Path:** `C:\Users\user\OneDrive\Documents\Crypto\spice-dashboard`
- **Node:** Managed via nvm-windows
- **Editor:** VS Code (but you're using terminal now!)
- **OS:** Windows 11

### Common Commands
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
vercel --prod        # Manual production deploy
git add .
git commit -m "message"
git push             # Should auto-deploy via Vercel
```

## Workflow Changes from Claude.ai

**OLD workflow (with Claude.ai):**
1. Claude generates files
2. Creates .zip with batch script (`copy /Y`)
3. Extract, run script
4. Close ALL VS Code tabs without saving (`Ctrl+K W`)
5. Reopen from tree (VS Code caches in memory)
6. Manually commit

**NEW workflow (with Claude Code - YOU):**
1. Direct file editing - no batch scripts!
2. You run `npm run dev` to test
3. You commit directly to Git
4. You push to trigger Vercel deploy

## Current Priorities

1. **Fix Vercel auto-deploy** (want reliable repeatable process, not workarounds)
2. **Complete dashboard functionality** (load public data without wallet connection)
3. **Attract technical co-founder** (demo is the primary tool)

## Long-term Vision

**Phase 1 (IRON):** Open-ended vault, ETF-like operation  
**Phase 2 (SPICE):** Closed-ended trust when crisis indicators trigger, secondary-market-only liquidity

**Trigger conditions:** Sovereign bond break, sustained yield curve inversion, capital control implementation, or defined AUM milestone

## Learnings & Patterns

### What Works
- **Working demo beats docs** for co-founder recruitment
- **Iterative refinement** across long multi-session builds
- **Professional tools** over simple alternatives (React vs. static HTML)
- **Upfront workflow investment** pays off at high iteration volume

### What Doesn't Work
- Assuming conventional hedge instruments work in structural crises
- Copy-pasting between two Claudes with no shared context
- VS Code cached file states after batch updates (no longer relevant with Claude Code!)

## Communication Style Preferences

Steve prefers:
- **Methodical risk-aware decision-making** - complete clarity before committing
- **Critical challenge of AI outputs** - pushes back on conventional wisdom
- **Professional quality** - DaVinci Resolve for video, not shortcuts
- **Document versioning** - Word track changes for markup
- **Anticipating iteration** - builds repeatable processes upfront

## Graphics Assets Created
- Stick-figure zombie bank scene (SVG)
- "Great Collision" economic forces diagram (SVG)

Both available for reuse/refinement in the codebase.

---

**Last Updated:** March 2026  
**Project Phase:** Pre-technical co-founder milestone  
**Founder:** UK-based, pre-revenue, technical/management background, newer to crypto tech specifics

**REMEMBER:** Always check `/docs` for strategic context before making product decisions!
