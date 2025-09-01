'use client'

import { AppError, ErrorType, ErrorSeverity } from '@/lib/error/error-manager'

// Error tracking configuration
interface ErrorTrackingConfig {
  dsn?: string
  environment: string
  release?: string
  sampleRate: number
  enableUserContext: boolean
  enablePerformanceMonitoring: boolean
  allowUrls: string[]
  denyUrls: string[]
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null
}

// User context for error tracking
interface UserContext {
  id?: string
  email?: string
  username?: string
  role?: string
  department?: string
}

// Error event structure
interface ErrorEvent {
  id: string
  timestamp: Date
  level: 'error' | 'warning' | 'info' | 'debug'
  message: string
  exception?: {
    type: string
    value: string
    stacktrace: string
  }
  tags: Record<string, string>
  extra: Record<string, any>
  user?: UserContext
  request?: {
    url: string
    method: string
    headers: Record<string, string>
    query: Record<string, string>
    body?: any
  }
  contexts: {
    browser: BrowserContext
    device: DeviceContext
    os: OSContext
    runtime: RuntimeContext
    app: AppContext
  }
  breadcrumbs: Breadcrumb[]
  fingerprint: string[]
}

// Context interfaces
interface BrowserContext {
  name: string
  version: string
  userAgent: string
  language: string
  cookiesEnabled: boolean
  onlineStatus: boolean
  timezone: string
}

interface DeviceContext {
  type: string
  brand?: string
  model?: string
  screenResolution: string
  colorDepth: number
  pixelRatio: number
  memory?: number
}

interface OSContext {
  name: string
  version: string
  platform: string
}

interface RuntimeContext {
  name: string
  version: string
  rawDescription: string
}

interface AppContext {
  name: string
  version: string
  buildNumber?: string
  environment: string
}

interface Breadcrumb {
  timestamp: Date
  message: string
  category: string
  level: 'error' | 'warning' | 'info' | 'debug'
  type: 'navigation' | 'http' | 'user' | 'error' | 'transaction'
  data?: Record<string, any>
}

// Performance monitoring
interface PerformanceMetrics {
  navigationTiming: PerformanceNavigationTiming
  paintMetrics: Record<string, number>
  vitals: {
    fcp?: number // First Contentful Paint
    lcp?: number // Largest Contentful Paint
    fid?: number // First Input Delay
    cls?: number // Cumulative Layout Shift
    ttfb?: number // Time to First Byte
  }
  resourceTiming: PerformanceResourceTiming[]
  memoryUsage?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

// Error tracking service
class ErrorTrackingService {
  private config: ErrorTrackingConfig
  private breadcrumbs: Breadcrumb[] = []
  private userContext: UserContext = {}
  private tags: Record<string, string> = {}
  private isEnabled = true
  private queue: ErrorEvent[] = []
  private isOnline = navigator.onLine

  constructor(config: Partial<ErrorTrackingConfig> = {}) {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      sampleRate: 1.0,
      enableUserContext: true,
      enablePerformanceMonitoring: true,
      allowUrls: [],
      denyUrls: [],
      ...config
    }

    this.initialize()
  }

  private initialize() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers()
    
