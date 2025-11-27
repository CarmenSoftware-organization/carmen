# VAL-CN: Credit Note Validation Rules

**Module**: Procurement
**Sub-Module**: Credit Note
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-01
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose
This document defines comprehensive validation rules for the Credit Note module to ensure data integrity, enforce business rules, maintain financial accuracy, and provide a consistent user experience. Credit Note validation is critical because:

- **Financial Impact**: Credit notes affect vendor payables, inventory valuation, and general ledger accounts
- **Cost Accuracy**: FIFO costing calculations require precise lot tracking and quantity validation
- **Tax Compliance**: Input VAT adjustments must be calculated correctly for tax reporting
- **Audit Requirements**: Credit notes are legal documents requiring accurate data for financial audits
- **Inventory Control**: Quantity returns trigger stock movements that must be validated

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
2. Provide immediate user feedback when possible
3. Use clear, actionable error messages
4. Prevent security vulnerabilities (SQL injection, XSS)
5. Enforce business rules consistently
6. Validate data integrity across related entities
7. Enforce FIFO costing rules for quantity returns

---

## 2. Field-Level Validations (VAL-CN-001 to 099)

### VAL-CN-001: CN Number - Required Field Validation

**Field**: `cnNumber`
**Database Column**: `credit_notes.cn_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: Credit Note Number is mandatory and must be unique across all credit notes.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Auto-generate number on form load. Show error if modified to empty.
- **Server-Side**: Reject request if field is missing, null, or contains only whitespace. Verify uniqueness before saving.
- **Database**: Column defined as NOT NULL with UNIQUE constraint.

**Error Code**: VAL-CN-001
**Error Message**: "Credit Note Number is required"
**User Action**: System automatically generates unique CN number (format: CN-YYYY-NNNNNN). User should not manually modify.

**Test Cases**:
- ✅ Valid: "CN-2025-000123"
- ✅ Valid: "CN-2025-000124" (unique)
- ❌ Invalid: "" (empty)
- ❌ Invalid: "CN-2025-000123" (duplicate)
- ❌ Invalid: null or undefined

---

### VAL-CN-002: Document Date - Required Field Validation

**Field**: `documentDate`
**Database Column**: `credit_notes.document_date`
**Data Type**: DATE / Date

**Validation Rule**: Document date is mandatory and cannot be empty.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Default to today's date. Show error on blur if empty.
- **Server-Side**: Reject request if field is missing or null.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-CN-002
**Error Message**: "Document date is required"
**User Action**: User must select a valid date.

**Test Cases**:
- ✅ Valid: 2025-01-30 (valid date)
- ✅ Valid: Today's date
- ❌ Invalid: null
- ❌ Invalid: undefined
- ❌ Invalid: "" (empty string)

---

### VAL-CN-003: Document Date - Future Date Validation

**Field**: `documentDate`

**Validation Rule**: Document date cannot be in the future.

**Rationale**: Cannot create credit notes for future dates. Ensures data accuracy and prevents backdating issues.

**Implementation Requirements**:
- **Client-Side**: Set maximum date for date picker to today. Show warning if future date selected.
- **Server-Side**: Compare document date with server's current date. Reject if future date.
- **Database**: CHECK constraint: document_date <= CURRENT_DATE.

**Error Code**: VAL-CN-003
**Error Message**: "Document date cannot be in the future"
**User Action**: User must select today's date or an earlier date.

**Test Cases**:
- ✅ Valid: 2025-01-30 (today or past)
- ✅ Valid: 2025-01-15 (past date)
- ❌ Invalid: 2025-02-15 (future date when today is 2025-01-30)
- ❌ Invalid: Tomorrow's date

---

### VAL-CN-004: Vendor - Required Field Validation

**Field**: `vendorId` and `vendorName`
**Database Column**: `credit_notes.vendor_id`, `credit_notes.vendor_name`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Vendor selection is mandatory. Both vendor ID and vendor name must be provided.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Vendor dropdown required. Show error if empty.
- **Server-Side**: Reject request if vendor ID is missing or vendor doesn't exist in system.
- **Database**: Column defined as NOT NULL with foreign key constraint to vendors table.

**Error Code**: VAL-CN-004
**Error Message**: "Vendor is required"
**User Action**: User must select a vendor from the dropdown list.

**Test Cases**:
- ✅ Valid: vendorId = "V001", vendorName = "Professional Kitchen Supplies"
- ❌ Invalid: vendorId = null
- ❌ Invalid: vendorId = "" (empty)
- ❌ Invalid: vendorId = "INVALID" (non-existent vendor)

---

### VAL-CN-005: Credit Type - Required and Valid Enum

**Field**: `creditType`
**Database Column**: `credit_notes.credit_type`
**Data Type**: ENUM('QUANTITY_RETURN', 'AMOUNT_DISCOUNT') / CreditNoteType

**Validation Rule**: Credit type must be one of the defined enum values: QUANTITY_RETURN or AMOUNT_DISCOUNT.

**Implementation Requirements**:
- **Client-Side**: Use radio buttons or dropdown with only valid credit type values. Disable manual input.
- **Server-Side**: Verify credit type matches one of the enum values.
- **Database**: Column defined as ENUM type with allowed values.

**Error Code**: VAL-CN-005
**Error Message**: "Invalid credit type. Must be QUANTITY_RETURN or AMOUNT_DISCOUNT"
**User Action**: User must select a valid credit type from the allowed values.

**Test Cases**:
- ✅ Valid: "QUANTITY_RETURN"
- ✅ Valid: "AMOUNT_DISCOUNT"
- ❌ Invalid: "PRICE_ADJUSTMENT" (not in enum)
- ❌ Invalid: "quantity_return" (case-sensitive)
- ❌ Invalid: null

---

### VAL-CN-006: GRN ID - Required for All Credit Types

**Field**: `grnId`
**Database Column**: `credit_notes.grn_id`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: GRN reference is mandatory for both quantity returns and amount discounts.

**Rationale**: All credit notes must reference the original GRN for traceability and audit purposes.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. GRN dropdown required. Show error if empty.
- **Server-Side**: Reject request if GRN ID is missing or GRN doesn't exist in system. Verify GRN belongs to selected vendor.
- **Database**: Column defined as NOT NULL with foreign key constraint to goods_receive_notes table.

**Error Code**: VAL-CN-006
**Error Message**: "GRN reference is required"
**User Action**: User must select a GRN from the dropdown list for the selected vendor.

**Test Cases**:
- ✅ Valid: grnId = "GRN-2025-000123"
- ❌ Invalid: grnId = null
- ❌ Invalid: grnId = "" (empty)
- ❌ Invalid: grnId = "GRN-INVALID" (non-existent GRN)

---

### VAL-CN-007: Status - Required and Valid Enum

**Field**: `status`
**Database Column**: `credit_notes.status`
**Data Type**: ENUM('DRAFT', 'POSTED', 'VOID') / CreditNoteStatus

**Validation Rule**: Status must be one of the defined enum values: DRAFT, POSTED, or VOID.

**Implementation Requirements**:
- **Client-Side**: Use dropdown with only valid status values. Default to DRAFT for new credit notes.
- **Server-Side**: Verify status matches one of the enum values. Enforce status transition rules.
- **Database**: Column defined as ENUM type with allowed values.

**Error Code**: VAL-CN-007
**Error Message**: "Invalid credit note status. Must be DRAFT, COMMITTED, or VOID"
**User Action**: User must select a valid status from the allowed values.

**Test Cases**:
- ✅ Valid: "DRAFT"
- ✅ Valid: "COMMITTED"
- ✅ Valid: "VOID"
- ❌ Invalid: "draft" (case-sensitive)
- ❌ Invalid: null

---

### VAL-CN-008: Credit Reason - Required Field Validation

**Field**: `creditReason`
**Database Column**: `credit_notes.credit_reason`
**Data Type**: ENUM('DAMAGED_GOODS', 'INCORRECT_ITEM', 'QUALITY_ISSUE', 'PRICING_ERROR', 'OTHER') / CreditNoteReason

**Validation Rule**: Credit reason is mandatory and must be one of the defined enum values.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Dropdown required. Show error if empty.
- **Server-Side**: Reject request if credit reason is missing or not in enum values.
- **Database**: Column defined as NOT NULL with ENUM constraint.

**Error Code**: VAL-CN-008
**Error Message**: "Credit reason is required"
**User Action**: User must select a reason for the credit note.

**Test Cases**:
- ✅ Valid: "DAMAGED_GOODS"
- ✅ Valid: "INCORRECT_ITEM"
- ✅ Valid: "QUALITY_ISSUE"
- ✅ Valid: "PRICING_ERROR"
- ✅ Valid: "OTHER"
- ❌ Invalid: null
- ❌ Invalid: "" (empty)
- ❌ Invalid: "LATE_DELIVERY" (not in enum)

---

### VAL-CN-009: Description - Optional but Length Constrained

**Field**: `description`
**Database Column**: `credit_notes.description`
**Data Type**: TEXT / string

**Validation Rule**: If provided, description must not exceed 1000 characters.

**Implementation Requirements**:
- **Client-Side**: Optional field. Show character counter. Validate length on change.
- **Server-Side**: Verify length does not exceed 1000 characters if value provided.
- **Database**: TEXT column with no length limit (enforced at application level).

**Error Code**: VAL-CN-009
**Error Message**: "Description cannot exceed 1000 characters"
**User Action**: User must shorten the description to 1000 characters or less.

**Test Cases**:
- ✅ Valid: null (optional)
- ✅ Valid: "" (empty)
- ✅ Valid: "Damaged goods received on Jan 15" (under 1000 chars)
- ❌ Invalid: [1001 character string]

---

### VAL-CN-010: Currency - Required and Valid ISO Code

**Field**: `currency`
**Database Column**: `credit_notes.currency`
**Data Type**: VARCHAR(3) / string

**Validation Rule**: Currency code is mandatory and must be a valid ISO 4217 currency code.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Auto-populate from vendor or GRN currency. Dropdown with valid ISO codes.
- **Server-Side**: Reject request if currency is missing. Validate against ISO 4217 currency list.
- **Database**: Column defined as NOT NULL with foreign key to currencies table.

**Error Code**: VAL-CN-010
**Error Message**: "Valid currency code is required (ISO 4217)"
**User Action**: User must select a valid currency code.

**Test Cases**:
- ✅ Valid: "USD"
- ✅ Valid: "EUR"
- ✅ Valid: "GBP"
- ❌ Invalid: null
- ❌ Invalid: "US" (invalid ISO code)
- ❌ Invalid: "XXX" (unknown currency)

---

### VAL-CN-011: Exchange Rate - Required Positive Number

**Field**: `exchangeRate`
**Database Column**: `credit_notes.exchange_rate`
**Data Type**: DECIMAL(15,6) / number

**Validation Rule**: Exchange rate is mandatory and must be a positive number greater than zero.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Auto-populate from current exchange rate. Show error if zero or negative.
- **Server-Side**: Verify value is numeric and > 0.
- **Database**: Column defined as NOT NULL. CHECK constraint: exchange_rate > 0.

**Error Code**: VAL-CN-011
**Error Message**: "Exchange rate must be greater than zero"
**User Action**: User must enter a valid exchange rate or use system-provided rate.

**Test Cases**:
- ✅ Valid: 1.000000 (base currency)
- ✅ Valid: 1.250000 (foreign currency)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -1.5 (negative)
- ❌ Invalid: null

---

### VAL-CN-012: Subtotal Amount - Required Positive Number

**Field**: `subtotalAmount`
**Database Column**: `credit_notes.subtotal_amount`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Subtotal amount is mandatory and must be a positive number greater than zero.

**Implementation Requirements**:
- **Client-Side**: Auto-calculate from sum of line item credit amounts. Display as read-only. Show error if zero.
- **Server-Side**: Verify calculation matches line item totals. Reject if zero or negative.
- **Database**: Column defined as NOT NULL. CHECK constraint: subtotal_amount > 0.

**Error Code**: VAL-CN-012
**Error Message**: "Subtotal amount must be greater than zero"
**User Action**: System automatically calculates subtotal. User should verify line item amounts are correct.

**Test Cases**:
- ✅ Valid: 1250.50
- ✅ Valid: 0.01 (minimum)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -100.00 (negative)
- ❌ Invalid: null

---

### VAL-CN-013: Tax Amount - Required Non-Negative Number

**Field**: `taxAmount`
**Database Column**: `credit_notes.tax_amount`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Tax amount is mandatory and must be a non-negative number (zero or positive).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate from tax rate and subtotal. Display as read-only.
- **Server-Side**: Verify calculation matches tax rate * subtotal. Reject if negative.
- **Database**: Column defined as NOT NULL. CHECK constraint: tax_amount >= 0.

**Error Code**: VAL-CN-013
**Error Message**: "Tax amount must be zero or greater"
**User Action**: System automatically calculates tax amount based on tax rate.

**Test Cases**:
- ✅ Valid: 125.05 (positive)
- ✅ Valid: 0 (zero for tax-exempt)
- ❌ Invalid: -10.00 (negative)
- ❌ Invalid: null

---

### VAL-CN-014: Total Amount - Required Positive Number

**Field**: `totalAmount`
**Database Column**: `credit_notes.total_amount`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Total amount is mandatory and must be a positive number greater than zero.

**Implementation Requirements**:
- **Client-Side**: Auto-calculate as subtotal + tax. Display as read-only. Show error if zero.
- **Server-Side**: Verify calculation equals subtotal + tax. Reject if zero or negative.
- **Database**: Column defined as NOT NULL. CHECK constraint: total_amount > 0.

**Error Code**: VAL-CN-014
**Error Message**: "Total amount must be greater than zero"
**User Action**: System automatically calculates total amount. User should verify subtotal and tax are correct.

**Test Cases**:
- ✅ Valid: 1375.55 (subtotal + tax)
- ✅ Valid: 0.01 (minimum)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -50.00 (negative)
- ❌ Invalid: null

---

### VAL-CN-015: Realized Gain/Loss - Optional Number

**Field**: `realizedGainLoss`
**Database Column**: `credit_notes.realized_gain_loss`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: If provided, realized gain/loss can be positive, negative, or zero.

**Rationale**: Represents financial impact calculated as (return amount - cost of goods sold). Can be gain (positive) or loss (negative).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate for quantity returns from FIFO cost analysis. Display as read-only. Allow null for amount discounts.
- **Server-Side**: Optional field. If provided, verify calculation is correct based on FIFO costing.
- **Database**: Column allows NULL. No constraints on positive/negative values.

**Error Code**: VAL-CN-015
**Error Message**: "Invalid realized gain/loss amount"
**User Action**: System automatically calculates for quantity returns. Not applicable for amount discounts.

**Test Cases**:
- ✅ Valid: 150.00 (gain)
- ✅ Valid: -75.50 (loss)
- ✅ Valid: 0 (break-even)
- ✅ Valid: null (not calculated)
- ❌ Invalid: "abc" (non-numeric)

---

### VAL-CN-016: Line Item - Product ID Required

**Field**: `productId` (in CreditNoteItem)
**Database Column**: `credit_note_items.product_id`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Product ID is mandatory for all line items.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field. Auto-populate from GRN item selection. Show error if empty.
- **Server-Side**: Reject line item if product ID is missing or product doesn't exist.
- **Database**: Column defined as NOT NULL with foreign key to products table.

**Error Code**: VAL-CN-016
**Error Message**: "Product is required for each line item"
**User Action**: User must select a product from the GRN items.

**Test Cases**:
- ✅ Valid: "PROD-001"
- ✅ Valid: "PROD-CHAIR-005"
- ❌ Invalid: "" (empty)
- ❌ Invalid: null
- ❌ Invalid: "INVALID-PROD" (non-existent product)

---

### VAL-CN-017: Line Item - Received Quantity Required for Quantity Returns

**Field**: `rcvQty` (in CreditNoteItem)
**Database Column**: `credit_note_items.rcv_qty`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: For QUANTITY_RETURN type, received quantity from original GRN is mandatory and must be positive.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) for quantity returns. Auto-populate from GRN item. Display as read-only.
- **Server-Side**: For quantity returns, verify value is present and > 0. Match against GRN item quantity.
- **Database**: Column defined as NOT NULL. CHECK constraint: rcv_qty > 0.

**Error Code**: VAL-CN-017
**Error Message**: "Received quantity is required and must be greater than zero"
**User Action**: System automatically populates from GRN. User verifies accuracy.

**Test Cases**:
- ✅ Valid: 100.000 (quantity return)
- ✅ Valid: 50.500 (partial quantity)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -10.000 (negative)
- ❌ Invalid: null (for quantity returns)

---

### VAL-CN-018: Line Item - Credit Note Quantity Required and Valid

**Field**: `cnQty` (in CreditNoteItem)
**Database Column**: `credit_note_items.cn_qty`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: Credit note quantity is mandatory for quantity returns and must be between zero and received quantity.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) for quantity returns. Validate: 0 <= cnQty <= rcvQty. Show error if out of range.
- **Server-Side**: For quantity returns, verify 0 <= cnQty <= rcvQty. For amount discounts, allow null.
- **Database**: Column allows NULL for amount discounts. CHECK constraint: cn_qty >= 0.

**Error Code**: VAL-CN-018
**Error Message**: "Credit note quantity must be between 0 and received quantity"
**User Action**: User must enter a valid quantity being credited (cannot exceed originally received quantity).

**Test Cases**:
- ✅ Valid: 50.000 (partial return when rcvQty = 100)
- ✅ Valid: 100.000 (full return when rcvQty = 100)
- ✅ Valid: 0 (no quantity credited)
- ❌ Invalid: 150.000 (exceeds rcvQty of 100)
- ❌ Invalid: -10.000 (negative)
- ❌ Invalid: null (for quantity returns)

---

### VAL-CN-019: Line Item - Unit Price Required and Non-Negative

**Field**: `unitPrice` (in CreditNoteItem)
**Database Column**: `credit_note_items.unit_price`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Unit price is mandatory and must be a non-negative number.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Auto-populate from GRN item price. Allow manual override for amount discounts.
- **Server-Side**: Verify value is numeric and >= 0. For quantity returns, should match GRN item price.
- **Database**: Column defined as NOT NULL. CHECK constraint: unit_price >= 0.

**Error Code**: VAL-CN-019
**Error Message**: "Unit price must be zero or greater"
**User Action**: System auto-populates from GRN. User can override for pricing adjustments.

**Test Cases**:
- ✅ Valid: 25.50 (positive price)
- ✅ Valid: 0 (zero for free items)
- ❌ Invalid: -10.00 (negative)
- ❌ Invalid: null

---

### VAL-CN-020: Line Item - Credit Note Amount Required and Non-Negative

**Field**: `cnAmt` (in CreditNoteItem)
**Database Column**: `credit_note_items.cn_amt`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Credit note amount is mandatory and must be a non-negative number.

**Implementation Requirements**:
- **Client-Side**: Auto-calculate as cnQty * unitPrice for quantity returns or manual entry for amount discounts. Display as read-only for quantity returns.
- **Server-Side**: Verify calculation matches cnQty * unitPrice for quantity returns. Verify >= 0 for amount discounts.
- **Database**: Column defined as NOT NULL. CHECK constraint: cn_amt >= 0.

**Error Code**: VAL-CN-020
**Error Message**: "Credit note amount must be zero or greater"
**User Action**: System auto-calculates for quantity returns. User enters amount for pricing discounts.

**Test Cases**:
- ✅ Valid: 1275.00 (calculated or entered)
- ✅ Valid: 0 (zero credit)
- ❌ Invalid: -100.00 (negative)
- ❌ Invalid: null

---

### VAL-CN-021: Line Item - Cost Variance for Quantity Returns

**Field**: `costVariance` (in CreditNoteItem)
**Database Column**: `credit_note_items.cost_variance`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: For quantity returns, cost variance should be calculated as (current cost - FIFO weighted cost).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate from FIFO cost analysis for quantity returns. Display as read-only. Allow null for amount discounts.
- **Server-Side**: For quantity returns, verify calculation is correct based on FIFO costing. Allow null for amount discounts.
- **Database**: Column allows NULL. No constraints on positive/negative values.

**Error Code**: VAL-CN-021
**Error Message**: "Invalid cost variance calculation"
**User Action**: System automatically calculates based on FIFO analysis. User reviews for accuracy.

**Test Cases**:
- ✅ Valid: 50.00 (positive variance - cost increased)
- ✅ Valid: -25.00 (negative variance - cost decreased)
- ✅ Valid: 0 (no variance)
- ✅ Valid: null (amount discount type)
- ❌ Invalid: "abc" (non-numeric)

---

### VAL-CN-022: Line Item - Discount Amount Non-Negative

**Field**: `discountAmount` (in CreditNoteItem)
**Database Column**: `credit_note_items.discount_amount`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: If provided, discount amount must be a non-negative number.

**Implementation Requirements**:
- **Client-Side**: Optional field. Validate >= 0 if provided. More relevant for amount discount type.
- **Server-Side**: If value provided, verify >= 0.
- **Database**: Column allows NULL. CHECK constraint: discount_amount >= 0 (if not null).

**Error Code**: VAL-CN-022
**Error Message**: "Discount amount must be zero or greater"
**User Action**: User enters discount amount if applicable.

**Test Cases**:
- ✅ Valid: 100.00 (positive discount)
- ✅ Valid: 0 (no discount)
- ✅ Valid: null (not applicable)
- ❌ Invalid: -50.00 (negative)

---

### VAL-CN-023: Line Item - Tax Rate Non-Negative

**Field**: `taxRate` (in CreditNoteItem)
**Database Column**: `credit_note_items.tax_rate`
**Data Type**: DECIMAL(5,2) / number

**Validation Rule**: Tax rate must be a non-negative percentage (0-100).

**Implementation Requirements**:
- **Client-Side**: Auto-populate from product tax category. Validate 0 <= taxRate <= 100.
- **Server-Side**: Verify 0 <= taxRate <= 100.
- **Database**: Column defined as NOT NULL. CHECK constraint: tax_rate >= 0 AND tax_rate <= 100.

**Error Code**: VAL-CN-023
**Error Message**: "Tax rate must be between 0 and 100"
**User Action**: System auto-populates from product. User can override if authorized.

**Test Cases**:
- ✅ Valid: 10.00 (10% tax)
- ✅ Valid: 0 (tax-exempt)
- ✅ Valid: 100 (maximum)
- ❌ Invalid: -5.00 (negative)
- ❌ Invalid: 150.00 (exceeds 100%)
- ❌ Invalid: null

---

### VAL-CN-024: Line Item - Tax Amount Matches Calculation

**Field**: `taxAmount` (in CreditNoteItem)
**Database Column**: `credit_note_items.tax_amount`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Tax amount must equal (cnAmt * taxRate / 100).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate as cnAmt * taxRate / 100. Display as read-only.
- **Server-Side**: Verify calculation matches. Reject if mismatch > $0.01 (rounding tolerance).
- **Database**: Column defined as NOT NULL. No direct constraint (enforced at application level).

**Error Code**: VAL-CN-024
**Error Message**: "Tax amount does not match calculated value"
**User Action**: System automatically calculates tax. User should verify tax rate is correct.

**Test Cases**:
- ✅ Valid: 127.50 (when cnAmt = 1275.00, taxRate = 10.00)
- ✅ Valid: 0 (when taxRate = 0)
- ❌ Invalid: 100.00 (when calculated should be 127.50)
- ❌ Invalid: null

---

### VAL-CN-025: Line Item - Total Amount Matches Calculation

**Field**: `totalAmount` (in CreditNoteItem)
**Database Column**: `credit_note_items.total_amount`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Total amount must equal (cnAmt + taxAmount).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate as cnAmt + taxAmount. Display as read-only.
- **Server-Side**: Verify calculation matches. Reject if mismatch > $0.01 (rounding tolerance).
- **Database**: Column defined as NOT NULL. No direct constraint (enforced at application level).

**Error Code**: VAL-CN-025
**Error Message**: "Total amount does not match calculated value (cnAmt + taxAmount)"
**User Action**: System automatically calculates total. User should verify line item amounts.

**Test Cases**:
- ✅ Valid: 1402.50 (when cnAmt = 1275.00, taxAmount = 127.50)
- ✅ Valid: 1275.00 (when taxAmount = 0)
- ❌ Invalid: 1500.00 (when calculated should be 1402.50)
- ❌ Invalid: null

---

### VAL-CN-026: Applied Lot - Lot Number Required for Quantity Returns

**Field**: `lotNumber` (in AppliedLot)
**Database Column**: `credit_note_applied_lots.lot_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: For quantity return items, lot number is mandatory for FIFO tracking.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) for quantity returns. Auto-populate from lot selection. Show error if empty.
- **Server-Side**: For quantity returns, reject if lot number is missing. Verify lot exists in inventory.
- **Database**: Column defined as NOT NULL for applied lots.

