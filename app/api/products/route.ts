/**
 * Product API Routes - Main product management endpoints
 * 
 * GET /api/products - List all products with filtering and pagination
 * POST /api/products - Create new product
 * 
 * Security Features:
 * - JWT authentication required
 * - Role-based access control (RBAC)
 * - Rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { productService, type ProductFilters, type PaginationOptions } from '@/lib/services/db/product-service'
import { type ProductType, type ProductStatus } from '@/lib/types/product'
import { authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Security-enhanced validation schemas
const productFiltersSchema = z.object({
  status: z.array(z.enum(['active', 'inactive', 'discontinued', 'pending_approval', 'draft'])).optional(),
  productType: z.array(z.enum(['raw_material', 'finished_good', 'semi_finished', 'service', 'asset', 'consumable'])).optional(),
  categoryId: z.array(SecureSchemas.uuid).optional(),
  brandId: z.array(SecureSchemas.uuid).optional(),
  manufacturerId: z.array(SecureSchemas.uuid).optional(),
  search: SecureSchemas.safeString(200).optional(),
  isInventoried: z.boolean().optional(),
  isPurchasable: z.boolean().optional(),
  isSellable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  hasStock: z.boolean().optional(),
  hasImages: z.boolean().optional(),
  priceRange: z.object({
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).optional(),
    currency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code').optional()
  }).optional(),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional(),
  updatedAfter: z.coerce.date().optional(),
  updatedBefore: z.coerce.date().optional()
})

const paginationSchema = z.object({
  page: z.coerce.number().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  sortBy: z.enum(['product_name', 'product_code', 'created_at', 'updated_at', 'status', 'category', 'standard_cost']).optional().default('product_name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

const productDimensionsSchema = z.object({
  length: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
  unit: SecureSchemas.safeString(10)
})

const productSpecificationSchema = z.object({
  name: SecureSchemas.safeString(100),
  value: SecureSchemas.safeString(500),
  unit: SecureSchemas.safeString(20).optional(),
  category: SecureSchemas.safeString(50).optional(),
  isRequired: z.boolean().default(false),
  displayOrder: z.number().min(0).default(0)
}).refine(data => data.name.length >= 1 && data.value.length >= 1, {
  message: 'Name and value are required'
})

const productUnitSchema = z.object({
  unit: SecureSchemas.safeString(20),
  conversionFactor: z.number().min(0.0001),
  isActive: z.boolean().default(true),
  isPurchaseUnit: z.boolean().default(false),
  isSalesUnit: z.boolean().default(false),
  isInventoryUnit: z.boolean().default(false),
  barcode: SecureSchemas.safeString(50).optional(),
  notes: SecureSchemas.safeString(500).optional()
}).refine(data => data.unit.length >= 1, {
  message: 'Unit is required'
})

const moneySchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code')
})

const createProductSchema = z.object({
  productCode: SecureSchemas.safeString(50).optional(),
  productName: SecureSchemas.safeString(255),
  displayName: SecureSchemas.safeString(255).optional(),
  description: SecureSchemas.safeString(2000).optional(),
  shortDescription: SecureSchemas.safeString(500).optional(),
  productType: z.enum(['raw_material', 'finished_good', 'semi_finished', 'service', 'asset', 'consumable']),
  status: z.enum(['active', 'inactive', 'discontinued', 'pending_approval', 'draft']).optional(),
  categoryId: SecureSchemas.uuid,
  subcategoryId: SecureSchemas.uuid.optional(),
  brandId: SecureSchemas.uuid.optional(),
  manufacturerId: SecureSchemas.uuid.optional(),
  specifications: z.array(productSpecificationSchema).max(50).optional(),
  baseUnit: SecureSchemas.safeString(20),
  alternativeUnits: z.array(productUnitSchema).max(20).optional(),
  isInventoried: z.boolean().optional(),
  isSerialTrackingRequired: z.boolean().optional(),
  isBatchTrackingRequired: z.boolean().optional(),
  shelfLifeDays: z.number().min(0).max(3650).optional(),
  storageConditions: SecureSchemas.safeString(500).optional(),
  handlingInstructions: SecureSchemas.safeString(1000).optional(),
  isPurchasable: z.boolean().optional(),
  isSellable: z.boolean().optional(),
  defaultVendorId: SecureSchemas.uuid.optional(),
  minimumOrderQuantity: z.number().min(0).optional(),
  maximumOrderQuantity: z.number().min(0).optional(),
  standardOrderQuantity: z.number().min(0).optional(),
  leadTimeDays: z.number().min(0).max(365).optional(),
  standardCost: moneySchema.optional(),
  weight: z.number().min(0).optional(),
  weightUnit: SecureSchemas.safeString(10).optional(),
  dimensions: productDimensionsSchema.optional(),
  color: SecureSchemas.safeString(50).optional(),
  material: SecureSchemas.safeString(100).optional(),
  hazardousClassification: SecureSchemas.safeString(100).optional(),
  regulatoryApprovals: z.array(SecureSchemas.safeString(100)).max(20).optional(),
  safetyDataSheetUrl: z.string().url().max(500).optional().or(z.literal('')),
  keywords: z.array(SecureSchemas.safeString(50)).max(50).optional(),
  tags: z.array(SecureSchemas.safeString(30)).max(20).optional(),
  notes: SecureSchemas.safeString(2000).optional(),
  createdBy: SecureSchemas.uuid
}).refine(data => data.productName.length >= 1 && data.baseUnit.length >= 1, {
  message: 'Product name and base unit are required'
})

/**
 * GET /api/products - List products with filtering and pagination
 * Requires authentication and 'read:products' permission
 */
