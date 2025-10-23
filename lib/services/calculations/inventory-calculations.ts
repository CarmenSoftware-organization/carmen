/**
 * Inventory Calculations Service
 * 
 * Handles inventory-related calculations including stock valuations,
 * reorder points, costing methods, and availability calculations.
 */

import { Money, InventoryItem } from '@/lib/types'
import { CostingMethod, StockBalance } from '@/lib/types/inventory'
import { BaseCalculator, CalculationResult } from './base-calculator'

/**
 * Stock valuation input
 */
export interface StockValuationInput {
  itemId: string;
  quantityOnHand: number;
  costingMethod: CostingMethod;
  transactions?: InventoryTransactionData[];
  averageCost?: Money;
  standardCost?: Money;
}

/**
 * Stock valuation result
 */
export interface StockValuationResult {
  itemId: string;
  quantityOnHand: number;
  unitCost: Money;
  totalValue: Money;
  costingMethod: CostingMethod;
  lastCostUpdate: Date;
}

/**
 * Available quantity calculation input
 */
export interface AvailableQuantityInput {
  quantityOnHand: number;
  quantityReserved: number;
  quantityOnOrder?: number;
  includeOnOrder?: boolean;
}

/**
 * Available quantity result
 */
export interface AvailableQuantityResult {
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityOnOrder: number;
  totalProjected: number;
}

/**
 * Reorder point calculation input
 */
export interface ReorderPointInput {
  averageMonthlyUsage: number;
  leadTimeDays: number;
  safetyStockDays?: number;
  seasonalityFactor?: number;
  minimumStock?: number;
}

/**
 * Reorder point calculation result
 */
export interface ReorderPointResult {
  reorderPoint: number;
  safetyStock: number;
  leadTimeStock: number;
  recommendedOrderQuantity: number;
  reviewFrequencyDays: number;
}

/**
 * ABC analysis input
 */
export interface ABCAnalysisInput {
  items: Array<{
    itemId: string;
    annualValue: Money;
    annualUsage: number;
  }>;
}

/**
 * ABC analysis result
 */
export interface ABCAnalysisResult {
  itemId: string;
  annualValue: Money;
  annualUsage: number;
  valuePercentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
  rank: number;
}

/**
 * Inventory transaction data for costing calculations
 */
export interface InventoryTransactionData {
  date: Date;
  type: 'RECEIVE' | 'ISSUE';
  quantity: number;
  unitCost?: Money;
  totalCost?: Money;
}

/**
 * FIFO cost layer
 */
interface FifoCostLayer {
  date: Date;
  quantity: number;
  unitCost: Money;
  remainingQuantity: number;
}

export class InventoryCalculations extends BaseCalculator {
  protected serviceName = 'InventoryCalculations';

  /**
   * Calculate stock valuation based on costing method
   */
  async calculateStockValuation(input: StockValuationInput): Promise<CalculationResult<StockValuationResult>> {
    return this.executeCalculation('calculateStockValuation', input, async (context) => {
      this.validatePositive(input.quantityOnHand, 'quantityOnHand');

      const { itemId, quantityOnHand, costingMethod } = input;

      let unitCost: Money;
      let lastCostUpdate = new Date();

      switch (costingMethod) {
        case CostingMethod.FIFO:
          unitCost = await this.calculateFifoCost(input);
          break;

        case CostingMethod.MOVING_AVERAGE:
          unitCost = await this.calculateMovingAverageCost(input);
          break;

        case CostingMethod.WEIGHTED_AVERAGE:
          unitCost = await this.calculateWeightedAverageCost(input);
          break;

        case CostingMethod.STANDARD_COST:
          if (!input.standardCost) {
            throw this.createError(
              'Standard cost is required for STANDARD_COST method',
              'MISSING_STANDARD_COST',
              context
            );
          }
          unitCost = input.standardCost;
          break;

        case CostingMethod.LIFO:
          unitCost = await this.calculateLifoCost(input);
          break;

        default:
          throw this.createError(
            `Unsupported costing method: ${costingMethod}`,
            'UNSUPPORTED_COSTING_METHOD',
            context
          );
      }

      const totalValue = this.createMoney(
        quantityOnHand * unitCost.amount,
        unitCost.currency
      );

      return {
        itemId,
        quantityOnHand,
        unitCost,
        totalValue,
        costingMethod,
        lastCostUpdate
      };
    });
  }

