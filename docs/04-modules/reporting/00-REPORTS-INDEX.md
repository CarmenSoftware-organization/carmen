# Blue Ledger Reports - Index

This directory contains Product Requirement Documents (PRD) and Template specifications for all 35 Blue Ledger reports, organized by module and report type.

## Directory Structure

Each report has its own subdirectory containing:
- **PRD.md** - Product Requirements Document
- **TEMPLATE.md** - Template structure and layout specifications

## Report Categories

### Purchase Request (PR) Reports
- **01-pr-001-purchase-request-list** - Summary list of all PRs
- **02-pr-002-purchase-request-detail** - Detailed PR line items
- **03-pr-003-price-list-by-product** - Vendor price comparison

### Purchase Order (PO) Reports
- **04-po-001-order-pending** - Pending orders (merged with PO-002)
- **05-po-002-purchase-order-detail** - Detailed PO with fulfillment tracking
- **06-po-003-purchase-order-list** - Summary list of all POs

### Receiving (RC) Reports
- **07-rc-001-receiving-list** - Summary of goods received
- **08-rc-002-receiving-detail** - Detailed receiving transactions
- **09-rc-003-top-purchasing** - Top purchased items ranking
- **10-rc-004-purchase-analysis-by-item** - Purchase pattern analysis

### Credit Note (CN) Reports
- **11-cn-001-credit-note-list** - Summary of credit notes
- **12-cn-002-credit-note-detail** - Detailed credit note information

### Vendor (VD) Reports
- **13-vd-001-vendor-list** - Master vendor list
- **14-vd-002-vendor-detailed** - Vendor profile with transaction history

### Product (PD) Reports
- **15-pd-001-product-list** - Master product catalog
- **16-pd-002-product-category** - Product categories and hierarchy

### Store Requisition (SR) Reports
- **17-sr-001-store-requisition-detail** - Internal transfer details
- **18-sr-002-store-requisition-summary** - Requisition summary view
- **19-sr-003-store-requisition-list** - List of all requisitions
- **20-sr-004-issue-detail** - Inventory issue details

### Stock Movement Reports
- **21-si-001-stock-in-detail** - All stock receipt transactions
- **22-so-001-stock-out-detail** - All stock issuance transactions

### Period Closing Reports
- **23-cl-001-eop-adjustment** - End-of-period adjustments

### Inventory (INV) Reports
- **24-inv-001-inventory-balance** - Current inventory balances
- **25-inv-002-inventory-movement-detail** - Detailed movement by product
- **26-inv-003-inventory-movement-summary** - Movement summary by location
- **27-inv-004-slow-moving** - Slow-moving inventory analysis
- **28-inv-008-stock-card-detailed** - Detailed stock card transactions
- **29-inv-009-stock-card-summary** - Stock card summary
- **30-inv-010-deviation-by-item** - Variance analysis
- **31-inv-011-inventory-aging** - Inventory aging analysis
- **32-inv-012-expired-items** - Expiry tracking and alerts

### Recipe Management (RM) Reports
- **33-rm-001-recipe-list** - Master recipe list
- **34-rm-002-recipe-card** - Detailed recipe specifications
- **35-rm-003-material-consumption** - Material usage vs standards

## Implementation Priority

### Phase 1 - Critical (Immediate)
1. PR-002: Purchase Request Detail
2. PO-002: Purchase Order Detail
3. RC-002: Receiving Detail
4. INV-001: Inventory Balance
5. INV-008: Stock Card Detailed

### Phase 2 - High Priority
6. RC-004: Purchase Analysis by Item
7. RC-003: Top Purchasing
8. CN-002: Credit Note Detail
9. VD-002: Vendor Detailed
10. PD-001: Product List
11. INV-002: Inventory Movement Detail
12. INV-004: Slow Moving
13. INV-012: Expired Items

### Phase 3 - Medium Priority
14. SR-001: Store Requisition Detail
15. SR-004: Issue Detail
16. SI-001: Stock In Detail
17. SO-001: Stock Out Detail
18. INV-011: Inventory Aging
19. RM-002: Recipe Card
20. RM-003: Material Consumption

### Phase 4 - Standard Implementation
21-35. All remaining list reports, summaries, and analysis reports

## Source Documents

The content in these directories was extracted and refactored from:
- **docs/reports/bl_reports_msd.md** - Master Specification Document (MSD)
- **docs/reports/bl_reports_prd_templates.md** - PRD and Template Structures

## Report Development Status

### Detailed PRD Available (Ready for Implementation)
Reports with comprehensive PRD and template specifications:
- PR-001, PR-002, PR-003
- PO-002
- (These reports have full filter parameters, data columns, business rules, UI/UX requirements)

### Basic PRD (Requires Elaboration)
Reports with specifications from MSD requiring detailed PRD development:
- Most other reports (6-35)
- These have basic structure but need:
  - Complete filter parameters
  - Detailed data column specifications
  - Comprehensive business rules
  - UI/UX requirements
  - Performance requirements

## Usage

1. **For Developers**: Review both PRD.md and TEMPLATE.md in each report directory
2. **For Designers**: Focus on TEMPLATE.md for layout and visual specifications
3. **For Business Analysts**: Review PRD.md for functional requirements and business rules
4. **For Project Managers**: Use implementation priority for planning

## Next Steps

For reports marked as "Specification from MSD":
1. Review MSD specifications in docs/reports/bl_reports_msd.md
2. Gather detailed business requirements from stakeholders
3. Create comprehensive PRD following the pattern in PR-001, PR-002
4. Design detailed template structure
5. Develop implementation plan

## Report Module Codes

- **PR** - Purchase Request
- **PO** - Purchase Order
- **RC** - Receiving
- **CN** - Credit Note
- **VD** - Vendor
- **PD** - Product
- **SR** - Store Requisition
- **SI** - Stock In
- **SO** - Stock Out
- **CL** - Closing
- **INV** - Inventory
- **RM** - Recipe Management

---

**Document Created:** 2025-10-21
**Total Reports:** 35
**Status:** Initial organization complete
