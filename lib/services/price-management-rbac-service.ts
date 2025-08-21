/**
 * Role-Based Access Control Service for Price Management Module
 * 
 * This service implements comprehensive RBAC controls for the Price Management system,
 * ensuring that users can only access pricing information appropriate to their role.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

export type UserRole = 'Requestor' | 'Approver' | 'Purchaser' | 'Vendor' | 'Admin' | 'System';

export type PriceManagementResource = 
  | 'vendor_pricing' 
  | 'price_assignments' 
  | 'business_rules' 
  | 'vendor_management' 
  | 'price_overrides' 
  | 'audit_logs' 
  | 'analytics' 
  | 'vendor_portal'
  | 'price_history'
  | 'currency_management'
  | 'price_validation'
  | 'assignment_queues';

export type Permission = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'approve' 
  | 'override' 
  | 'audit' 
  | 'manage' 
  | 'configure'
  | 'export'
  | 'bulk_operations';

export interface AccessControlRule {
  role: UserRole;
  resource: PriceManagementResource;
  permissions: Permission[];
  conditions?: AccessCondition[];
}

export interface AccessCondition {
  field: string;
  operator: 'equals' | 'in' | 'owns' | 'department_match' | 'location_match';
  value: any;
}

export interface UserContext {
  userId: string;
  role: UserRole;
  department?: string;
  location?: string;
  vendorId?: string; // For vendor users
  permissions?: string[];
}

export interface AccessRequest {
  user: UserContext;
  resource: PriceManagementResource;
  permission: Permission;
  resourceId?: string;
  additionalContext?: Record<string, any>;
}

export interface AccessResult {
  granted: boolean;
  reason: string;
  restrictions?: DataRestriction[];
  auditRequired: boolean;
}

export interface DataRestriction {
  field: string;
  action: 'hide' | 'mask' | 'readonly' | 'filter';
  condition?: string;
}

export interface AuditEvent {
  userId: string;
  userRole: UserRole;
  resource: PriceManagementResource;
  permission: Permission;
  resourceId?: string;
  granted: boolean;
  reason: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

export class PriceManagementRBACService {
  private accessRules: AccessControlRule[] = [];
  private auditEvents: AuditEvent[] = [];

  constructor() {
    this.initializeAccessRules();
  }

  /**
   * Initialize default access control rules based on requirements
   */
  private initializeAccessRules(): void {
    this.accessRules = [
      // Requestor Role - Limited access to pricing information
      {
        role: 'Requestor',
        resource: 'price_assignments',
        permissions: ['read'],
        conditions: [
          { field: 'userId', operator: 'equals', value: 'self' }
        ]
      },
      {
        role: 'Requestor',
        resource: 'vendor_pricing',
        permissions: [], // No access to detailed vendor pricing
      },
      {
        role: 'Requestor',
        resource: 'price_history',
        permissions: [], // No access to price history
      },

      // Approver Role - View-only access to pricing summaries
      {
        role: 'Approver',
        resource: 'price_assignments',
        permissions: ['read'],
      },
      {
        role: 'Approver',
        resource: 'vendor_pricing',
        permissions: ['read'], // Summary view only
      },
      {
        role: 'Approver',
        resource: 'price_history',
        permissions: ['read'], // Summary view only
      },
      {
        role: 'Approver',
        resource: 'audit_logs',
        permissions: ['read'],
        conditions: [
          { field: 'department', operator: 'department_match', value: 'self' }
        ]
      },

      // Purchaser Role - Full access to pricing and management
      {
        role: 'Purchaser',
        resource: 'vendor_pricing',
        permissions: ['read', 'write', 'delete', 'manage'],
      },
      {
        role: 'Purchaser',
        resource: 'price_assignments',
        permissions: ['read', 'write', 'override', 'manage'],
      },
      {
        role: 'Purchaser',
        resource: 'business_rules',
        permissions: ['read', 'write', 'configure', 'manage'],
      },
      {
        role: 'Purchaser',
        resource: 'vendor_management',
        permissions: ['read', 'write', 'manage'],
      },
      {
        role: 'Purchaser',
        resource: 'price_overrides',
        permissions: ['read', 'write', 'approve', 'manage', 'override'],
      },
      {
        role: 'Purchaser',
        resource: 'audit_logs',
        permissions: ['read', 'audit'],
      },
      {
        role: 'Purchaser',
        resource: 'analytics',
        permissions: ['read', 'export'],
      },
      {
        role: 'Purchaser',
        resource: 'currency_management',
        permissions: ['read', 'write', 'manage'],
      },
      {
        role: 'Purchaser',
        resource: 'price_validation',
        permissions: ['read', 'write', 'manage'],
      },
      {
        role: 'Purchaser',
        resource: 'assignment_queues',
        permissions: ['read', 'write', 'manage', 'bulk_operations'],
      },

      // Vendor Role - Access only to own pricing data
      {
        role: 'Vendor',
        resource: 'vendor_pricing',
        permissions: ['read', 'write'],
        conditions: [
          { field: 'vendorId', operator: 'owns', value: 'self' }
        ]
      },
      {
        role: 'Vendor',
        resource: 'vendor_portal',
        permissions: ['read', 'write'],
        conditions: [
          { field: 'vendorId', operator: 'owns', value: 'self' }
        ]
      },
      {
        role: 'Vendor',
        resource: 'price_history',
        permissions: ['read'],
        conditions: [
          { field: 'vendorId', operator: 'owns', value: 'self' }
        ]
      },

      // Admin Role - Full system access
      {
        role: 'Admin',
        resource: 'vendor_pricing',
        permissions: ['read', 'write', 'delete', 'manage', 'configure', 'approve', 'override', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'price_assignments',
        permissions: ['read', 'write', 'delete', 'override', 'manage', 'configure', 'approve', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'business_rules',
        permissions: ['read', 'write', 'delete', 'configure', 'manage', 'approve', 'override', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'vendor_management',
        permissions: ['read', 'write', 'delete', 'manage', 'configure', 'approve', 'override', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'price_overrides',
        permissions: ['read', 'write', 'delete', 'approve', 'manage', 'override', 'configure', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'audit_logs',
        permissions: ['read', 'audit', 'export', 'manage', 'write', 'delete', 'configure', 'approve', 'override', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'analytics',
        permissions: ['read', 'write', 'export', 'manage', 'delete', 'configure', 'approve', 'override', 'audit', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'currency_management',
        permissions: ['read', 'write', 'delete', 'manage', 'configure', 'approve', 'override', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'price_validation',
        permissions: ['read', 'write', 'delete', 'manage', 'configure', 'approve', 'override', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'assignment_queues',
        permissions: ['read', 'write', 'delete', 'manage', 'bulk_operations', 'configure', 'approve', 'override', 'audit', 'export'],
      },
      {
        role: 'Admin',
        resource: 'vendor_portal',
        permissions: ['read', 'write', 'delete', 'manage', 'configure', 'approve', 'override', 'audit', 'export', 'bulk_operations'],
      },
      {
        role: 'Admin',
        resource: 'price_history',
        permissions: ['read', 'write', 'delete', 'manage', 'configure', 'approve', 'override', 'audit', 'export', 'bulk_operations'],
      },

      // System Role - Internal system operations
      {
        role: 'System',
        resource: 'vendor_pricing',
        permissions: ['read', 'write', 'manage'],
      },
      {
        role: 'System',
        resource: 'price_assignments',
        permissions: ['read', 'write', 'manage'],
      },
      {
        role: 'System',
        resource: 'audit_logs',
        permissions: ['write', 'audit'],
      },
    ];
  }

  /**
   * Check if a user has permission to access a resource
   * Requirement 9.1, 9.2, 9.3, 9.4
   */
  async checkAccess(request: AccessRequest): Promise<AccessResult> {
    const { user, resource, permission, resourceId, additionalContext } = request;

    // Handle invalid user context
    if (!user || !user.role) {
      const result: AccessResult = {
        granted: false,
        reason: 'Invalid user context provided',
        auditRequired: true
      };
      await this.auditAccess(request, result);
      return result;
    }

    // Find applicable access rules
    const applicableRules = this.accessRules.filter(rule => 
      rule.role === user.role && rule.resource === resource
    );

    if (applicableRules.length === 0) {
      const result: AccessResult = {
        granted: false,
        reason: `No access rules defined for role ${user.role} on resource ${resource}`,
        auditRequired: true
      };

      await this.auditAccess(request, result);
      return result;
    }

    // Check if the user has the required permission
    const hasPermission = applicableRules.some(rule => 
      rule.permissions.includes(permission)
    );

    if (!hasPermission) {
      const result: AccessResult = {
        granted: false,
        reason: `Role ${user.role} does not have ${permission} permission on ${resource}`,
        auditRequired: true
      };

      await this.auditAccess(request, result);
      return result;
    }

    // Check conditions
    const rule = applicableRules.find(rule => rule.permissions.includes(permission));
    if (rule?.conditions) {
      const conditionResult = await this.evaluateConditions(rule.conditions, user, resourceId, additionalContext);
      if (!conditionResult.passed) {
        const result: AccessResult = {
          granted: false,
          reason: conditionResult.reason,
          auditRequired: true
        };

        await this.auditAccess(request, result);
        return result;
      }
    }

    // Generate data restrictions based on role
    const restrictions = this.generateDataRestrictions(user.role, resource);

    const result: AccessResult = {
      granted: true,
      reason: `Access granted for role ${user.role} on ${resource} with ${permission} permission`,
      restrictions,
      auditRequired: this.requiresAudit(resource, permission)
    };

    await this.auditAccess(request, result);
    return result;
  }

  /**
   * Generate data restrictions based on user role and resource
   * Requirement 9.1, 9.2
   */
  private generateDataRestrictions(role: UserRole, resource: PriceManagementResource): DataRestriction[] {
    const restrictions: DataRestriction[] = [];

    switch (role) {
      case 'Requestor':
        if (resource === 'price_assignments') {
          restrictions.push(
            { field: 'vendorDetails', action: 'hide' },
            { field: 'priceBreakdown', action: 'hide' },
            { field: 'alternativeVendors', action: 'hide' },
            { field: 'assignmentReasoning', action: 'hide' }
          );
        }
        break;

      case 'Approver':
        if (resource === 'vendor_pricing') {
          restrictions.push(
            { field: 'detailedPricing', action: 'mask' },
            { field: 'vendorCosts', action: 'hide' },
            { field: 'profitMargins', action: 'hide' }
          );
        }
        if (resource === 'price_history') {
          restrictions.push(
            { field: 'detailedHistory', action: 'mask' },
            { field: 'vendorSpecificData', action: 'hide' }
          );
        }
        break;

      case 'Vendor':
        if (resource === 'vendor_pricing') {
          restrictions.push(
            { field: 'competitorPricing', action: 'hide' },
            { field: 'marketAnalysis', action: 'hide' },
            { field: 'otherVendorData', action: 'hide' }
          );
        }
        break;
    }

    return restrictions;
  }

  /**
   * Evaluate access conditions
   */
  private async evaluateConditions(
    conditions: AccessCondition[], 
    user: UserContext, 
    resourceId?: string, 
    additionalContext?: Record<string, any>
  ): Promise<{ passed: boolean; reason: string }> {
    for (const condition of conditions) {
      switch (condition.operator) {
        case 'equals':
          if (condition.value === 'self') {
            if (condition.field === 'userId' && resourceId !== user.userId) {
              return { passed: false, reason: 'User can only access their own resources' };
            }
          } else if (additionalContext?.[condition.field] !== condition.value) {
            return { passed: false, reason: `Condition failed: ${condition.field} must equal ${condition.value}` };
          }
          break;

        case 'owns':
          if (condition.field === 'vendorId' && condition.value === 'self') {
            if (!user.vendorId || resourceId !== user.vendorId) {
              return { passed: false, reason: 'Vendor can only access their own data' };
            }
          }
          break;

        case 'department_match':
          if (condition.value === 'self' && additionalContext?.department !== user.department) {
            return { passed: false, reason: 'User can only access resources from their department' };
          }
          break;

        case 'location_match':
          if (condition.value === 'self' && additionalContext?.location !== user.location) {
            return { passed: false, reason: 'User can only access resources from their location' };
          }
          break;

        case 'in':
          if (!Array.isArray(condition.value) || !condition.value.includes(additionalContext?.[condition.field])) {
            return { passed: false, reason: `Condition failed: ${condition.field} must be in allowed values` };
          }
          break;
      }
    }

    return { passed: true, reason: 'All conditions passed' };
  }

  /**
   * Determine if an operation requires audit logging
   * Requirement 9.5
   */
  private requiresAudit(resource: PriceManagementResource, permission: Permission): boolean {
    // All write operations require audit
    if (['write', 'delete', 'override', 'approve', 'manage', 'configure'].includes(permission)) {
      return true;
    }

    // Sensitive read operations require audit
    if (resource === 'vendor_pricing' || resource === 'audit_logs' || resource === 'analytics') {
      return true;
    }

    // Price assignments always require audit for compliance
    if (resource === 'price_assignments') {
      return true;
    }

    return false;
  }

  /**
   * Audit access attempts
   * Requirement 9.5
   */
  private async auditAccess(request: AccessRequest, result: AccessResult): Promise<void> {
    if (!result.auditRequired) {
      return;
    }

    const auditEvent: AuditEvent = {
      userId: request.user?.userId || 'unknown',
      userRole: request.user?.role || 'unknown',
      resource: request.resource,
      permission: request.permission,
      resourceId: request.resourceId,
      granted: result.granted,
      reason: result.reason,
      timestamp: new Date(),
      additionalData: request.additionalContext
    };

    // In a real implementation, this would be persisted to a database
    this.auditEvents.push(auditEvent);

    // Log to console for development
    console.log('RBAC Audit Event:', auditEvent);
  }

  /**
   * Get audit events for reporting
   * Requirement 9.5
   */
  async getAuditEvents(filters?: {
    userId?: string;
    resource?: PriceManagementResource;
    startDate?: Date;
    endDate?: Date;
    granted?: boolean;
  }): Promise<AuditEvent[]> {
    let events = [...this.auditEvents];

    if (filters) {
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId);
      }
      if (filters.resource) {
        events = events.filter(e => e.resource === filters.resource);
      }
      if (filters.startDate) {
        events = events.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => e.timestamp <= filters.endDate!);
      }
      if (filters.granted !== undefined) {
        events = events.filter(e => e.granted === filters.granted);
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Update access permissions (for admin use)
   * Requirement 9.6
   */
  async updatePermissions(role: UserRole, resource: PriceManagementResource, permissions: Permission[]): Promise<void> {
    const existingRuleIndex = this.accessRules.findIndex(rule => 
      rule.role === role && rule.resource === resource
    );

    if (existingRuleIndex >= 0) {
      this.accessRules[existingRuleIndex].permissions = permissions;
    } else {
      this.accessRules.push({
        role,
        resource,
        permissions
      });
    }

    // Audit the permission change
    await this.auditAccess(
      {
        user: { userId: 'system', role: 'System' },
        resource: 'vendor_management',
        permission: 'configure'
      },
      {
        granted: true,
        reason: `Updated permissions for role ${role} on resource ${resource}`,
        auditRequired: true
      }
    );
  }

  /**
   * Get current permissions for a role and resource
   */
  getPermissions(role: UserRole, resource: PriceManagementResource): Permission[] {
    const rule = this.accessRules.find(r => r.role === role && r.resource === resource);
    return rule?.permissions || [];
  }

  /**
   * Check if user can perform bulk operations
   */
  async canPerformBulkOperations(user: UserContext, resource: PriceManagementResource): Promise<boolean> {
    const result = await this.checkAccess({
      user,
      resource,
      permission: 'bulk_operations'
    });
    return result.granted;
  }

  /**
   * Filter data based on user restrictions
   */
  filterDataByRestrictions<T extends Record<string, any>>(
    data: T[], 
    restrictions: DataRestriction[]
  ): Partial<T>[] {
    return data.map(item => {
      const filteredItem: Partial<T> = { ...item };

      restrictions.forEach(restriction => {
        switch (restriction.action) {
          case 'hide':
            delete filteredItem[restriction.field as keyof T];
            break;
          case 'mask':
            if (filteredItem[restriction.field as keyof T]) {
              filteredItem[restriction.field as keyof T] = '***' as any;
            }
            break;
          case 'readonly':
            // This would be handled in the UI layer
            break;
          case 'filter':
            // This would filter out entire records based on condition
            break;
        }
      });

      return filteredItem;
    });
  }
}

// Singleton instance
export const priceManagementRBAC = new PriceManagementRBACService();