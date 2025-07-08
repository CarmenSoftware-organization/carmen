# PR Detail Item API Specification

## Overview

This document provides detailed API specifications for the PR Detail Item CRUD system, including role-based endpoints, request/response formats, and error handling.

## Base Configuration

```
Base URL: /api/v1
Authentication: Bearer Token (JWT)
Content-Type: application/json
```

## Authentication & Authorization

All endpoints require authentication and role-based authorization:

```typescript
interface AuthContext {
  userId: string;
  businessUnitId: string;
  roles: UserRole[];
  permissions: Permission[];
}

enum UserRole {
  STAFF = 'staff',
  HD = 'hd',
  PURCHASE_STAFF = 'purchase_staff',
  MANAGER = 'manager'
}
```

## Core CRUD Endpoints

### 1. Get PR Items (Role-Based)

```http
GET /api/v1/pr/{prId}/items
```

**Headers:**
```
Authorization: Bearer {token}
X-Business-Unit: {businessUnitId}
```

**Query Parameters:**
```typescript
interface GetItemsQuery {
  status?: ItemStatus[];          // Filter by status
  assignedToMe?: boolean;         // Items assigned to current user
  includeAudit?: boolean;         // Include audit history
  page?: number;                  // Pagination
  limit?: number;                 // Items per page
}
```

**Response (Role-Based Filtering):**
```typescript
interface GetItemsResponse {
  items: PRDetailItemView[];      // Filtered by role permissions
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userPermissions: {
    canEdit: string[];            // Item IDs user can edit
    canApprove: string[];         // Item IDs user can approve
    canSplit: boolean;            // Can perform split operations
  };
}

// Role-specific item views
interface PRDetailItemView {
  id: string;
  prId: string;
  
  // Always visible fields
  location: string;
  productName: string;
  requestQuantity: number;
  requestUnit: string;
  requiredDate: string;
  comment: string;
  itemStatus: ItemStatus;
  
  // Role-dependent fields (null if not visible)
  approvedQuantity?: number;
  approvedUnit?: string;
  estimatedUnitPrice?: number;    // Hidden from staff
  estimatedTotalPrice?: number;   // Hidden from staff
  estimatedVendorName?: string;   // Hidden from staff
  purchaserEstimatedPrice?: number;
  actualUnitPrice?: number;
  
  // Metadata
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  
  // Audit trail (if requested and permitted)
  auditHistory?: AuditEntry[];
}
```

**Error Responses:**
```typescript
// 403 Forbidden
{
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "User does not have access to this PR",
  "code": "PR_ACCESS_DENIED"
}

// 404 Not Found
{
  "error": "PR_NOT_FOUND",
  "message": "Purchase request not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

### 2. Get Single Item (Role-Based)

```http
GET /api/v1/pr/{prId}/items/{itemId}
```

**Response:**
```typescript
interface GetItemResponse {
  item: PRDetailItemView;
  editPermissions: {
    [fieldName: string]: 'edit' | 'view' | 'hidden';
  };
  availableActions: ItemAction[];
}

interface ItemAction {
  action: string;                 // 'approve', 'reject', 'review', 'edit'
  label: string;                  // Display label
  requiresComment: boolean;       // Whether action requires comments
  confirmationMessage?: string;   // Confirmation dialog text
}
```

### 3. Create New Item

```http
POST /api/v1/pr/{prId}/items
```

**Request Body:**
```typescript
interface CreateItemRequest {
  location: string;
  productName: string;
  requestQuantity: number;
  requestUnit: string;
  requiredDate: string;           // ISO date string
  comment?: string;
}
```

**Response:**
```typescript
interface CreateItemResponse {
  item: PRDetailItemView;
  message: "Item created successfully";
}
```

**Validation Errors:**
```typescript
// 400 Bad Request
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "code": "INVALID_INPUT",
  "details": [
    {
      "field": "requestQuantity",
      "message": "Quantity must be greater than 0",
      "code": "INVALID_QUANTITY"
    },
    {
      "field": "requiredDate",
      "message": "Required date must be in the future",
      "code": "INVALID_DATE"
    }
  ]
}
```

### 4. Update Item (Role & Status Dependent)

```http
PUT /api/v1/pr/{prId}/items/{itemId}
```

**Request Body:**
```typescript
interface UpdateItemRequest {
  // Only include fields user is allowed to edit
  location?: string;
  productName?: string;
  requestQuantity?: number;
  requestUnit?: string;
  requiredDate?: string;
  comment?: string;
  approvedQuantity?: number;
  approvedUnit?: string;
  purchaserEstimatedPrice?: number;
  purchaserVendorId?: string;
  purchaserNotes?: string;
  actualUnitPrice?: number;
  actualTotalPrice?: number;
  actualVendorId?: string;
  
