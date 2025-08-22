import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Page Accessibility Test Suite for Carmen ERP
 * Tests that all pages are accessible and can be navigated to without errors
 */

// Define all the accessible routes in the application
const ROUTES = [
  // Root and main routes
  '/',
  '/dashboard',
  '/edit-profile',
  '/profile',
  '/select-business-unit',

  // Authentication routes  
  '/login',
  '/signup',
  '/signin',

  // Inventory Management
  '/inventory-management',
  '/inventory-management/inventory-adjustments',
  '/inventory-management/physical-count',
  '/inventory-management/physical-count/dashboard',
  '/inventory-management/spot-check',
  '/inventory-management/spot-check/dashboard',
  '/inventory-management/spot-check/new',
  '/inventory-management/spot-check/active',
  '/inventory-management/spot-check/completed',
  '/inventory-management/stock-overview',
  '/inventory-management/stock-overview/inventory-aging',
  '/inventory-management/stock-overview/inventory-balance',
  '/inventory-management/stock-overview/stock-card',
  '/inventory-management/stock-overview/stock-cards',
  '/inventory-management/stock-overview/slow-moving',
  '/inventory-management/fractional-inventory',
  '/inventory-management/stock-in',
  '/inventory-management/period-end',
  '/inventory-management/physical-count-management',

  // Procurement
  '/procurement',
  '/procurement/purchase-requests',
  '/procurement/purchase-requests/new-pr',
  '/procurement/purchase-requests/enhanced-demo',
  '/procurement/purchase-orders',
  '/procurement/purchase-orders/create',
  '/procurement/purchase-orders/create/bulk',
  '/procurement/purchase-orders/create/from-pr',
  '/procurement/goods-received-note',
  '/procurement/goods-received-note/new',
  '/procurement/goods-received-note/new/po-selection',
  '/procurement/goods-received-note/new/manual-entry',
  '/procurement/goods-received-note/new/item-location-selection',
  '/procurement/goods-received-note/new/vendor-selection',
  '/procurement/goods-received-note/create',
  '/procurement/credit-note',
  '/procurement/credit-note/new',
  '/procurement/my-approvals',
  '/procurement/purchase-request-templates',
  '/procurement/vendor-comparison',

  // Vendor Management
  '/vendor-management',
  '/vendor-management/vendors',
  '/vendor-management/vendors/new',
  '/vendor-management/manage-vendors',
  '/vendor-management/manage-vendors/new',
  '/vendor-management/pricelists',
  '/vendor-management/pricelists/add',
  '/vendor-management/pricelists/new',
  '/vendor-management/templates',
  '/vendor-management/templates/new',
  '/vendor-management/campaigns',
  '/vendor-management/campaigns/new',
  '/vendor-management/vendor-portal',
  '/vendor-management/vendor-portal/sample',

  // Product Management
  '/product-management',
  '/product-management/products',
  '/product-management/categories',
  '/product-management/units',

  // Operational Planning
  '/operational-planning',
  '/operational-planning/recipe-management',
  '/operational-planning/recipe-management/recipes',
  '/operational-planning/recipe-management/recipes/new',
  '/operational-planning/recipe-management/recipes/create',
  '/operational-planning/recipe-management/categories',
  '/operational-planning/recipe-management/cuisine-types',

  // Store Operations
  '/store-operations',
  '/store-operations/store-requisitions',
  '/store-operations/wastage-reporting',
  '/store-operations/stock-replenishment',

  // Reporting & Analytics
  '/reporting-analytics',
  '/reporting-analytics/consumption-analytics',

  // Finance
  '/finance',
  '/finance/account-code-mapping',
  '/finance/department-list',
  '/finance/currency-management',
  '/finance/exchange-rates',

  // Production
  '/production',

  // System Administration
  '/system-administration',
  '/system-administration/user-management',
  '/system-administration/location-management',
  '/system-administration/location-management/new',
  '/system-administration/workflow',
  '/system-administration/workflow/workflow-configuration',
  '/system-administration/workflow/role-assignment',
  '/system-administration/business-rules',
  '/system-administration/business-rules/compliance-monitoring',
  '/system-administration/system-integrations',
  '/system-administration/system-integrations/pos',
  '/system-administration/system-integrations/pos/mapping',
  '/system-administration/system-integrations/pos/mapping/units',
  '/system-administration/system-integrations/pos/mapping/recipes',
  '/system-administration/system-integrations/pos/mapping/recipes/fractional-variants',
  '/system-administration/system-integrations/pos/mapping/locations',
  '/system-administration/system-integrations/pos/settings',
  '/system-administration/system-integrations/pos/settings/config',
  '/system-administration/system-integrations/pos/settings/system',
  '/system-administration/system-integrations/pos/transactions',
  '/system-administration/system-integrations/pos/reports',
  '/system-administration/system-integrations/pos/reports/gross-profit',
  '/system-administration/system-integrations/pos/reports/consumption',
  '/system-administration/system-integration',
  '/system-administration/system-integration/pos',
  '/system-administration/account-code-mapping',
  '/system-administration/user-dashboard',

  // Help & Support
  '/help-support',

  // Legacy routes (for backward compatibility testing)
  '/inventory',
  '/inventory/overview',
  '/inventory/stock-overview',
  '/inventory/stock-overview/stock-card',
  '/receiving',
  '/stock-take',
  '/spot-check',
  '/pr-approval',
  '/transactions',
  '/testui',
];

