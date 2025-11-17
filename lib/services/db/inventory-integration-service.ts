/**
 * Inventory Integration Service
 * 
 * Handles integration between inventory management and other services
 * including procurement, products, vendors, and financial calculations.
 */

import { inventoryService } from './inventory-service'
import { stockMovementService } from './stock-movement-service'
import { productService } from './product-service'
import { vendorService } from './vendor-service'
import { purchaseOrderService } from './purchase-order-service'
import { purchaseRequestService } from './purchase-request-service'
import { InventoryCalculations } from '../calculations/inventory-calculations'
import { FinancialCalculations } from '../calculations/financial-calculations'
import { TransactionType, CostingMethod } from '@/lib/types/inventory'
import type {
  InventoryItem,
  StockBalance
} from '@/lib/types/inventory'
import type { 
  PurchaseOrder, 
  PurchaseOrderItem,
  PurchaseRequest,
  PurchaseRequestItem
} from '@/lib/types/procurement'
import type { Product } from '@/lib/types/product'
import type { Vendor } from '@/lib/types/vendor'
import type { Money } from '@/lib/types/common'

/**
 * Purchase order receipt input
 */
export interface ReceivePurchaseOrderInput {
  purchaseOrderId: string
  receivedItems: {
    itemId: string
    receivedQuantity: number
    unitCost: Money
    batchNo?: string
    lotNo?: string
    expiryDate?: Date
    inspectionNotes?: string
  }[]
  receivedBy: string
  receivedDate?: Date
  locationId: string
  notes?: string
}

/**
 * Product to inventory sync input
 */
export interface SyncProductToInventoryInput {
  productId: string
  locationId: string
  initialQuantity?: number
  initialCost?: Money
  createdBy: string
}

/**
 * Vendor performance metrics
 */
export interface VendorInventoryMetrics {
  vendorId: string
  vendorName: string
  totalItemsSupplied: number
  totalValueReceived: Money
  averageLeadTime: number
  qualityRating: number
  onTimeDeliveryRate: number
  defectRate: number
  lastDeliveryDate?: Date
  topSuppliedItems: {
    itemId: string
    itemName: string
    totalQuantity: number
    totalValue: Money
  }[]
}

/**
 * Reorder suggestions
 */
export interface ReorderSuggestion {
  itemId: string
  itemName: string
  currentStock: number
  reorderPoint: number
  suggestedOrderQuantity: number
  preferredVendorId?: string
  preferredVendorName?: string
  estimatedCost: Money
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  leadTimeDays: number
  stockoutRisk: number
}

