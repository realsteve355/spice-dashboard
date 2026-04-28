import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import EntityImage from '../components/EntityImage'
import { useWallet } from '../App'
import { C } from '../theme'

import { fetchCitizens } from '../utils/fetchCitizens'

// AToken form codes
const FORM_UNILATERAL           = 0
const FORM_OBLIGATION_ASSET     = 3
const FORM_OBLIGATION_LIABILITY = 4

const ATOKEN_ABI = [
  "function tokensOf(address) view returns (uint256[])",
  "function tokens(uint256) view returns (uint8, address, address, uint256, bool)",
  "function assetData(uint256) view returns (uint256, uint256, bool, uint256, uint256)",
  "function currentAssetValue(uint256, uint256) view returns (uint256)",
  "function getObligation(uint256) view returns (address, address, uint256, uint256, uint256, uint256, bool)",
  "function nextId() view returns (uint256)",
  "function assetLabel(uint256) view returns (string)",
  "function escrowedFor(uint256) view returns (uint256)",
  "function getLandData(uint256) view returns (uint256 declaredValueV, uint256 lastFeeEpoch, bool isLand)",
  "function outstandingLandFeeEpochs(uint256, uint256) view returns (uint256)",
]

const COLONY_ABI = [
  "function registerAsset(string, uint256, uint256, bool, uint256) external returns (uint256)",
  "function transferAsset(uint256, address, uint256) external",
  "function claimLand(string, uint256) external returns (uint256)",
  "function updateLandValue(uint256, uint256) external",
  "function payLandStewardship(uint256) external",
  "function forcePurchaseLand(uint256, uint256) external",
  "function currentEpoch() view returns (uint256)",
  "function isCitizen(address) view returns (bool)",
  "function citizenName(address) view returns (string)",
]

const GOVERNANCE_ABI = [
  "function proposeObligation(address,address,uint256,uint256,uint256) external returns (uint256)",
  "function signObligation(uint256) external",
  "function pendingSignaturesFor(address) view returns (uint256[])",
  "function obligations(uint256) view returns (address,address,address,uint256,uint256,uint256,uint256,bool,bool,bool)",
]

// localStorage key for off-chain asset names: { "colonyAddr:tokenId": "name" }
function assetNameKey(colonyAddr, tokenId) { return `${colonyAddr}:${tokenId}` }
function getAssetNames() { return JSON.parse(localStorage.getItem('spice_asset_names') || '{}') }
function saveAssetName(colonyAddr, tokenId, name) {
  const names = getAssetNames()
  names[assetNameKey(colonyAddr, tokenId)] = name
  localStorage.setItem('spice_asset_names', JSON.stringify(names))
}

