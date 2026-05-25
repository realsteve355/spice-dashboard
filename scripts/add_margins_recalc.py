#!/usr/bin/env python3
"""Add gross_margin_pct column to external_companies.csv, then recompute
MPC under the value-added (margin-based) version of automation-graduated MPC.

Formula:
    MPC = (revenue × gross_margin_pct) × k × (P/emp / $100,000)

The gross margin shrinks the tax base from total revenue to value-added,
naturally handling pass-through (a retailer's COGS flows to upstream
suppliers, who pay their own MPC on their own revenue).
"""
import csv
import sys

sys.path.insert(0, 'docs/economy-model/maryfontaine')
from external_suppliers import EXTERNAL_SUPPLIERS

# Gross margin % per company — from 10-K / public filings (FY24 approx)
MARGIN_PCT = {
    # Big retail (low margins)
    "Walmart":                       25, "Costco":                         13,
    "Target":                        28, "Kroger":                         22,
    "HomeDepot":                     33, "Lowe's":                         33,
    "Best Buy":                      23, "CVS Pharmacy":                   19,
    "Walgreens":                     22,
    # Restaurants
    "McDonald's":                    57, "Chipotle":                       25,
    "Starbucks":                     30, "Subway":                         25,
    "Wendy's":                       30, "Cracker Barrel":                 33,
    # Big tech (very high)
    "Apple":                         46, "Microsoft":                      70,
    "Google":                        56, "Meta":                           81,
    "Amazon":                        48, "NVIDIA":                         75,
    # AI software (mostly pre-profit; gross margins high)
    "OpenAI":                        50, "Anthropic":                      50,
    "Palantir":                      80, "DataBricks":                     75,
    "AutomatedSaaSCo":               75, "CursorAI":                       75,
    "AIInfraCloud":                  75,
    # Pharma
    "Pfizer":                        65, "Merck":                          73,
    "Johnson & Johnson":             67, "Eli Lilly":                      79,
    "AbbVie":                        70,
    # Financial
    "JPMorgan Chase":                50, "Goldman Sachs":                  80,
    "Bank of America":               55, "Wells Fargo":                    55,
    "Charles Schwab":                70, "Visa":                           80,
    "Mastercard":                    78, "RegionalBankOH":                 45,
    # Automated mfg
    "Tesla":                         25, "FoxconnUS":                       7,
    "Siemens Industrial":            35, "RoboticsCorp":                   40,
    # Auto OEMs
    "Honda Motor Co":                22, "Ford":                           18,
    "General Motors":                19, "Toyota North America":           22,
    "Stellantis":                    22,
    # Traditional mfg
    "Caterpillar":                   33, "Deere & Company":                35,
    "OhioFabricationCo":             20, "MidwestSteelWorks":              20,
    # Healthcare providers & insurance
    "HCA Healthcare":                50, "OhioHealth":                     50,
    "ClevelandClinic":               50, "AnthemBlue":                     25,
    "UnitedHealth":                  30, "CVS Caremark":                   18,
    # Construction
    "D.R. Horton":                   27, "Lennar":                         25,
    "OhioBuildersAssoc":             22, "MidwestRoofingCo":               30,
    # Hospitality
    "Marriott International":        25, "Hilton":                         27,
    "Airbnb":                        80, "OhioStateInn":                   30,
    # Logistics
    "UPS":                           22, "FedEx":                          22,
    "XPO Logistics":                 17, "Uber":                           35,
    "Lyft":                          30, "OhioTrucking":                   18,
    # Utilities
    "AEP Ohio":                      35, "Duke Energy":                    40,
    "Columbia Gas":                  35, "Verizon":                        60,
    "AT&T":                          55, "Comcast":                        65,
    # Media
    "Netflix":                       42, "Disney":                         35,
    "Spotify":                       28,
    # Energy
    "ExxonMobil":                    35, "Chevron":                        35,
    "Marathon Petroleum":            12,
    # Insurance
    "State Farm":                    25, "Allstate":                       22,
    "Progressive":                   18, "Nationwide":                     25,
    # Education
    "Coursera":                      60, "OnlineUniversityCo":             55,
    # Agriculture (commodity, low margin)
    "ADM (Archer Daniels Midland)":   8, "Cargill":                         7,
    "OhioFarmersUnion":              12,
    # Telecom equipment
    "Cisco":                         64, "Qualcomm":                       56,
    # Software
    "Salesforce":                    75, "Oracle":                         72,
    "Adobe":                         88, "Intuit":                         80,
    # Defence
    "Lockheed Martin":               11, "RTX Corp":                       17,
    # Government
    "FederalServicesCo":             12, "StateOfOhio":                    20,
}

