// Permission and Role Management Utilities
// Simple role-based access control for staff pricelist operations

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: Permission[]
  department?: string
  isActive: boolean
}

export type UserRole = 
  | 'admin'
  | 'purchasing_manager'
  | 'purchasing_staff'
  | 'vendor_manager'
  | 'finance_staff'
  | 'viewer'

export type Permission = 
  | 'pricelist_create'
  | 'pricelist_edit'
  | 'pricelist_approve'
  | 'pricelist_delete'
  | 'vendor_manage'
  | 'campaign_manage'
  | 'template_manage'
  | 'system_admin'

// Role-based permission mappings
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'pricelist_create',
    'pricelist_edit', 
    'pricelist_approve',
    'pricelist_delete',
    'vendor_manage',
    'campaign_manage',
    'template_manage',
    'system_admin'
  ],
  purchasing_manager: [
    'pricelist_create',
    'pricelist_edit',
    'pricelist_approve',
    'vendor_manage',
    'campaign_manage',
    'template_manage'
  ],
  purchasing_staff: [
    'pricelist_create',
    'pricelist_edit',
    'vendor_manage'
  ],
  vendor_manager: [
    'pricelist_edit',
    'vendor_manage',
    'campaign_manage'
  ],
  finance_staff: [
    'pricelist_approve'
  ],
  viewer: []
}

// Mock current user - in real app this would come from authentication
export const getCurrentUser = (): User => {
  // This would typically come from your authentication system
  return {
    id: 'user-001',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'purchasing_staff',
    permissions: ROLE_PERMISSIONS.purchasing_staff,
    department: 'Procurement',
    isActive: true
  }
}

// Check if user has specific permission
export const hasPermission = (user: User, permission: Permission): boolean => {
  return user.isActive && user.permissions.includes(permission)
}

// Check if user can perform staff pricelist operations
export const canEditPricelists = (user: User): boolean => {
  return hasPermission(user, 'pricelist_edit')
}

export const canCreatePricelists = (user: User): boolean => {
  return hasPermission(user, 'pricelist_create')
}

export const canApprovePricelists = (user: User): boolean => {
  return hasPermission(user, 'pricelist_approve')
}

export const canManageVendors = (user: User): boolean => {
  return hasPermission(user, 'vendor_manage')
}

// Check if user can perform staff operations on behalf of vendors
export const canPerformStaffOperations = (user: User): boolean => {
  return canEditPricelists(user) || canCreatePricelists(user)
}

// Get user role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    purchasing_manager: 'Purchasing Manager',
    purchasing_staff: 'Purchasing Staff',
    vendor_manager: 'Vendor Manager', 
    finance_staff: 'Finance Staff',
    viewer: 'Viewer'
  }
  return roleNames[role]
}

// Get available actions for user
export const getAvailableActions = (user: User) => {
  return {
    canCreate: canCreatePricelists(user),
    canEdit: canEditPricelists(user),
    canApprove: canApprovePricelists(user),
    canManageVendors: canManageVendors(user),
    canPerformStaffOps: canPerformStaffOperations(user)
  }
}

// Audit log entry for staff actions
export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  action: 'create' | 'edit' | 'approve' | 'reject' | 'delete'
  resourceType: 'pricelist' | 'vendor' | 'campaign' | 'template'
  resourceId: string
  changes?: Record<string, { from: any; to: any }>
  reason?: string
  timestamp: Date
  ipAddress?: string
}

// Create audit log entry for staff actions
export const createAuditLog = (
  user: User,
  action: AuditLogEntry['action'],
  resourceType: AuditLogEntry['resourceType'],
  resourceId: string,
  changes?: Record<string, { from: any; to: any }>,
  reason?: string
): AuditLogEntry => {
  return {
    id: `audit-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    action,
    resourceType,
    resourceId,
    changes,
    reason,
    timestamp: new Date(),
    ipAddress: '192.168.1.1' // Would be actual IP in real app
  }
}

// Permission validation middleware
export const requirePermission = (permission: Permission) => {
  return (user: User) => {
    if (!hasPermission(user, permission)) {
      throw new Error(`Access denied. Required permission: ${permission}`)
    }
    return true
  }
}

// Role validation middleware  
export const requireRole = (roles: UserRole[]) => {
  return (user: User) => {
    if (!roles.includes(user.role)) {
      throw new Error(`Access denied. Required role: ${roles.join(' or ')}`)
    }
    return true
  }
}

export default {
  getCurrentUser,
  hasPermission,
  canEditPricelists,
  canCreatePricelists,
  canApprovePricelists,
  canManageVendors,
  canPerformStaffOperations,
  getRoleDisplayName,
  getAvailableActions,
  createAuditLog,
  requirePermission,
  requireRole
}