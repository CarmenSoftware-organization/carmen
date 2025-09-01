/**
 * Comprehensive Database Connection Testing Utilities
 * Tests various failure scenarios, recovery patterns, and performance benchmarks
 */

import { PrismaClient } from '../../generated/client'
import { 
  databaseCircuitBreaker, 
  DatabaseCircuitBreakerError, 
  DatabaseRetryError, 
  DatabaseTimeoutError,
  CircuitState 
} from './circuit-breaker'
import { 
  createDatabaseMonitor, 
  DatabaseConnectionMonitor,
  HealthCheckResult 
} from './connection-monitor'
import { 
  databaseTimeoutHandler, 
  DatabaseTimeoutHandler,
  TimeoutUtils 
} from './timeout-handler'
import { ReliablePrismaClient } from './prisma'

export interface TestScenarioResult {
  scenarioName: string
  success: boolean
  duration: number
  error?: Error
  metrics?: any
  details: any
}

export interface TestSuiteResult {
  totalTests: number
  passed: number
  failed: number
  duration: number
  results: TestScenarioResult[]
  summary: {
    circuitBreakerTests: number
    timeoutTests: number
    monitoringTests: number
    performanceTests: number
    recoveryTests: number
  }
}

export class DatabaseTestSuite {
  private prisma: PrismaClient
  private reliablePrisma: ReliablePrismaClient
  private monitor: DatabaseConnectionMonitor
  private testDb: string
  
  constructor(prisma: PrismaClient, testDb: string = 'carmen_test') {
    this.prisma = prisma
    this.reliablePrisma = new ReliablePrismaClient(prisma)
    this.testDb = testDb
    this.monitor = createDatabaseMonitor(prisma, {
      enabled: true,
      thresholds: {
        healthScore: 50, // Lower threshold for testing
        poolUtilization: 90,
        queryTime: 5000, // Higher threshold for testing
        errorRate: 10,
        connectionTimeouts: 5
      }
    })
  }

  /**
   * Run comprehensive test suite
   */
  async runFullTestSuite(): Promise<TestSuiteResult> {
    const startTime = Date.now()
    const results: TestScenarioResult[] = []
    
    console.log('🧪 Starting comprehensive database reliability test suite...')
    
    // Circuit breaker tests
    console.log('\n🛡️  Running circuit breaker tests...')
    results.push(...await this.runCircuitBreakerTests())
    
    // Timeout tests
    console.log('\n⏱️  Running timeout tests...')
    results.push(...await this.runTimeoutTests())
    
    // Monitoring tests
    console.log('\n📊 Running monitoring tests...')
    results.push(...await this.runMonitoringTests())
    
    // Performance tests
    console.log('\n⚡ Running performance tests...')
    results.push(...await this.runPerformanceTests())
    
    // Recovery tests
    console.log('\n🔄 Running recovery tests...')
    results.push(...await this.runRecoveryTests())
    
    const duration = Date.now() - startTime
    const passed = results.filter(r => r.success).length
    const failed = results.length - passed
    
    const summary = {
      circuitBreakerTests: results.filter(r => r.scenarioName.includes('Circuit')).length,
      timeoutTests: results.filter(r => r.scenarioName.includes('Timeout')).length,
      monitoringTests: results.filter(r => r.scenarioName.includes('Monitor')).length,
      performanceTests: results.filter(r => r.scenarioName.includes('Performance')).length,
      recoveryTests: results.filter(r => r.scenarioName.includes('Recovery')).length
    }
    
    console.log(`\n✅ Test suite completed: ${passed}/${results.length} tests passed (${duration}ms)`)
    
    return {
      totalTests: results.length,
      passed,
      failed,
      duration,
      results,
      summary
    }
  }

