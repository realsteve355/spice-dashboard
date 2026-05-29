"""Colony v0 — pre-AXION baseline.

A small open economy under automation pressure, no UBI, no central authority,
fixed money supply (within the colony — money drains permanently when citizens
buy from external automated firms).

3 sectors: food, goods, services.
Each sector has 1 local firm (employs colony citizens) and 1 external firm
(automated, exogenous price falls as automation level A_sector rises).

30 citizens with Pareto-distributed productivity. Each month: citizens receive
wages (if employed) → allocate target spending across sectors → choose local
or external per sector by price (with loyalty noise). Local firms collect
revenue, pay wages, lay off workers if revenue can't cover payroll.

The expected story: as A_sector → 1, external prices fall → citizens shift
spending external → local revenue collapses → layoffs cascade → savings
drain → unemployment rises → money supply within colony shrinks → deflation
+ destitution. This is the Collision at colony scale, no AXION yet.
"""
from __future__ import annotations
import math

from mesa import Agent, Model
from mesa.datacollection import DataCollector


# ── Sectors ──────────────────────────────────────────────────────────────
SECTORS = ["food", "goods", "services"]
BASKET_WEIGHTS = {"food": 0.25, "goods": 0.35, "services": 0.40}
INITIAL_LOCAL_PRICES = {"food": 80.0, "goods": 100.0, "services": 120.0}
MAX_AUTOMATION_DEFLATION = 0.85   # external price at A=1 is 15% of local
LOYALTY_BIAS = 0.15                # citizens prefer local at equal price
PRICE_SENSITIVITY = 25.0           # logistic scale for switching


# ── Agents ───────────────────────────────────────────────────────────────
class Citizen(Agent):
    def __init__(self, model, productivity, initial_savings):
        super().__init__(model)
        self.productivity = productivity
        self.savings = initial_savings
        self.employer = None         # LocalFirm or None
        self.last_income = 0.0
        self.months_unemployed = 0

    @property
    def employed(self):
        return self.employer is not None

    @property
    def wage_if_hired(self):
        return self.model.base_wage * self.productivity

    def receive_wage(self, amount):
        self.savings += amount
        self.last_income = amount

    def step(self):
        # All decision logic happens in model phases. Citizens are state holders.
        pass


class LocalFirm(Agent):
    """Local firm — employs citizens, pays wages, prices set by costs + markup."""
    def __init__(self, model, sector, initial_workers, initial_float):
        super().__init__(model)
        self.sector = sector
        self.workers: list[Citizen] = []
        self.balance = initial_float
        self.price = INITIAL_LOCAL_PRICES[sector]
        self.revenue_this_month = 0.0
        self.markup = 1.20

        # Hire initial workforce
        for c in initial_workers:
            c.employer = self
            self.workers.append(c)

    def collect_revenue(self, amount):
        self.balance += amount
        self.revenue_this_month += amount

    def fire(self, citizen):
        if citizen in self.workers:
            self.workers.remove(citizen)
            citizen.employer = None
            citizen.months_unemployed = 0

    def step(self):
        pass


class ExternalFirm(Agent):
    """External firm — automated, exogenous price falls with automation level A."""
    def __init__(self, model, sector):
        super().__init__(model)
        self.sector = sector
        self.automation = 0.0
        self.price = INITIAL_LOCAL_PRICES[sector]
        self.revenue_this_month = 0.0

    def update_price(self):
        base = INITIAL_LOCAL_PRICES[self.sector]
        # At A=1, price falls to (1 - MAX_AUTOMATION_DEFLATION) × base
        self.price = base * (1.0 - self.automation * MAX_AUTOMATION_DEFLATION)

    def collect_revenue(self, amount):
        # Money leaves the colony permanently
        self.revenue_this_month += amount
        self.model.money_drained_total += amount

    def step(self):
        pass


