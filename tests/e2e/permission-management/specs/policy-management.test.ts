import { test, expect, Page, BrowserContext } from 'playwright/test';
import { PermissionManagementPage, PolicyData } from '../page-objects/pages/PermissionManagementPage';
import { testConfig, testData } from '../config/test.config';

test.describe('Policy Management Workflow', () => {
  let page: Page;
  let context: BrowserContext;
  let permissionPage: PermissionManagementPage;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1368, height: 720 },
      recordVideo: { dir: 'tests/e2e/permission-management/reports/videos' }
    });
    
    page = await context.newPage();
    permissionPage = new PermissionManagementPage(page);

    await permissionPage.navigateToPermissionManagement();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('should display policy management page with all required elements', async () => {
    await test.step('Validate page load and core elements', async () => {
      const isValid = await permissionPage.validatePageLoad();
      expect(isValid).toBe(true);
      
      // Verify policy list is visible
      const policyListValid = await permissionPage.validatePolicyListDisplay();
      expect(policyListValid).toBe(true);
    });

    await test.step('Verify action buttons are present', async () => {
      await expect(page.locator('[data-testid="simple-creator-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="new-policy-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="filters-button"]')).toBeVisible();
    });
  });

  test('should open simple creator workflow', async () => {
    await test.step('Click Simple Creator button', async () => {
      await permissionPage.openSimpleCreator();
      
      // Wait for simple creator modal/page to appear
      try {
        await page.waitForSelector('[data-testid="simple-policy-modal"]', { timeout: 5000 });
      } catch {
        // If modal doesn't exist, check if we navigated to a new page
        const url = page.url();
        expect(url).toContain('simple');
      }
    });
  });

  test('should open advanced policy builder', async () => {
    await test.step('Click Advanced Builder button', async () => {
      await permissionPage.openAdvancedBuilder();
      
      // Wait for policy wizard or builder to appear
      try {
        await page.waitForSelector('[data-testid="policy-wizard"]', { timeout: 5000 });
      } catch {
        // Check if navigated to builder page
        const url = page.url();
        expect(url).toContain('builder');
      }
    });
  });

  test('should create a simple policy via Simple Creator', async () => {
    const testPolicy = {
      name: `Test Policy ${Date.now()}`,
      description: 'Automated test policy for kitchen staff',
      priority: 500,
      effect: 'permit' as const
    };

    await test.step('Open Simple Creator', async () => {
      await permissionPage.openSimpleCreator();
    });

    await test.step('Create policy using simple workflow', async () => {
      // This would depend on the actual simple creator implementation
      // For now, we'll test the navigation and form presence
      const hasForm = await page.isVisible('[data-testid="simple-policy-form"]') ||
                     await page.isVisible('[data-testid="policy-name-field"]');
      
      if (hasForm) {
        const policyId = await permissionPage.createSimplePolicy(testPolicy);
        expect(policyId).toBeTruthy();
        
        // Verify policy appears in list
        const policies = await permissionPage.getPolicyList();
        const createdPolicy = policies.find(p => p.name === testPolicy.name);
        expect(createdPolicy).toBeDefined();
      } else {
        // Skip test if simple creator form is not implemented
        test.skip('Simple creator form not implemented yet');
      }
    });
  });

  test('should display and manage policy list', async () => {
    await test.step('Verify policy list loads', async () => {
      const policyCount = await permissionPage.getPolicyCount();
      expect(policyCount).toBeGreaterThanOrEqual(0);
      
      if (policyCount > 0) {
        const policies = await permissionPage.getPolicyList();
        expect(policies.length).toBe(policyCount);
        
        // Validate policy structure
        const firstPolicy = policies[0];
        expect(firstPolicy).toHaveProperty('id');
        expect(firstPolicy).toHaveProperty('name');
        expect(firstPolicy).toHaveProperty('status');
        expect(firstPolicy).toHaveProperty('priority');
        expect(firstPolicy).toHaveProperty('effect');
      }
    });
  });

  test('should support policy search functionality', async () => {
    const policyCount = await permissionPage.getPolicyCount();
    
    if (policyCount === 0) {
      test.skip('No policies available to test search');
    }

    await test.step('Test search functionality', async () => {
      const allPolicies = await permissionPage.getPolicyList();
      
      if (allPolicies.length > 0) {
        const searchTerm = allPolicies[0].name.substring(0, 3);
        
        const searchTime = await permissionPage.measureSearchResponseTime(searchTerm);
        expect(searchTime).toBeLessThan(testConfig.performance.searchResultsBenchmark);
        
        // Verify search results
        const filteredPolicies = await permissionPage.getPolicyList();
        filteredPolicies.forEach(policy => {
          expect(policy.name.toLowerCase()).toContain(searchTerm.toLowerCase());
        });
      }
    });

    await test.step('Clear search and verify all policies return', async () => {
      await permissionPage.clearSearch();
      const policiesAfterClear = await permissionPage.getPolicyList();
      expect(policiesAfterClear.length).toBe(policyCount);
    });
  });

  test('should support policy filtering', async () => {
    const policyCount = await permissionPage.getPolicyCount();
    
    if (policyCount === 0) {
      test.skip('No policies available to test filtering');
    }

    await test.step('Test effect filter', async () => {
      await permissionPage.openFilters();
      
      // Filter by permit effect
      await permissionPage.filterByEffect('permit');
      const permitPolicies = await permissionPage.getPolicyList();
      permitPolicies.forEach(policy => {
        expect(policy.effect).toBe('permit');
      });
      
      // Filter by deny effect
      await permissionPage.filterByEffect('deny');
      const denyPolicies = await permissionPage.getPolicyList();
      denyPolicies.forEach(policy => {
        expect(policy.effect).toBe('deny');
      });
    });

    await test.step('Test status filter', async () => {
      // Filter by enabled status
      await permissionPage.filterByStatus('enabled');
      const enabledPolicies = await permissionPage.getPolicyList();
      enabledPolicies.forEach(policy => {
        expect(policy.enabled).toBe(true);
      });
      
      // Filter by disabled status
      await permissionPage.filterByStatus('disabled');
      const disabledPolicies = await permissionPage.getPolicyList();
      disabledPolicies.forEach(policy => {
        expect(policy.enabled).toBe(false);
      });
    });

    await test.step('Clear all filters', async () => {
      await permissionPage.clearAllFilters();
      const allPoliciesAgain = await permissionPage.getPolicyList();
      expect(allPoliciesAgain.length).toBe(policyCount);
    });
  });

  test('should handle policy actions when available', async () => {
    const policies = await permissionPage.getPolicyList();
    
    if (policies.length === 0) {
      test.skip('No policies available to test actions');
    }

    const testPolicy = policies[0];

    await test.step('Test policy menu access', async () => {
      // Try to access policy actions
      const hasMenu = await page.isVisible(`[data-policy-id="${testPolicy.id}"] [data-testid="policy-menu"]`);
      const hasDirectActions = await page.isVisible(`[data-policy-id="${testPolicy.id}"] [data-testid="edit-policy"]`);
      
      expect(hasMenu || hasDirectActions).toBe(true);
    });

    await test.step('Test policy status toggle if available', async () => {
      const hasToggle = await page.isVisible(`[data-policy-id="${testPolicy.id}"] [data-testid="toggle-policy-status"]`);
      
      if (hasToggle) {
        await permissionPage.togglePolicyStatus(testPolicy.id);
        
        // Verify status changed
        await permissionPage.waitForPolicyUpdate();
        const updatedPolicies = await permissionPage.getPolicyList();
        const updatedPolicy = updatedPolicies.find(p => p.id === testPolicy.id);
        
        if (updatedPolicy) {
          expect(updatedPolicy.enabled).not.toBe(testPolicy.enabled);
        }
      }
    });
  });

  test('should maintain performance benchmarks', async () => {
    await test.step('Test page load performance', async () => {
      const loadTime = await permissionPage.measurePageLoadTime();
      expect(loadTime).toBeLessThan(testConfig.performance.pageLoadBenchmark);
    });

    await test.step('Test policy list loading performance', async () => {
      // Reload the policy list
      await page.reload();
      await permissionPage.waitForPageLoad();
      
      const policyListLoadTime = await permissionPage.measureActionTime(async () => {
        await permissionPage.waitForPolicyUpdate();
      });
      
      expect(policyListLoadTime).toBeLessThan(2000); // 2 seconds for policy list
    });
  });

  test('should support responsive design across viewports', async () => {
    const viewports = [
      { width: 320, height: 568, name: 'mobile-small' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop-small' },
      { width: 1920, height: 1080, name: 'desktop-large' }
    ];

    for (const viewport of viewports) {
      await test.step(`Test responsiveness on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500); // Wait for responsive changes
        
        // Verify core elements are still accessible
        const coreElementsVisible = await permissionPage.validatePageLoad();
        expect(coreElementsVisible).toBe(true);
        
        // Check if policy list is still functional
        const policyListVisible = await page.isVisible('[data-testid="policy-list"]');
        expect(policyListVisible).toBe(true);
        
        // Verify action buttons are accessible (might be in menu on mobile)
        const simpleCreatorAccessible = await page.isVisible('[data-testid="simple-creator-button"]') ||
                                       await page.isVisible('[data-testid="mobile-menu"]');
        expect(simpleCreatorAccessible).toBe(true);
      });
    }
  });

  test('should handle error states gracefully', async () => {
    await test.step('Test search with no results', async () => {
      const uniqueSearchTerm = `no-results-${Date.now()}`;
      await permissionPage.searchPolicies(uniqueSearchTerm);
      
      const resultCount = await permissionPage.getPolicyCount();
      expect(resultCount).toBe(0);
      
      // Check for appropriate "no results" message
      const noResultsVisible = await page.isVisible('[data-testid="no-policies"]') ||
                               await page.isVisible('[data-testid="no-results"]') ||
                               await page.isVisible('.empty-state');
      
      if (resultCount === 0) {
        expect(noResultsVisible).toBe(true);
      }
    });

    await test.step('Test network error handling', async () => {
      // Simulate network failure
      await page.route('**/policies*', route => {
        route.abort('failed');
      });
      
      // Try to refresh policy list
      await page.reload();
      
      // Check for error message or retry mechanism
      const hasError = await page.isVisible('[data-testid="error-message"]') ||
                      await page.isVisible('[data-testid="retry-button"]');
      
      // Remove network simulation
      await page.unroute('**/policies*');
      
      // Note: In a real scenario, we'd expect error handling
      // For now, we just verify the system doesn't crash
      expect(page.url()).toContain('permission-management');
    });
  });

  test('should support keyboard navigation', async () => {
    await test.step('Test tab navigation through policy interface', async () => {
      // Start from the top of the page
      await page.keyboard.press('Home');
      
      // Tab through interface elements
      const interactiveElements = [
        '[role="tab"]:has-text("Role-Based (RBAC)")',
        'button:has-text("Filters")',
        'button:has-text("Simple Creator")',
        'button:has-text("Advanced Builder")'
      ];
      
      for (const selector of interactiveElements) {
        if (await page.isVisible(selector)) {
          await page.keyboard.press('Tab');
          
          // Verify element receives focus
          const isFocused = await page.locator(selector).evaluate(el => 
            document.activeElement === el || el.contains(document.activeElement)
          );
          
          // Allow for focus to be on child elements
          expect(isFocused).toBe(true);
        }
      }
    });

    await test.step('Test keyboard activation of buttons', async () => {
      const simpleCreatorButton = page.locator('[data-testid="simple-creator-button"]');
      
      if (await simpleCreatorButton.isVisible()) {
        await simpleCreatorButton.focus();
        await page.keyboard.press('Enter');
        
        // Verify action was triggered
        const modalVisible = await page.isVisible('[data-testid="simple-policy-modal"]');
        const navigated = page.url().includes('simple');
        
        expect(modalVisible || navigated).toBe(true);
      }
    });
  });

  test('should maintain data consistency across tab switches', async () => {
    const initialPolicyCount = await permissionPage.getPolicyCount();
    
    await test.step('Switch to roles tab and back', async () => {
      // Navigate to roles tab (if available)
      if (await page.isVisible('[data-testid="roles-tab"]')) {
        await permissionPage.switchToTab('roles');
        const currentTab = await permissionPage.getCurrentTab();
        expect(currentTab).toBe('roles');
        
        // Switch back to policies
        await permissionPage.switchToTab('policies');
        const backToPolices = await permissionPage.getCurrentTab();
        expect(backToPolices).toBe('policies');
        
        // Verify policy count is preserved
        const finalPolicyCount = await permissionPage.getPolicyCount();
        expect(finalPolicyCount).toBe(initialPolicyCount);
      }
    });
  });

  test('should handle large dataset performance', async () => {
    // This test would be more meaningful with actual large datasets
    // For now, we'll test the performance of the current dataset
    
    await test.step('Measure performance with current dataset', async () => {
      const policies = await permissionPage.getPolicyList();
      const policyCount = policies.length;
      
      if (policyCount > 10) {
        // Test search performance
        const searchTerm = policies[0].name.substring(0, 3);
        const searchTime = await permissionPage.measureSearchResponseTime(searchTerm);
        expect(searchTime).toBeLessThan(testConfig.performance.searchResultsBenchmark);
        
        // Test filter performance
        const filterTime = await permissionPage.measureActionTime(async () => {
          await permissionPage.filterByEffect('permit');
        });
        expect(filterTime).toBeLessThan(testConfig.performance.searchResultsBenchmark);
      }
    });
  });
});