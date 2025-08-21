import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrencyManagementService } from '../currency-management-service';

// Mock the currency exchange rates data
vi.mock('../../mock/price-management/currency-exchange-rates.json', () => ({
  default: {
    rates: [
      {
        id: '1',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.85,
        rateDate: '2024-01-15',
        source: 'ECB'
      },
      {
        id: '2',
        fromCurrency: 'EUR',
        toCurrency: 'USD',
        rate: 1.18,
        rateDate: '2024-01-15',
        source: 'ECB'
      }
    ],
    lastUpdated: '2024-01-15T10:00:00Z'
  }
}));

describe('CurrencyManagementService', () => {
  let service: CurrencyManagementService;

  beforeEach(() => {
    service = new CurrencyManagementService();
  });

  describe('convertCurrency', () => {
    it('should convert USD to EUR correctly', async () => {
      const result = await service.convertCurrency(100, 'USD', 'EUR');
      expect(result).toBeCloseTo(85, 2);
    });

    it('should convert EUR to USD correctly', async () => {
      const result = await service.convertCurrency(100, 'EUR', 'USD');
      expect(result).toBeCloseTo(118, 2);
    });

    it('should return same amount for same currency conversion', async () => {
      const result = await service.convertCurrency(100, 'USD', 'USD');
      expect(result).toBe(100);
    });

    it('should throw error for unsupported currency pair', async () => {
      await expect(service.convertCurrency(100, 'USD', 'JPY')).rejects.toThrow('Exchange rate not found');
    });

    it('should handle zero amount conversion', async () => {
      const result = await service.convertCurrency(0, 'USD', 'EUR');
      expect(result).toBe(0);
    });

    it('should handle negative amount conversion', async () => {
      const result = await service.convertCurrency(-100, 'USD', 'EUR');
      expect(result).toBeCloseTo(-85, 2);
    });
  });

  describe('getExchangeRate', () => {
    it('should return correct exchange rate for valid currency pair', async () => {
      const rate = await service.getExchangeRate('USD', 'EUR');
      expect(rate).toBe(0.85);
    });

    it('should return 1 for same currency pair', async () => {
      const rate = await service.getExchangeRate('USD', 'USD');
      expect(rate).toBe(1);
    });

    it('should throw error for invalid currency pair', async () => {
      await expect(service.getExchangeRate('USD', 'INVALID')).rejects.toThrow('Exchange rate not found');
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', async () => {
      const currencies = await service.getSupportedCurrencies();
      expect(currencies).toContain('USD');
      expect(currencies).toContain('EUR');
      expect(currencies.length).toBeGreaterThan(0);
    });
  });

  describe('updateExchangeRates', () => {
    it('should update exchange rates successfully', async () => {
      const result = await service.updateExchangeRates();
      expect(result.success).toBe(true);
      expect(result.updatedCount).toBeGreaterThan(0);
    });
  });

  describe('getExchangeRateHistory', () => {
    it('should return exchange rate history for valid currency pair', async () => {
      const history = await service.getExchangeRateHistory('USD', 'EUR', 30);
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid currency pair', async () => {
      const history = await service.getExchangeRateHistory('USD', 'INVALID', 30);
      expect(history).toEqual([]);
    });
  });
});