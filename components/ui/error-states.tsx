"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Lock, 
  Server, 
  Clock,
  Bug,
  AlertCircle,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  className?: string
  title?: string
  description?: string
  error?: Error | string
  onRetry?: () => void
  showRetry?: boolean
  variant?: "default" | "destructive" | "warning"
}

export function NetworkErrorState({ 
  className, 
  onRetry, 
  title = "Connection Error",
  description = "Unable to connect to the server. Please check your internet connection."
}: ErrorStateProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Wifi className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AuthErrorState({ 
  className,
  title = "Authentication Required",
  description = "Your session has expired. Please log in again to continue."
}: ErrorStateProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button onClick={() => window.location.href = '/auth/login'} className="w-full">
            Login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ServerErrorState({ 
  className,
  onRetry,
  title = "Server Error",
  description = "Something went wrong on our end. Please try again later."
}: ErrorStateProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Server className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TimeoutErrorState({ 
  className,
  onRetry,
  title = "Request Timeout",
  description = "The request took too long to complete. Please try again."
}: ErrorStateProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function GenericErrorState({ 
  className, 
  error, 
  onRetry,
  title = "Something Went Wrong",
  description
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || "An unexpected error occurred."
  const displayDescription = description || errorMessage
  
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Bug className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show error details in development */}
        {process.env.NODE_ENV === 'development' && error && (
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <div className="font-mono text-sm">
                <div><strong>Error:</strong> {errorMessage}</div>
                {typeof error === 'object' && error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack trace</summary>
                    <pre className="text-xs mt-1 whitespace-pre-wrap">{error.stack}</pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function InlineErrorAlert({ 
  error, 
  onRetry,
  className,
  variant = "destructive",
  showRetry = true
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || "An error occurred"
  
  return (
    <Alert variant={variant} className={cn("", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {onRetry && showRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export function EmptyDataState({
  className,
  title = "No Data",
  description = "No items found matching your criteria.",
  icon: Icon = AlertCircle,
  action,
  actionLabel = "Refresh"
}: {
  className?: string
  title?: string
  description?: string
  icon?: React.ElementType
  action?: () => void
  actionLabel?: string
}) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          {action && (
            <Button variant="outline" onClick={action}>
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ValidationErrorState({
  errors,
  className,
  title = "Validation Errors"
}: {
  errors: string[] | Record<string, string[]>
  className?: string
  title?: string
}) {
  const errorList = Array.isArray(errors) 
    ? errors 
    : Object.entries(errors).flatMap(([field, fieldErrors]) => 
        fieldErrors.map(error => `${field}: ${error}`)
      )
  
  return (
    <Alert variant="destructive" className={cn("", className)}>
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <div>
          <p className="font-medium">{title}</p>
          <ul className="mt-2 text-sm list-disc list-inside">
            {errorList.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Smart error component that detects error type and shows appropriate UI
export function SmartErrorState({ 
  error, 
  onRetry, 
  className 
}: { 
  error: Error | string
  onRetry?: () => void
  className?: string
}) {
  const errorMessage = typeof error === 'string' ? error : error?.message || ""
  const errorName = typeof error === 'object' ? error.name : ""
  
  // Check if it's a network error
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorName === 'NetworkError') {
    return <NetworkErrorState className={className} onRetry={onRetry} />
  }
  
  // Check if it's an auth error
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorName === 'AuthError') {
    return <AuthErrorState className={className} />
  }
  
  // Check if it's a server error
  if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503') || 
      errorName === 'ServerError') {
    return <ServerErrorState className={className} onRetry={onRetry} />
  }
  
  // Check if it's a timeout error
  if (errorMessage.includes('timeout') || errorMessage.includes('408') || errorName === 'TimeoutError') {
    return <TimeoutErrorState className={className} onRetry={onRetry} />
  }
  
  // Generic error fallback
  return <GenericErrorState className={className} error={error} onRetry={onRetry} />
}