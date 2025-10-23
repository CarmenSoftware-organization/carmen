/**
 * Vendor Metrics Calculation Service
 * 
 * Handles vendor performance calculations including delivery performance,
 * quality ratings, price competitiveness, and overall vendor scoring.
 */

import { Money, Vendor, PurchaseOrder } from '@/lib/types'
import { BaseCalculator, CalculationResult } from './base-calculator'

/**
 * Vendor performance input data
 */
export interface VendorPerformanceInput {
  vendorId: string;
  orders: VendorOrderData[];
  timeframeDays?: number;
  weights?: VendorMetricWeights;
}

/**
 * Vendor order data for calculations
 */
export interface VendorOrderData {
  orderId: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  orderValue: Money;
  isDelivered: boolean;
  qualityScore?: number; // 1-5 scale
  defectRate?: number; // percentage
  isOnTime?: boolean;
  daysLate?: number;
  itemsOrdered: number;
  itemsReceived: number;
  itemsAccepted: number;
  itemsRejected: number;
}

/**
 * Vendor metric weights for overall scoring
 */
export interface VendorMetricWeights {
  deliveryPerformance: number; // 0-1
  qualityRating: number; // 0-1
  priceCompetitiveness: number; // 0-1
  reliability: number; // 0-1
  communication: number; // 0-1
}

/**
 * Vendor performance metrics result
 */
export interface VendorPerformanceResult {
  vendorId: string;
  calculationPeriod: {
    startDate: Date;
    endDate: Date;
    orderCount: number;
  };
  deliveryMetrics: VendorDeliveryMetrics;
  qualityMetrics: VendorQualityMetrics;
  reliabilityMetrics: VendorReliabilityMetrics;
  financialMetrics: VendorFinancialMetrics;
  overallRating: number; // 0-5 scale
  riskScore: number; // 0-100 scale (higher = more risk)
  recommendations: string[];
}

/**
 * Vendor delivery performance metrics
 */
export interface VendorDeliveryMetrics {
  onTimeDeliveryRate: number; // percentage
  averageDaysLate: number;
  deliveryReliabilityScore: number; // 0-5 scale
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

/**
 * Vendor quality metrics
 */
export interface VendorQualityMetrics {
  qualityRating: number; // 0-5 scale
  defectRate: number; // percentage
  rejectionRate: number; // percentage
  qualityConsistency: number; // 0-5 scale
  qualityTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Vendor reliability metrics
 */
export interface VendorReliabilityMetrics {
  orderFulfillmentRate: number; // percentage
  communicationScore: number; // 0-5 scale
  issueResolutionTime: number; // average days
  reliabilityTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Vendor financial metrics
 */
export interface VendorFinancialMetrics {
  totalOrderValue: Money;
  averageOrderValue: Money;
  priceCompetitiveness: number; // 0-5 scale
  paymentTermsCompliance: number; // percentage
  costSavingsGenerated: Money;
}

/**
 * Price comparison input
 */
export interface PriceComparisonInput {
  itemId: string;
  vendorPrices: VendorPriceData[];
  marketBenchmarks?: Money[];
}

/**
 * Vendor price data
 */
export interface VendorPriceData {
  vendorId: string;
  price: Money;
  quantity: number;
  validUntil?: Date;
  lastUpdated: Date;
}

/**
 * Price competitiveness result
 */
export interface PriceCompetitivenessResult {
  itemId: string;
  vendorPrices: Array<{
    vendorId: string;
    price: Money;
    competitivenessScore: number; // 0-5 scale
    rank: number;
    percentageFromBest: number;
  }>;
  marketAverage?: Money;
  marketMedian?: Money;
  priceRange: {
    lowest: Money;
    highest: Money;
    spread: number; // percentage
  };
}

export class VendorMetrics extends BaseCalculator {
  protected serviceName = 'VendorMetrics';

  private readonly DEFAULT_WEIGHTS: VendorMetricWeights = {
    deliveryPerformance: 0.3,
    qualityRating: 0.25,
    priceCompetitiveness: 0.2,
    reliability: 0.15,
    communication: 0.1
  };

