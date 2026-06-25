**SPICE \[ZPC\]**

Legal Architecture & Regulatory Position

*Legal Workstream --- Version 1.0 --- February 2026 --- Confidential*

  -----------------------------------------------------------------------
  *This document sets out the legal architecture for the SPICE protocol,
  the regulatory position under applicable law, the specific mitigations
  adopted and what each achieves, and the residual risks that cannot be
  eliminated. It is a working document intended to brief legal advisers
  and inform structural decisions. It is not legal advice and does not
  substitute for specialist legal counsel, which is required before any
  public launch.*

  -----------------------------------------------------------------------

**1. What SPICE Is --- Honest Legal Characterisation**

Before examining the mitigations, it is necessary to state plainly what
SPICE is under existing law. Structural optimism is not a legal defence.

**1.1 Phase 1 --- Collective Investment Scheme**

In Phase 1, SPICE operates as a collective investment scheme under any
reasonable legal analysis:

-   Investors contribute capital (WBTC) to a pooled arrangement.

-   That capital is managed by a third party (the BVI entity) on their
    behalf.

-   Investors expect a return from that management activity.

-   Individual investors do not control the day-to-day management of the
    assets.

This description maps directly onto the legal definition of a collective
investment scheme in the UK (Financial Services and Markets Act 2000,
s.235), the US (Investment Company Act 1940), and the EU (AIFMD). The
fact that it operates on a blockchain, uses smart contracts, or
denominates in Bitcoin does not change what it is economically.

  -----------------------------------------------------------------------
  *The honest statement: SPICE Phase 1 is a collective investment scheme.
  Pretending otherwise in legal documents or investor communications is
  not a credible position and would not survive regulatory scrutiny. The
  correct approach is to acknowledge what it is and demonstrate that the
  structure, jurisdiction, and mitigations reduce the regulatory risk to
  a level comparable to functioning DeFi protocols that have operated
  successfully.*

  -----------------------------------------------------------------------

**1.2 Phase 2 --- Closed-Ended Investment Fund**

In Phase 2, when minting closes permanently and SPICE trades on
secondary markets only, the product transitions to something more
closely resembling a closed-ended investment trust or investment
company. The economic characteristics shift:

-   Fixed supply --- no new tokens can be issued.

-   No guaranteed redemption at NAV --- investors exit via secondary
    market only.

-   Price determined by supply and demand rather than anchored to NAV.

-   Management continues actively managing the underlying portfolio.

This structure is more analogous to a listed investment company
(Scottish Mortgage Investment Trust, for example) than to an open-ended
fund. The regulatory treatment differs from Phase 1 and requires
specific legal analysis at the point the trigger approaches.

**1.3 The Smart Contract Is Not a Legal Wrapper**

A common misconception in DeFi is that deploying on a blockchain creates
a regulatory exemption. It does not. Regulators assess the economic
substance of an arrangement, not its technical implementation. The SEC's
approach to DeFi has consistently been: if it walks like a security and
talks like a security, it is a security, regardless of whether it runs
on Ethereum.

The smart contract provides transparency and enforceability of the
mechanics. It does not provide regulatory exemption.

**2. Existing Precedents**

SPICE is not the first protocol to navigate this territory. The
following precedents inform the structure and provide evidence that
comparable arrangements have operated successfully, while being honest
about their limitations as analogies.

  ----------------- ------------------------ ------------------------------
  **Precedent**     **Relevance to SPICE**   **Limitations as Analogy**

  Index Cooperative Pooled crypto assets,    Purely crypto assets, no
  (INDEX)           managed allocation,      synthetic sovereign debt
                    tokenised basket.        positions. Less active
                    Cayman-adjacent          management than SPICE.
                    structure. Has operated  
                    without successful       
                    enforcement action.      

  Synthetix (SNX)   Manages synthetic asset  Governance-token model differs
                    exposure at significant  from SPICE's vault token. No
                    scale. Algorithmic and   direct investor capital
                    governance-based         pooling in the same sense.
                    management. Survived     
                    regulatory scrutiny to   
                    date.                    

  Cayman crypto     Numerous                 Most restrict access to
  funds             Cayman-domiciled crypto  accredited investors only,
  (institutional)   hedge funds with proper  limiting retail participation.
                    legal structure,         Higher compliance cost.
                    institutional investors, 
                    audited accounts. Clean  
                    precedent.               

  BVI Approved      Directly applicable. BVI Newer regime --- less case law
  Manager funds     Approved Manager regime  than Cayman. Requires genuine
                    used by smaller fund     management and control
                    managers globally. 4--6  offshore.
                    week licensing.          
                    Sub-\$400M AUM threshold 
                    fits Phase 1 lifecycle.  

  Grayscale (GBTC)  Demonstrates investor    Took the opposite approach ---
                    appetite for structured  full SEC registration. Not a
                    crypto exposure          DeFi protocol model. Too
                    vehicles. Ultimately     expensive and restrictive for
                    registered with SEC.     SPICE's design.
  ----------------- ------------------------ ------------------------------

  -----------------------------------------------------------------------
  *The honest conclusion from the precedent review: operating in the same
  regulatory grey zone as functioning DeFi protocols is a defensible
  position, not a reckless one. The grey zone exists because regulation
  has not kept pace with the technology. It will eventually be resolved
  --- either through enforcement action against specific protocols, or
  through new regulatory frameworks. SPICE's structure is designed to be
  on the defensible side of the grey zone, with genuine mitigations
  rather than wishful thinking.*

  -----------------------------------------------------------------------

