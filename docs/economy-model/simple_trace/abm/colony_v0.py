"""Colony v0 — Maryfontaine baseline (Step 1 of 3).

A small open economy modelling today's Maryfontaine — 30 adult citizens
with realistic household dependents (children scale consumption), a chain-
dominated private retail/services economy, AND a public sector (~7 workers)
funded by external federal/state transfers. No UBI, no automation. Step 1
verifies the colony can be modelled as a stable healthy baseline before
introducing interventions (Step 2 = local currency) or stress tests
(Step 3 = automation).

3 sectors: food, goods, services.
Each sector has THREE providers (Steve's reframing 29 May 2026 — modern
small towns don't have a 90%-local economy; chain dominance is already there
before automation kicks in):

  1. **LocalIndy** — truly local independent firm. All revenue stays in colony.
     Employs citizens, pays wages. No automation.
  2. **ChainBranch** — physical chain store (Walmart/McDonald's/Target/etc.).
     Employs citizens locally → wages stay. But ~70% of revenue drains as
     corporate fees to external HQ. Automation hits HERE (HQ-driven workforce
     reduction + price cuts).
  3. **PureImport** — Amazon/streaming/online retail. No local presence.
     All revenue drains. Prices fall sharply with automation.

30 citizens with Pareto-distributed productivity, employed at LocalIndy or
ChainBranch. Monthly: pay wages → consume (three-way split per sector) →
local exports → workforce adjust (revenue-driven + chain HQ automation).

Calibrated so that at A=0 the colony has approximately balanced BoP
(matching Maryfontaine's design): chain corporate fees + pure imports
≈ exports.
"""
from __future__ import annotations
import math

from mesa import Agent, Model
from mesa.datacollection import DataCollector


# ── Sectors and structure ────────────────────────────────────────────────
SECTORS = ["food", "goods", "services"]
BASKET_WEIGHTS = {"food": 0.25, "goods": 0.35, "services": 0.40}
INITIAL_LOCAL_PRICES = {"food": 80.0, "goods": 100.0, "services": 120.0}

# Baseline provider shares per sector (at A=0, equal prices). Reflects modern
# US small-town chain dominance — Walmart owns most retail, indy services
# (haircuts, dentists) hold the local share, Amazon takes a slice everywhere.
SECTOR_PROVIDER_SHARES = {
    "food":     {"local": 0.35, "chain": 0.60, "import": 0.05},
    "goods":    {"local": 0.15, "chain": 0.65, "import": 0.20},
    "services": {"local": 0.60, "chain": 0.30, "import": 0.10},
}

# Automation effects (all driven by per-sector A, ramping 0 → automation_end):
MAX_IMPORT_DEFLATION = 0.85    # PureImport price at A=1 → 15% of original
CHAIN_DEFLATION      = 0.80    # ChainBranch price at A=1 → 20% of original
CHAIN_LAYOFF_RATE    = 0.85    # ChainBranch target workforce at A=1 → 15% of initial
CHAIN_CORP_FEE_RATE  = 0.70    # 70% of chain revenue drains to external HQ
PRICE_ELASTICITY     = 1.5     # how sharply share shifts with price differential

# Wages differ by firm type — chains pay minimum-wage-ish (Walmart cashier);
# truly-local indy firms pay better (local artisan, skilled trades, dentists);
# public sector sits in the middle (teachers, town-hall workers).
WAGE_MULT_LOCAL  = 1.20
WAGE_MULT_CHAIN  = 0.55
WAGE_MULT_PUBLIC = 1.00

# Household composition. Each adult independently has a chance of having
# dependents. Matches MF demographics (39k people, 30k adults → ~30% kids).
P_HAS_CHILD       = 0.30          # prob an adult has at least one dependent
P_HAS_SECOND      = 0.05          # conditional prob of a second
CHILD_CONSUMPTION = 0.30          # each child adds this fraction to adult target spending

# Public sector — modelled as a single employer. Funded by external transfers
# (federal/state money — Social Security, Medicare, federal jobs, state
# contracts, etc. — which are massive money inflows to real US small towns).
PUBLIC_TARGET_WORKERS_PCT = 0.23  # ~23% of workforce in public sector (US national avg)

# Direct family transfers — child tax credit, SNAP, school lunch subsidies, etc.
# Flow from federal/state directly to households with children. Counted as
# BoP credit. Calibrated to cover the additional household consumption from
# dependents so families with kids aren't structurally insolvent.
CHILD_TRANSFER = 220.0

# Today's approximate tax structure (US small-town effective rates).
# AXION's narrative will depend on changing this treatment, so taxes are
# explicit here rather than buried in chain corp fees etc.
INCOME_TAX_RATE       = 0.15   # federal + state income + FICA employee side (effective middle-class rate)
INCOME_TAX_LOCAL_PCT  = 0.15   # of income tax, this fraction stays in colony
                                # as local income / payroll tax (rest drains)
SALES_TAX_RATE        = 0.07   # state + local sales tax combined
SALES_TAX_LOCAL_PCT   = 0.30   # of sales tax, this fraction stays in colony

# Property + housing structure.
HOMEOWNERSHIP_RATE        = 0.65   # US avg ~65%
PROP_VALUE_MIN            = 15000.0
PROP_VALUE_MAX            = 45000.0
INITIAL_LTV_MAX           = 0.60   # max loan-to-value at init
PROPERTY_TAX_RATE         = 0.012  # 1.2% annual, on property value
MORTGAGE_RATE_ANNUAL      = 0.065  # nominal mortgage rate
SAVINGS_RATE_ANNUAL       = 0.04   # national-bank savings rate
PROP_APPRECIATION_ANNUAL  = 0.04   # ~4%/yr property appreciation
                                    # ("land doesn't deflate" — key AXION point)
