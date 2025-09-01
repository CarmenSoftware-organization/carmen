/**
 * Vendor Statistics API Routes
 * 
 * GET /api/vendors/stats - Get vendor statistics for dashboard and reporting
 */

import { NextRequest } from 'next/server'
import { vendorService } from '@/lib/services/db/vendor-service'
import { authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { SecurityEventType } from '@/lib/security/audit-logger'

/**
 * GET /api/vendors/stats - Get vendor statistics for dashboard
 * Requires authentication and 'read:vendors' permission
 */
const getVendorStats = withSecurity(
  authStrategies.hybrid(
    withAuthorization('vendors', 'read', async (request, { user }) => {
      try {
        // Log data access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'vendor_statistics',
          action: 'read'
        })

        // Get vendor statistics
        const result = await vendorService.getVendorStatistics()

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'vendor-service',
            operation: 'getVendorStatistics',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to retrieve vendor statistics'
            },
            500
          )
        }

        return createSecureResponse({
          success: true,
          data: result.data
        })

      } catch (error) {
        console.error('Error in GET /api/vendors/stats:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_vendor_statistics',
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
      maxBodySize: 0,
      validateOrigin: false
    },
    corsConfig: {
      methods: ['GET']
    }
  }
)

export const GET = withRateLimit(RateLimitPresets.API)(getVendorStats)
    })

  } catch (error) {
    console.error('Error in GET /api/vendors/stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}