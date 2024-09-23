// File: types/inventory.ts

// Common Types and Enums

// export const DocumentStatus = () => {
//   return{
//     DRAFT : {value : 1, label : 'DRAFT'},
//     IN_PROGRESS : {value : 2, label : 'IN PROGRESS'},
//     COMPLETED : {value : 3, label : 'COMPLETED'},
//     VOID :  {value : 4, label : 'VOID'},
//   }
// }

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
  FIFO = "FIFO",
  MOVING_AVERAGE = "MOVING_AVERAGE",
  WEIGHTED_AVERAGE = "WEIGHTED_AVERAGE",
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
  RECEIVE = "RECEIVE",
  ISSUE = "ISSUE",
  TRANSFER = "TRANSFER",
  ADJUST = "ADJUST",
}

// Goods Receive Note (GRN) Types

// export interface GoodsReceiveNote {
//   grnRefNo: string;
//   date: Date;
//   invoiceDate?: Date;
//   invoiceNo?: string;
//   taxInvoiceDate?: Date;
//   taxInvoiceNo?: string;
//   description?: string;
//   receiverId: number;
//   vendorId: number;
//   locationId: number;
//   currencyCode: string;
//   exchangeRate: number;
//   status: GRNStatus;
//   isConsignment: boolean;
//   isCash: boolean;
//   cashBookId?: number;
// }

