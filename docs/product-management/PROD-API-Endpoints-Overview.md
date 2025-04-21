# Product Management API Overview

This document provides an overview of the API endpoints available for the Product Management module in the Procurement & Inventory Management System.

## Base URL

All APIs are accessible from the base URL: `/api`

## Authentication

All endpoints require authentication. Include an `Authorization` header with a valid JWT token:

```
Authorization: Bearer {token}
```

## Endpoints Summary

The Product Management module provides the following API endpoints:

### Products API

| Method | Endpoint                        | Description                               |
|--------|----------------------------------|-------------------------------------------|
| GET    | `/api/products`                 | List all products with filtering and pagination |
| GET    | `/api/products/{id}`            | Get a specific product by ID              |
| POST   | `/api/products`                 | Create a new product                      |
| PUT    | `/api/products/{id}`            | Update an existing product                |
| DELETE | `/api/products/{id}`            | Delete a product                          |
| POST   | `/api/products/{id}/image`      | Upload product image                      |
| PUT    | `/api/products/{id}/conversions`| Update unit conversions for a product     |

[Detailed Products API Documentation](./PROD-API-Endpoints-Products.md)

### Categories API

| Method | Endpoint                            | Description                               |
|--------|-------------------------------------|-------------------------------------------|
| GET    | `/api/categories`                   | List all categories                       |
| GET    | `/api/categories/{id}`              | Get a specific category by ID             |
| POST   | `/api/categories`                   | Create a new category                     |
| PUT    | `/api/categories/{id}`              | Update an existing category               |
| DELETE | `/api/categories/{id}`              | Delete a category                         |
| POST   | `/api/categories/{parentId}/subcategories` | Create a subcategory              |

[Detailed Categories API Documentation](./PROD-API-Endpoints-Categories.md)

### Units API

| Method | Endpoint                        | Description                               |
|--------|----------------------------------|-------------------------------------------|
| GET    | `/api/units`                    | List all units                            |
| GET    | `/api/units/{id}`               | Get a specific unit by ID                 |
| POST   | `/api/units`                    | Create a new unit                         |
| PUT    | `/api/units/{id}`               | Update an existing unit                   |
| DELETE | `/api/units/{id}`               | Delete a unit                             |
| GET    | `/api/units/{baseUnitId}/derived` | Get derived units for a base unit       |
| GET    | `/api/units/convert`            | Convert values between units              |

[Detailed Units API Documentation](./PROD-API-Endpoints-Units.md)

## Response Format

All API responses follow a standard format:

### Success Responses

Success responses include HTTP status codes in the 2xx range. The response body typically includes the requested data or a success message:

```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

Or for single resource responses:

```json
{
  "id": "RESOURCE-ID",
  "name": "Resource Name",
  ...
}
```

### Error Responses

Error responses include HTTP status codes in the 4xx or 5xx range. The response body includes an error code, message, and sometimes additional details:

```json
{
  "error": "Error Type",
  "message": "Error description",
  "details": {
    "fieldName": "Specific error for this field"
  }
}
```

## Common Error Codes

| Status Code | Error Type         | Description                                       |
|-------------|-------------------|---------------------------------------------------|
| 400         | Bad Request       | Invalid request parameters or body                 |
| 401         | Unauthorized      | Missing or invalid authentication token            |
| 403         | Forbidden         | Insufficient permissions for the requested action  |
| 404         | Not Found         | Requested resource does not exist                  |
| 409         | Conflict          | Request conflicts with current state of the server |
| 422         | Unprocessable Entity | Request is well-formed but cannot be processed    |
| 500         | Internal Server Error | Unexpected server error                        |

## Versioning

The API is currently at version 1. The version is included in the URL path:

```
/api/v1/products
```

The current documentation describes version 1 of the API. Future versions may introduce breaking changes and will be documented separately.

## Rate Limiting

API requests are subject to rate limiting:

- 100 requests per minute per API token
- 5000 requests per day per API token

When rate limits are exceeded, the API will return a 429 Too Many Requests response with a Retry-After header indicating when to retry. 