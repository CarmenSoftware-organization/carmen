/**
 * Alert Manager for Carmen ERP
 * Handles alert routing, escalation, notifications, and status management
 */

import { getMonitoringConfig } from './config'
import { logger } from './logger'

export interface Alert {
  id: string
  name: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  status: 'firing' | 'resolved' | 'suppressed' | 'acknowledged'
  source: string // Source system or check that generated the alert
  metric: string
  currentValue: number
  threshold: number
  condition: string
  labels: Record<string, string>
  annotations: Record<string, string>
  startsAt: Date
  endsAt?: Date
  resolvedAt?: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  silencedUntil?: Date
  escalationLevel: number
  notificationsSent: number
  lastNotificationAt?: Date
  fingerprint: string
  generatorURL?: string
}

export interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty' | 'teams'
  enabled: boolean
  config: Record<string, any>
  severityFilter: ('critical' | 'warning' | 'info')[]
  labelSelectors: Record<string, string>
  timeRestrictions?: {
    timezone: string
    allowedHours: { start: string; end: string }[]
    allowedDays: number[] // 0-6, Sunday = 0
  }
}

export interface EscalationPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  levels: EscalationLevel[]
  labelSelectors: Record<string, string>
}

export interface EscalationLevel {
  level: number
  waitTime: number // minutes to wait before escalating
  channels: string[] // notification channel IDs
  autoResolve: boolean
}

export interface Silence {
  id: string
  matchers: Array<{
    name: string
    value: string
    isRegex: boolean
  }>
  startsAt: Date
  endsAt: Date
  createdBy: string
  comment: string
}

export interface NotificationTemplate {
  id: string
  name: string
  channelType: NotificationChannel['type']
  severity: Alert['severity']
  subject: string
  body: string
  variables: string[]
}

class AlertManager {
  private alerts: Map<string, Alert> = new Map()
  private channels: Map<string, NotificationChannel> = new Map()
  private escalationPolicies: Map<string, EscalationPolicy> = new Map()
  private silences: Map<string, Silence> = new Map()
  private templates: Map<string, NotificationTemplate> = new Map()
  private config = getMonitoringConfig()
  private escalationTimer?: NodeJS.Timeout
  private cleanupTimer?: NodeJS.Timeout

  constructor() {
    this.initializeDefaultChannels()
    this.initializeDefaultPolicies()
    this.initializeDefaultTemplates()
    this.startEscalationProcessor()
    this.startCleanupProcessor()
    
    logger.info('Alert manager initialized', {
      channels: this.channels.size,
      policies: this.escalationPolicies.size,
      templates: this.templates.size,
    })
  }

  private initializeDefaultChannels() {
    // Email channel
    this.addChannel({
      id: 'default-email',
      name: 'Default Email',
      type: 'email',
      enabled: true,
      config: {
        smtpHost: process.env.SMTP_HOST || 'localhost',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS || '',
        from: process.env.ALERT_EMAIL_FROM || 'alerts@carmen.com',
        to: this.config.alerts.recipients.critical
      },
      severityFilter: ['critical', 'warning'],
      labelSelectors: {}
    })

    // Slack channel
    if (process.env.SLACK_WEBHOOK_URL) {
      this.addChannel({
        id: 'default-slack',
        name: 'Default Slack',
        type: 'slack',
        enabled: true,
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL || '#alerts',
          username: 'Carmen ERP Alerts',
          iconEmoji: ':warning:'
        },
        severityFilter: ['critical', 'warning'],
        labelSelectors: {}
      })
    }

