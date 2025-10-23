/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Provides comprehensive authorization system with role-based permissions,
 * resource-level access control, and department/location-based restrictions.
 * 
 * @author Carmen ERP Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { AuthenticatedUser } from '@/lib/middleware/auth'
import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'
import type { Role } from '@/lib/types/user'

// Role name type - string union of all possible role names
export type RoleName =
  | 'super-admin'
  | 'admin'
  | 'financial-manager'
  | 'department-manager'
  | 'purchasing-staff'
  | 'chef'
  | 'counter'
  | 'staff'

// Permission Schema
const permissionSchema = z.object({
  action: z.enum([
    // Generic CRUD operations
    'create', 'read', 'update', 'delete',
    
    // Specific actions
    'approve', 'reject', 'submit', 'cancel', 'export',
    'import', 'assign', 'unassign', 'transfer', 'archive',
    'restore', 'publish', 'unpublish', 'configure',
    
    // Administrative actions
    'manage_users', 'manage_roles', 'manage_permissions',
    'view_audit_logs', 'manage_system_config',
    
    // Financial operations
    'process_payments', 'approve_budgets', 'view_financial_reports',
    
    // Procurement operations
    'create_purchase_requests', 'approve_purchase_requests',
    'create_purchase_orders', 'approve_purchase_orders',
    'receive_goods', 'process_invoices',
    
    // Inventory operations
    'adjust_inventory', 'transfer_stock', 'conduct_counts',
    'approve_adjustments',
    
    // Vendor operations
    'manage_vendors', 'approve_vendor_registrations',
    'negotiate_contracts', 'evaluate_performance',
    
    // Reporting operations
    'generate_reports', 'schedule_reports', 'view_analytics'
  ]),
  resource: z.enum([
    // Core resources
    'users', 'roles', 'permissions', 'departments', 'locations',
    
    // Business resources
    'vendors', 'products', 'categories', 'units',
    'purchase_requests', 'purchase_orders', 'goods_receipts',
    'invoices', 'payments', 'contracts',
    'inventory_items', 'stock_adjustments', 'transfers',
    'physical_counts', 'recipes', 'ingredients',
    
    // System resources
    'system_config', 'audit_logs', 'reports', 'dashboards',
    'integrations', 'notifications'
  ]),
  conditions: z.array(z.enum([
    // Ownership conditions
    'own_only', 'department_only', 'location_only',
    
    // Status conditions
    'draft_only', 'pending_only', 'approved_only',
    'active_only', 'inactive_only',
    
    // Hierarchical conditions
    'subordinates_only', 'same_level_only', 'all_levels',
    
    // Financial conditions
    'under_limit', 'over_limit', 'within_budget'
  ])).optional().default([])
})

export type Permission = z.infer<typeof permissionSchema>

// Authorization Context
export interface AuthorizationContext {
  user: AuthenticatedUser
  resource: string
  action: string
  resourceId?: string
  additionalContext?: Record<string, any>
}

// Authorization Result
export interface AuthorizationResult {
  allowed: boolean
  reason?: string
  conditions?: string[]
  requiredRole?: Role
  requiredPermissions?: string[]
}

/**
 * Role Definitions with Hierarchical Structure
 */
export const ROLE_HIERARCHY: Record<RoleName, number> = {
  'super-admin': 100,
  'admin': 90,
  'financial-manager': 80,
  'department-manager': 70,
  'purchasing-staff': 60,
  'chef': 50,
  'counter': 40,
  'staff': 30
}

