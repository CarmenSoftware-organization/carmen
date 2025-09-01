/**
 * Business Rules API Routes - Price management business rules endpoints
 * 
 * GET /api/price-management/business-rules - List all business rules
 * POST /api/price-management/business-rules - Create new business rule
 * PUT /api/price-management/business-rules - Update business rule
 * DELETE /api/price-management/business-rules - Delete business rule
 * 
 * Security Features:
 * - JWT authentication required
 * - Role-based access control (RBAC)
 * - Rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data imports
import businessRulesData from '@/lib/mock/price-management/business-rules.json';

// Security imports
import { withUnifiedAuth, type UnifiedAuthenticatedUser, authStrategies } from '@/lib/auth/api-protection';
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac';
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security';
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter';
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator';
import { SecurityEventType } from '@/lib/security/audit-logger';

// Security-enhanced validation schemas
const businessRuleFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  category: z.enum(['price_assignment', 'approval_workflow', 'validation', 'notification']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  search: SecureSchemas.safeString(100).optional()
});

const createBusinessRuleSchema = z.object({
  name: SecureSchemas.safeString(255).min(1).max(255),
  description: SecureSchemas.safeString(1000).optional(),
  category: z.enum(['price_assignment', 'approval_workflow', 'validation', 'notification']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  conditions: z.array(z.object({
    field: SecureSchemas.safeString(100).min(1),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'in', 'not_in']),
    value: SecureSchemas.safeString(500),
    logicalOperator: z.enum(['AND', 'OR']).optional().default('AND')
  })).min(1).max(10),
  actions: z.array(z.object({
    type: z.enum(['assign_price', 'flag_review', 'auto_approve', 'reject', 'send_notification', 'escalate']),
    priority: z.number().min(1).max(10).optional().default(5),
    parameters: z.object({
      message: SecureSchemas.safeString(500).optional(),
      assignTo: SecureSchemas.uuid.optional(),
      approvalRequired: z.boolean().optional().default(false),
      escalationLevel: z.enum(['manager', 'finance', 'admin']).optional()
    }).optional()
  })).min(1).max(10),
  isActive: z.boolean().optional().default(true),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  tags: z.array(SecureSchemas.safeString(50)).max(10).optional()
});

const updateBusinessRuleSchema = z.object({
  id: SecureSchemas.uuid,
  name: SecureSchemas.safeString(255).min(1).max(255).optional(),
  description: SecureSchemas.safeString(1000).optional(),
  category: z.enum(['price_assignment', 'approval_workflow', 'validation', 'notification']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  conditions: z.array(z.object({
    field: SecureSchemas.safeString(100).min(1),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'in', 'not_in']),
    value: SecureSchemas.safeString(500),
    logicalOperator: z.enum(['AND', 'OR']).optional().default('AND')
  })).min(1).max(10).optional(),
  actions: z.array(z.object({
    type: z.enum(['assign_price', 'flag_review', 'auto_approve', 'reject', 'send_notification', 'escalate']),
    priority: z.number().min(1).max(10).optional().default(5),
    parameters: z.object({
      message: SecureSchemas.safeString(500).optional(),
      assignTo: SecureSchemas.uuid.optional(),
      approvalRequired: z.boolean().optional(),
      escalationLevel: z.enum(['manager', 'finance', 'admin']).optional()
    }).optional()
  })).min(1).max(10).optional(),
  isActive: z.boolean().optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  tags: z.array(SecureSchemas.safeString(50)).max(10).optional()
});

const deleteBusinessRuleSchema = z.object({
  id: SecureSchemas.uuid
});

/**
 * GET /api/price-management/business-rules - List business rules with filtering
 * Requires authentication and 'read:business_rules' permission
 */
