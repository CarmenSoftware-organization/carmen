/**
 * POS Integration - Mappings API Service
 *
 * Handles all POS item to recipe mapping operations including:
 * - Mapping CRUD operations
 * - Recipe search and selection
 * - Mapping preview and validation
 * - Unmapped items tracking
 */

import { apiClient, type ApiResponse, type PaginationParams } from './client'
import {
  type POSMapping,
  type POSItem,
  type RecipeSearchResult,
  type MappingPreview
} from '@/lib/types'

// API response types
export interface MappingListResponse {
  mappings: POSMapping[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface UnmappedItemsListResponse {
  items: POSItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface RecipeSearchResponse {
  recipes: RecipeSearchResult[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface MappingStatsResponse {
  totalItems: number
  mappedItems: number
  unmappedItems: number
  mappingRate: number
  recentlyMapped: number
  needsReview: number
}

// Filter types
export interface MappingFilters {
  isActive?: boolean
  category?: string[]
  recipeCategory?: string[]
  searchQuery?: string
  mappedBy?: string[]
  mappedAfter?: string
  mappedBefore?: string
  verifiedAfter?: string
}

export interface RecipeSearchFilters {
  category?: string[]
  cuisineType?: string[]
  searchQuery?: string
  minCost?: number
  maxCost?: number
}

// Request types
export interface CreateMappingRequest {
  posItemId: string
  posItemName: string
  posItemCategory: string
  recipeId: string
  recipeName: string
  recipeCategory: string
  portionSize: number
  unit: string
  costOverride?: number
  notes?: string
}

export interface UpdateMappingRequest extends Partial<CreateMappingRequest> {
  id: string
  isActive?: boolean
}

export interface BulkMappingRequest {
  mappings: Array<{
    posItemId: string
    recipeId: string
    portionSize: number
    unit: string
  }>
  notes?: string
}

// POS Mappings API Service
export class POSMappingsApiService {
  /**
   * Get all mappings with filtering and pagination
   */
  async getMappings(
    filters?: MappingFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<MappingListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<MappingListResponse>('/pos/mappings', params)
  }

  /**
   * Get mapping by ID
   */
  async getMapping(id: string): Promise<ApiResponse<POSMapping>> {
    return apiClient.get<POSMapping>(`/pos/mappings/${id}`)
  }

  /**
   * Get mapping by POS item ID
   */
  async getMappingByPOSItemId(posItemId: string): Promise<ApiResponse<POSMapping>> {
    return apiClient.get<POSMapping>(`/pos/mappings/pos-item/${posItemId}`)
  }

  /**
   * Get all unmapped POS items
   */
  async getUnmappedItems(
    pagination?: PaginationParams
  ): Promise<ApiResponse<UnmappedItemsListResponse>> {
    return apiClient.get<UnmappedItemsListResponse>('/pos/mappings/unmapped', pagination)
  }

  /**
   * Search recipes for mapping
   */
  async searchRecipes(
    query: string,
    filters?: RecipeSearchFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<RecipeSearchResponse>> {
    const params = {
      searchQuery: query,
      ...filters,
      ...pagination
    }

    return apiClient.get<RecipeSearchResponse>('/pos/mappings/recipes/search', params)
  }

  /**
   * Get mapping preview (cost breakdown, ingredient deductions)
   */
  async getMappingPreview(
    posItemId: string,
    recipeId: string,
    portionSize: number,
    unit: string
  ): Promise<ApiResponse<MappingPreview>> {
    const params = {
      posItemId,
      recipeId,
      portionSize,
      unit
    }

    return apiClient.get<MappingPreview>('/pos/mappings/preview', params)
  }

  /**
   * Create new mapping
   */
  async createMapping(request: CreateMappingRequest): Promise<ApiResponse<POSMapping>> {
    return apiClient.post<POSMapping>('/pos/mappings', request)
  }

  /**
   * Update existing mapping
   */
  async updateMapping(
    id: string,
    request: Partial<UpdateMappingRequest>
  ): Promise<ApiResponse<POSMapping>> {
    return apiClient.put<POSMapping>(`/pos/mappings/${id}`, request)
  }

  /**
   * Delete mapping (soft delete - sets isActive to false)
   */
  async deleteMapping(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/pos/mappings/${id}`)
  }

  /**
   * Activate/deactivate mapping
   */
  async toggleMappingActive(id: string, isActive: boolean): Promise<ApiResponse<POSMapping>> {
    return apiClient.patch<POSMapping>(`/pos/mappings/${id}/toggle`, { isActive })
  }

  /**
   * Verify mapping (updates lastVerifiedAt)
   */
  async verifyMapping(id: string): Promise<ApiResponse<POSMapping>> {
    return apiClient.post<POSMapping>(`/pos/mappings/${id}/verify`)
  }

  /**
   * Get mapping statistics
   */
  async getMappingStats(): Promise<ApiResponse<MappingStatsResponse>> {
    return apiClient.get<MappingStatsResponse>('/pos/mappings/stats')
  }

  /**
   * Bulk create mappings
   */
  async bulkCreateMappings(
    request: BulkMappingRequest
  ): Promise<ApiResponse<{
    successful: number
    failed: Array<{
      posItemId: string
      reason: string
    }>
  }>> {
    return apiClient.post('/pos/mappings/bulk-create', request)
  }

  /**
   * Bulk verify mappings
   */
  async bulkVerifyMappings(mappingIds: string[]): Promise<ApiResponse<{
    successful: number
    failed: string[]
  }>> {
    return apiClient.post('/pos/mappings/bulk-verify', { mappingIds })
  }

  /**
   * Bulk delete mappings
   */
  async bulkDeleteMappings(mappingIds: string[]): Promise<ApiResponse<{
    successful: number
    failed: string[]
  }>> {
    return apiClient.post('/pos/mappings/bulk-delete', { mappingIds })
  }

  /**
   * Get mappings by recipe ID
   */
  async getMappingsByRecipeId(recipeId: string): Promise<ApiResponse<POSMapping[]>> {
    return apiClient.get<POSMapping[]>(`/pos/mappings/recipe/${recipeId}`)
  }

  /**
   * Get mappings by category
   */
  async getMappingsByCategory(
    category: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<MappingListResponse>> {
    const params = {
      category: [category],
      ...pagination
    }

    return apiClient.get<MappingListResponse>('/pos/mappings', params)
  }

  /**
   * Export mappings to CSV/Excel
   */
  async exportMappings(
    format: 'csv' | 'excel',
    filters?: MappingFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = {
      format,
      ...filters
    }

    return apiClient.get<{ downloadUrl: string }>('/pos/mappings/export', params)
  }

  /**
   * Import mappings from CSV/Excel
   */
  async importMappings(
    file: File,
    validateOnly: boolean = false
  ): Promise<ApiResponse<{
    valid: number
    invalid: Array<{
      row: number
      errors: string[]
    }>
    imported?: number
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('validateOnly', validateOnly.toString())

    return apiClient.post('/pos/mappings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Get mapping template for import
   */
  async getMappingTemplate(format: 'csv' | 'excel'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get<{ downloadUrl: string }>(`/pos/mappings/template/${format}`)
  }

  /**
   * Sync POS items from POS system
   */
  async syncPOSItems(): Promise<ApiResponse<{
    newItems: number
    updatedItems: number
    removedItems: number
  }>> {
    return apiClient.post('/pos/mappings/sync-items')
  }

  /**
   * Get recipe suggestions for unmapped POS item (ML-based)
   */
  async getRecipeSuggestions(posItemId: string): Promise<ApiResponse<RecipeSearchResult[]>> {
    return apiClient.get<RecipeSearchResult[]>(`/pos/mappings/pos-item/${posItemId}/suggestions`)
  }
}

// Create singleton instance
export const posMappingsApi = new POSMappingsApiService()

// Export types for external use
export type {
  MappingListResponse,
  UnmappedItemsListResponse,
  RecipeSearchResponse,
  MappingStatsResponse,
  MappingFilters,
  RecipeSearchFilters,
  CreateMappingRequest,
  UpdateMappingRequest,
  BulkMappingRequest
}
