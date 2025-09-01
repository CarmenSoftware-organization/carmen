/**
 * API Hooks Index
 * 
 * Centralizes all API-related React Query hooks for easy import throughout the application
 */

// Vendor hooks
export {
  useVendors,
  useVendor,
  useVendorStats,
  useVendorMetrics,
  useVendorSearch,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  useBulkUpdateVendorStatus,
  VENDOR_QUERY_KEYS
} from './use-vendors'

// Product hooks
export {
  useProducts,
  useProduct,
  useProductStats,
  useProductInventory,
  useProductSearch,
  useProductsByCategory,
  useProductsByVendor,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateProductInventory,
  useBulkUpdateProductStatus,
  useUploadProductImages,
  PRODUCT_QUERY_KEYS
} from './use-products'

// Procurement hooks
export {
  usePurchaseRequests,
  usePurchaseRequest,
  usePurchaseOrders,
  usePurchaseOrder,
  useProcurementStats,
  useVendorComparison,
  usePriceHistory,
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useCreatePurchaseOrder,
  useConvertToPurchaseOrder,
  useAssignPrice,
  useBulkApprovePurchaseRequests,
  PROCUREMENT_QUERY_KEYS
} from './use-procurement'

// Query key utilities
export const API_QUERY_KEYS = {
  VENDORS: VENDOR_QUERY_KEYS,
  PRODUCTS: PRODUCT_QUERY_KEYS,
  PROCUREMENT: PROCUREMENT_QUERY_KEYS
} as const

// Common hook options types
export interface UseQueryOptions {
  enabled?: boolean
  refetchInterval?: number
}

export interface UseMutationOptions {
  onSuccess?: (data: any, variables: any) => void
  onError?: (error: Error, variables: any) => void
}

// Re-export API client for hooks that need direct access
export { apiClient } from '@/lib/api'