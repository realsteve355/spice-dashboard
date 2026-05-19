// variants/earth/pages/Guardian.jsx
// Earth Guardian — placeholder. The V-pool-for-minors flow does not apply
// on Earth (no V-tokens). Earth guardianship uses external legal
// structures (custodial accounts, trusts, lawyers) — outside the colony.
import { useParams } from 'react-router-dom'
import Layout from '../../../components/Layout'
import { useWallet } from '../../../App'
import { C } from '../../../theme'

export default function Guardian() {
  const { slug } = useParams()
  const { isCitizenOf } = useWallet()
  const isCitizen = isCitizenOf(slug)

  if (!isCitizen) return (
    <Layout title="Guardianship" back={`/colony/${slug}/profile`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        You are not a citizen of this colony.
      </div>
    </Layout>
  )

  return (
    <Layout title="Guardianship" back={`/colony/${slug}/profile`} colonySlug={slug}>
      <div style={{ padding: '24px 16px' }}>
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>
            DEPENDANTS
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 12 }}>
            Earth colonies do not run an in-protocol dependant-savings flow.
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7 }}>
            For minors, families on Earth use external structures — custodial
            bank accounts, trusts, or lawyer-administered estates — that already
            integrate with national legal systems and inheritance law. Children
            become full colony citizens at 18 by signing the constitution
            themselves; no V-token pool is accumulated on their behalf inside
            the colony.
          </div>
          <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginTop: 12 }}>
            See <span style={{ color: C.sub }}>docs/SPICE-Economy.md §3</span> for
            the Earth-colony savings architecture.
          </div>
        </div>
      </div>
    </Layout>
  )
}

const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 0, padding: 20, marginBottom: 10 }
