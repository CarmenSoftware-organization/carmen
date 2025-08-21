/**
 * Authentication and Authorization Middleware for Price Management APIs
 * 
 * This middleware provides RBAC protection for all Price Management API endpoints,
 * ensuring proper access control and audit logging.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  priceManagementRBAC, 
  UserContext, 
  PriceManagementResource, 
  Permission,
  AccessRequest 
} from '../services/price-management-rbac-service';

export interface AuthenticatedRequest extends NextRequest {
  user?: UserContext;
}

export interface RouteConfig {
  resource: PriceManagementResource;
  permission: Permission;
  requiresResourceId?: boolean;
  additionalValidation?: (req: AuthenticatedRequest) => Promise<boolean>;
}

/**
 * Extract user context from request headers or session
 * In a real implementation, this would validate JWT tokens or session cookies
 */
function extractUserContext(request: NextRequest): UserContext | null {
  try {
    // For development/testing, we'll use headers
    // In production, this would validate actual authentication tokens
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role') as any;
    const department = request.headers.get('x-user-department');
    const location = request.headers.get('x-user-location');
    const vendorId = request.headers.get('x-vendor-id');

    if (!userId || !userRole) {
      return null;
    }

    return {
      userId,
      role: userRole,
      department: department || undefined,
      location: location || undefined,
      vendorId: vendorId || undefined
    };
  } catch (error) {
    console.error('Error extracting user context:', error);
    return null;
  }
}

/**
 * Extract resource ID from URL path
 */
function extractResourceId(pathname: string, resource: PriceManagementResource): string | undefined {
  const segments = pathname.split('/');
  
  switch (resource) {
    case 'vendor_management':
      // /api/price-management/vendors/[id]
      const vendorIndex = segments.indexOf('vendors');
      return vendorIndex >= 0 && segments[vendorIndex + 1] ? segments[vendorIndex + 1] : undefined;
      
    case 'price_assignments':
      // /api/price-management/assignments/[id]
      const assignmentIndex = segments.indexOf('assignments');
      return assignmentIndex >= 0 && segments[assignmentIndex + 1] ? segments[assignmentIndex + 1] : undefined;
      
    case 'business_rules':
      // /api/price-management/business-rules/[id]
      const rulesIndex = segments.indexOf('business-rules');
      return rulesIndex >= 0 && segments[rulesIndex + 1] ? segments[rulesIndex + 1] : undefined;
      
    case 'vendor_portal':
      // /api/price-management/vendor-portal/[token]
      const portalIndex = segments.indexOf('vendor-portal');
      return portalIndex >= 0 && segments[portalIndex + 1] ? segments[portalIndex + 1] : undefined;
      
    default:
      return undefined;
  }
}

/**
 * Get additional context from request
 */
function getAdditionalContext(request: NextRequest, resource: PriceManagementResource): Record<string, any> {
  const context: Record<string, any> = {};
  
  // Add query parameters as context
  const url = new URL(request.url);
  url.searchParams.forEach((value, key) => {
    context[key] = value;
  });
  
  // Add request metadata
  context.ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  context.userAgent = request.headers.get('user-agent') || 'unknown';
  context.method = request.method;
  context.timestamp = new Date().toISOString();
  
  return context;
}

/**
 * Main authentication middleware
 */
