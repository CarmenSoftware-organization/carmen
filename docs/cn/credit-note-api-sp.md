# Credit Note Module - API and Stored Procedures Documentation

## 1. API Endpoints

### 1.1 Credit Note Management

#### Get Credit Notes
```typescript
GET /api/credit-notes
Query Parameters: {
  status?: CreditNoteStatus
  poId?: string
  grnId?: string
  department?: string
  fromDate?: string
  toDate?: string
  vendor?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}
Response: {
  data: CreditNote[]
  total: number
  page: number
  limit: number
}

interface CreditNote {
  id: string
  refNumber: string
  date: string
  poId: string
  poRefNumber: string
  grnId?: string
  grnRefNumber?: string
  status: CreditNoteStatus
  type: CreditNoteType
  reason: string
  location: string
  department: string
  vendor: string
  vendorId: number
  requestedBy: {
    id: string
    name: string
    department: string
  }
  approvedBy?: {
    id: string
    name: string
    department: string
  }
  currency: string
  baseCurrencyCode: string
  exchangeRate: number
  items: CreditNoteItem[]
  attachments: Attachment[]
  comments: Comment[]
  totalQuantity: number
  baseSubTotalAmount: number
  subTotalAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

interface CreditNoteItem {
  id: string
  poItemId: string
  grnItemId?: string
  name: string
  description: string
  unit: string
  quantityReturned: number
  price: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  reason: string
  condition: ItemCondition
  location: string
  warehouseLocation?: string
}

type CreditNoteStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed'
type CreditNoteType = 'Return' | 'Price Adjustment' | 'Quality Issue' | 'Quantity Discrepancy'
type ItemCondition = 'Damaged' | 'Wrong Item' | 'Quality Issue' | 'Excess Quantity' | 'Other'
```

#### Get Credit Note by ID
```typescript
GET /api/credit-notes/:id
Response: CreditNote
```

#### Create Credit Note
```typescript
POST /api/credit-notes
Body: {
  poId: string
  grnId?: string
  type: CreditNoteType
  reason: string
  date: string
  location: string
  items: {
    poItemId: string
    grnItemId?: string
    quantityReturned: number
    price: number
    reason: string
    condition: ItemCondition
    warehouseLocation?: string
  }[]
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
}
Response: CreditNote
```

### 1.2 Approval Management

#### Submit for Approval
```typescript
POST /api/credit-notes/:id/submit
Response: {
  status: CreditNoteStatus
  message: string
}
```

#### Process Approval
```typescript
POST /api/credit-notes/:id/approve
Body: {
  action: 'approve' | 'reject'
  comments?: string
  userId: string
}
Response: {
  status: CreditNoteStatus
  approvedBy: {
    id: string
    name: string
    department: string
  }
  approvalDate: string
  comments?: string
}
```

### 1.3 Comments Management

