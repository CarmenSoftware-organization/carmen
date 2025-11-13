# VAL-ACM: Account Code Mapping Validation Rules

**Module**: Finance
**Sub-Module**: Account Code Mapping
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Status**: Draft

---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Account Code Mapping module to ensure financial data integrity, prevent posting errors, and maintain compliance with accounting standards. Critical validations include balanced journal entries, period controls, account activity status, and proper dimension assignment. Invalid financial data can result in incorrect financial statements, failed audits, and regulatory non-compliance.

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
2. Financial data requires strictest validation (zero tolerance for errors)
3. Provide immediate user feedback when possible
4. Use clear, actionable error messages
5. Enforce accounting standards and business rules consistently
6. Prevent security vulnerabilities (SQL injection, XSS)

---

## 2. Field-Level Validations (VAL-ACM-001 to 099)

### VAL-ACM-001: account_code - Required & Format Validation

**Field**: `account_code`
**Database Column**: `gl_accounts.account_code`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: Account code is mandatory and must match COA format configuration.

**Format Requirements**:
- Length: 4-10 characters (per COA configuration)
- Allowed patterns: Numeric (1234), alphanumeric (A100), with separator (1200-01)
- No special characters except hyphen (-) in separator format
- Examples: 1000, 1210, 5100-01, ASSET-001

**Implementation Requirements**:
- **Client-Side**: Display format hint, validate pattern on blur, show red border if invalid
- **Server-Side**: Validate against COA account_code_format, check length constraints
- **Database**: VARCHAR(50) NOT NULL, CHECK constraint for format, UNIQUE (coa_id, account_code)

**Error Code**: VAL-ACM-001
**Error Message**: "Account code must be {format} format (e.g., {example})"
**User Action**: User must provide valid account code matching COA format.

**Test Cases**:
- ✅ Valid: "1000" (4-digit numeric)
- ✅ Valid: "1210-01" (with separator)
- ❌ Invalid: "" (empty)
- ❌ Invalid: "1" (too short)
- ❌ Invalid: "ABCD@123" (special characters)

---

### VAL-ACM-002: account_name - Required & Length Validation

**Field**: `account_name`
**Database Column**: `gl_accounts.account_name`
**Data Type**: VARCHAR(255) / string

**Validation Rule**: Account name is required, minimum 3 characters, maximum 255 characters.

**Implementation Requirements**:
- **Client-Side**: Show character counter (3-255), validate on blur
- **Server-Side**: Trim whitespace, check length after trim
- **Database**: VARCHAR(255) NOT NULL, CHECK length >= 3

**Error Codes**:
- VAL-ACM-002A: "Account name is required"
- VAL-ACM-002B: "Account name must be at least 3 characters"
- VAL-ACM-002C: "Account name cannot exceed 255 characters"

**Test Cases**:
- ✅ Valid: "Cash - Operating Account"
- ❌ Invalid: "ab" (too short)
- ❌ Invalid: {256 characters} (too long)

---

### VAL-ACM-003: entry_date - Date Range Validation

**Field**: `entry_date`
**Database Column**: `journal_entries.entry_date`
**Data Type**: DATE / Date

**Validation Rule**: Entry date must be within open period, not more than 90 days in past, not in future.

**Implementation Requirements**:
- **Client-Side**: Date picker with min/max dates based on open period
- **Server-Side**: Query accounting_periods, verify date falls in open period, check not > 90 days old
- **Database**: DATE NOT NULL

**Error Codes**:
- VAL-ACM-003A: "Entry date is required"
- VAL-ACM-003B: "Entry date must be in open period (current: {period})"
- VAL-ACM-003C: "Entry date cannot be more than 90 days in the past"
- VAL-ACM-003D: "Entry date cannot be in the future"

**Test Cases**:
- ✅ Valid: Today's date (period open)
- ✅ Valid: 30 days ago (period open)
- ❌ Invalid: 100 days ago (too old)
- ❌ Invalid: Tomorrow (future date)
- ❌ Invalid: Date in closed period

