**SPICE \[ZPC\]**

Technical Requirements Document

*Technology Workstream --- Version 4.0 --- February 2026 ---
Confidential*

*Version history: v1.0 initial draft. v2.0 single token model adopted,
ETF-to-investment-trust transition defined, dashboards added as formal
deliverables. v3.0 Phase 2 investment mandate defined, NAV growth
mechanism clarified, post-crisis asset mandate added, fractional trading
confirmed. v4.0 open questions resolved --- Phase 2 redemption mechanics
corrected to secondary-market-only, working assumptions recorded for
proxy architecture, oracle sources, rebalancing model, performance fees,
founder token structure, geoblocking, and security audit. Technical
co-founder questions reframed as working assumptions.*

**1. Confirmed Product Decisions**

The following decisions are confirmed and are the foundation for all
technical requirements that follow.

**1.1 Single Token Model**

  -----------------------------------------------------------------------
  **Decision: SPICE \[ZPC\] is a single token that operates in two
  sequential modes. There is no separate IRON token. One token, one
  address, continuous history from inception through both phases.**

  -----------------------------------------------------------------------

The two-token IRON/SPICE model previously discussed is retired. The
single token model is simpler to explain, simpler to build, simpler to
regulate, and tells a cleaner narrative: early holders benefit from both
phases under the same asset.

**1.2 ETF Model for Phase 1**

  -----------------------------------------------------------------------
  **Decision: Phase 1 uses a continuous ETF-style model. Deposit WBTC,
  receive SPICE at live NAV. Redeem SPICE for WBTC at live NAV. No daily
  batch cut-off. Price anchored to NAV by continuous arbitrage.**

  -----------------------------------------------------------------------

The daily batch / unit trust model was considered and rejected. Modern
investors expect continuous liquidity and real-time pricing --- the
ability to act immediately in a crisis is a core product requirement. On
Base network, gas fees are fractions of a penny, removing the cost
argument for batching.

**1.3 Investment Trust Mode for Phase 2**

  -----------------------------------------------------------------------
  **Decision: When the algorithmic trigger fires, minting closes
  permanently. SPICE transitions to investment trust mode: fixed supply,
  secondary market trading only. No NAV-floor redemption in Phase 2.**

  -----------------------------------------------------------------------

The v3 document described Phase 2 as maintaining a NAV floor through
continued redemptions. This has been corrected. A guaranteed NAV
redemption right in Phase 2 would be catastrophic: in a genuine crisis,
every investor would attempt to redeem simultaneously, forcing fire-sale
liquidations of underlying positions into a falling market, collapsing
NAV with each redemption, and triggering further redemptions. The fund
would destroy itself precisely when it should be at its most valuable.

Phase 2 liquidity is secondary market only. Investors hold SPICE or sell
it on Aerodrome to another buyer. In a genuine crisis scenario with
fixed supply and hard-asset backing, the secondary market price should
trade at a significant premium to NAV --- not a discount. This liquidity
risk must be prominently disclosed to all investors before they
participate in Phase 1.

  ------------------ ---------------------- -----------------------------
  **Feature**        **Phase 1 --- ETF      **Phase 2 --- Investment
                     Mode**                 Trust Mode**

  Token name         SPICE \[ZPC\]          SPICE \[ZPC\]

  Minting            Open --- deposit WBTC, Closed permanently --- no new
                     receive SPICE at NAV   SPICE can be minted

  Redemption         Any time at NAV ---    None --- secondary market
                     WBTC returned to       only
                     wallet instantly       

  Price vs NAV       Anchored by continuous Free to trade at whatever
                     arbitrage              premium secondary market
                                            offers

  Liquidity          Protocol liquidity --- Secondary market depth ---
                     always available at    Aerodrome liquidity pool
                     NAV                    

  Value drivers      Underlying asset       Asset performance plus
                     performance            scarcity premium

  Participation      Any investor ---       Secondary market only --- buy
                     deposit WBTC any time  from existing holders

  Trigger            From inception         Algorithmic macro trigger
                                            encoded in TriggerOracle.sol

  Narrative          Accumulate during the  Scarce hard-asset currency
                     gradual phase          for the crisis era
  ------------------ ---------------------- -----------------------------

**1.4 WBTC In, WBTC Out**

  -----------------------------------------------------------------------
  **Decision: Investors deposit WBTC and receive SPICE. Investors redeem
  SPICE and receive WBTC. The underlying portfolio positions are never
  delivered to investors directly.**

  -----------------------------------------------------------------------

