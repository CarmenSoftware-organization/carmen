/**
 * Inventory Valuation Service
 * 
 * Handles inventory valuation calculations, costing methods, 
 * ABC analysis, and comprehensive financial reporting.
 */

import { prisma, type PrismaClient } from '@/lib/db'
import { InventoryCalculations } from '../calculations/inventory-calculations'
import { CachedInventoryCalculations } from '../cache/cached-inventory-calculations'
import { FinancialCalculations } from '../calculations/financial-calculations'
import type { 
  CostingMethod,
  InventoryAging,
  SlowMovingInventory,
  InventoryAlert,
  InventoryAlertType
} from '@/lib/types/inventory'
import type { Money } from '@/lib/types/common'
import type { ABCAnalysisResult } from '../calculations/inventory-calculations'

/**
 * Inventory valuation summary
 */
export interface InventoryValuationSummary {
  totalValue: Money
  totalQuantity: number
  averageCostPerUnit: Money
  valuationMethod: CostingMethod
  valuationDate: Date
  byLocation: LocationValuation[]
  byCategory: CategoryValuation[]
  alerts: InventoryAlert[]
  trends: ValuationTrend[]
}

/**
 * Location valuation breakdown
 */
export interface LocationValuation {
  locationId: string
  locationName: string
  totalValue: Money
  totalQuantity: number
  itemCount: number
  averageTurnover: number
}

/**
 * Category valuation breakdown
 */
export interface CategoryValuation {
  categoryId: string
  categoryName: string
  totalValue: Money
  totalQuantity: number
  itemCount: number
  valuePercentage: number
}

/**
 * Valuation trend data
 */
export interface ValuationTrend {
  date: Date
  totalValue: Money
  totalQuantity: number
  averageCost: Money
  movementCount: number
}

/**
 * Cost analysis result
 */
export interface CostAnalysis {
  itemId: string
  itemName: string
  itemCode: string
  costingMethod: CostingMethod
  currentCost: Money
  standardCost?: Money
  averageCost: Money
  lastPurchaseCost?: Money
  costVariance: Money
  costVariancePercentage: number
  costTrend: 'increasing' | 'decreasing' | 'stable'
  recommendations: string[]
}

/**
 * Inventory aging analysis
 */
export interface AgingAnalysis {
  totalValue: Money
  totalQuantity: number
  ageRanges: {
    range: string
    value: Money
    quantity: number
    percentage: number
    items: InventoryAging[]
  }[]
  slowMovingItems: SlowMovingInventory[]
  recommendations: string[]
}

/**
 * ABC analysis summary
 */
export interface ABCAnalysisSummary {
  analysisDate: Date
  totalValue: Money
  totalItems: number
  aItems: {
    count: number
    valuePercentage: number
    items: ABCAnalysisResult[]
  }
  bItems: {
    count: number
    valuePercentage: number
    items: ABCAnalysisResult[]
  }
  cItems: {
    count: number
    valuePercentage: number
    items: ABCAnalysisResult[]
  }
  recommendations: {
    category: 'A' | 'B' | 'C'
    suggestions: string[]
  }[]
}

/**
 * Valuation filters
 */
export interface ValuationFilters {
  locationIds?: string[]
  categoryIds?: string[]
  itemIds?: string[]
  costingMethod?: CostingMethod
  valuationDate?: Date
  includeInactive?: boolean
  includeZeroStock?: boolean
  minimumValue?: number
  maximumValue?: number
}

