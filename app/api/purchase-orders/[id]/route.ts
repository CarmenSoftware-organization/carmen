/**
 * Purchase Order Individual API Routes
 * 
 * GET /api/purchase-orders/[id] - Get purchase order by ID
 * PUT /api/purchase-orders/[id] - Update purchase order
 * POST /api/purchase-orders/[id]/send - Send purchase order to vendor
 * POST /api/purchase-orders/[id]/acknowledge - Process vendor acknowledgment
 * POST /api/purchase-orders/[id]/receive - Receive purchase order items
 * POST /api/purchase-orders/[id]/close - Close purchase order
 * POST /api/purchase-orders/[id]/cancel - Cancel purchase order
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  purchaseOrderService,
  type UpdatePurchaseOrderInput,
  type ReceiveOrderInput,
  type VendorAcknowledgment
} from '@/lib/services/db/purchase-order-service'
import { withUnifiedAuth, type UnifiedAuthenticatedUser, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Validation schemas
const updatePurchaseOrderSchema = z.object({
  expectedDeliveryDate: z.coerce.date().optional(),
  paymentTerms: SecureSchemas.safeString(200).optional(),
  terms: z.object({
    paymentTerms: SecureSchemas.safeString(200).optional(),
    deliveryTerms: SecureSchemas.safeString(200).optional(),
    warrantyPeriod: z.number().min(0).max(36500).optional(),
    returnPolicy: SecureSchemas.safeString(500).optional(),
    penaltyClause: SecureSchemas.safeString(500).optional(),
    specialInstructions: SecureSchemas.safeString(1000).optional()
  }).optional(),
  notes: SecureSchemas.safeString(1000).optional()
})

const receiveOrderItemSchema = z.object({
  itemId: SecureSchemas.uuid,
  receivedQuantity: z.number().min(0).max(999999),
  rejectedQuantity: z.number().min(0).max(999999).optional(),
  damagedQuantity: z.number().min(0).max(999999).optional(),
  qualityStatus: z.enum(['passed', 'failed', 'conditional']).optional(),
  batchNumber: SecureSchemas.safeString(50).optional(),
  expiryDate: z.coerce.date().optional(),
  notes: SecureSchemas.safeString(500).optional()
})

const receiveOrderSchema = z.object({
  receivedDate: z.coerce.date(),
  items: z.array(receiveOrderItemSchema).min(1),
  notes: SecureSchemas.safeString(1000).optional(),
  createGRN: z.boolean().optional()
})

const vendorAcknowledgmentSchema = z.object({
  acknowledgedDate: z.coerce.date(),
  confirmedDeliveryDate: z.coerce.date().optional(),
  estimatedShippingDate: z.coerce.date().optional(),
  trackingNumber: SecureSchemas.safeString(100).optional(),
  comments: SecureSchemas.safeString(1000).optional(),
  itemAdjustments: z.array(z.object({
    itemId: SecureSchemas.uuid,
    confirmedQuantity: z.number().min(0),
    confirmedPrice: z.object({
      amount: z.number().min(0),
      currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/)
    }).optional(),
    confirmedDeliveryDate: z.coerce.date().optional(),
    substituteItem: SecureSchemas.safeString(255).optional(),
    comments: SecureSchemas.safeString(500).optional()
  })).optional()
})

const closeOrderSchema = z.object({
  closureReason: SecureSchemas.safeString(500).optional()
})

const cancelOrderSchema = z.object({
  reason: SecureSchemas.safeString(500).optional()
})

/**
 * GET /api/purchase-orders/[id] - Get purchase order by ID
 */