export default function Assets() {
  const { slug } = useParams()
  const { address, signer, contracts, isCitizenOf } = useWallet()
  const isCitizen = isCitizenOf(slug)

  const [tab,           setTab]           = useState('assets')
  const [loading,       setLoading]       = useState(true)
  const [myAssets,      setMyAssets]      = useState([])
  const [myOwed,        setMyOwed]        = useState([])   // OBLIGATION_LIABILITY — I owe
  const [myLent,        setMyLent]        = useState([])   // OBLIGATION_ASSET — owed to me
  const [pendingProps,  setPendingProps]  = useState([])   // obligation proposals awaiting my signature
  const [nameMap,       setNameMap]       = useState({})   // address.lower → citizen name
  const [citizens,      setCitizens]      = useState([])   // [{ address, name }]
  const [reloadKey,     setReloadKey]     = useState(0)
  const [publicAssets,  setPublicAssets]  = useState(null) // A-03: full registry browse — null until loaded
  const [publicLoading, setPublicLoading] = useState(false)
  const [landParcels,   setLandParcels]   = useState(null) // A-05+: Harberger land
  const [landLoading,   setLandLoading]   = useState(false)
  const [currentEpoch,  setCurrentEpoch]  = useState(0)

  useEffect(() => {
    const cfg = contracts?.colonies?.[slug]
    if (!cfg?.aToken || !cfg?.colony || !address) { setLoading(false); return }
    const rpc    = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const aToken = new ethers.Contract(cfg.aToken, ATOKEN_ABI, rpc)
    const colony = new ethers.Contract(cfg.colony, COLONY_ABI, rpc)
    let cancelled = false
    setLoading(true)

    async function load() {
      try {
        const [epoch, tokenIds] = await Promise.all([
          colony.currentEpoch().then(Number),
          aToken.tokensOf(address),
        ])
        const names = getAssetNames()

        const tokenMeta = await Promise.all(
          tokenIds.map(id => aToken.tokens(id).then(r => ({
            id: id.toString(),
            form: Number(r[0]), holder: r[1], counterparty: r[2],
            linkedId: r[3].toString(), active: r[4],
          })))
        )

        const assets = [], owed = [], lent = []

        await Promise.all(tokenMeta.map(async t => {
          if (!t.active) return

          if (t.form === FORM_UNILATERAL) {
            const [valRaw, wt, hasAI, depBps, regEpoch] = await aToken.assetData(t.id)
            let curRaw = valRaw
            if (Number(depBps) > 0) {
              try { curRaw = await aToken.currentAssetValue(t.id, epoch) } catch {}
            }
            assets.push({
              id:              t.id,
              name:            names[assetNameKey(cfg.colony, t.id)] || null,
              value:           Math.floor(Number(ethers.formatEther(valRaw))),
              currentValue:    Math.floor(Number(ethers.formatEther(curRaw))),
              weightKg:        Number(wt),
              hasAI:           Boolean(hasAI),
              depreciationBps: Number(depBps),
            })

          } else if (t.form === FORM_OBLIGATION_LIABILITY) {
            const [obligor, creditor, monthly, total, paid, colId, defaulted] =
              await aToken.getObligation(t.id)
            owed.push({
              id: t.id, creditor, obligor,
              monthly:    Math.floor(Number(ethers.formatEther(monthly))),
              totalEpochs: Number(total),
              epochsPaid:  Number(paid),
              collateralId: colId.toString(),
              defaulted,
            })

          } else if (t.form === FORM_OBLIGATION_ASSET) {
            try {
              const [obligor, creditor, monthly, total, paid, colId, defaulted] =
                await aToken.getObligation(t.linkedId)
              lent.push({
                id: t.id, liabilityId: t.linkedId, creditor, obligor,
                monthly:    Math.floor(Number(ethers.formatEther(monthly))),
                totalEpochs: Number(total),
                epochsPaid:  Number(paid),
                collateralId: colId.toString(),
                defaulted,
              })
            } catch {}
          }
        }))

        if (!cancelled) { setMyAssets(assets); setMyOwed(owed); setMyLent(lent) }

        // Fetch all citizens for name resolution and the obligation picker
        try {
          const citizenList = await fetchCitizens(cfg.colony)
          if (!cancelled) {
            setCitizens(citizenList)
            setNameMap(Object.fromEntries(citizenList.map(c => [c.address.toLowerCase(), c.name])))
          }
        } catch {}

        // Load pending obligation proposals from Governance
        if (cfg.governance && address) {
          try {
            const gov = new ethers.Contract(cfg.governance, GOVERNANCE_ABI, rpc)
            const ids = await gov.pendingSignaturesFor(address)
            const props = await Promise.all(ids.map(async id => {
              const r = await gov.obligations(id)
              return {
                id: id.toString(),
                proposer:       r[0],
                creditor:       r[1],
                obligor:        r[2],
                monthly:        Math.floor(Number(ethers.formatEther(r[3]))),
                totalEpochs:    Number(r[4]),
                collateralId:   r[5].toString(),
                expiresAt:      Number(r[6]),
                creditorSigned: r[7],
                obligorSigned:  r[8],
              }
            }))
            if (!cancelled) setPendingProps(props)
          } catch (e) {
            console.warn('[Assets] governance load failed:', e?.message || e)
          }
        }
      } catch (e) {
        console.warn('[Assets] load failed:', e?.message || e)
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [slug, address, contracts, reloadKey])

  function reload() { setReloadKey(k => k + 1) }

  // A-05+: lazy-load all Harberger land parcels when the user opens the Land tab
  useEffect(() => {
    if (tab !== 'land' || landParcels !== null) return
    const cfg = contracts?.colonies?.[slug]
    if (!cfg?.aToken || !cfg?.colony) return
    const rpc    = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const aToken = new ethers.Contract(cfg.aToken, ATOKEN_ABI, rpc)
    const colony = new ethers.Contract(cfg.colony, COLONY_ABI, rpc)
    let cancelled = false
    setLandLoading(true)

    async function loadLand() {
      try {
        const [nextIdRaw, epoch] = await Promise.all([
          aToken.nextId(),
          colony.currentEpoch().then(Number),
        ])
        if (!cancelled) setCurrentEpoch(epoch)
        const nextId = Number(nextIdRaw)
        const ids    = Array.from({ length: Math.max(0, nextId - 1) }, (_, i) => i + 1)
        const all = await Promise.all(ids.map(async (id) => {
          try {
            const t = await aToken.tokens(id)
            const active = Boolean(t[4])
            const form = Number(t[0])
            if (!active || form !== FORM_UNILATERAL) return null
            let isLand = false, declaredValueV = 0n, lastFeeEpoch = 0n
            try {
              const ld = await aToken.getLandData(id)
              isLand = Boolean(ld[2])
              if (!isLand) return null
              declaredValueV = ld[0]
              lastFeeEpoch   = ld[1]
            } catch { return null }
            const holder = String(t[1])
            let label = ''
            try { label = await aToken.assetLabel(id) } catch {}
            const outstanding = Math.max(0, epoch - Number(lastFeeEpoch))
            return {
              id:             String(id),
              label,
              holder,
              declaredValueV: Number(ethers.formatEther(declaredValueV)),
              lastFeeEpoch:   Number(lastFeeEpoch),
              outstanding,
            }
          } catch { return null }
        }))
        if (cancelled) return
        const filtered = all.filter(Boolean).sort((a, b) => Number(b.id) - Number(a.id))
        setLandParcels(filtered)
      } catch (e) {
        console.warn('[Assets] land load failed:', e?.message || e)
        if (!cancelled) setLandParcels([])
      }
      if (!cancelled) setLandLoading(false)
    }
    loadLand()
    return () => { cancelled = true }
  }, [tab, landParcels, contracts, slug])

  // A-03: lazy-load all UNILATERAL assets in the colony when the user opens the public tab
  useEffect(() => {
    if (tab !== 'public' || publicAssets !== null) return
    const cfg = contracts?.colonies?.[slug]
    if (!cfg?.aToken || !cfg?.colony) return
    const rpc    = new ethers.JsonRpcProvider('https://sepolia.base.org')
    const aToken = new ethers.Contract(cfg.aToken, ATOKEN_ABI, rpc)
    const colony = new ethers.Contract(cfg.colony, COLONY_ABI, rpc)
    let cancelled = false
    setPublicLoading(true)

    async function loadPublic() {
      try {
        const [nextIdRaw, epoch] = await Promise.all([
          aToken.nextId(),
          colony.currentEpoch().then(Number),
        ])
        const nextId = Number(nextIdRaw)
        const ids    = Array.from({ length: Math.max(0, nextId - 1) }, (_, i) => i + 1)

        const assetNames = getAssetNames()
        const all = await Promise.all(ids.map(async (id) => {
          try {
            const t = await aToken.tokens(id)
            const form = Number(t[0])
            const active = Boolean(t[4])
            if (!active || form !== FORM_UNILATERAL) return null
            const holder = String(t[1])
            const [valRaw, wt, hasAI, depBps] = await aToken.assetData(id)
            let curRaw = valRaw
            if (Number(depBps) > 0) {
              try { curRaw = await aToken.currentAssetValue(id, epoch) } catch {}
            }
            let label = ''
            try { label = await aToken.assetLabel(id) } catch {}
            // A-14: pledged to which obligation? 0 = free
            let escrowedFor = 0n
            try { escrowedFor = await aToken.escrowedFor(id) } catch {}
            return {
              id:           String(id),
              holder,
              label,
              localName:    assetNames[assetNameKey(cfg.colony, id)] || null,
              value:        Math.floor(Number(ethers.formatEther(valRaw))),
              currentValue: Math.floor(Number(ethers.formatEther(curRaw))),
              weightKg:     Number(wt),
              hasAI:        Boolean(hasAI),
              escrowedFor:  String(escrowedFor),
            }
          } catch {
            return null
          }
        }))

        if (cancelled) return
        const filtered = all.filter(Boolean).sort((a, b) => Number(b.id) - Number(a.id))
        setPublicAssets(filtered)
      } catch (e) {
        console.warn('[Assets] public load failed:', e?.message || e)
        if (!cancelled) setPublicAssets([])
      }
      if (!cancelled) setPublicLoading(false)
    }

    loadPublic()
    return () => { cancelled = true }
  }, [tab, publicAssets, contracts, slug])

  const cfg = contracts?.colonies?.[slug]

  return (
    <Layout title="Assets & Obligations" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', marginBottom: 12, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', background: C.white }}>
          {[['assets','My Assets'],['obligations','Obligations'],['public','Registry'],['land','Land']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0', background: tab === t ? C.gold : 'none',
              border: 'none', color: tab === t ? '#fff' : C.sub,
              fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
            }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'land' ? (
          <LandTab
            parcels={landParcels}
            loading={landLoading}
            nameMap={nameMap}
            myAddress={address}
            signer={signer}
            cfg={cfg}
            isCitizen={isCitizen}
            currentEpoch={currentEpoch}
            onReload={() => { setLandParcels(null) }}
          />
        ) : tab === 'public' ? (
          <PublicRegistryTab
            assets={publicAssets}
            loading={publicLoading}
            nameMap={nameMap}
            myAddress={address}
          />
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 32, fontSize: 12, color: C.faint }}>
            Loading…
          </div>
        ) : tab === 'assets' ? (
          <AssetsTab
            assets={myAssets}
            cfg={cfg}
            address={address}
            signer={signer}
            slug={slug}
            isCitizen={isCitizen}
            citizens={citizens}
            nameMap={nameMap}
            onReload={reload}
          />
        ) : (
          <ObligationsTab
            owed={myOwed}
            lent={myLent}
            pendingProps={pendingProps}
            assets={myAssets}
            nameMap={nameMap}
            citizens={citizens}
            cfg={cfg}
            address={address}
            signer={signer}
            isCitizen={isCitizen}
            onReload={reload}
          />
        )}
      </div>
    </Layout>
  )
}

