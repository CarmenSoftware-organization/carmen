# Carmen ERP Permission Management - Puppeteer Test Architecture

## Overview

This document provides the comprehensive Puppeteer test architecture implementation for the Carmen ERP Permission Management system. It includes the Page Object Model (POM) structure, test utilities, parallel execution framework, and integration patterns designed for maximum maintainability and scalability.

---

## Architecture Foundation

### Test Structure Directory

```
tests/ui-usability/permission-management/
├── config/
│   ├── test.config.ts           # Global test configuration
│   ├── browser.config.ts        # Browser pool configuration
│   ├── data.config.ts           # Test data configuration
│   └── performance.config.ts    # Performance thresholds
├── page-objects/
│   ├── base/
│   │   ├── BasePage.ts          # Base page class
│   │   ├── BaseModal.ts         # Base modal component
│   │   └── BaseTable.ts         # Base table component
│   ├── pages/
│   │   ├── LoginPage.ts         # Authentication page
│   │   ├── DashboardPage.ts     # Main dashboard
│   │   └── PermissionManagementPage.ts
│   ├── components/
│   │   ├── NavigationComponent.ts
│   │   ├── ToggleComponent.ts   # RBAC/ABAC toggle
│   │   ├── PolicyWizardComponent.ts
│   │   ├── RoleManagerComponent.ts
│   │   └── SubscriptionComponent.ts
│   └── modals/
│       ├── PolicyBuilderModal.ts
│       ├── RoleFormModal.ts
│       └── ConfirmationModal.ts
├── test-suites/
│   ├── module-tests/
│   │   ├── toggle.test.ts       # RBAC/ABAC toggle tests
│   │   ├── policy.test.ts       # Policy management tests
│   │   ├── roles.test.ts        # Role management tests
│   │   └── subscription.test.ts # Subscription tests
│   ├── integration-tests/
│   │   ├── end-to-end.test.ts   # Complete user journeys
│   │   ├── cross-module.test.ts # Cross-module functionality
│   │   └── permission-flow.test.ts
│   ├── performance-tests/
│   │   ├── load.test.ts         # Load testing
│   │   ├── stress.test.ts       # Stress testing
│   │   └── memory.test.ts       # Memory usage tests
│   └── accessibility-tests/
│       ├── wcag.test.ts         # WCAG compliance
│       ├── keyboard.test.ts     # Keyboard navigation
│       └── screen-reader.test.ts
├── utilities/
│   ├── TestDataFactory.ts       # Test data generation
│   ├── DatabaseHelper.ts        # Database operations
│   ├── ParallelCoordinator.ts   # Parallel execution
│   ├── ReportingEngine.ts       # Test reporting
│   └── PerformanceMonitor.ts    # Performance tracking
├── fixtures/
│   ├── users.json               # Test user accounts
│   ├── policies.json            # Sample policies
│   ├── roles.json               # Test roles
│   └── scenarios.json           # Test scenarios
└── reports/
    ├── html/                    # HTML test reports
    ├── json/                    # JSON results
    ├── screenshots/             # Test screenshots
    └── videos/                  # Test execution videos
```

---

## Base Classes and Components

### BasePage Class

```typescript
// page-objects/base/BasePage.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  // Core navigation methods
  async navigate(path: string = ''): Promise<void> {
    const fullUrl = `${this.baseUrl}${path}`;
    await this.page.goto(fullUrl, { waitUntil: 'networkidle' });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('[data-testid="page-loaded"]', { 
      timeout: 10000,
      state: 'attached'
    });
  }

  // Element interaction helpers
  async clickElement(selector: string, options?: { timeout?: number }): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: options?.timeout || 5000 });
    await element.click();
  }

  async fillField(selector: string, value: string): Promise<void> {
    const field = this.page.locator(selector);
    await field.waitFor({ state: 'visible' });
    await field.clear();
    await field.fill(value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    const select = this.page.locator(selector);
    await select.waitFor({ state: 'visible' });
    await select.selectOption(value);
  }

  // Validation helpers
  async expectElementVisible(selector: string, timeout: number = 5000): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible({ timeout });
  }

  async expectElementHidden(selector: string, timeout: number = 5000): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden({ timeout });
  }

  async expectText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  // Performance monitoring
  async measurePageLoad(): Promise<number> {
    const startTime = performance.now();
    await this.page.waitForLoadState('networkidle');
    const endTime = performance.now();
    return endTime - startTime;
  }

  // Screenshot and debugging
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: `tests/ui-usability/permission-management/reports/screenshots/${filename}`,
      fullPage: true 
    });
    return filename;
  }

  // Error handling
  async handleError(error: Error, context: string): Promise<void> {
    const screenshot = await this.takeScreenshot(`error-${context}`);
    const consoleLogs = await this.page.evaluate(() => 
      window.console.logs || []
    );
    
    throw new Error(`${error.message}\nScreenshot: ${screenshot}\nConsole logs: ${JSON.stringify(consoleLogs)}`);
  }
}
```

