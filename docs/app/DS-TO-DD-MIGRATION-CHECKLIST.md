# DS → DD Migration Tasks Checklist

**Project**: Carmen ERP Documentation Migration
**Migration Direction**: DS (Data Schema) → DD (Data Definition)
**Total Scope**: 28 documents (22 migrate + 6 create new)
**Estimated Total Effort**: 42-56 hours
**Target Completion**: 6 weeks

---

## Executive Summary

### Overall Progress
- **Current Status**: 27% complete (10/37 submodules using DD)
- **Remaining Work**: 28 documents
  - 22 DS → DD migrations
  - 6 new DD documents to create
- **Estimated Timeline**: 6 weeks (with 1 FTE)
- **Estimated Cost**: 42-56 developer hours

### Effort Breakdown by Activity Type
| Activity | Documents | Hours Low | Hours High | Avg per Doc |
|----------|-----------|-----------|------------|-------------|
| Migrate DS → DD (Simple) | 8 | 8 | 12 | 1.0-1.5h |
| Migrate DS → DD (Medium) | 10 | 15 | 25 | 1.5-2.5h |
| Migrate DS → DD (Complex) | 4 | 8 | 12 | 2.0-3.0h |
| Create New DD | 6 | 12 | 18 | 2.0-3.0h |
| **TOTAL** | **28** | **43** | **67** | **1.5-2.4h** |

---

## Estimation Methodology

### Complexity Factors
1. **Document Size**: Lines of content in DS file
   - Simple: <1000 lines (1.0-1.5h)
   - Medium: 1000-1700 lines (1.5-2.5h)
   - Complex: >1700 lines (2.0-3.0h)

2. **Entity Complexity**: Number of entities and relationships
   - Low: 1-3 entities (multiplier: 1.0x)
   - Medium: 4-6 entities (multiplier: 1.2x)
   - High: 7+ entities (multiplier: 1.5x)

3. **Integration Points**: Cross-module dependencies
   - None: No integration (multiplier: 1.0x)
   - Low: 1-2 integrations (multiplier: 1.1x)
   - Medium: 3-5 integrations (multiplier: 1.3x)
   - High: 6+ integrations (multiplier: 1.5x)

4. **Technical Depth**: Special requirements
   - Standard data structures (multiplier: 1.0x)
   - Financial/costing logic (multiplier: 1.2x)
   - Multi-dimensional accounting (multiplier: 1.5x)

### Time Estimates
- **Migration (DS → DD)**: 1.0-3.0 hours per document
  - Read and analyze DS document: 15-30 min
  - Create DD document with format updates: 30-60 min
  - Quality review and cross-reference check: 15-30 min
  - Archive DS file: 5 min

- **Creation (New DD)**: 2.0-3.0 hours per document
  - Research from BR, UC, TS documents: 45-60 min
  - Write DD document from scratch: 60-90 min
  - Quality review: 15-30 min

### Risk Buffer
- **Baseline estimates**: 50th percentile (median)
- **Low estimate**: Optimistic (best case)
- **High estimate**: Conservative (90th percentile)
- **Recommended planning**: Use high estimate + 10% buffer

---

## Phase 1: URGENT - Finance & System Administration (5 documents)
**Priority**: 🔴 CRITICAL
**Timeline**: Week 1-2
**Total Effort**: 10-15 hours

### Finance Module (4 documents)