**3. Jurisdiction and Entity Structure**

**3.1 Jurisdiction Selection --- BVI**

The British Virgin Islands is the confirmed working assumption for the
SPICE protocol entity. The Cayman Islands was the original target
jurisdiction; BVI has been identified as preferable for a solo innovator
at this stage for the following reasons:

  -------------------------- --------------------------------------------
  **Factor**                 **BVI Position**

  **Regulatory regime**      Approved Manager regime --- designed for
                             managers with AUM below \$400M.
                             Regulatory-light framework with 4--6 week
                             licensing timeline.

  **Cost**                   Approximately \$15,000 setup, \$11,500 per
                             year ongoing. Significantly more accessible
                             than Cayman equivalent.

  **Statutory basis**        Investment Business (Approved Managers)
                             Regulations. Established framework with
                             clear requirements.

  **Regulatory status**      Approved Manager designation provides
                             'Regulated Person' status --- meaningful
                             legal shield for a global automated fund.

  **AUM threshold**          Sub-\$400M threshold covers the entire Phase
                             1 lifecycle. Review required if AUM
                             approaches this level.

  **Cayman comparison**      Cayman recently implemented new rules that
                             increase compliance burden for the target
                             structure. BVI currently more suitable for
                             this stage.
  -------------------------- --------------------------------------------

**3.2 The BVI Entity Structure**

The following components are required to satisfy BVI Economic Substance
and Management and Control tests:

  -------------------------- --------------------------------------------
  **Component**              **Detail and Purpose**

  **BVI Business Company     Standard BVI corporation holding the
  (BC)**                     Approved Manager licence. This is the legal
                             entity that manages the fund and enters into
                             the Investment Advisory Agreement with the
                             UK founder.

  **Two-Director Rule**      Minimum two directors required. One must be
                             a BVI-resident professional director. This
                             ensures decisions are legally made outside
                             the UK, satisfying the Management and
                             Control test and reducing UK FSMA exposure
                             for the founder.

  **Authorised               BVI-resident person or firm acting as
  Representative**           liaison with the Financial Services
                             Commission. Typically provided by the
                             fiduciary firm as part of the service
                             package.

  **Money Laundering         Mandatory appointment for AML/KYC
  Reporting Officer (MLRO)** compliance. Typically outsourced to a BVI
                             fiduciary firm. Handles CARF reporting
                             obligations.

  **Registered Agent and     BVI-registered address and agent. Standard
  Office**                   requirement for all BVI companies.
  -------------------------- --------------------------------------------

**3.3 Estimated Costs**

  -------------------------- ------------------ -------------------------
  **Item**                   **Setup --- Year 1 **Annual Ongoing (USD)**
                             (USD)**            

  FSC Application and        \$3,000            \$1,800
  Licence Fees                                  

  BVI Company Incorporation  \$3,500            \$1,200

  Professional Director      \$4,500            \$4,500
  Services                                      

  Registered Agent and       \$2,000            \$2,000
  Office                                        

  AML / Compliance Support   \$2,000            \$2,000

  Total                      \$15,000           \$11,500
  -------------------------- ------------------ -------------------------

**3.4 Recommended BVI Fiduciary Firms**

The following Tier 1 BVI fiduciary firms are recommended for initial
scoping conversations before any commitment:

-   Harneys --- leading BVI offshore law firm, extensive crypto fund
    experience.

-   Ogier --- Tier 1 BVI and Cayman practice, strong crypto and DeFi
    track record.

-   O'Neal Webster --- BVI specialist, noted for Approved Manager
    applications.

Initial scoping calls with these firms are typically free. The BVI
information provided to date should be verified with one of these firms
before treating it as confirmed. Regulatory details and costs are
subject to change.

**4. The UK Founder's Personal Legal Position**

**4.1 The Core Risk**

The founder is UK-resident. Operating an unauthorised collective
investment scheme in the UK is a criminal offence under FSMA 2000 s.19
(the general prohibition) and s.235 (collective investment schemes). The
personal exposure is real and cannot be eliminated --- it can only be
managed through structural separation.

