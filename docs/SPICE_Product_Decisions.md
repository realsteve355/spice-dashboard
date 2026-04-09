**SPICE \[ZPC\]**

*Product Design Decisions & Working Notes*

Technology Workstream \| Version 1.0 \| February 2026 \| Confidential

**Purpose of This Document**

This document captures the key product design decisions made during the
Technology workstream working sessions, together with the rationale
behind each decision. It is intended as a living reference document ---
updated as decisions are made, revised, or superseded. It supplements
the Project Master Brief and Pitch Document.

**1. Fund Structure**

**1.1 Open-Ended Vault Structure**

  --------------- -------------------------------------------------------
  **DECISION**    **SPICE will be structured as an open-ended vault.
                  Investors deposit Bitcoin and receive ZPC tokens. ZPC
                  tokens can be redeemed at any time for the underlying
                  assets. There is no lock-up period and no fixed token
                  supply cap.**

  *Rationale*     The open-ended structure is simpler, fairer, and
                  consistent with the \'redeem any time\' promise to
                  investors. It avoids the discount/premium dynamic of
                  closed-ended funds. The vault mints ZPC on deposit and
                  burns ZPC on redemption, keeping the token price
                  anchored to NAV at all times.
  --------------- -------------------------------------------------------

> *Note: Open question: whether to introduce a closed-ended phase after
> a defined AUM milestone (e.g. \$500M), at which point minting stops
> and ZPC could trade at a premium to NAV on secondary markets. This
> would benefit founders and early holders but complicates the investor
> proposition. Deferred for now.*

**1.2 Bitcoin Denomination**

  --------------- -------------------------------------------------------
  **DECISION**    **SPICE is entirely Bitcoin-denominated. Investors
                  deposit Bitcoin, receive ZPC backed by
                  Bitcoin-denominated assets, and redeem for Bitcoin. No
                  fiat currency enters or exits the protocol at any
                  point.**

  *Rationale*     Structural consistency with the macro thesis. If the
                  thesis is correct, fiat infrastructure is itself part
                  of the problem. Building the hedge on fiat rails would
                  be contradictory. Bitcoin as the unit of account also
                  removes currency conversion complexity and keeps the
                  product outside the traditional financial system.
  --------------- -------------------------------------------------------

> *Note: Implication: investor reporting should show returns in both
> Bitcoin terms (for performance vs. holding raw BTC) and fiat
> purchasing power terms (for investor psychology). Many investors will
> instinctively anchor to GBP/USD even if they understand the Bitcoin
> denomination.*

**1.3 Blockchain Selection**

  --------------- -------------------------------------------------------
  **DECISION**    **Base (Coinbase L2) is the working assumption for the
                  vault deployment, with Ethereum mainnet as the
                  settlement layer.**

  *Rationale*     Base offers significantly lower gas costs than Ethereum
                  mainnet while inheriting Ethereum security. The DeFi
                  ecosystem required for SPICE\'s underlying positions
                  (Synthetix, PAXG, synthetic equity) is predominantly
                  Ethereum/L2 native. Base has strong institutional
                  momentum via Coinbase backing. Decision is provisional
                  --- subject to technical co-founder input.
  --------------- -------------------------------------------------------

**2. Token Mechanics**

**2.1 No Discount or Premium to NAV**

  --------------- -------------------------------------------------------
  **DECISION**    **ZPC will not trade at a discount or premium to the
                  net asset value of the vault. The open-ended
                  mint/redeem mechanism keeps ZPC anchored to NAV at all
                  times through arbitrage.**

  *Rationale*     This is a consequence of the open-ended structure. If
                  ZPC trades above NAV, investors mint new ZPC by
                  depositing Bitcoin, arbitraging the premium away. If it
                  trades below NAV, investors redeem for underlying
                  assets, arbitraging the discount away. This is
                  transparent and fair to investors but means ZPC cannot
                  appreciate beyond its underlying asset value through
                  speculative demand alone.
  --------------- -------------------------------------------------------

> *Note: This distinguishes ZPC from Bitcoin\'s scarcity-driven
> appreciation model. ZPC\'s value proposition is the appreciation of
> the underlying basket, not token scarcity. This should be clearly
> communicated to investors --- it is a feature, not a limitation.*

**2.2 Transaction Batching**

  --------------- -------------------------------------------------------
  **DECISION**    **Deposits and redemptions will be batched daily rather
                  than processed individually. The vault will net buy and
                  sell flows and execute only the residual externally.**

  *Rationale*     Batching significantly reduces gas costs per investor
                  by spreading transaction costs across many
                  participants. It also enables more efficient execution
                  on underlying DeFi protocols (reduced slippage) and
                  makes management of complex positions (synthetic bond
                  shorts etc.) more practical. Investors may experience
                  up to 24 hours between deposit instruction and ZPC
                  issuance --- acceptable given the fund\'s long-term
                  investment horizon.
  --------------- -------------------------------------------------------

