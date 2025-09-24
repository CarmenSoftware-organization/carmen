/**
 * Vendor API Routes - Single vendor management
 * 
 * GET /api/vendors/[id] - Get vendor by ID with calculated metrics
 * PUT /api/vendors/[id] - Update vendor
 * DELETE /api/vendors/[id] - Soft delete vendor
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { vendorService } from '@/lib/services/db/vendor-service'
import { type VendorBusinessType, type VendorStatus } from '@/lib/types/vendor'
import { withUnifiedAuth, type UnifiedAuthenticatedUser, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Validation schemas
const updateVendorSchema = z.object({
  name: SecureSchemas.safeString(255).min(1).optional(),
  contactEmail: z.string().email().max(255).optional(),
  contactPhone: SecureSchemas.phoneNumber.optional(),
  address: z.object({
    street: SecureSchemas.safeString(200).optional(),
    city: SecureSchemas.safeString(100).optional(),
    state: SecureSchemas.safeString(100).optional(),
    postalCode: SecureSchemas.safeString(20).optional(),
    country: SecureSchemas.safeString(100).optional()
  }).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'blacklisted', 'under_review']).optional(),
  preferredCurrency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code').optional(),
  paymentTerms: SecureSchemas.safeString(500).optional(),
  companyRegistration: SecureSchemas.safeString(100).optional(),
  taxId: SecureSchemas.safeString(50).optional(),
  website: z.string().url().max(255).optional().or(z.literal('')),
  businessType: z.enum(['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service_provider', 'contractor', 'consultant']).optional(),
  certifications: z.array(SecureSchemas.safeString(100)).max(20).optional(),
  languages: z.array(SecureSchemas.safeString(50)).max(10).optional(),
  notes: SecureSchemas.safeString(1000).optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/vendors/[id] - Get vendor by ID with calculated metrics
 * Requires authentication and 'read:vendors' permission
 */
const getVendorWithAuth = withSecurity(
  authStrategies.hybrid(
    withAuthorization('vendors', 'read', async (
      request: NextRequest,
      { user }: { user: UnifiedAuthenticatedUser },
      { params }: RouteParams
    ) => {
      try {
        // Extract ID from injected params or URL
        const params = (request as any)._params
        const id = params?.id || new URL(request.url).pathname.split('/').pop()

        // Enhanced security validation
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }), {
          maxLength: 100,
          removeSuspiciousPatterns: true
        })

        if (!idValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid vendor ID format',
            threats: idValidation.threats,
            riskLevel: idValidation.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid vendor ID format'
            },
            400
          )
        }

        // Log data access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'vendors',
          action: 'read_single',
          vendorId: id
        })

        // Fetch vendor
        const result = await vendorService.getVendorById(id)

        if (!result.success) {
          const statusCode = result.error === 'Vendor not found' ? 404 : 500
          
          if (statusCode === 500) {
            await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
              component: 'vendor-service',
              operation: 'getVendorById',
              error: result.error
            })
          }

          return createSecureResponse(
            {
              success: false,
              error: result.error
            },
            statusCode
          )
        }

        return createSecureResponse({
          success: true,
          data: result.data
        })

      } catch (error) {
        console.error('Error in GET /api/vendors/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_vendor_by_id',
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

const getVendor = withSecurity(
  getVendorWithAuth,
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Inject params into request for extraction in auth handler
  Object.defineProperty(request, '_params', { value: params, writable: false })
  return withRateLimit(RateLimitPresets.API)(getVendor)(request)
}

/**
 * PUT /api/vendors/[id] - Update vendor
 * Requires authentication and 'update:vendors' permission
 */
const updateVendorWithAuth = withSecurity(
  authStrategies.hybrid(
    withAuthorization('vendors', 'update', async (
      request: NextRequest,
      { user }: { user: UnifiedAuthenticatedUser },
      { params }: RouteParams
    ) => {
      try {
        // Extract ID from injected params or URL
        const params = (request as any)._params
        const id = params?.id || new URL(request.url).pathname.split('/').pop()
        const body = await request.json()

        // Enhanced security validation for ID
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        
        if (!idValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid vendor ID format',
            threats: idValidation.threats,
            riskLevel: idValidation.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid vendor ID format'
            },
            400
          )
        }

        // Enhanced security validation for body
        const bodyValidation = await validateInput(body, updateVendorSchema, {
          maxLength: 10000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })
        
        if (!bodyValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid vendor update data',
            threats: bodyValidation.threats,
            riskLevel: bodyValidation.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid vendor data',
              details: bodyValidation.errors
            },
            400
          )
        }

        const vendorData = bodyValidation.sanitized || bodyValidation.data!

        // Additional permission check for vendor status
        if (vendorData.status && !['active', 'inactive'].includes(vendorData.status)) {
          const canSetSpecialStatus = await checkPermission(user, 'manage_vendors', 'vendors')
          if (!canSetSpecialStatus) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to set vendor status'
              },
              403
            )
          }
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'vendors',
          action: 'update',
          vendorId: id,
          changes: Object.keys(vendorData)
        })

        // Update vendor
        const result = await vendorService.updateVendor(id, vendorData)

        if (!result.success) {
          let statusCode = 500
          if (result.error === 'Vendor not found') {
            statusCode = 404
          } else if (result.error?.includes('already exists')) {
            statusCode = 409
          }

          if (statusCode === 500) {
            await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
              component: 'vendor-service',
              operation: 'updateVendor',
              error: result.error
            })
          }

          return createSecureResponse(
            {
              success: false,
              error: result.error
            },
            statusCode
          )
        }

        return createSecureResponse({
          success: true,
          data: result.data,
          message: 'Vendor updated successfully'
        })

      } catch (error) {
        console.error('Error in PUT /api/vendors/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update_vendor',
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
      maxBodySize: 50 * 1024,
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['PUT']
    }
  }
)

