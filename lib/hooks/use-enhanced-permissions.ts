/**
 * Enhanced React Hooks for ABAC Permission Management
 * 
 * These hooks integrate with the Enhanced Permission Service and Attribute Resolver
 * to provide advanced ABAC functionality with comprehensive attribute resolution,
 * caching, audit logging, and real-time policy evaluation.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  enhancedPermissionService,
  checkEnhancedPermission,
  hasEnhancedPermission,
  getEnhancedUserPermissions,
  attributeResolver,
  type EnhancedPermissionCheckRequest,
  type EnhancedPermissionResult,
  type AttributeRequest
} from '@/lib/services/permissions'
import { useKeycloakUser } from '@/lib/context/simple-user-context'
import type { User } from '@/lib/types/user'

// Enhanced query keys for React Query
export const enhancedPermissionKeys = {
  all: ['enhanced-permissions'] as const,
  single: (userId: string, resourceType: string, action: string, resourceId?: string, context?: any) => 
    [...enhancedPermissionKeys.all, 'single', userId, resourceType, action, resourceId, context] as const,
  bulk: (userId: string, permissions: Array<any>, context?: any) => 
    [...enhancedPermissionKeys.all, 'bulk', userId, permissions, context] as const,
  user: (userId: string, context?: any) => [...enhancedPermissionKeys.all, 'user', userId, context] as const,
  attributes: (userId: string) => [...enhancedPermissionKeys.all, 'attributes', userId] as const,
  policies: () => [...enhancedPermissionKeys.all, 'policies'] as const,
  stats: () => [...enhancedPermissionKeys.all, 'stats'] as const,
}

// Enhanced permission check options
export interface EnhancedPermissionCheckOptions extends Omit<EnhancedPermissionCheckRequest, 'userId'> {
  enabled?: boolean
  staleTime?: number
}

export interface AttributeResolutionOptions {
  enabled?: boolean
  staleTime?: number
  includeSubject?: boolean
  includeResource?: boolean
  includeAction?: boolean
  includeEnvironment?: boolean
}

/**
 * Enhanced hook for checking a single permission with full ABAC features
 */
export function useEnhancedPermission(options: EnhancedPermissionCheckOptions) {
  const { user } = useKeycloakUser()
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    ...checkOptions
  } = options

  return useQuery({
    queryKey: enhancedPermissionKeys.single(
      user?.id || '',
      checkOptions.resourceType,
      checkOptions.action,
      checkOptions.resourceId,
      checkOptions.context
    ),
    queryFn: async (): Promise<EnhancedPermissionResult> => {
      if (!user?.id) {
        return {
          allowed: false,
          reason: 'User not authenticated',
          decision: {
            decision: 'deny',
            reason: 'User not authenticated',
            evaluatedPolicies: []
          },
          executionTime: 0,
          matchedPolicies: []
        }
      }

      return await checkEnhancedPermission({
        userId: user.id,
        ...checkOptions,
        options: {
          resolveAttributes: true,
          enableCaching: true,
          auditEnabled: true,
          ...checkOptions.options
        }
      })
    },
    enabled: enabled && !!user?.id,
    staleTime,
  })
}

/**
 * Hook to resolve and cache user attributes
 */
export function useUserAttributes(options: AttributeResolutionOptions = {}) {
  const { user } = useKeycloakUser()
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    includeSubject = true,
    includeResource = false,
    includeAction = false,
    includeEnvironment = true
  } = options

  return useQuery({
    queryKey: enhancedPermissionKeys.attributes(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return null

      const attributeRequest: AttributeRequest = {
        subjectId: includeSubject ? user.id : undefined,
        environmentContext: includeEnvironment ? {} : undefined
      }

      const resolved = await attributeResolver.resolveAttributes(attributeRequest)
      return resolved
    },
    enabled: enabled && !!user?.id,
    staleTime,
  })
}

/**
 * Hook for bulk permission checking with enhanced features
 */
