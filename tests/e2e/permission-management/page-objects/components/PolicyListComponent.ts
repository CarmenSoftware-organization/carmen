import { Page } from 'playwright';
import { BaseTable } from '../base/BaseTable';
import { testSelectors } from '../../config/test.config';

export interface PolicyItem {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
  priority: number;
  effect: 'permit' | 'deny';
  lastModified: string;
  createdBy: string;
}

export interface PolicyFilters {
  search: string;
  effect: 'all' | 'permit' | 'deny';
  status: 'all' | 'enabled' | 'disabled';
  priorityRange: { min: number; max: number };
}

export class PolicyListComponent extends BaseTable {
  constructor(page: Page) {
    super(page, testSelectors.policyList);
  }

  // Policy-specific data retrieval
  async getPolicyById(policyId: string): Promise<PolicyItem | null> {
    const policyRow = this.page.locator(`${this.rowSelector}[data-policy-id="${policyId}"]`);
    
    if (!(await policyRow.isVisible())) {
      return null;
    }

    const name = await policyRow.locator(testSelectors.policyName).textContent() || '';
    const description = await policyRow.locator('[data-testid="policy-description"]').textContent() || '';
    const statusElement = policyRow.locator(testSelectors.policyStatus);
    const status = (await statusElement.textContent())?.toLowerCase() as 'enabled' | 'disabled' || 'disabled';
    const priorityText = await policyRow.locator(testSelectors.policyPriority).textContent() || '0';
    const priority = parseInt(priorityText) || 0;
    const effect = (await policyRow.getAttribute('data-effect') || 'permit') as 'permit' | 'deny';
    const lastModified = await policyRow.locator('[data-testid="policy-last-modified"]').textContent() || '';
    const createdBy = await policyRow.locator('[data-testid="policy-created-by"]').textContent() || '';

    return {
      id: policyId,
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
      effect,
      lastModified: lastModified.trim(),
      createdBy: createdBy.trim()
    };
  }

  async getAllPolicies(): Promise<PolicyItem[]> {
    const policyRows = this.page.locator(`${this.rowSelector}[data-policy-id]`);
    const count = await policyRows.count();
    
    const policies: PolicyItem[] = [];
    
    for (let i = 0; i < count; i++) {
      const row = policyRows.nth(i);
      const policyId = await row.getAttribute('data-policy-id');
      
      if (policyId) {
        const policy = await this.getPolicyById(policyId);
        if (policy) {
          policies.push(policy);
        }
      }
    }
    
    return policies;
  }

  async getPolicyByName(policyName: string): Promise<PolicyItem | null> {
    const policies = await this.getAllPolicies();
    return policies.find(policy => policy.name === policyName) || null;
  }

  async getPoliciesByStatus(status: 'enabled' | 'disabled'): Promise<PolicyItem[]> {
    const policies = await this.getAllPolicies();
    return policies.filter(policy => policy.status === status);
  }

  async getPoliciesByEffect(effect: 'permit' | 'deny'): Promise<PolicyItem[]> {
    const policies = await this.getAllPolicies();
    return policies.filter(policy => policy.effect === effect);
  }

  // Policy search and filtering
  async searchPolicies(query: string): Promise<void> {
    await super.searchTable(query);
  }

  async filterByEffect(effect: 'all' | 'permit' | 'deny'): Promise<void> {
    const effectFilter = this.page.locator('[data-testid="effect-filter"]');
    if (await effectFilter.isVisible()) {
      await effectFilter.selectOption(effect);
      await this.waitForTableUpdate();
    } else {
      throw new Error('Effect filter not found');
    }
  }

  async filterByStatus(status: 'all' | 'enabled' | 'disabled'): Promise<void> {
    const statusFilter = this.page.locator('[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption(status);
      await this.waitForTableUpdate();
    } else {
      throw new Error('Status filter not found');
    }
  }

  async filterByPriorityRange(minPriority: number, maxPriority: number): Promise<void> {
    const minInput = this.page.locator('[data-testid="priority-min-filter"]');
    const maxInput = this.page.locator('[data-testid="priority-max-filter"]');
    
    if (await minInput.isVisible() && await maxInput.isVisible()) {
      await minInput.fill(minPriority.toString());
      await maxInput.fill(maxPriority.toString());
      
      // Trigger filter application
      const applyButton = this.page.locator('[data-testid="apply-priority-filter"]');
      if (await applyButton.isVisible()) {
        await applyButton.click();
      }
      
      await this.waitForTableUpdate();
    } else {
      throw new Error('Priority range filters not found');
    }
  }

  async applyFilters(filters: Partial<PolicyFilters>): Promise<void> {
    if (filters.search) {
      await this.searchPolicies(filters.search);
    }

    if (filters.effect && filters.effect !== 'all') {
      await this.filterByEffect(filters.effect);
    }

    if (filters.status && filters.status !== 'all') {
      await this.filterByStatus(filters.status);
    }

    if (filters.priorityRange) {
      await this.filterByPriorityRange(filters.priorityRange.min, filters.priorityRange.max);
    }
  }