# ── Model ────────────────────────────────────────────────────────────────
class ColonyV0Model(Model):
    def __init__(
        self,
        *,
        n_citizens: int = 30,
        pareto_alpha: float = 1.6,    # lower = more wealth concentration
        initial_savings: float = 1500.0,
        base_wage: float = 400.0,     # nominal wage; actual = base × productivity
        target_spend_pct: float = 1.00,  # spend 100% of wages — fixed-supply colony with no banking
                                          # cannot tolerate Keynesian leakage in steady state
        subsistence_floor: float = 250.0,
        firm_initial_float: float = 3000.0,
        automation_end: float = 0.85, # A_sector at last month
        automation_months: int = 60,  # horizon for ramping A
        sectors_automate: tuple = ("food", "goods", "services"),
        layoff_threshold: float = 0.70,  # fire if revenue/wage_cost < this
        hire_threshold: float = 1.15,    # hire if revenue/wage_cost > this
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
        self.money_drained_total = 0.0   # cumulative money that left the colony

        # Spawn citizens with Pareto productivity
        self.citizens: list[Citizen] = []
        for _ in range(n_citizens):
            # Pareto: minimum = 1.0, alpha = pareto_alpha. Most around 1-1.5, some 3-5+
            p = self.random.paretovariate(pareto_alpha)
            # Cap at 6 to avoid extreme outliers
            p = min(p, 6.0)
            self.citizens.append(Citizen(self, productivity=p, initial_savings=initial_savings))

        # Spawn firms — one local + one external per sector
        # Workforce allocation: hire citizens proportional to sector basket weight
        # AND distribute productivity evenly across firms so no firm starts with
        # a payroll mismatch caused by random Pareto draws.
        sector_alloc = {s: max(1, round(n_citizens * BASKET_WEIGHTS[s])) for s in SECTORS}
        diff = n_citizens - sum(sector_alloc.values())
        if diff:
            biggest = max(sector_alloc, key=sector_alloc.get)
            sector_alloc[biggest] += diff
        # Round-robin highest-productivity citizens across firms to balance payrolls
        by_p_desc = sorted(self.citizens, key=lambda c: c.productivity, reverse=True)
        firm_workers: dict[str, list] = {s: [] for s in SECTORS}
        capacity = dict(sector_alloc)
        sector_cycle = list(SECTORS)
        i = 0
        for c in by_p_desc:
            for _ in range(len(sector_cycle)):
                s = sector_cycle[i % len(sector_cycle)]
                i += 1
                if capacity[s] > 0:
                    firm_workers[s].append(c)
                    capacity[s] -= 1
                    break
        self.local_firms: dict[str, LocalFirm] = {}
        for sector in SECTORS:
            self.local_firms[sector] = LocalFirm(
                self, sector, initial_workers=firm_workers[sector],
                initial_float=firm_initial_float,
            )

        self.external_firms: dict[str, ExternalFirm] = {
            s: ExternalFirm(self, s) for s in SECTORS
        }

        # Per-citizen history — captured for the dashboard heatmap.
        # savings_history[m][i] = citizen i's savings at end of month m.
        self.savings_history: list[list[float]] = [[c.savings for c in self.citizens]]
        self.employed_history: list[list[bool]] = [[c.employed for c in self.citizens]]
        self.productivities = [c.productivity for c in self.citizens]

        # Data collection
        self.datacollector = DataCollector(
            model_reporters={
                "month":             lambda m: m.steps,
                "employment_rate":   lambda m: m.employment_rate(),
                "money_supply":      lambda m: m.money_supply_internal(),
                "money_drained":     lambda m: m.money_drained_total,
                "gini":              lambda m: m.gini(),
                "top10_share":       lambda m: m.top_n_wealth_share(0.10),
                "basket_cost_local": lambda m: m.basket_cost_local(),
                "basket_cost_avg":   lambda m: m.basket_cost_avg(),
                "destitute_count":   lambda m: sum(1 for c in m.citizens if c.savings < 1.0),
                "automation_food":   lambda m: m.external_firms["food"].automation,
                "automation_goods":  lambda m: m.external_firms["goods"].automation,
                "automation_serv":   lambda m: m.external_firms["services"].automation,
                "ext_price_food":    lambda m: m.external_firms["food"].price,
                "ext_price_goods":   lambda m: m.external_firms["goods"].price,
                "ext_price_serv":    lambda m: m.external_firms["services"].price,
                "loc_revenue_food":  lambda m: m.local_firms["food"].revenue_this_month,
                "loc_revenue_goods": lambda m: m.local_firms["goods"].revenue_this_month,
                "loc_revenue_serv":  lambda m: m.local_firms["services"].revenue_this_month,
                "workers_food":      lambda m: len(m.local_firms["food"].workers),
                "workers_goods":     lambda m: len(m.local_firms["goods"].workers),
                "workers_serv":      lambda m: len(m.local_firms["services"].workers),
                "median_savings":    lambda m: m.median_savings(),
            }
        )
        self.datacollector.collect(self)

    # ── Metrics ──────────────────────────────────────────────────────────
    def employment_rate(self):
        if not self.citizens: return 0.0
        return sum(1 for c in self.citizens if c.employed) / len(self.citizens)

    def money_supply_internal(self):
        return sum(c.savings for c in self.citizens) + sum(f.balance for f in self.local_firms.values())

    def gini(self):
        """Standard Gini coefficient over citizen savings."""
        savs = sorted(max(0.0, c.savings) for c in self.citizens)
        n = len(savs)
        total = sum(savs)
        if n == 0 or total == 0: return 0.0
        cumsum = 0
        for i, v in enumerate(savs, start=1):
            cumsum += i * v
        return (2 * cumsum) / (n * total) - (n + 1) / n

    def top_n_wealth_share(self, frac):
        savs = sorted((max(0.0, c.savings) for c in self.citizens), reverse=True)
        total = sum(savs)
        if total == 0: return 0.0
        k = max(1, int(len(savs) * frac))
        return sum(savs[:k]) / total

    def basket_cost_local(self):
        return sum(self.local_firms[s].price * BASKET_WEIGHTS[s] for s in SECTORS)

    def basket_cost_avg(self):
        """Average basket cost weighted by where citizens shop (matched to consumption logistic)."""
        cost = 0.0
        for s in SECTORS:
            lp = self.local_firms[s].price
            ep = self.external_firms[s].price
            advantage = (lp - ep) / lp if lp > 0 else 0.0
            if advantage <= 0:
                p_ext = 0.0
            else:
                p_ext = 1.0 / (1.0 + math.exp(-(advantage - 0.10) / 0.10))
            avg_p = lp * (1 - p_ext) + ep * p_ext
            cost += avg_p * BASKET_WEIGHTS[s]
        return cost

    def median_savings(self):
        savs = sorted(c.savings for c in self.citizens)
        n = len(savs)
        if n == 0: return 0.0
        return savs[n // 2]

    # ── Step orchestration ───────────────────────────────────────────────
    def _ramp_automation(self):
        # Linear ramp from 0 to automation_end across automation_months
        m = self.steps + 1   # next month
        frac = min(1.0, m / max(1, self.automation_months))
        for sector in SECTORS:
            if sector in self.sectors_automate:
                self.external_firms[sector].automation = self.automation_end * frac
            self.external_firms[sector].update_price()

    def _pay_wages(self):
        for firm in self.local_firms.values():
            for worker in list(firm.workers):
                w = worker.wage_if_hired
                if firm.balance >= w:
                    firm.balance -= w
                    worker.receive_wage(w)
                else:
                    # Firm can't make payroll. Pay what we can; fire the worker.
                    if firm.balance > 0:
                        worker.receive_wage(firm.balance)
                        firm.balance = 0
                    firm.fire(worker)

    def _citizens_consume(self):
        # Reset firm monthly revenue counters
        for f in self.local_firms.values():    f.revenue_this_month = 0.0
        for f in self.external_firms.values(): f.revenue_this_month = 0.0

        # Random order to avoid systematic bias
        order = list(self.citizens)
        self.random.shuffle(order)

        for c in order:
            if c.savings <= 0:
                continue
            target = (c.last_income * self.target_spend_pct
                      if c.employed else self.subsistence_floor)
            target = max(target, self.subsistence_floor)
            spend = min(target, c.savings)
            if spend <= 0: continue

            for sector in SECTORS:
                sector_spend = spend * BASKET_WEIGHTS[sector]
                if sector_spend <= 0: continue
                local = self.local_firms[sector]
                ext   = self.external_firms[sector]
                # External-switch probability: zero when ext is not cheaper,
                # ramps up logistically as the price advantage grows.
                advantage = (local.price - ext.price) / local.price if local.price > 0 else 0.0
                if advantage <= 0:
                    p_ext = 0.0
                else:
                    # Mid-point at 10% advantage; spread 10%.
                    p_ext = 1.0 / (1.0 + math.exp(-(advantage - 0.10) / 0.10))

                if self.random.random() < p_ext:
                    ext.collect_revenue(sector_spend)
                    c.savings -= sector_spend
                else:
                    local.collect_revenue(sector_spend)
                    c.savings -= sector_spend
        # Floor savings at zero — can't borrow in v0
        for c in self.citizens:
            if c.savings < 0:
                c.savings = 0.0

    def _firm_workforce_adjust(self):
        """Lay off workers if revenue can't cover payroll, hire if surplus."""
        unemployed = [c for c in self.citizens if not c.employed]
        # Sort unemployed by productivity (highest first — they get rehired first)
        unemployed.sort(key=lambda c: c.productivity, reverse=True)

        for sector in SECTORS:
            firm = self.local_firms[sector]
            wage_cost = sum(w.wage_if_hired for w in firm.workers)
            rev = firm.revenue_this_month
            if wage_cost == 0:
                # Empty firm — hire if revenue exists
                if rev > 0 and unemployed:
                    new_hire = unemployed.pop(0)
                    new_hire.employer = firm
                    firm.workers.append(new_hire)
                continue
            ratio = rev / wage_cost if wage_cost > 0 else float('inf')
            if ratio < self.layoff_threshold and firm.workers:
                # Lay off the lowest-productivity worker
                firm.workers.sort(key=lambda c: c.productivity)
                victim = firm.workers[0]
                firm.fire(victim)
            elif ratio > self.hire_threshold and unemployed:
                # Hire one
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
        # Mesa 3.x auto-increments self.steps in the base Model.step machinery,
        # so we must NOT increment it manually here (it would double-count).
        self._ramp_automation()
        self._pay_wages()
        self._citizens_consume()
        self._firm_workforce_adjust()
        self._track_unemployment()
        self.savings_history.append([c.savings for c in self.citizens])
        self.employed_history.append([c.employed for c in self.citizens])
        self.datacollector.collect(self)
