# Price Lists - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Vendor Management > Price Lists
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Executive Summary

### 1.1 Purpose
The Price Lists module provides a centralized system for storing, managing, and accessing vendor-submitted pricing information. It serves as the authoritative source for procurement pricing decisions and purchase order creation, enabling efficient price comparison, historical tracking, and automated price updates from multiple sources.

### 1.2 Scope
This document defines the business requirements for the Price Lists module, including:
- Price list creation and management (manual and automated)
- Multi-vendor pricing storage and comparison
- Price change tracking and approval workflows
- Effective date management and price list lifecycle
- Location and department-specific pricing
- Integration with templates, RFQs, contracts, and procurement
- Bulk import/export operations
- Price alert and notification system

### 1.3 Business Value
- **Cost Optimization**: Enable data-driven vendor selection based on comprehensive price comparison
- **Procurement Efficiency**: Reduce time spent on price research with centralized, up-to-date pricing
- **Budget Accuracy**: Improve budget planning with historical price trends and forecasting
- **Compliance**: Maintain audit trails for pricing decisions and changes
- **Transparency**: Provide clear visibility into pricing across vendors, locations, and time periods
- **Automation**: Reduce manual data entry through automated price list generation from templates and RFQs

---

## 2. Business Requirements

### 2.1 Price List Management

#### BR-PL-001: Price List Creation
**Priority**: High
**Requirement**: System must allow users to create price lists manually or automatically from multiple sources.

**Details**:
- Manual creation with line-by-line data entry
- Automated creation from:
  - Pricelist template submissions
  - Awarded RFQ bids
  - Contract negotiation results
  - Import from Excel/CSV files
- Price list must include:
  - Unique identifier and reference number
  - Associated vendor
  - Effective date range
  - Source reference (if applicable)
  - Location/department targeting (optional)
  - At least one product with pricing

**Acceptance Criteria**:
- Users can create price lists through manual entry
- System auto-generates price lists from template submissions
- System auto-generates price lists from awarded RFQs
- Each price list receives a unique number (format: PL-YYYY-VENDOR-XXXX)
- All required fields are validated before save

#### BR-PL-002: Price List Line Item Management
**Priority**: High
**Requirement**: System must allow users to add, edit, and remove line items within a price list.

**Details**:
- Add products from product catalog
- Enter multiple price types:
  - Base price (required)
  - Unit price (required)
  - Case price (optional)
  - Bulk price (optional)
- Define pricing tiers based on quantity:
  - Min/max quantity ranges
  - Tiered pricing
  - Volume discounts
- Specify commercial terms per item:
  - Minimum order quantity (MOQ)
  - Pack size
  - Lead time in days
  - Shipping cost (optional)
- Track price change metadata:
  - Previous price
  - Change percentage
  - Change reason

**Acceptance Criteria**:
- Users can add products from searchable catalog
- All price types support up to 4 decimal places
- Pricing tiers can be defined with quantity ranges
- MOQ and pack size validated against product specifications
- Price changes automatically calculate percentage difference

#### BR-PL-003: Price List Validation
**Priority**: High
**Requirement**: System must validate all price list data before activation.

**Details**:
- Validate required fields:
  - Vendor selection
  - At least one line item
  - Valid effective date range
  - All prices are positive numbers
  - Currency matches vendor's accepted currencies
- Check for duplicates:
  - Cannot have multiple active price lists for same vendor-product-location combination
- Effective date checks:
  - Start date cannot be in the past for new price lists
  - End date must be after start date
  - End date should be within 2 years of start date
- Business rule validation:
  - Price increases >10% require approval
  - Negative prices not allowed
  - Unit price consistency with tiered pricing

**Acceptance Criteria**:
- All validation rules enforced before activation
- Clear error messages displayed for validation failures
- Warning messages shown for price increases >10%
- Duplicate active price lists prevented by system

#### BR-PL-004: Price List Status Management
**Priority**: High
**Requirement**: System must manage price list lifecycle with defined statuses.

**Details**:
- Supported statuses:
  - **Draft**: Initial creation, editable
  - **Pending Approval**: Submitted for approval (if required)
  - **Active**: Current and in use
  - **Expired**: Past effective end date
  - **Superseded**: Replaced by newer price list
  - **Cancelled**: Manually cancelled before expiration
- Status transition rules:
  - Draft → Pending Approval (if approval required)
  - Draft → Active (if no approval required)
  - Pending Approval → Active (upon approval)
  - Pending Approval → Draft (if rejected)
  - Active → Expired (automatic on end date)
  - Active → Superseded (when new price list activated)
  - Draft/Pending Approval → Cancelled (manual cancellation)
- Automated status updates:
  - Daily job checks for expired price lists
  - System marks price lists as expired on effective end date
  - System marks previous price lists as superseded when new one activated

**Acceptance Criteria**:
- Status transitions follow defined workflow
- Expired price lists automatically updated daily
- Users cannot manually set status to Expired or Superseded
- Status history tracked with timestamps and user IDs

### 2.2 Price Comparison & Analysis

#### BR-PL-005: Multi-Vendor Price Comparison
**Priority**: High
**Requirement**: System must enable users to compare prices for same products across multiple vendors.

