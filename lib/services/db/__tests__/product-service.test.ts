/**
 * Product Service Test Suite
 * 
 * Comprehensive tests for the product database service including
 * CRUD operations, inventory calculations, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ProductService, type CreateProductInput, type UpdateProductInput, type ProductFilters } from '../product-service'
import { InventoryCalculations } from '../../calculations/inventory-calculations'
import type { ProductType, ProductStatus } from '@/lib/types/product'
import type { Money } from '@/lib/types/common'

// Mock Prisma client
const mockPrismaClient = {
  products: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
  categories: {
    findUnique: vi.fn(),
  },
  product_specifications: {
    createMany: vi.fn(),
  },
  product_units: {
    createMany: vi.fn(),
  },
  product_metrics: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}

// Mock inventory calculations
vi.mock('../../calculations/inventory-calculations')

describe('ProductService', () => {
  let productService: ProductService
  let mockInventoryCalculations: jest.Mocked<InventoryCalculations>

  const mockCategory = {
    id: 'cat-1',
    name: 'Electronics',
    code: 'ELEC',
    description: 'Electronic components',
    parent_id: null,
    level: 1,
    is_active: true,
    display_order: 1,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user-1',
  }

  const mockProduct = {
    id: 'prod-1',
    product_code: 'RMEC123456',
    product_name: 'Test Product',
    display_name: 'Test Product Display',
    description: 'A test product description',
    short_description: 'Test product',
    product_type: 'raw_material' as const,
    status: 'active' as const,
    category_id: 'cat-1',
    subcategory_id: null,
    brand_id: null,
    manufacturer_id: null,
    base_unit: 'pcs',
    is_inventoried: true,
    is_serial_tracking_required: false,
    is_batch_tracking_required: false,
    shelf_life_days: null,
    storage_conditions: null,
    handling_instructions: null,
    is_purchasable: true,
    is_sellable: false,
    default_vendor_id: null,
    minimum_order_quantity: 10,
    maximum_order_quantity: 1000,
    standard_order_quantity: 100,
    lead_time_days: 7,
    standard_cost_amount: 25.50,
    standard_cost_currency: 'USD',
    last_purchase_cost_amount: null,
    last_purchase_cost_currency: null,
    average_cost_amount: null,
    average_cost_currency: null,
    weight: 0.5,
    weight_unit: 'kg',
    length: null,
    width: null,
    height: null,
    dimension_unit: null,
    color: 'Blue',
    material: 'Plastic',
    hazardous_classification: null,
    regulatory_approvals: ['CE', 'RoHS'],
    safety_data_sheet_url: null,
    keywords: ['electronic', 'component'],
    tags: ['test', 'sample'],
    notes: 'Test product notes',
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    created_by: 'user-1',
    updated_by: null,
    categories: mockCategory,
    brands: null,
    manufacturers: null,
    product_specifications: [],
    product_units: [],
    product_images: [],
    product_documents: [],
    product_metrics: null,
  }

  beforeEach(() => {
    productService = new ProductService(mockPrismaClient as any)
    mockInventoryCalculations = new InventoryCalculations() as jest.Mocked<InventoryCalculations>
    
    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getProducts', () => {
    it('should fetch products with default pagination', async () => {
      const mockProducts = [mockProduct]
      
      mockPrismaClient.products.findMany.mockResolvedValue(mockProducts)
      mockPrismaClient.products.count.mockResolvedValue(1)

      const result = await productService.getProducts()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.metadata).toEqual({
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      })

      expect(mockPrismaClient.products.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          product_specifications: false,
          product_units: true,
          product_images: false,
          categories: true,
          brands: true,
          manufacturers: true,
          product_metrics: true,
        },
        orderBy: {
          product_name: 'asc',
        },
        skip: 0,
        take: 50,
      })
    })

    it('should apply filters correctly', async () => {
      const filters: ProductFilters = {
        status: ['active'],
        productType: ['raw_material'],
        search: 'test',
        isInventoried: true,
        categoryId: ['cat-1'],
      }

      mockPrismaClient.products.findMany.mockResolvedValue([])
      mockPrismaClient.products.count.mockResolvedValue(0)

      await productService.getProducts(filters)

      const expectedWhereClause = expect.objectContaining({
        status: { in: ['active'] },
        product_type: { in: ['raw_material'] },
        is_inventoried: true,
        OR: expect.arrayContaining([
          expect.objectContaining({ category_id: { in: ['cat-1'] } }),
          expect.objectContaining({ subcategory_id: { in: ['cat-1'] } }),
          expect.objectContaining({ product_name: { contains: 'test', mode: 'insensitive' } }),
        ]),
      })

      expect(mockPrismaClient.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhereClause,
        })
      )
    })

    it('should handle price range filters', async () => {
      const filters: ProductFilters = {
        priceRange: {
          min: 10,
          max: 100,
          currency: 'USD',
        },
      }

      mockPrismaClient.products.findMany.mockResolvedValue([])
      mockPrismaClient.products.count.mockResolvedValue(0)

      await productService.getProducts(filters)

      expect(mockPrismaClient.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            standard_cost_amount: { gte: 10, lte: 100 },
          }),
        })
      )
    })
  })

  describe('getProductById', () => {
    it('should fetch product by ID successfully', async () => {
      mockPrismaClient.products.findUnique.mockResolvedValue(mockProduct)

      const result = await productService.getProductById('prod-1')

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('prod-1')
      expect(result.data?.productName).toBe('Test Product')

      expect(mockPrismaClient.products.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: {
          product_specifications: true,
          product_units: true,
          product_images: true,
          product_documents: true,
          categories: true,
          brands: true,
          manufacturers: true,
          product_metrics: true,
        },
      })
    })

    it('should return error when product not found', async () => {
      mockPrismaClient.products.findUnique.mockResolvedValue(null)

      const result = await productService.getProductById('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Product not found')
    })
  })

  describe('createProduct', () => {
    const createInput: CreateProductInput = {
      productName: 'New Product',
      description: 'A new product',
      productType: 'raw_material',
      categoryId: 'cat-1',
      baseUnit: 'pcs',
      standardCost: { amount: 50, currencyCode: 'USD' },
      createdBy: 'user-1',
    }

    it('should create product successfully', async () => {
      mockPrismaClient.categories.findUnique.mockResolvedValue(mockCategory)
      mockPrismaClient.products.findFirst.mockResolvedValue(null) // No existing product
      mockPrismaClient.products.create.mockResolvedValue(mockProduct)

      const result = await productService.createProduct(createInput)

      expect(result.success).toBe(true)
      expect(result.data?.productName).toBe('Test Product')

      expect(mockPrismaClient.products.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            product_name: 'New Product',
            product_type: 'raw_material',
            category_id: 'cat-1',
            base_unit: 'pcs',
            standard_cost_amount: 50,
            standard_cost_currency: 'USD',
            created_by: 'user-1',
          }),
        })
      )
    })

    it('should generate product code if not provided', async () => {
      mockPrismaClient.categories.findUnique.mockResolvedValue(mockCategory)
      mockPrismaClient.products.findFirst.mockResolvedValue(null)
      mockPrismaClient.products.create.mockResolvedValue(mockProduct)

      await productService.createProduct(createInput)

      expect(mockPrismaClient.products.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            product_code: expect.stringMatching(/^RM[A-Z]{2}\d{6}$/),
          }),
        })
      )
    })

    it('should return error when product code already exists', async () => {
      mockPrismaClient.categories.findUnique.mockResolvedValue(mockCategory)
      mockPrismaClient.products.findFirst.mockResolvedValue(mockProduct) // Existing product

      const result = await productService.createProduct({
        ...createInput,
        productCode: 'EXISTING-CODE',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Product with this code already exists')
    })

    it('should return error when category not found', async () => {
      mockPrismaClient.categories.findUnique.mockResolvedValue(null)

      const result = await productService.createProduct(createInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid category ID')
    })

    it('should create specifications and units when provided', async () => {
      const inputWithExtras: CreateProductInput = {
        ...createInput,
        specifications: [
          {
            name: 'Color',
            value: 'Blue',
            isRequired: true,
            displayOrder: 0,
          },
        ],
        alternativeUnits: [
          {
            unit: 'box',
            conversionFactor: 12,
            isPurchaseUnit: true,
            isActive: true,
            isSalesUnit: false,
            isInventoryUnit: false,
          },
        ],
      }

      mockPrismaClient.categories.findUnique.mockResolvedValue(mockCategory)
      mockPrismaClient.products.findFirst.mockResolvedValue(null)
      mockPrismaClient.products.create.mockResolvedValue(mockProduct)
      mockPrismaClient.product_specifications.createMany.mockResolvedValue({ count: 1 })
      mockPrismaClient.product_units.createMany.mockResolvedValue({ count: 1 })

      const result = await productService.createProduct(inputWithExtras)

      expect(result.success).toBe(true)
      expect(mockPrismaClient.product_specifications.createMany).toHaveBeenCalled()
      expect(mockPrismaClient.product_units.createMany).toHaveBeenCalled()
    })
  })

  describe('updateProduct', () => {
    const updateInput: UpdateProductInput = {
      productName: 'Updated Product',
      description: 'Updated description',
      standardCost: { amount: 75, currencyCode: 'USD' },
      updatedBy: 'user-2',
    }

    it('should update product successfully', async () => {
      mockPrismaClient.products.findUnique.mockResolvedValue(mockProduct)
      mockPrismaClient.products.update.mockResolvedValue({
        ...mockProduct,
        product_name: 'Updated Product',
      })

      const result = await productService.updateProduct('prod-1', updateInput)

      expect(result.success).toBe(true)
      expect(mockPrismaClient.products.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: expect.objectContaining({
          product_name: 'Updated Product',
          description: 'Updated description',
          standard_cost_amount: 75,
          standard_cost_currency: 'USD',
          updated_by: 'user-2',
        }),
        include: expect.any(Object),
      })
    })

    it('should return error when product not found', async () => {
      mockPrismaClient.products.findUnique.mockResolvedValue(null)

      const result = await productService.updateProduct('non-existent', updateInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Product not found')
    })
  })

  describe('deleteProduct', () => {
    it('should soft delete product successfully', async () => {
      mockPrismaClient.products.findUnique.mockResolvedValue(mockProduct)
      mockPrismaClient.products.update.mockResolvedValue({
        ...mockProduct,
        status: 'discontinued',
        is_active: false,
      })

      const result = await productService.deleteProduct('prod-1', 'user-2')

      expect(result.success).toBe(true)
      expect(mockPrismaClient.products.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          status: 'discontinued',
          is_active: false,
          updated_by: 'user-2',
          updated_at: expect.any(Date),
        },
      })
    })

    it('should return error when product not found', async () => {
      mockPrismaClient.products.findUnique.mockResolvedValue(null)

      const result = await productService.deleteProduct('non-existent', 'user-2')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Product not found')
    })
  })

  describe('calculateProductInventoryMetrics', () => {
    it('should calculate inventory metrics successfully', async () => {
      const mockValuationResult = {
        success: true,
        value: {
          itemId: 'prod-1',
          quantityOnHand: 150,
          unitCost: { amount: 25.50, currencyCode: 'USD' },
          totalValue: { amount: 3825, currencyCode: 'USD' },
          costingMethod: 'weighted_average' as const,
          lastCostUpdate: new Date(),
        },
      }

      const mockReorderResult = {
        success: true,
        value: {
          reorderPoint: 35,
          safetyStock: 15,
          leadTimeStock: 20,
          recommendedOrderQuantity: 100,
          reviewFrequencyDays: 30,
        },
      }

      mockInventoryCalculations.calculateStockValuation = vi.fn().mockResolvedValue(mockValuationResult)
      mockInventoryCalculations.calculateReorderPoint = vi.fn().mockResolvedValue(mockReorderResult)

      // Mock the service's inventoryCalculations property
      ;(productService as any).inventoryCalculations = mockInventoryCalculations

      const result = await productService.calculateProductInventoryMetrics('prod-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        currentStock: 150,
        averageCost: { amount: 25.50, currencyCode: 'USD' },
        totalValue: { amount: 3825, currencyCode: 'USD' },
        reorderPoint: 35,
        stockStatus: 'in_stock',
      })
    })

    it('should determine correct stock status', async () => {
      // Test out of stock
      const mockValuationResult = {
        success: true,
        value: {
          itemId: 'prod-1',
          quantityOnHand: 0,
          unitCost: { amount: 25.50, currencyCode: 'USD' },
          totalValue: { amount: 0, currencyCode: 'USD' },
          costingMethod: 'weighted_average' as const,
          lastCostUpdate: new Date(),
        },
      }

      mockInventoryCalculations.calculateStockValuation = vi.fn().mockResolvedValue(mockValuationResult)
      mockInventoryCalculations.calculateReorderPoint = vi.fn().mockResolvedValue({ success: true, value: { reorderPoint: 20 } })
      
      ;(productService as any).inventoryCalculations = mockInventoryCalculations

      const result = await productService.calculateProductInventoryMetrics('prod-1')

      expect(result.success).toBe(true)
      expect(result.data?.stockStatus).toBe('out_of_stock')
    })
  })

  describe('getProductStatistics', () => {
    it('should return product statistics', async () => {
      mockPrismaClient.products.count.mockResolvedValue(100)
      mockPrismaClient.products.groupBy
        .mockResolvedValueOnce([
          { status: 'active', _count: { status: 80 } },
          { status: 'inactive', _count: { status: 15 } },
          { status: 'discontinued', _count: { status: 5 } },
        ])
        .mockResolvedValueOnce([
          { product_type: 'raw_material', _count: { product_type: 60 } },
          { product_type: 'finished_good', _count: { product_type: 40 } },
        ])
        .mockResolvedValueOnce([
          { category_id: 'cat-1', _count: { category_id: 50 } },
          { category_id: 'cat-2', _count: { category_id: 50 } },
        ])

      mockPrismaClient.products.aggregate.mockResolvedValue({
        _sum: { standard_cost_amount: 10000 },
        _avg: { standard_cost_amount: 100 },
      })

      const result = await productService.getProductStatistics()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        total: 100,
        active: 80,
        inactive: 15,
        discontinued: 5,
        byType: {
          raw_material: 60,
          finished_good: 40,
        },
        byCategory: {
          'cat-1': 50,
          'cat-2': 50,
        },
        totalValue: { amount: 10000, currencyCode: 'USD' },
        averageValue: { amount: 100, currencyCode: 'USD' },
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrismaClient.products.findMany.mockRejectedValue(new Error('Database connection error'))

      const result = await productService.getProducts()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to fetch products')
    })

    it('should handle inventory calculation errors', async () => {
      mockInventoryCalculations.calculateStockValuation = vi.fn().mockResolvedValue({
        success: false,
        error: 'Calculation failed',
      })

      ;(productService as any).inventoryCalculations = mockInventoryCalculations

      const result = await productService.calculateProductInventoryMetrics('prod-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to calculate stock valuation')
    })
  })
})