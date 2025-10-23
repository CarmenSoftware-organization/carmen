'use client'

/**
 * Monitoring Provider for Carmen ERP
 * Provides monitoring context and utilities for React components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { performanceMonitor } from './performance'
import { businessMetricsTracker } from './business-metrics'
import { errorTracker } from './error-tracking'
import { logger } from './logger'
import { getMonitoringConfig } from './config'

interface MonitoringContextValue {
  // Performance tracking
  trackPageLoad: (pageName: string, metadata?: Record<string, any>) => string
  trackUserInteraction: (action: string, element: string, metadata?: Record<string, any>) => void
  trackFeatureUsage: (featureName: string, module?: string) => void
  trackCustomEvent: (eventName: string, properties?: Record<string, any>) => void
  
  // Workflow tracking
  startWorkflow: (workflowName: string, module: string) => string
  addWorkflowStep: (workflowId: string, stepName: string, data?: Record<string, any>) => void
  completeWorkflowStep: (workflowId: string, stepName: string, status?: 'completed' | 'skipped' | 'failed') => void
  completeWorkflow: (workflowId: string, status?: 'completed' | 'abandoned' | 'failed') => void
  
  // Error tracking
  captureError: (error: Error, context?: Record<string, any>) => void
  captureMessage: (message: string, level?: 'error' | 'warning' | 'info', context?: Record<string, any>) => void
  
  // User context
  setUser: (user: { id: string; email?: string; role?: string }) => void
  setContext: (key: string, value: any) => void
  
  // Monitoring status
  isEnabled: boolean
  config: any
}

const MonitoringContext = createContext<MonitoringContextValue | null>(null)

interface MonitoringProviderProps {
  children: ReactNode
  userId?: string
  userEmail?: string
  userRole?: string
  module?: string
  enablePerformanceTracking?: boolean
  enableBusinessTracking?: boolean
  enableErrorTracking?: boolean
}

export function MonitoringProvider({
  children,
  userId,
  userEmail,
  userRole,
  module = 'app',
  enablePerformanceTracking = true,
  enableBusinessTracking = true,
  enableErrorTracking = true
}: MonitoringProviderProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState(userId)

  useEffect(() => {
    // Initialize monitoring
    const monitoringConfig = getMonitoringConfig()
    setConfig(monitoringConfig)
    setIsEnabled(
      monitoringConfig.enabledServices.performanceMonitoring ||
      monitoringConfig.enabledServices.businessMetrics ||
      monitoringConfig.enabledServices.userAnalytics
    )

    // Set user context if provided
    if (userId && enableErrorTracking) {
      errorTracker.setUser({
        id: userId,
        email: userEmail,
        username: userEmail,
        role: userRole
      })
    }

    // Track application start
    if (enableBusinessTracking) {
      businessMetricsTracker.trackEvent(
        'application_start',
        'system',
        {
          module,
          userAgent: navigator.userAgent,
          screen: `${screen.width}x${screen.height}`,
          language: navigator.language
        },
        {
          userId,
          module: 'system'
        }
      )
    }

    // Set up error boundary for unhandled errors
    if (enableErrorTracking) {
      const handleError = (event: ErrorEvent) => {
        errorTracker.captureError(
          new Error(event.message),
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            source: 'window.onerror'
          }
        )
      }

      const handleRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
        errorTracker.captureError(error, {
          source: 'unhandledrejection'
        })
      }

      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleRejection)

      return () => {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleRejection)
      }
    }
  }, [userId, userEmail, userRole, module, enableErrorTracking, enableBusinessTracking])

  // Track page visibility changes
  useEffect(() => {
    if (!enablePerformanceTracking) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Performance metrics are automatically captured by the performanceMonitor
        logger.info('Page visibility changed to hidden', { module })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enablePerformanceTracking, module])

  const contextValue: MonitoringContextValue = {
    // Performance tracking
    trackPageLoad: (pageName: string, metadata?: Record<string, any>) => {
      if (!enablePerformanceTracking) return ''
      
      return performanceMonitor.startJourney('page_load', {
        page: pageName,
        module,
        ...metadata
      }, currentUserId)
    },

    trackUserInteraction: (action: string, element: string, metadata?: Record<string, any>) => {
      if (!enableBusinessTracking) return
      
      businessMetricsTracker.trackInteraction(action, element, {
        userId: currentUserId,
        module,
        metadata
      })
    },

    trackFeatureUsage: (featureName: string, module?: string) => {
      if (!enableBusinessTracking) return
      
      businessMetricsTracker.trackFeatureUsage(featureName, module || 'unknown', currentUserId)
    },

    trackCustomEvent: (eventName: string, properties?: Record<string, any>) => {
      if (!enableBusinessTracking) return
      
      businessMetricsTracker.trackEvent(
        eventName,
        'user',
        properties || {},
        {
          userId: currentUserId,
          module
        }
      )
    },

    // Workflow tracking
    startWorkflow: (workflowName: string, module: string) => {
      if (!enableBusinessTracking) return ''
      
      return businessMetricsTracker.startWorkflow(workflowName, module, {
        userId: currentUserId
      })
    },

    addWorkflowStep: (workflowId: string, stepName: string, data?: Record<string, any>) => {
      if (!enableBusinessTracking) return
      
      businessMetricsTracker.addWorkflowStep(workflowId, stepName, data)
    },

    completeWorkflowStep: (workflowId: string, stepName: string, status = 'completed') => {
      if (!enableBusinessTracking) return
      
      businessMetricsTracker.completeWorkflowStep(workflowId, stepName, status)
    },

    completeWorkflow: (workflowId: string, status = 'completed') => {
      if (!enableBusinessTracking) return
      
      businessMetricsTracker.completeWorkflow(workflowId, status)
    },

    // Error tracking
    captureError: (error: Error, context?: Record<string, any>) => {
      if (!enableErrorTracking) return
      
      errorTracker.captureError(error, {
        userId: currentUserId,
        module,
        ...context
      })
    },

    captureMessage: (message: string, level = 'info', context?: Record<string, any>) => {
      if (!enableErrorTracking) return
      
      errorTracker.captureMessage(message, level, {
        userId: currentUserId,
        module,
        ...context
      })
    },

    // User context
    setUser: (user: { id: string; email?: string; role?: string }) => {
      setCurrentUserId(user.id)
      
      if (enableErrorTracking) {
        errorTracker.setUser({
          id: user.id,
          email: user.email,
          username: user.email,
          role: user.role
        })
      }
    },

    setContext: (key: string, value: any) => {
      if (enableErrorTracking) {
        errorTracker.setTag(key, String(value))
      }
    },

    // Status
    isEnabled,
    config
  }

  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  )
}

// Hook to use monitoring context
export function useMonitoring() {
  const context = useContext(MonitoringContext)
  if (!context) {
    // Return no-op functions if provider is not available
    return {
      trackPageLoad: () => '',
      trackUserInteraction: () => {},
      trackFeatureUsage: () => {},
      trackCustomEvent: () => {},
      startWorkflow: () => '',
      addWorkflowStep: () => {},
      completeWorkflowStep: () => {},
      completeWorkflow: () => {},
      captureError: () => {},
      captureMessage: () => {},
      setUser: () => {},
      setContext: () => {},
      isEnabled: false,
      config: null
    }
  }
  return context
}

// Higher-order component for automatic component tracking
export function withMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options: {
    trackMounts?: boolean
    trackUnmounts?: boolean
    trackRenders?: boolean
    trackProps?: boolean
  } = {}
) {
  const {
    trackMounts = true,
    trackUnmounts = true,
    trackRenders = false,
    trackProps = false
  } = options

  return function MonitoredComponent(props: P) {
    const monitoring = useMonitoring()
    const name = componentName || Component.displayName || Component.name || 'UnknownComponent'
    
    // Track component lifecycle
    useEffect(() => {
      if (trackMounts && monitoring.isEnabled) {
        monitoring.trackFeatureUsage(`component_${name.toLowerCase()}`, 'ui')
        monitoring.trackCustomEvent('component_mount', {
          component: name,
          props: trackProps ? Object.keys(props as any) : undefined
        })
      }

      return () => {
        if (trackUnmounts && monitoring.isEnabled) {
          monitoring.trackCustomEvent('component_unmount', {
            component: name
          })
        }
      }
    }, [monitoring, name, props])

    // Track renders
    useEffect(() => {
      if (trackRenders && monitoring.isEnabled) {
        monitoring.trackCustomEvent('component_render', {
          component: name,
          renderCount: (Component as any)._renderCount || 1
        })
      }
    })

    return <Component {...props} />
  }
}

// Component-specific hooks
export function usePageTracking(pageName: string, metadata?: Record<string, any>) {
  const monitoring = useMonitoring()
  
  useEffect(() => {
    if (!monitoring.isEnabled) return

    const journeyId = monitoring.trackPageLoad(pageName, metadata)
    
    // Track page load performance
    const startTime = performance.now()
    
    return () => {
      const loadTime = performance.now() - startTime
      if (journeyId) {
        performanceMonitor.completeJourney(journeyId, 'completed')
      }
      
      monitoring.trackCustomEvent('page_unload', {
        page: pageName,
        timeOnPage: loadTime,
        ...metadata
      })
    }
  }, [monitoring, pageName, JSON.stringify(metadata)])
}

export function useWorkflowTracking(workflowName: string, module: string) {
  const monitoring = useMonitoring()
  const [workflowId, setWorkflowId] = useState<string>('')
  
  useEffect(() => {
    if (!monitoring.isEnabled) return
    
    const id = monitoring.startWorkflow(workflowName, module)
    setWorkflowId(id)
    
    return () => {
      if (id) {
        monitoring.completeWorkflow(id, 'abandoned')
      }
    }
  }, [monitoring, workflowName, module])

  return {
    workflowId,
    addStep: (stepName: string, data?: Record<string, any>) => {
      if (workflowId) {
        monitoring.addWorkflowStep(workflowId, stepName, data)
      }
    },
    completeStep: (stepName: string, status?: 'completed' | 'skipped' | 'failed') => {
      if (workflowId) {
        monitoring.completeWorkflowStep(workflowId, stepName, status)
      }
    },
    complete: (status?: 'completed' | 'abandoned' | 'failed') => {
      if (workflowId) {
        monitoring.completeWorkflow(workflowId, status)
        setWorkflowId('')
      }
    }
  }
}

export function useErrorBoundary() {
  const monitoring = useMonitoring()
  
  return {
    captureError: monitoring.captureError,
    captureMessage: monitoring.captureMessage
  }
}