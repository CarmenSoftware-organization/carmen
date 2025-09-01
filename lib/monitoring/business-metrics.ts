/**
 * Business Metrics and User Analytics for Carmen ERP
 * Tracks business KPIs, user behavior, and system usage analytics
 */

import { getMonitoringConfig, businessMetricsConfig } from './config'
import { logger } from './logger'

export interface BusinessEvent {
  id: string
  eventType: string
  category: 'workflow' | 'feature' | 'performance' | 'user' | 'business' | 'system'
  timestamp: number
  userId?: string
  sessionId: string
  data: Record<string, any>
  metadata?: {
    module: string
    component?: string
    version?: string
    environment: string
    userAgent?: string
    ip?: string
  }
  tags?: string[]
}

export interface UserSession {
  sessionId: string
  userId?: string
  startTime: number
  endTime?: number
  duration?: number
  pageViews: number
  interactions: number
  features: string[]
  workflows: WorkflowExecution[]
  location?: string
  userAgent: string
  referrer?: string
}

export interface WorkflowExecution {
  workflowId: string
  workflowName: string
  module: string
  startTime: number
  endTime?: number
  duration?: number
  steps: WorkflowStep[]
  status: 'started' | 'completed' | 'abandoned' | 'failed'
  userId?: string
  metadata?: Record<string, any>
}

export interface WorkflowStep {
  stepName: string
  startTime: number
  endTime?: number
  duration?: number
  status: 'started' | 'completed' | 'skipped' | 'failed'
  data?: Record<string, any>
}

export interface KPI {
  name: string
  value: number
  unit: string
  timestamp: number
  target?: number
  trend?: 'up' | 'down' | 'stable'
  context?: Record<string, any>
}

export interface FeatureUsage {
  featureName: string
  module: string
  usageCount: number
  uniqueUsers: number
  lastUsed: number
  averageUsageTime: number
  adoptionRate: number
}

export interface BusinessMetricsData {
  totalUsers: number
  activeUsers: number
  sessionCount: number
  averageSessionDuration: number
  workflowCompletionRate: number
  featureAdoptionRate: number
  systemUptime: number
  errorRate: number
  userSatisfaction: number
  performanceScore: number
}

class BusinessMetricsTracker {
  private events: BusinessEvent[] = []
  private sessions: Map<string, UserSession> = new Map()
  private workflows: Map<string, WorkflowExecution> = new Map()
  private kpis: Map<string, KPI[]> = new Map()
  private featureUsage: Map<string, FeatureUsage> = new Map()
  private config = getMonitoringConfig()
  private maxEvents = 50000
  private flushInterval = 30000 // 30 seconds

  constructor() {
    this.setupAutoFlush()
    this.setupSessionTracking()
    this.initializeKPIs()
  }

  private setupAutoFlush() {
    setInterval(() => {
      this.flushEvents()
    }, this.flushInterval)
  }