**4.2 The Investment Advisory Agreement Structure**

The primary mitigation for the founder's UK personal position is a
formal Investment Advisory Agreement between the founder (as UK Adviser)
and the BVI Entity (as Manager). Under this structure:

  -------------------------- --------------------------------------------
  **Role**                   **Activity and Legal Characterisation**

  **UK Adviser (founder      Provides research, signals, macro analysis,
  personally)**              and algorithm development. UK activity
                             characterised as Information and Software
                             Services. Does not make final investment
                             decisions. Does not manage client money.
                             Does not hold assets.

  **BVI Entity (the          Receives research and signals from UK
  Manager)**                 Adviser. Makes final decisions to execute
                             trades based on that research. Holds the
                             Approved Manager licence. Legally
                             responsible for investment management
                             decisions. Directors are BVI-resident.
  -------------------------- --------------------------------------------

This separation ensures that Management and Control is offshore. The
founder's UK activity --- writing algorithms, developing macro analysis,
maintaining the system --- falls within the research and software
services carve-out rather than constituting regulated investment
management activity.

  -----------------------------------------------------------------------
  *Critical: The advisory structure only works if the separation is
  genuine. If the founder is making the actual investment decisions and
  the BVI directors are rubber-stamping them, the separation fails both
  legally and regulatorily. The algorithmic, rules-based nature of the
  investment process is the strongest protection here --- if allocation
  decisions are genuinely made by the algorithm encoded in the smart
  contract, the question of who is 'deciding' becomes much less acute.*

  -----------------------------------------------------------------------

**4.3 Additional UK Personal Mitigations**

-   No UK marketing. No content targeting UK investors as a specific
    investment promotion. The two-track content strategy (macro thesis
    freely published; SPICE-specific investment content geoblocked to
    UK) must be strictly maintained.

-   Founder not a named director or officer of the BVI entity. The BVI
    professional directors formally control the Foundation. Founder's
    role is adviser, not manager.

-   Written UK legal opinion on file. A specialist UK financial services
    lawyer (FSMA 2000 scope) should provide a written opinion on the
    founder's personal position before launch. This is essential paper
    trail if enforcement ever arises. Estimated cost: £5,000--£15,000.

-   Genuine algorithmic decision-making. The more the allocation process
    is provably rules-based and encoded in the smart contract, the
    weaker the argument that an identifiable UK person is managing the
    fund.

**5. The Mitigations --- What Each Actually Achieves**

The following table sets out each structural mitigation, what it
reduces, and --- critically --- what it does not reduce. Honest
assessment of each mitigation's limits is essential for credible legal
positioning.

  ---------------- ------------------------ ------------------------------
  **Mitigation**   **What It Reduces**      **What It Does Not Reduce**

  BVI Approved     Creates a regulated,     Does not eliminate the
  Manager          licensed offshore        collective investment scheme
  structure        management entity.       characterisation. Does not
                   Reduces UK FSMA personal prevent US SEC long-arm
                   exposure significantly   jurisdiction if US investors
                   through genuine          participate.
                   structural separation.   

  Investment       Separates UK founder     Only works if separation is
  Advisory         activity (research,      genuine. Fails if founder is
  Agreement        software) from offshore  effectively making decisions
                   management activity. UK  with BVI directors
                   role is defensible as    rubber-stamping.
                   information services.    

  Algorithmic      Reduces the 'controlled  Does not eliminate the CIS
  investment       mind in the UK'          characterisation. The
  process          argument. If decisions   algorithm was written by
                   are made by encoded      someone --- that person could
                   rules, the regulatory    be characterised as the
                   question of who is       manager.
                   managing the fund looks  
                   fundamentally different. 

  US and UK        Demonstrates reasonable  VPNs bypass it. Determined
  geoblocking      steps to exclude US and  investors will access the
                   UK investors. Reduces    protocol regardless. Accepted
                   enforcement exposure     industry-wide as a legal
                   from the two most        defence, not a genuine
                   aggressive regulators.   technical barrier.

  No fiat on-ramps Removes many regulatory  Does not change the CIS
  or off-ramps     hooks authorities        characterisation. Does not
                   typically use (money     prevent CARF reporting
                   transmission, banking    obligations on the BVI entity.
                   regulation, AML triggers 
                   at fiat gateways).       

  On-chain KYC for Satisfies BVI AML/KYC    Adds friction to investor
  token holders    obligations.             onboarding. Affects anonymous
                   Demonstrates compliance  wallet participation. Personal
                   with VASP requirements.  data flows to HMRC via CARF.
                   Reduces FATF enforcement 
                   risk.                    

  Pseudonymous     Reduces personal         Does not eliminate exposure.
  founder at       regulatory exposure      Founder identity is known to
  launch           during legally sensitive BVI fiduciary and appears in
                   early phase. Standard    Approved Manager application.
                   DeFi practice with its   
                   own credibility in       
                   crypto community.        

  User disclosure  Demonstrates informed    Does not make an unlicensed
  and risk         consent. Reduces         activity licensed. Disclosure
  warnings         misrepresentation risk.  does not cure underlying
                   Confirms non-US/UK       regulatory status.
                   status. Required for any 
                   defensible legal         
                   position.                

  Cayman /         Places the fund entity   SEC long-arm jurisdiction is
  offshore         outside UK and US        real and does not respect
  domicile         primary jurisdiction.    offshore incorporation if US
                   Reduces direct           persons are participating or
                   regulatory reach.        targeted.
  ---------------- ------------------------ ------------------------------

