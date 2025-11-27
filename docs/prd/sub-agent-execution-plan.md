# Carmen ERP Sub-Agent Documentation Execution Plan

## Overview
Comprehensive execution plan for documenting all modules, screens, and components in the Carmen ERP system using the five specialized sub-agents.

## Execution Strategy
1. **Module-Level Documentation** (Module PRD Agent)
2. **Screen-Level Documentation** (Screen Documentation Agent)  
3. **Functional Specifications** (Functional Spec Agent)
4. **Business Rules Documentation** (Business Rules Agent)
5. **Workflow Documentation** (Workflow Documentation Agent)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## PHASE 1: CORE MODULES (Module PRD Agent)

### 1.1 Primary Business Modules
```bash
# Dashboard Module
Module PRD Agent: module_name="dashboard", business_context="executive_overview"

# Procurement Module  
Module PRD Agent: module_name="procurement", business_context="purchase_lifecycle"

# Inventory Management Module
Module PRD Agent: module_name="inventory-management", business_context="stock_control"

# Vendor Management Module
Module PRD Agent: module_name="vendor-management", business_context="supplier_relations"

# Product Management Module
Module PRD Agent: module_name="product-management", business_context="catalog_management"

# Store Operations Module
Module PRD Agent: module_name="store-operations", business_context="daily_operations"
```

### 1.2 Secondary Modules
```bash
# Finance Module
Module PRD Agent: module_name="finance", business_context="financial_control"

# Operational Planning Module
Module PRD Agent: module_name="operational-planning", business_context="recipe_planning"

# Production Module
Module PRD Agent: module_name="production", business_context="manufacturing"

# Reporting & Analytics Module
Module PRD Agent: module_name="reporting-analytics", business_context="business_intelligence"

# System Administration Module
Module PRD Agent: module_name="system-administration", business_context="system_management"

# Help & Support Module
Module PRD Agent: module_name="help-support", business_context="user_assistance"
```

---

## PHASE 2: CRITICAL SCREENS (Screen Documentation Agent)

### 2.1 Dashboard Screens
```bash
# Main Dashboard
Screen Documentation Agent: screen_path="app/(main)/dashboard/page.tsx", screen_name="Main Dashboard"

# Environment Dashboard
Screen Documentation Agent: screen_path="app/(main)/dashboard/environment-dashboard.tsx", screen_name="Environment Dashboard"
```

### 2.2 Procurement Screens
```bash
# Purchase Requests List
Screen Documentation Agent: screen_path="app/(main)/procurement/purchase-requests/page.tsx", screen_name="Purchase Requests List"

# Purchase Request Detail
Screen Documentation Agent: screen_path="app/(main)/procurement/purchase-requests/[id]/page.tsx", screen_name="Purchase Request Detail"

# Purchase Orders List
Screen Documentation Agent: screen_path="app/(main)/procurement/purchase-orders/page.tsx", screen_name="Purchase Orders List"

# Purchase Order Detail
Screen Documentation Agent: screen_path="app/(main)/procurement/purchase-orders/[id]/page.tsx", screen_name="Purchase Order Detail"

# Goods Received Note List
Screen Documentation Agent: screen_path="app/(main)/procurement/goods-received-note/page.tsx", screen_name="Goods Received Note List"

# Goods Received Note Detail
Screen Documentation Agent: screen_path="app/(main)/procurement/goods-received-note/[id]/page.tsx", screen_name="Goods Received Note Detail"

# Credit Note Management
Screen Documentation Agent: screen_path="app/(main)/procurement/credit-note/page.tsx", screen_name="Credit Note Management"

# My Approvals
Screen Documentation Agent: screen_path="app/(main)/procurement/my-approvals/page.tsx", screen_name="My Approvals Dashboard"

# Vendor Comparison
Screen Documentation Agent: screen_path="app/(main)/procurement/vendor-comparison/page.tsx", screen_name="Vendor Comparison"
```

