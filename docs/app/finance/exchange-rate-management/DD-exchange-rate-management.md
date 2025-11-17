# Data Definition: Exchange Rate Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Exchange Rate Management
- **Route**: `/finance/exchange-rate-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-13
- **Owner**: Finance Product Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-13 | Finance Product Team | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |

---

## Overview

This document defines the complete data schema for the Exchange Rate Management module, including database tables, fields, data types, constraints, relationships, and indexes. The schema is designed to support multi-currency operations with high-precision exchange rate management, automated rate updates from external providers, approval workflows, historical tracking, and comprehensive audit trails.

The schema follows PostgreSQL conventions and leverages Prisma ORM for type safety and migration management. All monetary values use `Decimal` type with appropriate precision, and all timestamps are stored in UTC timezone. Row-Level Security (RLS) policies are applied to ensure data protection based on user roles and permissions.

---

## Database Tables

### 1. exchange_rates

**Purpose**: Core table storing exchange rate data with support for multiple rate types, sources, and approval workflows.

**Schema**:
```sql
CREATE TABLE exchange_rates (
  -- Primary Key
  rate_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Currency Information
  source_currency         VARCHAR(3) NOT NULL,  -- ISO 4217 code (USD, EUR, GBP)
  target_currency         VARCHAR(3) NOT NULL,  -- ISO 4217 code

  -- Rate Values (6 decimal places for precision)
  exchange_rate           DECIMAL(18, 6) NOT NULL,  -- Primary conversion rate
  inverse_rate            DECIMAL(18, 6) NOT NULL,  -- Calculated inverse rate
  buy_rate                DECIMAL(18, 6),           -- Rate for buying target currency
  sell_rate               DECIMAL(18, 6),           -- Rate for selling target currency
  mid_rate                DECIMAL(18, 6) NOT NULL,  -- Middle rate (for buy/sell or main rate)
  spread_percentage       DECIMAL(5, 4),            -- Spread between buy/sell rates

  -- Rate Classification
  rate_type               VARCHAR(20) NOT NULL CHECK (rate_type IN ('spot', 'forward', 'average', 'month_end', 'year_end')),
  rate_source             VARCHAR(50) NOT NULL,     -- Manual, Bloomberg, OpenExchangeRates, etc.
  provider_id             UUID,                     -- Foreign key to rate_providers

  -- Temporal Information
  effective_date          TIMESTAMPTZ NOT NULL,     -- When rate becomes active
  effective_until         TIMESTAMPTZ,              -- When rate expires (for forward rates)
  created_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_date           TIMESTAMPTZ,

  -- Status and Control
  is_active               BOOLEAN NOT NULL DEFAULT false,
  is_manual_entry         BOOLEAN NOT NULL DEFAULT false,
  approval_status         VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),

  -- Approval Workflow
  approved_by             UUID,                     -- User who approved
  approved_date           TIMESTAMPTZ,
  rejection_reason        TEXT,

  -- Quality and Reliability
  confidence_level        INTEGER CHECK (confidence_level BETWEEN 0 AND 100),
  variance_from_previous  DECIMAL(5, 4),            -- % change from last rate
  transaction_count       INTEGER DEFAULT 0,        -- Number of transactions using this rate

  -- Audit and Documentation
  created_by              UUID NOT NULL,
  modified_by             UUID,
  notes                   TEXT,
  source_reference        VARCHAR(200),             -- External reference (contract #, quote #)

  -- Constraints
  CONSTRAINT fk_rate_provider FOREIGN KEY (provider_id) REFERENCES rate_providers(provider_id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id),
  CONSTRAINT fk_modified_by FOREIGN KEY (modified_by) REFERENCES users(user_id),
  CONSTRAINT chk_currencies_different CHECK (source_currency != target_currency),
  CONSTRAINT chk_positive_rates CHECK (exchange_rate > 0 AND inverse_rate > 0 AND mid_rate > 0),
  CONSTRAINT chk_buy_sell_rates CHECK (buy_rate IS NULL OR sell_rate IS NULL OR buy_rate <= sell_rate),
  CONSTRAINT chk_approval_complete CHECK (
    (approval_status = 'approved' AND approved_by IS NOT NULL AND approved_date IS NOT NULL) OR
    (approval_status != 'approved')
  )
);

-- Indexes for performance optimization
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(source_currency, target_currency);
CREATE INDEX idx_exchange_rates_effective_date ON exchange_rates(effective_date DESC);
CREATE INDEX idx_exchange_rates_active ON exchange_rates(is_active, effective_date DESC) WHERE is_active = true;
CREATE INDEX idx_exchange_rates_approval_status ON exchange_rates(approval_status, created_date) WHERE approval_status = 'pending';
CREATE INDEX idx_exchange_rates_provider ON exchange_rates(provider_id, created_date);
CREATE INDEX idx_exchange_rates_rate_type ON exchange_rates(rate_type, effective_date);
CREATE INDEX idx_exchange_rates_currency_pair_active ON exchange_rates(source_currency, target_currency, effective_date DESC) WHERE is_active = true;

-- Unique constraint for active rates
CREATE UNIQUE INDEX idx_exchange_rates_active_unique ON exchange_rates(source_currency, target_currency, rate_type)
WHERE is_active = true AND approval_status = 'approved';

