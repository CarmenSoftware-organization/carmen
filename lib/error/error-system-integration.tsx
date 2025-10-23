'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalErrorBoundary } from '@/components/error-boundary/global-error-boundary'
import { EnhancedToastProvider } from '@/components/ui/enhanced-toast'
import { errorManager } from '@/lib/error/error-manager'
import { apiClient } from '@/lib/api/api-client'
import { errorTracker } from '@/lib/monitoring/error-tracking'
import { AccessibleErrorBoundary } from '@/components/accessibility/accessible-error-handling'

// System-wide error handling configuration
export interface ErrorSystemConfig {
  enableErrorTracking?: boolean
  enablePerformanceMonitoring?: boolean
  environment?: 'development' | 'staging' | 'production'
  sentryDsn?: string
  errorSampleRate?: number
  toastPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  maxToasts?: number
  enableAccessibility?: boolean
  autoFocusErrors?: boolean
}

// Context for error system
interface ErrorSystemContextValue {
  reportError: (error: Error, context?: Record<string, any>) => void
  showSuccess: (message: string, options?: any) => void
  showWarning: (message: string, options?: any) => void
  showInfo: (message: string, options?: any) => void
  clearErrors: () => void
  isOnline: boolean
}

const ErrorSystemContext = React.createContext<ErrorSystemContextValue | null>(null)

// Main provider component that integrates all error handling systems
export function ErrorSystemProvider({
  children,
  config = {}
}: {
  children: React.ReactNode
  config?: ErrorSystemConfig
}) {
  const {
    enableErrorTracking = true,
    enablePerformanceMonitoring = true,
    environment = process.env.NODE_ENV as any || 'development',
    sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN,
    errorSampleRate = environment === 'production' ? 0.1 : 1.0,
    toastPosition = 'bottom-right',
    maxToasts = 5,
    enableAccessibility = true,
    autoFocusErrors = true
  } = config

  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const queryClient = React.useRef(new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Custom retry logic based on error type
          if (error?.status === 401 || error?.status === 403) {
            return false // Don't retry auth errors
          }
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
        onError: (error: any, variables, context) => {
          // Global mutation error handling
          errorManager.handleError(error, {
            showToast: true,
            showModal: false
          })
        }
      }
    }
  }))

  // Initialize error tracking
  React.useEffect(() => {
    if (enableErrorTracking) {
      errorTracker.configure({
        dsn: sentryDsn,
        environment,
        sampleRate: errorSampleRate,
        enablePerformanceMonitoring
      })

      // Set up user context (replace with your auth system)
      const setupUserContext = () => {
        try {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            const user = JSON.parse(userStr)
            errorTracker.setUser({
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              department: user.department
            })
          }
        } catch (e) {
          console.warn('Could not set up user context for error tracking')
        }
      }

      setupUserContext()

      // Set up global tags
      errorTracker.setTags({
        environment,
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        component: 'error-system'
      })
    }
  }, [enableErrorTracking, sentryDsn, environment, errorSampleRate, enablePerformanceMonitoring])

  // Set up network status monitoring
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Set up API client error interceptors
  React.useEffect(() => {
    const removeInterceptor = apiClient.addInterceptor({
      onError: async (error) => {
        // Enhanced error context for API errors
        const enhancedError = {
          ...error,
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }

        // Track API errors
        if (enableErrorTracking) {
          errorTracker.captureError(enhancedError, {
            api: true,
            endpoint: error.response?.url,
            statusCode: error.statusCode
          })
        }

        return enhancedError
      }
    })

    return removeInterceptor
  }, [enableErrorTracking])

  // Context value
  const contextValue: ErrorSystemContextValue = React.useMemo(() => ({
    reportError: (error: Error, context?: Record<string, any>) => {
      errorManager.handleError(error, {
        showToast: true,
        showModal: false
      })
      
      if (enableErrorTracking) {
        errorTracker.captureError(error, context)
      }
    },
    showSuccess: (message: string, options?: any) => {
      errorManager.showSuccess(message, options)
    },
    showWarning: (message: string, options?: any) => {
      errorManager.showWarning(message, options)
    },
    showInfo: (message: string, options?: any) => {
      errorManager.showInfo(message, options)
    },
    clearErrors: () => {
      errorManager.clearAllErrors()
    },
    isOnline
  }), [enableErrorTracking, isOnline])

  return (
    <ErrorSystemContext.Provider value={contextValue}>
      <TooltipProvider>
        <QueryClientProvider client={queryClient.current}>
          <EnhancedToastProvider 
            maxToasts={maxToasts}
            position={toastPosition}
          >
            <GlobalErrorBoundary
              config={{
                onError: (error, errorInfo) => {
                  // Global error boundary error handling
                  if (enableErrorTracking) {
                    errorTracker.captureError(error, {
                      errorBoundary: true,
                      componentStack: errorInfo.componentStack
                    })
                  }
                },
                showErrorDetails: environment === 'development'
              }}
            >
              {enableAccessibility ? (
                <AccessibleErrorBoundary 
                  showRecoveryOptions={true}
                  onError={(error, errorInfo) => {
                    if (enableErrorTracking) {
                      errorTracker.captureError(error, {
                        accessibilityBoundary: true,
                        componentStack: errorInfo.componentStack
                      })
                    }
                  }}
                >
                  {children}
                </AccessibleErrorBoundary>
              ) : (
                children
              )}
            </GlobalErrorBoundary>
          </EnhancedToastProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </ErrorSystemContext.Provider>
  )
}

