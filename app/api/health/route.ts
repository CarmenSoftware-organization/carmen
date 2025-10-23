/**
 * Comprehensive Health Check API Route
 * Provides system-wide health status including infrastructure monitoring
 * 
 * Security Features:
 * - Keycloak authentication required for detailed health
 * - Admin role required for sensitive information
 * - Rate limiting
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleHealthCheck } from '@/lib/db/health-endpoint'
import { infrastructureMonitor } from '@/lib/monitoring/infrastructure-monitoring'
import { logger } from '@/lib/monitoring/logger'
import { withAuth, type AuthenticatedUser } from '@/lib/middleware/auth'
import { createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { SecurityEventType } from '@/lib/security/audit-logger'

/**
 * GET /api/health - Comprehensive system health check
 * Public basic health, authenticated for detailed health
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const url = new URL(request.url)
  const detailed = url.searchParams.get('detailed') === 'true'

  try {
    if (detailed) {
      // Detailed health check requires authentication
      return detailedHealthCheck(request)
    }

    // Basic health check (public)
    const healthStatus = await infrastructureMonitor.getHealthStatus()
    
    const response = {
      status: healthStatus.overall,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      responseTime: Date.now() - startTime
    }

    // Determine HTTP status code based on health
    const statusCode = healthStatus.overall === 'healthy' ? 200 :
                      healthStatus.overall === 'degraded' ? 200 : 503

    logger.info('Basic health check performed', {
      status: healthStatus.overall,
      responseTime: response.responseTime
    })

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    logger.error('Health check failed', { error })
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Detailed health check with authentication
 */
const detailedHealthCheck = withAuth(async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
  try {
    const startTime = Date.now()

    // Check if user is admin (only admins can access detailed health)
    if (user.role !== 'admin' && user.role !== 'super-admin') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 })
    }

    // Log health check access
    await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
      resource: 'system_health_detailed',
      action: 'health_check_detailed',
      severity: 'medium'
    })

    // Get comprehensive health status
    const healthStatus = await infrastructureMonitor.getHealthStatus()
    const systemMetrics = infrastructureMonitor.getSystemMetrics(5)
    const databaseMetrics = infrastructureMonitor.getDatabaseMetrics(5)
    const serviceHealth = infrastructureMonitor.getServiceHealth()
    const activeAlerts = infrastructureMonitor.getActiveAlerts()

    // Also perform database-specific health check
    const dbHealthResponse = await handleHealthCheck(request)
    const dbHealthData = await dbHealthResponse.json()

    const response = {
      status: healthStatus.overall,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      responseTime: Date.now() - startTime,
      checks: healthStatus.checks,
      systemMetrics: systemMetrics[systemMetrics.length - 1] || null,
      databaseMetrics: databaseMetrics[databaseMetrics.length - 1] || null,
      services: serviceHealth,
      alerts: {
        active: activeAlerts.length,
        details: activeAlerts
      },
      database: dbHealthData
    }

    const statusCode = healthStatus.overall === 'healthy' ? 200 :
                      healthStatus.overall === 'degraded' ? 200 : 503

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    logger.error('Detailed health check failed', { error, userId: user.id })

    await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'health_check_detailed'
    })

    return NextResponse.json(
      {
        status: 'error',
        success: false,
        error: 'Detailed health check failed'
      },
      { status: 500 }
    )
  }
})

// Liveness probe - basic check that the service is running
export async function HEAD(request: NextRequest) {
  try {
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}