"""
Forecast presentation data — what the people building the technology
predict about cost trajectories by category.

This is structured data, not a simulator. The numbers are synthesised from
the source-attributed research in `automation_forecasts.md`. Each cost-
index value is calibrated against the named source's stated prediction
(e.g. RethinkX 'cost falls 10x by 2030' becomes index 10 at year 2030).

Categories are deliberately heterogeneous: the bulls' thesis is NOT
'everything falls uniformly' but 'some things crash, services hold,
land RISES'. The chart should make this visible.
"""
from __future__ import annotations


FORECASTS = {
    "headline": "Within 10–20 years, almost everything except land approaches near-zero cost. Six independent voices say this. One sceptic dissents.",

    "quotes": [
        {
            "author": "Elon Musk",
            "role": "Tesla, xAI",
            "year": 2026,
            "quote": "In 10 to 20 years, work will be optional and money will be irrelevant. Universal high income — you can have whatever you want.",
            "source": "Fortune, Jan 2026",
            "source_url": "https://fortune.com/2026/01/19/when-does-elon-musk-say-work-will-be-optional-and-money-will-be-irrelevant-ai-robotics/",
        },
        {
            "author": "Sam Altman",
            "role": "OpenAI",
            "year": 2021,
            "quote": "The costs of intelligence and energy are going to be on a path towards near-zero. By 2030, it will become clear that the AI revolution and renewable+nuclear energy are going to get us there.",
            "source": "X / Twitter, Sep 2021",
            "source_url": "https://x.com/sama/status/1436028668082462748",
        },
        {
            "author": "Michael Saylor",
            "role": "Strategy",
            "year": 2025,
            "quote": "Automation and AI will drive a 100-fold rise in productivity. Investors have roughly 10 years to stake their claim in the new economy.",
            "source": "Peter McCormack Show, 2025",
            "source_url": "https://cryptobriefing.com/michael-saylor-automation-and-ai-will-drive-unprecedented-prosperity-the-dollars-7-annual-debasement-threatens-wealth-and-asset-ownership-is-crucial-for-financial-stability-the-peter-mccormack/",
        },
    ],

    "categories": [
        # Cost trajectories. cost_index is % of 2026 cost. Values synthesised
        # from named sources — see source_notes for which voice each anchors to.
        # ORDERED by 2045 cost ascending (most-deflated first), with LAND last.
        {
            "name": "Intelligence / digital",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  30, "anchor": "Altman: 'path to near-zero clear by 2030'"},
                {"year": 2035, "cost_index":  10, "anchor": "Altman: 'anyone in 2035 = 2025's brains for everyone'"},
                {"year": 2040, "cost_index":   3, "anchor": "Kurzweil: cloud-connected cognition"},
                {"year": 2045, "cost_index":   1, "anchor": "Singularity (Kurzweil)"},
            ],
            "color_class": "blue",
            "mechanism": "Compute on Wright's Law (20-30%/doubling). LLM inference cost already falling 10x/yr. Approaches utility pricing.",
            "sources": ["Altman", "Kurzweil"],
        },
        {
            "name": "Energy",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  50, "anchor": "Seba: solar+wind+battery cheaper than fossil everywhere"},
                {"year": 2035, "cost_index":  25, "anchor": "Altman: utility-priced"},
                {"year": 2040, "cost_index":  10, "anchor": "Diamandis: dial-tone-reliable"},
                {"year": 2045, "cost_index":   5, "anchor": "consensus near-zero"},
            ],
            "color_class": "ok",
            "mechanism": "Solar PV 20%/doubling Wright curve, batteries 18-35%/doubling. Storage solves intermittency. Energy as utility flat-fee.",
            "sources": ["Seba/RethinkX", "Altman", "Diamandis"],
        },
        {
            "name": "Transport",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  30, "anchor": "Seba: 95% of US miles in autonomous EV fleets, $1T/yr saved"},
                {"year": 2035, "cost_index":  15, "anchor": "Transport-as-Service dominant"},
                {"year": 2040, "cost_index":  10, "anchor": "Old transport gone"},
                {"year": 2045, "cost_index":   8, "anchor": "Free / TaaS"},
            ],
            "color_class": "ok",
            "mechanism": "EV cost decline + autonomous removes driver wages + fleet utilisation 10x. RethinkX: $1T/yr returned to US consumers by 2030.",
            "sources": ["Seba/RethinkX", "Musk"],
        },
        {
            "name": "Manufactured goods",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  60, "anchor": "Optimus at scale ($20-30K replacing $30-50K/yr labour)"},
                {"year": 2035, "cost_index":  30, "anchor": "Robots commodity"},
                {"year": 2040, "cost_index":  15, "anchor": "Materials cost only"},
                {"year": 2045, "cost_index":  10, "anchor": "Effectively free"},
            ],
            "color_class": "ok",
            "mechanism": "Tesla Optimus pays back vs human labour in <1 year. Robotic assembly + AI design + 3D printing. Bounded by raw materials.",
            "sources": ["Musk", "Diamandis"],
        },
        {
            "name": "Food (proteins)",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  50, "anchor": "Seba: proteins 5x cheaper; cattle bankrupt"},
                {"year": 2035, "cost_index":  30, "anchor": "35% cultivated meat (McKinsey)"},
                {"year": 2040, "cost_index":  20, "anchor": "Old food paradigm collapsed"},
                {"year": 2045, "cost_index":  15, "anchor": "Free / utility"},
            ],
            "color_class": "ok",
            "mechanism": "Lab-grown meat at $17/lb today, parity with conventional ($5/lb) by 2030. Vertical farms 80% less land, 90% less water.",
            "sources": ["Seba/RethinkX", "McKinsey", "Diamandis"],
        },
        {
            "name": "Education",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  60, "anchor": "AI tutors widespread"},
                {"year": 2035, "cost_index":  30, "anchor": "Best-university-equivalent at home, free"},
                {"year": 2040, "cost_index":  15, "anchor": "School institutions hollowed"},
                {"year": 2045, "cost_index":  10, "anchor": "Content delivery free; networking premium remains"},
            ],
            "color_class": "ok",
            "mechanism": "AI tutors deflate content delivery to ~zero. Networking and credentialing value sticky. Bottom-tier schools first to collapse.",
            "sources": ["Altman", "Diamandis"],
        },
        {
            "name": "Apparel",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  70, "anchor": "BLS already deflating, AI accelerates"},
                {"year": 2035, "cost_index":  50, "anchor": "Cheap, custom, on-demand"},
                {"year": 2040, "cost_index":  30, "anchor": "Manufacturing fully automated"},
                {"year": 2045, "cost_index":  20, "anchor": "Materials cost only"},
            ],
            "color_class": "ok",
            "mechanism": "BLS: apparel CPI -0.5%/yr in early 2026. Robotic textile + on-demand printing eliminates labour and inventory cost.",
            "sources": ["BLS observed", "Diamandis"],
        },
        {
            "name": "Food (general groceries)",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  80, "anchor": "Vertical farms scaling"},
                {"year": 2035, "cost_index":  60, "anchor": "Diamandis: dial-tone agriculture"},
                {"year": 2040, "cost_index":  40, "anchor": "Old farming fades"},
                {"year": 2045, "cost_index":  30, "anchor": "Mostly automated, land-rent fraction remains"},
            ],
            "color_class": "ok",
            "mechanism": "Vertical farming 80% less land, 90% less water. Slower than proteins because more land-bound for grains/produce.",
            "sources": ["Seba/RethinkX", "Diamandis"],
        },
        {
            "name": "Healthcare",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  90, "anchor": "McKinsey: 5-10% AI savings ($200-360B/yr)"},
                {"year": 2035, "cost_index":  70, "anchor": "Diamandis: 'Subscribe to organ function' model"},
                {"year": 2040, "cost_index":  50, "anchor": "Most diagnoses by AI"},
                {"year": 2045, "cost_index":  30, "anchor": "Personalised medicine cheap"},
            ],
            "color_class": "warn",
            "mechanism": "AI diagnostics + drug discovery + robotic surgery offset historical +4.5%/yr inflation. Aging demographics counter. Slowest of the deflators.",
            "sources": ["McKinsey", "Diamandis"],
        },
        {
            "name": "Services (hospitality, care)",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index":  80, "anchor": "First-wave service robots in fast food, hotels, basic care"},
                {"year": 2035, "cost_index":  50, "anchor": "Optimus-class robots in housekeeping, food prep, eldercare"},
                {"year": 2040, "cost_index":  25, "anchor": "Most service work robotic; humans for premium / specialty only"},
                {"year": 2045, "cost_index":  15, "anchor": "Service largely free at the floor; human-touch is luxury"},
            ],
            "color_class": "ok",
            "mechanism": "Reversed — Steve's view that services go mostly robotic. Optimus + dedicated kitchen/cleaning bots replace most service labour. Premium human-touch persists as luxury but the floor approaches free.",
            "sources": ["Musk (Optimus)", "consensus inference"],
        },
        {
            "name": "LAND",
            "today_index": 100,
            "checkpoints": [
                {"year": 2030, "cost_index": 140, "anchor": "Knoll-Schularick trajectory + abundance demand"},
                {"year": 2035, "cost_index": 200, "anchor": "Altman: 'inherently limited resources may rise'"},
                {"year": 2040, "cost_index": 280, "anchor": "Wealth chasing fixed supply"},
                {"year": 2045, "cost_index": 400, "anchor": "Major scarce resource of the abundance era"},
            ],
            "color_class": "crit",
            "mechanism": "Fixed supply. As everything else falls toward zero, abundance wealth bids up the only thing that can't be made more of. Knoll-Schularick: 80% of post-WWII house boom is LAND, not structures.",
            "sources": ["Altman (explicit)", "Knoll-Schularick (data)"],
        },
    ],

    "skeptic": {
        "author": "Daron Acemoglu",
        "role": "MIT, NBER",
        "year": 2024,
        "estimate": "Only 0.53–0.66% total TFP gain over 10 years from AI",
        "argument": "Only 20% of US labour tasks exposed; even fewer profitably automatable. Hulten's theorem applied to actual task-level cost savings. Bulls overestimate because early evidence is from easy-to-learn tasks; harder tasks deliver less.",
        "source": "NBER w32487, 2024",
        "source_url": "https://www.nber.org/papers/w32487",
    },

    "sources": [
        {"label": "Elon Musk on AI/work optional",
         "url": "https://fortune.com/2026/01/19/when-does-elon-musk-say-work-will-be-optional-and-money-will-be-irrelevant-ai-robotics/"},
        {"label": "Sam Altman — intelligence/energy near-zero",
         "url": "https://x.com/sama/status/1436028668082462748"},
        {"label": "Sam Altman — Three Observations",
         "url": "https://blog.samaltman.com/three-observations"},
        {"label": "Michael Saylor — automation prosperity",
         "url": "https://cryptobriefing.com/michael-saylor-automation-and-ai-will-drive-unprecedented-prosperity-the-dollars-7-annual-debasement-threatens-wealth-and-asset-ownership-is-crucial-for-financial-stability-the-peter-mccormack/"},
        {"label": "Diamandis — Solve Everything by 2035",
         "url": "https://metatrends.substack.com/p/how-we-get-to-abundance-by-2035-and"},
        {"label": "RethinkX / Seba — predictions",
         "url": "https://www.rethinkx.com/our-science/rethinkx-predictions"},
        {"label": "RethinkX — 2030 disruption press release",
         "url": "https://www.rethinkx.com/press-release/2021/8/4/new-report-disruptive-transformation-of-energy-transportation-and-food-systems-can-slash-90-of-carbon-emissions-by-2035-and-hit-net-zero-by-2040-1"},
        {"label": "Lab-grown meat cost parity by 2030",
         "url": "https://www.newsweek.com/lab-grown-meat-cost-drop-2030-investment-surge-alternative-protein-market-1835432"},
        {"label": "Tesla Optimus $20-30K target",
         "url": "https://standardbots.com/blog/tesla-robot"},
        {"label": "Knoll-Schularick — No Price Like Home",
         "url": "https://www.aeaweb.org/articles?id=10.1257%2Faer.20150501"},
        {"label": "Acemoglu — Simple Macroeconomics of AI",
         "url": "https://www.nber.org/papers/w32487"},
        {"label": "BLS — long-term price trends",
         "url": "https://www.bls.gov/opub/ted/2015/long-term-price-trends-for-computers-tvs-and-related-items.htm"},
    ],
}


