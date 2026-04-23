import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'
import { C } from '../theme'

// ── Constants ─────────────────────────────────────────────────────────────────

const OHIO_BREAD_REF = 2.80  // $ Ohio reference bread price

const DEFAULT_LINES = [
  // MCC — auto-deducted
  { id: 'elec',     category: 'MCC',           name: 'Electricity',           description: 'Grid power supply and maintenance',        sTokenAmount: 90,  dollarRef: 120, spiceDiscount: 25, autoDeducted: true,  isOptional: false, active: true },
  { id: 'water',    category: 'MCC',           name: 'Water & Sewage',        description: 'Mains water and waste water processing',   sTokenAmount: 50,  dollarRef: 65,  spiceDiscount: 20, autoDeducted: true,  isOptional: false, active: true },
  { id: 'waste',    category: 'MCC',           name: 'Waste & Recycling',     description: 'Kerbside collection and processing',       sTokenAmount: 25,  dollarRef: 30,  spiceDiscount: 15, autoDeducted: true,  isOptional: false, active: true },
  { id: 'broad',    category: 'MCC',           name: 'Broadband',             description: 'Colony fibre network access',              sTokenAmount: 45,  dollarRef: 60,  spiceDiscount: 20, autoDeducted: true,  isOptional: false, active: true },
  { id: 'ems',      category: 'MCC',           name: 'Roads / Fire / EMS',    description: 'Emergency services and road maintenance',  sTokenAmount: 40,  dollarRef: 55,  spiceDiscount: 30, autoDeducted: true,  isOptional: false, active: true },
  { id: 'housing',  category: 'MCC',           name: 'Colony Housing',        description: 'MCC-provided accommodation (if applicable)', sTokenAmount: 100, dollarRef: 750, spiceDiscount: 87, autoDeducted: true,  isOptional: true,  active: true },
  // Essential
  { id: 'grocery',  category: 'Essential',     name: 'Groceries & Household', description: 'Food, household supplies, pharmacy basics', sTokenAmount: 280, dollarRef: 420, spiceDiscount: 30, autoDeducted: false, isOptional: false, active: true },
  { id: 'care',     category: 'Essential',     name: 'Personal Care',         description: 'Hair, toiletries, personal basics',        sTokenAmount: 60,  dollarRef: 75,  spiceDiscount: 15, autoDeducted: false, isOptional: false, active: true },
  { id: 'health',   category: 'Essential',     name: 'Healthcare Co-pay',     description: 'Supplementary healthcare above MCC cover', sTokenAmount: 90,  dollarRef: 120, spiceDiscount: 20, autoDeducted: false, isOptional: false, active: true },
  { id: 'transport',category: 'Essential',     name: 'Local Transport',       description: 'Bus, bike share, local journeys',          sTokenAmount: 40,  dollarRef: 65,  spiceDiscount: 35, autoDeducted: false, isOptional: false, active: true },
  { id: 'edu',      category: 'Essential',     name: 'Education / Childcare', description: 'Shared facilities; staff on UBI baseline', sTokenAmount: 65,  dollarRef: 90,  spiceDiscount: 25, autoDeducted: false, isOptional: true,  active: true },
  // Discretionary
  { id: 'dining',   category: 'Discretionary', name: 'Local Dining & Cafes',  description: 'Restaurants, cafes, takeaway',             sTokenAmount: 100, dollarRef: 160, spiceDiscount: 35, autoDeducted: false, isOptional: false, active: true },
  { id: 'entertain',category: 'Discretionary', name: 'Entertainment & Social',description: 'Cinema, events, sports, clubs',            sTokenAmount: 60,  dollarRef: 80,  spiceDiscount: 20, autoDeducted: false, isOptional: false, active: true },
  { id: 'nones',    category: 'Discretionary', name: 'Non-essential Goods',   description: 'Clothing, gifts, hobbies',                 sTokenAmount: 80,  dollarRef: 100, spiceDiscount: 10, autoDeducted: false, isOptional: false, active: true },
  // Savings
  { id: 'savings',  category: 'Savings',       name: 'S → V Conversion',      description: 'Target savings: convert S to permanent V before period burn', sTokenAmount: 110, dollarRef: 0, spiceDiscount: 0, autoDeducted: false, isOptional: false, active: true },
]