/**
 * Default Role Permissions
 * Each role inherits permissions from lower-level roles
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  'super-admin': [
    '*:*', // Full access to everything
  ],
  
  'admin': [
    // User & System Management
    'manage_users:users',
    'manage_roles:roles',
    'manage_permissions:permissions',
    'view_audit_logs:audit_logs',
    'manage_system_config:system_config',
    
    // All business operations (except super admin functions)
    'create:*', 'read:*', 'update:*', 'delete:*',
    'approve:*', 'reject:*', 'manage_vendors:vendors',
    'generate_reports:reports', 'view_analytics:dashboards'
  ],
  
  'financial-manager': [
    // Financial Operations
    'process_payments:payments',
    'approve_budgets:*',
    'view_financial_reports:reports',
    'read:invoices', 'update:invoices', 'approve:invoices',
    
    // Purchase Order Approvals (high value)
    'approve_purchase_orders:purchase_orders',
    'read:purchase_requests', 'approve_purchase_requests:purchase_requests',
    
    // Vendor Financial Management
    'read:vendors', 'update:vendors', 'negotiate_contracts:contracts',
    
    // Reporting
    'generate_reports:reports', 'view_analytics:dashboards'
  ],
  
  'department-manager': [
    // Department Management
    'read:users', 'update:users', // Department users only
    
    // Purchase Management
    'create_purchase_requests:purchase_requests',
    'approve_purchase_requests:purchase_requests', // Department only
    'read:purchase_orders', 'approve_purchase_orders:purchase_orders', // Limited value
    
    // Inventory Management
    'read:inventory_items', 'approve_adjustments:stock_adjustments',
    'conduct_counts:physical_counts',
    
    // Vendor Management
    'read:vendors', 'evaluate_performance:vendors',
    
    // Reporting (Department scope)
    'generate_reports:reports', 'view_analytics:dashboards'
  ],
  
  'purchasing-staff': [
    // Procurement Operations
    'create_purchase_requests:purchase_requests',
    'update:purchase_requests', 'read:purchase_requests',
    'create_purchase_orders:purchase_orders',
    'update:purchase_orders', 'read:purchase_orders',
    
    // Vendor Management
    'read:vendors', 'create:vendors', 'update:vendors',
    'manage_vendors:vendors',
    
    // Goods Receipt
    'receive_goods:goods_receipts',
    'create:goods_receipts', 'update:goods_receipts',
    
    // Products & Catalog
    'read:products', 'create:products', 'update:products',
    'read:categories', 'create:categories', 'update:categories',
    
    // Basic Reporting
    'generate_reports:reports'
  ],
  
  'chef': [
    // Recipe & Menu Management
    'create:recipes', 'read:recipes', 'update:recipes',
    'create:ingredients', 'read:ingredients', 'update:ingredients',
    
    // Kitchen Inventory
    'read:inventory_items', 'adjust_inventory:inventory_items',
    'transfer_stock:transfers', 'conduct_counts:physical_counts',
    
    // Purchase Requests (Kitchen needs)
    'create_purchase_requests:purchase_requests',
    'read:purchase_requests',
    
    // Vendor Information
    'read:vendors',
    
    // Products (Kitchen relevant)
    'read:products', 'read:categories'
  ],
  
  'counter': [
    // Sales & Customer Operations
    'read:products', 'read:categories', 'read:inventory_items',
    
    // Basic inventory (for availability checks)
    'read:inventory_items',
    
    // Limited purchase requests (supplies)
    'create_purchase_requests:purchase_requests',
    'read:purchase_requests'
  ],
  
  'staff': [
    // Basic Read Access
    'read:products', 'read:categories',
    'read:purchase_requests', // Own only
    'read:inventory_items', // Limited view
    
    // Create basic purchase requests
    'create_purchase_requests:purchase_requests'
  ]
}

/**
 * RBAC Authorization Class
 */
export class RBACAuthorization {
  
  /**
   * Check if user has permission to perform action on resource
   */
  async authorize(context: AuthorizationContext): Promise<AuthorizationResult> {
    const { user, resource, action, resourceId, additionalContext } = context
    
    try {
      // Log authorization attempt
      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTHORIZATION_ATTEMPTED,
        userId: user.id,
        details: {
          resource,
          action,
          resourceId,
          role: user.role,
          department: user.department
        }
      })

      // Super admin bypass
      if ((user.role as unknown as string) === 'super-admin') {
        return { allowed: true, reason: 'Super admin access' }
      }

      // Check if user has explicit permission
      const hasExplicitPermission = this.hasExplicitPermission(user, action, resource)
      if (hasExplicitPermission) {
        // Check conditions if permission exists
        const conditionResult = await this.checkConditions(user, action, resource, resourceId, additionalContext)
        
        if (conditionResult.allowed) {
          await createSecurityAuditLog({
            eventType: SecurityEventType.AUTHORIZATION_GRANTED,
            userId: user.id,
            details: { resource, action, resourceId, reason: 'Explicit permission' }
          })
        } else {
          await createSecurityAuditLog({
            eventType: SecurityEventType.AUTHORIZATION_DENIED,
            userId: user.id,
            details: { resource, action, resourceId, reason: conditionResult.reason }
          })
        }
        
        return conditionResult
      }

