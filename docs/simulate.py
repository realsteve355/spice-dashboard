"""
Mars Colony Economy Simulation  —  V2
========================================
Changes from V1:
  - Monthly dividends (was annual)
  - Variable itemised MCC billing per citizen consumption profile
  - Citizen consumption profiles (habitat_size, power_usage, water_usage)
  - Habitat size drifts upward as citizens accumulate wealth
  - mcc_bills table records annual sample of itemised bills
  - Renamed "mint" references to "Fisc" throughout

Run with: python simulate.py
"""

import sqlite3
import random
import math
import time
from dataclasses import dataclass, field
from typing import Optional

# ══════════════════════════════════════════════════════════════════════
# CONSTANTS
# ══════════════════════════════════════════════════════════════════════

SEED = 42
YEARS = 200
MONTHS = YEARS * 12
POPULATION = 1000
UBI = 1000          # S-tokens per adult per month
MAX_V_SAVE = 0.20   # max fraction of UBI saveable as V-tokens per month
MAX_V_COMPANY = 0.20  # max fraction of monthly net saveable by company
ADULTHOOD = 18
RETIREMENT = 65
MAX_AGE = 92
DB_PATH = "colony.db"

# ── MCC per-unit billing rates (S-tokens) ─────────────────────────────
# Target: average citizen pays ~200 S/month (20% of UBI)
MCC_ATMOS_RATE   = 50    # flat per month — everyone breathes the same air
MCC_POWER_RATE   = 50    # × citizen.power_usage
MCC_WATER_RATE   = 35    # × citizen.water_usage
MCC_HABITAT_RATE = 45    # × citizen.habitat_size
MCC_COMMS_RATE   = 10    # flat per month
MCC_AI_HEALTH    = 10    # flat per month
# Average citizen total: 50 + 50 + 35 + 45 + 10 + 10 = 200 S exactly

random.seed(SEED)

# ── Service categories ────────────────────────────────────────────────
SERVICES = [
    # name, base_monthly_price, demand_per_citizen, sector_type
    # Life Support (MCC - mandatory, paid via infrastructure fee)
    ("Atmospheric Processing",  0,    1.0,  "mcc"),
    ("Water Recycling",         0,    1.0,  "mcc"),
    ("Power Distribution",      0,    1.0,  "mcc"),
    ("Waste Management",        0,    1.0,  "mcc"),
    ("Dome Integrity",          0,    1.0,  "mcc"),
    ("Emergency Response",      0,    0.02, "mcc"),
    # Food Production
    ("Hydroponic Staples",      0,    1.0,  "food_basic"),   # free baseline
    ("Premium Hydroponics",     80,   0.6,  "food_premium"),
    ("Cultured Meat",           120,  0.5,  "food_premium"),
    ("Algae Protein",           40,   0.4,  "food_basic"),
    ("Mushroom Cultivation",    50,   0.3,  "food_premium"),
    ("Bakery",                  60,   0.7,  "food_premium"),
    ("Brewing & Distilling",    90,   0.4,  "leisure"),
    # Food Service
    ("Restaurant",              150,  0.5,  "hospitality"),
    ("Cafe",                    60,   0.6,  "hospitality"),
    ("Catering",                200,  0.1,  "hospitality"),
    ("Private Dining",          400,  0.1,  "hospitality"),
    # Health
    ("AI Diagnostics",          0,    1.0,  "mcc"),
    ("Human Physician",         200,  0.2,  "health"),
    ("Surgery",                 800,  0.02, "health"),
    ("Mental Health",           150,  0.15, "health"),
    ("Dentistry",               180,  0.1,  "health"),
    ("Pharmacy",                80,   0.3,  "health"),
    ("Physiotherapy",           120,  0.08, "health"),
    # Science & Research
    ("Geology Research",        300,  0.05, "science"),
    ("Biology Lab",             350,  0.05, "science"),
    ("Physics Research",        400,  0.04, "science"),
    ("Engineering R&D",         500,  0.04, "science"),
    ("Medical Research",        450,  0.03, "science"),
    ("AI Development",          600,  0.03, "science"),
    # Manufacturing
    ("Fabrication Shop",        100,  0.4,  "manufacturing"),
    ("Electronics",             200,  0.2,  "manufacturing"),
    ("Clothing",                80,   0.5,  "manufacturing"),
    ("Furniture",               300,  0.1,  "manufacturing"),
    ("Tools & Equipment",       150,  0.2,  "manufacturing"),
    ("Spare Parts",             120,  0.3,  "manufacturing"),
    # Construction
    ("Habitat Expansion",       2000, 0.02, "construction"),
    ("Interior Fit-out",        500,  0.05, "construction"),
    ("Maintenance & Repair",    200,  0.3,  "construction"),
    ("Pressurisation Eng",      1000, 0.01, "construction"),
    # Mining & Resources
    ("Regolith Processing",     400,  0.1,  "mining"),
    ("Ice Mining",              350,  0.1,  "mining"),
    ("Rare Earth Extraction",   800,  0.04, "mining"),
    ("Mineral Survey",          600,  0.03, "mining"),
    # Transport
    ("Internal Transport",      50,   0.8,  "transport"),
    ("Surface Rover Ops",       300,  0.15, "transport"),
    ("Cargo Logistics",         200,  0.2,  "transport"),
    ("EVA Services",            500,  0.05, "transport"),
    # Education
    ("Early Childhood",         0,    0.1,  "education"),
    ("Technical Training",      200,  0.2,  "education"),
    ("University Science",      400,  0.1,  "education"),
    ("Arts Education",          150,  0.1,  "education"),
    ("Mentorship",              100,  0.15, "education"),
    # Entertainment & Culture
    ("Live Performance",        120,  0.3,  "entertainment"),
    ("Sports & Recreation",     80,   0.5,  "entertainment"),
    ("Gaming",                  60,   0.6,  "entertainment"),
    ("Cinema",                  50,   0.5,  "entertainment"),
    ("Art Studio",              100,  0.2,  "entertainment"),
    ("Music",                   80,   0.3,  "entertainment"),
    ("Social Club",             70,   0.4,  "entertainment"),
    ("Library",                 0,    0.6,  "education"),
    # Professional Services
    ("Legal & Arbitration",     300,  0.1,  "professional"),
    ("Financial Advice",        250,  0.1,  "professional"),
    ("Engineering Consulting",  400,  0.08, "professional"),
    ("Design Services",         200,  0.1,  "professional"),
    # Personal Services
    ("Personal Grooming",       60,   0.7,  "personal"),
    ("Tailoring",               100,  0.3,  "personal"),
    ("Cleaning Services",       80,   0.4,  "personal"),
    ("Childcare",               300,  0.1,  "personal"),
    ("Elder Care",              400,  0.05, "personal"),
    ("Personal Training",       100,  0.3,  "personal"),
    # Commerce
    ("Retail",                  100,  0.6,  "commerce"),
    ("Earth Import Brokerage",  500,  0.05, "commerce"),
    ("Marketplace Ops",         50,   0.3,  "commerce"),
    # Communications
    ("Internal Comms",          0,    1.0,  "mcc"),
    ("Earth Link Ops",          200,  0.2,  "communications"),
    ("Media Production",        150,  0.2,  "communications"),
]