**Details**:
- Comparison features:
  - Search for product by name, SKU, or category
  - Display all active price lists containing the product
  - Show pricing from all vendors side-by-side
  - Highlight lowest price automatically
  - Include lead time and MOQ in comparison
  - Filter by location/department if applicable
- Comparison criteria:
  - Price per unit
  - Price per case/bulk
  - Total cost including shipping
  - Lead time
  - Historical price trends
- Comparison views:
  - Table view with sortable columns
  - Chart view showing price distribution
  - Historical trend view

**Acceptance Criteria**:
- Users can search for any product and see all vendor prices
- Lowest price is visually highlighted
- Comparison includes all relevant pricing tiers
- Users can filter comparison by location and department
- Comparison data can be exported to Excel

#### BR-PL-006: Price History Tracking
**Priority**: Medium
**Requirement**: System must maintain comprehensive price history for analysis and auditing.

**Details**:
- Track for each product-vendor combination:
  - All historical prices with effective dates
  - Price change dates and amounts
  - Percentage change from previous price
  - Reason for price change (if provided)
  - User who updated the price
- Historical data retention:
  - Retain price history for 5 years minimum
  - Archive older history but keep searchable
  - Maintain full audit trail
- Historical analysis features:
  - View price trends over time (charts)
  - Calculate average price over period
  - Identify price volatility
  - Compare price changes across vendors
  - Export historical data for analysis

**Acceptance Criteria**:
- All price changes recorded with complete metadata
- Users can view 5 years of price history
- Price trend charts display correctly
- Historical data exportable to Excel/CSV

#### BR-PL-007: Price Alerts & Notifications
**Priority**: Medium
**Requirement**: System must notify relevant users of significant price changes.

**Details**:
- Alert triggers:
  - Price increase >10%
  - Price decrease >15%
  - New price list added for frequently ordered products
  - Price list expiring within 30 days
  - Vendor price list approaching end of validity
- Alert configuration:
  - Users can set custom alert thresholds
  - Alerts can be configured per product category
  - Alerts can be set for specific vendors
  - Department-specific alerts
- Notification methods:
  - In-app notifications
  - Email notifications
  - Dashboard summary of recent alerts
- Alert management:
  - View all active alerts
  - Acknowledge or dismiss alerts
  - Alert history tracking

**Acceptance Criteria**:
- Alerts trigger based on configured thresholds
- Users receive notifications via selected methods
- Alert configuration accessible from settings
- Alert history retained for 90 days

### 2.3 Bulk Operations

#### BR-PL-008: Bulk Price Import
**Priority**: High
**Requirement**: System must support bulk import of pricing data from Excel/CSV files.

**Details**:
- Import capabilities:
  - Excel (.xlsx, .xls) and CSV formats supported
  - Template-based import for consistency
  - Map columns to system fields
  - Validate all data before import
  - Preview data before committing
  - Batch size up to 10,000 line items
- Import process:
  - Download import template
  - User fills template with price data
  - Upload completed template
  - System validates all rows
  - Display validation errors for correction
  - User confirms import
  - System creates/updates price lists
- Error handling:
  - Identify invalid rows with specific errors
  - Allow partial import (skip invalid rows)
  - Generate error report for download
  - Support resubmission of corrected data
- Import types:
  - New price list creation
  - Update existing price list
  - Add items to existing price list
  - Replace entire price list

**Acceptance Criteria**:
- Users can download standardized import template
- System validates all rows before import
- Clear error messages for each invalid row
- Users can review data before confirming import
- Import processes up to 10,000 items successfully
- Error report downloadable for review

#### BR-PL-009: Bulk Price Export
**Priority**: Medium
**Requirement**: System must support export of price list data to Excel/CSV formats.

**Details**:
- Export capabilities:
  - Single price list export
  - Multiple price list export
  - Filtered export (by vendor, product, date range)
  - Complete price history export
  - Comparison report export
- Export formats:
  - Excel (.xlsx) with formatting
  - CSV for data processing
  - PDF for documentation
- Export options:
  - Include/exclude specific columns
  - Apply filters before export
  - Include or exclude expired price lists
  - Include price history or current prices only
- Scheduled exports:
  - Weekly/monthly price list exports
  - Automated distribution via email
  - Save export configurations for reuse

**Acceptance Criteria**:
- Users can export price lists in multiple formats
- Export includes all selected data accurately
- Users can configure export columns and filters
- Scheduled exports run automatically at configured times
- Export files downloadable immediately

#### BR-PL-010: Bulk Price Updates
**Priority**: Medium
**Requirement**: System must support bulk updates to existing prices.

**Details**:
- Update capabilities:
  - Apply percentage increase/decrease across items
  - Update specific fields in bulk (e.g., lead time, MOQ)
  - Extend effective dates for multiple price lists
  - Update pricing tiers across products
- Update scope:
  - All items in a price list
  - Selected items in a price list
  - All price lists for a vendor
  - All price lists for a category
- Safeguards:
  - Preview changes before applying
  - Require approval for increases >10%
  - Maintain history of bulk updates
  - Allow rollback within 24 hours
