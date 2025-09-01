/**
 * Product Statistics API Routes
 * 
 * GET /api/products/stats - Get product statistics and dashboard metrics
 * 
 * Security Features:
 * - JWT authentication required
 * - Role-based access control (RBAC)
 * - Rate limiting
 * - Security headers
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/db/product-service'
import { withAuth, type AuthenticatedUser } from '@/lib/middleware/auth'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { SecurityEventType } from '@/lib/security/audit-logger'

/**
 * GET /api/products/stats - Get product statistics
 * Requires authentication and 'read:products' permission
 */
const getProductStats = withSecurity(
  withAuth(
    withAuthorization('products', 'read', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        // Log data access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'products',
          action: 'read_statistics'
        })

        // Fetch product statistics
        const result = await productService.getProductStatistics()

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'product-service',
            operation: 'get_statistics',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch product statistics'
            },
            500
          )
        }

        return createSecureResponse({
          success: true,
          data: result.data
        })

      } catch (error) {
        console.error('Error in GET /api/products/stats:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_product_stats',
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
export const GET = withRateLimit(RateLimitPresets.API)(getProductStats)