**2.3 Investor-Facing Portfolio Disclosure**

  --------------- -------------------------------------------------------
  **DECISION**    **Investors will see named positions with percentage
                  allocations for major holdings (Bitcoin, tokenised
                  gold, named macro positions). A residual \'Active Macro
                  Positions\' sleeve will show the total allocation but
                  not the individual constituents or weightings.**

  *Rationale*     Balances transparency (investors can verify broad
                  thesis alignment) with IP protection (specific trade
                  sizing is the fund\'s competitive edge). Mirrors
                  accepted practice in hedge fund reporting. The on-chain
                  auditability of all positions remains available to
                  sophisticated investors who choose to look, but is not
                  surfaced in the standard investor dashboard.
  --------------- -------------------------------------------------------

**3. Portfolio Management**

**3.1 Hybrid Autonomous / Managed Architecture**

  --------------- -------------------------------------------------------
  **DECISION**    **The vault will operate on a hybrid model. Routine
                  mechanical operations (batching, netting, rebalancing
                  within predefined bands, minting/burning ZPC) will be
                  handled autonomously by the smart contract. Strategic
                  allocation decisions (changing target bands,
                  introducing new positions, adjusting the thesis
                  expression) will be made by the investment team and fed
                  into the contract as updated parameters.**

  *Rationale*     Pure autonomy would prevent the active management that
                  is the fund\'s USP. Pure manual control would introduce
                  single points of failure and undermine the trustless
                  nature of the vault. The hybrid model gives investors
                  confidence in mechanical reliability while preserving
                  the investment team\'s ability to respond to macro
                  developments.
  --------------- -------------------------------------------------------

**3.2 Manager Role and Guardrails**

  --------------- -------------------------------------------------------
  **DECISION**    **The smart contract will include a privileged
                  \'manager\' role capable of updating allocation
                  parameters without a full governance vote. Guardrails
                  will be implemented: maximum allocation limits per
                  asset class, timelocks on large moves, and minimum
                  diversification requirements.**

  *Rationale*     Investment team needs to move quickly when the macro
                  environment shifts. Governance votes on every
                  rebalancing decision would be unworkable. Guardrails
                  protect investors from catastrophic unilateral moves
                  while preserving meaningful management flexibility.
                  Full disclosure of guardrail parameters in the
                  whitepaper.
  --------------- -------------------------------------------------------

**3.3 AI-Assisted Investment Management**

  --------------- -------------------------------------------------------
  **DECISION**    **The investment team will use AI tools to identify
                  opportunities and inform allocation decisions. The AI
                  tooling is considered part of the fund\'s proprietary
                  edge and will not be publicly disclosed in detail.**

  *Rationale*     AI-assisted analysis is a genuine competitive advantage
                  in identifying macro opportunities and monitoring
                  positions. Treating it as proprietary infrastructure
                  (rather than using generic off-the-shelf tools) is
                  consistent with the fund\'s approach to IP protection.
  --------------- -------------------------------------------------------

**4. Fee Structure**

**4.1 Annual Management Fee**

  --------------- -------------------------------------------------------
  **DECISION**    **1.5% annual management fee, accrued continuously by
                  the smart contract and taken automatically. No manual
                  invoicing.**

  *Rationale*     Within the 1-2% range standard for actively managed
                  funds with complex underlying structures. Continuous
                  accrual via smart contract is cleaner and more
                  transparent than periodic fee extraction. The fee is
                  taken in Bitcoin-denominated terms consistent with the
                  fund\'s denomination.
  --------------- -------------------------------------------------------

**4.2 Performance Fee**

  --------------- -------------------------------------------------------
  **DECISION**    **A small performance fee (indicatively 1-2%) applies
                  only to returns that exceed holding raw Bitcoin. If
                  SPICE does not outperform simply holding Bitcoin, no
                  performance fee is charged.**

  *Rationale*     The honest observation that SPICE\'s outperformance is
                  not purely a function of manager skill --- the macro
                  thesis doing so partly reflects systematic government
                  policy failures. A small fee is appropriate; a large
                  fee would be difficult to justify. Benchmarking against
                  raw Bitcoin is the most honest hurdle --- it forces
                  SPICE to prove it adds value over the simplest
                  crypto-native alternative. If we don\'t beat holding
                  Bitcoin, we don\'t take a performance fee is a
                  compelling and honest marketing statement.
  --------------- -------------------------------------------------------

> *Note: Dual reporting consideration: returns should be shown both vs.
> raw Bitcoin (performance fee benchmark) and vs. fiat purchasing power
> (investor psychology benchmark). These may tell very different stories
> in a crisis scenario.*

**4.3 Protocol and Gas Costs**

  --------------- -------------------------------------------------------
  **DECISION**    **Network gas costs and underlying protocol fees
                  (Synthetix trading fees etc.) are borne by the fund and
                  reflected in NAV rather than charged separately to
                  investors.**

  *Rationale*     Simpler investor experience. Costs are real and will be
                  modelled carefully in tokenomics --- particularly
                  protocol fees on the active macro positions sleeve,
                  which has the highest turnover. Transaction batching is
                  the primary mechanism for managing these costs
                  efficiently.
  --------------- -------------------------------------------------------

**5. Founder & Early Backer Economics**

**5.1 Founding Allocation Structure**

  --------------- -------------------------------------------------------
  **DECISION**    **A founding allocation of ZPC tokens (indicatively 15%
                  of total supply) is reserved for founders prior to the
                  public vault opening. A further allocation
                  (indicatively 10%) is reserved for early backers ---
                  technical co-founder, legal advisors, community
                  builders --- in exchange for contribution now rather
                  than cash fees. All allocations are subject to vesting
                  schedules.**

  *Rationale*     Standard crypto protocol practice. Fully disclosed in
                  the whitepaper from day one. Founder tokens are not
                  backed by Bitcoin in the vault at launch --- they are
                  backed by the future economics of the fund (management
                  fee income and performance fees). This is analogous to
                  founder equity in a startup: valuable because of future
                  business success, not because of immediate asset
                  backing.
  --------------- -------------------------------------------------------

  ----------------------- ---------------- -------------------------------
  **Allocation**          **%              **Notes**
                          (Indicative)**   

  Public Investors        **70%**          *Fully backed by deposited
                                           Bitcoin. Open to all.*

  Founders                **15%**          *4-year vesting, 1-year cliff.
                                           Backed by future fee income.*

  Early Backers /         **10%**          *Technical co-founder, legal,
  Advisors                                 community. SAFT structure.*

  Reserve / Ecosystem     **5%**           *Future partnerships, liquidity
                                           incentives, grants.*
  ----------------------- ---------------- -------------------------------

**5.2 Vesting Schedule**

  --------------- -------------------------------------------------------
  **DECISION**    **Founder tokens vest over 4 years with a 1-year cliff.
                  Early backer tokens vest over 2-3 years depending on
                  the nature of their contribution. All vesting schedules
                  are encoded in the smart contract and publicly
                  visible.**

  *Rationale*     Vesting is the single most important trust signal for
                  investors. It proves founders are committed for the
                  long term and cannot dump on early investors
                  immediately after launch. On-chain vesting is
                  transparent and cannot be overridden. The 1-year cliff
                  means founders receive nothing if the project fails
                  within the first year.
  --------------- -------------------------------------------------------

**5.3 How Founder Tokens Become Valuable**

  --------------- -------------------------------------------------------
  **DECISION**    **Founder tokens appreciate through two mechanisms: (1)
                  management fee income accruing into the founder
                  allocation over time, denominated in ZPC; (2)
                  appreciation of the underlying asset basket if founders
                  retain their ZPC rather than redeeming.**

  *Rationale*     In the Crisis Acceleration scenario modelled
                  separately, a 15% founder allocation on a large AUM
                  fund generates substantial wealth through fee income
                  alone. If the macro thesis plays out and the underlying
                  assets appreciate significantly, the retained ZPC
                  allocation could appreciate dramatically beyond the fee
                  income component.
  --------------- -------------------------------------------------------

**6. Two-Token Structure: IRON & SPICE**

A fundamental structural insight emerged from thinking through the
zombie apocalypse analogy. The fund has two distinct phases with
different investor needs, different token economics, and different value
propositions. These phases are best served by two separate tokens rather
than one.

**6.1 The Two-Phase Model**

  --------------- -------------------------------------------------------
  **DECISION**    **SPICE operates in two distinct phases. Phase 1
                  (Pre-Apocalypse) uses the IRON token --- an open-ended,
                  NAV-anchored vault token. Phase 2 (Post-Apocalypse)
                  uses the SPICE token \[ZPC\] --- a closed-ended, fixed
                  supply token trading freely on secondary markets at a
                  premium or discount to NAV.**

  *Rationale*     The two phases serve fundamentally different investor
                  needs. Phase 1 investors want a sensible, transparent
                  hedge during the gradual deterioration. Phase 2
                  investors need a scarce, hard-asset-backed currency for
                  the world after fiat credibility collapses. One token
                  cannot serve both purposes elegantly.
  --------------- -------------------------------------------------------

  ----------------- -------------------------- --------------------------
  **Feature**       **IRON --- Phase 1**       **SPICE \[ZPC\] --- Phase
                                               2**

  **Ticker**        IRON                       ZPC

  **Structure**     Open-ended vault           Closed-ended, fixed supply

  **NAV             Anchored to NAV at all     Trades at premium/discount
  relationship**    times                      on secondary markets

  **New tokens**    Minted on each deposit     No new minting after
                                               switchover

  **Redemption**    Any time for underlying    Sell back to fund at NAV
                    Bitcoin                    or sell fractions on
                                               secondary market

  **Value driver**  Underlying asset           Asset appreciation plus
                    appreciation               scarcity premium

  **Phase**         Gradual deterioration ---  Crisis --- post-apocalypse
                    preparation                currency

  **Narrative**     Accumulate IRON before the SPICE is the currency of
                    storm                      the world after
  ----------------- -------------------------- --------------------------

**6.2 The Switchover Mechanism**

  --------------- -------------------------------------------------------
  **DECISION**    **At the trigger point, all IRON tokens are
                  compulsorily converted to SPICE \[ZPC\] at a defined
                  ratio. The conversion is mandatory --- no investor
                  remains in IRON after the switchover. The Phase 1 token
                  ceases to exist. All holders become SPICE holders.**

  *Rationale*     A compulsory conversion creates a clean break and
                  forces price discovery on SPICE in the secondary
                  market. Optional conversion would result in two tokens
                  competing, creating confusion and diluting the scarcity
                  value of SPICE. The mandatory nature must be disclosed
                  clearly in the whitepaper from day one --- investors
                  know this is coming when they buy IRON.
  --------------- -------------------------------------------------------

**6.3 Post-Switchover Liquidity Options**

  --------------- -------------------------------------------------------
  **DECISION**    **On Day 1 after the switchover, SPICE holders have two
                  liquidity options. Option A: sell SPICE tokens back to
                  the fund at NAV (share buyback mechanism). The fund
                  reissues these tokens into the secondary market rather
                  than destroying them, controlling the float. Option B:
                  fractionalise SPICE tokens and sell fractions on the
                  secondary market, allowing partial liquidity while
                  maintaining exposure.**

  *Rationale*     The buyback mechanism creates a NAV price floor ---
                  SPICE cannot trade significantly below NAV because the
                  fund will buy it back. This gives investors confidence
                  while preserving the premium potential above NAV driven
                  by scarcity and demand. Fractionalisation makes SPICE
                  genuinely usable as a currency --- small fractions can
                  circulate, be traded, and act as a store of value in a
                  world where fiat has lost credibility.
  --------------- -------------------------------------------------------

**6.4 Founder & Early Backer Allocation in SPICE**

  --------------- -------------------------------------------------------
  **DECISION**    **Founders and early backers receive their allocation
                  in SPICE \[ZPC\] tokens, not IRON. This allocation
                  exists from day one but is dormant until the
                  switchover. At the trigger point, founder SPICE tokens
                  become the scarcest, most sought-after asset in the
                  post-apocalypse financial system.**

  *Rationale*     This solves the founder token backing problem
                  elegantly. SPICE tokens are not backed by Bitcoin in
                  the vault --- they are backed by the future Phase 2
                  event and the scarcity premium that comes with it.
                  Founders and early backers who believed in the thesis
                  from the beginning are rewarded with exactly the asset
                  that the thesis predicts will be most valuable. This is
                  the mind-bending wealth mechanism --- not fee income
                  alone, but a large allocation of a scarce
                  post-apocalypse currency.
  --------------- -------------------------------------------------------

**6.5 Phase 2 Asset Management --- Open Question**

A critical unresolved question is whether the SPICE vault continues to
actively manage and accrue assets after the switchover, and if so, how
the operational economics work without new deposit income.

Three broad options have been identified:

-   Static basket --- vault freezes at switchover. Simple but the fund
    slowly winds down as holders redeem or trade.

-   Continued active management --- investment team keeps rebalancing
    the basket. Value appreciates through management skill on top of
    scarcity premium. Revenue model shifts from deposit fees to
    performance fees on an appreciating crisis-era basket.

-   New asset accrual mechanism --- in a post-fiat world, participants
    deposit assets into the SPICE vault to access the SPICE economy,
    creating a new form of inflow. Most complex but potentially makes
    SPICE a genuine alternative financial system.

> *Note: This decision has significant implications for tokenomics,
> legal structure, and the Phase 2 narrative. To be resolved in a
> dedicated working session with financial modelling.*

**7. Legal & Regulatory Framework**

**7.1 Jurisdiction --- Cayman Islands**

  --------------- -------------------------------------------------------
  **DECISION**    **The Cayman Islands is the target jurisdiction for the
                  SPICE protocol entity. A Cayman Islands Foundation
                  Company is the preferred vehicle --- it has no
                  shareholders, exists for a defined purpose, and maps
                  well onto a decentralised protocol with token holders
                  rather than equity holders.**

  *Rationale*     Cayman is the dominant global jurisdiction for crypto
                  funds and alternative investment structures. No capital
                  gains, income, or corporation tax. The regulatory
                  framework is well understood by institutional investors
                  and lawyers worldwide. The Foundation Company structure
                  specifically reduces the identifiable controlling party
                  problem that creates regulatory exposure for DeFi
                  protocols. Several major DeFi protocols use this
                  structure successfully.
  --------------- -------------------------------------------------------

**7.2 Regulatory Risks & Mitigations**

The following regulatory risks have been identified and require active
management:

  ------------------ -------------------------- --------------------------
  **Risk**           **Detail**                 **Mitigation**

  **US SEC**         Long-arm jurisdiction.     *Robust technical
                     Doesn\'t care where        geoblocking of US
                     you\'re incorporated if    investors. No US persons
                     marketing to Americans.    in founding team or
                     IRON likely satisfies      investor base. No US
                     Howey Test.                marketing.*

  **UK FCA**         Increasingly assertive on  *Geoblocking of UK retail
                     crypto assets marketed to  investors. Specific legal
                     UK retail. Risk elevated   advice required on founder
                     if founders are UK-based.  residency implications.*

  **FATF / AML**     Cayman now requires VASP   *Build KYC/AML compliance
                     registration for crypto    into investor onboarding
                     assets. KYC and AML        from day one. Budget for
                     obligations on investors.  ongoing compliance cost.*

  **Collective       IRON in Phase 1 looks like *Cayman Foundation
  Investment         a CIS under most           structure and geoblocking
  Scheme**           jurisdictions --- pooled   reduce exposure. Legal
                     capital, managed by        advice required on
                     others, expectation of     disclosure and
                     return.                    structuring.*

  **Compulsory       Forcing IRON to SPICE      *Full disclosure in
  Switchover**       conversion is a mandatory  whitepaper from day one.
                     corporate action --- may   Legal advice on smart
                     require regulatory         contract mechanics and
                     approval in some           investor consent
                     jurisdictions.             frameworks.*
  ------------------ -------------------------- --------------------------

**7.3 Legal Counsel**

  --------------- -------------------------------------------------------
  **DECISION**    **Specialist crypto/securities legal advice is required
                  before any public launch. Priority areas: Cayman
                  Foundation Company formation, VASP registration, SAFT
                  structure for early backers, geoblocking
                  implementation, whitepaper disclosure requirements, and
                  the legal treatment of the compulsory IRON-to-SPICE
                  switchover.**

  *Rationale*     This is not an area where general legal advice is
                  sufficient. The two-token structure and compulsory
                  switchover are novel enough to require specialist
                  input. Target a crypto-specialist firm willing to work
                  for token allocation rather than cash fees given the
                  pre-revenue stage of the project.
  --------------- -------------------------------------------------------

**8. Investment Management Structure**

**8.1 Founder Qualifications --- Honest Assessment**

  --------------- -------------------------------------------------------
  **DECISION**    **The founding team currently has no formal investment
                  management qualifications. This is acknowledged openly
                  and is being addressed through structural solutions
                  rather than ignored.**

  *Rationale*     Managing a regulated collective investment scheme
                  without appropriate authorisation is a criminal offence
                  in most jurisdictions regardless of personal investment
                  track record. The structure must be designed so that
                  the entity manages the fund, not an unqualified
                  individual personally. This is a solvable problem ---
                  many successful DeFi protocols were built by teams with
                  no formal investment management credentials.
  --------------- -------------------------------------------------------

**8.2 Three Distinct Roles**

The investment management challenge breaks down into three distinct
roles that do not all need to be filled by the same person:

  ------------------ ----------------------------- ----------------------
  **Role**           **Description**               **Status**

  **Visionary /      Macro thesis, product design, *Founder --- in place*
  Founder**          target market, narrative. No  
                     formal qualification          
                     required.                     

  **Investment       Formal credentials or         *Gap --- to be
  Manager**          structural workaround         resolved*
                     required. DAO governance,     
                     algorithmic process, or       
                     outsourced management         
                     agreement.                    

  **Technical        Smart contract architecture,  *Gap --- technical
  Builder**          vault design, blockchain      co-founder required*
                     integration.                  
  ------------------ ----------------------------- ----------------------

**8.3 Algorithmic Investment Process --- Key Strategic Direction**

  --------------- -------------------------------------------------------
  **DECISION**    **The allocation process should be algorithmic and
                  rules-based rather than purely discretionary. The
                  algorithm monitors macro indicators --- sovereign bond
                  yields, currency debasement signals, central bank
                  balance sheets, inflation data --- and adjusts the
                  basket accordingly. AI-assisted analysis augments the
                  algorithmic process. This is a critical workstream to
                  be developed in detail.**

  *Rationale*     An algorithmic approach addresses the investment
                  manager qualification problem directly --- if
                  allocation decisions are genuinely rules-based rather
                  than discretionary, the regulatory question of who is
                  qualified to manage the fund looks fundamentally
                  different. It also creates a defensible, systematic
                  investment process that is more credible to
                  sophisticated investors than personal judgment alone.
                  The AI assistance layer makes this more adaptive and
                  potentially more distinctive than a simple rules-based
                  ETF-style approach.
  --------------- -------------------------------------------------------

> *Note: This is one of the most important workstreams in the project.
> The algorithm design sits at the intersection of the investment
> thesis, the technology build, and the regulatory structure. A
> dedicated working session is required. Key questions: what macro
> indicators does the algorithm monitor? What are the rebalancing
> triggers? Can the algorithm itself trigger the IRON-to-SPICE
> switchover? How does the AI layer interact with the rules-based
> layer?*

**9. Token Trading & Distribution**

**9.1 Primary Distribution --- Protocol Interface**

  --------------- -------------------------------------------------------
  **DECISION**    **The primary interface for minting and redeeming IRON
                  tokens is the SPICE protocol website. Investors connect
                  their crypto wallet, deposit Bitcoin, and receive IRON
                  directly from the smart contract. No exchange listing
                  is required for this core function.**

  *Rationale*     The protocol website as primary interface is standard
                  DeFi practice and gives the project full control over
                  the investor experience. This is analogous to a presale
                  website model --- investors interact directly with the
                  protocol before any secondary market trading exists.
  --------------- -------------------------------------------------------

**9.2 Secondary Market Trading --- Decentralised Exchanges**

  --------------- -------------------------------------------------------
  **DECISION**    **The primary secondary market trading venue for IRON
                  will be Aerodrome on Base, with Uniswap as a secondary
                  venue. A liquidity pool (IRON/WBTC or IRON/ETH) will be
                  established at or shortly after launch. No centralised
                  exchange listing approval is required for DEX
                  trading.**

  *Rationale*     DEX trading requires no gatekeeper approval --- a
                  liquidity pool can be created permissionlessly.
                  Aerodrome is the dominant DEX on Base and is the
                  natural home for a Base-native token. The crypto-native
                  target investor is comfortable using DEXs. Uniswap
                  provides additional reach and liquidity depth.
  --------------- -------------------------------------------------------

**9.3 Centralised Exchange Listings --- Medium Term**

  --------------- -------------------------------------------------------
  **DECISION**    **Centralised exchange listings (Kraken, KuCoin, and
                  eventually Coinbase) are a medium-term objective rather
                  than a launch requirement. Pursuit of listings begins
                  once the protocol has established trading volume,
                  community size, and track record on DEXs.**

  *Rationale*     Coinbase listing requires passing a stringent
                  compliance review and is a Year 3+ ambition. Tier 2
                  exchanges (Kraken, KuCoin, Gate.io) have more
                  accessible listing processes and represent a meaningful
                  interim milestone. Exchange listings dramatically
                  expand the addressable investor base beyond
                  crypto-native users.
  --------------- -------------------------------------------------------

> *Note: US and UK geoblocking applies to the protocol interface but
> cannot prevent determined investors from accessing DEX trading via
> VPN. This is accepted as an industry-wide reality. The geoblocking is
> a legal defence --- demonstrating reasonable steps were taken ---
> rather than a genuine technical barrier. Legal advice required on the
> standard of geoblocking that constitutes sufficient mitigation.*

**10. Legal Advice Structure**

**10.1 Two Separate Legal Opinions Required**

  --------------- -------------------------------------------------------
  **DECISION**    **Two separate legal opinions are required before any
                  public launch --- one from a UK-qualified financial
                  services specialist addressing the founder\'s personal
                  position as a UK resident, and one from a Cayman
                  Islands specialist addressing entity formation, VASP
                  registration, and fund structure.**

  *Rationale*     The two opinions cover fundamentally different risks.
                  The UK opinion protects the founder personally under
                  FSMA 2000. The Cayman opinion makes the fund structure
                  legally sound. The UK opinion should be obtained first
                  as it informs the Cayman structure.
  --------------- -------------------------------------------------------

UK Specialist scope: Personal exposure under FSMA 2000. Authorised
collective investment scheme risk. Financial promotion rules. Ongoing
conduct requirements for UK-resident founder. Estimated cost:
£5,000-£15,000. Suggested firms: Mishcon de Reya, Fieldfisher, Pinsent
Masons, Memery Crystal, gunnercooke.

Cayman Specialist scope: Foundation Company formation. VASP registration
with CIMA. SAFT structure for early backers. Whitepaper disclosure
requirements. Legal treatment of compulsory IRON-to-SPICE switchover.
Estimated cost: \$20,000-\$50,000. Suggested firms: Walkers, Maples
Group, Ogier, Appleby.

> *Note: Both firms may be open to partial payment in token allocation.
> Have the cash conversation upfront. Both will need to see the Project
> Brief, Pitch Document, and Product Decisions document before
> advising.*

**10.2 UK Founder Personal Risk Mitigations**

  --------------- -------------------------------------------------------
  **DECISION**    **The founder is UK resident and unable to relocate.
                  Personal legal exposure under FSMA 2000 is real and
                  must be managed through structural mitigations. Four
                  primary mitigations identified: genuine algorithmic
                  decision making, limited personal role in Cayman
                  entity, no UK marketing, and written UK legal opinion
                  on file.**

  *Rationale*     People in this situation do build and run DeFi
                  protocols successfully. The risk does not disappear but
                  becomes manageable with careful structure, good legal
                  advice, genuine decentralisation of decision making,
                  and a clear paper trail showing the risk was taken
                  seriously and acted upon.
  --------------- -------------------------------------------------------

-   Genuine algorithmic decision making reduces the controlled mind in
    the UK argument significantly.

-   Founder should not be a named director or officer of the Cayman
    entity. Other directors resident outside UK should formally control
    the Foundation.

-   No UK marketing whatsoever. No UK events, no content targeting UK
    investors, no UK press coverage promoting SPICE as an investment.

-   Written UK legal opinion on file demonstrates the risk was taken
    seriously. Essential paper trail if enforcement action ever arises.

**11. Marketing, Content & Trust Architecture**

**11.1 The Core Trust Problem**

A fundamental tension exists at the heart of SPICE marketing. The
structural features that protect the founder legally --- anonymity,
offshore jurisdiction, decentralisation, no identifiable controlling
party --- are exactly the features that make ordinary investors
suspicious. These are also the features of every crypto scam ever
perpetrated. When regulatory protection is stripped away it must be
replaced with something else that performs the same trust function.

**11.2 What Actually Builds Trust in SPICE**

  --------------- -------------------------------------------------------
  **DECISION**    **Trust in SPICE is built through structural
                  transparency rather than personal reputation or
                  regulatory endorsement. The on-chain architecture
                  provides trust signals no traditional fund can offer
                  --- every asset verifiable in real time, smart contract
                  code publicly auditable, vesting schedules immutable,
                  fee structure hardcoded and transparent.**

  *Rationale*     A traditional hedge fund asks investors to trust the
                  manager. SPICE asks investors to trust the code, which
                  they can read themselves. This is a stronger and more
                  durable trust foundation than a face on a YouTube
                  video. The quality of the thesis, structural
                  transparency, a clean smart contract audit, a credible
                  legal wrapper, and over time a track record of doing
                  what was promised --- these are the real trust signals.
  --------------- -------------------------------------------------------

**11.3 Two-Track Content Strategy**

  --------------- -------------------------------------------------------
  **DECISION**    **A two-track content approach separates macro thesis
                  narrative from specific investment promotion. Track 1
                  --- macro thesis content explaining the AI deflation
                  collision, the sovereign debt trap, and the zombie
                  apocalypse framing --- is published freely including to
                  UK viewers, as it does not constitute a financial
                  promotion. Track 2 --- specific SPICE investment
                  content --- is geoblocked to the UK and attributed to
                  the Cayman Foundation entity rather than the founder
                  personally.**

  *Rationale*     Under FSMA 2000 Section 21, any communication that
                  invites or induces a person to engage in investment
                  activity constitutes a financial promotion and requires
                  FCA authorisation or an applicable exemption.
                  Discussing the macro thesis freely is lawful. Promoting
                  SPICE as a specific investment to UK viewers without
                  authorisation is not. The two-track approach maximises
                  content reach while managing regulatory exposure.
  --------------- -------------------------------------------------------

**11.4 Founder Anonymity --- Phased Approach**

  --------------- -------------------------------------------------------
  **DECISION**    **The founder operates pseudonymously at launch,
                  protecting personal legal position during the legally
                  sensitive early phase. De-anonymisation is possible
                  later once the legal structure is established, the
                  Cayman entity is in place, UK legal advice has been
                  taken, and the project has sufficient scale that the
                  regulatory conversation changes.**

  *Rationale*     Several successful crypto founders have followed
                  exactly this path --- pseudonymous at launch, publicly
                  identified later when the project was established
                  enough to handle scrutiny. Pseudonymity is not
                  deception --- it is standard DeFi practice and carries
                  its own form of credibility in the crypto community.
  --------------- -------------------------------------------------------

**11.5 AI-Generated Content --- Boundaries**

  --------------- -------------------------------------------------------
  **DECISION**    **AI tools will be used extensively for written
                  content, research, narrative development, and thesis
                  articulation. AI-generated synthetic human presenters
                  --- AI avatars or voice clones presenting as real
                  people --- will not be used for investor-facing
                  content.**

  *Rationale*     If investors discover that a trusted face or voice was
                  AI-generated, the trust damage is catastrophic and
                  terminal for a product whose entire proposition is
                  honesty and transparency. The contradiction between
                  synthetic presentation and genuine transparency is
                  fundamental. AI assistance is a competitive advantage
                  in content creation. The boundary is between
                  AI-assisted human content (acceptable) and AI-generated
                  synthetic human presentation (not acceptable for this
                  product).
  --------------- -------------------------------------------------------

**11.6 YouTube and Video Content Strategy**

  --------------- -------------------------------------------------------
  **DECISION**    **Video content follows the two-track strategy. Macro
                  thesis content --- the zombie apocalypse framing, AI
                  deflation, sovereign debt collision --- published
                  freely on YouTube. SPICE-specific investment content
                  published with UK geoblocking and attributed to the
                  Cayman Foundation rather than the founder personally.
                  The founder may appear in macro thesis content but not
                  in content that constitutes a financial promotion.**

  *Rationale*     YouTube allows geographic restrictions on videos. UK
                  geoblocking of investment promotion content reduces FCA
                  financial promotion risk meaningfully. Generic macro
                  content builds audience and intellectual credibility
                  without triggering financial promotion rules. This
                  captures the authenticity benefit of a real human voice
                  for the thesis while protecting the founder from
                  personal regulatory exposure on the investment
                  promotion itself.
  --------------- -------------------------------------------------------

**12. Open Issues & Decisions Pending**

The following issues have been identified but not yet resolved. They are
flagged for future working sessions.

  ----------------------------------- -----------------------------------
  **Issue**                           **Status / Notes**

  IRON-to-SPICE trigger definition    *What exactly triggers the
                                      switchover? Macro event (sovereign
                                      bond break, currency crisis), AUM
                                      milestone, date, or governance
                                      vote? Must be objective,
                                      verifiable, and resistant to
                                      manipulation.*

  Phase 2 asset management model      *Does the vault continue actively
                                      managing the basket after
                                      switchover? If so, what is the
                                      revenue model without new deposits?
                                      Three options: static basket,
                                      continued management, or new
                                      accrual mechanism.*

  Algorithmic investment process      *What macro indicators does the
  design                              algorithm monitor? What are the
                                      rebalancing triggers and
                                      thresholds? Can the algorithm
                                      trigger the IRON-to-SPICE
                                      switchover? How does the AI layer
                                      interact with the rules-based
                                      layer? Dedicated working session
                                      required.*

  Investment manager qualification    *How is the investment manager
                                      qualification gap resolved?
                                      Options: DAO governance,
                                      algorithmic process, outsourced
                                      management agreement, or qualified
                                      co-manager. Legal advice required
                                      on which structure provides
                                      sufficient regulatory cover.*

  Founder personal legal risk         *UK residency creates specific
                                      personal legal exposure for
                                      operating an unauthorised
                                      collective investment scheme.
                                      Founder residency implications,
                                      personal liability mitigation, and
                                      relationship between Cayman entity
                                      and UK-based founder require
                                      specialist legal advice.*

  SPICE token float management        *How does the fund manage the float
                                      of reissued SPICE tokens from
                                      buybacks? Is there a maximum float?
                                      What prevents the fund from
                                      effectively recreating an
                                      open-ended structure through
                                      buyback/reissue?*

  Fractionalisation mechanics         *Technical implementation of SPICE
                                      token fractionalisation. Minimum
                                      fraction size. Secondary market
                                      infrastructure required.*

  Exact performance fee mechanics     *How performance fee is calculated,
                                      accrued, and extracted in Bitcoin
                                      terms. Highwater mark mechanism.
                                      Frequency of calculation. Applies
                                      in both Phase 1 and Phase 2.*

  Performance hurdle definition       *Exact definition of outperforming
                                      raw Bitcoin. Rolling period (1yr,
                                      3yr?). How to handle Bitcoin
                                      volatility. What happens if Bitcoin
                                      outperforms everything in a
                                      crisis?*

  Dual reporting framework            *How to present returns in both
                                      Bitcoin terms and fiat purchasing
                                      power terms. Which fiat basket to
                                      use as the purchasing power
                                      reference. Critical for investor
                                      psychology.*

  Active Macro Positions disclosure   *Exactly what is disclosed vs.
  policy                              withheld. Time lag on position
                                      reporting. Legal advice required on
                                      disclosure obligations.*

  Governance model                    *On-chain governance parameters for
                                      rebalancing. Token holder voting
                                      rights. Manager role limitations
                                      and override mechanisms. How does
                                      governance change between Phase 1
                                      and Phase 2?*

  Technical co-founder engagement     *Vault architecture decisions
                                      deferred pending technical
                                      co-founder onboarding. Two-token
                                      structure adds complexity to smart
                                      contract requirements.*

  Legal structure for SAFT            *Simple Agreement for Future Tokens
                                      structure for early backer SPICE
                                      allocation. Jurisdiction
                                      implications. Legal advice
                                      required.*

  Compulsory switchover legal         *Legal advice required on mandatory
  treatment                           IRON-to-SPICE conversion. Investor
                                      consent framework. Disclosure
                                      requirements. Potential regulatory
                                      approval needed in some
                                      jurisdictions.*

  Cayman VASP registration            *Timeline, cost, and compliance
                                      obligations for Virtual Asset
                                      Service Provider registration in
                                      Cayman Islands. KYC/AML framework
                                      for investor onboarding.*

  Geoblocking implementation          *Technical and legal robustness of
                                      US and UK investor geoblocking.
                                      What constitutes sufficient
                                      technical restriction for
                                      regulatory purposes.*
  ----------------------------------- -----------------------------------

*SPICE \[ZPC\] \| Product Design Decisions \| v2.0 \| February 2026 \|
Confidential --- For Discussion Purposes Only*
