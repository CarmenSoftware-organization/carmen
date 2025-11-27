# Vendor Management API Specification

## Document Control
- **Version**: 1.0
- **Date**: January 2025
- **Status**: Active
- **Author**: Technical Team
- **Review**: Quarterly

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose
This document defines the API specifications for the complete Vendor Management and Price Collection System, including all endpoints, data models, and integration patterns used for vendor lifecycle management and systematic price collection within the Carmen ERP system.

### 1.2 System Scope
The API covers the complete 6-phase vendor price management workflow:
1. **Vendor Setup & Management** - Vendor CRUD and profile management
2. **Price Collection Templates** - Template creation and product selection
3. **Campaign Management** - Request for Pricing campaign workflows
4. **Vendor Invitations** - Secure invitation and communication system
5. **Vendor Portal** - Price submission and data entry portal
6. **Data Validation** - Quality control and approval workflows

### 1.3 API Architecture
- **Base URL**: `/api/price-management`
- **Authentication**: Bearer token authentication
- **Data Format**: JSON
- **Response Format**: Standardized API response wrapper
- **Rate Limiting**: 1000 requests per hour per user

### 1.3 Standard Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  metadata?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}
```

---

## 2. Core Data Models

### 2.1 Vendor Entity
```typescript
interface Vendor {
  id: string                    // Unique vendor identifier
  name: string                  // Company name
  contactEmail: string          // Primary email contact
  contactPhone?: string         // Primary phone contact
  address: Address              // Primary address
  status: 'active' | 'inactive' | 'suspended'
  preferredCurrency: string     // ISO currency code
  paymentTerms?: string         // Payment terms description
  performanceMetrics: VendorMetrics
  createdAt: Date
  updatedAt: Date
  createdBy: string
  
  // Extended fields
  companyRegistration?: string  // Business registration number
  taxId?: string               // Tax identification number
  taxProfile?: string          // Tax profile classification
  taxRate?: number            // Tax rate percentage (0-100)
  website?: string            // Company website URL
  businessType?: string       // Business category
  certifications?: string[]   // Industry certifications
  languages?: string[]        // Supported languages
  notes?: string              // Internal notes
}
```

### 2.2 Address Entity
```typescript
interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}
```

### 2.3 Vendor Performance Metrics
```typescript
interface VendorMetrics {
  responseRate: number              // Percentage (0-100)
  averageResponseTime: number       // Hours
  qualityScore: number             // Score (0-100)
  onTimeDeliveryRate: number       // Percentage (0-100)
  totalCampaigns: number           // Campaign count
  completedSubmissions: number     // Completed submissions count
  averageCompletionTime: number    // Hours
  lastSubmissionDate?: Date        // Last activity date
}
```

### 2.4 Pricelist Template Entity
```typescript
interface PricelistTemplate {
  id: string
  name: string
  description?: string
  productSelection: ProductSelection
  customFields: CustomField[]
  instructions: string
  validityPeriod: number // days
  status: 'draft' | 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  
  // Template settings
  allowMultiMOQ: boolean
  requireLeadTime: boolean
  defaultCurrency: string
  supportedCurrencies: string[]
  maxItemsPerSubmission?: number
  notificationSettings: {
    sendReminders: boolean
    reminderDays: number[]
    escalationDays: number
  }
}
```

### 2.5 Product Selection Entity
```typescript
interface ProductSelection {
  categories: string[]
  subcategories: string[]
  itemGroups: string[]
  specificItems: string[]
  productInstances?: ProductInstance[]
}

interface ProductInstance {
  id: string              // Unique instance ID
  productId: string       // Original product ID
  orderUnit: string       // Selected order unit
  displayName?: string    // Optional custom name
}
```

### 2.6 Request for Pricing (Campaign) Entity
```typescript
interface RequestForPricing {
  id: string
  name: string
  description?: string
  templateId: string
  vendorIds: string[]
  schedule: RequestForPricingSchedule
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  invitations: VendorInvitation[]
  analytics: RequestForPricingAnalytics
  createdAt: Date
  updatedAt: Date
  createdBy: string
  
  // Campaign settings
  deadlineBuffer: number // hours
  maxSubmissionAttempts: number
  requireManagerApproval: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
}

