/**
 * Policies API Routes - Permission management policy endpoints
 * 
 * GET /api/policies - List all policies with filtering and pagination
 * POST /api/policies - Create new policy
 * PUT /api/policies - Bulk operations on policies
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
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Security imports
import { authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'
import type { AuthenticatedUser } from '@/lib/middleware/auth'

// Type imports
import {
  Policy,
  EffectType,
  CombiningAlgorithm
} from '@/lib/types/permissions'

const prisma = new PrismaClient()

// Security-enhanced validation schemas
const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: SecureSchemas.safeString(200).optional(),
  effect: z.enum(['permit', 'deny', 'all']).default('all'),
  status: z.enum(['draft', 'active', 'inactive', 'archived', 'all']).default('all'),
  priority_min: z.coerce.number().int().min(0).max(1000).optional(),
  priority_max: z.coerce.number().int().min(0).max(1000).optional(),
  tags: SecureSchemas.safeString(500).optional(), // Comma-separated tags
  sort_by: z.enum(['name', 'priority', 'created_at', 'updated_at']).default('priority'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

const createPolicySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  priority: z.number().int().min(0).max(1000).default(500),
  effect: z.enum(['permit', 'deny']),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('draft'),
  combiningAlgorithm: z.enum(['deny_overrides', 'permit_overrides', 'first_applicable', 'only_one_applicable']).default('deny_overrides'),
  policyData: z.object({
    target: z.object({
      subjects: z.array(z.object({
        type: SecureSchemas.safeString(100),
        values: z.array(SecureSchemas.safeString(200)).max(50)
      })).max(10).optional(),
      resources: z.array(z.object({
        type: SecureSchemas.safeString(100),
        attributes: z.record(SecureSchemas.safeString(500)).optional()
      })).max(20).optional(),
      actions: z.array(SecureSchemas.safeString(100)).max(50).optional(),
      environment: z.array(z.object({
        attribute: SecureSchemas.safeString(100),
        operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']),
        value: SecureSchemas.safeString(200)
      })).max(20).optional()
    }),
    rules: z.array(z.object({
      id: SecureSchemas.uuid,
      name: SecureSchemas.safeString(255),
      priority: z.number().min(0).max(1000).optional(),
      condition: z.object({
        type: SecureSchemas.safeString(50),
        expressions: z.array(SecureSchemas.safeString(500)).max(10).optional(),
        attribute: SecureSchemas.safeString(100).optional(),
        operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']).optional(),
        value: SecureSchemas.safeString(200).optional()
      })
    })).min(1).max(50),
    obligations: z.array(z.object({
      type: SecureSchemas.safeString(100),
      description: SecureSchemas.safeString(500),
      parameters: z.record(SecureSchemas.safeString(500))
    })).max(10).optional(),
    advice: z.array(z.object({
      type: SecureSchemas.safeString(100),
      message: SecureSchemas.safeString(500),
      parameters: z.record(SecureSchemas.safeString(500)).optional()
    })).max(10).optional()
  }),
  version: SecureSchemas.safeString(20).default('1.0'),
  tags: z.array(SecureSchemas.safeString(50)).max(20).default([]),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional()
})

const updatePolicySchema = createPolicySchema.partial()

const bulkOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'delete', 'update_priority']),
  policyIds: z.array(SecureSchemas.uuid).min(1).max(100),
  data: z.object({
    priority: z.number().int().min(0).max(1000).optional()
  }).optional()
})

/**
 * GET /api/policies - List policies with filtering and pagination
 * Requires authentication and 'read:policies' permission
 */