  /**
   * Circuit breaker test scenarios
   */
  private async runCircuitBreakerTests(): Promise<TestScenarioResult[]> {
    const tests: TestScenarioResult[] = []
    
    // Test 1: Circuit breaker remains closed with successful operations
    tests.push(await this.runTest('Circuit Breaker - Normal Operation', async () => {
      // Reset circuit breaker
      databaseCircuitBreaker.reset()
      
      // Execute successful operations
      for (let i = 0; i < 3; i++) {
        await databaseCircuitBreaker.execute(
          async () => this.prisma.$queryRaw`SELECT 1`,
          'test-success'
        )
      }
      
      const metrics = databaseCircuitBreaker.getMetrics()
      if (metrics.state !== CircuitState.CLOSED) {
        throw new Error(`Expected CLOSED state, got ${metrics.state}`)
      }
      
      return { state: metrics.state, requests: metrics.requests }
    }))

    // Test 2: Circuit breaker opens after threshold failures
    tests.push(await this.runTest('Circuit Breaker - Failure Threshold', async () => {
      // Reset circuit breaker
      databaseCircuitBreaker.reset()
      
      // Generate failures to trigger circuit breaker
      let failures = 0
      for (let i = 0; i < 6; i++) { // Exceeds default threshold of 5
        try {
          await databaseCircuitBreaker.execute(
            async () => { throw new Error('Test failure') },
            'test-failure'
          )
        } catch (error) {
          failures++
        }
      }
      
      const metrics = databaseCircuitBreaker.getMetrics()
      if (metrics.state !== CircuitState.OPEN) {
        throw new Error(`Expected OPEN state, got ${metrics.state}`)
      }
      
      return { state: metrics.state, failures: failures }
    }))

    // Test 3: Circuit breaker blocks requests when open
    tests.push(await this.runTest('Circuit Breaker - Blocking When Open', async () => {
      // Ensure circuit is open
      databaseCircuitBreaker.forceState(CircuitState.OPEN)
      
      try {
        await databaseCircuitBreaker.execute(
          async () => this.prisma.$queryRaw`SELECT 1`,
          'test-blocked'
        )
        throw new Error('Expected operation to be blocked')
      } catch (error) {
        if (!(error instanceof DatabaseCircuitBreakerError)) {
          throw new Error(`Expected DatabaseCircuitBreakerError, got ${error.constructor.name}`)
        }
      }
      
      return { blocked: true }
    }))

    // Test 4: Circuit breaker recovery (half-open state)
    tests.push(await this.runTest('Circuit Breaker - Recovery', async () => {
      // Set to half-open state
      databaseCircuitBreaker.forceState(CircuitState.HALF_OPEN)
      
      // Execute successful operations to close circuit
      for (let i = 0; i < 3; i++) {
        await databaseCircuitBreaker.execute(
          async () => this.prisma.$queryRaw`SELECT 1`,
          'test-recovery'
        )
      }
      
      const metrics = databaseCircuitBreaker.getMetrics()
      if (metrics.state !== CircuitState.CLOSED) {
        throw new Error(`Expected CLOSED state after recovery, got ${metrics.state}`)
      }
      
      return { recovered: true, state: metrics.state }
    }))

    return tests
  }

