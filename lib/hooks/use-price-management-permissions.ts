/**
 * React Hooks for Price Management Permissions
 * 
 * This module provides React hooks for managing permissions in Price Management UI components,
 * making it easy to conditionally render UI elements based on user permissions.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserContext, 
  PriceManagementResource, 
  Permission,
  DataRestriction 
} from '../services/price-management-rbac-service';
import { 
  hasPermission, 
  hasPermissions, 
  getUIPermissions, 
  filterDataByPermissions,
  canOverridePrices,
  canAccessAuditLogs,
  canConfigureBusinessRules,
  getAllowedExportFormats,
  UIPermissions,
  PermissionCheck
} from '../utils/price-management-permissions';

/**
 * Hook to check a single permission
 */
export function usePermission(
  user: UserContext | null,
  resource: PriceManagementResource,
  permission: Permission,
  resourceId?: string
) {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    hasPermission(user, { resource, permission, resourceId })
      .then(result => {
        setHasAccess(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setHasAccess(false);
        setLoading(false);
      });
  }, [user, resource, permission, resourceId]);

  return { hasAccess, loading, error };
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(
  user: UserContext | null,
  checks: PermissionCheck[]
) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || checks.length === 0) {
      setPermissions({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    hasPermissions(user, checks)
      .then(result => {
        setPermissions(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setPermissions({});
        setLoading(false);
      });
  }, [user, JSON.stringify(checks)]);

  return { permissions, loading, error };
}

/**
 * Hook to get comprehensive UI permissions for a resource
 */
export function useUIPermissions(
  user: UserContext | null,
  resource: PriceManagementResource,
  resourceId?: string
) {
  const [permissions, setPermissions] = useState<UIPermissions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getUIPermissions(user, resource, resourceId)
      .then(result => {
        setPermissions(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setPermissions(null);
        setLoading(false);
      });
  }, [user, resource, resourceId]);

  return { permissions, loading, error };
}

/**
 * Hook to filter data based on user permissions
 */
export function usePermissionFilter<T extends Record<string, any>>(
  user: UserContext | null,
  resource: PriceManagementResource,
  data: T | T[] | null,
  restrictions: DataRestriction[] = []
) {
  const filteredData = useMemo(() => {
    if (!user || !data) {
      return null;
    }

    return filterDataByPermissions(data, user.role, resource, restrictions);
  }, [user, resource, data, restrictions]);

  return filteredData;
}

/**
 * Hook for price override permissions
 */
export function usePriceOverridePermission(user: UserContext | null) {
  const [canOverride, setCanOverride] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setCanOverride(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    canOverridePrices(user)
      .then(result => {
        setCanOverride(result);
        setLoading(false);
      })
      .catch(() => {
        setCanOverride(false);
        setLoading(false);
      });
  }, [user]);

  return { canOverride, loading };
}

/**
 * Hook for audit log access permissions
 */
export function useAuditLogPermission(user: UserContext | null) {
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setCanAccess(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    canAccessAuditLogs(user)
      .then(result => {
        setCanAccess(result);
        setLoading(false);
      })
      .catch(() => {
        setCanAccess(false);
        setLoading(false);
      });
  }, [user]);

  return { canAccess, loading };
}

/**
 * Hook for business rules configuration permissions
 */
export function useBusinessRulesPermission(user: UserContext | null) {
  const [canConfigure, setCanConfigure] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setCanConfigure(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    canConfigureBusinessRules(user)
      .then(result => {
        setCanConfigure(result);
        setLoading(false);
      })
      .catch(() => {
        setCanConfigure(false);
        setLoading(false);
      });
  }, [user]);

  return { canConfigure, loading };
}

/**
 * Hook for export permissions
 */
export function useExportPermissions(user: UserContext | null) {
  const allowedFormats = useMemo(() => {
    if (!user) {
      return [];
    }
    return getAllowedExportFormats(user.role);
  }, [user]);

  const canExport = allowedFormats.length > 0;

  return { canExport, allowedFormats };
}

/**
 * Hook for vendor-specific permissions
 */
