import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

// End-to-end tests for complete price assignment flow
describe('Price Assignment Flow E2E Tests', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: process.env.CI === 'true' ? 0 : 100
    });
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    await context.close();
    await browser.close();
  });

  describe('Complete Vendor Price Collection to PR Assignment Flow', () => {
    it('should complete full flow from vendor price submission to PR assignment', async () => {
      // Step 1: Navigate to Price Management dashboard
      await page.goto(`${baseUrl}/price-management`);
      await expect(page.locator('h1')).toContainText('Price Management');

      // Step 2: Create vendor portal session
      await page.click('[data-testid="vendor-portal-button"]');
      await page.fill('[data-testid="vendor-select"]', 'vendor-1');
      await page.selectOption('[data-testid="category-select"]', 'electronics');
      await page.click('[data-testid="create-session-button"]');

      // Wait for session creation and get portal URL
      await page.waitForSelector('[data-testid="portal-url"]');
      const portalUrl = await page.textContent('[data-testid="portal-url"]');
      expect(portalUrl).toContain('/vendor-portal/');

      // Step 3: Navigate to vendor portal
      await page.goto(portalUrl!);
      await expect(page.locator('h1')).toContainText('Price Submission Portal');

      // Step 4: Submit pricing data via portal
      await page.fill('[data-testid="product-id-0"]', 'PROD-E2E-001');
      await page.fill('[data-testid="product-name-0"]', 'E2E Test Product');
      await page.fill('[data-testid="unit-price-0"]', '99.99');
      await page.selectOption('[data-testid="currency-0"]', 'USD');
      await page.fill('[data-testid="min-quantity-0"]', '1');

      // Add another product
      await page.click('[data-testid="add-product-button"]');
      await page.fill('[data-testid="product-id-1"]', 'PROD-E2E-002');
      await page.fill('[data-testid="product-name-1"]', 'E2E Test Product 2');
      await page.fill('[data-testid="unit-price-1"]', '149.99');
      await page.selectOption('[data-testid="currency-1"]', 'USD');
      await page.fill('[data-testid="min-quantity-1"]', '5');

      // Submit the pricing
      await page.click('[data-testid="submit-prices-button"]');
      await page.waitForSelector('[data-testid="submission-success"]');
      await expect(page.locator('[data-testid="submission-success"]')).toContainText('Successfully submitted');

      // Step 5: Navigate to Purchase Request creation
      await page.goto(`${baseUrl}/procurement/purchase-requests/create`);
      await expect(page.locator('h1')).toContainText('Create Purchase Request');

      // Step 6: Create PR with the submitted products
      await page.fill('[data-testid="pr-title"]', 'E2E Test Purchase Request');
      await page.fill('[data-testid="pr-description"]', 'Testing end-to-end price assignment');
      await page.selectOption('[data-testid="department-select"]', 'operations');
      await page.selectOption('[data-testid="location-select"]', 'warehouse-1');

      // Add PR items
      await page.click('[data-testid="add-item-button"]');
      await page.fill('[data-testid="item-product-id-0"]', 'PROD-E2E-001');
      await page.fill('[data-testid="item-quantity-0"]', '3');
      await page.fill('[data-testid="item-description-0"]', 'E2E Test Product for PR');

      await page.click('[data-testid="add-item-button"]');
      await page.fill('[data-testid="item-product-id-1"]', 'PROD-E2E-002');
      await page.fill('[data-testid="item-quantity-1"]', '10');
      await page.fill('[data-testid="item-description-1"]', 'E2E Test Product 2 for PR');

      // Step 7: Save PR and trigger price assignment
      await page.click('[data-testid="save-pr-button"]');
      await page.waitForSelector('[data-testid="pr-saved-success"]');

      // Step 8: Verify automatic price assignment
      await page.waitForSelector('[data-testid="price-assignment-indicator"]');
      
      // Check first item assignment
      const firstItemPrice = await page.textContent('[data-testid="assigned-price-0"]');
      expect(firstItemPrice).toContain('$99.99');
      
      const firstItemVendor = await page.textContent('[data-testid="assigned-vendor-0"]');
      expect(firstItemVendor).toContain('vendor-1');

      // Check second item assignment
      const secondItemPrice = await page.textContent('[data-testid="assigned-price-1"]');
      expect(secondItemPrice).toContain('$149.99');

      // Step 9: View assignment details and alternatives
      await page.click('[data-testid="view-alternatives-0"]');
      await page.waitForSelector('[data-testid="alternatives-modal"]');
      
      // Verify alternatives are shown
      await expect(page.locator('[data-testid="alternatives-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="assignment-confidence"]')).toBeVisible();
      await expect(page.locator('[data-testid="assignment-reason"]')).toBeVisible();

      await page.click('[data-testid="close-alternatives-modal"]');

      // Step 10: Test price override functionality
      await page.click('[data-testid="override-price-0"]');
      await page.waitForSelector('[data-testid="override-modal"]');
      
      await page.fill('[data-testid="override-reason"]', 'Better vendor relationship');
      await page.selectOption('[data-testid="override-vendor"]', 'vendor-2');
      await page.fill('[data-testid="override-price"]', '95.00');
      
      await page.click('[data-testid="confirm-override-button"]');
      await page.waitForSelector('[data-testid="override-success"]');

      // Verify override was applied
      const overriddenPrice = await page.textContent('[data-testid="assigned-price-0"]');
      expect(overriddenPrice).toContain('$95.00');
      
      const overriddenVendor = await page.textContent('[data-testid="assigned-vendor-0"]');
      expect(overriddenVendor).toContain('vendor-2');

      // Step 11: Check assignment history
      await page.click('[data-testid="view-history-0"]');
      await page.waitForSelector('[data-testid="history-modal"]');
      
      const historyEntries = await page.locator('[data-testid="history-entry"]').count();
      expect(historyEntries).toBeGreaterThan(1); // Original assignment + override

      await page.click('[data-testid="close-history-modal"]');

      // Step 12: Submit PR for approval
      await page.click('[data-testid="submit-for-approval-button"]');
      await page.waitForSelector('[data-testid="pr-submitted-success"]');
      
      await expect(page.locator('[data-testid="pr-status"]')).toContainText('Pending Approval');
    });

    it('should handle multi-currency price assignment flow', async () => {
      // Step 1: Create vendor portal session for international vendor
      await page.goto(`${baseUrl}/price-management/vendor-portal`);
      await page.fill('[data-testid="vendor-select"]', 'vendor-international');
      await page.selectOption('[data-testid="category-select"]', 'electronics');
      await page.click('[data-testid="create-session-button"]');

      const portalUrl = await page.textContent('[data-testid="portal-url"]');
      
      // Step 2: Submit multi-currency pricing
      await page.goto(portalUrl!);
      
      await page.fill('[data-testid="product-id-0"]', 'PROD-MULTI-001');
      await page.fill('[data-testid="product-name-0"]', 'Multi-Currency Product');
      await page.fill('[data-testid="unit-price-0"]', '85.50');
      await page.selectOption('[data-testid="currency-0"]', 'EUR');
      await page.fill('[data-testid="min-quantity-0"]', '1');

      await page.click('[data-testid="submit-prices-button"]');
      await page.waitForSelector('[data-testid="submission-success"]');

      // Step 3: Create PR with multi-currency product
      await page.goto(`${baseUrl}/procurement/purchase-requests/create`);
      
      await page.fill('[data-testid="pr-title"]', 'Multi-Currency PR Test');
      await page.selectOption('[data-testid="department-select"]', 'operations');
      
      await page.click('[data-testid="add-item-button"]');
      await page.fill('[data-testid="item-product-id-0"]', 'PROD-MULTI-001');
      await page.fill('[data-testid="item-quantity-0"]', '2');

      await page.click('[data-testid="save-pr-button"]');
      await page.waitForSelector('[data-testid="pr-saved-success"]');

      // Step 4: Verify currency conversion in assignment
      await page.waitForSelector('[data-testid="price-assignment-indicator"]');
      
      // Should show both original and converted prices
      await expect(page.locator('[data-testid="original-price-0"]')).toContainText('€85.50');
      await expect(page.locator('[data-testid="converted-price-0"]')).toContainText('$'); // USD conversion
      await expect(page.locator('[data-testid="exchange-rate-0"]')).toBeVisible();
    });

    it('should handle business rules in price assignment flow', async () => {
      // Step 1: Create a business rule
      await page.goto(`${baseUrl}/price-management/business-rules`);
      await expect(page.locator('h1')).toContainText('Business Rules');

      await page.click('[data-testid="create-rule-button"]');
      await page.fill('[data-testid="rule-name"]', 'E2E Test Rule');
      await page.fill('[data-testid="rule-description"]', 'Prefer vendor-premium for high-value items');

      // Add condition
      await page.click('[data-testid="add-condition-button"]');
      await page.selectOption('[data-testid="condition-field"]', 'quantity');
      await page.selectOption('[data-testid="condition-operator"]', 'greaterThan');
      await page.fill('[data-testid="condition-value"]', '5');

      // Add action
      await page.click('[data-testid="add-action-button"]');
      await page.selectOption('[data-testid="action-type"]', 'assignVendor');
      await page.selectOption('[data-testid="action-vendor"]', 'vendor-premium');

      await page.fill('[data-testid="rule-priority"]', '1');
      await page.click('[data-testid="save-rule-button"]');
      await page.waitForSelector('[data-testid="rule-saved-success"]');

      // Step 2: Test the rule with a PR
      await page.goto(`${baseUrl}/procurement/purchase-requests/create`);
      
      await page.fill('[data-testid="pr-title"]', 'Business Rule Test PR');
      await page.selectOption('[data-testid="department-select"]', 'operations');
      
      await page.click('[data-testid="add-item-button"]');
      await page.fill('[data-testid="item-product-id-0"]', 'PROD-RULE-001');
      await page.fill('[data-testid="item-quantity-0"]', '10'); // Triggers the rule
      await page.fill('[data-testid="item-description-0"]', 'High quantity item for rule test');

      await page.click('[data-testid="save-pr-button"]');
      await page.waitForSelector('[data-testid="pr-saved-success"]');

      // Step 3: Verify rule was applied
      await page.waitForSelector('[data-testid="price-assignment-indicator"]');
      
      const assignedVendor = await page.textContent('[data-testid="assigned-vendor-0"]');
      expect(assignedVendor).toContain('vendor-premium');
      
      const assignmentReason = await page.textContent('[data-testid="assignment-reason-0"]');
      expect(assignmentReason).toContain('business rule');
    });

    it('should handle bulk price assignment flow', async () => {
      // Step 1: Create PR with multiple items
      await page.goto(`${baseUrl}/procurement/purchase-requests/create`);
      
      await page.fill('[data-testid="pr-title"]', 'Bulk Assignment Test PR');
      await page.selectOption('[data-testid="department-select"]', 'operations');

      // Add multiple items
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="add-item-button"]');
        await page.fill(`[data-testid="item-product-id-${i}"]`, `PROD-BULK-00${i + 1}`);
        await page.fill(`[data-testid="item-quantity-${i}"]`, `${i + 1}`);
        await page.fill(`[data-testid="item-description-${i}"]`, `Bulk test item ${i + 1}`);
      }

      // Step 2: Save and trigger bulk assignment
      await page.click('[data-testid="save-pr-button"]');
      await page.waitForSelector('[data-testid="pr-saved-success"]');

      // Step 3: Wait for all assignments to complete
      await page.waitForSelector('[data-testid="bulk-assignment-complete"]');

      // Step 4: Verify all items have assignments
      for (let i = 0; i < 5; i++) {
        await expect(page.locator(`[data-testid="assigned-price-${i}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="assigned-vendor-${i}"]`)).toBeVisible();
      }

      // Step 5: Check bulk assignment summary
      await page.click('[data-testid="view-assignment-summary"]');
      await page.waitForSelector('[data-testid="assignment-summary-modal"]');
      
      await expect(page.locator('[data-testid="total-items"]')).toContainText('5');
      await expect(page.locator('[data-testid="successful-assignments"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-confidence"]')).toBeVisible();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle vendor portal session expiration', async () => {
      // This test would require manipulating session expiration
      // For now, we'll test the error handling UI
      await page.goto(`${baseUrl}/vendor-portal/expired-token`);
      
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="request-new-session-button"]')).toBeVisible();
    });

    it('should handle products with no available pricing', async () => {
      await page.goto(`${baseUrl}/procurement/purchase-requests/create`);
      
      await page.fill('[data-testid="pr-title"]', 'No Pricing Test PR');
      await page.selectOption('[data-testid="department-select"]', 'operations');
      
      await page.click('[data-testid="add-item-button"]');
      await page.fill('[data-testid="item-product-id-0"]', 'PROD-NO-PRICING');
      await page.fill('[data-testid="item-quantity-0"]', '1');

      await page.click('[data-testid="save-pr-button"]');
      await page.waitForSelector('[data-testid="pr-saved-success"]');

      // Should show no pricing available indicator
      await expect(page.locator('[data-testid="no-pricing-indicator-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="manual-pricing-required-0"]')).toBeVisible();
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network error by going offline
      await context.setOffline(true);
      
      await page.goto(`${baseUrl}/price-management`);
      
      // Should show offline indicator or error message
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      
      // Restore network
      await context.setOffline(false);
      
      // Should recover automatically
      await page.reload();
      await expect(page.locator('h1')).toContainText('Price Management');
    });
  });

  describe('Performance and User Experience', () => {
    it('should load price assignment results within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto(`${baseUrl}/procurement/purchase-requests/create`);
      
      await page.fill('[data-testid="pr-title"]', 'Performance Test PR');
      await page.selectOption('[data-testid="department-select"]', 'operations');
      
      await page.click('[data-testid="add-item-button"]');
      await page.fill('[data-testid="item-product-id-0"]', 'PROD-PERF-001');
      await page.fill('[data-testid="item-quantity-0"]', '1');

      await page.click('[data-testid="save-pr-button"]');
      await page.waitForSelector('[data-testid="price-assignment-indicator"]');
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should complete within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    it('should provide real-time feedback during price submission', async () => {
      // Create vendor portal session
      await page.goto(`${baseUrl}/price-management/vendor-portal`);
      await page.fill('[data-testid="vendor-select"]', 'vendor-1');
      await page.click('[data-testid="create-session-button"]');

      const portalUrl = await page.textContent('[data-testid="portal-url"]');
      await page.goto(portalUrl!);

      // Test real-time validation
      await page.fill('[data-testid="product-id-0"]', 'PROD-FEEDBACK-001');
      await page.fill('[data-testid="unit-price-0"]', 'invalid-price');
      
      // Should show validation error immediately
      await expect(page.locator('[data-testid="price-validation-error-0"]')).toBeVisible();
      
      // Fix the price
      await page.fill('[data-testid="unit-price-0"]', '99.99');
      
      // Error should disappear
      await expect(page.locator('[data-testid="price-validation-error-0"]')).not.toBeVisible();
    });
  });
});