  /**
   * Timeout test scenarios
   */
  private async runTimeoutTests(): Promise<TestScenarioResult[]> {
    const tests: TestScenarioResult[] = []
    
    // Test 1: Operation completes within timeout
    tests.push(await this.runTest('Timeout - Within Limit', async () => {
      const result = await databaseTimeoutHandler.executeQuery(
        this.prisma,
        async (client) => client.$queryRaw`SELECT pg_sleep(0.1)`, // 100ms
        TimeoutUtils.simpleQuery('fast-query'),
        5000 // 5 second timeout
      )
      
      if (!result.success) {
        throw new Error(`Expected success, got ${result.error?.message}`)
      }
      
      return { duration: result.duration, timedOut: result.timedOut }
    }))

    // Test 2: Operation timeout handling
    tests.push(await this.runTest('Timeout - Exceeds Limit', async () => {
      const result = await databaseTimeoutHandler.executeQuery(
        this.prisma,
        async (client) => client.$queryRaw`SELECT pg_sleep(2)`, // 2 seconds
        TimeoutUtils.simpleQuery('slow-query'),
        1000 // 1 second timeout
      )
      
      if (result.success) {
        throw new Error('Expected timeout failure')
      }
      
      if (!result.timedOut) {
        throw new Error('Expected timeout flag to be true')
      }
      
      return { timedOut: result.timedOut, error: result.error?.name }
    }))

    // Test 3: Transaction timeout
    tests.push(await this.runTest('Timeout - Transaction', async () => {
      const result = await databaseTimeoutHandler.executeTransaction(
        this.prisma,
        async (tx) => {
          await tx.$queryRaw`SELECT pg_sleep(0.5)`
          return 'completed'
        },
        TimeoutUtils.transaction('test-transaction'),
        2000 // 2 second timeout
      )
      
      if (!result.success) {
        throw new Error(`Transaction should have succeeded: ${result.error?.message}`)
      }
      
      return { duration: result.duration, result: result.result }
    }))

    // Test 4: Batch operation timeout adjustment
    tests.push(await this.runTest('Timeout - Batch Operation Scaling', async () => {
      const result = await databaseTimeoutHandler.executeBatchOperation(
        async () => this.prisma.$queryRaw`SELECT pg_sleep(0.5)`,
        'batchInsert',
        { recordCount: 1000 }, // Large record count should increase timeout
        1000 // Base timeout that should be scaled up
      )
      
      // Should succeed because timeout was scaled up for large batch
      if (!result.success) {
        throw new Error(`Batch operation should have succeeded: ${result.error?.message}`)
      }
      
      return { duration: result.duration, scaled: true }
    }))

    return tests
  }

  /**
   * Monitoring test scenarios
   */
  private async runMonitoringTests(): Promise<TestScenarioResult[]> {
    const tests: TestScenarioResult[] = []
    
    // Test 1: Health check functionality
    tests.push(await this.runTest('Monitor - Health Check', async () => {
      const healthResult = await this.monitor.performHealthCheck()
      
      if (!healthResult.checks.connectivity) {
        throw new Error('Basic connectivity check failed')
      }
      
      return {
        healthy: healthResult.healthy,
        score: healthResult.score,
        checks: healthResult.checks
      }
    }))

    // Test 2: Metrics collection
    tests.push(await this.runTest('Monitor - Metrics Collection', async () => {
      // Record some operations
      this.monitor.recordQueryTime(150)
      this.monitor.recordQueryTime(200)
      this.monitor.recordQueryResult(true)
      this.monitor.recordQueryResult(false)
      
      const metrics = this.monitor.getMetrics()
      
      if (metrics.avgQueryTime === 0) {
        throw new Error('Average query time should be recorded')
      }
      
      return {
        avgQueryTime: metrics.avgQueryTime,
        successfulQueries: metrics.successfulQueries,
        failedQueries: metrics.failedQueries
      }
    }))

    // Test 3: Health status endpoint
    tests.push(await this.runTest('Monitor - Health Status Endpoint', async () => {
      const status = await this.monitor.getHealthStatus()
      
      if (typeof status.healthy !== 'boolean') {
        throw new Error('Health status should return boolean')
      }
      
      return {
        status: status.status,
        healthy: status.healthy,
        timestamp: status.timestamp
      }
    }))

    return tests
  }

