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

// export interface Item {
//   itemId: number;
//   itemCode: string;
//   itemName: string;
//   description?: string;
//   categoryId: number;
//   baseUnitId: number;
//   costingMethod: CostingMethod;
//   isActive: boolean;
//   isSerialized: boolean;
//   minimumQuantity?: number;
//   maximumQuantity?: number;
//   reorderPoint?: number;
//   reorderQuantity?: number;
//   leadTime?: number;
//   lastPurchaseDate?: Date;
//   lastPurchasePrice?: number;
//   lastSaleDate?: Date;
//   lastSalePrice?: number;
// }

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

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  content: string;
  timestamp: Date;
}

export enum GRNItemStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum CostDistributionMethod {
  NET_AMOUNT = "net-amount",
  QUANTITY_RATIO = "quantity-ratio",
}

// Purchase Order (PO) Types

export interface PurchaseOrder {
  poId: string;
  number: string;
  vendorId: number;
  vendorName: string;
  orderDate: Date;
  DeliveryDate?: Date | null;
  status: PurchaseOrderStatus;
  currencyCode: string;
  exchangeRate: number;
  notes?: string;
  createdBy: number;
  approvedBy?: number;
  approvalDate?: Date;
  email: string;
  buyer: string;
  creditTerms: string;
  description: string;
  remarks: string;
  purchaseRequisitionIds?: string[];
  purchaseRequisitionNumbers?: string[];
  shippingAddress?: Address;
  deliveryPoint?: string;
  items: PurchaseOrderItem[];
  baseCurrencyCode: string;
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  activityLog?: ActivityLogEntry[];
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
  status: PurchaseRequestItemStatus;
  isFOC: boolean;
  taxRate: number;
  discountRate: number;
  attachments?: Attachment[];
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  comment?: string;
  taxIncluded: boolean;
  adjustments?: {
    discount: boolean;
    tax: boolean;
  };
  lastReceiveDate?: Date;
  lastPrice?: number;
  lastVendorId?: number;
  attachedFile?: File | null;
  inventoryInfo: {
    onHand: number;
    onOrdered: number;
    reorderLevel: number;
    restockLevel: number;
    averageMonthlyUsage: number;
    lastPrice: number;
    lastOrderDate: Date;
    lastVendor: string;
  };
  received?: GRNItem[];
}

export interface Attachment {
  id: string;
  description?: string;
  publicAccess: boolean;
  userId: string;
  userName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadDate: Date;
}

