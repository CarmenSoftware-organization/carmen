/**
 * Role-Based Access Control (RBAC) Policies
 * Simplified approach replacing complex ABAC with direct role-to-permission mappings
 */

import { Policy, EffectType, Operator } from '@/lib/types/permissions'

// Role-based permission definitions
export interface RolePermissions {
  roleId: string
  roleName: string
  permissions: string[]
  restrictions?: {
    departments?: string[]
    locations?: string[]
    timeConstraints?: {
      businessHoursOnly?: boolean
      shifts?: string[]
    }
    approvalLimits?: {
      maxAmount?: number
      requiresSecondApproval?: boolean
    }
  }
}

// Simplified role definitions
export const rolePermissionMappings: RolePermissions[] = [
  {
    roleId: 'kitchen-manager',
    roleName: 'Kitchen Manager',
    permissions: [
      'view_inventory',
      'create_purchase_requests',
      'edit_purchase_requests',
      'manage_recipes',
      'view_kitchen_reports',
      'manage_kitchen_staff',
      'approve_kitchen_orders',
      'adjust_inventory_kitchen'
    ],
    restrictions: {
      departments: ['kitchen', 'inventory'],
      approvalLimits: {
        maxAmount: 5000,
        requiresSecondApproval: false
      }
    }
  },
  {
    roleId: 'finance-manager',
    roleName: 'Finance Manager',
    permissions: [
      'view_all_financial_data',
      'approve_purchase_orders',
      'generate_financial_reports',
      'manage_budgets',
      'approve_vendor_payments',
      'view_all_departments',
      'manage_approval_workflows'
    ],
    restrictions: {
      approvalLimits: {
        maxAmount: 25000,
        requiresSecondApproval: true // Above 12500
      }
    }
  },
  {
    roleId: 'store-manager',
    roleName: 'Store Manager',
    permissions: [
      'manage_store_inventory',
      'create_store_requisitions',
      'view_store_reports',
      'manage_store_staff',
      'process_waste_adjustments',
      'approve_store_transfers',
      'manage_pos_operations'
    ],
    restrictions: {
      departments: ['store-operations', 'inventory'],
      locations: ['assigned-store-only'],
      approvalLimits: {
        maxAmount: 2000,
        requiresSecondApproval: false
      }
    }
  },
  {
    roleId: 'inventory-coordinator',
    roleName: 'Inventory Coordinator',
    permissions: [
      'view_all_inventory',
      'adjust_inventory_levels',
      'conduct_stock_counts',
      'create_inventory_reports',
      'manage_reorder_points',
      'receive_goods',
      'transfer_stock'
    ],
    restrictions: {
      departments: ['inventory', 'procurement'],
      approvalLimits: {
        maxAmount: 1000,
        requiresSecondApproval: false
      }
    }
  },
  {
    roleId: 'procurement-staff',
    roleName: 'Procurement Staff',
    permissions: [
      'create_purchase_requests',
      'edit_purchase_requests',
      'view_vendor_information',
      'manage_vendor_communications',
      'receive_quotations',
      'track_deliveries'
    ],
    restrictions: {
      departments: ['procurement'],
      approvalLimits: {
        maxAmount: 3000,
        requiresSecondApproval: false
      }
    }
  },
  {
    roleId: 'general-staff',
    roleName: 'General Staff',
    permissions: [
      'view_own_department_data',
      'create_basic_requests',
      'view_assigned_tasks',
      'update_work_status'
    ],
    restrictions: {
      departments: ['assigned-department-only'],
      locations: ['assigned-location-only'],
      timeConstraints: {
        businessHoursOnly: true
      },
      approvalLimits: {
        maxAmount: 500,
        requiresSecondApproval: true
      }
    }
  }
]

