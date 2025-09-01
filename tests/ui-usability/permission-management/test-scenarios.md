# Carmen ERP Permission Management - Test Scenarios

## Overview

This document provides detailed test scenarios for each module of the Permission Management system. Each scenario includes prerequisites, step-by-step procedures, expected outcomes, and success criteria that can be executed in parallel by the Puppeteer test architecture.

---

## Module 1: RBAC/ABAC Toggle Functionality

### Scenario 1.1: Initial System State Detection
**Priority**: Critical  
**Execution Time**: ~3 minutes  
**Parallel Safe**: Yes

#### Prerequisites
- Fresh system installation
- Super admin account available
- No previous permission model selection

#### Test Steps
```typescript
// Puppeteer Test Implementation
test('RBAC/ABAC Toggle - Initial State Detection', async ({ page }) => {
  await page.goto('/system-administration/permission-management');
  
  // Verify initial state
  const toggleElement = await page.locator('[data-testid="rbac-abac-toggle"]');
  await expect(toggleElement).toBeVisible();
  
  // Check default state (should be RBAC)
  const currentMode = await toggleElement.getAttribute('data-current-mode');
  expect(currentMode).toBe('rbac');
  
  // Verify UI reflects RBAC mode
  const policySection = await page.locator('[data-testid="policy-management"]');
  await expect(policySection).toHaveAttribute('data-mode', 'rbac');
});
```

#### Success Criteria
- Toggle is visible and accessible
- Default mode is RBAC
- UI correctly reflects current mode
- No JavaScript errors in console

### Scenario 1.2: Toggle Switch Responsiveness
**Priority**: Critical  
**Execution Time**: ~2 minutes  
**Parallel Safe**: Yes

#### Prerequisites
- System in RBAC mode
- Super admin logged in
- Network throttling disabled

#### Test Steps
```typescript
test('RBAC/ABAC Toggle - Switch Responsiveness', async ({ page }) => {
  await page.goto('/system-administration/permission-management');
  
  const toggle = page.locator('[data-testid="rbac-abac-toggle"]');
  
  // Record toggle time
  const startTime = Date.now();
  await toggle.click();
  
  // Wait for mode change confirmation
  await page.waitForSelector('[data-testid="mode-change-success"]');
  const endTime = Date.now();
  
  // Verify response time
  const responseTime = endTime - startTime;
  expect(responseTime).toBeLessThan(500); // Must be under 500ms
  
  // Verify UI updates
  await expect(toggle).toHaveAttribute('data-current-mode', 'abac');
});
```

#### Success Criteria
- Toggle responds within 500ms
- Visual feedback provided immediately
- Mode change confirmation appears
- UI elements update correctly

### Scenario 1.3: Permission Model Change Impact
**Priority**: High  
**Execution Time**: ~5 minutes  
**Parallel Safe**: No (affects global state)

#### Prerequisites
- Existing RBAC roles configured
- Test users assigned to roles
- Sample policies available

#### Test Steps
```typescript
test('RBAC/ABAC Toggle - Model Change Impact', async ({ page }) => {
  // Setup: Create test role and user
  await createTestRoleAndUser(page);
  
  // Switch from RBAC to ABAC
  await page.goto('/system-administration/permission-management');
  await page.click('[data-testid="rbac-abac-toggle"]');
  
  // Verify migration dialog appears
  await expect(page.locator('[data-testid="migration-dialog"]')).toBeVisible();
  await page.click('[data-testid="confirm-migration"]');
  
  // Wait for migration completion
  await page.waitForSelector('[data-testid="migration-complete"]', { timeout: 30000 });
  
  // Verify roles are preserved
  const roleCount = await page.locator('[data-testid="role-item"]').count();
  expect(roleCount).toBeGreaterThan(0);
  
  // Verify users maintain access
  await validateUserAccess(page, 'test-user-id');
});
```

#### Success Criteria
- Migration dialog appears with clear explanation
- Existing roles are preserved
- User assignments remain intact
- No data loss occurs during migration