    // Webhook channel
    if (process.env.ALERT_WEBHOOK_URL) {
      this.addChannel({
        id: 'default-webhook',
        name: 'Default Webhook',
        type: 'webhook',
        enabled: true,
        config: {
          url: process.env.ALERT_WEBHOOK_URL,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.ALERT_WEBHOOK_TOKEN || ''
          }
        },
        severityFilter: ['critical', 'warning', 'info'],
        labelSelectors: {}
      })
    }
  }

  private initializeDefaultPolicies() {
    // Critical alerts escalation
    this.addEscalationPolicy({
      id: 'critical-alerts',
      name: 'Critical Alerts Escalation',
      description: 'Escalation policy for critical severity alerts',
      enabled: true,
      levels: [
        {
          level: 1,
          waitTime: 0, // Immediate
          channels: ['default-email', 'default-slack'],
          autoResolve: false
        },
        {
          level: 2,
          waitTime: 15, // 15 minutes
          channels: ['default-webhook'],
          autoResolve: false
        },
        {
          level: 3,
          waitTime: 30, // 30 minutes
          channels: ['default-email'], // Re-notify via email
          autoResolve: false
        }
      ],
      labelSelectors: { severity: 'critical' }
    })

    // Warning alerts escalation
    this.addEscalationPolicy({
      id: 'warning-alerts',
      name: 'Warning Alerts Escalation',
      description: 'Escalation policy for warning severity alerts',
      enabled: true,
      levels: [
        {
          level: 1,
          waitTime: 5, // 5 minutes
          channels: ['default-slack'],
          autoResolve: true
        },
        {
          level: 2,
          waitTime: 60, // 1 hour
          channels: ['default-email'],
          autoResolve: true
        }
      ],
      labelSelectors: { severity: 'warning' }
    })
  }

  private initializeDefaultTemplates() {
    // Email templates
    this.addTemplate({
      id: 'email-critical',
      name: 'Critical Alert Email',
      channelType: 'email',
      severity: 'critical',
      subject: '🚨 CRITICAL: {{alert.name}} - Carmen ERP',
      body: `
        <h2 style="color: #dc3545;">🚨 Critical Alert</h2>
        <p><strong>Alert:</strong> {{alert.name}}</p>
        <p><strong>Description:</strong> {{alert.description}}</p>
        <p><strong>Current Value:</strong> {{alert.currentValue}}</p>
        <p><strong>Threshold:</strong> {{alert.threshold}}</p>
        <p><strong>Started:</strong> {{alert.startsAt}}</p>
        <p><strong>Source:</strong> {{alert.source}}</p>
        
        <h3>Labels:</h3>
        <ul>
          {{#each alert.labels}}
          <li><strong>{{@key}}:</strong> {{this}}</li>
          {{/each}}
        </ul>
        
        <p><a href="{{alert.generatorURL}}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View in Dashboard</a></p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">
          Carmen ERP Alert System | Environment: {{environment}} | Time: {{timestamp}}
        </p>
      `,
      variables: ['alert.name', 'alert.description', 'alert.currentValue', 'alert.threshold', 'alert.startsAt', 'alert.source', 'alert.labels', 'alert.generatorURL', 'environment', 'timestamp']
    })

    // Slack templates
    this.addTemplate({
      id: 'slack-critical',
      name: 'Critical Alert Slack',
      channelType: 'slack',
      severity: 'critical',
      subject: '',
      body: `
        {
          "attachments": [
            {
              "color": "danger",
              "title": "🚨 CRITICAL ALERT",
              "title_link": "{{alert.generatorURL}}",
              "fields": [
                {
                  "title": "Alert",
                  "value": "{{alert.name}}",
                  "short": true
                },
                {
                  "title": "Current Value",
                  "value": "{{alert.currentValue}}",
                  "short": true
                },
                {
                  "title": "Threshold", 
                  "value": "{{alert.threshold}}",
                  "short": true
                },
                {
                  "title": "Source",
                  "value": "{{alert.source}}",
                  "short": true
                },
                {
                  "title": "Description",
                  "value": "{{alert.description}}",
                  "short": false
                }
              ],
              "footer": "Carmen ERP Alerts",
              "ts": {{alert.timestamp}}
            }
          ]
        }
      `,
      variables: ['alert.name', 'alert.currentValue', 'alert.threshold', 'alert.source', 'alert.description', 'alert.generatorURL', 'alert.timestamp']
    })
  }

  private startEscalationProcessor() {
    this.escalationTimer = setInterval(() => {
      this.processEscalations()
    }, 60000) // Check every minute
  }

  private startCleanupProcessor() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupResolvedAlerts()
      this.cleanupExpiredSilences()
    }, 300000) // Check every 5 minutes
  }

  // Public API methods

  /**
   * Fire a new alert
   */
  fireAlert(alert: Omit<Alert, 'id' | 'status' | 'startsAt' | 'escalationLevel' | 'notificationsSent' | 'fingerprint'>): string {
    const fingerprint = this.generateFingerprint(alert.labels)
    const existingAlert = Array.from(this.alerts.values()).find(a => a.fingerprint === fingerprint)

    if (existingAlert && existingAlert.status === 'firing') {
      // Update existing alert
      existingAlert.currentValue = alert.currentValue
      existingAlert.annotations = { ...existingAlert.annotations, ...alert.annotations }
      
      logger.info('Alert updated', { alertId: existingAlert.id, fingerprint })
      return existingAlert.id
    }

    // Create new alert
    const alertId = this.generateAlertId()
    const newAlert: Alert = {
      ...alert,
      id: alertId,
      status: 'firing',
      startsAt: new Date(),
      escalationLevel: 0,
      notificationsSent: 0,
      fingerprint
    }

    this.alerts.set(alertId, newAlert)

    // Check if alert should be silenced
    if (this.isAlertSilenced(newAlert)) {
      newAlert.status = 'suppressed'
      logger.info('Alert suppressed by silence', { alertId, fingerprint })
    } else {
      // Process immediate notifications
      this.processAlertNotifications(newAlert)
    }

    logger.info('Alert fired', { 
      alertId, 
      name: alert.name, 
      severity: alert.severity,
      status: newAlert.status 
    })

    return alertId
  }

  /**
   * Resolve an alert
   */
  resolveAlert(fingerprint: string, resolvedBy?: string): boolean {
    const alert = Array.from(this.alerts.values()).find(a => a.fingerprint === fingerprint)
    
    if (!alert || alert.status === 'resolved') {
      return false
    }

    alert.status = 'resolved'
    alert.endsAt = new Date()
    alert.resolvedAt = new Date()

    // Send resolution notification
    this.sendResolutionNotifications(alert)

    logger.info('Alert resolved', { 
      alertId: alert.id, 
      name: alert.name,
      duration: alert.endsAt.getTime() - alert.startsAt.getTime(),
      resolvedBy 
    })

    return true
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string, comment?: string): boolean {
    const alert = this.alerts.get(alertId)
    
    if (!alert || alert.status !== 'firing') {
      return false
    }

    alert.status = 'acknowledged'
    alert.acknowledgedAt = new Date()
    alert.acknowledgedBy = acknowledgedBy

    if (comment) {
      alert.annotations.acknowledgment_comment = comment
    }

    logger.info('Alert acknowledged', { 
      alertId, 
      name: alert.name,
      acknowledgedBy,
      comment 
    })

    return true
  }

  /**
   * Silence alerts matching criteria
   */
  silenceAlerts(matchers: Silence['matchers'], duration: number, createdBy: string, comment: string): string {
    const silenceId = this.generateSilenceId()
    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime() + duration)

    const silence: Silence = {
      id: silenceId,
      matchers,
      startsAt,
      endsAt,
      createdBy,
      comment
    }

    this.silences.set(silenceId, silence)

    // Mark matching alerts as suppressed
    for (const alert of this.alerts.values()) {
      if (alert.status === 'firing' && this.matchesMatchers(alert, matchers)) {
        alert.status = 'suppressed'
        alert.silencedUntil = endsAt
      }
    }

    logger.info('Silence created', { 
      silenceId, 
      matchers, 
      duration, 
      createdBy, 
      comment 
    })

    return silenceId
  }

  /**
   * Remove silence
   */
  removeSilence(silenceId: string): boolean {
    const silence = this.silences.get(silenceId)
    if (!silence) return false

    this.silences.delete(silenceId)

    // Unsuppress matching alerts
    for (const alert of this.alerts.values()) {
      if (alert.status === 'suppressed' && this.matchesMatchers(alert, silence.matchers)) {
        alert.status = 'firing'
        alert.silencedUntil = undefined
      }
    }

    logger.info('Silence removed', { silenceId })
    return true
  }

  /**
   * Add notification channel
   */
  addChannel(channel: NotificationChannel) {
    this.channels.set(channel.id, channel)
    logger.info('Notification channel added', { channelId: channel.id, type: channel.type })
  }

  /**
   * Add escalation policy
   */
  addEscalationPolicy(policy: EscalationPolicy) {
    this.escalationPolicies.set(policy.id, policy)
    logger.info('Escalation policy added', { policyId: policy.id, levels: policy.levels.length })
  }

  /**
   * Add notification template
   */
  addTemplate(template: NotificationTemplate) {
    this.templates.set(template.id, template)
    logger.info('Notification template added', { templateId: template.id, channelType: template.channelType })
  }

  /**
   * Get alerts with filtering
   */
  getAlerts(filters?: {
    status?: Alert['status'][]
    severity?: Alert['severity'][]
    source?: string
    since?: Date
    limit?: number
  }): Alert[] {
    let alerts = Array.from(this.alerts.values())

    if (filters) {
      if (filters.status) {
        alerts = alerts.filter(a => filters.status!.includes(a.status))
      }
      if (filters.severity) {
        alerts = alerts.filter(a => filters.severity!.includes(a.severity))
      }
      if (filters.source) {
        alerts = alerts.filter(a => a.source === filters.source)
      }
      if (filters.since) {
        alerts = alerts.filter(a => a.startsAt >= filters.since!)
      }
      if (filters.limit) {
        alerts = alerts.slice(0, filters.limit)
      }
    }

    return alerts.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
  }

  /**
   * Get alert statistics
   */
  getAlertStats(timeframe: number = 86400000): { // Default 24 hours
    total: number
    byStatus: Record<Alert['status'], number>
    bySeverity: Record<Alert['severity'], number>
    bySource: Record<string, number>
    avgResolutionTime: number
    escalationRate: number
  } {
    const cutoff = new Date(Date.now() - timeframe)
    const recentAlerts = Array.from(this.alerts.values()).filter(a => a.startsAt >= cutoff)

    const stats = {
      total: recentAlerts.length,
      byStatus: { firing: 0, resolved: 0, suppressed: 0, acknowledged: 0 } as Record<Alert['status'], number>,
      bySeverity: { critical: 0, warning: 0, info: 0 } as Record<Alert['severity'], number>,
      bySource: {} as Record<string, number>,
      avgResolutionTime: 0,
      escalationRate: 0
    }

    let totalResolutionTime = 0
    let resolvedCount = 0
    let escalatedCount = 0

    for (const alert of recentAlerts) {
      stats.byStatus[alert.status]++
      stats.bySeverity[alert.severity]++
      stats.bySource[alert.source] = (stats.bySource[alert.source] || 0) + 1

      if (alert.status === 'resolved' && alert.resolvedAt) {
        totalResolutionTime += alert.resolvedAt.getTime() - alert.startsAt.getTime()
        resolvedCount++
      }

      if (alert.escalationLevel > 1) {
        escalatedCount++
      }
    }

    stats.avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0
    stats.escalationRate = recentAlerts.length > 0 ? (escalatedCount / recentAlerts.length) * 100 : 0

    return stats
  }

  // Private helper methods

  private processEscalations() {
    const now = Date.now()

    for (const alert of this.alerts.values()) {
      if (alert.status !== 'firing') continue

      const policy = this.findEscalationPolicy(alert)
      if (!policy) continue

      const nextLevel = alert.escalationLevel + 1
      const level = policy.levels.find(l => l.level === nextLevel)
      
      if (!level) continue

      const waitTime = level.waitTime * 60 * 1000 // Convert minutes to milliseconds
      const timeSinceLastNotification = alert.lastNotificationAt ? 
        now - alert.lastNotificationAt.getTime() : 
        now - alert.startsAt.getTime()

      if (timeSinceLastNotification >= waitTime) {
        this.escalateAlert(alert, level)
      }
    }
  }

  private escalateAlert(alert: Alert, level: EscalationLevel) {
    alert.escalationLevel = level.level
    alert.lastNotificationAt = new Date()

    logger.warn('Alert escalated', { 
      alertId: alert.id, 
      name: alert.name, 
      level: level.level 
    })

    // Send notifications for this escalation level
    this.sendEscalationNotifications(alert, level)
  }

  private processAlertNotifications(alert: Alert) {
    const policy = this.findEscalationPolicy(alert)
    if (!policy) return

    const firstLevel = policy.levels.find(l => l.level === 1)
    if (!firstLevel) return

    alert.escalationLevel = 1
    alert.lastNotificationAt = new Date()

    this.sendEscalationNotifications(alert, firstLevel)
  }

  private sendEscalationNotifications(alert: Alert, level: EscalationLevel) {
    for (const channelId of level.channels) {
      const channel = this.channels.get(channelId)
      if (!channel || !channel.enabled) continue

      if (!this.shouldNotifyChannel(channel, alert)) continue

      this.sendNotification(channel, alert)
        .then(() => {
          alert.notificationsSent++
          logger.info('Notification sent', { 
            alertId: alert.id, 
            channel: channel.name, 
            type: channel.type 
          })
        })
        .catch(error => {
          logger.error('Notification failed', { 
            alertId: alert.id, 
            channel: channel.name, 
            error 
          })
        })
    }
  }

  private async sendNotification(channel: NotificationChannel, alert: Alert): Promise<void> {
    const template = this.findTemplate(channel.type, alert.severity)
    const content = template ? this.renderTemplate(template, alert) : this.getDefaultContent(alert)

    switch (channel.type) {
      case 'email':
        await this.sendEmailNotification(channel, alert, content)
        break
      case 'slack':
        await this.sendSlackNotification(channel, alert, content)
        break
      case 'webhook':
        await this.sendWebhookNotification(channel, alert, content)
        break
      default:
        logger.warn('Unsupported notification channel type', { type: channel.type })
    }
  }

  private async sendEmailNotification(channel: NotificationChannel, alert: Alert, content: { subject: string; body: string }): Promise<void> {
    // Email implementation would go here
    // This would use nodemailer or similar
    logger.info('Email notification would be sent', { 
      to: channel.config.to, 
      subject: content.subject 
    })
  }

  private async sendSlackNotification(channel: NotificationChannel, alert: Alert, content: { subject: string; body: string }): Promise<void> {
    try {
      const payload = content.body ? JSON.parse(content.body) : {
        text: `Alert: ${alert.name}`,
        channel: channel.config.channel,
        username: channel.config.username || 'Carmen ERP Alerts'
      }

      const response = await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`)
      }
    } catch (error) {
      throw new Error(`Failed to send Slack notification: ${error}`)
    }
  }

  private async sendWebhookNotification(channel: NotificationChannel, alert: Alert, content: { subject: string; body: string }): Promise<void> {
    try {
      const payload = {
        alert,
        content,
        timestamp: new Date().toISOString()
      }

      const response = await fetch(channel.config.url, {
        method: channel.config.method || 'POST',
        headers: channel.config.headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`)
      }
    } catch (error) {
      throw new Error(`Failed to send webhook notification: ${error}`)
    }
  }

  private sendResolutionNotifications(alert: Alert) {
    // Send resolution notifications to relevant channels
    logger.info('Resolution notification would be sent', { 
      alertId: alert.id, 
      name: alert.name 
    })
  }

  private findEscalationPolicy(alert: Alert): EscalationPolicy | undefined {
    for (const policy of this.escalationPolicies.values()) {
      if (!policy.enabled) continue
      if (this.matchesLabelSelectors(alert, policy.labelSelectors)) {
        return policy
      }
    }
    return undefined
  }

  private findTemplate(channelType: NotificationChannel['type'], severity: Alert['severity']): NotificationTemplate | undefined {
    const templateId = `${channelType}-${severity}`
    return this.templates.get(templateId)
  }

  private renderTemplate(template: NotificationTemplate, alert: Alert): { subject: string; body: string } {
    const context = {
      alert,
      environment: this.config.environment,
      timestamp: new Date().toISOString()
    }

    // Simple template rendering - in production, use a proper template engine
    let subject = template.subject
    let body = template.body

    for (const variable of template.variables) {
      const value = this.getNestedValue(context, variable)
      const placeholder = `{{${variable}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
      body = body.replace(new RegExp(placeholder, 'g'), String(value))
    }

    return { subject, body }
  }

  private getDefaultContent(alert: Alert): { subject: string; body: string } {
    return {
      subject: `${alert.severity.toUpperCase()}: ${alert.name}`,
      body: `Alert: ${alert.name}\nSeverity: ${alert.severity}\nDescription: ${alert.description}\nCurrent Value: ${alert.currentValue}\nThreshold: ${alert.threshold}`
    }
  }

  private shouldNotifyChannel(channel: NotificationChannel, alert: Alert): boolean {
    // Check severity filter
    if (!channel.severityFilter.includes(alert.severity)) {
      return false
    }

    // Check label selectors
    if (!this.matchesLabelSelectors(alert, channel.labelSelectors)) {
      return false
    }

    // Check time restrictions
    if (channel.timeRestrictions && !this.isWithinTimeRestrictions(channel.timeRestrictions)) {
      return false
    }

    return true
  }

  private matchesLabelSelectors(alert: Alert, selectors: Record<string, string>): boolean {
    for (const [key, value] of Object.entries(selectors)) {
      if (alert.labels[key] !== value) {
        return false
      }
    }
    return true
  }

  private isWithinTimeRestrictions(restrictions: NonNullable<NotificationChannel['timeRestrictions']>): boolean {
    const now = new Date()
    const day = now.getDay()
    const time = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: restrictions.timezone 
    })

    // Check allowed days
    if (!restrictions.allowedDays.includes(day)) {
      return false
    }

    // Check allowed hours
    return restrictions.allowedHours.some(({ start, end }) => {
      return time >= start && time <= end
    })
  }

  private isAlertSilenced(alert: Alert): boolean {
    for (const silence of this.silences.values()) {
      if (this.matchesMatchers(alert, silence.matchers)) {
        const now = new Date()
        if (now >= silence.startsAt && now <= silence.endsAt) {
          return true
        }
      }
    }
    return false
  }

  private matchesMatchers(alert: Alert, matchers: Silence['matchers']): boolean {
    return matchers.every(matcher => {
      const value = alert.labels[matcher.name]
      if (!value) return false

      if (matcher.isRegex) {
        return new RegExp(matcher.value).test(value)
      } else {
        return value === matcher.value
      }
    })
  }

  private cleanupResolvedAlerts() {
    const cutoff = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) // 7 days
    
    for (const [id, alert] of this.alerts) {
      if (alert.status === 'resolved' && alert.resolvedAt && alert.resolvedAt < cutoff) {
        this.alerts.delete(id)
      }
    }
  }

  private cleanupExpiredSilences() {
    const now = new Date()
    
    for (const [id, silence] of this.silences) {
      if (silence.endsAt < now) {
        this.silences.delete(id)
      }
    }
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSilenceId(): string {
    return `silence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFingerprint(labels: Record<string, string>): string {
    const sortedLabels = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('|')
    
    return Buffer.from(sortedLabels).toString('base64')
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? ''
  }

  /**
   * Stop alert manager
   */
  stop() {
    if (this.escalationTimer) {
      clearInterval(this.escalationTimer)
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
  }
}

// Export singleton instance
export const alertManager = new AlertManager()

// Helper functions for easy integration
export function createAlert(
  name: string,
  description: string,
  severity: Alert['severity'],
  source: string,
  metric: string,
  currentValue: number,
  threshold: number,
  labels: Record<string, string> = {},
  annotations: Record<string, string> = {}
): string {
  return alertManager.fireAlert({
    name,
    description,
    severity,
    source,
    metric,
    currentValue,
    threshold,
    condition: currentValue > threshold ? 'gt' : 'lt',
    labels: { ...labels, source, metric },
    annotations
  })
}

export function resolveAlert(fingerprint: string, resolvedBy?: string): boolean {
  return alertManager.resolveAlert(fingerprint, resolvedBy)
}

export function acknowledgeAlert(alertId: string, acknowledgedBy: string, comment?: string): boolean {
  return alertManager.acknowledgeAlert(alertId, acknowledgedBy, comment)
}