**6. Regulatory Risk Register**

The following risks have been identified and require active management.
They are not ranked by probability but by consequence severity.

  ------------------ -------------------------- ---------------------------
  **Risk**           **Detail**                 **Mitigation Status**

  US SEC enforcement Long-arm jurisdiction.     Geoblocking, no US
                     SPICE tokens likely        marketing, no US persons in
                     satisfy Howey Test. SEC    founding team. Residual
                     has pursued offshore DeFi  risk: cannot prevent VPN
                     protocols. Risk elevated   access. Legal opinion
                     if any US persons          required.
                     participate.               

  UK FCA enforcement FSMA 2000 personal         BVI structure, advisory
                     exposure for UK-resident   agreement, algorithmic
                     founder. Unauthorised CIS  management, no UK
                     is criminal offence. Risk  marketing. Written UK legal
                     elevated by founder's UK   opinion essential before
                     residency.                 launch.

  BVI FSC compliance Failure to maintain        Outsourced compliance to
  failure            Approved Manager licence   BVI fiduciary firm. Annual
                     requirements --- MLRO,     compliance calendar.
                     KYC, CARF, annual returns  Ongoing cost budgeted at
                     --- results in licence     \$11,500/year.
                     revocation.                

  CARF reporting to  BVI CARF obligations mean  Disclosure to investors
  HMRC               transaction data flows     that transactions are
                     automatically to HMRC.     reported. UK tax advice
                     Founder's UK tax position  required for founder on
                     on advisory fee income     advisory income.
                     must be properly           
                     structured.                

  Collective         SPICE Phase 1 is a CIS     BVI licence, offshore
  Investment Scheme  under any reasonable       structure, geoblocking
  characterisation   analysis. Regulators in    reduce risk. Cannot be
                     multiple jurisdictions     eliminated. Comparable to
                     could take enforcement     risk profile of operating
                     action.                    Index Coop or similar.

  Smart contract     Exploits or bugs resulting Security audit required
  risk / investor    in investor losses create  pre-launch (\$50--100k).
  losses             both civil liability and   Ongoing bug bounty. Clear
                     regulatory attention. The  risk disclosure to
                     protocol's transparency    investors.
                     does not eliminate         
                     liability.                 

  Phase 2 trigger    Mandatory transition from  Full disclosure in
  and compulsory     ETF mode to Investment     whitepaper from day one.
  transition         Trust mode may require     Legal advice required on
                     investor consent or        smart contract mechanics
                     regulatory approval in     and investor consent
                     some jurisdictions.        framework.

  Founder identity   BVI Approved Manager       Accepted as necessary.
  disclosure         application requires       Pseudonymity is
                     founder CV, fit and proper public-facing, not
                     declaration. Founder       structural. Legal advice on
                     identity is known to BVI   implications.
                     fiduciary even if          
                     pseudonymous publicly.     
  ------------------ -------------------------- ---------------------------

**7. User Disclosure Framework**

Investor-facing disclosure must satisfy two purposes simultaneously: it
must be legally sufficient to demonstrate informed consent, and it must
be written in plain language that genuine investors will actually read
and understand. Disclosure that is buried in legalese achieves neither
purpose.

**7.1 Required Disclosures Before Wallet Connection**

Before any investor connects their wallet to the SPICE protocol, the
following must be prominently displayed and acknowledged:

-   SPICE is not authorised or regulated by the FCA, SEC, or any
    equivalent body. It operates under a BVI Approved Manager licence.

-   SPICE tokens are not protected by any investor compensation scheme
    (FSCS, SIPC, or equivalent).

-   Investing in SPICE involves significant risk of loss, including
    total loss of capital.

-   SPICE is not available to persons resident or located in the United
    States or United Kingdom. By connecting your wallet you confirm you
    are not a US or UK person.

-   SPICE tokens may constitute a security or collective investment
    scheme under the laws of your jurisdiction. You are responsible for
    ensuring your participation is lawful.

