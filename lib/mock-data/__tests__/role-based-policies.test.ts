/**
 * Unit tests for Role-Based Access Control (RBAC) policies and helper functions
 */

import { describe, it, expect } from 'vitest'
import {
  rolePermissionMappings,
  roleBasedPolicies,
  roleBasedTemplates,
  getRolePermissions,
  roleHasPermission,
  getRoleRestrictions,
  getRoleApprovalLimit,
  type RolePermissions
} from '../role-based-policies'
import { EffectType } from '@/lib/types/permissions'

describe('Role Permission Mappings', () => {
  it('should have correct number of role mappings', () => {
    expect(rolePermissionMappings).toHaveLength(6)
  })

  it('should contain expected role IDs', () => {
    const roleIds = rolePermissionMappings.map(role => role.roleId)
    expect(roleIds).toEqual([
      'kitchen-manager',
      'finance-manager', 
      'store-manager',
      'inventory-coordinator',
      'procurement-staff',
      'general-staff'
    ])
  })

  it('should have valid role structure for each mapping', () => {
    rolePermissionMappings.forEach(role => {
      expect(role).toHaveProperty('roleId')
      expect(role).toHaveProperty('roleName')
      expect(role).toHaveProperty('permissions')
      expect(role.roleId).toBeTypeOf('string')
      expect(role.roleName).toBeTypeOf('string')
      expect(Array.isArray(role.permissions)).toBe(true)
      expect(role.permissions.length).toBeGreaterThan(0)
    })
  })

  describe('Kitchen Manager Role', () => {
    const kitchenManager = rolePermissionMappings.find(r => r.roleId === 'kitchen-manager')!

    it('should have correct permissions', () => {
      expect(kitchenManager.permissions).toContain('view_inventory')
      expect(kitchenManager.permissions).toContain('create_purchase_requests')
      expect(kitchenManager.permissions).toContain('manage_recipes')
      expect(kitchenManager.permissions).toContain('manage_kitchen_staff')
    })

    it('should have correct restrictions', () => {
      expect(kitchenManager.restrictions?.departments).toEqual(['kitchen', 'inventory'])
      expect(kitchenManager.restrictions?.approvalLimits?.maxAmount).toBe(5000)
      expect(kitchenManager.restrictions?.approvalLimits?.requiresSecondApproval).toBe(false)
    })
  })

  describe('Finance Manager Role', () => {
    const financeManager = rolePermissionMappings.find(r => r.roleId === 'finance-manager')!

    it('should have highest approval limit', () => {
      expect(financeManager.restrictions?.approvalLimits?.maxAmount).toBe(25000)
      expect(financeManager.restrictions?.approvalLimits?.requiresSecondApproval).toBe(true)
    })

    it('should have financial permissions', () => {
      expect(financeManager.permissions).toContain('view_all_financial_data')
      expect(financeManager.permissions).toContain('approve_purchase_orders')
      expect(financeManager.permissions).toContain('manage_budgets')
    })
  })

  describe('General Staff Role', () => {
    const generalStaff = rolePermissionMappings.find(r => r.roleId === 'general-staff')!

    it('should have most restrictions', () => {
      expect(generalStaff.restrictions?.departments).toEqual(['assigned-department-only'])
      expect(generalStaff.restrictions?.locations).toEqual(['assigned-location-only'])
      expect(generalStaff.restrictions?.timeConstraints?.businessHoursOnly).toBe(true)
      expect(generalStaff.restrictions?.approvalLimits?.maxAmount).toBe(500)
      expect(generalStaff.restrictions?.approvalLimits?.requiresSecondApproval).toBe(true)
    })

    it('should have limited permissions', () => {
      expect(generalStaff.permissions).toContain('view_own_department_data')
      expect(generalStaff.permissions).toContain('create_basic_requests')
      expect(generalStaff.permissions.length).toBe(4) // Should have exactly 4 permissions
    })
  })
})

describe('Role-Based Policies', () => {
  it('should convert role mappings to policy format', () => {
    expect(roleBasedPolicies).toHaveLength(rolePermissionMappings.length)
  })

  it('should have correct policy structure', () => {
    roleBasedPolicies.forEach(policy => {
      expect(policy).toHaveProperty('id')
      expect(policy).toHaveProperty('name')
      expect(policy).toHaveProperty('description')
      expect(policy.effect).toBe(EffectType.PERMIT)
      expect(policy.priority).toBe(100)
      expect(policy.enabled).toBe(true)
      expect(policy.rules).toHaveLength(1)
    })
  })

  it('should have correct metadata for role-based policies', () => {
    roleBasedPolicies.forEach(policy => {
      expect(policy.metadata?.policyType).toBe('role-based')
      expect(policy.metadata?.roleId).toBeTypeOf('string')
      expect(policy.metadata?.roleName).toBeTypeOf('string')
      expect(policy.metadata?.permissionCount).toBeTypeOf('number')
      expect(policy.metadata?.hasRestrictions).toBeTypeOf('boolean')
      expect(policy.metadata?.template).toBe('rbac-standard')
    })
  })

  describe('Policy Rule Structure', () => {
    it('should have correct rule conditions', () => {
      roleBasedPolicies.forEach(policy => {
        const rule = policy.rules[0]
        expect(rule.condition.attribute).toBe('user.role')
        expect(rule.condition.operator).toBe('EQUALS')
        expect(rule.condition.value).toBeTypeOf('string')
        expect(rule.target.subject).toEqual([`role:${rule.condition.value}`])
        expect(rule.target.action).toEqual(['access'])
      })
    })
  })
})

