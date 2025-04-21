# Products API Documentation

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

### List Products
`GET /products`

Retrieves a paginated list of products with optional filtering and sorting.

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Items per page
- `search` (string): Search by name, code, or description
- `category` (string): Filter by category ID
- `status` (string): Filter by status (active, inactive)
- `type` (string): Filter by product type (raw_material, finished_good, etc.)
- `sort` (string): Sort field (name, code, created_at, updated_at)
- `order` (string): Sort order (asc, desc)
- `storeId` (string): Filter by store/location assignment
- `hasStock` (boolean): Filter by products with stock
- `taxType` (string): Filter by tax type (added_tax, include_tax, none)

**Success Response:**
```json
{
  "data": [
    {
      "id": "prod_123",
      "code": "PM001",
      "name": "Basmati Rice",
      "description": "Premium long grain basmati rice",
      "status": "active",
      "type": "raw_material",
      "categoryId": "cat_456",
      "categoryName": "Rice & Grains",
      "defaultUnit": "kg",
      "taxType": "added_tax",
      "taxRate": 7.0,
      "createdAt": "2023-05-10T08:30:00Z",
      "updatedAt": "2023-05-10T08:30:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Get Product
`GET /products/{id}`

Retrieves detailed information about a specific product.

**URL Parameters:**
- `id` (string, required): Product ID

**Success Response:**
```json
{
  "id": "prod_123",
  "code": "PM001",
  "name": "Basmati Rice",
  "description": "Premium long grain basmati rice",
  "status": "active",
  "type": "raw_material",
  "categoryId": "cat_456",
  "categoryName": "Rice & Grains",
  "defaultUnit": {
    "id": "unit_123",
    "code": "KG",
    "name": "Kilogram"
  },
  "units": [
    {
      "unitId": "unit_123",
      "code": "KG", 
      "name": "Kilogram",
      "isDefault": true,
      "conversionRate": 1
    },
    {
      "unitId": "unit_124",
      "code": "G",
      "name": "Gram",
      "isDefault": false,
      "conversionRate": 0.001
    }
  ],
  "taxType": "added_tax",
  "taxRate": 7.0,
  "attributes": {
    "weight": "25",
    "shelfLife": "24 months",
    "storageInstructions": "Store in a cool, dry place",
    "barcode": "8901234567890",
    "size": "Large",
    "color": "White"
  },
  "locations": [
    {
      "storeId": "store_789",
      "storeName": "Main Kitchen",
      "minStock": 50,
      "maxStock": 200,
      "currentStock": 125
    }
  ],
  "createdAt": "2023-05-10T08:30:00Z",
  "updatedAt": "2023-05-10T08:30:00Z"
}
```

### Create Product
`POST /products`

Creates a new product.

**Request Body:**
```json
{
  "code": "PM002",
  "name": "Jasmine Rice",
  "description": "Fragrant Thai jasmine rice",
  "status": "active",
  "type": "raw_material",
  "categoryId": "cat_456",
  "defaultUnitId": "unit_123",
  "taxType": "added_tax",
  "taxRate": 7.0,
  "attributes": {
    "weight": "25",
    "shelfLife": "24 months",
    "storageInstructions": "Store in a cool, dry place",
    "barcode": "8901234567891",
    "size": "Large",
    "color": "White"
  },
  "units": [
    {
      "unitId": "unit_123",
      "isDefault": true
    },
    {
      "unitId": "unit_124",
      "isDefault": false,
      "conversionRate": 0.001
    }
  ],
  "locations": [
    {
      "storeId": "store_789",
      "minStock": 50,
      "maxStock": 200
    }
  ]
}
```

**Success Response:**
```json
{
  "id": "prod_124",
  "code": "PM002",
  "name": "Jasmine Rice",
  "message": "Product created successfully"
}
```

### Update Product
`PUT /products/{id}`

Updates an existing product.

**URL Parameters:**
- `id` (string, required): Product ID

**Request Body:**
Similar to Create Product, with fields to update

**Success Response:**
```json
{
  "id": "prod_124",
  "message": "Product updated successfully"
}
```

### Delete Product
`DELETE /products/{id}`

Deletes a product if it has no purchase history or inventory transactions.

**URL Parameters:**
- `id` (string, required): Product ID

**Success Response:**
```json
{
  "id": "prod_124",
  "message": "Product deleted successfully"
}
```

### Product Units

#### Add Unit to Product
`POST /products/{id}/units`

Adds a unit to a product with conversion rate.

**URL Parameters:**
- `id` (string, required): Product ID

**Request Body:**
```json
{
  "unitId": "unit_125",
  "isDefault": false,
  "conversionRate": 0.01
}
```

**Success Response:**
```json
{
  "productId": "prod_124",
  "unitId": "unit_125",
  "message": "Unit added to product successfully"
}
```

#### Update Product Unit
`PUT /products/{id}/units/{unitId}`

Updates a product unit conversion rate.

**URL Parameters:**
- `id` (string, required): Product ID
- `unitId` (string, required): Unit ID

**Request Body:**
```json
{
  "isDefault": false,
  "conversionRate": 0.02
}
```

**Success Response:**
```json
{
  "productId": "prod_124",
  "unitId": "unit_125",
  "message": "Product unit updated successfully"
}
```

#### Remove Unit from Product
`DELETE /products/{id}/units/{unitId}`

Removes a unit from a product.

**URL Parameters:**
- `id` (string, required): Product ID
- `unitId` (string, required): Unit ID

**Success Response:**
```json
{
  "productId": "prod_124",
  "unitId": "unit_125",
  "message": "Unit removed from product successfully"
}
```

### Product Locations

#### Add Location to Product
`POST /products/{id}/locations`

Assigns a product to a store/location.

**URL Parameters:**
- `id` (string, required): Product ID

**Request Body:**
```json
{
  "storeId": "store_790",
  "minStock": 25,
  "maxStock": 100
}
```

**Success Response:**
```json
{
  "productId": "prod_124",
  "storeId": "store_790",
  "message": "Location added to product successfully"
}
```

#### Update Product Location
`PUT /products/{id}/locations/{storeId}`

Updates a product's store/location assignment.

**URL Parameters:**
- `id` (string, required): Product ID
- `storeId` (string, required): Store ID

**Request Body:**
```json
{
  "minStock": 30,
  "maxStock": 120
}
```

**Success Response:**
```json
{
  "productId": "prod_124",
  "storeId": "store_790",
  "message": "Product location updated successfully"
}
```

#### Remove Location from Product
`DELETE /products/{id}/locations/{storeId}`

Removes a store/location assignment from a product.

**URL Parameters:**
- `id` (string, required): Product ID
- `storeId` (string, required): Store ID

**Success Response:**
```json
{
  "productId": "prod_124",
  "storeId": "store_790",
  "message": "Location removed from product successfully"
}
```

### Bulk Operations

#### Bulk Create Products
`POST /products/bulk`

Creates multiple products in a single request.

**Request Body:**
```json
{
  "products": [
    {
      "code": "PM003",
      "name": "Brown Rice",
      "description": "Whole grain brown rice",
      "status": "active",
      "type": "raw_material",
      "categoryId": "cat_456",
      "defaultUnitId": "unit_123",
      "taxType": "added_tax",
      "taxRate": 7.0
    },
    {
      "code": "PM004",
      "name": "Black Rice",
      "description": "Nutritious black rice",
      "status": "active",
      "type": "raw_material",
      "categoryId": "cat_456",
      "defaultUnitId": "unit_123",
      "taxType": "added_tax",
      "taxRate": 7.0
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Products created successfully",
  "created": 2,
  "failed": 0,
  "products": [
    {
      "id": "prod_125",
      "code": "PM003",
      "name": "Brown Rice"
    },
    {
      "id": "prod_126",
      "code": "PM004",
      "name": "Black Rice"
    }
  ]
}
```

#### Bulk Update Products
`PUT /products/bulk`

Updates multiple products in a single request.

**Request Body:**
```json
{
  "products": [
    {
      "id": "prod_125",
      "status": "inactive"
    },
    {
      "id": "prod_126",
      "status": "inactive"
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Products updated successfully",
  "updated": 2,
  "failed": 0,
  "products": [
    {
      "id": "prod_125",
      "name": "Brown Rice"
    },
    {
      "id": "prod_126",
      "name": "Black Rice"
    }
  ]
}
```

### Product Stock

#### Get Stock Levels
`GET /products/{id}/stock`

Retrieves current stock levels for a product across all locations.

**URL Parameters:**
- `id` (string, required): Product ID

**Success Response:**
```json
{
  "productId": "prod_124",
  "productName": "Jasmine Rice",
  "totalStock": 250,
  "locations": [
    {
      "storeId": "store_789",
      "storeName": "Main Kitchen",
      "currentStock": 125,
      "minStock": 50,
      "maxStock": 200,
      "unit": "kg"
    },
    {
      "storeId": "store_790",
      "storeName": "Satellite Kitchen",
      "currentStock": 125,
      "minStock": 25,
      "maxStock": 100,
      "unit": "kg"
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
    "message": "Product not found",
    "details": "No product exists with ID prod_999"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `DUPLICATE_ENTRY`: Resource with the same unique identifier already exists
- `UNAUTHORIZED`: Authentication required or invalid credentials
- `FORBIDDEN`: User lacks permission to perform the action
- `PRODUCT_IN_USE`: Cannot delete product with purchase history or inventory
- `DEFAULT_UNIT_REQUIRED`: Product must have a default unit
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
https://api.carmenerp.com/v2/products
``` 