/**
 * txErrors.test.js — friendlyTxError() maps raw ethers / RPC errors to
 * short, user-readable messages. The function never throws; it always
 * returns a string.
 */
import { describe, it, expect } from 'vitest'
import { friendlyTxError } from '../../src/utils/txErrors.js'

describe('friendlyTxError — network errors', () => {
  it('detects 502 Bad Gateway anywhere in the message', () => {
    const msg = friendlyTxError({ message: 'Network request failed: 502 Bad Gateway' })
    expect(msg).toMatch(/502/)
    expect(msg.toLowerCase()).toContain('try again')
  })

  it('detects 503', () => {
    const msg = friendlyTxError({ message: 'HTTP 503 service unavailable' })
    expect(msg).toMatch(/503/)
  })

  it('detects 504 / Gateway Timeout', () => {
    const msg = friendlyTxError({ message: 'Gateway Timeout' })
    expect(msg.toLowerCase()).toContain('timeout')
  })

  it('detects generic network errors (fetch failed, ENOTFOUND)', () => {
    expect(friendlyTxError({ message: 'fetch failed' })).toMatch(/network/i)
    expect(friendlyTxError({ message: 'ENOTFOUND sepolia.base.org' })).toMatch(/network/i)
    expect(friendlyTxError({ message: 'ECONNREFUSED' })).toMatch(/network/i)
  })
})

describe('friendlyTxError — contract reverts', () => {
  it('maps "AlreadyClaimed" to a friendly UBI message', () => {
    const msg = friendlyTxError({ message: 'execution reverted: AlreadyClaimed' })
    expect(msg).toMatch(/already claimed/i)
    expect(msg).toMatch(/epoch/i)
  })

  it('maps "NotCitizen" to a citizen-status message', () => {
    const msg = friendlyTxError({ message: 'reverted: NotCitizen' })
    expect(msg).toMatch(/not a citizen/i)
  })

  it('maps "InsufficientBalance"', () => {
    const msg = friendlyTxError({ message: 'InsufficientBalance' })
    expect(msg).toMatch(/insufficient/i)
  })

  it('maps "EpochCapExceeded"', () => {
    const msg = friendlyTxError({ message: 'EpochCapExceeded' })
    expect(msg).toMatch(/200 S/)
  })

  it('falls back to a friendly "execution reverted" message when no specific code matches', () => {
    const msg = friendlyTxError({ message: 'transaction execution reverted' })
    expect(msg).toMatch(/reverted/i)
    expect(msg.toLowerCase()).toContain('try again')
  })

  it('detects "insufficient funds" (ETH for gas)', () => {
    const msg = friendlyTxError({ message: 'insufficient funds for gas * price + value' })
    expect(msg).toMatch(/ETH/i)
    expect(msg).toMatch(/faucet/i)
  })
})

describe('friendlyTxError — input shapes', () => {
  it('reads from shortMessage when present (ethers v6)', () => {
    const e = { shortMessage: 'execution reverted: AlreadyClaimed', message: 'long stack trace' }
    expect(friendlyTxError(e)).toMatch(/already claimed/i)
  })

  it('reads from reason', () => {
    const e = { reason: 'NotCitizen' }
    expect(friendlyTxError(e)).toMatch(/not a citizen/i)
  })

  it('reads from nested info.error.message', () => {
    const e = { info: { error: { message: '502 Bad Gateway' } } }
    expect(friendlyTxError(e)).toMatch(/502/)
  })

  it('reads from data.message', () => {
    const e = { data: { message: 'execution reverted: InsufficientBalance' } }
    expect(friendlyTxError(e)).toMatch(/insufficient/i)
  })

  it('returns a sensible default for empty / unknown errors', () => {
    expect(friendlyTxError({})).toBe('Unknown error.')
    expect(friendlyTxError(null)).toBe('Unknown error.')
    expect(friendlyTxError(undefined)).toBe('Unknown error.')
  })

  it('clips very long blobs that match nothing else', () => {
    const long = 'X'.repeat(500)
    const result = friendlyTxError({ message: long })
    expect(result.length).toBeLessThanOrEqual(201)  // 200 + ellipsis
    expect(result.endsWith('…')).toBe(true)
  })
})
