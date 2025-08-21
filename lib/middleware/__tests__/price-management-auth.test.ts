/**
 * Integration Tests for Price Management Authentication Middleware
 * 
 * This test suite validates the authentication middleware functionality
 * including request processing, permission checking, and response handling.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { 
  withPriceManagementAuth,
  withVendorPortalAuth,
  withPurchaserAuth,
  withAdminAuth,
  getUserContextFromRequest,
  getAccessRestrictionsFromRequest,
  applyDataRestrictions
} from '../price-management-auth';

// Mock the RBAC service
vi.mock('../services/price-management-rbac-service', () => ({
  priceManagementRBAC: {
    checkAccess: vi.fn()
  }
}));

describe('Price Management Authentication Middleware', () => {
  let mockRequest: Partial<NextRequest>;
  let mockCheckAccess: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock the RBAC service
    const { priceManagementRBAC } = require('../services/price-management-rbac-service');
    mockCheckAccess = priceManagementRBAC.checkAccess;

    // Create mock request
    mockRequest = {
      headers: new Map([
        ['x-user-id', 'test-user-1'],
        ['x-user-role', 'Purchaser'],
        ['x-user-department', 'Procurement'],
        ['x-forwarded-for', '192.168.1.1'],
        ['user-agent', 'Test Browser']
      ]),
      nextUrl: {
        pathname: '/api/price-management/vendors/123'
      },
      method: 'GET',
      ip: '192.168.1.1'
    } as any;
  });

  describe('Basic Authentication', () => {
    it('should deny access when no user context is provided', async () => {
      const requestWithoutAuth = {
        ...mockRequest,
        headers: new Map()
      } as NextRequest;

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read'
      });

      const response = await middleware(requestWithoutAuth);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error.code).toBe('UNAUTHORIZED');
    });

    it('should extract user context from headers', async () => {
      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: []
      });

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read'
      });

      const response = await middleware(mockRequest as NextRequest);

      expect(mockCheckAccess).toHaveBeenCalledWith({
        user: {
          userId: 'test-user-1',
          role: 'Purchaser',
          department: 'Procurement',
          location: undefined,
          vendorId: undefined
        },
        resource: 'vendor_management',
        permission: 'read',
        resourceId: undefined,
        additionalContext: expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser',
          method: 'GET'
        })
      });
    });

    it('should extract resource ID from URL path', async () => {
      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: []
      });

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read',
        requiresResourceId: true
      });

      const response = await middleware(mockRequest as NextRequest);

      expect(mockCheckAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: '123'
        })
      );
    });

    it('should return 400 when resource ID is required but not provided', async () => {
      const requestWithoutId = {
        ...mockRequest,
        nextUrl: {
          pathname: '/api/price-management/vendors'
        }
      } as NextRequest;

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read',
        requiresResourceId: true
      });

      const response = await middleware(requestWithoutId);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('Permission Checking', () => {
    it('should allow access when permissions are granted', async () => {
      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: [
          { field: 'sensitiveData', action: 'hide' }
        ]
      });

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read'
      });

      const response = await middleware(mockRequest as NextRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('x-user-context')).toBeTruthy();
      expect(response.headers.get('x-access-restrictions')).toBeTruthy();
    });

    it('should deny access when permissions are not granted', async () => {
      mockCheckAccess.mockResolvedValue({
        granted: false,
        reason: 'Insufficient permissions',
        restrictions: []
      });

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'write'
      });

      const response = await middleware(mockRequest as NextRequest);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error.code).toBe('FORBIDDEN');
      expect(responseData.error.message).toBe('Insufficient permissions');
    });

    it('should handle RBAC service errors gracefully', async () => {
      mockCheckAccess.mockRejectedValue(new Error('RBAC service error'));

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read'
      });

      const response = await middleware(mockRequest as NextRequest);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Vendor Portal Authentication', () => {
    it('should validate vendor portal tokens', async () => {
      const vendorRequest = {
        ...mockRequest,
        headers: new Map([
          ['x-user-id', 'vendor-1'],
          ['x-user-role', 'Vendor'],
          ['x-vendor-id', 'vendor-123']
        ]),
        nextUrl: {
          pathname: '/api/price-management/vendor-portal/valid-token-123456'
        }
      } as NextRequest;

      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Vendor access granted',
        restrictions: []
      });

      const middleware = withVendorPortalAuth();
      const response = await middleware(vendorRequest);

      expect(response.status).toBe(200);
    });

    it('should reject invalid vendor portal tokens', async () => {
      const vendorRequest = {
        ...mockRequest,
        headers: new Map([
          ['x-user-id', 'vendor-1'],
          ['x-user-role', 'Vendor']
        ]),
        nextUrl: {
          pathname: '/api/price-management/vendor-portal/short'
        }
      } as NextRequest;

      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: []
      });

      const middleware = withVendorPortalAuth();
      const response = await middleware(vendorRequest);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Role-Specific Authentication', () => {
    it('should allow purchaser access with purchaser auth', async () => {
      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: []
      });

      const middleware = withPurchaserAuth('vendor_management');
      const response = await middleware(mockRequest as NextRequest);

      expect(response.status).toBe(200);
    });

    it('should deny non-purchaser access with purchaser auth', async () => {
      const requestorRequest = {
        ...mockRequest,
        headers: new Map([
          ['x-user-id', 'requestor-1'],
          ['x-user-role', 'Requestor']
        ])
      } as NextRequest;

      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: []
      });

      const middleware = withPurchaserAuth('vendor_management');
      const response = await middleware(requestorRequest);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error.code).toBe('FORBIDDEN');
    });

    it('should allow admin access with admin auth', async () => {
      const adminRequest = {
        ...mockRequest,
        headers: new Map([
          ['x-user-id', 'admin-1'],
          ['x-user-role', 'Admin']
        ])
      } as NextRequest;

      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: []
      });

      const middleware = withAdminAuth('vendor_management');
      const response = await middleware(adminRequest);

      expect(response.status).toBe(200);
    });
  });

  describe('Utility Functions', () => {
    it('should extract user context from request', () => {
      const request = {
        headers: new Map([
          ['x-user-context', JSON.stringify({
            userId: 'test-user',
            role: 'Purchaser',
            department: 'Procurement'
          })]
        ])
      } as NextRequest;

      const userContext = getUserContextFromRequest(request);

      expect(userContext).toEqual({
        userId: 'test-user',
        role: 'Purchaser',
        department: 'Procurement'
      });
    });

    it('should extract access restrictions from request', () => {
      const restrictions = [
        { field: 'sensitiveData', action: 'hide' },
        { field: 'confidentialInfo', action: 'mask' }
      ];

      const request = {
        headers: new Map([
          ['x-access-restrictions', JSON.stringify(restrictions)]
        ])
      } as NextRequest;

      const extractedRestrictions = getAccessRestrictionsFromRequest(request);

      expect(extractedRestrictions).toEqual(restrictions);
    });

    it('should apply data restrictions to response data', () => {
      const testData = [
        {
          id: '1',
          publicField: 'public data',
          sensitiveData: 'sensitive info',
          confidentialInfo: 'confidential data'
        },
        {
          id: '2',
          publicField: 'more public data',
          sensitiveData: 'more sensitive info',
          confidentialInfo: 'more confidential data'
        }
      ];

      const restrictions = [
        { field: 'sensitiveData', action: 'hide' },
        { field: 'confidentialInfo', action: 'mask' }
      ];

      const filteredData = applyDataRestrictions(testData, restrictions);

      expect(filteredData[0]).not.toHaveProperty('sensitiveData');
      expect(filteredData[0].confidentialInfo).toBe('***');
      expect(filteredData[0].publicField).toBe('public data');
      expect(filteredData[0].id).toBe('1');
    });

    it('should handle single item data restrictions', () => {
      const testData = {
        id: '1',
        publicField: 'public data',
        sensitiveData: 'sensitive info'
      };

      const restrictions = [
        { field: 'sensitiveData', action: 'hide' }
      ];

      const filteredData = applyDataRestrictions(testData, restrictions);

      expect(filteredData).not.toHaveProperty('sensitiveData');
      expect(filteredData.publicField).toBe('public data');
      expect(filteredData.id).toBe('1');
    });

    it('should handle empty restrictions', () => {
      const testData = {
        id: '1',
        field1: 'data1',
        field2: 'data2'
      };

      const filteredData = applyDataRestrictions(testData, []);

      expect(filteredData).toEqual(testData);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed user context headers', () => {
      const request = {
        headers: new Map([
          ['x-user-context', 'invalid-json']
        ])
      } as NextRequest;

      const userContext = getUserContextFromRequest(request);

      expect(userContext).toBeNull();
    });

    it('should handle missing headers gracefully', () => {
      const request = {
        headers: new Map()
      } as NextRequest;

      const userContext = getUserContextFromRequest(request);
      const restrictions = getAccessRestrictionsFromRequest(request);

      expect(userContext).toBeNull();
      expect(restrictions).toEqual([]);
    });

    it('should handle middleware errors gracefully', async () => {
      // Simulate an error in the middleware
      const faultyRequest = {
        headers: new Map([
          ['x-user-id', 'test-user'],
          ['x-user-role', 'Purchaser']
        ]),
        nextUrl: null // This will cause an error
      } as any;

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read'
      });

      const response = await middleware(faultyRequest);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      mockCheckAccess.mockResolvedValue({
        granted: true,
        reason: 'Access granted',
        restrictions: []
      });

      const middleware = withPriceManagementAuth({
        resource: 'vendor_management',
        permission: 'read'
      });

      const requests = Array.from({ length: 50 }, () => ({ ...mockRequest } as NextRequest));

      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(request => middleware(request))
      );
      const endTime = Date.now();

      expect(responses.length).toBe(50);
      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});