# Companies that can exist (name, sector_types_they_can_serve, base_revenue)
COMPANY_TYPES = [
    ("Surface Transport Co",    ["transport"],              25000),
    ("Hydroponics Collective",  ["food_premium","food_basic"], 28000),
    ("Dome Maintenance Ltd",    ["construction","mcc"],     20000),
    ("Fabrication Works",       ["manufacturing"],          22000),
    ("Medical Practice",        ["health"],                 24000),
    ("The Canteen",             ["hospitality"],            18000),
    ("Mining Operations",       ["mining"],                 32000),
    ("Academy",                 ["education","science"],    16000),
    ("Entertainment Hub",       ["entertainment","leisure"],15000),
    ("Construction Guild",      ["construction"],           35000),
    ("Energy Systems",          ["mcc"],                    22000),
    ("Water Works",             ["mcc","food_basic"],       18000),
    ("Science Institute",       ["science"],                20000),
    ("Personal Services Co",    ["personal","commerce"],    14000),
    ("Communications Bureau",   ["communications"],         16000),
    ("Legal Chamber",           ["professional"],           18000),
    ("The Brewery",             ["leisure","hospitality"],  15000),
    ("Clothing Workshop",       ["manufacturing","personal"], 12000),
    ("Import Trading Co",       ["commerce"],               20000),
    ("Research Lab",            ["science","health"],       25000),
]

FIRST_NAMES = [
    "Amara","Juno","Kael","Seren","Orion","Lyra","Cass","Dax","Mira","Fenn",
    "Rho","Zara","Aten","Voss","Lena","Rix","Dara","Eko","Sol","Nyx",
    "Tor","Pema","Zev","Ilia","Cato","Maren","Brix","Yael","Sable","Kiran",
    "Ode","Tarn","Vera","Axel","Nova","Cyan","Reef","Onyx","Sage","Flint",
]
SURNAMES = [
    "Okafor","Chen","Reyes","Lindqvist","Patel","Novak","Kim","Hassan",
    "Ferreira","Müller","Tanaka","Osei","Larsen","Gupta","Nakamura",
    "Volkov","Nkosi","Castillo","Berg","Yamamoto","Diallo","Andersen",
    "Kowalski","Mbeki","Johansson","Rashid","Costa","Erikson","Abubakar","Sato",
]

def rname():
    return f"{random.choice(FIRST_NAMES)} {random.choice(SURNAMES)}"

# ══════════════════════════════════════════════════════════════════════
# DATABASE SETUP
# ══════════════════════════════════════════════════════════════════════