const getPolicies = withSecurity(
  authStrategies.hybrid(
    withAuthorization('policies', 'read', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const url = new URL(request.url)
        const rawParams = Object.fromEntries(url.searchParams.entries())
        
        const queryValidation = await validateInput(rawParams, querySchema, {
          maxLength: 2000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!queryValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid query parameters',
            threats: queryValidation.threats,
            riskLevel: queryValidation.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid query parameters',
              details: queryValidation.errors
            },
            400
          )
        }

        const query = queryValidation.sanitized || queryValidation.data!

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'policies',
          action: 'read',
          filters: {
            hasSearch: !!query.search,
            effect: query.effect,
            status: query.status,
            pageSize: query.limit
          }
        })

        // Build filters
        const where: any = {}

        if (query.effect && query.effect !== 'all') {
          where.effect = query.effect.toUpperCase()
        }

        if (query.status && query.status !== 'all') {
          where.status = query.status.toUpperCase()
        }
        
        if (query.search) {
          where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } }
          ]
        }
        
        if (query.priority_min !== undefined || query.priority_max !== undefined) {
          where.priority = {}
          if (query.priority_min !== undefined) where.priority.gte = query.priority_min
          if (query.priority_max !== undefined) where.priority.lte = query.priority_max
        }
        
        if (query.tags) {
          const tagList = query.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
          if (tagList.length > 0) {
            where.tags = { hasSome: tagList }
          }
        }

        // Additional role-based filtering
        const roleName = typeof user.role === 'string' ? user.role : user.role.name
        if (roleName === 'department-manager') {
          // Department managers can only see policies they created or department-level policies
          where.OR = [
            { createdBy: user.id },
            { tags: { has: `department:${user.department}` } }
          ]
        } else if (roleName === 'staff') {
          // Staff can only see policies they created
          where.createdBy = user.id
        }

        // Build sorting
        const orderBy: any = {}
        if (query.sort_by === 'name') orderBy.name = query.sort_order
        else if (query.sort_by === 'priority') orderBy.priority = query.sort_order
        else if (query.sort_by === 'created_at') orderBy.createdAt = query.sort_order
        else if (query.sort_by === 'updated_at') orderBy.updatedAt = query.sort_order

        // Execute query with pagination
        const page = query.page ?? 1
        const limit = query.limit ?? 20
        const [policies, totalCount] = await Promise.all([
          prisma.policy.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: {
              _count: {
                select: {
                  evaluationLogs: true,
                  testResults: true,
                  assignedRoles: true
                }
              }
            }
          }),
          prisma.policy.count({ where })
        ])

        // Transform to API format
        const transformedPolicies = policies.map(policy => ({
          id: policy.id,
          name: policy.name,
          description: policy.description,
          priority: policy.priority,
          effect: policy.effect.toLowerCase(),
          status: policy.status.toLowerCase(),
          combiningAlgorithm: policy.combiningAlgorithm.toLowerCase(),
          version: policy.version,
          tags: policy.tags,
          validFrom: policy.validFrom,
          validTo: policy.validTo,
          createdBy: policy.createdBy,
          updatedBy: policy.updatedBy,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt,
          // Statistics
          evaluationCount: policy._count.evaluationLogs,
          testCount: policy._count.testResults,
          assignedRoleCount: policy._count.assignedRoles
        }))

        const response = createSecureResponse({
          success: true,
          data: {
            policies: transformedPolicies,
            pagination: {
              page,
              limit,
              total: totalCount,
              totalPages: Math.ceil(totalCount / limit)
            },
            filters: {
              effect: query.effect,
              status: query.status,
              search: query.search,
              tags: query.tags
            }
          }
        })

        // Add pagination headers
        response.headers.set('X-Total-Count', totalCount.toString())
        response.headers.set('X-Page-Count', Math.ceil(totalCount / limit).toString())
        response.headers.set('X-Current-Page', page.toString())

        return response

      } catch (error) {
        console.error('Error in GET /api/policies:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_policies',
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

export const GET = withRateLimit(RateLimitPresets.API)(getPolicies)

/**
 * POST /api/policies - Create a new policy
 * Requires authentication and 'create:policies' permission
 */
const createPolicy = withSecurity(
  authStrategies.hybrid(
    withAuthorization('policies', 'create', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json()
        
        const validationResult = await validateInput(body, createPolicySchema, {
          maxLength: 50000, // Policies can be complex
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid policy creation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'policy_creation'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid policy data',
              details: validationResult.errors
            },
            400
          )
        }

        const validatedData = validationResult.sanitized || validationResult.data!

        // Additional business logic validation
        if (validatedData.validTo && validatedData.validFrom) {
          const fromDate = new Date(validatedData.validFrom as string)
          const toDate = new Date(validatedData.validTo as string)
          if (fromDate >= toDate) {
            return createSecureResponse(
              {
                success: false,
                error: 'Valid from date must be before valid to date'
              },
              400
            )
          }
        }

        // Role-based creation restrictions
        const roleName = typeof user.role === 'string' ? user.role : user.role.name
        if (validatedData.status === 'active' && !['admin', 'super-admin'].includes(roleName)) {
          return createSecureResponse(
            {
              success: false,
              error: 'Only administrators can create active policies'
            },
            403
          )
        }

        // Check for duplicate policy names
        const existingPolicy = await prisma.policy.findUnique({
          where: { name: validatedData.name as string }
        })

        if (existingPolicy) {
          return createSecureResponse(
            {
              success: false,
              error: 'Policy with this name already exists'
            },
            409
          )
        }

        // Type the policyData properly
        const policyData = validatedData.policyData as {
          target: any
          rules: Array<{ id: string; name: string; priority?: number; condition: any }>
          obligations?: any[]
          advice?: any[]
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'policies',
          action: 'create',
          policyName: validatedData.name,
          effect: validatedData.effect,
          status: validatedData.status,
          priority: validatedData.priority,
          rulesCount: policyData.rules.length
        })

        // Create the policy
        const policy = await prisma.policy.create({
          data: {
            name: validatedData.name as string,
            description: validatedData.description as string | undefined,
            priority: validatedData.priority as number,
            effect: (validatedData.effect as string).toUpperCase() as any,
            status: (validatedData.status as string).toUpperCase() as any,
            combiningAlgorithm: (validatedData.combiningAlgorithm as string).toUpperCase() as any,
            policyData: policyData as any,
            version: validatedData.version as string,
            tags: validatedData.tags as string[],
            validFrom: validatedData.validFrom ? new Date(validatedData.validFrom as string) : null,
            validTo: validatedData.validTo ? new Date(validatedData.validTo as string) : null,
            createdBy: user.id,
            updatedBy: user.id
          }
        })

        // Log the creation
        await prisma.auditLog.create({
          data: {
            eventType: 'POLICY_CREATED',
            eventCategory: 'POLICY',
            eventData: {
              actor: {
                userId: user.id,
                action: 'CREATE'
              },
              resource: {
                resourceType: 'policy',
                resourceId: policy.id,
                resourceName: policy.name
              },
              changes: {
                changeType: 'CREATE',
                newValues: {
                  name: policy.name,
                  effect: policy.effect,
                  status: policy.status,
                  priority: policy.priority
                }
              }
            },
            success: true,
            complianceFlags: ['AUDIT_REQUIRED'],
            source: 'api'
          }
        })

        return createSecureResponse(
          {
            success: true,
            message: 'Policy created successfully',
            data: {
              id: policy.id,
              name: policy.name,
              description: policy.description,
              priority: policy.priority,
              effect: policy.effect.toLowerCase(),
              status: policy.status.toLowerCase(),
              version: policy.version,
              createdAt: policy.createdAt,
              updatedAt: policy.updatedAt
            }
          },
          201
        )

      } catch (error) {
        console.error('Error in POST /api/policies:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create_policy',
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
      maxBodySize: 200 * 1024, // 200KB for complex policies
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['POST']
    }
  }
)

export const POST = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 policy creations per hour
  skipSuccessfulRequests: false
})(createPolicy)

