# VAL-CUR: Currency Management Validation Rules

**Module**: Finance
**Sub-Module**: Currency Management
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Status**: Draft

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Currency Management module to ensure multi-currency data integrity, prevent exchange rate errors, maintain compliance with IAS 21 accounting standards, and protect against financial losses from currency miscalculations. Critical validations include ISO 4217 currency codes, exchange rate reasonableness bounds, dual currency balance verification, and period-end revaluation controls. Invalid currency data can result in incorrect financial statements, exchange gain/loss miscalculations, regulatory non-compliance, and significant financial exposure.

### 1.2 Scope

This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation
- **Server-Side**: Security and business rule enforcement
- **Database**: Final data integrity constraints

### 1.3 Validation Strategy

```
User Input
    ↓
[Client-Side Validation] ← Immediate feedback, UX
    ↓
[Server-Side Validation] ← Security, business rules
    ↓
[Database Constraints] ← Final enforcement
    ↓
Data Stored
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Currency and exchange rate data requires strictest validation (zero tolerance for errors)
3. Provide immediate user feedback when possible
4. Use clear, actionable error messages in user's language
5. Enforce IAS 21 accounting standards consistently
6. Prevent security vulnerabilities (SQL injection, XSS)
7. Use high-precision decimal arithmetic (Decimal.js) to avoid floating point errors

---

## 2. Field-Level Validations (VAL-CUR-001 to 099)

### VAL-CUR-001: currency_code - ISO 4217 Format Validation

**Field**: `currency_code`
**Database Column**: `currencies.currency_code`
**Data Type**: VARCHAR(3) / string

**Validation Rule**: Currency code must be exactly 3 uppercase letters conforming to ISO 4217 standard.

**Format Requirements**:
- Length: Exactly 3 characters
- Characters: Uppercase letters A-Z only (no numbers, no special characters)
- Standard: Must exist in ISO 4217 currency code list
- Examples: USD, GBP, EUR, JPY, SGD, CNY, INR, AUD

**Implementation Requirements**:
- **Client-Side**: Dropdown with ISO 4217 currency list, searchable, auto-uppercase input
- **Server-Side**: Validate against ISO 4217 list, verify uppercase, check length = 3
- **Database**: VARCHAR(3) NOT NULL, CHECK (currency_code ~ '^[A-Z]{3}$'), UNIQUE

**Error Codes**:
- VAL-CUR-001A: "Currency code is required"
- VAL-CUR-001B: "Currency code must be exactly 3 uppercase letters (e.g., USD, GBP, EUR)"
- VAL-CUR-001C: "Currency code '{code}' is not a valid ISO 4217 code"

**User Action**: User must select valid ISO 4217 currency code from dropdown.

**Test Cases**:
- ✅ Valid: "USD" (United States Dollar)
- ✅ Valid: "GBP" (British Pound Sterling)
- ✅ Valid: "EUR" (Euro)
- ✅ Valid: "JPY" (Japanese Yen)
- ❌ Invalid: "" (empty)
- ❌ Invalid: "usd" (lowercase)
- ❌ Invalid: "US" (too short)
- ❌ Invalid: "USDD" (too long)
- ❌ Invalid: "US1" (contains number)
- ❌ Invalid: "ABC" (not in ISO 4217 list)

---

### VAL-CUR-002: exchange_rate - Decimal Precision Validation

**Field**: `exchange_rate`
**Database Column**: `exchange_rates.exchange_rate`
**Data Type**: NUMERIC(18,8) / Decimal

**Validation Rule**: Exchange rate must be positive number with maximum 8 decimal places for high precision.

**Precision Requirements**:
- Decimal places: Maximum 8 decimals (e.g., 1.27500000)
- Minimum value: 0.0001 (prevents division by zero and unrealistic rates)
- Maximum value: 10,000 (prevents data entry errors)
- Use Decimal.js for calculations to avoid floating point errors

**Implementation Requirements**:
- **Client-Side**: Number input with 8 decimal places, real-time precision validation
- **Server-Side**: Validate using Decimal.js, check decimal places <= 8, verify bounds
- **Database**: NUMERIC(18,8) NOT NULL, CHECK (exchange_rate BETWEEN 0.0001 AND 10000)

**Error Codes**:
- VAL-CUR-002A: "Exchange rate is required"
- VAL-CUR-002B: "Exchange rate must be a positive number"
- VAL-CUR-002C: "Exchange rate must have at most 8 decimal places"
- VAL-CUR-002D: "Exchange rate must be between 0.0001 and 10,000"

**User Action**: User must enter valid exchange rate within bounds with proper precision.

**Test Cases**:
- ✅ Valid: 1.27500000 (8 decimals, typical GBP/USD)
- ✅ Valid: 0.0074 (4 decimals, typical JPY/USD inverted)
- ✅ Valid: 135.50 (2 decimals, typical USD/JPY)
- ✅ Valid: 0.0001 (boundary minimum)
- ✅ Valid: 10000 (boundary maximum)
- ❌ Invalid: 0 (zero not allowed)
- ❌ Invalid: -1.2750 (negative not allowed)
- ❌ Invalid: 1.275000001 (9 decimals, too many)
- ❌ Invalid: 0.00001 (below minimum)
- ❌ Invalid: 15000 (above maximum)

---

### VAL-CUR-003: transaction_amount - Monetary Value Validation

**Field**: `transaction_amount`, `base_amount`
**Database Column**: `foreign_currency_transactions.transaction_amount`, `foreign_currency_transactions.base_amount`
**Data Type**: NUMERIC(15,2) / Decimal

**Validation Rule**: Monetary amounts must be non-negative with exactly 2 decimal places.

**Implementation Requirements**:
- **Client-Side**: Currency input mask, format as user types, show currency symbol
- **Server-Side**: Validate using Decimal.js, check decimal places = 2, verify >= 0
- **Database**: NUMERIC(15,2) NOT NULL, CHECK >= 0

**Error Codes**:
- VAL-CUR-003A: "Amount is required"
- VAL-CUR-003B: "Amount must be greater than or equal to zero"
- VAL-CUR-003C: "Amount must have exactly 2 decimal places"
- VAL-CUR-003D: "Amount exceeds maximum allowed (999,999,999,999.99)"

**User Action**: User must enter valid monetary amount with 2 decimal places.

**Test Cases**:
- ✅ Valid: 1234.56
- ✅ Valid: 0.00 (zero allowed for some transactions)
- ✅ Valid: 999999999999.99 (maximum)
- ❌ Invalid: -100.00 (negative)
- ❌ Invalid: 123.456 (3 decimals)
- ❌ Invalid: 1234 (missing decimals)

---

### VAL-CUR-004: minor_unit - Range Validation

**Field**: `minor_unit`
**Database Column**: `currencies.minor_unit`
**Data Type**: INTEGER / number

**Validation Rule**: Minor unit (decimal places) must be between 0 and 4.

**Common Values**:
- 0: Japanese Yen (JPY), Korean Won (KRW) - no decimals
- 2: US Dollar (USD), British Pound (GBP), Euro (EUR) - cents
- 3: Bahraini Dinar (BHD), Kuwaiti Dinar (KWD) - thousandths
- 4: Rare currencies with very small units

**Implementation Requirements**:
- **Client-Side**: Number input with min=0, max=4
- **Server-Side**: Validate range 0-4
- **Database**: INTEGER NOT NULL, CHECK BETWEEN 0 AND 4

**Error Code**: VAL-CUR-004
**Error Message**: "Minor unit must be between 0 and 4"

**Test Cases**:
- ✅ Valid: 0 (JPY)
- ✅ Valid: 2 (USD, GBP, EUR)
- ✅ Valid: 3 (BHD)
- ❌ Invalid: -1 (negative)
- ❌ Invalid: 5 (above maximum)

---

### VAL-CUR-005: is_base_currency - Uniqueness Validation

**Field**: `is_base_currency`
**Database Column**: `currencies.is_base_currency`
**Data Type**: BOOLEAN / boolean

**Validation Rule**: Only one currency per organization can have is_base_currency = true.

**Business Rationale**: Organization must have exactly one base currency for financial reporting. All foreign currency amounts converted to base currency.

**Implementation Requirements**:
- **Client-Side**: Display warning when trying to set another currency as base
- **Server-Side**: Query existing base currency, reject if attempting to set second base currency
- **Database**: UNIQUE partial index WHERE is_base_currency = true

**Error Code**: VAL-CUR-005
**Error Message**: "Only one base currency allowed. Current base currency is {currency_code}. To change, first unset the existing base currency."

**User Action**: User must unset current base currency before setting new one (or use "Change Base Currency" wizard).

**Test Cases**:
- ✅ Valid: First currency set as base (USD)
- ✅ Valid: Setting is_base_currency = false for non-base currency
- ❌ Invalid: Setting second currency as base while USD already base

---

### VAL-CUR-006: rate_date - Date Validation

**Field**: `rate_date`
**Database Column**: `exchange_rates.rate_date`
**Data Type**: DATE / Date

**Validation Rule**: Rate date must not be more than 30 days in future, and not more than 10 years in past.

**Implementation Requirements**:
- **Client-Side**: Date picker with min/max constraints
- **Server-Side**: Validate date range
- **Database**: DATE NOT NULL, CHECK constraints

**Error Codes**:
- VAL-CUR-006A: "Rate date is required"
- VAL-CUR-006B: "Rate date cannot be more than 30 days in the future"
- VAL-CUR-006C: "Rate date cannot be more than 10 years in the past"

**Test Cases**:
- ✅ Valid: Today
- ✅ Valid: Yesterday
- ✅ Valid: 7 days from now (for scheduled rates)
- ❌ Invalid: 31 days from now (too far future)
- ❌ Invalid: 11 years ago (too far past)

---

### VAL-CUR-007: settlement_date - Conditional Required Validation

**Field**: `settlement_date`
**Database Column**: `foreign_currency_transactions.settlement_date`
**Data Type**: DATE / Date

**Validation Rule**: Settlement date is required when settlement_rate is provided, and must be >= transaction_date.

**Implementation Requirements**:
- **Client-Side**: Show settlement_date field only when settlement_rate entered, validate >= transaction_date
- **Server-Side**: Validate co-presence, date comparison
- **Database**: CHECK ((settlement_date IS NULL) = (settlement_rate IS NULL)), CHECK (settlement_date >= transaction_date OR settlement_date IS NULL)

**Error Codes**:
- VAL-CUR-007A: "Settlement date required when settlement rate provided"
- VAL-CUR-007B: "Settlement date must be on or after transaction date"

**Test Cases**:
- ✅ Valid: Transaction 2025-11-12, Settlement 2025-11-20, both dates provided
- ✅ Valid: Transaction 2025-11-12, Settlement NULL (unsettled)
- ❌ Invalid: Settlement rate provided but no settlement date
- ❌ Invalid: Settlement 2025-11-10, Transaction 2025-11-12 (settlement before transaction)

---

### VAL-CUR-008: revaluation_number - Format Validation

**Field**: `revaluation_number`
**Database Column**: `currency_revaluations.revaluation_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: Revaluation number must follow format REVAL-YYYY-MM-NNN (e.g., REVAL-2025-11-001).

