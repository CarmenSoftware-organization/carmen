'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  X,
  ArrowRight,
  Loader2
} from 'lucide-react'

// ARIA live region types
type LiveRegionPoliteness = 'polite' | 'assertive' | 'off'

// Accessible error announcement hook
export function useErrorAnnouncement() {
  const announceError = React.useCallback((
    message: string,
    politeness: LiveRegionPoliteness = 'polite'
  ) => {
    // Create temporary live region for screen reader announcement
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', politeness)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('class', 'sr-only')
    liveRegion.textContent = message

    document.body.appendChild(liveRegion)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
  }, [])

  const announceSuccess = React.useCallback((message: string) => {
    announceError(`Success: ${message}`, 'polite')
  }, [announceError])

  const announceWarning = React.useCallback((message: string) => {
    announceError(`Warning: ${message}`, 'polite')
  }, [announceError])

  const announceCriticalError = React.useCallback((message: string) => {
    announceError(`Critical Error: ${message}`, 'assertive')
  }, [announceError])

  return {
    announceError,
    announceSuccess,
    announceWarning,
    announceCriticalError
  }
}

// Accessible error message component
interface AccessibleErrorMessageProps {
  id?: string
  title?: string
  message: string
  type?: 'error' | 'warning' | 'success' | 'info'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  showIcon?: boolean
  dismissible?: boolean
  onDismiss?: () => void
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline'
    disabled?: boolean
  }>
  className?: string
  autoFocus?: boolean
  announceOnMount?: boolean
}

