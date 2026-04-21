import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import EntityImage from '../components/EntityImage'
import { useWallet } from '../App'
import { C } from '../theme'

const FACTORY_ABI = [
  "function companyCount() view returns (uint256)",
  "function getCompany(uint256) view returns (string, address, address, uint256, uint256)",
]
const COMPANY_NAME_ABI = ["function name() view returns (string)"]

export default function Mall() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { contracts, onChain } = useWallet()

  const factoryAddr = contracts?.colonies?.[slug]?.companyFactory

  const [stores,  setStores]  = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!factoryAddr || !slug) { setLoading(false); return }
    let cancelled = false
    const rpc     = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const factory = new ethers.Contract(factoryAddr, FACTORY_ABI, rpc)

    async function loadStores() {
      const count = Number(await factory.companyCount())
      const raw   = await Promise.all(
        Array.from({ length: count }, (_, i) => factory.getCompany(i))
      )
      return Promise.all(
        raw.map(async ([, wallet]) => {
          const addr = wallet.toLowerCase()
          try {
            const co   = new ethers.Contract(wallet, COMPANY_NAME_ABI, rpc)
            const name = await co.name()
            return { addr, name }
          } catch {
            return { addr, name: addr.slice(0, 10) + '…' }
          }
        })
      )
    }

    async function loadProducts() {
      const r    = await fetch(`/api/products?colony=${slug}`)
      const data = await r.json()
      return data.products || []
    }

    Promise.all([loadStores(), loadProducts()])
      .then(([storeList, productList]) => {
        if (cancelled) return
        setStores(storeList)
        setProducts(productList)
      })
      .catch(e => console.warn('[Mall] load failed:', e.message))
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [factoryAddr, slug])

  // Count available products per company address
  const productCount = {}
  for (const p of products) {
    if (p.available) productCount[p.company_addr] = (productCount[p.company_addr] || 0) + 1
  }

  const colonyName = onChain?.[slug]?.colonyName || slug

  return (
    <Layout title="Mall" colonySlug={slug}>
      <div style={{ padding: '16px 16px 40px' }}>

        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 18 }}>
          {colonyName} · COLONY MALL
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: C.faint, fontSize: 12 }}>
            Loading stores…
          </div>
        )}

        {!loading && stores.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: C.faint, fontSize: 12, lineHeight: 1.7 }}>
            No stores open yet.<br />
            Companies can list products from their company page.
          </div>
        )}

        {!loading && stores.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stores.map(store => {
              const count = productCount[store.addr] || 0
              return (
                <button
                  key={store.addr}
                  onClick={() => navigate(`/colony/${slug}/mall/${store.addr}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '14px 16px',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  <EntityImage
                    colony={slug}
                    entityType="company"
                    entityId={store.addr}
                    size={52}
                    label={store.name.slice(0, 2).toUpperCase()}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4, letterSpacing: '0.01em' }}>
                      {store.name}
                    </div>
                    <div style={{ fontSize: 11, color: count > 0 ? C.sub : C.faint }}>
                      {count === 0
                        ? 'No products listed yet'
                        : `${count} product${count !== 1 ? 's' : ''} available`}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: C.gold, flexShrink: 0, letterSpacing: '0.04em' }}>
                    Browse →
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