#### FIN-001: Account Code Mapping
- **Source**: `finance/account-code-mapping/DS-account-code-mapping.md` (854 lines)
- **Target**: `finance/account-code-mapping/DD-account-code-mapping.md`
- **Complexity**: Medium (Financial accounting, GL integration)
- **Entities**: 9 (chart_of_accounts, gl_accounts, mapping_rules, journal_entries, etc.)
- **Integration Points**: 4 (GL systems, Inventory, Procurement, Store Ops)
- **Estimate**: 2.0-3.0 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - Multi-dimensional accounting complexity
  - Journal entry immutability requirements
  - Period-based accounting logic
  ```

#### FIN-002: Currency Management
- **Source**: `finance/currency-management/DS-currency-management.md` (2,252 lines)
- **Target**: `finance/currency-management/DD-currency-management.md`
- **Complexity**: Complex (Largest Finance document, multi-currency logic)
- **Entities**: 6 (currencies, exchange_rates, revaluation, multi-currency transactions)
- **Integration Points**: 5 (Exchange Rate APIs, Account Mapping, Banking, GL Posting)
- **Estimate**: 3.0-4.0 hours
- **Dependencies**: None (but references Account Code Mapping)
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - Largest document in Finance module
  - Complex revaluation logic
  - Multiple external API integrations
  ```

#### FIN-003: Exchange Rate Management
- **Source**: `finance/exchange-rate-management/DS-exchange-rate-management.md` (1,308 lines)
- **Target**: `finance/exchange-rate-management/DD-exchange-rate-management.md`
- **Complexity**: Medium (API integrations, real-time updates)
- **Entities**: 4 (exchange_rates, rate_history, rate_providers, rate_alerts)
- **Integration Points**: 4 (Rate Provider APIs, Currency Management, GL Posting)
- **Estimate**: 2.0-2.5 hours
- **Dependencies**: Currency Management (references base currency)
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - Real-time rate update logic
  - Historical rate tracking
  - Provider failover mechanisms
  ```

#### FIN-004: Department Management
- **Source**: `finance/department-management/DS-department-management.md` (1,171 lines)
- **Target**: `finance/department-management/DD-department-management.md`
- **Complexity**: Medium (Hierarchical structure, ABAC integration)
- **Entities**: 5 (departments, cost_centers, hierarchy, budgets, assignments)
- **Integration Points**: 3 (ABAC, Budget System, GL Accounts)
- **Estimate**: 2.0-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - 5-level hierarchical structure
  - ABAC permission synchronization
  - Budget allocation workflows
  ```

### System Administration (1 document)

