#!/usr/bin/env python3
"""Recalibrate external_companies.csv with research-backed revenue figures.

Sector totals (target) calibrated against BLS Consumer Expenditure 2024 +
public per-store / per-HH benchmarks for a 39k-person town. See research
synthesis in the conversation history.
"""
import sys
import csv

sys.path.insert(0, 'docs/economy-model/maryfontaine')
from external_suppliers import EXTERNAL_SUPPLIERS

# Per-company revenue from a 39k-person town (USD/year)
REV_USD = {
    # Big retail
    "Walmart":                       100_000_000,
    "Costco":                         25_000_000,
    "Target":                         50_000_000,
    "Kroger":                         70_000_000,
    "HomeDepot":                      50_000_000,
    "Lowe's":                         35_000_000,
    "Best Buy":                       20_000_000,
    "CVS Pharmacy":                   20_000_000,
    "Walgreens":                      15_000_000,
    # Restaurants
    "McDonald's":                     12_000_000,
    "Chipotle":                        3_000_000,
    "Starbucks":                       3_600_000,
    "Subway":                          1_500_000,
    "Wendy's":                         4_000_000,
    "Cracker Barrel":                  4_000_000,
    # Big tech consumer
    "Apple":                          12_000_000,
    "Microsoft":                       3_000_000,
    "Google":                          1_000_000,
    "Meta":                              500_000,
    "Amazon":                         35_000_000,
    "NVIDIA":                            500_000,
    # AI software
    "OpenAI":                          1_000_000,
    "Anthropic":                         600_000,
    "Palantir":                           50_000,
    "DataBricks":                         50_000,
    "AutomatedSaaSCo":                    50_000,
    "CursorAI":                          300_000,
    "AIInfraCloud":                       50_000,
    # Pharma
    "Pfizer":                         20_000_000,
    "Merck":                          15_000_000,
    "Johnson & Johnson":              10_000_000,
    "Eli Lilly":                       7_000_000,
    "AbbVie":                          5_000_000,
    # Financial
    "JPMorgan Chase":                 20_000_000,
    "Goldman Sachs":                   4_000_000,
    "Bank of America":                15_000_000,
    "Wells Fargo":                    10_000_000,
    "Charles Schwab":                  3_000_000,
    "Visa":                            5_000_000,
    "Mastercard":                      3_000_000,
    "RegionalBankOH":                  5_000_000,
    # Automated mfg
    "Tesla":                           8_000_000,
    "FoxconnUS":                       1_000_000,
    "Siemens Industrial":              2_000_000,
    "RoboticsCorp":                    1_000_000,
    # Auto OEMs
    "Honda Motor Co":                 25_000_000,
    "Ford":                           20_000_000,
    "General Motors":                 20_000_000,
    "Toyota North America":           15_000_000,
    "Stellantis":                     10_000_000,
    # Traditional mfg
    "Caterpillar":                       500_000,
    "Deere & Company":                   500_000,
    "OhioFabricationCo":               1_000_000,
    "MidwestSteelWorks":               1_500_000,
    # Healthcare
    "HCA Healthcare":                 30_000_000,
    "OhioHealth":                     25_000_000,
    "ClevelandClinic":                20_000_000,
    "AnthemBlue":                     20_000_000,
    "UnitedHealth":                   30_000_000,
    "CVS Caremark":                   15_000_000,
    # Construction
    "D.R. Horton":                     2_000_000,
    "Lennar":                          2_000_000,
    "OhioBuildersAssoc":               5_000_000,
    "MidwestRoofingCo":                  800_000,
    # Hospitality
    "Marriott International":          1_500_000,
    "Hilton":                          1_500_000,
    "Airbnb":                            800_000,
    "OhioStateInn":                      200_000,
    # Logistics
    "UPS":                             5_000_000,
    "FedEx":                           5_000_000,
    "XPO Logistics":                   3_000_000,
    "Uber":                            4_000_000,
    "Lyft":                            1_000_000,
    "OhioTrucking":                    2_000_000,
    # Utilities
    "AEP Ohio":                       20_000_000,
    "Duke Energy":                     5_000_000,
    "Columbia Gas":                   14_000_000,
    "Verizon":                        10_000_000,
    "AT&T":                           10_000_000,
    "Comcast":                        15_000_000,
    # Media
    "Netflix":                         2_500_000,
    "Disney":                          1_500_000,
    "Spotify":                         1_000_000,
    # Energy
    "ExxonMobil":                     12_000_000,
    "Chevron":                        10_000_000,
    "Marathon Petroleum":             11_000_000,
    # Insurance
    "State Farm":                     25_000_000,
    "Allstate":                       15_000_000,
    "Progressive":                    15_000_000,
    "Nationwide":                     15_000_000,
    # Education
    "Coursera":                          500_000,
    "OnlineUniversityCo":                500_000,
    # Agriculture
    "ADM (Archer Daniels Midland)":      500_000,
    "Cargill":                         1_000_000,
    "OhioFarmersUnion":                  500_000,
    # Telecom equipment
    "Cisco":                             100_000,
    "Qualcomm":                          100_000,
    # Software
    "Salesforce":                        300_000,
    "Oracle":                            300_000,
    "Adobe":                           1_200_000,
    "Intuit":                          1_200_000,
    # Defence
    "Lockheed Martin":                    50_000,
    "RTX Corp":                           50_000,
    # Gov
    "FederalServicesCo":                 500_000,
    "StateOfOhio":                     8_000_000,
}


def main():
    rows = sorted(
        EXTERNAL_SUPPLIERS,
        key=lambda r: (r[1], -REV_USD.get(r[0], r[4])),
    )

    out = 'docs/economy-model/mpc_spreadsheet/external_companies.csv'
    with open(out, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow([
            'name', 'sector', 'employees',
            'annual_profit_per_emp_usd', 'annual_profit_total_usd',
            'annual_rev_to_maryfontaine_usd',
            'maryfontaine_share_of_firm_profit_pct',
        ])
        total = 0
        for name, sector, p_per_emp, n_emp, _old in rows:
            new_rev = REV_USD.get(name, _old)
            total += new_rev
            profit = p_per_emp * n_emp
            w.writerow([name, sector, n_emp, p_per_emp, profit, new_rev, ''])

    print(f"Total revenue to Maryfontaine: ${total:,}")
    print(f"BLS HH ceiling (15k × $78,535): $1,178,000,000")
    headroom = 1_178_000_000 - total
    print(f"Headroom (independents/taxes):  ${headroom:,} "
          f"({headroom / 1_178_000_000 * 100:.0f}%)")


if __name__ == '__main__':
    main()