  // Metadata
  version: number;                // For optimistic locking
  updateReason?: string;          // Audit trail comment
}
```

**Response:**
```typescript
interface UpdateItemResponse {
  item: PRDetailItemView;
  message: "Item updated successfully";
  notifications?: {
    sent: string[];               // Who was notified
    failed: string[];             // Failed notifications
  };
}
```

**Error Responses:**
```typescript
// 409 Conflict (Version mismatch)
{
  "error": "VERSION_CONFLICT",
  "message": "Item has been modified by another user",
  "code": "OPTIMISTIC_LOCK_FAILURE",
  "currentVersion": 5,
  "providedVersion": 4
}

// 403 Forbidden (Field not editable)
{
  "error": "FIELD_NOT_EDITABLE",
  "message": "Field 'estimatedUnitPrice' is not editable in current status",
  "code": "PERMISSION_DENIED",
  "editableFields": ["comment", "requiredDate"]
}
```

### 5. Delete Item

```http
DELETE /api/v1/pr/{prId}/items/{itemId}
```

**Query Parameters:**
```typescript
interface DeleteItemQuery {
  reason: string;                 // Required deletion reason
  force?: boolean;                // Force delete even if dependencies exist
}
```

**Response:**
```typescript
interface DeleteItemResponse {
  message: "Item deleted successfully";
  auditEntry: AuditEntry;
}
```

## Status Transition Endpoints

### 6. Transition Item Status

```http
POST /api/v1/pr/{prId}/items/{itemId}/transition
```

**Request Body:**
```typescript
interface TransitionRequest {
  toStatus: ItemStatus;
  comments?: string;              // Required for review/reject
  fieldUpdates?: {                // Updates to apply during transition
    approvedQuantity?: number;
    approvedUnit?: string;
    rejectionReason?: string;
  };
  notifyUsers?: string[];         // Additional users to notify
}
```

**Response:**
```typescript
interface TransitionResponse {
  item: PRDetailItemView;
  message: "Status updated successfully";
  nextActions: ItemAction[];      // Available next actions
  notifications: {
    sent: NotificationSent[];
    failed: NotificationFailed[];
  };
}

interface NotificationSent {
  userId: string;
  method: 'email' | 'in_app' | 'mobile_push';
  sentAt: string;
}
```

**Error Responses:**
```typescript
// 400 Bad Request (Invalid transition)
{
  "error": "INVALID_TRANSITION",
  "message": "Cannot transition from 'draft' to 'manager_approved'",
  "code": "INVALID_STATUS_TRANSITION",
  "validTransitions": ["pending_hd"]
}

