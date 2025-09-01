import { PrismaClient } from '../../generated/client'
import { databaseCircuitBreaker, CircuitState } from './circuit-breaker'
import { createDatabaseMonitor, getDatabaseMonitor } from './connection-monitor'
import { databaseTimeoutHandler, TimeoutUtils } from './timeout-handler'

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
  // eslint-disable-next-line no-var
  var prismaInitialized: boolean
}

// Database configuration from environment
const DB_CONFIG = {
  url: process.env.DATABASE_URL,
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '10'), // seconds
  
  // Reliability settings
  enableCircuitBreaker: process.env.DB_CIRCUIT_BREAKER !== 'false',
  enableMonitoring: process.env.DB_MONITORING !== 'false',
  enableTimeouts: process.env.DB_TIMEOUTS !== 'false',
  
  // Circuit breaker configuration
  circuitBreakerFailureThreshold: parseInt(process.env.DB_CB_FAILURE_THRESHOLD || '5'),
  circuitBreakerTimeout: parseInt(process.env.DB_CB_TIMEOUT || '60000'), // ms
  
  // Monitoring configuration
  healthCheckInterval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000'), // ms
  alertWebhookUrl: process.env.DB_ALERT_WEBHOOK_URL,
}

let prisma: PrismaClient

// Enhanced Prisma client creation with reliability features
function createPrismaClient(): PrismaClient {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  // Build connection URL with pool settings
  const connectionUrl = DB_CONFIG.url ? 
    `${DB_CONFIG.url}?connection_limit=${DB_CONFIG.connectionLimit}&pool_timeout=${DB_CONFIG.poolTimeout}` :
    undefined
  
  const client = new PrismaClient({
    log: isDevelopment 
      ? ['query', 'error', 'warn', 'info']
      : ['error', 'warn'],
    datasourceUrl: connectionUrl,
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  })
  
  // Add query logging middleware for performance tracking
  if (DB_CONFIG.enableMonitoring) {
    client.$use(async (params, next) => {
      const startTime = Date.now()
      
      try {
        const result = await next(params)
        const duration = Date.now() - startTime
        
        // Record successful query
        const monitor = getDatabaseMonitor()
        if (monitor) {
          monitor.recordQueryTime(duration)
          monitor.recordQueryResult(true)
        }
        
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        
        // Record failed query
        const monitor = getDatabaseMonitor()
        if (monitor) {
          monitor.recordQueryTime(duration)
          monitor.recordQueryResult(false)
        }
        
        throw error
      }
    })
  }
  
  return client
}

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  // In development, use a global variable so the connection is cached across hot reloads
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient()
    global.prismaInitialized = false
  }
  prisma = global.cachedPrisma
}

// Enhanced connection initialization with reliability features
async function initializePrismaConnection() {
  if (global.prismaInitialized) {
    return // Already initialized
  }
  
  try {
    // Initialize circuit breaker if enabled
    if (DB_CONFIG.enableCircuitBreaker) {
      console.log('🛡️  Database circuit breaker enabled')
    }
    
    // Connect with timeout and circuit breaker protection
    if (DB_CONFIG.enableCircuitBreaker) {
      await databaseCircuitBreaker.execute(
        () => prisma.$connect(),
        'prisma-connect'
      )
    } else {
      await prisma.$connect()
    }
    
    console.log('✅ Database connected successfully')
    
    // Initialize monitoring if enabled
    if (DB_CONFIG.enableMonitoring) {
      const monitor = createDatabaseMonitor(prisma, {
        enabled: true,
        webhookUrl: DB_CONFIG.alertWebhookUrl,
        thresholds: {
          healthScore: 70,
          poolUtilization: 80,
          queryTime: 1000,
          errorRate: 5,
          connectionTimeouts: 3
        }
      })
      
      // Start monitoring
      monitor.startMonitoring(DB_CONFIG.healthCheckInterval)
      console.log('📊 Database monitoring enabled')
    }
    
    // Perform initial health check
    await performInitialHealthCheck()
    
    global.prismaInitialized = true
    
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error)
    
    // In production, exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Database connection failed in production, exiting...')
      process.exit(1)
    } else {
      // In development, log error but continue
      console.warn('⚠️  Database connection failed in development, continuing...')
    }
  }
}

// Perform initial health check
async function performInitialHealthCheck() {
  try {
    if (DB_CONFIG.enableTimeouts) {
      const result = await databaseTimeoutHandler.executeQuery(
        prisma,
        (client) => client.$queryRaw`SELECT 1 as health_check`,
        TimeoutUtils.healthCheck()
      )
      
      if (result.success) {
        console.log('✅ Initial health check passed')
      } else {
        console.warn('⚠️  Initial health check failed:', result.error?.message)
      }
    } else {
      await prisma.$queryRaw`SELECT 1 as health_check`
      console.log('✅ Initial health check passed')
    }
  } catch (error) {
    console.warn('⚠️  Initial health check failed:', error instanceof Error ? error.message : error)
  }
}

