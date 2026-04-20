import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import EntityImage from '../components/EntityImage'
import { useWallet } from '../App'
import { C } from '../theme'

export default function Profile() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { address, disconnect, isCitizenOf, onChain } = useWallet()

  const isCitizen = isCitizenOf(slug)
  const chain     = onChain?.[slug]

  if (!isCitizen) return (
    <Layout title="Profile" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: 32, textAlign: 'center', color: C.faint, fontSize: 12 }}>
        You are not a citizen of this colony.
      </div>
    </Layout>
  )

  // Voting eligibility (mirrors Governance._isEligibleVoter logic)
  const currentYear = new Date().getFullYear()
  const dob         = chain?.dateOfBirth || 0
  const age         = dob > 0 ? currentYear - dob : null
  const ageOk       = age !== null && age >= 18
  const eligible    = ageOk  // per-election entryism check is contract-side

  const joinedAt = chain?.joinedAt || 0
  const joinedDate = joinedAt > 0
    ? new Date(joinedAt * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <Layout title="My Profile" back={`/colony/${slug}/dashboard`} colonySlug={slug}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Identity */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 14 }}>IDENTITY</div>

          {/* Profile photo — centred, editable */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <EntityImage
              colony={slug}
              entityType="citizen"
              entityId={address?.toLowerCase()}
              editable
              size={80}
              label={chain?.citizenName ? chain.citizenName.slice(0, 2).toUpperCase() : undefined}
            />
          </div>

          <Row label="Colony"      value={chain?.colonyName || slug} />
          <Div />
          <Row label="Name"        value={chain?.citizenName || '—'} />
          <Div />
          <Row label="Birth year"  value={dob > 0 ? String(dob) : '—'} />
          <Div />
          <Row label="Age"         value={age !== null ? `${age} years` : '—'} color={ageOk ? C.green : C.red} />
          <Div />
          <Row label="Member since" value={joinedDate} />
          <Div />
          <Row label="Wallet"      value={address || '—'} mono />
          <Div />
          <Row label="G-token"
            value={chain?.gTokenId > 0 ? `#${String(chain.gTokenId).padStart(4, '0')}` : '—'}
            color={C.purple}
          />
        </div>

        {/* Balances */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>BALANCES</div>
          <Row label="S balance" value={chain ? `${chain.sBalance.toLocaleString()} S` : '—'} color={C.gold} />
          <Div />
          <Row label="V balance" value={chain ? `${chain.vBalance.toLocaleString()} V` : '—'} color={C.green} />
        </div>

        {/* Voting status */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>VOTING STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              fontSize: 11,
              color: eligible ? C.green : C.red,
              border: `1px solid ${eligible ? C.green : C.red}`,
              borderRadius: 4, padding: '3px 8px', letterSpacing: '0.08em',
            }}>
              {eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
            </span>
          </div>
          {!ageOk && dob > 0 && (
            <div style={{ fontSize: 11, color: C.red, lineHeight: 1.6 }}>
              Age requirement: must be 18 or older. Birth year recorded as {dob}.
            </div>
          )}
          {!ageOk && dob === 0 && (
            <div style={{ fontSize: 11, color: C.red, lineHeight: 1.6 }}>
              No date of birth on record.
            </div>
          )}
          {ageOk && (
            <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
              Eligible to vote in elections that were open before you joined.
              Elections proposed after you joined require no waiting period — the
              anti-entryism check is per-election.
            </div>
          )}
        </div>

        {/* Inheritance — not yet on-chain */}
        <div style={card}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>INHERITANCE</div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
            On-chain inheritance designation — partner, offspring, and custom designations — coming in a future release.
          </div>
          <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6, marginTop: 8 }}>
            Default order when not set: registered partner → equal split among offspring → Fisc pool.
          </div>
        </div>

        {/* Dependants */}
        <div
          onClick={() => navigate(`/colony/${slug}/guardian`)}
          style={{ ...card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 2 }}>Dependants</div>
            <div style={{ fontSize: 11, color: C.faint }}>Manage child wallets and savings</div>
          </div>
          <span style={{ fontSize: 18, color: C.faint }}>›</span>
        </div>

        {/* Wallet */}
        <div style={{ ...card, borderColor: '#fee2e2' }}>
          <div style={{ fontSize: 11, color: C.red, letterSpacing: '0.1em', marginBottom: 12 }}>WALLET</div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, lineHeight: 1.6 }}>
            Disconnecting your wallet does not affect your colony membership,
            token balances, or G-token. Your registration remains on the Fisc blockchain.
          </div>
          <button
            onClick={() => { disconnect(); navigate('/') }}
            style={{
              width: '100%', padding: '11px', background: 'none',
              border: `1px solid ${C.red}`, borderRadius: 8,
              color: C.red, fontSize: 12, cursor: 'pointer',
            }}
          >
            Disconnect wallet
          </button>
        </div>

      </div>
    </Layout>
  )
}

function Row({ label, value, color, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: C.sub }}>{label}</span>
      <span style={{
        fontSize: mono ? 11 : 12,
        color: color || C.text,
        fontFamily: mono ? 'monospace' : 'inherit',
        maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}

function Div() {
  return <div style={{ borderBottom: `1px solid ${C.border}`, margin: '8px 0' }} />
}

const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 10 }
