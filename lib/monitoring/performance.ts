/**
 * Application Performance Monitoring (APM) for Carmen ERP
 * Tracks Core Web Vitals, user journeys, and performance metrics
 */

import { getMonitoringConfig, businessMetricsConfig } from './config'
import { logger } from './logger'

interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: number
  context?: Record<string, any>
  tags?: string[]
}

interface UserJourney {
  journeyId: string
  userId?: string
  sessionId: string
  startTime: number
  steps: JourneyStep[]
  completed: boolean
  totalDuration?: number
  context: Record<string, any>
}

interface JourneyStep {
  stepName: string
  startTime: number
  endTime?: number
  duration?: number
  status: 'started' | 'completed' | 'failed' | 'abandoned'
  metadata?: Record<string, any>
}

interface WebVitalsMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  tti?: number // Time to Interactive
  tbt?: number // Total Blocking Time
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private journeys: Map<string, UserJourney> = new Map()
  private webVitals: WebVitalsMetrics = {}
  private config = getMonitoringConfig()
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeBrowser()
    }
  }

  private initializeBrowser() {
    if (this.isInitialized) return
    
    try {
      // Initialize performance observer
      this.setupPerformanceObserver()
      
      // Setup Web Vitals tracking
      this.setupWebVitals()
      
      // Track page load performance
      this.trackPageLoad()
      
      // Setup resource performance tracking
      this.setupResourceTracking()
      
      this.isInitialized = true
      logger.info('Performance monitoring initialized', { 
        config: this.config.enabledServices.performanceMonitoring 
      })
    } catch (error) {
      logger.error('Failed to initialize performance monitoring', { error })
    }
  }

  private setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported')
      return
    }

    // Observer for navigation timing
    const navObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.trackNavigationTiming(entry as PerformanceNavigationTiming)
      })
    })

    // Observer for resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.trackResourceTiming(entry as PerformanceResourceTiming)
      })
    })

    // Observer for user timing
    const measureObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.trackCustomMeasure(entry as PerformanceMeasure)
      })
    })

    try {
      navObserver.observe({ type: 'navigation', buffered: true })
      resourceObserver.observe({ type: 'resource', buffered: true })
      measureObserver.observe({ type: 'measure', buffered: true })
    } catch (error) {
      logger.error('Failed to setup performance observers', { error })
    }
  }

  private setupWebVitals() {
    // Use web-vitals library if available, otherwise implement basic tracking
    this.setupCLS()
    this.setupFID()
    this.setupLCP()
    this.setupFCP()
    this.setupTTFB()
  }

  private setupCLS() {
    let clsValue = 0
    let clsEntries: any[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          clsEntries.push(entry)
        }
      }
    })

    observer.observe({ type: 'layout-shift', buffered: true })

    // Report CLS when page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.webVitals.cls = clsValue
        this.recordMetric({
          name: 'web_vitals_cls',
          value: clsValue,
          unit: 'count',
          timestamp: Date.now(),
          tags: ['web-vitals', 'core']
        })
      }
    })
  }

  private setupFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime
        this.webVitals.fid = fid
        this.recordMetric({
          name: 'web_vitals_fid',
          value: fid,
          unit: 'ms',
          timestamp: Date.now(),
          tags: ['web-vitals', 'core']
        })
        break // Only report the first input
      }
    })

    observer.observe({ type: 'first-input', buffered: true })
  }

  private setupLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      const lcp = lastEntry.startTime
      
      this.webVitals.lcp = lcp
      this.recordMetric({
        name: 'web_vitals_lcp',
        value: lcp,
        unit: 'ms',
        timestamp: Date.now(),
        tags: ['web-vitals', 'core']
      })
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  }

  private setupFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const fcp = entry.startTime
          this.webVitals.fcp = fcp
          this.recordMetric({
            name: 'web_vitals_fcp',
            value: fcp,
            unit: 'ms',
            timestamp: Date.now(),
            tags: ['web-vitals']
          })
        }
      }
    })

    observer.observe({ type: 'paint', buffered: true })
  }

  private setupTTFB() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      this.webVitals.ttfb = ttfb
      this.recordMetric({
        name: 'web_vitals_ttfb',
        value: ttfb,
        unit: 'ms',
        timestamp: Date.now(),
        tags: ['web-vitals']
      })
    }
  }

  private trackNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcp_connect: entry.connectEnd - entry.connectStart,
      request_response: entry.responseEnd - entry.requestStart,
      dom_processing: entry.domComplete - entry.domLoading,
      load_complete: entry.loadEventEnd - entry.navigationStart,
    }

    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric({
        name: `navigation_${name}`,
        value,
        unit: 'ms',
        timestamp: Date.now(),
        tags: ['navigation', 'timing']
      })
    })
  }

  private trackResourceTiming(entry: PerformanceResourceTiming) {
    // Track slow resources
    const duration = entry.responseEnd - entry.requestStart
    const isSlowResource = duration > 1000 // 1 second threshold

    if (isSlowResource) {
      this.recordMetric({
        name: 'slow_resource',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: {
          resource: entry.name,
          type: this.getResourceType(entry.name),
          size: entry.transferSize || 0
        },
        tags: ['resource', 'slow']
      })
    }
  }

  private trackCustomMeasure(entry: PerformanceMeasure) {
    this.recordMetric({
      name: `custom_measure_${entry.name}`,
      value: entry.duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: ['custom', 'measure']
    })
  }

  private trackPageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.recordMetric({
        name: 'page_load_time',
        value: loadTime,
        unit: 'ms',
        timestamp: Date.now(),
        context: {
          url: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent
        },
        tags: ['page-load']
      })
    })
  }

  private setupResourceTracking() {
    // Track image loading
    document.addEventListener('DOMContentLoaded', () => {
      const images = document.querySelectorAll('img')
      images.forEach((img) => {
        img.addEventListener('load', () => {
          this.recordMetric({
            name: 'image_load_success',
            value: 1,
            unit: 'count',
            timestamp: Date.now(),
            context: { src: img.src },
            tags: ['image', 'load', 'success']
          })
        })

        img.addEventListener('error', () => {
          this.recordMetric({
            name: 'image_load_error',
            value: 1,
            unit: 'count',
            timestamp: Date.now(),
            context: { src: img.src },
            tags: ['image', 'load', 'error']
          })
        })
      })
    })
  }

  // Public API methods

  /**
   * Start tracking a user journey
   */
  startJourney(journeyName: string, context: Record<string, any> = {}, userId?: string): string {
    const journeyId = `${journeyName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sessionId = this.getSessionId()

    const journey: UserJourney = {
      journeyId,
      userId,
      sessionId,
      startTime: Date.now(),
      steps: [],
      completed: false,
      context: {
        ...context,
        journeyName,
        url: typeof window !== 'undefined' ? window.location.pathname : undefined
      }
    }

    this.journeys.set(journeyId, journey)
    
    logger.info('Journey started', { journeyId, journeyName, userId })
    
    return journeyId
  }

  /**
   * Add a step to an existing journey
   */
  addJourneyStep(journeyId: string, stepName: string, metadata?: Record<string, any>) {
    const journey = this.journeys.get(journeyId)
    if (!journey) {
      logger.warn('Journey not found for step', { journeyId, stepName })
      return
    }

    const step: JourneyStep = {
      stepName,
      startTime: Date.now(),
      status: 'started',
      metadata
    }

    journey.steps.push(step)
  }

  /**
   * Complete a journey step
   */
  completeJourneyStep(journeyId: string, stepName: string, status: 'completed' | 'failed' | 'abandoned' = 'completed') {
    const journey = this.journeys.get(journeyId)
    if (!journey) return

    const step = journey.steps.find(s => s.stepName === stepName && !s.endTime)
    if (!step) return

    step.endTime = Date.now()
    step.duration = step.endTime - step.startTime
    step.status = status

    this.recordMetric({
      name: `journey_step_${status}`,
      value: step.duration,
      unit: 'ms',
      timestamp: Date.now(),
      context: {
        journeyId,
        stepName,
        journeyName: journey.context.journeyName
      },
      tags: ['journey', 'step', status]
    })
  }

  /**
   * Complete a user journey
   */
  completeJourney(journeyId: string, status: 'completed' | 'failed' | 'abandoned' = 'completed') {
    const journey = this.journeys.get(journeyId)
    if (!journey) return

    journey.completed = status === 'completed'
    journey.totalDuration = Date.now() - journey.startTime

    this.recordMetric({
      name: `journey_${status}`,
      value: journey.totalDuration,
      unit: 'ms',
      timestamp: Date.now(),
      context: {
        journeyId,
        journeyName: journey.context.journeyName,
        stepCount: journey.steps.length,
        userId: journey.userId
      },
      tags: ['journey', status]
    })

    // Check if journey exceeded threshold
    const threshold = this.getJourneyThreshold(journey.context.journeyName)
    if (journey.totalDuration > threshold) {
      logger.warn('Journey exceeded threshold', {
        journeyId,
        journeyName: journey.context.journeyName,
        duration: journey.totalDuration,
        threshold
      })
    }

    // Clean up completed journey after some time
    setTimeout(() => {
      this.journeys.delete(journeyId)
    }, 300000) // 5 minutes
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)

    // Check thresholds
    this.checkThresholds(metric)

    // Send to external services if configured
    this.sendToExternalServices(metric)

    // Log significant metrics
    if (metric.tags?.includes('core') || metric.value > this.getMetricThreshold(metric.name)) {
      logger.info('Performance metric recorded', metric)
    }

    // Prevent memory buildup
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000)
    }
  }

  /**
   * Measure execution time of a function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name: `async_operation_${name}`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context,
        tags: ['async', 'operation', 'success']
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name: `async_operation_${name}`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: { ...context, error: String(error) },
        tags: ['async', 'operation', 'error']
      })
      
      throw error
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(filters?: { 
    name?: string 
    tags?: string[]
    since?: number
    limit?: number
  }): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics]

    if (filters?.since) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= filters.since!)
    }

    if (filters?.name) {
      filteredMetrics = filteredMetrics.filter(m => m.name.includes(filters.name!))
    }

    if (filters?.tags) {
      filteredMetrics = filteredMetrics.filter(m => 
        filters.tags!.some(tag => m.tags?.includes(tag))
      )
    }

    if (filters?.limit) {
      filteredMetrics = filteredMetrics.slice(-filters.limit)
    }

    return filteredMetrics
  }

  /**
   * Get Web Vitals metrics
   */
  getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals }
  }

  /**
   * Get active journeys
   */
  getActiveJourneys(): UserJourney[] {
    return Array.from(this.journeys.values()).filter(j => !j.completed)
  }

  // Private helper methods

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('carmen_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('carmen_session_id', sessionId)
    }
    return sessionId
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image'
    if (url.match(/\.(js)$/i)) return 'script'
    if (url.match(/\.(css)$/i)) return 'stylesheet'
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font'
    return 'other'
  }

  private getJourneyThreshold(journeyName: string): number {
    const thresholds: Record<string, number> = {
      'purchase-request-creation': 30000, // 30 seconds
      'purchase-order-approval': 20000, // 20 seconds
      'goods-receipt-processing': 25000, // 25 seconds
      'vendor-onboarding': 60000, // 1 minute
      'inventory-adjustment': 15000, // 15 seconds
    }
    return thresholds[journeyName] || 30000 // Default 30 seconds
  }

  private getMetricThreshold(metricName: string): number {
    const thresholds: Record<string, number> = {
      'page_load_time': this.config.thresholds.performance.loadTime,
      'web_vitals_lcp': this.config.thresholds.performance.largestContentfulPaint,
      'web_vitals_fcp': this.config.thresholds.performance.firstContentfulPaint,
      'web_vitals_fid': this.config.thresholds.performance.firstInputDelay,
    }
    return thresholds[metricName] || Infinity
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.getMetricThreshold(metric.name)
    if (metric.value > threshold) {
      logger.warn('Performance threshold exceeded', {
        metric: metric.name,
        value: metric.value,
        threshold,
        context: metric.context
      })
    }
  }

  private sendToExternalServices(metric: PerformanceMetric) {
    // Implementation for sending to external APM services
    // This would integrate with services like DataDog, New Relic, etc.
    if (this.config.environment === 'production') {
      // Send to configured APM service
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now()

  React.useEffect(() => {
    const mountTime = performance.now() - startTime
    performanceMonitor.recordMetric({
      name: 'component_mount_time',
      value: mountTime,
      unit: 'ms',
      timestamp: Date.now(),
      context: { componentName },
      tags: ['component', 'mount']
    })

    return () => {
      const unmountTime = performance.now()
      performanceMonitor.recordMetric({
        name: 'component_unmount_time',
        value: unmountTime - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        context: { componentName },
        tags: ['component', 'unmount']
      })
    }
  }, [componentName, startTime])

  return {
    trackInteraction: (interactionName: string) => {
      performanceMonitor.recordMetric({
        name: 'component_interaction',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        context: { componentName, interactionName },
        tags: ['component', 'interaction']
      })
    }
  }
}

// Next.js middleware integration
export function createPerformanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - startTime
      performanceMonitor.recordMetric({
        name: 'api_response_time',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent')
        },
        tags: ['api', 'response']
      })
    })
    
    next()
  }
}