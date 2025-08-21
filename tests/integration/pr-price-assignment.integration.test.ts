import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Integration tests for Purchase Request price assignment workflows
describe('PR Price Assignment Integration Tests', () => {
  let app: any;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = next({ dev: false, quiet: true });
    const handle = app.getRequestHandler();
    
    await app.prepare();
    
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });
    
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const port = server.address()?.port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('Automatic Price Assignment', () => {
    it('should automatically assign prices to new PR items', async () => {
      const prItemData = {
        productId: 'PROD-001',
        productName: 'Office Chair',
        categoryId: 'furniture',
        quantity: 5,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prItemData)
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.assignment).toBeDefined();
      expect(data.assignment.selectedVendor).toBeDefined();
      expect(data.assignment.assignedPrice).toBeGreaterThan(0);
      expect(data.assignment.confidence).toBeGreaterThan(0);
      expect(data.assignment.assignmentReason).toBeDefined();
    });

    it('should provide alternative vendor options', async () => {
      const prItemData = {
        productId: 'PROD-002',
        productName: 'Desk Lamp',
        categoryId: 'electronics',
        quantity: 10,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prItemData)
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.assignment.alternatives).toBeDefined();
      expect(Array.isArray(data.assignment.alternatives)).toBe(true);
      expect(data.assignment.alternatives.length).toBeGreaterThan(0);

      // Verify alternative structure
      data.assignment.alternatives.forEach((alt: any) => {
        expect(alt.vendorId).toBeDefined();
        expect(alt.vendorName).toBeDefined();
        expect(alt.price).toBeGreaterThan(0);
        expect(alt.currency).toBeDefined();
        expect(alt.availability).toBeDefined();
      });
    });

    it('should handle items with no available pricing', async () => {
      const prItemData = {
        productId: 'PROD-NONEXISTENT',
        productName: 'Non-existent Product',
        categoryId: 'unknown',
        quantity: 1,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prItemData)
      });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('No pricing available');
    });
  });

  describe('Business Rules Application', () => {
    it('should apply business rules during price assignment', async () => {
      // First, create a business rule
      const businessRule = {
        name: 'Preferred Vendor Rule',
        description: 'Prefer Vendor A for electronics',
        priority: 1,
        conditions: [
          {
            field: 'categoryId',
            operator: 'equals',
            value: 'electronics'
          }
        ],
        actions: [
          {
            type: 'assignVendor',
            parameters: { vendorId: 'vendor-preferred' }
          }
        ],
        isActive: true
      };

      const ruleResponse = await fetch(`${baseUrl}/api/price-management/business-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessRule)
      });

      expect(ruleResponse.status).toBe(200);

      // Then test price assignment with the rule
      const prItemData = {
        productId: 'PROD-003',
        productName: 'Monitor',
        categoryId: 'electronics',
        quantity: 2,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const assignmentResponse = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prItemData)
      });

      const assignmentData = await assignmentResponse.json();
      expect(assignmentData.success).toBe(true);
      expect(assignmentData.assignment.ruleApplied).toBeDefined();
      expect(assignmentData.assignment.assignmentReason).toContain('business rule');
    });

    it('should handle conflicting business rules', async () => {
      // Create two conflicting rules
      const rule1 = {
        name: 'Low Price Rule',
        priority: 1,
        conditions: [{ field: 'categoryId', operator: 'equals', value: 'office-supplies' }],
        actions: [{ type: 'assignVendor', parameters: { vendorId: 'vendor-cheap' } }],
        isActive: true
      };

      const rule2 = {
        name: 'Quality Rule',
        priority: 2, // Higher priority
        conditions: [{ field: 'categoryId', operator: 'equals', value: 'office-supplies' }],
        actions: [{ type: 'assignVendor', parameters: { vendorId: 'vendor-quality' } }],
        isActive: true
      };

      await fetch(`${baseUrl}/api/price-management/business-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule1)
      });

      await fetch(`${baseUrl}/api/price-management/business-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule2)
      });

      const prItemData = {
        productId: 'PROD-004',
        productName: 'Paper',
        categoryId: 'office-supplies',
        quantity: 100,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prItemData)
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      // Should apply higher priority rule
      expect(data.assignment.selectedVendor.vendorId).toBe('vendor-quality');
    });
  });

  describe('Price Assignment Override', () => {
    let assignmentId: string;

    beforeEach(async () => {
      // Create an assignment to override
      const prItemData = {
        productId: 'PROD-005',
        productName: 'Keyboard',
        categoryId: 'electronics',
        quantity: 1,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prItemData)
      });

      const data = await response.json();
      assignmentId = data.assignment.id;
    });

    it('should allow price assignment override', async () => {
      const overrideData = {
        reason: 'Better vendor relationship',
        newVendorId: 'vendor-override',
        newPrice: 75.00,
        currency: 'USD',
        overriddenBy: 'user-1'
      };

      const response = await fetch(`${baseUrl}/api/price-management/assignments/${assignmentId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideData)
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.override).toBeDefined();
      expect(data.override.newVendorId).toBe('vendor-override');
      expect(data.override.newPrice).toBe(75.00);
    });

    it('should validate override data', async () => {
      const invalidOverrideData = {
        reason: '', // Empty reason
        newVendorId: '',
        newPrice: -10, // Negative price
        currency: 'INVALID'
      };

      const response = await fetch(`${baseUrl}/api/price-management/assignments/${assignmentId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidOverrideData)
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toBeGreaterThan(0);
    });

    it('should maintain override audit trail', async () => {
      const overrideData = {
        reason: 'Cost optimization',
        newVendorId: 'vendor-cost-effective',
        newPrice: 65.00,
        currency: 'USD',
        overriddenBy: 'user-1'
      };

      await fetch(`${baseUrl}/api/price-management/assignments/${assignmentId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideData)
      });

      // Check audit trail
      const auditResponse = await fetch(`${baseUrl}/api/price-management/assignments/${assignmentId}/history`);
      
      expect(auditResponse.status).toBe(200);
      
      const auditData = await auditResponse.json();
      expect(auditData.success).toBe(true);
      expect(Array.isArray(auditData.history)).toBe(true);
      expect(auditData.history.length).toBeGreaterThan(0);
      
      const latestEntry = auditData.history[0];
      expect(latestEntry.action).toBe('override');
      expect(latestEntry.reason).toBe('Cost optimization');
      expect(latestEntry.overriddenBy).toBe('user-1');
    });
  });

  describe('Multi-Currency Price Assignment', () => {
    it('should handle multi-currency vendor pricing', async () => {
      const prItemData = {
        productId: 'PROD-006',
        productName: 'International Product',
        categoryId: 'electronics',
        quantity: 3,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations',
        preferredCurrency: 'EUR'
      };

      const response = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prItemData)
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.assignment.currency).toBeDefined();
      expect(data.assignment.normalizedPrice).toBeDefined();
      expect(data.assignment.exchangeRate).toBeDefined();
    });

    it('should normalize prices for comparison', async () => {
      const prItemData = {
        productId: 'PROD-007',
        productName: 'Multi-Currency Product',
        categoryId: 'electronics',
        quantity: 1,
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/price-assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prItemData)
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      
      // All alternatives should have normalized prices for comparison
      data.assignment.alternatives.forEach((alt: any) => {
        expect(alt.normalizedPrice).toBeDefined();
        expect(typeof alt.normalizedPrice).toBe('number');
      });
    });
  });

  describe('Bulk Price Assignment', () => {
    it('should handle bulk price assignment for multiple PR items', async () => {
      const bulkData = {
        items: [
          {
            prItemId: 'pr-item-1',
            productId: 'PROD-008',
            productName: 'Bulk Item 1',
            categoryId: 'office-supplies',
            quantity: 10
          },
          {
            prItemId: 'pr-item-2',
            productId: 'PROD-009',
            productName: 'Bulk Item 2',
            categoryId: 'office-supplies',
            quantity: 5
          },
          {
            prItemId: 'pr-item-3',
            productId: 'PROD-010',
            productName: 'Bulk Item 3',
            categoryId: 'electronics',
            quantity: 2
          }
        ],
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/assignments/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.assignments).toBeDefined();
      expect(Array.isArray(data.assignments)).toBe(true);
      expect(data.assignments.length).toBe(3);
      expect(data.summary).toBeDefined();
      expect(data.summary.totalItems).toBe(3);
      expect(data.summary.successfulAssignments).toBeGreaterThan(0);
    });

    it('should handle partial failures in bulk assignment', async () => {
      const bulkData = {
        items: [
          {
            prItemId: 'pr-item-4',
            productId: 'PROD-011',
            productName: 'Valid Item',
            categoryId: 'office-supplies',
            quantity: 1
          },
          {
            prItemId: 'pr-item-5',
            productId: 'PROD-INVALID',
            productName: 'Invalid Item',
            categoryId: 'unknown',
            quantity: 1
          }
        ],
        requestedDate: new Date().toISOString(),
        location: 'warehouse-1',
        department: 'operations'
      };

      const response = await fetch(`${baseUrl}/api/price-management/assignments/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });

      expect(response.status).toBe(207); // Partial success
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.summary.successfulAssignments).toBe(1);
      expect(data.summary.failedAssignments).toBe(1);
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toBe(1);
    });
  });

  describe('Assignment Performance and Analytics', () => {
    it('should track assignment performance metrics', async () => {
      const response = await fetch(`${baseUrl}/api/price-management/assignments/analytics`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.totalAssignments).toBeGreaterThanOrEqual(0);
      expect(data.metrics.automationRate).toBeGreaterThanOrEqual(0);
      expect(data.metrics.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(data.metrics.overrideRate).toBeGreaterThanOrEqual(0);
    });

    it('should provide assignment queue status', async () => {
      const response = await fetch(`${baseUrl}/api/price-management/assignments/queues`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.queues).toBeDefined();
      expect(Array.isArray(data.queues)).toBe(true);
      
      if (data.queues.length > 0) {
        data.queues.forEach((queue: any) => {
          expect(queue.name).toBeDefined();
          expect(queue.pendingCount).toBeGreaterThanOrEqual(0);
          expect(queue.processingCount).toBeGreaterThanOrEqual(0);
          expect(queue.status).toBeDefined();
        });
      }
    });
  });
});