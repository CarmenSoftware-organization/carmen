/**
 * Hooks Index - Central export for all custom React hooks
 */

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
  
  // Price Management  
  usePricePermission,
  usePricePermissions,
  usePriceUIPermissions,
  useVendorPermissions,
}