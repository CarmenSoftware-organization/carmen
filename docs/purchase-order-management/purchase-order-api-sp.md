# Purchase Order Module - API and Stored Procedures Documentation

## 1. API Endpoints

### 1.1 Purchase Order Management

#### Get Purchase Orders
```typescript
GET /api/purchase-orders
Query Parameters: {
  status?: POStatus
  type?: POType
  department?: string
  fromDate?: string
  toDate?: string
  vendor?: string
  prId?: string  // Added to filter POs by source PR
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}
Response: {
  data: PurchaseOrder[]
  total: number
  page: number
  limit: number
}

interface PurchaseOrder {
  id: string
  refNumber: string
  date: string
  type: POType
  description: string
  prId?: string // Reference to Purchase Request
  prNumber?: string // PR reference number
  requestorId: string
  requestor: {
    name: string
    id: string
    department: string
  }
  status: POStatus
  workflowStatus: WorkflowStatus
  currentWorkflowStage: WorkflowStage
  location: string
  department: string
  jobCode: string
  vendor: string
  vendorId: number
  currency: string
  baseCurrencyCode: string
  exchangeRate: number
  paymentTerms: string
  deliveryTerms: string
  baseSubTotalPrice: number
  subTotalPrice: number
  baseNetAmount: number
  netAmount: number
  baseDiscAmount: number
  discountAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
  items: POItem[]
  attachments: Attachment[]
  comments: Comment[]
}

type POType = 'Standard' | 'Blanket' | 'Contract' | 'Service'
type POStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Cancelled' | 'Closed'
```

#### Get Purchase Order by ID
```typescript
GET /api/purchase-orders/:id
Response: PurchaseOrder
```

#### Create Purchase Order
```typescript
POST /api/purchase-orders
Body: {
  type: POType
  description: string
  prId?: string
  department: string
  location: string
  jobCode: string
  vendor: string
  vendorId: number
  currency: string
  paymentTerms: string
  deliveryTerms: string
  items: POItemCreate[]
}
Response: PurchaseOrder

interface POItemCreate {
  prItemId?: string  // Reference to source PR item
  location: string
  name: string
  description: string
  unit: string
  quantityOrdered: number
  price: number
  deliveryDate: string
  deliveryPoint: string
  itemCategory: string
  itemSubcategory?: string
  taxRate?: number
  discountRate?: number
  accountCode?: string
}
```

### 1.2 PO Items Management

#### Add PO Item
```typescript
POST /api/purchase-orders/:poId/items
Body: POItemCreate
Response: POItem

interface POItemCreate {
  prItemId?: string  // Reference to source PR item
  location: string
  name: string
  description: string
  unit: string
  quantityOrdered: number
  price: number
  deliveryDate: string
  deliveryPoint: string
  itemCategory: string
  itemSubcategory?: string
  taxRate?: number
  discountRate?: number
  accountCode?: string
}

interface POItem extends POItemCreate {
  id: string
  poId: string
  prItemId?: string  // Reference to source PR item
  prNumber?: string  // Source PR number
  prRequestor?: string  // Source PR requestor
  prDepartment?: string  // Source PR department
  prRequestDate?: string  // Source PR request date
  totalAmount: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  status: 'Pending' | 'Received' | 'Partially Received' | 'Cancelled'
  receivedQuantity: number
}
```

### 1.3 Workflow Management

#### Submit PO for Approval
```typescript
POST /api/purchase-orders/:id/submit
Response: {
  status: POStatus
  workflowStatus: WorkflowStatus
  message: string
}
```

#### Process Workflow Action
```typescript
POST /api/purchase-orders/:id/workflow/action
Body: {
  action: 'approve' | 'reject' | 'return'
  comments?: string
  userId: string
  stage: WorkflowStage
}
Response: {
  status: POStatus
  workflowStatus: WorkflowStatus
  currentWorkflowStage: WorkflowStage
  approvalHistory: ApprovalHistoryItem[]
}
```

### 1.4 Receiving Management