### 2.3 Inventory Management Screens
```bash
# Inventory Overview
Screen Documentation Agent: screen_path="app/(main)/inventory-management/page.tsx", screen_name="Inventory Management Overview"

# Inventory Adjustments List
Screen Documentation Agent: screen_path="app/(main)/inventory-management/inventory-adjustments/page.tsx", screen_name="Inventory Adjustments List"

# Inventory Adjustment Detail
Screen Documentation Agent: screen_path="app/(main)/inventory-management/inventory-adjustments/[id]/page.tsx", screen_name="Inventory Adjustment Detail"

# Physical Count Dashboard
Screen Documentation Agent: screen_path="app/(main)/inventory-management/physical-count/dashboard/page.tsx", screen_name="Physical Count Dashboard"

# Stock Balance Report
Screen Documentation Agent: screen_path="app/(main)/inventory-management/stock-overview/inventory-balance/page.tsx", screen_name="Stock Balance Report"

# Stock Card Management
Screen Documentation Agent: screen_path="app/(main)/inventory-management/stock-overview/stock-card/page.tsx", screen_name="Stock Card Management"

# Spot Check Dashboard
Screen Documentation Agent: screen_path="app/(main)/inventory-management/spot-check/dashboard/page.tsx", screen_name="Spot Check Dashboard"
```

### 2.4 Vendor Management Screens
```bash
# Vendor Management Overview
Screen Documentation Agent: screen_path="app/(main)/vendor-management/page.tsx", screen_name="Vendor Management Overview"

# Vendor List
Screen Documentation Agent: screen_path="app/(main)/vendor-management/vendors/page.tsx", screen_name="Vendor List"

# Vendor Detail
Screen Documentation Agent: screen_path="app/(main)/vendor-management/vendors/[id]/page.tsx", screen_name="Vendor Detail"

# Manage Vendors
Screen Documentation Agent: screen_path="app/(main)/vendor-management/manage-vendors/page.tsx", screen_name="Manage Vendors"

# Vendor Pricelists
Screen Documentation Agent: screen_path="app/(main)/vendor-management/pricelists/page.tsx", screen_name="Vendor Pricelists"

# Vendor Templates
Screen Documentation Agent: screen_path="app/(main)/vendor-management/templates/page.tsx", screen_name="Vendor Templates"

# Vendor Campaigns
Screen Documentation Agent: screen_path="app/(main)/vendor-management/campaigns/page.tsx", screen_name="Vendor Campaigns"
```

### 2.5 Product Management Screens
```bash
# Product Management Overview
Screen Documentation Agent: screen_path="app/(main)/product-management/page.tsx", screen_name="Product Management Overview"

# Product List
Screen Documentation Agent: screen_path="app/(main)/product-management/products/page.tsx", screen_name="Product List"

# Product Detail
Screen Documentation Agent: screen_path="app/(main)/product-management/products/[id]/page.tsx", screen_name="Product Detail"

# Product Categories
Screen Documentation Agent: screen_path="app/(main)/product-management/categories/page.tsx", screen_name="Product Categories"

# Unit Management
Screen Documentation Agent: screen_path="app/(main)/product-management/units/page.tsx", screen_name="Unit Management"
```

### 2.6 Store Operations Screens
```bash
# Store Operations Overview
Screen Documentation Agent: screen_path="app/(main)/store-operations/page.tsx", screen_name="Store Operations Overview"

# Store Requisitions List
Screen Documentation Agent: screen_path="app/(main)/store-operations/store-requisitions/page.tsx", screen_name="Store Requisitions List"

# Store Requisition Detail
Screen Documentation Agent: screen_path="app/(main)/store-operations/store-requisitions/[id]/page.tsx", screen_name="Store Requisition Detail"

# Stock Replenishment
Screen Documentation Agent: screen_path="app/(main)/store-operations/stock-replenishment/page.tsx", screen_name="Stock Replenishment"

# Wastage Reporting
Screen Documentation Agent: screen_path="app/(main)/store-operations/wastage-reporting/page.tsx", screen_name="Wastage Reporting"
```

### 2.7 System Administration Screens
```bash
# System Administration Overview
Screen Documentation Agent: screen_path="app/(main)/system-administration/page.tsx", screen_name="System Administration Overview"

# User Management
Screen Documentation Agent: screen_path="app/(main)/system-administration/user-management/page.tsx", screen_name="User Management"

# Location Management
Screen Documentation Agent: screen_path="app/(main)/system-administration/location-management/page.tsx", screen_name="Location Management"

# Workflow Configuration
Screen Documentation Agent: screen_path="app/(main)/system-administration/workflow/workflow-configuration/page.tsx", screen_name="Workflow Configuration"

# Role Assignment
Screen Documentation Agent: screen_path="app/(main)/system-administration/workflow/role-assignment/page.tsx", screen_name="Role Assignment"

# System Integrations
Screen Documentation Agent: screen_path="app/(main)/system-administration/system-integrations/page.tsx", screen_name="System Integrations"
```

