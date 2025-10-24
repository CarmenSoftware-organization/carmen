/**
 * Purchase Order Service
 * 
 * Comprehensive service for managing purchase orders with complete lifecycle management,
 * vendor integration, delivery tracking, and financial integration.
 * 
 * Features:
 * - Complete PO lifecycle management (draft → sent → confirmed → received → closed)
 * - Conversion from approved purchase requests to purchase orders
 * - Vendor integration and communication workflows
 * - Delivery tracking and receiving management
 * - Invoice matching and financial integration
 * - Advanced reporting and analytics
 */

import { PrismaClient } from '@prisma/client'
import { 
  PurchaseOrder, 
  PurchaseOrderItem,
  PurchaseOrderTerms,
  PurchaseRequest,
  PurchaseRequestItem,
  Money,
  ServiceResult,
  PaginationOptions,
  DocumentStatus
} from '@/lib/types'
import { FinancialCalculations } from '@/lib/services/calculations/financial-calculations'
import { VendorService } from './vendor-service'
import { ProductService } from './product-service'
import { PurchaseRequestService } from './purchase-request-service'

// Initialize Prisma client
const prisma = new PrismaClient()

export interface PurchaseOrderFilters {
  status?: ('draft' | 'sent' | 'acknowledged' | 'partial_received' | 'fully_received' | 'cancelled' | 'closed')[]
  vendorId?: string
  orderDateFrom?: Date
  orderDateTo?: Date
  expectedDeliveryFrom?: Date
  expectedDeliveryTo?: Date
  currency?: string[]
  search?: string
  minAmount?: number
  maxAmount?: number
  locationId?: string
  approvedBy?: string
}

export interface CreatePurchaseOrderInput {
  vendorId: string
  currency: string
  exchangeRate?: number
  deliveryLocationId: string
  expectedDeliveryDate: Date
  paymentTerms: string
  terms: PurchaseOrderTerms
  approvedBy: string
  notes?: string
  items: CreatePurchaseOrderItemInput[]
  sourceRequestId?: string
}

export interface CreatePurchaseOrderItemInput {
  itemId?: string
  itemCode?: string
  itemName: string
  description: string
  specification?: string
  orderedQuantity: number
  unit: string
  unitPrice: Money
  discount?: number // percentage
  taxRate?: number // percentage
  deliveryDate: Date
  notes?: string
  sourceRequestItemId?: string
}

export interface UpdatePurchaseOrderInput {
  expectedDeliveryDate?: Date
  paymentTerms?: string
  terms?: Partial<PurchaseOrderTerms>
  notes?: string
}

export interface UpdatePurchaseOrderItemInput {
  orderedQuantity?: number
  unitPrice?: Money
  discount?: number
  taxRate?: number
  deliveryDate?: Date
  notes?: string
}

export interface ReceiveOrderInput {
  receivedBy: string
  receivedDate: Date
  items: ReceiveOrderItemInput[]
  notes?: string
  createGRN?: boolean
}

export interface ReceiveOrderItemInput {
  itemId: string
  receivedQuantity: number
  rejectedQuantity?: number
  damagedQuantity?: number
  qualityStatus?: 'passed' | 'failed' | 'conditional'
  batchNumber?: string
  expiryDate?: Date
  notes?: string
}

export interface VendorAcknowledgment {
  acknowledgedBy: string
  acknowledgedDate: Date
  confirmedDeliveryDate?: Date
  estimatedShippingDate?: Date
  trackingNumber?: string
  comments?: string
  itemAdjustments?: {
    itemId: string
    confirmedQuantity: number
    confirmedPrice?: Money
    confirmedDeliveryDate?: Date
    substituteItem?: string
    comments?: string
  }[]
}

