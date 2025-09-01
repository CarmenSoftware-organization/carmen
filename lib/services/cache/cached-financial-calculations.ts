/**
 * Cached Financial Calculations Service
 * 
 * Transparent caching wrapper for FinancialCalculations with 
 * intelligent cache invalidation and dependency tracking.
 */

import { 
  FinancialCalculations,
  TaxCalculationInput,
  TaxCalculationResult,
  DiscountCalculationInput,
  DiscountCalculationResult,
  CurrencyConversionInput,
  CurrencyConversionResult,
  LineItemCalculationInput,
  LineItemCalculationResult
} from '../calculations/financial-calculations';
import { CalculationResult } from '../calculations/base-calculator';
import { Money } from '@/lib/types';
import { EnhancedCacheLayer, CacheDependency } from './enhanced-cache-layer';

/**
 * Cached financial calculations with transparent caching
 */
export class CachedFinancialCalculations extends FinancialCalculations {
  constructor(private cacheLayer: EnhancedCacheLayer) {
    super();
  }

  /**
   * Calculate tax amount and total with caching
   */
  async calculateTax(input: TaxCalculationInput): Promise<CalculationResult<TaxCalculationResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'tax_rates',
        version: input.taxRate.toString()
      },
      {
        type: 'field',
        identifier: 'currency_rates',
        version: input.currencyCode || input.subtotal.currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'FinancialCalculations',
      'calculateTax',
      input,
      () => super.calculateTax(input),
      dependencies
    );
  }

  /**
   * Calculate discount amount and net amount with caching
   */
  async calculateDiscount(input: DiscountCalculationInput): Promise<CalculationResult<DiscountCalculationResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'discount_rates',
        version: input.discountRate?.toString() || 'fixed'
      },
      {
        type: 'field',
        identifier: 'currency_rates',
        version: input.currencyCode || input.subtotal.currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'FinancialCalculations',
      'calculateDiscount',
      input,
      () => super.calculateDiscount(input),
      dependencies
    );
  }

  /**
   * Convert currency amount with caching
   */
  async convertCurrency(input: CurrencyConversionInput): Promise<CalculationResult<CurrencyConversionResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'external',
        identifier: 'exchange_rates',
        version: input.conversionDate?.toISOString() || new Date().toDateString()
      },
      {
        type: 'field',
        identifier: `currency_pair:${input.amount.currencyCode}_${input.toCurrency}`,
        version: input.exchangeRate?.toString() || 'live'
      }
    ];

    return this.cacheLayer.getOrCompute(
      'FinancialCalculations',
      'convertCurrency',
      input,
      () => super.convertCurrency(input),
      dependencies
    );
  }

  /**
   * Calculate complete line item totals with caching
   */
  async calculateLineItemTotal(input: LineItemCalculationInput): Promise<CalculationResult<LineItemCalculationResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'tax_rates',
        version: input.taxRate?.toString() || '0'
      },
      {
        type: 'field',
        identifier: 'discount_rates',
        version: input.discountRate?.toString() || '0'
      },
      {
        type: 'field',
        identifier: 'currency_rates',
        version: input.currencyCode || input.unitPrice.currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'FinancialCalculations',
      'calculateLineItemTotal',
      input,
      () => super.calculateLineItemTotal(input),
      dependencies
    );
  }

  /**
   * Add multiple money amounts with caching
   */
  async addMoney(amounts: Money[]): Promise<CalculationResult<Money>> {
    if (amounts.length === 0) {
      return super.addMoney(amounts);
    }

    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'currency_validation',
        version: amounts[0].currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'FinancialCalculations',
      'addMoney',
      { amounts },
      () => super.addMoney(amounts),
      dependencies
    );
  }

  /**
   * Calculate percentage of an amount with caching
   */
  async calculatePercentage(amount: Money, percentage: number): Promise<CalculationResult<Money>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'currency_rates',
        version: amount.currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'FinancialCalculations',
      'calculatePercentage',
      { amount, percentage },
      () => super.calculatePercentage(amount, percentage),
      dependencies
    );
  }

  /**
   * Compare two money amounts with caching
   */
  async compareMoney(amount1: Money, amount2: Money): Promise<CalculationResult<number>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'currency_validation',
        version: `${amount1.currencyCode}_${amount2.currencyCode}`
      }
    ];

    return this.cacheLayer.getOrCompute(
      'FinancialCalculations',
      'compareMoney',
      { amount1, amount2 },
      () => super.compareMoney(amount1, amount2),
      dependencies
    );
  }

  /**
   * Invalidate financial calculation caches
   */
  async invalidateFinancialCaches(reason: string, userId?: string): Promise<number> {
    const dependencies: CacheDependency[] = [
      { type: 'field', identifier: 'tax_rates' },
      { type: 'field', identifier: 'discount_rates' },
      { type: 'field', identifier: 'currency_rates' },
      { type: 'external', identifier: 'exchange_rates' }
    ];

    return this.cacheLayer.invalidateByDependencies({
      dependencies,
      reason,
      timestamp: new Date(),
      userId
    });
  }

  /**
   * Warm cache with common financial calculations
   */
  async warmFinancialCache(): Promise<{ warmed: number; failed: number }> {
    const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
    const commonTaxRates = [0, 5, 7, 10, 15, 20, 25];
    const commonDiscountRates = [0, 5, 10, 15, 20, 25, 50];

    const warmingTasks = [];

    // Common tax calculations
    for (const taxRate of commonTaxRates) {
      for (const currency of commonCurrencies) {
        warmingTasks.push({
          serviceClass: 'FinancialCalculations',
          method: 'calculateTax',
          inputs: {
            subtotal: { amount: 100, currencyCode: currency },
            taxRate,
            taxIncluded: false
          },
          computeFn: () => this.calculateTax({
            subtotal: { amount: 100, currencyCode: currency },
            taxRate,
            taxIncluded: false
          }),
          priority: 3
        });
      }
    }

    // Common discount calculations
    for (const discountRate of commonDiscountRates) {
      for (const currency of commonCurrencies) {
        warmingTasks.push({
          serviceClass: 'FinancialCalculations',
          method: 'calculateDiscount',
          inputs: {
            subtotal: { amount: 100, currencyCode: currency },
            discountRate
          },
          computeFn: () => this.calculateDiscount({
            subtotal: { amount: 100, currencyCode: currency },
            discountRate
          }),
          priority: 2
        });
      }
    }

    // Common percentage calculations
    const commonPercentages = [1, 5, 10, 15, 20, 25, 50];
    for (const percentage of commonPercentages) {
      for (const currency of commonCurrencies) {
        warmingTasks.push({
          serviceClass: 'FinancialCalculations',
          method: 'calculatePercentage',
          inputs: {
            amount: { amount: 100, currencyCode: currency },
            percentage
          },
          computeFn: () => this.calculatePercentage(
            { amount: 100, currencyCode: currency },
            percentage
          ),
          priority: 1
        });
      }
    }

    return this.cacheLayer.warmCache(warmingTasks);
  }
}