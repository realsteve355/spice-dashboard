import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { MOCK_COLONIES, MOCK_ADMIN_DATA } from '../data/mock'
import { useWallet } from '../App'
import { C } from '../theme'

const MCC_SERVICES_ABI = [
  "function getServices() view returns (uint256[], string[], string[], string[])",
  "function addService(string, string, string) external returns (uint256)",
  "function editService(uint256, string, string, string) external",
  "function removeService(uint256) external",
]

const MCC_BILLING_ABI = [
  "function billOf(address) view returns (uint256)",
  "function getBills(address[]) view returns (uint256[])",
  "function setBill(address, uint256) external",
  "function recordPayment(address) external",
  "function clearBill(address) external",
  "function totalRevenueMTD() view returns (uint256)",
  "function resetMonth() external",
]

const MCC_TREASURY_ABI = [
  "function balance() view returns (uint256)",
  "function roleOf(address) view returns (uint8)",
  "function roleName(address) view returns (string)",
  "function isFD(address) view returns (bool)",
  "function setRole(address, uint8) external",
  "function withdraw(address, uint256, string) external",
  "function members() view returns (address[])",
]

const COLONY_ABI_ADMIN = [
  "function citizenCount() view returns (uint256)",
  "function citizens(uint256) view returns (address)",
  "function citizenName(address) view returns (string)",
  "function founder() view returns (address)",
]

const RPC = 'https://sepolia.base.org'

