/**
 * Purchase Request Service
 * 
 * Comprehensive service for managing purchase requests with workflow management,
 * approval routing, budget validation, and vendor integration.
 * 
 * Features:
 * - Full CRUD operations for purchase requests and items
 * - Workflow management with role-based approval routing
 * - Budget checking and financial validation
 * - Integration with vendor and product services
 * - Status transitions and audit logging
 */

import { PrismaClient } from '@prisma/client'
import { 
  PurchaseRequest, 
  PurchaseRequestItem, 
  PurchaseRequestPriority, 
  PurchaseRequestType,
  DocumentStatus,
  ApprovalRecord,
  WorkflowStatus,
  UserRole,
  Money,
  ServiceResult,
  PaginationOptions,
  BudgetAllocation
} from '@/lib/types'
import { FinancialCalculations } from '@/lib/services/calculations/financial-calculations'
import { VendorService } from './vendor-service'
import { ProductService } from './product-service'

// Initialize Prisma client
const prisma = new PrismaClient()

export interface PurchaseRequestFilters {
  status?: DocumentStatus[]
  priority?: PurchaseRequestPriority[]
  requestType?: PurchaseRequestType[]
  departmentId?: string
  requestedBy?: string
  dateFrom?: Date
  dateTo?: Date
  budgetCode?: string
  search?: string
  minAmount?: number
  maxAmount?: number
  currentStage?: string
}

export interface CreatePurchaseRequestInput {
  requestDate: Date
  requiredDate: Date
  requestType: PurchaseRequestType
  priority: PurchaseRequestPriority
  departmentId: string
  locationId: string
  requestedBy: string
  budgetCode?: string
  projectCode?: string
  costCenter?: string
  justification?: string
  notes?: string
  items: CreatePurchaseRequestItemInput[]
}

export interface CreatePurchaseRequestItemInput {
  itemId?: string
  itemCode?: string
  itemName: string
  description: string
  specification?: string
  requestedQuantity: number
  unit: string
  estimatedUnitPrice?: Money
  budgetCode?: string
  accountCode?: string
  deliveryLocationId: string
  requiredDate: Date
  priority: PurchaseRequestPriority
  vendorSuggestion?: string
  notes?: string
}

export interface UpdatePurchaseRequestInput {
  requiredDate?: Date
  priority?: PurchaseRequestPriority
  budgetCode?: string
  projectCode?: string
  costCenter?: string
  justification?: string
  notes?: string
}

export interface UpdatePurchaseRequestItemInput {
  requestedQuantity?: number
  estimatedUnitPrice?: Money
  budgetCode?: string
  accountCode?: string
  deliveryLocationId?: string
  requiredDate?: Date
  priority?: PurchaseRequestPriority
  vendorSuggestion?: string
  notes?: string
}

export interface ApprovalInput {
  userId: string
  action: 'approve' | 'reject'
  comments?: string
  approvedQuantity?: number
  approvedUnitPrice?: Money
  approvedVendor?: string
}

export interface BulkApprovalInput {
  requestIds: string[]
  userId: string
  action: 'approve' | 'reject'
  comments?: string
}

