import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright/test';
import { EventEmitter } from 'events';
import { testConfig, testSelectors } from '../config/test.config';
import { browserPoolConfig, testAllocation, resourceLimits } from '../config/browser.config';

export class ParallelCoordinator extends EventEmitter {
  private browserPools: Map<string, BrowserPool> = new Map();
  private activeTests: Map<string, TestExecution> = new Map();
  private resourceMonitor: ResourceMonitor;
  private testQueue: TestDefinition[] = [];
  private executionMetrics: ExecutionMetrics;

  constructor() {
    super();
    this.resourceMonitor = new ResourceMonitor();
    this.executionMetrics = new ExecutionMetrics();
  }

  /**
   * Initialize browser pools for parallel execution
   */
  async initializeBrowserPools(): Promise<void> {
    console.log('Initializing browser pools for parallel execution...');
    
    for (const [poolName, poolConfig] of Object.entries(browserPoolConfig)) {
      try {
        const pool = new BrowserPool(poolName, poolConfig);
        await pool.initialize();
        this.browserPools.set(poolName, pool);
        
        console.log(`✓ Initialized browser pool: ${poolName}`);
      } catch (error) {
        console.error(`✗ Failed to initialize browser pool ${poolName}:`, error);
        this.emit('pool-init-failed', { poolName, error });
      }
    }

    console.log(`Initialized ${this.browserPools.size} browser pools`);
    this.emit('pools-initialized', { count: this.browserPools.size });
  }