interface RequestForPricingSchedule {
  type: 'one-time' | 'recurring' | 'event-based'
  startDate: Date
  endDate?: Date
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    interval: number
    daysOfWeek?: number[]
    dayOfMonth?: number
  }
  eventTrigger?: {
    event: string
    conditions: Record<string, any>
  }
}
```

### 2.7 Vendor Pricelist Entity
```typescript
interface VendorPricelist {
  id: string
  pricelistNumber: string // Display-friendly number
  vendorId: string
  campaignId: string
  templateId: string
  invitationId: string
  currency: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired'
  items: PricelistItem[]
  validFrom: Date
  validTo: Date
  submittedAt?: Date
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  approvedBy?: string
  createdAt: Date
  updatedAt: Date
  
  // Metadata
  completionPercentage: number
  qualityScore: number
  totalItems: number
  completedItems: number
  lastAutoSave: Date
  submissionNotes?: string
  internalNotes?: string
  version: number
  parentPricelistId?: string // For revisions
}
```

### 2.8 Vendor Portal Session Entity
```typescript
interface PortalSession {
  token: string
  vendorId: string
  pricelistId: string
  campaignId: string
  invitationId: string
  expiresAt: Date
  ipAddress: string
  userAgent: string
  accessLog: SessionActivity[]
  createdAt: Date
  lastAccessAt: Date
  
  // Session management
  isActive: boolean
  maxConcurrentSessions: number
  sessionTimeout: number // minutes
  extendedCount: number
  maxExtensions: number
  securityFlags: {
    suspiciousActivity: boolean
    multipleIPs: boolean
    unusualUserAgent: boolean
  }
}
```

### 2.9 Pagination Response
```typescript
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
```

---

## 3. Vendor Management API

### 3.1 List Vendors
**Endpoint**: `GET /vendors`
**Description**: Retrieve paginated list of vendors with optional filtering

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `status` (string[], optional): Filter by status ('active', 'inactive', 'suspended')
- `currency` (string[], optional): Filter by preferred currency
- `performanceMin` (number, optional): Minimum performance score (0-100)
- `performanceMax` (number, optional): Maximum performance score (0-100)
- `responseRateMin` (number, optional): Minimum response rate (0-100)
- `lastSubmissionAfter` (Date, optional): Last submission after date
- `lastSubmissionBefore` (Date, optional): Last submission before date
- `search` (string, optional): Text search across vendor fields

**Response**: `ApiResponse<PaginatedResponse<Vendor>>`

**Example Request**:
```http
GET /api/price-management/vendors?page=1&limit=20&status=active&search=tech
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "vendor-123",
        "name": "Tech Solutions Inc.",
        "contactEmail": "contact@techsolutions.com",
        "contactPhone": "+1-555-0123",
        "address": {
          "street": "123 Tech Street",
          "city": "San Francisco",
          "state": "CA",
          "postalCode": "94105",
          "country": "USA"
        },
        "status": "active",
        "preferredCurrency": "USD",
        "performanceMetrics": {
          "responseRate": 95,
          "averageResponseTime": 24,
          "qualityScore": 87,
          "onTimeDeliveryRate": 92,
          "totalCampaigns": 45,
          "completedSubmissions": 43,
          "averageCompletionTime": 48,
          "lastSubmissionDate": "2024-12-15T10:30:00Z"
        },
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-12-20T14:30:00Z",
        "createdBy": "user-456"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "hasMore": false
  },
  "metadata": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

### 3.2 Get Vendor by ID
**Endpoint**: `GET /vendors/{id}`
**Description**: Retrieve detailed vendor information by ID

**Path Parameters**:
- `id` (string, required): Vendor unique identifier

**Response**: `ApiResponse<Vendor>`

**Example Request**:
```http
GET /api/price-management/vendors/vendor-123
```

**Error Responses**:
- `404 Not Found`: Vendor not found
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_NOT_FOUND",
    "message": "Vendor with ID vendor-123 not found"
  }
}
```

### 3.3 Create Vendor
**Endpoint**: `POST /vendors`
**Description**: Create a new vendor profile

**Request Body**: `Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'performanceMetrics'>`

**Response**: `ApiResponse<Vendor>`

**Example Request**:
```http
POST /api/price-management/vendors
Content-Type: application/json

