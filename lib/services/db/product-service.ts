/**
 * Product Database Service
 * 
 * Complete product service layer that integrates database operations 
 * with calculation services for comprehensive product management.
 */

import { prisma, type PrismaClient } from '@/lib/db'
import { InventoryCalculations, type StockValuationInput, type ReorderPointInput, type ABCAnalysisInput } from '../calculations/inventory-calculations'
import type { 
  Product, 
  ProductType, 
  ProductStatus, 
  ProductSpecification,
  ProductUnit,
  ProductDimensions,
  ProductImage,
  ProductDocument,
  ProductCategory,
  ProductBrand,
  ProductManufacturer,
  ProductMetrics 
} from '@/lib/types/product'
import type { Money } from '@/lib/types/common'

/**
 * Database product representation (matching schema)
 */
export interface DbProduct {
  id: string
  product_code: string
  product_name: string
  display_name?: string | null
  description?: string | null
  short_description?: string | null
  product_type: 'raw_material' | 'finished_good' | 'semi_finished' | 'service' | 'asset' | 'consumable'
  status: 'active' | 'inactive' | 'discontinued' | 'pending_approval' | 'draft'
  category_id: string
  subcategory_id?: string | null
  brand_id?: string | null
  manufacturer_id?: string | null
  base_unit: string
  is_inventoried: boolean
  is_serial_tracking_required: boolean
  is_batch_tracking_required: boolean
  shelf_life_days?: number | null
  storage_conditions?: string | null
  handling_instructions?: string | null
  is_purchasable: boolean
  is_sellable: boolean
  default_vendor_id?: string | null
  minimum_order_quantity?: number | null
  maximum_order_quantity?: number | null
  standard_order_quantity?: number | null
  lead_time_days?: number | null
  standard_cost_amount?: number | null
  standard_cost_currency?: string | null
  last_purchase_cost_amount?: number | null
  last_purchase_cost_currency?: string | null
  average_cost_amount?: number | null
  average_cost_currency?: string | null
  weight?: number | null
  weight_unit?: string | null
  length?: number | null
  width?: number | null
  height?: number | null
  dimension_unit?: string | null
  color?: string | null
  material?: string | null
  hazardous_classification?: string | null
  regulatory_approvals?: string[] | null
  safety_data_sheet_url?: string | null
  keywords?: string[] | null
  tags?: string[] | null
  notes?: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by?: string | null
}

/**
 * Database product metrics representation
 */
export interface DbProductMetrics {
  product_id: string
  period_start: Date
  period_end: Date
  total_sales_amount: number
  total_sales_currency: string
  units_sold: number
  average_selling_price_amount: number
  average_selling_price_currency: string
  average_inventory_value_amount: number
  average_inventory_value_currency: string
  inventory_turnover: number
  stockout_days: number
  total_purchases_amount: number
  total_purchases_currency: string
  units_purchased: number
  average_purchase_price_amount: number
  average_purchase_price_currency: string
  supplier_count: number
  return_rate: number
  defect_rate: number
  customer_satisfaction_score?: number | null
  gross_margin_amount: number
  gross_margin_currency: string
  gross_margin_percentage: number
  roi: number
  last_updated: Date
}

/**
 * Product creation input
 */
