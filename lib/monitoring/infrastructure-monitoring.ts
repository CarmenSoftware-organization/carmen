/**
 * Infrastructure Monitoring for Carmen ERP
 * Monitors system health, database connections, external services, and resource utilization
 */

import { getMonitoringConfig, serviceConfigs } from './config'
import { logger } from './logger'

export interface HealthCheckResult {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  message?: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface SystemMetrics {
  timestamp: number
  cpu: {
    usage: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    percentage: number
  }
  disk: {
    total: number
    used: number
    free: number
    percentage: number
  }
  network: {
    bytesReceived: number
    bytesSent: number
    connectionsActive: number
  }
  uptime: number
}

export interface DatabaseMetrics {
  timestamp: number
  connectionPool: {
    total: number
    active: number
    idle: number
    waiting: number
    usage: number
  }
  queries: {
    total: number
    slow: number
    failed: number
    averageTime: number
    qps: number // queries per second
  }
  transactions: {
    active: number
    committed: number
    rolledBack: number
  }
  locks: {
    waiting: number
    held: number
  }
  replication?: {
    lag: number
    status: 'synced' | 'lagging' | 'disconnected'
  }
}

export interface ServiceHealthStatus {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  uptime: number
  latency: number
  errorRate: number
  throughput: number
  lastCheck: number
  dependencies: string[]
  version?: string
}

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  threshold: number
  duration: number // How long condition must be true before firing
  severity: 'critical' | 'warning' | 'info'
  enabled: boolean
  lastFired?: number
  firings: number
  targets: string[] // email addresses, webhook URLs, etc.
}

class InfrastructureMonitor {
  private healthChecks: Map<string, HealthCheckResult> = new Map()
  private systemMetrics: SystemMetrics[] = []
  private databaseMetrics: DatabaseMetrics[] = []
  private serviceHealth: Map<string, ServiceHealthStatus> = new Map()
  private alertRules: Map<string, AlertRule> = new Map()
  private config = getMonitoringConfig()
  private checkInterval = 30000 // 30 seconds
  private metricsInterval = 60000 // 1 minute
  private isMonitoring = false
  private timers: NodeJS.Timeout[] = []

  constructor() {
    if (this.config.enabledServices.infrastructureMonitoring) {
      this.initialize()
    }
  }

  private initialize() {
    this.setupHealthChecks()
    this.setupSystemMetrics()
    this.setupDatabaseMetrics()
    this.setupServiceHealth()
    this.setupDefaultAlerts()
    this.startMonitoring()
    
    logger.info('Infrastructure monitoring initialized', {
      checksEnabled: this.healthChecks.size,
      environment: this.config.environment,
    })
  }

  private setupHealthChecks() {
    // Database health check
    this.registerHealthCheck('database', async () => {
      try {
        const startTime = Date.now()
        
        // Test database connection
        if (typeof window === 'undefined') {
          const { PrismaClient } = await import('@prisma/client')
          const prisma = new PrismaClient()
          await prisma.$queryRaw`SELECT 1`
          await prisma.$disconnect()
        }
        
        const latency = Date.now() - startTime
        
        return {
          name: 'database',
          status: latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
          latency,
          timestamp: Date.now(),
          metadata: { connectionType: 'postgresql' }
        }
      } catch (error) {
        return {
          name: 'database',
          status: 'unhealthy',
          latency: -1,
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'Database connection failed'
        }
      }
    })

    // Authentication service health check (Keycloak)
    this.registerHealthCheck('auth', async () => {
      try {
        const startTime = Date.now()
        const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080'
        
        const response = await fetch(`${keycloakUrl}/auth/realms/carmen/protocol/openid_connect/.well-known`, {
          method: 'GET',
          timeout: 5000
        })
        
        const latency = Date.now() - startTime
        
        return {
          name: 'auth',
          status: response.ok && latency < 2000 ? 'healthy' : response.ok ? 'degraded' : 'unhealthy',
          latency,
          timestamp: Date.now(),
          metadata: { 
            statusCode: response.status,
            url: keycloakUrl
          }
        }
      } catch (error) {
        return {
          name: 'auth',
          status: 'unhealthy',
          latency: -1,
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'Auth service unavailable'
        }
      }
    })

    // Redis cache health check (if configured)
    if (process.env.REDIS_URL) {
      this.registerHealthCheck('cache', async () => {
        try {
          const startTime = Date.now()
          
          // Test Redis connection
          // This would use actual Redis client in production
          const latency = Date.now() - startTime
          
          return {
            name: 'cache',
            status: 'healthy',
            latency,
            timestamp: Date.now(),
            metadata: { type: 'redis' }
          }
        } catch (error) {
          return {
            name: 'cache',
            status: 'unhealthy',
            latency: -1,
            timestamp: Date.now(),
            message: error instanceof Error ? error.message : 'Cache unavailable'
          }
        }
      })
    }

    // External API health checks
    this.registerHealthCheck('external-apis', async () => {
      try {
        const checks = []
        
        // Example: Check currency exchange API
        if (process.env.EXCHANGE_RATE_API_URL) {
          const startTime = Date.now()
          const response = await fetch(process.env.EXCHANGE_RATE_API_URL, {
            timeout: 3000
          })
          checks.push({
            name: 'exchange-rate-api',
            status: response.ok,
            latency: Date.now() - startTime
          })
        }

        const overallStatus = checks.every(c => c.status) ? 'healthy' : 
                           checks.some(c => c.status) ? 'degraded' : 'unhealthy'

        return {
          name: 'external-apis',
          status: overallStatus,
          latency: Math.max(...checks.map(c => c.latency), 0),
          timestamp: Date.now(),
          metadata: { checks }
        }
      } catch (error) {
        return {
          name: 'external-apis',
          status: 'unhealthy',
          latency: -1,
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'External APIs unavailable'
        }
      }
    })
  }