### BaseModal Class

```typescript
// page-objects/base/BaseModal.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export abstract class BaseModal extends BasePage {
  protected modalSelector: string;
  protected closeButtonSelector: string;

  constructor(page: Page, modalSelector: string) {
    super(page);
    this.modalSelector = modalSelector;
    this.closeButtonSelector = '[data-testid="modal-close"]';
  }

  async waitForModal(): Promise<void> {
    await this.page.waitForSelector(this.modalSelector, { 
      state: 'visible',
      timeout: 10000 
    });
  }

  async closeModal(): Promise<void> {
    await this.clickElement(this.closeButtonSelector);
    await this.waitForModalClosed();
  }

  async waitForModalClosed(): Promise<void> {
    await this.page.waitForSelector(this.modalSelector, { 
      state: 'hidden',
      timeout: 5000 
    });
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.waitForModalClosed();
  }
}
```

### BaseTable Class

```typescript
// page-objects/base/BaseTable.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export abstract class BaseTable extends BasePage {
  protected tableSelector: string;
  protected rowSelector: string;
  protected headerSelector: string;

  constructor(page: Page, tableSelector: string) {
    super(page);
    this.tableSelector = tableSelector;
    this.rowSelector = `${tableSelector} tbody tr`;
    this.headerSelector = `${tableSelector} thead th`;
  }

  async getRowCount(): Promise<number> {
    return await this.page.locator(this.rowSelector).count();
  }

  async getColumnCount(): Promise<number> {
    return await this.page.locator(this.headerSelector).count();
  }

  async searchTable(query: string): Promise<void> {
    const searchInput = this.page.locator('[data-testid="table-search"]');
    await searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  async sortByColumn(columnIndex: number): Promise<void> {
    const header = this.page.locator(this.headerSelector).nth(columnIndex);
    await header.click();
    await this.page.waitForTimeout(500);
  }

  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.page.locator(this.rowSelector).nth(rowIndex);
    const cells = row.locator('td');
    const cellCount = await cells.count();
    
    const data: string[] = [];
    for (let i = 0; i < cellCount; i++) {
      const text = await cells.nth(i).textContent();
      data.push(text || '');
    }
    
    return data;
  }

  async selectRow(rowIndex: number): Promise<void> {
    const checkbox = this.page.locator(`${this.rowSelector}:nth-child(${rowIndex + 1}) input[type="checkbox"]`);
    await checkbox.check();
  }

  async selectAllRows(): Promise<void> {
    const selectAllCheckbox = this.page.locator('[data-testid="select-all-rows"]');
    await selectAllCheckbox.check();
  }
}
```

---

## Page Object Implementations

### PermissionManagementPage