MORTGAGE_TERM_MIN_MONTHS  = 60      # remaining-term at init: 5-25 years
MORTGAGE_TERM_MAX_MONTHS  = 300
MONTHLY_RENT              = 150.0   # flat rent for renters (smaller scale)
HOUSING_LOCAL_PCT         = 0.20   # of mortgage interest + rent, fraction stays local
                                    # (small local banks, local landlords)

# Exports (truly local firms only — chain branches don't export, they ARE
# the external HQ's branch into the colony). Calibrated together with
# monthly_external_transfers so the total inflow approximately matches the
# total drain (chain corp fees + pure imports) at A=0, giving balanced BoP.
EXPORT_BASELINE = {"food": 400.0, "goods": 2100.0, "services": 800.0}
# Total $3,300/mo. Pair with default monthly_external_transfers $2,800
# (= public sector payroll) + child transfers ~$2,600/mo → balanced inflow vs
# chain corp fees + pure import drain at default consumption levels.
EXPORT_DECAY = 0.90            # at A=1, export demand → 10% of baseline


# ── Agents ───────────────────────────────────────────────────────────────
class Citizen(Agent):
    def __init__(self, model, productivity, initial_savings, dependents=0):
        super().__init__(model)
        self.productivity = productivity
        self.savings = initial_savings   # liquid savings (cash + bank deposits)
        self.dependents = dependents     # number of children in household
        self.employer = None             # LocalFirm | ChainBranch | PublicSector | None
        self.last_income = 0.0
        self.months_unemployed = 0
        # Wealth — property + mortgage + debt. property_value=0 means renter.
        self.property_value = 0.0
        self.mortgage_balance = 0.0
        self.mortgage_payment = 0.0       # monthly amortized payment (int + principal)
        self.mortgage_term_remaining = 0  # months remaining
        self.other_debt = 0.0             # personal loans / credit card (Phase 3+)

    @property
    def net_worth(self):
        return self.savings + self.property_value - self.mortgage_balance - self.other_debt

    @property
    def is_homeowner(self):
        return self.property_value > 0

    @property
    def employed(self):
        return self.employer is not None

    @property
    def wage_if_hired(self):
        # Private firms pay productivity-scaled wages. Public sector pays a
        # graded scale that's independent of personal productivity — civil
        # service jobs, teaching, government roles all have set bands.
        if self.employer is None or self.employer.kind == "local":
            return self.model.base_wage * self.productivity * WAGE_MULT_LOCAL
        if self.employer.kind == "chain":
            return self.model.base_wage * self.productivity * WAGE_MULT_CHAIN
        # public
        return self.model.base_wage * WAGE_MULT_PUBLIC

    @property
    def household_size(self):
        return 1 + self.dependents

    def receive_wage(self, amount):
        self.savings += amount
        self.last_income = amount

    def step(self):
        pass


class LocalFirm(Agent):
    """Truly local independent firm. All revenue stays in colony."""
    def __init__(self, model, sector, initial_workers, initial_float):
        super().__init__(model)
        self.sector = sector
        self.kind = "local"
        self.workers: list[Citizen] = []
        self.balance = initial_float
        self.price = INITIAL_LOCAL_PRICES[sector]
        self.revenue_this_month = 0.0
        self.revenue_cumulative = 0.0
        self.exports_cumulative = 0.0
        self.wages_paid_cumulative = 0.0
        self.txns_this_month = 0
        self.txns_cumulative = 0

        for c in initial_workers:
            c.employer = self
            self.workers.append(c)

    def collect_revenue(self, amount):
        self.balance += amount
        self.revenue_this_month += amount
        self.revenue_cumulative += amount
        self.txns_this_month += 1
        self.txns_cumulative += 1

    def fire(self, citizen):
        if citizen in self.workers:
            self.workers.remove(citizen)
            citizen.employer = None
            citizen.months_unemployed = 0

    def step(self):
        pass


class ChainBranch(Agent):
    """Chain-store branch (Walmart/McDonald's-style). Employs citizens but
    most revenue drains externally as corporate fee. Automation hits hardest
    here: HQ drives workforce reduction + price cuts in parallel."""
    def __init__(self, model, sector, initial_workers, initial_float):
        super().__init__(model)
        self.sector = sector
        self.kind = "chain"
        self.workers: list[Citizen] = []
        self.balance = initial_float
        self.price = INITIAL_LOCAL_PRICES[sector]   # starts equal to local
        self.revenue_this_month = 0.0
        self.revenue_cumulative = 0.0
        self.corp_fee_paid_this_month = 0.0
        self.corp_fee_cumulative = 0.0
        self.wages_paid_cumulative = 0.0
        self.txns_this_month = 0
        self.txns_cumulative = 0
        self.automation = 0.0

        for c in initial_workers:
            c.employer = self
            self.workers.append(c)

    def update_price(self):
        base = INITIAL_LOCAL_PRICES[self.sector]
        self.price = base * (1.0 - self.automation * CHAIN_DEFLATION)

    def target_workforce(self, initial_count):
        """How many workers HQ wants given current automation level."""
        return max(0, int(round(initial_count * (1.0 - self.automation * CHAIN_LAYOFF_RATE))))

    def collect_revenue(self, amount):
        # Of each $ collected, CHAIN_CORP_FEE_RATE drains immediately to HQ;
        # the rest stays as branch balance to fund wages.
        corp_fee = amount * CHAIN_CORP_FEE_RATE
        retained = amount - corp_fee
        self.balance += retained
        self.revenue_this_month += amount
        self.revenue_cumulative += amount
        self.corp_fee_paid_this_month += corp_fee
        self.corp_fee_cumulative += corp_fee
        self.txns_this_month += 1
        self.txns_cumulative += 1
        # Corporate fee = money leaving the colony
        self.model.money_drained_total += corp_fee
        self.model.imports_this_step += corp_fee

    def fire(self, citizen):
        if citizen in self.workers:
            self.workers.remove(citizen)
            citizen.employer = None
            citizen.months_unemployed = 0

    def step(self):
        pass