- Update tracking:
  - Record bulk update operations
  - Track who initiated the update
  - Capture reason for bulk update
  - Log all affected items

**Acceptance Criteria**:
- Users can apply bulk updates to multiple items
- Preview shows all affected items before commit
- Approval required for increases >10%
- Bulk updates recorded in audit log
- Rollback available for 24 hours after update

### 2.4 Approval Workflows

#### BR-PL-011: Price Change Approval
**Priority**: High
**Requirement**: System must enforce approval workflows for significant price changes.

**Details**:
- Approval triggers:
  - New price list creation (optional, based on vendor tier)
  - Price increase >10% from previous price
  - Bulk price updates affecting >100 items
  - Contract price list changes
- Approval levels:
  - Procurement Manager: <10% increases, new standard price lists
  - Financial Manager: 10-20% increases, bulk updates
  - Executive: >20% increases, contract pricing
- Approval process:
  - System identifies changes requiring approval
  - Notification sent to approvers
  - Approvers review price list and justification
  - Approvers approve, reject, or request changes
  - System updates status based on decision
  - Notifications sent to submitter
- Approval tracking:
  - Record all approval stages
  - Capture approver comments
  - Track time to approval
  - Escalation after 3 business days

**Acceptance Criteria**:
- Price increases >10% automatically routed for approval
- Appropriate approver notified based on increase threshold
- Approvers can view price comparison and justification
- Approval history recorded with timestamps and comments
- Auto-escalation occurs if no response within 3 days

#### BR-PL-012: Approval Notifications
**Priority**: Medium
**Requirement**: System must notify relevant parties throughout approval process.

**Details**:
- Notification events:
  - Price list submitted for approval
  - Approval request assigned to user
  - Price list approved
  - Price list rejected
  - Approval request escalated
  - Approval request about to expire
- Notification recipients:
  - Submitter: all status changes
  - Approver: new requests and reminders
  - Department manager: all approvals in their department
  - Finance team: all price lists >$50K estimated annual value
- Notification channels:
  - In-app notifications
  - Email notifications
  - Dashboard alerts
- Notification content:
  - Price list summary
  - Key price changes
  - Justification provided
  - Link to review page
  - Approval deadline

**Acceptance Criteria**:
- All approval events trigger appropriate notifications
- Notifications contain relevant price list information
- Users can configure notification preferences
- Email notifications include direct link to approval page

### 2.5 Integration Requirements

#### BR-PL-013: Pricelist Template Integration
**Priority**: High
**Requirement**: System must automatically create price lists from approved template submissions.

**Details**:
- Automatic creation process:
  - When vendor submits pricing via template
  - Template submission data mapped to price list
  - Price list created with status "Pending Approval" (if required)
  - Source reference links to template distribution
  - All submitted prices and terms transferred
- Data mapping:
  - Product specifications from template → line items
  - Vendor pricing → price fields
  - Commercial terms → MOQ, lead time, pack size
  - Template effective dates → price list validity
  - Template notes → price list description
- Review and adjustment:
  - Users can review auto-created price list
  - Make adjustments before activation
  - Request clarification from vendor
  - Approve or reject price list

**Acceptance Criteria**:
- Template submissions automatically create price lists
- All template data accurately mapped to price list
- Source reference correctly links to template
- Users can review and adjust before activation
- Price lists inherit template approval requirements

#### BR-PL-014: RFQ Integration
**Priority**: High
**Requirement**: System must automatically create price lists from awarded RFQ bids.

**Details**:
- Automatic creation process:
  - When RFQ is awarded to vendor
  - Awarded bid data converted to price list
  - Price list created with status "Active" (pre-approved)
  - Source reference links to RFQ and bid
  - Contract reference if contract generated
- Data mapping:
  - RFQ line items → price list line items
  - Awarded bid pricing → price fields
  - Bid commercial terms → MOQ, lead time
  - Contract terms → price list terms
  - RFQ timeline → price list validity dates
- Price list configuration:
  - Effective from award date or specified start date
  - Effective until contract end date or 1 year
  - Automatically marked as "Contract Pricing"
  - Takes precedence over standard price lists
  - Linked to purchase orders from RFQ

**Acceptance Criteria**:
- RFQ awards automatically create price lists
- All awarded bid data accurately mapped
- Contract price lists take precedence over standard
- Source reference correctly links to RFQ and bid
- Users notified of new contract price list

#### BR-PL-015: Procurement Integration
**Priority**: High
**Requirement**: System must make price lists accessible to purchase request and purchase order modules.

**Details**:
- Purchase Request integration:
  - When creating PR, system suggests vendors with active price lists
  - Display current price for requested products
  - Show multiple vendor options if available
  - Include lead time and MOQ information
  - Calculate estimated costs automatically
- Purchase Order integration:
  - When creating PO, retrieve applicable price list
  - Auto-populate line item prices from price list
  - Apply contract pricing if available
  - Validate prices against current price lists
  - Alert if price differs from price list
- Price list selection logic:
  - Contract price lists take priority
  - Location-specific price lists over general
  - Most recent effective price list
  - Consider vendor performance ratings
  - Apply tiered pricing based on quantity