def setup_db(conn):
    c = conn.cursor()
    c.executescript("""
    PRAGMA journal_mode=WAL;
    PRAGMA synchronous=NORMAL;

    CREATE TABLE IF NOT EXISTS citizens (
        id INTEGER PRIMARY KEY,
        name TEXT,
        birth_year INTEGER,
        death_year INTEGER,
        profession TEXT,
        company_id INTEGER,
        is_board_member INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY,
        name TEXT,
        sector TEXT,
        founded_year INTEGER,
        closed_year INTEGER,
        is_mcc INTEGER DEFAULT 0,
        founder_ids TEXT
    );

    CREATE TABLE IF NOT EXISTS citizen_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        citizen_id INTEGER,
        year INTEGER,
        month INTEGER,
        age REAL,
        v_tokens REAL,
        s_tokens_received REAL,
        alive INTEGER,
        habitat_size REAL,
        power_usage REAL,
        water_usage REAL,
        mcc_bill_total REAL
    );

    CREATE TABLE IF NOT EXISTS mcc_bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        citizen_id INTEGER,
        year INTEGER,
        month INTEGER,
        atmos REAL,
        power REAL,
        water REAL,
        habitat REAL,
        comms REAL,
        ai_health REAL,
        total REAL
    );

    CREATE TABLE IF NOT EXISTS company_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        year INTEGER,
        month INTEGER,
        s_buffer REAL,
        v_tokens REAL,
        health REAL,
        alive INTEGER
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER,
        month INTEGER,
        citizen_id INTEGER,
        company_id INTEGER,
        service_name TEXT,
        amount REAL,
        transaction_type TEXT
    );

    CREATE TABLE IF NOT EXISTS annual_summaries (
        year INTEGER PRIMARY KEY,
        population INTEGER,
        total_v_tokens REAL,
        mean_v REAL,
        median_v REAL,
        max_v REAL,
        gini REAL,
        active_companies INTEGER,
        mcc_infra_health REAL,
        mcc_revenue REAL,
        mcc_v_tokens REAL,
        mcc_board_share_pct REAL,
        mcc_approval REAL,
        colony_gdp REAL,
        total_transactions INTEGER,
        total_s_issued REAL
    );

    CREATE TABLE IF NOT EXISTS viability_summary (
        year INTEGER PRIMARY KEY,
        avg_mcc_bill REAL,
        total_dividends REAL,
        dividend_recipients INTEGER,
        v_concentration_pct REAL
    );

    CREATE TABLE IF NOT EXISTS mcc_votes (
        year INTEGER PRIMARY KEY,
        infra_health REAL,
        for_pct REAL,
        board_share_pct REAL,
        approval REAL,
        board_total_earnings REAL
    );

    CREATE INDEX IF NOT EXISTS idx_txn_year ON transactions(year);
    CREATE INDEX IF NOT EXISTS idx_txn_citizen ON transactions(citizen_id);
    CREATE INDEX IF NOT EXISTS idx_txn_company ON transactions(company_id);
    CREATE INDEX IF NOT EXISTS idx_txn_type_year ON transactions(transaction_type, year);
    CREATE INDEX IF NOT EXISTS idx_csnap_year ON citizen_snapshots(year, month);
    CREATE INDEX IF NOT EXISTS idx_csnap_citizen ON citizen_snapshots(citizen_id);
    CREATE INDEX IF NOT EXISTS idx_bills_citizen ON mcc_bills(citizen_id);
    CREATE INDEX IF NOT EXISTS idx_bills_year ON mcc_bills(year, month);
    """)
    conn.commit()

# ══════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ══════════════════════════════════════════════════════════════════════

@dataclass
class Citizen:
    id: int
    name: str
    age: float
    birth_year: int
    v_tokens: float = 0.0
    save_propensity: float = 0.0
    alive: bool = True
    death_year: Optional[int] = None
    co_shares: dict = field(default_factory=dict)  # company_id -> share pct
    is_board_member: bool = False
    board_earnings: float = 0.0
    profession: str = "Citizen"
    company_id: Optional[int] = None
    parent_quintile: Optional[int] = None
    quintile_history: list = field(default_factory=list)
    # consumption preferences (multipliers per sector type)
    preferences: dict = field(default_factory=dict)
    # MCC consumption profile — set on creation, drifts over time
    habitat_size: float = 1.0   # multiplier: 0.5 (small) to 3.0 (large)
    power_usage: float = 1.0    # multiplier: 0.5 to 2.5
    water_usage: float = 1.0    # multiplier: 0.5 to 2.0
    current_s_balance: float = 0.0  # S-tokens available this month (set at UBI)
    last_mcc_bill: float = 0.0  # most recent MCC bill total

@dataclass
class Company:
    id: int
    name: str
    sector: str
    services: list  # list of service names this company provides
    base_revenue: int
    founded_year: int
    owner_ids: list = field(default_factory=list)
    alive: bool = True
    closed_year: Optional[int] = None
    v_tokens: float = 0.0
    s_buffer: float = 0.0
    monthly_revenue: float = 0.0   # resets each month
    health: float = 1.0
    is_mcc: bool = False
    infra_health: float = 0.85
    board_members: list = field(default_factory=list)
    board_profit_share: float = 0.15
    approval: float = 0.75

@dataclass
class Child:
    age_months: int = 0
    parent_quintile: Optional[int] = None

# ══════════════════════════════════════════════════════════════════════
# SIMULATION
# ══════════════════════════════════════════════════════════════════════

