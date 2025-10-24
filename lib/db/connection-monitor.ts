/**
 * Database Connection Pool Monitoring and Health Checks
 * Provides real-time monitoring, alerting, and health status
 */

import type { PrismaClient } from '@/lib/db/prisma'
import { databaseCircuitBreaker, CircuitState } from './circuit-breaker'

export interface ConnectionPoolMetrics {
  // Connection statistics
  totalConnections: number
  activeConnections: number
  idleConnections: number
  busyConnections: number
  
  // Performance metrics
  avgQueryTime: number
  slowQueries: number
  failedQueries: number
  successfulQueries: number
  
  // Health indicators
  healthScore: number // 0-100
  status: 'healthy' | 'degraded' | 'unhealthy'
  lastHealthCheck: Date
  
  // Connection pool status
  poolUtilization: number // percentage
  connectionTimeouts: number
  connectionErrors: number
  
  // Circuit breaker status
  circuitBreakerState: CircuitState
  circuitBreakerFailures: number
}

export interface HealthCheckResult {
  healthy: boolean
  status: 'healthy' | 'degraded' | 'unhealthy'
  score: number
  timestamp: Date
  checks: {
    connectivity: boolean
    queryPerformance: boolean
    poolHealth: boolean
    circuitBreakerState: boolean
  }
  metrics: ConnectionPoolMetrics
  errors: string[]
  warnings: string[]
}

export interface AlertConfig {
  enabled: boolean
  webhookUrl?: string
  emailRecipients?: string[]
  thresholds: {
    healthScore: number
    poolUtilization: number
    queryTime: number
    errorRate: number
    connectionTimeouts: number
  }
}

export class DatabaseConnectionMonitor {
  private prisma: PrismaClient
  private metrics: ConnectionPoolMetrics
  private alertConfig: AlertConfig
  private monitoringInterval: NodeJS.Timeout | null = null
  private lastAlertTime = new Map<string, number>()
  private readonly alertCooldown = 300000 // 5 minutes

  // Performance tracking
  private queryTimes: number[] = []
  private readonly maxQueryTimesSamples = 100