{
  "name": "New Vendor Corp",
  "contactEmail": "contact@newvendor.com",
  "contactPhone": "+1-555-0199",
  "address": {
    "street": "456 Business Ave",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "status": "active",
  "preferredCurrency": "USD",
  "businessType": "Technology",
  "createdBy": "user-456"
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters
- `contactEmail`: Required, valid email format
- `contactPhone`: Optional, min 10 digits, valid phone format
- `address`: All address fields required, min 2 characters each
- `preferredCurrency`: Required, valid ISO currency code

### 3.4 Update Vendor
**Endpoint**: `PUT /vendors/{id}`
**Description**: Update existing vendor information

**Path Parameters**:
- `id` (string, required): Vendor unique identifier

**Request Body**: `Partial<Vendor>`

**Response**: `ApiResponse<Vendor>`

**Example Request**:
```http
PUT /api/price-management/vendors/vendor-123
Content-Type: application/json

{
  "contactPhone": "+1-555-0199",
  "paymentTerms": "Net 30 days",
  "notes": "Updated contact information"
}
```

### 3.5 Delete Vendor
**Endpoint**: `DELETE /vendors/{id}`
**Description**: Delete vendor (soft delete with dependency checking)

**Path Parameters**:
- `id` (string, required): Vendor unique identifier

**Response**: `ApiResponse<void>`

**Business Rules**:
- Vendors with active purchase orders cannot be deleted
- Vendors with pending pricelists cannot be deleted
- Deletion creates audit log entry

**Error Responses**:
- `409 Conflict`: Vendor has dependencies
```json
{
  "success": false,
  "error": {
    "code": "VENDOR_HAS_DEPENDENCIES",
    "message": "Cannot delete vendor with active purchase orders",
    "details": {
      "dependencies": ["purchase_orders", "pending_pricelists"],
      "count": 5
    }
  }
}
```

### 3.6 Update Vendor Status
**Endpoint**: `PATCH /vendors/{id}/status`
**Description**: Update vendor status (active/inactive/suspended)

**Path Parameters**:
- `id` (string, required): Vendor unique identifier

**Request Body**:
```typescript
{
  status: 'active' | 'inactive' | 'suspended'
}
```

**Response**: `ApiResponse<Vendor>`

### 3.7 Get Vendor Data Summary
**Endpoint**: `GET /vendors/{id}/summary`
**Description**: Retrieve vendor data summary for reporting

**Path Parameters**:
- `id` (string, required): Vendor unique identifier

**Query Parameters**:
- `includeHistory` (boolean, optional): Include historical data changes

**Response**: `ApiResponse<VendorSummary>`

### 3.8 Get Vendor Pricelist History
**Endpoint**: `GET /vendors/{id}/pricelists`
**Description**: Retrieve pricelist submission history for vendor

**Path Parameters**:
- `id` (string, required): Vendor unique identifier

**Query Parameters**:
- `status` (string[], optional): Filter by pricelist status
- `dateFrom` (Date, optional): Start date filter
- `dateTo` (Date, optional): End date filter

**Response**: `ApiResponse<VendorPricelist[]>`

### 3.9 Search Vendors
**Endpoint**: `GET /vendors/search`
**Description**: Text search across vendor fields

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number, optional): Max results (default: 10, max: 50)
- `fields` (string[], optional): Fields to search in

**Response**: `ApiResponse<Vendor[]>`

**Search Fields**:
- Company name
- Contact email
- Business type
- Address components (city, state)
- Certifications

### 3.10 Bulk Operations
**Endpoint**: `PATCH /vendors/bulk`
**Description**: Perform bulk updates on multiple vendors

**Request Body**:
```typescript
{
  updates: {
    id: string
    changes: Partial<Vendor>
  }[]
}
```

**Response**: `ApiResponse<Vendor[]>`

**Example Request**:
```http
PATCH /api/price-management/vendors/bulk
Content-Type: application/json

{
  "updates": [
    {
      "id": "vendor-123",
      "changes": { "status": "inactive" }
    },
    {
      "id": "vendor-456", 
      "changes": { "paymentTerms": "Net 45 days" }
    }
  ]
}
```

---

## 4. Vendor Validation API

### 4.1 Validate Vendor Data
**Endpoint**: `POST /vendors/validate`
**Description**: Validate vendor data before creation/update

**Request Body**: `Partial<Vendor>`

**Response**: `ApiResponse<ValidationResult>`

**Validation Result Model**:
```typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  qualityScore: number
  validatedFields: string[]
  timestamp: Date
}

interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestions?: string[]
  context?: Record<string, any>
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "errors": [
      {
        "field": "contactEmail",
        "code": "INVALID_EMAIL_DOMAIN",
        "message": "Email domain does not exist",
        "severity": "error",
        "suggestions": ["Check email spelling", "Verify domain exists"]
      }
    ],
    "warnings": [
      {
        "field": "website",
        "code": "MISSING_WEBSITE",
        "message": "Website URL not provided",
        "severity": "warning"
      }
    ],
    "qualityScore": 75,
    "validatedFields": ["name", "contactEmail", "address"],
    "timestamp": "2024-12-20T15:30:00Z"
  }
}
```

---

## 5. Price Management API

### 5.1 Pricelist Template Management

#### 5.1.1 List Templates
**Endpoint**: `GET /templates`
**Description**: Retrieve paginated list of pricelist templates

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string[], optional): Filter by status ('draft', 'active', 'inactive')
- `search` (string, optional): Text search across template fields

