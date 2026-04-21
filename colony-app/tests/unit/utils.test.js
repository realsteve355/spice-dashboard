/**
 * utils.test.js — unit tests for pure utility functions
 *
 * These tests run in jsdom (no network, no wallet).
 * They verify the helper functions used throughout the UI.
 */

import { describe, it, expect } from 'vitest'
import { shortAddr, namedAddr } from '../../src/utils/addrLabel.js'

const ADDR = '0xAbCd1234567890abcdef1234567890AbCd123456'

describe('shortAddr', () => {
  it('formats a full address to short form', () => {
    expect(shortAddr(ADDR)).toBe('0xAbCd…3456')
  })

  it('returns em-dash for null', () => {
    expect(shortAddr(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(shortAddr(undefined)).toBe('—')
  })
})

describe('namedAddr', () => {
  it('appends name when present in map', () => {
    const map = { [ADDR.toLowerCase()]: 'Steve' }
    expect(namedAddr(ADDR, map)).toBe('0xAbCd…3456 · Steve')
  })

  it('falls back to shortAddr when name not in map', () => {
    expect(namedAddr(ADDR, {})).toBe('0xAbCd…3456')
  })

  it('falls back to shortAddr when map is null', () => {
    expect(namedAddr(ADDR, null)).toBe('0xAbCd…3456')
  })

  it('returns em-dash for null address', () => {
    expect(namedAddr(null, {})).toBe('—')
  })
})