---

## PHASE 3: CRITICAL COMPONENTS (Functional Spec Agent)

### 3.1 Purchase Request Components
```bash
# PR Form Component
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-requests/components/PRForm.tsx", feature_name="Purchase Request Form"

# PR Detail Page
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-requests/components/PRDetailPage.tsx", feature_name="Purchase Request Detail Page"

# Items Tab
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-requests/components/tabs/ItemsTab.tsx", feature_name="Purchase Request Items Tab"

# Enhanced Items Tab
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-requests/components/tabs/EnhancedItemsTab.tsx", feature_name="Enhanced Purchase Request Items Tab"

# Vendor Comparison Component
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-requests/components/vendor-comparison.tsx", feature_name="Vendor Comparison Component"
```

### 3.2 Purchase Order Components
```bash
# PO Detail Page
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-orders/components/PODetailPage.tsx", feature_name="Purchase Order Detail Page"

# Enhanced Items Tab
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-orders/components/tabs/EnhancedItemsTab.tsx", feature_name="Purchase Order Items Tab"

# General Info Tab
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-orders/components/tabs/GeneralInfoTab.tsx", feature_name="Purchase Order General Info Tab"

# Create PO from PR
Functional Spec Agent: feature_path="app/(main)/procurement/purchase-orders/components/createpofrompr.tsx", feature_name="Create Purchase Order from Purchase Request"
```

### 3.3 Goods Received Note Components
```bash
# GRN Detail Component
Functional Spec Agent: feature_path="app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx", feature_name="Goods Received Note Detail"

# GRN Items Tab
Functional Spec Agent: feature_path="app/(main)/procurement/goods-received-note/components/tabs/GoodsReceiveNoteItems.tsx", feature_name="Goods Received Note Items Tab"

# Item Detail Form
Functional Spec Agent: feature_path="app/(main)/procurement/goods-received-note/components/tabs/itemDetailForm.tsx", feature_name="GRN Item Detail Form"
```

### 3.4 Inventory Management Components
```bash
# Inventory Adjustment Detail
Functional Spec Agent: feature_path="app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx", feature_name="Inventory Adjustment Detail"

# Stock Card Component
Functional Spec Agent: feature_path="app/(main)/inventory-management/stock-overview/stock-card/components/stock-card-client.tsx", feature_name="Stock Card Client Component"

# Balance Table
Functional Spec Agent: feature_path="app/(main)/inventory-management/stock-overview/inventory-balance/components/BalanceTable.tsx", feature_name="Inventory Balance Table"
```

### 3.5 Vendor Management Components
```bash
# Vendor Form
Functional Spec Agent: feature_path="app/(main)/vendor-management/components/VendorForm.tsx", feature_name="Vendor Form Component"

# Vendor Card
Functional Spec Agent: feature_path="app/(main)/vendor-management/components/VendorCard.tsx", feature_name="Vendor Card Component"

# Pricelist Product Editing
Functional Spec Agent: feature_path="app/(main)/vendor-management/pricelists/components/PricelistProductEditingComponent.tsx", feature_name="Pricelist Product Editing Component"
```

---

## PHASE 4: BUSINESS RULES (Business Rules Agent)

### 4.1 Procurement Business Rules
```bash
# Purchase Request Rules
Business Rules Agent: module_name="procurement", focus_domain="purchase_requests", rule_scope="approval_workflows"

# Purchase Order Rules
Business Rules Agent: module_name="procurement", focus_domain="purchase_orders", rule_scope="creation_validation"

# Goods Received Note Rules
Business Rules Agent: module_name="procurement", focus_domain="goods_received_note", rule_scope="stock_movement"

# Vendor Management Rules
Business Rules Agent: module_name="procurement", focus_domain="vendor_management", rule_scope="pricing_validation"
```

### 4.2 Inventory Business Rules
```bash
# Stock Movement Rules
Business Rules Agent: module_name="inventory-management", focus_domain="stock_movements", rule_scope="transaction_validation"

# Inventory Adjustment Rules
Business Rules Agent: module_name="inventory-management", focus_domain="adjustments", rule_scope="approval_thresholds"

# Physical Count Rules
Business Rules Agent: module_name="inventory-management", focus_domain="physical_counts", rule_scope="variance_handling"

# Stock Replenishment Rules
Business Rules Agent: module_name="inventory-management", focus_domain="replenishment", rule_scope="min_max_levels"
```

