/**
 * Procurement API React Query Hooks
 * 
 * Provides React Query hooks for procurement-related API operations with:
 * - Caching and synchronization
 * - Loading states and error handling
 * - Optimistic updates
 * - Background refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  procurementApi, 
  type PurchaseRequestFilters,
  type PurchaseOrderFilters,
  type CreatePurchaseRequestRequest,
  type UpdatePurchaseRequestRequest,
  type CreatePurchaseOrderRequest,
  type UpdatePurchaseOrderRequest,
  type PaginationParams 
} from '@/lib/api'
import { type PurchaseRequest, type PurchaseOrder } from '@/lib/types/procurement'

// Query keys for consistent cache management
export const PROCUREMENT_QUERY_KEYS = {
  all: ['procurement'] as const,
  purchaseRequests: () => [...PROCUREMENT_QUERY_KEYS.all, 'purchase-requests'] as const,
  purchaseRequestLists: () => [...PROCUREMENT_QUERY_KEYS.purchaseRequests(), 'list'] as const,
  purchaseRequestList: (filters?: PurchaseRequestFilters, pagination?: PaginationParams) => 
    [...PROCUREMENT_QUERY_KEYS.purchaseRequestLists(), { filters, pagination }] as const,
  purchaseRequestDetails: () => [...PROCUREMENT_QUERY_KEYS.purchaseRequests(), 'detail'] as const,
  purchaseRequestDetail: (id: string) => [...PROCUREMENT_QUERY_KEYS.purchaseRequestDetails(), id] as const,
  
  purchaseOrders: () => [...PROCUREMENT_QUERY_KEYS.all, 'purchase-orders'] as const,
  purchaseOrderLists: () => [...PROCUREMENT_QUERY_KEYS.purchaseOrders(), 'list'] as const,
  purchaseOrderList: (filters?: PurchaseOrderFilters, pagination?: PaginationParams) => 
    [...PROCUREMENT_QUERY_KEYS.purchaseOrderLists(), { filters, pagination }] as const,
  purchaseOrderDetails: () => [...PROCUREMENT_QUERY_KEYS.purchaseOrders(), 'detail'] as const,
  purchaseOrderDetail: (id: string) => [...PROCUREMENT_QUERY_KEYS.purchaseOrderDetails(), id] as const,
  
  stats: () => [...PROCUREMENT_QUERY_KEYS.all, 'stats'] as const,
  vendorComparison: (itemId: string) => [...PROCUREMENT_QUERY_KEYS.all, 'vendor-comparison', itemId] as const,
  priceHistory: (itemId: string) => [...PROCUREMENT_QUERY_KEYS.all, 'price-history', itemId] as const
} as const

// Purchase Request Hooks
export function usePurchaseRequests(
  filters?: PurchaseRequestFilters,
  pagination?: PaginationParams,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestList(filters, pagination),
    queryFn: async () => {
      const response = await procurementApi.getPurchaseRequests(filters, pagination)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch purchase requests')
      }
      return response.data
    },
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 2 * 60 * 1000, // 2 minutes (procurement data changes frequently)
    gcTime: 10 * 60 * 1000,
  })
}

export function usePurchaseRequest(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(id),
    queryFn: async () => {
      const response = await procurementApi.getPurchaseRequest(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch purchase request')
      }
      return response.data
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Purchase Order Hooks
export function usePurchaseOrders(
  filters?: PurchaseOrderFilters,
  pagination?: PaginationParams,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.purchaseOrderList(filters, pagination),
    queryFn: async () => {
      const response = await procurementApi.getPurchaseOrders(filters, pagination)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch purchase orders')
      }
      return response.data
    },
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function usePurchaseOrder(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.purchaseOrderDetail(id),
    queryFn: async () => {
      const response = await procurementApi.getPurchaseOrder(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch purchase order')
      }
      return response.data
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Statistics and Analytics
export function useProcurementStats() {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await procurementApi.getProcurementStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch procurement stats')
      }
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  })
}

export function useVendorComparison(itemId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.vendorComparison(itemId),
    queryFn: async () => {
      const response = await procurementApi.getVendorComparison(itemId)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch vendor comparison')
      }
      return response.data
    },
    enabled: !!itemId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes (prices change)
    gcTime: 15 * 60 * 1000,
  })
}

export function usePriceHistory(itemId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.priceHistory(itemId),
    queryFn: async () => {
      const response = await procurementApi.getPriceHistory(itemId)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch price history')
      }
      return response.data
    },
    enabled: !!itemId && options?.enabled !== false,
    staleTime: 15 * 60 * 1000, // 15 minutes (historical data doesn't change often)
    gcTime: 30 * 60 * 1000,
  })
}

// Purchase Request Mutations
export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreatePurchaseRequestRequest) => {
      const response = await procurementApi.createPurchaseRequest(request)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create purchase request')
      }
      return response.data
    },
    onSuccess: (newRequest, variables) => {
      // Invalidate PR lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.stats() })
      
      // Add new PR to cache
      queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(newRequest.id), newRequest)
      
      toast.success(`Purchase request "${variables.title}" created successfully`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create purchase request')
    }
  })
}

export function useUpdatePurchaseRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...request }: UpdatePurchaseRequestRequest) => {
      const response = await procurementApi.updatePurchaseRequest(id, request)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update purchase request')
      }
      return response.data
    },
    onMutate: async ({ id, ...newData }) => {
      await queryClient.cancelQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(id) })
      
      const previousRequest = queryClient.getQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(id))
      
      if (previousRequest) {
        queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(id), {
          ...previousRequest,
          ...newData,
          updatedAt: new Date().toISOString()
        })
      }
      
      return { previousRequest, id }
    },
    onSuccess: (updatedRequest, variables) => {
      queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(variables.id), updatedRequest)
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      
      toast.success('Purchase request updated successfully')
    },
    onError: (error, variables, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(context.id), context.previousRequest)
      }
      toast.error(error.message || 'Failed to update purchase request')
    }
  })
}

export function useSubmitPurchaseRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await procurementApi.submitPurchaseRequest(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to submit purchase request')
      }
      return response.data
    },
    onSuccess: (submittedRequest, id) => {
      queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(id), submittedRequest)
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.stats() })
      
      toast.success('Purchase request submitted for approval')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit purchase request')
    }
  })
}

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string, comment?: string }) => {
      const response = await procurementApi.approvePurchaseRequest(id, comment)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to approve purchase request')
      }
      return response.data
    },
    onSuccess: (approvedRequest, variables) => {
      queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(variables.id), approvedRequest)
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.stats() })
      
      toast.success('Purchase request approved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve purchase request')
    }
  })
}

export function useRejectPurchaseRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
      const response = await procurementApi.rejectPurchaseRequest(id, reason)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to reject purchase request')
      }
      return response.data
    },
    onSuccess: (rejectedRequest, variables) => {
      queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(variables.id), rejectedRequest)
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.stats() })
      
      toast.success('Purchase request rejected')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject purchase request')
    }
  })
}

// Purchase Order Mutations
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (order: CreatePurchaseOrderRequest) => {
      const response = await procurementApi.createPurchaseOrder(order)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create purchase order')
      }
      return response.data
    },
    onSuccess: (newOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseOrderLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.stats() })
      
      queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseOrderDetail(newOrder.id), newOrder)
      
      toast.success('Purchase order created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create purchase order')
    }
  })
}

export function useConvertToPurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      prId, 
      conversion 
    }: { 
      prId: string
      conversion: {
        vendorId: string
        selectedItems: string[]
        deliveryDate?: string
        notes?: string
      }
    }) => {
      const response = await procurementApi.convertToPurchaseOrder(prId, conversion)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to convert to purchase order')
      }
      return response.data
    },
    onSuccess: (newOrder, variables) => {
      // Update the PR to reflect conversion
      queryClient.invalidateQueries({ 
        queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestDetail(variables.prId) 
      })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseOrderLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.stats() })
      
      // Add new PO to cache
      queryClient.setQueryData(PROCUREMENT_QUERY_KEYS.purchaseOrderDetail(newOrder.id), newOrder)
      
      toast.success('Purchase request converted to purchase order successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert to purchase order')
    }
  })
}

export function useAssignPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      assignment 
    }: { 
      itemId: string
      assignment: {
        vendorId: string
        unitPrice: any
        leadTime?: number
        notes?: string
      }
    }) => {
      const response = await procurementApi.assignPrice(itemId, assignment)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to assign price')
      }
      return response.data
    },
    onSuccess: (result, variables) => {
      // Invalidate vendor comparison to refresh prices
      queryClient.invalidateQueries({ 
        queryKey: PROCUREMENT_QUERY_KEYS.vendorComparison(variables.itemId) 
      })
      
      // Invalidate related PR queries
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      
      toast.success('Price assigned successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign price')
    }
  })
}

export function useBulkApprovePurchaseRequests() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestIds, comment }: { requestIds: string[], comment?: string }) => {
      const response = await procurementApi.bulkApprove(requestIds, comment)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to bulk approve requests')
      }
      return response.data
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.purchaseRequestLists() })
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.stats() })
      
      toast.success(`Approved ${result.approved} purchase requests`)
      if (result.failed.length > 0) {
        toast.warning(`Failed to approve ${result.failed.length} requests`)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to bulk approve requests')
    }
  })
}