-   Smart contract risk: bugs or vulnerabilities could result in loss of
    funds. An independent security audit has been conducted but does not
    guarantee the absence of vulnerabilities.

-   Your transaction data will be reported to tax authorities in
    accordance with the Cryptoasset Reporting Framework (CARF).

**7.2 What the Product Is --- Plain Language**

The whitepaper and investor documentation must explain in plain
language:

-   Phase 1: you deposit WBTC and receive SPICE tokens representing a
    proportional share of a managed portfolio of hard assets and macro
    positions. You can redeem at any time for WBTC at the current NAV.
    The portfolio is managed algorithmically according to published
    rules.

-   Phase 2: when the published trigger conditions are met, minting
    closes permanently. SPICE becomes a fixed-supply token. You can no
    longer redeem at NAV --- you sell on secondary markets. The price
    may be above or below NAV depending on market conditions. Liquidity
    depends on secondary market depth.

-   The transition from Phase 1 to Phase 2 is mandatory and
    irreversible. You are aware of this when you participate in Phase 1.

-   The fund charges a 1.5% annual management fee and a performance fee
    on returns above the 60/40 benchmark. These are taken automatically
    by the smart contract.

  -----------------------------------------------------------------------
  *The Phase 2 liquidity risk must be disclosed with particular clarity.
  Unlike Phase 1, Phase 2 offers no guaranteed redemption at NAV. In a
  scenario where secondary market liquidity is thin and a holder needs to
  exit a large position, they may receive significantly less than NAV.
  This is a known and accepted characteristic of the closed-ended
  structure, not a product failure --- but investors must understand it
  before committing capital.*

  -----------------------------------------------------------------------

**7.3 On-Chain KYC Requirement**

All SPICE token holders must complete KYC verification before
depositing. The recommended implementation:

-   Integration with an on-chain KYC attestation provider (Synaps,
    Fractal ID, or Quadrata) that issues a verifiable credential to the
    investor's wallet address.

-   The SPICEVault.sol deposit function checks for a valid KYC
    attestation before minting. No attestation --- no deposit.

-   The attestation records that KYC has been completed without storing
    personal data on-chain. Personal data is held by the KYC provider
    and shared with the BVI MLRO as required.

-   Investors are informed at the start of the onboarding journey that
    KYC is required and that transaction data will be reported under
    CARF.

**8. Founder Token Structure --- Legal Characterisation**

**8.1 Two Distinct Token Types**

The product design working session identified that founder tokens should
be structured differently from investor SPICE tokens. The legal
architecture confirms this distinction and provides the rationale.

  -------------------------- --------------------------------------------
  **Token Type**             **Legal and Economic Characterisation**

  **Investor SPICE tokens**  Represent a proportional claim on the NAV of
                             the managed portfolio. Backed by the
                             underlying assets in the vault. Value tracks
                             portfolio performance. These are the tokens
                             sold to the public.

  **Founder tokens           Represent a claim on the fee income stream
  (provisional name: SPICE   of the management business --- the 1.5%
  Management Shares or       annual management fee and performance fee
  SMS)**                     generated by the BVI entity. Economically
                             equivalent to equity in the fund management
                             company, not participation in the fund. Do
                             not dilute the asset backing of investor
                             SPICE tokens. Do not represent a claim on
                             vault assets.
  -------------------------- --------------------------------------------

**8.2 Why This Structure Is Cleaner**

-   Investor SPICE tokens are fully asset-backed from day one. No
    confusion about what they represent.

-   Founder tokens are a separate instrument representing business
    economics. Analogous to carried interest or management company
    equity in a traditional fund structure.

-   The two instruments can be independently valued, independently
    transferred, and independently disclosed.

-   Founder tokens do not require WBTC backing at inception --- they
    represent future fee income, which is honest and consistent with
    startup equity practice.

The legal vehicle for founder tokens requires specialist advice. Options
include a simple equity arrangement within the BVI entity, a separate
token with SAFT structure, or a profit participation arrangement. This
is a priority item for the initial legal advisory engagement.

**9. Precedent Assessment --- Are We Inventing Something Impossible?**

This is the most important question to answer before proceeding. The
honest answer has three parts.

**9.1 The Structure Has Precedent**

BVI-domiciled fund management entities managing crypto assets under the
Approved Manager regime exist and operate. The advisory agreement
structure separating UK-based research from offshore management is used
by other UK-based participants in offshore fund structures. On-chain
pooled investment vehicles with algorithmic management exist (Index
Coop, Set Protocol, others). The combination of these elements in a
single structure is novel but composed of individually precedented
components.

**9.2 The Grey Zone Is Real But Navigable**

The honest statement is that SPICE operates in the same regulatory grey
zone as the majority of functioning DeFi protocols. That grey zone has
not been definitively resolved by regulation or enforcement. Protocols
operating in this space have done so successfully for years. The
mitigations described in this document reduce the risk to a level
comparable to these operating precedents.