export function useEnhancedBulkPermissions(
  permissions: Array<{
    resourceType: string
    resourceId?: string
    action: string
  }>,
  options: {
    context?: EnhancedPermissionCheckRequest['context']
    enabled?: boolean
    staleTime?: number
    resolveAttributes?: boolean
    auditEnabled?: boolean
  } = {}
) {
  const { user } = useKeycloakUser()
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    context,
    resolveAttributes = true,
    auditEnabled = false // Disable audit for bulk to avoid spam
  } = options

  return useQuery({
    queryKey: enhancedPermissionKeys.bulk(user?.id || '', permissions, context),
    queryFn: async (): Promise<Array<EnhancedPermissionResult>> => {
      if (!user?.id) {
        return permissions.map(p => ({
          allowed: false,
          reason: 'User not authenticated',
          decision: {
            decision: 'deny',
            reason: 'User not authenticated',
            evaluatedPolicies: []
          },
          executionTime: 0,
          matchedPolicies: []
        }))
      }

      return await enhancedPermissionService.checkBulkPermissions(
        user.id,
        permissions,
        context,
        {
          resolveAttributes,
          auditEnabled
        }
      )
    },
    enabled: enabled && !!user?.id && permissions.length > 0,
    staleTime,
  })
}

/**
 * Hook for real-time permission monitoring
 * Automatically refetches permissions when policies change
 */
export function usePermissionMonitoring(
  resourceType: string,
  action: string,
  resourceId?: string,
  options: {
    pollingInterval?: number
    enabled?: boolean
    context?: EnhancedPermissionCheckRequest['context']
  } = {}
) {
  const { pollingInterval = 30000, enabled = true, context } = options // 30 second default
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const permissionQuery = useEnhancedPermission({
    resourceType,
    action,
    resourceId,
    context,
    enabled,
    staleTime: pollingInterval / 2 // Set stale time to half of polling interval
  })

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      permissionQuery.refetch()
      setLastCheck(new Date())
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [enabled, pollingInterval, permissionQuery])

  return {
    ...permissionQuery,
    lastCheck,
    isMonitoring: enabled,
    pollingInterval
  }
}

/**
 * Hook for conditional permission checking based on dynamic contexts
 */
export function useConditionalPermissions(
  conditions: Array<{
    resourceType: string
    action: string
    resourceId?: string
    condition: (context: any) => boolean
    context?: EnhancedPermissionCheckRequest['context']
  }>,
  globalContext: any = {}
) {
  const { user } = useKeycloakUser()
  const [activeConditions, setActiveConditions] = useState<typeof conditions>([])

  // Evaluate conditions when context changes
  useEffect(() => {
    const active = conditions.filter(condition => 
      condition.condition(globalContext)
    )
    setActiveConditions(active)
  }, [conditions, globalContext])

  const bulkQuery = useEnhancedBulkPermissions(
    activeConditions.map(c => ({
      resourceType: c.resourceType,
      action: c.action,
      resourceId: c.resourceId
    })),
    {
      context: activeConditions[0]?.context,
      enabled: activeConditions.length > 0
    }
  )

  return {
    conditions: activeConditions,
    results: bulkQuery.data || [],
    isLoading: bulkQuery.isLoading,
    error: bulkQuery.error,
    refetch: bulkQuery.refetch
  }
}

/**
 * Hook for permission-based feature flags
 */
export function usePermissionFeatureFlags(
  features: Record<string, {
    resourceType: string
    action: string
    resourceId?: string
    context?: EnhancedPermissionCheckRequest['context']
  }>,
  options: {
    enabled?: boolean
    fallbackEnabled?: boolean
  } = {}
) {
  const { enabled = true, fallbackEnabled = false } = options
  const featureKeys = Object.keys(features)
  const featurePermissions = Object.values(features)

  const bulkQuery = useEnhancedBulkPermissions(
    featurePermissions.map(f => ({
      resourceType: f.resourceType,
      action: f.action,
      resourceId: f.resourceId
    })),
    { enabled, auditEnabled: false }
  )

  const featureFlags = useMemo(() => {
    if (!bulkQuery.data || !Array.isArray(bulkQuery.data)) {
      return featureKeys.reduce((acc, key) => ({ ...acc, [key]: fallbackEnabled }), {})
    }

    return featureKeys.reduce((acc, key, index) => {
      const result = bulkQuery.data[index]
      return { ...acc, [key]: result?.allowed || false }
    }, {} as Record<string, boolean>)
  }, [bulkQuery.data, featureKeys, fallbackEnabled])

  return {
    features: featureFlags,
    isLoading: bulkQuery.isLoading,
    error: bulkQuery.error,
    refetch: bulkQuery.refetch
  }
}