**Error Code**: VAL-CN-026
**Error Message**: "Lot number is required for quantity returns"
**User Action**: User must select lots from available inventory for the product.

**Test Cases**:
- ✅ Valid: "LOT-2025-001234"
- ✅ Valid: "BATCH-ABC-123"
- ❌ Invalid: "" (empty)
- ❌ Invalid: null
- ❌ Invalid: "INVALID-LOT" (non-existent lot)

---

### VAL-CN-027: Applied Lot - Quantity Positive Number

**Field**: `quantity` (in AppliedLot)
**Database Column**: `credit_note_applied_lots.quantity`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: Lot quantity must be a positive number greater than zero.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Validate quantity > 0. Show error if zero or negative.
- **Server-Side**: Verify quantity > 0. Verify total lot quantities equal line item cnQty.
- **Database**: Column defined as NOT NULL. CHECK constraint: quantity > 0.

**Error Code**: VAL-CN-027
**Error Message**: "Lot quantity must be greater than zero"
**User Action**: User must enter the quantity being returned from each lot.

**Test Cases**:
- ✅ Valid: 25.000 (positive)
- ✅ Valid: 0.001 (minimum positive)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -10.000 (negative)
- ❌ Invalid: null

---

### VAL-CN-028: Applied Lot - Unit Cost Required for FIFO