---

### VAL-ACM-004: debit_amount / credit_amount - Monetary Validation

**Field**: `debit_amount`, `credit_amount`
**Database Column**: `journal_entry_lines.debit_amount`, `journal_entry_lines.credit_amount`
**Data Type**: NUMERIC(15,2) / number

**Validation Rule**:
- Must be >= 0 (non-negative)
- Exactly one of debit or credit must be > 0 (not both, not neither)
- Maximum 2 decimal places
- Maximum value: 9,999,999,999,999.99

**Implementation Requirements**:
- **Client-Side**: Currency input with 2 decimal places, disable one field when other has value
- **Server-Side**: Validate range, decimal precision, one-side-only rule
- **Database**: NUMERIC(15,2) NOT NULL, CHECK >= 0, CHECK not both > 0

**Error Codes**:
- VAL-ACM-004A: "Amount must be greater than or equal to zero"
- VAL-ACM-004B: "Amount must have at most 2 decimal places"
- VAL-ACM-004C: "Amount exceeds maximum allowed ({max})"
- VAL-ACM-004D: "Entry line must have either debit or credit, not both"
- VAL-ACM-004E: "Entry line must have either debit or credit, not neither"

**Test Cases**:
- ✅ Valid: Debit 1234.56, Credit 0.00
- ✅ Valid: Debit 0.00, Credit 5000.00
- ❌ Invalid: Debit 100.00, Credit 100.00 (both non-zero)
- ❌ Invalid: Debit 0.00, Credit 0.00 (both zero)
- ❌ Invalid: Debit -50.00 (negative)
- ❌ Invalid: Debit 123.456 (too many decimals)

---

### VAL-ACM-005: priority - Range Validation

**Field**: `priority`
**Database Column**: `mapping_rules.priority`
**Data Type**: INTEGER / number

**Validation Rule**: Priority must be between 1 and 1000, unique within COA.

**Implementation Requirements**:
- **Client-Side**: Number input with min=1, max=1000
- **Server-Side**: Validate range, check uniqueness within COA
- **Database**: INTEGER NOT NULL, CHECK BETWEEN 1 AND 1000, UNIQUE (coa_id, priority)

**Error Codes**:
- VAL-ACM-005A: "Priority must be between 1 and 1000"
- VAL-ACM-005B: "Priority {n} already exists in this COA"

**Test Cases**:
- ✅ Valid: 1 (lowest priority)
- ✅ Valid: 100 (typical priority)
- ✅ Valid: 1000 (highest priority)
- ❌ Invalid: 0 (below minimum)
- ❌ Invalid: 1001 (above maximum)
- ❌ Invalid: 10 (if already exists in COA)

---

### VAL-ACM-006: account_type - Enum Validation

**Field**: `account_type`
**Database Column**: `gl_accounts.account_type`
**Data Type**: VARCHAR(50) / enum string

**Validation Rule**: Account type must be one of: Asset, Liability, Equity, Revenue, Expense, COGS.

**Implementation Requirements**:
- **Client-Side**: Dropdown with predefined options only
- **Server-Side**: Validate against enum, case-sensitive comparison
- **Database**: VARCHAR(50) NOT NULL, CHECK IN enum values

**Error Code**: VAL-ACM-006
**Error Message**: "Account type must be one of: Asset, Liability, Equity, Revenue, Expense, COGS"

**Test Cases**:
- ✅ Valid: "Asset"
- ✅ Valid: "Revenue"
- ❌ Invalid: "asset" (case mismatch)
- ❌ Invalid: "Income" (not in enum)
- ❌ Invalid: "" (empty)

---

### VAL-ACM-007: period_status - Enum Validation

**Field**: `status`
**Database Column**: `accounting_periods.status`
**Data Type**: VARCHAR(50) / enum string

