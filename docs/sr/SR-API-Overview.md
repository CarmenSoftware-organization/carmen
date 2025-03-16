# Store Requisition API - Overview

> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Table of Contents
1. [Introduction](#introduction)
2. [API Conventions](#api-conventions)
3. [Authentication and Authorization](#authentication-and-authorization)
4. [Common Request/Response Patterns](#common-requestresponse-patterns)
5. [Error Handling](#error-handling)
6. [API Versioning](#api-versioning)
7. [Rate Limiting](#rate-limiting)
8. [API Endpoints Overview](#api-endpoints-overview)
9. [Related Documentation](#related-documentation)

## Introduction

The Store Requisition (SR) API provides programmatic access to the Store Requisition module functionality, allowing developers to create, manage, and track store requisitions and related entities. This document provides an overview of the API, including conventions, authentication, and common patterns.

### API Purpose

The Store Requisition API enables:
- Creation and management of store requisitions
- Processing of approval workflows
- Tracking of stock movements
- Generation and retrieval of journal entries
- Reporting and analytics on requisition data

### Target Audience

This documentation is intended for:
- Backend developers implementing or extending the SR module
- Frontend developers consuming the SR API
- System integrators connecting external systems to the SR module
- QA engineers testing the SR module functionality

## API Conventions

### Base URL

All API endpoints are relative to the base URL:

```
https://{environment}.carmenfb.com/api/v1
```

Where `{environment}` is one of:
- `dev` - Development environment
- `staging` - Staging environment
- `prod` - Production environment

### HTTP Methods

The API uses standard HTTP methods:

| Method | Description |
|--------|-------------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Update resources (full update) |
| PATCH | Update resources (partial update) |
| DELETE | Delete resources |

### Resource Paths

Resource paths follow a consistent pattern:

```
/store-requisitions                  # Collection of requisitions
/store-requisitions/{id}             # Specific requisition
/store-requisitions/{id}/items       # Items in a requisition
/store-requisitions/{id}/approvals   # Approvals for a requisition
/store-requisitions/{id}/movements   # Stock movements for a requisition
/store-requisitions/{id}/journals    # Journal entries for a requisition
```

### Request Format

All requests with a body should use JSON format with the `Content-Type: application/json` header.

Example:

```http
POST /api/v1/store-requisitions HTTP/1.1
Host: dev.carmenfb.com
Content-Type: application/json
Authorization: Bearer {token}

{
  "date": "2024-03-14T00:00:00Z",
  "description": "Weekly stock replenishment",
  "movement": {
    "source": "WH001",
    "destination": "ST001",
    "type": "Issue"
  },
  "items": [
    {
      "productId": "PROD001",
      "qtyRequired": 25.0,
      "unit": "KG"
    }
  ]
}
```

### Response Format

All responses are in JSON format with appropriate HTTP status codes.

Success response example:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SR-24001",
    "date": "2024-03-14T00:00:00Z",
    "description": "Weekly stock replenishment",
    "status": "Draft",
    "movement": {
      "source": "WH001",
      "sourceName": "Main Warehouse",
      "destination": "ST001",
      "destinationName": "Store #1",
      "type": "Issue"
    },
    "items": [
      {
        "id": 1,
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "costPerUnit": 2.50,
        "total": 62.50
      }
    ],
    "totalAmount": 62.50,
    "createdAt": "2024-03-14T10:30:00Z",
    "createdBy": "user123"
  }
}
```

Error response example:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "qtyRequired",
        "message": "Quantity must be greater than zero"
      }
    ]
  }
}
```

### Pagination

List endpoints support pagination using the following query parameters:

- `page`: Page number (1-based)
- `limit`: Number of items per page
- `sort`: Field to sort by
- `order`: Sort order (`asc` or `desc`)

Example:

```
GET /api/v1/store-requisitions?page=2&limit=10&sort=date&order=desc
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5
  }
}
```

### Filtering

List endpoints support filtering using query parameters:

- Simple filters: `field=value`
- Range filters: `field_min=value&field_max=value`
- Date filters: `date_from=value&date_to=value`
- Status filters: `status=value1,value2`

Example:

```
GET /api/v1/store-requisitions?status=Draft,Approved&date_from=2024-01-01&date_to=2024-03-31
```

### Field Selection

To reduce response size, clients can specify which fields to include:

```
GET /api/v1/store-requisitions?fields=id,date,status,totalAmount
```

## Authentication and Authorization

### Authentication

The API uses JWT (JSON Web Token) based authentication. Clients must include a valid JWT token in the `Authorization` header:

```
Authorization: Bearer {token}
```

Tokens can be obtained through the authentication endpoint:

```
POST /api/v1/auth/login
```

With the following payload:

```json
{
  "username": "user@example.com",
  "password": "password"
}
```

Successful authentication returns a token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### Authorization

The API uses role-based access control (RBAC) to determine permissions. The following roles are relevant to the Store Requisition API:

| Role | Description | Permissions |
|------|-------------|-------------|
| SR_ADMIN | Store Requisition Administrator | Full access to all SR endpoints |
| SR_CREATOR | Store Requisition Creator | Create and view requisitions |
| SR_APPROVER | Store Requisition Approver | Approve/reject requisitions |
| SR_PROCESSOR | Store Requisition Processor | Process approved requisitions |
| SR_VIEWER | Store Requisition Viewer | View-only access to requisitions |

## Common Request/Response Patterns

### Creating a Resource

```http
POST /api/v1/store-requisitions HTTP/1.1
Content-Type: application/json
Authorization: Bearer {token}

{
  "date": "2024-03-14T00:00:00Z",
  "description": "Weekly stock replenishment",
  "movement": {
    "source": "WH001",
    "destination": "ST001",
    "type": "Issue"
  },
  "items": [
    {
      "productId": "PROD001",
      "qtyRequired": 25.0,
      "unit": "KG"
    }
  ]
}
```

Response:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/store-requisitions/SR-24001

{
  "data": {
    "id": "SR-24001",
    "date": "2024-03-14T00:00:00Z",
    "description": "Weekly stock replenishment",
    "status": "Draft",
    "movement": {
      "source": "WH001",
      "sourceName": "Main Warehouse",
      "destination": "ST001",
      "destinationName": "Store #1",
      "type": "Issue"
    },
    "items": [
      {
        "id": 1,
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "costPerUnit": 2.50,
        "total": 62.50
      }
    ],
    "totalAmount": 62.50,
    "createdAt": "2024-03-14T10:30:00Z",
    "createdBy": "user123"
  }
}
```

### Retrieving a Resource

```http
GET /api/v1/store-requisitions/SR-24001 HTTP/1.1
Authorization: Bearer {token}
```

Response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SR-24001",
    "date": "2024-03-14T00:00:00Z",
    "description": "Weekly stock replenishment",
    "status": "Draft",
    "movement": {
      "source": "WH001",
      "sourceName": "Main Warehouse",
      "destination": "ST001",
      "destinationName": "Store #1",
      "type": "Issue"
    },
    "items": [
      {
        "id": 1,
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "costPerUnit": 2.50,
        "total": 62.50
      }
    ],
    "totalAmount": 62.50,
    "createdAt": "2024-03-14T10:30:00Z",
    "createdBy": "user123",
    "updatedAt": null,
    "updatedBy": null
  }
}
```

### Updating a Resource

```http
PATCH /api/v1/store-requisitions/SR-24001 HTTP/1.1
Content-Type: application/json
Authorization: Bearer {token}

{
  "description": "Updated weekly stock replenishment",
  "items": [
    {
      "id": 1,
      "qtyRequired": 30.0
    }
  ]
}
```

Response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SR-24001",
    "date": "2024-03-14T00:00:00Z",
    "description": "Updated weekly stock replenishment",
    "status": "Draft",
    "movement": {
      "source": "WH001",
      "sourceName": "Main Warehouse",
      "destination": "ST001",
      "destinationName": "Store #1",
      "type": "Issue"
    },
    "items": [
      {
        "id": 1,
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 30.0,
        "costPerUnit": 2.50,
        "total": 75.00
      }
    ],
    "totalAmount": 75.00,
    "createdAt": "2024-03-14T10:30:00Z",
    "createdBy": "user123",
    "updatedAt": "2024-03-14T11:15:00Z",
    "updatedBy": "user123"
  }
}
```

### Deleting a Resource

```http
DELETE /api/v1/store-requisitions/SR-24001 HTTP/1.1
Authorization: Bearer {token}
```

Response:

```http
HTTP/1.1 204 No Content
```

### Performing Actions on a Resource

```http
POST /api/v1/store-requisitions/SR-24001/submit HTTP/1.1
Content-Type: application/json
Authorization: Bearer {token}

{
  "comments": "Ready for approval"
}
```

Response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SR-24001",
    "status": "Pending Approval",
    "updatedAt": "2024-03-14T11:30:00Z",
    "updatedBy": "user123"
  }
}
```

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |
| 429 | RATE_LIMIT_EXCEEDED | Rate limit exceeded |
| 500 | INTERNAL_SERVER_ERROR | Server error |

### Validation Errors

Validation errors include details about each validation failure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "date",
        "message": "Date is required"
      },
      {
        "field": "items[0].qtyRequired",
        "message": "Quantity must be greater than zero"
      }
    ]
  }
}
```

### Business Rule Violations

Business rule violations indicate that the request is syntactically valid but violates a business rule:

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Business rule violation",
    "details": [
      {
        "rule": "STOCK_AVAILABILITY",
        "message": "Requested quantity exceeds available stock",
        "context": {
          "productId": "PROD001",
          "requested": 30.0,
          "available": 25.0
        }
      }
    ]
  }
}
```

## API Versioning

The API uses URL versioning to ensure backward compatibility:

```
/api/v1/store-requisitions
```

When breaking changes are introduced, a new version is created:

```
/api/v2/store-requisitions
```

The current API version is `v1`.

## Rate Limiting

To ensure fair usage and system stability, the API implements rate limiting:

- 100 requests per minute per user
- 1000 requests per hour per user

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1615472400
```

When the rate limit is exceeded, a 429 Too Many Requests response is returned:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

## API Endpoints Overview

The Store Requisition API is organized into the following endpoint groups:

### Requisition Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| /store-requisitions | GET | List requisitions |
| /store-requisitions | POST | Create a requisition |
| /store-requisitions/{id} | GET | Get a requisition |
| /store-requisitions/{id} | PATCH | Update a requisition |
| /store-requisitions/{id} | DELETE | Delete a requisition |
| /store-requisitions/{id}/submit | POST | Submit a requisition |
| /store-requisitions/{id}/void | POST | Void a requisition |

For detailed documentation, see [SR-API-Requisition-Endpoints.md](./SR-API-Requisition-Endpoints.md).

### Approval Process

| Endpoint | Method | Description |
|----------|--------|-------------|
| /store-requisitions/{id}/approvals | GET | List approvals |
| /store-requisitions/{id}/approve | POST | Approve a requisition |
| /store-requisitions/{id}/reject | POST | Reject a requisition |
| /approvals/pending | GET | List pending approvals |

For detailed documentation, see [SR-API-Approval-Endpoints.md](./SR-API-Approval-Endpoints.md).

### Stock Movement

| Endpoint | Method | Description |
|----------|--------|-------------|
| /store-requisitions/{id}/movements | GET | List movements |
| /store-requisitions/{id}/process | POST | Process a requisition |
| /stock-movements | GET | List all stock movements |
| /stock-movements/{id} | GET | Get a stock movement |

For detailed documentation, see [SR-API-StockMovement-Endpoints.md](./SR-API-StockMovement-Endpoints.md).

### Journal Entries

| Endpoint | Method | Description |
|----------|--------|-------------|
| /store-requisitions/{id}/journals | GET | List journal entries |
| /journals | GET | List all journal entries |
| /journals/{id} | GET | Get a journal entry |

For detailed documentation, see [SR-API-JournalEntry-Endpoints.md](./SR-API-JournalEntry-Endpoints.md).

## Related Documentation

- [Store Requisition Overview](./SR-Overview.md)
- [Store Requisition Technical Specification](./SR-Technical-Specification.md)
- [Store Requisition User Experience](./SR-User-Experience.md)
- [Store Requisition Component Specifications](./SR-Component-Specifications.md)
- [SR-API-Requisition-Endpoints](./SR-API-Requisition-Endpoints.md)
- [SR-API-Approval-Endpoints](./SR-API-Approval-Endpoints.md)
- [SR-API-StockMovement-Endpoints](./SR-API-StockMovement-Endpoints.md)
- [SR-API-JournalEntry-Endpoints](./SR-API-JournalEntry-Endpoints.md) 