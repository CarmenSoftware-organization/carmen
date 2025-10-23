/**
 * Sales Data Import API - Import sales data from POS systems for menu engineering
 * 
 * POST /api/menu-engineering/sales/import - Import sales data with comprehensive validation
 * 
 * Security Features:
 * - JWT/Keycloak authentication required
 * - Role-based access control (RBAC)
 * - Rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Audit logging
 * - Progress tracking for large imports
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createPOSIntegrationService,
  type ImportSalesDataInput,
  type ImportSalesDataResult,
  SalesTransactionSchema
} from '@/lib/services/pos-integration-service'
import { EnhancedCacheLayer } from '@/lib/services/cache/enhanced-cache-layer'
import { withAuth, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'
import { type AuthenticatedUser } from '@/lib/middleware/auth'

// Enhanced validation schema for sales data import
const ImportSalesDataSchema = z.object({
  source: z.string().min(1, 'Source is required').max(100),
  transactions: z.array(SalesTransactionSchema).min(1, 'At least one transaction is required').max(10000, 'Maximum 10,000 transactions per batch'),
  batchSize: z.number().int().min(100).max(5000).optional().default(1000),
  validateOnly: z.boolean().optional().default(false),
  skipDuplicates: z.boolean().optional().default(true),
  metadata: z.object({
    posSystemName: z.string().max(100).optional(),
    posVersion: z.string().max(50).optional(),
    exportedAt: z.coerce.date().optional(),
    fileSize: z.number().positive().optional(),
    checksum: z.string().max(256).optional(),
    notes: z.string().max(1000).optional()
  }).optional()
})

/**
 * POST /api/menu-engineering/sales/import - Import sales data from POS systems
 * Requires authentication and 'create:sales_data' permission
 */
const importSalesData = withSecurity(
  authStrategies.hybrid(
    withAuthorization('menu_engineering', 'create', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json()

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, ImportSalesDataSchema, {
          maxLength: 1000000, // 1MB max
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid sales data import payload',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'sales_data_import'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid sales data import payload',
              details: validationResult.errors
            },
            400
          )
        }

        // Use sanitized data
        const validatedData = validationResult.sanitized || validationResult.data!
        const importData: ImportSalesDataInput = {
          source: validatedData.source,
          transactions: validatedData.transactions,
          batchSize: validatedData.batchSize,
          validateOnly: validatedData.validateOnly,
          skipDuplicates: validatedData.skipDuplicates,
          metadata: validatedData.metadata,
          importedBy: user.id // Override with authenticated user ID
        }

        // Log data import activity
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'sales_data',
          action: 'import',
          source: importData.source,
          transactionCount: importData.transactions.length,
          validateOnly: importData.validateOnly,
          batchSize: importData.batchSize
        })

        // Initialize cache and POS integration service
        const cache = new EnhancedCacheLayer({
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
            financial: 3600,
            inventory: 3600,
            vendor: 3600,
            default: 3600
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
        })
        const posService = createPOSIntegrationService(cache)

        // Import sales data
        const result = await posService.importSalesData(importData)

        // Check if there are errors in the calculation result
        if (result.errors && result.errors.length > 0) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'pos-integration-service',
            operation: 'import_sales_data',
            error: result.errors[0]
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to import sales data',
              details: result.errors[0]
            },
            500
          )
        }

        const importResult = result.value

        // Log successful import
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'sales_data',
          action: 'import_success',
          batchId: importResult.batchId,
          totalRecords: importResult.totalRecords,
          successfulRecords: importResult.successfulRecords,
          failedRecords: importResult.failedRecords
        })

        // Create response with import results
        const response = createSecureResponse(
          {
            success: true,
            data: {
              batchId: importResult.batchId,
              totalRecords: importResult.totalRecords,
              successfulRecords: importResult.successfulRecords,
              failedRecords: importResult.failedRecords,
              duplicatesSkipped: importResult.duplicatesSkipped,
              processingTimeMs: importResult.processingTimeMs,
              validationErrors: importResult.validationErrors.slice(0, 100), // Limit error details
              hasMore: importResult.validationErrors.length > 100
            },
            message: importData.validateOnly
              ? 'Sales data validation completed'
              : 'Sales data import completed'
          },
          201
        )

        // Add custom headers for import tracking
        response.headers.set('X-Import-Batch-Id', importResult.batchId)
        response.headers.set('X-Processing-Time', importResult.processingTimeMs.toString())
        response.headers.set('X-Success-Rate', ((importResult.successfulRecords / importResult.totalRecords) * 100).toFixed(2))

        return response

      } catch (error) {
        console.error('Error in POST /api/menu-engineering/sales/import:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'import_sales_data',
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
      maxBodySize: 10 * 1024 * 1024, // 10MB max body size for large imports
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['POST'],
      exposedHeaders: ['X-Import-Batch-Id', 'X-Processing-Time', 'X-Success-Rate']
    }
  }
)

// Apply rate limiting for data import operations
export const POST = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 imports per hour
  skipSuccessfulRequests: false,
  keyGenerator: (req) => `sales-import:${req.headers.get('authorization') || req.ip}`
})(importSalesData)