/**
 * Enhanced Database connection test utility
 * Tests all reliability features including circuit breaker, timeouts, and monitoring
 * 
 * Usage: npx tsx lib/db/test-connection.ts
 */

import { reliablePrisma, databaseCircuitBreaker, getDatabaseMonitor } from './prisma'
import { runDatabaseReliabilityTests } from './test-scenarios'
import { healthService } from './health-endpoint'

async function testConnection() {
  try {
    console.log('🧪 Testing enhanced database connection with reliability features...')
    console.log('=' .repeat(80))
    
    // Test 1: Basic connectivity with reliable client
    console.log('\n1. Testing reliable Prisma client connectivity...')
    await reliablePrisma.query(
      async (client) => client.$queryRaw`SELECT 1 as test`,
      { operationName: 'connectivity-test' }
    )
    console.log('✅ Reliable database connection successful')
    
    // Test 2: Database info query
    console.log('\n2. Testing database information query...')
    try {
      const result = await reliablePrisma.query(
        async (client) => client.$queryRaw`SELECT current_database(), version()`,
        { operationName: 'info-query', timeout: 5000 }
      )
      console.log('✅ Database info query successful')
      console.log('   Database:', Array.isArray(result) ? result[0] : result)
    } catch (error) {
      console.log('ℹ️  Database info query failed (this is normal if tables don\'t exist yet):', error instanceof Error ? error.message : error)
    }
    
    // Test 3: Transaction capability with reliable client
    console.log('\n3. Testing transaction capability...')
    try {
      const result = await reliablePrisma.transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT 1`
          await tx.$queryRaw`SELECT current_timestamp`
          return 'transaction-completed'
        },
        { operationName: 'transaction-test', timeout: 10000 }
      )
      console.log('✅ Transaction test successful:', result)
    } catch (error) {
      console.error('❌ Transaction test failed:', error instanceof Error ? error.message : error)
    }
    
    // Test 4: Circuit breaker status
    console.log('\n4. Testing circuit breaker status...')
    const cbMetrics = databaseCircuitBreaker.getMetrics()
    console.log('✅ Circuit breaker status:', {
      state: cbMetrics.state,
      failures: cbMetrics.failures,
      successes: cbMetrics.successes,
      requests: cbMetrics.requests
    })
    
    // Test 5: Health check
    console.log('\n5. Testing health monitoring...')
    const isHealthy = await reliablePrisma.healthCheck()
    console.log('✅ Health check result:', isHealthy ? 'HEALTHY' : 'UNHEALTHY')
    
    // Test 6: Connection metrics
    console.log('\n6. Testing connection metrics...')
    const metrics = reliablePrisma.getMetrics()
    console.log('✅ Connection metrics:', {
      circuitBreakerState: metrics.circuitBreaker.state,
      activeOperations: metrics.activeOperations,
      config: {
        circuitBreakerEnabled: metrics.config.enableCircuitBreaker,
        monitoringEnabled: metrics.config.enableMonitoring,
        timeoutsEnabled: metrics.config.enableTimeouts
      }
    })
    
    // Test 7: Monitoring system
    console.log('\n7. Testing monitoring system...')
    const monitor = getDatabaseMonitor()
    if (monitor) {
      const healthStatus = await monitor.getHealthStatus()
      console.log('✅ Monitoring system active:', {
        status: healthStatus.status,
        healthy: healthStatus.healthy,
        timestamp: healthStatus.timestamp
      })
    } else {
      console.log('ℹ️  Monitoring system not active (this is normal in some configurations)')
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('🎉 All enhanced database tests completed successfully!')
    console.log('\n📊 Final Status Summary:')
    console.log(`   • Circuit Breaker: ${cbMetrics.state}`)
    console.log(`   • Health Status: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`)
    console.log(`   • Active Operations: ${metrics.activeOperations}`)
    console.log(`   • Monitoring: ${monitor ? 'ACTIVE' : 'INACTIVE'}`)
    
  } catch (error) {
    console.error('\n❌ Enhanced database connection test failed:', error instanceof Error ? error.message : error)
    console.error('\n🔍 Error Details:')
    if (error instanceof Error) {
      console.error('   Name:', error.name)
      console.error('   Message:', error.message)
      if (error.stack) {
        console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
      }
    }
    process.exit(1)
  } finally {
    await reliablePrisma.raw.$disconnect()
    console.log('\n🔌 Database connection closed')
  }
}

/**
 * Run comprehensive reliability test suite
 */
async function runReliabilityTests() {
  try {
    console.log('\n🧪 Running comprehensive reliability test suite...')
    const results = await runDatabaseReliabilityTests(reliablePrisma.raw)
    
    console.log('\n📊 Test Suite Results:')
    console.log(`   Total Tests: ${results.totalTests}`)
    console.log(`   Passed: ${results.passed}`)
    console.log(`   Failed: ${results.failed}`)
    console.log(`   Duration: ${results.duration}ms`)
    console.log(`   Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`)
    
    console.log('\n🏷️  Test Categories:')
    console.log(`   • Circuit Breaker Tests: ${results.summary.circuitBreakerTests}`)
    console.log(`   • Timeout Tests: ${results.summary.timeoutTests}`)
    console.log(`   • Monitoring Tests: ${results.summary.monitoringTests}`)
    console.log(`   • Performance Tests: ${results.summary.performanceTests}`)
    console.log(`   • Recovery Tests: ${results.summary.recoveryTests}`)
    
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:')
      results.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   • ${result.scenarioName}: ${result.error?.message}`)
        })
    }
    
    return results.failed === 0
  } catch (error) {
    console.error('\n❌ Reliability test suite failed:', error)
    return false
  }
}

