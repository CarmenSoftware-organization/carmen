/**
 * Purchase Order API Routes - Main purchase order management endpoints
 * 
 * GET /api/purchase-orders - List all purchase orders with filtering and pagination
 * POST /api/purchase-orders - Create new purchase order
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
  purchaseOrderService,
  type PurchaseOrderFilters,
  type CreatePurchaseOrderInput
} from '@/lib/services/db/purchase-order-service'
import { authStrategies } from '@/lib/auth/api-protection'
import { type PaginationOptions } from '@/lib/types/common'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { type AuthenticatedUser } from '@/lib/middleware/auth'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Security-enhanced validation schemas
const purchaseOrderFiltersSchema = z.object({
  status: z.array(z.enum(['draft', 'sent', 'acknowledged', 'partial_received', 'fully_received', 'cancelled', 'closed'])).optional(),
  vendorId: SecureSchemas.uuid.optional(),
  orderDateFrom: z.coerce.date().optional(),
  orderDateTo: z.coerce.date().optional(),
  expectedDeliveryFrom: z.coerce.date().optional(),
  expectedDeliveryTo: z.coerce.date().optional(),
  currency: z.array(z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code')).optional(),
  search: SecureSchemas.safeString(100).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  locationId: SecureSchemas.uuid.optional(),
  approvedBy: SecureSchemas.uuid.optional()
})

const paginationSchema = z.object({
  page: z.coerce.number().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  sortBy: z.enum(['orderNumber', 'orderDate', 'vendorName', 'status', 'totalAmount', 'expectedDeliveryDate', 'createdAt', 'updatedAt']).optional().default('orderDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

const purchaseOrderTermsSchema = z.object({
  paymentTerms: z.string().min(1).max(200),
  deliveryTerms: z.string().min(1).max(200),
  warrantyPeriod: z.number().min(0).max(36500).optional(), // max 100 years in days
  returnPolicy: z.string().max(500).optional(),
  penaltyClause: z.string().max(500).optional(),
  specialInstructions: z.string().max(1000).optional()
})

const createPurchaseOrderItemSchema = z.object({
  itemId: SecureSchemas.uuid.optional(),
  itemCode: z.string().max(50).optional(),
  itemName: z.string().min(1).max(255),
  description: z.string().min(1).max(500),
  specification: z.string().max(1000).optional(),
  orderedQuantity: z.number().min(0.001).max(999999),
  unit: z.string().min(1).max(20),
  unitPrice: z.object({
    amount: z.number().min(0),
    currency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code')
  }),
  discount: z.number().min(0).max(100).optional(), // percentage
  taxRate: z.number().min(0).max(100).optional(), // percentage
  deliveryDate: z.coerce.date(),
  notes: z.string().max(1000).optional(),
  sourceRequestItemId: SecureSchemas.uuid.optional()
})

const createPurchaseOrderSchema = z.object({
  vendorId: SecureSchemas.uuid,
  currency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code'),
  exchangeRate: z.number().min(0.001).max(1000000).optional(),
  deliveryLocationId: SecureSchemas.uuid,
  expectedDeliveryDate: z.coerce.date(),
  paymentTerms: z.string().min(1).max(200),
  terms: purchaseOrderTermsSchema,
  approvedBy: SecureSchemas.uuid,
  notes: z.string().max(1000).optional(),
  items: z.array(createPurchaseOrderItemSchema).min(1).max(100),
  sourceRequestId: SecureSchemas.uuid.optional()
}).refine(data => {
  const deliveryDate = data.expectedDeliveryDate as Date;
  return deliveryDate > new Date();
}, {
  message: "Expected delivery date must be in the future"
})

/**
 * GET /api/purchase-orders - List purchase orders with filtering and pagination
 * Requires authentication and 'read:purchase_orders' permission
 */