The fund owns the underlying positions --- PAXG, synthetic bond shorts,
commodity tokens, AI infrastructure exposure. Investors own SPICE tokens
representing a proportional claim on the fund\'s NAV, denominated in
WBTC. This mirrors the ETF model: when you sell an ETF you receive cash,
not a basket of shares.

  -----------------------------------------------------------------------
  *The transparency advantage: a conventional hedge fund sends investors
  a monthly PDF. SPICE publishes every position continuously, on-chain,
  verifiable by anyone at any time. The dashboard is a convenient
  interface to data that exists independently of it. This is a stronger
  trust foundation than regulatory oversight --- it does not require the
  goodwill of any intermediary.*

  -----------------------------------------------------------------------

**1.5 Investor Portfolio Visibility**

  -----------------------------------------------------------------------
  **Decision: Investors can view their complete position at any time via
  the SPICE website (wallet connect), via third-party portfolio trackers
  (Zapper, DeBank, Zerion), or directly on Basescan. No login or account
  required.**

  -----------------------------------------------------------------------

**1.6 Fractional Trading**

  -----------------------------------------------------------------------
  **Decision: SPICE tokens are divisible to 18 decimal places as standard
  ERC-20 tokens. No special fractionalisation mechanism required.**

  -----------------------------------------------------------------------

A token trading at \$10,000 NAV with a 3x premium can still be purchased
in \$100 increments. Built into the ERC-20 standard, requires no
additional engineering.

**2. Phase 2 Investment Mandate**

Phase 2 begins when the algorithmic trigger fires and minting closes
permanently. This is a fundamental shift in the fund\'s investment
mandate. The Phase 1 trade has played out. The Phase 2 mandate is
different in character, and deliberately broader.

**2.1 The Phase 1 Trade Has Crystallised**

By the time the trigger conditions are met, the Phase 1 portfolio
positions will have done their work:

-   Sovereign bond shorts will have paid off as yields spiked and
    confidence in government debt broke.

-   Gold and tokenised hard assets will have surged as fiat credibility
    eroded.

-   Currency shorts on the most stressed sovereigns will have
    crystallised.

-   AI infrastructure exposure will have appreciated throughout as AI
    adoption continued regardless of the macro backdrop.

**2.2 The Phase 2 Question**

Phase 2 asks not 'what survives the crisis?' but 'what thrives in the
world the crisis creates?' The post-crisis world will have specific
structural characteristics that create identifiable investment
opportunities:

-   Sovereign debt has been restructured or inflated away --- new
    financing structures emerge.

-   Fiat credibility is damaged --- hard assets and crypto-native
    infrastructure command premium valuations.

-   Geopolitical realignment accelerates --- sovereign-independent
    infrastructure becomes strategically critical.

-   AI and robotics disruption has deepened --- the physical
    infrastructure of the new economy is being built.

-   Defence and security spending surges --- in every historical
    sovereign debt crisis, military spending follows.

  -----------------------------------------------------------------------
  *Phase 2 asset examples --- illustrative, not prescriptive:
  sovereign-independent space-based data infrastructure, autonomous
  defence systems, decentralised energy grids, agricultural land in
  politically stable jurisdictions, or assets not yet imaginable from
  today\'s vantage point. The mandate is deliberately broad: assets
  positioned to build and service the post-crisis order. Specific assets
  cannot and should not be defined today.*

  -----------------------------------------------------------------------

**2.3 NAV Growth Mechanism in Phase 2**

With minting closed, every unit of portfolio appreciation concentrates
into existing tokens rather than being diluted across new issuance:

-   Fixed supply: no new SPICE can be minted after the trigger. The
    denominator is frozen.

-   Growing numerator: the fund continues actively managing the
    portfolio. Asset appreciation flows entirely to existing token
    holders.

-   Compounding effect: as the portfolio grows, NAV per token rises
    continuously.

-   Management and performance fees continue: the fund remains a
    business. NAV growth is from asset appreciation, not fee
    elimination.

**2.4 The Premium Above NAV in Phase 2**

In Phase 2, SPICE trades on secondary markets at a price determined by
supply and demand. This price may exceed NAV significantly. The premium
has two components:

-   Forward-looking NAV appreciation: the market prices in expected
    future asset growth. Rational and grounded in intrinsic value.

-   Scarcity premium: in a world where fiat credibility has broken and
    hard-asset-backed crypto-native instruments are scarce, the supply
    constraint itself commands a premium.

  -----------------------------------------------------------------------
  *Not Bitcoin, not Tether --- something new. Bitcoin\'s value is pure
  scarcity plus belief --- no intrinsic asset backing. Tether is pegged
  to USD --- no appreciation potential. SPICE Phase 2 sits between them:
  genuine intrinsic value from a managed hard-asset portfolio, with
  appreciation potential from both rising NAV and scarcity premium. The
  floor is real assets. The ceiling is open.*

  -----------------------------------------------------------------------

