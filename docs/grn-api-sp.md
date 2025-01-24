# Goods Received Note (GRN) Module - API and Stored Procedures Documentation

## 1. API Endpoints

### 1.1 GRN Management

#### Get GRNs
```typescript
GET /api/grns
Query Parameters: {
  status?: GRNStatus
  poId?: string
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
  data: GoodsReceivedNote[]
  total: number
  page: number
  limit: number
}

interface GoodsReceivedNote {
  id: string
  refNumber: string
  date: string
  poId: string
  poRefNumber: string
  status: GRNStatus
  location: string
  department: string
  vendor: string
  vendorId: number
  receivedBy: {
    id: string
    name: string
    department: string
  }
  inspectedBy?: {
    id: string
    name: string
    department: string
  }
  items: GRNItem[]
  attachments: Attachment[]
  comments: Comment[]
  totalQuantity: number
  totalAccepted: number
  totalRejected: number
  createdAt: string
  updatedAt: string
}

interface GRNItem {
  id: string
  poItemId: string
  name: string
  description: string
  unit: string
  quantityOrdered: number
  quantityReceived: number
  quantityAccepted: number
  quantityRejected: number
  rejectionReason?: string
  inspectionStatus: 'Pending' | 'Passed' | 'Failed'
  inspectionDate?: string
  inspectionNotes?: string
  batchNumber?: string
  serialNumbers?: string[]
  location: string
  warehouseLocation?: string
}

type GRNStatus = 'Draft' | 'Pending Inspection' | 'Inspected' | 'Completed' | 'Cancelled'
```

#### Get GRN by ID
```typescript
GET /api/grns/:id
Response: GoodsReceivedNote
```

#### Create GRN
```typescript
POST /api/grns
Body: {
  poId: string
  date: string
  location: string
  items: {
    poItemId: string
    quantityReceived: number
    batchNumber?: string
    serialNumbers?: string[]
    warehouseLocation?: string
  }[]
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
}
Response: GoodsReceivedNote
```

### 1.2 Quality Inspection

#### Record Inspection
```typescript
POST /api/grns/:id/inspection
Body: {
  inspectedBy: string
  date: string
  items: {
    itemId: string
    quantityAccepted: number
    quantityRejected: number
    rejectionReason?: string
    inspectionStatus: 'Passed' | 'Failed'
    inspectionNotes?: string
  }[]
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
}
Response: GoodsReceivedNote
```

### 1.3 Comments Management

#### Get GRN Comments
```typescript
GET /api/grns/:grnId/comments
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
  grnId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: 'general' | 'inspection' | 'system' | 'rejection'
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
POST /api/grns/:grnId/comments
Body: {
  content: string
  type: 'general' | 'inspection' | 'system' | 'rejection'
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
GET /api/grns/:grnId/activity-log
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
  grnId: string
  type: ActivityType
  action: string
  description: string
  metadata: {
    previousValue?: any
    newValue?: any
    inspectionDetails?: {
      inspectedBy: string
      items: {
        itemId: string
        quantityAccepted: number
        quantityRejected: number
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
  | 'inspection'
  | 'comment'
  | 'attachment'
  | 'rejection'
  | 'system'
```

## 2. Stored Procedures

### 2.1 GRN Management

#### sp_CreateGRN
```sql
PROCEDURE sp_CreateGRN
  @POId uniqueidentifier,
  @Date datetime,
  @Location nvarchar(100),
  @ReceivedBy nvarchar(50)
RETURNS uniqueidentifier
```

#### sp_AddGRNItem
```sql
PROCEDURE sp_AddGRNItem
  @GRNId uniqueidentifier,
  @POItemId uniqueidentifier,
  @QuantityReceived decimal(10,2),
  @BatchNumber nvarchar(50) = NULL,
  @SerialNumbers nvarchar(max) = NULL,
  @WarehouseLocation nvarchar(100) = NULL
RETURNS int
```

### 2.2 Quality Inspection

#### sp_RecordInspection
```sql
PROCEDURE sp_RecordInspection
  @GRNId uniqueidentifier,
  @InspectedBy nvarchar(50),
  @InspectionDate datetime,
  @Items nvarchar(max) -- JSON array of inspection items
RETURNS bit
```

### 2.3 Comments Management

#### sp_CreateGRNComment
```sql
PROCEDURE sp_CreateGRNComment
  @GRNId uniqueidentifier,
  @UserId nvarchar(50),
  @Content nvarchar(max),
  @Type nvarchar(20),
  @Visibility nvarchar(20),
  @Mentions nvarchar(max) = NULL
RETURNS uniqueidentifier
```

