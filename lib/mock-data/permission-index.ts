// Centralized export for all mock data
// Permission Management Mock Data

// Core role and permission data
export {
  mockRoles,
  mockDepartments,
  mockLocations,
  mockRoleAssignments,
  getRoleHierarchy,
  getInheritedPermissions,
  getUserRoles,
  getUserDepartments,
  getUserLocations,
  type RoleAssignment
} from './permission-roles';

// Policy and rule data  
export {
  allMockPolicies,
  procurementPolicies,
  inventoryPolicies,
  vendorPolicies,
  policyTemplates,
  searchPolicies,
  getPoliciesByCategory,
  getPoliciesByResource,
  getActivePolicies,
  type PolicyTemplate
} from './permission-policies';

// Role-based access control data
export {
  rolePermissionMappings,
  roleBasedPolicies,
  roleBasedTemplates,
  getRolePermissions,
  roleHasPermission,
  getRoleRestrictions,
  getRoleApprovalLimit,
  type RolePermissions
} from './role-based-policies';

// Subscription and package data
export {
  mockSubscriptionPackages,
  mockUserSubscriptions,
  mockUpgradeRequests,
  createPackageComparison,
  getPackageByType,
  calculateMonthlyPrice,
  calculateYearlyPrice,
  getYearlySavings,
  getActiveSubscriptions,
  getUserSubscription,
  isFeatureAvailable,
  isResourceActivated
} from './permission-subscriptions';

// Re-export types for convenience
export type {
  Policy,
  Rule,
  Expression,
  SubjectAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  AccessRequest,
  AccessDecision,
  PolicyResult,
  EvaluationContext,
  PermissionResult
} from '@/lib/types/permissions';

export type {
  SubscriptionPackage,
  UserSubscription,
  PackageComparison,
  UpgradeRequest,
  ResourceActivation,
  SubscriptionUsage,
  PaymentRecord
} from '@/lib/types/permission-subscriptions';

export type {
  Role,
  Department, 
  Location
} from '@/lib/types/permissions';