export function AccessibleErrorMessage({
  id,
  title,
  message,
  type = 'error',
  severity = 'medium',
  showIcon = true,
  dismissible = false,
  onDismiss,
  actions = [],
  className,
  autoFocus = false,
  announceOnMount = true
}: AccessibleErrorMessageProps) {
  const { announceError, announceSuccess, announceWarning, announceCriticalError } = useErrorAnnouncement()
  const errorRef = React.useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = React.useState(true)

  // Announce error on mount
  React.useEffect(() => {
    if (announceOnMount && isVisible) {
      const announcement = title ? `${title}: ${message}` : message
      
      switch (type) {
        case 'success':
          announceSuccess(announcement)
          break
        case 'warning':
          announceWarning(announcement)
          break
        case 'error':
          if (severity === 'critical' || severity === 'high') {
            announceCriticalError(announcement)
          } else {
            announceError(announcement)
          }
          break
        default:
          announceError(announcement, 'polite')
      }
    }
  }, [
    announceOnMount, isVisible, title, message, type, severity,
    announceError, announceSuccess, announceWarning, announceCriticalError
  ])

  // Auto-focus for critical errors
  React.useEffect(() => {
    if (autoFocus && errorRef.current && isVisible) {
      errorRef.current.focus()
    }
  }, [autoFocus, isVisible])

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          className: 'border-green-200 bg-green-50 text-green-800',
          iconClassName: 'text-green-600',
          role: 'status'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
          iconClassName: 'text-yellow-600',
          role: 'alert'
        }
      case 'info':
        return {
          icon: Info,
          className: 'border-blue-200 bg-blue-50 text-blue-800',
          iconClassName: 'text-blue-600',
          role: 'status'
        }
      case 'error':
      default:
        return {
          icon: AlertCircle,
          className: 'border-red-200 bg-red-50 text-red-800',
          iconClassName: 'text-red-600',
          role: severity === 'critical' || severity === 'high' ? 'alert' : 'status'
        }
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
    announceError('Error message dismissed', 'polite')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && dismissible) {
      handleDismiss()
    }
  }

  if (!isVisible) return null

  const config = getTypeConfig()
  const IconComponent = config.icon

  return (
    <Alert
      ref={errorRef}
      id={id}
      role={config.role}
      aria-live={type === 'error' && (severity === 'critical' || severity === 'high') ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={autoFocus ? -1 : undefined}
      className={cn(
        config.className,
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        type === 'error' && 'focus:ring-red-500',
        type === 'success' && 'focus:ring-green-500',
        type === 'warning' && 'focus:ring-yellow-500',
        type === 'info' && 'focus:ring-blue-500',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {showIcon && (
            <IconComponent 
              className={cn('h-5 w-5 mt-0.5', config.iconClassName)}
              aria-hidden="true"
            />
          )}
          
          <div className="flex-1 min-w-0">
            {title && (
              <AlertTitle className="text-sm font-semibold mb-1">
                {title}
              </AlertTitle>
            )}
            
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="h-8 px-3 text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100 ml-2"
            onClick={handleDismiss}
            aria-label="Dismiss error message"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  )
}

// Accessible error boundary with keyboard navigation
interface AccessibleErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    resetError: () => void
    errorId: string
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showRecoveryOptions?: boolean
}

export function AccessibleErrorBoundary({
  children,
  fallback: Fallback,
  onError,
  showRecoveryOptions = true
}: AccessibleErrorBoundaryProps) {
  const [error, setError] = React.useState<Error | null>(null)
  const [errorId] = React.useState(() => `error-${Date.now()}`)
  const errorRef = React.useRef<HTMLDivElement>(null)
  const { announceCriticalError } = useErrorAnnouncement()

  const resetError = React.useCallback(() => {
    setError(null)
    announceError('Error cleared, returning to application', 'polite')
  }, [])

  React.useEffect(() => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      setError(error)
      onError?.(error, errorInfo)
      
      // Announce critical error
      announceCriticalError(
        `Application error occurred: ${error.message}. Recovery options are available.`
      )

      // Focus the error container for immediate attention
      setTimeout(() => {
        errorRef.current?.focus()
      }, 100)
    }

    // Set up error boundary logic
    const originalConsoleError = console.error
    console.error = (...args) => {
      originalConsoleError.apply(console, args)
      
      // Check if this is a React error
      if (args[0] && typeof args[0] === 'string' && args[0].includes('React')) {
        const error = new Error(args[0])
        handleError(error, { componentStack: '' })
      }
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [onError, announceCriticalError])

  if (error) {
    if (Fallback) {
      return <Fallback error={error} resetError={resetError} errorId={errorId} />
    }

    return (
      <div
        ref={errorRef}
        className="min-h-[400px] flex items-center justify-center p-6"
        tabIndex={-1}
        aria-describedby={`${errorId}-description`}
      >
        <div className="w-full max-w-md">
          <AccessibleErrorMessage
            id={errorId}
            title="Application Error"
            message={error.message}
            type="error"
            severity="critical"
            autoFocus={true}
            announceOnMount={false} // Already announced above
            actions={showRecoveryOptions ? [
              {
                label: 'Try Again',
                onClick: resetError,
                variant: 'default'
              },
              {
                label: 'Refresh Page',
                onClick: () => window.location.reload(),
                variant: 'outline'
              },
              {
                label: 'Go Home',
                onClick: () => window.location.href = '/',
                variant: 'outline'
              }
            ] : undefined}
          />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Accessible loading state with proper ARIA attributes
interface AccessibleLoadingStateProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  className?: string
}

export function AccessibleLoadingState({
  isLoading,
  loadingText = 'Loading...',
  children,
  className
}: AccessibleLoadingStateProps) {
  const { announceError } = useErrorAnnouncement()

  React.useEffect(() => {
    if (isLoading) {
      announceError(loadingText, 'polite')
    }
  }, [isLoading, loadingText, announceError])

  if (isLoading) {
    return (
      <div
        className={cn('flex items-center justify-center p-6', className)}
        role="status"
        aria-live="polite"
        aria-label={loadingText}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">{loadingText}</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Form error announcer for form validation
export function useFormErrorAnnouncement() {
  const { announceError } = useErrorAnnouncement()

  const announceFormErrors = React.useCallback((errors: Record<string, any>) => {
    const errorCount = Object.keys(errors).length
    if (errorCount === 0) return

    const errorMessages = Object.entries(errors).map(([field, error]) => {
      const message = error?.message || `Error in ${field}`
      return message
    })

    const announcement = errorCount === 1 
      ? `Form validation error: ${errorMessages[0]}`
      : `Form has ${errorCount} validation errors: ${errorMessages.join(', ')}`

    announceError(announcement, 'assertive')
  }, [announceError])

  const announceFormSuccess = React.useCallback((message = 'Form submitted successfully') => {
    announceError(message, 'polite')
  }, [announceError])

  return {
    announceFormErrors,
    announceFormSuccess
  }
}

// Focus management for error recovery
export function useFocusManagement() {
  const lastFocusedElement = React.useRef<HTMLElement | null>(null)

  const saveFocus = React.useCallback(() => {
    lastFocusedElement.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = React.useCallback(() => {
    if (lastFocusedElement.current) {
      try {
        lastFocusedElement.current.focus()
      } catch (e) {
        // Element might not be focusable anymore
        console.warn('Could not restore focus:', e)
      }
    }
  }, [])

  const focusElement = React.useCallback((element: HTMLElement | string) => {
    try {
      const targetElement = typeof element === 'string' 
        ? document.getElementById(element) 
        : element

      if (targetElement) {
        targetElement.focus()
      }
    } catch (e) {
      console.warn('Could not focus element:', e)
    }
  }, [])

  return {
    saveFocus,
    restoreFocus,
    focusElement
  }
}

// Skip link component for error recovery navigation
export function ErrorRecoverySkipLinks({
  links
}: {
  links: Array<{
    href: string
    label: string
    onClick?: () => void
  }>
}) {
  return (
    <div className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-50 bg-white border border-gray-300 p-2 shadow-lg">
      <p className="text-sm font-medium mb-2">Error Recovery Options:</p>
      <nav>
        <ul className="space-y-1">
          {links.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault()
                    link.onClick()
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {link.label}
                <ArrowRight className="inline h-3 w-3 ml-1" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default AccessibleErrorMessage