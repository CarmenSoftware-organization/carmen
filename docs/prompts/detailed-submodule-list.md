# Carmen ERP - Detailed Submodule Documentation

## Overview
This document provides a comprehensive breakdown of all modules, submodules, pages, and routes in the Carmen ERP system.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Dashboard
**Path:** `/dashboard`
**Icon:** LayoutDashboard

### Pages:
- Main Dashboard - `/dashboard`

### Components:
- Custom dashboard components

---

## 2. Procurement Module
**Path:** `/procurement`
**Icon:** ShoppingCart

### 2.1 My Approvals
**Path:** `/procurement/my-approvals`

#### Pages:
- Approval List - `/procurement/my-approvals`

### 2.2 Purchase Requests
**Path:** `/procurement/purchase-requests`

#### Pages:
- Purchase Request List - `/procurement/purchase-requests`
- Purchase Request Detail - `/procurement/purchase-requests/[id]`
- New Purchase Request - `/procurement/purchase-requests/new-pr`
- Enhanced Demo - `/procurement/purchase-requests/enhanced-demo`

#### Components:
- Custom PR components
- Services layer

### 2.3 Purchase Orders
**Path:** `/procurement/purchase-orders`

#### Pages:
- Purchase Order List - `/procurement/purchase-orders`
- Purchase Order Detail - `/procurement/purchase-orders/[id]`
- Edit Purchase Order - `/procurement/purchase-orders/[id]/edit`
- Create Purchase Order - `/procurement/purchase-orders/create`
- Create from PR - `/procurement/purchase-orders/create/from-pr`
- Bulk Creation - `/procurement/purchase-orders/create/bulk`

#### Components:
- Custom PO components

### 2.4 Goods Received Note (GRN)
**Path:** `/procurement/goods-received-note`

#### Pages:
- GRN List - `/procurement/goods-received-note`
- GRN Detail - `/procurement/goods-received-note/[id]`
- Edit GRN - `/procurement/goods-received-note/[id]/edit`
- Create GRN - `/procurement/goods-received-note/create`

#### GRN Creation Workflow:
- Vendor Selection - `/procurement/goods-received-note/new/vendor-selection`
- PO Selection - `/procurement/goods-received-note/new/po-selection`
- Manual Entry - `/procurement/goods-received-note/new/manual-entry`
- Item Location Selection - `/procurement/goods-received-note/new/item-location-selection`

#### Components:
- Custom GRN components

### 2.5 Credit Notes
**Path:** `/procurement/credit-note`

#### Pages:
- Credit Note List - `/procurement/credit-note`
- Credit Note Detail - `/procurement/credit-note/[id]`
- New Credit Note - `/procurement/credit-note/new`

#### Components:
- Custom credit note components

### 2.6 Purchase Request Templates
**Path:** `/procurement/purchase-request-templates`

#### Pages:
- Template List - `/procurement/purchase-request-templates`
- Template Detail - `/procurement/purchase-request-templates/[id]`

#### Components:
- Template components
- Type definitions

### 2.7 Vendor Comparison
**Path:** `/procurement/vendor-comparison`

#### Pages:
- Vendor Comparison Tool - `/procurement/vendor-comparison`

---

## 3. Product Management Module
**Path:** `/product-management`
**Icon:** Package

### 3.1 Products
**Path:** `/product-management/products`

#### Pages:
- Product List - `/product-management/products`
- Product Detail - `/product-management/products/[id]`

#### Components:
- Product components
- Mock data

### 3.2 Categories
**Path:** `/product-management/categories`

#### Pages:
- Category List - `/product-management/categories`

#### Components:
- Category components

### 3.3 Units
**Path:** `/product-management/units`

#### Pages:
- Unit List - `/product-management/units`

#### Components:
- Unit components
- Mock data
- Custom hooks

### 3.4 Reports
**Path:** `/product-management/reports`

#### Pages:
- Product Reports - `/product-management/reports`

---

## 4. Vendor Management Module
**Path:** `/vendor-management`
**Icon:** Users

### 4.1 Vendor Directory (Manage Vendors)
**Path:** `/vendor-management/manage-vendors`
**Icon:** Users

#### Pages:
- Vendor List - `/vendor-management/manage-vendors`
- Vendor Detail - `/vendor-management/manage-vendors/[id]`
- New Vendor - `/vendor-management/manage-vendors/new`