# --- Unemployment forecasts ----------------------------------------------------
# Three scenarios — mainstream consensus, bull tech voices, skeptic.
# Each scenario gives unemployment % at four year-checkpoints.
UNEMPLOYMENT_FORECASTS = {
    "scenarios": [
        {
            "name": "Mainstream consensus (Goldman, McKinsey, WEF, Forrester)",
            "color_class": "blue",
            "checkpoints": [
                {"year": 2026, "unemployment_pct":  4.0, "anchor": "Current US unemployment rate"},
                {"year": 2030, "unemployment_pct":  6.5, "anchor": "Goldman: 6-7% workforce displaced; +0.6 ppt rate; Forrester: 6.1% jobs lost"},
                {"year": 2035, "unemployment_pct":  9.0, "anchor": "WEF: 12-14% workers transition occupations; net +78M jobs globally"},
                {"year": 2040, "unemployment_pct": 12.0, "anchor": "Continued automation but new task creation"},
                {"year": 2045, "unemployment_pct": 15.0, "anchor": "Mature AI economy; significant restructuring"},
            ],
            "interpretation": "Net job-positive (new tasks emerge). Transitional unemployment but no mass permanent displacement.",
        },
        {
            "name": "Bull / acceleration (Musk, Anthropic, RethinkX)",
            "color_class": "warn",
            "checkpoints": [
                {"year": 2026, "unemployment_pct":  4.0, "anchor": "Same starting point"},
                {"year": 2030, "unemployment_pct": 15.0, "anchor": "Musk: 12-15% workforce; Anthropic Balwit: 'most jobs obsolete in a few years'"},
                {"year": 2035, "unemployment_pct": 50.0, "anchor": "Musk: work effectively optional; Optimus at scale; sectoral collapse"},
                {"year": 2040, "unemployment_pct": 75.0, "anchor": "Most service + manual labour replaced; remaining work is creative/oversight"},
                {"year": 2045, "unemployment_pct": 90.0, "anchor": "Musk: 'work like playing sports or video game'; 'universal high income'"},
            ],
            "interpretation": "Rapid displacement; new tasks don't keep pace. UBI structurally necessary.",
        },
        {
            "name": "AXION projection (planning assumption)",
            "color_class": "crit",
            "checkpoints": [
                {"year": 2026, "unemployment_pct":  4.0, "anchor": "Current baseline"},
                {"year": 2030, "unemployment_pct": 30.0, "anchor": "Digital wave: ~85% of knowledge work (coders, advisers, illustrators, analysts) displaced"},
                {"year": 2035, "unemployment_pct": 80.0, "anchor": "Services + manual waves: humanoid robots at scale; 85% of today's jobs gone"},
                {"year": 2040, "unemployment_pct": 85.0, "anchor": "Management thinning begins; long-tail roles fade"},
                {"year": 2045, "unemployment_pct": 88.0, "anchor": "Of today's jobs ~12% remain (human-touch/craft); new emergent categories absorb some displaced"},
            ],
            "interpretation": "Faster than the public bull voices. AXION colonies plan for this case: ~85% of today's jobs gone by 2035, compressed timeline from sequential waves (digital → services + manual → management long tail). This is the design case for AXION architecture.",
        },
        {
            "name": "Skeptic (Acemoglu)",
            "color_class": "dim",
            "checkpoints": [
                {"year": 2026, "unemployment_pct":  4.0, "anchor": "Same starting point"},
                {"year": 2030, "unemployment_pct":  4.5, "anchor": "Only 20% of tasks exposed; even fewer profitably automatable"},
                {"year": 2035, "unemployment_pct":  5.0, "anchor": "TFP gain only 0.5-0.7% over decade; modest displacement"},
                {"year": 2040, "unemployment_pct":  5.5, "anchor": "Hard-to-learn tasks slow further automation"},
                {"year": 2045, "unemployment_pct":  6.0, "anchor": "AI hype overdone; most workers still employed"},
            ],
            "interpretation": "AI is a normal technology shock — modest impact, similar to past automation waves. UBI not urgent.",
        },
    ],
    "sources": [
        {"label": "Goldman Sachs — How Will AI Affect the US Labor Market",
         "url": "https://www.goldmansachs.com/insights/articles/how-will-ai-affect-the-us-labor-market"},
        {"label": "WEF Future of Jobs Report 2025",
         "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/"},
        {"label": "Forrester — AI and Automation Will Take 6% of US Jobs by 2030",
         "url": "https://www.forrester.com/blogs/ai-and-automation-will-take-6-of-us-jobs-by-2030/"},
        {"label": "Anthropic — Labor Market Impacts of AI",
         "url": "https://www.anthropic.com/research/labor-market-impacts"},
    ],
    "workforce_composition": {
        "title": "Today's jobs displaced by 2035",
        "intro": (
            "Past automation waves (steam, electricity, computing) hit physical "
            "labour first while knowledge work expanded. AI inverts the order: "
            "knowledge work is being displaced FIRST, services and manual labour "
            "follow together when humanoid robotics scale (Optimus-class, ~2030). "
            "Each category loses ~85% of its workers under this trajectory — "
            "could be 75% or 90%, outcome is basically the same."
        ),
        "categories": [
            {
                "name": "Management",
                "share_pct_low": 8,
                "share_pct_high": 10,
                "examples": "Executives, supervisors, project leads, ops managers",
                "ai_exposure_now": "Low-medium — decisions and relationships resist automation; routine reporting and scheduling automatable",
                "robotics_exposure": "Low — judgment and accountability roles persist",
                "displacement_window": "2040+ (long tail)",
                "color_class": "ok",
            },
            {
                "name": "Digital / knowledge work",
                "share_pct_low": 25,
                "share_pct_high": 30,
                "examples": "Coders, accountants, illustrators, analysts, lawyers, copywriters, admin support, B2B account managers",
                "ai_exposure_now": "HIGH — happening now. STEM, writing-intensive, analytical domains show highest exposure (Anthropic Economic Index)",
                "robotics_exposure": "Already digital — full LLM / agent substitution",
                "displacement_window": "2026-2030 (the wave we're in)",
                "color_class": "crit",
            },
            {
                "name": "Service work",
                "share_pct_low": 35,
                "share_pct_high": 40,
                "examples": "Food prep, retail sales, hospitality, personal care, teachers, doctors / nurses / therapists, healthcare support, cleaning",
                "ai_exposure_now": "Low for software-AI — physical presence and emotional labour resist current models",
                "robotics_exposure": "Rising as Optimus-class humanoid robots scale",
                "displacement_window": "2030-2035 (next wave)",
                "color_class": "warn",
            },
            {
                "name": "Manual labour",
                "share_pct_low": 22,
                "share_pct_high": 25,
                "examples": "Construction, drivers, production, maintenance, agriculture",
                "ai_exposure_now": "Low for software-AI",
                "robotics_exposure": "Rising as autonomous vehicles and industrial robotics scale",
                "displacement_window": "2030-2035 (same window as services)",
                "color_class": "blue",
            },
        ],
        "displacement_pct": 85,
        "transition_gap": (
            "85% displacement does NOT mean 85% permanent unemployment. Many "
            "displaced workers will find new work in emergent categories that "
            "don't yet exist — AI supervision, premium human-touch service, "
            "novel craft, community and relational roles, AI-curated experience "
            "design. (60% of 2025 jobs didn't exist in 1940.) AXION's role is "
            "to handle the TRANSITION GAP — supporting people during the period "
            "between losing their old role and finding the new one — and "
            "provide UBI as a permanent floor for those for whom no replacement "
            "role emerges."
        ),
        "sources": [
            {"label": "BLS Occupational Employment and Wage Statistics 2024",
             "url": "https://www.bls.gov/oes/tables.htm"},
            {"label": "Anthropic Economic Index — March 2026",
             "url": "https://www.anthropic.com/research/economic-index-march-2026-report"},
        ],
    },
    "displacement_evidence": {
        "intro": (
            "Cost ratios for AI tools versus human labour, in 2026. Sources cited "
            "where available; ranges given to reflect uncertainty between "
            "peak-scenario (knowledgeable user, well-defined task) and typical-team "
            "use. Caveat below explains why most figures are conservative."
        ),
        "caveat": (
            "These are productivity ratios with cited sources, not full-replacement "
            "ratios. The bull intuition that 'one architect with Claude Code replaces "
            "a 13-person business-software team' may well be true at the OUTPUT level — "
            "the AI is capable — but the rate-limits and context window of a $90 Pro "
            "subscription likely cannot sustain that workload; heavy use needs Max 20× "
            "($200/mo) or API access at higher cost. So the ratios below reflect "
            "**what existing studies and case data actually demonstrate**, not "
            "extrapolations. Five other roles (content, illustration, translation, "
            "legal review, data entry) were dropped from this table because no "
            "rigorous evidence was available — the displacement is happening but the "
            "magnitude isn't measured."
        ),
        "examples": [
            {
                "role": "Software engineering",
                "ai_cost_per_month": 90,
                "human_cost_per_month": 4_500,
                "human_baseline": "Productivity uplift on 1 senior engineer (~$108K/yr); $90 enables ~1.5-1.8× output, replaces ~half a dev's cost",
                "cost_ratio": 50,
                "evidence": "Anthropic's own engineers (Aug 2025 internal study, 132 engineers + 53 interviews + 200K transcripts): 50% average productivity gain; 67% increase in merged PRs per engineer per day after Claude Code rollout. GitHub Copilot peer-reviewed (Microsoft Research / arXiv 2023): 55.8% faster on controlled coding task, 95% CI [21%, 89%].",
                "source_url": "https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic",
                "secondary_url": "https://arxiv.org/abs/2302.06590",
                "note": "Anthropic's data measures their OWN frontier-research engineering — the hardest case for AI. For typical enterprise CRUD the productivity gain is likely much higher (the patterns are well-trodden) but I have no rigorous study to cite, so this row stays at the conservative measured number. The bull case for software is real; this row is its FLOOR.",
            },
            {
                "role": "Customer service",
                "ai_cost_per_month": 200,
                "human_cost_per_month": 4_000,
                "human_baseline": "Hybrid model: AI handles 60-70%, humans handle complex 30-40%",
                "cost_ratio": 20,
                "evidence": "Klarna 2024: AI handled 2.3M conversations in first month, equivalent to 700 full-time agents. $40M annual savings projected at announcement. PARTIALLY REVERSED 2025 — customer satisfaction dropped on complex cases; humans rehired for edge cases. Stable hybrid (~67% AI / 33% human) is the actual deployment a year later.",
                "source_url": "https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/",
                "secondary_url": "https://www.digitalapplied.com/blog/klarna-reverses-ai-layoffs-replacing-700-workers-backfired",
                "note": "Initial pure-replacement attempt failed on quality. The hybrid is what worked. Real headcount savings ~50%, not 100%. Cautionary tale: AI can match volume but not always quality on complex/emotional cases.",
            },
            {
                "role": "Financial advice / planning",
                "ai_cost_per_month": 40,
                "human_cost_per_month": 4_500,
                "human_baseline": "1% AUM on $500K portfolio ÷ 12 (~$5K/yr)",
                "cost_ratio": 113,
                "evidence": "ChatGPT consumer adoption: 300M+ weekly active users by late 2025 — many querying it on personal finance instead of booking IFA appointments. Robo-advisers (Wealthfront, Betterment): AUM grew 5× since 2022 to ~$80B+. Vanguard Personal Advisor and similar AI-augmented services serve millions. UK FCA 2025 statements noted material decline in High-Street IFA usage among under-50s.",
                "source_url": "https://www.fca.org.uk/publications/policy-statements",
                "secondary_url": None,
                "note": "Observed market behaviour, not a peer-reviewed productivity study. The displacement is real and large — peer review lags by years. Human advisers are retreating to high-net-worth and emotional/behavioural counselling.",
            },
        ],
        "macro_summary": (
            "Anthropic Claude Code revenue: $1B annualised (Nov 2025), ~$2B (Jan 2026). "
            "Anthropic Economic Index (March 2026): 4% of jobs use AI for 75%+ of tasks; "
            "augmentation 52% > automation 45%. The three rows above are what is "
            "actually MEASURED in 2026. The bull intuition — that displacement is much "
            "larger and broader than these rigorous numbers suggest — may well be right, "
            "but the table doesn't claim numbers it can't back."
        ),
        "axion_implication": (
            "Even at the conservative measured ratios shown above, capital-share-of-AI-"
            "gains is heavily skewed: Anthropic captures ~$90/user/month, customers "
            "capture ~50× that in displaced wage cost. Multiplied across millions of "
            "users, the founder-class capture is real and growing. It is the levy base "
            "that the AXION synthesis depends on."
        ),
    },
}

