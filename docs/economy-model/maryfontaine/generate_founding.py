"""
MaryFontaine simulator — founding data generator.

Instantiates the colony at month 0 per spec §3:
- 3,900 citizens distributed across 12 archetypes (10% scale of 39k)
- ~1,500 households with housing/mortgage distribution
- ~100 companies + 200 sole traders (~300 entities total)
- Equity holdings (permanent + time-limited) with internally-consistent totals
- Wallets for all entities
- Fisc + MCC at founding
- Basket categories
- run_metadata

Run:
    python -m docs.economy-model.maryfontaine.generate_founding --db mf.db [--scale 0.1] [--seed 42]

Then validate:
    python -m docs.economy-model.maryfontaine.validate --db mf.db
"""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import argparse
import math
import random
import sqlite3
import sys
import time

from scenarios import BASKET_WEIGHTS_USD, BASKET_TARGET_S


SPEC_VERSION = "v2-2026-05-02"


# ── Archetype distribution (per spec §3, scale 0.1 → 10% of 39,000 = 3,900) ────

ARCHETYPE_DIST = [
    # (archetype, pct_of_population, behavioural_distribution)
    ("children_under_18",    0.231, {"saver": 0.0, "balanced": 1.0, "spender": 0.0, "striver": 0.0}),
    ("honda_assembly",       0.082, {"saver": 0.30, "balanced": 0.50, "striver": 0.15, "spender": 0.05}),
    ("honda_admin",          0.021, {"saver": 0.25, "balanced": 0.40, "striver": 0.30, "spender": 0.05}),
    ("other_manufacturing",  0.064, {"saver": 0.30, "balanced": 0.50, "striver": 0.15, "spender": 0.05}),
    ("healthcare_worker",    0.046, {"saver": 0.35, "balanced": 0.45, "striver": 0.15, "spender": 0.05}),
    ("education_worker",     0.031, {"saver": 0.40, "balanced": 0.45, "striver": 0.10, "spender": 0.05}),
    ("retail_services",      0.103, {"saver": 0.20, "balanced": 0.50, "striver": 0.20, "spender": 0.10}),
    ("small_business_owner", 0.038, {"saver": 0.20, "balanced": 0.30, "striver": 0.45, "spender": 0.05}),
    ("sole_trader",          0.051, {"saver": 0.25, "balanced": 0.40, "striver": 0.30, "spender": 0.05}),
    ("remote_worker",        0.038, {"saver": 0.20, "balanced": 0.30, "striver": 0.35, "spender": 0.15}),
    ("retiree",              0.218, {"saver": 0.60, "balanced": 0.30, "striver": 0.0,  "spender": 0.10}),
    ("ubi_only_choice",      0.077, {"saver": 0.40, "balanced": 0.40, "striver": 0.05, "spender": 0.15}),
]

WORKER_ARCHETYPES = {
    "honda_assembly", "honda_admin", "other_manufacturing", "healthcare_worker",
    "education_worker", "retail_services", "small_business_owner", "sole_trader",
}

HOUSEHOLD_DIST = [
    # (composition, count_at_10pct_scale, adults, children)
    ("single_adult",         600, 1, 0),
    ("couple_no_kids",       350, 2, 0),
    ("family_with_kids",     450, 2, 2),  # average 2 children, varies 1-3 in practice
    ("single_parent",        100, 1, 2),  # average 1.5 children
]

HOUSING_DIST = [
    # (housing_type, fraction)
    ("owner_free_and_clear", 0.30),
    ("owner_with_mortgage",  0.35),
    ("renter_internal",      0.25),
    ("renter_external",      0.10),
]


# ── Company catalogue (per spec §3) ───────────────────────────────────────────
# (sector, count_at_10pct, sectors_served, max_revenue_per_month_s, is_exporter, is_external_owned, monthly_export_usd, monthly_import_usd)