// 400 Bad Request (Missing required fields)
{
  "error": "MISSING_REQUIRED_FIELDS",
  "message": "Comments required when rejecting item",
  "code": "VALIDATION_ERROR",
  "requiredFields": ["comments"]
}
```

## Bulk Operations

### 7. Bulk Status Update

```http
POST /api/v1/pr/{prId}/items/bulk-transition
```

**Request Body:**
```typescript
interface BulkTransitionRequest {
  itemIds: string[];              // Specific items, or empty for "all eligible"
  toStatus: ItemStatus;
  applyTo: 'selected' | 'all_eligible' | 'pending_only';
  comments?: string;
  fieldUpdates?: {
    approvedQuantity?: number;    // Apply to all items
    approvedUnit?: string;
  };
  confirmOverride?: boolean;      // Confirm if some items can't transition
}
```

**Response:**
```typescript
interface BulkTransitionResponse {
  successful: {
    itemId: string;
    newStatus: ItemStatus;
  }[];
  failed: {
    itemId: string;
    reason: string;
    currentStatus: ItemStatus;
  }[];
  summary: {
    totalRequested: number;
    successful: number;
    failed: number;
  };
  notifications: NotificationSummary;
}
```

### 8. Split PR (Approved Items)

```http
POST /api/v1/pr/{prId}/split
```

**Request Body:**
```typescript
interface SplitPRRequest {
  splitReason?: string;
  newPRTitle?: string;            // Optional title for new PR
  autoSelectApproved: true;       // Always true - auto-select approved items
}
```

**Response:**
```typescript
interface SplitPRResponse {
  originalPR: {
    id: string;
    status: 'partially_split';
    remainingItemCount: number;
    splitReference: string;
  };
  newPR: {
    id: string;
    title: string;
    itemCount: number;
    totalEstimatedValue: number;
    nextApprovalStage: string;
  };
  splitSummary: {
    approvedItemsMoved: number;
    remainingItemsInOriginal: number;
    splitBy: string;
    splitAt: string;
  };
}
```

## Vendor Allocation

### 9. Trigger Vendor Allocation

```http
POST /api/v1/pr/{prId}/allocate-vendors
```

**Request Body:**
```typescript
interface AllocateVendorsRequest {
  itemIds?: string[];             // Specific items, or all if empty
  forceReallocation?: boolean;    // Re-allocate even if already allocated
  useStandardPricesOnFailure: true; // Always true
}
```

**Response:**
```typescript
interface AllocationResponse {
  jobId: string;                  // For tracking background job
  status: 'processing' | 'completed' | 'partial_failure';
  results: {
    allocated: AllocationSuccess[];
    fallback: AllocationFallback[];
    failed: AllocationFailure[];
  };
  summary: {
    totalItems: number;
    allocated: number;
    fallback: number;
    failed: number;
    totalEstimatedValue: number;
  };
}

interface AllocationSuccess {
  itemId: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  totalPrice: number;
  priceSource: 'vendor_price_list' | 'historical_average';
  confidence: number;             // 0-100%
}

interface AllocationFallback {
  itemId: string;
  standardPrice: number;
  fallbackReason: string;
  requiresManualVendorAssignment: true;
}
```

### 10. Get Allocation Status

```http
GET /api/v1/pr/{prId}/allocation-status/{jobId}
```

**Response:**
```typescript
interface AllocationStatusResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    percentage: number;
  };
  results?: AllocationResponse;   // Available when completed
  estimatedCompletion?: string;   // ISO timestamp
}
```

## Vendor Management

### 11. Get Available Vendors for Item

```http
GET /api/v1/pr/{prId}/items/{itemId}/vendors
```

**Response:**
```typescript
interface AvailableVendorsResponse {
  vendors: VendorOption[];
  currentSelection?: {
    vendorId: string;
    vendorName: string;
    price: number;
    selectionReason: string;
  };
}

