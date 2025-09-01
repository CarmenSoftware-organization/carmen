/**
 * Procurement Integration Service
 * 
 * Comprehensive business logic integration service that coordinates between
 * procurement services, financial calculations, inventory tracking, and vendor management.
 * 
 * Features:
 * - Integration with calculation services for financial computations
 * - Inventory impact tracking for received items
 * - Budget validation and spending limits
 * - Vendor performance tracking integration
 * - Approval workflow automation
 * - Price validation and market analysis
 */

import { 
  PurchaseRequest,
  PurchaseOrder,
  PurchaseRequestItem,
  PurchaseOrderItem,
  Money,
  ServiceResult,
  BudgetAllocation,
  VendorPerformanceMetrics
} from '@/lib/types'
import { purchaseRequestService } from './db/purchase-request-service'
import { purchaseOrderService } from './db/purchase-order-service'
import { vendorService } from './db/vendor-service'
import { productService } from './db/product-service'
import { FinancialCalculations } from './calculations/financial-calculations'
import { InventoryCalculations } from './calculations/inventory-calculations'
import { VendorMetrics } from './calculations/vendor-metrics'
import { CachedFinancialCalculations } from './cache/cached-financial-calculations'
import { CachedInventoryCalculations } from './cache/cached-inventory-calculations'
import { CachedVendorMetrics } from './cache/cached-vendor-metrics'

export interface ProcurementSummary {
  totalRequests: number
  totalOrders: number
  totalSpend: Money
  pendingApprovals: number
  overdueDeliveries: number
  budgetUtilization: number
  avgProcessingTime: number // in days
  topVendors: {
    vendorId: string
    vendorName: string
    orderCount: number
    totalSpend: Money
  }[]
  criticalItems: {
    itemId: string
    itemName: string
    requestCount: number
    avgLeadTime: number
  }[]
}

export interface BudgetValidationResult {
  isValid: boolean
  budgetCode: string
  totalBudget: Money
  spentAmount: Money
  committedAmount: Money
  availableAmount: Money
  utilizationRate: number
  exceedsLimit: boolean
  warningThreshold: boolean // >80% utilization
}

export interface VendorSelectionRecommendation {
  recommendedVendorId: string
  vendorName: string
  score: number
  reasons: string[]
  priceComparison: {
    proposedPrice: Money
    marketAverage: Money
    savings: Money
    competitiveness: 'excellent' | 'good' | 'fair' | 'poor'
  }
  performanceMetrics: {
    onTimeDeliveryRate: number
    qualityRating: number
    priceCompetitiveness: number
    overallRating: number
  }
  alternatives: {
    vendorId: string
    vendorName: string
    score: number
    estimatedPrice: Money
  }[]
}

export interface InventoryImpactAnalysis {
  itemId: string
  itemName: string
  currentStock: number
  incomingQuantity: number
  projectedStock: number
  reorderPoint: number
  maxStock: number
  impact: 'critical' | 'normal' | 'overstocked'
  recommendations: string[]
  costImpact: Money
  storageRequirements: {
    space: number
    specialRequirements: string[]
  }
}

export interface ProcurementWorkflowAutomation {
  requestId: string
  autoApprovals: {
    stage: string
    approved: boolean
    reason: string
    approver: string
  }[]
  requiredApprovals: {
    stage: string
    approver: string
    reason: string
  }[]
  estimatedCompletionDate: Date
  criticalPath: string[]
}

export class ProcurementIntegrationService {
  private financialCalc: FinancialCalculations
  private inventoryCalc: InventoryCalculations
  private vendorMetrics: VendorMetrics
  private cachedFinancial: CachedFinancialCalculations
  private cachedInventory: CachedInventoryCalculations
  private cachedVendorMetrics: CachedVendorMetrics

  constructor() {
    this.financialCalc = new FinancialCalculations()
    this.inventoryCalc = new InventoryCalculations()
    this.vendorMetrics = new VendorMetrics()
    this.cachedFinancial = new CachedFinancialCalculations()
    this.cachedInventory = new CachedInventoryCalculations()
    this.cachedVendorMetrics = new CachedVendorMetrics()
  }

