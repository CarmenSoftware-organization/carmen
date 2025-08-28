/**
 * Permission Utilities
 * Helper functions for permission management and validation
 */

import { Policy, PolicyRule, Subject, Resource, Action, Environment } from '@/lib/types/permissions'
import { User, Role } from '@/lib/types/user'
import { permissionService } from './permission-service'

/**
 * Permission validation utilities
 */
export class PermissionValidator {
  /**
   * Validate policy structure
   */
  static validatePolicy(policy: Policy): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!policy.id || policy.id.trim() === '') {
      errors.push('Policy ID is required')
    }

    if (!policy.name || policy.name.trim() === '') {
      errors.push('Policy name is required')
    }

    if (!policy.rules || policy.rules.length === 0) {
      errors.push('Policy must have at least one rule')
    }

    // Validate priority
    if (policy.priority !== undefined && (policy.priority < 0 || policy.priority > 1000)) {
      errors.push('Policy priority must be between 0 and 1000')
    }

    // Validate rules
    if (policy.rules) {
      policy.rules.forEach((rule, index) => {
        const ruleErrors = this.validateRule(rule)
        if (!ruleErrors.isValid) {
          errors.push(...ruleErrors.errors.map(e => `Rule ${index + 1}: ${e}`))
        }
      })
    }

    // Validate date ranges
    if (policy.validFrom && policy.validUntil) {
      if (policy.validFrom >= policy.validUntil) {
        errors.push('Valid from date must be before valid until date')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate policy rule structure
   */
  static validateRule(rule: PolicyRule): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!rule.name || rule.name.trim() === '') {
      errors.push('Rule name is required')
    }

    if (!rule.condition || rule.condition.trim() === '') {
      errors.push('Rule condition is required')
    }

    if (!['permit', 'deny'].includes(rule.effect)) {
      errors.push('Rule effect must be either "permit" or "deny"')
    }

    // Validate condition syntax (basic validation)
    if (rule.condition) {
      try {
        this.validateConditionSyntax(rule.condition)
      } catch (error) {
        errors.push(`Invalid condition syntax: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Basic condition syntax validation
   */
  static validateConditionSyntax(condition: string): void {
    // Check for balanced parentheses
    let parenthesesCount = 0
    for (const char of condition) {
      if (char === '(') parenthesesCount++
      if (char === ')') parenthesesCount--
      if (parenthesesCount < 0) {
        throw new Error('Unmatched closing parenthesis')
      }
    }
    if (parenthesesCount !== 0) {
      throw new Error('Unmatched opening parenthesis')
    }

    // Check for valid function calls
    const functionPattern = /(hasRole|hasPermission|inDepartment|resourceType|actionType|isWorkingHours)\s*\(/g
    const matches = condition.match(functionPattern)
    
    if (matches) {
      for (const match of matches) {
        const functionName = match.replace(/\s*\(/, '')
        const validFunctions = ['hasRole', 'hasPermission', 'inDepartment', 'resourceType', 'actionType', 'isWorkingHours']
        if (!validFunctions.includes(functionName)) {
          throw new Error(`Unknown function: ${functionName}`)
        }
      }
    }

    // Check for valid operators
    const invalidOperators = /[^a-zA-Z0-9\s()'".,=!<>&|+-]/g
    const invalidChars = condition.match(invalidOperators)
    if (invalidChars) {
      throw new Error(`Invalid characters in condition: ${invalidChars.join(', ')}`)
    }
  }
}

/**
 * Permission formatting and display utilities
 */
export class PermissionFormatter {
  /**
   * Format a permission for display
   */
  static formatPermission(resourceType: string, action: string, resourceId?: string): string {
    const resourceDisplay = this.formatResourceType(resourceType)
    const actionDisplay = this.formatAction(action)
    
    if (resourceId) {
      return `${actionDisplay} ${resourceDisplay} (${resourceId})`
    }
    
    return `${actionDisplay} ${resourceDisplay}`
  }

  /**
   * Format resource type for display
   */
  static formatResourceType(resourceType: string): string {
    const typeMap: Record<string, string> = {
      'purchase-request': 'Purchase Requests',
      'purchase-order': 'Purchase Orders',
      'goods-received-note': 'Goods Received Notes',
      'vendor': 'Vendors',
      'product': 'Products',
      'recipe': 'Recipes',
      'inventory-item': 'Inventory Items',
      'stock-adjustment': 'Stock Adjustments',
      'user': 'Users',
      'role': 'Roles',
      'policy': 'Policies',
      'report': 'Reports',
      'dashboard': 'Dashboard',
      'workflow': 'Workflows'
    }
    
    return typeMap[resourceType] || resourceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Format action for display
   */
  static formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      'create': 'Create',
      'read': 'View',
      'update': 'Edit',
      'delete': 'Delete',
      'approve': 'Approve',
      'reject': 'Reject',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'view': 'View',
      'list': 'List',
      'export': 'Export',
      'import': 'Import'
    }
    
    return actionMap[action] || action.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Format policy effect for display
   */
  static formatEffect(effect: 'permit' | 'deny'): string {
    return effect === 'permit' ? 'Allow' : 'Deny'
  }

  /**
   * Format policy priority for display
   */
  static formatPriority(priority?: number): string {
    if (!priority) return 'Normal'
    
    if (priority >= 900) return 'Critical'
    if (priority >= 700) return 'High'
    if (priority >= 500) return 'Normal'
    return 'Low'
  }

  /**
   * Get priority color class
   */
  static getPriorityColorClass(priority?: number): string {
    if (!priority) return 'text-gray-600'
    
    if (priority >= 900) return 'text-red-600'
    if (priority >= 700) return 'text-orange-600'
    if (priority >= 500) return 'text-blue-600'
    return 'text-gray-600'
  }

  /**
   * Format condition for display
   */
  static formatCondition(condition: string): string {
    return condition
      .replace(/hasRole\('([^']+)'\)/g, 'has role "$1"')
      .replace(/hasPermission\('([^']+)'\)/g, 'has permission "$1"')
      .replace(/inDepartment\('([^']+)'\)/g, 'in department "$1"')
      .replace(/resourceType\('([^']+)'\)/g, 'resource type is "$1"')
      .replace(/actionType\('([^']+)'\)/g, 'action type is "$1"')
      .replace(/isWorkingHours\(\)/g, 'during working hours')
      .replace(/&&/g, ' and ')
      .replace(/\|\|/g, ' or ')
      .replace(/==/g, ' equals ')
      .replace(/!=/g, ' does not equal ')
  }
}

/**
 * Permission analysis utilities
 */
export class PermissionAnalyzer {
  /**
   * Analyze policy conflicts
   */
  static async analyzePolicyConflicts(policies: Policy[]): Promise<{
    conflicts: Array<{
      policy1: string
      policy2: string
      conflictType: 'permission' | 'priority' | 'condition'
      description: string
    }>
    warnings: string[]
  }> {
    const conflicts = []
    const warnings = []

    // Check for conflicting effects on same resource-action combinations
    const policyMap = new Map<string, Policy[]>()
    
    for (const policy of policies) {
      const key = this.getPolicyResourceActionKey(policy)
      if (!policyMap.has(key)) {
        policyMap.set(key, [])
      }
      policyMap.get(key)!.push(policy)
    }

    // Find conflicts
    for (const [key, policiesForKey] of policyMap) {
      if (policiesForKey.length > 1) {
        const permitPolicies = policiesForKey.filter(p => 
          p.rules.some(r => r.effect === 'permit')
        )
        const denyPolicies = policiesForKey.filter(p => 
          p.rules.some(r => r.effect === 'deny')
        )

        if (permitPolicies.length > 0 && denyPolicies.length > 0) {
          for (const permitPolicy of permitPolicies) {
            for (const denyPolicy of denyPolicies) {
              conflicts.push({
                policy1: permitPolicy.id,
                policy2: denyPolicy.id,
                conflictType: 'permission',
                description: `Policy "${permitPolicy.name}" permits while policy "${denyPolicy.name}" denies the same resource-action combination`
              })
            }
          }
        }
      }
    }

    // Check for duplicate priorities
    const priorityMap = new Map<number, Policy[]>()
    for (const policy of policies) {
      const priority = policy.priority || 500
      if (!priorityMap.has(priority)) {
        priorityMap.set(priority, [])
      }
      priorityMap.get(priority)!.push(policy)
    }

    for (const [priority, policiesWithPriority] of priorityMap) {
      if (policiesWithPriority.length > 1) {
        warnings.push(`Multiple policies have the same priority ${priority}: ${policiesWithPriority.map(p => p.name).join(', ')}`)
      }
    }

    return { conflicts, warnings }
  }

  /**
   * Get a key representing the resource-action combination for a policy
   */
  private static getPolicyResourceActionKey(policy: Policy): string {
    // This is a simplified implementation
    // In a real system, you'd analyze the policy conditions to determine resource-action combinations
    return `${policy.resourceConditions || 'any'}-${policy.actionConditions || 'any'}`
  }

  /**
   * Analyze user permissions coverage
   */
  static async analyzeUserPermissions(userId: string): Promise<{
    totalPermissions: number
    allowedPermissions: number
    deniedPermissions: number
    coverageByCategory: Record<string, { allowed: number; total: number }>
  }> {
    const allPermissions = await permissionService.getEffectivePermissions(userId)
    
    const coverageByCategory: Record<string, { allowed: number; total: number }> = {}
    
    // Group permissions by category
    for (const permission of allPermissions) {
      const category = this.getResourceCategory(permission.resourceType)
      
      if (!coverageByCategory[category]) {
        coverageByCategory[category] = { allowed: 0, total: 0 }
      }
      
      coverageByCategory[category].total++
      if (permission.effect === 'permit') {
        coverageByCategory[category].allowed++
      }
    }

    return {
      totalPermissions: allPermissions.length,
      allowedPermissions: allPermissions.filter(p => p.effect === 'permit').length,
      deniedPermissions: allPermissions.filter(p => p.effect === 'deny').length,
      coverageByCategory
    }
  }

  /**
   * Get resource category
   */
  private static getResourceCategory(resourceType: string): string {
    const categoryMap: Record<string, string> = {
      'purchase-request': 'Procurement',
      'purchase-order': 'Procurement',
      'goods-received-note': 'Procurement',
      'vendor': 'Procurement',
      'product': 'Product Management',
      'recipe': 'Operational Planning',
      'inventory-item': 'Inventory Management',
      'stock-adjustment': 'Inventory Management',
      'user': 'System Administration',
      'role': 'System Administration',
      'policy': 'System Administration',
      'report': 'Reporting & Analytics',
      'dashboard': 'Dashboard',
      'workflow': 'System Administration'
    }
    
    return categoryMap[resourceType] || 'Other'
  }

  /**
   * Generate permission summary for a user
   */
  static async generatePermissionSummary(userId: string): Promise<{
    user: string
    summary: {
      category: string
      permissions: Array<{
        resource: string
        actions: string[]
        allowed: boolean
      }>
    }[]
  }> {
    const permissions = await permissionService.getEffectivePermissions(userId)
    const summary: Record<string, Array<{ resource: string; actions: string[]; allowed: boolean }>> = {}

    for (const permission of permissions) {
      const category = this.getResourceCategory(permission.resourceType)
      
      if (!summary[category]) {
        summary[category] = []
      }

      let resourceEntry = summary[category].find(r => r.resource === permission.resourceType)
      if (!resourceEntry) {
        resourceEntry = {
          resource: permission.resourceType,
          actions: [],
          allowed: permission.effect === 'permit'
        }
        summary[category].push(resourceEntry)
      }

      resourceEntry.actions.push(permission.action)
    }

    return {
      user: userId,
      summary: Object.entries(summary).map(([category, permissions]) => ({
        category,
        permissions
      }))
    }
  }
}

/**
 * Permission caching utilities
 */
export class PermissionCache {
  private static cache = new Map<string, { result: any; timestamp: number; ttl: number }>()
  private static defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Set cache entry
   */
  static set(key: string, value: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      result: value,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Get cache entry
   */
  static get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.result
  }

  /**
   * Clear cache
   */
  static clear(): void {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  static cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}

// Start periodic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    PermissionCache.cleanup()
  }, 60000) // Cleanup every minute
}

// Export all utilities
export {
  PermissionValidator as Validator,
  PermissionFormatter as Formatter,
  PermissionAnalyzer as Analyzer,
  PermissionCache as Cache
}