**Acceptance Criteria**:
- PRs show current prices from active price lists
- POs auto-populate prices from applicable price list
- Contract pricing takes precedence over standard
- Users alerted if PO price differs from price list
- Price list selection follows defined priority logic

#### BR-PL-016: Product Catalog Integration
**Priority**: High
**Requirement**: System must integrate with product catalog for product information.

**Details**:
- Product lookup:
  - Search products by name, SKU, category
  - Display product specifications
  - Show current vendors supplying the product
  - Display price history for the product
- Product synchronization:
  - Product changes reflect in price lists
  - Discontinued products flagged in price lists
  - New products available for price list assignment
  - Product category changes update price list categorization
- Product-level reporting:
  - All vendors supplying a product
  - Price comparison across vendors
  - Preferred vendor for each product
  - Products without active pricing

**Acceptance Criteria**:
- Products searchable from price list creation
- Product specifications automatically populated
- Product catalog changes sync to price lists
- Users can view all price lists for a product

### 2.6 Reporting & Analytics

#### BR-PL-017: Price List Reports
**Priority**: Medium
**Requirement**: System must provide comprehensive reporting on price lists and pricing trends.

**Details**:
- Standard reports:
  - Active Price Lists by Vendor
  - Price Comparison Report (multi-vendor)
  - Price Change Report (trends over time)
  - Expiring Price Lists (next 30/60/90 days)
  - Price Lists Pending Approval
  - Price Variance Report (PO prices vs. price list)
  - Vendor Price Performance Report
  - Cost Savings Analysis Report
- Report features:
  - Parameterized filters (date range, vendor, product, location)
  - Scheduled report generation
  - Export to Excel, PDF, CSV
  - Email distribution
  - Dashboard visualization
- Analytics:
  - Price trend analysis with charts
  - Average price by category over time
  - Price volatility metrics
  - Vendor price competitiveness scoring
  - Cost savings vs. previous period

**Acceptance Criteria**:
- All standard reports available to authorized users
- Reports can be filtered and customized
- Reports exportable in multiple formats
- Scheduled reports run and distribute automatically
- Charts and visualizations render correctly

#### BR-PL-018: Price List Dashboard
**Priority**: Medium
**Requirement**: System must provide a dashboard with key price list metrics and insights.

**Details**:
- Dashboard widgets:
  - Total active price lists
  - Price lists expiring soon (30 days)
  - Pending approval count
  - Recent price changes summary
  - Average price change percentage (this month)
  - Top price increases/decreases
  - Products without pricing
  - Vendor coverage (% products with pricing)
- Interactive elements:
  - Click widgets to view details
  - Filter dashboard by location/department
  - Date range selector
  - Refresh data button
- Personalization:
  - Users can configure widget display
  - Save custom dashboard layouts
  - Set default filters
  - Pin important widgets

**Acceptance Criteria**:
- Dashboard displays all key metrics accurately
- Widgets clickable to view detailed data
- Dashboard refreshes with latest data
- Users can customize dashboard layout
- Dashboard loads within 2 seconds

### 2.7 Data Management

#### BR-PL-019: Price List Archival
**Priority**: Medium
**Requirement**: System must archive expired and superseded price lists while maintaining accessibility.

**Details**:
- Archival criteria:
  - Price lists expired >1 year
  - Superseded price lists >1 year old
  - Cancelled price lists >1 year old
  - Vendor-specific archival rules
- Archival process:
  - Automated monthly archival job
  - Move qualifying price lists to archive
  - Maintain searchability in archive
  - Preserve all historical data
  - Link archived price lists to active history
- Archive access:
  - Users can search archived price lists
  - View-only access to archived data
  - Export archived data if needed
  - Restore from archive if necessary
- Retention policy:
  - Archived price lists retained for 5 years
  - After 5 years, move to cold storage
  - Legal hold prevents deletion if needed
  - Audit trail maintained permanently

**Acceptance Criteria**:
- Automated archival runs monthly
- Archived price lists remain searchable
- Users can view archived data
- Archived data exportable for analysis
- Retention policy enforced automatically

#### BR-PL-020: Data Quality Management
**Priority**: Medium
**Requirement**: System must maintain high data quality through validation and monitoring.

**Details**:
- Data quality checks:
  - Duplicate price list detection
  - Orphaned line items (product no longer exists)
  - Price anomalies (extreme changes, outliers)
  - Missing required fields
  - Invalid effective date ranges
  - Inconsistent pricing tiers
- Automated monitoring:
  - Daily data quality scans
  - Alert administrators of issues
  - Generate data quality reports
  - Track data quality metrics over time
- Data cleanup:
  - Bulk data correction tools
  - Merge duplicate entries
  - Remove orphaned records
  - Standardize data formats
  - Update invalid dates
- Data quality dashboard:
  - Overall quality score
  - Issue breakdown by type
  - Trends over time
  - Top issues requiring attention

**Acceptance Criteria**:
- Daily data quality scans identify issues
- Administrators receive quality alerts
- Data quality dashboard shows current status
- Data cleanup tools available to authorized users
- Quality metrics tracked over time

---

## 3. Business Rules

### 3.1 Price List Rules

#### BR-PL-001: Minimum Line Items
**Rule**: Every price list must contain at least one line item before it can be activated.

