-- MaryFontaine simulator schema (v2 spec, §2)
-- SQLite. Run via `python -c "import sqlite3; sqlite3.connect('mf.db').executescript(open('schema.sql').read())"`
-- or via the helper in db.py.

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ── Citizens, households, companies ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS citizens (
    id              INTEGER PRIMARY KEY,
    name            TEXT,
    age_at_founding REAL,
    household_id    INTEGER,
    archetype       TEXT NOT NULL,           -- current archetype (mutable)
    behavioural_type TEXT NOT NULL,          -- 'saver' | 'spender' | 'striver' | 'balanced'
    death_year      INTEGER,                 -- null if alive
    arrival_year    INTEGER,                 -- 0 for founding citizens
    departure_year  INTEGER,                 -- null if still resident
    FOREIGN KEY (household_id) REFERENCES households(id)
);

CREATE INDEX IF NOT EXISTS idx_citizens_household ON citizens(household_id);
CREATE INDEX IF NOT EXISTS idx_citizens_archetype ON citizens(archetype);

CREATE TABLE IF NOT EXISTS archetype_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id      INTEGER NOT NULL,
    year            INTEGER NOT NULL,
    month           INTEGER NOT NULL,
    from_archetype  TEXT NOT NULL,
    to_archetype    TEXT NOT NULL,
    trigger         TEXT NOT NULL,           -- 'sustained_surplus' | 'company_founded' | 'company_survived_12mo' | 'job_loss'
    FOREIGN KEY (citizen_id) REFERENCES citizens(id)
);

CREATE INDEX IF NOT EXISTS idx_arch_history_citizen ON archetype_history(citizen_id);

CREATE TABLE IF NOT EXISTS households (
    id                          INTEGER PRIMARY KEY,
    composition                 TEXT NOT NULL,  -- 'single' | 'couple' | 'family_2k' | 'family_3k' | 'single_parent_1k' | etc
    housing_type                TEXT NOT NULL,  -- 'owner_free' | 'owner_mortgage' | 'renter_internal' | 'renter_external'
    monthly_housing_cost_usd    REAL DEFAULT 0,
    monthly_housing_cost_s      REAL DEFAULT 0,
    mortgage_balance_usd        REAL DEFAULT 0,
    mortgage_rate               REAL DEFAULT 0,
    mortgage_remaining_months   INTEGER DEFAULT 0,
    primary_citizen_id          INTEGER,        -- the wallet that pays household-level bills
    basket_baseline_multiplier  REAL DEFAULT 1.0,  -- household consumption scale
    discretionary_propensity    REAL DEFAULT 0.5
);

CREATE TABLE IF NOT EXISTS companies (
    id                  INTEGER PRIMARY KEY,
    name                TEXT NOT NULL,
    sector              TEXT NOT NULL,
    sectors_served      TEXT,                    -- comma-separated basket categories: 'energy', 'food', 'goods', 'services'
    founded_year        INTEGER NOT NULL,        -- 0 for founding companies
    closed_year         INTEGER,                 -- null if still active
    is_external_owned   INTEGER NOT NULL DEFAULT 0,  -- 1 if Honda Inc / external dominant shareholder
    cfo_policy          TEXT NOT NULL,           -- 'conservative' | 'aggressive_dividend' | 'growth_focused'
    max_revenue_per_month_s REAL NOT NULL,       -- supplier-picker capacity ceiling
    -- Per-month revenue counter is held in memory during sim; persisted in company_snapshots
    is_mcc              INTEGER NOT NULL DEFAULT 0,
    is_exporter         INTEGER NOT NULL DEFAULT 0,
    monthly_export_usd_baseline   REAL DEFAULT 0,  -- for exporting companies
    monthly_import_usd_baseline   REAL DEFAULT 0,  -- for importing companies
    -- Levy mechanism (per spice_levy_build_spec §4)
    profit_per_employee REAL DEFAULT 100000,         -- USD; updated annually from filed accounts
    profit_per_employee_year INTEGER DEFAULT 0,      -- year of last update
    annual_profit       REAL DEFAULT 0,              -- accumulator, reset each year
    employee_count      INTEGER DEFAULT 1            -- workers + active owners
);

CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