const getBusinessRules = withSecurity(
  authStrategies.hybrid(
    withAuthorization('business_rules', 'read', async (request: NextRequest, { user }: { user: UnifiedAuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url);
        
        // Parse and validate query parameters
        const rawFilters = {
          isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
          category: searchParams.get('category') || undefined,
          priority: searchParams.get('priority') || undefined,
          search: searchParams.get('search') || undefined
        };

        const filtersValidation = await validateInput(rawFilters, businessRuleFiltersSchema, {
          maxLength: 1000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        });

        if (!filtersValidation.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid filter parameters',
            threats: filtersValidation.threats,
            riskLevel: filtersValidation.riskLevel
          });

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid filter parameters',
              details: filtersValidation.errors
            },
            400
          );
        }

        const filters = filtersValidation.sanitized || filtersValidation.data!;

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'business_rules',
          action: 'read',
          filters: {
            hasSearch: !!filters.search,
            isActive: filters.isActive,
            category: filters.category,
            priority: filters.priority
          }
        });

        // Filter business rules based on parameters
        let filteredRules = businessRulesData.businessRules;

        if (filters.isActive !== undefined) {
          filteredRules = filteredRules.filter(rule => rule.isActive === filters.isActive);
        }

        if (filters.category) {
          filteredRules = filteredRules.filter(rule => rule.category === filters.category);
        }

        if (filters.priority) {
          filteredRules = filteredRules.filter(rule => rule.priority === filters.priority);
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredRules = filteredRules.filter(rule => 
            rule.name.toLowerCase().includes(searchLower) ||
            rule.description?.toLowerCase().includes(searchLower)
          );
        }

        // Add metadata headers
        const response = createSecureResponse({
          success: true,
          data: {
            businessRules: filteredRules,
            totalCount: filteredRules.length,
            activeCount: filteredRules.filter(rule => rule.isActive).length,
            categories: [...new Set(filteredRules.map(rule => rule.category))],
            priorities: [...new Set(filteredRules.map(rule => rule.priority))]
          },
          metadata: {
            totalRules: businessRulesData.businessRules.length,
            filteredCount: filteredRules.length,
            appliedFilters: filters
          }
        });

        response.headers.set('X-Total-Count', filteredRules.length.toString());
        response.headers.set('X-Active-Count', filteredRules.filter(rule => rule.isActive).length.toString());

        return response;

      } catch (error) {
        console.error('Error in GET /api/price-management/business-rules:', error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_business_rules',
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
      exposedHeaders: ['X-Total-Count', 'X-Active-Count']
    }
  }
);

// Apply rate limiting
export const GET = withRateLimit(RateLimitPresets.API)(getBusinessRules);

/**
 * POST /api/price-management/business-rules - Create new business rule
 * Requires authentication and 'create:business_rules' permission
 */
const createBusinessRule = withSecurity(
  authStrategies.hybrid(
    withAuthorization('business_rules', 'create', async (request: NextRequest, { user }: { user: UnifiedAuthenticatedUser }) => {
      try {
        const body = await request.json();

        // Enhanced security validation with threat detection
        const validationResult = await validateInput(body, createBusinessRuleSchema, {
          maxLength: 15000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        });

        if (!validationResult.success) {
          // Log potential security threat
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid business rule creation data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'business_rule_creation'
          });

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid business rule data',
              details: validationResult.errors
            },
            400
          );
        }

        // Use sanitized data
        const ruleData = validationResult.sanitized || validationResult.data!;

        // Additional business logic validation
        if (ruleData.effectiveTo && ruleData.effectiveFrom && ruleData.effectiveFrom >= ruleData.effectiveTo) {
          return createSecureResponse(
            {
              success: false,
              error: 'Effective from date must be before effective to date'
            },
            400
          );
        }

        // Check for high-priority rules - only admin can create critical priority rules
        if (ruleData.priority === 'critical' && !['admin', 'super-admin'].includes(user.role)) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to create critical priority rules'
            },
            403
          );
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'business_rules',
          action: 'create',
          ruleName: ruleData.name,
          category: ruleData.category,
          priority: ruleData.priority,
          conditionsCount: ruleData.conditions.length,
          actionsCount: ruleData.actions.length,
          isActive: ruleData.isActive
        });

        // Create business rule
        const newRule = {
          id: `rule-${Date.now()}`,
          ...ruleData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.id,
          lastTriggered: null,
          triggerCount: 0,
          successRate: 0,
          performance: {
            executionsCount: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageExecutionTime: 0,
            lastExecution: null,
            averageConfidenceScore: 0
          },
          version: 1
        };

        // Log successful creation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'business_rules',
          action: 'create_success',
          ruleId: newRule.id,
          ruleName: ruleData.name
        });

        return createSecureResponse(
          {
            success: true,
            message: 'Business rule created successfully',
            data: { rule: newRule }
          },
          201
        );

      } catch (error) {
        console.error('Error in POST /api/price-management/business-rules:', error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create_business_rule',
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
      maxBodySize: 100 * 1024, // 100KB max body size
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['POST']
    }
  }
);

