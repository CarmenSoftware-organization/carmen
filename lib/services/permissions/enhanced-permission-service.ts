/**
 * Enhanced Permission Service - Database-connected ABAC service
 * Integrates PolicyEngine, AttributeResolver, and PostgreSQL database for complete ABAC functionality
 */

import { policyEngine, PolicyEngineConfig } from './policy-engine'
import { attributeResolver, AttributeRequest } from './attribute-resolver'
import {
  Policy,
  SubjectAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  AccessDecision,
  PermissionResult
} from '@/lib/types/permissions'
import { mockUsers } from '@/lib/mock-data'

export interface EnhancedPermissionCheckRequest {
  userId: string
  resourceType: string
  resourceId?: string
  action: string
  context?: {
    department?: string
    location?: string
    ipAddress?: string
    userAgent?: string
    sessionId?: string
    requestId?: string
    additionalAttributes?: Record<string, any>
  }
  options?: {
    resolveAttributes?: boolean
    enableCaching?: boolean
    auditEnabled?: boolean
  }
}

export interface EnhancedPermissionResult {
  allowed: boolean
  reason: string
  decision: AccessDecision
  executionTime: number
  attributeResolutionTime?: number
  resolvedAttributes?: {
    subject?: Record<string, any>
    resource?: Record<string, any>
    action?: Record<string, any>
    environment?: Record<string, any>
  }
  matchedPolicies: string[]
  auditLogId?: string
}

export interface PolicyCacheEntry {
  policies: Policy[]
  timestamp: number
  ttl: number
}

export class EnhancedPermissionService {
  private policyCache: PolicyCacheEntry | null = null
  private readonly POLICY_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  
  constructor(private engineConfig?: Partial<PolicyEngineConfig>) {}

  /**
   * Check if a user has permission to perform an action on a resource
   * This is the main ABAC evaluation method with full database integration
   */
  async checkPermission(request: EnhancedPermissionCheckRequest): Promise<EnhancedPermissionResult> {
    const startTime = Date.now()
    let attributeResolutionTime = 0
    let resolvedAttributes: any = undefined
    
    try {
      // Step 1: Resolve attributes if requested
      if (request.options?.resolveAttributes !== false) {
        const attrStartTime = Date.now()
        
        const attributeRequest: AttributeRequest = {
          subjectId: request.userId,
          resourceType: request.resourceType,
          resourceId: request.resourceId,
          actionType: request.action,
          environmentContext: request.context
        }
        
        resolvedAttributes = await attributeResolver.resolveAttributes(attributeRequest)
        attributeResolutionTime = Date.now() - attrStartTime
      }

      // Step 2: Build ABAC components with resolved attributes
      const subject = await this.buildEnhancedSubject(request.userId, request.context, resolvedAttributes?.subject)
      const resource = await this.buildEnhancedResource(request.resourceType, request.resourceId, resolvedAttributes?.resource)
      const action = request.action
      const environment = this.buildEnhancedEnvironment(request.context, resolvedAttributes?.environment)

      // Step 3: Get active policies
      const policies = await this.getActivePolicies()

      // Step 4: Evaluate permission using policy engine
      const decision = await policyEngine.evaluateAccess(
        subject, resource, action, environment, policies
      )

      // Step 5: Create audit log if enabled
      let auditLogId: string | undefined
      if (request.options?.auditEnabled !== false) {
        auditLogId = await this.createAuditLog({
          userId: request.userId,
          resourceType: request.resourceType,
          resourceId: request.resourceId,
          action: request.action,
          decision: decision.effect === 'permit' ? 'permit' : 'deny',
          reason: decision.reason,
          context: request.context,
          executionTime: Date.now() - startTime
        })
      }

      // Step 6: Prepare result
      const result: EnhancedPermissionResult = {
        allowed: decision.effect === 'permit',
        reason: decision.reason,
        decision,
        executionTime: Date.now() - startTime,
        attributeResolutionTime: attributeResolutionTime > 0 ? attributeResolutionTime : undefined,
        resolvedAttributes: resolvedAttributes,
        matchedPolicies: decision.evaluatedPolicies.filter(p => p.effect === 'permit' || p.effect === 'deny').map(p => p.policyId),
        auditLogId
      }

      return result
    } catch (error) {
      const errorResult: EnhancedPermissionResult = {
        allowed: false,
        reason: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        decision: {
          effect: 'deny' as any,
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          obligations: [],
          advice: [],
          requestId: '',
          evaluatedPolicies: [],
          evaluationTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
          evaluatedBy: 'enhanced-permission-service',
          auditRequired: false
        },
        executionTime: Date.now() - startTime,
        matchedPolicies: []
      }

      // Log error for debugging
      console.error('Enhanced permission check failed:', error)

      return errorResult
    }
  }