**Response**: `ApiResponse<PaginatedResponse<PricelistTemplate>>`

#### 5.1.2 Create Template
**Endpoint**: `POST /templates`
**Description**: Create new pricelist template

**Request Body**: `Omit<PricelistTemplate, 'id' | 'createdAt' | 'updatedAt'>`

**Response**: `ApiResponse<PricelistTemplate>`

#### 5.1.3 Generate Excel Template
**Endpoint**: `GET /templates/{id}/excel`
**Description**: Generate Excel template for vendor download

**Response**: `ApiResponse<{ downloadUrl: string }>`

### 5.2 Campaign Management API

#### 5.2.1 List Campaigns
**Endpoint**: `GET /campaigns`
**Description**: Retrieve campaigns with filtering and pagination

**Query Parameters**:
- `status` (string[], optional): Filter by campaign status
- `priority` (string[], optional): Filter by priority level
- `templateId` (string, optional): Filter by template
- `dateRange` (object, optional): Filter by date range

**Response**: `ApiResponse<PaginatedResponse<RequestForPricing>>`

#### 5.2.2 Create Campaign
**Endpoint**: `POST /campaigns`
**Description**: Create new pricing campaign

**Request Body**: `Omit<RequestForPricing, 'id' | 'createdAt' | 'updatedAt' | 'invitations' | 'analytics'>`

**Response**: `ApiResponse<RequestForPricing>`

#### 5.2.3 Send Invitations
**Endpoint**: `POST /campaigns/{id}/invitations`
**Description**: Send pricing invitations to selected vendors

**Request Body**:
```typescript
{
  vendorIds: string[]
  settings: {
    subject?: string
    message?: string
    deadline?: Date
    reminderDays?: number[]
  }
}
```

**Response**: `ApiResponse<VendorInvitation[]>`

### 5.3 Vendor Portal API

#### 5.3.1 Authenticate Portal Access
**Endpoint**: `POST /portal/authenticate`
**Description**: Authenticate vendor portal access with token

**Request Body**:
```typescript
{
  token: string
}
```

**Response**: `ApiResponse<{ session: PortalSession; pricelist: VendorPricelist }>`

#### 5.3.2 Auto-save Pricelist Data
**Endpoint**: `POST /portal/autosave/{token}`
**Description**: Auto-save vendor pricelist progress

**Request Body**: `Partial<VendorPricelist>`

**Response**: `ApiResponse<VendorPricelist>`

#### 5.3.3 Submit Pricelist
**Endpoint**: `POST /portal/submit/{token}`
**Description**: Submit completed pricelist for review

**Request Body**: `VendorPricelist`

**Response**: `ApiResponse<VendorPricelist>`

#### 5.3.4 Upload Excel Data
**Endpoint**: `POST /portal/upload/{token}`
**Description**: Upload pricing data via Excel file

**Request Body**: `FormData` with Excel file

**Response**: `ApiResponse<{ items: PricelistItem[]; errors: ValidationError[] }>`

### 5.4 Pricelist Management API

#### 5.4.1 List Pricelists
**Endpoint**: `GET /pricelists`
**Description**: Retrieve vendor pricelists with filtering