**3. Investor Journey**

  ---------- ---------------- ------------------------------------------------
  **Step**   **Action**       **Detail**

  1          Investor visits  Connects MetaMask wallet with one click. No
             SPICE website    account, no login, no password. Wallet address
                              is the identity.

  2          Dashboard loads  Website reads wallet address, queries blockchain
                              directly. Shows SPICE balance, current USD/BTC
                              value, proportional fund share, full portfolio
                              breakdown, historical NAV.

  3          Investor         Enters WBTC amount. Approves transaction in
             deposits         MetaMask. Smart contract mints SPICE tokens at
                              current NAV instantly. SPICE appears in wallet.

  4          Ongoing          Investor can return to dashboard at any time.
             visibility       Can also use Zapper, DeBank, or Zerion by
                              pasting wallet address.

  5          Investor redeems Enters SPICE amount to redeem. Confirms in
             (Phase 1 only)   MetaMask. Contract burns SPICE, returns WBTC to
                              wallet at current NAV. Instant settlement.

  6          Phase 2 trigger  Algorithmic conditions met. Smart contract
             fires            closes minting automatically. SPICE transitions
                              to investment trust mode. Existing holders
                              notified via on-chain event.

  7          Phase 2          Investor sells on Aerodrome or secondary market
             liquidity        at whatever price the market offers. No protocol
                              redemption available. Liquidity depends on
                              secondary market depth.
  ---------- ---------------- ------------------------------------------------

**4. Investor Dashboard --- Formal Deliverable**

The investor-facing website is a formal product deliverable. It must be
live before any public launch. Technical approach: React frontend
querying on-chain data directly via ethers.js or viem. No centralised
backend required for core functionality. MetaMask and WalletConnect for
wallet integration.

  ---------------- ---------------------------------- --------------------
  **Feature**      **Description**                    **Priority**

  Wallet           One-click MetaMask connect.        Must have
  connection       Address-based identity, no account 
                   required.                          

  SPICE balance    Token balance with current USD and Must have
                   BTC value. Real-time updates.      

  Fund share       Investor\'s proportional ownership Must have
  percentage       of total AUM.                      

  Portfolio        Full list of fund positions with   Must have
  breakdown        name, value, and percentage.       
                   Sourced directly from on-chain     
                   state.                             

  NAV per SPICE    Current NAV in USD and BTC.        Must have
                   Updated continuously from          
                   Chainlink feeds.                   

  Total AUM        Fund total assets under management Must have
                   in USD and BTC.                    

  Historical NAV   NAV from inception to present.     Must have
  chart            Interactive, zoomable.             

  Deposit          WBTC amount input, approve and     Must have
  interface        deposit flow, confirmation. Phase  
                   1 only.                            

  Redemption       SPICE amount input, redeem flow,   Must have
  interface        estimated WBTC return shown before 
                   confirmation. Phase 1 only.        

  Macro indicator  Live display of all algorithmic    Must have
  dashboard        trigger indicators. Progress       
                   towards Phase 2 threshold shown    
                   visually.                          

  Phase 2 trigger  Clear indicator of current phase   Must have
  status           and distance from trigger          
                   conditions.                        

  Phase 2          Prominent disclosure that Phase 2  Must have
  liquidity        has no protocol redemption ---     
  warning          secondary market only. Displayed   
                   prominently before any deposit.    

  Transaction      All investor deposits,             Must have
  history          redemptions, and fee events for    
                   their wallet.                      

  Wallet address   Any wallet address can be entered  Must have
  lookup           to view that wallet\'s position.   
                   No connection required for         
                   read-only view.                    

  Mobile           Full functionality on mobile       Should have
  responsive       browsers.                          

  Zapper / DeBank  Standard ERC-20 token metadata so  Should have
  integration      portfolio trackers pick up SPICE   
                   automatically.                     
  ---------------- ---------------------------------- --------------------

**5. Manager Dashboard --- Formal Deliverable**