  private setupSystemMetrics() {
    if (typeof window !== 'undefined') return // Server-side only

    // System metrics collection would be implemented here
    // This is a placeholder - actual implementation would use system monitoring libraries
    this.registerSystemMetricsCollector(async () => {
      try {
        // In production, this would use libraries like 'systeminformation' or 'os'
        const metrics: SystemMetrics = {
          timestamp: Date.now(),
          cpu: {
            usage: Math.random() * 100, // Placeholder
            loadAverage: [1.2, 1.5, 1.3] // Placeholder
          },
          memory: {
            total: 8000000000, // 8GB
            used: 4000000000, // 4GB
            free: 4000000000, // 4GB
            percentage: 50
          },
          disk: {
            total: 100000000000, // 100GB
            used: 60000000000, // 60GB
            free: 40000000000, // 40GB
            percentage: 60
          },
          network: {
            bytesReceived: 1000000,
            bytesSent: 500000,
            connectionsActive: 25
          },
          uptime: process.uptime()
        }

        this.systemMetrics.push(metrics)
        
        // Keep only last 100 entries
        if (this.systemMetrics.length > 100) {
          this.systemMetrics = this.systemMetrics.slice(-100)
        }

        // Check system alerts
        this.checkSystemAlerts(metrics)

        return metrics
      } catch (error) {
        logger.error('Failed to collect system metrics', { error })
        return null
      }
    })
  }

  private setupDatabaseMetrics() {
    if (typeof window !== 'undefined') return // Server-side only

    this.registerDatabaseMetricsCollector(async () => {
      try {
        // Database metrics collection would be implemented here
        const metrics: DatabaseMetrics = {
          timestamp: Date.now(),
          connectionPool: {
            total: 20,
            active: 5,
            idle: 15,
            waiting: 0,
            usage: 25
          },
          queries: {
            total: 1500,
            slow: 3,
            failed: 2,
            averageTime: 45,
            qps: 25
          },
          transactions: {
            active: 2,
            committed: 145,
            rolledBack: 1
          },
          locks: {
            waiting: 0,
            held: 8
          }
        }

        this.databaseMetrics.push(metrics)
        
        // Keep only last 100 entries
        if (this.databaseMetrics.length > 100) {
          this.databaseMetrics = this.databaseMetrics.slice(-100)
        }

        // Check database alerts
        this.checkDatabaseAlerts(metrics)

        return metrics
      } catch (error) {
        logger.error('Failed to collect database metrics', { error })
        return null
      }
    })
  }

  private setupServiceHealth() {
    // Initialize service health tracking
    const services = [
      'carmen-frontend',
      'carmen-api',
      'keycloak',
      'postgresql',
      'redis'
    ]

    services.forEach(service => {
      this.serviceHealth.set(service, {
        name: service,
        status: 'unknown',
        uptime: 0,
        latency: 0,
        errorRate: 0,
        throughput: 0,
        lastCheck: Date.now(),
        dependencies: []
      })
    })
  }