---

## Module 2: Policy Management Interface

### Scenario 2.1: 3-Step Policy Creation Wizard
**Priority**: Critical  
**Execution Time**: ~8 minutes  
**Parallel Safe**: Yes (with unique test data)

#### Prerequisites
- ABAC mode enabled
- Super admin or role with policy creation permissions
- Test data for policy attributes available

#### Test Steps
```typescript
test('Policy Management - 3-Step Creation Wizard', async ({ page }) => {
  await page.goto('/system-administration/permission-management');
  await page.click('[data-testid="policies-tab"]');
  
  // Start policy creation
  await page.click('[data-testid="new-policy-button"]');
  await expect(page.locator('[data-testid="policy-wizard"]')).toBeVisible();
  
  // Step 1: Basic Information
  await page.fill('[data-testid="policy-name"]', 'Test Finance Policy');
  await page.fill('[data-testid="policy-description"]', 'Policy for financial data access');
  await page.selectOption('[data-testid="policy-priority"]', '500');
  await page.click('[data-testid="wizard-next"]');
  
  // Step 2: Rules and Conditions
  await page.selectOption('[data-testid="subject-attribute"]', 'user.department');
  await page.selectOption('[data-testid="operator"]', 'equals');
  await page.fill('[data-testid="attribute-value"]', 'Finance');
  await page.click('[data-testid="add-condition"]');
  await page.click('[data-testid="wizard-next"]');
  
  // Step 3: Review and Create
  await expect(page.locator('[data-testid="policy-summary"]')).toContainText('Test Finance Policy');
  await page.click('[data-testid="create-policy"]');
  
  // Verify success
  await expect(page.locator('[data-testid="policy-created-success"]')).toBeVisible();
  
  // Verify policy appears in list
  await expect(page.locator('[data-testid="policy-list"]')).toContainText('Test Finance Policy');
});
```

#### Success Criteria
- Wizard completes all 3 steps successfully
- Policy is created with correct attributes
- Success confirmation is displayed
- Policy appears in policy list

### Scenario 2.2: Complex Policy with Multiple Conditions
**Priority**: High  
**Execution Time**: ~10 minutes  
**Parallel Safe**: Yes (with unique test data)

#### Prerequisites
- ABAC mode enabled
- Advanced policy creation permissions
- Understanding of ABAC expression language

#### Test Steps
```typescript
test('Policy Management - Complex Multi-Condition Policy', async ({ page }) => {
  await page.goto('/system-administration/permission-management/policies/builder');
  
  // Create complex policy with nested conditions
  await page.fill('[data-testid="policy-name"]', 'Complex Approval Policy');
  
  // First condition group (Department AND Role)
  await page.click('[data-testid="add-condition-group"]');
  await addCondition(page, 0, 'user.department', 'equals', 'Finance');
  await addCondition(page, 0, 'user.role', 'in', ['Manager', 'Director']);
  await page.selectOption('[data-testid="group-0-operator"]', 'AND');
  
  // Second condition group (Time AND Amount)
  await page.click('[data-testid="add-condition-group"]');
  await addCondition(page, 1, 'environment.time', 'between', '09:00-17:00');
  await addCondition(page, 1, 'resource.amount', 'less_than', '10000');
  await page.selectOption('[data-testid="group-1-operator"]', 'AND');
  
  // Connect groups with OR
  await page.selectOption('[data-testid="global-operator"]', 'OR');
  
  // Test policy
  await page.click('[data-testid="test-policy"]');
  await page.fill('[data-testid="test-user-id"]', 'finance-manager-001');
  await page.click('[data-testid="run-test"]');
  
  // Verify test results
  await expect(page.locator('[data-testid="test-result"]')).toContainText('PERMIT');
  
  // Save policy
  await page.click('[data-testid="save-policy"]');
  await expect(page.locator('[data-testid="policy-saved"]')).toBeVisible();
});
```

