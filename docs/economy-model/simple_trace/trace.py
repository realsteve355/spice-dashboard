"""
Single-month hand-traceable AXION simulator.

Two citizens, three external suppliers, one month, five commerce transactions.
Prints a verbose step-by-step ledger so every flow is visible.

No scenarios, no time evolution, no sweep, no dashboard. Just numbers.

Run:
    python trace.py

Cast:
    Dave   -- colony citizen, owns Dave's Co (which is a passthrough conduit)
    Julia  -- colony citizen, no job (workless)

External suppliers:
    Law Firm        -- AI-heavy, P/emp = $400,000/year
    Furniture Maker -- handmade, P/emp = $50,000/year
    Walmart         -- big retail, P/emp = $18,000/year

Money in this trace:
    S      -- colony token, only held inside the colony
    USDC   -- external currency, USD-equivalent on chain
    Fisc rate at parity = $35/S (so 28 S = $980 = one month's basket)

Five commerce transactions this month:
    1. Dave + Julia draw up a will at the Law Firm     ($1,500)
    2. Dave + Julia buy a handmade sofa                ($2,500)
    3. Julia goes to Walmart                           ($300)
    4. Julia goes to Walmart                           ($300)
    5. Julia goes to Walmart                           ($300)
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict


# ── Configuration ────────────────────────────────────────────────────────────

FISC_RATE = 35.00            # USD per S (parity at founding)
BASKET_USD = 980.00          # cost of one month's basket in USD
UBI_USD = BASKET_USD * 1.10  # $1,078/month -- UBI = basket x 1.10
DAVE_TOTAL_USD = UBI_USD * 1.20  # $1,294/month -- Dave's UBI + 20%

# Per-transaction levy rates
GAS_LEVY_USD = 0.005          # fixed, in USD per transaction
PROTOCOL_RATE = 0.001         # 0.1% of transaction value, to founders
# Automation levy: V x P_per_emp x a, where `a` is calibrated below


# ── Bookkeeping ──────────────────────────────────────────────────────────────

@dataclass
class Wallet:
    """A wallet that holds either S or USDC. (For simplicity we use only one
    or the other per wallet -- Fisc holds USDC, citizens/colony-companies hold S.)"""
    name: str
    s: float = 0.0
    usdc: float = 0.0

    def add_s(self, amount, reason):
        self.s += amount
        log(f"        {self.name}.S  {sign(amount)}{abs(amount):>12,.4f}  ->  {self.s:>12,.4f}    ({reason})")

    def add_usdc(self, amount, reason):
        self.usdc += amount
        log(f"        {self.name}.USDC {sign(amount)}${abs(amount):>10,.4f} ->  ${self.usdc:>10,.2f}  ({reason})")


def sign(n):
    return "+" if n >= 0 else "-"


def log(msg=""):
    print(msg)


# ── Tracking ─────────────────────────────────────────────────────────────────

# Citizens
dave = Wallet("Dave")
julia = Wallet("Julia")

# Colony entities
daves_co = Wallet("Dave's Co")     # holds S; pays Fisc each month for Dave's salary
fisc_reserve = Wallet("Fisc Reserve")  # holds USDC, the colony's USD backing
gas_pool = Wallet("Gas Pool")       # holds S, paid to chain validators
protocol_treasury = Wallet("Protocol Treasury")  # holds S, for AXION founders

# External suppliers (hold USDC only, since they're outside the colony)
law_firm = Wallet("Law Firm")
furniture_maker = Wallet("Furniture Maker")
walmart = Wallet("Walmart")

# Profit-per-employee for each external supplier (USD/year)
P_LAW_FIRM = 400_000
P_FURNITURE = 50_000
P_WALMART = 18_000

# S supply tracker (Fisc mints/burns)
class SSupply:
    total = 0.0
    @classmethod
    def mint(cls, amount, reason):
        cls.total += amount
        log(f"        S supply       +{amount:>12,.4f}  ->  {cls.total:>12,.4f}   ({reason})")
    @classmethod
    def burn(cls, amount, reason):
        cls.total -= amount
        log(f"        S supply       -{amount:>12,.4f}  ->  {cls.total:>12,.4f}   ({reason})")


# ── Founding state ───────────────────────────────────────────────────────────

def founding():
    log("=" * 78)
    log("FOUNDING STATE -- month 0, before any flows")
    log("=" * 78)
    # Dave's company starts with enough S to fund Dave for 12 months
    initial_co_s = DAVE_TOTAL_USD * 12 / FISC_RATE
    daves_co.s = initial_co_s
    SSupply.total = initial_co_s
    log(f"  Dave's Co founded with    {initial_co_s:>10,.4f} S  (= ${initial_co_s * FISC_RATE:>10,.2f} USDC at parity)")
    # Fisc starts with enough USDC reserve (illustrative -- not calibrated for this trace)
    fisc_reserve.usdc = 100_000.0
    log(f"  Fisc reserve starts at    ${fisc_reserve.usdc:>10,.2f} USDC")
    log(f"  Dave starts at            {dave.s:>10,.4f} S")
    log(f"  Julia starts at           {julia.s:>10,.4f} S")
    log(f"  S supply at founding      {SSupply.total:>10,.4f} S")
    log()


# ── Monthly UBI flow ─────────────────────────────────────────────────────────

def monthly_ubi():
    log("=" * 78)
    log(f"MONTHLY UBI -- UBI = basket x 1.10 = ${UBI_USD:,.2f}; Dave's bonus = 20%")
    log("=" * 78)

    # 1. Dave's company sends Dave's salary (UBI + 20%) to Fisc, in S
    log()
    log(f"  STEP 1: Dave's Co -> Fisc -- Dave's salary contribution (S)")
    log(f"          Amount: ${DAVE_TOTAL_USD:,.2f} = {DAVE_TOTAL_USD / FISC_RATE:.4f} S at parity ${FISC_RATE}/S")
    salary_s = DAVE_TOTAL_USD / FISC_RATE
    daves_co.add_s(-salary_s, "salary contribution to Fisc")
    SSupply.burn(salary_s, "Dave's Co's S burned at Fisc")

    # 2. Fisc -> Dave: UBI (mint fresh S)
    log()
    log(f"  STEP 2: Fisc -> Dave -- UBI portion (S minted)")
    ubi_s = UBI_USD / FISC_RATE
    log(f"          Amount: ${UBI_USD:,.2f} = {ubi_s:.4f} S at parity")
    SSupply.mint(ubi_s, "UBI mint to Dave")
    dave.add_s(ubi_s, "UBI received")

    # 3. Fisc -> Dave: 20% bonus (mint fresh S)
    log()
    log(f"  STEP 3: Fisc -> Dave -- 20% bonus portion (S minted)")
    bonus_usd = DAVE_TOTAL_USD - UBI_USD
    bonus_s = bonus_usd / FISC_RATE
    log(f"          Amount: ${bonus_usd:,.2f} = {bonus_s:.4f} S at parity")
    SSupply.mint(bonus_s, "bonus mint to Dave")
    dave.add_s(bonus_s, "20% bonus received")

    # 4. Fisc -> Julia: UBI (mint fresh S, funded by levy revenue)
    log()
    log(f"  STEP 4: Fisc -> Julia -- UBI (S minted, must be funded by levy revenue)")
    log(f"          Amount: ${UBI_USD:,.2f} = {ubi_s:.4f} S at parity")
    SSupply.mint(ubi_s, "UBI mint to Julia")
    julia.add_s(ubi_s, "UBI received")

    # Note on what just happened
    log()
    log(f"  Net effect of monthly UBI:")
    log(f"    Dave's Co lost {salary_s:.4f} S")
    log(f"    Dave gained    {salary_s:.4f} S  (UBI {ubi_s:.4f} + bonus {bonus_s:.4f})")
    log(f"    Julia gained   {ubi_s:.4f} S  (no offsetting payer -- funded by levy)")
    log(f"    S supply changed by: -{salary_s:.4f} + {salary_s + ubi_s:.4f} = +{ubi_s:.4f}")
    log(f"    The {ubi_s:.4f} S net mint = Julia's UBI; the levy must collect this back.")


# ── Levy calibration ─────────────────────────────────────────────────────────

# Steve's formula: per-transaction levy = V x P_per_emp x a
# where `a` is calibrated so that total levy revenue from the month's transactions
# equals the total workless UBI cost (just Julia's UBI = $1,078/month here).
#
# Sum of (V x P) for this month's transactions:
#   Will:        $1,500 x $400,000 = $600,000,000
#   Sofa:        $2,500 x $50,000 = $125,000,000
#   Walmart x 3: $300 x $18,000 x 3 = $16,200,000
#   Total:       $741,200,000
#
# So a = $1,078 / $741,200,000 = 1.45e-6

WORKLESS_UBI_THIS_MONTH = UBI_USD  # just Julia
SUM_V_TIMES_P = (1500 * P_LAW_FIRM
                 + 2500 * P_FURNITURE
                 + 3 * 300 * P_WALMART)
A_COEFFICIENT = WORKLESS_UBI_THIS_MONTH / SUM_V_TIMES_P


def show_levy_calibration():
    log()
    log("=" * 78)
    log("LEVY CALIBRATION  --  setting `a` so the budget balances this month")
    log("=" * 78)
    log(f"  Total workless UBI to fund this month   = ${WORKLESS_UBI_THIS_MONTH:,.2f}  (Julia's UBI)")
    log(f"  Sum of (V x P_per_emp) for transactions = ${SUM_V_TIMES_P:,.0f}")
    log(f"    will:        $1,500 x $400,000 = $600,000,000")
    log(f"    sofa:        $2,500 x  $50,000 = $125,000,000")
    log(f"    Walmart x 3: $300   x  $18,000 x 3 = $16,200,000")
    log()
    log(f"  Therefore a = ${WORKLESS_UBI_THIS_MONTH:,.2f} / ${SUM_V_TIMES_P:,.0f}")
    log(f"            a = {A_COEFFICIENT:.10e}")
    log()
    log(f"  Implied per-transaction automation levy rates:")
    log(f"    Law Firm        ($400K P/emp): {P_LAW_FIRM * A_COEFFICIENT * 100:.4f}% of transaction value")
    log(f"    Furniture Maker ($50K P/emp):  {P_FURNITURE * A_COEFFICIENT * 100:.4f}%")
    log(f"    Walmart         ($18K P/emp):  {P_WALMART * A_COEFFICIENT * 100:.4f}%")


# ── Commerce transactions ────────────────────────────────────────────────────

def commerce_transaction(label: str, buyer: Wallet, supplier: Wallet,
                         gross_usd: float, supplier_p_per_emp: float):
    """Execute one external commerce transaction with full levy split.

    Citizen sends S to Fisc; Fisc deducts levies (gas + protocol + automation)
    in S, converts the remainder to USDC at parity, and ships USDC to the
    external supplier. Levies are routed to gas pool / protocol treasury / Fisc reserve.
    """
    log()
    log("-" * 78)
    log(f"  TRANSACTION: {label}")
    log(f"     Gross value: ${gross_usd:,.2f}    Supplier P/emp: ${supplier_p_per_emp:,.0f}")
    log("-" * 78)

    # Convert gross to S
    gross_s = gross_usd / FISC_RATE
    log(f"  At parity rate ${FISC_RATE}/S, gross_S = ${gross_usd:,.2f} / ${FISC_RATE} = {gross_s:.4f} S")

    # Compute levies in S
    gas_s = GAS_LEVY_USD / FISC_RATE
    protocol_s = gross_s * PROTOCOL_RATE
    automation_rate = supplier_p_per_emp * A_COEFFICIENT  # per dollar of transaction
    automation_s = gross_s * automation_rate

    total_levy_s = gas_s + protocol_s + automation_s
    net_s = gross_s - total_levy_s
    net_usdc = net_s * FISC_RATE
    automation_usdc = automation_s * FISC_RATE
    protocol_usdc = protocol_s * FISC_RATE
    gas_usdc = gas_s * FISC_RATE

    log()
    log(f"  Levies computed at Fisc (in S):")
    log(f"     gas levy        = {gas_s:.6f} S  (= ${gas_usdc:.4f}, fixed per-tx)")
    log(f"     protocol levy   = {protocol_s:.6f} S  (= ${protocol_usdc:.4f}, 0.1% of gross)")
    log(f"     automation levy = {automation_s:.6f} S  (= ${automation_usdc:.4f}, V x P x a = {automation_rate * 100:.4f}%)")
    log(f"     total levy      = {total_levy_s:.6f} S  (= ${total_levy_s * FISC_RATE:.4f})")
    log(f"     net to supplier = {net_s:.6f} S  (= ${net_usdc:.4f})")

    # Apply movements
    log()
    log(f"  Wallet movements:")

    # 1. Buyer's S balance debited
    buyer.add_s(-gross_s, f"sent {gross_s:.4f} S to Fisc for this transaction")

    # 2. S burned at Fisc (the supplier-net portion + automation portion)
    SSupply.burn(net_s, "supplier-net S burned (will become USDC out)")
    SSupply.burn(automation_s, "automation levy burned (S supply reduces)")

    # 3. Gas + protocol levies stay as S in colony (held by Fisc on behalf of those parties)
    gas_pool.add_s(gas_s, "gas levy")
    protocol_treasury.add_s(protocol_s, "protocol levy")

    # 4. USDC moves from Fisc reserve to external supplier
    fisc_reserve.add_usdc(-net_usdc, f"{net_usdc:.4f} USDC sent out to {supplier.name}")
    supplier.add_usdc(net_usdc, f"received from {buyer.name}")

    # NOTE on accounting: by burning 'net_s + automation_s' worth of S and
    # only paying out 'net_s x rate' USDC, the Fisc effectively retains
    # 'automation_s x rate' USDC of value (the supply-side reduction in S
    # makes the same reserve back fewer S). That retention IS the automation
    # levy revenue, even though we never explicitly added it as a separate
    # USDC line item.
    log(f"     [accounting note: automation_levy ${automation_usdc:.4f} stays implicit in the")
    log(f"      reserve via S-supply reduction -- the same reserve now backs less S.]")


# ── Run the month ────────────────────────────────────────────────────────────

def main():
    founding()
    monthly_ubi()
    show_levy_calibration()

    log()
    log("=" * 78)
    log("COMMERCE -- five external transactions this month")
    log("=" * 78)

    # Three Walmart trips by Julia
    # One sofa from Furniture Maker (we'll attribute to Dave -- high-value purchase)
    # One will from Law Firm (we'll attribute to Dave -- household legal service)
    # Note: who pays from their wallet doesn't change the levy mechanics,
    # only the wallet balance changes accordingly.

    commerce_transaction("Will at Law Firm -- paid by Dave",
                         dave, law_firm, 1500.00, P_LAW_FIRM)
    commerce_transaction("Sofa at Furniture Maker -- paid by Dave",
                         dave, furniture_maker, 2500.00, P_FURNITURE)
    commerce_transaction("Walmart trip 1 -- paid by Julia",
                         julia, walmart, 300.00, P_WALMART)
    commerce_transaction("Walmart trip 2 -- paid by Julia",
                         julia, walmart, 300.00, P_WALMART)
    commerce_transaction("Walmart trip 3 -- paid by Julia",
                         julia, walmart, 300.00, P_WALMART)

    log()
    log("=" * 78)
    log("END-OF-MONTH STATE")
    log("=" * 78)
    log()
    log(f"  CITIZENS")
    log(f"    Dave           {dave.s:>12,.4f} S   (= ${dave.s * FISC_RATE:>10,.2f} at parity)")
    log(f"    Julia          {julia.s:>12,.4f} S   (= ${julia.s * FISC_RATE:>10,.2f} at parity)")
    log()
    log(f"  COLONY ENTITIES")
    log(f"    Dave's Co      {daves_co.s:>12,.4f} S")
    log(f"    Gas Pool       {gas_pool.s:>12,.4f} S   (= ${gas_pool.s * FISC_RATE:>10,.4f})")
    log(f"    Protocol Trsy  {protocol_treasury.s:>12,.4f} S   (= ${protocol_treasury.s * FISC_RATE:>10,.4f})")
    log(f"    Fisc Reserve   ${fisc_reserve.usdc:>10,.2f} USDC")
    log()
    log(f"  EXTERNAL SUPPLIERS (USDC received)")
    log(f"    Law Firm        ${law_firm.usdc:>10,.4f}")
    log(f"    Furniture Maker ${furniture_maker.usdc:>10,.4f}")
    log(f"    Walmart         ${walmart.usdc:>10,.4f}")
    log()
    log(f"  TOTALS")
    log(f"    S supply               {SSupply.total:>12,.4f} S")
    log(f"    Total external USDC   ${law_firm.usdc + furniture_maker.usdc + walmart.usdc:>10,.4f}")

    # Sanity check: did the levy fund Julia's UBI?
    total_levy_collected_usd = (gas_pool.s + protocol_treasury.s) * FISC_RATE
    # Plus implicit automation retention:
    # Total automation levy = sum of (V x P x a) across all transactions
    auto_collected_usd = (1500 * P_LAW_FIRM
                          + 2500 * P_FURNITURE
                          + 3 * 300 * P_WALMART) * A_COEFFICIENT

    log()
    log("=" * 78)
    log("SANITY CHECK -- did the levy actually fund Julia's UBI this month?")
    log("=" * 78)
    log()
    log(f"  Julia's UBI cost this month            = ${UBI_USD:,.2f}")
    log(f"  Automation levy collected this month   = ${auto_collected_usd:,.2f}  (= sum of V x P x a)")
    log(f"  Gas levy collected (held in S)         = ${gas_pool.s * FISC_RATE:,.4f}")
    log(f"  Protocol levy collected (held in S)    = ${protocol_treasury.s * FISC_RATE:,.4f}")
    log()
    log(f"  Budget balance: automation - workless_UBI = ${auto_collected_usd - UBI_USD:+,.4f}")
    log(f"  (should be approximately zero; calibrated to match by construction)")
    log()
    log("  Observation about Dave: Dave's Co paid $1,294 to Fisc; Dave received $1,294 back.")
    log("  Net change to (Dave + Dave's Co) combined wealth: $0.")
    log("  -> 'Work' in this model only routes money -- it doesn't generate net income.")
    log("    Compensation only emerges if Dave's Co has external revenue (not modelled here).")


if __name__ == "__main__":
    main()
