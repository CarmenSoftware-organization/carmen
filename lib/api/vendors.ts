/**
 * Vendor API Service
 * 
 * Handles all vendor-related API operations including:
 * - CRUD operations for vendors
 * - Vendor filtering and pagination
 * - Vendor metrics and statistics
 */

import { apiClient, type ApiResponse, type PaginationParams } from './client'
import { type Vendor, type VendorStatus, type VendorBusinessType } from '@/lib/types/vendor'

// API response types
export interface VendorListResponse {
  vendors: Vendor[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface VendorStatsResponse {
  totalVendors: number
  activeVendors: number
  inactiveVendors: number
  pendingApproval: number
  averageRating: number
  topPerformingVendors: Vendor[]
}

export interface VendorMetricsResponse {
  id: string
  totalOrders: number
  totalValue: number
  averageOrderValue: number
  onTimeDeliveryRate: number
  qualityRating: number
  responseTime: number
  lastOrderDate: string | null
  preferredCurrency: string
}

// Filter types
export interface VendorFilters {
  status?: VendorStatus[]
  businessType?: VendorBusinessType[]
  search?: string
  preferredCurrency?: string[]
  hasMetrics?: boolean
  createdAfter?: string
  createdBefore?: string
}

// Create vendor request type
export interface CreateVendorRequest {
  name: string
  contactEmail: string
  contactPhone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  status?: VendorStatus
  preferredCurrency?: string
  paymentTerms?: string
  companyRegistration?: string
  taxId?: string
  website?: string
  businessType?: VendorBusinessType
  certifications?: string[]
  languages?: string[]
  notes?: string
  createdBy: string
}

export interface UpdateVendorRequest extends Partial<Omit<Vendor, 'id' | 'addresses' | 'contacts' | 'certifications' | 'bankAccounts'>> {
  id: string
}

// Vendor API Service
export class VendorApiService {
  /**
   * Get all vendors with filtering and pagination
   */
  async getVendors(
    filters?: VendorFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<VendorListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<VendorListResponse>('/vendors', params)
  }

  /**
   * Get vendor by ID
   */
  async getVendor(id: string): Promise<ApiResponse<Vendor>> {
    return apiClient.get<Vendor>(`/vendors/${id}`)
  }

  /**
   * Create new vendor
   */
  async createVendor(vendor: CreateVendorRequest): Promise<ApiResponse<Vendor>> {
    return apiClient.post<Vendor>('/vendors', vendor)
  }

  /**
   * Update existing vendor
   */
  async updateVendor(id: string, vendor: Partial<UpdateVendorRequest>): Promise<ApiResponse<Vendor>> {
    return apiClient.put<Vendor>(`/vendors/${id}`, vendor)
  }

  /**
   * Delete vendor
   */
  async deleteVendor(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/vendors/${id}`)
  }

  /**
   * Get vendor statistics
   */
  async getVendorStats(): Promise<ApiResponse<VendorStatsResponse>> {
    return apiClient.get<VendorStatsResponse>('/vendors/stats')
  }

  /**
   * Get vendor metrics
   */
  async getVendorMetrics(id: string): Promise<ApiResponse<VendorMetricsResponse>> {
    return apiClient.get<VendorMetricsResponse>(`/vendors/${id}/metrics`)
  }

  /**
   * Bulk update vendor statuses
   */
  async bulkUpdateStatus(
    vendorIds: string[], 
    status: VendorStatus
  ): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    return apiClient.post<{ updated: number; failed: string[] }>('/vendors/bulk-status', {
      vendorIds,
      status
    })
  }

  /**
   * Export vendors to CSV/Excel
   */
  async exportVendors(
    format: 'csv' | 'excel',
    filters?: VendorFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = {
      format,
      ...filters
    }

    return apiClient.get<{ downloadUrl: string }>('/vendors/export', params)
  }

  /**
   * Import vendors from file
   */
  async importVendors(file: File): Promise<ApiResponse<{
    imported: number
    failed: number
    errors: Array<{ row: number; error: string }>
  }>> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post('/vendors/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// Create singleton instance
export const vendorApi = new VendorApiService()