const getPurchaseOrders = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_orders', 'read', async (request: NextRequest, context: { user: AuthenticatedUser }) => {
      const { user } = context;
      try {
        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawFilters = {
          status: searchParams.getAll('status') as any[] | undefined,
          vendorId: searchParams.get('vendorId') || undefined,
          orderDateFrom: searchParams.get('orderDateFrom') || undefined,
          orderDateTo: searchParams.get('orderDateTo') || undefined,
          expectedDeliveryFrom: searchParams.get('expectedDeliveryFrom') || undefined,
          expectedDeliveryTo: searchParams.get('expectedDeliveryTo') || undefined,
          currency: searchParams.getAll('currency') || undefined,
          search: searchParams.get('search') || undefined,
          minAmount: searchParams.get('minAmount') || undefined,
          maxAmount: searchParams.get('maxAmount') || undefined,
          locationId: searchParams.get('locationId') || undefined,
          approvedBy: searchParams.get('approvedBy') || undefined
        }

        const rawPagination = {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined
        }

        // Enhanced security validation
        const filtersValidation = await validateInput(rawFilters, purchaseOrderFiltersSchema, {
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

        const filters: PurchaseOrderFilters = filtersValidation.sanitized || filtersValidation.data!
        const pagination: PaginationOptions = paginationValidation.sanitized || paginationValidation.data!

        // Location-based access control if not admin
        const canViewAllLocations = await checkPermission(user, 'view_all_locations', 'purchase_orders')
        if (!canViewAllLocations && !filters.locationId && user.location) {
          // Apply location filter based on user's location
          filters.locationId = user.location
        }

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'purchase_orders',
          action: 'read',
          filters: {
            hasSearch: !!filters.search,
            statusFilter: filters.status?.length || 0,
            locationRestricted: !canViewAllLocations
          },
          pagination
        })

        // Fetch purchase orders
        const result = await purchaseOrderService.getPurchaseOrders(filters, pagination)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'purchase-order-service',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch purchase orders'
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
          response.headers.set('X-Total-Count', (result.metadata.total ?? 0).toString())
          response.headers.set('X-Page-Count', (result.metadata.totalPages ?? 0).toString())
          response.headers.set('X-Current-Page', (result.metadata.page ?? 1).toString())
        }

        return response

      } catch (error) {
        console.error('Error in GET /api/purchase-orders:', error)
        
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
export const GET = withRateLimit(RateLimitPresets.API)(getPurchaseOrders)

/**
 * POST /api/purchase-orders - Create new purchase order
 * Requires authentication and 'create:purchase_orders' permission
 */
const createPurchaseOrder = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_orders', 'create', async (request: NextRequest, context: { user: AuthenticatedUser }) => {
      const { user } = context;
      try {
        const body = await request.json()

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, createPurchaseOrderSchema, {
          maxLength: 100000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid purchase order creation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'purchase_order_creation'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase order data',
              details: validationResult.errors
            },
            400
          )
        }

        // Use sanitized data
        const validatedData = (validationResult.sanitized || validationResult.data!) as Omit<CreatePurchaseOrderInput, 'approvedBy'>
        const orderData: CreatePurchaseOrderInput = {
          ...validatedData,
          approvedBy: user.id // Override with authenticated user ID
        }

        // Validate high-value orders require additional permissions
        const totalValue = orderData.items.reduce((sum: number, item: any) => {
          return sum + (item.unitPrice.amount * item.orderedQuantity * (1 - (item.discount || 0) / 100))
        }, 0)

        if (totalValue > 50000) { // High-value threshold
          const canCreateHighValue = await checkPermission(user, 'create_high_value_orders', 'purchase_orders')
          if (!canCreateHighValue) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to create high-value purchase orders'
              },
              403
            )
          }
        }

        // Validate vendor access
        const canOrderFromAllVendors = await checkPermission(user, 'order_from_all_vendors', 'purchase_orders')
        if (!canOrderFromAllVendors) {
          // Check if user's department can order from this vendor
          // This would integrate with vendor-department relationships
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'purchase_orders',
          action: 'create',
          vendorId: orderData.vendorId,
          currency: orderData.currency,
          totalValue,
          itemCount: orderData.items.length,
          locationId: orderData.deliveryLocationId
        })

        // Create purchase order
        const result = await purchaseOrderService.createPurchaseOrder(orderData)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'purchase-order-service',
            operation: 'create',
            error: result.error
          })

          const statusCode = result.error?.includes('Invalid vendor') ? 400 : 500
          return createSecureResponse(
            {
              success: false,
              error: statusCode === 400 ? 'Invalid vendor or data' : 'Failed to create purchase order'
            },
            statusCode
          )
        }

        // Log successful creation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'purchase_orders',
          action: 'create_success',
          orderId: result.data?.id,
          orderNumber: result.data?.orderNumber
        })

        return createSecureResponse(
          {
            success: true,
            data: result.data,
            message: 'Purchase order created successfully'
          },
          201
        )

      } catch (error) {
        console.error('Error in POST /api/purchase-orders:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create_purchase_order',
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
      maxBodySize: 200 * 1024, // 200KB max body size
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
  maxRequests: 50, // 50 PO creations per hour
  skipSuccessfulRequests: false
})(createPurchaseOrder)