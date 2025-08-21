import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';
import { priceValidationEngine } from '../price-validation-engine';

describe('PriceValidationEngine', () => {
  describe('validatePriceSubmission', () => {
    it('should validate a correct price submission', async () => {
      const validSubmission = {
        vendorId: '123e4567-e89b-12d3-a456-426614174000',
        categoryId: 'cat_001',
        currency: 'USD',
        effectiveDate: new Date('2024-02-01'),
        expirationDate: new Date('2024-05-01'),
        items: [
          {
            productId: 'PROD-001',
            productName: 'Test Product',
            unitPrice: 29.99,
            currency: 'USD',
            minQuantity: 1,
            validFrom: new Date('2024-02-01'),
            validTo: new Date('2024-05-01')
          }
        ],
        submissionMethod: 'manual'
      };

      const result = await priceValidationEngine.validatePriceSubmission(validSubmission);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.qualityScore).toBeGreaterThan(80);
    });

    it('should detect validation errors in invalid submission', async () => {
      const invalidSubmission = {
        vendorId: 'invalid-uuid',
        categoryId: '',
        currency: 'INVALID',
        effectiveDate: new Date('2024-05-01'),
        expirationDate: new Date('2024-02-01'), // Invalid: before effective date
        items: [
          {
            productId: '',
            productName: '',
            unitPrice: -10, // Invalid: negative price
            currency: 'XX', // Invalid: not 3 letters
            minQuantity: 0, // Invalid: not positive
            validFrom: new Date('2024-05-01'),
            validTo: new Date('2024-02-01') // Invalid: before valid from
          }
        ],
        submissionMethod: 'manual'
      };

      const result = await priceValidationEngine.validatePriceSubmission(invalidSubmission);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.qualityScore).toBeLessThan(50);
    });

    it('should provide helpful suggestions for errors', async () => {
      const submissionWithErrors = {
        vendorId: '123e4567-e89b-12d3-a456-426614174000',
        categoryId: 'cat_001',
        currency: 'USD',
        effectiveDate: new Date('2024-02-01'),
        expirationDate: new Date('2024-05-01'),
        items: [
          {
            productId: 'PROD-001',
            productName: 'Test Product',
            unitPrice: -29.99, // This will trigger a validation error
            currency: 'USD',
            minQuantity: 1,
            validFrom: new Date('2024-02-01'),
            validTo: new Date('2024-05-01')
          }
        ],
        submissionMethod: 'manual'
      };

      const result = await priceValidationEngine.validatePriceSubmission(submissionWithErrors);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.suggestion)).toBe(true);
    });

    it('should detect business rule violations', async () => {
      const submissionWithDuplicates = {
        vendorId: '123e4567-e89b-12d3-a456-426614174000',
        categoryId: 'cat_001',
        currency: 'USD',
        effectiveDate: new Date('2024-02-01'),
        expirationDate: new Date('2024-05-01'),
        items: [
          {
            productId: 'PROD-001',
            productName: 'Test Product',
            unitPrice: 29.99,
            currency: 'USD',
            minQuantity: 1,
            validFrom: new Date('2024-02-01'),
            validTo: new Date('2024-05-01')
          },
          {
            productId: 'PROD-001', // Duplicate product ID
            productName: 'Test Product Duplicate',
            unitPrice: 39.99,
            currency: 'USD',
            minQuantity: 1,
            validFrom: new Date('2024-02-01'),
            validTo: new Date('2024-05-01')
          }
        ],
        submissionMethod: 'manual'
      };

      const result = await priceValidationEngine.validatePriceSubmission(submissionWithDuplicates);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.code === 'DUPLICATE_PRODUCT')).toBe(true);
    });

    it('should calculate quality score correctly', async () => {
      const partialSubmission = {
        vendorId: '123e4567-e89b-12d3-a456-426614174000',
        categoryId: 'cat_001',
        currency: 'USD',
        effectiveDate: new Date('2024-02-01'),
        expirationDate: new Date('2024-05-01'),
        items: [
          {
            productId: 'PROD-001',
            productName: 'Test Product',
            unitPrice: 29.99,
            currency: 'USD',
            minQuantity: 1,
            validFrom: new Date('2024-02-01'),
            validTo: new Date('2024-02-15') // Short validity period - should generate warning
          }
        ],
        submissionMethod: 'manual'
      };

      const result = await priceValidationEngine.validatePriceSubmission(partialSubmission);

      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.qualityScore).toBeLessThan(100);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});