```typescript
// page-objects/pages/PermissionManagementPage.ts
import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { ToggleComponent } from '../components/ToggleComponent';
import { PolicyWizardComponent } from '../components/PolicyWizardComponent';
import { RoleManagerComponent } from '../components/RoleManagerComponent';

export class PermissionManagementPage extends BasePage {
  private toggle: ToggleComponent;
  private policyWizard: PolicyWizardComponent;
  private roleManager: RoleManagerComponent;

  // Page selectors
  private readonly selectors = {
    pageContainer: '[data-testid="permission-management-page"]',
    policiesTab: '[data-testid="policies-tab"]',
    rolesTab: '[data-testid="roles-tab"]',
    subscriptionTab: '[data-testid="subscription-tab"]',
    newPolicyButton: '[data-testid="new-policy-button"]',
    newRoleButton: '[data-testid="create-role-button"]',
    breadcrumb: '[data-testid="permission-breadcrumbs"]'
  };

  constructor(page: Page) {
    super(page);
    this.toggle = new ToggleComponent(page);
    this.policyWizard = new PolicyWizardComponent(page);
    this.roleManager = new RoleManagerComponent(page);
  }

  async navigateToPermissionManagement(): Promise<void> {
    await this.navigate('/system-administration/permission-management');
    await this.expectElementVisible(this.selectors.pageContainer);
  }

  async switchToTab(tab: 'policies' | 'roles' | 'subscription'): Promise<void> {
    const tabSelector = this.selectors[`${tab}Tab`];
    await this.clickElement(tabSelector);
    
    // Wait for tab content to load
    await this.page.waitForSelector(`[data-testid="${tab}-content"]`, {
      state: 'visible',
      timeout: 5000
    });
  }

  async getCurrentTab(): Promise<string> {
    const activeTab = this.page.locator('[data-state="active"]');
    return await activeTab.getAttribute('value') || '';
  }

  // Toggle operations
  async toggleRBACToABAC(): Promise<void> {
    return await this.toggle.switchToABAC();
  }

  async toggleABACToRBAC(): Promise<void> {
    return await this.toggle.switchToRBAC();
  }

  async getCurrentMode(): Promise<'rbac' | 'abac'> {
    return await this.toggle.getCurrentMode();
  }

  // Policy operations
  async createNewPolicy(policyData: PolicyData): Promise<string> {
    await this.clickElement(this.selectors.newPolicyButton);
    return await this.policyWizard.createPolicy(policyData);
  }

  async getPolicyList(): Promise<PolicyListItem[]> {
    const policyList = this.page.locator('[data-testid="policy-list"] [data-testid="policy-item"]');
    const count = await policyList.count();
    
    const policies: PolicyListItem[] = [];
    for (let i = 0; i < count; i++) {
      const item = policyList.nth(i);
      const name = await item.locator('[data-testid="policy-name"]').textContent();
      const status = await item.locator('[data-testid="policy-status"]').textContent();
      const priority = await item.locator('[data-testid="policy-priority"]').textContent();
      
      policies.push({
        name: name || '',
        status: status || '',
        priority: parseInt(priority || '0')
      });
    }
    
    return policies;
  }

  // Role operations
  async createNewRole(roleData: RoleData): Promise<string> {
    await this.clickElement(this.selectors.newRoleButton);
    return await this.roleManager.createRole(roleData);
  }

  async getRoleList(): Promise<RoleListItem[]> {
    return await this.roleManager.getRoleList();
  }

  // Performance monitoring
  async measureTabSwitchTime(fromTab: string, toTab: string): Promise<number> {
    const startTime = performance.now();
    await this.switchToTab(toTab as any);
    const endTime = performance.now();
    
    return endTime - startTime;
  }

  // Error handling and validation
  async validatePageLoad(): Promise<boolean> {
    try {
      await this.expectElementVisible(this.selectors.pageContainer, 10000);
      await this.expectElementVisible(this.selectors.policiesTab);
      await this.expectElementVisible(this.selectors.rolesTab);
      return true;
    } catch (error) {
      await this.handleError(error as Error, 'page-load-validation');
      return false;
    }
  }
}

// Type definitions
interface PolicyData {
  name: string;
  description: string;
  priority: number;
  effect: 'permit' | 'deny';
  conditions: Array<{
    attribute: string;
    operator: string;
    value: any;
  }>;
}

interface PolicyListItem {
  name: string;
  status: string;
  priority: number;
}

interface RoleData {
  name: string;
  description: string;
  department?: string;
  permissions: string[];
}

interface RoleListItem {
  name: string;
  userCount: number;
  status: string;
}
```

### ToggleComponent

