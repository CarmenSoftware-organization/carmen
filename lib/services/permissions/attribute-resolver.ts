/**
 * ABAC Attribute Resolution Engine
 * Responsible for retrieving and resolving attributes for subjects, resources, actions, and environments
 */

import { SubjectAttributes, ResourceAttributes, EnvironmentAttributes } from '@/lib/types/permissions'
import { User, Role, Department, Location } from '@/lib/types'
import { mockUsers, mockDepartments, mockLocations } from '@/lib/mock-data'

export interface AttributeRequest {
  subjectId?: string
  resourceId?: string
  resourceType?: string
  actionType?: string
  environmentContext?: Record<string, any>
}

export interface AttributeResult {
  subject?: Record<string, any>
  resource?: Record<string, any>
  action?: Record<string, any>
  environment?: Record<string, any>
}

export interface AttributeCache {
  [key: string]: {
    data: any
    timestamp: number
    ttl: number
  }
}

export interface AttributeResolverConfig {
  enableCaching: boolean
  cacheTTL: number // in milliseconds
  maxCacheSize: number
  enableDebug: boolean
}

export class AttributeResolver {
  private cache: AttributeCache = {}
  private config: AttributeResolverConfig

  constructor(config: Partial<AttributeResolverConfig> = {}) {
    this.config = {
      enableCaching: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 1000,
      enableDebug: false,
      ...config
    }
  }

  /**
   * Resolve all attributes for a complete ABAC request
   */
  async resolveAttributes(request: AttributeRequest): Promise<AttributeResult> {
    const startTime = Date.now()
    
    try {
      const [subject, resource, action, environment] = await Promise.all([
        request.subjectId ? this.resolveSubjectAttributes(request.subjectId) : undefined,
        request.resourceId || request.resourceType ? this.resolveResourceAttributes(request.resourceType!, request.resourceId) : undefined,
        request.actionType ? this.resolveActionAttributes(request.actionType) : undefined,
        this.resolveEnvironmentAttributes(request.environmentContext)
      ])

      if (this.config.enableDebug) {
        console.log(`Attribute resolution completed in ${Date.now() - startTime}ms`)
      }

      return {
        subject,
        resource,
        action,
        environment
      }
    } catch (error) {
      console.error('Attribute resolution failed:', error)
      throw error
    }
  }

  /**
   * Resolve subject (user) attributes
   */
  async resolveSubjectAttributes(subjectId: string): Promise<Record<string, any>> {
    const cacheKey = `subject:${subjectId}`
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    try {
      // Fetch user from mock data
      const user = mockUsers.find(u => u.id === subjectId)

      if (!user) {
        throw new Error(`Subject ${subjectId} not found`)
      }

      // Mock role assignments - using user's role property
      const roleAssignments = user.role ? [{
        role: user.role,
        assignedAt: new Date(),
        isActive: true
      }] : []

      // Get role hierarchy
      const roleHierarchy = this.buildRoleHierarchy(roleAssignments.map((r: any) => r.role))

      // Build comprehensive subject attributes
      const attributes = {
        id: user.id,
        name: user.name,
        email: user.email,
        userData: {},
        isActive: true, // Mock users are always active
        createdAt: new Date(),
        updatedAt: new Date(),

        // Role information
        directRoles: roleAssignments.map((r: any) => ({
          id: r.role.id,
          name: r.role.name,
          displayName: r.role.name,
          level: 1,
          path: r.role.name,
          priority: 500,
          assignedAt: r.assignedAt
        })),
        
        // Hierarchical role information
        allRoles: roleHierarchy.allRoles,
        roleNames: roleHierarchy.roleNames,
        maxRoleLevel: roleHierarchy.maxLevel,
        effectivePermissions: roleHierarchy.effectivePermissions,
        
        // Dynamic attributes from userData (mock - none for now)
        ...this.extractDynamicAttributes({}),

        // Computed attributes
        accountAge: 0,
        hasHighPrivilege: roleHierarchy.maxLevel <= 2, // Assuming lower levels = higher privilege
        roleCount: roleAssignments.length
      }

      // Cache the result
      if (this.config.enableCaching) {
        this.setCache(cacheKey, attributes)
      }

      return attributes
    } catch (error) {
      console.error('Subject attribute resolution failed:', error)
      throw error
    }
  }

