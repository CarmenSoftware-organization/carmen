/**
 * Product Inventory Metrics API Routes
 * 
 * GET /api/products/[id]/inventory - Get product inventory metrics and calculations
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
import { productService } from '@/lib/services/db/product-service'
import { withAuth, type AuthenticatedUser } from '@/lib/middleware/auth'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Security-enhanced validation schemas
const productParamsSchema = z.object({
  id: SecureSchemas.uuid
})

/**
 * GET /api/products/[id]/inventory - Get product inventory metrics
 * Requires authentication and 'read:inventory' permission
 */
const getProductInventoryMetrics = withSecurity(
  withAuth(
    withAuthorization('inventory', 'read', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        // Extract ID from URL pathname
        const rawId = new URL(request.url).pathname.split('/')[3] // /api/products/[id]/inventory

        // Validate product ID parameter
        const paramsValidation = await validateInput({ id: rawId }, productParamsSchema)

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

        // Log data access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'inventory',
          action: 'read_product_metrics',
          productId: id
        })

        // First check if the product exists and is inventoried
        const productResult = await productService.getProductById(id, false)
        
        if (!productResult.success) {
          if (productResult.error === 'Product not found') {
            return createSecureResponse(
              {
                success: false,
                error: 'Product not found'
              },
              404
            )
          }

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch product'
            },
            500
          )
        }

        const product = productResult.data!

        // Check if product is inventoried
        if (!product.isInventoried) {
          return createSecureResponse(
            {
              success: false,
              error: 'Product is not tracked in inventory'
            },
            400
          )
        }

        // Fetch inventory metrics
        const metricsResult = await productService.calculateProductInventoryMetrics(id)

        if (!metricsResult.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'product-service',
            operation: 'calculate_inventory_metrics',
            productId: id,
            error: metricsResult.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to calculate inventory metrics'
            },
            500
          )
        }

        const responseData = {
          productId: id,
          productCode: product.productCode,
          productName: product.productName,
          isInventoried: product.isInventoried,
          baseUnit: product.baseUnit,
          metrics: metricsResult.data,
          calculatedAt: new Date().toISOString()
        }

        return createSecureResponse({
          success: true,
          data: responseData
        })

      } catch (error) {
        console.error('Error in GET /api/products/[id]/inventory:', error)

        // Extract ID for error logging
        const id = new URL(request.url).pathname.split('/')[3]

        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_product_inventory_metrics',
          productId: id,
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
export const GET = withRateLimit(RateLimitPresets.API)(getProductInventoryMetrics)