#### Create Goods Receipt
```typescript
POST /api/purchase-orders/:poId/receipts
Body: {
  receiptDate: string
  location: string
  items: {
    poItemId: string
    quantityReceived: number
    comment?: string
  }[]
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
}
Response: {
  id: string
  poId: string
  refNumber: string
  receiptDate: string
  status: 'Pending' | 'Completed' | 'Cancelled'
  items: {
    id: string
    poItemId: string
    quantityReceived: number
    remainingQuantity: number
    comment?: string
  }[]
  createdBy: string
  createdAt: string
}
```

### 1.5 Comments Management

#### Get PO Comments
```typescript
GET /api/purchase-orders/:poId/comments
Query Parameters: {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}
Response: {
  data: Comment[]
  total: number
  page: number
  limit: number
}

interface Comment {
  id: string
  poId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: 'general' | 'workflow' | 'system' | 'receiving'
  visibility: 'public' | 'private' | 'internal'
  attachments?: {
    id: string
    fileName: string
    fileType: string
    fileSize: number
    url: string
  }[]
  mentions?: {
    userId: string
    userName: string
  }[]
  createdAt: string
  updatedAt: string
}
```

#### Add Comment
```typescript
POST /api/purchase-orders/:poId/comments
Body: {
  content: string
  type: 'general' | 'workflow' | 'system' | 'receiving'
  visibility: 'public' | 'private' | 'internal'
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
  mentions?: string[] // userIds
}
Response: Comment
```

#### Update Comment
```typescript
PUT /api/purchase-orders/:poId/comments/:commentId
Body: {
  content: string
  visibility?: 'public' | 'private' | 'internal'
  attachments?: {
    id?: string // existing attachment
    fileName?: string // new attachment
    fileType?: string
    fileContent?: Base64String
  }[]
}
Response: Comment
```

#### Delete Comment
```typescript
DELETE /api/purchase-orders/:poId/comments/:commentId
Response: { success: boolean }
```

### 1.6 Activity Log

#### Get Activity Log
```typescript
GET /api/purchase-orders/:poId/activity-log
Query Parameters: {
  fromDate?: string
  toDate?: string
  type?: ActivityType[]
  user?: string
  page?: number
  limit?: number
}
Response: {
  data: ActivityLogEntry[]
  total: number
  page: number
  limit: number
}

interface ActivityLogEntry {
  id: string
  poId: string
  type: ActivityType
  action: string
  description: string
  metadata: {
    previousValue?: any
    newValue?: any
    workflowStage?: string
    comments?: string
    receivingInfo?: {
      receiptId: string
      items: {
        itemId: string
        quantityReceived: number
      }[]
    }
    [key: string]: any
  }
  user: {
    id: string
    name: string
    role: string
    department: string
  }
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

type ActivityType = 
  | 'creation'
  | 'modification'
  | 'workflow'
  | 'comment'
  | 'attachment'
  | 'receiving'
  | 'budget'
  | 'item'
  | 'system'
```

#### Get Activity Details
```typescript
GET /api/purchase-orders/:poId/activity-log/:activityId
Response: {
  activity: ActivityLogEntry
  relatedActivities: ActivityLogEntry[]
  details: {
    [key: string]: any // Additional context-specific details
  }
}
```

### 1.7 PR-to-PO Traceability

#### Get PO Items by PR Item
```typescript
GET /api/purchase-requests/:prId/items/:prItemId/po-items
Response: {
  data: POItem[]
  total: number
}
```

#### Get PR Source for PO Item
```typescript
GET /api/purchase-orders/:poId/items/:itemId/pr-source
Response: {
  prId: string
  prNumber: string
  prItemId: string
  requestor: {
    id: string
    name: string
    department: string
  }
  requestDate: string
  originalQuantity: number
  originalUnit: string
  remainingQuantity: number
}
```

#### Get PR-to-PO Traceability Report
```typescript
GET /api/reports/pr-to-po-traceability
Query Parameters: {
  prId?: string
  poId?: string
  fromDate?: string
}

> **Note**: For detailed information on PR-to-PO traceability, refer to the [Procurement Process Flow](../Procurement-Process-Flow.md) document.
```

## 2. Stored Procedures

### 2.1 Purchase Order Management

