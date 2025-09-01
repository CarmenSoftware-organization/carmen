// Global test configuration for Permission Management E2E tests
export interface TestConfig {
  baseUrl: string;
  testTimeout: number;
  pageLoadTimeout: number;
  retryAttempts: number;
  screenshotMode: 'always' | 'failure' | 'never';
  videoMode: 'retain-on-failure' | 'on-first-retry' | 'off';
  parallelWorkers: number;
  viewports: ViewportConfig[];
  browsers: BrowserConfig[];
  performance: PerformanceConfig;
}

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
}

export interface BrowserConfig {
  name: 'chromium' | 'firefox' | 'webkit';
  channel?: string;
  headless?: boolean;
  slowMo?: number;
}

export interface PerformanceConfig {
  pageLoadBenchmark: number; // ms
  toggleResponseBenchmark: number; // ms
  searchResultsBenchmark: number; // ms
  memoryThreshold: number; // MB
  cpuThreshold: number; // percentage
}

export const testConfig: TestConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3005',
  testTimeout: 30000,
  pageLoadTimeout: 10000,
  retryAttempts: 2,
  screenshotMode: 'failure',
  videoMode: 'retain-on-failure',
  parallelWorkers: process.env.CI ? 2 : 4,
  
  viewports: [
    { name: 'desktop-large', width: 1920, height: 1080 },
    { name: 'desktop-medium', width: 1366, height: 768 },
    { name: 'desktop-small', width: 1024, height: 768 },
    { name: 'tablet-landscape', width: 1024, height: 768, isMobile: true },
    { name: 'tablet-portrait', width: 768, height: 1024, isMobile: true },
    { name: 'mobile-large', width: 414, height: 896, isMobile: true, deviceScaleFactor: 2 },
    { name: 'mobile-medium', width: 375, height: 667, isMobile: true, deviceScaleFactor: 2 },
    { name: 'mobile-small', width: 320, height: 568, isMobile: true, deviceScaleFactor: 2 }
  ],

  browsers: [
    { name: 'chromium', headless: !process.env.DEBUG },
    { name: 'firefox', headless: !process.env.DEBUG },
    { name: 'webkit', headless: !process.env.DEBUG }
  ],

  performance: {
    pageLoadBenchmark: 3000,
    toggleResponseBenchmark: 500,
    searchResultsBenchmark: 1000,
    memoryThreshold: 500,
    cpuThreshold: 80
  }
};

