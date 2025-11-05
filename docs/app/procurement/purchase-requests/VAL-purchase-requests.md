# VAL-PR: Purchase Requests Validation Rules

**Module**: Procurement
**Sub-Module**: Purchase Requests
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-01-30
**Status**: Active

---

## 1. Overview

### 1.1 Purpose
This document defines all validation rules for the Purchase Requests sub-module to ensure data integrity, enforce business rules, and maintain security across the procurement process.

### 1.2 Scope
Validation rules cover:
- Purchase request header fields (type, dates, amounts, currency)
- Line item fields (products, quantities, prices, specifications)
- Business rules (approval thresholds, budget availability, status transitions)
- Cross-field relationships (date ranges, amount calculations)
- Security and access control (permissions, ownership, department access)

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
2. Provide immediate user feedback when possible
3. Use clear, actionable error messages in plain language
4. Prevent security vulnerabilities (SQL injection, XSS, unauthorized access)
5. Enforce business rules consistently across all operations

---

## 2. Field-Level Validations (VAL-PR-001 to 099)

### VAL-PR-001: Reference Number Format

**Field**: `ref_number`
**Database Column**: `purchase_requests.ref_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: Reference number must follow the format PR-YYYY-NNNN where YYYY is the year and NNNN is a 4-digit sequential number (e.g., PR-2025-0042).

**Rationale**: Provides unique, sequential identification for all purchase requests with year-based organization.

**Implementation Requirements**:
- **Client-Side**: Display field as read-only (auto-generated). Show format example as placeholder.
- **Server-Side**: Auto-generate reference number using database sequence. Verify uniqueness before saving.
- **Database**: UNIQUE constraint on ref_number column. Trigger function generates value if not provided.

**Error Code**: VAL-PR-001
**Error Message**: "Invalid reference number format. Must be PR-YYYY-NNNN"
**User Action**: System auto-generates - no user action required. Error only if manual override attempted.

**Test Cases**:
- ✅ Valid: PR-2025-0001
- ✅ Valid: PR-2025-9999
- ❌ Invalid: PR-25-001 (year must be 4 digits)
- ❌ Invalid: PR-2025-001 (sequence must be 4 digits)
- ❌ Invalid: 2025-0001 (missing PR prefix)

---

### VAL-PR-002: PR Type Selection

**Field**: `type`
**Database Column**: `purchase_requests.type`
**Data Type**: VARCHAR(20) / enum

**Validation Rule**: PR type must be one of: General, Market List, or Asset.

**Rationale**: Different PR types have different approval workflows and business rules.

**Implementation Requirements**:
- **Client-Side**: Display as dropdown with three options only. Default to "General".
- **Server-Side**: Verify value is one of the three allowed types.
- **Database**: CHECK constraint ensuring value IN ('General', 'Market List', 'Asset').

**Type Descriptions**:
- **General**: Standard purchase requests for regular supplies and services
- **Market List**: Quick purchases of perishable items, typically low-value (< $500)
- **Asset**: Capital equipment and fixed assets requiring special approval

**Error Code**: VAL-PR-002
**Error Message**: "Invalid PR type. Must be General, Market List, or Asset"
**User Action**: User must select one of the three valid PR types.

**Business Rules by Type**:
- Market List PRs under $500 may be auto-approved
- Asset PRs require Asset Manager approval regardless of amount
- General PRs follow standard approval workflow

**Test Cases**:
- ✅ Valid: "General"
- ✅ Valid: "Market List"
- ✅ Valid: "Asset"
- ❌ Invalid: "Regular" (not in allowed values)
- ❌ Invalid: null or empty

---

### VAL-PR-003: PR Date

**Field**: `date`
**Database Column**: `purchase_requests.date`
**Data Type**: DATE / Date

**Validation Rule**: PR date must be a valid date, not before year 2020, and not more than 30 days in the future.

**Rationale**: Prevents data entry errors and backdating beyond reasonable timeframes.

**Implementation Requirements**:
- **Client-Side**: Date picker with min date = 2020-01-01, max date = today + 30 days. Default to today's date.
- **Server-Side**: Verify date is within acceptable range.
- **Database**: CHECK constraint: date >= '2020-01-01' AND date <= CURRENT_DATE + INTERVAL '30 days'.

**Error Code**: VAL-PR-003
**Error Message**:
- If before 2020: "PR date cannot be before 2020"
- If more than 30 days future: "PR date cannot be more than 30 days in the future"

**User Action**: User must select a date within the allowed range.

**Test Cases**:
- ✅ Valid: Today's date
- ✅ Valid: Yesterday
- ✅ Valid: Today + 30 days
- ❌ Invalid: 2019-12-31
- ❌ Invalid: Today + 31 days

---

### VAL-PR-004: Delivery Date

**Field**: `delivery_date`
**Database Column**: `purchase_requests.delivery_date`
**Data Type**: DATE / Date

**Validation Rule**: Delivery date is required and must be a valid future date.

**Rationale**: Ensures realistic delivery expectations and planning.

**Implementation Requirements**:
- **Client-Side**: Date picker with min date = PR date + 1 day. Show red asterisk indicating required field.
- **Server-Side**: Verify delivery date is provided and after PR date.
- **Database**: NOT NULL constraint. CHECK constraint with cross-field validation (see VAL-PR-201).

**Error Code**: VAL-PR-004
**Error Message**: "Delivery date is required"
**User Action**: User must select a delivery date after the PR date.

**Special Cases**:
- If PR date changes after delivery date is set, revalidate the relationship
- Weekends and holidays: System does not enforce business days (user responsibility)

**Test Cases**:
- ✅ Valid: PR date + 7 days
- ✅ Valid: PR date + 1 year
- ❌ Invalid: null or empty
- ❌ Invalid: Same as PR date
- ❌ Invalid: Before PR date

---

### VAL-PR-005: Department Selection

**Field**: `department_id`
**Database Column**: `purchase_requests.department_id`
**Data Type**: UUID / string

**Validation Rule**: Department must be selected and user must have access to the selected department.

**Rationale**: Ensures proper organizational accountability and access control.

**Implementation Requirements**:
- **Client-Side**: Dropdown showing only departments user has access to. Default to user's primary department.
- **Server-Side**: Verify department exists and user has access (see VAL-PR-303).
- **Database**: Foreign key to departments table. NOT NULL constraint.

**Error Code**: VAL-PR-005
**Error Message**: "Department is required"
**User Action**: User must select a department from their accessible list.

**Test Cases**:
- ✅ Valid: User's primary department UUID
- ✅ Valid: Any department UUID user has access to
- ❌ Invalid: null or empty
- ❌ Invalid: Non-existent department UUID
- ❌ Invalid: Department UUID user doesn't have access to

---

### VAL-PR-006: Location Selection

**Field**: `location_id`
**Database Column**: `purchase_requests.location_id`
**Data Type**: UUID / string

**Validation Rule**: Location must be selected and user must have access to the selected location.

**Rationale**: Determines delivery address and inventory allocation.

**Implementation Requirements**:
- **Client-Side**: Dropdown filtered by selected department. Default to user's primary location.
- **Server-Side**: Verify location exists and belongs to selected department.
- **Database**: Foreign key to locations table. NOT NULL constraint.

**Error Code**: VAL-PR-006
**Error Message**: "Location is required"
**User Action**: User must select a location from the available list for their department.

**Test Cases**:
- ✅ Valid: Valid location UUID for selected department
- ❌ Invalid: null or empty
- ❌ Invalid: Location UUID from different department
- ❌ Invalid: Non-existent location UUID

---

### VAL-PR-007: Currency Code

**Field**: `currency_code`
**Database Column**: `purchase_requests.currency_code`
**Data Type**: VARCHAR(3) / string

**Validation Rule**: Currency code must be a valid 3-letter ISO 4217 currency code (e.g., USD, EUR, GBP).

**Rationale**: Standardizes currency representation and enables multi-currency support.

**Implementation Requirements**:
- **Client-Side**: Dropdown showing only active currencies. Default to location's default currency.
- **Server-Side**: Verify currency code exists in currencies master table.
- **Database**: Foreign key to currencies table. Default value based on system config.

**Error Code**: VAL-PR-007
**Error Message**: "Invalid currency code. Must be 3-letter ISO code (e.g., USD)"
**User Action**: User must select a valid currency from the dropdown.

**Test Cases**:
- ✅ Valid: "USD"
- ✅ Valid: "EUR"
- ✅ Valid: "GBP"
- ❌ Invalid: "US" (not 3 letters)
- ❌ Invalid: "usd" (must be uppercase)
- ❌ Invalid: "ABC" (not a valid currency)

---

### VAL-PR-008: Exchange Rate

**Field**: `exchange_rate`
**Database Column**: `purchase_requests.exchange_rate`
**Data Type**: DECIMAL(15,6) / number

**Validation Rule**: Exchange rate must be a positive number with up to 6 decimal places. Must not be 1.0 if currency differs from base currency.

**Rationale**: Accurate currency conversion for multi-currency transactions.

**Implementation Requirements**:
- **Client-Side**: Auto-populate from currency master when currency selected. Allow manual override. Display with 6 decimal precision.
- **Server-Side**: Verify exchange rate > 0. If currency ≠ base currency, verify rate ≠ 1.0.
- **Database**: CHECK constraint: exchange_rate > 0. Default = 1.0.

**Error Code**: VAL-PR-008
**Error Message**:
- If ≤ 0: "Exchange rate must be positive"
- If = 1.0 with different currency: "Exchange rate must differ from 1.0 when using non-base currency"

**User Action**: User should use system-provided rate or enter correct current rate.

**Test Cases**:
- ✅ Valid: 1.185432 (EUR to USD)
- ✅ Valid: 0.850000 (USD to EUR)
- ✅ Valid: 1.0 (when currency = base currency)
- ❌ Invalid: 0 or negative
- ❌ Invalid: 1.0 (when currency ≠ base currency)

---

### VAL-PR-009: Amount Fields

**Fields**: `subtotal`, `tax_amount`, `discount_amount`, `total_amount`
**Database Columns**: Various in `purchase_requests` table
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: All monetary amounts must be non-negative numbers with exactly 2 decimal places. Maximum value: 9,999,999,999.99.

**Rationale**: Financial accuracy and consistency.

**Implementation Requirements**:
- **Client-Side**: Format with 2 decimals. Show currency symbol. Auto-calculate totals.
- **Server-Side**: Verify precision and range. Verify calculation accuracy (see VAL-PR-203).
- **Database**: CHECK constraints for non-negative and maximum values.

**Error Code**: VAL-PR-009
**Error Message**:
- If negative: "Amount cannot be negative"
- If too many decimals: "Amount can have at most 2 decimal places"
- If exceeds maximum: "Amount exceeds maximum allowed value"

**User Action**: User must enter valid monetary amounts. System auto-calculates totals from line items.

**Test Cases**:
- ✅ Valid: 0.00
- ✅ Valid: 1234.56
- ✅ Valid: 9999999999.99
- ❌ Invalid: -10.00 (negative)
- ❌ Invalid: 123.456 (3 decimal places)
- ❌ Invalid: 10000000000.00 (exceeds maximum)

---

### VAL-PR-010: Notes Fields

**Fields**: `notes`, `internal_notes`
**Database Columns**: `purchase_requests.notes`, `purchase_requests.internal_notes`
**Data Type**: TEXT / string

**Validation Rule**:
- `notes`: Optional, maximum 5,000 characters
- `internal_notes`: Optional, maximum 2,000 characters

**Rationale**: Provides space for justification and context while preventing excessive data.

**Implementation Requirements**:
- **Client-Side**: Textarea with character counter. Show remaining characters. Warn when approaching limit.
- **Server-Side**: Verify length does not exceed maximum. Sanitize for XSS prevention.
- **Database**: Column types accommodate maximum lengths.

**Error Code**: VAL-PR-010
**Error Message**:
- "Notes cannot exceed 5,000 characters"
- "Internal notes cannot exceed 2,000 characters"

**User Action**: User must shorten text to within limit.

**Test Cases**:
- ✅ Valid: Empty (both optional)
- ✅ Valid: 5,000 characters for notes
- ✅ Valid: 2,000 characters for internal notes
- ❌ Invalid: 5,001 characters for notes
- ❌ Invalid: 2,001 characters for internal notes

---

### VAL-PR-011: Line Item - Description

**Field**: `description`
**Database Column**: `purchase_request_items.description`
**Data Type**: TEXT / string

**Validation Rule**: Description is required, minimum 3 characters, maximum 500 characters.

**Rationale**: Ensures clear identification of requested items.

**Implementation Requirements**:
- **Client-Side**: Text input with character counter. Show error if < 3 chars on blur.
- **Server-Side**: Trim whitespace, verify length requirements.
- **Database**: NOT NULL constraint.

**Error Code**: VAL-PR-011
**Error Message**:
- If empty: "Item description is required"
- If too short: "Item description must be at least 3 characters"
- If too long: "Item description cannot exceed 500 characters"

**User Action**: User must provide meaningful description of the item.

**Test Cases**:
- ✅ Valid: "Office chairs - ergonomic with lumbar support"
- ✅ Valid: "Paper" (minimum length met)
- ❌ Invalid: "" (empty)
- ❌ Invalid: "ab" (too short)
- ❌ Invalid: 501-character string (too long)

---

### VAL-PR-012: Line Item - Quantity

**Field**: `quantity`
**Database Column**: `purchase_request_items.quantity`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: Quantity must be greater than 0, with maximum 3 decimal places. Maximum value: 999,999.999.

**Rationale**: Allows fractional quantities (e.g., 2.5 kg) while enforcing positive values.

**Implementation Requirements**:
- **Client-Side**: Number input, min = 0.001, step = 0.001. Show 3 decimal places.
- **Server-Side**: Verify quantity > 0 and precision ≤ 3 decimals.
- **Database**: CHECK constraint: quantity > 0.

**Error Code**: VAL-PR-012
**Error Message**:
- If ≤ 0: "Quantity must be greater than 0"
- If too many decimals: "Quantity can have at most 3 decimal places"
- If exceeds max: "Quantity exceeds maximum allowed value"

**User Action**: User must enter positive quantity with appropriate precision.

**Test Cases**:
- ✅ Valid: 1
- ✅ Valid: 10.5
- ✅ Valid: 0.001
- ✅ Valid: 999999.999
- ❌ Invalid: 0
- ❌ Invalid: -5
- ❌ Invalid: 10.1234 (4 decimal places)

---

### VAL-PR-013: Line Item - Unit Price

**Field**: `unit_price`
**Database Column**: `purchase_request_items.unit_price`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Unit price must be non-negative with exactly 2 decimal places. Maximum: 9,999,999.99.

**Rationale**: Standard monetary precision for pricing.

**Implementation Requirements**:
- **Client-Side**: Number input with 2 decimal places. Allow 0.00 for draft PRs.
- **Server-Side**: Verify precision and range. For submission, verify > 0 (see VAL-PR-108).
- **Database**: CHECK constraint: unit_price >= 0.

**Error Code**: VAL-PR-013
**Error Message**:
- If negative: "Unit price cannot be negative"
- If too many decimals: "Unit price must have exactly 2 decimal places"
- If exceeds max: "Unit price exceeds maximum allowed value"

**User Action**: User must enter valid price. Zero allowed for draft but required for submission.

**Test Cases**:
- ✅ Valid: 0.00 (for draft)
- ✅ Valid: 10.50
- ✅ Valid: 9999999.99
- ❌ Invalid: -1.00
- ❌ Invalid: 10.505 (3 decimals)

---

### VAL-PR-014: Line Item - Unit of Measure

**Field**: `unit_of_measure`
**Database Column**: `purchase_request_items.unit_of_measure`
**Data Type**: VARCHAR(20) / string

**Validation Rule**: Unit of measure must be selected from predefined list (e.g., PC, KG, L, BOX, EA).

**Rationale**: Standardizes quantity measurements for inventory and ordering.

**Implementation Requirements**:
- **Client-Side**: Dropdown from units_of_measure master table. Common units first.
- **Server-Side**: Verify UOM code exists in master table.
- **Database**: Foreign key to units_of_measure table. NOT NULL constraint.

**Error Code**: VAL-PR-014
**Error Message**: "Unit of measure is required"
**User Action**: User must select appropriate unit from the dropdown.

**Common Units**:
- PC (Pieces), EA (Each), BOX (Box), CASE (Case)
- KG (Kilograms), G (Grams), LB (Pounds)
- L (Liters), ML (Milliliters), GAL (Gallons)
- M (Meters), CM (Centimeters), FT (Feet)

**Test Cases**:
- ✅ Valid: "PC"
- ✅ Valid: "KG"
- ❌ Invalid: "" (empty)
- ❌ Invalid: "XYZ" (not in master table)

---

### VAL-PR-030: On-Hand Quantity Display Validation

**Rule Description**: On-hand inventory quantity must be displayed as a read-only, non-negative integer fetched from the Inventory Management System API.

**Business Justification**: Ensures accurate real-time inventory data is displayed to inform purchasing decisions.

**Validation Logic**:
- **Client-Side**: Display on-hand as read-only field with formatted integer (comma separators).
- **Server-Side**: Query Inventory API for current stock level; handle API failures gracefully.
- **Database**: Not stored in PR tables; fetched in real-time.

**Error Code**: VAL-PR-030
**Error Message**: "Unable to load on-hand quantity. Please try again."
**User Action**: Retry or proceed without inventory data if API unavailable.

**Test Cases**:
- ✅ Valid: API returns 150 → Display "150"
- ✅ Valid: API returns 1250 → Display "1,250"
- ✅ Valid: API unavailable → Display "N/A"
- ❌ Invalid: Display as editable field

---

### VAL-PR-031: On-Order Quantity Display Validation

**Rule Description**: On-order quantity must be displayed as a read-only, non-negative integer fetched from the Purchase Order System API.

**Business Justification**: Provides visibility into pending orders to avoid duplicate purchases.

**Validation Logic**:
- **Client-Side**: Display on-order as read-only field with formatted integer.
- **Server-Side**: Query PO System API for current orders; include expected delivery dates in tooltip.
- **Database**: Not stored in PR tables; fetched in real-time.

**Error Code**: VAL-PR-031
**Error Message**: "Unable to load on-order quantity. Please try again."
**User Action**: Retry or proceed without on-order data if API unavailable.

**Test Cases**:
- ✅ Valid: API returns 50 → Display "50" with delivery date tooltip
- ✅ Valid: API returns 0 → Display "0"
- ✅ Valid: API unavailable → Display "N/A"
- ❌ Invalid: Display as editable field

---

### VAL-PR-032: FOC Field Visibility Validation

**Rule Description**: FOC (Free of Charge) fields must be hidden from Requestor role and visible only to Approver, Procurement, and Finance roles.

**Business Justification**: FOC decisions are procurement-level and should not be exposed during initial PR creation.

**Validation Logic**:
- **Client-Side**: Hide foc_quantity and foc_unit fields based on user role.
- **Server-Side**: Reject FOC data from unauthorized roles with 403 error.
- **Database**: Store FOC fields regardless of user role; enforce role-based access on API.

**Error Code**: VAL-PR-032
**Error Message**: "You do not have permission to set FOC values."
**User Action**: Remove FOC data or escalate to authorized user.

**Test Cases**:
- ✅ Valid: Requestor → FOC fields hidden
- ✅ Valid: Approver → FOC fields visible and editable
- ❌ Invalid: Requestor submits FOC data → API returns 403 error
- ❌ Invalid: Unauthorized role accesses FOC via API → 403 error

---

### VAL-PR-033: Price Visibility Toggle Validation

**Rule Description**: The hide_price toggle must be available only to Requestor role and must not affect pricing data storage or visibility for approvers.

**Business Justification**: Allows Requestors to focus on specifications while ensuring approvers always see complete pricing information.

**Validation Logic**:
- **Client-Side**: Display hide_price toggle only for Requestor during creation; hide pricing fields when toggle is true.
- **Server-Side**: Store hide_price flag; API returns pricing based on role (Requestor respects flag; Approvers ignore flag).
- **Database**: Store hide_price as BOOLEAN (default: false); all pricing fields remain populated.

**Error Code**: VAL-PR-033
**Error Message**: "Price visibility setting cannot be changed after PR submission."
**User Action**: Edit PR before submission if price visibility needs to change.

**Test Cases**:
- ✅ Valid: Requestor sets hide_price = true → Pricing fields hidden
- ✅ Valid: Approver views PR with hide_price = true → Sees all prices
- ✅ Valid: hide_price = false → All users see prices (if authorized)
- ❌ Invalid: Requestor attempts to change hide_price after submission → Error
- ❌ Invalid: Approver affected by hide_price flag → Prices must always be visible

---

### VAL-PR-034: Vendor Name Required with Unit Price

**Rule Description**: Vendor name is mandatory when unit_price is entered for a PR item.

**Business Justification**: Ensures complete pricing information for procurement and sourcing decisions.

**Validation Logic**:
- **Client-Side**: Mark vendor_name as required if unit_price > 0; display validation error on blur.
- **Server-Side**: Reject PR submission if any item has unit_price but missing vendor_name.
- **Database**: Enforce NOT NULL constraint when unit_price IS NOT NULL.

**Error Code**: VAL-PR-034
**Error Message**: "Vendor name is required when unit price is specified."
**User Action**: Enter vendor name or remove unit price.

**Test Cases**:
- ✅ Valid: unit_price = 10.50 AND vendor_name = "ABC Supplies"
- ✅ Valid: unit_price = NULL AND vendor_name = NULL
- ❌ Invalid: unit_price = 10.50 AND vendor_name = "" → Error
- ❌ Invalid: unit_price = 15.00 AND vendor_name = NULL → Error

---

### VAL-PR-035: Net Amount Calculation Validation

**Rule Description**: Net amount must equal (unit_price × quantity) - discount_amount with precision to 2 decimal places.

**Business Justification**: Ensures accurate financial calculations for budgeting and reporting.

**Validation Logic**:
- **Client-Side**: Auto-calculate net_amount; display in real-time as user inputs unit_price, quantity, or discount.
- **Server-Side**: Recalculate net_amount and verify against client value; reject if mismatch > $0.01.
- **Database**: Store net_amount as DECIMAL(15,2); ensure non-negative.

**Error Code**: VAL-PR-035
**Error Message**: "Net amount calculation is incorrect. Expected: $XX.XX"
**User Action**: System auto-corrects; user cannot manually edit.

**Formula**: `net_amount = (unit_price × quantity) - discount_amount`

**Test Cases**:
- ✅ Valid: unit_price = 10.00, quantity = 5, discount = 5.00 → net_amount = 45.00
- ✅ Valid: unit_price = 12.50, quantity = 10, discount = 0 → net_amount = 125.00
- ❌ Invalid: discount_amount > (unit_price × quantity) → net_amount cannot be negative
- ❌ Invalid: Manual entry of net_amount → Field is read-only

---

### VAL-PR-036: Tax Amount Calculation Validation

**Rule Description**: Tax amount must equal net_amount × (tax_rate / 100) with precision to 2 decimal places.

**Business Justification**: Ensures accurate tax calculations for financial reporting and compliance.

**Validation Logic**:
- **Client-Side**: Auto-calculate tax_amount; update in real-time when net_amount or tax_rate changes.
- **Server-Side**: Recalculate tax_amount and verify against client value; reject if mismatch > $0.01.
- **Database**: Store tax_amount as DECIMAL(15,2); ensure non-negative.

**Error Code**: VAL-PR-036
**Error Message**: "Tax amount calculation is incorrect. Expected: $XX.XX"
**User Action**: System auto-corrects; user cannot manually edit.

**Formula**: `tax_amount = net_amount × (tax_rate / 100)`

**Test Cases**:
- ✅ Valid: net_amount = 45.00, tax_rate = 8 → tax_amount = 3.60
- ✅ Valid: net_amount = 100.00, tax_rate = 10 → tax_amount = 10.00
- ✅ Valid: net_amount = 100.00, tax_rate = 0 → tax_amount = 0.00
- ❌ Invalid: Manual entry of tax_amount → Field is read-only
- ❌ Invalid: tax_amount = 5.00 when net_amount = 45.00, tax_rate = 8 → Should be 3.60

---

### VAL-PR-037: Total Amount Per Line Calculation Validation

**Rule Description**: Total amount per line must equal net_amount + tax_amount with precision to 2 decimal places.

**Business Justification**: Ensures line totals are accurate for budgeting and approval decisions.

**Validation Logic**:
- **Client-Side**: Auto-calculate total_amount; display in real-time as net_amount or tax_amount changes.
- **Server-Side**: Recalculate total_amount and verify against client value; reject if mismatch > $0.01.
- **Database**: Store total_amount as DECIMAL(15,2); ensure non-negative.

**Error Code**: VAL-PR-037
**Error Message**: "Total amount calculation is incorrect. Expected: $XX.XX"
**User Action**: System auto-corrects; user cannot manually edit.

**Formula**: `total_amount = net_amount + tax_amount`

**Test Cases**:
- ✅ Valid: net_amount = 45.00, tax_amount = 3.60 → total_amount = 48.60
- ✅ Valid: net_amount = 100.00, tax_amount = 10.00 → total_amount = 110.00
- ❌ Invalid: Manual entry of total_amount → Field is read-only
- ❌ Invalid: total_amount = 50.00 when net_amount = 45.00, tax_amount = 3.60 → Should be 48.60

---

### VAL-PR-038: Comment Field Length Validation

**Rule Description**: Comment field must not exceed 500 characters.

**Business Justification**: Prevents excessively long comments while allowing sufficient space for delivery instructions.

**Validation Logic**:
- **Client-Side**: Display character counter (e.g., "245/500"); disable input at 500 characters.
- **Server-Side**: Reject PR submission if comment length > 500 characters.
- **Database**: Store comment as VARCHAR(500).

**Error Code**: VAL-PR-038
**Error Message**: "Comment cannot exceed 500 characters. Current: XXX"
**User Action**: Shorten comment to 500 characters or less.

**Test Cases**:
- ✅ Valid: Comment = "Deliver to back entrance" (25 characters)
- ✅ Valid: Comment = 500-character string
- ✅ Valid: Comment = NULL or "" (optional field)
- ❌ Invalid: Comment = 501-character string → Error

---

### VAL-PR-039: Required Date Future Validation

**Rule Description**: Required date for PR item must be today or a future date; cannot be in the past.

**Business Justification**: Ensures realistic delivery expectations and prevents logistical errors.

**Validation Logic**:
- **Client-Side**: Date picker restricts selection to current date and future dates.
- **Server-Side**: Validate required_date >= CURRENT_DATE; reject if past date.
- **Database**: Store required_date as DATE; no constraint (nullable field).

**Error Code**: VAL-PR-039
**Error Message**: "Required date cannot be in the past. Please select today or a future date."
**User Action**: Select current date or future date.

**Test Cases**:
- ✅ Valid: required_date = 2025-01-15 (today's date)
- ✅ Valid: required_date = 2025-02-01 (future date)
- ✅ Valid: required_date = NULL (optional field)
- ❌ Invalid: required_date = 2025-01-01 (past date) → Error

---

### VAL-PR-040: Delivery Point Selection Validation

**Rule Description**: Selected delivery point must exist in the delivery_points master table and be active.

**Business Justification**: Ensures items are delivered to valid, operational locations.

**Validation Logic**:
- **Client-Side**: Dropdown loads only active delivery points (active_flag = true); user cannot enter custom value.
- **Server-Side**: Verify delivery_point exists in delivery_points table with active_flag = true.
- **Database**: Foreign key constraint to delivery_points table; nullable field.

**Error Code**: VAL-PR-040
**Error Message**: "Selected delivery point is invalid or inactive."
**User Action**: Select a valid delivery point from the dropdown.

**Test Cases**:
- ✅ Valid: delivery_point = uuid of active delivery point
- ✅ Valid: delivery_point = NULL (optional field)
- ❌ Invalid: delivery_point = uuid not in delivery_points table → Foreign key error
- ❌ Invalid: delivery_point = uuid where active_flag = false → Error

---

### VAL-PR-041: Delivery Point Label Auto-Population Validation

**Rule Description**: Delivery point label must be auto-populated from the selected delivery point's name field; cannot be manually edited.

**Business Justification**: Ensures consistency between delivery_point and delivery_point_label fields.

**Validation Logic**:
- **Client-Side**: Auto-populate delivery_point_label when delivery_point is selected; field is read-only.
- **Server-Side**: Verify delivery_point_label matches delivery_points.name for selected delivery_point.
- **Database**: Store delivery_point_label as VARCHAR(100); nullable; no unique constraint.

**Error Code**: VAL-PR-041
**Error Message**: "Delivery point label does not match selected delivery point."
**User Action**: System auto-corrects; user cannot manually edit.

**Test Cases**:
- ✅ Valid: delivery_point selected → delivery_point_label auto-populated with delivery_points.name
- ✅ Valid: delivery_point = NULL → delivery_point_label = NULL
- ❌ Invalid: Manual edit of delivery_point_label → Field is read-only
- ❌ Invalid: delivery_point_label ≠ delivery_points.name → Server corrects

---

### VAL-PR-042: Override Amount Positive Validation

**Rule Description**: Override amount, if specified, must be greater than zero.

**Business Justification**: Prevents invalid override amounts that could cause financial errors.

**Validation Logic**:
- **Client-Side**: Validate override_amount > 0 on input; display error if ≤ 0.
- **Server-Side**: Reject PR if override_amount ≤ 0; accept NULL (no override).
- **Database**: Store override_amount as DECIMAL(15,2); CHECK constraint (override_amount IS NULL OR override_amount > 0).

**Error Code**: VAL-PR-042
**Error Message**: "Override amount must be greater than zero."
**User Action**: Enter positive override amount or remove override.

**Test Cases**:
- ✅ Valid: override_amount = 50.00
- ✅ Valid: override_amount = NULL (no override)
- ❌ Invalid: override_amount = 0 → Error
- ❌ Invalid: override_amount = -10.00 → Error

---

### VAL-PR-043: Monetary Amount Format Validation

**Rule Description**: All monetary amounts must be formatted with 2 decimal places, thousands separators, and appropriate currency symbol.

**Business Justification**: Ensures professional, consistent financial data presentation and reduces user input errors.

**Validation Logic**:
- **Client-Side**: Auto-format monetary fields with 2 decimals and comma separators as user types.
- **Server-Side**: Round to 2 decimal places; store as DECIMAL(15,2).
- **Database**: All monetary fields are DECIMAL(15,2).

**Error Code**: VAL-PR-043
**Error Message**: "Invalid amount format. Please enter a valid monetary amount."
**User Action**: Enter numeric value; system auto-formats.

**Format Standards**:
- **Display**: "$1,234.56" or "1.234,56 €" (locale-specific)
- **Input**: Accept "1234.56", "1,234.56", "$1234.56"
- **Storage**: 1234.56 (DECIMAL)

**Test Cases**:
- ✅ Valid: User enters "1234.56" → Display "$1,234.56"
- ✅ Valid: User enters "1234.5" → Display "$1,234.50"
- ✅ Valid: User enters "1234" → Display "$1,234.00"
- ❌ Invalid: User enters "abc" → Error
- ❌ Invalid: User enters "12.345" → Round to "$12.35"

---

## 3. Business Rule Validations (VAL-PR-101 to 199)

### VAL-PR-101: Minimum Line Items for Submission

**Rule Description**: A purchase request must contain at least one line item before it can be submitted for approval.

**Business Justification**: Prevents submission of empty or incomplete purchase requests.

**Validation Logic**:
1. Count line items where deleted_at IS NULL
2. Verify count >= 1
3. Allow saving draft with 0 items, but prevent submission

**When Validated**: On submission attempt (not on save as draft)

**Implementation Requirements**:
- **Client-Side**: Disable "Submit" button if no items added. Show message "Add at least one item to submit".
- **Server-Side**: Check line item count before creating approval records. Reject if count = 0.
- **Database**: Not enforced at database level (business logic only).

**Error Code**: VAL-PR-101
**Error Message**: "Purchase request must have at least one item before submission"
**User Action**: User must add at least one line item, then can submit.

**Related Business Requirements**: BR-PR-003

**Examples**:

**Valid Case**:
- PR with 1 line item
- PR with 50 line items
- Result: ✅ Can be submitted

**Invalid Case**:
- PR with 0 line items
- User clicks "Submit"
- Result: ❌ Validation fails
- User must: Add at least one line item before submitting

---

### VAL-PR-102: Unit Prices Required for Submission

**Rule Description**: All line items must have a unit price greater than zero before the PR can be submitted.

**Business Justification**: Ensures accurate budget impact and approval based on complete financial information.

**Validation Logic**:
1. For each line item, check unit_price > 0
2. All items must meet this criteria
3. Allow zero prices in draft status for estimation purposes

**When Validated**: On submission attempt

**Implementation Requirements**:
- **Client-Side**: Show warning icon next to items with zero price. Disable submit if any zero prices exist.
- **Server-Side**: Iterate through all items, reject submission if any unit_price = 0.
- **Database**: Not enforced (allows drafts with zero prices).

**Error Code**: VAL-PR-102
**Error Message**: "All items must have a unit price greater than zero before submission. {count} items need prices."
**User Action**: User must enter unit prices for all items.

**Related Business Requirements**: BR-PR-004

**Examples**:

**Valid Case**:
- Item 1: Qty 10, Price $5.00
- Item 2: Qty 5, Price $12.50
- All items have prices > 0
- Result: ✅ Can be submitted

**Invalid Case**:
- Item 1: Qty 10, Price $5.00
- Item 2: Qty 5, Price $0.00
- User clicks "Submit"
- Result: ❌ Validation fails
- User must: Enter price for Item 2

---

### VAL-PR-103: Budget Availability Check

**Rule Description**: When a budget code is specified, the total PR amount must not exceed the available budget for that code.

**Business Justification**: Prevents overspending and ensures financial controls are maintained.

**Validation Logic**:
1. Identify all line items with budget codes
2. Group by budget code
3. For each budget code:
   - Query budget system for available amount
   - Sum requested amounts for that code
   - Compare: available >= requested
4. All budget codes must have sufficient funds

**When Validated**: On submission, or when budget code/amounts change after submission

**Implementation Requirements**:
- **Client-Side**: Show budget availability indicator next to budget code field (green/yellow/red based on availability).
- **Server-Side**: Call budget system API to verify availability. Reject if insufficient. Reserve funds on successful submission.
- **Database**: Not enforced (requires external system integration).

**Error Code**: VAL-PR-103
**Error Message**: "Insufficient budget available. Budget: {code}, Available: {available}, Requested: {requested}, Shortfall: {shortfall}"
**User Action**: User must reduce amounts, use different budget code, or request budget increase.

**Special Cases**:
- If budget system unavailable: Admin can override with justification
- Multi-currency: Convert all amounts to budget currency before comparison
- Reserved budget from other pending PRs: Counts against available amount

**Related Business Requirements**: BR-PR-008

**Examples**:

**Valid Case**:
- Budget Code: DEPT-2025-F&B
- Available: $10,000
- Requested: $5,000
- Result: ✅ Validation passes

**Invalid Case**:
- Budget Code: DEPT-2025-F&B
- Available: $2,000
- Requested: $5,000
- Result: ❌ Validation fails
- Shortfall: $3,000
- User must: Reduce amount to $2,000 or less, or use different budget code

---

### VAL-PR-104: Approval Threshold and Chain Determination

**Rule Description**: Purchase requests must follow defined approval rules based on type, amount, and department.

**Business Justification**: Ensures appropriate oversight at different value levels and for different types of purchases.

**Validation Logic**:
1. Identify PR type (General/Market List/Asset)
2. Calculate total amount in base currency
3. Query approval_rules table for matching rule:
   - WHERE pr_type = {type}
   - AND {amount} BETWEEN min_amount AND max_amount
   - AND (department_id = {dept} OR department_id IS NULL)
4. Build approval chain based on matching rule
5. Verify all required approvers are assigned

**Approval Tiers (General Type)**:
- $0 - $5,000: Department Manager only
- $5,001 - $25,000: Dept Manager → Finance Manager
- $25,001 - $100,000: Dept Manager → Finance → General Manager
- Above $100,000: Dept Manager → Finance → General Manager → Executive

**Market List Rules**:
- Under $500: Auto-approved (no approval needed)
- $500+: Treated as General type

**Asset Rules**:
- Any amount: Dept Manager + Asset Manager + Finance (parallel approval)

**When Validated**: On submission, before creating approval records

**Implementation Requirements**:
- **Client-Side**: Display expected approval chain before submission (read-only preview).
- **Server-Side**: Execute approval determination logic. Verify all roles have assigned users.
- **Database**: Approval rules stored in approval_rules table.

**Error Code**: VAL-PR-104
**Error Message**: "No approval workflow configured for {pr_type} type, amount {amount}, department {dept}"
**User Action**: Contact administrator to configure approval workflow.

**Related Business Requirements**: BR-PR-006, BR-PR-007, BR-PR-009, BR-PR-042, BR-PR-043, BR-PR-044

**Examples**:

**Valid Case - General $15,000**:
- Type: General
- Amount: $15,000
- Department: F&B
- Determined Chain: Dept Manager → Finance Manager
- Both roles assigned: ✅
- Result: Approval records created successfully

**Invalid Case - Missing Approver**:
- Type: Asset
- Amount: $50,000
- Department: Housekeeping
- Required: Dept Manager + Asset Manager + Finance
- Asset Manager not assigned to Housekeeping
- Result: ❌ Validation fails
- User must: Contact admin to assign Asset Manager

---

### VAL-PR-105: Market List Type Threshold

**Rule Description**: Purchase requests with type "Market List" must be below the configured threshold (default $500). Higher amounts should use "General" type.

**Business Justification**: Market List type is intended for quick, low-value perishable purchases with streamlined approval.

**Validation Logic**:
1. If PR type = "Market List"
2. Get threshold for department (query department_settings, default $500)
3. Verify total_amount < threshold
4. If amount >= threshold, reject and suggest General type

**When Validated**: On type selection, on submission

**Implementation Requirements**:
- **Client-Side**: Show threshold amount hint when Market List selected. Warn if total exceeds threshold.
- **Server-Side**: Verify amount against threshold. Reject if exceeded.
- **Database**: Not enforced (business logic only).

**Error Code**: VAL-PR-105
**Error Message**: "Market List PRs must be below {threshold} {currency}. This PR total is {total}. Please change type to 'General'."
**User Action**: User must either reduce amount below threshold or change type to "General".

**Related Business Requirements**: BR-PR-007

**Examples**:

**Valid Case**:
- Type: Market List
- Threshold: $500
- Total: $450
- Result: ✅ Validation passes

**Invalid Case**:
- Type: Market List
- Threshold: $500
- Total: $650
- Result: ❌ Validation fails
- User must: Change type to "General" or reduce amount to below $500

---

### VAL-PR-106: Asset Type Requires Asset Manager

**Rule Description**: Purchase requests with type "Asset" require that an Asset Manager is assigned to the selected department.

**Business Justification**: Asset purchases need specialized approval for capital expenditure tracking and asset management.

**Validation Logic**:
1. If PR type = "Asset"
2. Query department_approvers for department_id and role = 'asset_manager'
3. Verify at least one active asset manager exists
4. If none found, reject submission

**When Validated**: On type selection (warning), on submission (error)

**Implementation Requirements**:
- **Client-Side**: Show warning when Asset type selected if no asset manager configured.
- **Server-Side**: Verify asset manager exists before allowing submission.
- **Database**: Not enforced (business logic only).

**Error Code**: VAL-PR-106
**Error Message**: "No Asset Manager configured for department {department_name}. Asset type PRs cannot be submitted. Contact administrator."
**User Action**: User must contact administrator to assign Asset Manager to department, or change PR type.

**Related Business Requirements**: BR-PR-009, BR-PR-043

**Examples**:

**Valid Case**:
- Type: Asset
- Department: IT
- Asset Manager: John Doe (assigned to IT dept)
- Result: ✅ Can be submitted

**Invalid Case**:
- Type: Asset
- Department: Housekeeping
- Asset Manager: None assigned to Housekeeping
- Result: ❌ Validation fails
- User must: Contact admin or change type

---

### VAL-PR-107: Status Transition Rules

**Rule Description**: Purchase requests can only transition to specific statuses based on their current status.

**Business Justification**: Maintains data integrity and prevents invalid workflow states.

**Valid Status Transitions**:

**From Draft**:
- → Submitted (user submits)
- → Cancelled (user cancels)
- → Deleted (user deletes)

**From Submitted**:
- → Approved (all approvals complete)
- → Rejected (any approval rejected)
- → Draft (user recalls)
- → Cancelled (user cancels)

**From Approved**:
- → Converted (purchasing staff converts to PO)
- → Cancelled (admin cancels)

**From Rejected**:
- → Draft (user edits to resubmit)
- → Cancelled (user cancels)

**From Converted**:
- → (No transitions - terminal state)

**From Cancelled**:
- → (No transitions - terminal state)

**When Validated**: On every status change attempt

**Implementation Requirements**:
- **Client-Side**: Show only valid action buttons based on current status.
- **Server-Side**: Verify transition is allowed before updating status.
- **Database**: Trigger to log all status changes with timestamps.

**Error Code**: VAL-PR-107
**Error Message**: "Cannot change status from {current_status} to {new_status}. Invalid transition."
**User Action**: User can only perform allowed actions for current status.

**Related Business Requirements**: BR-PR-005, BR-PR-020

---

### VAL-PR-108: Delivery Date Must Be Future

**Rule Description**: At the time of submission, the delivery date must be in the future (after current date).

**Business Justification**: Prevents submission of PRs with past delivery dates that cannot be fulfilled.

**Validation Logic**:
1. On submission, get current date (server time)
2. Compare delivery_date > current_date
3. Reject if delivery date is today or in the past

**When Validated**: On submission only (not on draft save or date change)

**Implementation Requirements**:
- **Client-Side**: Show warning if delivery date is approaching current date.
- **Server-Side**: Compare delivery date against server's current date on submission.
- **Database**: Not enforced (allows drafts with past dates for editing).

**Error Code**: VAL-PR-108
**Error Message**: "Delivery date must be in the future. Current delivery date: {date} is not valid for submission."
**User Action**: User must update delivery date to a future date before submitting.

**Special Cases**:
- PR saved as draft days ago: Delivery date may have passed - must be updated before submission
- Time zones: Use server time consistently

**Related Business Requirements**: BR-PR-002

**Examples**:

**Valid Case**:
- Today: 2025-01-30
- Delivery Date: 2025-02-15
- Result: ✅ Can be submitted

**Invalid Case**:
- Today: 2025-01-30
- Delivery Date: 2025-01-25
- Result: ❌ Validation fails
- User must: Change delivery date to future date

---

## 4. Cross-Field Validations (VAL-PR-201 to 299)

### VAL-PR-201: Delivery Date After PR Date

**Fields Involved**: `date` (PR Date), `delivery_date` (Delivery Date)

**Validation Rule**: Delivery date must be after PR date, and the difference must not exceed 365 days (1 year).

**Business Justification**:
- Ensures logical temporal ordering
- Prevents unrealistic long-term delivery commitments
- Limits scope creep and outdated requirements

**Validation Logic**:
1. Calculate: difference = delivery_date - date
2. Verify: difference > 0 (delivery after PR date)
3. Verify: difference <= 365 days (within 1 year)
4. Both conditions must be true

**When Validated**: When either date changes, on form submission

**Implementation Requirements**:
- **Client-Side**:
  * Set date picker minimum for delivery_date = date + 1 day
  * Show warning if difference > 365 days
  * Highlight both fields in red if validation fails
- **Server-Side**: Validate both conditions before saving
- **Database**: CHECK constraint: delivery_date > date

**Error Code**: VAL-PR-201
**Error Message**:
- If delivery_date <= date: "Delivery date must be after PR date"
- If difference > 365 days: "Delivery date cannot be more than 1 year from PR date"

**User Action**: User must adjust one or both dates to meet requirements.

**Special Cases**:
- If PR date changes to after delivery date, automatically flag for user attention
- Business days vs calendar days: Uses calendar days (business rule, not technical constraint)

**Examples**:

**Valid Scenarios**:
- PR Date: 2025-01-15, Delivery Date: 2025-01-16 (1 day) ✅
- PR Date: 2025-01-15, Delivery Date: 2025-06-30 (166 days) ✅
- PR Date: 2025-01-15, Delivery Date: 2026-01-14 (364 days) ✅

**Invalid Scenarios**:
- PR Date: 2025-01-15, Delivery Date: 2025-01-15 (same day) ❌
- PR Date: 2025-01-15, Delivery Date: 2025-01-10 (before PR) ❌
- PR Date: 2025-01-15, Delivery Date: 2026-01-20 (370 days) ❌

---

### VAL-PR-202: Total Amount Calculation Accuracy

**Fields Involved**: Line item `quantity`, `unit_price`, `discount_percentage`, `tax_rate`, PR `subtotal`, `tax_amount`, `total_amount`

**Validation Rule**: The PR total amount must equal the sum of all line item totals, plus tax, minus discounts, within a $0.01 tolerance for rounding.

**Business Justification**: Ensures financial accuracy and prevents data corruption or manual entry errors.

**Validation Logic**:
1. For each line item:
   - line_subtotal = quantity × unit_price
   - line_discount = line_subtotal × (discount_percentage / 100)
   - line_after_discount = line_subtotal - line_discount
   - line_tax = line_after_discount × (tax_rate / 100)
   - line_total = line_after_discount + line_tax

2. Sum all line items:
   - calculated_subtotal = Σ line_after_discount
   - calculated_tax = Σ line_tax
   - calculated_total = calculated_subtotal + calculated_tax

3. Compare with PR amounts:
   - |calculated_total - total_amount| <= 0.01

4. Allow $0.01 difference for rounding

**When Validated**: After any line item changes, before submission

**Implementation Requirements**:
- **Client-Side**: Automatically recalculate and update totals when line items change. User cannot manually edit totals.
- **Server-Side**: Recalculate totals and verify accuracy before saving. Auto-correct if needed.
- **Database**: Database triggers recalculate totals on line item INSERT/UPDATE/DELETE.

**Error Code**: VAL-PR-202
**Error Message**: "Total amount inconsistency detected. Calculated: {calculated}, Provided: {provided}. System will auto-correct."
**User Action**: System automatically corrects the total. No user action needed unless calculation logic error suspected.

**Rounding Rules**:
- Round to 2 decimal places at each calculation step
- Use banker's rounding (round half to even)
- Apply consistently across all calculations

**Examples**:

**Valid Scenario**:
- Line 1: 10 × $5.00 = $50.00, Discount 10% = $5.00, After Discount = $45.00, Tax 10% = $4.50, Total = $49.50
- Line 2: 5 × $3.50 = $17.50, No Discount, Tax 10% = $1.75, Total = $19.25
- PR Subtotal: $62.50
- PR Tax: $6.25
- PR Total: $68.75
- Calculated: $68.75
- Result: ✅ Match (difference = $0.00)

**Invalid Scenario**:
- Calculated Total: $68.75
- PR Total: $75.00
- Difference: $6.25 (exceeds $0.01 threshold)
- Result: ❌ Validation fails
- System: Auto-corrects to $68.75

---

### VAL-PR-203: Currency Consistency

**Fields Involved**: `currency_code`, `exchange_rate`, `base_currency_code`

**Validation Rule**: If transaction currency differs from base currency, exchange rate must not equal 1.0. If same currency, rate must equal 1.0.

**Business Justification**: Ensures accurate currency conversion and prevents data entry errors.

**Validation Logic**:
1. If currency_code = base_currency_code:
   - Verify exchange_rate = 1.0
2. If currency_code ≠ base_currency_code:
   - Verify exchange_rate ≠ 1.0
   - Verify exchange_rate > 0

**When Validated**: When currency or exchange rate changes

**Implementation Requirements**:
- **Client-Side**: Auto-set exchange rate to 1.0 when currencies match. Prevent manual entry of 1.0 for different currencies.
- **Server-Side**: Validate currency-rate relationship before saving.
- **Database**: Not enforced (business logic only).

**Error Code**: VAL-PR-203
**Error Message**:
- If same currency but rate ≠ 1.0: "Exchange rate must be 1.0 when currency is same as base currency"
- If different currency but rate = 1.0: "Exchange rate cannot be 1.0 when using non-base currency"

**User Action**: User should accept system-provided exchange rate or enter correct current market rate.

**Examples**:

**Valid Scenarios**:
- Currency: USD, Base: USD, Rate: 1.0 ✅
- Currency: EUR, Base: USD, Rate: 1.185432 ✅
- Currency: GBP, Base: USD, Rate: 0.789012 ✅

**Invalid Scenarios**:
- Currency: USD, Base: USD, Rate: 1.05 ❌
- Currency: EUR, Base: USD, Rate: 1.0 ❌

---

## 5. Security Validations (VAL-PR-301 to 399)

### VAL-PR-301: Create Permission Check

**Validation Rule**: User must have `create_purchase_request` permission to create a new PR.

**When Validated**: Before displaying create form, before saving new PR

**Implementation Requirements**:
- **Client-Side**: Hide "New Purchase Request" button if user lacks permission.
- **Server-Side**: Verify permission in user's role before allowing create operation.
- **Database**: RLS policy checks user permissions.

**Error Code**: VAL-PR-301
**Error Message**: "You do not have permission to create purchase requests"
**User Action**: User must request permission from administrator.

---

### VAL-PR-302: Department Access Validation

**Validation Rule**: User can only create/view PRs for departments they have access to.

**Access Rules**:
- User must be assigned to department to create PRs for it
- Department managers can view all PRs for their departments
- Approvers can view PRs pending their approval

**When Validated**: On create (department selection), on view (list filtering)

**Implementation Requirements**:
- **Client-Side**: Department dropdown shows only accessible departments.
- **Server-Side**: Verify user_departments table for access before creating/viewing PR.
- **Database**: RLS policies filter based on user_departments relationships.

**Error Code**: VAL-PR-302
**Error Message**: "You do not have access to the selected department"
**User Action**: User must select a department they have access to.

---

### VAL-PR-303: Location Access Validation

**Validation Rule**: User can only create PRs for locations they have access to, and location must belong to selected department.

**When Validated**: On create (location selection)

**Implementation Requirements**:
- **Client-Side**: Location dropdown filtered by selected department and user access.
- **Server-Side**: Verify user_locations table and location-department relationship.
- **Database**: RLS policies enforce location access.

**Error Code**: VAL-PR-303
**Error Message**: "You do not have access to the selected location"
**User Action**: User must select an accessible location for the selected department.

---

### VAL-PR-304: Ownership Validation for Editing

**Validation Rule**: User can only edit PRs they created, unless they have admin or manager permissions.

**Exceptions**:
- Users with `edit_all_purchase_requests` permission can edit any PR
- Department managers can edit PRs from their department

**When Validated**: Before displaying edit form, before saving updates

**Implementation Requirements**:
- **Client-Side**: Disable edit button if user is not owner and lacks admin permission.
- **Server-Side**: Verify created_by = current_user_id OR user has override permission.
- **Database**: RLS policies check ownership.

**Error Code**: VAL-PR-304
**Error Message**: "You can only edit your own purchase requests"
**User Action**: User cannot proceed. Only owner or admin can edit.

---

### VAL-PR-305: Approver Authorization

**Validation Rule**: User can only approve/reject PRs where they are the designated approver for the current approval stage.

**When Validated**: Before displaying approval buttons, before processing approval action

**Implementation Requirements**:
- **Client-Side**: Show approval buttons only if user is current stage approver.
- **Server-Side**: Verify pr_approvals.approver_id = current_user_id AND status = 'Pending'.
- **Database**: RLS policies on pr_approvals table.

**Error Code**: VAL-PR-305
**Error Message**: "You are not authorized to approve this purchase request"
**User Action**: User cannot proceed. Only designated approver can approve.

---

### VAL-PR-306: Input Sanitization

**Validation Rule**: All text inputs must be sanitized to prevent XSS and injection attacks.

**Sanitization Rules**:
- Remove `<script>` tags and javascript: URLs
- Escape HTML special characters (< > & " ')
- Trim excessive whitespace
- Limit input lengths
- Reject SQL keywords in unexpected contexts

**When Validated**: On all text field input, before saving to database

**Implementation Requirements**:
- **Client-Side**: Basic sanitization for UX (mainly trimming).
- **Server-Side**: Comprehensive sanitization before database operations.
- **Database**: Always use parameterized queries (never concatenate user input).

**Error Code**: VAL-PR-306
**Error Message**: "Input contains invalid or potentially harmful content"
**User Action**: User must remove problematic content (scripts, malicious code) and resubmit.

**Forbidden Content**:
- `<script>` tags
- `javascript:` URLs
- `onclick=` or other event handlers
- SQL injection patterns
- Extremely long strings

---

## 6. Validation Error Messages

### Error Message Principles

1. **Be Specific**: Tell user exactly what's wrong
2. **Be Actionable**: Explain how to fix the problem
3. **Be Kind**: Use friendly, helpful tone
4. **Be Consistent**: Same format throughout application
5. **Avoid Technical Jargon**: Use plain language

### Standard Message Format

```
[Field Name] {problem description}. {Expected format or corrective action}.
```

### Examples of Good Error Messages

✅ "Email address is required. Please enter your email."
✅ "Delivery date must be after PR date. Please select a later date."
✅ "Insufficient budget available ($2,000). Please reduce amount to $2,000 or select different budget code."
✅ "Item description must be at least 3 characters. Please provide a meaningful description."

### Examples of Bad Error Messages

❌ "Error" (too vague)
❌ "Invalid input" (not specific)
❌ "FK constraint violation on department_id" (too technical)
❌ "Your data is wrong" (unfriendly, not helpful)

### Error Severity Levels

| Level | Usage | Display |
|-------|-------|---------|
| **Error** | Blocks submission | Red icon, red border, red text |
| **Warning** | Should fix but not blocking | Yellow icon, yellow border |
| **Info** | Helpful guidance | Blue icon, normal border |

---

## 7. Test Scenarios

### Coverage Requirements

All validation rules must have test coverage for:
- ✅ **Positive tests**: Valid input that should pass
- ❌ **Negative tests**: Invalid input that should fail
- 🔀 **Boundary tests**: Edge cases at limits
- 🔗 **Integration tests**: End-to-end validation

### Example Test Scenarios

#### Positive Test: Create Valid PR

**Test ID**: VAL-PR-T001
**Type**: Positive
**Validation Layers**: Client, Server, Database

**Preconditions**:
- User authenticated with create_purchase_request permission
- User has access to at least one department

**Test Steps**:
1. Navigate to Create PR page
2. Select Type: General
3. Set PR Date: Today
4. Set Delivery Date: Today + 7 days
5. Select Department: User's department
6. Select Location: Department's location
7. Add line item: Description "Office supplies", Qty 10, UOM "PC", Price $5.00
8. Click "Submit for Approval"

**Expected Result**: ✅
- No validation errors displayed
- PR created with status "Submitted"
- Approval records created
- Success message shown
- PR reference number assigned (e.g., PR-2025-0042)

---

#### Negative Test: Submit PR with Past Delivery Date

**Test ID**: VAL-PR-T101
**Type**: Negative
**Validation Layers**: Server

**Preconditions**: User on Create PR page

**Test Steps**:
1. Set PR Date: 2025-01-20
2. Set Delivery Date: 2025-01-15 (before PR date)
3. Fill other required fields with valid data
4. Add one valid line item
5. Click "Submit"

**Expected Result**: ❌
- Error message shown: "Delivery date must be after PR date"
- Delivery Date field highlighted in red
- PR not saved to database
- User remains on form to make corrections

---

#### Boundary Test: Delivery Date Exactly 365 Days from PR Date

**Test ID**: VAL-PR-T201
**Type**: Boundary
**Validation Layers**: All

**Preconditions**: User on Create PR page

**Test Steps**:
1. Set PR Date: 2025-01-30
2. Set Delivery Date: 2026-01-30 (exactly 365 days later)
3. Fill other required fields with valid data
4. Add one valid line item
5. Click "Submit"

**Expected Result**: ✅
- No validation errors (boundary value is acceptable)
- PR created successfully with status "Submitted"
- Success message shown

---

## 8. Validation Matrix Summary

| Code | Rule Name | Fields | Type | Client | Server | DB | Priority |
|------|-----------|--------|------|--------|--------|----|----------|
| VAL-PR-001 | Ref Number Format | ref_number | Field | ✅ | ✅ | ✅ | High |
| VAL-PR-002 | PR Type | type | Field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-003 | PR Date | date | Field | ✅ | ✅ | ✅ | High |
| VAL-PR-004 | Delivery Date | delivery_date | Field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-005 | Department | department_id | Field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-006 | Location | location_id | Field | ✅ | ✅ | ✅ | High |
| VAL-PR-007 | Currency | currency_code | Field | ✅ | ✅ | ✅ | High |
| VAL-PR-008 | Exchange Rate | exchange_rate | Field | ✅ | ✅ | ✅ | Medium |
| VAL-PR-009 | Amounts | money fields | Field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-010 | Notes | notes, internal_notes | Field | ✅ | ✅ | ❌ | Low |
| VAL-PR-011 | Item Description | description | Field | ✅ | ✅ | ✅ | High |
| VAL-PR-012 | Item Quantity | quantity | Field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-013 | Item Price | unit_price | Field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-014 | Item UOM | unit_of_measure | Field | ✅ | ✅ | ✅ | High |
| VAL-PR-101 | Min Line Items | items | Business | ✅ | ✅ | ❌ | Critical |
| VAL-PR-102 | Prices Required | items | Business | ✅ | ✅ | ❌ | Critical |
| VAL-PR-103 | Budget Check | budget, amounts | Business | ⚠️ | ✅ | ❌ | High |
| VAL-PR-104 | Approval Chain | type, amount | Business | ⚠️ | ✅ | ❌ | Critical |
| VAL-PR-105 | Market List Limit | type, amount | Business | ⚠️ | ✅ | ❌ | Medium |
| VAL-PR-106 | Asset Manager | type, department | Business | ⚠️ | ✅ | ❌ | High |
| VAL-PR-107 | Status Transition | status | Business | ✅ | ✅ | ❌ | Critical |
| VAL-PR-108 | Future Delivery | delivery_date | Business | ⚠️ | ✅ | ❌ | Medium |
| VAL-PR-201 | Date Range | date, delivery_date | Cross-field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-202 | Amount Calculation | items, totals | Cross-field | ✅ | ✅ | ✅ | Critical |
| VAL-PR-203 | Currency-Rate | currency, rate | Cross-field | ✅ | ✅ | ❌ | Medium |
| VAL-PR-301 | Create Permission | - | Security | ✅ | ✅ | ✅ | Critical |
| VAL-PR-302 | Department Access | department_id | Security | ✅ | ✅ | ✅ | Critical |
| VAL-PR-303 | Location Access | location_id | Security | ✅ | ✅ | ✅ | Critical |
| VAL-PR-304 | Edit Ownership | created_by | Security | ✅ | ✅ | ✅ | Critical |
| VAL-PR-305 | Approver Auth | approver_id | Security | ✅ | ✅ | ✅ | Critical |
| VAL-PR-306 | Input Sanitization | all text | Security | ⚠️ | ✅ | ✅ | Critical |

**Legend**:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (e.g., display hint only)

---

## 9. Related Documents

- **Business Requirements**: [BR-purchase-requests.md](./BR-purchase-requests.md)
- **Use Cases**: [UC-purchase-requests.md](./UC-purchase-requests.md)
- **Technical Specification**: [TS-purchase-requests.md](./TS-purchase-requests.md)
- **Data Definition**: [DS-purchase-requests.md](./DS-purchase-requests.md)
- **Flow Diagrams**: [FD-purchase-requests.md](./FD-purchase-requests.md)

---

**Document Control**:
- **Created**: 2025-01-30
- **Author**: System Analyst
- **Reviewed By**: Business Analyst, QA Lead, Security Team
- **Approved By**: Technical Lead, Product Owner
- **Next Review**: 2025-04-30

---

## Appendix: Error Code Quick Reference

| Range | Category | Count | Example |
|-------|----------|-------|---------|
| VAL-PR-001 to 099 | Field Validations | 14 | VAL-PR-001: Reference Number Format |
| VAL-PR-101 to 199 | Business Rules | 8 | VAL-PR-104: Approval Chain Determination |
| VAL-PR-201 to 299 | Cross-Field | 3 | VAL-PR-201: Date Range Validation |
| VAL-PR-301 to 399 | Security | 6 | VAL-PR-301: Create Permission Check |
| **Total** | **All Categories** | **31** | **Complete validation coverage** |
