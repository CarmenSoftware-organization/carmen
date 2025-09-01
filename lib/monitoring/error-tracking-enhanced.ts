/**
 * Error Tracking and Aggregation System for Carmen ERP
 * Provides comprehensive error handling, reporting, and analysis
 */

import { getMonitoringConfig } from './config'
import { logger } from './logger'
import React from 'react'

export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  component?: string
  action?: string
  url?: string
  userAgent?: string
  ip?: string
  timestamp: number
  environment: string
  version?: string
  buildId?: string
  additionalData?: Record<string, any>
}

export interface ErrorInfo {
  id: string
  name: string
  message: string
  stack?: string
  code?: string | number
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'frontend' | 'backend' | 'database' | 'external' | 'business' | 'security'
  fingerprint: string
  context: ErrorContext
  tags?: string[]
  breadcrumbs?: Breadcrumb[]
  user?: UserContext
  extra?: Record<string, any>
}

export interface Breadcrumb {
  timestamp: number
  message: string
  category: string
  level: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, any>
}

export interface UserContext {
  id?: string
  email?: string
  username?: string
  role?: string
  department?: string
  location?: string
}

export interface ErrorStats {
  totalErrors: number
  errorsByCategory: Record<string, number>
  errorsBySeverity: Record<string, number>
  topErrors: Array<{ fingerprint: string; count: number; lastSeen: number }>
  errorRate: number
  resolvedErrors: number
  activeErrors: number
}

class ErrorTracker {
  private errors: Map<string, ErrorInfo & { count: number; firstSeen: number; lastSeen: number }> = new Map()
  private breadcrumbs: Breadcrumb[] = []
  private config = getMonitoringConfig()
  private maxBreadcrumbs = 50
  private maxErrors = 10000

  constructor() {
    this.setupGlobalErrorHandlers()
    this.setupUnhandledRejectionHandler()
    this.setupBreadcrumbTracking()
  }

