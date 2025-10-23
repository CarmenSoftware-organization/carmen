/**
 * Vendor API Routes - Main vendor management endpoints
 * 
 * GET /api/vendors - List all vendors with filtering and pagination
 * POST /api/vendors - Create new vendor
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
import { vendorService, type VendorFilters, type PaginationOptions } from '@/lib/services/db/vendor-service'
import { type VendorBusinessType, type VendorStatus } from '@/lib/types/vendor'
import { authStrategies } from '@/lib/auth/api-protection'
import { type AuthenticatedUser } from '@/lib/middleware/auth'
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Security-enhanced validation schemas
const vendorFiltersSchema = z.object({
  status: z.array(z.enum(['active', 'inactive', 'suspended', 'blacklisted', 'under_review'])).optional(),
  businessType: z.array(z.enum(['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service_provider', 'contractor', 'consultant'])).optional(),
  search: SecureSchemas.safeString(100).optional(),
  preferredCurrency: z.array(z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code')).optional(),
  hasMetrics: z.boolean().optional(),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional()
})

const paginationSchema = z.object({
  page: z.coerce.number().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'status']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

const createVendorSchema = z.object({
  name: SecureSchemas.safeString(255),
  contactEmail: z.string().email().max(255),
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
  notes: SecureSchemas.safeString(1000).optional(),
  createdBy: SecureSchemas.uuid
})

/**
 * GET /api/vendors - List vendors with filtering and pagination
 * Requires authentication and 'read:vendors' permission
 */
const getVendors = withSecurity(
  authStrategies.hybrid(
    withAuthorization('vendors', 'read', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawFilters = {
          status: searchParams.getAll('status') as VendorStatus[] | undefined,
          businessType: searchParams.getAll('businessType') as VendorBusinessType[] | undefined,
          search: searchParams.get('search') || undefined,
          preferredCurrency: searchParams.getAll('preferredCurrency') || undefined,
          hasMetrics: searchParams.get('hasMetrics') === 'true' ? true : undefined,
          createdAfter: searchParams.get('createdAfter') || undefined,
          createdBefore: searchParams.get('createdBefore') || undefined
        }

        const rawPagination = {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined
        }

        // Enhanced security validation
        const filtersValidation = await validateInput(rawFilters, vendorFiltersSchema, {
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

        const filters: VendorFilters = filtersValidation.sanitized || filtersValidation.data!
        const pagination: PaginationOptions = paginationValidation.sanitized || paginationValidation.data!

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'vendors',
          action: 'read',
          filters: {
            hasSearch: !!filters.search,
            statusFilter: filters.status?.length || 0,
            businessTypeFilter: filters.businessType?.length || 0
          },
          pagination
        })

        // Fetch vendors
        const result = await vendorService.getVendors(filters, pagination)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'vendor-service',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to fetch vendors'
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
        console.error('Error in GET /api/vendors:', error)
        
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
export const GET = withRateLimit(RateLimitPresets.API)(getVendors)

/**
 * POST /api/vendors - Create new vendor
 * Requires authentication and 'create:vendors' permission
 */
const createVendor = withSecurity(
  authStrategies.hybrid(
    withAuthorization('vendors', 'create', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json()

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, createVendorSchema, {
          maxLength: 10000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid vendor creation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'vendor_creation'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid vendor data',
              details: validationResult.errors
            },
            400
          )
        }

        // Use sanitized data
        const validatedData = validationResult.sanitized || validationResult.data!
        const vendorData: any = {
          ...validatedData,
          createdBy: user.id // Override with authenticated user ID
        }

        // Additional permission check for vendor status
        if (vendorData.status && !['active', 'inactive'].includes(vendorData.status)) {
          const canSetSpecialStatus = await checkPermission(user, 'manage', 'vendors')
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
          action: 'create',
          vendorName: vendorData.name,
          businessType: vendorData.businessType,
          status: vendorData.status
        })

        // Create vendor
        const result = await vendorService.createVendor(vendorData)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'vendor-service',
            operation: 'create',
            error: result.error
          })

          const statusCode = result.error?.includes('already exists') ? 409 : 500
          return createSecureResponse(
            {
              success: false,
              error: statusCode === 409 ? 'Vendor already exists' : 'Failed to create vendor'
            },
            statusCode
          )
        }

        // Log successful creation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'vendors',
          action: 'create_success',
          vendorId: result.data?.id,
          vendorName: vendorData.name
        })

        return createSecureResponse(
          {
            success: true,
            data: result.data,
            message: 'Vendor created successfully'
          },
          201
        )

      } catch (error) {
        console.error('Error in POST /api/vendors:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create_vendor',
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
      methods: ['POST']
    }
  }
)

// Apply stricter rate limiting for creation endpoints
export const POST = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 vendor creations per hour
  skipSuccessfulRequests: false
})(createVendor)