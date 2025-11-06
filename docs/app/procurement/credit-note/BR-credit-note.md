# Business Requirements: Credit Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Credit Note (CN)
- **Route**: `/procurement/credit-note`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-01
- **Owner**: Procurement Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-01 | Documentation Team | Initial version from source code analysis |

---

## Overview

The Credit Note module is a critical financial component of the procurement system that manages vendor credits resulting from returns, pricing adjustments, damaged goods, and billing errors. This module serves as the bridge between Goods Received Notes (GRN) and accounts payable, ensuring accurate financial reconciliation when purchased goods are returned or credits are issued.

The Credit Note system supports two distinct workflows: quantity-based returns (linked to specific GRN items and lots) and amount-only discounts (pricing adjustments without physical returns). It handles multi-currency transactions, tax adjustments, lot-based inventory tracking, and automatic financial postings upon credit note commitment.

This module is essential for hospitality operations, managing vendor credits for everything from damaged kitchen equipment and spoiled food items to pricing errors and negotiated discounts, ensuring all credits are properly documented and reflected in inventory and financial records.

## Business Objectives

1. **Accurate Credit Recording**: Provide a reliable system for documenting all vendor credits with complete traceability and justification
2. **Inventory Reconciliation**: Automatically adjust inventory levels and lot tracking when goods are returned to vendors
3. **Financial Accuracy**: Generate accurate financial records including journal vouchers and tax adjustments for all credits
4. **Multi-Currency Support**: Handle international vendor transactions with automatic currency conversion and exchange rate tracking
5. **Audit Trail**: Maintain comprehensive activity logs for all credit note operations to support compliance and audits
6. **FIFO Costing**: Apply First-In-First-Out costing methodology for accurate cost of goods calculations on returns
7. **Tax Compliance**: Properly calculate and adjust input VAT for all credit transactions
8. **Vendor Accountability**: Track credit reasons and patterns to identify vendor performance issues
9. **Lot Tracking**: Maintain detailed lot-level tracking for items being returned or credited

## Key Stakeholders

- **Primary Users**: Accounts payable clerks, purchasing staff, receiving clerks
- **Secondary Users**: Finance managers, warehouse staff, department managers
- **Administrators**: System administrators, finance administrators
- **Reviewers**: Internal auditors, tax compliance team, vendor relationship managers
- **Support**: IT support team, finance support

---

## Functional Requirements

### FR-CN-001: Credit Note List and Overview
**Priority**: Critical

The system must provide a comprehensive list view of all Credit Notes with sorting, filtering, and search capabilities to enable staff to quickly locate and manage credit records.

**Acceptance Criteria**:
- Display all Credit Note records in a sortable, filterable data table
- Show key information: Credit Note number, date, vendor, status, total amount, reason
- Support filtering by status (Draft, Committed, Voided)
- Support filtering by date range, vendor, credit type, reason
- Provide search functionality across credit note number, vendor name, description
- Display row actions for view, edit, delete, commit operations
- Show visual status indicators with color coding (Draft: gray, Committed: green, Void: red)
- Support both card view and table view display modes
- Enable bulk operations on selected credit notes (delete)

**Related Requirements**: FR-CN-002, FR-CN-003, FR-CN-004

---

### FR-CN-002: Create Quantity-Based Credit Note (Item Return)
**Priority**: Critical

The system must support creating credit notes for physical returns of goods, linked to specific GRN items and inventory lots with FIFO costing.

**Acceptance Criteria**:
- Provide vendor selection interface to filter applicable GRNs
- Display GRNs for selected vendor with invoice references
- Allow selection of GRN and its line items for credit
- Support lot-level selection with FIFO layer tracking
- Calculate weighted average cost from lot history
- Calculate cost variance between current price and historical cost
- Calculate realized gain/loss on return
- Track return quantity per item and lot
- Generate negative stock movements to reduce inventory
- Auto-populate item details from selected GRN (description, unit price, location)
- Generate unique credit note number following format: CN-YYYY-NNN
- Set credit note type to QUANTITY_RETURN

