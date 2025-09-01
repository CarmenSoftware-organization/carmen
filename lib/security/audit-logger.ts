/**
 * Security Audit Logger
 * 
 * Provides comprehensive security event logging with structured data,
 * retention policies, and webhook notifications for security monitoring.
 * 
 * @author Carmen ERP Team
 */

import { getAuthSecurityConfig, isProduction } from '@/lib/config/environment'

// Security Event Types
export enum SecurityEventType {
  // Authentication Events
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',
  AUTH_ERROR = 'auth_error',
  TOKEN_GENERATED = 'token_generated',
  TOKEN_REVOKED = 'token_revoked',
  USER_TOKENS_REVOKED = 'user_tokens_revoked',
  PASSWORD_CHANGED = 'password_changed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',

  // Authorization Events
  AUTHORIZATION_ATTEMPTED = 'authorization_attempted',
  AUTHORIZATION_GRANTED = 'authorization_granted',
  AUTHORIZATION_DENIED = 'authorization_denied',
  AUTHORIZATION_ERROR = 'authorization_error',
  PERMISSION_ESCALATION_ATTEMPT = 'permission_escalation_attempt',

  // Security Violations
  SECURITY_VIOLATION = 'security_violation',
  SECURITY_ERROR = 'security_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MALICIOUS_REQUEST = 'malicious_request',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',

  // Data Access Events
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  DATA_MODIFICATION = 'data_modification',
  DATA_DELETION = 'data_deletion',
  BULK_OPERATION = 'bulk_operation',

  // System Events
  SYSTEM_ERROR = 'system_error',
  CONFIGURATION_CHANGED = 'configuration_changed',
  BACKUP_CREATED = 'backup_created',
  MAINTENANCE_MODE = 'maintenance_mode',

  // Compliance Events
  AUDIT_LOG_ACCESSED = 'audit_log_accessed',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  DATA_RETENTION_POLICY_APPLIED = 'data_retention_policy_applied'
}

// Security Event Severity Levels
export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Audit Log Entry Interface
export interface SecurityAuditLogEntry {
  id?: string
  timestamp: Date
  eventType: SecurityEventType
  severity: SecurityEventSeverity
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  details?: Record<string, any>
  riskScore?: number
  geolocation?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }
}

// Webhook Notification Interface
export interface SecurityWebhookPayload {
  eventType: SecurityEventType
  severity: SecurityEventSeverity
  timestamp: string
  message: string
  details: SecurityAuditLogEntry
  environment: string
  service: 'carmen-erp'
}

/**
 * Security Audit Logger Class
 * Handles structured security logging with various outputs and filtering
 */
export class SecurityAuditLogger {
  private config = getAuthSecurityConfig()
  private logBuffer: SecurityAuditLogEntry[] = []
  private webhookQueue: SecurityWebhookPayload[] = []

  constructor() {
    // Start periodic flush if in production
    if (isProduction()) {
      setInterval(() => this.flushLogs(), 30000) // Flush every 30 seconds
      setInterval(() => this.processWebhookQueue(), 10000) // Process webhooks every 10 seconds
    }
  }

