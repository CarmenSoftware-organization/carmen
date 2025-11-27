#!/usr/bin/env node
/**
 * Wiki.js Navigation Null Fix Script
 *
 * Fixes the navigation items by replacing null values with empty strings
 * to prevent JavaScript errors in Wiki.js frontend rendering.
 *
 * The error "Cannot read properties of null (reading 'match')" occurs because
 * Wiki.js tries to call .match() on null values.
 *
 * Usage: node fix-wiki-navigation-nulls.js
 */

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzYzOTc5OTYwLCJleHAiOjE3OTU1Mzc1NjAsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.hRZIwCPcBSorxd5S23Bx_HNsWdGg8u_4T5blA3UDn_8oPw5WbEkTQcaPcfzx8j8uTSEtbXcZfZR4_dfTJ5MZ3lLoU2P0pRLHaRw6_6YpQMcMvse_t0Vwk24UzVrpvqf-jCcf6p_aUMjXV_gKYPfi4oF_YUem65VWEfm3bmbKxuSFGpVI5LR-lCyVQT92_vvbJ-ZJwZHUGLNs56mlWjjVsh3QIHvy2tO8BzmxpDRzICtV8lqJECRKRQrZTL1yAaMIKqmlOBy9pu955CZSq7ulQECtDdKsi1Ehx1G9ka5ZcvHVskJ2oLzZhAyrTozwJm282eHEkZ-8ybghAcvkwgHSSA';

// Complete navigation structure with FIXED null values (now empty strings)
const navigationItems = [
  // 1. Dashboard
  {
    id: 'dashboard',
    kind: 'header',
    label: 'Dashboard',
    icon: '',              // Changed from null to empty string
    targetType: '',        // Changed from null to empty string
    target: '',            // Changed from null to empty string
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
    target: '/en/vendor-management/vendor-directory',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-pricelist-templates',
    kind: 'link',
    label: 'Pricelist Templates',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-management/pricelist-templates',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-requests-for-pricing',
    kind: 'link',
    label: 'Requests for Pricing',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-management/requests-for-pricing',
    visibilityMode: 'all',
    visibilityGroups: []
  },
  {
    id: 'vendor-management-price-lists',
    kind: 'link',
    label: 'Price Lists',
    icon: '',
    targetType: 'page',
    target: '/en/vendor-management/price-lists',
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
    console.log('🔧 Fixing navigation by replacing null values with empty strings...');
    console.log(`Total items to fix: ${navigationItems.length}`);

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
      console.log('✅ Navigation successfully fixed!');
      console.log(`✅ Updated ${navigationItems.length} navigation items`);
      console.log('   - Replaced null values with empty strings ("")');
      console.log('   - This should resolve the JavaScript "Cannot read properties of null" error');
      console.log('\n📝 Next steps:');
      console.log('   1. Refresh the Wiki.js page in your browser');
      console.log('   2. Check the browser console - errors should be gone');
      console.log('   3. The custom navigation menu should now display correctly');
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
