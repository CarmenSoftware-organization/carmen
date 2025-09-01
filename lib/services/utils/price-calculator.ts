/**
 * Price Calculator Utilities
 * 
 * Advanced pricing calculations including bulk discounts, tiered pricing,
 * promotional pricing, and price optimization functions.
 */

import { Money } from '@/lib/types'
import { BaseCalculator, CalculationResult } from '../calculations/base-calculator'
import { FinancialCalculations } from '../calculations/financial-calculations'

/**
 * Pricing tier definition
 */
export interface PricingTier {
  minQuantity: number;
  maxQuantity?: number;
  price: Money;
  discountPercentage?: number;
  description?: string;
}

/**
 * Bulk discount configuration
 */
export interface BulkDiscountConfig {
  tiers: PricingTier[];
  cumulativeDiscount: boolean; // Apply discount to entire order or just excess quantity
}

/**
 * Promotional pricing rule
 */
export interface PromotionalRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bulk_discount';
  validFrom: Date;
  validUntil: Date;
  conditions: PromotionalConditions;
  discount: PromotionalDiscount;
  maxApplications?: number;
  isActive: boolean;
}

/**
 * Promotional conditions
 */
export interface PromotionalConditions {
  minQuantity?: number;
  minOrderValue?: Money;
  applicableItems?: string[]; // Item IDs
  applicableCategories?: string[]; // Category IDs
  customerTiers?: string[]; // Customer tier IDs
  excludeItems?: string[];
  requireCombination?: boolean; // Must buy multiple items
}

/**
 * Promotional discount
 */
export interface PromotionalDiscount {
  percentage?: number;
  fixedAmount?: Money;
  buyQuantity?: number; // For buy X get Y
  getQuantity?: number; // For buy X get Y
  getDiscount?: number; // Percentage off the "get" items
  maxDiscount?: Money; // Maximum discount cap
}

/**
 * Price calculation input
 */
export interface PriceCalculationInput {
  itemId: string;
  basePrice: Money;
  quantity: number;
  customerId?: string;
  customerTier?: string;
  orderDate?: Date;
  bulkDiscounts?: BulkDiscountConfig;
  promotionalRules?: PromotionalRule[];
  taxRate?: number;
  includesTax?: boolean;
}

/**
 * Price calculation result
 */
export interface PriceCalculationResult {
  itemId: string;
  quantity: number;
  baseUnitPrice: Money;
  effectiveUnitPrice: Money;
  subtotal: Money;
  discountsApplied: AppliedDiscount[];
  totalDiscountAmount: Money;
  netAmount: Money;
  taxAmount?: Money;
  totalAmount: Money;
  savings: Money;
  savingsPercentage: number;
}

/**
 * Applied discount details
 */
export interface AppliedDiscount {
  type: 'bulk' | 'promotional' | 'tier' | 'volume';
  ruleId?: string;
  ruleName: string;
  discountAmount: Money;
  discountPercentage: number;
  quantityAffected: number;
  description: string;
}

/**
 * Price comparison input
 */
export interface PriceComparisonInput {
  scenarios: Array<{
    name: string;
    quantity: number;
    configuration: PriceCalculationInput;
  }>;
}

/**
 * Price comparison result
 */
export interface PriceComparisonResult {
  scenarios: Array<{
    name: string;
    quantity: number;
    result: PriceCalculationResult;
    unitCost: number;
    totalCost: number;
    rank: number;
  }>;
  bestValue: string; // Scenario name with best value
  recommendations: string[];
}

export class PriceCalculator extends BaseCalculator {
  protected serviceName = 'PriceCalculator';
  private financialCalculations = new FinancialCalculations();