#### SYSADMIN-001: System Administration
- **Source**: `system-administration/DS-system-administration.md` (938 lines)
- **Target**: `system-administration/DD-system-administration.md`
- **Complexity**: Simple (Well-defined user/role/permission model)
- **Entities**: 7 (users, roles, permissions, subscriptions, workflows, locations, settings)
- **Integration Points**: 2 (ABAC, Keycloak)
- **Estimate**: 1.5-2.0 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - Standard user management model
  - ABAC integration
  - Well-documented structure
  ```

**Phase 1 Subtotal**: 10.5-14.0 hours

---

## Phase 2: HIGH PRIORITY - Operational Planning & Store Operations (7 documents)
**Priority**: 🟡 HIGH
**Timeline**: Week 3-4
**Total Effort**: 10.5-15.5 hours

### Operational Planning (4 documents)

#### OPPLAN-001: Menu Engineering
- **Source**: `operational-planning/menu-engineering/DS-menu-engineering.md` (1,548 lines)
- **Target**: `operational-planning/menu-engineering/DD-menu-engineering.md`
- **Complexity**: Medium (Recipe costing, profitability analysis)
- **Entities**: 5 (menu_items, recipes, costing, profitability, engineering_analysis)
- **Integration Points**: 3 (Recipes, Inventory, Pricing)
- **Estimate**: 2.0-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### OPPLAN-002: Recipe Categories
- **Source**: `operational-planning/recipe-management/categories/DS-categories.md` (784 lines)
- **Target**: `operational-planning/recipe-management/categories/DD-categories.md`
- **Complexity**: Simple (Standard categorization)
- **Entities**: 2 (categories, category_hierarchy)
- **Integration Points**: 1 (Recipes)
- **Estimate**: 1.0-1.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### OPPLAN-003: Cuisine Types
- **Source**: `operational-planning/recipe-management/cuisine-types/DS-cuisine-types.md` (693 lines)
- **Target**: `operational-planning/recipe-management/cuisine-types/DD-cuisine-types.md`
- **Complexity**: Simple (Lookup table)
- **Entities**: 1 (cuisine_types)
- **Integration Points**: 1 (Recipes)
- **Estimate**: 0.5-1.0 hour
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### OPPLAN-004: Recipes
- **Source**: `operational-planning/recipe-management/recipes/DS-recipes.md` (2,714 lines)
- **Target**: `operational-planning/recipe-management/recipes/DD-recipes.md`
- **Complexity**: Complex (Recipe BOM, costing, ingredient substitutions)
- **Entities**: 6 (recipes, ingredients, steps, substitutions, costing, versions)
- **Integration Points**: 4 (Inventory, Products, Menu Engineering, Costing)
- **Estimate**: 3.0-4.0 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

### Store Operations (3 documents)

#### STORE-001: Stock Replenishment
- **Source**: `store-operations/stock-replenishment/DS-stock-replenishment.md` (811 lines)
- **Target**: `store-operations/stock-replenishment/DD-stock-replenishment.md`
- **Complexity**: Simple (Standard replenishment logic)
- **Entities**: 3 (replenishment_orders, par_levels, reorder_points)
- **Integration Points**: 2 (Inventory, Purchase Requests)
- **Estimate**: 1.0-1.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### STORE-002: Store Requisitions
- **Source**: `store-operations/store-requisitions/DS-store-requisitions.md` (2,463 lines)
- **Target**: `store-operations/store-requisitions/DD-store-requisitions.md`
- **Complexity**: Complex (Multi-step approval, inventory allocation)
- **Entities**: 5 (requisitions, line_items, approvals, allocations, issues)
- **Integration Points**: 4 (Inventory, Departments, Workflow, GL Posting)
- **Estimate**: 2.5-3.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### STORE-003: Wastage Reporting
- **Source**: `store-operations/wastage-reporting/DS-wastage-reporting.md` (1,653 lines)
- **Target**: `store-operations/wastage-reporting/DD-wastage-reporting.md`
- **Complexity**: Medium (Wastage categorization, variance analysis)
- **Entities**: 4 (wastage_records, categories, variance_analysis, adjustments)
- **Integration Points**: 3 (Inventory, GL Posting, Reporting)
- **Estimate**: 1.5-2.0 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

**Phase 2 Subtotal**: 11.5-16.0 hours

---

## Phase 3: MEDIUM PRIORITY - Inventory, Procurement, Product (11 documents)
**Priority**: 🟢 MEDIUM
**Timeline**: Week 5-6
**Total Effort**: 16.5-25.0 hours

### Inventory Management (5 + 1 documents)

#### INV-001: Fractional Inventory
- **Source**: `inventory-management/fractional-inventory/DS-fractional-inventory.md` (1,452 lines)
- **Target**: `inventory-management/fractional-inventory/DD-fractional-inventory.md`
- **Complexity**: Medium (Fractional unit handling, conversions)
- **Entities**: 4 (fractional_items, conversions, transactions, balances)
- **Integration Points**: 3 (Inventory Transactions, Units, Products)
- **Estimate**: 1.5-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### INV-002: Inventory Adjustments
- **Source**: `inventory-management/inventory-adjustments/DS-inventory-adjustments.md` (1,506 lines)
- **Target**: `inventory-management/inventory-adjustments/DD-inventory-adjustments.md`
- **Complexity**: Medium (Adjustment reasons, variance tracking)
- **Entities**: 4 (adjustments, line_items, reasons, variances)
- **Integration Points**: 3 (Inventory Transactions, GL Posting, Approval Workflow)
- **Estimate**: 1.5-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### INV-003: Inventory Overview
- **Source**: `inventory-management/inventory-overview/DS-inventory-overview.md` (1,613 lines)
- **Target**: `inventory-management/inventory-overview/DD-inventory-overview.md`
- **Complexity**: Medium (Multi-location aggregation, valuation views)
- **Entities**: 5 (overview_data, location_summary, category_summary, valuation, aging)
- **Integration Points**: 4 (Inventory Status, Valuation Service, Locations, Categories)
- **Estimate**: 2.0-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### INV-004: Lot-Based Costing
- **Source**: `inventory-management/lot-based-costing/DS-lot-based-costing.md` (1,125 lines)
- **Target**: `inventory-management/lot-based-costing/DD-lot-based-costing.md`
- **Complexity**: Medium (Lot tracking, batch costing)
- **Entities**: 4 (lots, lot_assignments, lot_costs, lot_tracking)
- **Integration Points**: 3 (Inventory Transactions, Valuation Service, GRN)
- **Estimate**: 1.5-2.0 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### INV-005: Stock Overview
- **Source**: `inventory-management/stock-overview/DS-stock-overview.md` (1,613 lines)
- **Target**: `inventory-management/stock-overview/DD-stock-overview.md`
- **Complexity**: Medium (Real-time stock levels, allocation tracking)
- **Entities**: 4 (stock_levels, allocations, available_stock, reorder_tracking)
- **Integration Points**: 3 (Inventory Status, Allocations, Replenishment)
- **Estimate**: 2.0-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### INV-006: Periodic Average Costing ⚠️ NEW
- **Source**: None (only PROCESS-periodic-average-costing.md exists)
- **Target**: `inventory-management/periodic-average-costing/DD-periodic-average-costing.md`
- **Complexity**: Complex (Costing calculation logic, period-based averaging)
- **Entities**: 4 (costing_periods, average_costs, period_close, reuse: cost_layers)
- **Integration Points**: 4 (Inventory Transactions, Valuation Service, Accounting Periods, GL Posting)
- **Estimate**: 3.0-4.0 hours
- **Dependencies**: Review PROCESS doc + BR/UC/TS (if exists)
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ **Complete**
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - CREATED FROM PROCESS-periodic-average-costing.md
  - 20% schema coverage - Reuses tb_inventory_transaction_cost_layer (different pattern)
  - Missing tables defined: tb_costing_period, tb_period_average_cost_cache, tb_period_close_log
  - All missing tables marked with ❌ NOT IN SCHEMA
  - Complex calculation formula documented: (opening + receipts) ÷ (opening qty + receipt qty)
  - FIFO vs Periodic Average pattern comparison included
  - 8-step period close process documented
  - Implementation: 13-16 hours total effort (CRITICAL priority)
  ```