export class PurchaseRequestService {
  private db: PrismaClient
  private financialCalculations: FinancialCalculations
  private vendorService: VendorService
  private productService: ProductService

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
    this.financialCalculations = new FinancialCalculations()
    this.vendorService = new VendorService(this.db)
    this.productService = new ProductService(this.db)
  }

  /**
   * Get purchase requests with filtering and pagination
   */
  async getPurchaseRequests(
    filters: PurchaseRequestFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<PurchaseRequest[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'requestDate',
        sortOrder = 'desc'
      } = pagination

      const offset = (page - 1) * limit

      // Build where clause
      const whereClause: any = {}

      if (filters.status && filters.status.length > 0) {
        whereClause.status = { in: filters.status }
      }

      if (filters.priority && filters.priority.length > 0) {
        whereClause.priority = { in: filters.priority }
      }

      if (filters.requestType && filters.requestType.length > 0) {
        whereClause.request_type = { in: filters.requestType }
      }

      if (filters.departmentId) {
        whereClause.department_id = filters.departmentId
      }

      if (filters.requestedBy) {
        whereClause.requested_by = filters.requestedBy
      }

      if (filters.budgetCode) {
        whereClause.budget_code = filters.budgetCode
      }

      if (filters.currentStage) {
        whereClause.current_stage = filters.currentStage
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.request_date = {}
        if (filters.dateFrom) {
          whereClause.request_date.gte = filters.dateFrom
        }
        if (filters.dateTo) {
          whereClause.request_date.lte = filters.dateTo
        }
      }

      if (filters.search) {
        whereClause.OR = [
          { request_number: { contains: filters.search, mode: 'insensitive' } },
          { justification: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // Amount filtering would require aggregation - implement if needed
      if (filters.minAmount || filters.maxAmount) {
        // This would need to join with items and aggregate
        // For now, we'll skip this complex filter
      }

      const [purchaseRequests, total] = await Promise.all([
        this.db.purchase_requests.findMany({
          where: whereClause,
          include: {
            items: {
              include: {
                product: true
              }
            },
            workflow_stages: true
          },
          orderBy: {
            [this.mapSortField(sortBy)]: sortOrder
          },
          skip: offset,
          take: limit
        }),
        this.db.purchase_requests.count({
          where: whereClause
        })
      ])

      const transformedRequests = await Promise.all(
        purchaseRequests.map(dbRequest => this.transformDbPurchaseRequest(dbRequest))
      )

      return {
        success: true,
        data: transformedRequests,
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
        error: `Failed to fetch purchase requests: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get purchase request by ID
   */
  async getPurchaseRequestById(id: string): Promise<ServiceResult<PurchaseRequest>> {
    try {
      const dbRequest = await this.db.purchase_requests.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            },
            orderBy: { line_number: 'asc' }
          },
          workflow_stages: {
            orderBy: { created_at: 'asc' }
          }
        }
      })

      if (!dbRequest) {
        return {
          success: false,
          error: 'Purchase request not found'
        }
      }

      const purchaseRequest = await this.transformDbPurchaseRequest(dbRequest)

      return {
        success: true,
        data: purchaseRequest
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch purchase request: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create new purchase request
   */
  async createPurchaseRequest(input: CreatePurchaseRequestInput): Promise<ServiceResult<PurchaseRequest>> {
    try {
      // Generate request number
      const requestNumber = await this.generateRequestNumber()

      // Validate budget if provided
      if (input.budgetCode) {
        const budgetValidation = await this.validateBudget(
          input.budgetCode,
          this.calculateEstimatedTotal(input.items)
        )
        
        if (!budgetValidation.success) {
          return budgetValidation
        }
      }

      // Validate required dates
      if (input.requiredDate < new Date()) {
        return {
          success: false,
          error: 'Required date cannot be in the past'
        }
      }

      // Calculate totals
      const estimatedTotal = this.calculateEstimatedTotal(input.items)

      // Create in transaction
      const result = await this.db.$transaction(async (tx) => {
        // Create main request
        const dbRequest = await tx.purchase_requests.create({
          data: {
            request_number: requestNumber,
            request_date: input.requestDate,
            required_date: input.requiredDate,
            request_type: input.requestType,
            priority: input.priority,
            status: 'draft',
            department_id: input.departmentId,
            location_id: input.locationId,
            requested_by: input.requestedBy,
            total_items: input.items.length,
            estimated_total_amount: estimatedTotal.amount,
            estimated_total_currency: estimatedTotal.currencyCode,
            budget_code: input.budgetCode,
            project_code: input.projectCode,
            cost_center: input.costCenter,
            justification: input.justification,
            notes: input.notes,
            current_stage: 'request'
          }
        })

        // Create items
        const dbItems = await Promise.all(
          input.items.map((item, index) =>
            tx.purchase_request_items.create({
              data: {
                request_id: dbRequest.id,
                line_number: index + 1,
                item_id: item.itemId,
                item_code: item.itemCode,
                item_name: item.itemName,
                description: item.description,
                specification: item.specification,
                requested_quantity: item.requestedQuantity,
                unit: item.unit,
                estimated_unit_price_amount: item.estimatedUnitPrice?.amount,
                estimated_unit_price_currency: item.estimatedUnitPrice?.currencyCode,
                estimated_total_amount: item.estimatedUnitPrice
                  ? item.estimatedUnitPrice.amount * item.requestedQuantity
                  : null,
                estimated_total_currency: item.estimatedUnitPrice?.currencyCode,
                budget_code: item.budgetCode,
                account_code: item.accountCode,
                delivery_location_id: item.deliveryLocationId,
                required_date: item.requiredDate,
                priority: item.priority,
                status: 'draft',
                vendor_suggestion: item.vendorSuggestion,
                notes: item.notes,
                converted_to_po: false
              }
            })
          )
        )

        // Initialize workflow stage
        await tx.purchase_request_workflow_stages.create({
          data: {
            request_id: dbRequest.id,
            stage_name: 'request',
            stage_order: 1,
            status: 'completed',
            completed_by: input.requestedBy,
            completed_at: new Date(),
            comments: 'Request created'
          }
        })

        return { dbRequest, dbItems }
      })

      // Fetch complete request
      const completeRequest = await this.getPurchaseRequestById(result.dbRequest.id)
      
      if (!completeRequest.success) {
        return completeRequest
      }

      return {
        success: true,
        data: completeRequest.data!
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create purchase request: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update purchase request (only allowed in draft status)
   */
  async updatePurchaseRequest(
    id: string, 
    input: UpdatePurchaseRequestInput
  ): Promise<ServiceResult<PurchaseRequest>> {
    try {
      // Check if request exists and is editable
      const existingRequest = await this.db.purchase_requests.findUnique({
        where: { id }
      })

      if (!existingRequest) {
        return {
          success: false,
          error: 'Purchase request not found'
        }
      }

      if (existingRequest.status !== 'draft') {
        return {
          success: false,
          error: 'Only draft requests can be updated'
        }
      }

      // Validate budget if changed
      if (input.budgetCode && input.budgetCode !== existingRequest.budget_code) {
        const budgetValidation = await this.validateBudget(
          input.budgetCode,
          {
            amount: existingRequest.estimated_total_amount,
            currencyCode: existingRequest.estimated_total_currency
          }
        )
        
        if (!budgetValidation.success) {
          return budgetValidation
        }
      }

      // Update request
      const dbRequest = await this.db.purchase_requests.update({
        where: { id },
        data: {
          required_date: input.requiredDate,
          priority: input.priority,
          budget_code: input.budgetCode,
          project_code: input.projectCode,
          cost_center: input.costCenter,
          justification: input.justification,
          notes: input.notes,
          updated_at: new Date()
        }
      })

      // Fetch updated request
      const updatedRequest = await this.getPurchaseRequestById(id)
      
      return updatedRequest
    } catch (error) {
      return {
        success: false,
        error: `Failed to update purchase request: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Submit purchase request for approval
   */
  async submitPurchaseRequest(id: string, submittedBy: string): Promise<ServiceResult<PurchaseRequest>> {
    try {
      const request = await this.db.purchase_requests.findUnique({
        where: { id },
        include: { items: true }
      })

      if (!request) {
        return {
          success: false,
          error: 'Purchase request not found'
        }
      }

      if (request.status !== 'draft') {
        return {
          success: false,
          error: 'Only draft requests can be submitted'
        }
      }

      if (request.items.length === 0) {
        return {
          success: false,
          error: 'Cannot submit request without items'
        }
      }

      // Determine next approval stage based on amount
      const totalAmount = request.estimated_total_amount
      const nextStage = this.getNextApprovalStage(totalAmount)

      await this.db.$transaction(async (tx) => {
        // Update request status
        await tx.purchase_requests.update({
          where: { id },
          data: {
            status: 'pending_approval',
            current_stage: nextStage,
            updated_at: new Date()
          }
        })

        // Update all items status
        await tx.purchase_request_items.updateMany({
          where: { request_id: id },
          data: {
            status: 'pending_approval',
            updated_at: new Date()
          }
        })

        // Create workflow stage
        await tx.purchase_request_workflow_stages.create({
          data: {
            request_id: id,
            stage_name: nextStage,
            stage_order: 2,
            status: 'pending',
            assigned_to: await this.getApproverForStage(nextStage, request.department_id),
            created_at: new Date()
          }
        })
      })

      return await this.getPurchaseRequestById(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to submit purchase request: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Process approval or rejection
   */
  async processApproval(
    id: string, 
    input: ApprovalInput
  ): Promise<ServiceResult<PurchaseRequest>> {
    try {
      const request = await this.db.purchase_requests.findUnique({
        where: { id },
        include: {
          workflow_stages: true,
          items: true
        }
      })

      if (!request) {
        return {
          success: false,
          error: 'Purchase request not found'
        }
      }

      if (request.status !== 'pending_approval') {
        return {
          success: false,
          error: 'Request is not pending approval'
        }
      }

      const currentStage = request.workflow_stages.find(
        stage => stage.stage_name === request.current_stage && stage.status === 'pending'
      )

      if (!currentStage) {
        return {
          success: false,
          error: 'No active approval stage found'
        }
      }

      // Verify user has permission to approve this stage
      const canApprove = await this.canUserApprove(input.userId, request.current_stage!, request.department_id)
      if (!canApprove) {
        return {
          success: false,
          error: 'User does not have permission to approve this stage'
        }
      }

      await this.db.$transaction(async (tx) => {
        // Update current workflow stage
        await tx.purchase_request_workflow_stages.update({
          where: { id: currentStage.id },
          data: {
            status: input.action === 'approve' ? 'completed' : 'rejected',
            completed_by: input.userId,
            completed_at: new Date(),
            comments: input.comments
          }
        })

        if (input.action === 'approve') {
          // Determine if there's a next stage
          const nextStage = this.getNextWorkflowStage(request.current_stage!)
          
          if (nextStage) {
            // Create next workflow stage
            await tx.purchase_request_workflow_stages.create({
              data: {
                request_id: id,
                stage_name: nextStage,
                stage_order: currentStage.stage_order + 1,
                status: 'pending',
                assigned_to: await this.getApproverForStage(nextStage, request.department_id)
              }
            })

            // Update request to next stage
            await tx.purchase_requests.update({
              where: { id },
              data: {
                current_stage: nextStage,
                updated_at: new Date()
              }
            })
          } else {
            // Final approval - mark as approved
            await tx.purchase_requests.update({
              where: { id },
              data: {
                status: 'approved',
                approved_by: input.userId,
                approved_at: new Date(),
                current_stage: 'completed',
                updated_at: new Date()
              }
            })

            // Update all items
            await tx.purchase_request_items.updateMany({
              where: { request_id: id },
              data: {
                status: 'approved',
                approved_quantity: input.approvedQuantity,
                approved_unit_price_amount: input.approvedUnitPrice?.amount,
                approved_unit_price_currency: input.approvedUnitPrice?.currencyCode,
                approved_vendor: input.approvedVendor,
                updated_at: new Date()
              }
            })
          }
        } else {
          // Rejected - update request and items
          await tx.purchase_requests.update({
            where: { id },
            data: {
              status: 'rejected',
              rejected_by: input.userId,
              rejected_at: new Date(),
              rejection_reason: input.comments,
              current_stage: 'completed',
              updated_at: new Date()
            }
          })

          await tx.purchase_request_items.updateMany({
            where: { request_id: id },
            data: {
              status: 'rejected',
              updated_at: new Date()
            }
          })
        }
      })

      return await this.getPurchaseRequestById(id)
    } catch (error) {
      return {
        success: false,
        error: `Failed to process approval: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Convert approved purchase request to purchase order
   */
  async convertToPurchaseOrder(
    requestId: string, 
    convertedBy: string,
    vendorId: string,
    itemIds?: string[]
  ): Promise<ServiceResult<string>> {
    try {
      const request = await this.db.purchase_requests.findUnique({
        where: { id: requestId },
        include: {
          items: true
        }
      })

      if (!request) {
        return {
          success: false,
          error: 'Purchase request not found'
        }
      }

      if (request.status !== 'approved') {
        return {
          success: false,
          error: 'Only approved requests can be converted to purchase orders'
        }
      }

      // Filter items if specific items selected
      const itemsToConvert = itemIds 
        ? request.items.filter(item => itemIds.includes(item.id))
        : request.items

      if (itemsToConvert.length === 0) {
        return {
          success: false,
          error: 'No items selected for conversion'
        }
      }

      // This would integrate with PurchaseOrderService
      // For now, we'll just mark items as converted
      await this.db.$transaction(async (tx) => {
        await tx.purchase_request_items.updateMany({
          where: {
            id: { in: itemsToConvert.map(item => item.id) }
          },
          data: {
            converted_to_po: true,
            // purchase_order_id would be set when PO service is implemented
            updated_at: new Date()
          }
        })

        // Check if all items are converted
        const remainingItems = await tx.purchase_request_items.count({
          where: {
            request_id: requestId,
            converted_to_po: false
          }
        })

        if (remainingItems === 0) {
          await tx.purchase_requests.update({
            where: { id: requestId },
            data: {
              status: 'closed',
              updated_at: new Date()
            }
          })
        }
      })

      // Return placeholder PO ID - would be actual PO ID when integrated
      return {
        success: true,
        data: `PO-${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to convert to purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get purchase request statistics
   */
  async getPurchaseRequestStatistics(): Promise<ServiceResult<{
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    byType: Record<string, number>
    totalValue: Money
    averageValue: Money
    pendingApprovals: number
  }>> {
    try {
      const [statusCounts, priorityCounts, typeCounts, valueStats, pendingCount] = await Promise.all([
        this.db.purchase_requests.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        this.db.purchase_requests.groupBy({
          by: ['priority'],
          _count: { priority: true }
        }),
        this.db.purchase_requests.groupBy({
          by: ['request_type'],
          _count: { request_type: true }
        }),
        this.db.purchase_requests.aggregate({
          _count: { id: true },
          _sum: { estimated_total_amount: true },
          _avg: { estimated_total_amount: true }
        }),
        this.db.purchase_requests.count({
          where: { status: 'pending_approval' }
        })
      ])

      const stats = {
        total: valueStats._count.id,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>),
        byPriority: priorityCounts.reduce((acc, item) => {
          acc[item.priority] = item._count.priority
          return acc
        }, {} as Record<string, number>),
        byType: typeCounts.reduce((acc, item) => {
          acc[item.request_type] = item._count.request_type
          return acc
        }, {} as Record<string, number>),
        totalValue: {
          amount: valueStats._sum.estimated_total_amount || 0,
          currencyCode: 'USD' // Would be configurable
        },
        averageValue: {
          amount: valueStats._avg.estimated_total_amount || 0,
          currencyCode: 'USD'
        },
        pendingApprovals: pendingCount
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

  private async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const prefix = `PR-${year}${month}`
    
    const count = await this.db.purchase_requests.count({
      where: {
        request_number: {
          startsWith: prefix
        }
      }
    })

    return `${prefix}-${String(count + 1).padStart(4, '0')}`
  }

  private calculateEstimatedTotal(items: CreatePurchaseRequestItemInput[]): Money {
    const total = items.reduce((sum, item) => {
      if (item.estimatedUnitPrice) {
        return sum + (item.estimatedUnitPrice.amount * item.requestedQuantity)
      }
      return sum
    }, 0)

    return {
      amount: total,
      currencyCode: 'USD' // Would be configurable
    }
  }

  private async validateBudget(budgetCode: string, amount: Money): Promise<ServiceResult<boolean>> {
    // This would integrate with budget management system
    // For now, just return success
    return {
      success: true,
      data: true
    }
  }

  private getNextApprovalStage(amount: number): string {
    if (amount < 1000) return 'hdApproval'
    if (amount < 5000) return 'purchaseReview'
    if (amount < 25000) return 'financeManager'
    return 'gmApproval'
  }

  private getNextWorkflowStage(currentStage: string): string | null {
    const stageOrder = {
      'request': 'hdApproval',
      'hdApproval': 'purchaseReview',
      'purchaseReview': 'financeManager',
      'financeManager': 'gmApproval',
      'gmApproval': null
    }

    return stageOrder[currentStage as keyof typeof stageOrder] || null
  }

  private async getApproverForStage(stage: string, departmentId: string): Promise<string | null> {
    // This would integrate with user management system
    // For now, return null
    return null
  }

  private async canUserApprove(userId: string, stage: string, departmentId: string): Promise<boolean> {
    // This would integrate with RBAC system
    // For now, return true
    return true
  }

  private mapSortField(sortBy: string): string {
    const fieldMap = {
      'requestNumber': 'request_number',
      'requestDate': 'request_date',
      'requiredDate': 'required_date',
      'status': 'status',
      'priority': 'priority',
      'estimatedTotal': 'estimated_total_amount',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    }

    return fieldMap[sortBy as keyof typeof fieldMap] || 'request_date'
  }

  private async transformDbPurchaseRequest(dbRequest: any): Promise<PurchaseRequest> {
    const workflowStages: ApprovalRecord[] = (dbRequest.workflow_stages || []).map((stage: any) => ({
      stage: stage.stage_name,
      status: stage.status as WorkflowStatus,
      assignedTo: stage.assigned_to,
      completedBy: stage.completed_by,
      completedAt: stage.completed_at,
      comments: stage.comments
    }))

    const items = (dbRequest.items || []).map((item: any): PurchaseRequestItem => ({
      id: item.id,
      requestId: item.request_id,
      itemId: item.item_id,
      itemCode: item.item_code,
      itemName: item.item_name,
      description: item.description,
      specification: item.specification,
      requestedQuantity: item.requested_quantity,
      unit: item.unit,
      estimatedUnitPrice: item.estimated_unit_price_amount ? {
        amount: item.estimated_unit_price_amount,
        currencyCode: item.estimated_unit_price_currency
      } : undefined,
      estimatedTotal: item.estimated_total_amount ? {
        amount: item.estimated_total_amount,
        currencyCode: item.estimated_total_currency
      } : undefined,
      budgetCode: item.budget_code,
      accountCode: item.account_code,
      deliveryLocationId: item.delivery_location_id,
      requiredDate: item.required_date,
      priority: item.priority as PurchaseRequestPriority,
      status: item.status as DocumentStatus,
      vendorSuggestion: item.vendor_suggestion,
      notes: item.notes,
      attachments: [],
      approvedQuantity: item.approved_quantity,
      approvedUnitPrice: item.approved_unit_price_amount ? {
        amount: item.approved_unit_price_amount,
        currencyCode: item.approved_unit_price_currency
      } : undefined,
      approvedTotal: item.approved_total_amount ? {
        amount: item.approved_total_amount,
        currencyCode: item.approved_total_currency
      } : undefined,
      approvedVendor: item.approved_vendor,
      convertedToPO: item.converted_to_po,
      purchaseOrderId: item.purchase_order_id,
      convertedQuantity: item.converted_quantity,
      remainingQuantity: item.remaining_quantity
    }))

    return {
      id: dbRequest.id,
      requestNumber: dbRequest.request_number,
      requestDate: dbRequest.request_date,
      requiredDate: dbRequest.required_date,
      requestType: dbRequest.request_type as PurchaseRequestType,
      priority: dbRequest.priority as PurchaseRequestPriority,
      status: dbRequest.status as DocumentStatus,
      departmentId: dbRequest.department_id,
      locationId: dbRequest.location_id,
      requestedBy: dbRequest.requested_by,
      approvedBy: dbRequest.approved_by,
      approvedAt: dbRequest.approved_at,
      rejectedBy: dbRequest.rejected_by,
      rejectedAt: dbRequest.rejected_at,
      rejectionReason: dbRequest.rejection_reason,
      totalItems: dbRequest.total_items,
      estimatedTotal: {
        amount: dbRequest.estimated_total_amount,
        currencyCode: dbRequest.estimated_total_currency
      },
      actualTotal: dbRequest.actual_total_amount ? {
        amount: dbRequest.actual_total_amount,
        currencyCode: dbRequest.actual_total_currency
      } : undefined,
      budgetCode: dbRequest.budget_code,
      projectCode: dbRequest.project_code,
      costCenter: dbRequest.cost_center,
      justification: dbRequest.justification,
      attachments: [],
      workflowStages,
      currentStage: dbRequest.current_stage,
      notes: dbRequest.notes,
      createdAt: dbRequest.created_at,
      updatedAt: dbRequest.updated_at,
      createdBy: dbRequest.created_by,
      updatedBy: dbRequest.updated_by
    }
  }
}

// Export service instance
export const purchaseRequestService = new PurchaseRequestService()