**Validation Rule**: Period status must be one of: Draft, Open, Soft Closed, Closed.

**Valid Transitions**:
- Draft → Open
- Open → Soft Closed
- Soft Closed → Closed
- Soft Closed → Open (reopen)
- Closed → Reopened (requires CFO approval)

**Implementation Requirements**:
- **Client-Side**: Dropdown with valid transitions only based on current status
- **Server-Side**: Validate transition rules, check approval for reopen
- **Database**: VARCHAR(50) NOT NULL, CHECK IN enum values

**Error Codes**:
- VAL-ACM-007A: "Invalid period status"
- VAL-ACM-007B: "Cannot transition from {current} to {new} status"
- VAL-ACM-007C: "Reopening closed period requires CFO approval"

---

### VAL-ACM-008: currency_code - ISO 4217 Validation

**Field**: `currency_code`
**Database Column**: `gl_accounts.currency_code`, `journal_entries.base_currency`
**Data Type**: VARCHAR(3) / string

**Validation Rule**: Currency code must be valid ISO 4217 code (3 uppercase letters).

**Implementation Requirements**:
- **Client-Side**: Dropdown with supported currencies, searchable
- **Server-Side**: Validate against ISO 4217 list, check uppercase
- **Database**: VARCHAR(3) NOT NULL, CHECK length = 3

**Error Codes**:
- VAL-ACM-008A: "Currency code is required"
- VAL-ACM-008B: "Currency code must be 3 uppercase letters (ISO 4217)"
- VAL-ACM-008C: "Currency code '{code}' is not supported"

**Test Cases**:
- ✅ Valid: "USD"
- ✅ Valid: "SGD"
- ❌ Invalid: "usd" (lowercase)
- ❌ Invalid: "US" (too short)
- ❌ Invalid: "USDD" (too long)
- ❌ Invalid: "XXX" (not in supported list)

---

## 3. Business Rule Validations (VAL-ACM-101 to 199)

### VAL-ACM-101: Balanced Journal Entry

**Validation Rule**: Sum of debit amounts must equal sum of credit amounts for every journal entry.

**Mathematical Formula**: `SUM(debit_amount) = SUM(credit_amount)` with tolerance of $0.01 for rounding.

**Implementation Requirements**:
- **Client-Side**: Real-time calculation, display running totals, highlight imbalance in red
- **Server-Side**: Calculate totals, reject if not balanced within $0.01 tolerance
- **Database**: Check before INSERT, store total_debit_amount and total_credit_amount in header

**Error Code**: VAL-ACM-101
**Error Message**: "Journal entry is not balanced. Debits: ${debits}, Credits: ${credits}, Difference: ${diff}"
**User Action**: User must add/edit lines to balance the entry.

**Rounding Tolerance**: $0.01 allowed for multi-currency conversions

**Test Cases**:
- ✅ Valid: Debits $5000.00 = Credits $5000.00
- ✅ Valid: Debits $3300.50 = Credits $3300.50
- ✅ Valid: Debits $1000.00 = Credits $999.99 (within tolerance)
- ❌ Invalid: Debits $5000.00, Credits $4999.00 (diff > $0.01)
- ❌ Invalid: Debits $2000.00, Credits $3000.00

---

### VAL-ACM-102: Period Must Be Open

**Validation Rule**: Journal entries can only be posted to accounting periods with status = 'Open'.

**Exceptions**: Controllers can post to 'Soft Closed' periods (adjustments only).

**Implementation Requirements**:
- **Client-Side**: Disable entry date selection outside open period
- **Server-Side**: Query period status, verify open or (soft closed AND user is controller)
- **Database**: Foreign key to accounting_periods, status check via function

**Error Code**: VAL-ACM-102
**Error Message**: "Cannot post to {period} - period is {status}. Current open period is {current_period}"
**User Action**: User must change entry date to current open period or request period reopen.

