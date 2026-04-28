/**
 * Single source of truth for SPICE colony addresses on Base Sepolia.
 * Imported by both colony-app and colony-app-native via relative path
 * (no workspace setup required — works with Vite, Metro, and node).
 *
 * For new colonies, the canonical source is the on-chain ColonyRegistry.
 * This file caches the addresses for known demo colonies so the apps can
 * boot without an RPC roundtrip.
 *
 * When Dave's Colony is redeployed (or when adding a new known colony),
 * update CONTRACTS below and the change propagates to both apps.
 */

export const CHAIN_ID = 84532
export const RPC      = 'https://sepolia.base.org'

/** Protocol-level — same on every colony. */
export const COLONY_REGISTRY = '0x584248ab12c3CBEe35B1E2145B3f208Ea521eF68'

/** Per-colony addresses, keyed by slug. */
export const CONTRACTS = {
  'daves-colony': {
    name:           "Dave's Colony",
    colony:         '0x536ea5d89Fb34D7C4983De73c3A4AC894C1D3cE5',
    colonyImpl:     '0x6567024E20a2A28e4DCd86E9494f6c3AB7f1a08E',
    gToken:         '0x08318fC33f0e57a6D196D5a3cF8d443A54C41449',
    sToken:         '0x8B9B98cf05C5dC6e43C5b74320B2B858b92D6a04',
    vToken:         '0x86bC95CeD14E3fC1782393E63bc22ef142BEe433',
    oToken:         '0x6cE1bD882b7abE3664f31C558F347CDeF1E32138',
    aToken:         '0xA85EaF14E3F85007db73Fd7e153009D081FE1B01',
    companyImpl:    '0xa961B7C6C593fFf33e63FB091aD2F93e0800FfDf',
    companyBeacon:  '0x1bcacD3007AE3058575E8c35073127F1b1B5bF3C',
    companyFactory: '0x00a41D63eF6fa60e15f26Dc46d6aad8994042e1a',
    mccBilling:     '0x7Ce46f4Ea8263C9038b546e2147939ce021a9e2E',
    mccServices:    '0xBD114C69130B43eA782F63C19e6e1ECB9D5B59c7',
    governance:     '0xe2af55fe189B18678187eF48eB49b9bA8bF24534',
    fisc:           '0xbeF1Dd5f09AE72EBc0565AF72e798866e691eA57',
  },
}

/** Convenience: the default demo colony for native + scripts. */
export const DEFAULT_COLONY_SLUG = 'daves-colony'
export const DEFAULT_COLONY      = CONTRACTS[DEFAULT_COLONY_SLUG]
