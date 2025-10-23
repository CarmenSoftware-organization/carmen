/**
 * Secure API Route Template
 * 
 * This template provides a comprehensive security implementation pattern
 * for all API endpoints in the Carmen ERP application. Use this as a
 * reference when implementing security for new endpoints.
 * 
 * @author Carmen ERP Security Team
 * @version 2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Security imports - Always include these
import { withAuth, type AuthenticatedUser } from '@/lib/middleware/auth';
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac';
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security';
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter';
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator';
import { SecurityEventType } from '@/lib/security/audit-logger';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * Query parameter validation schema
 * Customize based on your endpoint's query parameters
 */
const queryParamsSchema = z.object({
  // Common query parameters
  page: z.coerce.number().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: SecureSchemas.safeString(200).optional(),
  sortBy: z.enum(['id', 'name', 'created_at', 'updated_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  
  // Add endpoint-specific query parameters here
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  category: SecureSchemas.safeString(50).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
});

/**
 * Create entity validation schema
 * Customize based on your entity structure
 */
const createEntitySchema = z.object({
  name: SecureSchemas.safeString(255),
  description: SecureSchemas.safeString(1000).optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  tags: z.array(SecureSchemas.safeString(50)).max(10).optional(),
  metadata: z.record(SecureSchemas.safeString(500)).optional(),

  // Add entity-specific fields here
  // category: z.enum(['type1', 'type2', 'type3']),
  // priority: z.number().min(1).max(10).optional().default(5),
  // assignedTo: SecureSchemas.uuid.optional(),
});

/**
 * Update entity validation schema
 * All fields are optional except ID
 */
const updateEntitySchema = z.object({
  id: SecureSchemas.uuid,
  name: SecureSchemas.safeString(255).optional(),
  description: SecureSchemas.safeString(1000).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  tags: z.array(SecureSchemas.safeString(50)).max(10).optional(),
  metadata: z.record(SecureSchemas.safeString(500)).optional(),

  // Add entity-specific fields here (all optional)
});

/**
 * Delete entity validation schema
 */
const deleteEntitySchema = z.object({
  id: SecureSchemas.uuid
});

/**
 * Bulk operation validation schema
 */
const bulkOperationSchema = z.object({
  operation: z.enum(['delete', 'update_status', 'assign', 'export']),
  entityIds: z.array(SecureSchemas.uuid).min(1).max(100),
  data: z.record(z.any()).optional() // Operation-specific data
});

// =============================================================================
// PERMISSION MAPPINGS
// =============================================================================

/**
 * Define resource name and permission mappings
 * Update these based on your endpoint's resource and permissions
 */
const RESOURCE_NAME = 'entities'; // Change this to your resource name
const PERMISSIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage'
} as const;

/**
 * Role-based operation restrictions
 * Define which roles can perform which operations
 */
const ROLE_RESTRICTIONS: Record<string, readonly string[]> = {
  'staff': ['read'],
  'counter': ['read', 'create'],
  'chef': ['read', 'create', 'update'],
  'purchasing-staff': ['read', 'create', 'update'],
  'department-manager': ['read', 'create', 'update', 'delete'],
  'financial-manager': ['read', 'create', 'update'],
  'admin': ['read', 'create', 'update', 'delete', 'manage'],
  'super-admin': ['read', 'create', 'update', 'delete', 'manage']
};

// =============================================================================
// RATE LIMITING CONFIGURATIONS
// =============================================================================

const RATE_LIMITS = {
  GET: RateLimitPresets.API,
  POST: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 creations per hour
    skipSuccessfulRequests: false
  },
  PUT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200, // 200 updates per hour
    skipSuccessfulRequests: true
  },
  DELETE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 deletions per hour
    skipSuccessfulRequests: false
  }
};

// =============================================================================
// GET ENDPOINT - READ OPERATIONS
// =============================================================================