  /**
   * Check multiple permissions in bulk with optimized database queries
   */
  async checkBulkPermissions(
    userId: string,
    permissions: Array<{ resourceType: string; resourceId?: string; action: string }>,
    context?: EnhancedPermissionCheckRequest['context'],
    options?: EnhancedPermissionCheckRequest['options']
  ): Promise<Array<EnhancedPermissionResult>> {
    // Optimize by resolving user attributes once
    const userAttributes = options?.resolveAttributes !== false 
      ? await attributeResolver.resolveSubjectAttributes(userId)
      : undefined

    // Process all permissions in parallel
    const results = await Promise.all(
      permissions.map(permission => 
        this.checkPermission({
          userId,
          ...permission,
          context,
          options: {
            ...options,
            resolveAttributes: false // Already resolved above
          }
        })
      )
    )

    return results
  }

  /**
   * Get all effective permissions for a user
   */
  async getEffectivePermissions(
    userId: string,
    context?: EnhancedPermissionCheckRequest['context']
  ): Promise<PermissionResult[]> {
    const effectivePermissions: PermissionResult[] = []

    // Mock resource definitions - no database query needed
    const resourceTypes = [
      'purchase_request',
      'purchase_order',
      'goods_received_note',
      'vendor',
      'product',
      'recipe',
      'inventory_item',
      'stock_adjustment',
      'user',
      'role',
      'policy',
      'report',
      'dashboard',
      'workflow'
    ]

    // Check permissions for each resource type and action
    for (const resourceType of resourceTypes) {
      const possibleActions = this.getPossibleActionsForResource(resourceType)

      for (const action of possibleActions) {
        const result = await this.checkPermission({
          userId,
          resourceType,
          action,
          context,
          options: { auditEnabled: false } // Skip audit for bulk operations
        })

        if (result.allowed) {
          effectivePermissions.push({
            allowed: true,
            reason: 'Permission granted by policy',
            evaluationTime: result.executionTime,
            cacheHit: false
          })
        }
      }
    }

    return effectivePermissions
  }

  /**
   * Get active policies from mock data with caching
   */
  private async getActivePolicies(): Promise<Policy[]> {
    // Check cache first
    if (this.policyCache && Date.now() - this.policyCache.timestamp < this.POLICY_CACHE_TTL) {
      return this.policyCache.policies
    }

    // Return empty array - policies will be managed through mock data if needed
    const policies: Policy[] = []

    // Update cache
    this.policyCache = {
      policies,
      timestamp: Date.now(),
      ttl: this.POLICY_CACHE_TTL
    }

    return policies
  }

  /**
   * Build enhanced subject with database-resolved attributes
   */
  private async buildEnhancedSubject(
    userId: string,
    context?: EnhancedPermissionCheckRequest['context'],
    resolvedAttributes?: Record<string, any>
  ): Promise<SubjectAttributes> {
    const baseAttributes = resolvedAttributes || await attributeResolver.resolveSubjectAttributes(userId)

    return {
      userId,
      username: baseAttributes.username || userId,
      email: baseAttributes.email || `${userId}@example.com`,
      role: baseAttributes.role || { id: 'default', name: 'Default', permissions: [] } as any,
      roles: baseAttributes.roles || [],
      department: baseAttributes.department || { id: 'default', name: 'Default', code: 'DEF', status: 'active' } as any,
      departments: baseAttributes.departments || [],
      location: baseAttributes.location || { id: 'default', name: 'Default', type: 'office' } as any,
      locations: baseAttributes.locations || [],
      employeeType: baseAttributes.employeeType || 'full-time',
      seniority: baseAttributes.seniority || 0,
      clearanceLevel: baseAttributes.clearanceLevel || 'internal',
      assignedWorkflowStages: baseAttributes.assignedWorkflowStages || [],
      delegatedAuthorities: baseAttributes.delegatedAuthorities || [],
      specialPermissions: baseAttributes.specialPermissions || [],
      accountStatus: baseAttributes.accountStatus || 'active',
      onDuty: baseAttributes.onDuty || true
    }
  }

