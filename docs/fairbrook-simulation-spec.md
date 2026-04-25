# Fairbrook Colony — Full Simulation Specification

**Based on:** Bellefontaine, Ohio (Logan County seat)
**Colony name:** Fairbrook, Ohio
**Colony type:** Earth (open economy)
**Real population:** ~14,100
**Simulation epoch:** 1 day (compressed from 1 month)
**Purpose:** Public demo — anyone can join, experience the full economic cycle in 24 hours

---

## 1. Real Economic Profile (Bellefontaine source data)

| Metric | Value | Source |
|--------|-------|--------|
| Population | 14,100 | Census 2024 |
| Median household income | $59,484 | Census 2024 |
| Per capita income | $33,374 | Census 2024 |
| Poverty rate | 18.1% | Census 2024 |
| Unemployment | 3.8% | Nov 2024 |
| Median home value | $201,508 | Census 2024 |
| Median gross rent | $903/month | Census 2024 |
| Cost of living index | 77.7 | (US avg = 100) |
| Total workforce | ~6,700 | DataUSA |
| Manufacturing workers | 1,842 (27%) | DataUSA |
| Retail workers | 760 (11%) | DataUSA |
| Food service workers | 730 (11%) | DataUSA |

**Key insight:** Bellefontaine is a low cost-of-living, manufacturing-heavy town with a
poverty rate well above the national average (18.1% vs 12.5%). This is exactly the
demographic the SPICE model is designed to serve.

---

## 2. Simulation Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Epoch length | 1 day | Compressed from 1 month |
| UBI per epoch | 35 S | Equivalent to ~$26/day at $0.75/S |
| Monthly equivalent | ~1,050 S (~$788) | Meaningful vs $903 median rent |
| Fisc rate | $0.75 / S | Starting rate |
| LAT collection | Daily sweep | Compressed from quarterly |
| Bread basket target | 5 S | ~$3.75 at starting rate |

**UBI rationale:** $788/month represents 13% of median household income — meaningful
supplemental income in a town with 18% poverty rate. At cost-of-living index 77.7,
$788 goes further in Fairbrook than in a coastal city.

---

## 3. Business Register

### 3a. National Chains — High LAT

These businesses use significant automation, displacing local workers. They are the
primary LAT revenue source. All operate as bot wallets in the simulation.

| Business | Type | Locations | Est. staff | Automation | LAT rate | Notes |
|----------|------|-----------|------------|------------|----------|-------|
| **Walmart Supercenter** | Grocery/retail | 1 (2281 US-68 S) | 300 | Very high — self-checkout (30+ units), AI inventory, automated distribution | 25% | Largest single employer + LAT payer |
| **Kroger** | Grocery/pharmacy | 1 (2129 S Main) | 120 | High — self-checkout, automated ordering, pharmacy robots | 18% | Has in-store pharmacy |
| **McDonald's** | Fast food | 2 (S Main + N Main) | 60 total | High — kiosks replaced cashiers, AI drive-through | 20% | 2 locations |
| **Lowe's** | Home improvement | 1 (2168 US-68 S) | 150 | High — self-checkout, inventory drones, AI pricing | 18% | Adjacent to Walmart |
| **Wendy's** | Fast food | 1 (700 S Main) | 25 | Medium — kiosks, AI ordering | 15% | |
| **Taco Bell** | Fast food | 1 (1500 S Main) | 20 | Medium-high — near-fully automated ordering | 18% | |
| **Fazoli's** | Fast food | 1 (529 S Main) | 20 | Medium | 12% | |
| **Tim Hortons** | Coffee/café | 1 | 15 | Low-medium | 10% | |
| **Dollar General** | Discount retail | 2+ | 20 | Medium — AI inventory, self-checkout rollout | 12% | Multiple small locations |
| **Dollar Tree** | Discount retail | 1 | 15 | Medium | 12% | |
| **Big Lots** | Discount retail | 1 | 40 | Low-medium | 10% | |
| **CVS** | Pharmacy/retail | 1 | 25 | High — automated prescription filling, kiosks | 18% | |
| **Walgreens** | Pharmacy/retail | 1 | 25 | High — automated pharmacy | 18% | |
| **Rite Aid** | Pharmacy | 1 | 20 | High | 16% | |
| **AutoZone** | Auto parts | 1 | 15 | Medium — AI parts lookup, inventory | 10% | |
| **Harbor Freight** | Tools | 1 | 20 | Low-medium | 8% | |
| **Dunham's Sports** | Sporting goods | 1 | 30 | Low-medium | 8% | |
| **Murphy USA** | Fuel/convenience | 1 | 8 | High — automated fuel, minimal staff | 20% | Adjacent to Walmart |
| **BP / Shell / Marathon** | Fuel | 3 | 6 each | High — automated fuel | 15% | Multiple sites |