**Related Requirements**: FR-CN-005, FR-CN-006, FR-CN-008, FR-CN-009

---

### FR-CN-003: Create Amount-Only Credit Note (Pricing Adjustment)
**Priority**: High

The system must support creating credit notes for pricing adjustments or discounts without physical return of goods.

**Acceptance Criteria**:
- Provide vendor selection interface
- Allow selection of GRN reference for credit justification
- Support manual entry of discount amount per line item
- Calculate tax impact based on discount amount
- No stock movement generated (goods not physically returned)
- Generate journal entries for accounts payable and tax adjustment only
- Support credit reason selection (PRICING_ERROR, DISCOUNT_AGREEMENT, OTHER)
- Set credit note type to AMOUNT_DISCOUNT
- Allow multi-line discounts within single credit note

**Related Requirements**: FR-CN-006, FR-CN-010

---

### FR-CN-004: Credit Note Detail View
**Priority**: Critical

The system must provide a comprehensive detail view showing all credit note information with tabs for different data categories.

**Acceptance Criteria**:
- Display credit note header with all key fields (number, date, vendor, status, type, reason)
- Show currency and exchange rate for multi-currency credits
- Display invoice and tax invoice references
- Display GRN reference with link to source GRN
- Provide tabbed interface with following tabs:
  * Items: Line items with quantities, prices, lot information
  * Stock Movement: Inventory adjustments by lot and location
  * Journal Entries: Financial postings with account codes
  * Tax Entries: Tax adjustments with VAT calculations
  * Inventory: Impact on inventory values and quantities
  * Attachments: Uploaded supporting documents
- Show status badge with visual indicator (Draft, Committed, Void)
- Display action buttons based on status (Edit, Delete, Commit, Print, Send)
- Show side panel toggle for additional information display
- Display audit information (created by, created date, updated by, updated date, committed by, committed date)

**Related Requirements**: FR-CN-001, FR-CN-002, FR-CN-003

---

### FR-CN-005: Vendor and GRN Selection Workflow
**Priority**: Critical

The system must provide an intuitive workflow for selecting vendor and associated GRNs when creating credit notes.

**Acceptance Criteria**:
- Step 1: Vendor Selection
  * Display vendor list with search capability
  * Show vendor code, name, contact information
  * Filter active vendors only
  * Allow selection of single vendor
- Step 2: GRN Selection
  * Display GRNs for selected vendor
  * Show GRN number, date, invoice number, total amount
  * Provide search functionality on GRN number and invoice number
  * Filter committed GRNs only (exclude Draft and Void)
  * Allow selection of single GRN
  * Display GRN status and date
- Navigation: Back button to return to vendor selection
- Validation: Cannot proceed without vendor and GRN selection

**Related Requirements**: FR-CN-002, FR-CN-003

---

### FR-CN-006: Item and Lot Selection with FIFO Costing
**Priority**: Critical

The system must support detailed item and lot selection with First-In-First-Out cost tracking for accurate financial calculations.

**Acceptance Criteria**:
- Display all line items from selected GRN
- Show item details: product name, description, location, order quantity, unit price, order unit, inventory unit
- Allow selection of items to credit via checkboxes
- For QUANTITY_RETURN type:
  * Display lot information for each item (lot number, receive date, quantity, unit cost)
  * Allow selection of specific lots to return from
  * Support entry of return quantity per item
  * Calculate FIFO summary:
    - Total received quantity from all lots
    - Weighted average cost across lots
    - Current unit price from GRN
    - Cost variance (current price - weighted average cost)
    - Return amount (return quantity × current price)
    - Cost of goods sold (return quantity × weighted average cost)
    - Realized gain/loss (return amount - cost of goods sold)
  * Validate return quantity does not exceed available lot quantities
- For AMOUNT_DISCOUNT type:
  * Support entry of discount amount per item
  * No lot selection required
  * Calculate tax impact on discount
- Show expandable detail section for FIFO analysis
- Display summary totals at bottom

**Related Requirements**: FR-CN-002, FR-CN-009