describe('Role-Based Templates', () => {
  it('should have correct number of templates', () => {
    expect(roleBasedTemplates).toHaveLength(6)
  })

  it('should have valid template structure', () => {
    roleBasedTemplates.forEach(template => {
      expect(template).toHaveProperty('id')
      expect(template).toHaveProperty('title')
      expect(template).toHaveProperty('description')
      expect(template).toHaveProperty('icon')
      expect(template).toHaveProperty('category')
      expect(template).toHaveProperty('complexity')
      expect(template).toHaveProperty('estimatedTime')
      expect(template).toHaveProperty('defaultConfig')
      expect(template.complexity).toBe('simple')
    })
  })

  describe('Template Categories', () => {
    it('should have expected categories', () => {
      const categories = roleBasedTemplates.map(t => t.category)
      expect(categories).toContain('Department Access')
      expect(categories).toContain('Financial Control')
      expect(categories).toContain('Store Access')
      expect(categories).toContain('Inventory Control')
      expect(categories).toContain('Vendor Relations')
      expect(categories).toContain('Time-Based Control')
    })
  })
})

describe('Helper Functions', () => {
  describe('getRolePermissions', () => {
    it('should return correct permissions for valid role', () => {
      const permissions = getRolePermissions('kitchen-manager')
      expect(permissions).toContain('view_inventory')
      expect(permissions).toContain('manage_recipes')
      expect(permissions.length).toBeGreaterThan(0)
    })

    it('should return empty array for invalid role', () => {
      const permissions = getRolePermissions('invalid-role')
      expect(permissions).toEqual([])
    })
  })

  describe('roleHasPermission', () => {
    it('should return true for valid permission', () => {
      expect(roleHasPermission('kitchen-manager', 'view_inventory')).toBe(true)
      expect(roleHasPermission('finance-manager', 'approve_purchase_orders')).toBe(true)
    })

    it('should return false for invalid permission', () => {
      expect(roleHasPermission('kitchen-manager', 'approve_purchase_orders')).toBe(false)
      expect(roleHasPermission('general-staff', 'manage_budgets')).toBe(false)
    })

    it('should return false for invalid role', () => {
      expect(roleHasPermission('invalid-role', 'any_permission')).toBe(false)
    })
  })

  describe('getRoleRestrictions', () => {
    it('should return restrictions for roles that have them', () => {
      const kitchenRestrictions = getRoleRestrictions('kitchen-manager')
      expect(kitchenRestrictions.departments).toEqual(['kitchen', 'inventory'])
      expect(kitchenRestrictions.approvalLimits?.maxAmount).toBe(5000)
    })

    it('should return empty object for roles without restrictions', () => {
      const restrictions = getRoleRestrictions('invalid-role')
      expect(restrictions).toEqual({})
    })
  })

  describe('getRoleApprovalLimit', () => {
    it('should return correct approval limits', () => {
      expect(getRoleApprovalLimit('kitchen-manager')).toBe(5000)
      expect(getRoleApprovalLimit('finance-manager')).toBe(25000)
      expect(getRoleApprovalLimit('store-manager')).toBe(2000)
      expect(getRoleApprovalLimit('general-staff')).toBe(500)
    })

    it('should return 0 for roles without approval limits', () => {
      expect(getRoleApprovalLimit('invalid-role')).toBe(0)
    })
  })
})

describe('Role Permission Completeness', () => {
  it('should have appropriate permission distribution', () => {
    const allPermissions = new Set<string>()
    rolePermissionMappings.forEach(role => {
      role.permissions.forEach(permission => allPermissions.add(permission))
    })

    // Should have reasonable number of unique permissions across all roles
    expect(allPermissions.size).toBeGreaterThan(15)
    expect(allPermissions.size).toBeLessThan(50)
  })

  it('should have consistent permission naming', () => {
    const allPermissions: string[] = []
    rolePermissionMappings.forEach(role => {
      allPermissions.push(...role.permissions)
    })

    // All permissions should follow snake_case naming
    allPermissions.forEach(permission => {
      expect(permission).toMatch(/^[a-z_]+$/)
    })
  })

  describe('Approval Limits Consistency', () => {
    it('should have hierarchical approval limits', () => {
      const financeLimit = getRoleApprovalLimit('finance-manager')
      const kitchenLimit = getRoleApprovalLimit('kitchen-manager')
      const storeLimit = getRoleApprovalLimit('store-manager')
      const staffLimit = getRoleApprovalLimit('general-staff')

      // Finance manager should have highest limit
      expect(financeLimit).toBeGreaterThan(kitchenLimit)
      expect(financeLimit).toBeGreaterThan(storeLimit)
      expect(financeLimit).toBeGreaterThan(staffLimit)

      // Kitchen and Store managers should have higher limits than general staff
      expect(kitchenLimit).toBeGreaterThan(staffLimit)
      expect(storeLimit).toBeGreaterThan(staffLimit)
    })
  })
})