**Field**: `unitCost` (in AppliedLot)
**Database Column**: `credit_note_applied_lots.unit_cost`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Unit cost from the lot is mandatory and must be a positive number.

**Implementation Requirements**:
- **Client-Side**: Auto-populate from lot inventory cost. Display as read-only.
- **Server-Side**: Verify value is present and > 0. Match against inventory lot cost.
- **Database**: Column defined as NOT NULL. CHECK constraint: unit_cost > 0.

**Error Code**: VAL-CN-028
**Error Message**: "Lot unit cost must be greater than zero"
**User Action**: System automatically populates from inventory lot. User verifies accuracy.

**Test Cases**:
- ✅ Valid: 12.50 (positive cost)
- ✅ Valid: 0.01 (minimum cost)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -5.00 (negative)
- ❌ Invalid: null

---

### VAL-CN-029: Attachment - File Size Limit

**Field**: File upload (in CreditNoteAttachment)
**Database Column**: `credit_note_attachments.file_size`
**Data Type**: INTEGER / number

**Validation Rule**: Individual attachment file size must not exceed 10 MB.

**Implementation Requirements**:
- **Client-Side**: Validate file size before upload. Show error if > 10 MB. Display file size to user.
- **Server-Side**: Verify uploaded file size <= 10 MB. Reject upload if exceeds limit.
- **Database**: Column stores file size in bytes. No direct constraint (enforced at application level).