A privileged manager interface within the same SPICE website.
Manager-only sections unlocked when a manager wallet connects. Access
controlled at the smart contract level.

  ---------------- ---------------------------------- --------------------
  **Feature**      **Description**                    **Priority**

  Privileged       Manager dashboard accessible only  Must have
  wallet login     to wallets with manager role in    
                   the smart contract.                

  Current          Live display of all positions with Must have
  allocation view  current values, target             
                   allocations, and deviation from    
                   target.                            

  Rebalancing      Propose new target allocations.    Must have
  interface        System shows required trades.      
                   Submit to timelock queue.          

  Timelock queue   Pending changes with time          Must have
                   remaining. Cancel or execute when  
                   timelock expires.                  

  Macro indicator  Same indicator dashboard as        Must have
  monitor          investor view but with raw data    
                   values, threshold distances,       
                   historical trends.                 

  Phase 2 trigger  Real-time display of all trigger   Must have
  monitor          conditions. Manual override        
                   capability with multisig           
                   requirement.                       

  Fee management   Accrued fees display. One-click    Must have
                   claim to fee recipient wallet.     

  Fund-level P&L   Performance vs raw Bitcoin         Must have
                   benchmark. Performance vs 60/40    
                   benchmark. Inception and rolling   
                   periods.                           

  Position         Interface to execute trades on     Must have
  execution        Synthetix, dYdX to implement       
  interface        allocation changes.                

  Deposit /        Live view of all pending deposits  Must have
  redemption       and redemptions. Net flow          
  monitor          calculation.                       

  Alert system     Notifications for oracle           Should have
                   staleness, trigger threshold       
                   breach, large redemption requests, 
                   guardrail approach.                

  Audit log        Complete record of all manager     Must have
                   actions with timestamps.           
  ---------------- ---------------------------------- --------------------

**6. Smart Contract Architecture**

All contracts must use a proxy architecture to allow upgrades with
timelock governance. Working assumption: UUPS proxy standard (see
Section 8.6).

  ----------------------- ---------------------------------- --------------------
  **Contract**            **Purpose**                        **Status /
                                                             Priority**

  SPICEToken.sol          Single ERC-20 token with two-mode  Redesign required
                          mechanics. ETF mode (open          --- core, build
                          mint/burn). Investment trust mode  first
                          (mint closed, secondary market     
                          only). Algorithmic trigger         
                          switches modes. One-way switch:    
                          once closed, cannot reopen.        

  SPICEVault.sol          Holds all fund assets.             Prototype exists ---
                          Deposit/redeem in WBTC. NAV        major rework
                          calculation across all positions.  
                          Fee accrual. Manager guardrails.   
                          Connects to OracleAggregator and   
                          PositionManager.                   

  OracleAggregator.sol    Multi-source price feeds.          New --- build second
                          Chainlink primary, Pyth secondary, 
                          RedStone tertiary. Staleness       
                          checks. Deviation alerts. Circuit  
                          breaker if sources diverge         
                          \>threshold. Feeds NAV             
                          calculation.                       

  PositionManager.sol     Interface to Synthetix for bond    New --- DeFi
                          shorts, dYdX for currency shorts.  integration
                          Executes trades when manager       
                          updates allocations. Reports       
                          position values to vault.          

  RebalancingEngine.sol   Receives allocation targets from   New
                          manager. Calculates required       
                          trades. Executes via               
                          PositionManager. Gradual execution 
                          over 3--5 days to minimise         
                          slippage. Respects timelock and    
                          guardrails.                        

  TriggerOracle.sol       Monitors all macro indicators.     New --- critical
                          Evaluates Phase 2 trigger          path
                          conditions across three tiers.     
                          Executes mode switch when          
                          conditions met. Supports manual    
                          override with 4-of-7 multisig.     

  ProxyAdmin.sol          Upgrade governance. 48-hour        New --- required for
                          timelock on all upgrades. Multisig production
                          requirement. Full on-chain         
                          disclosure of proposed changes.    

  VestingVault.sol        Founder and advisor token vesting. New
                          4-year schedule, 1-year cliff.     
                          On-chain, publicly visible.        

  FeeDistributor.sol      Accrues management (1.5% annual)   New
                          and performance fees. High-water   
                          mark tracking. Quarterly accrual.  
                          Distributes to fee recipient       
                          wallet.                            
  ----------------------- ---------------------------------- --------------------

**6.1 Proxy Architecture --- UUPS (Working Assumption)**

Working assumption: UUPS (Universal Upgradeable Proxy Standard).
Rationale: lower ongoing gas cost than Transparent Proxy because upgrade
logic lives in the implementation contract rather than the proxy.
OpenZeppelin\'s currently recommended standard. Beacon Proxy is designed
for many instances of the same contract --- not applicable here. UUPS is
what most serious DeFi protocols built in the last two years are using.
Technical co-founder to confirm.

All upgrades require: 48-hour timelock, minimum 3-of-5 multisig, full
on-chain disclosure before timelock begins, investor dashboard
notification of pending upgrades. Prototype immutable contracts
acceptable for testnet only.

**6.2 Single Token Two-Mode Mechanics**

-   Mode flag in contract state: mintingOpen (bool).