---

### FR-CN-007: Stock Movement Generation
**Priority**: Critical

The system must automatically generate stock movement transactions when quantity-based credit notes are committed.

**Acceptance Criteria**:
- Generate stock movements only for QUANTITY_RETURN type credits
- Create negative quantity movements (reducing inventory)
- Track movements by lot number
- Include location information (warehouse, store, department)
- Record location type (INV for Inventory, CON for Consignment)
- Calculate costs:
  * Unit cost from lot FIFO layer
  * Extra cost (if applicable)
  * Total cost (unit cost + extra cost) × quantity
- Link stock movements to credit note reference
- Update lot balance quantities
- Reduce inventory on hand by credit quantity
- Support multi-location returns within single credit note
- Validate sufficient lot quantity available before committing
- Generate movement reference number

**Related Requirements**: FR-CN-002, FR-CN-006

---

### FR-CN-008: Journal Entry Generation
**Priority**: Critical

The system must automatically generate and post journal voucher entries when credit notes are committed.

**Acceptance Criteria**:
- Generate journal entries for both credit note types:

  **For QUANTITY_RETURN**:
  * Debit: Accounts Payable (reduce liability)
  * Credit: Inventory - Raw Materials (reduce asset value)
  * Credit: Input VAT (reduce tax recoverable)
  * Debit: Inventory Cost Variance (if cost variance exists)
  * Credit: Inventory - Raw Materials (offset variance)

  **For AMOUNT_DISCOUNT**:
  * Debit: Accounts Payable (reduce liability)
  * Credit: Input VAT (reduce tax recoverable)
  * Credit: Purchase Discounts (or relevant income account)

- Include in each journal entry line:
  * Account code and name
  * Department code and name
  * Cost center
  * Description
  * Reference (credit note number, GRN number)
  * Debit or Credit amount
  * Tax code and rate (if applicable)
  * Order number (for entry sequence)

- Group entries logically:
  * Primary Entries (main credit adjustments)
  * Inventory Entries (stock value adjustments)
  * Tax Entries (VAT adjustments)

- Calculate and display totals:
  * Total Debit amount
  * Total Credit amount
  * Balance check (Debit = Credit)

- Set journal status to Committed when credit committed
- Link journal voucher to credit note reference
- Allow recalculation before committing
- Support department filtering in journal entry view

**Related Requirements**: FR-CN-009, FR-CN-012

---

### FR-CN-009: Tax Calculation and Adjustment
**Priority**: Critical

The system must accurately calculate tax impacts and generate tax adjustment entries for all credit transactions.

**Acceptance Criteria**:
- Calculate Input VAT adjustment based on credit amount
- Support standard VAT rate (18% or configured rate)
- Display tax summary:
  * Base Amount Impact (credit amount reducing taxable base)
  * Tax Rate (applicable VAT rate)
  * Tax Amount Impact (calculated VAT adjustment)
  * Original Base (from original GRN/invoice)
  * Original Tax (from original GRN/invoice)
- Show tax calculations section with:
  * Original transaction values (base, rate, tax)
  * Credit adjustment values (base, rate, tax)
  * Net impact (difference between original and adjusted)
- Display tax adjustments per line item:
  * Tax type (Input VAT)
  * Tax code (VAT18 or configured)
  * Description (Standard Rate VAT)
  * Base amount
  * Tax rate percentage
  * Tax amount
  * GL account code (1240 Input VAT or configured)
- Show VAT period information:
  * Period (month and year)
  * VAT return status (Open, Submitted, Filed)
  * Due date
  * Reporting code (BOX4 or relevant box)
- Link to tax invoice reference
- Support tax-exclusive and tax-inclusive credit scenarios
- Validate tax calculations before posting

**Related Requirements**: FR-CN-008, FR-CN-012

---

### FR-CN-010: Void Credit Note
**Priority**: High

The system must support voiding of committed credit notes with full reversal of all financial and inventory impacts.