**Special Cases**:
- Controllers posting adjustments: Allowed if period = 'Soft Closed'
- CFO reopening period: Requires approval workflow
- Future dated entries: Allowed if period will be open by then (for scheduled posts)

---

### VAL-ACM-103: Account Must Be Active

**Validation Rule**: Journal entry lines can only post to GL accounts where is_active = true.

**Implementation Requirements**:
- **Client-Side**: Filter account dropdown to show only active accounts
- **Server-Side**: Verify account.is_active = true for all lines
- **Database**: Foreign key constraint, CHECK active status

**Error Code**: VAL-ACM-103
**Error Message**: "Account {account_code} - {account_name} is inactive. Please select an active account or use replacement account {replacement_code}"
**User Action**: User must select different active account or request account reactivation.

**Inactive Account Handling**:
- Display warning when account recently deactivated
- Suggest replacement_account_id if configured
- Allow viewing historical transactions on inactive accounts

---

### VAL-ACM-104: Account Must Allow Posting

**Validation Rule**: Journal entry lines can only post to leaf accounts (allow_posting = true). Header accounts cannot accept transactions.

**Implementation Requirements**:
- **Client-Side**: Filter account dropdown to exclude headers
- **Server-Side**: Verify allow_posting = true for all accounts
- **Database**: CHECK constraint on account reference

**Error Code**: VAL-ACM-104
**Error Message**: "Account {account_code} is a header account and cannot accept transactions. Please select a posting account (leaf node)"
**User Action**: User must select a leaf account within the header's hierarchy.

**Account Type Indicators**:
- Header accounts: Display with bold text, show child count
- Posting accounts: Display with normal text, show last transaction date

---

### VAL-ACM-105: Required Dimensions

**Validation Rule**: If account requires specific dimensions (requires_dimension_1 through requires_dimension_6 = true), corresponding dimension values must be provided on journal entry line.

**Implementation Requirements**:
- **Client-Side**: Show dimension fields as required (*) when account selected requires them
- **Server-Side**: Query account dimension requirements, validate dimension values provided
- **Database**: NOT NULL on dimension columns (enforced by application, not DB)

**Error Code**: VAL-ACM-105
**Error Message**: "Account {account_code} requires {dimension_name}. Please select a {dimension_name} value"
**User Action**: User must select required dimension value before saving.

**Dimension Requirements by Account Type**:
- Expense accounts: Typically require Department (dimension_1) and Location (dimension_2)
- Revenue accounts: Typically require Location (dimension_2) and Product Line (dimension_5)
- Asset accounts: May require Location (dimension_2)
- Control accounts: May require all 6 dimensions for detailed tracking

---

### VAL-ACM-106: No Self-Referencing Accounts

**Validation Rule**: An account's parent cannot be itself or one of its descendants (prevents circular hierarchy).

**Implementation Requirements**:
- **Client-Side**: Disable self and descendants in parent account dropdown
- **Server-Side**: Check hierarchy path, reject if circular reference detected
- **Database**: CHECK constraint with recursive query

**Error Code**: VAL-ACM-106
**Error Message**: "Cannot set parent account - this would create a circular reference"
**User Action**: User must select different parent account.

**Hierarchy Validation**:
- Maximum depth: 10 levels (configurable)
- Path check: New parent cannot be in account's own hierarchy_path

---

### VAL-ACM-107: Debit/Credit Accounts Must Be Different

**Validation Rule**: In mapping rules, debit_account_id and credit_account_id must be different accounts.

**Implementation Requirements**:
- **Client-Side**: Disable selected debit account in credit dropdown and vice versa
- **Server-Side**: Validate debit_account_id != credit_account_id
- **Database**: CHECK constraint

**Error Code**: VAL-ACM-107
**Error Message**: "Debit and credit accounts must be different"
**User Action**: User must select different accounts for debit and credit.

**Exception**: Some contra-account scenarios may use same parent account but different sub-accounts (e.g., 1210-01 debit, 1210-02 credit) - this is allowed.

