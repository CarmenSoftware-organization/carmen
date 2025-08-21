/**
 * Permission Management Utilities for Price Management Module
 * 
 * This module provides utility functions for checking permissions,
 * filtering data based on user roles, and managing access controls.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.6
 */

import { 
  priceManagementRBAC, 
  UserContext, 
  PriceManagementResource, 
  Permission,
  DataRestriction 
} from '../services/price-management-rbac-service';

export interface PermissionCheck {
  resource: PriceManagementResource;
  permission: Permission;
  resourceId?: string;
}

export interface FieldPermission {
  field: string;
  readable: boolean;
  writable: boolean;
  visible: boolean;
}

export interface UIPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canBulkEdit: boolean;
  canOverride: boolean;
  canApprove: boolean;
  canConfigure: boolean;
  fieldPermissions: Record<string, FieldPermission>;
  restrictions: DataRestriction[];
}

/**
 * Check if user has permission for a specific operation
 */
export async function hasPermission(
  user: UserContext, 
  check: PermissionCheck
): Promise<boolean> {
  const result = await priceManagementRBAC.checkAccess({
    user,
    resource: check.resource,
    permission: check.permission,
    resourceId: check.resourceId
  });
  return result.granted;
}

/**
 * Check multiple permissions at once
 */
export async function hasPermissions(
  user: UserContext, 
  checks: PermissionCheck[]
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  for (const check of checks) {
    const key = `${check.resource}_${check.permission}${check.resourceId ? `_${check.resourceId}` : ''}`;
    results[key] = await hasPermission(user, check);
  }
  
  return results;
}

/**
 * Get UI permissions for a specific resource
 */
export async function getUIPermissions(
  user: UserContext, 
  resource: PriceManagementResource,
  resourceId?: string
): Promise<UIPermissions> {
  const permissions: UIPermissions = {
    canView: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canBulkEdit: false,
    canOverride: false,
    canApprove: false,
    canConfigure: false,
    fieldPermissions: {},
    restrictions: []
  };

  // Check basic permissions
  permissions.canView = await hasPermission(user, { resource, permission: 'read', resourceId });
  permissions.canEdit = await hasPermission(user, { resource, permission: 'write', resourceId });
  permissions.canDelete = await hasPermission(user, { resource, permission: 'delete', resourceId });
  permissions.canExport = await hasPermission(user, { resource, permission: 'export', resourceId });
  permissions.canBulkEdit = await hasPermission(user, { resource, permission: 'bulk_operations', resourceId });
  permissions.canOverride = await hasPermission(user, { resource, permission: 'override', resourceId });
  permissions.canApprove = await hasPermission(user, { resource, permission: 'approve', resourceId });
  permissions.canConfigure = await hasPermission(user, { resource, permission: 'configure', resourceId });

  // Get field permissions
  permissions.fieldPermissions = getFieldPermissions(user.role, resource);

  // Get data restrictions
  const accessResult = await priceManagementRBAC.checkAccess({
    user,
    resource,
    permission: 'read',
    resourceId
  });
  permissions.restrictions = accessResult.restrictions || [];

  return permissions;
}

/**
 * Get field-level permissions based on user role and resource
 */
export function getFieldPermissions(
  userRole: string, 
  resource: PriceManagementResource
): Record<string, FieldPermission> {
  const permissions: Record<string, FieldPermission> = {};

  // Default permission template
  const defaultPermission: FieldPermission = {
    field: 'default',
    readable: false,
    writable: false,
    visible: false
  };

  switch (resource) {
    case 'vendor_pricing':
      return getVendorPricingFieldPermissions(userRole);
    case 'price_assignments':
      return getPriceAssignmentFieldPermissions(userRole);
    case 'business_rules':
      return getBusinessRulesFieldPermissions(userRole);
    case 'vendor_management':
      return getVendorManagementFieldPermissions(userRole);
    case 'analytics':
      return getAnalyticsFieldPermissions(userRole);
    default:
      return permissions;
  }
}

/**
 * Vendor pricing field permissions
 */
function getVendorPricingFieldPermissions(userRole: string): Record<string, FieldPermission> {
  const permissions: Record<string, FieldPermission> = {};

  const fields = [
    'vendorId', 'vendorName', 'productId', 'productName', 'unitPrice', 
    'currency', 'minQuantity', 'bulkPrice', 'validFrom', 'validTo',
    'exchangeRate', 'normalizedPrice', 'competitorPricing', 'profitMargin'
  ];

  fields.forEach(field => {
    switch (userRole) {
      case 'Requestor':
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
        break;

      case 'Approver':
        permissions[field] = {
          field,
          readable: !['competitorPricing', 'profitMargin'].includes(field),
          writable: false,
          visible: !['competitorPricing', 'profitMargin'].includes(field)
        };
        break;

      case 'Purchaser':
      case 'Admin':
        permissions[field] = {
          field,
          readable: true,
          writable: !['exchangeRate', 'normalizedPrice'].includes(field),
          visible: true
        };
        break;

      case 'Vendor':
        permissions[field] = {
          field,
          readable: !['competitorPricing', 'profitMargin'].includes(field),
          writable: ['unitPrice', 'minQuantity', 'bulkPrice', 'validFrom', 'validTo'].includes(field),
          visible: !['competitorPricing', 'profitMargin'].includes(field)
        };
        break;

      default:
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
    }
  });

  return permissions;
}