  /**
   * Execute a complete test suite with parallel coordination
   */
  async executeTestSuite(testSuite: ParallelTestSuite): Promise<TestResults> {
    const startTime = Date.now();
    console.log(`Starting test suite: ${testSuite.name}`);
    
    this.emit('suite-started', { suite: testSuite.name, startTime });
    this.executionMetrics.startSuite(testSuite.name);

    try {
      // Phase 1: Independent Module Tests (Parallel)
      console.log('Phase 1: Executing independent module tests in parallel...');
      const moduleResults = await this.executePhase(testSuite.moduleTests, 'module');
      
      // Phase 2: Integration Tests (Parallel with dependencies)
      console.log('Phase 2: Executing integration tests...');
      const integrationResults = await this.executePhase(testSuite.integrationTests, 'integration');
      
      // Phase 3: Performance Tests (Sequential due to resource constraints)
      console.log('Phase 3: Executing performance tests sequentially...');
      const performanceResults = await this.executeSequentialTests(testSuite.performanceTests);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const results: TestResults = {
        suiteId: testSuite.id || `suite-${Date.now()}`,
        suiteName: testSuite.name,
        startTime,
        endTime,
        totalTime,
        moduleResults,
        integrationResults,
        performanceResults,
        summary: this.calculateSummary(moduleResults, integrationResults, performanceResults),
        metrics: this.executionMetrics.getMetrics(),
        resourceUsage: this.resourceMonitor.getUsageSummary()
      };

      this.executionMetrics.endSuite();
      this.emit('suite-completed', results);
      
      console.log(`✓ Test suite completed in ${totalTime}ms`);
      console.log(`  Module Tests: ${moduleResults.passed}/${moduleResults.total} passed`);
      console.log(`  Integration Tests: ${integrationResults.passed}/${integrationResults.total} passed`);
      console.log(`  Performance Tests: ${performanceResults.passed}/${performanceResults.total} passed`);
      
      return results;

    } catch (error) {
      this.executionMetrics.endSuite();
      this.emit('suite-failed', error);
      console.error('✗ Test suite execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute a phase of tests in parallel
   */
  private async executePhase(tests: TestDefinition[], phase: string): Promise<PhaseResults> {
    const phaseStartTime = Date.now();
    const promises: Promise<TestResult>[] = [];
    
    console.log(`  Starting ${tests.length} tests in ${phase} phase`);
    
    // Group tests by allocated browser pools
    const testGroups = this.groupTestsByAllocation(tests, phase);
    
    for (const [poolName, poolTests] of testGroups) {
      for (const test of poolTests) {
        const promise = this.executeTest(test, phase, poolName);
        promises.push(promise);
        
        // Throttle test startup to avoid resource exhaustion
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const results = await Promise.allSettled(promises);
    
    const phaseEndTime = Date.now();
    const phaseTime = phaseEndTime - phaseStartTime;
    
    const phaseResults: PhaseResults = {
      phase,
      total: results.length,
      passed: results.filter(r => r.status === 'fulfilled' && r.value.status === 'passed').length,
      failed: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'failed')).length,
      skipped: results.filter(r => r.status === 'fulfilled' && r.value.status === 'skipped').length,
      results: results.map(r => r.status === 'fulfilled' ? r.value : this.createFailedResult(r.reason)).filter(Boolean),
      duration: phaseTime,
      startTime: phaseStartTime,
      endTime: phaseEndTime
    };

    console.log(`  ✓ ${phase} phase completed: ${phaseResults.passed}/${phaseResults.total} passed in ${phaseTime}ms`);
    
    return phaseResults;
  }

  /**
   * Group tests by browser pool allocation
   */
  private groupTestsByAllocation(tests: TestDefinition[], phase: string): Map<string, TestDefinition[]> {
    const allocation = testAllocation[`${phase}Tests` as keyof typeof testAllocation];
    const groups = new Map<string, TestDefinition[]>();
    
    // Initialize groups for allocated pools
    if (allocation) {
      for (const [testType, pools] of Object.entries(allocation)) {
        const testGroup = tests.filter(test => test.category === testType);
        
        if (testGroup.length > 0) {
          // Distribute tests across allocated pools
          let poolIndex = 0;
          for (const test of testGroup) {
            const poolName = Array.isArray(pools) ? pools[poolIndex % pools.length] : pools;
            
            if (!groups.has(poolName)) {
              groups.set(poolName, []);
            }
            groups.get(poolName)!.push(test);
            
            poolIndex++;
          }
        }
      }
    }
    
    // Handle unallocated tests - distribute to available pools
    const unallocatedTests = tests.filter(test => 
      !Array.from(groups.values()).some(group => group.includes(test))
    );
    
    if (unallocatedTests.length > 0) {
      const availablePools = Array.from(this.browserPools.keys());
      let poolIndex = 0;
      
      for (const test of unallocatedTests) {
        const poolName = availablePools[poolIndex % availablePools.length];
        
        if (!groups.has(poolName)) {
          groups.set(poolName, []);
        }
        groups.get(poolName)!.push(test);
        
        poolIndex++;
      }
    }
    
    return groups;
  }

  /**
   * Execute a single test
   */
  private async executeTest(testDef: TestDefinition, phase: string, preferredPool?: string): Promise<TestResult> {
    const testId = `${phase}-${testDef.name}-${Date.now()}`;
    const browserPool = preferredPool ? 
      this.browserPools.get(preferredPool) : 
      this.selectOptimalBrowserPool(testDef.requirements);
    
    if (!browserPool) {
      throw new Error(`No available browser pool for test: ${testDef.name}`);
    }

    const execution: TestExecution = {
      id: testId,
      definition: testDef,
      phase,
      startTime: Date.now(),
      status: 'running',
      browserPool: browserPool.name,
      retries: 0
    };

    this.activeTests.set(testId, execution);
    this.emit('test-started', execution);

    try {
      const context = await browserPool.acquireContext();
      const page = await context.newPage();
      
      // Set up page for testing
      await this.setupTestPage(page, testDef.requirements);
      
      // Execute the test with retry logic
      const result = await this.runTestWithRetry(testDef, page, execution);
      
      // Clean up
      await page.close();
      await browserPool.releaseContext(context);
      
      execution.status = result.status === 'passed' ? 'completed' : 'failed';
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
      
      return this.createFailedResult(error, testDef.name);
    }
  }

  /**
   * Execute test with retry logic
   */
  private async runTestWithRetry(testDef: TestDefinition, page: Page, execution: TestExecution): Promise<TestResult> {
    const maxRetries = testConfig.retryAttempts;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        execution.retries = attempt;
        
        if (attempt > 0) {
          console.log(`  Retry ${attempt}/${maxRetries} for test: ${testDef.name}`);
          await page.reload();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between retries
        }

        const result = await this.runSingleTest(testDef, page);
        
        if (result.status === 'passed') {
          return result;
        } else {
          lastError = new Error(`Test failed: ${result.error?.message}`);
        }
        
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break; // Don't retry on the last attempt
        }
      }
    }

    return this.createFailedResult(lastError || new Error('Test failed after retries'), testDef.name);
  }