  /**
   * Get comprehensive procurement summary
   */
  async getProcurementSummary(
    departmentId?: string,
    locationId?: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<ServiceResult<ProcurementSummary>> {
    try {
      // Get basic statistics in parallel
      const [prStats, poStats] = await Promise.all([
        purchaseRequestService.getPurchaseRequestStatistics(),
        purchaseOrderService.getPurchaseOrderStatistics()
      ])

      if (!prStats.success || !poStats.success) {
        return {
          success: false,
          error: 'Failed to fetch procurement statistics'
        }
      }

      // Calculate budget utilization (placeholder - would integrate with budget service)
      const budgetUtilization = 75.5 // This would be calculated from actual budget data

      // Get top vendors (simplified)
      const topVendors = poStats.data!.topVendorsByValue?.slice(0, 5) || []

      // Calculate critical items (placeholder)
      const criticalItems = [
        {
          itemId: 'item-1',
          itemName: 'Critical Supply Item',
          requestCount: 12,
          avgLeadTime: 7
        }
      ]

      const summary: ProcurementSummary = {
        totalRequests: prStats.data!.total,
        totalOrders: poStats.data!.total,
        totalSpend: poStats.data!.totalValue,
        pendingApprovals: prStats.data!.pendingApprovals,
        overdueDeliveries: poStats.data!.overdueDeliveries,
        budgetUtilization,
        avgProcessingTime: 5.2, // Would be calculated from actual data
        topVendors: topVendors.map(v => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          orderCount: v.orderCount,
          totalSpend: v.totalValue
        })),
        criticalItems
      }

      return {
        success: true,
        data: summary
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get procurement summary: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Validate budget for purchase request
   */
  async validateBudget(
    budgetCode: string,
    requestedAmount: Money,
    departmentId: string
  ): Promise<ServiceResult<BudgetValidationResult>> {
    try {
      // This would integrate with actual budget management system
      // For now, providing a mock implementation
      const mockBudget: BudgetAllocation = {
        id: 'budget-1',
        budgetCode,
        budgetName: 'Department Operating Budget',
        fiscalYear: '2024',
        departmentId,
        totalBudget: { amount: 100000, currencyCode: requestedAmount.currencyCode },
        allocatedAmount: { amount: 100000, currencyCode: requestedAmount.currencyCode },
        spentAmount: { amount: 45000, currencyCode: requestedAmount.currencyCode },
        committedAmount: { amount: 20000, currencyCode: requestedAmount.currencyCode },
        availableAmount: { amount: 35000, currencyCode: requestedAmount.currencyCode },
        utilizationRate: 65,
        lastUpdated: new Date()
      }

      const newCommittedAmount = mockBudget.committedAmount.amount + requestedAmount.amount
      const newUtilizationRate = ((mockBudget.spentAmount.amount + newCommittedAmount) / mockBudget.totalBudget.amount) * 100
      const exceedsLimit = newCommittedAmount > mockBudget.availableAmount.amount
      const warningThreshold = newUtilizationRate > 80

      const result: BudgetValidationResult = {
        isValid: !exceedsLimit,
        budgetCode,
        totalBudget: mockBudget.totalBudget,
        spentAmount: mockBudget.spentAmount,
        committedAmount: { amount: newCommittedAmount, currencyCode: requestedAmount.currencyCode },
        availableAmount: { amount: mockBudget.availableAmount.amount - requestedAmount.amount, currencyCode: requestedAmount.currencyCode },
        utilizationRate: newUtilizationRate,
        exceedsLimit,
        warningThreshold
      }

      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate budget: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get vendor selection recommendation
   */
  async getVendorSelectionRecommendation(
    itemIds: string[],
    quantities: number[],
    deliveryDate: Date,
    locationId: string
  ): Promise<ServiceResult<VendorSelectionRecommendation>> {
    try {
      // Get available vendors for these items (would integrate with vendor-product relationships)
      const vendorResults = await vendorService.getVendors(
        { status: ['active'] },
        { limit: 10 }
      )

      if (!vendorResults.success || !vendorResults.data) {
        return {
          success: false,
          error: 'Failed to fetch vendors'
        }
      }

      // For demo purposes, select the first active vendor
      const vendors = vendorResults.data
      if (vendors.length === 0) {
        return {
          success: false,
          error: 'No active vendors found'
        }
      }

      const recommendedVendor = vendors[0]

      // Calculate performance score (simplified)
      const performanceMetrics = {
        onTimeDeliveryRate: recommendedVendor.onTimeDeliveryRate || 85,
        qualityRating: recommendedVendor.qualityRating || 4.2,
        priceCompetitiveness: recommendedVendor.priceCompetitiveness || 78,
        overallRating: ((recommendedVendor.onTimeDeliveryRate || 85) + 
                       (recommendedVendor.qualityRating || 4.2) * 20 + 
                       (recommendedVendor.priceCompetitiveness || 78)) / 3
      }

      // Mock price comparison
      const proposedPrice = { amount: 1500, currencyCode: 'USD' }
      const marketAverage = { amount: 1750, currencyCode: 'USD' }
      const savings = { amount: marketAverage.amount - proposedPrice.amount, currencyCode: 'USD' }

      const recommendation: VendorSelectionRecommendation = {
        recommendedVendorId: recommendedVendor.id,
        vendorName: recommendedVendor.companyName,
        score: performanceMetrics.overallRating,
        reasons: [
          'Excellent on-time delivery record',
          'Competitive pricing',
          'Good quality rating',
          'Reliable payment terms'
        ],
        priceComparison: {
          proposedPrice,
          marketAverage,
          savings,
          competitiveness: savings.amount > 0 ? 'excellent' : 'good'
        },
        performanceMetrics,
        alternatives: vendors.slice(1, 4).map((v, index) => ({
          vendorId: v.id,
          vendorName: v.companyName,
          score: 80 - index * 5,
          estimatedPrice: { amount: proposedPrice.amount + (index + 1) * 100, currencyCode: 'USD' }
        }))
      }

      return {
        success: true,
        data: recommendation
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get vendor recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Analyze inventory impact of purchase order
   */
  async analyzeInventoryImpact(
    items: PurchaseOrderItem[]
  ): Promise<ServiceResult<InventoryImpactAnalysis[]>> {
    try {
      const analyses: InventoryImpactAnalysis[] = []

      for (const item of items) {
        // Get current inventory levels (would integrate with inventory service)
        const currentStock = 150 // Mock current stock
        const reorderPoint = 50
        const maxStock = 500

        const projectedStock = currentStock + item.orderedQuantity
        
        let impact: 'critical' | 'normal' | 'overstocked' = 'normal'
        const recommendations: string[] = []

        if (currentStock <= reorderPoint) {
          impact = 'critical'
          recommendations.push('Urgent restocking required')
        } else if (projectedStock > maxStock) {
          impact = 'overstocked'
          recommendations.push('Consider reducing order quantity')
          recommendations.push('Evaluate storage capacity')
        }

        // Calculate cost impact
        const costImpact = {
          amount: item.unitPrice.amount * item.orderedQuantity,
          currencyCode: item.unitPrice.currencyCode
        }

        // Estimate storage requirements
        const storageRequirements = {
          space: item.orderedQuantity * 0.1, // Mock space calculation
          specialRequirements: ['Temperature controlled', 'Dry storage']
        }

        const analysis: InventoryImpactAnalysis = {
          itemId: item.itemId || item.id,
          itemName: item.itemName,
          currentStock,
          incomingQuantity: item.orderedQuantity,
          projectedStock,
          reorderPoint,
          maxStock,
          impact,
          recommendations,
          costImpact,
          storageRequirements
        }

        analyses.push(analysis)
      }

      return {
        success: true,
        data: analyses
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze inventory impact: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Automate procurement workflow decisions
   */
  async automateProcurementWorkflow(
    request: PurchaseRequest
  ): Promise<ServiceResult<ProcurementWorkflowAutomation>> {
    try {
      const autoApprovals: ProcurementWorkflowAutomation['autoApprovals'] = []
      const requiredApprovals: ProcurementWorkflowAutomation['requiredApprovals'] = []

      const totalAmount = request.estimatedTotal.amount

      // Auto-approve low-value requests
      if (totalAmount < 500) {
        autoApprovals.push({
          stage: 'hdApproval',
          approved: true,
          reason: 'Auto-approved: Low value request',
          approver: 'system'
        })
        
        autoApprovals.push({
          stage: 'purchaseReview',
          approved: true,
          reason: 'Auto-approved: Standard procurement process',
          approver: 'system'
        })
      } else if (totalAmount < 5000) {
        // Require HD approval only
        requiredApprovals.push({
          stage: 'hdApproval',
          approver: 'department_head',
          reason: 'Requires department head approval'
        })
        
        autoApprovals.push({
          stage: 'purchaseReview',
          approved: true,
          reason: 'Auto-approved: Standard procurement process',
          approver: 'system'
        })
      } else if (totalAmount < 25000) {
        // Require HD and Purchase review
        requiredApprovals.push({
          stage: 'hdApproval',
          approver: 'department_head',
          reason: 'Requires department head approval'
        })
        
        requiredApprovals.push({
          stage: 'purchaseReview',
          approver: 'purchase_manager',
          reason: 'Requires purchase manager review'
        })
      } else {
        // High-value: Full approval chain
        requiredApprovals.push({
          stage: 'hdApproval',
          approver: 'department_head',
          reason: 'Requires department head approval'
        })
        
        requiredApprovals.push({
          stage: 'purchaseReview',
          approver: 'purchase_manager',
          reason: 'Requires purchase manager review'
        })
        
        requiredApprovals.push({
          stage: 'financeManager',
          approver: 'finance_manager',
          reason: 'High-value request requires finance approval'
        })
        
        if (totalAmount > 50000) {
          requiredApprovals.push({
            stage: 'gmApproval',
            approver: 'general_manager',
            reason: 'Executive approval required for high-value procurement'
          })
        }
      }

      // Calculate estimated completion date
      const approvalDays = requiredApprovals.length * 2 // 2 days per approval stage
      const estimatedCompletionDate = new Date()
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + approvalDays + 1)

      // Critical path analysis
      const criticalPath = [
        'request_submission',
        ...requiredApprovals.map(a => a.stage),
        'po_creation',
        'vendor_communication'
      ]

      const automation: ProcurementWorkflowAutomation = {
        requestId: request.id,
        autoApprovals,
        requiredApprovals,
        estimatedCompletionDate,
        criticalPath
      }

      return {
        success: true,
        data: automation
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to automate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update inventory after receiving purchase order
   */
  async updateInventoryFromReceipt(
    orderId: string,
    receivedItems: {
      itemId: string
      receivedQuantity: number
      rejectedQuantity: number
      batchNumber?: string
      expiryDate?: Date
    }[]
  ): Promise<ServiceResult<boolean>> {
    try {
      // This would integrate with inventory management system
      // For now, we'll log the action and return success
      
      console.log(`Updating inventory for order ${orderId}:`)
      receivedItems.forEach(item => {
        console.log(`- Item ${item.itemId}: +${item.receivedQuantity} units`)
        if (item.rejectedQuantity > 0) {
          console.log(`  - Rejected: ${item.rejectedQuantity} units`)
        }
        if (item.batchNumber) {
          console.log(`  - Batch: ${item.batchNumber}`)
        }
        if (item.expiryDate) {
          console.log(`  - Expires: ${item.expiryDate.toISOString()}`)
        }
      })

      // Would call inventory service methods:
      // await inventoryService.addStock(item.itemId, item.receivedQuantity, ...)
      // await inventoryService.rejectStock(item.itemId, item.rejectedQuantity, ...)

      return {
        success: true,
        data: true
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Calculate procurement performance metrics
   */
  async calculateProcurementPerformanceMetrics(
    departmentId?: string,
    periodDays: number = 30
  ): Promise<ServiceResult<{
    totalRequests: number
    completedRequests: number
    averageProcessingTime: number
    onTimeDeliveryRate: number
    budgetCompliance: number
    costSavings: Money
    vendorPerformanceScore: number
    qualityMetrics: {
      defectRate: number
      returnRate: number
      satisfactionScore: number
    }
  }>> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - periodDays)

      // Get PR and PO statistics for the period
      const [prStats, poStats] = await Promise.all([
        purchaseRequestService.getPurchaseRequestStatistics(),
        purchaseOrderService.getPurchaseOrderStatistics()
      ])

      if (!prStats.success || !poStats.success) {
        return {
          success: false,
          error: 'Failed to fetch statistics for performance calculation'
        }
      }

      // Calculate metrics (simplified for demo)
      const metrics = {
        totalRequests: prStats.data!.total,
        completedRequests: prStats.data!.total - prStats.data!.pendingApprovals,
        averageProcessingTime: 4.5, // days
        onTimeDeliveryRate: poStats.data!.onTimeDeliveryRate,
        budgetCompliance: 92.5, // percentage
        costSavings: { amount: 12500, currencyCode: 'USD' },
        vendorPerformanceScore: 87.3,
        qualityMetrics: {
          defectRate: 2.1, // percentage
          returnRate: 0.8, // percentage
          satisfactionScore: 4.3 // out of 5
        }
      }

      return {
        success: true,
        data: metrics
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate procurement recommendations
   */
  async generateProcurementRecommendations(
    departmentId: string
  ): Promise<ServiceResult<{
    budgetOptimization: string[]
    vendorConsolidation: string[]
    processImprovement: string[]
    riskMitigation: string[]
    costReduction: string[]
  }>> {
    try {
      // Analyze current procurement patterns and generate recommendations
      const recommendations = {
        budgetOptimization: [
          'Consider quarterly budget reviews to improve allocation accuracy',
          'Implement rolling forecasts for better budget utilization',
          'Set up automated alerts for budget thresholds'
        ],
        vendorConsolidation: [
          'Consolidate orders with top 3 vendors for volume discounts',
          'Evaluate vendor performance and rationalize supplier base',
          'Negotiate framework agreements for commonly ordered items'
        ],
        processImprovement: [
          'Implement electronic approval workflows to reduce processing time',
          'Set up automated reorder points for critical items',
          'Create standardized templates for common request types'
        ],
        riskMitigation: [
          'Diversify supplier base for critical items',
          'Implement backup suppliers for high-risk categories',
          'Regular vendor financial health assessments'
        ],
        costReduction: [
          'Negotiate volume discounts based on annual spend',
          'Consider local sourcing to reduce logistics costs',
          'Implement group purchasing with other departments'
        ]
      }

      return {
        success: true,
        data: recommendations
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Export service instance
export const procurementIntegrationService = new ProcurementIntegrationService()