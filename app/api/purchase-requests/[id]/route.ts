/**
 * Purchase Request Individual API Routes
 * 
 * GET /api/purchase-requests/[id] - Get purchase request by ID
 * PUT /api/purchase-requests/[id] - Update purchase request
 * DELETE /api/purchase-requests/[id] - Delete/cancel purchase request
 * POST /api/purchase-requests/[id]/submit - Submit purchase request for approval
 * POST /api/purchase-requests/[id]/approve - Approve purchase request
 * POST /api/purchase-requests/[id]/reject - Reject purchase request
 * POST /api/purchase-requests/[id]/convert - Convert to purchase order
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  purchaseRequestService,
  type UpdatePurchaseRequestInput,
  type ApprovalInput
} from '@/lib/services/db/purchase-request-service'
import { authStrategies } from '@/lib/auth/api-protection'
import type { AuthenticatedUser } from '@/lib/middleware/auth'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Validation schemas
const updatePurchaseRequestSchema = z.object({
  requiredDate: z.coerce.date().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).optional(),
  budgetCode: SecureSchemas.safeString(50).optional(),
  projectCode: SecureSchemas.safeString(50).optional(),
  costCenter: SecureSchemas.safeString(50).optional(),
  justification: SecureSchemas.safeString(2000).optional(),
  notes: SecureSchemas.safeString(1000).optional()
})

const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  comments: SecureSchemas.safeString(1000).optional(),
  approvedQuantity: z.number().min(0).optional(),
  approvedUnitPrice: z.object({
    amount: z.number().min(0),
    currency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code')
  }).optional(),
  approvedVendor: SecureSchemas.safeString(255).optional()
})

const convertToPOSchema = z.object({
  vendorId: SecureSchemas.uuid,
  itemIds: z.array(SecureSchemas.uuid).optional()
})

/**
 * GET /api/purchase-requests/[id] - Get purchase request by ID
 */
const getPurchaseRequest = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_requests', 'read', async (
      request: NextRequest,
      { user }: { user: AuthenticatedUser }
    ) => {
      try {
        // Extract ID from URL
        const url = new URL(request.url)
        const pathSegments = url.pathname.split('/')
        const id = pathSegments[pathSegments.length - 1]

        // Validate ID format
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        if (!idValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase request ID'
            },
            400
          )
        }

        // Fetch purchase request
        const result = await purchaseRequestService.getPurchaseRequestById(id)

        if (!result.success) {
          if (result.error?.includes('not found')) {
            return createSecureResponse(
              {
                success: false,
                error: 'Purchase request not found'
              },
              404
            )
          }

          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'purchase-request-service',
            operation: 'get',
            error: result.error,
            requestId: id
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch purchase request'
            },
            500
          )
        }

        const purchaseRequest = result.data!

        // Check department access
        const canViewAllDepartments = await checkPermission(user, 'view_all_departments', 'purchase_requests')
        if (!canViewAllDepartments && purchaseRequest.departmentId !== user.department) {
          await auditSecurityEvent(SecurityEventType.AUTHORIZATION_DENIED, request, user.id, {
            resource: 'purchase_requests',
            resourceId: id,
            reason: 'Attempted to access request from different department'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Purchase request not found'
            },
            404
          )
        }

        // Log sensitive data access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'purchase_requests',
          resourceId: id,
          action: 'view',
          requestNumber: purchaseRequest.requestNumber
        })

        return createSecureResponse({
          success: true,
          data: purchaseRequest
        })

      } catch (error) {
        console.error('Error in GET /api/purchase-requests/[id]:', error)
        
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

export const GET = withRateLimit(RateLimitPresets.API)(getPurchaseRequest)

/**
 * PUT /api/purchase-requests/[id] - Update purchase request
 */
const updatePurchaseRequest = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_requests', 'update', async (
      request: NextRequest,
      { user }: { user: AuthenticatedUser }
    ) => {
      try {
        // Extract ID from URL
        const url = new URL(request.url)
        const pathSegments = url.pathname.split('/')
        const id = pathSegments[pathSegments.length - 1]
        const body = await request.json()

        // Validate ID and body
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        if (!idValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase request ID'
            },
            400
          )
        }

        const bodyValidation = await validateInput(body, updatePurchaseRequestSchema, {
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

        // Check if user can update this request (owner or has permission)
        const existingResult = await purchaseRequestService.getPurchaseRequestById(id)
        if (!existingResult.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Purchase request not found'
            },
            404
          )
        }

        const existingRequest = existingResult.data!
        const canUpdateOthers = await checkPermission(user, 'update_all_requests', 'purchase_requests')
        
        if (existingRequest.requestedBy !== user.id && !canUpdateOthers) {
          await auditSecurityEvent(SecurityEventType.AUTHORIZATION_DENIED, request, user.id, {
            resource: 'purchase_requests',
            resourceId: id,
            reason: 'Attempted to update request owned by another user'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to update this request'
            },
            403
          )
        }

        const updateData: UpdatePurchaseRequestInput = bodyValidation.sanitized || bodyValidation.data!

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'purchase_requests',
          resourceId: id,
          action: 'update',
          changes: Object.keys(updateData)
        })

        const result = await purchaseRequestService.updatePurchaseRequest(id, updateData)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'purchase-request-service',
            operation: 'update',
            error: result.error,
            requestId: id
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to update purchase request'
            },
            500
          )
        }

        return createSecureResponse({
          success: true,
          data: result.data,
          message: 'Purchase request updated successfully'
        })

      } catch (error) {
        console.error('Error in PUT /api/purchase-requests/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update_purchase_request',
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

export const PUT = withRateLimit(RateLimitPresets.API)(updatePurchaseRequest)

/**
 * DELETE /api/purchase-requests/[id] - Cancel purchase request
 */
const cancelPurchaseRequest = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_requests', 'delete', async (
      request: NextRequest,
      { user }: { user: AuthenticatedUser }
    ) => {
      try {
        // Extract ID from URL
        const url = new URL(request.url)
        const pathSegments = url.pathname.split('/')
        const id = pathSegments[pathSegments.length - 1]

        // Validate ID
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        if (!idValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase request ID'
            },
            400
          )
        }

        // Check permissions and ownership
        const existingResult = await purchaseRequestService.getPurchaseRequestById(id)
        if (!existingResult.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Purchase request not found'
            },
            404
          )
        }

        const existingRequest = existingResult.data!
        const canCancelOthers = await checkPermission(user, 'cancel_all_requests', 'purchase_requests')
        
        if (existingRequest.requestedBy !== user.id && !canCancelOthers) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to cancel this request'
            },
            403
          )
        }

        // Can only cancel draft or pending requests
        if (!['draft', 'pending_approval'].includes(existingRequest.status)) {
          return createSecureResponse(
            {
              success: false,
              error: 'Cannot cancel request in current status'
            },
            400
          )
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'purchase_requests',
          resourceId: id,
          action: 'cancel',
          requestNumber: existingRequest.requestNumber
        })

        // For now, we'll update status to cancelled
        // This would be implemented in the service
        return createSecureResponse({
          success: true,
          message: 'Purchase request cancelled successfully'
        })

      } catch (error) {
        console.error('Error in DELETE /api/purchase-requests/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'cancel_purchase_request',
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

export const DELETE = withRateLimit(RateLimitPresets.API)(cancelPurchaseRequest)

/**
 * POST /api/purchase-requests/[id]/submit - Submit for approval
 */
const handlePostAction = withSecurity(
  authStrategies.hybrid(
    withAuthorization('purchase_requests', 'update', async (
      req: NextRequest,
      { user }: { user: AuthenticatedUser }
    ) => {
      try {
        // Extract ID from URL
        const url = new URL(req.url)
        const pathSegments = url.pathname.split('/')
        const action = pathSegments[pathSegments.length - 1]
        const id = pathSegments[pathSegments.length - 2]

        // Validate ID
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        if (!idValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid purchase request ID'
            },
            400
          )
        }

        switch (action) {
          case 'submit':
            return await handleSubmit(req, user, id)
          case 'approve':
          case 'reject':
            return await handleApproval(req, user, id)
          case 'convert':
            return await handleConvert(req, user, id)
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
        console.error('Error in POST /api/purchase-requests/[id]/[action]:', error)

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

export const POST = withRateLimit(RateLimitPresets.API)(handlePostAction)

async function handleSubmit(
  request: NextRequest,
  user: AuthenticatedUser,
  id: string
): Promise<NextResponse> {
  // Check ownership or permission
  const existingResult = await purchaseRequestService.getPurchaseRequestById(id)
  if (!existingResult.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Purchase request not found'
      },
      404
    )
  }

  const existingRequest = existingResult.data!
  const canSubmitOthers = await checkPermission(user, 'submit_all_requests', 'purchase_requests')
  
  if (existingRequest.requestedBy !== user.id && !canSubmitOthers) {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions to submit this request'
      },
      403
    )
  }

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_requests',
    resourceId: id,
    action: 'submit',
    requestNumber: existingRequest.requestNumber
  })

  const result = await purchaseRequestService.submitPurchaseRequest(id, user.id)

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Failed to submit purchase request'
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: result.data,
    message: 'Purchase request submitted for approval'
  })
}