  private setupGlobalErrorHandlers() {
    if (typeof window !== 'undefined') {
      // Browser error handling
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          component: 'window',
          action: 'global-error',
          url: window.location.href,
          userAgent: navigator.userAgent,
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            component: 'window',
            action: 'unhandled-rejection',
            url: window.location.href,
            userAgent: navigator.userAgent,
          }
        )
      })
    }

    if (typeof process !== 'undefined') {
      // Node.js error handling
      process.on('uncaughtException', (error) => {
        this.captureError(error, {
          component: 'process',
          action: 'uncaught-exception',
          environment: process.env.NODE_ENV || 'development',
        })
      })

      process.on('unhandledRejection', (reason, promise) => {
        const error = reason instanceof Error ? reason : new Error(String(reason))
        this.captureError(error, {
          component: 'process',
          action: 'unhandled-rejection',
          environment: process.env.NODE_ENV || 'development',
          additionalData: { promise: String(promise) },
        })
      })
    }
  }

  private setupUnhandledRejectionHandler() {
    // Additional Promise rejection handling for better error tracking
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args)
          if (!response.ok) {
            this.captureError(new Error(`HTTP ${response.status}: ${response.statusText}`), {
              component: 'fetch',
              action: 'http-error',
              url: args[0]?.toString(),
              additionalData: {
                status: response.status,
                statusText: response.statusText,
              },
            })
          }
          return response
        } catch (error) {
          this.captureError(error as Error, {
            component: 'fetch',
            action: 'network-error',
            url: args[0]?.toString(),
          })
          throw error
        }
      }
    }
  }

  private setupBreadcrumbTracking() {
    // Track navigation breadcrumbs
    if (typeof window !== 'undefined') {
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function(...args) {
        errorTracker.addBreadcrumb({
          timestamp: Date.now(),
          message: 'Navigation',
          category: 'navigation',
          level: 'info',
          data: { url: args[2] },
        })
        return originalPushState.apply(history, args)
      }

      history.replaceState = function(...args) {
        errorTracker.addBreadcrumb({
          timestamp: Date.now(),
          message: 'Navigation (replace)',
          category: 'navigation',
          level: 'info',
          data: { url: args[2] },
        })
        return originalReplaceState.apply(history, args)
      }

      // Track clicks
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
          this.addBreadcrumb({
            timestamp: Date.now(),
            message: `Clicked ${target.tagName.toLowerCase()}`,
            category: 'ui',
            level: 'info',
            data: {
              text: target.textContent?.slice(0, 50),
              id: target.id,
              className: target.className,
            },
          })
        }
      })

      // Track form submissions
      document.addEventListener('submit', (event) => {
        const target = event.target as HTMLFormElement
        this.addBreadcrumb({
          timestamp: Date.now(),
          message: 'Form submitted',
          category: 'ui',
          level: 'info',
          data: {
            id: target.id,
            action: target.action,
            method: target.method,
          },
        })
      })
    }

    // Track console messages
    if (typeof console !== 'undefined') {
      const originalConsoleError = console.error
      console.error = (...args) => {
        this.addBreadcrumb({
          timestamp: Date.now(),
          message: 'Console error',
          category: 'console',
          level: 'error',
          data: { message: args.join(' ') },
        })
        originalConsoleError.apply(console, args)
      }
    }
  }

  /**
   * Capture an error with context
   */
  captureError(
    error: Error | string,
    context?: Partial<ErrorContext>,
    severity?: ErrorInfo['severity']
  ): string {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    const errorId = this.generateErrorId()
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      severity: severity || this.determineSeverity(errorObj),
      category: this.determineCategory(errorObj, context),
      fingerprint: this.generateFingerprint(errorObj, context),
      context: {
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version,
        buildId: process.env.VERCEL_GIT_COMMIT_SHA,
        ...context,
      },
      breadcrumbs: [...this.breadcrumbs],
      user: this.getCurrentUser(),
    }

    // Add tags based on error characteristics
    errorInfo.tags = this.generateTags(errorObj, errorInfo)

    // Store or update error
    this.storeError(errorInfo)

    // Log the error
    this.logError(errorInfo)

    // Send to external services
    this.sendToExternalServices(errorInfo)

    // Check if this triggers any alerts
    this.checkAlerts(errorInfo)

    return errorId
  }

  /**
   * Capture a business logic error
   */
  captureBusinessError(
    operation: string,
    error: Error | string,
    context: {
      module: string
      workflow?: string
      entityType?: string
      entityId?: string
      userId?: string
      metadata?: Record<string, any>
    }
  ): string {
    return this.captureError(error, {
      ...context.metadata,
      component: context.module,
      action: operation,
      userId: context.userId,
      additionalData: {
        businessContext: {
          module: context.module,
          workflow: context.workflow,
          entityType: context.entityType,
          entityId: context.entityId,
        },
      },
    }, 'high')
  }

  /**
   * Capture an API error
   */
  captureApiError(
    endpoint: string,
    error: Error | string,
    context: {
      method: string
      statusCode?: number
      responseTime?: number
      requestId?: string
      userId?: string
    }
  ): string {
    const severity = this.determineApiErrorSeverity(context.statusCode)
    
    return this.captureError(error, {
      component: 'api',
      action: `${context.method} ${endpoint}`,
      requestId: context.requestId,
      userId: context.userId,
      additionalData: {
        endpoint,
        method: context.method,
        statusCode: context.statusCode,
        responseTime: context.responseTime,
      },
    }, severity)
  }

  /**
   * Add a breadcrumb
   */
  addBreadcrumb(breadcrumb: Breadcrumb) {
    this.breadcrumbs.push(breadcrumb)
    
    // Maintain max breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs)
    }
  }

  /**
   * Set user context
   */
  setUser(user: UserContext) {
    this.addBreadcrumb({
      timestamp: Date.now(),
      message: 'User context updated',
      category: 'user',
      level: 'info',
      data: { userId: user.id, role: user.role },
    })
  }

  /**
   * Set additional context
   */
  setContext(key: string, value: any) {
    this.addBreadcrumb({
      timestamp: Date.now(),
      message: 'Context updated',
      category: 'context',
      level: 'debug',
      data: { [key]: value },
    })
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeframe?: number): ErrorStats {
    const now = Date.now()
    const cutoff = timeframe ? now - timeframe : 0
    
    const recentErrors = Array.from(this.errors.values())
      .filter(error => error.lastSeen >= cutoff)
    
    const totalErrors = recentErrors.reduce((sum, error) => sum + error.count, 0)
    
    const errorsByCategory: Record<string, number> = {}
    const errorsBySeverity: Record<string, number> = {}
    
    recentErrors.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + error.count
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + error.count
    })
    
    const topErrors = recentErrors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(error => ({
        fingerprint: error.fingerprint,
        count: error.count,
        lastSeen: error.lastSeen,
      }))
    
    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      topErrors,
      errorRate: this.calculateErrorRate(timeframe),
      resolvedErrors: 0, // Would be tracked separately
      activeErrors: recentErrors.length,
    }
  }

  /**
   * Get specific error details
   */
  getError(errorId: string) {
    return Array.from(this.errors.values())
      .find(error => error.id === errorId)
  }

  /**
   * Get errors by fingerprint
   */
  getErrorsByFingerprint(fingerprint: string) {
    return this.errors.get(fingerprint)
  }

  /**
   * Mark error as resolved
   */
  resolveError(fingerprint: string, resolution?: string) {
    const error = this.errors.get(fingerprint)
    if (error) {
      logger.info('Error resolved', {
        fingerprint,
        resolution,
        errorName: error.name,
        errorCount: error.count,
      })
    }
  }

  // Private helper methods

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFingerprint(error: Error, context?: Partial<ErrorContext>): string {
    const stackLines = error.stack?.split('\n').slice(0, 5) || []
    const key = `${error.name}:${error.message}:${stackLines.join('|')}:${context?.component || ''}`
    return this.hashString(key)
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private determineSeverity(error: Error): ErrorInfo['severity'] {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'medium'
    }
    
    // Authentication errors
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'high'
    }
    
    // Database errors
    if (error.message.includes('database') || error.message.includes('sql')) {
      return 'high'
    }
    
    // Security errors
    if (error.message.includes('security') || error.message.includes('csrf')) {
      return 'critical'
    }
    
    // Default
    return 'medium'
  }

  private determineCategory(
    error: Error,
    context?: Partial<ErrorContext>
  ): ErrorInfo['category'] {
    if (context?.component === 'api') return 'backend'
    if (context?.component === 'database') return 'database'
    if (error.message.includes('fetch') || error.message.includes('network')) return 'external'
    if (typeof window !== 'undefined') return 'frontend'
    return 'backend'
  }

  private determineApiErrorSeverity(statusCode?: number): ErrorInfo['severity'] {
    if (!statusCode) return 'medium'
    
    if (statusCode >= 500) return 'critical'
    if (statusCode >= 400) return 'medium'
    return 'low'
  }

  private generateTags(error: Error, errorInfo: ErrorInfo): string[] {
    const tags: string[] = []
    
    // Add severity tag
    tags.push(errorInfo.severity)
    
    // Add category tag
    tags.push(errorInfo.category)
    
    // Add error type tags
    if (error.name) tags.push(error.name.toLowerCase())
    
    // Add context-based tags
    if (errorInfo.context.component) tags.push(errorInfo.context.component)
    if (errorInfo.context.action) tags.push('action:' + errorInfo.context.action)
    
    // Add environment tag
    tags.push(errorInfo.context.environment)
    
    return tags
  }

  private storeError(errorInfo: ErrorInfo) {
    const existing = this.errors.get(errorInfo.fingerprint)
    
    if (existing) {
      // Update existing error
      existing.count++
      existing.lastSeen = errorInfo.context.timestamp
      existing.context = errorInfo.context // Update with latest context
    } else {
      // Store new error
      this.errors.set(errorInfo.fingerprint, {
        ...errorInfo,
        count: 1,
        firstSeen: errorInfo.context.timestamp,
        lastSeen: errorInfo.context.timestamp,
      })
    }
    
    // Prevent memory buildup
    if (this.errors.size > this.maxErrors) {
      const oldestErrors = Array.from(this.errors.entries())
        .sort(([, a], [, b]) => a.lastSeen - b.lastSeen)
        .slice(0, this.maxErrors / 2)
      
      oldestErrors.forEach(([fingerprint]) => {
        this.errors.delete(fingerprint)
      })
    }
  }

  private logError(errorInfo: ErrorInfo) {
    const logLevel = errorInfo.severity === 'critical' ? 'fatal' : 
                   errorInfo.severity === 'high' ? 'error' : 'warn'
    
    logger[logLevel](`Error captured: ${errorInfo.name}`, {
      errorId: errorInfo.id,
      fingerprint: errorInfo.fingerprint,
      message: errorInfo.message,
      category: errorInfo.category,
      severity: errorInfo.severity,
      component: errorInfo.context.component,
      action: errorInfo.context.action,
      userId: errorInfo.context.userId,
      tags: errorInfo.tags,
    })
  }

  private sendToExternalServices(errorInfo: ErrorInfo) {
    // Send to Sentry
    this.sendToSentry(errorInfo)
    
    // Send to other services
    this.sendToDatadog(errorInfo)
    this.sendToBugsnag(errorInfo)
  }

  private sendToSentry(errorInfo: ErrorInfo) {
    if (!process.env.SENTRY_DSN) return
    
    try {
      // Integration with Sentry SDK would go here
      // Sentry.captureException(new Error(errorInfo.message), {
      //   tags: errorInfo.tags,
      //   user: errorInfo.user,
      //   contexts: {
      //     error: errorInfo.context,
      //   },
      //   fingerprint: [errorInfo.fingerprint],
      // })
    } catch (error) {
      logger.warn('Failed to send error to Sentry', { error })
    }
  }

  private sendToDatadog(errorInfo: ErrorInfo) {
    if (!process.env.DD_API_KEY) return
    
    try {
      // Integration with Datadog would go here
    } catch (error) {
      logger.warn('Failed to send error to Datadog', { error })
    }
  }

  private sendToBugsnag(errorInfo: ErrorInfo) {
    if (!process.env.BUGSNAG_API_KEY) return
    
    try {
      // Integration with Bugsnag would go here
    } catch (error) {
      logger.warn('Failed to send error to Bugsnag', { error })
    }
  }

  private checkAlerts(errorInfo: ErrorInfo) {
    // Check if error rate exceeds threshold
    const errorRate = this.calculateErrorRate(300000) // 5 minutes
    
    if (errorRate > this.config.thresholds.errors.errorRate) {
      this.triggerAlert('high-error-rate', {
        currentRate: errorRate,
        threshold: this.config.thresholds.errors.errorRate,
        recentError: errorInfo,
      })
    }
    
    // Check for critical errors
    if (errorInfo.severity === 'critical') {
      this.triggerAlert('critical-error', {
        error: errorInfo,
      })
    }
    
    // Check for error spikes
    const errorCount = this.getErrorCount(60000) // 1 minute
    if (errorCount > this.config.thresholds.errors.criticalErrorThreshold) {
      this.triggerAlert('error-spike', {
        errorCount,
        threshold: this.config.thresholds.errors.criticalErrorThreshold,
        timeframe: '1 minute',
      })
    }
  }

  private triggerAlert(type: string, data: any) {
    logger.error(`Alert triggered: ${type}`, data)
    
    // Implementation for sending alerts would go here
    // This would integrate with notification systems
  }

  private calculateErrorRate(timeframe?: number): number {
    const now = Date.now()
    const cutoff = timeframe ? now - timeframe : 0
    
    const recentErrors = Array.from(this.errors.values())
      .filter(error => error.lastSeen >= cutoff)
    
    const totalErrors = recentErrors.reduce((sum, error) => sum + error.count, 0)
    const totalRequests = this.getTotalRequests(timeframe) // Would need to implement
    
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
  }

  private getErrorCount(timeframe: number): number {
    const now = Date.now()
    const cutoff = now - timeframe
    
    return Array.from(this.errors.values())
      .filter(error => error.lastSeen >= cutoff)
      .reduce((sum, error) => sum + error.count, 0)
  }

  private getTotalRequests(timeframe?: number): number {
    // This would integrate with request tracking
    // For now, return a placeholder
    return 1000
  }

  private getCurrentUser(): UserContext | undefined {
    // This would integrate with the user context system
    if (typeof window !== 'undefined' && (window as any).__CARMEN_USER__) {
      return (window as any).__CARMEN_USER__
    }
    return undefined
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker()

// React error boundary integration
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; errorInfo: any }>
    onError?: (error: Error, errorInfo: any) => void
  }>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const errorId = errorTracker.captureError(error, {
      component: 'error-boundary',
      action: 'component-error',
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    }, 'high')

    this.props.onError?.(error, { ...errorInfo, errorId })
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback
      if (Fallback) {
        return <Fallback error={this.state.error!} errorInfo={{}} />
      }
      
      return (
        <div className="error-boundary p-4 border border-red-500 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="text-red-600 mt-2">We've been notified of this error and are working to fix it.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-600">Error Details</summary>
              <pre className="mt-2 text-xs text-red-500 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// React hooks for error tracking
export function useErrorTracking(componentName: string) {
  const captureError = React.useCallback(
    (error: Error | string, context?: Record<string, any>) => {
      return errorTracker.captureError(error, {
        component: componentName,
        ...context,
      })
    },
    [componentName]
  )

  const captureBusinessError = React.useCallback(
    (
      operation: string,
      error: Error | string,
      context: {
        module: string
        workflow?: string
        entityType?: string
        entityId?: string
        metadata?: Record<string, any>
      }
    ) => {
      return errorTracker.captureBusinessError(operation, error, {
        ...context,
        metadata: {
          component: componentName,
          ...context.metadata,
        },
      })
    },
    [componentName]
  )

  return {
    captureError,
    captureBusinessError,
    addBreadcrumb: errorTracker.addBreadcrumb.bind(errorTracker),
  }
}

// Higher-order component for automatic error tracking
export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { captureError } = useErrorTracking(
      componentName || Component.displayName || Component.name || 'UnknownComponent'
    )

    React.useEffect(() => {
      const originalConsoleError = console.error
      console.error = (...args) => {
        if (args[0] instanceof Error) {
          captureError(args[0])
        }
        originalConsoleError.apply(console, args)
      }

      return () => {
        console.error = originalConsoleError
      }
    }, [captureError])

    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorTracking(${componentName || Component.displayName || Component.name})`
  return WrappedComponent
}