COMPANY_CATALOGUE: List[Tuple] = [
    # (name_prefix, sector, count, sectors_served, monthly_rev_s, exporter, ext_owned, mo_export_usd, mo_import_usd, mcc)
    ("Honda MaryFontaine",       "automotive_manufacturing", 1,  "goods",                 600_000,  True,  True,  375_000, 208_000, False),
    ("MaryFontaine Cooperative", "utilities",                1,  "energy,services",       300_000,  False, False, 0,       0,       True),
    ("Bellefontaine Mfg",        "manufacturing",            4,  "goods",                 80_000,   True,  False, 25_000,  10_000,  False),
    ("Clinic",                   "healthcare",               4,  "services",              60_000,   False, False, 0,       3_000,   False),
    ("Hospital",                 "healthcare",               1,  "services",              250_000,  False, False, 0,       15_000,  False),
    ("Pharmacy",                 "healthcare",               2,  "services,goods",        50_000,   False, False, 0,       8_000,   False),
    ("Mental Health Clinic",     "healthcare",               1,  "services",              30_000,   False, False, 0,       1_000,   False),
    ("Elementary School",        "education",                2,  "services",              45_000,   False, False, 0,       1_500,   False),
    ("Middle School",            "education",                1,  "services",              35_000,   False, False, 0,       1_500,   False),
    ("High School",              "education",                1,  "services",              50_000,   False, False, 0,       2_000,   False),
    ("Vocational School",        "education",                1,  "services",              30_000,   False, False, 0,       1_500,   False),
    ("Supermarket",              "retail_grocery",           3,  "food",                  120_000,  False, False, 0,       40_000,  False),
    ("Hardware Store",           "retail",                   2,  "goods",                 50_000,   False, False, 0,       18_000,  False),
    ("General Retail",           "retail",                   7,  "goods",                 40_000,   False, False, 0,       12_000,  False),
    ("Diner",                    "restaurant",               5,  "food,services",         30_000,   False, False, 0,       6_000,   False),
    ("Cafe",                     "restaurant",               6,  "food,services",         20_000,   False, False, 0,       3_500,   False),
    ("Take-away",                "restaurant",               6,  "food,services",         18_000,   False, False, 0,       3_000,   False),
    ("Legal Services",           "professional_services",    4,  "services",              40_000,   False, False, 0,       2_000,   False),
    ("Accounting",               "professional_services",    4,  "services",              35_000,   False, False, 0,       1_500,   False),
    ("IT Services",              "professional_services",    4,  "services",              50_000,   False, False, 0,       4_000,   False),
    ("Builders",                 "construction",             3,  "services,goods",        70_000,   False, False, 0,       15_000,  False),
    ("Electrician",              "trades",                   3,  "services",              25_000,   False, False, 0,       4_000,   False),
    ("Plumber",                  "trades",                   2,  "services",              22_000,   False, False, 0,       3_500,   False),
    ("Auto Repair",              "auto_services",            4,  "services,goods",        35_000,   False, False, 0,       8_000,   False),
    ("Used Car Lot",             "auto_services",            2,  "goods",                 60_000,   False, False, 0,       30_000,  False),
    ("Misc Local",               "other",                    12, "goods,services",        20_000,   False, False, 0,       3_000,   False),
]

# Sole traders generated programmatically (one per sole_trader citizen, ~200 at 10% scale)


# ── Citizen archetype profiles (used for founding S balances + external income) ──

@dataclass
class ArchetypeProfile:
    archetype: str
    has_external_income: bool = False
    monthly_external_usd_mean: float = 0.0
    monthly_external_usd_std: float = 0.0
    initial_s_balance_mean: float = 0.0
    initial_s_balance_std: float = 0.0
    has_permanent_equity_at_founding: bool = False
    permanent_equity_shares_mean: float = 0.0


ARCHETYPE_PROFILES = {
    "children_under_18":    ArchetypeProfile("children_under_18"),
    "honda_assembly":       ArchetypeProfile("honda_assembly"),
    "honda_admin":          ArchetypeProfile("honda_admin", has_permanent_equity_at_founding=True, permanent_equity_shares_mean=0.5),
    "other_manufacturing":  ArchetypeProfile("other_manufacturing"),
    "healthcare_worker":    ArchetypeProfile("healthcare_worker", has_permanent_equity_at_founding=True, permanent_equity_shares_mean=0.3),
    "education_worker":     ArchetypeProfile("education_worker"),
    "retail_services":      ArchetypeProfile("retail_services"),
    "small_business_owner": ArchetypeProfile("small_business_owner", has_permanent_equity_at_founding=True, permanent_equity_shares_mean=15.0),
    "sole_trader":          ArchetypeProfile("sole_trader", has_permanent_equity_at_founding=True, permanent_equity_shares_mean=10.0),
    "remote_worker":        ArchetypeProfile("remote_worker", has_external_income=True,
                                             monthly_external_usd_mean=5_500, monthly_external_usd_std=2_000),
    "retiree":              ArchetypeProfile("retiree", has_external_income=True,
                                             monthly_external_usd_mean=400, monthly_external_usd_std=600,  # 30% have pension; mean reflects this
                                             initial_s_balance_mean=300, initial_s_balance_std=400,
                                             has_permanent_equity_at_founding=True, permanent_equity_shares_mean=8.0),
    "ubi_only_choice":      ArchetypeProfile("ubi_only_choice"),
}