    // Set up performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring()
    }

    // Set up network status monitoring
    this.setupNetworkMonitoring()

    // Set up automatic breadcrumb collection
    this.setupBreadcrumbCollection()

    // Process queued events when coming back online
    this.processQueueWhenOnline()
  }

  // Configure error tracking
  public configure(config: Partial<ErrorTrackingConfig>) {
    this.config = { ...this.config, ...config }
  }

  // Set user context
  public setUser(user: UserContext) {
    this.userContext = user
  }

  // Set tags for error events
  public setTag(key: string, value: string) {
    this.tags[key] = value
  }

  public setTags(tags: Record<string, string>) {
    this.tags = { ...this.tags, ...tags }
  }

  // Add breadcrumb
  public addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
    this.breadcrumbs.push({
      timestamp: new Date(),
      ...breadcrumb
    })

    // Keep only last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50)
    }
  }

  // Capture error
  public captureError(error: Error | AppError, extra?: Record<string, any>) {
    if (!this.shouldCaptureError(error)) {
      return
    }

    const errorEvent = this.createErrorEvent(error, extra)
    this.sendEvent(errorEvent)
  }

  // Capture message
  public captureMessage(
    message: string, 
    level: 'error' | 'warning' | 'info' | 'debug' = 'info',
    extra?: Record<string, any>
  ) {
    const errorEvent = this.createMessageEvent(message, level, extra)
    this.sendEvent(errorEvent)
  }

  // Capture exception manually
  public captureException(
    exception: { type: string; value: string; stacktrace?: string },
    extra?: Record<string, any>
  ) {
    const errorEvent = this.createExceptionEvent(exception, extra)
    this.sendEvent(errorEvent)
  }

  // Track custom event
  public trackEvent(
    name: string,
    properties?: Record<string, any>,
    level: 'error' | 'warning' | 'info' | 'debug' = 'info'
  ) {
    this.addBreadcrumb({
      message: name,
      category: 'custom',
      level,
      type: 'user',
      data: properties
    })

    if (level === 'error' || level === 'warning') {
      this.captureMessage(`Custom event: ${name}`, level, properties)
    }
  }

  // Performance monitoring
  public capturePerformanceMetrics() {
    if (!this.config.enablePerformanceMonitoring) return

    const metrics = this.collectPerformanceMetrics()
    
    // Send performance data
    this.trackEvent('performance_metrics', {
      ...metrics,
      url: window.location.href,
      userAgent: navigator.userAgent
    }, 'info')
  }

  private setupGlobalErrorHandlers() {
    // Unhandled errors
    window.addEventListener('error', (event) => {
      if (event.error) {
        this.captureError(event.error, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
      } else {
        this.captureMessage(event.message, 'error', {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
      }
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      let error: Error
      
      if (event.reason instanceof Error) {
        error = event.reason
      } else {
        error = new Error(String(event.reason))
      }

      this.captureError(error, {
        type: 'unhandledrejection'
      })
    })

    // Console errors
    if (typeof console !== 'undefined') {
      const originalConsoleError = console.error
      console.error = (...args: any[]) => {
        originalConsoleError.apply(console, args)
        
        this.addBreadcrumb({
          message: args.join(' '),
          category: 'console',
          level: 'error',
          type: 'error'
        })
      }
    }
  }

  private setupPerformanceMonitoring() {
    // Web Vitals
    this.observeWebVitals()

    // Navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Capture navigation timing on load
      window.addEventListener('load', () => {
        setTimeout(() => this.capturePerformanceMetrics(), 1000)
      })
    }

    // Long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.addBreadcrumb({
                message: 'Long task detected',
                category: 'performance',
                level: 'warning',
                type: 'transaction',
                data: {
                  duration: entry.duration,
                  startTime: entry.startTime
                }
              })
            }
          }
        })
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // PerformanceObserver not supported
      }
    }
  }

  private setupNetworkMonitoring() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.addBreadcrumb({
        message: 'Network connection restored',
        category: 'network',
        level: 'info',
        type: 'navigation'
      })
      this.processQueueWhenOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.addBreadcrumb({
        message: 'Network connection lost',
        category: 'network',
        level: 'warning',
        type: 'navigation'
      })
    })

    // HTTP request monitoring (if using fetch)
    if (typeof fetch !== 'undefined') {
      const originalFetch = fetch
      window.fetch = async (...args) => {
        const [resource, config] = args
        const startTime = performance.now()
        
        try {
          const response = await originalFetch(...args)
          const duration = performance.now() - startTime
          
          this.addBreadcrumb({
            message: `HTTP ${config?.method || 'GET'} ${resource}`,
            category: 'http',
            level: response.ok ? 'info' : 'error',
            type: 'http',
            data: {
              url: resource.toString(),
              method: config?.method || 'GET',
              status: response.status,
              duration: Math.round(duration)
            }
          })

          return response
        } catch (error) {
          const duration = performance.now() - startTime
          
          this.addBreadcrumb({
            message: `HTTP ${config?.method || 'GET'} ${resource} failed`,
            category: 'http',
            level: 'error',
            type: 'http',
            data: {
              url: resource.toString(),
              method: config?.method || 'GET',
              error: error instanceof Error ? error.message : String(error),
              duration: Math.round(duration)
            }
          })

          throw error
        }
      }
    }
  }

  private setupBreadcrumbCollection() {
    // Click events
    document.addEventListener('click', (event) => {
      const target = event.target as Element
      const tagName = target?.tagName?.toLowerCase()
      
      if (['button', 'a', 'input'].includes(tagName)) {
        this.addBreadcrumb({
          message: `User clicked ${tagName}`,
          category: 'ui',
          level: 'info',
          type: 'user',
          data: {
            tagName,
            id: target.id,
            className: target.className,
            text: target.textContent?.slice(0, 100)
          }
        })
      }
    })

    // Navigation events
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        message: `Navigation to ${window.location.pathname}`,
        category: 'navigation',
        level: 'info',
        type: 'navigation',
        data: {
          from: document.referrer,
          to: window.location.href
        }
      })
    })

    // Form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement
      
      this.addBreadcrumb({
        message: 'Form submitted',
        category: 'ui',
        level: 'info',
        type: 'user',
        data: {
          formId: target.id,
          action: target.action,
          method: target.method
        }
      })
    })
  }

  private observeWebVitals() {
    // This is a simplified version - in production, use the official web-vitals library
    if ('PerformanceObserver' in window) {
      try {
        // FCP (First Contentful Paint)
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.trackEvent('web_vital_fcp', { value: entry.startTime }, 'info')
            }
          }
        }).observe({ entryTypes: ['paint'] })

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          if (lastEntry) {
            this.trackEvent('web_vital_lcp', { value: lastEntry.startTime }, 'info')
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          this.trackEvent('web_vital_cls', { value: clsValue }, 'info')
        }).observe({ entryTypes: ['layout-shift'] })

      } catch (e) {
        // PerformanceObserver not fully supported
      }
    }
  }

  private collectPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

    const paintMetrics: Record<string, number> = {}
    paint.forEach(entry => {
      paintMetrics[entry.name] = entry.startTime
    })

    const metrics: PerformanceMetrics = {
      navigationTiming: navigation,
      paintMetrics,
      vitals: {},
      resourceTiming: resources.slice(-10), // Last 10 resources only
    }

    // Memory usage (Chrome only)
    const memory = (performance as any).memory
    if (memory) {
      metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    }

    return metrics
  }

  private shouldCaptureError(error: Error | AppError): boolean {
    if (!this.isEnabled) return false
    if (Math.random() > this.config.sampleRate) return false

    // Filter by allow/deny URLs
    const currentUrl = window.location.href
    
    if (this.config.denyUrls.length > 0) {
      if (this.config.denyUrls.some(pattern => new RegExp(pattern).test(currentUrl))) {
        return false
      }
    }

    if (this.config.allowUrls.length > 0) {
      if (!this.config.allowUrls.some(pattern => new RegExp(pattern).test(currentUrl))) {
        return false
      }
    }

    return true
  }

  private createErrorEvent(error: Error | AppError, extra?: Record<string, any>): ErrorEvent {
    const isAppError = 'type' in error && 'severity' in error
    const appError = error as AppError

    return {
      id: this.generateEventId(),
      timestamp: new Date(),
      level: this.getEventLevel(isAppError ? appError.severity : ErrorSeverity.MEDIUM),
      message: error.message,
      exception: {
        type: error.name,
        value: error.message,
        stacktrace: error.stack || ''
      },
      tags: {
        ...this.tags,
        ...(isAppError && {
          errorType: appError.type,
          severity: appError.severity,
          retryable: String(appError.retryable || false)
        })
      },
      extra: {
        ...extra,
        ...(isAppError && appError.details && { details: appError.details }),
        ...(isAppError && appError.context && { context: appError.context })
      },
      user: this.config.enableUserContext ? this.userContext : undefined,
      contexts: this.getContexts(),
      breadcrumbs: [...this.breadcrumbs],
      fingerprint: this.generateFingerprint(error),
      request: this.getRequestContext()
    }
  }

  private createMessageEvent(
    message: string, 
    level: 'error' | 'warning' | 'info' | 'debug',
    extra?: Record<string, any>
  ): ErrorEvent {
    return {
      id: this.generateEventId(),
      timestamp: new Date(),
      level,
      message,
      tags: { ...this.tags },
      extra: extra || {},
      user: this.config.enableUserContext ? this.userContext : undefined,
      contexts: this.getContexts(),
      breadcrumbs: [...this.breadcrumbs],
      fingerprint: [message],
      request: this.getRequestContext()
    }
  }

  private createExceptionEvent(
    exception: { type: string; value: string; stacktrace?: string },
    extra?: Record<string, any>
  ): ErrorEvent {
    return {
      id: this.generateEventId(),
      timestamp: new Date(),
      level: 'error',
      message: exception.value,
      exception: {
        type: exception.type,
        value: exception.value,
        stacktrace: exception.stacktrace || ''
      },
      tags: { ...this.tags },
      extra: extra || {},
      user: this.config.enableUserContext ? this.userContext : undefined,
      contexts: this.getContexts(),
      breadcrumbs: [...this.breadcrumbs],
      fingerprint: [exception.type, exception.value],
      request: this.getRequestContext()
    }
  }

  private getEventLevel(severity: ErrorSeverity): 'error' | 'warning' | 'info' | 'debug' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warning'
      case ErrorSeverity.LOW:
        return 'info'
      default:
        return 'error'
    }
  }

  private getContexts() {
    return {
      browser: {
        name: this.getBrowserName(),
        version: this.getBrowserVersion(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      device: {
        type: this.getDeviceType(),
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        memory: (navigator as any).deviceMemory
      },
      os: {
        name: this.getOSName(),
        version: this.getOSVersion(),
        platform: navigator.platform
      },
      runtime: {
        name: 'browser',
        version: this.getBrowserVersion(),
        rawDescription: navigator.userAgent
      },
      app: {
        name: 'Carmen ERP',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: this.config.environment
      }
    }
  }

  private getRequestContext() {
    const url = new URL(window.location.href)
    return {
      url: window.location.href,
      method: 'GET',
      headers: {
        'User-Agent': navigator.userAgent,
        'Accept-Language': navigator.language
      },
      query: Object.fromEntries(url.searchParams.entries())
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  private generateFingerprint(error: Error): string[] {
    // Create a unique fingerprint for error grouping
    const fingerprint = [error.name, error.message]
    
    if (error.stack) {
      // Extract the first few lines of stack trace for grouping
      const stackLines = error.stack.split('\n').slice(0, 3)
      fingerprint.push(...stackLines)
    }

    return fingerprint
  }

  private sendEvent(event: ErrorEvent) {
    if (this.config.beforeSend) {
      const modifiedEvent = this.config.beforeSend(event)
      if (!modifiedEvent) return // Event filtered out
      event = modifiedEvent
    }

    if (this.isOnline) {
      this.transmitEvent(event)
    } else {
      // Queue for later transmission
      this.queue.push(event)
    }
  }

  private async transmitEvent(event: ErrorEvent) {
    try {
      if (this.config.dsn) {
        // Send to external service (Sentry, LogRocket, etc.)
        await fetch(this.config.dsn, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Sentry-Auth': 'Sentry sentry_key=YOUR_KEY' // Replace with actual auth
          },
          body: JSON.stringify(event)
        })
      } else {
        // Development: log to console
        console.group('🚨 Error Tracking Event')
        console.error('Event:', event)
        console.groupEnd()
      }
    } catch (error) {
      console.error('Failed to send error event:', error)
      // Optionally queue for retry
    }
  }

  private processQueueWhenOnline() {
    if (this.isOnline && this.queue.length > 0) {
      const events = [...this.queue]
      this.queue = []
      
      events.forEach(event => this.transmitEvent(event))
    }
  }

  // Helper methods for browser detection
  private getBrowserName(): string {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getBrowserVersion(): string {
    const ua = navigator.userAgent
    const match = ua.match(/(chrome|firefox|safari|edge)\/(\d+)/i)
    return match ? match[2] : 'Unknown'
  }

  private getOSName(): string {
    const ua = navigator.userAgent
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac OS X')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getOSVersion(): string {
    const ua = navigator.userAgent
    const match = ua.match(/(Windows NT|Mac OS X|Android|iOS) ([\d_.]+)/i)
    return match ? match[2].replace(/_/g, '.') : 'Unknown'
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent
    if (ua.includes('Mobile')) return 'mobile'
    if (ua.includes('Tablet')) return 'tablet'
    return 'desktop'
  }

  // Public control methods
  public enable() {
    this.isEnabled = true
  }

  public disable() {
    this.isEnabled = false
  }

  public clearBreadcrumbs() {
    this.breadcrumbs = []
  }

  public getQueue(): ErrorEvent[] {
    return [...this.queue]
  }

  public clearQueue() {
    this.queue = []
  }
}

// Export singleton instance
export const errorTracker = new ErrorTrackingService({
  environment: process.env.NODE_ENV || 'development',
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  enableUserContext: true,
  enablePerformanceMonitoring: true
})

// Export the service class and types
export { ErrorTrackingService, type ErrorEvent, type UserContext, type PerformanceMetrics }
export default errorTracker