  /**
   * Resolve resource attributes
   */
  async resolveResourceAttributes(resourceType: string, resourceId?: string): Promise<Record<string, any>> {
    const cacheKey = `resource:${resourceType}:${resourceId || 'type-only'}`
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    try {
      // Mock resource definition - no database query needed
      const resourceDefinition = {
        resourceType,
        displayName: resourceType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: `Resource type for ${resourceType}`,
        category: 'general',
        definition: {},
        isActive: true,
        version: '1.0'
      }

      // Base resource attributes
      const attributes = {
        type: resourceType,
        id: resourceId,
        displayName: resourceDefinition.displayName,
        description: resourceDefinition.description,
        category: resourceDefinition.category,
        definition: resourceDefinition.definition,
        isActive: resourceDefinition.isActive,
        version: resourceDefinition.version,

        // Dynamic attributes from definition
        ...this.extractDynamicAttributes(resourceDefinition.definition),

        // Resource-specific attributes based on type
        ...await this.getResourceSpecificAttributes(resourceType, resourceId)
      }

      // Cache the result
      if (this.config.enableCaching) {
        this.setCache(cacheKey, attributes)
      }

      return attributes
    } catch (error) {
      console.error('Resource attribute resolution failed:', error)
      throw error
    }
  }

  /**
   * Resolve action attributes
   */
  async resolveActionAttributes(actionType: string): Promise<Record<string, any>> {
    const cacheKey = `action:${actionType}`
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    try {
      // Build action attributes
      const attributes = {
        type: actionType,
        name: actionType,
        category: this.getActionCategory(actionType),
        riskLevel: this.getActionRiskLevel(actionType),
        requiresApproval: this.actionRequiresApproval(actionType),
        auditRequired: this.actionRequiresAudit(actionType),
        
        // Action classification
        isReadAction: ['read', 'view', 'list', 'search'].includes(actionType),
        isWriteAction: ['create', 'update', 'delete', 'modify'].includes(actionType),
        isApprovalAction: ['approve', 'reject', 'authorize'].includes(actionType),
        isAdminAction: ['delete', 'disable', 'purge', 'configure'].includes(actionType)
      }

      // Cache the result
      if (this.config.enableCaching) {
        this.setCache(cacheKey, attributes)
      }

      return attributes
    } catch (error) {
      console.error('Action attribute resolution failed:', error)
      throw error
    }
  }

