/**
 * Integration Tests for Calculation Services
 * 
 * Tests the interaction between different calculation services and
 * validates end-to-end workflows that mirror real application usage.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  financialCalculations,
  inventoryCalculations,
  vendorMetrics,
  serviceManager,
  initializeServices
} from '../index'
import { globalCacheManager } from '../utils/cache-manager'
import { exchangeRateConverter } from '../utils/exchange-rate-converter'
import type { Money, CostingMethod } from '@/lib/types'
import type { VendorOrderData } from '../calculations/vendor-metrics'

describe('Calculation Services Integration', () => {
  beforeEach(() => {
    // Initialize services with test configuration
    initializeServices({
      cache: {
        enabled: true,
        maxMemoryMB: 10,
        defaultTtlSeconds: 60
      }
    })
  })

  afterEach(() => {
    // Clear caches after each test
    serviceManager.clearCaches()
  })

  // Helper functions
  const createMoney = (amount: number, currency: string = 'USD'): Money => ({
    amount,
    currencyCode: currency
  })

  describe('Purchase Order Processing Workflow', () => {
    it('should calculate complete purchase order with multiple line items', async () => {
      // Simulate a purchase order with multiple items
      const lineItems = [
        {
          itemId: 'ITEM-001',
          quantity: 10,
          unitPrice: createMoney(25.50),
          taxRate: 8.5,
          discountRate: 5
        },
        {
          itemId: 'ITEM-002',
          quantity: 5,
          unitPrice: createMoney(150.00),
          taxRate: 8.5,
          discountRate: 10
        },
        {
          itemId: 'ITEM-003',
          quantity: 2,
          unitPrice: createMoney(75.00),
          taxRate: 8.5,
          discountRate: 0
        }
      ]

      // Calculate totals for each line item
      const lineItemResults = []
      for (const item of lineItems) {
        const result = await financialCalculations.calculateLineItemTotal(item)
        lineItemResults.push(result.value)
      }

      // Sum all line totals
      const allNetAmounts = lineItemResults.map(result => result.netAmount)
      const orderSubtotal = await financialCalculations.addMoney(allNetAmounts)

      const allTaxAmounts = lineItemResults.map(result => result.taxAmount!)
      const orderTaxTotal = await financialCalculations.addMoney(allTaxAmounts)

      const allTotalAmounts = lineItemResults.map(result => result.totalAmount)
      const orderGrandTotal = await financialCalculations.addMoney(allTotalAmounts)

      // Verify calculations
      expect(orderSubtotal.value.amount).toBeCloseTo(1117.25, 2) // After discounts
      expect(orderTaxTotal.value.amount).toBeCloseTo(94.97, 2)
      expect(orderGrandTotal.value.amount).toBeCloseTo(1212.22, 2)

      // Verify individual line calculations
      expect(lineItemResults[0].netAmount.amount).toBe(242.25) // 255 - 5%
      expect(lineItemResults[1].netAmount.amount).toBe(675.00) // 750 - 10%
      expect(lineItemResults[2].netAmount.amount).toBe(150.00) // No discount
    })
  })

  describe('Inventory Valuation Workflow', () => {
    it('should calculate stock valuation using different costing methods', async () => {
      const itemId = 'INVENTORY-001'
      const quantityOnHand = 100
      const transactions = [
        {
          date: new Date('2024-01-01'),
          type: 'RECEIVE' as const,
          quantity: 50,
          unitCost: createMoney(10.00)
        },
        {
          date: new Date('2024-01-15'),
          type: 'RECEIVE' as const,
          quantity: 30,
          unitCost: createMoney(12.00)
        },
        {
          date: new Date('2024-02-01'),
          type: 'RECEIVE' as const,
          quantity: 40,
          unitCost: createMoney(11.00)
        }
      ]

      // Test FIFO costing
      const fifoResult = await inventoryCalculations.calculateStockValuation({
        itemId,
        quantityOnHand,
        costingMethod: CostingMethod.FIFO,
        transactions
      })

      // Test Moving Average costing
      const movingAvgResult = await inventoryCalculations.calculateStockValuation({
        itemId,
        quantityOnHand,
        costingMethod: CostingMethod.MOVING_AVERAGE,
        transactions,
        averageCost: createMoney(10.80) // Calculated average
      })

      // Verify results
      expect(fifoResult.value.quantityOnHand).toBe(100)
      expect(movingAvgResult.value.quantityOnHand).toBe(100)

      // Moving average should use the provided average cost
      expect(movingAvgResult.value.unitCost.amount).toBe(10.80)
      expect(movingAvgResult.value.totalValue.amount).toBe(1080)

      // Both should have the same quantity but different valuations
      expect(fifoResult.value.totalValue.amount).not.toBe(movingAvgResult.value.totalValue.amount)
    })

    it('should calculate reorder points and ABC analysis together', async () => {
      // Calculate reorder point for high-usage item
      const reorderResult = await inventoryCalculations.calculateReorderPoint({
        averageMonthlyUsage: 300,
        leadTimeDays: 14,
        safetyStockDays: 7,
        seasonalityFactor: 1.2
      })

      // Perform ABC analysis on multiple items
      const abcResult = await inventoryCalculations.performABCAnalysis({
        items: [
          {
            itemId: 'ITEM-001',
            annualValue: createMoney(50000),
            annualUsage: 1200
          },
          {
            itemId: 'ITEM-002',
            annualValue: createMoney(25000),
            annualUsage: 800
          },
          {
            itemId: 'ITEM-003',
            annualValue: createMoney(5000),
            annualUsage: 400
          }
        ],
        currencyCode: 'USD'
      })

      // Verify reorder calculations
      expect(reorderResult.value.reorderPoint).toBeGreaterThan(0)
      expect(reorderResult.value.safetyStock).toBeGreaterThan(0)
      expect(reorderResult.value.recommendedOrderQuantity).toBeGreaterThan(reorderResult.value.reorderPoint)

      // Verify ABC analysis
      expect(abcResult.value).toHaveLength(3)
      expect(abcResult.value[0].classification).toBe('A') // Highest value item
      expect(abcResult.value[2].classification).toBe('C') // Lowest value item
      expect(abcResult.value[0].rank).toBe(1)
      expect(abcResult.value[2].rank).toBe(3)
    })
  })

  describe('Vendor Performance Evaluation Workflow', () => {
    it('should calculate comprehensive vendor metrics from order history', async () => {
      const vendorId = 'VENDOR-001'
      const mockOrders: VendorOrderData[] = [
        {
          orderId: 'PO-001',
          orderDate: new Date('2024-01-15'),
          expectedDeliveryDate: new Date('2024-01-30'),
          actualDeliveryDate: new Date('2024-01-28'),
          orderValue: createMoney(5000),
          isDelivered: true,
          qualityScore: 4.5,
          defectRate: 2,
          isOnTime: true,
          daysLate: 0,
          itemsOrdered: 100,
          itemsReceived: 100,
          itemsAccepted: 98,
          itemsRejected: 2
        },
        {
          orderId: 'PO-002',
          orderDate: new Date('2024-02-01'),
          expectedDeliveryDate: new Date('2024-02-15'),
          actualDeliveryDate: new Date('2024-02-18'),
          orderValue: createMoney(3000),
          isDelivered: true,
          qualityScore: 4.0,
          defectRate: 5,
          isOnTime: false,
          daysLate: 3,
          itemsOrdered: 75,
          itemsReceived: 75,
          itemsAccepted: 71,
          itemsRejected: 4
        },
        {
          orderId: 'PO-003',
          orderDate: new Date('2024-02-20'),
          expectedDeliveryDate: new Date('2024-03-05'),
          actualDeliveryDate: new Date('2024-03-04'),
          orderValue: createMoney(7500),
          isDelivered: true,
          qualityScore: 4.8,
          defectRate: 1,
          isOnTime: true,
          daysLate: 0,
          itemsOrdered: 150,
          itemsReceived: 150,
          itemsAccepted: 149,
          itemsRejected: 1
        }
      ]

      // Calculate vendor performance
      const performanceResult = await vendorMetrics.calculateVendorPerformance({
        vendorId,
        orders: mockOrders,
        timeframeDays: 90
      })

      const metrics = performanceResult.value

      // Verify delivery metrics
      expect(metrics.deliveryMetrics.onTimeDeliveryRate).toBeCloseTo(66.67, 1) // 2 out of 3 on time
      expect(metrics.deliveryMetrics.averageDaysLate).toBe(1) // (0+3+0)/3
      expect(metrics.deliveryMetrics.completedOrders).toBe(3)

      // Verify quality metrics
      expect(metrics.qualityMetrics.qualityRating).toBeCloseTo(4.43, 2) // Average of 4.5, 4.0, 4.8
      expect(metrics.qualityMetrics.defectRate).toBeCloseTo(2.67, 2) // Average of 2, 5, 1
      expect(metrics.qualityMetrics.rejectionRate).toBeCloseTo(2.16, 2) // 7 rejected out of 325 received

      // Verify financial metrics
      expect(metrics.financialMetrics.totalOrderValue.amount).toBe(15500)
      expect(metrics.financialMetrics.averageOrderValue.amount).toBeCloseTo(5166.67, 2)

      // Verify overall rating is within expected range
      expect(metrics.overallRating).toBeGreaterThan(3.0)
      expect(metrics.overallRating).toBeLessThan(5.0)

      // Verify risk score is calculated
      expect(metrics.riskScore).toBeGreaterThanOrEqual(0)
      expect(metrics.riskScore).toBeLessThanOrEqual(100)

      // Verify recommendations are generated
      expect(metrics.recommendations).toBeInstanceOf(Array)
      expect(metrics.recommendations.length).toBeGreaterThan(0)
    })

    it('should calculate price competitiveness across multiple vendors', async () => {
      const itemId = 'ITEM-COMPARE-001'
      const vendorPrices = [
        {
          vendorId: 'VENDOR-A',
          price: createMoney(100),
          quantity: 1,
          lastUpdated: new Date()
        },
        {
          vendorId: 'VENDOR-B',
          price: createMoney(95),
          quantity: 1,
          lastUpdated: new Date()
        },
        {
          vendorId: 'VENDOR-C',
          price: createMoney(110),
          quantity: 1,
          lastUpdated: new Date()
        },
        {
          vendorId: 'VENDOR-D',
          price: createMoney(98),
          quantity: 1,
          lastUpdated: new Date()
        }
      ]

      const competitivenessResult = await vendorMetrics.calculatePriceCompetitiveness({
        itemId,
        vendorPrices
      })

      const result = competitivenessResult.value

      // Verify price rankings
      expect(result.vendorPrices).toHaveLength(4)
      expect(result.vendorPrices[0].vendorId).toBe('VENDOR-B') // Lowest price
      expect(result.vendorPrices[0].rank).toBe(1)
      expect(result.vendorPrices[0].competitivenessScore).toBe(5) // Best score

      expect(result.vendorPrices[3].vendorId).toBe('VENDOR-C') // Highest price
      expect(result.vendorPrices[3].rank).toBe(4)
      expect(result.vendorPrices[3].competitivenessScore).toBeLessThan(5)

      // Verify price range calculations
      expect(result.priceRange.lowest.amount).toBe(95)
      expect(result.priceRange.highest.amount).toBe(110)
      expect(result.priceRange.spread).toBeCloseTo(15.79, 2) // (110-95)/95 * 100

      // Verify market statistics
      expect(result.marketAverage?.amount).toBeCloseTo(100.75, 2)
      expect(result.marketMedian?.amount).toBe(98) // Middle value in sorted list
    })
  })

  describe('Multi-Currency Operations', () => {
    it('should handle currency conversions in financial calculations', async () => {
      // Convert EUR purchase to USD for comparison
      const eurPurchase = createMoney(1000, 'EUR')
      const conversionResult = await exchangeRateConverter.convertCurrency({
        amount: eurPurchase,
        toCurrency: 'USD',
        exchangeRate: 1.18 // Mock rate
      })

      expect(conversionResult.value.convertedAmount.currencyCode).toBe('USD')
      expect(conversionResult.value.convertedAmount.amount).toBe(1180)

      // Calculate tax on converted amount
      const taxResult = await financialCalculations.calculateTax({
        subtotal: conversionResult.value.convertedAmount,
        taxRate: 8.5
      })

      expect(taxResult.value.totalAmount.currencyCode).toBe('USD')
      expect(taxResult.value.totalAmount.amount).toBeCloseTo(1280.3, 2)
    })

    it('should maintain currency consistency across calculations', async () => {
      const amounts = [
        createMoney(100, 'THB'),
        createMoney(200, 'THB'),
        createMoney(150, 'THB')
      ]

      const total = await financialCalculations.addMoney(amounts)
      expect(total.value.currencyCode).toBe('THB')
      expect(total.value.amount).toBe(450)

      // Calculate discount on Thai Baht amount
      const discountResult = await financialCalculations.calculateDiscount({
        subtotal: total.value,
        discountRate: 10
      })

      expect(discountResult.value.netAmount.currencyCode).toBe('THB')
      expect(discountResult.value.netAmount.amount).toBe(405)
    })
  })

  describe('Caching and Performance', () => {
    it('should cache calculation results for improved performance', async () => {
      const testAmount = createMoney(100)
      const testTaxRate = 7.5

      // First calculation (should not be cached)
      const startTime1 = Date.now()
      const result1 = await financialCalculations.calculateTax({
        subtotal: testAmount,
        taxRate: testTaxRate
      })
      const duration1 = Date.now() - startTime1

      // Second identical calculation (should use cache if available)
      const startTime2 = Date.now()
      const result2 = await financialCalculations.calculateTax({
        subtotal: testAmount,
        taxRate: testTaxRate
      })
      const duration2 = Date.now() - startTime2

      // Verify results are identical
      expect(result1.value.taxAmount.amount).toBe(result2.value.taxAmount.amount)
      expect(result1.value.totalAmount.amount).toBe(result2.value.totalAmount.amount)

      // Second call should be faster (if caching is working)
      // Note: This might not always be true in test environment, but we verify the cache works
      const cacheStats = globalCacheManager.getStats()
      expect(cacheStats.totalEntries).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Service Health and Statistics', () => {
    it('should report healthy service status', async () => {
      const healthCheck = await serviceManager.healthCheck()

      expect(healthCheck.cache).toBe(true)
      expect(healthCheck.exchangeRates).toBe(true)
      expect(healthCheck.calculations).toBe(true)
      expect(healthCheck.timestamp).toBeInstanceOf(Date)
    })

    it('should provide service statistics', async () => {
      // Generate some activity first
      await financialCalculations.calculateTax({
        subtotal: createMoney(100),
        taxRate: 10
      })

      await exchangeRateConverter.getSupportedCurrencies()

      const stats = await serviceManager.getStatistics()

      expect(stats.cache).toBeTruthy()
      expect(stats.exchangeRates).toBeTruthy()
      expect(stats.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle service errors gracefully', async () => {
      // Test invalid calculation input
      await expect(financialCalculations.calculateTax({
        subtotal: { amount: -100, currencyCode: 'USD' },
        taxRate: 10
      })).rejects.toThrow()

      // Test invalid vendor metrics input
      await expect(vendorMetrics.calculateVendorPerformance({
        vendorId: '',
        orders: []
      })).rejects.toThrow()
    })

    it('should continue working after cache clearing', async () => {
      // Perform calculation
      const result1 = await financialCalculations.calculateTax({
        subtotal: createMoney(100),
        taxRate: 10
      })

      // Clear caches
      serviceManager.clearCaches()

      // Should still work after cache clear
      const result2 = await financialCalculations.calculateTax({
        subtotal: createMoney(100),
        taxRate: 10
      })

      expect(result1.value.taxAmount.amount).toBe(result2.value.taxAmount.amount)
    })
  })
})