  private setupDefaultAlerts() {
    // CPU usage alert
    this.addAlertRule({
      id: 'high-cpu-usage',
      name: 'High CPU Usage',
      description: 'CPU usage is above 80% for more than 5 minutes',
      metric: 'system.cpu.usage',
      condition: 'gt',
      threshold: 80,
      duration: 300000, // 5 minutes
      severity: 'warning',
      enabled: true,
      firings: 0,
      targets: this.config.alerts.recipients.warning
    })

    // Memory usage alert
    this.addAlertRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      description: 'Memory usage is above 90% for more than 2 minutes',
      metric: 'system.memory.percentage',
      condition: 'gt',
      threshold: 90,
      duration: 120000, // 2 minutes
      severity: 'critical',
      enabled: true,
      firings: 0,
      targets: this.config.alerts.recipients.critical
    })

    // Database connection pool alert
    this.addAlertRule({
      id: 'database-pool-exhaustion',
      name: 'Database Connection Pool Exhaustion',
      description: 'Database connection pool usage is above 90%',
      metric: 'database.connectionPool.usage',
      condition: 'gt',
      threshold: 90,
      duration: 60000, // 1 minute
      severity: 'critical',
      enabled: true,
      firings: 0,
      targets: this.config.alerts.recipients.critical
    })

    // Slow query alert
    this.addAlertRule({
      id: 'slow-database-queries',
      name: 'Slow Database Queries',
      description: 'Average database query time is above 1 second',
      metric: 'database.queries.averageTime',
      condition: 'gt',
      threshold: 1000,
      duration: 180000, // 3 minutes
      severity: 'warning',
      enabled: true,
      firings: 0,
      targets: this.config.alerts.recipients.warning
    })
  }

  private startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true

    // Health checks
    const healthCheckTimer = setInterval(() => {
      this.runAllHealthChecks()
    }, this.checkInterval)

    // System metrics
    const systemMetricsTimer = setInterval(() => {
      this.collectSystemMetrics()
    }, this.metricsInterval)

    // Database metrics
    const databaseMetricsTimer = setInterval(() => {
      this.collectDatabaseMetrics()
    }, this.metricsInterval)

    // Service health
    const serviceHealthTimer = setInterval(() => {
      this.updateServiceHealth()
    }, this.checkInterval)

    this.timers.push(healthCheckTimer, systemMetricsTimer, databaseMetricsTimer, serviceHealthTimer)
  }

  // Public API methods

  /**
   * Register a health check
   */
  registerHealthCheck(name: string, checkFunction: () => Promise<HealthCheckResult>) {
    this.healthChecks.set(name, checkFunction as any)
  }

  /**
   * Register system metrics collector
   */
  registerSystemMetricsCollector(collector: () => Promise<SystemMetrics | null>) {
    this.collectSystemMetrics = collector
  }

  /**
   * Register database metrics collector
   */
  registerDatabaseMetricsCollector(collector: () => Promise<DatabaseMetrics | null>) {
    this.collectDatabaseMetrics = collector
  }

  /**
   * Add alert rule
   */
  addAlertRule(rule: AlertRule) {
    this.alertRules.set(rule.id, rule)
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string) {
    this.alertRules.delete(ruleId)
  }

  /**
   * Get current health status
   */
  async getHealthStatus(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy'
    checks: HealthCheckResult[]
    lastUpdated: number
  }> {
    const checks: HealthCheckResult[] = []
    let healthyCount = 0
    let degradedCount = 0
    let unhealthyCount = 0

    for (const [name, checkFn] of this.healthChecks) {
      try {
        const result = await (checkFn as Function)()
        checks.push(result)
        
        if (result.status === 'healthy') healthyCount++
        else if (result.status === 'degraded') degradedCount++
        else unhealthyCount++
      } catch (error) {
        checks.push({
          name,
          status: 'unhealthy',
          latency: -1,
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'Health check failed'
        })
        unhealthyCount++
      }
    }

    const overall = unhealthyCount > 0 ? 'unhealthy' :
                   degradedCount > 0 ? 'degraded' : 'healthy'

    return {
      overall,
      checks,
      lastUpdated: Date.now()
    }
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(limit: number = 50): SystemMetrics[] {
    return this.systemMetrics.slice(-limit)
  }

  /**
   * Get database metrics
   */
  getDatabaseMetrics(limit: number = 50): DatabaseMetrics[] {
    return this.databaseMetrics.slice(-limit)
  }

  /**
   * Get service health status
   */
  getServiceHealth(): ServiceHealthStatus[] {
    return Array.from(this.serviceHealth.values())
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values())
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): AlertRule[] {
    return Array.from(this.alertRules.values()).filter(rule => {
      if (!rule.lastFired) return false
      return Date.now() - rule.lastFired < rule.duration
    })
  }

  // Private helper methods

  private async runAllHealthChecks() {
    for (const [name, checkFn] of this.healthChecks) {
      try {
        const result = await (checkFn as Function)()
        
        // Log degraded or unhealthy status
        if (result.status !== 'healthy') {
          logger.warn(`Health check failed: ${name}`, result)
        }
      } catch (error) {
        logger.error(`Health check error: ${name}`, { error })
      }
    }
  }

  private async collectSystemMetrics() {
    // Placeholder - would be implemented by registered collector
  }

  private async collectDatabaseMetrics() {
    // Placeholder - would be implemented by registered collector
  }

  private updateServiceHealth() {
    // Update service health status
    for (const [serviceName, status] of this.serviceHealth) {
      // This would collect actual service metrics
      status.lastCheck = Date.now()
    }
  }

  private checkSystemAlerts(metrics: SystemMetrics) {
    this.checkAlert('system.cpu.usage', metrics.cpu.usage)
    this.checkAlert('system.memory.percentage', metrics.memory.percentage)
    this.checkAlert('system.disk.percentage', metrics.disk.percentage)
  }

  private checkDatabaseAlerts(metrics: DatabaseMetrics) {
    this.checkAlert('database.connectionPool.usage', metrics.connectionPool.usage)
    this.checkAlert('database.queries.averageTime', metrics.queries.averageTime)
  }

  private checkAlert(metricName: string, value: number) {
    for (const rule of this.alertRules.values()) {
      if (rule.metric === metricName && rule.enabled) {
        const shouldFire = this.evaluateCondition(rule.condition, value, rule.threshold)
        
        if (shouldFire) {
          if (!rule.lastFired || Date.now() - rule.lastFired > rule.duration) {
            this.fireAlert(rule, value)
          }
        }
      }
    }
  }

  private evaluateCondition(condition: string, value: number, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold
      case 'gte': return value >= threshold
      case 'lt': return value < threshold
      case 'lte': return value <= threshold
      case 'eq': return value === threshold
      default: return false
    }
  }

  private fireAlert(rule: AlertRule, currentValue: number) {
    rule.lastFired = Date.now()
    rule.firings++

    logger[rule.severity === 'critical' ? 'error' : 'warn'](`Alert fired: ${rule.name}`, {
      rule: rule.id,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity
    })

    // Send notifications
    this.sendAlertNotifications(rule, currentValue)
  }

  private async sendAlertNotifications(rule: AlertRule, currentValue: number) {
    const channels = this.config.alerts.channels
    
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailAlert(rule, currentValue)
            break
          case 'slack':
            await this.sendSlackAlert(rule, currentValue)
            break
          case 'webhook':
            await this.sendWebhookAlert(rule, currentValue)
            break
        }
      } catch (error) {
        logger.error(`Failed to send ${channel} alert`, { rule: rule.id, error })
      }
    }
  }

  private async sendEmailAlert(rule: AlertRule, currentValue: number) {
    // Email implementation would go here
    logger.info('Email alert would be sent', { rule: rule.name, currentValue })
  }

  private async sendSlackAlert(rule: AlertRule, currentValue: number) {
    // Slack implementation would go here
    logger.info('Slack alert would be sent', { rule: rule.name, currentValue })
  }

  private async sendWebhookAlert(rule: AlertRule, currentValue: number) {
    // Webhook implementation would go here
    logger.info('Webhook alert would be sent', { rule: rule.name, currentValue })
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false
    this.timers.forEach(timer => clearInterval(timer))
    this.timers = []
  }
}

