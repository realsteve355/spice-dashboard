// useColonyVariant — single source of truth for which variant a colony runs.
//
// The colony "variant" determines which feature set is active (V-tokens,
// Harberger, USDC reserve, etc.). Different variants are different products —
// the code is split per variant in colony-app/src/variants/{name}/.
//
// Source of truth (today): localStorage['spice_user_colonies'][slug].colonyType
// Source of truth (planned): on-chain Colony.variant() view — when the
// contract gets a variant() method, swap the read here. Consumers don't
// change.
//
// Returns one of: 'earth' | 'mars'. Defaults to 'mars' for any colony that
// pre-dates the variant field (legacy colonies created before 23 Apr 2026).

const LEGACY_DEFAULT = 'mars'
const KNOWN_VARIANTS = new Set(['earth', 'mars'])

export function useColonyVariant(slug) {
  if (!slug) return LEGACY_DEFAULT
  try {
    const raw = localStorage.getItem('spice_user_colonies')
    if (!raw) return LEGACY_DEFAULT
    const colonies = JSON.parse(raw)
    const t = colonies?.[slug]?.colonyType
    return KNOWN_VARIANTS.has(t) ? t : LEGACY_DEFAULT
  } catch {
    return LEGACY_DEFAULT
  }
}
