import { Page } from 'playwright';
import { BasePage } from '../base/BasePage';
import { testSelectors } from '../../config/test.config';

export class ToggleComponent extends BasePage {
  private readonly selectors = {
    rbacButton: testSelectors.rbacButton,
    abacButton: testSelectors.abacButton,
    migrationDialog: testSelectors.migrationDialog,
    confirmMigration: testSelectors.confirmMigration,
    cancelMigration: testSelectors.cancelMigration,
    migrationProgress: testSelectors.migrationProgress,
    migrationComplete: testSelectors.migrationComplete
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Get the current mode (RBAC or ABAC)
   */
  async getCurrentMode(): Promise<'rbac' | 'abac'> {
    try {
      // Wait for the tab list to be visible
      const tabList = this.page.locator('[role="tablist"]');
      await tabList.waitFor({ state: 'visible', timeout: 5000 });
      
      // Check which tab has the active state
      const rbacTab = this.page.locator(this.selectors.rbacButton);
      const abacTab = this.page.locator(this.selectors.abacButton);
      
      // Wait for tabs to be visible
      await rbacTab.waitFor({ state: 'visible', timeout: 3000 });
      await abacTab.waitFor({ state: 'visible', timeout: 3000 });
      
      // Check the data-state attribute to determine active tab
      const rbacState = await rbacTab.getAttribute('data-state');
      const abacState = await abacTab.getAttribute('data-state');
      
      if (rbacState === 'active') {
        return 'rbac';
      } else if (abacState === 'active') {
        return 'abac';
      }
      
      // Fallback: check aria-selected attribute
      const rbacSelected = await rbacTab.getAttribute('aria-selected');
      const abacSelected = await abacTab.getAttribute('aria-selected');
      
      if (rbacSelected === 'true') {
        return 'rbac';
      } else if (abacSelected === 'true') {
        return 'abac';
      }
      
      // Default to RBAC if unclear
      console.log('Could not determine active state, defaulting to RBAC');
      return 'rbac';
    } catch (error) {
      console.warn('Could not determine current mode, defaulting to RBAC:', error);
      return 'rbac';
    }
  }

  /**
   * Switch to ABAC mode from RBAC
   */
  async switchToABAC(): Promise<void> {
    const currentMode = await this.getCurrentMode();
    if (currentMode === 'abac') {
      console.log('Already in ABAC mode, skipping switch');
      return;
    }

    console.log('Switching from RBAC to ABAC mode');
    const startTime = Date.now();
    
    // Click the ABAC tab
    await this.clickElement(this.selectors.abacButton);
    
    // Wait a moment for the tab switch to complete
    await this.waitForTimeout(200);
    
    // Handle potential migration dialog (though unlikely with a tab switch)
    try {
      await this.page.waitForSelector(this.selectors.migrationDialog, { timeout: 2000 });
      console.log('Migration dialog appeared, confirming migration');
      
      await this.clickElement(this.selectors.confirmMigration);
      
      // Wait for migration to complete
      await this.waitForMigrationComplete();
      
    } catch (error) {
      console.log('No migration dialog appeared, direct tab switch completed');
    }

    // Verify the switch was successful
    const endTime = Date.now();
    const switchTime = endTime - startTime;
    
    console.log(`Tab switch took ${switchTime}ms`);
    if (switchTime > 500) {
      console.warn(`Tab switch took ${switchTime}ms, which exceeds 500ms benchmark`);
    }

    // Verify mode change
    const newMode = await this.getCurrentMode();
    if (newMode !== 'abac') {
      throw new Error(`Failed to switch to ABAC mode. Current mode: ${newMode}`);
    }
    
    console.log('Successfully switched to ABAC mode');
  }

  /**
   * Switch to RBAC mode from ABAC
   */
  async switchToRBAC(): Promise<void> {
    const currentMode = await this.getCurrentMode();
    if (currentMode === 'rbac') {
      console.log('Already in RBAC mode, skipping switch');
      return;
    }

    console.log('Switching from ABAC to RBAC mode');
    const startTime = Date.now();
    
    // Click the RBAC tab
    await this.clickElement(this.selectors.rbacButton);
    
    // Wait a moment for the tab switch to complete
    await this.waitForTimeout(200);
    
    // Handle potential confirmation dialog
    try {
      const confirmButton = this.page.locator('[data-testid="confirm-rbac-switch"]');
      await confirmButton.waitFor({ state: 'visible', timeout: 2000 });
      await confirmButton.click();
      console.log('RBAC switch confirmation completed');
    } catch (error) {
      console.log('No confirmation dialog needed for RBAC switch');
    }

    const endTime = Date.now();
    const switchTime = endTime - startTime;
    
    console.log(`RBAC switch took ${switchTime}ms`);
    if (switchTime > 500) {
      console.warn(`RBAC switch took ${switchTime}ms, exceeds 500ms target`);
    }

    // Verify mode change
    const newMode = await this.getCurrentMode();
    if (newMode !== 'rbac') {
      throw new Error(`Failed to switch to RBAC mode. Current mode: ${newMode}`);
    }
    
    console.log('Successfully switched to RBAC mode');
  }

  /**
   * Wait for migration process to complete
   */
  async waitForMigrationComplete(timeout: number = 30000): Promise<void> {
    console.log('Waiting for migration to complete...');
    
    try {
      // First check if migration progress indicator exists
      if (await this.isElementVisible(this.selectors.migrationProgress)) {
        // Monitor migration progress
        let progress = 0;
        while (progress < 100) {
          await this.waitForTimeout(1000);
          progress = await this.getMigrationProgress();
          console.log(`Migration progress: ${progress}%`);
          
          if (progress >= 100) break;
        }
      }
      
      // Wait for migration complete indicator
      await this.page.waitForSelector(this.selectors.migrationComplete, { 
        timeout: timeout,
        state: 'visible'
      });
      
      console.log('Migration completed successfully');
      
    } catch (error) {
      throw new Error(`Migration did not complete within ${timeout}ms: ${error}`);
    }
  }

  /**
   * Cancel an ongoing migration
   */
  async cancelMigration(): Promise<void> {
    console.log('Canceling migration');
    await this.clickElement(this.selectors.cancelMigration);
    await this.page.waitForSelector(this.selectors.migrationDialog, { 
      state: 'hidden',
      timeout: 5000 
    });
    console.log('Migration canceled');
  }

  /**
   * Get the current migration progress percentage
   */
  async getMigrationProgress(): Promise<number> {
    try {
      const progressElement = this.page.locator(this.selectors.migrationProgress);
      const progressText = await progressElement.textContent();
      
      if (!progressText) return 0;
      
      const match = progressText.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate the toggle has proper accessibility attributes
   */
  async validateToggleAccessibility(): Promise<boolean> {
    const toggle = this.page.locator(this.selectors.toggle);
    
    try {
      // Check ARIA attributes
      const role = await toggle.getAttribute('role');
      const ariaLabel = await toggle.getAttribute('aria-label');
      const ariaChecked = await toggle.getAttribute('aria-checked');
      
      console.log('Toggle accessibility attributes:', { role, ariaLabel, ariaChecked });
      
      // Test keyboard focus
      await toggle.focus();
      const isFocused = await toggle.evaluate(el => document.activeElement === el);
      
      // Test keyboard interaction
      await this.page.keyboard.press('Space');
      await this.waitForTimeout(100);
      
      const hasValidRole = role === 'switch' || role === 'checkbox' || role === 'button';
      const hasValidLabel = ariaLabel !== null && ariaLabel.length > 0;
      const hasValidState = ariaChecked !== null;
      
      const isAccessible = hasValidRole && hasValidLabel && hasValidState && isFocused;
      
      if (!isAccessible) {
        console.warn('Toggle accessibility issues:', {
          hasValidRole,
          hasValidLabel,
          hasValidState,
          isFocused
        });
      }
      
      return isAccessible;
      
    } catch (error) {
      console.error('Toggle accessibility validation failed:', error);
      return false;
    }
  }

  /**
   * Test toggle functionality under load
   */
  async testTogglePerformance(iterations: number = 5): Promise<number[]> {
    const switchTimes: number[] = [];
    const initialMode = await this.getCurrentMode();
    
    for (let i = 0; i < iterations; i++) {
      console.log(`Performance test iteration ${i + 1}/${iterations}`);
      
      const startTime = Date.now();
      
      // Toggle to opposite mode
      if (await this.getCurrentMode() === 'rbac') {
        await this.switchToABAC();
      } else {
        await this.switchToRBAC();
      }
      
      const endTime = Date.now();
      switchTimes.push(endTime - startTime);
      
      // Small delay between iterations
      await this.waitForTimeout(500);
    }
    
    // Return to initial mode
    if (initialMode === 'rbac' && await this.getCurrentMode() === 'abac') {
      await this.switchToRBAC();
    } else if (initialMode === 'abac' && await this.getCurrentMode() === 'rbac') {
      await this.switchToABAC();
    }
    
    return switchTimes;
  }

  /**
   * Measure toggle response time with detailed metrics
   */
  async measureToggleResponseTime(): Promise<{
    totalTime: number;
    visualUpdateTime: number;
    migrationTime?: number;
  }> {
    const initialMode = await this.getCurrentMode();
    const startTime = Date.now();
    
    // Start toggle
    await this.clickElement(this.selectors.toggle);
    
    // Measure visual update time (when toggle visually changes)
    const visualUpdateStartTime = Date.now();
    const targetMode = initialMode === 'rbac' ? 'abac' : 'rbac';
    
    let visualUpdateTime = 0;
    let migrationTime = 0;
    
    // Wait for visual change
    let currentMode = await this.getCurrentMode();
    while (currentMode === initialMode) {
      await this.waitForTimeout(50);
      currentMode = await this.getCurrentMode();
      
      // Timeout check
      if (Date.now() - visualUpdateStartTime > 5000) {
        throw new Error('Toggle did not update visually within 5 seconds');
      }
    }
    
    visualUpdateTime = Date.now() - visualUpdateStartTime;
    
    // Handle migration if needed
    try {
      if (await this.isElementVisible(this.selectors.migrationDialog)) {
        const migrationStartTime = Date.now();
        await this.clickElement(this.selectors.confirmMigration);
        await this.waitForMigrationComplete();
        migrationTime = Date.now() - migrationStartTime;
      }
    } catch (error) {
      // No migration needed
    }
    
    const totalTime = Date.now() - startTime;
    
    return {
      totalTime,
      visualUpdateTime,
      migrationTime: migrationTime > 0 ? migrationTime : undefined
    };
  }

  /**
   * Validate toggle state persistence after page reload
   */
  async validateTogglePersistence(): Promise<boolean> {
    const initialMode = await this.getCurrentMode();
    
    // Switch to opposite mode
    if (initialMode === 'rbac') {
      await this.switchToABAC();
    } else {
      await this.switchToRBAC();
    }
    
    const modeAfterSwitch = await this.getCurrentMode();
    
    // Reload page
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.waitForPageLoad();
    
    // Check if mode persisted
    const modeAfterReload = await this.getCurrentMode();
    
    const persisted = modeAfterSwitch === modeAfterReload;
    
    if (!persisted) {
      console.warn(`Toggle state not persistent. Expected: ${modeAfterSwitch}, Got: ${modeAfterReload}`);
    }
    
    return persisted;
  }

  /**
   * Test toggle behavior during network issues
   */
  async testToggleNetworkResilience(): Promise<boolean> {
    try {
      // Simulate slow network
      await this.page.route('**/*', route => {
        setTimeout(() => route.continue(), 2000); // 2s delay
      });
      
      const initialMode = await this.getCurrentMode();
      
      // Try to switch mode with network delay
      const startTime = Date.now();
      if (initialMode === 'rbac') {
        await this.switchToABAC();
      } else {
        await this.switchToRBAC();
      }
      const endTime = Date.now();
      
      // Remove network simulation
      await this.page.unroute('**/*');
      
      const finalMode = await this.getCurrentMode();
      const switchSuccessful = finalMode !== initialMode;
      const reasonableTime = (endTime - startTime) < 30000; // Should complete within 30s
      
      console.log(`Network resilience test: ${switchSuccessful ? 'PASSED' : 'FAILED'} (${endTime - startTime}ms)`);
      
      return switchSuccessful && reasonableTime;
      
    } catch (error) {
      console.error('Network resilience test failed:', error);
      await this.page.unroute('**/*'); // Cleanup
      return false;
    }
  }

  /**
   * Get detailed toggle status information
   */
  async getToggleStatus(): Promise<{
    currentMode: 'rbac' | 'abac';
    isEnabled: boolean;
    isMigrating: boolean;
    migrationProgress?: number;
  }> {
    const currentMode = await this.getCurrentMode();
    const isEnabled = await this.isElementEnabled(this.selectors.toggle);
    const isMigrating = await this.isElementVisible(this.selectors.migrationDialog) ||
                       await this.isElementVisible(this.selectors.migrationProgress);
    
    let migrationProgress: number | undefined;
    if (isMigrating) {
      migrationProgress = await this.getMigrationProgress();
    }
    
    return {
      currentMode,
      isEnabled,
      isMigrating,
      migrationProgress
    };
  }

  /**
   * Wait for toggle to be ready for interaction
   */
  async waitForToggleReady(timeout: number = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.getToggleStatus();
      
      if (status.isEnabled && !status.isMigrating) {
        return;
      }
      
      await this.waitForTimeout(100);
    }
    
    throw new Error(`Toggle not ready within ${timeout}ms`);
  }
}