**9.3 Legal Advice Is Not Optional**

No amount of structural analysis substitutes for specialist legal advice
before launch. The following engagements are required:

  -------------------------- --------------------------------------------
  **Legal Engagement**       **Scope and Priority**

  **UK financial services    Founder's personal FSMA 2000 exposure.
  specialist**               Advisory agreement structure. Two-track
                             content strategy compliance. Financial
                             promotion rules. Priority: obtain before any
                             public activity. Estimated cost:
                             £5,000--£15,000. Suggested firms: Mishcon de
                             Reya, Fieldfisher, Memery Crystal.

  **BVI fiduciary / legal    Approved Manager application and licence.
  adviser**                  BVI Business Company incorporation. MLRO
                             appointment. AML/KYC framework. CARF
                             compliance. Annual obligations. Priority:
                             obtain after UK opinion confirms structure
                             is defensible. Estimated cost: \$15,000
                             setup. Suggested firms: Harneys, Ogier,
                             O'Neal Webster.

  **Tokenomics and SAFT      Legal structure for founder tokens. SAFT
  counsel**                  agreements for early backers. Token sale
                             structure. Whitepaper disclosure
                             requirements. Priority: concurrent with BVI
                             engagement. Often provided by BVI firm as
                             part of overall mandate.

  **Phase 2 transition       Legal treatment of mandatory
  counsel**                  ETF-to-Investment-Trust transition. Investor
                             consent framework. Regulatory approval
                             requirements in relevant jurisdictions.
                             Priority: required as trigger approaches,
                             not at launch.
  -------------------------- --------------------------------------------

**10. The Residual Risk Statement**

  -----------------------------------------------------------------------
  *This section exists because a legal document that claims the structure
  eliminates all regulatory risk is not credible. The following risks
  cannot be eliminated by any structural mitigation and must be
  acknowledged honestly.*

  -----------------------------------------------------------------------

-   SPICE Phase 1 is a collective investment scheme under the laws of
    most jurisdictions. The BVI structure and algorithmic management
    reduce the enforcement risk but do not change the legal
    characterisation.

-   The SEC has demonstrated willingness to pursue offshore DeFi
    protocols where US persons participate. Geoblocking is a mitigation,
    not a guarantee. If US persons access SPICE via VPN and the SEC
    determines they have been harmed, enforcement action is possible
    regardless of offshore structure.

-   The UK FCA's approach to crypto assets marketed to UK retail
    investors is becoming more assertive. The founder's UK residency
    creates ongoing personal exposure that the advisory structure
    reduces but does not eliminate.

-   The regulatory environment is changing. Frameworks that are
    defensible today may be closed by legislation or enforcement action
    in 12--24 months. The legal architecture must be reviewed regularly
    and updated as the environment evolves.

-   A successful exploit resulting in investor losses could trigger both
    civil litigation and regulatory action regardless of the offshore
    structure. Security audit and ongoing bug bounty are not optional.

  -----------------------------------------------------------------------
  *The honest conclusion: SPICE is buildable, operable, and legally
  defensible with the right structure and advice. It is not risk-free,
  and anyone who tells you a DeFi protocol of this type is risk-free is
  either uninformed or dishonest. The mitigations described in this
  document represent the current best practice for reducing regulatory
  risk to an acceptable level --- comparable to the risk profile of
  protocols that have operated successfully in this space. That is the
  correct standard of comparison, and it is an achievable one.*

  -----------------------------------------------------------------------

**11. Communications Architecture --- The Three-Layer Structure**

The public communications strategy is not merely a marketing decision.
It is a structural legal protection. The separation between the three
layers must be maintained with absolute discipline. A single
communication that collapses the separation --- even inadvertently ---
undermines the legal architecture that the BVI structure and advisory
agreement are designed to create.

**11.1 The Three Layers**

  ----------- -------------------------- ---------------------------------
  **Layer**   **Description**            **Legal Characterisation**

  Layer 1     The Great Collision        Journalism and macro commentary.
  YouTube /   channel. Macro thesis,     Not a financial promotion. Not
  Public      dashboard indicators,      investment advice. Covered by
  Content     historical case studies,   journalist and commentator
              the zombie apocalypse      exemptions. Mandatory disclaimers
              thought experiment. Spice  on every piece of content.
              discussed as a concept and 
              post-crisis currency       
              property --- never as a    
              named coin or investable   
              instrument.                

  Layer 2     Portfolio details and      Financial publishing in the model
  Substack    analysis. The 'copy my     of Investors Chronicle. Publisher
              portfolio' subscription    discloses own portfolio.
              facility. Specific asset   Subscribers independently choose
              analysis and positioning.  whether to replicate. Not fund
              Never mentions ZPC, SPICE  management. Mandatory disclaimers
              the coin, or the offshore  required. May require review
              fund.                      under UK financial promotion
                                         rules.

  Layer 3 The The ZPC protocol and SPICE BVI Approved Manager licensed
  Offshore    token. BVI-licensed, hard  collective investment scheme.
  Fund        geoblocked for US and UK   Regulatory treatment governed by
              persons, full risk         BVI structure and geoblocking
              warnings on website.       framework described in sections 3
              Completely separated from  and 4 of this document.
              Layers 1 and 2 in all      
              public communications.     
  ----------- -------------------------- ---------------------------------