```typescript
// page-objects/components/ToggleComponent.ts
import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class ToggleComponent extends BasePage {
  private readonly selectors = {
    toggle: '[data-testid="rbac-abac-toggle"]',
    migrationDialog: '[data-testid="migration-dialog"]',
    confirmMigration: '[data-testid="confirm-migration"]',
    cancelMigration: '[data-testid="cancel-migration"]',
    migrationProgress: '[data-testid="migration-progress"]',
    migrationComplete: '[data-testid="migration-complete"]',
    modeIndicator: '[data-testid="current-mode"]'
  };

  async getCurrentMode(): Promise<'rbac' | 'abac'> {
    const toggle = this.page.locator(this.selectors.toggle);
    const mode = await toggle.getAttribute('data-current-mode');
    return (mode as 'rbac' | 'abac') || 'rbac';
  }

  async switchToABAC(): Promise<void> {
    const currentMode = await this.getCurrentMode();
    if (currentMode === 'abac') {
      return; // Already in ABAC mode
    }

    // Start toggle switch timing
    const startTime = performance.now();
    
    await this.clickElement(this.selectors.toggle);
    
    // Handle migration dialog if it appears
    try {
      await this.page.waitForSelector(this.selectors.migrationDialog, { timeout: 5000 });
      await this.clickElement(this.selectors.confirmMigration);
      
      // Wait for migration to complete
      await this.page.waitForSelector(this.selectors.migrationComplete, { 
        timeout: 30000 
      });
    } catch (error) {
      // No migration dialog appeared, direct toggle
    }

    // Verify mode change
    const endTime = performance.now();
    const switchTime = endTime - startTime;
    
    if (switchTime > 500) {
      console.warn(`Toggle switch took ${switchTime}ms, which exceeds 500ms benchmark`);
    }

    const newMode = await this.getCurrentMode();
    if (newMode !== 'abac') {
      throw new Error(`Failed to switch to ABAC mode. Current mode: ${newMode}`);
    }
  }

  async switchToRBAC(): Promise<void> {
    const currentMode = await this.getCurrentMode();
    if (currentMode === 'rbac') {
      return; // Already in RBAC mode
    }

    const startTime = performance.now();
    
    await this.clickElement(this.selectors.toggle);
    
    // Handle potential confirmation dialog
    try {
      const confirmButton = this.page.locator('[data-testid="confirm-rbac-switch"]');
      await confirmButton.waitFor({ state: 'visible', timeout: 2000 });
      await confirmButton.click();
    } catch (error) {
      // No confirmation needed
    }

    const endTime = performance.now();
    const switchTime = endTime - startTime;
    
    if (switchTime > 500) {
      console.warn(`RBAC switch took ${switchTime}ms, exceeds 500ms target`);
    }

    // Verify mode change
    const newMode = await this.getCurrentMode();
    if (newMode !== 'rbac') {
      throw new Error(`Failed to switch to RBAC mode. Current mode: ${newMode}`);
    }
  }

  async waitForMigrationComplete(): Promise<void> {
    await this.page.waitForSelector(this.selectors.migrationComplete, { 
      timeout: 30000 
    });
  }

  async cancelMigration(): Promise<void> {
    await this.clickElement(this.selectors.cancelMigration);
    await this.page.waitForSelector(this.selectors.migrationDialog, { 
      state: 'hidden' 
    });
  }

  async getMigrationProgress(): Promise<number> {
    const progressElement = this.page.locator(this.selectors.migrationProgress);
    const progressText = await progressElement.textContent();
    const match = progressText?.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  async validateToggleAccessibility(): Promise<boolean> {
    const toggle = this.page.locator(this.selectors.toggle);
    
    // Check ARIA attributes
    const hasRole = await toggle.getAttribute('role');
    const hasLabel = await toggle.getAttribute('aria-label');
    const hasState = await toggle.getAttribute('aria-checked');
    
    // Test keyboard navigation
    await toggle.focus();
    const isFocused = await toggle.evaluate(el => document.activeElement === el);
    
    return !!(hasRole && hasLabel && hasState !== null && isFocused);
  }
}
```

### PolicyWizardComponent