-- Comments
COMMENT ON TABLE exchange_rates IS 'Core exchange rate data with multi-currency support';
COMMENT ON COLUMN exchange_rates.exchange_rate IS '1 unit of source_currency = X units of target_currency';
COMMENT ON COLUMN exchange_rates.inverse_rate IS '1 unit of target_currency = X units of source_currency';
COMMENT ON COLUMN exchange_rates.spread_percentage IS 'Percentage spread between buy and sell rates';
```

**TypeScript Interface**:
```typescript
interface ExchangeRate {
  rate_id: string
  source_currency: string
  target_currency: string
  exchange_rate: Decimal
  inverse_rate: Decimal
  buy_rate?: Decimal
  sell_rate?: Decimal
  mid_rate: Decimal
  spread_percentage?: Decimal
  rate_type: 'spot' | 'forward' | 'average' | 'month_end' | 'year_end'
  rate_source: string
  provider_id?: string
  effective_date: Date
  effective_until?: Date
  created_date: Date
  modified_date?: Date
  is_active: boolean
  is_manual_entry: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_date?: Date
  rejection_reason?: string
  confidence_level?: number
  variance_from_previous?: Decimal
  transaction_count: number
  created_by: string
  modified_by?: string
  notes?: string
  source_reference?: string
}
```

---

### 2. rate_providers

**Purpose**: Configuration and management of external exchange rate providers (APIs and data sources).

**Schema**:
```sql
CREATE TABLE rate_providers (
  -- Primary Key
  provider_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider Information
  provider_name           VARCHAR(100) NOT NULL UNIQUE,  -- OpenExchangeRates, Bloomberg, ECB
  provider_type           VARCHAR(50) NOT NULL CHECK (provider_type IN ('api', 'manual', 'bank', 'central_bank')),
  description             TEXT,

  -- API Configuration
  api_endpoint            VARCHAR(500),
  api_key_encrypted       TEXT,                     -- AES-256 encrypted API key
  authentication_method   VARCHAR(50),              -- bearer, api_key, oauth, none

  -- Update Configuration
  update_schedule         VARCHAR(20) NOT NULL CHECK (update_schedule IN ('realtime', 'hourly', 'daily', 'manual')),
  update_time             TIME,                     -- Time of day for daily updates (HH:MM)
  timezone                VARCHAR(50) DEFAULT 'UTC',

  -- Provider Settings
  is_primary              BOOLEAN DEFAULT false,
  priority_order          INTEGER NOT NULL,         -- 1 = highest priority for fallback
  enabled_currencies      TEXT[],                   -- Array of currency codes to fetch
  supported_rate_types    TEXT[] DEFAULT ARRAY['spot'],

  -- Automation and Approval
  auto_approve            BOOLEAN DEFAULT false,    -- Skip approval for rates from this provider
  variance_threshold      DECIMAL(5, 4) DEFAULT 0.05,  -- 5% default threshold for alerts

  -- Retry Logic
  retry_attempts          INTEGER DEFAULT 3,
  retry_delay_minutes     INTEGER DEFAULT 5,

  -- Suspension Management
  suspension_periods      JSONB,                    -- Array of {start_date, end_date} for update suspension

  -- Provider Health and Status
  is_active               BOOLEAN DEFAULT true,
  last_update_attempt     TIMESTAMPTZ,
  last_successful_update  TIMESTAMPTZ,
  last_failure            TIMESTAMPTZ,
  failure_count           INTEGER DEFAULT 0,
  consecutive_failures    INTEGER DEFAULT 0,
  health_status           VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'failing', 'offline')),

  -- Performance Metrics
  average_response_time   INTEGER,                  -- milliseconds
  success_rate            DECIMAL(5, 4),            -- percentage
  total_requests          INTEGER DEFAULT 0,
  successful_requests     INTEGER DEFAULT 0,

  -- Audit
  created_by              UUID NOT NULL,
  created_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_by             UUID,
  modified_date           TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_modified_by FOREIGN KEY (modified_by) REFERENCES users(user_id),
  CONSTRAINT chk_priority_positive CHECK (priority_order > 0),
  CONSTRAINT chk_variance_positive CHECK (variance_threshold >= 0),
  CONSTRAINT chk_retry_positive CHECK (retry_attempts >= 0 AND retry_delay_minutes >= 0)
);

-- Indexes
CREATE INDEX idx_rate_providers_active ON rate_providers(is_active, priority_order);
CREATE INDEX idx_rate_providers_primary ON rate_providers(is_primary) WHERE is_primary = true;
CREATE INDEX idx_rate_providers_health ON rate_providers(health_status, last_update_attempt);

-- Unique constraint for primary provider
CREATE UNIQUE INDEX idx_rate_providers_primary_unique ON rate_providers(is_primary) WHERE is_primary = true;

-- Comments
COMMENT ON TABLE rate_providers IS 'Configuration for external exchange rate data providers';
COMMENT ON COLUMN rate_providers.api_key_encrypted IS 'AES-256 encrypted API credentials';
COMMENT ON COLUMN rate_providers.priority_order IS 'Determines fallback order when primary provider fails';
```

**TypeScript Interface**:
```typescript
interface RateProvider {
  provider_id: string
  provider_name: string
  provider_type: 'api' | 'manual' | 'bank' | 'central_bank'
  description?: string
  api_endpoint?: string
  api_key_encrypted?: string
  authentication_method?: string
  update_schedule: 'realtime' | 'hourly' | 'daily' | 'manual'
  update_time?: string
  timezone: string
  is_primary: boolean
  priority_order: number
  enabled_currencies?: string[]
  supported_rate_types: string[]
  auto_approve: boolean
  variance_threshold: Decimal
  retry_attempts: number
  retry_delay_minutes: number
  suspension_periods?: SuspensionPeriod[]
  is_active: boolean
  last_update_attempt?: Date
  last_successful_update?: Date
  last_failure?: Date
  failure_count: number
  consecutive_failures: number
  health_status: 'healthy' | 'degraded' | 'failing' | 'offline'
  average_response_time?: number
  success_rate?: Decimal
  total_requests: number
  successful_requests: number
  created_by: string
  created_date: Date
  modified_by?: string
  modified_date?: Date
}

