/**
 * Vendor API React Query Hooks
 * 
 * Provides React Query hooks for vendor-related API operations with:
 * - Caching and synchronization
 * - Loading states and error handling
 * - Optimistic updates
 * - Background refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vendorApi, type VendorFilters, type CreateVendorRequest, type UpdateVendorRequest, type PaginationParams } from '@/lib/api'
import { type Vendor } from '@/lib/types/vendor'

// Query keys for consistent cache management
export const VENDOR_QUERY_KEYS = {
  all: ['vendors'] as const,
  lists: () => [...VENDOR_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: VendorFilters, pagination?: PaginationParams) => 
    [...VENDOR_QUERY_KEYS.lists(), { filters, pagination }] as const,
  details: () => [...VENDOR_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VENDOR_QUERY_KEYS.details(), id] as const,
  stats: () => [...VENDOR_QUERY_KEYS.all, 'stats'] as const,
  metrics: (id: string) => [...VENDOR_QUERY_KEYS.all, 'metrics', id] as const
} as const

// Hooks for vendor queries
export function useVendors(
  filters?: VendorFilters,
  pagination?: PaginationParams,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.list(filters, pagination),
    queryFn: async () => {
      const response = await vendorApi.getVendors(filters, pagination)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch vendors')
      }
      return response.data
    },
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useVendor(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await vendorApi.getVendor(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch vendor')
      }
      return response.data
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useVendorStats() {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await vendorApi.getVendorStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch vendor stats')
      }
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useVendorMetrics(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: VENDOR_QUERY_KEYS.metrics(id),
    queryFn: async () => {
      const response = await vendorApi.getVendorMetrics(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch vendor metrics')
      }
      return response.data
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  })
}

// Mutations for vendor operations
export function useCreateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vendor: CreateVendorRequest) => {
      const response = await vendorApi.createVendor(vendor)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create vendor')
      }
      return response.data
    },
    onSuccess: (newVendor, variables) => {
      // Invalidate vendor lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.stats() })
      
      // Add new vendor to cache
      queryClient.setQueryData(VENDOR_QUERY_KEYS.detail(newVendor.id), newVendor)
      
      toast.success(`Vendor "${variables.name}" created successfully`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create vendor')
    }
  })
}

export function useUpdateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...vendor }: UpdateVendorRequest) => {
      const response = await vendorApi.updateVendor(id, vendor)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update vendor')
      }
      return response.data
    },
    onMutate: async ({ id, ...newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: VENDOR_QUERY_KEYS.detail(id) })
      
      // Get current data for rollback
      const previousVendor = queryClient.getQueryData(VENDOR_QUERY_KEYS.detail(id))
      
      // Optimistically update cache
      if (previousVendor) {
        queryClient.setQueryData(VENDOR_QUERY_KEYS.detail(id), {
          ...previousVendor,
          ...newData,
          updatedAt: new Date().toISOString()
        })
      }
      
      return { previousVendor, id }
    },
    onSuccess: (updatedVendor, variables) => {
      // Update cache with server response
      queryClient.setQueryData(VENDOR_QUERY_KEYS.detail(variables.id), updatedVendor)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.metrics(variables.id) })
      
      toast.success('Vendor updated successfully')
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousVendor) {
        queryClient.setQueryData(VENDOR_QUERY_KEYS.detail(context.id), context.previousVendor)
      }
      toast.error(error.message || 'Failed to update vendor')
    },
    onSettled: (data, error, variables) => {
      // Always refetch after settled
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.detail(variables.id) })
    }
  })
}

export function useDeleteVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await vendorApi.deleteVendor(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete vendor')
      }
      return id
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: VENDOR_QUERY_KEYS.detail(id) })
      
      // Get current data for rollback
      const previousVendor = queryClient.getQueryData<Vendor>(VENDOR_QUERY_KEYS.detail(id))
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: VENDOR_QUERY_KEYS.detail(id) })
      
      return { previousVendor, id }
    },
    onSuccess: (deletedId, variables) => {
      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.stats() })
      
      // Remove related queries
      queryClient.removeQueries({ queryKey: VENDOR_QUERY_KEYS.detail(deletedId) })
      queryClient.removeQueries({ queryKey: VENDOR_QUERY_KEYS.metrics(deletedId) })
      
      toast.success('Vendor deleted successfully')
    },
    onError: (error, variables, context) => {
      // Restore on error
      if (context?.previousVendor) {
        queryClient.setQueryData(VENDOR_QUERY_KEYS.detail(context.id), context.previousVendor)
      }
      toast.error(error.message || 'Failed to delete vendor')
    }
  })
}

export function useBulkUpdateVendorStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ vendorIds, status }: { vendorIds: string[], status: any }) => {
      const response = await vendorApi.bulkUpdateStatus(vendorIds, status)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update vendor statuses')
      }
      return response.data
    },
    onSuccess: (result, variables) => {
      // Invalidate all vendor-related queries
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.all })
      
      toast.success(`Updated ${result.updated} vendors successfully`)
      if (result.failed.length > 0) {
        toast.warning(`Failed to update ${result.failed.length} vendors`)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update vendor statuses')
    }
  })
}

// Export search functionality
export function useVendorSearch(query: string, filters?: Partial<VendorFilters>) {
  return useQuery({
    queryKey: [...VENDOR_QUERY_KEYS.all, 'search', query, filters],
    queryFn: async () => {
      if (!query.trim()) return []
      
      const response = await vendorApi.getVendors(
        { ...filters, search: query },
        { limit: 10 } // Limit search results
      )
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Search failed')
      }
      
      return response.data.vendors
    },
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}