# Per-company revenue (carry over from previous recalibration)
REV_USD = {
    "Walmart":          100_000_000, "Costco":            25_000_000,
    "Target":            50_000_000, "Kroger":            70_000_000,
    "HomeDepot":         50_000_000, "Lowe's":            35_000_000,
    "Best Buy":          20_000_000, "CVS Pharmacy":      20_000_000,
    "Walgreens":         15_000_000,
    "McDonald's":        12_000_000, "Chipotle":           3_000_000,
    "Starbucks":          3_600_000, "Subway":             1_500_000,
    "Wendy's":            4_000_000, "Cracker Barrel":     4_000_000,
    "Apple":             12_000_000, "Microsoft":          3_000_000,
    "Google":             1_000_000, "Meta":                 500_000,
    "Amazon":            35_000_000, "NVIDIA":               500_000,
    "OpenAI":             1_000_000, "Anthropic":            600_000,
    "Palantir":              50_000, "DataBricks":            50_000,
    "AutomatedSaaSCo":       50_000, "CursorAI":             300_000,
    "AIInfraCloud":          50_000,
    "Pfizer":            20_000_000, "Merck":             15_000_000,
    "Johnson & Johnson": 10_000_000, "Eli Lilly":          7_000_000,
    "AbbVie":             5_000_000,
    "JPMorgan Chase":    20_000_000, "Goldman Sachs":      4_000_000,
    "Bank of America":   15_000_000, "Wells Fargo":       10_000_000,
    "Charles Schwab":     3_000_000, "Visa":               5_000_000,
    "Mastercard":         3_000_000, "RegionalBankOH":     5_000_000,
    "Tesla":              8_000_000, "FoxconnUS":          1_000_000,
    "Siemens Industrial": 2_000_000, "RoboticsCorp":       1_000_000,
    "Honda Motor Co":    25_000_000, "Ford":              20_000_000,
    "General Motors":    20_000_000, "Toyota North America": 15_000_000,
    "Stellantis":        10_000_000,
    "Caterpillar":          500_000, "Deere & Company":      500_000,
    "OhioFabricationCo":  1_000_000, "MidwestSteelWorks":  1_500_000,
    "HCA Healthcare":    30_000_000, "OhioHealth":        25_000_000,
    "ClevelandClinic":   20_000_000, "AnthemBlue":        20_000_000,
    "UnitedHealth":      30_000_000, "CVS Caremark":      15_000_000,
    "D.R. Horton":        2_000_000, "Lennar":             2_000_000,
    "OhioBuildersAssoc":  5_000_000, "MidwestRoofingCo":     800_000,
    "Marriott International": 1_500_000, "Hilton":         1_500_000,
    "Airbnb":               800_000, "OhioStateInn":         200_000,
    "UPS":                5_000_000, "FedEx":              5_000_000,
    "XPO Logistics":      3_000_000, "Uber":               4_000_000,
    "Lyft":               1_000_000, "OhioTrucking":       2_000_000,
    "AEP Ohio":          20_000_000, "Duke Energy":        5_000_000,
    "Columbia Gas":      14_000_000, "Verizon":           10_000_000,
    "AT&T":              10_000_000, "Comcast":           15_000_000,
    "Netflix":            2_500_000, "Disney":             1_500_000,
    "Spotify":            1_000_000,
    "ExxonMobil":        12_000_000, "Chevron":           10_000_000,
    "Marathon Petroleum":11_000_000,
    "State Farm":        25_000_000, "Allstate":          15_000_000,
    "Progressive":       15_000_000, "Nationwide":        15_000_000,
    "Coursera":             500_000, "OnlineUniversityCo":   500_000,
    "ADM (Archer Daniels Midland)": 500_000, "Cargill": 1_000_000,
    "OhioFarmersUnion":     500_000,
    "Cisco":                100_000, "Qualcomm":             100_000,
    "Salesforce":           300_000, "Oracle":               300_000,
    "Adobe":              1_200_000, "Intuit":             1_200_000,
    "Lockheed Martin":       50_000, "RTX Corp":              50_000,
    "FederalServicesCo":    500_000, "StateOfOhio":        8_000_000,
}

UBI_TARGET = 529_200_000