/**
 * GET /api/your-endpoint - List entities with filtering and pagination
 * Requires authentication and 'read:resource' permission
 */
const getEntities = withSecurity(
  withAuth(
    withAuthorization(RESOURCE_NAME, PERMISSIONS.READ, async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url);
        
        // Parse and validate query parameters
        const rawQuery = {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          search: searchParams.get('search') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          status: searchParams.get('status') || undefined,
          category: searchParams.get('category') || undefined,
          dateFrom: searchParams.get('dateFrom') || undefined,
          dateTo: searchParams.get('dateTo') || undefined
        };

        const queryValidation = await validateInput(rawQuery, queryParamsSchema, {
          maxLength: 1000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        });

        if (!queryValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid query parameters',
            threats: queryValidation.threats,
            riskLevel: queryValidation.riskLevel
          });

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid query parameters',
              details: queryValidation.errors
            },
            400
          );
        }

        const queryParams = queryValidation.sanitized || queryValidation.data!;

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: RESOURCE_NAME,
          action: 'read',
          filters: {
            hasSearch: !!queryParams.search,
            status: queryParams.status,
            category: queryParams.category,
            pageSize: queryParams.limit
          }
        });

        // TODO: Replace with actual database query
        // const result = await entityService.getEntities(queryParams, user);
        const mockEntities: any[] = []; // Replace with actual data
        const totalCount = 0; // Replace with actual count

        // Apply role-based filtering if needed
        let filteredEntities = mockEntities;
        if (user.role.name === 'staff') {
          // Staff can only see their own entities
          filteredEntities = mockEntities.filter((entity: any) => entity.createdBy === user.id);
        } else if (user.role.name === 'department-manager') {
          // Department managers can see their department's entities
          filteredEntities = mockEntities.filter((entity: any) => entity.department === user.department);
        }

        const response = createSecureResponse({
          success: true,
          data: {
            entities: filteredEntities,
            pagination: {
              page: queryParams.page!,
              limit: queryParams.limit!,
              total: totalCount,
              pages: Math.ceil(totalCount / queryParams.limit!)
            }
          }
        });

        // Add pagination headers
        response.headers.set('X-Total-Count', totalCount.toString());
        response.headers.set('X-Page-Count', Math.ceil(totalCount / queryParams.limit!).toString());
        response.headers.set('X-Current-Page', queryParams.page!.toString());

        return response;

      } catch (error) {
        console.error(`Error in GET /api/${RESOURCE_NAME}:`, error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_entities',
          stack: error instanceof Error ? error.stack : undefined
        });

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        );
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
);

export const GET = withRateLimit(RATE_LIMITS.GET)(getEntities);

// =============================================================================
// POST ENDPOINT - CREATE OPERATIONS
// =============================================================================

/**
 * POST /api/your-endpoint - Create new entity
 * Requires authentication and 'create:resource' permission
 */
const createEntity = withSecurity(
  withAuth(
    withAuthorization(RESOURCE_NAME, PERMISSIONS.CREATE, async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json();

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, createEntitySchema, {
          maxLength: 10000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        });

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid entity creation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'entity_creation'
          });

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid entity data',
              details: validationResult.errors
            },
            400
          );
        }

        const entityData = validationResult.sanitized || validationResult.data!;

        // Additional business logic validation
        // Add your specific validation rules here
        
        // Role-based creation restrictions
        if (!ROLE_RESTRICTIONS[user.role.name]?.includes('create')) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to create entities'
            },
            403
          );
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: RESOURCE_NAME,
          action: 'create',
          entityName: entityData.name,
          status: entityData.status
        });

        // TODO: Replace with actual database operation
        // const result = await entityService.createEntity(entityData, user);
        const createdEntity = {
          id: `entity-${Date.now()}`,
          ...entityData,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Log successful creation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: RESOURCE_NAME,
          action: 'create_success',
          entityId: createdEntity.id,
          entityName: entityData.name
        });

        return createSecureResponse(
          {
            success: true,
            message: 'Entity created successfully',
            data: createdEntity
          },
          201
        );

      } catch (error) {
        console.error(`Error in POST /api/${RESOURCE_NAME}:`, error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create_entity',
          stack: error instanceof Error ? error.stack : undefined
        });

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        );
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
);

