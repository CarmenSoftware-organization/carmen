import { Page } from 'playwright/test';
import { ParallelCoordinator, TestDefinition, ParallelTestSuite, TestResults } from '../utilities/ParallelCoordinator';
import { TestDataFactory } from '../utilities/TestDataFactory';
import { PermissionManagementPage } from '../page-objects/pages/PermissionManagementPage';
import { testConfig, testData } from '../config/test.config';

export class PermissionManagementTestRunner {
  private coordinator: ParallelCoordinator;
  private testSuites: Map<string, ParallelTestSuite> = new Map();

  constructor() {
    this.coordinator = new ParallelCoordinator();
    this.setupTestSuites();
  }

  /**
   * Initialize the test runner and browser pools
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Permission Management Test Runner');
    await this.coordinator.initializeBrowserPools();
    console.log('✅ Test runner initialization complete');
  }

  /**
   * Run the complete permission management test suite
   */
  async runCompleteTestSuite(): Promise<TestResults> {
    const testSuite = this.testSuites.get('permission-management-complete');
    if (!testSuite) {
      throw new Error('Complete test suite not found');
    }

    console.log('🧪 Starting complete Permission Management test suite');
    return await this.coordinator.executeTestSuite(testSuite);
  }

  /**
   * Run only toggle functionality tests
   */
  async runToggleTests(): Promise<TestResults> {
    const testSuite = this.testSuites.get('toggle-functionality');
    if (!testSuite) {
      throw new Error('Toggle test suite not found');
    }

    console.log('🔄 Starting RBAC/ABAC Toggle test suite');
    return await this.coordinator.executeTestSuite(testSuite);
  }

  /**
   * Run only policy management tests
   */
  async runPolicyTests(): Promise<TestResults> {
    const testSuite = this.testSuites.get('policy-management');
    if (!testSuite) {
      throw new Error('Policy test suite not found');
    }

    console.log('📋 Starting Policy Management test suite');
    return await this.coordinator.executeTestSuite(testSuite);
  }

  /**
   * Run performance benchmarking tests
   */
  async runPerformanceTests(): Promise<TestResults> {
    const testSuite = this.testSuites.get('performance-benchmarks');
    if (!testSuite) {
      throw new Error('Performance test suite not found');
    }

    console.log('⚡ Starting Performance Benchmark test suite');
    return await this.coordinator.executeTestSuite(testSuite);
  }

  /**
   * Clean up test runner resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test runner resources');
    await this.coordinator.cleanup();
    TestDataFactory.cleanup();
    console.log('✅ Cleanup complete');
  }

  /**
   * Set up all test suites
   */
  private setupTestSuites(): void {
    // Complete test suite
    this.testSuites.set('permission-management-complete', {
      name: 'Permission Management Complete Test Suite',
      moduleTests: [
        ...this.createToggleTests(),
        ...this.createPolicyManagementTests(),
        ...this.createNavigationTests()
      ],
      integrationTests: [
        ...this.createIntegrationTests()
      ],
      performanceTests: [
        ...this.createPerformanceTests()
      ]
    });

    // Toggle-specific test suite
    this.testSuites.set('toggle-functionality', {
      name: 'RBAC/ABAC Toggle Functionality',
      moduleTests: this.createToggleTests(),
      integrationTests: [],
      performanceTests: []
    });

    // Policy-specific test suite
    this.testSuites.set('policy-management', {
      name: 'Policy Management Workflow',
      moduleTests: this.createPolicyManagementTests(),
      integrationTests: [],
      performanceTests: []
    });

    // Performance benchmark suite
    this.testSuites.set('performance-benchmarks', {
      name: 'Performance Benchmarks',
      moduleTests: [],
      integrationTests: [],
      performanceTests: this.createPerformanceTests()
    });
  }

  /**
   * Create toggle functionality tests
   */
  private createToggleTests(): TestDefinition[] {
    return [
      {
        name: 'toggle-page-load-validation',
        category: 'toggle-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const isValid = await permissionPage.validatePageLoad();
          if (!isValid) {
            throw new Error('Permission management page failed validation');
          }
        }
      },

      {
        name: 'toggle-rbac-to-abac-switch',
        category: 'toggle-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          // Ensure starting from RBAC
          await permissionPage.toggleToRBAC();
          let mode = await permissionPage.getCurrentMode();
          if (mode !== 'rbac') {
            throw new Error(`Expected RBAC mode, got ${mode}`);
          }
          
          // Switch to ABAC
          const responseTime = await permissionPage.measureToggleResponseTime();
          if (responseTime > testConfig.performance.toggleResponseBenchmark) {
            throw new Error(`Toggle response time ${responseTime}ms exceeds benchmark ${testConfig.performance.toggleResponseBenchmark}ms`);
          }
          
          await permissionPage.toggleToABAC();
          mode = await permissionPage.getCurrentMode();
          if (mode !== 'abac') {
            throw new Error(`Expected ABAC mode, got ${mode}`);
          }
        }
      },

