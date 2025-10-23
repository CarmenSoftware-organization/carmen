/**
 * Purchase Request API Routes - Main purchase request management endpoints
 * 
 * GET /api/purchase-requests - List all purchase requests with filtering and pagination
 * POST /api/purchase-requests - Create new purchase request
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
import {
  purchaseRequestService,
  type PurchaseRequestFilters,
  type CreatePurchaseRequestInput
} from '@/lib/services/db/purchase-request-service'
import {
  type PurchaseRequestPriority,
  type PurchaseRequestType,
  type DocumentStatus,
  type PaginationOptions
} from '@/lib/types'
import { authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { type AuthenticatedUser } from '@/lib/middleware/auth'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Security-enhanced validation schemas
const purchaseRequestFiltersSchema = z.object({
  status: z.array(z.enum(['draft', 'inprogress', 'approved', 'rejected', 'void', 'converted'])).optional(),
  priority: z.array(z.enum(['low', 'normal', 'high', 'urgent', 'emergency'])).optional(),
  requestType: z.array(z.enum(['goods', 'services', 'capital', 'maintenance', 'emergency'])).optional(),
  departmentId: SecureSchemas.uuid.optional(),
  requestedBy: SecureSchemas.uuid.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  budgetCode: SecureSchemas.safeString(50).optional(),
  search: SecureSchemas.safeString(100).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  currentStage: SecureSchemas.safeString(50).optional()
})

const paginationSchema = z.object({
  page: z.coerce.number().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  sortBy: z.enum(['requestNumber', 'requestDate', 'requiredDate', 'status', 'priority', 'estimatedTotal', 'createdAt', 'updatedAt']).optional().default('requestDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

const createPurchaseRequestItemSchema = z.object({
  itemId: SecureSchemas.uuid.optional(),
  itemCode: SecureSchemas.safeString(50).optional(),
  itemName: z.string().min(1).max(255),
  description: z.string().min(1).max(500),
  specification: SecureSchemas.safeString(1000).optional(),
  requestedQuantity: z.number().min(0.001).max(999999),
  unit: z.string().min(1).max(20),
  estimatedUnitPrice: z.object({
    amount: z.number().min(0),
    currency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code')
  }).optional(),
  budgetCode: SecureSchemas.safeString(50).optional(),
  accountCode: SecureSchemas.safeString(50).optional(),
  deliveryLocationId: SecureSchemas.uuid,
  requiredDate: z.coerce.date(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']),
  vendorSuggestion: SecureSchemas.safeString(255).optional(),
  notes: SecureSchemas.safeString(1000).optional()
})

const createPurchaseRequestSchema = z.object({
  requestDate: z.coerce.date(),
  requiredDate: z.coerce.date(),
  requestType: z.enum(['goods', 'services', 'capital', 'maintenance', 'emergency']),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']),
  departmentId: SecureSchemas.uuid,
  locationId: SecureSchemas.uuid,
  requestedBy: SecureSchemas.uuid,
  budgetCode: SecureSchemas.safeString(50).optional(),
  projectCode: SecureSchemas.safeString(50).optional(),
  costCenter: SecureSchemas.safeString(50).optional(),
  justification: SecureSchemas.safeString(2000).optional(),
  notes: SecureSchemas.safeString(1000).optional(),
  items: z.array(createPurchaseRequestItemSchema).min(1).max(100)
}).refine(data => data.requiredDate > data.requestDate, {
  message: "Required date must be after request date"
})

/**
 * GET /api/purchase-requests - List purchase requests with filtering and pagination
 * Requires authentication and 'read:purchase_requests' permission
 */
