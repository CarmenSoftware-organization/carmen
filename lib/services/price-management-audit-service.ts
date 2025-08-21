/**
 * Enhanced Audit Logging Service for Price Management Module
 * 
 * This service provides comprehensive audit logging for all pricing operations,
 * ensuring compliance and traceability for all user actions.
 * 
 * Requirements: 9.5, 9.6
 */

import { UserRole, PriceManagementResource, Permission } from './price-management-rbac-service';

export interface PriceManagementAuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: UserRole;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Operation details
  operation: PriceManagementOperation;
  resource: PriceManagementResource;
  resourceId?: string;
  permission: Permission;
  
  // Event data
  eventType: AuditEventType;
  action: string;
  description: string;
  
  // State changes
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  changes?: FieldChange[];
  
  // Context
  businessContext?: {
    prItemId?: string;
    vendorId?: string;
    categoryId?: string;
    department?: string;
    location?: string;
  };
  
  // Result
  success: boolean;
  errorMessage?: string;
  
  // Additional metadata
  metadata?: Record<string, any>;
  tags?: string[];
}

export type PriceManagementOperation = 
  | 'vendor_management'
  | 'price_collection'
  | 'price_assignment'
  | 'price_override'
  | 'business_rule_management'
  | 'currency_management'
  | 'portal_access'
  | 'data_export'
  | 'bulk_operations'
  | 'system_configuration';

export type AuditEventType = 
  | 'access_attempt'
  | 'data_read'
  | 'data_write'
  | 'data_delete'
  | 'permission_change'
  | 'configuration_change'
  | 'bulk_operation'
  | 'export_operation'
  | 'authentication'
  | 'authorization_failure'
  | 'system_event';

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}

export interface AuditQuery {
  userId?: string;
  userRole?: UserRole;
  operation?: PriceManagementOperation;
  resource?: PriceManagementResource;
  eventType?: AuditEventType;
  startDate?: Date;
  endDate?: Date;
  resourceId?: string;
  success?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface AuditSummary {
  totalEvents: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  eventTypeBreakdown: Record<AuditEventType, number>;
  operationBreakdown: Record<PriceManagementOperation, number>;
  userActivityBreakdown: Record<string, number>;
  resourceAccessBreakdown: Record<PriceManagementResource, number>;
  successRate: number;
  topUsers: Array<{ userId: string; eventCount: number }>;
  topResources: Array<{ resource: PriceManagementResource; accessCount: number }>;
  securityEvents: number;
  complianceScore: number;
}

export interface AuditReport {
  id: string;
  generatedAt: Date;
  generatedBy: string;
  query: AuditQuery;
  summary: AuditSummary;
  events: PriceManagementAuditEvent[];
  insights: string[];
  recommendations: string[];
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
}

export class PriceManagementAuditService {
  private auditEvents: PriceManagementAuditEvent[] = [];
  private eventIdCounter = 1;

  /**
   * Log an audit event
   * Requirement 9.5
   */
  async logEvent(event: Omit<PriceManagementAuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: PriceManagementAuditEvent = {
      ...event,
      id: `audit_${this.eventIdCounter++}_${Date.now()}`,
      timestamp: new Date()
    };

    // Store the event (in production, this would go to a database)
    this.auditEvents.push(auditEvent);

    // Log to console for development
    console.log('Price Management Audit Event:', {
      id: auditEvent.id,
      timestamp: auditEvent.timestamp,
      userId: auditEvent.userId,
      operation: auditEvent.operation,
      action: auditEvent.action,
      success: auditEvent.success
    });

    // In production, you might also:
    // - Send to external audit system
    // - Trigger alerts for security events
    // - Update compliance metrics

    return auditEvent.id;
  }