  /**
   * Calculate comprehensive pricing with all discounts and promotions
   */
  async calculatePrice(input: PriceCalculationInput): Promise<CalculationResult<PriceCalculationResult>> {
    return this.executeCalculation('calculatePrice', input, async (context) => {
      this.validateMoney(input.basePrice, 'basePrice');
      this.validatePositive(input.quantity, 'quantity');

      const {
        itemId,
        basePrice,
        quantity,
        customerId,
        customerTier,
        orderDate = new Date(),
        bulkDiscounts,
        promotionalRules = [],
        taxRate = 0,
        includesTax = false
      } = input;

      // Calculate base subtotal
      const baseSubtotal = this.createMoney(
        basePrice.amount * quantity,
        basePrice.currencyCode
      );

      // Apply bulk discounts
      const bulkDiscountResult = bulkDiscounts 
        ? await this.applyBulkDiscounts(basePrice, quantity, bulkDiscounts)
        : null;

      // Apply promotional rules
      const promotionalResult = await this.applyPromotionalRules(
        itemId,
        basePrice,
        quantity,
        promotionalRules,
        orderDate,
        customerId,
        customerTier
      );

      // Combine all discounts
      const allDiscounts: AppliedDiscount[] = [];
      let totalDiscountAmount = this.createMoney(0, basePrice.currencyCode);

      if (bulkDiscountResult) {
        allDiscounts.push(...bulkDiscountResult.value.discountsApplied);
        totalDiscountAmount = await this.addMoney([
          totalDiscountAmount,
          bulkDiscountResult.value.totalDiscountAmount
        ]);
      }

      if (promotionalResult.value.length > 0) {
        allDiscounts.push(...promotionalResult.value);
        const promoDiscount = promotionalResult.value.reduce(
          (sum, discount) => sum + discount.discountAmount.amount,
          0
        );
        totalDiscountAmount = await this.addMoney([
          totalDiscountAmount,
          this.createMoney(promoDiscount, basePrice.currencyCode)
        ]);
      }

      // Calculate net amount after discounts
      const netAmount = this.createMoney(
        baseSubtotal.amount - totalDiscountAmount.amount,
        basePrice.currencyCode
      );

      // Calculate effective unit price
      const effectiveUnitPrice = this.createMoney(
        netAmount.amount / quantity,
        basePrice.currencyCode
      );

      // Calculate tax if applicable
      let taxAmount: Money | undefined;
      let totalAmount = netAmount;

      if (taxRate > 0) {
        const taxResult = await this.financialCalculations.calculateTax({
          subtotal: netAmount,
          taxRate,
          taxIncluded: includesTax,
          currencyCode: basePrice.currencyCode
        });
        taxAmount = taxResult.value.taxAmount;
        totalAmount = taxResult.value.totalAmount;
      }

      // Calculate savings
      const savings = totalDiscountAmount;
      const savingsPercentage = this.safeDivide(
        savings.amount * 100,
        baseSubtotal.amount,
        0
      );

      return {
        itemId,
        quantity,
        baseUnitPrice: basePrice,
        effectiveUnitPrice,
        subtotal: baseSubtotal,
        discountsApplied: allDiscounts,
        totalDiscountAmount: savings,
        netAmount,
        taxAmount,
        totalAmount,
        savings,
        savingsPercentage: this.roundMoney(savingsPercentage, 2)
      };
    });
  }

  /**
   * Apply bulk discount tiers
   */
  private async applyBulkDiscounts(
    basePrice: Money,
    quantity: number,
    config: BulkDiscountConfig
  ): Promise<CalculationResult<{
    discountsApplied: AppliedDiscount[];
    totalDiscountAmount: Money;
    effectivePrice: Money;
  }>> {
    return this.executeCalculation('applyBulkDiscounts', { quantity, tierCount: config.tiers.length }, async (context) => {
      const discountsApplied: AppliedDiscount[] = [];
      let totalDiscountAmount = 0;

      // Sort tiers by minimum quantity
      const sortedTiers = [...config.tiers].sort((a, b) => a.minQuantity - b.minQuantity);

      if (config.cumulativeDiscount) {
        // Apply discount to entire quantity based on highest tier reached
        const applicableTier = this.findApplicableTier(quantity, sortedTiers);
        if (applicableTier && applicableTier.discountPercentage) {
          const discountAmount = basePrice.amount * quantity * (applicableTier.discountPercentage / 100);
          totalDiscountAmount = discountAmount;

          discountsApplied.push({
            type: 'bulk',
            ruleName: `Bulk Discount - ${applicableTier.minQuantity}+ units`,
            discountAmount: this.createMoney(discountAmount, basePrice.currencyCode),
            discountPercentage: applicableTier.discountPercentage,
            quantityAffected: quantity,
            description: applicableTier.description || `${applicableTier.discountPercentage}% off for ${applicableTier.minQuantity}+ units`
          });
        }
      } else {
        // Apply progressive discounts for different quantity ranges
        let remainingQuantity = quantity;

        for (let i = 0; i < sortedTiers.length && remainingQuantity > 0; i++) {
          const tier = sortedTiers[i];
          const nextTier = sortedTiers[i + 1];

          if (remainingQuantity >= tier.minQuantity) {
            const maxForThisTier = nextTier ? Math.min(remainingQuantity, nextTier.minQuantity - tier.minQuantity) : remainingQuantity;
            const quantityAtThisTier = Math.min(remainingQuantity, maxForThisTier);

            if (tier.discountPercentage && quantityAtThisTier > 0) {
              const discountAmount = basePrice.amount * quantityAtThisTier * (tier.discountPercentage / 100);
              totalDiscountAmount += discountAmount;

              discountsApplied.push({
                type: 'bulk',
                ruleName: `Bulk Tier - ${tier.minQuantity}+ units`,
                discountAmount: this.createMoney(discountAmount, basePrice.currencyCode),
                discountPercentage: tier.discountPercentage,
                quantityAffected: quantityAtThisTier,
                description: tier.description || `${tier.discountPercentage}% off for quantities ${tier.minQuantity}+`
              });
            }

            remainingQuantity -= quantityAtThisTier;
          }
        }
      }

      const effectivePrice = this.createMoney(
        basePrice.amount - (totalDiscountAmount / quantity),
        basePrice.currencyCode
      );

      return {
        discountsApplied,
        totalDiscountAmount: this.createMoney(totalDiscountAmount, basePrice.currencyCode),
        effectivePrice
      };
    });
  }

