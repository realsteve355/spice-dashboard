import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ── Design tokens ─────────────────────────────────────────────────────────────
const F    = "'IBM Plex Mono', monospace"
const BG0  = "#06070a"
const BG1  = "#0d0f12"
const BG2  = "#11141a"
const BG3  = "#0d1828"
const BD   = "1px solid #232831"
const T1   = "#ede5d4"
const T2   = "#b8b0a0"
const T3   = "#8a8170"
const GOLD = "#c8a96e"
const RED  = "#ef4444"
const GRN  = "#3dffa0"
const BLU  = "#4488ff"
const ORG  = "#f97316"

// ── S supply model ────────────────────────────────────────────────────────────
//
// Bellefontaine calibration: 10,900 adults
// UBI basket: 5 S/day = 150 S/month per adult
// Monthly UBI mint: 10,900 × 150 × 1.2 = 1,962,000 S (incl. 20% company float)
// Purchase scheme: dollar buyers convert at prevailing rate, Fisc buys BTC
//   Modelled as: 500,000 S month 1, growing 25%/month as dollar weakens
// House threshold: $200,000 house at $0.75/S = 266,667 S (purchase-scheme funded)

const ADULTS        = 10900
const UBI_PER_ADULT = 150          // S/month
const FLOAT         = 0.20         // 20% company working capital overage
const MONTHLY_UBI   = Math.round(ADULTS * UBI_PER_ADULT * (1 + FLOAT))  // 1,962,000

const HOUSE_S       = Math.round(200000 / 0.75)   // 266,667 S — first house threshold

function buildSupplyData() {
  const rows = []
  let ubiOnly   = 0
  let withPurch = 0
  let purchMonthly = 500000   // S purchased month 1

  for (let m = 1; m <= 36; m++) {
    ubiOnly   += MONTHLY_UBI
    withPurch += MONTHLY_UBI + Math.round(purchMonthly)
    rows.push({
      month:    m,
      ubiOnly:  Math.round(ubiOnly / 1e6 * 10) / 10,
      withPurch: Math.round(withPurch / 1e6 * 10) / 10,
      houseM:   Math.round(HOUSE_S / 1e6 * 100) / 100,
    })
    purchMonthly = Math.round(purchMonthly * 1.25)
  }
  return rows
}

