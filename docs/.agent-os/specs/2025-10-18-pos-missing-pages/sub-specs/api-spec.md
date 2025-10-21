# API Specification

> Spec: POS Integration Missing Pages Implementation
> Created: 2025-10-18

## Overview

This document specifies the API endpoints required to support the four missing POS Integration pages: Stock-out Review, Transaction Detail Drawer, Mapping Drawer Modal, and Failed Transaction View.

---

## 1. Stock-out Review & Approval API

### GET /api/pos/transactions/pending-approvals

Retrieve pending stock-out transactions awaiting approval.

**Authentication**: Required (JWT)
**Authorization**: `view_pending_approvals` permission
**Method**: GET

#### Query Parameters
```typescript
interface PendingApprovalsQuery {
  page?: number              // Default: 1
  pageSize?: number          // Default: 20, Max: 100
  location?: string          // Filter by location ID
  requester?: string         // Filter by user ID
  dateFrom?: string          // ISO date string
  dateTo?: string            // ISO date string
  search?: string            // Search by transaction ID
  sortBy?: "date" | "value" | "impact"  // Default: "date"
  sortOrder?: "asc" | "desc" // Default: "desc"
}
```

#### Response
```typescript
interface PendingApprovalsResponse {
  success: boolean
  data: {
    transactions: PendingTransaction[]
    pagination: {
      totalCount: number
      page: number
      pageSize: number
      totalPages: number
    }
  }
}

interface PendingTransaction {
  id: string
  transactionId: string
  date: string                 // ISO date string
  location: {
    id: string
    name: string
  }
  requester: {
    id: string
    name: string
    email: string
  }
  status: "pending_approval"
  itemCount: number
  totalValue: Money
  inventoryImpact: "low" | "medium" | "high"
  lineItems: {
    posItemId: string
    posItemName: string
    category: string
    quantity: number
    unitPrice: Money
    totalPrice: Money
    mappedRecipe: {
      id: string
      name: string
    } | null
  }[]
  notes: string | null
  attachments: {
    id: string
    filename: string
    url: string
    uploadedBy: string
    uploadedAt: string
  }[]
  createdAt: string
  updatedAt: string
}
```

#### Error Responses
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User lacks required permissions
- `400 Bad Request`: Invalid query parameters

---

### POST /api/pos/transactions/:id/approve

Approve a pending stock-out transaction.

**Authentication**: Required (JWT)
**Authorization**: `approve_transactions` permission
**Method**: POST

#### Path Parameters
- `id`: Transaction ID (string)

#### Request Body
```typescript
interface ApproveTransactionRequest {
  notes?: string              // Optional approval notes
  applyInventoryDeduction: boolean  // Default: true
}
```

#### Response
```typescript
interface ApproveTransactionResponse {
  success: boolean
  data: {
    transaction: {
      id: string
      status: "approved"
      approvedBy: {
        id: string
        name: string
      }
      approvedAt: string
      approvalNotes: string | null
    }
    inventoryUpdates: {
      ingredient: string
      location: string
      beforeStock: number
      deducted: number
      afterStock: number
      unit: string
    }[]
  }
  message: string
}
```

#### Error Responses
- `401 Unauthorized`: Invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Transaction not found
- `409 Conflict`: Transaction already approved/rejected
- `400 Bad Request`: Invalid request body

---

### POST /api/pos/transactions/:id/reject

Reject a pending stock-out transaction.

**Authentication**: Required (JWT)
**Authorization**: `approve_transactions` permission
**Method**: POST

#### Path Parameters
- `id`: Transaction ID (string)

#### Request Body
```typescript
interface RejectTransactionRequest {
  reason: string              // Required, min 10 characters
  notes?: string              // Optional additional notes
}
```

#### Response
```typescript
interface RejectTransactionResponse {
  success: boolean
  data: {
    transaction: {
      id: string
      status: "rejected"
      rejectedBy: {
        id: string
        name: string
      }
      rejectedAt: string
      rejectionReason: string
      rejectionNotes: string | null
    }
  }
  message: string
}
```

#### Error Responses
- `401 Unauthorized`: Invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Transaction not found
- `409 Conflict`: Transaction already approved/rejected
- `400 Bad Request`: Missing or invalid reason

---

### POST /api/pos/transactions/bulk-approve

Approve multiple pending transactions in bulk.

**Authentication**: Required (JWT)
**Authorization**: `approve_transactions` permission
**Method**: POST

