"""
External supplier seed data for the levy mechanism.

~100 representative firms that a 39,000-person Ohio town does commerce with,
covering the major spending categories. Profit-per-employee figures reflect
2024 ballpark from public 10-K filings and industry surveys.

Real big-name brands where they meaningfully dominate a sector; stylised
regional names for the smaller/local suppliers.
"""
from __future__ import annotations
from typing import List, Tuple


# Format: (name, sector, profit_per_employee_usd, employee_count, annual_revenue_to_maryfontaine_usd)
# Annual revenue is the slice of the supplier's revenue that flows from MaryFontaine commerce
# (at full 39k scale; the simulator scales by --scale param).

EXTERNAL_SUPPLIERS: List[Tuple[str, str, float, int, float]] = [
    # ── AI software & services (very high profit/employee) ──────────────────────
    ("OpenAI",                       "ai_software",            1_800_000,    1_700,    150_000),
    ("Anthropic",                    "ai_software",            1_500_000,    700,      80_000),
    ("Palantir",                     "ai_software",            450_000,      4_000,    120_000),
    ("DataBricks",                   "ai_software",            500_000,      6_500,    90_000),
    ("AutomatedSaaSCo",              "ai_software",            900_000,      80,       60_000),
    ("CursorAI",                     "ai_software",            1_200_000,    50,       40_000),
    ("AIInfraCloud",                 "ai_software",            600_000,      300,      70_000),

    # ── Big tech (high profit/employee) ─────────────────────────────────────────
    ("Apple",                        "big_tech",               650_000,      164_000,  3_500_000),
    ("Microsoft",                    "big_tech",               550_000,      221_000,  4_200_000),
    ("Google",                       "big_tech",               700_000,      182_000,  2_800_000),
    ("Meta",                         "big_tech",               650_000,      67_000,   1_200_000),
    ("Amazon",                       "big_tech",               180_000,      1_540_000, 8_500_000),  # Amazon includes retail → lower P/emp
    ("NVIDIA",                       "big_tech",               2_500_000,    30_000,   180_000),

    # ── Pharmaceutical (high profit/employee) ───────────────────────────────────
    ("Pfizer",                       "pharma",                 350_000,      83_000,   2_400_000),
    ("Merck",                        "pharma",                 320_000,      71_000,   1_900_000),
    ("Johnson & Johnson",            "pharma",                 280_000,      131_000,  3_100_000),
    ("Eli Lilly",                    "pharma",                 480_000,      43_000,   1_800_000),
    ("AbbVie",                       "pharma",                 400_000,      50_000,   1_700_000),

    # ── Financial services (high profit/employee) ──────────────────────────────
    ("JPMorgan Chase",               "financial",              280_000,      300_000,  4_500_000),
    ("Goldman Sachs",                "financial",              350_000,      45_000,   600_000),
    ("Bank of America",              "financial",              210_000,      213_000,  3_800_000),
    ("Wells Fargo",                  "financial",              190_000,      225_000,  3_200_000),
    ("Charles Schwab",               "financial",              250_000,      35_000,   400_000),
    ("Visa",                         "financial",              900_000,      28_000,   200_000),
    ("Mastercard",                   "financial",              800_000,      33_000,   180_000),
    ("RegionalBankOH",               "financial",              140_000,      850,      80_000),

    # ── Automated manufacturing ─────────────────────────────────────────────────
    ("Tesla",                        "automated_mfg",          150_000,      140_000,  1_200_000),
    ("FoxconnUS",                    "automated_mfg",          110_000,      90_000,   400_000),
    ("Siemens Industrial",           "automated_mfg",          130_000,      320_000,  1_800_000),
    ("RoboticsCorp",                 "automated_mfg",          200_000,      8_000,    150_000),

    # ── Traditional manufacturing ───────────────────────────────────────────────
    ("Honda Motor Co",               "auto_mfg",               110_000,      210_000,  4_500_000),  # the Honda factory's parent
    ("Ford",                         "auto_mfg",               80_000,       176_000,  3_200_000),
    ("General Motors",               "auto_mfg",               90_000,       163_000,  3_400_000),
    ("Toyota North America",         "auto_mfg",               100_000,      48_000,   1_900_000),
    ("Stellantis",                   "auto_mfg",               85_000,       250_000,  2_100_000),
    ("Caterpillar",                  "traditional_mfg",        100_000,      113_000,  450_000),
    ("Deere & Company",              "traditional_mfg",        130_000,      83_000,   380_000),
    ("OhioFabricationCo",            "traditional_mfg",        70_000,       180,      45_000),
    ("MidwestSteelWorks",            "traditional_mfg",        80_000,       420,      120_000),

    # ── Big retail (low profit/employee) ────────────────────────────────────────
    ("Walmart",                      "big_retail",             18_000,       2_100_000, 9_500_000),
    ("Costco",                       "big_retail",             45_000,       316_000,  2_800_000),
    ("Target",                       "big_retail",             25_000,       440_000,  3_100_000),
    ("Kroger",                       "big_retail",             20_000,       420_000,  3_800_000),
    ("HomeDepot",                    "big_retail",             50_000,       465_000,  2_400_000),
    ("Lowe's",                       "big_retail",             40_000,       300_000,  1_800_000),
    ("Best Buy",                     "big_retail",             28_000,       90_000,   650_000),
    ("CVS Pharmacy",                 "big_retail",             22_000,       300_000,  2_200_000),
    ("Walgreens",                    "big_retail",             18_000,       330_000,  2_000_000),

    # ── Restaurant chains ───────────────────────────────────────────────────────
    ("McDonald's",                   "restaurant_chain",       30_000,       150_000,  650_000),
    ("Chipotle",                     "restaurant_chain",       38_000,       110_000,  280_000),
    ("Starbucks",                    "restaurant_chain",       22_000,       381_000,  450_000),
    ("Subway",                       "restaurant_chain",       18_000,       400_000,  300_000),
    ("Wendy's",                      "restaurant_chain",       28_000,       14_000,   180_000),
    ("Cracker Barrel",               "restaurant_chain",       16_000,       70_000,   120_000),

    # ── Healthcare providers ────────────────────────────────────────────────────
    ("HCA Healthcare",               "healthcare_provider",    100_000,      280_000,  3_800_000),
    ("OhioHealth",                   "healthcare_provider",    85_000,       30_000,   1_200_000),
    ("ClevelandClinic",              "healthcare_provider",    95_000,       72_000,   2_200_000),
    ("AnthemBlue",                   "healthcare_insurance",   180_000,      102_000,  900_000),
    ("UnitedHealth",                 "healthcare_insurance",   160_000,      400_000,  3_500_000),
    ("CVS Caremark",                 "healthcare_insurance",   140_000,      94_000,   650_000),

    # ── Construction (national + regional) ──────────────────────────────────────
    ("D.R. Horton",                  "construction_national",  90_000,       12_000,   100_000),
    ("Lennar",                       "construction_national",  100_000,      11_000,   90_000),
    ("OhioBuildersAssoc",            "construction_local",     55_000,       2_400,    320_000),
    ("MidwestRoofingCo",             "construction_local",     50_000,       180,      40_000),

    # ── Hospitality ─────────────────────────────────────────────────────────────
    ("Marriott International",       "hospitality",            35_000,       411_000,  85_000),
    ("Hilton",                       "hospitality",            38_000,       159_000,  60_000),
    ("Airbnb",                       "hospitality",            290_000,      6_900,    25_000),
    ("OhioStateInn",                 "hospitality",            22_000,       12,       1_500),

    # ── Logistics & transportation ──────────────────────────────────────────────
    ("UPS",                          "logistics",              60_000,       500_000,  450_000),
    ("FedEx",                        "logistics",              70_000,       530_000,  400_000),
    ("XPO Logistics",                "logistics",              55_000,       40_000,   180_000),
    ("Uber",                         "logistics",              140_000,      31_000,   220_000),
    ("Lyft",                         "logistics",              85_000,       3_000,    80_000),
    ("OhioTrucking",                 "logistics",              45_000,       400,      80_000),

    # ── Utilities ──────────────────────────────────────────────────────────────
    ("AEP Ohio",                     "utility",                240_000,      18_000,   2_400_000),
    ("Duke Energy",                  "utility",                220_000,      27_000,   1_800_000),
    ("Columbia Gas",                 "utility",                280_000,      9_000,    900_000),
    ("Verizon",                      "utility",                280_000,      117_000,  1_200_000),
    ("AT&T",                         "utility",                250_000,      149_000,  1_400_000),
    ("Comcast",                      "utility",                240_000,      186_000,  1_500_000),

    # ── Media & entertainment ──────────────────────────────────────────────────
    ("Netflix",                      "media",                  400_000,      13_000,   180_000),
    ("Disney",                       "media",                  220_000,      225_000,  450_000),
    ("Spotify",                      "media",                  180_000,      9_000,    90_000),

    # ── Energy/oil ─────────────────────────────────────────────────────────────
    ("ExxonMobil",                   "energy",                 460_000,      62_000,   3_200_000),
    ("Chevron",                      "energy",                 480_000,      45_000,   2_100_000),
    ("Marathon Petroleum",           "energy",                 350_000,      18_000,   1_800_000),

    # ── Insurance ───────────────────────────────────────────────────────────────
    ("State Farm",                   "insurance",              160_000,      59_000,   650_000),
    ("Allstate",                     "insurance",              130_000,      53_000,   400_000),
    ("Progressive",                  "insurance",              280_000,      57_000,   500_000),
    ("Nationwide",                   "insurance",              140_000,      24_000,   320_000),

    # ── Education (mostly local but some online) ───────────────────────────────
    ("Coursera",                     "ed_online",              280_000,      1_000,    25_000),
    ("OnlineUniversityCo",           "ed_online",              180_000,      3_500,    40_000),

    # ── Agricultural ────────────────────────────────────────────────────────────
    ("ADM (Archer Daniels Midland)", "agriculture",            85_000,       42_000,   800_000),
    ("Cargill",                      "agriculture",            90_000,       160_000,  1_200_000),
    ("OhioFarmersUnion",             "agriculture_local",      45_000,       2_200,    400_000),

    # ── Telecommunications equipment ────────────────────────────────────────────
    ("Cisco",                        "telecom_equip",          280_000,      85_000,   220_000),
    ("Qualcomm",                     "telecom_equip",          550_000,      51_000,   60_000),

    # ── Software (non-AI) ──────────────────────────────────────────────────────
    ("Salesforce",                   "software",               220_000,      72_000,   180_000),
    ("Oracle",                       "software",               260_000,      163_000,  280_000),
    ("Adobe",                        "software",               320_000,      30_000,   90_000),
    ("Intuit",                       "software",               240_000,      18_000,   150_000),  # TurboTax used widely

    # ── Defence / aerospace ────────────────────────────────────────────────────
    ("Lockheed Martin",              "defence",                130_000,      122_000,  120_000),
    ("RTX Corp",                     "defence",                110_000,      185_000,  90_000),

    # ── Government services / contractors ──────────────────────────────────────
    ("FederalServicesCo",            "gov_services",           110_000,      28_000,   180_000),
    ("StateOfOhio",                  "gov_services",           65_000,       55_000,   2_800_000),  # state govt collects modest amount
]


def get_external_suppliers() -> List[Tuple[str, str, float, int, float, float]]:
    """Return list of (name, sector, P/emp, employees, annual_revenue, annual_profit)."""
    out = []
    for name, sector, p_per_emp, n_emp, annual_rev in EXTERNAL_SUPPLIERS:
        annual_profit = p_per_emp * n_emp
        out.append((name, sector, p_per_emp, n_emp, annual_rev, annual_profit))
    return out