# ── DB helpers ────────────────────────────────────────────────────────────────

def open_db(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path))
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def apply_schema(conn: sqlite3.Connection, schema_path: Path) -> None:
    with open(schema_path) as f:
        conn.executescript(f.read())
    conn.commit()


# ── Generation ────────────────────────────────────────────────────────────────

@dataclass
class GenContext:
    rng: random.Random
    scale: float                     # 0.1 = 10% scale
    target_population: int
    target_households: int
    next_wallet_id: int = 1


def gen_citizens(ctx: GenContext) -> List[Dict]:
    """Generate citizens per archetype distribution."""
    citizens: List[Dict] = []
    cid = 1
    for archetype, pct, behaviour_dist in ARCHETYPE_DIST:
        n = int(round(ctx.target_population * pct))
        for _ in range(n):
            beh_type = weighted_choice(ctx.rng, list(behaviour_dist.items()))
            if archetype == "children_under_18":
                age = ctx.rng.uniform(0, 17.99)
            elif archetype == "retiree":
                age = ctx.rng.uniform(65, 90)
            else:
                age = ctx.rng.uniform(18, 65)
            citizens.append({
                "id": cid,
                "name": f"{archetype}_{cid}",
                "age_at_founding": round(age, 1),
                "archetype": archetype,
                "behavioural_type": beh_type,
                "household_id": None,        # assigned later
                "death_year": None,
                "arrival_year": 0,
                "departure_year": None,
            })
            cid += 1
    # Pad/trim to target population (rounding can drift by a few)
    while len(citizens) < ctx.target_population:
        citizens.append(_make_citizen(ctx, len(citizens) + 1, "ubi_only_choice"))
    while len(citizens) > ctx.target_population:
        citizens.pop()
    return citizens


def _make_citizen(ctx: GenContext, cid: int, archetype: str) -> Dict:
    profile = ARCHETYPE_PROFILES[archetype]
    behaviour_dist = next(b for a, _, b in ARCHETYPE_DIST if a == archetype)
    return {
        "id": cid,
        "name": f"{archetype}_{cid}",
        "age_at_founding": round(ctx.rng.uniform(18, 65), 1),
        "archetype": archetype,
        "behavioural_type": weighted_choice(ctx.rng, list(behaviour_dist.items())),
        "household_id": None,
        "death_year": None,
        "arrival_year": 0,
        "departure_year": None,
    }