interface SuspensionPeriod {
  start_date: Date
  end_date: Date
  reason?: string
}
```

---

### 3. rate_update_log

**Purpose**: Comprehensive audit log of all exchange rate update attempts from external providers and manual entries.

**Schema**:
```sql
CREATE TABLE rate_update_log (
  -- Primary Key
  log_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Update Information
  provider_id             UUID,
  update_source           VARCHAR(100) NOT NULL,    -- Provider name or 'Manual Entry'
  update_type             VARCHAR(20) NOT NULL CHECK (update_type IN ('automated', 'manual', 'bulk_import', 'correction')),

  -- Update Execution
  started_at              TIMESTAMPTZ NOT NULL,
  completed_at            TIMESTAMPTZ,
  duration_ms             INTEGER,

  -- Status and Results
  status                  VARCHAR(20) NOT NULL CHECK (status IN ('success', 'partial', 'failed', 'skipped')),
  rates_fetched           INTEGER DEFAULT 0,
  rates_inserted          INTEGER DEFAULT 0,
  rates_updated           INTEGER DEFAULT 0,
  rates_failed            INTEGER DEFAULT 0,

  -- Error Handling
  error_code              VARCHAR(50),
  error_message           TEXT,
  error_details           JSONB,

  -- Request Details
  request_payload         JSONB,                    -- API request data
  response_payload        JSONB,                    -- API response data (sanitized)
  http_status_code        INTEGER,

  -- Currency Coverage
  currencies_requested    TEXT[],
  currencies_received     TEXT[],
  missing_currencies      TEXT[],

  -- Execution Context
  triggered_by            VARCHAR(50),              -- 'scheduler', 'user', 'api', 'retry'
  initiated_by            UUID,                     -- User ID if manual
  retry_attempt           INTEGER DEFAULT 0,

  -- Performance Metrics
  api_response_time       INTEGER,                  -- milliseconds
  processing_time         INTEGER,                  -- milliseconds
  validation_time         INTEGER,                  -- milliseconds

  -- Notes
  notes                   TEXT,

  -- Constraints
  CONSTRAINT fk_provider FOREIGN KEY (provider_id) REFERENCES rate_providers(provider_id) ON DELETE CASCADE,
  CONSTRAINT fk_initiated_by FOREIGN KEY (initiated_by) REFERENCES users(user_id)
);

-- Indexes
CREATE INDEX idx_rate_update_log_provider ON rate_update_log(provider_id, started_at DESC);
CREATE INDEX idx_rate_update_log_status ON rate_update_log(status, started_at DESC);
CREATE INDEX idx_rate_update_log_started ON rate_update_log(started_at DESC);
CREATE INDEX idx_rate_update_log_failed ON rate_update_log(status, started_at DESC) WHERE status = 'failed';

-- Partitioning by month for large log tables (optional, for high-volume systems)
-- CREATE TABLE rate_update_log_2025_01 PARTITION OF rate_update_log
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Comments
COMMENT ON TABLE rate_update_log IS 'Audit log of all exchange rate update operations';
COMMENT ON COLUMN rate_update_log.duration_ms IS 'Total duration of update operation in milliseconds';
COMMENT ON COLUMN rate_update_log.rates_inserted IS 'Number of new rates added';
COMMENT ON COLUMN rate_update_log.rates_updated IS 'Number of existing rates modified';
```

**TypeScript Interface**:
```typescript
interface RateUpdateLog {
  log_id: string
  provider_id?: string
  update_source: string
  update_type: 'automated' | 'manual' | 'bulk_import' | 'correction'
  started_at: Date
  completed_at?: Date
  duration_ms?: number
  status: 'success' | 'partial' | 'failed' | 'skipped'
  rates_fetched: number
  rates_inserted: number
  rates_updated: number
  rates_failed: number
  error_code?: string
  error_message?: string
  error_details?: Record<string, any>
  request_payload?: Record<string, any>
  response_payload?: Record<string, any>
  http_status_code?: number
  currencies_requested?: string[]
  currencies_received?: string[]
  missing_currencies?: string[]
  triggered_by: string
  initiated_by?: string
  retry_attempt: number
  api_response_time?: number
  processing_time?: number
  validation_time?: number
  notes?: string
}
```

---

### 4. currency_conversions

**Purpose**: Track real-time currency conversion operations performed across the system for audit and analytics.

**Schema**:
```sql
CREATE TABLE currency_conversions (
  -- Primary Key
  conversion_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversion Details
  source_currency         VARCHAR(3) NOT NULL,
  target_currency         VARCHAR(3) NOT NULL,
  source_amount           DECIMAL(18, 6) NOT NULL,
  exchange_rate_used      DECIMAL(18, 6) NOT NULL,
  target_amount           DECIMAL(18, 6) NOT NULL,

  -- Rate Information
  rate_id                 UUID,                     -- Reference to exchange_rates
  rate_type               VARCHAR(20) NOT NULL,
  rate_source             VARCHAR(50) NOT NULL,
  conversion_method       VARCHAR(20) NOT NULL CHECK (conversion_method IN ('direct', 'triangulated', 'manual')),
  base_currency           VARCHAR(3),               -- For triangulated conversions

  -- Context Information
  conversion_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_date          TIMESTAMPTZ NOT NULL,     -- Rate effective date used

  -- Transaction Context
  transaction_type        VARCHAR(50),              -- 'purchase_order', 'invoice', 'payment', etc.
  transaction_id          UUID,                     -- Reference to source transaction
  document_number         VARCHAR(100),

  -- User and Session
  converted_by            UUID NOT NULL,
  session_id              VARCHAR(100),
  ip_address              INET,

  -- Purpose and Notes
  conversion_purpose      VARCHAR(100),             -- 'transaction', 'reporting', 'estimation'
  notes                   TEXT,

  -- Constraints
  CONSTRAINT fk_rate_used FOREIGN KEY (rate_id) REFERENCES exchange_rates(rate_id) ON DELETE SET NULL,
  CONSTRAINT fk_converted_by FOREIGN KEY (converted_by) REFERENCES users(user_id),
  CONSTRAINT chk_currencies_different CHECK (source_currency != target_currency),
  CONSTRAINT chk_positive_amounts CHECK (source_amount > 0 AND target_amount > 0 AND exchange_rate_used > 0)
);

