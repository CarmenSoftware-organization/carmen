/**
 * Procurement Types
 * 
 * Types and interfaces for procurement operations including purchase requests,
 * purchase orders, goods receipt notes, and related procurement functionality.
 */

import { AuditTimestamp, DocumentStatus, Money, WorkflowStatus, ApprovalRecord } from './common'

// ====== PURCHASE REQUEST ======

/**
 * Purchase request priority levels
 */
export type PurchaseRequestPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

/**
 * Purchase request types (enum for consistency with existing code)
 */
export enum PRType {
  GeneralPurchase = 'GeneralPurchase',
  ServiceRequest = 'ServiceRequest',
  CapitalExpenditure = 'CapitalExpenditure',
  Maintenance = 'Maintenance',
  Emergency = 'Emergency'
}

/**
 * Purchase request types (legacy type, prefer using PRType enum)
 */
export type PurchaseRequestType = 'goods' | 'services' | 'capital' | 'maintenance' | 'emergency';

/**
 * Workflow stages for purchase requests
 */
export enum WorkflowStage {
  requester = 'requester',
  departmentHeadApproval = 'departmentHeadApproval',
  purchaseCoordinatorReview = 'purchaseCoordinatorReview',
  financeManagerApproval = 'financeManagerApproval',
  generalManagerApproval = 'generalManagerApproval',
  completed = 'completed'
}

/**
 * Requestor information for purchase requests
 */
export interface Requestor {
  id: string;
  name: string;
  email?: string;
  departmentId: string;
  departmentName?: string;
}

/**
 * Purchase request header
 */
export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  requestDate: Date;
  requiredDate: Date;
  requestType: PurchaseRequestType;
  priority: PurchaseRequestPriority;
  status: DocumentStatus;
  departmentId: string;
  locationId: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  totalItems: number;
  estimatedTotal: Money;
  actualTotal?: Money;
  budgetCode?: string;
  projectCode?: string;
  costCenter?: string;
  justification?: string;
  attachments?: string[];
  workflowStages: ApprovalRecord[];
  currentStage?: string;
  notes?: string;
}

/**
 * Purchase request line item
 */
export interface PurchaseRequestItem {
  id: string;
  requestId: string;
  itemId?: string; // Optional for non-catalog items
  itemCode?: string;
  itemName: string;
  description: string;
  specification?: string;
  requestedQuantity: number;
  unit: string;
  estimatedUnitPrice?: Money;
  estimatedTotal?: Money;
  budgetCode?: string;
  accountCode?: string;
  deliveryLocationId: string;
  requiredDate: Date;
  priority: PurchaseRequestPriority;
  status: DocumentStatus;
  vendorSuggestion?: string;
  notes?: string;
  attachments?: string[];
  // Workflow tracking
  approvedQuantity?: number;
  approvedUnitPrice?: Money;
  approvedTotal?: Money;
  approvedVendor?: string;
  // Conversion tracking
  convertedToPO: boolean;
  purchaseOrderId?: string;
  convertedQuantity?: number;
  remainingQuantity?: number;
}

// ====== PURCHASE ORDER ======

/**
 * Purchase order status types
 */
export enum PurchaseOrderStatus {
  DRAFT = "Draft",
  SENT = "Sent",
  OPEN = "Open",
  PARTIAL = "Partial",
  FULLY_RECEIVED = "FullyReceived",
  CLOSED = "Closed",
  CANCELLED = "Cancelled",
  VOIDED = "Voided",
  DELETED = "Deleted"
}

/**
 * Purchase order terms and conditions
 */
export interface PurchaseOrderTerms {
  paymentTerms: string;
  deliveryTerms: string;
  warrantyPeriod?: number; // in days
  returnPolicy?: string;
  penaltyClause?: string;
  specialInstructions?: string;
}