export const testSelectors = {
  // Global selectors
  pageLoaded: '[data-testid="page-loaded"]',
  loadingSpinner: '[data-testid="loading-spinner"]',
  errorMessage: '[data-testid="error-message"]',
  
  // Permission Management Page - Updated to match Tabs component
  permissionPage: 'h1:has-text("Policy Management")',
  rbacAbacToggle: '[role="tablist"]',
  rbacButton: '[role="tab"]:has-text("Role-Based (RBAC)")',
  abacButton: '[role="tab"]:has-text("Attribute-Based (ABAC)")',
  currentMode: '[role="tab"][data-state="active"]', // Active tab styling
  
  // Navigation - These appear to be buttons, not tabs
  policiesTab: 'button:has-text("Role-Based (RBAC)"), button:has-text("Attribute-Based (ABAC)")',
  rolesTab: '[data-testid="roles-tab"]', // Keep original if it exists elsewhere
  subscriptionTab: '[data-testid="subscription-tab"]', // Keep original if it exists elsewhere
  breadcrumbs: '[data-testid="permission-breadcrumbs"]',
  
  // Policy Management
  newPolicyButton: '[data-testid="new-policy-button"]',
  simpleCreatorButton: '[data-testid="simple-creator-button"]',
  policyList: '[data-testid="policy-list"]',
  policyItem: '[data-testid="policy-item"]',
  policyName: '[data-testid="policy-name"]',
  policyStatus: '[data-testid="policy-status"]',
  policyPriority: '[data-testid="policy-priority"]',
  
  // Filters
  filtersButton: '[data-testid="filters-button"]',
  filtersPanel: '[data-testid="filters-panel"]',
  searchInput: '[data-testid="search-input"]',
  effectFilter: '[data-testid="effect-filter"]',
  statusFilter: '[data-testid="status-filter"]',
  
  // Policy Wizard
  policyWizard: '[data-testid="policy-wizard"]',
  wizardStep1: '[data-testid="wizard-step-1"]',
  wizardStep2: '[data-testid="wizard-step-2"]',
  wizardStep3: '[data-testid="wizard-step-3"]',
  wizardNext: '[data-testid="wizard-next"]',
  wizardBack: '[data-testid="wizard-back"]',
  wizardComplete: '[data-testid="wizard-complete"]',
  
  // Form Fields
  policyNameField: '[data-testid="policy-name-field"]',
  policyDescriptionField: '[data-testid="policy-description-field"]',
  policyPriorityField: '[data-testid="policy-priority-field"]',
  policyEffectField: '[data-testid="policy-effect-field"]',
  
  // Modals
  modal: '[data-testid="modal"]',
  modalClose: '[data-testid="modal-close"]',
  modalConfirm: '[data-testid="modal-confirm"]',
  modalCancel: '[data-testid="modal-cancel"]',
  
  // Migration
  migrationDialog: '[data-testid="migration-dialog"]',
  migrationProgress: '[data-testid="migration-progress"]',
  migrationComplete: '[data-testid="migration-complete"]',
  confirmMigration: '[data-testid="confirm-migration"]',
  cancelMigration: '[data-testid="cancel-migration"]'
} as const;

export const testData = {
  users: {
    superAdmin: {
      email: 'super.admin@carmen.test',
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super-admin'
    },
    departmentManager: {
      email: 'dept.manager@carmen.test',
      password: 'DeptManager123!',
      firstName: 'Department',
      lastName: 'Manager',
      role: 'department-manager'
    },
    financialManager: {
      email: 'finance.manager@carmen.test',
      password: 'FinanceManager123!',
      firstName: 'Financial',
      lastName: 'Manager',
      role: 'financial-manager'
    },
    purchasingStaff: {
      email: 'purchasing.staff@carmen.test',
      password: 'PurchasingStaff123!',
      firstName: 'Purchasing',
      lastName: 'Staff',
      role: 'purchasing-staff'
    },
    generalStaff: {
      email: 'general.staff@carmen.test',
      password: 'GeneralStaff123!',
      firstName: 'General',
      lastName: 'Staff',
      role: 'staff'
    }
  },
  
  samplePolicies: {
    simple: {
      name: 'Kitchen Staff Access',
      description: 'Allows kitchen staff to access inventory and recipes',
      priority: 500,
      effect: 'permit' as const,
      conditions: [
        {
          attribute: 'user.department',
          operator: 'equals',
          value: 'Kitchen'
        }
      ]
    },
    moderate: {
      name: 'Finance Manager Full Access',
      description: 'Comprehensive access for finance managers',
      priority: 800,
      effect: 'permit' as const,
      conditions: [
        {
          attribute: 'user.role',
          operator: 'equals',
          value: 'financial-manager'
        },
        {
          attribute: 'environment.time',
          operator: 'between',
          value: ['09:00', '18:00']
        }
      ]
    },
    complex: {
      name: 'Multi-Condition Access Policy',
      description: 'Complex policy with multiple conditions and groups',
      priority: 900,
      effect: 'permit' as const,
      conditions: [
        {
          type: 'group',
          operator: 'AND',
          conditions: [
            {
              attribute: 'user.department',
              operator: 'in',
              value: ['Finance', 'Procurement']
            },
            {
              attribute: 'user.role',
              operator: 'not_equals',
              value: 'staff'
            }
          ]
        },
        {
          attribute: 'resource.type',
          operator: 'equals',
          value: 'PURCHASE_ORDER'
        }
      ]
    }
  }
};

export default testConfig;