class PublicSector(Agent):
    """Government employer (schools, town hall, healthcare workers etc).
    Funded by external transfers — federal/state money flowing into the colony.
    Pays wages to public employees. Doesn't have a price/revenue per se;
    services consumed are 'free at point of use' (citizens already paid via
    federal taxes outside the colony scope)."""
    def __init__(self, model, initial_workers, initial_float):
        super().__init__(model)
        self.kind = "public"
        self.workers: list[Citizen] = []
        self.balance = initial_float
        self.transfers_received_this_step = 0.0
        self.transfers_cumulative = 0.0
        self.wages_paid_cumulative = 0.0
        for c in initial_workers:
            c.employer = self
            self.workers.append(c)

    def receive_transfer(self, amount):
        self.balance += amount
        self.transfers_received_this_step += amount
        self.transfers_cumulative += amount
        self.model.money_returned_total += amount
        self.model.exports_this_step += amount   # external money in counts as BoP credit

    def fire(self, citizen):
        if citizen in self.workers:
            self.workers.remove(citizen)
            citizen.employer = None
            citizen.months_unemployed = 0

    def step(self):
        pass


class BankLandlord(Agent):
    """Holds mortgages and rental properties.  Most income drains externally
    (national banks, out-of-town landlords); a fraction stays local (small
    community banks, local property owners).  Phase 1 treats this as a single
    aggregated entity; Phase 2 will split out savings/loans interest."""
    def __init__(self, model):
        super().__init__(model)
        self.kind = "bank"
        self.balance = 0.0
        self.mortgage_interest_this_step = 0.0
        self.mortgage_interest_cumulative = 0.0
        self.rent_this_step = 0.0
        self.rent_cumulative = 0.0
        self.local_share_cumulative = 0.0
        self.drained_cumulative = 0.0
        self.outstanding_mortgages = 0.0   # snapshot, recomputed each step

    def collect_mortgage_interest(self, amount):
        self.mortgage_interest_this_step += amount
        self.mortgage_interest_cumulative += amount
        local = amount * HOUSING_LOCAL_PCT
        drained = amount - local
        self.balance += local
        self.local_share_cumulative += local
        self.model.money_drained_total += drained
        self.model.imports_this_step += drained
        self.drained_cumulative += drained

    def collect_rent(self, amount):
        self.rent_this_step += amount
        self.rent_cumulative += amount
        local = amount * HOUSING_LOCAL_PCT
        drained = amount - local
        self.balance += local
        self.local_share_cumulative += local
        self.model.money_drained_total += drained
        self.model.imports_this_step += drained
        self.drained_cumulative += drained

    def step(self):
        pass


class PureImport(Agent):
    """Amazon-style. No local presence. Citizens spend → money drains."""
    def __init__(self, model, sector):
        super().__init__(model)
        self.sector = sector
        self.kind = "import"
        self.automation = 0.0
        self.price = INITIAL_LOCAL_PRICES[sector]
        self.revenue_this_month = 0.0
        self.revenue_cumulative = 0.0
        self.txns_this_month = 0
        self.txns_cumulative = 0

    def update_price(self):
        base = INITIAL_LOCAL_PRICES[self.sector]
        self.price = base * (1.0 - self.automation * MAX_IMPORT_DEFLATION)

    def collect_revenue(self, amount):
        self.revenue_this_month += amount
        self.revenue_cumulative += amount
        self.txns_this_month += 1
        self.txns_cumulative += 1
        self.model.money_drained_total += amount
        self.model.imports_this_step += amount

    def step(self):
        pass