export function withPriceManagementAuth(config: RouteConfig) {
  return async function middleware(request: NextRequest) {
    try {
      // Extract user context
      const user = extractUserContext(request);
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: 'Authentication required' 
            } 
          },
          { status: 401 }
        );
      }

      // Extract resource ID if required
      let resourceId: string | undefined;
      if (config.requiresResourceId) {
        resourceId = extractResourceId(request.nextUrl.pathname, config.resource);
        if (!resourceId) {
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'BAD_REQUEST', 
                message: 'Resource ID required but not provided' 
              } 
            },
            { status: 400 }
          );
        }
      }

      // Get additional context
      const additionalContext = getAdditionalContext(request, config.resource);

      // Check access permissions
      const accessRequest: AccessRequest = {
        user,
        resource: config.resource,
        permission: config.permission,
        resourceId,
        additionalContext
      };

      const accessResult = await priceManagementRBAC.checkAccess(accessRequest);

      if (!accessResult.granted) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: accessResult.reason 
            } 
          },
          { status: 403 }
        );
      }

      // Run additional validation if provided
      if (config.additionalValidation) {
        const additionalValid = await config.additionalValidation(request as AuthenticatedRequest);
        if (!additionalValid) {
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'FORBIDDEN', 
                message: 'Additional validation failed' 
              } 
            },
            { status: 403 }
          );
        }
      }

      // Add user context and restrictions to request headers for the API handler
      const response = NextResponse.next();
      response.headers.set('x-user-context', JSON.stringify(user));
      response.headers.set('x-access-restrictions', JSON.stringify(accessResult.restrictions || []));
      response.headers.set('x-resource-id', resourceId || '');

      return response;

    } catch (error) {
      console.error('Price Management Auth Middleware Error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INTERNAL_ERROR', 
            message: 'Authentication service error' 
          } 
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Vendor portal specific authentication
 * Validates vendor portal tokens and restricts access to vendor's own data
 */
export function withVendorPortalAuth() {
  return withPriceManagementAuth({
    resource: 'vendor_portal',
    permission: 'read',
    requiresResourceId: true,
    additionalValidation: async (req: AuthenticatedRequest) => {
      // Validate vendor portal token
      const token = extractResourceId(req.nextUrl.pathname, 'vendor_portal');
      if (!token) {
        return false;
      }

      // In a real implementation, validate the token against the database
      // For now, we'll do basic validation
      return token.length > 10; // Simple validation
    }
  });
}

/**
 * Purchaser-only operations
 */
export function withPurchaserAuth(resource: PriceManagementResource, permission: Permission = 'manage') {
  return withPriceManagementAuth({
    resource,
    permission,
    additionalValidation: async (req: AuthenticatedRequest) => {
      const user = extractUserContext(req);
      return user?.role === 'Purchaser' || user?.role === 'Admin';
    }
  });
}

/**
 * Admin-only operations
 */
export function withAdminAuth(resource: PriceManagementResource, permission: Permission = 'configure') {
  return withPriceManagementAuth({
    resource,
    permission,
    additionalValidation: async (req: AuthenticatedRequest) => {
      const user = extractUserContext(req);
      return user?.role === 'Admin';
    }
  });
}

/**
 * Utility function to get user context from API route handler
 */
export function getUserContextFromRequest(request: NextRequest): UserContext | null {
  try {
    const userContextHeader = request.headers.get('x-user-context');
    if (userContextHeader) {
      return JSON.parse(userContextHeader);
    }
    return extractUserContext(request);
  } catch (error) {
    console.error('Error getting user context from request:', error);
    return null;
  }
}

/**
 * Utility function to get access restrictions from API route handler
 */
export function getAccessRestrictionsFromRequest(request: NextRequest) {
  try {
    const restrictionsHeader = request.headers.get('x-access-restrictions');
    if (restrictionsHeader) {
      return JSON.parse(restrictionsHeader);
    }
    return [];
  } catch (error) {
    console.error('Error getting access restrictions from request:', error);
    return [];
  }
}

/**
 * Helper function to apply data restrictions to API responses
 */
export function applyDataRestrictions<T extends Record<string, any>>(
  data: T | T[], 
  restrictions: any[]
): T | T[] {
  if (!restrictions || restrictions.length === 0) {
    return data;
  }

  const applyToItem = (item: T): Partial<T> => {
    const filteredItem: Partial<T> = { ...item };

    restrictions.forEach((restriction: any) => {
      switch (restriction.action) {
        case 'hide':
          delete filteredItem[restriction.field as keyof T];
          break;
        case 'mask':
          if (filteredItem[restriction.field as keyof T]) {
            filteredItem[restriction.field as keyof T] = '***' as any;
          }
          break;
      }
    });

    return filteredItem;
  };

  if (Array.isArray(data)) {
    return data.map(applyToItem) as T[];
  } else {
    return applyToItem(data) as T;
  }
}