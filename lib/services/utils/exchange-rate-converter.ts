/**
 * Exchange Rate Converter Service
 * 
 * Handles currency conversions with caching, fallbacks, and rate validation.
 * Integrates with external rate providers and maintains historical rates.
 */

import { Money, ExchangeRate, ExchangeRateSource } from '@/lib/types'
import { BaseCalculator, CalculationResult } from '../calculations/base-calculator'
import { globalCacheManager } from './cache-manager'

/**
 * Exchange rate provider interface
 */
export interface ExchangeRateProvider {
  name: string;
  getRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateData>;
  getSupportedCurrencies(): Promise<string[]>;
  isAvailable(): Promise<boolean>;
}

/**
 * Exchange rate data from provider
 */
export interface ExchangeRateData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: ExchangeRateSource;
  timestamp: Date;
  confidence: number; // 0-1
}

/**
 * Currency conversion request
 */
export interface ConversionRequest {
  amount: Money;
  toCurrency: string;
  date?: Date;
  preferredSource?: ExchangeRateSource;
  fallbackToCache?: boolean;
  maxAgeHours?: number;
}

/**
 * Currency conversion response
 */
export interface ConversionResponse {
  originalAmount: Money;
  convertedAmount: Money;
  exchangeRate: number;
  source: ExchangeRateSource;
  timestamp: Date;
  confidence: number;
  cacheHit: boolean;
}

/**
 * Mock exchange rate provider for development
 */
class MockExchangeRateProvider implements ExchangeRateProvider {
  name = 'MockProvider';

  // Static mock rates (in production, this would call external APIs)
  private mockRates: Record<string, Record<string, number>> = {
    'USD': {
      'EUR': 0.85,
      'GBP': 0.73,
      'JPY': 110.0,
      'THB': 33.5,
      'SGD': 1.35,
      'AUD': 1.45
    },
    'EUR': {
      'USD': 1.18,
      'GBP': 0.86,
      'JPY': 129.4,
      'THB': 39.4,
      'SGD': 1.59,
      'AUD': 1.71
    },
    'THB': {
      'USD': 0.0299,
      'EUR': 0.0254,
      'GBP': 0.0218,
      'JPY': 3.28,
      'SGD': 0.0403,
      'AUD': 0.0433
    }
  };

  async getRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const rate = this.mockRates[fromCurrency]?.[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
    }

    // Add some realistic variance (±2%)
    const variance = (Math.random() - 0.5) * 0.04;
    const adjustedRate = rate * (1 + variance);