**Error Code**: VAL-CN-029
**Error Message**: "File size must not exceed 10 MB"
**User Action**: User must select a smaller file or compress the file before uploading.

**Test Cases**:
- ✅ Valid: 1 MB file
- ✅ Valid: 9.99 MB file
- ✅ Valid: 10 MB file (exactly at limit)
- ❌ Invalid: 10.5 MB file
- ❌ Invalid: 50 MB file

---

### VAL-CN-030: Attachment - File Type Allowed

**Field**: File upload (in CreditNoteAttachment)
**Database Column**: `credit_note_attachments.file_type`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: File type must be one of the allowed types: PDF, JPG, JPEG, PNG, XLSX, DOCX.

**Implementation Requirements**:
- **Client-Side**: Restrict file picker to allowed extensions. Show error if unsupported type selected.
- **Server-Side**: Verify file MIME type matches allowed types. Reject upload if unsupported.
- **Database**: Column stores MIME type. No direct constraint (enforced at application level).

**Error Code**: VAL-CN-030
**Error Message**: "File type not allowed. Allowed types: PDF, JPG, PNG, XLSX, DOCX"
**User Action**: User must select a file with an allowed file type.

**Test Cases**:
- ✅ Valid: "application/pdf"
- ✅ Valid: "image/jpeg"
- ✅ Valid: "image/png"
- ✅ Valid: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
- ✅ Valid: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
- ❌ Invalid: "application/zip"
- ❌ Invalid: "video/mp4"
- ❌ Invalid: "text/plain"

---

## 3. Business Rule Validations (VAL-CN-100 to 199)

### VAL-CN-100: At Least One Line Item Required

**Rule**: A credit note must have at least one line item.

**Rationale**: Cannot create a credit note without specifying what is being credited.

**Implementation Requirements**:
- **Client-Side**: Validate line items count >= 1 before submission. Show error on save if no items.
- **Server-Side**: Reject credit note if line items array is empty.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-100
**Error Message**: "Credit note must have at least one line item"
**User Action**: User must add at least one line item with product and quantities/amounts.

**Test Cases**:
- ✅ Valid: Credit note with 1 line item
- ✅ Valid: Credit note with 5 line items
- ❌ Invalid: Credit note with 0 line items
- ❌ Invalid: Credit note with null line items array

---

### VAL-CN-101: Line Item Sum Matches Header Totals

**Rule**: Sum of all line item totals must equal the credit note header total amount.

**Rationale**: Ensures financial accuracy and prevents discrepancies between line items and header.

**Implementation Requirements**:
- **Client-Side**: Auto-calculate header totals from line items. Display warning if manual override attempted.
- **Server-Side**: Verify: SUM(line_item.totalAmount) = header.totalAmount. Reject if mismatch > $0.10 (rounding tolerance).
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-101
**Error Message**: "Line item totals do not match credit note total amount"
**User Action**: System automatically calculates totals. User should verify line item amounts are correct.

**Test Cases**:
- ✅ Valid: Line items total $1402.50, header total $1402.50
- ✅ Valid: Line items total $2500.00, header total $2500.05 (within tolerance)
- ❌ Invalid: Line items total $1402.50, header total $1500.00 (mismatch)
- ❌ Invalid: Line items total $0, header total $1000.00

---

### VAL-CN-102: Quantity Return Requires Lot Selection

