/**
 * budgetMath.test.js — pure math for the Standard Citizen Budget.
 *
 * Covers:
 *  - category totals (MCC / Essential / Discretionary / Savings)
 *  - Fisc rate derivation from bread anchor + labour discount
 *  - implied UBI value in $
 *  - the three CEO consistency flags (rateOK, ubiOK, splitOK)
 *  - active/inactive line filtering
 *  - edge cases (zero bread price, missing discount)
 */

import { describe, it, expect } from 'vitest'
import { computeDerived, OHIO_BREAD_REF } from '../../src/utils/budgetMath.js'

const line = (category, sTokenAmount, opts = {}) =>
  ({ category, sTokenAmount, active: true, ...opts })

describe('OHIO_BREAD_REF', () => {
  it('is the Ohio reference loaf price in dollars', () => {
    expect(OHIO_BREAD_REF).toBe(2.80)
  })
})

describe('computeDerived — category totals', () => {
  it('sums lines per category', () => {
    const lines = [
      line('MCC',           100),
      line('MCC',            50),
      line('Essential',     200),
      line('Discretionary', 100),
      line('Savings',       100),
    ]
    const r = computeDerived(lines, 4, 28)
    expect(r.totalMCC).toBe(150)
    expect(r.totalEss).toBe(200)
    expect(r.totalDisc).toBe(100)
    expect(r.totalSave).toBe(100)
    expect(r.totalUBI).toBe(550)
  })

  it('skips lines where active is false', () => {
    const lines = [
      line('MCC', 100),
      line('MCC',  50, { active: false }),
      line('Essential', 200, { active: false }),
    ]
    const r = computeDerived(lines, 4, 28)
    expect(r.totalMCC).toBe(100)
    expect(r.totalEss).toBe(0)
    expect(r.totalUBI).toBe(100)
  })

  it('treats lines with active === undefined as active', () => {
    const lines = [{ category: 'MCC', sTokenAmount: 100 }]  // no `active` key
    const r = computeDerived(lines, 4, 28)
    expect(r.totalMCC).toBe(100)
  })

  it('handles empty lines array', () => {
    const r = computeDerived([], 4, 28)
    expect(r.totalUBI).toBe(0)
    expect(r.totalMCC).toBe(0)
    expect(r.totalEss).toBe(0)
    expect(r.totalDisc).toBe(0)
    expect(r.totalSave).toBe(0)
  })
})

describe('computeDerived — Fisc rate', () => {
  it('Fisc rate = (Ohio ref × (1 − discount)) / breadPriceS', () => {
    // discount 28% → effective bread USD = 2.80 × 0.72 = 2.016
    // bread S = 4 → rate = 2.016 / 4 = 0.504
    const r = computeDerived([line('MCC', 100)], 4, 28)
    expect(r.fiscRate).toBeCloseTo(0.504, 6)
  })

  it('returns rate=0 when breadPriceS is 0 (avoids divide-by-zero)', () => {
    const r = computeDerived([line('MCC', 100)], 0, 28)
    expect(r.fiscRate).toBe(0)
    expect(r.ubiUSD).toBe(0)
  })

  it('discount of 0% gives rate = Ohio ref / breadPriceS', () => {
    const r = computeDerived([line('MCC', 100)], 2.80, 0.0001) // ~0% (truthy fallback avoids 28% default)
    expect(r.fiscRate).toBeCloseTo(2.80 / 2.80, 4)
  })

  it('falls back to 28% discount when spiceLabourDiscount is 0/undefined/null', () => {
    // Implementation uses `(value || 28)` — falsy values trigger default
    const undef = computeDerived([line('MCC', 100)], 4, undefined)
    const zero  = computeDerived([line('MCC', 100)], 4, 0)
    const nul   = computeDerived([line('MCC', 100)], 4, null)
    expect(undef.fiscRate).toBeCloseTo(0.504, 6)
    expect(zero.fiscRate).toBeCloseTo(0.504, 6)
    expect(nul.fiscRate).toBeCloseTo(0.504, 6)
  })
})