export default function Admin() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { isConnected, isMccOf, connect, provider, signer, contracts, onChain, address } = useWallet()

  const mockColony = MOCK_COLONIES.find(c => c.id === slug)
  const chain      = onChain?.[slug]
  const colony     = mockColony || (chain ? {
    id: slug,
    name: chain.colonyName || slug,
    citizenCount: null,
    mcc: { name: 'Not yet configured', board: [] },
    services: [],
  } : null)

  const isMcc            = isMccOf(slug)
  const mccServicesAddr  = contracts?.colonies?.[slug]?.mccServices
  const mccBillingAddr   = contracts?.colonies?.[slug]?.mccBilling
  const mccTreasuryAddr  = contracts?.colonies?.[slug]?.mccTreasury
  const colonyAddr       = contracts?.colonies?.[slug]?.colony
    || JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')[slug]?.address

  const [tab, setTab]               = useState('overview')

  // ── Services state ──
  const [addingService, setAdding]  = useState(false)
  const [services, setServices]     = useState([])
  const [svcLoading, setSvcLoading] = useState(false)
  const [svcPending, setSvcPending] = useState(false)
  const [svcError, setSvcError]     = useState(null)
  const [newSvc, setNewSvc]         = useState({ name: '', billing: '', price: '' })
  const [editingIdx, setEditIdx]    = useState(null)
  const [editSvc, setEditSvc]       = useState({})
  const [removingIdx, setRemoveIdx] = useState(null)

  // ── Citizens state ──
  const [citizens, setCitizens]     = useState([])
  const [citLoading, setCitLoading] = useState(false)

  // ── Billing state ──
  const [bills, setBills]           = useState({})   // citizen addr → S (whole tokens)
  const [billLoading, setBillLoading] = useState(false)
  const [billPending, setBillPending] = useState(null) // addr of pending tx
  const [billError, setBillError]   = useState(null)
  const [revenueMTD, setRevenueMTD] = useState(null)
  const [editBill, setEditBill]     = useState({})   // addr → draft value string

  // ── Treasury state ──
  const [treasuryBal,    setTreasuryBal]    = useState(null)
  const [mccRoles,       setMccRoles]       = useState([])   // [{addr, role, name}]
  const [rolesLoading,   setRolesLoading]   = useState(false)
  const [rolesPending,   setRolesPending]   = useState(false)
  const [rolesError,     setRolesError]     = useState(null)
  const [newRoleAddr,    setNewRoleAddr]     = useState('')
  const [newRoleVal,     setNewRoleVal]      = useState('1')  // 1=FD, 2=Chair
  const [withdrawPending, setWithdrawPending] = useState(false)
  const [withdrawError,   setWithdrawError]   = useState(null)
  const [withdrawAmt,     setWithdrawAmt]     = useState('')
  const [withdrawTo,      setWithdrawTo]      = useState('')

  // ── Overview state ──
  const [citizenCount, setCitizenCount] = useState(null)

  async function loadServices() {
    if (!mccServicesAddr) {
      setServices(colony?.services?.map((s, i) => ({ ...s, id: i })) || [])
      return
    }
    const prov = provider || new ethers.JsonRpcProvider(RPC)
    setSvcLoading(true)
    try {
      const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, prov)
      const [ids, names, billings, prices] = await contract.getServices()
      setServices(ids.map((id, i) => ({ id: Number(id), name: names[i], billing: billings[i], price: prices[i] })))
    } catch (e) { console.warn('Failed to load services', e) }
    setSvcLoading(false)
  }

  async function loadCitizens() {
    if (!colonyAddr) { setCitizens([]); return }
    const prov = provider || new ethers.JsonRpcProvider(RPC)
    setCitLoading(true)
    try {
      const c = new ethers.Contract(colonyAddr, COLONY_ABI_ADMIN, prov)
      const count = Number(await c.citizenCount())
      setCitizenCount(count)
      const addrs = await Promise.all(Array.from({ length: count }, (_, i) => c.citizens(i)))
      const names = await Promise.all(addrs.map(a => c.citizenName(a).catch(() => '')))
      setCitizens(addrs.map((addr, i) => ({ addr, name: names[i] })))
    } catch (e) { console.warn('Failed to load citizens', e) }
    setCitLoading(false)
  }

  async function loadBills(citizenList) {
    if (!mccBillingAddr || !citizenList?.length) return
    const prov = provider || new ethers.JsonRpcProvider(RPC)
    setBillLoading(true)
    try {
      const c = new ethers.Contract(mccBillingAddr, MCC_BILLING_ABI, prov)
      const addrs = citizenList.map(ci => ci.addr)
      const [billsWei, rev] = await Promise.all([
        c.getBills(addrs),
        c.totalRevenueMTD(),
      ])
      const map = {}
      addrs.forEach((a, i) => { map[a] = Math.floor(Number(ethers.formatEther(billsWei[i]))) })
      setBills(map)
      setRevenueMTD(Math.floor(Number(ethers.formatEther(rev))))
    } catch (e) { console.warn('Failed to load bills', e) }
    setBillLoading(false)
  }

  async function loadTreasury() {
    if (!mccTreasuryAddr) return
    const prov = provider || new ethers.JsonRpcProvider(RPC)
    setRolesLoading(true)
    try {
      const c = new ethers.Contract(mccTreasuryAddr, MCC_TREASURY_ABI, prov)
      const [bal, memberAddrs] = await Promise.all([c.balance(), c.members()])
      setTreasuryBal(Math.floor(Number(ethers.formatEther(bal))))
      // Also get founder
      const founderAddr = chain?.founderAddr
      const allAddrs = founderAddr
        ? [...new Set([founderAddr, ...memberAddrs])]
        : [...memberAddrs]
      const roles = await Promise.all(allAddrs.map(async a => {
        const rn = await c.roleName(a).catch(() => 'None')
        return { addr: a, roleName: rn }
      }))
      setMccRoles(roles)
    } catch (e) { console.warn('Failed to load treasury', e) }
    setRolesLoading(false)
  }

  useEffect(() => { if (tab === 'services') loadServices() }, [tab, mccServicesAddr, provider])
  useEffect(() => {
    if (tab === 'citizens' || tab === 'billing') loadCitizens()
  }, [tab, colonyAddr, provider])
  useEffect(() => {
    if (tab === 'billing' && citizens.length) loadBills(citizens)
  }, [tab, citizens, mccBillingAddr, provider])
  useEffect(() => {
    if (tab === 'billing') loadTreasury()
  }, [tab, mccTreasuryAddr, provider])

  // ── Service handlers ──
  async function addService() {
    if (!newSvc.name.trim()) return
    setSvcPending(true); setSvcError(null)
    try {
      if (mccServicesAddr && signer) {
        const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, signer)
        await (await contract.addService(newSvc.name.trim(), newSvc.billing.trim(), newSvc.price.trim())).wait()
        await loadServices()
      } else {
        setServices(s => [...s, { ...newSvc, id: s.length }])
      }
      setNewSvc({ name: '', billing: '', price: '' }); setAdding(false)
    } catch (e) { setSvcError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setSvcPending(false)
  }

  async function saveEdit() {
    setSvcPending(true); setSvcError(null)
    const svc = services[editingIdx]
    try {
      if (mccServicesAddr && signer) {
        const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, signer)
        await (await contract.editService(svc.id, editSvc.name.trim(), editSvc.billing.trim(), editSvc.price.trim())).wait()
        await loadServices()
      } else {
        setServices(s => s.map((x, i) => i === editingIdx ? { ...x, ...editSvc } : x))
      }
      setEditIdx(null)
    } catch (e) { setSvcError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setSvcPending(false)
  }

  async function removeService(i) {
    setSvcPending(true); setSvcError(null)
    const svc = services[i]
    try {
      if (mccServicesAddr && signer) {
        const contract = new ethers.Contract(mccServicesAddr, MCC_SERVICES_ABI, signer)
        await (await contract.removeService(svc.id)).wait()
        await loadServices()
      } else {
        setServices(s => s.filter((_, idx) => idx !== i))
      }
      setRemoveIdx(null)
    } catch (e) { setSvcError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setSvcPending(false)
  }

  // ── Treasury handlers ──
  async function grantRole() {
    if (!mccTreasuryAddr || !signer || !newRoleAddr.trim()) return
    setRolesPending(true); setRolesError(null)
    try {
      const c = new ethers.Contract(mccTreasuryAddr, MCC_TREASURY_ABI, signer)
      await (await c.setRole(newRoleAddr.trim(), parseInt(newRoleVal))).wait()
      setNewRoleAddr('')
      await loadTreasury()
    } catch (e) { setRolesError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setRolesPending(false)
  }

  async function revokeRole(addr) {
    if (!mccTreasuryAddr || !signer) return
    setRolesPending(true); setRolesError(null)
    try {
      const c = new ethers.Contract(mccTreasuryAddr, MCC_TREASURY_ABI, signer)
      await (await c.setRole(addr, 0)).wait()
      await loadTreasury()
    } catch (e) { setRolesError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setRolesPending(false)
  }

  async function doWithdraw() {
    if (!mccTreasuryAddr || !signer || !withdrawAmt || !withdrawTo.trim()) return
    setWithdrawPending(true); setWithdrawError(null)
    try {
      const c = new ethers.Contract(mccTreasuryAddr, MCC_TREASURY_ABI, signer)
      await (await c.withdraw(withdrawTo.trim(), ethers.parseEther(String(withdrawAmt)), 'MCC withdrawal')).wait()
      setWithdrawAmt(''); setWithdrawTo('')
      await loadTreasury()
    } catch (e) { setWithdrawError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setWithdrawPending(false)
  }

  // ── Billing handlers ──
  async function saveBill(addr) {
    const raw = editBill[addr]
    if (raw === undefined || raw === '') return
    const amount = parseInt(raw, 10)
    if (isNaN(amount) || amount < 0) return
    setBillPending(addr); setBillError(null)
    try {
      const contract = new ethers.Contract(mccBillingAddr, MCC_BILLING_ABI, signer)
      await (await contract.setBill(addr, amount)).wait()
      setBills(b => ({ ...b, [addr]: amount }))
      setEditBill(e => { const n = { ...e }; delete n[addr]; return n })
    } catch (e) { setBillError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setBillPending(null)
  }

  async function confirmPayment(addr) {
    setBillPending(addr); setBillError(null)
    try {
      const contract = new ethers.Contract(mccBillingAddr, MCC_BILLING_ABI, signer)
      await (await contract.recordPayment(addr)).wait()
      setBills(b => ({ ...b, [addr]: 0 }))
      setRevenueMTD(r => r + (bills[addr] || 0))
    } catch (e) { setBillError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setBillPending(null)
  }

  async function waiveBill(addr) {
    setBillPending(addr); setBillError(null)
    try {
      const contract = new ethers.Contract(mccBillingAddr, MCC_BILLING_ABI, signer)
      await (await contract.clearBill(addr)).wait()
      setBills(b => ({ ...b, [addr]: 0 }))
    } catch (e) { setBillError(e?.reason || e?.shortMessage || 'Transaction failed') }
    setBillPending(null)
  }

  if (!isConnected) return (
    <Layout title="MCC Admin" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Connect your wallet to access the admin panel.</div>
        <button onClick={connect} style={primaryBtn}>Connect Wallet</button>
      </div>
    </Layout>
  )

  if (!colony || !isMcc) return (
    <Layout title="MCC Admin" back={`/colony/${slug}`}>
      <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: C.faint }}>
        {!colony ? 'Colony not found.' : 'You are not on the MCC board of this colony.'}
      </div>
    </Layout>
  )

  const mockData       = MOCK_ADMIN_DATA[slug]
  const displayCount   = citizenCount ?? colony.citizenCount ?? 0
  const displayRevenue = revenueMTD ?? mockData?.totalRevenueMTD ?? 0

  return (
    <Layout title={`${colony.name} — MCC`} back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', background: C.white }}>
          {['overview', 'services', 'citizens', 'billing'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0', background: tab === t ? C.gold : 'none',
              border: 'none', color: tab === t ? C.bg : C.sub,
              fontSize: 10, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <StatCard label="Citizens"       value={displayCount}   unit="" color={C.gold} />
              <StatCard label="Revenue MTD"    value={displayRevenue} unit=" S" color={C.green} />
              <StatCard label="Monthly supply" value={(displayCount * 1000).toLocaleString()} unit=" S" color={C.faint} />
              <StatCard label="MCC billing"    value={mccBillingAddr ? 'Live' : 'Not set up'} unit="" color={mccBillingAddr ? C.green : C.red} />
            </div>

            {/* MCC board */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>MCC BOARD (FOUNDER)</div>
              <div style={{ fontSize: 11, color: C.sub, fontFamily: 'monospace' }}>
                {chain?.founderAddr || mockData?.citizens?.[0]?.wallet || 'Unknown'}
              </div>
            </div>

            {/* Setup status */}
            {(!mccServicesAddr || !mccBillingAddr) && (
              <div style={{ ...card, borderColor: C.gold }}>
                <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 8 }}>SETUP REQUIRED</div>
                {!mccServicesAddr && (
                  <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>
                    ⚠ MCCServices not deployed — go to Services tab to manage services
                  </div>
                )}
                {!mccBillingAddr && (
                  <div style={{ fontSize: 12, color: C.sub }}>
                    ⚠ MCCBilling not deployed — billing features unavailable
                  </div>
                )}
                <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.6 }}>
                  New colonies need MCCServices and MCCBilling deployed separately.
                  This will be automated in a future release.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Services ── */}
        {tab === 'services' && (
          <div>
            {!mccServicesAddr && (
              <div style={{ ...card, borderColor: C.gold, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.gold, marginBottom: 6 }}>MCCServices not deployed for this colony</div>
                <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
                  Services below are local only. To put services on-chain, deploy MCCServices pointing to this colony contract.
                </div>
              </div>
            )}
            {svcError && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{svcError}</div>}
            {svcLoading && <div style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: 20 }}>Loading...</div>}
            {!svcLoading && services.map((s, i) => (
              <div key={i} style={{ ...card, borderColor: editingIdx === i ? C.gold : removingIdx === i ? C.red : C.border }}>
                {editingIdx === i ? (
                  <div>
                    <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 10 }}>EDITING</div>
                    <SvcInput placeholder="Service name"  value={editSvc.name}    onChange={v => setEditSvc(e => ({ ...e, name: v }))} />
                    <SvcInput placeholder="Billing basis" value={editSvc.billing} onChange={v => setEditSvc(e => ({ ...e, billing: v }))} />
                    <SvcInput placeholder="Price"         value={editSvc.price}   onChange={v => setEditSvc(e => ({ ...e, price: v }))} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => setEditIdx(null)} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Cancel</button>
                      <button onClick={saveEdit} disabled={svcPending} style={{ ...smallBtn(C.gold), flex: 2, opacity: svcPending ? 0.5 : 1 }}>{svcPending ? '...' : 'Save'}</button>
                    </div>
                  </div>
                ) : removingIdx === i ? (
                  <div>
                    <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>Remove <strong>{s.name}</strong>?</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setRemoveIdx(null)} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Cancel</button>
                      <button onClick={() => removeService(i)} disabled={svcPending} style={{ ...smallBtn(C.red), flex: 2, opacity: svcPending ? 0.5 : 1 }}>{svcPending ? '...' : 'Remove'}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.gold, fontWeight: 500 }}>{s.price}</div>
                    </div>
                    <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>{s.billing}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setEditIdx(i); setEditSvc({ ...s }) }} style={{ ...smallBtn(C.sub, '#fff', C.border), flex: 1 }}>Edit</button>
                      <button onClick={() => { setRemoveIdx(i); setEditIdx(null) }} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {addingService ? (
              <div style={{ ...card, borderColor: C.gold }}>
                <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NEW SERVICE</div>
                <SvcInput placeholder="Service name" value={newSvc.name} onChange={v => setNewSvc(s => ({ ...s, name: v }))} />
                <SvcInput placeholder="Billing basis (e.g. Per item, Flat monthly)" value={newSvc.billing} onChange={v => setNewSvc(s => ({ ...s, billing: v }))} />
                <SvcInput placeholder="Price (e.g. 5 S, 10 S / hr)" value={newSvc.price} onChange={v => setNewSvc(s => ({ ...s, price: v }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setAdding(false)} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1 }}>Cancel</button>
                  <button onClick={addService} disabled={svcPending} style={{ ...smallBtn(C.gold), flex: 2, opacity: svcPending ? 0.5 : 1 }}>{svcPending ? '...' : 'Add Service'}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} style={{ ...ghostBtn, width: '100%' }}>+ Add Service</button>
            )}
          </div>
        )}

        {/* ── Citizens ── */}
        {tab === 'citizens' && (
          <div>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              {citLoading ? 'Loading...' : `${citizens.length} REGISTERED CITIZENS`}
            </div>
            {citizens.map((ci, i) => (
              <div key={ci.addr} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    {ci.name && <div style={{ fontSize: 13, color: C.text, marginBottom: 2 }}>{ci.name}</div>}
                    <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace' }}>{ci.addr}</div>
                  </div>
                  <div style={{ fontSize: 10, color: C.purple, border: `1px solid ${C.purple}`, borderRadius: 10, padding: '1px 6px', flexShrink: 0 }}>
                    G-#{String(i + 1).padStart(4, '0')}
                  </div>
                </div>
              </div>
            ))}
            {!citLoading && citizens.length === 0 && (
              <div style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: 20 }}>No citizens yet.</div>
            )}
          </div>
        )}

        {/* ── Billing ── */}
        {tab === 'billing' && (
          <div>
            {!mccBillingAddr ? (
              <div style={{ ...card, borderColor: C.gold }}>
                <div style={{ fontSize: 12, color: C.gold, marginBottom: 8 }}>MCCBilling not deployed</div>
                <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
                  On-chain billing requires the MCCBilling contract. This will be deployed automatically for new colonies in a future release.
                </div>
              </div>
            ) : (
              <>
                {/* Revenue MTD + Treasury balance */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={{ ...card, flex: 1, marginBottom: 0 }}>
                    <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>REVENUE MTD</div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: C.green, marginTop: 4 }}>
                      {revenueMTD !== null ? revenueMTD.toLocaleString() : '...'} <span style={{ fontSize: 12, color: C.faint }}>S</span>
                    </div>
                    <div style={{ fontSize: 9, color: C.faint, marginTop: 4 }}>confirmed payments</div>
                  </div>
                  <div style={{ ...card, flex: 1, marginBottom: 0, borderColor: mccTreasuryAddr ? C.border : C.faint }}>
                    <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>MCC TREASURY</div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: C.gold, marginTop: 4 }}>
                      {mccTreasuryAddr ? (treasuryBal !== null ? treasuryBal.toLocaleString() : '...') : '—'} <span style={{ fontSize: 12, color: C.faint }}>S</span>
                    </div>
                    <div style={{ fontSize: 9, color: mccTreasuryAddr ? C.green : C.faint, marginTop: 4 }}>
                      {mccTreasuryAddr ? 'on-chain treasury' : 'not deployed'}
                    </div>
                  </div>
                </div>

                {/* MCC Roles panel */}
                {mccTreasuryAddr && (
                  <div style={{ ...card, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>MCC BOARD ROLES</div>
                    {rolesLoading ? (
                      <div style={{ fontSize: 11, color: C.faint }}>Loading…</div>
                    ) : (
                      <>
                        {mccRoles.map(m => (
                          <div key={m.addr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                              <span style={{ fontSize: 10, color: C.text, fontFamily: 'monospace' }}>
                                {m.addr.slice(0, 10)}…{m.addr.slice(-6)}
                              </span>
                              <span style={{ fontSize: 10, color: C.gold, marginLeft: 8, border: `1px solid ${C.gold}`, borderRadius: 10, padding: '1px 6px' }}>
                                {m.roleName}
                              </span>
                            </div>
                            {m.roleName !== 'Founder' && (
                              <button
                                onClick={() => revokeRole(m.addr)}
                                disabled={rolesPending}
                                style={{ ...smallBtn(C.faint, '#fff', C.border), fontSize: 10, padding: '3px 8px', opacity: rolesPending ? 0.5 : 1 }}
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))}
                        {rolesError && <div style={{ fontSize: 11, color: C.red, marginBottom: 6 }}>{rolesError}</div>}
                        {/* Grant role form */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
                          <input
                            placeholder="0x address"
                            value={newRoleAddr}
                            onChange={e => setNewRoleAddr(e.target.value)}
                            style={{ flex: 1, padding: '7px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.text, background: C.white, outline: 'none', fontFamily: 'monospace' }}
                          />
                          <select
                            value={newRoleVal}
                            onChange={e => setNewRoleVal(e.target.value)}
                            style={{ padding: '7px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.text, background: C.white, outline: 'none' }}
                          >
                            <option value="1">FD</option>
                            <option value="2">Chair</option>
                          </select>
                          <button onClick={grantRole} disabled={rolesPending || !newRoleAddr.trim()} style={{ ...smallBtn(C.gold), opacity: rolesPending || !newRoleAddr.trim() ? 0.5 : 1 }}>
                            {rolesPending ? '…' : 'Grant'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Treasury withdraw */}
                {mccTreasuryAddr && (
                  <div style={{ ...card, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>WITHDRAW FROM TREASURY</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        placeholder="To address (0x…)"
                        value={withdrawTo}
                        onChange={e => setWithdrawTo(e.target.value)}
                        style={{ flex: 2, padding: '7px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.text, background: C.white, outline: 'none', fontFamily: 'monospace' }}
                      />
                      <input
                        placeholder="S amount"
                        type="number"
                        value={withdrawAmt}
                        onChange={e => setWithdrawAmt(e.target.value)}
                        style={{ flex: 1, padding: '7px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.text, background: C.white, outline: 'none' }}
                      />
                      <button onClick={doWithdraw} disabled={withdrawPending || !withdrawAmt || !withdrawTo.trim()} style={{ ...smallBtn(C.gold), opacity: withdrawPending || !withdrawAmt || !withdrawTo.trim() ? 0.5 : 1 }}>
                        {withdrawPending ? '…' : 'Withdraw'}
                      </button>
                    </div>
                    {withdrawError && <div style={{ fontSize: 11, color: C.red, marginTop: 6 }}>{withdrawError}</div>}
                  </div>
                )}

                {billError && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{billError}</div>}

                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
                  {billLoading || citLoading ? 'Loading citizens...' : `${citizens.length} CITIZENS — SET BILLS`}
                </div>

                {/* Billing instructions */}
                <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.7, marginBottom: 12, padding: '10px 12px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                  1. Set each citizen's bill (whole S-tokens)<br />
                  2. Citizen pays via Dashboard → "Pay MCC bill" (S-tokens go to MCC Treasury above)<br />
                  3. When Treasury balance increases, click "Paid ✓" to confirm and record revenue
                </div>

                {citizens.map(ci => {
                  const bill        = bills[ci.addr] ?? 0
                  const draftVal    = editBill[ci.addr]
                  const isPending   = billPending === ci.addr
                  const isEditing   = draftVal !== undefined
                  return (
                    <div key={ci.addr} style={{ ...card, borderColor: bill > 0 ? C.gold : C.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          {ci.name && <div style={{ fontSize: 12, color: C.text, marginBottom: 2 }}>{ci.name}</div>}
                          <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace' }}>{ci.addr.slice(0, 10)}…{ci.addr.slice(-6)}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: bill > 0 ? C.gold : C.faint }}>
                          {bill > 0 ? `${bill} S` : '—'}
                        </div>
                      </div>

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="number" min="0"
                            value={draftVal}
                            onChange={e => setEditBill(b => ({ ...b, [ci.addr]: e.target.value }))}
                            style={{ flex: 1, padding: '8px 10px', border: `1px solid ${C.gold}`, borderRadius: 6, fontSize: 13, color: C.text, background: C.white, outline: 'none' }}
                            placeholder="S amount"
                          />
                          <button onClick={() => setEditBill(e => { const n = { ...e }; delete n[ci.addr]; return n })} style={{ ...smallBtn(C.faint, '#fff', C.border) }}>✕</button>
                          <button onClick={() => saveBill(ci.addr)} disabled={isPending} style={{ ...smallBtn(C.gold), opacity: isPending ? 0.5 : 1 }}>
                            {isPending ? '...' : 'Set'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setEditBill(b => ({ ...b, [ci.addr]: String(bill || '') }))}
                            style={{ ...smallBtn(C.sub, '#fff', C.border), flex: 1 }}
                          >
                            {bill > 0 ? 'Edit bill' : 'Set bill'}
                          </button>
                          {bill > 0 && (
                            <>
                              <button onClick={() => confirmPayment(ci.addr)} disabled={isPending} style={{ ...smallBtn(C.green), flex: 1, opacity: isPending ? 0.5 : 1 }}>
                                {isPending ? '...' : 'Paid ✓'}
                              </button>
                              <button onClick={() => waiveBill(ci.addr)} disabled={isPending} style={{ ...smallBtn(C.faint, '#fff', C.border), flex: 1, opacity: isPending ? 0.5 : 1 }}>
                                Waive
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}

function SvcInput({ placeholder, value, onChange }) {
  return (
    <input
      style={{ width: '100%', padding: '9px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.text, background: C.white, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
      placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
    />
  )
}

function StatCard({ label, value, unit, color }) {
  return (
    <div style={{ ...card, textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: color || C.text, letterSpacing: '-0.02em' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}{unit}
      </div>
    </div>
  )
}

const card       = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 10 }
const primaryBtn = { padding: '13px 16px', background: C.gold, color: C.bg, border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500 }
const ghostBtn   = { padding: '12px 16px', background: C.white, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', letterSpacing: '0.04em', marginBottom: 10 }

function smallBtn(bg, color = '#fff', border) {
  return { padding: '9px 14px', background: bg, color, border: border ? `1px solid ${border}` : 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', letterSpacing: '0.04em' }
}