SERVICES_BY_NAME = {s[0]: s for s in SERVICES}

def assign_consumption_profile(citizen):
    """Set habitat/power/water usage multipliers for a citizen. Called once on creation."""
    citizen.habitat_size = min(3.0, max(0.5, random.gauss(1.0, 0.35)))
    citizen.power_usage  = min(2.5, max(0.5, random.gauss(1.0, 0.30)))
    citizen.water_usage  = min(2.0, max(0.5, random.gauss(1.0, 0.25)))

def calculate_mcc_bill(citizen, infra_health=1.0):
    """Return itemised MCC bill dict and total for this citizen.
    infra_health < 1.0 slightly increases bills (less efficient systems).
    """
    efficiency = max(0.8, infra_health)  # degraded infra costs more to run
    bill = {
        "atmos":     round(MCC_ATMOS_RATE / efficiency, 2),
        "power":     round(MCC_POWER_RATE   * citizen.power_usage   / efficiency, 2),
        "water":     round(MCC_WATER_RATE   * citizen.water_usage   / efficiency, 2),
        "habitat":   round(MCC_HABITAT_RATE * citizen.habitat_size  / efficiency, 2),
        "comms":     round(MCC_COMMS_RATE   / efficiency, 2),
        "ai_health": round(MCC_AI_HEALTH    / efficiency, 2),
    }
    return bill, sum(bill.values())

def build_preferences():
    """Generate consumption preference weights for a citizen."""
    sector_types = list(set(s[3] for s in SERVICES if s[1] > 0))
    prefs = {}
    for st in sector_types:
        prefs[st] = max(0.1, random.gauss(1.0, 0.3))
    return prefs

def citizen_spending(citizen, budget, companies, year, month):
    """
    Allocate a citizen's monthly S-token spending budget across services.
    Returns list of (company_id, service_name, amount) transactions.
    """
    txns = []
    if budget <= 0:
        return txns

    # Build list of available services from active companies
    available = []
    for co in companies:
        if not co.alive or co.is_mcc:
            continue
        for svc_name in co.services:
            svc = SERVICES_BY_NAME.get(svc_name)
            if svc and svc[1] > 0:  # has a price
                price = svc[1]
                demand = svc[2]
                sector = svc[3]
                pref = citizen.preferences.get(sector, 1.0)
                age_mod = 1.0
                if sector == "health" and citizen.age > 60:
                    age_mod = 2.0
                elif sector == "entertainment" and citizen.age < 35:
                    age_mod = 1.5
                elif sector == "education" and citizen.age < 30:
                    age_mod = 1.8
                elif sector == "personal" and citizen.age > 40:
                    age_mod = 1.2
                score = demand * pref * age_mod
                available.append((co.id, svc_name, price, score))

    if not available:
        return txns

    total_score = sum(a[3] for a in available)
    if total_score == 0:
        return txns

    remaining = budget
    random.shuffle(available)
    for co_id, svc_name, price, score in available:
        if remaining <= 0:
            break
        prob = (score / total_score) * 3.0
        if random.random() < min(prob, 0.85):
            spend = min(price * (0.5 + random.random()), remaining)
            if spend > 0:
                txns.append((co_id, svc_name, round(spend, 2)))
                remaining -= spend

    return txns