/**
 * Hook for advanced permission validation with custom rules
 */
export function useAdvancedPermissionValidation(
  validationConfig: {
    rules: Array<{
      id: string
      resourceType: string
      action: string
      resourceId?: string
      validator?: (result: EnhancedPermissionResult) => boolean
      errorMessage?: string
      warningMessage?: string
    }>
    mode: 'strict' | 'warning' | 'advisory'
    onValidationComplete?: (results: any) => void
  }
) {
  const { user } = useKeycloakUser()
  const [validationState, setValidationState] = useState({
    isValidating: false,
    errors: [] as Array<{ id: string; message: string; level: 'error' | 'warning' | 'info' }>,
    results: {} as Record<string, EnhancedPermissionResult>
  })

  const validateRules = useCallback(async () => {
    if (!user?.id) return false

    setValidationState(prev => ({ ...prev, isValidating: true }))

    try {
      const results: Record<string, EnhancedPermissionResult> = {}
      const errors: Array<{ id: string; message: string; level: 'error' | 'warning' | 'info' }> = []

      for (const rule of validationConfig.rules) {
        const result = await checkEnhancedPermission({
          userId: user.id,
          resourceType: rule.resourceType,
          action: rule.action,
          resourceId: rule.resourceId
        })

        results[rule.id] = result

        // Apply custom validator if provided
        const isValid = rule.validator ? rule.validator(result) : result.allowed

        if (!isValid) {
          const level = validationConfig.mode === 'strict' ? 'error' : 
                       validationConfig.mode === 'warning' ? 'warning' : 'info'
          
          errors.push({
            id: rule.id,
            message: rule.errorMessage || result.reason,
            level
          })
        }
      }

      setValidationState({
        isValidating: false,
        errors,
        results
      })

      validationConfig.onValidationComplete?.({
        isValid: errors.filter(e => e.level === 'error').length === 0,
        errors,
        results
      })

      return errors.filter(e => e.level === 'error').length === 0
    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        errors: [{
          id: 'validation_error',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          level: 'error'
        }]
      }))
      return false
    }
  }, [user?.id, validationConfig])

  return {
    validate: validateRules,
    isValidating: validationState.isValidating,
    errors: validationState.errors,
    results: validationState.results,
    hasErrors: validationState.errors.filter(e => e.level === 'error').length > 0,
    hasWarnings: validationState.errors.filter(e => e.level === 'warning').length > 0,
    clearErrors: () => setValidationState(prev => ({ ...prev, errors: [] }))
  }
}

/**
 * Hook for permission analytics and insights
 */
export function usePermissionAnalytics() {
  const { user } = useKeycloakUser()
  const queryClient = useQueryClient()

  const statsQuery = useQuery({
    queryKey: enhancedPermissionKeys.stats(),
    queryFn: async () => {
      const stats = await enhancedPermissionService.getStats()
      const health = await enhancedPermissionService.healthCheck()
      
      // Get cache statistics
      const queries = queryClient.getQueryCache().getAll()
      const permissionQueries = queries.filter(query => 
        Array.isArray(query.queryKey) && query.queryKey[0] === 'enhanced-permissions'
      )

      return {
        service: stats,
        health,
        cache: {
          totalQueries: permissionQueries.length,
          successfulQueries: permissionQueries.filter(q => q.state.status === 'success').length,
          errorQueries: permissionQueries.filter(q => q.state.status === 'error').length,
          loadingQueries: permissionQueries.filter(q => q.state.status === 'pending').length,
          staleQueries: permissionQueries.filter(q => q.isStale()).length
        },
        user: user?.id
      }
    },
    staleTime: 30000, // 30 seconds
    enabled: !!user?.id
  })

  const clearAnalytics = useCallback(() => {
    enhancedPermissionService.clearPolicyCache()
    attributeResolver.clearCache()
    queryClient.invalidateQueries({ queryKey: enhancedPermissionKeys.all })
  }, [queryClient])

  return {
    analytics: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
    clearAnalytics
  }
}

/**
 * Higher-order hook that wraps other hooks with error boundaries
 */
