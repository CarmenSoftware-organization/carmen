import { CurrencyManagementService, ExchangeRate, CurrencyConversion } from './currency-management-service';

export interface ConversionResult {
  success: boolean;
  conversion?: CurrencyConversion;
  error?: string;
}

export interface BatchConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  identifier?: string;
}

export interface BatchConversionResult {
  identifier?: string;
  success: boolean;
  conversion?: CurrencyConversion;
  error?: string;
}

export interface RateChangeAlert {
  currencyPair: string;
  previousRate: number;
  currentRate: number;
  changePercentage: number;
  threshold: number;
  alertType: 'increase' | 'decrease' | 'volatility';
  timestamp: string;
}

export interface ConversionHistory {
  id: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  exchangeRate: number;
  conversionDate: string;
  source: string;
  requestId?: string;
}

export class CurrencyConversionService {
  private static instance: CurrencyConversionService;
  private currencyService: CurrencyManagementService;
  private conversionHistory: ConversionHistory[] = [];
  private rateChangeThresholds: Map<string, number> = new Map();
  private lastKnownRates: Map<string, ExchangeRate> = new Map();

  private constructor() {
    this.currencyService = CurrencyManagementService.getInstance();
    this.initializeRateTracking();
  }

  public static getInstance(): CurrencyConversionService {
    if (!CurrencyConversionService.instance) {
      CurrencyConversionService.instance = new CurrencyConversionService();
    }
    return CurrencyConversionService.instance;
  }

  private async initializeRateTracking() {
    // Initialize with current rates
    const currentRates = await this.currencyService.getCurrentExchangeRates();
    currentRates.forEach(rate => {
      const key = `${rate.fromCurrency}/${rate.toCurrency}`;
      this.lastKnownRates.set(key, rate);
      // Set default threshold of 2% for rate change alerts
      this.rateChangeThresholds.set(key, 2.0);
    });
  }