### 4.3 Financial Business Rules
```bash
# Budget Control Rules
Business Rules Agent: module_name="finance", focus_domain="budget_controls", rule_scope="spending_limits"

# Currency Management Rules
Business Rules Agent: module_name="finance", focus_domain="currency_management", rule_scope="exchange_rates"

# Tax Calculation Rules
Business Rules Agent: module_name="finance", focus_domain="tax_calculations", rule_scope="compliance"
```

### 4.4 User Access Rules
```bash
# Role-Based Access Rules
Business Rules Agent: module_name="system-administration", focus_domain="user_management", rule_scope="role_permissions"

# Workflow Authorization Rules
Business Rules Agent: module_name="system-administration", focus_domain="workflow", rule_scope="approval_authority"

# Data Security Rules
Business Rules Agent: module_name="system-administration", focus_domain="security", rule_scope="data_protection"
```

---

## PHASE 5: WORKFLOW DOCUMENTATION (Workflow Documentation Agent)

### 5.1 Procurement Workflows
```bash
# Purchase Request Workflow
Workflow Documentation Agent: module_name="procurement", workflow_focus="purchase_request_lifecycle", user_role="requestor"

# Purchase Order Workflow
Workflow Documentation Agent: module_name="procurement", workflow_focus="purchase_order_process", user_role="procurement_staff"

# Goods Receipt Workflow
Workflow Documentation Agent: module_name="procurement", workflow_focus="goods_receipt_process", user_role="warehouse_staff"

# Vendor Onboarding Workflow
Workflow Documentation Agent: module_name="vendor-management", workflow_focus="vendor_onboarding", user_role="procurement_manager"
```

### 5.2 Inventory Workflows
```bash
# Stock Adjustment Workflow
Workflow Documentation Agent: module_name="inventory-management", workflow_focus="stock_adjustments", user_role="warehouse_manager"

# Physical Count Workflow
Workflow Documentation Agent: module_name="inventory-management", workflow_focus="physical_counting", user_role="count_supervisor"

# Store Requisition Workflow
Workflow Documentation Agent: module_name="store-operations", workflow_focus="requisition_process", user_role="store_manager"
```

### 5.3 Administrative Workflows
```bash
# User Management Workflow
Workflow Documentation Agent: module_name="system-administration", workflow_focus="user_lifecycle", user_role="system_admin"

# Workflow Configuration Workflow
Workflow Documentation Agent: module_name="system-administration", workflow_focus="workflow_setup", user_role="business_analyst"

# System Integration Workflow
Workflow Documentation Agent: module_name="system-administration", workflow_focus="integration_setup", user_role="technical_admin"
```

---

## EXECUTION SCHEDULE

### Week 1-2: Core Module PRDs
- Execute all Module PRD Agent tasks for primary business modules
- Review and validate module-level documentation

### Week 3-4: Critical Screen Documentation  
- Execute Screen Documentation Agent for high-priority screens
- Focus on user-facing interfaces and workflows

### Week 5-6: Functional Specifications
- Execute Functional Spec Agent for core components
- Document detailed functional requirements and testing criteria

### Week 7-8: Business Rules Documentation
- Execute Business Rules Agent for all business domains
- Ensure complete coverage of operational constraints

### Week 9-10: Workflow Documentation
- Execute Workflow Documentation Agent for all major processes
- Complete end-to-end process documentation

### Week 11-12: Review and Integration
- Cross-reference all documentation for consistency
- Create master index and navigation structure
- Final review and approval process

## OUTPUT ORGANIZATION

All documentation will be organized in:
```
docs/prd/output/
├── modules/           # Module PRD outputs
├── screens/           # Screen documentation outputs  
├── functions/         # Functional specification outputs
├── rules/             # Business rules outputs
├── workflows/         # Workflow documentation outputs
└── index.md          # Master documentation index
```

## SUCCESS METRICS

- **Coverage**: 100% of identified modules, screens, and components documented
- **Quality**: All documentation passes review checklist validation
- **Traceability**: Every documented feature verifiable in source code
- **Usability**: Documentation serves as effective training and reference material
- **Consistency**: Unified structure and language across all documents

This execution plan ensures comprehensive documentation coverage while maintaining quality and consistency across all Carmen ERP system components.