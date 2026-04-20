/**
 * /api/contracts — supply contract + invoice management
 *
 * GET  ?colony=X&companyAddr=0x…
 *   → { contracts: [...], invoices: [...] }
 *
 * POST { action: 'create', colony, sellerAddr, buyerAddr, sellerName, buyerName,
 *                          description, pricePerDelivery, schedule, endsAt }
 *   → contract row
 *
 * POST { action: 'invoice', contractId, description, amount }
 *   → invoice row
 *
 * POST { action: 'pay_invoice', invoiceId, txHash }
 *   → { ok: true }
 *
 * POST { action: 'cancel', contractId }
 *   → { ok: true }
 *
 * POST { action: 'complete', contractId }
 *   → { ok: true }
 */

const SUPABASE_URL         = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

async function db(path, options = {}) {
  const { prefer, method = 'GET', body } = options
  const headers = {
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        prefer || 'return=representation',
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { method, headers, body })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`Supabase ${method} ${path} → ${r.status}: ${text}`)
  }
  return r.status === 204 ? null : r.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  // ── GET — load contracts + invoices for a company ─────────────────────────
  if (req.method === 'GET') {
    const { colony, companyAddr } = req.query
    if (!colony || !companyAddr) {
      return res.status(400).json({ error: 'colony and companyAddr required' })
    }
    const addr = companyAddr.toLowerCase()
    try {
      const contracts = await db(
        `/supply_contracts?colony=eq.${colony}&or=(seller_addr.eq.${addr},buyer_addr.eq.${addr})&order=created_at.desc`
      )
      const invoices = contracts.length > 0
        ? await db(`/supply_invoices?contract_id=in.(${contracts.map(c => c.id).join(',')})&order=created_at.asc`)
        : []
      return res.status(200).json({ contracts, invoices })
    } catch (e) {
      console.error('[contracts] GET failed:', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST — mutations ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body   = req.body || {}
    const { action } = body

    try {
      // Create a new supply contract
      if (action === 'create') {
        const { colony, sellerAddr, buyerAddr, sellerName, buyerName,
                description, pricePerDelivery, schedule, endsAt } = body
        if (!colony || !sellerAddr || !buyerAddr || !description) {
          return res.status(400).json({ error: 'colony, sellerAddr, buyerAddr, description required' })
        }
        const row = await db('/supply_contracts', {
          method: 'POST',
          body:   JSON.stringify({
            colony,
            seller_addr:        sellerAddr.toLowerCase(),
            buyer_addr:         buyerAddr.toLowerCase(),
            seller_name:        sellerName || sellerAddr.slice(0, 10),
            buyer_name:         buyerName  || buyerAddr.slice(0, 10),
            description,
            price_per_delivery: Number(pricePerDelivery) || 0,
            schedule:           schedule || 'on delivery',
            ends_at:            endsAt   || null,
            status:             'active',
          }),
        })
        return res.status(200).json(Array.isArray(row) ? row[0] : row)
      }

      // Raise an invoice against an active contract
      if (action === 'invoice') {
        const { contractId, description, amount } = body
        if (!contractId || !amount) {
          return res.status(400).json({ error: 'contractId and amount required' })
        }
        const [contract] = await db(`/supply_contracts?id=eq.${contractId}`)
        if (!contract)               return res.status(404).json({ error: 'Contract not found' })
        if (contract.status !== 'active') return res.status(400).json({ error: 'Contract is not active' })

        const existing    = await db(`/supply_invoices?contract_id=eq.${contractId}&select=id`)
        const invoiceNum  = existing.length + 1

        const row = await db('/supply_invoices', {
          method: 'POST',
          body:   JSON.stringify({
            contract_id:    contractId,
            colony:         contract.colony,
            invoice_number: invoiceNum,
            seller_addr:    contract.seller_addr,
            buyer_addr:     contract.buyer_addr,
            amount:         Number(amount),
            description:    description || contract.description,
            status:         'pending',
          }),
        })
        return res.status(200).json(Array.isArray(row) ? row[0] : row)
      }

      // Mark an invoice paid (called after on-chain tx confirms)
      if (action === 'pay_invoice') {
        const { invoiceId, txHash } = body
        if (!invoiceId) return res.status(400).json({ error: 'invoiceId required' })
        await db(`/supply_invoices?id=eq.${invoiceId}`, {
          method:  'PATCH',
          prefer:  'return=minimal',
          body:    JSON.stringify({ status: 'paid', tx_hash: txHash || null, paid_at: new Date().toISOString() }),
        })
        return res.status(200).json({ ok: true })
      }

      // Cancel a contract
      if (action === 'cancel') {
        const { contractId } = body
        if (!contractId) return res.status(400).json({ error: 'contractId required' })
        await db(`/supply_contracts?id=eq.${contractId}`, {
          method: 'PATCH', prefer: 'return=minimal',
          body:   JSON.stringify({ status: 'cancelled' }),
        })
        return res.status(200).json({ ok: true })
      }

      // Mark a contract complete
      if (action === 'complete') {
        const { contractId } = body
        if (!contractId) return res.status(400).json({ error: 'contractId required' })
        await db(`/supply_contracts?id=eq.${contractId}`, {
          method: 'PATCH', prefer: 'return=minimal',
          body:   JSON.stringify({ status: 'complete' }),
        })
        return res.status(200).json({ ok: true })
      }

      return res.status(400).json({ error: `Unknown action: ${action}` })
    } catch (e) {
      console.error('[contracts] POST failed:', action, e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