-- Indexes
CREATE INDEX idx_currency_conversions_date ON currency_conversions(conversion_date DESC);
CREATE INDEX idx_currency_conversions_currencies ON currency_conversions(source_currency, target_currency, conversion_date DESC);
CREATE INDEX idx_currency_conversions_transaction ON currency_conversions(transaction_type, transaction_id);
CREATE INDEX idx_currency_conversions_user ON currency_conversions(converted_by, conversion_date DESC);
CREATE INDEX idx_currency_conversions_rate ON currency_conversions(rate_id);

-- Partitioning by month (optional, for high-volume systems)
-- CREATE TABLE currency_conversions_2025_01 PARTITION OF currency_conversions
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Comments
COMMENT ON TABLE currency_conversions IS 'Audit trail of all currency conversion operations';
COMMENT ON COLUMN currency_conversions.conversion_method IS 'direct: direct rate, triangulated: via base currency';
COMMENT ON COLUMN currency_conversions.base_currency IS 'Intermediate currency used for triangulation';
```

**TypeScript Interface**:
```typescript
interface CurrencyConversion {
  conversion_id: string
  source_currency: string
  target_currency: string
  source_amount: Decimal
  exchange_rate_used: Decimal
  target_amount: Decimal
  rate_id?: string
  rate_type: string
  rate_source: string
  conversion_method: 'direct' | 'triangulated' | 'manual'
  base_currency?: string
  conversion_date: Date
  effective_date: Date
  transaction_type?: string
  transaction_id?: string
  document_number?: string
  converted_by: string
  session_id?: string
  ip_address?: string
  conversion_purpose?: string
  notes?: string
}
```

---

### 5. revaluation_batches

**Purpose**: Track period-end revaluation processes for foreign currency balances and generate exchange gain/loss journals.

**Schema**:
```sql
CREATE TABLE revaluation_batches (
  -- Primary Key
  batch_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Batch Information
  batch_number            VARCHAR(50) NOT NULL UNIQUE,
  batch_name              VARCHAR(200) NOT NULL,
  description             TEXT,

  -- Period Information
  revaluation_date        DATE NOT NULL,            -- Period-end date
  posting_date            DATE NOT NULL,            -- Journal posting date
  fiscal_period           VARCHAR(20) NOT NULL,     -- 'FY2025-Q1', 'FY2025-01'
  fiscal_year             VARCHAR(10) NOT NULL,

  -- Scope
  currency_codes          TEXT[],                   -- Currencies included in revaluation
  account_types           TEXT[],                   -- Account types included

  -- Execution
  started_at              TIMESTAMPTZ NOT NULL,
  completed_at            TIMESTAMPTZ,
  duration_ms             INTEGER,

  -- Status
  status                  VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'posted', 'failed', 'cancelled')),

  -- Results Summary
  accounts_processed      INTEGER DEFAULT 0,
  accounts_with_gain      INTEGER DEFAULT 0,
  accounts_with_loss      INTEGER DEFAULT 0,
  total_realized_gain     DECIMAL(18, 2) DEFAULT 0,
  total_realized_loss     DECIMAL(18, 2) DEFAULT 0,
  total_unrealized_gain   DECIMAL(18, 2) DEFAULT 0,
  total_unrealized_loss   DECIMAL(18, 2) DEFAULT 0,
  net_gain_loss           DECIMAL(18, 2) DEFAULT 0,

  -- Journal Entry
  journal_entry_id        UUID,                     -- Posted GL journal entry
  journal_number          VARCHAR(50),
  journal_posted_by       UUID,
  journal_posted_at       TIMESTAMPTZ,

  -- Error Handling
  error_count             INTEGER DEFAULT 0,
  error_details           JSONB,

  -- Approval Workflow
  approval_status         VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by             UUID,
  approved_at             TIMESTAMPTZ,
  rejection_reason        TEXT,

  -- Audit
  created_by              UUID NOT NULL,
  created_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_by             UUID,
  modified_date           TIMESTAMPTZ,
  notes                   TEXT,

  -- Constraints
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id),
  CONSTRAINT fk_journal_posted_by FOREIGN KEY (journal_posted_by) REFERENCES users(user_id),
  CONSTRAINT fk_modified_by FOREIGN KEY (modified_by) REFERENCES users(user_id),
  CONSTRAINT chk_dates_valid CHECK (posting_date >= revaluation_date)
);

-- Indexes
CREATE INDEX idx_revaluation_batches_date ON revaluation_batches(revaluation_date DESC);
CREATE INDEX idx_revaluation_batches_status ON revaluation_batches(status, created_date DESC);
CREATE INDEX idx_revaluation_batches_fiscal ON revaluation_batches(fiscal_year, fiscal_period);
CREATE INDEX idx_revaluation_batches_approval ON revaluation_batches(approval_status, created_date) WHERE approval_status = 'pending';