### Procurement (3 documents)

#### PROC-001: My Approvals
- **Source**: `procurement/my-approvals/DS-my-approvals.md` (1,679 lines)
- **Target**: `procurement/my-approvals/DD-my-approvals.md`
- **Complexity**: Medium (Approval workflow, notification logic)
- **Entities**: 4 (approvals, approval_history, notifications, delegation)
- **Integration Points**: 3 (Workflow Engine, Users, Document Types)
- **Estimate**: 2.0-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### PROC-002: Purchase Orders
- **Source**: `procurement/purchase-orders/DS-purchase-orders.md` (758 lines)
- **Target**: `procurement/purchase-orders/DD-purchase-orders.md`
- **Complexity**: Simple (Standard PO structure)
- **Entities**: 3 (purchase_orders, line_items, status_tracking)
- **Integration Points**: 2 (Purchase Requests, GRN, Vendors)
- **Estimate**: 1.0-1.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### PROC-003: Purchase Request Templates
- **Source**: `procurement/purchase-request-templates/DS-purchase-request-templates.md` (384 lines)
- **Target**: `procurement/purchase-request-templates/DD-purchase-request-templates.md`
- **Complexity**: Simple (Template management)
- **Entities**: 2 (templates, template_items)
- **Integration Points**: 1 (Purchase Requests)
- **Estimate**: 0.5-1.0 hour
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

### Product Management (2 documents)

#### PROD-001: Categories
- **Source**: `product-management/categories/DS-categories.md` (2,022 lines)
- **Target**: `product-management/categories/DD-categories.md`
- **Complexity**: Medium (Hierarchical categories, GL mapping)
- **Entities**: 4 (categories, hierarchy, attributes, gl_mapping)
- **Integration Points**: 3 (Products, Account Mapping, Inventory)
- **Estimate**: 2.0-2.5 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