#### sp_CreatePurchaseOrder
```sql
PROCEDURE sp_CreatePurchaseOrder
  @Type nvarchar(50),
  @Description nvarchar(500),
  @PRId uniqueidentifier = NULL,
  @RequestorId nvarchar(50),
  @Department nvarchar(100),
  @Location nvarchar(100),
  @JobCode nvarchar(50),
  @VendorId int,
  @Currency nvarchar(3),
  @PaymentTerms nvarchar(200),
  @DeliveryTerms nvarchar(200)
RETURNS uniqueidentifier
```

#### sp_UpdatePurchaseOrder
```sql
PROCEDURE sp_UpdatePurchaseOrder
  @POId uniqueidentifier,
  @Description nvarchar(500),
  @PaymentTerms nvarchar(200),
  @DeliveryTerms nvarchar(200)
RETURNS bit
```

### 2.2 PO Item Management

#### sp_AddPOItem
```sql
PROCEDURE sp_AddPOItem
  @POId uniqueidentifier,
  @PRItemId uniqueidentifier = NULL,
  @Location nvarchar(100),
  @Name nvarchar(200),
  @Description nvarchar(500),
  @Unit nvarchar(50),
  @QuantityOrdered decimal(10,2),
  @Price decimal(10,2),
  @DeliveryDate datetime,
  @DeliveryPoint nvarchar(200),
  @ItemCategory nvarchar(100),
  @ItemSubcategory nvarchar(100) = NULL,
  @TaxRate decimal(5,2) = NULL,
  @DiscountRate decimal(5,2) = NULL,
  @AccountCode nvarchar(50) = NULL
RETURNS int
```

### 2.3 Receiving Management

#### sp_CreateGoodsReceipt
```sql
PROCEDURE sp_CreateGoodsReceipt
  @POId uniqueidentifier,
  @ReceiptDate datetime,
  @Location nvarchar(100),
  @CreatedBy nvarchar(50)
RETURNS uniqueidentifier
```

#### sp_AddGoodsReceiptItem
```sql
PROCEDURE sp_AddGoodsReceiptItem
  @ReceiptId uniqueidentifier,
  @POItemId int,
  @QuantityReceived decimal(10,2),
  @Comment nvarchar(500) = NULL
RETURNS int
```

### 2.5 Comments Management

#### sp_CreatePOComment
```sql
PROCEDURE sp_CreatePOComment
  @POId uniqueidentifier,
  @UserId nvarchar(50),
  @Content nvarchar(max),
  @Type nvarchar(20),
  @Visibility nvarchar(20),
  @Mentions nvarchar(max) = NULL
RETURNS uniqueidentifier
```

#### sp_UpdatePOComment
```sql
PROCEDURE sp_UpdatePOComment
  @CommentId uniqueidentifier,
  @UserId nvarchar(50),
  @Content nvarchar(max),
  @Visibility nvarchar(20)
RETURNS bit
```

#### sp_DeletePOComment
```sql
PROCEDURE sp_DeletePOComment
  @CommentId uniqueidentifier,
  @UserId nvarchar(50)
RETURNS bit
```

#### sp_AddCommentAttachment
```sql
PROCEDURE sp_AddCommentAttachment
  @CommentId uniqueidentifier,
  @FileName nvarchar(255),
  @FileType nvarchar(100),
  @FileSize bigint,
  @FileUrl nvarchar(500)
RETURNS uniqueidentifier
```

### 2.6 Activity Logging

#### sp_LogPOActivity
```sql
PROCEDURE sp_LogPOActivity
  @POId uniqueidentifier,
  @UserId nvarchar(50),
  @Type nvarchar(50),
  @Action nvarchar(100),
  @Description nvarchar(500),
  @Metadata nvarchar(max),
  @IPAddress nvarchar(50) = NULL,
  @UserAgent nvarchar(500) = NULL
RETURNS uniqueidentifier
```

#### sp_GetPOActivityLog
```sql
PROCEDURE sp_GetPOActivityLog
  @POId uniqueidentifier,
  @FromDate datetime = NULL,
  @ToDate datetime = NULL,
  @Type nvarchar(50) = NULL,
  @UserId nvarchar(50) = NULL,
  @PageNumber int = 1,
  @PageSize int = 50
RETURNS TABLE (
  Id uniqueidentifier,
  Type nvarchar(50),
  Action nvarchar(100),
  Description nvarchar(500),
  Metadata nvarchar(max),
  UserId nvarchar(50),
  UserName nvarchar(100),
  UserRole nvarchar(50),
  UserDepartment nvarchar(100),
  Timestamp datetime,
  IPAddress nvarchar(50),
  UserAgent nvarchar(500)
)
```