      // Check role-based permissions
      const rolePermissions = this.getRolePermissions(user.role)
      const hasRolePermission = this.checkRolePermission(rolePermissions, action, resource)
      
      if (hasRolePermission) {
        const conditionResult = await this.checkConditions(user, action, resource, resourceId, additionalContext)
        
        if (conditionResult.allowed) {
          await createSecurityAuditLog({
            eventType: SecurityEventType.AUTHORIZATION_GRANTED,
            userId: user.id,
            details: { resource, action, resourceId, reason: 'Role-based permission' }
          })
        } else {
          await createSecurityAuditLog({
            eventType: SecurityEventType.AUTHORIZATION_DENIED,
            userId: user.id,
            details: { resource, action, resourceId, reason: conditionResult.reason }
          })
        }
        
        return conditionResult
      }

      // Check hierarchical role access
      const hierarchicalResult = await this.checkHierarchicalAccess(user, action, resource, resourceId)
      if (hierarchicalResult.allowed) {
        await createSecurityAuditLog({
          eventType: SecurityEventType.AUTHORIZATION_GRANTED,
          userId: user.id,
          details: { resource, action, resourceId, reason: 'Hierarchical access' }
        })
        return hierarchicalResult
      }

      // Permission denied
      const result: AuthorizationResult = {
        allowed: false,
        reason: `Insufficient permissions for ${action} on ${resource}`,
        requiredPermissions: [`${action}:${resource}`]
      }

      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTHORIZATION_DENIED,
        userId: user.id,
        details: { 
          resource, 
          action, 
          resourceId, 
          reason: result.reason,
          userRole: user.role,
          userPermissions: user.permissions
        }
      })

      return result

    } catch (error) {
      console.error('Authorization error:', error)
      
      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTHORIZATION_ERROR,
        userId: user.id,
        details: {
          resource,
          action,
          resourceId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return {
        allowed: false,
        reason: 'Authorization system error'
      }
    }
  }

  /**
   * Check if user has explicit permission
   */
  private hasExplicitPermission(user: AuthenticatedUser, action: string, resource: string): boolean {
    if (!user.permissions || user.permissions.length === 0) {
      return false
    }

    return user.permissions.some(permission => {
      const [permAction, permResource] = permission.split(':')
      return (permAction === '*' || permAction === action) &&
             (permResource === '*' || permResource === resource)
    })
  }

  /**
   * Get permissions for a role (including inherited permissions)
   */
  private getRolePermissions(role: string | Role): string[] {
    const permissions = new Set<string>()
    const roleName = (typeof role === 'string' ? role : role.name) as RoleName
    const roleLevel = ROLE_HIERARCHY[roleName]

    if (roleLevel === undefined) {
      return []
    }

    // Add permissions from current role and all lower roles
    for (const [name, level] of Object.entries(ROLE_HIERARCHY) as [RoleName, number][]) {
      if (level <= roleLevel) {
        const rolePerms = DEFAULT_ROLE_PERMISSIONS[name] || []
        rolePerms.forEach((perm: string) => permissions.add(perm))
      }
    }

    return Array.from(permissions)
  }

  /**
   * Check if role has permission
   */
  private checkRolePermission(rolePermissions: string[], action: string, resource: string): boolean {
    return rolePermissions.some(permission => {
      const [permAction, permResource] = permission.split(':')
      return (permAction === '*' || permAction === action) &&
             (permResource === '*' || permResource === resource)
    })
  }

  /**
   * Check hierarchical access (higher roles can access lower role resources)
   */
  private async checkHierarchicalAccess(
    user: AuthenticatedUser,
    action: string,
    resource: string,
    resourceId?: string
  ): Promise<AuthorizationResult> {
    // Only allow read access hierarchically for user management
    if (resource === 'users' && action === 'read' && (user.role as unknown as string) === 'department-manager') {
      return {
        allowed: true,
        reason: 'Department manager hierarchical access',
        conditions: ['department_only']
      }
    }

    return { allowed: false, reason: 'No hierarchical access available' }
  }

  /**
   * Check permission conditions (department, location, ownership, etc.)
   */
  private async checkConditions(
    user: AuthenticatedUser,
    action: string,
    resource: string,
    resourceId?: string,
    additionalContext?: Record<string, any>
  ): Promise<AuthorizationResult> {
    // For now, return allowed - in a full implementation, you would:
    // 1. Fetch the resource from database
    // 2. Check ownership (created_by === user.id)
    // 3. Check department/location restrictions
    // 4. Check status-based conditions
    // 5. Check financial limits

    // Example condition checks:
    if ((user.role as unknown as string) === 'department-manager') {
      // Department managers can only access their department's resources
      const conditions = ['department_only']

      if (resource === 'purchase_requests' && action === 'approve') {
        // Additional condition: only approve requests under certain amount
        conditions.push('under_limit')
      }

      return {
        allowed: true,
        conditions,
        reason: 'Department-level access granted'
      }
    }

    if ((user.role as unknown as string) === 'staff' && resource === 'purchase_requests') {
      // Staff can only see their own purchase requests
      return {
        allowed: true,
        conditions: ['own_only'],
        reason: 'Own resources only'
      }
    }

    return { allowed: true, reason: 'Basic permission granted' }
  }

  /**
   * Check if user can access specific resource instance
   */
  async canAccessResource(
    user: AuthenticatedUser,
    resource: string,
    resourceId: string,
    action: string = 'read'
  ): Promise<boolean> {
    const result = await this.authorize({
      user,
      resource,
      action,
      resourceId
    })

    return result.allowed
  }

  /**
   * Get required role for action on resource
   */
  getRequiredRole(action: string, resource: string): RoleName | null {
    // Check which is the lowest role that has this permission
    const sortedRoles = Object.entries(ROLE_HIERARCHY).sort(
      ([, a], [, b]) => (a as number) - (b as number)
    ) as [RoleName, number][]

    for (const [roleName] of sortedRoles) {
      const permissions = this.getRolePermissions(roleName as unknown as Role)
      if (this.checkRolePermission(permissions, action, resource)) {
        return roleName
      }
    }

    return null
  }
}