  constructor(
    prisma: PrismaClient,
    alertConfig: Partial<AlertConfig> = {}
  ) {
    this.prisma = prisma
    this.alertConfig = {
      enabled: alertConfig.enabled ?? true,
      webhookUrl: alertConfig.webhookUrl,
      emailRecipients: alertConfig.emailRecipients,
      thresholds: {
        healthScore: alertConfig.thresholds?.healthScore ?? 70,
        poolUtilization: alertConfig.thresholds?.poolUtilization ?? 80,
        queryTime: alertConfig.thresholds?.queryTime ?? 1000,
        errorRate: alertConfig.thresholds?.errorRate ?? 5,
        connectionTimeouts: alertConfig.thresholds?.connectionTimeouts ?? 3,
        ...alertConfig.thresholds
      }
    }

    this.metrics = this.initializeMetrics()
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck()
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }, intervalMs)

    console.log(`Database connection monitoring started (interval: ${intervalMs}ms)`)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log('Database connection monitoring stopped')
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date()
    const checks = {
      connectivity: false,
      queryPerformance: false,
      poolHealth: false,
      circuitBreakerState: false
    }
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 1. Basic connectivity check
      const connectivityStart = Date.now()
      await this.prisma.$queryRaw`SELECT 1 as health_check`
      const connectivityTime = Date.now() - connectivityStart
      
      checks.connectivity = true
      this.recordQueryTime(connectivityTime)

      // 2. Query performance check
      const performanceStart = Date.now()
      await this.testQueryPerformance()
      const performanceTime = Date.now() - performanceStart
      
      if (performanceTime < this.alertConfig.thresholds.queryTime) {
        checks.queryPerformance = true
      } else {
        warnings.push(`Query performance degraded: ${performanceTime}ms`)
      }

      // 3. Pool health check
      try {
        const poolMetrics = await this.getPoolMetrics()
        this.updateMetrics(poolMetrics)

        if (poolMetrics.poolUtilization !== undefined && poolMetrics.poolUtilization < this.alertConfig.thresholds.poolUtilization) {
          checks.poolHealth = true
        } else if (poolMetrics.poolUtilization !== undefined) {
          warnings.push(`High pool utilization: ${poolMetrics.poolUtilization}%`)
        }
      } catch (error) {
        errors.push(`Pool metrics unavailable: ${error instanceof Error ? error.message : error}`)
      }

      // 4. Circuit breaker state check
      const cbMetrics = databaseCircuitBreaker.getMetrics()
      if (cbMetrics.state === CircuitState.CLOSED) {
        checks.circuitBreakerState = true
      } else {
        warnings.push(`Circuit breaker is ${cbMetrics.state}`)
      }

    } catch (error) {
      errors.push(`Connectivity check failed: ${error instanceof Error ? error.message : error}`)
    }

    // Calculate health score
    const score = this.calculateHealthScore(checks, warnings.length, errors.length)
    
    // Determine status
    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (errors.length > 0) {
      status = 'unhealthy'
    } else if (warnings.length > 0 || score < this.alertConfig.thresholds.healthScore) {
      status = 'degraded'
    } else {
      status = 'healthy'
    }

    // Update metrics
    this.metrics.healthScore = score
    this.metrics.status = status
    this.metrics.lastHealthCheck = timestamp

    const result: HealthCheckResult = {
      healthy: status === 'healthy',
      status,
      score,
      timestamp,
      checks,
      metrics: { ...this.metrics },
      errors,
      warnings
    }

    // Send alerts if needed
    if (this.alertConfig.enabled) {
      await this.checkAndSendAlerts(result)
    }

    return result
  }

  /**
   * Test query performance with various operations
   */
  private async testQueryPerformance(): Promise<void> {
    // Test basic query
    await this.prisma.$queryRaw`SELECT current_timestamp`
    
    // Test transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1`
    })
  }

  /**
   * Get connection pool metrics
   */
  private async getPoolMetrics(): Promise<Partial<ConnectionPoolMetrics>> {
    try {
      // Try to get Prisma metrics if available
      const metricsData = await (this.prisma as any).$metrics?.json()
      
      if (metricsData) {
        return this.parsePrismaMetrics(metricsData)
      }
    } catch (error) {
      // Metrics not available, estimate from connection tests
    }

    // Fallback to basic estimation
    return this.estimatePoolMetrics()
  }

  /**
   * Parse Prisma metrics data
   */
  private parsePrismaMetrics(metricsData: any): Partial<ConnectionPoolMetrics> {
    const counters = metricsData.counters || []
    const gauges = metricsData.gauges || []
    
    const getMetric = (key: string, type: 'counter' | 'gauge') => {
      const metrics = type === 'counter' ? counters : gauges
      const metric = metrics.find((m: any) => m.key === key)
      return metric?.value || 0
    }

    const totalConnections = getMetric('prisma_pool_connections_open', 'counter')
    const busyConnections = getMetric('prisma_pool_connections_busy', 'gauge')
    const idleConnections = getMetric('prisma_pool_connections_idle', 'gauge')
    
    return {
      totalConnections,
      busyConnections,
      idleConnections,
      activeConnections: busyConnections,
      poolUtilization: totalConnections > 0 ? (busyConnections / totalConnections) * 100 : 0
    }
  }

  /**
   * Estimate pool metrics when Prisma metrics are not available
   */
  private estimatePoolMetrics(): Partial<ConnectionPoolMetrics> {
    // Estimate based on query performance and circuit breaker state
    const cbMetrics = databaseCircuitBreaker.getMetrics()
    
    return {
      poolUtilization: cbMetrics.state === CircuitState.OPEN ? 100 : 50,
      connectionErrors: cbMetrics.failures,
      connectionTimeouts: Math.floor(cbMetrics.failures * 0.3) // Estimate
    }
  }

  /**
   * Update metrics with new data
   */
  private updateMetrics(newMetrics: Partial<ConnectionPoolMetrics>): void {
    Object.assign(this.metrics, newMetrics)
    
    // Update averages
    if (this.queryTimes.length > 0) {
      this.metrics.avgQueryTime = this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length
    }
  }

  /**
   * Record query time for performance tracking
   */
  recordQueryTime(timeMs: number): void {
    this.queryTimes.push(timeMs)
    
    // Keep only recent samples
    if (this.queryTimes.length > this.maxQueryTimesSamples) {
      this.queryTimes.shift()
    }

    // Track slow queries
    if (timeMs > this.alertConfig.thresholds.queryTime) {
      this.metrics.slowQueries++
    }
  }

  /**
   * Record query success/failure
   */
  recordQueryResult(success: boolean): void {
    if (success) {
      this.metrics.successfulQueries++
    } else {
      this.metrics.failedQueries++
    }
  }

  /**
   * Calculate health score based on various factors
   */
  private calculateHealthScore(
    checks: Record<string, boolean>,
    warningCount: number,
    errorCount: number
  ): number {
    let score = 100

    // Deduct for failed checks
    const failedChecks = Object.values(checks).filter(check => !check).length
    score -= failedChecks * 20

    // Deduct for warnings and errors
    score -= warningCount * 10
    score -= errorCount * 25

    // Factor in circuit breaker state
    const cbMetrics = databaseCircuitBreaker.getMetrics()
    if (cbMetrics.state === CircuitState.OPEN) {
      score -= 30
    } else if (cbMetrics.state === CircuitState.HALF_OPEN) {
      score -= 15
    }

    // Factor in query performance
    if (this.metrics.avgQueryTime > this.alertConfig.thresholds.queryTime) {
      score -= 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Check if alerts should be sent and send them
   */
  private async checkAndSendAlerts(result: HealthCheckResult): Promise<void> {
    const alerts: string[] = []

    // Health score alert
    if (result.score < this.alertConfig.thresholds.healthScore) {
      alerts.push(`Low health score: ${result.score}`)
    }

    // Pool utilization alert
    if (result.metrics.poolUtilization > this.alertConfig.thresholds.poolUtilization) {
      alerts.push(`High pool utilization: ${result.metrics.poolUtilization}%`)
    }

    // Query time alert
    if (result.metrics.avgQueryTime > this.alertConfig.thresholds.queryTime) {
      alerts.push(`Slow query performance: ${result.metrics.avgQueryTime}ms`)
    }

    // Error rate alert
    const totalQueries = result.metrics.successfulQueries + result.metrics.failedQueries
    if (totalQueries > 0) {
      const errorRate = (result.metrics.failedQueries / totalQueries) * 100
      if (errorRate > this.alertConfig.thresholds.errorRate) {
        alerts.push(`High error rate: ${errorRate.toFixed(2)}%`)
      }
    }

    // Send alerts if any are triggered
    if (alerts.length > 0) {
      await this.sendAlert({
        severity: result.status === 'unhealthy' ? 'critical' : 'warning',
        message: `Database health alert: ${alerts.join(', ')}`,
        details: result
      })
    }
  }

  /**
   * Send alert notification
   */
  private async sendAlert(alert: {
    severity: 'warning' | 'critical'
    message: string
    details: HealthCheckResult
  }): Promise<void> {
    const alertKey = `${alert.severity}-${alert.message}`
    const now = Date.now()
    const lastAlert = this.lastAlertTime.get(alertKey)

    // Check cooldown
    if (lastAlert && (now - lastAlert) < this.alertCooldown) {
      return
    }

    this.lastAlertTime.set(alertKey, now)

    // Log alert
    console.warn(`🚨 Database Alert [${alert.severity.toUpperCase()}]: ${alert.message}`)
    
    // Send webhook if configured
    if (this.alertConfig.webhookUrl) {
      try {
        await fetch(this.alertConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            severity: alert.severity,
            message: alert.message,
            timestamp: alert.details.timestamp.toISOString(),
            healthScore: alert.details.score,
            status: alert.details.status,
            metrics: alert.details.metrics,
            errors: alert.details.errors,
            warnings: alert.details.warnings
          })
        })
      } catch (error) {
        console.error('Failed to send webhook alert:', error)
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): ConnectionPoolMetrics {
    return { ...this.metrics }
  }

  /**
   * Get health status endpoint data
   */
  async getHealthStatus(): Promise<{
    status: string
    healthy: boolean
    timestamp: Date
    metrics: ConnectionPoolMetrics
  }> {
    const healthCheck = await this.performHealthCheck()
    
    return {
      status: healthCheck.status,
      healthy: healthCheck.healthy,
      timestamp: healthCheck.timestamp,
      metrics: healthCheck.metrics
    }
  }

  /**
   * Initialize metrics with default values
   */
  private initializeMetrics(): ConnectionPoolMetrics {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      busyConnections: 0,
      avgQueryTime: 0,
      slowQueries: 0,
      failedQueries: 0,
      successfulQueries: 0,
      healthScore: 100,
      status: 'healthy',
      lastHealthCheck: new Date(),
      poolUtilization: 0,
      connectionTimeouts: 0,
      connectionErrors: 0,
      circuitBreakerState: CircuitState.CLOSED,
      circuitBreakerFailures: 0
    }
  }
}

// Global connection monitor instance
let globalMonitor: DatabaseConnectionMonitor | null = null

export function createDatabaseMonitor(
  prisma: PrismaClient,
  config?: Partial<AlertConfig>
): DatabaseConnectionMonitor {
  if (!globalMonitor) {
    globalMonitor = new DatabaseConnectionMonitor(prisma, config)
  }
  return globalMonitor
}

export function getDatabaseMonitor(): DatabaseConnectionMonitor | null {
  return globalMonitor
}