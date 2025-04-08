# POS Interface API Requirements Document

## 1. Base Configuration

```typescript
BASE_URL: '/api/v1/pos'
Content-Type: 'application/json'
Authentication: Bearer Token
```

## 2. API Endpoints

### 2.1 Configuration Management

#### Get POS System Configuration
```typescript
GET /config
Response {
  posSystem: string
  interfaceType: 'api' | 'file'
  apiEndpoint?: string
  securityToken?: string
  filePath?: string
  filePattern?: string
  status: 'active' | 'inactive'
  lastSync: string
  fieldMappings: {
    id: string
    posField: string
    systemField: string
    dataType: string
    required: boolean
  }[]
}
```

#### Update POS Configuration
```typescript
PUT /config
Request {
  posSystem: string
  interfaceType: 'api' | 'file'
  apiEndpoint?: string
  securityToken?: string
  filePath?: string
  filePattern?: string
  fieldMappings: {
    posField: string
    systemField: string
    dataType: string
    required: boolean
  }[]
}
```

### 2.2 Transaction Management

#### Get Transactions
```typescript
GET /transactions
Query {
  startDate?: string
  endDate?: string
  status?: 'pending' | 'processed' | 'failed'
  page?: number
  limit?: number
}
Response {
  total: number
  page: number
  limit: number
  transactions: {
    id: string
    transactionDate: string
    outlet: string
    posItemCode: string
    description: string
    quantity: number
    price: number
    total: number
    status: 'pending' | 'processed' | 'failed'
    errorMessage?: string
    mappingStatus: 'mapped' | 'unmapped' | 'partial'
  }[]
}
```

#### Get Transaction Details
```typescript
GET /transactions/:id
Response {
  id: string
  transactionDate: string
  outlet: string
  posItemCode: string
  description: string
  quantity: number
  price: number
  total: number
  status: 'pending' | 'processed' | 'failed'
  errorMessage?: string
  mappingStatus: 'mapped' | 'unmapped' | 'partial'
  inventory: {
    itemCode: string
    description: string
    quantity: number
    unit: string
  }[]
  exceptions: {
    id: string
    type: string
    message: string
    status: 'open' | 'resolved'
    createdAt: string
  }[]
}
```

### 2.3 Recipe Mapping

#### Get Recipe Mappings
```typescript
GET /mappings
Query {
  status?: 'mapped' | 'unmapped'
  search?: string
  page?: number
  limit?: number
}
Response {
  total: number
  page: number
  limit: number
  mappings: {
    id: string
    posItemCode: string
    posDescription: string
    recipeComponents: {
      itemCode: string
      description: string
      quantity: number
      unit: string
    }[]
    status: 'mapped' | 'unmapped'
    lastUpdated: string
  }[]
}
```

#### Create/Update Recipe Mapping
```typescript
PUT /mappings/:posItemCode
Request {
  recipeComponents: {
    itemCode: string
    quantity: number
    unit: string
  }[]
}
```

### 2.4 Exception Management

#### Get Exceptions
```typescript
GET /exceptions
Query {
  type?: 'mapping' | 'inventory' | 'validation'
  status?: 'open' | 'resolved'
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
Response {
  total: number
  page: number
  limit: number
  exceptions: {
    id: string
    transactionId: string
    type: 'mapping' | 'inventory' | 'validation'
    message: string
    status: 'open' | 'resolved'
    createdAt: string
    resolvedAt?: string
    resolution?: string
  }[]
}
```

#### Update Exception Status
```typescript
PUT /exceptions/:id
Request {
  status: 'resolved'
  resolution: string
}
```

### 2.5 Analytics & Reporting

#### Get Dashboard Statistics
```typescript
GET /analytics/dashboard
Response {
  pendingTransactions: number
  unmappedItems: number
  todayTransactions: number
  todayConsumptions: number
  recentActivity: {
    id: string
    type: string
    description: string
    timestamp: string
  }[]
  systemStatus: {
    posConnection: 'connected' | 'disconnected'
    interfaceService: 'active' | 'inactive'
    lastSync: string
  }
}
```

#### Get Consumption Report
```typescript
GET /analytics/consumption
Query {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
  itemCode?: string
}
Response {
  periods: {
    period: string
    consumption: number
    value: number
  }[]
  totals: {
    consumption: number
    value: number
  }
}
```

## 3. Error Responses

```typescript
Error Response {
  status: number
  code: string
  message: string
  details?: {
    field?: string
    error?: string
  }[]
}
```

### Common Error Codes
```typescript
{
  INVALID_CREDENTIALS: 'Authentication failed'
  INVALID_REQUEST: 'Invalid request parameters'
  NOT_FOUND: 'Resource not found'
  VALIDATION_ERROR: 'Validation failed'
  MAPPING_ERROR: 'Recipe mapping error'
  INVENTORY_ERROR: 'Inventory operation error'
  SYSTEM_ERROR: 'Internal system error'
}
```

## 4. Rate Limiting

```typescript
Headers {
  X-RateLimit-Limit: number      // Requests allowed per window
  X-RateLimit-Remaining: number  // Requests remaining in window
  X-RateLimit-Reset: number      // Time until window reset (seconds)
}
```

## 5. Pagination

All list endpoints support pagination with the following query parameters:
```typescript
Query {
  page?: number    // Default: 1
  limit?: number   // Default: 20, Max: 100
}

Response Header {
  X-Total-Count: number
  Link: string     // Links to first, prev, next, last pages
}
``` 