**Format Requirements**:
- Prefix: "REVAL-"
- Year: 4 digits (YYYY)
- Month: 2 digits (MM)
- Sequence: 3 digits (NNN), auto-incremented within month

**Implementation Requirements**:
- **Client-Side**: Display format hint, auto-generate on create
- **Server-Side**: Generate number, validate format if manually provided
- **Database**: VARCHAR(50) NOT NULL, UNIQUE, CHECK format with regex

**Error Code**: VAL-CUR-008
**Error Message**: "Revaluation number must be in format REVAL-YYYY-MM-NNN (e.g., REVAL-2025-11-001)"

**Test Cases**:
- ✅ Valid: "REVAL-2025-11-001"
- ✅ Valid: "REVAL-2025-12-042"
- ❌ Invalid: "REV-2025-11-001" (wrong prefix)
- ❌ Invalid: "REVAL-25-11-001" (year 2 digits)
- ❌ Invalid: "REVAL-2025-1-001" (month 1 digit)

---

### VAL-CUR-009: api_key - Security Validation

**Field**: `api_key`
**Database Column**: `currency_providers.api_key`
**Data Type**: TEXT (encrypted) / string

**Validation Rule**: API key must be provided if authentication_type = 'api_key', minimum 16 characters, stored encrypted.

**Implementation Requirements**:
- **Client-Side**: Password field (masked), minimum 16 characters
- **Server-Side**: Encrypt using AES-256 before storing, validate length
- **Database**: TEXT, encrypted at rest, never logged

**Error Codes**:
- VAL-CUR-009A: "API key is required for API key authentication"
- VAL-CUR-009B: "API key must be at least 16 characters"

**Security Note**: API keys never appear in logs or error messages. Stored encrypted in database.

**Test Cases**:
- ✅ Valid: {32 character API key} (encrypted before storage)
- ❌ Invalid: "" (empty when auth_type = api_key)
- ❌ Invalid: "abc123" (too short, < 16 characters)

---

### VAL-CUR-010: cache_ttl_seconds - Range Validation

**Field**: `cache_ttl_seconds`
**Database Column**: `currency_providers.cache_ttl_seconds`
**Data Type**: INTEGER / number

**Validation Rule**: Cache TTL must be between 300 (5 minutes) and 7200 (2 hours) seconds.

**Rationale**: Too short TTL causes excessive API calls (rate limit, cost). Too long TTL provides stale rates for volatile currencies.

**Implementation Requirements**:
- **Client-Side**: Number input with slider, show human-readable duration
- **Server-Side**: Validate range
- **Database**: INTEGER, CHECK BETWEEN 300 AND 7200