**Query Parameters**:
- `status` (string[], optional): Filter by pricelist status
- `vendorIds` (string[], optional): Filter by vendor IDs
- `campaignId` (string, optional): Filter by campaign
- `qualityScoreMin` (number, optional): Minimum quality score

**Response**: `ApiResponse<PaginatedResponse<VendorPricelist>>`

#### 5.4.2 Approve/Reject Pricelist
**Endpoint**: `PATCH /pricelists/{id}/status`
**Description**: Update pricelist approval status

**Request Body**:
```typescript
{
  status: 'approved' | 'rejected'
  reason?: string
  approvedBy?: string
}
```

**Response**: `ApiResponse<VendorPricelist>`

#### 5.4.3 Validate Pricelist
**Endpoint**: `POST /pricelists/{id}/validate`
**Description**: Run validation checks on pricelist data

**Response**: `ApiResponse<ValidationResult>`

### 5.5 MOQ Pricing API

#### 5.5.1 Bulk Update MOQ Pricing
**Endpoint**: `PUT /moq/item/{itemId}/bulk`
**Description**: Update all MOQ pricing tiers for an item

**Request Body**:
```typescript
{
  moqs: MOQPricing[]
}
```

**Response**: `ApiResponse<MOQPricing[]>`

---

## 6. Integration Endpoints

### 6.1 Procurement Integration
**Endpoint**: `GET /vendors/{id}/procurement-data`
**Description**: Get vendor data formatted for procurement system

**Response**: Procurement-specific vendor data structure

### 6.2 Price Assignment Integration
**Endpoint**: `POST /procurement/assign-prices`
**Description**: Assign approved vendor prices to purchase requests

**Request Body**:
```typescript
{
  purchaseRequestId: string
  priceAssignments: {
    itemId: string
    vendorId: string
    pricelistId: string
    selectedMOQ: string
  }[]
}
```

**Response**: `ApiResponse<{ assigned: number; failed: number; details: any[] }>`

### 6.3 Finance Integration
**Endpoint**: `GET /vendors/{id}/financial-profile`
**Description**: Get financial profile for accounting system integration

**Response**: Financial-specific vendor data structure

### 6.4 Vendor Synchronization
**Endpoint**: `POST /vendors/sync`
**Description**: Synchronize vendor data with external systems

**Request Body**:
```typescript
{
  systems: ('procurement' | 'finance' | 'audit')[]
  vendorIds?: string[]  // Optional: sync specific vendors
}
```

---

## 7. Error Handling

### 7.1 Standard Error Codes

**Vendor Management Errors**:
- `VENDOR_NOT_FOUND`: Vendor ID does not exist
- `VENDOR_HAS_DEPENDENCIES`: Cannot delete vendor with active relationships
- `INVALID_VENDOR_DATA`: Validation failed for vendor data
- `DUPLICATE_VENDOR_EMAIL`: Email address already exists

**Price Management Errors**:
- `TEMPLATE_NOT_FOUND`: Pricelist template does not exist
- `CAMPAIGN_NOT_FOUND`: Campaign ID does not exist
- `PRICELIST_NOT_FOUND`: Pricelist ID does not exist
- `INVALID_TEMPLATE_DATA`: Template validation failed
- `INVALID_CAMPAIGN_STATUS`: Cannot perform action in current campaign status
- `INVALID_PRICELIST_STATUS`: Cannot modify pricelist in current status
- `DUPLICATE_PRODUCT_SELECTION`: Product already selected in template
- `PORTAL_TOKEN_EXPIRED`: Vendor portal access token has expired
- `PORTAL_TOKEN_INVALID`: Invalid or malformed portal token
- `PORTAL_SESSION_EXPIRED`: Vendor portal session has timed out
- `PRICING_DATA_INVALID`: Submitted pricing data failed validation
- `MOQ_VALIDATION_ERROR`: MOQ pricing data validation failed
- `EXCEL_UPLOAD_ERROR`: Excel file upload or parsing failed

**System Errors**:
- `UNAUTHORIZED_ACCESS`: User lacks permission for operation
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Unexpected server error

### 7.2 Validation Error Codes