**Rule**: For QUANTITY_RETURN type, each line item with cnQty > 0 must have corresponding applied lots.

**Rationale**: FIFO costing requires lot-level tracking for all quantity returns.

**Implementation Requirements**:
- **Client-Side**: Show lot selection dialog for quantity returns. Validate total lot quantities = cnQty before save.
- **Server-Side**: For quantity returns, verify each item has applied lots. Verify SUM(lot.quantity) = item.cnQty.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-102
**Error Message**: "Quantity returns must have lot selection for FIFO costing"
**User Action**: User must select inventory lots for each item being returned.

**Test Cases**:
- ✅ Valid: Quantity return with cnQty = 100, lots total = 100
- ✅ Valid: Amount discount with no lots selected
- ❌ Invalid: Quantity return with cnQty = 100, lots total = 50
- ❌ Invalid: Quantity return with cnQty = 100, no lots selected

---

### VAL-CN-103: Amount Discount Does Not Require Lots

**Rule**: For AMOUNT_DISCOUNT type, lot selection is not required and should be empty.

**Rationale**: Amount discounts are pricing adjustments without physical returns, so FIFO lot tracking not needed.

**Implementation Requirements**:
- **Client-Side**: Hide lot selection for amount discounts. Do not allow lot assignment.
- **Server-Side**: For amount discounts, verify applied lots array is empty or null.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-103
**Error Message**: "Amount discounts should not have lot selections"
**User Action**: User should not select lots for amount discount credit notes.

**Test Cases**:
- ✅ Valid: Amount discount with no lots
- ✅ Valid: Amount discount with null lots array
- ❌ Invalid: Amount discount with lots selected
- ❌ Invalid: Amount discount with lot quantities > 0

---

### VAL-CN-104: Credit Note Quantity Cannot Exceed Total Received

**Rule**: For each line item, sum of all credit note quantities (current + previous) cannot exceed total received quantity from GRN.

**Rationale**: Cannot credit more than was originally received. Prevents over-crediting.

**Implementation Requirements**:
- **Client-Side**: Calculate totalReceivedQty and show available quantity. Validate cnQty + previous CNs <= totalReceivedQty.
- **Server-Side**: Query previous credit notes for same GRN item. Verify: current.cnQty + SUM(previous.cnQty) <= grn_item.receivedQty.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-104
**Error Message**: "Credit quantity exceeds total received quantity from GRN"
**User Action**: User must reduce credit quantity to not exceed available quantity.

**Test Cases**:
- ✅ Valid: GRN qty = 100, previous CNs = 30, current CN = 40 (total 70 <= 100)
- ✅ Valid: GRN qty = 100, previous CNs = 0, current CN = 100 (full credit)
- ❌ Invalid: GRN qty = 100, previous CNs = 60, current CN = 50 (total 110 > 100)
- ❌ Invalid: GRN qty = 100, previous CNs = 100, current CN = 1 (already fully credited)

---

### VAL-CN-105: Vendor Must Match GRN Vendor

**Rule**: The selected vendor must match the vendor from the selected GRN.

**Rationale**: Ensures credit note is issued against the correct vendor who supplied the goods.

**Implementation Requirements**:
- **Client-Side**: Auto-filter GRN dropdown to show only GRNs for selected vendor. Prevent manual override.
- **Server-Side**: Verify credit_note.vendorId = grn.vendorId. Reject if mismatch.
- **Database**: Foreign key constraints ensure referential integrity.

**Error Code**: VAL-CN-105
**Error Message**: "Vendor does not match the selected GRN vendor"
**User Action**: User must select a GRN that belongs to the selected vendor.

**Test Cases**:
- ✅ Valid: Vendor = "V001", GRN vendor = "V001"
- ❌ Invalid: Vendor = "V001", GRN vendor = "V002"
- ❌ Invalid: Vendor changed after GRN selection

---

### VAL-CN-106: GRN Must Not Be Voided

**Rule**: Cannot create credit note against a voided GRN.

**Rationale**: Voided GRNs are cancelled and should not have credit notes issued against them.

**Implementation Requirements**:
- **Client-Side**: Filter out voided GRNs from dropdown. Only show RECEIVED or COMMITTED status GRNs.
- **Server-Side**: Verify grn.status != 'VOID'. Reject if GRN is voided.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-106
**Error Message**: "Cannot create credit note against voided GRN"
**User Action**: User must select a non-voided GRN.

**Test Cases**:
- ✅ Valid: GRN status = "RECEIVED"
- ✅ Valid: GRN status = "COMMITTED"
- ❌ Invalid: GRN status = "VOID"

---

### VAL-CN-107: Line Items Must Match GRN Items

**Rule**: All credit note line items must reference valid items from the selected GRN.

**Rationale**: Can only credit items that were actually received on the GRN.

**Implementation Requirements**:
- **Client-Side**: Populate item selection from GRN items only. Prevent manual product entry.
- **Server-Side**: For each line item, verify product exists in selected GRN items. Reject if mismatch.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-107
**Error Message**: "Line item product was not on the selected GRN"
**User Action**: User can only select products that were received on the selected GRN.

**Test Cases**:
- ✅ Valid: All line items match GRN items
- ❌ Invalid: Line item with product not on GRN
- ❌ Invalid: Line item with different product than GRN

---

### VAL-CN-108: FIFO Weighted Average Cost Calculation

**Rule**: For quantity returns, FIFO weighted average cost must be calculated correctly from selected lots.

**Rationale**: Ensures accurate cost variance and realized gain/loss calculations for financial reporting.

**Implementation Requirements**:
- **Client-Side**: Display FIFO calculation breakdown showing: lot quantities, unit costs, weighted average, variance.
- **Server-Side**: Verify calculation: weighted_avg_cost = SUM(lot.quantity * lot.unitCost) / SUM(lot.quantity). Verify cost_variance = current_cost - weighted_avg_cost.
- **Database**: No direct constraint. Calculated values stored for audit trail.

**Error Code**: VAL-CN-108
**Error Message**: "FIFO weighted average cost calculation is incorrect"
**User Action**: System automatically calculates FIFO cost. User reviews calculation for accuracy.

**Test Cases**:
- ✅ Valid: Lot1(qty=30, cost=$10) + Lot2(qty=20, cost=$12) = weighted avg $10.80
- ✅ Valid: Single lot: qty=100, cost=$15 = weighted avg $15
- ❌ Invalid: Manual override of weighted average cost
- ❌ Invalid: Cost variance doesn't match (current - weighted average)

---

## 4. Status-Based Validations (VAL-CN-200 to 249)

### VAL-CN-200: Draft Status Allows All Edits

**Rule**: Credit notes in DRAFT status can be fully edited or deleted.

**Implementation Requirements**:
- **Client-Side**: Enable all form fields for editing. Show "Edit", "Delete", and "Post to GL" buttons.
- **Server-Side**: Allow all updates when status = 'DRAFT'. No restrictions.
- **Database**: No constraints on draft updates.

**Error Code**: N/A (no error condition)
**User Action**: User can freely edit, delete, or post draft credit notes.

---

### VAL-CN-201: Posted Status Immutable Except Void

**Rule**: Credit notes in POSTED status cannot be edited or deleted. Only void action allowed.

**Implementation Requirements**:
- **Client-Side**: Disable all form fields. Show only "Void" button if authorized.
- **Server-Side**: Reject all edit/delete requests when status = 'POSTED'. Only allow void action.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-201
**Error Message**: "Cannot edit posted credit note. Void if corrections needed."
**User Action**: User must void the posted credit note if corrections needed. Voiding creates reversal entries.

**Test Cases**:
- ✅ Valid: Void posted credit note
- ✅ Valid: View posted credit note (read-only)
- ❌ Invalid: Edit posted credit note
- ❌ Invalid: Delete posted credit note

---

### VAL-CN-202: Voided Status Completely Immutable

