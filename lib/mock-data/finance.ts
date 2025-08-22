/**
 * Mock Finance Data
 * Centralized finance mock data for the Carmen ERP application
 */

import { Currency, ExchangeRate } from '@/lib/types'

export const mockCurrencies: Currency[] = [
  {
    id: 'USD',
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    isBase: true,
    isActive: true,
    decimalPlaces: 2
  },
  {
    id: 'EUR',
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    isBase: false,
    isActive: true,
    decimalPlaces: 2
  },
  {
    id: 'GBP',
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    isBase: false,
    isActive: true,
    decimalPlaces: 2
  },
  {
    id: 'CAD',
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    isBase: false,
    isActive: true,
    decimalPlaces: 2
  }
]

export const mockExchangeRates: ExchangeRate[] = [
  {
    id: 'usd-eur-001',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    rate: 0.85,
    effectiveDate: new Date('2024-08-22'),
    createdAt: new Date('2024-08-22'),
    isActive: true
  },
  {
    id: 'usd-gbp-001',
    fromCurrency: 'USD',
    toCurrency: 'GBP',
    rate: 0.78,
    effectiveDate: new Date('2024-08-22'),
    createdAt: new Date('2024-08-22'),
    isActive: true
  },
  {
    id: 'usd-cad-001',
    fromCurrency: 'USD',
    toCurrency: 'CAD',
    rate: 1.35,
    effectiveDate: new Date('2024-08-22'),
    createdAt: new Date('2024-08-22'),
    isActive: true
  }
]