const getPurchaseOrder = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_orders', 'read', async (
      request: NextRequest, 
      { user, params }: { user: UnifiedAuthenticatedUser; params: { id: string } }
    ) => {
      try {
        const { id } = params

        // Validate ID format
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        if (!idValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase order ID'
            },
            400
          )
        }

        // Fetch purchase order
        const result = await purchaseOrderService.getPurchaseOrderById(id)

        if (!result.success) {
          if (result.error?.includes('not found')) {
            return createSecureResponse(
              {
                success: false,
                error: 'Purchase order not found'
              },
              404
            )
          }

          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'purchase-order-service',
            operation: 'get',
            error: result.error,
            orderId: id
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch purchase order'
            },
            500
          )
        }

        const purchaseOrder = result.data!

        // Check location access
        const canViewAllLocations = await checkPermission(user, 'view_all_locations', 'purchase_orders')
        if (!canViewAllLocations && purchaseOrder.deliveryLocationId !== user.locationId) {
          await auditSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, request, user.id, {
            resource: 'purchase_orders',
            resourceId: id,
            reason: 'Attempted to access order for different location'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Purchase order not found'
            },
            404
          )
        }

        // Log sensitive data access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'purchase_orders',
          resourceId: id,
          action: 'view',
          orderNumber: purchaseOrder.orderNumber
        })

        return createSecureResponse({
          success: true,
          data: purchaseOrder
        })

      } catch (error) {
        console.error('Error in GET /api/purchase-orders/[id]:', error)
        
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
  )
)

export const GET = withRateLimit(RateLimitPresets.API)(getPurchaseOrder)

/**
 * PUT /api/purchase-orders/[id] - Update purchase order
 */
const updatePurchaseOrder = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_orders', 'update', async (
      request: NextRequest,
      { user, params }: { user: UnifiedAuthenticatedUser; params: { id: string } }
    ) => {
      try {
        const { id } = params
        const body = await request.json()

        // Validate ID and body
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        if (!idValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase order ID'
            },
            400
          )
        }

        const bodyValidation = await validateInput(body, updatePurchaseOrderSchema, {
          maxLength: 10000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!bodyValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid update data',
            threats: bodyValidation.threats,
            riskLevel: bodyValidation.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid update data',
              details: bodyValidation.errors
            },
            400
          )
        }

        // Check if user can update purchase orders
        const canUpdate = await checkPermission(user, 'update_purchase_orders', 'purchase_orders')
        if (!canUpdate) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to update purchase orders'
            },
            403
          )
        }

        const updateData: UpdatePurchaseOrderInput = bodyValidation.sanitized || bodyValidation.data!

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'purchase_orders',
          resourceId: id,
          action: 'update',
          changes: Object.keys(updateData)
        })

        // For now, return success - actual update would be implemented in service
        return createSecureResponse({
          success: true,
          message: 'Purchase order update functionality coming soon'
        })

      } catch (error) {
        console.error('Error in PUT /api/purchase-orders/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update_purchase_order',
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
  )
)

export const PUT = withRateLimit(RateLimitPresets.API)(updatePurchaseOrder)

