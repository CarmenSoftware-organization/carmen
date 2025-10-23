/**
 * Centralized Logging System for Carmen ERP
 * Provides structured logging with proper context, filtering, and external service integration
 */

import { getMonitoringConfig } from './config'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  tags?: string[]
  userId?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  spanId?: string
  component?: string
  action?: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string | number
  }
  performance?: {
    memory?: number
    timing?: Record<string, number>
  }
  business?: {
    module: string
    workflow?: string
    entity?: string
    entityId?: string
  }
  security?: {
    ip?: string
    userAgent?: string
    riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  }
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableExternal: boolean
  format: 'json' | 'text'
  maxFileSize: number
  maxFiles: number
  bufferSize: number
  flushInterval: number
}

class Logger {
  private config: LoggerConfig
  private buffer: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout
  private monitoringConfig = getMonitoringConfig()

  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  }

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: this.getDefaultLogLevel(),
      enableConsole: true,
      enableFile: process.env.NODE_ENV === 'production',
      enableExternal: process.env.NODE_ENV === 'production',
      format: 'json',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      bufferSize: 100,
      flushInterval: 5000, // 5 seconds
      ...config,
    }

    this.setupPeriodicFlush()
    this.setupProcessHandlers()
  }

  private getDefaultLogLevel(): LogLevel {
    const env = process.env.NODE_ENV
    if (env === 'production') {
      return 'info'
    }
    return 'debug'
  }

  private setupPeriodicFlush() {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private setupProcessHandlers() {
    // Ensure logs are flushed on process exit
    const flushAndExit = () => {
      this.flush()
      process.exit(0)
    }

    process.on('SIGINT', flushAndExit)
    process.on('SIGTERM', flushAndExit)
    process.on('uncaughtException', (error) => {
      this.fatal('Uncaught exception', { error: this.serializeError(error) })
      this.flush()
      process.exit(1)
    })
    process.on('unhandledRejection', (reason, promise) => {
      this.error('Unhandled promise rejection', {
        reason: String(reason),
        promise: String(promise),
      })
    })
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.config.level]
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    const timestamp = new Date().toISOString()
    
    // Extract context information
    const {
      userId,
      sessionId,
      requestId,
      traceId,
      spanId,
      component,
      action,
      duration,
      error,
      performance,
      business,
      security,
      tags,
      ...additionalContext
    } = context || {}

    const entry: LogEntry = {
      timestamp,
      level,
      message,
      ...(Object.keys(additionalContext).length > 0 && { context: additionalContext }),
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),
      ...(requestId && { requestId }),
      ...(traceId && { traceId }),
      ...(spanId && { spanId }),
      ...(component && { component }),
      ...(action && { action }),
      ...(duration && { duration }),
      ...(error && { error: this.serializeError(error) }),
      ...(performance && { performance }),
      ...(business && { business }),
      ...(security && { security }),
      ...(tags && { tags: Array.isArray(tags) ? tags : [tags] }),
    }

    return entry
  }

  private serializeError(error: any): LogEntry['error'] {
    if (error instanceof Error) {
      const serialized: LogEntry['error'] = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }

      // Handle error.cause if it exists
      if ('cause' in error && error.cause) {
        if (typeof error.cause === 'string' || typeof error.cause === 'number') {
          serialized.code = error.cause
        }
      }

      return serialized
    }

    if (typeof error === 'object' && error !== null) {
      return {
        name: error.name || 'UnknownError',
        message: error.message || String(error),
        ...(error.stack && { stack: error.stack }),
        ...(error.code && { code: error.code }),
      }
    }

    return {
      name: 'UnknownError',
      message: String(error),
    }
  }

  private formatEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry)
    }
    
    // Text format
    const { timestamp, level, message, context, error } = entry
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` ${JSON.stringify(context)}`
    }
    
    if (error) {
      formatted += `\n${error.stack || error.message}`
    }
    
    return formatted
  }

  private addToBuffer(entry: LogEntry) {
    this.buffer.push(entry)
    
    // Auto-flush if buffer is full or level is fatal
    if (this.buffer.length >= this.config.bufferSize || entry.level === 'fatal') {
      this.flush()
    }
  }

  private flush() {
    if (this.buffer.length === 0) return

    const entries = [...this.buffer]
    this.buffer = []

    this.writeEntries(entries)
  }

  private writeEntries(entries: LogEntry[]) {
    if (this.config.enableConsole) {
      this.writeToConsole(entries)
    }

    if (this.config.enableFile && typeof process !== 'undefined') {
      this.writeToFile(entries)
    }

    if (this.config.enableExternal) {
      this.sendToExternalServices(entries)
    }
  }

  private writeToConsole(entries: LogEntry[]) {
    entries.forEach(entry => {
      const formatted = this.formatEntry(entry)
      
      switch (entry.level) {
        case 'debug':
          console.debug(formatted)
          break
        case 'info':
          console.info(formatted)
          break
        case 'warn':
          console.warn(formatted)
          break
        case 'error':
        case 'fatal':
          console.error(formatted)
          break
      }
    })
  }

  private async writeToFile(entries: LogEntry[]) {
    if (typeof window !== 'undefined') return // No file writing in browser

    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const logDir = path.join(process.cwd(), 'logs')
      const logFile = path.join(logDir, `carmen-${process.env.NODE_ENV || 'development'}.log`)
      
      // Ensure log directory exists
      await fs.mkdir(logDir, { recursive: true })
      
      const content = entries.map(entry => this.formatEntry(entry)).join('\n') + '\n'
      await fs.appendFile(logFile, content)
      
    } catch (error) {
      console.error('Failed to write logs to file:', error)
    }
  }

  private sendToExternalServices(entries: LogEntry[]) {
    // Send to configured external logging services
    entries.forEach(entry => {
      this.sendToSentry(entry)
      this.sendToDatadog(entry)
      this.sendToElasticSearch(entry)
    })
  }

  private sendToSentry(entry: LogEntry) {
    if (!process.env.SENTRY_DSN) return

    try {
      // Integration with Sentry would go here
      if (entry.level === 'error' || entry.level === 'fatal') {
        // Sentry.captureException(entry.error)
      }
    } catch (error) {
      console.error('Failed to send log to Sentry:', error)
    }
  }

  private sendToDatadog(entry: LogEntry) {
    if (!process.env.DD_API_KEY) return

    try {
      // Integration with Datadog would go here
      // This would use Datadog's HTTP API or SDK
    } catch (error) {
      console.error('Failed to send log to Datadog:', error)
    }
  }

  private sendToElasticSearch(entry: LogEntry) {
    if (!process.env.ELASTICSEARCH_URL) return

    try {
      // Integration with Elasticsearch would go here
    } catch (error) {
      console.error('Failed to send log to Elasticsearch:', error)
    }
  }

  // Public logging methods

  debug(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('debug')) return
    const entry = this.createLogEntry('debug', message, context)
    this.addToBuffer(entry)
  }

  info(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('info')) return
    const entry = this.createLogEntry('info', message, context)
    this.addToBuffer(entry)
  }

  warn(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('warn')) return
    const entry = this.createLogEntry('warn', message, context)
    this.addToBuffer(entry)
  }

  error(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('error')) return
    const entry = this.createLogEntry('error', message, context)
    this.addToBuffer(entry)
  }

  fatal(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('fatal', message, context)
    this.addToBuffer(entry)
  }

  // Business-specific logging methods

  auditLog(action: string, context: {
    userId: string
    entityType: string
    entityId: string
    changes?: Record<string, { from: any; to: any }>
    metadata?: Record<string, any>
  }) {
    this.info(`Audit: ${action}`, {
      ...context,
      tags: ['audit'],
      business: {
        module: 'audit',
        workflow: 'user-action',
        entity: context.entityType,
        entityId: context.entityId,
      },
    })
  }

  securityLog(event: string, context: {
    userId?: string
    ip?: string
    userAgent?: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    metadata?: Record<string, any>
  }) {
    const level = context.riskLevel === 'critical' ? 'error' : 
                  context.riskLevel === 'high' ? 'warn' : 'info'
                  
    this[level](`Security: ${event}`, {
      ...context.metadata,
      tags: ['security', context.riskLevel],
      security: {
        ip: context.ip,
        userAgent: context.userAgent,
        riskLevel: context.riskLevel,
      },
      userId: context.userId,
    })
  }

  businessLog(module: string, workflow: string, event: string, context?: {
    userId?: string
    entityType?: string
    entityId?: string
    duration?: number
    metadata?: Record<string, any>
  }) {
    this.info(`Business: ${event}`, {
      ...context?.metadata,
      userId: context?.userId,
      duration: context?.duration,
      tags: ['business', module, workflow],
      business: {
        module,
        workflow,
        entity: context?.entityType,
        entityId: context?.entityId,
      },
    })
  }

  performanceLog(operation: string, duration: number, context?: {
    userId?: string
    metadata?: Record<string, any>
  }) {
    const level = duration > 5000 ? 'warn' : 'info' // Warn if over 5 seconds
    
    this[level](`Performance: ${operation}`, {
      ...context?.metadata,
      userId: context?.userId,
      duration,
      tags: ['performance'],
      performance: {
        timing: { [operation]: duration },
        memory: this.getMemoryUsage(),
      },
    })
  }

  // Utility methods

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }
    return 0
  }

  createChildLogger(context: Record<string, any>): Logger {
    const childLogger = new Logger(this.config)
    
    // Override log methods to include parent context
    const originalMethods = ['debug', 'info', 'warn', 'error', 'fatal'] as const
    
    originalMethods.forEach(method => {
      const originalMethod = childLogger[method].bind(childLogger)
      childLogger[method] = (message: string, childContext?: Record<string, any>) => {
        originalMethod(message, { ...context, ...childContext })
      }
    })
    
    return childLogger
  }

  getLogStats(): {
    totalLogs: number
    logsByLevel: Record<LogLevel, number>
    bufferSize: number
  } {
    // This would maintain counters for statistics
    return {
      totalLogs: 0,
      logsByLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        fatal: 0,
      },
      bufferSize: this.buffer.length,
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

// Export singleton logger instance
export const logger = new Logger()

// Context-aware logging utilities
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.createChildLogger({
    requestId,
    userId,
    component: 'api',
  })
}