### 2.4 Activity Logging

#### sp_LogGRNActivity
```sql
PROCEDURE sp_LogGRNActivity
  @GRNId uniqueidentifier,
  @UserId nvarchar(50),
  @Type nvarchar(50),
  @Action nvarchar(100),
  @Description nvarchar(500),
  @Metadata nvarchar(max),
  @IPAddress nvarchar(50) = NULL,
  @UserAgent nvarchar(500) = NULL
RETURNS uniqueidentifier
```

### 2.6 Inventory Updates

#### sp_UpdateInventoryFIFO
```sql
PROCEDURE sp_UpdateInventoryFIFO
  @GRNId uniqueidentifier,
  @ItemId uniqueidentifier,
  @LocationId uniqueidentifier,
  @Quantity decimal(18,2),
  @UnitCost decimal(18,2),
  @LotNumber nvarchar(50),
  @ManufacturingDate datetime = NULL,
  @LotExpiryDate datetime = NULL,
  @SerialNumbers nvarchar(max) = NULL -- JSON array of serial numbers
RETURNS TABLE (
  TransactionId uniqueidentifier,
  ItemId uniqueidentifier,
  LotNumber nvarchar(50),
  QuantityReceived decimal(18,2),
  UnitCost decimal(18,2),
  TotalCost decimal(18,2),
  RunningQuantity decimal(18,2),
  AverageCost decimal(18,2),
  LotDetails nvarchar(max) -- JSON with lot tracking details
)
```

#### sp_UpdateInventoryAverage
```sql
PROCEDURE sp_UpdateInventoryAverage
  @GRNId uniqueidentifier,
  @ItemId uniqueidentifier,
  @LocationId uniqueidentifier,
  @Quantity decimal(18,2),
  @UnitCost decimal(18,2),
  @LotNumber nvarchar(50),
  @ManufacturingDate datetime = NULL,
  @LotExpiryDate datetime = NULL
RETURNS TABLE (
  TransactionId uniqueidentifier,
  ItemId uniqueidentifier,
  PreviousQuantity decimal(18,2),
  PreviousAverageCost decimal(18,2),
  NewQuantity decimal(18,2),
  NewAverageCost decimal(18,2),
  TotalValue decimal(18,2),
  LotDetails nvarchar(max) -- JSON with lot tracking details
)
```

#### sp_GetInventoryValuation
```sql
PROCEDURE sp_GetInventoryValuation
  @ItemId uniqueidentifier,
  @LocationId uniqueidentifier,
  @ValuationMethod nvarchar(20), -- 'FIFO' or 'Average'
  @AsOfDate datetime = NULL
RETURNS TABLE (
  ItemId uniqueidentifier,
  LocationId uniqueidentifier,
  TotalQuantity decimal(18,2),
  AverageCost decimal(18,2),
  TotalValue decimal(18,2),
  LastUpdated datetime,
  LotValuationDetails nvarchar(max) -- JSON with lot-wise valuation
)
```

#### sp_RecalculateInventoryCosts
```sql
PROCEDURE sp_RecalculateInventoryCosts
  @ItemId uniqueidentifier = NULL, -- NULL for all items
  @LocationId uniqueidentifier = NULL, -- NULL for all locations
  @FromDate datetime = NULL,
  @ToDate datetime = NULL
RETURNS TABLE (
  ItemId uniqueidentifier,
  LocationId uniqueidentifier,
  OldAverageCost decimal(18,2),
  NewAverageCost decimal(18,2),
  Difference decimal(18,2),
  AdjustmentAmount decimal(18,2)
)
```

#### sp_TrackLotInventory
```sql
PROCEDURE sp_TrackLotInventory
  @ItemId uniqueidentifier,
  @LotNumber nvarchar(50),
  @FromDate datetime = NULL,
  @ToDate datetime = NULL
RETURNS TABLE (
  TransactionId uniqueidentifier,
  TransactionType nvarchar(50),
  TransactionDate datetime,
  LocationId uniqueidentifier,
  Quantity decimal(18,2),
  UnitCost decimal(18,2),
  ManufacturingDate datetime,
  LotExpiryDate datetime,
  RemainingQuantity decimal(18,2),
  QualityStatus nvarchar(50),
  ShelfLifeStatus nvarchar(50)
)
```

## 3. Example Request/Response Payloads

### 3.1 GRN Management

