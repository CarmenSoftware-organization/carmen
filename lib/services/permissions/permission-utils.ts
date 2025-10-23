/**
 * Permission Utilities
 * Helper functions for permission management and validation
 */

import {
  Policy,
  Rule,
  SubjectAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  EffectType,
  PolicyResult
} from '@/lib/types/permissions'
import { User, Role } from '@/lib/types/user'
import { permissionService } from './permission-service'

// Helper interface for permission analysis
interface PermissionSummary {
  resourceType: string
  action: string
  effect: EffectType
}

// Interface for effective permissions with required fields
interface EffectivePermission {
  resourceType: string
  action: string
  effect: EffectType
  allowed: boolean
  reason: string
  evaluationTime?: number
}

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
    if (policy.effectiveFrom && policy.effectiveTo) {
      if (policy.effectiveFrom >= policy.effectiveTo) {
        errors.push('Effective from date must be before effective to date')
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
  static validateRule(rule: Rule): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!rule.id || rule.id.trim() === '') {
      errors.push('Rule ID is required')
    }

    if (!rule.description || rule.description.trim() === '') {
      errors.push('Rule description is required')
    }

    if (!rule.condition) {
      errors.push('Rule condition is required')
    }

    // Validate condition structure
    if (rule.condition) {
      try {
        this.validateConditionStructure(rule.condition)
      } catch (error) {
        errors.push(`Invalid condition structure: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate condition structure (Expression type)
   */
  static validateConditionStructure(expression: any): void {
    if (!expression || typeof expression !== 'object') {
      throw new Error('Condition must be an object')
    }

    if (!expression.type || !['simple', 'composite'].includes(expression.type)) {
      throw new Error('Condition type must be either "simple" or "composite"')
    }

    if (expression.type === 'simple') {
      if (!expression.attribute || typeof expression.attribute !== 'string') {
        throw new Error('Simple condition must have an attribute')
      }
      if (!expression.operator) {
        throw new Error('Simple condition must have an operator')
      }
      if (expression.value === undefined) {
        throw new Error('Simple condition must have a value')
      }
    }

    if (expression.type === 'composite') {
      if (!Array.isArray(expression.expressions) || expression.expressions.length === 0) {
        throw new Error('Composite condition must have at least one expression')
      }
      if (!expression.logicalOperator || !['AND', 'OR', 'NOT'].includes(expression.logicalOperator)) {
        throw new Error('Composite condition must have a valid logical operator (AND, OR, NOT)')
      }
      // Recursively validate nested expressions
      for (const expr of expression.expressions) {
        this.validateConditionStructure(expr)
      }
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
   * Format condition for display (Expression type)
   */
  static formatCondition(expression: any): string {
    if (!expression || typeof expression !== 'object') {
      return 'Invalid condition'
    }

    if (expression.type === 'simple') {
      const { attribute, operator, value } = expression
      const operatorMap: Record<string, string> = {
        '==': 'equals',
        '!=': 'does not equal',
        '>': 'is greater than',
        '<': 'is less than',
        '>=': 'is at least',
        '<=': 'is at most',
        'in': 'is in',
        'not_in': 'is not in',
        'contains': 'contains',
        'not_contains': 'does not contain',
        'matches': 'matches',
        'exists': 'exists',
        'not_exists': 'does not exist',
        'starts_with': 'starts with',
        'ends_with': 'ends with'
      }

      const operatorText = operatorMap[operator] || operator
      const valueText = Array.isArray(value) ? value.join(', ') : String(value)

      return `${attribute} ${operatorText} ${valueText}`
    }

    if (expression.type === 'composite') {
      const { expressions, logicalOperator } = expression
      const operatorText = logicalOperator === 'AND' ? ' and ' : logicalOperator === 'OR' ? ' or ' : ' not '

      if (logicalOperator === 'NOT' && expressions.length > 0) {
        return `not (${this.formatCondition(expressions[0])})`
      }

      return expressions.map((expr: any) => this.formatCondition(expr)).join(operatorText)
    }

    return 'Unknown condition type'
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
        const permitPolicies = policiesForKey.filter(p => p.effect === 'permit')
        const denyPolicies = policiesForKey.filter(p => p.effect === 'deny')

        if (permitPolicies.length > 0 && denyPolicies.length > 0) {
          for (const permitPolicy of permitPolicies) {
            for (const denyPolicy of denyPolicies) {
              conflicts.push({
                policy1: permitPolicy.id,
                policy2: denyPolicy.id,
                conflictType: 'permission' as const,
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
    const resources = policy.target?.resources?.map(r => r.value).join(',') || 'any'
    const actions = policy.target?.actions?.join(',') || 'any'
    return `${resources}-${actions}`
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
    // Note: getEffectivePermissions returns PermissionResult[] which doesn't have resourceType/action/effect
    // This method needs to be refactored to work with the actual return type or the service needs updating
    // For now, we'll return empty data structure as a placeholder
    const coverageByCategory: Record<string, { allowed: number; total: number }> = {}

    return {
      totalPermissions: 0,
      allowedPermissions: 0,
      deniedPermissions: 0,
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
    // Note: getEffectivePermissions returns PermissionResult[] which doesn't have resourceType/action/effect
    // This method needs to be refactored to work with the actual return type or the service needs updating
    // For now, we'll return empty summary structure as a placeholder
    return {
      user: userId,
      summary: []
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