  /**
   * Resolve environment attributes
   */
  async resolveEnvironmentAttributes(context?: Record<string, any>): Promise<Record<string, any>> {
    const now = new Date()
    const cacheKey = `environment:${Math.floor(now.getTime() / 60000)}` // Cache per minute
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return { ...cached, ...context }
      }
    }

    try {
      // Mock environment definitions - no database query needed
      const environmentDefinitions: any[] = []

      // Build environment attributes
      const attributes = {
        timestamp: now,
        timeOfDay: now.getHours(),
        dayOfWeek: now.getDay(),
        isWeekend: now.getDay() === 0 || now.getDay() === 6,
        isBusinessHours: this.isBusinessHours(now),
        quarterOfYear: Math.floor(now.getMonth() / 3) + 1,

        // Security context
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        sessionId: context?.sessionId,
        requestId: context?.requestId,

        // Application context
        applicationVersion: process.env.APP_VERSION,
        environment: process.env.NODE_ENV,

        // Environment definitions
        availableEnvironments: environmentDefinitions.map((env: any) => ({
          name: env.name,
          displayName: env.displayName,
          description: env.description,
          definition: env.definition
        })),

        // Dynamic environment attributes
        ...context,

        // Computed environment attributes
        riskScore: this.calculateEnvironmentRiskScore(context),
        trustLevel: this.calculateEnvironmentTrustLevel(context)
      }

      // Cache the result (with shorter TTL for environment)
      if (this.config.enableCaching) {
        this.setCache(cacheKey, attributes, 60000) // 1 minute TTL for environment
      }

      return attributes
    } catch (error) {
      console.error('Environment attribute resolution failed:', error)
      throw error
    }
  }

  /**
   * Build role hierarchy for a user
   */
  private buildRoleHierarchy(roles: any[]): {
    allRoles: string[]
    roleNames: string[]
    maxLevel: number
    effectivePermissions: string[]
  } {
    const allRoles = new Set<string>()
    const roleNames = new Set<string>()
    let maxLevel = 999
    const effectivePermissions = new Set<string>()

    const addRoleAndParents = (role: any) => {
      if (!role) return
      
      allRoles.add(role.id)
      roleNames.add(role.name)
      maxLevel = Math.min(maxLevel, role.level || 999)

      // Add role-specific permissions from roleData
      if (role.roleData?.permissions) {
        role.roleData.permissions.forEach((perm: string) => effectivePermissions.add(perm))
      }
      
      // Recursively add parent roles
      if (role.parent) {
        addRoleAndParents(role.parent)
      }
    }

    roles.forEach(addRoleAndParents)

    return {
      allRoles: Array.from(allRoles),
      roleNames: Array.from(roleNames),
      maxLevel,
      effectivePermissions: Array.from(effectivePermissions)
    }
  }

  /**
   * Extract dynamic attributes from JSON data
   */
  private extractDynamicAttributes(data: any): Record<string, any> {
    if (!data || typeof data !== 'object') {
      return {}
    }

    const attributes: Record<string, any> = {}
    
    // Flatten nested objects with dot notation
    const flatten = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, newKey)
        } else {
          attributes[newKey] = value
        }
      })
    }

    flatten(data)
    return attributes
  }

  /**
   * Get resource-specific attributes based on resource type
   */
  private async getResourceSpecificAttributes(resourceType: string, resourceId?: string): Promise<Record<string, any>> {
    const attributes: Record<string, any> = {}

    // Add resource-specific logic here based on your Carmen ERP modules
    switch (resourceType) {
      case 'purchase_request':
        if (resourceId) {
          // In a real implementation, fetch PR details from database
          attributes.status = 'draft' // Example
          attributes.totalAmount = 0 // Example
          attributes.urgency = 'normal' // Example
        }
        break
      
      case 'vendor':
        if (resourceId) {
          // In a real implementation, fetch vendor details from database
          attributes.vendorType = 'supplier' // Example
          attributes.creditRating = 'A' // Example
          attributes.isPreferred = false // Example
        }
        break
      
      case 'inventory_item':
        if (resourceId) {
          // In a real implementation, fetch inventory details from database
          attributes.stockLevel = 'adequate' // Example
          attributes.category = 'consumable' // Example
          attributes.reorderPoint = 100 // Example
        }
        break
    }

    return attributes
  }

  /**
   * Get action category
   */
  private getActionCategory(actionType: string): string {
    const categoryMap: Record<string, string> = {
      'create': 'modification',
      'read': 'access',
      'update': 'modification',
      'delete': 'destruction',
      'approve': 'approval',
      'reject': 'approval',
      'submit': 'workflow',
      'cancel': 'workflow',
      'export': 'data-transfer',
      'import': 'data-transfer'
    }
    
    return categoryMap[actionType] || 'general'
  }

  /**
   * Get action risk level
   */
  private getActionRiskLevel(actionType: string): 'low' | 'medium' | 'high' | 'critical' {
    const riskMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'read': 'low',
      'view': 'low',
      'list': 'low',
      'create': 'medium',
      'update': 'medium',
      'delete': 'high',
      'approve': 'high',
      'reject': 'high',
      'purge': 'critical',
      'configure': 'critical'
    }
    
    return riskMap[actionType] || 'medium'
  }

  /**
   * Check if action requires approval
   */
  private actionRequiresApproval(actionType: string): boolean {
    return ['delete', 'approve', 'reject', 'purge', 'configure'].includes(actionType)
  }

  /**
   * Check if action requires audit
   */
  private actionRequiresAudit(actionType: string): boolean {
    return ['create', 'update', 'delete', 'approve', 'reject', 'export', 'import'].includes(actionType)
  }

  /**
   * Check if current time is business hours
   */
  private isBusinessHours(now: Date): boolean {
    const hour = now.getHours()
    const day = now.getDay()
    
    // Monday-Friday, 9 AM to 5 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17
  }

  /**
   * Calculate environment risk score
   */
  private calculateEnvironmentRiskScore(context?: Record<string, any>): number {
    let score = 0
    
    // IP-based risk (example logic)
    if (context?.ipAddress) {
      if (context.ipAddress.startsWith('192.168.') || context.ipAddress.startsWith('10.')) {
        score += 0.1 // Internal network, lower risk
      } else {
        score += 0.3 // External network, higher risk
      }
    }
    
    // Time-based risk
    const now = new Date()
    if (!this.isBusinessHours(now)) {
      score += 0.2 // After hours, higher risk
    }
    
    // User agent based risk (example)
    if (context?.userAgent && context.userAgent.includes('bot')) {
      score += 0.5 // Bot user agent, higher risk
    }
    
    return Math.min(score, 1.0)
  }

  /**
   * Calculate environment trust level
   */
  private calculateEnvironmentTrustLevel(context?: Record<string, any>): 'low' | 'medium' | 'high' {
    const riskScore = this.calculateEnvironmentRiskScore(context)
    
    if (riskScore < 0.3) return 'high'
    if (riskScore < 0.6) return 'medium'
    return 'low'
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    if (!this.config.enableCaching) return null
    
    const entry = this.cache[key]
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete this.cache[key]
      return null
    }
    
    return entry.data
  }

  private setCache(key: string, data: any, ttl?: number): void {
    if (!this.config.enableCaching) return
    
    // Clean cache if it's getting too large
    if (Object.keys(this.cache).length >= this.config.maxCacheSize) {
      this.cleanCache()
    }
    
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL
    }
  }

  private cleanCache(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    // Remove expired entries
    Object.keys(this.cache).forEach(key => {
      const entry = this.cache[key]
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => delete this.cache[key])
    
    // If still too large, remove oldest entries
    const remainingKeys = Object.keys(this.cache)
    if (remainingKeys.length >= this.config.maxCacheSize) {
      const sortedKeys = remainingKeys.sort((a, b) => 
        this.cache[a].timestamp - this.cache[b].timestamp
      )
      
      const toRemove = sortedKeys.slice(0, Math.floor(this.config.maxCacheSize * 0.3))
      toRemove.forEach(key => delete this.cache[key])
    }
  }

  /**
   * Clear all cached attributes
   */
  clearCache(): void {
    this.cache = {}
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now()
    const entries = Object.values(this.cache)
    
    return {
      totalEntries: entries.length,
      expiredEntries: entries.filter(e => now - e.timestamp > e.ttl).length,
      cacheHitRate: 0, // Would need to track hits/misses for accurate calculation
      averageAge: entries.length > 0 
        ? entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length 
        : 0,
      memoryUsage: JSON.stringify(this.cache).length
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AttributeResolverConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Export singleton instance
export const attributeResolver = new AttributeResolver({
  enableCaching: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 1000,
  enableDebug: false
})

// Export convenience functions
export const resolveSubjectAttributes = (subjectId: string) => 
  attributeResolver.resolveSubjectAttributes(subjectId)

export const resolveResourceAttributes = (resourceType: string, resourceId?: string) =>
  attributeResolver.resolveResourceAttributes(resourceType, resourceId)

export const resolveActionAttributes = (actionType: string) =>
  attributeResolver.resolveActionAttributes(actionType)

export const resolveEnvironmentAttributes = (context?: Record<string, any>) =>
  attributeResolver.resolveEnvironmentAttributes(context)

export const resolveAllAttributes = (request: AttributeRequest) =>
  attributeResolver.resolveAttributes(request)