**Rationale**: An empty price list provides no value and could cause errors in procurement processes.

**Enforcement**: System validation prevents activation of price lists with zero items.

#### BR-PL-002: Effective Date Validation
**Rule**: For new price lists, the effective start date cannot be in the past.

**Rationale**: Backdating prices can create inconsistencies with historical purchase orders and cause audit issues.

**Enforcement**: System validation rejects effective dates before current date for new price lists. Existing price lists can have past dates during updates.

**Exception**: Administrators can override this rule with justification for data correction purposes.

#### BR-PL-003: Price Change Approval Threshold
**Rule**: Price increases greater than 10% from the previous price require approval before activation.

**Rationale**: Significant price increases impact budgets and should be reviewed for justification and alternatives.

**Enforcement**: System automatically routes price lists with >10% increases to approval workflow.

**Approval Levels**:
- 10-20% increase: Procurement Manager approval
- 20-30% increase: Financial Manager approval
- >30% increase: Executive approval

#### BR-PL-004: Active Price List Uniqueness
**Rule**: Only one active price list can exist for a specific vendor-product-location combination at any time.

**Rationale**: Multiple active price lists for the same combination create ambiguity in procurement pricing.

**Enforcement**: System prevents activation of price lists that would create conflicts. When a new price list is activated, the previous one is automatically marked as "Superseded".

**Exception**: Different locations can have different active price lists for the same vendor-product combination.

#### BR-PL-005: Automatic Expiration
**Rule**: Price lists automatically transition to "Expired" status when their effective end date is reached.

**Rationale**: Ensures pricing data remains current and prevents use of outdated prices.

**Enforcement**: Daily automated job checks all active price lists and expires those past their end date.

**Notification**: Users are notified 30 days, 14 days, and 7 days before price list expiration.

#### BR-PL-006: Price History Retention
**Rule**: Price history must be retained for a minimum of 5 years.

**Rationale**: Historical pricing data is essential for audits, trend analysis, and contract negotiations.

**Enforcement**: System prevents deletion of price history. Archived price lists remain accessible for 5 years before cold storage.

**Compliance**: Meets financial record-keeping requirements for most jurisdictions.

#### BR-PL-007: Contract Price Precedence
**Rule**: Price lists linked to contracts take precedence over standard price lists.

**Rationale**: Contract terms must be honored, and contract prices override general pricing.

**Enforcement**: When creating purchase orders, system first checks for contract pricing before using standard price lists.

**Identification**: Contract price lists are flagged with sourceType = 'contract' and linked to contract records.

### 3.2 Pricing Rules

#### BR-PL-008: Positive Pricing
**Rule**: All prices must be positive numbers greater than zero.

**Rationale**: Negative or zero prices are invalid and indicate data errors.

**Enforcement**: System validation rejects negative or zero prices during entry and import.

**Exception**: Promotional pricing or rebates are handled separately, not as negative prices.

#### BR-PL-009: Price Precision
**Rule**: All prices must have a maximum of 4 decimal places.

**Rationale**: Excessive decimal precision is unnecessary for business purposes and can cause rounding issues.

**Enforcement**: System automatically rounds prices to 4 decimal places during entry and import.

**Currency Exception**: Currencies like Japanese Yen (no decimal places) follow their standard conventions.

#### BR-PL-010: Tiered Pricing Consistency
**Rule**: Tiered pricing must show decreasing price per unit as quantity increases.

**Rationale**: Volume discounts should incentivize larger purchases with lower unit costs.

**Enforcement**: System validates that each tier's unit price is less than or equal to the previous tier's price.

**Warning**: System issues a warning (not blocking) if tiers don't follow standard discount patterns.

#### BR-PL-011: Currency Consistency
**Rule**: All line items within a price list must use the same currency.

**Rationale**: Mixed currencies within a price list complicate cost calculations and comparisons.

**Enforcement**: Price list has a single currency field; all items inherit this currency.

**Exception**: Multi-currency price lists require separate price list records per currency.

### 3.3 Source Integration Rules

#### BR-PL-012: Template Source Traceability
**Rule**: Price lists created from pricelist templates must maintain a link to the source template and submission.

**Rationale**: Enables traceability for audits and allows users to reference original submissions.

**Enforcement**: System automatically populates sourceType, sourceId, and sourceReference fields during template-based creation.

**Data Retention**: Template submission data is retained even after price list is created.

#### BR-PL-013: RFQ Source Traceability
**Rule**: Price lists created from RFQ awards must link to the RFQ, bid, and contract (if applicable).

**Rationale**: Maintains complete audit trail from RFQ through award to pricing.

**Enforcement**: System automatically creates source references during RFQ award process.

**Contract Linking**: If a contract is generated from the RFQ, the price list is also linked to the contract.

#### BR-PL-014: Source Data Immutability
**Rule**: Price lists created from external sources (templates, RFQs) cannot have their source reference changed.

**Rationale**: Source traceability is critical for audits and must not be altered.

**Enforcement**: sourceType, sourceId, and sourceReference fields are read-only after initial creation.

**Exception**: Administrators can correct source references with justification and audit logging.

### 3.4 Approval Workflow Rules