**Acceptance Criteria**:
- Allow voiding only for credits in Committed status
- Require void reason and confirmation
- Generate reversal entries:
  * Reverse all stock movements (opposite sign quantities)
  * Reverse all journal entries (swap debits and credits)
  * Reverse tax adjustments
- Create reversal reference linking to original credit note
- Update credit note status to Void
- Maintain audit trail of void operation:
  * Voided by (user)
  * Voided date
  * Void reason
  * Reversal transaction references
- Mark credit note as read-only after voiding
- Display "VOID" watermark or indicator in printed documents
- Update lot balances (add back voided quantities)
- Update vendor accounts payable balance
- Support void authorization (require manager permission for large amounts)
- Cannot void a credit note that has been reconciled in bank statement

**Related Requirements**: FR-CN-011

---

### FR-CN-011: Credit Note Commitment
**Priority**: Critical

The system must support committing credit notes to post all financial and inventory transactions.

**Acceptance Criteria**:
- Allow commitment for Draft status credits (no approval required)
- Validate before commitment:
  * All required fields populated
  * Item quantities and amounts valid
  * Sufficient lot quantities available (for returns)
  * Journal entries balanced (debit = credit)
  * Tax calculations correct
  * Exchange rates valid (for foreign currency)
- Perform commitment in transaction:
  * Generate and post stock movements
  * Generate and post journal voucher
  * Generate and post tax adjustments
  * Update lot balances
  * Update inventory values
  * Update vendor accounts payable
  * Update credit note status to Committed
  * Record committed by and committed date
- Rollback all changes if any step fails
- Display success message with references:
  * Stock movement numbers
  * Journal voucher number
  * Tax adjustment reference
- Lock credit note for editing after commitment
- Send notification to accounts payable team
- Update vendor credit balance
- Generate audit log entry

**Related Requirements**: FR-CN-007, FR-CN-008, FR-CN-009, FR-CN-010

---

### FR-CN-012: Multi-Currency Support
**Priority**: High

The system must handle credit notes in foreign currencies with automatic conversion to base currency.

**Acceptance Criteria**:
- Display currency field with ISO code (USD, EUR, GBP, THB, etc.)
- Inherit currency from selected GRN
- Support exchange rate entry and update
- Auto-populate current exchange rate from system rates
- Allow manual override of exchange rate with reason
- Display amounts in both transaction currency and base currency
- Calculate all values in transaction currency:
  * Line item amounts
  * Tax amounts
  * Total credit amount
- Convert to base currency for:
  * Journal entry postings
  * Financial reporting
  * Vendor balance updates
- Store both currencies in database
- Display exchange rate information in header
- Validate exchange rate is positive number
- Record exchange rate source (manual, system, bank rate)
- Show conversion calculations in detail view

**Related Requirements**: FR-CN-008, FR-CN-011

---

### FR-CN-013: Credit Reason Management
**Priority**: High

The system must support categorization of credit notes by reason for analytics and vendor performance tracking.

**Acceptance Criteria**:
- Provide credit reason dropdown with predefined values:
  * PRICING_ERROR: Billing or pricing mistakes
  * DAMAGED_GOODS: Goods received in damaged condition
  * RETURN: Goods returned to vendor (quality issues, overstocking, etc.)
  * DISCOUNT_AGREEMENT: Negotiated discounts or rebates
  * OTHER: Other reasons (requires explanation)
- Make reason field mandatory
- Allow description field for additional explanation
- Track reason statistics by vendor:
  * Count of credits by reason
  * Total value by reason
  * Trend analysis over time
- Generate vendor performance reports using reason data
- Display reason prominently in credit note header
- Filter credit note list by reason
- Link reason to accounting treatment (some reasons may use different GL accounts)

**Related Requirements**: FR-CN-001, FR-CN-014

---

### FR-CN-014: Attachment Management
**Priority**: Medium

The system must support uploading and managing supporting documents for credit notes.

**Acceptance Criteria**:
- Allow upload of multiple attachments per credit note
- Support common file formats:
  * Documents: PDF, DOC, DOCX, XLS, XLSX
  * Images: JPG, PNG, GIF
  * Max file size: 10MB per file
