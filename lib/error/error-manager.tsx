'use client'

import { toast } from '@/hooks/use-toast'

// Error types classification
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
  BUSINESS_RULE = 'BUSINESS_RULE'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Enhanced error interface
export interface AppError extends Error {
  id: string
  type: ErrorType
  severity: ErrorSeverity
  statusCode?: number
  details?: Record<string, any>
  context?: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  retryable?: boolean
  maxRetries?: number
  currentRetries?: number
}

// Error recovery actions
export interface ErrorRecoveryAction {
  label: string
  action: () => void | Promise<void>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  isPrimary?: boolean
}

// Error display configuration
export interface ErrorDisplayConfig {
  showToast?: boolean
  showModal?: boolean
  showInline?: boolean
  autoHide?: boolean
  hideAfter?: number
  showRetry?: boolean
  showDetails?: boolean
  recoveryActions?: ErrorRecoveryAction[]
}

// Error reporting interface
export interface ErrorReport {
  error: AppError
  stackTrace: string
  userFeedback?: string
  reproductionSteps?: string[]
  browserInfo: {
    userAgent: string
    language: string
    platform: string
    cookieEnabled: boolean
    onlineStatus: boolean
  }
  performanceInfo?: {
    memory?: any
    timing?: PerformanceTiming
    connection?: any
  }
}

class ErrorManager {
  private errors: Map<string, AppError> = new Map()
  private errorListeners: Array<(error: AppError) => void> = []
  private recoveryStrategies: Map<ErrorType, (error: AppError) => void> = new Map()

  constructor() {
    this.setupGlobalErrorHandling()
    this.setupDefaultRecoveryStrategies()
  }

  // Create standardized application error
  createError({
    message,
    type = ErrorType.UNKNOWN,
    severity = ErrorSeverity.MEDIUM,
    statusCode,
    details,
    context,
    retryable = false,
    maxRetries = 3
  }: {
    message: string
    type?: ErrorType
    severity?: ErrorSeverity
    statusCode?: number
    details?: Record<string, any>
    context?: Record<string, any>
    retryable?: boolean
    maxRetries?: number
  }): AppError {
    const error: AppError = {
      id: this.generateErrorId(),
      name: 'AppError',
      message,
      type,
      severity,
      statusCode,
      details,
      context,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryable,
      maxRetries,
      currentRetries: 0
    }

    // Add stack trace for debugging
    Error.captureStackTrace?.(error, this.createError)

    this.errors.set(error.id, error)
    return error
  }

  // Handle error with appropriate user feedback
  handleError(
    error: Error | AppError,
    config: ErrorDisplayConfig = {}
  ): void {
    const appError = this.ensureAppError(error)
    
    // Store error
    this.errors.set(appError.id, appError)

    // Notify listeners
    this.notifyListeners(appError)

    // Apply recovery strategy
    this.applyRecoveryStrategy(appError)

    // Display error to user
    this.displayError(appError, config)

    // Report error for monitoring
    this.reportError(appError)
  }

  // Convert regular Error to AppError
  private ensureAppError(error: Error | AppError): AppError {
    if (this.isAppError(error)) {
      return error
    }

    return this.createError({
      message: error.message,
      type: this.classifyError(error),
      severity: this.determineSeverity(error),
      details: { originalError: error.name },
      retryable: this.isRetryable(error)
    })
  }

  // Display error to user based on configuration
  private displayError(error: AppError, config: ErrorDisplayConfig): void {
    const {
      showToast = true,
      showModal = false,
      showInline = false,
      autoHide = true,
      hideAfter = 5000,
      showRetry = error.retryable,
      showDetails = process.env.NODE_ENV === 'development',
      recoveryActions = []
    } = config

    if (showToast) {
      this.showToastError(error, { autoHide, hideAfter, showRetry: showRetry ?? false, recoveryActions })
    }

    if (showModal) {
      this.showModalError(error, { showDetails, recoveryActions })
    }

    if (showInline) {
      // Inline errors are handled by individual components
      this.emitInlineError(error)
    }
  }