#### Components:
- Vendor components
- Mock data

### 4.2 Vendors (Alternative Path)
**Path:** `/vendor-management/vendors`

#### Pages:
- Vendor List - `/vendor-management/vendors`
- Vendor Detail - `/vendor-management/vendors/[id]`
- Edit Vendor - `/vendor-management/vendors/[id]/edit`
- Vendor Pricelist Settings - `/vendor-management/vendors/[id]/pricelist-settings`
- New Vendor - `/vendor-management/vendors/new`

### 4.3 Pricelist Templates
**Path:** `/vendor-management/templates`
**Icon:** FileText

#### Pages:
- Template List - `/vendor-management/templates`
- Template Detail - `/vendor-management/templates/[id]`
- Edit Template - `/vendor-management/templates/[id]/edit`
- New Template - `/vendor-management/templates/new`

#### Components:
- Template components
- Template library

### 4.4 Requests for Pricing (Campaigns)
**Path:** `/vendor-management/campaigns`
**Icon:** Mail

#### Pages:
- Campaign List - `/vendor-management/campaigns`
- Campaign Detail - `/vendor-management/campaigns/[id]`
- New Campaign - `/vendor-management/campaigns/new`

### 4.5 Price Lists
**Path:** `/vendor-management/pricelists`
**Icon:** ListChecks

#### Pages:
- Pricelist List - `/vendor-management/pricelists`
- Pricelist Detail - `/vendor-management/pricelists/[id]`
- Edit Pricelist - `/vendor-management/pricelists/[id]/edit`
- Edit Pricelist (New) - `/vendor-management/pricelists/[id]/edit-new`
- Add Pricelist - `/vendor-management/pricelists/add`
- New Pricelist - `/vendor-management/pricelists/new`

#### Components:
- Pricelist components
- Type definitions
- Utilities

### 4.6 Vendor Entry Portal
**Path:** `/vendor-management/vendor-portal/sample`
**Icon:** ExternalLink
**Description:** Simple vendor price entry interface

#### Pages:
- Vendor Portal - `/vendor-management/vendor-portal/sample`

### Shared Components:
- Vendor management shared components
- Type definitions
- Service libraries
- Migration utilities

---

## 5. Store Operations Module
**Path:** `/store-operations`
**Icon:** Store

### 5.1 Store Requisitions
**Path:** `/store-operations/store-requisitions`

#### Pages:
- Requisition List - `/store-operations/store-requisitions`
- Requisition Detail - `/store-operations/store-requisitions/[id]`

#### Components:
- Requisition components
- Type definitions

### 5.2 Stock Replenishment
**Path:** `/store-operations/stock-replenishment`

#### Pages:
- Stock Replenishment - `/store-operations/stock-replenishment`

### 5.3 Wastage Reporting
**Path:** `/store-operations/wastage-reporting`

#### Pages:
- Wastage Reports - `/store-operations/wastage-reporting`

### Shared Components:
- Store operations shared components

---

## 6. Inventory Management Module
**Path:** `/inventory-management`
**Icon:** Package

### 6.1 Stock Overview
**Path:** `/inventory-management/stock-overview`

#### Subpages:
- Overview Dashboard - `/inventory-management/stock-overview`
- **Inventory Balance** - `/inventory-management/stock-overview/inventory-balance`
- **Stock Cards** - `/inventory-management/stock-overview/stock-cards`
- **Stock Card (Single)** - `/inventory-management/stock-overview/stock-card`
- **Slow Moving Items** - `/inventory-management/stock-overview/slow-moving`
- **Inventory Aging** - `/inventory-management/stock-overview/inventory-aging`

### 6.2 Inventory Adjustments
**Path:** `/inventory-management/inventory-adjustments`

#### Pages:
- Adjustment List - `/inventory-management/inventory-adjustments`
- Adjustment Detail - `/inventory-management/inventory-adjustments/[id]`

#### Components:
- Adjustment components

### 6.3 Spot Check
**Path:** `/inventory-management/spot-check`