def gen_households(ctx: GenContext, citizens: List[Dict]) -> List[Dict]:
    """Group citizens into households per HOUSEHOLD_DIST. Children must be in family households."""
    households: List[Dict] = []

    # Pools
    children = [c for c in citizens if c["archetype"] == "children_under_18"]
    adults = [c for c in citizens if c["archetype"] != "children_under_18"]
    ctx.rng.shuffle(children)
    ctx.rng.shuffle(adults)

    hh_id = 1
    family_target = sum(count for comp, count, ad, ch in HOUSEHOLD_DIST if ch > 0)
    single_parent_target = next(count for comp, count, ad, ch in HOUSEHOLD_DIST if comp == "single_parent")
    family_with_kids_target = next(count for comp, count, ad, ch in HOUSEHOLD_DIST if comp == "family_with_kids")

    # Build family households first so children get placed
    children_iter = iter(children)
    for _ in range(family_with_kids_target):
        if len(adults) < 2:
            break
        a1, a2 = adults.pop(), adults.pop()
        kids = []
        n_kids = ctx.rng.choice([1, 2, 2, 2, 3])  # 2 average
        for _ in range(n_kids):
            try:
                kids.append(next(children_iter))
            except StopIteration:
                break
        hh = _make_household(ctx, hh_id, "family_with_kids", [a1, a2] + kids)
        households.append(hh)
        hh_id += 1

    for _ in range(single_parent_target):
        if not adults:
            break
        a = adults.pop()
        kids = []
        n_kids = ctx.rng.choice([1, 1, 2, 2])  # 1.5 average
        for _ in range(n_kids):
            try:
                kids.append(next(children_iter))
            except StopIteration:
                break
        hh = _make_household(ctx, hh_id, "single_parent", [a] + kids)
        households.append(hh)
        hh_id += 1

    # Any remaining children go into family households (extend existing or new)
    remaining_kids = list(children_iter)
    while remaining_kids and adults:
        if len(adults) >= 2:
            a1, a2 = adults.pop(), adults.pop()
            ks = remaining_kids[:ctx.rng.choice([1, 2])]
            remaining_kids = remaining_kids[len(ks):]
            hh = _make_household(ctx, hh_id, "family_with_kids", [a1, a2] + ks)
            households.append(hh)
            hh_id += 1
        else:
            a = adults.pop()
            ks = remaining_kids[:1]
            remaining_kids = remaining_kids[1:]
            hh = _make_household(ctx, hh_id, "single_parent", [a] + ks)
            households.append(hh)
            hh_id += 1

    # Couples
    couple_target = next(count for comp, count, ad, ch in HOUSEHOLD_DIST if comp == "couple_no_kids")
    for _ in range(couple_target):
        if len(adults) < 2:
            break
        a1, a2 = adults.pop(), adults.pop()
        hh = _make_household(ctx, hh_id, "couple_no_kids", [a1, a2])
        households.append(hh)
        hh_id += 1

    # Singles — everyone else
    while adults:
        a = adults.pop()
        hh = _make_household(ctx, hh_id, "single_adult", [a])
        households.append(hh)
        hh_id += 1

    return households


def _make_household(ctx: GenContext, hh_id: int, composition: str, members: List[Dict]) -> Dict:
    # Assign citizens to this household
    for m in members:
        m["household_id"] = hh_id
    primary = next((m for m in members if m["archetype"] != "children_under_18"), members[0])
    # Housing
    housing_type = weighted_choice(ctx.rng, HOUSING_DIST)
    housing_cost_usd = 0.0
    housing_cost_s = 0.0
    mortgage_balance_usd = 0.0
    mortgage_rate = 0.0
    mortgage_remaining_months = 0
    if housing_type == "owner_with_mortgage":
        mortgage_balance_usd = ctx.rng.uniform(50_000, 300_000)
        mortgage_rate = ctx.rng.uniform(0.04, 0.07)
        mortgage_remaining_months = ctx.rng.randint(60, 360)
        # Simple level-payment formula for monthly USD payment
        r = mortgage_rate / 12.0
        n = mortgage_remaining_months
        if r > 0:
            housing_cost_usd = mortgage_balance_usd * r * (1 + r) ** n / ((1 + r) ** n - 1)
        else:
            housing_cost_usd = mortgage_balance_usd / n
    elif housing_type == "renter_internal":
        # Internal rent in S — sized to household size, paid to a colony landlord (a company)
        n_adults = sum(1 for m in members if m["archetype"] != "children_under_18")
        housing_cost_s = ctx.rng.uniform(150, 350) * n_adults
    elif housing_type == "renter_external":
        # External rent in USD
        n_adults = sum(1 for m in members if m["archetype"] != "children_under_18")
        housing_cost_usd = ctx.rng.uniform(800, 1_800) * (1 if n_adults == 1 else 1.5)

    # Basket consumption multiplier — scales with household size
    n_adults = sum(1 for m in members if m["archetype"] != "children_under_18")
    n_kids = sum(1 for m in members if m["archetype"] == "children_under_18")
    basket_mult = n_adults * 1.0 + n_kids * 0.5

    # Discretionary propensity — weighted by primary's behavioural type
    discr = {"saver": 0.20, "balanced": 0.50, "striver": 0.40, "spender": 0.80}.get(
        primary["behavioural_type"], 0.50)

    return {
        "id": hh_id,
        "composition": composition,
        "housing_type": housing_type,
        "monthly_housing_cost_usd": round(housing_cost_usd, 2),
        "monthly_housing_cost_s": round(housing_cost_s, 2),
        "mortgage_balance_usd": round(mortgage_balance_usd, 2),
        "mortgage_rate": round(mortgage_rate, 4),
        "mortgage_remaining_months": mortgage_remaining_months,
        "primary_citizen_id": primary["id"],
        "basket_baseline_multiplier": round(basket_mult, 2),
        "discretionary_propensity": round(discr, 2),
    }