  // Show toast notification for error
  private showToastError(
    error: AppError, 
    options: { 
      autoHide: boolean
      hideAfter: number
      showRetry: boolean
      recoveryActions: ErrorRecoveryAction[]
    }
  ): void {
    const { message, severity, type } = error
    const { autoHide, hideAfter, showRetry, recoveryActions } = options

    // Determine toast variant based on severity
    const variant = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH 
      ? 'destructive' 
      : 'default'

    toast({
      title: this.getErrorTitle(type, severity),
      description: message,
      variant,
      duration: autoHide ? hideAfter : Infinity,
      action: showRetry || recoveryActions.length > 0 ? (
        <div className="flex gap-2">
          {showRetry && (
            <button
              onClick={() => this.retryError(error)}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Retry
            </button>
          )}
          {recoveryActions.filter(action => action.isPrimary).slice(0, 1).map(action => (
            <button
              key={action.label}
              onClick={() => action.action()}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : undefined
    })
  }

  // Show modal error (to be implemented with Modal component)
  private showModalError(
    error: AppError, 
    options: { showDetails: boolean; recoveryActions: ErrorRecoveryAction[] }
  ): void {
    // Emit event for modal error display
    window.dispatchEvent(new CustomEvent('show-error-modal', {
      detail: { error, options }
    }))
  }

  // Emit inline error for component-level handling
  private emitInlineError(error: AppError): void {
    window.dispatchEvent(new CustomEvent('inline-error', {
      detail: { error }
    }))
  }

  // Retry error handling
  private retryError(error: AppError): void {
    if (!error.retryable || !error.maxRetries) {
      return
    }

    if (error.currentRetries! >= error.maxRetries) {
      toast({
        title: 'Max retries reached',
        description: 'Unable to complete the operation after multiple attempts.',
        variant: 'destructive'
      })
      return
    }

    // Increment retry count
    error.currentRetries = (error.currentRetries || 0) + 1

    // Apply backoff delay
    const delay = Math.min(1000 * Math.pow(2, error.currentRetries - 1), 30000)
    
    setTimeout(() => {
      // Emit retry event
      window.dispatchEvent(new CustomEvent('error-retry', {
        detail: { error }
      }))
    }, delay)

    toast({
      title: 'Retrying...',
      description: `Attempt ${error.currentRetries} of ${error.maxRetries}`,
      duration: 2000
    })
  }

  // Report error to monitoring service
  private reportError(error: AppError): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', {
        error,
        stackTrace: error.stack,
        context: error.context
      })
      return
    }

    // In production, send to error tracking service
    const report: ErrorReport = {
      error,
      stackTrace: error.stack || '',
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
      },
      performanceInfo: this.getPerformanceInfo()
    }