const CATEGORIES = ['MCC', 'Essential', 'Discretionary', 'Savings']
const CAT_COLORS  = { MCC: C.blue, Essential: C.green, Discretionary: '#f97316', Savings: C.purple }
const CORE_IDS    = new Set(['elec', 'water', 'waste', 'broad', 'ems'])

const GOV_ABI = ['function roleHolder(uint8) view returns (address holder, uint256 termEnd, bool active)']
const RPC     = 'https://sepolia.base.org'

// ── Derived calculations ───────────────────────────────────────────────────────

function computeDerived(lines, breadPriceS, spiceLabourDiscount) {
  const active = lines.filter(l => l.active !== false)
  const totalMCC  = active.filter(l => l.category === 'MCC').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalEss  = active.filter(l => l.category === 'Essential').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalDisc = active.filter(l => l.category === 'Discretionary').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalSave = active.filter(l => l.category === 'Savings').reduce((s, l) => s + l.sTokenAmount, 0)
  const totalUBI  = totalMCC + totalEss + totalDisc + totalSave

  const discount    = (spiceLabourDiscount || 28) / 100
  const breadUSD    = OHIO_BREAD_REF * (1 - discount)
  const fiscRate    = breadPriceS > 0 ? breadUSD / breadPriceS : 0
  const ubiUSD      = totalUBI * fiscRate

  const rateOK  = fiscRate >= 0.30 && fiscRate <= 1.20
  const ubiOK   = ubiUSD  >= 300  && ubiUSD  <= 1500
  const splitOK = totalUBI > 0 && Math.abs((totalSave / totalUBI) * 100 - 20) < 5

  return { totalMCC, totalEss, totalDisc, totalSave, totalUBI, fiscRate, ubiUSD, rateOK, ubiOK, splitOK }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Budget() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const { contracts, address } = useWallet()

  const colonyAddr = contracts?.colonies?.[slug]?.colony
  const govAddr    = contracts?.colonies?.[slug]?.governance

  const [published,   setPublished]   = useState(null)
  const [history,     setHistory]     = useState([])
  const [draft,       setDraft]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [isCEO,       setIsCEO]       = useState(false)
  const [editMode,    setEditMode]    = useState(false)

  // Draft edit state
  const [draftLines,    setDraftLines]    = useState(DEFAULT_LINES)
  const [breadPriceS,   setBreadPriceS]   = useState(4)
  const [labourDisc,    setLabourDisc]    = useState(28)
  const [savingDraft,   setSavingDraft]   = useState(false)
  const [publishing,    setPublishing]    = useState(false)
  const [publishError,  setPublishError]  = useState(null)
  const [showModal,     setShowModal]     = useState(false)
  const [expandedVer,   setExpandedVer]   = useState(null)

  // ── Load CEO role ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!govAddr || !address) return
    const rpc = new ethers.JsonRpcProvider(RPC)
    const gov = new ethers.Contract(govAddr, GOV_ABI, rpc)
    gov.roleHolder(0)
      .then(([holder, , active]) => {
        if (active && holder.toLowerCase() === address.toLowerCase()) setIsCEO(true)
      })
      .catch(() => {})
  }, [govAddr, address])

  // ── Load published budget ─────────────────────────────────────────────────
  const loadBudget = useCallback(() => {
    if (!colonyAddr) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/budget?colony=${colonyAddr}`)
      .then(r => r.json())
      .then(d => {
        setPublished(d.published || null)
        setHistory(d.history   || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [colonyAddr])

  useEffect(() => { loadBudget() }, [loadBudget])

  // ── Load draft (CEO only) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isCEO || !colonyAddr) return
    fetch(`/api/budget?colony=${colonyAddr}&draft=true`)
      .then(r => r.json())
      .then(d => {
        if (d.draft) {
          setDraft(d.draft)
          setDraftLines(d.draft.lines || DEFAULT_LINES)
          setBreadPriceS(d.draft.bread_price_s || 4)
          setLabourDisc(d.draft.spice_labour_discount || 28)
        } else if (published) {
          // Seed draft from published
          setDraftLines(published.lines || DEFAULT_LINES)
          setBreadPriceS(published.bread_price_s || 4)
          setLabourDisc(published.spice_labour_discount || 28)
        }
      })
      .catch(() => {})
  }, [isCEO, colonyAddr, published])

  // ── Derived numbers ───────────────────────────────────────────────────────
  const viewLines = editMode ? draftLines : (published?.lines || DEFAULT_LINES)
  const viewBread = editMode ? breadPriceS : (published?.bread_price_s || 4)
  const viewDisc  = editMode ? labourDisc  : (published?.spice_labour_discount || 28)
  const d = computeDerived(viewLines, viewBread, viewDisc)

  const pubD = published ? computeDerived(
    published.lines, published.bread_price_s, published.spice_labour_discount
  ) : null

  // Spike check: draft total vs lowest in last 12 versions
  const lowestPrior = history.length > 1
    ? Math.min(...history.slice(1).map(h => h.total_s))
    : null
  const spikePct = lowestPrior
    ? ((d.totalUBI - lowestPrior) / lowestPrior) * 100
    : null
  const isSpiking = spikePct !== null && spikePct > 20

  // ── CEO actions ───────────────────────────────────────────────────────────
  async function saveDraft() {
    if (!colonyAddr) return
    setSavingDraft(true)
    try {
      await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_draft', colony: colonyAddr,
          lines: draftLines, breadPriceS, spiceLabourDiscount: labourDisc,
          updatedBy: address,
        }),
      })
    } catch {}
    setSavingDraft(false)
  }

  async function handlePublish() {
    if (!colonyAddr) return
    setPublishing(true); setPublishError(null)
    // First save the current draft state
    await saveDraft()
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
    const effectiveFrom = nextMonth.toISOString().split('T')[0]
    try {
      const r = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish', colony: colonyAddr,
          publishedBy: address, effectiveFrom,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Publish failed')
      setShowModal(false)
      setEditMode(false)
      loadBudget()
    } catch (e) {
      setPublishError(e.message)
    }
    setPublishing(false)
  }

  function updateLine(id, field, value) {
    setDraftLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout title="Budget" back={`/colony/${slug}/fisc`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 60px' }}>

        {/* CEO edit mode banner */}
        {isCEO && editMode && (
          <div style={{
            background: '#2a1f00', border: `1px solid ${C.gold}`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 12,
            fontSize: 11, color: C.gold, letterSpacing: '0.04em',
          }}>
            DRAFT MODE — changes are not visible to citizens until published
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>
              STANDARD CITIZEN BUDGET
            </div>
            {published && !editMode && (
              <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>
                v{published.version} · effective {published.effective_from}
              </div>
            )}
          </div>
          {isCEO && (
            <button
              onClick={() => setEditMode(v => !v)}
              style={{
                fontSize: 10, color: editMode ? C.gold : C.sub,
                border: `1px solid ${editMode ? C.gold : C.border}`,
                borderRadius: 10, padding: '3px 10px',
                background: 'none', cursor: 'pointer',
                letterSpacing: '0.04em',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {editMode ? 'Exit edit' : 'Edit'}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ fontSize: 12, color: C.faint }}>Loading…</div>
        ) : (
          <>
            {/* ── Three-number panel ────────────────────────────────────── */}
            <div style={card}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'UBI',       value: `${d.totalUBI} S`,                         ok: true },
                  { label: 'FISC RATE', value: `$${d.fiscRate.toFixed(3)}/S`,             ok: d.rateOK },
                  { label: 'UBI VALUE', value: `$${Math.round(d.ubiUSD)}/mo`,             ok: d.ubiOK },
                ].map(item => (
                  <div key={item.label} style={{
                    background: C.bg, borderRadius: 6, padding: '10px 8px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.1em', marginBottom: 5 }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 600, marginBottom: 2,
                      color: item.ok ? C.gold : C.red,
                    }}>
                      {item.value}
                    </div>
                    {!item.ok && (
                      <div style={{ fontSize: 8, color: C.red }}>out of range</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Edit mode: bread anchor inputs */}
              {editMode && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={fieldLabel}>Bread price (S/loaf)</div>
                    <input
                      type="number" min={1} max={20}
                      value={breadPriceS}
                      onChange={e => setBreadPriceS(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                      style={numInput}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={fieldLabel}>SPICE labour discount (%)</div>
                    <input
                      type="number" min={0} max={50}
                      value={labourDisc}
                      onChange={e => setLabourDisc(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                      style={numInput}
                    />
                  </div>
                </div>
              )}

              {!editMode && (
                <div style={{ fontSize: 10, color: C.faint, lineHeight: 1.5 }}>
                  Bread anchor: {viewBread}S/loaf · SPICE discount: {viewDisc}% · Ohio ref: ${OHIO_BREAD_REF}
                </div>
              )}
            </div>

            {/* ── Split bar ─────────────────────────────────────────────── */}
            {d.totalUBI > 0 && (
              <div style={{ ...card, padding: '14px 16px' }}>
                <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  {CATEGORIES.map(cat => {
                    const val   = { MCC: d.totalMCC, Essential: d.totalEss, Discretionary: d.totalDisc, Savings: d.totalSave }[cat]
                    const pct   = (val / d.totalUBI) * 100
                    const ghost = { MCC: 25, Essential: 35, Discretionary: 20, Savings: 20 }[cat]
                    if (pct === 0) return null
                    return (
                      <div key={cat} style={{
                        width: `${pct}%`, background: CAT_COLORS[cat],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                      }}>
                        {pct > 8 && (
                          <span style={{ fontSize: 8, color: '#fff', fontWeight: 600 }}>
                            {Math.round(pct)}%
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => {
                    const val  = { MCC: d.totalMCC, Essential: d.totalEss, Discretionary: d.totalDisc, Savings: d.totalSave }[cat]
                    const tgt  = { MCC: 25, Essential: 35, Discretionary: 20, Savings: 20 }[cat]
                    const pct  = d.totalUBI > 0 ? Math.round((val / d.totalUBI) * 100) : 0
                    return (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[cat] }} />
                        <span style={{ fontSize: 9, color: C.faint }}>
                          {cat} {pct}% <span style={{ opacity: 0.5 }}>tgt {tgt}%</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Budget table ───────────────────────────────────────────── */}
            {CATEGORIES.map(cat => {
              const catLines = viewLines.filter(l => l.category === cat)
              const catTotal = catLines.filter(l => l.active !== false).reduce((s, l) => s + l.sTokenAmount, 0)
              return (
                <div key={cat} style={card}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[cat] }} />
                      <span style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em' }}>
                        {cat.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: C.sub, fontWeight: 500 }}>
                      {catTotal} S
                    </span>
                  </div>

                  {catLines.map((line, i) => {
                    const isInactive = line.active === false
                    return (
                      <div
                        key={line.id}
                        style={{
                          paddingBottom: i < catLines.length - 1 ? 10 : 0,
                          marginBottom:  i < catLines.length - 1 ? 10 : 0,
                          borderBottom:  i < catLines.length - 1 ? `1px solid ${C.border}` : 'none',
                          opacity: isInactive ? 0.4 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: C.text, fontWeight: 500, marginBottom: 2 }}>
                              {line.name}
                              {line.isOptional && (
                                <span style={{ fontSize: 9, color: C.faint, marginLeft: 6 }}>optional</span>
                              )}
                              {line.autoDeducted && (
                                <span style={{ fontSize: 9, color: C.blue, marginLeft: 6 }}>auto</span>
                              )}
                            </div>
                            <div style={{ fontSize: 10, color: C.faint, lineHeight: 1.4 }}>
                              {line.description}
                            </div>
                            {line.dollarRef > 0 && (
                              <div style={{ fontSize: 9, color: C.faint, marginTop: 2 }}>
                                ${line.dollarRef} ref · {line.spiceDiscount}% SPICE saving
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', marginLeft: 12 }}>
                            {editMode ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {!CORE_IDS.has(line.id) && (
                                  <button
                                    onClick={() => updateLine(line.id, 'active', !line.active)}
                                    style={{
                                      fontSize: 9, padding: '2px 6px',
                                      background: 'none', cursor: 'pointer',
                                      border: `1px solid ${C.border}`, borderRadius: 4,
                                      color: C.faint, fontFamily: "'IBM Plex Mono', monospace",
                                    }}
                                  >
                                    {isInactive ? 'on' : 'off'}
                                  </button>
                                )}
                                <input
                                  type="number" min={0} max={999}
                                  value={line.sTokenAmount}
                                  disabled={isInactive}
                                  onChange={e => updateLine(line.id, 'sTokenAmount', Math.max(0, Math.min(999, parseInt(e.target.value) || 0)))}
                                  style={{ ...numInput, width: 60, textAlign: 'right' }}
                                />
                                <span style={{ fontSize: 11, color: C.faint }}>S</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 13, color: isInactive ? C.faint : C.text, fontWeight: 500 }}>
                                {isInactive ? '0 S' : `${line.sTokenAmount} S`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* ── Consistency panel (CEO edit mode) ─────────────────────── */}
            {editMode && (
              <div style={{
                ...card,
                border: `1px solid ${isSpiking ? C.red : d.rateOK && d.ubiOK && d.splitOK ? C.green : C.gold}`,
              }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
                  CONSISTENCY CHECK
                </div>
                {[
                  { label: 'Rate OK ($0.30–$1.20)',   ok: d.rateOK,  value: `$${d.fiscRate.toFixed(3)}/S` },
                  { label: 'UBI OK ($300–$1,500/mo)', ok: d.ubiOK,   value: `$${Math.round(d.ubiUSD)}/mo` },
                  { label: 'Savings ~20%',            ok: d.splitOK, value: `${d.totalUBI > 0 ? Math.round((d.totalSave / d.totalUBI) * 100) : 0}%` },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 11, color: item.ok ? C.green : C.red }}>
                      {item.ok ? '✓' : '✗'} {item.label}
                    </span>
                    <span style={{ fontSize: 11, color: item.ok ? C.sub : C.red }}>
                      {item.value}
                    </span>
                  </div>
                ))}

                {pubD && (
                  <div style={{
                    marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`,
                    fontSize: 10, color: C.faint,
                  }}>
                    Published total: {pubD.totalUBI} S · Draft: {d.totalUBI} S ·{' '}
                    <span style={{ color: d.totalUBI > pubD.totalUBI ? C.red : C.green }}>
                      {d.totalUBI > pubD.totalUBI ? '+' : ''}{d.totalUBI - pubD.totalUBI} S
                    </span>
                    {spikePct !== null && (
                      <span style={{ marginLeft: 6, color: isSpiking ? C.red : C.faint }}>
                        ({spikePct > 0 ? '+' : ''}{spikePct.toFixed(1)}% vs 12m low)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Spike warning ─────────────────────────────────────────── */}
            {editMode && isSpiking && (
              <div style={{
                background: '#2a0000', border: `1px solid ${C.red}`,
                borderRadius: 8, padding: '12px 14px', marginBottom: 12,
                fontSize: 11, color: C.red, lineHeight: 1.6,
              }}>
                This change exceeds the 20% annual spike limit (+{spikePct.toFixed(1)}%). Publishing will automatically trigger a citizen vote. The new budget will not take effect until the vote passes.
              </div>
            )}

            {/* ── CEO action buttons ─────────────────────────────────────── */}
            {editMode && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  onClick={saveDraft}
                  disabled={savingDraft}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: 'none', border: `1px solid ${C.border}`,
                    borderRadius: 8, fontSize: 11, color: C.sub,
                    cursor: savingDraft ? 'default' : 'pointer',
                    opacity: savingDraft ? 0.5 : 1,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {savingDraft ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  onClick={() => { setShowModal(true); setPublishError(null) }}
                  disabled={!d.rateOK || !d.ubiOK}
                  style={{
                    flex: 2, padding: '10px 0',
                    background: C.gold, border: 'none',
                    borderRadius: 8, fontSize: 11, color: C.bg,
                    cursor: !d.rateOK || !d.ubiOK ? 'default' : 'pointer',
                    opacity: !d.rateOK || !d.ubiOK ? 0.4 : 1,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                  }}
                >
                  Publish →
                </button>
              </div>
            )}

            {/* ── Audit trail ───────────────────────────────────────────── */}
            {history.length > 0 && (
              <div style={card}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
                  VERSION HISTORY
                </div>
                {history.map((ver, i) => (
                  <div key={ver.version}>
                    <div
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingBottom: 10, marginBottom: 10,
                        borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedVer(expandedVer === ver.version ? null : ver.version)}
                    >
                      <div>
                        <span style={{ fontSize: 11, color: C.text }}>v{ver.version}</span>
                        <span style={{ fontSize: 10, color: C.faint, marginLeft: 8 }}>
                          {ver.effective_from}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: C.sub }}>{ver.total_s} S</span>
                        {ver.change_from_prior !== null && (
                          <span style={{
                            fontSize: 10,
                            color: ver.change_from_prior > 0 ? C.red : C.green,
                          }}>
                            {ver.change_from_prior > 0 ? '+' : ''}{ver.change_from_prior?.toFixed(1)}%
                          </span>
                        )}
                        <span style={{ fontSize: 10, color: C.faint }}>
                          {expandedVer === ver.version ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                    {expandedVer === ver.version && (
                      <div style={{ marginTop: -6, marginBottom: 10, paddingLeft: 8 }}>
                        {(Array.isArray(ver.lines) ? ver.lines : []).map(l => (
                          <div key={l.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: 10, color: C.faint, marginBottom: 4,
                          }}>
                            <span>{l.name}</span>
                            <span style={{ color: l.active === false ? C.faint : C.sub }}>
                              {l.active === false ? '0 S (off)' : `${l.sTokenAmount} S`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Governance note ───────────────────────────────────────── */}
            <div style={{ fontSize: 10, color: C.faint, lineHeight: 1.6, padding: '0 4px' }}>
              The MCC CEO may adjust this budget. Any increase exceeding 20% of total in a 12-month period automatically triggers a citizen vote before taking effect. All changes are recorded on-chain.
            </div>
          </>
        )}

        {/* ── Publish confirmation modal ─────────────────────────────────── */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', zIndex: 100,
          }}>
            <div style={{
              background: C.white, borderRadius: '16px 16px 0 0',
              padding: '24px 20px 32px', width: '100%', boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                Publish budget
              </div>
              <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6, marginBottom: 16 }}>
                Total: <strong style={{ color: C.gold }}>{d.totalUBI} S/month</strong>
                {pubD && ` · was ${pubD.totalUBI} S`}
                <br />
                Effective: first day of next month
              </div>

              {isSpiking && (
                <div style={{
                  background: '#2a0000', border: `1px solid ${C.red}`,
                  borderRadius: 6, padding: '8px 12px', marginBottom: 12,
                  fontSize: 10, color: C.red,
                }}>
                  Spike limit exceeded — citizen vote required before this takes effect.
                </div>
              )}

              {publishError && (
                <div style={{ fontSize: 11, color: C.red, marginBottom: 10 }}>
                  {publishError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: 'none', border: `1px solid ${C.border}`,
                    borderRadius: 8, fontSize: 12, color: C.sub,
                    cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  style={{
                    flex: 2, padding: '12px 0',
                    background: C.gold, border: 'none',
                    borderRadius: 8, fontSize: 12, color: C.bg,
                    cursor: publishing ? 'default' : 'pointer',
                    opacity: publishing ? 0.6 : 1,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                  }}
                >
                  {publishing ? 'Publishing…' : isSpiking ? 'Publish + request vote' : 'Confirm publish'}
                </button>
              </div>
            </div>
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
  padding: '16px 16px',
  marginBottom: 12,
}

const fieldLabel = {
  fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4, display: 'block',
}

const numInput = {
  padding: '7px 8px', background: C.bg,
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 12, color: C.text, outline: 'none',
  fontFamily: "'IBM Plex Mono', monospace",
  width: '100%', boxSizing: 'border-box',
}