const getProducts = withSecurity(
  authStrategies.hybrid(
    withAuthorization('products', 'read', async (request: NextRequest, { user }: { user: any }) => {
      try {
        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const priceRange = {
          min: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
          max: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
          currency: searchParams.get('priceCurrency') || undefined
        }

        const rawFilters: any = {
          status: searchParams.getAll('status') as ProductStatus[] | undefined,
          productType: searchParams.getAll('productType') as ProductType[] | undefined,
          categoryId: searchParams.getAll('categoryId') || undefined,
          brandId: searchParams.getAll('brandId') || undefined,
          manufacturerId: searchParams.getAll('manufacturerId') || undefined,
          search: searchParams.get('search') || undefined,
          isInventoried: searchParams.get('isInventoried') === 'true' ? true : searchParams.get('isInventoried') === 'false' ? false : undefined,
          isPurchasable: searchParams.get('isPurchasable') === 'true' ? true : searchParams.get('isPurchasable') === 'false' ? false : undefined,
          isSellable: searchParams.get('isSellable') === 'true' ? true : searchParams.get('isSellable') === 'false' ? false : undefined,
          isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
          hasStock: searchParams.get('hasStock') === 'true' ? true : undefined,
          hasImages: searchParams.get('hasImages') === 'true' ? true : undefined,
          createdAfter: searchParams.get('createdAfter') || undefined,
          createdBefore: searchParams.get('createdBefore') || undefined,
          updatedAfter: searchParams.get('updatedAfter') || undefined,
          updatedBefore: searchParams.get('updatedBefore') || undefined
        }

        // Add priceRange only if at least one value exists
        if (priceRange.min !== undefined || priceRange.max !== undefined || priceRange.currency !== undefined) {
          rawFilters.priceRange = priceRange
        }

        const rawPagination = {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined
        }

        // Enhanced security validation
        const filtersValidation = await validateInput(rawFilters, productFiltersSchema, {
          maxLength: 2000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!filtersValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid filter parameters',
            threats: filtersValidation.threats,
            riskLevel: filtersValidation.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid filter parameters',
              details: filtersValidation.errors
            },
            400
          )
        }

        const paginationValidation = await validateInput(rawPagination, paginationSchema)

        if (!paginationValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid pagination parameters',
              details: paginationValidation.errors
            },
            400
          )
        }

        const filters: ProductFilters = filtersValidation.sanitized || filtersValidation.data!
        const pagination: PaginationOptions = paginationValidation.sanitized || paginationValidation.data!

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'products',
          action: 'read',
          filters: {
            hasSearch: !!filters.search,
            statusFilter: filters.status?.length || 0,
            typeFilter: filters.productType?.length || 0,
            categoryFilter: filters.categoryId?.length || 0,
            hasPriceFilter: !!filters.priceRange
          },
          pagination
        })

        // Fetch products
        const result = await productService.getProducts(filters, pagination)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'product-service',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch products'
            },
            500
          )
        }

        // Add metadata headers
        const response = createSecureResponse({
          success: true,
          data: result.data,
          metadata: result.metadata
        })

        // Add pagination headers
        if (result.metadata) {
          response.headers.set('X-Total-Count', result.metadata.total?.toString() || '0')
          response.headers.set('X-Page-Count', result.metadata.totalPages?.toString() || '0')
          response.headers.set('X-Current-Page', result.metadata.page?.toString() || '1')
        }

        return response

      } catch (error) {
        console.error('Error in GET /api/products:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        )
      }
    })
  ),
  {
    validationConfig: {
      maxBodySize: 0, // No body for GET requests
      validateOrigin: false // Allow cross-origin GET requests
    },
    corsConfig: {
      methods: ['GET'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Current-Page']
    }
  }
)

