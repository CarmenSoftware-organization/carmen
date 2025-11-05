/**
 * Centralized Inventory Valuation Service
 *
 * Provides application-wide inventory costing using FIFO or Periodic Average methods.
 * This is the single source of truth for all inventory valuations.
 *
 * See: docs/app/shared-methods/inventory-valuation/
 */

import { CostingMethod } from '@/lib/types'
import { InventorySettingsService } from '../settings/inventory-settings-service'
import { PeriodicAverageService, getCostWithCaching } from './periodic-average-service'

// ============================================================================
// Types
// ============================================================================

/**
 * FIFO layer consumption record
 */
export interface FIFOLayerConsumption {
  layerId: string
  lotNumber: string
  quantityConsumed: number
  unitCost: number
  totalCost: number
  receiptDate: Date
}

/**
 * Valuation result from cost calculation
 */
export interface ValuationResult {
  itemId: string
  quantity: number
  unitCost: number
  totalValue: number
  method: CostingMethod
  calculatedAt: Date

  // FIFO-specific data
  layersConsumed?: FIFOLayerConsumption[]

  // Periodic Average-specific data
  period?: Date
  averageCost?: number
}

/**
 * FIFO Layer entity
 */
interface FIFOLayer {
  id: string
  itemId: string
  lotNumber: string
  receiptDate: Date
  receiptNumber: string
  originalQuantity: number
  remainingQuantity: number
  unitCost: number
  totalCost: number
}

// ============================================================================
// Inventory Valuation Service
// ============================================================================

export class InventoryValuationService {
  private settingsService: InventorySettingsService
  private periodicService: PeriodicAverageService

  constructor() {
    this.settingsService = new InventorySettingsService()
    this.periodicService = new PeriodicAverageService()
  }

  /**
   * Calculate inventory valuation based on system costing method
   *
   * This is the main entry point for all inventory cost calculations.
   * Automatically uses the configured costing method (FIFO or Periodic Average).
   *
   * @param itemId - Inventory item identifier
   * @param quantity - Quantity to value
   * @param date - Transaction date
   * @returns Valuation result with cost breakdown
   * @throws Error if item not found or calculation fails
   *
   * @example
   * const result = await service.calculateInventoryValuation(
   *   'ITEM-123',
   *   100,
   *   new Date('2025-01-15')
   * )
   * console.log(`Cost: $${result.totalValue}`)
   */
  async calculateInventoryValuation(
    itemId: string,
    quantity: number,
    date: Date
  ): Promise<ValuationResult> {
    // Validate inputs
    this.validateInputs(itemId, quantity)

    // Get system costing method
    const method = await this.getCostingMethod()

    // Calculate based on method
    if (method === CostingMethod.FIFO) {
      return await this.calculateFIFOCost(itemId, quantity, date)
    } else {
      return await this.calculatePeriodicAverageCost(itemId, quantity, date)
    }
  }

  /**
   * Get the current system costing method
   *
   * @returns 'FIFO' or 'PERIODIC_AVERAGE'
   *
   * @example
   * const method = await service.getCostingMethod()
   * console.log(`Using ${method} costing`)
   */
  async getCostingMethod(): Promise<CostingMethod> {
    return await this.settingsService.getDefaultCostingMethod()
  }