export function useVendorPermissions(
  user: UserContext | null,
  vendorId?: string
) {
  const canManageVendors = usePermission(user, 'vendor_management', 'manage');
  const canViewVendorPricing = usePermission(user, 'vendor_pricing', 'read', vendorId);
  const canEditVendorPricing = usePermission(user, 'vendor_pricing', 'write', vendorId);
  const canAccessVendorPortal = usePermission(user, 'vendor_portal', 'read', vendorId);

  const isVendorUser = user?.role === 'Vendor';
  const isOwnVendorData = isVendorUser && user?.vendorId === vendorId;

  return {
    canManageVendors: canManageVendors.hasAccess,
    canViewVendorPricing: canViewVendorPricing.hasAccess,
    canEditVendorPricing: canEditVendorPricing.hasAccess,
    canAccessVendorPortal: canAccessVendorPortal.hasAccess,
    isVendorUser,
    isOwnVendorData,
    loading: canManageVendors.loading || canViewVendorPricing.loading || 
             canEditVendorPricing.loading || canAccessVendorPortal.loading
  };
}

/**
 * Hook for price assignment permissions
 */
export function usePriceAssignmentPermissions(
  user: UserContext | null,
  prItemId?: string
) {
  const canViewAssignments = usePermission(user, 'price_assignments', 'read', prItemId);
  const canEditAssignments = usePermission(user, 'price_assignments', 'write', prItemId);
  const canOverrideAssignments = usePermission(user, 'price_assignments', 'override', prItemId);
  const canManageQueues = usePermission(user, 'assignment_queues', 'manage');
  const canBulkEdit = usePermission(user, 'assignment_queues', 'bulk_operations');

  return {
    canViewAssignments: canViewAssignments.hasAccess,
    canEditAssignments: canEditAssignments.hasAccess,
    canOverrideAssignments: canOverrideAssignments.hasAccess,
    canManageQueues: canManageQueues.hasAccess,
    canBulkEdit: canBulkEdit.hasAccess,
    loading: canViewAssignments.loading || canEditAssignments.loading || 
             canOverrideAssignments.loading || canManageQueues.loading || canBulkEdit.loading
  };
}

/**
 * Hook for analytics permissions
 */
export function useAnalyticsPermissions(user: UserContext | null) {
  const canViewAnalytics = usePermission(user, 'analytics', 'read');
  const canExportAnalytics = usePermission(user, 'analytics', 'export');
  const canManageAnalytics = usePermission(user, 'analytics', 'manage');

  return {
    canViewAnalytics: canViewAnalytics.hasAccess,
    canExportAnalytics: canExportAnalytics.hasAccess,
    canManageAnalytics: canManageAnalytics.hasAccess,
    loading: canViewAnalytics.loading || canExportAnalytics.loading || canManageAnalytics.loading
  };
}

/**
 * Hook to get user context from various sources
 */
export function useUserContext(): UserContext | null {
  const [user, setUser] = useState<UserContext | null>(null);

  useEffect(() => {
    // In a real implementation, this would get user context from:
    // - Authentication context
    // - Local storage
    // - API call
    // - JWT token

    // For development, we'll try to get it from localStorage or use a default
    const storedUser = localStorage.getItem('priceManagementUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user context:', error);
        setUser(null);
      }
    } else {
      // Default user for development
      setUser({
        userId: 'dev-user-1',
        role: 'Purchaser',
        department: 'Procurement',
        location: 'HQ'
      });
    }
  }, []);

  const updateUser = useCallback((newUser: UserContext | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('priceManagementUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('priceManagementUser');
    }
  }, []);

  return user;
}

/**
 * Higher-order hook that combines multiple permission checks
 */
export function usePriceManagementPermissions(
  user: UserContext | null,
  resource: PriceManagementResource,
  resourceId?: string
) {
  const uiPermissions = useUIPermissions(user, resource, resourceId);
  const exportPermissions = useExportPermissions(user);
  const overridePermission = usePriceOverridePermission(user);
  const auditPermission = useAuditLogPermission(user);

  const loading = uiPermissions.loading || overridePermission.loading || auditPermission.loading;

  return {
    ...uiPermissions.permissions,
    canExport: exportPermissions.canExport,
    allowedExportFormats: exportPermissions.allowedFormats,
    canOverridePrices: overridePermission.canOverride,
    canAccessAuditLogs: auditPermission.canAccess,
    loading,
    error: uiPermissions.error
  };
}