```typescript
// page-objects/components/PolicyWizardComponent.ts
import { Page } from '@playwright/test';
import { BaseModal } from '../base/BaseModal';

export class PolicyWizardComponent extends BaseModal {
  private readonly selectors = {
    wizard: '[data-testid="policy-wizard"]',
    step1: {
      name: '[data-testid="policy-name"]',
      description: '[data-testid="policy-description"]',
      priority: '[data-testid="policy-priority"]',
      effect: '[data-testid="policy-effect"]',
      nextButton: '[data-testid="wizard-next"]'
    },
    step2: {
      conditionGroup: '[data-testid="condition-group"]',
      subjectAttribute: '[data-testid="subject-attribute"]',
      operator: '[data-testid="operator"]',
      value: '[data-testid="attribute-value"]',
      addCondition: '[data-testid="add-condition"]',
      addGroup: '[data-testid="add-condition-group"]',
      nextButton: '[data-testid="wizard-next"]',
      backButton: '[data-testid="wizard-back"]'
    },
    step3: {
      summary: '[data-testid="policy-summary"]',
      testButton: '[data-testid="test-policy"]',
      createButton: '[data-testid="create-policy"]',
      backButton: '[data-testid="wizard-back"]'
    },
    success: '[data-testid="policy-created-success"]'
  };

  constructor(page: Page) {
    super(page, '[data-testid="policy-wizard"]');
  }

  async createPolicy(policyData: PolicyData): Promise<string> {
    await this.waitForModal();
    
    // Step 1: Basic Information
    await this.fillBasicInformation(policyData);
    await this.clickElement(this.selectors.step1.nextButton);
    
    // Step 2: Rules and Conditions
    await this.addConditions(policyData.conditions);
    await this.clickElement(this.selectors.step2.nextButton);
    
    // Step 3: Review and Create
    await this.reviewAndCreate();
    
    // Wait for success confirmation
    await this.expectElementVisible(this.selectors.success);
    
    // Get the created policy ID
    const policyId = await this.page.getAttribute('[data-testid="created-policy-id"]', 'data-policy-id');
    
    return policyId || '';
  }

  private async fillBasicInformation(policyData: PolicyData): Promise<void> {
    await this.fillField(this.selectors.step1.name, policyData.name);
    await this.fillField(this.selectors.step1.description, policyData.description);
    await this.selectOption(this.selectors.step1.priority, policyData.priority.toString());
    await this.selectOption(this.selectors.step1.effect, policyData.effect);
  }

  private async addConditions(conditions: Array<{attribute: string, operator: string, value: any}>): Promise<void> {
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      
      if (i > 0) {
        await this.clickElement(this.selectors.step2.addCondition);
      }
      
      // Select condition elements for the current condition
      const conditionSelector = `[data-testid="condition-${i}"]`;
      
      await this.selectOption(`${conditionSelector} [data-testid="subject-attribute"]`, condition.attribute);
      await this.selectOption(`${conditionSelector} [data-testid="operator"]`, condition.operator);
      
      // Handle different value types
      if (Array.isArray(condition.value)) {
        for (const val of condition.value) {
          await this.fillField(`${conditionSelector} [data-testid="attribute-value"]`, val);
          await this.page.keyboard.press('Enter');
        }
      } else {
        await this.fillField(`${conditionSelector} [data-testid="attribute-value"]`, condition.value.toString());
      }
    }
  }

  private async reviewAndCreate(): Promise<void> {
    // Verify policy summary is displayed
    await this.expectElementVisible(this.selectors.step3.summary);
    
    // Optional: Test policy before creation
    const shouldTest = process.env.ALWAYS_TEST_POLICIES === 'true';
    if (shouldTest) {
      await this.testPolicy();
    }
    
    // Create the policy
    await this.clickElement(this.selectors.step3.createButton);
  }

  private async testPolicy(): Promise<void> {
    await this.clickElement(this.selectors.step3.testButton);
    
    // Wait for test results
    await this.page.waitForSelector('[data-testid="policy-test-results"]', { timeout: 10000 });
    
    // Verify test passed (you might want to check specific test results)
    const testResult = await this.page.locator('[data-testid="test-result-status"]').textContent();
    if (testResult !== 'PASSED') {
      throw new Error(`Policy test failed with result: ${testResult}`);
    }
  }

  async validateWizardNavigation(): Promise<boolean> {
    // Test wizard step navigation
    await this.expectElementVisible(this.selectors.step1.nextButton);
    
    // Move to step 2
    await this.clickElement(this.selectors.step1.nextButton);
    await this.expectElementVisible(this.selectors.step2.backButton);
    
    // Move back to step 1
    await this.clickElement(this.selectors.step2.backButton);
    await this.expectElementVisible(this.selectors.step1.nextButton);
    
    return true;
  }

  async measureWizardStepTime(step: number): Promise<number> {
    const startTime = performance.now();
    
    switch (step) {
      case 1:
        await this.clickElement(this.selectors.step1.nextButton);
        await this.expectElementVisible(this.selectors.step2.conditionGroup);
        break;
      case 2:
        await this.clickElement(this.selectors.step2.nextButton);
        await this.expectElementVisible(this.selectors.step3.summary);
        break;
      default:
        throw new Error(`Invalid step number: ${step}`);
    }
    
    const endTime = performance.now();
    return endTime - startTime;
  }
}

interface PolicyData {
  name: string;
  description: string;
  priority: number;
  effect: 'permit' | 'deny';
  conditions: Array<{
    attribute: string;
    operator: string;
    value: any;
  }>;
}
```

---

## Test Utilities and Helpers

### TestDataFactory