  /**
   * Calculate cost using FIFO method
   *
   * Consumes oldest inventory layers first.
   *
   * @param itemId - Inventory item identifier
   * @param quantity - Quantity to cost
   * @param date - Transaction date
   * @returns Valuation result with layer consumption details
   * @private
   */
  private async calculateFIFOCost(
    itemId: string,
    quantity: number,
    date: Date
  ): Promise<ValuationResult> {
    // Get available FIFO layers (oldest first)
    const layers = await this.getFIFOLayers(itemId, date)

    if (layers.length === 0) {
      throw new Error(`No FIFO layers available for item ${itemId}`)
    }

    // Consume layers
    const consumption = this.consumeFIFOLayers(layers, quantity)

    if (consumption.totalConsumed < quantity) {
      throw new Error(
        `Insufficient FIFO layers for item ${itemId}. ` +
        `Required: ${quantity}, Available: ${consumption.totalConsumed}`
      )
    }

    // Calculate totals
    const totalValue = consumption.layersConsumed.reduce(
      (sum, layer) => sum + layer.totalCost,
      0
    )
    const unitCost = totalValue / quantity

    return {
      itemId,
      quantity,
      unitCost: this.round(unitCost, 4),
      totalValue: this.round(totalValue, 2),
      method: CostingMethod.FIFO,
      layersConsumed: consumption.layersConsumed,
      calculatedAt: new Date()
    }
  }

  /**
   * Calculate cost using Periodic Average method
   *
   * Uses monthly average cost for the transaction period.
   *
   * @param itemId - Inventory item identifier
   * @param quantity - Quantity to cost
   * @param date - Transaction date
   * @returns Valuation result with period average cost
   * @private
   */
  private async calculatePeriodicAverageCost(
    itemId: string,
    quantity: number,
    date: Date
  ): Promise<ValuationResult> {
    try {
      // Get cached cost or calculate
      const averageCost = await getCostWithCaching(
        this.periodicService,
        itemId,
        date
      )

      const totalValue = quantity * averageCost

      // Get period start for display
      const periodStart = new Date(date.getFullYear(), date.getMonth(), 1)

      return {
        itemId,
        quantity,
        unitCost: this.round(averageCost, 4),
        totalValue: this.round(totalValue, 2),
        method: CostingMethod.PERIODIC_AVERAGE,
        period: periodStart,
        averageCost: this.round(averageCost, 4),
        calculatedAt: new Date()
      }
    } catch (error) {
      // Try fallback strategies
      return await this.calculateWithFallback(itemId, quantity, date, error)
    }
  }

  /**
   * Fallback cost calculation strategies
   *
   * Used when primary calculation fails (e.g., no receipts in period)
   *
   * @param itemId - Inventory item identifier
   * @param quantity - Quantity to cost
   * @param date - Transaction date
   * @param originalError - Original error that triggered fallback
   * @returns Valuation result using fallback method
   * @private
   */
  private async calculateWithFallback(
    itemId: string,
    quantity: number,
    date: Date,
    originalError: any
  ): Promise<ValuationResult> {
    console.warn(`Primary cost calculation failed for item ${itemId}:`, originalError)

    // Strategy 1: Try previous period
    try {
      const previousMonth = new Date(date)
      previousMonth.setMonth(previousMonth.getMonth() - 1)

      const previousCost = await this.periodicService.getCachedCost(itemId, previousMonth)
      if (previousCost !== null) {
        console.log(`Using previous month cost: ${previousCost}`)
        return {
          itemId,
          quantity,
          unitCost: this.round(previousCost, 4),
          totalValue: this.round(quantity * previousCost, 2),
          method: CostingMethod.PERIODIC_AVERAGE,
          period: new Date(date.getFullYear(), date.getMonth(), 1),
          averageCost: this.round(previousCost, 4),
          calculatedAt: new Date()
        }
      }
    } catch (fallbackError) {
      console.warn('Previous period fallback failed:', fallbackError)
    }

    // Strategy 2: Use standard cost (if configured)
    // TODO: Implement standard cost lookup
    // const standardCost = await this.getStandardCost(itemId)

    // Strategy 3: Use latest purchase price
    // TODO: Implement latest purchase price lookup

    // If all fallbacks fail, throw the original error
    throw new Error(
      `Cannot determine cost for item ${itemId}. ` +
      `Original error: ${originalError.message}. ` +
      `No fallback cost available.`
    )
  }

