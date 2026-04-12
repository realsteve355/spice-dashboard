import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { MOCK_COLONIES, MOCK_ADMIN_DATA } from '../data/mock'
import { useWallet } from '../App'

const MCC_SERVICES_ABI = [
  "function getServices() view returns (uint256[], string[], string[], string[])",
  "function addService(string, string, string) external returns (uint256)",
  "function editService(uint256, string, string, string) external",
  "function removeService(uint256) external",
]

import { C } from '../theme'

export default function Admin() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { isConnected, isMccOf, connect, provider, signer, contracts } = useWallet()

  const colony  = MOCK_COLONIES.find(c => c.id === slug)
  const data    = MOCK_ADMIN_DATA[slug]
  const isMcc   = isMccOf(slug)
  const mccServicesAddr = contracts?.colonies?.[slug]?.mccServices

  const [tab, setTab]               = useState('overview')
  const [addingService, setAdding]  = useState(false)
  const [services, setServices]     = useState([])
  const [svcLoading, setSvcLoading] = useState(false)
  const [svcPending, setSvcPending] = useState(false)
  const [svcError, setSvcError]     = useState(null)
  const [newSvc, setNewSvc]         = useState({ name: '', billing: '', price: '' })
  const [editingIdx, setEditIdx]    = useState(null)
  const [editSvc, setEditSvc]       = useState({})
  const [removingIdx, setRemoveIdx] = useState(null)

  async function loadServices() {
    if (!mccServicesAddr || !provider) {
      setServices(colony?.services?.map((s, i) => ({ ...s, id: i })) || [])
      return
    }
    setSvcLoading(true)
    try {
      const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, provider)
      const [ids, names, billings, prices] = await contract.getServices()
      setServices(ids.map((id, i) => ({
        id: Number(id),
        name: names[i],
        billing: billings[i],
        price: prices[i],
      })))
    } catch (e) {
      console.warn('Failed to load services', e)
    }
    setSvcLoading(false)
  }

  useEffect(() => { if (tab === 'services') loadServices() }, [tab, mccServicesAddr, provider])

  if (!isConnected) return (
    <Layout title="MCC Admin" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Connect your wallet to access the admin panel.</div>
        <button onClick={connect} style={primaryBtn}>Connect Wallet</button>
      </div>
    </Layout>
  )

  if (!colony || !data || !isMcc) return (
    <Layout title="MCC Admin" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: C.faint }}>
        You are not on the MCC board of this colony.
      </div>
    </Layout>
  )

  const recallPct = Math.round((data.currentAvgBill / data.recallThreshold) * 100)
  const recallSafe = data.currentAvgBill < data.recallThreshold

  async function addService() {
    if (!newSvc.name.trim()) return
    setSvcPending(true); setSvcError(null)
    try {
      if (mccServicesAddr && signer) {
        const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, signer)
        const tx = await contract.addService(newSvc.name.trim(), newSvc.billing.trim(), newSvc.price.trim())
        await tx.wait()
        await loadServices()
      } else {
        setServices(s => [...s, { ...newSvc, id: s.length }])
      }
      setNewSvc({ name: '', billing: '', price: '' })
      setAdding(false)
    } catch (e) {
      setSvcError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setSvcPending(false)
  }

  function startEdit(i) {
    setEditIdx(i)
    setEditSvc({ ...services[i] })
    setRemoveIdx(null)
  }

  async function saveEdit() {
    setSvcPending(true); setSvcError(null)
    const svc = services[editingIdx]
    try {
      if (mccServicesAddr && signer) {
        const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, signer)
        const tx = await contract.editService(svc.id, editSvc.name.trim(), editSvc.billing.trim(), editSvc.price.trim())
        await tx.wait()
        await loadServices()
      } else {
        setServices(s => s.map((x, i) => i === editingIdx ? { ...x, ...editSvc } : x))
      }
      setEditIdx(null)
    } catch (e) {
      setSvcError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setSvcPending(false)
  }

  async function removeService(i) {
    setSvcPending(true); setSvcError(null)
    const svc = services[i]
    try {
      if (mccServicesAddr && signer) {
        const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, signer)
        const tx = await contract.removeService(svc.id)
        await tx.wait()
        await loadServices()
      } else {
        setServices(s => s.filter((_, idx) => idx !== i))
      }
      setRemoveIdx(null)
    } catch (e) {
      setSvcError(e?.reason || e?.shortMessage || 'Transaction failed')
    }
    setSvcPending(false)
  }

  return (
    <Layout title={`${colony.name} — MCC`} back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', background: C.white }}>
          {['overview', 'services', 'citizens'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px 0', background: tab === t ? C.gold : 'none',
                border: 'none', color: tab === t ? '#fff' : C.sub,
                fontSize: 11, cursor: 'pointer', letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <StatCard label="Citizens"       value={colony.citizenCount} unit="" color={C.gold} />
              <StatCard label="Revenue MTD"    value={data.totalRevenueMTD} unit=" S" color={C.green} />
              <StatCard label="Avg bill MTD"   value={data.currentAvgBill}  unit=" S" color={C.sub} />
              <StatCard label="Monthly supply" value={(colony.citizenCount * 1000).toLocaleString()} unit=" S" color={C.faint} />
            </div>

            {/* Recall trigger */}
            <div style={{ ...card, borderColor: recallSafe ? C.border : C.red }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>RECALL TRIGGER</div>
                <div style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 10,
                  background: recallSafe ? '#f0fdf4' : '#fef2f2',
                  color: recallSafe ? C.green : C.red,
                  border: `1px solid ${recallSafe ? C.green : C.red}`,
                }}>
                  {recallSafe ? 'SAFE' : 'DANGER'}
                </div>
              </div>

              <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  width: `${Math.min(recallPct, 100)}%`, height: '100%',
                  background: recallSafe ? C.green : C.red,
                  transition: 'width 0.3s',
                }} />
              </div>

              <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
                Current avg bill: <span style={{ color: C.text }}>{data.currentAvgBill} S</span><br />
                12-month avg: <span style={{ color: C.text }}>{data.avgBill12m} S</span><br />
                Trigger threshold: <span style={{ color: C.red }}>{data.recallThreshold} S</span> (+20%)
              </div>
            </div>

            {/* MCC board */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>MCC BOARD</div>
              {colony.mcc.board.map((addr, i) => (
                <div key={i} style={{
                  fontSize: 12, color: C.sub, paddingBottom: i < colony.mcc.board.length - 1 ? 8 : 0,
                  marginBottom: i < colony.mcc.board.length - 1 ? 8 : 0,
                  borderBottom: i < colony.mcc.board.length - 1 ? `1px solid ${C.border}` : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{addr}</span>
                  {i === 0 && <span style={{ fontSize: 10, color: C.gold }}>FOUNDER</span>}
                </div>
              ))}
            </div>

            {/* Next election */}
            <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.sub }}>First G-token election</span>
              <span style={{ fontSize: 12, color: C.purple }}>Jan 2027</span>
            </div>
          </div>
        )}

        {/* ── Services tab ── */}
        {tab === 'services' && (
          <div>
            {svcError && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{svcError}</div>}
            {svcLoading && <div style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: 20 }}>Loading services...</div>}
            {!svcLoading && services.map((s, i) => (
              <div key={i} style={{ ...card, borderColor: editingIdx === i ? C.gold : removingIdx === i ? C.red : C.border }}>

                {/* Editing inline */}
                {editingIdx === i ? (
                  <div>
                    <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 10 }}>EDITING SERVICE</div>
                    <SvcInput placeholder="Service name"   value={editSvc.name}    onChange={v => setEditSvc(e => ({ ...e, name: v }))}    />
                    <SvcInput placeholder="Billing basis"  value={editSvc.billing} onChange={v => setEditSvc(e => ({ ...e, billing: v }))} />
                    <SvcInput placeholder="Price"          value={editSvc.price}   onChange={v => setEditSvc(e => ({ ...e, price: v }))}   />
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => setEditIdx(null)} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Cancel</button>
                      <button onClick={saveEdit} disabled={svcPending} style={{ ...smallBtn(C.gold), flex: 2, opacity: svcPending ? 0.5 : 1 }}>{svcPending ? '...' : 'Save changes'}</button>
                    </div>
                  </div>

                /* Remove confirmation */
                ) : removingIdx === i ? (
                  <div>
                    <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>
                      Remove <strong>{s.name}</strong>? This cannot be undone.
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setRemoveIdx(null)} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Cancel</button>
                      <button onClick={() => removeService(i)} disabled={svcPending} style={{ ...smallBtn(C.red), flex: 2, opacity: svcPending ? 0.5 : 1 }}>{svcPending ? '...' : 'Remove service'}</button>
                    </div>
                  </div>

                /* Normal view */
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.gold, fontWeight: 500 }}>{s.price}</div>
                    </div>
                    <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>
                      {s.billing}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(i)}     style={{ ...smallBtn(C.sub, '#fff', C.border), flex: 1 }}>Edit</button>
                      <button onClick={() => { setRemoveIdx(i); setEditIdx(null) }} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {addingService ? (
              <div style={{ ...card, background: '#fffbf0', borderColor: C.gold }}>
                <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NEW SERVICE</div>
                <input
                  style={{ ...inlineInput, width: '100%', marginBottom: 8 }}
                  placeholder="Service name"
                  value={newSvc.name}
                  onChange={e => setNewSvc(s => ({ ...s, name: e.target.value }))}
                />
                <input
                  style={{ ...inlineInput, width: '100%', marginBottom: 8 }}
                  placeholder="Billing basis (e.g. Per item, Flat monthly)"
                  value={newSvc.billing}
                  onChange={e => setNewSvc(s => ({ ...s, billing: e.target.value }))}
                />
                <input
                  style={{ ...inlineInput, width: '100%', marginBottom: 12 }}
                  placeholder="Price (e.g. 5 S, 10 S / hr)"
                  value={newSvc.price}
                  onChange={e => setNewSvc(s => ({ ...s, price: e.target.value }))}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setAdding(false)} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Cancel</button>
                  <button onClick={addService} disabled={svcPending} style={{ ...smallBtn(C.gold), flex: 2, opacity: svcPending ? 0.5 : 1 }}>{svcPending ? '...' : 'Add Service'}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} style={{ ...ghostBtn, width: '100%' }}>
                + Add Service
              </button>
            )}
          </div>
        )}

        {/* ── Citizens tab ── */}
        {tab === 'citizens' && (
          <div>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              {data.citizens.length} REGISTERED CITIZENS
            </div>
            {data.citizens.map((c, i) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: C.text, fontFamily: 'monospace' }}>{c.wallet}</div>
                  <div style={{ fontSize: 10, color: C.purple, border: `1px solid ${C.purple}`, borderRadius: 10, padding: '1px 6px', flexShrink: 0 }}>
                    G-#{String(c.gTokenId).padStart(4, '0')}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.faint }}>
                  <span>Registered {c.registered}</span>
                  <span style={{ color: C.gold }}>{c.sBalance} S</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}

function SvcInput({ placeholder, value, onChange }) {
  return (
    <input
      style={{ width: '100%', padding: '9px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.text, background: C.white, outline: 'none', marginBottom: 8 }}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}

function StatCard({ label, value, unit, color }) {
  return (
    <div style={{ ...card, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: color || C.text, letterSpacing: '-0.02em' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}{unit}
      </div>
    </div>
  )
}

const card = {
  background: C.white, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: 16, marginBottom: 10,
}

const primaryBtn = {
  padding: '13px 16px', background: C.gold, color: C.bg,
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
}

const ghostBtn = {
  padding: '12px 16px', background: C.white, color: C.sub,
  border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12,
  cursor: 'pointer', letterSpacing: '0.04em', marginBottom: 10,
}

function smallBtn(bg, color = '#fff', border) {
  return {
    padding: '9px 14px', background: bg, color,
    border: border ? `1px solid ${border}` : 'none',
    borderRadius: 6, fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em',
  }
}

const inlineInput = {
  padding: '9px 10px', border: `1px solid ${C.border}`,
  borderRadius: 6, fontSize: 12, color: C.text, background: C.white, outline: 'none',
}