export const POST = withRateLimit(RATE_LIMITS.POST)(createEntity);

// =============================================================================
// PUT ENDPOINT - UPDATE OPERATIONS
// =============================================================================

/**
 * PUT /api/your-endpoint - Update entity
 * Requires authentication and 'update:resource' permission
 */
const updateEntity = withSecurity(
  withAuth(
    withAuthorization(RESOURCE_NAME, PERMISSIONS.UPDATE, async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json();

        // Enhanced security validation
        const validationResult = await validateInput(body, updateEntitySchema, {
          maxLength: 10000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        });

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid entity update data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'entity_update'
          });

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid entity data',
              details: validationResult.errors
            },
            400
          );
        }

        const { id, ...updateData } = validationResult.sanitized || validationResult.data!;

        // Additional permission checks
        // TODO: Check if user can update this specific entity
        // const entity = await entityService.getEntityById(id);
        // if (entity.createdBy !== user.id && user.role !== 'admin') {
        //   return createSecureResponse({ success: false, error: 'Cannot update entity created by another user' }, 403);
        // }

        // Role-based update restrictions
        if (!ROLE_RESTRICTIONS[user.role.name]?.includes('update')) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to update entities'
            },
            403
          );
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: RESOURCE_NAME,
          action: 'update',
          entityId: id,
          updatedFields: Object.keys(updateData)
        });

        // TODO: Replace with actual database operation
        // const result = await entityService.updateEntity(id, updateData, user);
        const updatedEntity = {
          id,
          ...updateData,
          updatedBy: user.id,
          updatedAt: new Date().toISOString()
        };

        return createSecureResponse({
          success: true,
          message: 'Entity updated successfully',
          data: updatedEntity
        });

      } catch (error) {
        console.error(`Error in PUT /api/${RESOURCE_NAME}:`, error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update_entity',
          stack: error instanceof Error ? error.stack : undefined
        });

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        );
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
      methods: ['PUT']
    }
  }
);

export const PUT = withRateLimit(RATE_LIMITS.PUT)(updateEntity);

// =============================================================================
// DELETE ENDPOINT - DELETE OPERATIONS
// =============================================================================

/**
 * DELETE /api/your-endpoint - Delete entity
 * Requires authentication and 'delete:resource' permission
 */
const deleteEntity = withSecurity(
  withAuth(
    withAuthorization(RESOURCE_NAME, PERMISSIONS.DELETE, async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url);
        const entityId = searchParams.get('id');

        // Validate entity ID
        const validationResult = await validateInput({ id: entityId }, deleteEntitySchema, {
          maxLength: 100,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        });

        if (!validationResult.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid entity ID',
              details: validationResult.errors
            },
            400
          );
        }

        const { id } = validationResult.sanitized || validationResult.data!;

        // Additional permission checks
        // TODO: Check if user can delete this specific entity
        // const entity = await entityService.getEntityById(id);
        // if (entity.createdBy !== user.id && user.role !== 'admin') {
        //   return createSecureResponse({ success: false, error: 'Cannot delete entity created by another user' }, 403);
        // }

        // Role-based deletion restrictions
        if (!ROLE_RESTRICTIONS[user.role.name]?.includes('delete')) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to delete entities'
            },
            403
          );
        }

        // Log sensitive operation
        await auditSecurityEvent(SecurityEventType.DATA_DELETION, request, user.id, {
          resource: RESOURCE_NAME,
          action: 'delete',
          entityId: id,
          reason: 'User requested deletion'
        });

        // TODO: Replace with actual database operation
        // Consider soft delete vs hard delete based on business requirements
        // const result = await entityService.deleteEntity(id, user);

        return createSecureResponse({
          success: true,
          message: 'Entity deleted successfully',
          data: { deletedEntityId: id }
        });

      } catch (error) {
        console.error(`Error in DELETE /api/${RESOURCE_NAME}:`, error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'delete_entity',
          stack: error instanceof Error ? error.stack : undefined
        });

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        );
      }
    })
  ),
  {
    validationConfig: {
      maxBodySize: 0, // No body for DELETE requests
      validateOrigin: true
    },
    corsConfig: {
      methods: ['DELETE']
    }
  }
);

