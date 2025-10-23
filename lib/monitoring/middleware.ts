/**
 * Monitoring Middleware for Carmen ERP
 * Integrates monitoring into Next.js middleware and API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { useEffect } from 'react'
import { performanceMonitor } from './performance'
import { businessMetricsTracker } from './business-metrics'
import { infrastructureMonitor } from './infrastructure-monitoring'
import { errorTracker } from './error-tracking'
import { logger } from './logger'
import { getMonitoringConfig } from './config'

export interface RequestContext {
  requestId: string
  userId?: string
  sessionId?: string
  userAgent?: string
  ip?: string
  method: string
  path: string
  query: Record<string, string>
  startTime: number
}

/**
 * Next.js middleware integration for request monitoring
 */
export function createMonitoringMiddleware() {
  return async (req: NextRequest) => {
    const config = getMonitoringConfig()
    
    if (!config.enabledServices.performanceMonitoring) {
      return NextResponse.next()
    }

    const startTime = Date.now()
    const requestId = generateRequestId()
    const path = req.nextUrl.pathname
    
    // Create request context
    const context: RequestContext = {
      requestId,
      method: req.method,
      path,
      query: Object.fromEntries(req.nextUrl.searchParams),
      startTime,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.ip || req.headers.get('x-forwarded-for') as string || undefined,
    }

    // Skip monitoring for certain paths
    if (shouldSkipPath(path)) {
      return NextResponse.next()
    }

    // Extract user ID from token/session if available
    try {
      context.userId = await extractUserId(req)
      context.sessionId = await extractSessionId(req)
    } catch (error) {
      // Continue without user context
    }

    // Start performance tracking
    const journeyId = performanceMonitor.startJourney('api_request', {
      method: req.method,
      path,
      userAgent: context.userAgent,
      ip: context.ip
    }, context.userId)

    // Track business event
    businessMetricsTracker.trackEvent(
      'api_request_started',
      'system',
      {
        method: req.method,
        path,
        query: context.query
      },
      {
        userId: context.userId,
        module: 'api'
      }
    )

    // Add request context to headers for downstream handlers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-request-id', requestId)
    requestHeaders.set('x-request-context', JSON.stringify(context))

    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })

    // Add monitoring headers to response
    response.headers.set('x-request-id', requestId)
    response.headers.set('x-response-time', (Date.now() - startTime).toString())
    
    // Complete performance tracking in background
    setImmediate(() => {
      const duration = Date.now() - startTime
      
      performanceMonitor.completeJourney(journeyId, 'completed')
      
      // Record API performance metric
      performanceMonitor.recordMetric({
        name: 'api_request_duration',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: {
          method: req.method,
          path,
          statusCode: response.status
        },
        tags: ['api', 'request']
      })

      // Track business metrics
      businessMetricsTracker.trackEvent(
        'api_request_completed',
        'system',
        {
          method: req.method,
          path,
          duration,
          statusCode: response.status,
          success: response.status < 400
        },
        {
          userId: context.userId,
          module: 'api'
        }
      )

      // Log API call
      logger.info(`API ${req.method} ${path}`, {
        requestId,
        userId: context.userId,
        duration,
        statusCode: response.status,
        userAgent: context.userAgent,
        ip: context.ip
      })
    })

    return response
  }
}

/**
 * API route wrapper for monitoring
 */