  /**
   * Run a single test execution
   */
  private async runSingleTest(testDef: TestDefinition, page: Page): Promise<TestResult> {
    const startTime = Date.now();
    let screenshots: string[] = [];
    let metrics: any = {};
    
    try {
      // Execute the test function
      await testDef.testFunction(page);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Collect metrics
      metrics = await this.collectPageMetrics(page);
      
      // Take success screenshot if configured
      if (testConfig.screenshotMode === 'always') {
        const screenshot = await this.takeTestScreenshot(page, testDef.name, 'success');
        if (screenshot) screenshots.push(screenshot);
      }
      
      return {
        name: testDef.name,
        status: 'passed',
        duration,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        screenshots,
        metrics,
        category: testDef.category,
        phase: testDef.phase || 'unknown',
        browserInfo: await this.getBrowserInfo(page)
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Collect metrics even on failure
      try {
        metrics = await this.collectPageMetrics(page);
      } catch (metricsError) {
        console.warn('Failed to collect metrics on test failure:', metricsError);
      }
      
      // Take failure screenshot
      const screenshot = await this.takeTestScreenshot(page, testDef.name, 'failure');
      if (screenshot) screenshots.push(screenshot);
      
      return {
        name: testDef.name,
        status: 'failed',
        duration,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        error: error as Error,
        screenshots,
        metrics,
        category: testDef.category,
        phase: testDef.phase || 'unknown',
        browserInfo: await this.getBrowserInfo(page)
      };
    }
  }

  /**
   * Set up test page with required configuration
   */
  private async setupTestPage(page: Page, requirements: TestRequirements): Promise<void> {
    // Set viewport if specified
    if (requirements.viewport) {
      await page.setViewportSize(requirements.viewport);
    }

    // Set up console logging
    page.on('console', msg => {
      console.log(`[${requirements.browser}] ${msg.text()}`);
    });

    // Set up error handling
    page.on('pageerror', error => {
      console.error(`[${requirements.browser}] Page error:`, error);
    });

    // Set up network monitoring if needed
    if (requirements.monitorNetwork) {
      page.on('response', response => {
        if (response.status() >= 400) {
          console.warn(`[${requirements.browser}] HTTP ${response.status()}: ${response.url()}`);
        }
      });
    }
  }

  /**
   * Execute performance tests sequentially
   */
  private async executeSequentialTests(tests: TestDefinition[]): Promise<PhaseResults> {
    const results: TestResult[] = [];
    const startTime = Date.now();
    
    console.log(`  Starting ${tests.length} performance tests sequentially`);
    
    for (const test of tests) {
      try {
        console.log(`    Running performance test: ${test.name}`);
        const result = await this.executeTest(test, 'performance');
        results.push(result);
      } catch (error) {
        console.error(`    ✗ Performance test failed: ${test.name}`, error);
        results.push(this.createFailedResult(error, test.name));
      }
    }

    const endTime = Date.now();
    
    return {
      phase: 'performance',
      total: tests.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      results,
      duration: endTime - startTime,
      startTime,
      endTime
    };
  }

  /**
   * Select optimal browser pool for test requirements
   */
  private selectOptimalBrowserPool(requirements: TestRequirements): BrowserPool | null {
    const availablePools = Array.from(this.browserPools.values())
      .filter(pool => pool.isAvailable() && pool.supportsBrowser(requirements.browser));

    if (availablePools.length === 0) {
      return null;
    }

    // Select pool with least active tests and within resource limits
    return availablePools.reduce((optimal, current) => {
      const currentLoad = current.getActiveCount();
      const optimalLoad = optimal.getActiveCount();
      
      const currentMemory = this.resourceMonitor.getPoolMemoryUsage(current.name);
      const optimalMemory = this.resourceMonitor.getPoolMemoryUsage(optimal.name);
      
      // Prefer pool with lower load and memory usage
      if (currentLoad < optimalLoad) return current;
      if (currentLoad === optimalLoad && currentMemory < optimalMemory) return current;
      
      return optimal;
    });
  }

  /**
   * Create a failed test result
   */
  private createFailedResult(error: any, testName?: string): TestResult {
    return {
      name: testName || 'unknown',
      status: 'failed',
      duration: 0,
      startTime: new Date(),
      endTime: new Date(),
      error: error instanceof Error ? error : new Error(String(error)),
      screenshots: [],
      metrics: {},
      category: 'unknown',
      phase: 'unknown',
      browserInfo: { name: 'unknown', version: 'unknown' }
    };
  }

  /**
   * Take screenshot for test result
   */
  private async takeTestScreenshot(page: Page, testName: string, type: 'success' | 'failure'): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${testName}-${type}-${timestamp}.png`;
      const filepath = `tests/e2e/permission-management/reports/screenshots/${filename}`;
      
      await page.screenshot({ 
        path: filepath,
        fullPage: true 
      });
      
      return filename;
    } catch (error) {
      console.warn('Failed to take screenshot:', error);
      return null;
    }
  }

  /**
   * Collect page performance metrics
   */
  private async collectPageMetrics(page: Page): Promise<any> {
    try {
      return await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const memory = (performance as any).memory;
        
        return {
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          responseTime: navigation ? navigation.responseEnd - navigation.requestStart : 0,
          memoryUsage: memory ? memory.usedJSHeapSize : 0,
          totalMemory: memory ? memory.totalJSHeapSize : 0
        };
      });
    } catch (error) {
      return {};
    }
  }

  /**
   * Get browser information
   */
  private async getBrowserInfo(page: Page): Promise<{ name: string; version: string }> {
    try {
      const userAgent = await page.evaluate(() => navigator.userAgent);
      const browserName = userAgent.includes('Chrome') ? 'Chrome' : 
                         userAgent.includes('Firefox') ? 'Firefox' : 
                         userAgent.includes('Safari') ? 'Safari' : 'Unknown';
      
      return { name: browserName, version: 'unknown' };
    } catch (error) {
      return { name: 'unknown', version: 'unknown' };
    }
  }

  /**
   * Calculate test suite summary
   */
  private calculateSummary(module: PhaseResults, integration: PhaseResults, performance: PhaseResults): TestSummary {
    const totalTests = module.total + integration.total + performance.total;
    const totalPassed = module.passed + integration.passed + performance.passed;
    const totalFailed = module.failed + integration.failed + performance.failed;
    const totalSkipped = module.skipped + integration.skipped + performance.skipped;

    return {
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      passRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0,
      phases: { module, integration, performance }
    };
  }

  /**
   * Get current active tests
   */
  getActiveTests(): TestExecution[] {
    return Array.from(this.activeTests.values());
  }

  /**
   * Get resource usage information
   */
  getResourceUsage(): ResourceUsage {
    return this.resourceMonitor.getCurrentUsage();
  }

  /**
   * Clean up all browser pools and resources
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up browser pools and resources...');
    
    // Clean up all browser pools
    const cleanupPromises = Array.from(this.browserPools.values()).map(pool => pool.cleanup());
    await Promise.allSettled(cleanupPromises);
    
    this.browserPools.clear();
    this.activeTests.clear();
    
    console.log('✓ Cleanup completed');
  }
}

// Supporting classes
class BrowserPool {
  private browsers: Browser[] = [];
  private availableContexts: BrowserContext[] = [];
  private activeContexts: Set<BrowserContext> = new Set();

  constructor(public name: string, private config: any) {}

  async initialize(): Promise<void> {
    const browserType = this.config.browsers[0];
    let browserEngine;

    switch (browserType) {
      case 'chromium':
        browserEngine = chromium;
        break;
      case 'firefox':
        browserEngine = firefox;
        break;
      case 'webkit':
        browserEngine = webkit;
        break;
      default:
        throw new Error(`Unsupported browser type: ${browserType}`);
    }

    for (let i = 0; i < this.config.maxInstances; i++) {
      const browser = await browserEngine.launch({
        headless: this.config.headless,
        timeout: this.config.timeout
      });
      this.browsers.push(browser);
    }
  }

  async acquireContext(): Promise<BrowserContext> {
    if (this.availableContexts.length > 0) {
      const context = this.availableContexts.pop()!;
      this.activeContexts.add(context);
      return context;
    }

    // Create new context if under limit
    if (this.activeContexts.size < this.config.maxInstances) {
      const browser = this.browsers[0]; // Use first available browser
      const context = await browser.newContext({
        viewport: this.config.viewport,
        permissions: this.config.permissions,
        locale: this.config.locale,
        timezoneId: this.config.timezone
      });
      
      this.activeContexts.add(context);
      return context;
    }

    throw new Error(`No available contexts in pool ${this.name}`);
  }

  async releaseContext(context: BrowserContext): Promise<void> {
    this.activeContexts.delete(context);
    this.availableContexts.push(context);
  }

  isAvailable(): boolean {
    return this.activeContexts.size < this.config.maxInstances;
  }

  supportsBrowser(browser: string): boolean {
    return this.config.browsers.includes(browser);
  }

  getActiveCount(): number {
    return this.activeContexts.size;
  }

  async cleanup(): Promise<void> {
    // Close all contexts
    const contextClosePromises = [
      ...Array.from(this.activeContexts),
      ...this.availableContexts
    ].map(context => context.close().catch(e => console.warn('Context close error:', e)));
    
    await Promise.allSettled(contextClosePromises);
    
    // Close all browsers
    const browserClosePromises = this.browsers.map(browser => 
      browser.close().catch(e => console.warn('Browser close error:', e))
    );
    
    await Promise.allSettled(browserClosePromises);
    
    this.browsers = [];
    this.availableContexts = [];
    this.activeContexts.clear();
  }
}

class ResourceMonitor {
  private usageHistory: ResourceUsage[] = [];
  private poolUsage: Map<string, PoolResourceUsage> = new Map();

  getCurrentUsage(): ResourceUsage {
    const usage: ResourceUsage = {
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
      activeTests: 0,
      timestamp: new Date()
    };

    this.usageHistory.push(usage);
    
    // Keep only last 100 entries
    if (this.usageHistory.length > 100) {
      this.usageHistory = this.usageHistory.slice(-100);
    }

    return usage;
  }

  getPoolMemoryUsage(poolName: string): number {
    return this.poolUsage.get(poolName)?.memory || 0;
  }

  getUsageSummary(): ResourceUsageSummary {
    if (this.usageHistory.length === 0) {
      return { peak: this.getCurrentUsage(), average: this.getCurrentUsage(), current: this.getCurrentUsage() };
    }

    const current = this.usageHistory[this.usageHistory.length - 1];
    const peak = this.usageHistory.reduce((max, usage) => 
      usage.memory > max.memory ? usage : max, this.usageHistory[0]);
    
    const avgMemory = this.usageHistory.reduce((sum, usage) => sum + usage.memory, 0) / this.usageHistory.length;
    const avgCpu = this.usageHistory.reduce((sum, usage) => sum + usage.cpu, 0) / this.usageHistory.length;

    const average: ResourceUsage = {
      cpu: avgCpu,
      memory: avgMemory,
      activeTests: current.activeTests,
      timestamp: current.timestamp
    };

    return { peak, average, current };
  }
}

class ExecutionMetrics {
  private startTime: number = 0;
  private endTime: number = 0;
  private suiteMetrics: Map<string, any> = new Map();

  startSuite(suiteName: string): void {
    this.startTime = Date.now();
    this.suiteMetrics.set(suiteName, { startTime: this.startTime });
  }

  endSuite(): void {
    this.endTime = Date.now();
  }

  getMetrics(): ExecutionMetricsData {
    return {
      totalExecutionTime: this.endTime - this.startTime,
      averageTestTime: 0, // Would be calculated from individual tests
      resourceEfficiency: 0, // Would be calculated from resource usage
      parallelEfficiency: 0 // Would be calculated from parallel execution data
    };
  }
}

// Type definitions
export interface TestDefinition {
  name: string;
  category: string;
  phase?: string;
  requirements: TestRequirements;
  testFunction: (page: Page) => Promise<void>;
  timeout?: number;
  retries?: number;
}

export interface TestRequirements {
  browser: string;
  viewport?: { width: number; height: number };
  permissions?: string[];
  monitorNetwork?: boolean;
}

export interface ParallelTestSuite {
  id?: string;
  name: string;
  moduleTests: TestDefinition[];
  integrationTests: TestDefinition[];
  performanceTests: TestDefinition[];
}

export interface TestExecution {
  id: string;
  definition: TestDefinition;
  phase: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed';
  browserPool: string;
  result?: TestResult;
  error?: Error;
  retries: number;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: Error;
  screenshots: string[];
  metrics: any;
  category: string;
  phase: string;
  browserInfo: { name: string; version: string };
}

export interface PhaseResults {
  phase: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
  duration: number;
  startTime: number;
  endTime: number;
}

export interface TestResults {
  suiteId: string;
  suiteName: string;
  startTime: number;
  endTime: number;
  totalTime: number;
  moduleResults: PhaseResults;
  integrationResults: PhaseResults;
  performanceResults: PhaseResults;
  summary: TestSummary;
  metrics: ExecutionMetricsData;
  resourceUsage: ResourceUsageSummary;
}

export interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  phases: {
    module: PhaseResults;
    integration: PhaseResults;
    performance: PhaseResults;
  };
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  activeTests: number;
  timestamp: Date;
}

export interface ResourceUsageSummary {
  peak: ResourceUsage;
  average: ResourceUsage;
  current: ResourceUsage;
}

export interface PoolResourceUsage {
  memory: number;
  cpu: number;
  activeContexts: number;
}

export interface ExecutionMetricsData {
  totalExecutionTime: number;
  averageTestTime: number;
  resourceEfficiency: number;
  parallelEfficiency: number;
}

export default ParallelCoordinator;