  /**
   * Consume FIFO layers to satisfy quantity requirement
   *
   * @param layers - Available FIFO layers (sorted oldest first)
   * @param requiredQuantity - Quantity needed
   * @returns Consumption result
   * @private
   */
  private consumeFIFOLayers(
    layers: FIFOLayer[],
    requiredQuantity: number
  ): {
    layersConsumed: FIFOLayerConsumption[]
    totalConsumed: number
  } {
    const layersConsumed: FIFOLayerConsumption[] = []
    let remainingQuantity = requiredQuantity

    for (const layer of layers) {
      if (remainingQuantity <= 0) break

      const quantityToConsume = Math.min(
        layer.remainingQuantity,
        remainingQuantity
      )

      layersConsumed.push({
        layerId: layer.id,
        lotNumber: layer.lotNumber,
        quantityConsumed: quantityToConsume,
        unitCost: layer.unitCost,
        totalCost: quantityToConsume * layer.unitCost,
        receiptDate: layer.receiptDate
      })

      remainingQuantity -= quantityToConsume
    }

    return {
      layersConsumed,
      totalConsumed: requiredQuantity - remainingQuantity
    }
  }

  /**
   * Get FIFO layers for an item (oldest first)
   *
   * @param itemId - Inventory item identifier
   * @param asOfDate - Get layers as of this date
   * @returns Array of FIFO layers sorted by receipt date
   * @private
   */
  private async getFIFOLayers(
    itemId: string,
    asOfDate: Date
  ): Promise<FIFOLayer[]> {
    // TODO: Implement database query
    /*
    SELECT * FROM fifo_layers
    WHERE item_id = ?
      AND receipt_date <= ?
      AND remaining_quantity > 0
    ORDER BY receipt_date ASC, lot_number ASC
    */

    console.warn('getFIFOLayers not yet implemented', { itemId, asOfDate })
    return []
  }

  /**
   * Validate inputs
   *
   * @param itemId - Item identifier
   * @param quantity - Quantity to validate
   * @throws Error if invalid
   * @private
   */
  private validateInputs(itemId: string, quantity: number): void {
    if (!itemId || itemId.trim() === '') {
      throw new Error('Item ID is required')
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero')
    }

    if (!Number.isFinite(quantity)) {
      throw new Error('Quantity must be a valid number')
    }
  }

  /**
   * Round number to specified decimal places
   *
   * @param value - Value to round
   * @param decimals - Number of decimal places
   * @returns Rounded value
   * @private
   */
  private round(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals)
    return Math.round(value * multiplier) / multiplier
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick valuation for a single item
 *
 * @param itemId - Inventory item identifier
 * @param quantity - Quantity to value
 * @param date - Transaction date
 * @returns Valuation result
 *
 * @example
 * const result = await quickValuation('ITEM-123', 100, new Date())
 * console.log(`Total cost: $${result.totalValue}`)
 */
export async function quickValuation(
  itemId: string,
  quantity: number,
  date: Date = new Date()
): Promise<ValuationResult> {
  const service = new InventoryValuationService()
  return await service.calculateInventoryValuation(itemId, quantity, date)
}

/**
 * Batch valuations for multiple items
 *
 * @param items - Array of {itemId, quantity} objects
 * @param date - Transaction date for all items
 * @returns Array of valuation results
 *
 * @example
 * const results = await batchValuation([
 *   { itemId: 'ITEM-1', quantity: 100 },
 *   { itemId: 'ITEM-2', quantity: 50 }
 * ], new Date())
 */
export async function batchValuation(
  items: Array<{ itemId: string; quantity: number }>,
  date: Date = new Date()
): Promise<ValuationResult[]> {
  const service = new InventoryValuationService()

  return await Promise.all(
    items.map(item =>
      service.calculateInventoryValuation(item.itemId, item.quantity, date)
    )
  )
}

/**
 * Get current costing method
 *
 * @returns Current system costing method
 *
 * @example
 * const method = await getCurrentCostingMethod()
 * console.log(`System is using: ${method}`)
 */
export async function getCurrentCostingMethod(): Promise<CostingMethod> {
  const service = new InventoryValuationService()
  return await service.getCostingMethod()
}
