/**
 * spice-shared — code shared between colony-app (web) and colony-app-native (mobile).
 *
 * Import patterns:
 *   import { CONTRACTS, RPC, CHAIN_ID } from '../../packages/spice-shared/addresses.js'
 *   import { UBI_AMOUNT_S, STEWARDSHIP_BPS } from '../../packages/spice-shared/constants.js'
 *   import { shortAddr, namedAddr } from '../../packages/spice-shared/addrLabel.js'
 *   import { OHIO_BREAD_REF, computeDerived } from '../../packages/spice-shared/budgetMath.js'
 *
 * Or via the barrel:
 *   import { CONTRACTS, UBI_AMOUNT_S, shortAddr, computeDerived } from '../../packages/spice-shared'
 *
 * No npm workspace setup required — pure relative imports work in Vite, Metro,
 * Hardhat, and node. The path looks ugly but the dependency graph is explicit.
 */
export * from './addresses.js'
export * from './constants.js'
export * from './addrLabel.js'
export * from './budgetMath.js'