  /**
   * Create a security audit log entry
   */
  async log(entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp' | 'severity' | 'riskScore'>): Promise<void> {
    try {
      const enhancedEntry: SecurityAuditLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: this.calculateSeverity(entry.eventType, entry.details),
        riskScore: this.calculateRiskScore(entry.eventType, entry.details),
      }

      // Add to buffer
      this.logBuffer.push(enhancedEntry)

      // Console logging (structured)
      this.logToConsole(enhancedEntry)

      // Queue for webhook if high severity
      if (enhancedEntry.severity === SecurityEventSeverity.HIGH || 
          enhancedEntry.severity === SecurityEventSeverity.CRITICAL) {
        this.queueWebhookNotification(enhancedEntry)
      }

      // Immediate flush for critical events
      if (enhancedEntry.severity === SecurityEventSeverity.CRITICAL) {
        await this.flushLogs()
        await this.processWebhookQueue()
      }

    } catch (error) {
      console.error('Failed to create security audit log:', error)
    }
  }

  /**
   * Log to console with structured formatting
   */
  private logToConsole(entry: SecurityAuditLogEntry): void {
    const logLevel = this.getLogLevel(entry.severity)
    const message = this.formatLogMessage(entry)
    
    const logData = {
      timestamp: entry.timestamp.toISOString(),
      eventType: entry.eventType,
      severity: entry.severity,
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      riskScore: entry.riskScore,
      details: entry.details
    }

    switch (logLevel) {
      case 'error':
        console.error(message, logData)
        break
      case 'warn':
        console.warn(message, logData)
        break
      case 'info':
        console.info(message, logData)
        break
      default:
        console.log(message, logData)
    }
  }

  /**
   * Format log message for readability
   */
  private formatLogMessage(entry: SecurityAuditLogEntry): string {
    const parts = [
      `🔒 [${entry.severity.toUpperCase()}]`,
      `${entry.eventType}`,
    ]

    if (entry.userId) {
      parts.push(`user:${entry.userId}`)
    }

    if (entry.ipAddress) {
      parts.push(`ip:${entry.ipAddress}`)
    }

    if (entry.riskScore && entry.riskScore > 70) {
      parts.push(`risk:${entry.riskScore}`)
    }

    return parts.join(' ')
  }

  /**
   * Calculate severity based on event type and details
   */
  private calculateSeverity(eventType: SecurityEventType, details?: Record<string, any>): SecurityEventSeverity {
    // Critical events
    const criticalEvents = [
      SecurityEventType.PERMISSION_ESCALATION_ATTEMPT,
      SecurityEventType.BRUTE_FORCE_ATTEMPT,
      SecurityEventType.MALICIOUS_REQUEST,
      SecurityEventType.ACCOUNT_LOCKED,
      SecurityEventType.COMPLIANCE_VIOLATION
    ]

    if (criticalEvents.includes(eventType)) {
      return SecurityEventSeverity.CRITICAL
    }

    // High severity events
    const highSeverityEvents = [
      SecurityEventType.AUTH_FAILED,
      SecurityEventType.AUTHORIZATION_DENIED,
      SecurityEventType.SECURITY_VIOLATION,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecurityEventType.DATA_DELETION,
      SecurityEventType.CONFIGURATION_CHANGED
    ]

    if (highSeverityEvents.includes(eventType)) {
      return SecurityEventSeverity.HIGH
    }

    // Medium severity events
    const mediumSeverityEvents = [
      SecurityEventType.AUTH_ERROR,
      SecurityEventType.AUTHORIZATION_ERROR,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.DATA_MODIFICATION,
      SecurityEventType.BULK_OPERATION,
      SecurityEventType.SYSTEM_ERROR
    ]

    if (mediumSeverityEvents.includes(eventType)) {
      return SecurityEventSeverity.MEDIUM
    }

    // Default to low severity
    return SecurityEventSeverity.LOW
  }

  /**
   * Calculate risk score based on event type and context
   */
  private calculateRiskScore(eventType: SecurityEventType, details?: Record<string, any>): number {
    let baseScore = 0

    // Base scores by event type
    const eventScores: Record<SecurityEventType, number> = {
      [SecurityEventType.PERMISSION_ESCALATION_ATTEMPT]: 95,
      [SecurityEventType.BRUTE_FORCE_ATTEMPT]: 90,
      [SecurityEventType.MALICIOUS_REQUEST]: 85,
      [SecurityEventType.ACCOUNT_LOCKED]: 80,
      [SecurityEventType.AUTH_FAILED]: 60,
      [SecurityEventType.AUTHORIZATION_DENIED]: 50,
      [SecurityEventType.SECURITY_VIOLATION]: 70,
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: 65,
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: 40,
      [SecurityEventType.AUTH_SUCCESS]: 10,
      [SecurityEventType.TOKEN_GENERATED]: 5,
      // Add default scores for other events
    } as any

    baseScore = eventScores[eventType] || 20

    // Adjust score based on details
    if (details) {
      // Multiple failed attempts
      if (details.attemptCount && details.attemptCount > 3) {
        baseScore += Math.min(details.attemptCount * 5, 20)
      }

      // Suspicious user agent
      if (details.userAgent && /curl|wget|python|scanner/i.test(details.userAgent)) {
        baseScore += 15
      }

      // Off-hours activity (if timestamp is provided)
      const hour = new Date().getHours()
      if (hour < 6 || hour > 22) {
        baseScore += 10
      }

      // High-value operations
      if (details.operation === 'bulk_delete' || details.operation === 'export_all') {
        baseScore += 20
      }
    }

    return Math.min(Math.max(baseScore, 0), 100)
  }

  /**
   * Get log level for console output
   */
  private getLogLevel(severity: SecurityEventSeverity): string {
    switch (severity) {
      case SecurityEventSeverity.CRITICAL:
      case SecurityEventSeverity.HIGH:
        return 'error'
      case SecurityEventSeverity.MEDIUM:
        return 'warn'
      case SecurityEventSeverity.LOW:
        return 'info'
      default:
        return 'log'
    }
  }

  /**
   * Queue webhook notification for high-severity events
   */
  private queueWebhookNotification(entry: SecurityAuditLogEntry): void {
    if (!this.config.SECURITY_EVENTS_WEBHOOK_URL) {
      return
    }

    const payload: SecurityWebhookPayload = {
      eventType: entry.eventType,
      severity: entry.severity,
      timestamp: entry.timestamp.toISOString(),
      message: this.formatLogMessage(entry),
      details: entry,
      environment: isProduction() ? 'production' : 'development',
      service: 'carmen-erp'
    }

    this.webhookQueue.push(payload)
  }

  /**
   * Process webhook notification queue
   */
  private async processWebhookQueue(): Promise<void> {
    if (this.webhookQueue.length === 0 || !this.config.SECURITY_EVENTS_WEBHOOK_URL) {
      return
    }

    const notifications = this.webhookQueue.splice(0, 10) // Process up to 10 at a time

    for (const notification of notifications) {
      try {
        await fetch(this.config.SECURITY_EVENTS_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Carmen-ERP-Security-Logger/1.0'
          },
          body: JSON.stringify(notification)
        })
      } catch (error) {
        console.error('Failed to send security webhook:', error)
        // Re-queue on failure (with exponential backoff in production)
        this.webhookQueue.push(notification)
      }
    }
  }

  /**
   * Flush log buffer (in production, this would write to persistent storage)
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return
    }

    const logsToFlush = this.logBuffer.splice(0, 100) // Flush up to 100 at a time

    try {
      // In production, write to database/file/external service
      // For now, we just ensure console logging happened
      
      // Apply retention policy
      await this.applyRetentionPolicy()
      
    } catch (error) {
      console.error('Failed to flush security logs:', error)
      // Re-add to buffer on failure
      this.logBuffer.unshift(...logsToFlush)
    }
  }

  /**
   * Apply retention policy (remove old logs)
   */
  private async applyRetentionPolicy(): Promise<void> {
    const retentionDays = this.config.AUDIT_LOG_RETENTION_DAYS
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // In production, this would clean up database/file storage
    // For now, just log the retention policy application
    if (Math.random() < 0.01) { // Log occasionally to avoid spam
      console.log(`🗂️  Security audit log retention policy: keeping ${retentionDays} days of logs`)
    }
  }

  /**
   * Get audit logs (for admin interface)
   */
  async getAuditLogs(filters: {
    eventType?: SecurityEventType
    severity?: SecurityEventSeverity
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<SecurityAuditLogEntry[]> {
    // In production, this would query the database
    // For now, return filtered buffer (limited functionality)
    let filteredLogs = [...this.logBuffer]

    if (filters.eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === filters.eventType)
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity)
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply pagination
    const offset = filters.offset || 0
    const limit = filters.limit || 50
    return filteredLogs.slice(offset, offset + limit)
  }

  /**
   * Get security metrics
   */
  getMetrics(): {
    totalEvents: number
    criticalEvents: number
    highRiskEvents: number
    averageRiskScore: number
    bufferSize: number
    webhookQueueSize: number
  } {
    const criticalEvents = this.logBuffer.filter(log => log.severity === SecurityEventSeverity.CRITICAL).length
    const highRiskEvents = this.logBuffer.filter(log => log.riskScore && log.riskScore > 70).length
    const totalRiskScore = this.logBuffer.reduce((sum, log) => sum + (log.riskScore || 0), 0)
    const averageRiskScore = this.logBuffer.length > 0 ? totalRiskScore / this.logBuffer.length : 0

    return {
      totalEvents: this.logBuffer.length,
      criticalEvents,
      highRiskEvents,
      averageRiskScore: Math.round(averageRiskScore * 100) / 100,
      bufferSize: this.logBuffer.length,
      webhookQueueSize: this.webhookQueue.length
    }
  }
}