#### BR-PL-015: Approval Routing
**Rule**: Price lists requiring approval must be routed to appropriate approvers based on price change magnitude.

**Rationale**: Different levels of authority needed for different levels of financial impact.

**Enforcement**: System automatically determines required approval level and routes accordingly.

**Routing Logic**:
- <10% increase: No approval required (auto-activate)
- 10-20% increase: Procurement Manager
- 20-30% increase: Financial Manager
- >30% increase: Executive

#### BR-PL-016: Approval Timeout
**Rule**: Approval requests that receive no response within 5 business days are automatically escalated to the next approval level.

**Rationale**: Prevents price lists from being stuck in approval indefinitely.

**Enforcement**: Automated job runs daily to check for approval timeouts and escalates as needed.

**Notification**: Escalation notifications sent to both original approver and escalated approver.

#### BR-PL-017: Rejection Handling
**Rule**: Rejected price lists return to draft status and require resubmission after corrections.

**Rationale**: Ensures issues are addressed before resubmission.

**Enforcement**: System changes status to "Draft" and notifies submitter with rejection reasons.

**Resubmission**: Submitter must make changes and resubmit through normal approval workflow.

### 3.5 Location & Department Rules

#### BR-PL-018: Location-Specific Pricing
**Rule**: Price lists can be targeted to specific locations; location-specific pricing takes precedence over general pricing.

**Rationale**: Allows for regional pricing variations due to shipping costs, local market conditions, or contracts.

**Enforcement**: When retrieving prices, system first checks for location-specific price lists before falling back to general price lists.

**Priority Order**:
1. Contract price list for specific location
2. Standard price list for specific location
3. Contract price list (general)
4. Standard price list (general)

#### BR-PL-019: Department-Specific Pricing
**Rule**: Price lists can be targeted to specific departments; department-specific pricing takes precedence over general pricing.

**Rationale**: Different departments may have negotiated different pricing or require specific vendor relationships.

**Enforcement**: Price list targeting is checked during price retrieval; department-specific prices override general prices.

**Use Case**: Food & Beverage department may have different pricing than Housekeeping for same products.

### 3.6 Data Quality Rules

#### BR-PL-020: Duplicate Prevention
**Rule**: System must prevent creation of duplicate price lists (same vendor, same effective dates, same products).

**Rationale**: Duplicate price lists create confusion and data inconsistencies.

**Enforcement**: Before activation, system checks for existing price lists with matching vendor, date range, and location/department.

**Resolution**: System prompts user to either update existing price list or adjust new price list parameters.

#### BR-PL-021: Orphaned Product Handling
**Rule**: If a product is discontinued in the product catalog, its entries in active price lists must be flagged but not deleted.

**Rationale**: Historical data must be preserved; active price lists may still be valid for remaining inventory.

**Enforcement**: Product catalog changes trigger flagging in price lists; users are notified to review and update.

**Action**: Users can choose to remove item from price list or leave it flagged until price list expires.

---

## 4. Use Cases

### 4.1 Primary Use Cases

#### UC-PL-001: Create Price List
**Actors**: Procurement Staff, Purchasing Manager
**Description**: User manually creates a new price list for a vendor.

**Preconditions**:
- User has permission to create price lists
- Vendor exists in vendor directory
- Product catalog is accessible

**Main Flow**:
1. User navigates to Price Lists module
2. User clicks "Create New Price List"
3. System displays price list creation form
4. User enters basic information (vendor, name, description)
5. User sets effective date range
6. User adds products from catalog to price list
7. For each product, user enters pricing and terms
8. User can add pricing tiers if applicable
9. User saves price list as draft
10. User submits for approval (if required)
11. System validates data
12. System creates price list and assigns unique number
13. System sends notification to approvers (if applicable)

**Alternative Flows**:
- 11a. Validation fails: System displays errors, user corrects and resubmits
- 10a. No approval required: Price list activated immediately

**Postconditions**:
- Price list created with unique identifier
- Price list has status "Draft" or "Pending Approval"
- Audit log records creation

#### UC-PL-002: Import Vendor Prices
**Actors**: Procurement Staff, Purchasing Manager
**Description**: User imports pricing data from an Excel/CSV file.

**Preconditions**:
- User has permission to import prices
- Import template is available
- Vendor exists in system

**Main Flow**:
1. User navigates to Price Lists module
2. User clicks "Import Prices"
3. System provides import template for download
4. User downloads template
5. User fills template with vendor pricing data
6. User uploads completed template
7. System validates all rows
8. System displays preview of data to be imported
9. User reviews preview and confirms import
10. System creates price list from imported data
11. System displays import summary (success/errors)
12. If errors, system provides error report for download

**Alternative Flows**:
- 7a. Validation errors: System displays errors, user can download error report, correct data, and re-upload
- 9a. User cancels: Import cancelled, no data saved

**Postconditions**:
- Price list created from imported data
- Import log recorded with success/failure details
- Error report available if applicable

#### UC-PL-003: Update Existing Prices
**Actors**: Procurement Staff, Purchasing Manager, Vendor (via portal)
**Description**: User updates prices in an existing price list.

**Preconditions**:
- Price list exists and is not expired
- User has permission to update prices

