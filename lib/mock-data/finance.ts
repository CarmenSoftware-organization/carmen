/**
 * Mock Finance Data
 * Centralized finance mock data for the Carmen ERP application
 */

import { Currency, ExchangeRate, ExchangeRateSource } from '@/lib/types'

export const mockCurrencies: Currency[] = [
  {
    id: 'USD',
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isBaseCurrency: true,
    isActive: true,
    allowNegativeBalance: false,
    roundingMethod: 'round',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedBy: 'system',
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'EUR',
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isBaseCurrency: false,
    isActive: true,
    allowNegativeBalance: false,
    roundingMethod: 'round',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedBy: 'system',
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'GBP',
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isBaseCurrency: false,
    isActive: true,
    allowNegativeBalance: false,
    roundingMethod: 'round',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedBy: 'system',
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'CAD',
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isBaseCurrency: false,
    isActive: true,
    allowNegativeBalance: false,
    roundingMethod: 'round',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedBy: 'system',
    updatedAt: new Date('2024-01-01')
  }
]

export const mockExchangeRates: ExchangeRate[] = [
  {
    id: 'usd-eur-001',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    rate: 0.85,
    inverseRate: 1.176,
    effectiveDate: new Date('2024-08-22'),
    source: ExchangeRateSource.SYSTEM_DEFAULT,
    rateType: 'spot',
    isActive: true,
    confidence: 95,
    createdBy: 'system',
    createdAt: new Date('2024-08-22'),
    updatedBy: 'system',
    updatedAt: new Date('2024-08-22')
  },
  {
    id: 'usd-gbp-001',
    fromCurrency: 'USD',
    toCurrency: 'GBP',
    rate: 0.78,
    inverseRate: 1.282,
    effectiveDate: new Date('2024-08-22'),
    source: ExchangeRateSource.SYSTEM_DEFAULT,
    rateType: 'spot',
    isActive: true,
    confidence: 95,
    createdBy: 'system',
    createdAt: new Date('2024-08-22'),
    updatedBy: 'system',
    updatedAt: new Date('2024-08-22')
  },
  {
    id: 'usd-cad-001',
    fromCurrency: 'USD',
    toCurrency: 'CAD',
    rate: 1.35,
    inverseRate: 0.741,
    effectiveDate: new Date('2024-08-22'),
    source: ExchangeRateSource.SYSTEM_DEFAULT,
    rateType: 'spot',
    isActive: true,
    confidence: 95,
    createdBy: 'system',
    createdAt: new Date('2024-08-22'),
    updatedBy: 'system',
    updatedAt: new Date('2024-08-22')
  }
]