#### PROD-002: Units
- **Source**: `product-management/units/DS-units.md` (1,713 lines)
- **Target**: `product-management/units/DD-units.md`
- **Complexity**: Medium (Unit conversions, fractional units)
- **Entities**: 4 (units, conversions, base_units, fractional_units)
- **Integration Points**: 3 (Products, Inventory, Fractional Inventory)
- **Estimate**: 1.5-2.0 hours
- **Dependencies**: None
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025

**Phase 3 Subtotal**: 18.5-26.0 hours

---

## Phase 4: HIGH PRIORITY - Vendor Management (5 NEW documents)
**Priority**: 🔴 HIGH
**Timeline**: Week 3-4 (parallel with Phase 2)
**Total Effort**: 10.0-15.0 hours

⚠️ **IMPORTANT**: These documents must be created from scratch using BR, UC, TS, FD, VAL as references.

#### VENDOR-001: Vendor Directory ⚠️ NEW
- **Source**: None (reference BR, UC, TS, FD, VAL)
- **Target**: `vendor-management/vendor-directory/DD-vendor-directory.md`
- **Complexity**: Medium (Vendor profiles, contacts, certifications)
- **Entities**: 5 (vendors, contacts, certifications, documents, ratings)
- **Integration Points**: 3 (Procurement, Purchase Orders, Price Lists)
- **Estimate**: 2.0-3.0 hours
- **Dependencies**: Review all related documents first
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ **Complete**
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - CREATED FROM schema.prisma
  - 57% schema coverage (tb_vendor, tb_vendor_contact, tb_vendor_address, tb_vendor_business_type)
  - Missing tables defined: certifications, documents, ratings (3 tables)
  - All missing tables marked with ❌ NOT IN SCHEMA
  - Complete field definitions, business rules, implementation roadmap included
  ```

#### VENDOR-002: Price Lists ⚠️ NEW
- **Source**: None (reference BR, UC, TS, FD, VAL)
- **Target**: `vendor-management/price-lists/DD-price-lists.md`
- **Complexity**: Medium (Vendor pricing, validity periods, tiered pricing)
- **Entities**: 4 (price_lists, line_items, validity, tier_pricing)
- **Integration Points**: 3 (Vendors, Products, Purchase Orders)
- **Estimate**: 2.0-3.0 hours
- **Dependencies**: Review all related documents first
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - CREATED FROM schema.prisma
  - 100% schema coverage (tb_pricelist, tb_pricelist_detail)
  - Tiered pricing via JSONB info field
  - Multi-currency support documented
  ```

#### VENDOR-003: Pricelist Templates ⚠️ NEW
- **Source**: None (reference BR, UC, TS, FD, VAL)
- **Target**: `vendor-management/pricelist-templates/DD-pricelist-templates.md`
- **Complexity**: Simple (Template management)
- **Entities**: 2 (templates, template_items)
- **Integration Points**: 1 (Price Lists)
- **Estimate**: 1.5-2.0 hours
- **Dependencies**: Price Lists document
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - CREATED FROM schema.prisma
  - 100% schema coverage (tb_pricelist_template, tb_pricelist_template_detail)
  - Template lifecycle workflow documented
  - Automated reminder system specified
  ```

#### VENDOR-004: Requests for Pricing (RFP) ⚠️ NEW
- **Source**: None (reference BR, UC, TS, FD, VAL)
- **Target**: `vendor-management/requests-for-pricing/DD-requests-for-pricing.md`
- **Complexity**: Medium (RFP workflow, vendor responses, comparison)
- **Entities**: 5 (rfps, line_items, vendor_responses, comparison, awards)
- **Integration Points**: 3 (Vendors, Products, Purchase Orders)
- **Estimate**: 2.5-3.5 hours
- **Dependencies**: Review all related documents first
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ Complete
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - CREATED FROM schema.prisma + JSONB analysis
  - 40% schema coverage (tb_request_for_pricing, tb_request_for_pricing_detail)
  - Vendor responses, comparison, awards stored in JSONB
  - Proposed enhancement tables documented for future
  ```

