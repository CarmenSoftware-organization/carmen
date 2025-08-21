import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VendorSelectionAlgorithm } from '../vendor-selection-algorithm';
import type { VendorPriceOption, PriceAssignmentContext } from '../../types/price-management';

describe('VendorSelectionAlgorithm', () => {
  let algorithm: VendorSelectionAlgorithm;

  beforeEach(() => {
    algorithm = new VendorSelectionAlgorithm();
  });

  const mockVendorOptions: VendorPriceOption[] = [
    {
      vendorId: 'vendor-1',
      vendorName: 'Premium Vendor',
      price: 100.00,
      currency: 'USD',
      normalizedPrice: 100.00,
      minQuantity: 1,
      availability: 'available',
      leadTime: 3,
      rating: 4.8,
      isPreferred: true
    },
    {
      vendorId: 'vendor-2',
      vendorName: 'Budget Vendor',
      price: 85.00,
      currency: 'USD',
      normalizedPrice: 85.00,
      minQuantity: 10,
      availability: 'available',
      leadTime: 7,
      rating: 4.2,
      isPreferred: false
    },
    {
      vendorId: 'vendor-3',
      vendorName: 'Fast Vendor',
      price: 95.00,
      currency: 'USD',
      normalizedPrice: 95.00,
      minQuantity: 1,
      availability: 'limited',
      leadTime: 1,
      rating: 4.5,
      isPreferred: false
    }
  ];

  const mockContext: PriceAssignmentContext = {
    prItemId: 'pr-item-1',
    productId: 'prod-1',
    categoryId: 'cat-1',
    quantity: 5,
    requestedDate: new Date(),
    location: 'warehouse-1',
    department: 'operations',
    availableVendors: mockVendorOptions
  };

  describe('selectOptimalVendor', () => {
    it('should select vendor based on weighted criteria', () => {
      const selected = algorithm.selectOptimalVendor(mockVendorOptions, mockContext);

      expect(selected).toBeDefined();
      expect(mockVendorOptions.some(v => v.vendorId === selected.vendorId)).toBe(true);
    });

    it('should prefer vendors with better ratings when prices are similar', () => {
      const similarPriceVendors: VendorPriceOption[] = [
        {
          ...mockVendorOptions[0],
          price: 100.00,
          normalizedPrice: 100.00,
          rating: 4.9
        },
        {
          ...mockVendorOptions[1],
          price: 100.00,
          normalizedPrice: 100.00,
          rating: 4.1
        }
      ];

      const selected = algorithm.selectOptimalVendor(similarPriceVendors, mockContext);
      expect(selected.rating).toBe(4.9);
    });

    it('should consider minimum quantity requirements', () => {
      const lowQuantityContext = { ...mockContext, quantity: 2 };
      const selected = algorithm.selectOptimalVendor(mockVendorOptions, lowQuantityContext);

      // Should not select vendor-2 due to minQuantity requirement of 10
      expect(selected.vendorId).not.toBe('vendor-2');
    });

    it('should handle availability constraints', () => {
      const unavailableVendors: VendorPriceOption[] = [
        {
          ...mockVendorOptions[0],
          availability: 'unavailable'
        },
        {
          ...mockVendorOptions[1],
          availability: 'available'
        }
      ];

      const selected = algorithm.selectOptimalVendor(unavailableVendors, mockContext);
      expect(selected.availability).toBe('available');
    });

    it('should throw error when no vendors meet criteria', () => {
      const unavailableVendors: VendorPriceOption[] = [
        {
          ...mockVendorOptions[0],
          availability: 'unavailable'
        }
      ];

      expect(() => algorithm.selectOptimalVendor(unavailableVendors, mockContext))
        .toThrow('No suitable vendors found');
    });
  });

  describe('calculateVendorScore', () => {
    it('should calculate score based on multiple factors', () => {
      const score = algorithm.calculateVendorScore(mockVendorOptions[0], mockVendorOptions, mockContext);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher scores to preferred vendors', () => {
      const preferredScore = algorithm.calculateVendorScore(mockVendorOptions[0], mockVendorOptions, mockContext);
      const nonPreferredScore = algorithm.calculateVendorScore(mockVendorOptions[1], mockVendorOptions, mockContext);

      expect(preferredScore).toBeGreaterThan(nonPreferredScore);
    });

    it('should penalize vendors with high minimum quantities for small orders', () => {
      const lowQuantityContext = { ...mockContext, quantity: 2 };
      
      const lowMinQtyScore = algorithm.calculateVendorScore(mockVendorOptions[0], mockVendorOptions, lowQuantityContext);
      const highMinQtyScore = algorithm.calculateVendorScore(mockVendorOptions[1], mockVendorOptions, lowQuantityContext);

      expect(lowMinQtyScore).toBeGreaterThan(highMinQtyScore);
    });
  });

  describe('filterEligibleVendors', () => {
    it('should filter vendors based on availability', () => {
      const eligible = algorithm.filterEligibleVendors(mockVendorOptions, mockContext);

      eligible.forEach(vendor => {
        expect(['available', 'limited']).toContain(vendor.availability);
      });
    });

    it('should filter vendors based on minimum quantity', () => {
      const lowQuantityContext = { ...mockContext, quantity: 2 };
      const eligible = algorithm.filterEligibleVendors(mockVendorOptions, lowQuantityContext);

      eligible.forEach(vendor => {
        expect(vendor.minQuantity).toBeLessThanOrEqual(2);
      });
    });

    it('should return empty array when no vendors are eligible', () => {
      const highQuantityContext = { ...mockContext, quantity: 1000 };
      const vendorsWithHighMinQty = mockVendorOptions.map(v => ({
        ...v,
        minQuantity: 2000
      }));

      const eligible = algorithm.filterEligibleVendors(vendorsWithHighMinQty, highQuantityContext);
      expect(eligible).toEqual([]);
    });
  });

  describe('sortVendorsByScore', () => {
    it('should sort vendors by calculated score in descending order', () => {
      const sorted = algorithm.sortVendorsByScore(mockVendorOptions, mockContext);

      for (let i = 1; i < sorted.length; i++) {
        const currentScore = algorithm.calculateVendorScore(sorted[i], mockVendorOptions, mockContext);
        const previousScore = algorithm.calculateVendorScore(sorted[i - 1], mockVendorOptions, mockContext);
        expect(currentScore).toBeLessThanOrEqual(previousScore);
      }
    });

    it('should maintain original order for vendors with equal scores', () => {
      const equalScoreVendors = [
        { ...mockVendorOptions[0], vendorId: 'vendor-a' },
        { ...mockVendorOptions[0], vendorId: 'vendor-b' }
      ];

      const sorted = algorithm.sortVendorsByScore(equalScoreVendors, mockContext);
      expect(sorted[0].vendorId).toBe('vendor-a');
      expect(sorted[1].vendorId).toBe('vendor-b');
    });
  });

  describe('getSelectionReason', () => {
    it('should provide clear reason for vendor selection', () => {
      const selected = mockVendorOptions[0];
      const reason = algorithm.getSelectionReason(selected, mockVendorOptions, mockContext);

      expect(reason).toBeDefined();
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    });

    it('should mention key factors in selection reason', () => {
      const selected = mockVendorOptions[0];
      const reason = algorithm.getSelectionReason(selected, mockVendorOptions, mockContext);

      // Should mention at least one key factor
      const keyFactors = ['price', 'rating', 'preferred', 'lead time', 'availability'];
      const mentionsKeyFactor = keyFactors.some(factor => 
        reason.toLowerCase().includes(factor.toLowerCase())
      );
      expect(mentionsKeyFactor).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty vendor list', () => {
      expect(() => algorithm.selectOptimalVendor([], mockContext))
        .toThrow('No vendors available');
    });

    it('should handle single vendor', () => {
      const singleVendor = [mockVendorOptions[0]];
      const selected = algorithm.selectOptimalVendor(singleVendor, mockContext);
      expect(selected).toEqual(mockVendorOptions[0]);
    });

    it('should handle vendors with zero prices', () => {
      const zeroPrice = { ...mockVendorOptions[0], price: 0, normalizedPrice: 0 };
      const vendors = [zeroPrice, mockVendorOptions[1]];
      
      const selected = algorithm.selectOptimalVendor(vendors, mockContext);
      expect(selected.price).toBeGreaterThanOrEqual(0);
    });
  });
});