/**
 * Purchase order header
 */
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: Date;
  vendorId: string;
  vendorName: string;
  vendorAddress?: string;
  vendorContact?: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'partial_received' | 'fully_received' | 'cancelled' | 'closed';
  currency: string;
  exchangeRate: number;
  subtotal: Money;
  taxAmount: Money;
  discountAmount: Money;
  totalAmount: Money;
  deliveryLocationId: string;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  paymentTerms: string;
  terms: PurchaseOrderTerms;
  approvedBy: string;
  approvedAt: Date;
  sentBy?: string;
  sentAt?: Date;
  acknowledgedAt?: Date;
  closedBy?: string;
  closedAt?: Date;
  closureReason?: string;
  totalItems: number;
  receivedItems: number;
  pendingItems: number;
  notes?: string;
  attachments?: string[];
}

/**
 * Purchase order line item
 */
export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemName: string;
  description: string;
  specification?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  unit: string;
  unitPrice: Money;
  discount: number; // percentage
  discountAmount: Money;
  lineTotal: Money;
  taxRate: number; // percentage
  taxAmount: Money;
  deliveryDate: Date;
  status: 'pending' | 'partial_received' | 'fully_received' | 'cancelled';
  notes?: string;
  // Source tracking
  sourceRequestId?: string;
  sourceRequestItemId?: string;
}

// ====== GOODS RECEIPT NOTE ======

/**
 * Cost distribution method for extra costs in GRN
 */
export enum CostDistributionMethod {
  NET_AMOUNT = "net-amount",
  QUANTITY_RATIO = "quantity-ratio",
}

/**
 * GRN status types
 */
export enum GRNStatus {
  DRAFT = "DRAFT",
  RECEIVED = "RECEIVED",
  COMMITTED = "COMMITTED",
  VOID = "VOID"
}

/**
 * Goods receipt note header
 */
export interface GoodsReceiveNote {
  id: string;
  grnNumber: string;
  receiptDate: Date;
  vendorId: string;
  vendorName: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  deliveryNote?: string;
  vehicleNumber?: string;
  driverName?: string;
  status: GRNStatus;
  receivedBy: string;
  checkedBy?: string;
  approvedBy?: string;
  locationId: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: Money;
  discrepancies: number;
  notes?: string;
  attachments?: string[];
  qualityCheckRequired: boolean;
  qualityCheckPassed?: boolean;
  qualityCheckedBy?: string;
  qualityCheckedAt?: Date;
}

/**
 * Goods receipt note line item
 */
export interface GoodsReceiveNoteItem {
  id: string;
  grnId: string;
  lineNumber: number;
  purchaseOrderItemId?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description: string;
  orderedQuantity?: number;
  deliveredQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  damagedQuantity: number;
  unit: string;
  unitPrice: Money;
  totalValue: Money;
  batchNumber?: string;
  lotNumber?: string;
  serialNumbers?: string[];
  manufacturingDate?: Date;
  expiryDate?: Date;
  storageLocationId: string;
  qualityStatus: 'pending' | 'passed' | 'failed' | 'conditional';
  rejectionReason?: string;
  notes?: string;
  // Discrepancy tracking
  hasDiscrepancy: boolean;
  discrepancyType?: 'quantity' | 'quality' | 'specification' | 'damage';
  discrepancyNotes?: string;
}

// ====== CREDIT NOTE ======

/**
 * Credit note for purchase returns and adjustments
 */
export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  creditDate: Date;
  vendorId: string;
  vendorName: string;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: Date;
  grnId?: string;
  grnNumber?: string;
  reason: CreditNoteReason;
  status: DocumentStatus;
  currency: string;
  subtotal: Money;
  taxAmount: Money;
  totalAmount: Money;
  processedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  attachments?: string[];
}

/**
 * Credit note reasons
 */
export enum CreditNoteReason {
  GOODS_RETURN = "GOODS_RETURN",
  PRICE_ADJUSTMENT = "PRICE_ADJUSTMENT",
  QUANTITY_VARIANCE = "QUANTITY_VARIANCE",
  QUALITY_ISSUE = "QUALITY_ISSUE",
  DAMAGED_GOODS = "DAMAGED_GOODS",
  INVOICE_ERROR = "INVOICE_ERROR",
  EARLY_PAYMENT_DISCOUNT = "EARLY_PAYMENT_DISCOUNT",
  OTHER = "OTHER"
}

/**
 * Credit note line item
 */
