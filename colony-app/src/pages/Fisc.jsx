import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'

const RPC            = 'https://sepolia.base.org'
const OHIO_BREAD_REF = 2.80

const FISC_ABI = [
  'function snapshot() view returns (uint256,uint256,uint256,uint8,uint256,uint256,uint256,uint256,uint256,address)',
  'function rateAlgorithmState() view returns (uint256,uint256,uint256,uint256,uint256,int256,uint256)',
  'function getRateHistory() view returns (uint256[])',
  'function updateRate(int256 externalInflationBps, int256 abundanceBps) external',
]

const COLONY_ABI = [
  'function citizenCount() view returns (uint256)',
]

function computeDerived(budget) {
  if (!budget) return null
  const lines  = Array.isArray(budget.lines) ? budget.lines : []
  const active = lines.filter(l => l.active !== false)
  const totalS = active.reduce((s, l) => s + (Number(l.sTokenAmount) || 0), 0)
  if (!totalS || !budget.bread_price_s) return null
  const discount = (budget.spice_labour_discount || 28) / 100
  const breadUSD = OHIO_BREAD_REF * (1 - discount)
  const fiscRate = breadUSD / budget.bread_price_s
  return { totalS, fiscRate, ubiUSD: totalS * fiscRate }
}

async function fetchChainData(fiscAddr, colonyAddr) {
  const provider = new ethers.JsonRpcProvider(RPC)
  const fisc     = new ethers.Contract(fiscAddr, FISC_ABI, provider)
  const colony   = new ethers.Contract(colonyAddr, COLONY_ABI, provider)

  const [snap, algoState, history, citizenCount] = await Promise.all([
    fisc.snapshot(),
    fisc.rateAlgorithmState(),
    fisc.getRateHistory(),
    colony.citizenCount().catch(() => 0n),
  ])

  return {
    fisc: {
      fiscRate:          Number(snap[0]) / 1e6,
      fiscRateRaw:       Number(snap[0]),
      reserveUSDC:       Number(snap[1]) / 1e6,
      reserveRatio:      Number(snap[2]) / 1e4,
      reserveStatus:     Number(snap[3]),
      lrtRate:           Number(snap[4]) / 100,
      breadBasketPriceS: Number(snap[5]),
      ubiAmount:         Number(snap[6]),
      periodEnd:         Number(snap[7]),
      daysLeft:          Number(snap[8]),
    },
    algo: {
      sensitivity:      Number(algoState[0]),
      minRate:          Number(algoState[1]) / 1e6,
      maxRate:          Number(algoState[2]) / 1e6,
      maxDailyChangePct: Number(algoState[3]) / 100,
      lastUpdate:       Number(algoState[4]),
      lastPressureBps:  Number(algoState[5]),
      lastStance:       Number(algoState[6]),
    },
    rateHistory: history.map(r => Number(r) / 1e6),
    citizenCount: Number(citizenCount),
  }
}

const STATUS_COLOR = { 2: C.green || '#16a34a', 1: '#eab308', 0: '#ef4444' }
const STATUS_LABEL = { 2: 'HEALTHY', 1: 'ADEQUATE', 0: 'ALERT' }