- Store attachment metadata:
  * File name
  * File size
  * Upload date
  * Uploaded by (user)
  * File type
- Display attachments in dedicated tab
- Provide download functionality for each attachment
- Allow deletion of attachments (only in Draft status)
- Show attachment count indicator in list view
- Support drag-and-drop upload
- Validate file types and sizes before upload
- Scan for viruses before storing
- Common attachment types:
  * Vendor debit note
  * Photos of damaged goods
  * Email correspondence
  * Quality inspection reports
  * Delivery notes showing damages

**Related Requirements**: FR-CN-004

---

### FR-CN-015: Printing and Export
**Priority**: Medium

The system must support printing credit notes and exporting data for external use.

**Acceptance Criteria**:
- Generate printable credit note document with:
  * Company header and logo
  * Credit note number and date
  * Vendor information
  * Item details with quantities and prices
  * Tax calculations
  * Total credit amount
  * Terms and conditions
  * VOID watermark (if voided)
- Support PDF export
- Support Excel export of:
  * Credit note list with filters
  * Credit note details
  * Journal entries
  * Tax calculations
- Email credit note to vendor contact
- Print journal voucher for finance records
- Print stock movement report
- Include QR code linking to online credit note view
- Support batch printing of multiple credit notes

**Related Requirements**: FR-CN-004

---

## Business Rules

### General Rules

- **BR-CN-001**: Credit note numbers follow format CN-YYYY-NNNNNN where YYYY is year and NNNNNN is sequential number
- **BR-CN-002**: Credit note numbers must be unique system-wide and auto-generated
- **BR-CN-003**: Credit note date cannot be in the future
- **BR-CN-004**: Credit note date should not be more than 90 days after related GRN date (warning if exceeded)
- **BR-CN-005**: Vendor must be active in the system to create credit notes
- **BR-CN-006**: Only committed GRNs can be selected for credit note creation
- **BR-CN-007**: Credit note must reference exactly one GRN (no multi-GRN credits)
- **BR-CN-008**: Credit amount cannot exceed original GRN amount (cumulative across all credits for that GRN)

### Data Validation Rules

- **BR-CN-010**: All monetary amounts must be positive numbers with maximum 2 decimal places
- **BR-CN-011**: Quantities must be positive numbers with maximum 3 decimal places
- **BR-CN-012**: Exchange rates must be positive numbers with maximum 6 decimal places
- **BR-CN-013**: Tax rates must be between 0 and 100 percent
- **BR-CN-014**: Return quantity cannot exceed received quantity from selected lot
- **BR-CN-015**: Total credit amount must equal sum of line item amounts plus tax
- **BR-CN-016**: Journal entries must balance (total debits = total credits)
- **BR-CN-017**: Credit reason must be one of the predefined enum values
- **BR-CN-018**: Description field maximum length is 500 characters
- **BR-CN-019**: Notes field maximum length is 2000 characters

### Workflow Rules

- **BR-CN-020**: Only Draft status credits can be edited or deleted
- **BR-CN-021**: Committed credits cannot be edited (must be voided and recreated)
- **BR-CN-022**: Void operation requires manager authorization
- **BR-CN-023**: Status transitions must follow defined workflow (Draft → Committed → Void)
- **BR-CN-024**: Cannot delete Committed or Void credits (only Draft)

### Calculation Rules

- **BR-CN-030**: FIFO costing: Use weighted average cost across all applicable lots
- **BR-CN-031**: Cost variance = Current unit price - Weighted average cost
- **BR-CN-032**: Return amount = Return quantity × Current unit price
- **BR-CN-033**: Cost of goods sold = Return quantity × Weighted average cost
- **BR-CN-034**: Realized gain/loss = Return amount - Cost of goods sold
- **BR-CN-035**: Tax amount = Base amount × Tax rate / 100
- **BR-CN-036**: For multi-currency: Base currency amount = Transaction currency amount ×  Exchange rate
- **BR-CN-037**: Total credit = Sum of line amounts + Tax amount
- **BR-CN-038**: Stock movement value = Quantity × Unit cost