  async clearAllFilters(): Promise<void> {
    // Clear search
    await this.clearSearch();
    
    // Reset filters to 'all'
    await this.filterByEffect('all');
    await this.filterByStatus('all');
    
    // Reset priority range if exists
    const minInput = this.page.locator('[data-testid="priority-min-filter"]');
    const maxInput = this.page.locator('[data-testid="priority-max-filter"]');
    
    if (await minInput.isVisible()) {
      await minInput.fill('0');
    }
    if (await maxInput.isVisible()) {
      await maxInput.fill('1000');
    }
  }

  // Policy actions
  async editPolicy(policyId: string): Promise<void> {
    const editButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="edit-policy"]`);
    
    if (!(await editButton.isVisible())) {
      // Try opening row menu first
      await this.openPolicyMenu(policyId);
    }
    
    await editButton.click();
  }

  async deletePolicy(policyId: string): Promise<void> {
    const deleteButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="delete-policy"]`);
    
    if (!(await deleteButton.isVisible())) {
      await this.openPolicyMenu(policyId);
    }
    
    await deleteButton.click();
    
    // Handle confirmation dialog
    try {
      await this.page.waitForSelector('[data-testid="confirm-delete-policy"]', { timeout: 3000 });
      await this.page.click('[data-testid="confirm-delete-policy"]');
      await this.waitForTableUpdate();
    } catch {
      // No confirmation dialog appeared
    }
  }

  async clonePolicy(policyId: string): Promise<void> {
    const cloneButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="clone-policy"]`);
    
    if (!(await cloneButton.isVisible())) {
      await this.openPolicyMenu(policyId);
    }
    
    await cloneButton.click();
  }

  async testPolicy(policyId: string): Promise<void> {
    const testButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="test-policy"]`);
    
    if (!(await testButton.isVisible())) {
      await this.openPolicyMenu(policyId);
    }
    
    await testButton.click();
  }

  async togglePolicyStatus(policyId: string): Promise<void> {
    const policy = await this.getPolicyById(policyId);
    if (!policy) {
      throw new Error(`Policy with ID ${policyId} not found`);
    }

    const toggleButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="toggle-policy-status"]`);
    
    if (!(await toggleButton.isVisible())) {
      await this.openPolicyMenu(policyId);
    }
    
    await toggleButton.click();
    await this.waitForTableUpdate();
    
    // Verify status change
    const updatedPolicy = await this.getPolicyById(policyId);
    if (updatedPolicy && updatedPolicy.status === policy.status) {
      console.warn(`Policy ${policyId} status did not change after toggle`);
    }
  }

  async openPolicyMenu(policyId: string): Promise<void> {
    const menuButton = this.page.locator(`[data-policy-id="${policyId}"] [data-testid="policy-menu"]`);
    await menuButton.click();
    
    // Wait for menu to appear
    await this.page.waitForSelector('[data-testid="policy-menu-dropdown"]', { 
      state: 'visible',
      timeout: 3000 
    });
  }

  async selectPolicyMenuItem(policyId: string, menuItem: string): Promise<void> {
    await this.openPolicyMenu(policyId);
    const menuItemElement = this.page.locator(`[data-testid="policy-menu-${menuItem}"]`);
    await menuItemElement.click();
  }

  // Bulk operations
  async selectPolicy(policyId: string): Promise<void> {
    const checkbox = this.page.locator(`[data-policy-id="${policyId}"] input[type="checkbox"]`);
    await checkbox.check();
  }

  async unselectPolicy(policyId: string): Promise<void> {
    const checkbox = this.page.locator(`[data-policy-id="${policyId}"] input[type="checkbox"]`);
    await checkbox.uncheck();
  }

  async selectMultiplePolicies(policyIds: string[]): Promise<void> {
    for (const policyId of policyIds) {
      await this.selectPolicy(policyId);
    }
  }

  async getSelectedPolicyIds(): Promise<string[]> {
    const selectedCheckboxes = this.page.locator(`${this.rowSelector} input[type="checkbox"]:checked`);
    const count = await selectedCheckboxes.count();
    
    const selectedIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const checkbox = selectedCheckboxes.nth(i);
      const row = checkbox.locator('..').locator('..');
      const policyId = await row.getAttribute('data-policy-id');
      if (policyId) {
        selectedIds.push(policyId);
      }
    }
    
    return selectedIds;
  }

  async bulkEnablePolicies(): Promise<void> {
    const bulkEnableButton = this.page.locator('[data-testid="bulk-enable-policies"]');
    await bulkEnableButton.click();
    await this.waitForTableUpdate();
  }

  async bulkDisablePolicies(): Promise<void> {
    const bulkDisableButton = this.page.locator('[data-testid="bulk-disable-policies"]');
    await bulkDisableButton.click();
    await this.waitForTableUpdate();
  }

  async bulkDeletePolicies(): Promise<void> {
    const bulkDeleteButton = this.page.locator('[data-testid="bulk-delete-policies"]');
    await bulkDeleteButton.click();
    
    // Handle confirmation
    try {
      await this.page.waitForSelector('[data-testid="confirm-bulk-delete"]', { timeout: 3000 });
      await this.page.click('[data-testid="confirm-bulk-delete"]');
      await this.waitForTableUpdate();
    } catch {
      // No confirmation dialog
    }
  }

  // Sorting
  async sortByName(direction: 'asc' | 'desc' = 'asc'): Promise<void> {
    const nameHeader = this.page.locator(`${this.headerSelector}[data-column="name"]`);
    
    // Click header to sort
    await nameHeader.click();
    
    // Check if we need to click again for descending
    if (direction === 'desc') {
      const currentSort = await this.getSortDirection(0); // Assuming name is first column
      if (currentSort === 'asc') {
        await nameHeader.click();
      }
    }
    
    await this.waitForTableUpdate();
  }

  async sortByPriority(direction: 'asc' | 'desc' = 'desc'): Promise<void> {
    const priorityHeader = this.page.locator(`${this.headerSelector}[data-column="priority"]`);
    await priorityHeader.click();
    
    if (direction === 'desc') {
      const currentSort = await priorityHeader.getAttribute('aria-sort');
      if (currentSort === 'ascending') {
        await priorityHeader.click();
      }
    }
    
    await this.waitForTableUpdate();
  }

  async sortByLastModified(direction: 'asc' | 'desc' = 'desc'): Promise<void> {
    const modifiedHeader = this.page.locator(`${this.headerSelector}[data-column="lastModified"]`);
    await modifiedHeader.click();
    
    if (direction === 'desc') {
      const currentSort = await modifiedHeader.getAttribute('aria-sort');
      if (currentSort === 'ascending') {
        await modifiedHeader.click();
      }
    }
    
    await this.waitForTableUpdate();
  }

  // Validation methods
  async validatePolicyExists(policyId: string): Promise<boolean> {
    const policy = await this.getPolicyById(policyId);
    return policy !== null;
  }

  async validatePolicyStatus(policyId: string, expectedStatus: 'enabled' | 'disabled'): Promise<boolean> {
    const policy = await this.getPolicyById(policyId);
    return policy?.status === expectedStatus;
  }

  async validatePolicyCount(expectedCount: number): Promise<boolean> {
    const actualCount = await this.getRowCount();
    return actualCount === expectedCount;
  }

  async validatePolicyData(policyId: string, expectedData: Partial<PolicyItem>): Promise<boolean> {
    const policy = await this.getPolicyById(policyId);
    if (!policy) return false;

    for (const [key, expectedValue] of Object.entries(expectedData)) {
      if (policy[key as keyof PolicyItem] !== expectedValue) {
        console.log(`Policy ${policyId} validation failed for ${key}: expected ${expectedValue}, got ${policy[key as keyof PolicyItem]}`);
        return false;
      }
    }

    return true;
  }

  // Performance testing
  async measurePolicyListLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.refreshTable();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async measurePolicySearchTime(query: string): Promise<number> {
    const startTime = Date.now();
    await this.searchPolicies(query);
    const endTime = Date.now();
    return endTime - startTime;
  }

  async measurePolicyFilterTime(filters: Partial<PolicyFilters>): Promise<number> {
    const startTime = Date.now();
    await this.applyFilters(filters);
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Utility methods
  async isPolicyListEmpty(): Promise<boolean> {
    const count = await this.getRowCount();
    return count === 0;
  }

  async getVisiblePolicyIds(): Promise<string[]> {
    const visibleRows = this.page.locator(`${this.rowSelector}[data-policy-id]`);
    const count = await visibleRows.count();
    
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = await visibleRows.nth(i).getAttribute('data-policy-id');
      if (id) {
        ids.push(id);
      }
    }
    
    return ids;
  }

  async waitForPolicyToAppear(policyId: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(`${this.rowSelector}[data-policy-id="${policyId}"]`, {
      state: 'visible',
      timeout
    });
  }

  async waitForPolicyToDisappear(policyId: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(`${this.rowSelector}[data-policy-id="${policyId}"]`, {
      state: 'hidden',
      timeout
    });
  }

  async takePolicyListScreenshot(name: string): Promise<string> {
    return await this.takeElementScreenshot(this.tableSelector, `policy-list-${name}`);
  }

  async exportPolicyList(format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<void> {
    const exportButton = this.page.locator(`[data-testid="export-policies-${format}"]`);
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await this.page.waitForTimeout(2000); // Wait for download
    } else {
      throw new Error(`Export button for ${format} format not found`);
    }
  }
}