'use client'

import React from 'react'
import * as Toast from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Enhanced toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'

export interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline'
  disabled?: boolean
}

export interface EnhancedToastData {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
  persistent?: boolean
  actions?: ToastAction[]
  progress?: number
  showProgress?: boolean
  onDismiss?: () => void
  metadata?: Record<string, any>
}

interface ToastItemProps {
  toast: EnhancedToastData
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [progress, setProgress] = React.useState(toast.progress || 0)
  
  // Auto-close timer
  React.useEffect(() => {
    if (toast.persistent || toast.type === 'loading') return
    
    const duration = toast.duration || getDefaultDuration(toast.type)
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, toast.persistent, toast.type, onClose])

  // Progress animation for loading toasts
  React.useEffect(() => {
    if (toast.type === 'loading' && toast.showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      return () => clearInterval(interval)
    }
  }, [toast.type, toast.showProgress])

  const getToastConfig = (type: ToastType) => {
    const configs = {
      success: {
        icon: CheckCircle,
        className: 'bg-green-50 border-green-200 text-green-900',
        iconClassName: 'text-green-600',
        progressClassName: 'bg-green-600'
      },
      error: {
        icon: AlertCircle,
        className: 'bg-red-50 border-red-200 text-red-900',
        iconClassName: 'text-red-600',
        progressClassName: 'bg-red-600'
      },
      warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        iconClassName: 'text-yellow-600',
        progressClassName: 'bg-yellow-600'
      },
      info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200 text-blue-900',
        iconClassName: 'text-blue-600',
        progressClassName: 'bg-blue-600'
      },
      loading: {
        icon: Loader2,
        className: 'bg-gray-50 border-gray-200 text-gray-900',
        iconClassName: 'text-gray-600 animate-spin',
        progressClassName: 'bg-gray-600'
      },
      default: {
        icon: Info,
        className: 'bg-white border-gray-200 text-gray-900',
        iconClassName: 'text-gray-600',
        progressClassName: 'bg-gray-600'
      }
    }
    
    return configs[type] || configs.default
  }

  const config = getToastConfig(toast.type)
  const IconComponent = config.icon

  const handleClose = () => {
    toast.onDismiss?.()
    onClose(toast.id)
  }

  return (
    <Toast.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        config.className
      )}
      duration={toast.persistent ? Infinity : (toast.duration || getDefaultDuration(toast.type))}
    >
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className={cn('h-5 w-5', config.iconClassName)} />
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <Toast.Title className="text-sm font-semibold leading-none mb-1">
              {toast.title}
            </Toast.Title>
          )}
          
          <Toast.Description className="text-sm opacity-90 leading-relaxed">
            {toast.message}
          </Toast.Description>
          
          {/* Progress bar for loading toasts */}
          {toast.type === 'loading' && toast.showProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={cn('h-1.5 rounded-full transition-all duration-300', config.progressClassName)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Actions */}
          {toast.actions && toast.actions.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {toast.actions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="h-7 px-2 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Close button */}
      <Toast.Close asChild>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0 opacity-70 hover:opacity-100"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </Toast.Close>
    </Toast.Root>
  )
}

function getDefaultDuration(type: ToastType): number {
  const durations = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
    loading: Infinity,
    default: 4000
  }
  
  return durations[type] || durations.default
}

