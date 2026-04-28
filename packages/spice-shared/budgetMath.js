/**
 * Pure math for the Standard Citizen Budget.
 * Extracted to packages/ so both web and native can derive Fisc rate /
 * UBI / consistency flags from the same logic.
 *
 * NB: this module re-exports from colony-app's existing budgetMath.js to
 * avoid duplication. The canonical source remains in colony-app/src/utils/
 * for now; once both apps use this path it can be moved here outright.
 */
export { OHIO_BREAD_REF, computeDerived } from '../../colony-app/src/utils/budgetMath.js'