#### Success Criteria
- Complex nested conditions can be created
- Policy testing returns expected results
- Policy saves successfully
- Expression syntax is valid

### Scenario 2.3: Policy Testing and Simulation
**Priority**: High  
**Execution Time**: ~6 minutes  
**Parallel Safe**: Yes

#### Prerequisites
- Existing policy available for testing
- Test user accounts with different attributes
- Policy simulation feature enabled

#### Test Steps
```typescript
test('Policy Management - Testing and Simulation', async ({ page }) => {
  await page.goto('/system-administration/permission-management/policies');
  
  // Select existing policy
  await page.click('[data-testid="policy-item"]:first-child');
  await page.click('[data-testid="test-policy-button"]');
  
  // Simulation modal opens
  await expect(page.locator('[data-testid="policy-simulation-modal"]')).toBeVisible();
  
  // Test with different user scenarios
  const testCases = [
    { userId: 'finance-manager', expected: 'PERMIT' },
    { userId: 'kitchen-staff', expected: 'DENY' },
    { userId: 'department-head', expected: 'PERMIT' }
  ];
  
  for (const testCase of testCases) {
    await page.fill('[data-testid="simulation-user-id"]', testCase.userId);
    await page.click('[data-testid="simulate-access"]');
    
    await expect(page.locator('[data-testid="simulation-result"]'))
      .toContainText(testCase.expected);
    
    // Verify detailed explanation is provided
    await expect(page.locator('[data-testid="simulation-explanation"]'))
      .toBeVisible();
  }
  
  // Export test results
  await page.click('[data-testid="export-test-results"]');
  // Verify download initiated (check for download event)
});
```

#### Success Criteria
- Policy simulation works with different user profiles
- Results match expected outcomes
- Detailed explanations are provided
- Test results can be exported

---

## Module 3: Role Management System

### Scenario 3.1: Role Creation with Permissions
**Priority**: Critical  
**Execution Time**: ~7 minutes  
**Parallel Safe**: Yes (with unique role names)

#### Prerequisites
- Role management permissions
- Available permission templates
- Department and location data available

#### Test Steps
```typescript
test('Role Management - Role Creation with Permissions', async ({ page }) => {
  await page.goto('/system-administration/permission-management/roles');
  
  // Create new role
  await page.click('[data-testid="create-role-button"]');
  await expect(page.locator('[data-testid="role-form-dialog"]')).toBeVisible();
  
  // Fill basic role information
  await page.fill('[data-testid="role-name"]', 'Kitchen Supervisor');
  await page.fill('[data-testid="role-description"]', 'Supervises kitchen operations and staff');
  await page.selectOption('[data-testid="role-department"]', 'Kitchen');
  
  // Set permission levels
  await page.click('[data-testid="permissions-tab"]');
  
  // Configure module permissions
  await setPermissionLevel(page, 'inventory-management', 'write');
  await setPermissionLevel(page, 'recipe-management', 'admin');
  await setPermissionLevel(page, 'staff-scheduling', 'read');
  await setPermissionLevel(page, 'financial-reports', 'none');
  
  // Add specific permissions
  await page.click('[data-testid="add-custom-permission"]');
  await page.fill('[data-testid="permission-resource"]', 'kitchen.equipment');
  await page.selectOption('[data-testid="permission-action"]', 'maintenance');
  await page.click('[data-testid="add-permission"]');
  
  // Save role
  await page.click('[data-testid="save-role"]');
  
  // Verify creation
  await expect(page.locator('[data-testid="role-created-success"]')).toBeVisible();
  await expect(page.locator('[data-testid="roles-list"]')).toContainText('Kitchen Supervisor');
});
```

#### Success Criteria
- Role is created with specified name and description
- Permissions are correctly assigned
- Role appears in roles list
- Success confirmation is displayed

### Scenario 3.2: Bulk User Assignment
**Priority**: High  
**Execution Time**: ~5 minutes  
**Parallel Safe**: Yes (with different user sets)

#### Prerequisites
- Existing role available
- Multiple test user accounts
- Bulk operations enabled