**Error Code**: VAL-CUR-010
**Error Message**: "Cache TTL must be between 300 (5 minutes) and 7200 (2 hours) seconds"

**Test Cases**:
- ✅ Valid: 3600 (1 hour, typical)
- ✅ Valid: 300 (5 minutes, minimum)
- ✅ Valid: 7200 (2 hours, maximum)
- ❌ Invalid: 60 (1 minute, too short)
- ❌ Invalid: 10800 (3 hours, too long)

---

## 3. Business Rule Validations (VAL-CUR-101 to 199)

### VAL-CUR-101: Dual Currency Balance Verification

**Validation Rule**: For every foreign currency transaction, the base_amount must equal transaction_amount × exchange_rate within tolerance of $0.01.

**Mathematical Formula**: `base_amount = transaction_amount × exchange_rate` (with rounding to 2 decimals)

**Tolerance**: $0.01 to account for rounding in multi-step calculations

**Implementation Requirements**:
- **Client-Side**: Calculate base_amount in real-time as user enters transaction_amount, display both amounts
- **Server-Side**: Recalculate using Decimal.js, verify match within tolerance, reject if difference > $0.01
- **Database**: Trigger verifies calculation on INSERT/UPDATE

**Error Code**: VAL-CUR-101
**Error Message**: "Dual currency calculation mismatch. Expected: ${expected}, Provided: ${provided}, Difference: ${diff}. Transaction amount × exchange rate must equal base amount."

**User Action**: System auto-corrects calculation. If manual override needed, requires Treasury Manager approval.

**Calculation Example**:
```
Transaction Amount: £900.00 GBP
Exchange Rate: 1.27500000 USD/GBP
Expected Base Amount: £900.00 × 1.27500000 = $1,147.50 USD
Tolerance: ±$0.01

Valid Base Amounts: $1,147.49 to $1,147.51
```

**Test Cases**:
- ✅ Valid: £900.00 × 1.2750 = $1,147.50 (exact match)
- ✅ Valid: £900.00 × 1.2750 = $1,147.51 (within $0.01 tolerance)
- ❌ Invalid: £900.00 × 1.2750 ≠ $1,150.00 (difference $2.50 > tolerance)
- ❌ Invalid: £900.00 × 1.2750 ≠ $1,147.00 (difference $0.50 > tolerance)

---

### VAL-CUR-102: Exchange Rate Variance Check

**Validation Rule**: Exchange rates that differ by more than 10% from previous day's rate must be flagged for review. Rates differing by more than 5% from previous day require Treasury Manager approval for manual entries.

**Variance Calculation**: `|new_rate - previous_rate| / previous_rate × 100%`

**Thresholds**:
- 0-5%: Auto-accept
- 5-10%: Require Treasury Manager approval
- >10%: Require Treasury Manager approval + automated alert to Controller

**Implementation Requirements**:
- **Client-Side**: Show variance percentage when manual rate entered, display warning badge
- **Server-Side**: Retrieve previous day rate, calculate variance, route for approval if needed
- **Database**: Store variance_from_previous in exchange_rates table

**Error Codes**:
- VAL-CUR-102A (Warning): "Rate variance {pct}% from previous day ({prev_rate}). Please verify rate is correct."
- VAL-CUR-102B (Approval): "Rate variance {pct}% requires Treasury Manager approval."
- VAL-CUR-102C (Alert): "High variance {pct}% detected. Controller has been notified."

**User Action**: For variance >5%, user must provide reason in manual_entry_reason field and await Treasury Manager approval.

**Variance Examples**:
```
Previous Rate: 1.2750 USD/GBP
New Rate: 1.2800 USD/GBP
Variance: |1.2800 - 1.2750| / 1.2750 × 100% = 0.39%
Result: ✅ Auto-accept (< 5%)

Previous Rate: 1.2750 USD/GBP
New Rate: 1.3500 USD/GBP
Variance: |1.3500 - 1.2750| / 1.2750 × 100% = 5.88%
Result: ⚠️ Requires Treasury Manager approval (5-10%)

Previous Rate: 1.2750 USD/GBP
New Rate: 1.4500 USD/GBP
Variance: |1.4500 - 1.2750| / 1.2750 × 100% = 13.73%
Result: 🚨 Requires approval + Controller alert (>10%)
```

**Test Cases**:
- ✅ Valid: Variance 0.39% (auto-accept)
- ⚠️ Warning: Variance 5.88% (requires approval)
- 🚨 Alert: Variance 13.73% (requires approval + alert)

---

### VAL-CUR-103: Period Must Be Open for Revaluation

**Validation Rule**: Currency revaluations can only be performed when target accounting period status = 'Open'.

**Implementation Requirements**:
- **Client-Side**: Period dropdown filters to show only open periods
- **Server-Side**: Query period status, reject if not 'Open'
- **Database**: Foreign key to accounting_periods with status check

**Error Code**: VAL-CUR-103
**Error Message**: "Cannot run revaluation for {period} - period is {status}. Revaluations can only be performed on open periods. Current open period is {current_period}."

**User Action**: User must change revaluation period to current open period or request period reopen from Controller.

**Test Cases**:
- ✅ Valid: Period "2025-11" with status "Open"
- ❌ Invalid: Period "2025-10" with status "Closed"
- ❌ Invalid: Period "2025-12" with status "Draft" (future period)

---

### VAL-CUR-104: Only Monetary Items Revalued

**Validation Rule**: Period-end currency revaluation must include only monetary items (AR, AP, Cash, Loans). Non-monetary items (Inventory, Fixed Assets, Prepaid) excluded.

**Monetary Item Account Types**:
- ✅ 1000-1999: Cash and Cash Equivalents
- ✅ 1100-1299: Accounts Receivable (trade)
- ✅ 1300-1399: Other Receivables
- ✅ 2000-2199: Accounts Payable (trade)
- ✅ 2200-2299: Other Payables
- ✅ 2500-2699: Loans and Borrowings

**Non-Monetary Item Account Types** (excluded):
- ❌ 1400-1599: Inventory
- ❌ 1600-1999: Fixed Assets
- ❌ 1300-1320: Prepaid Expenses

**Implementation Requirements**:
- **Client-Side**: N/A (system-determined)
- **Server-Side**: Filter accounts by monetary_item = true flag in gl_accounts table
- **Database**: Query only accounts where monetary_item = true

**Error Code**: VAL-CUR-104
**Error Message**: "Account {account_code} is non-monetary and excluded from revaluation. Only monetary items (AR, AP, Cash, Loans) are revalued per IAS 21."

**User Action**: System automatically excludes non-monetary items. No user action required.

**IAS 21 Reference**: Per IAS 21 para 23, only monetary items (items to be received or paid in fixed or determinable number of currency units) are revalued at period-end.

---

### VAL-CUR-105: Transaction Currency Must Differ from Base Currency

**Validation Rule**: Foreign currency transactions must have transaction_currency different from organization's base_currency.

**Rationale**: If transaction currency = base currency, it's a base currency transaction, not a foreign currency transaction. Use standard journal entry instead.

