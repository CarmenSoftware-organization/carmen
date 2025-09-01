/**
 * Price Management API Routes - Main price management endpoints
 * 
 * GET /api/price-management - Get price management overview and data by type
 * POST /api/price-management - Create price management entities
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
import vendorsData from '@/lib/mock/price-management/vendors.json';
import pricelistsData from '@/lib/mock/price-management/pricelists.json';
import priceAssignmentsData from '@/lib/mock/price-management/price-assignments.json';
import businessRulesData from '@/lib/mock/price-management/business-rules.json';
import portalSessionsData from '@/lib/mock/price-management/portal-sessions.json';
import analyticsData from '@/lib/mock/price-management/analytics.json';

// Security imports
import { withUnifiedAuth, type UnifiedAuthenticatedUser, authStrategies } from '@/lib/auth/api-protection';
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac';
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security';
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter';
import { validateInput, SecureSchemas, type ValidationResult } from '@/lib/security/input-validator';
import { SecurityEventType } from '@/lib/security/audit-logger';

// Security-enhanced validation schemas
const priceManagementQuerySchema = z.object({
  type: z.enum(['overview', 'vendors', 'pricelists', 'assignments', 'rules', 'sessions', 'analytics']).optional().default('overview')
});

const createVendorSchema = z.object({
  name: SecureSchemas.safeString(255).min(1),
  contactEmail: z.string().email().max(255),
  status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
  settings: z.object({
    autoAssign: z.boolean().optional().default(false),
    priority: z.number().min(1).max(10).optional().default(5)
  }).optional()
});

const createPortalSessionSchema = z.object({
  vendorId: SecureSchemas.uuid,
  expiryDays: z.number().min(1).max(30).optional().default(7),
  permissions: z.array(z.enum(['view_prices', 'submit_prices', 'view_analytics'])).optional().default(['view_prices', 'submit_prices'])
});

const createBusinessRuleSchema = z.object({
  name: SecureSchemas.safeString(255).min(1),
  description: SecureSchemas.safeString(1000).optional(),
  conditions: z.array(z.object({
    field: SecureSchemas.safeString(100),
    operator: z.enum(['equals', 'contains', 'greater_than', 'less_than']),
    value: SecureSchemas.safeString(255)
  })).min(1).max(10),
  actions: z.array(z.object({
    type: z.enum(['assign_price', 'flag_review', 'auto_approve', 'reject']),
    parameters: z.record(z.any()).optional()
  })).min(1).max(5),
  isActive: z.boolean().optional().default(true)
});

const assignPriceSchema = z.object({
  itemId: SecureSchemas.uuid,
  vendorId: SecureSchemas.uuid,
  price: z.number().positive(),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/, 'Invalid currency code').optional().default('USD'),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().optional()
});

const priceManagementActionSchema = z.object({
  action: z.enum(['create_vendor', 'update_vendor_settings', 'create_portal_session', 'create_business_rule', 'assign_price']),
  data: z.any() // Will be validated based on action type
});

/**
 * GET /api/price-management - Get price management data
 * Requires authentication and 'read:price_management' permission
 */