### 3b. National Chains — Banking / Finance

Banks are significant LAT payers — AI has automated teller functions, loan processing,
fraud detection. Each employs far fewer staff than 20 years ago.

| Business | Type | Locations | LAT rate |
|----------|------|-----------|----------|
| **Chase** | Bank | 1 | 20% |
| **KeyBank** | Bank | 1 | 20% |
| **Fifth Third** | Bank | 1 | 20% |
| **Huntington** | Bank | 1 | 20% |
| **PNC** | Bank | 1 | 20% |

### 3c. National Services

| Business | Type | LAT rate | Notes |
|----------|------|----------|-------|
| **H&R Block** | Tax preparation | 15% | AI tax prep significantly reduced staff |
| **AT&T** | Telecom | 18% | Automated stores, AI customer service |
| **Verizon** | Telecom | 18% | |
| **T-Mobile** | Telecom | 18% | |
| **State Farm** (national) | Insurance | 12% | National AI underwriting |
| **Subway** | Fast food | 12% | AI ordering rollout |
| **Pizza Hut** | Fast food | 12% | |
| **Domino's** | Fast food | 15% | Heavily automated ordering + delivery routing AI |
| **Arby's** | Fast food | 12% | |
| **Burger King** | Fast food | 15% | Kiosk-heavy |
| **Dairy Queen** | Fast food | 10% | |
| **Bob Evans** | Restaurant | 8% | Less automated, more table service |

### 3d. Major Local Employers (Colony institutions)

These are Fairbrook's genuine local institutions. They employ citizens, pay wages in S,
and have low or zero LAT.

| Business | Type | Est. staff | LAT | Notes |
|----------|------|------------|-----|-------|
| **Mary Rutan Hospital** | Healthcare | 500+ | Low (8%) | Some diagnostic AI, but human-care focused. Major S-wage payer. |
| **Fairbrook City Schools** | Education | 400 | Zero | Public institution, human teachers |
| **Logan County Government** | Government | 200 | Zero | |
| **Ohio Hi-Point Career Center** | Education | 80 | Zero | Vocational college |
| **AcuSport** | Distribution | 150 | Medium (12%) | AI inventory/logistics |
| **Majestic Plastics** | Manufacturing | 54 | Medium (15%) | Plastic injection molding, some robotic lines |
| **PowerBuilt MHS** | Manufacturing | 30 | Medium (12%) | Custom lift equipment |

### 3e. Downtown Local Businesses (colony SMEs)

Small, human-run. Zero or near-zero LAT. S-economy participants.

| Business | Type | LAT | Notes |
|----------|------|-----|-------|
| **Carla's Coffee** | Café | Zero | Our persona — human-run |
| **Brewfontaine** | Craft brewery/bar | Zero | Award-winning local |
| **The Syndicate** | Restaurant | Zero | Locally sourced, full table service |
| **Roundhouse Depot Brewing** | Brewery/bar | Zero | |
| **The Marketplace** | Indoor market | Zero | 13 specialty shops |
| **The Olde Mint Antiques** | Antiques | Zero | 40+ vendors |
| **Four Acre Clothing Co.** | Boutique | Zero | |
| **Local pharmacy** | Independent pharmacy | Zero | Competes with CVS/Walgreens |
| **Local law firms** | Legal services | Low | Dave's firm |
| **Local realtors** | Real estate | Low | |
| **Fairbrook Farmers Market** | Market | Zero | Seasonal |