### Inventory Rules

- **BR-CN-040**: Stock movements generated only for QUANTITY_RETURN type credits
- **BR-CN-041**: Stock movements use negative quantities (reducing inventory)
- **BR-CN-042**: Lot quantities must be tracked and updated on credit posting
- **BR-CN-043**: Cannot post credit if insufficient lot quantity available
- **BR-CN-044**: Voided credits restore lot quantities (reverse stock movements)
- **BR-CN-045**: Stock movements must reference both credit note and original GRN
- **BR-CN-046**: Multiple lots can be referenced in single credit line item

### Financial Rules

- **BR-CN-050**: Journal entries post to Accounts Payable (reduce liability)
- **BR-CN-051**: Inventory credits post to Inventory GL account (reduce asset)
- **BR-CN-052**: Tax adjustments post to Input VAT account (reduce recoverable tax)
- **BR-CN-053**: Cost variances post to Cost Variance GL account
- **BR-CN-054**: All journal entries must have department and cost center
- **BR-CN-055**: Committed credits update vendor accounts payable balance
- **BR-CN-056**: Void reversals use same GL accounts as original with opposite signs
- **BR-CN-057**: Journal voucher number auto-generated and unique
- **BR-CN-058**: Credits committed in open accounting period only

### Security Rules

- **BR-CN-060**: Only purchasing staff and accounts payable can create credits
- **BR-CN-061**: Only system administrators can void Committed credits above $10,000
- **BR-CN-062**: Users can only view credits for their assigned departments (unless admin)
- **BR-CN-063**: Audit log must record all create, update, commit, void operations
- **BR-CN-064**: Cannot modify credit note created by another user (unless manager/admin)

---

## Conceptual Data Models

### Credit Note
Primary entity for vendor credit documentation.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `refNumber` (string, unique, format: CN-YYYY-NNNNNN)
- `docNumber` (string, unique, internal document tracking)
- `docDate` (date, credit note date)
- `creditType` (enum: QUANTITY_RETURN, AMOUNT_DISCOUNT)
- `status` (enum: DRAFT, COMMITTED, VOID)
- `reason` (enum: PRICING_ERROR, DAMAGED_GOODS, RETURN, DISCOUNT_AGREEMENT, OTHER)
- `description` (string, max 500)
- `notes` (string, max 2000)
- `vendorId` (integer, FK to Vendor)
- `vendorName` (string)
- `grnReference` (string, FK to GoodsReceiveNote)
- `grnDate` (date)
- `invoiceReference` (string)
- `invoiceDate` (date, nullable)
- `taxInvoiceReference` (string, nullable)
- `taxDate` (date, nullable)
- `currency` (string, ISO 4217 code, length 3)
- `exchangeRate` (decimal 15,6)
- `netAmount` (decimal 15,2)
- `taxAmount` (decimal 15,2)
- `totalAmount` (decimal 15,2)
- `committedBy` (string, nullable)
- `committedDate` (date, nullable)
- `voidedBy` (string, nullable)
- `voidedDate` (date, nullable)
- `voidReason` (string, nullable)
- `createdBy` (string)
- `createdDate` (date)
- `updatedBy` (string)
- `updatedDate` (date)

**Relationships**:
- One-to-Many with CreditNoteItem
- One-to-Many with CreditNoteAttachment
- Many-to-One with Vendor
- Many-to-One with GoodsReceiveNote
- One-to-Many with StockMovement (for QUANTITY_RETURN type)
- One-to-One with JournalVoucher