#### Test Steps
```typescript
test('Role Management - Bulk User Assignment', async ({ page }) => {
  await page.goto('/system-administration/permission-management/roles');
  
  // Select role for user assignment
  await page.click('[data-testid="role-item"]:first-child');
  await page.click('[data-testid="user-assignment-tab"]');
  
  // Open bulk assignment
  await page.click('[data-testid="bulk-assign-users"]');
  await expect(page.locator('[data-testid="bulk-assignment-dialog"]')).toBeVisible();
  
  // Select multiple users
  const userCheckboxes = page.locator('[data-testid^="user-checkbox-"]');
  const userCount = await userCheckboxes.count();
  
  // Select first 5 users
  for (let i = 0; i < Math.min(5, userCount); i++) {
    await userCheckboxes.nth(i).check();
  }
  
  // Verify selection count
  await expect(page.locator('[data-testid="selected-users-count"]'))
    .toContainText('5 users selected');
  
  // Assign users
  await page.click('[data-testid="assign-selected-users"]');
  
  // Verify assignment progress
  await expect(page.locator('[data-testid="assignment-progress"]')).toBeVisible();
  await page.waitForSelector('[data-testid="assignment-complete"]', { timeout: 10000 });
  
  // Verify users appear in assigned list
  const assignedUsers = page.locator('[data-testid="assigned-user-item"]');
  const assignedCount = await assignedUsers.count();
  expect(assignedCount).toBe(5);
});
```

#### Success Criteria
- Multiple users can be selected simultaneously
- Bulk assignment completes successfully
- Progress indicator shows during assignment
- All assigned users appear in the role

### Scenario 3.3: Permission Inheritance Testing
**Priority**: High  
**Execution Time**: ~8 minutes  
**Parallel Safe**: No (requires specific role hierarchy)

#### Prerequisites
- Parent and child role hierarchy
- User assigned to child role
- Permission inheritance enabled

#### Test Steps
```typescript
test('Role Management - Permission Inheritance', async ({ page }) => {
  // Create parent role with specific permissions
  await createRole(page, {
    name: 'Department Manager',
    permissions: ['user-management:read', 'reports:read', 'inventory:write']
  });
  
  // Create child role inheriting from parent
  await createRole(page, {
    name: 'Shift Supervisor',
    parentRole: 'Department Manager',
    additionalPermissions: ['scheduling:write', 'staff:read']
  });
  
  // Assign user to child role
  await assignUserToRole(page, 'test-user-001', 'Shift Supervisor');
  
  // Test permission inheritance
  await page.goto('/system-administration/permission-management/roles');
  await page.click('[data-testid="role-item"][data-role-name="Shift Supervisor"]');
  
  // Check effective permissions tab
  await page.click('[data-testid="effective-permissions-tab"]');
  
  // Verify inherited permissions are displayed
  const effectivePermissions = page.locator('[data-testid="effective-permission"]');
  await expect(effectivePermissions).toContainText('user-management:read');
  await expect(effectivePermissions).toContainText('reports:read');
  await expect(effectivePermissions).toContainText('inventory:write');
  await expect(effectivePermissions).toContainText('scheduling:write');
  await expect(effectivePermissions).toContainText('staff:read');
  
  // Test user access with inherited permissions
  await impersonateUser(page, 'test-user-001');
  await validateUserAccess(page, 'user-management', 'read');
  await validateUserAccess(page, 'scheduling', 'write');
});
```

#### Success Criteria
- Child roles inherit parent permissions
- Additional permissions are combined correctly
- Effective permissions display shows complete picture
- User access reflects inherited permissions

---

## Module 4: Subscription Management

### Scenario 4.1: Package Selection and Comparison
**Priority**: Medium  
**Execution Time**: ~4 minutes  
**Parallel Safe**: Yes

#### Prerequisites
- Multiple subscription packages available
- Current subscription status known
- Package comparison feature enabled