**11.2 The Spice Concept --- How It Works on YouTube**

The YouTube channel develops a specific intellectual argument about the
properties of post-crisis currency. This argument is the bridge between
the macro thesis and the Spice brand --- but it is a philosophical and
analytical bridge, never a promotional one.

The argument developed across the content arc:

-   Fiat currencies fail in sovereign debt crises because they are
    backed only by the credibility of the issuing government. When that
    credibility breaks, the currency breaks.

-   Bitcoin was designed to solve the fiat problem --- and it solves the
    centralisation and supply manipulation aspects. But Bitcoin fails
    the zombie apocalypse test for the same fundamental reason fiat
    fails it: it is backed only by collective belief. In a world where
    institutions have collapsed and trust in collective agreements has
    broken down, a belief system is not sufficient backing.

-   The ideal post-crisis currency has specific properties: it transmits
    digitally, it is self-custodied, it is divisible to any
    denomination, it cannot be inflated or confiscated, and ---
    crucially --- it is backed by something real. Real assets. Things
    that have value independent of any institution or collective
    agreement.

-   That instrument --- the channel calls it Spice, after the substance
    in Frank Herbert's Dune that the universe runs on --- does not yet
    exist in mature form. The channel tracks how close we are to the
    conditions that would make it necessary and what it would need to
    look like.

  -----------------------------------------------------------------------
  *The channel never says: 'and here is the coin you can buy.' It makes
  the intellectual argument so compellingly that the audience arrives at
  that conclusion independently. The distance between the concept and the
  instrument is the legal protection. It is also better content ---
  audiences trust conclusions they reach themselves far more than
  conclusions they are told.*

  -----------------------------------------------------------------------

**11.3 The Separation Rules --- Lines That Must Never Be Crossed**

The following rules must be treated as absolute. They are not
guidelines. Breaching any of them collapses the legal separation the
entire structure depends on.

  -------------------------- --------------------------------------------
  **Rule**                   **Rationale**

  **YouTube never mentions   The moment the YouTube channel becomes a
  ZPC, the SPICE token, or   promotional vehicle for a specific
  the offshore fund by       investable instrument, it becomes a
  name.**                    financial promotion. The journalist
                             exemption ceases to apply. The UK personal
                             legal position is immediately compromised.

  **Substack never mentions  The Substack's 'Investors Chronicle'
  ZPC, the SPICE token, or   characterisation depends on it being a
  the offshore fund.**       standalone publishing operation. Any
                             connection to the fund collapses that
                             characterisation and potentially constitutes
                             unlicensed promotion of a collective
                             investment scheme.

  **No explicit navigation   The audience journey from Layer 1 to Layer 3
  path from YouTube or       must be one the audience completes
  Substack to the fund       independently. No link, no QR code, no 'find
  website.**                 out more' that leads to the fund. The fund
                             is discoverable by those who search --- it
                             is not signposted from the content layers.

  **The YouTube presenter    Option B has been confirmed: thematic
  identity is kept separate  connection, structural separation. The
  from the fund manager      presenter is a macro commentator and
  identity.**                journalist. The fund manager is the BVI
                             entity. These are not publicly connected.

  **Financial promotion      Every YouTube video and every Substack post
  disclaimers on all Layer 1 carries: 'This is not financial advice. I am
  and Layer 2 content.**     not FCA regulated. Past performance is not a
                             guide to future performance. You may lose
                             capital. This content is for information and
                             entertainment purposes only.'

  **UK financial promotion   The 'copy my portfolio' facility requires
  rules reviewed before      specific legal review under the Financial
  Substack launch.**         Promotion Order 2005. The journalist and
                             non-real-time communication exemptions are
                             likely to apply but must be confirmed by UK
                             legal counsel before launch.
  -------------------------- --------------------------------------------

**11.4 The Content Arc --- Suggested Episode Structure**