const SUPPLY_DATA = buildSupplyData()
const CH = 240

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ children, alt }) {
  return (
    <section style={{ background: alt ? BG1 : BG0, borderBottom: BD, padding: '48px 40px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 16, borderBottom: BD, paddingBottom: 10 }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: T1, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function Note({ color, children }) {
  return (
    <div style={{ background: BG3, border: BD, borderLeft: `3px solid ${color || GOLD}`, padding: '14px 18px', marginTop: 16 }}>
      <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}

function SupplyChart() {
  const TooltipEl = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: BG1, border: BD, padding: '10px 14px', fontFamily: F, fontSize: 11 }}>
        <div style={{ color: T3, marginBottom: 6 }}>Month {label}</div>
        {payload.map(p => p.value != null && (
          <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 2 }}>
            {p.name}: {p.value}M S
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ height: CH }}>
      <ResponsiveContainer width="100%" height={CH}>
        <LineChart data={SUPPLY_DATA} margin={{ top: 20, right: 20, bottom: 20, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232831" />
          <XAxis
            dataKey="month"
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Month', position: 'insideBottom', offset: -8, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            ticks={[6, 12, 18, 24, 30, 36]}
          />
          <YAxis
            tick={{ fontFamily: F, fontSize: 9, fill: T3 }}
            label={{ value: 'Total S supply (millions)', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: F, fontSize: 9, fill: T3 } }}
            ticks={[20, 40, 60, 80, 100]}
            domain={[0, 100]}
          />
          <Tooltip content={<TooltipEl />} />
          <ReferenceLine
            y={Math.round(HOUSE_S / 1e6 * 100) / 100}
            stroke={GOLD}
            strokeDasharray="4 2"
            label={{ value: `${Math.round(HOUSE_S / 1000)}K S — first house possible`, position: 'insideTopRight', style: { fontFamily: F, fontSize: 9, fill: GOLD } }}
          />
          <Line dataKey="ubiOnly"   stroke={BLU} strokeWidth={2} dot={false} isAnimationActive={false} name="UBI minting only" />
          <Line dataKey="withPurch" stroke={GRN} strokeWidth={2} dot={false} isAnimationActive={false} name="UBI + purchase scheme" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Abundance() {
  return (
    <div style={{ background: BG0, minHeight: '100vh', fontFamily: F }}>

      {/* ── Hero ── */}
      <section style={{ background: BG1, borderBottom: BD, padding: '60px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 20, borderBottom: BD, paddingBottom: 10 }}>
            SPICE Protocol · Monetary Model · The Post-Collision Economy
          </div>
          <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: T1, margin: '0 0 20px 0', lineHeight: 1.2 }}>
            The Abundance Model
          </h1>
          <p style={{ fontFamily: F, fontSize: 13, color: T2, lineHeight: 1.9, margin: '0 0 16px 0', maxWidth: 700 }}>
            When automation eliminates the labour market, the existing monetary system
            collapses — not because of a policy failure, but because the feedback loop
            that sustains it breaks. No wages → no spending → no revenue → no tax →
            no welfare → no wages. The loop terminates.
          </p>
          <p style={{ fontFamily: F, fontSize: 13, color: T2, lineHeight: 1.9, margin: 0, maxWidth: 700 }}>
            The SPICE response is not a patch on the existing system. It is a replacement:
            a new monetary circuit built from the automation dividend, issued as S-tokens,
            anchored to the bread basket, and backed — where needed — by hard assets.
          </p>
        </div>
      </section>

      {/* ── The collapse cascade ── */}
      <Section>
        <SectionLabel>The problem · Why the existing system cannot survive</SectionLabel>
        <SectionTitle>The circular collapse</SectionTitle>
        <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 28px 0' }}>
          The modern economy is a closed loop. Automation breaks it at the first link.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { n: '01', label: 'Automation eliminates labour',       desc: 'AI and robotics replace workers across manufacturing, logistics, services. The market for human labour shrinks to a residual.',                                               color: RED  },
            { n: '02', label: 'Citizens have no income',            desc: 'Wages were the primary income source for 90% of households. Without wages, purchasing power collapses regardless of how cheap goods become.',                                    color: RED  },
            { n: '03', label: 'Businesses receive no revenue',      desc: 'Companies automated their costs away — but their customers were their workers. No wages → no spending → no revenue. The automation dividend has no one to flow to.',             color: RED  },
            { n: '04', label: 'Tax revenues collapse',              desc: 'Income tax, payroll tax, and consumption tax all depend on wages and spending. As these fall, the government\'s funding base evaporates.',                                         color: RED  },
            { n: '05', label: 'Welfare and debt service both fail', desc: 'With no tax revenue, the government cannot fund social security, unemployment, or interest on sovereign debt. Collapse is not a policy choice — it is arithmetic.',              color: RED  },
          ].map(({ n, label, desc, color }) => (
            <div key={n} style={{ display: 'flex', gap: 0, background: BG2, border: BD, borderLeft: `3px solid ${color}` }}>
              <div style={{ fontFamily: F, fontSize: 11, color, padding: '16px 20px', minWidth: 40, borderRight: BD }}>{n}</div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontFamily: F, fontSize: 11, color: T1, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <Note color={RED}>
          This is not a recession or a depression — it is a structural termination.
          Previous technological revolutions created new jobs to replace displaced ones.
          The post-Collision scenario assumes this does not happen — that AI and robotics
          are general enough to fill new roles as fast as they appear.
          The question is not how to prevent it. It is what replaces the loop.
        </Note>
      </Section>

      {/* ── The reset ── */}
      <Section alt>
        <SectionLabel>The solution · Citizens print the money</SectionLabel>
        <SectionTitle>S-tokens: sovereign money issued as UBI</SectionTitle>
        <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
          If wages cannot fund the economy, the colony mints the medium of exchange directly.
          S-tokens are issued monthly as universal basic income — not as debt, not as a loan,
          not backed by a promise to repay. They are sovereign money: created by the colony's
          monetary authority (the MCC) and distributed by the Fisc.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            {
              label: 'Monthly mint formula',
              eq: 'S_mint = N × basket_S × 1.20',
              note: `For ${ADULTS.toLocaleString()} adults: ${MONTHLY_UBI.toLocaleString()} S/month. Each adult receives 150 S (5 S/day). The 20% overage is working capital for companies to buy inputs — flour, materials, energy — keeping the supply chain moving.`,
            },
            {
              label: 'Why 20% overage',
              eq: 'S_company = S_mint × 0.20 / N_companies',
              note: 'Without the float, the economy is a perfectly closed loop — citizens spend, companies receive, but companies cannot restock inputs. The 20% provides working capital. It is not profit — companies spend it on materials and it re-enters circulation.',
            },
            {
              label: 'No fractional reserve',
              eq: 'Loans = 0  →  Money multiplier = 1',
              note: 'S has no banking system that multiplies the supply via loans. A loan would create an asset (receivable) and a liability (deposit) that cancel each other — economically identical to printing. S is printed directly, transparently.',
            },
            {
              label: 'Basket anchor',
              eq: 'r(t) = basket_USD(t) / 5',
              note: 'The Fisc rate ($/S) is set so the daily bread basket always costs 5 S. As automation drives goods prices down, the Fisc rate falls — but the basket stays at 5 S. Citizens experience stability, not deflation.',
            },
          ].map(({ label, eq, note }) => (
            <div key={label} style={{ background: BG2, border: BD, padding: '18px 20px' }}>
              <div style={{ fontFamily: F, fontSize: 9, color: T3, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>{label}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: GOLD, background: BG0, padding: '8px 12px', marginBottom: 10, borderLeft: `2px solid ${GOLD}` }}>
                {eq}
              </div>
              <div style={{ fontFamily: F, fontSize: 10, color: T2, lineHeight: 1.7 }}>{note}</div>
            </div>
          ))}
        </div>

        <Note color={GRN}>
          <span style={{ color: GRN }}>Why mild inflation is a feature:</span>
          {' '}The monthly mint grows the S supply, creating predictable mild inflation.
          This discourages hoarding — holding S means gradual dilution, so citizens spend.
          Bitcoin's fixed supply creates the opposite: rational actors hoard, velocity
          collapses, and it becomes a store of value rather than a currency. SPICE avoids
          this by design. The inflation rate is public, fixed by formula, and falls over
          time as the denominator grows.
        </Note>
      </Section>

      {/* ── Two kinds of S ── */}
      <Section>
        <SectionLabel>Two kinds of S · M1 and M2 without a policy decision</SectionLabel>
        <SectionTitle>UBI-minted S vs purchase-minted S</SectionTitle>
        <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
          S tokens from two sources circulate in the same economy but serve different functions —
          not by rule, but because of who creates them and why.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {[
            {
              label: 'M1 — UBI-minted S',
              color: BLU,
              rows: [
                ['Origin',       'Minted ex nihilo by MCC'],
                ['Backing',      'None — sovereign money'],
                ['Inflation',    'Yes — the only source of S inflation'],
                ['Typical size', 'Grocery-scale (150 S/month per adult)'],
                ['Velocity',     'High — spent quickly on daily needs'],
                ['Use',          'Food, services, local transactions'],
              ],
            },
            {
              label: 'M2 — Purchase-minted S',
              color: GRN,
              rows: [
                ['Origin',       'Minted when dollars are brought to the Fisc'],
                ['Backing',      'BTC / gold — fully backed, held in reserve'],
                ['Inflation',    'None — each S issued has a hard asset behind it'],
                ['Typical size', 'Asset-scale ($200K house = 266,667 S)'],
                ['Velocity',     'Low — used for one-off asset transactions'],
                ['Use',          'Property, businesses, large commercial deals'],
              ],
            },
          ].map(({ label, color, rows }) => (
            <div key={label} style={{ background: BG2, border: BD, borderTop: `3px solid ${color}`, padding: '20px' }}>
              <div style={{ fontFamily: F, fontSize: 11, color, fontWeight: 600, marginBottom: 16 }}>{label}</div>
              {rows.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                  <span style={{ fontFamily: F, fontSize: 10, color: T3, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontFamily: F, fontSize: 10, color: T1, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Supply chart */}
        <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, marginBottom: 20 }}>
          The purchase scheme solves the liquidity problem. UBI minting alone takes years to
          reach the scale needed for large asset transactions. Dollar buyers who believe the
          Collision is coming convert early — at better rates — and provide the liquidity
          that makes the S economy viable faster. At ${(HOUSE_S / 1000).toFixed(0)}K S,
          the first house can change hands entirely in S.
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { color: BLU, label: 'UBI minting only — linear growth, thin for large transactions' },
            { color: GRN, label: 'UBI + purchase scheme — accelerates as dollar weakens and adoption grows' },
            { color: GOLD, label: `Dashed: ${(HOUSE_S / 1000).toFixed(0)}K S threshold — first house purchase possible` },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 2, background: color }} />
              <span style={{ fontFamily: F, fontSize: 9, color: T3 }}>{label}</span>
            </div>
          ))}
        </div>
        <SupplyChart />

        <Note color={BLU}>
          <span style={{ color: BLU }}>The segmentation is self-organising.</span>
          {' '}No policy distinguishes M1 from M2 — the tokens are identical and fungible.
          The segmentation emerges from behaviour: someone converting $200,000 to S is not
          doing it to buy groceries. They are acquiring an asset or entering a large commercial
          transaction. The S supply naturally stratifies by transaction size.
        </Note>
      </Section>

      {/* ── Fisc reserve ── */}
      <Section alt>
        <SectionLabel>The Fisc reserve · Why dollars must become BTC immediately</SectionLabel>
        <SectionTitle>The colony holds hard assets, not dollar promises</SectionTitle>
        <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
          When a citizen brings dollars to the Fisc to purchase S, the Fisc does not hold
          those dollars. It converts them to BTC or gold immediately. The reason is simple:
          the entire premise is that the dollar is collapsing. Holding dollars in reserve
          would mean the backing for purchase-minted S is evaporating alongside the dollar —
          defeating the purpose entirely.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {[
            { step: '→', text: 'Citizen brings $200,000 to the Fisc', color: T2 },
            { step: '→', text: 'Fisc mints 266,667 S at current rate ($0.75/S)', color: BLU },
            { step: '→', text: 'Fisc immediately purchases $200,000 of BTC', color: GOLD },
            { step: '→', text: 'As dollar collapses, BTC reserve appreciates in dollar terms', color: GRN },
            { step: '→', text: 'Fisc rate adjusts — the reserve buys more baskets as dollar weakens', color: GRN },
          ].map(({ step, text, color }, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', background: BG2, border: BD, padding: '12px 20px' }}>
              <span style={{ fontFamily: F, fontSize: 13, color: GOLD }}>{step}</span>
              <span style={{ fontFamily: F, fontSize: 11, color }}>{text}</span>
            </div>
          ))}
        </div>
        <Note color={GOLD}>
          This is the original SPICE thesis — BTC as a hedge against dollar debasement —
          now living inside the colony as the Fisc reserve rather than as an external
          investment fund. The pre-Collision hedge becomes the post-Collision foundation.
          Citizens who held BTC before the Collision find they are already holding the
          reserve asset of the new system.
        </Note>
      </Section>

      {/* ── Who wins, who loses ── */}
      <Section>
        <SectionLabel>The transition · Who benefits, who does not</SectionLabel>
        <SectionTitle>The Collision is the largest involuntary wealth redistribution in history</SectionTitle>
        <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
          There is no clean re-denomination. No single conversion date. No government decree.
          Assets migrate to S organically — and who fares well depends entirely on what form
          their wealth takes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              label: 'Debtors — mortgages, student loans, car finance',
              outcome: 'Win',
              color: GRN,
              desc: 'Dollar liabilities inflate away as the dollar collapses. A $200,000 mortgage becomes trivial in real terms without any policy decision. The Collision is the largest debt jubilee in history — involuntary and unannounced.',
            },
            {
              label: 'Hard asset holders — land, property, gold, BTC',
              outcome: 'Survive',
              color: GOLD,
              desc: 'Physical assets retain real value. Dollar-denominated liabilities against them inflate away. Landowners who also carried debt double-win. BTC holders find themselves holding the reserve asset of the new monetary system.',
            },
            {
              label: 'Financial asset holders — pensions, bonds, savings accounts',
              outcome: 'Lose',
              color: RED,
              desc: 'These are dollar promises. The promise is kept in nominal terms and worthless in real terms. This is the political catastrophe: pensioners, insurance companies, and bond holders are wiped out regardless of whether they did anything wrong.',
            },
            {
              label: 'Wage earners — the majority',
              outcome: 'Hard zone',
              color: ORG,
              desc: 'Income disappears before UBI is large enough to replace it. This is the transition period of maximum stress. The colony must be running before wages collapse — UBI must be flowing before the income source it replaces disappears. Timing is everything.',
            },
          ].map(({ label, outcome, color, desc }) => (
            <div key={label} style={{ background: BG2, border: BD, borderLeft: `3px solid ${color}`, display: 'grid', gridTemplateColumns: '1fr 80px', gap: 0 }}>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontFamily: F, fontSize: 11, color: T1, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.7 }}>{desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: BD }}>
                <span style={{ fontFamily: F, fontSize: 10, color, fontWeight: 700, textAlign: 'center', padding: 8 }}>{outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Valuation service ── */}
      <Section alt>
        <SectionLabel>The Fisc valuation service · Bringing assets on-chain</SectionLabel>
        <SectionTitle>Assets and liabilities denominated in S, recorded on-chain</SectionTitle>
        <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
          The Fisc offers a denomination service: bring any asset or liability, and the Fisc
          converts its current dollar market value to S at the prevailing rate and records
          the result on-chain. The valuation floats — it updates as the dollar price and
          Fisc rate change — but the asset is now inside the S ecosystem: tradeable,
          usable as collateral, visible on the colony ledger.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            {
              label: 'Asset valuation',
              color: GRN,
              items: [
                'Bring market dollar price (self-reported or market evidence)',
                'Fisc converts at current rate: S_value = $price / r(t)',
                'On-chain record created: asset ID, S value, timestamp, rate used',
                'Asset now denominated in S — can be sold, transferred, or collateralised in S',
                'S value floats: updates daily with dollar price and Fisc rate',
              ],
            },
            {
              label: 'Liability valuation',
              color: ORG,
              items: [
                'Creditors want S valuation — protects real value of the claim',
                'Debtors do not — dollar debt inflates away, S debt does not',
                'Standoff: resolved by original contract terms or negotiation',
                'No forced conversion — voluntary on both sides',
                'Illiquid assets (family business): list for sale in $ or S, market decides price',
              ],
            },
          ].map(({ label, color, items }) => (
            <div key={label} style={{ background: BG2, border: BD, borderTop: `3px solid ${color}`, padding: '20px' }}>
              <div style={{ fontFamily: F, fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 14 }}>{label}</div>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: T3, flexShrink: 0 }}>·</span>
                  <span style={{ fontFamily: F, fontSize: 10, color: T2, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Note color={T2}>
          The valuation service is a denomination service, not a hedge. It does not lock in value —
          it converts the dollar price into S units at today's rate. Its purpose is to bring
          assets into the S economy so they can participate in S transactions. The incentive
          to use it is adoption, not protection: once your house is on-chain in S, you can sell
          it for S without needing a dollar buyer.
        </Note>
      </Section>

      {/* ── The flipping point ── */}
      <Section>
        <SectionLabel>The flipping point · When S becomes the reference currency</SectionLabel>
        <SectionTitle>Pre-flip and post-flip are fundamentally different economies</SectionTitle>
        <p style={{ fontFamily: F, fontSize: 11, color: T2, lineHeight: 1.8, margin: '0 0 24px 0' }}>
          Today, people quote prices in dollars and express them in S. At some point,
          the reference inverts: prices are quoted in S and the dollar figure becomes
          the derived number — if it is referenced at all.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            {
              label: 'Pre-flip',
              color: ORG,
              rows: [
                ['Unit of account',   'Dollar'],
                ['S value',           'Derived (dollar price ÷ Fisc rate)'],
                ['Price discovery',   'Dollar markets'],
                ['Fisc role',         'Conversion service'],
                ['Collapse risk',     'Dollar weakness erodes confidence in pricing'],
              ],
            },
            {
              label: 'Post-flip',
              color: GRN,
              rows: [
                ['Unit of account',   'S-token'],
                ['Dollar value',      'Irrelevant or unavailable'],
                ['Price discovery',   'S markets inside the colony'],
                ['Fisc role',         'Monetary authority (rate is internal)'],
                ['Collapse risk',     'Isolated from dollar entirely'],
              ],
            },
          ].map(({ label, color, rows }) => (
            <div key={label} style={{ background: BG2, border: BD, borderTop: `3px solid ${color}`, padding: '20px' }}>
              <div style={{ fontFamily: F, fontSize: 11, color, fontWeight: 600, marginBottom: 16 }}>{label}</div>
              {rows.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                  <span style={{ fontFamily: F, fontSize: 10, color: T3, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontFamily: F, fontSize: 10, color: T1, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Note color={GOLD}>
          The flip is not decreed. It happens when enough assets are on-chain in S that
          buyers and sellers naturally quote in S — because that is where the liquidity is.
          The Fisc valuation service and the purchase scheme are the mechanisms that
          accelerate it. Every asset denominated in S is one more data point where S is
          the reference. The flip is a network effect, not a policy event.
        </Note>

        {/* Bootstrap sequence */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: T3, marginBottom: 16 }}>
            The bootstrap sequence
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { phase: 'Pre-launch',    color: T3,   desc: 'Colony planned. Early believers hold BTC as pre-Collision hedge.' },
              { phase: 'Colony opens',  color: BLU,  desc: 'UBI minting begins. S supply is thin. Purchase scheme opens — dollar buyers convert. Fisc buys BTC with proceeds.' },
              { phase: 'Priming',       color: BLU,  desc: 'Purchase-minted S grows the supply faster than UBI alone. Fisc reserve accumulates BTC. First large S transactions become possible.' },
              { phase: 'Hard zone',     color: ORG,  desc: 'Dollar weakens. Wages collapse. Federal welfare fails. UBI is the primary income for displaced workers. Colony must already be running.' },
              { phase: 'Flip',          color: GOLD, desc: 'Enough S liquidity that assets are quoted in S. Dollar price becomes derived. Colony economy is self-referential.' },
              { phase: 'Post-Collision',color: GRN,  desc: 'Dollar irrelevant internally. Fisc rate is a historical artefact. External trade (inter-colony) uses BTC. Internal economy is fully S.' },
            ].map(({ phase, color, desc }) => (
              <div key={phase} style={{ display: 'flex', background: BG2, border: BD, borderLeft: `3px solid ${color}` }}>
                <div style={{ fontFamily: F, fontSize: 10, color, padding: '14px 20px', minWidth: 120, borderRight: BD, display: 'flex', alignItems: 'center' }}>
                  {phase}
                </div>
                <div style={{ fontFamily: F, fontSize: 11, color: T2, padding: '14px 20px', lineHeight: 1.7 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Navigation ── */}
      <section style={{ background: BG1, padding: '48px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: F, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: T3, marginBottom: 20 }}>Related</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { href: '/pathway',   label: 'Pathway to UBI →' },
              { href: '/fairbrook', label: 'Fairbrook circularity model →' },
              { href: '/collision', label: 'The Collision simulation →' },
            ].map(({ href, label }) => (
              <a key={href} href={href} style={{
                fontFamily: F, fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: GOLD,
                textDecoration: 'none', border: `1px solid ${GOLD}`,
                padding: '10px 20px',
              }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
