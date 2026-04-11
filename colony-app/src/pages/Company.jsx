import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import SendSheet from '../components/SendSheet'
import { MOCK_COMPANIES, MOCK_CONTRACTS, MOCK_WALLET } from '../data/mock'
import { useWallet } from '../App'

const COLONY_ABI = [
  "function send(address, uint256, string) external",
]

const COLONY_EVENTS_ABI = [
  "event Sent(address indexed from, address indexed to, uint256 amount, string note)",
]

const C = {
  gold:   '#B8860B',
  border: '#e2e2e2',
  white:  '#ffffff',
  text:   '#111',
  sub:    '#555',
  faint:  '#aaa',
  bg:     '#f5f5f5',
  green:  '#16a34a',
  red:    '#ef4444',
  purple: '#8b5cf6',
}

export default function Company() {
  const { slug, companyId } = useParams()
  const navigate = useNavigate()
  const { address, signer, provider, contracts: deployedContracts, refresh } = useWallet()

  const companies = MOCK_COMPANIES[slug] || []
  const company   = companies.find(c => c.id === companyId)

  const [tab, setTab]           = useState('overview')
  const contracts = MOCK_CONTRACTS[companyId] || []
  const [redeeming, setRedeem]  = useState(false)

  // On-chain received payments
  const [onChainTxs, setOnChainTxs] = useState([])
  const [txLoading,  setTxLoading]  = useState(false)

  useEffect(() => {
    if (tab !== 'transactions') return
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg || !provider || !address) return
    setTxLoading(true)
    const colonyContract = new ethers.Contract(cfg.colony, COLONY_EVENTS_ABI, provider)
    // Query Sent events where to == address (received) or from == address (sent)
    Promise.all([
      colonyContract.queryFilter(colonyContract.filters.Sent(null, address)),
      colonyContract.queryFilter(colonyContract.filters.Sent(address, null)),
    ]).then(([received, sent]) => {
      const all = [
        ...received.map(e => ({
          hash: e.transactionHash,
          from: e.args.from,
          to: e.args.to,
          amount: Math.floor(Number(ethers.formatEther(e.args.amount))),
          note: e.args.note,
          direction: 'in',
        })),
        ...sent.map(e => ({
          hash: e.transactionHash,
          from: e.args.from,
          to: e.args.to,
          amount: Math.floor(Number(ethers.formatEther(e.args.amount))),
          note: e.args.note,
          direction: 'out',
        })),
      ].sort((a, b) => a.hash < b.hash ? 1 : -1)
      setOnChainTxs(all)
    }).catch(e => console.warn('Failed to load on-chain txs', e))
      .finally(() => setTxLoading(false))
  }, [tab, deployedContracts, slug, provider, address])
  const [redeemAmt, setRedeemAmt] = useState('')
  const [dividending, setDiv]   = useState(false)
  const [divAmt, setDivAmt]     = useState('')
  const [sending, setSending]   = useState(false)

  async function handleSend(amt, recipient, note) {
    const cfg = deployedContracts?.colonies?.[slug]
    if (!cfg || !signer) { setSending(false); return }
    try {
      const colony = new ethers.Contract(cfg.colony, COLONY_ABI, signer)
      const tx = await colony.send(recipient, ethers.parseEther(String(amt)), note)
      await tx.wait()
      refresh()
    } catch (e) {
      console.error(e)
    }
    setSending(false)
  }

  if (!company) return (
    <Layout title="Company" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        Company not found.
      </div>
    </Layout>
  )

  const myStake  = company.equity.find(e => e.wallet === (address || MOCK_WALLET))
  const isOwner  = !!myStake
  const net      = company.monthRevenue - company.monthExpenses
  const estVConv = Math.max(0, net)  // net S-tokens convert to V at month end

  return (
    <Layout title={company.name} back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Header card */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{company.name}</div>
            {myStake && (
              <span style={{ fontSize: 10, color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 10, padding: '2px 8px' }}>
                {myStake.pct}% EQUITY
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.faint }}>
            Registered {company.registeredDate} · {company.equity.length} shareholder{company.equity.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', marginBottom: 12, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', background: C.white }}>
          {[['overview','Overview'],['equity','Equity'],['transactions','History'],['contracts','Contracts']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0', background: tab === t ? C.gold : 'none',
              border: 'none', color: tab === t ? '#fff' : C.sub,
              fontSize: 10, cursor: 'pointer', letterSpacing: '0.04em',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div>
            {/* Balance row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>S BALANCE</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: C.gold }}>{company.sBalance}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>this month</div>
              </div>
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }}>V RESERVE</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: C.green }}>{company.vReserve}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>accumulated</div>
              </div>
            </div>

            {/* P&L this month */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>THIS MONTH</div>
              <Row label="Revenue" value={`+${company.monthRevenue} S`} color={C.green} />
              <Divider />
              <Row label="Expenses" value={`−${company.monthExpenses} S`} color={C.red} />
              <Divider />
              <Row label="Net" value={`${net >= 0 ? '+' : ''}${net} S`} color={net >= 0 ? C.gold : C.red} bold />
              <Divider />
              <Row label="Est. V conversion at month end" value={`${estVConv} V`} color={C.green} />
            </div>

            {/* Actions */}
            {isOwner && (
              <div style={card}>
                <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>ACTIONS</div>

                <button onClick={() => setRedeem(v => !v)} style={{ ...actionBtn(C.sub), width: '100%', marginBottom: 8 }}>
                  Redeem V → S (fund operations)
                </button>
                {redeeming && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      style={{ ...inlineInput, flex: 1 }}
                      placeholder={`max ${company.vReserve} V`}
                      value={redeemAmt}
                      onChange={e => setRedeemAmt(e.target.value)}
                      type="number"
                    />
                    <button onClick={() => setRedeem(false)} style={actionBtn(C.gold)}>Confirm</button>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/colony/${slug}/request?from=${address}&label=${encodeURIComponent(company.name)}`)}
                  style={{ ...actionBtn(C.gold), width: '100%', marginBottom: 8 }}
                >
                  Request Payment (show QR) →
                </button>

                <button onClick={() => setSending(v => !v)} style={{ ...actionBtn(C.sub, '#fff'), width: '100%', marginBottom: 8, border: `1px solid ${C.border}` }}>
                  Send S-tokens →
                </button>
                {sending && (
                  <div style={{ marginBottom: 8 }}>
                    <SendSheet
                      maxAmount={company.sBalance}
                      label="Pay company or citizen"
                      onClose={() => setSending(false)}
                      onConfirm={handleSend}
                    />
                  </div>
                )}

                <button onClick={() => setDiv(v => !v)} style={{ ...actionBtn(C.sub), width: '100%' }}>
                  Pay dividend to equity holders
                </button>
                {dividending && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: C.faint, marginBottom: 6 }}>
                      Total V-tokens to distribute (from V reserve: {company.vReserve} V)
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        style={{ ...inlineInput, flex: 1 }}
                        placeholder={`max ${company.vReserve} V`}
                        value={divAmt}
                        onChange={e => setDivAmt(e.target.value)}
                        type="number"
                      />
                      <button onClick={() => setDiv(false)} style={actionBtn(C.gold)}>Send</button>
                    </div>
                    {divAmt && (
                      <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.7 }}>
                        {company.equity.map(e => (
                          <div key={e.wallet}>
                            {e.label}: {Math.round(Number(divAmt) * e.pct / 100)} V ({e.pct}%)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Equity ── */}
        {tab === 'equity' && (
          <div>
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>EQUITY REGISTER</div>

              {/* Visual equity bar */}
              <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                {company.equity.map((e, i) => (
                  <div key={i} style={{
                    width: `${e.pct}%`,
                    background: equityColor(i),
                  }} />
                ))}
              </div>

              {company.equity.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < company.equity.length - 1 ? 10 : 0,
                  marginBottom: i < company.equity.length - 1 ? 10 : 0,
                  borderBottom: i < company.equity.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: equityColor(i), flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: C.text }}>{e.label}</div>
                      <div style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace' }}>{e.wallet}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: equityColor(i) }}>{e.pct}%</div>
                </div>
              ))}
            </div>

            {/* Share trading */}
            {isOwner && (
              <ShareTrading company={company} myStake={myStake} slug={slug} />
            )}

            {/* Dividend history */}
            <div style={card}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>DIVIDEND HISTORY</div>
              {company.dividendHistory.length === 0 ? (
                <div style={{ fontSize: 12, color: C.faint }}>No dividends paid yet.</div>
              ) : (
                company.dividendHistory.map((d, i) => {
                  const myShare = d.perHolder[address || MOCK_WALLET] || 0
                  return (
                    <div key={i} style={{
                      paddingBottom: i < company.dividendHistory.length - 1 ? 10 : 0,
                      marginBottom: i < company.dividendHistory.length - 1 ? 10 : 0,
                      borderBottom: i < company.dividendHistory.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, color: C.sub }}>{d.date}</span>
                        <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>{d.totalV} V total</span>
                      </div>
                      {myShare > 0 && (
                        <div style={{ fontSize: 11, color: C.gold }}>
                          Your share: {myShare} V
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── Contracts ── */}
        {tab === 'contracts' && (
          <ContractsTab contracts={contracts} isOwner={isOwner} companyId={companyId} />
        )}

        {/* ── Transactions ── */}
        {tab === 'transactions' && (
          <div style={card}>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
              {onChainTxs.length > 0 ? 'ON-CHAIN TRANSACTIONS' : 'TRANSACTIONS'}
            </div>

            {txLoading && (
              <div style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: 20 }}>Loading...</div>
            )}

            {!txLoading && onChainTxs.length > 0 && onChainTxs.map((tx, i) => (
              <div key={tx.hash + i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: i < onChainTxs.length - 1 ? 10 : 0,
                marginBottom: i < onChainTxs.length - 1 ? 10 : 0,
                borderBottom: i < onChainTxs.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text }}>
                    {tx.note || (tx.direction === 'in' ? 'Payment received' : 'Payment sent')}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 2, fontFamily: 'monospace' }}>
                    {tx.direction === 'in'
                      ? `from ${tx.from.slice(0,8)}...${tx.from.slice(-4)}`
                      : `to ${tx.to.slice(0,8)}...${tx.to.slice(-4)}`
                    }
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: tx.direction === 'in' ? C.green : C.red }}>
                  {tx.direction === 'in' ? '+' : '-'}{tx.amount} S
                </div>
              </div>
            ))}

            {!txLoading && onChainTxs.length === 0 && company.transactions.map((tx, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: i < company.transactions.length - 1 ? 10 : 0,
                marginBottom: i < company.transactions.length - 1 ? 10 : 0,
                borderBottom: i < company.transactions.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text }}>{tx.label}</div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{tx.date}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: tx.amount > 0 ? C.green : C.red }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} S
                </div>
              </div>
            ))}

            {!txLoading && onChainTxs.length === 0 && company.transactions.length === 0 && (
              <div style={{ fontSize: 12, color: C.faint }}>No transactions yet.</div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}

const CONTRACT_META = {
  forward:       { label: 'FORWARD',      color: '#3b82f6' },
  escrow:        { label: 'ESCROW',       color: '#8b5cf6' },
  'revenue-share': { label: 'REV SHARE', color: '#B8860B' },
}

const STATUS_META = {
  active:    { label: 'ACTIVE',   color: '#16a34a' },
  settled:   { label: 'SETTLED',  color: '#aaa'    },
  cancelled: { label: 'CANCELLED',color: '#ef4444' },
}

function ContractsTab({ contracts, isOwner, companyId }) {
  const [creating, setCreating]     = useState(false)
  const [cType, setCType]           = useState('forward')
  const [cContra, setCContra]       = useState('')
  const [cAmount, setCAmount]       = useState('')
  const [cPct, setCPct]             = useState('')
  const [cDate, setCDate]           = useState('')
  const [cDesc, setCDesc]           = useState('')
  const [localContracts, setLocal]  = useState(contracts)
  const [expanded, setExpanded]     = useState(null)

  const active   = localContracts.filter(c => c.status === 'active')
  const closed   = localContracts.filter(c => c.status !== 'active')

  function confirmDelivery(id) {
    setLocal(cs => cs.map(c => c.id === id ? { ...c, status: 'settled' } : c))
  }

  function createContract() {
    const newC = {
      id: `c-new-${Date.now()}`,
      type: cType,
      title: cDesc || `New ${cType} contract`,
      counterpartyLabel: cContra || 'Counterparty',
      counterparty: '0x????...????',
      amount: Number(cAmount) || 0,
      pct: Number(cPct) || 0,
      settleDate: cDate || 'End of month',
      status: 'active',
      role: 'buyer',
      description: cDesc,
      revenueSharedMTD: 0,
    }
    setLocal(cs => [newC, ...cs])
    setCreating(false)
    setCContra(''); setCAmount(''); setCPct(''); setCDate(''); setCDesc('')
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginBottom: 12 }}>
        Intra-month contracts commit S-token flows within the current month.
        All contracts must settle by month end — unsettled escrow is destroyed with unspent S-tokens.
      </div>

      {isOwner && !creating && (
        <button onClick={() => setCreating(true)} style={{ ...ghostBtn, width: '100%', marginBottom: 12 }}>
          + New contract
        </button>
      )}

      {/* Create form */}
      {creating && (
        <div style={{ ...card, borderColor: C.gold, background: '#fffbf0', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: '0.1em', marginBottom: 12 }}>NEW CONTRACT</div>

          {/* Type selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {['forward','escrow','revenue-share'].map(t => (
              <button key={t} onClick={() => setCType(t)} style={{
                flex: 1, padding: '8px 4px',
                background: cType === t ? C.gold : '#fff',
                color: cType === t ? '#fff' : C.sub,
                border: `1px solid ${cType === t ? C.gold : C.border}`,
                borderRadius: 6, fontSize: 10, cursor: 'pointer',
              }}>
                {t === 'revenue-share' ? 'Rev Share' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: C.faint, marginBottom: 12, lineHeight: 1.6 }}>
            {cType === 'forward'        && 'Buyer pre-commits S-tokens in escrow. Released to seller on delivery confirmation.'}
            {cType === 'escrow'         && 'Tokens deposited with Fisc, released when a defined condition is met.'}
            {cType === 'revenue-share'  && 'A % of inbound S-token revenue is routed automatically to the counterparty.'}
          </div>

          <CField label="Counterparty wallet or name" value={cContra}  onChange={setCContra} placeholder="0x... or company name" />
          {cType === 'revenue-share'
            ? <CField label="Revenue share %" value={cPct} onChange={setCPct} placeholder="e.g. 15" type="number" />
            : <CField label="S-token amount" value={cAmount} onChange={setCAmount} placeholder="e.g. 200" type="number" />
          }
          <CField label="Settlement date (this month)" value={cDate} onChange={setCDate} placeholder="e.g. 25 Apr 2026" />
          <CField label="Description" value={cDesc} onChange={setCDesc} placeholder="Brief description of the arrangement" />

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => setCreating(false)} style={{ ...actionBtn(C.faint, '#fff'), border: `1px solid ${C.border}`, flex: 1 }}>Cancel</button>
            <button
              onClick={createContract}
              disabled={!cContra}
              style={{ ...actionBtn(C.gold), flex: 2, opacity: cContra ? 1 : 0.4 }}
            >
              Create on-chain →
            </button>
          </div>
        </div>
      )}

      {/* Active contracts */}
      {active.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: C.green, letterSpacing: '0.1em', marginBottom: 8 }}>ACTIVE</div>
          {active.map(c => (
            <ContractCard
              key={c.id} contract={c} isOwner={isOwner}
              expanded={expanded === c.id}
              onToggle={() => setExpanded(e => e === c.id ? null : c.id)}
              onSettle={() => confirmDelivery(c.id)}
            />
          ))}
        </>
      )}

      {/* Closed contracts */}
      {closed.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.1em', marginBottom: 8, marginTop: 8 }}>CLOSED</div>
          {closed.map(c => (
            <ContractCard
              key={c.id} contract={c} isOwner={false}
              expanded={expanded === c.id}
              onToggle={() => setExpanded(e => e === c.id ? null : c.id)}
              onSettle={null}
            />
          ))}
        </>
      )}

      {localContracts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 24, color: C.faint, fontSize: 12 }}>
          No contracts this month.
        </div>
      )}
    </div>
  )
}

function CField({ label, value, onChange, placeholder, type }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em', marginBottom: 4 }}>{label.toUpperCase()}</div>
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

function ContractCard({ contract: c, isOwner, expanded, onToggle, onSettle }) {
  const tmeta = CONTRACT_META[c.type] || CONTRACT_META.escrow
  const smeta = STATUS_META[c.status]  || STATUS_META.active

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${expanded ? C.gold : C.border}`,
      borderRadius: 8, marginBottom: 8, overflow: 'hidden',
    }}>
      <div onClick={onToggle} style={{ padding: '12px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <Badge label={tmeta.label} color={tmeta.color} />
              <Badge label={smeta.label} color={smeta.color} />
              {c.role && <Badge label={c.role.toUpperCase()} color={C.faint} />}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{c.title}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
              {c.counterpartyLabel} · Settles {c.settleDate}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
            {c.type === 'revenue-share'
              ? <div style={{ fontSize: 13, fontWeight: 500, color: tmeta.color }}>{c.pct}%</div>
              : <div style={{ fontSize: 13, fontWeight: 500, color: tmeta.color }}>{c.amount} S</div>
            }
            <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{expanded ? '↑' : '↓'}</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 10 }}>
            {c.description}
          </div>
          {c.type === 'revenue-share' && c.revenueSharedMTD !== undefined && (
            <div style={{ fontSize: 12, color: C.gold, marginBottom: 10 }}>
              Revenue shared month-to-date: {c.revenueSharedMTD} S
            </div>
          )}
          <div style={{ fontSize: 11, color: C.faint, fontFamily: 'monospace', marginBottom: 12 }}>
            Counterparty: {c.counterparty}
          </div>
          {c.status === 'active' && isOwner && c.role === 'buyer' && c.type !== 'revenue-share' && (
            <button onClick={onSettle} style={{ ...actionBtn(C.green), width: '100%' }}>
              Confirm delivery & release escrow →
            </button>
          )}
          {c.status === 'settled' && (
            <div style={{ fontSize: 12, color: C.faint }}>Settled — tokens released.</div>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 9, color: color, border: `1px solid ${color}`,
      borderRadius: 4, padding: '2px 5px', letterSpacing: '0.06em', flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

function ShareTrading({ company, myStake, slug }) {
  const [listing, setListing]   = useState(false)
  const [listPct, setListPct]   = useState('')
  const [listPrice, setListPrice] = useState('')
  const [listed, setListed]     = useState(false)

  function confirmList() {
    setListed(true)
    setListing(false)
  }

  return (
    <div style={{ ...card, borderColor: listed ? C.green : C.border }}>
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>SHARE TRADING</div>

      {listed ? (
        <div>
          <div style={{ fontSize: 12, color: C.green, marginBottom: 6 }}>
            ✓ {listPct}% listed for {listPrice} S
          </div>
          <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
            Any citizen in this colony can purchase at the listed price.
            Transfer is atomic — payment and ownership change simultaneously on-chain.
          </div>
          <button
            onClick={() => { setListed(false); setListPct(''); setListPrice('') }}
            style={{ ...actionBtn(C.faint, '#fff'), marginTop: 10, border: `1px solid ${C.border}` }}
          >
            Cancel listing
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginBottom: 12 }}>
            You hold <span style={{ color: C.gold }}>{myStake?.pct}%</span> equity.
            Shares may be sold to any citizen at a freely agreed price in S-tokens.
            Transfer is atomic on-chain. Shares may not be pledged as collateral.
          </div>
          {!listing ? (
            <button onClick={() => setListing(true)} style={{ ...actionBtn(C.sub), border: `1px solid ${C.border}`, background: '#fff', color: C.sub }}>
              List shares for sale
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>PERCENT TO SELL</div>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inlineInput, width: '100%', paddingRight: 20 }}
                      placeholder={`max ${myStake?.pct}`}
                      value={listPct}
                      onChange={e => setListPct(e.target.value)}
                      type="number"
                      min="0.01"
                      max={myStake?.pct}
                    />
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.faint }}>%</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>PRICE (S-TOKENS)</div>
                  <input
                    style={{ ...inlineInput, width: '100%' }}
                    placeholder="e.g. 500"
                    value={listPrice}
                    onChange={e => setListPrice(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setListing(false)} style={{ ...actionBtn(C.faint, '#fff'), border: `1px solid ${C.border}`, flex: 1 }}>Cancel</button>
                <button
                  onClick={confirmList}
                  disabled={!listPct || !listPrice}
                  style={{ ...actionBtn(C.gold), flex: 2, opacity: listPct && listPrice ? 1 : 0.4 }}
                >
                  List on-chain →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helpers
function equityColor(i) {
  const palette = ['#B8860B', '#16a34a', '#8b5cf6', '#3b82f6', '#ef4444']
  return palette[i % palette.length]
}

function Row({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
      <span style={{ fontSize: 12, color: color || '#111', fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  )
}

function Divider() {
  return <div style={{ borderBottom: '1px solid #e2e2e2', margin: '8px 0' }} />
}

const card = {
  background: '#ffffff', border: '1px solid #e2e2e2',
  borderRadius: 8, padding: 16, marginBottom: 10,
}

function actionBtn(bg, color = '#fff') {
  return {
    padding: '10px 14px', background: bg, color,
    border: 'none', borderRadius: 6, fontSize: 11,
    cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
  }
}

const inlineInput = {
  padding: '9px 10px', border: '1px solid #e2e2e2',
  borderRadius: 6, fontSize: 12, color: '#111', background: '#fff', outline: 'none',
}
