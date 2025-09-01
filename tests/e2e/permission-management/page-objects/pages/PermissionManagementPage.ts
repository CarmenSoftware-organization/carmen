import { Page } from 'playwright';
import { BasePage } from '../base/BasePage';
import { ToggleComponent } from '../components/ToggleComponent';
import { PolicyListComponent } from '../components/PolicyListComponent';
import { testSelectors, testData } from '../../config/test.config';

export interface PolicyData {
  name: string;
  description: string;
  priority: number;
  effect: 'permit' | 'deny';
  conditions?: Array<{
    attribute: string;
    operator: string;
    value: any;
  }>;
}

export interface PolicyListItem {
  id: string;
  name: string;
  status: string;
  priority: number;
  effect: string;
  enabled: boolean;
}

export interface RoleData {
  name: string;
  description: string;
  department?: string;
  permissions: string[];
}

export class PermissionManagementPage extends BasePage {
  private toggle: ToggleComponent;
  private policyList: PolicyListComponent;

  constructor(page: Page) {
    super(page);
    this.toggle = new ToggleComponent(page);
    this.policyList = new PolicyListComponent(page);
  }

  // Navigation methods
  async navigateToPermissionManagement(): Promise<void> {
    await this.navigate('/system-administration/permission-management/policies');
    await this.waitForPageLoad();
    // Wait for key page elements that actually exist in the DOM
    await Promise.all([
      this.expectElementVisible('h1:has-text("Policy Management")'),
      this.expectElementVisible('[role="tablist"]'),
      this.expectElementVisible('button:has-text("Simple Creator")'),
      this.expectElementVisible('table')
    ]);
  }

  async navigateToPolicies(): Promise<void> {
    await this.navigate('/system-administration/permission-management/policies');
    await this.waitForPageLoad();
  }

  async navigateToRoles(): Promise<void> {
    await this.navigate('/system-administration/permission-management/roles');
    await this.waitForPageLoad();
  }

  async navigateToSubscriptions(): Promise<void> {
    await this.navigate('/system-administration/permission-management/subscriptions');
    await this.waitForPageLoad();
  }

  // Tab navigation
  async switchToTab(tab: 'policies' | 'roles' | 'subscription'): Promise<void> {
    const tabSelector = testSelectors[`${tab}Tab` as keyof typeof testSelectors];
    await this.clickElement(tabSelector as string);
    
    // Wait for tab content to load
    await this.page.waitForSelector(`[data-testid="${tab}-content"]`, {
      state: 'visible',
      timeout: 5000
    });
  }

  async getCurrentTab(): Promise<string> {
    // Check which tab is currently active by looking for aria-selected="true" or data-state="active"
    const activeTabs = [
      { name: 'policies', selector: testSelectors.policiesTab },
      { name: 'roles', selector: testSelectors.rolesTab },
      { name: 'subscription', selector: testSelectors.subscriptionTab }
    ];

    for (const tab of activeTabs) {
      const tabElement = this.page.locator(tab.selector);
      const isActive = await tabElement.getAttribute('data-state') === 'active' ||
                       await tabElement.getAttribute('aria-selected') === 'true';
      if (isActive) {
        return tab.name;
      }
    }
    
    return 'policies'; // default
  }

  // RBAC/ABAC Toggle operations
  async getCurrentMode(): Promise<'rbac' | 'abac'> {
    return await this.toggle.getCurrentMode();
  }

  async toggleToABAC(): Promise<void> {
    await this.toggle.switchToABAC();
  }

  async toggleToRBAC(): Promise<void> {
    await this.toggle.switchToRBAC();
  }