def run_simulation():
    print("=" * 60)
    print("MARS COLONY ECONOMY SIMULATION")
    print("200 years · 1,000 citizens · Monthly dividends · Variable MCC billing")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    setup_db(conn)
    cursor = conn.cursor()

    # Clear existing data
    cursor.executescript("""
        DELETE FROM citizens; DELETE FROM companies;
        DELETE FROM citizen_snapshots; DELETE FROM company_snapshots;
        DELETE FROM transactions; DELETE FROM annual_summaries;
        DELETE FROM mcc_votes; DELETE FROM mcc_bills;
        DELETE FROM viability_summary;
    """)
    conn.commit()

    t0 = time.time()

    # ── Initialise citizens ──────────────────────────────────────────
    # Age distribution: Earth-realistic modern population pyramid
    # Weighted toward working-age adults with a realistic tail
    AGE_BRACKETS = [
        (18, 25, 0.17),   # young adults
        (25, 35, 0.22),   # early career
        (35, 45, 0.20),   # mid career
        (45, 55, 0.18),   # senior workers
        (55, 65, 0.13),   # pre-retirement
        (65, 75, 0.07),   # early elderly
        (75, 85, 0.03),   # elderly
    ]

    def random_starting_age():
        r = random.random()
        cumulative = 0.0
        for lo, hi, weight in AGE_BRACKETS:
            cumulative += weight
            if r <= cumulative:
                return random.uniform(lo, hi)
        return random.uniform(75, 85)

    next_id = [0]
    def mk_citizen(age, birth_year, parent_q=None):
        c = Citizen(
            id=next_id[0],
            name=rname(),
            age=age,
            birth_year=birth_year,
            save_propensity=random.uniform(0.05, 0.20),
            preferences=build_preferences(),
            parent_quintile=parent_q,
        )
        assign_consumption_profile(c)
        next_id[0] += 1
        return c

    people = []
    for i in range(POPULATION):
        age = random_starting_age()
        p = mk_citizen(age, 1 - int(age))
        people.append(p)

    # ── Initialise companies ─────────────────────────────────────────
    next_co_id = [0]
    def mk_company(ctype, founders, year):
        co_id = next_co_id[0]
        next_co_id[0] += 1
        name, sectors, base_rev = ctype
        # Build service list from sectors
        services = [s[0] for s in SERVICES if s[3] in sectors and s[1] > 0]
        co = Company(
            id=co_id,
            name=name,
            sector=sectors[0],
            services=services[:8],  # max 8 services per company
            base_revenue=base_rev,
            founded_year=year,
            owner_ids=[f.id for f in founders],
            health=random.uniform(0.7, 1.0),
        )
        for f in founders:
            share = 100 // len(founders)
            f.co_shares[co_id] = share
            f.company_id = co_id
            f.profession = name
        return co

    companies = []
    for i, ctype in enumerate(COMPANY_TYPES[:12]):
        founders = [people[i*3 % len(people)], people[(i*3+1) % len(people)]]
        co = mk_company(ctype, founders, 1)
        companies.append(co)

    # ── MCC ──────────────────────────────────────────────────────────
    mcc_id = next_co_id[0]
    next_co_id[0] += 1
    board_people = [p for p in people if 25 <= p.age <= 50][:5]
    mcc = Company(
        id=mcc_id,
        name="Mars Colony Company",
        sector="public_infrastructure",
        services=[s[0] for s in SERVICES if s[3] == "mcc"],
        base_revenue=45000,
        founded_year=1,
        owner_ids=[p.id for p in people],  # all citizens
        health=0.85,
        is_mcc=True,
        infra_health=0.85,
        board_members=[p.id for p in board_people],
        board_profit_share=0.15,
        approval=0.75,
    )
    for p in board_people:
        p.is_board_member = True
        p.profession = "MCC Board"
        p.company_id = mcc_id
    companies.append(mcc)

    # Write initial citizens and companies to DB
    cursor.executemany(
        "INSERT INTO citizens VALUES (?,?,?,?,?,?,?)",
        [(p.id, p.name, p.birth_year, None, p.profession, p.company_id, int(p.is_board_member))
         for p in people]
    )
    cursor.executemany(
        "INSERT INTO companies VALUES (?,?,?,?,?,?,?)",
        [(co.id, co.name, co.sector, co.founded_year, None, int(co.is_mcc),
          ",".join(str(x) for x in co.owner_ids[:5]))
         for co in companies]
    )
    conn.commit()

    # ── Pre-seed children pipeline ────────────────────────────────────
    # Without pre-seeding, no births arrive for 18 years while deaths accumulate.
    # ~8 deaths/month from 1,000 citizens × 18 years × 12 months = ~1,700 children
    # should be in the pipeline at start. Spread them evenly across ages 0-17.
    children = []
    for i in range(1600):
        age_months = random.randint(0, ADULTHOOD * 12 - 1)
        children.append(Child(age_months=age_months, parent_quintile=None))
    total_transactions = 0
    total_gdp = 0.0
    mcc_year_rev = 0.0   # MCC revenue accumulated per year, reset annually
    co_lookup = {co.id: co for co in companies}  # O(1) company lookup

    # Batch write buffers
    txn_batch = []
    snap_batch = []
    bill_batch = []         # mcc_bills rows — sampled annually
    death_updates = []      # (year, citizen_id)
    board_updates = []      # (profession, citizen_id)
    new_citizen_batch = []  # rows for new adults
    co_close_updates = []   # (year, company_id)
    FLUSH_EVERY = 12        # flush once per year

    def flush_batches():
        nonlocal total_transactions
        if txn_batch:
            cursor.executemany(
                "INSERT INTO transactions(year,month,citizen_id,company_id,service_name,amount,transaction_type) VALUES (?,?,?,?,?,?,?)",
                txn_batch
            )
            total_transactions += len(txn_batch)
            txn_batch.clear()
        if snap_batch:
            cursor.executemany(
                "INSERT INTO citizen_snapshots(citizen_id,year,month,age,v_tokens,s_tokens_received,alive,habitat_size,power_usage,water_usage,mcc_bill_total) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                snap_batch
            )
            snap_batch.clear()
        if death_updates:
            cursor.executemany("UPDATE citizens SET death_year=? WHERE id=?", death_updates)
            death_updates.clear()
        if board_updates:
            cursor.executemany("UPDATE citizens SET profession=?,is_board_member=1 WHERE id=?", board_updates)
            board_updates.clear()
        if new_citizen_batch:
            cursor.executemany("INSERT INTO citizens VALUES (?,?,?,?,?,?,?)", new_citizen_batch)
            new_citizen_batch.clear()
        if co_close_updates:
            cursor.executemany("UPDATE companies SET closed_year=? WHERE id=?", co_close_updates)
            co_close_updates.clear()
        if bill_batch:
            cursor.executemany(
                "INSERT INTO mcc_bills(citizen_id,year,month,atmos,power,water,habitat,comms,ai_health,total) VALUES (?,?,?,?,?,?,?,?,?,?)",
                bill_batch
            )
            bill_batch.clear()
        conn.commit()

    print(f"\nSimulating {MONTHS} months...")
    people_lookup = {p.id: p for p in people}

    for month in range(MONTHS):
        year = month // 12 + 1
        month_of_year = month % 12 + 1
        is_year_end = month % 12 == 11

        # Progress
        if month % (12 * 10) == 0:
            elapsed = time.time() - t0
            pct = month / MONTHS * 100
            print(f"  Year {year:3d} — {pct:4.1f}% — {elapsed:.1f}s elapsed — {total_transactions:,} transactions")

        # ── Age everyone ──────────────────────────────────────────────
        for p in people:
            if p.alive:
                p.age += 1/12

        # ── Deaths & inheritance ──────────────────────────────────────
        alive_next = []
        for p in people:
            if not p.alive:
                continue
            dp = (0.00008 if p.age < 50 else
                  0.0003  if p.age < 65 else
                  0.0015  if p.age < 75 else
                  0.004   if p.age < 85 else 0.011)
            if random.random() < dp or p.age >= MAX_AGE:
                p.alive = False
                p.death_year = year
                death_updates.append((year, p.id))
                # Inheritance
                if p.v_tokens > 0 and alive_next:
                    n = min(random.randint(1,3), len(alive_next))
                    share = p.v_tokens / n
                    heirs = random.sample(alive_next, n)
                    for heir in heirs:
                        heir.v_tokens += share
                        txn_batch.append((year, month_of_year, heir.id, -1,
                                         "Inheritance", round(share,2), "inheritance"))
                # Company share inheritance
                for co_id, shares in p.co_shares.items():
                    if shares > 0 and alive_next:
                        heir = random.choice(alive_next)
                        heir.co_shares[co_id] = heir.co_shares.get(co_id, 0) + shares
                # MCC board replacement
                if p.is_board_member and p.id in mcc.board_members:
                    idx = mcc.board_members.index(p.id)
                    cands = [x for x in alive_next if not x.is_board_member and 25 <= x.age <= 65]
                    if cands:
                        nm = random.choice(cands)
                        mcc.board_members[idx] = nm.id
                        nm.is_board_member = True
                        nm.profession = "MCC Board"
                        board_updates.append(("MCC Board", nm.id))
                # Birth replacement
                children.append(Child(
                    age_months=0,
                    parent_quintile=(p.quintile_history[-1] if p.quintile_history else None)
                ))
            else:
                alive_next.append(p)
        people = alive_next

        # ── Children → adults ─────────────────────────────────────────
        still_kids = []
        for ch in children:
            ch.age_months += 1
            if ch.age_months >= ADULTHOOD * 12:
                np = mk_citizen(ADULTHOOD, year, ch.parent_quintile)
                # Assign to a company if one needs workers
                for co in companies:
                    if co.alive and not co.is_mcc and len(co.owner_ids) < 4:
                        np.profession = co.name
                        np.company_id = co.id
                        break
                people.append(np)
                people_lookup[np.id] = np
                new_citizen_batch.append(
                    (np.id, np.name, np.birth_year, None, np.profession, np.company_id, 0)
                )
            else:
                still_kids.append(ch)
        children = still_kids

        # ── UBI payment + MCC billing ─────────────────────────────────
        month_s_issued = 0
        total_mcc_rev = 0.0
        sample_bills = (month_of_year == 6)  # sample bills in month 6 each year

        for p in people:
            # Issue UBI
            p.current_s_balance = float(UBI)
            month_s_issued += UBI

            # MCC itemised bill — deducted before discretionary spending
            bill, bill_total = calculate_mcc_bill(p, mcc.infra_health if mcc.alive else 1.0)
            actual_bill = min(bill_total, p.current_s_balance)
            p.current_s_balance -= actual_bill
            p.last_mcc_bill = actual_bill
            mcc.s_buffer += actual_bill
            total_mcc_rev += actual_bill
            txn_batch.append((year, month_of_year, p.id, mcc.id,
                             "MCC Bill", round(actual_bill, 2), "mcc_bill"))

            if sample_bills:
                bill_batch.append((p.id, year, month_of_year,
                                   bill["atmos"], bill["power"], bill["water"],
                                   bill["habitat"], bill["comms"], bill["ai_health"],
                                   round(actual_bill, 2)))

            # V-token conversion from remaining balance
            save = min(p.current_s_balance, UBI * MAX_V_SAVE)
            p.v_tokens += save
            p.current_s_balance -= save

            # Redemption events — log only when they happen (rare)
            is_retired = p.age >= RETIREMENT
            rp = 0.10 if is_retired else 0.025
            crisis = random.random() < 0.004
            if crisis:
                rp += 0.6
            if random.random() < rp and p.v_tokens > 0:
                redeem = p.v_tokens * random.uniform(0.15, 0.70)
                p.v_tokens -= redeem
                p.current_s_balance += redeem
                txn_batch.append((year, month_of_year, p.id, -1,
                                 "V-Token Redemption", round(redeem, 2), "v_redeem"))

            # ── Consumer spending ──────────────────────────────────────
            txns = citizen_spending(p, p.current_s_balance, companies, year, month_of_year)
            for co_id, svc_name, amount in txns:
                txn_batch.append((year, month_of_year, p.id, co_id,
                                 svc_name, amount, "purchase"))
                co = co_lookup.get(co_id)
                if co and co.alive:
                    net = amount * (1 - co.sector_cost(svc_name))
                    co.s_buffer += max(0, net)
                    co.monthly_revenue += amount

        # ── MCC monthly operations ────────────────────────────────────
        if mcc.alive:
            mcc.monthly_revenue = total_mcc_rev
            mcc_year_rev += total_mcc_rev
            # Infra degrades slightly each month; repaired at year end
            mcc.infra_health = max(0.30, mcc.infra_health - 0.002)

        # ── Monthly company dividends ─────────────────────────────────
        # All companies (including MCC) convert and distribute monthly
        for co in companies:
            if not co.alive:
                continue
            if co.s_buffer <= 0:
                continue

            v_convert = co.s_buffer * MAX_V_COMPANY
            co.v_tokens += v_convert

            if co.is_mcc:
                # MCC: board takes profit share, rest stays as capital reserve
                if co.v_tokens > 0:
                    profit = co.v_tokens * co.board_profit_share
                    co.v_tokens -= profit
                    per_member = profit / max(1, len(co.board_members))
                    for bid in co.board_members:
                        bm = people_lookup.get(bid)
                        if bm and bm.alive:
                            bm.v_tokens += per_member
                            bm.board_earnings += per_member
                            txn_batch.append((year, month_of_year, bid, co.id,
                                            "Board Profit Share", round(per_member, 2), "board_payment"))
            else:
                # Regular company: distribute 40% of V-token reserve as dividends
                if co.v_tokens > 0 and random.random() < 0.85:
                    dividend = co.v_tokens * 0.4
                    co.v_tokens -= dividend
                    owner_people = [(oid, people_lookup[oid]) for oid in co.owner_ids
                                   if oid in people_lookup and people_lookup[oid].alive]
                    total_shares = sum(p.co_shares.get(co.id, 0) for _, p in owner_people)
                    if total_shares > 0:
                        for oid, p in owner_people:
                            shares = p.co_shares.get(co.id, 0)
                            if shares > 0:
                                d = dividend * shares / total_shares
                                p.v_tokens += d
                                txn_batch.append((year, month_of_year, p.id, co.id,
                                                "Dividend Payment", round(d, 2), "dividend"))

            # S-buffer expires at month end — accumulate GDP before reset
            total_gdp += co.monthly_revenue
            co.s_buffer = 0
            co.monthly_revenue = 0

        # ── Company health drift ──────────────────────────────────────
        for co in companies:
            if co.alive and not co.is_mcc:
                co.health = min(1.0, max(0.05, co.health + random.gauss(0, 0.015)))
                if co.health < 0.1 and random.random() < 0.05:
                    co.alive = False
                    co.closed_year = year
                    co_close_updates.append((year, co.id))

        # ── Citizen snapshots — annual only ──────────────────────────
        if is_year_end:
            for p in people:
                snap_batch.append((p.id, year, 12,
                                  round(p.age, 2), round(p.v_tokens, 2), UBI, int(p.alive),
                                  round(p.habitat_size, 3), round(p.power_usage, 3),
                                  round(p.water_usage, 3), round(p.last_mcc_bill, 2)))

        # ── Year-end processing ───────────────────────────────────────
        if is_year_end:

            # ── Year-end MCC: repair infrastructure + update board approval ──
            if mcc.alive:
                # Reinvest 30% of V-token reserve into infrastructure repair
                repair = mcc.v_tokens * 0.30
                mcc.v_tokens -= repair
                mcc.infra_health = min(1.0, mcc.infra_health + repair * 0.00008)

                # Annual board election outcome — affects next year profit share
                vote_for = 0.25 + mcc.infra_health * 0.55
                if random.random() < vote_for:
                    mcc.board_profit_share = random.uniform(0.12, 0.25)
                else:
                    mcc.board_profit_share = random.uniform(0.02, 0.08)
                mcc.approval = min(1.0, max(0.1, 0.25 + mcc.infra_health * 0.75))

                cursor.execute(
                    "INSERT OR REPLACE INTO mcc_votes VALUES (?,?,?,?,?,?)",
                    (year, round(mcc.infra_health, 3), round(vote_for, 3),
                     round(mcc.board_profit_share, 3), round(mcc.approval, 3),
                     round(sum(people_lookup[bid].board_earnings
                               for bid in mcc.board_members
                               if bid in people_lookup and people_lookup[bid].alive), 2))
                )

            # ── Year-end: habitat drift for wealthier citizens ────────
            for p in people:
                if p.alive and p.v_tokens > 2000:
                    p.habitat_size = min(3.0, p.habitat_size + 0.02)

            # New company formation
            if random.random() < 0.25 and len(people) > 10:
                unused_types = [ct for ct in COMPANY_TYPES
                               if not any(co.name == ct[0] and co.alive for co in companies)]
                if unused_types:
                    ctype = random.choice(unused_types[:8])
                else:
                    ctype = random.choice(COMPANY_TYPES)
                candidates = [p for p in people if p.alive and 20 <= p.age < 60]
                if len(candidates) >= 2:
                    founders = random.sample(candidates, 2)
                    co = mk_company(ctype, founders, year)
                    companies.append(co)
                    co_lookup[co.id] = co
                    cursor.executemany(
                        "INSERT INTO companies VALUES (?,?,?,?,?,?,?)",
                        [(co.id, co.name, co.sector, co.founded_year, None,
                          int(co.is_mcc), ",".join(str(x) for x in co.owner_ids))]
                    )
                    for f in founders:
                        board_updates.append((co.name, f.id))

            # ── Annual summary ─────────────────────────────────────────
            bals = sorted(p.v_tokens for p in people if p.alive)
            n = len(bals)
            total_v = sum(bals)
            mean_v = total_v / n if n else 0
            median_v = bals[n//2] if n else 0
            max_v = bals[-1] if n else 0
            # Gini
            gnum = sum((2*(i+1)-n-1)*v for i,v in enumerate(bals))
            gini = gnum/(n*total_v) if n>1 and total_v>0 else 0

            alive_cos = [co for co in companies if co.alive and not co.is_mcc]

            cursor.execute("""
                INSERT OR REPLACE INTO annual_summaries VALUES
                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (year, n, round(total_v,2), round(mean_v,2),
                  round(median_v,2), round(max_v,2), round(gini,4),
                  len(alive_cos), round(mcc.infra_health,3),
                  round(mcc_year_rev,2), round(mcc.v_tokens,2),
                  round(mcc.board_profit_share,3), round(mcc.approval,3),
                  round(total_gdp,2), total_transactions,
                  round(month_s_issued * 12, 2)))

            # ── Viability summary — pre-computed from in-memory data ───
            # Dividends this year (from txn_batch before flush)
            year_divs = [(t[2], t[5]) for t in txn_batch if t[6] == 'dividend']
            total_year_divs = sum(amt for _, amt in year_divs)
            div_recipients = len(set(cid for cid, _ in year_divs))
            # Average MCC bill this year from bill_batch
            year_bills = [b[9] for b in bill_batch if b[1] == year]
            avg_bill = sum(year_bills)/len(year_bills) if year_bills else 0
            # V-token concentration (top holder as % of total)
            v_conc = (max_v / total_v * 100) if total_v > 0 else 0
            cursor.execute(
                "INSERT OR REPLACE INTO viability_summary VALUES (?,?,?,?,?)",
                (year, round(avg_bill,2), round(total_year_divs,2),
                 div_recipients, round(v_conc,3))
            )

            # Quintile assignment for mobility tracking
            if n > 0:
                q_breaks = [bals[int(n*f)] for f in [0.2,0.4,0.6,0.8]]
                def get_q(v):
                    for i,b in enumerate(q_breaks):
                        if v < b: return i
                    return 4
                for p in people:
                    if p.alive:
                        q = get_q(p.v_tokens)
                        p.quintile_history.append(q)

            mcc_year_rev = 0.0  # reset for next year
            flush_batches()

    # Final flush
    flush_batches()

    # Survivors — batch update (death_year should already be NULL from INSERT)
    # Just make sure any stragglers are cleared
    survivor_ids = [(p.id,) for p in people if p.alive]
    if survivor_ids:
        cursor.executemany("UPDATE citizens SET death_year=NULL WHERE id=?", survivor_ids)
    conn.commit()

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"SIMULATION COMPLETE")
    print(f"  Time elapsed:     {elapsed:.1f} seconds")
    print(f"  Total months:     {MONTHS:,}")
    print(f"  Total citizens:   {next_id[0]:,}")
    print(f"  Total companies:  {next_co_id[0]:,}")
    print(f"  Total txns:       {total_transactions:,}")
    print(f"  Database:         {DB_PATH}")
    print(f"{'='*60}")
    print(f"\nNow run:  python server.py")
    print(f"Then open: http://localhost:5000\n")

    conn.close()


# Patch Company to have sector_cost method
def sector_cost(self, svc_name):
    """Cost ratio for a service (what fraction of revenue is costs)."""
    cost_map = {
        "mcc": 0.50, "food_basic": 0.35, "food_premium": 0.45,
        "hospitality": 0.60, "health": 0.50, "science": 0.55,
        "manufacturing": 0.52, "construction": 0.65, "mining": 0.58,
        "transport": 0.55, "education": 0.40, "entertainment": 0.55,
        "professional": 0.45, "personal": 0.50, "commerce": 0.48,
        "communications": 0.50, "leisure": 0.55,
    }
    svc = SERVICES_BY_NAME.get(svc_name)
    if svc:
        return cost_map.get(svc[3], 0.50)
    return 0.50

Company.sector_cost = sector_cost

if __name__ == "__main__":
    run_simulation()