### CreditNoteItem
Line items within a credit note.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `creditNoteId` (integer, FK to CreditNote)
- `lineNumber` (integer, sequence within credit note)
- `productName` (string)
- `productDescription` (string)
- `location` (string)
- `lotNumber` (string, nullable)
- `grnNumber` (string, reference to source GRN)
- `grnDate` (date)
- `orderUnit` (string)
- `inventoryUnit` (string)
- `receivedQuantity` (decimal 15,3, from GRN)
- `creditQuantity` (decimal 15,3, quantity being credited)
- `unitPrice` (decimal 15,2)
- `creditAmount` (decimal 15,2, credit quantity × unit price)
- `discountAmount` (decimal 15,2, for AMOUNT_DISCOUNT type)
- `costVariance` (decimal 15,2, current price - FIFO cost)
- `totalReceivedQuantity` (decimal 15,3, sum from lots)
- `taxRate` (decimal 5,2)
- `taxAmount` (decimal 15,2)
- `totalAmount` (decimal 15,2, credit amount + tax)

**Relationships**:
- Many-to-One with CreditNote
- Many-to-Many with InventoryLot (via AppliedLot)

### AppliedLot
Junction table linking credit note items to specific inventory lots.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `creditNoteItemId` (integer, FK to CreditNoteItem)
- `lotNumber` (string)
- `receiveDate` (date, lot creation date)
- `grnNumber` (string, GRN that created the lot)
- `invoiceNumber` (string, from original GRN)
- `lotQuantity` (decimal 15,3, quantity from this lot)
- `unitCost` (decimal 15,2, FIFO cost from lot)

**Relationships**:
- Many-to-One with CreditNoteItem
- Many-to-One with InventoryLot

### CreditNoteAttachment
Supporting documents for credit notes.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `creditNoteId` (integer, FK to CreditNote)
- `fileName` (string)
- `fileSize` (integer, bytes)
- `fileType` (string, MIME type)
- `filePath` (string, storage location)
- `uploadDate` (date)
- `uploadedBy` (string, user ID)

**Relationships**:
- Many-to-One with CreditNote

---

## Non-Functional Requirements

### Performance
- **NFR-CN-001**: Credit note list page must load within 2 seconds for up to 10,000 records
- **NFR-CN-002**: Search and filter operations must return results within 1 second
- **NFR-CN-003**: Credit note commitment (posting) must complete within 5 seconds for single credit
- **NFR-CN-004**: FIFO calculation for lot selection must complete within 3 seconds for up to 100 lots
- **NFR-CN-005**: System must support concurrent creation of 20 credit notes without performance degradation
- **NFR-CN-006**: Journal entry generation must complete within 2 seconds

### Usability
- **NFR-CN-010**: User interface must be responsive and work on tablets (minimum 768px width)
- **NFR-CN-011**: Workflow must be intuitive with clear step-by-step progression
- **NFR-CN-012**: Error messages must be clear and actionable
- **NFR-CN-013**: Required fields must be clearly marked with asterisks
- **NFR-CN-014**: Validation errors must be displayed inline next to relevant fields
- **NFR-CN-015**: Success and error notifications must be prominently displayed
- **NFR-CN-016**: Keyboard navigation must be supported for power users
- **NFR-CN-017**: FIFO calculations and cost variance must be clearly explained in UI

### Reliability
- **NFR-CN-020**: System must maintain 99.5% uptime during business hours
- **NFR-CN-021**: Data must be backed up daily with point-in-time recovery capability
- **NFR-CN-022**: Failed commitment operations must rollback completely (atomic transactions)
- **NFR-CN-023**: System must auto-save draft credits every 2 minutes to prevent data loss
- **NFR-CN-024**: Concurrent edit conflicts must be detected and user notified

### Security
- **NFR-CN-030**: All API endpoints must require authentication
- **NFR-CN-031**: Role-based access control must be enforced at both UI and API levels
- **NFR-CN-032**: Sensitive operations (approve, commit, void) must be logged in audit trail
- **NFR-CN-033**: Attachment uploads must be scanned for malware
- **NFR-CN-034**: Session timeout after 30 minutes of inactivity
- **NFR-CN-035**: SQL injection and XSS vulnerabilities must be prevented
- **NFR-CN-036**: Financial data must be encrypted in transit (HTTPS/TLS)

### Scalability
- **NFR-CN-040**: System must handle 500 credit notes per day
- **NFR-CN-041**: Database must support storing 50,000+ credit note records
- **NFR-CN-042**: Attachment storage must support up to 100GB total size
- **NFR-CN-043**: System must scale to support 100 concurrent users