#### Create GRN
```typescript
// Request
POST /api/grns
{
  "poId": "PO-2024-001",
  "date": "2024-03-25T10:00:00Z",
  "location": "HQ",
  "items": [
    {
      "poItemId": "POITEM-001",
      "quantityReceived": 2,
      "batchNumber": "BN2024001",
      "serialNumbers": ["SN001", "SN002"],
      "warehouseLocation": "RACK-A1"
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
  "id": "GRN-2024-001",
  "refNumber": "GRN/2024/03/001",
  "date": "2024-03-25T10:00:00Z",
  "poId": "PO-2024-001",
  "poRefNumber": "PO/2024/03/001",
  "status": "Pending Inspection",
  "location": "HQ",
  "department": "IT",
  "vendor": "Tech Supplies Co.",
  "vendorId": 1001,
  "receivedBy": {
    "id": "USER123",
    "name": "John Doe",
    "department": "Warehouse"
  },
  "items": [
    {
      "id": "GRNITEM-001",
      "poItemId": "POITEM-001",
      "name": "Laptop Dell XPS 13",
      "description": "Developer Laptop",
      "unit": "Units",
      "quantityOrdered": 2,
      "quantityReceived": 2,
      "quantityAccepted": 0,
      "quantityRejected": 0,
      "inspectionStatus": "Pending",
      "batchNumber": "BN2024001",
      "serialNumbers": ["SN001", "SN002"],
      "location": "HQ",
      "warehouseLocation": "RACK-A1"
    }
  ],
  "totalQuantity": 2,
  "totalAccepted": 0,
  "totalRejected": 0,
  "createdAt": "2024-03-25T10:05:00Z",
  "updatedAt": "2024-03-25T10:05:00Z"
}
```

### 3.2 Quality Inspection

#### Record Inspection
```typescript
// Request
POST /api/grns/GRN-2024-001/inspection
{
  "inspectedBy": "USER456",
  "date": "2024-03-25T14:00:00Z",
  "items": [
    {
      "itemId": "GRNITEM-001",
      "quantityAccepted": 1,
      "quantityRejected": 1,
      "rejectionReason": "Physical damage on one unit",
      "inspectionStatus": "Failed",
      "inspectionNotes": "One laptop has dented corner"
    }
  ],
  "attachments": [
    {
      "fileName": "inspection_photos.zip",
      "fileType": "application/zip",
      "fileContent": "base64_encoded_content..."
    }
  ]
}

// Response
{
  "id": "GRN-2024-001",
  // ... updated GRN details with inspection information ...
}
```

### 3.3 Comments Management

#### Add Inspection Comment
```typescript
// Request
POST /api/grns/GRN-2024-001/comments
{
  "content": "Inspection completed. One unit rejected due to physical damage.",
  "type": "inspection",
  "visibility": "internal",
  "attachments": [
    {
      "fileName": "damage_report.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ],
  "mentions": ["USER789"]
}

// Response
{
  "id": "CMT-001",
  "grnId": "GRN-2024-001",
  "userId": "USER456",
  "userName": "Jane Smith",
  "userRole": "QA Inspector",
  "content": "Inspection completed. One unit rejected due to physical damage.",
  "type": "inspection",
  "visibility": "internal",
  "attachments": [
    {
      "id": "ATT-001",
      "fileName": "damage_report.pdf",
      "fileType": "application/pdf",
      "fileSize": 250000,
      "url": "/attachments/GRN-2024-001/damage_report.pdf"
    }
  ],
  "mentions": [
    {
      "userId": "USER789",
      "userName": "Bob Wilson"
    }
  ],
  "createdAt": "2024-03-25T14:30:00Z",
  "updatedAt": "2024-03-25T14:30:00Z"
}
```

### 3.4 Activity Log

