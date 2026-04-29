/**
 * Map raw ethers / RPC errors to short, user-friendly messages.
 * Used everywhere we surface a tx error in an Alert.
 */

const FRIENDLY_REVERTS = {
  'AlreadyClaimed':       'You have already claimed UBI this epoch. Try again next epoch.',
  'already claimed':      'You have already claimed UBI this epoch. Try again next epoch.',
  'NotCitizen':           'This wallet is not a citizen of this colony.',
  'not citizen':          'This wallet is not a citizen of this colony.',
  'recipient must be':    'Recipient is not a citizen of this colony.',
  'InsufficientBalance':  'Insufficient S balance for this operation.',
  'EpochCapExceeded':     'Epoch save cap exceeded — max 200 S can be saved per epoch.',
  'Paused':               'The contract is paused.',
  'insufficient funds':   'Not enough ETH for gas. Top up the wallet at a Base Sepolia faucet.',
}

export function friendlyTxError(e) {
  const blob = (
    e?.shortMessage ||
    e?.reason ||
    e?.info?.error?.message ||
    e?.data?.message ||
    e?.message ||
    ''
  ).toString()

  // Network / gateway errors first — these masquerade as tx failures
  if (/\b502\b|bad gateway/i.test(blob))   return 'Network error (502). The blockchain RPC is briefly unavailable — please try again.'
  if (/\b503\b/i.test(blob))                return 'Network error (503). The blockchain RPC is briefly unavailable — please try again.'
  if (/\b504\b|gateway timeout/i.test(blob))return 'Network timeout. The blockchain RPC took too long — please try again.'
  if (/network.*error|fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET/i.test(blob)) {
    return 'Network error. Check your connection and try again.'
  }

  // Contract reverts
  for (const key of Object.keys(FRIENDLY_REVERTS)) {
    if (blob.toLowerCase().includes(key.toLowerCase())) return FRIENDLY_REVERTS[key]
  }

  if (/execution reverted/i.test(blob)) {
    return 'Transaction was reverted by the contract. ' +
           'Common causes: already claimed UBI this epoch, recipient is not a colony citizen, ' +
           'or insufficient balance. Pull down to refresh and try again.'
  }

  // Fallback — clip very long blobs
  return blob.length > 200 ? blob.slice(0, 200) + '…' : (blob || 'Unknown error.')
}