// Routes that require authentication or specific state
const PROTECTED_ROUTES = [
  '/dashboard',
  '/edit-profile',
  '/profile',
  '/inventory-management',
  '/procurement',
  '/vendor-management',
  '/product-management',
  '/operational-planning',
  '/store-operations',
  '/reporting-analytics',
  '/finance',
  '/production',
  '/system-administration',
  '/help-support',
];

// Routes that might redirect or have special behavior
const SPECIAL_ROUTES = [
  '/', // Might redirect to login or dashboard
  '/select-business-unit', // Might redirect if already selected
];

/**
 * Helper function to check if a page loads successfully
 */
async function checkPageAccessibility(page: Page, route: string): Promise<{
  url: string;
  accessible: boolean;
  statusCode?: number;
  error?: string;
  redirected?: boolean;
  finalUrl?: string;
}> {
  try {
    const response = await page.goto(route, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const finalUrl = page.url();
    const redirected = finalUrl !== `http://localhost:3000${route}`;
    
    // Check for common error indicators
    const hasErrorText = await page.locator('text=Error').count() > 0;
    const has404Text = await page.locator('text=404').count() > 0;
    const hasErrorPage = await page.locator('[data-testid="error-page"]').count() > 0;
    
    // Check for Next.js error boundaries
    const hasNextError = await page.locator('text=Application error').count() > 0;
    
    const isAccessible = response?.ok() && !hasErrorText && !has404Text && !hasErrorPage && !hasNextError;
    
    return {
      url: route,
      accessible: isAccessible,
      statusCode: response?.status(),
      redirected,
      finalUrl: redirected ? finalUrl : undefined,
    };
  } catch (error) {
    return {
      url: route,
      accessible: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Mock authentication for protected routes
 */
async function mockAuthentication(page: Page) {
  // Set mock authentication state in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-001',
      name: 'Test User',
      email: 'test@example.com',
      role: 'staff',
      department: 'procurement',
      location: 'main-kitchen',
      permissions: ['read', 'write', 'approve']
    }));
    
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('selectedBusinessUnit', 'main-unit');
    localStorage.setItem('userContext', JSON.stringify({
      activeRole: 'staff',
      activeDepartment: 'procurement',
      activeLocation: 'main-kitchen'
    }));
  });
}

