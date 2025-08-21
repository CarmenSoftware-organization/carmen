import { CurrencyManagementService, NormalizedPrice } from './currency-management-service';
import { CurrencyConversionService } from './currency-conversion-service';

export interface PriceItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  currency: string;
  minQuantity: number;
  bulkPrice?: number;
  bulkMinQuantity?: number;
  validFrom: string;
  validTo: string;
  vendorId: string;
  vendorName: string;
}

export interface NormalizedPriceItem extends PriceItem {
  normalizedPrice: NormalizedPrice;
  bulkNormalizedPrice?: NormalizedPrice;
  pricePerUnit: number; // Considering minimum quantity
  competitiveRanking: number; // 1 = most competitive
  priceVariance: number; // Percentage difference from market average
}

export interface PriceComparison {
  productId: string;
  productName: string;
  baseCurrency: string;
  prices: NormalizedPriceItem[];
  marketAnalysis: {
    lowestPrice: NormalizedPriceItem;
    highestPrice: NormalizedPriceItem;
    averagePrice: number;
    medianPrice: number;
    priceSpread: number; // Percentage difference between highest and lowest
    recommendedVendor: NormalizedPriceItem;
  };
  lastUpdated: string;
}

export interface PriceNormalizationOptions {
  baseCurrency: string;
  includeExpiredPrices: boolean;
  considerMinimumQuantity: boolean;
  weightBulkPricing: boolean;
  priceValidityDays: number;
}

export class PriceNormalizationService {
  private static instance: PriceNormalizationService;
  private currencyService: CurrencyManagementService;
  private conversionService: CurrencyConversionService;
  private defaultOptions: PriceNormalizationOptions = {
    baseCurrency: 'USD',
    includeExpiredPrices: false,
    considerMinimumQuantity: true,
    weightBulkPricing: true,
    priceValidityDays: 90
  };

  private constructor() {
    this.currencyService = CurrencyManagementService.getInstance();
    this.conversionService = CurrencyConversionService.getInstance();
  }

  public static getInstance(): PriceNormalizationService {
    if (!PriceNormalizationService.instance) {
      PriceNormalizationService.instance = new PriceNormalizationService();
    }
    return PriceNormalizationService.instance;
  }

  /**
   * Normalize a single price item to base currency
   */
  async normalizePriceItem(
    priceItem: PriceItem,
    options: Partial<PriceNormalizationOptions> = {}
  ): Promise<NormalizedPriceItem | null> {
    const opts = { ...this.defaultOptions, ...options };

    // Check if price is valid
    if (!this.isPriceValid(priceItem, opts)) {
      return null;
    }

    try {
      // Normalize unit price
      const normalizedPrice = await this.currencyService.getNormalizedPrice(
        priceItem.unitPrice,
        priceItem.currency,
        opts.baseCurrency
      );

      if (!normalizedPrice) {
        return null;
      }

      // Normalize bulk price if available
      let bulkNormalizedPrice: NormalizedPrice | undefined;
      if (priceItem.bulkPrice && priceItem.bulkPrice > 0) {
        bulkNormalizedPrice = await this.currencyService.getNormalizedPrice(
          priceItem.bulkPrice,
          priceItem.currency,
          opts.baseCurrency
        ) || undefined;
      }

      // Calculate effective price per unit considering minimum quantity
      let pricePerUnit = normalizedPrice.convertedPrice;
      if (opts.considerMinimumQuantity && priceItem.minQuantity > 1) {
        // Factor in minimum quantity requirements
        pricePerUnit = normalizedPrice.convertedPrice * priceItem.minQuantity;
      }

      const normalizedItem: NormalizedPriceItem = {
        ...priceItem,
        normalizedPrice,
        bulkNormalizedPrice,
        pricePerUnit,
        competitiveRanking: 0, // Will be set during comparison
        priceVariance: 0 // Will be set during comparison
      };

      return normalizedItem;
    } catch (error) {
      console.error('Failed to normalize price item:', error);
      return null;
    }
  }