  /**
   * Performance test scenarios
   */
  private async runPerformanceTests(): Promise<TestScenarioResult[]> {
    const tests: TestScenarioResult[] = []
    
    // Test 1: Sequential vs Circuit Breaker Performance
    tests.push(await this.runTest('Performance - Circuit Breaker Overhead', async () => {
      const iterations = 100
      
      // Test without circuit breaker
      const startDirect = Date.now()
      for (let i = 0; i < iterations; i++) {
        await this.prisma.$queryRaw`SELECT 1`
      }
      const directTime = Date.now() - startDirect
      
      // Test with circuit breaker
      const startCircuit = Date.now()
      for (let i = 0; i < iterations; i++) {
        await databaseCircuitBreaker.execute(
          async () => this.prisma.$queryRaw`SELECT 1`,
          'perf-test'
        )
      }
      const circuitTime = Date.now() - startCircuit
      
      const overhead = ((circuitTime - directTime) / directTime) * 100
      
      // Overhead should be reasonable (< 50%)
      if (overhead > 50) {
        throw new Error(`Circuit breaker overhead too high: ${overhead}%`)
      }
      
      return {
        directTime,
        circuitTime,
        overhead: Math.round(overhead * 100) / 100
      }
    }))

    // Test 2: ReliablePrismaClient Performance
    tests.push(await this.runTest('Performance - Reliable Client', async () => {
      const iterations = 50
      
      const startTime = Date.now()
      for (let i = 0; i < iterations; i++) {
        await this.reliablePrisma.query(
          async (client) => client.$queryRaw`SELECT ${i} as iteration`,
          { operationName: 'perf-test', useCircuitBreaker: true }
        )
      }
      const duration = Date.now() - startTime
      const avgTime = duration / iterations
      
      // Average should be reasonable (< 100ms per operation in ideal conditions)
      if (avgTime > 500) { // More lenient for testing
        throw new Error(`Average operation time too high: ${avgTime}ms`)
      }
      
      return {
        iterations,
        totalTime: duration,
        averageTime: Math.round(avgTime * 100) / 100
      }
    }))

    return tests
  }

  /**
   * Recovery test scenarios
   */
  private async runRecoveryTests(): Promise<TestScenarioResult[]> {
    const tests: TestScenarioResult[] = []
    
    // Test 1: Automatic recovery after failures
    tests.push(await this.runTest('Recovery - Automatic Recovery', async () => {
      // Reset circuit breaker
      databaseCircuitBreaker.reset()
      
      // Simulate temporary failures
      let failureCount = 0
      for (let i = 0; i < 3; i++) {
        try {
          await databaseCircuitBreaker.execute(
            async () => { throw new Error('Temporary failure') },
            'recovery-test'
          )
        } catch {
          failureCount++
        }
      }
      
      // Now succeed
      await databaseCircuitBreaker.execute(
        async () => this.prisma.$queryRaw`SELECT 1`,
        'recovery-success'
      )
      
      const metrics = databaseCircuitBreaker.getMetrics()
      
      return {
        failureCount,
        finalState: metrics.state,
        recovered: metrics.state === CircuitState.CLOSED
      }
    }))

    // Test 2: Graceful degradation
    tests.push(await this.runTest('Recovery - Graceful Degradation', async () => {
      // Test that the system can handle partial failures
      let successCount = 0
      let failureCount = 0
      
      // Mix of success and failure operations
      const operations = [
        () => this.prisma.$queryRaw`SELECT 1`,
        () => { throw new Error('Simulated failure') },
        () => this.prisma.$queryRaw`SELECT 2`,
        () => this.prisma.$queryRaw`SELECT 3`,
        () => { throw new Error('Another failure') },
      ]
      
      for (const op of operations) {
        try {
          await this.reliablePrisma.query(op, { 
            operationName: 'degradation-test',
            useCircuitBreaker: false // Test without circuit breaker
          })
          successCount++
        } catch {
          failureCount++
        }
      }
      
      // Should have some successes despite failures
      if (successCount === 0) {
        throw new Error('No operations succeeded during degradation test')
      }
      
      return {
        successCount,
        failureCount,
        successRate: (successCount / (successCount + failureCount)) * 100
      }
    }))

    return tests
  }

  /**
   * Run individual test scenario
   */
  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestScenarioResult> {
    const startTime = Date.now()
    
    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      
      console.log(`  ✅ ${name} (${duration}ms)`)
      
      return {
        scenarioName: name,
        success: true,
        duration,
        details: result
      }
    } catch (error) {
      const duration = Date.now() - startTime
      
      console.log(`  ❌ ${name} (${duration}ms): ${error instanceof Error ? error.message : error}`)
      
      return {
        scenarioName: name,
        success: false,
        duration,
        error: error instanceof Error ? error : new Error(String(error)),
        details: {}
      }
    }
  }

  /**
   * Create test database tables
   */
  async setupTestEnvironment(): Promise<void> {
    try {
      // Create a simple test table for scenarios that need it
      await this.prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS test_reliability (
          id SERIAL PRIMARY KEY,
          data TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ Test environment setup completed')
    } catch (error) {
      console.warn('⚠️  Test environment setup failed:', error)
    }
  }

  /**
   * Clean up test environment
   */
  async cleanupTestEnvironment(): Promise<void> {
    try {
      await this.prisma.$executeRaw`DROP TABLE IF EXISTS test_reliability`
      console.log('✅ Test environment cleanup completed')
    } catch (error) {
      console.warn('⚠️  Test environment cleanup failed:', error)
    }
  }
}