const getPurchaseRequests = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_requests', 'read', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawFilters = {
          status: searchParams.getAll('status') as DocumentStatus[] | undefined,
          priority: searchParams.getAll('priority') as PurchaseRequestPriority[] | undefined,
          requestType: searchParams.getAll('requestType') as PurchaseRequestType[] | undefined,
          departmentId: searchParams.get('departmentId') || undefined,
          requestedBy: searchParams.get('requestedBy') || undefined,
          dateFrom: searchParams.get('dateFrom') || undefined,
          dateTo: searchParams.get('dateTo') || undefined,
          budgetCode: searchParams.get('budgetCode') || undefined,
          search: searchParams.get('search') || undefined,
          minAmount: searchParams.get('minAmount') || undefined,
          maxAmount: searchParams.get('maxAmount') || undefined,
          currentStage: searchParams.get('currentStage') || undefined
        }

        const rawPagination = {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined
        }

        // Enhanced security validation
        const filtersValidation = await validateInput(rawFilters, purchaseRequestFiltersSchema, {
          maxLength: 1000,
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

        const filters: PurchaseRequestFilters = (filtersValidation.sanitized || filtersValidation.data!) as PurchaseRequestFilters
        const pagination: PaginationOptions = (paginationValidation.sanitized || paginationValidation.data!) as PaginationOptions

        // Department-based access control - users can only see their department's requests unless they have elevated permissions
        const canViewAllDepartments = await checkPermission(user, 'view_all_departments', 'purchase_requests')
        if (!canViewAllDepartments && !filters.departmentId) {
          // Apply department filter based on user's department
          filters.departmentId = user.department
        }

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'purchase_requests',
          action: 'read',
          filters: {
            hasSearch: !!filters.search,
            statusFilter: filters.status?.length || 0,
            departmentRestricted: !canViewAllDepartments
          },
          pagination
        })

        // Fetch purchase requests
        const result = await purchaseRequestService.getPurchaseRequests(filters, pagination)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'purchase-request-service',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch purchase requests'
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
          if (result.metadata.total !== undefined) {
            response.headers.set('X-Total-Count', result.metadata.total.toString())
          }
          if (result.metadata.totalPages !== undefined) {
            response.headers.set('X-Page-Count', result.metadata.totalPages.toString())
          }
          if (result.metadata.page !== undefined) {
            response.headers.set('X-Current-Page', result.metadata.page.toString())
          }
        }

        return response

      } catch (error) {
        console.error('Error in GET /api/purchase-requests:', error)
        
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
export const GET = withRateLimit(RateLimitPresets.API)(getPurchaseRequests)

/**
 * POST /api/purchase-requests - Create new purchase request
 * Requires authentication and 'create:purchase_requests' permission
 */
const createPurchaseRequest = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_requests', 'create', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json()

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, createPurchaseRequestSchema, {
          maxLength: 50000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid purchase request creation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'purchase_request_creation'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase request data',
              details: validationResult.errors
            },
            400
          )
        }

        // Use sanitized data
        const requestData: CreatePurchaseRequestInput = {
          ...(validationResult.sanitized || validationResult.data!),
          requestedBy: user.id // Override with authenticated user ID
        } as CreatePurchaseRequestInput

        // Additional validation - check if user can create requests for the specified department
        const canCreateForDepartment = user.department === requestData.departmentId ||
                                      await checkPermission(user, 'create_for_other_departments', 'purchase_requests')
        
        if (!canCreateForDepartment) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to create request for this department'
            },
            403
          )
        }

        // Validate budget permissions for high-value requests
        const estimatedTotal = requestData.items.reduce((sum, item) => {
          if (item.estimatedUnitPrice) {
            return sum + (item.estimatedUnitPrice.amount * item.requestedQuantity)
          }
          return sum
        }, 0)

        if (estimatedTotal > 10000) { // High-value threshold
          const canCreateHighValue = await checkPermission(user, 'create_high_value_requests', 'purchase_requests')
          if (!canCreateHighValue) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to create high-value requests'
              },
              403
            )
          }
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'purchase_requests',
          action: 'create',
          requestType: requestData.requestType,
          priority: requestData.priority,
          estimatedValue: estimatedTotal,
          itemCount: requestData.items.length,
          departmentId: requestData.departmentId
        })

        // Create purchase request
        const result = await purchaseRequestService.createPurchaseRequest(requestData)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'purchase-request-service',
            operation: 'create',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to create purchase request'
            },
            500
          )
        }

        // Log successful creation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'purchase_requests',
          action: 'create_success',
          requestId: result.data?.id,
          requestNumber: result.data?.requestNumber
        })

        return createSecureResponse(
          {
            success: true,
            data: result.data,
            message: 'Purchase request created successfully'
          },
          201
        )

      } catch (error) {
        console.error('Error in POST /api/purchase-requests:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create_purchase_request',
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
      maxBodySize: 100 * 1024, // 100KB max body size
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
  maxRequests: 100, // 100 PR creations per hour
  skipSuccessfulRequests: false
})(createPurchaseRequest)