// Apply rate limiting
export const GET = withRateLimit(RateLimitPresets.API)(getProducts)

/**
 * POST /api/products - Create new product
 * Requires authentication and 'create:products' permission
 */
const createProduct = withSecurity(
  authStrategies.hybrid(
    withAuthorization('products', 'create', async (request: NextRequest, { user }: { user: any }) => {
      try {
        const body = await request.json()

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, createProductSchema, {
          maxLength: 20000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid product creation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'product_creation'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid product data',
              details: validationResult.errors
            },
            400
          )
        }

        // Use sanitized data and cast to CreateProductInput
        const validatedData = validationResult.sanitized || validationResult.data!
        const productData: any = {
          ...validatedData,
          createdBy: user.id // Override with authenticated user ID
        }

        // Additional permission checks for special statuses or high-value products
        if (productData.status && !['active', 'draft'].includes(productData.status as string)) {
          const canSetSpecialStatus = await checkPermission(user, 'manage_products', 'products')
          if (!canSetSpecialStatus) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to set product status'
              },
              403
            )
          }
        }

        // Check for high-value product creation permissions
        if (productData.standardCost && typeof productData.standardCost === 'object' && 'amount' in productData.standardCost && productData.standardCost.amount > 10000) {
          const canCreateHighValue = await checkPermission(user, 'create_high_value_products', 'products')
          if (!canCreateHighValue) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to create high-value products'
              },
              403
            )
          }
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'products',
          action: 'create',
          productName: productData.productName,
          productType: productData.productType,
          categoryId: productData.categoryId,
          status: productData.status,
          standardCost: productData.standardCost && typeof productData.standardCost === 'object' && 'amount' in productData.standardCost ? productData.standardCost.amount : undefined
        })

        // Create product
        const result = await productService.createProduct(productData)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'product-service',
            operation: 'create',
            error: result.error
          })

          const statusCode = result.error?.includes('already exists') ? 409 : 500
          return createSecureResponse(
            {
              success: false,
              error: statusCode === 409 ? 'Product already exists' : 'Failed to create product'
            },
            statusCode
          )
        }

        // Log successful creation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'products',
          action: 'create_success',
          productId: result.data?.id,
          productName: productData.productName,
          productCode: result.data?.productCode
        })

        return createSecureResponse(
          {
            success: true,
            data: result.data,
            message: 'Product created successfully'
          },
          201
        )

      } catch (error) {
        console.error('Error in POST /api/products:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create_product',
          stack: error instanceof Error ? error.stack : undefined
        })

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        )
      }
    })
  ),
  {
    validationConfig: {
      maxBodySize: 100 * 1024, // 100KB max body size (larger than vendor for specifications/images)
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['POST']
    }
  }
)

// Apply stricter rate limiting for creation endpoints
export const POST = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 product creations per hour
  skipSuccessfulRequests: false
})(createProduct)