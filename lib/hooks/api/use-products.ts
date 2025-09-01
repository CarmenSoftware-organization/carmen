/**
 * Product API React Query Hooks
 * 
 * Provides React Query hooks for product-related API operations with:
 * - Caching and synchronization
 * - Loading states and error handling
 * - Optimistic updates
 * - Background refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productApi, type ProductFilters, type CreateProductRequest, type UpdateProductRequest, type PaginationParams } from '@/lib/api'
import { type Product } from '@/lib/types/product'

// Query keys for consistent cache management
export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: ProductFilters, pagination?: PaginationParams) => 
    [...PRODUCT_QUERY_KEYS.lists(), { filters, pagination }] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_QUERY_KEYS.details(), id] as const,
  stats: () => [...PRODUCT_QUERY_KEYS.all, 'stats'] as const,
  inventory: (id: string) => [...PRODUCT_QUERY_KEYS.all, 'inventory', id] as const,
  search: (query: string, filters?: Partial<ProductFilters>) => 
    [...PRODUCT_QUERY_KEYS.all, 'search', query, filters] as const,
  byCategory: (categoryId: string, pagination?: PaginationParams) =>
    [...PRODUCT_QUERY_KEYS.all, 'category', categoryId, pagination] as const,
  byVendor: (vendorId: string, pagination?: PaginationParams) =>
    [...PRODUCT_QUERY_KEYS.all, 'vendor', vendorId, pagination] as const
} as const

// Hooks for product queries
export function useProducts(
  filters?: ProductFilters,
  pagination?: PaginationParams,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(filters, pagination),
    queryFn: async () => {
      const response = await productApi.getProducts(filters, pagination)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch products')
      }
      return response.data
    },
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useProduct(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await productApi.getProduct(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch product')
      }
      return response.data
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useProductStats() {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await productApi.getProductStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch product stats')
      }
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useProductInventory(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.inventory(id),
    queryFn: async () => {
      const response = await productApi.getProductInventory(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch product inventory')
      }
      return response.data
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes (inventory changes frequently)
    gcTime: 5 * 60 * 1000,
  })
}

export function useProductSearch(query: string, filters?: Partial<ProductFilters>) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.search(query, filters),
    queryFn: async () => {
      if (!query.trim()) return []
      
      const response = await productApi.searchProducts(query, filters)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Search failed')
      }
      
      return response.data
    },
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useProductsByCategory(
  categoryId: string, 
  pagination?: PaginationParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.byCategory(categoryId, pagination),
    queryFn: async () => {
      const response = await productApi.getProductsByCategory(categoryId, pagination)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch products by category')
      }
      return response.data
    },
    enabled: !!categoryId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useProductsByVendor(
  vendorId: string, 
  pagination?: PaginationParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.byVendor(vendorId, pagination),
    queryFn: async () => {
      const response = await productApi.getProductsByVendor(vendorId, pagination)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch products by vendor')
      }
      return response.data
    },
    enabled: !!vendorId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Mutations for product operations
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: CreateProductRequest) => {
      const response = await productApi.createProduct(product)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create product')
      }
      return response.data
    },
    onSuccess: (newProduct, variables) => {
      // Invalidate product lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.stats() })
      
      // Invalidate category-based queries if applicable
      if (variables.categoryId) {
        queryClient.invalidateQueries({ 
          queryKey: [...PRODUCT_QUERY_KEYS.all, 'category', variables.categoryId] 
        })
      }
      
      // Add new product to cache
      queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(newProduct.id), newProduct)
      
      toast.success(`Product "${variables.productName}" created successfully`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product')
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...product }: UpdateProductRequest) => {
      const response = await productApi.updateProduct(id, product)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update product')
      }
      return response.data
    },
    onMutate: async ({ id, ...newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(id) })
      
      // Get current data for rollback
      const previousProduct = queryClient.getQueryData(PRODUCT_QUERY_KEYS.detail(id))
      
      // Optimistically update cache
      if (previousProduct) {
        queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(id), {
          ...previousProduct,
          ...newData,
          updatedAt: new Date().toISOString()
        })
      }
      
      return { previousProduct, id }
    },
    onSuccess: (updatedProduct, variables) => {
      // Update cache with server response
      queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(variables.id), updatedProduct)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.inventory(variables.id) })
      
      toast.success('Product updated successfully')
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(context.id), context.previousProduct)
      }
      toast.error(error.message || 'Failed to update product')
    },
    onSettled: (data, error, variables) => {
      // Always refetch after settled
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(variables.id) })
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productApi.deleteProduct(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete product')
      }
      return id
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(id) })
      
      // Get current data for rollback
      const previousProduct = queryClient.getQueryData<Product>(PRODUCT_QUERY_KEYS.detail(id))
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(id) })
      
      return { previousProduct, id }
    },
    onSuccess: (deletedId, variables) => {
      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.stats() })
      
      // Remove related queries
      queryClient.removeQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(deletedId) })
      queryClient.removeQueries({ queryKey: PRODUCT_QUERY_KEYS.inventory(deletedId) })
      
      toast.success('Product deleted successfully')
    },
    onError: (error, variables, context) => {
      // Restore on error
      if (context?.previousProduct) {
        queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(context.id), context.previousProduct)
      }
      toast.error(error.message || 'Failed to delete product')
    }
  })
}

export function useUpdateProductInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      inventory 
    }: { 
      id: string
      inventory: {
        minimumStock?: number
        maximumStock?: number
        reorderPoint?: number
        currentStock?: number
      }
    }) => {
      const response = await productApi.updateInventory(id, inventory)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update inventory')
      }
      return response.data
    },
    onSuccess: (updatedInventory, variables) => {
      // Update inventory cache
      queryClient.setQueryData(PRODUCT_QUERY_KEYS.inventory(variables.id), updatedInventory)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.stats() })
      
      toast.success('Inventory updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update inventory')
    }
  })
}

export function useBulkUpdateProductStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productIds, status }: { productIds: string[], status: any }) => {
      const response = await productApi.bulkUpdateStatus(productIds, status)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update product statuses')
      }
      return response.data
    },
    onSuccess: (result, variables) => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all })
      
      toast.success(`Updated ${result.updated} products successfully`)
      if (result.failed.length > 0) {
        toast.warning(`Failed to update ${result.failed.length} products`)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product statuses')
    }
  })
}

export function useUploadProductImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, images }: { id: string, images: File[] }) => {
      const response = await productApi.uploadImages(id, images)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to upload images')
      }
      return response.data
    },
    onSuccess: (result, variables) => {
      // Invalidate product to refresh with new images
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(variables.id) })
      
      toast.success(`Uploaded ${result.uploadedImages.length} images successfully`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload images')
    }
  })
}