  /**
   * Calculate comprehensive vendor performance metrics
   */
  async calculateVendorPerformance(input: VendorPerformanceInput): Promise<CalculationResult<VendorPerformanceResult>> {
    return this.executeCalculation('calculateVendorPerformance', input, async (context) => {
      if (!input.vendorId) {
        throw this.createError('Vendor ID is required', 'MISSING_VENDOR_ID', context);
      }

      if (!input.orders || input.orders.length === 0) {
        throw this.createError('Order data is required', 'NO_ORDER_DATA', context);
      }

      const timeframeDays = input.timeframeDays || 365;
      const weights = { ...this.DEFAULT_WEIGHTS, ...input.weights };
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));

      // Filter orders within timeframe
      const ordersInPeriod = input.orders.filter(order => 
        order.orderDate >= startDate && order.orderDate <= endDate
      );

      // Calculate delivery metrics
      const deliveryMetrics = await this.calculateDeliveryMetrics(ordersInPeriod);

      // Calculate quality metrics
      const qualityMetrics = await this.calculateQualityMetrics(ordersInPeriod);

      // Calculate reliability metrics
      const reliabilityMetrics = await this.calculateReliabilityMetrics(ordersInPeriod);

      // Calculate financial metrics
      const financialMetrics = await this.calculateFinancialMetrics(ordersInPeriod);

      // Calculate overall rating
      const overallRating = await this.calculateOverallRating({
        deliveryMetrics: deliveryMetrics.value,
        qualityMetrics: qualityMetrics.value,
        reliabilityMetrics: reliabilityMetrics.value,
        financialMetrics: financialMetrics.value,
        weights
      });

      // Calculate risk score
      const riskScore = await this.calculateRiskScore({
        deliveryMetrics: deliveryMetrics.value,
        qualityMetrics: qualityMetrics.value,
        reliabilityMetrics: reliabilityMetrics.value
      });

      // Generate recommendations
      const recommendations = await this.generateRecommendations({
        deliveryMetrics: deliveryMetrics.value,
        qualityMetrics: qualityMetrics.value,
        reliabilityMetrics: reliabilityMetrics.value,
        financialMetrics: financialMetrics.value,
        overallRating: overallRating.value,
        riskScore: riskScore.value
      });

      return {
        vendorId: input.vendorId,
        calculationPeriod: {
          startDate,
          endDate,
          orderCount: ordersInPeriod.length
        },
        deliveryMetrics: deliveryMetrics.value,
        qualityMetrics: qualityMetrics.value,
        reliabilityMetrics: reliabilityMetrics.value,
        financialMetrics: financialMetrics.value,
        overallRating: overallRating.value,
        riskScore: riskScore.value,
        recommendations: recommendations.value
      };
    });
  }

  /**
   * Calculate delivery performance metrics
   */
  private async calculateDeliveryMetrics(orders: VendorOrderData[]): Promise<CalculationResult<VendorDeliveryMetrics>> {
    return this.executeCalculation('calculateDeliveryMetrics', { orderCount: orders.length }, async (context) => {
      const deliveredOrders = orders.filter(order => order.isDelivered && order.actualDeliveryDate);
      const onTimeOrders = deliveredOrders.filter(order => order.isOnTime === true);
      const lateOrders = deliveredOrders.filter(order => order.daysLate && order.daysLate > 0);

      const onTimeDeliveryRate = this.safeDivide(onTimeOrders.length * 100, deliveredOrders.length, 0);

      const averageDaysLate = lateOrders.length > 0 
        ? lateOrders.reduce((sum, order) => sum + (order.daysLate || 0), 0) / lateOrders.length
        : 0;

      // Delivery reliability score (0-5 scale)
      let reliabilityScore = 5;
      if (onTimeDeliveryRate < 95) reliabilityScore = 4;
      if (onTimeDeliveryRate < 90) reliabilityScore = 3;
      if (onTimeDeliveryRate < 80) reliabilityScore = 2;
      if (onTimeDeliveryRate < 70) reliabilityScore = 1;

      const completedOrders = deliveredOrders.length;
      const pendingOrders = orders.filter(order => !order.isDelivered).length;
      const cancelledOrders = 0; // Would need cancellation data

      return {
        onTimeDeliveryRate: this.roundMoney(onTimeDeliveryRate, 2),
        averageDaysLate: this.roundMoney(averageDaysLate, 1),
        deliveryReliabilityScore: reliabilityScore,
        completedOrders,
        pendingOrders,
        cancelledOrders
      };
    });
  }

