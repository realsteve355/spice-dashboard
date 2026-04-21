/**
 * mockWallet.js — injected by Playwright as a page init script
 *
 * Runs in browser context (no import/export) before the app loads.
 * Sets window.ethereum to a minimal EIP-1193 provider that:
 *   - Returns the test wallet address for account queries  ← triggers App.jsx auto-connect
 *   - Reports chain 84532 (Base Sepolia)                  ← passes chain check in connect()
 *   - Proxies all other RPC calls to Base Sepolia          ← loadOnChainData reads real chain
 *
 * window.__TEST_ADDRESS__ must be set before this script runs.
 * See tests/helpers/fixtures.js for how that's done.
 *
 * Signing (eth_sendTransaction) is intentionally not implemented here —
 * add that when write-path E2E tests are needed.
 */
;(function () {
  const RPC           = 'https://sepolia.base.org'
  const CHAIN_ID_HEX  = '0x14a34'
  const CHAIN_ID_DEC  = '84532'
  let reqId = 1

  async function rpcProxy(method, params) {
    const res = await fetch(RPC, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ jsonrpc: '2.0', id: reqId++, method, params: params ?? [] }),
    })
    const json = await res.json()
    if (json.error) {
      const err = new Error(json.error.message)
      err.code  = json.error.code
      throw err
    }
    return json.result
  }

  const _listeners = {}

  window.ethereum = {
    isMetaMask:      true,
    chainId:         CHAIN_ID_HEX,
    selectedAddress: window.__TEST_ADDRESS__ || null,

    async request({ method, params }) {
      // ── Identity ───────────────────────────────────────────────────────────
      if (method === 'eth_accounts' || method === 'eth_requestAccounts')
        return window.__TEST_ADDRESS__ ? [window.__TEST_ADDRESS__] : []

      if (method === 'eth_chainId')  return CHAIN_ID_HEX
      if (method === 'net_version')  return CHAIN_ID_DEC

      // ── Wallet management — no-ops ────────────────────────────────────────
      if (method === 'wallet_switchEthereumChain')  return null
      if (method === 'wallet_addEthereumChain')     return null
      if (method === 'wallet_revokePermissions')    return null

      // ── Signing — not yet implemented ────────────────────────────────────
      if (method === 'eth_sendTransaction') {
        throw new Error(
          '[mockWallet] eth_sendTransaction is not supported yet.\n' +
          'See tests/helpers/mockWallet.js to add signing support.'
        )
      }
      if (method === 'eth_sign' || method === 'personal_sign' || method === 'eth_signTypedData_v4') {
        throw new Error('[mockWallet] signing not supported in read-only test mode')
      }

      // ── Everything else — proxy to chain ──────────────────────────────────
      return rpcProxy(method, params)
    },

    on(event, handler) {
      _listeners[event] = _listeners[event] || []
      _listeners[event].push(handler)
    },

    removeListener(event, handler) {
      if (_listeners[event])
        _listeners[event] = _listeners[event].filter(h => h !== handler)
    },

    // Internal helper for tests that want to simulate events
    _emit(event, ...args) {
      ;(_listeners[event] || []).forEach(h => h(...args))
    },
  }
})()