-   deposit() and mint() functions check mintingOpen and revert if
    false.

-   redeem() functions available in Phase 1 only --- disabled in Phase
    2.

-   TriggerOracle.sol calls setMintingClosed() when trigger conditions
    are met.

-   setMintingClosed() is one-way --- once closed, minting cannot be
    reopened.

-   Mode switch emits a prominent on-chain event visible to all
    watchers.

**6.3 NAV Calculation**

NAV per SPICE = (Total Portfolio Value − Accrued Fees) / Total SPICE
Supply

Total Portfolio Value = sum of all position values converted to USD via
OracleAggregator, then expressed in WBTC terms for denomination
consistency.

Decimal precision requirements:

-   All internal calculations use 18 decimal places minimum.

-   WBTC (8 decimals) and price feeds (8 decimals) must be normalised
    before arithmetic.

-   Full audit of all decimal handling required --- current prototype
    has a known precision bug.

-   Edge case test suite required: minimum deposit, maximum deposit,
    extreme price movements, zero supply state.

**7. Oracle Architecture --- Working Assumption**

Working assumption confirmed following research into oracle provider
landscape:

  ---------------- ------------------------ ------------------------------
  **Tier**         **Provider**             **Rationale and Usage**

  Primary          Chainlink                Longest track record.
                                            Battle-tested on Base and EVM
                                            chains. Native integration
                                            with Synthetix. Conservative
                                            push-based model appropriate
                                            for a fund that values
                                            reliability over millisecond
                                            latency. Default for all major
                                            asset classes.

  Secondary        Pyth Network             Pull-based model. First-party
                                            data from major exchanges and
                                            trading firms. Strong coverage
                                            of FX and commodity asset
                                            classes. Confidence intervals
                                            useful for risk-aware logic.

  Tertiary         RedStone                 Fastest-growing oracle in
                                            2024-2025. Powers tokenised
                                            fund data for BlackRock BUIDL
                                            and Apollo --- relevant to
                                            Phase 2 RWA ambitions. Used as
                                            fallback and for asset classes
                                            where primary sources lack
                                            coverage.
  ---------------- ------------------------ ------------------------------

The OracleAggregator contract takes the median of available sources and
circuit-breaks if sources diverge by more than a defined threshold
(working assumption: 2% deviation triggers alert, 5% triggers circuit
breaker and pauses NAV-dependent operations).

**8. Working Assumptions --- Resolved from v3 Open Questions**

The following questions were flagged as open in v3. Working assumptions
have been recorded with rationale. The technical co-founder is invited
to confirm, challenge, or refine each.

**8.1 Phase 2 Redemption Mechanics --- Resolved**

  -----------------------------------------------------------------------
  *Resolution: Phase 2 has no protocol redemption at NAV. Secondary
  market only. The v3 NAV-floor redemption mechanism has been removed.
  See Section 1.3 for full rationale.*

  -----------------------------------------------------------------------

**8.2 Rebalancing Execution Model --- Working Assumption**

Working assumption: gradual rebalancing over 3--5 days, pace scaling to
fund size.

Rationale: for large positions in synthetic bond shorts on Synthetix,
hitting the market all at once moves price against the fund. Spreading
execution over several days minimises slippage at the cost of some
tracking error against target allocation. Standard institutional
practice for large position changes. The algorithm monitors execution
progress and can accelerate if macro conditions are moving fast.

Requires modelling by technical co-founder once AUM projections are
clearer.

**8.3 Synthetix Liquidity and Bond Short Entry --- Working Assumption**

Working assumption: bond short positions are entered progressively as
macro indicators breach alert thresholds, not sized at full allocation
from inception.

Rationale: trigger-based entry solves the liquidity depth problem by
spreading entry over time. It also avoids carrying costs on a large
short position years before it pays off. Proposed sizing schedule:

-   25% of target allocation at fund launch.

-   50% of target when two sovereign stress indicators breach alert
    thresholds.

-   100% of target when three indicators breach crisis thresholds.

Technical co-founder to assess Synthetix liquidity depth at meaningful
AUM. If insufficient, dYdX and other perpetuals protocols are the
overflow venue.

**8.4 Oracle Sources --- Working Assumption**

Resolved. See Section 7 for full oracle architecture. Working
assumption: Chainlink primary, Pyth secondary, RedStone tertiary.
Technical co-founder to confirm.

**8.5 Performance Fee Mechanics --- Confirmed**

Standard high-water mark mechanism confirmed. Mechanics:

-   NAV per SPICE recorded at end of each performance period
    (quarterly).

-   Performance fee charged only on gains above the previous high-water
    mark.

