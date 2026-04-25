/**
 * /api/fisc-rate-update — Daily cron endpoint for F9 rate algorithm.
 *
 * Triggered by Vercel cron at 00:05 UTC daily.
 * Reads CPI from FRED, computes monthly external inflation pressure,
 * then calls Fisc.updateRate(externalInflationBps, abundanceBps) on-chain.
 *
 * Environment variables required:
 *   VITE_FRED_API_KEY    — FRED API key
 *   FISC_ORACLE_KEY      — Private key of the rate oracle wallet (set via Fisc.setRateOracle())
 *   FISC_ADDRESS         — Deployed Fisc contract address
 *   ABUNDANCE_BPS        — Local abundance estimate in bps (default 0)
 *                          Set via Vercel env vars; governance updates monthly.
 *
 * Security: This endpoint checks the Vercel cron secret header.
 * It will not execute if called without the correct Authorization header.
 */

import { ethers } from 'ethers'

const RPC = 'https://sepolia.base.org'

const FISC_ABI = [
  'function updateRate(int256 externalInflationBps, int256 abundanceBps) external',
  'function fiscRate() view returns (uint256)',
  'function lastRateUpdate() view returns (uint256)',
]

async function getCpiChange(fredKey) {
  // Fetch last 2 monthly CPI observations to compute month-over-month change
  const url = `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=CPIAUCSL&api_key=${fredKey}&limit=2&sort_order=desc&file_type=json`
  const r   = await fetch(url)
  if (!r.ok) throw new Error(`FRED CPI fetch failed: ${r.status}`)
  const j   = await r.json()
  const obs  = (j.observations || []).filter(o => o.value !== '.').slice(0, 2)
  if (obs.length < 2) throw new Error('Insufficient CPI data')

  const current  = parseFloat(obs[0].value)
  const prior    = parseFloat(obs[1].value)
  const momChange = (current - prior) / prior  // month-over-month fraction

  // Annualise and convert to bps (× 10000)
  const annualisedBps = Math.round(momChange * 12 * 10000)

  return {
    current,
    prior,
    date:          obs[0].date,
    momPct:        (momChange * 100).toFixed(3),
    annualisedBps,
  }
}

export default async function handler(req, res) {
  // Verify Vercel cron secret
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const fredKey    = process.env.VITE_FRED_API_KEY
  const oracleKey  = process.env.FISC_ORACLE_KEY
  const fiscAddr   = process.env.FISC_ADDRESS || '0xbeF1Dd5f09AE72EBc0565AF72e798866e691eA57'
  const abundBps   = parseInt(process.env.ABUNDANCE_BPS || '0', 10)

  if (!fredKey)   return res.status(500).json({ error: 'FRED API key not configured' })
  if (!oracleKey) return res.status(500).json({ error: 'FISC_ORACLE_KEY not configured' })

  try {
    // 1. Get CPI change from FRED
    const cpi = await getCpiChange(fredKey)
    console.log(`[fisc-rate-update] CPI: ${cpi.current} (${cpi.date}), MoM: ${cpi.momPct}%, annualised: ${cpi.annualisedBps} bps`)

    // 2. Connect to chain
    const provider = new ethers.JsonRpcProvider(RPC)
    const wallet   = new ethers.Wallet(oracleKey, provider)
    const fisc     = new ethers.Contract(fiscAddr, FISC_ABI, wallet)

    // 3. Check current state
    const [currentRate, lastUpdate] = await Promise.all([
      fisc.fiscRate(),
      fisc.lastRateUpdate(),
    ])
    const hoursSinceUpdate = (Date.now() / 1000 - Number(lastUpdate)) / 3600
    console.log(`[fisc-rate-update] currentRate: $${Number(currentRate)/1e6}, hoursSince: ${hoursSinceUpdate.toFixed(1)}h`)

    if (hoursSinceUpdate < 20) {
      return res.status(200).json({
        skipped: true,
        reason: `Rate updated ${hoursSinceUpdate.toFixed(1)}h ago — too soon`,
      })
    }

    // 4. Call updateRate
    const tx = await fisc.updateRate(
      BigInt(cpi.annualisedBps),
      BigInt(abundBps),
      { gasLimit: 200000 }
    )
    const receipt = await tx.wait()

    const newRate = await fisc.fiscRate()
    const rateDelta = (Number(newRate) - Number(currentRate)) / Number(currentRate) * 100

    console.log(`[fisc-rate-update] done. txHash: ${receipt.hash}, newRate: $${Number(newRate)/1e6} (${rateDelta > 0 ? '+' : ''}${rateDelta.toFixed(3)}%)`)

    return res.status(200).json({
      ok:               true,
      txHash:           receipt.hash,
      externalInflBps:  cpi.annualisedBps,
      abundanceBps:     abundBps,
      cpiDate:          cpi.date,
      cpiMoMPct:        cpi.momPct,
      previousRate:     Number(currentRate) / 1e6,
      newRate:          Number(newRate) / 1e6,
      rateDeltaPct:     rateDelta.toFixed(3),
    })
  } catch (e) {
    console.error('[fisc-rate-update] error:', e.message)
    return res.status(500).json({ error: e.message })
  }
}