// ── Assets tab ────────────────────────────────────────────────────────────────

function NotACitizenBanner() {
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px',
      marginBottom: 10, fontSize: 12, color: C.sub, background: C.white,
    }}>
      You are not a citizen of this colony. Join the colony to register assets and create obligations.
    </div>
  )
}

function AssetsTab({ assets, cfg, address, signer, slug, isCitizen, citizens, nameMap, onReload }) {
  const [registering,  setRegistering]  = useState(false)
  const [transferring, setTransferring] = useState(null)  // assetId or null
  const [actPending,   setActPending]   = useState(false)
  const [actError,     setActError]     = useState(null)
  const [actDone,      setActDone]      = useState(null)

  // Register form state
  const [rName,  setRName]  = useState('')
  const [rValue, setRValue] = useState('')
  const [rWt,    setRWt]    = useState('')
  const [rAI,    setRAI]    = useState(false)
  const [rDep,   setRDep]   = useState('0')
  const [rPhoto, setRPhoto] = useState(null)   // dataUrl for optional asset photo
  const photoInputRef       = useRef()

  // Transfer form state
  const [tTo,    setTTo]    = useState('')
  const [tPrice, setTPrice] = useState('')
  const [tError, setTError] = useState(null)

  const rValueNum = Number(rValue) || 0
  const rWtNum    = Number(rWt) || 0
  const meetsThreshold = rValueNum > 500 || rWtNum > 50 || rAI
  const canRegister = meetsThreshold && (rValueNum > 0 || rWtNum > 0 || rAI)

  async function handleRegister() {
    if (!signer || !cfg?.colony || !canRegister) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.registerAsset(
        rName.trim(),
        ethers.parseEther(String(rValueNum || 0)),
        BigInt(rWtNum),
        rAI,
        BigInt(Number(rDep) || 0),
      )
      const receipt = await tx.wait()
      // Try to extract token ID from AssetRegistered event
      const iface = new ethers.Interface(["event AssetRegistered(uint256 indexed id, address indexed holder, uint256 valueSTokens)"])
      let newId = null
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log)
          if (parsed) { newId = parsed.args.id.toString(); break }
        } catch {}
      }
      // Save name to localStorage if provided
      if (rName.trim() && newId && cfg.colony) {
        saveAssetName(cfg.colony, newId, rName.trim())
      }
      // Upload photo if one was chosen
      if (rPhoto && newId) {
        try {
          await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ colony: slug, entityType: 'asset', entityId: newId, dataUrl: rPhoto }),
          })
        } catch {}
      }
      setActDone(`Asset registered${newId ? ` (ID ${newId})` : ''}`)
      setRegistering(false)
      setRName(''); setRValue(''); setRWt(''); setRAI(false); setRDep('0'); setRPhoto(null)
      onReload()
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  async function handleTransfer(assetId) {
    const recipientAddr = citizens.find(c => c.address.toLowerCase() === tTo.toLowerCase())?.address || tTo
    if (!signer || !cfg?.colony || !recipientAddr || !tPrice) return
    if (!ethers.isAddress(recipientAddr)) { setTError('Select a valid recipient'); return }
    setActPending(true); setActError(null); setActDone(null)
    try {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const recipientAddr = citizens.find(c => c.address.toLowerCase() === tTo.toLowerCase())?.address || tTo
      const tx = await colony.transferAsset(BigInt(assetId), recipientAddr, ethers.parseEther(tPrice))
      await tx.wait()
      setActDone('Asset transferred')
      setTransferring(null); setTTo(''); setTPrice('')
      onReload()
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  return (
    <div>
      {actDone  && <div style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>✓ {actDone}</div>}
      {actError && <div style={{ fontSize: 12, color: C.red,   marginBottom: 8 }}>{actError}</div>}

      {/* Asset list */}
      <div style={card}>
        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>REGISTERED ASSETS</div>

        {assets.length === 0 ? (
          <div style={{ fontSize: 12, color: C.faint }}>No assets registered.</div>
        ) : assets.map((a, i) => (
          <div key={a.id} style={{
            paddingBottom: i < assets.length - 1 ? 12 : 0,
            marginBottom:  i < assets.length - 1 ? 12 : 0,
            borderBottom:  i < assets.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <EntityImage
                  colony={slug}
                  entityType="asset"
                  entityId={a.id}
                  editable
                  size={36}
                  label={(a.name || `A${a.id}`).slice(0, 2).toUpperCase()}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                    {a.name || `Asset #${a.id}`}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>
                    ID {a.id}
                    {a.weightKg > 0 && ` · ${a.weightKg} kg`}
                    {a.hasAI && ' · autonomous AI'}
                    {a.depreciationBps > 0 && ` · ${a.depreciationBps} bps/epoch depreciation`}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.gold }}>{a.currentValue} S</div>
                {a.currentValue !== a.value && (
                  <div style={{ fontSize: 10, color: C.faint }}>reg. {a.value} S</div>
                )}
              </div>
            </div>

            {/* Transfer */}
            <div style={{ marginTop: 8 }}>
              {transferring === a.id ? (
                <div style={{ background: `${C.gold}08`, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10 }}>
                  <div style={{ fontSize: 10, color: C.faint, marginBottom: 8 }}>TRANSFER ASSET</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select style={{ ...selectStyle, flex: 2 }}
                      value={tTo} onChange={e => { setTTo(e.target.value); setTError(null) }}>
                      <option value="">Select recipient…</option>
                      {citizens.filter(c => c.address.toLowerCase() !== address?.toLowerCase()).map(c => (
                        <option key={c.address} value={c.address.toLowerCase()}>{c.name}</option>
                      ))}
                    </select>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input style={{ ...inlineInput, width: '100%', paddingRight: 18 }} placeholder="Price"
                        type="number" value={tPrice} onChange={e => setTPrice(e.target.value)} />
                      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: C.faint }}>S</span>
                    </div>
                  </div>
                  {tError && <div style={{ fontSize: 11, color: C.red, marginBottom: 6 }}>{tError}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setTransferring(null); setTTo(''); setTPrice(''); setTError(null) }}
                      style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
                    <button onClick={() => handleTransfer(a.id)}
                      disabled={actPending || !tTo || !tPrice || tTo === ''}
                      style={{ ...actionBtn(C.gold), flex: 2, opacity: (actPending || !tTo || !tPrice) ? 0.4 : 1 }}>
                      {actPending ? 'Transferring…' : 'Transfer →'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setTransferring(a.id); setTTo(''); setTPrice(String(a.currentValue)) }}
                  style={{ ...ghostBtn, fontSize: 10 }}>
                  Transfer asset →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Register form */}
      {!isCitizen ? <NotACitizenBanner /> : <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: registering ? 12 : 0 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>REGISTER AN ASSET</div>
          <button onClick={() => setRegistering(v => !v)} style={{ ...ghostBtn, fontSize: 10 }}>
            {registering ? 'Cancel' : '+ Register'}
          </button>
        </div>

        {registering && (
          <div>
            <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginBottom: 12 }}>
              Threshold: declared value &gt; 500 S, weight &gt; 50 kg, or autonomous AI capability.
            </div>

            <Field label="Name (optional, stored locally)" value={rName} onChange={setRName} placeholder="e.g. Delivery van, Workshop lathe" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <Field label="Declared value (S)" value={rValue} onChange={setRValue} placeholder="e.g. 2000" type="number" />
              <Field label="Weight (kg)" value={rWt} onChange={setRWt} placeholder="e.g. 80" type="number" />
            </div>
            <Field label="Depreciation (bps/epoch, 0 = none)" value={rDep} onChange={setRDep} placeholder="0" type="number" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button
                onClick={() => setRAI(v => !v)}
                style={{
                  width: 36, height: 20, borderRadius: 10, padding: 0, cursor: 'pointer',
                  background: rAI ? C.gold : C.border, border: 'none', position: 'relative',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: rAI ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.15s',
                }} />
              </button>
              <span style={{ fontSize: 11, color: C.sub }}>Autonomous AI capability</span>
            </div>

            {!meetsThreshold && (rValue || rWt) && (
              <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>
                Does not meet registration threshold (value &gt; 500 S, weight &gt; 50 kg, or AI required).
              </div>
            )}

            {/* Optional photo */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.faint, marginBottom: 6 }}>Photo (optional)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {rPhoto ? (
                  <img src={rPhoto} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: `1px solid ${C.border}` }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 6, border: `1px dashed ${C.border}`, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: C.faint }} />
                )}
                <button onClick={() => photoInputRef.current?.click()} style={{ ...ghostBtn, fontSize: 10 }}>
                  {rPhoto ? 'Change photo' : 'Add photo'}
                </button>
                {rPhoto && (
                  <button onClick={() => setRPhoto(null)} style={{ fontSize: 10, color: C.red, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Remove
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={async e => {
                    const file = e.target.files?.[0]; e.target.value = ''
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = async ev => {
                      const raw = ev.target.result
                      const img = new Image()
                      img.onload = () => {
                        const scale = Math.min(1, 400 / Math.max(img.width, img.height))
                        const canvas = document.createElement('canvas')
                        canvas.width = Math.round(img.width * scale)
                        canvas.height = Math.round(img.height * scale)
                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
                        setRPhoto(canvas.toDataURL('image/jpeg', 0.82))
                      }
                      img.src = raw
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={actPending || !canRegister}
              style={{ ...actionBtn(C.gold), width: '100%', opacity: (actPending || !canRegister) ? 0.4 : 1 }}
            >
              {actPending ? 'Registering…' : 'Register on Fisc →'}
            </button>
          </div>
        )}
      </div>}
    </div>
  )
}

// ── Obligations tab ───────────────────────────────────────────────────────────

function ObligationsTab({ owed, lent, pendingProps, assets, nameMap, citizens, cfg, address, signer, isCitizen, onReload }) {
  const [proposing,  setProposing]  = useState(false)
  const [actPending, setActPending] = useState(false)
  const [actError,   setActError]   = useState(null)
  const [actDone,    setActDone]    = useState(null)
  const [signing,    setSigning]    = useState(null)   // id being signed
  const [signedIds,  setSignedIds]  = useState(() => new Set()) // optimistic removal

  // Propose form
  const [myRole,    setMyRole]    = useState('creditor')  // 'creditor' or 'obligor'
  const [otherAddr, setOtherAddr] = useState('')
  const [monthly,   setMonthly]   = useState('')
  const [epochs,    setEpochs]    = useState('')
  const [collatId,  setCollatId]  = useState('')

  const canPropose = ethers.isAddress(otherAddr) && Number(monthly) > 0 && Number(epochs) > 0

  async function handlePropose() {
    if (!signer || !cfg?.governance || !canPropose) return
    setActPending(true); setActError(null); setActDone(null)
    try {
      const gov      = new ethers.Contract(cfg.governance, GOVERNANCE_ABI, signer)
      const creditor = myRole === 'creditor' ? address : otherAddr
      const obligor  = myRole === 'obligor'  ? address : otherAddr
      const tx = await gov.proposeObligation(
        creditor,
        obligor,
        ethers.parseEther(String(monthly)),
        BigInt(epochs),
        BigInt(Number(collatId) || 0),
      )
      await tx.wait()
      setActDone(`Proposal submitted — the other party must sign to activate.`)
      setProposing(false)
      setOtherAddr(''); setMonthly(''); setEpochs(''); setCollatId('')
      onReload()
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setActPending(false)
  }

  async function handleSign(id) {
    if (!signer || !cfg?.governance) return
    setSigning(id); setActError(null); setActDone(null)
    try {
      const gov = new ethers.Contract(cfg.governance, GOVERNANCE_ABI, signer)
      const tx  = await gov.signObligation(BigInt(id))
      await tx.wait()
      setSignedIds(prev => { const s = new Set(prev); s.add(id); return s })
      setActDone(`Obligation signed. It is now active.`)
      onReload()
    } catch (e) {
      setActError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setSigning(null)
  }

  const totalOwed = owed.reduce((s, o) => s + o.monthly, 0)
  const totalLent = lent.reduce((s, l) => s + l.monthly, 0)

  return (
    <div>
      {actDone  && <div style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>✓ {actDone}</div>}
      {actError && <div style={{ fontSize: 12, color: C.red,   marginBottom: 8 }}>{actError}</div>}

      {/* Pending signatures */}
      {pendingProps.filter(p => !signedIds.has(p.id)).length > 0 && (
        <div style={{ ...card, borderColor: C.gold }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>
            AWAITING YOUR SIGNATURE
          </div>
          {pendingProps.filter(p => !signedIds.has(p.id)).map((p, i, arr) => {
            const isCreditor = p.creditor.toLowerCase() === address?.toLowerCase()
            const counterparty = isCreditor ? p.obligor : p.creditor
            const role = isCreditor ? 'creditor (receive)' : 'obligor (pay)'
            const expiry = new Date(p.expiresAt * 1000).toLocaleDateString()
            const isLast = i === arr.length - 1
            return (
              <div key={p.id} style={{
                paddingBottom: isLast ? 0 : 12, marginBottom: isLast ? 0 : 12,
                borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.text }}>
                    {p.monthly} S/month × {p.totalEpochs} months
                    {p.collateralId !== '0' && ` · secured`}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>
                    Your role: {role}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 1 }}>
                    Counterparty: {nameMap[counterparty?.toLowerCase()] || `${counterparty.slice(0,6)}…${counterparty.slice(-4)}`}
                    {' · '}expires {expiry}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 1 }}>
                    Proposed by: {nameMap[p.proposer?.toLowerCase()] || `${p.proposer.slice(0,6)}…${p.proposer.slice(-4)}`}
                    {' · '}ID #{p.id}
                  </div>
                </div>
                <button
                  onClick={() => handleSign(p.id)}
                  disabled={signing === p.id}
                  style={{ ...actionBtn(C.gold), opacity: signing === p.id ? 0.4 : 1, whiteSpace: 'nowrap' }}
                >
                  {signing === p.id ? 'Signing…' : 'Sign →'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* I owe */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>I OWE</div>
          {totalOwed > 0 && (
            <div style={{ fontSize: 12, color: C.red, fontWeight: 500 }}>{totalOwed} S/month total</div>
          )}
        </div>
        {owed.length === 0 ? (
          <div style={{ fontSize: 12, color: C.faint }}>No active payment obligations.</div>
        ) : owed.map((o, i) => (
          <ObligRow key={o.id} ob={o} perspective="obligor" last={i === owed.length - 1} assets={assets} nameMap={nameMap} />
        ))}
      </div>

      {/* Owed to me */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>OWED TO ME</div>
          {totalLent > 0 && (
            <div style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>{totalLent} S/month total</div>
          )}
        </div>
        {lent.length === 0 ? (
          <div style={{ fontSize: 12, color: C.faint }}>No active payment entitlements.</div>
        ) : lent.map((l, i) => (
          <ObligRow key={l.id} ob={l} perspective="creditor" last={i === lent.length - 1} assets={assets} nameMap={nameMap} />
        ))}
      </div>

      {/* Propose obligation */}
      {!isCitizen ? <NotACitizenBanner /> : <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: proposing ? 12 : 0 }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>PROPOSE OBLIGATION</div>
          <button onClick={() => setProposing(v => !v)} style={{ ...ghostBtn, fontSize: 10 }}>
            {proposing ? 'Cancel' : '+ New'}
          </button>
        </div>

        {proposing && (
          <div>
            <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginBottom: 12 }}>
              Submit a loan proposal. The other party must sign separately for it to take effect.
              Both creditor and obligor must consent before any obligation is created.
            </div>

            {/* Role toggle */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[['creditor','I am the creditor (receive payments)'],['obligor','I am the obligor (make payments)']].map(([r, label]) => (
                <button key={r} onClick={() => setMyRole(r)} style={{
                  flex: 1, padding: '8px 6px', fontSize: 10,
                  background: myRole === r ? C.gold : C.white,
                  color: myRole === r ? '#fff' : C.sub,
                  border: `1px solid ${myRole === r ? C.gold : C.border}`,
                  borderRadius: 6, cursor: 'pointer', textAlign: 'center', lineHeight: 1.4,
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Citizen picker — falls back to raw address if no citizen list */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>
                {myRole === 'creditor' ? 'Obligor (who pays)' : 'Creditor (who receives)'}
              </div>
              {citizens.filter(c => c.address.toLowerCase() !== address?.toLowerCase()).length > 0 ? (
                <select
                  value={otherAddr}
                  onChange={e => setOtherAddr(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">— select a citizen —</option>
                  {citizens
                    .filter(c => c.address.toLowerCase() !== address?.toLowerCase())
                    .map(c => (
                      <option key={c.address} value={c.address}>
                        {c.name} · {c.address.slice(0,6)}…{c.address.slice(-4)}
                      </option>
                    ))
                  }
                </select>
              ) : (
                <input
                  value={otherAddr} onChange={e => setOtherAddr(e.target.value)}
                  placeholder="0x…" style={inputStyle}
                />
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <Field label="Monthly amount (S)" value={monthly} onChange={setMonthly} placeholder="e.g. 100" type="number" />
              <Field label="Duration (months)" value={epochs}  onChange={setEpochs}  placeholder="e.g. 12"  type="number" />
            </div>
            <Field
              label="Collateral asset ID (0 or blank = unsecured)"
              value={collatId} onChange={setCollatId} placeholder="0" type="number"
            />

            <button
              onClick={handlePropose}
              disabled={actPending || !canPropose}
              style={{ ...actionBtn(C.gold), width: '100%', opacity: (actPending || !canPropose) ? 0.4 : 1 }}
            >
              {actPending ? 'Proposing…' : 'Submit proposal →'}
            </button>
          </div>
        )}
      </div>}
    </div>
  )
}

function ObligRow({ ob, perspective, last, assets = [], nameMap = {} }) {
  const counterpartyLabel = perspective === 'obligor' ? 'creditor' : 'obligor'
  const counterparty      = perspective === 'obligor' ? ob.creditor : ob.obligor
  const pct = ob.totalEpochs > 0 ? ob.epochsPaid / ob.totalEpochs : 0
  const statusColor = ob.defaulted ? C.red : ob.epochsPaid >= ob.totalEpochs ? C.faint : C.green

  const cpName = nameMap[counterparty?.toLowerCase()]
  const collateralAsset = ob.collateralId && ob.collateralId !== '0'
    ? assets.find(a => a.id === ob.collateralId)
    : null
  const collateralLabel = collateralAsset
    ? `${collateralAsset.name || `asset #${ob.collateralId}`} · ${collateralAsset.currentValue} S (locked)`
    : ob.collateralId && ob.collateralId !== '0'
      ? `asset #${ob.collateralId} (locked)`
      : 'unsecured'

  return (
    <div style={{
      paddingBottom: last ? 0 : 12, marginBottom: last ? 0 : 12,
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: C.text }}>
            {counterpartyLabel}: {cpName || `${counterparty.slice(0,6)}…${counterparty.slice(-4)}`}
          </div>
          <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>
            ID {ob.id} · {collateralLabel}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: perspective === 'creditor' ? C.green : C.red }}>
            {perspective === 'creditor' ? '+' : '−'}{ob.monthly} S/mo
          </div>
          <div style={{ fontSize: 10, color: statusColor, marginTop: 2 }}>
            {ob.defaulted ? 'defaulted' : ob.epochsPaid >= ob.totalEpochs ? 'complete' : `${ob.epochsPaid}/${ob.totalEpochs} paid`}
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: statusColor }} />
      </div>
    </div>
  )
}

// ── Public registry tab (A-03) ───────────────────────────────────────────────

function PublicRegistryTab({ assets, loading, nameMap, myAddress }) {
  if (loading || assets === null) {
    return (
      <div style={{ textAlign: 'center', padding: 32, fontSize: 12, color: C.faint }}>
        Loading registry…
      </div>
    )
  }
  if (!assets.length) {
    return (
      <div style={card}>
        <div style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: 24 }}>
          No physical assets registered in this colony yet.
        </div>
      </div>
    )
  }
  return (
    <div>
      <div style={card}>
        <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
          ALL REGISTERED ASSETS · {assets.length}
        </div>
        {assets.map((a, i) => {
          const isMine = myAddress && a.holder.toLowerCase() === myAddress.toLowerCase()
          const holderName = nameMap[a.holder.toLowerCase()] || `${a.holder.slice(0,6)}…${a.holder.slice(-4)}`
          const displayName = a.localName || a.label || `Asset #${a.id}`
          return (
            <div key={a.id} style={{
              paddingBottom: i < assets.length - 1 ? 12 : 0,
              marginBottom:  i < assets.length - 1 ? 12 : 0,
              borderBottom:  i < assets.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                  {displayName}
                  <span style={{ fontSize: 10, color: C.faint, marginLeft: 8 }}>#{a.id}</span>
                  {isMine && <span style={{ fontSize: 10, color: C.gold, marginLeft: 6 }}>· yours</span>}
                </div>
                <div style={{ fontSize: 12, color: C.gold }}>
                  {a.currentValue} S
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 4, lineHeight: 1.5 }}>
                Holder: {holderName}
                {a.weightKg > 0 && <> · {a.weightKg} kg</>}
                {a.hasAI && <> · autonomous AI</>}
                {a.value !== a.currentValue && (
                  <> · was {a.value} S</>
                )}
              </div>
              {a.escrowedFor !== '0' && (
                <div style={{ marginTop: 4, fontSize: 10, color: C.gold }}>
                  🔒 pledged as collateral on obligation #{a.escrowedFor}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Harberger Land tab (A-05–A-09) ───────────────────────────────────────────

function LandTab({ parcels, loading, nameMap, myAddress, signer, cfg, isCitizen, currentEpoch, onReload }) {
  const [claiming,        setClaiming]        = useState(false)
  const [claimLabel,      setClaimLabel]      = useState('')
  const [claimValueV,     setClaimValueV]     = useState('')
  const [pending,         setPending]         = useState(false)
  const [error,           setError]           = useState(null)
  const [done,            setDone]            = useState(null)
  const [editForId,       setEditForId]       = useState(null)
  const [newValueV,       setNewValueV]       = useState('')
  const [forcePurchaseId, setForcePurchaseId] = useState(null)
  const [purchaseValueV,  setPurchaseValueV]  = useState('')

  async function withTx(fn) {
    setPending(true); setError(null); setDone(null)
    try { await fn() } catch (e) { setError(e?.reason || e?.shortMessage || e?.message || 'Transaction failed') }
    setPending(false)
  }

  async function handleClaim() {
    if (!signer || !cfg?.colony) return
    if (!claimLabel.trim() || !(Number(claimValueV) > 0)) {
      setError('Provide a label and declared V value > 0'); return
    }
    await withTx(async () => {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.claimLand(claimLabel.trim(), ethers.parseEther(String(claimValueV)))
      await tx.wait()
      setDone(`Parcel "${claimLabel}" claimed`)
      setClaiming(false); setClaimLabel(''); setClaimValueV('')
      onReload()
    })
  }

  async function handleUpdate(id) {
    if (!(Number(newValueV) > 0)) { setError('New value must be > 0'); return }
    await withTx(async () => {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.updateLandValue(BigInt(id), ethers.parseEther(String(newValueV)))
      await tx.wait()
      setDone(`Parcel #${id} value updated to ${newValueV} V`)
      setEditForId(null); setNewValueV('')
      onReload()
    })
  }

  async function handlePay(id) {
    await withTx(async () => {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.payLandStewardship(BigInt(id))
      await tx.wait()
      setDone(`Stewardship paid for parcel #${id}`)
      onReload()
    })
  }

  async function handleForcePurchase(id) {
    if (!(Number(purchaseValueV) > 0)) { setError('New declared value must be > 0'); return }
    await withTx(async () => {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.forcePurchaseLand(BigInt(id), ethers.parseEther(String(purchaseValueV)))
      await tx.wait()
      setDone(`Force-purchased parcel #${id}`)
      setForcePurchaseId(null); setPurchaseValueV('')
      onReload()
    })
  }

  return (
    <div>
      {done  && <div style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>✓ {done}</div>}
      {error && <div style={{ fontSize: 12, color: C.red,   marginBottom: 8 }}>{error}</div>}

      {/* Claim panel — citizens only */}
      {isCitizen && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: claiming ? 12 : 0 }}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>CLAIM A PARCEL</div>
            <button onClick={() => setClaiming(v => !v)} style={{ ...ghostBtn, fontSize: 10 }}>
              {claiming ? 'Cancel' : '+ New'}
            </button>
          </div>
          {claiming && (
            <div>
              <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginBottom: 12 }}>
                Declare your Harberger V-token price. The first epoch's stewardship fee (0.5% of declared value)
                is paid in V immediately. Anyone may force-purchase at your declared price at any time.
              </div>
              <Field label="Label (e.g. 'Sector-7 Plot A')" value={claimLabel} onChange={setClaimLabel} placeholder="describe the parcel" />
              <Field label="Declared value (V)" value={claimValueV} onChange={setClaimValueV} placeholder="e.g. 1000" type="number" />
              {Number(claimValueV) > 0 && (
                <div style={{ fontSize: 11, color: C.gold, marginBottom: 10 }}>
                  First-epoch fee: {(Number(claimValueV) * 0.005).toFixed(2)} V
                </div>
              )}
              <button
                onClick={handleClaim}
                disabled={pending || !claimLabel.trim() || !(Number(claimValueV) > 0)}
                style={{ ...actionBtn(C.gold), width: '100%', opacity: pending ? 0.4 : 1 }}
              >
                {pending ? 'Claiming…' : 'Claim parcel →'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* All parcels list */}
      {loading || parcels === null ? (
        <div style={{ textAlign: 'center', padding: 32, fontSize: 12, color: C.faint }}>Loading parcels…</div>
      ) : parcels.length === 0 ? (
        <div style={card}>
          <div style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: 24 }}>
            No Harberger parcels claimed yet.
          </div>
        </div>
      ) : (
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
            ALL PARCELS · {parcels.length}
          </div>
          {parcels.map((p, i) => {
            const isMine    = myAddress && p.holder.toLowerCase() === myAddress.toLowerCase()
            const holderNm  = nameMap[p.holder.toLowerCase()] || `${p.holder.slice(0,6)}…${p.holder.slice(-4)}`
            const monthlyFee = p.declaredValueV * 0.005
            const owedV     = monthlyFee * p.outstanding
            const isOverdue = p.outstanding > 0
            return (
              <div key={p.id} style={{
                paddingBottom: i < parcels.length - 1 ? 14 : 0,
                marginBottom:  i < parcels.length - 1 ? 14 : 0,
                borderBottom:  i < parcels.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                    {p.label || `Parcel #${p.id}`}
                    <span style={{ fontSize: 10, color: C.faint, marginLeft: 6 }}>#{p.id}</span>
                    {isMine && <span style={{ fontSize: 10, color: C.gold, marginLeft: 6 }}>· yours</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.gold }}>{p.declaredValueV} V</div>
                </div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 4, lineHeight: 1.5 }}>
                  Holder: {holderNm} · monthly fee {monthlyFee.toFixed(2)} V
                  {isOverdue && (
                    <span style={{ color: C.red, marginLeft: 6 }}>
                      · {p.outstanding} epoch{p.outstanding > 1 ? 's' : ''} owed ({owedV.toFixed(2)} V)
                    </span>
                  )}
                </div>

                {/* Owner actions */}
                {isMine && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setEditForId(editForId === p.id ? null : p.id); setNewValueV(String(p.declaredValueV)) }}
                      disabled={pending}
                      style={{ fontSize: 9, padding: '2px 7px', background: 'none',
                        border: `1px solid ${C.gold}`, color: C.gold, borderRadius: 4, cursor: 'pointer' }}
                    >
                      {editForId === p.id ? 'Cancel' : 'Update value'}
                    </button>
                    {isOverdue && (
                      <button
                        onClick={() => handlePay(p.id)}
                        disabled={pending}
                        style={{ fontSize: 9, padding: '2px 7px', background: 'none',
                          border: `1px solid ${C.red}`, color: C.red, borderRadius: 4, cursor: 'pointer' }}
                      >
                        Pay {owedV.toFixed(2)} V stewardship
                      </button>
                    )}
                  </div>
                )}

                {/* Update value inline form */}
                {isMine && editForId === p.id && (
                  <div style={{ marginTop: 8, padding: 10, background: `${C.gold}08`, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                    <input
                      style={{ ...inlineInput, width: '100%', marginBottom: 8 }}
                      type="number" placeholder="new declared value (V)"
                      value={newValueV} onChange={e => setNewValueV(e.target.value)}
                    />
                    <button onClick={() => handleUpdate(p.id)} disabled={pending}
                      style={{ ...actionBtn(C.gold), width: '100%', fontSize: 11, opacity: pending ? 0.4 : 1 }}>
                      {pending ? 'Updating…' : 'Update declared value →'}
                    </button>
                  </div>
                )}

                {/* Force-purchase action — only for non-holders */}
                {!isMine && isCitizen && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => { setForcePurchaseId(forcePurchaseId === p.id ? null : p.id); setPurchaseValueV(String(p.declaredValueV)) }}
                      disabled={pending}
                      style={{ fontSize: 9, padding: '2px 7px', background: 'none',
                        border: `1px solid ${C.purple}`, color: C.purple, borderRadius: 4, cursor: 'pointer' }}
                    >
                      {forcePurchaseId === p.id ? 'Cancel force purchase' : `Force-purchase at ${p.declaredValueV} V`}
                    </button>
                    {forcePurchaseId === p.id && (
                      <div style={{ marginTop: 8, padding: 10, background: `${C.purple}08`, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: C.faint, marginBottom: 8, lineHeight: 1.6 }}>
                          You will pay {p.declaredValueV} V to {holderNm} and become the new holder. Set your own
                          declared value below — the first-epoch stewardship fee on it is also charged immediately.
                        </div>
                        <input
                          style={{ ...inlineInput, width: '100%', marginBottom: 8 }}
                          type="number" placeholder="your new declared value (V)"
                          value={purchaseValueV} onChange={e => setPurchaseValueV(e.target.value)}
                        />
                        <button onClick={() => handleForcePurchase(p.id)} disabled={pending}
                          style={{ ...actionBtn(C.purple), width: '100%', fontSize: 11, opacity: pending ? 0.4 : 1 }}>
                          {pending ? 'Purchasing…' : 'Confirm force purchase →'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <input
        style={{ ...inlineInput, width: '100%' }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        type={type || 'text'}
      />
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const card = {
  background: C.white, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: 16, marginBottom: 10,
}

function actionBtn(bg, color = C.bg) {
  return {
    padding: '10px 14px', background: bg, color,
    border: 'none', borderRadius: 6, fontSize: 11,
    cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
  }
}

const ghostBtn = {
  padding: '7px 12px', background: C.white, color: C.sub,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
}

const inlineInput = {
  padding: '9px 10px', border: `1px solid ${C.border}`,
  borderRadius: 6, fontSize: 12, color: C.text, background: C.white, outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle = {
  width: '100%', padding: '9px 10px',
  background: C.bg, color: C.text,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
}

const inputStyle = {
  width: '100%', padding: '9px 10px',
  background: C.bg, color: C.text,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 12, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'IBM Plex Mono', monospace",
}