/**
 * Service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
}

export class InventoryIntegrationService {
  private inventoryCalculations: InventoryCalculations
  private financialCalculations: FinancialCalculations

  constructor() {
    this.inventoryCalculations = new InventoryCalculations()
    this.financialCalculations = new FinancialCalculations()
  }

  /**
   * Receive goods from purchase order and update inventory
   */
  async receivePurchaseOrder(input: ReceivePurchaseOrderInput): Promise<ServiceResult<{
    transactions: any[]
    updatedStockBalances: StockBalance[]
    warnings: string[]
  }>> {
    try {
      const warnings: string[] = []

      // Get purchase order details
      const poResult = await purchaseOrderService.getPurchaseOrderById(input.purchaseOrderId)
      if (!poResult.success || !poResult.data) {
        return {
          success: false,
          error: `Purchase order not found: ${input.purchaseOrderId}`
        }
      }

      const purchaseOrder = poResult.data
      const transactions: any[] = []
      const updatedStockBalances: StockBalance[] = []

      // Process each received item
      for (const receivedItem of input.receivedItems) {
        // Note: PO items validation would be done in the purchase order service
        // This service focuses on inventory transactions

        // Record inventory transaction
        const transactionResult = await inventoryService.recordInventoryTransaction({
          itemId: receivedItem.itemId,
          locationId: input.locationId,
          transactionType: TransactionType.RECEIVE,
          quantity: receivedItem.receivedQuantity,
          unitCost: receivedItem.unitCost,
          transactionDate: input.receivedDate,
          referenceNo: purchaseOrder.orderNumber,
          referenceType: 'PURCHASE_ORDER',
          batchNo: receivedItem.batchNo,
          lotNo: receivedItem.lotNo,
          expiryDate: receivedItem.expiryDate,
          notes: `PO Receipt: ${input.notes || ''} | ${receivedItem.inspectionNotes || ''}`,
          userId: input.receivedBy
        })

        if (!transactionResult.success) {
          warnings.push(`Failed to record transaction for item ${receivedItem.itemId}: ${transactionResult.error}`)
          continue
        }

        if (transactionResult.data) {
          transactions.push(transactionResult.data.transaction)
          updatedStockBalances.push(transactionResult.data.newBalance)
        }

        // Update product's last purchase information
        await this.updateProductLastPurchase(
          receivedItem.itemId,
          receivedItem.unitCost,
          input.receivedDate || new Date(),
          input.receivedBy
        )
      }

      // Update purchase order status if fully received
      await this.checkAndUpdatePurchaseOrderStatus(input.purchaseOrderId)

      return {
        success: true,
        data: {
          transactions,
          updatedStockBalances,
          warnings
        },
        warnings
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to receive purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Issue inventory for purchase request fulfillment
   */
  async issueToPurchaseRequest(
    purchaseRequestId: string, 
    issuedBy: string,
    locationId: string
  ): Promise<ServiceResult<{
    transactions: any[]
    updatedStockBalances: StockBalance[]
  }>> {
    try {
      // Get purchase request details
      const prResult = await purchaseRequestService.getPurchaseRequestById(purchaseRequestId)
      if (!prResult.success || !prResult.data) {
        return {
          success: false,
          error: `Purchase request not found: ${purchaseRequestId}`
        }
      }

      const purchaseRequest = prResult.data
      const transactions: any[] = []
      const updatedStockBalances: StockBalance[] = []

      // Process each item in the purchase request
      for (const prItem of purchaseRequest.items || []) {
        // Check stock availability
        const balanceResult = await inventoryService.getStockBalance(prItem.itemId || '', locationId)
        if (!balanceResult.success || !balanceResult.data) {
          continue
        }

        const balance = balanceResult.data
        if (balance.quantityAvailable < prItem.requestedQuantity) {
          continue // Skip if insufficient stock
        }

        // Record inventory transaction
        const transactionResult = await inventoryService.recordInventoryTransaction({
          itemId: prItem.itemId || '',
          locationId: locationId,
          transactionType: TransactionType.ISSUE,
          quantity: prItem.requestedQuantity,
          unitCost: balance.averageCost,
          referenceNo: purchaseRequest.requestNumber,
          referenceType: 'PURCHASE_REQUEST',
          notes: `Issued for PR: ${purchaseRequest.requestNumber}`,
          userId: issuedBy
        })

        if (transactionResult.success && transactionResult.data) {
          transactions.push(transactionResult.data.transaction)
          updatedStockBalances.push(transactionResult.data.newBalance)
        }
      }

      return {
        success: true,
        data: {
          transactions,
          updatedStockBalances
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to issue to purchase request: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Sync product to inventory system
   */
  async syncProductToInventory(input: SyncProductToInventoryInput): Promise<ServiceResult<InventoryItem>> {
    try {
      // Get product details
      const productResult = await productService.getProductById(input.productId)
      if (!productResult.success || !productResult.data) {
        return {
          success: false,
          error: `Product not found: ${input.productId}`
        }
      }

      const product = productResult.data

      // Check if inventory item already exists
      const existingItems = await inventoryService.getInventoryItems({
        search: product.productCode
      })

      if (existingItems.success && existingItems.data && existingItems.data.length > 0) {
        return {
          success: false,
          error: `Inventory item already exists for product: ${product.productCode}`
        }
      }

      // Create inventory item from product
      const inventoryItemInput = {
        itemCode: product.productCode,
        itemName: product.productName,
        description: product.description,
        categoryId: product.categoryId,
        baseUnitId: product.baseUnit,
        costingMethod: CostingMethod.PERIODIC_AVERAGE,
        isActive: product.isActive,
        isSerialized: product.isSerialTrackingRequired,
        minimumQuantity: product.minimumOrderQuantity,
        maximumQuantity: product.maximumOrderQuantity,
        reorderPoint: product.minimumOrderQuantity,
        reorderQuantity: product.standardOrderQuantity,
        leadTimeDays: product.leadTimeDays,
        createdBy: input.createdBy
      }

      const itemResult = await inventoryService.createInventoryItem(inventoryItemInput)
      if (!itemResult.success || !itemResult.data) {
        return {
          success: false,
          error: `Failed to create inventory item: ${itemResult.error}`
        }
      }

      // Create initial stock balance if specified
      if (input.initialQuantity && input.initialQuantity > 0 && input.initialCost) {
        await inventoryService.upsertStockBalance({
          itemId: itemResult.data.id,
          locationId: input.locationId,
          quantityOnHand: input.initialQuantity,
          quantityReserved: 0,
          averageCost: input.initialCost,
          createdBy: input.createdBy
        })

        // Record initial transaction
        await inventoryService.recordInventoryTransaction({
          itemId: itemResult.data.id,
          locationId: input.locationId,
          transactionType: TransactionType.ADJUST_UP,
          quantity: input.initialQuantity,
          unitCost: input.initialCost,
          referenceNo: 'INITIAL_STOCK',
          referenceType: 'PRODUCT_SYNC',
          notes: 'Initial stock from product synchronization',
          userId: input.createdBy
        })
      }

      return {
        success: true,
        data: itemResult.data
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to sync product to inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate reorder suggestions based on current stock levels
   */
  async generateReorderSuggestions(locationId?: string): Promise<ServiceResult<ReorderSuggestion[]>> {
    try {
      // Get all inventory items with low stock or at reorder point
      const filters = {
        isActive: true,
        isLowStock: true,
        locationIds: locationId ? [locationId] : undefined
      }

      const itemsResult = await inventoryService.getInventoryItems(filters)
      if (!itemsResult.success || !itemsResult.data) {
        return {
          success: false,
          error: 'Failed to fetch inventory items for reorder suggestions'
        }
      }

      const suggestions: ReorderSuggestion[] = []

      for (const item of itemsResult.data) {
        // Calculate current total stock (simplified - would use actual stock balances)
        const currentStock = 0 // Would be calculated from actual balances

        if (item.reorderPoint && currentStock <= item.reorderPoint) {
          // Get preferred vendor (simplified)
          const preferredVendor = item.id ? await this.getPreferredVendorForItem(item.id) : null

          // Calculate suggested order quantity
          const suggestedQuantity = item.reorderQuantity || (item.reorderPoint || 0) * 2

          // Estimate cost
          const estimatedCost = {
            amount: suggestedQuantity * (preferredVendor?.lastPrice || 10), // Simplified
            currency: 'USD'
          }

          // Determine urgency
          const stockoutRisk = item.reorderPoint ? (currentStock / item.reorderPoint) * 100 : 0
          const urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 
            stockoutRisk <= 25 ? 'critical' :
            stockoutRisk <= 50 ? 'high' :
            stockoutRisk <= 75 ? 'medium' : 'low'

          suggestions.push({
            itemId: item.id,
            itemName: item.itemName,
            currentStock,
            reorderPoint: item.reorderPoint,
            suggestedOrderQuantity: suggestedQuantity,
            preferredVendorId: preferredVendor?.vendorId,
            preferredVendorName: preferredVendor?.vendorName,
            estimatedCost,
            urgencyLevel,
            leadTimeDays: item.leadTime || 7,
            stockoutRisk
          })
        }
      }

      // Sort by urgency (critical first)
      suggestions.sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]
      })

      return {
        success: true,
        data: suggestions
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate reorder suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Calculate vendor performance metrics based on inventory data
   */
  async calculateVendorInventoryMetrics(vendorId: string): Promise<ServiceResult<VendorInventoryMetrics>> {
    try {
      // Get vendor details
      const vendorResult = await vendorService.getVendorById(vendorId)
      if (!vendorResult.success || !vendorResult.data) {
        return {
          success: false,
          error: `Vendor not found: ${vendorId}`
        }
      }

      const vendor = vendorResult.data

      // Mock implementation - in reality would query actual transaction data
      const metrics: VendorInventoryMetrics = {
        vendorId: vendor.id,
        vendorName: vendor.companyName,
        totalItemsSupplied: 25,
        totalValueReceived: { amount: 125000.00, currency: 'USD' },
        averageLeadTime: 7.5,
        qualityRating: 4.2,
        onTimeDeliveryRate: 92.5,
        defectRate: 1.8,
        lastDeliveryDate: new Date('2024-01-10'),
        topSuppliedItems: [
          {
            itemId: 'item-001',
            itemName: 'Raw Material A',
            totalQuantity: 1000,
            totalValue: { amount: 50000.00, currency: 'USD' }
          },
          {
            itemId: 'item-002',
            itemName: 'Component B',
            totalQuantity: 500,
            totalValue: { amount: 30000.00, currency: 'USD' }
          }
        ]
      }

      return {
        success: true,
        data: metrics
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate vendor metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update product's last purchase information
   */
  private async updateProductLastPurchase(
    itemId: string, 
    unitCost: Money, 
    purchaseDate: Date, 
    updatedBy: string
  ): Promise<void> {
    try {
      // In a real implementation, you'd update the product record
      // For now, this is a placeholder
      console.log(`Would update product ${itemId} with last purchase: ${unitCost.amount} ${unitCost.currency} on ${purchaseDate}`)
    } catch (error) {
      console.error('Failed to update product last purchase:', error)
    }
  }

  /**
   * Check and update purchase order status based on received quantities
   */
  private async checkAndUpdatePurchaseOrderStatus(purchaseOrderId: string): Promise<void> {
    try {
      // In a real implementation, you'd check if all items are received
      // and update the PO status accordingly
      console.log(`Would check and update PO status for ${purchaseOrderId}`)
    } catch (error) {
      console.error('Failed to update purchase order status:', error)
    }
  }

  /**
   * Get preferred vendor for an item based on purchase history
   */
  private async getPreferredVendorForItem(itemId: string): Promise<{
    vendorId: string
    vendorName: string
    lastPrice: number
  } | null> {
    try {
      // Mock implementation - would query actual purchase history
      return {
        vendorId: 'vendor-001',
        vendorName: 'Preferred Supplier Ltd.',
        lastPrice: 25.00
      }
    } catch (error) {
      return null
    }
  }
}

// Export singleton instance
export const inventoryIntegrationService = new InventoryIntegrationService()