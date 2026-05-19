// variants/mars/index.js
// Page registry for the Mars colony variant.
//
// Mars is the original full-stack colony: V-tokens for savings, Harberger
// land valuation, no external currency reserve, closed economy. The
// router (router/VariantRoute.jsx) selects from this registry when the
// colony's variant is "mars".

export { default as Dashboard } from './pages/Dashboard'
export { default as Company   } from './pages/Company'
export { default as Profile   } from './pages/Profile'
export { default as Guardian  } from './pages/Guardian'
export { default as Assets    } from './pages/Assets'
export { default as Budget    } from './pages/Budget'