**Implementation Requirements**:
- **Client-Side**: Filter currency dropdown to exclude base currency
- **Server-Side**: Query base currency, verify transaction_currency ≠ base_currency
- **Database**: CHECK constraint

**Error Code**: VAL-CUR-105
**Error Message**: "Transaction currency {currency} is the base currency. Foreign currency transactions require a currency different from base. Use standard journal entry for base currency transactions."

**User Action**: User must select different transaction currency or use standard journal entry posting.

**Test Cases**:
- ✅ Valid: Base USD, Transaction GBP (different)
- ✅ Valid: Base USD, Transaction EUR (different)
- ❌ Invalid: Base USD, Transaction USD (same)

---

### VAL-CUR-106: Settlement Rate Required for Realized Gain/Loss

**Validation Rule**: When recording realized exchange gain/loss on settlement, both settlement_date and settlement_rate must be provided.

**Implementation Requirements**:
- **Client-Side**: When user marks transaction as "Settled", require both settlement fields
- **Server-Side**: Validate both present together
- **Database**: CHECK ((settlement_date IS NULL AND settlement_rate IS NULL) OR (settlement_date IS NOT NULL AND settlement_rate IS NOT NULL))

**Error Codes**:
- VAL-CUR-106A: "Settlement rate required when settlement date provided"
- VAL-CUR-106B: "Settlement date required when settlement rate provided"

**Test Cases**:
- ✅ Valid: Both NULL (unsettled)
- ✅ Valid: Both provided (settled)
- ❌ Invalid: Settlement date provided, settlement rate NULL
- ❌ Invalid: Settlement rate provided, settlement date NULL

---

### VAL-CUR-107: Revaluation Requires Unrealized Gain/Loss Account

**Validation Rule**: Before performing period-end revaluation, unrealized gain/loss GL account must be configured (typically 7210 - Unrealized Exchange Gain/Loss).

**Implementation Requirements**:
- **Client-Side**: Display warning if account not configured, provide link to Account Code Mapping
- **Server-Side**: Query Account Code Mapping for account code 7210, reject revaluation if not found
- **Database**: N/A (integration check)

**Error Code**: VAL-CUR-107
**Error Message**: "Unrealized exchange gain/loss account (7210) not configured. Please set up account in Account Code Mapping before performing revaluation."

**User Action**: User must configure GL account 7210 in Account Code Mapping module before proceeding.

**Related Accounts**:
- 7200: Realized Exchange Gain/Loss (for settlements)
- 7210: Unrealized Exchange Gain/Loss (for revaluations)
- 7250: Currency Translation Adjustment (for consolidated entities)

---

### VAL-CUR-108: Revaluation Must Balance

**Validation Rule**: Total of all revaluation line adjustments must equal journal entry amount within tolerance of $0.01.

**Mathematical Formula**: `SUM(revaluation_lines.unrealized_gain_loss) = journal_entry.net_amount`

**Implementation Requirements**:
- **Client-Side**: Display running total of gains/losses, show net impact
- **Server-Side**: Calculate sum of all line gains/losses, verify matches JE amount
- **Database**: CHECK constraint on revaluation header

**Error Code**: VAL-CUR-108
**Error Message**: "Revaluation line totals do not match journal entry amount. Line total: ${line_total}, JE amount: ${je_amount}, Difference: ${diff}"

**User Action**: System auto-corrects calculation. If mismatch persists, contact administrator.

**Example**:
```
Revaluation Lines:
  AR GBP £15,000: Gain $100
  AP EUR €15,000: Loss $75
  Cash GBP £20,000: Gain $100

Line Total: $100 - $75 + $100 = $125 (Net Gain)

Journal Entry:
  Debit  1200 - AR (GBP)      $100
  Debit  1110 - Cash (GBP)    $100
  Credit 2100 - AP (EUR)      $75
  Credit 7210 - Unrealized G/L $125

JE Net Impact: $125 (Credit to P&L)

Validation: $125 = $125 ✅
```

---

### VAL-CUR-109: Immutable Exchange Rates After Use

**Validation Rule**: Exchange rates that have been used in at least one transaction cannot be modified or deleted. Historical integrity preserved.

**Implementation Requirements**:
- **Client-Side**: Disable edit/delete buttons for rates with usage_count > 0
- **Server-Side**: Check usage_count before UPDATE/DELETE, reject if > 0
- **Database**: Trigger prevents UPDATE/DELETE when usage_count > 0

**Error Code**: VAL-CUR-109
**Error Message**: "Exchange rate has been used in {usage_count} transaction(s) and cannot be modified. Historical rates are immutable."

**User Action**: User cannot modify. To correct rate errors, must create new rate entry for current date forward.

**Rate Correction Process**:
1. Identify incorrect rate (e.g., 1.2750 on 2025-11-12)
2. Create new rate entry with correct rate for today forward
3. Original incorrect rate remains in history (immutable)
4. New transactions use corrected rate

---

### VAL-CUR-110: Automatic Reversal Scheduling Required

**Validation Rule**: All period-end currency revaluations must have automatic_reversal_scheduled = true with reversal scheduled for first day of next period.

**Rationale**: Per IAS 21, unrealized gains/losses from revaluation must be reversed at start of next period to restore original carrying amounts.

**Implementation Requirements**:
- **Client-Side**: Checkbox "Schedule Automatic Reversal" default checked, disable if unchecking requires CFO approval
- **Server-Side**: Verify automatic_reversal_scheduled = true, create scheduled cron job for reversal
- **Database**: CHECK constraint (automatic_reversal_scheduled = true)

**Error Code**: VAL-CUR-110
**Error Message**: "Period-end revaluations require automatic reversal scheduled for next period start per IAS 21. Reversal will be posted on {reversal_date}."

**User Action**: User must keep automatic reversal enabled. Disabling requires CFO approval and justification.

**Reversal Schedule Example**:
```
Revaluation Posted: 2025-11-30 (end of November)
Reversal Scheduled: 2025-12-01 00:00:00 (start of December)
Cron Job: Automatically posts reversal entry with opposite amounts
```

---

### VAL-CUR-111: No Duplicate Revaluations for Period

**Validation Rule**: Only one non-reversed revaluation allowed per period-currency combination.

**Implementation Requirements**:
- **Client-Side**: Display warning if existing revaluation found
- **Server-Side**: Query for existing revaluation (period, currency, is_reversed = false), reject duplicate
- **Database**: UNIQUE constraint (period_id, currency_code) WHERE is_reversed = false

**Error Code**: VAL-CUR-111
**Error Message**: "Revaluation already exists for {period} - {currency} (Revaluation #{existing_number}). Cannot create duplicate revaluation. To revalue again, first reverse existing revaluation."

**User Action**: User must reverse existing revaluation before creating new one, or edit existing revaluation if still in Draft status.