CREATE TABLE IF NOT EXISTS equity_holdings (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id              INTEGER NOT NULL,
    holder_type             TEXT NOT NULL,           -- 'citizen' | 'external'
    holder_id               INTEGER,                 -- citizen_id (null for external)
    external_holder_name    TEXT,                    -- 'Honda Inc' for external
    share_type              TEXT NOT NULL,           -- 'permanent' | 'time_limited'
    share_count             REAL NOT NULL,
    issued_year             INTEGER NOT NULL,
    issued_month            INTEGER NOT NULL,
    expiry_year             INTEGER,                 -- null for permanent
    expiry_month            INTEGER,
    cancelled               INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE INDEX IF NOT EXISTS idx_equity_company ON equity_holdings(company_id);
CREATE INDEX IF NOT EXISTS idx_equity_holder ON equity_holdings(holder_type, holder_id);

-- ── Wallets and transactions ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallets (
    id              INTEGER PRIMARY KEY,
    owner_type      TEXT NOT NULL,         -- 'citizen' | 'company' | 'mcc' | 'fisc' | 'external'
    owner_id        INTEGER,
    s_balance       REAL NOT NULL DEFAULT 0,
    usdc_balance    REAL NOT NULL DEFAULT 0   -- only Fisc and external have nonzero
);

CREATE INDEX IF NOT EXISTS idx_wallets_owner ON wallets(owner_type, owner_id);

CREATE TABLE IF NOT EXISTS transactions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    year                INTEGER NOT NULL,
    month               INTEGER NOT NULL,
    type                TEXT NOT NULL,          -- see spec §2 transaction types
    from_wallet_id      INTEGER,
    to_wallet_id        INTEGER,
    s_amount            REAL DEFAULT 0,         -- net to recipient (post-levy)
    usdc_amount         REAL DEFAULT 0,         -- nonzero only for boundary crossings
    fisc_rate_at_time   REAL,                   -- USD per S
    description         TEXT,
    related_company_id  INTEGER,                -- for dividends, MCC bills, exports, etc
    -- Levy mechanism (per spice_levy_build_spec §4)
    gross_value         REAL DEFAULT 0,         -- pre-levy value sent by buyer
    gas_levy            REAL DEFAULT 0,         -- chain gas, in S
    protocol_levy       REAL DEFAULT 0,         -- to SPICE protocol founders, in S
    automation_levy     REAL DEFAULT 0          -- to Fisc reserve, in S (converted to USDC)
);

CREATE INDEX IF NOT EXISTS idx_tx_year_month ON transactions(year, month);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_tx_to ON transactions(to_wallet_id);

-- ── State and environment ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fisc_state (
    year                INTEGER NOT NULL,
    month               INTEGER NOT NULL,
    fisc_rate           REAL NOT NULL,        -- USD per S
    usdc_reserve        REAL NOT NULL,
    s_supply_total      REAL NOT NULL,
    s_supply_citizens   REAL NOT NULL,
    s_supply_companies  REAL NOT NULL,
    basket_cost_usd     REAL NOT NULL,
    basket_cost_s       REAL NOT NULL,        -- target 28; deviation = stress signal
    cover_ratio         REAL NOT NULL,
    rate_compressed     INTEGER DEFAULT 0,    -- 1 if reserve forced rate above peg
    PRIMARY KEY (year, month)
);

