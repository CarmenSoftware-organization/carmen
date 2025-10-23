/**
 * Metrics API Endpoint for Carmen ERP
 * Provides system metrics, performance data, and business analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { infrastructureMonitor } from '@/lib/monitoring/infrastructure-monitoring'
import { businessMetricsTracker } from '@/lib/monitoring/business-metrics'
import { performanceMonitor } from '@/lib/monitoring/performance'
import { alertManager } from '@/lib/monitoring/alert-manager'
import { logger } from '@/lib/monitoring/logger'
import { authStrategies } from '@/lib/auth/api-protection'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { SecurityEventType } from '@/lib/security/audit-logger'

/**
 * GET /api/metrics - System metrics endpoint
 * Requires authentication for sensitive metrics
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'basic'
  const timeframe = parseInt(url.searchParams.get('timeframe') || '3600000') // Default 1 hour
  
  try {
    switch (type) {
      case 'basic':
        return basicMetrics(request)
      case 'performance':
        return performanceMetrics(request, timeframe)
      case 'business':
        return businessMetrics(request, timeframe)
      case 'infrastructure':
        return infrastructureMetrics(request)
      case 'alerts':
        return alertMetrics(request)
      default:
        return NextResponse.json({ error: 'Invalid metrics type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Metrics endpoint error', { error, type })
    
    return NextResponse.json({
      error: 'Failed to retrieve metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Basic metrics - public endpoint for monitoring systems
 */
async function basicMetrics(request: NextRequest) {
  try {
    const startTime = Date.now()
    const healthStatus = await infrastructureMonitor.getHealthStatus()
    
    const metrics = {
      timestamp: new Date().toISOString(),
      status: healthStatus.overall,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime,
      healthChecks: {
        total: healthStatus.checks.length,
        healthy: healthStatus.checks.filter(c => c.status === 'healthy').length,
        degraded: healthStatus.checks.filter(c => c.status === 'degraded').length,
        unhealthy: healthStatus.checks.filter(c => c.status === 'unhealthy').length
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    throw error
  }
}

/**
 * Performance metrics - requires authentication
 */
const performanceMetrics = withSecurity(
  async (request: NextRequest) => {
    try {
      const url = new URL(request.url)
      const timeframe = parseInt(url.searchParams.get('timeframe') || '3600000')

      // Mock user for development
      const user = { id: 'mock-user', role: 'admin' }

      await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
        resource: 'performance_metrics',
        action: 'view_performance_metrics'
      })

      const webVitals = performanceMonitor.getWebVitals()
      const recentMetrics = performanceMonitor.getMetrics({
        since: Date.now() - timeframe,
        limit: 1000
      })

      // Aggregate performance data
      const apiMetrics = recentMetrics.filter(m => m.name === 'api_request_duration')
      const pageMetrics = recentMetrics.filter(m => m.name === 'page_load_time')
      const componentMetrics = recentMetrics.filter(m => m.name.includes('component'))

      const metrics = {
        timestamp: new Date().toISOString(),
        timeframe,
        webVitals,
        api: {
          totalRequests: apiMetrics.length,
          averageResponseTime: apiMetrics.length > 0 ?
            apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length : 0,
          slowRequests: apiMetrics.filter(m => m.value > 1000).length,
          errorRate: 0 // Would be calculated from error metrics
        },
        pages: {
          totalPageLoads: pageMetrics.length,
          averageLoadTime: pageMetrics.length > 0 ?
            pageMetrics.reduce((sum, m) => sum + m.value, 0) / pageMetrics.length : 0,
          slowPages: pageMetrics.filter(m => m.value > 3000).length
        },
        components: {
          totalMounts: componentMetrics.filter(m => m.name.includes('mount')).length,
          averageMountTime: 0, // Would be calculated
          interactions: componentMetrics.filter(m => m.name.includes('interaction')).length
        }
      }

      return createSecureResponse(metrics)
    } catch (error) {
      logger.error('Performance metrics error', { error, userId: 'mock-user' })
      throw error
    }
  }
)

/**
 * Business metrics - requires authentication
 */
const businessMetrics = withSecurity(
  async (request: NextRequest) => {
    try {
      const url = new URL(request.url)
      const timeframe = parseInt(url.searchParams.get('timeframe') || '86400000') // Default 24 hours

      // Mock user for development
      const user = { id: 'mock-user', role: 'admin' }

      await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
        resource: 'business_metrics',
        action: 'view_business_metrics'
      })

      const businessData = businessMetricsTracker.getBusinessMetrics(timeframe)
      const workflowAnalytics = businessMetricsTracker.getWorkflowAnalytics(undefined, timeframe)
      const featureUsage = businessMetricsTracker.getFeatureUsage()

      const metrics = {
        timestamp: new Date().toISOString(),
        timeframe,
        users: {
          total: businessData.totalUsers,
          active: businessData.activeUsers,
          sessions: businessData.sessionCount,
          averageSessionDuration: businessData.averageSessionDuration
        },
        workflows: {
          total: workflowAnalytics.totalWorkflows,
          completed: workflowAnalytics.completedWorkflows,
          abandoned: workflowAnalytics.abandonedWorkflows,
          completionRate: workflowAnalytics.completionRate,
          averageDuration: workflowAnalytics.averageDuration,
          bottlenecks: workflowAnalytics.bottlenecks.slice(0, 5) // Top 5 bottlenecks
        },
        system: {
          uptime: businessData.systemUptime,
          errorRate: businessData.errorRate,
          performanceScore: businessData.performanceScore
        },
        features: {
          totalFeatures: featureUsage.length,
          activeFeatures: featureUsage.filter(f => f.usageCount > 0).length,
          topUsedFeatures: featureUsage
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10)
        }
      }

      return createSecureResponse(metrics)
    } catch (error) {
      logger.error('Business metrics error', { error, userId: 'mock-user' })
      throw error
    }
  }
)