/**
 * POST /api/purchase-orders/[id]/[action] - Handle various order actions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    authStrategies.hybrid(
      withAuthorization('purchase_orders', 'update', async (
        req: NextRequest,
        { user }: { user: UnifiedAuthenticatedUser }
      ) => {
        try {
          const { id } = params
          const url = new URL(req.url)
          const action = url.pathname.split('/').pop()

          // Validate ID
          const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
          if (!idValidation.success) {
            return createSecureResponse(
              {
                success: false,
                error: 'Invalid purchase order ID'
              },
              400
            )
          }

          switch (action) {
            case 'send':
              return await handleSendOrder(req, user, id)
            case 'acknowledge':
              return await handleAcknowledgeOrder(req, user, id)
            case 'receive':
              return await handleReceiveOrder(req, user, id)
            case 'close':
              return await handleCloseOrder(req, user, id)
            case 'cancel':
              return await handleCancelOrder(req, user, id)
            default:
              return createSecureResponse(
                {
                  success: false,
                  error: 'Invalid action'
                },
                400
              )
          }
        } catch (error) {
          console.error('Error in POST /api/purchase-orders/[id]/[action]:', error)
          
          return createSecureResponse(
            {
              success: false,
              error: 'Internal server error'
            },
            500
          )
        }
      })
    )
  )(request, { params })
}

async function handleSendOrder(
  request: NextRequest,
  user: UnifiedAuthenticatedUser,
  id: string
): Promise<Response> {
  // Check permission to send orders
  const canSend = await checkPermission(user, 'send_purchase_orders', 'purchase_orders')
  if (!canSend) {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions to send purchase orders'
      },
      403
    )
  }

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_orders',
    resourceId: id,
    action: 'send'
  })

  const result = await purchaseOrderService.sendPurchaseOrder(id, user.id)

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Failed to send purchase order'
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: result.data,
    message: 'Purchase order sent to vendor successfully'
  })
}

async function handleAcknowledgeOrder(
  request: NextRequest,
  user: UnifiedAuthenticatedUser,
  id: string
): Promise<Response> {
  const body = await request.json()

  // Validate body
  const bodyValidation = await validateInput(body, vendorAcknowledgmentSchema)
  if (!bodyValidation.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Invalid acknowledgment data',
        details: bodyValidation.errors
      },
      400
    )
  }

  // Check permission to process acknowledgments
  const canAcknowledge = await checkPermission(user, 'process_acknowledgments', 'purchase_orders')
  if (!canAcknowledge) {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions to process acknowledgments'
      },
      403
    )
  }

  const acknowledgmentData: VendorAcknowledgment = {
    ...bodyValidation.data!,
    acknowledgedBy: user.id
  }

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_orders',
    resourceId: id,
    action: 'acknowledge'
  })

  const result = await purchaseOrderService.processVendorAcknowledgment(id, acknowledgmentData)

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Failed to process vendor acknowledgment'
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: result.data,
    message: 'Vendor acknowledgment processed successfully'
  })
}

async function handleReceiveOrder(
  request: NextRequest,
  user: UnifiedAuthenticatedUser,
  id: string
): Promise<Response> {
  const body = await request.json()

  // Validate body
  const bodyValidation = await validateInput(body, receiveOrderSchema)
  if (!bodyValidation.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Invalid receiving data',
        details: bodyValidation.errors
      },
      400
    )
  }

  // Check permission to receive orders
  const canReceive = await checkPermission(user, 'receive_purchase_orders', 'purchase_orders')
  if (!canReceive) {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions to receive purchase orders'
      },
      403
    )
  }

  const receiveData: ReceiveOrderInput = {
    ...bodyValidation.data!,
    receivedBy: user.id
  }

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_orders',
    resourceId: id,
    action: 'receive',
    itemCount: receiveData.items.length
  })

  const result = await purchaseOrderService.receivePurchaseOrder(id, receiveData)

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Failed to receive purchase order'
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: result.data,
    message: 'Purchase order received successfully'
  })
}

async function handleCloseOrder(
  request: NextRequest,
  user: UnifiedAuthenticatedUser,
  id: string
): Promise<Response> {
  const body = await request.json()

  // Validate body
  const bodyValidation = await validateInput(body, closeOrderSchema)
  if (!bodyValidation.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Invalid closure data',
        details: bodyValidation.errors
      },
      400
    )
  }

  // Check permission to close orders
  const canClose = await checkPermission(user, 'close_purchase_orders', 'purchase_orders')
  if (!canClose) {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions to close purchase orders'
      },
      403
    )
  }

  const { closureReason } = bodyValidation.data!

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_orders',
    resourceId: id,
    action: 'close'
  })

  const result = await purchaseOrderService.closePurchaseOrder(id, user.id, closureReason)

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Failed to close purchase order'
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: result.data,
    message: 'Purchase order closed successfully'
  })
}

async function handleCancelOrder(
  request: NextRequest,
  user: UnifiedAuthenticatedUser,
  id: string
): Promise<Response> {
  const body = await request.json()

  // Validate body
  const bodyValidation = await validateInput(body, cancelOrderSchema)
  if (!bodyValidation.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Invalid cancellation data',
        details: bodyValidation.errors
      },
      400
    )
  }

  // Check permission to cancel orders
  const canCancel = await checkPermission(user, 'cancel_purchase_orders', 'purchase_orders')
  if (!canCancel) {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions to cancel purchase orders'
      },
      403
    )
  }

  const { reason } = bodyValidation.data!

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_orders',
    resourceId: id,
    action: 'cancel'
  })

  const result = await purchaseOrderService.cancelPurchaseOrder(id, user.id, reason)

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Failed to cancel purchase order'
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: result.data,
    message: 'Purchase order cancelled successfully'
  })
}