const updateVendor = withSecurity(
  updateVendorWithAuth,
  {
    validationConfig: {
      maxBodySize: 50 * 1024,
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['PUT']
    }
  }
)

export async function PUT(request: NextRequest, { params }: RouteParams) {
  Object.defineProperty(request, '_params', { value: params, writable: false })
  return withRateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 30,
    skipSuccessfulRequests: false
  })(updateVendor)(request)
}

/**
 * DELETE /api/vendors/[id] - Soft delete vendor (mark as inactive)
 * Requires authentication and 'delete:vendors' permission
 */
const deleteVendorWithAuth = withSecurity(
  authStrategies.hybrid(
    withAuthorization('vendors', 'delete', async (
      request: NextRequest,
      { user }: { user: UnifiedAuthenticatedUser },
      { params }: RouteParams
    ) => {
      try {
        // Extract ID from injected params or URL
        const params = (request as any)._params
        const id = params?.id || new URL(request.url).pathname.split('/').pop()

        // Enhanced security validation
        const idValidation = await validateInput({ id }, z.object({ id: SecureSchemas.uuid }))
        
        if (!idValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid vendor ID format',
            threats: idValidation.threats,
            riskLevel: idValidation.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid vendor ID format'
            },
            400
          )
        }

        // Log sensitive data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'vendors',
          action: 'delete',
          vendorId: id,
          severity: 'high'
        })

        // Delete vendor (soft delete)
        const result = await vendorService.deleteVendor(id)

        if (!result.success) {
          const statusCode = result.error === 'Vendor not found' ? 404 : 500
          
          if (statusCode === 500) {
            await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
              component: 'vendor-service',
              operation: 'deleteVendor',
              error: result.error
            })
          }

          return createSecureResponse(
            {
              success: false,
              error: result.error
            },
            statusCode
          )
        }

        return createSecureResponse({
          success: true,
          message: 'Vendor successfully deactivated'
        })

      } catch (error) {
        console.error('Error in DELETE /api/vendors/[id]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'delete_vendor',
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
      validateOrigin: true
    },
    corsConfig: {
      methods: ['DELETE']
    }
  }
)

const deleteVendor = withSecurity(
  deleteVendorWithAuth,
  {
    validationConfig: {
      maxBodySize: 0,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['DELETE']
    }
  }
)

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  Object.defineProperty(request, '_params', { value: params, writable: false })
  return withRateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    skipSuccessfulRequests: false
  })(deleteVendor)(request)
}