#### Pages:
- Spot Check Main - `/inventory-management/spot-check`
- Spot Check Dashboard - `/inventory-management/spot-check/dashboard`
- New Spot Check - `/inventory-management/spot-check/new`
- Active Spot Checks - `/inventory-management/spot-check/active`
- Active Spot Check Detail - `/inventory-management/spot-check/active/[id]`
- Completed Spot Checks - `/inventory-management/spot-check/completed`
- Completed Spot Check Detail - `/inventory-management/spot-check/completed/[id]`

#### Components:
- Spot check components

### 6.4 Physical Count
**Path:** `/inventory-management/physical-count`

#### Pages:
- Physical Count Main - `/inventory-management/physical-count`
- Physical Count Dashboard - `/inventory-management/physical-count/dashboard`
- Active Physical Count Detail - `/inventory-management/physical-count/active/[id]`

#### Components:
- Physical count components

### 6.5 Physical Count Management
**Path:** `/inventory-management/physical-count-management`

#### Pages:
- Physical Count Management - `/inventory-management/physical-count-management`

#### Components:
- Management components

### 6.6 Period End
**Path:** `/inventory-management/period-end`

#### Pages:
- Period End List - `/inventory-management/period-end`
- Period End Detail - `/inventory-management/period-end/[id]`

### 6.7 Fractional Inventory
**Path:** `/inventory-management/fractional-inventory`

#### Pages:
- Fractional Inventory - `/inventory-management/fractional-inventory`

#### Components:
- Fractional inventory components

### 6.8 Stock In
**Path:** `/inventory-management/stock-in`

#### Pages:
- Stock In - `/inventory-management/stock-in`

### Shared Components:
- Inventory management shared components

---

## 7. Operational Planning Module
**Path:** `/operational-planning`
**Icon:** CalendarClock

### 7.1 Recipe Management
**Path:** `/operational-planning/recipe-management`

#### 7.1.1 Recipe Library
**Path:** `/operational-planning/recipe-management/recipes`

##### Pages:
- Recipe List - `/operational-planning/recipe-management/recipes`
- Recipe Detail - `/operational-planning/recipe-management/recipes/[id]`
- Edit Recipe - `/operational-planning/recipe-management/recipes/[id]/edit`
- Create Recipe - `/operational-planning/recipe-management/recipes/create`
- New Recipe - `/operational-planning/recipe-management/recipes/new`

#### 7.1.2 Categories
**Path:** `/operational-planning/recipe-management/categories`

##### Pages:
- Recipe Categories - `/operational-planning/recipe-management/categories`

#### 7.1.3 Cuisine Types
**Path:** `/operational-planning/recipe-management/cuisine-types`

##### Pages:
- Cuisine Types - `/operational-planning/recipe-management/cuisine-types`

### 7.2 Menu Engineering
**Path:** `/operational-planning/menu-engineering`

#### Pages:
- Menu Engineering - `/operational-planning/menu-engineering`

#### Components:
- Menu engineering components

### 7.3 Demand Forecasting
**Path:** `/operational-planning/demand-forecasting`

#### Pages:
- Demand Forecasting - `/operational-planning/demand-forecasting`

### 7.4 Inventory Planning
**Path:** `/operational-planning/inventory-planning`

#### Pages:
- Inventory Planning - `/operational-planning/inventory-planning`

---

## 8. Production Module
**Path:** `/production`
**Icon:** Factory

### 8.1 Recipe Execution
**Path:** `/production/recipe-execution`

#### Pages:
- Recipe Execution - `/production/recipe-execution`

### 8.2 Batch Production
**Path:** `/production/batch-production`

#### Pages:
- Batch Production - `/production/batch-production`

### 8.3 Wastage Tracking
**Path:** `/production/wastage-tracking`

#### Pages:
- Wastage Tracking - `/production/wastage-tracking`

### 8.4 Quality Control
**Path:** `/production/quality-control`

#### Pages:
- Quality Control - `/production/quality-control`

---

## 9. Reporting & Analytics Module
**Path:** `/reporting-analytics`
**Icon:** BarChart2

### 9.1 Operational Reports
**Path:** `/reporting-analytics/operational-reports`

#### Pages:
- Operational Reports - `/reporting-analytics/operational-reports`

### 9.2 Financial Reports
**Path:** `/reporting-analytics/financial-reports`

#### Pages:
- Financial Reports - `/reporting-analytics/financial-reports`

### 9.3 Inventory Reports
**Path:** `/reporting-analytics/inventory-reports`

