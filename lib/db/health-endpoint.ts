/**
 * Database Health Monitoring Endpoint
 * Provides HTTP endpoints for health checks and monitoring data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseMonitor } from './connection-monitor'
import { databaseCircuitBreaker } from './circuit-breaker'
import { databaseTimeoutHandler } from './timeout-handler'
import { reliablePrisma } from './prisma'

export interface DatabaseHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  database: {
    connected: boolean
    connectionPool: {
      total: number
      active: number
      idle: number
      utilization: number
    }
    performance: {
      averageQueryTime: number
      slowQueries: number
      successfulQueries: number
      failedQueries: number
      errorRate: number
    }
    reliability: {
      circuitBreaker: {
        state: string
        failures: number
        successes: number
        requests: number
      }
      activeOperations: number
      timeouts: number
    }
  }
  checks: {
    connectivity: boolean
    queryPerformance: boolean
    poolHealth: boolean
    circuitBreakerState: boolean
  }
  alerts: Array<{
    level: 'warning' | 'critical'
    message: string
    timestamp: string
  }>
}

class DatabaseHealthService {
  private startTime = Date.now()
  
  /**
   * Get comprehensive health status
   */
  async getHealthStatus(): Promise<DatabaseHealthResponse> {
    const monitor = getDatabaseMonitor()
    const circuitBreakerMetrics = databaseCircuitBreaker.getMetrics()
    
    let healthResult
    let connectionPoolMetrics
    
    try {
      if (monitor) {
        healthResult = await monitor.performHealthCheck()
        connectionPoolMetrics = monitor.getMetrics()
      } else {
        // Fallback health check without monitor
        healthResult = await this.performBasicHealthCheck()
        connectionPoolMetrics = null
      }
    } catch (error) {
      console.error('Health check failed:', error)
      return this.createUnhealthyResponse(error)
    }

    const totalQueries = (connectionPoolMetrics?.successfulQueries || 0) + 
                        (connectionPoolMetrics?.failedQueries || 0)
    const errorRate = totalQueries > 0 
      ? ((connectionPoolMetrics?.failedQueries || 0) / totalQueries) * 100 
      : 0

    const alerts = this.generateAlerts(healthResult, connectionPoolMetrics, circuitBreakerMetrics)

    return {
      status: healthResult?.status || 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connected: healthResult?.checks?.connectivity || false,
        connectionPool: {
          total: connectionPoolMetrics?.totalConnections || 0,
          active: connectionPoolMetrics?.activeConnections || 0,
          idle: connectionPoolMetrics?.idleConnections || 0,
          utilization: connectionPoolMetrics?.poolUtilization || 0
        },
        performance: {
          averageQueryTime: connectionPoolMetrics?.avgQueryTime || 0,
          slowQueries: connectionPoolMetrics?.slowQueries || 0,
          successfulQueries: connectionPoolMetrics?.successfulQueries || 0,
          failedQueries: connectionPoolMetrics?.failedQueries || 0,
          errorRate: Math.round(errorRate * 100) / 100
        },
        reliability: {
          circuitBreaker: {
            state: circuitBreakerMetrics.state,
            failures: circuitBreakerMetrics.failures,
            successes: circuitBreakerMetrics.successes,
            requests: circuitBreakerMetrics.requests
          },
          activeOperations: databaseTimeoutHandler.getActiveOperationCount(),
          timeouts: connectionPoolMetrics?.connectionTimeouts || 0
        }
      },
      checks: healthResult?.checks || {
        connectivity: false,
        queryPerformance: false,
        poolHealth: false,
        circuitBreakerState: false
      },
      alerts
    }
  }

  /**
   * Get basic metrics for monitoring systems
   */
  async getMetrics(): Promise<Record<string, number | string>> {
    const monitor = getDatabaseMonitor()
    const circuitBreakerMetrics = databaseCircuitBreaker.getMetrics()
    const connectionPoolMetrics = monitor?.getMetrics()

    return {
      // Connection metrics
      'db_connections_total': connectionPoolMetrics?.totalConnections || 0,
      'db_connections_active': connectionPoolMetrics?.activeConnections || 0,
      'db_connections_idle': connectionPoolMetrics?.idleConnections || 0,
      'db_pool_utilization_percent': connectionPoolMetrics?.poolUtilization || 0,
      
      // Performance metrics
      'db_query_duration_avg_ms': connectionPoolMetrics?.avgQueryTime || 0,
      'db_queries_slow_total': connectionPoolMetrics?.slowQueries || 0,
      'db_queries_successful_total': connectionPoolMetrics?.successfulQueries || 0,
      'db_queries_failed_total': connectionPoolMetrics?.failedQueries || 0,
      'db_health_score': connectionPoolMetrics?.healthScore || 0,
      
      // Circuit breaker metrics
      'db_circuit_breaker_state': circuitBreakerMetrics.state,
      'db_circuit_breaker_failures': circuitBreakerMetrics.failures,
      'db_circuit_breaker_successes': circuitBreakerMetrics.successes,
      'db_circuit_breaker_requests': circuitBreakerMetrics.requests,
      
      // Operation metrics
      'db_operations_active': databaseTimeoutHandler.getActiveOperationCount(),
      'db_timeouts_total': connectionPoolMetrics?.connectionTimeouts || 0,
      
      // Service metrics
      'db_service_uptime_ms': Date.now() - this.startTime,
      'db_last_health_check': connectionPoolMetrics?.lastHealthCheck?.getTime() || 0
    }
  }

  /**
   * Perform liveness check (simpler check for kubernetes/docker)
   */
  async getLivenessStatus(): Promise<{ alive: boolean; timestamp: string }> {
    try {
      // Simple connectivity check
      await reliablePrisma.raw.$queryRaw`SELECT 1`
      return {
        alive: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        alive: false,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Perform readiness check (more comprehensive for load balancers)
   */
  async getReadinessStatus(): Promise<{ 
    ready: boolean
    timestamp: string
    reason?: string 
  }> {
    try {
      const monitor = getDatabaseMonitor()
      const circuitBreakerMetrics = databaseCircuitBreaker.getMetrics()
      
      // Check circuit breaker state
      if (circuitBreakerMetrics.state === 'OPEN') {
        return {
          ready: false,
          timestamp: new Date().toISOString(),
          reason: 'Circuit breaker is open'
        }
      }
      
      // Check connection pool health
      if (monitor) {
        const metrics = monitor.getMetrics()
        if (metrics.poolUtilization > 95) {
          return {
            ready: false,
            timestamp: new Date().toISOString(),
            reason: 'Connection pool exhausted'
          }
        }
        
        if (metrics.healthScore < 50) {
          return {
            ready: false,
            timestamp: new Date().toISOString(),
            reason: 'Health score too low'
          }
        }
      }
      
      // Perform basic connectivity test
      await reliablePrisma.raw.$queryRaw`SELECT 1`
      
      return {
        ready: true,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      return {
        ready: false,
        timestamp: new Date().toISOString(),
        reason: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Perform basic health check without monitor
   */
  private async performBasicHealthCheck() {
    try {
      await reliablePrisma.raw.$queryRaw`SELECT 1`
      return {
        status: 'healthy' as const,
        checks: {
          connectivity: true,
          queryPerformance: true,
          poolHealth: true,
          circuitBreakerState: true
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        checks: {
          connectivity: false,
          queryPerformance: false,
          poolHealth: false,
          circuitBreakerState: false
        }
      }
    }
  }

  /**
   * Create unhealthy response for errors
   */
  private createUnhealthyResponse(error: unknown): DatabaseHealthResponse {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connected: false,
        connectionPool: { total: 0, active: 0, idle: 0, utilization: 0 },
        performance: {
          averageQueryTime: 0,
          slowQueries: 0,
          successfulQueries: 0,
          failedQueries: 0,
          errorRate: 100
        },
        reliability: {
          circuitBreaker: {
            state: 'UNKNOWN',
            failures: 0,
            successes: 0,
            requests: 0
          },
          activeOperations: 0,
          timeouts: 0
        }
      },
      checks: {
        connectivity: false,
        queryPerformance: false,
        poolHealth: false,
        circuitBreakerState: false
      },
      alerts: [{
        level: 'critical',
        message: `Database health check failed: ${error instanceof Error ? error.message : error}`,
        timestamp: new Date().toISOString()
      }]
    }
  }

  /**
   * Generate alerts based on current status
   */
  private generateAlerts(healthResult: any, connectionPoolMetrics: any, circuitBreakerMetrics: any) {
    const alerts: Array<{ level: 'warning' | 'critical'; message: string; timestamp: string }> = []
    const now = new Date().toISOString()

    // Circuit breaker alerts
    if (circuitBreakerMetrics.state === 'OPEN') {
      alerts.push({
        level: 'critical',
        message: 'Database circuit breaker is OPEN - blocking all operations',
        timestamp: now
      })
    } else if (circuitBreakerMetrics.state === 'HALF_OPEN') {
      alerts.push({
        level: 'warning',
        message: 'Database circuit breaker is HALF_OPEN - testing recovery',
        timestamp: now
      })
    }

    // Connection pool alerts
    if (connectionPoolMetrics?.poolUtilization > 90) {
      alerts.push({
        level: 'critical',
        message: `High connection pool utilization: ${connectionPoolMetrics.poolUtilization}%`,
        timestamp: now
      })
    } else if (connectionPoolMetrics?.poolUtilization > 80) {
      alerts.push({
        level: 'warning',
        message: `Elevated connection pool utilization: ${connectionPoolMetrics.poolUtilization}%`,
        timestamp: now
      })
    }

    // Performance alerts
    if (connectionPoolMetrics?.avgQueryTime > 5000) {
      alerts.push({
        level: 'critical',
        message: `Very slow query performance: ${connectionPoolMetrics.avgQueryTime}ms average`,
        timestamp: now
      })
    } else if (connectionPoolMetrics?.avgQueryTime > 1000) {
      alerts.push({
        level: 'warning',
        message: `Slow query performance: ${connectionPoolMetrics.avgQueryTime}ms average`,
        timestamp: now
      })
    }

    // Health score alerts
    if (connectionPoolMetrics?.healthScore < 50) {
      alerts.push({
        level: 'critical',
        message: `Low database health score: ${connectionPoolMetrics.healthScore}`,
        timestamp: now
      })
    } else if (connectionPoolMetrics?.healthScore < 70) {
      alerts.push({
        level: 'warning',
        message: `Degraded database health score: ${connectionPoolMetrics.healthScore}`,
        timestamp: now
      })
    }

    // Error rate alerts
    const totalQueries = (connectionPoolMetrics?.successfulQueries || 0) + 
                        (connectionPoolMetrics?.failedQueries || 0)
    if (totalQueries > 0) {
      const errorRate = (connectionPoolMetrics?.failedQueries / totalQueries) * 100
      if (errorRate > 10) {
        alerts.push({
          level: 'critical',
          message: `High error rate: ${errorRate.toFixed(2)}%`,
          timestamp: now
        })
      } else if (errorRate > 5) {
        alerts.push({
          level: 'warning',
          message: `Elevated error rate: ${errorRate.toFixed(2)}%`,
          timestamp: now
        })
      }
    }

    return alerts
  }
}

// Singleton service instance
const healthService = new DatabaseHealthService()

/**
 * Health check endpoint handler
 */
export async function handleHealthCheck(request: NextRequest): Promise<NextResponse> {
  try {
    const health = await healthService.getHealthStatus()
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503
    
    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

/**
 * Metrics endpoint handler (Prometheus format)
 */
export async function handleMetrics(request: NextRequest): Promise<NextResponse> {
  try {
    const metrics = await healthService.getMetrics()
    
    // Convert to Prometheus format
    let prometheusOutput = ''
    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value === 'number') {
        prometheusOutput += `${key} ${value}\n`
      } else {
        prometheusOutput += `${key}{value="${value}"} 1\n`
      }
    }
    
    return new NextResponse(prometheusOutput, {
      headers: { 'Content-Type': 'text/plain' }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Liveness probe handler (for Kubernetes)
 */
export async function handleLiveness(request: NextRequest): Promise<NextResponse> {
  try {
    const status = await healthService.getLivenessStatus()
    return NextResponse.json(status, { 
      status: status.alive ? 200 : 503 
    })
  } catch (error) {
    return NextResponse.json({
      alive: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

/**
 * Readiness probe handler (for Kubernetes)
 */
export async function handleReadiness(request: NextRequest): Promise<NextResponse> {
  try {
    const status = await healthService.getReadinessStatus()
    return NextResponse.json(status, { 
      status: status.ready ? 200 : 503 
    })
  } catch (error) {
    return NextResponse.json({
      ready: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

export { healthService }