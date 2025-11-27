#!/usr/bin/env node
/**
 * Wiki.js Navigation Update - Add Vendor Management Documentation
 *
 * Extends the existing navigation structure to include links to the
 * imported vendor management documentation pages.
 *
 * Usage: node update-navigation-with-vendor-docs.js
 */

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

// Complete navigation structure with Vendor Management Documentation
const navigationItems = [
  // 1. Dashboard
  {
    id: 'dashboard',
    kind: 'header',
    label: 'Dashboard',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 2. Procurement
  {
    id: 'procurement',
    kind: 'header',
    label: 'Procurement',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'procurement-my-approvals',
    kind: 'link',
    label: 'My Approvals',
    icon: '',
    targetType: 'page',
    target: '/en/procurement/my-approvals',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'procurement-purchase-requests',
    kind: 'link',
    label: 'Purchase Requests',
    icon: '',
    targetType: 'page',
    target: '/en/procurement/purchase-requests',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'procurement-purchase-orders',
    kind: 'link',
    label: 'Purchase Orders',
    icon: '',
    targetType: 'page',
    target: '/en/procurement/purchase-orders',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'procurement-goods-received-note',
    kind: 'link',
    label: 'Goods Received Note',
    icon: '',
    targetType: 'page',
    target: '/en/procurement/goods-received-note',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'procurement-credit-notes',
    kind: 'link',
    label: 'Credit Notes',
    icon: '',
    targetType: 'page',
    target: '/en/procurement/credit-notes',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'procurement-purchase-request-templates',
    kind: 'link',
    label: 'Purchase Request Templates',
    icon: '',
    targetType: 'page',
    target: '/en/procurement/purchase-request-templates',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 3. Product Management
  {
    id: 'product-management',
    kind: 'header',
    label: 'Product Management',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'product-management-products',
    kind: 'link',
    label: 'Products',
    icon: '',
    targetType: 'page',
    target: '/en/product-management/products',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'product-management-categories',
    kind: 'link',
    label: 'Categories',
    icon: '',
    targetType: 'page',
    target: '/en/product-management/categories',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'product-management-units',
    kind: 'link',
    label: 'Units',
    icon: '',
    targetType: 'page',
    target: '/en/product-management/units',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'product-management-reports',
    kind: 'link',
    label: 'Reports',
    icon: '',
    targetType: 'page',
    target: '/en/product-management/reports',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 4. Vendor Management
  {
    id: 'vendor-management',
    kind: 'header',
    label: 'Vendor Management',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-vendor-directory',
    kind: 'link',
    label: 'Vendor Directory',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-directory',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-pricelist-templates',
    kind: 'link',
    label: 'Pricelist Templates',
    icon: '',
    targetType: 'page',
    target: '/en/pricelist-templates',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-requests-for-pricing',
    kind: 'link',
    label: 'Requests for Pricing',
    icon: '',
    targetType: 'page',
    target: '/en/requests-for-pricing',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-price-lists',
    kind: 'link',
    label: 'Price Lists',
    icon: '',
    targetType: 'page',
    target: '/en/price-lists',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-vendor-portal',
    kind: 'link',
    label: 'Vendor Portal',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-portal',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-vendor-entry',
    kind: 'link',
    label: 'Vendor Entry',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-management/vendor-entry',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 4.1 Vendor Management - Documentation
  {
    id: 'vendor-management-docs',
    kind: 'header',
    label: 'Vendor Management Documentation',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-overview',
    kind: 'link',
    label: 'Module Overview',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-management-overview',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-architecture',
    kind: 'link',
    label: 'Architecture & Redesign',
    icon: '',
    targetType: 'page',
    target: '/en/arc-2025-001-vendor-management-redesign',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-analysis',
    kind: 'link',
    label: 'Vendor Portal Analysis',
    icon: '',
    targetType: 'page',
    target: '/en/analysis-vendor-portal-vs-existing-modules',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-change-history',
    kind: 'link',
    label: 'Change History',
    icon: '',
    targetType: 'page',
    target: '/en/change-history',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-doc-status',
    kind: 'link',
    label: 'Documentation Status',
    icon: '',
    targetType: 'page',
    target: '/en/documentation-status',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // Vendor Directory Docs
  {
    id: 'vendor-docs-directory-header',
    kind: 'header',
    label: 'Vendor Directory Docs',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-directory-br',
    kind: 'link',
    label: 'Business Requirements',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-directory/br-vendor-directory',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-directory-ts',
    kind: 'link',
    label: 'Technical Specification',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-directory/ts-vendor-directory',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-directory-dd',
    kind: 'link',
    label: 'Data Dictionary',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-directory/dd-vendor-directory',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // Pricelist Templates Docs
  {
    id: 'vendor-docs-templates-header',
    kind: 'header',
    label: 'Pricelist Templates Docs',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-templates-br',
    kind: 'link',
    label: 'Business Requirements',
    icon: '',
    targetType: 'page',
    target: '/en/pricelist-templates/br-pricelist-templates',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-templates-ts',
    kind: 'link',
    label: 'Technical Specification',
    icon: '',
    targetType: 'page',
    target: '/en/pricelist-templates/ts-pricelist-templates',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-templates-dd',
    kind: 'link',
    label: 'Data Dictionary',
    icon: '',
    targetType: 'page',
    target: '/en/pricelist-templates/dd-pricelist-templates',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // Price Lists Docs
  {
    id: 'vendor-docs-pricelists-header',
    kind: 'header',
    label: 'Price Lists Docs',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-pricelists-br',
    kind: 'link',
    label: 'Business Requirements',
    icon: '',
    targetType: 'page',
    target: '/en/price-lists/br-price-lists',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-pricelists-ts',
    kind: 'link',
    label: 'Technical Specification',
    icon: '',
    targetType: 'page',
    target: '/en/price-lists/ts-price-lists',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-pricelists-dd',
    kind: 'link',
    label: 'Data Dictionary',
    icon: '',
    targetType: 'page',
    target: '/en/price-lists/dd-price-lists',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // Requests for Pricing Docs
  {
    id: 'vendor-docs-rfp-header',
    kind: 'header',
    label: 'Requests for Pricing Docs',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-rfp-br',
    kind: 'link',
    label: 'Business Requirements',
    icon: '',
    targetType: 'page',
    target: '/en/requests-for-pricing/br-requests-for-pricing',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-rfp-ts',
    kind: 'link',
    label: 'Technical Specification',
    icon: '',
    targetType: 'page',
    target: '/en/requests-for-pricing/ts-requests-for-pricing',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-rfp-dd',
    kind: 'link',
    label: 'Data Dictionary',
    icon: '',
    targetType: 'page',
    target: '/en/requests-for-pricing/dd-requests-for-pricing',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // Vendor Portal Docs
  {
    id: 'vendor-docs-portal-header',
    kind: 'header',
    label: 'Vendor Portal Docs',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-portal-br',
    kind: 'link',
    label: 'Business Requirements',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-portal/br-vendor-portal',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-portal-ts',
    kind: 'link',
    label: 'Technical Specification',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-portal/ts-vendor-portal',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-docs-portal-dd',
    kind: 'link',
    label: 'Data Dictionary',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-portal/dd-vendor-portal',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 5. Store Operations
  {
    id: 'store-operations',
    kind: 'header',
    label: 'Store Operations',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'store-operations-store-requisitions',
    kind: 'link',
    label: 'Store Requisitions',
    icon: '',
    targetType: 'page',
    target: '/en/store-operations/store-requisitions',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'store-operations-stock-replenishment',
    kind: 'link',
    label: 'Stock Replenishment',
    icon: '',
    targetType: 'page',
    target: '/en/store-operations/stock-replenishment',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'store-operations-wastage-reporting',
    kind: 'link',
    label: 'Wastage Reporting',
    icon: '',
    targetType: 'page',
    target: '/en/store-operations/wastage-reporting',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 6. Inventory Management
  {
    id: 'inventory-management',
    kind: 'header',
    label: 'Inventory Management',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'inventory-management-stock-overview',
    kind: 'link',
    label: 'Stock Overview',
    icon: '',
    targetType: 'page',
    target: '/en/inventory-management/stock-overview',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'inventory-management-inventory-adjustments',
    kind: 'link',
    label: 'Inventory Adjustments',
    icon: '',
    targetType: 'page',
    target: '/en/inventory-management/inventory-adjustments',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'inventory-management-spot-check',
    kind: 'link',
    label: 'Spot Check',
    icon: '',
    targetType: 'page',
    target: '/en/inventory-management/spot-check',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'inventory-management-physical-count',
    kind: 'link',
    label: 'Physical Count',
    icon: '',
    targetType: 'page',
    target: '/en/inventory-management/physical-count',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'inventory-management-period-end',
    kind: 'link',
    label: 'Period End',
    icon: '',
    targetType: 'page',
    target: '/en/inventory-management/period-end',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'inventory-management-transactions',
    kind: 'link',
    label: 'Inventory Transactions',
    icon: '',
    targetType: 'page',
    target: '/en/inventory-management/transactions',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 7. Operational Planning
  {
    id: 'operational-planning',
    kind: 'header',
    label: 'Operational Planning',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'operational-planning-recipe-management',
    kind: 'link',
    label: 'Recipe Management',
    icon: '',
    targetType: 'page',
    target: '/en/operational-planning/recipe-management',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'operational-planning-menu-engineering',
    kind: 'link',
    label: 'Menu Engineering',
    icon: '',
    targetType: 'page',
    target: '/en/operational-planning/menu-engineering',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'operational-planning-demand-forecasting',
    kind: 'link',
    label: 'Demand Forecasting',
    icon: '',
    targetType: 'page',
    target: '/en/operational-planning/demand-forecasting',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'operational-planning-inventory-planning',
    kind: 'link',
    label: 'Inventory Planning',
    icon: '',
    targetType: 'page',
    target: '/en/operational-planning/inventory-planning',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 8. Production
  {
    id: 'production',
    kind: 'header',
    label: 'Production',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'production-recipe-execution',
    kind: 'link',
    label: 'Recipe Execution',
    icon: '',
    targetType: 'page',
    target: '/en/production/recipe-execution',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'production-batch-production',
    kind: 'link',
    label: 'Batch Production',
    icon: '',
    targetType: 'page',
    target: '/en/production/batch-production',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'production-wastage-tracking',
    kind: 'link',
    label: 'Wastage Tracking',
    icon: '',
    targetType: 'page',
    target: '/en/production/wastage-tracking',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'production-quality-control',
    kind: 'link',
    label: 'Quality Control',
    icon: '',
    targetType: 'page',
    target: '/en/production/quality-control',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 9. Reporting & Analytics
  {
    id: 'reporting-analytics',
    kind: 'header',
    label: 'Reporting & Analytics',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'reporting-analytics-operational-reports',
    kind: 'link',
    label: 'Operational Reports',
    icon: '',
    targetType: 'page',
    target: '/en/reporting-analytics/operational-reports',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'reporting-analytics-financial-reports',
    kind: 'link',
    label: 'Financial Reports',
    icon: '',
    targetType: 'page',
    target: '/en/reporting-analytics/financial-reports',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'reporting-analytics-inventory-reports',
    kind: 'link',
    label: 'Inventory Reports',
    icon: '',
    targetType: 'page',
    target: '/en/reporting-analytics/inventory-reports',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'reporting-analytics-vendor-performance',
    kind: 'link',
    label: 'Vendor Performance',
    icon: '',
    targetType: 'page',
    target: '/en/reporting-analytics/vendor-performance',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'reporting-analytics-cost-analysis',
    kind: 'link',
    label: 'Cost Analysis',
    icon: '',
    targetType: 'page',
    target: '/en/reporting-analytics/cost-analysis',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'reporting-analytics-sales-analysis',
    kind: 'link',
    label: 'Sales Analysis',
    icon: '',
    targetType: 'page',
    target: '/en/reporting-analytics/sales-analysis',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 10. Finance
  {
    id: 'finance',
    kind: 'header',
    label: 'Finance',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'finance-account-code-mapping',
    kind: 'link',
    label: 'Account Code Mapping',
    icon: '',
    targetType: 'page',
    target: '/en/finance/account-code-mapping',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'finance-currency-management',
    kind: 'link',
    label: 'Currency Management',
    icon: '',
    targetType: 'page',
    target: '/en/finance/currency-management',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'finance-exchange-rates',
    kind: 'link',
    label: 'Exchange Rates',
    icon: '',
    targetType: 'page',
    target: '/en/finance/exchange-rates',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'finance-department-list',
    kind: 'link',
    label: 'Department and Cost Center',
    icon: '',
    targetType: 'page',
    target: '/en/finance/department-list',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'finance-budget-planning',
    kind: 'link',
    label: 'Budget Planning and Control',
    icon: '',
    targetType: 'page',
    target: '/en/finance/budget-planning',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 11. System Administration
  {
    id: 'system-administration',
    kind: 'header',
    label: 'System Administration',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-user-management',
    kind: 'link',
    label: 'User Management',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/user-management',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-location-management',
    kind: 'link',
    label: 'Location Management',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/location-management',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-workflow',
    kind: 'link',
    label: 'Workflow Management',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/workflow',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-settings',
    kind: 'link',
    label: 'General Settings',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/settings',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-notifications',
    kind: 'link',
    label: 'Notification Preferences',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/notifications',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-license',
    kind: 'link',
    label: 'License Management',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/license',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-permission-management',
    kind: 'link',
    label: 'Permission Management',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/permission-management',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'system-administration-system-integrations',
    kind: 'link',
    label: 'System Integrations',
    icon: '',
    targetType: 'page',
    target: '/en/system-administration/system-integrations',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 12. Help & Support
  {
    id: 'help-support',
    kind: 'header',
    label: 'Help & Support',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'help-support-user-manuals',
    kind: 'link',
    label: 'User Manuals',
    icon: '',
    targetType: 'page',
    target: '/en/help-support/user-manuals',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'help-support-video-tutorials',
    kind: 'link',
    label: 'Video Tutorials',
    icon: '',
    targetType: 'page',
    target: '/en/help-support/video-tutorials',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'help-support-faqs',
    kind: 'link',
    label: 'FAQs',
    icon: '',
    targetType: 'page',
    target: '/en/help-support/faqs',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'help-support-support-ticket-system',
    kind: 'link',
    label: 'Support Ticket System',
    icon: '',
    targetType: 'page',
    target: '/en/help-support/support-ticket-system',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'help-support-system-updates',
    kind: 'link',
    label: 'System Updates and Release Notes',
    icon: '',
    targetType: 'page',
    target: '/en/help-support/system-updates',
    visibilityMode: 'all',
    visibilityGroups: []
  },

  // 13. Style Guide
  {
    id: 'style-guide',
    kind: 'header',
    label: 'Style Guide',
    icon: '',
    targetType: '',
    target: '',
    visibilityMode: 'all',
    visibilityGroups: []
  }
];

// GraphQL mutation
const mutation = `
mutation UpdateNavigation($tree: [NavigationTreeInput]!) {
  navigation {
    updateTree(tree: $tree) {
      responseResult {
        succeeded
        errorCode
        slug
        message
      }
    }
  }
}
`;

// Variables for the mutation
const variables = {
  tree: [
    {
      locale: 'en',
      items: navigationItems
    }
  ]
};

// Execute the mutation
async function updateNavigation() {
  try {
    console.log('🔧 Updating navigation with Vendor Management documentation links...');
    console.log(`Total navigation items: ${navigationItems.length}`);
    console.log('New items added:');
    console.log('  - Vendor Management Documentation (header)');
    console.log('  - 5 overview/analysis pages');
    console.log('  - 5 submodule documentation sections (Vendor Directory, Pricelist Templates, Price Lists, RFP, Vendor Portal)');
    console.log('  - 15 specification pages (BR, TS, DD for each submodule)');
    console.log('');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }

    const responseResult = result.data?.navigation?.updateTree?.responseResult;

    if (responseResult?.succeeded) {
      console.log('✅ Navigation successfully updated!');
      console.log(`✅ Total navigation items: ${navigationItems.length}`);
      console.log('');
      console.log('📝 New documentation sections added:');
      console.log('   ├─ Vendor Management Documentation');
      console.log('   │  ├─ Module Overview');
      console.log('   │  ├─ Architecture & Redesign');
      console.log('   │  ├─ Vendor Portal Analysis');
      console.log('   │  ├─ Change History');
      console.log('   │  └─ Documentation Status');
      console.log('   │');
      console.log('   ├─ Vendor Directory Docs');
      console.log('   │  ├─ Business Requirements');
      console.log('   │  ├─ Technical Specification');
      console.log('   │  └─ Data Dictionary');
      console.log('   │');
      console.log('   ├─ Pricelist Templates Docs');
      console.log('   │  ├─ Business Requirements');
      console.log('   │  ├─ Technical Specification');
      console.log('   │  └─ Data Dictionary');
      console.log('   │');
      console.log('   ├─ Price Lists Docs');
      console.log('   │  ├─ Business Requirements');
      console.log('   │  ├─ Technical Specification');
      console.log('   │  └─ Data Dictionary');
      console.log('   │');
      console.log('   ├─ Requests for Pricing Docs');
      console.log('   │  ├─ Business Requirements');
      console.log('   │  ├─ Technical Specification');
      console.log('   │  └─ Data Dictionary');
      console.log('   │');
      console.log('   └─ Vendor Portal Docs');
      console.log('      ├─ Business Requirements');
      console.log('      ├─ Technical Specification');
      console.log('      └─ Data Dictionary');
      console.log('');
      console.log('🎉 Next steps:');
      console.log('   1. Refresh the Wiki.js page in your browser');
      console.log('   2. Check the sidebar navigation - you should see the new documentation sections');
      console.log('   3. All 54 imported documentation pages are now linked in the sidebar');
    } else {
      console.error('❌ Navigation update failed:');
      console.error('Error Code:', responseResult?.errorCode);
      console.error('Message:', responseResult?.message);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error executing update:', error.message);
    process.exit(1);
  }
}

// Run the update
updateNavigation();
