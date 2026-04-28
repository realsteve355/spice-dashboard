/**
 * SPICE economic + protocol constants shared across all clients.
 * Single source of truth — change here, both apps follow.
 */

/** Monthly UBI per citizen (Mars: fixed 1,000 S). */
export const UBI_AMOUNT_S = 1000

/** Citizen S→V conversion cap per epoch (Mars only — Earth uncapped). */
export const V_CAP_PER_EPOCH = 200

/** Harberger stewardship fee — basis points per epoch of declared V value. */
export const STEWARDSHIP_BPS = 50  // 0.5%

/** MCC office-term equity allotment per role (basis points). */
export const ROLE_EQUITY_BPS = {
  ceo: 4000,
  cfo: 3000,
  coo: 3000,
}

/** A-token registration threshold — any one of these triggers required registration. */
export const ASSET_THRESHOLD = {
  valueS:   500,
  weightKg: 50,
}

/** Recall trigger: % above 12-month rolling avg that triggers an automatic referendum. */
export const RECALL_THRESHOLD_PCT = 120

/** Default protocol fee split: percentage to founder, remainder to protocol treasury. */
export const FOUNDER_SHARE_BPS_DEFAULT = 2500  // 25%

/** Bread basket — Ohio reference price used by Fisc rate calc. */
export const OHIO_BREAD_REF_USD = 2.80