#### Get Activity Log
```typescript
// Request
GET /api/grns/GRN-2024-001/activity-log?type=inspection,rejection

// Response
{
  "data": [
    {
      "id": "ACT-001",
      "grnId": "GRN-2024-001",
      "type": "creation",
      "action": "create",
      "description": "GRN created from PO-2024-001",
      "metadata": {
        "poId": "PO-2024-001",
        "items": [
          {
            "itemId": "GRNITEM-001",
            "quantityReceived": 2
          }
        ]
      },
      "user": {
        "id": "USER123",
        "name": "John Doe",
        "role": "Warehouse Officer",
        "department": "Warehouse"
      },
      "timestamp": "2024-03-25T10:05:00Z"
    },
    {
      "id": "ACT-002",
      "type": "inspection",
      "action": "record_inspection",
      "description": "Quality inspection completed",
      "metadata": {
        "inspectionDetails": {
          "inspectedBy": "USER456",
          "items": [
            {
              "itemId": "GRNITEM-001",
              "quantityAccepted": 1,
              "quantityRejected": 1,
              "rejectionReason": "Physical damage"
            }
          ]
        }
      },
      "user": {
        "id": "USER456",
        "name": "Jane Smith",
        "role": "QA Inspector",
        "department": "Quality"
      },
      "timestamp": "2024-03-25T14:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### 3.7 Inventory Update Examples

#### Update Inventory (FIFO)
```typescript
// Request
POST /api/grn/GRN-2024-001/items/GRNITEM-001/inventory/fifo
{
  "locationId": "LOC-001",
  "quantity": 100,
  "unitCost": 225.50,
  "lotNumber": "LOT-2024-001",
  "manufacturingDate": "2024-01-15T00:00:00Z",
  "lotExpiryDate": "2025-01-15T00:00:00Z",
  "serialNumbers": [
    "SN001", "SN002", "SN003"
  ],
  "qualityCheck": {
    "status": "Passed",
    "checkedBy": "USER456",
    "checkDate": "2024-03-26T09:00:00Z",
    "parameters": {
      "visualInspection": "Pass",
      "functionalTest": "Pass",
      "packagingCondition": "Good"
    }
  }
}

// Response
{
  "transactionId": "INVT-001",
  "itemId": "ITEM-001",
  "lotNumber": "LOT-2024-001",
  "quantityReceived": 100,
  "unitCost": 225.50,
  "totalCost": 22550.00,
  "runningQuantity": 150,
  "averageCost": 220.75,
  "lotDetails": {
    "manufacturingDate": "2024-01-15T00:00:00Z",
    "lotExpiryDate": "2025-01-15T00:00:00Z",
    "remainingShelfLife": "290 days",
    "shelfLifeStatus": "Good",
    "qualityStatus": "Passed",
    "storageConditions": {
      "temperature": "20-25°C",
      "humidity": "45-55%",
      "specialInstructions": "Keep away from direct sunlight"
    }
  },
  "fifoLayers": [
    {
      "lotNumber": "LOT-2024-001",
      "receivedDate": "2024-03-26T10:00:00Z",
      "quantity": 100,
      "unitCost": 225.50,
      "remainingQuantity": 100,
      "expiryStatus": "Valid"
    },
    {
      "lotNumber": "LOT-2024-000",
      "receivedDate": "2024-03-25T10:00:00Z",
      "quantity": 50,
      "unitCost": 211.25,
      "remainingQuantity": 50,
      "expiryStatus": "Valid"
    }
  ]
}
```

#### Update Inventory (Average)
```typescript
// Request
POST /api/grn/GRN-2024-001/items/GRNITEM-001/inventory/average
{
  "locationId": "LOC-001",
  "quantity": 100,
  "unitCost": 225.50,
  "lotNumber": "LOT-2024-001",
  "manufacturingDate": "2024-01-15T00:00:00Z",
  "lotExpiryDate": "2025-01-15T00:00:00Z",
  "qualityCheck": {
    "status": "Passed",
    "checkedBy": "USER456",
    "checkDate": "2024-03-26T09:00:00Z"
  }
}

// Response
{
  "transactionId": "INVT-002",
  "itemId": "ITEM-001",
  "previousQuantity": 50,
  "previousAverageCost": 211.25,
  "newQuantity": 150,
  "newAverageCost": 220.75,
  "totalValue": 33112.50,
  "lotDetails": {
    "lotNumber": "LOT-2024-001",
    "manufacturingDate": "2024-01-15T00:00:00Z",
    "lotExpiryDate": "2025-01-15T00:00:00Z",
    "remainingShelfLife": "290 days",
    "shelfLifeStatus": "Good",
    "qualityStatus": "Passed"
  },
  "costCalculation": {
    "previousValue": 10562.50,
    "newValue": 22550.00,
    "totalValue": 33112.50,
    "averageCostCalculation": "33112.50 / 150 = 220.75"
  }
}
```

#### Get Inventory Valuation
```typescript
// Request
GET /api/inventory/valuation?itemId=ITEM-001&locationId=LOC-001&valuationMethod=FIFO

