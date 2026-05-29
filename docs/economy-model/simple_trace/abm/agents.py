"""Mesa Agents for the toy colony.

Citizens hold MOND and accumulate external USD savings via the Fisc boundary.
Businesses hold MOND, have an owner Citizen, and pay external supplier/HQ fees.

All transaction logic is orchestrated by ColonyModel.step() — agents are
state holders here. As the model scales, decision rules (when a citizen
converts MOND to USD, how much working balance they target) move into the
agents themselves; for the minimal reproduction milestone the rules are
identical for every citizen and live on the model.
"""
from mesa import Agent


class Citizen(Agent):
    def __init__(self, model, name, profession):
        super().__init__(model)
        self.name = name
        self.profession = profession   # 'mcd_franchisee' | 'coffee_owner' | 'pottery'
        self.business = None           # set by model wiring
        self.mond = 0.0
        self.external_usd = 0.0        # cumulative USD savings outside the colony

    def step(self):
        # All behaviour is driven from the model's phase loop in the
        # minimal milestone. Heterogeneous decision rules will land here next.
        pass


class Business(Agent):
    def __init__(self, model, name, owner, kind):
        super().__init__(model)
        self.name = name
        self.owner = owner             # Citizen
        self.kind = kind               # 'mcd' | 'coffee'
        self.mond = 0.0

    def step(self):
        pass