**Main Flow**:
1. User searches for and opens price list
2. System displays price list details
3. User edits prices for one or more line items
4. User provides reason for price change (if >10% increase)
5. User saves changes
6. System validates changes
7. If price increase >10%, system routes for approval
8. System updates price list
9. System records price change history
10. System notifies relevant stakeholders

**Alternative Flows**:
- 6a. Validation fails: System displays errors, user corrects
- 7a. Approval required: Price list status changes to "Pending Approval"
- 7b. No approval required: Changes applied immediately

**Postconditions**:
- Price list updated with new prices
- Price change history recorded
- If applicable, approval workflow initiated

#### UC-PL-004: Compare Prices Across Vendors
**Actors**: Procurement Staff, Purchasing Manager, Department Manager
**Description**: User compares prices for a product across multiple vendors.

**Preconditions**:
- Multiple vendors have active price lists
- Product exists in multiple price lists

**Main Flow**:
1. User searches for product by name or SKU
2. System displays all vendors with pricing for the product
3. System shows side-by-side comparison table
4. System highlights lowest price
5. User can filter by location/department
6. User can sort by price, lead time, or MOQ
7. User can view detailed pricing tiers
8. User can view price history for each vendor
9. User can export comparison data

**Alternative Flows**:
- 2a. No active price lists found: System displays message, suggests requesting quotes

**Postconditions**:
- Price comparison displayed
- User has data to make informed purchasing decision

#### UC-PL-005: View Price History
**Actors**: Procurement Staff, Purchasing Manager, Financial Manager
**Description**: User views historical pricing data for a product.

**Preconditions**:
- Price history exists for product

**Main Flow**:
1. User searches for product
2. User clicks "View Price History"
3. System displays historical prices with dates
4. System shows price changes over time in chart format
5. User can filter history by vendor
6. User can filter by date range
7. User can view percentage changes
8. User can export history data

**Postconditions**:
- Price history displayed
- User can analyze trends

#### UC-PL-006: Set Price Alerts
**Actors**: Procurement Staff, Purchasing Manager, Department Manager
**Description**: User configures alerts for price changes.

**Preconditions**:
- User has permission to configure alerts

**Main Flow**:
1. User navigates to Alert Settings
2. User clicks "Create Price Alert"
3. User selects alert type (increase/decrease threshold)
4. User sets threshold percentage
5. User selects scope (vendor, product, category)
6. User chooses notification method (email, in-app)
7. User saves alert configuration
8. System activates alert monitoring

**Postconditions**:
- Alert configured and active
- User will receive notifications when conditions met

#### UC-PL-007: Export Price Lists
**Actors**: Procurement Staff, Purchasing Manager, Financial Manager
**Description**: User exports price list data for analysis or reporting.

**Preconditions**:
- Price lists exist in system

**Main Flow**:
1. User applies filters (vendor, date range, status)
2. User clicks "Export"
3. User selects export format (Excel, CSV, PDF)
4. User selects columns to include
5. User confirms export
6. System generates export file
7. System provides download link
8. User downloads file

**Postconditions**:
- Export file generated
- User has offline copy of price data

#### UC-PL-008: Approve Price Changes
**Actors**: Procurement Manager, Financial Manager, Executive
**Description**: Approver reviews and approves/rejects price list changes.

**Preconditions**:
- Price list pending approval
- User has appropriate approval authority

**Main Flow**:
1. User receives notification of pending approval
2. User navigates to approval queue
3. User opens price list for review
4. System displays price changes with comparison to previous prices
5. User reviews pricing, justification, and impact
6. User can request additional information or clarification
7. User makes approval decision (approve/reject)
8. User enters approval comments
9. System updates price list status based on decision
10. System notifies submitter of decision

**Alternative Flows**:
- 6a. Additional info needed: System sends clarification request to submitter
- 7a. Rejected: Price list returns to draft, submitter notified with reasons
- 7b. Approved: Price list activated, submitter notified

**Postconditions**:
- Price list approved or rejected
- Status updated accordingly
- Approval history recorded

### 4.2 Integration Use Cases

#### UC-PL-009: Auto-Create from Template Submission
**Actors**: System (automated), Procurement Staff (review)
**Description**: System automatically creates price list when vendor submits template pricing.

**Preconditions**:
- Pricelist template distributed to vendor
- Vendor submits completed template

**Main Flow**:
1. Vendor submits pricing via template
2. System receives submission
3. System validates submission data
4. System creates new price list from submission
5. System maps template data to price list fields
6. System sets source reference to template
7. System assigns appropriate status (Draft or Pending Approval)
8. System notifies procurement staff of new price list
9. Staff reviews auto-created price list
10. Staff activates or requests changes

**Postconditions**:
- Price list created from template
- Source traceability maintained
- Price list ready for use or requiring review

#### UC-PL-010: Auto-Create from RFQ Award
**Actors**: System (automated)
**Description**: System automatically creates price list when RFQ is awarded.

**Preconditions**:
- RFQ completed and awarded to vendor