export enum GRNStatus {
  RECEIVED = "RECEIVED",
  COMMITTED = "COMMITTED",
  VOID = "VOID",
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
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

// Purchase Order (PO) Types

export interface PurchaseOrder {
  poId: number;
  number: string;
  vendorId: number;
  vendorName: string;
  orderDate: Date;
  DeliveryDate?: Date | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  currencyCode: string;
  exchangeRate: number;
  notes?: string;
  createdBy: number;
  approvedBy?: number;
  approvalDate?: Date;
  email: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  // code: string;
  name: string;
  description: string;
  convRate: number;
  orderedQuantity: number;
  orderUnit: string;
  baseQuantity: number;
  baseUnit: string;
  baseReceivingQty: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  isFOC: boolean;
  taxRate : number;
  taxAmount : number;
  baseTaxAmount : number;
  discountRate : number;
  discountAmount : number;
  attachments?: Attachment[];
  comment?: string;
  netAmount?: number;
  baseNetAmount?: number;
  adjustments?: {
    discount: boolean;
    tax: boolean;
  };
  lastReceiveDate?: Date;
  lastPrice?: number;
  lastVendorId?: number;
  baseDiscAmount?: number;
  totalAmount?: number; 
  baseTotalAmount?: number;
  attachedFile?: File | null;
}

export enum PurchaseOrderStatus {
  OPEN = "OPEN",
  VOIDED = "VOIDED",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
  SENT = "SENT",
  PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
  FULLY_RECEIVED = "FULLY_RECEIVED",
  CANCELLED = "CANCELLED",
  DELETED = "DELETED",
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
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

// Purchase Request (PR) Types

export interface PurchaseRequest_1 {
  id: string;
  refNumber: string;
  date: Date;
  type: PRType;
  deliveryDate: Date;
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

// export enum WorkflowStatus {
//   PENDING = "PENDING",
//   APPROVED = "APPROVED",
//   REJECTED = "REJECTED",
//   DRAFT = "DRAFT",
//   SUBMITTED = "SUBMITTED",
//   REVISION = "REVISION",
// }

// export enum WorkflowStage {
//   REQUESTER = "REQUESTER",
//   DEPARTMENT_HEAD_APPROVAL = "DEPARTMENT_HEAD_APPROVAL",
//   PURCHASE_COORDINATOR_REVIEW = "PURCHASE_COORDINATOR_REVIEW",
//   FINANCE_MANAGER_APPROVAL = "FINANCE_MANAGER_APPROVAL",
//   GENERAL_MANAGER_APPROVAL = "GENERAL_MANAGER_APPROVAL",
//   COMPLETED = "COMPLETED",
// }

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

export interface GoodsReceiveNote {
  id: string;
  ref: string;
  date: string;
  invoiceDate: string;
  invoiceNumber: string;
  taxInvoiceDate?: string;
  taxInvoiceNumber?: string;
  description: string;
  receiver: string;
  vendor: string;
  location: string;
  currency: string;
  status: GoodsReceiveNoteStatus;
  isConsignment: boolean;
  isCash: boolean;
  cashBook?: string;
  items: GoodsReceiveNoteItem[];
  stockMovements: StockMovement[];
  extraCosts: ExtraCost[];
  comments: Comment[];
  attachments: Attachment[];
  activityLog: ActivityLogEntry[];
  financialSummary: FinancialSummary;
}

export interface GoodsReceiveNoteItem {
  id: number;
  name: string;
  description: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  netAmount: number;
  expiryDate?: string;
  batchNumber?: string;
  serialNumber?: string;
  notes?: string;
  baseQuantity: number;
  basePrice: number;
  baseUnit: string;
  conversionRate: number;
  extraCost: number;
  applyDiscount: boolean;
  applyTax: boolean;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  inventoryReorderThreshold: number;
  inventoryRestockLevel: number;
  purchaseOrderRef: string;
  lastPurchasePrice: number;
  lastVendor: string;
  lotNumber: string;
  deliveryPoint: string;
  location: string;
  isFreeOfCharge: boolean; // Add this line
}

export interface StockMovement {
  id: number;
  itemName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  date: string;
  status: string;
}

export type GoodsReceiveNoteMode = "view" | "edit" | "create";

export type GoodsReceiveNoteStatus =
  | "pending"
  | "received"
  | "partially_received"
  | "cancelled"
  | "void";

export type CostType = "shipping" | "handling" | "insurance" | "other";

export interface ExtraCost {
  id: string;
  type: CostType;
  amount: number;
}

export interface FinancialSummary {
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  baseNetAmount: number;
  baseTaxAmount: number;
  baseTotalAmount: number;
  baseCurrency: string;
  jvType: string;
  jvNumber: string;
  jvDate: string;
  jvDescription: string;
  jvStatus: string;
  jvReference: string;
  jvDetail: JournalEntryDetail[];
  jvTotal: JournalEntryTotal;
}

export interface JournalEntryDetail {
  department: Department;
  accountCode: AccountCode;
  accountName: string;
  currency: string;
  debit: number;
  credit: number;
  baseCurrency: string;
  baseDebit: number;
  baseCredit: number;
}

export interface JournalEntryTotal {
  debit: number;
  credit: number;
  baseDebit: number;
  baseCredit: number;
  baseCurrency: string;
}

export interface Comment {
  id: string;
  number: number;
  date: string;
  author: string;
  text: string;
}

export interface Attachment {
  id: string;
  number: number;
  fileName: string;
  description: string;
  publicAccess: boolean;
  date: string;
  uploader: string;
}

export interface ActivityLogEntry {
  id: string;
  dateTime: string;
  user: string;
  action: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface AccountCode {
  id: string;
  code: string;
  name: string;
}

export enum PRType {
  GeneralPurchase = "GeneralPurchase",
  MarketList = "MarketList",
  AssetPurchase = "AssetPurchase",
  ServiceRequest = "ServiceRequest",
}

export enum DocumentStatus {
  Draft = "Draft",
  Submitted = "Submitted",
  InProgress = "InProgress",
  Completed = "Completed",
  Rejected = "Rejected",
}

export enum WorkflowStatus {
  pending = "Pending",
  approved = "Approved",
  rejected = "Rejected",
}

export enum WorkflowStage {
  requester = "Requester",
  departmentHeadApproval = "DepartmentHeadApproval",
  purchaseCoordinatorReview = "PurchaseCoordinatorReview",
  financeManagerApproval = "FinanceManagerApproval",
  generalManagerApproval = "GeneralManagerApproval",
  completed = "Completed",
}

export interface PurchaseRequest {
  id: string;
  refNumber: string;
  date: Date;
  vendor: string;
  vendorId: number;
  type: PRType;
  deliveryDate: Date;
  description: string;
  requestorId: string;
  requestor: {
    name: string;
    id: string;
    department: string;
  };
  status: DocumentStatus;
  workflowStatus: WorkflowStatus;
  currentWorkflowStage: WorkflowStage;
  location: string;
  department: string;
  jobCode: string;
  estimatedTotal: number;
}

export type WorkflowAction = "approve" | "reject" | "sendBack";

export interface ItemDetail {
  id: string;
  location: string;
  product: string;
  comment: string;
  unit: string;
  request: {
    quantity: number;
    ordering: number;
  };
  approve: {
    quantity: number;
    onHand: number;
  };
  currency: string;
  price: {
    current: number;
    last: number;
  };
  total: number;
  status: "A" | "R";
}

export interface BudgetData {
  location: string;
  budgetCategory: string;
  totalBudget: number;
  softCommitmentPR: number;
  softCommitmentPO: number;
  hardCommitment: number;
  availableBudget: number;
  currentPRAmount: number;
}

/* start */
//   export enum PRType {
//     GeneralPurchase = 'General Purchase',
//     MarketList = 'Market List',
//     AssetPurchase = 'Asset Purchase'
//   }

//   export enum DocumentStatus {
//     Draft = 'Draft',
//     Submitted = 'Submitted',
//     InProgress = 'In Progress',
//     Approved = 'Approved',
//     Rejected = 'Rejected'
//   }

//   export enum WorkflowStatus {
//     pending = 'pending',
//     approved = 'approved',
//     rejected = 'rejected'
//   }

//   export enum WorkflowStage {
//     requester = 'Requester',
//     departmentHeadApproval = 'Department Head Approval',
//     financialReview = 'Financial Review',
//     procurement = 'Procurement',
//     finalApproval = 'Final Approval'
//   }

//   export type WorkflowAction = 'approve' | 'reject' | 'sendBack'
export interface ActionState<T> {
  data: T | null;
  error: string | null;
}

export interface Requestor {
  name: string;
  id: string;
  department: string;
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
  uploadDate: Date;
}

export interface Comment {
  id: string;
  user: string;
  date: string;
  text: string;
}

export interface Budget {
  totalBudget: number;
  availableBudget: number;
  allocatedBudget: number;
}

export interface ApprovalHistoryItem {
  stage: WorkflowStage;
  approver: string;
  date: string;
  status: string;
}

export interface PurchaseRequest_3 {
  id: string;
  refNumber: string;
  date: Date;
  type: PRType;
  deliveryDate: Date;
  description: string;
  requestorId: string;
  requestor: Requestor;
  currency: string;
  vendor: string;
  vendorId: number;
  status: DocumentStatus;
  workflowStatus: WorkflowStatus;
  currentWorkflowStage: WorkflowStage;
  location: string;
  department: string;
  jobCode: string;
  estimatedTotal: number;
  items: PurchaseRequestItem[];
  attachments: Attachment[];
  comments: Comment[];
  budget: Budget;
  approvalHistory: ApprovalHistoryItem[];
}

export interface BudgetData {
  location: string;
  budgetCategory: string;
  totalBudget: number;
  softCommitmentPR: number;
  softCommitmentPO: number;
  hardCommitment: number;
  availableBudget: number;
  currentPRAmount: number;
}

export interface ItemDetail {
  id: string;
  location: string;
  product: string;
  comment: string;
  unit: string;
  request: {
    quantity: number;
    ordering: number;
  };
  approve: {
    quantity: number;
    onHand: number;
  };
  currency: string;
  price: {
    current: number;
    last: number;
  };
  total: number;
  status: "A" | "R";
}

export enum CurrencyCode {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CNY = "CNY",
  THB = "THB",
}




export interface Product {
  [x: string]: any;
  id: string;
  productCode: string;
  name: string;
  description: string;
  localDescription: string;
  categoryId: string;
  subCategoryId: string;
  itemGroupId: string;
  primaryInventoryUnitId: string;
  size: string;
  color: string;
  barcode: string;
  isActive: boolean;
  basePrice: number;
  currency: string;
  taxType: string;
  taxRate: number;
  standardCost: number;
  lastCost: number;
  priceDeviationLimit: number;
  quantityDeviationLimit: number;
  minStockLevel: number;
  maxStockLevel: number;
  isForSale: boolean;
  isIngredient: boolean;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  shelfLife: number;
  storageInstructions: string;
  unitConversions: UnitConversion[];
  imagesUrl: string;

}

export interface UnitConversion {
  id: string;
  unitId: string;
  fromUnit: string;
  toUnit: string;
  unitName: string;

  conversionFactor: number;
  unitType: 'INVENTORY' | 'ORDER' | 'RECIPE' | 'COUNTING';
}


export interface Vendor {
  id: string;
  companyName: string;
  businessRegistrationNumber: string;
  taxId: string;
  establishmentDate: string;
  businessTypeId: string;
  isActive: boolean;
  addresses: Address[];
  contacts: Contact[];
  rating: number;
}

export interface Address {
  id: string;
  addressType: 'MAIN' | 'BILLING' | 'SHIPPING';
  addressLine: string;
  subDistrictId: string;
  districtId: string;
  provinceId: string;
  postalCode: string;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  department: string;
  isPrimary: boolean;
}