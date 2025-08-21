/**
 * Comprehensive Test Suite for Price Management RBAC System
 * 
 * This test suite validates all RBAC functionality including access control,
 * permission management, audit logging, and data filtering.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  PriceManagementRBACService,
  UserContext,
  PriceManagementResource,
  Permission,
  AccessRequest
} from '../price-management-rbac-service';

describe('Price Management RBAC Service', () => {
  let rbacService: PriceManagementRBACService;

  beforeEach(() => {
    rbacService = new PriceManagementRBACService();
  });

  afterEach(() => {
    // Clean up any test data
  });

  describe('Access Control - Requirement 9.1, 9.2, 9.3, 9.4', () => {
    describe('Requestor Role', () => {
      const requestorUser: UserContext = {
        userId: 'requestor-1',
        role: 'Requestor',
        department: 'Operations'
      };

      it('should deny access to detailed vendor pricing information', async () => {
        const request: AccessRequest = {
          user: requestorUser,
          resource: 'vendor_pricing',
          permission: 'read'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(false);
        expect(result.reason).toContain('does not have read permission');
      });

      it('should allow limited access to own price assignments', async () => {
        const request: AccessRequest = {
          user: requestorUser,
          resource: 'price_assignments',
          permission: 'read',
          resourceId: 'requestor-1'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
        expect(result.restrictions).toBeDefined();
        expect(result.restrictions?.some(r => r.field === 'vendorDetails')).toBe(true);
      });

      it('should deny access to other users price assignments', async () => {
        const request: AccessRequest = {
          user: requestorUser,
          resource: 'price_assignments',
          permission: 'read',
          resourceId: 'other-user'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(false);
        expect(result.reason).toContain('can only access their own resources');
      });

      it('should deny access to price history', async () => {
        const request: AccessRequest = {
          user: requestorUser,
          resource: 'price_history',
          permission: 'read'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(false);
      });
    });

    describe('Approver Role', () => {
      const approverUser: UserContext = {
        userId: 'approver-1',
        role: 'Approver',
        department: 'Finance'
      };

      it('should allow view-only access to pricing summaries', async () => {
        const request: AccessRequest = {
          user: approverUser,
          resource: 'vendor_pricing',
          permission: 'read'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
        expect(result.restrictions).toBeDefined();
        expect(result.restrictions?.some(r => r.field === 'detailedPricing')).toBe(true);
      });

      it('should deny write access to vendor pricing', async () => {
        const request: AccessRequest = {
          user: approverUser,
          resource: 'vendor_pricing',
          permission: 'write'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(false);
      });

      it('should allow access to price assignments', async () => {
        const request: AccessRequest = {
          user: approverUser,
          resource: 'price_assignments',
          permission: 'read'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
      });

      it('should allow access to department audit logs', async () => {
        const request: AccessRequest = {
          user: approverUser,
          resource: 'audit_logs',
          permission: 'read',
          additionalContext: { department: 'Finance' }
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
      });

      it('should deny access to other department audit logs', async () => {
        const request: AccessRequest = {
          user: approverUser,
          resource: 'audit_logs',
          permission: 'read',
          additionalContext: { department: 'Operations' }
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(false);
        expect(result.reason).toContain('department');
      });
    });

    describe('Purchaser Role', () => {
      const purchaserUser: UserContext = {
        userId: 'purchaser-1',
        role: 'Purchaser',
        department: 'Procurement'
      };

      it('should allow full access to vendor pricing and management', async () => {
        const resources: PriceManagementResource[] = [
          'vendor_pricing',
          'price_assignments',
          'business_rules',
          'vendor_management'
        ];

        for (const resource of resources) {
          const request: AccessRequest = {
            user: purchaserUser,
            resource,
            permission: 'manage'
          };

          const result = await rbacService.checkAccess(request);
          expect(result.granted).toBe(true);
        }
      });

      it('should allow price override functionality', async () => {
        const request: AccessRequest = {
          user: purchaserUser,
          resource: 'price_overrides',
          permission: 'override'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
      });

      it('should allow bulk operations', async () => {
        const request: AccessRequest = {
          user: purchaserUser,
          resource: 'assignment_queues',
          permission: 'bulk_operations'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
      });

      it('should allow analytics access', async () => {
        const request: AccessRequest = {
          user: purchaserUser,
          resource: 'analytics',
          permission: 'export'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
      });
    });

    describe('Vendor Role', () => {
      const vendorUser: UserContext = {
        userId: 'vendor-1',
        role: 'Vendor',
        vendorId: 'vendor-123'
      };

      it('should allow access to own pricing data only', async () => {
        const request: AccessRequest = {
          user: vendorUser,
          resource: 'vendor_pricing',
          permission: 'read',
          resourceId: 'vendor-123'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
        expect(result.restrictions).toBeDefined();
        expect(result.restrictions?.some(r => r.field === 'competitorPricing')).toBe(true);
      });

      it('should deny access to other vendors pricing data', async () => {
        const request: AccessRequest = {
          user: vendorUser,
          resource: 'vendor_pricing',
          permission: 'read',
          resourceId: 'vendor-456'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(false);
        expect(result.reason).toContain('can only access their own data');
      });

      it('should allow access to own vendor portal', async () => {
        const request: AccessRequest = {
          user: vendorUser,
          resource: 'vendor_portal',
          permission: 'write',
          resourceId: 'vendor-123'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
      });

      it('should deny access to business rules', async () => {
        const request: AccessRequest = {
          user: vendorUser,
          resource: 'business_rules',
          permission: 'read'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(false);
      });

      it('should allow access to own price history', async () => {
        const request: AccessRequest = {
          user: vendorUser,
          resource: 'price_history',
          permission: 'read',
          resourceId: 'vendor-123'
        };

        const result = await rbacService.checkAccess(request);
        expect(result.granted).toBe(true);
      });
    });

    describe('Admin Role', () => {
      const adminUser: UserContext = {
        userId: 'admin-1',
        role: 'Admin'
      };

      it('should allow full system access', async () => {
        const resources: PriceManagementResource[] = [
          'vendor_pricing',
          'price_assignments',
          'business_rules',
          'vendor_management',
          'price_overrides',
          'audit_logs',
          'analytics'
        ];

        const permissions: Permission[] = ['read', 'write', 'delete', 'configure', 'manage'];

        for (const resource of resources) {
          for (const permission of permissions) {
            const request: AccessRequest = {
              user: adminUser,
              resource,
              permission
            };

            const result = await rbacService.checkAccess(request);
            expect(result.granted).toBe(true);
          }
        }
      });
    });
  });

  describe('Audit Logging - Requirement 9.5', () => {
    it('should log all access attempts', async () => {
      const user: UserContext = {
        userId: 'test-user',
        role: 'Purchaser'
      };

      const request: AccessRequest = {
        user,
        resource: 'vendor_pricing',
        permission: 'read'
      };

      await rbacService.checkAccess(request);

      const auditEvents = await rbacService.getAuditEvents({
        userId: 'test-user'
      });

      expect(auditEvents.length).toBeGreaterThan(0);
      expect(auditEvents[0].userId).toBe('test-user');
      expect(auditEvents[0].resource).toBe('vendor_pricing');
      expect(auditEvents[0].permission).toBe('read');
    });

    it('should log both successful and failed access attempts', async () => {
      const requestorUser: UserContext = {
        userId: 'requestor-test',
        role: 'Requestor'
      };

      // Successful access
      await rbacService.checkAccess({
        user: requestorUser,
        resource: 'price_assignments',
        permission: 'read',
        resourceId: 'requestor-test'
      });

      // Failed access
      await rbacService.checkAccess({
        user: requestorUser,
        resource: 'vendor_pricing',
        permission: 'read'
      });

      const auditEvents = await rbacService.getAuditEvents({
        userId: 'requestor-test'
      });

      expect(auditEvents.length).toBe(2);
      expect(auditEvents.some(e => e.granted === true)).toBe(true);
      expect(auditEvents.some(e => e.granted === false)).toBe(true);
    });

    it('should filter audit events by criteria', async () => {
      const user: UserContext = {
        userId: 'filter-test',
        role: 'Purchaser'
      };

      // Generate multiple events
      await rbacService.checkAccess({
        user,
        resource: 'vendor_pricing',
        permission: 'read'
      });

      await rbacService.checkAccess({
        user,
        resource: 'price_assignments',
        permission: 'write'
      });

      // Filter by resource
      const vendorPricingEvents = await rbacService.getAuditEvents({
        userId: 'filter-test',
        resource: 'vendor_pricing'
      });

      expect(vendorPricingEvents.length).toBe(1);
      expect(vendorPricingEvents[0].resource).toBe('vendor_pricing');

      // Filter by granted status
      const grantedEvents = await rbacService.getAuditEvents({
        userId: 'filter-test',
        granted: true
      });

      expect(grantedEvents.every(e => e.granted === true)).toBe(true);
    });
  });

  describe('Permission Management - Requirement 9.6', () => {
    it('should allow updating permissions', async () => {
      // Get initial permissions
      const initialPermissions = rbacService.getPermissions('Requestor', 'vendor_pricing');
      expect(initialPermissions).toEqual([]);

      // Update permissions
      await rbacService.updatePermissions('Requestor', 'vendor_pricing', ['read']);

      // Verify permissions were updated
      const updatedPermissions = rbacService.getPermissions('Requestor', 'vendor_pricing');
      expect(updatedPermissions).toEqual(['read']);

      // Verify access is now granted
      const user: UserContext = {
        userId: 'permission-test',
        role: 'Requestor'
      };

      const result = await rbacService.checkAccess({
        user,
        resource: 'vendor_pricing',
        permission: 'read'
      });

      expect(result.granted).toBe(true);
    });

    it('should audit permission changes', async () => {
      await rbacService.updatePermissions('Requestor', 'vendor_pricing', ['read']);

      const auditEvents = await rbacService.getAuditEvents({
        userId: 'system'
      });

      const permissionChangeEvent = auditEvents.find(e => 
        e.reason.includes('Updated permissions')
      );

      expect(permissionChangeEvent).toBeDefined();
      expect(permissionChangeEvent?.reason).toContain('Requestor');
      expect(permissionChangeEvent?.reason).toContain('vendor_pricing');
    });
  });

  describe('Data Filtering', () => {
    it('should apply data restrictions correctly', async () => {
      const testData = [
        {
          id: '1',
          vendorDetails: 'Sensitive vendor info',
          priceBreakdown: 'Detailed pricing',
          assignedPrice: 100,
          currency: 'USD'
        },
        {
          id: '2',
          vendorDetails: 'Another vendor',
          priceBreakdown: 'More pricing details',
          assignedPrice: 200,
          currency: 'EUR'
        }
      ];

      const restrictions = [
        { field: 'vendorDetails', action: 'hide' as const },
        { field: 'priceBreakdown', action: 'mask' as const }
      ];

      const filteredData = rbacService.filterDataByRestrictions(testData, restrictions);

      expect(filteredData[0]).not.toHaveProperty('vendorDetails');
      expect(filteredData[0].priceBreakdown).toBe('***');
      expect(filteredData[0].assignedPrice).toBe(100);
      expect(filteredData[0].currency).toBe('USD');
    });
  });

  describe('Bulk Operations', () => {
    it('should check bulk operation permissions', async () => {
      const purchaserUser: UserContext = {
        userId: 'purchaser-bulk',
        role: 'Purchaser'
      };

      const requestorUser: UserContext = {
        userId: 'requestor-bulk',
        role: 'Requestor'
      };

      const purchaserCanBulk = await rbacService.canPerformBulkOperations(
        purchaserUser, 
        'assignment_queues'
      );
      expect(purchaserCanBulk).toBe(true);

      const requestorCanBulk = await rbacService.canPerformBulkOperations(
        requestorUser, 
        'assignment_queues'
      );
      expect(requestorCanBulk).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid user context', async () => {
      const invalidUser = null as any;

      const request: AccessRequest = {
        user: invalidUser,
        resource: 'vendor_pricing',
        permission: 'read'
      };

      // This should not throw an error but should deny access
      const result = await rbacService.checkAccess(request);
      expect(result.granted).toBe(false);
    });

    it('should handle unknown roles', async () => {
      const unknownRoleUser: UserContext = {
        userId: 'unknown-user',
        role: 'UnknownRole' as any
      };

      const request: AccessRequest = {
        user: unknownRoleUser,
        resource: 'vendor_pricing',
        permission: 'read'
      };

      const result = await rbacService.checkAccess(request);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('No access rules defined');
    });

    it('should handle missing resource ID when required', async () => {
      const vendorUser: UserContext = {
        userId: 'vendor-test',
        role: 'Vendor',
        vendorId: 'vendor-123'
      };

      const request: AccessRequest = {
        user: vendorUser,
        resource: 'vendor_pricing',
        permission: 'read'
        // Missing resourceId
      };

      const result = await rbacService.checkAccess(request);
      expect(result.granted).toBe(false);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent access checks', async () => {
      const user: UserContext = {
        userId: 'concurrent-test',
        role: 'Purchaser'
      };

      const requests = Array.from({ length: 100 }, (_, i) => ({
        user,
        resource: 'vendor_pricing' as PriceManagementResource,
        permission: 'read' as Permission,
        resourceId: `resource-${i}`
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => rbacService.checkAccess(request))
      );
      const endTime = Date.now();

      expect(results.length).toBe(100);
      expect(results.every(r => r.granted === true)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should efficiently filter large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        sensitiveField: `sensitive-${i}`,
        publicField: `public-${i}`,
        price: i * 10
      }));

      const restrictions = [
        { field: 'sensitiveField', action: 'hide' as const }
      ];

      const startTime = Date.now();
      const filteredData = rbacService.filterDataByRestrictions(largeDataset, restrictions);
      const endTime = Date.now();

      expect(filteredData.length).toBe(1000);
      expect(filteredData.every(item => !item.hasOwnProperty('sensitiveField'))).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});