export function withMonitoring<T extends any[], R>(
  handler: (...args: T) => Promise<R> | R,
  options: {
    name?: string
    module?: string
    trackPerformance?: boolean
    trackBusinessMetrics?: boolean
  } = {}
) {
  return async (...args: T): Promise<R> => {
    const {
      name = 'api_handler',
      module = 'api',
      trackPerformance = true,
      trackBusinessMetrics = true
    } = options

    const startTime = Date.now()
    const requestId = generateRequestId()

    // Extract request context if available
    let context: Partial<RequestContext> = { requestId, startTime }
    
    if (args[0] && typeof args[0] === 'object' && args[0].headers) {
      const req = args[0] as any
      const contextHeader = req.headers.get?.('x-request-context') || req.headers['x-request-context']
      
      if (contextHeader) {
        try {
          context = { ...context, ...JSON.parse(contextHeader as string) }
        } catch (error) {
          logger.debug('Failed to parse request context', { error })
        }
      }
    }

    // Start performance tracking
    let journeyId: string | undefined
    if (trackPerformance) {
      journeyId = performanceMonitor.startJourney(`handler_${name}`, {
        handler: name,
        module,
        ...context
      }, context.userId)
    }

    // Track business event
    if (trackBusinessMetrics) {
      businessMetricsTracker.trackEvent(
        `${name}_started`,
        'system',
        { handler: name, ...context },
        { userId: context.userId, module }
      )
    }

    try {
      const result = await handler(...args)
      const duration = Date.now() - startTime

      // Complete performance tracking
      if (trackPerformance && journeyId) {
        performanceMonitor.completeJourney(journeyId, 'completed')
        
        performanceMonitor.recordMetric({
          name: `${name}_duration`,
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          context: { handler: name, module, ...context },
          tags: ['handler', module]
        })
      }

      // Track business metrics
      if (trackBusinessMetrics) {
        businessMetricsTracker.trackEvent(
          `${name}_completed`,
          'system',
          { handler: name, duration, success: true, ...context },
          { userId: context.userId, module }
        )
      }

      // Log successful execution
      logger.info(`Handler ${name} completed`, {
        requestId: context.requestId,
        userId: context.userId,
        duration,
        success: true
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Complete performance tracking with error
      if (trackPerformance && journeyId) {
        performanceMonitor.completeJourney(journeyId, 'failed')
      }

      // Track business metrics
      if (trackBusinessMetrics) {
        businessMetricsTracker.trackEvent(
          `${name}_failed`,
          'system',
          { 
            handler: name, 
            duration, 
            success: false, 
            error: error instanceof Error ? error.message : String(error),
            ...context 
          },
          { userId: context.userId, module }
        )
      }

      // Track error
      if (error instanceof Error) {
        errorTracker.captureError(error, {
          handler: name,
          module,
          duration,
          ...context
        })
      }

      // Log error
      logger.error(`Handler ${name} failed`, {
        requestId: context.requestId,
        userId: context.userId,
        duration,
        error,
        success: false
      })

      throw error
    }
  }
}

/**
 * Database operation monitoring wrapper
 */
export function withDatabaseMonitoring<T extends any[], R>(
  operation: (...args: T) => Promise<R> | R,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    
    try {
      const result = await operation(...args)
      const duration = Date.now() - startTime

      // Record database performance metric
      performanceMonitor.recordMetric({
        name: 'database_operation',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: {
          operation: operationName,
          success: true
        },
        tags: ['database', operationName]
      })

      // Check for slow queries
      if (duration > 1000) {
        logger.warn('Slow database query detected', {
          operation: operationName,
          duration,
          args: args.length
        })
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Record failed database operation
      performanceMonitor.recordMetric({
        name: 'database_operation_error',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: {
          operation: operationName,
          error: error instanceof Error ? error.message : String(error),
          success: false
        },
        tags: ['database', 'error', operationName]
      })

      logger.error('Database operation failed', {
        operation: operationName,
        duration,
        error
      })

      throw error
    }
  }
}

/**
 * Component performance monitoring hook
 */
export function useComponentMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    
    performanceMonitor.recordMetric({
      name: 'component_mount',
      value: performance.now() - startTime,
      unit: 'ms',
      timestamp: Date.now(),
      context: { component: componentName },
      tags: ['component', 'mount']
    })

    // Track feature usage
    businessMetricsTracker.trackFeatureUsage(componentName, 'ui')

    return () => {
      performanceMonitor.recordMetric({
        name: 'component_unmount',
        value: performance.now() - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        context: { component: componentName },
        tags: ['component', 'unmount']
      })
    }
  }, [componentName])

  return {
    trackInteraction: (action: string, metadata?: Record<string, any>) => {
      businessMetricsTracker.trackInteraction(action, componentName, {
        metadata,
        module: 'ui'
      })
    },
    trackError: (error: Error, context?: Record<string, any>) => {
      errorTracker.captureError(error, {
        component: componentName,
        ...context
      })
    }
  }
}

/**
 * Workflow monitoring utilities
 */
export class WorkflowMonitor {
  private workflowId: string
  private startTime: number

  constructor(workflowName: string, module: string, userId?: string) {
    this.workflowId = businessMetricsTracker.startWorkflow(workflowName, module, {
      userId,
      metadata: { startedAt: new Date().toISOString() }
    })
    this.startTime = Date.now()
  }

  addStep(stepName: string, data?: Record<string, any>) {
    businessMetricsTracker.addWorkflowStep(this.workflowId, stepName, data)
  }

  completeStep(stepName: string, status: 'completed' | 'skipped' | 'failed' = 'completed') {
    businessMetricsTracker.completeWorkflowStep(this.workflowId, stepName, status)
  }

  complete(status: 'completed' | 'abandoned' | 'failed' = 'completed') {
    businessMetricsTracker.completeWorkflow(this.workflowId, status)

    const duration = Date.now() - this.startTime
    logger.businessLog('workflow', 'execution', `workflow_${status}`, {
      duration,
      metadata: {
        workflowId: this.workflowId,
        completedAt: new Date().toISOString()
      }
    })
  }

  getWorkflowId(): string {
    return this.workflowId
  }
}

// Utility functions

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function shouldSkipPath(path: string): boolean {
  const skipPaths = [
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/health',
    '/metrics',
    '/static'
  ]
  
  return skipPaths.some(skipPath => path.startsWith(skipPath))
}

async function extractUserId(req: NextRequest): Promise<string | undefined> {
  try {
    // Extract from JWT token or session
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      // JWT token parsing would go here
      // const token = authHeader.substring(7)
      // return jwt.decode(token).sub
    }

    // Extract from session cookie
    const sessionCookie = req.cookies.get('session')
    if (sessionCookie) {
      // Session parsing would go here
      // return parseSession(sessionCookie.value).userId
    }

    return undefined
  } catch (error) {
    return undefined
  }
}

async function extractSessionId(req: NextRequest): Promise<string | undefined> {
  try {
    // Extract session ID from cookie or header
    const sessionId = req.headers.get('x-session-id') || 
                     req.cookies.get('session')?.value
    
    return sessionId || undefined
  } catch (error) {
    return undefined
  }
}

// Export monitoring instances for direct use
export {
  performanceMonitor,
  businessMetricsTracker,
  infrastructureMonitor,
  errorTracker,
  logger
}