  private setupSessionTracking() {
    if (typeof window !== 'undefined') {
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.endCurrentSession()
        } else {
          this.startSession()
        }
      })

      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.endCurrentSession()
        this.flushEvents()
      })

      // Start initial session
      this.startSession()
    }
  }

  private initializeKPIs() {
    // Initialize standard Carmen ERP KPIs
    const standardKPIs = [
      'procurement_cycle_time',
      'vendor_response_time',
      'inventory_turnover_rate',
      'cost_savings_achieved',
      'approval_processing_time',
      'system_availability',
      'user_adoption_rate',
      'error_resolution_time',
      'order_fulfillment_rate',
      'invoice_processing_time'
    ]

    standardKPIs.forEach(kpiName => {
      this.kpis.set(kpiName, [])
    })
  }

  /**
   * Track a business event
   */
  trackEvent(
    eventType: string,
    category: BusinessEvent['category'],
    data: Record<string, any>,
    options?: {
      userId?: string
      module?: string
      component?: string
      tags?: string[]
    }
  ): string {
    const eventId = this.generateEventId()
    const sessionId = this.getCurrentSessionId()

    const event: BusinessEvent = {
      id: eventId,
      eventType,
      category,
      timestamp: Date.now(),
      userId: options?.userId,
      sessionId,
      data,
      metadata: {
        module: options?.module || 'unknown',
        component: options?.component,
        version: process.env.npm_package_version,
        environment: process.env.NODE_ENV || 'development',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      },
      tags: options?.tags,
    }

    this.events.push(event)

    // Update session data
    this.updateSession(sessionId, event)

    // Update feature usage
    if (category === 'feature') {
      this.trackFeatureUsage(eventType, options?.module || 'unknown', options?.userId)
    }

    // Log business events
    logger.businessLog(
      options?.module || 'unknown',
      'event-tracking',
      `${category}:${eventType}`,
      {
        userId: options?.userId,
        metadata: data,
      }
    )

    // Prevent memory buildup
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents / 2)
    }

    return eventId
  }

  /**
   * Track user interaction
   */
  trackInteraction(
    action: string,
    element: string,
    options?: {
      userId?: string
      module?: string
      metadata?: Record<string, any>
    }
  ) {
    return this.trackEvent(
      `interaction_${action}`,
      'user',
      {
        action,
        element,
        ...options?.metadata,
      },
      {
        userId: options?.userId,
        module: options?.module,
        tags: ['interaction', action],
      }
    )
  }

  /**
   * Track workflow execution
   */
  startWorkflow(
    workflowName: string,
    module: string,
    options?: {
      userId?: string
      metadata?: Record<string, any>
    }
  ): string {
    const workflowId = this.generateWorkflowId()
    
    const workflow: WorkflowExecution = {
      workflowId,
      workflowName,
      module,
      startTime: Date.now(),
      steps: [],
      status: 'started',
      userId: options?.userId,
      metadata: options?.metadata,
    }

    this.workflows.set(workflowId, workflow)

    this.trackEvent(
      'workflow_started',
      'workflow',
      {
        workflowId,
        workflowName,
        module,
      },
      {
        userId: options?.userId,
        module,
        tags: ['workflow', 'start'],
      }
    )

    return workflowId
  }

  /**
   * Add step to workflow
   */
  addWorkflowStep(
    workflowId: string,
    stepName: string,
    data?: Record<string, any>
  ) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    const step: WorkflowStep = {
      stepName,
      startTime: Date.now(),
      status: 'started',
      data,
    }

    workflow.steps.push(step)
  }

  /**
   * Complete workflow step
   */
  completeWorkflowStep(
    workflowId: string,
    stepName: string,
    status: 'completed' | 'skipped' | 'failed' = 'completed'
  ) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    const step = workflow.steps.find(s => s.stepName === stepName && !s.endTime)
    if (!step) return

    step.endTime = Date.now()
    step.duration = step.endTime - step.startTime
    step.status = status

    this.trackEvent(
      `workflow_step_${status}`,
      'workflow',
      {
        workflowId,
        workflowName: workflow.workflowName,
        stepName,
        duration: step.duration,
      },
      {
        userId: workflow.userId,
        module: workflow.module,
        tags: ['workflow', 'step', status],
      }
    )
  }

  /**
   * Complete workflow
   */
  completeWorkflow(
    workflowId: string,
    status: 'completed' | 'abandoned' | 'failed' = 'completed'
  ) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    workflow.endTime = Date.now()
    workflow.duration = workflow.endTime - workflow.startTime
    workflow.status = status

    this.trackEvent(
      `workflow_${status}`,
      'workflow',
      {
        workflowId,
        workflowName: workflow.workflowName,
        module: workflow.module,
        duration: workflow.duration,
        stepCount: workflow.steps.length,
        completedSteps: workflow.steps.filter(s => s.status === 'completed').length,
      },
      {
        userId: workflow.userId,
        module: workflow.module,
        tags: ['workflow', status],
      }
    )

    // Update KPI for workflow completion rate
    this.updateKPI('workflow_completion_rate', status === 'completed' ? 1 : 0, 'percentage')
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, module: string, userId?: string) {
    const key = `${module}_${featureName}`
    const existing = this.featureUsage.get(key)

    if (existing) {
      existing.usageCount++
      existing.lastUsed = Date.now()
      if (userId && !existing.uniqueUsers) {
        existing.uniqueUsers++
      }
    } else {
      this.featureUsage.set(key, {
        featureName,
        module,
        usageCount: 1,
        uniqueUsers: userId ? 1 : 0,
        lastUsed: Date.now(),
        averageUsageTime: 0,
        adoptionRate: 0,
      })
    }

    this.trackEvent(
      'feature_used',
      'feature',
      {
        featureName,
        module,
      },
      {
        userId,
        module,
        tags: ['feature-usage'],
      }
    )
  }

  /**
   * Update KPI value
   */
  updateKPI(
    name: string,
    value: number,
    unit: string,
    options?: {
      target?: number
      context?: Record<string, any>
    }
  ) {
    const kpi: KPI = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      target: options?.target,
      context: options?.context,
    }

    // Calculate trend
    const existingKPIs = this.kpis.get(name) || []
    if (existingKPIs.length > 0) {
      const lastKPI = existingKPIs[existingKPIs.length - 1]
      if (value > lastKPI.value) {
        kpi.trend = 'up'
      } else if (value < lastKPI.value) {
        kpi.trend = 'down'
      } else {
        kpi.trend = 'stable'
      }
    }

    existingKPIs.push(kpi)
    this.kpis.set(name, existingKPIs)

    this.trackEvent(
      'kpi_updated',
      'business',
      {
        kpiName: name,
        value,
        unit,
        trend: kpi.trend,
        target: options?.target,
      },
      {
        tags: ['kpi', name],
      }
    )
  }

  /**
   * Track performance metric
   */
  trackPerformanceMetric(
    operation: string,
    duration: number,
    options?: {
      userId?: string
      module?: string
      metadata?: Record<string, any>
    }
  ) {
    this.trackEvent(
      'performance_metric',
      'performance',
      {
        operation,
        duration,
        ...options?.metadata,
      },
      {
        userId: options?.userId,
        module: options?.module,
        tags: ['performance'],
      }
    )

    // Update performance KPIs
    if (operation.includes('api')) {
      this.updateKPI('api_response_time', duration, 'ms')
    } else if (operation.includes('database')) {
      this.updateKPI('database_query_time', duration, 'ms')
    }
  }

  /**
   * Get business metrics dashboard data
   */
  getBusinessMetrics(timeframe?: number): BusinessMetricsData {
    const now = Date.now()
    const cutoff = timeframe ? now - timeframe : now - 86400000 // Default 24 hours

    const recentEvents = this.events.filter(e => e.timestamp >= cutoff)
    const recentSessions = Array.from(this.sessions.values()).filter(s => s.startTime >= cutoff)
    const recentWorkflows = Array.from(this.workflows.values()).filter(w => w.startTime >= cutoff)

    const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size
    const completedWorkflows = recentWorkflows.filter(w => w.status === 'completed').length
    const totalWorkflows = recentWorkflows.length

    return {
      totalUsers: uniqueUsers,
      activeUsers: recentSessions.length,
      sessionCount: recentSessions.length,
      averageSessionDuration: this.calculateAverageSessionDuration(recentSessions),
      workflowCompletionRate: totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0,
      featureAdoptionRate: this.calculateFeatureAdoptionRate(),
      systemUptime: this.getSystemUptime(),
      errorRate: this.getErrorRate(cutoff),
      userSatisfaction: this.getUserSatisfactionScore(),
      performanceScore: this.getPerformanceScore(),
    }
  }

  /**
   * Get feature usage statistics
   */
  getFeatureUsage(module?: string): FeatureUsage[] {
    const features = Array.from(this.featureUsage.values())
    return module ? features.filter(f => f.module === module) : features
  }

  /**
   * Get KPI data
   */
  getKPIs(name?: string, timeframe?: number): KPI[] {
    if (name) {
      const kpis = this.kpis.get(name) || []
      if (timeframe) {
        const cutoff = Date.now() - timeframe
        return kpis.filter(k => k.timestamp >= cutoff)
      }
      return kpis
    }

    // Return all KPIs
    const allKPIs: KPI[] = []
    this.kpis.forEach(kpis => {
      allKPIs.push(...kpis)
    })

    if (timeframe) {
      const cutoff = Date.now() - timeframe
      return allKPIs.filter(k => k.timestamp >= cutoff)
    }

    return allKPIs
  }

  /**
   * Get workflow analytics
   */
  getWorkflowAnalytics(module?: string, timeframe?: number): {
    totalWorkflows: number
    completedWorkflows: number
    abandonedWorkflows: number
    averageDuration: number
    completionRate: number
    bottlenecks: Array<{ stepName: string; averageDuration: number; failureRate: number }>
  } {
    const now = Date.now()
    const cutoff = timeframe ? now - timeframe : 0

    let workflows = Array.from(this.workflows.values()).filter(w => w.startTime >= cutoff)
    if (module) {
      workflows = workflows.filter(w => w.module === module)
    }

    const totalWorkflows = workflows.length
    const completedWorkflows = workflows.filter(w => w.status === 'completed').length
    const abandonedWorkflows = workflows.filter(w => w.status === 'abandoned').length

    const averageDuration = workflows
      .filter(w => w.duration)
      .reduce((sum, w) => sum + (w.duration || 0), 0) / workflows.filter(w => w.duration).length || 0

    const completionRate = totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0

    // Calculate step bottlenecks
    const stepStats: Map<string, { durations: number[]; failures: number }> = new Map()
    
    workflows.forEach(workflow => {
      workflow.steps.forEach(step => {
        const existing = stepStats.get(step.stepName) || { durations: [], failures: 0 }
        if (step.duration) existing.durations.push(step.duration)
        if (step.status === 'failed') existing.failures++
        stepStats.set(step.stepName, existing)
      })
    })

    const bottlenecks = Array.from(stepStats.entries()).map(([stepName, stats]) => ({
      stepName,
      averageDuration: stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length || 0,
      failureRate: stats.durations.length > 0 ? (stats.failures / stats.durations.length) * 100 : 0,
    }))

    return {
      totalWorkflows,
      completedWorkflows,
      abandonedWorkflows,
      averageDuration,
      completionRate,
      bottlenecks: bottlenecks.sort((a, b) => b.averageDuration - a.averageDuration).slice(0, 10),
    }
  }

  // Private helper methods

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('carmen_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('carmen_session_id', sessionId)
      }
      return sessionId
    }
    return 'server_session'
  }

  private startSession() {
    if (typeof window === 'undefined') return

    const sessionId = this.getCurrentSessionId()
    const existing = this.sessions.get(sessionId)

    if (!existing) {
      const session: UserSession = {
        sessionId,
        startTime: Date.now(),
        pageViews: 1,
        interactions: 0,
        features: [],
        workflows: [],
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }

      this.sessions.set(sessionId, session)

      this.trackEvent(
        'session_started',
        'user',
        {
          sessionId,
          userAgent: session.userAgent,
          referrer: session.referrer,
        },
        {
          tags: ['session', 'start'],
        }
      )
    }
  }

  private endCurrentSession() {
    if (typeof window === 'undefined') return

    const sessionId = this.getCurrentSessionId()
    const session = this.sessions.get(sessionId)

    if (session && !session.endTime) {
      session.endTime = Date.now()
      session.duration = session.endTime - session.startTime

      this.trackEvent(
        'session_ended',
        'user',
        {
          sessionId,
          duration: session.duration,
          pageViews: session.pageViews,
          interactions: session.interactions,
          featuresUsed: session.features.length,
        },
        {
          tags: ['session', 'end'],
        }
      )

      // Update session duration KPI
      this.updateKPI('average_session_duration', session.duration, 'ms')
    }
  }

  private updateSession(sessionId: string, event: BusinessEvent) {
    const session = this.sessions.get(sessionId)
    if (!session) return

    if (event.category === 'user' && event.eventType.includes('interaction')) {
      session.interactions++
    }

    if (event.category === 'feature') {
      const featureName = event.data.featureName || event.eventType
      if (!session.features.includes(featureName)) {
        session.features.push(featureName)
      }
    }
  }

  private calculateAverageSessionDuration(sessions: UserSession[]): number {
    const completedSessions = sessions.filter(s => s.duration)
    if (completedSessions.length === 0) return 0

    return completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
  }

  private calculateFeatureAdoptionRate(): number {
    const totalFeatures = this.featureUsage.size
    const usedFeatures = Array.from(this.featureUsage.values()).filter(f => f.usageCount > 0).length
    
    return totalFeatures > 0 ? (usedFeatures / totalFeatures) * 100 : 0
  }

  private getSystemUptime(): number {
    // This would integrate with system monitoring
    return 99.9 // Placeholder
  }

  private getErrorRate(since: number): number {
    // This would integrate with error tracking
    return 0.5 // Placeholder
  }

  private getUserSatisfactionScore(): number {
    // This would be calculated from user feedback/surveys
    return 4.2 // Placeholder out of 5
  }

  private getPerformanceScore(): number {
    // This would be calculated from performance metrics
    const performanceKPIs = this.getKPIs('api_response_time', 3600000) // Last hour
    if (performanceKPIs.length === 0) return 100

    const avgResponseTime = performanceKPIs.reduce((sum, k) => sum + k.value, 0) / performanceKPIs.length
    
    // Score based on response time (lower is better)
    if (avgResponseTime < 200) return 100
    if (avgResponseTime < 500) return 85
    if (avgResponseTime < 1000) return 70
    if (avgResponseTime < 2000) return 50
    return 30
  }

  private flushEvents() {
    if (this.events.length === 0) return

    // Send events to external analytics services
    this.sendToAnalytics(this.events)

    // Log summary
    logger.info('Business metrics flushed', {
      eventCount: this.events.length,
      sessionsActive: this.sessions.size,
      workflowsActive: this.workflows.size,
    })

    // Keep recent events
    const cutoff = Date.now() - 3600000 // 1 hour
    this.events = this.events.filter(e => e.timestamp >= cutoff)
  }

  private sendToAnalytics(events: BusinessEvent[]) {
    // Integration with analytics services would go here
    // Google Analytics, Mixpanel, Amplitude, etc.
    
    if (process.env.GOOGLE_ANALYTICS_ID) {
      this.sendToGoogleAnalytics(events)
    }
    
    if (process.env.MIXPANEL_TOKEN) {
      this.sendToMixpanel(events)
    }
  }

  private sendToGoogleAnalytics(events: BusinessEvent[]) {
    // Google Analytics integration
    try {
      events.forEach(event => {
        // gtag('event', event.eventType, ...)
      })
    } catch (error) {
      logger.warn('Failed to send events to Google Analytics', { error })
    }
  }

  private sendToMixpanel(events: BusinessEvent[]) {
    // Mixpanel integration
    try {
      events.forEach(event => {
        // mixpanel.track(event.eventType, event.data)
      })
    } catch (error) {
      logger.warn('Failed to send events to Mixpanel', { error })
    }
  }
}