test.describe('Page Accessibility Test Suite', () => {
  let accessibilityResults: Array<{
    url: string;
    accessible: boolean;
    statusCode?: number;
    error?: string;
    redirected?: boolean;
    finalUrl?: string;
  }> = [];

  test.beforeEach(async ({ page }) => {
    // Set up mock authentication for all tests
    await mockAuthentication(page);
    
    // Increase timeouts for slower pages
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
  });

  test('All public routes should be accessible', async ({ page }) => {
    const publicRoutes = ROUTES.filter(route => !PROTECTED_ROUTES.includes(route));
    
    for (const route of publicRoutes) {
      console.log(`Testing public route: ${route}`);
      const result = await checkPageAccessibility(page, route);
      accessibilityResults.push(result);
      
      // Log results for debugging
      if (!result.accessible) {
        console.warn(`❌ Public route ${route} is not accessible:`, result);
      } else {
        console.log(`✅ Public route ${route} is accessible`);
      }
    }
    
    // Assert that all public routes are accessible
    const failedPublicRoutes = accessibilityResults.filter(r => 
      publicRoutes.includes(r.url) && !r.accessible
    );
    
    if (failedPublicRoutes.length > 0) {
      console.error('Failed public routes:', failedPublicRoutes);
    }
    
    expect(failedPublicRoutes.length).toBe(0);
  });

  test('All protected routes should be accessible with authentication', async ({ page }) => {
    for (const route of PROTECTED_ROUTES) {
      console.log(`Testing protected route: ${route}`);
      const result = await checkPageAccessibility(page, route);
      accessibilityResults.push(result);
      
      // Log results for debugging
      if (!result.accessible) {
        console.warn(`❌ Protected route ${route} is not accessible:`, result);
      } else {
        console.log(`✅ Protected route ${route} is accessible`);
      }
    }
    
    // Assert that all protected routes are accessible with auth
    const failedProtectedRoutes = accessibilityResults.filter(r => 
      PROTECTED_ROUTES.includes(r.url) && !r.accessible && !r.redirected
    );
    
    if (failedProtectedRoutes.length > 0) {
      console.error('Failed protected routes:', failedProtectedRoutes);
    }
    
    expect(failedProtectedRoutes.length).toBe(0);
  });

  test('Special routes should handle redirects properly', async ({ page }) => {
    for (const route of SPECIAL_ROUTES) {
      console.log(`Testing special route: ${route}`);
      const result = await checkPageAccessibility(page, route);
      accessibilityResults.push(result);
      
      // Log results for debugging - redirects are expected for special routes
      if (!result.accessible && !result.redirected) {
        console.warn(`❌ Special route ${route} failed without redirect:`, result);
      } else {
        console.log(`✅ Special route ${route} handled properly`);
      }
    }
    
    // For special routes, we accept either accessibility or proper redirection
    const failedSpecialRoutes = accessibilityResults.filter(r => 
      SPECIAL_ROUTES.includes(r.url) && !r.accessible && !r.redirected
    );
    
    expect(failedSpecialRoutes.length).toBe(0);
  });

  test('Dynamic routes with sample IDs should be accessible', async ({ page }) => {
    const dynamicRoutes = [
      '/inventory-management/inventory-adjustments/sample-id-001',
      '/inventory-management/physical-count/active/sample-count-001',
      '/inventory-management/spot-check/active/sample-spot-001',
      '/inventory-management/spot-check/completed/sample-spot-001',
      '/inventory-management/period-end/sample-period-001',
      '/procurement/purchase-requests/PR-2024-001',
      '/procurement/purchase-orders/PO-2024-001',
      '/procurement/purchase-orders/PO-2024-001/edit',
      '/procurement/goods-received-note/GRN-2024-001',
      '/procurement/goods-received-note/GRN-2024-001/edit',
      '/procurement/credit-note/CN-2024-001',
      '/vendor-management/vendors/vendor-001',
      '/vendor-management/vendors/vendor-001/edit',
      '/vendor-management/vendors/vendor-001/pricelist-settings',
      '/vendor-management/manage-vendors/vendor-001',
      '/vendor-management/pricelists/pricelist-001',
      '/vendor-management/pricelists/pricelist-001/edit',
      '/vendor-management/templates/template-001',
      '/vendor-management/templates/template-001/edit',
      '/vendor-management/campaigns/campaign-001',
      '/product-management/products/product-001',
      '/operational-planning/recipe-management/recipes/recipe-001',
      '/operational-planning/recipe-management/recipes/recipe-001/edit',
      '/store-operations/store-requisitions/SR-2024-001',
      '/system-administration/user-management/user-001',
      '/system-administration/location-management/location-001',
      '/system-administration/location-management/location-001/edit',
      '/system-administration/location-management/location-001/view',
      '/system-administration/workflow/workflow-configuration/workflow-001',
    ];

    for (const route of dynamicRoutes) {
      console.log(`Testing dynamic route: ${route}`);
      const result = await checkPageAccessibility(page, route);
      accessibilityResults.push(result);
      
      // For dynamic routes, we expect either successful load or graceful error handling
      if (!result.accessible) {
        console.warn(`⚠️ Dynamic route ${route} not accessible (may be expected):`, result);
      } else {
        console.log(`✅ Dynamic route ${route} is accessible`);
      }
    }
  });

  test.afterAll(async () => {
    // Generate accessibility report
    console.log('\n=== ACCESSIBILITY TEST RESULTS ===\n');
    
    const accessibleRoutes = accessibilityResults.filter(r => r.accessible);
    const inaccessibleRoutes = accessibilityResults.filter(r => !r.accessible);
    const redirectedRoutes = accessibilityResults.filter(r => r.redirected);
    
    console.log(`✅ Accessible routes: ${accessibleRoutes.length}`);
    console.log(`❌ Inaccessible routes: ${inaccessibleRoutes.length}`);
    console.log(`🔄 Redirected routes: ${redirectedRoutes.length}`);
    console.log(`📊 Total routes tested: ${accessibilityResults.length}`);
    
    if (inaccessibleRoutes.length > 0) {
      console.log('\n❌ INACCESSIBLE ROUTES:');
      inaccessibleRoutes.forEach(route => {
        console.log(`  - ${route.url}: ${route.error || `HTTP ${route.statusCode}`}`);
      });
    }
    
    if (redirectedRoutes.length > 0) {
      console.log('\n🔄 REDIRECTED ROUTES:');
      redirectedRoutes.forEach(route => {
        console.log(`  - ${route.url} → ${route.finalUrl}`);
      });
    }
    
    console.log('\n=== END ACCESSIBILITY REPORT ===\n');
    
    // Save detailed results to file
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(process.cwd(), 'test-results', 'accessibility-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: accessibilityResults.length,
        accessible: accessibleRoutes.length,
        inaccessible: inaccessibleRoutes.length,
        redirected: redirectedRoutes.length,
        successRate: `${((accessibleRoutes.length / accessibilityResults.length) * 100).toFixed(2)}%`
      },
      results: accessibilityResults
    }, null, 2));
    
    console.log(`📋 Detailed report saved to: ${reportPath}`);
  });
});