// Hook to use the error system
export function useErrorSystem() {
  const context = React.useContext(ErrorSystemContext)
  if (!context) {
    throw new Error('useErrorSystem must be used within an ErrorSystemProvider')
  }
  return context
}

// Higher-order component for automatic error handling
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string
    fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>
    enableBoundary?: boolean
    enableAccessibility?: boolean
  } = {}
) {
  const {
    componentName = 'Unknown Component',
    fallbackComponent,
    enableBoundary = true,
    enableAccessibility = true
  } = options

  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    if (!enableBoundary) {
      return <Component {...props} ref={ref} />
    }

    return (
      <GlobalErrorBoundary
        config={{
          context: componentName,
          isolateFailure: true,
          fallback: fallbackComponent
        }}
      >
        {enableAccessibility ? (
          <AccessibleErrorBoundary>
            <Component {...props} ref={ref} />
          </AccessibleErrorBoundary>
        ) : (
          <Component {...props} ref={ref} />
        )}
      </GlobalErrorBoundary>
    )
  })

  WrappedComponent.displayName = `withErrorHandling(${componentName})`
  return WrappedComponent
}

// Utility hook for handling async operations with error handling
export function useAsyncError() {
  const { reportError, showSuccess } = useErrorSystem()

  const handleAsyncOperation = React.useCallback(async <T,>(
    operation: () => Promise<T>,
    options: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      showLoadingToast?: boolean
      showSuccessToast?: boolean
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
    } = {}
  ) => {
    const {
      loadingMessage = 'Processing...',
      successMessage = 'Operation completed successfully',
      errorMessage,
      showLoadingToast = false,
      showSuccessToast = true,
      onSuccess,
      onError
    } = options

    let loadingToastId: string | undefined

    try {
      if (showLoadingToast) {
        // This would need to be implemented in the enhanced toast system
        // loadingToastId = enhancedToast.loading(loadingMessage)
      }

      const result = await operation()

      if (loadingToastId) {
        // enhancedToast.dismiss(loadingToastId)
      }

      if (showSuccessToast) {
        showSuccess(successMessage)
      }

      onSuccess?.(result)
      return result
    } catch (error) {
      if (loadingToastId) {
        // enhancedToast.dismiss(loadingToastId)
      }

      const errorToReport = error instanceof Error ? error : new Error(String(error))
      
      reportError(errorToReport, {
        operation: 'async-operation',
        customMessage: errorMessage
      })

      onError?.(errorToReport)
      throw errorToReport
    }
  }, [reportError, showSuccess])

  return { handleAsyncOperation }
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<any>(null)

  React.useEffect(() => {
    const collectMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        setMetrics({
          navigation: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            loadComplete: navigation.loadEventEnd - navigation.navigationStart,
            firstByte: navigation.responseStart - navigation.requestStart
          },
          paint: paint.reduce((acc, entry) => {
            acc[entry.name] = entry.startTime
            return acc
          }, {} as Record<string, number>)
        })

        // Report performance metrics to tracking
        errorTracker.capturePerformanceMetrics()
      }
    }

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000)
      })
    }
  }, [])

  return metrics
}

// Example usage component
export function ErrorSystemExample() {
  const { reportError, showSuccess, showWarning, showInfo } = useErrorSystem()
  const { handleAsyncOperation } = useAsyncError()

  const handleTestError = () => {
    const error = new Error('This is a test error')
    reportError(error, { 
      testContext: true,
      timestamp: Date.now()
    })
  }

  const handleAsyncTest = async () => {
    await handleAsyncOperation(
      async () => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate random success/failure
        if (Math.random() > 0.5) {
          throw new Error('Random async error')
        }
        
        return 'Success!'
      },
      {
        loadingMessage: 'Testing async operation...',
        successMessage: 'Async operation completed!',
        showLoadingToast: true,
        onSuccess: (result) => {
          console.log('Async operation result:', result)
        }
      }
    )
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">Error System Testing</h2>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleTestError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Error
        </button>
        
        <button
          onClick={() => showSuccess('Test success message')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Success
        </button>
        
        <button
          onClick={() => showWarning('Test warning message')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Test Warning
        </button>
        
        <button
          onClick={() => showInfo('Test info message')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Info
        </button>
        
        <button
          onClick={handleAsyncTest}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Async Operation
        </button>
      </div>
    </div>
  )
}

export default ErrorSystemProvider