-   If NAV falls, no performance fee. High-water mark remains at prior
    peak.

-   Manager earns no performance fee again until NAV exceeds the prior
    peak.

-   Example: NAV 1.00 → 1.20 (fee on 0.20 gain) → falls to 1.10 (no fee)
    → rises to 1.25 (fee on 0.05 only --- the gain above 1.20 high-water
    mark).

-   High-water mark carries over from Phase 1 to Phase 2. Manager does
    not get a clean slate at switchover.

-   Benchmark: returns above a 60/40 portfolio benchmark. Accrued
    continuously by FeeDistributor.sol, claimable quarterly.

**8.6 Proxy Architecture --- Working Assumption**

Working assumption: UUPS proxy. See Section 6.1 for rationale. Technical
co-founder to confirm.

**8.7 Founder Token Structure --- Working Assumption**

Working assumption: two distinct token types. Investor SPICE tokens and
a separate Founder Management Token (provisional name: SPICE Management
Shares or SMS).

  -------------------------- --------------------------------------------
  **Token Type**             **Characterisation**

  Investor SPICE tokens      Represent a proportional claim on the NAV of
  \[ZPC\]                    the managed portfolio. Backed by vault
                             assets. Value tracks portfolio performance.
                             These are the tokens sold to the public.

  Founder Management Tokens  Represent a claim on the fee income stream
  \[SMS --- provisional\]    of the management business --- the 1.5%
                             annual management fee and performance fee
                             generated by the BVI entity. Economically
                             equivalent to equity in the fund management
                             company. Do not represent a claim on vault
                             assets. Do not dilute the asset backing of
                             investor SPICE tokens. Backed by future fee
                             income, not WBTC at inception.
  -------------------------- --------------------------------------------

Rationale: cleaner separation between fund participation (investors) and
business economics (founders). Investor tokens are fully asset-backed
from day one. Founder tokens represent the management business,
analogous to carried interest in a traditional fund. Legal vehicle for
founder tokens requires specialist advice from BVI counsel --- priority
item for initial legal engagement.

4-year vesting schedule, 1-year cliff for founders. VestingVault.sol.
On-chain and publicly visible.

**8.8 Geoblocking --- Working Assumption**

Working assumption: three-layer implementation.

-   Layer 1: Cloudflare WAF custom rules blocking US and UK IP
    addresses. Available on Cloudflare Enterprise plan (\~\$200/month).
    Configured via dashboard, straightforward to implement.

-   Layer 2: Frontend wallet-connect check. If connected wallet\'s IP is
    flagged as US or UK, display a \'not available in your region\'
    message before any interaction.

-   Layer 3: Terms of service attestation. Users confirm they are not US
    or UK persons before interacting with the protocol.

Known limitation: VPNs bypass IP-based geoblocking. This is universally
acknowledged in crypto legal practice. The standard is \'reasonable
steps taken,\' not \'perfect enforcement.\' Every serious DeFi protocol
uses this approach. Smart contract itself cannot be geoblocked ---
accepted and disclosed. UK legal counsel to confirm this standard
constitutes sufficient mitigation.

**8.9 Security Audit --- Working Assumption**

Working assumption: staged audit approach.

-   Stage 1 (pre real assets): Cyfrin or Hacken for initial production
    contracts. Estimated \$40--60k. Timeline: book 2--3 months in
    advance, most reputable firms have queues.

-   Stage 2 (pre public launch): Sherlock contest model for additional
    coverage on full contract suite. Estimated \$20--30k. 100--500
    independent researchers reviewing simultaneously.

-   Ongoing: bug bounty programme post-launch. Standard practice for
    protocols expecting meaningful TVL.

Total security budget before public launch: \$60--100k. Two-firm
approach is now standard for protocols expecting meaningful TVL. Trail
of Bits and OpenZeppelin are premium alternatives if budget allows.

Timeline: start audit firm conversations when Phase 2 production
contracts are feature-complete. Do not rush --- a security audit
conducted under time pressure is worth less than the paper it is printed
on.

**8.10 Phase 2 Trigger Definition --- Framework Agreed, Thresholds
Pending**