### Maintainability
- **NFR-CN-050**: Code must follow consistent coding standards and conventions
- **NFR-CN-051**: All business logic must be thoroughly documented
- **NFR-CN-052**: Database schema changes must be versioned and migration scripts maintained
- **NFR-CN-053**: API endpoints must have comprehensive documentation
- **NFR-CN-054**: System must log errors with sufficient context for troubleshooting

### Compliance
- **NFR-CN-060**: System must comply with accounting standards (GAAP/IFRS)
- **NFR-CN-061**: Tax calculations must comply with local tax regulations
- **NFR-CN-062**: Audit trail must be tamper-proof and immutable
- **NFR-CN-063**: Data retention must comply with legal requirements (7 years minimum)
- **NFR-CN-064**: Financial reports must be accurate and reconcilable

---

## Success Metrics

### Operational Metrics
- **Average credit note processing time**: < 10 minutes from creation to commitment
- **Error rate**: < 2% credits requiring correction or void
- **User satisfaction score**: > 4.0 out of 5.0

### Financial Metrics
- **Monthly credit volume**: Track total value of credits processed
- **Credit ratio**: Credits as percentage of total purchases (< 5% target)
- **Vendor credit distribution**: Top 10 vendors by credit value and frequency
- **Reason analysis**: Breakdown of credits by reason category

### Quality Metrics
- **Data accuracy**: > 99% accuracy in financial postings
- **Reconciliation success**: 100% of credits reconcilable in vendor statements
- **Audit findings**: Zero audit exceptions related to credit notes
- **System uptime**: > 99.5% during business hours

---

## Dependencies

### Internal Systems
- **Procurement Module**: Requires GRN data and vendor information
- **Inventory Module**: Updates stock movements and lot balances
- **Finance Module**: Posts journal entries and tax adjustments
- **Vendor Management**: Vendor master data and accounts payable balances
- **User Management**: Authentication, authorization, and user information

### External Systems
- **ERP System**: May integrate with external ERP for GL posting
- **Tax Reporting System**: VAT return preparation and submission
- **Email System**: Notifications to approvers and vendors
- **Document Storage**: Attachment file storage and retrieval

### Data Sources
- **GRN Module**: Source for item, pricing, and lot information
- **Vendor Master**: Vendor details, contacts, payment terms
- **Inventory Master**: Product information, units of measure, locations
- **Exchange Rate Service**: Current and historical exchange rates
- **Tax Configuration**: Tax rates, GL accounts, reporting codes

---

## Assumptions and Constraints

### Assumptions
- Users have stable internet connectivity
- Users have basic accounting knowledge
- Vendors provide valid credit justification
- GRN data is accurate and complete
- Exchange rates are updated daily
- Tax rates configured correctly in system
- GL account codes are properly mapped

### Constraints
- Must use existing authentication system
- Must follow company chart of accounts structure
- Cannot modify posted credits (must void and recreate)
- Limited to single GRN reference per credit note
- Maximum attachment size: 10MB per file
- Credit note date cannot exceed 90 days after GRN
- FIFO costing methodology is mandatory

---

## Related Documents

- **Use Cases**: [UC-credit-note.md](./UC-credit-note.md)
- **Technical Specification**: [TS-credit-note.md](./TS-credit-note.md)
- **Data Definition**: [DD-credit-note.md](./DD-credit-note.md)
- **Flow Diagrams**: [FD-credit-note.md](./FD-credit-note.md)
- **Validations**: [VAL-credit-note.md](./VAL-credit-note.md)
- **GRN Business Requirements**: [../goods-received-note/BR-goods-received-note.md](../goods-received-note/BR-goods-received-note.md)

---

**Document Control**:
- **Created**: 2025-11-01
- **Author**: Documentation System
- **Reviewed By**: Business Analyst, Finance Manager, Procurement Manager
- **Approved By**: Product Owner, Finance Director
- **Next Review**: 2025-04-01