  /**
   * Apply promotional rules
   */
  private async applyPromotionalRules(
    itemId: string,
    basePrice: Money,
    quantity: number,
    rules: PromotionalRule[],
    orderDate: Date,
    customerId?: string,
    customerTier?: string
  ): Promise<CalculationResult<AppliedDiscount[]>> {
    return this.executeCalculation('applyPromotionalRules', { ruleCount: rules.length }, async (context) => {
      const applicableRules = rules.filter(rule => 
        this.isPromotionalRuleApplicable(rule, itemId, quantity, orderDate, customerId, customerTier)
      );

      const appliedDiscounts: AppliedDiscount[] = [];

      for (const rule of applicableRules) {
        const discount = await this.calculatePromotionalDiscount(
          rule,
          basePrice,
          quantity
        );

        if (discount && discount.discountAmount.amount > 0) {
          appliedDiscounts.push(discount);
        }
      }

      return appliedDiscounts;
    });
  }

  /**
   * Check if promotional rule is applicable
   */
  private isPromotionalRuleApplicable(
    rule: PromotionalRule,
    itemId: string,
    quantity: number,
    orderDate: Date,
    customerId?: string,
    customerTier?: string
  ): boolean {
    // Check if rule is active
    if (!rule.isActive) return false;

    // Check date validity
    if (orderDate < rule.validFrom || orderDate > rule.validUntil) return false;

    const conditions = rule.conditions;

    // Check quantity conditions
    if (conditions.minQuantity && quantity < conditions.minQuantity) return false;

    // Check item applicability
    if (conditions.applicableItems && !conditions.applicableItems.includes(itemId)) return false;

    // Check item exclusions
    if (conditions.excludeItems && conditions.excludeItems.includes(itemId)) return false;

    // Check customer tier
    if (conditions.customerTiers && customerTier && !conditions.customerTiers.includes(customerTier)) return false;

    return true;
  }

  /**
   * Calculate promotional discount amount
   */
  private async calculatePromotionalDiscount(
    rule: PromotionalRule,
    basePrice: Money,
    quantity: number
  ): Promise<AppliedDiscount | null> {
    const discount = rule.discount;
    let discountAmount = 0;
    let quantityAffected = quantity;

    switch (rule.type) {
      case 'percentage':
        if (discount.percentage) {
          discountAmount = basePrice.amount * quantity * (discount.percentage / 100);
          
          // Apply maximum discount cap if specified
          if (discount.maxDiscount) {
            discountAmount = Math.min(discountAmount, discount.maxDiscount.amount);
          }
        }
        break;

      case 'fixed_amount':
        if (discount.fixedAmount) {
          discountAmount = Math.min(discount.fixedAmount.amount, basePrice.amount * quantity);
        }
        break;

      case 'buy_x_get_y':
        if (discount.buyQuantity && discount.getQuantity && discount.getDiscount) {
          const setsEligible = Math.floor(quantity / (discount.buyQuantity + discount.getQuantity));
          const freeItems = setsEligible * discount.getQuantity;
          discountAmount = freeItems * basePrice.amount * (discount.getDiscount / 100);
          quantityAffected = freeItems;
        }
        break;

      default:
        return null;
    }

    if (discountAmount <= 0) return null;

    return {
      type: 'promotional',
      ruleId: rule.id,
      ruleName: rule.name,
      discountAmount: this.createMoney(discountAmount, basePrice.currencyCode),
      discountPercentage: this.safeDivide(discountAmount * 100, basePrice.amount * quantity, 0),
      quantityAffected,
      description: `Promotional discount: ${rule.name}`
    };
  }