  /**
   * Calculate quality performance metrics
   */
  private async calculateQualityMetrics(orders: VendorOrderData[]): Promise<CalculationResult<VendorQualityMetrics>> {
    return this.executeCalculation('calculateQualityMetrics', { orderCount: orders.length }, async (context) => {
      const ordersWithQuality = orders.filter(order => order.qualityScore !== undefined);
      const ordersWithDefects = orders.filter(order => order.defectRate !== undefined);
      const ordersWithAcceptance = orders.filter(order => 
        order.itemsReceived > 0 && order.itemsAccepted !== undefined && order.itemsRejected !== undefined
      );

      // Calculate average quality rating
      const qualityRating = ordersWithQuality.length > 0
        ? ordersWithQuality.reduce((sum, order) => sum + order.qualityScore!, 0) / ordersWithQuality.length
        : 3.0;

      // Calculate average defect rate
      const defectRate = ordersWithDefects.length > 0
        ? ordersWithDefects.reduce((sum, order) => sum + order.defectRate!, 0) / ordersWithDefects.length
        : 0;

      // Calculate rejection rate
      const totalReceived = ordersWithAcceptance.reduce((sum, order) => sum + order.itemsReceived, 0);
      const totalRejected = ordersWithAcceptance.reduce((sum, order) => sum + order.itemsRejected!, 0);
      const rejectionRate = this.safeDivide(totalRejected * 100, totalReceived, 0);

      // Calculate quality consistency (variance in quality scores)
      const qualityConsistency = this.calculateConsistencyScore(
        ordersWithQuality.map(order => order.qualityScore!)
      );

      // Determine quality trend (would need historical data)
      const qualityTrend: 'improving' | 'stable' | 'declining' = 'stable';

      return {
        qualityRating: this.roundMoney(qualityRating, 2),
        defectRate: this.roundMoney(defectRate, 2),
        rejectionRate: this.roundMoney(rejectionRate, 2),
        qualityConsistency: this.roundMoney(qualityConsistency, 2),
        qualityTrend
      };
    });
  }

  /**
   * Calculate reliability metrics
   */
  private async calculateReliabilityMetrics(orders: VendorOrderData[]): Promise<CalculationResult<VendorReliabilityMetrics>> {
    return this.executeCalculation('calculateReliabilityMetrics', { orderCount: orders.length }, async (context) => {
      const totalOrders = orders.length;
      const fulfilledOrders = orders.filter(order => 
        order.itemsReceived > 0 && order.itemsReceived === order.itemsOrdered
      ).length;

      const orderFulfillmentRate = this.safeDivide(fulfilledOrders * 100, totalOrders, 0);

      // Communication score would come from external ratings/surveys
      const communicationScore = 3.5; // Default value

      // Issue resolution time would come from support ticket data
      const issueResolutionTime = 2.5; // Default value in days

      const reliabilityTrend: 'improving' | 'stable' | 'declining' = 'stable';

      return {
        orderFulfillmentRate: this.roundMoney(orderFulfillmentRate, 2),
        communicationScore: this.roundMoney(communicationScore, 1),
        issueResolutionTime: this.roundMoney(issueResolutionTime, 1),
        reliabilityTrend
      };
    });
  }

  /**
   * Calculate financial metrics
   */
  private async calculateFinancialMetrics(orders: VendorOrderData[]): Promise<CalculationResult<VendorFinancialMetrics>> {
    return this.executeCalculation('calculateFinancialMetrics', { orderCount: orders.length }, async (context) => {
      if (orders.length === 0) {
        return {
          totalOrderValue: this.createMoney(0, 'USD'),
          averageOrderValue: this.createMoney(0, 'USD'),
          priceCompetitiveness: 3.0,
          paymentTermsCompliance: 100,
          costSavingsGenerated: this.createMoney(0, 'USD')
        };
      }

      const currencyCode = orders[0].orderValue.currency;
      const totalValue = orders.reduce((sum, order) => sum + order.orderValue.amount, 0);
      const averageValue = totalValue / orders.length;

      const totalOrderValue = this.createMoney(totalValue, currencyCode);
      const averageOrderValue = this.createMoney(averageValue, currencyCode);

      // Price competitiveness would require market data comparison
      const priceCompetitiveness = 3.5; // Default value

      // Payment terms compliance would come from payment history
      const paymentTermsCompliance = 95; // Default value

      // Cost savings would come from price improvement tracking
      const costSavingsGenerated = this.createMoney(0, currencyCode);

      return {
        totalOrderValue,
        averageOrderValue,
        priceCompetitiveness: this.roundMoney(priceCompetitiveness, 1),
        paymentTermsCompliance: this.roundMoney(paymentTermsCompliance, 1),
        costSavingsGenerated
      };
    });
  }