  async measureToggleResponseTime(): Promise<number> {
    const currentMode = await this.getCurrentMode();
    const targetMode = currentMode === 'rbac' ? 'abac' : 'rbac';
    
    const startTime = Date.now();
    
    if (targetMode === 'abac') {
      await this.toggleToABAC();
    } else {
      await this.toggleToRBAC();
    }
    
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Policy Management operations
  async openSimpleCreator(): Promise<void> {
    await this.clickElement(testSelectors.simpleCreatorButton);
  }

  async openAdvancedBuilder(): Promise<void> {
    await this.clickElement(testSelectors.newPolicyButton);
  }

  async getPolicyCount(): Promise<number> {
    return await this.policyList.getRowCount();
  }

  async getPolicyList(): Promise<PolicyListItem[]> {
    // Get all policy items from the list
    const policyItems = this.page.locator(testSelectors.policyItem);
    const count = await policyItems.count();
    
    const policies: PolicyListItem[] = [];
    for (let i = 0; i < count; i++) {
      const item = policyItems.nth(i);
      
      const id = await item.getAttribute('data-policy-id') || `policy-${i}`;
      const name = await item.locator(testSelectors.policyName).textContent() || '';
      const status = await item.locator(testSelectors.policyStatus).textContent() || '';
      const priorityText = await item.locator(testSelectors.policyPriority).textContent() || '0';
      const priority = parseInt(priorityText);
      
      // Determine effect and enabled status from the policy item
      const effect = await item.getAttribute('data-effect') || 'permit';
      const enabled = await item.getAttribute('data-enabled') === 'true';
      
      policies.push({
        id,
        name: name.trim(),
        status: status.trim(),
        priority,
        effect,
        enabled
      });
    }
    
    return policies;
  }

  async searchPolicies(query: string): Promise<void> {
    await this.fillField(testSelectors.searchInput, query);
    // Wait for search debounce
    await this.waitForTimeout(500);
    await this.waitForLoadingComplete();
  }

  async clearSearch(): Promise<void> {
    await this.fillField(testSelectors.searchInput, '');
    await this.waitForTimeout(500);
    await this.waitForLoadingComplete();
  }

  async measureSearchResponseTime(query: string): Promise<number> {
    const startTime = Date.now();
    await this.searchPolicies(query);
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Filter operations
  async openFilters(): Promise<void> {
    await this.clickElement(testSelectors.filtersButton);
    await this.expectElementVisible(testSelectors.filtersPanel);
  }

  async closeFilters(): Promise<void> {
    await this.clickElement(testSelectors.filtersButton);
    await this.expectElementHidden(testSelectors.filtersPanel);
  }

  async filterByEffect(effect: 'permit' | 'deny' | 'all'): Promise<void> {
    await this.openFilters();
    await this.selectOption(testSelectors.effectFilter, effect);
    await this.waitForLoadingComplete();
  }

  async filterByStatus(status: 'enabled' | 'disabled' | 'all'): Promise<void> {
    await this.openFilters();
    await this.selectOption(testSelectors.statusFilter, status);
    await this.waitForLoadingComplete();
  }

  async clearAllFilters(): Promise<void> {
    await this.openFilters();
    await this.selectOption(testSelectors.effectFilter, 'all');
    await this.selectOption(testSelectors.statusFilter, 'all');
    await this.fillField(testSelectors.searchInput, '');
    await this.waitForLoadingComplete();
  }

  // Policy actions
  async editPolicy(policyId: string): Promise<void> {
    const editButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="edit-policy"]`);
    await editButton.click();
  }

  async deletePolicy(policyId: string): Promise<void> {
    const deleteButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="delete-policy"]`);
    await deleteButton.click();
    
    // Confirm deletion if modal appears
    try {
      await this.page.waitForSelector('[data-testid="confirm-delete"]', { timeout: 2000 });
      await this.clickElement('[data-testid="confirm-delete"]');
    } catch {
      // No confirmation modal
    }
  }