/**
 * Service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    calculationTime?: number
    lastUpdated?: Date
    dataPoints?: number
  }
}

export class InventoryValuationService {
  private db: PrismaClient
  private inventoryCalculations: InventoryCalculations
  private cachedCalculations: CachedInventoryCalculations
  private financialCalculations: FinancialCalculations

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
    this.inventoryCalculations = new InventoryCalculations()
    this.cachedCalculations = new CachedInventoryCalculations()
    this.financialCalculations = new FinancialCalculations()
  }

  /**
   * Calculate complete inventory valuation
   */
  async calculateInventoryValuation(filters: ValuationFilters = {}): Promise<ServiceResult<InventoryValuationSummary>> {
    const startTime = Date.now()
    
    try {
      const valuationDate = filters.valuationDate || new Date()
      
      // Get all stock balances matching filters
      const stockBalances = await this.getFilteredStockBalances(filters)
      
      if (stockBalances.length === 0) {
        return {
          success: true,
          data: {
            totalValue: { amount: 0, currencyCode: 'USD' },
            totalQuantity: 0,
            averageCostPerUnit: { amount: 0, currencyCode: 'USD' },
            valuationMethod: filters.costingMethod || CostingMethod.WEIGHTED_AVERAGE,
            valuationDate,
            byLocation: [],
            byCategory: [],
            alerts: [],
            trends: []
          },
          metadata: {
            calculationTime: Date.now() - startTime,
            lastUpdated: valuationDate,
            dataPoints: 0
          }
        }
      }

      // Calculate total values
      let totalValue = 0
      let totalQuantity = 0
      const locationValuations = new Map<string, LocationValuation>()
      const categoryValuations = new Map<string, CategoryValuation>()

      for (const balance of stockBalances) {
        const itemValue = balance.total_value_amount
        const itemQuantity = balance.quantity_on_hand

        totalValue += itemValue
        totalQuantity += itemQuantity

        // Location breakdown
        if (!locationValuations.has(balance.location_id)) {
          locationValuations.set(balance.location_id, {
            locationId: balance.location_id,
            locationName: balance.locations?.name || 'Unknown Location',
            totalValue: { amount: 0, currencyCode: 'USD' },
            totalQuantity: 0,
            itemCount: 0,
            averageTurnover: 0
          })
        }
        const locationVal = locationValuations.get(balance.location_id)!
        locationVal.totalValue.amount += itemValue
        locationVal.totalQuantity += itemQuantity
        locationVal.itemCount += 1

        // Category breakdown
        const categoryId = balance.inventory_items?.category_id || 'uncategorized'
        if (!categoryValuations.has(categoryId)) {
          categoryValuations.set(categoryId, {
            categoryId,
            categoryName: balance.inventory_items?.categories?.name || 'Uncategorized',
            totalValue: { amount: 0, currencyCode: 'USD' },
            totalQuantity: 0,
            itemCount: 0,
            valuePercentage: 0
          })
        }
        const categoryVal = categoryValuations.get(categoryId)!
        categoryVal.totalValue.amount += itemValue
        categoryVal.totalQuantity += itemQuantity
        categoryVal.itemCount += 1
      }

      // Calculate category percentages
      categoryValuations.forEach(category => {
        category.valuePercentage = totalValue > 0 
          ? (category.totalValue.amount / totalValue) * 100 
          : 0
      })

      // Calculate average cost per unit
      const averageCostPerUnit = {
        amount: totalQuantity > 0 ? totalValue / totalQuantity : 0,
        currencyCode: 'USD'
      }

      // Generate alerts
      const alerts = await this.generateInventoryAlerts(stockBalances)

      // Get valuation trends (last 30 days)
      const trends = await this.getValuationTrends(filters, 30)

      const valuation: InventoryValuationSummary = {
        totalValue: { amount: totalValue, currencyCode: 'USD' },
        totalQuantity,
        averageCostPerUnit,
        valuationMethod: filters.costingMethod || CostingMethod.WEIGHTED_AVERAGE,
        valuationDate,
        byLocation: Array.from(locationValuations.values()),
        byCategory: Array.from(categoryValuations.values()),
        alerts,
        trends
      }

      return {
        success: true,
        data: valuation,
        metadata: {
          calculationTime: Date.now() - startTime,
          lastUpdated: valuationDate,
          dataPoints: stockBalances.length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate inventory valuation: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Perform ABC analysis on inventory
   */
  async performABCAnalysis(filters: ValuationFilters = {}): Promise<ServiceResult<ABCAnalysisSummary>> {
    try {
      const stockBalances = await this.getFilteredStockBalances(filters)
      
      if (stockBalances.length === 0) {
        return {
          success: false,
          error: 'No inventory data found for ABC analysis'
        }
      }

      // Prepare data for ABC analysis
      const analysisItems = stockBalances.map(balance => ({
        itemId: balance.item_id,
        annualValue: {
          amount: balance.total_value_amount,
          currencyCode: balance.total_value_currency
        },
        annualUsage: balance.quantity_on_hand // Simplified - should use actual annual usage
      }))

      const abcResult = await this.inventoryCalculations.performABCAnalysis({
        items: analysisItems,
        currencyCode: 'USD'
      })

      if (!abcResult.success || !abcResult.value) {
        return {
          success: false,
          error: 'Failed to perform ABC analysis calculation'
        }
      }

      const results = abcResult.value
      const totalValue = results.reduce((sum, item) => sum + item.annualValue.amount, 0)
      const totalItems = results.length

      // Group results by classification
      const aItems = results.filter(item => item.classification === 'A')
      const bItems = results.filter(item => item.classification === 'B')
      const cItems = results.filter(item => item.classification === 'C')

      const aValuePercentage = aItems.reduce((sum, item) => sum + item.valuePercentage, 0)
      const bValuePercentage = bItems.reduce((sum, item) => sum + item.valuePercentage, 0)
      const cValuePercentage = cItems.reduce((sum, item) => sum + item.valuePercentage, 0)

      // Generate recommendations
      const recommendations = [
        {
          category: 'A' as const,
          suggestions: [
            'Implement tight inventory control',
            'Frequent reviews and accurate records',
            'Consider just-in-time ordering',
            'Negotiate better supplier terms',
            'Monitor stock levels daily'
          ]
        },
        {
          category: 'B' as const,
          suggestions: [
            'Regular review and control',
            'Automated reordering systems',
            'Monthly stock reviews',
            'Good supplier relationships'
          ]
        },
        {
          category: 'C' as const,
          suggestions: [
            'Simple controls and procedures',
            'Bulk ordering to reduce costs',
            'Quarterly reviews sufficient',
            'Consider elimination of slow-moving items'
          ]
        }
      ]

      const summary: ABCAnalysisSummary = {
        analysisDate: new Date(),
        totalValue: { amount: totalValue, currencyCode: 'USD' },
        totalItems,
        aItems: {
          count: aItems.length,
          valuePercentage: Math.round(aValuePercentage * 100) / 100,
          items: aItems
        },
        bItems: {
          count: bItems.length,
          valuePercentage: Math.round(bValuePercentage * 100) / 100,
          items: bItems
        },
        cItems: {
          count: cItems.length,
          valuePercentage: Math.round(cValuePercentage * 100) / 100,
          items: cItems
        },
        recommendations
      }

      return {
        success: true,
        data: summary
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to perform ABC analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate inventory aging analysis
   */
  async generateAgingAnalysis(filters: ValuationFilters = {}): Promise<ServiceResult<AgingAnalysis>> {
    try {
      const stockBalances = await this.getFilteredStockBalances(filters)
      const currentDate = new Date()

      // Calculate aging for each item
      const agingItems: InventoryAging[] = stockBalances.map(balance => {
        const lastMovementDate = balance.last_movement_date || balance.created_at
        const daysSinceMovement = Math.floor(
          (currentDate.getTime() - lastMovementDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Define age ranges
        const ageRanges = [
          { range: '0-30 days', quantity: 0, value: { amount: 0, currencyCode: 'USD' } },
          { range: '31-60 days', quantity: 0, value: { amount: 0, currencyCode: 'USD' } },
          { range: '61-90 days', quantity: 0, value: { amount: 0, currencyCode: 'USD' } },
          { range: '91-180 days', quantity: 0, value: { amount: 0, currencyCode: 'USD' } },
          { range: '180+ days', quantity: 0, value: { amount: 0, currencyCode: 'USD' } }
        ]

        // Assign to appropriate age range
        let rangeIndex = 4 // Default to 180+ days
        if (daysSinceMovement <= 30) rangeIndex = 0
        else if (daysSinceMovement <= 60) rangeIndex = 1
        else if (daysSinceMovement <= 90) rangeIndex = 2
        else if (daysSinceMovement <= 180) rangeIndex = 3

        ageRanges[rangeIndex].quantity = balance.quantity_on_hand
        ageRanges[rangeIndex].value.amount = balance.total_value_amount

        return {
          itemId: balance.item_id,
          itemName: balance.inventory_items?.item_name || 'Unknown',
          currentQuantity: balance.quantity_on_hand,
          value: {
            amount: balance.total_value_amount,
            currencyCode: balance.total_value_currency
          },
          ageRanges,
          averageAge: daysSinceMovement,
          lastMovementDate
        }
      })

      // Aggregate age ranges
      const totalAgeRanges = [
        { range: '0-30 days', value: { amount: 0, currencyCode: 'USD' }, quantity: 0, percentage: 0, items: [] as InventoryAging[] },
        { range: '31-60 days', value: { amount: 0, currencyCode: 'USD' }, quantity: 0, percentage: 0, items: [] as InventoryAging[] },
        { range: '61-90 days', value: { amount: 0, currencyCode: 'USD' }, quantity: 0, percentage: 0, items: [] as InventoryAging[] },
        { range: '91-180 days', value: { amount: 0, currencyCode: 'USD' }, quantity: 0, percentage: 0, items: [] as InventoryAging[] },
        { range: '180+ days', value: { amount: 0, currencyCode: 'USD' }, quantity: 0, percentage: 0, items: [] as InventoryAging[] }
      ]

      let totalValue = 0
      let totalQuantity = 0

      agingItems.forEach(item => {
        totalValue += item.value.amount
        totalQuantity += item.currentQuantity

        // Add to appropriate age range
        item.ageRanges.forEach((range, index) => {
          if (range.quantity > 0) {
            totalAgeRanges[index].value.amount += range.value.amount
            totalAgeRanges[index].quantity += range.quantity
            totalAgeRanges[index].items.push(item)
          }
        })
      })

      // Calculate percentages
      totalAgeRanges.forEach(range => {
        range.percentage = totalValue > 0 ? (range.value.amount / totalValue) * 100 : 0
      })

      // Identify slow-moving items (items with no movement in 90+ days)
      const slowMovingItems: SlowMovingInventory[] = agingItems
        .filter(item => item.averageAge > 90)
        .map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          currentQuantity: item.currentQuantity,
          value: item.value,
          lastMovementDate: item.lastMovementDate,
          daysSinceLastMovement: item.averageAge,
          averageMonthlyUsage: 0, // Would need historical data
          monthsOfStock: item.averageAge > 30 ? item.averageAge / 30 : 0,
          recommendation: item.averageAge > 180 ? 'write_off' : 
                         item.averageAge > 120 ? 'liquidate' : 'review'
        }))

      // Generate recommendations
      const recommendations = []
      if (totalAgeRanges[4].percentage > 20) {
        recommendations.push('Consider liquidating items aged 180+ days')
        recommendations.push('Review procurement processes for slow-moving items')
      }
      if (totalAgeRanges[3].percentage > 15) {
        recommendations.push('Monitor items aged 91-180 days for movement')
      }
      if (slowMovingItems.length > agingItems.length * 0.1) {
        recommendations.push('Implement better demand forecasting')
        recommendations.push('Consider returning slow-moving items to suppliers')
      }

      const analysis: AgingAnalysis = {
        totalValue: { amount: totalValue, currencyCode: 'USD' },
        totalQuantity,
        ageRanges: totalAgeRanges,
        slowMovingItems,
        recommendations
      }

      return {
        success: true,
        data: analysis
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate aging analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Analyze cost variances
   */
  async analyzeCostVariances(filters: ValuationFilters = {}): Promise<ServiceResult<CostAnalysis[]>> {
    try {
      const stockBalances = await this.getFilteredStockBalances(filters)
      
      const analyses: CostAnalysis[] = []

      for (const balance of stockBalances) {
        const currentCost = {
          amount: balance.average_cost_amount,
          currencyCode: balance.average_cost_currency
        }

        const standardCost = balance.inventory_items?.last_purchase_price_amount ? {
          amount: balance.inventory_items.last_purchase_price_amount,
          currencyCode: balance.inventory_items.last_purchase_price_currency || 'USD'
        } : undefined

        const lastPurchaseCost = standardCost // Using same data for now

        // Calculate variance
        let costVariance = { amount: 0, currencyCode: 'USD' }
        let costVariancePercentage = 0
        
        if (standardCost) {
          costVariance = {
            amount: currentCost.amount - standardCost.amount,
            currencyCode: currentCost.currencyCode
          }
          costVariancePercentage = standardCost.amount !== 0 
            ? (costVariance.amount / standardCost.amount) * 100 
            : 0
        }

        // Determine cost trend (simplified)
        let costTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
        if (Math.abs(costVariancePercentage) > 5) {
          costTrend = costVariancePercentage > 0 ? 'increasing' : 'decreasing'
        }

        // Generate recommendations
        const recommendations = []
        if (Math.abs(costVariancePercentage) > 15) {
          recommendations.push('Significant cost variance detected - review pricing')
          if (costVariancePercentage > 0) {
            recommendations.push('Consider alternative suppliers')
            recommendations.push('Negotiate better pricing terms')
          }
        }
        if (costTrend === 'increasing') {
          recommendations.push('Monitor cost increases closely')
          recommendations.push('Review market conditions')
        }

        analyses.push({
          itemId: balance.item_id,
          itemName: balance.inventory_items?.item_name || 'Unknown',
          itemCode: balance.inventory_items?.item_code || 'Unknown',
          costingMethod: balance.inventory_items?.costing_method as CostingMethod || CostingMethod.WEIGHTED_AVERAGE,
          currentCost,
          standardCost,
          averageCost: currentCost, // Same as current for now
          lastPurchaseCost,
          costVariance,
          costVariancePercentage: Math.round(costVariancePercentage * 100) / 100,
          costTrend,
          recommendations
        })
      }

      // Sort by highest variance
      analyses.sort((a, b) => Math.abs(b.costVariancePercentage) - Math.abs(a.costVariancePercentage))

      return {
        success: true,
        data: analyses
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze cost variances: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get filtered stock balances
   */
  private async getFilteredStockBalances(filters: ValuationFilters): Promise<any[]> {
    const whereClause: any = {}

    if (filters.locationIds && filters.locationIds.length > 0) {
      whereClause.location_id = { in: filters.locationIds }
    }

    if (filters.itemIds && filters.itemIds.length > 0) {
      whereClause.item_id = { in: filters.itemIds }
    }

    if (!filters.includeZeroStock) {
      whereClause.quantity_on_hand = { gt: 0 }
    }

    if (filters.minimumValue !== undefined) {
      whereClause.total_value_amount = { 
        ...whereClause.total_value_amount,
        gte: filters.minimumValue 
      }
    }

    if (filters.maximumValue !== undefined) {
      whereClause.total_value_amount = { 
        ...whereClause.total_value_amount,
        lte: filters.maximumValue 
      }
    }

    // Filter by item properties
    const itemWhereClause: any = {}

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      itemWhereClause.category_id = { in: filters.categoryIds }
    }

    if (!filters.includeInactive) {
      itemWhereClause.is_active = true
    }

    if (filters.costingMethod) {
      itemWhereClause.costing_method = filters.costingMethod
    }

    if (Object.keys(itemWhereClause).length > 0) {
      whereClause.inventory_items = itemWhereClause
    }

    return await this.db.stock_balances.findMany({
      where: whereClause,
      include: {
        inventory_items: {
          include: {
            categories: true
          }
        },
        locations: true
      }
    })
  }

  /**
   * Generate inventory alerts
   */
  private async generateInventoryAlerts(stockBalances: any[]): Promise<InventoryAlert[]> {
    const alerts: InventoryAlert[] = []
    const currentDate = new Date()

    for (const balance of stockBalances) {
      // Low stock alert
      if (balance.inventory_items?.reorder_point && 
          balance.quantity_on_hand <= balance.inventory_items.reorder_point) {
        alerts.push({
          id: `alert-${balance.item_id}-lowstock`,
          alertType: InventoryAlertType.LOW_STOCK,
          itemId: balance.item_id,
          locationId: balance.location_id,
          severity: balance.quantity_on_hand === 0 ? 'critical' : 'medium',
          message: `Stock level (${balance.quantity_on_hand}) is below reorder point (${balance.inventory_items.reorder_point})`,
          currentQuantity: balance.quantity_on_hand,
          thresholdQuantity: balance.inventory_items.reorder_point,
          isActive: true,
          createdAt: currentDate,
          updatedAt: currentDate,
          createdBy: 'system'
        })
      }

      // Out of stock alert
      if (balance.quantity_on_hand === 0) {
        alerts.push({
          id: `alert-${balance.item_id}-outofstock`,
          alertType: InventoryAlertType.OUT_OF_STOCK,
          itemId: balance.item_id,
          locationId: balance.location_id,
          severity: 'critical',
          message: 'Item is out of stock',
          currentQuantity: 0,
          isActive: true,
          createdAt: currentDate,
          updatedAt: currentDate,
          createdBy: 'system'
        })
      }

      // Overstock alert (simplified logic)
      if (balance.inventory_items?.maximum_quantity &&
          balance.quantity_on_hand > balance.inventory_items.maximum_quantity) {
        alerts.push({
          id: `alert-${balance.item_id}-overstock`,
          alertType: InventoryAlertType.OVERSTOCK,
          itemId: balance.item_id,
          locationId: balance.location_id,
          severity: 'low',
          message: `Stock level (${balance.quantity_on_hand}) exceeds maximum (${balance.inventory_items.maximum_quantity})`,
          currentQuantity: balance.quantity_on_hand,
          thresholdQuantity: balance.inventory_items.maximum_quantity,
          isActive: true,
          createdAt: currentDate,
          updatedAt: currentDate,
          createdBy: 'system'
        })
      }
    }

    return alerts
  }

  /**
   * Get valuation trends
   */
  private async getValuationTrends(filters: ValuationFilters, days: number): Promise<ValuationTrend[]> {
    // This would typically query historical data
    // For now, return mock trend data
    const trends: ValuationTrend[] = []
    const endDate = new Date()
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(endDate)
      date.setDate(date.getDate() - i)
      
      // Mock data - in reality would query actual historical values
      trends.push({
        date,
        totalValue: { amount: 100000 + Math.random() * 50000, currencyCode: 'USD' },
        totalQuantity: 1000 + Math.floor(Math.random() * 500),
        averageCost: { amount: 100 + Math.random() * 50, currencyCode: 'USD' },
        movementCount: Math.floor(Math.random() * 50)
      })
    }

    return trends
  }
}

// Export singleton instance
export const inventoryValuationService = new InventoryValuationService()