-- Comments
COMMENT ON TABLE revaluation_batches IS 'Period-end currency revaluation batch processing records';
COMMENT ON COLUMN revaluation_batches.net_gain_loss IS 'Net effect: (realized + unrealized gains) - (realized + unrealized losses)';
```

**TypeScript Interface**:
```typescript
interface RevaluationBatch {
  batch_id: string
  batch_number: string
  batch_name: string
  description?: string
  revaluation_date: Date
  posting_date: Date
  fiscal_period: string
  fiscal_year: string
  currency_codes?: string[]
  account_types?: string[]
  started_at: Date
  completed_at?: Date
  duration_ms?: number
  status: 'in_progress' | 'completed' | 'posted' | 'failed' | 'cancelled'
  accounts_processed: number
  accounts_with_gain: number
  accounts_with_loss: number
  total_realized_gain: Decimal
  total_realized_loss: Decimal
  total_unrealized_gain: Decimal
  total_unrealized_loss: Decimal
  net_gain_loss: Decimal
  journal_entry_id?: string
  journal_number?: string
  journal_posted_by?: string
  journal_posted_at?: Date
  error_count: number
  error_details?: Record<string, any>
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: Date
  rejection_reason?: string
  created_by: string
  created_date: Date
  modified_by?: string
  modified_date?: Date
  notes?: string
}
```

---

### 6. gain_loss_log

**Purpose**: Detailed line-item tracking of exchange gains and losses calculated during revaluation.

**Schema**:
```sql
CREATE TABLE gain_loss_log (
  -- Primary Key
  log_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Batch Reference
  batch_id                UUID NOT NULL,

  -- Account Information
  account_id              UUID NOT NULL,
  account_code            VARCHAR(50) NOT NULL,
  account_name            VARCHAR(200) NOT NULL,
  currency_code           VARCHAR(3) NOT NULL,

  -- Balance Information
  opening_balance_fc      DECIMAL(18, 6) NOT NULL,  -- Foreign currency balance
  closing_balance_fc      DECIMAL(18, 6) NOT NULL,

  -- Exchange Rates
  opening_rate            DECIMAL(18, 6) NOT NULL,
  closing_rate            DECIMAL(18, 6) NOT NULL,
  rate_change_percentage  DECIMAL(5, 4),

  -- Base Currency Values
  opening_balance_bc      DECIMAL(18, 2) NOT NULL,  -- Base currency value
  closing_balance_bc      DECIMAL(18, 2) NOT NULL,

  -- Gain/Loss Calculation
  realized_gain_loss      DECIMAL(18, 2) DEFAULT 0,
  unrealized_gain_loss    DECIMAL(18, 2) DEFAULT 0,
  total_gain_loss         DECIMAL(18, 2) NOT NULL,
  gain_loss_type          VARCHAR(20) NOT NULL CHECK (gain_loss_type IN ('gain', 'loss', 'none')),

  -- Classification
  is_balance_sheet        BOOLEAN DEFAULT true,     -- vs. P&L account
  account_type            VARCHAR(50),              -- Asset, Liability, etc.

  -- Journal Entry Mapping
  journal_entry_line_id   UUID,                     -- GL journal line created
  gl_account_gain         VARCHAR(50),              -- Gain account code
  gl_account_loss         VARCHAR(50),              -- Loss account code

  -- Calculation Details
  calculation_method      VARCHAR(50),
  calculation_notes       TEXT,

  -- Audit
  calculated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  calculated_by           UUID NOT NULL,

  -- Constraints
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES revaluation_batches(batch_id) ON DELETE CASCADE,
  CONSTRAINT fk_calculated_by FOREIGN KEY (calculated_by) REFERENCES users(user_id),
  CONSTRAINT chk_rates_positive CHECK (opening_rate > 0 AND closing_rate > 0)
);

-- Indexes
CREATE INDEX idx_gain_loss_log_batch ON gain_loss_log(batch_id, account_code);
CREATE INDEX idx_gain_loss_log_account ON gain_loss_log(account_id, calculated_at DESC);
CREATE INDEX idx_gain_loss_log_currency ON gain_loss_log(currency_code, calculated_at DESC);
CREATE INDEX idx_gain_loss_log_type ON gain_loss_log(gain_loss_type, calculated_at DESC);

-- Comments
COMMENT ON TABLE gain_loss_log IS 'Detailed exchange gain/loss calculations per account';
COMMENT ON COLUMN gain_loss_log.realized_gain_loss IS 'Gain/loss on settled transactions';
COMMENT ON COLUMN gain_loss_log.unrealized_gain_loss IS 'Gain/loss on open balances';
```

**TypeScript Interface**:
```typescript
interface GainLossLog {
  log_id: string
  batch_id: string
  account_id: string
  account_code: string
  account_name: string
  currency_code: string
  opening_balance_fc: Decimal
  closing_balance_fc: Decimal
  opening_rate: Decimal
  closing_rate: Decimal
  rate_change_percentage?: Decimal
  opening_balance_bc: Decimal
  closing_balance_bc: Decimal
  realized_gain_loss: Decimal
  unrealized_gain_loss: Decimal
  total_gain_loss: Decimal
  gain_loss_type: 'gain' | 'loss' | 'none'
  is_balance_sheet: boolean
  account_type?: string
  journal_entry_line_id?: string
  gl_account_gain?: string
  gl_account_loss?: string
  calculation_method?: string
  calculation_notes?: string
  calculated_at: Date
  calculated_by: string
}
```

---

## Database Functions and Triggers

### Function: calculate_inverse_rate()

**Purpose**: Automatically calculate and update the inverse rate whenever an exchange rate is inserted or updated.

```sql
CREATE OR REPLACE FUNCTION calculate_inverse_rate()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate inverse rate with 6 decimal precision
  NEW.inverse_rate := ROUND(1.0 / NEW.exchange_rate, 6);

  -- Calculate mid_rate if buy/sell rates are provided
  IF NEW.buy_rate IS NOT NULL AND NEW.sell_rate IS NOT NULL THEN
    NEW.mid_rate := ROUND((NEW.buy_rate + NEW.sell_rate) / 2.0, 6);
    NEW.spread_percentage := ROUND(
      ((NEW.sell_rate - NEW.buy_rate) / NEW.mid_rate) * 100, 4
    );
  ELSE
    NEW.mid_rate := NEW.exchange_rate;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_inverse_rate
  BEFORE INSERT OR UPDATE OF exchange_rate, buy_rate, sell_rate
  ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION calculate_inverse_rate();