  /**
   * Normalize multiple price items and create comparison
   */
  async createPriceComparison(
    priceItems: PriceItem[],
    options: Partial<PriceNormalizationOptions> = {}
  ): Promise<PriceComparison[]> {
    const opts = { ...this.defaultOptions, ...options };
    const comparisons: PriceComparison[] = [];

    // Group items by product
    const productGroups = this.groupByProduct(priceItems);

    for (const [productId, items] of productGroups.entries()) {
      const normalizedItems: NormalizedPriceItem[] = [];

      // Normalize each price item
      for (const item of items) {
        const normalized = await this.normalizePriceItem(item, opts);
        if (normalized) {
          normalizedItems.push(normalized);
        }
      }

      if (normalizedItems.length === 0) {
        continue;
      }

      // Calculate competitive rankings and price variance
      const rankedItems = this.calculateCompetitiveRankings(normalizedItems, opts);
      
      // Create market analysis
      const marketAnalysis = this.createMarketAnalysis(rankedItems, opts);

      const comparison: PriceComparison = {
        productId,
        productName: items[0].productName,
        baseCurrency: opts.baseCurrency,
        prices: rankedItems,
        marketAnalysis,
        lastUpdated: new Date().toISOString()
      };

      comparisons.push(comparison);
    }

    return comparisons;
  }

  /**
   * Calculate competitive rankings for normalized items
   */
  private calculateCompetitiveRankings(
    items: NormalizedPriceItem[],
    options: PriceNormalizationOptions
  ): NormalizedPriceItem[] {
    // Sort by effective price (considering bulk pricing if enabled)
    const sortedItems = [...items].sort((a, b) => {
      const priceA = this.getEffectivePrice(a, options);
      const priceB = this.getEffectivePrice(b, options);
      return priceA - priceB;
    });

    // Calculate average price for variance calculation
    const prices = sortedItems.map(item => this.getEffectivePrice(item, options));
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Assign rankings and calculate variance
    return sortedItems.map((item, index) => {
      const effectivePrice = this.getEffectivePrice(item, options);
      const priceVariance = ((effectivePrice - averagePrice) / averagePrice) * 100;

      return {
        ...item,
        competitiveRanking: index + 1,
        priceVariance: Math.round(priceVariance * 100) / 100
      };
    });
  }

  /**
   * Get effective price considering bulk pricing options
   */
  private getEffectivePrice(item: NormalizedPriceItem, options: PriceNormalizationOptions): number {
    if (options.weightBulkPricing && item.bulkNormalizedPrice && item.bulkMinQuantity) {
      // Use bulk price if it's better value
      const bulkPrice = item.bulkNormalizedPrice.convertedPrice;
      const unitPrice = item.normalizedPrice.convertedPrice;
      
      // Consider bulk pricing if it offers significant savings (>5%)
      if ((unitPrice - bulkPrice) / unitPrice > 0.05) {
        return bulkPrice;
      }
    }

    return options.considerMinimumQuantity ? item.pricePerUnit : item.normalizedPrice.convertedPrice;
  }

  /**
   * Create market analysis for a product
   */
  private createMarketAnalysis(
    items: NormalizedPriceItem[],
    options: PriceNormalizationOptions
  ): PriceComparison['marketAnalysis'] {
    const prices = items.map(item => this.getEffectivePrice(item, options));
    
    const lowestPrice = items[0]; // Already sorted
    const highestPrice = items[items.length - 1];
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Calculate median
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

    const priceSpread = ((this.getEffectivePrice(highestPrice, options) - this.getEffectivePrice(lowestPrice, options)) / this.getEffectivePrice(lowestPrice, options)) * 100;

    // Recommend vendor based on best overall value (price + other factors)
    const recommendedVendor = this.selectRecommendedVendor(items, options);

    return {
      lowestPrice,
      highestPrice,
      averagePrice: Math.round(averagePrice * 100) / 100,
      medianPrice: Math.round(medianPrice * 100) / 100,
      priceSpread: Math.round(priceSpread * 100) / 100,
      recommendedVendor
    };
  }

  /**
   * Select recommended vendor based on multiple criteria
   */
  private selectRecommendedVendor(
    items: NormalizedPriceItem[],
    options: PriceNormalizationOptions
  ): NormalizedPriceItem {
    // For now, recommend the lowest price vendor
    // In a real system, this would consider additional factors like:
    // - Vendor reliability score
    // - Delivery time
    // - Quality ratings
    // - Payment terms
    // - Historical performance
    
    return items[0]; // Already sorted by price
  }

  /**
   * Group price items by product ID
   */
  private groupByProduct(items: PriceItem[]): Map<string, PriceItem[]> {
    const groups = new Map<string, PriceItem[]>();
    
    items.forEach(item => {
      const existing = groups.get(item.productId) || [];
      existing.push(item);
      groups.set(item.productId, existing);
    });

    return groups;
  }

