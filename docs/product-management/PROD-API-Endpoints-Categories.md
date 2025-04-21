# Product Categories API Documentation

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

### List Categories
`GET /categories`

Retrieves a hierarchical list of product categories with optional filtering.

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 50, max: 200): Items per page
- `search` (string): Search by name or code
- `status` (string): Filter by status (active, inactive)
- `parentId` (string): Filter by parent category ID
- `level` (integer): Filter by hierarchy level (1 = top level)
- `flat` (boolean, default: false): Return flat list instead of hierarchical tree

**Success Response:**
```json
{
  "data": [
    {
      "id": "cat_101",
      "code": "FD",
      "name": "Food",
      "description": "All food products",
      "status": "active",
      "level": 1,
      "parentId": null,
      "children": [
        {
          "id": "cat_456",
          "code": "FD-RG",
          "name": "Rice & Grains",
          "description": "Rice and grain products",
          "status": "active",
          "level": 2,
          "parentId": "cat_101",
          "productCount": 32,
          "children": []
        },
        {
          "id": "cat_457",
          "code": "FD-MT",
          "name": "Meat",
          "description": "Meat products",
          "status": "active",
          "level": 2,
          "parentId": "cat_101",
          "productCount": 45,
          "children": []
        }
      ]
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

### Get Category
`GET /categories/{id}`

Retrieves detailed information about a specific category.

**URL Parameters:**
- `id` (string, required): Category ID

**Query Parameters:**
- `includeProducts` (boolean, default: false): Include associated products
- `includeChildren` (boolean, default: true): Include child categories

**Success Response:**
```json
{
  "id": "cat_456",
  "code": "FD-RG",
  "name": "Rice & Grains",
  "description": "Rice and grain products",
  "status": "active",
  "level": 2,
  "parentId": "cat_101",
  "parentName": "Food",
  "productCount": 32,
  "children": [],
  "createdAt": "2023-03-15T10:30:00Z",
  "updatedAt": "2023-03-15T10:30:00Z"
}
```

### Create Category
`POST /categories`

Creates a new product category.

**Request Body:**
```json
{
  "code": "FD-PR",
  "name": "Pasta & Rice",
  "description": "Pasta and rice products",
  "status": "active",
  "parentId": "cat_101"
}
```

**Success Response:**
```json
{
  "id": "cat_458",
  "code": "FD-PR",
  "name": "Pasta & Rice",
  "message": "Category created successfully"
}
```

### Update Category
`PUT /categories/{id}`

Updates an existing product category.

**URL Parameters:**
- `id` (string, required): Category ID

**Request Body:**
```json
{
  "name": "Pasta, Rice & Grains",
  "description": "Pasta, rice and grain products",
  "status": "active"
}
```

**Success Response:**
```json
{
  "id": "cat_458",
  "message": "Category updated successfully"
}
```

### Delete Category
`DELETE /categories/{id}`

Deletes a category if it has no associated products or child categories.

**URL Parameters:**
- `id` (string, required): Category ID

**Success Response:**
```json
{
  "id": "cat_458",
  "message": "Category deleted successfully"
}
```

### Move Category
`PUT /categories/{id}/move`

Moves a category to a new parent, adjusting the hierarchy.

**URL Parameters:**
- `id` (string, required): Category ID

**Request Body:**
```json
{
  "parentId": "cat_102"
}
```

**Success Response:**
```json
{
  "id": "cat_458",
  "message": "Category moved successfully"
}
```

### Bulk Operations

#### Bulk Create Categories
`POST /categories/bulk`

Creates multiple categories in a single request.

**Request Body:**
```json
{
  "categories": [
    {
      "code": "FD-VG",
      "name": "Vegetables",
      "description": "Fresh vegetables",
      "status": "active",
      "parentId": "cat_101"
    },
    {
      "code": "FD-FR",
      "name": "Fruits",
      "description": "Fresh fruits",
      "status": "active",
      "parentId": "cat_101"
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Categories created successfully",
  "created": 2,
  "failed": 0,
  "categories": [
    {
      "id": "cat_459",
      "code": "FD-VG",
      "name": "Vegetables"
    },
    {
      "id": "cat_460",
      "code": "FD-FR",
      "name": "Fruits"
    }
  ]
}
```

#### Bulk Update Categories
`PUT /categories/bulk`

Updates multiple categories in a single request.

**Request Body:**
```json
{
  "categories": [
    {
      "id": "cat_459",
      "status": "inactive"
    },
    {
      "id": "cat_460",
      "status": "inactive"
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Categories updated successfully",
  "updated": 2,
  "failed": 0,
  "categories": [
    {
      "id": "cat_459",
      "name": "Vegetables"
    },
    {
      "id": "cat_460",
      "name": "Fruits"
    }
  ]
}
```

### Get Category Tree
`GET /categories/tree`

Retrieves the complete category hierarchy as a nested tree.

**Success Response:**
```json
{
  "tree": [
    {
      "id": "cat_101",
      "code": "FD",
      "name": "Food",
      "level": 1,
      "children": [
        {
          "id": "cat_456",
          "code": "FD-RG",
          "name": "Rice & Grains",
          "level": 2,
          "children": []
        },
        {
          "id": "cat_457",
          "code": "FD-MT",
          "name": "Meat",
          "level": 2,
          "children": []
        }
      ]
    },
    {
      "id": "cat_102",
      "code": "NF",
      "name": "Non-Food",
      "level": 1,
      "children": [
        {
          "id": "cat_461",
          "code": "NF-CL",
          "name": "Cleaning Supplies",
          "level": 2,
          "children": []
        }
      ]
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
    "message": "Category not found",
    "details": "No category exists with ID cat_999"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `DUPLICATE_ENTRY`: Resource with the same unique identifier already exists
- `UNAUTHORIZED`: Authentication required or invalid credentials
- `FORBIDDEN`: User lacks permission to perform the action
- `CATEGORY_HAS_PRODUCTS`: Cannot delete category with associated products
- `CATEGORY_HAS_CHILDREN`: Cannot delete category with child categories
- `CIRCULAR_REFERENCE`: Move operation would create a circular reference
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
https://api.carmenerp.com/v2/categories
``` 