```

---

### Function: calculate_variance_from_previous()

**Purpose**: Calculate the variance percentage from the previous active rate for the same currency pair.

```sql
CREATE OR REPLACE FUNCTION calculate_variance_from_previous()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_rate DECIMAL(18, 6);
BEGIN
  -- Get the most recent active rate for this currency pair
  SELECT exchange_rate INTO v_previous_rate
  FROM exchange_rates
  WHERE source_currency = NEW.source_currency
    AND target_currency = NEW.target_currency
    AND rate_type = NEW.rate_type
    AND is_active = true
    AND rate_id != NEW.rate_id
  ORDER BY effective_date DESC
  LIMIT 1;

  -- Calculate variance percentage if previous rate exists
  IF v_previous_rate IS NOT NULL THEN
    NEW.variance_from_previous := ROUND(
      ((NEW.exchange_rate - v_previous_rate) / v_previous_rate) * 100, 4
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_variance
  BEFORE INSERT OR UPDATE OF exchange_rate
  ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION calculate_variance_from_previous();
```

---

### Function: deactivate_old_rates()

**Purpose**: Automatically deactivate old exchange rates when a new rate is approved and activated for the same currency pair and rate type.

```sql
CREATE OR REPLACE FUNCTION deactivate_old_rates()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if the new rate is being set to active and approved
  IF NEW.is_active = true AND NEW.approval_status = 'approved' THEN
    -- Deactivate all other active rates for this currency pair and rate type
    UPDATE exchange_rates
    SET
      is_active = false,
      modified_by = NEW.approved_by,
      modified_date = NOW()
    WHERE
      source_currency = NEW.source_currency
      AND target_currency = NEW.target_currency
      AND rate_type = NEW.rate_type
      AND is_active = true
      AND rate_id != NEW.rate_id
      AND approval_status = 'approved';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deactivate_old_rates
  AFTER INSERT OR UPDATE OF is_active, approval_status
  ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION deactivate_old_rates();
```

---

### Function: update_provider_health()

**Purpose**: Update rate provider health status based on success/failure patterns.

```sql
CREATE OR REPLACE FUNCTION update_provider_health()
RETURNS TRIGGER AS $$
DECLARE
  v_consecutive_failures INTEGER;
BEGIN
  -- Update provider stats
  UPDATE rate_providers
  SET
    last_update_attempt = NEW.started_at,
    total_requests = total_requests + 1,
    successful_requests = CASE WHEN NEW.status = 'success' THEN successful_requests + 1 ELSE successful_requests END,
    success_rate = ROUND(
      (successful_requests::DECIMAL / NULLIF(total_requests, 0)) * 100, 4
    ),
    last_successful_update = CASE WHEN NEW.status = 'success' THEN NEW.completed_at ELSE last_successful_update END,
    last_failure = CASE WHEN NEW.status = 'failed' THEN NEW.completed_at ELSE last_failure END,
    failure_count = CASE WHEN NEW.status = 'failed' THEN failure_count + 1 ELSE failure_count END,
    consecutive_failures = CASE
      WHEN NEW.status = 'success' THEN 0
      WHEN NEW.status = 'failed' THEN consecutive_failures + 1
      ELSE consecutive_failures
    END,
    health_status = CASE
      WHEN NEW.status = 'success' THEN 'healthy'
      WHEN NEW.status = 'failed' AND consecutive_failures + 1 >= 3 THEN 'offline'
      WHEN NEW.status = 'failed' AND consecutive_failures + 1 = 2 THEN 'failing'
      WHEN NEW.status = 'failed' THEN 'degraded'
      ELSE health_status
    END,
    average_response_time = CASE
      WHEN NEW.api_response_time IS NOT NULL THEN
        ROUND((COALESCE(average_response_time, 0) * 0.8 + NEW.api_response_time * 0.2)::INTEGER)
      ELSE average_response_time
    END
  WHERE provider_id = NEW.provider_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_provider_health
  AFTER INSERT ON rate_update_log
  FOR EACH ROW
  WHEN (NEW.provider_id IS NOT NULL)
  EXECUTE FUNCTION update_provider_health();
```

---

### Function: log_rate_changes()

**Purpose**: Maintain a comprehensive audit log of all changes to exchange rates.

```sql
CREATE TABLE exchange_rate_audit (
  audit_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_id                 UUID NOT NULL,
  operation               VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values              JSONB,
  new_values              JSONB,
  changed_by              UUID,
  changed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_reason           TEXT
);

CREATE OR REPLACE FUNCTION log_rate_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO exchange_rate_audit (rate_id, operation, new_values, changed_by)
    VALUES (NEW.rate_id, 'INSERT', row_to_json(NEW)::JSONB, NEW.created_by);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO exchange_rate_audit (rate_id, operation, old_values, new_values, changed_by)
    VALUES (NEW.rate_id, 'UPDATE', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, NEW.modified_by);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO exchange_rate_audit (rate_id, operation, old_values, changed_by)
    VALUES (OLD.rate_id, 'DELETE', row_to_json(OLD)::JSONB, OLD.modified_by);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_rate_changes
  AFTER INSERT OR UPDATE OR DELETE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION log_rate_changes();
```

---

## Materialized Views

### View: mv_active_exchange_rates

**Purpose**: Fast lookup of currently active exchange rates for all currency pairs.

```sql
CREATE MATERIALIZED VIEW mv_active_exchange_rates AS
SELECT
  source_currency,
  target_currency,
  rate_type,
  exchange_rate,
  inverse_rate,
  mid_rate,
  effective_date,
  rate_source,
  provider_id,
  confidence_level
FROM exchange_rates
WHERE is_active = true
  AND approval_status = 'approved'
  AND (effective_until IS NULL OR effective_until > NOW());

-- Indexes on materialized view
CREATE UNIQUE INDEX idx_mv_active_rates_pair ON mv_active_exchange_rates(source_currency, target_currency, rate_type);
CREATE INDEX idx_mv_active_rates_source ON mv_active_exchange_rates(source_currency);

-- Refresh strategy: Real-time via trigger or scheduled refresh every 15 minutes
CREATE OR REPLACE FUNCTION refresh_active_rates()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_exchange_rates;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_active_rates
  AFTER INSERT OR UPDATE OF is_active, approval_status ON exchange_rates
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_active_rates();
```

---

### View: mv_rate_provider_stats

**Purpose**: Aggregated statistics for rate provider performance monitoring.

```sql
CREATE MATERIALIZED VIEW mv_rate_provider_stats AS
SELECT
  rp.provider_id,
  rp.provider_name,
  rp.is_active,
  rp.health_status,
  rp.last_successful_update,
  rp.consecutive_failures,
  rp.success_rate,
  COUNT(DISTINCT rul.log_id) AS total_updates,
  COUNT(DISTINCT rul.log_id) FILTER (WHERE rul.status = 'success') AS successful_updates,
  COUNT(DISTINCT rul.log_id) FILTER (WHERE rul.status = 'failed') AS failed_updates,
  AVG(rul.duration_ms) FILTER (WHERE rul.status = 'success') AS avg_update_duration,
  MAX(rul.started_at) AS last_update_attempt
FROM rate_providers rp
LEFT JOIN rate_update_log rul ON rp.provider_id = rul.provider_id
  AND rul.started_at > NOW() - INTERVAL '30 days'
GROUP BY rp.provider_id, rp.provider_name, rp.is_active, rp.health_status,
         rp.last_successful_update, rp.consecutive_failures, rp.success_rate;

-- Refresh every hour
CREATE INDEX idx_mv_provider_stats_id ON mv_rate_provider_stats(provider_id);
```

---

## Row-Level Security (RLS) Policies

### Exchange Rates RLS

```sql
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- View policy: All authenticated users can view approved, active rates
CREATE POLICY select_active_rates ON exchange_rates
  FOR SELECT
  USING (
    is_active = true
    AND approval_status = 'approved'
  );

-- View policy: Finance team can view all rates
CREATE POLICY select_finance_rates ON exchange_rates
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('finance_manager', 'finance_controller', 'cfo', 'accountant')
  );

