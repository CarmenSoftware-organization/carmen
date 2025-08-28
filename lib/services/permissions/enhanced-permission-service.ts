/**
 * Enhanced Permission Service - Database-connected ABAC service
 * Integrates PolicyEngine, AttributeResolver, and PostgreSQL database for complete ABAC functionality
 */

import { PrismaClient } from '@prisma/client'
import { policyEngine, PolicyEngineConfig } from './policy-engine'
import { attributeResolver, AttributeRequest } from './attribute-resolver'
import { Policy, Subject, Resource, Action, Environment, PolicyDecision, Permission } from '@/lib/types/permissions'

const prisma = new PrismaClient()

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
  decision: PolicyDecision
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
      const action = this.buildEnhancedAction(request.action, resolvedAttributes?.action)
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
          decision: decision.decision,
          reason: decision.reason,
          context: request.context,
          executionTime: Date.now() - startTime
        })
      }

      // Step 6: Prepare result
      const result: EnhancedPermissionResult = {
        allowed: decision.decision === 'permit',
        reason: decision.reason,
        decision,
        executionTime: Date.now() - startTime,
        attributeResolutionTime: attributeResolutionTime > 0 ? attributeResolutionTime : undefined,
        resolvedAttributes: resolvedAttributes,
        matchedPolicies: decision.evaluatedPolicies.filter(p => p.matches).map(p => p.policyId),
        auditLogId
      }

      return result
    } catch (error) {
      const errorResult: EnhancedPermissionResult = {
        allowed: false,
        reason: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        decision: {
          decision: 'deny',
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          evaluatedPolicies: []
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
  ): Promise<Permission[]> {
    const effectivePermissions: Permission[] = []
    
    // Get all resource definitions from database
    const resourceDefinitions = await prisma.abac_resource_definitions.findMany({
      where: { is_active: true }
    })

    // Check permissions for each resource type and action
    for (const resourceDef of resourceDefinitions) {
      const possibleActions = this.getPossibleActionsForResource(resourceDef.resource_type)
      
      for (const action of possibleActions) {
        const result = await this.checkPermission({
          userId,
          resourceType: resourceDef.resource_type,
          action,
          context,
          options: { auditEnabled: false } // Skip audit for bulk operations
        })
        
        if (result.allowed) {
          effectivePermissions.push({
            id: `${userId}-${resourceDef.resource_type}-${action}`,
            subjectId: userId,
            resourceType: resourceDef.resource_type,
            action,
            effect: 'permit',
            source: 'policy',
            grantedAt: new Date(),
            grantedBy: 'system'
          })
        }
      }
    }
    
    return effectivePermissions
  }

  /**
   * Get active policies from database with caching
   */
  private async getActivePolicies(): Promise<Policy[]> {
    // Check cache first
    if (this.policyCache && Date.now() - this.policyCache.timestamp < this.POLICY_CACHE_TTL) {
      return this.policyCache.policies
    }

    // Fetch from database
    const dbPolicies = await prisma.abac_policies.findMany({
      where: { 
        status: 'ACTIVE',
        OR: [
          { valid_from: null },
          { valid_from: { lte: new Date() } }
        ],
        AND: [
          { OR: [
              { valid_until: null },
              { valid_until: { gte: new Date() } }
            ]
          }
        ]
      },
      orderBy: { priority: 'desc' }
    })

    // Convert to Policy objects
    const policies: Policy[] = dbPolicies.map(dbPolicy => ({
      id: dbPolicy.id,
      name: dbPolicy.name,
      description: dbPolicy.description,
      effect: dbPolicy.effect as 'permit' | 'deny',
      priority: dbPolicy.priority || 500,
      isActive: dbPolicy.status === 'ACTIVE',
      validFrom: dbPolicy.valid_from || undefined,
      validUntil: dbPolicy.valid_until || undefined,
      
      // Extract policy structure from JSON
      rules: dbPolicy.policy_data?.rules || [],
      subjectConditions: dbPolicy.policy_data?.subject || {},
      resourceConditions: dbPolicy.policy_data?.resource || {},
      actionConditions: dbPolicy.policy_data?.action || {},
      environmentConditions: dbPolicy.policy_data?.environment || {},
      
      ruleCombiningAlgorithm: dbPolicy.policy_data?.ruleCombiningAlgorithm || 'deny-overrides',
      
      // Metadata
      version: dbPolicy.version || '1.0',
      createdBy: dbPolicy.created_by || 'system',
      updatedBy: dbPolicy.updated_by || 'system',
      createdAt: dbPolicy.created_at,
      updatedAt: dbPolicy.updated_at
    }))

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
  ): Promise<Subject> {
    const baseAttributes = resolvedAttributes || await attributeResolver.resolveSubjectAttributes(userId)
    
    return {
      id: userId,
      type: 'user',
      roles: baseAttributes.roleNames || [],
      department: context?.department || baseAttributes['userData.department'] || 'default',
      location: context?.location || baseAttributes['userData.location'] || 'default',
      permissions: baseAttributes.effectivePermissions || [],
      attributes: {
        ...baseAttributes,
        ...context?.additionalAttributes,
        // Override with context if provided
        contextDepartment: context?.department,
        contextLocation: context?.location
      }
    }
  }

  /**
   * Build enhanced resource with database-resolved attributes
   */
  private async buildEnhancedResource(
    resourceType: string,
    resourceId?: string,
    resolvedAttributes?: Record<string, any>
  ): Promise<Resource> {
    const baseAttributes = resolvedAttributes || await attributeResolver.resolveResourceAttributes(resourceType, resourceId)
    
    return {
      id: resourceId || resourceType,
      type: resourceType,
      category: baseAttributes.category || 'general',
      attributes: {
        ...baseAttributes,
        hasSpecificId: !!resourceId
      }
    }
  }

  /**
   * Build enhanced action with resolved attributes
   */
  private buildEnhancedAction(actionName: string, resolvedAttributes?: Record<string, any>): Action {
    const baseAttributes = resolvedAttributes || {}
    
    return {
      name: actionName,
      type: baseAttributes.category || this.getActionType(actionName),
      attributes: {
        ...baseAttributes,
        riskLevel: baseAttributes.riskLevel || 'medium',
        requiresApproval: baseAttributes.requiresApproval || false,
        auditRequired: baseAttributes.auditRequired || false
      }
    }
  }

  /**
   * Build enhanced environment with resolved attributes
   */
  private buildEnhancedEnvironment(
    context?: EnhancedPermissionCheckRequest['context'],
    resolvedAttributes?: Record<string, any>
  ): Environment {
    const baseAttributes = resolvedAttributes || {}
    
    return {
      timestamp: new Date(),
      timeOfDay: baseAttributes.timeOfDay || new Date().getHours(),
      dayOfWeek: baseAttributes.dayOfWeek || new Date().getDay(),
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      attributes: {
        ...baseAttributes,
        sessionId: context?.sessionId,
        requestId: context?.requestId,
        isBusinessHours: baseAttributes.isBusinessHours || false,
        riskScore: baseAttributes.riskScore || 0,
        trustLevel: baseAttributes.trustLevel || 'medium'
      }
    }
  }

  /**
   * Create audit log entry
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
    const auditLog = await prisma.abac_audit_logs.create({
      data: {
        subject_id: data.userId,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        action: data.action,
        decision: data.decision,
        reason: data.reason,
        evaluation_context: data.context || {},
        execution_time_ms: data.executionTime,
        timestamp: new Date()
      }
    })

    return auditLog.id
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
    const [policyCount, auditLogCount] = await Promise.all([
      prisma.abac_policies.count({ where: { status: 'ACTIVE' } }),
      prisma.abac_audit_logs.count()
    ])

    return {
      activePolicies: policyCount,
      auditLogEntries: auditLogCount,
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

    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`
      checks.database = true
    } catch (error) {
      checks.database = false
      details.databaseError = error instanceof Error ? error.message : 'Unknown error'
    }

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