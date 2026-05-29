"""ColonyModel — the Mesa Model orchestrating the toy colony.

Each step() = one month. The monthly phase sequence mirrors ledger.js
exactly so we can verify numeric parity before scaling up.

State held on the model:
  - Fisc USD reserve and MOND outstanding (the boundary accounting)
  - Cumulative monthly aggregates (FX outflow, MPC collected, etc.)

State held on agents:
  - Per-citizen MOND balance + cumulative external USD savings
  - Per-business MOND balance (always zero end-of-month after owner draw)
"""
from mesa import Model
from mesa.datacollection import DataCollector

from .agents import Citizen, Business


class ColonyModel(Model):
    def __init__(
        self,
        *,
        ubi_mode="universal",       # 'universal' | 'targeted'
        ubi_universal=1000.0,
        ubi_floor=600.0,
        fisc_start=10000.0,
        mpc_rate=0.15,
        c_mcd=300.0,
        c_coffee=150.0,
        c_external=150.0,
        mcd_corp=0.60,
        coffee_sup=0.40,
        pottery_rev=2000.0,
        pottery_sup=0.20,
        fx_pct=0.50,
        working_bal=600.0,
        seed=None,
    ):
        super().__init__(seed=seed)
        # Parameters bag — kept as a plain dict so DataCollector can stringify it
        self.p = dict(
            ubi_mode=ubi_mode, ubi_universal=ubi_universal, ubi_floor=ubi_floor,
            fisc_start=fisc_start, mpc_rate=mpc_rate,
            c_mcd=c_mcd, c_coffee=c_coffee, c_external=c_external,
            mcd_corp=mcd_corp, coffee_sup=coffee_sup,
            pottery_rev=pottery_rev, pottery_sup=pottery_sup,
            fx_pct=fx_pct, working_bal=working_bal,
        )

        # Boundary state
        self.fisc_usd = float(fisc_start)
        self.mond_outstanding = 0.0
        self.fx_outflow_this_step = 0.0
        self.mpc_collected_this_step = 0.0
        self.ubi_minted_this_step = 0.0

        # Agents
        self.bob   = Citizen(self, "Bob",   "mcd_franchisee")
        self.alice = Citizen(self, "Alice", "coffee_owner")
        self.john  = Citizen(self, "John",  "pottery")
        self.jane  = Citizen(self, "Jane",  "pottery")
        self.citizens = [self.bob, self.alice, self.john, self.jane]

        self.mcd    = Business(self, "Bob's McDonald's", self.bob,   "mcd")
        self.coffee = Business(self, "Alice's Coffee",   self.alice, "coffee")
        self.bob.business   = self.mcd
        self.alice.business = self.coffee
        self.businesses = [self.mcd, self.coffee]

        # Data collection — one row per step (= month)
        self.datacollector = DataCollector(
            model_reporters={
                "month":            lambda m: m.steps,
                "fisc_usd":         lambda m: m.fisc_usd,
                "mond_outstanding": lambda m: m.mond_outstanding,
                "ubi_minted":       lambda m: m.ubi_minted_this_step,
                "mpc_collected":    lambda m: m.mpc_collected_this_step,
                "fx_outflow":       lambda m: m.fx_outflow_this_step,
                "bob_mond":         lambda m: m.bob.mond,
                "alice_mond":       lambda m: m.alice.mond,
                "john_mond":        lambda m: m.john.mond,
                "jane_mond":        lambda m: m.jane.mond,
                "bob_usd_save":     lambda m: m.bob.external_usd,
                "alice_usd_save":   lambda m: m.alice.external_usd,
                "john_usd_save":    lambda m: m.john.external_usd,
                "jane_usd_save":    lambda m: m.jane.external_usd,
            }
        )
        # Record initial (month 0) state
        self.datacollector.collect(self)

    # ── Boundary primitives ──────────────────────────────────────────────
    # These are the only ways MOND comes into / out of existence and the only
    # ways the Fisc USD reserve changes.

    def _mint(self, agent, amount):
        """Mint new MOND to an agent (UBI or export-earning)."""
        agent.mond += amount
        self.mond_outstanding += amount

    def _retire(self, agent, amount):
        """Agent spends MOND at the boundary. MOND retires; Fisc USD drops."""
        agent.mond -= amount
        self.mond_outstanding -= amount
        self.fisc_usd -= amount

    def _export_to(self, agent, amount):
        """External pays USD into Fisc; equivalent MOND minted to agent."""
        agent.mond += amount
        self.mond_outstanding += amount
        self.fisc_usd += amount

    @staticmethod
    def _transfer(frm, to, amount):
        """Internal MOND transfer between two colony entities."""
        frm.mond -= amount
        to.mond  += amount

    # ── Projections used by means-tested UBI ─────────────────────────────
    def _projected_profit(self, citizen):
        p = self.p
        if citizen is self.bob:
            return p["c_mcd"] * len(self.citizens) * (1 - p["mcd_corp"])
        if citizen is self.alice:
            return p["c_coffee"] * len(self.citizens) * (1 - p["coffee_sup"])
        # John and Jane split pottery profit
        return p["pottery_rev"] * (1 - p["pottery_sup"]) / 2

    def _ubi_for(self, citizen):
        p = self.p
        if p["ubi_mode"] == "universal":
            return p["ubi_universal"]
        return max(0.0, p["ubi_floor"] - self._projected_profit(citizen))

    # ── One step = one month ─────────────────────────────────────────────
    def step(self):
        p = self.p
        # Reset per-step aggregates
        self.fx_outflow_this_step = 0.0
        self.mpc_collected_this_step = 0.0
        self.ubi_minted_this_step = 0.0

        # 1. UBI mint
        for c in self.citizens:
            amt = self._ubi_for(c)
            if amt > 0:
                self._mint(c, amt)
                self.ubi_minted_this_step += amt

        # 2. McDonald's purchases (internal)
        for c in self.citizens:
            self._transfer(c, self.mcd, p["c_mcd"])

        # 3. Coffee purchases (internal)
        for c in self.citizens:
            self._transfer(c, self.coffee, p["c_coffee"])

        # 4. External imports (boundary)
        imports_total = 0.0
        for c in self.citizens:
            self._retire(c, p["c_external"])
            imports_total += p["c_external"]

        # 5. Pottery exports
        self._export_to(self.john, p["pottery_rev"] / 2)
        self._export_to(self.jane, p["pottery_rev"] / 2)

        # 6. Pottery supplies
        pot_sup_each = p["pottery_rev"] * p["pottery_sup"] / 2
        self._retire(self.john, pot_sup_each)
        self._retire(self.jane, pot_sup_each)

        # 7. McDonald's HQ corporate fee
        mcd_corp_amt = p["c_mcd"] * len(self.citizens) * p["mcd_corp"]
        self._retire(self.mcd, mcd_corp_amt)

        # 8. Coffee supplier payment
        coffee_sup_amt = p["c_coffee"] * len(self.citizens) * p["coffee_sup"]
        self._retire(self.coffee, coffee_sup_amt)

        # 9. Business owner draws
        if self.mcd.mond > 0:
            self._transfer(self.mcd, self.bob, self.mcd.mond)
        if self.coffee.mond > 0:
            self._transfer(self.coffee, self.alice, self.coffee.mond)

        # 10. MPC collected from external counterparties
        external_revenue = (
            imports_total + 2 * pot_sup_each + mcd_corp_amt + coffee_sup_amt
        )
        mpc_usd = external_revenue * p["mpc_rate"]
        self.fisc_usd += mpc_usd
        self.mpc_collected_this_step = mpc_usd

        # 11. Citizen FX investment — spare MOND above working balance → USD
        if p["fx_pct"] > 0:
            for c in self.citizens:
                surplus = max(0.0, c.mond - p["working_bal"])
                conv = surplus * p["fx_pct"]
                if conv > 0.005:
                    c.mond -= conv
                    self.mond_outstanding -= conv
                    self.fisc_usd -= conv
                    c.external_usd += conv
                    self.fx_outflow_this_step += conv

        # Increment step counter (Mesa 3.x tracks this itself in run_model,
        # but our manual loop needs to advance it) and record the snapshot.
        self.steps += 1
        self.datacollector.collect(self)
