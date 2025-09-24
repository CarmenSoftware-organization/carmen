# Purchase Request Template API Specification

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Core Endpoints](#core-endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)

## Authentication & Authorization

### Authentication
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 24 hours
- **Refresh**: Automatic refresh before expiry

### Authorization Levels
- **View Templates**: `templates:read`
- **Create Templates**: `templates:create`
- **Edit Templates**: `templates:update`
- **Delete Templates**: `templates:delete`
- **Admin Operations**: `templates:admin`

### Role-Based Access
```typescript
interface UserPermissions {
  purchasing_staff: ['templates:read', 'templates:create', 'templates:update']
  department_manager: ['templates:read', 'templates:create', 'templates:update', 'templates:delete']
  financial_manager: ['templates:read', 'templates:admin']
  admin: ['templates:read', 'templates:create', 'templates:update', 'templates:delete', 'templates:admin']
}
```

## Core Endpoints

### Templates

#### GET /api/purchase-request-templates
Get list of purchase request templates with filtering and pagination.

**Query Parameters:**
```typescript
interface GetTemplatesQuery {
  page?: number          // Page number (default: 1)
  limit?: number         // Items per page (default: 20, max: 100)
  sort?: string         // Sort field (name, created_at, updated_at)
  order?: 'asc' | 'desc' // Sort order (default: desc)
  search?: string       // Search term for name/description
  type?: TemplateType   // Filter by template type
  department?: string   // Filter by department
  status?: TemplateStatus // Filter by status
  created_after?: string // ISO date string
  created_before?: string // ISO date string
}
```

**Response:**
```typescript
interface GetTemplatesResponse {
  data: PurchaseRequestTemplate[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    types: TemplateType[]
    departments: string[]
    statuses: TemplateStatus[]
  }
}
```

**Example:**
```bash
GET /api/purchase-request-templates?page=1&limit=10&type=general&department=kitchen
```

#### GET /api/purchase-request-templates/:id
Get specific purchase request template by ID.

**Path Parameters:**
- `id` (string): Template UUID

**Response:**
```typescript
interface GetTemplateResponse {
  data: PurchaseRequestTemplate
  items: TemplateItem[]
  metadata: {
    created_by: User
    updated_by: User
    usage_count: number
    last_used: string | null
  }
}
```

#### POST /api/purchase-request-templates
Create new purchase request template.

**Request Body:**
```typescript
interface CreateTemplateRequest {
  name: string
  description?: string
  type: TemplateType
  department: string
  requestor_id: string
  reference_number?: string
  items: CreateTemplateItemRequest[]
  budget_codes?: string[]
  account_codes?: string[]
  approval_workflow?: string
  is_default?: boolean
}

interface CreateTemplateItemRequest {
  item_code: string
  description: string
  uom: string
  quantity: number
  unit_price: number
  currency: CurrencyCode
  budget_code: string
  account_code: string
  tax_code?: string
  department?: string
}
```

**Response:**
```typescript
interface CreateTemplateResponse {
  data: PurchaseRequestTemplate
  message: string
}
```

#### PUT /api/purchase-request-templates/:id
Update existing purchase request template.

**Path Parameters:**
- `id` (string): Template UUID

**Request Body:**
```typescript
interface UpdateTemplateRequest {
  name?: string
  description?: string
  type?: TemplateType
  department?: string
  requestor_id?: string
  items?: UpdateTemplateItemRequest[]
  is_active?: boolean
  is_default?: boolean
}

interface UpdateTemplateItemRequest {
  id?: string           // Include for updates, omit for new items
  item_code?: string
  description?: string
  uom?: string
  quantity?: number
  unit_price?: number
  currency?: CurrencyCode
  budget_code?: string
  account_code?: string
  _action?: 'create' | 'update' | 'delete'
}
```

#### DELETE /api/purchase-request-templates/:id
Delete purchase request template.

**Path Parameters:**
- `id` (string): Template UUID

**Query Parameters:**
- `force` (boolean): Force delete even if template is in use

**Response:**
```typescript
interface DeleteTemplateResponse {
  message: string
  affected_records?: {
    purchase_requests: number
    related_templates: number
  }
}
```

#### POST /api/purchase-request-templates/:id/clone
Clone existing template with modifications.

**Path Parameters:**
- `id` (string): Source template UUID

**Request Body:**
```typescript
interface CloneTemplateRequest {
  name: string
  description?: string
  department?: string
  modifications?: {
    items?: {
      include_all?: boolean
      exclude_items?: string[]
      quantity_multiplier?: number
    }
    pricing?: {
      adjust_prices?: boolean
      price_multiplier?: number
      new_currency?: CurrencyCode
    }
  }
}
```

#### PUT /api/purchase-request-templates/:id/set-default
Set template as department default.

**Path Parameters:**
- `id` (string): Template UUID

**Request Body:**
```typescript
interface SetDefaultRequest {
  department: string
  replace_existing?: boolean
}
```

### Template Items

#### GET /api/purchase-request-templates/:id/items
Get items for specific template.

**Path Parameters:**
- `id` (string): Template UUID

**Response:**
```typescript
interface GetTemplateItemsResponse {
  data: TemplateItem[]
  summary: {
    total_items: number
    total_amount: number
    currencies: CurrencyCode[]
    departments: string[]
  }
}
```

#### POST /api/purchase-request-templates/:id/items
Add item to template.

**Path Parameters:**
- `id` (string): Template UUID

**Request Body:**
```typescript
interface AddItemRequest {
  item_code: string
  description: string
  uom: string
  quantity: number
  unit_price: number
  currency: CurrencyCode
  budget_code: string
  account_code: string
  tax_code?: string
  department?: string
}
```

#### PUT /api/purchase-request-templates/:id/items/:item_id
Update template item.

**Path Parameters:**
- `id` (string): Template UUID
- `item_id` (string): Item UUID

#### DELETE /api/purchase-request-templates/:id/items/:item_id
Remove item from template.

### Bulk Operations

#### POST /api/purchase-request-templates/bulk
Perform bulk operations on templates.

**Request Body:**
```typescript
interface BulkOperationRequest {
  operation: 'delete' | 'clone' | 'set_status' | 'export'
  template_ids: string[]
  parameters?: {
    status?: TemplateStatus
    clone_prefix?: string
    export_format?: 'csv' | 'xlsx' | 'json'
  }
}
```

### Analytics & Reporting

#### GET /api/purchase-request-templates/analytics/usage
Get template usage analytics.

**Query Parameters:**
```typescript
interface UsageAnalyticsQuery {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  start_date?: string
  end_date?: string
  department?: string
  template_ids?: string[]
}
```

**Response:**
```typescript
interface UsageAnalyticsResponse {
  data: {
    template_id: string
    template_name: string
    usage_count: number
    total_amount: number
    avg_amount: number
    departments: string[]
    last_used: string
  }[]
  summary: {
    total_templates: number
    active_templates: number
    total_usage: number
    total_value: number
  }
}
```

#### GET /api/purchase-request-templates/analytics/trends
Get template usage trends over time.

## Data Models

### PurchaseRequestTemplate
```typescript
interface PurchaseRequestTemplate {
  id: string
  name: string
  description: string | null
  reference_number: string
  type: TemplateType
  department: string
  requestor_id: string
  status: TemplateStatus
  is_active: boolean
  is_default: boolean
  total_amount: number
  currency: CurrencyCode
  item_count: number
  budget_codes: string[]
  account_codes: string[]
  approval_workflow: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  version: number
}

type TemplateType = 'general' | 'asset' | 'service' | 'recurring'
type TemplateStatus = 'draft' | 'active' | 'inactive' | 'archived'
```

### TemplateItem
```typescript
interface TemplateItem {
  id: string
  template_id: string
  item_code: string
  description: string
  uom: string
  quantity: number
  unit_price: number
  total_amount: number
  currency: CurrencyCode
  exchange_rate: number
  budget_code: string
  account_code: string
  department: string
  tax_code: string | null
  tax_rate: number
  tax_amount: number
  sort_order: number
  created_at: string
  updated_at: string
}
```

### User
```typescript
interface User {
  id: string
  name: string
  email: string
  department: string
  role: UserRole
  permissions: string[]
}

type UserRole = 'purchasing_staff' | 'department_manager' | 'financial_manager' | 'admin'
```

### Department
```typescript
interface Department {
  id: string
  name: string
  code: string
  budget_codes: string[]
  default_template_id: string | null
  parent_department_id: string | null
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    request_id: string
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `TEMPLATE_NOT_FOUND` | 404 | Template does not exist |
| `TEMPLATE_NAME_EXISTS` | 409 | Template name already exists |
| `INVALID_TEMPLATE_TYPE` | 400 | Invalid template type specified |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `TEMPLATE_IN_USE` | 409 | Cannot delete template in use |
| `INVALID_ITEM_DATA` | 400 | Template item validation failed |
| `BUDGET_CODE_INVALID` | 400 | Invalid budget code specified |
| `CURRENCY_MISMATCH` | 400 | Currency inconsistency in items |
| `TEMPLATE_LIMIT_EXCEEDED` | 429 | Too many templates for department |
| `BULK_OPERATION_FAILED` | 422 | Bulk operation partially failed |

### Validation Errors
```typescript
interface ValidationError {
  field: string
  code: string
  message: string
  value?: any
}

interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_FAILED'
    message: string
    validation_errors: ValidationError[]
  }
}
```

## Rate Limiting

### Limits
- **Read Operations**: 1000 requests/hour per user
- **Write Operations**: 200 requests/hour per user
- **Bulk Operations**: 50 requests/hour per user
- **Analytics**: 100 requests/hour per user

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### Rate Limit Exceeded
```typescript
interface RateLimitResponse {
  error: {
    code: 'RATE_LIMIT_EXCEEDED'
    message: 'Rate limit exceeded'
    retry_after: number
  }
}
```

## Webhooks

### Available Events
- `template.created`
- `template.updated`
- `template.deleted`
- `template.cloned`
- `template.set_default`
- `template.item.added`
- `template.item.updated`
- `template.item.removed`

### Webhook Payload
```typescript
interface WebhookPayload {
  event: string
  timestamp: string
  data: {
    template: PurchaseRequestTemplate
    changes?: any
    user: User
  }
  organization_id: string
}
```

### Webhook Configuration
```typescript
interface WebhookConfig {
  url: string
  events: string[]
  secret: string
  active: boolean
  retry_policy: {
    max_retries: number
    backoff_multiplier: number
  }
}
```

---

*Generated on: 2025-09-23*
*API Specification Version: 1.0*
*Carmen ERP - Hospitality Supply Chain Management*