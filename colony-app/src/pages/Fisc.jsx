import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'

const RPC      = 'https://sepolia.base.org'
const OHIO_BREAD_REF = 2.80

const FISC_ABI = [
  'function snapshot() view returns (uint256,uint256,uint256,uint8,uint256,uint256,uint256,uint256,uint256,address)',
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
  const ubiUSD   = totalS * fiscRate
  return { totalS, fiscRate, ubiUSD }
}

async function fetchFiscState(fiscAddr) {
  if (!fiscAddr) return null
  const provider = new ethers.JsonRpcProvider(RPC)
  const fisc     = new ethers.Contract(fiscAddr, FISC_ABI, provider)
  const snap     = await fisc.snapshot()
  return {
    fiscRate:          Number(snap[0]) / 1e6,
    reserveUSDC:       Number(snap[1]) / 1e6,
    reserveRatio:      Number(snap[2]) / 1e4,
    reserveStatus:     Number(snap[3]),   // 2=healthy 1=adequate 0=alert
    lrtRate:           Number(snap[4]) / 100,
    breadBasketPriceS: Number(snap[5]),
    ubiAmount:         Number(snap[6]),
    periodEnd:         Number(snap[7]),
    daysLeft:          Number(snap[8]),
  }
}

const STATUS_COLOR = { 2: C.green || '#16a34a', 1: '#eab308', 0: '#ef4444' }
const STATUS_LABEL = { 2: 'HEALTHY', 1: 'ADEQUATE', 0: 'ALERT' }

export default function Fisc() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const { contracts, address } = useWallet()

  const [budget,     setBudget]     = useState(null)
  const [fiscState,  setFiscState]  = useState(null)
  const [colonyType, setColonyType] = useState('earth')
  const [loading,    setLoading]    = useState(true)

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
      fetchFiscState(fiscAddr).catch(() => null),
    ]).then(([budgetData, fisc]) => {
      setBudget(budgetData.published || null)
      setFiscState(fisc)
    }).finally(() => setLoading(false))
  }, [contracts, slug])

  const derived  = computeDerived(budget)
  const isMars   = colonyType === 'mars'
  const fiscAddr = contracts?.colonies?.[slug]?.fisc

  // On-chain rate takes precedence; fall back to budget-implied rate
  const displayRate = fiscState?.fiscRate ?? derived?.fiscRate ?? null
  const totalS      = derived?.totalS ?? fiscState?.ubiAmount ?? null
  const ubiUSD      = totalS && displayRate ? totalS * displayRate : null

  const periodEnd   = fiscState?.periodEnd
    ? new Date(fiscState.periodEnd * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null

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

        {/* Three-number panel */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
            PUBLISHED RATE
          </div>

          {loading ? (
            <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                {
                  label: 'UBI',
                  value: totalS ? `${totalS} S` : '—',
                  sub: 'per month',
                },
                {
                  label: 'FISC RATE',
                  value: displayRate ? `$${displayRate.toFixed(3)}/S` : '—',
                  sub: fiscState ? 'on-chain · live' : 'budget implied',
                },
                {
                  label: 'UBI VALUE',
                  value: ubiUSD ? `$${Math.round(ubiUSD)}/mo` : '—',
                  sub: 'external ref',
                },
              ].map(item => (
                <div key={item.label} style={{
                  background: C.bg, borderRadius: 6, padding: '12px 10px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.gold, marginBottom: 2 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 9, color: C.faint }}>{item.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Period countdown */}
          {fiscState && (
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: `1px solid ${C.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: 10, color: C.faint }}>
                Current period ends {periodEnd}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: fiscState.daysLeft <= 5 ? '#ef4444' : C.faint,
              }}>
                {fiscState.daysLeft}d remaining
              </div>
            </div>
          )}

          {budget && (
            <div style={{ marginTop: 10, fontSize: 10, color: C.faint }}>
              Budget v{budget.version} · bread anchor {budget.bread_price_s}S/loaf
            </div>
          )}

          {!budget && !loading && (
            <div style={{ marginTop: 10, fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
              No budget published yet.{' '}
              {address && (
                <span
                  style={{ color: C.gold, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate(`/colony/${slug}/budget`)}
                >
                  Publish one →
                </span>
              )}
            </div>
          )}
        </div>

        {/* Budget button */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
            STANDARD CITIZEN BUDGET
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 14 }}>
            The published breakdown of how the monthly UBI is calibrated — MCC charges, essentials, discretionary spend, and savings.
          </div>
          <button onClick={() => navigate(`/colony/${slug}/budget`)} style={navBtn}>
            View Budget →
          </button>
        </div>

        {/* Earth-only: USDC Reserve */}
        {!isMars && (
          <>
            <div style={{ ...card, opacity: fiscState ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>USDC RESERVE</div>
                {fiscState && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: STATUS_COLOR[fiscState.reserveStatus],
                    }} />
                    <span style={{ fontSize: 9, color: STATUS_COLOR[fiscState.reserveStatus], fontWeight: 600, letterSpacing: '0.08em' }}>
                      {STATUS_LABEL[fiscState.reserveStatus]}
                    </span>
                  </div>
                )}
              </div>

              {fiscState ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'RESERVE',       value: `$${fiscState.reserveUSDC.toLocaleString()}` },
                    { label: 'COVER RATIO',   value: `${fiscState.reserveRatio.toFixed(1)}×`      },
                    { label: 'LRT RATE',      value: `${fiscState.lrtRate.toFixed(1)}%`            },
                    { label: 'BREAD BASKET',  value: `${fiscState.breadBasketPriceS}S`             },
                  ].map(item => (
                    <div key={item.label} style={{ background: C.bg, borderRadius: 6, padding: '10px 12px' }}>
                      <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                  {fiscAddr ? 'Loading reserve data…' : 'Fisc contract not deployed for this colony'}
                </div>
              )}

              {fiscState && (
                <div style={{ marginTop: 12, fontSize: 10, color: C.faint, lineHeight: 1.5 }}>
                  Reserve target: 4.0× cover · alert below 2.0×.
                  LRT rate is set to the minimum sustaining the reserve target.
                </div>
              )}
            </div>

            {/* LRT */}
            <div style={{ ...card, opacity: fiscState ? 1 : 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>
                LOCAL ROBOT TAX (LRT)
              </div>
              {fiscState ? (
                <>
                  <div style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    {fiscState.lrtRate.toFixed(1)}%
                    <span style={{ fontSize: 11, fontWeight: 400, color: C.faint, marginLeft: 8 }}>
                      of local net profit
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
                    Levied on all businesses operating in the colony. Replaces Ohio
                    Commercial Activity Tax and municipal income tax. Proceeds fund
                    the USDC reserve and sustain UBI issuance.
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                  Business LRT filings — coming soon
                </div>
              )}
            </div>

            {/* Boundary flows */}
            <div style={{ ...card, opacity: 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>
                BOUNDARY FLOWS
              </div>
              <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                V → USDC external payments — coming in phase 2
              </div>
            </div>
          </>
        )}

        {/* Contract link */}
        {fiscAddr && (
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <a
              href={`https://sepolia.basescan.org/address/${fiscAddr}`}
              target="_blank"
              rel="noreferrer"
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