interface VendorOption {
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  priceValidUntil: string;
  isPreferred: boolean;
  confidence: number;
  riskFactors: string[];
}
```

### 12. Assign Vendor to Item

```http
PUT /api/v1/pr/{prId}/items/{itemId}/vendor
```

**Request Body:**
```typescript
interface AssignVendorRequest {
  vendorId: string;
  unitPrice: number;
  assignmentReason?: string;
  notifyApprovers?: boolean;      // Default: true
}
```

**Response:**
```typescript
interface AssignVendorResponse {
  item: PRDetailItemView;
  vendor: VendorOption;
  priceChange: {
    oldPrice: number;
    newPrice: number;
    variance: number;             // Percentage change
  };
  notifications: NotificationSummary;
}
```

## Audit & History

### 13. Get Item Audit History

```http
GET /api/v1/pr/{prId}/items/{itemId}/audit
```

**Query Parameters:**
```typescript
interface AuditQuery {
  fromDate?: string;              // ISO date
  toDate?: string;                // ISO date
  actions?: string[];             // Filter by action types
  users?: string[];               // Filter by user IDs
  limit?: number;                 // Default: 50
}
```

**Response:**
```typescript
interface AuditHistoryResponse {
  entries: AuditEntry[];
  summary: {
    totalChanges: number;
    uniqueUsers: number;
    statusTransitions: number;
    priceChanges: number;
  };
}

interface AuditEntry {
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  comments?: string;
  ipAddress?: string;
  userAgent?: string;
}
```

## Reporting Endpoints

### 14. Get PR Summary

```http
GET /api/v1/pr/{prId}/summary
```

**Response:**
```typescript
interface PRSummaryResponse {
  prId: string;
  title: string;
  totalItems: number;
  statusBreakdown: {
    [status: string]: number;
  };
  financialSummary: {
    totalEstimatedValue: number;
    totalActualValue: number;
    variance: number;
    currencyCode: string;
  };
  timeline: {
    created: string;
    submitted: string;
    firstApproval?: string;
    finalApproval?: string;
    completed?: string;
  };
  approvalChain: ApprovalStep[];
  riskIndicators: RiskIndicator[];
}

interface ApprovalStep {
  role: string;
  userId?: string;
  userName?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  comments?: string;
}
```

## Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  error: string;                  // Error type
  message: string;                // Human-readable message
  code: string;                   // Machine-readable code
  timestamp: string;              // ISO timestamp
  requestId: string;              // For tracking
  details?: any;                  // Additional error details
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 400 | INVALID_TRANSITION | Invalid status transition |
| 400 | MISSING_REQUIRED_FIELDS | Required fields missing |
| 401 | UNAUTHORIZED | Invalid or missing authentication |
| 403 | INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| 403 | FIELD_NOT_EDITABLE | Field not editable in current state |
| 404 | RESOURCE_NOT_FOUND | PR or item not found |
| 409 | VERSION_CONFLICT | Optimistic locking conflict |
| 409 | BUSINESS_RULE_VIOLATION | Business rule validation failed |
| 422 | UNPROCESSABLE_ENTITY | Valid format but business logic error |
| 500 | INTERNAL_SERVER_ERROR | Unexpected server error |
| 503 | SERVICE_UNAVAILABLE | External service unavailable |

## Rate Limiting

```
X-RateLimit-Limit: 1000        # Requests per hour
X-RateLimit-Remaining: 999     # Remaining requests
X-RateLimit-Reset: 1640995200  # Reset timestamp
```

## Pagination

Standard pagination for list endpoints:

```typescript
interface PaginationParams {
  page?: number;                  // Default: 1
  limit?: number;                 // Default: 25, Max: 100
  sort?: string;                  // Field to sort by
  order?: 'asc' | 'desc';        // Sort order
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## Webhooks (Optional)

For real-time notifications to external systems:

```http
POST /api/v1/webhooks/pr-item-events
```

**Webhook Payload:**
```typescript
interface WebhookPayload {
  eventType: 'item.created' | 'item.updated' | 'item.status_changed' | 'item.deleted';
  timestamp: string;
  businessUnitId: string;
  prId: string;
  itemId: string;
  data: {
    item: PRDetailItemView;
    changes?: FieldChange[];
    triggeredBy: string;
  };
}
```

---

This API specification provides comprehensive coverage of all PR Detail Item operations with proper role-based access control, error handling, and scalability considerations for the multi-tenant architecture.