export const DELETE = withRateLimit(RATE_LIMITS.DELETE)(deleteEntity);

// =============================================================================
// UTILITY FUNCTIONS AND PATTERNS
// =============================================================================

/**
 * Bulk operations handler (optional)
 * Use for endpoints that need to handle multiple entities at once
 */
export const handleBulkOperation = withSecurity(
  withAuth(
    withAuthorization(RESOURCE_NAME, PERMISSIONS.MANAGE, async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
      try {
        const body = await request.json();

        const validationResult = await validateInput(body, bulkOperationSchema, {
          maxLength: 50000, // Larger limit for bulk operations
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        });

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid bulk operation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel
          });

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid bulk operation data',
              details: validationResult.errors
            },
            400
          );
        }

        const { operation, entityIds, data } = validationResult.sanitized || validationResult.data!;

        // Additional validation - limit bulk operations
        if (entityIds.length > 100) {
          return createSecureResponse(
            {
              success: false,
              error: 'Bulk operations limited to 100 entities at once'
            },
            400
          );
        }

        // Log bulk operation
        await auditSecurityEvent(SecurityEventType.BULK_OPERATION, request, user.id, {
          resource: RESOURCE_NAME,
          action: operation,
          entityCount: entityIds.length,
          operationType: 'bulk'
        });

        // TODO: Implement bulk operation logic
        // const result = await entityService.bulkOperation(operation, entityIds, data, user);

        return createSecureResponse({
          success: true,
          message: `Bulk ${operation} completed successfully`,
          data: {
            processedCount: entityIds.length,
            operation,
            entityIds
          }
        });

      } catch (error) {
        console.error(`Error in bulk operation /api/${RESOURCE_NAME}:`, error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'bulk_operation',
          stack: error instanceof Error ? error.stack : undefined
        });

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        );
      }
    })
  ),
  {
    validationConfig: {
      maxBodySize: 100 * 1024, // 100KB max for bulk operations
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['POST']
    }
  }
);

// =============================================================================
// IMPLEMENTATION CHECKLIST
// =============================================================================

/**
 * SECURITY IMPLEMENTATION CHECKLIST
 * 
 * □ Import all required security middleware
 * □ Define validation schemas for all operations
 * □ Set appropriate resource name and permissions
 * □ Configure role-based access restrictions
 * □ Set rate limiting for each HTTP method
 * □ Implement proper input validation and sanitization
 * □ Add audit logging for all operations
 * □ Handle errors securely without exposing sensitive info
 * □ Apply security headers and CORS configuration
 * □ Test with different user roles and permissions
 * □ Review for SQL injection, XSS, and other vulnerabilities
 * □ Ensure proper authentication and authorization
 * □ Add rate limiting appropriate to the operation sensitivity
 * □ Implement proper error handling and logging
 * 
 * ADDITIONAL CONSIDERATIONS:
 * 
 * □ Consider implementing caching for read operations
 * □ Add pagination for list endpoints
 * □ Implement soft delete for sensitive data
 * □ Add data export capabilities with proper permissions
 * □ Consider adding API versioning
 * □ Implement webhook notifications for critical operations
 * □ Add monitoring and alerting for security events
 * □ Consider implementing request signing for critical operations
 * □ Add support for bulk operations where appropriate
 * □ Implement proper data retention and archiving policies
 */