**Rule**: Credit notes in VOID status cannot be edited, deleted, or changed in any way.

**Implementation Requirements**:
- **Client-Side**: Display in read-only mode. No action buttons except "View".
- **Server-Side**: Reject all modification requests when status = 'VOID'.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-202
**Error Message**: "Cannot modify voided credit note"
**User Action**: User can only view voided credit notes. Create new credit note if needed.

**Test Cases**:
- ✅ Valid: View voided credit note
- ❌ Invalid: Edit voided credit note
- ❌ Invalid: Unvoid credit note
- ❌ Invalid: Delete voided credit note

---

### VAL-CN-203: Status Transition from Draft to Posted

**Rule**: Can transition from DRAFT to POSTED only if all required fields are complete and journal entries are successfully generated.

**Implementation Requirements**:
- **Client-Side**: Validate all required fields before "Post to GL" action. Show validation errors if incomplete. Show confirmation dialog explaining posting is irreversible.
- **Server-Side**: Run all field and business rule validations. Generate journal entries atomically. Only update status to POSTED if all validations pass and journal entry creation succeeds.
- **Database**: Use database transaction. Rollback if any part fails.

**Error Code**: VAL-CN-203
**Error Message**: "Cannot post incomplete or invalid credit note"
**User Action**: User must complete all required fields and fix validation errors before posting.

**Test Cases**:
- ✅ Valid: Complete draft with successful journal entry generation transitions to posted
- ❌ Invalid: Draft missing vendor cannot be posted
- ❌ Invalid: Draft with no line items cannot be posted
- ❌ Invalid: Draft with calculation errors cannot be posted
- ❌ Invalid: Journal entry generation fails, status remains DRAFT
- ❌ Invalid: Posting attempted when GL is locked

---

### VAL-CN-204: Status Transition to Void

**Rule**: Can transition to VOID only from POSTED status. Requires void reason and authorization.

**Implementation Requirements**:
- **Client-Side**: Show "Void" button only for posted credit notes. Show confirmation dialog. Require void reason input. Show warning about irreversibility.
- **Server-Side**: Verify status = POSTED. Verify user has void authority. Generate reversal journal entries. Record void reason and timestamp.
- **Database**: Use database transaction. Ensure all reversals complete before status update.

**Error Code**: VAL-CN-204
**Error Message**: "Can only void posted credit notes"
**User Action**: User must provide void reason. Confirm understanding that void is permanent. System handles reversals.

**Test Cases**:
- ✅ Valid: Void posted credit note (creates reversal entries)
- ❌ Invalid: Void draft credit note (delete instead)
- ❌ Invalid: Void already voided credit note
- ❌ Invalid: Void without providing reason
- ❌ Invalid: Unauthorized user attempts void

---

## 5. Integration Validations (VAL-CN-300 to 349)

### VAL-CN-300: Finance Module - Journal Entry Generation

**Rule**: When posting credit note, must successfully generate journal entries for both Primary GL Group and Inventory GL Group.

**Implementation Requirements**:
- **Client-Side**: Show "Posting..." progress indicator during posting action.
- **Server-Side**: Generate journal entries in transaction. Primary group: DR Vendor Payables, CR Input VAT, CR Purchases. Inventory group: DR COGS Variance, CR Inventory Asset. Rollback all if any entry fails.
- **Database**: Use database transaction for atomic posting.

**Error Code**: VAL-CN-300
**Error Message**: "Failed to generate journal entries for credit note posting"
**User Action**: System automatically generates entries. User should retry or contact support if error occurs.

**Test Cases**:
- ✅ Valid: All journal entries created successfully
- ❌ Invalid: Primary GL group entry fails, transaction rolled back
- ❌ Invalid: Inventory GL group entry fails, transaction rolled back
- ❌ Invalid: GL period is closed, posting rejected

---

### VAL-CN-301: Inventory Module - Stock Movement Generation

**Rule**: When posting quantity return credit note, must successfully generate stock movement entries for returned items.

**Implementation Requirements**:
- **Client-Side**: Show stock movement indicator for quantity returns during posting.
- **Server-Side**: For QUANTITY_RETURN type, generate stock movement entries: Movement Type = "CREDIT_NOTE_RETURN", update lot quantities. Skip for AMOUNT_DISCOUNT type.
- **Database**: Use database transaction. Update inventory lot quantities atomically.

**Error Code**: VAL-CN-301
**Error Message**: "Failed to generate stock movement entries"
**User Action**: System automatically generates movements. User should retry or contact support if error occurs.

**Test Cases**:
- ✅ Valid: Quantity return generates stock movements
- ✅ Valid: Amount discount skips stock movements
- ❌ Invalid: Insufficient inventory quantity to return
- ❌ Invalid: Lot no longer exists in inventory

---

### VAL-CN-302: Vendor Module - Payables Adjustment

**Rule**: Posting credit note must update vendor payables balance.

**Implementation Requirements**:
- **Client-Side**: Display vendor payables impact summary before posting.
- **Server-Side**: On posting, reduce vendor payables balance by credit note total amount. Update vendor account aging.
- **Database**: Update vendor_accounts table in same transaction as journal entries.

**Error Code**: VAL-CN-302
**Error Message**: "Failed to update vendor payables balance"
**User Action**: System automatically updates payables. User should retry or contact support if error occurs.

**Test Cases**:
- ✅ Valid: Vendor payables reduced by credit note amount
- ❌ Invalid: Vendor account locked, posting rejected
- ❌ Invalid: Credit exceeds vendor payables balance (creates credit balance)

---

### VAL-CN-303: Tax Module - Input VAT Adjustment

**Rule**: Posting credit note must adjust input VAT balance for tax reporting.

**Implementation Requirements**:
- **Client-Side**: Display tax impact summary before posting.
- **Server-Side**: On posting, reduce input VAT balance by credit note tax amount. Generate tax adjustment entry.
- **Database**: Update tax_accounts table in same transaction as journal entries.

**Error Code**: VAL-CN-303
**Error Message**: "Failed to adjust input VAT balance"
**User Action**: System automatically adjusts VAT. User should retry or contact support if error occurs.

**Test Cases**:
- ✅ Valid: Input VAT reduced by credit note tax amount
- ❌ Invalid: Tax period already filed, posting rejected
- ❌ Invalid: Tax account locked, adjustment rejected

---

## 6. Cross-Field Validations (VAL-CN-400 to 449)

### VAL-CN-400: Total Amount Calculation Accuracy

**Rule**: Credit note total amount must equal subtotal + tax amount (within $0.01 rounding tolerance).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate total as subtotal + tax. Display read-only.
- **Server-Side**: Verify: |totalAmount - (subtotalAmount + taxAmount)| <= 0.01. Reject if outside tolerance.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-400
**Error Message**: "Total amount calculation is incorrect"
**User Action**: System auto-calculates. User should verify subtotal and tax amounts if error occurs.

**Test Cases**:
- ✅ Valid: subtotal $1000.00, tax $100.00, total $1100.00
- ✅ Valid: subtotal $1275.55, tax $127.56, total $1403.11 (within rounding)
- ❌ Invalid: subtotal $1000.00, tax $100.00, total $1200.00 (calculation error)

---

### VAL-CN-401: Subtotal Matches Line Items Sum

**Rule**: Credit note subtotal must equal sum of all line item credit amounts (within $0.10 rounding tolerance).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate subtotal from sum of line item cnAmt. Display read-only.
- **Server-Side**: Verify: |subtotalAmount - SUM(line_item.cnAmt)| <= 0.10. Reject if outside tolerance.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-401
**Error Message**: "Subtotal does not match sum of line item amounts"
**User Action**: System auto-calculates. User should verify line item amounts if error occurs.