**Test Cases**:
- ✅ Valid: First revaluation for Nov 2025 - GBP
- ✅ Valid: Second revaluation for Nov 2025 - EUR (different currency)
- ✅ Valid: Revaluation for Dec 2025 - GBP (different period)
- ❌ Invalid: Second revaluation for Nov 2025 - GBP (duplicate)

---

### VAL-CUR-112: Currency Provider Priority Validation

**Validation Rule**: Each currency provider must have unique priority value within organization. Priority determines failover order (lower number = higher priority).

**Priority Range**: 1-10 (1 = highest priority, 10 = lowest priority)

**Implementation Requirements**:
- **Client-Side**: Number input, show current priorities for other providers
- **Server-Side**: Validate uniqueness, check range 1-10
- **Database**: UNIQUE constraint on priority, CHECK BETWEEN 1 AND 10

**Error Codes**:
- VAL-CUR-112A: "Provider priority must be between 1 and 10"
- VAL-CUR-112B: "Priority {n} already assigned to provider {provider_name}"

**User Action**: User must select different priority value or adjust other provider priorities.

**Priority Assignment Example**:
```
Priority 1: Bank of England (primary, GBP rates)
Priority 2: European Central Bank (fallback, EUR rates)
Priority 3: Bank of Japan (fallback, JPY rates)
Priority 4: Open Exchange Rates (general fallback)
```

---

### VAL-CUR-113: Revaluation Approval for Material Amounts

**Validation Rule**: Currency revaluations with net unrealized gain/loss exceeding $10,000 require CFO approval before posting.

**Implementation Requirements**:
- **Client-Side**: Display approval requirement on preview, route to CFO approval workflow
- **Server-Side**: Calculate net impact (total gains - total losses), check if > $10,000, route for approval
- **Database**: Status = 'Pending Approval' until CFO approves

**Error Code**: VAL-CUR-113
**Error Message**: "Revaluation net impact ${amount} exceeds materiality threshold ($10,000). CFO approval required before posting."

**User Action**: User submits revaluation for CFO approval. CFO reviews and approves/rejects via approval workflow.

**Materiality Threshold Rationale**: $10,000 net impact on P&L considered material, requires senior approval.

**Test Cases**:
- ✅ Auto-post: Net gain $5,000 (below threshold)
- ⚠️ Approval: Net loss $15,000 (above threshold)
- ⚠️ Approval: Net gain $12,500 (above threshold)

---

## 4. Cross-Field Validations (VAL-CUR-201 to 299)

### VAL-CUR-201: Currency Display Format Consistency

**Fields Involved**: `symbol_position`, `thousand_separator`, `decimal_separator`, `display_format`

**Validation Rule**: Display format must correctly incorporate symbol position, thousand separator, and decimal separator.

**Format Pattern Examples**:
- symbol_position=before, thousand_separator=",", decimal_separator=".": `$#,##0.00`
- symbol_position=after, thousand_separator=".", decimal_separator=",": `#.##0,00 €`
- symbol_position=before, thousand_separator=" ", decimal_separator=".": `¥#,##0` (JPY, 0 decimals)

**Implementation Requirements**:
- **Client-Side**: Auto-generate display_format based on other fields, live preview
- **Server-Side**: Validate format string matches component settings
- **Database**: CHECK constraint validates format consistency

**Error Code**: VAL-CUR-201
**Error Message**: "Display format '{format}' does not match currency settings (symbol position: {pos}, separators: {sep})"

**User Action**: User should use auto-generated format or manually correct format string.

**Test Cases**:
- ✅ Valid: symbol_position="before", thousand_separator=",", decimal_separator=".", format="$#,##0.00"
- ❌ Invalid: symbol_position="after", format="$#,##0.00" (symbol position mismatch)

---

### VAL-CUR-202: Rate Date and Time Consistency

**Fields Involved**: `rate_date`, `rate_time`, `valid_from`, `valid_until`

**Validation Rule**: Rate validity period (valid_from to valid_until) must encompass rate_date + rate_time.

**Validity Calculation**: `rate_timestamp = rate_date + rate_time`

**Implementation Requirements**:
- **Client-Side**: Auto-set valid_from = rate_timestamp, valid_until = rate_timestamp + cache_ttl
- **Server-Side**: Verify rate_timestamp BETWEEN valid_from AND valid_until
- **Database**: CHECK constraint

**Error Code**: VAL-CUR-202
**Error Message**: "Rate timestamp {timestamp} must fall within validity period ({valid_from} to {valid_until})"

**Example**:
```
Rate Date: 2025-11-12
Rate Time: 10:00:00
Rate Timestamp: 2025-11-12T10:00:00Z

Cache TTL: 3600 seconds (1 hour)
Valid From: 2025-11-12T10:00:00Z
Valid Until: 2025-11-12T11:00:00Z

Validation: ✅ Rate timestamp within validity window
```

---

### VAL-CUR-203: Settlement vs Original Rate Comparison

**Fields Involved**: `exchange_rate`, `settlement_rate`, `realized_gain_loss`

**Validation Rule**: Realized gain/loss must correctly reflect difference between original and settlement rates.

**Calculation Formula**:
```
base_amount_original = transaction_amount × exchange_rate
base_amount_settlement = transaction_amount × settlement_rate
realized_gain_loss = base_amount_settlement - base_amount_original
```

**Sign Convention**:
- Positive realized_gain_loss = Loss (paid more in base currency)
- Negative realized_gain_loss = Gain (paid less in base currency)

**Implementation Requirements**:
- **Client-Side**: Auto-calculate realized_gain_loss, display clearly
- **Server-Side**: Recalculate using Decimal.js, verify match within $0.01
- **Database**: Trigger verifies calculation

**Error Code**: VAL-CUR-203
**Error Message**: "Realized gain/loss calculation incorrect. Expected: ${expected}, Provided: ${provided}. Formula: (settlement_amount - original_amount)"

**Calculation Example**:
```
Original Transaction:
  Transaction Amount: £900.00 GBP
  Exchange Rate: 1.2750 USD/GBP
  Base Amount: £900.00 × 1.2750 = $1,147.50

Settlement Transaction:
  Transaction Amount: £900.00 GBP (same)
  Settlement Rate: 1.2800 USD/GBP
  Settlement Base: £900.00 × 1.2800 = $1,152.00

Realized Gain/Loss:
  $1,152.00 - $1,147.50 = $4.50
  Positive = Loss (paid $4.50 more USD)
```

**Test Cases**:
- ✅ Valid: £900.00, rate 1.2750, settlement 1.2800, realized loss $4.50
- ❌ Invalid: Same inputs, realized gain $4.50 (wrong sign)

---

### VAL-CUR-204: Revaluation Line Sum Equals Header Net

**Fields Involved**: `revaluation_lines.unrealized_gain_loss`, `currency_revaluations.net_unrealized_gain_loss`

**Validation Rule**: Sum of all revaluation line gains/losses must equal revaluation header net amount.

**Formula**: `SUM(revaluation_lines.unrealized_gain_loss) = currency_revaluations.net_unrealized_gain_loss`