  /**
   * Calculate available quantity
   */
  async calculateAvailableQuantity(input: AvailableQuantityInput): Promise<CalculationResult<AvailableQuantityResult>> {
    return this.executeCalculation('calculateAvailableQuantity', input, async (context) => {
      this.validatePositive(input.quantityOnHand, 'quantityOnHand');
      this.validatePositive(input.quantityReserved, 'quantityReserved');

      const {
        quantityOnHand,
        quantityReserved,
        quantityOnOrder = 0,
        includeOnOrder = false
      } = input;

      const quantityAvailable = Math.max(0, quantityOnHand - quantityReserved);
      const totalProjected = includeOnOrder 
        ? quantityAvailable + quantityOnOrder 
        : quantityAvailable;

      return {
        quantityOnHand,
        quantityReserved,
        quantityAvailable,
        quantityOnOrder,
        totalProjected
      };
    });
  }

  /**
   * Calculate reorder point and recommended order quantity
   */
  async calculateReorderPoint(input: ReorderPointInput): Promise<CalculationResult<ReorderPointResult>> {
    return this.executeCalculation('calculateReorderPoint', input, async (context) => {
      this.validatePositive(input.averageMonthlyUsage, 'averageMonthlyUsage');
      this.validatePositive(input.leadTimeDays, 'leadTimeDays');

      const {
        averageMonthlyUsage,
        leadTimeDays,
        safetyStockDays = 7,
        seasonalityFactor = 1.0,
        minimumStock = 0
      } = input;

      // Calculate daily usage
      const dailyUsage = averageMonthlyUsage / 30;

      // Calculate lead time stock requirement
      const leadTimeStock = dailyUsage * leadTimeDays * seasonalityFactor;

      // Calculate safety stock
      const safetyStock = dailyUsage * safetyStockDays;

      // Calculate reorder point
      let reorderPoint = leadTimeStock + safetyStock;
      reorderPoint = Math.max(reorderPoint, minimumStock);

      // Calculate recommended order quantity (EOQ approximation)
      // Using simple approximation: 2 months of usage or minimum order
      const recommendedOrderQuantity = Math.max(
        averageMonthlyUsage * 2,
        reorderPoint
      );

      // Review frequency (how often to check stock levels)
      const reviewFrequencyDays = Math.max(7, leadTimeDays / 2);

      return {
        reorderPoint: Math.ceil(reorderPoint),
        safetyStock: Math.ceil(safetyStock),
        leadTimeStock: Math.ceil(leadTimeStock),
        recommendedOrderQuantity: Math.ceil(recommendedOrderQuantity),
        reviewFrequencyDays: Math.ceil(reviewFrequencyDays)
      };
    });
  }

  /**
   * Perform ABC analysis on inventory items
   */
  async performABCAnalysis(input: ABCAnalysisInput): Promise<CalculationResult<ABCAnalysisResult[]>> {
    return this.executeCalculation('performABCAnalysis', input, async (context) => {
      if (!input.items || input.items.length === 0) {
        throw this.createError(
          'At least one item is required for ABC analysis',
          'NO_ITEMS_PROVIDED',
          context
        );
      }

      // Validate and sort items by annual value (descending)
      const validatedItems = input.items.map((item, index) => {
        this.validateMoney(item.annualValue, `items[${index}].annualValue`);
        this.validatePositive(item.annualUsage, `items[${index}].annualUsage`);
        return item;
      });

      const sortedItems = validatedItems.sort((a, b) => b.annualValue.amount - a.annualValue.amount);

      // Calculate total value
      const totalValue = sortedItems.reduce((sum, item) => sum + item.annualValue.amount, 0);

      // Calculate classifications
      const results: ABCAnalysisResult[] = [];
      let cumulativeValue = 0;

      sortedItems.forEach((item, index) => {
        cumulativeValue += item.annualValue.amount;
        const valuePercentage = (item.annualValue.amount / totalValue) * 100;
        const cumulativePercentage = (cumulativeValue / totalValue) * 100;

        // ABC Classification rules:
        // A: Top 20% of items contributing to 80% of value
        // B: Next 30% of items contributing to 15% of value  
        // C: Bottom 50% of items contributing to 5% of value
        let classification: 'A' | 'B' | 'C';
        if (cumulativePercentage <= 80) {
          classification = 'A';
        } else if (cumulativePercentage <= 95) {
          classification = 'B';
        } else {
          classification = 'C';
        }

        results.push({
          itemId: item.itemId,
          annualValue: item.annualValue,
          annualUsage: item.annualUsage,
          valuePercentage: this.roundMoney(valuePercentage, 2),
          cumulativePercentage: this.roundMoney(cumulativePercentage, 2),
          classification,
          rank: index + 1
        });
      });

      return results;
    });
  }