**Test Cases**:
- ✅ Valid: 3 items ($400 + $500 + $375.55) = subtotal $1275.55
- ✅ Valid: 2 items ($1000.00 + $275.05) = subtotal $1275.05 (within rounding)
- ❌ Invalid: 2 items ($1000 + $500) = subtotal $2000 (calculation error)

---

### VAL-CN-402: Tax Amount Matches Line Items Tax Sum

**Rule**: Credit note tax amount must equal sum of all line item tax amounts (within $0.10 rounding tolerance).

**Implementation Requirements**:
- **Client-Side**: Auto-calculate tax from sum of line item taxAmount. Display read-only.
- **Server-Side**: Verify: |taxAmount - SUM(line_item.taxAmount)| <= 0.10. Reject if outside tolerance.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-402
**Error Message**: "Tax amount does not match sum of line item taxes"
**User Action**: System auto-calculates. User should verify line item tax amounts if error occurs.

**Test Cases**:
- ✅ Valid: 3 items ($40 + $50 + $37.56) = tax $127.56
- ❌ Invalid: 2 items ($100 + $50) = tax $200 (calculation error)

---

### VAL-CN-403: Applied Lots Total Equals Line Item Quantity

**Rule**: For each quantity return line item, sum of applied lot quantities must equal the line item cnQty.

**Implementation Requirements**:
- **Client-Side**: Real-time validation as user selects lots. Show remaining quantity to allocate.
- **Server-Side**: For each item, verify: SUM(lot.quantity) = item.cnQty. Reject if mismatch.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-403
**Error Message**: "Applied lot quantities do not match line item credit quantity"
**User Action**: User must allocate lot quantities to match the total credit quantity for the item.

**Test Cases**:
- ✅ Valid: cnQty = 100, lots (60 + 40) = 100
- ✅ Valid: cnQty = 50.5, lots (30.5 + 20) = 50.5
- ❌ Invalid: cnQty = 100, lots (60 + 30) = 90 (under-allocated)
- ❌ Invalid: cnQty = 100, lots (60 + 50) = 110 (over-allocated)

---

### VAL-CN-404: Currency Consistency Across Document

**Rule**: All line items must use the same currency as the credit note header.

**Implementation Requirements**:
- **Client-Side**: Disable currency selection on line items. Use header currency automatically.
- **Server-Side**: Verify all line items have same currency as header. Reject if mismatch found.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-404
**Error Message**: "All line items must use the same currency as the credit note"
**User Action**: System automatically uses header currency for all line items.

**Test Cases**:
- ✅ Valid: Header USD, all line items USD
- ❌ Invalid: Header USD, one line item EUR
- ❌ Invalid: Header EUR, mixed line items (EUR, USD, GBP)

---

### VAL-CN-405: Exchange Rate Consistency

**Rule**: Credit note must use the same exchange rate as the original GRN for accurate cost comparisons.

**Implementation Requirements**:
- **Client-Side**: Auto-populate exchange rate from GRN. Display as read-only with source indication.
- **Server-Side**: Verify credit_note.exchangeRate = grn.exchangeRate. Reject if mismatch.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-405
**Error Message**: "Exchange rate must match the original GRN exchange rate"
**User Action**: System automatically uses GRN exchange rate. User should not override.

**Test Cases**:
- ✅ Valid: GRN exchange rate 1.25, CN exchange rate 1.25
- ❌ Invalid: GRN exchange rate 1.25, CN exchange rate 1.30 (user override rejected)

---

## 7. Security Validations (VAL-CN-500 to 549)

### VAL-CN-500: User Must Have Create Permission

**Rule**: User must have "credit-note:create" permission to create new credit notes.

**Implementation Requirements**:
- **Client-Side**: Hide "Create Credit Note" button if user lacks permission.
- **Server-Side**: Verify user has "credit-note:create" permission. Reject request if unauthorized.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-500
**Error Message**: "You do not have permission to create credit notes"
**User Action**: User must contact administrator to request permission.

**Test Cases**:
- ✅ Valid: User with "credit-note:create" permission creates CN
- ❌ Invalid: User without permission attempts to create CN

---

### VAL-CN-501: User Must Have Edit Permission for Drafts

**Rule**: User must have "credit-note:edit" permission to edit draft credit notes.

**Implementation Requirements**:
- **Client-Side**: Hide "Edit" button if user lacks permission.
- **Server-Side**: Verify user has "credit-note:edit" permission. Reject edit request if unauthorized.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-501
**Error Message**: "You do not have permission to edit credit notes"
**User Action**: User must contact administrator to request permission.

**Test Cases**:
- ✅ Valid: User with "credit-note:edit" permission edits draft
- ❌ Invalid: User without permission attempts to edit draft

---

### VAL-CN-502: User Must Have Delete Permission

**Rule**: User must have "credit-note:delete" permission to delete draft credit notes.

**Implementation Requirements**:
- **Client-Side**: Hide "Delete" button if user lacks permission or CN is not draft.
- **Server-Side**: Verify user has "credit-note:delete" permission and status = 'DRAFT'. Reject if unauthorized or wrong status.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-502
**Error Message**: "You do not have permission to delete credit notes"
**User Action**: User must contact administrator to request permission. Can only delete drafts.

**Test Cases**:
- ✅ Valid: User with delete permission deletes draft CN
- ❌ Invalid: User without permission attempts to delete draft
- ❌ Invalid: User attempts to delete non-draft CN

---

### VAL-CN-503: User Must Have Post Permission

**Rule**: User must have "credit-note:post" permission to post credit notes to general ledger.

**Implementation Requirements**:
- **Client-Side**: Hide "Post to GL" button if user lacks permission.
- **Server-Side**: Verify user has "credit-note:post" permission. Reject posting if unauthorized.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-503
**Error Message**: "You do not have permission to post credit notes to general ledger"
**User Action**: User must contact administrator to request permission or route to authorized user.

**Test Cases**:
- ✅ Valid: User with post permission posts draft CN
- ❌ Invalid: User without permission attempts to post CN

---

### VAL-CN-504: User Must Have Void Permission

**Rule**: User must have "credit-note:void" permission to void credit notes.

**Implementation Requirements**:
- **Client-Side**: Hide "Void" button if user lacks permission.
- **Server-Side**: Verify user has "credit-note:void" permission. Reject void request if unauthorized.
- **Database**: No direct constraint. Enforced at application level.

**Error Code**: VAL-CN-504
**Error Message**: "You do not have permission to void credit notes"
**User Action**: User must contact administrator to request permission.

**Test Cases**:
- ✅ Valid: User with void permission voids CN
- ❌ Invalid: User without permission attempts to void CN

---

## 8. Data Integrity Validations (VAL-CN-600 to 649)

### VAL-CN-600: Unique Credit Note Number

**Rule**: Credit note number must be unique across entire system.

**Implementation Requirements**:
- **Client-Side**: Auto-generate number using next sequence. Display as read-only.
- **Server-Side**: Verify uniqueness before insert. Use database sequence or application-level locking.
- **Database**: UNIQUE constraint on cn_number column.

**Error Code**: VAL-CN-600
**Error Message**: "Credit note number already exists"
**User Action**: System automatically generates unique number. User should retry if error occurs.

**Test Cases**:
- ✅ Valid: New CN with unique number "CN-2025-000123"
- ❌ Invalid: Attempt to create CN with existing number

---

### VAL-CN-601: Required Audit Fields

**Rule**: All audit fields (createdBy, createdAt, updatedBy, updatedAt) must be populated.

**Implementation Requirements**:
- **Client-Side**: Auto-populate from current user and timestamp. Do not display to user.
- **Server-Side**: Automatically set createdBy/createdAt on insert, updatedBy/updatedAt on update.
- **Database**: Columns defined as NOT NULL with default values or triggers.

**Error Code**: VAL-CN-601
**Error Message**: "Audit fields are required"
**User Action**: System automatically populates audit fields.