## 3. Example Request/Response Payloads

### 3.1 Purchase Order Management

#### Get Purchase Orders
```typescript
// Request
GET /api/purchase-orders?status=Draft&type=Standard&department=IT&fromDate=2024-01-01&toDate=2024-03-20&page=1&limit=10

// Response
{
  "data": [
    {
      "id": "PO-2024-001",
      "refNumber": "PO/2024/03/001",
      "date": "2024-03-20T09:00:00Z",
      "type": "Standard",
      "description": "IT Equipment Purchase",
      "prId": "PR-2024-001",
      "requestorId": "USER123",
      "requestor": {
        "name": "John Doe",
        "id": "USER123",
        "department": "IT"
      },
      "status": "Draft",
      "workflowStatus": "Pending",
      "currentWorkflowStage": "DepartmentApproval",
      "location": "HQ",
      "department": "IT",
      "jobCode": "IT-2024-Q1",
      "vendor": "Tech Supplies Co.",
      "vendorId": 1001,
      "currency": "THB",
      "baseCurrencyCode": "THB",
      "exchangeRate": 1,
      "paymentTerms": "Net 30",
      "deliveryTerms": "FOB Destination",
      "baseSubTotalPrice": 45000,
      "subTotalPrice": 45000,
      "baseNetAmount": 48150,
      "netAmount": 48150,
      "baseDiscAmount": 0,
      "discountAmount": 0,
      "baseTaxAmount": 3150,
      "taxAmount": 3150,
      "baseTotalAmount": 48150,
      "totalAmount": 48150
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

#### Create Purchase Order
```typescript
// Request
POST /api/purchase-orders
{
  "type": "Standard",
  "description": "IT Equipment Purchase",
  "prId": "PR-2024-001",
  "department": "IT",
  "location": "HQ",
  "jobCode": "IT-2024-Q1",
  "vendor": "Tech Supplies Co.",
  "vendorId": 1001,
  "currency": "THB",
  "paymentTerms": "Net 30",
  "deliveryTerms": "FOB Destination",
  "items": [
    {
      "prItemId": "PRITEM-001",
      "location": "HQ",
      "name": "Laptop Dell XPS 13",
      "description": "Developer Laptop",
      "unit": "Units",
      "quantityOrdered": 2,
      "price": 22500,
      "deliveryDate": "2024-04-01T00:00:00Z",
      "deliveryPoint": "IT Department",
      "itemCategory": "Hardware",
      "itemSubcategory": "Laptops",
      "taxRate": 7,
      "discountRate": 0,
      "accountCode": "IT-HW-001"
    }
  ]
}