---

### VAL-ACM-108: Only One Period Open

**Validation Rule**: Only one accounting period can have status = 'Open' at any time.

**Implementation Requirements**:
- **Client-Side**: Display warning if trying to open period when another is open
- **Server-Side**: Query for existing open periods, reject if found
- **Database**: UNIQUE partial index on (coa_id, status) WHERE status = 'Open'

**Error Code**: VAL-ACM-108
**Error Message**: "Period {existing_period} is already open. Please close it before opening {new_period}"
**User Action**: User must close current period first (or use period close wizard).

**Period Transition Workflow**:
1. Close current period (Open → Soft Closed → Closed)
2. System automatically opens next sequential period
3. Only one period transitions at a time

---

### VAL-ACM-109: Sequential Period Close

**Validation Rule**: Accounting periods must be closed in chronological order. Cannot close November before closing October.

**Implementation Requirements**:
- **Client-Side**: Disable close button for future periods if earlier periods open
- **Server-Side**: Query previous period status, reject if not closed
- **Database**: CHECK constraint comparing period dates

**Error Code**: VAL-ACM-109
**Error Message**: "Cannot close {period}. Previous period {previous_period} must be closed first"
**User Action**: User must close periods in sequential order.

**Exception**: Adjustment periods (13th period) can be closed independently for year-end entries.

---

### VAL-ACM-110: Immutable Posted Entries

**Validation Rule**: Journal entries with status = 'Posted' cannot be edited or deleted. Only reversal entries allowed.

**Implementation Requirements**:
- **Client-Side**: Hide edit/delete buttons for posted entries, show "Reverse" button
- **Server-Side**: Reject UPDATE/DELETE operations on posted entries
- **Database**: Trigger prevents UPDATE on posted entries (status check)

**Error Code**: VAL-ACM-110
**Error Message**: "Posted journal entries are immutable. To correct this entry, create a reversal entry"
**User Action**: User must create reversal entry to undo the original entry.

**Reversal Process**:
1. Click "Reverse" on original entry
2. System creates new entry with opposite amounts
3. Links original_entry_id and reversed_by_entry_id
4. Both entries remain in ledger with net effect = zero

---

### VAL-ACM-111: Approval Authority Limits

**Validation Rule**: Manual journal entries exceeding user's approval authority must be routed for controller approval.

**Authority Matrix**:
- Accountant: $10,000
- Senior Accountant: $50,000
- Controller: $250,000
- CFO: Unlimited

**Implementation Requirements**:
- **Client-Side**: Display warning when amount exceeds authority, route to approval
- **Server-Side**: Query user authority from approval_authority_matrix, compare total amount
- **Database**: Foreign key to authority matrix

**Error Code**: VAL-ACM-111
**Error Message**: "Entry amount ${amount} exceeds your approval authority (${limit}). Entry will be routed for controller approval"
**User Action**: Entry saved as 'Pending Approval', awaits controller review.

---

### VAL-ACM-112: Period Close Validations

**Validation Rule**: Before period can be closed (Soft Close), all pre-close validations must pass:
1. All operational documents posted (no unposted GRNs, invoices, etc.)
2. All bank reconciliations complete
3. Inventory reconciliation complete (variance < $1000 or 0.5%)
4. AP/AR reconciliations complete (GL matches sub-ledgers)
5. No unmapped transactions in queue
6. Trial balance balanced (debits = credits)

**Implementation Requirements**:
- **Client-Side**: Period close wizard with validation checklist, cannot proceed until all green
- **Server-Side**: Run all validation queries, return status for each check
- **Database**: Validation functions for each checkpoint

