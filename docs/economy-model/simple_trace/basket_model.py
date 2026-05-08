"""
Categorical basket model.

10 categories, each with its own annual price-change rate and price floor.
The aggregate basket trajectory falls out of these. See `basket_research.md`
for the sources behind each rate.

LAND IS DEFERRED TO A SEPARATE MODEL.
=====================================
Land is structurally different from everything else: fixed supply, scarcity
that intensifies under abundance, only acquirable via equity not income.
The path to land ownership runs through SPICE company ownership and dividends,
not through the UBI basket. That mechanism is its own future model.

This basket therefore represents "everything a citizen needs to live OTHER
than land". Shares re-normalised so the 10 remaining categories sum to 100%.

Module exports:
    DEFAULT_CATEGORIES — the 10 categories with research-derived rates
    basket_factor(year, categories) — aggregate multiplier vs year 0
    basket_breakdown(year, categories) — per-category snapshot for UI
"""
from __future__ import annotations


# Each category:
#   share_pct           — % of today's $980 basket allocated here
#   annual_change_pct   — net annual nominal price change (negative = deflation)
#   floor_pct           — physical price floor as % of 2026 price (None = no floor)
DEFAULT_CATEGORIES = [
    # Shares re-normalised after dropping LAND (originally 20% of full basket).
    # Each non-land share scaled by 1/0.80 = 1.25× to sum to 100% here.

    # Food
    {"name": "Food (processed)",       "share_pct": 22.5, "annual_change_pct":  -1.0, "floor_pct": 40,
     "rationale": "Vertical farms + automated logistics + lab meat. BLS food avg ~+2%/yr offset by ~3%/yr automation."},
    {"name": "Food (fresh)",           "share_pct":  7.5, "annual_change_pct":  +1.0, "floor_pct": 60,
     "rationale": "Land-bound, slower automation. Net mild inflation continues."},

    # Energy & transport
    {"name": "Energy & utilities",     "share_pct": 10.0, "annual_change_pct":  -5.0, "floor_pct": 15,
     "rationale": "Solar 20%/doubling, batteries 18-35%/doubling Wright curves. Aggressive deflation."},
    {"name": "Transport",              "share_pct": 10.0, "annual_change_pct":  -2.5, "floor_pct": 30,
     "rationale": "EV cost decline + autonomous removes driver. Vehicle still has materials cost."},

    # Services (slow)
    {"name": "Healthcare",             "share_pct":  6.25, "annual_change_pct":  +0.5, "floor_pct": 60,
     "rationale": "AI offsets historical +4.5%/yr but aging demographics keep mildly positive."},
    {"name": "Education",              "share_pct":  3.75, "annual_change_pct":  -1.0, "floor_pct": 30,
     "rationale": "AI tutors deflate content delivery; networking/credentialing value sticky."},
    {"name": "Services (hospitality)", "share_pct":  7.5, "annual_change_pct":  +2.0, "floor_pct": 90,
     "rationale": "Slowest to automate — physical presence + emotional labour. Premium prices."},

    # Goods (deflating)
    {"name": "Apparel & manufactured", "share_pct":  8.75, "annual_change_pct":  -3.0, "floor_pct": 30,
     "rationale": "BLS apparel already deflating (-0.5%/yr early 2026). AI accelerates."},
    {"name": "Digital/electronics",    "share_pct":  5.0, "annual_change_pct": -10.0, "floor_pct":  5,
     "rationale": "BLS computers -16%/yr historical. Approaches near-zero marginal cost."},

    # Housing (structure only — land is deferred to a separate model)
    {"name": "Housing — STRUCTURE",    "share_pct": 18.75, "annual_change_pct":  -1.5, "floor_pct": 40,
     "rationale": "Construction automatable (3D printing, modular, robotic). Materials cost remains. LAND deferred."},
]


def category_price_factor(cat: dict, year: int) -> float:
    """Price multiplier vs year 0 for a single category, respecting the floor."""
    rate = cat["annual_change_pct"] / 100
    factor = (1 + rate) ** year
    floor = cat.get("floor_pct")
    if floor is not None:
        factor = max(floor / 100, factor)
    return factor


def basket_factor(year: int, categories: list | None = None) -> float:
    """Aggregate basket multiplier — what fraction of 2026 basket cost is this year's basket."""
    cats = categories if categories is not None else DEFAULT_CATEGORIES
    return sum((cat["share_pct"] / 100) * category_price_factor(cat, year) for cat in cats)


def basket_breakdown(year: int, categories: list | None = None) -> list:
    """Per-category snapshot for dashboard rendering."""
    cats = categories if categories is not None else DEFAULT_CATEGORIES
    rows = []
    aggregate = basket_factor(year, cats)
    for cat in cats:
        f = category_price_factor(cat, year)
        # share IN today's basket × this category's price factor / aggregate basket factor
        # = this category's share OF the year's basket
        share_now = (cat["share_pct"] / 100) * f / aggregate * 100
        rows.append({
            "name": cat["name"],
            "share_pct_today": cat["share_pct"],
            "share_pct_now": share_now,
            "annual_change_pct": cat["annual_change_pct"],
            "floor_pct": cat.get("floor_pct"),
            "price_factor": f,
            "rationale": cat.get("rationale", ""),
        })
    return rows


if __name__ == "__main__":
    # Quick CLI sanity check
    for y in [0, 5, 10, 15, 20]:
        f = basket_factor(y)
        print(f"Year {y:>2}: basket × {f:.3f} = ${980 * f:>6,.0f}")
    print()
    print("Year 20 breakdown:")
    for row in sorted(basket_breakdown(20), key=lambda r: -r["share_pct_now"]):
        print(f"  {row['name']:<28} share_today={row['share_pct_today']:>3}%  "
              f"factor={row['price_factor']:.3f}  share_now={row['share_pct_now']:5.1f}%")
