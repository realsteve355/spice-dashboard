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


def get_forecasts() -> dict:
    """Return the structured forecast data — used by the /api/forecasts endpoint."""
    return FORECASTS


if __name__ == "__main__":
    import json
    f = get_forecasts()
    print("Basket trajectory:")
    for pt in f["basket_trajectory"]:
        print(f"  {pt['year']}: {pt['cost_index']:5.1f}% of today's basket  = ${980 * pt['cost_index']/100:>6,.0f}/mo")
