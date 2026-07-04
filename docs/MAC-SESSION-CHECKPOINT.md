# MAC redesign — session checkpoint (3–4 Jul 2026)

Resume point. Supersedes the 1 Jul checkpoint. The MAC formula is now settled.

## THE MAC FORMULA (settled this session)

```
MAC = value added × automation index × K
```

- **value added** — the firm's own margin (its sale price − what it paid other
  firms for inputs). Charged **per firm, from its own accounts, per quarter** —
  NOT per transaction / bill-of-materials. This resolves the apportionment problem
  (you never trace a law firm's fee into one iPhone; the law firm pays on its whole
  quarter's value added, once). Summed across firms = GDP, each dollar counted once,
  no cascade.
- **automation index A** = `1 − (wages ÷ revenue)`. 0 = all human, 1 = all robot.
  This is the "how much they benefited from automation" dial (replaces the older
  "profit per employee" — it ties the charge to the wage bill automation removed).
- **K** — one county-wide number, `K = UBI ÷ Σ(value added × A)`, set so total MAC =
  the UBI bill. Grows as the UBI need grows (near 0 early, ~0.36 at maturity).
- **Profit floor** — the charge is clipped so a firm always keeps a minimum profit
  (Gemini's 4th criterion) — the reason firms accept the MAC rather than raise
  prices (they can't raise prices: UBI caps what buyers have — the "demand wall").

**Assessment vs collection are separate.** The AMOUNT is the accounts-based firm
figure above. COLLECTION happens gross at the till via split-clearing ("Option 2":
retailer declares its margin + nominates its upstream supplier; the rest of the MAC
is pushed upstream). Charging gross-at-final-sale once = charging the chain's value
added once. Don't conflate the two.

## Source: `docs/Axion Gemini 1.0.docx`

Steve's Gemini doc proposed `MAC = S × A × K` and we adopted it (its numbers:
Walmart M30, Apple M513 at K=0.6, reproduced exactly). Its key idea is the **B2B
layer**: a firm with no consumers in the county — but procuring inputs into it — is
in scope, because its sale into the county clears the MOND gateway. This expands the
base far beyond retail and is what makes the model fund.

## Pages built / changed

- **/ubi** — two modes only (Welfare $12k/adult, UBI $31,200/adult); inflection is a
  *point* (~2036), not a phase. Removed the invented "employment ramp" framing —
  recipient count is the unemployment figure from the employment page
  (`MF.unempRateAt`). Income tax is grossed up **on top of the UBI** (real US
  treatment: standard deduction shelters the $12k welfare floor → 0% gross-up; full
  basket $31,200 → $33,367, +6.9%). Bill total boxes show the gross figure.
- **/basket** — unchanged: $2,600/mo per adult goods anchor. (A sales-tax element was
  added then REVERTED — tax belongs on the UBI as income tax, not on the basket.)
- **/mac** — the old `/mac-national` page, **now at route `/mac`** (old consumer-slice
  `/mac` and `/mac-y20` pages deleted). Rebuilt on **real BEA 2024** GDP-by-industry
  (value added + gross output) for the 20 NAICS sectors, scaled to Midwestville
  (390k, ÷859 of US). Self-contained (does NOT load mac-data.js — that caused a
  `const pct` collision that stuck the page on "Loading…"). Sections: the question →
  How the MAC is calculated (plain English + Year 1 vs Year 20 worked example) →
  transaction layers → **"How much MAC does Midwestville need" as a Year 1/10/20
  table** → the maximum (freed-wage ceiling) → sector table → caveats.

## Key numbers (Midwestville 390k, real BEA-scaled)

- Retail base ~$9.7B · all transactions (gross output) ~$54B · B2B layer ~$24B ·
  value added ~$30B · wage bill ~$14B · **max MAC (freed wages) ~$12B**.
- UBI bill: **Y1 $0.14B · Y10 $1.33B · Y20 $8.0B** (from the /ubi model).
- Charge on **retail only**: 1.5% → 14% → **83% (breaks)**.
- Charge on **all transactions**: 0.3% → 2.5% → **15% (works)**.
- Mature K = 0.36. Freed wages cover the UBI ~1.5×.
- Worked phone example (Y1→Y20): MAC grows ~$5 → ~$292, nearly all on Apple.

## OPEN — next session

1. **Automation index A per sector** is a first-pass estimate — replace with BEA's
   compensation-by-industry table.
2. **In-area share** — population scaling assumes Midwestville is a representative US
   slice; overstates the reach of export-heavy sectors (manufacturing, wholesale).
3. **Automation over time** — the /mac worked example holds each firm's automation
   fixed to isolate the growing UBI; option to also ramp A Y1→Y20 (would ease mature
   K from 0.36 toward ~0.28).
4. **B2B k across areas** — a firm spanning many areas → a B2B Fisc, forwarded to area
   Fiscs pro rata (from the 1 Jul checkpoint; still not worked out).
5. **Rework /calibration** off the old consumer-slice model.

## Working style (Steve)

Plain language only — NO jargon ("altitude", "dial", "scalar" all landed badly).
Don't add concepts/text he didn't ask for. Explain with concrete worked examples and
real numbers. When he raises a concrete case, write it down — don't theorise in
circles.
