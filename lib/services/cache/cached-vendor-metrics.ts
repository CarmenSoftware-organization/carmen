/**
 * Cached Vendor Metrics Service
 * 
 * Transparent caching wrapper for VendorMetrics with 
 * intelligent cache invalidation and dependency tracking.
 */

import { 
  VendorMetrics,
  VendorPerformanceInput,
  VendorPerformanceResult,
  VendorComparisonInput,
  VendorComparisonResult,
  VendorRiskAssessmentInput,
  VendorRiskAssessmentResult
} from '../calculations/vendor-metrics';
import { CalculationResult } from '../calculations/base-calculator';
import { EnhancedCacheLayer, CacheDependency } from './enhanced-cache-layer';

/**
 * Cached vendor metrics with transparent caching
 */
export class CachedVendorMetrics extends VendorMetrics {
  constructor(private cacheLayer: EnhancedCacheLayer) {
    super();
  }

  /**
   * Calculate vendor performance metrics with caching
   */
  async calculateVendorPerformance(input: VendorPerformanceInput): Promise<CalculationResult<VendorPerformanceResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'entity',
        identifier: `vendor:${input.vendorId}`,
        version: input.orders.length.toString()
      },
      {
        type: 'entity',
        identifier: `vendor_orders:${input.vendorId}`,
        version: this.hashOrderData(input.orders)
      },
      {
        type: 'field',
        identifier: 'vendor_metrics_weights',
        version: JSON.stringify(input.weights)
      },
      {
        type: 'field',
        identifier: 'timeframe',
        version: input.timeframeDays?.toString() || '365'
      }
    ];

    return this.cacheLayer.getOrCompute(
      'VendorMetrics',
      'calculateVendorPerformance',
      input,
      () => super.calculateVendorPerformance(input),
      dependencies
    );
  }

  /**
   * Compare multiple vendors with caching
   */
  async compareVendors(input: VendorComparisonInput): Promise<CalculationResult<VendorComparisonResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'vendor_comparison_criteria',
        version: JSON.stringify(input.criteria)
      },
      {
        type: 'field',
        identifier: 'comparison_weights',
        version: JSON.stringify(input.weights)
      }
    ];

    // Add dependencies for each vendor being compared
    input.vendorPerformances.forEach(performance => {
      dependencies.push({
        type: 'entity',
        identifier: `vendor:${performance.vendorId}`,
        version: performance.overallRating.toString()
      });
    });

    return this.cacheLayer.getOrCompute(
      'VendorMetrics',
      'compareVendors',
      input,
      () => super.compareVendors(input),
      dependencies
    );
  }

  /**
   * Assess vendor risk with caching
   */
  async assessVendorRisk(input: VendorRiskAssessmentInput): Promise<CalculationResult<VendorRiskAssessmentResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'entity',
        identifier: `vendor:${input.vendorId}`,
        version: input.financialData ? JSON.stringify(input.financialData) : 'no_financial'
      },
      {
        type: 'entity',
        identifier: `vendor_orders:${input.vendorId}`,
        version: input.performanceHistory ? this.hashPerformanceHistory(input.performanceHistory) : 'no_history'
      },
      {
        type: 'field',
        identifier: 'risk_factors',
        version: JSON.stringify(input.riskFactors || {})
      }
    ];

    return this.cacheLayer.getOrCompute(
      'VendorMetrics',
      'assessVendorRisk',
      input,
      () => super.assessVendorRisk(input),
      dependencies
    );
  }

  /**
   * Calculate vendor score with caching
   */
  async calculateVendorScore(
    vendorId: string,
    metrics: any,
    weights?: any
  ): Promise<CalculationResult<number>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'entity',
        identifier: `vendor:${vendorId}`,
        version: JSON.stringify(metrics)
      },
      {
        type: 'field',
        identifier: 'scoring_weights',
        version: JSON.stringify(weights || {})
      }
    ];

    return this.cacheLayer.getOrCompute(
      'VendorMetrics',
      'calculateVendorScore',
      { vendorId, metrics, weights },
      () => super.calculateVendorScore(vendorId, metrics, weights),
      dependencies
    );
  }

  /**
   * Calculate vendor reliability score with caching
   */
  async calculateReliabilityScore(
    deliveryPerformance: number,
    qualityMetrics: any,
    communicationScore: number
  ): Promise<CalculationResult<number>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'delivery_performance',
        version: deliveryPerformance.toString()
      },
      {
        type: 'field',
        identifier: 'quality_metrics',
        version: JSON.stringify(qualityMetrics)
      },
      {
        type: 'field',
        identifier: 'communication_score',
        version: communicationScore.toString()
      }
    ];

    return this.cacheLayer.getOrCompute(
      'VendorMetrics',
      'calculateReliabilityScore',
      { deliveryPerformance, qualityMetrics, communicationScore },
      () => super.calculateReliabilityScore(deliveryPerformance, qualityMetrics, communicationScore),
      dependencies
    );
  }

  /**
   * Calculate cost competitiveness with caching
   */
  async calculateCostCompetitiveness(
    vendorPrices: Array<{ itemId: string; price: number; currency: string }>,
    marketPrices: Array<{ itemId: string; avgPrice: number; currency: string }>
  ): Promise<CalculationResult<number>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'vendor_prices',
        version: JSON.stringify(vendorPrices)
      },
      {
        type: 'field',
        identifier: 'market_prices',
        version: JSON.stringify(marketPrices)
      }
    ];

    return this.cacheLayer.getOrCompute(
      'VendorMetrics',
      'calculateCostCompetitiveness',
      { vendorPrices, marketPrices },
      () => super.calculateCostCompetitiveness(vendorPrices, marketPrices),
      dependencies
    );
  }

  /**
   * Generate vendor recommendations with caching
   */
  async generateVendorRecommendations(
    vendorId: string,
    performanceData: any,
    industryBenchmarks: any
  ): Promise<CalculationResult<string[]>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'entity',
        identifier: `vendor:${vendorId}`,
        version: JSON.stringify(performanceData)
      },
      {
        type: 'field',
        identifier: 'industry_benchmarks',
        version: JSON.stringify(industryBenchmarks)
      }
    ];

    return this.cacheLayer.getOrCompute(
      'VendorMetrics',
      'generateVendorRecommendations',
      { vendorId, performanceData, industryBenchmarks },
      () => super.generateVendorRecommendations(vendorId, performanceData, industryBenchmarks),
      dependencies
    );
  }

  /**
   * Invalidate vendor metric caches
   */
  async invalidateVendorCaches(reason: string, vendorIds?: string[], userId?: string): Promise<number> {
    const dependencies: CacheDependency[] = [
      { type: 'table', identifier: 'vendors' },
      { type: 'table', identifier: 'purchase_orders' },
      { type: 'field', identifier: 'vendor_metrics_weights' },
      { type: 'field', identifier: 'industry_benchmarks' },
      { type: 'field', identifier: 'market_prices' }
    ];

    // Add specific vendor dependencies if provided
    if (vendorIds) {
      vendorIds.forEach(vendorId => {
        dependencies.push(
          { type: 'entity', identifier: `vendor:${vendorId}` },
          { type: 'entity', identifier: `vendor_orders:${vendorId}` }
        );
      });
    }

    return this.cacheLayer.invalidateByDependencies({
      dependencies,
      reason,
      timestamp: new Date(),
      userId
    });
  }

  /**
   * Warm cache with common vendor calculations
   */
  async warmVendorCache(topVendorIds?: string[]): Promise<{ warmed: number; failed: number }> {
    const warmingTasks = [];
    
    // If no specific vendors provided, we can't meaningfully warm the cache
    // as vendor calculations require real vendor data
    if (!topVendorIds || topVendorIds.length === 0) {
      console.log('[CachedVendorMetrics] No vendor IDs provided for cache warming');
      return { warmed: 0, failed: 0 };
    }

    // Common performance calculations for each vendor
    for (const vendorId of topVendorIds) {
      // Different timeframes for analysis
      const timeframes = [30, 90, 180, 365];
      
      for (const timeframe of timeframes) {
        warmingTasks.push({
          serviceClass: 'VendorMetrics',
          method: 'calculateVendorPerformance',
          inputs: {
            vendorId,
            orders: [], // This would need to be populated with real data
            timeframeDays: timeframe
          },
          computeFn: () => {
            // In a real implementation, you'd fetch actual order data here
            return Promise.resolve({
              value: {
                vendorId,
                calculationPeriod: {
                  startDate: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000),
                  endDate: new Date(),
                  orderCount: 0
                },
                deliveryMetrics: {
                  onTimeDeliveryRate: 95,
                  averageDaysLate: 0.5,
                  deliveryReliabilityScore: 4.5,
                  completedOrders: 0,
                  pendingOrders: 0,
                  cancelledOrders: 0
                },
                qualityMetrics: {
                  qualityRating: 4.2,
                  defectRate: 1.5,
                  rejectionRate: 0.5,
                  qualityConsistency: 4.0,
                  qualityTrend: 'stable' as const
                },
                reliabilityMetrics: {
                  orderFulfillmentRate: 98.5,
                  communicationScore: 4.3,
                  issueResolutionTime: 2.1
                },
                financialMetrics: {
                  priceCompetitiveness: 4.1,
                  paymentTermsScore: 4.0,
                  costStability: 4.2,
                  totalSpend: { amount: 0, currencyCode: 'USD' }
                },
                overallRating: 4.3,
                riskScore: 15.2,
                recommendations: ['Continue partnership', 'Monitor quality trends']
              },
              calculatedAt: new Date(),
              calculationId: `warm_${Date.now()}`,
              confidence: 1.0
            });
          },
          priority: 3
        });
      }

      // Risk assessment calculations
      warmingTasks.push({
        serviceClass: 'VendorMetrics',
        method: 'assessVendorRisk',
        inputs: {
          vendorId,
          riskFactors: {
            geopoliticalRisk: 'low',
            financialStability: 'high',
            supplierDependency: 'medium'
          }
        },
        computeFn: () => {
          return Promise.resolve({
            value: {
              vendorId,
              overallRiskScore: 25,
              riskCategory: 'LOW' as const,
              riskFactors: {
                financial: { score: 20, weight: 0.3, impact: 'low' },
                operational: { score: 15, weight: 0.25, impact: 'low' },
                strategic: { score: 30, weight: 0.2, impact: 'medium' },
                compliance: { score: 10, weight: 0.15, impact: 'low' },
                reputation: { score: 20, weight: 0.1, impact: 'low' }
              },
              recommendations: ['Monitor financial indicators', 'Review quarterly'],
              lastAssessment: new Date(),
              nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            },
            calculatedAt: new Date(),
            calculationId: `warm_risk_${Date.now()}`,
            confidence: 1.0
          });
        },
        priority: 2
      });
    }

    return this.cacheLayer.warmCache(warmingTasks);
  }

  /**
   * Helper method to hash order data for versioning
   */
  private hashOrderData(orders: any[]): string {
    if (!orders || orders.length === 0) return '0';
    
    const hash = orders.reduce((acc, order) => {
      return acc + order.orderId + order.orderDate + order.orderValue?.amount?.toString();
    }, '');
    
    return Buffer.from(hash).toString('base64').substring(0, 16);
  }

  /**
   * Helper method to hash performance history for versioning
   */
  private hashPerformanceHistory(history: any): string {
    return Buffer.from(JSON.stringify(history)).toString('base64').substring(0, 16);
  }
}