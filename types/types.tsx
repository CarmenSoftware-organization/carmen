export enum PRType {
    GeneralPurchase = 'GeneralPurchase',
    MarketList = 'MarketList',
    AssetPurchase = 'AssetPurchase',
    ServiceRequest = 'ServiceRequest'
  }
  
  export enum DocumentStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Rejected = 'Rejected'
  }
  
  export enum WorkflowStatus {
    pending = 'Pending',
    approved = 'Approved',
    rejected = 'Rejected'
  }
  
  export enum WorkflowStage {
    requester = 'Requester',
    departmentHeadApproval = 'DepartmentHeadApproval',
    purchaseCoordinatorReview = 'PurchaseCoordinatorReview',
    financeManagerApproval = 'FinanceManagerApproval',
    generalManagerApproval = 'GeneralManagerApproval',
    completed = 'Completed'
  }
  
  export interface PurchaseRequest {
    id: string;
    refNumber: string;
    date: string;
    type: PRType;
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
  
  export type WorkflowAction = 'approve' | 'reject' | 'sendBack';

  export interface ItemDetail {
    id: string
    location: string
    product: string
    comment: string
    unit: string
    request: {
      quantity: number
      ordering: number
    }
    approve: {
      quantity: number
      onHand: number
    }
    currency: string
    price: {
      current: number
      last: number
    }
    total: number
    status: 'A' | 'R'
  }
  
  export interface BudgetData {
    location: string
    budgetCategory: string
    totalBudget: number
    softCommitmentPR: number
    softCommitmentPO: number
    hardCommitment: number
    availableBudget: number
    currentPRAmount: number
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
  
  export interface Requestor {
    name: string;
    id: string;
    department: string;
  }
  
  export interface PurchaseRequestItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }
  
  export interface Attachment {
    id: string;
    fileName: string;
    uploadDate: string;
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
  
  export interface PurchaseRequest {
    id: string;
    refNumber: string;
    date: string;
    type: PRType;
    description: string;
    requestorId: string;
    requestor: Requestor;
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
    status: 'A' | 'R';
  }


export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
  THB = 'THB'
}
