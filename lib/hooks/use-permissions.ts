/**
 * React Hooks for Permission Management
 * 
 * This module provides comprehensive React hooks for ABAC (Attribute-Based Access Control) 
 * permission management, integrating with the PolicyEngine and PermissionService.
 * 
 * Features:
 * - Single and bulk permission checking
 * - React Query integration for caching and optimization
 * - Real-time permission validation
 * - Form validation hooks
 * - User permission context management
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  permissionService,
  checkPermission,
  hasPermission,
  getUserPermissions,
  type PermissionCheckRequest,
  type PermissionResult,
  type BulkPermissionRequest,
  type BulkPermissionResult
} from '@/lib/services/permissions'
import { useUser } from '@/lib/context/user-context'
import type { User } from '@/lib/types/user'
import type { PermissionString } from '@/lib/types/permissions'

// Define Permission type based on service implementation
export interface Permission {
  id: string
  subjectId: string
  resourceType: string
  action: string
  effect: 'permit' | 'deny'
  source: 'policy' | 'role' | 'direct'
  grantedAt: Date
  grantedBy: string
}

// Query keys for React Query
export const permissionKeys = {
  all: ['permissions'] as const,
  single: (userId: string, resourceType: string, action: string, resourceId?: string) => 
    [...permissionKeys.all, 'single', userId, resourceType, action, resourceId] as const,
  bulk: (userId: string, permissions: Array<{resourceType: string; action: string; resourceId?: string}>) => 
    [...permissionKeys.all, 'bulk', userId, permissions] as const,
  user: (userId: string) => [...permissionKeys.all, 'user', userId] as const,
  userResource: (userId: string, resourceType: string, resourceId?: string) => 
    [...permissionKeys.all, 'userResource', userId, resourceType, resourceId] as const,
}

// Extended permission check interface for hooks
export interface PermissionCheckOptions extends Omit<PermissionCheckRequest, 'userId'> {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

export interface BulkPermissionOptions extends Omit<BulkPermissionRequest, 'userId'> {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

export interface PermissionValidationRule {
  resourceType: string
  action: string
  resourceId?: string
  message?: string
  required?: boolean
}

/**
 * Hook to check a single permission
 * Uses React Query for caching and automatic refetching
 */
export function usePermission(options: PermissionCheckOptions) {
  const { user } = useUser()
  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000, ...checkOptions } = options

  return useQuery({
    queryKey: permissionKeys.single(
      user?.id || '',
      checkOptions.resourceType,
      checkOptions.action,
      checkOptions.resourceId
    ),
    queryFn: async (): Promise<PermissionResult> => {
      if (!user?.id) {
        return {
          allowed: false,
          reason: 'User not authenticated',
          decision: { decision: 'deny', reason: 'User not authenticated', evaluatedPolicies: [] },
          executionTime: 0
        }
      }

      return await checkPermission({
        userId: user.id,
        ...checkOptions
      })
    },
    enabled: enabled && !!user?.id,
    staleTime,
    gcTime: cacheTime,
  })
}

/**
 * Hook to check multiple permissions efficiently
 * Optimizes performance by batching permission checks
 */
export function useBulkPermissions(options: BulkPermissionOptions) {
  const { user } = useUser()
  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000, ...bulkOptions } = options

  return useQuery({
    queryKey: permissionKeys.bulk(user?.id || '', bulkOptions.permissions),
    queryFn: async (): Promise<BulkPermissionResult> => {
      if (!user?.id) {
        return {
          userId: '',
          results: bulkOptions.permissions.map(p => ({
            ...p,
            allowed: false,
            reason: 'User not authenticated'
          })),
          executionTime: 0
        }
      }

      return await permissionService.checkBulkPermissions({
        userId: user.id,
        ...bulkOptions
      })
    },
    enabled: enabled && !!user?.id && bulkOptions.permissions.length > 0,
    staleTime,
    gcTime: cacheTime,
  })
}

/**
 * Hook to get all permissions for the current user
 * Useful for comprehensive permission dashboards
 */
export function useUserPermissions(options?: {
  context?: PermissionCheckRequest['context']
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}) {
  const { user } = useUser()
  const { enabled = true, staleTime = 10 * 60 * 1000, cacheTime = 30 * 60 * 1000, context } = options || {}

  return useQuery({
    queryKey: permissionKeys.user(user?.id || ''),
    queryFn: async (): Promise<Permission[]> => {
      if (!user?.id) return []
      return await getUserPermissions(user.id, context)
    },
    enabled: enabled && !!user?.id,
    staleTime,
    gcTime: cacheTime,
  })
}

/**
 * Hook to get all permissions for a user on a specific resource
 * Useful for resource-specific permission matrices
 */
