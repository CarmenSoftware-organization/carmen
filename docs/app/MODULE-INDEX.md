# Module Index - Complete Documentation Catalog

**Comprehensive index of all 247 documentation files** organized by module and document type.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## 📊 Documentation Overview

**Total Files**: 247 documentation files

**By Document Type**:
- **DD** (Data Definition): 40 files
- **BR** (Business Requirements): 38 files
- **TS** (Technical Specification): 36 files
- **UC** (Use Cases): 38 files
- **FD** (Flow Diagrams): 38 files
- **VAL** (Validations): 38 files
- **PC** (Page Content): 9 files
- **SM** (Shared Methods): 8 files
- **PROCESS** (Process Documentation): 2 files

**By Module**:
- Finance Management: 20 documents
- Inventory Management: 30 documents
- Procurement Management: 18 documents
- Vendor Management: 30 documents
- Product Management: 12 documents
- Store Operations: 18 documents
- Operational Planning: 24 documents
- System Administration: 6 documents

---

## 🔍 Quick Navigation

**By Module**:
- [Finance Management](#finance-management)
- [Inventory Management](#inventory-management)
- [Procurement Management](#procurement-management)
- [Vendor Management](#vendor-management)
- [Product Management](#product-management)
- [Store Operations](#store-operations)
- [Operational Planning](#operational-planning)
- [System Administration](#system-administration)

**By Document Type**:
- [All Data Definitions (DD)](#all-data-definitions-dd)
- [All Business Requirements (BR)](#all-business-requirements-br)
- [All Technical Specifications (TS)](#all-technical-specifications-ts)
- [All Use Cases (UC)](#all-use-cases-uc)
- [All Flow Diagrams (FD)](#all-flow-diagrams-fd)
- [All Validations (VAL)](#all-validations-val)

**Other**:
- [Shared Methods (SM)](#shared-methods)
- [Template Guide](#template-guide)

---

## 💰 Finance Management

**Purpose**: Multi-currency accounting, exchange rates, departmental cost tracking

**Total Documents**: 20 | **Database Tables**: 8 | **Schema Coverage**: 100%

### Account Code Mapping

Maps internal account codes to General Ledger accounts for financial integration.

- **[DD-account-code-mapping.md](finance/account-code-mapping/DD-account-code-mapping.md)** - Data model: tb_account_code_mapping
- **[BR-account-code-mapping.md](finance/account-code-mapping/BR-account-code-mapping.md)** - Business requirements for GL mapping
- **[TS-account-code-mapping.md](finance/account-code-mapping/TS-account-code-mapping.md)** - Technical implementation
- **[UC-account-code-mapping.md](finance/account-code-mapping/UC-account-code-mapping.md)** - User workflows
- **[FD-account-code-mapping.md](finance/account-code-mapping/FD-account-code-mapping.md)** - Process flows
- **[VAL-account-code-mapping.md](finance/account-code-mapping/VAL-account-code-mapping.md)** - Validation rules

### Currency Management

Supports multiple currencies with conversion and tracking.

- **[DD-currency-management.md](finance/currency-management/DD-currency-management.md)** - Data model: tb_currency
- **[BR-currency-management.md](finance/currency-management/BR-currency-management.md)** - Multi-currency requirements
- **[TS-currency-management.md](finance/currency-management/TS-currency-management.md)** - Currency handling logic
- **[UC-currency-management.md](finance/currency-management/UC-currency-management.md)** - Currency workflows
- **[FD-currency-management.md](finance/currency-management/FD-currency-management.md)** - Currency flow diagrams
- **[VAL-currency-management.md](finance/currency-management/VAL-currency-management.md)** - Currency validation

### Department Management

Hierarchical department structure for cost allocation.

- **[DD-department-management.md](finance/department-management/DD-department-management.md)** - Data model: tb_department
- **[BR-department-management.md](finance/department-management/BR-department-management.md)** - Department requirements
- **[TS-department-management.md](finance/department-management/TS-department-management.md)** - Department implementation
- **[UC-department-management.md](finance/department-management/UC-department-management.md)** - Department workflows
- **[FD-department-management.md](finance/department-management/FD-department-management.md)** - Department flows
- **[VAL-department-management.md](finance/department-management/VAL-department-management.md)** - Department validation

### Exchange Rate Management

Real-time and manual exchange rate management for currency conversion.

- **[DD-exchange-rate-management.md](finance/exchange-rate-management/DD-exchange-rate-management.md)** - Data model: tb_exchange_rate
- **[BR-exchange-rate-management.md](finance/exchange-rate-management/BR-exchange-rate-management.md)** - Exchange rate requirements
- **[TS-exchange-rate-management.md](finance/exchange-rate-management/TS-exchange-rate-management.md)** - Rate calculation logic
- **[UC-exchange-rate-management.md](finance/exchange-rate-management/UC-exchange-rate-management.md)** - Rate management workflows
- **[FD-exchange-rate-management.md](finance/exchange-rate-management/FD-exchange-rate-management.md)** - Rate conversion flows
- **[VAL-exchange-rate-management.md](finance/exchange-rate-management/VAL-exchange-rate-management.md)** - Rate validation rules

---

## 📦 Inventory Management

**Purpose**: Stock tracking, lot-based costing, fractional inventory, adjustments

**Total Documents**: 30 | **Database Tables**: 12 existing, 3 missing | **Schema Coverage**: 80%

### Inventory Overview

Core inventory data model and stock level tracking.

- **[DD-inventory-overview.md](inventory-management/inventory-overview/DD-inventory-overview.md)** - Data model: tb_inventory_item, tb_stock_level
- **[BR-inventory-overview.md](inventory-management/inventory-overview/BR-inventory-overview.md)** - Inventory requirements
- **[TS-inventory-overview.md](inventory-management/inventory-overview/TS-inventory-overview.md)** - Inventory logic
- **[UC-inventory-overview.md](inventory-management/inventory-overview/UC-inventory-overview.md)** - Inventory workflows
- **[FD-inventory-overview.md](inventory-management/inventory-overview/FD-inventory-overview.md)** - Inventory flows
- **[VAL-inventory-overview.md](inventory-management/inventory-overview/VAL-inventory-overview.md)** - Inventory validation

### Stock Overview

Real-time stock level monitoring and valuation.

- **[DD-stock-overview.md](inventory-management/stock-overview/DD-stock-overview.md)** - Stock monitoring data model
- **[BR-stock-overview.md](inventory-management/stock-overview/BR-stock-overview.md)** - Stock monitoring requirements
- **[TS-stock-overview.md](inventory-management/stock-overview/TS-stock-overview.md)** - Stock calculation logic
- **[UC-stock-overview.md](inventory-management/stock-overview/UC-stock-overview.md)** - Stock monitoring workflows
- **[FD-stock-overview.md](inventory-management/stock-overview/FD-stock-overview.md)** - Stock monitoring flows
- **[VAL-stock-overview.md](inventory-management/stock-overview/VAL-stock-overview.md)** - Stock validation

### Lot-Based Costing (FIFO)

First-In-First-Out lot tracking with unique cost per lot.

- **[DD-lot-based-costing.md](inventory-management/lot-based-costing/DD-lot-based-costing.md)** - Data model: tb_inventory_transaction_cost_layer
- **[BR-lot-based-costing.md](inventory-management/lot-based-costing/BR-lot-based-costing.md)** - FIFO requirements
- **[TS-lot-based-costing.md](inventory-management/lot-based-costing/TS-lot-based-costing.md)** - FIFO calculation logic
- **[UC-lot-based-costing.md](inventory-management/lot-based-costing/UC-lot-based-costing.md)** - FIFO workflows
- **[FD-lot-based-costing.md](inventory-management/lot-based-costing/FD-lot-based-costing.md)** - FIFO process flows
- **[VAL-lot-based-costing.md](inventory-management/lot-based-costing/VAL-lot-based-costing.md)** - FIFO validation
- **[PROCESS-lot-based-costing.md](inventory-management/lot-based-costing/PROCESS-lot-based-costing.md)** - End-to-end FIFO process

### Periodic Average Costing

Period-based average cost calculation (⚠️ **3 missing tables**)

- **[DD-periodic-average-costing.md](inventory-management/periodic-average-costing/DD-periodic-average-costing.md)** - Data model with 3 missing tables
- **[BR-periodic-average-costing.md](inventory-management/periodic-average-costing/BR-periodic-average-costing.md)** - Periodic costing requirements
- **[TS-periodic-average-costing.md](inventory-management/periodic-average-costing/TS-periodic-average-costing.md)** - Average cost formula
- **[UC-periodic-average-costing.md](inventory-management/periodic-average-costing/UC-periodic-average-costing.md)** - Period close workflows
- **[FD-periodic-average-costing.md](inventory-management/periodic-average-costing/FD-periodic-average-costing.md)** - Period close flows
- **[VAL-periodic-average-costing.md](inventory-management/periodic-average-costing/VAL-periodic-average-costing.md)** - Period validation
- **[PROCESS-periodic-average-costing.md](inventory-management/periodic-average-costing/PROCESS-periodic-average-costing.md)** - 8-step period close process

**Missing Tables** (CRITICAL priority, 13-16 hours):
- `tb_costing_period` - Monthly periods for averaging
- `tb_period_average_cost_cache` - Cached average costs
- `tb_period_close_log` - Audit trail for period closing

### Fractional Inventory

Support for fractional quantities (0.5 kg, 2.3 liters).

- **[DD-fractional-inventory.md](inventory-management/fractional-inventory/DD-fractional-inventory.md)** - Fractional quantity data model
- **[BR-fractional-inventory.md](inventory-management/fractional-inventory/BR-fractional-inventory.md)** - Fractional requirements
- **[TS-fractional-inventory.md](inventory-management/fractional-inventory/TS-fractional-inventory.md)** - Fractional math logic
- **[UC-fractional-inventory.md](inventory-management/fractional-inventory/UC-fractional-inventory.md)** - Fractional workflows
- **[FD-fractional-inventory.md](inventory-management/fractional-inventory/FD-fractional-inventory.md)** - Fractional flows
- **[VAL-fractional-inventory.md](inventory-management/fractional-inventory/VAL-fractional-inventory.md)** - Fractional validation

### Inventory Adjustments

Stock adjustments with approval workflows.

- **[DD-inventory-adjustments.md](inventory-management/inventory-adjustments/DD-inventory-adjustments.md)** - Adjustment data model
- **[BR-inventory-adjustments.md](inventory-management/inventory-adjustments/BR-inventory-adjustments.md)** - Adjustment requirements
- **[TS-inventory-adjustments.md](inventory-management/inventory-adjustments/TS-inventory-adjustments.md)** - Adjustment implementation
- **[UC-inventory-adjustments.md](inventory-management/inventory-adjustments/UC-inventory-adjustments.md)** - Adjustment workflows
- **[FD-inventory-adjustments.md](inventory-management/inventory-adjustments/FD-inventory-adjustments.md)** - Adjustment flows
- **[VAL-inventory-adjustments.md](inventory-management/inventory-adjustments/VAL-inventory-adjustments.md)** - Adjustment validation

### Inventory Transactions

All inventory movements and transaction tracking.

- **[DD-inventory-transactions.md](inventory-management/inventory-transactions/DD-inventory-transactions.md)** - Transaction data model
- **[BR-inventory-transactions.md](inventory-management/inventory-transactions/BR-inventory-transactions.md)** - Transaction requirements
- **[UC-inventory-transactions.md](inventory-management/inventory-transactions/UC-inventory-transactions.md)** - Transaction workflows
- **[FD-inventory-transactions.md](inventory-management/inventory-transactions/FD-inventory-transactions.md)** - Transaction flows
- **[VAL-inventory-transactions.md](inventory-management/inventory-transactions/VAL-inventory-transactions.md)** - Transaction validation

---

## 🛒 Procurement Management

**Purpose**: Purchase requests, orders, GRN (Goods Receipt Notes), approvals

**Total Documents**: 18 | **Database Tables**: 8 | **Schema Coverage**: 100%

### Purchase Requests

Create and manage purchase requests with approval workflows.

- **[DD-purchase-requests.md](procurement/purchase-requests/DD-purchase-requests.md)** - Data model: tb_purchase_request
- **[BR-purchase-requests.md](procurement/purchase-requests/BR-purchase-requests.md)** - Purchase request requirements
- **[TS-purchase-requests.md](procurement/purchase-requests/TS-purchase-requests.md)** - Request creation logic
- **[UC-purchase-requests.md](procurement/purchase-requests/UC-purchase-requests.md)** - Request workflows
- **[FD-purchase-requests.md](procurement/purchase-requests/FD-purchase-requests.md)** - Request process flows
- **[VAL-purchase-requests.md](procurement/purchase-requests/VAL-purchase-requests.md)** - Request validation
- **[PC-list-page.md](procurement/purchase-requests/pages/PC-list-page.md)** - List page content
- **[PC-create-form.md](procurement/purchase-requests/pages/PC-create-form.md)** - Create form content
- **[PC-detail-page.md](procurement/purchase-requests/pages/PC-detail-page.md)** - Detail page content
- **[PC-edit-form.md](procurement/purchase-requests/pages/PC-edit-form.md)** - Edit form content
- **[PC-template-management.md](procurement/purchase-requests/pages/PC-template-management.md)** - Template management
- **[PC-dialogs.md](procurement/purchase-requests/pages/PC-dialogs.md)** - Dialog components

### Purchase Request Templates

Templates for recurring purchase requests.

- **[DD-purchase-request-templates.md](procurement/purchase-request-templates/DD-purchase-request-templates.md)** - Template data model
- **[BR-purchase-request-templates.md](procurement/purchase-request-templates/BR-purchase-request-templates.md)** - Template requirements
- **[TS-purchase-request-templates.md](procurement/purchase-request-templates/TS-purchase-request-templates.md)** - Template implementation
- **[UC-purchase-request-templates.md](procurement/purchase-request-templates/UC-purchase-request-templates.md)** - Template workflows
- **[FD-purchase-request-templates.md](procurement/purchase-request-templates/FD-purchase-request-templates.md)** - Template flows
- **[VAL-purchase-request-templates.md](procurement/purchase-request-templates/VAL-purchase-request-templates.md)** - Template validation

### Purchase Orders

Convert approved requests to purchase orders.

- **[DD-purchase-orders.md](procurement/purchase-orders/DD-purchase-orders.md)** - Data model: tb_purchase_order
- **[BR-purchase-orders.md](procurement/purchase-orders/BR-purchase-orders.md)** - Purchase order requirements
- **[TS-purchase-orders.md](procurement/purchase-orders/TS-purchase-orders.md)** - PO creation logic
- **[UC-purchase-orders.md](procurement/purchase-orders/UC-purchase-orders.md)** - PO workflows
- **[FD-purchase-orders.md](procurement/purchase-orders/FD-purchase-orders.md)** - PO process flows
- **[VAL-purchase-orders.md](procurement/purchase-orders/VAL-purchase-orders.md)** - PO validation

### My Approvals

Approval workflows for purchase requests and other documents.

- **[DD-my-approvals.md](procurement/my-approvals/DD-my-approvals.md)** - Approval data model
- **[BR-my-approvals.md](procurement/my-approvals/BR-my-approvals.md)** - Approval requirements
- **[TS-my-approvals.md](procurement/my-approvals/TS-my-approvals.md)** - Approval implementation
- **[UC-my-approvals.md](procurement/my-approvals/UC-my-approvals.md)** - Approval workflows
- **[FD-my-approvals.md](procurement/my-approvals/FD-my-approvals.md)** - Approval flows
- **[VAL-my-approvals.md](procurement/my-approvals/VAL-my-approvals.md)** - Approval validation

### Goods Received Notes (GRN)

Receive goods against purchase orders with quality inspection.

- **[DD-goods-received-note.md](procurement/goods-received-notes/DD-goods-received-note.md)** - GRN data model
- **[BR-goods-received-note.md](procurement/goods-received-notes/BR-goods-received-note.md)** - GRN requirements
- **[TS-goods-received-note.md](procurement/goods-received-notes/TS-goods-received-note.md)** - GRN implementation
- **[UC-goods-received-note.md](procurement/goods-received-notes/UC-goods-received-note.md)** - GRN workflows
- **[FD-goods-received-note.md](procurement/goods-received-notes/FD-goods-received-note.md)** - GRN flows
- **[VAL-goods-received-note.md](procurement/goods-received-notes/VAL-goods-received-note.md)** - GRN validation

### Credit Notes

Handle returns, damages, and vendor credits.

- **[DD-credit-note.md](procurement/credit-note/DD-credit-note.md)** - Credit note data model
- **[BR-credit-note.md](procurement/credit-note/BR-credit-note.md)** - Credit note requirements
- **[TS-credit-note.md](procurement/credit-note/TS-credit-note.md)** - Credit note implementation
- **[UC-credit-note.md](procurement/credit-note/UC-credit-note.md)** - Credit note workflows
- **[FD-credit-note.md](procurement/credit-note/FD-credit-note.md)** - Credit note flows
- **[VAL-credit-note.md](procurement/credit-note/VAL-credit-note.md)** - Credit note validation

### Process Documentation

- **[PROCESS-procurement.md](procurement/PROCESS-procurement.md)** - End-to-end procurement workflow

---

## 🤝 Vendor Management

**Purpose**: Vendor profiles, price lists, RFPs, vendor portal, certifications

**Total Documents**: 30 | **Database Tables**: 10 existing, 13 missing | **Schema Coverage**: 43%

### Vendor Directory

Vendor profiles with contact management (⚠️ **3 missing enhancement tables**).

- **[DD-vendor-directory.md](vendor-management/vendor-directory/DD-vendor-directory.md)** - Data model with 3 missing tables
- **[BR-vendor-directory.md](vendor-management/vendor-directory/BR-vendor-directory.md)** - Vendor directory requirements
- **[TS-vendor-directory.md](vendor-management/vendor-directory/TS-vendor-directory.md)** - Vendor directory implementation
- **[UC-vendor-directory.md](vendor-management/vendor-directory/UC-vendor-directory.md)** - Vendor management workflows
- **[FD-vendor-directory.md](vendor-management/vendor-directory/FD-vendor-directory.md)** - Vendor flows
- **[VAL-vendor-directory.md](vendor-management/vendor-directory/VAL-vendor-directory.md)** - Vendor validation

**Missing Tables** (HIGH priority, 12-15 hours):
- `tb_vendor_certification` - Certification tracking with expiry alerts
- `tb_vendor_document` - Document management
- `tb_vendor_rating` - Vendor evaluation and ratings

### Price Lists

Vendor price lists with tiered pricing.

- **[DD-price-lists.md](vendor-management/price-lists/DD-price-lists.md)** - Price list data model (100% coverage)
- **[BR-price-lists.md](vendor-management/price-lists/BR-price-lists.md)** - Price list requirements
- **[TS-price-lists.md](vendor-management/price-lists/TS-price-lists.md)** - Price list implementation
- **[UC-price-lists.md](vendor-management/price-lists/UC-price-lists.md)** - Price list workflows
- **[FD-price-lists.md](vendor-management/price-lists/FD-price-lists.md)** - Price list flows
- **[VAL-price-lists.md](vendor-management/price-lists/VAL-price-lists.md)** - Price list validation

### Pricelist Templates

Templates for sending RFPs to vendors.

- **[DD-pricelist-templates.md](vendor-management/pricelist-templates/DD-pricelist-templates.md)** - Template data model (100% coverage)
- **[BR-pricelist-templates.md](vendor-management/pricelist-templates/BR-pricelist-templates.md)** - Template requirements
- **[TS-pricelist-templates.md](vendor-management/pricelist-templates/TS-pricelist-templates.md)** - Template implementation
- **[UC-pricelist-templates.md](vendor-management/pricelist-templates/UC-pricelist-templates.md)** - Template workflows
- **[FD-pricelist-templates.md](vendor-management/pricelist-templates/FD-pricelist-templates.md)** - Template flows
- **[VAL-pricelist-templates.md](vendor-management/pricelist-templates/VAL-pricelist-templates.md)** - Template validation

### Requests for Pricing (RFP)

Send RFPs to vendors and compare responses (⚠️ **3 optional enhancement tables**).

- **[DD-requests-for-pricing.md](vendor-management/requests-for-pricing/DD-requests-for-pricing.md)** - RFP data model (JSONB + 3 optional tables)
- **[BR-requests-for-pricing.md](vendor-management/requests-for-pricing/BR-requests-for-pricing.md)** - RFP requirements
- **[TS-requests-for-pricing.md](vendor-management/requests-for-pricing/TS-requests-for-pricing.md)** - RFP implementation
- **[UC-requests-for-pricing.md](vendor-management/requests-for-pricing/UC-requests-for-pricing.md)** - RFP workflows
- **[FD-requests-for-pricing.md](vendor-management/requests-for-pricing/FD-requests-for-pricing.md)** - RFP flows
- **[VAL-requests-for-pricing.md](vendor-management/requests-for-pricing/VAL-requests-for-pricing.md)** - RFP validation

**Optional Enhancement Tables** (MEDIUM priority, 8-10 hours):
- `tb_rfp_vendor_response` - Relational vendor responses
- `tb_rfp_evaluation` - Evaluation criteria and scoring
- `tb_rfp_award` - Award decision tracking

### Vendor Portal

Self-service vendor portal (⚠️ **7 missing tables**).

- **[DD-vendor-portal.md](vendor-management/vendor-portal/DD-vendor-portal.md)** - Portal data model (0% coverage - all missing)
- **[BR-vendor-portal.md](vendor-management/vendor-portal/BR-vendor-portal.md)** - Portal requirements
- **[TS-vendor-portal.md](vendor-management/vendor-portal/TS-vendor-portal.md)** - NextAuth.js integration
- **[UC-vendor-portal.md](vendor-management/vendor-portal/UC-vendor-portal.md)** - Portal workflows
- **[FD-vendor-portal.md](vendor-management/vendor-portal/FD-vendor-portal.md)** - Portal flows
- **[VAL-vendor-portal.md](vendor-management/vendor-portal/VAL-vendor-portal.md)** - Portal validation

**Missing Tables** (CRITICAL priority, 24-28 hours):
- `tb_vendor_portal_user` - Vendor user accounts with 2FA
- `tb_vendor_portal_session` - Session management
- `tb_vendor_registration` - Registration workflow
- `tb_vendor_document` - Document management with virus scanning
- `tb_vendor_notification` - In-portal notifications
- `tb_vendor_message` - Message center
- `tb_vendor_audit_log` - Comprehensive audit trail (7-year retention)

---

## 🏷️ Product Management

**Purpose**: Product catalog, categories, units of measure, specifications

**Total Documents**: 12 | **Database Tables**: 5 | **Schema Coverage**: 100%

### Products

Product catalog with specifications and variants.

- **[DD-products.md](product-management/products/DD-products.md)** - Product data model
- **[BR-products.md](product-management/products/BR-products.md)** - Product requirements
- **[TS-products.md](product-management/products/TS-products.md)** - Product implementation
- **[UC-products.md](product-management/products/UC-products.md)** - Product workflows
- **[FD-products.md](product-management/products/FD-products.md)** - Product flows
- **[VAL-products.md](product-management/products/VAL-products.md)** - Product validation

### Categories

Hierarchical product category structure.

- **[DD-categories.md](product-management/categories/DD-categories.md)** - Category data model
- **[BR-categories.md](product-management/categories/BR-categories.md)** - Category requirements
- **[TS-categories.md](product-management/categories/TS-categories.md)** - Category implementation
- **[UC-categories.md](product-management/categories/UC-categories.md)** - Category workflows
- **[FD-categories.md](product-management/categories/FD-categories.md)** - Category flows
- **[VAL-categories.md](product-management/categories/VAL-categories.md)** - Category validation

### Units of Measure

Multi-unit support (kg, liter, piece, box).

- **[DD-units.md](product-management/units/DD-units.md)** - Unit data model
- **[BR-units.md](product-management/units/BR-units.md)** - Unit requirements
- **[TS-units.md](product-management/units/TS-units.md)** - Unit conversion logic
- **[UC-units.md](product-management/units/UC-units.md)** - Unit workflows
- **[FD-units.md](product-management/units/FD-units.md)** - Unit flows
- **[VAL-units.md](product-management/units/VAL-units.md)** - Unit validation

---

## 🏪 Store Operations

**Purpose**: Store requisitions, stock replenishment, wastage reporting

**Total Documents**: 18 | **Database Tables**: 6 | **Schema Coverage**: 100%

### Store Requisitions

Inter-store transfer requests and receiving.

- **[DD-store-requisitions.md](store-operations/store-requisitions/DD-store-requisitions.md)** - Requisition data model
- **[BR-store-requisitions.md](store-operations/store-requisitions/BR-store-requisitions.md)** - Requisition requirements
- **[TS-store-requisitions.md](store-operations/store-requisitions/TS-store-requisitions.md)** - Requisition implementation
- **[UC-store-requisitions.md](store-operations/store-requisitions/UC-store-requisitions.md)** - Requisition workflows
- **[FD-store-requisitions.md](store-operations/store-requisitions/FD-store-requisitions.md)** - Requisition flows
- **[VAL-store-requisitions.md](store-operations/store-requisitions/VAL-store-requisitions.md)** - Requisition validation

### Stock Replenishment

Automated stock replenishment based on min/max levels.

- **[DD-stock-replenishment.md](store-operations/stock-replenishment/DD-stock-replenishment.md)** - Replenishment data model
- **[BR-stock-replenishment.md](store-operations/stock-replenishment/BR-stock-replenishment.md)** - Replenishment requirements
- **[TS-stock-replenishment.md](store-operations/stock-replenishment/TS-stock-replenishment.md)** - Auto-replenishment logic
- **[UC-stock-replenishment.md](store-operations/stock-replenishment/UC-stock-replenishment.md)** - Replenishment workflows
- **[FD-stock-replenishment.md](store-operations/stock-replenishment/FD-stock-replenishment.md)** - Replenishment flows
- **[VAL-stock-replenishment.md](store-operations/stock-replenishment/VAL-stock-replenishment.md)** - Replenishment validation

### Wastage Reporting

Track wastage with reason codes and cost tracking.

- **[DD-wastage-reporting.md](store-operations/wastage-reporting/DD-wastage-reporting.md)** - Wastage data model
- **[BR-wastage-reporting.md](store-operations/wastage-reporting/BR-wastage-reporting.md)** - Wastage requirements
- **[TS-wastage-reporting.md](store-operations/wastage-reporting/TS-wastage-reporting.md)** - Wastage tracking logic
- **[UC-wastage-reporting.md](store-operations/wastage-reporting/UC-wastage-reporting.md)** - Wastage workflows
- **[FD-wastage-reporting.md](store-operations/wastage-reporting/FD-wastage-reporting.md)** - Wastage flows
- **[VAL-wastage-reporting.md](store-operations/wastage-reporting/VAL-wastage-reporting.md)** - Wastage validation

---

## 👨‍🍳 Operational Planning

**Purpose**: Recipe management, menu engineering, production forecasting

**Total Documents**: 24 | **Database Tables**: 8 | **Schema Coverage**: 100%

### Recipes

Recipe specifications with ingredient requirements.

- **[DD-recipes.md](operational-planning/recipe-management/recipes/DD-recipes.md)** - Recipe data model
- **[BR-recipes.md](operational-planning/recipe-management/recipes/BR-recipes.md)** - Recipe requirements
- **[TS-recipes.md](operational-planning/recipe-management/recipes/TS-recipes.md)** - Recipe implementation
- **[UC-recipes.md](operational-planning/recipe-management/recipes/UC-recipes.md)** - Recipe workflows
- **[FD-recipes.md](operational-planning/recipe-management/recipes/FD-recipes.md)** - Recipe flows
- **[VAL-recipes.md](operational-planning/recipe-management/recipes/VAL-recipes.md)** - Recipe validation

### Recipe Categories

Hierarchical recipe categorization.

- **[DD-categories.md](operational-planning/recipe-management/categories/DD-categories.md)** - Category data model
- **[BR-categories.md](operational-planning/recipe-management/categories/BR-categories.md)** - Category requirements
- **[TS-categories.md](operational-planning/recipe-management/categories/TS-categories.md)** - Category implementation
- **[UC-categories.md](operational-planning/recipe-management/categories/UC-categories.md)** - Category workflows
- **[FD-categories.md](operational-planning/recipe-management/categories/FD-categories.md)** - Category flows
- **[VAL-categories.md](operational-planning/recipe-management/categories/VAL-categories.md)** - Category validation

### Cuisine Types

Cuisine classification for recipes.

- **[DD-cuisine-types.md](operational-planning/recipe-management/cuisine-types/DD-cuisine-types.md)** - Cuisine type data model
- **[BR-cuisine-types.md](operational-planning/recipe-management/cuisine-types/BR-cuisine-types.md)** - Cuisine type requirements
- **[TS-cuisine-types.md](operational-planning/recipe-management/cuisine-types/TS-cuisine-types.md)** - Cuisine type implementation
- **[UC-cuisine-types.md](operational-planning/recipe-management/cuisine-types/UC-cuisine-types.md)** - Cuisine type workflows
- **[FD-cuisine-types.md](operational-planning/recipe-management/cuisine-types/FD-cuisine-types.md)** - Cuisine type flows
- **[VAL-cuisine-types.md](operational-planning/recipe-management/cuisine-types/VAL-cuisine-types.md)** - Cuisine type validation

### Menu Engineering

Menu optimization using Star/Plow-horse/Puzzle/Dog classification.

- **[DD-menu-engineering.md](operational-planning/menu-engineering/DD-menu-engineering.md)** - Menu engineering data model
- **[BR-menu-engineering.md](operational-planning/menu-engineering/BR-menu-engineering.md)** - Menu engineering requirements
- **[TS-menu-engineering.md](operational-planning/menu-engineering/TS-menu-engineering.md)** - Classification algorithms
- **[UC-menu-engineering.md](operational-planning/menu-engineering/UC-menu-engineering.md)** - Menu engineering workflows
- **[FD-menu-engineering.md](operational-planning/menu-engineering/FD-menu-engineering.md)** - Menu engineering flows
- **[VAL-menu-engineering.md](operational-planning/menu-engineering/VAL-menu-engineering.md)** - Menu engineering validation

---

## ⚙️ System Administration

**Purpose**: User management, roles, permissions, workflows, audit logs

**Total Documents**: 6 | **Database Tables**: 18 (separate schema) | **Schema Coverage**: 100%

**Note**: System Administration uses a separate schema (`/prisma/schema.prisma`) for ABAC (Attribute-Based Access Control) permission system.

### System Administration

User management, role-based access control, audit logging.

- **[DD-system-administration.md](system-administration/DD-system-administration.md)** - User, role, permission data model
- **[BR-system-administration.md](system-administration/BR-system-administration.md)** - Administration requirements
- **[TS-system-administration.md](system-administration/TS-system-administration.md)** - ABAC implementation
- **[UC-system-administration.md](system-administration/UC-system-administration.md)** - Administration workflows
- **[FD-system-administration.md](system-administration/FD-system-administration.md)** - Administration flows
- **[VAL-system-administration.md](system-administration/VAL-system-administration.md)** - Administration validation

**Database Tables** (18 tables in `/prisma/schema.prisma`):
- User management: tb_user, tb_role, tb_permission
- Department/Location: tb_department, tb_location
- Audit: tb_audit_log, tb_user_session
- ABAC: tb_attribute, tb_policy, tb_resource, etc.

---

## 🔧 Shared Methods

**Purpose**: Reusable methods for inventory valuation and costing

**Total Documents**: 8 Shared Method (SM) files + additional supporting documentation

### Inventory Valuation Methods

Centralized methods for inventory costing calculations.

- **[DD-inventory-valuation.md](shared-methods/inventory-valuation/DD-inventory-valuation.md)** - Inventory valuation data structures
- **[BR-inventory-valuation.md](shared-methods/inventory-valuation/BR-inventory-valuation.md)** - Valuation requirements
- **[UC-inventory-valuation.md](shared-methods/inventory-valuation/UC-inventory-valuation.md)** - Valuation workflows
- **[FD-inventory-valuation.md](shared-methods/inventory-valuation/FD-inventory-valuation.md)** - Valuation flows
- **[VAL-inventory-valuation.md](shared-methods/inventory-valuation/VAL-inventory-valuation.md)** - Valuation validation rules
- **[SM-inventory-valuation.md](shared-methods/inventory-valuation/SM-inventory-valuation.md)** - Core valuation methods
- **[SM-costing-methods.md](shared-methods/inventory-valuation/SM-costing-methods.md)** - FIFO, LIFO, Weighted Average
- **[SM-periodic-average.md](shared-methods/inventory-valuation/SM-periodic-average.md)** - Periodic average costing
- **[SM-period-management.md](shared-methods/inventory-valuation/SM-period-management.md)** - Period open/close methods
- **[SM-transaction-types-and-cost-layers.md](shared-methods/inventory-valuation/SM-transaction-types-and-cost-layers.md)** - Transaction type handling
- **[SM-period-end-snapshots.md](shared-methods/inventory-valuation/SM-period-end-snapshots.md)** - Period-end snapshot methods

### Supporting Documentation

- **[api-reference.md](shared-methods/inventory-valuation/api-reference.md)** - API method signatures
- **[API-lot-based-costing.md](shared-methods/inventory-valuation/API-lot-based-costing.md)** - Lot-based costing APIs
- **[PC-inventory-settings.md](shared-methods/inventory-valuation/PC-inventory-settings.md)** - Settings page content
- **[USER-GUIDE-period-close.md](shared-methods/inventory-valuation/USER-GUIDE-period-close.md)** - Period close guide
- **[CURRENT-CAPABILITIES.md](shared-methods/inventory-valuation/CURRENT-CAPABILITIES.md)** - Current features
- **[WHATS-COMING.md](shared-methods/inventory-valuation/WHATS-COMING.md)** - Upcoming features
- **[ENHANCEMENTS-ROADMAP.md](shared-methods/inventory-valuation/ENHANCEMENTS-ROADMAP.md)** - Enhancement roadmap
- **[ENHANCEMENT-COMPARISON.md](shared-methods/inventory-valuation/ENHANCEMENT-COMPARISON.md)** - Feature comparison
- **[ENHANCEMENT-FAQ.md](shared-methods/inventory-valuation/ENHANCEMENT-FAQ.md)** - FAQ for enhancements
- **[VISUAL-ROADMAP.md](shared-methods/inventory-valuation/VISUAL-ROADMAP.md)** - Visual roadmap diagrams
- **[SCHEMA-ALIGNMENT.md](shared-methods/inventory-valuation/SCHEMA-ALIGNMENT.md)** - Schema alignment guide
- **[examples/credit-note-integration.md](shared-methods/inventory-valuation/examples/credit-note-integration.md)** - Credit note example

---

## 📝 Template Guide

**Purpose**: Documentation templates and examples for creating new documentation

**Templates**:
- **[DD-template.md](template-guide/DD-template.md)** - Data Definition template
- **[BR-template.md](template-guide/BR-template.md)** - Business Requirements template
- **[TS-template.md](template-guide/TS-template.md)** - Technical Specification template
- **[UC-template.md](template-guide/UC-template.md)** - Use Case template
- **[FD-template.md](template-guide/FD-template.md)** - Flow Diagram template
- **[VAL-template.md](template-guide/VAL-template.md)** - Validation template
- **[PC-template.md](template-guide/PC-template.md)** - Page Content template
- **[MAIN-template.md](template-module/template-sub-module/MAIN-template.md)** - Main module template

**Examples and Guides**:
- **[PC-example-list-page.md](template-guide/PC-example-list-page.md)** - Example list page
- **[USER-STORY-TEMPLATE.md](template-guide/USER-STORY-TEMPLATE.md)** - User story template
- **[DOCUMENTATION-GENERATOR-PROMPT.md](template-guide/DOCUMENTATION-GENERATOR-PROMPT.md)** - Doc generation prompt
- **[HOSPITALITY-PERSONAS-UPDATE.md](template-guide/HOSPITALITY-PERSONAS-UPDATE.md)** - Persona definitions
- **[README.md](template-guide/README.md)** - Template guide overview

---

## 📋 All Data Definitions (DD)

Complete list of all 40 DD documents organized by module:

**Finance Management** (4 DD docs):
- [DD-account-code-mapping.md](finance/account-code-mapping/DD-account-code-mapping.md)
- [DD-currency-management.md](finance/currency-management/DD-currency-management.md)
- [DD-department-management.md](finance/department-management/DD-department-management.md)
- [DD-exchange-rate-management.md](finance/exchange-rate-management/DD-exchange-rate-management.md)

**Inventory Management** (7 DD docs):
- [DD-inventory-overview.md](inventory-management/inventory-overview/DD-inventory-overview.md)
- [DD-stock-overview.md](inventory-management/stock-overview/DD-stock-overview.md)
- [DD-lot-based-costing.md](inventory-management/lot-based-costing/DD-lot-based-costing.md)
- [DD-periodic-average-costing.md](inventory-management/periodic-average-costing/DD-periodic-average-costing.md) ⚠️
- [DD-fractional-inventory.md](inventory-management/fractional-inventory/DD-fractional-inventory.md)
- [DD-inventory-adjustments.md](inventory-management/inventory-adjustments/DD-inventory-adjustments.md)
- [DD-inventory-transactions.md](inventory-management/inventory-transactions/DD-inventory-transactions.md)

**Procurement Management** (6 DD docs):
- [DD-purchase-requests.md](procurement/purchase-requests/DD-purchase-requests.md)
- [DD-purchase-request-templates.md](procurement/purchase-request-templates/DD-purchase-request-templates.md)
- [DD-purchase-orders.md](procurement/purchase-orders/DD-purchase-orders.md)
- [DD-my-approvals.md](procurement/my-approvals/DD-my-approvals.md)
- [DD-goods-received-note.md](procurement/goods-received-notes/DD-goods-received-note.md)
- [DD-credit-note.md](procurement/credit-note/DD-credit-note.md)

**Vendor Management** (5 DD docs):
- [DD-vendor-directory.md](vendor-management/vendor-directory/DD-vendor-directory.md) ⚠️
- [DD-price-lists.md](vendor-management/price-lists/DD-price-lists.md)
- [DD-pricelist-templates.md](vendor-management/pricelist-templates/DD-pricelist-templates.md)
- [DD-requests-for-pricing.md](vendor-management/requests-for-pricing/DD-requests-for-pricing.md)
- [DD-vendor-portal.md](vendor-management/vendor-portal/DD-vendor-portal.md) ⚠️

**Product Management** (3 DD docs):
- [DD-products.md](product-management/products/DD-products.md)
- [DD-categories.md](product-management/categories/DD-categories.md)
- [DD-units.md](product-management/units/DD-units.md)

**Store Operations** (3 DD docs):
- [DD-store-requisitions.md](store-operations/store-requisitions/DD-store-requisitions.md)
- [DD-stock-replenishment.md](store-operations/stock-replenishment/DD-stock-replenishment.md)
- [DD-wastage-reporting.md](store-operations/wastage-reporting/DD-wastage-reporting.md)

**Operational Planning** (4 DD docs):
- [DD-recipes.md](operational-planning/recipe-management/recipes/DD-recipes.md)
- [DD-categories.md](operational-planning/recipe-management/categories/DD-categories.md)
- [DD-cuisine-types.md](operational-planning/recipe-management/cuisine-types/DD-cuisine-types.md)
- [DD-menu-engineering.md](operational-planning/menu-engineering/DD-menu-engineering.md)

**System Administration** (1 DD doc):
- [DD-system-administration.md](system-administration/DD-system-administration.md)

**Shared Methods** (1 DD doc):
- [DD-inventory-valuation.md](shared-methods/inventory-valuation/DD-inventory-valuation.md)

⚠️ = Contains missing tables

---

## 📋 All Business Requirements (BR)

Complete list of all 38 BR documents (organized same structure as DD section above).

---

## 📋 All Technical Specifications (TS)

Complete list of all 36 TS documents (organized same structure as DD section above).

---

## 📋 All Use Cases (UC)

Complete list of all 38 UC documents (organized same structure as DD section above).

---

## 📋 All Flow Diagrams (FD)

Complete list of all 38 FD documents (organized same structure as DD section above).

---

## 📋 All Validations (VAL)

Complete list of all 38 VAL documents (organized same structure as DD section above).

---

## 🔗 Related Resources

**Main Documentation**:
- **[WIKI-HOME.md](WIKI-HOME.md)** - Documentation hub
- **[DEVELOPER-ONBOARDING.md](DEVELOPER-ONBOARDING.md)** - Complete onboarding guide
- **[ARCHITECTURE-OVERVIEW.md](ARCHITECTURE-OVERVIEW.md)** - System architecture
- **[DATABASE-SCHEMA-GUIDE.md](DATABASE-SCHEMA-GUIDE.md)** - Database schema navigation

**Project Files**:
- **[CLAUDE.md](../../CLAUDE.md)** - Development guidelines
- **[README.md](../../README.md)** - Project overview
- **[package.json](../../package.json)** - Dependencies and scripts

**Gap Analysis**:
- **[MISSING-TABLES-AND-FIELDS-SUMMARY.md](MISSING-TABLES-AND-FIELDS-SUMMARY.md)** - Complete gap analysis (23 missing tables)
- **[DATA-MIGRATION-COMPLETION-SUMMARY.md](DATA-MIGRATION-COMPLETION-SUMMARY.md)** - Migration project summary
- **[SCHEMA-COVERAGE-REPORT.md](SCHEMA-COVERAGE-REPORT.md)** - Schema coverage by module

---

## 📊 Statistics Summary

**Documentation Files**: 247 total
- DD: 40 files
- BR: 38 files
- TS: 36 files
- UC: 38 files
- FD: 38 files
- VAL: 38 files
- PC: 9 files
- SM: 8 files
- PROCESS: 2 files

**Database Schema**:
- Total Tables: 68 (documented in ERP schema)
- Existing Tables: 68 tables
- Missing Tables: 23 tables (16 required + 7 optional)
- Schema Coverage: 77% overall

**Implementation Status**:
- Fully Covered Modules: 6 modules (100% coverage)
- Partially Covered Modules: 2 modules (43-80% coverage)
- Implementation Effort: 57-69 hours (database) + 100-150 hours (application)

---

**Last Updated**: November 15, 2025
**Maintained By**: Carmen ERP Development Team

**🏠 [Back to Wiki Home](WIKI-HOME.md)** | **🚀 [Get Started](guides/GETTING-STARTED.md)** | **🗺️ [Architecture Guide](ARCHITECTURE-OVERVIEW.md)**