/**
 * PUT /api/policies - Bulk operations on policies
 * Requires authentication and 'manage:policies' permission
 */
const bulkPolicyOperations = withSecurity(
  authStrategies.hybrid(
    withAuthorization('policies', 'manage', async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json()

        const validationResult = await validateInput(body, bulkOperationSchema, {
          maxLength: 10000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid bulk operation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'policy_bulk_operation'
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid bulk operation data',
              details: validationResult.errors
            },
            400
          )
        }

        const { operation, policyIds, data } = validationResult.sanitized || validationResult.data!

        // Additional validation for specific operations
        if (operation === 'update_priority') {
          if (!data?.priority || typeof data.priority !== 'number') {
            return createSecureResponse(
              {
                success: false,
                error: 'Priority value required for priority update operation'
              },
              400
            )
          }
        }

        // Role-based operation restrictions
        const roleName = typeof user.role === 'string' ? user.role : user.role.name
        if (operation === 'activate' && !['admin', 'super-admin'].includes(roleName)) {
          return createSecureResponse(
            {
              success: false,
              error: 'Only administrators can activate policies'
            },
            403
          )
        }

        if (operation === 'delete' && !['admin', 'super-admin'].includes(roleName)) {
          return createSecureResponse(
            {
              success: false,
              error: 'Only administrators can delete policies'
            },
            403
          )
        }

        // Log bulk operation
        await auditSecurityEvent(SecurityEventType.BULK_OPERATION, request, user.id, {
          resource: 'policies',
          operation: operation,
          entityCount: policyIds.length,
          operationType: 'bulk',
          policyIds: policyIds
        })

        let result: any = {}

        switch (operation) {
          case 'activate':
            result = await prisma.policy.updateMany({
              where: { id: { in: policyIds } },
              data: { 
                status: 'ACTIVE',
                updatedBy: user.id,
                updatedAt: new Date()
              }
            })
            break

          case 'deactivate':
            result = await prisma.policy.updateMany({
              where: { id: { in: policyIds } },
              data: { 
                status: 'INACTIVE',
                updatedBy: user.id,
                updatedAt: new Date()
              }
            })
            break

          case 'delete':
            result = await prisma.policy.updateMany({
              where: { id: { in: policyIds } },
              data: { 
                status: 'ARCHIVED',
                updatedBy: user.id,
                updatedAt: new Date()
              }
            })
            break

          case 'update_priority':
            result = await prisma.policy.updateMany({
              where: { id: { in: policyIds } },
              data: { 
                priority: data!.priority,
                updatedBy: user.id,
                updatedAt: new Date()
              }
            })
            break
        }

        // Log bulk operation in audit log
        await prisma.auditLog.create({
          data: {
            eventType: 'POLICY_BULK_OPERATION',
            eventCategory: 'POLICY',
            eventData: {
              actor: {
                userId: user.id,
                action: 'BULK_UPDATE'
              },
              operation: operation,
              affectedPolicies: policyIds,
              data: data
            },
            success: true,
            complianceFlags: ['AUDIT_REQUIRED'],
            source: 'api'
          }
        })

        return createSecureResponse({
          success: true,
          message: `Bulk ${operation} completed successfully`,
          data: {
            operation,
            affectedCount: result.count,
            policyIds
          }
        })

      } catch (error) {
        console.error('Error in PUT /api/policies:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'bulk_policy_operation',
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
      maxBodySize: 50 * 1024, // 50KB max for bulk operations
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['PUT']
    }
  }
)

export const PUT = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 bulk operations per hour
  skipSuccessfulRequests: false
})(bulkPolicyOperations)