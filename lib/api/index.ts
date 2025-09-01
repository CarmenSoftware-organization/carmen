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

// Types
export type {
  // Vendor types
  VendorFilters,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorListResponse,
  VendorStatsResponse,
  VendorMetricsResponse,
  
  // Product types
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductStatsResponse,
  ProductInventoryResponse,
  ProductSpecification,
  ProductUnit,
  ProductDimensions,
  
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
} from './vendors'

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