/**
 * Product API Service
 * 
 * Handles all product-related API operations including:
 * - CRUD operations for products
 * - Product filtering and pagination
 * - Product inventory and statistics
 */

import { apiClient, type ApiResponse, type PaginationParams } from './client'
import { type Product, type ProductType, type ProductStatus } from '@/lib/types/product'
import { type Money } from '@/lib/types/common'

// API response types
export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface ProductStatsResponse {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  averageValue: Money
  topSellingProducts: Product[]
  recentlyAddedProducts: Product[]
}

export interface ProductInventoryResponse {
  productId: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  averageUsage: number
  lastRestocked: string | null
  projectedRunoutDate: string | null
  locations: Array<{
    locationId: string
    locationName: string
    quantity: number
    reserved: number
    available: number
  }>
}

// Filter types
export interface ProductFilters {
  status?: ProductStatus[]
  productType?: ProductType[]
  categoryId?: string[]
  brandId?: string[]
  manufacturerId?: string[]
  search?: string
  isInventoried?: boolean
  isPurchasable?: boolean
  isSellable?: boolean
  isActive?: boolean
  hasStock?: boolean
  hasImages?: boolean
  priceRange?: {
    min?: number
    max?: number
    currency?: string
  }
  createdAfter?: string
  createdBefore?: string
  updatedAfter?: string
  updatedBefore?: string
}

// Product specifications
export interface ProductSpecification {
  name: string
  value: string
  unit?: string
  category?: string
  isRequired?: boolean
  displayOrder?: number
}

// Product units
export interface ProductUnit {
  unit: string
  conversionFactor: number
  isActive?: boolean
  isPurchaseUnit?: boolean
  isSalesUnit?: boolean
  isInventoryUnit?: boolean
  barcode?: string
  notes?: string
}

// Product dimensions
export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: string
}

// Create product request type
export interface CreateProductRequest {
  productCode?: string
  productName: string
  displayName?: string
  description?: string
  shortDescription?: string
  productType: ProductType
  status?: ProductStatus
  categoryId: string
  subcategoryId?: string
  brandId?: string
  manufacturerId?: string
  specifications?: ProductSpecification[]
  baseUnit: string
  alternativeUnits?: ProductUnit[]
  isInventoried?: boolean
  isSerialTrackingRequired?: boolean
  isBatchTrackingRequired?: boolean
  shelfLifeDays?: number
  storageConditions?: string
  handlingInstructions?: string
  isPurchasable?: boolean
  isSellable?: boolean
  defaultVendorId?: string
  minimumOrderQuantity?: number
  maximumOrderQuantity?: number
  standardOrderQuantity?: number
  leadTimeDays?: number
  standardCost?: Money
  weight?: number
  weightUnit?: string
  dimensions?: ProductDimensions
  color?: string
  material?: string
  hazardousClassification?: string
  regulatoryApprovals?: string[]
  safetyDataSheetUrl?: string
  keywords?: string[]
  tags?: string[]
  notes?: string
  createdBy: string
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string
}

// Product API Service
export class ProductApiService {
  /**
   * Get all products with filtering and pagination
   */
  async getProducts(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<ProductListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<ProductListResponse>('/products', params)
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`)
  }

  /**
   * Create new product
   */
  async createProduct(product: CreateProductRequest): Promise<ApiResponse<Product>> {
    return apiClient.post<Product>('/products', product)
  }

  /**
   * Update existing product
   */
  async updateProduct(id: string, product: Partial<UpdateProductRequest>): Promise<ApiResponse<Product>> {
    return apiClient.put<Product>(`/products/${id}`, product)
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/products/${id}`)
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<ApiResponse<ProductStatsResponse>> {
    return apiClient.get<ProductStatsResponse>('/products/stats')
  }

  /**
   * Get product inventory details
   */
  async getProductInventory(id: string): Promise<ApiResponse<ProductInventoryResponse>> {
    return apiClient.get<ProductInventoryResponse>(`/products/${id}/inventory`)
  }

  /**
   * Update product inventory levels
   */
  async updateInventory(
    id: string, 
    inventory: {
      minimumStock?: number
      maximumStock?: number
      reorderPoint?: number
      currentStock?: number
    }
  ): Promise<ApiResponse<ProductInventoryResponse>> {
    return apiClient.patch<ProductInventoryResponse>(`/products/${id}/inventory`, inventory)
  }

  /**
   * Bulk update product statuses
   */
  async bulkUpdateStatus(
    productIds: string[], 
    status: ProductStatus
  ): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    return apiClient.post<{ updated: number; failed: string[] }>('/products/bulk-status', {
      productIds,
      status
    })
  }

  /**
   * Bulk update product prices
   */
  async bulkUpdatePrices(
    updates: Array<{
      productId: string
      standardCost: Money
    }>
  ): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    return apiClient.post<{ updated: number; failed: string[] }>('/products/bulk-prices', {
      updates
    })
  }

  /**
   * Search products by text
   */
  async searchProducts(
    query: string,
    filters?: Partial<ProductFilters>
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>('/products/search', {
      q: query,
      ...filters
    })
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<ProductListResponse>> {
    return apiClient.get<ProductListResponse>(`/products/category/${categoryId}`, pagination)
  }

  /**
   * Get products by vendor
   */
  async getProductsByVendor(
    vendorId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<ProductListResponse>> {
    return apiClient.get<ProductListResponse>(`/products/vendor/${vendorId}`, pagination)
  }

  /**
   * Export products to CSV/Excel
   */
  async exportProducts(
    format: 'csv' | 'excel',
    filters?: ProductFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = {
      format,
      ...filters
    }

    return apiClient.get<{ downloadUrl: string }>('/products/export', params)
  }

  /**
   * Import products from file
   */
  async importProducts(file: File): Promise<ApiResponse<{
    imported: number
    failed: number
    errors: Array<{ row: number; error: string }>
  }>> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Generate product barcode
   */
  async generateBarcode(id: string): Promise<ApiResponse<{ barcode: string }>> {
    return apiClient.post<{ barcode: string }>(`/products/${id}/barcode`)
  }

  /**
   * Upload product images
   */
  async uploadImages(
    id: string, 
    images: File[]
  ): Promise<ApiResponse<{ uploadedImages: Array<{ id: string; url: string }> }>> {
    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append(`image-${index}`, image)
    })

    return apiClient.post(`/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// Create singleton instance
export const productApi = new ProductApiService()