# --- Profitability forecasts ---------------------------------------------------
# The Acemoglu/Restrepo three-way split: who captures AI productivity gains?
# - CAPITAL (margins expand) - CONSUMER (prices fall) - LABOR (new higher-paid tasks)
PROFITABILITY_FORECASTS = {
    "framework": (
        "Acemoglu-Restrepo task-based model: AI productivity gains are distributed "
        "across three claimants — capital (margins expand), consumer (prices fall), "
        "or labour (new tasks emerge at higher wages). The three scenarios below "
        "describe how the EXTERNAL economy may evolve. See the AXION insulation "
        "panel below — internally, the colony's pegged basket means citizens "
        "experience price stability regardless of which scenario plays out."
    ),
    "scenarios": [
        {
            "name": "AXION projection (capital-extreme, planning case)",
            "capital_pct": 75,
            "consumer_pct": 20,
            "labor_pct": 5,
            "anchor": "Most aggressive capital capture. Automation winners take outsize share; labour share collapses near-zero; consumers benefit through cheaper goods but slowly. This is what AXION colonies plan for.",
            "axion_implication": "Largest levy pool. Margins expand toward 50%+. Founder-class capture concentrated. AXION math closes earliest under this scenario — MS1 around 2032, MS2 by 2038.",
            "color_class": "crit",
        },
        {
            "name": "Capital-heavy capture (current US trajectory)",
            "capital_pct": 60,
            "consumer_pct": 25,
            "labor_pct": 15,
            "anchor": "Restrepo (Yale): half of labor share decline since 1980s from automation. McKinsey: $2.6-4.4T/yr to corporate profits.",
            "axion_implication": "Profit pool grows substantially. Levy capacity high. UBI obligation stays high (prices fall slowly). Both scale up together.",
            "color_class": "warn",
        },
        {
            "name": "Consumer-heavy capture (competitive markets)",
            "capital_pct": 20,
            "consumer_pct": 65,
            "labor_pct": 15,
            "anchor": "Bull thesis: prices crash 85% by 2045 means consumer captures most gains. Profit pool grows modestly in $. Margins flat-to-slightly-up.",
            "axion_implication": "Levy pool small in $. But UBI obligation also collapses (basket falls 85%). Both small together. Math closes IF trajectories align.",
            "color_class": "ok",
        },
        {
            "name": "Labor-rebalanced (new tasks emerge fast)",
            "capital_pct": 30,
            "consumer_pct": 30,
            "labor_pct": 40,
            "anchor": "Acemoglu's 'new task creation' channel; historical pattern (60% of 2025 jobs didn't exist in 1940).",
            "axion_implication": "Wages grow with AI. UBI less urgent — most citizens still employed at higher real wages. Levy from corporate profit modest but adequate for residual welfare.",
            "color_class": "blue",
        },
    ],
    "key_data_points": [
        {"label": "AI's potential annual global corporate profit boost (McKinsey, 2023)", "value": "$2.6–4.4 trillion"},
        {"label": "AI's potential industry profitability uplift by 2035 (Accenture, 2017)", "value": "Avg +38% across 16 industries"},
        {"label": "AI productivity contribution to global GDP over 10 years (Goldman/Briggs-Kodnani, 2023)", "value": "+7%"},
        {"label": "BoA projection: AI margin uplift over 5 years", "value": "+2 percentage points"},
        {"label": "Labor share of US national income (1980 → 2024)", "value": "65% → 56% (declined 9 pp)"},
        {"label": "Restrepo (Yale): share of labor decline attributable to automation", "value": "≈50%"},
    ],
    "sources": [
        {"label": "Acemoglu-Restrepo — Tasks, Automation and the Rise in US Wage Inequality (Econometrica 2022)",
         "url": "https://economics.mit.edu/sites/default/files/2022-10/Tasks%20Automation%20and%20the%20Rise%20in%20US%20Wage%20Inequality.pdf"},
        {"label": "Acemoglu — Simple Macroeconomics of AI (NBER 2024)",
         "url": "https://www.nber.org/papers/w32487"},
        {"label": "McKinsey — AI could increase corporate profits by $4.4T/yr",
         "url": "https://www.mckinsey.com/mgi/overview/in-the-news/ai-could-increase-corporate-profits-by-4-trillion-a-year-according-to-new-research"},
        {"label": "Accenture — AI 38% profitability uplift by 2035",
         "url": "https://newsroom.accenture.com/news/2017/accenture-report-artificial-intelligence-has-potential-to-increase-corporate-profitability-in-16-industries-by-an-average-of-38-percent-by-2035"},
        {"label": "Economy.ac — Corporate Profits Surge While Labor's Share Shrinks",
         "url": "https://economy.ac/news/2026/02/202602287973"},
    ],
    "axion_insulation": {
        "title": "Why this debate is insulated from AXION — the basket peg",
        "summary": (
            "The capital-vs-consumer-vs-labour debate is about who captures AI "
            "productivity gains in the EXTERNAL fiat economy. AXION is a parallel "
            "economy whose internal currency (MOND) is pegged to the basket. "
            "Citizens pay the same number of MOND for the same goods, year after "
            "year, regardless of external profit-share dynamics."
        ),
        "mechanism": [
            ("Basket definition", "A fixed composition of essential goods and services (food, energy, transport, structure-rent, etc.). Composition is set; quantities are pegged."),
            ("MOND peg", "1 basket-unit = 1 MOND. The peg is maintained by Fisc reserves, not market arbitrage. Citizens experience stable prices in S regardless of USD volatility."),
            ("USD pass-through", "When external prices fall (consumer-capture scenario), the USD value of an MOND rises. When external prices rise (capital-capture), MOND's USD value falls. The colony absorbs the FX volatility; the citizen does not."),
            ("Levy in MOND", "Levy is collected on internal S-denominated transactions. Levy revenue in S is a function of internal commerce, not external macro split."),
            ("UBI in MOND", "UBI obligation in S is fixed by basket × multiplier × citizens. Stable internally regardless of which external scenario plays out."),
        ],
        "implication": (
            "The three scenarios above tell us what to expect in the OUTSIDE world "
            "and inform inter-colony trade pricing. Inside the colony, daily life "
            "is shielded by design. This is the central reason a parallel economy "
            "exists at all — to provide stability that the external fiat system, "
            "amid AI-driven price disruption, cannot guarantee."
        ),
    },
    "political_economy": {
        "title": "Why capital pays the levy — the Henry Ford insight",
        "tension": (
            "Capital owners will fight to retain margins. They'll lobby against tax, "
            "relocate operations, optimise for evasion. The naïve view of the AXION "
            "levy treats it as adversarial — capital vs colony, zero-sum."
        ),
        "alignment": (
            "The deeper truth: capital cannot realise its margins without consumers. "
            "Automation eliminates the wage channel that historically funded consumer "
            "demand. Without an alternative, capital faces a customer-base extinction "
            "event — high margins on zero sales is zero profit. The levy is what "
            "keeps the consumer base solvent."
        ),
        "precedent": (
            "Henry Ford, 1914: paid $5/day (double prevailing wage) so his own workers "
            "could afford the cars he was producing. Not philanthropy — pure capital "
            "preservation. The AXION levy is the same idea at societal scale: capital "
            "funds the income that funds its own revenues."
        ),
        "design_implication": (
            "AXION's cost-neutral MS1 design lowers the political cost of switch-on — "
            "the State loses nothing because AXION just takes over existing welfare "
            "obligations. Once that channel is open, scaling toward MS2 becomes a "
            "growth conversation, not a tax conversation. Capital prefers a managed "
            "levy over: civil unrest, mass policy intervention, or revolution."
        ),
        "key_quote": {
            "text": "It is not the employer who pays the wages. Employers only handle the money. It is the customer who pays the wages.",
            "author": "Henry Ford, 1922",
        },
        "axion_principle": (
            "The AXION levy is not a tax ON capital — it is a service fee FOR ACCESS "
            "to consumers whose income capital itself ultimately funds. Reframed this "
            "way, capital's rational stance is to support the levy, not resist it."
        ),
    },
}


