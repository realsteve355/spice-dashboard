import './Mars.css'
import { Link } from 'react-router-dom'

const COLONY_DASHBOARD_URL = '/mars/dashboard'

const PROOF_POINTS = [
  'Population stabilises using an Earth-realistic age distribution — births replace deaths across all age groups over 200 simulated years.',
  'MCC infrastructure remains solvent when citizen bills are kept near 20% of UBI, with the board accountable through annual elections.',
  'Equity dividends grow over time as the cooperative economy matures — contributors become owners, receiving V-token dividends monthly.',
  'V-token savings accumulate at the median citizen level without dangerous concentration — the Gini coefficient stays within bounds.',
  'The company ecosystem sustains 10–20 active cottage industries throughout the simulation, providing genuine market diversity.',
]

const CARDS = [
  {
    symbol: 'S → V',
    title: 'Two-token currency',
    body: 'S-tokens are issued monthly as UBI and expire at month end — driving velocity with no inflation. V-tokens are permanent savings, earned through equity dividends and converted from UBI surplus.'
  },
  {
    symbol: '⬡',
    title: 'Worker-owned enterprise',
    body: 'Every company distributes monthly V-token dividends to equity holders. Contributors are owners — the John Lewis cooperative model applied to a post-AI economy where robots do the capital-intensive work.'
  },
  {
    symbol: '◈',
    title: 'Citizen-owned infrastructure',
    body: 'The Mars Colony Company provides life support, power, water, and justice. Every citizen holds one equal non-transferable share. The board is elected annually and held accountable through transparent blockchain governance.'
  },
]

export default function Mars() {
  return (
    <div className="mars-page">
      <div className="mars-container">

        {/* ── Act ribbon ── */}
        <div className="mars-act-ribbon">
          <span className="mars-act-ribbon-item">Act I — The Collision</span>
          <span className="mars-act-ribbon-divider">→</span>
          <span className="mars-act-ribbon-item active">Act II — The Solution</span>
          <span className="mars-act-ribbon-divider">→</span>
          <span className="mars-act-ribbon-item">Act III — The Blueprint</span>
          <span className="mars-act-ribbon-divider">→</span>
          <span className="mars-act-ribbon-item">Act IV — The Infrastructure</span>
        </div>

        {/* ── Hero ── */}
        <div className="mars-hero">
          <div className="mars-act-label">Act II — The Solution</div>
          <h1 className="mars-hero-title">
            The <span className="gold">Mars Colony</span> Economy
          </h1>
          <p className="mars-hero-subtitle">
            If the fiat system is structurally failing, what comes next?
            The Mars Colony is a 200-year simulation of a post-scarcity economy
            built on Universal Basic Income, cooperative enterprise, and
            citizen-owned infrastructure — running in real time.
          </p>
        </div>

        {/* ── Dome image ── */}
        <div className="mars-dome-wrap">
          <img
            className="mars-dome-img"
            src="/mars-dome.png"
            alt="Mars Colony Dome Alpha — interior cross-section view"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="mars-dome-placeholder" style={{display:'none'}}>
            [ mars-dome.jpg not found — copy image to public/mars-dome.jpg ]
          </div>
        </div>
        <div className="mars-dome-caption">
          Colony Dome Alpha — cross-section view · 16 functional zones across 6 levels
        </div>

        {/* ── Founding philosophy ── */}
        <div className="mars-philosophy">
          <div className="mars-philosophy-label">Founding Philosophy</div>
          <p>
            Due to enormous advances in AI, automation, and robotics, the Mars Colony
            exists in a post-scarcity world where basic human needs can be met at
            extremely low cost.
          </p>
          <p>
            Every citizen is provided with a universal income sufficient to pay for
            all services they use, with enough left over to lead a minimally
            fulfilling life.
          </p>
          <p>
            "Money" is still needed to drive efficiency, to manage the consumption
            of scarce resources, and to incentivise enterprise and endeavour.
          </p>
          <p>
            The floor of basic social support is guaranteed for all,
            and the opportunity ceiling is infinite.
          </p>
        </div>

        {/* ── Three cards ── */}
        <div className="mars-section-label">How it works</div>
        <div className="mars-cards">
          {CARDS.map(card => (
            <div key={card.title} className="mars-card">
              <div className="mars-card-symbol">{card.symbol}</div>
              <div className="mars-card-title">{card.title}</div>
              <div className="mars-card-body">{card.body}</div>
            </div>
          ))}
        </div>

        {/* ── What the simulation proves ── */}
        <div className="mars-section-label">What 200 years of simulation shows</div>
        <div className="mars-proofs">
          {PROOF_POINTS.map((pt, i) => (
            <div key={i} className="mars-proof-item">
              <span className="mars-proof-tick">✓</span>
              <span className="mars-proof-text">{pt}</span>
            </div>
          ))}
        </div>

        {/* ── SPICE connection ── */}
        <div className="mars-section-label">The connection to Act I</div>
        <div className="mars-connection">
          The <span className="highlight">SPICE Collision</span> model shows where
          the current fiat economy is heading — AI displacement compressing the wage
          base, sovereign debt spiralling, fiscal systems under terminal stress.
          The <span className="highlight">Mars Colony</span> model shows what a
          functioning alternative looks like. These are not unrelated. The colony
          economy is a working implementation of the post-scarcity transition the
          SPICE thesis predicts is coming. The question is not whether the transition
          will happen. The question is whether anyone is ready for it.
        </div>

        {/* ── CTA ── */}
        <div className="mars-section-label">Explore the simulation</div>
        <div className="mars-cta">
          <div>
            <Link className="mars-btn-primary" to={COLONY_DASHBOARD_URL}>
              Open Colony Dashboard →
            </Link>
            <div className="mars-btn-note">
              200-year simulation · live data
            </div>
          </div>
          <div>
            <span className="mars-btn-secondary">
              Economic Design Doc →
            </span>
            <div className="mars-btn-note">
              Coming soon
            </div>
          </div>
        </div>

        {/* ── Footer note ── */}
        <div className="mars-footer-note">
          Mars Colony Economy · Version 6 · Open Simulation · Built with Claude
        </div>

      </div>
    </div>
  )
}