export default function Fisc() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const { contracts, address, provider: walletProvider } = useWallet()

  const [budget,      setBudget]      = useState(null)
  const [chainData,   setChainData]   = useState(null)
  const [colonyType,  setColonyType]  = useState('earth')
  const [loading,     setLoading]     = useState(true)
  const [rateInputs,  setRateInputs]  = useState({ external: '350', abundance: '100' })
  const [rateUpdating,setRateUpdating]= useState(false)
  const [rateMsg,     setRateMsg]     = useState(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
    setColonyType(stored[slug]?.colonyType || 'earth')
  }, [slug])

  useEffect(() => {
    const colonyAddr = contracts?.colonies?.[slug]?.colony
    const fiscAddr   = contracts?.colonies?.[slug]?.fisc
    if (!colonyAddr) { setLoading(false); return }

    Promise.all([
      fetch(`/api/budget?colony=${colonyAddr}`).then(r => r.json()).catch(() => ({})),
      fiscAddr ? fetchChainData(fiscAddr, colonyAddr).catch(() => null) : Promise.resolve(null),
    ]).then(([budgetData, chain]) => {
      setBudget(budgetData.published || null)
      setChainData(chain)
    }).finally(() => setLoading(false))
  }, [contracts, slug])

  const derived    = computeDerived(budget)
  const isMars     = colonyType === 'mars'
  const fiscAddr   = contracts?.colonies?.[slug]?.fisc
  const colonyAddr = contracts?.colonies?.[slug]?.colony
  const fs         = chainData?.fisc
  const algo       = chainData?.algo
  const citizenCount = chainData?.citizenCount ?? 0

  const displayRate = fs?.fiscRate ?? derived?.fiscRate ?? null
  const totalS      = budget ? derived?.totalS : fs?.ubiAmount ?? null
  const ubiUSD      = totalS && displayRate ? totalS * displayRate : null

  // Viability numbers
  const monthlyUBICostUSDC   = citizenCount && totalS && displayRate
    ? citizenCount * totalS * displayRate : null
  const lrtBreakevenProfit   = monthlyUBICostUSDC && fs?.lrtRate
    ? monthlyUBICostUSDC / (fs.lrtRate / 100) : null
  const reserveRunwayMonths  = monthlyUBICostUSDC && fs?.reserveUSDC && monthlyUBICostUSDC > 0
    ? fs.reserveUSDC / monthlyUBICostUSDC : null

  const periodEndStr = fs?.periodEnd
    ? new Date(fs.periodEnd * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null

  const lastUpdateStr = algo?.lastUpdate
    ? new Date(algo.lastUpdate * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'never'

  async function handleUpdateRate() {
    if (!walletProvider || !fiscAddr) return
    const ext = parseFloat(rateInputs.external)
    const abun = parseFloat(rateInputs.abundance)
    if (isNaN(ext) || isNaN(abun)) return

    setRateUpdating(true)
    setRateMsg(null)
    try {
      const signer = await walletProvider.getSigner()
      const fisc   = new ethers.Contract(fiscAddr, FISC_ABI, signer)
      const tx     = await fisc.updateRate(
        Math.round(ext),
        Math.round(abun),
      )
      await tx.wait()
      setRateMsg({ ok: true, text: 'Rate updated on-chain.' })
      // Refresh
      const chain = await fetchChainData(fiscAddr, colonyAddr)
      setChainData(chain)
    } catch (e) {
      setRateMsg({ ok: false, text: e.reason || e.message })
    } finally {
      setRateUpdating(false)
    }
  }

  const isOwner = !!address  // in production: check against fisc.owner()

  return (
    <Layout title="Fisc" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>FISC ENGINE</div>
          <span style={{
            fontSize: 9, letterSpacing: '0.1em', fontWeight: 600,
            color: isMars ? C.purple : C.gold,
            border: `1px solid ${isMars ? C.purple : C.gold}`,
            borderRadius: 10, padding: '2px 8px',
          }}>
            {isMars ? 'MARS · CLOSED' : 'EARTH · OPEN'}
          </span>
        </div>

        {/* ── Three-number panel ── */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
            PUBLISHED RATE
          </div>

          {loading ? (
            <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'UBI',       value: totalS ? `${totalS} S` : '—',                sub: 'per month'                              },
                { label: 'FISC RATE', value: displayRate ? `$${displayRate.toFixed(3)}/S` : '—', sub: fs ? 'on-chain · live' : 'budget implied' },
                { label: 'UBI VALUE', value: ubiUSD ? `$${Math.round(ubiUSD)}/mo` : '—', sub: 'external ref'                           },
              ].map(item => (
                <div key={item.label} style={{ background: C.bg, borderRadius: 6, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.gold, marginBottom: 2 }}>{item.value}</div>
                  <div style={{ fontSize: 9, color: C.faint }}>{item.sub}</div>
                </div>
              ))}
            </div>
          )}

          {fs && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, color: C.faint }}>Period ends {periodEndStr}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: fs.daysLeft <= 5 ? '#ef4444' : C.faint }}>
                {fs.daysLeft}d remaining
              </div>
            </div>
          )}

          {budget && (
            <div style={{ marginTop: 8, fontSize: 10, color: C.faint }}>
              Budget v{budget.version} · bread anchor {budget.bread_price_s}S/loaf
            </div>
          )}

          {!budget && !loading && (
            <div style={{ marginTop: 10, fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
              No budget published.{' '}
              {address && (
                <span style={{ color: C.gold, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate(`/colony/${slug}/budget`)}>
                  Publish one →
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Budget button ── */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>STANDARD CITIZEN BUDGET</div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 14 }}>
            The published breakdown of how the monthly UBI is calibrated — MCC charges, essentials, discretionary spend, and savings.
          </div>
          <button onClick={() => navigate(`/colony/${slug}/budget`)} style={navBtn}>View Budget →</button>
        </div>

        {/* ── Earth only ── */}
        {!isMars && (
          <>
            {/* USDC Reserve */}
            <div style={{ ...card, opacity: fs ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>USDC RESERVE</div>
                {fs && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: STATUS_COLOR[fs.reserveStatus] }} />
                    <span style={{ fontSize: 9, color: STATUS_COLOR[fs.reserveStatus], fontWeight: 600, letterSpacing: '0.08em' }}>
                      {STATUS_LABEL[fs.reserveStatus]}
                    </span>
                  </div>
                )}
              </div>

              {fs ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'RESERVE',      value: `$${fs.reserveUSDC.toLocaleString()}` },
                    { label: 'COVER RATIO',  value: `${fs.reserveRatio.toFixed(1)}×`      },
                    { label: 'LRT RATE',     value: `${fs.lrtRate.toFixed(1)}%`            },
                    { label: 'BREAD BASKET', value: `${fs.breadBasketPriceS}S`             },
                  ].map(item => (
                    <div key={item.label} style={{ background: C.bg, borderRadius: 6, padding: '10px 12px' }}>
                      <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                  {fiscAddr ? 'Loading…' : 'Fisc contract not deployed'}
                </div>
              )}

              {fs && (
                <div style={{ marginTop: 12, fontSize: 10, color: C.faint, lineHeight: 1.5 }}>
                  Target: 4.0× · alert below 2.0×. LRT rate set to minimum sustaining reserve target.
                </div>
              )}
            </div>

            {/* Colony viability */}
            <div style={{ ...card, opacity: fs ? 1 : 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>COLONY VIABILITY</div>

              {fs && citizenCount > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    {[
                      { label: 'CITIZENS',         value: citizenCount.toString()                                         },
                      { label: 'MONTHLY UBI COST', value: monthlyUBICostUSDC ? `$${Math.round(monthlyUBICostUSDC).toLocaleString()}` : '—' },
                      { label: 'LRT BREAKEVEN',    value: lrtBreakevenProfit  ? `$${Math.round(lrtBreakevenProfit).toLocaleString()} profit` : '—' },
                      { label: 'RESERVE RUNWAY',   value: reserveRunwayMonths ? `${reserveRunwayMonths.toFixed(1)} months` : '—'               },
                    ].map(item => (
                      <div key={item.label} style={{ background: C.bg, borderRadius: 6, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, lineHeight: 1.6 }}>
                    Monthly UBI cost = {citizenCount} citizens × {totalS}S × ${displayRate?.toFixed(3)}/S.
                    LRT breakeven = local net profit needed at {fs.lrtRate}% to cover full UBI cost.
                    Reserve runway = months of UBI issuance the reserve can cover without LRT income.
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                  {loading ? 'Loading…' : 'No citizens yet — viability metrics will appear once citizens join.'}
                </div>
              )}
            </div>

            {/* F9 Rate algorithm */}
            <div style={{ ...card, opacity: fs ? 1 : 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
                F9 — EXCHANGE RATE ALGORITHM
              </div>

              {fs && algo ? (
                <>
                  {/* Rate history */}
                  {chainData?.rateHistory?.length > 1 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>RATE HISTORY</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
                        {chainData.rateHistory.map((r, i) => {
                          const max  = Math.max(...chainData.rateHistory)
                          const min  = Math.min(...chainData.rateHistory)
                          const range = max - min || 0.01
                          const h    = Math.max(4, Math.round(((r - min) / range) * 36))
                          return (
                            <div key={i} title={`$${r.toFixed(4)}`} style={{
                              flex: 1, height: h, borderRadius: 2,
                              background: i === chainData.rateHistory.length - 1 ? C.gold : C.border,
                            }} />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Algorithm state */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      { label: 'LAST UPDATE',    value: lastUpdateStr                              },
                      { label: 'LAST PRESSURE',  value: algo.lastUpdate ? `${(algo.lastPressureBps / 100).toFixed(1)}%` : '—' },
                      { label: 'POLICY STANCE',  value: algo.lastUpdate ? `${(algo.lastStance / 100).toFixed(0)}%` : '—'     },
                      { label: 'SENSITIVITY',    value: `${algo.sensitivity / 100}%/unit`          },
                    ].map(item => (
                      <div key={item.label} style={{ background: C.bg, borderRadius: 6, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 10, color: C.faint, lineHeight: 1.6, marginBottom: 14 }}>
                    Rate moves to defend the bread basket price in S-tokens.
                    net_pressure = external inflation − local abundance.
                    Policy stance scales down if reserve ratio falls below 4×.
                    Max daily change: {algo.maxDailyChangePct}%. Bounds: ${algo.minRate.toFixed(2)}–${algo.maxRate.toFixed(2)}/S.
                  </div>

                  {/* Owner trigger */}
                  {isOwner && (
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                      <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>
                        TRIGGER RATE UPDATE (founder only)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        {[
                          { key: 'external',  label: 'External inflation (bps)',  placeholder: '350 = 3.5%' },
                          { key: 'abundance', label: 'Local abundance (bps)',     placeholder: '100 = 1.0%' },
                        ].map(f => (
                          <div key={f.key}>
                            <div style={{ fontSize: 9, color: C.faint, marginBottom: 4 }}>{f.label}</div>
                            <input
                              type="number"
                              value={rateInputs[f.key]}
                              onChange={e => setRateInputs(p => ({ ...p, [f.key]: e.target.value }))}
                              placeholder={f.placeholder}
                              style={inputStyle}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: C.faint, marginBottom: 10 }}>
                        Net pressure: {(parseFloat(rateInputs.external || 0) - parseFloat(rateInputs.abundance || 0)).toFixed(0)} bps
                        &nbsp;·&nbsp;
                        Estimated move: {fs ? `${((parseFloat(rateInputs.external || 0) - parseFloat(rateInputs.abundance || 0)) * (algo.lastStance / 10000) * (algo.sensitivity / 10000)).toFixed(1)} bps` : '—'}
                      </div>
                      <button
                        onClick={handleUpdateRate}
                        disabled={rateUpdating || !walletProvider}
                        style={{ ...navBtn, borderColor: C.gold, color: C.gold }}
                      >
                        {rateUpdating ? 'Updating…' : 'Update Rate On-Chain →'}
                      </button>
                      {rateMsg && (
                        <div style={{ marginTop: 8, fontSize: 11, color: rateMsg.ok ? C.green : '#ef4444' }}>
                          {rateMsg.text}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                  {fiscAddr ? 'Loading algorithm state…' : 'Fisc contract not deployed'}
                </div>
              )}
            </div>

            {/* Boundary flows */}
            <div style={{ ...card, opacity: 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>BOUNDARY FLOWS</div>
              <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>V → USDC external payments — phase 2</div>
            </div>
          </>
        )}

        {/* Contract link */}
        {fiscAddr && (
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <a
              href={`https://sepolia.basescan.org/address/${fiscAddr}`}
              target="_blank" rel="noreferrer"
              style={{ fontSize: 9, color: C.faint, textDecoration: 'none', letterSpacing: '0.05em' }}
            >
              Fisc contract ↗ {fiscAddr.slice(0, 10)}…{fiscAddr.slice(-6)}
            </a>
          </div>
        )}

      </div>
    </Layout>
  )
}

const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '16px',
  marginBottom: 12,
}

const navBtn = {
  width: '100%', padding: '10px 0',
  background: 'none', border: `1px solid ${C.border}`,
  borderRadius: 8, fontSize: 11, color: C.sub,
  cursor: 'pointer', letterSpacing: '0.04em',
  fontFamily: "'IBM Plex Mono', monospace",
}

const inputStyle = {
  width: '100%', padding: '8px 10px', boxSizing: 'border-box',
  background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 6, fontSize: 12, color: C.text,
  fontFamily: "'IBM Plex Mono', monospace",
}
