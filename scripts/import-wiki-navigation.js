#!/usr/bin/env node
/**
 * Wiki.js Navigation Bulk Import Script
 *
 * This script imports the complete Carmen ERP navigation structure
 * into Wiki.js using the GraphQL API.
 *
 * Usage: node import-wiki-navigation.js
 */

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzYzOTc5OTYwLCJleHAiOjE3OTU1Mzc1NjAsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.hRZIwCPcBSorxd5S23Bx_HNsWdGg8u_4T5blA3UDn_8oPw5WbEkTQcaPcfzx8j8uTSEtbXcZfZR4_dfTJ5MZ3lLoU2P0pRLHaRw6_6YpQMcMvse_t0Vwk24UzVrpvqf-jCcf6p_aUMjXV_gKYPfi4oF_YUem65VWEfm3bmbKxuSFGpVI5LR-lCyVQT92_vvbJ-ZJwZHUGLNs56mlWjjVsh3QIHvy2tO8BzmxpDRzICtV8lqJECRKRQrZTL1yAaMIKqmlOBy9pu955CZSq7ulQECtDdKsi1Ehx1G9ka5ZcvHVskJ2oLzZhAyrTozwJm282eHEkZ-8ybghAcvkwgHSSA';

// Complete navigation structure based on module-structure-checklist.md
const navigationItems = [
  // 1. Dashboard
  {
    id: 'dashboard',
    kind: 'header',
    label: 'Dashboard',
    icon: null,
    targetType: null,
    target: null
  },

  // 2. Procurement
  {
    id: 'procurement',
    kind: 'header',
    label: 'Procurement',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'procurement-my-approvals',
    kind: 'link',
    label: 'My Approvals',
    icon: null,
    targetType: 'page',
    target: '/en/procurement/my-approvals'
  },
  {
    id: 'procurement-purchase-requests',
    kind: 'link',
    label: 'Purchase Requests',
    icon: null,
    targetType: 'page',
    target: '/en/procurement/purchase-requests'
  },
  {
    id: 'procurement-purchase-orders',
    kind: 'link',
    label: 'Purchase Orders',
    icon: null,
    targetType: 'page',
    target: '/en/procurement/purchase-orders'
  },
  {
    id: 'procurement-goods-received-note',
    kind: 'link',
    label: 'Goods Received Note',
    icon: null,
    targetType: 'page',
    target: '/en/procurement/goods-received-note'
  },
  {
    id: 'procurement-credit-notes',
    kind: 'link',
    label: 'Credit Notes',
    icon: null,
    targetType: 'page',
    target: '/en/procurement/credit-note'
  },
  {
    id: 'procurement-purchase-request-templates',
    kind: 'link',
    label: 'Purchase Request Templates',
    icon: null,
    targetType: 'page',
    target: '/en/procurement/purchase-request-templates'
  },

  // 3. Product Management
  {
    id: 'product-management',
    kind: 'header',
    label: 'Product Management',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'product-management-products',
    kind: 'link',
    label: 'Products',
    icon: null,
    targetType: 'page',
    target: '/en/product-management/products'
  },
  {
    id: 'product-management-categories',
    kind: 'link',
    label: 'Categories',
    icon: null,
    targetType: 'page',
    target: '/en/product-management/categories'
  },
  {
    id: 'product-management-units',
    kind: 'link',
    label: 'Units',
    icon: null,
    targetType: 'page',
    target: '/en/product-management/units'
  },
  {
    id: 'product-management-reports',
    kind: 'link',
    label: 'Reports',
    icon: null,
    targetType: 'page',
    target: '/en/product-management/reports'
  },

  // 4. Vendor Management
  {
    id: 'vendor-management',
    kind: 'header',
    label: 'Vendor Management',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'vendor-management-vendor-directory',
    kind: 'link',
    label: 'Vendor Directory',
    icon: null,
    targetType: 'page',
    target: '/en/vendor-management/manage-vendors'
  },
  {
    id: 'vendor-management-pricelist-templates',
    kind: 'link',
    label: 'Pricelist Templates',
    icon: null,
    targetType: 'page',
    target: '/en/vendor-management/templates'
  },
  {
    id: 'vendor-management-requests-for-pricing',
    kind: 'link',
    label: 'Requests for Pricing',
    icon: null,
    targetType: 'page',
    target: '/en/vendor-management/campaigns'
  },
  {
    id: 'vendor-management-price-lists',
    kind: 'link',
    label: 'Price Lists',
    icon: null,
    targetType: 'page',
    target: '/en/vendor-management/pricelists'
  },
  {
    id: 'vendor-management-vendor-entry',
    kind: 'link',
    label: 'Vendor Entry',
    icon: null,
    targetType: 'page',
    target: '/en/vendor-management/vendor-portal/sample'
  },

  // 5. Store Operations
  {
    id: 'store-operations',
    kind: 'header',
    label: 'Store Operations',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'store-operations-store-requisitions',
    kind: 'link',
    label: 'Store Requisitions',
    icon: null,
    targetType: 'page',
    target: '/en/store-operations/store-requisitions'
  },
  {
    id: 'store-operations-stock-replenishment',
    kind: 'link',
    label: 'Stock Replenishment',
    icon: null,
    targetType: 'page',
    target: '/en/store-operations/stock-replenishment'
  },
  {
    id: 'store-operations-wastage-reporting',
    kind: 'link',
    label: 'Wastage Reporting',
    icon: null,
    targetType: 'page',
    target: '/en/store-operations/wastage-reporting'
  },

  // 6. Inventory Management
  {
    id: 'inventory-management',
    kind: 'header',
    label: 'Inventory Management',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'inventory-management-stock-overview',
    kind: 'link',
    label: 'Stock Overview',
    icon: null,
    targetType: 'page',
    target: '/en/inventory-management/stock-overview'
  },
  {
    id: 'inventory-management-inventory-adjustments',
    kind: 'link',
    label: 'Inventory Adjustments',
    icon: null,
    targetType: 'page',
    target: '/en/inventory-management/inventory-adjustments'
  },
  {
    id: 'inventory-management-spot-check',
    kind: 'link',
    label: 'Spot Check',
    icon: null,
    targetType: 'page',
    target: '/en/inventory-management/spot-check'
  },
  {
    id: 'inventory-management-physical-count',
    kind: 'link',
    label: 'Physical Count',
    icon: null,
    targetType: 'page',
    target: '/en/inventory-management/physical-count-management'
  },
  {
    id: 'inventory-management-period-end',
    kind: 'link',
    label: 'Period End',
    icon: null,
    targetType: 'page',
    target: '/en/inventory-management/period-end'
  },
  {
    id: 'inventory-management-transactions',
    kind: 'link',
    label: 'Inventory Transactions',
    icon: null,
    targetType: 'page',
    target: '/en/inventory-management/transactions'
  },

  // 7. Operational Planning
  {
    id: 'operational-planning',
    kind: 'header',
    label: 'Operational Planning',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'operational-planning-recipe-management',
    kind: 'link',
    label: 'Recipe Management',
    icon: null,
    targetType: 'page',
    target: '/en/operational-planning/recipe-management'
  },
  {
    id: 'operational-planning-menu-engineering',
    kind: 'link',
    label: 'Menu Engineering',
    icon: null,
    targetType: 'page',
    target: '/en/operational-planning/menu-engineering'
  },
  {
    id: 'operational-planning-demand-forecasting',
    kind: 'link',
    label: 'Demand Forecasting',
    icon: null,
    targetType: 'page',
    target: '/en/operational-planning/demand-forecasting'
  },
  {
    id: 'operational-planning-inventory-planning',
    kind: 'link',
    label: 'Inventory Planning',
    icon: null,
    targetType: 'page',
    target: '/en/operational-planning/inventory-planning'
  },

  // 8. Production
  {
    id: 'production',
    kind: 'header',
    label: 'Production',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'production-recipe-execution',
    kind: 'link',
    label: 'Recipe Execution',
    icon: null,
    targetType: 'page',
    target: '/en/production/recipe-execution'
  },
  {
    id: 'production-batch-production',
    kind: 'link',
    label: 'Batch Production',
    icon: null,
    targetType: 'page',
    target: '/en/production/batch-production'
  },
  {
    id: 'production-wastage-tracking',
    kind: 'link',
    label: 'Wastage Tracking',
    icon: null,
    targetType: 'page',
    target: '/en/production/wastage-tracking'
  },
  {
    id: 'production-quality-control',
    kind: 'link',
    label: 'Quality Control',
    icon: null,
    targetType: 'page',
    target: '/en/production/quality-control'
  },

  // 9. Reporting & Analytics
  {
    id: 'reporting-analytics',
    kind: 'header',
    label: 'Reporting & Analytics',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'reporting-analytics-operational-reports',
    kind: 'link',
    label: 'Operational Reports',
    icon: null,
    targetType: 'page',
    target: '/en/reporting-analytics/operational-reports'
  },
  {
    id: 'reporting-analytics-financial-reports',
    kind: 'link',
    label: 'Financial Reports',
    icon: null,
    targetType: 'page',
    target: '/en/reporting-analytics/financial-reports'
  },
  {
    id: 'reporting-analytics-inventory-reports',
    kind: 'link',
    label: 'Inventory Reports',
    icon: null,
    targetType: 'page',
    target: '/en/reporting-analytics/inventory-reports'
  },
  {
    id: 'reporting-analytics-vendor-performance',
    kind: 'link',
    label: 'Vendor Performance',
    icon: null,
    targetType: 'page',
    target: '/en/reporting-analytics/vendor-performance'
  },
  {
    id: 'reporting-analytics-cost-analysis',
    kind: 'link',
    label: 'Cost Analysis',
    icon: null,
    targetType: 'page',
    target: '/en/reporting-analytics/cost-analysis'
  },
  {
    id: 'reporting-analytics-sales-analysis',
    kind: 'link',
    label: 'Sales Analysis',
    icon: null,
    targetType: 'page',
    target: '/en/reporting-analytics/sales-analysis'
  },

  // 10. Finance
  {
    id: 'finance',
    kind: 'header',
    label: 'Finance',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'finance-account-code-mapping',
    kind: 'link',
    label: 'Account Code Mapping',
    icon: null,
    targetType: 'page',
    target: '/en/finance/account-code-mapping'
  },
  {
    id: 'finance-currency-management',
    kind: 'link',
    label: 'Currency Management',
    icon: null,
    targetType: 'page',
    target: '/en/finance/currency-management'
  },
  {
    id: 'finance-exchange-rates',
    kind: 'link',
    label: 'Exchange Rates',
    icon: null,
    targetType: 'page',
    target: '/en/finance/exchange-rates'
  },
  {
    id: 'finance-department-list',
    kind: 'link',
    label: 'Department and Cost Center',
    icon: null,
    targetType: 'page',
    target: '/en/finance/department-list'
  },
  {
    id: 'finance-budget-planning',
    kind: 'link',
    label: 'Budget Planning and Control',
    icon: null,
    targetType: 'page',
    target: '/en/finance/budget-planning-and-control'
  },

  // 11. System Administration
  {
    id: 'system-administration',
    kind: 'header',
    label: 'System Administration',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'system-administration-user-management',
    kind: 'link',
    label: 'User Management',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/user-management'
  },
  {
    id: 'system-administration-location-management',
    kind: 'link',
    label: 'Location Management',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/location-management'
  },
  {
    id: 'system-administration-workflow',
    kind: 'link',
    label: 'Workflow Management',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/workflow/workflow-configuration'
  },
  {
    id: 'system-administration-settings',
    kind: 'link',
    label: 'General Settings',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/settings'
  },
  {
    id: 'system-administration-notifications',
    kind: 'link',
    label: 'Notification Preferences',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/settings/notifications'
  },
  {
    id: 'system-administration-license',
    kind: 'link',
    label: 'License Management',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/license-management'
  },
  {
    id: 'system-administration-permission-management',
    kind: 'link',
    label: 'Permission Management',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/permission-management'
  },
  {
    id: 'system-administration-system-integrations',
    kind: 'link',
    label: 'System Integrations',
    icon: null,
    targetType: 'page',
    target: '/en/system-administration/system-integrations'
  },

  // 12. Help & Support
  {
    id: 'help-support',
    kind: 'header',
    label: 'Help & Support',
    icon: null,
    targetType: null,
    target: null
  },
  {
    id: 'help-support-user-manuals',
    kind: 'link',
    label: 'User Manuals',
    icon: null,
    targetType: 'page',
    target: '/en/help-support/user-manuals'
  },
  {
    id: 'help-support-video-tutorials',
    kind: 'link',
    label: 'Video Tutorials',
    icon: null,
    targetType: 'page',
    target: '/en/help-support/video-tutorials'
  },
  {
    id: 'help-support-faqs',
    kind: 'link',
    label: 'FAQs',
    icon: null,
    targetType: 'page',
    target: '/en/help-support/faqs'
  },
  {
    id: 'help-support-support-ticket-system',
    kind: 'link',
    label: 'Support Ticket System',
    icon: null,
    targetType: 'page',
    target: '/en/help-support/support-ticket-system'
  },
  {
    id: 'help-support-system-updates',
    kind: 'link',
    label: 'System Updates and Release Notes',
    icon: null,
    targetType: 'page',
    target: '/en/help-support/system-updates-and-release-notes'
  },

  // 13. Style Guide
  {
    id: 'style-guide',
    kind: 'header',
    label: 'Style Guide',
    icon: null,
    targetType: null,
    target: null
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
async function importNavigation() {
  try {
    console.log('Starting navigation import...');
    console.log(`Total items to import: ${navigationItems.length}`);

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
      console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }

    const responseResult = result.data?.navigation?.updateTree?.responseResult;

    if (responseResult?.succeeded) {
      console.log('✅ Navigation import completed successfully!');
      console.log(`✅ Imported ${navigationItems.length} navigation items`);
      console.log('   - 13 main module headers');
      console.log('   - 66 sub-module links');
    } else {
      console.error('❌ Navigation import failed:');
      console.error('Error Code:', responseResult?.errorCode);
      console.error('Message:', responseResult?.message);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error executing import:', error.message);
    process.exit(1);
  }
}

// Run the import
importNavigation();
