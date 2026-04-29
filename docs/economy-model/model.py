"""
SPICE Earth-colony economic model — 24-month deterministic simulation.

Purpose: trace the monthly flows of S, V, and USDC reserve through a
representative colony to see whether the system is self-sustaining or
whether it runs out of money.

Run:
    python docs/economy-model/model.py

Outputs:
    docs/economy-model/results/monthly_state.csv   — full state per month
    docs/economy-model/results/monthly_flows.csv   — flows per month
    docs/economy-model/results/*.png               — charts

The model is intentionally simple and deterministic so the failure modes
are inspectable. Stochastic variants come later.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
import csv
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


# ── Default parameters ─────────────────────────────────────────────────────────

@dataclass
class Params:
    # Population
    n_citizens:         int   = 1000
    n_large_companies:  int   = 5      # exporters earning USD externally
    n_mid_companies:    int   = 15     # domestic — services, larger workshops
    n_small_companies:  int   = 30     # sole traders, food stalls

    # Fisc anchor
    target_fisc_rate:   float = 1.00   # $1 per S target peg

    # UBI (S)
    ubi_per_month:      float = 100.0  # S per citizen per month
    ubi_claim_rate:     float = 0.95   # fraction of citizens claiming each month

    # Citizen behaviour
    citizen_spend_rate:     float = 0.85   # of S held, spent each month
    citizen_save_rate:      float = 0.05   # S → V each month (of S held)
    citizen_cashout_rate:   float = 0.02   # fraction of citizens cashing out
    citizen_cashout_size:   float = 0.30   # fraction of their V they convert

    # Spending split by destination
    spend_to_large_co_pct:  float = 0.25
    spend_to_mid_co_pct:    float = 0.35
    spend_to_small_co_pct:  float = 0.30
    spend_to_p2p_pct:       float = 0.10   # citizen-to-citizen

    # Company behaviour (as fractions of monthly revenue)
    company_wage_pct:       float = 0.50   # paid back to citizens
    company_mcc_bill_pct:   float = 0.05   # MCC services
    company_v_save_pct:     float = 0.10   # S → V
    company_dividend_pct:   float = 0.05   # V → V dividend to shareholders (citizens)

    # Exports — large companies earn USD externally, convert via Fisc
    export_usd_per_large_co_per_month: float = 5_000.0
    lat_participation:    float = 0.60     # of large companies opting into LAT
    lat_rate_on_revenue:  float = 0.05     # of USD revenue paid to MCC for redistribution

    # Fisc reserve
    initial_usdc_reserve:    float = 50_000.0   # seeded at colony launch
    reserve_target_ratio:    float = 0.30       # USDC / V_supply target (30% cover)
    reserve_floor_ratio:     float = 0.10       # below this, Fisc rate cuts hard

    # MCC behaviour
    mcc_consumes_pct:       float = 0.80   # of collected S, spent on services (returns to citizens via wages → recursive but here simplified to "removed")

    # Simulation
    months: int = 24


# ── Single-month state ─────────────────────────────────────────────────────────

@dataclass
class State:
    month:          int   = 0
    s_citizens:     float = 0.0       # S held collectively by citizens
    s_large_co:     float = 0.0
    s_mid_co:       float = 0.0
    s_small_co:     float = 0.0
    s_mcc:          float = 0.0
    v_citizens:     float = 0.0       # V held by citizens
    v_companies:    float = 0.0       # V held by companies (company V-reserve)
    usdc_reserve:   float = 0.0       # Fisc holdings
    fisc_rate:      float = 1.0       # $/S
    velocity_total_spend: float = 0.0  # S volume of all transactions in the month

    @property
    def s_supply(self) -> float:
        return self.s_citizens + self.s_large_co + self.s_mid_co + self.s_small_co + self.s_mcc

    @property
    def v_supply(self) -> float:
        return self.v_citizens + self.v_companies

    @property
    def reserve_ratio(self) -> float:
        if self.v_supply <= 0:
            return float("inf")
        return self.usdc_reserve / self.v_supply

    @property
    def velocity(self) -> float:
        if self.s_supply <= 0:
            return 0.0
        return self.velocity_total_spend / self.s_supply


@dataclass
class MonthlyFlows:
    month:        int = 0
    ubi_minted:   float = 0.0
    citizen_spend:float = 0.0
    wages_paid:   float = 0.0
    mcc_bills:    float = 0.0
    s_to_v_citizens:  float = 0.0
    s_to_v_companies: float = 0.0
    cashouts_v:   float = 0.0
    cashouts_usd: float = 0.0
    export_usd_in: float = 0.0
    export_s_minted_via_fisc: float = 0.0
    lat_usd_in:   float = 0.0
    mcc_consumed: float = 0.0
    dividends_paid: float = 0.0


# ── Fisc rate adjustment ───────────────────────────────────────────────────────

def update_fisc_rate(state: State, p: Params) -> float:
    """
    Fisc rate compresses when reserve ratio falls below target.
    Linear from full peg at target_ratio → 0 at zero reserve.
    """
    r = state.reserve_ratio
    if r >= p.reserve_target_ratio:
        return p.target_fisc_rate
    # Linear compression from target down to floor
    if r <= 0:
        return 0.01  # collapsed; treated as ~zero but non-zero to avoid div-zero
    return max(0.01, p.target_fisc_rate * (r / p.reserve_target_ratio))


# ── One-month simulation step ──────────────────────────────────────────────────

def step(prev: State, p: Params) -> tuple[State, MonthlyFlows]:
    s = State(
        month=prev.month + 1,
        s_citizens=prev.s_citizens,
        s_large_co=prev.s_large_co,
        s_mid_co=prev.s_mid_co,
        s_small_co=prev.s_small_co,
        s_mcc=prev.s_mcc,
        v_citizens=prev.v_citizens,
        v_companies=prev.v_companies,
        usdc_reserve=prev.usdc_reserve,
        fisc_rate=prev.fisc_rate,
    )
    f = MonthlyFlows(month=s.month)

    # 1. UBI mint — MCC creates new S for citizens
    f.ubi_minted = p.n_citizens * p.ubi_per_month * p.ubi_claim_rate
    s.s_citizens += f.ubi_minted

    # 2. Citizens spend a fraction of their S balance
    spend = s.s_citizens * p.citizen_spend_rate
    f.citizen_spend = spend
    s.s_citizens -= spend

    # Distribute spend to companies + p2p
    s.s_large_co += spend * p.spend_to_large_co_pct
    s.s_mid_co   += spend * p.spend_to_mid_co_pct
    s.s_small_co += spend * p.spend_to_small_co_pct
    s.s_citizens += spend * p.spend_to_p2p_pct  # P2P stays with citizens

    s.velocity_total_spend = spend

    # 3. Companies pay wages back to citizens (out of recent revenue)
    co_revenue_share = lambda pool: pool * p.company_wage_pct
    wages = co_revenue_share(s.s_large_co) + co_revenue_share(s.s_mid_co) + co_revenue_share(s.s_small_co)
    f.wages_paid = wages
    s.s_large_co -= s.s_large_co * p.company_wage_pct
    s.s_mid_co   -= s.s_mid_co   * p.company_wage_pct
    s.s_small_co -= s.s_small_co * p.company_wage_pct
    s.s_citizens += wages

    # 4. Companies pay MCC bill (S-tax)
    bills = (s.s_large_co + s.s_mid_co + s.s_small_co) * p.company_mcc_bill_pct
    f.mcc_bills = bills
    s.s_large_co -= s.s_large_co * p.company_mcc_bill_pct
    s.s_mid_co   -= s.s_mid_co   * p.company_mcc_bill_pct
    s.s_small_co -= s.s_small_co * p.company_mcc_bill_pct
    s.s_mcc += bills

    # 5. Companies save S → V (locks S, mints V on Fisc books)
    co_save = (s.s_large_co + s.s_mid_co + s.s_small_co) * p.company_v_save_pct
    f.s_to_v_companies = co_save
    s.s_large_co -= s.s_large_co * p.company_v_save_pct
    s.s_mid_co   -= s.s_mid_co   * p.company_v_save_pct
    s.s_small_co -= s.s_small_co * p.company_v_save_pct
    s.v_companies += co_save  # V issued 1:1 with locked S (simplification)

    # 6. Citizens save S → V
    cit_save = s.s_citizens * p.citizen_save_rate
    f.s_to_v_citizens = cit_save
    s.s_citizens -= cit_save
    s.v_citizens += cit_save

    # 7. Citizen cashouts — V → USDC at current Fisc rate
    cashout_v = s.v_citizens * p.citizen_cashout_rate * p.citizen_cashout_size
    cashout_usd = cashout_v * s.fisc_rate
    f.cashouts_v = cashout_v
    f.cashouts_usd = cashout_usd
    s.v_citizens -= cashout_v
    # USDC goes out — but cap at reserve (Fisc can't pay more than it has)
    actual_usd_paid = min(cashout_usd, s.usdc_reserve)
    s.usdc_reserve -= actual_usd_paid
    # If cap hit, the V holders are in trouble. We don't re-credit them in this
    # simple model; in reality they'd queue or take a haircut. The reserve
    # ratio dropping triggers Fisc rate compression on the next step.

    # 8. Exporter USD inflow → deposit at Fisc → S minted at current rate
    export_usd = p.n_large_companies * p.export_usd_per_large_co_per_month
    f.export_usd_in = export_usd
    s.usdc_reserve += export_usd
    if s.fisc_rate > 0:
        s_minted_for_exporters = export_usd / s.fisc_rate
    else:
        s_minted_for_exporters = 0
    f.export_s_minted_via_fisc = s_minted_for_exporters
    s.s_large_co += s_minted_for_exporters

    # 9. LAT — voluntary tax on large companies' USD revenue, top-up UBI fund
    lat_usd = export_usd * p.lat_participation * p.lat_rate_on_revenue
    f.lat_usd_in = lat_usd
    s.usdc_reserve += lat_usd  # joins reserve; in reality, MCC could deploy it
    # In this simple model, LAT just strengthens reserve. Could also feed back
    # to UBI top-up — left for stress-test variant.

    # 10. Company dividends — V dividend to citizen shareholders
    divs = s.v_companies * p.company_dividend_pct
    f.dividends_paid = divs
    s.v_companies -= divs
    s.v_citizens += divs

    # 11. MCC consumes some collected S on services (simplification: it vanishes)
    consumed = s.s_mcc * p.mcc_consumes_pct
    f.mcc_consumed = consumed
    s.s_mcc -= consumed

    # 12. Update Fisc rate based on new reserve ratio
    s.fisc_rate = update_fisc_rate(s, p)

    return s, f


# ── Driver ─────────────────────────────────────────────────────────────────────

def simulate(p: Params) -> tuple[list[State], list[MonthlyFlows]]:
    initial = State(
        month=0,
        usdc_reserve=p.initial_usdc_reserve,
        fisc_rate=p.target_fisc_rate,
    )
    states = [initial]
    flows: list[MonthlyFlows] = []
    for _ in range(p.months):
        s, f = step(states[-1], p)
        states.append(s)
        flows.append(f)
    return states, flows


# ── Output ─────────────────────────────────────────────────────────────────────

OUT = Path(__file__).parent / "results"
OUT.mkdir(exist_ok=True)

def write_csvs(states: list[State], flows: list[MonthlyFlows]) -> None:
    # State table — one row per month including month 0
    with open(OUT / "monthly_state.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "month", "s_supply", "v_supply", "usdc_reserve", "fisc_rate",
            "reserve_ratio", "s_citizens", "s_companies", "s_mcc",
            "v_citizens", "v_companies", "velocity",
        ])
        for s in states:
            w.writerow([
                s.month, round(s.s_supply, 2), round(s.v_supply, 2),
                round(s.usdc_reserve, 2), round(s.fisc_rate, 4),
                round(s.reserve_ratio, 4) if s.v_supply > 0 else "",
                round(s.s_citizens, 2),
                round(s.s_large_co + s.s_mid_co + s.s_small_co, 2),
                round(s.s_mcc, 2),
                round(s.v_citizens, 2), round(s.v_companies, 2),
                round(s.velocity, 4),
            ])
    # Flows
    with open(OUT / "monthly_flows.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "month", "ubi_minted", "citizen_spend", "wages_paid", "mcc_bills",
            "s_to_v_citizens", "s_to_v_companies", "cashouts_v", "cashouts_usd",
            "export_usd_in", "export_s_minted_via_fisc", "lat_usd_in",
            "mcc_consumed", "dividends_paid",
        ])
        for fl in flows:
            w.writerow([
                fl.month, round(fl.ubi_minted, 2), round(fl.citizen_spend, 2),
                round(fl.wages_paid, 2), round(fl.mcc_bills, 2),
                round(fl.s_to_v_citizens, 2), round(fl.s_to_v_companies, 2),
                round(fl.cashouts_v, 2), round(fl.cashouts_usd, 2),
                round(fl.export_usd_in, 2), round(fl.export_s_minted_via_fisc, 2),
                round(fl.lat_usd_in, 2), round(fl.mcc_consumed, 2),
                round(fl.dividends_paid, 2),
            ])


def make_charts(states: list[State]) -> None:
    months = [s.month for s in states]
    s_supply = [s.s_supply for s in states]
    v_supply = [s.v_supply for s in states]
    usdc = [s.usdc_reserve for s in states]
    fisc_rate = [s.fisc_rate for s in states]
    reserve_ratio = [s.reserve_ratio if s.v_supply > 0 else 0 for s in states]
    s_cit = [s.s_citizens for s in states]
    s_co  = [s.s_large_co + s.s_mid_co + s.s_small_co for s in states]
    s_mcc = [s.s_mcc for s in states]

    # Chart 1: Token supply over time
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.plot(months, s_supply, label="S supply", color="#B8860B", linewidth=2)
    ax.plot(months, v_supply, label="V supply", color="#8b5cf6", linewidth=2)
    ax.set_xlabel("Month")
    ax.set_ylabel("Tokens (S / V)")
    ax.set_title("Token supply over 24 months")
    ax.legend(loc="upper left")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(OUT / "supply.png", dpi=120)
    plt.close(fig)

    # Chart 2: USDC reserve + Fisc rate
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)
    ax1.plot(months, usdc, color="#16a34a", linewidth=2)
    ax1.set_ylabel("USDC reserve ($)")
    ax1.set_title("Fisc reserve and rate")
    ax1.grid(True, alpha=0.3)
    ax2.plot(months, fisc_rate, color="#3b82f6", linewidth=2)
    ax2.axhline(1.0, color="#aaa", linestyle="--", linewidth=1)
    ax2.set_ylabel("Fisc rate ($/S)")
    ax2.set_xlabel("Month")
    ax2.set_ylim(0, 1.2)
    ax2.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(OUT / "fisc.png", dpi=120)
    plt.close(fig)

    # Chart 3: Reserve cover ratio vs target
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.plot(months, reserve_ratio, color="#16a34a", linewidth=2, label="Cover ratio")
    ax.axhline(0.30, color="#3b82f6", linestyle="--", linewidth=1, label="Target (30%)")
    ax.axhline(0.10, color="#ef4444", linestyle="--", linewidth=1, label="Floor (10%)")
    ax.set_xlabel("Month")
    ax.set_ylabel("USDC / V_supply")
    ax.set_title("Reserve cover ratio")
    ax.legend(loc="upper right")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(OUT / "cover.png", dpi=120)
    plt.close(fig)

    # Chart 4: Where the S sits — citizens vs companies vs MCC
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.stackplot(months, s_cit, s_co, s_mcc,
                 labels=["Citizens", "Companies", "MCC"],
                 colors=["#B8860B", "#3b82f6", "#aaa"])
    ax.set_xlabel("Month")
    ax.set_ylabel("S held")
    ax.set_title("S distribution across the colony")
    ax.legend(loc="upper left")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    fig.savefig(OUT / "distribution.png", dpi=120)
    plt.close(fig)


# ── Diagnostic summary ────────────────────────────────────────────────────────

def summarise(states: list[State], flows: list[MonthlyFlows], p: Params) -> dict:
    end = states[-1]
    total_export_usd = sum(f.export_usd_in for f in flows)
    total_cashout_usd = sum(f.cashouts_usd for f in flows)
    total_lat_usd = sum(f.lat_usd_in for f in flows)
    total_ubi = sum(f.ubi_minted for f in flows)

    # When did Fisc rate first dip below target?
    rate_break_month = next(
        (s.month for s in states if s.fisc_rate < p.target_fisc_rate * 0.99),
        None,
    )
    # When did reserve hit floor?
    floor_break_month = next(
        (s.month for s in states if s.reserve_ratio < p.reserve_floor_ratio and s.v_supply > 0),
        None,
    )

    return {
        "months_simulated":       p.months,
        "end_s_supply":           round(end.s_supply, 0),
        "end_v_supply":           round(end.v_supply, 0),
        "end_usdc_reserve":       round(end.usdc_reserve, 0),
        "end_fisc_rate":          round(end.fisc_rate, 4),
        "end_reserve_ratio":      round(end.reserve_ratio, 4) if end.v_supply > 0 else None,
        "total_ubi_minted":       round(total_ubi, 0),
        "total_export_usd":       round(total_export_usd, 0),
        "total_cashout_usd":      round(total_cashout_usd, 0),
        "total_lat_usd":          round(total_lat_usd, 0),
        "net_usd_inflow":         round(total_export_usd + total_lat_usd - total_cashout_usd, 0),
        "rate_first_dip_month":   rate_break_month,
        "reserve_floor_breach":   floor_break_month,
    }


# ── Main ───────────────────────────────────────────────────────────────────────

SCENARIOS = {
    "healthy_exporter": Params(
        # Strong export base, broad LAT participation, low cashout pressure
        export_usd_per_large_co_per_month = 8_000.0,
        lat_participation                  = 0.80,
        citizen_cashout_rate               = 0.01,
    ),
    "balanced": Params(),  # default — moderate exports, moderate cashouts
    "net_importer": Params(
        # Few exporters, low LAT, citizens losing faith and cashing out fast
        n_large_companies                  = 1,
        export_usd_per_large_co_per_month  = 1_500.0,
        lat_participation                  = 0.20,
        citizen_cashout_rate               = 0.05,
        citizen_cashout_size               = 0.50,
        initial_usdc_reserve               = 30_000.0,
    ),
}


def make_comparison_charts(scenarios: dict) -> None:
    """Overlay charts so all scenarios appear on the same axes for comparison."""
    metrics = [
        ("USDC reserve ($)",  lambda s: s.usdc_reserve,                    "reserve_compare.png"),
        ("Fisc rate ($/S)",   lambda s: s.fisc_rate,                       "rate_compare.png"),
        ("Reserve cover ratio", lambda s: s.reserve_ratio if s.v_supply > 0 else 0, "cover_compare.png"),
        ("S supply",          lambda s: s.s_supply,                        "supply_compare.png"),
    ]
    colours = {"healthy_exporter": "#16a34a", "balanced": "#3b82f6", "net_importer": "#ef4444"}
    for ylabel, accessor, fname in metrics:
        fig, ax = plt.subplots(figsize=(8, 4.5))
        for name, states in scenarios.items():
            ax.plot([s.month for s in states], [accessor(s) for s in states],
                    label=name.replace("_", " "), color=colours[name], linewidth=2)
        ax.set_xlabel("Month")
        ax.set_ylabel(ylabel)
        ax.set_title(f"{ylabel} - scenario comparison")
        ax.legend(loc="best")
        ax.grid(True, alpha=0.3)
        if "rate" in fname:
            ax.set_ylim(0, 1.2)
        if "cover" in fname:
            ax.axhline(0.30, color="#888", linestyle="--", linewidth=1, alpha=0.6)
            ax.axhline(0.10, color="#aaa", linestyle="--", linewidth=1, alpha=0.6)
        fig.tight_layout()
        fig.savefig(OUT / fname, dpi=120)
        plt.close(fig)


if __name__ == "__main__":
    print("-" * 64)
    print("SPICE Earth-colony 24-month simulation - 3 scenarios")
    print("-" * 64)

    summaries = {}
    all_states = {}
    saved_OUT = OUT

    for name, p in SCENARIOS.items():
        states, flows = simulate(p)
        all_states[name] = states
        sub = saved_OUT / name
        sub.mkdir(exist_ok=True)
        # write per-scenario outputs into subfolder
        globals()["OUT"] = sub
        write_csvs(states, flows)
        make_charts(states)
        globals()["OUT"] = saved_OUT
        summaries[name] = summarise(states, flows, p)

    # Overlay comparison charts at the top level
    make_comparison_charts(all_states)

    # Print side-by-side summary table
    keys = list(next(iter(summaries.values())).keys())
    width = max(len(k) for k in keys)
    header = f"  {'metric':<{width}}  " + "  ".join(f"{n:>17}" for n in summaries)
    print(header)
    print("  " + "-" * (len(header) - 2))
    for k in keys:
        row = f"  {k:<{width}}  " + "  ".join(f"{str(s[k]):>17}" for s in summaries.values())
        print(row)
    print("-" * 64)
    print(f"  Per-scenario outputs in: {OUT}/<scenario>/")
    print(f"  Comparison charts in:    {OUT}/")