#### Test Steps
```typescript
test('Subscription Management - Package Comparison', async ({ page }) => {
  await page.goto('/system-administration/permission-management/subscription');
  
  // Navigate to packages tab
  await page.click('[data-testid="packages-tab"]');
  
  // Select packages for comparison
  await page.check('[data-testid="package-basic"]');
  await page.check('[data-testid="package-professional"]');
  await page.check('[data-testid="package-enterprise"]');
  
  // Open comparison view
  await page.click('[data-testid="compare-packages"]');
  await expect(page.locator('[data-testid="package-comparison-modal"]')).toBeVisible();
  
  // Verify comparison details
  const comparisonTable = page.locator('[data-testid="comparison-table"]');
  await expect(comparisonTable).toBeVisible();
  
  // Check feature differences
  await expect(comparisonTable).toContainText('User Limit');
  await expect(comparisonTable).toContainText('ABAC Policies');
  await expect(comparisonTable).toContainText('Advanced Analytics');
  
  // Test package selection
  await page.click('[data-testid="select-professional"]');
  await expect(page.locator('[data-testid="upgrade-confirmation"]')).toBeVisible();
  
  // Cancel to avoid actual purchase
  await page.click('[data-testid="cancel-upgrade"]');
});
```

#### Success Criteria
- Package comparison loads correctly
- Feature differences are clearly displayed
- Selection process initiates properly
- Cancellation works without issues

### Scenario 4.2: Resource Activation/Deactivation
**Priority**: Medium  
**Execution Time**: ~6 minutes  
**Parallel Safe**: Yes

#### Prerequisites
- Active subscription with configurable resources
- Admin permissions for resource management
- Available resources for testing

#### Test Steps
```typescript
test('Subscription Management - Resource Management', async ({ page }) => {
  await page.goto('/system-administration/permission-management/subscription');
  await page.click('[data-testid="resources-tab"]');
  
  // View available resources
  const resourceList = page.locator('[data-testid="resource-list"]');
  await expect(resourceList).toBeVisible();
  
  // Test resource activation
  const inactiveResource = page.locator('[data-testid="resource-item"][data-status="inactive"]').first();
  await inactiveResource.locator('[data-testid="activate-resource"]').click();
  
  // Confirm activation
  await expect(page.locator('[data-testid="activation-confirmation"]')).toBeVisible();
  await page.click('[data-testid="confirm-activation"]');
  
  // Verify activation
  await expect(inactiveResource).toHaveAttribute('data-status', 'active');
  
  // Test resource configuration
  await inactiveResource.locator('[data-testid="configure-resource"]').click();
  
  // Adjust resource limits
  await page.fill('[data-testid="user-limit"]', '100');
  await page.fill('[data-testid="storage-limit"]', '50');
  await page.click('[data-testid="save-configuration"]');
  
  // Verify configuration saved
  await expect(page.locator('[data-testid="config-saved"]')).toBeVisible();
  
  // Test resource deactivation
  await page.click('[data-testid="deactivate-resource"]');
  await page.click('[data-testid="confirm-deactivation"]');
  await expect(inactiveResource).toHaveAttribute('data-status', 'inactive');
});
```

#### Success Criteria
- Resources can be activated/deactivated
- Configuration changes are saved
- Status changes are reflected immediately
- Confirmation dialogs work properly

---

## Cross-Module Integration Scenarios

### Scenario I1: End-to-End Policy Assignment Workflow
**Priority**: Critical  
**Execution Time**: ~12 minutes  
**Parallel Safe**: No (involves multiple modules)

#### Prerequisites
- ABAC mode enabled
- Role and policy management permissions
- Test user account available