    return {
      fromCurrency,
      toCurrency,
      rate: Math.round(adjustedRate * 10000) / 10000, // 4 decimal places
      source: ExchangeRateSource.MOCK,
      timestamp: new Date(),
      confidence: 0.95
    };
  }

  async getSupportedCurrencies(): Promise<string[]> {
    return Object.keys(this.mockRates);
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

export class ExchangeRateConverter extends BaseCalculator {
  protected serviceName = 'ExchangeRateConverter';

  private providers: ExchangeRateProvider[] = [
    new MockExchangeRateProvider()
  ];

  private readonly CACHE_TTL_HOURS = 1; // Cache rates for 1 hour
  private readonly FALLBACK_CACHE_TTL_DAYS = 30; // Keep fallback cache for 30 days

  /**
   * Convert money from one currency to another
   */
  async convertCurrency(request: ConversionRequest): Promise<CalculationResult<ConversionResponse>> {
    return this.executeCalculation('convertCurrency', request, async (context) => {
      this.validateMoney(request.amount, 'amount');

      if (!request.toCurrency) {
        throw this.createError('Target currency is required', 'MISSING_TARGET_CURRENCY', context);
      }

      const { amount, toCurrency } = request;
      const fromCurrency = amount.currencyCode;

      // Same currency, no conversion needed
      if (fromCurrency === toCurrency.toUpperCase()) {
        return {
          originalAmount: amount,
          convertedAmount: amount,
          exchangeRate: 1.0,
          source: ExchangeRateSource.SAME_CURRENCY,
          timestamp: new Date(),
          confidence: 1.0,
          cacheHit: false
        };
      }

      // Try to get exchange rate
      const rateData = await this.getExchangeRate(
        fromCurrency,
        toCurrency.toUpperCase(),
        request.preferredSource,
        request.fallbackToCache ?? true,
        request.maxAgeHours ?? this.CACHE_TTL_HOURS
      );

      // Calculate converted amount
      const convertedValue = amount.amount * rateData.rate;
      const convertedAmount = this.createMoney(convertedValue, toCurrency.toUpperCase());

      return {
        originalAmount: amount,
        convertedAmount,
        exchangeRate: rateData.rate,
        source: rateData.source,
        timestamp: rateData.timestamp,
        confidence: rateData.confidence,
        cacheHit: rateData.cacheHit || false
      };
    });
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    preferredSource?: ExchangeRateSource,
    fallbackToCache: boolean = true,
    maxAgeHours: number = 1
  ): Promise<ExchangeRateData & { cacheHit?: boolean }> {
    const cacheKey = `exchange_rate:${fromCurrency}:${toCurrency}`;
    const fallbackCacheKey = `exchange_rate_fallback:${fromCurrency}:${toCurrency}`;

    // Try fresh cache first
    const cachedRate = globalCacheManager.get<ExchangeRateData>(cacheKey);
    if (cachedRate && this.isRateStillValid(cachedRate, maxAgeHours)) {
      return { ...cachedRate, cacheHit: true };
    }

    // Try to fetch fresh rate
    try {
      const freshRate = await this.fetchFreshRate(fromCurrency, toCurrency, preferredSource);
      
      // Cache the fresh rate
      globalCacheManager.set(cacheKey, freshRate, this.CACHE_TTL_HOURS * 3600);
      globalCacheManager.set(fallbackCacheKey, freshRate, this.FALLBACK_CACHE_TTL_DAYS * 24 * 3600);
      
      return { ...freshRate, cacheHit: false };
    } catch (error) {
      // If fresh fetch failed and fallback is allowed, try fallback cache
      if (fallbackToCache) {
        const fallbackRate = globalCacheManager.get<ExchangeRateData>(fallbackCacheKey);
        if (fallbackRate) {
          console.warn(`Using fallback exchange rate for ${fromCurrency}->${toCurrency}:`, error);
          return { ...fallbackRate, cacheHit: true, confidence: fallbackRate.confidence * 0.8 };
        }
      }

      throw new Error(`Failed to get exchange rate for ${fromCurrency} to ${toCurrency}: ${error}`);
    }
  }

  /**
   * Bulk convert multiple amounts
   */
  async convertMultiple(
    conversions: ConversionRequest[]
  ): Promise<CalculationResult<ConversionResponse[]>> {
    return this.executeCalculation('convertMultiple', { count: conversions.length }, async (context) => {
      const results: ConversionResponse[] = [];

      for (const request of conversions) {
        try {
          const conversionResult = await this.convertCurrency(request);
          results.push(conversionResult.value);
        } catch (error) {
          // For bulk operations, we might want to continue with other conversions
          // and mark failed ones with zero values or skip them
          console.error(`Failed to convert ${request.amount.currencyCode} to ${request.toCurrency}:`, error);
          
          // Add a failed conversion result
          results.push({
            originalAmount: request.amount,
            convertedAmount: this.createMoney(0, request.toCurrency),
            exchangeRate: 0,
            source: ExchangeRateSource.MANUAL,
            timestamp: new Date(),
            confidence: 0,
            cacheHit: false
          });
        }
      }

      return results;
    });
  }

  /**
   * Get supported currencies from all providers
   */
  async getSupportedCurrencies(): Promise<CalculationResult<string[]>> {
    return this.executeCalculation('getSupportedCurrencies', {}, async (context) => {
      const allCurrencies = new Set<string>();

      for (const provider of this.providers) {
        try {
          if (await provider.isAvailable()) {
            const currencies = await provider.getSupportedCurrencies();
            currencies.forEach(currency => allCurrencies.add(currency));
          }
        } catch (error) {
          console.warn(`Failed to get currencies from ${provider.name}:`, error);
        }
      }

      return Array.from(allCurrencies).sort();
    });
  }

  /**
   * Validate if exchange rate is still within acceptable age
   */
  private isRateStillValid(rate: ExchangeRateData, maxAgeHours: number): boolean {
    const ageHours = (Date.now() - rate.timestamp.getTime()) / (1000 * 60 * 60);
    return ageHours <= maxAgeHours;
  }

  /**
   * Fetch fresh exchange rate from providers
   */
  private async fetchFreshRate(
    fromCurrency: string,
    toCurrency: string,
    preferredSource?: ExchangeRateSource
  ): Promise<ExchangeRateData> {
    // Filter providers by preferred source if specified
    let providersToTry = this.providers;
    if (preferredSource) {
      const preferredProvider = this.providers.find(p => 
        p.name.toLowerCase().includes(preferredSource.toLowerCase())
      );
      if (preferredProvider) {
        providersToTry = [preferredProvider, ...this.providers.filter(p => p !== preferredProvider)];
      }
    }

    let lastError: Error | undefined;

    for (const provider of providersToTry) {
      try {
        if (await provider.isAvailable()) {
          return await provider.getRate(fromCurrency, toCurrency);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Provider ${provider.name} failed for ${fromCurrency}->${toCurrency}:`, error);
      }
    }

    throw lastError || new Error('No exchange rate providers available');
  }

  /**
   * Add external exchange rate provider
   */
  addProvider(provider: ExchangeRateProvider): void {
    this.providers.push(provider);
  }

  /**
   * Remove exchange rate provider
   */
  removeProvider(providerName: string): boolean {
    const index = this.providers.findIndex(p => p.name === providerName);
    if (index >= 0) {
      this.providers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear exchange rate cache
   */
  clearCache(): void {
    globalCacheManager.deleteByTag('exchange_rate');
    globalCacheManager.deleteByTag('exchange_rate_fallback');
  }

  /**
   * Get cache statistics for exchange rates
   */
  getCacheStats() {
    return globalCacheManager.getStats();
  }

  /**
   * Preload common currency pairs
   */
  async preloadCommonRates(baseCurrencies: string[] = ['USD', 'EUR', 'THB']): Promise<{
    loaded: number;
    failed: number;
  }> {
    const supportedCurrencies = await this.getSupportedCurrencies();
    const commonPairs: Array<{ from: string; to: string }> = [];

    // Generate all combinations
    for (const base of baseCurrencies) {
      for (const target of supportedCurrencies.value) {
        if (base !== target) {
          commonPairs.push({ from: base, to: target });
        }
      }
    }

    let loaded = 0;
    let failed = 0;

    // Preload in batches to avoid overwhelming providers
    const batchSize = 10;
    for (let i = 0; i < commonPairs.length; i += batchSize) {
      const batch = commonPairs.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async ({ from, to }) => {
          try {
            await this.getExchangeRate(from, to, undefined, false, 0.5); // 30 minute max age for preload
            loaded++;
          } catch (error) {
            failed++;
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < commonPairs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { loaded, failed };
  }
}

// Global instance
export const exchangeRateConverter = new ExchangeRateConverter();