  /**
   * Convert single amount with automatic rate tracking
   */
  async convertWithTracking(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    requestId?: string
  ): Promise<ConversionResult> {
    try {
      const conversion = await this.currencyService.convertCurrency(
        amount,
        fromCurrency,
        toCurrency
      );

      if (!conversion) {
        return {
          success: false,
          error: `Unable to convert from ${fromCurrency} to ${toCurrency}. Exchange rate not available.`
        };
      }

      // Track the conversion
      const historyEntry: ConversionHistory = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fromAmount: conversion.fromAmount,
        fromCurrency: conversion.fromCurrency,
        toAmount: conversion.toAmount,
        toCurrency: conversion.toCurrency,
        exchangeRate: conversion.exchangeRate,
        conversionDate: conversion.conversionDate,
        source: conversion.source,
        requestId
      };

      this.conversionHistory.push(historyEntry);

      // Check for rate changes
      await this.checkRateChanges(fromCurrency, toCurrency, conversion.exchangeRate);

      return {
        success: true,
        conversion
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      };
    }
  }

  /**
   * Batch convert multiple amounts
   */
  async batchConvert(requests: BatchConversionRequest[]): Promise<BatchConversionResult[]> {
    const results: BatchConversionResult[] = [];

    for (const request of requests) {
      const result = await this.convertWithTracking(
        request.amount,
        request.fromCurrency,
        request.toCurrency,
        request.identifier
      );

      results.push({
        identifier: request.identifier,
        success: result.success,
        conversion: result.conversion,
        error: result.error
      });
    }

    return results;
  }

  /**
   * Check for significant rate changes and generate alerts
   */
  private async checkRateChanges(
    fromCurrency: string,
    toCurrency: string,
    currentRate: number
  ): Promise<RateChangeAlert[]> {
    const alerts: RateChangeAlert[] = [];
    const currencyPair = `${fromCurrency}/${toCurrency}`;
    const lastKnownRate = this.lastKnownRates.get(currencyPair);
    const threshold = this.rateChangeThresholds.get(currencyPair) || 2.0;

    if (lastKnownRate && lastKnownRate.rate !== currentRate) {
      const changePercentage = ((currentRate - lastKnownRate.rate) / lastKnownRate.rate) * 100;
      const absChangePercentage = Math.abs(changePercentage);

      if (absChangePercentage >= threshold) {
        const alert: RateChangeAlert = {
          currencyPair,
          previousRate: lastKnownRate.rate,
          currentRate,
          changePercentage,
          threshold,
          alertType: changePercentage > 0 ? 'increase' : 'decrease',
          timestamp: new Date().toISOString()
        };

        alerts.push(alert);
        console.log(`Rate change alert: ${currencyPair} changed by ${changePercentage.toFixed(2)}%`);
      }

      // Update last known rate
      this.lastKnownRates.set(currencyPair, {
        ...lastKnownRate,
        rate: currentRate,
        rateDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
    }

    return alerts;
  }

  /**
   * Get conversion history for analysis
   */
  getConversionHistory(
    fromCurrency?: string,
    toCurrency?: string,
    limit: number = 100
  ): ConversionHistory[] {
    let filtered = this.conversionHistory;

    if (fromCurrency) {
      filtered = filtered.filter(h => h.fromCurrency === fromCurrency);
    }

    if (toCurrency) {
      filtered = filtered.filter(h => h.toCurrency === toCurrency);
    }

    return filtered
      .sort((a, b) => new Date(b.conversionDate).getTime() - new Date(a.conversionDate).getTime())
      .slice(0, limit);
  }

  /**
   * Set rate change alert threshold for a currency pair
   */
  setRateChangeThreshold(fromCurrency: string, toCurrency: string, threshold: number): void {
    const currencyPair = `${fromCurrency}/${toCurrency}`;
    this.rateChangeThresholds.set(currencyPair, threshold);
  }

  /**
   * Get rate change alerts for the last period
   */
  getRateChangeAlerts(hours: number = 24): RateChangeAlert[] {
    // Mock implementation - in real system this would query stored alerts
    const mockAlerts: RateChangeAlert[] = [
      {
        currencyPair: 'USD/EUR',
        previousRate: 0.852,
        currentRate: 0.85,
        changePercentage: -0.23,
        threshold: 2.0,
        alertType: 'decrease',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        currencyPair: 'USD/GBP',
        previousRate: 0.785,
        currentRate: 0.78,
        changePercentage: -0.64,
        threshold: 2.0,
        alertType: 'decrease',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return mockAlerts.filter(alert => new Date(alert.timestamp) >= cutoffTime);
  }

  /**
   * Calculate conversion statistics
   */
  getConversionStatistics(currencyPair?: string): {
    totalConversions: number;
    totalAmount: number;
    averageAmount: number;
    mostCommonPair: string;
    conversionsByHour: { hour: string; count: number }[];
  } {
    let filtered = this.conversionHistory;

    if (currencyPair) {
      const [from, to] = currencyPair.split('/');
      filtered = filtered.filter(h => h.fromCurrency === from && h.toCurrency === to);
    }

    const totalConversions = filtered.length;
    const totalAmount = filtered.reduce((sum, h) => sum + h.fromAmount, 0);
    const averageAmount = totalConversions > 0 ? totalAmount / totalConversions : 0;

    // Find most common currency pair
    const pairCounts = new Map<string, number>();
    filtered.forEach(h => {
      const pair = `${h.fromCurrency}/${h.toCurrency}`;
      pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
    });

    const mostCommonPair = Array.from(pairCounts.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Group by hour for the last 24 hours
    const conversionsByHour: { hour: string; count: number }[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.toISOString().substr(0, 13) + ':00';
      const count = filtered.filter(h => 
        h.conversionDate.substr(0, 13) === hour.toISOString().substr(0, 13)
      ).length;
      
      conversionsByHour.push({ hour: hourStr, count });
    }

    return {
      totalConversions,
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageAmount: Math.round(averageAmount * 100) / 100,
      mostCommonPair,
      conversionsByHour
    };
  }

  /**
   * Simulate automatic rate updates (mock implementation)
   */
  async simulateRateUpdate(): Promise<{
    updatedPairs: number;
    alerts: RateChangeAlert[];
    timestamp: string;
  }> {
    const alerts: RateChangeAlert[] = [];
    let updatedPairs = 0;

    // Simulate rate changes for tracked pairs
    for (const [currencyPair, lastRate] of this.lastKnownRates.entries()) {
      const [fromCurrency, toCurrency] = currencyPair.split('/');
      
      // Generate small random rate change (±1%)
      const changePercent = (Math.random() - 0.5) * 2; // -1% to +1%
      const newRate = lastRate.rate * (1 + changePercent / 100);
      
      const rateAlerts = await this.checkRateChanges(fromCurrency, toCurrency, newRate);
      alerts.push(...rateAlerts);
      updatedPairs++;
    }

    return {
      updatedPairs,
      alerts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get real-time conversion rate with caching
   */
  async getRealTimeRate(
    fromCurrency: string,
    toCurrency: string,
    useCache: boolean = true
  ): Promise<ExchangeRate | null> {
    const currencyPair = `${fromCurrency}/${toCurrency}`;
    
    if (useCache) {
      const cachedRate = this.lastKnownRates.get(currencyPair);
      if (cachedRate) {
        // Check if rate is recent (within last hour)
        const rateAge = Date.now() - new Date(cachedRate.createdAt).getTime();
        if (rateAge < 60 * 60 * 1000) { // 1 hour
          return cachedRate;
        }
      }
    }

    // Fetch fresh rate
    const rate = await this.currencyService.getExchangeRate(fromCurrency, toCurrency);
    
    if (rate) {
      this.lastKnownRates.set(currencyPair, rate);
    }

    return rate;
  }
}

export default CurrencyConversionService;