The following content arc builds the intellectual framework across
episodes. Each episode stands alone as journalism. Together they walk
the audience to the conclusion that the Spice concept is the answer to
the question the thesis poses.

  ------------- --------------------- ------------------------------------------
  **Episode**   **Title and Theme**   **Content Notes**

  1             The Great Collision   Macro thesis in accessible form. Sovereign
                --- What It Is and    debt, AI deflation, the inflation
                Why It's Coming       response. No investment content. Pure
                                      journalism and analysis. Establishes the
                                      channel's credibility and intellectual
                                      seriousness.

  2             What Happened Last    Historical case studies. Weimar Germany,
                Time --- Currencies   Argentina, Zimbabwe, the Roman debasement.
                in Past Sovereign     What people actually used when fiat broke.
                Debt Crises           Gold, barter, foreign currency. Accessible
                                      history with contemporary relevance.

  3             The Zombie Apocalypse The thought experiment introduced. Walking
                Test --- What Would   through the properties of sound money.
                You Actually Want to  What survives institutional collapse. Gold
                Hold                  passes some tests, fails others. Bitcoin
                                      introduced as the digital attempt to solve
                                      the problem.

  4             The Bitcoin Problem   The backing argument developed fully.
                --- Why Crypto's      Bitcoin solves the centralisation and
                Answer Isn't the      supply manipulation problems. It does not
                Final Answer          solve the belief problem. In a world of
                                      genuine institutional collapse, a belief
                                      system without asset backing is fragile.
                                      Controversial, will drive debate and
                                      shares.

  5             What Would Actually   The positive case. What the ideal
                Work --- The          instrument looks like. Digital
                Properties of         transmission, self-custody, divisibility,
                Post-Crisis Currency  inflation resistance, and --- crucially
                                      --- real asset backing. The channel names
                                      this concept Spice. The Dune reference
                                      explained.

  6+            The Dashboard --- How Ongoing series tracking the macro
                Close Are We          indicators. Sovereign bond yields, money
                                      supply, gold price, unemployment, credit
                                      spreads. Each episode updates the picture.
                                      The dashboard becomes the channel's
                                      recurring feature and audience engagement
                                      mechanism.
  ------------- --------------------- ------------------------------------------

**11.5 The Dashboard as Recurring Content**

The macro indicator dashboard --- the same dashboard that drives the
TriggerOracle.sol in the smart contract --- becomes the channel's
recurring content engine. Every time an indicator moves materially, that
is a content moment.

-   A dashboard update video when any indicator breaches an alert
    threshold.

-   A monthly dashboard review episode tracking all indicators.

-   Deep-dive episodes on individual indicators as events warrant --- a
    JGB yield spike, a US M2 surge, a sovereign CDS move.

-   The dashboard is published openly on the SPICE website, but
    discussed on the channel as a macro analytical tool, not as a fund
    performance metric.

This creates a natural content rhythm that does not require the
presenter to manufacture topics. The macro environment generates the
content. The channel's job is to explain what the indicators mean and
why they matter --- which is genuine journalism.

**11.6 Substack --- The Investors Chronicle Model**

The Substack operates on the Investors Chronicle model: portfolio
disclosure and analysis, not fund management. The legal distinction is
critical and must be maintained in both the structure and the language
of every post.

  -------------------------- --------------------------------------------
  **Investors Chronicle      **Fund Management (Not Permitted)**
  Model (Permitted)**        

  **Publisher discloses      Manager invests subscriber money on their
  their own portfolio        behalf.
  positions.**               

  **Publisher explains the   Manager makes decisions on behalf of
  reasoning behind their own clients.
  positions.**               

  **Subscribers              Clients' assets are controlled by the
  independently decide       manager.
  whether to replicate.**    

  **Subscribers pay for      Clients pay fees on assets under management.
  access to content and      
  analysis.**                

  **Publisher bears their    Manager bears fiduciary duty to clients.
  own investment risk.**     

  **Content carries standard Activity requires FCA authorisation or
  financial promotion        exemption.
  disclaimers.**             
  -------------------------- --------------------------------------------

The 'copy my portfolio' facility must be structured as a content and
transparency feature, not a managed service. Subscribers see what the
publisher holds and why. They make their own independent decisions. The
language of every post must reinforce this: 'this is what I hold' not
'this is what you should buy.'

  -----------------------------------------------------------------------
  *Legal review required before Substack launch: UK counsel must confirm
  that the 'copy my portfolio' subscription model qualifies for the
  non-real-time communication exemption under the Financial Promotion
  Order 2005, and that the content does not constitute a collective
  investment scheme by another name. This is a relatively straightforward
  legal question but it must be answered in writing before the Substack
  goes live with paid subscriptions.*

  -----------------------------------------------------------------------

*SPICE \[ZPC\] --- Legal Architecture & Regulatory Position --- v1.0 ---
February 2026*

*This document is for discussion purposes only. It does not constitute
legal advice. Specialist legal counsel is required before any public
launch. Not a financial promotion or offer to invest.*