#### Get Credit Note Comments
```typescript
GET /api/credit-notes/:creditNoteId/comments
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
  creditNoteId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: 'general' | 'approval' | 'system' | 'return'
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
POST /api/credit-notes/:creditNoteId/comments
Body: {
  content: string
  type: 'general' | 'approval' | 'system' | 'return'
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

### 1.4 Activity Log

#### Get Activity Log
```typescript
GET /api/credit-notes/:creditNoteId/activity-log
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
  creditNoteId: string
  type: ActivityType
  action: string
  description: string
  metadata: {
    previousValue?: any
    newValue?: any
    approvalDetails?: {
      action: 'approve' | 'reject'
      comments?: string
      userId: string
    }
    returnDetails?: {
      items: {
        itemId: string
        quantityReturned: number
        condition: ItemCondition
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
  | 'approval'
  | 'comment'
  | 'attachment'
  | 'return'
  | 'system'
```

## 2. Stored Procedures

### 2.1 Credit Note Management

#### sp_CreateCreditNote
```sql
PROCEDURE sp_CreateCreditNote
  @POId uniqueidentifier,
  @GRNId uniqueidentifier = NULL,
  @Type nvarchar(50),
  @Reason nvarchar(500),
  @Date datetime,
  @Location nvarchar(100),
  @RequestedBy nvarchar(50),
  @Currency nvarchar(3)
RETURNS uniqueidentifier
```

#### sp_AddCreditNoteItem
```sql
PROCEDURE sp_AddCreditNoteItem
  @CreditNoteId uniqueidentifier,
  @POItemId uniqueidentifier,
  @GRNItemId uniqueidentifier = NULL,
  @QuantityReturned decimal(10,2),
  @Price decimal(15,2),
  @Reason nvarchar(500),
  @Condition nvarchar(50),
  @WarehouseLocation nvarchar(100) = NULL
RETURNS int
```

### 2.2 Approval Management

#### sp_SubmitCreditNoteForApproval
```sql
PROCEDURE sp_SubmitCreditNoteForApproval
  @CreditNoteId uniqueidentifier,
  @UserId nvarchar(50)
RETURNS bit
```

#### sp_ProcessCreditNoteApproval
```sql
PROCEDURE sp_ProcessCreditNoteApproval
  @CreditNoteId uniqueidentifier,
  @Action nvarchar(20),
  @UserId nvarchar(50),
  @Comments nvarchar(500) = NULL
RETURNS bit
```

### 2.3 Comments Management

#### sp_CreateCreditNoteComment
```sql
PROCEDURE sp_CreateCreditNoteComment
  @CreditNoteId uniqueidentifier,
  @UserId nvarchar(50),
  @Content nvarchar(max),
  @Type nvarchar(20),
  @Visibility nvarchar(20),
  @Mentions nvarchar(max) = NULL
RETURNS uniqueidentifier
```

#### sp_UpdateCreditNoteComment
```sql
PROCEDURE sp_UpdateCreditNoteComment
  @CommentId uniqueidentifier,
  @UserId nvarchar(50),
  @Content nvarchar(max),
  @Visibility nvarchar(20)
RETURNS bit
```

#### sp_DeleteCreditNoteComment
```sql
PROCEDURE sp_DeleteCreditNoteComment
  @CommentId uniqueidentifier,
  @UserId nvarchar(50)
RETURNS bit
```

#### sp_GetCreditNoteComments
```sql
PROCEDURE sp_GetCreditNoteComments
  @CreditNoteId uniqueidentifier,
  @PageNumber int = 1,
  @PageSize int = 50,
  @SortBy nvarchar(50) = 'createdAt',
  @SortOrder nvarchar(4) = 'desc'
RETURNS TABLE (
  Id uniqueidentifier,
  CreditNoteId uniqueidentifier,
  UserId nvarchar(50),
  UserName nvarchar(100),
  UserRole nvarchar(50),
  Content nvarchar(max),
  Type nvarchar(20),
  Visibility nvarchar(20),
  CreatedAt datetime,
  UpdatedAt datetime,
  Attachments nvarchar(max), -- JSON array
  Mentions nvarchar(max) -- JSON array
)
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

#### sp_RemoveCommentAttachment
```sql
PROCEDURE sp_RemoveCommentAttachment
  @AttachmentId uniqueidentifier,
  @CommentId uniqueidentifier,
  @UserId nvarchar(50)
RETURNS bit
```

### 2.4 Activity Logging

#### sp_LogCreditNoteActivity
```sql
PROCEDURE sp_LogCreditNoteActivity
  @CreditNoteId uniqueidentifier,
  @UserId nvarchar(50),
  @Type nvarchar(50),
  @Action nvarchar(100),
  @Description nvarchar(500),
  @Metadata nvarchar(max),
  @IPAddress nvarchar(50) = NULL,
  @UserAgent nvarchar(500) = NULL
RETURNS uniqueidentifier
```

#### sp_GetCreditNoteActivityLog
```sql
PROCEDURE sp_GetCreditNoteActivityLog
  @CreditNoteId uniqueidentifier,
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

#### sp_GetRelatedActivities
```sql
PROCEDURE sp_GetRelatedActivities
  @ActivityId uniqueidentifier
RETURNS TABLE (
  Id uniqueidentifier,
  ParentActivityId uniqueidentifier,
  Type nvarchar(50),
  Action nvarchar(100),
  Description nvarchar(500),
  Metadata nvarchar(max),
  UserId nvarchar(50),
  UserName nvarchar(100),
  Timestamp datetime
)
```

### 2.5 Activity Analysis Functions

#### fn_GetActivitySummary
```sql
FUNCTION fn_GetActivitySummary
  @CreditNoteId uniqueidentifier,
  @FromDate datetime,
  @ToDate datetime
RETURNS TABLE (
  ActivityType nvarchar(50),
  ActivityCount int,
  UniqueUsers int,
  AverageResponseTime decimal(10,2),
  TopUsers nvarchar(max) -- JSON array of top users and their activity counts
)
```

#### fn_CalculateActivityMetrics
```sql
FUNCTION fn_CalculateActivityMetrics
  @CreditNoteId uniqueidentifier
RETURNS TABLE (
  MetricName nvarchar(100),
  MetricValue decimal(10,2),
  MetricUnit nvarchar(20)
)
```

### 2.7 Inventory Management

#### sp_ProcessCreditNoteInventory
```sql
PROCEDURE sp_ProcessCreditNoteInventory
  @CreditNoteId uniqueidentifier,
  @ItemId uniqueidentifier,
  @LocationId uniqueidentifier,
  @Quantity decimal(18,2),
  @ReturnCondition nvarchar(50),
  @LotNumber nvarchar(50) = NULL,
  @SerialNumbers nvarchar(max) = NULL, -- JSON array
  @ValuationMethod nvarchar(20), -- 'FIFO' or 'Average'
  @IsReusable bit = 0
RETURNS TABLE (
  TransactionId uniqueidentifier,
  ItemId uniqueidentifier,
  LotNumber nvarchar(50),
  QuantityReturned decimal(18,2),
  UnitCost decimal(18,2),
  TotalCost decimal(18,2),
  AdjustmentAmount decimal(18,2),
  NewStockQuantity decimal(18,2)
)
```

#### sp_UpdateInventoryForReturn
```sql
PROCEDURE sp_UpdateInventoryForReturn
  @CreditNoteId uniqueidentifier,
  @ItemId uniqueidentifier,
  @LocationId uniqueidentifier,
  @ReturnedLotNumber nvarchar(50),
  @OriginalGRNId uniqueidentifier,
  @Quantity decimal(18,2),
  @IsReusable bit,
  @NewLocationId uniqueidentifier = NULL -- For reusable items
RETURNS TABLE (
  TransactionId uniqueidentifier,
  OriginalCost decimal(18,2),
  ReturnValue decimal(18,2),
  StockAdjustment decimal(18,2),
  NewQuantity decimal(18,2)
)
```

#### sp_ProcessScrapInventory
```sql
PROCEDURE sp_ProcessScrapInventory
  @CreditNoteId uniqueidentifier,
  @ItemId uniqueidentifier,
  @LocationId uniqueidentifier,
  @Quantity decimal(18,2),
  @Reason nvarchar(500),
  @DisposalMethod nvarchar(50),
  @DisposalDate datetime
RETURNS uniqueidentifier
```

#### sp_GetReturnableInventory
```sql
PROCEDURE sp_GetReturnableInventory
  @POId uniqueidentifier,
  @GRNId uniqueidentifier,
  @ItemId uniqueidentifier
RETURNS TABLE (
  LotNumber nvarchar(50),
  ReceiptDate datetime,
  OriginalQuantity decimal(18,2),
  ReturnedQuantity decimal(18,2),
  AvailableQuantity decimal(18,2),
  UnitCost decimal(18,2),
  SerialNumbers nvarchar(max), -- JSON array
  ExpiryDate datetime,
  DaysFromReceipt int,
  IsWithinReturnPeriod bit,
  ManufacturingDate datetime,
  LotExpiryDate datetime
)
```

## 3. Example Request/Response Payloads

### 3.1 Credit Note Management

#### Create Credit Note
```typescript
// Request
POST /api/credit-notes
{
  "poId": "PO-2024-001",
  "grnId": "GRN-2024-001",
  "type": "Quality Issue",
  "reason": "Received items with physical damage",
  "date": "2024-03-26T10:00:00Z",
  "location": "HQ",
  "items": [
    {
      "poItemId": "POITEM-001",
      "grnItemId": "GRNITEM-001",
      "quantityReturned": 1,
      "price": 22500,
      "reason": "Physical damage on laptop",
      "condition": "Damaged",
      "warehouseLocation": "RACK-A1"
    }
  ],
  "attachments": [
    {
      "fileName": "damage_evidence.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ]
}

// Response
{
  "id": "CN-2024-001",
  "refNumber": "CN/2024/03/001",
  "date": "2024-03-26T10:00:00Z",
  "poId": "PO-2024-001",
  "poRefNumber": "PO/2024/03/001",
  "grnId": "GRN-2024-001",
  "grnRefNumber": "GRN/2024/03/001",
  "status": "Draft",
  "type": "Quality Issue",
  "reason": "Received items with physical damage",
  "location": "HQ",
  "department": "IT",
  "vendor": "Tech Supplies Co.",
  "vendorId": 1001,
  "requestedBy": {
    "id": "USER123",
    "name": "John Doe",
    "department": "Warehouse"
  },
  "currency": "THB",
  "baseCurrencyCode": "THB",
  "exchangeRate": 1,
  "items": [
    {
      "id": "CNITEM-001",
      "poItemId": "POITEM-001",
      "grnItemId": "GRNITEM-001",
      "name": "Laptop Dell XPS 13",
      "description": "Developer Laptop",
      "unit": "Units",
      "quantityReturned": 1,
      "price": 22500,
      "taxRate": 7,
      "taxAmount": 1575,
      "totalAmount": 24075,
      "reason": "Physical damage on laptop",
      "condition": "Damaged",
      "location": "HQ",
      "warehouseLocation": "RACK-A1"
    }
  ],
  "totalQuantity": 1,
  "baseSubTotalAmount": 22500,
  "subTotalAmount": 22500,
  "baseTaxAmount": 1575,
  "taxAmount": 1575,
  "baseTotalAmount": 24075,
  "totalAmount": 24075,
  "createdAt": "2024-03-26T10:05:00Z",
  "updatedAt": "2024-03-26T10:05:00Z"
}
```

### 3.2 Approval Management

#### Process Approval
```typescript
// Request
POST /api/credit-notes/CN-2024-001/approve
{
  "action": "approve",
  "comments": "Verified damage evidence. Approval granted for return.",
  "userId": "USER456"
}

// Response
{
  "status": "Approved",
  "approvedBy": {
    "id": "USER456",
    "name": "Jane Smith",
    "department": "Finance"
  },
  "approvalDate": "2024-03-26T14:00:00Z",
  "comments": "Verified damage evidence. Approval granted for return."
}
```

### 3.3 Comments Management

#### Add Approval Comment
```typescript
// Request
POST /api/credit-notes/CN-2024-001/comments
{
  "content": "Approval granted after reviewing damage evidence and vendor communication.",
  "type": "approval",
  "visibility": "internal",
  "attachments": [
    {
      "fileName": "vendor_communication.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ],
  "mentions": ["USER789"]
}

// Response
{
  "id": "CMT-001",
  "creditNoteId": "CN-2024-001",
  "userId": "USER456",
  "userName": "Jane Smith",
  "userRole": "Finance Manager",
  "content": "Approval granted after reviewing damage evidence and vendor communication.",
  "type": "approval",
  "visibility": "internal",
  "attachments": [
    {
      "id": "ATT-001",
      "fileName": "vendor_communication.pdf",
      "fileType": "application/pdf",
      "fileSize": 150000,
      "url": "/attachments/CN-2024-001/vendor_communication.pdf"
    }
  ],
  "mentions": [
    {
      "userId": "USER789",
      "userName": "Bob Wilson"
    }
  ],
  "createdAt": "2024-03-26T14:30:00Z",
  "updatedAt": "2024-03-26T14:30:00Z"
}
```

### 3.4 Activity Log

#### Get Activity Log
```typescript
// Request
GET /api/credit-notes/CN-2024-001/activity-log?type=approval,return

// Response
{
  "data": [
    {
      "id": "ACT-001",
      "creditNoteId": "CN-2024-001",
      "type": "creation",
      "action": "create",
      "description": "Credit note created for damaged items",
      "metadata": {
        "poId": "PO-2024-001",
        "grnId": "GRN-2024-001",
        "items": [
          {
            "itemId": "CNITEM-001",
            "quantityReturned": 1,
            "condition": "Damaged"
          }
        ]
      },
      "user": {
        "id": "USER123",
        "name": "John Doe",
        "role": "Warehouse Officer",
        "department": "Warehouse"
      },
      "timestamp": "2024-03-26T10:05:00Z"
    },
    {
      "id": "ACT-002",
      "type": "approval",
      "action": "approve",
      "description": "Credit note approved",
      "metadata": {
        "approvalDetails": {
          "action": "approve",
          "comments": "Verified damage evidence. Approval granted for return.",
          "userId": "USER456"
        }
      },
      "user": {
        "id": "USER456",
        "name": "Jane Smith",
        "role": "Finance Manager",
        "department": "Finance"
      },
      "timestamp": "2024-03-26T14:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### 3.5 Additional Comment Examples

#### Update Comment
```typescript
// Request
PUT /api/credit-notes/CN-2024-001/comments/CMT-001
{
  "content": "Updated: Approval granted after reviewing additional evidence.",
  "visibility": "internal",
  "attachments": [
    {
      "id": "ATT-001", // Keep existing attachment
      "fileName": "additional_evidence.pdf", // Add new attachment
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ]
}

// Response
{
  "id": "CMT-001",
  "creditNoteId": "CN-2024-001",
  "userId": "USER456",
  "userName": "Jane Smith",
  "userRole": "Finance Manager",
  "content": "Updated: Approval granted after reviewing additional evidence.",
  "type": "approval",
  "visibility": "internal",
  "attachments": [
    {
      "id": "ATT-001",
      "fileName": "vendor_communication.pdf",
      "fileType": "application/pdf",
      "fileSize": 150000,
      "url": "/attachments/CN-2024-001/vendor_communication.pdf"
    },
    {
      "id": "ATT-002",
      "fileName": "additional_evidence.pdf",
      "fileType": "application/pdf",
      "fileSize": 180000,
      "url": "/attachments/CN-2024-001/additional_evidence.pdf"
    }
  ],
  "createdAt": "2024-03-26T14:30:00Z",
  "updatedAt": "2024-03-26T15:00:00Z"
}
```

#### Get Comments with Filters
```typescript
// Request
GET /api/credit-notes/CN-2024-001/comments?type=approval&visibility=internal&page=1&limit=10

// Response
{
  "data": [
    {
      "id": "CMT-001",
      // ... comment details ...
    },
    {
      "id": "CMT-002",
      "creditNoteId": "CN-2024-001",
      "userId": "USER789",
      "userName": "Bob Wilson",
      "userRole": "Finance Analyst",
      "content": "Reviewed financial impact of return.",
      "type": "approval",
      "visibility": "internal",
      "createdAt": "2024-03-26T14:45:00Z",
      "updatedAt": "2024-03-26T14:45:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### 3.6 Additional Activity Log Examples

#### Get Activity Summary
```typescript
// Request
GET /api/credit-notes/CN-2024-001/activity-summary?fromDate=2024-03-26&toDate=2024-03-27

// Response
{
  "summary": [
    {
      "activityType": "approval",
      "activityCount": 3,
      "uniqueUsers": 2,
      "averageResponseTime": 45.5, // minutes
      "topUsers": [
        {
          "userId": "USER456",
          "userName": "Jane Smith",
          "activityCount": 2
        },
        {
          "userId": "USER789",
          "userName": "Bob Wilson",
          "activityCount": 1
        }
      ]
    },
    {
      "activityType": "comment",
      "activityCount": 5,
      "uniqueUsers": 3,
      "averageResponseTime": 15.2,
      "topUsers": [
        // ... user statistics ...
      ]
    }
  ],
  "metrics": [
    {
      "name": "Average Approval Time",
      "value": 45.5,
      "unit": "minutes"
    },
    {
      "name": "Comment Response Rate",
      "value": 85.5,
      "unit": "percent"
    }
  ]
}
```

#### Get Related Activities
```typescript
// Request
GET /api/credit-notes/CN-2024-001/activity-log/ACT-002/related

// Response
{
  "activity": {
    "id": "ACT-002",
    "type": "approval",
    // ... main activity details ...
  },
  "relatedActivities": [
    {
      "id": "ACT-003",
      "type": "comment",
      "action": "add_comment",
      "description": "Comment added to approval",
      "metadata": {
        "commentId": "CMT-001",
        "content": "Approval granted after reviewing damage evidence."
      },
      "user": {
        "id": "USER456",
        "name": "Jane Smith",
        "role": "Finance Manager"
      },
      "timestamp": "2024-03-26T14:30:00Z"
    },
    {
      "id": "ACT-004",
      "type": "system",
      "action": "notification_sent",
      "description": "Approval notification sent to vendor",
      "metadata": {
        "notificationType": "email",
        "recipient": "vendor@techsupplies.com"
      },
      "timestamp": "2024-03-26T14:31:00Z"
    }
  ],
  "timeline": {
    "startTime": "2024-03-26T14:00:00Z",
    "endTime": "2024-03-26T14:31:00Z",
    "duration": "31 minutes",
    "steps": [
      {
        "timestamp": "2024-03-26T14:00:00Z",
        "action": "approve",
        "description": "Credit note approved"
      },
      {
        "timestamp": "2024-03-26T14:30:00Z",
        "action": "add_comment",
        "description": "Approval comment added"
      },
      {
        "timestamp": "2024-03-26T14:31:00Z",
        "action": "notification_sent",
        "description": "Vendor notified"
      }
    ]
  }
}

### 3.8 Inventory Management Examples

#### Process Return Inventory
```typescript
// Request
POST /api/credit-notes/CN-2024-001/items/CNITEM-001/inventory/return
{
  "locationId": "LOC-001",
  "quantity": 1,
  "returnCondition": "Damaged",
  "lotNumber": "LOT-2024-001",
  "serialNumbers": ["SN001"],
  "valuationMethod": "FIFO",
  "isReusable": false,
  "returnReason": "Physical damage",
  "disposalMethod": "Scrap",
  "manufacturingDate": "2024-01-15T00:00:00Z",
  "lotExpiryDate": "2025-01-15T00:00:00Z"
}

// Response
{
  "transactionId": "INVT-003",
  "itemId": "ITEM-001",
  "lotNumber": "LOT-2024-001",
  "quantityReturned": 1,
  "unitCost": 225.50,
  "totalCost": 225.50,
  "adjustmentAmount": -225.50,
  "newStockQuantity": 149,
  "inventoryImpact": {
    "originalLocation": {
      "locationId": "LOC-001",
      "previousQuantity": 150,
      "newQuantity": 149,
      "adjustment": -1
    },
    "disposalDetails": {
      "method": "Scrap",
      "reason": "Physical damage",
      "disposalReference": "DISP-001"
    },
    "lotDetails": {
      "manufacturingDate": "2024-01-15T00:00:00Z",
      "lotExpiryDate": "2025-01-15T00:00:00Z",
      "remainingShelfLife": "290 days"
    }
  }
}
```

#### Process Reusable Return
```typescript
// Request
POST /api/credit-notes/CN-2024-001/items/CNITEM-002/inventory/return
{
  "locationId": "LOC-001",
  "quantity": 1,
  "returnCondition": "Good",
  "lotNumber": "LOT-2024-001",
  "serialNumbers": ["SN002"],
  "valuationMethod": "FIFO",
  "isReusable": true,
  "newLocationId": "LOC-002", // Returns warehouse
  "qualityCheckRequired": true,
  "manufacturingDate": "2024-01-15T00:00:00Z",
  "lotExpiryDate": "2025-01-15T00:00:00Z"
}

// Response
{
  "transactionId": "INVT-004",
  "itemId": "ITEM-001",
  "lotNumber": "LOT-2024-001",
  "quantityReturned": 1,
  "unitCost": 225.50,
  "totalCost": 225.50,
  "adjustmentAmount": 0,
  "newStockQuantity": 149,
  "inventoryImpact": {
    "originalLocation": {
      "locationId": "LOC-001",
      "previousQuantity": 150,
      "newQuantity": 149,
      "adjustment": -1
    },
    "newLocation": {
      "locationId": "LOC-002",
      "previousQuantity": 10,
      "newQuantity": 11,
      "adjustment": 1
    },
    "qualityCheck": {
      "status": "Pending",
      "checklistId": "QC-001",
      "assignedTo": "USER456"
    },
    "lotDetails": {
      "manufacturingDate": "2024-01-15T00:00:00Z",
      "lotExpiryDate": "2025-01-15T00:00:00Z",
      "remainingShelfLife": "290 days"
    }
  }
}
```

#### Get Returnable Inventory
```typescript
// Request
GET /api/credit-notes/returnable-inventory?poId=PO-2024-001&itemId=ITEM-001

// Response
{
  "itemId": "ITEM-001",
  "itemName": "Laptop Dell XPS 13",
  "returnableInventory": [
    {
      "lotNumber": "LOT-2024-001",
      "receiptDate": "2024-03-26T10:00:00Z",
      "manufacturingDate": "2024-01-15T00:00:00Z",
      "lotExpiryDate": "2025-01-15T00:00:00Z",
      "originalQuantity": 100,
      "returnedQuantity": 1,
      "availableQuantity": 99,
      "unitCost": 225.50,
      "serialNumbers": ["SN002", "SN003"],
      "daysFromReceipt": 1,
      "isWithinReturnPeriod": true,
      "returnPeriodDetails": {
        "allowedDays": 30,
        "remainingDays": 29,
        "returnDeadline": "2024-04-25T10:00:00Z"
      },
      "lotDetails": {
        "remainingShelfLife": "290 days",
        "shelfLifeStatus": "Good",
        "qualityStatus": "Acceptable"
      }
    },
    {
      "lotNumber": "LOT-2024-000",
      "receiptDate": "2024-03-25T10:00:00Z",
      "manufacturingDate": "2024-01-14T00:00:00Z",
      "lotExpiryDate": "2025-01-14T00:00:00Z",
      "originalQuantity": 50,
      "returnedQuantity": 0,
      "availableQuantity": 50,
      "unitCost": 211.25,
      "serialNumbers": [],
      "daysFromReceipt": 2,
      "isWithinReturnPeriod": true,
      "returnPeriodDetails": {
        "allowedDays": 30,
        "remainingDays": 28,
        "returnDeadline": "2024-04-24T10:00:00Z"
      },
      "lotDetails": {
        "remainingShelfLife": "289 days",
        "shelfLifeStatus": "Good",
        "qualityStatus": "Acceptable"
      }
    }
  ],
  "summary": {
    "totalReturnableQuantity": 149,
    "totalReturnValue": 33112.50,
    "averageCost": 220.75,
    "lotAnalysis": {
      "totalLots": 2,
      "expiringWithin30Days": 0,
      "expiringWithin90Days": 0,
      "expiringBeyond90Days": 2
    }
  }
}
```

#### Process Scrap Inventory
```typescript
// Request
POST /api/credit-notes/CN-2024-001/items/CNITEM-001/inventory/scrap
{
  "locationId": "LOC-001",
  "quantity": 1,
  "reason": "Unrepairable damage",
  "disposalMethod": "Electronic Waste",
  "disposalDate": "2024-03-27T10:00:00Z",
  "disposalNotes": "Sent to certified e-waste facility",
  "attachments": [
    {
      "fileName": "disposal_certificate.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ]
}

// Response
{
  "transactionId": "INVT-005",
  "disposalReference": "DISP-002",
  "itemDetails": {
    "itemId": "ITEM-001",
    "quantity": 1,
    "disposalValue": 225.50
  },
  "disposalDetails": {
    "method": "Electronic Waste",
    "facility": "Green E-Waste Solutions",
    "certificateNumber": "CERT-2024-001",
    "disposalDate": "2024-03-27T10:00:00Z"
  },
  "inventoryImpact": {
    "locationId": "LOC-001",
    "previousQuantity": 149,
    "newQuantity": 148,
    "adjustment": -1,
    "valueAdjustment": -225.50
  },
  "accountingEntries": {
    "debit": {
      "account": "Inventory Write-off",
      "amount": 225.50
    },
    "credit": {
      "account": "Inventory",
      "amount": 225.50
    }
  }
}
```

### 4.2 Inventory Error Handling

#### Return Processing Errors
```typescript
// Invalid Lot Number Error
{
  "error": "InvalidLotNumberError",
  "message": "Lot number not found in original GRN",
  "details": {
    "lotNumber": "LOT-999",
    "grnId": "GRN-2024-001"
  }
}

// Expired Lot Error
{
  "error": "ExpiredLotError",
  "message": "Cannot process return for expired lot",
  "details": {
    "lotNumber": "LOT-2024-001",
    "lotExpiryDate": "2024-01-15T00:00:00Z",
    "currentDate": "2024-03-26T10:00:00Z"
  }
}

// Invalid Return Period Error
{
  "error": "InvalidReturnPeriodError",
  "message": "Item return period has expired",
  "details": {
    "lotNumber": "LOT-2024-001",
    "receiptDate": "2024-03-26T10:00:00Z",
    "returnDeadline": "2024-04-25T10:00:00Z",
    "currentDate": "2024-05-01T10:00:00Z",
    "allowedDays": 30
  }
} 