      {
        name: 'toggle-abac-to-rbac-switch',
        category: 'toggle-tests',
        requirements: {
          browser: 'firefox',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          // Ensure starting from ABAC
          await permissionPage.toggleToABAC();
          let mode = await permissionPage.getCurrentMode();
          if (mode !== 'abac') {
            throw new Error(`Expected ABAC mode, got ${mode}`);
          }
          
          // Switch to RBAC
          await permissionPage.toggleToRBAC();
          mode = await permissionPage.getCurrentMode();
          if (mode !== 'rbac') {
            throw new Error(`Expected RBAC mode, got ${mode}`);
          }
        }
      },

      {
        name: 'toggle-accessibility-validation',
        category: 'toggle-tests',
        requirements: {
          browser: 'webkit',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const isAccessible = await permissionPage.testPageAccessibility();
          if (!isAccessible) {
            throw new Error('Toggle component failed accessibility validation');
          }
        }
      },

      {
        name: 'toggle-responsive-design',
        category: 'toggle-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 375, height: 667 } // Mobile viewport
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const isResponsive = await permissionPage.testResponsiveDesign();
          if (!isResponsive) {
            throw new Error('Toggle component not responsive across all viewports');
          }
        }
      }
    ];
  }

  /**
   * Create policy management tests
   */
  private createPolicyManagementTests(): TestDefinition[] {
    return [
      {
        name: 'policy-list-display-validation',
        category: 'policy-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const isValid = await permissionPage.validatePolicyListDisplay();
          if (!isValid) {
            throw new Error('Policy list display validation failed');
          }
        }
      },

      {
        name: 'policy-search-functionality',
        category: 'policy-tests',
        requirements: {
          browser: 'firefox',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const policies = await permissionPage.getPolicyList();
          if (policies.length === 0) {
            console.log('Skipping search test - no policies available');
            return;
          }
          
          const searchTerm = policies[0].name.substring(0, 3);
          const searchTime = await permissionPage.measureSearchResponseTime(searchTerm);
          
          if (searchTime > testConfig.performance.searchResultsBenchmark) {
            throw new Error(`Search response time ${searchTime}ms exceeds benchmark ${testConfig.performance.searchResultsBenchmark}ms`);
          }
          
          const filteredPolicies = await permissionPage.getPolicyList();
          const matchingPolicies = filteredPolicies.filter(policy => 
            policy.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          if (matchingPolicies.length === 0 && filteredPolicies.length > 0) {
            throw new Error('Search results do not match search criteria');
          }
        }
      },

      {
        name: 'policy-filtering-functionality',
        category: 'policy-tests',
        requirements: {
          browser: 'webkit',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const initialPolicies = await permissionPage.getPolicyList();
          if (initialPolicies.length === 0) {
            console.log('Skipping filter test - no policies available');
            return;
          }
          
          // Test effect filter
          await permissionPage.filterByEffect('permit');
          const permitPolicies = await permissionPage.getPolicyList();
          
          for (const policy of permitPolicies) {
            if (policy.effect !== 'permit') {
              throw new Error(`Policy ${policy.name} has effect ${policy.effect}, expected 'permit'`);
            }
          }
          
          // Clear filters
          await permissionPage.clearAllFilters();
          const clearedPolicies = await permissionPage.getPolicyList();
          
          if (clearedPolicies.length !== initialPolicies.length) {
            throw new Error('Policy count mismatch after clearing filters');
          }
        }
      },

      {
        name: 'simple-creator-accessibility',
        category: 'policy-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          // Test Simple Creator button accessibility
          const simpleCreatorButton = page.locator('[data-testid="simple-creator-button"]');
          
          // Check if button is focusable
          await simpleCreatorButton.focus();
          const isFocused = await simpleCreatorButton.evaluate(el => document.activeElement === el);
          if (!isFocused) {
            throw new Error('Simple Creator button is not focusable');
          }
          
          // Test keyboard activation
          await page.keyboard.press('Enter');
          
          // Check if action was triggered (modal appears or navigation occurs)
          const modalVisible = await page.isVisible('[data-testid="simple-policy-modal"]');
          const urlChanged = page.url().includes('simple');
          
          if (!modalVisible && !urlChanged) {
            throw new Error('Simple Creator button not activated by keyboard');
          }
        }
      }
    ];
  }

  /**
   * Create navigation tests
   */
  private createNavigationTests(): TestDefinition[] {
    return [
      {
        name: 'tab-navigation-functionality',
        category: 'navigation-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          // Test tab switching if tabs are available
          if (await page.isVisible('[data-testid="roles-tab"]')) {
            const switchTime = await permissionPage.measureTabSwitchTime('policies', 'roles');
            if (switchTime > 1000) { // 1 second benchmark for tab switching
              throw new Error(`Tab switch time ${switchTime}ms is too slow`);
            }
            
            const currentTab = await permissionPage.getCurrentTab();
            if (currentTab !== 'roles') {
              throw new Error(`Expected 'roles' tab, got '${currentTab}'`);
            }
          }
        }
      },

      {
        name: 'breadcrumb-navigation',
        category: 'navigation-tests',
        requirements: {
          browser: 'firefox',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          // Check if breadcrumbs are present and functional
          if (await page.isVisible('[data-testid="permission-breadcrumbs"]')) {
            const breadcrumbText = await permissionPage.getBreadcrumbText();
            
            if (!breadcrumbText.includes('Permission')) {
              throw new Error(`Breadcrumb text '${breadcrumbText}' doesn't contain 'Permission'`);
            }
          }
        }
      }
    ];
  }

  /**
   * Create integration tests
   */
  private createIntegrationTests(): TestDefinition[] {
    return [
      {
        name: 'toggle-policy-list-integration',
        category: 'integration-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const initialPolicyCount = await permissionPage.getPolicyCount();
          
          // Switch modes and verify policy count remains consistent
          const initialMode = await permissionPage.getCurrentMode();
          
          if (initialMode === 'rbac') {
            await permissionPage.toggleToABAC();
          } else {
            await permissionPage.toggleToRBAC();
          }
          
          const policyCountAfterSwitch = await permissionPage.getPolicyCount();
          
          if (policyCountAfterSwitch !== initialPolicyCount) {
            throw new Error(`Policy count changed after mode switch: ${initialPolicyCount} -> ${policyCountAfterSwitch}`);
          }
        }
      },

      {
        name: 'cross-browser-consistency',
        category: 'integration-tests',
        requirements: {
          browser: 'webkit',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          // Test basic functionality in WebKit
          const isValid = await permissionPage.validatePageLoad();
          if (!isValid) {
            throw new Error('Permission management page failed validation in WebKit');
          }
          
          const toggleWorking = await permissionPage.validateToggleFunctionality();
          if (!toggleWorking) {
            throw new Error('Toggle functionality not working in WebKit');
          }
        }
      }
    ];
  }

  /**
   * Create performance tests
   */
  private createPerformanceTests(): TestDefinition[] {
    return [
      {
        name: 'page-load-performance',
        category: 'performance-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 },
          monitorNetwork: true
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          
          const loadTime = await permissionPage.measurePageLoadTime();
          if (loadTime > testConfig.performance.pageLoadBenchmark) {
            throw new Error(`Page load time ${loadTime}ms exceeds benchmark ${testConfig.performance.pageLoadBenchmark}ms`);
          }
          
          const metrics = await permissionPage.getPageMetrics();
          console.log('Page metrics:', metrics);
        }
      },

      {
        name: 'toggle-performance-stress',
        category: 'performance-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          const toggle = permissionPage.toggle;
          const switchTimes = await toggle.testTogglePerformance(10); // 10 iterations
          
          const averageTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
          const maxTime = Math.max(...switchTimes);
          
          if (averageTime > testConfig.performance.toggleResponseBenchmark) {
            throw new Error(`Average toggle time ${averageTime}ms exceeds benchmark`);
          }
          
          if (maxTime > testConfig.performance.toggleResponseBenchmark * 2) {
            throw new Error(`Maximum toggle time ${maxTime}ms exceeds acceptable limit`);
          }
          
          console.log(`Toggle performance: avg ${averageTime}ms, max ${maxTime}ms`);
        }
      },

      {
        name: 'memory-usage-monitoring',
        category: 'performance-tests',
        requirements: {
          browser: 'chromium',
          viewport: { width: 1368, height: 720 }
        },
        testFunction: async (page: Page) => {
          const permissionPage = new PermissionManagementPage(page);
          await permissionPage.navigateToPermissionManagement();
          
          // Monitor memory usage during typical operations
          const initialMetrics = await permissionPage.getPageMetrics();
          const initialMemory = initialMetrics.memoryUsage || 0;
          
          // Perform multiple operations
          for (let i = 0; i < 5; i++) {
            await permissionPage.searchPolicies('test');
            await permissionPage.clearSearch();
            await permissionPage.filterByEffect('permit');
            await permissionPage.clearAllFilters();
          }
          
          const finalMetrics = await permissionPage.getPageMetrics();
          const finalMemory = finalMetrics.memoryUsage || 0;
          const memoryGrowth = finalMemory - initialMemory;
          
          // Allow for reasonable memory growth (5MB)
          if (memoryGrowth > 5 * 1024 * 1024) {
            throw new Error(`Excessive memory growth: ${memoryGrowth / 1024 / 1024}MB`);
          }
          
          console.log(`Memory usage: ${initialMemory / 1024 / 1024}MB -> ${finalMemory / 1024 / 1024}MB (growth: ${memoryGrowth / 1024 / 1024}MB)`);
        }
      }
    ];
  }
}

// Export default instance for easy usage
export default new PermissionManagementTestRunner();