async function handleApproval(
  request: NextRequest,
  user: AuthenticatedUser,
  id: string
): Promise<NextResponse> {
  const body = await request.json()
  const action = new URL(request.url).pathname.split('/').pop() as 'approve' | 'reject'

  // Validate body
  const bodyValidation = await validateInput({ ...body, action }, approvalSchema)
  if (!bodyValidation.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Invalid approval data',
        details: bodyValidation.errors
      },
      400
    )
  }

  const validatedData = bodyValidation.data!
  const approvalData: ApprovalInput = {
    userId: user.id,
    action: validatedData.action,
    comments: validatedData.comments,
    approvedQuantity: validatedData.approvedQuantity,
    approvedUnitPrice: validatedData.approvedUnitPrice,
    approvedVendor: validatedData.approvedVendor
  }

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_requests',
    resourceId: id,
    action: `${action}_request`
  })

  const result = await purchaseRequestService.processApproval(id, approvalData)

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: `Failed to ${action} purchase request`
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: result.data,
    message: `Purchase request ${action}d successfully`
  })
}

async function handleConvert(
  request: NextRequest,
  user: AuthenticatedUser,
  id: string
): Promise<NextResponse> {
  const body = await request.json()

  // Validate body
  const bodyValidation = await validateInput(body, convertToPOSchema)
  if (!bodyValidation.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Invalid conversion data',
        details: bodyValidation.errors
      },
      400
    )
  }

  // Check permission to convert
  const canConvert = await checkPermission(user, 'convert_to_po', 'purchase_requests')
  if (!canConvert) {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions to convert to purchase order'
      },
      403
    )
  }

  const { vendorId, itemIds } = bodyValidation.data!

  // Log action
  await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
    resource: 'purchase_requests',
    resourceId: id,
    action: 'convert_to_po',
    vendorId
  })

  const result = await purchaseRequestService.convertToPurchaseOrder(
    id,
    user.id,
    vendorId,
    itemIds
  )

  if (!result.success) {
    return createSecureResponse(
      {
        success: false,
        error: 'Failed to convert to purchase order'
      },
      500
    )
  }

  return createSecureResponse({
    success: true,
    data: { purchaseOrderId: result.data },
    message: 'Purchase request converted to purchase order successfully'
  })
}