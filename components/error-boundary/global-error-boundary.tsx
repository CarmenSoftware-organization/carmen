'use client'

import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  Wifi,
  Lock,
  Server,
  Clock,
  Shield,
  FileX,
  Zap
} from 'lucide-react'
import { errorManager, ErrorType, ErrorSeverity } from '@/lib/error/error-manager'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  resetQueries?: () => void
}

interface ErrorBoundaryConfig {
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolateFailure?: boolean
  showErrorDetails?: boolean
  allowReset?: boolean
  resetTimeout?: number
  context?: string
}

// Enhanced error fallback component
function EnhancedErrorFallback({ error, resetErrorBoundary, resetQueries }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const [isRetrying, setIsRetrying] = React.useState(false)

  // Convert to app error for better classification
  const appError = React.useMemo(() => {
    return errorManager.createError({
      message: error.message,
      details: { originalError: error.name, stack: error.stack }
    })
  }, [error])

  const getErrorInfo = () => {
    const errorType = appError.type
    const severity = appError.severity

    switch (errorType) {
      case ErrorType.NETWORK:
        return {
          icon: Wifi,
          title: 'Connection Problem',
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          canRetry: true
        }
      
      case ErrorType.AUTHENTICATION:
        return {
          icon: Lock,
          title: 'Authentication Required',
          description: 'Your session has expired. Please log in again to continue.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          canRetry: false
        }
      
      case ErrorType.AUTHORIZATION:
        return {
          icon: Shield,
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          canRetry: false
        }
      
      case ErrorType.SERVER:
        return {
          icon: Server,
          title: 'Server Error',
          description: 'Something went wrong on our servers. Our team has been notified.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          canRetry: true
        }
      
      case ErrorType.VALIDATION:
        return {
          icon: AlertTriangle,
          title: 'Validation Error',
          description: 'Please check your input and try again.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          canRetry: true
        }
      
      default:
        return {
          icon: severity === ErrorSeverity.CRITICAL ? Zap : Bug,
          title: severity === ErrorSeverity.CRITICAL ? 'Critical Error' : 'Something Went Wrong',
          description: error.message || 'An unexpected error occurred. Please try refreshing the page.',
          color: severity === ErrorSeverity.CRITICAL ? 'text-purple-600' : 'text-gray-600',
          bgColor: severity === ErrorSeverity.CRITICAL ? 'bg-purple-50' : 'bg-gray-50',
          borderColor: severity === ErrorSeverity.CRITICAL ? 'border-purple-200' : 'border-gray-200',
          canRetry: true
        }
    }
  }

  const errorInfo = getErrorInfo()
  const IconComponent = errorInfo.icon

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      // Reset React Query cache if available
      resetQueries?.()
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset error boundary
      resetErrorBoundary()
    } catch (retryError) {
      console.error('Retry failed:', retryError)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleReportError = () => {
    // Report error through error manager
    errorManager.handleError(appError, {
      showToast: false // Don't show toast since we're in fallback UI
    })
    
    // Show success feedback
    errorManager.showSuccess('Error reported successfully. Thank you for your feedback.')
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      handleGoHome()
    }
  }

  const getSeverityBadge = () => {
    const severity = appError.severity
    const severityConfig = {
      [ErrorSeverity.LOW]: { label: 'Low', className: 'bg-gray-100 text-gray-800' },
      [ErrorSeverity.MEDIUM]: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      [ErrorSeverity.HIGH]: { label: 'High', className: 'bg-orange-100 text-orange-800' },
      [ErrorSeverity.CRITICAL]: { label: 'Critical', className: 'bg-red-100 text-red-800' }
    }
    
    const config = severityConfig[severity]
    return (
      <Badge className={config.className}>
        {config.label} Priority
      </Badge>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <Card className={`w-full max-w-2xl mx-auto ${errorInfo.borderColor} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto w-16 h-16 ${errorInfo.bgColor} rounded-full flex items-center justify-center mb-6`}>
            <IconComponent className={`h-8 w-8 ${errorInfo.color}`} />
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
            {getSeverityBadge()}
          </div>
          
          <CardDescription className="text-base leading-relaxed">
            {errorInfo.description}
          </CardDescription>
          
          {retryCount > 0 && (
            <div className="mt-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Retry attempt {retryCount} - If the problem persists, please contact support.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error ID and timestamp for support */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-600">
              <div><strong>Error ID:</strong> {appError.id}</div>
              <div><strong>Time:</strong> {appError.timestamp.toLocaleString()}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(appError.id)}
            >
              Copy ID
            </Button>
          </div>

          {/* Error details toggle */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
              <Bug className="h-4 w-4" />
            </Button>
            
            {showDetails && (
              <Alert className="text-left">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-mono text-sm space-y-2">
                    <div><strong>Type:</strong> {appError.type}</div>
                    <div><strong>Message:</strong> {error.message}</div>
                    {error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {appError.context && (
                      <div>
                        <strong>Context:</strong>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(appError.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {/* Primary actions */}
            <div className="flex gap-3">
              {errorInfo.canRetry && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex-1"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
              )}
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
            
            {/* Secondary actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleGoHome}
                variant="ghost"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              
              <Button
                onClick={handleReportError}
                variant="ghost"
                className="flex-1"
              >
                <Bug className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>

          {/* Help text */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            If this problem continues, please contact our support team with the error ID above.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Minimal error fallback for critical failures
function MinimalErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <div className="space-y-2">
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Global Error Boundary component
export function GlobalErrorBoundary({
  children,
  config = {}
}: {
  children: React.ReactNode
  config?: ErrorBoundaryConfig
}) {
  const {
    fallback = EnhancedErrorFallback,
    onError,
    isolateFailure = false,
    showErrorDetails = process.env.NODE_ENV === 'development',
    allowReset = true,
    resetTimeout,
    context = 'Global'
  } = config

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Create app error for tracking
    const appError = errorManager.createError({
      message: error.message,
      type: ErrorType.CLIENT,
      severity: ErrorSeverity.HIGH,
      details: { 
        componentStack: errorInfo.componentStack,
        errorBoundary: context
      },
      context: {
        errorInfo,
        boundaryContext: context
      }
    })

    // Log error through error manager
    errorManager.handleError(appError, {
      showToast: false, // Don't show toast in error boundary
      showModal: false
    })

    // Call custom error handler if provided
    onError?.(error, errorInfo)

    console.error(`Error caught by ${context} Error Boundary:`, error, errorInfo)
  }

  if (isolateFailure) {
    // Return minimal fallback for isolated failures
    return (
      <ErrorBoundary
        FallbackComponent={MinimalErrorFallback}
        onError={handleError}
        onReset={() => {
          if (resetTimeout) {
            setTimeout(() => window.location.reload(), resetTimeout)
          }
        }}
      >
        {children}
      </ErrorBoundary>
    )
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQueries }) => (
        <ErrorBoundary
          FallbackComponent={(props) => 
            React.createElement(fallback, { ...props, resetQueries })
          }
          onError={handleError}
          onReset={resetQueries}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

// Specialized error boundaries for different app sections
export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary
      config={{
        context: 'Route',
        isolateFailure: false,
        allowReset: true
      }}
    >
      {children}
    </GlobalErrorBoundary>
  )
}

export function ComponentErrorBoundary({ 
  children, 
  componentName = 'Component' 
}: { 
  children: React.ReactNode
  componentName?: string 
}) {
  return (
    <GlobalErrorBoundary
      config={{
        context: `Component: ${componentName}`,
        isolateFailure: true,
        fallback: MinimalErrorFallback
      }}
    >
      {children}
    </GlobalErrorBoundary>
  )
}

export function CriticalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary
      config={{
        context: 'Critical System',
        isolateFailure: false,
        allowReset: false,
        onError: (error) => {
          // Critical errors might need special handling
          console.error('CRITICAL ERROR:', error)
          
          // Could send immediate alert to monitoring
          errorManager.handleError(
            errorManager.createError({
              message: error.message,
              type: ErrorType.CLIENT,
              severity: ErrorSeverity.CRITICAL
            })
          )
        }
      }}
    >
      {children}
    </GlobalErrorBoundary>
  )
}

export default GlobalErrorBoundary