**Implementation Requirements**:
- **Client-Side**: Display running sum of lines, compare to header
- **Server-Side**: Calculate sum, verify match with tolerance $0.01
- **Database**: CHECK constraint or trigger validation

**Error Code**: VAL-CUR-204
**Error Message**: "Revaluation line totals do not match header net amount. Line sum: ${line_sum}, Header net: ${header_net}, Difference: ${diff}"

**Example**:
```
Revaluation Lines:
  Line 1: AR GBP £15,000, Gain $100
  Line 2: AP EUR €15,000, Loss -$75
  Line 3: Cash GBP £20,000, Gain $100

Line Sum: $100 - $75 + $100 = $125

Header:
  total_unrealized_gain: $200 (sum of positive values)
  total_unrealized_loss: $75 (sum of negative values)
  net_unrealized_gain_loss: $125 (total_gain - total_loss)

Validation: $125 = $125 ✅
```

---

### VAL-CUR-205: Provider Authentication Consistency

**Fields Involved**: `authentication_type`, `api_key`, `oauth_token`, `oauth_refresh_token`

**Validation Rule**: Based on authentication_type, corresponding credential fields must be provided:
- authentication_type = 'api_key': api_key required
- authentication_type = 'oauth2': oauth_token and oauth_refresh_token required
- authentication_type = 'none': no credentials required

**Implementation Requirements**:
- **Client-Side**: Show/hide credential fields based on authentication_type selection
- **Server-Side**: Validate credential presence based on auth type
- **Database**: CHECK constraints

**Error Codes**:
- VAL-CUR-205A: "API key required when authentication type is 'api_key'"
- VAL-CUR-205B: "OAuth tokens required when authentication type is 'oauth2'"
- VAL-CUR-205C: "Credentials should not be provided when authentication type is 'none'"

**Test Cases**:
- ✅ Valid: auth_type='api_key', api_key provided
- ✅ Valid: auth_type='oauth2', oauth_token + refresh_token provided
- ✅ Valid: auth_type='none', no credentials
- ❌ Invalid: auth_type='api_key', api_key NULL
- ❌ Invalid: auth_type='none', api_key provided

---

### VAL-CUR-206: Revaluation Period and Date Alignment

**Fields Involved**: `period_id`, `revaluation_date`

**Validation Rule**: Revaluation date must fall within the selected accounting period's date range.

**Implementation Requirements**:
- **Client-Side**: Period dropdown sets min/max date constraints for revaluation_date picker
- **Server-Side**: Query period start_date and end_date, verify revaluation_date BETWEEN
- **Database**: CHECK constraint with period date range

**Error Code**: VAL-CUR-206
**Error Message**: "Revaluation date {date} must fall within period {period} date range ({start_date} to {end_date})"

**Example**:
```
Period: 2025-11 (November 2025)
Period Start: 2025-11-01
Period End: 2025-11-30

Valid Revaluation Dates: 2025-11-01 to 2025-11-30
Typical Choice: 2025-11-30 (end of period)
```

**Test Cases**:
- ✅ Valid: Period 2025-11, Date 2025-11-30
- ✅ Valid: Period 2025-11, Date 2025-11-01
- ❌ Invalid: Period 2025-11, Date 2025-10-31 (before period)
- ❌ Invalid: Period 2025-11, Date 2025-12-01 (after period)

---

## 5. Security Validations (VAL-CUR-301 to 399)

### VAL-CUR-301: Permission - Currency Configuration

**Validation Rule**: Only users with 'configure_currencies' permission can create/edit/deactivate currencies.

**Permitted Roles**:
- CFO: Full access
- Controller: Full access
- Treasury Manager: Full access
- Finance Manager: Read-only
- Accountant: Read-only

**Implementation Requirements**:
- **Client-Side**: Hide create/edit buttons for users without permission
- **Server-Side**: Check user role and permissions before allowing operation
- **Database**: RLS policies enforce permission checks

**Error Code**: VAL-CUR-301
**Error Message**: "You do not have permission to configure currencies. Contact your administrator to request 'configure_currencies' permission."

**User Action**: User must request permission from administrator or have Finance Manager/above perform operation.

---

### VAL-CUR-302: Permission - Manual Exchange Rate Entry

**Validation Rule**: Only Treasury Manager and above can enter manual exchange rates. Accountants can only view rates.

**Permitted Roles**:
- CFO: Full access
- Controller: Full access
- Treasury Manager: Full access
- Finance Manager: Read-only
- Accountant: Read-only

**Implementation Requirements**:
- **Client-Side**: Display manual rate entry form only for authorized users
- **Server-Side**: Verify user role before accepting manual rate
- **Database**: RLS policies restrict rate INSERT/UPDATE

**Error Code**: VAL-CUR-302
**Error Message**: "You do not have permission to enter manual exchange rates. Only Treasury Managers and above can perform this operation."

**User Action**: User must request Treasury Manager to enter rate.

---

### VAL-CUR-303: Permission - Revaluation Execution

**Validation Rule**: Only Finance Manager and above can execute period-end currency revaluations.

**Permitted Roles**:
- CFO: Full access
- Controller: Full access
- Finance Manager: Full access
- Treasury Manager: Read-only
- Accountant: Read-only

**Implementation Requirements**:
- **Client-Side**: Disable "Run Revaluation" button for unauthorized users
- **Server-Side**: Check user role before allowing revaluation execution
- **Database**: RLS policies restrict revaluation INSERT

**Error Code**: VAL-CUR-303
**Error Message**: "You do not have permission to execute currency revaluations. Only Finance Managers and above can perform period-end revaluations."

**User Action**: User must request Finance Manager/Controller to execute revaluation.

---

### VAL-CUR-304: Permission - Rate Provider Configuration

**Validation Rule**: Only Treasury Manager and above can configure external rate provider APIs.

**Security Rationale**: Rate providers involve API credentials and organization financial data exposure.

**Permitted Roles**:
- CFO: Full access
- Controller: Full access
- Treasury Manager: Full access
- Finance Manager: Read-only
- Accountant: No access

**Implementation Requirements**:
- **Client-Side**: Hide provider configuration section for unauthorized users
- **Server-Side**: Verify user role before allowing provider CRUD operations
- **Database**: RLS policies restrict currency_providers table access

**Error Code**: VAL-CUR-304
**Error Message**: "You do not have permission to configure rate providers. Only Treasury Managers and above can configure external APIs."

**User Action**: User must request Treasury Manager to configure providers.

---

### VAL-CUR-305: Audit Log Completeness

**Validation Rule**: All currency and exchange rate operations must be logged to audit_logs with user_id, timestamp, action, and before/after values.

**Audited Operations**:
- Currency: CREATE, UPDATE, DEACTIVATE
- Exchange Rate: CREATE (manual), UPDATE (approval), DELETE (if unused)
- Revaluation: CREATE, CALCULATE, POST, APPROVE, REVERSE
- Provider: CREATE, UPDATE, DEACTIVATE, API_CALL
- Transaction: CREATE, UPDATE, SETTLE

