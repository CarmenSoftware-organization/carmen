// File: types/inventory.ts

// Common Types and Enums

export enum DocumentStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED'
  }
  
  export type Money = {
    amount: number;
    currency: string;
  };
  
  // Currency and Exchange Rate Types
  
  export interface Currency {
    id: number;
    code: string;
    description: string;
    active: boolean;
    currency: string; // Currency symbol or code
  }
  
  export interface ExchangeRate {
    id: number;
    currencyCode: string;
    currencyName: string;
    rate: number;
    lastUpdated: string;
  }
  
  // Inventory Types
  
  export interface Item {
    itemId: number;
    itemCode: string;
    itemName: string;
    description?: string;
    categoryId: number;
    baseUnitId: number;
    costingMethod: CostingMethod;
    isActive: boolean;
    isSerialized: boolean;
    minimumQuantity?: number;
    maximumQuantity?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    leadTime?: number;
    lastPurchaseDate?: Date;
    lastPurchasePrice?: number;
    lastSaleDate?: Date;
    lastSalePrice?: number;
  }
  
  export enum CostingMethod {
    FIFO = 'FIFO',
    MOVING_AVERAGE = 'MOVING_AVERAGE',
    WEIGHTED_AVERAGE = 'WEIGHTED_AVERAGE'
  }
  
  export interface InventoryTransaction {
    transactionId: number;
    itemId: number;
    locationId: number;
    transactionType: TransactionType;
    quantity: number;
    unitCost: number;
    totalCost: number;
    transactionDate: Date;
    referenceNo?: string;
    referenceType?: string;
    userId: number;
    notes?: string;
  }
  
  export enum TransactionType {
    RECEIVE = 'RECEIVE',
    ISSUE = 'ISSUE',
    TRANSFER = 'TRANSFER',
    ADJUST = 'ADJUST'
  }
  
  // Goods Receive Note (GRN) Types
  
  export interface GoodsReceiveNote {
    grnRefNo: string;
    date: Date;
    invoiceDate?: Date;
    invoiceNo?: string;
    taxInvoiceDate?: Date;
    taxInvoiceNo?: string;
    description?: string;
    receiverId: number;
    vendorId: number;
    locationId: number;
    currencyCode: string;
    exchangeRate: number;
    status: GRNStatus;
    isConsignment: boolean;
    isCash: boolean;
    cashBookId?: number;
  }
  
  export enum GRNStatus {
    RECEIVED = 'RECEIVED',
    COMMITTED = 'COMMITTED',
    VOID = 'VOID'
  }
  
  export interface GRNItem {
    grnItemId: number;
    grnRefNo: string;
    poLineId: number;
    itemId: number;
    storeLocationId: number;
    receivedQuantity: number;
    receivedUnitId: number;
    isFOC: boolean;
    price: number;
    taxAmount: number;
    totalAmount: number;
    status: GRNItemStatus;
    deliveryPoint?: string;
    basePrice: number;
    baseQuantity: number;
    extraCost: number;
    totalCost: number;
    discountAdjustment: boolean;
    discountAmount?: number;
    taxAdjustment: boolean;
    lotNumber?: string;
    expiryDate?: Date;
    comment?: string;
  }
  
  export enum GRNItemStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
  }
  
  // Purchase Order (PO) Types
  
  export interface PurchaseOrder {
    poId: number;
    vendorId: number;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    status: PurchaseOrderStatus;
    totalAmount: number;
    currencyCode: string;
    exchangeRate: number;
    notes?: string;
    createdBy: number;
    approvedBy?: number;
    approvalDate?: Date;
  }
  
  export enum PurchaseOrderStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    FULLY_RECEIVED = 'FULLY_RECEIVED',
    CANCELLED = 'CANCELLED'
  }
  
  export interface PurchaseOrderLine {
    poLineId: number;
    poId: number;
    itemId: number;
    orderedQuantity: number;
    orderedUnitId: number;
    unitPrice: number;
    receivedQuantity: number;
    lineStatus: POLineStatus;
    lastReceiveDate?: Date;
    lastPrice?: number;
    lastVendorId?: number;
  }
  
  export enum POLineStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED'
  }
  
  // Purchase Request (PR) Types
  
  export interface PurchaseRequest {
    id: string;
    refNumber: string;
    date: Date;
    type: PRType;
    description: string;
    requestorId: string;
    requestor: {
      name: string;
      id: string;
      department: string;
    };
    currency: string;
    status: DocumentStatus;
    workflowStatus: WorkflowStatus;
    currentWorkflowStage: WorkflowStage;
    location: string;
    items: PurchaseRequestItem[];
    attachments: Attachment[];
    subtotal: Money;
    tax: Money;
    totalAmount: Money;
    jobCode: string;
    department: string;
    budgetCode: string;
    allocatedBudget: Money;
    yearToDateSpending: Money;
    exchangeRate: number;
    exchangeRateDate: Date;
    paymentMethod?: string;
    paymentTerms?: string;
    earlyPaymentDiscount?: string;
    comments: Comment[];
    approvals: WorkflowStep[];
    deliveryPoint: string;
    activityLog: ActivityLogEntry[];
    additionalCharges: Money;
  }
  
  export enum PRType {
    GENERAL_PURCHASE = 'GENERAL_PURCHASE',
    MARKET_LIST = 'MARKET_LIST',
    ASSET_PURCHASE = 'ASSET_PURCHASE',
    SERVICE_REQUEST = 'SERVICE_REQUEST'
  }
  
  export enum WorkflowStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
  }
  
  export enum WorkflowStage {
    REQUESTER = 'REQUESTER',
    DEPARTMENT_HEAD_APPROVAL = 'DEPARTMENT_HEAD_APPROVAL',
    PURCHASE_COORDINATOR_REVIEW = 'PURCHASE_COORDINATOR_REVIEW',
    FINANCE_MANAGER_APPROVAL = 'FINANCE_MANAGER_APPROVAL',
    GENERAL_MANAGER_APPROVAL = 'GENERAL_MANAGER_APPROVAL',
    COMPLETED = 'COMPLETED'
  }
  
  export interface PurchaseRequestItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: Money;
    totalPrice: Money;
  }
  
  export interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    uploadDate: Date;
    uploaderId: string;
  }
  
  export interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
  }
  
  export interface WorkflowStep {
    stage: WorkflowStage;
    status: WorkflowStatus;
  }
  
  export interface ActivityLogEntry {
    id: string;
    userId: string;
    activityType: string;
    description: string;
    timestamp: Date;
  }
  