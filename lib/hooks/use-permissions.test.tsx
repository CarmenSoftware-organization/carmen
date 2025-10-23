/**
 * Test suite for Permission Management Hooks
 * 
 * These tests ensure the permission hooks work correctly with different scenarios
 * and integrate properly with React Query and the permission service layer.
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'

import {
  usePermission,
  useBulkPermissions,
  useUserPermissions,
  usePermissionValidation,
  usePermissionCache,
  useHasPermission,
  useResourcePermissions,
  useFormPermissionGuard,
  usePermissionLogic
} from './use-permissions'

// Mock the user context
const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'staff',
  department: 'kitchen',
  location: 'main-location',
}

// Mock the permission service
vi.mock('@/lib/services/permissions', () => ({
  checkPermission: vi.fn(),
  hasPermission: vi.fn(),
  getUserPermissions: vi.fn(),
  permissionService: {
    checkBulkPermissions: vi.fn(),
    getUserResourcePermissions: vi.fn(),
    getStats: vi.fn(),
  }
}))

// Mock the user context
vi.mock('@/lib/context/user-context', () => ({
  useUser: vi.fn(() => ({ user: mockUser }))
}))

// Test wrapper with React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Permission Management Hooks', () => {
  let mockCheckPermission: ReturnType<typeof vi.fn>
  let mockGetUserPermissions: ReturnType<typeof vi.fn>
  let mockBulkPermissions: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Get mocked functions
    mockCheckPermission = vi.mocked(require('@/lib/services/permissions').checkPermission)
    mockGetUserPermissions = vi.mocked(require('@/lib/services/permissions').getUserPermissions)
    mockBulkPermissions = vi.mocked(require('@/lib/services/permissions').permissionService.checkBulkPermissions)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('usePermission', () => {
    it('should check permission successfully', async () => {
      mockCheckPermission.mockResolvedValue({
        allowed: true,
        reason: 'User has required permissions',
        decision: { decision: 'permit', reason: 'Policy allows', evaluatedPolicies: [] },
        executionTime: 10
      })

      const { result } = renderHook(
        () => usePermission({
          resourceType: 'purchase-request',
          action: 'create'
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.allowed).toBe(true)
      expect(mockCheckPermission).toHaveBeenCalledWith({
        userId: 'test-user-1',
        resourceType: 'purchase-request',
        action: 'create'
      })
    })

    it('should handle permission denial', async () => {
      mockCheckPermission.mockResolvedValue({
        allowed: false,
        reason: 'Insufficient privileges',
        decision: { decision: 'deny', reason: 'No matching policy', evaluatedPolicies: [] },
        executionTime: 8
      })

      const { result } = renderHook(
        () => usePermission({
          resourceType: 'financial-report',
          action: 'read'
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.allowed).toBe(false)
      expect(result.current.data?.reason).toBe('Insufficient privileges')
    })

    it('should handle user not authenticated', async () => {
      // Mock user as null
      vi.mocked(require('@/lib/context/user-context').useUser).mockReturnValue({ user: null })

      const { result } = renderHook(
        () => usePermission({
          resourceType: 'purchase-request',
          action: 'create'
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.allowed).toBe(false)
      expect(result.current.data?.reason).toBe('User not authenticated')
    })
  })

  describe('useBulkPermissions', () => {
    it('should check multiple permissions efficiently', async () => {
      mockBulkPermissions.mockResolvedValue({
        userId: 'test-user-1',
        results: [
          { resourceType: 'purchase-request', action: 'read', allowed: true, reason: 'Allowed' },
          { resourceType: 'purchase-request', action: 'create', allowed: false, reason: 'Denied' },
          { resourceType: 'purchase-request', action: 'update', allowed: true, reason: 'Allowed' },
        ],
        executionTime: 15
      })

      const { result } = renderHook(
        () => useBulkPermissions({
          permissions: [
            { resourceType: 'purchase-request', action: 'read' },
            { resourceType: 'purchase-request', action: 'create' },
            { resourceType: 'purchase-request', action: 'update' },
          ]
        }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.results).toHaveLength(3)
      expect(result.current.data?.results[0].allowed).toBe(true)
      expect(result.current.data?.results[1].allowed).toBe(false)
      expect(result.current.data?.results[2].allowed).toBe(true)
    })
  })

  describe('useUserPermissions', () => {
    it('should fetch all user permissions', async () => {
      const mockPermissions = [
        {
          id: 'perm-1',
          subjectId: 'test-user-1',
          resourceType: 'purchase-request',
          action: 'create',
          effect: 'permit' as const,
          source: 'policy',
          grantedAt: new Date(),
          grantedBy: 'system'
        },
        {
          id: 'perm-2',
          subjectId: 'test-user-1',
          resourceType: 'vendor',
          action: 'read',
          effect: 'permit' as const,
          source: 'policy',
          grantedAt: new Date(),
          grantedBy: 'system'
        }
      ]

      mockGetUserPermissions.mockResolvedValue(mockPermissions)

      const { result } = renderHook(
        () => useUserPermissions(),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data?.[0].resourceType).toBe('purchase-request')
      expect(result.current.data?.[1].resourceType).toBe('vendor')
    })
  })

  describe('usePermissionValidation', () => {
    it('should validate permissions for form rules', async () => {
      mockCheckPermission.mockResolvedValueOnce({
        allowed: true,
        reason: 'Valid',
        decision: { decision: 'permit', reason: 'Allowed', evaluatedPolicies: [] },
        executionTime: 5
      }).mockResolvedValueOnce({
        allowed: false,
        reason: 'Access denied',
        decision: { decision: 'deny', reason: 'Denied', evaluatedPolicies: [] },
        executionTime: 5
      })

      const { result } = renderHook(
        () => usePermissionValidation([
          { resourceType: 'vendor', action: 'create', required: true },
          { resourceType: 'vendor-price-list', action: 'create', message: 'Need price list access' }
        ]),
        { wrapper: createWrapper() }
      )

      const isValid = await result.current.validatePermissions()
      
      expect(isValid).toBe(false)
      expect(result.current.hasErrors).toBe(true)
      expect(Object.keys(result.current.validationErrors)).toContain('vendor-price-list_create_default')
    })
  })

  describe('useHasPermission', () => {
    it('should provide simplified permission check', async () => {
      mockCheckPermission.mockResolvedValue({
        allowed: true,
        reason: 'Access granted',
        decision: { decision: 'permit', reason: 'Policy allows', evaluatedPolicies: [] },
        executionTime: 12
      })

      const { result } = renderHook(
        () => useHasPermission('inventory-item', 'read'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true)
      })

      expect(result.current.reason).toBe('Access granted')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('useResourcePermissions', () => {
    it('should check all standard resource permissions', async () => {
      // Mock responses for different actions
      mockCheckPermission
        .mockResolvedValueOnce({ allowed: true, reason: 'Read allowed', decision: { decision: 'permit', reason: '', evaluatedPolicies: [] }, executionTime: 5 })
        .mockResolvedValueOnce({ allowed: true, reason: 'Create allowed', decision: { decision: 'permit', reason: '', evaluatedPolicies: [] }, executionTime: 5 })
        .mockResolvedValueOnce({ allowed: false, reason: 'Update denied', decision: { decision: 'deny', reason: '', evaluatedPolicies: [] }, executionTime: 5 })
        .mockResolvedValueOnce({ allowed: false, reason: 'Delete denied', decision: { decision: 'deny', reason: '', evaluatedPolicies: [] }, executionTime: 5 })
        .mockResolvedValueOnce({ allowed: true, reason: 'Approve allowed', decision: { decision: 'permit', reason: '', evaluatedPolicies: [] }, executionTime: 5 })
        .mockResolvedValueOnce({ allowed: false, reason: 'Reject denied', decision: { decision: 'deny', reason: '', evaluatedPolicies: [] }, executionTime: 5 })

      const { result } = renderHook(
        () => useResourcePermissions('product', 'product-123'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canRead).toBe(true)
      expect(result.current.canCreate).toBe(true)
      expect(result.current.canUpdate).toBe(false)
      expect(result.current.canDelete).toBe(false)
      expect(result.current.canApprove).toBe(true)
      expect(result.current.canReject).toBe(false)
      expect(result.current.canWrite).toBe(true) // create OR update
      expect(result.current.canModify).toBe(false) // update OR delete
      expect(result.current.canWorkflow).toBe(true) // approve OR reject
    })
  })

  describe('usePermissionLogic', () => {
    it('should handle OR logic correctly', async () => {
      mockBulkPermissions.mockResolvedValue({
        userId: 'test-user-1',
        results: [
          { resourceType: 'report', action: 'read', allowed: false, reason: 'Denied' },
          { resourceType: 'dashboard', action: 'view', allowed: true, reason: 'Allowed' },
          { resourceType: 'analytics', action: 'access', allowed: false, reason: 'Denied' },
        ],
        executionTime: 20
      })

      const { result } = renderHook(
        () => usePermissionLogic([
          { resourceType: 'report', action: 'read' },
          { resourceType: 'dashboard', action: 'view' },
          { resourceType: 'analytics', action: 'access' },
        ], 'OR'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should be true because at least one permission (dashboard view) is allowed
      expect(result.current.hasPermission).toBe(true)
    })

    it('should handle AND logic correctly', async () => {
      mockBulkPermissions.mockResolvedValue({
        userId: 'test-user-1',
        results: [
          { resourceType: 'report', action: 'read', allowed: true, reason: 'Allowed' },
          { resourceType: 'report', action: 'export', allowed: false, reason: 'Denied' },
          { resourceType: 'report', action: 'share', allowed: true, reason: 'Allowed' },
        ],
        executionTime: 18
      })

      const { result } = renderHook(
        () => usePermissionLogic([
          { resourceType: 'report', action: 'read' },
          { resourceType: 'report', action: 'export' },
          { resourceType: 'report', action: 'share' },
        ], 'AND'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should be false because not all permissions are allowed (export is denied)
      expect(result.current.hasPermission).toBe(false)
    })

    it('should handle custom logic', async () => {
      mockBulkPermissions.mockResolvedValue({
        userId: 'test-user-1',
        results: [
          { resourceType: 'item1', action: 'read', allowed: true, reason: 'Allowed' },
          { resourceType: 'item2', action: 'read', allowed: false, reason: 'Denied' },
          { resourceType: 'item3', action: 'read', allowed: true, reason: 'Allowed' },
        ],
        executionTime: 15
      })

      // Custom logic: at least 2 out of 3 permissions must be true
      const customLogic = (results: boolean[]) => {
        const trueCount = results.filter(Boolean).length
        return trueCount >= 2
      }

      const { result } = renderHook(
        () => usePermissionLogic([
          { resourceType: 'item1', action: 'read' },
          { resourceType: 'item2', action: 'read' },
          { resourceType: 'item3', action: 'read' },
        ], 'CUSTOM', customLogic),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should be true because 2 out of 3 permissions are allowed
      expect(result.current.hasPermission).toBe(true)
    })
  })

  describe('useFormPermissionGuard', () => {
    it('should prevent form submission when permissions are missing', async () => {
      mockCheckPermission.mockResolvedValue({
        allowed: false,
        reason: 'Insufficient privileges',
        decision: { decision: 'deny', reason: 'Policy denied', evaluatedPolicies: [] },
        executionTime: 10
      })

      const { result } = renderHook(
        () => useFormPermissionGuard([
          { resourceType: 'sensitive-data', action: 'create', required: true, message: 'Need create access' }
        ]),
        { wrapper: createWrapper() }
      )

      const mockSubmitFn = vi.fn()
      const canSubmit = await result.current.checkPermissionsAndSubmit(mockSubmitFn)
      
      expect(canSubmit).toBe(false)
      expect(mockSubmitFn).not.toHaveBeenCalled()
      expect(result.current.hasErrors).toBe(true)
    })

    it('should allow form submission when permissions are valid', async () => {
      mockCheckPermission.mockResolvedValue({
        allowed: true,
        reason: 'Access granted',
        decision: { decision: 'permit', reason: 'Policy allows', evaluatedPolicies: [] },
        executionTime: 8
      })

      const { result } = renderHook(
        () => useFormPermissionGuard([
          { resourceType: 'data', action: 'create', required: true }
        ]),
        { wrapper: createWrapper() }
      )

      const mockSubmitFn = vi.fn()
      const canSubmit = await result.current.checkPermissionsAndSubmit(mockSubmitFn)
      
      expect(canSubmit).toBe(true)
      expect(mockSubmitFn).toHaveBeenCalled()
      expect(result.current.hasErrors).toBe(false)
    })
  })

  describe('usePermissionCache', () => {
    it('should provide cache management utilities', () => {
      const { result } = renderHook(
        () => usePermissionCache(),
        { wrapper: createWrapper() }
      )

      expect(typeof result.current.invalidateUserPermissions).toBe('function')
      expect(typeof result.current.invalidatePermission).toBe('function')
      expect(typeof result.current.prefetchPermission).toBe('function')
      expect(typeof result.current.getCachedPermission).toBe('function')
      expect(typeof result.current.getCacheStats).toBe('function')
      expect(typeof result.current.clearCache).toBe('function')
    })

    it('should provide cache statistics', () => {
      const { result } = renderHook(
        () => usePermissionCache(),
        { wrapper: createWrapper() }
      )

      const stats = result.current.getCacheStats()
      
      expect(stats).toHaveProperty('totalPermissionQueries')
      expect(stats).toHaveProperty('cachedQueries')
      expect(stats).toHaveProperty('staleQueries')
      expect(stats).toHaveProperty('loadingQueries')
      expect(typeof stats.totalPermissionQueries).toBe('number')
    })
  })
})

describe('Edge Cases and Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    const mockError = new Error('Network error')
    vi.mocked(require('@/lib/services/permissions').checkPermission).mockRejectedValue(mockError)

    const { result } = renderHook(
      () => usePermission({
        resourceType: 'test-resource',
        action: 'test-action'
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should handle empty permission arrays', async () => {
    vi.mocked(require('@/lib/services/permissions').getUserPermissions).mockResolvedValue([])

    const { result } = renderHook(
      () => useUserPermissions(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should handle malformed permission responses', async () => {
    // Mock malformed response
    vi.mocked(require('@/lib/services/permissions').checkPermission).mockResolvedValue({
      allowed: true,
      reason: 'Test',
      // Missing required fields
    } as any)

    const { result } = renderHook(
      () => usePermission({
        resourceType: 'test-resource',
        action: 'test-action'
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should handle gracefully even with malformed data
    expect(result.current.data?.allowed).toBe(true)
  })
})