**Implementation Requirements**:
- **Client-Side**: N/A
- **Server-Side**: Audit middleware wraps all mutations
- **Database**: Trigger writes to audit_logs on all write operations

**Audit Log Fields**:
- action_type: CREATE, UPDATE, DELETE, POST, APPROVE, REVERSE, CALCULATE, SETTLE
- entity_type: currency, exchange_rate, revaluation, transaction, provider
- entity_id: UUID of affected record
- user_id: Who performed action
- timestamp: When action occurred
- before_value: JSON snapshot of previous state
- after_value: JSON snapshot of new state
- ip_address: Source IP
- user_agent: Browser/client identifier

**Retention**: 7 years minimum for financial regulatory compliance

**Error Code**: VAL-CUR-305
**Error Message**: "Audit logging failed. Transaction rolled back for data integrity."

**User Action**: System error - contact administrator if audit logging consistently fails.

---

### VAL-CUR-306: API Key Encryption

**Validation Rule**: All API keys and OAuth tokens must be encrypted at rest using AES-256 encryption. Never stored in plain text.

**Encryption Requirements**:
- Algorithm: AES-256-GCM
- Key storage: Separate key management service (KMS)
- Encryption at: Application layer before database write
- Decryption at: Application layer on read (never sent to client)

**Implementation Requirements**:
- **Client-Side**: API keys never exposed in responses, displayed as '••••••••••••••••'
- **Server-Side**: Encrypt on INSERT/UPDATE, decrypt on SELECT for internal use only
- **Database**: TEXT column stores encrypted value, never plain text

**Error Code**: VAL-CUR-306
**Error Message**: "API key encryption failed. Please try again or contact administrator."

**Security Note**: Encryption keys rotated quarterly. Old encrypted values re-encrypted with new keys during rotation.

---

### VAL-CUR-307: Rate Tampering Detection

**Validation Rule**: Exchange rates must include integrity hash to detect tampering. Hash verified on every read.

**Hash Calculation**: `SHA256(exchange_rate + rate_date + rate_time + from_currency + to_currency + source)`

**Implementation Requirements**:
- **Client-Side**: N/A
- **Server-Side**: Calculate hash on INSERT, verify hash on SELECT, alert on mismatch
- **Database**: rate_hash VARCHAR(64) NOT NULL

**Error Code**: VAL-CUR-307
**Error Message**: "Rate integrity check failed - possible data tampering detected. Rate ID: {id}. Administrator has been notified."

**User Action**: System error - do not use rate. Contact administrator immediately. Rate flagged for investigation.

**Detection Response**:
1. Log security event
2. Alert database administrator
3. Quarantine rate (mark as invalid)
4. Block usage in transactions
5. Investigate tampering source

---

## 6. Integration Validations (VAL-CUR-401 to 499)

### VAL-CUR-401: GL Account Existence in Account Code Mapping

**Validation Rule**: Before posting foreign currency transactions or revaluations, verify required GL accounts exist in Account Code Mapping:
- 7200: Realized Exchange Gain/Loss
- 7210: Unrealized Exchange Gain/Loss
- 7250: Currency Translation Adjustment (if applicable)

**Implementation Requirements**:
- **Server-Side**: Query Account Code Mapping API/service, verify accounts exist and active
- **Database**: Foreign key reference if accounts in same database

**Error Codes**:
- VAL-CUR-401A: "Realized exchange gain/loss account (7200) not found in Account Code Mapping"
- VAL-CUR-401B: "Unrealized exchange gain/loss account (7210) not found in Account Code Mapping"
- VAL-CUR-401C: "Exchange gain/loss account {account_code} is inactive"

**User Action**: User must configure missing GL accounts in Account Code Mapping module before proceeding with currency operations.

**Account Setup Check**:
- Run during module initialization
- Display setup wizard if accounts missing
- Guide user through Account Code Mapping setup

---

### VAL-CUR-402: External Rate Provider API Availability

**Validation Rule**: Before retrieving exchange rates from external API, verify provider is available and responding.

**Health Check Steps**:
1. Send HTTP HEAD request to provider API endpoint
2. Verify response status 200 OK within 5 seconds
3. Check consecutive_failures count < 3
4. Verify provider is_active = true

**Implementation Requirements**:
- **Server-Side**: Health check before API call, automatic failover to next priority provider if unavailable
- **Database**: Update health_status and last_health_check_at after each check

**Error Codes**:
- VAL-CUR-402A: "Rate provider {provider_name} is unavailable. Failing over to {next_provider}."
- VAL-CUR-402B: "All rate providers unavailable. Cannot retrieve exchange rates. Using cached rates if available."
- VAL-CUR-402C: "Rate provider {provider_name} has exceeded failure threshold ({failures}). Marked inactive."

**Failover Process**:
1. Primary provider (priority 1) fails → Try priority 2
2. Priority 2 fails → Try priority 3
3. All providers fail → Use cached rates with warning
4. If cache expired → Alert Treasury Manager, manual rate entry required

---

### VAL-CUR-403: Rate Provider Response Validation

**Validation Rule**: Exchange rate responses from external APIs must pass validation before being stored.

**Response Validation Checks**:
1. **Format**: JSON response with expected structure
2. **Rate Present**: from_currency, to_currency, exchange_rate fields exist
3. **Rate Bounds**: exchange_rate between 0.0001 and 10,000
4. **Timestamp**: Response timestamp within last 5 minutes (not stale)
5. **Currency Match**: Returned currencies match requested currencies

**Implementation Requirements**:
- **Server-Side**: Parse response, validate all checks, reject if any fail
- **Database**: Store validation_status in exchange_rates table

**Error Codes**:
- VAL-CUR-403A: "Invalid rate provider response format"
- VAL-CUR-403B: "Rate not found in provider response for {from_currency}/{to_currency}"
- VAL-CUR-403C: "Rate {rate} outside acceptable bounds (0.0001 to 10,000)"
- VAL-CUR-403D: "Stale rate data - provider timestamp {timestamp} older than 5 minutes"

**User Action**: System automatically falls back to next provider. If all fail, Treasury Manager alerted to enter manual rate.

**Example Valid Response**:
```json
{
  "from_currency": "GBP",
  "to_currency": "USD",
  "exchange_rate": 1.27500000,
  "timestamp": "2025-11-12T10:00:00Z",
  "provider": "Bank of England"
}
```

---

### VAL-CUR-404: Posting Engine Integration

**Validation Rule**: When posting foreign currency transactions or revaluations to GL, verify posting engine accepts dual currency data format.

**Required Data Format**:
```json
{
  "entry_date": "2025-11-12",
  "description": "Foreign currency transaction",
  "lines": [
    {
      "account_code": "1200",
      "debit_amount": 1147.50,
      "original_currency": "GBP",
      "original_amount": 900.00,
      "exchange_rate": 1.27500000
    }
  ]
}
```