#### Request Body
```typescript
interface BulkApproveRequest {
  transactionIds: string[]    // Max 100 IDs
  notes?: string              // Optional notes applied to all
  applyInventoryDeduction: boolean  // Default: true
}
```

#### Response
```typescript
interface BulkApproveResponse {
  success: boolean
  data: {
    successful: {
      transactionId: string
      status: "approved"
      approvedAt: string
    }[]
    failed: {
      transactionId: string
      reason: string
    }[]
    summary: {
      totalRequested: number
      successful: number
      failed: number
    }
  }
  message: string
}
```

#### Error Responses
- `401 Unauthorized`: Invalid authentication
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid request (too many IDs, invalid format)

---

### GET /api/pos/transactions/:id/inventory-impact

Get detailed inventory impact preview for a pending transaction.

**Authentication**: Required (JWT)
**Authorization**: `view_inventory_impact` permission
**Method**: GET

#### Path Parameters
- `id`: Transaction ID (string)

#### Response
```typescript
interface InventoryImpactResponse {
  success: boolean
  data: {
    affectedItems: {
      ingredient: string
      ingredientId: string
      currentStock: number
      deductionAmount: number
      resultingStock: number
      unit: string
      stockStatus: "sufficient" | "low" | "critical"
      reorderPoint: number
      location: string
    }[]
    warnings: {
      type: "low_stock" | "critical_stock" | "negative_stock"
      severity: "info" | "warning" | "critical"
      message: string
      affectedIngredients: string[]
    }[]
    summary: {
      totalIngredients: number
      totalDeductionValue: Money
      affectedLocations: string[]
    }
  }
}
```

---

## 2. Transaction Detail & Audit API

### GET /api/pos/transactions/:id/details

Retrieve comprehensive transaction details including audit log.

**Authentication**: Required (JWT)
**Authorization**: `view_transactions` permission
**Method**: GET

#### Path Parameters
- `id`: Transaction ID (string)

#### Response
```typescript
interface TransactionDetailResponse {
  success: boolean
  data: {
    transaction: {
      id: string
      transactionId: string
      externalId: string
      date: string
      status: TransactionStatus
      location: {
        id: string
        name: string
      }
      posSystem: {
        name: string
        version: string
      }
      totalAmount: Money
      itemCount: number
      processedAt: string | null
      processedBy: {
        id: string
        name: string
      } | null
    }
    lineItems: {
      id: string
      posItemId: string
      posItemName: string
      category: string
      quantity: number
      unitPrice: Money
      totalPrice: Money
      mappedRecipe: {
        id: string
        name: string
        category: string
      } | null
      inventoryDeduction: {
        ingredients: {
          id: string
          name: string
          quantity: number
          unit: string
          location: string
          cost: Money
        }[]
      } | null
    }[]
    inventoryImpact: {
      totalIngredients: number
      totalDeductedValue: Money
      affectedLocations: string[]
      details: {
        ingredient: string
        beforeStock: number
        deducted: number
        afterStock: number
        unit: string
        location: string
      }[]
    } | null
    error: {
      category: string
      code: string
      message: string
      technicalDetails: any
      affectedItems: string[]
    } | null
    auditLog: {
      id: string
      timestamp: string
      user: {
        id: string
        name: string
      } | null
      action: string
      details: string
      metadata: Record<string, any>
    }[]
  }
}
```

#### Error Responses
- `401 Unauthorized`: Invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Transaction not found

---

### GET /api/pos/transactions/:id/error-details

Retrieve detailed error information for failed transactions.

**Authentication**: Required (JWT)
**Authorization**: `view_transactions` permission
**Method**: GET

#### Path Parameters
- `id`: Transaction ID (string)

#### Response
```typescript
interface ErrorDetailsResponse {
  success: boolean
  data: {
    error: {
      category: "mapping_error" | "stock_insufficient" | "validation_error" | "system_error"
      code: string
      message: string
      severity: "critical" | "high" | "medium"
      occurredAt: string
      technicalDetails: {
        stackTrace?: string
        requestId: string
        endpoint: string
        raw: any
      }
    }
    affectedItems: {
      posItemId: string
      posItemName: string
      quantity: number
      errorReason: string
      suggestedFix: string
    }[]
    troubleshootingSteps: {
      step: number
      action: string
      link?: string
      details?: string
    }[]
    canRetry: boolean
    retryHistory: {
      attemptNumber: number
      attemptedAt: string
      attemptedBy: {
        id: string
        name: string
      }
      result: "success" | "failed"
      notes: string | null
    }[]
    suggestedActions: {
      action: string
      description: string
      link?: string
      requiresUserAction: boolean
    }[]
  }
}
```