export function createComponentLogger(componentName: string) {
  return logger.createChildLogger({
    component: componentName,
  })
}

export function createBusinessLogger(module: string) {
  return logger.createChildLogger({
    component: module,
    tags: ['business'],
  })
}

// Higher-order function for logging function execution
export function loggedFunction<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  context?: Record<string, any>
): T {
  return ((...args: any[]) => {
    const startTime = Date.now()
    const fnLogger = logger.createChildLogger({ ...context, action: name })
    
    fnLogger.debug(`Starting ${name}`, { args: args.length })
    
    try {
      const result = fn(...args)
      
      if (result instanceof Promise) {
        return result
          .then(res => {
            fnLogger.info(`Completed ${name}`, { 
              duration: Date.now() - startTime,
              success: true 
            })
            return res
          })
          .catch(error => {
            fnLogger.error(`Failed ${name}`, { 
              duration: Date.now() - startTime,
              error,
              success: false 
            })
            throw error
          })
      } else {
        fnLogger.info(`Completed ${name}`, { 
          duration: Date.now() - startTime,
          success: true 
        })
        return result
      }
    } catch (error) {
      fnLogger.error(`Failed ${name}`, { 
        duration: Date.now() - startTime,
        error,
        success: false 
      })
      throw error
    }
  }) as T
}

// React hooks for component logging
import React from 'react'

export function useLogger(componentName: string) {
  const componentLogger = React.useMemo(() =>
    createComponentLogger(componentName), [componentName]
  )

  const logInteraction = React.useCallback((action: string, metadata?: Record<string, any>) => {
    componentLogger.info(`User interaction: ${action}`, {
      action,
      ...metadata,
      tags: ['interaction'],
    })
  }, [componentLogger])

  const logError = React.useCallback((error: Error, context?: Record<string, any>) => {
    componentLogger.error(`Component error in ${componentName}`, {
      error,
      ...context,
      tags: ['component-error'],
    })
  }, [componentLogger, componentName])

  return {
    logger: componentLogger,
    logInteraction,
    logError,
  }
}