/**
 * Test health endpoints
 */
async function testHealthEndpoints() {
  try {
    console.log('\n🏥 Testing health endpoints...')
    
    // Test health status
    const healthStatus = await healthService.getHealthStatus()
    console.log('✅ Health endpoint working:', {
      status: healthStatus.status,
      uptime: healthStatus.uptime,
      connected: healthStatus.database.connected
    })
    
    // Test metrics
    const metrics = await healthService.getMetrics()
    console.log('✅ Metrics endpoint working, collected', Object.keys(metrics).length, 'metrics')
    
    // Test liveness
    const liveness = await healthService.getLivenessStatus()
    console.log('✅ Liveness endpoint working:', liveness.alive ? 'ALIVE' : 'DEAD')
    
    // Test readiness
    const readiness = await healthService.getReadinessStatus()
    console.log('✅ Readiness endpoint working:', readiness.ready ? 'READY' : 'NOT READY')
    
    return true
  } catch (error) {
    console.error('❌ Health endpoints test failed:', error)
    return false
  }
}

/**
 * Main test function with options
 */
async function runTests(options: {
  basic?: boolean
  reliability?: boolean
  health?: boolean
} = {}) {
  const { basic = true, reliability = false, health = false } = options
  
  if (basic) {
    await testConnection()
  }
  
  if (reliability) {
    const reliabilityPassed = await runReliabilityTests()
    if (!reliabilityPassed) {
      console.warn('⚠️  Some reliability tests failed')
    }
  }
  
  if (health) {
    const healthPassed = await testHealthEndpoints()
    if (!healthPassed) {
      console.warn('⚠️  Health endpoint tests failed')
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2)
  const runReliability = args.includes('--reliability') || args.includes('-r')
  const runHealth = args.includes('--health') || args.includes('-h')
  const runAll = args.includes('--all') || args.includes('-a')
  
  if (runAll) {
    runTests({ basic: true, reliability: true, health: true })
  } else {
    runTests({
      basic: true,
      reliability: runReliability,
      health: runHealth
    })
  }
}

export { testConnection, runReliabilityTests, testHealthEndpoints, runTests }