// Convert role mappings to Policy format for backwards compatibility
export const roleBasedPolicies: Policy[] = rolePermissionMappings.map(role => ({
  id: `rbac-${role.roleId}`,
  name: `${role.roleName} Access Policy`,
  description: `Role-based access control for ${role.roleName}`,
  effect: EffectType.PERMIT,
  priority: 100, // All role-based policies have same priority
  enabled: true,
  version: '1.0.0',
  createdBy: 'system',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  
  target: {
      subjects: [{
          attribute: 'user.role',
          operator: Operator.EQUALS,
          value: role.roleId
      }],
      actions: role.permissions,
  },
  rules: [], // No complex rules for simple RBAC
  
  // Metadata for role-based policies
  metadata: {
    policyType: 'role-based',
    roleId: role.roleId,
    roleName: role.roleName,
    permissionCount: role.permissions.length,
    hasRestrictions: !!role.restrictions,
    template: 'rbac-standard'
  }
}))

// Simple role-based policy templates for the simplified creator
export const roleBasedTemplates = [
  {
    id: 'department-role',
    title: 'Department Role Access',
    description: 'Grant a role access to specific department operations',
    icon: 'Building',
    category: 'Department Access',
    complexity: 'simple',
    estimatedTime: '2-3 minutes',
    defaultConfig: {
      roleId: '',
      roleName: '',
      departments: [],
      permissions: ['view_data', 'create_items'],
      approvalLimit: 1000
    }
  },
  {
    id: 'financial-approver',
    title: 'Financial Approver Role',
    description: 'Set up financial approval limits for a role',
    icon: 'DollarSign',
    category: 'Financial Control',
    complexity: 'simple',
    estimatedTime: '3-4 minutes',
    defaultConfig: {
      roleId: '',
      roleName: '',
      maxApprovalAmount: 5000,
      requiresSecondApproval: false,
      transactionTypes: ['purchase-orders', 'vendor-payments']
    }
  },
  {
    id: 'store-role',
    title: 'Store Operations Role',
    description: 'Configure role access for store operations',
    icon: 'MapPin',
    category: 'Store Access',
    complexity: 'simple',
    estimatedTime: '2-3 minutes',
    defaultConfig: {
      roleId: '',
      roleName: '',
      storeLocations: [],
      operations: ['manage_inventory', 'process_sales', 'generate_reports'],
      restrictToAssignedLocation: true
    }
  },
  {
    id: 'inventory-role',
    title: 'Inventory Management Role',
    description: 'Set up inventory management permissions for a role',
    icon: 'Package',
    category: 'Inventory Control',
    complexity: 'simple',
    estimatedTime: '2-3 minutes',
    defaultConfig: {
      roleId: '',
      roleName: '',
      inventoryOperations: ['view_stock', 'adjust_levels', 'receive_goods'],
      stockCategories: ['all'],
      adjustmentLimit: 500
    }
  },
  {
    id: 'vendor-role',
    title: 'Vendor Management Role',
    description: 'Configure vendor relationship management permissions',
    icon: 'Users',
    category: 'Vendor Relations',
    complexity: 'simple',
    estimatedTime: '2-4 minutes',
    defaultConfig: {
      roleId: '',
      roleName: '',
      vendorOperations: ['view_profiles', 'manage_communications'],
      vendorTypes: ['all'],
      canApproveVendors: false
    }
  },
  {
    id: 'shift-role',
    title: 'Shift-Based Role Access',
    description: 'Set up role permissions active during specific shifts',
    icon: 'Clock',
    category: 'Time-Based Control',
    complexity: 'simple',
    estimatedTime: '3-5 minutes',
    defaultConfig: {
      roleId: '',
      roleName: '',
      activeShifts: ['morning', 'afternoon'],
      shiftPermissions: ['manage_operations', 'handle_emergencies'],
      allowOverrides: true
    }
  }
]

// Helper function to get permissions for a role
export function getRolePermissions(roleId: string): string[] {
  const role = rolePermissionMappings.find(r => r.roleId === roleId)
  return role ? role.permissions : []
}

// Helper function to check if role has permission
export function roleHasPermission(roleId: string, permission: string): boolean {
  const permissions = getRolePermissions(roleId)
  return permissions.includes(permission)
}

// Helper function to get role restrictions
export function getRoleRestrictions(roleId: string) {
  const role = rolePermissionMappings.find(r => r.roleId === roleId)
  return role?.restrictions || {}
}

// Helper function to get approval limit for role
export function getRoleApprovalLimit(roleId: string): number {
  const restrictions = getRoleRestrictions(roleId)
  return restrictions.approvalLimits?.maxAmount || 0
}

export default roleBasedPolicies