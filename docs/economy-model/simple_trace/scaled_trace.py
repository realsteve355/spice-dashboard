"""
Scaled-up single-month trace — 20 families, ~50 citizens, 5 local companies,
~25 external suppliers, ~600 transactions per month.

Two design changes from the 2-citizen trace per Steve's clarification:
  1. The automation levy funds EVERYONE's UBI, not just workless.
  2. Income earned through a local company is PURE UPSIDE for the founder.
     No more circular Dave's Co → Fisc → Dave routing. Local companies have
     external revenue (USDC inflow), pay salaries directly to employees in S
     (after Fisc converts USDC to S).

Macro context per `project_macro_context.md`: AI has collapsed the wider US
economy to ~70% unemployment; AXION colonies are essential customer bases.
Levy rates that look high in 2024 terms are the price of access to one of
the few solvent markets in this future.

Run:
    python scaled_trace.py
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Tuple
from collections import defaultdict


# ── Configuration ───────────────────────────────────────────────────────────

FISC_RATE = 35.00              # USD per S at parity
BASKET_USD = 980.00            # one month's basket per adult
UBI_USD = BASKET_USD * 1.10    # $1,078/month per citizen (per Steve: UBI = basket x 1.10)
GAS_LEVY_USD = 0.005           # fixed per-tx
PROTOCOL_RATE = 0.001          # 0.1% of transaction value


# ── Cast ────────────────────────────────────────────────────────────────────

# Family templates: (count, composition_label, working_adults, retired_adults,
#                    workless_adults, children, salary_each_usd, pension_each_usd)
# UBI applies to every member regardless of working status.
FAMILY_TYPES = [
    # 4 single workless adults
    (4, "single workless",         0, 0, 1, 0,    0,        0),
    # 3 single retirees
    (3, "single retired",          0, 1, 0, 0,    0,    1_200),
    # 3 retired couples
    (3, "retired couple",          0, 2, 0, 0,    0,    1_000),
    # 3 working singles (e.g. local company employee)
    (3, "single worker",           1, 0, 0, 0, 4_000,        0),
    # 2 working couples no kids
    (2, "couple, both working",    2, 0, 0, 0, 4_000,        0),
    # 1 working couple with 2 kids — Dave's family (the founder)
    (1, "Dave's family (founder)", 2, 0, 0, 2, 6_000,        0),
    # 4 working family with 2 kids (one parent works)
    (4, "family-with-kids, 1 earner", 1, 0, 1, 2, 4_000,     0),
]

# Local companies. Each has:
#  - external_rev_usd:  monthly inbound USD from outside-colony customers (NOT LEVIED)
#  - p_per_emp:         the supplier P/emp used when families buy from them (LEVIED)
#  - b2b_import_usd:    monthly B2B spend at external suppliers (LEVIED)
#  - b2b_import_sector: which external sector the imports come from
LOCAL_COMPANIES = [
    {"name": "Dave's Co",      "external_rev_usd": 80_000, "p_per_emp": 200_000,
     "employees": 4, "b2b_import_usd": 15_000, "b2b_import_sector": "retail_online"},
    {"name": "Colony Café",    "external_rev_usd": 0,      "p_per_emp":  15_000,
     "employees": 3, "b2b_import_usd":  4_000, "b2b_import_sector": "grocery"},
    {"name": "FixIt Repair",   "external_rev_usd": 0,      "p_per_emp":  40_000,
     "employees": 2, "b2b_import_usd":  2_000, "b2b_import_sector": "misc"},
    {"name": "Hilltop School", "external_rev_usd": 0,      "p_per_emp":  30_000,
     "employees": 5, "b2b_import_usd":  3_000, "b2b_import_sector": "retail_online"},
    {"name": "MedClinic",      "external_rev_usd": 0,      "p_per_emp":  80_000,
     "employees": 3, "b2b_import_usd":  6_000, "b2b_import_sector": "healthcare"},
]

# Internal-commerce spending pattern: % of family's monthly income that goes
# to each local company (citizen → local company, levied at local supplier P/emp).
# Total internal share is moderate — bulk still goes to external suppliers.
INTERNAL_SECTOR_PATTERN = [
    # (local_company_name, %_of_family_income, #txs_per_family_month)
    ("Colony Café",    0.04, 6),   # coffee, lunch — frequent low-value
    ("FixIt Repair",   0.02, 1),   # occasional repairs
    ("Hilltop School", 0.05, 1),   # tuition (only family-with-kids in practice)
    ("MedClinic",      0.03, 1),   # routine visits
]

# External suppliers (sector, name, profit_per_employee_usd)
EXTERNAL_SUPPLIERS = [
    ("grocery",       "Walmart",                  18_000),
    ("grocery",       "Kroger",                   20_000),
    ("grocery",       "Costco",                   45_000),
    ("restaurant",    "McDonald's",               30_000),
    ("restaurant",    "Chipotle",                 38_000),
    ("restaurant",    "Local Diner",              22_000),
    ("utility",       "AEP Energy",              240_000),
    ("utility",       "Verizon",                 280_000),
    ("utility",       "Comcast",                 240_000),
    ("retail_online", "Amazon",                  180_000),
    ("retail_online", "Target",                   25_000),
    ("retail_online", "Best Buy",                 28_000),
    ("healthcare",    "Hospital",                100_000),
    ("healthcare",    "Pharmacy",                 22_000),
    ("healthcare",    "Specialist Clinic",       150_000),
    ("entertainment", "Netflix",                 400_000),
    ("entertainment", "Disney+",                 220_000),
    ("transport",     "Uber",                    140_000),
    ("transport",     "Local Gas Station",        50_000),
    ("professional",  "Law Firm (AI-heavy)",     400_000),
    ("professional",  "Accounting Co",           120_000),
    ("handmade",      "Furniture Maker",          50_000),
    ("handmade",      "Craft Bakery",             40_000),
    ("misc",          "Hardware Store",           35_000),
    ("misc",          "Pet Supplies",             45_000),
]

# Spending pattern: % of family's external monthly spending allocated to each sector
# Plus typical # transactions per family per month for that sector
SECTOR_SPEND_PATTERN = [
    # (sector, %_of_family_spending, #txs_per_family_month)
    ("grocery",       0.30,  6),  # 30% of family spend, ~6 trips
    ("restaurant",    0.10,  4),
    ("utility",       0.12,  3),
    ("retail_online", 0.18,  4),
    ("healthcare",    0.08,  2),
    ("entertainment", 0.04,  1),
    ("transport",     0.06,  3),
    ("professional",  0.03,  1),
    ("handmade",      0.02,  1),
    ("misc",          0.07,  2),
]


# ── Building the population and income ──────────────────────────────────────

@dataclass
class Family:
    family_id: int
    label: str
    adults_working: int
    adults_retired: int
    adults_workless: int
    children: int
    salary_each_usd: float
    pension_each_usd: float

    @property
    def total_members(self):
        return self.adults_working + self.adults_retired + self.adults_workless + self.children

    @property
    def monthly_ubi(self):
        # Everyone gets UBI; children's UBI accrues to the family
        return self.total_members * UBI_USD

    @property
    def monthly_salary(self):
        return self.adults_working * self.salary_each_usd

    @property
    def monthly_pension(self):
        return (self.adults_retired) * self.pension_each_usd

    @property
    def monthly_income(self):
        return self.monthly_ubi + self.monthly_salary + self.monthly_pension


def build_families() -> List[Family]:
    families: List[Family] = []
    fid = 0
    for (count, label, w, r, wo, k, salary, pension) in FAMILY_TYPES:
        for _ in range(count):
            fid += 1
            families.append(Family(fid, label, w, r, wo, k, salary, pension))
    return families


# ── Spending model ──────────────────────────────────────────────────────────

@dataclass
class Transaction:
    family_id: int             # buyer's family id (or 0 if local company is buyer)
    sector: str
    supplier_name: str
    supplier_p_per_emp: float
    supplier_kind: str         # 'external' or 'local'
    buyer_kind: str            # 'family' or 'local_company'
    gross_usd: float


def generate_transactions(families: List[Family]) -> List[Transaction]:
    """Generate three streams of LEVIED transactions:
    A) Family → external supplier  (outbound external commerce)
    B) Family → local company      (internal commerce)
    C) Local company → external    (B2B imports)
    Inbound external (external_customer → local company) is NOT levied
    per Steve's destination-principle clarification.
    """
    txs: List[Transaction] = []
    suppliers_by_sector: Dict[str, List[Tuple[str, float]]] = defaultdict(list)
    for sector, name, p_emp in EXTERNAL_SUPPLIERS:
        suppliers_by_sector[sector].append((name, p_emp))

    EXTERNAL_SPEND_FRACTION = 0.66  # leave room for internal + savings

    # ── A: Family → external ────────────────────────────────────────────
    for f in families:
        external_budget = f.monthly_income * EXTERNAL_SPEND_FRACTION
        for sector, share, n_tx in SECTOR_SPEND_PATTERN:
            sector_budget = external_budget * share
            tx_amount = sector_budget / n_tx if n_tx > 0 else 0
            sector_suppliers = suppliers_by_sector.get(sector, [])
            if not sector_suppliers:
                continue
            for i in range(n_tx):
                supplier_name, p_emp = sector_suppliers[i % len(sector_suppliers)]
                txs.append(Transaction(
                    family_id=f.family_id, sector=sector,
                    supplier_name=supplier_name, supplier_p_per_emp=p_emp,
                    supplier_kind="external", buyer_kind="family",
                    gross_usd=tx_amount,
                ))

    # ── B: Family → local company (internal commerce) ─────────────────────
    local_co_by_name = {co["name"]: co for co in LOCAL_COMPANIES}
    for f in families:
        for co_name, share, n_tx in INTERNAL_SECTOR_PATTERN:
            # School only meaningful for families with children
            if co_name == "Hilltop School" and f.children == 0:
                continue
            sector_budget = f.monthly_income * share
            tx_amount = sector_budget / n_tx if n_tx > 0 else 0
            co = local_co_by_name[co_name]
            for _ in range(n_tx):
                txs.append(Transaction(
                    family_id=f.family_id, sector="internal",
                    supplier_name=co_name, supplier_p_per_emp=co["p_per_emp"],
                    supplier_kind="local", buyer_kind="family",
                    gross_usd=tx_amount,
                ))

    # ── C: Local company → external supplier (B2B imports) ────────────────
    for co in LOCAL_COMPANIES:
        if co["b2b_import_usd"] <= 0:
            continue
        sector = co["b2b_import_sector"]
        sector_suppliers = suppliers_by_sector.get(sector, [])
        if not sector_suppliers:
            continue
        # Single B2B transaction per company per month for simplicity
        supplier_name, p_emp = sector_suppliers[0]
        txs.append(Transaction(
            family_id=0, sector=sector,
            supplier_name=supplier_name, supplier_p_per_emp=p_emp,
            supplier_kind="external", buyer_kind="local_company",
            gross_usd=co["b2b_import_usd"],
        ))

    return txs


# ── Reporting ───────────────────────────────────────────────────────────────

def print_section(title: str):
    print()
    print("=" * 80)
    print(title)
    print("=" * 80)


def main():
    # ── Setup ────────────────────────────────────────────────────────────────
    families = build_families()
    n_citizens = sum(f.total_members for f in families)
    n_working = sum(f.adults_working for f in families)
    n_retired = sum(f.adults_retired for f in families)
    n_workless = sum(f.adults_workless for f in families)
    n_children = sum(f.children for f in families)

    print_section("POPULATION")
    print(f"  Total families:      {len(families)}")
    print(f"  Total citizens:      {n_citizens}")
    print(f"     working adults:   {n_working}  ({n_working / max(1, n_citizens) * 100:.0f}%)")
    print(f"     retired adults:   {n_retired}  ({n_retired / max(1, n_citizens) * 100:.0f}%)")
    print(f"     workless adults:  {n_workless}  ({n_workless / max(1, n_citizens) * 100:.0f}%)")
    print(f"     children:         {n_children}  ({n_children / max(1, n_citizens) * 100:.0f}%)")
    print()
    print(f"  {'Family type':<35} {'count':>5} {'members':>8} {'UBI/mo':>10} {'Salary':>10} {'Pension':>10} {'Income':>10}")
    seen = set()
    for f in families:
        key = f.label
        if key in seen:
            continue
        seen.add(key)
        same = [x for x in families if x.label == key]
        print(f"  {f.label:<35} {len(same):>5} {f.total_members:>8} "
              f"${f.monthly_ubi:>9,.0f} ${f.monthly_salary:>9,.0f} "
              f"${f.monthly_pension:>9,.0f} ${f.monthly_income:>9,.0f}")

    # ── UBI cost ────────────────────────────────────────────────────────────
    total_ubi = sum(f.monthly_ubi for f in families)
    total_salary = sum(f.monthly_salary for f in families)
    total_pension = sum(f.monthly_pension for f in families)
    total_income = total_ubi + total_salary + total_pension

    print_section("MONTHLY INCOME FLOWS")
    print(f"  Total UBI minted by Fisc        ${total_ubi:>12,.0f}")
    print(f"  Total salary paid by local cos  ${total_salary:>12,.0f}  (from external revenue)")
    print(f"  Total pension paid externally   ${total_pension:>12,.0f}")
    print(f"  Total monthly income            ${total_income:>12,.0f}")
    print()
    print(f"  Local company external revenue:")
    for co in LOCAL_COMPANIES:
        if co["external_rev_usd"] > 0:
            print(f"    {co['name']:<25} ${co['external_rev_usd']:>10,.0f}/month  "
                  f"(employs {co['employees']})")

    # ── Generate transactions ────────────────────────────────────────────────
    txs = generate_transactions(families)
    n_txs = len(txs)
    total_gross = sum(t.gross_usd for t in txs)
    total_v_x_p = sum(t.gross_usd * t.supplier_p_per_emp for t in txs)

    print_section(f"TRANSACTION VOLUME -- {n_txs} transactions this month")
    fam_to_ext = [t for t in txs if t.buyer_kind == "family" and t.supplier_kind == "external"]
    fam_to_local = [t for t in txs if t.buyer_kind == "family" and t.supplier_kind == "local"]
    co_to_ext = [t for t in txs if t.buyer_kind == "local_company" and t.supplier_kind == "external"]
    print(f"  Stream A  family -> external      {len(fam_to_ext):>4} txs  ${sum(t.gross_usd for t in fam_to_ext):>10,.0f}")
    print(f"  Stream B  family -> local         {len(fam_to_local):>4} txs  ${sum(t.gross_usd for t in fam_to_local):>10,.0f}")
    print(f"  Stream C  local -> external (B2B) {len(co_to_ext):>4} txs  ${sum(t.gross_usd for t in co_to_ext):>10,.0f}")
    print(f"  ----------------------------------------------------------------")
    print(f"  Total gross transaction value:   ${total_gross:>12,.0f}")
    print(f"  Average transaction value:       ${total_gross / max(1, n_txs):>12,.2f}")
    print(f"  Sum of (V x P_per_emp):          ${total_v_x_p:>12,.0f}")
    print(f"  Avg P/emp weighted by gross:     ${total_v_x_p / max(1, total_gross):>12,.0f}")
    print()
    print(f"  Note: external customer -> local company (export sales like Dave's Co's $80K/mo)")
    print(f"  is NOT levied per destination-principle; importing colony's Fisc captures it.")

    # ── Levy calibration ────────────────────────────────────────────────────
    # a x Sum(V x P) = total_UBI
    a = total_ubi / total_v_x_p if total_v_x_p > 0 else 0

    print_section("LEVY CALIBRATION")
    print(f"  Total UBI to fund (this month):  ${total_ubi:>12,.0f}")
    print(f"  Sum(V x P_per_emp):                ${total_v_x_p:>12,.0f}")
    print(f"  =>  a = UBI / Sum(V x P)             = {a:.6e}")
    print()
    print(f"  Implied per-supplier levy rates (= a x P_per_emp):")
    print(f"  {'Sector':<15} {'Supplier':<28} {'P/emp':>10} {'Rate':>9}  {'Status'}")
    breaking = []
    for sector, name, p_emp in EXTERNAL_SUPPLIERS:
        rate = a * p_emp
        status = "OK" if rate <= 0.80 else ("HIGH" if rate <= 1.0 else "**BROKEN — exceeds 100%**")
        if rate > 1.0:
            breaking.append((name, rate))
        print(f"  {sector:<15} {name:<28} ${p_emp:>9,.0f} {rate * 100:>7.1f}%  {status}")

    # ── Apply transactions ──────────────────────────────────────────────────
    # For the trace we cap levy at 80% of gross to avoid math breakage on high-P/emp
    # suppliers; track the resulting shortfall against the UBI obligation.
    LEVY_CAP_RATE = 0.80
    per_supplier = defaultdict(lambda: {"n": 0, "gross": 0.0, "automation_levy": 0.0,
                                         "gas_levy": 0.0, "protocol_levy": 0.0,
                                         "shortfall": 0.0, "p_emp": 0})
    total_automation_collected = 0.0
    total_gas_collected = 0.0
    total_protocol_collected = 0.0
    total_shortfall = 0.0

    for t in txs:
        sup = per_supplier[t.supplier_name]
        sup["n"] += 1
        sup["gross"] += t.gross_usd
        sup["p_emp"] = t.supplier_p_per_emp

        gas = GAS_LEVY_USD
        protocol = t.gross_usd * PROTOCOL_RATE
        intended_auto = t.gross_usd * a * t.supplier_p_per_emp
        # Cap automation levy + protocol + gas at LEVY_CAP_RATE x gross
        room = max(0, t.gross_usd * LEVY_CAP_RATE - gas - protocol)
        actual_auto = min(intended_auto, room)
        shortfall = intended_auto - actual_auto

        sup["gas_levy"] += gas
        sup["protocol_levy"] += protocol
        sup["automation_levy"] += actual_auto
        sup["shortfall"] += shortfall

        total_gas_collected += gas
        total_protocol_collected += protocol
        total_automation_collected += actual_auto
        total_shortfall += shortfall

    # ── Per-supplier ledger ──────────────────────────────────────────────────
    print_section("PER-SUPPLIER LEDGER (aggregate this month)")
    print(f"  {'Kind':<6} {'Supplier':<28} {'#tx':>4} {'Gross':>10} "
          f"{'Auto levy':>10} {'Rate':>7} {'Net':>10} {'Shortfall':>10}")

    # External suppliers first
    print(f"  -- EXTERNAL --")
    for sector, name, p_emp in EXTERNAL_SUPPLIERS:
        s = per_supplier[name]
        if s["n"] == 0:
            continue
        rate_actual = (s["automation_levy"] / s["gross"]) if s["gross"] > 0 else 0
        net_to_supplier = s["gross"] - s["automation_levy"] - s["protocol_levy"] - s["gas_levy"]
        flag = " **CAPPED" if s["shortfall"] > 0.01 else ""
        print(f"  ext    {name:<28} {s['n']:>4} ${s['gross']:>9,.0f} "
              f"${s['automation_levy']:>9,.2f} {rate_actual * 100:>5.1f}% "
              f"${net_to_supplier:>9,.0f} ${s['shortfall']:>9,.2f}{flag}")

    # Local suppliers
    print(f"  -- LOCAL --")
    for co in LOCAL_COMPANIES:
        s = per_supplier[co["name"]]
        if s["n"] == 0:
            continue
        rate_actual = (s["automation_levy"] / s["gross"]) if s["gross"] > 0 else 0
        net_to_supplier = s["gross"] - s["automation_levy"] - s["protocol_levy"] - s["gas_levy"]
        flag = " **CAPPED" if s["shortfall"] > 0.01 else ""
        print(f"  local  {co['name']:<28} {s['n']:>4} ${s['gross']:>9,.0f} "
              f"${s['automation_levy']:>9,.2f} {rate_actual * 100:>5.1f}% "
              f"${net_to_supplier:>9,.0f} ${s['shortfall']:>9,.2f}{flag}")

    # ── Final budget balance ────────────────────────────────────────────────
    print_section("BUDGET BALANCE")
    print(f"  UBI obligation this month        ${total_ubi:>12,.0f}")
    print(f"  Automation levy actually collected ${total_automation_collected:>12,.0f}")
    print(f"  Shortfall (uncovered UBI)        ${total_shortfall:>12,.0f}")
    print()
    print(f"  Gas pool (held in S, paid to chain)     ${total_gas_collected:>12,.0f}")
    print(f"  Protocol treasury (founders)            ${total_protocol_collected:>12,.0f}")
    print()
    if total_shortfall > 0.01:
        print(f"  !!!  The levy formula `(P/emp) x a` produces rates >100% on")
        print(f"     {len(breaking)} high-P/emp suppliers. Capped at 80% of gross")
        print(f"     transaction value, the levy comes up ${total_shortfall:,.0f} short of")
        print(f"     covering UBI ({total_shortfall / total_ubi * 100:.1f}% of UBI uncovered).")
        print(f"     Either the formula needs a different shape, or the transaction")
        print(f"     volume needs to be much higher, or some other revenue source")
        print(f"     (savings drawdown, business-to-business levies, etc.) is needed.")
    else:
        print(f"  [OK]  Levy fully covers UBI within the 80% cap. The mechanism balances.")

    print()
    print(f"  Suppliers where the formula breaks (rate > 100%):")
    for name, rate in breaking:
        print(f"    {name:<28} would-be rate {rate * 100:.0f}%")

    # ── Sanity by family ────────────────────────────────────────────────────
    print_section("PER-FAMILY-TYPE SUMMARY (aggregate)")
    by_type = defaultdict(lambda: {"n_families": 0, "total_income": 0,
                                    "total_external_spend": 0})
    for f in families:
        bt = by_type[f.label]
        bt["n_families"] += 1
        bt["total_income"] += f.monthly_income
        bt["total_external_spend"] += f.monthly_income * 0.80
    print(f"  {'Family type':<35} {'count':>6} {'avg income':>12} {'avg external spend':>20}")
    for label, d in by_type.items():
        n = d["n_families"]
        print(f"  {label:<35} {n:>6} ${d['total_income']/n:>11,.0f} ${d['total_external_spend']/n:>19,.0f}")


if __name__ == "__main__":
    main()