// Enhanced Toast Provider
export function EnhancedToastProvider({ 
  children, 
  maxToasts = 5,
  position = 'bottom-right'
}: { 
  children: React.ReactNode
  maxToasts?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
}) {
  const [toasts, setToasts] = React.useState<EnhancedToastData[]>([])

  const addToast = React.useCallback((toastData: Omit<EnhancedToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newToast: EnhancedToastData = {
      id,
      ...toastData
    }

    setToasts(prev => {
      // Limit number of toasts
      const updated = [newToast, ...prev].slice(0, maxToasts)
      return updated
    })

    return id
  }, [maxToasts])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const updateToast = React.useCallback((id: string, updates: Partial<EnhancedToastData>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ))
  }, [])

  const clearAllToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  // Provide toast functions through context
  React.useEffect(() => {
    const context = {
      addToast,
      removeToast,
      updateToast,
      clearAllToasts,
      toasts
    }
    
    // Make toast functions globally available
    ;(window as any).enhancedToast = context
  }, [addToast, removeToast, updateToast, clearAllToasts, toasts])

  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-0 left-0',
      'top-right': 'top-0 right-0',
      'top-center': 'top-0 left-1/2 -translate-x-1/2',
      'bottom-left': 'bottom-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2'
    }
    
    return positions[position] || positions['bottom-right']
  }

  return (
    <Toast.Provider swipeDirection="right">
      {children}
      
      <div className={cn(
        'fixed z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px] sm:flex-col',
        getPositionClasses()
      )}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
      
      <Toast.Viewport />
    </Toast.Provider>
  )
}

// Convenience hooks and functions for using enhanced toasts
export function useEnhancedToast() {
  const context = (window as any).enhancedToast

  const toast = React.useCallback((data: Omit<EnhancedToastData, 'id' | 'type'> & { type?: ToastType }) => {
    return context?.addToast({
      type: 'default',
      ...data
    })
  }, [context])

  const success = React.useCallback((message: string, options?: Partial<EnhancedToastData>) => {
    return context?.addToast({
      type: 'success',
      message,
      ...options
    })
  }, [context])

  const error = React.useCallback((message: string, options?: Partial<EnhancedToastData>) => {
    return context?.addToast({
      type: 'error',
      message,
      ...options
    })
  }, [context])

  const warning = React.useCallback((message: string, options?: Partial<EnhancedToastData>) => {
    return context?.addToast({
      type: 'warning',
      message,
      ...options
    })
  }, [context])

  const info = React.useCallback((message: string, options?: Partial<EnhancedToastData>) => {
    return context?.addToast({
      type: 'info',
      message,
      ...options
    })
  }, [context])

  const loading = React.useCallback((message: string, options?: Partial<EnhancedToastData>) => {
    return context?.addToast({
      type: 'loading',
      message,
      persistent: true,
      showProgress: true,
      ...options
    })
  }, [context])

  const update = React.useCallback((id: string, updates: Partial<EnhancedToastData>) => {
    return context?.updateToast(id, updates)
  }, [context])

  const dismiss = React.useCallback((id: string) => {
    return context?.removeToast(id)
  }, [context])

  const dismissAll = React.useCallback(() => {
    return context?.clearAllToasts()
  }, [context])

  return {
    toast,
    success,
    error,
    warning,
    info,
    loading,
    update,
    dismiss,
    dismissAll,
    toasts: context?.toasts || []
  }
}

// Standalone toast functions for global use
export const enhancedToast = {
  success: (message: string, options?: Partial<EnhancedToastData>) => {
    const context = (window as any).enhancedToast
    return context?.addToast({
      type: 'success',
      message,
      ...options
    })
  },
  
  error: (message: string, options?: Partial<EnhancedToastData>) => {
    const context = (window as any).enhancedToast
    return context?.addToast({
      type: 'error',
      message,
      ...options
    })
  },
  
  warning: (message: string, options?: Partial<EnhancedToastData>) => {
    const context = (window as any).enhancedToast
    return context?.addToast({
      type: 'warning',
      message,
      ...options
    })
  },
  
  info: (message: string, options?: Partial<EnhancedToastData>) => {
    const context = (window as any).enhancedToast
    return context?.addToast({
      type: 'info',
      message,
      ...options
    })
  },
  
  loading: (message: string, options?: Partial<EnhancedToastData>) => {
    const context = (window as any).enhancedToast
    return context?.addToast({
      type: 'loading',
      message,
      persistent: true,
      showProgress: true,
      ...options
    })
  },
  
  dismiss: (id: string) => {
    const context = (window as any).enhancedToast
    return context?.removeToast(id)
  },
  
  dismissAll: () => {
    const context = (window as any).enhancedToast
    return context?.clearAllToasts()
  }
}

export default EnhancedToastProvider