    // Send to error tracking service (Sentry, LogRocket, etc.)
    this.sendErrorReport(report)
  }

  // Classify error type
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorType.AUTHENTICATION
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorType.AUTHORIZATION
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION
    }
    
    if (message.includes('server') || message.includes('500')) {
      return ErrorType.SERVER
    }
    
    return ErrorType.CLIENT
  }

  // Determine error severity
  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase()
    
    if (message.includes('critical') || message.includes('fatal')) {
      return ErrorSeverity.CRITICAL
    }
    
    if (message.includes('auth') || message.includes('security')) {
      return ErrorSeverity.HIGH
    }
    
    if (message.includes('validation') || message.includes('network')) {
      return ErrorSeverity.MEDIUM
    }
    
    return ErrorSeverity.LOW
  }

  // Check if error is retryable
  private isRetryable(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    // Network errors are typically retryable
    if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
      return true
    }
    
    // Server errors (5xx) are retryable
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return true
    }
    
    // Rate limiting is retryable
    if (message.includes('429')) {
      return true
    }
    
    return false
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get current user ID (implement based on your auth system)
  private getCurrentUserId(): string | undefined {
    // TODO: Implement user ID retrieval from auth context
    return undefined
  }

  // Get session ID
  private getSessionId(): string {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  // Setup global error handling
  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        this.createError({
          message: event.reason?.message || 'Unhandled promise rejection',
          type: ErrorType.CLIENT,
          severity: ErrorSeverity.HIGH,
          details: { reason: event.reason }
        })
      )
    })

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(
        this.createError({
          message: event.error?.message || 'Global error',
          type: ErrorType.CLIENT,
          severity: ErrorSeverity.MEDIUM,
          details: { 
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        })
      )
    })
  }

  // Setup default recovery strategies
  private setupDefaultRecoveryStrategies(): void {
    // Authentication errors - redirect to login
    this.recoveryStrategies.set(ErrorType.AUTHENTICATION, (error) => {
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)
    })

    // Network errors - show offline indicator
    this.recoveryStrategies.set(ErrorType.NETWORK, (error) => {
      // Could show offline banner or retry mechanism
      console.log('Network error recovery strategy applied')
    })
  }

  // Apply recovery strategy
  private applyRecoveryStrategy(error: AppError): void {
    const strategy = this.recoveryStrategies.get(error.type)
    if (strategy) {
      try {
        strategy(error)
      } catch (strategyError) {
        console.error('Recovery strategy failed:', strategyError)
      }
    }
  }

  // Get error title based on type and severity
  private getErrorTitle(type: ErrorType, severity: ErrorSeverity): string {
    if (severity === ErrorSeverity.CRITICAL) {
      return 'Critical Error'
    }
    
    switch (type) {
      case ErrorType.NETWORK:
        return 'Connection Error'
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required'
      case ErrorType.AUTHORIZATION:
        return 'Access Denied'
      case ErrorType.VALIDATION:
        return 'Validation Error'
      case ErrorType.SERVER:
        return 'Server Error'
      case ErrorType.BUSINESS_RULE:
        return 'Business Rule Violation'
      default:
        return 'Error'
    }
  }

  // Utility methods
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'id' in error && 'type' in error
  }

  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        console.error('Error listener failed:', listenerError)
      }
    })
  }

  private getPerformanceInfo(): any {
    try {
      return {
        memory: (performance as any).memory,
        timing: performance.timing,
        connection: (navigator as any).connection
      }
    } catch {
      return undefined
    }
  }

  private sendErrorReport(report: ErrorReport): void {
    // TODO: Implement error reporting to external service
    // Example: Sentry, LogRocket, custom endpoint, etc.
    console.log('Error report would be sent:', report)
  }

  // Public methods for external use
  public addErrorListener(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener)
    return () => {
      const index = this.errorListeners.indexOf(listener)
      if (index > -1) {
        this.errorListeners.splice(index, 1)
      }
    }
  }

  public getError(id: string): AppError | undefined {
    return this.errors.get(id)
  }

  public getAllErrors(): AppError[] {
    return Array.from(this.errors.values())
  }

  public clearError(id: string): void {
    this.errors.delete(id)
  }

  public clearAllErrors(): void {
    this.errors.clear()
  }

  // Success feedback
  public showSuccess(message: string, options?: { duration?: number; action?: ErrorRecoveryAction }): void {
    toast({
      title: 'Success',
      description: message,
      duration: options?.duration || 3000,
      className: 'border-green-200 bg-green-50 text-green-900',
      action: options?.action ? (
        <button
          onClick={() => options.action!.action()}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {options.action.label}
        </button>
      ) : undefined
    })
  }

  // Warning feedback
  public showWarning(message: string, options?: { duration?: number; actions?: ErrorRecoveryAction[] }): void {
    toast({
      title: 'Warning',
      description: message,
      duration: options?.duration || 4000,
      className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      action: options?.actions && options.actions.length > 0 ? (
        <div className="flex gap-2">
          {options.actions.slice(0, 2).map(action => (
            <button
              key={action.label}
              onClick={() => action.action()}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : undefined
    })
  }

  // Info feedback
  public showInfo(message: string, options?: { duration?: number }): void {
    toast({
      title: 'Information',
      description: message,
      duration: options?.duration || 3000,
      className: 'border-blue-200 bg-blue-50 text-blue-900'
    })
  }
}

// Export singleton instance
export const errorManager = new ErrorManager()

// Export convenience functions
export const handleError = (error: Error | AppError, config?: ErrorDisplayConfig) => 
  errorManager.handleError(error, config)

export const createError = (options: Parameters<typeof errorManager.createError>[0]) => 
  errorManager.createError(options)

export const showSuccess = (message: string, options?: Parameters<typeof errorManager.showSuccess>[1]) => 
  errorManager.showSuccess(message, options)

export const showWarning = (message: string, options?: Parameters<typeof errorManager.showWarning>[1]) => 
  errorManager.showWarning(message, options)

export const showInfo = (message: string, options?: Parameters<typeof errorManager.showInfo>[1]) => 
  errorManager.showInfo(message, options)