export interface CreditNoteItem {
  id: string;
  creditNoteId: string;
  grnItemId?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: Money;
  discount: number;
  discountAmount: Money;
  lineTotal: Money;
  taxRate: number;
  taxAmount: Money;
  reason: string;
  notes?: string;
}

// ====== QUOTATIONS ======

/**
 * Vendor quotation
 */
export interface VendorQuotation {
  id: string;
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
  vendorId: string;
  vendorName: string;
  requestForQuotationId?: string;
  currency: string;
  exchangeRate: number;
  subtotal: Money;
  taxAmount: Money;
  totalAmount: Money;
  deliveryPeriod: number; // in days
  paymentTerms: string;
  warrantyPeriod?: number; // in days
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired';
  submittedBy?: string;
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  attachments?: string[];
}

/**
 * Quotation line item
 */
export interface QuotationItem {
  id: string;
  quotationId: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemName: string;
  description: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitPrice: Money;
  discount: number;
  discountAmount: Money;
  lineTotal: Money;
  deliveryPeriod: number;
  brandOffered?: string;
  modelNumber?: string;
  notes?: string;
}

// ====== VENDOR EVALUATION ======

/**
 * Vendor performance evaluation
 */
export interface VendorEvaluation {
  id: string;
  vendorId: string;
  evaluationPeriod: {
    startDate: Date;
    endDate: Date;
  };
  evaluatedBy: string;
  evaluationDate: Date;
  // Performance metrics
  qualityScore: number; // 0-100
  deliveryScore: number; // 0-100
  priceScore: number; // 0-100
  serviceScore: number; // 0-100
  overallScore: number; // 0-100
  // Detailed metrics
  onTimeDeliveryRate: number; // percentage
  qualityRejectRate: number; // percentage
  invoiceAccuracyRate: number; // percentage
  responsiveness: number; // 1-5 scale
  // Summary
  totalOrders: number;
  totalValue: Money;
  averageOrderValue: Money;
  recommendations: string;
  issues: string[];
  actionItems: string[];
  nextReviewDate: Date;
}

// ====== PROCUREMENT ANALYTICS ======

/**
 * Procurement metrics for analytics
 */
export interface ProcurementMetrics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalPurchaseRequests: number;
  totalPurchaseOrders: number;
  totalSpend: Money;
  averageProcessingTime: number; // in days
  onTimeDeliveryRate: number; // percentage
  costSavings: Money;
  vendorCount: number;
  // Top performers
  topVendorsByValue: {
    vendorId: string;
    vendorName: string;
    totalValue: Money;
    orderCount: number;
  }[];
  topCategoriesByValue: {
    categoryId: string;
    categoryName: string;
    totalValue: Money;
    orderCount: number;
  }[];
}

// ====== WORKFLOW TYPES ======

/**
 * Workflow stage types for procurement
 */
export type WorkflowStageType = 
  | 'request' 
  | 'hdApproval' 
  | 'purchaseReview' 
  | 'financeManager' 
  | 'gmApproval'
  | 'completed';

/**
 * User roles for procurement workflow
 */
export type UserRole = 
  | "staff" 
  | "hd" 
  | "purchase_staff" 
  | "finance_manager" 
  | "gm";

/**
 * Enhanced workflow stage with procurement-specific fields
 */
export interface ProcurementWorkflowStage {
  status: WorkflowStatus;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  comments?: string;
  // Stage-specific fields
  approvedQuantity?: number;
  approvedUnit?: string;
  vendorAssigned?: string;
  priceVerified?: boolean;
}

// ====== BUDGET AND COST CENTER ======

/**
 * Budget allocation for procurement
 */
export interface BudgetAllocation {
  id: string;
  budgetCode: string;
  budgetName: string;
  fiscalYear: string;
  departmentId: string;
  categoryId?: string;
  totalBudget: Money;
  allocatedAmount: Money;
  spentAmount: Money;
  committedAmount: Money;
  availableAmount: Money;
  utilizationRate: number; // percentage
  lastUpdated: Date;
}

/**
 * Cost center for expense tracking
 */
export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId: string;
  managerId: string;
  isActive: boolean;
}