#### Test Steps
```typescript
test('Integration - Complete Policy Assignment Workflow', async ({ page }) => {
  // Step 1: Create a new policy
  await page.goto('/system-administration/permission-management/policies');
  const policyId = await createTestPolicy(page, {
    name: 'Marketing Budget Policy',
    conditions: [
      { attribute: 'user.department', operator: 'equals', value: 'Marketing' },
      { attribute: 'resource.budget', operator: 'less_than', value: '5000' }
    ]
  });
  
  // Step 2: Create role and assign policy
  await page.goto('/system-administration/permission-management/roles');
  await page.click('[data-testid="create-role-button"]');
  
  await page.fill('[data-testid="role-name"]', 'Marketing Coordinator');
  await page.click('[data-testid="policy-assignment-tab"]');
  await assignPolicyToRole(page, policyId);
  await page.click('[data-testid="save-role"]');
  
  // Step 3: Assign user to role
  const roleId = await getCurrentRoleId(page);
  await assignUserToRole(page, 'marketing-user-001', roleId);
  
  // Step 4: Test end-to-end access
  await impersonateUser(page, 'marketing-user-001');
  
  // Should have access to marketing budget under $5000
  await validateAccess(page, {
    resource: 'budget-request',
    amount: 3000,
    department: 'Marketing',
    expectedResult: 'PERMIT'
  });
  
  // Should be denied for amounts over $5000
  await validateAccess(page, {
    resource: 'budget-request',
    amount: 7000,
    department: 'Marketing',
    expectedResult: 'DENY'
  });
});
```

#### Success Criteria
- Policy creation, role assignment, and user assignment work together
- End-to-end permissions work as expected
- Access control decisions are correct
- Audit trail captures all changes

### Scenario I2: Cross-Browser Compatibility Test
**Priority**: High  
**Execution Time**: ~15 minutes  
**Parallel Safe**: Yes (different browsers)

#### Prerequisites
- Chrome, Firefox, Safari, and Edge available
- Test can run on multiple browsers simultaneously
- Core functionality works in development

#### Test Steps
```typescript
// This would be run across multiple browser contexts
test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Policy Management on ${browserName}`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Test core functionality
      await testPolicyCreation(page);
      await testRoleManagement(page);
      await testToggleFunctionality(page);
      
      // Verify no browser-specific errors
      const errors = await page.evaluate(() => {
        return window.consoleLogs?.filter(log => log.type === 'error') || [];
      });
      
      expect(errors).toHaveLength(0);
      
      await context.close();
    });
  });
});
```

#### Success Criteria
- All core functionality works across browsers
- No browser-specific JavaScript errors
- UI renders consistently
- Performance is acceptable on all browsers

## Performance and Load Testing Scenarios

### Scenario P1: Large Dataset Performance
**Priority**: High  
**Execution Time**: ~10 minutes  
**Parallel Safe**: No (affects system performance)

#### Prerequisites
- Database seeded with large dataset
- Performance monitoring enabled
- Baseline performance metrics established

#### Test Steps
```typescript
test('Performance - Large Dataset Handling', async ({ page }) => {
  // Generate large dataset
  await seedDatabase({
    users: 1000,
    roles: 100,
    policies: 200,
    assignments: 5000
  });
  
  // Test role list performance
  const startTime = performance.now();
  await page.goto('/system-administration/permission-management/roles');
  
  // Wait for content to load
  await page.waitForSelector('[data-testid="roles-list"]');
  const endTime = performance.now();
  
  const loadTime = endTime - startTime;
  expect(loadTime).toBeLessThan(3000); // Must load within 3 seconds
  
  // Test search performance
  const searchStart = performance.now();
  await page.fill('[data-testid="role-search"]', 'Manager');
  await page.waitForSelector('[data-testid="search-results"]');
  const searchEnd = performance.now();
  
  const searchTime = searchEnd - searchStart;
  expect(searchTime).toBeLessThan(1000); // Search within 1 second
  
  // Test pagination performance
  await testPaginationPerformance(page);
});
```

#### Success Criteria
- Page loads within 3 seconds with 1000+ users
- Search results appear within 1 second
- Pagination doesn't cause performance degradation
- Memory usage remains stable

These test scenarios provide comprehensive coverage of the Permission Management system and can be executed in parallel to ensure efficient testing while maintaining accuracy and reliability.