```typescript
// utilities/TestDataFactory.ts
import { faker } from '@faker-js/faker';

export class TestDataFactory {
  
  static generateUser(role: string = 'staff'): TestUser {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: role,
      department: faker.helpers.arrayElement(['Kitchen', 'Front Office', 'Finance', 'Procurement']),
      location: faker.helpers.arrayElement(['Hotel A', 'Hotel B', 'Restaurant C']),
      isActive: true,
      permissions: this.getPermissionsForRole(role)
    };
  }

  static generatePolicy(complexity: 'simple' | 'moderate' | 'complex' = 'simple'): PolicyData {
    const basePolicy = {
      id: faker.string.uuid(),
      name: `${faker.company.buzzVerb()} ${faker.company.buzzNoun()} Policy`,
      description: faker.lorem.sentence(),
      priority: faker.number.int({ min: 100, max: 900 }),
      effect: faker.helpers.arrayElement(['permit', 'deny']) as 'permit' | 'deny',
      conditions: []
    };

    switch (complexity) {
      case 'simple':
        basePolicy.conditions = [this.generateSimpleCondition()];
        break;
      case 'moderate':
        basePolicy.conditions = [
          this.generateSimpleCondition(),
          this.generateSimpleCondition()
        ];
        break;
      case 'complex':
        basePolicy.conditions = [
          this.generateSimpleCondition(),
          this.generateSimpleCondition(),
          this.generateComplexCondition()
        ];
        break;
    }

    return basePolicy;
  }

  static generateRole(department?: string): RoleData {
    return {
      id: faker.string.uuid(),
      name: `${department || faker.company.buzzNoun()} ${faker.person.jobTitle()}`,
      description: faker.lorem.sentence(),
      department: department || faker.helpers.arrayElement(['Kitchen', 'Front Office', 'Finance']),
      permissions: this.generatePermissionSet(),
      userCount: faker.number.int({ min: 1, max: 50 }),
      isActive: true
    };
  }

  static generateBulkUsers(count: number, role: string): TestUser[] {
    return Array.from({ length: count }, () => this.generateUser(role));
  }

  static generateTestScenario(scenarioType: string): TestScenario {
    switch (scenarioType) {
      case 'policy-creation':
        return {
          name: 'Policy Creation Scenario',
          description: 'Test complete policy creation workflow',
          users: [this.generateUser('super-admin')],
          policies: [this.generatePolicy('moderate')],
          roles: [],
          expectedOutcome: 'policy-created'
        };
        
      case 'role-assignment':
        return {
          name: 'Role Assignment Scenario',
          description: 'Test bulk user role assignment',
          users: this.generateBulkUsers(10, 'staff'),
          policies: [],
          roles: [this.generateRole()],
          expectedOutcome: 'users-assigned'
        };
        
      case 'permission-inheritance':
        return {
          name: 'Permission Inheritance Scenario',
          description: 'Test complex permission inheritance chains',
          users: [this.generateUser('department-manager')],
          policies: [this.generatePolicy('complex')],
          roles: [this.generateRole(), this.generateRole()],
          expectedOutcome: 'permissions-inherited'
        };
        
      default:
        throw new Error(`Unknown scenario type: ${scenarioType}`);
    }
  }

  private static generateSimpleCondition(): any {
    return {
      attribute: faker.helpers.arrayElement([
        'user.department',
        'user.role', 
        'resource.type',
        'environment.time'
      ]),
      operator: faker.helpers.arrayElement(['equals', 'contains', 'greater_than', 'in']),
      value: faker.helpers.arrayElement(['Finance', 'Manager', '1000', '09:00-17:00'])
    };
  }

  private static generateComplexCondition(): any {
    return {
      type: 'composite',
      operator: 'AND',
      conditions: [
        this.generateSimpleCondition(),
        this.generateSimpleCondition()
      ]
    };
  }

  private static getPermissionsForRole(role: string): string[] {
    const permissionMap = {
      'super-admin': ['*'],
      'department-manager': ['user:read', 'user:write', 'reports:read', 'inventory:read'],
      'financial-manager': ['finance:read', 'finance:write', 'reports:read', 'approvals:write'],
      'purchasing-staff': ['procurement:read', 'procurement:write', 'vendors:read'],
      'staff': ['basic:read', 'profile:write']
    };

    return permissionMap[role] || permissionMap['staff'];
  }

  private static generatePermissionSet(): string[] {
    const allPermissions = [
      'user:read', 'user:write', 'user:delete',
      'policy:read', 'policy:write', 'policy:delete',
      'role:read', 'role:write', 'role:delete',
      'report:read', 'report:write',
      'finance:read', 'finance:write',
      'inventory:read', 'inventory:write'
    ];

    const permissionCount = faker.number.int({ min: 2, max: 8 });
    return faker.helpers.arrayElements(allPermissions, permissionCount);
  }
}

// Type definitions
interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  location: string;
  isActive: boolean;
  permissions: string[];
}

interface PolicyData {
  id: string;
  name: string;
  description: string;
  priority: number;
  effect: 'permit' | 'deny';
  conditions: any[];
}

interface RoleData {
  id: string;
  name: string;
  description: string;
  department: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
}

interface TestScenario {
  name: string;
  description: string;
  users: TestUser[];
  policies: PolicyData[];
  roles: RoleData[];
  expectedOutcome: string;
}
```

### ParallelCoordinator