export enum PurchaseOrderStatus {
  Open = "Open",
  Voided = "Voided",
  Closed = "Closed",
  Draft = "Draft",
  Sent = "Sent",
  Partial = "Partial",
  FullyReceived = "FullyReceived",
  Cancelled = "Cancelled",
  Deleted = "Deleted",
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
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
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

export interface IBaseSummary {
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
}

export interface PurchaseRequestItem {
  id?: string;
  location: string;
  name: string;
  description: string;
  unit: string;
  quantityRequested: number;
  quantityApproved: number;
  deliveryDate: Date;
  deliveryPoint: string;
  currency: string;
  currencyRate: number;
  price: number;
  foc: number;
  taxIncluded: boolean;// adjustment: boolean;
  adjustments: {
    discount?: boolean;
    tax: boolean; 
  };
  discountRate: number;
  taxRate: number;
  vendor: string;
  pricelistNumber: string;
  comment: string;
  createdBy?: string;
  createdDate?: Date;
  updatedBy?: string;
  updatedDate?: Date;
  itemCategory: string;
  itemSubcategory: string;
  status: PurchaseRequestItemStatus;
  inventoryInfo: {
    onHand: number;
    onOrdered: number;
    reorderLevel: number;
    restockLevel: number;
    averageMonthlyUsage: number;
    lastPrice: number;
    lastOrderDate: Date;
    lastVendor: string;
    inventoryUnit: string;
  };
  accountCode: string;
  jobCode: string;
  // Business Dimensions (Allocation Fields)
  event?: string;
  project?: string;
  marketSegment?: string;
  // Tax and Discount Types
  taxType?: string;
  discountType?: string;
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  baseCurrency?: string;
}

export type PurchaseRequestItemStatus =
 "Pending"|
 "Approved"|
 "Rejected"|
 "Review";

export interface ReturnStep {
  id: string;
  label: string;
  description: string;
  targetStage: string;
}

export interface ConsolidatedButtonState {
  action: "approve" | "reject" | "return" | "disabled";
  label: string;
  color: string;
  disabled: boolean;
  requiresStepSelection?: boolean;
}


export interface WorkflowStep {
  stage?: WorkflowStage;
  status: WorkflowStatus;
  stepId?: string;
  stepName?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  completedDate?: Date;
  comments?: string;
  order?: number;
}

export interface GoodsReceiveNote {
  id: string;
  ref: string;
  date: Date;
  invoiceDate: Date;
  invoiceNumber: string;
  taxInvoiceDate?: Date;
  taxInvoiceNumber?: string;
  description: string;
  receiver: string;
  vendorId: string;
  vendor: string;
  location: string;
  currency: string;
  exchangeRate: number;
  baseCurrency: string;
  status: GoodsReceiveNoteStatus;
  isConsignment: boolean;
  isCash: boolean;
  cashBook?: string;
  items: GoodsReceiveNoteItem[];
  selectedItems: string[];
  stockMovements: StockMovement[];
  extraCosts: ExtraCost[];
  comments: Comment[];
  attachments: Attachment[];
  activityLog: ActivityLogEntry[];
  financialSummary?: FinancialSummary | null;
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  creditTerms?: string;
  dueDate?: Date;
}

export interface GoodsReceiveNoteItem {
  id: string;
  name: string;
  description: string;
  jobCode: string;
  orderedQuantity: number;
  orderUnit: string;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  subTotalAmount: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  netAmount: number;
  expiryDate?: Date;
  serialNumber?: string;
  notes?: string;
  baseCurrency: string;
  baseQuantity: number;
  baseUnitPrice: number;
  baseUnit: string;
  baseSubTotalAmount: number;
  baseNetAmount: number;
  baseTotalAmount: number;
  baseTaxRate: number;
  baseTaxAmount: number;
  baseDiscountRate: number;
  baseDiscountAmount: number;
  conversionRate: number;
  currency: string;
  exchangeRate: number;
  extraCost: number;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  inventoryReorderThreshold: number;
  inventoryRestockLevel: number;
  purchaseOrderRef: string;
  lastPurchasePrice: number;
  lastOrderDate: Date;
  lastVendor: string;
  lotNumber: string;
  deliveryPoint: string;
  deliveryDate: Date;
  location: string;
  isFreeOfCharge: boolean;
  taxIncluded: boolean;
  adjustments: {
    discount: boolean;
    tax: boolean;
  };
  availableLots?: {
    lotNumber: string;
    expiryDate: Date;
  }[];
  focQuantity?: number;
  focUnit?: string;
  focConversionRate?: number;
  isConsignment?: boolean;
  isTaxInclusive?: boolean;
  taxSystem?: 'GST' | 'VAT';
  projectCode?: string;
  marketSegment?: string;
}

export interface LocationInfo {
  type: 'INV' | 'DIR'
  code: string
  name: string
  displayType: 'Inventory' | 'Direct'
}

export interface StockMovement {
  id?: string | number
  fromLocation?: string
  toLocation: string
  location?: LocationInfo
  itemName: string
  itemDescription?: string
  lotNumber: string
  unit: string
  quantity: number
  cost: number
  totalCost: number
  netAmount: number
  extraCost: number
  beforeStock: number
  afterStock: number
  stockOut: number
  currency?: string
  totalAmount?: number
}

export interface ExtraCost {
  id: string;
  type: CostType;
  amount: number;
  currency: string;
  exchangeRate: number;
  baseAmount: number;
  baseCurrency: string;
}
export type GoodsReceiveNoteMode = "view" | "edit" | "add";

export type GoodsReceiveNoteStatus = 'Received' | 'Committed';

export type CostType = "shipping" | "handling" | "insurance" | "other";

export interface ExtraCost {
  id: string;
  type: CostType;
  amount: number;
}

export interface FinancialSummary {
  id: string;
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
  jvDate: Date;
  jvDescription: string;
  jvStatus: string;
  jvReference: string;
  jvDetail?: JournalEntryDetail[];
  jvTotal: JournalEntryTotal;
  sourceOfTransaction?: string;
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

export interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  activityType?: string;
  description: string;
  timestamp: Date;
  details?: string;
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
  requester = "Requestor",
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
  currency: string;
  baseCurrencyCode: string;
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  comments?: Comment[];
  approvals?: WorkflowStep[];
  deliveryPoint?: string;
  activityLog?: ActivityLogEntry[];
  additionalCharges?: Money;
  budgetCode?: string;
  allocatedBudget?: Money;
  yearToDateSpending?: Money;
  exchangeRate?: number;
  exchangeRateDate?: Date;
  items?: PurchaseRequestItem[];
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

// export interface PurchaseRequestItem {
//   id: string;
//   description: string;
//   quantity: number;
//   unitPrice: Money;
//   totalPrice: Money;
// }

export interface Budget {
  totalBudget: number;
  availableBudget: number;
  allocatedBudget: number;
}

export interface ApprovalHistoryItem {
  stage: WorkflowStage;
  approver: string;
  date: Date;
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
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
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
  shelfLife: number;
  storageInstructions: string;
  unitConversions: UnitConversion[];
  imagesUrl: string;
  // Environmental Impact Fields
  carbonFootprint?: number; // Carbon dioxide equivalent per unit (kg CO2e)
  waterUsage?: number; // Water consumption per unit (liters)
  packagingRecyclability?: number; // Percentage of packaging that is recyclable (0-100%)
  biodegradabilityMonths?: number; // Time to naturally decompose (months)
  energyEfficiencyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; // Energy consumption rating
  sustainableCertification?: 'ORGANIC' | 'FAIRTRADE' | 'RAINFOREST' | 'MSC' | 'FSC' | 'NONE'; // Environmental certification status
}

export interface UnitConversion {
  id: string;
  unitId: string;
  fromUnit: string;
  toUnit: string;
  unitName: string;

  conversionFactor: number;
  unitType: "INVENTORY" | "ORDER" | "RECIPE";
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
  addressType: "MAIN" | "BILLING" | "SHIPPING";
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