# Basket weights — share of a typical year's household spending allocated
# to each forecast category. Excludes LAND (out of scope per Steve, handled
# by the separate company-equity wealth-building model).
# Shares sum to 100%.
BASKET_WEIGHTS = {
    "Intelligence / digital":          3.0,   # streaming, apps, cloud, software
    "Energy":                         10.0,   # utilities, fuel
    "Transport":                      12.0,   # fuel, vehicles, services
    "Manufactured goods":             18.0,   # incl housing structure (durable goods)
    "Food (proteins)":                 8.0,   # meat, fish
    "Education":                       5.0,
    "Apparel":                         4.0,
    "Food (general groceries)":       17.0,   # produce, packaged, staples
    "Healthcare":                      8.0,
    "Services (hospitality, care)":   15.0,
    # LAND deliberately excluded — separate model.
}


def compute_basket_trajectory() -> list:
    """Aggregate the categorical forecasts into a single basket cost trajectory.

    Each year's basket cost = sum across categories of (weight × cost_index).
    Cost index is in % of 2026 cost; basket trajectory is also in % of 2026.
    """
    cats_by_name = {c["name"]: c for c in FORECASTS["categories"]}
    years = [2026, 2030, 2035, 2040, 2045]

    # Confirm basket weights sum to 100
    total_weight = sum(BASKET_WEIGHTS.values())
    if abs(total_weight - 100.0) > 0.01:
        raise ValueError(f"Basket weights sum to {total_weight}, expected 100")

    trajectory = []
    for year in years:
        basket_index = 0.0
        for name, weight in BASKET_WEIGHTS.items():
            cat = cats_by_name.get(name)
            if cat is None:
                raise ValueError(f"Forecast category '{name}' not found")
            if year == 2026:
                cost_index = cat["today_index"]
            else:
                checkpoint = next(cp for cp in cat["checkpoints"] if cp["year"] == year)
                cost_index = checkpoint["cost_index"]
            basket_index += (weight / 100) * cost_index
        trajectory.append({"year": year, "cost_index": round(basket_index, 1)})
    return trajectory


