# Purchase Request Module - API Specifications

> **Document Status**: Final - Content Refined (Phase 3 Complete)  
> **Last Updated**: March 14, 2024  
> **Next Update**: As needed for maintenance or feature additions

> **Note**: This is a consolidated document that combines content from:
> - purchase-request-api-sp.md
> - api-requirements.md

## Version History
- **March 12, 2024**: Initial consolidated document (Phase 1 & 2)
- **March 14, 2024**: Content refinement completed (Phase 3)
  - Enhanced API endpoint descriptions
  - Added detailed request/response examples
  - Improved error handling documentation
  - Updated security considerations
  - Added performance optimization guidelines

## Table of Contents
1. [Introduction](#introduction)
2. [API Overview](#api-overview)
3. [Authentication and Authorization](#authentication-and-authorization)
4. [Core API Endpoints](#core-api-endpoints)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Versioning](#versioning)
9. [Webhooks](#webhooks)
10. [API Testing](#api-testing)
11. [Security Considerations](#security-considerations)
12. [Related Documentation](#related-documentation)

## Introduction
This document provides detailed specifications for the API endpoints within the Purchase Request module of the Carmen F&B Management System. It serves as a comprehensive reference for developers integrating with or implementing these APIs.

## API Overview

### Purpose
The Purchase Request API provides programmatic access to create, read, update, and delete purchase requests and their associated data. It enables integration with other systems and modules within the Carmen F&B Management System.

### Base URL
```
https://api.carmen.app/v1
```

### API Design Principles
- RESTful architecture
- JSON as the primary data format
- Consistent endpoint naming and structure
- Comprehensive error handling
- Secure authentication and authorization
- Pagination for list endpoints
- Filtering and sorting capabilities
- Comprehensive documentation

## Authentication and Authorization

### Authentication Methods
All API endpoints in the Purchase Request module require authentication unless explicitly stated otherwise. Authentication is handled via JWT tokens.

#### Request Header
```typescript
Authorization: Bearer <jwt_token>
```

#### Token Acquisition
```typescript
POST /api/auth/login
Body: {
  email: string
  password: string
}
Response: {
  token: string
  refreshToken: string
  expiresIn: number
}
```

#### Token Refresh
```typescript
POST /api/auth/refresh
Body: {
  refreshToken: string
}
Response: {
  token: string
  refreshToken: string
  expiresIn: number
}
```

### Authorization Levels
- **Requester**: Can create and view their own PRs
- **Department Head**: Can approve/reject PRs from their department
- **Purchase Coordinator**: Can review all PRs
- **Finance Manager**: Can approve/reject PRs based on budget
- **General Manager**: Can approve/reject high-value PRs

### Permission Checks
The API performs permission checks based on:
- User role
- Department association
- PR ownership
- Workflow stage

## Core API Endpoints

### Purchase Request Management

#### Get Purchase Requests
```typescript
GET /api/purchase-requests
Query Parameters: {
  status?: DocumentStatus
  type?: PRType
  department?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
Response: {
  data: PurchaseRequest[]
  total: number
  page: number
  limit: number
}
```

#### Get Purchase Request by ID
```typescript
GET /api/purchase-requests/:id
Response: PurchaseRequest & {
  items: PurchaseRequestItem[]
  attachments: Attachment[]
  comments: Comment[]
  budget: Budget
  approvalHistory: ApprovalHistoryItem[]
}
```

#### Create Purchase Request
```typescript
POST /api/purchase-requests
Body: {
  type: PRType
  description: string
  deliveryDate: Date
  department: string
  location: string
  jobCode: string
  vendor?: string
  vendorId?: number
  currency: string
  items: {
    location: string
    name: string
    description: string
    unit: string
    quantityRequested: number
    price: number
    deliveryDate: Date
    deliveryPoint: string
    itemCategory: string
    itemSubcategory: string
    vendor?: string
    comment?: string
    taxRate?: number
    discountRate?: number
    accountCode?: string
  }[]
}
Response: PurchaseRequest
```

#### Update Purchase Request
```typescript
PUT /api/purchase-requests/:id
Body: Partial<PurchaseRequest>
Response: PurchaseRequest
```

#### Delete Purchase Request
```typescript
DELETE /api/purchase-requests/:id
Response: {
  success: boolean
  message: string
}
```

#### Submit Purchase Request
```typescript
POST /api/purchase-requests/:id/submit
Response: {
  success: boolean
  message: string
  status: DocumentStatus
}
```

#### Cancel Purchase Request
```typescript
POST /api/purchase-requests/:id/cancel
Body: {
  reason: string
}
Response: {
  success: boolean
  message: string
  status: DocumentStatus
}
```

### PR Item Management

#### Get PR Items
```typescript
GET /api/purchase-requests/:prId/items
Response: {
  data: PurchaseRequestItem[]
  total: number
}
```

#### Get PR Item by ID
```typescript
GET /api/purchase-requests/:prId/items/:itemId
Response: PurchaseRequestItem
```

#### Add PR Item
```typescript
POST /api/purchase-requests/:prId/items
Body: {
  location: string
  name: string
  description: string
  unit: string
  quantityRequested: number
  price: number
  deliveryDate: Date
  deliveryPoint: string
  itemCategory: string
  itemSubcategory: string
  vendor?: string
  comment?: string
  taxRate?: number
  discountRate?: number
  accountCode?: string
}
Response: PurchaseRequestItem
```

#### Update PR Item
```typescript
PUT /api/purchase-requests/:prId/items/:itemId
Body: Partial<PurchaseRequestItem>
Response: PurchaseRequestItem
```

#### Delete PR Item
```typescript
DELETE /api/purchase-requests/:prId/items/:itemId
Response: {
  success: boolean
  message: string
}
```

### PR Approval Management

#### Get Approval History
```typescript
GET /api/purchase-requests/:prId/approvals
Response: {
  data: ApprovalHistoryItem[]
  currentStage: WorkflowStage
  nextApprovers: User[]
}
```

#### Approve PR
```typescript
POST /api/purchase-requests/:prId/approve
Body: {
  comments?: string
  attachments?: string[]
}
Response: {
  success: boolean
  message: string
  status: DocumentStatus
  nextStage?: WorkflowStage
}
```

#### Reject PR
```typescript
POST /api/purchase-requests/:prId/reject
Body: {
  reason: string
  attachments?: string[]
}
Response: {
  success: boolean
  message: string
  status: DocumentStatus
}
```

#### Return PR for Revision
```typescript
POST /api/purchase-requests/:prId/return
Body: {
  reason: string
  attachments?: string[]
}
Response: {
  success: boolean
  message: string
  status: DocumentStatus
}
```

### PR Attachments

#### Get PR Attachments
```typescript
GET /api/purchase-requests/:prId/attachments
Response: {
  data: Attachment[]
  total: number
}
```

#### Upload Attachment
```typescript
POST /api/purchase-requests/:prId/attachments
Body: FormData (multipart/form-data)
Response: Attachment
```

#### Delete Attachment
```typescript
DELETE /api/purchase-requests/:prId/attachments/:attachmentId
Response: {
  success: boolean
  message: string
}
```

### PR Comments

#### Get PR Comments
```typescript
GET /api/purchase-requests/:prId/comments
Response: {
  data: Comment[]
  total: number
}
```

#### Add Comment
```typescript
POST /api/purchase-requests/:prId/comments
Body: {
  text: string
  attachments?: string[]
}
Response: Comment
```

#### Update Comment
```typescript
PUT /api/purchase-requests/:prId/comments/:commentId
Body: {
  text: string
}
Response: Comment
```

#### Delete Comment
```typescript
DELETE /api/purchase-requests/:prId/comments/:commentId
Response: {
  success: boolean
  message: string
}
```

### PR Templates

#### Get PR Templates
```typescript
GET /api/pr-templates
Query Parameters: {
  department?: string
  category?: string
  page?: number
  limit?: number
}
Response: {
  data: PRTemplate[]
  total: number
  page: number
  limit: number
}
```

#### Get PR Template by ID
```typescript
GET /api/pr-templates/:id
Response: PRTemplate & {
  items: PRTemplateItem[]
}
```

#### Create PR Template
```typescript
POST /api/pr-templates
Body: {
  name: string
  description: string
  department: string
  category?: string
  items: {
    name: string
    description: string
    unit: string
    quantity: number
    price?: number
    itemCategory: string
    itemSubcategory?: string
    accountCode?: string
  }[]
}
Response: PRTemplate
```

#### Update PR Template
```typescript
PUT /api/pr-templates/:id
Body: Partial<PRTemplate>
Response: PRTemplate
```

#### Delete PR Template
```typescript
DELETE /api/pr-templates/:id
Response: {
  success: boolean
  message: string
}
```

#### Create PR from Template
```typescript
POST /api/purchase-requests/from-template/:templateId
Body: {
  deliveryDate: Date
  location: string
  jobCode?: string
  vendor?: string
  currency: string
  overrides?: {
    itemId: string
    quantity?: number
    price?: number
    deliveryDate?: Date
  }[]
}
Response: PurchaseRequest
```

## Request/Response Formats

### Data Types

#### PurchaseRequest
```typescript
interface PurchaseRequest {
  id: string
  referenceNumber: string
  type: PRType
  status: DocumentStatus
  description: string
  deliveryDate: Date
  department: string
  location: string
  jobCode?: string
  vendor?: string
  vendorId?: number
  currency: string
  totalAmount: number
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt?: Date
  workflowStatus: WorkflowStatus
  currentStage?: WorkflowStage
}
```

#### PurchaseRequestItem
```typescript
interface PurchaseRequestItem {
  id: string
  prId: string
  location: string
  name: string
  description: string
  unit: string
  quantityRequested: number
  quantityApproved?: number
  price: number
  totalAmount: number
  deliveryDate: Date
  deliveryPoint: string
  itemCategory: string
  itemSubcategory?: string
  vendor?: string
  comment?: string
  taxRate?: number
  taxAmount?: number
  discountRate?: number
  discountAmount?: number
  accountCode?: string
  status: PurchaseRequestItemStatus
  createdAt: Date
  updatedAt?: Date
}
```

#### Attachment
```typescript
interface Attachment {
  id: string
  prId: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  uploadedBy: string
  uploadedAt: Date
  description?: string
}
```

#### Comment
```typescript
interface Comment {
  id: string
  prId: string
  text: string
  createdBy: string
  createdAt: Date
  updatedAt?: Date
  attachments?: Attachment[]
}
```

#### ApprovalHistoryItem
```typescript
interface ApprovalHistoryItem {
  id: string
  prId: string
  stage: WorkflowStage
  action: 'approve' | 'reject' | 'return'
  actionBy: string
  actionAt: Date
  comments?: string
  attachments?: Attachment[]
}
```

#### PRTemplate
```typescript
interface PRTemplate {
  id: string
  name: string
  description: string
  department: string
  category?: string
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt?: Date
  isPublic: boolean
}
```

#### PRTemplateItem
```typescript
interface PRTemplateItem {
  id: string
  templateId: string
  name: string
  description: string
  unit: string
  quantity: number
  price?: number
  itemCategory: string
  itemSubcategory?: string
  accountCode?: string
}
```

### Enums

#### PRType
```typescript
enum PRType {
  STANDARD = 'standard',
  EMERGENCY = 'emergency',
  BLANKET = 'blanket'
}
```

#### DocumentStatus
```typescript
enum DocumentStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  CLOSED = 'closed'
}
```

#### WorkflowStatus
```typescript
enum WorkflowStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}
```

#### WorkflowStage
```typescript
enum WorkflowStage {
  DEPARTMENT_APPROVAL = 'department_approval',
  FINANCE_APPROVAL = 'finance_approval',
  EXECUTIVE_APPROVAL = 'executive_approval',
  PROCUREMENT_REVIEW = 'procurement_review'
}
```

#### PurchaseRequestItemStatus
```typescript
enum PurchaseRequestItemStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PARTIALLY_APPROVED = 'partially_approved'
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  status: number
  code: string
  message: string
  details?: any
  timestamp: string
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict |
| 422 | VALIDATION_ERROR | Validation failed |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | SERVER_ERROR | Internal server error |

### Validation Errors
```typescript
interface ValidationErrorResponse {
  status: 422
  code: 'VALIDATION_ERROR'
  message: 'Validation failed'
  details: {
    field: string
    message: string
  }[]
  timestamp: string
}
```

### Error Handling Best Practices
1. Always check HTTP status codes
2. Handle validation errors by field
3. Implement retry logic with exponential backoff for 5xx errors
4. Log detailed error information for debugging
5. Display user-friendly error messages in the UI

## Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1620000000
```

### Rate Limit Tiers
| Tier | Requests per Minute | Burst |
|------|---------------------|-------|
| Standard | 60 | 100 |
| Premium | 300 | 500 |
| Enterprise | 1000 | 2000 |

### Rate Limit Exceeded Response
```json
{
  "status": 429,
  "code": "TOO_MANY_REQUESTS",
  "message": "Rate limit exceeded",
  "details": {
    "retryAfter": 30
  },
  "timestamp": "2023-03-15T12:00:00Z"
}
```

## Versioning

### API Version Header
```
Accept: application/json; version=1
```

### URL-Based Versioning
```
https://api.carmen.app/v1/purchase-requests
```

### Version Lifecycle
| Version | Status | Sunset Date |
|---------|--------|-------------|
| v1 | Current | N/A |
| v2 | Beta | N/A |

### Breaking vs. Non-Breaking Changes
- **Breaking Changes**: Require version increment
  - Removing fields
  - Changing field types
  - Changing endpoint behavior
- **Non-Breaking Changes**: No version increment
  - Adding new fields
  - Adding new endpoints
  - Adding new query parameters

## Webhooks

### Available Events
- `pr.created`: When a new PR is created
- `pr.updated`: When a PR is updated
- `pr.submitted`: When a PR is submitted
- `pr.approved`: When a PR is approved
- `pr.rejected`: When a PR is rejected
- `pr.cancelled`: When a PR is cancelled
- `pr.item.added`: When an item is added to a PR
- `pr.item.updated`: When an item in a PR is updated
- `pr.item.deleted`: When an item is removed from a PR
- `pr.comment.added`: When a comment is added to a PR
- `pr.attachment.added`: When an attachment is added to a PR

### Webhook Registration
```typescript
POST /api/webhooks
Body: {
  url: string
  events: string[]
  secret: string
  description?: string
}
Response: {
  id: string
  url: string
  events: string[]
  createdAt: Date
}
```

### Webhook Payload
```typescript
interface WebhookPayload {
  event: string
  timestamp: string
  data: any
  signature: string
}
```

### Webhook Security
- HMAC signature validation
- TLS encryption
- IP whitelisting
- Retry mechanism with exponential backoff

## API Testing

### Testing Endpoints
```typescript
GET /api/test/ping
Response: {
  status: 'ok'
  timestamp: string
}
```

### Sandbox Environment
- Base URL: `https://api-sandbox.carmen.app/v1`
- Test accounts with predefined data
- Reset functionality for test data
- Simulated workflow scenarios

### Testing Tools
- Postman Collection: [Download](https://api.carmen.app/docs/postman)
- OpenAPI Specification: [Download](https://api.carmen.app/docs/openapi)
- Test Scripts: [GitHub Repository](https://github.com/carmen/api-tests)

## Security Considerations

### Data Protection
- All API requests must use HTTPS
- Sensitive data is encrypted at rest
- PII is handled according to GDPR requirements
- Data retention policies are enforced

### API Key Security
- API keys should never be exposed in client-side code
- Rotate API keys regularly
- Use environment-specific API keys
- Implement key revocation procedures

### Input Validation
- All input is validated before processing
- Parameterized queries prevent SQL injection
- Content-Type validation prevents XSS attacks
- File uploads are scanned for malware

### Audit Logging
- All API access is logged
- Authentication attempts are recorded
- Sensitive operations require additional logging
- Logs are retained according to compliance requirements

## Related Documentation
- [PR Overview](./PR-Overview.md)
- [PR Technical Specification](./PR-Technical-Specification.md)
- [PR User Experience](./PR-User-Experience.md)
- [PR Component Specifications](./PR-Component-Specifications.md)
- [Procurement Process Flow](../Procurement-Process-Flow.md)

---

**Document Status**: Updated - Content Migrated (Phase 2)  
**Last Updated**: March 14, 2024  
**Next Update**: Phase 3 - Content Refinement 