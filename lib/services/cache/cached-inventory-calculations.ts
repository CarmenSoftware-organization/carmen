/**
 * Cached Inventory Calculations Service
 * 
 * Transparent caching wrapper for InventoryCalculations with 
 * intelligent cache invalidation and dependency tracking.
 */

import { 
  InventoryCalculations,
  StockValuationInput,
  StockValuationResult,
  AvailableQuantityInput,
  AvailableQuantityResult,
  ReorderPointInput,
  ReorderPointResult,
  ABCAnalysisInput,
  ABCAnalysisResult
} from '../calculations/inventory-calculations';
import { CalculationResult } from '../calculations/base-calculator';
import { Money } from '@/lib/types';
import { EnhancedCacheLayer, CacheDependency } from './enhanced-cache-layer';

/**
 * Cached inventory calculations with transparent caching
 */
export class CachedInventoryCalculations extends InventoryCalculations {
  constructor(private cacheLayer: EnhancedCacheLayer) {
    super();
  }

  /**
   * Calculate stock valuation with caching
   */
  async calculateStockValuation(input: StockValuationInput): Promise<CalculationResult<StockValuationResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'entity',
        identifier: `inventory_item:${input.itemId}`,
        version: input.quantityOnHand.toString()
      },
      {
        type: 'field',
        identifier: 'costing_method',
        version: input.costingMethod
      },
      {
        type: 'entity',
        identifier: `inventory_transactions:${input.itemId}`,
        version: input.transactions?.length.toString() || '0'
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'calculateStockValuation',
      input,
      () => super.calculateStockValuation(input),
      dependencies
    );
  }

  /**
   * Calculate available quantity with caching
   */
  async calculateAvailableQuantity(input: AvailableQuantityInput): Promise<CalculationResult<AvailableQuantityResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'stock_levels',
        version: `${input.quantityOnHand}_${input.quantityReserved}_${input.quantityOnOrder || 0}`
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'calculateAvailableQuantity',
      input,
      () => super.calculateAvailableQuantity(input),
      dependencies
    );
  }

  /**
   * Calculate reorder point with caching
   */
  async calculateReorderPoint(input: ReorderPointInput): Promise<CalculationResult<ReorderPointResult>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'usage_patterns',
        version: input.averageMonthlyUsage.toString()
      },
      {
        type: 'field',
        identifier: 'lead_times',
        version: input.leadTimeDays.toString()
      },
      {
        type: 'field',
        identifier: 'safety_stock',
        version: input.safetyStockDays?.toString() || '0'
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'calculateReorderPoint',
      input,
      () => super.calculateReorderPoint(input),
      dependencies
    );
  }

  /**
   * Perform ABC analysis with caching
   */
  async performABCAnalysis(input: ABCAnalysisInput): Promise<CalculationResult<ABCAnalysisResult[]>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'table',
        identifier: 'inventory_items',
        version: input.items.length.toString()
      },
      {
        type: 'field',
        identifier: 'annual_usage',
        version: input.items.reduce((sum, item) => sum + item.annualUsage, 0).toString()
      },
      {
        type: 'field',
        identifier: 'currency_rates',
        version: input.currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'performABCAnalysis',
      input,
      () => super.performABCAnalysis(input),
      dependencies
    );
  }

  /**
   * Calculate inventory turnover with caching
   */
  async calculateInventoryTurnover(
    costOfGoodsSold: Money, 
    averageInventoryValue: Money
  ): Promise<CalculationResult<number>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'cogs',
        version: costOfGoodsSold.amount.toString()
      },
      {
        type: 'field',
        identifier: 'avg_inventory',
        version: averageInventoryValue.amount.toString()
      },
      {
        type: 'field',
        identifier: 'currency_rates',
        version: costOfGoodsSold.currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'calculateInventoryTurnover',
      { costOfGoodsSold, averageInventoryValue },
      () => super.calculateInventoryTurnover(costOfGoodsSold, averageInventoryValue),
      dependencies
    );
  }

  /**
   * Calculate days sales inventory with caching
   */
  async calculateDaysSalesInventory(
    averageInventoryValue: Money,
    costOfGoodsSold: Money,
    periodDays: number = 365
  ): Promise<CalculationResult<number>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'avg_inventory',
        version: averageInventoryValue.amount.toString()
      },
      {
        type: 'field',
        identifier: 'cogs',
        version: costOfGoodsSold.amount.toString()
      },
      {
        type: 'field',
        identifier: 'period',
        version: periodDays.toString()
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'calculateDaysSalesInventory',
      { averageInventoryValue, costOfGoodsSold, periodDays },
      () => super.calculateDaysSalesInventory(averageInventoryValue, costOfGoodsSold, periodDays),
      dependencies
    );
  }

  /**
   * Calculate carrying cost with caching
   */
  async calculateCarryingCost(
    averageInventoryValue: Money,
    carryingCostRate: number
  ): Promise<CalculationResult<Money>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'avg_inventory',
        version: averageInventoryValue.amount.toString()
      },
      {
        type: 'field',
        identifier: 'carrying_cost_rate',
        version: carryingCostRate.toString()
      },
      {
        type: 'field',
        identifier: 'currency_rates',
        version: averageInventoryValue.currencyCode
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'calculateCarryingCost',
      { averageInventoryValue, carryingCostRate },
      () => super.calculateCarryingCost(averageInventoryValue, carryingCostRate),
      dependencies
    );
  }

  /**
   * Calculate economic order quantity with caching
   */
  async calculateEOQ(
    annualDemand: number,
    orderingCost: Money,
    holdingCostPerUnit: Money
  ): Promise<CalculationResult<number>> {
    const dependencies: CacheDependency[] = [
      {
        type: 'field',
        identifier: 'annual_demand',
        version: annualDemand.toString()
      },
      {
        type: 'field',
        identifier: 'ordering_cost',
        version: orderingCost.amount.toString()
      },
      {
        type: 'field',
        identifier: 'holding_cost',
        version: holdingCostPerUnit.amount.toString()
      }
    ];

    return this.cacheLayer.getOrCompute(
      'InventoryCalculations',
      'calculateEOQ',
      { annualDemand, orderingCost, holdingCostPerUnit },
      () => super.calculateEOQ(annualDemand, orderingCost, holdingCostPerUnit),
      dependencies
    );
  }

  /**
   * Invalidate inventory calculation caches
   */
  async invalidateInventoryCaches(reason: string, itemIds?: string[], userId?: string): Promise<number> {
    const dependencies: CacheDependency[] = [
      { type: 'table', identifier: 'inventory_items' },
      { type: 'field', identifier: 'stock_levels' },
      { type: 'field', identifier: 'costing_method' },
      { type: 'field', identifier: 'usage_patterns' },
      { type: 'field', identifier: 'lead_times' }
    ];

    // Add specific item dependencies if provided
    if (itemIds) {
      itemIds.forEach(itemId => {
        dependencies.push(
          { type: 'entity', identifier: `inventory_item:${itemId}` },
          { type: 'entity', identifier: `inventory_transactions:${itemId}` }
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
   * Warm cache with common inventory calculations
   */
  async warmInventoryCache(topItems?: string[]): Promise<{ warmed: number; failed: number }> {
    const warmingTasks = [];
    const commonQuantities = [10, 50, 100, 500, 1000];
    const commonUsageRates = [10, 25, 50, 100, 200];
    const commonLeadTimes = [7, 14, 30, 60];

    // If no specific items provided, use some sample data
    const itemsToWarm = topItems || ['sample-item-1', 'sample-item-2', 'sample-item-3'];

    // Common available quantity calculations
    for (const onHand of commonQuantities) {
      for (const reserved of [0, 5, 10]) {
        warmingTasks.push({
          serviceClass: 'InventoryCalculations',
          method: 'calculateAvailableQuantity',
          inputs: {
            quantityOnHand: onHand,
            quantityReserved: reserved,
            quantityOnOrder: onHand * 0.2,
            includeOnOrder: true
          },
          computeFn: () => this.calculateAvailableQuantity({
            quantityOnHand: onHand,
            quantityReserved: reserved,
            quantityOnOrder: onHand * 0.2,
            includeOnOrder: true
          }),
          priority: 3
        });
      }
    }

    // Common reorder point calculations
    for (const usage of commonUsageRates) {
      for (const leadTime of commonLeadTimes) {
        warmingTasks.push({
          serviceClass: 'InventoryCalculations',
          method: 'calculateReorderPoint',
          inputs: {
            averageMonthlyUsage: usage,
            leadTimeDays: leadTime,
            safetyStockDays: 7
          },
          computeFn: () => this.calculateReorderPoint({
            averageMonthlyUsage: usage,
            leadTimeDays: leadTime,
            safetyStockDays: 7
          }),
          priority: 2
        });
      }
    }

    // Common inventory turnover calculations
    const commonCOGS = [10000, 50000, 100000, 500000];
    const commonInventoryValues = [2000, 10000, 20000, 100000];
    
    for (const cogs of commonCOGS) {
      for (const inventoryValue of commonInventoryValues) {
        warmingTasks.push({
          serviceClass: 'InventoryCalculations',
          method: 'calculateInventoryTurnover',
          inputs: {
            costOfGoodsSold: { amount: cogs, currencyCode: 'USD' },
            averageInventoryValue: { amount: inventoryValue, currencyCode: 'USD' }
          },
          computeFn: () => this.calculateInventoryTurnover(
            { amount: cogs, currencyCode: 'USD' },
            { amount: inventoryValue, currencyCode: 'USD' }
          ),
          priority: 1
        });
      }
    }

    return this.cacheLayer.warmCache(warmingTasks);
  }
}