CREATE TABLE IF NOT EXISTS basket_categories (
    name                    TEXT PRIMARY KEY,    -- 'energy' | 'food' | 'goods' | 'services'
    weight_at_founding_usd  REAL NOT NULL,
    weight_pct              REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS external_environment (
    year        INTEGER NOT NULL,
    month       INTEGER NOT NULL,
    category    TEXT NOT NULL,
    cost_usd    REAL NOT NULL,                  -- USD price of this basket category, this month
    PRIMARY KEY (year, month, category)
);

-- ── Snapshots ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS citizen_snapshots (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id                  INTEGER NOT NULL,
    year                        INTEGER NOT NULL,
    month                       INTEGER NOT NULL,
    s_balance                   REAL NOT NULL,
    monthly_income_s            REAL DEFAULT 0,
    monthly_dividend_s          REAL DEFAULT 0,
    monthly_external_usd        REAL DEFAULT 0,
    monthly_basket_spend_s      REAL DEFAULT 0,
    real_purchasing_power       REAL DEFAULT 0   -- monthly_income_s / current basket_cost_s
);

CREATE INDEX IF NOT EXISTS idx_citizen_snap_citizen ON citizen_snapshots(citizen_id);
CREATE INDEX IF NOT EXISTS idx_citizen_snap_ym ON citizen_snapshots(year, month);

CREATE TABLE IF NOT EXISTS company_snapshots (
    id                              INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id                      INTEGER NOT NULL,
    year                            INTEGER NOT NULL,
    month                           INTEGER NOT NULL,
    s_balance                       REAL NOT NULL,           -- end-of-month
    min_s_balance_within_month      REAL NOT NULL,           -- intra-month minimum (liquidity-stress instrumentation, spec §4.5)
    monthly_revenue_s               REAL DEFAULT 0,
    monthly_costs_s                 REAL DEFAULT 0,
    monthly_imports_usd             REAL DEFAULT 0,
    monthly_exports_usd             REAL DEFAULT 0,
    monthly_dividend_distributed_s  REAL DEFAULT 0,
    import_default_count            INTEGER DEFAULT 0,       -- imports the company couldn't pay this month
    employee_count                  INTEGER DEFAULT 0,
    permanent_share_count           REAL DEFAULT 0,
    timed_share_count               REAL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_company_snap_company ON company_snapshots(company_id);
CREATE INDEX IF NOT EXISTS idx_company_snap_ym ON company_snapshots(year, month);

CREATE TABLE IF NOT EXISTS unmet_demand (
    year        INTEGER NOT NULL,
    month       INTEGER NOT NULL,
    category    TEXT NOT NULL,                  -- basket category
    unmet_s     REAL NOT NULL,                  -- demand that found no in-category supplier
    total_s     REAL NOT NULL,                  -- total demand this category this month
    PRIMARY KEY (year, month, category)
);

CREATE TABLE IF NOT EXISTS annual_summaries (
    year                    INTEGER PRIMARY KEY,
    population              INTEGER,
    active_companies        INTEGER,
    new_companies           INTEGER,
    failed_companies        INTEGER,
    total_exports_usd       REAL,
    total_imports_usd       REAL,
    net_usdc_flow           REAL,
    avg_citizen_income_s    REAL,
    median_citizen_income_s REAL,
    gini_coefficient        REAL,
    fisc_rate_year_end      REAL,
    reserve_year_end        REAL
);

-- ── Run metadata ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS run_metadata (
    key     TEXT PRIMARY KEY,
    value   TEXT NOT NULL
);
-- expected keys: 'scenario', 'noise', 'seed', 'scale', 'started_at', 'finished_at', 'spec_version'

-- ── Levy mechanism (per spice_levy_build_spec) ──────────────────────────────

CREATE TABLE IF NOT EXISTS external_suppliers (
    id                  INTEGER PRIMARY KEY,
    name                TEXT NOT NULL,
    sector              TEXT NOT NULL,
    profit_per_employee REAL NOT NULL,           -- USD/year
    annual_revenue      REAL,                    -- USD; revenue from MaryFontaine commerce
    employee_count      INTEGER DEFAULT 1,
    annual_profit       REAL,                    -- USD/year
    last_updated_year   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS protocol_treasury (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    year                        INTEGER NOT NULL,
    month                       INTEGER NOT NULL,
    monthly_revenue_s           REAL NOT NULL DEFAULT 0,
    monthly_revenue_usdc        REAL NOT NULL DEFAULT 0,
    cumulative_revenue_usdc     REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gas_pool (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    year                        INTEGER NOT NULL,
    month                       INTEGER NOT NULL,
    monthly_gas_s               REAL NOT NULL DEFAULT 0,
    monthly_gas_usdc            REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS levy_calibration (
    id                              INTEGER PRIMARY KEY AUTOINCREMENT,
    year                            INTEGER NOT NULL,
    p_threshold                     REAL NOT NULL,
    p_baseline                      REAL NOT NULL,
    alpha                           REAL NOT NULL,
    k                               REAL NOT NULL,
    projected_annual_levy_revenue   REAL,                -- USD
    projected_annual_ubi_obligation REAL,                -- USD
    actual_levy_revenue_prior_year  REAL,                -- USD
    actual_ubi_obligation_prior_year REAL                -- USD
);

CREATE TABLE IF NOT EXISTS mcc_federal_remittances (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    year                        INTEGER NOT NULL,
    month                       INTEGER NOT NULL,
    total_collected_s           REAL NOT NULL DEFAULT 0,
    total_remitted_usdc         REAL NOT NULL DEFAULT 0,
    fisc_rate_at_remittance     REAL
);

-- Track per-supplier levy activity for the dashboard's "top-10 levy payers" panel
CREATE TABLE IF NOT EXISTS supplier_levy_summary (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    year                        INTEGER NOT NULL,
    holder_type                 TEXT NOT NULL,          -- 'company' or 'external'
    holder_id                   INTEGER NOT NULL,
    name                        TEXT,
    sector                      TEXT,
    profit_per_employee         REAL,
    automation_levy_s           REAL DEFAULT 0,
    automation_levy_usdc        REAL DEFAULT 0,
    transaction_count           INTEGER DEFAULT 0
);