---

### POST /api/pos/transactions/:id/retry

Retry a failed transaction.

**Authentication**: Required (JWT)
**Authorization**: `retry_transactions` permission
**Method**: POST

#### Path Parameters
- `id`: Transaction ID (string)

#### Request Body
```typescript
interface RetryTransactionRequest {
  notes?: string
  resolvedMappings?: {
    posItemId: string
    recipeId: string
  }[]
}
```

#### Response
```typescript
interface RetryTransactionResponse {
  success: boolean
  data: {
    newTransactionId: string
    status: "processing" | "success" | "failed"
    retriedAt: string
    retriedBy: {
      id: string
      name: string
    }
  }
  message: string
}
```

#### Error Responses
- `401 Unauthorized`: Invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Transaction not found
- `409 Conflict`: Cannot retry (max attempts reached, already retrying)
- `429 Too Many Requests`: Rate limit exceeded (max 3 retries per 5 minutes)

---

### POST /api/pos/transactions/:id/mark-resolved

Manually mark a failed transaction as resolved.

**Authentication**: Required (JWT)
**Authorization**: `manage_transactions` permission
**Method**: POST

#### Path Parameters
- `id`: Transaction ID (string)

#### Request Body
```typescript
interface MarkResolvedRequest {
  resolution: "manually_processed" | "not_required" | "duplicate" | "other"
  notes: string               // Required, min 20 characters
}
```

#### Response
```typescript
interface MarkResolvedResponse {
  success: boolean
  data: {
    transaction: {
      id: string
      status: "manually_resolved"
      resolvedBy: {
        id: string
        name: string
      }
      resolvedAt: string
      resolution: string
      notes: string
    }
  }
  message: string
}
```

---

## 3. Recipe Mapping API

### GET /api/pos/mapping/recipes/search

Search for recipes to map to POS items.

**Authentication**: Required (JWT)
**Authorization**: `view_recipes` permission
**Method**: GET

#### Query Parameters
```typescript
interface RecipeSearchQuery {
  q: string                   // Search query (min 2 characters)
  category?: string           // Filter by category
  limit?: number              // Default: 20, Max: 50
}
```

#### Response
```typescript
interface RecipeSearchResponse {
  success: boolean
  data: {
    recipes: {
      id: string
      name: string
      category: string
      baseUnit: string
      compatibleUnits: {
        id: string
        name: string
        abbreviation: string
        conversionFactor: number
      }[]
      averageCost: Money
      ingredients: {
        id: string
        name: string
        quantity: number
        unit: string
      }[]
    }[]
  }
}
```

---

### POST /api/pos/mapping/preview

Generate preview of mapping impact before saving.

**Authentication**: Required (JWT)
**Authorization**: `create_mappings` permission
**Method**: POST

#### Request Body
```typescript
interface MappingPreviewRequest {
  recipeId: string
  portionSize: number
  unit: string
}
```

#### Response
```typescript
interface MappingPreviewResponse {
  success: boolean
  data: {
    recipe: {
      id: string
      name: string
    }
    portionSize: number
    unit: string
    ingredients: {
      name: string
      quantityPerPortion: number
      unit: string
      estimatedCost: Money
    }[]
    totalEstimatedCost: Money
  }
}
```

---

### POST /api/pos/mapping/create

Create new POS item to recipe mapping.

**Authentication**: Required (JWT)
**Authorization**: `create_mappings` permission
**Method**: POST

#### Request Body
```typescript
interface CreateMappingRequest {
  posItemId: string
  recipeId: string
  portionSize: number
  unit: string
  costOverride?: number       // Optional cost override
  notes?: string              // Optional mapping notes
}
```

#### Response
```typescript
interface CreateMappingResponse {
  success: boolean
  data: {
    mapping: {
      id: string
      posItemId: string
      posItemName: string
      recipeId: string
      recipeName: string
      portionSize: number
      unit: string
      costOverride: number | null
      notes: string | null
      createdBy: {
        id: string
        name: string
      }
      createdAt: string
    }
  }
  message: string
}
```

#### Error Responses
- `401 Unauthorized`: Invalid authentication
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid request body
- `409 Conflict`: Mapping already exists for this POS item
- `404 Not Found`: POS item or recipe not found