/**
 * Price assignment field permissions
 */
function getPriceAssignmentFieldPermissions(userRole: string): Record<string, FieldPermission> {
  const permissions: Record<string, FieldPermission> = {};

  const fields = [
    'prItemId', 'vendorId', 'vendorName', 'assignedPrice', 'currency',
    'assignmentReason', 'confidence', 'alternatives', 'ruleApplied',
    'isManualOverride', 'overrideReason', 'assignedBy', 'assignedAt'
  ];

  fields.forEach(field => {
    switch (userRole) {
      case 'Requestor':
        permissions[field] = {
          field,
          readable: ['assignedPrice', 'currency', 'vendorName'].includes(field),
          writable: false,
          visible: ['assignedPrice', 'currency', 'vendorName'].includes(field)
        };
        break;

      case 'Approver':
        permissions[field] = {
          field,
          readable: !['assignmentReason', 'confidence', 'alternatives'].includes(field),
          writable: false,
          visible: !['assignmentReason', 'confidence', 'alternatives'].includes(field)
        };
        break;

      case 'Purchaser':
      case 'Admin':
        permissions[field] = {
          field,
          readable: true,
          writable: ['overrideReason'].includes(field),
          visible: true
        };
        break;

      case 'Vendor':
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
        break;

      default:
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
    }
  });

  return permissions;
}

/**
 * Business rules field permissions
 */
function getBusinessRulesFieldPermissions(userRole: string): Record<string, FieldPermission> {
  const permissions: Record<string, FieldPermission> = {};

  const fields = [
    'id', 'name', 'description', 'priority', 'conditions', 'actions',
    'isActive', 'createdAt', 'updatedAt', 'createdBy', 'performance'
  ];

  fields.forEach(field => {
    switch (userRole) {
      case 'Requestor':
      case 'Vendor':
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
        break;

      case 'Approver':
        permissions[field] = {
          field,
          readable: ['name', 'description', 'isActive'].includes(field),
          writable: false,
          visible: ['name', 'description', 'isActive'].includes(field)
        };
        break;

      case 'Purchaser':
        permissions[field] = {
          field,
          readable: true,
          writable: !['id', 'createdAt', 'updatedAt', 'performance'].includes(field),
          visible: true
        };
        break;

      case 'Admin':
        permissions[field] = {
          field,
          readable: true,
          writable: !['id', 'createdAt', 'updatedAt'].includes(field),
          visible: true
        };
        break;

      default:
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
    }
  });

  return permissions;
}

/**
 * Vendor management field permissions
 */
function getVendorManagementFieldPermissions(userRole: string): Record<string, FieldPermission> {
  const permissions: Record<string, FieldPermission> = {};

  const fields = [
    'id', 'name', 'email', 'phone', 'address', 'categories', 'rating',
    'isPreferred', 'contractStatus', 'paymentTerms', 'deliveryTerms',
    'pricelistSettings', 'currencyPreferences', 'performanceMetrics'
  ];

  fields.forEach(field => {
    switch (userRole) {
      case 'Requestor':
        permissions[field] = {
          field,
          readable: ['name'].includes(field),
          writable: false,
          visible: ['name'].includes(field)
        };
        break;

      case 'Approver':
        permissions[field] = {
          field,
          readable: ['name', 'rating', 'isPreferred', 'contractStatus'].includes(field),
          writable: false,
          visible: ['name', 'rating', 'isPreferred', 'contractStatus'].includes(field)
        };
        break;

      case 'Purchaser':
        permissions[field] = {
          field,
          readable: true,
          writable: !['id', 'performanceMetrics'].includes(field),
          visible: true
        };
        break;

      case 'Admin':
        permissions[field] = {
          field,
          readable: true,
          writable: !['id'].includes(field),
          visible: true
        };
        break;

      case 'Vendor':
        permissions[field] = {
          field,
          readable: ['name', 'email', 'phone', 'address', 'categories', 'currencyPreferences'].includes(field),
          writable: ['email', 'phone', 'address'].includes(field),
          visible: ['name', 'email', 'phone', 'address', 'categories', 'currencyPreferences'].includes(field)
        };
        break;

      default:
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
    }
  });

  return permissions;
}