/**
 * Infrastructure metrics - requires admin access
 */
const infrastructureMetrics = withSecurity(
  async (request: NextRequest) => {
    try {
      // Mock user for development
      const user = { id: 'mock-admin', role: 'admin' }

      await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
        resource: 'infrastructure_metrics',
        action: 'view_infrastructure_metrics',
        severity: 'high'
      })

      const systemMetrics = infrastructureMonitor.getSystemMetrics(10)
      const databaseMetrics = infrastructureMonitor.getDatabaseMetrics(10)
      const serviceHealth = infrastructureMonitor.getServiceHealth()

      const metrics = {
        timestamp: new Date().toISOString(),
        system: {
          current: systemMetrics[systemMetrics.length - 1] || null,
          history: systemMetrics
        },
        database: {
          current: databaseMetrics[databaseMetrics.length - 1] || null,
          history: databaseMetrics
        },
        services: serviceHealth.map(service => ({
          name: service.name,
          status: service.status,
          uptime: service.uptime,
          latency: service.latency,
          errorRate: service.errorRate,
          lastCheck: service.lastCheck
        }))
      }

      return createSecureResponse(metrics)
    } catch (error) {
      logger.error('Infrastructure metrics error', { error, userId: 'mock-admin' })
      throw error
    }
  }
)

/**
 * Alert metrics - requires admin access
 */
const alertMetrics = withSecurity(
  async (request: NextRequest) => {
    try {
      // Mock user for development
      const user = { id: 'mock-admin', role: 'admin' }

      await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
        resource: 'alert_metrics',
        action: 'view_alert_metrics',
        severity: 'high'
      })

      const alerts = alertManager.getAlerts({
        since: new Date(Date.now() - 86400000), // Last 24 hours
        limit: 1000
      })

      const activeAlerts = alertManager.getAlerts({
        status: ['firing', 'acknowledged'],
        limit: 100
      })

      const alertStats = alertManager.getAlertStats()

      const metrics = {
        timestamp: new Date().toISOString(),
        active: {
          total: activeAlerts.length,
          critical: activeAlerts.filter(a => a.severity === 'critical').length,
          warning: activeAlerts.filter(a => a.severity === 'warning').length,
          info: activeAlerts.filter(a => a.severity === 'info').length
        },
        recent: {
          total: alerts.length,
          resolved: alerts.filter(a => a.status === 'resolved').length,
          averageResolutionTime: alertStats.avgResolutionTime,
          escalationRate: alertStats.escalationRate
        },
        rules: {
          total: 0, // AlertManager doesn't have getAlertRules method
          enabled: 0
        },
        topSources: Object.entries(alertStats.bySource)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([source, count]) => ({ source, count }))
      }

      return createSecureResponse(metrics)
    } catch (error) {
      logger.error('Alert metrics error', { error, userId: 'mock-admin' })
      throw error
    }
  }
)

/**
 * Prometheus-compatible metrics endpoint
 * NOTE: This should be moved to app/api/metrics/prometheus/route.ts as GET
 */
async function GET_PROMETHEUS(request: NextRequest) {
  try {
    const healthStatus = await infrastructureMonitor.getHealthStatus()
    const businessData = businessMetricsTracker.getBusinessMetrics()
    
    // Generate Prometheus format metrics
    const metrics = [
      `# HELP carmen_health_status Overall system health status`,
      `# TYPE carmen_health_status gauge`,
      `carmen_health_status{status="${healthStatus.overall}"} ${healthStatus.overall === 'healthy' ? 1 : 0}`,
      
      `# HELP carmen_uptime_seconds System uptime in seconds`,
      `# TYPE carmen_uptime_seconds counter`,
      `carmen_uptime_seconds ${Math.floor(process.uptime())}`,
      
      `# HELP carmen_active_users Current number of active users`,
      `# TYPE carmen_active_users gauge`,
      `carmen_active_users ${businessData.activeUsers}`,
      
      `# HELP carmen_workflow_completion_rate Workflow completion rate percentage`,
      `# TYPE carmen_workflow_completion_rate gauge`,
      `carmen_workflow_completion_rate ${businessData.workflowCompletionRate}`,
      
      `# HELP carmen_error_rate System error rate percentage`,
      `# TYPE carmen_error_rate gauge`,
      `carmen_error_rate ${businessData.errorRate}`,
    ].join('\n')

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  } catch (error) {
    logger.error('Prometheus metrics error', { error })
    return new NextResponse('# Error generating metrics', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}