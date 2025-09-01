/**
 * Hooks Index - Central export for all custom React hooks
 */

// API Hooks - React Query hooks for data fetching and mutations
export * from './api'

// Permission Management Hooks
export {
  usePermission,
  useBulkPermissions,
  useUserPermissions,
  useUserResourcePermissions,
  usePermissionValidation,
  usePermissionCache,
  useHasPermission,
  usePermissionLogic,
  useResourcePermissions,
  useFormPermissionGuard,
  usePermissionStats,
  permissionKeys,
  type PermissionCheckOptions,
  type BulkPermissionOptions,
  type PermissionValidationRule
} from './use-permissions'

// Enhanced ABAC Permission Hooks
export {
  useEnhancedPermission,
  useUserAttributes,
  useEnhancedBulkPermissions,
  usePermissionMonitoring,
  useConditionalPermissions,
  usePermissionFeatureFlags,
  useAdvancedPermissionValidation,
  usePermissionAnalytics,
  usePermissionSafeWrapper,
  useHasEnhancedPermission,
  useEnhancedResourcePermissions,
  enhancedPermissionKeys,
  type EnhancedPermissionCheckOptions,
  type AttributeResolutionOptions
} from './use-enhanced-permissions'

// Price Management Permission Hooks
export {
  usePermission as usePricePermission,
  usePermissions as usePricePermissions,
  useUIPermissions as usePriceUIPermissions,
  usePermissionFilter as usePricePermissionFilter,
  usePriceOverridePermission,
  useAuditLogPermission,
  useBusinessRulesPermission,
  useExportPermissions,
  useVendorPermissions,
  usePriceAssignmentPermissions,
  useAnalyticsPermissions,
  useUserContext,
  usePriceManagementPermissions
} from './use-price-management-permissions'

// Default exports
export default {
  // Permission Management
  usePermission,
  useBulkPermissions,
  useUserPermissions,
  usePermissionCache,
  useHasPermission,
  useResourcePermissions,
  
  // Enhanced ABAC Permissions
  useEnhancedPermission,
  useUserAttributes,
  useEnhancedBulkPermissions,
  useHasEnhancedPermission,
  useEnhancedResourcePermissions,
  usePermissionAnalytics,
  
  // Price Management  
  usePricePermission,
  usePricePermissions,
  usePriceUIPermissions,
  useVendorPermissions,
}