-- Insert policy: Only finance team can create rates
CREATE POLICY insert_rates ON exchange_rates
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('finance_manager', 'finance_controller', 'accountant')
  );

-- Update policy: Finance managers can approve/reject, creators can edit pending
CREATE POLICY update_rates ON exchange_rates
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role' IN ('finance_manager', 'finance_controller', 'cfo') AND approval_status = 'pending')
    OR (created_by = auth.uid() AND approval_status = 'pending')
  );

-- Delete policy: Only finance controllers can delete (soft delete preferred)
CREATE POLICY delete_rates ON exchange_rates
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('finance_controller', 'cfo')
  );
```

---

## Data Relationships

### Entity Relationship Diagram

```
┌─────────────────────┐
│   rate_providers    │
│─────────────────────│
│ provider_id (PK)    │──┐
│ provider_name       │  │
│ api_endpoint        │  │
│ update_schedule     │  │
│ is_active           │  │
│ health_status       │  │
└─────────────────────┘  │
                         │
                         │ 1:N
                         ▼
┌─────────────────────┐  ┌─────────────────────┐
│  exchange_rates     │  │  rate_update_log    │
│─────────────────────│  │─────────────────────│
│ rate_id (PK)        │  │ log_id (PK)         │
│ source_currency     │  │ provider_id (FK)    │
│ target_currency     │  │ update_source       │
│ exchange_rate       │  │ status              │
│ rate_type           │  │ rates_inserted      │
│ provider_id (FK)    │──┤ started_at          │
│ is_active           │  └─────────────────────┘
│ approval_status     │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│currency_conversions │
│─────────────────────│
│ conversion_id (PK)  │
│ rate_id (FK)        │
│ source_currency     │
│ target_currency     │
│ source_amount       │
│ target_amount       │
│ conversion_date     │
└─────────────────────┘

┌─────────────────────┐
│revaluation_batches  │
│─────────────────────│
│ batch_id (PK)       │──┐
│ batch_number        │  │
│ revaluation_date    │  │
│ status              │  │
│ net_gain_loss       │  │
└─────────────────────┘  │
                         │ 1:N
                         ▼
