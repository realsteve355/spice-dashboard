// variants/earth/index.js
// Page registry for the Earth colony variant.
//
// Earth differs from Mars in several respects (no V-tokens, USDC reserve,
// external boundary flows, Local Robot Tax, no Harberger land valuation).
// The router (router/VariantRoute.jsx) selects from this registry when
// the colony's variant is "earth".

export { default as Dashboard } from './pages/Dashboard'
export { default as Company   } from './pages/Company'
export { default as Profile   } from './pages/Profile'
export { default as Guardian  } from './pages/Guardian'
export { default as Assets    } from './pages/Assets'
export { default as Budget    } from './pages/Budget'
