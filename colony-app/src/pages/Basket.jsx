import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'
import { ethers } from 'ethers'

const RPC = 'https://sepolia.base.org'

const FISC_ABI = [
  'function fiscRate() view returns (uint256)',
]

const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '16px',
  marginBottom: 12,
}

export default function Basket() {
  const { slug }    = useParams()
  const { contracts } = useWallet()

  const [items,     setItems]     = useState(null)
  const [totalUSD,  setTotalUSD]  = useState(null)
  const [generatedAt, setGeneratedAt] = useState(null)
  const [fiscRate,  setFiscRate]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fiscAddr = contracts?.colonies?.[slug]?.fisc

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [basketRes, rateRes] = await Promise.all([
          fetch('/api/basket'),
          fiscAddr
            ? (async () => {
                const provider = new ethers.JsonRpcProvider(RPC)
                const fisc = new ethers.Contract(fiscAddr, FISC_ABI, provider)
                const raw = await fisc.fiscRate()
                return Number(raw) / 1e6
              })().catch(() => null)
            : Promise.resolve(null),
        ])

        if (!basketRes.ok) throw new Error(`basket API ${basketRes.status}`)
        const data = await basketRes.json()

        setItems(data.items)
        setTotalUSD(data.totalUSD)
        setGeneratedAt(data.generatedAt)
        setFiscRate(rateRes)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fiscAddr])

  const toS = (usd) => fiscRate && fiscRate > 0 ? Math.round(usd / fiscRate) : null

  return (
    <Layout title="Bread Basket" back={`/colony/${slug}/fisc`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 6 }}>
            FISC BREAD BASKET
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7 }}>
            Five goods that anchor the S-token exchange rate. Prices sourced from
            FRED (US Bureau of Labor Statistics) and adjusted to colony-standard quantities.
          </div>
        </div>

        {loading && (
          <div style={{ fontSize: 12, color: C.faint, padding: '20px 0' }}>Loading…</div>
        )}

        {error && (
          <div style={{ fontSize: 12, color: C.red, padding: '10px 0' }}>
            Error: {error}
          </div>
        )}

        {!loading && !error && items && (
          <>
            {/* Rate strip */}
            <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <div>
                <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 4 }}>FISC RATE</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.gold }}>
                  {fiscRate ? `$${fiscRate.toFixed(3)} / S` : '—'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 4 }}>BASKET TOTAL</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>
                  ${totalUSD?.toFixed(2)}
                </div>
                {fiscRate && (
                  <div style={{ fontSize: 11, color: C.sub }}>
                    {toS(totalUSD)} S
                  </div>
                )}
              </div>
            </div>

            {/* Item table */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
                BASKET ITEMS
              </div>

              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px',
                gap: 8,
                paddingBottom: 8,
                borderBottom: `1px solid ${C.border}`,
                marginBottom: 6,
              }}>
                <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em' }}>ITEM</div>
                <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', textAlign: 'right' }}>USD</div>
                <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', textAlign: 'right' }}>S-TOKENS</div>
              </div>

              {items.map(item => (
                <div key={item.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 80px',
                  gap: 8,
                  padding: '10px 0',
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.text, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: C.faint }}>{item.description}</div>
                    <div style={{ fontSize: 9, color: C.faint, marginTop: 3 }}>
                      {item.live ? (
                        <span style={{ color: C.green }}>● live</span>
                      ) : (
                        <span>● ref 2024</span>
                      )}
                      {' · '}{item.source}
                    </div>
                    {item.date && (
                      <div style={{ fontSize: 9, color: C.faint }}>
                        FRED data: {item.date}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                      ${item.usdPrice.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: C.gold, fontWeight: 500 }}>
                      {toS(item.usdPrice) !== null ? `${toS(item.usdPrice)} S` : '—'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Total row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px',
                gap: 8,
                padding: '12px 0 0',
              }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, letterSpacing: '0.05em' }}>
                  TOTAL BASKET
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: C.text, fontWeight: 700 }}>
                  ${totalUSD?.toFixed(2)}
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: C.gold, fontWeight: 700 }}>
                  {toS(totalUSD) !== null ? `${toS(totalUSD)} S` : '—'}
                </div>
              </div>
            </div>

            {/* How the rate is used */}
            <div style={{ ...card, background: C.bg }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>
                HOW THE RATE IS ANCHORED
              </div>
              <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.8 }}>
                The Fisc targets a fixed basket price in S. When external prices rise, the F9
                algorithm adjusts the exchange rate upward so the basket stays affordable to
                S-holders. When the colony has a strong reserve surplus (abundance), downward
                pressure is applied instead.
              </div>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Basket price target', value: '5 S' },
                  { label: 'Implied rate', value: fiscRate ? `$${(totalUSD / 5).toFixed(3)}/S` : '—' },
                  { label: 'Live on-chain rate', value: fiscRate ? `$${fiscRate.toFixed(3)}/S` : '—' },
                  { label: 'Rate deviation', value: fiscRate ? `${(((fiscRate - totalUSD / 5) / (totalUSD / 5)) * 100).toFixed(1)}%` : '—' },
                ].map(r => (
                  <div key={r.label} style={{ background: C.white, borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 4 }}>{r.label.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timestamp */}
            {generatedAt && (
              <div style={{ fontSize: 10, color: C.faint, textAlign: 'center', marginTop: 10 }}>
                Prices fetched {new Date(generatedAt).toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