def main():
    # Build enriched rows
    enriched = []
    for name, sector, p_per_emp, n_emp, _old in EXTERNAL_SUPPLIERS:
        rev = REV_USD.get(name, _old)
        margin = MARGIN_PCT.get(name, 30)  # default 30% if missing
        enriched.append({
            'name': name, 'sector': sector, 'p_per_emp': p_per_emp,
            'employees': n_emp, 'rev': rev, 'margin_pct': margin,
        })

    total_rev = sum(d['rev'] for d in enriched)
    total_value_added = sum(d['rev'] * d['margin_pct'] / 100 for d in enriched)

    # Solve for k: sum(value_added * k * P_per_emp / 100000) = UBI_TARGET
    sum_weighted = sum(
        (d['rev'] * d['margin_pct'] / 100) * d['p_per_emp'] / 100_000
        for d in enriched
    )
    k = UBI_TARGET / sum_weighted

    print(f"Total external revenue (gross):       ${total_rev:>14,}")
    print(f"Total value-added (rev x margin):     ${total_value_added:>14,.0f}")
    print(f"  -- avg gross margin:                {total_value_added/total_rev*100:.1f}%")
    print(f"UBI target:                           ${UBI_TARGET:>14,}")
    print(f"Calibrated k (margin-based):          {k:.4f}")
    print()

    # ── Write enriched external_companies.csv ──
    rows_sorted = sorted(enriched, key=lambda d: (d['sector'], -d['rev']))
    with open('docs/economy-model/mpc_spreadsheet/external_companies.csv', 'w',
              encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow([
            'name', 'sector', 'employees',
            'annual_profit_per_emp_usd', 'annual_profit_total_usd',
            'annual_rev_to_maryfontaine_usd',
            'gross_margin_pct',
            'value_added_usd',
        ])
        for d in rows_sorted:
            va = d['rev'] * d['margin_pct'] / 100
            w.writerow([
                d['name'], d['sector'], d['employees'],
                d['p_per_emp'], d['p_per_emp'] * d['employees'],
                d['rev'], d['margin_pct'], round(va, 0),
            ])

    # ── Write mpc_calc_per_company.csv ──
    rows_by_pe = sorted(enriched, key=lambda d: -d['p_per_emp'])
    with open('docs/economy-model/mpc_spreadsheet/mpc_calc_per_company.csv', 'w',
              encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow([
            'name', 'sector', 'employees', 'profit_per_emp_usd',
            'annual_rev_to_maryfontaine_usd', 'gross_margin_pct',
            'value_added_usd',
            'mpc_rate_pct', 'annual_mpc_usd',
        ])
        total_mpc = 0
        for d in rows_by_pe:
            va = d['rev'] * d['margin_pct'] / 100
            rate = k * d['p_per_emp'] / 100_000
            mpc = va * rate
            total_mpc += mpc
            w.writerow([
                d['name'], d['sector'], d['employees'], d['p_per_emp'],
                d['rev'], d['margin_pct'], round(va, 0),
                round(rate * 100, 2), round(mpc, 0),
            ])

    # ── Rebuild sector rollup ──
    from collections import defaultdict
    by_sector = defaultdict(lambda: {
        'n_firms': 0, 'employees': 0, 'profit': 0, 'rev': 0,
        'value_added': 0, 'mpc': 0,
    })
    for d in enriched:
        s = d['sector']
        va = d['rev'] * d['margin_pct'] / 100
        rate = k * d['p_per_emp'] / 100_000
        by_sector[s]['n_firms']    += 1
        by_sector[s]['employees']  += d['employees']
        by_sector[s]['profit']     += d['p_per_emp'] * d['employees']
        by_sector[s]['rev']        += d['rev']
        by_sector[s]['value_added']+= va
        by_sector[s]['mpc']        += va * rate

    with open('docs/economy-model/mpc_spreadsheet/external_by_sector.csv', 'w',
              encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow([
            'sector', 'n_named_firms', 'sum_employees',
            'sum_firm_profit_usd', 'sum_rev_to_maryfontaine_usd',
            'avg_profit_per_emp_usd',
            'sum_value_added_usd', 'sum_mpc_usd',
        ])
        for s in sorted(by_sector, key=lambda x: -by_sector[x]['mpc']):
            d = by_sector[s]
            avg = d['profit'] / d['employees'] if d['employees'] > 0 else 0
            w.writerow([
                s, d['n_firms'], d['employees'],
                d['profit'], d['rev'], round(avg, 0),
                round(d['value_added'], 0), round(d['mpc'], 0),
            ])

    print(f"Total MPC collected: ${total_mpc:,.0f}  (target ${UBI_TARGET:,})")
    print()

    # ── Show Amazon + key comparators ──
    print("=" * 70)
    print("KEY COMPANIES — MPC under VALUE-ADDED scheme")
    print("=" * 70)
    print(f"  {'Company':<22} {'Rev':>13} {'Mrg':>5} {'VA':>13} {'Rate':>7} {'MPC':>13}")
    print(f"  {'-'*22} {'-'*13} {'-'*5} {'-'*13} {'-'*7} {'-'*13}")
    showcase = ['Walmart', 'Kroger', 'McDonald\'s', 'Honda Motor Co',
                'Amazon', 'JPMorgan Chase', 'UnitedHealth',
                'Pfizer', 'Apple', 'Microsoft', 'Visa', 'NVIDIA',
                'OpenAI']
    for name in showcase:
        d = next((x for x in enriched if x['name'] == name), None)
        if not d: continue
        va = d['rev'] * d['margin_pct'] / 100
        rate = k * d['p_per_emp'] / 100_000
        mpc = va * rate
        print(f"  {d['name']:<22} ${d['rev']:>12,} {d['margin_pct']:>4}% ${va:>12,.0f} {rate*100:>6.1f}% ${mpc:>12,.0f}")


if __name__ == '__main__':
    main()