/**
 * Utility function to run the test suite
 */
export async function runDatabaseReliabilityTests(prisma: PrismaClient): Promise<TestSuiteResult> {
  const testSuite = new DatabaseTestSuite(prisma)
  
  try {
    await testSuite.setupTestEnvironment()
    const results = await testSuite.runFullTestSuite()
    await testSuite.cleanupTestEnvironment()
    
    return results
  } catch (error) {
    console.error('❌ Test suite execution failed:', error)
    throw error
  }
}

/**
 * Load testing utility
 */
export class DatabaseLoadTester {
  constructor(private prisma: PrismaClient) {}

  async runLoadTest(config: {
    concurrentConnections: number
    operationsPerConnection: number
    operationType: 'read' | 'write' | 'mixed'
    duration?: number
  }): Promise<{
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    averageResponseTime: number
    operationsPerSecond: number
    errors: Array<{ error: string; count: number }>
  }> {
    const { concurrentConnections, operationsPerConnection, operationType } = config
    const startTime = Date.now()
    const results: Array<{ success: boolean; duration: number; error?: string }> = []
    const errors = new Map<string, number>()

    console.log(`🔥 Starting load test: ${concurrentConnections} connections, ${operationsPerConnection} ops each`)

    const connections = Array.from({ length: concurrentConnections }, (_, i) => 
      this.runConnectionLoad(i, operationsPerConnection, operationType, results, errors)
    )

    await Promise.all(connections)

    const endTime = Date.now()
    const totalDuration = endTime - startTime
    const successfulOps = results.filter(r => r.success).length
    const totalOps = results.length
    const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / totalOps
    const opsPerSecond = (totalOps / totalDuration) * 1000

    return {
      totalOperations: totalOps,
      successfulOperations: successfulOps,
      failedOperations: totalOps - successfulOps,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      operationsPerSecond: Math.round(opsPerSecond * 100) / 100,
      errors: Array.from(errors.entries()).map(([error, count]) => ({ error, count }))
    }
  }

  private async runConnectionLoad(
    connectionId: number,
    operationsCount: number,
    operationType: 'read' | 'write' | 'mixed',
    results: Array<{ success: boolean; duration: number; error?: string }>,
    errors: Map<string, number>
  ): Promise<void> {
    for (let i = 0; i < operationsCount; i++) {
      const opStart = Date.now()
      
      try {
        await this.performOperation(operationType, connectionId, i)
        results.push({ success: true, duration: Date.now() - opStart })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        results.push({ success: false, duration: Date.now() - opStart, error: errorMsg })
        errors.set(errorMsg, (errors.get(errorMsg) || 0) + 1)
      }
    }
  }

  private async performOperation(type: 'read' | 'write' | 'mixed', connectionId: number, opId: number): Promise<void> {
    switch (type) {
      case 'read':
        await this.prisma.$queryRaw`SELECT ${connectionId} as connection_id, ${opId} as operation_id, current_timestamp`
        break
      case 'write':
        await this.prisma.$executeRaw`INSERT INTO test_reliability (data) VALUES (${`load-test-${connectionId}-${opId}`})`
        break
      case 'mixed':
        if (Math.random() > 0.5) {
          await this.prisma.$queryRaw`SELECT ${connectionId}, ${opId}, current_timestamp`
        } else {
          await this.prisma.$executeRaw`INSERT INTO test_reliability (data) VALUES (${`mixed-test-${connectionId}-${opId}`})`
        }
        break
    }
  }
}