  /**
   * Check if a price item is valid based on options
   */
  private isPriceValid(item: PriceItem, options: PriceNormalizationOptions): boolean {
    const now = new Date();
    const validTo = new Date(item.validTo);
    const validFrom = new Date(item.validFrom);

    // Check if price is expired
    if (!options.includeExpiredPrices && validTo < now) {
      return false;
    }

    // Check if price is not yet valid
    if (validFrom > now) {
      return false;
    }

    // Check if price is too old
    const daysSinceValid = (now.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceValid > options.priceValidityDays) {
      return false;
    }

    // Check if price is reasonable (not zero or negative)
    if (item.unitPrice <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Get price trends for a product over time
   */
  async getPriceTrends(
    productId: string,
    currency: string = 'USD',
    days: number = 30
  ): Promise<{
    productId: string;
    currency: string;
    trends: {
      date: string;
      averagePrice: number;
      lowestPrice: number;
      highestPrice: number;
      vendorCount: number;
    }[];
    analysis: {
      overallTrend: 'increasing' | 'decreasing' | 'stable';
      volatility: 'low' | 'medium' | 'high';
      priceChange: number; // Percentage change over period
    };
  }> {
    // Mock implementation - in real system this would query historical data
    const mockTrends = [];
    const basePrice = 25.50;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const averagePrice = basePrice * (1 + variation);
      
      mockTrends.push({
        date: date.toISOString().split('T')[0],
        averagePrice: Math.round(averagePrice * 100) / 100,
        lowestPrice: Math.round((averagePrice * 0.95) * 100) / 100,
        highestPrice: Math.round((averagePrice * 1.05) * 100) / 100,
        vendorCount: 3 + Math.floor(Math.random() * 3)
      });
    }

    const firstPrice = mockTrends[0].averagePrice;
    const lastPrice = mockTrends[mockTrends.length - 1].averagePrice;
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      productId,
      currency,
      trends: mockTrends,
      analysis: {
        overallTrend: priceChange > 2 ? 'increasing' : priceChange < -2 ? 'decreasing' : 'stable',
        volatility: Math.abs(priceChange) > 5 ? 'high' : Math.abs(priceChange) > 2 ? 'medium' : 'low',
        priceChange: Math.round(priceChange * 100) / 100
      }
    };
  }

  /**
   * Calculate cost savings from price normalization
   */
  calculateCostSavings(
    originalPrices: PriceItem[],
    optimizedSelections: { productId: string; selectedVendorId: string; quantity: number }[]
  ): {
    totalOriginalCost: number;
    totalOptimizedCost: number;
    totalSavings: number;
    savingsPercentage: number;
    itemBreakdown: {
      productId: string;
      productName: string;
      originalCost: number;
      optimizedCost: number;
      savings: number;
      selectedVendor: string;
    }[];
  } {
    // Mock implementation for cost savings calculation
    const itemBreakdown = optimizedSelections.map(selection => {
      const originalPrice = originalPrices.find(p => p.productId === selection.productId);
      const originalCost = originalPrice ? originalPrice.unitPrice * selection.quantity : 0;
      const optimizedCost = originalCost * 0.85; // Assume 15% savings on average
      
      return {
        productId: selection.productId,
        productName: originalPrice?.productName || 'Unknown Product',
        originalCost: Math.round(originalCost * 100) / 100,
        optimizedCost: Math.round(optimizedCost * 100) / 100,
        savings: Math.round((originalCost - optimizedCost) * 100) / 100,
        selectedVendor: selection.selectedVendorId
      };
    });

    const totalOriginalCost = itemBreakdown.reduce((sum, item) => sum + item.originalCost, 0);
    const totalOptimizedCost = itemBreakdown.reduce((sum, item) => sum + item.optimizedCost, 0);
    const totalSavings = totalOriginalCost - totalOptimizedCost;
    const savingsPercentage = totalOriginalCost > 0 ? (totalSavings / totalOriginalCost) * 100 : 0;

    return {
      totalOriginalCost: Math.round(totalOriginalCost * 100) / 100,
      totalOptimizedCost: Math.round(totalOptimizedCost * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
      itemBreakdown
    };
  }
}

export default PriceNormalizationService;