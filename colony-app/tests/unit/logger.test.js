/**
 * logger.test.js — verifies logger.js POSTs the right shape and never throws.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { logEvent, logInfo, logWarn, logError } from '../../src/utils/logger.js'

const ENDPOINT = 'https://app.zpc.finance/api/log'

describe('logEvent', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }))
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns silently and does NOT POST when event is missing', () => {
    logEvent({ message: 'no event name' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('POSTs to /api/log with the right URL and method', () => {
    logEvent({ event: 'test_event' })
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe(ENDPOINT)
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')
  })

  it('serialises event, level, and optional fields into the body', () => {
    logEvent({
      event: 'payment_sent',
      level: 'info',
      colony: '0xCOLONY',
      address: '0xUSER',
      txHash: '0xDEAD',
      message: 'paid 50 S',
      meta: { amount: 50 },
    })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body).toEqual({
      level: 'info',
      event: 'payment_sent',
      colony: '0xCOLONY',
      address: '0xUSER',
      tx_hash: '0xDEAD',
      message: 'paid 50 S',
      meta: { amount: 50 },
    })
  })

  it('defaults level to "info" when omitted', () => {
    logEvent({ event: 'thing' })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.level).toBe('info')
  })

  it('omits empty optional fields (sets undefined → JSON.stringify drops them)', () => {
    logEvent({ event: 'thing' })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body).not.toHaveProperty('colony')
    expect(body).not.toHaveProperty('address')
    expect(body).not.toHaveProperty('tx_hash')
    expect(body).not.toHaveProperty('message')
    expect(body).not.toHaveProperty('meta')
  })

  it('renames txHash → tx_hash for the API contract', () => {
    logEvent({ event: 'tx', txHash: '0xABCD' })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.tx_hash).toBe('0xABCD')
    expect(body).not.toHaveProperty('txHash')
  })

  it('does NOT throw when fetch rejects (logging must never break UI)', () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network down')))
    expect(() => logEvent({ event: 'thing' })).not.toThrow()
  })
})

describe('logInfo / logWarn / logError convenience wrappers', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }))
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logInfo sets level=info', () => {
    logInfo('boot', { message: 'app started' })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.level).toBe('info')
    expect(body.event).toBe('boot')
  })

  it('logWarn sets level=warn', () => {
    logWarn('slow_rpc', { meta: { ms: 5000 } })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.level).toBe('warn')
    expect(body.meta.ms).toBe(5000)
  })

  it('logError sets level=error', () => {
    logError('tx_failed', { txHash: '0xabc' })
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.level).toBe('error')
    expect(body.tx_hash).toBe('0xabc')
  })
})