**Main Flow**:
1. RFQ awarded to vendor
2. System extracts awarded bid pricing
3. System creates new price list
4. System maps bid data to price list fields
5. System marks as contract pricing
6. System sets effective dates from contract
7. System sets source reference to RFQ and bid
8. System activates price list immediately
9. System notifies procurement and vendor

**Postconditions**:
- Contract price list created and active
- Source traceability maintained
- Price list takes precedence over standard pricing

---

## 5. Integration Requirements

### 5.1 Internal Integrations

#### Vendor Directory
- Retrieve vendor information for price list creation
- Validate vendor status before allowing price list creation
- Link price lists to vendor records
- Update vendor performance metrics based on pricing

#### Product Management
- Retrieve product catalog for price list line items
- Sync product changes to price lists
- Flag discontinued products in price lists
- Link products to vendor pricing

#### Pricelist Templates
- Auto-create price lists from template submissions
- Maintain traceability to source template
- Inherit template structure and requirements
- Map template fields to price list fields

#### RFQ Module
- Auto-create price lists from awarded bids
- Mark as contract pricing
- Link to RFQ, bid, and contract
- Set effective dates from contract terms

#### Purchase Requests
- Provide pricing for requested products
- Suggest vendors based on price lists
- Calculate estimated costs
- Display lead times and MOQs

#### Purchase Orders
- Auto-populate PO line item prices
- Apply contract pricing when available
- Validate PO prices against price lists
- Alert on price variances

#### Contracts
- Store contract pricing as price lists
- Enforce contract price precedence
- Link to contract records
- Sync contract terms

### 5.2 External Integrations

#### Email Service
- Send approval notifications
- Send price alert notifications
- Send scheduled reports
- Send price list expiration reminders

#### File Storage
- Store import templates
- Store uploaded price files
- Store export files
- Store supporting documentation

#### Reporting Service
- Generate scheduled reports
- Export to Excel/CSV/PDF
- Distribute reports via email
- Store report history

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Price list search results return within 2 seconds
- Price comparison for up to 10 vendors completes within 3 seconds
- Bulk import of up to 10,000 items completes within 5 minutes
- Dashboard loads within 2 seconds
- Price history chart renders within 2 seconds

### 6.2 Scalability
- Support up to 10,000 active price lists
- Support up to 100,000 line items across all price lists
- Support up to 5,000 concurrent users
- Support 5 years of price history (millions of records)
- Handle bulk operations on 10,000+ items

### 6.3 Usability
- Intuitive search and filtering
- Responsive design for mobile access
- Clear error messages and validation feedback
- Keyboard shortcuts for common operations
- Accessible to users with disabilities (WCAG 2.1 AA)

### 6.4 Security
- Role-based access control
- Audit logging of all price changes
- Encryption of sensitive pricing data
- Secure file upload/download
- Protection against price manipulation

### 6.5 Reliability
- 99.9% uptime during business hours
- Automated backup of price data
- Disaster recovery plan
- Data redundancy
- Graceful error handling

### 6.6 Maintainability
- Modular code architecture
- Comprehensive documentation
- Automated testing (80% code coverage)
- Version control
- Rollback capability

---

## 7. Assumptions and Dependencies

### 7.1 Assumptions
- Vendor directory is operational and contains approved vendors
- Product catalog is complete and up-to-date
- Users have appropriate training on price list management
- Network connectivity is reliable
- Email service is operational for notifications

### 7.2 Dependencies
- **Vendor Directory Module**: Must be implemented first
- **Product Management Module**: Must be operational
- **User Management**: For role-based access control
- **Notification Service**: For alerts and notifications
- **File Storage Service**: For imports/exports
- **Reporting Infrastructure**: For analytics and reports

---

## 8. Success Criteria

### 8.1 Functional Success
- All 20 business requirements fully implemented
- All 10 primary use cases functioning correctly
- All integrations operational
- All business rules enforced

### 8.2 Performance Success
- All performance targets met
- No critical bugs in production
- System stable under load testing
- User acceptance testing passed

### 8.3 Business Success
- 30% reduction in time spent researching prices
- 20% improvement in vendor price visibility
- 15% cost savings through better price comparison
- 95% user satisfaction rating
- 90% adoption rate within first 3 months

---

## 9. Future Enhancements

### 9.1 Phase 2 Features
- AI-powered price prediction
- Automated price optimization recommendations
- Advanced analytics and forecasting
- Mobile app for price lookup
- Vendor self-service price updates

### 9.2 Phase 3 Features
- Multi-currency support with auto-conversion
- Integration with external price indices
- Blockchain-based price verification
- Real-time price synchronization with vendors
- Automated price negotiation suggestions

---

## 10. Appendix

### 10.1 Glossary
- **Price List**: A collection of product prices from a single vendor for a specific time period
- **Line Item**: A single product entry within a price list
- **Effective Date**: The date from which a price list is valid
- **Contract Pricing**: Pricing established through a contract, takes precedence over standard pricing
- **Price Tier**: Different prices based on quantity ranges
- **MOQ**: Minimum Order Quantity required for a price
- **Lead Time**: Number of days from order to delivery

### 10.2 References
- Vendor Management Overview Document
- Product Management Specifications
- Procurement Process Guidelines
- Financial Policies and Procedures
- Data Retention Policies