  /**
   * Calculate FIFO cost
   */
  private async calculateFifoCost(input: StockValuationInput): Promise<Money> {
    if (!input.transactions || input.transactions.length === 0) {
      return input.averageCost || this.createMoney(0, 'USD');
    }

    const costLayers: FifoCostLayer[] = [];
    
    // Build FIFO cost layers from transactions
    input.transactions
      .filter(tx => tx.type === 'RECEIVE' && tx.unitCost)
      .forEach(tx => {
        costLayers.push({
          date: tx.date,
          quantity: tx.quantity,
          unitCost: tx.unitCost!,
          remainingQuantity: tx.quantity
        });
      });

    // Sort by date (oldest first for FIFO)
    costLayers.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate weighted average of remaining layers
    let totalCost = 0;
    let totalQuantity = 0;

    for (const layer of costLayers) {
      if (layer.remainingQuantity > 0) {
        totalCost += layer.remainingQuantity * layer.unitCost.amount;
        totalQuantity += layer.remainingQuantity;
      }
    }

    if (totalQuantity === 0) {
      return input.averageCost || this.createMoney(0, 'USD');
    }

    const avgCost = totalCost / totalQuantity;
    const currencyCode = costLayers[0]?.unitCost?.currency || 'USD';

    return this.createMoney(avgCost, currencyCode);
  }

  /**
   * Calculate LIFO cost
   */
  private async calculateLifoCost(input: StockValuationInput): Promise<Money> {
    if (!input.transactions || input.transactions.length === 0) {
      return input.averageCost || this.createMoney(0, 'USD');
    }

    const receivingTransactions = input.transactions
      .filter(tx => tx.type === 'RECEIVE' && tx.unitCost)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first for LIFO

    if (receivingTransactions.length === 0) {
      return input.averageCost || this.createMoney(0, 'USD');
    }

    // Return the most recent cost
    return receivingTransactions[0].unitCost!;
  }

  /**
   * Calculate moving average cost
   */
  private async calculateMovingAverageCost(input: StockValuationInput): Promise<Money> {
    if (input.averageCost) {
      return input.averageCost;
    }

    if (!input.transactions || input.transactions.length === 0) {
      return this.createMoney(0, 'USD');
    }

    const receivingTransactions = input.transactions
      .filter(tx => tx.type === 'RECEIVE' && tx.unitCost)
      .slice(-5); // Last 5 transactions for moving average

    if (receivingTransactions.length === 0) {
      return this.createMoney(0, 'USD');
    }

    const totalCost = receivingTransactions.reduce((sum, tx) => sum + tx.unitCost!.amount, 0);
    const avgCost = totalCost / receivingTransactions.length;
    const currencyCode = receivingTransactions[0].unitCost!.currency;

    return this.createMoney(avgCost, currencyCode);
  }

  /**
   * Calculate weighted average cost
   */
  private async calculateWeightedAverageCost(input: StockValuationInput): Promise<Money> {
    if (!input.transactions || input.transactions.length === 0) {
      return input.averageCost || this.createMoney(0, 'USD');
    }

    const receivingTransactions = input.transactions.filter(tx => tx.type === 'RECEIVE' && tx.unitCost);
    
    if (receivingTransactions.length === 0) {
      return input.averageCost || this.createMoney(0, 'USD');
    }

    let totalValue = 0;
    let totalQuantity = 0;

    receivingTransactions.forEach(tx => {
      totalValue += tx.quantity * tx.unitCost!.amount;
      totalQuantity += tx.quantity;
    });

    if (totalQuantity === 0) {
      return input.averageCost || this.createMoney(0, 'USD');
    }

    const weightedAvgCost = totalValue / totalQuantity;
    const currencyCode = receivingTransactions[0].unitCost!.currency;

    return this.createMoney(weightedAvgCost, currencyCode);
  }
}