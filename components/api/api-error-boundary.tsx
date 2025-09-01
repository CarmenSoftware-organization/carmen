'use client'

import React from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  Wifi,
  Lock,
  Server,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface ApiErrorInfo {
  statusCode?: number
  error?: string
  details?: Record<string, any>
  retry?: () => void
}

interface ApiErrorFallbackProps {
  error: Error & ApiErrorInfo
  resetErrorBoundary: () => void
}

function ApiErrorFallback({ error, resetErrorBoundary }: ApiErrorFallbackProps) {
  // Determine error type and appropriate response
  const getErrorInfo = () => {
    const statusCode = error.statusCode || 500
    
    switch (statusCode) {
      case 401:
        return {
          icon: Lock,
          title: 'Authentication Required',
          description: 'Your session has expired. Please log in again to continue.',
          action: 'Login',
          actionVariant: 'default' as const,
          showRetry: false,
          onAction: () => window.location.href = '/auth/login'
        }
      
      case 403:
        return {
          icon: Lock,
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
          action: 'Go Home',
          actionVariant: 'default' as const,
          showRetry: false,
          onAction: () => window.location.href = '/'
        }
      
      case 404:
        return {
          icon: AlertTriangle,
          title: 'Not Found',
          description: 'The requested resource could not be found.',
          action: 'Go Back',
          actionVariant: 'default' as const,
          showRetry: false,
          onAction: () => window.history.back()
        }
      
      case 408:
      case 504:
        return {
          icon: Clock,
          title: 'Request Timeout',
          description: 'The request took too long to complete. Please try again.',
          action: 'Retry',
          actionVariant: 'default' as const,
          showRetry: true,
          onAction: resetErrorBoundary
        }
      
      case 429:
        return {
          icon: Clock,
          title: 'Too Many Requests',
          description: 'You have made too many requests. Please wait and try again.',
          action: 'Retry',
          actionVariant: 'outline' as const,
          showRetry: true,
          onAction: resetErrorBoundary
        }
      
      case 500:
      case 502:
      case 503:
        return {
          icon: Server,
          title: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
          action: 'Retry',
          actionVariant: 'default' as const,
          showRetry: true,
          onAction: resetErrorBoundary
        }
      
      default:
        // Network or other errors
        if (error.message?.includes('fetch')) {
          return {
            icon: Wifi,
            title: 'Connection Error',
            description: 'Unable to connect to the server. Please check your internet connection.',
            action: 'Retry',
            actionVariant: 'default' as const,
            showRetry: true,
            onAction: resetErrorBoundary
          }
        }
        
        return {
          icon: Bug,
          title: 'Something Went Wrong',
          description: error.message || 'An unexpected error occurred.',
          action: 'Try Again',
          actionVariant: 'default' as const,
          showRetry: true,
          onAction: resetErrorBoundary
        }
    }
  }

  const errorInfo = getErrorInfo()
  const IconComponent = errorInfo.icon

  const handleReportError = () => {
    // Log error for monitoring
    console.error('API Error:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
      details: error.details,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    
    toast.success('Error reported to our team')
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
          <CardDescription className="text-base">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error details for debugging */}
          {process.env.NODE_ENV === 'development' && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <div className="font-mono text-sm">
                  <div><strong>Status:</strong> {error.statusCode || 'Unknown'}</div>
                  <div><strong>Error:</strong> {error.error || error.message}</div>
                  {error.details && (
                    <div><strong>Details:</strong> {JSON.stringify(error.details, null, 2)}</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col gap-2">
            {/* Primary action */}
            <Button
              onClick={errorInfo.onAction}
              variant={errorInfo.actionVariant}
              className="w-full"
            >
              {errorInfo.action}
            </Button>
            
            {/* Retry button */}
            {errorInfo.showRetry && (
              <Button
                onClick={resetErrorBoundary}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {/* Go home */}
            <Button
              onClick={() => window.location.href = '/'}
              variant="ghost"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          {/* Report error button */}
          <div className="pt-2 border-t">
            <Button
              onClick={handleReportError}
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              <Bug className="h-3 w-3 mr-2" />
              Report this issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ApiErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ApiErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export function ApiErrorBoundary({ 
  children, 
  fallback = ApiErrorFallback,
  onError 
}: ApiErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={fallback}
          onReset={reset}
          onError={(error, errorInfo) => {
            // Log error for monitoring
            console.error('API Error Boundary:', error, errorInfo)
            
            // Call custom error handler if provided
            onError?.(error, errorInfo)
            
            // Report to error tracking service
            // reportError(error, errorInfo)
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

// Specialized error boundaries for different contexts
export function VendorErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ApiErrorBoundary
      onError={(error) => {
        console.error('Vendor API Error:', error)
        // Could send to specific vendor error tracking
      }}
    >
      {children}
    </ApiErrorBoundary>
  )
}

export function ProductErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ApiErrorBoundary
      onError={(error) => {
        console.error('Product API Error:', error)
        // Could send to specific product error tracking
      }}
    >
      {children}
    </ApiErrorBoundary>
  )
}

export function ProcurementErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ApiErrorBoundary
      onError={(error) => {
        console.error('Procurement API Error:', error)
        // Could send to specific procurement error tracking
      }}
    >
      {children}
    </ApiErrorBoundary>
  )
}

export default ApiErrorBoundary