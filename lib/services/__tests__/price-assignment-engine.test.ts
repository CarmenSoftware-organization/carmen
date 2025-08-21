import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceAssignmentEngine } from '../price-assignment-engine';
import type { PriceAssignmentContext, VendorPriceOption } from '../../types/price-management';

// Mock the price assignment data
vi.mock('../../mock/price-management/pr-price-assignments.json', () => ({
  default: {
    assignments: [
      {
        id: '1',
        prItemId: 'pr-item-1',
        productId: 'prod-1',
        vendorId: 'vendor-1',
        price: 25.50,
        currency: 'USD',
        confidence: 0.95,
        reason: 'Best price match with preferred vendor'
      }
    ],
    vendorOptions: [
      {
        vendorId: 'vendor-1',
        vendorName: 'Vendor A',
        price: 25.50,
        currency: 'USD',
        normalizedPrice: 25.50,
        minQuantity: 1,
        availability: 'available',
        leadTime: 5,
        rating: 4.5,
        isPreferred: true
      },
      {
        vendorId: 'vendor-2',
        vendorName: 'Vendor B',
        price: 27.00,
        currency: 'USD',
        normalizedPrice: 27.00,
        minQuantity: 10,
        availability: 'available',
        leadTime: 3,
        rating: 4.2,
        isPreferred: false
      }
    ]
  }
}));

describe('PriceAssignmentEngine', () => {
  let engine: PriceAssignmentEngine;

  beforeEach(() => {
    engine = new PriceAssignmentEngine();
  });

  describe('assignOptimalPrice', () => {
    it('should assign optimal price based on business rules', async () => {
      const context: PriceAssignmentContext = {
        prItemId: 'pr-item-1',
        productId: 'prod-1',
        categoryId: 'cat-1',
        quantity: 5,
        requestedDate: new Date(),
        location: 'warehouse-1',
        department: 'operations',
        availableVendors: []
      };

      const result = await engine.assignOptimalPrice(context);

      expect(result).toBeDefined();
      expect(result.prItemId).toBe('pr-item-1');
      expect(result.assignedPrice).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.selectedVendor).toBeDefined();
      expect(result.assignmentReason).toBeDefined();
    });

    it('should handle context with no available vendors', async () => {
      const context: PriceAssignmentContext = {
        prItemId: 'pr-item-2',
        productId: 'prod-2',
        categoryId: 'cat-2',
        quantity: 1,
        requestedDate: new Date(),
        location: 'warehouse-1',
        department: 'operations',
        availableVendors: []
      };

      await expect(engine.assignOptimalPrice(context)).rejects.toThrow('No available vendors found');
    });

    it('should consider quantity requirements in assignment', async () => {
      const context: PriceAssignmentContext = {
        prItemId: 'pr-item-3',
        productId: 'prod-1',
        categoryId: 'cat-1',
        quantity: 50,
        requestedDate: new Date(),
        location: 'warehouse-1',
        department: 'operations',
        availableVendors: []
      };

      const result = await engine.assignOptimalPrice(context);
      expect(result.selectedVendor).toBeDefined();
    });
  });

  describe('getAlternativeOptions', () => {
    it('should return alternative vendor options', async () => {
      const context: PriceAssignmentContext = {
        prItemId: 'pr-item-1',
        productId: 'prod-1',
        categoryId: 'cat-1',
        quantity: 5,
        requestedDate: new Date(),
        location: 'warehouse-1',
        department: 'operations',
        availableVendors: []
      };

      const alternatives = await engine.getAlternativeOptions(context);

      expect(Array.isArray(alternatives)).toBe(true);
      expect(alternatives.length).toBeGreaterThan(0);
      alternatives.forEach(option => {
        expect(option.vendorId).toBeDefined();
        expect(option.vendorName).toBeDefined();
        expect(option.price).toBeGreaterThan(0);
        expect(option.currency).toBeDefined();
        expect(option.availability).toBeDefined();
      });
    });

    it('should sort alternatives by normalized price', async () => {
      const context: PriceAssignmentContext = {
        prItemId: 'pr-item-1',
        productId: 'prod-1',
        categoryId: 'cat-1',
        quantity: 5,
        requestedDate: new Date(),
        location: 'warehouse-1',
        department: 'operations',
        availableVendors: []
      };

      const alternatives = await engine.getAlternativeOptions(context);

      for (let i = 1; i < alternatives.length; i++) {
        expect(alternatives[i].normalizedPrice).toBeGreaterThanOrEqual(alternatives[i - 1].normalizedPrice);
      }
    });
  });

  describe('overrideAssignment', () => {
    it('should successfully override price assignment', async () => {
      const override = {
        reason: 'Better vendor relationship',
        newVendorId: 'vendor-2',
        newPrice: 26.00,
        currency: 'USD',
        overriddenBy: 'user-1',
        overrideDate: new Date()
      };

      await expect(engine.overrideAssignment('pr-item-1', override)).resolves.not.toThrow();
    });

    it('should validate override data', async () => {
      const invalidOverride = {
        reason: '',
        newVendorId: '',
        newPrice: -1,
        currency: '',
        overriddenBy: '',
        overrideDate: new Date()
      };

      await expect(engine.overrideAssignment('pr-item-1', invalidOverride)).rejects.toThrow('Invalid override data');
    });
  });

  describe('getAssignmentHistory', () => {
    it('should return assignment history for PR item', async () => {
      const history = await engine.getAssignmentHistory('pr-item-1');

      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        history.forEach(entry => {
          expect(entry.assignmentDate).toBeDefined();
          expect(entry.vendorId).toBeDefined();
          expect(entry.price).toBeGreaterThan(0);
        });
      }
    });

    it('should return empty array for non-existent PR item', async () => {
      const history = await engine.getAssignmentHistory('non-existent');
      expect(history).toEqual([]);
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should calculate confidence score based on vendor factors', () => {
      const vendorOption: VendorPriceOption = {
        vendorId: 'vendor-1',
        vendorName: 'Vendor A',
        price: 25.50,
        currency: 'USD',
        normalizedPrice: 25.50,
        minQuantity: 1,
        availability: 'available',
        leadTime: 5,
        rating: 4.5,
        isPreferred: true
      };

      const confidence = engine.calculateConfidenceScore(vendorOption, [vendorOption]);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should give higher confidence to preferred vendors', () => {
      const preferredVendor: VendorPriceOption = {
        vendorId: 'vendor-1',
        vendorName: 'Vendor A',
        price: 25.50,
        currency: 'USD',
        normalizedPrice: 25.50,
        minQuantity: 1,
        availability: 'available',
        leadTime: 5,
        rating: 4.5,
        isPreferred: true
      };

      const regularVendor: VendorPriceOption = {
        ...preferredVendor,
        vendorId: 'vendor-2',
        isPreferred: false
      };

      const preferredConfidence = engine.calculateConfidenceScore(preferredVendor, [preferredVendor, regularVendor]);
      const regularConfidence = engine.calculateConfidenceScore(regularVendor, [preferredVendor, regularVendor]);

      expect(preferredConfidence).toBeGreaterThan(regularConfidence);
    });
  });
});