// Response
{
  "id": "PO-2024-001",
  // ... full PO details ...
}
```

### 3.2 Receiving Management

#### Create Goods Receipt
```typescript
// Request
POST /api/purchase-orders/PO-2024-001/receipts
{
  "receiptDate": "2024-04-01T10:00:00Z",
  "location": "HQ",
  "items": [
    {
      "poItemId": "POITEM-001",
      "quantityReceived": 2,
      "comment": "All items received in good condition"
    }
  ],
  "attachments": [
    {
      "fileName": "delivery_note.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ]
}

// Response
{
  "id": "GR-2024-001",
  "poId": "PO-2024-001",
  "refNumber": "GR/2024/04/001",
  "receiptDate": "2024-04-01T10:00:00Z",
  "status": "Completed",
  "items": [
    {
      "id": "GRITEM-001",
      "poItemId": "POITEM-001",
      "quantityReceived": 2,
      "remainingQuantity": 0,
      "comment": "All items received in good condition"
    }
  ],
  "createdBy": "USER789",
  "createdAt": "2024-04-01T10:05:00Z"
}
```

### 3.3 Error Responses

#### Validation Error
```typescript
// Response (400 Bad Request)
{
  "error": {
    "code": "PO001",
    "message": "Invalid purchase order data",
    "details": [
      {
        "field": "items",
        "message": "Quantity ordered cannot exceed PR quantity"
      }
    ]
  }
}
```

#### Budget Error
```typescript
// Response (400 Bad Request)
{
  "error": {
    "code": "PO003",
    "message": "Budget validation failed",
    "details": {
      "budgetCategory": "IT Equipment",
      "availableBudget": 100000,
      "requiredAmount": 150000,
      "shortfall": 50000
    }
  }
}
```

#### Workflow Error
```typescript
// Response (403 Forbidden)
{
  "error": {
    "code": "PO004",
    "message": "Unauthorized workflow action",
    "details": {
      "requiredRole": "Finance Manager",
      "currentStage": "FinanceApproval"
    }
  }
}
```

### 3.4 Comments Management

#### Add Comment with Attachment
```typescript
// Request
POST /api/purchase-orders/PO-2024-001/comments
{
  "content": "Vendor has confirmed delivery schedule",
  "type": "general",
  "visibility": "public",
  "attachments": [
    {
      "fileName": "delivery_schedule.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ],
  "mentions": ["USER456", "USER789"]
}

// Response
{
  "id": "CMT-001",
  "poId": "PO-2024-001",
  "userId": "USER123",
  "userName": "John Doe",
  "userRole": "Procurement Officer",
  "content": "Vendor has confirmed delivery schedule",
  "type": "general",
  "visibility": "public",
  "attachments": [
    {
      "id": "ATT-001",
      "fileName": "delivery_schedule.pdf",
      "fileType": "application/pdf",
      "fileSize": 125000,
      "url": "/attachments/PO-2024-001/delivery_schedule.pdf"
    }
  ],
  "mentions": [
    {
      "userId": "USER456",
      "userName": "Jane Smith"
    },
    {
      "userId": "USER789",
      "userName": "Bob Wilson"
    }
  ],
  "createdAt": "2024-03-20T14:30:00Z",
  "updatedAt": "2024-03-20T14:30:00Z"
}
```

### 3.5 Activity Log

#### Get Activity Log
```typescript
// Request
GET /api/purchase-orders/PO-2024-001/activity-log?type=workflow,receiving&fromDate=2024-03-20

// Response
{
  "data": [
    {
      "id": "ACT-001",
      "poId": "PO-2024-001",
      "type": "workflow",
      "action": "submit",
      "description": "Purchase order submitted for approval",
      "metadata": {
        "previousStatus": "Draft",
        "newStatus": "Submitted",
        "workflowStage": "DepartmentApproval"
      },
      "user": {
        "id": "USER123",
        "name": "John Doe",
        "role": "Procurement Officer",
        "department": "Procurement"
      },
      "timestamp": "2024-03-20T09:15:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    },
    {
      "id": "ACT-002",
      "type": "receiving",
      "action": "goods_receipt",
      "description": "Goods receipt created",
      "metadata": {
        "receiptId": "GR-2024-001",
        "items": [
          {
            "itemId": "POITEM-001",
            "quantityReceived": 2
          }
        ]
      },
      "user": {
        "id": "USER789",
        "name": "Bob Wilson",
        "role": "Warehouse Officer",
        "department": "Logistics"
      },
      "timestamp": "2024-04-01T10:05:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10
}
```

#### Get Activity Details
```typescript
// Request
GET /api/purchase-orders/PO-2024-001/activity-log/ACT-002

// Response
{
  "activity": {
    // ... activity details as above ...
  },
  "relatedActivities": [
    {
      "id": "ACT-003",
      "type": "comment",
      "action": "add_comment",
      "description": "Comment added to goods receipt",
      // ... other activity details ...
    }
  ],
  "details": {
    "receipt": {
      "id": "GR-2024-001",
      "refNumber": "GR/2024/04/001",
      "status": "Completed"
    },
    "items": [
      {
        "id": "POITEM-001",
        "name": "Laptop Dell XPS 13",
        "quantityOrdered": 2,
        "quantityReceived": 2,
        "remainingQuantity": 0
      }
    ]
  }
}
``` 