/**
 * Analytics field permissions
 */
function getAnalyticsFieldPermissions(userRole: string): Record<string, FieldPermission> {
  const permissions: Record<string, FieldPermission> = {};

  const fields = [
    'vendorParticipation', 'priceAssignmentAccuracy', 'automationRate',
    'costSavings', 'processingTime', 'errorRate', 'userActivity',
    'systemPerformance', 'complianceMetrics', 'financialImpact'
  ];

  fields.forEach(field => {
    switch (userRole) {
      case 'Requestor':
      case 'Vendor':
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
        break;

      case 'Approver':
        permissions[field] = {
          field,
          readable: ['vendorParticipation', 'automationRate', 'processingTime'].includes(field),
          writable: false,
          visible: ['vendorParticipation', 'automationRate', 'processingTime'].includes(field)
        };
        break;

      case 'Purchaser':
      case 'Admin':
        permissions[field] = {
          field,
          readable: true,
          writable: false,
          visible: true
        };
        break;

      default:
        permissions[field] = {
          field,
          readable: false,
          writable: false,
          visible: false
        };
    }
  });

  return permissions;
}

/**
 * Filter data based on user permissions and restrictions
 */
export function filterDataByPermissions<T extends Record<string, any>>(
  data: T | T[],
  userRole: string,
  resource: PriceManagementResource,
  restrictions: DataRestriction[] = []
): Partial<T> | Partial<T>[] {
  const fieldPermissions = getFieldPermissions(userRole, resource);

  const filterItem = (item: T): Partial<T> => {
    const filteredItem: Partial<T> = {};

    // Apply field permissions
    Object.keys(item).forEach(key => {
      const permission = fieldPermissions[key];
      if (permission && permission.visible && permission.readable) {
        filteredItem[key as keyof T] = item[key];
      }
    });

    // Apply restrictions
    restrictions.forEach(restriction => {
      switch (restriction.action) {
        case 'hide':
          delete filteredItem[restriction.field as keyof T];
          break;
        case 'mask':
          if (filteredItem[restriction.field as keyof T]) {
            filteredItem[restriction.field as keyof T] = '***' as any;
          }
          break;
        case 'readonly':
          // This would be handled in the UI layer
          break;
      }
    });

    return filteredItem;
  };

  if (Array.isArray(data)) {
    return data.map(filterItem);
  } else {
    return filterItem(data);
  }
}

/**
 * Check if user can access vendor-specific data
 */
export function canAccessVendorData(user: UserContext, vendorId: string): boolean {
  if (user.role === 'Vendor') {
    return user.vendorId === vendorId;
  }
  return ['Purchaser', 'Admin'].includes(user.role);
}

/**
 * Check if user can perform price overrides
 */
export async function canOverridePrices(user: UserContext): Promise<boolean> {
  return hasPermission(user, {
    resource: 'price_assignments',
    permission: 'override'
  });
}

/**
 * Check if user can access audit logs
 */
export async function canAccessAuditLogs(user: UserContext): Promise<boolean> {
  return hasPermission(user, {
    resource: 'audit_logs',
    permission: 'read'
  });
}

/**
 * Check if user can configure business rules
 */
export async function canConfigureBusinessRules(user: UserContext): Promise<boolean> {
  return hasPermission(user, {
    resource: 'business_rules',
    permission: 'configure'
  });
}

/**
 * Get allowed export formats based on user role
 */
export function getAllowedExportFormats(userRole: string): string[] {
  switch (userRole) {
    case 'Requestor':
      return [];
    case 'Approver':
      return ['csv'];
    case 'Purchaser':
      return ['csv', 'excel', 'pdf'];
    case 'Admin':
      return ['csv', 'excel', 'pdf', 'json'];
    case 'Vendor':
      return ['csv'];
    default:
      return [];
  }
}

/**
 * Validate permission changes (for admin use)
 */
export function validatePermissionChange(
  userRole: string,
  resource: PriceManagementResource,
  permission: Permission,
  granted: boolean
): { valid: boolean; reason?: string } {
  // Prevent removing critical permissions
  if (!granted && userRole === 'Admin' && permission === 'configure') {
    return {
      valid: false,
      reason: 'Cannot remove configure permission from Admin role'
    };
  }

  // Prevent granting inappropriate permissions
  if (granted && userRole === 'Requestor' && resource === 'vendor_pricing') {
    return {
      valid: false,
      reason: 'Requestor role should not have access to vendor pricing'
    };
  }

  if (granted && userRole === 'Vendor' && resource === 'business_rules') {
    return {
      valid: false,
      reason: 'Vendor role should not have access to business rules'
    };
  }

  return { valid: true };
}