  async togglePolicyStatus(policyId: string): Promise<void> {
    const toggleButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="toggle-policy-status"]`);
    await toggleButton.click();
  }

  async clonePolicy(policyId: string): Promise<void> {
    const cloneButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="clone-policy"]`);
    await cloneButton.click();
  }

  async testPolicy(policyId: string): Promise<void> {
    const testButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="test-policy"]`);
    await testButton.click();
  }

  // Policy creation workflow
  async createSimplePolicy(policyData: PolicyData): Promise<string> {
    await this.openSimpleCreator();
    
    // Assume simple creator modal opens
    await this.page.waitForSelector('[data-testid="simple-policy-modal"]');
    
    // Fill in basic policy information
    await this.fillField('[data-testid="simple-policy-name"]', policyData.name);
    await this.fillField('[data-testid="simple-policy-description"]', policyData.description);
    await this.selectOption('[data-testid="simple-policy-effect"]', policyData.effect);
    
    // Submit the policy
    await this.clickElement('[data-testid="create-simple-policy"]');
    
    // Wait for success notification
    await this.page.waitForSelector('[data-testid="policy-created-success"]');
    
    // Get the created policy ID
    const policyId = await this.page.getAttribute('[data-testid="created-policy-id"]', 'data-policy-id');
    
    return policyId || '';
  }

  // Validation methods
  async validatePageLoad(): Promise<boolean> {
    try {
      // Check for actual DOM elements that exist on the page
      await Promise.all([
        this.expectElementVisible('h1:has-text("Policy Management")', 10000),
        this.expectElementVisible(testSelectors.rbacButton),
        this.expectElementVisible(testSelectors.abacButton),
        this.expectElementVisible('button:has-text("Simple Creator")')
      ]);
      return true;
    } catch (error) {
      await this.handleError(error as Error, 'page-load-validation');
      return false;
    }
  }

  async validateToggleFunctionality(): Promise<boolean> {
    try {
      const initialMode = await this.getCurrentMode();
      
      // Toggle to the opposite mode
      if (initialMode === 'rbac') {
        await this.toggleToABAC();
        const newMode = await this.getCurrentMode();
        if (newMode !== 'abac') return false;
        
        // Toggle back
        await this.toggleToRBAC();
        const finalMode = await this.getCurrentMode();
        return finalMode === 'rbac';
      } else {
        await this.toggleToRBAC();
        const newMode = await this.getCurrentMode();
        if (newMode !== 'rbac') return false;
        
        // Toggle back
        await this.toggleToABAC();
        const finalMode = await this.getCurrentMode();
        return finalMode === 'abac';
      }
    } catch (error) {
      console.error('Toggle validation failed:', error);
      return false;
    }
  }

  async validatePolicyListDisplay(): Promise<boolean> {
    try {
      await this.expectElementVisible(testSelectors.policyList);
      
      const policyCount = await this.getPolicyCount();
      if (policyCount === 0) {
        // Check if there's a "no policies" message
        const noDataMessage = await this.isElementVisible('[data-testid="no-policies"]');
        return noDataMessage;
      }
      
      // Validate that each policy item has required elements
      const policies = await this.getPolicyList();
      for (const policy of policies.slice(0, 3)) { // Check first 3 policies
        if (!policy.name || !policy.status) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Policy list validation failed:', error);
      return false;
    }
  }

  // Performance measurement methods
  async measureTabSwitchTime(fromTab: string, toTab: string): Promise<number> {
    const startTime = Date.now();
    await this.switchToTab(toTab as any);
    const endTime = Date.now();
    
    return endTime - startTime;
  }

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.navigateToPermissionManagement();
    const endTime = Date.now();
    
    return endTime - startTime;
  }

  // Accessibility testing
  async testPageAccessibility(): Promise<boolean> {
    // Test keyboard navigation
    const keyboardNavWorking = await this.testKeyboardNavigation();
    if (!keyboardNavWorking) return false;
    
    // Test ARIA labels and roles
    const toggleAccessible = await this.toggle.validateToggleAccessibility();
    if (!toggleAccessible) return false;
    
    // Test general accessibility
    const generalAccessibility = await this.checkAccessibility();
    
    return generalAccessibility;
  }

  // Responsive design testing
  async testResponsiveDesign(): Promise<boolean> {
    const viewports = [
      { width: 320, height: 568, name: 'mobile-small' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop-small' },
      { width: 1920, height: 1080, name: 'desktop-large' }
    ];
    
    const results: boolean[] = [];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Check if main elements are still visible and functional
      const mainElementsVisible = await this.validatePageLoad();
      const toggleWorking = await this.isElementVisible(testSelectors.rbacAbacToggle);
      const policyListVisible = await this.isElementVisible(testSelectors.policyList);
      
      results.push(mainElementsVisible && toggleWorking && policyListVisible);
    }
    
    // Reset to default viewport
    await this.page.setViewportSize({ width: 1366, height: 768 });
    
    return results.every(result => result);
  }

  // Error handling
  async expectErrorMessage(expectedMessage: string): Promise<void> {
    await this.expectElementVisible(testSelectors.errorMessage);
    await this.expectText(testSelectors.errorMessage, expectedMessage);
  }

  async hasErrorMessage(): Promise<boolean> {
    return await this.isElementVisible(testSelectors.errorMessage);
  }

  async getErrorMessage(): Promise<string> {
    if (await this.hasErrorMessage()) {
      return await this.getText(testSelectors.errorMessage);
    }
    return '';
  }

  // Utility methods
  async waitForPolicyUpdate(): Promise<void> {
    await this.waitForLoadingComplete();
    await this.waitForTimeout(500); // Additional wait for UI updates
  }

  async getBreadcrumbText(): Promise<string> {
    return await this.getText(testSelectors.breadcrumbs);
  }

  async expectBreadcrumbPath(expectedPath: string): Promise<void> {
    await this.expectText(testSelectors.breadcrumbs, expectedPath);
  }

  // Test data helpers
  async createTestPolicy(complexity: 'simple' | 'moderate' | 'complex' = 'simple'): Promise<string> {
    const policyData = testData.samplePolicies[complexity];
    return await this.createSimplePolicy(policyData as PolicyData);
  }

  async cleanupTestPolicies(): Promise<void> {
    // This would implement cleanup of test policies
    // For now, it's a placeholder
    console.log('Cleaning up test policies...');
  }
}