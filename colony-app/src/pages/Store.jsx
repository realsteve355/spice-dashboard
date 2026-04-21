import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'

const COMPANY_ABI = [
  "function name() view returns (string)",
  "function secretary() view returns (address)",
]

// Shared canvas resize → JPEG for product image uploads
function resizeToJpeg(dataUrl, maxPx) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale  = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width  * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

export default function Store() {
  const { slug, companyAddr } = useParams()
  const navigate = useNavigate()
  const { address, isCitizenOf, contracts } = useWallet()

  const isCitizen   = isCitizenOf(slug)
  const addr        = companyAddr?.toLowerCase()

  const [companyName, setCompanyName] = useState('')
  const [secretary,   setSecretary]   = useState(null)
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [reloadKey,   setReloadKey]   = useState(0)

  // Load company name + secretary from chain
  useEffect(() => {
    if (!companyAddr) return
    const rpc = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const co  = new ethers.Contract(companyAddr, COMPANY_ABI, rpc)
    Promise.all([co.name(), co.secretary()])
      .then(([name, sec]) => {
        setCompanyName(name)
        setSecretary(sec.toLowerCase())
      })
      .catch(() => {})
  }, [companyAddr])

  // Load products from API
  useEffect(() => {
    if (!slug || !addr) return
    setLoading(true)
    fetch(`/api/products?colony=${slug}&companyAddr=${addr}`)
      .then(r => r.json())
      .then(({ products: rows }) => setProducts(rows || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug, addr, reloadKey])

  const isSecretary = !!address && secretary === address?.toLowerCase()
  const available   = products.filter(p => p.available)
  const hidden      = products.filter(p => !p.available)

  // ── Add product ─────────────────────────────────────────────────────────────
  const [adding,    setAdding]    = useState(false)
  const [pName,     setPName]     = useState('')
  const [pDesc,     setPDesc]     = useState('')
  const [pPrice,    setPPrice]    = useState('')
  const [pCategory, setPCategory] = useState('')
  const [pSaving,   setPSaving]   = useState(false)
  const [pError,    setPError]    = useState(null)

  async function handleAdd() {
    if (!pName.trim()) return
    setPSaving(true); setPError(null)
    try {
      const r = await fetch('/api/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action: 'add', colony: slug, companyAddr: addr, companyName,
          name: pName, description: pDesc, price: Number(pPrice) || 0, category: pCategory,
        }),
      })
      if (!r.ok) throw new Error((await r.json()).error)
      setAdding(false)
      setPName(''); setPDesc(''); setPPrice(''); setPCategory('')
      setReloadKey(k => k + 1)
    } catch (e) {
      setPError(e.message)
    }
    setPSaving(false)
  }

  // ── Edit product ────────────────────────────────────────────────────────────
  // Track when an image has been uploaded for a product so product cards refresh their URL
  const [imgVersions, setImgVersions] = useState({})

  function handleImageUploaded(productId) {
    setImgVersions(prev => ({ ...prev, [productId]: Date.now() }))
  }

  const [editProduct, setEditProduct] = useState(null)   // product object being edited
  const [eName,       setEName]       = useState('')
  const [eDesc,       setEDesc]       = useState('')
  const [ePrice,      setEPrice]      = useState('')
  const [eCategory,   setECategory]   = useState('')
  const [eSaving,     setESaving]     = useState(false)
  const [eError,      setEError]      = useState(null)

  function startEdit(p) {
    setEditProduct(p)
    setEName(p.name)
    setEDesc(p.description || '')
    setEPrice(String(p.price))
    setECategory(p.category || '')
    setEError(null)
  }

  async function handleEdit() {
    if (!editProduct || !eName.trim()) return
    setESaving(true); setEError(null)
    try {
      const r = await fetch('/api/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action: 'update', productId: editProduct.id,
          name: eName, description: eDesc,
          price: Number(ePrice) || 0, category: eCategory,
        }),
      })
      if (!r.ok) throw new Error((await r.json()).error)
      setEditProduct(null)
      setReloadKey(k => k + 1)
    } catch (e) {
      setEError(e.message)
    }
    setESaving(false)
  }

  async function handleToggle(product) {
    await fetch('/api/products', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'update', productId: product.id, available: !product.available }),
    })
    setReloadKey(k => k + 1)
  }

  // Inline delete confirmation to avoid browser confirm() dialog
  const [confirmDelete, setConfirmDelete] = useState(null)   // productId

  async function handleDelete(productId) {
    await fetch('/api/products', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'delete', productId }),
    })
    setConfirmDelete(null)
    setReloadKey(k => k + 1)
  }

  // ── Buy ──────────────────────────────────────────────────────────────────────
  const [buyProduct, setBuyProduct] = useState(null)
  const [delivery,   setDelivery]   = useState('')

  function handleBuy() {
    if (!buyProduct) return
    const note = delivery.trim()
      ? `${buyProduct.name} — delivery: ${delivery.trim()}`
      : buyProduct.name
    const storeUrl = `/colony/${slug}/mall/${companyAddr}`
    navigate(`/colony/${slug}/pay?to=${companyAddr}&amount=${buyProduct.price}&note=${encodeURIComponent(note)}&returnTo=${encodeURIComponent(storeUrl)}`)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Layout title={companyName || 'Store'} back={`/colony/${slug}/mall`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 40px' }}>

        {/* Store header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '14px 16px', marginBottom: 16,
        }}>
          <CompanyImage slug={slug} addr={addr} name={companyName} isSecretary={isSecretary} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 4 }}>
              {companyName || '…'}
            </div>
            <div style={{ fontSize: 11, color: C.faint }}>
              {available.length === 0 ? 'No products available' : `${available.length} product${available.length !== 1 ? 's' : ''} available`}
              {isSecretary && ' · you manage this store'}
            </div>
          </div>
        </div>

        {/* Add product button — secretary only */}
        {isSecretary && !adding && (
          <button
            onClick={() => setAdding(true)}
            style={{ ...outlineBtn, width: '100%', marginBottom: 12 }}
          >
            + Add product
          </button>
        )}

        {/* Add product form */}
        {adding && (
          <div style={{
            background: C.white, border: `1px solid ${C.gold}40`,
            borderRadius: 10, padding: 16, marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>ADD PRODUCT</div>
            <Field label="Product name" value={pName} onChange={setPName} placeholder="e.g. Sourdough loaf" />
            <Field label="Description (optional)" value={pDesc} onChange={setPDesc} placeholder="Brief description" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Price (S)" value={pPrice} onChange={setPPrice} placeholder="0" type="number" />
              <Field label="Category" value={pCategory} onChange={setPCategory} placeholder="e.g. Food" />
            </div>
            {pError && <div style={{ fontSize: 11, color: C.red, marginTop: 6 }}>{pError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setAdding(false); setPError(null) }} style={{ ...outlineBtn, flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={pSaving || !pName.trim()}
                style={{ ...solidBtn(C.gold), flex: 2, opacity: (!pName.trim() || pSaving) ? 0.4 : 1 }}
              >
                {pSaving ? 'Adding…' : 'Add product →'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12 }}>Loading…</div>
        )}

        {/* Product grid — available */}
        {!loading && available.length === 0 && !adding && (
          <div style={{ textAlign: 'center', padding: 40, color: C.faint, fontSize: 12, lineHeight: 1.7 }}>
            {isSecretary
              ? 'No products listed yet. Add your first product above.'
              : 'No products available at the moment.'}
          </div>
        )}

        {available.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {available.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                slug={slug}
                isSecretary={isSecretary}
                isCitizen={isCitizen}
                address={address}
                imgVersion={imgVersions[product.id] || 0}
                onImageUploaded={handleImageUploaded}
                confirmDelete={confirmDelete}
                onBuy={() => { setBuyProduct(product); setDelivery('') }}
                onEdit={() => startEdit(product)}
                onToggle={() => handleToggle(product)}
                onDeleteStart={() => setConfirmDelete(product.id)}
                onDeleteCancel={() => setConfirmDelete(null)}
                onDeleteConfirm={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}

        {/* Hidden products — secretary only */}
        {isSecretary && hidden.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.1em', marginBottom: 8 }}>
              HIDDEN FROM MALL
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {hidden.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  slug={slug}
                  isSecretary={isSecretary}
                  isCitizen={isCitizen}
                  address={address}
                  imgVersion={imgVersions[product.id] || 0}
                  onImageUploaded={handleImageUploaded}
                  confirmDelete={confirmDelete}
                  onBuy={null}
                  onEdit={() => startEdit(product)}
                  onToggle={() => handleToggle(product)}
                  onDeleteStart={() => setConfirmDelete(product.id)}
                  onDeleteCancel={() => setConfirmDelete(null)}
                  onDeleteConfirm={() => handleDelete(product.id)}
                  dimmed
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Edit product bottom sheet ──────────────────────────────────────── */}
      {editProduct && (
        <BottomSheet onClose={() => setEditProduct(null)}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 14 }}>
            EDIT PRODUCT
          </div>
          {/* Product image upload */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
            <ProductImage
              slug={slug}
              productId={editProduct.id}
              name={editProduct.name}
              isSecretary
              size={84}
              onUpload={handleImageUploaded}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Field label="Product name" value={eName} onChange={setEName} placeholder="Product name" />
              <Field label="Category" value={eCategory} onChange={setECategory} placeholder="e.g. Food" />
            </div>
          </div>
          <Field label="Description" value={eDesc} onChange={setEDesc} placeholder="Optional description" />
          <Field label="Price (S)" value={ePrice} onChange={setEPrice} placeholder="0" type="number" />
          {eError && <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>{eError}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => setEditProduct(null)} style={{ ...outlineBtn, flex: 1 }}>Cancel</button>
            <button
              onClick={handleEdit}
              disabled={eSaving || !eName.trim()}
              style={{ ...solidBtn(C.gold), flex: 2, opacity: (!eName.trim() || eSaving) ? 0.4 : 1 }}
            >
              {eSaving ? 'Saving…' : 'Save changes →'}
            </button>
          </div>
        </BottomSheet>
      )}

      {/* ── Buy bottom sheet ──────────────────────────────────────────────── */}
      {buyProduct && (
        <BottomSheet onClose={() => setBuyProduct(null)}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 14 }}>
            PURCHASE
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
            <ProductImage slug={slug} productId={buyProduct.id} name={buyProduct.name} size={72} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                {buyProduct.name}
              </div>
              {buyProduct.category && (
                <div style={{ fontSize: 10, color: C.faint, marginBottom: 4, letterSpacing: '0.05em' }}>
                  {buyProduct.category.toUpperCase()}
                </div>
              )}
              {buyProduct.description && (
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                  {buyProduct.description}
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, color: C.gold, marginBottom: 16, textAlign: 'center' }}>
            {buyProduct.price} S
          </div>
          <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>
            DELIVERY NOTES (optional)
          </div>
          <input
            style={inputStyle}
            placeholder="e.g. Wednesday 14 May, morning — or leave blank"
            value={delivery}
            onChange={e => setDelivery(e.target.value)}
          />
          {!isCitizen && address && (
            <div style={{ fontSize: 11, color: C.red, marginTop: 8 }}>
              You must be a colony citizen to make purchases.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setBuyProduct(null)} style={{ ...outlineBtn, flex: 1 }}>Cancel</button>
            <button
              onClick={handleBuy}
              disabled={!address || !isCitizen}
              style={{ ...solidBtn(C.gold), flex: 2, opacity: (!address || !isCitizen) ? 0.4 : 1 }}
            >
              {!address ? 'Connect wallet to buy' : `Pay ${buyProduct.price} S →`}
            </button>
          </div>
        </BottomSheet>
      )}

    </Layout>
  )
}

// ── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({ product, slug, isSecretary, isCitizen, address, confirmDelete,
  imgVersion, onImageUploaded,
  onBuy, onEdit, onToggle, onDeleteStart, onDeleteCancel, onDeleteConfirm, dimmed }) {

  const isConfirmingDelete = confirmDelete === product.id

  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden',
      opacity: dimmed ? 0.55 : 1,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Square product image — fills card width */}
      <ProductImage
        slug={slug}
        productId={product.id}
        name={product.name}
        version={imgVersion}
        onUpload={onImageUploaded}
      />

      {/* Content */}
      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category */}
        {product.category && (
          <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>
            {product.category.toUpperCase()}
          </div>
        )}

        {/* Name */}
        <div style={{
          fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {product.name}
        </div>

        {/* Description */}
        {product.description && (
          <div style={{
            fontSize: 10, color: C.faint, marginBottom: 6, lineHeight: 1.4, flex: 1,
            overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {product.description}
          </div>
        )}

        {/* Price + buy */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.gold }}>
            {product.price} <span style={{ fontSize: 11 }}>S</span>
          </span>
          {!isSecretary && onBuy && (
            <button
              onClick={onBuy}
              disabled={!address || !isCitizen}
              style={{
                ...tinyBtn(C.gold, C.bg),
                opacity: (!address || !isCitizen) ? 0.4 : 1,
              }}
            >
              Buy
            </button>
          )}
        </div>

        {/* Secretary controls */}
        {isSecretary && (
          <div style={{ marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            {isConfirmingDelete ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={onDeleteCancel} style={{ ...tinyBtn(C.faint, C.text), flex: 1 }}>Keep</button>
                <button onClick={onDeleteConfirm} style={{ ...tinyBtn(C.red, '#fff'), flex: 1 }}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={onEdit}   style={{ ...tinyBtn(C.faint, C.text), flex: 1 }}>Edit</button>
                <button onClick={onToggle} style={{ ...tinyBtn(C.faint, C.text), flex: 1 }}>
                  {product.available ? 'Hide' : 'Show'}
                </button>
                <button onClick={onDeleteStart} style={{ ...tinyBtn(C.red + '33', C.red), flex: 1 }}>Del</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ProductImage ───────────────────────────────────────────────────────────────
// Responsive square image (fills card width via paddingTop:100% trick).
// Secretary can tap to upload a photo.

function ProductImage({ slug, productId, name, isSecretary, size, version = 0, onUpload }) {
  const [imgError,  setImgError]  = useState(false)
  const [localUrl,  setLocalUrl]  = useState(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const supaBase = import.meta.env.VITE_SUPABASE_URL
  // Append ?v= to bust browser cache after a fresh upload
  const remoteSrc = supaBase && productId
    ? `${supaBase}/storage/v1/object/public/colony-media/${slug}/product/${productId}.jpg${version > 0 ? `?v=${version}` : ''}`
    : null

  // Reset error state whenever the URL changes (e.g. after an upload bumps version)
  useEffect(() => {
    setImgError(false)
    setLocalUrl(null)
  }, [remoteSrc])

  const src             = localUrl || remoteSrc
  const showPlaceholder = !src || imgError
  const initials        = (name || '??').slice(0, 2).toUpperCase()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const raw = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload  = ev => res(ev.target.result)
        reader.onerror = rej
        reader.readAsDataURL(file)
      })
      const dataUrl = await resizeToJpeg(raw, 600)
      const r = await fetch('/api/media', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ colony: slug, entityType: 'product', entityId: productId, dataUrl }),
      })
      if (r.ok) {
        setLocalUrl(dataUrl)
        setImgError(false)
        // Notify Store so it can bump the version on the product card's ProductImage
        onUpload?.(productId)
      }
    } catch {}
    setUploading(false)
  }

  // Fixed-size variant (used in buy/edit bottom sheets)
  if (size) {
    return (
      <div
        onClick={() => isSecretary && !uploading && inputRef.current?.click()}
        style={{
          width: size, height: size, borderRadius: 8, flexShrink: 0,
          background: showPlaceholder ? C.border : 'transparent',
          overflow: 'hidden', position: 'relative',
          cursor: isSecretary ? 'pointer' : 'default',
        }}
      >
        {!showPlaceholder && (
          <img src={src} alt="" onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {showPlaceholder && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: size * 0.28, color: C.faint, fontFamily: "'IBM Plex Mono', monospace" }}>
            {initials}
          </div>
        )}
        {isSecretary && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 9, textAlign: 'center', padding: '3px 0' }}>
            {uploading ? '…' : 'photo'}
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }} onChange={handleFile} />
      </div>
    )
  }

  // Full-width responsive square (used in product cards)
  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '100%',
      overflow: 'hidden', cursor: isSecretary ? 'pointer' : 'default' }}
      onClick={() => isSecretary && !uploading && inputRef.current?.click()}
    >
      {!showPlaceholder && (
        <img src={src} alt="" onError={() => setImgError(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {showPlaceholder && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24, color: C.faint, fontFamily: "'IBM Plex Mono', monospace" }}>
          {initials}
        </div>
      )}
      {isSecretary && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 9, textAlign: 'center', padding: '4px 0',
          letterSpacing: '0.05em' }}>
          {uploading ? '…' : 'tap to add photo'}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