#### Pages:
- Inventory Reports - `/reporting-analytics/inventory-reports`

### 9.4 Vendor Performance
**Path:** `/reporting-analytics/vendor-performance`

#### Pages:
- Vendor Performance - `/reporting-analytics/vendor-performance`

### 9.5 Cost Analysis
**Path:** `/reporting-analytics/cost-analysis`

#### Pages:
- Cost Analysis - `/reporting-analytics/cost-analysis`

### 9.6 Sales Analysis
**Path:** `/reporting-analytics/sales-analysis`

#### Pages:
- Sales Analysis - `/reporting-analytics/sales-analysis`

### 9.7 Consumption Analytics
**Path:** `/reporting-analytics/consumption-analytics`

#### Pages:
- Consumption Analytics - `/reporting-analytics/consumption-analytics`

#### Components:
- Analytics components

---

## 10. Finance Module
**Path:** `/finance`
**Icon:** DollarSign

### 10.1 Account Code Mapping
**Path:** `/finance/account-code-mapping`

#### Pages:
- Account Code Mapping - `/finance/account-code-mapping`

### 10.2 Currency Management
**Path:** `/finance/currency-management`

#### Pages:
- Currency Management - `/finance/currency-management`

### 10.3 Exchange Rates
**Path:** `/finance/exchange-rates`

#### Pages:
- Exchange Rates - `/finance/exchange-rates`

### 10.4 Department and Cost Center
**Path:** `/finance/department-list`

#### Pages:
- Department List - `/finance/department-list`

#### Components:
- Department components

### 10.5 Budget Planning and Control
**Path:** `/finance/budget-planning-and-control`

#### Pages:
- Budget Planning - `/finance/budget-planning-and-control`

---

## 11. System Administration Module
**Path:** `/system-administration`
**Icon:** Settings

### 11.1 User Management
**Path:** `/system-administration/user-management`

#### Pages:
- User List - `/system-administration/user-management`
- User Detail - `/system-administration/user-management/[id]`

#### Components:
- User management components

### 11.2 User Dashboard
**Path:** `/system-administration/user-dashboard`

#### Pages:
- User Dashboard - `/system-administration/user-dashboard`

### 11.3 Location Management
**Path:** `/system-administration/location-management`

#### Pages:
- Location List - `/system-administration/location-management`
- Location Detail (View) - `/system-administration/location-management/[id]/view`
- Location Detail (Edit) - `/system-administration/location-management/[id]/edit`
- New Location - `/system-administration/location-management/new`

#### Components:
- Location components
- Mock data

### 11.4 Workflow Management
**Path:** `/system-administration/workflow`

#### Pages:
- Workflow Main - `/system-administration/workflow`

#### 11.4.1 Workflow Configuration
**Path:** `/system-administration/workflow/workflow-configuration`

##### Pages:
- Workflow Configuration List - `/system-administration/workflow/workflow-configuration`
- Workflow Detail - `/system-administration/workflow/workflow-configuration/[id]`

#### 11.4.2 Role Assignment
**Path:** `/system-administration/workflow/role-assignment`

##### Pages:
- Role Assignment - `/system-administration/workflow/role-assignment`

### 11.5 Permission Management
**Path:** `/system-administration/permission-management`

#### Pages:
- Permission Management Dashboard - `/system-administration/permission-management`

#### Components:
- Permission management shared components

#### 11.5.1 Policy Management
**Path:** `/system-administration/permission-management/policies`
**Icon:** FileText

##### Pages:
- Policy List - `/system-administration/permission-management/policies`
- Policy Detail - `/system-administration/permission-management/policies/[id]`
- Edit Policy - `/system-administration/permission-management/policies/[id]/edit`
- Policy Builder - `/system-administration/permission-management/policies/builder`
- Policy Demo - `/system-administration/permission-management/policies/demo`
- Simple Policy - `/system-administration/permission-management/policies/simple`

#### 11.5.2 Role Management
**Path:** `/system-administration/permission-management/roles`
**Icon:** Users

##### Pages:
- Role List - `/system-administration/permission-management/roles`
- Role Detail - `/system-administration/permission-management/roles/[id]`
- Edit Role - `/system-administration/permission-management/roles/edit/[id]`
- New Role - `/system-administration/permission-management/roles/new`