**Implementation Requirements**:
- **Server-Side**: Construct journal entry in posting engine format, call posting API, handle response
- **Database**: Store source_document_id reference to posted JE

**Error Codes**:
- VAL-CUR-404A: "Posting engine rejected journal entry: {error_message}"
- VAL-CUR-404B: "Posting engine unavailable. Transaction saved as pending, will retry."

**User Action**: If posting fails, transaction marked as 'Pending GL Post'. User can retry posting or contact administrator.

---

### VAL-CUR-405: Bank Statement Import Currency Match

**Validation Rule**: When importing multi-currency bank statements, statement currency must match configured bank account currency.

**Implementation Requirements**:
- **Server-Side**: Parse statement file (MT940, CSV, API), extract currency code, compare to bank account currency
- **Database**: Query multi_currency_bank_accounts for currency_code

**Error Code**: VAL-CUR-405
**Error Message**: "Bank statement currency {statement_currency} does not match account currency {account_currency} for account {account_number}. Please verify correct statement file or account configuration."

**User Action**: User must either select correct bank account or upload correct statement file.

**Statement Currency Detection**:
- MT940 format: Field :60F: contains currency code
- CSV format: Currency column or header metadata
- API format: currency field in JSON response

---

## 7. Performance Validations (VAL-CUR-501 to 599)

### VAL-CUR-501: Revaluation Account Limit

**Validation Rule**: Period-end currency revaluations limited to maximum 1000 accounts per revaluation run to prevent performance degradation.

**Implementation Requirements**:
- **Client-Side**: Display account count in preview, warn if approaching limit
- **Server-Side**: Count accounts in revaluation scope, reject if > 1000
- **Database**: N/A (application-level)

**Error Code**: VAL-CUR-501
**Error Message**: "Revaluation scope includes {count} accounts, exceeding maximum of 1000. Please filter by specific currencies or account ranges, or contact administrator for batch processing."

**User Action**: User must narrow revaluation scope by selecting fewer currencies or specific account ranges.

**Performance Rationale**: 1000 accounts × 30 seconds = 30 minutes max revaluation time, acceptable for period-end process.

---

### VAL-CUR-502: Rate Cache Size Limit

**Validation Rule**: Exchange rate cache limited to 10,000 rate entries to prevent memory exhaustion.

**Implementation Requirements**:
- **Server-Side**: Monitor Redis cache size, implement LRU eviction
- **Database**: N/A (cache-level)

**Error Code**: VAL-CUR-502
**Error Message**: "Rate cache approaching size limit. Oldest rates being evicted. Increase cache size or reduce cache TTL."

**User Action**: System automatically evicts oldest rates. Administrator alerted to adjust cache configuration.

---

### VAL-CUR-503: Batch Rate Retrieval Limit

**Validation Rule**: Automatic exchange rate retrieval limited to maximum 100 currency pairs per batch to prevent API rate limiting.

**Implementation Requirements**:
- **Server-Side**: Split large currency pair lists into batches of 100, process with delay between batches
- **Database**: N/A (application-level)

**Error Code**: VAL-CUR-503
**Error Message**: "Rate retrieval for {count} currency pairs exceeds batch limit of 100. Processing in {batches} batches with delays."

**User Action**: System automatically batches. No user action required. Process takes longer for large currency lists.

---

## 8. Validation Error Response Format

All validation errors follow consistent JSON response format:

```json
{
  "success": false,
  "errors": [
    {
      "code": "VAL-CUR-101",
      "field": "base_amount",
      "message": "Dual currency calculation mismatch. Expected: $1147.50, Provided: $1150.00, Difference: $2.50. Transaction amount × exchange rate must equal base amount.",
      "severity": "error",
      "userAction": "Verify exchange rate and amounts. System will auto-correct calculation."
    },
    {
      "code": "VAL-CUR-102A",
      "field": "exchange_rate",
      "message": "Rate variance 12.5% from previous day (1.2750). Please verify rate is correct.",
      "severity": "warning",
      "userAction": "Review rate and provide justification in manual entry reason field."
    }
  ]
}
```

**Severity Levels**:
- **error**: Blocks submission, must be fixed
- **warning**: Allows submission with confirmation or approval, logged
- **info**: Informational only, no action required

---

## 9. Appendix

### Related Documents
- [Business Requirements](./BR-currency-management.md)
- [Use Cases](./UC-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Data Schema](./DS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)

### Validation Rule Categories Summary

| Category | Rule Count | Critical Rules |
|----------|------------|----------------|
| Field-Level | 10 | 7 (currency code, exchange rate, amounts, dates) |
| Business Rules | 13 | 10 (dual currency, variance, period control, immutability, revaluation) |
| Cross-Field | 6 | 4 (dual currency balance, realized G/L calculation, settlement) |
| Security | 7 | 6 (permissions, audit, encryption, tampering detection) |
| Integration | 5 | 4 (GL account existence, rate provider, posting engine) |
| Performance | 3 | 0 (limits and warnings) |
| **Total** | **44** | **31** |

### Critical Validation Rules by Priority

**Priority 1 - Prevent Financial Errors**:
- VAL-CUR-001: ISO 4217 currency code validation
- VAL-CUR-002: Exchange rate precision and bounds
- VAL-CUR-101: Dual currency balance verification
- VAL-CUR-102: Exchange rate variance check
- VAL-CUR-203: Realized gain/loss calculation verification

**Priority 2 - Maintain Data Integrity**:
- VAL-CUR-005: Only one base currency
- VAL-CUR-104: Only monetary items revalued
- VAL-CUR-108: Revaluation must balance
- VAL-CUR-109: Immutable exchange rates after use
- VAL-CUR-110: Automatic reversal scheduling required

**Priority 3 - Ensure Compliance**:
- VAL-CUR-103: Period must be open for revaluation
- VAL-CUR-110: IAS 21 automatic reversal compliance
- VAL-CUR-305: Complete audit trail
- VAL-CUR-307: Rate tampering detection

**Priority 4 - Security**:
- VAL-CUR-301: Permission - Currency configuration
- VAL-CUR-302: Permission - Manual rate entry
- VAL-CUR-303: Permission - Revaluation execution
- VAL-CUR-306: API key encryption

### IAS 21 Compliance Checklist

This validation framework ensures compliance with IAS 21 "The Effects of Changes in Foreign Exchange Rates":

- ✅ **Para 21**: Transaction recorded at spot exchange rate on transaction date (VAL-CUR-101)
- ✅ **Para 23**: Monetary items revalued at period-end closing rate (VAL-CUR-104)
- ✅ **Para 23**: Non-monetary items NOT revalued (VAL-CUR-104)
- ✅ **Para 28**: Exchange differences recognized in P&L (VAL-CUR-107, VAL-CUR-203)
- ✅ **Para 52**: Disclosure of exchange gain/loss amount (VAL-CUR-108)
- ✅ **Best Practice**: Automatic reversal of unrealized gains/losses (VAL-CUR-110)

---

**Document End**
