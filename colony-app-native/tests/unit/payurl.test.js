/**
 * payurl.test.js — pure URL building / parsing for SPICE pay links.
 *
 * Covers the contract that everything else depends on:
 *   buildPayUrl  — merchant generates spice://pay?... URLs for QR / NDEF
 *   parsePayUrl  — citizen scans tag / QR and extracts payment params
 *   decodeItems  — items=id1x2,id2x1 → array of { id, qty }
 */
import { describe, it, expect } from 'vitest'
import { buildPayUrl, parsePayUrl, decodeItems } from '../../src/utils/payurl.js'

const ADDR = '0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5'

describe('decodeItems', () => {
  it('returns empty array for empty / null input', () => {
    expect(decodeItems('')).toEqual([])
    expect(decodeItems(null)).toEqual([])
    expect(decodeItems(undefined)).toEqual([])
  })

  it('parses a single id+qty pair', () => {
    expect(decodeItems('abc123x2')).toEqual([{ id: 'abc123', qty: 2 }])
  })

  it('parses multiple comma-separated pairs', () => {
    expect(decodeItems('a1x2,b2x1,c3x5')).toEqual([
      { id: 'a1', qty: 2 },
      { id: 'b2', qty: 1 },
      { id: 'c3', qty: 5 },
    ])
  })

  it('handles UUIDs (which contain hyphens but no x in the right place)', () => {
    const uuid1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    const uuid2 = '550e8400-e29b-41d4-a716-446655440000'
    expect(decodeItems(`${uuid1}x3,${uuid2}x1`)).toEqual([
      { id: uuid1, qty: 3 },
      { id: uuid2, qty: 1 },
    ])
  })

  it('uses the LAST x as the separator (so ids may contain x)', () => {
    expect(decodeItems('with-x-init1d-here-x4')).toEqual([
      { id: 'with-x-init1d-here-', qty: 4 },
    ])
  })

  it('drops malformed pairs (no x, qty 0, missing id)', () => {
    expect(decodeItems('valid1x2,noseparator,emptyx0,x5,blank-x-')).toEqual([
      { id: 'valid1', qty: 2 },
    ])
  })
})

describe('buildPayUrl', () => {
  it('throws when "to" is not a 0x address', () => {
    expect(() => buildPayUrl({ to: '' })).toThrow()
    expect(() => buildPayUrl({ to: 'notanaddress' })).toThrow()
    expect(() => buildPayUrl({ to: '0x123' })).toThrow()  // wrong length
  })

  it('builds a minimal URL with just "to"', () => {
    expect(buildPayUrl({ to: ADDR })).toBe(`spice://pay?to=${ADDR}`)
  })

  it('includes amount when provided', () => {
    expect(buildPayUrl({ to: ADDR, amount: 5 })).toBe(`spice://pay?to=${ADDR}&amount=5`)
    expect(buildPayUrl({ to: ADDR, amount: '10' })).toBe(`spice://pay?to=${ADDR}&amount=10`)
  })

  it('skips amount when empty / null / undefined', () => {
    expect(buildPayUrl({ to: ADDR, amount: '' })).toBe(`spice://pay?to=${ADDR}`)
    expect(buildPayUrl({ to: ADDR, amount: null })).toBe(`spice://pay?to=${ADDR}`)
    expect(buildPayUrl({ to: ADDR, amount: undefined })).toBe(`spice://pay?to=${ADDR}`)
  })

  it('URL-encodes notes with spaces and special chars', () => {
    const url = buildPayUrl({ to: ADDR, amount: 5, note: 'Coffee & cake' })
    expect(url).toContain('note=Coffee%20%26%20cake')
  })

  it('URL-encodes merchant name', () => {
    const url = buildPayUrl({ to: ADDR, amount: 5, merchantName: "Carla's Coffee" })
    expect(url).toContain("name=Carla's%20Coffee")
  })

  it('encodes items array as items=id1xqty,id2xqty', () => {
    const url = buildPayUrl({
      to: ADDR,
      amount: 7,
      items: [{ id: 'abc', qty: 2 }, { id: 'def', qty: 1 }],
    })
    expect(url).toContain('items=abc')
    expect(url).toContain('def')
  })

  it('skips items entirely when array empty or qty 0', () => {
    const url1 = buildPayUrl({ to: ADDR, amount: 5, items: [] })
    expect(url1).not.toContain('items=')

    const url2 = buildPayUrl({ to: ADDR, amount: 5, items: [{ id: 'a', qty: 0 }] })
    expect(url2).not.toContain('items=')
  })
})

describe('parsePayUrl', () => {
  it('returns null for non-string / empty / no-query input', () => {
    expect(parsePayUrl('')).toBe(null)
    expect(parsePayUrl(null)).toBe(null)
    expect(parsePayUrl(undefined)).toBe(null)
    expect(parsePayUrl('spice://pay')).toBe(null)
  })

  it('returns null when "to" is missing or invalid', () => {
    expect(parsePayUrl('spice://pay?amount=5')).toBe(null)
    expect(parsePayUrl('spice://pay?to=notanaddress&amount=5')).toBe(null)
    expect(parsePayUrl('spice://pay?to=0x123')).toBe(null)
  })

  it('parses a minimal URL with just "to"', () => {
    const r = parsePayUrl(`spice://pay?to=${ADDR}`)
    expect(r).toEqual({
      to:           ADDR,
      amount:       '',
      note:         '',
      merchantName: '',
      items:        [],
    })
  })

  it('parses amount + note + merchant name', () => {
    const r = parsePayUrl(`spice://pay?to=${ADDR}&amount=5&note=Lunch&name=Carla's%20Coffee`)
    expect(r.to).toBe(ADDR)
    expect(r.amount).toBe('5')
    expect(r.note).toBe('Lunch')
    expect(r.merchantName).toBe("Carla's Coffee")
  })

  it('decodes URL-encoded notes', () => {
    const r = parsePayUrl(`spice://pay?to=${ADDR}&note=Coffee%20%26%20cake`)
    expect(r.note).toBe('Coffee & cake')
  })

  it('decodes "+" as space (form-encoded) inside notes', () => {
    const r = parsePayUrl(`spice://pay?to=${ADDR}&note=Coffee+and+cake`)
    expect(r.note).toBe('Coffee and cake')
  })

  it('parses items into an array of { id, qty }', () => {
    const r = parsePayUrl(`spice://pay?to=${ADDR}&amount=8&items=abcx2,defx1`)
    expect(r.items).toEqual([
      { id: 'abc', qty: 2 },
      { id: 'def', qty: 1 },
    ])
  })

  it('roundtrips: build then parse returns the same payload', () => {
    const built = buildPayUrl({
      to:           ADDR,
      amount:       12,
      note:         'Coffee + croissant',
      merchantName: "Carla's Coffee",
      items:        [{ id: 'p1', qty: 2 }, { id: 'p2', qty: 1 }],
    })
    const parsed = parsePayUrl(built)
    expect(parsed.to).toBe(ADDR)
    expect(parsed.amount).toBe('12')
    expect(parsed.note).toBe('Coffee + croissant')
    expect(parsed.merchantName).toBe("Carla's Coffee")
    expect(parsed.items).toEqual([
      { id: 'p1', qty: 2 },
      { id: 'p2', qty: 1 },
    ])
  })
})
