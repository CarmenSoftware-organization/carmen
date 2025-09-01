/**
 * Centralized Mock Data - Main Barrel Export File
 * 
 * This file serves as the single source of truth for all mock data
 * used throughout the Carmen ERP application.
 * 
 * Import usage:
 * import { mockUsers, mockVendors, mockProducts } from '@/lib/mock-data'
 */

// Core entity mock data - excluding conflicting exports from users
export { mockUsers } from './users'
export * from './inventory'
export * from './procurement'
export * from './vendors'
export * from './products'
export * from './recipes'
export * from './finance'
export * from './campaigns'
export * from './pricelists'

// Export roles, departments, locations and helper functions from users for compatibility
export { 
  mockRoles,
  mockDepartments,
  mockLocations,
  getMockUserById,
  getMockUsersByRole,
  getMockUsersByDepartment,
  getMockRoleById,
  getMockDepartmentById,
  getMockLocationById,
  getLocationsByDepartment
} from './users'

// Mock data factories
export * from './factories'

// Test scenarios
export * from './test-scenarios'

// Policy builder and ABAC system mock data
export * from './policy-builder-attributes'
export * from './policy-builder-sample-actions'
export * from './policy-builder-templates'
export * from './policy-builder-sample-policies'

// Permission system mock data - explicit exports to avoid conflicts
export {
  // Permission roles and policies
  allMockPolicies,
  roleBasedPolicies,
  roleBasedTemplates,
  rolePermissionMappings,
  getRolePermissions,
  roleHasPermission,
  getRoleRestrictions,
  getRoleApprovalLimit,
  type RolePermissions
} from './permission-index'

// Export additional permission functionality
export {
  mockRoleAssignments,
  getRoleHierarchy,
  getInheritedPermissions,
  getUserRoles,
  getUserDepartments,
  getUserLocations,
  type RoleAssignment
} from './permission-roles'

export * from './permission-policies'
export * from './permission-subscriptions'