  /**
   * Compare different pricing scenarios
   */
  async comparePricing(input: PriceComparisonInput): Promise<CalculationResult<PriceComparisonResult>> {
    return this.executeCalculation('comparePricing', { scenarioCount: input.scenarios.length }, async (context) => {
      const results: PriceComparisonResult['scenarios'] = [];

      // Calculate pricing for each scenario
      for (const scenario of input.scenarios) {
        const priceResult = await this.calculatePrice(scenario.configuration);
        
        results.push({
          name: scenario.name,
          quantity: scenario.quantity,
          result: priceResult.value,
          unitCost: priceResult.value.effectiveUnitPrice.amount,
          totalCost: priceResult.value.totalAmount.amount,
          rank: 0 // Will be set after sorting
        });
      }

      // Sort by total cost and assign ranks
      results.sort((a, b) => a.totalCost - b.totalCost);
      results.forEach((result, index) => {
        result.rank = index + 1;
      });

      // Find best value (lowest total cost)
      const bestValue = results[0].name;

      // Generate recommendations
      const recommendations = this.generatePricingRecommendations(results);

      return {
        scenarios: results,
        bestValue,
        recommendations
      };
    });
  }

  /**
   * Find applicable pricing tier for quantity
   */
  private findApplicableTier(quantity: number, tiers: PricingTier[]): PricingTier | null {
    for (let i = tiers.length - 1; i >= 0; i--) {
      const tier = tiers[i];
      if (quantity >= tier.minQuantity && 
          (tier.maxQuantity === undefined || quantity <= tier.maxQuantity)) {
        return tier;
      }
    }
    return null;
  }

  /**
   * Add money amounts
   */
  private async addMoney(amounts: Money[]): Promise<Money> {
    const result = await this.financialCalculations.addMoney(amounts);
    return result.value;
  }

  /**
   * Generate pricing recommendations
   */
  private generatePricingRecommendations(scenarios: PriceComparisonResult['scenarios']): string[] {
    const recommendations: string[] = [];

    if (scenarios.length === 0) return recommendations;

    const bestScenario = scenarios[0];
    const worstScenario = scenarios[scenarios.length - 1];

    // Cost savings recommendation
    if (scenarios.length > 1) {
      const savings = worstScenario.totalCost - bestScenario.totalCost;
      const savingsPercentage = (savings / worstScenario.totalCost) * 100;
      
      recommendations.push(
        `Choose "${bestScenario.name}" to save ${this.roundMoney(savings, 2)} (${this.roundMoney(savingsPercentage, 1)}%) compared to "${worstScenario.name}"`
      );
    }

    // Bulk discount opportunities
    const scenariosWithBulkDiscounts = scenarios.filter(s => 
      s.result.discountsApplied.some(d => d.type === 'bulk')
    );

    if (scenariosWithBulkDiscounts.length > 0) {
      recommendations.push('Consider bulk purchasing to maximize discounts');
    }

    // Promotional opportunities
    const scenariosWithPromos = scenarios.filter(s =>
      s.result.discountsApplied.some(d => d.type === 'promotional')
    );

    if (scenariosWithPromos.length > 0) {
      recommendations.push('Take advantage of active promotional offers');
    }

    // Break-even analysis
    if (scenarios.length > 1) {
      const unitCosts = scenarios.map(s => s.unitCost);
      const minUnitCost = Math.min(...unitCosts);
      const maxUnitCost = Math.max(...unitCosts);
      
      if ((maxUnitCost - minUnitCost) / minUnitCost > 0.1) { // 10% difference
        recommendations.push('Significant unit cost variations detected - review quantity optimization');
      }
    }

    return recommendations;
  }
}