// Response
{
  "itemId": "ITEM-001",
  "locationId": "LOC-001",
  "totalQuantity": 150,
  "averageCost": 220.75,
  "totalValue": 33112.50,
  "lastUpdated": "2024-03-26T10:00:00Z",
  "lotValuationDetails": {
    "fifoLayers": [
      {
        "lotNumber": "LOT-2024-001",
        "receivedDate": "2024-03-26T10:00:00Z",
        "quantity": 100,
        "unitCost": 225.50,
        "value": 22550.00,
        "manufacturingDate": "2024-01-15T00:00:00Z",
        "lotExpiryDate": "2025-01-15T00:00:00Z",
        "remainingShelfLife": "290 days"
      },
      {
        "lotNumber": "LOT-2024-000",
        "receivedDate": "2024-03-25T10:00:00Z",
        "quantity": 50,
        "unitCost": 211.25,
        "value": 10562.50,
        "manufacturingDate": "2024-01-14T00:00:00Z",
        "lotExpiryDate": "2025-01-14T00:00:00Z",
        "remainingShelfLife": "289 days"
      }
    ],
    "lotAnalysis": {
      "totalLots": 2,
      "expiringWithin30Days": 0,
      "expiringWithin90Days": 0,
      "expiringBeyond90Days": 2,
      "averageShelfLife": "289.5 days"
    },
    "qualityMetrics": {
      "totalPassedLots": 2,
      "totalFailedLots": 0,
      "qualityRate": "100%"
    }
  }
}
```

#### Track Lot Inventory
```typescript
// Request
GET /api/inventory/lot-tracking?itemId=ITEM-001&lotNumber=LOT-2024-001

// Response
{
  "itemId": "ITEM-001",
  "lotNumber": "LOT-2024-001",
  "lotDetails": {
    "manufacturingDate": "2024-01-15T00:00:00Z",
    "lotExpiryDate": "2025-01-15T00:00:00Z",
    "remainingShelfLife": "290 days",
    "initialQuantity": 100,
    "currentQuantity": 98,
    "qualityStatus": "Passed",
    "shelfLifeStatus": "Good"
  },
  "transactions": [
    {
      "transactionId": "INVT-001",
      "type": "Receipt",
      "date": "2024-03-26T10:00:00Z",
      "locationId": "LOC-001",
      "quantity": 100,
      "unitCost": 225.50,
      "reference": "GRN-2024-001"
    },
    {
      "transactionId": "INVT-003",
      "type": "Issue",
      "date": "2024-03-27T09:00:00Z",
      "locationId": "LOC-001",
      "quantity": -2,
      "unitCost": 225.50,
      "reference": "ISS-2024-001"
    }
  ],
  "qualityChecks": [
    {
      "checkId": "QC-001",
      "date": "2024-03-26T09:00:00Z",
      "status": "Passed",
      "checkedBy": "USER456",
      "parameters": {
        "visualInspection": "Pass",
        "functionalTest": "Pass",
        "packagingCondition": "Good"
      }
    }
  ],
  "storageHistory": [
    {
      "locationId": "LOC-001",
      "fromDate": "2024-03-26T10:00:00Z",
      "toDate": null,
      "conditions": {
        "temperature": "20-25°C",
        "humidity": "45-55%"
      }
    }
  ]
}
```

### 4. Error Handling

#### Inventory Update Errors
```typescript
// Invalid Lot Number Format
{
  "error": "InvalidLotNumberFormatError",
  "message": "Lot number format is invalid",
  "details": {
    "lotNumber": "L123",
    "expectedFormat": "LOT-YYYY-###"
  }
}

// Duplicate Lot Number
{
  "error": "DuplicateLotNumberError",
  "message": "Lot number already exists for this item",
  "details": {
    "lotNumber": "LOT-2024-001",
    "existingTransaction": "GRN-2024-000"
  }
}

// Invalid Manufacturing Date
{
  "error": "InvalidManufacturingDateError",
  "message": "Manufacturing date cannot be in the future",
  "details": {
    "lotNumber": "LOT-2024-001",
    "manufacturingDate": "2025-01-15T00:00:00Z",
    "currentDate": "2024-03-26T10:00:00Z"
  }
}

// Invalid Lot Expiry
{
  "error": "InvalidLotExpiryError",
  "message": "Lot expiry date must be after manufacturing date",
  "details": {
    "lotNumber": "LOT-2024-001",
    "manufacturingDate": "2024-01-15T00:00:00Z",
    "lotExpiryDate": "2024-01-14T00:00:00Z"
  }
}

// Quality Check Required
{
  "error": "QualityCheckRequiredError",
  "message": "Quality check is required before inventory update",
  "details": {
    "lotNumber": "LOT-2024-001",
    "itemId": "ITEM-001",
    "requiredChecks": ["visualInspection", "functionalTest"]
  }
} 