def gen_companies(ctx: GenContext, citizens: List[Dict]) -> List[Dict]:
    """Generate ~100 companies + sole_trader companies (one per sole_trader citizen)."""
    companies: List[Dict] = []
    next_id = 1

    # Catalogue companies
    for prefix, sector, count, sectors_served, mo_rev, exporter, ext_owned, mo_export, mo_import, is_mcc in COMPANY_CATALOGUE:
        n = max(1, int(round(count * (ctx.scale / 0.1))))  # COMPANY_CATALOGUE counts are at 10% scale
        for i in range(n):
            cfo = ctx.rng.choice(["conservative", "aggressive_dividend", "growth_focused"])
            companies.append({
                "id": next_id,
                "name": f"{prefix} {i+1}" if n > 1 else prefix,
                "sector": sector,
                "sectors_served": sectors_served,
                "founded_year": 0,
                "closed_year": None,
                "is_external_owned": 1 if ext_owned else 0,
                "cfo_policy": cfo,
                "max_revenue_per_month_s": mo_rev * (ctx.scale / 0.1),  # scale revenue capacity
                "is_mcc": 1 if is_mcc else 0,
                "is_exporter": 1 if exporter else 0,
                "monthly_export_usd_baseline": mo_export * (ctx.scale / 0.1),
                "monthly_import_usd_baseline": mo_import * (ctx.scale / 0.1),
            })
            next_id += 1

    # Sole traders — one company per sole_trader citizen
    sole_traders = [c for c in citizens if c["archetype"] == "sole_trader"]
    for st in sole_traders:
        sectors_served = ctx.rng.choice(["services", "goods", "services,goods", "food"])
        companies.append({
            "id": next_id,
            "name": f"Sole Trader {st['id']}",
            "sector": "sole_trader",
            "sectors_served": sectors_served,
            "founded_year": 0,
            "closed_year": None,
            "is_external_owned": 0,
            "cfo_policy": "conservative",
            "max_revenue_per_month_s": ctx.rng.uniform(2_000, 8_000),
            "is_mcc": 0,
            "is_exporter": 0,
            "monthly_export_usd_baseline": 0,
            "monthly_import_usd_baseline": ctx.rng.uniform(0, 500),
            "_owner_citizen_id": st["id"],   # used in equity gen
        })
        next_id += 1

    return companies


def gen_equity(ctx: GenContext, citizens: List[Dict], companies: List[Dict]) -> List[Dict]:
    """Generate equity holdings for all companies. Honda gets the special 60/5/35 split.
    Sole-trader companies are 100% owned by their citizen. Other companies have a
    mix of permanent (founder/investor) and time-limited (worker) shares."""
    equity: List[Dict] = []

    # Index citizens by archetype for worker assignment
    by_archetype: Dict[str, List[Dict]] = {}
    for c in citizens:
        by_archetype.setdefault(c["archetype"], []).append(c)

    # For each company, generate holdings
    for company in companies:
        if company["sector"] == "automotive_manufacturing":
            _gen_honda_equity(ctx, company, by_archetype, equity)
        elif company["sector"] == "sole_trader":
            owner_id = company["_owner_citizen_id"]
            equity.append({
                "company_id": company["id"],
                "holder_type": "citizen",
                "holder_id": owner_id,
                "external_holder_name": None,
                "share_type": "permanent",
                "share_count": 100.0,
                "issued_year": 0,
                "issued_month": 0,
                "expiry_year": None,
                "expiry_month": None,
                "cancelled": 0,
            })
        else:
            _gen_generic_company_equity(ctx, company, by_archetype, equity)

    # Strip transient field
    for c in companies:
        c.pop("_owner_citizen_id", None)

    return equity