**Error Codes**:
- VAL-ACM-112A: "Cannot close period - {n} unposted documents found"
- VAL-ACM-112B: "Cannot close period - {n} bank reconciliations incomplete"
- VAL-ACM-112C: "Cannot close period - inventory variance ${amount} exceeds tolerance"
- VAL-ACM-112D: "Cannot close period - AP variance ${amount} found"
- VAL-ACM-112E: "Cannot close period - {n} unmapped transactions in queue"
- VAL-ACM-112F: "Cannot close period - trial balance not balanced (diff: ${amount})"

**User Action**: User must resolve all validation failures before period close can proceed.

---

### VAL-ACM-113: Hash Chain Integrity

**Validation Rule**: Each journal entry must have entry_hash (SHA-256 of entry data) and link to previous_entry_hash to create tamper-evident chain.

**Hash Calculation**: `SHA256(entry_id + entry_date + total_debit + total_credit + created_at)`

**Implementation Requirements**:
- **Client-Side**: N/A (server-side only)
- **Server-Side**: Calculate hash on insert, verify previous hash exists and matches
- **Database**: entry_hash VARCHAR(64) NOT NULL, previous_entry_hash VARCHAR(64)

**Error Codes**:
- VAL-ACM-113A: "Hash chain broken - previous entry hash does not match"
- VAL-ACM-113B: "Entry hash verification failed - possible tampering detected"

**User Action**: System error - notify database administrator immediately. Do not allow entry posting.

**Hash Chain Verification**: Run daily integrity check job, alert on any hash mismatches.

---

## 4. Cross-Field Validations (VAL-ACM-201 to 299)

### VAL-ACM-201: Date Range Consistency

**Validation Rule**: If period has both effective_date and inactive_date, inactive_date must be >= effective_date.

**Implementation Requirements**:
- **Client-Side**: Validate on date change, show error below inactive_date field
- **Server-Side**: Compare dates, reject if logic violated
- **Database**: CHECK constraint (inactive_date >= effective_date OR inactive_date IS NULL)

**Error Code**: VAL-ACM-201
**Error Message**: "Inactive date must be on or after effective date"

**Test Cases**:
- ✅ Valid: Effective 2025-01-01, Inactive 2025-12-31
- ✅ Valid: Effective 2025-01-01, Inactive NULL
- ❌ Invalid: Effective 2025-12-31, Inactive 2025-01-01

---

### VAL-ACM-202: Currency Consistency

**Validation Rule**: For multi-currency entries, if original_currency is provided, exchange_rate must also be provided and vice versa.

**Implementation Requirements**:
- **Client-Side**: Show/hide exchange rate field based on currency selection
- **Server-Side**: Validate both present or both absent
- **Database**: CHECK constraint ((original_currency IS NULL) = (exchange_rate IS NULL))

**Error Codes**:
- VAL-ACM-202A: "Exchange rate required when original currency provided"
- VAL-ACM-202B: "Original currency required when exchange rate provided"

---

### VAL-ACM-203: Rule Criteria Completeness

**Validation Rule**: Mapping rule must have at least one criterion in criteria JSON (cannot be empty object).

**Implementation Requirements**:
- **Client-Side**: Disable save button until at least one criterion added
- **Server-Side**: Parse JSON, count keys, reject if zero
- **Database**: CHECK constraint (JSONB_ARRAY_LENGTH(criteria) > 0)

**Error Code**: VAL-ACM-203
**Error Message**: "Mapping rule must have at least one matching criterion"

**Test Cases**:
- ✅ Valid: `{"document_type": "grn"}`
- ❌ Invalid: `{}`

---

### VAL-ACM-204: Account Type and Normal Balance Consistency

**Validation Rule**: Account type must match expected normal balance type:
- Asset, Expense, COGS → Debit
- Liability, Equity, Revenue → Credit

**Implementation Requirements**:
- **Client-Side**: Auto-set normal_balance_type when account_type selected
- **Server-Side**: Validate consistency, warn on mismatch
- **Database**: No constraint (informational)

**Error Code**: VAL-ACM-204
**Error Message**: "Warning: {account_type} accounts typically have {expected_balance} normal balance. You selected {actual_balance}. Are you sure?"