// Company logo (round) — used in store header. Reads from Supabase, not editable here.
function CompanyImage({ slug, addr, name, isSecretary }) {
  const [imgError, setImgError] = useState(false)
  const supaBase  = import.meta.env.VITE_SUPABASE_URL
  const src       = supaBase && addr
    ? `${supaBase}/storage/v1/object/public/colony-media/${slug}/company/${addr}.jpg`
    : null
  const initials  = (name || '??').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: 56, height: 56, borderRadius: 28, flexShrink: 0,
      background: C.border, overflow: 'hidden', border: `1px solid ${C.border}` }}>
      {src && !imgError ? (
        <img src={src} alt="" onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, color: C.faint, fontFamily: "'IBM Plex Mono', monospace" }}>
          {initials}
        </div>
      )}
    </div>
  )
}

// ── BottomSheet ───────────────────────────────────────────────────────────────

function BottomSheet({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: C.white, borderRadius: '16px 16px 0 0',
        padding: '20px 20px 40px', width: '100%', maxWidth: 480,
        maxHeight: '85vh', overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <input
        style={inputStyle}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        type={type || 'text'}
      />
    </div>
  )
}

function tinyBtn(bg, color) {
  return {
    fontSize: 10, color, background: bg,
    border: 'none', borderRadius: 4, padding: '4px 8px',
    cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap',
  }
}

function solidBtn(bg, color = C.bg) {
  return {
    padding: '11px 14px', background: bg, color,
    border: 'none', borderRadius: 6, fontSize: 11,
    cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.04em',
  }
}

const outlineBtn = {
  padding: '11px 14px', background: 'transparent', color: C.sub,
  border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11,
  cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace",
}

const inputStyle = {
  width: '100%', padding: '9px 10px',
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 12, color: C.text, background: C.bg, outline: 'none',
  fontFamily: "'IBM Plex Mono', monospace",
  boxSizing: 'border-box',
}