// Export singleton instance
export const infrastructureMonitor = new InfrastructureMonitor()

// Health check endpoint utility for Next.js API routes
export function createHealthCheckHandler() {
  return async (req: any, res: any) => {
    try {
      const healthStatus = await infrastructureMonitor.getHealthStatus()
      const statusCode = healthStatus.overall === 'healthy' ? 200 :
                        healthStatus.overall === 'degraded' ? 200 : 503

      res.status(statusCode).json({
        status: healthStatus.overall,
        timestamp: Date.now(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: healthStatus.checks,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

// Metrics endpoint utility
export function createMetricsHandler() {
  return async (req: any, res: any) => {
    try {
      const systemMetrics = infrastructureMonitor.getSystemMetrics(10)
      const databaseMetrics = infrastructureMonitor.getDatabaseMetrics(10)
      const serviceHealth = infrastructureMonitor.getServiceHealth()
      const alertRules = infrastructureMonitor.getAlertRules()
      const activeAlerts = infrastructureMonitor.getActiveAlerts()

      res.status(200).json({
        timestamp: Date.now(),
        system: systemMetrics[systemMetrics.length - 1] || null,
        database: databaseMetrics[databaseMetrics.length - 1] || null,
        services: serviceHealth,
        alerts: {
          total: alertRules.length,
          active: activeAlerts.length,
          rules: alertRules,
          activeAlerts
        }
      })
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}