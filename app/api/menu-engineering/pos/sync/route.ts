/**
 * POS Synchronization API - Synchronize data with POS systems for menu engineering
 * 
 * POST /api/menu-engineering/pos/sync - Synchronize POS data with real-time sync
 * 
 * Security Features:
 * - JWT/Keycloak authentication required
 * - Role-based access control (RBAC)
 * - Rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createPOSIntegrationService,
  type SyncDailySalesInput,
  type SyncDailySalesResult
} from '@/lib/services/pos-integration-service'
import { EnhancedCacheLayer, type CacheLayerConfig } from '@/lib/services/cache/enhanced-cache-layer'
import { withAuth, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'
import { type AuthenticatedUser } from '@/lib/middleware/auth'

// Enhanced validation schema for POS sync
const POSSyncSchema = z.object({
  date: z.coerce.date().optional().default(() => new Date()),
  sources: z.array(SecureSchemas.safeString(100)).optional(),
  syncType: z.enum(['full', 'incremental', 'retry_failed']).optional().default('incremental'),
  retryFailedRecords: z.boolean().optional().default(true),
  maxRetries: z.number().int().min(1).max(5).optional().default(3),
  batchSize: z.number().int().min(100).max(5000).optional().default(1000),
  forceSync: z.boolean().optional().default(false),
  configuration: z.object({
    posSystemName: SecureSchemas.safeString(100).optional(),
    apiEndpoint: SecureSchemas.safeString(500).optional(),
    timeout: z.number().int().min(5000).max(300000).optional(), // 5s to 5min
    compression: z.boolean().optional().default(true),
    encryption: z.boolean().optional().default(true)
  }).optional()
}).refine(data => {
  // Date cannot be more than 1 day in the future
  const maxFutureDate = new Date()
  maxFutureDate.setDate(maxFutureDate.getDate() + 1)
  return data.date <= maxFutureDate
}, {
  message: "Sync date cannot be more than 1 day in the future"
})

/**
 * POST /api/menu-engineering/pos/sync - Synchronize POS data
 * Requires authentication and 'create:pos_sync' permission
 */
const syncPOSData = withSecurity(
  authStrategies.hybrid(
    withAuthorization('menu_engineering', 'create', async (request: NextRequest, context: { user: AuthenticatedUser }) => {
      const { user } = context
      try {
        const body = await request.json().catch(() => ({}))

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, POSSyncSchema, {
          maxLength: 10000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid POS sync configuration',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'pos_sync_request'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid POS sync configuration',
              details: validationResult.errors
            },
            400
          )
        }

        // Use sanitized data
        const syncConfig = validationResult.sanitized || validationResult.data!

        // Check if user has permissions for force sync
        if (syncConfig.forceSync) {
          // Additional permission check for force sync
          // In real implementation, you would check for elevated permissions
          const canForceSync = user.role === 'admin' || user.permissions.includes('force_pos_sync')
          if (!canForceSync) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions for force sync'
              },
              403
            )
          }
        }

        // Log sync operation
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'pos_sync',
          action: 'sync_initiated',
          syncType: syncConfig.syncType,
          date: syncConfig.date?.toISOString(),
          sources: syncConfig.sources?.length || 0,
          forceSync: syncConfig.forceSync
        })

        // Initialize cache and POS integration service
        const cacheConfig: CacheLayerConfig = {
          redis: {
            enabled: false,
            fallbackToMemory: true,
            connectionTimeout: 5000
          },
          memory: {
            maxMemoryMB: 100,
            maxEntries: 1000
          },
          ttl: {
            financial: 300,
            inventory: 300,
            vendor: 300,
            default: 300
          },
          invalidation: {
            enabled: true,
            batchSize: 100,
            maxDependencies: 50
          },
          monitoring: {
            enabled: false,
            metricsInterval: 60000
          }
        }
        const cache = new EnhancedCacheLayer(cacheConfig)
        const posService = createPOSIntegrationService(cache)

        // Prepare sync input
        const syncInput: SyncDailySalesInput = {
          date: syncConfig.date || new Date(),
          sources: syncConfig.sources,
          retryFailedRecords: syncConfig.retryFailedRecords,
          maxRetries: syncConfig.maxRetries,
          batchSize: syncConfig.batchSize
        }

        // Execute sync
        let syncResult: SyncDailySalesResult
        try {
          const result = await posService.syncDailySales(syncInput)

          // Check for errors in the calculation result
          if (result.errors && result.errors.length > 0) {
            await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
              component: 'pos-integration-service',
              operation: 'sync_daily_sales',
              errors: result.errors
            })

            return createSecureResponse(
              {
                success: false,
                error: 'Failed to synchronize POS data',
                details: result.errors
              },
              500
            )
          }

          syncResult = result.value as SyncDailySalesResult
        } catch (error) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'pos-integration-service',
            operation: 'sync_daily_sales',
            error: error instanceof Error ? error.message : 'Unknown error'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to synchronize POS data',
              details: error instanceof Error ? error.message : 'Unknown error'
            },
            500
          )
        }

        // Log successful sync
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'pos_sync',
          action: 'sync_completed',
          status: syncResult.status,
          recordsProcessed: syncResult.recordsProcessed,
          errorCount: syncResult.errorCount,
          processingTimeMs: syncResult.processingTimeMs
        })

        // Create response with sync results
        const response = createSecureResponse(
          {
            success: true,
            data: {
              date: syncResult.date.toISOString(),
              status: syncResult.status,
              recordsProcessed: syncResult.recordsProcessed,
              errorCount: syncResult.errorCount,
              processingTimeMs: syncResult.processingTimeMs,
              sources: syncResult.sources,
              nextSyncTime: syncResult.nextSyncTime?.toISOString(),
              summary: {
                successRate: syncResult.recordsProcessed > 0 
                  ? ((syncResult.recordsProcessed - syncResult.errorCount) / syncResult.recordsProcessed * 100).toFixed(2) + '%'
                  : '0%',
                avgProcessingSpeed: syncResult.recordsProcessed > 0 
                  ? Math.round(syncResult.recordsProcessed / (syncResult.processingTimeMs / 1000)) + ' records/sec'
                  : 'N/A'
              }
            },
            message: `POS synchronization ${syncResult.status === 'completed' ? 'completed successfully' : 
                      syncResult.status === 'partial' ? 'completed with some errors' : 'failed'}`
          },
          syncResult.status === 'completed' ? 200 : 
          syncResult.status === 'partial' ? 202 : 500
        )

        // Add custom headers for sync tracking
        response.headers.set('X-Sync-Status', syncResult.status)
        response.headers.set('X-Records-Processed', syncResult.recordsProcessed.toString())
        response.headers.set('X-Processing-Time', syncResult.processingTimeMs.toString())
        if (syncResult.nextSyncTime) {
          response.headers.set('X-Next-Sync-Time', syncResult.nextSyncTime.toISOString())
        }

        return response

      } catch (error) {
        console.error('Error in POST /api/menu-engineering/pos/sync:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'pos_sync',
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
      maxBodySize: 50 * 1024, // 50KB max body size
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['POST'],
      exposedHeaders: ['X-Sync-Status', 'X-Records-Processed', 'X-Processing-Time', 'X-Next-Sync-Time']
    }
  }
)

// Apply rate limiting for sync operations
export const POST = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 sync operations per hour
  skipSuccessfulRequests: false,
  keyGenerator: (req) => `pos-sync:${req.headers.get('authorization') || req.ip}`
})(syncPOSData)