**Test Cases**:
- ✅ Valid: All audit fields populated on create/update
- ❌ Invalid: Audit fields null or missing

---

### VAL-CN-602: Referential Integrity - Vendor Exists

**Rule**: Referenced vendor must exist in vendors table.

**Implementation Requirements**:
- **Client-Side**: Only allow selection from valid vendor list.
- **Server-Side**: Verify vendor_id exists in vendors table before save.
- **Database**: Foreign key constraint to vendors table.

**Error Code**: VAL-CN-602
**Error Message**: "Referenced vendor does not exist"
**User Action**: User must select a valid vendor from the system.

**Test Cases**:
- ✅ Valid: Vendor ID exists in vendors table
- ❌ Invalid: Vendor ID "INVALID" does not exist

---

### VAL-CN-603: Referential Integrity - GRN Exists

**Rule**: Referenced GRN must exist in goods_receive_notes table.

**Implementation Requirements**:
- **Client-Side**: Only allow selection from valid GRN list for selected vendor.
- **Server-Side**: Verify grn_id exists in goods_receive_notes table before save.
- **Database**: Foreign key constraint to goods_receive_notes table.

**Error Code**: VAL-CN-603
**Error Message**: "Referenced GRN does not exist"
**User Action**: User must select a valid GRN from the system.

**Test Cases**:
- ✅ Valid: GRN ID exists in goods_receive_notes table
- ❌ Invalid: GRN ID "INVALID" does not exist

---

### VAL-CN-604: Referential Integrity - Product Exists

**Rule**: Referenced product in line items must exist in products table.

**Implementation Requirements**:
- **Client-Side**: Only allow selection from valid product list.
- **Server-Side**: For each line item, verify product_id exists in products table.
- **Database**: Foreign key constraint to products table.

**Error Code**: VAL-CN-604
**Error Message**: "Referenced product does not exist"
**User Action**: User must select a valid product from the system.

**Test Cases**:
- ✅ Valid: All line item products exist in products table
- ❌ Invalid: Line item with non-existent product ID

---

### VAL-CN-605: Orphaned Line Items Prevention

**Rule**: Cannot delete credit note if it would orphan line items or attachments.

**Implementation Requirements**:
- **Client-Side**: Warn user that deleting CN will delete all related data.
- **Server-Side**: Use CASCADE delete or explicitly delete related records in transaction.
- **Database**: Foreign key constraints with ON DELETE CASCADE or application-level handling.

**Error Code**: VAL-CN-605
**Error Message**: "Cannot delete credit note with related data"
**User Action**: System automatically handles cascade deletion. User confirms deletion understanding all related data will be removed.

**Test Cases**:
- ✅ Valid: Delete CN and all related items/lots/attachments together
- ❌ Invalid: Delete CN leaving orphaned line items (prevented by cascade)

---

## 9. Error Message Catalog

### Error Code Format
- **VAL-CN-XXX**: Validation error code
- **XXX ranges**:
  - 001-099: Field-level validations
  - 100-199: Business rule validations
  - 200-249: Status-based validations
  - 300-349: Integration validations
  - 400-449: Cross-field validations
  - 500-549: Security validations
  - 600-649: Data integrity validations

### Error Severity Levels
- **Critical**: Prevents save/submission, must be fixed (field required, calculation errors)
- **Warning**: Allows save but prevents progression (posting blocked, validation incomplete)
- **Info**: Informational only, does not block (lot selection recommended, calculation details)

### User-Friendly Error Messages
All error messages follow these principles:
1. **Clear**: Explain what went wrong in plain language
2. **Actionable**: Tell user how to fix the problem
3. **Specific**: Reference the exact field or rule violated
4. **Professional**: Maintain hospitality industry professional tone
5. **Helpful**: Provide examples or guidance when possible

### Example Error Display Format
```
❌ Validation Error (VAL-CN-018)
Credit note quantity must be between 0 and received quantity

Field: Credit Note Quantity
Current Value: 150.000
Received Quantity: 100.000
Action Required: Reduce credit quantity to not exceed 100.000
```

---

## 10. Validation Testing Strategy

### Test Coverage Requirements
- **Field-Level**: 100% coverage of all required/optional fields
- **Business Rules**: 100% coverage of all business logic validations
- **Status Transitions**: 100% coverage of all valid and invalid status changes
- **Integration Points**: 100% coverage of all external system validations
- **Security**: 100% coverage of all permission checks
- **Data Integrity**: 100% coverage of all referential integrity rules

### Automated Testing
- **Unit Tests**: Individual validation rule functions
- **Integration Tests**: Multi-field and cross-entity validations
- **E2E Tests**: Complete user workflows with validation scenarios
- **Performance Tests**: Validation execution time < 100ms per rule

### Manual Testing Scenarios
- **Edge Cases**: Boundary values, null handling, special characters
- **User Experience**: Error message clarity, inline validation timing
- **Accessibility**: Screen reader compatibility for error messages
- **Multi-Language**: Validation messages in multiple languages (future)

---

## 11. Validation Performance Metrics

### Target Performance
- **Client-Side Validation**: < 50ms per field
- **Server-Side Validation**: < 200ms for entire credit note
- **Database Validation**: < 100ms for constraint checks

### Monitoring
- Track validation failure rates by rule
- Monitor most common validation errors
- Alert on performance degradation
- Log all validation errors for analysis

---

## 12. Appendices

### Appendix A: Validation Rule Summary Matrix

| Code | Rule Name | Severity | Layer | Status |
|------|-----------|----------|-------|--------|
| VAL-CN-001 | CN Number Required | Critical | All | Active |
| VAL-CN-002 | Document Date Required | Critical | All | Active |
| VAL-CN-003 | Future Date Prevention | Critical | All | Active |
| VAL-CN-004 | Vendor Required | Critical | All | Active |
| VAL-CN-005 | Valid Credit Type | Critical | All | Active |
| ... | ... | ... | ... | ... |

### Appendix B: Field Validation Quick Reference

**Required Fields (Cannot be null/empty)**:
- cnNumber, documentDate, vendorId, vendorName, creditType, grnId, status, creditReason, currency, exchangeRate
- subtotalAmount, taxAmount, totalAmount, createdBy, createdAt, updatedBy, updatedAt

**Optional Fields (Can be null)**:
- description, realizedGainLoss, voidReason, voidedBy, voidedAt, committedBy, committedAt

**Calculated Fields (Auto-populated, read-only)**:
- cnNumber, subtotalAmount, taxAmount, totalAmount, realizedGainLoss, costVariance

### Appendix C: Status Transition Validation Matrix

| From Status | To Status | Validation Required |
|-------------|-----------|---------------------|
| DRAFT | COMMITTED | All field, business rule, and journal entry generation validations |
| Any | VOID | User void permission validation |
| COMMITTED | VOID | Reversal entry generation validation |

### Appendix D: FIFO Calculation Validation Example

**Scenario**: Returning 100 units from two lots

**Applied Lots**:
- Lot 1: 60 units @ $10.00/unit = $600.00
- Lot 2: 40 units @ $12.00/unit = $480.00

**Calculation**:
- Total Cost: $600.00 + $480.00 = $1,080.00
- Total Quantity: 60 + 40 = 100 units
- **Weighted Average Cost**: $1,080.00 / 100 = **$10.80/unit**

**Validation**:
- ✅ Lot quantities sum = line item cnQty (60 + 40 = 100)
- ✅ Weighted average = $10.80
- ✅ Current inventory cost = $11.00
- ✅ Cost variance = $11.00 - $10.80 = **$0.20/unit** or **$20.00 total**

---

**Document Control**:
- **Version**: 1.0.0
- **Status**: Active
- **Review Frequency**: Quarterly
- **Next Review**: 2025-05-01
- **Owner**: Procurement Module Team
- **Approver**: Chief Technology Officer

**Change Log**:
- 2025-11-01: Initial version 1.0.0 created