export class PurchaseOrderService {
  private db: PrismaClient
  private financialCalculations: FinancialCalculations
  private vendorService: VendorService
  private productService: ProductService
  private purchaseRequestService: PurchaseRequestService

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
    this.financialCalculations = new FinancialCalculations()
    this.vendorService = new VendorService(this.db)
    this.productService = new ProductService(this.db)
    this.purchaseRequestService = new PurchaseRequestService(this.db)
  }

  /**
   * Get purchase orders with filtering and pagination
   */
  async getPurchaseOrders(
    filters: PurchaseOrderFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<PurchaseOrder[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'orderDate',
        sortOrder = 'desc'
      } = pagination

      const offset = (page - 1) * limit

      // Build where clause
      const whereClause: any = {}

      if (filters.status && filters.status.length > 0) {
        whereClause.status = { in: filters.status }
      }

      if (filters.vendorId) {
        whereClause.vendor_id = filters.vendorId
      }

      if (filters.currency && filters.currency.length > 0) {
        whereClause.currency = { in: filters.currency }
      }

      if (filters.locationId) {
        whereClause.delivery_location_id = filters.locationId
      }

      if (filters.approvedBy) {
        whereClause.approved_by = filters.approvedBy
      }

      if (filters.orderDateFrom || filters.orderDateTo) {
        whereClause.order_date = {}
        if (filters.orderDateFrom) {
          whereClause.order_date.gte = filters.orderDateFrom
        }
        if (filters.orderDateTo) {
          whereClause.order_date.lte = filters.orderDateTo
        }
      }

      if (filters.expectedDeliveryFrom || filters.expectedDeliveryTo) {
        whereClause.expected_delivery_date = {}
        if (filters.expectedDeliveryFrom) {
          whereClause.expected_delivery_date.gte = filters.expectedDeliveryFrom
        }
        if (filters.expectedDeliveryTo) {
          whereClause.expected_delivery_date.lte = filters.expectedDeliveryTo
        }
      }

      if (filters.search) {
        whereClause.OR = [
          { order_number: { contains: filters.search, mode: 'insensitive' } },
          { vendor_name: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // Amount filtering would require aggregation
      if (filters.minAmount || filters.maxAmount) {
        if (filters.minAmount) {
          whereClause.total_amount = { gte: filters.minAmount }
        }
        if (filters.maxAmount) {
          whereClause.total_amount = { ...whereClause.total_amount, lte: filters.maxAmount }
        }
      }

      const [purchaseOrders, total] = await Promise.all([
        this.db.purchase_orders.findMany({
          where: whereClause,
          include: {
            items: {
              include: {
                product: true
              }
            },
            vendor: true
          },
          orderBy: {
            [this.mapSortField(sortBy)]: sortOrder
          },
          skip: offset,
          take: limit
        }),
        this.db.purchase_orders.count({
          where: whereClause
        })
      ])

      const transformedOrders = purchaseOrders.map((dbOrder: any) => this.transformDbPurchaseOrder(dbOrder))

      return {
        success: true,
        data: transformedOrders,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch purchase orders: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(id: string): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const dbOrder = await this.db.purchase_orders.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            },
            orderBy: { line_number: 'asc' }
          },
          vendor: true
        }
      })

      if (!dbOrder) {
        return {
          success: false,
          error: 'Purchase order not found'
        }
      }

      const purchaseOrder = this.transformDbPurchaseOrder(dbOrder)

      return {
        success: true,
        data: purchaseOrder
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<ServiceResult<PurchaseOrder>> {
    try {
      // Validate vendor exists
      const vendorResult = await this.vendorService.getVendorById(input.vendorId)
      if (!vendorResult.success) {
        return {
          success: false,
          error: 'Invalid vendor'
        }
      }

      const vendor = vendorResult.data!
      
      // Generate order number
      const orderNumber = await this.generateOrderNumber()

      // Calculate financial totals
      const financialTotals = this.calculateOrderTotals(input.items, input.exchangeRate || 1)

      // Create in transaction
      const result = await this.db.$transaction(async (tx) => {
        // Create main order
        const dbOrder = await tx.purchase_orders.create({
          data: {
            order_number: orderNumber,
            order_date: new Date(),
            vendor_id: input.vendorId,
            vendor_name: vendor.companyName,
            vendor_address: this.formatVendorAddress(vendor),
            vendor_contact: this.formatVendorContact(vendor),
            status: 'draft',
            currency: input.currency,
            exchange_rate: input.exchangeRate || 1,
            subtotal: financialTotals.subtotal.amount,
            tax_amount: financialTotals.taxAmount.amount,
            discount_amount: financialTotals.discountAmount.amount,
            total_amount: financialTotals.totalAmount.amount,
            delivery_location_id: input.deliveryLocationId,
            expected_delivery_date: input.expectedDeliveryDate,
            payment_terms: input.paymentTerms,
            // Terms
            terms_payment: input.terms.paymentTerms,
            terms_delivery: input.terms.deliveryTerms,
            terms_warranty_period: input.terms.warrantyPeriod,
            terms_return_policy: input.terms.returnPolicy,
            terms_penalty_clause: input.terms.penaltyClause,
            terms_special_instructions: input.terms.specialInstructions,
            approved_by: input.approvedBy,
            approved_at: new Date(),
            total_items: input.items.length,
            received_items: 0,
            pending_items: input.items.length,
            notes: input.notes,
            source_request_id: input.sourceRequestId
          }
        })

        // Create items
        const dbItems = await Promise.all(
          input.items.map((item, index) =>
            tx.purchase_order_items.create({
              data: {
                order_id: dbOrder.id,
                line_number: index + 1,
                item_id: item.itemId,
                item_code: item.itemCode,
                item_name: item.itemName,
                description: item.description,
                specification: item.specification,
                ordered_quantity: item.orderedQuantity,
                received_quantity: 0,
                pending_quantity: item.orderedQuantity,
                unit: item.unit,
                unit_price: item.unitPrice.amount,
                discount: item.discount || 0,
                discount_amount: this.calculateDiscountAmount(item.unitPrice.amount, item.orderedQuantity, item.discount || 0),
                line_total: this.calculateLineTotal(item.unitPrice.amount, item.orderedQuantity, item.discount || 0),
                tax_rate: item.taxRate || 0,
                tax_amount: this.calculateTaxAmount(this.calculateLineTotal(item.unitPrice.amount, item.orderedQuantity, item.discount || 0), item.taxRate || 0),
                delivery_date: item.deliveryDate,
                status: 'pending',
                notes: item.notes,
                source_request_item_id: item.sourceRequestItemId
              }
            })
          )
        )

        return { dbOrder, dbItems }
      })

      // If created from PR, update PR items
      if (input.sourceRequestId) {
        await this.updateSourcePurchaseRequest(input.sourceRequestId, result.dbOrder.id, input.items)
      }

      // Fetch complete order
      const completeOrder = await this.getPurchaseOrderById(result.dbOrder.id)
      
      if (!completeOrder.success) {
        return completeOrder
      }

      return {
        success: true,
        data: completeOrder.data!
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Convert approved purchase request to purchase order
   */
  async convertFromPurchaseRequest(
    requestId: string,
    vendorId: string,
    convertedBy: string,
    itemSelections?: { requestItemId: string; quantity?: number; unitPrice?: Money }[]
  ): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const requestResult = await this.purchaseRequestService.getPurchaseRequestById(requestId)
      if (!requestResult.success) {
        return requestResult as ServiceResult<PurchaseOrder>
      }

      const request = requestResult.data!

      if (request.status !== 'approved') {
        return {
          success: false,
          error: 'Only approved purchase requests can be converted'
        }
      }

      // Get vendor details
      const vendorResult = await this.vendorService.getVendorById(vendorId)
      if (!vendorResult.success) {
        return {
          success: false,
          error: 'Invalid vendor'
        }
      }

      const vendor = vendorResult.data!

      // Prepare items for conversion
      let itemsToConvert = request.items || []
      
      if (itemSelections && itemSelections.length > 0) {
        itemsToConvert = itemsToConvert.filter((item: PurchaseRequestItem) =>
          itemSelections.some(sel => sel.requestItemId === item.id)
        )
      }

      const orderItems: CreatePurchaseOrderItemInput[] = itemsToConvert.map((item: PurchaseRequestItem) => {
        const selection = itemSelections?.find(sel => sel.requestItemId === item.id)
        
        return {
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          description: item.description,
          specification: item.specification,
          orderedQuantity: selection?.quantity || item.approvedQuantity || item.requestedQuantity,
          unit: item.unit,
          unitPrice: selection?.unitPrice || item.approvedUnitPrice || item.estimatedUnitPrice || { amount: 0, currency: vendor.preferredCurrency || 'USD' },
          deliveryDate: item.requiredDate,
          notes: item.notes,
          sourceRequestItemId: item.id
        }
      })

      const purchaseOrderInput: CreatePurchaseOrderInput = {
        vendorId,
        currency: vendor.preferredCurrency || 'USD',
        exchangeRate: 1, // Would get from exchange rate service
        deliveryLocationId: request.locationId,
        expectedDeliveryDate: request.requiredDate,
        paymentTerms: vendor.preferredPaymentTerms || '30 days',
        terms: {
          paymentTerms: vendor.preferredPaymentTerms || '30 days',
          deliveryTerms: 'FOB Destination',
          warrantyPeriod: 365, // Default warranty period
          returnPolicy: 'Standard return policy',
          penaltyClause: 'Standard penalty clause',
          specialInstructions: request.notes
        },
        approvedBy: convertedBy,
        notes: `Converted from Purchase Request: ${request.requestNumber}`,
        items: orderItems,
        sourceRequestId: requestId
      }

      return await this.createPurchaseOrder(purchaseOrderInput)
    } catch (error) {
      return {
        success: false,
        error: `Failed to convert purchase request: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Send purchase order to vendor
   */
  async sendPurchaseOrder(id: string, sentBy: string): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const order = await this.db.purchase_orders.findUnique({
        where: { id },
        include: { items: true }
      })

      if (!order) {
        return {
          success: false,
          error: 'Purchase order not found'
        }
      }

      if (order.status !== 'draft') {
        return {
          success: false,
          error: 'Only draft orders can be sent'
        }
      }

      if (order.items.length === 0) {
        return {
          success: false,
          error: 'Cannot send order without items'
        }
      }

      // Update order status
      await this.db.purchase_orders.update({
        where: { id },
        data: {
          status: 'sent',
          sent_by: sentBy,
          sent_at: new Date(),
          updated_at: new Date()
        }
      })

      // Here you would integrate with email service to send PO to vendor
      // await this.emailService.sendPurchaseOrderToVendor(order)

      return await this.getPurchaseOrderById(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to send purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Process vendor acknowledgment
   */
  async processVendorAcknowledgment(
    id: string, 
    acknowledgment: VendorAcknowledgment
  ): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const order = await this.db.purchase_orders.findUnique({
        where: { id },
        include: { items: true }
      })

      if (!order) {
        return {
          success: false,
          error: 'Purchase order not found'
        }
      }

      if (order.status !== 'sent') {
        return {
          success: false,
          error: 'Only sent orders can be acknowledged'
        }
      }

      await this.db.$transaction(async (tx) => {
        // Update order
        await tx.purchase_orders.update({
          where: { id },
          data: {
            status: 'acknowledged',
            acknowledged_at: acknowledgment.acknowledgedDate,
            expected_delivery_date: acknowledgment.confirmedDeliveryDate || order.expected_delivery_date,
            updated_at: new Date()
          }
        })

        // Process item adjustments if provided
        if (acknowledgment.itemAdjustments && acknowledgment.itemAdjustments.length > 0) {
          for (const adjustment of acknowledgment.itemAdjustments) {
            await tx.purchase_order_items.update({
              where: { 
                order_id: id,
                item_id: adjustment.itemId 
              },
              data: {
                ordered_quantity: adjustment.confirmedQuantity,
                unit_price: adjustment.confirmedPrice?.amount,
                delivery_date: adjustment.confirmedDeliveryDate,
                notes: adjustment.comments,
                updated_at: new Date()
              }
            })
          }

          // Recalculate order totals if items changed
          const updatedItems = await tx.purchase_order_items.findMany({
            where: { order_id: id }
          })

          const newTotals = this.calculateOrderTotalsFromDbItems(updatedItems)

          await tx.purchase_orders.update({
            where: { id },
            data: {
              subtotal: newTotals.subtotal.amount,
              tax_amount: newTotals.taxAmount.amount,
              discount_amount: newTotals.discountAmount.amount,
              total_amount: newTotals.totalAmount.amount
            }
          })
        }
      })

      return await this.getPurchaseOrderById(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to process acknowledgment: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Receive purchase order items
   */
  async receivePurchaseOrder(
    id: string, 
    receiveInput: ReceiveOrderInput
  ): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const order = await this.db.purchase_orders.findUnique({
        where: { id },
        include: { items: true }
      })

      if (!order) {
        return {
          success: false,
          error: 'Purchase order not found'
        }
      }

      if (!['acknowledged', 'partial_received'].includes(order.status)) {
        return {
          success: false,
          error: 'Order must be acknowledged before receiving'
        }
      }

      let totalReceivedItems = 0
      let totalPendingItems = 0

      await this.db.$transaction(async (tx) => {
        // Process each received item
        for (const receiveItem of receiveInput.items) {
          const orderItem = order.items.find((item: any) => item.id === receiveItem.itemId)
          if (!orderItem) continue

          const newReceivedQty = orderItem.received_quantity + receiveItem.receivedQuantity
          const newPendingQty = Math.max(0, orderItem.ordered_quantity - newReceivedQty)

          await tx.purchase_order_items.update({
            where: { id: receiveItem.itemId },
            data: {
              received_quantity: newReceivedQty,
              pending_quantity: newPendingQty,
              status: newPendingQty === 0 ? 'fully_received' : 'partial_received',
              updated_at: new Date()
            }
          })

          // Create receiving record (would integrate with GRN system)
          await tx.purchase_order_receipts.create({
            data: {
              order_id: id,
              item_id: receiveItem.itemId,
              received_quantity: receiveItem.receivedQuantity,
              rejected_quantity: receiveItem.rejectedQuantity || 0,
              damaged_quantity: receiveItem.damagedQuantity || 0,
              quality_status: receiveItem.qualityStatus || 'passed',
              batch_number: receiveItem.batchNumber,
              expiry_date: receiveItem.expiryDate,
              received_by: receiveInput.receivedBy,
              received_date: receiveInput.receivedDate,
              notes: receiveItem.notes
            }
          })

          if (newPendingQty === 0) {
            totalReceivedItems++
          } else {
            totalPendingItems++
          }
        }

        // Update order status based on received items
        const newStatus = totalPendingItems === 0 ? 'fully_received' : 'partial_received'
        
        await tx.purchase_orders.update({
          where: { id },
          data: {
            status: newStatus,
            received_items: order.received_items + totalReceivedItems,
            pending_items: totalPendingItems,
            actual_delivery_date: receiveInput.receivedDate,
            updated_at: new Date()
          }
        })

        // Create GRN if requested
        if (receiveInput.createGRN) {
          // This would integrate with GRN service
          // await this.createGoodsReceiveNote(id, receiveInput)
        }

        // Update inventory levels
        // This would integrate with inventory service
        // await this.updateInventoryFromReceipt(receiveInput.items)
      })

      return await this.getPurchaseOrderById(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to receive purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Close purchase order
   */
  async closePurchaseOrder(
    id: string, 
    closedBy: string, 
    closureReason?: string
  ): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const order = await this.db.purchase_orders.findUnique({
        where: { id }
      })

      if (!order) {
        return {
          success: false,
          error: 'Purchase order not found'
        }
      }

      if (order.status === 'closed') {
        return {
          success: false,
          error: 'Purchase order is already closed'
        }
      }

      await this.db.purchase_orders.update({
        where: { id },
        data: {
          status: 'closed',
          closed_by: closedBy,
          closed_at: new Date(),
          closure_reason: closureReason,
          updated_at: new Date()
        }
      })

      return await this.getPurchaseOrderById(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to close purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Cancel purchase order
   */
  async cancelPurchaseOrder(
    id: string, 
    cancelledBy: string, 
    reason?: string
  ): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const order = await this.db.purchase_orders.findUnique({
        where: { id }
      })

      if (!order) {
        return {
          success: false,
          error: 'Purchase order not found'
        }
      }

      if (['fully_received', 'closed', 'cancelled'].includes(order.status)) {
        return {
          success: false,
          error: 'Cannot cancel order in current status'
        }
      }

      await this.db.$transaction(async (tx) => {
        // Update order status
        await tx.purchase_orders.update({
          where: { id },
          data: {
            status: 'cancelled',
            closed_by: cancelledBy,
            closed_at: new Date(),
            closure_reason: reason || 'Order cancelled',
            updated_at: new Date()
          }
        })

        // Cancel all pending items
        await tx.purchase_order_items.updateMany({
          where: { 
            order_id: id,
            status: { in: ['pending', 'partial_received'] }
          },
          data: {
            status: 'cancelled',
            pending_quantity: 0,
            updated_at: new Date()
          }
        })
      })

      return await this.getPurchaseOrderById(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to cancel purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get purchase order statistics
   */
  async getPurchaseOrderStatistics(): Promise<ServiceResult<{
    total: number
    byStatus: Record<string, number>
    byCurrency: Record<string, number>
    totalValue: Money
    averageValue: Money
    onTimeDeliveryRate: number
    pendingDeliveries: number
    overdueDeliveries: number
  }>> {
    try {
      const [statusCounts, currencyCounts, valueStats, deliveryStats] = await Promise.all([
        this.db.purchase_orders.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        this.db.purchase_orders.groupBy({
          by: ['currency'],
          _count: { currency: true },
          _sum: { total_amount: true }
        }),
        this.db.purchase_orders.aggregate({
          _count: { id: true },
          _sum: { total_amount: true },
          _avg: { total_amount: true }
        }),
        Promise.all([
          this.db.purchase_orders.count({
            where: {
              status: { in: ['sent', 'acknowledged', 'partial_received'] }
            }
          }),
          this.db.purchase_orders.count({
            where: {
              status: { in: ['sent', 'acknowledged', 'partial_received'] },
              expected_delivery_date: { lt: new Date() }
            }
          }),
          this.db.purchase_orders.count({
            where: {
              status: { in: ['fully_received', 'closed'] },
              actual_delivery_date: { lte: this.db.purchase_orders.fields.expected_delivery_date }
            }
          }),
          this.db.purchase_orders.count({
            where: {
              status: { in: ['fully_received', 'closed'] }
            }
          })
        ])
      ])

      const [pendingDeliveries, overdueDeliveries, onTimeDeliveries, totalDelivered] = deliveryStats
      
      const stats = {
        total: valueStats._count.id,
        byStatus: statusCounts.reduce((acc: Record<string, number>, item: any) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>),
        byCurrency: currencyCounts.reduce((acc: Record<string, number>, item: any) => {
          acc[item.currency] = item._count.currency
          return acc
        }, {} as Record<string, number>),
        totalValue: {
          amount: valueStats._sum.total_amount || 0,
          currency: 'USD' // Would be configurable
        },
        averageValue: {
          amount: valueStats._avg.total_amount || 0,
          currency: 'USD'
        },
        onTimeDeliveryRate: totalDelivered > 0 ? (onTimeDeliveries / totalDelivered) * 100 : 0,
        pendingDeliveries,
        overdueDeliveries
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Private helper methods

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const prefix = `PO-${year}${month}`
    
    const count = await this.db.purchase_orders.count({
      where: {
        order_number: {
          startsWith: prefix
        }
      }
    })

    return `${prefix}-${String(count + 1).padStart(4, '0')}`
  }

  private calculateOrderTotals(items: CreatePurchaseOrderItemInput[], exchangeRate: number): {
    subtotal: Money
    taxAmount: Money
    discountAmount: Money
    totalAmount: Money
  } {
    let subtotal = 0
    let totalDiscount = 0
    let totalTax = 0

    items.forEach(item => {
      const lineTotal = item.unitPrice.amount * item.orderedQuantity
      const discount = this.calculateDiscountAmount(item.unitPrice.amount, item.orderedQuantity, item.discount || 0)
      const taxableAmount = lineTotal - discount
      const tax = this.calculateTaxAmount(taxableAmount, item.taxRate || 0)

      subtotal += lineTotal
      totalDiscount += discount
      totalTax += tax
    })

    return {
      subtotal: { amount: subtotal, currency: items[0]?.unitPrice.currency || 'USD' },
      discountAmount: { amount: totalDiscount, currency: items[0]?.unitPrice.currency || 'USD' },
      taxAmount: { amount: totalTax, currency: items[0]?.unitPrice.currency || 'USD' },
      totalAmount: { amount: subtotal - totalDiscount + totalTax, currency: items[0]?.unitPrice.currency || 'USD' }
    }
  }

  private calculateOrderTotalsFromDbItems(items: any[]): {
    subtotal: Money
    taxAmount: Money
    discountAmount: Money
    totalAmount: Money
  } {
    let subtotal = 0
    let totalDiscount = 0
    let totalTax = 0

    items.forEach(item => {
      subtotal += item.line_total
      totalDiscount += item.discount_amount
      totalTax += item.tax_amount
    })

    return {
      subtotal: { amount: subtotal, currency: 'USD' },
      discountAmount: { amount: totalDiscount, currency: 'USD' },
      taxAmount: { amount: totalTax, currency: 'USD' },
      totalAmount: { amount: subtotal - totalDiscount + totalTax, currency: 'USD' }
    }
  }

  private calculateDiscountAmount(unitPrice: number, quantity: number, discountPercent: number): number {
    return (unitPrice * quantity * discountPercent) / 100
  }

  private calculateTaxAmount(taxableAmount: number, taxRate: number): number {
    return (taxableAmount * taxRate) / 100
  }

  private calculateLineTotal(unitPrice: number, quantity: number, discountPercent: number): number {
    const gross = unitPrice * quantity
    const discount = this.calculateDiscountAmount(unitPrice, quantity, discountPercent)
    return gross - discount
  }

  private formatVendorAddress(vendor: any): string {
    const address = vendor.addresses?.find((addr: any) => addr.isPrimary) || vendor.addresses?.[0]
    if (!address) return ''
    
    return [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean).join(', ')
  }

  private formatVendorContact(vendor: any): string {
    const contact = vendor.contacts?.find((cont: any) => cont.isPrimary) || vendor.contacts?.[0]
    if (!contact) return ''
    
    return `${contact.name} - ${contact.email}${contact.phone ? ' - ' + contact.phone : ''}`
  }

  private async updateSourcePurchaseRequest(
    requestId: string, 
    orderId: string, 
    items: CreatePurchaseOrderItemInput[]
  ): Promise<void> {
    // Update PR items that were converted
    for (const item of items) {
      if (item.sourceRequestItemId) {
        await this.db.purchase_request_items.update({
          where: { id: item.sourceRequestItemId },
          data: {
            converted_to_po: true,
            purchase_order_id: orderId,
            converted_quantity: item.orderedQuantity
          }
        })
      }
    }
  }

  private mapSortField(sortBy: string): string {
    const fieldMap = {
      'orderNumber': 'order_number',
      'orderDate': 'order_date',
      'vendorName': 'vendor_name',
      'status': 'status',
      'totalAmount': 'total_amount',
      'expectedDeliveryDate': 'expected_delivery_date',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    }

    return fieldMap[sortBy as keyof typeof fieldMap] || 'order_date'
  }

  private transformDbPurchaseOrder(dbOrder: any): PurchaseOrder {
    const items = (dbOrder.items || []).map((item: any): PurchaseOrderItem => ({
      id: item.id,
      orderId: item.order_id,
      lineNumber: item.line_number,
      itemId: item.item_id,
      itemCode: item.item_code,
      itemName: item.item_name,
      description: item.description,
      specification: item.specification,
      orderedQuantity: item.ordered_quantity,
      receivedQuantity: item.received_quantity,
      pendingQuantity: item.pending_quantity,
      unit: item.unit,
      unitPrice: {
        amount: item.unit_price,
        currency: dbOrder.currency
      },
      discount: item.discount,
      discountAmount: {
        amount: item.discount_amount,
        currency: dbOrder.currency
      },
      lineTotal: {
        amount: item.line_total,
        currency: dbOrder.currency
      },
      taxRate: item.tax_rate,
      taxAmount: {
        amount: item.tax_amount,
        currency: dbOrder.currency
      },
      deliveryDate: item.delivery_date,
      status: item.status as 'pending' | 'partial_received' | 'fully_received' | 'cancelled',
      notes: item.notes,
      sourceRequestId: item.source_request_id,
      sourceRequestItemId: item.source_request_item_id
    }))

    return {
      id: dbOrder.id,
      orderNumber: dbOrder.order_number,
      orderDate: dbOrder.order_date,
      vendorId: dbOrder.vendor_id,
      vendorName: dbOrder.vendor_name,
      vendorAddress: dbOrder.vendor_address,
      vendorContact: dbOrder.vendor_contact,
      status: dbOrder.status as PurchaseOrder['status'],
      currency: dbOrder.currency,
      exchangeRate: dbOrder.exchange_rate,
      subtotal: {
        amount: dbOrder.subtotal,
        currency: dbOrder.currency
      },
      taxAmount: {
        amount: dbOrder.tax_amount,
        currency: dbOrder.currency
      },
      discountAmount: {
        amount: dbOrder.discount_amount,
        currency: dbOrder.currency
      },
      totalAmount: {
        amount: dbOrder.total_amount,
        currency: dbOrder.currency
      },
      deliveryLocationId: dbOrder.delivery_location_id,
      expectedDeliveryDate: dbOrder.expected_delivery_date,
      actualDeliveryDate: dbOrder.actual_delivery_date,
      paymentTerms: dbOrder.payment_terms,
      terms: {
        paymentTerms: dbOrder.terms_payment,
        deliveryTerms: dbOrder.terms_delivery,
        warrantyPeriod: dbOrder.terms_warranty_period,
        returnPolicy: dbOrder.terms_return_policy,
        penaltyClause: dbOrder.terms_penalty_clause,
        specialInstructions: dbOrder.terms_special_instructions
      },
      approvedBy: dbOrder.approved_by,
      approvedAt: dbOrder.approved_at,
      sentBy: dbOrder.sent_by,
      sentAt: dbOrder.sent_at,
      acknowledgedAt: dbOrder.acknowledged_at,
      closedBy: dbOrder.closed_by,
      closedAt: dbOrder.closed_at,
      closureReason: dbOrder.closure_reason,
      totalItems: dbOrder.total_items,
      receivedItems: dbOrder.received_items,
      pendingItems: dbOrder.pending_items,
      notes: dbOrder.notes,
      attachments: [],
      createdAt: dbOrder.created_at,
      updatedAt: dbOrder.updated_at,
      createdBy: dbOrder.created_by,
      updatedBy: dbOrder.updated_by
    }
  }
}

// Export service instance
export const purchaseOrderService = new PurchaseOrderService()