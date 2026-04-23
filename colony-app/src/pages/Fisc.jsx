import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'

const OHIO_BREAD_REF = 2.80  // $ reference price

function computeDerived(budget) {
  if (!budget) return null
  const lines = Array.isArray(budget.lines) ? budget.lines : []
  const active = lines.filter(l => l.active !== false)
  const totalS = active.reduce((s, l) => s + (Number(l.sTokenAmount) || 0), 0)
  if (!totalS || !budget.bread_price_s) return null
  const discount     = (budget.spice_labour_discount || 28) / 100
  const breadUSD     = OHIO_BREAD_REF * (1 - discount)
  const fiscRate     = breadUSD / budget.bread_price_s
  const ubiUSD       = totalS * fiscRate
  return { totalS, fiscRate, ubiUSD }
}

export default function Fisc() {
  const { slug }    = useParams()
  const navigate    = useNavigate()
  const { contracts, address } = useWallet()

  const [budget,     setBudget]     = useState(null)
  const [colonyType, setColonyType] = useState(null)
  const [loading,    setLoading]    = useState(true)

  // Read colony type from localStorage (set at colony creation)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
    setColonyType(stored[slug]?.colonyType || 'earth')
  }, [slug])

  // Fetch published budget
  useEffect(() => {
    const colonyAddr = contracts?.colonies?.[slug]?.colony
    if (!colonyAddr) { setLoading(false); return }

    fetch(`/api/budget?colony=${colonyAddr}`)
      .then(r => r.json())
      .then(d => { setBudget(d.published || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [contracts, slug])

  const derived = computeDerived(budget)
  const isMars  = colonyType === 'mars'

  return (
    <Layout title="Fisc" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>
            FISC ENGINE
          </div>
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
          ) : !budget ? (
            <div style={{ fontSize: 12, color: C.faint, lineHeight: 1.6 }}>
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
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'UBI',       value: derived ? `${derived.totalS} S` : '—',           sub: 'per month'    },
                { label: 'FISC RATE', value: derived ? `$${derived.fiscRate.toFixed(3)}/S` : '—', sub: 'implied rate' },
                { label: 'UBI VALUE', value: derived ? `$${Math.round(derived.ubiUSD)}/mo` : '—', sub: 'external ref' },
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
                  <div style={{ fontSize: 9, color: C.faint }}>
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          )}

          {budget && (
            <div style={{ marginTop: 12, fontSize: 10, color: C.faint, lineHeight: 1.5 }}>
              v{budget.version} · effective {budget.effective_from} · bread anchor: {budget.bread_price_s}S/loaf
            </div>
          )}
        </div>

        {/* Budget button */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
            STANDARD CITIZEN BUDGET
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 14 }}>
            The published breakdown of how the monthly UBI is calibrated — MCC charges, essentials, discretionary spend, and savings. MCC CEO can edit and publish updates.
          </div>
          <button
            onClick={() => navigate(`/colony/${slug}/budget`)}
            style={navBtn}
          >
            View Budget →
          </button>
        </div>

        {/* Earth-only sections */}
        {!isMars && (
          <>
            <div style={{ ...card, opacity: 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>
                USDC RESERVE
              </div>
              <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                Reserve management — coming soon
              </div>
            </div>

            <div style={{ ...card, opacity: 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>
                LOCAL ROBOT TAX (LRT)
              </div>
              <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                Business LRT filings — coming soon
              </div>
            </div>

            <div style={{ ...card, opacity: 0.5 }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>
                BOUNDARY FLOWS
              </div>
              <div style={{ fontSize: 11, color: C.faint, fontStyle: 'italic' }}>
                V → USDC external payments — coming soon
              </div>
            </div>
          </>
        )}

      </div>
    </Layout>
  )
}

const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '16px 16px',
  marginBottom: 12,
}

const navBtn = {
  width: '100%', padding: '10px 0',
  background: 'none', border: `1px solid ${C.border}`,
  borderRadius: 8, fontSize: 11, color: C.sub,
  cursor: 'pointer', letterSpacing: '0.04em',
  fontFamily: "'IBM Plex Mono', monospace",
}
