/**
 * Individual Product API Routes
 * 
 * GET /api/products/[id] - Get product by ID with metrics
 * PUT /api/products/[id] - Update product
 * DELETE /api/products/[id] - Soft delete product (mark as discontinued)
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
import { productService, type UpdateProductInput } from '@/lib/services/db/product-service'
import { type ProductType, type ProductStatus } from '@/lib/types/product'
import { withAuth, type AuthenticatedUser } from '@/lib/middleware/auth'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Security-enhanced validation schemas
const productParamsSchema = z.object({
  id: SecureSchemas.uuid
})

const productDimensionsSchema = z.object({
  length: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
  unit: SecureSchemas.safeString(10)
})

const moneySchema = z.object({
  amount: z.number().min(0),
  currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code')
})

const updateProductSchema = z.object({
  productName: SecureSchemas.safeString(255).min(1).optional(),
  displayName: SecureSchemas.safeString(255).optional(),
  description: SecureSchemas.safeString(2000).optional(),
  shortDescription: SecureSchemas.safeString(500).optional(),
  productType: z.enum(['raw_material', 'finished_good', 'semi_finished', 'service', 'asset', 'consumable']).optional(),
  status: z.enum(['active', 'inactive', 'discontinued', 'pending_approval', 'draft']).optional(),
  categoryId: SecureSchemas.uuid.optional(),
  subcategoryId: SecureSchemas.uuid.optional(),
  brandId: SecureSchemas.uuid.optional(),
  manufacturerId: SecureSchemas.uuid.optional(),
  baseUnit: SecureSchemas.safeString(20).min(1).optional(),
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
  lastPurchaseCost: moneySchema.optional(),
  averageCost: moneySchema.optional(),
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
  updatedBy: SecureSchemas.uuid
})

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/products/[id] - Get product by ID with metrics
 * Requires authentication and 'read:products' permission
 */
const getProduct = withSecurity(
  withAuth(
    withAuthorization('products', 'read', async (request: NextRequest, { user, params }: { user: AuthenticatedUser } & RouteParams) => {
      try {
        // Validate product ID parameter
        const paramsValidation = await validateInput(params, productParamsSchema)

        if (!paramsValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid product ID',
              details: paramsValidation.errors
            },
            400
          )
        }

        const { id } = paramsValidation.data!
        const { searchParams } = new URL(request.url)
        const includeMetrics = searchParams.get('includeMetrics') !== 'false'

        // Log data access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'products',
          action: 'read_single',
          productId: id,
          includeMetrics
        })

        // Fetch product
        const result = await productService.getProductById(id, includeMetrics)

        if (!result.success) {
          if (result.error === 'Product not found') {
            return createSecureResponse(
              {
                success: false,
                error: 'Product not found'
              },
              404
            )
          }

          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'product-service',
            operation: 'get_by_id',
            productId: id,
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch product'
            },
            500
          )
        }

        return createSecureResponse({
          success: true,
          data: result.data
        })

      } catch (error) {
        console.error('Error in GET /api/products/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_product',
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
      methods: ['GET']
    }
  }
)

// Apply rate limiting
export const GET = withRateLimit(RateLimitPresets.API)(getProduct)

/**
 * PUT /api/products/[id] - Update product
 * Requires authentication and 'update:products' permission
 */