The trigger mechanism uses a three-tier framework. Exact threshold
values require a dedicated back-testing session before encoding in
TriggerOracle.sol.

  ------------- ---------------------------------- -------------------------
  **Tier**      **Conditions**                     **Logic**

  Tier 1 ---    All must be met. Sovereign stress  AND --- all three
  Mandatory     confirmed (at least one G7         mandatory conditions must
                sovereign bond market in genuine   be satisfied. Prevents a
                distress). Monetary debasement     single-category stress
                confirmed (M2 growth or central    event from triggering
                bank balance sheet expansion above Phase 2.
                threshold). Hard asset surge       
                confirmed (gold above defined      
                threshold).                        

  Tier 2 ---    Six or more of ten supporting      OR-majority --- breadth
  Majority      indicators in crisis territory.    and severity confirmed.
                Indicators span: sovereign bond    No single indicator can
                yields (US, JGB, BTP, gilt), money trigger Phase 2 alone.
                supply growth, Fed balance sheet,  
                gold/S&P ratio, Bitcoin price, US  
                unemployment, equity market        
                decline, investment grade credit   
                spreads.                           

  Tier 3 ---    4-of-7 multisig governance. For    Human override with high
  Qualitative   scenarios where reality has        governance bar and
  Override      clearly broken in ways             investor visibility.
                quantitative indicators don\'t     
                fully capture (e.g. stores ceasing 
                to accept USD). 7-day timelock     
                with full public disclosure before 
                activation.                        
  ------------- ---------------------------------- -------------------------

Back-testing requirement: trigger must NOT have fired during 2008
financial crisis, 2020 COVID shock, 2022 UK gilt crisis, or 1997 Asian
financial crisis. Those were cyclical crises within a functioning
system, not the structural sovereign debt and fiat credibility event the
thesis describes.

**8.11 Decimal Precision Bug --- Pre-Launch Blocker**

Current prototype mints incorrect token quantities due to decimal
normalisation error. Full audit of all decimal arithmetic required
before any real assets are involved. Edge case test suite must pass
before production deployment.

**8.12 Wallet X-Ray Standard --- Monitor**

Working assumption: monitor ERC-7540 and other emerging standards.
Implement when stable. Not a launch blocker.

**9. Portfolio Composition --- Included and Excluded Instruments**

The PositionManager contract should only be able to interact with
approved instrument types. This distinction must be reflected in the
smart contract architecture.

**9.1 Explicitly Excluded**

The contract must not be designed to hold or interact with:

-   TIPS and inflation-linked government bonds --- claims on the entity
    creating the problem.

-   Gold ETFs --- gold held within traditional custodian infrastructure.

-   Equity put options and VIX instruments --- hedge equity corrections,
    not sovereign debt crises.

-   Short-duration sovereign bonds --- lending to the entity inflating
    savings away.

**9.2 Included Instruments**

The contract must be designed to hold and interact with:

-   PAXG and XAUT --- tokenised physical gold, on-chain, not via ETF.

-   Synthetix synthetic positions --- direct shorts on JGB, BTP, gilt
    markets. Entry triggered progressively as macro indicators breach
    thresholds (see 8.3).

-   dYdX perpetual futures --- JPY short and other currency positions.

-   Tokenised commodity assets --- copper, uranium, silver, oil.

-   Synthetic equity positions --- AI infrastructure, semiconductors,
    data centres.

-   Sovereign rates volatility instruments --- MOVE-equivalent products
    as available on-chain.

**10. Development Roadmap**

**Phase 1 --- Prototype (Complete)**

-   Three smart contracts deployed on Base Sepolia testnet.

-   Core mechanics working: deposit, redeem, NAV calculation, fee
    accrual, manager guardrails.

-   Chainlink oracle integration (single feed, prototype quality).

-   31 automated tests passing on local network.

-   Demonstrates concept to technical co-founder.

**Phase 2 --- Production Foundation**

*Target: before any real assets are deposited.*

-   Single token architecture with two-mode mechanics --- SPICEToken.sol
    redesign.

-   UUPS proxy upgrade architecture with timelock governance.

-   Decimal precision audit and fix --- pre-launch blocker.

-   OracleAggregator.sol with Chainlink/Pyth/RedStone multi-source feeds
    and circuit breakers.

-   RebalancingEngine.sol with gradual execution, timelock, and
    guardrails.

-   Security audit Stage 1 (Cyfrin or Hacken).

-   Investor dashboard --- minimum viable version.

-   Manager dashboard --- minimum viable version.

**Phase 3 --- Full Portfolio**

*Target: before public launch.*

-   PositionManager.sol integration with Synthetix for bond shorts.

-   Currency short positions via dYdX.

-   TriggerOracle.sol with full three-tier macro indicator monitoring.

-   Algorithmic rebalancing with macro indicator triggers.

-   VestingVault.sol for founder and advisor allocations.

-   FeeDistributor.sol with high-water mark performance fee.

-   Full dashboard feature set including macro indicator display and
    Phase 2 liquidity warnings.

-   Security audit Stage 2 (Sherlock contest).

**Phase 4 --- Public Launch**

*Target: after legal architecture confirmed.*

