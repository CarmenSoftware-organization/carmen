import currencyExchangeRates from '@/lib/mock/price-management/currency-exchange-rates.json';
import multiCurrencyPrices from '@/lib/mock/price-management/multi-currency-prices.json';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isBaseCurrency: boolean;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
  source: string;
  createdAt: string;
}

export interface ExchangeRateHistory {
  date: string;
  rate: number;
  source: string;
}

export interface CurrencyConversion {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  exchangeRate: number;
  conversionDate: string;
  source: string;
}

export interface NormalizedPrice {
  originalPrice: number;
  originalCurrency: string;
  convertedPrice: number;
  targetCurrency: string;
  exchangeRate: number;
  conversionDate: string;
}

export class CurrencyManagementService {
  private static instance: CurrencyManagementService;
  private baseCurrency = 'USD';

  public static getInstance(): CurrencyManagementService {
    if (!CurrencyManagementService.instance) {
      CurrencyManagementService.instance = new CurrencyManagementService();
    }
    return CurrencyManagementService.instance;
  }

  /**
   * Get all supported currencies
   */
  async getSupportedCurrencies(): Promise<Currency[]> {
    return currencyExchangeRates.supportedCurrencies;
  }

  /**
   * Get current exchange rates
   */
  async getCurrentExchangeRates(): Promise<ExchangeRate[]> {
    return currencyExchangeRates.currentRates;
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
    // If same currency, return rate of 1
    if (fromCurrency === toCurrency) {
      return {
        id: `${fromCurrency}-${toCurrency}-same`,
        fromCurrency,
        toCurrency,
        rate: 1.0,
        rateDate: new Date().toISOString().split('T')[0],
        source: 'system',
        createdAt: new Date().toISOString()
      };
    }

    // Look for direct rate
    const directRate = currencyExchangeRates.currentRates.find(
      rate => rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
    );

    if (directRate) {
      return directRate;
    }

    // Look for inverse rate
    const inverseRate = currencyExchangeRates.currentRates.find(
      rate => rate.fromCurrency === toCurrency && rate.toCurrency === fromCurrency
    );

    if (inverseRate) {
      return {
        id: `${fromCurrency}-${toCurrency}-inverse`,
        fromCurrency,
        toCurrency,
        rate: 1 / inverseRate.rate,
        rateDate: inverseRate.rateDate,
        source: inverseRate.source,
        createdAt: inverseRate.createdAt
      };
    }

    // Try cross-currency conversion through USD
    if (fromCurrency !== this.baseCurrency && toCurrency !== this.baseCurrency) {
      const fromToUsd = await this.getExchangeRate(fromCurrency, this.baseCurrency);
      const usdToTarget = await this.getExchangeRate(this.baseCurrency, toCurrency);

      if (fromToUsd && usdToTarget) {
        return {
          id: `${fromCurrency}-${toCurrency}-cross`,
          fromCurrency,
          toCurrency,
          rate: fromToUsd.rate * usdToTarget.rate,
          rateDate: new Date().toISOString().split('T')[0],
          source: 'calculated',
          createdAt: new Date().toISOString()
        };
      }
    }

    return null;
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion | null> {
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
    
    if (!exchangeRate) {
      return null;
    }

    const convertedAmount = amount * exchangeRate.rate;

    return {
      fromAmount: amount,
      fromCurrency,
      toAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      toCurrency,
      exchangeRate: exchangeRate.rate,
      conversionDate: new Date().toISOString(),
      source: exchangeRate.source
    };
  }

  /**
   * Get normalized price in base currency (USD)
   */
  async getNormalizedPrice(
    price: number,
    currency: string,
    targetCurrency: string = this.baseCurrency
  ): Promise<NormalizedPrice | null> {
    const conversion = await this.convertCurrency(price, currency, targetCurrency);
    
    if (!conversion) {
      return null;
    }

    return {
      originalPrice: price,
      originalCurrency: currency,
      convertedPrice: conversion.toAmount,
      targetCurrency,
      exchangeRate: conversion.exchangeRate,
      conversionDate: conversion.conversionDate
    };
  }

  /**
   * Get historical exchange rates for a currency pair
   */
  async getExchangeRateHistory(
    fromCurrency: string,
    toCurrency: string,
    days: number = 30
  ): Promise<ExchangeRateHistory[]> {
    const currencyPair = `${fromCurrency}/${toCurrency}`;
    const historicalData = currencyExchangeRates.historicalRates.find(
      data => data.currencyPair === currencyPair
    );

    if (historicalData) {
      // Return last 'days' entries
      return historicalData.history.slice(-days);
    }

    // Try inverse pair
    const inversePair = `${toCurrency}/${fromCurrency}`;
    const inverseData = currencyExchangeRates.historicalRates.find(
      data => data.currencyPair === inversePair
    );

    if (inverseData) {
      return inverseData.history.slice(-days).map(entry => ({
        date: entry.date,
        rate: 1 / entry.rate,
        source: entry.source
      }));
    }

    return [];
  }

  /**
   * Get currency by code
   */
  async getCurrency(code: string): Promise<Currency | null> {
    const currencies = await this.getSupportedCurrencies();
    return currencies.find(currency => currency.code === code) || null;
  }

  /**
   * Format currency amount with proper symbol and decimal places
   */
  async formatCurrencyAmount(amount: number, currencyCode: string): Promise<string> {
    const currency = await this.getCurrency(currencyCode);
    
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }

    const formattedAmount = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol}${formattedAmount}`;
  }

  /**
   * Update exchange rates (mock implementation)
   */
  async updateExchangeRates(): Promise<{ updated: number; errors: string[] }> {
    // Mock implementation - in real system this would fetch from external API
    const mockUpdateResult = {
      updated: currencyExchangeRates.currentRates.length,
      errors: []
    };

    // Simulate some rate changes
    const updatedRates = currencyExchangeRates.currentRates.map(rate => ({
      ...rate,
      rate: rate.rate * (0.98 + Math.random() * 0.04), // ±2% variation
      rateDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }));

    // In a real implementation, this would update the database
    console.log('Mock exchange rates updated:', updatedRates.length);

    return mockUpdateResult;
  }

  /**
   * Get multi-currency price comparisons for a product
   */
  async getMultiCurrencyPriceComparisons(productId: string): Promise<any[]> {
    const comparison = multiCurrencyPrices.priceComparisons.find(
      comp => comp.productId === productId
    );

    return comparison ? comparison.prices : [];
  }

  /**
   * Calculate price variance across currencies
   */
  async calculatePriceVariance(prices: any[]): Promise<{
    lowest: any;
    highest: any;
    variance: number;
    averagePrice: number;
  }> {
    if (prices.length === 0) {
      throw new Error('No prices provided for variance calculation');
    }

    const normalizedPrices = prices.map(p => p.normalizedPrice);
    const lowest = prices.find(p => p.normalizedPrice === Math.min(...normalizedPrices));
    const highest = prices.find(p => p.normalizedPrice === Math.max(...normalizedPrices));
    const averagePrice = normalizedPrices.reduce((sum, price) => sum + price, 0) / normalizedPrices.length;
    const variance = ((highest.normalizedPrice - lowest.normalizedPrice) / lowest.normalizedPrice) * 100;

    return {
      lowest,
      highest,
      variance: Math.round(variance * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100
    };
  }
}

export default CurrencyManagementService;