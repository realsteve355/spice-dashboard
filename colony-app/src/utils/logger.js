// Fire-and-forget activity logger — posts to spice.zpc.finance/api/log
// Never throws or blocks the UI regardless of network/server errors.

const ENDPOINT = 'https://spice.zpc.finance/api/log'

export function logEvent({ level = 'info', event, colony, address, txHash, message, meta } = {}) {
  if (!event) return
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level,
      event,
      colony:   colony  || undefined,
      address:  address || undefined,
      tx_hash:  txHash  || undefined,
      message:  message || undefined,
      meta:     meta    || undefined,
    }),
  }).catch(() => {})  // swallow — logging must never cause UI errors
}

// Convenience wrappers
export const logInfo  = (event, data) => logEvent({ level: 'info',  event, ...data })
export const logWarn  = (event, data) => logEvent({ level: 'warn',  event, ...data })
export const logError = (event, data) => logEvent({ level: 'error', event, ...data })