// Initialize connection (async, non-blocking)
initializePrismaConnection().catch(console.error)

// Enhanced graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('🔄 Shutting down database connections...')
  
  try {
    // Stop monitoring if running
    const monitor = getDatabaseMonitor()
    if (monitor) {
      monitor.stopMonitoring()
      console.log('📊 Database monitoring stopped')
    }
    
    // Cancel any active operations
    const cancelledOperations = databaseTimeoutHandler.cancelAllOperations()
    if (cancelledOperations > 0) {
      console.log(`⏹️  Cancelled ${cancelledOperations} active database operations`)
    }
    
    // Reset circuit breaker
    if (DB_CONFIG.enableCircuitBreaker) {
      databaseCircuitBreaker.reset()
      console.log('🛡️  Circuit breaker reset')
    }
    
    // Disconnect Prisma client
    await prisma.$disconnect()
    console.log('✅ Database connections closed successfully')
    
    // Reset initialization flag for development
    if (process.env.NODE_ENV !== 'production') {
      global.prismaInitialized = false
    }
    
  } catch (error) {
    console.error('❌ Error during database shutdown:', error)
  }
}

// Handle various shutdown signals
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('beforeExit', gracefulShutdown)

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error)
  await gracefulShutdown()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
  await gracefulShutdown()
  process.exit(1)
})

// Enhanced Prisma client with reliability wrapper
export class ReliablePrismaClient {
  private client: PrismaClient
  
  constructor(client: PrismaClient) {
    this.client = client
  }
  
  // Wrapped query execution with reliability features
  async query<T>(queryFn: (client: PrismaClient) => Promise<T>, options?: {
    operationName?: string
    tableName?: string
    timeout?: number
    useCircuitBreaker?: boolean
  }): Promise<T> {
    const { 
      operationName = 'query', 
      tableName, 
      timeout, 
      useCircuitBreaker = DB_CONFIG.enableCircuitBreaker 
    } = options || {}
    
    const operation = async () => {
      if (DB_CONFIG.enableTimeouts) {
        const result = await databaseTimeoutHandler.executeQuery(
          this.client,
          queryFn,
          { operationName, tableName },
          timeout
        )
        
        if (!result.success) {
          throw result.error
        }
        
        return result.result!
      } else {
        return queryFn(this.client)
      }
    }
    
    if (useCircuitBreaker) {
      return databaseCircuitBreaker.execute(operation, operationName)
    } else {
      return operation()
    }
  }
  
  // Wrapped transaction execution
  async transaction<T>(transactionFn: (client: PrismaClient) => Promise<T>, options?: {
    operationName?: string
    timeout?: number
    useCircuitBreaker?: boolean
  }): Promise<T> {
    const { 
      operationName = 'transaction', 
      timeout, 
      useCircuitBreaker = DB_CONFIG.enableCircuitBreaker 
    } = options || {}
    
    const operation = async () => {
      if (DB_CONFIG.enableTimeouts) {
        const result = await databaseTimeoutHandler.executeTransaction(
          this.client,
          transactionFn,
          { operationName },
          timeout
        )
        
        if (!result.success) {
          throw result.error
        }
        
        return result.result!
      } else {
        return this.client.$transaction(transactionFn)
      }
    }
    
    if (useCircuitBreaker) {
      return databaseCircuitBreaker.execute(operation, operationName)
    } else {
      return operation()
    }
  }
  
  // Direct access to Prisma client for advanced use cases
  get raw(): PrismaClient {
    return this.client
  }
  
  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const monitor = getDatabaseMonitor()
      if (monitor) {
        const status = await monitor.getHealthStatus()
        return status.healthy
      } else {
        await this.client.$queryRaw`SELECT 1`
        return true
      }
    } catch {
      return false
    }
  }
  
  // Get connection metrics
  getMetrics() {
    const monitor = getDatabaseMonitor()
    const circuitBreakerMetrics = databaseCircuitBreaker.getMetrics()
    
    return {
      connectionPool: monitor?.getMetrics(),
      circuitBreaker: circuitBreakerMetrics,
      activeOperations: databaseTimeoutHandler.getActiveOperationCount(),
      config: DB_CONFIG
    }
  }
}

// Create reliable client instance
const reliablePrisma = new ReliablePrismaClient(prisma)

// Export both raw and reliable clients
export { prisma, reliablePrisma }
export default reliablePrisma

// Export reliability utilities
export { databaseCircuitBreaker, getDatabaseMonitor, databaseTimeoutHandler, TimeoutUtils }
export { CircuitState } from './circuit-breaker'

// Export types for use throughout the application
export type { PrismaClient } from '../../generated/client'
export type { CircuitBreakerMetrics } from './circuit-breaker'
export type { ConnectionPoolMetrics, HealthCheckResult } from './connection-monitor'
export type { TimeoutResult, OperationContext } from './timeout-handler'