export function useUserResourcePermissions(
  resourceType: string,
  resourceId?: string,
  options?: {
    context?: PermissionCheckRequest['context']
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
) {
  const { user } = useUser()
  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000, context } = options || {}

  return useQuery({
    queryKey: permissionKeys.userResource(user?.id || '', resourceType, resourceId),
    queryFn: async () => {
      if (!user?.id) return []
      return await permissionService.getUserResourcePermissions(user.id, resourceType, resourceId, context)
    },
    enabled: enabled && !!user?.id && !!resourceType,
    staleTime,
    gcTime: cacheTime,
  })
}

/**
 * Hook for validating permissions in forms
 * Provides validation functions and error handling
 */
export function usePermissionValidation(rules: PermissionValidationRule[]) {
  const { user } = useUser()
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  const validatePermissions = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setValidationErrors({ general: 'User not authenticated' })
      return false
    }

    setIsValidating(true)
    const errors: Record<string, string> = {}
    let hasErrors = false

    try {
      for (const rule of rules) {
        const result = await checkPermission({
          userId: user.id,
          resourceType: rule.resourceType,
          resourceId: rule.resourceId,
          action: rule.action
        })

        if (!result.allowed && rule.required !== false) {
          const key = `${rule.resourceType}_${rule.action}_${rule.resourceId || 'default'}`
          errors[key] = rule.message || result.reason
          hasErrors = true
        }
      }

      setValidationErrors(errors)
      return !hasErrors
    } catch (error) {
      setValidationErrors({ general: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` })
      return false
    } finally {
      setIsValidating(false)
    }
  }, [user?.id, rules])

  const validateSingleRule = useCallback(async (rule: PermissionValidationRule): Promise<boolean> => {
    if (!user?.id) return false

    try {
      const result = await checkPermission({
        userId: user.id,
        resourceType: rule.resourceType,
        resourceId: rule.resourceId,
        action: rule.action
      })

      const key = `${rule.resourceType}_${rule.action}_${rule.resourceId || 'default'}`
      
      if (!result.allowed && rule.required !== false) {
        setValidationErrors(prev => ({
          ...prev,
          [key]: rule.message || result.reason
        }))
        return false
      } else {
        setValidationErrors(prev => {
          const { [key]: _, ...rest } = prev
          return rest
        })
        return true
      }
    } catch (error) {
      return false
    }
  }, [user?.id])

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({})
  }, [])

  return {
    validatePermissions,
    validateSingleRule,
    clearValidationErrors,
    validationErrors,
    isValidating,
    hasErrors: Object.keys(validationErrors).length > 0
  }
}

/**
 * Hook for managing permission cache
 * Provides utilities for cache management and optimization
 */
export function usePermissionCache() {
  const queryClient = useQueryClient()

  const invalidateUserPermissions = useCallback((userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: permissionKeys.user(userId) })
    } else {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    }
  }, [queryClient])

  const invalidatePermission = useCallback((
    userId: string, 
    resourceType: string, 
    action: string, 
    resourceId?: string
  ) => {
    queryClient.invalidateQueries({
      queryKey: permissionKeys.single(userId, resourceType, action, resourceId)
    })
  }, [queryClient])

  const prefetchPermission = useCallback(async (request: PermissionCheckRequest) => {
    await queryClient.prefetchQuery({
      queryKey: permissionKeys.single(request.userId, request.resourceType, request.action, request.resourceId),
      queryFn: () => checkPermission(request),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])

  const prefetchBulkPermissions = useCallback(async (request: BulkPermissionRequest) => {
    await queryClient.prefetchQuery({
      queryKey: permissionKeys.bulk(request.userId, request.permissions),
      queryFn: () => permissionService.checkBulkPermissions(request),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])

  const getCachedPermission = useCallback((
    userId: string,
    resourceType: string,
    action: string,
    resourceId?: string
  ): PermissionResult | undefined => {
    return queryClient.getQueryData(
      permissionKeys.single(userId, resourceType, action, resourceId)
    )
  }, [queryClient])

  const getCacheStats = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll()
    const permissionQueries = queries.filter(query =>
      Array.isArray(query.queryKey) && query.queryKey[0] === 'permissions'
    )

    return {
      totalPermissionQueries: permissionQueries.length,
      cachedQueries: permissionQueries.filter(q => q.state.data).length,
      staleQueries: permissionQueries.filter(q => q.isStale()).length,
      loadingQueries: permissionQueries.filter(q => q.state.status === 'pending').length,
    }
  }, [queryClient])

  const clearCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: permissionKeys.all })
  }, [queryClient])

  return {
    invalidateUserPermissions,
    invalidatePermission,
    prefetchPermission,
    prefetchBulkPermissions,
    getCachedPermission,
    getCacheStats,
    clearCache,
  }
}

/**
 * Convenience hook that combines permission checking with user context
 * Automatically handles user authentication state
 */
export function useHasPermission(
  resourceType: string,
  action: string,
  resourceId?: string,
  context?: PermissionCheckRequest['context']
) {
  const permissionQuery = usePermission({
    resourceType,
    action,
    resourceId,
    context,
  })

  return {
    hasPermission: (permissionQuery.data as PermissionResult | undefined)?.allowed ?? false,
    isLoading: permissionQuery.isLoading,
    error: permissionQuery.error,
    reason: (permissionQuery.data as PermissionResult | undefined)?.reason,
    decision: (permissionQuery.data as PermissionResult | undefined)?.decision,
    refetch: permissionQuery.refetch,
  }
}

/**
 * Hook for checking permissions with different logic operators
 * Supports AND, OR, and custom logic combinations
 */
export function usePermissionLogic(
  permissions: Array<{
    resourceType: string
    action: string
    resourceId?: string
    context?: PermissionCheckRequest['context']
  }>,
  operator: 'AND' | 'OR' | 'CUSTOM' = 'AND',
  customLogic?: (results: boolean[]) => boolean
) {
  const bulkQuery = useBulkPermissions({
    permissions: permissions.map(p => ({
      resourceType: p.resourceType,
      action: p.action,
      resourceId: p.resourceId
    })),
    context: permissions[0]?.context, // Use first context as default
  })

  const result = useMemo(() => {
    if (!bulkQuery.data) return false

    const bulkData = bulkQuery.data as BulkPermissionResult | undefined
    if (!bulkData) return false

    const results = bulkData.results.map((r: { allowed: boolean }) => r.allowed)

    switch (operator) {
      case 'AND':
        return results.every(Boolean)
      case 'OR':
        return results.some(Boolean)
      case 'CUSTOM':
        return customLogic ? customLogic(results) : false
      default:
        return false
    }
  }, [bulkQuery.data, operator, customLogic])

  return {
    hasPermission: result,
    isLoading: bulkQuery.isLoading,
    error: bulkQuery.error,
    results: (bulkQuery.data as BulkPermissionResult | undefined)?.results ?? [],
    refetch: bulkQuery.refetch,
  }
}

/**
 * Hook for resource-specific permission checking
 * Provides shortcuts for common resource operations
 */
export function useResourcePermissions(resourceType: string, resourceId?: string) {
  const canRead = useHasPermission(resourceType, 'read', resourceId)
  const canCreate = useHasPermission(resourceType, 'create', resourceId)
  const canUpdate = useHasPermission(resourceType, 'update', resourceId)
  const canDelete = useHasPermission(resourceType, 'delete', resourceId)
  const canApprove = useHasPermission(resourceType, 'approve', resourceId)
  const canReject = useHasPermission(resourceType, 'reject', resourceId)

  const isLoading = canRead.isLoading || canCreate.isLoading || canUpdate.isLoading || 
                   canDelete.isLoading || canApprove.isLoading || canReject.isLoading

  return {
    canRead: canRead.hasPermission,
    canCreate: canCreate.hasPermission,
    canUpdate: canUpdate.hasPermission,
    canDelete: canDelete.hasPermission,
    canApprove: canApprove.hasPermission,
    canReject: canReject.hasPermission,
    canWrite: canCreate.hasPermission || canUpdate.hasPermission,
    canModify: canUpdate.hasPermission || canDelete.hasPermission,
    canWorkflow: canApprove.hasPermission || canReject.hasPermission,
    isLoading,
    permissions: {
      read: canRead,
      create: canCreate,
      update: canUpdate,
      delete: canDelete,
      approve: canApprove,
      reject: canReject,
    }
  }
}

/**
 * Hook for checking permissions on form submit
 * Prevents form submission if permissions are not met
 */
export function useFormPermissionGuard(validationRules: PermissionValidationRule[]) {
  const { validatePermissions, validationErrors, isValidating } = usePermissionValidation(validationRules)
  const [canSubmit, setCanSubmit] = useState(false)

  const checkPermissionsAndSubmit = useCallback(async (submitFn: () => void | Promise<void>) => {
    const isValid = await validatePermissions()
    setCanSubmit(isValid)
    
    if (isValid) {
      await submitFn()
    }
    
    return isValid
  }, [validatePermissions])

  return {
    checkPermissionsAndSubmit,
    canSubmit,
    validationErrors,
    isValidating,
    hasErrors: Object.keys(validationErrors).length > 0
  }
}

/**
 * Hook for getting permission statistics and analytics
 * Useful for admin dashboards and monitoring
 */
export function usePermissionStats() {
  const { user } = useUser()
  const cacheStats = usePermissionCache().getCacheStats()
  const [runtimeStats, setRuntimeStats] = useState({
    totalChecks: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0
  })

  useEffect(() => {
    if (!user?.id) return

    // Get runtime statistics from permission service
    const stats = permissionService.getStats()
    setRuntimeStats({
      totalChecks: stats.totalEvaluations || 0,
      averageResponseTime: stats.averageExecutionTime || 0,
      cacheHitRate: 0, // Not available in current stats
      errorRate: 0 // Not available in current stats
    })
  }, [user?.id])

  return {
    cacheStats,
    runtimeStats,
    user: user?.id,
  }
}

// Export all hooks and utilities
export default {
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
}