  /**
   * Log access attempt
   */
  async logAccessAttempt(params: {
    userId: string;
    userRole: UserRole;
    resource: PriceManagementResource;
    permission: Permission;
    resourceId?: string;
    success: boolean;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<string> {
    return this.logEvent({
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      operation: this.mapResourceToOperation(params.resource),
      resource: params.resource,
      resourceId: params.resourceId,
      permission: params.permission,
      eventType: 'access_attempt',
      action: `${params.permission}_${params.resource}`,
      description: `User ${params.userId} attempted to ${params.permission} ${params.resource}`,
      success: params.success,
      errorMessage: params.success ? undefined : params.reason,
      tags: params.success ? ['access_granted'] : ['access_denied']
    });
  }

  /**
   * Log data modification
   */
  async logDataModification(params: {
    userId: string;
    userRole: UserRole;
    operation: PriceManagementOperation;
    resource: PriceManagementResource;
    resourceId: string;
    action: string;
    beforeState?: Record<string, any>;
    afterState?: Record<string, any>;
    businessContext?: any;
    success: boolean;
    errorMessage?: string;
    ipAddress?: string;
    sessionId?: string;
  }): Promise<string> {
    const changes = this.calculateChanges(params.beforeState, params.afterState);
    
    return this.logEvent({
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      operation: params.operation,
      resource: params.resource,
      resourceId: params.resourceId,
      permission: 'write',
      eventType: 'data_write',
      action: params.action,
      description: `User ${params.userId} ${params.action} ${params.resource} ${params.resourceId}`,
      beforeState: params.beforeState,
      afterState: params.afterState,
      changes,
      businessContext: params.businessContext,
      success: params.success,
      errorMessage: params.errorMessage,
      tags: ['data_modification', params.success ? 'success' : 'failure']
    });
  }

  /**
   * Log price override
   */
  async logPriceOverride(params: {
    userId: string;
    userRole: UserRole;
    prItemId: string;
    originalVendorId: string;
    newVendorId: string;
    originalPrice: number;
    newPrice: number;
    currency: string;
    reason: string;
    ipAddress?: string;
    sessionId?: string;
  }): Promise<string> {
    return this.logEvent({
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      operation: 'price_override',
      resource: 'price_assignments',
      resourceId: params.prItemId,
      permission: 'override',
      eventType: 'data_write',
      action: 'override_price_assignment',
      description: `User ${params.userId} overrode price assignment for PR item ${params.prItemId}`,
      beforeState: {
        vendorId: params.originalVendorId,
        price: params.originalPrice,
        currency: params.currency
      },
      afterState: {
        vendorId: params.newVendorId,
        price: params.newPrice,
        currency: params.currency
      },
      businessContext: {
        prItemId: params.prItemId,
        vendorId: params.newVendorId
      },
      success: true,
      metadata: {
        overrideReason: params.reason,
        priceChange: params.newPrice - params.originalPrice,
        vendorChange: params.originalVendorId !== params.newVendorId
      },
      tags: ['price_override', 'manual_intervention']
    });
  }

  /**
   * Log bulk operations
   */
  async logBulkOperation(params: {
    userId: string;
    userRole: UserRole;
    operation: PriceManagementOperation;
    resource: PriceManagementResource;
    action: string;
    itemCount: number;
    successCount: number;
    failureCount: number;
    details?: Record<string, any>;
    ipAddress?: string;
    sessionId?: string;
  }): Promise<string> {
    return this.logEvent({
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      operation: params.operation,
      resource: params.resource,
      permission: 'bulk_operations',
      eventType: 'bulk_operation',
      action: params.action,
      description: `User ${params.userId} performed bulk ${params.action} on ${params.itemCount} items`,
      success: params.failureCount === 0,
      metadata: {
        totalItems: params.itemCount,
        successCount: params.successCount,
        failureCount: params.failureCount,
        successRate: (params.successCount / params.itemCount) * 100,
        ...params.details
      },
      tags: ['bulk_operation', params.failureCount === 0 ? 'success' : 'partial_failure']
    });
  }

  /**
   * Log data export
   */
  async logDataExport(params: {
    userId: string;
    userRole: UserRole;
    resource: PriceManagementResource;
    exportFormat: string;
    recordCount: number;
    filters?: Record<string, any>;
    ipAddress?: string;
    sessionId?: string;
  }): Promise<string> {
    return this.logEvent({
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      operation: 'data_export',
      resource: params.resource,
      permission: 'export',
      eventType: 'export_operation',
      action: `export_${params.resource}_${params.exportFormat}`,
      description: `User ${params.userId} exported ${params.recordCount} ${params.resource} records as ${params.exportFormat}`,
      success: true,
      metadata: {
        exportFormat: params.exportFormat,
        recordCount: params.recordCount,
        filters: params.filters
      },
      tags: ['data_export', 'sensitive_data_access']
    });
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<{
    events: PriceManagementAuditEvent[];
    total: number;
    page: number;
    limit: number;
  }> {
    let filteredEvents = [...this.auditEvents];

    // Apply filters
    if (query.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === query.userId);
    }
    if (query.userRole) {
      filteredEvents = filteredEvents.filter(e => e.userRole === query.userRole);
    }
    if (query.operation) {
      filteredEvents = filteredEvents.filter(e => e.operation === query.operation);
    }
    if (query.resource) {
      filteredEvents = filteredEvents.filter(e => e.resource === query.resource);
    }
    if (query.eventType) {
      filteredEvents = filteredEvents.filter(e => e.eventType === query.eventType);
    }
    if (query.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endDate!);
    }
    if (query.resourceId) {
      filteredEvents = filteredEvents.filter(e => e.resourceId === query.resourceId);
    }
    if (query.success !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.success === query.success);
    }
    if (query.tags && query.tags.length > 0) {
      filteredEvents = filteredEvents.filter(e => 
        e.tags && query.tags!.some(tag => e.tags!.includes(tag))
      );
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return {
      events: paginatedEvents,
      total: filteredEvents.length,
      page,
      limit
    };
  }

  /**
   * Generate audit summary
   */
  async generateSummary(query: Omit<AuditQuery, 'page' | 'limit'>): Promise<AuditSummary> {
    const { events } = await this.queryEvents({ ...query, limit: 10000 });

    const summary: AuditSummary = {
      totalEvents: events.length,
      dateRange: {
        start: events.length > 0 ? new Date(Math.min(...events.map(e => e.timestamp.getTime()))) : new Date(),
        end: events.length > 0 ? new Date(Math.max(...events.map(e => e.timestamp.getTime()))) : new Date()
      },
      eventTypeBreakdown: {} as Record<AuditEventType, number>,
      operationBreakdown: {} as Record<PriceManagementOperation, number>,
      userActivityBreakdown: {},
      resourceAccessBreakdown: {} as Record<PriceManagementResource, number>,
      successRate: events.length > 0 ? (events.filter(e => e.success).length / events.length) * 100 : 0,
      topUsers: [],
      topResources: [],
      securityEvents: 0,
      complianceScore: 0
    };

    // Calculate breakdowns
    events.forEach(event => {
      // Event type breakdown
      summary.eventTypeBreakdown[event.eventType] = (summary.eventTypeBreakdown[event.eventType] || 0) + 1;
      
      // Operation breakdown
      summary.operationBreakdown[event.operation] = (summary.operationBreakdown[event.operation] || 0) + 1;
      
      // User activity breakdown
      summary.userActivityBreakdown[event.userId] = (summary.userActivityBreakdown[event.userId] || 0) + 1;
      
      // Resource access breakdown
      summary.resourceAccessBreakdown[event.resource] = (summary.resourceAccessBreakdown[event.resource] || 0) + 1;
      
      // Security events
      if (event.tags?.includes('access_denied') || event.tags?.includes('authorization_failure')) {
        summary.securityEvents++;
      }
    });

    // Top users
    summary.topUsers = Object.entries(summary.userActivityBreakdown)
      .map(([userId, count]) => ({ userId, eventCount: count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // Top resources
    summary.topResources = Object.entries(summary.resourceAccessBreakdown)
      .map(([resource, count]) => ({ resource: resource as PriceManagementResource, accessCount: count }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    // Compliance score (simplified calculation)
    summary.complianceScore = Math.max(0, 100 - (summary.securityEvents / events.length) * 100);

    return summary;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(params: {
    startDate: Date;
    endDate: Date;
    generatedBy: string;
  }): Promise<AuditReport> {
    const query: AuditQuery = {
      startDate: params.startDate,
      endDate: params.endDate
    };

    const { events } = await this.queryEvents(query);
    const summary = await this.generateSummary(query);

    const insights = this.generateInsights(summary, events);
    const recommendations = this.generateRecommendations(summary, events);
    const complianceStatus = this.assessComplianceStatus(summary);

    return {
      id: `report_${Date.now()}`,
      generatedAt: new Date(),
      generatedBy: params.generatedBy,
      query,
      summary,
      events,
      insights,
      recommendations,
      complianceStatus
    };
  }

  /**
   * Helper methods
   */
  private mapResourceToOperation(resource: PriceManagementResource): PriceManagementOperation {
    const mapping: Record<PriceManagementResource, PriceManagementOperation> = {
      vendor_pricing: 'price_collection',
      price_assignments: 'price_assignment',
      business_rules: 'business_rule_management',
      vendor_management: 'vendor_management',
      price_overrides: 'price_override',
      audit_logs: 'system_configuration',
      analytics: 'data_export',
      vendor_portal: 'portal_access',
      price_history: 'data_export',
      currency_management: 'currency_management',
      price_validation: 'price_collection',
      assignment_queues: 'bulk_operations'
    };
    return mapping[resource] || 'system_configuration';
  }

  private calculateChanges(beforeState?: Record<string, any>, afterState?: Record<string, any>): FieldChange[] {
    if (!beforeState || !afterState) {
      return [];
    }

    const changes: FieldChange[] = [];
    const allFields = new Set([...Object.keys(beforeState), ...Object.keys(afterState)]);

    allFields.forEach(field => {
      const oldValue = beforeState[field];
      const newValue = afterState[field];

      if (oldValue !== newValue) {
        let changeType: 'create' | 'update' | 'delete';
        if (oldValue === undefined) {
          changeType = 'create';
        } else if (newValue === undefined) {
          changeType = 'delete';
        } else {
          changeType = 'update';
        }

        changes.push({
          field,
          oldValue,
          newValue,
          changeType
        });
      }
    });

    return changes;
  }

  private generateInsights(summary: AuditSummary, events: PriceManagementAuditEvent[]): string[] {
    const insights: string[] = [];

    if (summary.successRate < 95) {
      insights.push(`Success rate is ${summary.successRate.toFixed(1)}%, which is below the recommended 95% threshold`);
    }

    if (summary.securityEvents > 0) {
      insights.push(`${summary.securityEvents} security events detected, requiring investigation`);
    }

    const failedLogins = events.filter(e => e.eventType === 'authentication' && !e.success).length;
    if (failedLogins > 10) {
      insights.push(`${failedLogins} failed authentication attempts detected`);
    }

    return insights;
  }

  private generateRecommendations(summary: AuditSummary, events: PriceManagementAuditEvent[]): string[] {
    const recommendations: string[] = [];

    if (summary.securityEvents > 0) {
      recommendations.push('Review and investigate all security events');
      recommendations.push('Consider implementing additional access controls');
    }

    if (summary.successRate < 95) {
      recommendations.push('Investigate causes of operation failures');
      recommendations.push('Provide additional user training if needed');
    }

    return recommendations;
  }

  private assessComplianceStatus(summary: AuditSummary): 'compliant' | 'warning' | 'non_compliant' {
    if (summary.complianceScore >= 95 && summary.securityEvents === 0) {
      return 'compliant';
    } else if (summary.complianceScore >= 80) {
      return 'warning';
    } else {
      return 'non_compliant';
    }
  }
}

// Singleton instance
export const priceManagementAudit = new PriceManagementAuditService();