// Singleton instance
export const securityAuditLogger = new SecurityAuditLogger()

/**
 * Convenience function to create audit log entry
 */
export async function createSecurityAuditLog(
  entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp' | 'severity' | 'riskScore'>
): Promise<void> {
  await securityAuditLogger.log(entry)
}

/**
 * Convenience function for authentication events
 */
export async function logAuthEvent(
  eventType: SecurityEventType.AUTH_SUCCESS | SecurityEventType.AUTH_FAILED | SecurityEventType.AUTH_ERROR,
  userId: string | undefined,
  ipAddress: string,
  userAgent: string,
  details?: Record<string, any>
): Promise<void> {
  await createSecurityAuditLog({
    eventType,
    userId,
    ipAddress,
    userAgent,
    details
  })
}

/**
 * Convenience function for authorization events
 */
export async function logAuthorizationEvent(
  eventType: SecurityEventType.AUTHORIZATION_GRANTED | SecurityEventType.AUTHORIZATION_DENIED | SecurityEventType.AUTHORIZATION_ERROR,
  userId: string,
  resource: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  await createSecurityAuditLog({
    eventType,
    userId,
    details: {
      resource,
      action,
      ...details
    }
  })
}

// Export types and constants
export type { SecurityAuditLogEntry, SecurityWebhookPayload }