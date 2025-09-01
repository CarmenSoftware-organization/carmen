import { test, expect, Page, BrowserContext } from 'playwright/test';
import { PermissionManagementPage } from '../page-objects/pages/PermissionManagementPage';
import { testConfig } from '../config/test.config';

test.describe('RBAC/ABAC Toggle Functionality', () => {
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

    // Navigate to permission management page
    await permissionPage.navigateToPermissionManagement();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('should display RBAC/ABAC toggle on page load', async () => {
    await test.step('Validate page loads with toggle visible', async () => {
      const isPageValid = await permissionPage.validatePageLoad();
      expect(isPageValid).toBe(true);
      
      const toggle = permissionPage.toggle;
      const currentMode = await toggle.getCurrentMode();
      expect(currentMode).toMatch(/^(rbac|abac)$/);
    });
  });

  test('should switch from RBAC to ABAC mode', async () => {
    await test.step('Switch to RBAC mode first', async () => {
      await permissionPage.toggleToRBAC();
      const mode = await permissionPage.getCurrentMode();
      expect(mode).toBe('rbac');
    });

    await test.step('Switch to ABAC mode', async () => {
      const responseTime = await permissionPage.measureToggleResponseTime();
      expect(responseTime).toBeLessThan(testConfig.performance.toggleResponseBenchmark);
      
      await permissionPage.toggleToABAC();
      const mode = await permissionPage.getCurrentMode();
      expect(mode).toBe('abac');
    });

    await test.step('Verify mode persists after page reload', async () => {
      await page.reload();
      await permissionPage.waitForPageLoad();
      
      const mode = await permissionPage.getCurrentMode();
      expect(mode).toBe('abac');
    });
  });

  test('should switch from ABAC to RBAC mode', async () => {
    await test.step('Switch to ABAC mode first', async () => {
      await permissionPage.toggleToABAC();
      const mode = await permissionPage.getCurrentMode();
      expect(mode).toBe('abac');
    });

    await test.step('Switch to RBAC mode', async () => {
      const responseTime = await permissionPage.measureToggleResponseTime();
      expect(responseTime).toBeLessThan(testConfig.performance.toggleResponseBenchmark);
      
      await permissionPage.toggleToRBAC();
      const mode = await permissionPage.getCurrentMode();
      expect(mode).toBe('rbac');
    });

    await test.step('Verify mode persists after page reload', async () => {
      await page.reload();
      await permissionPage.waitForPageLoad();
      
      const mode = await permissionPage.getCurrentMode();
      expect(mode).toBe('rbac');
    });
  });

  test('should meet toggle response time benchmarks', async () => {
    const responseTime = await permissionPage.measureToggleResponseTime();
    
    expect(responseTime).toBeLessThan(testConfig.performance.toggleResponseBenchmark);
    
    if (responseTime > 300) {
      console.warn(`Toggle response time ${responseTime}ms exceeds ideal target of 300ms`);
    }
  });

  test('should handle migration process when switching to ABAC', async () => {
    await test.step('Start with RBAC mode', async () => {
      await permissionPage.toggleToRBAC();
      const mode = await permissionPage.getCurrentMode();
      expect(mode).toBe('rbac');
    });

    await test.step('Switch to ABAC and handle migration', async () => {
      const toggle = permissionPage.toggle;
      await toggle.switchToABAC();
      
      // Check if migration completed successfully
      const finalMode = await toggle.getCurrentMode();
      expect(finalMode).toBe('abac');
    });
  });

  test('should validate toggle accessibility', async () => {
    const toggle = permissionPage.toggle;
    const isAccessible = await toggle.validateToggleAccessibility();
    expect(isAccessible).toBe(true);
  });

  test('should support keyboard navigation', async () => {
    const toggle = permissionPage.toggle;
    
    await test.step('Focus on toggle with keyboard', async () => {
      await page.keyboard.press('Tab');
      
      // Check if toggle is focused
      const toggleElement = page.locator('[role="tab"]:has-text("Role-Based (RBAC)")');
      const isFocused = await toggleElement.evaluate(el => document.activeElement === el);
      expect(isFocused).toBe(true);
    });

    await test.step('Activate toggle with space key', async () => {
      const initialMode = await toggle.getCurrentMode();
      
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000); // Wait for toggle to complete
      
      const newMode = await toggle.getCurrentMode();
      expect(newMode).not.toBe(initialMode);
    });
  });

  test('should maintain performance under repeated switching', async () => {
    const toggle = permissionPage.toggle;
    const switchTimes = await toggle.testTogglePerformance(5);
    
    // All switches should be under benchmark
    for (const switchTime of switchTimes) {
      expect(switchTime).toBeLessThan(testConfig.performance.toggleResponseBenchmark);
    }
    
    // Average should be well under benchmark
    const averageTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
    expect(averageTime).toBeLessThan(testConfig.performance.toggleResponseBenchmark * 0.8);
  });

  test('should handle network delays gracefully', async () => {
    const toggle = permissionPage.toggle;
    const resilient = await toggle.testToggleNetworkResilience();
    expect(resilient).toBe(true);
  });

  test('should show appropriate loading states', async () => {
    const toggle = permissionPage.toggle;
    
    await test.step('Check toggle status during operation', async () => {
      // Start a toggle operation
      const statusPromise = toggle.getToggleStatus();
      await toggle.switchToABAC();
      
      const status = await statusPromise;
      expect(status.currentMode).toBeDefined();
      expect(status.isEnabled).toBe(true);
    });
  });

  test('should validate toggle in different viewport sizes', async () => {
    const viewports = [
      { width: 320, height: 568, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await test.step(`Test toggle functionality on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Wait for responsive layout to apply
        await page.waitForTimeout(500);
        
        // Verify toggle is visible and functional
        const toggle = permissionPage.toggle;
        const isVisible = await page.isVisible('[role="tab"]:has-text("Role-Based (RBAC)")') && 
                         await page.isVisible('[role="tab"]:has-text("Attribute-Based (ABAC)")');
        expect(isVisible).toBe(true);
        
        // Test toggle functionality
        const initialMode = await toggle.getCurrentMode();
        if (initialMode === 'rbac') {
          await toggle.switchToABAC();
          const newMode = await toggle.getCurrentMode();
          expect(newMode).toBe('abac');
        } else {
          await toggle.switchToRBAC();
          const newMode = await toggle.getCurrentMode();
          expect(newMode).toBe('rbac');
        }
      });
    }
  });

  test('should handle concurrent toggle attempts', async () => {
    const toggle = permissionPage.toggle;
    
    await test.step('Attempt rapid successive toggles', async () => {
      const initialMode = await toggle.getCurrentMode();
      
      // Start multiple toggle operations quickly
      const promises = [
        toggle.switchToABAC(),
        toggle.switchToRBAC(),
        toggle.switchToABAC()
      ];
      
      // Wait for all to complete
      await Promise.allSettled(promises);
      
      // Verify system is in a stable state
      await toggle.waitForToggleReady();
      const finalMode = await toggle.getCurrentMode();
      expect(finalMode).toMatch(/^(rbac|abac)$/);
    });
  });

  test('should display correct mode indicators', async () => {
    await test.step('Verify RBAC mode indicators', async () => {
      await permissionPage.toggleToRBAC();
      
      // Check for RBAC-specific UI elements
      const modeIndicator = page.locator('[data-testid="current-mode"]');
      const indicatorText = await modeIndicator.textContent();
      expect(indicatorText?.toLowerCase()).toContain('rbac');
    });

    await test.step('Verify ABAC mode indicators', async () => {
      await permissionPage.toggleToABAC();
      
      // Check for ABAC-specific UI elements
      const modeIndicator = page.locator('[data-testid="current-mode"]');
      const indicatorText = await modeIndicator.textContent();
      expect(indicatorText?.toLowerCase()).toContain('abac');
    });
  });

  test('should maintain data integrity during mode switching', async () => {
    // Get initial policy count
    const initialPolicyCount = await permissionPage.getPolicyCount();
    
    await test.step('Switch modes and verify data persistence', async () => {
      // Switch to opposite mode
      const initialMode = await permissionPage.getCurrentMode();
      if (initialMode === 'rbac') {
        await permissionPage.toggleToABAC();
      } else {
        await permissionPage.toggleToRBAC();
      }
      
      // Verify policy count remains the same
      const policyCountAfterSwitch = await permissionPage.getPolicyCount();
      expect(policyCountAfterSwitch).toBe(initialPolicyCount);
      
      // Switch back
      if (initialMode === 'rbac') {
        await permissionPage.toggleToRBAC();
      } else {
        await permissionPage.toggleToABAC();
      }
      
      // Verify data is still intact
      const finalPolicyCount = await permissionPage.getPolicyCount();
      expect(finalPolicyCount).toBe(initialPolicyCount);
    });
  });

  test('should show progress during migration', async () => {
    const toggle = permissionPage.toggle;
    
    await test.step('Monitor migration progress', async () => {
      await permissionPage.toggleToRBAC(); // Start from known state
      
      // Start migration
      const migrationPromise = toggle.switchToABAC();
      
      // Check if migration dialog appears
      try {
        await page.waitForSelector('[data-testid="migration-dialog"]', { timeout: 2000 });
        
        // Monitor progress if available
        const progressExists = await page.isVisible('[data-testid="migration-progress"]');
        if (progressExists) {
          let progress = 0;
          while (progress < 100) {
            progress = await toggle.getMigrationProgress();
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(100);
            
            if (progress >= 100) break;
            await page.waitForTimeout(500);
          }
        }
      } catch {
        // No migration dialog, direct switch
      }
      
      await migrationPromise;
      const finalMode = await toggle.getCurrentMode();
      expect(finalMode).toBe('abac');
    });
  });
});