#### VENDOR-005: Vendor Portal ⚠️ NEW
- **Source**: None (reference BR, UC, TS, FD, VAL)
- **Target**: `vendor-management/vendor-portal/DD-vendor-portal.md`
- **Complexity**: Complex (External portal, vendor access, document exchange, security)
- **Entities**: 7 (portal_users, sessions, registrations, documents, notifications, messages, audit_log)
- **Integration Points**: 4 (Vendors, Purchase Orders, RFPs, Documents)
- **Estimate**: 4.0-5.0 hours
- **Dependencies**: Vendor Directory document
- **Assignee**: Claude Code
- **Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Review | ✅ **Complete**
- **Completion Date**: 11/15/2025
- **Notes**:
  ```
  - CREATED FROM TS-vendor-portal.md (2,760 lines)
  - 0% schema coverage - ALL 7 tables require implementation
  - All tables marked with ❌ NOT IN SCHEMA
  - Complete specifications: 13 enums, 28+ indexes, 10+ JSON structures
  - 50+ validation rules (VAL-VP-XXX-NNN format)
  - Security: encryption, rate limiting, audit trail (7-year retention)
  - Implementation: 3 phases, 24-28 hours total effort
  - Portal architecture: Separate Next.js app, NextAuth.js, shared DB
  ```

**Phase 4 Subtotal**: 10.0-14.5 hours

---

## Quality Assurance Checklist

### Pre-Migration Checklist
- [ ] Read and understand existing DS document
- [ ] Review related BR, UC, TS, FD, VAL documents
- [ ] Identify all entities and relationships
- [ ] Note integration points with other modules
- [ ] Check for special requirements (costing, financial, etc.)

### During Migration Checklist
- [ ] Create DD-{module-name}.md file
- [ ] Update header: "Data Definition: {Module Name}"
- [ ] Preserve all entity definitions and relationships
- [ ] Update terminology: "Data Schema" → "Data Definition"
- [ ] Add "⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY"
- [ ] Update cross-references to related documents
- [ ] Verify all field definitions match TS document
- [ ] Check entity relationship descriptions
- [ ] Validate business process descriptions

### Post-Migration Checklist
- [ ] Compare DD against DS for completeness
- [ ] Verify all entities are documented
- [ ] Check all relationships are described
- [ ] Validate cross-references work
- [ ] Review for consistency with existing DD documents
- [ ] Archive DS file: Rename to DS-{module-name}.md.backup
- [ ] Update module README (if exists)
- [ ] Mark task as complete in this checklist

### New Document Creation Checklist
- [ ] Research from BR, UC, TS, FD, VAL documents
- [ ] Identify all entities from TS document
- [ ] Document entity relationships
- [ ] Describe business processes supported
- [ ] Add integration points
- [ ] Follow DD format from existing examples
- [ ] Peer review before marking complete

---

## Risk Assessment & Mitigation

### High-Risk Items
1. **Currency Management (FIN-002)**: Largest document, complex multi-currency logic
   - **Mitigation**: Allocate senior developer, allow extra time

2. **Recipes (OPPLAN-004)**: Complex BOM and costing logic
   - **Mitigation**: Review with operations team before migration

3. **Store Requisitions (STORE-002)**: Multi-step approval workflow
   - **Mitigation**: Reference workflow documentation

4. **All Vendor Management**: Created from scratch
   - **Mitigation**: Thorough research phase, peer review required

### Medium-Risk Items
1. **Account Code Mapping (FIN-001)**: Multi-dimensional accounting
2. **Department Management (FIN-004)**: ABAC integration complexity
3. **Periodic Average Costing (INV-006)**: New document, costing logic