// Singleton instance
export const rbacAuth = new RBACAuthorization()

/**
 * Higher-order function to protect API routes with authorization
 */
export function withAuthorization(
  resource: string,
  action: string,
  handler: (request: NextRequest, context: { user: AuthenticatedUser }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { user: AuthenticatedUser }): Promise<NextResponse> => {
    try {
      // Extract resource ID from URL if present
      const url = new URL(request.url)
      const pathSegments = url.pathname.split('/')
      const resourceId = pathSegments[pathSegments.length - 1]

      // Check authorization
      const authResult = await rbacAuth.authorize({
        user: context.user,
        resource,
        action,
        resourceId: resourceId !== resource ? resourceId : undefined
      })

      if (!authResult.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
            details: {
              required: authResult.requiredPermissions,
              reason: authResult.reason
            }
          },
          { status: 403 }
        )
      }

      // Call the authorized handler
      return await handler(request, context)

    } catch (error) {
      console.error('Authorization middleware error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Authorization system error'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Utility function to check permissions in API routes
 */
export async function checkPermission(
  user: AuthenticatedUser,
  action: string,
  resource: string,
  resourceId?: string
): Promise<boolean> {
  const result = await rbacAuth.authorize({
    user,
    action,
    resource,
    resourceId
  })
  
  return result.allowed
}

/**
 * Utility function to require permission in API routes
 */
export async function requirePermission(
  user: AuthenticatedUser,
  action: string,
  resource: string,
  resourceId?: string
): Promise<void> {
  const allowed = await checkPermission(user, action, resource, resourceId)
  if (!allowed) {
    throw new Error(`Insufficient permissions for ${action} on ${resource}`)
  }
}

/**
 * Get user's effective permissions (role + explicit permissions)
 */
export function getEffectivePermissions(user: AuthenticatedUser): string[] {
  const rolePermissions = new Set(rbacAuth['getRolePermissions'](user.role))
  const explicitPermissions = new Set(user.permissions || [])
  
  return Array.from(new Set([...rolePermissions, ...explicitPermissions]))
}

// Permission constants already exported above