/**
 * Procurement API Service
 * 
 * Handles all procurement-related API operations including:
 * - Purchase requests CRUD operations
 * - Purchase orders CRUD operations
 * - Procurement workflows and approvals
 */

import { apiClient, type ApiResponse, type PaginationParams } from './client'
import { 
  type PurchaseRequest, 
  type PurchaseOrder, 
  type PurchaseRequestStatus, 
  type PurchaseOrderStatus,
  type PurchaseRequestItem,
  type PurchaseOrderItem
} from '@/lib/types/procurement'
import { type Money } from '@/lib/types/common'

// API response types
export interface PurchaseRequestListResponse {
  purchaseRequests: PurchaseRequest[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface PurchaseOrderListResponse {
  purchaseOrders: PurchaseOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface ProcurementStatsResponse {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalValue: Money
  averageProcessingTime: number
}

export interface VendorComparisonResponse {
  itemId: string
  productName: string
  vendors: Array<{
    vendorId: string
    vendorName: string
    unitPrice: Money
    moq: number
    leadTime: number
    availability: boolean
    lastUpdated: string
    notes?: string
  }>
  recommendedVendor: {
    vendorId: string
    reason: string
    score: number
  }
}

export interface PriceHistoryResponse {
  itemId: string
  productName: string
  history: Array<{
    date: string
    vendorId: string
    vendorName: string
    unitPrice: Money
    orderQuantity: number
    totalValue: Money
    prId: string
  }>
  trend: 'increasing' | 'decreasing' | 'stable'
  averagePrice: Money
}

// Filter types
export interface PurchaseRequestFilters {
  status?: PurchaseRequestStatus[]
  requesterId?: string[]
  departmentId?: string[]
  priority?: string[]
  search?: string
  minTotal?: number
  maxTotal?: number
  currency?: string
  createdAfter?: string
  createdBefore?: string
  requiredAfter?: string
  requiredBefore?: string
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus[]
  vendorId?: string[]
  buyerId?: string[]
  search?: string
  minTotal?: number
  maxTotal?: number
  currency?: string
  createdAfter?: string
  createdBefore?: string
  expectedAfter?: string
  expectedBefore?: string
}

// Create/Update request types
export interface CreatePurchaseRequestRequest {
  title: string
  description?: string
  requesterId: string
  departmentId: string
  locationId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requiredDate: string
  items: Array<{
    productId: string
    quantity: number
    unit: string
    estimatedUnitPrice?: Money
    notes?: string
    specifications?: Record<string, any>
  }>
  justification?: string
  notes?: string
  attachments?: string[]
}

export interface UpdatePurchaseRequestRequest extends Partial<CreatePurchaseRequestRequest> {
  id: string
}

export interface CreatePurchaseOrderRequest {
  purchaseRequestId?: string
  vendorId: string
  buyerId: string
  orderDate: string
  expectedDeliveryDate?: string
  deliveryAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    contactName?: string
    contactPhone?: string
  }
  paymentTerms?: string
  notes?: string
  items: Array<{
    productId: string
    quantity: number
    unit: string
    unitPrice: Money
    totalPrice: Money
    notes?: string
    specifications?: Record<string, any>
  }>
  termsAndConditions?: string[]
}

export interface UpdatePurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {
  id: string
}

// Procurement API Service
export class ProcurementApiService {
  // Purchase Request methods
  /**
   * Get all purchase requests with filtering and pagination
   */
  async getPurchaseRequests(
    filters?: PurchaseRequestFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PurchaseRequestListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<PurchaseRequestListResponse>('/purchase-requests', params)
  }

  /**
   * Get purchase request by ID
   */
  async getPurchaseRequest(id: string): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.get<PurchaseRequest>(`/purchase-requests/${id}`)
  }

  /**
   * Create new purchase request
   */
  async createPurchaseRequest(request: CreatePurchaseRequestRequest): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.post<PurchaseRequest>('/purchase-requests', request)
  }