const getPriceManagementData = withSecurity(
  authStrategies.hybrid(
    withAuthorization('price_management', 'read', async (request: NextRequest, { user }: { user: UnifiedAuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url);
        
        // Parse and validate query parameters
        const rawQuery = {
          type: searchParams.get('type') || 'overview'
        };

        const queryValidation = await validateInput(rawQuery, priceManagementQuerySchema, {
          maxLength: 100,
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

        const { type } = queryValidation.sanitized || queryValidation.data!;

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'price_management',
          action: 'read',
          dataType: type,
          role: user.role
        });

        // Return overview data by default
        if (type === 'overview') {
          const overviewData = {
            overview: analyticsData.overview,
            recentActivity: [
              {
                type: 'vendor_submission',
                message: 'ABC Food Supplies submitted new pricing',
                timestamp: '2024-01-16T14:35:00Z',
                status: 'success'
              },
              {
                type: 'price_assignment',
                message: 'Auto-assigned 23 PR items',
                timestamp: '2024-01-16T11:20:00Z',
                status: 'success'
              },
              {
                type: 'price_expiry',
                message: '5 price lists expiring this week',
                timestamp: '2024-01-16T09:00:00Z',
                status: 'warning'
              }
            ],
            quickStats: {
              totalVendors: vendorsData.vendors.length,
              activeVendors: vendorsData.vendors.filter(v => v.status === 'active').length,
              totalPriceLists: pricelistsData.length,
              activePriceLists: pricelistsData.filter(p => p.status === 'Active').length,
              totalAssignments: priceAssignmentsData.priceAssignments.length,
              successfulAssignments: priceAssignmentsData.priceAssignments.filter(a => !a.isManualOverride).length,
              pendingAssignments: 0,
              activeRules: businessRulesData.businessRules.filter(r => r.isActive).length
            }
          };

          return createSecureResponse({
            success: true,
            data: overviewData
          });
        }

        // Return specific data type based on user permissions
        let responseData: any;
        
        switch (type) {
          case 'vendors':
            responseData = vendorsData;
            break;
          case 'pricelists':
            responseData = pricelistsData;
            break;
          case 'assignments':
            responseData = priceAssignmentsData.priceAssignments;
            break;
          case 'rules':
            // Check if user can view business rules
            if (!await checkPermission(user, 'read', 'business_rules')) {
              return createSecureResponse(
                {
                  success: false,
                  error: 'Insufficient permissions to view business rules'
                },
                403
              );
            }
            responseData = businessRulesData.businessRules;
            break;
          case 'sessions':
            // Only allow admin users to view portal sessions
            if (!['admin', 'super-admin', 'purchasing-staff'].includes(user.role)) {
              return createSecureResponse(
                {
                  success: false,
                  error: 'Insufficient permissions to view portal sessions'
                },
                403
              );
            }
            responseData = portalSessionsData;
            break;
          case 'analytics':
            responseData = analyticsData;
            break;
          default:
            return createSecureResponse(
              {
                success: false,
                error: 'Invalid data type requested'
              },
              400
            );
        }

        return createSecureResponse({
          success: true,
          data: responseData
        });

      } catch (error) {
        console.error('Error in GET /api/price-management:', error);
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'get_price_management_data',
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
      methods: ['GET']
    }
  }
);

// Apply rate limiting
export const GET = withRateLimit(RateLimitPresets.API)(getPriceManagementData);

/**
 * POST /api/price-management - Create price management entities
 * Requires authentication and appropriate permissions based on action
 */
const createPriceManagementData = withSecurity(
  authStrategies.hybrid(async (request: NextRequest, { user }: { user: UnifiedAuthenticatedUser }) => {
    try {
      const body = await request.json();

      // Basic structure validation
      const structureValidation = await validateInput(body, priceManagementActionSchema, {
        maxLength: 10000,
        trimWhitespace: true,
        removeSuspiciousPatterns: true,
        allowHtml: false
      });

      if (!structureValidation.success) {
        await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
          reason: 'Invalid request structure',
          threats: structureValidation.threats,
          riskLevel: structureValidation.riskLevel,
          dataType: 'price_management_action'
        });

        return createSecureResponse(
          {
            success: false,
            error: 'Invalid request structure',
            details: structureValidation.errors
          },
          400
        );
      }

      const { action, data } = structureValidation.sanitized || structureValidation.data!;

      // Permission checks and action-specific validation
      switch (action) {
        case 'create_vendor': {
          // Check permissions
          if (!await checkPermission(user, 'create', 'vendors')) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to create vendors'
              },
              403
            );
          }

          // Validate vendor data
          const vendorValidation = await validateInput(data, createVendorSchema, {
            maxLength: 5000,
            trimWhitespace: true,
            removeSuspiciousPatterns: true,
            allowHtml: false
          });

          if (!vendorValidation.success) {
            return createSecureResponse(
              {
                success: false,
                error: 'Invalid vendor data',
                details: vendorValidation.errors
              },
              400
            );
          }

          const vendorData = vendorValidation.sanitized || vendorValidation.data!;

          // Log data modification
          await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
            resource: 'vendors',
            action: 'create',
            vendorName: vendorData.name,
            vendorEmail: vendorData.contactEmail
          });

          const createdVendor = {
            id: `vendor-${Date.now()}`,
            ...vendorData,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          return createSecureResponse(
            {
              success: true,
              message: 'Vendor created successfully',
              data: createdVendor
            },
            201
          );
        }

        case 'update_vendor_settings': {
          // Check permissions
          if (!await checkPermission(user, 'update', 'vendors')) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to update vendor settings'
              },
              403
            );
          }

          // Log data modification
          await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
            resource: 'vendor_settings',
            action: 'update',
            vendorId: data.vendorId
          });

          return createSecureResponse({
            success: true,
            message: 'Vendor settings updated successfully',
            data: {
              ...data,
              updatedBy: user.id,
              updatedAt: new Date().toISOString()
            }
          });
        }

        case 'create_portal_session': {
          // Check permissions - only admin and purchasing staff can create portal sessions
          if (!['admin', 'super-admin', 'purchasing-staff'].includes(user.role)) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to create portal sessions'
              },
              403
            );
          }

          // Validate portal session data
          const sessionValidation = await validateInput(data, createPortalSessionSchema, {
            maxLength: 1000,
            trimWhitespace: true,
            removeSuspiciousPatterns: true
          });

          if (!sessionValidation.success) {
            return createSecureResponse(
              {
                success: false,
                error: 'Invalid portal session data',
                details: sessionValidation.errors
              },
              400
            );
          }

          const sessionData = sessionValidation.sanitized || sessionValidation.data!;

          // Generate secure tokens
          const sessionId = crypto.randomUUID();
          const sessionToken = crypto.randomUUID() + '-' + Date.now().toString(36);
          const expiresAt = new Date(Date.now() + sessionData.expiryDays * 24 * 60 * 60 * 1000);

          // Log sensitive operation
          await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
            resource: 'vendor_portal_sessions',
            action: 'create',
            vendorId: sessionData.vendorId,
            expiryDays: sessionData.expiryDays,
            permissions: sessionData.permissions
          });

          const portalSession = {
            id: sessionId,
            sessionToken,
            expiresAt: expiresAt.toISOString(),
            portalUrl: `/price-management/vendor-portal/${sessionToken}`,
            ...sessionData,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            isActive: true
          };

          return createSecureResponse(
            {
              success: true,
              message: 'Portal session created successfully',
              data: portalSession
            },
            201
          );
        }

        case 'create_business_rule': {
          // Check permissions - only admin and purchasing staff can create business rules
          if (!await checkPermission(user, 'create', 'business_rules')) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to create business rules'
              },
              403
            );
          }

          // Validate business rule data
          const ruleValidation = await validateInput(data, createBusinessRuleSchema, {
            maxLength: 10000,
            trimWhitespace: true,
            removeSuspiciousPatterns: true,
            allowHtml: false
          });

          if (!ruleValidation.success) {
            return createSecureResponse(
              {
                success: false,
                error: 'Invalid business rule data',
                details: ruleValidation.errors
              },
              400
            );
          }

          const ruleData = ruleValidation.sanitized || ruleValidation.data!;

          // Log sensitive operation
          await auditSecurityEvent(SecurityEventType.DATA_MODIFICATION, request, user.id, {
            resource: 'business_rules',
            action: 'create',
            ruleName: ruleData.name,
            conditionsCount: ruleData.conditions.length,
            actionsCount: ruleData.actions.length,
            isActive: ruleData.isActive
          });

          const businessRule = {
            id: `rule-${Date.now()}`,
            ...ruleData,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            performance: {
              executionsCount: 0,
              successfulExecutions: 0,
              failedExecutions: 0,
              successRate: 0,
              averageConfidenceScore: 0,
              totalAssignments: 0,
              manualOverrides: 0,
              lastTriggered: null
            }
          };

          return createSecureResponse(
            {
              success: true,
              message: 'Business rule created successfully',
              data: businessRule
            },
            201
          );
        }

        case 'assign_price': {
          // Check permissions
          if (!await checkPermission(user, 'assign', 'price_assignments')) {
            return createSecureResponse(
              {
                success: false,
                error: 'Insufficient permissions to assign prices'
              },
              403
            );
          }

          // Validate price assignment data
          const priceValidation = await validateInput(data, assignPriceSchema, {
            maxLength: 1000,
            trimWhitespace: true,
            removeSuspiciousPatterns: true
          });

          if (!priceValidation.success) {
            return createSecureResponse(
              {
                success: false,
                error: 'Invalid price assignment data',
                details: priceValidation.errors
              },
              400
            );
          }

          const priceData = priceValidation.sanitized || priceValidation.data!;

          // Validate date logic
          if (priceData.validTo && priceData.validFrom >= priceData.validTo) {
            return createSecureResponse(
              {
                success: false,
                error: 'Valid from date must be before valid to date'
              },
              400
            );
          }

          // Log price assignment (sensitive financial operation)
          await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
            resource: 'price_assignments',
            action: 'assign_price',
            itemId: priceData.itemId,
            vendorId: priceData.vendorId,
            price: priceData.price,
            currency: priceData.currency
          });

          const priceAssignment = {
            id: `assignment-${Date.now()}`,
            ...priceData,
            assignedBy: user.id,
            assignedAt: new Date().toISOString(),
            status: 'Assigned',
            isManualOverride: false,
            approvalRequired: priceData.price > 10000 // Require approval for high-value prices
          };

          return createSecureResponse(
            {
              success: true,
              message: 'Price assigned successfully',
              data: priceAssignment
            },
            201
          );
        }

        default:
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid action specified'
            },
            400
          );
      }

    } catch (error) {
      console.error('Error in POST /api/price-management:', error);
      
      await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'create_price_management_data',
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
  }),
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
  maxRequests: 100, // 100 operations per hour
  skipSuccessfulRequests: false
})(createPriceManagementData);