#### 11.5.3 Subscription Settings
**Path:** `/system-administration/permission-management/subscription`
**Icon:** CreditCard

##### Pages:
- Subscription Settings - `/system-administration/permission-management/subscription`
- Subscriptions - `/system-administration/permission-management/subscriptions`

### 11.6 Certifications
**Path:** `/system-administration/certifications`

#### Pages:
- Certification List - `/system-administration/certifications`
- Certification Detail - `/system-administration/certifications/[id]`
- Edit Certification - `/system-administration/certifications/[id]/edit`
- Create Certification - `/system-administration/certifications/create`

### 11.7 Business Rules
**Path:** `/system-administration/business-rules`

#### Pages:
- Business Rules - `/system-administration/business-rules`

#### 11.7.1 Compliance Monitoring
**Path:** `/system-administration/business-rules/compliance-monitoring`

##### Pages:
- Compliance Monitoring - `/system-administration/business-rules/compliance-monitoring`

### 11.8 Monitoring
**Path:** `/system-administration/monitoring`

#### Pages:
- System Monitoring - `/system-administration/monitoring`

### 11.9 Account Code Mapping
**Path:** `/system-administration/account-code-mapping`

#### Pages:
- Account Code Mapping - `/system-administration/account-code-mapping`

### 11.10 General Settings
**Path:** `/system-administration/general-settings`

#### Pages:
- General Settings - `/system-administration/general-settings`

### 11.11 Notification Preferences
**Path:** `/system-administration/notification-preferences`

#### Pages:
- Notification Preferences - `/system-administration/notification-preferences`

### 11.12 License Management
**Path:** `/system-administration/license-management`

#### Pages:
- License Management - `/system-administration/license-management`

### 11.13 Data Backup and Recovery
**Path:** `/system-administration/data-backup-and-recovery`

#### Pages:
- Data Backup - `/system-administration/data-backup-and-recovery`

### 11.14 System Integrations
**Path:** `/system-administration/system-integrations`

#### Pages:
- System Integrations - `/system-administration/system-integrations`

#### 11.14.1 POS Integration
**Path:** `/system-administration/system-integrations/pos`

##### Main Pages:
- POS Dashboard - `/system-administration/system-integrations/pos`
- POS Transactions - `/system-administration/system-integrations/pos/transactions`

##### Mapping
**Path:** `/system-administration/system-integrations/pos/mapping`

###### Pages:
- Recipe Mapping - `/system-administration/system-integrations/pos/mapping/recipes`
- Fractional Variants - `/system-administration/system-integrations/pos/mapping/recipes/fractional-variants`
- Location Mapping - `/system-administration/system-integrations/pos/mapping/locations`
- Unit Mapping - `/system-administration/system-integrations/pos/mapping/units`

##### Reports
**Path:** `/system-administration/system-integrations/pos/reports`

###### Pages:
- Reports Dashboard - `/system-administration/system-integrations/pos/reports`
- Consumption Reports - `/system-administration/system-integrations/pos/reports/consumption`
- Gross Profit Reports - `/system-administration/system-integrations/pos/reports/gross-profit`

##### Settings
**Path:** `/system-administration/system-integrations/pos/settings`

###### Pages:
- Settings Dashboard - `/system-administration/system-integrations/pos/settings`
- Config Settings - `/system-administration/system-integrations/pos/settings/config`
- System Settings - `/system-administration/system-integrations/pos/settings/system`

---

## 12. Help & Support Module
**Path:** `/help-support`
**Icon:** HelpCircle

### 12.1 User Manuals
**Path:** `/help-support/user-manuals`

#### Pages:
- User Manuals - `/help-support/user-manuals`

### 12.2 Video Tutorials
**Path:** `/help-support/video-tutorials`

#### Pages:
- Video Tutorials - `/help-support/video-tutorials`

### 12.3 FAQs
**Path:** `/help-support/faqs`

#### Pages:
- FAQs - `/help-support/faqs`

### 12.4 Support Ticket System
**Path:** `/help-support/support-ticket-system`

#### Pages:
- Support Tickets - `/help-support/support-ticket-system`

### 12.5 System Updates and Release Notes
**Path:** `/help-support/system-updates-and-release-notes`

#### Pages:
- Release Notes - `/help-support/system-updates-and-release-notes`