# Compute and attach the basket trajectory at module load time
FORECASTS["basket_weights"] = BASKET_WEIGHTS
FORECASTS["basket_trajectory"] = compute_basket_trajectory()
FORECASTS["unemployment"] = UNEMPLOYMENT_FORECASTS
FORECASTS["profitability"] = PROFITABILITY_FORECASTS


# --- AXION projection (more aggressive than bull) ---------------------------
# Compressed timeline: 95% deflation by 2045 vs ~85% under research-aggregate.
# Reflects the AXION planning assumption — design case for colony architecture.
AXION_BASKET_TRAJECTORY = [
    {"year": 2026, "cost_index": 100.0},
    {"year": 2030, "cost_index":  35.0},
    {"year": 2035, "cost_index":  15.0},
    {"year": 2040, "cost_index":   8.0},
    {"year": 2045, "cost_index":   5.0},
]
FORECASTS["axion_basket_trajectory"] = AXION_BASKET_TRAJECTORY


# --- Synthesis: when do MS1 and MS2 land under these forecasts? -----------------
# Takes the basket trajectory + an unemployment scenario + a profitability
# scenario and computes the year AXION becomes welfare-capable (MS1) and full-
# UBI-capable (MS2). The math is deliberately closed-form here — the trajectory
# simulator does the detailed per-supplier version; this is the synthesis page's
# back-of-envelope view that ties the three drivers together.
def compute_synthesis(
    basket_traj: list,
    unemployment_scenario_idx: int = 2,  # 0=mainstream, 1=bull, 2=AXION, 3=skeptic
    profitability_scenario_idx: int = 0, # 0=AXION-extreme, 1=capital-heavy, 2=consumer-heavy, 3=labor-rebalanced
    n_citizens: int = 40,
    n_working_adults_today: int = 13,    # from family-types model
    avg_salary_monthly_today: float = 4_000,  # $/mo per working adult today
    ubi_multiplier: float = 1.10,
    welfare_obligation_today: float = 60_000,  # annual State welfare cost for these residents
    welfare_growth_pct_per_year: float = 1.0,  # nominal growth (sticky)
    today_margin_pct: float = 5.0,
    spending_share: float = 0.55,
    founder_spending_share: float = 0.60,     # founders spend more locally (no SNAP/EITC clawback)
    levy_capture_pct: float = 80.0,
    n_founder_class_today: int = 1,           # Dave's family today; grows as more entrepreneurs join
    founder_capital_income_today: float = 120_000,  # annual capital income per founder today
    founder_growth_pct_per_year: float = 12.0,      # capital income grows fast as automation matures
) -> dict:
    """
    Closed-form synthesis: per year, compute UBI obligation, welfare obligation,
    and levy capacity from the basket trajectory + unemployment + profitability
    scenarios. MS1 = year levy >= welfare. MS2 = year levy >= UBI.

    Margin trajectory derived from profitability scenario's capital share.
    Salary nominal-sticky (doesn't fall with basket); employment shrinks per
    unemployment scenario.
    """
    unemp_scenario = UNEMPLOYMENT_FORECASTS["scenarios"][unemployment_scenario_idx]
    prof_scenario = PROFITABILITY_FORECASTS["scenarios"][profitability_scenario_idx]

    # Target margin: scales with capital-capture share of AI gains.
    # capital_pct=20 → target ~14%, =60 → ~32%, =30 → ~19%.
    capital_pct = prof_scenario["capital_pct"]
    margin_ceiling_pct = 50.0
    target_margin = today_margin_pct + (margin_ceiling_pct - today_margin_pct) * (capital_pct / 100)

    today_basket_usd = 980.0
    snapshots = []
    m1_year = m2_year = None
    base_year = basket_traj[0]["year"]
    final_year = basket_traj[-1]["year"]
    years_total = final_year - base_year

    for pt in basket_traj:
        year = pt["year"]
        years_elapsed = year - base_year
        progress = years_elapsed / years_total if years_total > 0 else 0

        # Basket and UBI
        basket_usd = today_basket_usd * pt["cost_index"] / 100
        ubi_obligation = n_citizens * basket_usd * ubi_multiplier * 12

        # Welfare: State-set, nominally sticky (small annual growth)
        welfare_obligation = welfare_obligation_today * ((1 + welfare_growth_pct_per_year / 100) ** years_elapsed)

        # Salary: nominal-sticky per worker, but employment shrinks
        unemp_at_year = next((cp["unemployment_pct"] for cp in unemp_scenario["checkpoints"] if cp["year"] == year), 0)
        # Effective employed workers = today's count × (1 - additional_unemployment%)
        # additional unemployment above today's 4% baseline
        baseline_unemp = 4.0
        extra_unemp = max(0, unemp_at_year - baseline_unemp)
        employment_factor = max(0, (100 - extra_unemp) / 100)
        salary_total_annual = n_working_adults_today * avg_salary_monthly_today * 12 * employment_factor

        # FOUNDER CHANNEL — capital owners who captured AI gains. Their personal
        # spending in the colony IS the levy base, especially as wages collapse.
        # This is the actual AXION funding mechanism that the salary-only model
        # missed. Grows fast under bull automation; depends on capital share.
        # Reasoning: under bull-displacement, the value formerly going to wages
        # now flows to capital owners. Their consumption is what's left to levy.
        capital_growth_factor = 1.0 + (founder_growth_pct_per_year / 100) * (capital_pct / 30)  # adjusted by capital_pct
        founder_capital_income_now = founder_capital_income_today * (capital_growth_factor ** years_elapsed)
        founder_total_capital_income = n_founder_class_today * founder_capital_income_now
        founder_spending = founder_total_capital_income * founder_spending_share

        # Income flowing through colony = UBI + salary + founder capital income
        wage_spending = (ubi_obligation + salary_total_annual) * spending_share
        spending = wage_spending + founder_spending
        income = ubi_obligation + salary_total_annual + founder_total_capital_income

        # Margin expands toward target across the projection
        margin_pct_now = today_margin_pct + (target_margin - today_margin_pct) * progress
        profit_pool = spending * margin_pct_now / 100
        levy_capacity = profit_pool * levy_capture_pct / 100

        snapshots.append({
            "year": year,
            "basket_usd": round(basket_usd, 1),
            "ubi_obligation": round(ubi_obligation, 0),
            "welfare_obligation": round(welfare_obligation, 0),
            "income": round(income, 0),
            "wage_income": round(ubi_obligation + salary_total_annual, 0),
            "founder_income": round(founder_total_capital_income, 0),
            "spending": round(spending, 0),
            "wage_spending": round(wage_spending, 0),
            "founder_spending": round(founder_spending, 0),
            "margin_pct": round(margin_pct_now, 2),
            "profit_pool": round(profit_pool, 0),
            "levy_capacity": round(levy_capacity, 0),
            "unemployment_pct": unemp_at_year,
            "employment_factor": round(employment_factor, 3),
        })

        if m1_year is None and levy_capacity >= welfare_obligation:
            m1_year = year
        if m2_year is None and levy_capacity >= ubi_obligation:
            m2_year = year

    return {
        "snapshots": snapshots,
        "milestone_1_year": m1_year,
        "milestone_2_year": m2_year,
        "assumptions": {
            "n_citizens": n_citizens,
            "n_working_adults_today": n_working_adults_today,
            "avg_salary_monthly_today": avg_salary_monthly_today,
            "ubi_multiplier": ubi_multiplier,
            "welfare_obligation_today": welfare_obligation_today,
            "welfare_growth_pct_per_year": welfare_growth_pct_per_year,
            "today_margin_pct": today_margin_pct,
            "target_margin_pct": round(target_margin, 1),
            "margin_ceiling_pct": margin_ceiling_pct,
            "spending_share": spending_share,
            "founder_spending_share": founder_spending_share,
            "levy_capture_pct": levy_capture_pct,
            "n_founder_class_today": n_founder_class_today,
            "founder_capital_income_today": founder_capital_income_today,
            "founder_growth_pct_per_year": founder_growth_pct_per_year,
            "unemployment_scenario": unemp_scenario["name"],
            "profitability_scenario": prof_scenario["name"],
            "capital_share_of_gains": capital_pct,
        },
    }


# Compute the default synthesis at module load.
# Defaults now AXION projection across all three drivers — the planning case
# for AXION colony architecture (most aggressive than bull where applicable):
#   - AXION basket trajectory (95% deflation by 2045)
#   - AXION unemployment scenario (80% by 2035)
#   - AXION capital-extreme profitability split (75/20/5)
FORECASTS["synthesis"] = compute_synthesis(AXION_BASKET_TRAJECTORY)


def get_forecasts() -> dict:
    """Return the structured forecast data — used by the /api/forecasts endpoint."""
    return FORECASTS


if __name__ == "__main__":
    import json
    f = get_forecasts()
    print("Basket trajectory:")
    for pt in f["basket_trajectory"]:
        print(f"  {pt['year']}: {pt['cost_index']:5.1f}% of today's basket  = ${980 * pt['cost_index']/100:>6,.0f}/mo")
