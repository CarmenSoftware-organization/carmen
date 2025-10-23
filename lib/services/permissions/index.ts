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
export { 
  AttributeResolver, 
  attributeResolver,
  resolveSubjectAttributes,
  resolveResourceAttributes,
  resolveActionAttributes,
  resolveEnvironmentAttributes,
  resolveAllAttributes,
  type AttributeRequest,
  type AttributeResult,
  type AttributeResolverConfig
} from './attribute-resolver'
export { 
  EnhancedPermissionService, 
  enhancedPermissionService,
  checkEnhancedPermission,
  hasEnhancedPermission,
  getEnhancedUserPermissions,
  type EnhancedPermissionCheckRequest,
  type EnhancedPermissionResult
} from './enhanced-permission-service'

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
  PolicyResult,
  EffectType,
  AccessDecision,
  SubjectAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  AccessRequest
} from '@/lib/types/permissions'