┌─────────────────────┐
│  gain_loss_log      │
│─────────────────────│
│ log_id (PK)         │
│ batch_id (FK)       │
│ account_code        │
│ currency_code       │
│ total_gain_loss     │
│ gain_loss_type      │
└─────────────────────┘
```

---

## Data Migration Scripts

### Initial Setup Script

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables in correct order
\i 01_create_rate_providers.sql
\i 02_create_exchange_rates.sql
\i 03_create_rate_update_log.sql
\i 04_create_currency_conversions.sql
\i 05_create_revaluation_batches.sql
\i 06_create_gain_loss_log.sql
\i 07_create_exchange_rate_audit.sql

-- Create functions and triggers
\i 08_create_functions.sql
\i 09_create_triggers.sql

-- Create indexes
\i 10_create_indexes.sql

-- Create materialized views
\i 11_create_materialized_views.sql

-- Apply RLS policies
\i 12_apply_rls_policies.sql

-- Insert seed data
\i 13_seed_data.sql
```

---

## Performance Optimization

### Index Strategy

1. **Primary Keys**: UUID with gen_random_uuid() for distributed systems
2. **Foreign Keys**: Indexed automatically for join performance
3. **Lookup Patterns**: Composite indexes on (source_currency, target_currency, effective_date)
4. **Partial Indexes**: WHERE clauses for is_active, approval_status = 'pending'
5. **Covering Indexes**: Include frequently accessed columns in index

### Partitioning Strategy

For high-volume systems (>1M rows), consider partitioning:

```sql
-- Partition rate_update_log by month
CREATE TABLE rate_update_log_2025_01 PARTITION OF rate_update_log
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Partition currency_conversions by month
CREATE TABLE currency_conversions_2025_01 PARTITION OF currency_conversions
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### Caching Strategy

1. **Active Rates**: Cache in Redis with 15-minute TTL
2. **Provider Config**: Cache in application memory
3. **Materialized Views**: Refresh every 15 minutes or on-demand

---

## Data Integrity Checks

### Validation Queries

```sql
-- Check for duplicate active rates
SELECT source_currency, target_currency, rate_type, COUNT(*)
FROM exchange_rates
WHERE is_active = true AND approval_status = 'approved'
GROUP BY source_currency, target_currency, rate_type
HAVING COUNT(*) > 1;

-- Check for missing inverse rates
SELECT rate_id, source_currency, target_currency, exchange_rate, inverse_rate
FROM exchange_rates
WHERE ABS((1.0 / exchange_rate) - inverse_rate) > 0.000001;

-- Check for orphaned conversions
SELECT COUNT(*)
FROM currency_conversions cc
LEFT JOIN exchange_rates er ON cc.rate_id = er.rate_id
WHERE cc.rate_id IS NOT NULL AND er.rate_id IS NULL;

-- Check revaluation batch consistency
SELECT batch_id, net_gain_loss,
       (total_realized_gain - total_realized_loss +
        total_unrealized_gain - total_unrealized_loss) AS calculated_net
FROM revaluation_batches
WHERE ABS(net_gain_loss - calculated_net) > 0.01;
```

---

## Backup and Recovery

### Backup Strategy

```sql
-- Full backup
pg_dump -Fc -f exchange_rates_backup_$(date +%Y%m%d).dump carmen_db

-- Table-specific backup
pg_dump -Fc -t exchange_rates -t rate_providers -f rates_backup.dump carmen_db

-- Point-in-time recovery setup
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /path/to/archive/%f';
```

### Recovery Procedures

```sql
-- Restore full database
pg_restore -d carmen_db exchange_rates_backup_20250113.dump

-- Restore specific table
pg_restore -d carmen_db -t exchange_rates rates_backup.dump

-- Point-in-time recovery
pg_restore -d carmen_db -T 2025-01-13 12:00:00 backup.dump
```

---

## Appendix

### Data Type Reference

| Data Type | Usage | Precision | Example |
|-----------|-------|-----------|---------|
| UUID | Primary keys, foreign keys | 128-bit | a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11 |
| VARCHAR(n) | Short text, codes | Variable, max n | 'USD', 'Bloomberg' |
| TEXT | Long text, notes | Unlimited | 'Detailed explanation...' |
| DECIMAL(p,s) | Monetary values, rates | p digits, s decimal places | 1234.567890 |
| BOOLEAN | True/false flags | 1 bit | true, false |
| TIMESTAMPTZ | Timestamps with timezone | Microsecond precision | '2025-01-13 14:30:00+00' |
| DATE | Dates without time | Day precision | '2025-01-13' |
| JSONB | Semi-structured data | Variable | {"key": "value"} |
| INTEGER | Counts, durations | 32-bit | 123456 |
| INET | IP addresses | 128-bit | '192.168.1.1' |
| TEXT[] | Array of text | Variable | {'USD', 'EUR', 'GBP'} |

### Naming Conventions

- **Tables**: Plural, lowercase, underscore_separated (exchange_rates)
- **Columns**: Singular, lowercase, underscore_separated (source_currency)
- **Primary Keys**: table_id (rate_id, provider_id)
- **Foreign Keys**: referenced_table_id (provider_id references rate_providers)
- **Indexes**: idx_table_columns (idx_exchange_rates_currencies)
- **Constraints**: type_table_description (fk_rate_provider, chk_positive_rates)
- **Functions**: verb_noun() (calculate_inverse_rate)
- **Triggers**: trg_action_description (trg_calculate_inverse_rate)

---

## References

- **BR-exchange-rate-management.md**: Business requirements and functional specifications
- **UC-exchange-rate-management.md**: Detailed use cases and user workflows
- **TS-exchange-rate-management.md**: Technical specification and architecture
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **IAS 21**: The Effects of Changes in Foreign Exchange Rates