**User Action**: Confirm override or correct normal balance type.

---

### VAL-ACM-205: Period Dates Non-Overlapping

**Validation Rule**: Within same COA, accounting periods cannot have overlapping date ranges.

**Implementation Requirements**:
- **Client-Side**: N/A
- **Server-Side**: Query existing periods, check for date overlap
- **Database**: EXCLUDE constraint using daterange

**Error Code**: VAL-ACM-205
**Error Message**: "Period dates overlap with existing period {existing_period} ({start} to {end})"

**Test Cases**:
- ✅ Valid: Period A (Jan 1-31), Period B (Feb 1-28)
- ❌ Invalid: Period A (Jan 1-31), Period B (Jan 15-Feb 15)

---

## 5. Security Validations (VAL-ACM-301 to 399)

### VAL-ACM-301: Row-Level Security (RLS)

**Validation Rule**: Users can only view and edit journal entries and accounts within their authorized COA(s) and departments.

**Implementation Requirements**:
- **Client-Side**: N/A
- **Server-Side**: Apply RLS policies on all queries
- **Database**: PostgreSQL RLS policies on all financial tables

**RLS Policies**:
- Users see only entries from their COA
- Users see only entries from their authorized departments (if department-restricted role)
- Controllers and CFO see all entries

**Error Code**: VAL-ACM-301
**Error Message**: "Access denied - you do not have permission to access this record"

---

### VAL-ACM-302: SQL Injection Prevention

**Validation Rule**: All user input must be sanitized to prevent SQL injection attacks.

**Implementation Requirements**:
- **Client-Side**: Input sanitization on special characters
- **Server-Side**: Use Prisma ORM parameterized queries exclusively, never string concatenation
- **Database**: Prepared statements only

**Blocked Patterns**: `'; DROP TABLE`, `UNION SELECT`, `--`, `/**/`, etc.

**Error Code**: VAL-ACM-302
**Error Message**: "Invalid input detected - please remove special characters"

---

### VAL-ACM-303: Audit Trail Completeness

**Validation Rule**: All write operations (INSERT, UPDATE, DELETE) must be logged to audit_logs table with user_id, timestamp, action, and before/after values.

**Implementation Requirements**:
- **Client-Side**: N/A
- **Server-Side**: Wrap all mutations in audit logging middleware
- **Database**: Trigger on all tables writes to audit_logs

**Audit Log Fields**:
- action_type: CREATE, UPDATE, DELETE, POST, REVERSE, CLOSE
- entity_type: journal_entry, gl_account, period, mapping_rule
- entity_id: UUID of affected record
- user_id: Who performed action
- timestamp: When action occurred
- before_value: JSON of previous state
- after_value: JSON of new state
- ip_address: Source IP

**Retention**: 7 years minimum for financial audit logs

---

### VAL-ACM-304: Session Validation

**Validation Rule**: All financial operations require valid authenticated session with JWT token expiry check.

**Implementation Requirements**:
- **Client-Side**: Check token expiry before API calls, refresh if needed
- **Server-Side**: Validate JWT signature, check expiry, verify user active
- **Database**: Session stored in secure cookie

**Error Codes**:
- VAL-ACM-304A: "Session expired - please log in again"
- VAL-ACM-304B: "Invalid session token"
- VAL-ACM-304C: "User account deactivated"

**Token Expiry**: 8 hours with sliding window (extends on activity)

---

### VAL-ACM-305: Multi-Factor Authentication for Critical Operations

**Validation Rule**: Sensitive operations require MFA verification:
- Period hard close
- Period reopen
- COA structural changes (add/delete top-level accounts)
- Approval authority changes
- Manual entries > $100,000

**Implementation Requirements**:
- **Client-Side**: Prompt for MFA code before submitting
- **Server-Side**: Verify MFA code with auth provider
- **Database**: Log MFA verification in audit trail