export function usePermissionSafeWrapper<T>(
  hookFn: () => T,
  fallbackValue: T,
  onError?: (error: any) => void
): T {
  const [error, setError] = useState<any>(null)

  try {
    const result = hookFn()
    
    // Clear error if hook succeeds
    if (error) {
      setError(null)
    }
    
    return result
  } catch (err) {
    if (err !== error) {
      setError(err)
      onError?.(err)
      console.error('Permission hook error:', err)
    }
    
    return fallbackValue
  }
}

/**
 * Enhanced convenience hook that combines permission checking with user context
 */
export function useHasEnhancedPermission(
  resourceType: string,
  action: string,
  resourceId?: string,
  context?: EnhancedPermissionCheckRequest['context'],
  options?: {
    enabled?: boolean
    resolveAttributes?: boolean
    auditEnabled?: boolean
  }
) {
  const permissionQuery = useEnhancedPermission({
    resourceType,
    action,
    resourceId,
    context,
    options: {
      resolveAttributes: options?.resolveAttributes ?? true,
      enableCaching: true,
      auditEnabled: options?.auditEnabled ?? false
    },
    enabled: options?.enabled
  })

  const data = permissionQuery.data as EnhancedPermissionResult | undefined

  return {
    hasPermission: data?.allowed ?? false,
    isLoading: permissionQuery.isLoading,
    error: permissionQuery.error,
    reason: data?.reason,
    decision: data?.decision,
    executionTime: data?.executionTime,
    resolvedAttributes: data?.resolvedAttributes,
    matchedPolicies: data?.matchedPolicies || [],
    auditLogId: data?.auditLogId,
    refetch: permissionQuery.refetch,
  }
}

/**
 * Hook for enhanced resource permissions with attribute resolution
 */
export function useEnhancedResourcePermissions(
  resourceType: string, 
  resourceId?: string,
  options: {
    context?: EnhancedPermissionCheckRequest['context']
    resolveAttributes?: boolean
    enabled?: boolean
  } = {}
) {
  const { context, resolveAttributes = true, enabled = true } = options
  const actions = ['read', 'create', 'update', 'delete', 'approve', 'reject']

  const bulkQuery = useEnhancedBulkPermissions(
    actions.map(action => ({ resourceType, action, resourceId })),
    { 
      context, 
      resolveAttributes, 
      enabled,
      auditEnabled: false
    }
  )

  const permissions = useMemo(() => {
    if (!bulkQuery.data || !Array.isArray(bulkQuery.data)) return {}

    const data = bulkQuery.data as EnhancedPermissionResult[]

    return actions.reduce((acc, action, index) => {
      const result = data[index]
      return {
        ...acc,
        [action]: {
          allowed: result?.allowed || false,
          reason: result?.reason,
          matchedPolicies: result?.matchedPolicies || []
        }
      }
    }, {} as Record<string, any>)
  }, [bulkQuery.data, actions])

  const data = bulkQuery.data as EnhancedPermissionResult[] | undefined

  return {
    permissions,
    canRead: permissions.read?.allowed || false,
    canCreate: permissions.create?.allowed || false,
    canUpdate: permissions.update?.allowed || false,
    canDelete: permissions.delete?.allowed || false,
    canApprove: permissions.approve?.allowed || false,
    canReject: permissions.reject?.allowed || false,
    canWrite: permissions.create?.allowed || permissions.update?.allowed || false,
    canModify: permissions.update?.allowed || permissions.delete?.allowed || false,
    canWorkflow: permissions.approve?.allowed || permissions.reject?.allowed || false,
    isLoading: bulkQuery.isLoading,
    error: bulkQuery.error,
    refetch: bulkQuery.refetch,
    resolvedAttributes: data?.[0]?.resolvedAttributes
  }
}

// Export all enhanced hooks
export default {
  useEnhancedPermission,
  useUserAttributes,
  useEnhancedBulkPermissions,
  usePermissionMonitoring,
  useConditionalPermissions,
  usePermissionFeatureFlags,
  useAdvancedPermissionValidation,
  usePermissionAnalytics,
  usePermissionSafeWrapper,
  useHasEnhancedPermission,
  useEnhancedResourcePermissions,
}