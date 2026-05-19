// VariantRoute — wraps a route element so it renders the variant-specific
// page for the current colony.
//
// Usage:
//   <Route path="/colony/:slug/dashboard"
//          element={<VariantRoute page="Dashboard" />} />
//
// The route reads the colony slug from the URL, asks useColonyVariant which
// variant the colony runs, and renders the corresponding page from
// variants/{variant}/index.js. If the variant doesn't export the page, it
// falls back to the Mars registry — Mars is the legacy default.
//
// This is the ONLY place the app asks "which variant?" — every page below
// this point is variant-pure.

import { useParams } from 'react-router-dom'
import { useColonyVariant } from '../hooks/useColonyVariant'
import * as Earth from '../variants/earth'
import * as Mars  from '../variants/mars'

const REGISTRY = { earth: Earth, mars: Mars }

export default function VariantRoute({ page }) {
  const { slug } = useParams()
  const variant = useColonyVariant(slug)
  const Page = REGISTRY[variant]?.[page] ?? REGISTRY.mars[page]
  if (!Page) {
    return (
      <div style={{ padding: 24, color: '#ef4444' }}>
        VariantRoute: no page "{page}" registered for variant "{variant}"
      </div>
    )
  }
  return <Page />
}
