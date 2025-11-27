# Product Store Locations API Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Authentication
All API requests require authentication using Bearer token authentication.

```
Authorization: Bearer {your_api_token}
```

## Base URL
```
https://api.carmenerp.com/v1
```

## Endpoints

### List Store Locations
`GET /stores`

Retrieves a paginated list of all store locations with optional filtering.

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 50, max: 200): Items per page
- `search` (string): Search by name or code
- `status` (string): Filter by status (active, inactive)
- `type` (string): Filter by store type (kitchen, warehouse, outlet, etc.)

**Success Response:**
```json
{
  "data": [
    {
      "id": "store_101",
      "code": "MK-001",
      "name": "Main Kitchen",
      "type": "kitchen",
      "address": "123 Main Street, Bangkok 10110",
      "status": "active",
      "manager": "John Smith",
      "contactNumber": "+66 2 123 4567",
      "productCount": 156,
      "createdAt": "2023-01-10T08:30:00Z",
      "updatedAt": "2023-01-10T08:30:00Z"
    },
    {
      "id": "store_102",
      "code": "WH-001",
      "name": "Central Warehouse",
      "type": "warehouse",
      "address": "456 Storage Road, Bangkok 10120",
      "status": "active",
      "manager": "Sarah Johnson",
      "contactNumber": "+66 2 234 5678",
      "productCount": 650,
      "createdAt": "2023-01-10T08:30:00Z",
      "updatedAt": "2023-01-10T08:30:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### Get Store Location
`GET /stores/{id}`

Retrieves detailed information about a specific store location.

**URL Parameters:**
- `id` (string, required): Store ID

**Query Parameters:**
- `includeProducts` (boolean, default: false): Include associated products

**Success Response:**
```json
{
  "id": "store_101",
  "code": "MK-001",
  "name": "Main Kitchen",
  "description": "Central food preparation facility",
  "type": "kitchen",
  "address": "123 Main Street, Bangkok 10110",
  "city": "Bangkok",
  "state": "",
  "postalCode": "10110",
  "country": "Thailand",
  "status": "active",
  "manager": "John Smith",
  "contactNumber": "+66 2 123 4567",
  "email": "kitchen@example.com",
  "productCount": 156,
  "storageAreas": [
    {
      "id": "area_101",
      "name": "Dry Storage",
      "type": "ambient"
    },
    {
      "id": "area_102",
      "name": "Cold Room",
      "type": "refrigerated"
    },
    {
      "id": "area_103",
      "name": "Freezer",
      "type": "frozen"
    }
  ],
  "createdAt": "2023-01-10T08:30:00Z",
  "updatedAt": "2023-01-10T08:30:00Z"
}
```

### Create Store Location
`POST /stores`

Creates a new store location.

**Request Body:**
```json
{
  "code": "SK-001",
  "name": "Satellite Kitchen",
  "description": "Satellite food preparation facility",
  "type": "kitchen",
  "address": "789 Side Street, Bangkok 10130",
  "city": "Bangkok",
  "postalCode": "10130",
  "country": "Thailand",
  "status": "active",
  "manager": "Michael Lee",
  "contactNumber": "+66 2 345 6789",
  "email": "satellite@example.com",
  "storageAreas": [
    {
      "name": "Dry Storage",
      "type": "ambient"
    },
    {
      "name": "Refrigerator",
      "type": "refrigerated"
    }
  ]
}
```

**Success Response:**
```json
{
  "id": "store_103",
  "code": "SK-001",
  "name": "Satellite Kitchen",
  "message": "Store location created successfully"
}
```

### Update Store Location
`PUT /stores/{id}`

Updates an existing store location.

**URL Parameters:**
- `id` (string, required): Store ID

**Request Body:**
```json
{
  "name": "Satellite Kitchen East",
  "description": "Eastern satellite food preparation facility",
  "manager": "Michael Wong",
  "status": "active"
}
```

**Success Response:**
```json
{
  "id": "store_103",
  "message": "Store location updated successfully"
}
```

### Delete Store Location
`DELETE /stores/{id}`

Deletes a store location if it has no associated inventory transactions.

**URL Parameters:**
- `id` (string, required): Store ID

**Success Response:**
```json
{
  "id": "store_103",
  "message": "Store location deleted successfully"
}
```

### Storage Areas

#### List Storage Areas
`GET /stores/{id}/areas`

Retrieves storage areas for a specific store location.

**URL Parameters:**
- `id` (string, required): Store ID

**Success Response:**
```json
{
  "storeId": "store_101",
  "storeName": "Main Kitchen",
  "areas": [
    {
      "id": "area_101",
      "name": "Dry Storage",
      "type": "ambient",
      "description": "For non-perishable items",
      "temperature": null,
      "productCount": 87
    },
    {
      "id": "area_102",
      "name": "Cold Room",
      "type": "refrigerated",
      "description": "For perishable items",
      "temperature": "2-8°C",
      "productCount": 45
    },
    {
      "id": "area_103",
      "name": "Freezer",
      "type": "frozen",
      "description": "For frozen items",
      "temperature": "-18°C",
      "productCount": 24
    }
  ]
}
```

#### Add Storage Area
`POST /stores/{id}/areas`

Adds a new storage area to a store location.

**URL Parameters:**
- `id` (string, required): Store ID

**Request Body:**
```json
{
  "name": "Spice Cabinet",
  "type": "ambient",
  "description": "For spices and herbs",
  "temperature": null
}
```

**Success Response:**
```json
{
  "id": "area_104",
  "storeId": "store_101",
  "name": "Spice Cabinet",
  "message": "Storage area added successfully"
}
```

#### Update Storage Area
`PUT /stores/{id}/areas/{areaId}`

Updates a storage area.

**URL Parameters:**
- `id` (string, required): Store ID
- `areaId` (string, required): Storage Area ID

**Request Body:**
```json
{
  "name": "Spice Storage",
  "description": "For spices, herbs, and seasonings"
}
```

**Success Response:**
```json
{
  "id": "area_104",
  "storeId": "store_101",
  "message": "Storage area updated successfully"
}
```

#### Delete Storage Area
`DELETE /stores/{id}/areas/{areaId}`

Deletes a storage area if it has no associated inventory.

**URL Parameters:**
- `id` (string, required): Store ID
- `areaId` (string, required): Storage Area ID

**Success Response:**
```json
{
  "id": "area_104",
  "storeId": "store_101",
  "message": "Storage area deleted successfully"
}
```

### Store Product Stock

#### Get Store Stock Levels
`GET /stores/{id}/stock`

Retrieves current stock levels for all products in a store location.

**URL Parameters:**
- `id` (string, required): Store ID

**Query Parameters:**
- `category` (string): Filter by category ID
- `search` (string): Search by product name or code
- `belowMinimum` (boolean): Filter products below minimum stock level
- `aboveMaximum` (boolean): Filter products above maximum stock level

**Success Response:**
```json
{
  "storeId": "store_101",
  "storeName": "Main Kitchen",
  "totalProducts": 156,
  "stockValue": 245680.50,
  "currency": "THB",
  "stockItems": [
    {
      "productId": "prod_123",
      "productCode": "PM001",
      "productName": "Basmati Rice",
      "categoryName": "Rice & Grains",
      "currentStock": 125,
      "minStock": 50,
      "maxStock": 200,
      "unit": "kg",
      "value": 4375.00,
      "storageArea": "Dry Storage",
      "status": "normal"
    },
    {
      "productId": "prod_124",
      "productCode": "PM002",
      "productName": "Jasmine Rice",
      "categoryName": "Rice & Grains",
      "currentStock": 25,
      "minStock": 50,
      "maxStock": 200,
      "unit": "kg",
      "value": 875.00,
      "storageArea": "Dry Storage",
      "status": "below_minimum"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 50,
    "totalPages": 4
  }
}
```

#### Update Product Stock Levels
`PUT /stores/{id}/stock/{productId}`

Updates the stock levels for a specific product in a store location.

**URL Parameters:**
- `id` (string, required): Store ID
- `productId` (string, required): Product ID

**Request Body:**
```json
{
  "minStock": 75,
  "maxStock": 250,
  "storageAreaId": "area_101"
}
```

**Success Response:**
```json
{
  "storeId": "store_101",
  "productId": "prod_123",
  "message": "Stock levels updated successfully"
}
```

### Bulk Operations

#### Bulk Create Store Locations
`POST /stores/bulk`

Creates multiple store locations in a single request.

**Request Body:**
```json
{
  "stores": [
    {
      "code": "OUT-001",
      "name": "Sukhumvit Outlet",
      "type": "outlet",
      "address": "123 Sukhumvit Road, Bangkok 10110",
      "status": "active"
    },
    {
      "code": "OUT-002",
      "name": "Silom Outlet",
      "type": "outlet",
      "address": "456 Silom Road, Bangkok 10500",
      "status": "active"
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Store locations created successfully",
  "created": 2,
  "failed": 0,
  "stores": [
    {
      "id": "store_104",
      "code": "OUT-001",
      "name": "Sukhumvit Outlet"
    },
    {
      "id": "store_105",
      "code": "OUT-002",
      "name": "Silom Outlet"
    }
  ]
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Store location not found",
    "details": "No store exists with ID store_999"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `DUPLICATE_ENTRY`: Resource with the same unique identifier already exists
- `UNAUTHORIZED`: Authentication required or invalid credentials
- `FORBIDDEN`: User lacks permission to perform the action
- `STORE_HAS_INVENTORY`: Cannot delete store with existing inventory
- `STORAGE_AREA_IN_USE`: Cannot delete storage area with assigned products
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Rate Limiting

API requests are limited to:
- 50 requests per minute
- 2000 requests per day

Rate limit headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Versioning

Current API version: v1

Future versions will be accessible at:
```
https://api.carmenerp.com/v2/stores
``` 