def _gen_honda_equity(ctx: GenContext, company: Dict, by_archetype: Dict[str, List[Dict]],
                      equity: List[Dict]) -> None:
    # Per spec §3 Honda specifics:
    # 60% Honda Inc permanent (480 shares of 800)
    # 5% colony stakeholders permanent (40 shares)
    # 35% time-limited across 400 workers:
    #   Assembly workers: 0.5 each = 160 shares
    #   Admin/management: 1.5 each = 120 shares
    #   Total time-limited: 280 (which is 35% of 800)
    # At 10% scale: 40 assembly + 12 admin (= 320×0.1 + 80×0.1 floors), but our archetype gen
    # produced honda_assembly count and honda_admin count proportional to 0.082 and 0.021;
    # use whatever the actual counts are.
    assembly = by_archetype.get("honda_assembly", [])
    admin = by_archetype.get("honda_admin", [])
    n_assembly_shares = sum(0.5 for _ in assembly)
    n_admin_shares = sum(1.5 for _ in admin)
    n_time_limited = n_assembly_shares + n_admin_shares
    # Total = time_limited / 0.35
    n_total = n_time_limited / 0.35 if n_time_limited > 0 else 800.0
    n_honda_inc = n_total * 0.60
    n_colony_stake = n_total * 0.05

    # Honda Inc permanent
    equity.append({
        "company_id": company["id"],
        "holder_type": "external",
        "holder_id": None,
        "external_holder_name": "Honda Inc",
        "share_type": "permanent",
        "share_count": round(n_honda_inc, 2),
        "issued_year": 0, "issued_month": 0,
        "expiry_year": None, "expiry_month": None,
        "cancelled": 0,
    })
    # Colony stakeholders — pick a few small_business_owners or retirees
    eligible = (by_archetype.get("small_business_owner", []) + by_archetype.get("retiree", []))
    n_stakeholders = min(10, max(2, len(eligible) // 50))
    chosen = ctx.rng.sample(eligible, n_stakeholders) if len(eligible) >= n_stakeholders else eligible
    if chosen:
        per_stake = n_colony_stake / len(chosen)
        for ch in chosen:
            equity.append({
                "company_id": company["id"],
                "holder_type": "citizen",
                "holder_id": ch["id"],
                "external_holder_name": None,
                "share_type": "permanent",
                "share_count": round(per_stake, 2),
                "issued_year": 0, "issued_month": 0,
                "expiry_year": None, "expiry_month": None,
                "cancelled": 0,
            })

    # Time-limited shares to assembly + admin
    for w in assembly:
        equity.append({
            "company_id": company["id"],
            "holder_type": "citizen",
            "holder_id": w["id"],
            "external_holder_name": None,
            "share_type": "time_limited",
            "share_count": 0.5,
            "issued_year": 0, "issued_month": 0,
            "expiry_year": None, "expiry_month": None,   # decided by company policy when worker leaves
            "cancelled": 0,
        })
    for w in admin:
        equity.append({
            "company_id": company["id"],
            "holder_type": "citizen",
            "holder_id": w["id"],
            "external_holder_name": None,
            "share_type": "time_limited",
            "share_count": 1.5,
            "issued_year": 0, "issued_month": 0,
            "expiry_year": None, "expiry_month": None,
            "cancelled": 0,
        })


def _gen_generic_company_equity(ctx: GenContext, company: Dict,
                                by_archetype: Dict[str, List[Dict]], equity: List[Dict]) -> None:
    """Generic colony company: 1-3 small_business_owners hold permanent equity (~80% combined),
    workers from sector-relevant archetype hold time-limited (~20% combined). Sized by max_revenue."""
    sector_to_worker_archetype = {
        "manufacturing": "other_manufacturing",
        "healthcare": "healthcare_worker",
        "education": "education_worker",
        "retail_grocery": "retail_services",
        "retail": "retail_services",
        "restaurant": "retail_services",
        "professional_services": "retail_services",   # placeholder; mostly small_business_owners
        "construction": "retail_services",
        "trades": "retail_services",
        "auto_services": "retail_services",
        "utilities": "retail_services",
        "other": "retail_services",
    }
    worker_arch = sector_to_worker_archetype.get(company["sector"], "retail_services")
    pool = by_archetype.get(worker_arch, [])

    # Permanent: 1-3 small_business_owners, scaled to revenue
    n_owners = max(1, min(3, int(company["max_revenue_per_month_s"] / 100_000)))
    sbo_pool = by_archetype.get("small_business_owner", [])
    if sbo_pool:
        owners = ctx.rng.sample(sbo_pool, min(n_owners, len(sbo_pool)))
    else:
        owners = []
    perm_total = 80.0
    if owners:
        per_owner = perm_total / len(owners)
        for o in owners:
            equity.append({
                "company_id": company["id"],
                "holder_type": "citizen", "holder_id": o["id"],
                "external_holder_name": None,
                "share_type": "permanent",
                "share_count": round(per_owner, 2),
                "issued_year": 0, "issued_month": 0,
                "expiry_year": None, "expiry_month": None, "cancelled": 0,
            })

    # Time-limited: 5-30 workers depending on company size
    n_workers = max(2, min(30, int(company["max_revenue_per_month_s"] / 8_000)))
    if pool:
        workers = ctx.rng.sample(pool, min(n_workers, len(pool)))
    else:
        workers = []
    timed_total = 20.0
    if workers:
        per_worker = timed_total / len(workers)
        for w in workers:
            equity.append({
                "company_id": company["id"],
                "holder_type": "citizen", "holder_id": w["id"],
                "external_holder_name": None,
                "share_type": "time_limited",
                "share_count": round(per_worker, 2),
                "issued_year": 0, "issued_month": 0,
                "expiry_year": None, "expiry_month": None, "cancelled": 0,
            })


# ── Wallets and balances ─────────────────────────────────────────────────────

def gen_wallets(citizens: List[Dict], companies: List[Dict]) -> List[Dict]:
    """One wallet per citizen, one per company, plus Fisc + MCC wallets."""
    wallets: List[Dict] = []
    wid = 1

    # Fisc wallet (USDC reserve held here; S supply minted from here for UBI)
    wallets.append({"id": wid, "owner_type": "fisc", "owner_id": 0,
                    "s_balance": 0.0, "usdc_balance": 5_000_000.0})  # scale by --scale outside if desired
    wid += 1

    # External (sink for cashouts, source for external income). Untracked balance.
    wallets.append({"id": wid, "owner_type": "external", "owner_id": 0,
                    "s_balance": 0.0, "usdc_balance": 0.0})
    wid += 1

    for c in citizens:
        # Retirees may have small founding S balance (per spec §3 — pre-converted savings)
        s_bal = 0.0
        prof = ARCHETYPE_PROFILES[c["archetype"]]
        if prof.initial_s_balance_mean > 0:
            s_bal = max(0.0, random.gauss(prof.initial_s_balance_mean, prof.initial_s_balance_std))
        wallets.append({"id": wid, "owner_type": "citizen", "owner_id": c["id"],
                        "s_balance": round(s_bal, 2), "usdc_balance": 0.0})
        wid += 1

    for co in companies:
        # Working capital: ~1 month of operating costs
        wc = max(1_000, co["max_revenue_per_month_s"] * 0.4)
        wallets.append({"id": wid, "owner_type": "company", "owner_id": co["id"],
                        "s_balance": round(wc, 2), "usdc_balance": 0.0})
        wid += 1

    return wallets


# ── Persistence ──────────────────────────────────────────────────────────────

def write_to_db(conn: sqlite3.Connection, citizens: List[Dict], households: List[Dict],
                companies: List[Dict], equity: List[Dict], wallets: List[Dict],
                scenario: str, scale: float, seed: int) -> None:
    cur = conn.cursor()

    # Households first (citizens reference)
    cur.executemany("""
        INSERT INTO households (id, composition, housing_type, monthly_housing_cost_usd,
            monthly_housing_cost_s, mortgage_balance_usd, mortgage_rate,
            mortgage_remaining_months, primary_citizen_id, basket_baseline_multiplier,
            discretionary_propensity)
        VALUES (:id, :composition, :housing_type, :monthly_housing_cost_usd,
            :monthly_housing_cost_s, :mortgage_balance_usd, :mortgage_rate,
            :mortgage_remaining_months, :primary_citizen_id, :basket_baseline_multiplier,
            :discretionary_propensity)
    """, households)

    cur.executemany("""
        INSERT INTO citizens (id, name, age_at_founding, household_id, archetype,
            behavioural_type, death_year, arrival_year, departure_year)
        VALUES (:id, :name, :age_at_founding, :household_id, :archetype,
            :behavioural_type, :death_year, :arrival_year, :departure_year)
    """, citizens)

    cur.executemany("""
        INSERT INTO companies (id, name, sector, sectors_served, founded_year, closed_year,
            is_external_owned, cfo_policy, max_revenue_per_month_s, is_mcc, is_exporter,
            monthly_export_usd_baseline, monthly_import_usd_baseline)
        VALUES (:id, :name, :sector, :sectors_served, :founded_year, :closed_year,
            :is_external_owned, :cfo_policy, :max_revenue_per_month_s, :is_mcc, :is_exporter,
            :monthly_export_usd_baseline, :monthly_import_usd_baseline)
    """, companies)

    cur.executemany("""
        INSERT INTO equity_holdings (company_id, holder_type, holder_id, external_holder_name,
            share_type, share_count, issued_year, issued_month, expiry_year, expiry_month,
            cancelled)
        VALUES (:company_id, :holder_type, :holder_id, :external_holder_name,
            :share_type, :share_count, :issued_year, :issued_month, :expiry_year, :expiry_month,
            :cancelled)
    """, equity)

    cur.executemany("""
        INSERT INTO wallets (id, owner_type, owner_id, s_balance, usdc_balance)
        VALUES (:id, :owner_type, :owner_id, :s_balance, :usdc_balance)
    """, wallets)

    # Basket categories
    cur.executemany("""
        INSERT INTO basket_categories (name, weight_at_founding_usd, weight_pct)
        VALUES (?, ?, ?)
    """, [(name, usd, usd / sum(BASKET_WEIGHTS_USD.values()))
          for name, usd in BASKET_WEIGHTS_USD.items()])

    # Run metadata
    meta = {
        "scenario": scenario,
        "scale": str(scale),
        "seed": str(seed),
        "spec_version": SPEC_VERSION,
        "started_at": str(int(time.time())),
        "noise": "0.0",
    }
    cur.executemany("INSERT OR REPLACE INTO run_metadata (key, value) VALUES (?, ?)",
                    list(meta.items()))

    conn.commit()


# ── Utilities ────────────────────────────────────────────────────────────────

def weighted_choice(rng: random.Random, items_with_weights):
    """items_with_weights: list of (item, weight) tuples."""
    total = sum(w for _, w in items_with_weights)
    r = rng.uniform(0, total)
    acc = 0.0
    for item, w in items_with_weights:
        acc += w
        if r <= acc:
            return item
    return items_with_weights[-1][0]


# ── CLI ──────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser(description="MaryFontaine founding data generator")
    ap.add_argument("--db", required=True, help="path to output SQLite DB (will be overwritten)")
    ap.add_argument("--schema", default=None, help="path to schema.sql (defaults to alongside this script)")
    ap.add_argument("--scale", type=float, default=0.1, help="scale factor; 0.1 = 3,900 citizens")
    ap.add_argument("--scenario", default="convulsion", help="scenario name (recorded in metadata; trajectory built by run.py)")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    here = Path(__file__).resolve().parent
    schema_path = Path(args.schema) if args.schema else here / "schema.sql"
    db_path = Path(args.db)
    if db_path.exists():
        db_path.unlink()

    rng = random.Random(args.seed)
    random.seed(args.seed)   # for the gauss draws in gen_wallets — TODO: thread ctx.rng there too

    # Population target — children + adult archetypes sum to slightly more or less than 39000*scale
    # due to rounding; we pin target_population to scale * 39000.
    target_pop = int(round(39_000 * args.scale))
    target_hh = int(round(1_500 * args.scale))

    ctx = GenContext(rng=rng, scale=args.scale,
                     target_population=target_pop, target_households=target_hh)

    print(f"Generating MaryFontaine founding data: scale={args.scale}, target_pop={target_pop}, seed={args.seed}",
          file=sys.stderr)

    citizens = gen_citizens(ctx)
    households = gen_households(ctx, citizens)
    companies = gen_companies(ctx, citizens)
    equity = gen_equity(ctx, citizens, companies)
    wallets = gen_wallets(citizens, companies)

    print(f"  citizens:   {len(citizens):>6}", file=sys.stderr)
    print(f"  households: {len(households):>6}", file=sys.stderr)
    print(f"  companies:  {len(companies):>6}", file=sys.stderr)
    print(f"  equity:     {len(equity):>6}", file=sys.stderr)
    print(f"  wallets:    {len(wallets):>6}", file=sys.stderr)

    conn = open_db(db_path)
    apply_schema(conn, schema_path)
    write_to_db(conn, citizens, households, companies, equity, wallets,
                scenario=args.scenario, scale=args.scale, seed=args.seed)
    conn.close()

    print(f"Wrote {db_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