const updateProduct = withSecurity(
  withAuth(
    withAuthorization('products', 'update', async (request: NextRequest, { user, params }: { user: AuthenticatedUser } & RouteParams) => {
      try {
        // Validate product ID parameter
        const paramsValidation = await validateInput(params, productParamsSchema)

        if (!paramsValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid product ID',
              details: paramsValidation.errors
            },
            400
          )
        }

        const { id } = paramsValidation.data!
        const body = await request.json()

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, updateProductSchema, {
          maxLength: 15000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid product update data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'product_update',
            productId: id
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

        // Use sanitized data
        const productData: UpdateProductInput = {
          ...validationResult.sanitized || validationResult.data!,
          updatedBy: user.id // Override with authenticated user ID
        }

        // Additional permission checks for special statuses or high-value changes
        if (productData.status && !['active', 'inactive'].includes(productData.status)) {
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

        // Check for high-value product modification permissions
        const isHighValueChange = (
          productData.standardCost && productData.standardCost.amount > 10000
        ) || (
          productData.averageCost && productData.averageCost.amount > 10000
        )

        if (isHighValueChange) {
          const canModifyHighValue = await checkPermission(user, 'modify_high_value_products', 'products')
          if (!canModifyHighValue) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to modify high-value products'
              },
              403
            )
          }
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'products',
          action: 'update',
          productId: id,
          changes: {
            hasNameChange: !!productData.productName,
            hasStatusChange: !!productData.status,
            hasCostChange: !!(productData.standardCost || productData.lastPurchaseCost || productData.averageCost),
            hasCategoryChange: !!productData.categoryId,
            hasSpecificationChange: !!(productData.description || productData.shortDescription)
          }
        })

        // Update product
        const result = await productService.updateProduct(id, productData)

        if (!result.success) {
          if (result.error === 'Product not found') {
            return createSecureResponse(
              {
                success: false,
                error: 'Product not found'
              },
              404
            )
          }

          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'product-service',
            operation: 'update',
            productId: id,
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to update product'
            },
            500
          )
        }

        // Log successful update
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'products',
          action: 'update_success',
          productId: id,
          productName: result.data?.productName
        })

        return createSecureResponse(
          {
            success: true,
            data: result.data,
            message: 'Product updated successfully'
          },
          200
        )

      } catch (error) {
        console.error('Error in PUT /api/products/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update_product',
          productId: params?.id,
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
      maxBodySize: 75 * 1024, // 75KB max body size
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['PUT']
    }
  }
)

// Apply rate limiting for updates
export const PUT = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 200, // 200 product updates per hour
  skipSuccessfulRequests: false
})(updateProduct)

/**
 * DELETE /api/products/[id] - Soft delete product (mark as discontinued)
 * Requires authentication and 'delete:products' permission
 */
const deleteProduct = withSecurity(
  withAuth(
    withAuthorization('products', 'delete', async (request: NextRequest, { user, params }: { user: AuthenticatedUser } & RouteParams) => {
      try {
        // Validate product ID parameter
        const paramsValidation = await validateInput(params, productParamsSchema)

        if (!paramsValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid product ID',
              details: paramsValidation.errors
            },
            400
          )
        }

        const { id } = paramsValidation.data!

        // Additional permission check for product deletion
        const canDeleteProducts = await checkPermission(user, 'delete_products', 'products')
        if (!canDeleteProducts) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to delete products'
            },
            403
          )
        }

        // Log data modification (deletion attempt)
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'products',
          action: 'delete_attempt',
          productId: id
        })

        // Soft delete product
        const result = await productService.deleteProduct(id, user.id)

        if (!result.success) {
          if (result.error === 'Product not found') {
            return createSecureResponse(
              {
                success: false,
                error: 'Product not found'
              },
              404
            )
          }

          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'product-service',
            operation: 'delete',
            productId: id,
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to delete product'
            },
            500
          )
        }

        // Log successful deletion
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'products',
          action: 'delete_success',
          productId: id
        })

        return createSecureResponse(
          {
            success: true,
            message: 'Product deleted successfully'
          },
          200
        )

      } catch (error) {
        console.error('Error in DELETE /api/products/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'delete_product',
          productId: params?.id,
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
      maxBodySize: 0, // No body for DELETE requests
      validateOrigin: true
    },
    corsConfig: {
      methods: ['DELETE']
    }
  }
)

// Apply strict rate limiting for deletions
export const DELETE = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 product deletions per hour
  skipSuccessfulRequests: false
})(deleteProduct)