---

### PUT /api/pos/mapping/:id

Update existing mapping.

**Authentication**: Required (JWT)
**Authorization**: `update_mappings` permission
**Method**: PUT

#### Path Parameters
- `id`: Mapping ID (string)

#### Request Body
```typescript
interface UpdateMappingRequest {
  portionSize?: number
  unit?: string
  costOverride?: number | null
  notes?: string
}
```

#### Response
```typescript
interface UpdateMappingResponse {
  success: boolean
  data: {
    mapping: POSMapping
  }
  message: string
}
```

---

### DELETE /api/pos/mapping/:id

Delete a mapping.

**Authentication**: Required (JWT)
**Authorization**: `delete_mappings` permission
**Method**: DELETE

#### Path Parameters
- `id`: Mapping ID (string)

#### Response
```typescript
interface DeleteMappingResponse {
  success: boolean
  message: string
}
```

---

## 4. Common Types

### Money
```typescript
interface Money {
  amount: number
  currency: string            // ISO 4217 currency code (e.g., "USD")
}
```

### TransactionStatus
```typescript
type TransactionStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "processing"
  | "success"
  | "failed"
  | "manually_resolved"
```

---

## 5. Error Response Format

All API errors follow this consistent format:

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string              // Machine-readable error code
    message: string           // Human-readable error message
    details?: any             // Additional error details
    validationErrors?: {
      field: string
      message: string
    }[]
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (duplicate, already processed)
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## 6. Rate Limiting

### General Limits
- **Read operations**: 100 requests per minute per user
- **Write operations**: 20 requests per minute per user
- **Retry operations**: 3 retries per transaction per 5 minutes

### Headers
All responses include rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## 7. Pagination

### Request Parameters
```typescript
interface PaginationParams {
  page?: number               // Default: 1
  pageSize?: number           // Default: 20, Max: 100
}
```

### Response Format
```typescript
interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      totalCount: number
      page: number
      pageSize: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}
```

---

## 8. WebSocket Events (Optional Enhancement)

For real-time updates on pending approvals:

### Connection
```
wss://api.example.com/ws/pos/approvals
```

### Events

#### Server → Client: New Pending Approval
```typescript
{
  event: "pending_approval_created"
  data: {
    transactionId: string
    location: string
    totalValue: Money
    createdAt: string
  }
}
```

#### Server → Client: Approval Status Changed
```typescript
{
  event: "approval_status_changed"
  data: {
    transactionId: string
    oldStatus: TransactionStatus
    newStatus: TransactionStatus
    changedBy: string
    changedAt: string
  }
}
```

#### Client → Server: Subscribe to Location
```typescript
{
  action: "subscribe"
  location: string
}
```

---

## 9. Security Considerations

### Authentication
- All endpoints require valid JWT token in Authorization header
- Token format: `Authorization: Bearer <token>`
- Token expiration: 1 hour
- Refresh token flow available at `/api/auth/refresh`

### Authorization
- Role-based access control (RBAC)
- Minimum required permissions documented per endpoint
- Hierarchical permission system (e.g., `manage_transactions` includes `view_transactions`)

### Input Validation
- All inputs validated on server side
- SQL injection protection via parameterized queries
- XSS protection via input sanitization
- CSRF protection for state-changing operations

### Audit Logging
- All approval/rejection actions logged
- Retry attempts logged with user attribution
- Mapping changes logged
- Log retention: 90 days minimum

---

## 10. Performance Requirements

### Response Times (95th percentile)
- GET endpoints: < 200ms
- POST approval/rejection: < 500ms
- Bulk operations: < 2 seconds
- Retry operations: < 3 seconds
- Search operations: < 300ms

### Availability
- Uptime SLA: 99.9%
- Maintenance windows: Announced 48 hours in advance

### Caching Strategy
- Transaction details: Cache for 5 minutes
- Recipe search: Cache for 30 minutes
- Pending approvals: No caching (real-time data)
- Mapping configurations: Cache for 15 minutes

---

## 11. Testing Requirements

### Unit Tests
- All request/response validation
- Error handling for each endpoint
- Permission checks

### Integration Tests
- Full approval workflow
- Retry mechanism with state transitions
- Mapping creation with inventory impact

### Load Tests
- 100 concurrent users for approval operations
- Bulk approval of 100 transactions
- 1000 concurrent read operations