-   BVI entity established and Approved Manager licence obtained.

-   UK legal opinion on founder\'s personal position obtained in
    writing.

-   Geoblocking implemented and legally reviewed.

-   Whitepaper published with full trigger mechanism disclosure and
    Phase 2 liquidity risk disclosure.

-   Aerodrome liquidity pool established for secondary trading.

-   On-chain KYC integration live.

-   Community and creator outreach.

**11. Working Assumptions for Technical Co-Founder**

These were open questions in v3. They are now recorded as working
assumptions with rationale. The technical co-founder is invited to
confirm, challenge, or refine each assumption. Where a working
assumption is wrong, we want to know early.

  --------------- ------------------------ -------------------------------
  **Topic**       **Working Assumption**   **Rationale / Open for
                                           Challenge**

  Proxy           UUPS proxy standard.     Lower gas cost than Transparent
  architecture                             Proxy. OpenZeppelin currently
                                           recommended standard. Most DeFi
                                           protocols built 2022+ use UUPS.
                                           Beacon not applicable (single
                                           vault, not many instances).

  Two-mode switch Simple boolean           Simplest implementation that
                  mintingOpen flag in      satisfies requirements. Boolean
                  contract state. One-way  sufficient for binary Phase
                  setter called by         1/Phase 2 transition. If
                  TriggerOracle.           architecture requires
                                           additional complexity,
                                           technical co-founder to advise.

  Bond short      Progressive sizing tied  Solves Synthetix liquidity
  entry           to macro indicator       depth risk by spreading entry.
                  thresholds. 25% at       Avoids carry costs years before
                  launch, 50% at two       payoff. Needs modelling against
                  alerts, 100% at three    Synthetix capacity at target
                  crisis thresholds.       AUM.

  Oracle sources  Chainlink primary, Pyth  Chainlink for reliability and
                  secondary, RedStone      EVM track record. Pyth for
                  tertiary. Median         FX/commodity coverage and
                  aggregation with 2%      first-party data. RedStone for
                  alert / 5% circuit       RWA feed capability. Technical
                  breaker.                 co-founder to assess coverage
                                           gaps.

  Rebalancing     Gradual over 3--5 days,  Minimises slippage on large
  execution       pace scaling to fund     synthetic positions. Standard
                  size.                    institutional practice. Needs
                                           modelling once AUM projections
                                           clearer.

  Development     No preference stated.    Technical co-founder to
  toolchain       Prototype built in Remix recommend Foundry vs Hardhat.
                  IDE (browser-based).     Foundry preferred by many
                  Hardhat also used.       serious DeFi teams for speed
                                           and testing quality.

  Security audit  Cyfrin or Hacken Stage 1 Staged approach appropriate for
                  (\$40--60k), Sherlock    current development phase.
                  contest Stage 2          Premium firms (Trail of Bits,
                  (\$20--30k).             OpenZeppelin) for consideration
                                           if budget allows. Technical
                                           co-founder may have firm
                                           relationships.

  Timeline for    No estimate made.        Scope: SPICEToken redesign,
  production      Requires technical       SPICEVault rework,
  foundation      co-founder assessment.   OracleAggregator,
                                           RebalancingEngine, UUPS proxy,
                                           decimal fix, MVP dashboards.
                                           Technical co-founder to
                                           estimate with token allocation
                                           proposal.
  --------------- ------------------------ -------------------------------

**12. Legal Architecture Reference**

The legal workstream is documented separately in SPICE Legal
Architecture v1.0. Key points relevant to technical implementation:

-   BVI Approved Manager structure confirmed as jurisdiction. \$15,000
    setup, \$11,500/year ongoing.

-   On-chain KYC mandatory for all token holders. SPICEVault.sol
    deposit() must check for valid KYC attestation before minting.
    Recommended providers: Synaps, Fractal ID, Quadrata.

-   Phase 2 liquidity risk (secondary market only, no protocol
    redemption) must be disclosed prominently in the investor dashboard
    before any deposit is accepted.

-   Geoblocking US and UK IP addresses via Cloudflare WAF. Terms of
    service attestation required. UK legal opinion to confirm
    sufficiency.

-   Founder Management Tokens (SMS) require separate legal vehicle ---
    priority item for BVI counsel engagement.

-   Communications architecture: YouTube channel discusses Spice as
    concept only. Substack discloses portfolio in Investors Chronicle
    model. Neither layer mentions ZPC or the fund. See Legal
    Architecture document Section 11 for full separation rules.

*SPICE \[ZPC\] --- Technical Requirements v4.0 --- February 2026*

*This document is for discussion purposes only. Not a financial
promotion or offer to invest.*