export interface CreateProductInput {
  productCode?: string // Auto-generated if not provided
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
  specifications?: Omit<ProductSpecification, 'id'>[]
  baseUnit: string
  alternativeUnits?: Omit<ProductUnit, 'id' | 'productId'>[]
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

/**
 * Product update input
 */
export interface UpdateProductInput {
  productName?: string
  displayName?: string
  description?: string
  shortDescription?: string
  productType?: ProductType
  status?: ProductStatus
  categoryId?: string
  subcategoryId?: string
  brandId?: string
  manufacturerId?: string
  baseUnit?: string
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
  lastPurchaseCost?: Money
  averageCost?: Money
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
  updatedBy: string
}

/**
 * Product query filters
 */
export interface ProductFilters {
  status?: ProductStatus[]
  productType?: ProductType[]
  categoryId?: string[]
  brandId?: string[]
  manufacturerId?: string[]
  search?: string // Search in name, code, description, or keywords
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
  createdAfter?: Date
  createdBefore?: Date
  updatedAfter?: Date
  updatedBefore?: Date
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: 'product_name' | 'product_code' | 'created_at' | 'updated_at' | 'status' | 'category' | 'standard_cost'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

export class ProductService {
  private db: PrismaClient
  private inventoryCalculations: InventoryCalculations

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
    this.inventoryCalculations = new InventoryCalculations()
  }

  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts(
    filters: ProductFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<Product[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'product_name',
        sortOrder = 'asc'
      } = pagination

      const offset = (page - 1) * limit

      // Build where clause
      const whereClause: any = {}

      if (filters.status && filters.status.length > 0) {
        whereClause.status = {
          in: filters.status
        }
      }

      if (filters.productType && filters.productType.length > 0) {
        whereClause.product_type = {
          in: filters.productType
        }
      }

      if (filters.categoryId && filters.categoryId.length > 0) {
        whereClause.OR = [
          { category_id: { in: filters.categoryId } },
          { subcategory_id: { in: filters.categoryId } }
        ]
      }

      if (filters.brandId && filters.brandId.length > 0) {
        whereClause.brand_id = {
          in: filters.brandId
        }
      }

      if (filters.manufacturerId && filters.manufacturerId.length > 0) {
        whereClause.manufacturer_id = {
          in: filters.manufacturerId
        }
      }

      if (filters.search) {
        const searchConditions = [
          { product_name: { contains: filters.search, mode: 'insensitive' } },
          { product_code: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { short_description: { contains: filters.search, mode: 'insensitive' } },
        ]

        // Search in keywords array
        if (filters.search) {
          searchConditions.push({
            keywords: {
              has: filters.search
            }
          })
        }

        whereClause.OR = whereClause.OR ? [...whereClause.OR, ...searchConditions] : searchConditions
      }

      if (filters.isInventoried !== undefined) {
        whereClause.is_inventoried = filters.isInventoried
      }

      if (filters.isPurchasable !== undefined) {
        whereClause.is_purchasable = filters.isPurchasable
      }

      if (filters.isSellable !== undefined) {
        whereClause.is_sellable = filters.isSellable
      }

      if (filters.isActive !== undefined) {
        whereClause.is_active = filters.isActive
      }

      if (filters.priceRange) {
        const priceCondition: any = {}
        if (filters.priceRange.min !== undefined) {
          priceCondition.gte = filters.priceRange.min
        }
        if (filters.priceRange.max !== undefined) {
          priceCondition.lte = filters.priceRange.max
        }
        whereClause.standard_cost_amount = priceCondition
      }

      if (filters.createdAfter) {
        whereClause.created_at = { gte: filters.createdAfter }
      }

      if (filters.createdBefore) {
        whereClause.created_at = {
          ...whereClause.created_at,
          lte: filters.createdBefore
        }
      }

      if (filters.updatedAfter) {
        whereClause.updated_at = { gte: filters.updatedAfter }
      }

      if (filters.updatedBefore) {
        whereClause.updated_at = {
          ...whereClause.updated_at,
          lte: filters.updatedBefore
        }
      }

      // Execute queries
      const [products, total] = await Promise.all([
        this.db.products.findMany({
          where: whereClause,
          include: {
            product_specifications: filters.search ? true : false,
            product_units: true,
            product_images: filters.hasImages ? true : false,
            categories: true,
            brands: true,
            manufacturers: true,
            product_metrics: true
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip: offset,
          take: limit
        }),
        this.db.products.count({
          where: whereClause
        })
      ])

      // Transform to application format
      const transformedProducts = await Promise.all(
        products.map(async (dbProduct) => await this.transformDbProductToProduct(dbProduct))
      )

      return {
        success: true,
        data: transformedProducts,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get product by ID with calculated metrics and inventory data
   */
  async getProductById(id: string, includeMetrics: boolean = true): Promise<ServiceResult<Product>> {
    try {
      const dbProduct = await this.db.products.findUnique({
        where: { id },
        include: {
          product_specifications: true,
          product_units: true,
          product_images: true,
          product_documents: true,
          categories: true,
          brands: true,
          manufacturers: true,
          product_metrics: includeMetrics
        }
      })

      if (!dbProduct) {
        return {
          success: false,
          error: 'Product not found'
        }
      }

      const product = await this.transformDbProductToProduct(dbProduct)

      // Calculate enhanced inventory metrics if requested
      if (includeMetrics && product.isInventoried) {
        const inventoryMetrics = await this.calculateProductInventoryMetrics(id)
        if (inventoryMetrics.success && inventoryMetrics.data) {
          // Add calculated metrics to product
          product.averageCost = inventoryMetrics.data.averageCost
        }
      }

      return {
        success: true,
        data: product
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create new product
   */
  async createProduct(input: CreateProductInput): Promise<ServiceResult<Product>> {
    try {
      // Generate product code if not provided
      const productCode = input.productCode || await this.generateProductCode(input.categoryId, input.productType)

      // Check for existing product with same code
      const existingProduct = await this.db.products.findFirst({
        where: { product_code: productCode }
      })

      if (existingProduct) {
        return {
          success: false,
          error: 'Product with this code already exists'
        }
      }

      // Validate category exists
      const category = await this.db.categories.findUnique({
        where: { id: input.categoryId }
      })

      if (!category) {
        return {
          success: false,
          error: 'Invalid category ID'
        }
      }

      const dbProduct = await this.db.products.create({
        data: {
          product_code: productCode,
          product_name: input.productName,
          display_name: input.displayName,
          description: input.description,
          short_description: input.shortDescription,
          product_type: input.productType,
          status: input.status || 'active',
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          brand_id: input.brandId,
          manufacturer_id: input.manufacturerId,
          base_unit: input.baseUnit,
          is_inventoried: input.isInventoried ?? true,
          is_serial_tracking_required: input.isSerialTrackingRequired ?? false,
          is_batch_tracking_required: input.isBatchTrackingRequired ?? false,
          shelf_life_days: input.shelfLifeDays,
          storage_conditions: input.storageConditions,
          handling_instructions: input.handlingInstructions,
          is_purchasable: input.isPurchasable ?? true,
          is_sellable: input.isSellable ?? false,
          default_vendor_id: input.defaultVendorId,
          minimum_order_quantity: input.minimumOrderQuantity,
          maximum_order_quantity: input.maximumOrderQuantity,
          standard_order_quantity: input.standardOrderQuantity,
          lead_time_days: input.leadTimeDays,
          standard_cost_amount: input.standardCost?.amount,
          standard_cost_currency: input.standardCost?.currencyCode,
          weight: input.weight,
          weight_unit: input.weightUnit,
          length: input.dimensions?.length,
          width: input.dimensions?.width,
          height: input.dimensions?.height,
          dimension_unit: input.dimensions?.unit,
          color: input.color,
          material: input.material,
          hazardous_classification: input.hazardousClassification,
          regulatory_approvals: input.regulatoryApprovals,
          safety_data_sheet_url: input.safetyDataSheetUrl,
          keywords: input.keywords,
          tags: input.tags,
          notes: input.notes,
          created_by: input.createdBy
        },
        include: {
          categories: true,
          brands: true,
          manufacturers: true
        }
      })

      // Create specifications if provided
      if (input.specifications && input.specifications.length > 0) {
        await this.db.product_specifications.createMany({
          data: input.specifications.map((spec, index) => ({
            id: `spec-${dbProduct.id}-${index}`,
            product_id: dbProduct.id,
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            category: spec.category,
            is_required: spec.isRequired,
            display_order: spec.displayOrder || index
          }))
        })
      }

      // Create alternative units if provided
      if (input.alternativeUnits && input.alternativeUnits.length > 0) {
        await this.db.product_units.createMany({
          data: input.alternativeUnits.map((unit, index) => ({
            id: `unit-${dbProduct.id}-${index}`,
            product_id: dbProduct.id,
            unit: unit.unit,
            conversion_factor: unit.conversionFactor,
            is_active: unit.isActive ?? true,
            is_purchase_unit: unit.isPurchaseUnit ?? false,
            is_sales_unit: unit.isSalesUnit ?? false,
            is_inventory_unit: unit.isInventoryUnit ?? false,
            barcode: unit.barcode,
            notes: unit.notes
          }))
        })
      }

      const product = await this.transformDbProductToProduct(dbProduct)

      return {
        success: true,
        data: product
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<ServiceResult<Product>> {
    try {
      // Check if product exists
      const existingProduct = await this.db.products.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return {
          success: false,
          error: 'Product not found'
        }
      }

      const updateData: any = {}

      if (input.productName) updateData.product_name = input.productName
      if (input.displayName !== undefined) updateData.display_name = input.displayName
      if (input.description !== undefined) updateData.description = input.description
      if (input.shortDescription !== undefined) updateData.short_description = input.shortDescription
      if (input.productType) updateData.product_type = input.productType
      if (input.status) updateData.status = input.status
      if (input.categoryId) updateData.category_id = input.categoryId
      if (input.subcategoryId !== undefined) updateData.subcategory_id = input.subcategoryId
      if (input.brandId !== undefined) updateData.brand_id = input.brandId
      if (input.manufacturerId !== undefined) updateData.manufacturer_id = input.manufacturerId
      if (input.baseUnit) updateData.base_unit = input.baseUnit
      if (input.isInventoried !== undefined) updateData.is_inventoried = input.isInventoried
      if (input.isSerialTrackingRequired !== undefined) updateData.is_serial_tracking_required = input.isSerialTrackingRequired
      if (input.isBatchTrackingRequired !== undefined) updateData.is_batch_tracking_required = input.isBatchTrackingRequired
      if (input.shelfLifeDays !== undefined) updateData.shelf_life_days = input.shelfLifeDays
      if (input.storageConditions !== undefined) updateData.storage_conditions = input.storageConditions
      if (input.handlingInstructions !== undefined) updateData.handling_instructions = input.handlingInstructions
      if (input.isPurchasable !== undefined) updateData.is_purchasable = input.isPurchasable
      if (input.isSellable !== undefined) updateData.is_sellable = input.isSellable
      if (input.defaultVendorId !== undefined) updateData.default_vendor_id = input.defaultVendorId
      if (input.minimumOrderQuantity !== undefined) updateData.minimum_order_quantity = input.minimumOrderQuantity
      if (input.maximumOrderQuantity !== undefined) updateData.maximum_order_quantity = input.maximumOrderQuantity
      if (input.standardOrderQuantity !== undefined) updateData.standard_order_quantity = input.standardOrderQuantity
      if (input.leadTimeDays !== undefined) updateData.lead_time_days = input.leadTimeDays
      if (input.standardCost) {
        updateData.standard_cost_amount = input.standardCost.amount
        updateData.standard_cost_currency = input.standardCost.currencyCode
      }
      if (input.lastPurchaseCost) {
        updateData.last_purchase_cost_amount = input.lastPurchaseCost.amount
        updateData.last_purchase_cost_currency = input.lastPurchaseCost.currencyCode
      }
      if (input.averageCost) {
        updateData.average_cost_amount = input.averageCost.amount
        updateData.average_cost_currency = input.averageCost.currencyCode
      }
      if (input.weight !== undefined) updateData.weight = input.weight
      if (input.weightUnit !== undefined) updateData.weight_unit = input.weightUnit
      if (input.dimensions) {
        updateData.length = input.dimensions.length
        updateData.width = input.dimensions.width
        updateData.height = input.dimensions.height
        updateData.dimension_unit = input.dimensions.unit
      }
      if (input.color !== undefined) updateData.color = input.color
      if (input.material !== undefined) updateData.material = input.material
      if (input.hazardousClassification !== undefined) updateData.hazardous_classification = input.hazardousClassification
      if (input.regulatoryApprovals !== undefined) updateData.regulatory_approvals = input.regulatoryApprovals
      if (input.safetyDataSheetUrl !== undefined) updateData.safety_data_sheet_url = input.safetyDataSheetUrl
      if (input.keywords !== undefined) updateData.keywords = input.keywords
      if (input.tags !== undefined) updateData.tags = input.tags
      if (input.notes !== undefined) updateData.notes = input.notes
      if (input.updatedBy) updateData.updated_by = input.updatedBy

      const dbProduct = await this.db.products.update({
        where: { id },
        data: updateData,
        include: {
          product_specifications: true,
          product_units: true,
          product_images: true,
          product_documents: true,
          categories: true,
          brands: true,
          manufacturers: true,
          product_metrics: true
        }
      })

      const product = await this.transformDbProductToProduct(dbProduct)

      return {
        success: true,
        data: product
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Soft delete product (mark as inactive)
   */
  async deleteProduct(id: string, deletedBy: string): Promise<ServiceResult<boolean>> {
    try {
      const existingProduct = await this.db.products.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return {
          success: false,
          error: 'Product not found'
        }
      }

      await this.db.products.update({
        where: { id },
        data: { 
          status: 'discontinued',
          is_active: false,
          updated_by: deletedBy,
          updated_at: new Date()
        }
      })

      return {
        success: true,
        data: true
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Calculate comprehensive product inventory metrics
   */
  async calculateProductInventoryMetrics(productId: string): Promise<ServiceResult<{
    currentStock: number
    averageCost?: Money
    totalValue?: Money
    reorderPoint?: number
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  }>> {
    try {
      // In a real implementation, this would fetch from inventory tables
      // For demonstration, we'll create mock inventory data
      const mockInventoryData = {
        quantityOnHand: 150,
        averageCost: { amount: 25.50, currencyCode: 'USD' },
        transactions: [
          {
            date: new Date('2024-01-15'),
            quantity: 100,
            unitCost: { amount: 24.00, currencyCode: 'USD' },
            transactionType: 'purchase'
          },
          {
            date: new Date('2024-02-01'),
            quantity: 50,
            unitCost: { amount: 27.00, currencyCode: 'USD' },
            transactionType: 'purchase'
          }
        ]
      }

      const stockValuationInput: StockValuationInput = {
        itemId: productId,
        quantityOnHand: mockInventoryData.quantityOnHand,
        costingMethod: 'weighted_average',
        averageCost: mockInventoryData.averageCost
      }

      const valuationResult = await this.inventoryCalculations.calculateStockValuation(stockValuationInput)
      
      if (!valuationResult.success || !valuationResult.value) {
        return {
          success: false,
          error: 'Failed to calculate stock valuation'
        }
      }

      // Calculate reorder point
      const reorderPointInput: ReorderPointInput = {
        averageMonthlyUsage: 30,
        leadTimeDays: 7,
        safetyStockDays: 3
      }

      const reorderResult = await this.inventoryCalculations.calculateReorderPoint(reorderPointInput)
      
      // Determine stock status
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock' = 'in_stock'
      const currentStock = mockInventoryData.quantityOnHand
      const reorderPoint = reorderResult.success ? reorderResult.value?.reorderPoint : 20

      if (currentStock === 0) {
        stockStatus = 'out_of_stock'
      } else if (currentStock <= (reorderPoint || 20)) {
        stockStatus = 'low_stock'
      } else if (currentStock > 500) {
        stockStatus = 'overstock'
      }

      return {
        success: true,
        data: {
          currentStock,
          averageCost: valuationResult.value.unitCost,
          totalValue: valuationResult.value.totalValue,
          reorderPoint: reorderResult.success ? reorderResult.value?.reorderPoint : undefined,
          stockStatus
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate inventory metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get product statistics for dashboard
   */
  async getProductStatistics(): Promise<ServiceResult<{
    total: number
    active: number
    inactive: number
    discontinued: number
    byType: Record<string, number>
    byCategory: Record<string, number>
    totalValue?: Money
    averageValue?: Money
  }>> {
    try {
      const [total, statusCounts, typeCounts, categoryCounts] = await Promise.all([
        this.db.products.count(),
        this.db.products.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        this.db.products.groupBy({
          by: ['product_type'],
          _count: { product_type: true }
        }),
        this.db.products.groupBy({
          by: ['category_id'],
          _count: { category_id: true },
          _max: { standard_cost_amount: true }
        })
      ])

      // Calculate total and average values
      const valueAggregation = await this.db.products.aggregate({
        _sum: { standard_cost_amount: true },
        _avg: { standard_cost_amount: true },
        where: {
          standard_cost_amount: { not: null },
          standard_cost_currency: { not: null }
        }
      })

      const stats = {
        total,
        active: statusCounts.find(s => s.status === 'active')?._count.status || 0,
        inactive: statusCounts.find(s => s.status === 'inactive')?._count.status || 0,
        discontinued: statusCounts.find(s => s.status === 'discontinued')?._count.status || 0,
        byType: typeCounts.reduce((acc, item) => {
          acc[item.product_type] = item._count.product_type
          return acc
        }, {} as Record<string, number>),
        byCategory: categoryCounts.reduce((acc, item) => {
          acc[item.category_id] = item._count.category_id
          return acc
        }, {} as Record<string, number>),
        totalValue: valueAggregation._sum.standard_cost_amount 
          ? { amount: valueAggregation._sum.standard_cost_amount, currencyCode: 'USD' }
          : undefined,
        averageValue: valueAggregation._avg.standard_cost_amount
          ? { amount: valueAggregation._avg.standard_cost_amount, currencyCode: 'USD' }
          : undefined
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get product statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate product code based on category and type
   */
  private async generateProductCode(categoryId: string, productType: ProductType): Promise<string> {
    const category = await this.db.categories.findUnique({
      where: { id: categoryId }
    })

    const typePrefix = {
      raw_material: 'RM',
      finished_good: 'FG',
      semi_finished: 'SF',
      service: 'SV',
      asset: 'AS',
      consumable: 'CN'
    }[productType] || 'PR'

    const categoryPrefix = category?.name.substring(0, 2).toUpperCase() || 'GN'
    const timestamp = Date.now().toString().slice(-6)
    
    return `${typePrefix}${categoryPrefix}${timestamp}`
  }

  /**
   * Transform database product to application product format
   */
  private async transformDbProductToProduct(dbProduct: any): Promise<Product> {
    // Convert specifications
    const specifications: ProductSpecification[] = (dbProduct.product_specifications || []).map((spec: any) => ({
      id: spec.id,
      name: spec.name,
      value: spec.value,
      unit: spec.unit,
      category: spec.category,
      isRequired: spec.is_required,
      displayOrder: spec.display_order
    }))

    // Convert units
    const alternativeUnits: ProductUnit[] = (dbProduct.product_units || []).map((unit: any) => ({
      id: unit.id,
      productId: unit.product_id,
      unit: unit.unit,
      conversionFactor: unit.conversion_factor,
      isActive: unit.is_active,
      isPurchaseUnit: unit.is_purchase_unit,
      isSalesUnit: unit.is_sales_unit,
      isInventoryUnit: unit.is_inventory_unit,
      barcode: unit.barcode,
      notes: unit.notes
    }))

    // Convert images
    const images: ProductImage[] = (dbProduct.product_images || []).map((img: any) => ({
      id: img.id,
      productId: img.product_id,
      imageUrl: img.image_url,
      thumbnailUrl: img.thumbnail_url,
      altText: img.alt_text,
      isPrimary: img.is_primary,
      displayOrder: img.display_order,
      imageType: img.image_type,
      uploadedBy: img.uploaded_by,
      uploadedAt: img.uploaded_at
    }))

    // Convert documents
    const documents: ProductDocument[] = (dbProduct.product_documents || []).map((doc: any) => ({
      id: doc.id,
      productId: doc.product_id,
      documentName: doc.document_name,
      documentUrl: doc.document_url,
      documentType: doc.document_type,
      version: doc.version,
      language: doc.language,
      isPublic: doc.is_public,
      uploadedBy: doc.uploaded_by,
      uploadedAt: doc.uploaded_at
    }))

    // Build dimensions if available
    let dimensions: ProductDimensions | undefined
    if (dbProduct.length || dbProduct.width || dbProduct.height) {
      dimensions = {
        length: dbProduct.length || 0,
        width: dbProduct.width || 0,
        height: dbProduct.height || 0,
        unit: dbProduct.dimension_unit || 'cm',
        volume: dbProduct.length && dbProduct.width && dbProduct.height 
          ? (dbProduct.length * dbProduct.width * dbProduct.height) 
          : undefined,
        volumeUnit: dbProduct.dimension_unit === 'cm' ? 'cm³' : 'in³'
      }
    }

    const product: Product = {
      id: dbProduct.id,
      productCode: dbProduct.product_code,
      productName: dbProduct.product_name,
      displayName: dbProduct.display_name || undefined,
      description: dbProduct.description || undefined,
      shortDescription: dbProduct.short_description || undefined,
      productType: dbProduct.product_type,
      status: dbProduct.status,
      categoryId: dbProduct.category_id,
      subcategoryId: dbProduct.subcategory_id || undefined,
      brandId: dbProduct.brand_id || undefined,
      manufacturerId: dbProduct.manufacturer_id || undefined,
      specifications,
      baseUnit: dbProduct.base_unit,
      alternativeUnits,
      isInventoried: dbProduct.is_inventoried,
      isSerialTrackingRequired: dbProduct.is_serial_tracking_required,
      isBatchTrackingRequired: dbProduct.is_batch_tracking_required,
      shelfLifeDays: dbProduct.shelf_life_days || undefined,
      storageConditions: dbProduct.storage_conditions || undefined,
      handlingInstructions: dbProduct.handling_instructions || undefined,
      isPurchasable: dbProduct.is_purchasable,
      isSellable: dbProduct.is_sellable,
      defaultVendorId: dbProduct.default_vendor_id || undefined,
      minimumOrderQuantity: dbProduct.minimum_order_quantity || undefined,
      maximumOrderQuantity: dbProduct.maximum_order_quantity || undefined,
      standardOrderQuantity: dbProduct.standard_order_quantity || undefined,
      leadTimeDays: dbProduct.lead_time_days || undefined,
      standardCost: dbProduct.standard_cost_amount && dbProduct.standard_cost_currency 
        ? { amount: dbProduct.standard_cost_amount, currencyCode: dbProduct.standard_cost_currency }
        : undefined,
      lastPurchaseCost: dbProduct.last_purchase_cost_amount && dbProduct.last_purchase_cost_currency
        ? { amount: dbProduct.last_purchase_cost_amount, currencyCode: dbProduct.last_purchase_cost_currency }
        : undefined,
      averageCost: dbProduct.average_cost_amount && dbProduct.average_cost_currency
        ? { amount: dbProduct.average_cost_amount, currencyCode: dbProduct.average_cost_currency }
        : undefined,
      weight: dbProduct.weight || undefined,
      weightUnit: dbProduct.weight_unit || undefined,
      dimensions,
      color: dbProduct.color || undefined,
      material: dbProduct.material || undefined,
      hazardousClassification: dbProduct.hazardous_classification || undefined,
      regulatoryApprovals: dbProduct.regulatory_approvals || [],
      safetyDataSheetUrl: dbProduct.safety_data_sheet_url || undefined,
      images,
      documents,
      relatedProducts: [], // Would be populated from relations table
      substitutes: [], // Would be populated from relations table
      accessories: [], // Would be populated from relations table
      keywords: dbProduct.keywords || [],
      tags: dbProduct.tags || [],
      notes: dbProduct.notes || undefined,
      isActive: dbProduct.is_active,
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at,
      createdBy: dbProduct.created_by,
      updatedBy: dbProduct.updated_by || undefined
    }

    return product
  }
}

// Export singleton instance
export const productService = new ProductService()