  /**
   * Update existing purchase request
   */
  async updatePurchaseRequest(id: string, request: Partial<UpdatePurchaseRequestRequest>): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.put<PurchaseRequest>(`/purchase-requests/${id}`, request)
  }

  /**
   * Delete purchase request
   */
  async deletePurchaseRequest(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/purchase-requests/${id}`)
  }

  /**
   * Submit purchase request for approval
   */
  async submitPurchaseRequest(id: string): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.post<PurchaseRequest>(`/purchase-requests/${id}/submit`)
  }

  /**
   * Approve purchase request
   */
  async approvePurchaseRequest(
    id: string, 
    comment?: string
  ): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.post<PurchaseRequest>(`/purchase-requests/${id}/approve`, { comment })
  }

  /**
   * Reject purchase request
   */
  async rejectPurchaseRequest(
    id: string, 
    reason: string
  ): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.post<PurchaseRequest>(`/purchase-requests/${id}/reject`, { reason })
  }

  // Purchase Order methods
  /**
   * Get all purchase orders with filtering and pagination
   */
  async getPurchaseOrders(
    filters?: PurchaseOrderFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PurchaseOrderListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<PurchaseOrderListResponse>('/purchase-orders', params)
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrder(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`)
  }

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(order: CreatePurchaseOrderRequest): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>('/purchase-orders', order)
  }

  /**
   * Update existing purchase order
   */
  async updatePurchaseOrder(id: string, order: Partial<UpdatePurchaseOrderRequest>): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.put<PurchaseOrder>(`/purchase-orders/${id}`, order)
  }

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/purchase-orders/${id}`)
  }

  /**
   * Send purchase order to vendor
   */
  async sendPurchaseOrder(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/send`)
  }

  /**
   * Acknowledge purchase order receipt
   */
  async acknowledgePurchaseOrder(
    id: string, 
    expectedDate?: string, 
    notes?: string
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/acknowledge`, {
      expectedDate,
      notes
    })
  }

  // Purchase Request Item methods
  /**
   * Get vendor comparison for PR item
   */
  async getVendorComparison(itemId: string): Promise<ApiResponse<VendorComparisonResponse>> {
    return apiClient.get<VendorComparisonResponse>(`/purchase-requests/items/${itemId}/vendor-comparison`)
  }

  /**
   * Get price history for PR item
   */
  async getPriceHistory(itemId: string): Promise<ApiResponse<PriceHistoryResponse>> {
    return apiClient.get<PriceHistoryResponse>(`/purchase-requests/items/${itemId}/price-history`)
  }

  /**
   * Assign price to PR item
   */
  async assignPrice(
    itemId: string, 
    assignment: {
      vendorId: string
      unitPrice: Money
      leadTime?: number
      notes?: string
    }
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/purchase-requests/items/${itemId}/price-assignment`, assignment)
  }

  /**
   * Create price alert for PR item
   */
  async createPriceAlert(
    itemId: string,
    alert: {
      targetPrice: Money
      condition: 'below' | 'above'
      email: string
      expiresAt?: string
    }
  ): Promise<ApiResponse<{ alertId: string }>> {
    return apiClient.post<{ alertId: string }>(`/purchase-requests/items/${itemId}/price-alerts`, alert)
  }

  // Statistics and reporting
  /**
   * Get procurement statistics
   */
  async getProcurementStats(): Promise<ApiResponse<ProcurementStatsResponse>> {
    return apiClient.get<ProcurementStatsResponse>('/procurement/stats')
  }

  /**
   * Convert PR to PO
   */
  async convertToPurchaseOrder(
    prId: string,
    conversion: {
      vendorId: string
      selectedItems: string[]
      deliveryDate?: string
      notes?: string
    }
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(`/purchase-requests/${prId}/convert-to-po`, conversion)
  }

  /**
   * Bulk approve purchase requests
   */
  async bulkApprove(requestIds: string[], comment?: string): Promise<ApiResponse<{
    approved: number
    failed: string[]
  }>> {
    return apiClient.post('/purchase-requests/bulk-approve', {
      requestIds,
      comment
    })
  }

  /**
   * Export purchase requests to CSV/Excel
   */
  async exportPurchaseRequests(
    format: 'csv' | 'excel',
    filters?: PurchaseRequestFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = {
      format,
      ...filters
    }

    return apiClient.get<{ downloadUrl: string }>('/purchase-requests/export', params)
  }

  /**
   * Export purchase orders to CSV/Excel
   */
  async exportPurchaseOrders(
    format: 'csv' | 'excel',
    filters?: PurchaseOrderFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = {
      format,
      ...filters
    }

    return apiClient.get<{ downloadUrl: string }>('/purchase-orders/export', params)
  }
}

// Create singleton instance
export const procurementApi = new ProcurementApiService()

// Export types for external use
export type {
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
}