### Dependencies
- **Sequential Dependencies**: None identified (all tasks can run in parallel)
- **Cross-Module Dependencies**: Documents reference each other but don't block migration
- **Resource Dependencies**: 1 FTE recommended per phase for consistency

---

## Progress Tracking

### Weekly Milestones
- **Week 1**: Finance (4 docs) - Target: 100%
- **Week 2**: System Admin (1 doc) - Target: 100%
- **Week 3**: Operational Planning (4 docs) + Vendor Mgmt (5 docs start) - Target: 50%
- **Week 4**: Store Operations (3 docs) + Vendor Mgmt (5 docs complete) - Target: 100%
- **Week 5**: Inventory (6 docs) - Target: 50%
- **Week 6**: Procurement (3 docs) + Product (2 docs) + Inventory complete - Target: 100%

### Overall Progress Tracker
- **Phase 1 (Finance + SysAdmin)**: ✅ 5/5 complete (100%)
- **Phase 2 (OpPlan + Store)**: ✅ 7/7 complete (100%)
- **Phase 3 (Inv + Proc + Prod)**: ✅ 11/11 complete (100%)
- **Phase 4 (Vendor Mgmt)**: ✅ 5/5 complete (100%)
- **TOTAL PROGRESS**: ✅ **28/28 complete (100%)** 🎉

**PROJECT STATUS**: ✅ **COMPLETE** - All DS→DD migrations and new DD document creations finished on 11/15/2025

### Burn-down Chart (Hours Remaining)
| Week | Target Hours | Actual Hours | Remaining | Status |
|------|--------------|--------------|-----------|--------|
| 1 | 10.5-14.0 | _____ | _____ | _____ |
| 2 | 0 (overflow) | _____ | _____ | _____ |
| 3 | 10.5-14.5 | _____ | _____ | _____ |
| 4 | 10.5-16.0 | _____ | _____ | _____ |
| 5 | 9.0-13.0 | _____ | _____ | _____ |
| 6 | 9.5-13.0 | _____ | _____ | _____ |
| **Total** | **50-70.5** | **_____** | **_____** | **_____** |

---

## Team Assignments

### Recommended Team Structure
- **Lead**: 1 senior developer (oversees quality, complex documents)
- **Developers**: 2-3 mid-level developers (execute migrations)
- **Reviewer**: 1 technical writer or senior dev (QA review)

### Skill Requirements
- Understanding of ERP data models
- Familiarity with hospitality/F&B operations
- Experience with financial accounting concepts
- Strong technical writing skills
- Attention to detail

### Assignment Template
```
Assignee: [Name]
Role: [Lead/Developer/Reviewer]
Allocated Hours: [X] hours/week
Assigned Tasks: [Task IDs]
```

---

## Change Log

| Date | Change | By | Reason |
|------|--------|-------|--------|
| 2025-11-15 | Initial checklist created | Documentation Team | Migration kickoff |
| _____ | _____ | _____ | _____ |

---

## Appendix

### A. Document Format Changes

**DS Format (OLD)**:
```markdown
# Data Schema: {Module Name}

## Module Information
- **Module**: {Module}
- **Sub-Module**: {Submodule}
...
```

**DD Format (NEW)**:
```markdown
# Data Definition: {Module Name}

## Module Information
- **Module**: {Module}
- **Sub-Module**: {Submodule}
...

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- Describes database structures in text format only
- Explains WHAT data is stored, WHY it exists, HOW it relates
- No SQL code, no CREATE TABLE statements
- For visual diagrams, refer to Flow Diagrams document
```

### B. Reference Documents
- [Data Definition Template](./template-guide/DD-template.md)
- [DD Format Example](./inventory-management/inventory-transactions/DD-inventory-transactions.md)
- [Migration Process Guide](./DATA-SCHEMA-MIGRATION-STATUS.md)

### C. Contact Information
- **Project Lead**: _________________
- **Technical Questions**: _________________
- **Review Requests**: _________________

---

**Document Version**: 1.0
**Last Updated**: 2025-11-15
**Next Review**: Weekly during migration period
