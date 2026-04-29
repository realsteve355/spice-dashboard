# SPICE Earth-colony economic model

Deterministic 24-month simulation of an Earth colony, used to back the
results section in `docs/SPICE-Economy.md` (Part 4).

## Run

```
cd docs/economy-model
python model.py
```

Requires Python 3 with `pandas` and `matplotlib` installed.

## Output

```
results/
  reserve_compare.png    overlay across scenarios
  rate_compare.png
  cover_compare.png
  supply_compare.png
  healthy_exporter/      per-scenario detail
    monthly_state.csv
    monthly_flows.csv
    supply.png
    fisc.png
    cover.png
    distribution.png
  balanced/
  net_importer/
```

## Scenarios

Three scenarios are baked in. They share all citizen and company
behaviour parameters; only the external trade position differs.

| Scenario | Exporters | $/exporter/mo | LAT % | Cashout % |
|---|---|---|---|---|
| `healthy_exporter` | 5 | $8,000 | 80% | 1% |
| `balanced` | 5 | $5,000 | 60% | 2% |
| `net_importer` | 1 | $1,500 | 20% | 5% |

## Customising

Edit the `Params` dataclass at the top of `model.py` to change defaults,
or add a new scenario to the `SCENARIOS` dict near the bottom.

## Caveats

- Deterministic — no shock or stochastic behaviour
- Citizen / company parameters are defensible defaults, not measured
- MCC operations simplified (consumed S not re-circulated as wages)
- Inter-company supply chains and A-token flows not yet modelled