**Error Codes**:
- VAL-ACM-305A: "MFA code required for this operation"
- VAL-ACM-305B: "Invalid MFA code"
- VAL-ACM-305C: "MFA code expired"

---

## 6. Integration Validations (VAL-ACM-401 to 499)

### VAL-ACM-401: Source Transaction Exists

**Validation Rule**: For auto-generated journal entries, source_document_id must reference an existing record in the source system.

**Implementation Requirements**:
- **Server-Side**: Verify document exists in source table before posting
- **Database**: Foreign key or application-level validation

**Error Code**: VAL-ACM-401
**Error Message**: "Source document {doc_type} {doc_id} not found"

**Source Tables**:
- purchase_requests, purchase_orders, grns, credit_notes (Procurement)
- inventory_adjustments, stock_transfers, physical_counts (Inventory)
- sales_invoices, customer_receipts (Sales)

---

### VAL-ACM-402: No Duplicate Posting

**Validation Rule**: Each source transaction can only be posted to GL once. Prevent duplicate journal entries for same source document.

**Implementation Requirements**:
- **Server-Side**: Check existing entries with same source_document_id + source_document_type
- **Database**: UNIQUE constraint (source_document_type, source_document_id) WHERE deleted_at IS NULL

**Error Code**: VAL-ACM-402
**Error Message**: "Transaction already posted to GL. Entry ID: {existing_entry_id}"

**Exception**: Reversals and adjustments allowed with different entry types.

---

### VAL-ACM-403: Budget Integration Validation

**Validation Rule**: If budget integration enabled, verify budget availability before posting expense entries.

**Implementation Requirements**:
- **Server-Side**: Call budget service API, check available budget vs. expense amount
- **Database**: N/A (external system)

**Error Codes**:
- VAL-ACM-403A: "Insufficient budget. Available: ${available}, Required: ${amount}"
- VAL-ACM-403B: "Budget service unavailable - posting allowed but flagged for review"

**Warning vs. Error**: Soft check (warning) allows override with approval, hard check (error) blocks posting.

---

## 7. Performance Validations (VAL-ACM-501 to 599)

### VAL-ACM-501: Batch Size Limits

**Validation Rule**: Bulk operations limited to prevent performance degradation:
- Journal entries: Max 50 entries per batch
- Journal entry lines: Max 500 lines per entry
- Account balance updates: Max 1000 per batch

**Implementation Requirements**:
- **Client-Side**: Warn when approaching limits
- **Server-Side**: Reject if limits exceeded, suggest batch splitting
- **Database**: N/A (application-level)

**Error Code**: VAL-ACM-501
**Error Message**: "Batch size ({n}) exceeds maximum ({max}). Please split into smaller batches"

---

## 8. Validation Error Response Format

All validation errors follow consistent JSON response format:

```json
{
  "success": false,
  "errors": [
    {
      "code": "VAL-ACM-101",
      "field": "journal_entry",
      "message": "Journal entry is not balanced. Debits: $5000.00, Credits: $4500.00, Difference: $500.00",
      "severity": "error",
      "userAction": "Adjust line amounts to balance debits and credits"
    }
  ]
}
```

**Severity Levels**:
- **error**: Blocks submission, must be fixed
- **warning**: Allows submission with confirmation, logged
- **info**: Informational only, no action required

---

## 9. Appendix

### Related Documents
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Schema](./DS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)

### Validation Rule Categories Summary

| Category | Rule Count | Critical Rules |
|----------|------------|----------------|
| Field-Level | 8 | 5 (amounts, dates, codes) |
| Business Rules | 13 | 8 (balanced entry, period control, immutability) |
| Cross-Field | 5 | 2 (date consistency, currency) |
| Security | 5 | 4 (RLS, SQL injection, audit, MFA) |
| Integration | 3 | 2 (duplicate posting, source existence) |
| Performance | 1 | 0 |
| **Total** | **35** | **21** |

---

**Document End**
