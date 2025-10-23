/**
 * API Index - Main exports for Carmen ERP API client
 * 
 * Centralizes all API services and utilities for easy import throughout the application
 */

// Core API client
export { apiClient, AuthManager } from './client'
export type { ApiResponse, ApiError, PaginationParams, RequestConfig } from './client'

// Service APIs
export { vendorApi } from './vendors'
export { productApi } from './products'
export { procurementApi } from './procurement'
export { posApprovalsApi } from './pos-approvals'
export { posTransactionsApi } from './pos-transactions'
export { posMappingsApi } from './pos-mappings'

// Types
export type {
  // Vendor types
  VendorFilters,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorListResponse,
  VendorStatsResponse,
  VendorMetricsResponse
} from './vendors'

export type {
  // Product types
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductStatsResponse,
  ProductInventoryResponse,
  ProductSpecification,
  ProductUnit,
  ProductDimensions
} from './products'

export type {
  // Procurement types
  PurchaseRequestFilters,
  PurchaseOrderFilters,
  CreatePurchaseRequestRequest,
  UpdatePurchaseRequestRequest,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PurchaseRequestListResponse,
  PurchaseOrderListResponse,
  ProcurementStatsResponse,
  VendorComparisonResponse,
  PriceHistoryResponse
} from './procurement'

export type {
  // POS Approvals types
  PendingTransactionsListResponse,
  ApprovalStatsResponse,
  ApprovalRequestWithNotes,
  BulkApprovalRequestBody
} from './pos-approvals'

export type {
  // POS Transactions types
  TransactionListResponse,
  TransactionDetailResponse,
  FailedTransactionsListResponse,
  TransactionFilters,
  FailedTransactionFilters
} from './pos-transactions'

export type {
  // POS Mappings types
  MappingListResponse,
  UnmappedItemsListResponse,
  RecipeSearchResponse,
  MappingStatsResponse,
  MappingFilters,
  RecipeSearchFilters,
  CreateMappingRequest,
  UpdateMappingRequest,
  BulkMappingRequest
} from './pos-mappings'

// Utility functions
export { buildQueryParams, isApiError } from './client'

// Common API endpoints
export const API_ENDPOINTS = {
  // Vendor endpoints
  VENDORS: '/vendors',
  VENDOR_STATS: '/vendors/stats',
  VENDOR_METRICS: (id: string) => `/vendors/${id}/metrics`,
  
  // Product endpoints
  PRODUCTS: '/products',
  PRODUCT_STATS: '/products/stats',
  PRODUCT_INVENTORY: (id: string) => `/products/${id}/inventory`,
  PRODUCT_SEARCH: '/products/search',
  
  // Procurement endpoints
  PURCHASE_REQUESTS: '/purchase-requests',
  PURCHASE_ORDERS: '/purchase-orders',
  PROCUREMENT_STATS: '/procurement/stats',
  VENDOR_COMPARISON: (itemId: string) => `/purchase-requests/items/${itemId}/vendor-comparison`,
  PRICE_HISTORY: (itemId: string) => `/purchase-requests/items/${itemId}/price-history`,

  // Price management endpoints
  PRICE_MANAGEMENT: '/price-management',
  PRICE_ASSIGNMENTS: '/price-management/assignments',
  BUSINESS_RULES: '/price-management/business-rules',
  CAMPAIGNS: '/price-management/campaigns',

  // POS Integration endpoints
  POS_APPROVALS_PENDING: '/pos/approvals/pending',
  POS_APPROVALS_STATS: '/pos/approvals/stats',
  POS_APPROVAL_DETAIL: (id: string) => `/pos/approvals/pending/${id}`,
  POS_APPROVE: (id: string) => `/pos/approvals/${id}/approve`,
  POS_REJECT: (id: string) => `/pos/approvals/${id}/reject`,
  POS_BULK_APPROVE: '/pos/approvals/bulk-approve',
  POS_BULK_REJECT: '/pos/approvals/bulk-reject',

  POS_TRANSACTIONS: '/pos/transactions',
  POS_TRANSACTIONS_STATS: '/pos/transactions/stats',
  POS_TRANSACTIONS_FAILED: '/pos/transactions/failed',
  POS_TRANSACTION_DETAIL: (id: string) => `/pos/transactions/${id}`,
  POS_TRANSACTION_ERROR: (id: string) => `/pos/transactions/${id}/error`,
  POS_TRANSACTION_AUDIT: (id: string) => `/pos/transactions/${id}/audit-log`,
  POS_TRANSACTION_RETRY: (id: string) => `/pos/transactions/${id}/retry`,
  POS_TRANSACTION_RESOLVE: (id: string) => `/pos/transactions/${id}/resolve`,

  POS_MAPPINGS: '/pos/mappings',
  POS_MAPPINGS_STATS: '/pos/mappings/stats',
  POS_MAPPINGS_UNMAPPED: '/pos/mappings/unmapped',
  POS_MAPPING_DETAIL: (id: string) => `/pos/mappings/${id}`,
  POS_MAPPING_BY_POS_ITEM: (posItemId: string) => `/pos/mappings/pos-item/${posItemId}`,
  POS_MAPPING_PREVIEW: '/pos/mappings/preview',
  POS_RECIPE_SEARCH: '/pos/mappings/recipes/search',
  POS_BULK_CREATE_MAPPINGS: '/pos/mappings/bulk-create',
  POS_SYNC_ITEMS: '/pos/mappings/sync-items',

  // Authentication endpoints
  AUTH: '/auth',
  HEALTH: '/health'
} as const

// HTTP status codes for reference
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// Common error messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network connection failed',
  TIMEOUT_ERROR: 'Request timeout',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
} as const