  /**
   * Build enhanced resource with database-resolved attributes
   */
  private async buildEnhancedResource(
    resourceType: string,
    resourceId?: string,
    resolvedAttributes?: Record<string, any>
  ): Promise<ResourceAttributes> {
    const baseAttributes = resolvedAttributes || await attributeResolver.resolveResourceAttributes(resourceType, resourceId)

    return {
      resourceId: resourceId || resourceType,
      resourceType,
      resourceName: baseAttributes.resourceName || resourceType,
      dataClassification: baseAttributes.dataClassification || 'internal',
      createdAt: baseAttributes.createdAt || new Date(),
      updatedAt: baseAttributes.updatedAt || new Date(),
      requiresAudit: baseAttributes.requiresAudit || false,
      owner: baseAttributes.owner,
      ownerDepartment: baseAttributes.ownerDepartment,
      ownerLocation: baseAttributes.ownerLocation,
      documentStatus: baseAttributes.documentStatus,
      workflowStage: baseAttributes.workflowStage,
      approvalLevel: baseAttributes.approvalLevel,
      priority: baseAttributes.priority,
      totalValue: baseAttributes.totalValue,
      budgetCategory: baseAttributes.budgetCategory,
      costCenter: baseAttributes.costCenter,
      customAttributes: baseAttributes.customAttributes
    }
  }

  /**
   * Build enhanced environment with resolved attributes
   */
  private buildEnhancedEnvironment(
    context?: EnhancedPermissionCheckRequest['context'],
    resolvedAttributes?: Record<string, any>
  ): EnvironmentAttributes {
    const baseAttributes = resolvedAttributes || {}
    const now = new Date()

    return {
      currentTime: now,
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      isBusinessHours: baseAttributes.isBusinessHours || false,
      isHoliday: baseAttributes.isHoliday || false,
      timeZone: baseAttributes.timeZone || 'UTC',
      requestIP: context?.ipAddress || '127.0.0.1',
      requestLocation: baseAttributes.requestLocation,
      isInternalNetwork: baseAttributes.isInternalNetwork || true,
      facility: baseAttributes.facility,
      country: baseAttributes.country,
      region: baseAttributes.region,
      deviceType: baseAttributes.deviceType || 'desktop',
      deviceId: baseAttributes.deviceId,
      userAgent: context?.userAgent,
      sessionId: context?.sessionId || '',
      authenticationMethod: baseAttributes.authenticationMethod || 'password',
      sessionAge: baseAttributes.sessionAge || 0,
      systemLoad: baseAttributes.systemLoad || 'normal',
      maintenanceMode: baseAttributes.maintenanceMode || false,
      emergencyMode: baseAttributes.emergencyMode || false,
      systemVersion: baseAttributes.systemVersion || '1.0.0',
      threatLevel: baseAttributes.threatLevel || 'low',
      complianceMode: baseAttributes.complianceMode || [],
      auditMode: baseAttributes.auditMode || false,
      requestMethod: baseAttributes.requestMethod,
      requestSource: baseAttributes.requestSource || 'ui',
      batchOperation: baseAttributes.batchOperation || false,
      customEnvironment: baseAttributes.customEnvironment
    }
  }

