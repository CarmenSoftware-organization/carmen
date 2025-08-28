/**
 * Permission Services - Main export file
 * Provides unified access to all permission-related services
 */

// Core services
export { PolicyEngine, policyEngine, type PolicyEngineConfig } from './policy-engine'
export { 
  PermissionService, 
  permissionService, 
  checkPermission, 
  hasPermission, 
  getUserPermissions,
  type PermissionCheckRequest,
  type PermissionResult,
  type BulkPermissionRequest,
  type BulkPermissionResult
} from './permission-service'

// Utility services
export {
  PermissionValidator as Validator,
  PermissionFormatter as Formatter,
  PermissionAnalyzer as Analyzer,
  PermissionCache as Cache
} from './permission-utils'

// Re-export types for convenience
export type {
  Policy,
  PolicyRule,
  PolicyEffect,
  PolicyDecision,
  PolicyEvaluationResult,
  Subject,
  Resource,
  Action,
  Environment,
  Permission
} from '@/lib/types/permissions'