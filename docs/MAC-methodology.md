# MAC — Methodology Note

*Captured 29 Jun 2026. The definition below is the agreed basis for the
explainer page. Items marked **OPEN** are not yet decided.*

---

## What the MAC is

The **Market Access Charge (MAC)** is a charge **added to every transaction**
that takes place with people inside the **area** (the colony / county). A company
pays it for access to the area's market.

It funds the area's **basic income (UBI)**: the total MAC collected in the area is
set, by design, to equal the total UBI paid in the area.

## The per-transaction charge

For a single transaction:

> **MAC = k × transaction value × (profit ÷ employees)**

- **transaction value** — the value of that transaction.
- **profit ÷ employees** — the **selling company's** profit-per-employee, taken
  from its **declared accounts**.
- **k** — a single number for the whole area (see below).

The **profit ÷ employees** term is the dial: it loads the charge onto the
companies making the most profit with the fewest people — the most automated —
and leaves labour-heavy, thin-margin companies paying little.

## Solving for k

A company's transactions add up to its revenue in the area, so its total charge is:

> company MAC = k × (its revenue) × (its profit ÷ its employees)

Add up every company and set the total equal to the area's UBI:

> Total MAC = k × Σ( revenue × profit ÷ employees ) = **UBI**
>
> **k = UBI ÷ Σ( revenue × profit ÷ employees )**

k is whatever value makes the area's MAC equal the area's UBI.

## Cadence — quarterly

The calculation **runs each quarter**, on the latest declared figures:

1. Take this quarter's company revenues, declared profits and employee counts.
2. Set **k = (this quarter's area UBI) ÷ Σ( revenue × profit ÷ employees )**.
3. Charge the MAC on the quarter's transactions.
4. Re-run next quarter on the new numbers.

**Profit ÷ employees** is smoothed over a trailing four quarters (profit can be
lumpy/seasonal); **revenue** and **UBI** are the live quarterly figures.

## Why there is no circularity to solve

Profit is a **given input** — a declared figure from the accounts, not an unknown
to be solved for. So k is a single, clean division each quarter; there is no
simultaneous equation.

The MAC is a cost, so it does reduce profit — but that shows up in the **next**
quarter's declared profit, where it is simply read off and used again. The whole
thing is therefore a **quarter-by-quarter adjustment**, not a loop inside one
calculation. The only thing to watch is that the sequence **settles** over time
rather than swinging — a convergence question, far more tractable than a circular
equation.

## No cap

There is **no cap** on the MAC. It stands in for the wage bill that automation
removes, and wages were never capped at profit.

## Open questions

- **OPEN — who bears it at the till.** When the MAC is added to a transaction,
  does the **buyer** pay it on top (raising prices → the basket costs more → the
  UBI rises → another loop), or does the **seller** absorb it out of the
  transaction (no price effect)? Not yet decided.
- **OPEN — convergence.** Does the quarter-by-quarter sequence settle to a steady
  state, and how fast?
- **OPEN — k's behaviour.** Whether k stays a simple scalar or needs to be
  non-linear in some regimes.

## Notes / retired terms

- The charge applies to **every company doing business in the area** — there is no
  "consumer sector" subset.
- The MAC is **not** a percentage of profit, and it is **not** profit-squared.
  Profit enters once, only through the profit-per-employee dial; the base it sits
  on is the transaction value (revenue).