### 3f. Religious / Community

| Entity | Type | Notes |
|--------|------|-------|
| **St. Brendan's Parish** | Catholic church | Father Tomas — voluntary MCC donation |
| **First Presbyterian** | Church | |
| **Fairbrook Food Bank** | Non-profit | Receives donations in S |
| **Logan County YMCA** | Community | |

---

## 4. Citizen Roles (Simulation Sign-up Options)

When a user joins the Fairbrook simulation, they choose a role. The role determines:
- Employer (who sends them wages)
- Wage amount in S
- LAT relevance
- Economic narrative

| Role | Employer bot | Daily wage (S) | Total daily income | Story |
|------|-------------|----------------|-------------------|-------|
| **Walmart associate** | Walmart bot | 45 S | 80 S (+ UBI) | Works alongside the robots that displaced your colleagues |
| **Kroger cashier** | Kroger bot | 40 S | 75 S | One of the last human cashiers |
| **Nurse (Mary Rutan)** | Hospital bot | 60 S | 95 S | Human care, AI diagnostic support |
| **Teacher (Fairbrook Schools)** | Schools bot | 55 S | 90 S | Public sector, fully human |
| **Local café worker** | Carla's bot | 30 S | 65 S | Small business, zero LAT employer |
| **Contractor (remote)** | ExaTech (USDC→S) | 70 S equiv | 105 S | Converts USDC salary at Fisc boundary |
| **Self-employed** | None | 0 | 35 S (UBI only) | Entrepreneur, no employer |
| **Retired** | None | 0 | 35 S (UBI only) | UBI as pension supplement |
| **Student** | Part-time (Carla's) | 15 S | 50 S | Part UBI, part wages |

---

## 5. LAT Revenue Model

### Automation scoring methodology

Each business is scored on a 0–100 automation scale based on:
- Cashier/teller replacement (kiosks, ATMs)
- Inventory/supply chain AI
- Customer service AI
- Back-office automation
- Manufacturing/warehouse robots

LAT = automation_score × base_revenue_proxy × rate

### Estimated annual LAT revenue (simulation proxy, USD equivalent)

| Business | Est. annual LAT (USD) |
|----------|----------------------|
| Walmart | $280,000 |
| Kroger | $95,000 |
| McDonald's (×2) | $60,000 |
| Lowe's | $110,000 |
| All banks (×5) | $125,000 |
| CVS + Walgreens + Rite Aid | $75,000 |
| Taco Bell + Wendy's + others | $80,000 |
| Dollar stores + misc retail | $45,000 |
| Telecoms (×3) | $55,000 |
| Manufacturing (local) | $40,000 |
| All others | $60,000 |
| **TOTAL ESTIMATED** | **~$1,025,000/year** |

### UBI funding check

- Total LAT: ~$1.025M/year
- Citizens: 14,100
- UBI per citizen: $1,025,000 / 14,100 = **$72.70/year = $6.06/month**

**This is insufficient on its own.** At launch scale, LAT alone doesn't fund a
meaningful UBI. This is realistic and expected — Bellefontaine's economy isn't large
enough for LAT alone to fund $800/month UBI without additional sources:

| Additional sources needed | Est. annual |
|--------------------------|-------------|
| Federal/state block grant (future) | $5M+ |
| Protocol treasury seed (launch) | $500K |
| External donor / founding contributions | $200K |
| Reserve yield (USDC deployed) | $50K |

**Simulation approach:** The simulation seeds the Fisc reserve with enough USDC to
run 90 days of UBI at 35 S/day for all citizens. LAT revenue is real and flows
into the reserve, but the reserve seed is what makes the first epoch viable.
This is honest — early colonies need founding capital. The LAT flywheel builds over time.

---

## 6. Bot Architecture

Each external business runs as a bot wallet in the simulation. A daily cron orchestrates:

```
06:00 UTC — MCC mints UBI → all citizens receive 35 S
06:05 UTC — Employer bots pay wages → citizen wallets
06:10 UTC — Business bots pay LAT → MCC (S or USDC)
06:15 UTC — Export bots run boundary flows → Kroger, Walmart convert S profit → USDC
06:20 UTC — Import bot — ExaTech sends USDC to Graham → Graham receives S
06:25 UTC — Fisc rate algorithm runs (F9) → rate updated if needed
06:30 UTC — Dashboard refreshes → citizens see new epoch state
```

Citizen bots (Maya, Carla etc.) run spending transactions through the day to simulate
commerce. Real users interact on top of this running simulation.

---

## 7. Onboarding Flow (Target: under 3 minutes)

1. Visit `app.zpc.finance/fairbrook` (or `/colony/fairbrook`)
2. Enter name + email
3. Choose a role (9 options — see section 4)
4. Pay $3 onboarding fee in USD → funds wallet with ETH for gas
5. Wallet created (embedded — no MetaMask required)
6. Welcome screen: "You are now a citizen of Fairbrook. Your first UBI arrives at 06:00 UTC."
7. Next morning: 35 S lands in wallet. Spend it at Carla's.

---

## 8. What a New Citizen Experiences (Day 1)

| Time | Event |
|------|-------|
| Signup | Wallet created, role chosen (e.g. Walmart associate) |
| 06:00 | 35 S UBI arrives |
| 06:05 | 45 S wages arrive from Walmart bot |
| Morning | Buy coffee at Carla's for 4 S. See transaction in history. |
| Midday | Check Fisc dashboard — Walmart's LAT payment visible in reserve |
| Afternoon | Save 20 S to V |
| 06:00 next day | New epoch. Do it again. |

**The SPICE argument lands in one day:**
- You got paid without working (UBI)
- Walmart funded part of it (LAT)
- Your money stayed local (Carla didn't pay LAT)
- The reserve grew

---

## 9. Build Requirements

| Component | Description | Priority |
|-----------|-------------|----------|
| **Embedded wallet onboarding** | Email signup → auto-generated wallet, no MetaMask | P0 |
| **Compressed epoch config** | Colony epoch = 1 day for Fairbrook simulation | P0 |
| **Bot orchestrator cron** | Daily cron runs all bot transactions in sequence | P0 |
| **Role selection UI** | Choose job at signup, employer bot wired up | P0 |
| **LAT payment mechanism** | Business bots pay LAT to MCC daily | P1 |
| **Boundary flows** | Fisc deposit/withdraw (Graham import, Kroger export) | P1 |
| **Reserve seeding** | Fund Fisc reserve with enough USDC for 90-day run | P1 |
| **Full business register** | All ~40 businesses seeded as bot wallets | P1 |
| **Fairbrook landing page** | `app.zpc.finance/fairbrook` — town overview, join CTA | P2 |
| **Town economy dashboard** | Live view of all LAT flows, reserve, UBI, business activity | P2 |
| **V savings + yield** | Yield distribution to V holders | P2 |

---

## 10. Real Colony Readiness Checklist

When a real district approaches for deployment, the following must be in place:

- [ ] Full asset register (property, business, land)
- [ ] Real citizen identity verification (KYC-lite at minimum)
- [ ] Real LAT assessment process (third-party audit or self-declaration)
- [ ] Governance elections live and tested
- [ ] Fisc boundary flows battle-tested at simulation scale
- [ ] MCC onboarding documentation (legal framework for colony)
- [ ] Reserve funding strategy (federal grant application, protocol treasury)
- [ ] Mobile app (iOS + Android) available for non-technical citizens
- [ ] Multi-language support
- [ ] Legal structure for colony operating in US jurisdiction

---

*Document version: 1.0 — 25 April 2026*
*Source data: Bellefontaine, Ohio. US Census 2024, DataUSA, Logan County Economic Development, Yelp/TripAdvisor business listings.*