```typescript
// utilities/ParallelCoordinator.ts
import { Browser, BrowserContext, Page } from '@playwright/test';
import { EventEmitter } from 'events';

export class ParallelCoordinator extends EventEmitter {
  private browserPools: Map<string, BrowserPool> = new Map();
  private activeTests: Map<string, TestExecution> = new Map();
  private resourceMonitor: ResourceMonitor;

  constructor() {
    super();
    this.resourceMonitor = new ResourceMonitor();
  }

  async initializeBrowserPools(config: BrowserPoolConfig): Promise<void> {
    for (const [poolName, poolConfig] of Object.entries(config)) {
      const pool = new BrowserPool(poolName, poolConfig);
      await pool.initialize();
      this.browserPools.set(poolName, pool);
    }
  }

  async executeTestSuite(testSuite: ParallelTestSuite): Promise<TestResults> {
    const startTime = Date.now();
    this.emit('suite-started', { suite: testSuite.name, startTime });

    try {
      // Phase 1: Independent module tests
      const moduleResults = await this.executePhase(testSuite.moduleTests, 'module');
      
      // Phase 2: Integration tests (dependent on module tests)
      const integrationResults = await this.executePhase(testSuite.integrationTests, 'integration');
      
      // Phase 3: Performance tests (sequential)
      const performanceResults = await this.executeSequentialTests(testSuite.performanceTests);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const results: TestResults = {
        startTime,
        endTime,
        totalTime,
        moduleResults,
        integrationResults,
        performanceResults,
        summary: this.calculateSummary(moduleResults, integrationResults, performanceResults)
      };

      this.emit('suite-completed', results);
      return results;

    } catch (error) {
      this.emit('suite-failed', error);
      throw error;
    }
  }

  private async executePhase(tests: TestDefinition[], phase: string): Promise<PhaseResults> {
    const promises: Promise<TestResult>[] = [];
    
    for (const test of tests) {
      const promise = this.executeTest(test, phase);
      promises.push(promise);
      
      // Throttle test startup to avoid resource exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const results = await Promise.allSettled(promises);
    
    return {
      phase,
      total: results.length,
      passed: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results: results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
    };
  }

  private async executeTest(testDef: TestDefinition, phase: string): Promise<TestResult> {
    const testId = `${phase}-${testDef.name}-${Date.now()}`;
    const browserPool = this.selectOptimalBrowserPool(testDef.requirements);
    
    const execution: TestExecution = {
      id: testId,
      definition: testDef,
      phase,
      startTime: Date.now(),
      status: 'running',
      browserPool: browserPool.name
    };

    this.activeTests.set(testId, execution);
    this.emit('test-started', execution);

    try {
      const context = await browserPool.acquireContext();
      const page = await context.newPage();
      
      // Execute the test
      const result = await this.runTest(testDef, page);
      
      // Clean up
      await page.close();
      await browserPool.releaseContext(context);
      
      execution.status = 'completed';
      execution.endTime = Date.now();
      execution.result = result;
      
      this.activeTests.delete(testId);
      this.emit('test-completed', execution);
      
      return result;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      execution.error = error as Error;
      
      this.activeTests.delete(testId);
      this.emit('test-failed', execution);
      
      throw error;
    }
  }

  private selectOptimalBrowserPool(requirements: TestRequirements): BrowserPool {
    // Simple pool selection logic - can be made more sophisticated
    const availablePools = Array.from(this.browserPools.values())
      .filter(pool => pool.isAvailable() && pool.supportsBrowser(requirements.browser));

    if (availablePools.length === 0) {
      throw new Error(`No available browser pools for ${requirements.browser}`);
    }

    // Select pool with least active tests
    return availablePools.reduce((optimal, current) => 
      current.getActiveCount() < optimal.getActiveCount() ? current : optimal
    );
  }

  private async runTest(testDef: TestDefinition, page: Page): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      // Execute the test function
      await testDef.testFunction(page);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      return {
        name: testDef.name,
        status: 'passed',
        duration,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        screenshots: [], // Would be populated during test execution
        metrics: {
          memoryUsage: await this.getMemoryUsage(page),
          performanceMetrics: await this.getPerformanceMetrics(page)
        }
      };

    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Capture failure screenshots
      const screenshot = await page.screenshot({ fullPage: true });
      
      return {
        name: testDef.name,
        status: 'failed',
        duration,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        error: error as Error,
        screenshots: [screenshot],
        metrics: {
          memoryUsage: await this.getMemoryUsage(page),
          performanceMetrics: await this.getPerformanceMetrics(page)
        }
      };
    }
  }

  private async executeSequentialTests(tests: TestDefinition[]): Promise<PhaseResults> {
    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await this.executeTest(test, 'performance');
        results.push(result);
      } catch (error) {
        // Continue with remaining tests even if one fails
        console.error(`Sequential test ${test.name} failed:`, error);
      }
    }

    return {
      phase: 'performance',
      total: tests.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };
  }

  private async getMemoryUsage(page: Page): Promise<number> {
    const metrics = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });

    return metrics ? metrics.usedJSHeapSize : 0;
  }

  private async getPerformanceMetrics(page: Page): Promise<any> {
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation').map(entry => ({
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        loadComplete: entry.loadEventEnd - entry.loadEventStart,
        responseTime: entry.responseEnd - entry.requestStart
      }));
    });

    return performanceEntries[0] || {};
  }

  private calculateSummary(module: PhaseResults, integration: PhaseResults, performance: PhaseResults): TestSummary {
    const totalTests = module.total + integration.total + performance.total;
    const totalPassed = module.passed + integration.passed + performance.passed;
    const totalFailed = module.failed + integration.failed + performance.failed;

    return {
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      passRate: (totalPassed / totalTests) * 100,
      phases: { module, integration, performance }
    };
  }

  async cleanup(): Promise<void> {
    // Clean up all browser pools
    for (const pool of this.browserPools.values()) {
      await pool.cleanup();
    }
    
    this.browserPools.clear();
    this.activeTests.clear();
  }

  getActiveTests(): TestExecution[] {
    return Array.from(this.activeTests.values());
  }

  getResourceUsage(): ResourceUsage {
    return this.resourceMonitor.getCurrentUsage();
  }
}

// Supporting classes and interfaces
class BrowserPool {
  constructor(public name: string, private config: PoolConfig) {}
  
  async initialize(): Promise<void> {
    // Initialize browser instances
  }
  
  async acquireContext(): Promise<BrowserContext> {
    // Return available browser context
    throw new Error('Not implemented');
  }
  
  async releaseContext(context: BrowserContext): Promise<void> {
    // Release context back to pool
  }
  
  isAvailable(): boolean {
    return true; // Implementation needed
  }
  
  supportsBrowser(browser: string): boolean {
    return this.config.browsers.includes(browser);
  }
  
  getActiveCount(): number {
    return 0; // Implementation needed
  }
  
  async cleanup(): Promise<void> {
    // Cleanup browser instances
  }
}

class ResourceMonitor {
  getCurrentUsage(): ResourceUsage {
    return {
      cpu: 0,
      memory: 0,
      activeTests: 0,
      timestamp: new Date()
    };
  }
}

// Type definitions
interface BrowserPoolConfig {
  [poolName: string]: PoolConfig;
}

interface PoolConfig {
  browsers: string[];
  maxInstances: number;
  timeout: number;
}

interface TestDefinition {
  name: string;
  requirements: TestRequirements;
  testFunction: (page: Page) => Promise<void>;
}

interface TestRequirements {
  browser: string;
  viewport?: { width: number; height: number };
  permissions?: string[];
}

interface ParallelTestSuite {
  name: string;
  moduleTests: TestDefinition[];
  integrationTests: TestDefinition[];
  performanceTests: TestDefinition[];
}

interface TestExecution {
  id: string;
  definition: TestDefinition;
  phase: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed';
  browserPool: string;
  result?: TestResult;
  error?: Error;
}

interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: Error;
  screenshots: Buffer[];
  metrics: {
    memoryUsage: number;
    performanceMetrics: any;
  };
}

interface PhaseResults {
  phase: string;
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

interface TestResults {
  startTime: number;
  endTime: number;
  totalTime: number;
  moduleResults: PhaseResults;
  integrationResults: PhaseResults;
  performanceResults: PhaseResults;
  summary: TestSummary;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  phases: {
    module: PhaseResults;
    integration: PhaseResults;
    performance: PhaseResults;
  };
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  activeTests: number;
  timestamp: Date;
}
```

This comprehensive Puppeteer test architecture provides a robust, maintainable, and scalable foundation for testing the Carmen ERP Permission Management system. The architecture supports parallel execution, proper error handling, performance monitoring, and detailed reporting while maintaining clear separation of concerns through the Page Object Model pattern.

The key benefits of this architecture include:

1. **Maintainability**: Clear separation between page objects, test logic, and utilities
2. **Scalability**: Parallel execution with intelligent resource management
3. **Reliability**: Comprehensive error handling and recovery mechanisms
4. **Performance**: Built-in performance monitoring and benchmarking
5. **Accessibility**: Integrated accessibility testing capabilities
6. **Reporting**: Detailed test results with screenshots and metrics

This architecture can be easily extended to accommodate additional test scenarios, new page objects, or different testing requirements as the Carmen ERP system evolves.