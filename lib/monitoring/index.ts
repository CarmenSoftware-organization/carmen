/**
 * Carmen ERP Monitoring System
 * Comprehensive monitoring, observability, and alerting system
 */

// Configuration
export { 
  getMonitoringConfig,
  serviceConfigs,
  businessMetricsConfig,
  type MonitoringConfig
} from './config'

// Core monitoring services
export { 
  performanceMonitor,
  usePerformanceTracking,
  createPerformanceMiddleware
} from './performance'

export { 
  businessMetricsTracker,
  useBusinessMetrics,
  withBusinessMetrics,
  type BusinessEvent,
  type UserSession,
  type WorkflowExecution,
  type KPI,
  type FeatureUsage,
  type BusinessMetricsData
} from './business-metrics'

export { 
  logger,
  createRequestLogger,
  createComponentLogger,
  createBusinessLogger,
  loggedFunction,
  useLogger,
  type LogLevel,
  type LogEntry,
  type LoggerConfig
} from './logger'

export { 
  errorTracker,
  ErrorTrackingService,
  type ErrorEvent,
  type UserContext,
  type PerformanceMetrics
} from './error-tracking'

export { 
  infrastructureMonitor,
  createHealthCheckHandler,
  createMetricsHandler,
  type HealthCheckResult,
  type SystemMetrics,
  type DatabaseMetrics,
  type ServiceHealthStatus,
  type AlertRule
} from './infrastructure-monitoring'

export { 
  alertManager,
  createAlert,
  resolveAlert,
  acknowledgeAlert,
  type Alert,
  type NotificationChannel,
  type EscalationPolicy,
  type Silence
} from './alert-manager'

// Middleware and integrations
export { 
  createMonitoringMiddleware,
  withMonitoring,
  withDatabaseMonitoring,
  useComponentMonitoring,
  WorkflowMonitor,
  type RequestContext
} from './middleware'

export { 
  MonitoringProvider,
  useMonitoring,
  withMonitoring as withMonitoringHOC,
  usePageTracking,
  useWorkflowTracking,
  useErrorBoundary
} from './monitoring-provider'

// Utility functions
export function initializeMonitoring(config: {
  userId?: string
  userEmail?: string
  userRole?: string
  environment?: string
  enabledServices?: {
    performanceMonitoring?: boolean
    errorTracking?: boolean
    businessMetrics?: boolean
    infrastructureMonitoring?: boolean
  }
}) {
  const {
    userId,
    userEmail,
    userRole,
    environment = 'development',
    enabledServices = {
      performanceMonitoring: true,
      errorTracking: true,
      businessMetrics: true,
      infrastructureMonitoring: true
    }
  } = config

  // Set user context for error tracking
  if (enabledServices.errorTracking && userId) {
    errorTracker.setUser({
      id: userId,
      email: userEmail,
      username: userEmail,
      role: userRole
    })

    // Set environment context
    errorTracker.setTag('environment', environment)
  }

  // Log initialization
  logger.info('Monitoring system initialized', {
    userId,
    environment,
    enabledServices,
    timestamp: new Date().toISOString()
  })

  return {
    performanceMonitor,
    businessMetricsTracker,
    errorTracker,
    infrastructureMonitor,
    alertManager,
    logger
  }
}

// Quick setup for common use cases
export function setupBasicMonitoring() {
  return initializeMonitoring({
    enabledServices: {
      performanceMonitoring: true,
      errorTracking: true,
      businessMetrics: false,
      infrastructureMonitoring: false
    }
  })
}

export function setupProductionMonitoring(config: {
  userId?: string
  userEmail?: string
  userRole?: string
}) {
  return initializeMonitoring({
    ...config,
    environment: 'production',
    enabledServices: {
      performanceMonitoring: true,
      errorTracking: true,
      businessMetrics: true,
      infrastructureMonitoring: true
    }
  })
}

// Health check utilities
export async function getSystemHealth() {
  try {
    const healthStatus = await infrastructureMonitor.getHealthStatus()
    const systemMetrics = infrastructureMonitor.getSystemMetrics(1)
    const activeAlerts = infrastructureMonitor.getActiveAlerts()
    
    return {
      status: healthStatus.overall,
      checks: healthStatus.checks,
      systemMetrics: systemMetrics[0] || null,
      alerts: activeAlerts.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    logger.error('Failed to get system health', { error })
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Performance utilities
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  context?: Record<string, any>
): T | Promise<T> {
  if (fn.constructor.name === 'AsyncFunction') {
    return performanceMonitor.measureAsync(name, fn as () => Promise<T>, context)
  } else {
    const startTime = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - startTime
      
      performanceMonitor.recordMetric({
        name: `sync_operation_${name}`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context,
        tags: ['sync', 'operation', 'success']
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      performanceMonitor.recordMetric({
        name: `sync_operation_${name}`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: { ...context, error: String(error) },
        tags: ['sync', 'operation', 'error']
      })
      
      throw error
    }
  }
}

// Business metrics utilities
export function trackUserJourney(journeyName: string, steps: string[], userId?: string) {
  const workflowId = businessMetricsTracker.startWorkflow(journeyName, 'user-journey', {
    userId,
    metadata: { plannedSteps: steps }
  })

  let currentStepIndex = 0

  return {
    nextStep: (data?: Record<string, any>) => {
      if (currentStepIndex > 0) {
        businessMetricsTracker.completeWorkflowStep(
          workflowId, 
          steps[currentStepIndex - 1], 
          'completed'
        )
      }
      
      if (currentStepIndex < steps.length) {
        businessMetricsTracker.addWorkflowStep(workflowId, steps[currentStepIndex], data)
        currentStepIndex++
      }
    },
    skipStep: (reason?: string) => {
      if (currentStepIndex > 0) {
        businessMetricsTracker.completeWorkflowStep(
          workflowId, 
          steps[currentStepIndex - 1], 
          'skipped'
        )
        currentStepIndex++
      }
    },
    failStep: (error: string) => {
      if (currentStepIndex > 0) {
        businessMetricsTracker.completeWorkflowStep(
          workflowId, 
          steps[currentStepIndex - 1], 
          'failed'
        )
      }
      businessMetricsTracker.completeWorkflow(workflowId, 'failed')
    },
    complete: () => {
      if (currentStepIndex > 0) {
        businessMetricsTracker.completeWorkflowStep(
          workflowId, 
          steps[currentStepIndex - 1], 
          'completed'
        )
      }
      businessMetricsTracker.completeWorkflow(workflowId, 'completed')
    },
    abandon: () => {
      businessMetricsTracker.completeWorkflow(workflowId, 'abandoned')
    }
  }
}

// Alert utilities
export function createSystemAlert(
  metric: string,
  currentValue: number,
  threshold: number,
  severity: 'critical' | 'warning' | 'info' = 'warning'
) {
  return createAlert(
    `${metric} threshold exceeded`,
    `${metric} is ${currentValue}, which exceeds the threshold of ${threshold}`,
    severity,
    'system-monitor',
    metric,
    currentValue,
    threshold,
    { metric, source: 'automated' }
  )
}

// Export types for consumers
export type {
  MonitoringConfig,
  BusinessEvent,
  UserSession,
  WorkflowExecution,
  KPI,
  FeatureUsage,
  BusinessMetricsData,
  LogLevel,
  LogEntry,
  LoggerConfig,
  ErrorEvent,
  UserContext,
  PerformanceMetrics,
  HealthCheckResult,
  SystemMetrics,
  DatabaseMetrics,
  ServiceHealthStatus,
  AlertRule,
  Alert,
  NotificationChannel,
  EscalationPolicy,
  Silence,
  RequestContext
}