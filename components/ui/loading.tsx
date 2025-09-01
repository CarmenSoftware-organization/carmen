'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Upload,
  RefreshCw,
  Zap
} from 'lucide-react'

// Loading spinner variants
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const variantClasses = {
    default: 'text-gray-600',
    primary: 'text-blue-600',
    secondary: 'text-gray-400',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    destructive: 'text-red-600'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  )
}

// Progress bar with status
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  status?: 'loading' | 'success' | 'error' | 'warning'
  showPercentage?: boolean
  showETA?: boolean
  eta?: string
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label,
  status = 'loading',
  showPercentage = true,
  showETA = false,
  eta,
  className 
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100)
  
  const statusIcons = {
    loading: <Loader2 className="h-4 w-4 animate-spin" />,
    success: <CheckCircle className="h-4 w-4 text-green-600" />,
    error: <AlertCircle className="h-4 w-4 text-red-600" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-600" />
  }

  const progressColors = {
    loading: '',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage || showETA) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {statusIcons[status]}
            {label && <span className="font-medium">{label}</span>}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            {showETA && eta && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{eta}</span>
              </div>
            )}
            {showPercentage && <span>{percentage}%</span>}
          </div>
        </div>
      )}
      <Progress 
        value={value} 
        max={max} 
        className={cn(
          'h-2',
          status === 'success' && '[&>div]:bg-green-600',
          status === 'error' && '[&>div]:bg-red-600',
          status === 'warning' && '[&>div]:bg-yellow-600'
        )}
      />
    </div>
  )
}

// Loading states for different contexts
interface LoadingStateProps {
  type: 'inline' | 'overlay' | 'page' | 'card' | 'button' | 'table'
  message?: string
  submessage?: string
  progress?: number
  className?: string
  children?: React.ReactNode
}

export function LoadingState({ 
  type, 
  message = 'Loading...', 
  submessage,
  progress,
  className,
  children 
}: LoadingStateProps) {
  switch (type) {
    case 'inline':
      return (
        <div className={cn('flex items-center gap-2 py-2', className)}>
          <LoadingSpinner size="sm" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      )

    case 'overlay':
      return (
        <div className={cn(
          'absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50',
          className
        )}>
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" variant="primary" />
            <div>
              <p className="font-medium">{message}</p>
              {submessage && (
                <p className="text-sm text-muted-foreground mt-1">{submessage}</p>
              )}
            </div>
            {progress !== undefined && (
              <ProgressBar value={progress} className="w-64" />
            )}
          </div>
        </div>
      )

    case 'page':
      return (
        <div className={cn(
          'flex items-center justify-center min-h-[400px] p-8',
          className
        )}>
          <div className="text-center space-y-6 max-w-md">
            <LoadingSpinner size="xl" variant="primary" />
            <div>
              <h2 className="text-lg font-semibold mb-2">{message}</h2>
              {submessage && (
                <p className="text-muted-foreground">{submessage}</p>
              )}
            </div>
            {progress !== undefined && (
              <ProgressBar 
                value={progress} 
                className="w-full"
                showPercentage
                showETA
              />
            )}
            {children}
          </div>
        </div>
      )

    case 'card':
      return (
        <Card className={className}>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <div>
                <p className="font-medium">{message}</p>
                {submessage && (
                  <p className="text-sm text-muted-foreground mt-1">{submessage}</p>
                )}
              </div>
              {progress !== undefined && (
                <ProgressBar value={progress} className="w-48" />
              )}
            </div>
          </CardContent>
        </Card>
      )

    case 'button':
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <LoadingSpinner size="sm" />
          <span>{message}</span>
        </div>
      )

    case 'table':
      return (
        <div className={cn('flex items-center justify-center py-12', className)}>
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      )

    default:
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <LoadingSpinner />
          <span>{message}</span>
        </div>
      )
  }
}

// Skeleton loading components
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ 
  items = 5,
  showAvatar = false,
  className 
}: { 
  items?: number
  showAvatar?: boolean
  className?: string 
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Action loading states
interface ActionLoadingProps {
  isLoading: boolean
  action?: 'saving' | 'deleting' | 'uploading' | 'downloading' | 'processing' | 'connecting'
  message?: string
  children?: React.ReactNode
  className?: string
}

export function ActionLoading({ 
  isLoading, 
  action = 'processing',
  message,
  children,
  className 
}: ActionLoadingProps) {
  if (!isLoading) return <>{children}</>

  const actionConfig = {
    saving: { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Saving...' },
    deleting: { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Deleting...' },
    uploading: { icon: <Upload className="h-4 w-4 animate-pulse" />, text: 'Uploading...' },
    downloading: { icon: <Download className="h-4 w-4 animate-pulse" />, text: 'Downloading...' },
    processing: { icon: <RefreshCw className="h-4 w-4 animate-spin" />, text: 'Processing...' },
    connecting: { icon: <Zap className="h-4 w-4 animate-pulse" />, text: 'Connecting...' }
  }

  const config = actionConfig[action]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {config.icon}
      <span className="text-sm">{message || config.text}</span>
    </div>
  )
}

// Smart loading component that adapts based on context
interface SmartLoadingProps {
  isLoading: boolean
  error?: Error | null
  data?: any
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  children: React.ReactNode
  loadingType?: 'inline' | 'overlay' | 'page' | 'card' | 'skeleton'
  loadingMessage?: string
  className?: string
}

export function SmartLoading({
  isLoading,
  error,
  data,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  loadingType = 'inline',
  loadingMessage = 'Loading...',
  className
}: SmartLoadingProps) {
  // Show error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>
    }
    
    return (
      <div className={cn('flex items-center gap-2 p-4 text-red-600', className)}>
        <AlertCircle className="h-5 w-5" />
        <span>Error: {error.message}</span>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    
    return (
      <LoadingState 
        type={loadingType} 
        message={loadingMessage}
        className={className}
      />
    )
  }

  // Show empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    if (emptyComponent) {
      return <>{emptyComponent}</>
    }
    
    return (
      <div className={cn('flex items-center justify-center p-8 text-muted-foreground', className)}>
        <p>No data available</p>
      </div>
    )
  }

  // Show content
  return <>{children}</>
}

export default LoadingSpinner