  /**
   * Calculate overall vendor rating
   */
  private async calculateOverallRating(input: {
    deliveryMetrics: VendorDeliveryMetrics;
    qualityMetrics: VendorQualityMetrics;
    reliabilityMetrics: VendorReliabilityMetrics;
    financialMetrics: VendorFinancialMetrics;
    weights: VendorMetricWeights;
  }): Promise<CalculationResult<number>> {
    return this.executeCalculation('calculateOverallRating', input, async (context) => {
      const { deliveryMetrics, qualityMetrics, reliabilityMetrics, financialMetrics, weights } = input;

      // Convert percentages to 0-5 scale
      const deliveryScore = (deliveryMetrics.onTimeDeliveryRate / 100) * 5;
      const qualityScore = qualityMetrics.qualityRating;
      const reliabilityScore = (reliabilityMetrics.orderFulfillmentRate / 100) * 5;
      const priceScore = financialMetrics.priceCompetitiveness;
      const communicationScore = reliabilityMetrics.communicationScore;

      const weightedScore = (
        (deliveryScore * weights.deliveryPerformance) +
        (qualityScore * weights.qualityRating) +
        (priceScore * weights.priceCompetitiveness) +
        (reliabilityScore * weights.reliability) +
        (communicationScore * weights.communication)
      );

      return this.roundMoney(Math.min(5, Math.max(0, weightedScore)), 2);
    });
  }

  /**
   * Calculate risk score
   */
  private async calculateRiskScore(input: {
    deliveryMetrics: VendorDeliveryMetrics;
    qualityMetrics: VendorQualityMetrics;
    reliabilityMetrics: VendorReliabilityMetrics;
  }): Promise<CalculationResult<number>> {
    return this.executeCalculation('calculateRiskScore', input, async (context) => {
      const { deliveryMetrics, qualityMetrics, reliabilityMetrics } = input;

      let riskScore = 0;

      // Delivery risk (0-40 points)
      if (deliveryMetrics.onTimeDeliveryRate < 70) riskScore += 40;
      else if (deliveryMetrics.onTimeDeliveryRate < 80) riskScore += 30;
      else if (deliveryMetrics.onTimeDeliveryRate < 90) riskScore += 20;
      else if (deliveryMetrics.onTimeDeliveryRate < 95) riskScore += 10;

      // Quality risk (0-30 points)
      if (qualityMetrics.qualityRating < 2) riskScore += 30;
      else if (qualityMetrics.qualityRating < 3) riskScore += 20;
      else if (qualityMetrics.qualityRating < 4) riskScore += 10;

      // Reliability risk (0-30 points)
      if (reliabilityMetrics.orderFulfillmentRate < 70) riskScore += 30;
      else if (reliabilityMetrics.orderFulfillmentRate < 80) riskScore += 20;
      else if (reliabilityMetrics.orderFulfillmentRate < 90) riskScore += 15;
      else if (reliabilityMetrics.orderFulfillmentRate < 95) riskScore += 5;

      return Math.min(100, riskScore);
    });
  }