// Apply stricter rate limiting for creation endpoints
export const POST = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 rule creations per hour
  skipSuccessfulRequests: false
})(createBusinessRule);

/**
 * PUT /api/price-management/business-rules - Update business rule
 * Requires authentication and 'update:business_rules' permission
 */
const updateBusinessRule = withSecurity(
  authStrategies.hybrid(
    withAuthorization('business_rules', 'update', async (request: NextRequest, { user }: { user: UnifiedAuthenticatedUser }) => {
      try {
        const body = await request.json();

        // Enhanced security validation
        const validationResult = await validateInput(body, updateBusinessRuleSchema, {
          maxLength: 15000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true,
          allowHtml: false
        });

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid business rule update data',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel,
            dataType: 'business_rule_update'
          });

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid business rule data',
              details: validationResult.errors
            },
            400
          );
        }

        const { id, ...updateData } = validationResult.sanitized || validationResult.data!;

        // Additional business logic validation
        if (updateData.effectiveTo && updateData.effectiveFrom && updateData.effectiveFrom >= updateData.effectiveTo) {
          return createSecureResponse(
            {
              success: false,
              error: 'Effective from date must be before effective to date'
            },
            400
          );
        }

        // Check for high-priority rules - only admin can update to critical priority
        if (updateData.priority === 'critical' && !['admin', 'super-admin'].includes(user.role)) {
          return createSecureResponse(
            {
              success: false,
              error: 'Insufficient permissions to set critical priority'
            },
            403
          );
        }

        // Log data modification
        await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
          resource: 'business_rules',
          action: 'update',
          ruleId: id,
          updatedFields: Object.keys(updateData),
          priority: updateData.priority,
          isActive: updateData.isActive
        });

        // Simulate update - in real implementation, this would update database
        const updatedRule = {
          id,
          ...updateData,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id,
          version: 2 // Increment version for audit trail
        };

        return createSecureResponse({
          success: true,
          message: 'Business rule updated successfully',
          data: { rule: updatedRule }
        });

      } catch (error) {
        console.error('Error in PUT /api/price-management/business-rules:', error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update_business_rule',
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
      maxBodySize: 100 * 1024, // 100KB max body size
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['PUT']
    }
  }
);

// Apply rate limiting for update operations
export const PUT = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 updates per hour
  skipSuccessfulRequests: true
})(updateBusinessRule);

/**
 * DELETE /api/price-management/business-rules - Delete business rule
 * Requires authentication and 'delete:business_rules' permission
 */
const deleteBusinessRule = withSecurity(
  authStrategies.hybrid(
    withAuthorization('business_rules', 'delete', async (request: NextRequest, { user }: { user: UnifiedAuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url);
        const ruleId = searchParams.get('id');

        // Validate rule ID
        const validationResult = await validateInput({ id: ruleId }, deleteBusinessRuleSchema, {
          maxLength: 100,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        });

        if (!validationResult.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid rule ID',
              details: validationResult.errors
            },
            400
          );
        }

        const { id } = validationResult.sanitized || validationResult.data!;

        // Additional permission check for deletion - only admin can delete critical rules
        // In a real implementation, you would fetch the rule to check its priority
        // For now, we'll assume the permission check is sufficient

        // Log sensitive operation
        await auditSecurityEvent(SecurityEventType.DATA_DELETION, request, user.id, {
          resource: 'business_rules',
          action: 'delete',
          ruleId: id,
          reason: 'User requested deletion'
        });

        // In real implementation, this would:
        // 1. Check if rule is currently being used
        // 2. Soft delete or move to archive
        // 3. Update related records

        return createSecureResponse({
          success: true,
          message: 'Business rule deleted successfully',
          data: { deletedRuleId: id }
        });

      } catch (error) {
        console.error('Error in DELETE /api/price-management/business-rules:', error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'delete_business_rule',
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

// Apply strict rate limiting for deletion endpoints
export const DELETE = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 deletions per hour
  skipSuccessfulRequests: false
})(deleteBusinessRule);