# ── Model ────────────────────────────────────────────────────────────────
class ColonyV0Model(Model):
    def __init__(
        self,
        *,
        n_citizens: int = 30,
        pareto_alpha: float = 1.6,
        initial_savings: float = 1500.0,
        base_wage: float = 400.0,
        target_spend_pct: float = 1.00,
        subsistence_floor: float = 250.0,
        firm_initial_float: float = 3000.0,
        automation_end: float = 0.0,
        automation_months: int = 60,
        sectors_automate: tuple = ("food", "goods", "services"),
        layoff_threshold: float = 0.70,
        hire_threshold: float = 1.15,
        monthly_external_transfers: float = 5200.0,  # public + federal redistribution inflow
        seed=None,
    ):
        super().__init__(seed=seed)
        self.base_wage = base_wage
        self.target_spend_pct = target_spend_pct
        self.subsistence_floor = subsistence_floor
        self.automation_end = automation_end
        self.automation_months = automation_months
        self.sectors_automate = sectors_automate
        self.layoff_threshold = layoff_threshold
        self.hire_threshold = hire_threshold

        # Money tracking
        self.money_drained_total = 0.0
        self.money_returned_total = 0.0
        self.imports_this_step = 0.0
        self.exports_this_step = 0.0
        self.drain_corp_fees_step = 0.0
        self.drain_pure_imports_step = 0.0
        # Transactions tracking for velocity (= total monthly consumption flow)
        self.transactions_this_step = 0.0
        # Tax tracking — separate from chain corp fees etc.
        self.income_tax_this_step = 0.0
        self.income_tax_cumulative = 0.0
        self.income_tax_drained_cumulative = 0.0
        self.income_tax_local_cumulative = 0.0
        self.sales_tax_this_step = 0.0
        self.sales_tax_cumulative = 0.0
        self.sales_tax_drained_cumulative = 0.0
        self.sales_tax_local_cumulative = 0.0
        # Track total exports so we can show a dedicated "external buyers" row
        self.exports_cumulative = 0.0
        # Property tax tracking (stays local — public sector receives)
        self.property_tax_cumulative = 0.0
        # Savings interest paid by national banks (external inflow)
        self.savings_interest_paid_this_step = 0.0
        self.savings_interest_cumulative = 0.0

        self.monthly_external_transfers = monthly_external_transfers

        # Spawn citizens — adults with Pareto productivity, some have child
        # dependents. Children aren't separate agents; they're counted on the
        # household's adult so consumption scales with family size.
        self.citizens: list[Citizen] = []
        for _ in range(n_citizens):
            p = self.random.paretovariate(pareto_alpha)
            p = min(p, 3.0)
            # Independent household composition draw
            n_kids = 0
            if self.random.random() < P_HAS_CHILD:
                n_kids = 1
                if self.random.random() < P_HAS_SECOND:
                    n_kids = 2
            self.citizens.append(Citizen(self, productivity=p,
                                          initial_savings=initial_savings,
                                          dependents=n_kids))
        avg_p = sum(c.productivity for c in self.citizens) / len(self.citizens)
        self.total_dependents = sum(c.dependents for c in self.citizens)
        self.total_population = n_citizens + self.total_dependents

        # Assign property + mortgage at init. ~65% homeowners with property
        # values $15k-$45k and mortgages up to 60% LTV with random remaining
        # term (5-25 years). Monthly amortized payment computed once.
        m_rate = MORTGAGE_RATE_ANNUAL / 12.0
        for c in self.citizens:
            if self.random.random() < HOMEOWNERSHIP_RATE:
                c.property_value = self.random.uniform(PROP_VALUE_MIN, PROP_VALUE_MAX)
                ltv = self.random.uniform(0.0, INITIAL_LTV_MAX)
                c.mortgage_balance = c.property_value * ltv
                if c.mortgage_balance > 0:
                    c.mortgage_term_remaining = self.random.randint(
                        MORTGAGE_TERM_MIN_MONTHS, MORTGAGE_TERM_MAX_MONTHS
                    )
                    n = c.mortgage_term_remaining
                    # Standard amortization formula
                    c.mortgage_payment = (
                        c.mortgage_balance * m_rate * (1 + m_rate) ** n
                        / ((1 + m_rate) ** n - 1)
                    )

        # Reserve some citizens for the public sector (real US public-sector
        # employment is ~22-25% of total workforce). These are pre-allocated;
        # the remainder fills private firms.
        n_public_target = max(1, round(n_citizens * PUBLIC_TARGET_WORKERS_PCT))
        n_private = n_citizens - n_public_target

        # Workforce allocation for PRIVATE firms — based on sustainable wage
        # budgets (chain branches keep 30% of revenue for wages; local firms
        # keep 100% + earn exports).
        local_recapture = sum(BASKET_WEIGHTS[s] * SECTOR_PROVIDER_SHARES[s]["local"]
                              for s in SECTORS)
        chain_recapture = sum(BASKET_WEIGHTS[s] * SECTOR_PROVIDER_SHARES[s]["chain"]
                              for s in SECTORS)
        total_recapture = local_recapture + chain_recapture * (1 - CHAIN_CORP_FEE_RATE)
        exports_total = sum(EXPORT_BASELINE.values())
        if total_recapture >= 1.0:
            raise ValueError("Recapture rate >= 1, money creation feedback loop")
        W_eq = exports_total / (1.0 - total_recapture)  # steady-state private wages

        budgets: dict[tuple, float] = {}
        for s in SECTORS:
            sector_W = W_eq * BASKET_WEIGHTS[s]
            budgets[(s, "local")] = (
                sector_W * SECTOR_PROVIDER_SHARES[s]["local"] + EXPORT_BASELINE[s]
            )
            budgets[(s, "chain")] = (
                sector_W * SECTOR_PROVIDER_SHARES[s]["chain"] * (1 - CHAIN_CORP_FEE_RATE)
            )

        # Convert budgets to worker counts, using firm-type-specific avg wage.
        local_avg_wage = base_wage * avg_p * WAGE_MULT_LOCAL
        chain_avg_wage = base_wage * avg_p * WAGE_MULT_CHAIN
        capacity: dict[tuple, float] = {}
        for (s, kind), b in budgets.items():
            wage = local_avg_wage if kind == "local" else chain_avg_wage
            capacity[(s, kind)] = b / max(1.0, wage)
        total_capacity = sum(capacity.values())
        per_firm_capacity: dict[tuple, int] = {}
        allocated = 0
        keys_list = list(capacity.keys())
        for i, key in enumerate(keys_list):
            if i == len(keys_list) - 1:
                per_firm_capacity[key] = max(0, n_private - allocated)
            else:
                n = max(1, round(n_private * capacity[key] / total_capacity))
                per_firm_capacity[key] = n
                allocated += n

        # Round-robin citizens (sorted by productivity desc) — first n_public_target
        # workers go to the public sector, then the rest fill private firms.
        by_p_desc = sorted(self.citizens, key=lambda c: c.productivity, reverse=True)
        public_workers = by_p_desc[:n_public_target]
        private_pool   = by_p_desc[n_public_target:]

        firm_workers: dict[tuple, list] = {k: [] for k in per_firm_capacity}
        firm_keys = list(per_firm_capacity.keys())
        i = 0
        for c in private_pool:
            for _ in range(len(firm_keys)):
                key = firm_keys[i % len(firm_keys)]
                i += 1
                if per_firm_capacity[key] > 0:
                    firm_workers[key].append(c)
                    per_firm_capacity[key] -= 1
                    break

        # Create the firms
        self.local_firms: dict[str, LocalFirm] = {}
        self.chain_branches: dict[str, ChainBranch] = {}
        for sector in SECTORS:
            self.local_firms[sector] = LocalFirm(
                self, sector,
                initial_workers=firm_workers[(sector, "local")],
                initial_float=firm_initial_float,
            )
            self.chain_branches[sector] = ChainBranch(
                self, sector,
                initial_workers=firm_workers[(sector, "chain")],
                initial_float=firm_initial_float,
            )
        self._initial_local_workforce = {
            s: len(self.local_firms[s].workers) for s in SECTORS
        }
        self._initial_chain_workforce = {
            s: len(self.chain_branches[s].workers) for s in SECTORS
        }

        # Public sector — single employer, funded by external transfers.
        self.public_sector = PublicSector(
            self,
            initial_workers=public_workers,
            initial_float=firm_initial_float,
        )
        self._initial_public_workforce = len(self.public_sector.workers)

        self.pure_imports: dict[str, PureImport] = {
            s: PureImport(self, s) for s in SECTORS
        }
        self.bank = BankLandlord(self)

        # Bootstrap citizens' last_income from expected wage. Without this,
        # month-1 consumption is just subsistence (since last_income would be
        # zero), and firms get no revenue to pay payroll → mass layoffs.
        # The bootstrap represents "they were earning before the sim started."
        for c in self.citizens:
            if c.employed:
                c.last_income = c.wage_if_hired

        # Per-citizen history
        self.savings_history: list[list[float]] = [[c.savings for c in self.citizens]]
        self.employed_history: list[list[bool]] = [[c.employed for c in self.citizens]]
        self.productivities = [c.productivity for c in self.citizens]

        self.datacollector = DataCollector(
            model_reporters={
                "month":             lambda m: m.steps,
                "employment_rate":   lambda m: m.employment_rate(),
                "money_supply":      lambda m: m.money_supply_internal(),
                "money_drained":     lambda m: m.money_drained_total,
                "money_returned":    lambda m: m.money_returned_total,
                "imports_step":      lambda m: m.imports_this_step,
                "exports_step":      lambda m: m.exports_this_step,
                "net_bop_step":      lambda m: m.exports_this_step - m.imports_this_step,
                "cumulative_net_bop":lambda m: m.money_returned_total - m.money_drained_total,
                "months_until_bust": lambda m: m.months_until_bust(),
                "destitute_count":   lambda m: sum(1 for c in m.citizens if c.savings < 1.0),
                # Drain decomposition
                "drain_corp_fees":   lambda m: m.drain_corp_fees_step,
                "drain_imports":     lambda m: m.drain_pure_imports_step,
                # Employment by firm type
                "workers_local":     lambda m: sum(len(f.workers) for f in m.local_firms.values()),
                "workers_chain":     lambda m: sum(len(f.workers) for f in m.chain_branches.values()),
                "workers_public":    lambda m: len(m.public_sector.workers),
                "workers_local_pct": lambda m: sum(len(f.workers) for f in m.local_firms.values()) / max(1, len(m.citizens)),
                "workers_chain_pct": lambda m: sum(len(f.workers) for f in m.chain_branches.values()) / max(1, len(m.citizens)),
                "workers_public_pct":lambda m: len(m.public_sector.workers) / max(1, len(m.citizens)),
                # Demographics
                "n_adults":          lambda m: len(m.citizens),
                "n_dependents":      lambda m: m.total_dependents,
                "n_total_pop":       lambda m: m.total_population,
                # Public sector financials
                "public_balance":    lambda m: m.public_sector.balance,
                "transfers_in":      lambda m: m.public_sector.transfers_received_this_step,
                "child_transfers":   lambda m: getattr(m, "child_transfers_this_step", 0.0),
                # Tax flows
                "income_tax_step":   lambda m: m.income_tax_this_step,
                "sales_tax_step":    lambda m: m.sales_tax_this_step,
                "income_tax_cum":    lambda m: m.income_tax_cumulative,
                "sales_tax_cum":     lambda m: m.sales_tax_cumulative,
                "tax_drained_cum":   lambda m: m.income_tax_drained_cumulative + m.sales_tax_drained_cumulative,
                "tax_local_cum":     lambda m: m.income_tax_local_cumulative + m.sales_tax_local_cumulative,
                "property_tax_cum":  lambda m: m.property_tax_cumulative,
                # Wealth
                "liquid_wealth":     lambda m: m.total_liquid_wealth(),
                "property_wealth":   lambda m: m.total_property_wealth(),
                "mortgage_debt":     lambda m: m.total_mortgage_debt(),
                "net_worth":         lambda m: m.total_net_worth(),
                "n_homeowners":      lambda m: m.n_homeowners(),
                # Housing flows
                "mortgage_int_step": lambda m: m.bank.mortgage_interest_this_step,
                "rent_step":         lambda m: m.bank.rent_this_step,
                "bank_balance":      lambda m: m.bank.balance,
                "savings_int_step":  lambda m: m.savings_interest_paid_this_step,
                "savings_int_cum":   lambda m: m.savings_interest_cumulative,
                # Revenue by channel (totals across sectors)
                "rev_local":         lambda m: sum(f.revenue_this_month for f in m.local_firms.values()),
                "rev_chain":         lambda m: sum(f.revenue_this_month for f in m.chain_branches.values()),
                "rev_import":        lambda m: sum(f.revenue_this_month for f in m.pure_imports.values()),
                # Automation (one number — applies uniformly across sectors)
                "automation":        lambda m: m.pure_imports["food"].automation,
                # Basket cost (citizen-weighted across the actual mix)
                "basket_cost_avg":   lambda m: m.basket_cost_avg(),
                # Money velocity (Fisher MV = PY). Monthly velocity = consumption
                # transactions per dollar of money supply, per month.
                "transactions":      lambda m: m.transactions_this_step,
                "velocity_monthly":  lambda m: (
                    m.transactions_this_step / max(1.0, m.money_supply_internal())
                ),
                "velocity_annual":   lambda m: (
                    12.0 * m.transactions_this_step / max(1.0, m.money_supply_internal())
                ),
            }
        )
        self.datacollector.collect(self)

    # ── Metrics ──────────────────────────────────────────────────────────
    def employment_rate(self):
        if not self.citizens: return 0.0
        return sum(1 for c in self.citizens if c.employed) / len(self.citizens)

    def money_supply_internal(self):
        return (
            sum(c.savings for c in self.citizens)
            + sum(f.balance for f in self.local_firms.values())
            + sum(f.balance for f in self.chain_branches.values())
            + self.public_sector.balance
            + self.bank.balance
        )

    def total_property_wealth(self):
        return sum(c.property_value for c in self.citizens)

    def total_mortgage_debt(self):
        return sum(c.mortgage_balance for c in self.citizens)

    def total_liquid_wealth(self):
        return sum(c.savings for c in self.citizens)

    def total_net_worth(self):
        return sum(c.net_worth for c in self.citizens)

    def n_homeowners(self):
        return sum(1 for c in self.citizens if c.is_homeowner)

    def basket_cost_avg(self):
        """Average basket cost weighted by where citizens actually shop."""
        cost = 0.0
        for s in SECTORS:
            shares = self._provider_shares(s)
            lp = self.local_firms[s].price
            cp = self.chain_branches[s].price
            ip = self.pure_imports[s].price
            avg_p = lp * shares["local"] + cp * shares["chain"] + ip * shares["import"]
            cost += avg_p * BASKET_WEIGHTS[s]
        return cost

    def months_until_bust(self):
        net = self.exports_this_step - self.imports_this_step
        if net >= 0:
            return 999
        burn_rate = -net
        return min(999, self.money_supply_internal() / burn_rate)

    def _provider_shares(self, sector):
        """Compute consumption shares for one sector, given current prices.
        Base shares (structural) adjusted multiplicatively by inverse price
        elasticity — cheaper providers gain share."""
        base = SECTOR_PROVIDER_SHARES[sector]
        prices = {
            "local":  self.local_firms[sector].price,
            "chain":  self.chain_branches[sector].price,
            "import": self.pure_imports[sector].price,
        }
        ref = max(prices.values())
        weights = {
            k: base[k] * ((ref / max(0.01, prices[k])) ** PRICE_ELASTICITY)
            for k in base
        }
        total = sum(weights.values()) or 1.0
        return {k: v / total for k, v in weights.items()}

    # ── Step orchestration ───────────────────────────────────────────────
    def _ramp_automation(self):
        m = self.steps + 1
        frac = min(1.0, m / max(1, self.automation_months))
        for sector in SECTORS:
            if sector in self.sectors_automate:
                a = self.automation_end * frac
                self.pure_imports[sector].automation = a
                self.chain_branches[sector].automation = a
            self.pure_imports[sector].update_price()
            self.chain_branches[sector].update_price()

    def _chain_hq_workforce_reduction(self):
        """ChainBranches forcibly reduce workforce per HQ's automation rollout,
        regardless of revenue. This is the primary job-loss mechanism."""
        for sector in SECTORS:
            ch = self.chain_branches[sector]
            target = ch.target_workforce(self._initial_chain_workforce[sector])
            while len(ch.workers) > target:
                ch.workers.sort(key=lambda c: c.productivity)  # cut lowest-productivity first
                victim = ch.workers[0]
                ch.fire(victim)

    def _housing_payments(self):
        """Homeowners pay amortized mortgage payment (interest + principal) +
        property tax. Renters pay rent.
          - Mortgage INTEREST -> Bank (mostly drains externally to national bank)
          - Mortgage PRINCIPAL -> reduces mortgage_balance (citizen equity grows)
          - Property tax -> Public sector (stays local)
          - Rent -> Bank (mostly drains, some local landlord retention)
        Principal paydown is the wealth-building mechanism."""
        self.bank.mortgage_interest_this_step = 0.0
        self.bank.rent_this_step = 0.0
        m_rate = MORTGAGE_RATE_ANNUAL / 12.0
        for c in self.citizens:
            if c.is_homeowner:
                if c.mortgage_balance > 0 and c.mortgage_term_remaining > 0:
                    # Amortized payment: interest first, then principal
                    interest = c.mortgage_balance * m_rate
                    payment = min(c.mortgage_payment, c.savings)
                    if payment > 0:
                        c.savings -= payment
                        interest_paid = min(interest, payment)
                        principal_paid = payment - interest_paid
                        self.bank.collect_mortgage_interest(interest_paid)
                        c.mortgage_balance -= principal_paid
                        c.mortgage_balance = max(0.0, c.mortgage_balance)
                        c.mortgage_term_remaining -= 1
                        if c.mortgage_balance <= 0.01:
                            c.mortgage_balance = 0
                            c.mortgage_payment = 0
                            c.mortgage_term_remaining = 0
                # Property tax (always paid by homeowner)
                prop_tax = c.property_value * PROPERTY_TAX_RATE / 12.0
                prop_tax = min(prop_tax, c.savings)
                if prop_tax > 0:
                    c.savings -= prop_tax
                    self.public_sector.balance += prop_tax
                    self.property_tax_cumulative += prop_tax
            else:
                rent = min(MONTHLY_RENT, c.savings)
                if rent > 0:
                    c.savings -= rent
                    self.bank.collect_rent(rent)
        self.bank.outstanding_mortgages = sum(c.mortgage_balance for c in self.citizens)

    def _pay_savings_interest(self):
        """National banks pay interest on liquid savings deposits.
        External inflow — counted as BoP credit."""
        if SAVINGS_RATE_ANNUAL <= 0: return
        rate = SAVINGS_RATE_ANNUAL / 12.0
        for c in self.citizens:
            if c.savings > 0:
                interest = c.savings * rate
                c.savings += interest
                self.savings_interest_paid_this_step += interest
                self.savings_interest_cumulative += interest
                self.money_returned_total += interest
                self.exports_this_step += interest

    def _appreciate_property(self):
        """Property appreciates monthly. Wealth accrues to homeowners
        without any cash flow — the 'land doesn't deflate' point that
        the AXION narrative leans on."""
        if PROP_APPRECIATION_ANNUAL <= 0: return
        rate = PROP_APPRECIATION_ANNUAL / 12.0
        for c in self.citizens:
            if c.is_homeowner:
                c.property_value *= (1 + rate)

    def _withhold_income_tax(self):
        """Federal/state/FICA income tax on wages.
        Most drains to external (Washington, Columbus, FICA trust funds);
        the local-share % stays in colony as local payroll / income tax,
        going to the public sector balance."""
        self.income_tax_this_step = 0.0
        for c in self.citizens:
            if c.last_income > 0:
                tax = c.last_income * INCOME_TAX_RATE
                tax = min(tax, c.savings)  # can't pay tax from negative balance
                c.savings -= tax
                local_share = tax * INCOME_TAX_LOCAL_PCT
                drained    = tax - local_share
                self.public_sector.balance += local_share
                self.income_tax_local_cumulative += local_share
                self.money_drained_total += drained
                self.imports_this_step    += drained
                self.income_tax_drained_cumulative += drained
                self.income_tax_this_step += tax
                self.income_tax_cumulative += tax

    def _external_transfers(self):
        """Federal / state money flowing into the colony. Two channels:
        (a) bulk transfers to the public sector — funds public payroll
        (b) per-child transfers directly to households — covers the
            extra consumption that dependents create
        Both are BoP credits. In real small towns these inflows are huge."""
        self.public_sector.transfers_received_this_step = 0.0
        self.child_transfers_this_step = 0.0
        if self.monthly_external_transfers > 0:
            self.public_sector.receive_transfer(self.monthly_external_transfers)
        # Per-child transfers go straight to the household's adult
        for c in self.citizens:
            if c.dependents > 0:
                amt = c.dependents * CHILD_TRANSFER
                c.savings += amt
                self.child_transfers_this_step += amt
                self.money_returned_total += amt
                self.exports_this_step += amt

    def _pay_wages(self):
        all_employers = (
            list(self.local_firms.values())
            + list(self.chain_branches.values())
            + [self.public_sector]
        )
        for firm in all_employers:
            for worker in list(firm.workers):
                w = worker.wage_if_hired
                if firm.balance >= w:
                    firm.balance -= w
                    worker.receive_wage(w)
                    if hasattr(firm, "wages_paid_cumulative"):
                        firm.wages_paid_cumulative += w
                else:
                    if firm.balance > 0:
                        if hasattr(firm, "wages_paid_cumulative"):
                            firm.wages_paid_cumulative += firm.balance
                        worker.receive_wage(firm.balance)
                        firm.balance = 0
                    firm.fire(worker)

    def _citizens_consume(self):
        # Reset monthly counters
        for f in self.local_firms.values():
            f.revenue_this_month = 0.0
            f.txns_this_month = 0
        for f in self.chain_branches.values():
            f.revenue_this_month = 0.0
            f.corp_fee_paid_this_month = 0.0
            f.txns_this_month = 0
        for f in self.pure_imports.values():
            f.revenue_this_month = 0.0
            f.txns_this_month = 0
        self.transactions_this_step = 0.0
        self.sales_tax_this_step = 0.0

        order = list(self.citizens)
        self.random.shuffle(order)

        for c in order:
            if c.savings <= 0: continue
            # Citizens spend disposable (post-income-tax) income, scaled up
            # for dependents (kids consume from household budget). Sales tax
            # is deducted at point of purchase, so it comes from this spending.
            if c.employed:
                disposable = c.last_income * (1 - INCOME_TAX_RATE)
                base_target = disposable * self.target_spend_pct
            else:
                base_target = self.subsistence_floor
            target = base_target * (1 + c.dependents * CHILD_CONSUMPTION)
            target = max(target, self.subsistence_floor * (1 + c.dependents * CHILD_CONSUMPTION))
            spend = min(target, c.savings)
            if spend <= 0: continue

            for sector in SECTORS:
                sector_spend = spend * BASKET_WEIGHTS[sector]
                if sector_spend <= 0: continue
                shares = self._provider_shares(sector)
                # Stochastic provider choice per citizen-sector
                # (rather than splitting one citizen across all three)
                r = self.random.random()
                cum = 0.0
                chosen = None
                for k, share in shares.items():
                    cum += share
                    if r <= cum:
                        chosen = k
                        break
                if chosen is None:
                    chosen = "local"
                # Sales tax — citizen's payment splits: most to the provider,
                # SALES_TAX_RATE portion to the tax authority.
                tax = sector_spend * SALES_TAX_RATE
                to_provider = sector_spend - tax
                local_tax_share = tax * SALES_TAX_LOCAL_PCT
                drained_tax     = tax - local_tax_share
                self.public_sector.balance += local_tax_share
                self.sales_tax_local_cumulative += local_tax_share
                self.money_drained_total += drained_tax
                self.imports_this_step   += drained_tax
                self.sales_tax_drained_cumulative += drained_tax
                self.sales_tax_this_step += tax
                self.sales_tax_cumulative += tax
                if chosen == "local":
                    self.local_firms[sector].collect_revenue(to_provider)
                elif chosen == "chain":
                    self.chain_branches[sector].collect_revenue(to_provider)
                else:
                    self.pure_imports[sector].collect_revenue(to_provider)
                c.savings -= sector_spend
                self.transactions_this_step += sector_spend

        # Floor savings at zero
        for c in self.citizens:
            if c.savings < 0:
                c.savings = 0.0

        # Aggregate the drain decomposition for diagnostics
        self.drain_corp_fees_step    = sum(f.corp_fee_paid_this_month for f in self.chain_branches.values())
        self.drain_pure_imports_step = sum(f.revenue_this_month       for f in self.pure_imports.values())

    def _external_exports(self):
        """External buyers purchase from LocalIndy firms only. Chain branches
        don't export — they ARE the external operator's outpost. Pure imports
        obviously don't export."""
        # Average automation across sectors
        avg_a = sum(self.pure_imports[s].automation for s in SECTORS) / len(SECTORS)
        decay = max(0.0, 1.0 - avg_a * EXPORT_DECAY)
        for sector in SECTORS:
            firm = self.local_firms[sector]
            if not firm.workers:
                continue
            scale = min(1.0, len(firm.workers) / max(1, self._initial_local_workforce[sector]))
            export_rev = EXPORT_BASELINE[sector] * decay * scale
            if export_rev <= 0: continue
            firm.balance += export_rev
            firm.revenue_this_month += export_rev
            firm.revenue_cumulative += export_rev
            firm.exports_cumulative += export_rev
            self.money_returned_total += export_rev
            self.exports_this_step += export_rev
            self.exports_cumulative += export_rev

    def _firm_workforce_adjust(self):
        """Revenue-driven hire/fire for both local and chain firms.
        Chain HQ-driven downsizing already happened earlier in the step."""
        unemployed = [c for c in self.citizens if not c.employed]
        unemployed.sort(key=lambda c: c.productivity, reverse=True)

        all_firms = []
        for sector in SECTORS:
            all_firms.append((sector, "local", self.local_firms[sector]))
            all_firms.append((sector, "chain", self.chain_branches[sector]))

        for sector, kind, firm in all_firms:
            wage_cost = sum(w.wage_if_hired for w in firm.workers)
            # For chain branches, revenue available for wages is post-corp-fee
            rev_for_wages = (
                firm.revenue_this_month if kind == "local"
                else firm.revenue_this_month * (1 - CHAIN_CORP_FEE_RATE)
            )
            if wage_cost == 0:
                if rev_for_wages > 0 and unemployed and kind == "local":
                    # Local firms can bootstrap from zero workers
                    new_hire = unemployed.pop(0)
                    new_hire.employer = firm
                    firm.workers.append(new_hire)
                continue
            ratio = rev_for_wages / wage_cost if wage_cost > 0 else float('inf')
            if ratio < self.layoff_threshold and firm.workers:
                firm.workers.sort(key=lambda c: c.productivity)
                victim = firm.workers[0]
                firm.fire(victim)
            elif ratio > self.hire_threshold and unemployed:
                # Chains won't hire above HQ target
                if kind == "chain":
                    cap = firm.target_workforce(self._initial_chain_workforce[sector])
                    if len(firm.workers) >= cap:
                        continue
                new_hire = unemployed.pop(0)
                new_hire.employer = firm
                firm.workers.append(new_hire)

    def _track_unemployment(self):
        for c in self.citizens:
            if c.employed:
                c.months_unemployed = 0
            else:
                c.months_unemployed += 1

    def step(self):
        # Order matters: collect revenue + external inflows BEFORE paying wages
        # so firms (including public sector) fund payroll from the month's actual
        # cash flow rather than initial float alone.
        self.imports_this_step = 0.0
        self.exports_this_step = 0.0
        self._ramp_automation()
        self._chain_hq_workforce_reduction()
        self._citizens_consume()
        self._external_exports()
        self._external_transfers()
        self._pay_wages()
        self._withhold_income_tax()
        self._housing_payments()
        self.savings_interest_paid_this_step = 0.0
        self._pay_savings_interest()
        self._appreciate_property()
        self._firm_workforce_adjust()
        self._track_unemployment()
        self.savings_history.append([c.savings for c in self.citizens])
        self.employed_history.append([c.employed for c in self.citizens])
        self.datacollector.collect(self)