describe('computeDerived — implied UBI in $', () => {
  it('ubiUSD = totalUBI × fiscRate', () => {
    const lines = [
      line('MCC',           250),
      line('Essential',     500),
      line('Discretionary', 250),
      line('Savings',       250),
    ]
    const r = computeDerived(lines, 4, 28)
    expect(r.totalUBI).toBe(1250)
    // rate = 0.504, ubiUSD = 1250 * 0.504 = 630
    expect(r.ubiUSD).toBeCloseTo(630, 2)
  })
})

describe('computeDerived — CEO consistency flags', () => {
  it('rateOK is true when 0.30 ≤ fiscRate ≤ 1.20', () => {
    expect(computeDerived([line('MCC', 100)], 4, 28).rateOK).toBe(true)   // 0.504
    expect(computeDerived([line('MCC', 100)], 1, 28).rateOK).toBe(false)  // 2.016 > 1.20
    expect(computeDerived([line('MCC', 100)], 10, 28).rateOK).toBe(false) // 0.2016 < 0.30
  })

  it('rateOK is true at exact band boundaries', () => {
    // Want rate = 0.30 → breadPriceS = 2.016 / 0.30 = 6.72
    expect(computeDerived([line('MCC', 100)], 6.72, 28).rateOK).toBe(true)
    // Want rate = 1.20 → breadPriceS = 2.016 / 1.20 = 1.68
    expect(computeDerived([line('MCC', 100)], 1.68, 28).rateOK).toBe(true)
  })

  it('ubiOK is true when 300 ≤ ubiUSD ≤ 1500', () => {
    // 1000 S total × 0.504 = $504 — in range
    const inRange = computeDerived([line('MCC', 1000)], 4, 28)
    expect(inRange.ubiOK).toBe(true)

    // 100 S total × 0.504 = $50.4 — too low
    const tooLow = computeDerived([line('MCC', 100)], 4, 28)
    expect(tooLow.ubiOK).toBe(false)

    // 5000 S total × 0.504 = $2520 — too high
    const tooHigh = computeDerived([line('MCC', 5000)], 4, 28)
    expect(tooHigh.ubiOK).toBe(false)
  })

  it('splitOK is true when savings is within ±5 percentage points of 20%', () => {
    // 80 MCC + 20 Savings = 20% savings → exactly OK
    const exact = computeDerived([line('MCC', 80), line('Savings', 20)], 4, 28)
    expect(exact.splitOK).toBe(true)

    // 76 MCC + 24 Savings = 24% savings → 4pp from target → OK
    const close = computeDerived([line('MCC', 76), line('Savings', 24)], 4, 28)
    expect(close.splitOK).toBe(true)

    // 70 MCC + 30 Savings = 30% savings → 10pp from target → NOT ok
    const far = computeDerived([line('MCC', 70), line('Savings', 30)], 4, 28)
    expect(far.splitOK).toBe(false)

    // No savings at all → NOT ok
    const noSave = computeDerived([line('MCC', 100)], 4, 28)
    expect(noSave.splitOK).toBe(false)
  })

  it('splitOK is false when totalUBI is 0 (no division by zero)', () => {
    const r = computeDerived([], 4, 28)
    expect(r.splitOK).toBe(false)
  })
})

describe('computeDerived — realistic Fairbrook-style budget', () => {
  it('produces all flags green for a balanced 1,000 S/month budget', () => {
    // ~250 MCC, 350 Essential, 200 Discretionary, 200 Savings → 1,000 S total
    // 200/1000 = 20% savings → splitOK
    // breadPriceS=4, discount=28% → rate=0.504
    // ubiUSD = 1000 × 0.504 = $504 → ubiOK
    // rateOK because 0.30 ≤ 0.504 ≤ 1.20
    const lines = [
      line('MCC',           250),
      line('Essential',     350),
      line('Discretionary', 200),
      line('Savings',       200),
    ]
    const r = computeDerived(lines, 4, 28)
    expect(r.rateOK).toBe(true)
    expect(r.ubiOK).toBe(true)
    expect(r.splitOK).toBe(true)
    expect(r.totalUBI).toBe(1000)
  })
})