---

## 13. Security Module
**Path:** `/security`

### 13.1 ABAC (Attribute-Based Access Control)
**Path:** `/security/abac`

#### Pages:
- ABAC Dashboard - `/security/abac`

---

## 14. Style Guide
**Path:** `/style-guide`
**Icon:** Palette

### Pages:
- Style Guide - `/style-guide`

---

## 15. Edit Profile
**Path:** `/edit-profile`

### Pages:
- Edit Profile - `/edit-profile`

---

## Module Statistics

### Total Counts:
- **Main Modules:** 15
- **Submodules (Level 1):** 68
- **Submodules (Level 2):** 23
- **Submodules (Level 3):** 6
- **Total Pages:** 200+

### Pages by Module:
1. Dashboard: 1 page
2. Procurement: 28 pages
3. Product Management: 7 pages
4. Vendor Management: 30 pages
5. Store Operations: 4 pages
6. Inventory Management: 20 pages
7. Operational Planning: 11 pages
8. Production: 4 pages
9. Reporting & Analytics: 7 pages
10. Finance: 5 pages
11. System Administration: 70+ pages
12. Help & Support: 5 pages
13. Security: 1 page
14. Style Guide: 1 page
15. Edit Profile: 1 page

### Most Complex Modules (by page count):
1. **System Administration** - 70+ pages (most complex)
2. **Vendor Management** - 30 pages
3. **Procurement** - 28 pages
4. **Inventory Management** - 20 pages
5. **Operational Planning** - 11 pages

### Module Features:

#### CRUD Operations:
- Most modules support full CRUD (Create, Read, Update, Delete)
- List views with filtering and sorting
- Detail views with comprehensive information
- Edit forms with validation
- Creation workflows (simple and multi-step)

#### Multi-Step Workflows:
- GRN Creation (4-step workflow)
- Physical Count (dashboard → active → completed)
- Spot Check (dashboard → new → active → completed)
- POS Integration (mapping → transactions → reports → settings)

#### Nested Hierarchies:
- Stock Overview (6 sub-pages)
- Recipe Management (3 sub-sections)
- POS Integration (12+ sub-pages across 4 sections)
- Permission Management (3 sub-sections)

---

## Route Patterns

### Dynamic Routes:
- `[id]` - Single item detail pages
- `[subItem]` - Template pages for modules

### Common Page Types:
1. **List Pages** - Display collections with filters/search
2. **Detail Pages** - Show single item information
3. **Edit Pages** - Modify existing items
4. **New/Create Pages** - Create new items
5. **Dashboard Pages** - Overview and analytics
6. **Settings Pages** - Configuration interfaces

### Layout Patterns:
- Module layouts (e.g., `spot-check/layout.tsx`)
- Section layouts (e.g., `pos/layout.tsx`)
- Nested layouts for complex workflows

---

## Component Architecture

### Shared Components:
- Most modules have dedicated component folders
- Reusable components for lists, forms, cards
- Type definitions for type safety
- Mock data for development

### Data Layer:
- Mock data files for testing
- Type definitions in TypeScript
- Service layers for business logic
- Utility functions for common operations

### Custom Hooks:
- Product Management Units module
- Custom hooks for data fetching and state management

---

## Notes

### Template Pages:
Several modules use `[subItem]` dynamic routes as template pages:
- `/finance/[subItem]`
- `/procurement/[subItem]`
- `/inventory-management/[subItem]`
- `/operational-planning/[subItem]`
- `/product-management/[subItem]`
- `/production/[subItem]`
- `/reporting-analytics/[subItem]`
- `/store-operations/[subItem]`
- `/system-administration/[subItem]`
- `/vendor-management/[subItem]`

### Duplicate/Alternative Paths:
Some functionality is accessible through multiple paths:
- Account Code Mapping: `/finance/account-code-mapping` AND `/system-administration/account-code-mapping`
- Vendor Management: `/vendor-management/manage-vendors` AND `/vendor-management/vendors`
- System Integration: `/system-administration/system-integration` AND `/system-administration/system-integrations`

### Incomplete Modules:
Some modules have placeholder pages that may not be fully implemented:
- Production (all submodules appear to use templates)
- Reporting & Analytics (some submodules)
- Finance (Budget Planning and Control)