  /**
   * Generate performance-based recommendations
   */
  private async generateRecommendations(input: {
    deliveryMetrics: VendorDeliveryMetrics;
    qualityMetrics: VendorQualityMetrics;
    reliabilityMetrics: VendorReliabilityMetrics;
    financialMetrics: VendorFinancialMetrics;
    overallRating: number;
    riskScore: number;
  }): Promise<CalculationResult<string[]>> {
    return this.executeCalculation('generateRecommendations', input, async (context) => {
      const recommendations: string[] = [];
      const { deliveryMetrics, qualityMetrics, reliabilityMetrics, overallRating, riskScore } = input;

      // Delivery recommendations
      if (deliveryMetrics.onTimeDeliveryRate < 90) {
        recommendations.push('Implement delivery performance improvement plan');
        recommendations.push('Consider requiring delivery commitments with penalties');
      }

      if (deliveryMetrics.averageDaysLate > 3) {
        recommendations.push('Review lead time agreements and build in buffer time');
      }

      // Quality recommendations
      if (qualityMetrics.qualityRating < 3.5) {
        recommendations.push('Initiate quality improvement discussions');
        recommendations.push('Consider quality audits or certifications');
      }

      if (qualityMetrics.rejectionRate > 5) {
        recommendations.push('Implement stricter incoming inspection procedures');
      }

      // Reliability recommendations
      if (reliabilityMetrics.orderFulfillmentRate < 95) {
        recommendations.push('Review capacity planning with vendor');
        recommendations.push('Consider backup vendor for critical items');
      }

      // Overall performance recommendations
      if (overallRating >= 4.5) {
        recommendations.push('Consider for preferred vendor status');
        recommendations.push('Explore opportunities for expanded partnership');
      } else if (overallRating < 2.5) {
        recommendations.push('Initiate vendor improvement plan');
        recommendations.push('Begin sourcing alternative vendors');
      }

      // Risk-based recommendations
      if (riskScore > 60) {
        recommendations.push('High risk vendor - implement enhanced monitoring');
        recommendations.push('Develop contingency plans for critical supplies');
      }

      return recommendations;
    });
  }

  /**
   * Calculate price competitiveness across vendors
   */
  async calculatePriceCompetitiveness(input: PriceComparisonInput): Promise<CalculationResult<PriceCompetitivenessResult>> {
    return this.executeCalculation('calculatePriceCompetitiveness', input, async (context) => {
      if (!input.vendorPrices || input.vendorPrices.length === 0) {
        throw this.createError('Vendor prices are required', 'NO_VENDOR_PRICES', context);
      }

      // Ensure all prices are in same currency
      const baseCurrency = input.vendorPrices[0].price.currency;
      const invalidCurrency = input.vendorPrices.find(vp => vp.price.currency !== baseCurrency);
      if (invalidCurrency) {
        throw this.createError(
          `All prices must be in same currency. Expected ${baseCurrency}, found ${invalidCurrency.price.currency}`,
          'CURRENCY_MISMATCH',
          context
        );
      }

      // Sort by price (ascending)
      const sortedPrices = [...input.vendorPrices].sort((a, b) => a.price.amount - b.price.amount);
      
      const lowestPrice = sortedPrices[0].price;
      const highestPrice = sortedPrices[sortedPrices.length - 1].price;
      const priceSpread = this.safeDivide((highestPrice.amount - lowestPrice.amount) * 100, lowestPrice.amount, 0);

      // Calculate market statistics
      const prices = sortedPrices.map(vp => vp.price.amount);
      const marketAverage = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const marketMedian = prices[Math.floor(prices.length / 2)];

      // Calculate competitiveness scores
      const vendorPrices = sortedPrices.map((vendorPrice, index) => {
        const percentageFromBest = this.safeDivide(
          (vendorPrice.price.amount - lowestPrice.amount) * 100,
          lowestPrice.amount,
          0
        );

        // Score: 5 = best price, decreasing based on percentage difference
        let competitivenessScore = 5;
        if (percentageFromBest > 20) competitivenessScore = 1;
        else if (percentageFromBest > 15) competitivenessScore = 2;
        else if (percentageFromBest > 10) competitivenessScore = 3;
        else if (percentageFromBest > 5) competitivenessScore = 4;

        return {
          vendorId: vendorPrice.vendorId,
          price: vendorPrice.price,
          competitivenessScore: this.roundMoney(competitivenessScore, 1),
          rank: index + 1,
          percentageFromBest: this.roundMoney(percentageFromBest, 2)
        };
      });

      return {
        itemId: input.itemId,
        vendorPrices,
        marketAverage: this.createMoney(marketAverage, baseCurrency),
        marketMedian: this.createMoney(marketMedian, baseCurrency),
        priceRange: {
          lowest: lowestPrice,
          highest: highestPrice,
          spread: this.roundMoney(priceSpread, 2)
        }
      };
    });
  }

  /**
   * Calculate consistency score from array of values
   */
  private calculateConsistencyScore(values: number[]): number {
    if (values.length <= 1) return 5;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert standard deviation to 0-5 consistency score (lower deviation = higher consistency)
    const consistencyScore = Math.max(0, 5 - standardDeviation);
    return consistencyScore;
  }
}