// Export singleton instance
export const businessMetricsTracker = new BusinessMetricsTracker()

// React hooks for business metrics tracking
export function useBusinessMetrics(module: string) {
  const trackEvent = React.useCallback(
    (eventType: string, category: BusinessEvent['category'], data: Record<string, any>) => {
      return businessMetricsTracker.trackEvent(eventType, category, data, { module })
    },
    [module]
  )

  const trackInteraction = React.useCallback(
    (action: string, element: string, metadata?: Record<string, any>) => {
      return businessMetricsTracker.trackInteraction(action, element, { module, metadata })
    },
    [module]
  )

  const trackFeatureUsage = React.useCallback(
    (featureName: string) => {
      return businessMetricsTracker.trackFeatureUsage(featureName, module)
    },
    [module]
  )

  const startWorkflow = React.useCallback(
    (workflowName: string, metadata?: Record<string, any>) => {
      return businessMetricsTracker.startWorkflow(workflowName, module, { metadata })
    },
    [module]
  )

  return {
    trackEvent,
    trackInteraction,
    trackFeatureUsage,
    startWorkflow,
    addWorkflowStep: businessMetricsTracker.addWorkflowStep.bind(businessMetricsTracker),
    completeWorkflowStep: businessMetricsTracker.completeWorkflowStep.bind(businessMetricsTracker),
    completeWorkflow: businessMetricsTracker.completeWorkflow.bind(businessMetricsTracker),
  }
}

// Higher-order component for automatic interaction tracking
export function withBusinessMetrics<P extends object>(
  Component: React.ComponentType<P>,
  module: string,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { trackInteraction, trackFeatureUsage } = useBusinessMetrics(module)

    React.useEffect(() => {
      // Track component mount as feature usage
      trackFeatureUsage(componentName || Component.displayName || Component.name || 'UnknownComponent')
    }, [trackFeatureUsage, componentName])

    return <Component {...props} />
  }

  WrappedComponent.displayName = `withBusinessMetrics(${componentName || Component.displayName || Component.name})`
  return WrappedComponent
}