  /**
   * Create audit log entry (mock implementation)
   */
  private async createAuditLog(data: {
    userId: string
    resourceType: string
    resourceId?: string
    action: string
    decision: 'permit' | 'deny'
    reason: string
    context?: any
    executionTime: number
  }): Promise<string> {
    // Mock audit log - just generate a random ID
    const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // In a real implementation, this would store to database
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Audit Log:', {
        id: auditLogId,
        eventType: data.decision === 'permit' ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
        userId: data.userId,
        resource: data.resourceType,
        action: data.action,
        decision: data.decision
      })
    }

    return auditLogId
  }

  /**
   * Get action type from action name
   */
  private getActionType(actionName: string): string {
    const typeMap: Record<string, string> = {
      'create': 'write',
      'read': 'read',
      'update': 'write',
      'delete': 'write',
      'approve': 'approve',
      'reject': 'approve',
      'submit': 'submit',
      'cancel': 'write',
      'view': 'read',
      'list': 'read',
      'export': 'export',
      'import': 'import'
    }
    
    return typeMap[actionName] || 'read'
  }

  /**
   * Get possible actions for a resource type
   */
  private getPossibleActionsForResource(resourceType: string): string[] {
    const actionMap: Record<string, string[]> = {
      'purchase_request': ['create', 'read', 'update', 'delete', 'submit', 'approve', 'reject', 'cancel'],
      'purchase_order': ['create', 'read', 'update', 'delete', 'submit', 'approve', 'cancel'],
      'goods_received_note': ['create', 'read', 'update', 'delete', 'submit'],
      'vendor': ['create', 'read', 'update', 'delete'],
      'product': ['create', 'read', 'update', 'delete'],
      'recipe': ['create', 'read', 'update', 'delete'],
      'inventory_item': ['create', 'read', 'update', 'delete'],
      'stock_adjustment': ['create', 'read', 'update', 'delete', 'submit', 'approve'],
      'user': ['create', 'read', 'update', 'delete'],
      'role': ['create', 'read', 'update', 'delete'],
      'policy': ['create', 'read', 'update', 'delete'],
      'report': ['view', 'export'],
      'dashboard': ['view'],
      'workflow': ['create', 'read', 'update', 'delete']
    }
    
    return actionMap[resourceType] || ['read']
  }

  /**
   * Clear policy cache
   */
  clearPolicyCache(): void {
    this.policyCache = null
  }

  /**
   * Get service statistics
   */
  async getStats() {
    // Mock statistics - no database queries
    return {
      activePolicies: 0,
      auditLogEntries: 0,
      policyCached: !!this.policyCache,
      policyEngine: policyEngine.getStats(),
      attributeResolver: attributeResolver.getCacheStats()
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, boolean>
    details: Record<string, any>
  }> {
    const checks: Record<string, boolean> = {}
    const details: Record<string, any> = {}

    // Mock database check - always healthy in mock mode
    checks.database = true

    try {
      // Test policy loading
      await this.getActivePolicies()
      checks.policyLoading = true
    } catch (error) {
      checks.policyLoading = false
      details.policyLoadingError = error instanceof Error ? error.message : 'Unknown error'
    }

    try {
      // Test attribute resolution
      await attributeResolver.resolveEnvironmentAttributes()
      checks.attributeResolution = true
    } catch (error) {
      checks.attributeResolution = false
      details.attributeResolutionError = error instanceof Error ? error.message : 'Unknown error'
    }

    const allHealthy = Object.values(checks).every(check => check)
    const mostlyHealthy = Object.values(checks).filter(check => check).length >= Object.keys(checks).length * 0.7

    return {
      status: allHealthy ? 'healthy' : mostlyHealthy ? 'degraded' : 'unhealthy',
      checks,
      details
    }
  }
}

// Export singleton instance
export const enhancedPermissionService = new EnhancedPermissionService({
  combiningAlgorithm: 'deny-overrides',
  enableAuditLog: true,
  defaultDecision: 'deny'
})

// Export convenience functions
export const checkEnhancedPermission = (request: EnhancedPermissionCheckRequest) => 
  enhancedPermissionService.checkPermission(request)

export const hasEnhancedPermission = async (
  userId: string, 
  resourceType: string, 
  action: string, 
  resourceId?: string,
  context?: EnhancedPermissionCheckRequest['context']
) => {
  const result = await enhancedPermissionService.checkPermission({
    userId,
    resourceType,
    resourceId,
    action,
    context
  })
  return result.allowed
}

export const getEnhancedUserPermissions = (
  userId: string, 
  context?: EnhancedPermissionCheckRequest['context']
) =>
  enhancedPermissionService.getEffectivePermissions(userId, context)