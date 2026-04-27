/**
 * Pure math for the Standard Citizen Budget (Fisc engine).
 *
 * computeDerived takes the active line items + bread anchor inputs and returns
 * category totals, the Fisc rate, the implied UBI value in $, and the three
 * consistency flags shown to the CEO during edit (rate / UBI / split bands).
 *
 * No DOM, no network, no chain reads — safe to unit test.
 */

export const OHIO_BREAD_REF = 2.80  // $ Ohio reference loaf price

/**
 * @param {{category:string, sTokenAmount:number, active?:boolean}[]} lines
 * @param {number} breadPriceS - colony loaf price in S
 * @param {number} spiceLabourDiscount - percent (28 = 28%); defaults to 28
 */
export function computeDerived(lines, breadPriceS, spiceLabourDiscount) {
  const active = lines.filter(l => l.active !== false)
  const totalMCC  = active.filter(l => l.category === 'MCC').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalEss  = active.filter(l => l.category === 'Essential').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalDisc = active.filter(l => l.category === 'Discretionary').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalSave = active.filter(l => l.category === 'Savings').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalUBI  = totalMCC + totalEss + totalDisc + totalSave

  const discount    = (spiceLabourDiscount || 28) / 100
  const breadUSD    = OHIO_BREAD_REF * (1 - discount)
  const fiscRate    = breadPriceS > 0 ? breadUSD / breadPriceS : 0
  const ubiUSD      = totalUBI * fiscRate

  const rateOK  = fiscRate >= 0.30 && fiscRate <= 1.20
  const ubiOK   = ubiUSD  >= 300  && ubiUSD  <= 1500
  const splitOK = totalUBI > 0 && Math.abs((totalSave / totalUBI) * 100 - 20) < 5

  return { totalMCC, totalEss, totalDisc, totalSave, totalUBI, fiscRate, ubiUSD, rateOK, ubiOK, splitOK }
}