**Data Format Errors**:
- `REQUIRED_FIELD_MISSING`: Required field not provided
- `INVALID_EMAIL_FORMAT`: Email format is invalid
- `INVALID_PHONE_FORMAT`: Phone number format is invalid
- `INVALID_CURRENCY_CODE`: Currency code not supported
- `INVALID_URL_FORMAT`: Website URL format is invalid
- `FIELD_TOO_LONG`: Field exceeds maximum length
- `FIELD_TOO_SHORT`: Field below minimum length
- `INVALID_DATE_FORMAT`: Date format is invalid
- `INVALID_NUMBER_FORMAT`: Numeric value format is invalid

**Business Rule Errors**:
- `PRICE_BELOW_MINIMUM`: Price below acceptable minimum
- `PRICE_ABOVE_MAXIMUM`: Price exceeds maximum threshold
- `INVALID_MOQ_STRUCTURE`: MOQ pricing structure is invalid
- `LEAD_TIME_REQUIRED`: Lead time is required for this product
- `CURRENCY_MISMATCH`: Currency does not match template requirements
- `DUPLICATE_MOQ_TIER`: Duplicate quantity tier in MOQ pricing
- `INVALID_QUANTITY_RANGE`: Invalid quantity range specification
- `TEMPLATE_PRODUCT_MISMATCH`: Product not included in template

**Workflow Errors**:
- `CAMPAIGN_ALREADY_ACTIVE`: Campaign is already in active status
- `SUBMISSION_DEADLINE_PASSED`: Submission deadline has passed
- `PRICELIST_ALREADY_SUBMITTED`: Pricelist has already been submitted
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `APPROVAL_REQUIRED`: Manager approval required for this action

### 7.3 HTTP Status Codes
- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Business rule violation
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## 8. Authentication & Authorization

### 7.1 Authentication
All API endpoints require Bearer token authentication:
```http
Authorization: Bearer <jwt-token>
```

### 7.2 Authorization Levels
- **Read**: View vendor information
- **Write**: Create and update vendors
- **Delete**: Delete vendor records
- **Admin**: All operations plus system configuration

### 7.3 Role-Based Access Control (RBAC)
- **Procurement Manager**: Full vendor management access
- **Finance Controller**: Read access + financial updates
- **Operations Manager**: Read access + performance metrics
- **Vendor User**: Limited read access to own data

---

## 9. Rate Limiting

### 8.1 Rate Limits
- **Standard Users**: 1,000 requests per hour
- **Admin Users**: 5,000 requests per hour
- **System Integration**: 10,000 requests per hour

### 8.2 Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

---

## 10. Caching Strategy

### 9.1 Cache Headers
- **Vendor Details**: `Cache-Control: private, max-age=300`
- **Vendor Lists**: `Cache-Control: private, max-age=60`
- **Vendor Summaries**: `Cache-Control: private, max-age=900`

### 9.2 ETags
Vendor resources include ETags for conditional requests:
```http
ETag: "vendor-123-v1640995200"
If-None-Match: "vendor-123-v1640995200"
```

---

## 11. Monitoring & Observability

### 10.1 Request Logging
All API requests are logged with:
- Request ID
- User ID
- Endpoint accessed
- Response time
- Status code
- IP address

### 10.2 Metrics
Key metrics tracked:
- Request volume by endpoint
- Response times (p50, p95, p99)
- Error rates by status code
- Cache hit rates
- Database query performance

### 10.3 Health Checks
**Endpoint**: `GET /health`
```json
{
  "status": "healthy",
  "timestamp": "2024-12-20T15:30:00Z",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "external_services": "healthy"
  }
}
```

---

## 12. Testing

### 11.1 Test Data
Test environment provides seed data:
- 100+ test vendors across various business types
- Complete performance metrics history
- Multiple address and contact variations

### 11.2 API Testing
- **Postman Collection**: Available for manual testing
- **OpenAPI Spec**: Auto-generated from code
- **Integration Tests**: Automated test suite covering all endpoints

---

## 13. Changelog

### Version 1.0 (January 2025)
- Initial API specification
- Core vendor CRUD operations
- Search and filtering capabilities
- Vendor data summary endpoints
- Validation and quality scoring
- Integration endpoints

---

**API Status**: ✅ **Active - Production Ready**

This API specification provides comprehensive documentation for all vendor management endpoints and integration patterns within the Carmen ERP system.